/* Tests for the push pipeline's contracts, client side and worker side.
 *
 * schedule.test.mjs already proves the worker decides WHEN to send correctly.
 * Nothing proved the plumbing that carries a notification from that decision
 * to a phone, which is where the silent failures live: a key encoded wrong
 * produces a subscription the server can never encrypt for, and two constants
 * drifting apart in two files produce a service worker that posts its
 * self-heal to nowhere. Neither failure raises an error anywhere. Both just
 * mean no notification ever arrives.
 *
 *   node test/push.test.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { compose, findByEndpoint, dropDuplicateEndpoints } from '../worker/src/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log('PASS  ' + name); pass++; }
  catch (e) { console.log('FAIL  ' + name + '\n      ' + e.message); fail++; }
}
async function acheck(name, fn) {
  try { await fn(); console.log('PASS  ' + name); pass++; }
  catch (e) { console.log('FAIL  ' + name + '\n      ' + e.message); fail++; }
}

const html = fs.readFileSync(path.join(root, 'fittrack.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const toml = fs.readFileSync(path.join(root, 'worker', 'wrangler.toml'), 'utf8');

/* Pulled out of the inline script and run for real. A hand-rolled base64url
   decoder is exactly the kind of thing that looks right and is off by one pad
   character, and the only symptom is that no notification ever arrives. */
function loadUrlB64() {
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  blocks.sort((a, b) => b.length - a.length);
  const fn = blocks[0].match(/function urlB64ToU8\([\s\S]*?\n\}/);
  assert.ok(fn, 'urlB64ToU8 not found in the inline script');
  const ctx = { atob: s => Buffer.from(s, 'base64').toString('binary'), Uint8Array };
  vm.createContext(ctx);
  vm.runInContext(fn[0] + '\n;globalThis.__f=urlB64ToU8;', ctx);
  return ctx.__f;
}
const urlB64ToU8 = loadUrlB64();

const appVapid = (html.match(/VAPID_PUBLIC\s*=\s*['"]([^'"]+)['"]/) || [])[1];
const tomlVapid = (toml.match(/VAPID_PUBLIC_KEY\s*=\s*"([^"]+)"/) || [])[1];
const appApi = (html.match(/PUSH_API\s*=\s*['"]([^'"]*)['"]/) || [])[1];
const swApi = (sw.match(/PUSH_API\s*=\s*['"]([^'"]*)['"]/) || [])[1];

function loadBuildOpts() {
  const fn = sw.match(/function buildOpts\(d\) \{[\s\S]*?\n\}/);
  assert.ok(fn, 'buildOpts not found in sw.js');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fn[0] + '\n;globalThis.__f=buildOpts;', ctx);
  return ctx.__f;
}
const buildOpts = loadBuildOpts();

check('the app and the worker agree on the VAPID public key', () => {
  assert.ok(appVapid, 'no VAPID_PUBLIC in fittrack.html');
  assert.equal(appVapid, tomlVapid,
    'a mismatch means every push is signed by a key the browser rejects');
});

check('the service worker and the app agree on the reminder server', () => {
  assert.ok(swApi, 'no PUSH_API in sw.js');
  assert.equal(swApi, appApi,
    'a drifted URL sends the self-heal to the wrong host and reminders stop for good');
});

check('notification presentation uses the Android badge and tags every renotify', () => {
  const steps = [{ date: '2026-08-31', mg: 1 }];
  const payloads = [
    compose('weight', {}, {}, { date: '2026-08-31', dow: 1 }),
    compose('gym-am', {}, {}, { date: '2026-09-04', dow: 5 }),
    compose('gym-pm', {}, {}, { date: '2026-09-04', dow: 5 }),
    compose('dose-eve', {}, { dose: { steps } }, { date: '2026-08-30', dow: 0 }),
    compose('dose-am', {}, { dose: { steps } }, { date: '2026-08-31', dow: 1 }),
    compose('water:0.4', { water: 400 }, {}, { date: '2026-08-31', dow: 1 }),
    { title: 'FitTrack test', body: 'Test', tag: 'ft-test' },
  ].filter(Boolean);
  const stamped = buildOpts({ tag: 'timestamp-test', timestamp: 123 });
  assert.equal(stamped.badge, './badge-96.png');
  assert.equal(stamped.timestamp, 123, 'payload event time must survive presentation');
  const setup = html.match(/reg\.showNotification\('FitTrack is set up',[\s\S]*?\);/);
  assert.ok(setup, 'the setup notification must exist');
  assert.ok(!/\bicon\s*:/.test(setup[0]), 'the setup notification must not show a second icon');
  assert.match(setup[0], /badge:\s*'badge-96\.png'/, 'the setup notification must use the Android badge');
  for (const payload of payloads) {
    const opts = buildOpts(payload);
    assert.ok(!opts.renotify || opts.tag, `${payload.title} renotifies without a tag`);
  }
});

