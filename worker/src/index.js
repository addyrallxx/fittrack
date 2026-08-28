/* FitTrack reminder server. Cloudflare Worker, free tier.
 *
 * Why this exists: the app used to arm setTimeout callbacks in the page, which
 * die the moment the PWA is backgrounded. A reminder has to be sent by
 * something that is awake when the user is not looking at their phone.
 *
 * No dependencies, deliberately. Everything below is raw Web Crypto, which
 * Workers implement natively. The aes128gcm encryption is verified byte for
 * byte against the RFC 8291 Section 5 test vector.
 *
 * FREE TIER SHAPE (the constraint that drives the design):
 *   10 ms CPU per invocation, 50 subrequests, 5 cron triggers per ACCOUNT,
 *   100k requests/day; KV 1000 writes/day, 100k reads/day.
 * One cron every 30 minutes is 48 invocations a day. Each does one KV list
 * plus a few gets, and only signs and encrypts when something is actually
 * due. That is comfortable for a handful of users.
 * ponytail: O(users) per tick, fine to roughly 50 users. Past that, shard the
 * user list across ticks or move to the paid plan for the 30s CPU budget.
 */

/* ── SCHEDULE ──────────────────────────────────────────────────────────────
 * Times are local to each user, resolved through their own IANA timezone.
 * Every entry lands on :00 or :30 so a 30-minute cron never misses one.
 *
 * WATER: five checkpoints, not a nag every hour. Each one carries the amount
 * he should be at by then, and is SKIPPED ENTIRELY if he is already there.
 * The last is 21:00 rather than later, because water at midnight costs sleep.
 * Cumulative targets are a share of the daily goal, so they scale if the goal
 * changes rather than being hardcoded millilitres.
 *
 * GYM: he does not train on fixed weekdays, he picks any three days. So the
 * nudge cannot be "it is Wednesday, go to the gym". It is arithmetic instead:
 * sessions left against days left. While there is slack it says nothing at
 * all, and it only speaks once skipping today would actually cost him the
 * week. Being nagged on a Monday about a target that is still easily reachable
 * is how an app gets muted, and a muted app sends nothing.
 */
const WATER_CHECKS = [
  { at: '09:30', frac: 0.17 },
  { at: '12:30', frac: 0.40 },
  { at: '15:30', frac: 0.63 },
  { at: '18:30', frac: 0.86 },
  { at: '21:00', frac: 1.00 },
];

const ANY_DAY = [0, 1, 2, 3, 4, 5, 6];

const SCHEDULE = [
  { id: 'weight',   at: '08:00', days: [1],     pref: 'weight' },
  { id: 'gym-am',   at: '11:00', days: 'any',   pref: 'gym' },   // gymGap decides whether to speak
  { id: 'gym-pm',   at: '19:30', days: 'any',   pref: 'gym' },
  { id: 'dose-eve', at: '22:00', days: [0],     pref: 'dose' },  // Sunday; dose is ~2am Monday
  { id: 'dose-am',  at: '10:00', days: [1],     pref: 'dose' },
];

/* Three sessions a week, on whichever days he likes. */
const GYM_TARGET = 3;

/* Known titration only. Doses are never extrapolated: guessing the next step
 * up for a drug is not something a reminder app gets to do. Past the last
 * known date the reminder says so and asks him to confirm.
 *
 * The pattern is two weeks per step, and he has confirmed the step to 2 mg on
 * 2026-09-21. It STOPS at 2026-09-28 on purpose. "Slowly titrating every two
 * weeks" describes an intent, not a prescription, and the dose after that is
 * his call to make and state. Extend this table only from something he has
 * actually said, never by continuing the pattern. */
const TITRATION = [
  { date: '2026-08-24', mg: 1 },
  { date: '2026-08-31', mg: 1 },
  { date: '2026-09-07', mg: 1.5 },
  { date: '2026-09-14', mg: 1.5 },
  { date: '2026-09-21', mg: 2 },
  { date: '2026-09-28', mg: 2 },
];

const DEFAULT_TZ = 'America/Edmonton';   // Calgary, DST-aware

