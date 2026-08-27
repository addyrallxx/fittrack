# FitTrack reminder server

Sends the push notifications. Cloudflare Worker on the free plan, no dependencies,
no running cost.

The app used to arm `setTimeout` callbacks inside the page. Those die the moment
the PWA is backgrounded, which is why every toggle read "on" and nothing ever
arrived. Reminders have to come from something that is awake while the phone is
in a pocket, so they come from here.

## Deploy

One time only. The first two steps need your Cloudflare login.

```bash
npx wrangler login
```

```bash
npx wrangler secret put VAPID_PRIVATE_KEY
```

Paste the value from `worker/.dev.vars` when prompted. That file is gitignored
and must stay that way: this repo is public, and the private key is what proves
a push came from you.

```bash
npx wrangler deploy
```

Deploy prints a URL like `https://fittrack-push.<your-subdomain>.workers.dev`.
Put it in `fittrack.html`:

```js
const PUSH_API='https://fittrack-push.<your-subdomain>.workers.dev';
```

Commit and push that, and reminders are live. Until it is set the app says so
plainly rather than pretending anything is scheduled.

## Check it works

```bash
curl https://fittrack-push.example.workers.dev/health
```

Then, with notifications already enabled in the app, the Settings test button
fires a real server push. If that arrives, the pipeline works end to end.

```bash
npx wrangler tail
```

Live logs, for when a reminder does not show up.

## Tests

```bash
node test/schedule.test.mjs
```

17 checks covering local-time resolution across DST, which reminders fire on
which days, dedupe, the skip-when-already-done rules, real VAPID signing and
real RFC 8291 encryption. The encryption is separately verified byte for byte
against the RFC's own published test vector.

## The schedule

All times are the user's own local time, resolved through their IANA timezone.
Cron triggers are UTC-only, so the Worker works out each user's wall clock itself.

| When | What | Skipped if |
|---|---|---|
| 09:30, 12:30, 15:30, 18:30, 21:00 | Water, with the amount you should be at by then | already at that checkpoint |
| 11:00 on training days | "When are you hitting the gym today?" | workout already logged |
| 19:30 on training days | "Did you already hit it?" | workout already logged |
| Monday 08:00 | Weigh-in | weight already logged today |
| Sunday 22:00 | Dose tonight, with the mg | never |
| Monday 10:00 | Dose taken? | never |

Water stops at 21:00 on purpose. Later than that and it costs sleep.

The skip rules matter more than the times. Being told to drink water after
already hitting the target is how an app gets muted, and a muted app sends
nothing at all.

Doses come from a fixed titration table and are **never extrapolated**. Past the
last known date the reminder says so and asks you to confirm, rather than
guessing a number for a drug.

## Storage

Workers KV, one namespace.

| Key | Holds |
|---|---|
| `sub:{id}` | `{sub, tz, prefs, cfg, at}` — push subscription and preferences |
| `state:{id}` | `{water, gymDone, weightLogged}` — only what the skip rules read |
| `sent:{id}:{YYYY-MM-DD}` | reminder ids already fired that local day, 48h expiry |

`state:` deliberately holds only the three fields the scheduler needs. The
server never becomes a second copy of your log; everything else stays on the
phone.

Device ids are random strings and act as bearer tokens: anyone holding one could
write that device's state or send it a test push. For a reminder app with no
credentials in it, that is a fair trade for having no accounts and no logins. Do
not add anything worth stealing, and never add an endpoint that lists ids.

## Free plan limits

100k requests/day, 10 ms CPU per invocation, 5 cron triggers per **account**, and
KV at 1000 writes and 100k reads per day. A 30-minute cron is 48 invocations a
day, each doing one list plus a few gets, so there is plenty of room.

The 10 ms CPU limit bites first. The tick loops over users, so past roughly 50 it
needs sharding across ticks or the paid plan. Fine for you and a few friends;
worth remembering before sharing it widely.

## Rotating the VAPID keys

Only if the private key leaks. Every existing subscription breaks and everyone
has to re-enable notifications, so this is not routine.

```bash
node -e "const{webcrypto:c}=require('crypto');(async()=>{const k=await c.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const b=x=>Buffer.from(x).toString('base64url');console.log('PUBLIC ',b(await c.subtle.exportKey('raw',k.publicKey)));console.log('PRIVATE',b(await c.subtle.exportKey('pkcs8',k.privateKey)))})()"
```

The public key goes in two places, `wrangler.toml` and `VAPID_PUBLIC` in
`fittrack.html`, and they must match. The private key goes into `.dev.vars` and
into `wrangler secret put VAPID_PRIVATE_KEY`, then redeploy.