check('the VAPID public key decodes to an uncompressed P-256 point', () => {
  const u8 = urlB64ToU8(appVapid);
  assert.equal(u8.length, 65, 'expected 65 bytes, got ' + u8.length);
  assert.equal(u8[0], 4, 'an uncompressed EC point must start with 0x04');
});

check('urlB64ToU8 handles every padding length', () => {
  // 1, 2 and 3 byte inputs exercise the two-, one- and zero-pad branches.
  for (const bytes of [[0xff], [0xff, 0x01], [0xff, 0x01, 0x7a]]) {
    const b64u = Buffer.from(bytes).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    assert.deepEqual([...urlB64ToU8(b64u)], bytes, 'round trip failed at ' + bytes.length + ' bytes');
  }
});

check('urlB64ToU8 decodes the URL-safe alphabet, not just the standard one', () => {
  // 0xfb 0xff is "-_8" in base64url and "+/8" in plain base64. A decoder that
  // forgets to translate returns different bytes without raising anything.
  assert.deepEqual([...urlB64ToU8('-_8')], [0xfb, 0xff]);
});

check('the device id is drawn from a CSPRNG, not Math.random', () => {
  // The comment inside deviceId explains why Math.random is wrong, and would
  // trip this check, so everything up to the end of it is dropped first.
  const body = html.match(/function deviceId\(\)[\s\S]*?\n\}/)[0].split('*/').pop();
  assert.ok(!/Math\.random/.test(body),
    'the id is a bearer token for that device state, so it must not be guessable');
  assert.ok(/crypto\.randomUUID|getRandomValues/.test(body), 'expected a crypto source');
});

check('the client sends no dose without a client-side schedule', () => {
  const fn = html.match(/async function sendSub\(sub\)[\s\S]*?\n\}/)[0];
  assert.match(fn, /dose:null/,
    'the subscription must stay silent until the client has a per-user schedule');
});

function fakeKV(seed) {
  const m = new Map(Object.entries(seed || {}).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    map: m,
    async get(k, type) { const v = m.get(k); return v == null ? null : (type === 'json' ? JSON.parse(v) : v); },
    async put(k, v) { m.set(k, v); },
    async delete(k) { m.delete(k); },
    async list(o) { return { keys: [...m.keys()].filter(k => k.startsWith(o.prefix)).map(name => ({ name })) }; },
  };
}
const EP = 'https://fcm.googleapis.com/fcm/send/abc123';

await acheck('a re-registered device does not end up subscribed twice', async () => {
  // localStorage eviction hands the app a brand new device id while the browser
  // keeps the same push subscription. Both records stay live, so the cron sends
  // every reminder to this one phone twice.
  const KV = fakeKV({
    'sub:old': { sub: { endpoint: EP, keys: {} }, tz: 'America/Edmonton' },
    'state:old': { water: 500 },
    'sub:new': { sub: { endpoint: EP, keys: {} }, tz: 'America/Edmonton' },
    'sub:friend': { sub: { endpoint: EP + '-other', keys: {} }, tz: 'America/Toronto' },
  });
  await dropDuplicateEndpoints({ KV }, 'new', EP);
  assert.ok(!KV.map.has('sub:old'), 'the stale twin should be gone');
  assert.ok(!KV.map.has('state:old'), 'its orphaned state should go with it');
  assert.ok(KV.map.has('sub:new'), 'the current registration must survive');
  assert.ok(KV.map.has('sub:friend'), 'someone else on another endpoint must be untouched');
});

await acheck('a rotated subscription is found by its old endpoint', async () => {
  // The service worker has no device id to offer, because it cannot read
  // localStorage. The old endpoint is the only handle it has.
  const KV = fakeKV({
    'sub:a': { sub: { endpoint: EP + '-a', keys: {} } },
    'sub:b': { sub: { endpoint: EP, keys: {} } },
  });
  const hit = await findByEndpoint({ KV }, EP);
  assert.ok(hit, 'the record should be found');
  assert.equal(hit.key, 'sub:b');
});

await acheck('an unknown endpoint resolves to nothing rather than a wrong record', async () => {
  const KV = fakeKV({ 'sub:a': { sub: { endpoint: EP, keys: {} } } });
  assert.equal(await findByEndpoint({ KV }, 'https://example.com/nope'), null);
  assert.equal(await findByEndpoint({ KV }, undefined), null);
});

