# PR1 privacy

## Trace before edits

- DEF_SETTINGS in fittrack.html supplies owner name, profile, program start, body measurements and nutrition targets. DB.settings reads ft_settings first, with no shallow merge. init fills missing groups and certain missing keys only. Complete stored groups do not read owner defaults; incomplete older profiles can. Missing weight history is seeded from the stored starting weight on existing installs.
- Onboarding starts with an empty draft for identity and measurements; only the height example embeds an owner measurement. Finishing computes targets from entered values and stores the entered profile and today's start date. First-run init returns before weight-history seeding.
- migrateDoseSettings returns immediately for ANY stored dose.steps array, including an empty array. Otherwise its name and birthday match supplies a medication label and six confirmed dated steps, enables medication tracking and persists them. No extrapolation. Existing stored schedules never read those built-in dates or doses.
- Progress heart-rate copy assumes the owner's low medication dose for fewer than three readings. This is read even with stored medication data when heart-rate history is short; it must change. With three or more readings the card uses measured baseline text instead.
- Static author metadata, copyright and Settings credits always read shipped identity. The workout JSON embeds a gym/location and personal rationale; its downloaded program renders for stored profiles too.
- Capture-tool privacy constants, name-specific exception and comments embed identity, measurements and medication information. The feel gate extracts the synthetic capture seed but currently has no privacy assertion.
- Scanned every tracked text file for identity, birthday, height, weights, body composition, gym/location and medication terms. Binary screenshots/tour cannot be cleared by a text scan. Candidate paths below include generic mentions and historical documents, not all are leaks. No personal values recorded here.

- AGENTS.md
- CHANGELOG.md
- CLAUDE.md
- GOAL.md
- NEXT-SESSION.md
- README.md
- data/foods.json
- data/orders-parsed.json
- data/workout-program.json
- docs/audit-2026-10-05/RULES.md
- docs/audit-2026-10-05/briefs/C1-feel-audit.md
- docs/audit-2026-10-05/briefs/C2-motion-studio.md
- docs/audit-2026-10-05/briefs/F1-workout-flow.md
- docs/audit-2026-10-05/briefs/F1b-verify.md
- docs/audit-2026-10-05/briefs/F2-fast-logging.md
- docs/audit-2026-10-05/briefs/F20a-truth-fixes.md
- docs/audit-2026-10-05/briefs/G1-competitor-review.md
- docs/audit-2026-10-05/briefs/G2-design-critique.md
- docs/audit-2026-10-05/briefs/P1-motion-contract.md
- docs/audit-2026-10-05/briefs/P2-navigation.md
- docs/audit-2026-10-05/briefs/P3-workout-continuity.md
- docs/audit-2026-10-05/briefs/P4-home-nutrition-data.md
- docs/audit-2026-10-05/briefs/P6-sheets.md
- docs/audit-2026-10-05/briefs/P8-chart.md
- docs/audit-2026-10-05/briefs/T1-feel-gate.md
- docs/audit-2026-10-05/codex-feel-audit.md
- docs/audit-2026-10-05/competitor-review.md
- docs/audit-2026-10-05/design-critique.md
- docs/audit-2026-10-05/logs/C2.log.md
- docs/audit-2026-10-05/logs/C3b.log.md
- docs/audit-2026-10-05/logs/F1.log.md
- docs/audit-2026-10-05/logs/F20a.log.md
- docs/audit-2026-10-05/logs/P1.log.md
- docs/audit-2026-10-05/logs/P2.log.md
- docs/audit-2026-10-05/logs/P8.log.md
- docs/audit-2026-10-05/logs/T1.log.md
- docs/audit-2026-10-05/overnight/F3.md
- docs/audit-2026-10-05/overnight/G6-goal-audit.md
- docs/audit-2026-10-05/overnight/P7.md
- docs/audit-2026-10-05/overnight/P9.md
- docs/audit-2026-10-05/overnight/R1.md
- docs/audit-2026-10-05/overnight/R2.md
- docs/audit-2026-10-05/overnight/R3.md
- docs/audit-2026-10-05/overnight/R4.md
- docs/audit-2026-10-05/overnight/_lane-a-header.md
- docs/audit-2026-10-05/overnight/_lane-b-header.md
- docs/audit-2026-10-05/overnight/overnight.sh
- docs/audit-2026-10-05/pwa-platform-matrix.md
- docs/audit-2026-10-05/reel/C3a-reel-score.md
- docs/audit-2026-10-05/reel/C3b-reel-visuals.md
- docs/get-started.html
- docs/research/competitive-and-design-plan.md
- fittrack.html
- manifest.json
- test/layout-probe.mjs
- test/progress.test.mjs
- test/push.test.mjs
- test/schedule.test.mjs
- tools/capture-media.mjs
- tools/generate-foods.mjs
- worker/README.md
- worker/src/index.js
- worker/wrangler.toml