/* ── SMALL HELPERS ─────────────────────────────────────────────────────── */
const enc = new TextEncoder();
const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
const cat = (...a) => { const t = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let o = 0; for (const x of a) { t.set(x, o); o += x.length; } return t; };

/* Local wall-clock parts for a timezone. Intl handles DST, which hand-rolled
 * UTC offset arithmetic gets wrong twice a year. */
function localParts(tz, now) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short',
  });
  const p = {};
  for (const { type, value } of f.formatToParts(now)) p[type] = value;
  const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    // Some ICU versions emit "24" for midnight; normalise it.
    hm: `${p.hour === '24' ? '00' : p.hour}:${p.minute}`,
    dow: DOW[p.weekday],
  };
}

/* True if a scheduled time falls inside the tick that just fired. The cron is
 * every 30 minutes but never fires at exactly :00:00, so an equality test on
 * hh:mm would miss. Matching the 30-minute bucket is what makes it reliable. */
function inBucket(target, hm) {
  const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  return Math.floor(mins(target) / 30) === Math.floor(mins(hm) / 30);
}

/* ── VAPID ─────────────────────────────────────────────────────────────── */
async function vapidToken(audience, env) {
  const key = await crypto.subtle.importKey(
    'pkcs8', unb64u(env.VAPID_PRIVATE_KEY),
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const header = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  // RFC 8292 caps exp at 24h. 12h leaves room and stays well inside the limit.
  const payload = b64u(enc.encode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: env.VAPID_SUBJECT || 'mailto:fittrack@example.com',
  })));
  const unsigned = `${header}.${payload}`;
  // WebCrypto ECDSA returns raw IEEE P1363 (r||s), which is already the JWS
  // ES256 wire format. No DER unwrapping, unlike Node's crypto module.
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(unsigned));
  return `${unsigned}.${b64u(sig)}`;
}

/* ── PAYLOAD ENCRYPTION (RFC 8291, aes128gcm) ───────────────────────────
 * Verified against the RFC's own Section 5 test vector: given the spec's fixed
 * keys and salt this produces the spec's exact 144-byte body.
 * (The RFC's HTTP example prints Content-Length 145; its own printed body
 * decodes to 144, and 86 header + 41 plaintext + 1 delimiter + 16 tag = 144.) */
async function encryptPayload(plaintext, uaPublicB64u, authSecretB64u) {
  const uaPublic = unb64u(uaPublicB64u);
  const authSecret = unb64u(authSecretB64u);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Fresh ephemeral keypair per message, as the spec requires.
  const as = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', as.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, as.privateKey, 256);

  // WebCrypto's HKDF is extract-then-expand in one call, which is exactly what
  // the spec's two separate steps amount to.
  const sharedKey = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveBits']);
  const keyInfo = cat(enc.encode('WebPush: info'), new Uint8Array([0]), uaPublic, asPublic);
  const ikm = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: keyInfo }, sharedKey, 256);

  const ikmKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const cekBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: cat(enc.encode('Content-Encoding: aes128gcm'), new Uint8Array([0])) }, ikmKey, 128);
  const nonce = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: cat(enc.encode('Content-Encoding: nonce'), new Uint8Array([0])) }, ikmKey, 96);

  const cek = await crypto.subtle.importKey('raw', cekBits, { name: 'AES-GCM' }, false, ['encrypt']);
  // 0x02 is RFC 8188's last-record delimiter, and it goes inside the encryption.
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(nonce) }, cek, cat(enc.encode(plaintext), new Uint8Array([2])));

  // header: salt(16) | record size(4, big-endian) | keyid length(1) | keyid(65)
  const rs = new Uint8Array(4); new DataView(rs.buffer).setUint32(0, 4096);
  return cat(salt, rs, new Uint8Array([asPublic.length]), asPublic, new Uint8Array(ct));
}

/* Send one notification. Returns 'gone' when the subscription is dead so the
 * caller can delete it: 410 means unsubscribed, 404 means the endpoint itself
 * is invalid. Both mean stop trying, permanently. */
