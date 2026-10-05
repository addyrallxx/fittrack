# P4: Home and Nutrition, incremental data rendering

Worktree `C:/Users/adnan/projects/ft-wt/p4` (branch `wave2/p4`, cut from main after P2 merged). All edits there. Main checkout read-only except your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/P4.log.md`.

Read: `docs/audit-2026-10-05/RULES.md`, `GOAL.md`, the audit `docs/audit-2026-10-05/codex-feel-audit.md` defects F03, F05, F17 (numbers in your regions) and package P4 (your exact scope and acceptance list). Anchor on function names; line numbers moved. P1 tokens and `prefersReducedMotion()` exist; P2 made `renderScreen` preserve scroll; F20a made the carb and fat bars read stored targets (keep that behaviour exactly).

## Parallel runs this round (stay out of their regions)
- P3 owns the workout CSS, `exCard`, `toggleEx` through `finishWorkout`, `loadProgram`.
- P8 owns `setRange`, `buildChart`, the chart hook in `renderProgress`, the `applyTheme` chart call.
You own `ring`, `animRing`, `countUp`, the data hooks of `renderHome`, `renderNutrition`, `renderMealSec` through `toggleCreatine`, `addMealItem`, the Home refresh callers named in the audit, and the fill CSS.

## Decisions
- First paint shows the true values immediately. No ring, bar or number ever replays from zero on a routine update.
- When a value changes, animate from the previous value to the new one over `--dur-data` (550 ms) with `--ease-out`; rings and bars move by `transform` (`scaleX` for bars, stroke-dashoffset for SVG rings is acceptable since it is paint-only and cheap; no `width` transitions). Number tickers only on changed values, cancellable, never overshooting the real value, instant under reduced motion.
- Water on Home and Nutrition stay in sync after any add, including from a notification action.
- Small actions update only what changed: deleting a meal removes one row (plus its group if it becomes empty); toggling creatine updates one control; the food search keeps its query, focus and results.
- Every number in your regions uses `tabular-nums`.
- The water default fallback is inconsistent today (`4000` in several places, `3500` in `DEF_SETTINGS` and the push worker config). Make every fallback in your regions read one shared default that equals `DEF_SETTINGS.targets.water`, and note any remaining copies outside your regions in your log.
- Do not change any target, floor, calorie maths, meal maths or kg semantics.

## Acceptance
The audit's P4 acceptance list, in headless Chrome at 384 x 832 then 393 x 852 with a seeded demo profile (one instance, free port, close it after), plus: zero `width` transitions in your regions; a MutationObserver shows a water tap and a creatine tap replace zero screen-root children. `node test/syntax-check.mjs` and the five suites pass; `git diff --stat` touches only `fittrack.html`. Do not commit. No frame timing. End the log with `Final report`.
