# Wave rules, 2026-10-05 (every run reads this first)

## The bar, in Adnan's words
> "I want the best smoothness, functionality, UI feel, UX like apple apps."

## Project facts (do not "improve" these away)
- FitTrack is a single-file vanilla JS PWA. `fittrack.html` holds shell, CSS and all JS in classic script scope so inline `onclick=` handlers work. No build step, no bundler, no framework, no new dependency.
- `sw.js` is network-first for every GET on purpose. Never make anything cache-first.
- Weight is stored in kilograms everywhere. Only the display layer converts (`toDisp`, `fromDisp`, `fmtW`, `fmtWU`, `wUnit`).
- The GLP-1 medication titration table is never extrapolated.
- Free only: GitHub Pages, Cloudflare Workers and KV free tiers. No paid service, no account system.
- Rulings already made (see `docs/research/competitive-and-design-plan.md` section 5): no social feed, no streaks/badges/points, no opaque readiness score, no AI coach or photo meal estimator, no dose optimizer, no fasting program, no recipe planner, no framework or native wrapper.
- No em dashes in any app copy, doc or log you write. Use periods, commas, colons, parentheses.

## Devices
- Primary: Samsung Galaxy S26 Ultra, Chrome on Android. CSS viewport 384 x 832, DPR 3.75, 120 Hz.
- Secondary: iPhone, Safari. CSS viewport 393 x 852. Must also work.

## Hard limits for every run
- Never run `git stash`, `git checkout`, `git restore`, `git reset`, `git clean`, `git commit` or `git push`. Inspect with `git diff`.
- Edit only the files your brief says you own. If you need a change elsewhere, write it in your log instead.
- Adnan is playing a game on this laptop. At most ONE headless Chrome at a time, close it when done, scan for a free CDP port. Finish correctness and geometry first; measure performance LAST and ONCE, record the number with a "machine busy" caveat, and never iterate on frame timings.
- Append to your progress log after each part. End the log with a section headed `Final report`.
- Before you finish, these must pass on your tree: `node test/syntax-check.mjs` and the suites listed in `NEXT-SESSION.md`, section "Testing".