## Scope

Assigned runtime/tool/program changes are proceeding. Other tracked documents, food/order files, historical media and the personal progress-test fixtures require ownership resolution. No history rewrite performed.

## Runtime and tool edits

Neutral identity/body defaults, generic targets and height prompts replace owner values. Stored dose arrays remain authoritative. Missing legacy schedules get an empty array and a persisted one-time Settings notice flag. No inferred medication steps. Static identity and dose-specific reassurance removed. Program copy now describes sessions and equipment. Both media tools read the optional private sentinel JSON and reject malformed lists; missing files print an explicit CI skip. Private values and history strings were written only outside the repo.

## Verification checkpoint

Syntax PASS. Push 19/19, schedule 25/25, finish-summary PASS. Progress 27/28: remaining failure asserts removed owner-specific migration. That test and other personal fixtures are outside assigned ownership; permission requested to update. Schedule tests also reproduce the old personal table as a fixture and need synthetic replacements in the follow-up. Browser comparison on port 8907: Home and Progress rendered text identical; Settings identical except removed static author credit. Stored medication object unchanged. Short heart-rate history copy intentionally changes as traced. The feel sentinel check now covers visible demo text on all screens and sheets, and never prints private matched values.

## Final report

Assigned files changed: fittrack.html, data/workout-program.json, tools/capture-media.mjs, test/feel.test.mjs. No styling changes, no commits, no pushes, no destructive git commands.

The runtime no longer embeds owner identity, profile/body measurements, start date, personal nutrition defaults, confirmed medication rows, gym location or low-dose reassurance. Complete stored settings and dose arrays take precedence. Generic fallback targets are for incomplete profiles only. Missing program dates resolve to today. Null body defaults never seed a fictional weigh-in. The missing-schedule notice is conservative for all pre-editor profiles because identity matching has been removed.

Private sentinels.json and history-sentinels-app.txt exist at the requested external location. The latter contains removed values and personal copy, one entry per line. Values never appear in this log. Existing personal values in unowned documents/tests were not copied into tracked files. Every tracked text file was scanned; shipped binary screenshots and the tour still require visual review or recapture by their owner.

Gates: syntax PASS; capture and feel tool syntax PASS; push 19/19; schedule 25/25; finish-summary PASS; PORT=8907 feel PASS, all four device/theme combinations with privacy checks, existing KNOWN styling findings unchanged. Final progress run 27/28 FAIL solely at the old owner-schedule injection assertion. Unit smoke checks pass for stored-dose preservation, empty fresh schedules, legacy notice marking and both missing-private-file CI skip paths. Browser proof passes for the legacy notice appearing once across reload and fresh onboarding with no dose steps.

Before/after seeded stored medication profile: Home and Progress rendered text identical. Settings text identical after accounting for the deliberately removed static author credit. Medication object byte-identical. The comparison used a synthetic profile with a stored schedule and populated heart-rate history. Short heart-rate history now intentionally shows generic baseline copy. This does not claim every stored profile renders identical full text: removal of personal generic copy and author attribution is required by the brief.

Not complete for the whole tracked tree. The ownership questions remain unanswered. test/progress.test.mjs still includes personal profile fixtures and an assertion incompatible with the new migration. test/schedule.test.mjs still reproduces the personal confirmed schedule. Historical docs, food/order data and existing media remain outside this assignment. Update/scrub those in their authorized lanes before claiming the public repository contains no personal data. All temporary scripts and baseline files created by this run were removed; only the two requested private sentinel files remain from this run.

## Phase 2 (Sonnet)

Worktree `C:/Users/adnan/projects/ft-wt/pr1`, branch `feat/private-profile`, nothing committed. Adnan approved: public portfolio project, he is the main user, his data lives on his phone, tracked files carry no personal data. No sentinel values appear in this section.

**Author credit restored.** The copyright comment on line 1, the `author` meta tag and the Settings About row ("Built by" line plus the copyright line) are byte-identical to HEAD again (`git diff HEAD` shows no change on those lines). The version row was never touched. Because the credit now carries the author name, both privacy tools strip the credit text (a regex from "Built by" to "All rights reserved.") before matching sentinels, so the name sentinel still guards every other place a name could surface.