async function sendPush(sub, message, env) {
  const url = new URL(sub.endpoint);
  const [jwt, body] = await Promise.all([
    vapidToken(url.origin, env),
    encryptPayload(JSON.stringify(message), sub.keys.p256dh, sub.keys.auth),
  ]);
  let res;
  try {
    res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        // Short TTL on purpose. A water reminder delivered four hours late is
        // worse than one quietly dropped.
        'TTL': '1800',
        'Urgency': 'normal',
      },
      body,
    });
  } catch (e) {
    // An unreachable push host must never throw out of here. Uncaught, it
    // aborts the whole cron tick, so one dead subscription would silently
    // stop every other user's reminders for that tick.
    return `net ${e && e.message || 'unreachable'}`;
  }
  if (res.status === 410 || res.status === 404) return 'gone';
  return res.ok ? 'ok' : `err ${res.status}`;
}

/* ── MESSAGE COMPOSITION ───────────────────────────────────────────────── */
function nextMonday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

function doseFor(dateStr) {
  const hit = TITRATION.find(t => t.date === dateStr);
  if (hit) return { mg: hit.mg, known: true };
  const last = TITRATION[TITRATION.length - 1];
  return { mg: last.mg, known: dateStr <= last.date };
}

/* Sessions left against days left, for a week that runs Monday to Sunday.
 * Returns null when the nudge would be noise: already trained today, target
 * already met, or there is still comfortable room left in the week. */
function gymGap(st, cfg, local) {
  if (st.gymDone === local.date) return null;
  const target = cfg.gymTarget || GYM_TARGET;
  const left = target - (st.gymWeek || 0);
  if (left <= 0) return null;
  const daysLeft = 7 - ((local.dow + 6) % 7);   // including today
  if (daysLeft > left + 1) return null;         // a spare day in hand, so stay quiet
  return { left, daysLeft, tight: daysLeft <= left };
}

/* Returns the message for a reminder, or null to stay silent. Staying silent
 * when the thing is already done is what keeps these worth reading. */
function compose(rid, st, cfg, local) {
  const goal = cfg.waterGoal || 3500;
  switch (rid) {
    case 'weight':
      if (st.weightLogged === local.date) return null;
      return { title: 'Monday weigh-in', body: 'Same time, before food, before your dose. One number is all it takes.',
               tag: 'weight', sticky: true, actions: [{ action: 'weight', title: 'Log it' }] };
    case 'gym-am': {
      const g = gymGap(st, cfg, local);
      if (!g) return null;
      return { title: g.left === 1 ? 'One session left this week' : `${g.left} sessions left this week`,
               body: g.tight ? 'No spare days left. Pick a time today and it happens.'
                             : 'Pick a time now and it is far more likely to happen.',
               tag: 'gym', actions: [{ action: 'gym', title: 'Open plan' }] };
    }
    case 'gym-pm': {
      const g = gymGap(st, cfg, local);
      if (!g) return null;
      return { title: 'Still time today',
               body: g.tight ? 'Skipping today means missing the target this week.'
                             : `${g.left} left and ${g.daysLeft} days to fit them in. If you went already, log it.`,
               tag: 'gym', actions: [{ action: 'gym', title: 'Log session' }] };
    }
    case 'dose-eve': {
      const d = doseFor(nextMonday(local.date));
      return { title: 'Dose tonight', body: d.known ? `${d.mg} mg tonight. Have it ready before bed.`
                                                    : 'Dose tonight. Confirm your next step up before you draw it.',
               tag: 'dose', sticky: true };
    }
    case 'dose-am': {
      const d = doseFor(local.date);
      return { title: 'Dose taken?', body: d.known ? `This week is ${d.mg} mg.` : 'Confirm this week’s dose.', tag: 'dose' };
    }
    default: {
      if (!rid.startsWith('water:')) return null;
      const want = Math.round(goal * Number(rid.split(':')[1]) / 50) * 50;
      const have = st.water || 0;
      if (have >= want) return null;   // already ahead, so say nothing
      return { title: 'Water check',
               body: `${(have / 1000).toFixed(1)} L down, ${((want - have) / 1000).toFixed(1)} L behind where you want to be.`,
               tag: 'water',
               actions: [{ action: 'water:500', title: '+500 ml' }, { action: 'water:250', title: '+250 ml' }] };
    }
  }
}

