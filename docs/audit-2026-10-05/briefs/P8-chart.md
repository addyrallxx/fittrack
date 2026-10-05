# P8: weight chart lifecycle, and scrubbing that feels native

Worktree `C:/Users/adnan/projects/ft-wt/p8` (branch `wave2/p8`, cut from main after P2 merged). All edits there. Main checkout read-only except your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/P8.log.md`.

Read: `docs/audit-2026-10-05/RULES.md`, `GOAL.md`, the audit `docs/audit-2026-10-05/codex-feel-audit.md` defect F06 and package P8, and in `docs/audit-2026-10-05/competitor-review.md` the sections "Interactive Chart Scrubbing with Haptic Detents" and the Happy Scale and Apple Health entries. P1 tokens and `prefersReducedMotion()` exist; P2 made `renderScreen` keep scroll.

## Parallel runs this round (stay out of their regions)
P3 owns the workout code; P4 owns Home and Nutrition rendering. You own `setRange`, `buildChart`, the chart hook in `renderProgress`, the `applyTheme` chart call, and the chart CSS (not the range-tab sizing, which a later touch package owns).

## Two parts, in this order
1. **Lifecycle (the audit's P8).** One Chart.js instance per canvas, updated in place on range and theme changes; destroyed only when its canvas is really removed; no delayed build against a detached canvas; Chart.js animation duration 0 under reduced motion and at most 550 ms otherwise; no redraw from zero on revisits.
2. **Scrubbing.** Press and drag on the chart (pointer events, `touch-action: pan-y` on the chart so vertical page scroll still works, horizontal drag scrubs) shows a 1 px hairline at the nearest data point and a small pill above the chart with the date and the weight in the user's display unit (via `toDisp` and `wUnit`, never raw kg). Snap to points. On Android fire `navigator.vibrate(8)` once per new point crossed, feature-detected, never on iOS, never under reduced motion, throttled to at most one pulse every 40 ms. Release hides the hairline and pill with a 120 ms fade. The pill never leaves the chart card (clamp at both ends). Keyboard: the chart gets `tabindex=0`, left and right arrows move the point, and the pill text is mirrored in an `aria-live="polite"` region.

## Acceptance (headless Chrome, 384 x 832 then 393 x 852, seeded demo profile with 90 days of synthetic weights, one instance, free port, close it after)
- The audit's P8 numbers: ten range switches and two theme switches cause zero `destroy` calls and exactly one constructor in total (instrument `Chart`).
- Dispatched pointer events at 5 x positions put the hairline on the nearest point each time (report the expected and observed dates), the pill stays fully inside the card at the first and last point, a stubbed `navigator.vibrate` receives one call per new point and zero calls with reduced motion emulated or an iOS user agent.
- A vertical drag that starts on the chart scrolls the page (the chart does not swallow it).
- kg and lb labels match the existing conversion.
`node test/syntax-check.mjs` and the five suites pass; `git diff --stat` touches only `fittrack.html`. Do not commit. No frame timing. End the log with `Final report`.
