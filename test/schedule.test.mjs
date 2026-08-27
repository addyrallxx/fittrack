/* Reminder schedule tests. Run: node test/schedule.test.mjs  (or npm test in worker/)
 *
 * Drives the real runTick against a fake KV and a fake fetch, with a fixed
 * clock, so the whole path is exercised: local-time resolution, day matching,
 * dedupe, skip-when-already-done, and real VAPID signing plus real RFC 8291
 * encryption. The subscription keys are RFC 8291's own published test vector,
 * so no real subscription is involved.
 *
 * The point of this file: a reminder that fires at the wrong local hour, or
 * twice, or not at all, is invisible until someone's phone stays silent for a
 * week. That is far too slow a feedback loop to rely on. */
import assert from 'node:assert';
import { runTick, localParts, inBucket, compose, gymGap, doseFor, nextMonday } from '../worker/src/index.js';

const TZ = 'America/Edmonton'; // Calgary
const ID = 'u_test';
// RFC 8291 Section 5 receiver key material. Public spec values.
const SUB = {
  endpoint: 'https://push.example.net/push/TEST',
  keys: { p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', auth: 'BTBZMqHH6r4Tts7J_aSIgg' },
};
/* A throwaway VAPID pair, generated fresh every run. The real private key must
   never appear here: this repo is public, and that key is what authorises a
   push to a real device. Signing works identically with any valid P-256 pair,
   so the test loses nothing by minting its own. */
const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const b64url = b => Buffer.from(b).toString('base64url');
const ENV_KEYS = {
  VAPID_PUBLIC_KEY: b64url(await crypto.subtle.exportKey('raw', kp.publicKey)),
  VAPID_PRIVATE_KEY: b64url(await crypto.subtle.exportKey('pkcs8', kp.privateKey)),
  VAPID_SUBJECT: 'mailto:test@example.com',
};

function fakeKV(seed = {}) {
  const m = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    _m: m,
    async get(k, t) { const v = m.get(k); return v == null ? null : (t === 'json' ? JSON.parse(v) : v); },
    async put(k, v) { m.set(k, v); },
    async delete(k) { m.delete(k); },
    async list({ prefix }) { return { keys: [...m.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })) }; },
  };
}

/* Captures pushes instead of sending them. status lets a test force a 410. */
function installFakeFetch(sink, status = 201) {
  globalThis.fetch = async (url, opts) => {
    sink.push({ url: String(url), auth: opts.headers.Authorization, encoding: opts.headers['Content-Encoding'], bytes: opts.body.length });
    return { ok: status >= 200 && status < 300, status };
  };
}

/* Every 30-minute tick across one local day, as real UTC instants. */
function ticksForLocalDay(dateStr, tz) {
  const out = [];
  // Walk a wide UTC window and keep the instants landing on this local date.
  const start = new Date(dateStr + 'T00:00:00Z').getTime() - 14 * 3600e3;
  for (let i = 0; i < 96; i++) {
    const d = new Date(start + i * 30 * 60e3);
    const l = localParts(tz, d);
    if (l.date === dateStr) out.push({ at: d, local: l });
  }
  return out;
}

async function firedOn(dateStr, { state = {}, cfg = {}, prefs = {} } = {}) {
  const kv = fakeKV({ [`sub:${ID}`]: { sub: SUB, tz: TZ, prefs, cfg }, [`state:${ID}`]: state });
  const sink = [];
  installFakeFetch(sink);
  const log = [];
  for (const t of ticksForLocalDay(dateStr, TZ)) {
    const before = sink.length;
    await runTick({ KV: kv, ...ENV_KEYS }, t.at);
    if (sink.length > before) log.push(t.local.hm);
  }
  return { times: log, sends: sink, kv };
}

const results = [];
const check = (name, fn) => results.push([name, fn]);
let failed = 0;

