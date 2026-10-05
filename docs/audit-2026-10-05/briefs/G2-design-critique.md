# G2: visual and UX critique of FitTrack as it ships today

Read `docs/audit-2026-10-05/RULES.md` first. You own exactly one output file: `docs/audit-2026-10-05/design-critique.md`. Do not edit any other file. Helper scripts go in `gemini-scratch/` only.

## Why
Adnan: "I want the best smoothness, functionality, UI feel, UX like apple apps." You are the outside reviewer. Be specific and unsentimental.

## Inputs
- Screenshots of the shipped v1.1.0 app from a seeded demo profile: `docs/screenshots/home-dark.png`, `home-light.png`, `workout.png`, `nutrition.png`, `progress.png`, `settings.png`, `notifications.png`. Open and look at every one.
- The tour GIF `docs/media/fittrack-tour.gif` if you can read it.
- The app's design direction: `docs/research/competitive-and-design-plan.md`, sections 4 (Visual and motion direction) and 5 (What not to build).
- The live app: https://addyrallxx.github.io/fittrack/fittrack.html (read it if you can render it; screenshots are enough otherwise).

## What to produce
1. Per screen, a ranked list of concrete defects against Apple-quality apps (Apple Fitness and Health, MacroFactor, Hevy, Gentler Streak are the bar). For each: where on the screenshot (region and element), what is wrong, the fix with exact values (px sizes, weights, colors as hex, spacing on a 4 or 8 px grid, radius), and why it matters. Cover hierarchy, typography scale and weights, number presentation (tabular figures, units), spacing rhythm, alignment, density, color use and contrast, touch target sizes (44 x 44 pt minimum), icon consistency, empty states, and what draws the eye first.
2. Cross-screen consistency problems: card styles, header patterns, button styles, list rows that differ for no reason.
3. Motion opportunities you can infer from the static UI: where a transition, a press state, a number tick, or a sheet would make it feel native. Keep to what the design doc allows.
4. A short "first 10 fixes" list ranked by visible improvement per unit of effort.

## Rules
- Everything you claim must be visible in the screenshots or present in the doc. Do not invent features, people or numbers.
- Do not recommend anything on the "no" list in RULES.md.
- Write the output file incrementally, one screen at a time, ending with a section headed `Final report`.
