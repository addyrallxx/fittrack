# FitTrack handoff

**Updated:** 2026-08-26
**Repo:** `C:\Users\adnan\projects\fittrack` -> `github.com/addyrallxx/fittrack` (public)
**Live:** https://addyrallxx.github.io/fittrack/fittrack.html

---

## Owner profile (private)

The owner's height, weight, body composition, targets and medication schedule are kept in a private local record, not in this repository.
## Architecture

Single-file vanilla-JS PWA. **No build step, no dependencies, classic script
scope so inline `onclick=` handlers keep working.** Chart.js from CDN,
Open Food Facts API for food search.

`fittrack.html` (~1600 lines) - shell, CSS, all JS
`manifest.json` - PWA manifest, `start_url: ./fittrack.html`
`docs/archive/` - dormant features and restore instructions
`icon-192.png` / `icon-512.png`

### Storage

localStorage, all keys prefixed `ft_`:

| Key | Shape |
|---|---|
| `ft_schema` | int. **Bump to wipe on breaking change.** Currently `2` |
| `ft_settings` | `{units, profile:{heightCm,birthday,sex}, programStart, targets:{...}, body:{...kg}, notifications, ramadanMode}` |
| `ft_logs` | `{ "YYYY-MM-DD": {date, workout, nutrition:{meals,water}, checkins, steps, weight} }` |
| `ft_weights` | `[{date:"YYYY-MM-DD", weight}]` |
| `ft_workout` | day/exercise definitions |
| `ft_custom_foods` | user-added foods |

**Weight is canonically kilograms everywhere in storage.** Only the display
layer converts, via `toDisp` / `fromDisp` / `fmtW` / `fmtWU` / `wUnit`.
Because lb/kg is a pure scale factor those helpers are valid on deltas too.

---

## Done this session

- `ca0fd85` **Home screen on first paint.** Every `.screen` was
  `position:absolute; inset:0` with no initial transform, so all five stacked
  at `translateX(0)` and `#s4` (Settings), last in the DOM, painted over Home.
  The tab bar still highlighted Home, which is why it read as "loads from the
  right side". Fixed by parking screens off-stage and pinning `#s0` on-stage.
- `ca0fd85` **kg/lb units.** App had no unit concept and stored pounds with
  stale 165.0 lb defaults. Storage is now canonically kg. Owner confirmed
  on-device data is stale and unused, so `SCHEMA=2` wipes pre-v2 storage
  instead of carrying a converter.
- `e149866` **Steps on any date.** `DB.saveLog()` always took a date but every
  caller passed `S.today`, which `init()` sets once and never advances. Added
  `logFor` / `shiftDate` / `recentDates` / `saveStepsFor`, a date picker capped
  at today, and a 7-day catch-up list. Plus `ingestFromHash()` accepting
  `#steps=8432&date=2026-08-25` for one-tap automation, values kept in the
  fragment so they never reach the Pages server.
- Ramadan mode archived. Default flipped to `false` and the settings row
  removed; flag, `MEAL_TYPES_R`, `getMealTypes()` branch and `toggleRamadan()`
  all retained. Restore steps in `docs/archive/ramadan-mode.md`.

---

## Research artefact

Full 8-agent research output (GLP-1 medication, Calgary NW food data, gym
equipment, iOS PWA + Web Push, competitor apps, Cloudflare push
implementation), roughly 122k chars, with adversarial verification passes on
the pharmacology and nutrition numbers:

`C:\Users\adnan\AppData\Local\Temp\claude\C--Users-adnan-projects\ddfed865-54ab-49dc-918d-5d36017fe15a\tasks\webhwli0d.output`

