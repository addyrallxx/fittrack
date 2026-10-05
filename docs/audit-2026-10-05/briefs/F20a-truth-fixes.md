# F20a: show true targets, and remove the streak row

You work in the git worktree `C:/Users/adnan/projects/ft-wt/f20a` (branch `wave2/f20a`, cut from main). All edits happen there. The main checkout `C:/Users/adnan/projects/fittrack` is read-only for you, except your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/F20a.log.md`.

Read first: `docs/audit-2026-10-05/RULES.md`, the audit `docs/audit-2026-10-05/codex-feel-audit.md` defect F20, and `docs/research/competitive-and-design-plan.md` sections 4 and 5.

## Two defects, verified in the code
1. **Hardcoded macro targets.** `renderNutrition` prints `/ 210g` for carbs and `/ 65g` for fat (around lines 1421 and 1426, and the denominators near 1468 to 1469). Those are one person's numbers baked into the UI. Replace them with the user's real targets from settings. First find out what the app actually stores: if carb and fat targets exist in `S.cfg.targets` (or are derived somewhere in the code), use exactly that source. If they do not exist, do NOT invent a formula: show the logged grams without a denominator and without a progress fill for that macro, and say so in your log. Protein and calories keep their existing behaviour.
2. **Streak row.** `renderProgress` renders a `.streak-row` with fire emojis counting consecutive days (around lines 2182 and 2251 to 2255, CSS around 417 to 420). The project ruling is "no streaks, badges, points or daily completion score". Remove the row, its CSS and any computation used only by it. Replace it with a calm, neutral "This week" summary of plain counts that already exist in the data, for example "Gym 2 of 3" (from `settings.gymTarget`), "Protein target met 4 of 7 days", "Water goal met 5 of 7 days". Counts of this week only, no consecutive-day logic, no emoji, no celebratory colour: numbers in `--t1` with `tabular-nums`, labels in `--t2`. Match the surrounding card styles exactly.

## Ownership
Only those two regions of `fittrack.html` and their CSS. Another run (P1) is editing the `:root` tokens, the reduced-motion block, `obShowError` and `launchConfetti` at the same time; stay out of those.

## Acceptance (evidence in your log)
- `grep -n "210g\|65g" fittrack.html` returns nothing in UI strings; `grep -n "streak" fittrack.html` returns nothing (or only an explained non-UI remnant).
- With a seeded demo profile in headless Chrome at 384 x 832 (one instance, free port, close it after): the Nutrition macro rows show the stored targets or no denominator; the Progress "This week" card shows correct counts for a synthetic week you construct (state the inputs and expected numbers, then the observed ones).
- `node test/syntax-check.mjs` and the five suites pass in the worktree. `git diff --stat` touches only `fittrack.html`. Do not commit. No em dashes in any copy. End the log with `Final report`.
