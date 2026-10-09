# A1: split fittrack.html into css/ and js/ (no behaviour change)

Read `docs/adr/0001-portfolio-grade-structure.md`, `GOAL.md` and `CLAUDE.md` first. Worktree and branch are given in the header line Claude adds when launching. Log: `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/overnight/logs/A1.log.md`.

Phase A1 only. Move the inline `<style>` into `css/app.css` (one file, original order) and every inline `<script>` into `js/app.js` (or one file per original script block, loaded in the original order with plain `<script src>` tags, classic scripts, no `type="module"`, no `defer` unless the original order is provably preserved). Inline `onclick=` and every global must keep working exactly as now. `fittrack.html` keeps only the shell markup, the meta tags, and the links.

- Service worker: add the new files to the precache list, keep network-first for every GET (never cache-first), keep `APP_VERSION` behaviour.
- Tests and tools that read the inline script (`test/syntax-check.mjs`, `test/feel.test.mjs`, `tools/capture-media.mjs`, anything else: grep for how they extract it) must read the new files instead. Never weaken a check.
- Prove no behaviour change: byte-compare the concatenation of the extracted files against the original inline content (whitespace at the seams only); all gates pass: syntax, progress, push, schedule, finish-summary, `PORT=8908 node test/feel.test.mjs`; boot the app in headless Chrome at 384 x 832 with the demo seed and compare the rendered text of all five screens against main.
- An installed PWA must update cleanly: first load after the update fetches the new files (network-first) and works offline after one online load. Test offline in headless Chrome with the service worker.

Rules: never run git stash, checkout, restore, reset, clean, commit or push. No em dashes. End with `Final report`.