/* ── pure helpers ─────────────────────────────────────────────────────── */
check('inBucket matches the 30-minute window, not an exact minute', () => {
  assert.equal(inBucket('09:30', '09:30'), true);
  assert.equal(inBucket('09:30', '09:47'), true, 'a tick a few minutes late must still match');
  assert.equal(inBucket('09:30', '09:29'), false);
  assert.equal(inBucket('09:30', '10:00'), false);
  assert.equal(inBucket('08:00', '08:00'), true);
});

check('localParts resolves Calgary wall clock and weekday', () => {
  // 2026-08-31 15:30Z is 09:30 MDT (UTC-6), a Monday.
  const l = localParts(TZ, new Date('2026-08-31T15:30:00Z'));
  assert.deepEqual({ date: l.date, hm: l.hm, dow: l.dow }, { date: '2026-08-31', hm: '09:30', dow: 1 });
});

check('localParts survives the DST boundary', () => {
  // Calgary leaves MDT on 2026-11-01. 14:00Z is 08:00 MDT before, 07:00 MST after.
  assert.equal(localParts(TZ, new Date('2026-10-25T14:00:00Z')).hm, '08:00');
  assert.equal(localParts(TZ, new Date('2026-11-08T14:00:00Z')).hm, '07:00');
});

check('doseFor never invents a dose past the known titration', () => {
  assert.deepEqual(doseFor('2026-08-31'), { mg: 1, known: true });
  assert.deepEqual(doseFor('2026-09-07'), { mg: 1.5, known: true });
  assert.deepEqual(doseFor('2026-09-21'), { mg: 2, known: true }, 'the confirmed step to 2 mg');
  assert.deepEqual(doseFor('2026-09-28'), { mg: 2, known: true });
  assert.equal(doseFor('2026-10-05').known, false, 'the week after the table ends must NOT be extrapolated to 2.5 mg');
  assert.equal(doseFor('2026-10-12').known, false, 'beyond the schedule must be flagged unknown');
});

check('nextMonday always moves forward, never returns today', () => {
  assert.equal(nextMonday('2026-08-30'), '2026-08-31'); // Sunday -> tomorrow
  assert.equal(nextMonday('2026-08-31'), '2026-09-07'); // Monday -> next week, not itself
  assert.equal(nextMonday('2026-09-02'), '2026-09-07'); // Wednesday
});

/* ── composition ──────────────────────────────────────────────────────── */
check('water reminder stays silent once the checkpoint is met', () => {
  const local = { date: '2026-08-31' };
  assert.equal(compose('water:0.4', { water: 1400 }, {}, local), null, 'exactly at target must be silent');
  assert.equal(compose('water:0.4', { water: 2000 }, {}, local), null, 'ahead of target must be silent');
  assert.ok(compose('water:0.4', { water: 500 }, {}, local), 'behind target must speak');
});

check('water reminder reports the real shortfall', () => {
  const m = compose('water:0.4', { water: 400 }, { waterGoal: 3500 }, { date: '2026-08-31' });
  assert.match(m.body, /0\.4 L down/);
  assert.match(m.body, /1\.0 L behind/); // target 1400, have 400
});

check('gym and weight reminders stay silent once done', () => {
  const sat = { date: '2026-09-05', dow: 6 };   // Saturday, one day left, so the gym nudge is live
  assert.equal(compose('gym-pm', { gymDone: '2026-09-05' }, {}, sat), null);
  assert.ok(compose('gym-pm', { gymDone: '2026-09-04' }, {}, sat), 'yesterday does not count as done');
  assert.equal(compose('weight', { weightLogged: '2026-08-31' }, {}, { date: '2026-08-31', dow: 1 }), null);
});

/* The whole point of a flexible three-day week: it must not nag while the
 * target is still comfortably reachable, and it must not shut up when it is not. */
check('gymGap stays quiet while the week still has slack', () => {
  // Monday, nothing done. 3 sessions, 7 days. Plenty of room, so silence.
  assert.equal(gymGap({ gymWeek: 0 }, {}, { date: '2026-08-31', dow: 1 }), null);
  assert.equal(gymGap({ gymWeek: 0 }, {}, { date: '2026-09-02', dow: 3 }), null, 'Wednesday with 5 days left is still fine');
});

