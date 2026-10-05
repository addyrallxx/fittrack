# P6: sheets that feel native

Worktree `C:/Users/adnan/projects/ft-wt/p6` (branch `wave2/p6`, cut from main). All edits there. Main checkout read-only except your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/P6.log.md`.

Read: `docs/audit-2026-10-05/RULES.md`, `GOAL.md`, the audit `docs/audit-2026-10-05/codex-feel-audit.md` defects F10, F11 and package P6, and in `docs/audit-2026-10-05/pwa-platform-matrix.md` only sections 6 (Back gesture), 10 (dialog) and 11 (inert) and build guidance 3 and 4. Anchor on function names. Available contracts: P1 tokens (`--dur-sheet`, `--ease-sheet`, `prefersReducedMotion()`), P2 `navBackHandlers` (array of functions run on `popstate`, newest first; return `true` to consume) and `markScreenDirty(idx)`.

## Parallel run (stay out): F2 owns the Nutrition search area, meal section headers and their add/delete actions.
You own the sheet and backdrop CSS, `openSheet`, `openHelp`, `closeSheet`, the `openManualSheet` sequencing, and the celebration overlay (`celebrate`, `hideCel` and its markup).

## Decisions
- **Native first.** Make the sheet a `<dialog>` opened with `showModal()`: focus trap, Escape, inert background and top layer come from the platform. Keep the public API (`openSheet(html, ...)`, `closeSheet()`) so every caller keeps working. Backdrop is `::backdrop` fading opacity only.
- **Motion.** Open: translateY(100%) to 0 over `--dur-sheet` with `--ease-sheet`, no overshoot. Close: animate down, then `close()`. Instant under reduced motion.
- **Drag to dismiss** from the handle and the sheet header (never from scrollable content, never when content is scrolled away from its top): the sheet follows the finger 1:1 downward, upward drag rubber-bands (0.3 resistance, max 24 px). Release dismisses when dragged more than 30 percent of the sheet height or released downward faster than 0.5 px per ms; otherwise it settles back in 250 ms with `--ease-sheet`. Pointer events, passive where possible, transform only.
- **Android Back closes the sheet first.** Opening pushes one history entry and registers a `navBackHandlers` entry that closes the sheet and returns `true`. Closing any other way (X, drag, Escape, a completed action) consumes that entry with `history.back()` guarded so the handler does not double-close. The tab history contract from P2 must still hold: Back from a non-Home tab with no sheet goes Home; history never grows past one entry per open sheet. Test the sheet-on-Home and sheet-on-other-tab cases.
- **Replace, do not reopen.** `openManualSheet` and any sheet-to-sheet handoff swap content inside the open dialog (crossfade 120 ms), never close and reopen on a timer.
- **Focus.** First input when the sheet holds a form, otherwise the close button; focus returns to the opener on close.
- Celebration overlay uses the same dialog lifecycle and accessibility.

## Acceptance (headless Chrome, 384 x 832 then 393 x 852, seeded demo profile, one instance, free port, close it after)
The audit's P6 list, plus: a simulated drag from the handle of 35 percent height dismisses, 20 percent settles back, a drag starting inside scrolled content never moves the sheet; `history.length` returns to its pre-open value after open plus X close, open plus drag close, and open plus Back; Back with a sheet open on Workout closes the sheet and stays on Workout, a second Back goes Home; twenty rapid open, replace and close calls leave zero open dialogs and no stray history entries; animations list only transform and opacity. `node test/syntax-check.mjs` and the five suites pass (port 8899 belongs to another process: leave it and run the serve suite on a free port as earlier runs did); `git diff --stat` touches only `fittrack.html`. Do not commit. End the log with `Final report`.
