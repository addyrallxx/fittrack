# P3: Workout DOM continuity

Worktree `C:/Users/adnan/projects/ft-wt/p3` (branch `wave2/p3`, cut from main after P2 merged). All edits there. Main checkout read-only except your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/P3.log.md`.

Read: `docs/audit-2026-10-05/RULES.md`, `GOAL.md`, the audit `docs/audit-2026-10-05/codex-feel-audit.md` defects F02, F04 and package P3 (your exact scope and acceptance list). Audit line numbers predate later merges; anchor on function and selector names. P1 tokens exist (`--dur-press`, `--dur-nav`, `--dur-sheet`, `--dur-data`, `--ease-out`, `--ease-sheet`, `--spring`, `prefersReducedMotion()`); P2 made `renderScreen` keep scroll and added screen-level navigation; use both, do not edit them.

## Parallel runs this round (stay out of their regions)
- P4 owns Home and Nutrition rendering (`animRing`, `countUp`, `renderHome`, `renderNutrition` and the meal/water/creatine actions).
- P8 owns the Progress chart (`setRange`, `buildChart`, the chart hook in `renderProgress`, the `applyTheme` chart call).
You own the workout CSS block, `exCard`, `toggleEx` through `finishWorkout`, and the `loadProgram` visible-update branch.

## Decisions
- Keep every live control alive: checking a set, completing an exercise and the first completion that adds the finish control update in place. No region re-render that recreates open cards, inputs or the rest timer.
- Expand and collapse: drop the `max-height` animation. Commit the layout once, then animate only opacity and a small translateY (8 px) of the revealed content over `--dur-nav` with `--ease-out`; keep the tapped header anchored (it must not move more than 2 px).
- The rest timer keeps running and shows the correct remaining time after leaving and returning to Workout; timers are reconciled or cancelled on session change, never orphaned.
- Do NOT add previous-set recall or a new rest-timer UI here. Those are the next feature packages.

## Acceptance
The audit's P3 acceptance list, measured in headless Chrome at 384 x 832 then 393 x 852 with a seeded demo profile (one instance, free CDP port, close it after). Add: zero transitions or animations on height, max-height, width, top or margin in your region (list what you checked). `node test/syntax-check.mjs` and the five suites pass; `git diff --stat` touches only `fittrack.html`. Do not commit. Performance: none. End the log with `Final report`.