**Sentinel path.** `test/feel.test.mjs` and `tools/capture-media.mjs` no longer hardcode a Windows user path. They read `<FITTRACK_PRIVATE_DIR or ~/projects/fittrack-private>/sentinels.json` and skip with a clear message when it is absent (CI).

**Tests, synthetic fixtures.**
- `test/progress.test.mjs`: made-up person (name, 1990 birthday, 80 kg, 180 cm, 72 kg target, 25 percent body fat), a 62 kg target for the projection tests with the weight series shifted to match (every test keeps its intent), intake 2100, water 2750, a stored dose schedule with a fictional medication, 2099 dates and 0.1 to 0.2 amounts. The old "migration seeds the owner" test is replaced by three: a missing legacy schedule becomes `{med:'GLP-1 medication', steps:[]}` plus `doseNeedsEntry:true` (glp1 not switched on, second run is a no-op, fresh install gets no flag); a stored schedule, including an empty stored array, wins and comes back byte-identical; a date past a stored table yields no number. 29 assertions (was 28).
- `test/schedule.test.mjs` and `test/push.test.mjs`: every date from 2026-08-17 to 2026-10-12 shifted by exactly 26663 days (73 years, a whole number of weeks) to 2099, so each date keeps its weekday and stays in daylight time (2099-08-31 is a Monday). The dose table is now 0.1, 0.1, 0.2, 0.2, 0.3, 0.3 of a fictional "examplemed". The DST-boundary test dates are untouched.
- `test/layout-probe.mjs`: onboarding height input uses a synthetic value.

**Current tracked files neutralized** (history is rewritten separately): `CLAUDE.md` and `AGENTS.md` (the "titration table never extrapolated" rule now says no schedule ships in code, user-stored only), `README.md` (two feature rows), `docs/get-started.html`, `docs/research/competitive-and-design-plan.md` (2 lines), `docs/audit-2026-10-05/RULES.md`, `design-critique.md`, `pwa-platform-matrix.md`, `NEXT-SESSION.md` (8 spots, including a worked bug example that printed the real dose table, now described abstractly), and a code comment in `fittrack.html` that tripped a numeric sentinel. `worker/wrangler.toml`: `VAPID_SUBJECT` is now `https://github.com/addyrallxx/fittrack`, replacing a personal email. **Adnan must redeploy the worker (`npx wrangler deploy` in `worker/`) for this to take effect; I did not deploy.** A URL subject is valid under RFC 8292.

**Not touched, by ownership.** `data/foods.json`, `data/orders-parsed.json`, `tools/generate-foods.mjs`, `tools/check-foods.mjs` belong to the foods lane (`ft-wt/foods`, `chore/scrub-foods`). Its branch already has the three drug-name notes removed, but it still carries 10 `src` strings naming the owner's neighbourhood (and the phase 2 brief does not list them). Binary screenshots and the tour GIF still need a visual check or recapture.

**Gates (worktree):** `node test/syntax-check.mjs` PASS; `node test/progress.test.mjs` 29/29; `node test/push.test.mjs` 19/19; `node test/schedule.test.mjs` 25/25; `node test/finish-summary.test.mjs` PASS; `node tools/check-foods.mjs` PASS (1502 entries); `PORT=8911 node test/feel.test.mjs` PASS, 193 s, privacy assertion active (sentinels file present, no violation, not skipped), only the existing KNOWN P5 entries listed.

**Final sentinel scan** (every tracked text file, value classes: body numbers, birthday, height, medication name, dose dates, gym and neighbourhood strings): 18 raw hits in 4 files, 0 in anything this lane owns.
- `data/foods.json` 14: 3 medication-name notes (already removed on the foods branch), 10 neighbourhood `src` strings (open, see above), 1 false positive (a carbs value of an oat entry).
- `tools/generate-foods.mjs` 1: false positive, same oat row.
- `docs/audit-2026-10-05/logs/F1.log.md` 1: false positive, a gym load placeholder.
- `sitemap.xml` 2: false positive, public `lastmod` dates that happen to equal a dose date.
Name-only hits (author name) remain by design in the 3 credit lines of `fittrack.html`, `README.md`'s byline, and about 44 workflow and planning docs that use the name as the owner persona; Windows user paths appear in some audit logs and `data/orders-parsed.json`. Judged attribution, not private data, left for Adnan.
