# W2: a calm finish-workout summary

Worktree `C:/Users/adnan/projects/ft-wt/w2` (branch `feat/finish-summary`, from main 1.2.0). Log: `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/overnight/logs/W2.log.md`. You own `finishWorkout` and what it shows, a new summary sheet, and the rest bar's final-seconds colour. Other packages are editing inputs (P7), touch targets and press states (P5) and storage (P9) on other branches: stay inside your functions so the merge is clean.

Read `GOAL.md` and, in `fittrack.html`, the native `<dialog>` sheet system (`modalPresent`, `modalDismiss`), `finishWorkout`, the rest bar (`ensureRestBar`, `reconcileRestTimers`), the motion tokens and `fmtW`/`wUnit` (storage stays kg; convert only for display).

- When a workout finishes, a sheet slides up with: the session name, duration (first set to finish), exercises done of planned, total sets, total volume (weight times reps, display units), and per exercise the top set with a quiet "up from last time" only when it is. No scores, badges, streaks, confetti or praise copy; one calm line at most. A single "Done" closes it; Back and drag-to-dismiss work.
- Reduced motion: the sheet appears without movement. Numbers are tabular.
- Rest bar: in the last 10 seconds, the fill eases to the existing success colour token (transform and opacity or colour only, no layout properties).
- Gates: syntax, progress, push, schedule, and `PORT=8904 node test/feel.test.mjs`. Verify the sheet in headless Chrome at 384 x 832 with a seeded workout (use the capture tool's demo seed, never real data).

Rules: never run git stash, checkout, restore, reset, clean, commit or push. No em dashes in code or copy. End with `Final report`.