check('gymGap speaks once the week gets tight', () => {
  const thu = gymGap({ gymWeek: 0 }, {}, { date: '2026-09-03', dow: 4 }); // 4 days left, 3 needed
  assert.ok(thu, 'nothing done by Thursday must speak');
  assert.equal(thu.left, 3);
  assert.equal(thu.daysLeft, 4);
  assert.equal(thu.tight, false, 'one spare day is not tight yet');

  const fri = gymGap({ gymWeek: 0 }, {}, { date: '2026-09-04', dow: 5 }); // 3 days left, 3 needed
  assert.equal(fri.tight, true, 'three sessions in the last three days is tight');
});

check('gymGap goes silent the moment the target is met', () => {
  assert.equal(gymGap({ gymWeek: 3 }, {}, { date: '2026-09-05', dow: 6 }), null);
  assert.equal(gymGap({ gymWeek: 4 }, {}, { date: '2026-09-05', dow: 6 }), null, 'over target is still silent');
  assert.ok(gymGap({ gymWeek: 2 }, {}, { date: '2026-09-06', dow: 0 }), 'Sunday one short must speak');
});

check('gymGap honours a custom weekly target', () => {
  assert.equal(gymGap({ gymWeek: 2 }, { gymTarget: 2 }, { date: '2026-09-05', dow: 6 }), null);
  assert.ok(gymGap({ gymWeek: 2 }, { gymTarget: 5 }, { date: '2026-09-05', dow: 6 }));
});

check('every action payload fits the 2-button Safari cap', () => {
  for (const rid of ['weight', 'gym-am', 'gym-pm', 'dose-eve', 'dose-am', 'water:0.4']) {
    const m = compose(rid, {}, {}, { date: '2026-09-05', dow: 6 });
    if (m && m.actions) assert.ok(m.actions.length <= 2, `${rid} has ${m.actions.length} actions`);
  }
});

/* ── full day ─────────────────────────────────────────────────────────── */
check('an early week Monday stays off his back about the gym', async () => {
  // Weigh-in, dose and water. No gym: three sessions across seven days is not
  // yet urgent, and shouting on Monday morning is exactly how this gets muted.
  const { times } = await firedOn('2026-08-31');
  assert.deepEqual(times, ['08:00', '09:30', '10:00', '12:30', '15:30', '18:30', '21:00']);
});

check('a late week day with nothing logged does fire both gym nudges', async () => {
  const { times } = await firedOn('2026-09-04'); // Friday, 3 days left, 3 sessions owed
  assert.deepEqual(times, ['09:30', '11:00', '12:30', '15:30', '18:30', '19:30', '21:00']);
});

check('the gym nudge does not care which weekday he trains', async () => {
  // Sunday, two done, one owed. A fixed Mon/Wed/Fri schedule would have been
  // silent here, which is the bug this replaces.
  const { times } = await firedOn('2026-09-06', { state: { gymWeek: 2 } });
  assert.ok(times.includes('11:00') && times.includes('19:30'), 'a Sunday session still counts');
});

check('running the same day twice sends nothing the second time', async () => {
  const kv = fakeKV({ [`sub:${ID}`]: { sub: SUB, tz: TZ, prefs: {}, cfg: {} }, [`state:${ID}`]: {} });
  const sink = []; installFakeFetch(sink);
  const ticks = ticksForLocalDay('2026-08-31', TZ);
  for (const t of ticks) await runTick({ KV: kv, ...ENV_KEYS }, t.at);
  const first = sink.length;
  for (const t of ticks) await runTick({ KV: kv, ...ENV_KEYS }, t.at);
  assert.equal(sink.length, first, 'a replayed day must not double-send');
  assert.ok(first > 0);
});