/* ── CRON ──────────────────────────────────────────────────────────────── */
async function runTick(env, now) {
  const list = await env.KV.list({ prefix: 'sub:' });
  let sent = 0;

  for (const k of list.keys) {
   // Per-user isolation. A malformed record, a bad timezone string or a KV
   // hiccup must cost that one user their tick, never everybody else theirs.
   try {
    const id = k.name.slice(4);
    const rec = await env.KV.get(k.name, 'json');
    if (!rec || !rec.sub) continue;

    const local = localParts(rec.tz || DEFAULT_TZ, now);
    const prefs = rec.prefs || {};
    const cfg = rec.cfg || {};

    const due = [];
    for (const s of SCHEDULE) {
      if (prefs[s.pref] && prefs[s.pref].enabled === false) continue;
      const days = s.days === 'any' ? ANY_DAY : s.days;
      if (!days.includes(local.dow)) continue;
      if (inBucket(s.at, local.hm)) due.push(s.id);
    }
    if (!prefs.water || prefs.water.enabled !== false) {
      for (const w of WATER_CHECKS) if (inBucket(w.at, local.hm)) due.push(`water:${w.frac}`);
    }
    if (!due.length) continue;

    // One dedupe record per user per local day, so a retry or an overlapping
    // tick can never double-send. Keyed on the user's own calendar date.
    const dkey = `sent:${id}:${local.date}`;
    const already = (await env.KV.get(dkey, 'json')) || [];
    const fresh = due.filter(r => !already.includes(r));
    if (!fresh.length) continue;

    const st = (await env.KV.get(`state:${id}`, 'json')) || {};
    const fired = [];
    for (const rid of fresh) {
      const msg = compose(rid, st, cfg, local);
      if (!msg) { fired.push(rid); continue; } // already satisfied: mark done, stay quiet
      const r = await sendPush(rec.sub, { ...msg, url: './fittrack.html' }, env);
      if (r === 'gone') { await env.KV.delete(k.name); break; }
      fired.push(rid);
      if (r === 'ok') sent++;
    }
    if (fired.length) {
      // 48h expiry: long enough to survive a timezone's worth of slop, short
      // enough that these never accumulate against the KV storage limit.
      await env.KV.put(dkey, JSON.stringify([...already, ...fired]), { expirationTtl: 172800 });
    }
   } catch (e) {
    // Surfaced by `wrangler tail`. Silent failure here is the worst outcome:
    // reminders would just stop, with nothing anywhere saying why.
    console.error(`tick failed for ${k.name}:`, e && e.message);
   }
  }
  return sent;
}

/* Find the record holding a given push endpoint. A reverse index would avoid
 * the scan, but it would also mean a second KV write on every launch, and the
 * cron already walks this same list every 30 minutes.
 * ponytail: O(users) scan, fine to roughly 50 users; add an ep: index past that. */
async function findByEndpoint(env, endpoint) {
  if (!endpoint) return null;
  const list = await env.KV.list({ prefix: 'sub:' });
  for (const k of list.keys) {
    const rec = await env.KV.get(k.name, 'json');
    if (rec && rec.sub && rec.sub.endpoint === endpoint) return { key: k.name, rec };
  }
  return null;
}

/* One device must never hold two records. localStorage eviction gives the app
 * a fresh device id while the browser keeps the SAME push subscription, so the
 * old record stays valid and the cron then sends every reminder twice to one
 * phone. Deleting the stale twin at registration is what keeps that from
 * happening, and it is also the only pruning an abandoned id ever gets. */
async function dropDuplicateEndpoints(env, keepId, endpoint) {
  const list = await env.KV.list({ prefix: 'sub:' });
  for (const k of list.keys) {
    if (k.name === `sub:${keepId}`) continue;
    const rec = await env.KV.get(k.name, 'json');
    if (rec && rec.sub && rec.sub.endpoint === endpoint) {
      await env.KV.delete(k.name);
      await env.KV.delete(`state:${k.name.slice(4)}`);
    }
  }
}