check('a push can never resolve without showing a notification', () => {
  // iOS revokes permission from a site whose pushes show nothing, and on
  // Android a throw inside the handler is simply silence.
  const push = sw.match(/addEventListener\('push'[\s\S]*?\n\}\);/)[0];
  assert.ok(/\.catch\(/.test(push), 'the push handler needs a catch that still shows a notification');
  assert.ok((push.match(/showNotification/g) || []).length >= 2,
    'expected a fallback showNotification in the catch');
});

check('only a navigation may fall back to the html shell', () => {
  // Answering a JSON GET with the app shell hands the caller a 200 that r.ok
  // accepts, and the food database silently reads as empty.
  assert.ok(sw.includes('req.mode ===') && sw.includes('navigate'),
    'the offline fallback must not serve fittrack.html for data requests');
});

check('the service worker heals a rotated subscription without an open window', () => {
  const h = sw.match(/addEventListener\('pushsubscriptionchange'[\s\S]*?\n\}\);/)[0];
  assert.ok(/fetch\(PUSH_API/.test(h),
    'postMessage alone reaches nobody: this event fires while the app is closed');
  assert.ok(/resubscribe/.test(h), 'expected it to post to /resubscribe');
});

check('a lapsed install re-subscribes itself instead of claiming it is on', () => {
  // The iOS failure: the OS drops the push subscription while permission stays
  // granted, so the toggle keeps saying on and nothing ever arrives again.
  const fn = html.match(/async function syncPush\(\)[\s\S]*?\n\}/)[0];
  assert.ok(/pushManager\.subscribe/.test(fn),
    'syncPush must re-subscribe when permission is granted but the subscription is gone');
});

check('a zero gym target survives onboarding, reload and subscription', () => {
  const finish = html.match(/function obFinish\(\)[\s\S]*?\n\}/)[0];
  const onboard = html.match(/function renderOnboard\(\)[\s\S]*?\n\}/)[0];
  const send = html.match(/async function sendSub\(sub\)[\s\S]*?\n\}/)[0];
  const init = html.match(/function init\(\)[\s\S]*?\n\}/)[0];
  assert.match(onboard, /\[0,1,2,3,4,5\]/, 'onboarding must offer numeric zero');
  assert.match(finish, /cfg\.gymTarget=d\.sessions/, 'onboarding must save the selected number unchanged');
  assert.match(send, /gymTarget:S\.cfg\.gymTarget\?\?3/, 'subscription must preserve zero');
  assert.match(init, /if\(S\.cfg\.gymTarget==null\)/, 'reload must default only a missing target');
});


/* The live endpoint rejected every self-heal with "bad id" because the id
   guard ran before the switch, and /resubscribe is the one caller that has no
   id to give. Unit tests on the helpers all passed while the route was dead,
   so this asserts the ORDER, which is the thing that was actually wrong. */
check('/resubscribe is answered before the device id guard', () => {
  const src = fs.readFileSync(path.join(root, 'worker', 'src', 'index.js'), 'utf8');
  const resub = src.indexOf("pathname === '/resubscribe'");
  const guard = src.indexOf("error: 'bad id'");
  assert.ok(resub > -1, '/resubscribe must be handled outside the switch');
  assert.ok(guard > -1, 'the id guard should still exist for every other route');
  assert.ok(resub < guard,
    'a service worker cannot read localStorage, so it has no id and the guard would reject it');
});

/* The version string now lives in four files. Nothing stopped them drifting,
   and a stale version in sw.js means the activate handler never evicts the old
   cache, so a release ships behind a fallback the phone will not let go of.
   Same class of bug as the PUSH_API drift above: silent everywhere except on a
   real device. */
check('the app version matches in all four files', () => {
  const read = f => fs.readFileSync(path.join(root, f), 'utf8');
  const pick = (src, what) => {
    const m = src.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
    assert.ok(m, 'no APP_VERSION in ' + what);
    return m[1];
  };
  const versions = {
    VERSION: read('VERSION').trim(),
    'fittrack.html': pick(read('fittrack.html'), 'fittrack.html'),
    'sw.js': pick(read('sw.js'), 'sw.js'),
    'manifest.json': JSON.parse(read('manifest.json')).version,
  };
  assert.ok(/^\d+\.\d+\.\d+$/.test(versions.VERSION),
    'VERSION is not semver: ' + versions.VERSION);
  assert.equal(new Set(Object.values(versions)).size, 1,
    'version drift: ' + JSON.stringify(versions));
});

console.log('\nVERDICT: ' + (fail ? 'FAIL' : 'PASS') + ' (' + pass + '/' + (pass + fail) + ')');
process.exit(fail ? 1 : 0);
