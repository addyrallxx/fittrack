# FitTrack project rules (Codex)

Applies to this repo only. For current state, open work, and session
history, read `NEXT-SESSION.md`, not this file.

## Architecture constraints, do not "improve" these away

- **Single-file vanilla JS PWA. No build step, no bundler, no framework.**
  `fittrack.html` carries the shell, CSS and all JS. It runs in classic
  script scope on purpose, so inline `onclick=` handlers keep working. Do
  not introduce a module system or a build step to "clean this up."
- **The service worker (`sw.js`) is network-first for every GET, on
  purpose.** There is no build step and no hashed filenames, so nothing can
  safely be cache-first: a stale cache would silently serve an old version
  forever. Do not "optimise" this to cache-first or add a cache-first
  fallback for any request type.
- **Weight is canonically kilograms everywhere in storage.** Only the
  display layer converts, via `toDisp` / `fromDisp` / `fmtW` / `fmtWU` /
  `wUnit`. Any new weight-touching code reads and writes kg; unit
  conversion happens only at render time.
- **The retatrutide titration table is never extrapolated.** It stops at
  the last confirmed dose and date. Extend it only when Adnan states the
  next actual step himself, never by inferring the next dose from the
  cadence of previous steps.
- **The app must stay free.** Install by link plus Add to Home Screen, no
  app store, no paid services, no infra beyond the free tiers already in
  use (GitHub Pages, Cloudflare Workers free tier, Cloudflare KV free
  tier).

## Device priority

**Samsung Galaxy S26 Ultra (Android, Chrome) is the primary target.**
iPhone is secondary: Adnan shares the app with friends and family who are
mostly on iPhone, so it must also work, but the S26 is his own daily phone
and the one to verify first.

## Before every commit

- **Never big-bang commit.** A single commit that added five features at
  once put the app on a black screen in April 2026 (functions called
  before they were defined); three fix attempts failed and it was
  force-reset to `93764db`. Commit one feature at a time.
- **Run `node test/syntax-check.mjs` before every commit.** It extracts
  the inline `<script>`, `sw.js`, the worker, and every JSON file and
  checks each. This is the exact guard that would have caught the April
  black screen.
- The other suites are `node test/progress.test.mjs`,
  `node test/push.test.mjs`, `node test/schedule.test.mjs`. Run them too
  when you touch progress, push, or scheduling.
- A unit test suite passing is not proof a live route works. Curl the
  deployed worker after any routing change; see `NEXT-SESSION.md`'s "Rules
  that bite" for the `/resubscribe` incident this rule comes from.

## Copy

No em dashes anywhere in app copy, comments, or commit messages. Use
periods, commas, colons, parentheses.

## Environment notes specific to this repo

- **`python` on PATH is the Microsoft Store stub** and exits with an error
  instead of running. Use Node for one-off scripts (`node -e "..."`), not
  Python, on this machine.
- Node 24 and npm live at `C:\Program Files\nodejs`. If `npm` is not
  found, prepend that to PATH.
- **Do not push.** Leave commits local; Adnan pushes.
- Do not run `git stash` in this repo. Another agent may hold uncommitted
  work. Use `git diff` to inspect instead.