/* ── HTTP ──────────────────────────────────────────────────────────────── */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });

/* Device ids are random and act as bearer tokens: knowing one lets you write
 * that device's state or fire it a test push. For a reminder app holding no
 * credentials that is a proportionate trade, and it keeps the app free of
 * accounts and logins. Do not extend this with anything worth stealing, and
 * never add an endpoint that lists ids. */
export default {
  async fetch(req, env) {
    const { pathname } = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (pathname === '/health') return json({ ok: true, vapid: !!env.VAPID_PUBLIC_KEY });

    if (req.method !== 'POST') return json({ error: 'not found' }, 404);
    let b;
    try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
    if (!b.id || typeof b.id !== 'string' || b.id.length > 64) return json({ error: 'bad id' }, 400);

    switch (pathname) {
      case '/subscribe': {
        if (!b.sub || !b.sub.endpoint || !b.sub.keys) return json({ error: 'bad subscription' }, 400);
        // 180 days, refreshed on every launch because the client re-posts its
        // subscription each time it starts. Long on purpose: a shorter window
        // would delete the reminders of exactly the lapsed user those
        // reminders exist to bring back. It only reaps genuine abandonment,
        // and stops dead records accumulating against the cron's scan.
        await env.KV.put(`sub:${b.id}`, JSON.stringify({
          sub: b.sub, tz: b.tz || DEFAULT_TZ, prefs: b.prefs || {}, cfg: b.cfg || {}, at: new Date().toISOString(),
        }), { expirationTtl: 15552000 });
        await dropDuplicateEndpoints(env, b.id, b.sub.endpoint);
        return json({ ok: true });
      }
      case '/resubscribe': {
        // Sent by the service worker when the browser rotates a subscription
        // while the app is closed. It has no device id to offer (a worker
        // cannot read localStorage), so the old endpoint is the only handle
        // on which record to update.
        if (!b.sub || !b.sub.endpoint || !b.sub.keys) return json({ error: 'bad subscription' }, 400);
        const hit = await findByEndpoint(env, b.old);
        if (!hit) return json({ error: 'unknown subscription' }, 404);
        hit.rec.sub = b.sub;
        await env.KV.put(hit.key, JSON.stringify(hit.rec), { expirationTtl: 15552000 });
        return json({ ok: true });
      }
      case '/unsubscribe':
        await env.KV.delete(`sub:${b.id}`);
        return json({ ok: true });
      case '/state': {
        // Only the fields the scheduler actually reads, so the server never
        // becomes a shadow copy of the user's whole log.
        await env.KV.put(`state:${b.id}`, JSON.stringify({
          water: Number(b.water) || 0,
          gymDone: b.gymDone || null,
          gymWeek: Number(b.gymWeek) || 0,
          weightLogged: b.weightLogged || null,
        }), { expirationTtl: 172800 });
        return json({ ok: true });
      }
      case '/test': {
        const rec = await env.KV.get(`sub:${b.id}`, 'json');
        if (!rec) return json({ error: 'not subscribed' }, 404);
        const r = await sendPush(rec.sub, {
          title: 'FitTrack test', body: 'Reminders are working. This one came from the server.',
          tag: 'ft-test', url: './fittrack.html',
        }, env);
        if (r === 'gone') await env.KV.delete(`sub:${b.id}`);
        return json({ result: r }, r === 'ok' ? 200 : 502);
      }
      default:
        return json({ error: 'not found' }, 404);
    }
  },

  async scheduled(_controller, env, ctx) {
    // waitUntil, or the Worker can be torn down before the sends finish.
    ctx.waitUntil(runTick(env, new Date()));
  },
};

/* Exported for the local test harness, which drives runTick with a fixed clock
 * and a fake KV to prove the schedule fires at the right local times. Workers
 * only ever loads the default export, so these cost nothing at runtime. */
export { runTick, localParts, inBucket, compose, gymGap, doseFor, nextMonday, findByEndpoint, dropDuplicateEndpoints, WATER_CHECKS, SCHEDULE, TITRATION };