check('a day already fully logged is almost entirely silent', async () => {
  const { times } = await firedOn('2026-08-31', {
    state: { water: 4000, gymDone: '2026-08-31', gymWeek: 1, weightLogged: '2026-08-31' },
  });
  // Only the dose reminder, which is not conditional on logged state.
  assert.deepEqual(times, ['10:00']);
});

check('disabled preferences suppress their reminders', async () => {
  const { times } = await firedOn('2026-08-31', {
    prefs: { water: { enabled: false }, gym: { enabled: false } },
  });
  assert.deepEqual(times, ['08:00', '10:00']); // weight and dose only
});

check('a week already completed is silent about the gym on every remaining day', async () => {
  for (const d of ['2026-09-04', '2026-09-05', '2026-09-06']) {
    const { times } = await firedOn(d, { state: { gymWeek: 3 } });
    assert.ok(!times.includes('11:00') && !times.includes('19:30'), d + ' nagged after the target was met');
  }
});

/* ── real crypto on the wire ──────────────────────────────────────────── */
check('sends are VAPID-signed and aes128gcm encrypted', async () => {
  const { sends } = await firedOn('2026-08-31');
  const s = sends[0];
  assert.equal(s.encoding, 'aes128gcm');
  assert.match(s.auth, /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=[\w-]+$/, 'must be a three-part ES256 JWT plus the public key');
  assert.ok(s.auth.endsWith(`k=${ENV_KEYS.VAPID_PUBLIC_KEY}`), 'must advertise the matching public key');
  // 86-byte header + ciphertext + 16-byte tag, so always well past the header.
  assert.ok(s.bytes > 86 + 16, `body too small: ${s.bytes}`);
  assert.ok(s.bytes < 4096, 'payload must stay under the push service ceiling');
});

check('one unreachable host does not cost every other user their reminders', async () => {
  // Found by pointing the local worker at a dead host: the fetch rejection
  // propagated uncaught and took the whole tick down. Inside waitUntil that
  // fails silently, so everyone downstream would just stop getting reminders.
  const kv = fakeKV({
    'sub:u_dead': { sub: { ...SUB, endpoint: 'https://dead.invalid/p' }, tz: TZ, prefs: {}, cfg: {} },
    'sub:u_ok': { sub: SUB, tz: TZ, prefs: {}, cfg: {} },
  });
  const sink = [];
  globalThis.fetch = async (url, opts) => {
    if (String(url).includes('dead.invalid')) throw new TypeError('fetch failed');
    sink.push({ url: String(url), auth: opts.headers.Authorization, encoding: opts.headers['Content-Encoding'], bytes: opts.body.length });
    return { ok: true, status: 201 };
  };
  for (const t of ticksForLocalDay('2026-08-31', TZ)) await runTick({ KV: kv, ...ENV_KEYS }, t.at);
  assert.equal(sink.length, 7, 'the healthy user must still get every reminder that day owed him');
  assert.ok(await kv.get('sub:u_dead'), 'a network blip must not delete a subscription; only 410/404 does that');
});

check('a 410 deletes the subscription instead of retrying forever', async () => {
  const kv = fakeKV({ [`sub:${ID}`]: { sub: SUB, tz: TZ, prefs: {}, cfg: {} }, [`state:${ID}`]: {} });
  const sink = []; installFakeFetch(sink, 410);
  for (const t of ticksForLocalDay('2026-08-31', TZ)) await runTick({ KV: kv, ...ENV_KEYS }, t.at);
  assert.equal(await kv.get(`sub:${ID}`), null, 'dead subscription must be removed');
  assert.equal(sink.length, 1, 'must stop after the first 410, not keep hammering');
});

/* ── run ──────────────────────────────────────────────────────────────── */
const realFetch = globalThis.fetch;
for (const [name, fn] of results) {
  try { await fn(); console.log(`PASS  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
globalThis.fetch = realFetch;
console.log(failed ? `\nVERDICT: FAIL (${failed}/${results.length})` : `\nVERDICT: PASS (${results.length}/${results.length})`);
process.exit(failed ? 1 : 0);