Per-agent returns: the workflow `journal.jsonl` under
`.claude\projects\C--Users-adnan-projects\ddfed865-54ab-49dc-918d-5d36017fe15a\subagents\workflows\wf_b9acf853-ebc\`

**This is a temp path and will be cleaned up. Copy anything still needed into
`docs/research/` before relying on it.**

---

## Open work

### 1. Notifications (biggest single item)

**Current state is unfixable as designed.** `scheduleNotifs()` uses in-page
`setTimeout` + `new Notification()`. Those timers die the moment the PWA is
backgrounded. There is also **no service worker registered at all** - it was
lost in the April revert. This is why he has never received a notification
despite them showing as "on".

Approved approach: **Cloudflare Worker + KV + Cron Triggers**, free tier. His
Cloudflare account is connected and currently empty (0 workers, 0 KV
namespaces). Owner approved deploying there. Needs VAPID keys, a real service
worker with a `push` handler, and per-user timezone so a UTC cron fires at each
user's local time.

Reminder schedule he asked for:
- Water every few hours through the day
- Gym prompt **twice** a day ("when are you hitting the gym today" / "did you
  already hit it")
- Weight prompt **Monday morning**
- GLP-1 medication dose reminder Monday

**Service worker caching must be network-first or versioned.** A previous
service worker cached a black-screen build and he had to uninstall the PWA to
recover. Do not repeat that.

### 2. Food logger

Creatine quick-log. Calgary NW restaurant database (DoorDash/Skip/UberEats),
Bangladeshi + high-protein Western home recipes, Canadian grocery staples.
Screenshots folder for him to bulk-drop real past order screenshots.
Every entry needs `source` and `confidence` fields - he explicitly asked for
accuracy, so published numbers and estimates must be distinguishable.
Move the database to `data/foods.json` rather than inlining it, to keep
`fittrack.html` manageable.

### 3. Workouts

Rebuild for **3 days/week, 45-60 min, detrained** with a 2-week ramp-in.
Exercises named for the actual machines on the gym floor so he is never
confused. Two new logging shortcuts: **log the whole session at once**, and
**log one exercise at once** instead of set by set.

### 4. Progress tab

Predictive and honest. Trend-weight smoothing, back-calculated TDEE from
intake vs actual weight change, "at this rate, X by Y" projections.
**Never optimistic** - his explicit instruction. Must degrade gracefully when
he misses days rather than shaming or falsely encouraging.
Add resting heart rate tracking (see GLP-1 medication notes above).

### 5. iOS + sharing

Friends are all on iPhone. Needs iOS PWA polish (safe areas, splash, meta
tags), Web Push working on iOS 16.4+ home-screen installs, an onboarding flow
that generates a starting plan from a questionnaire (with GLP-1 medication,
creatine and protein as opt-in), and a motion onboarding doc he can hand out.

---

## Rules that bite

- **Never big-bang commit.** In April a single commit added five features at
  once, functions were called before they were defined, and the app went to a
  black screen. Three fix attempts failed and it was force-reset to `93764db`.
  Commit one feature at a time.
- **Syntax-check before every commit.** Extract the largest `<script>` block
  and run `node --check`. This is the exact guard that would have caught the
  April black screen.
- **`DB.set()` swallows every storage error silently.** localStorage failures
  are invisible today. iOS evicts localStorage, so this is a real data-loss
  path once friends are using it. Surface write failures and add a backup.
- The app must stay **free**: install by link plus Add to Home Screen, no app
  store, no paid services.
- No em dashes in any copy.

## Local notes

- Old pre-revert lineage worth mining, do not delete:
  `C:\Fittrack\fittrack.html` (152 KB) and `C:\Fittrack\fittrack update.html`
  (150 KB) contain the reverted phase banner, run tracker, calendar and Sunday
  check-in. Larger and newer in feature terms than what is on GitHub.
- `C:\fittrack-repo` is the old clone. `C:\Users\adnan\projects\fittrack` is
  now canonical.
- Test on a real http origin, not `file://` or a `data:` URL. **Storage is
  disabled inside `data:` URLs**, which makes the app look broken when it is
  not. `python -m http.server 8899` from the repo dir works.
- ECC is **enabled** in this session despite the global CLAUDE.md recording it
  as disabled by default. Its GateGuard hook demands a facts preamble before
  the first Bash call and before every first Write to a new file.
