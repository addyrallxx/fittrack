# F2: log food in two taps

Worktree `C:/Users/adnan/projects/ft-wt/f2` (branch `wave2/f2`, cut from main). All edits there. Main checkout read-only except your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/F2.log.md`.

Read: `docs/audit-2026-10-05/RULES.md`, `GOAL.md`, in `docs/audit-2026-10-05/competitor-review.md` the MacroFactor, Cronometer and Foodnoms sections and adoption ranks 4 and 12. Then read the current Nutrition code: `renderNutrition`, `renderMealSec`, the search functions (`runSearch` and friends), `addMealItem`, `delMeal`. P4 just made Nutrition patch in place with `patchDataScreen` and keyed meal rows; build on it, do not bypass it.

## Parallel run (stay out): P6 owns the sheet lifecycle (`openSheet`, `closeSheet`, `openManualSheet`, celebration). Call `openSheet` as it is; do not edit it.

## Three things, one concern: logging speed
1. **Recent foods.** When the food search field is focused and empty, show "Recent": the last 12 distinct foods the user logged, newest first, each row showing name, last-used serving and kcal. One tap logs it into the meal currently selected in the search context, with the last-used serving. If the app already shows recents or history-ranked results, extend that instead of duplicating it (say what you found in your log).
2. **Repeat a meal.** When a meal section (breakfast, lunch, dinner, snacks, whatever the app uses) is empty today and that meal was logged on a previous day within the last 14 days, its header shows a quiet secondary action "Repeat Tue" with the kcal, e.g. `Repeat Tue · 640 kcal`. One tap copies every item of that most recent logged instance into today's meal.
3. **Undo.** Every add, repeat and delete in Nutrition shows a toast with an Undo action for 5 seconds (one toast at a time, a new action replaces it). Undo restores the exact previous state of that day's meals. The toast sits above the tab bar, inside the thumb zone, has `role="status"`, and its Undo button is at least 44 x 44 px. Deleting no longer needs any confirmation step if one exists today; Undo replaces it.

## Rules
- Storage stays the same shape: meals live where they live today, weight in kg, no schema bump. Recents are derived from existing logs (cache the derivation per render, do not re-parse the whole log per keystroke).
- Motion: new rows fade and rise 8 px over `--dur-nav`; removed rows fade out then collapse instantly (no height animation). Reduced motion: no movement.
- No em dashes in any copy. Copy is short and plain.

## Acceptance (headless Chrome, 384 x 832 then 393 x 852, seeded demo profile plus 14 days of synthetic meals you construct, one instance, free port, close it after)
- Focusing an empty search shows the expected 12 recents in the expected order (state inputs and expected list, then observed); one tap adds the right food and serving to the right meal; the search keeps focus.
- An empty meal with a logged instance 3 days ago shows `Repeat <weekday> · <kcal>` with correct values; one tap copies all items; meals with no history in 14 days show nothing.
- Add, repeat and delete each produce an Undo toast; Undo restores the exact prior meals (deep-equal) and the totals, rings and bars match; a second action replaces the first toast.
- No `height`, `max-height` or `width` animation in your regions; every new tap target at least 44 x 44.
`node test/syntax-check.mjs` and the five suites pass (serve suite on a free port as earlier runs did, port 8899 belongs to another process); `git diff --stat` touches only `fittrack.html`. Do not commit. End the log with `Final report`.
