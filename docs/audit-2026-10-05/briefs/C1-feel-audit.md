# C1: smoothness and feel audit of fittrack.html (read-only)

Read `docs/audit-2026-10-05/RULES.md` first. This run is READ-ONLY on source. You own exactly two files: the report `docs/audit-2026-10-05/codex-feel-audit.md` and your log `docs/audit-2026-10-05/logs/C1.log.md`.

## Why
Adnan: "I want the best smoothness, functionality, UI feel, UX like apple apps." The next wave will be several Codex builders working in parallel git worktrees on `fittrack.html`. Your report is their map. It has to be precise enough that each builder can start without re-reading the whole file.

## Read
`fittrack.html` (all of it, about 3,150 lines), `sw.js`, `manifest.json`, `NEXT-SESSION.md` sections "Architecture" and "Storage", and `docs/research/competitive-and-design-plan.md` sections 3, 4 and 6.

## Report sections
1. **Map.** Every screen and how navigation works (`go(idx)` and friends), every sheet, modal, toast, list, chart, input and button family, with line ranges. Every existing transition and keyframe animation (there are about 51 `transition` and 5 `@keyframes`), what each animates and whether it is compositor-only (transform, opacity) or not.
2. **Defects against the bar**, each with line refs and severity:
   - Jank: animating layout properties (height, width, top, margin, box-shadow), forced synchronous layout (reads after writes), whole-screen `innerHTML` re-renders on a single tap that drop scroll position or focus, non-passive scroll or touch listeners, Chart.js instances recreated instead of updated, heavy work on the main thread at startup.
   - Touch feel: missing press states, `-webkit-tap-highlight-color`, `touch-action`, accidental pull-to-refresh or overscroll glow, double-tap zoom, hit targets under 44 x 44 px, buttons that give no feedback until work finishes.
   - Input ergonomics: `inputmode`, `enterkeyhint`, `autocomplete`, numeric keypads for numbers, the keyboard covering the active field.
   - Visual stability: numbers without `font-variant-numeric: tabular-nums`, layout shift when data loads, fonts.
   - Accessibility of motion: `prefers-reduced-motion` coverage, focus-visible.
   - Navigation feel: screen changes that jump instead of transition, no back-gesture or history integration, scroll position lost between screens.
3. **Work packages.** 6 to 10 packages, ONE concern each, each sized for a single Codex run of under 150k tokens. Candidate themes: a motion token system (durations, easings, a spring curve via CSS `linear()`), press-state and haptics layer (`navigator.vibrate` on Android only, feature-detected), screen transitions (View Transitions API with fallback), bottom-sheet component with drag-to-dismiss, number ticker for stats, list row swipe or long-press actions, render-path fixes (targeted updates instead of full re-render), input ergonomics, chart polish. For each package: the exact line ranges and function names it will touch, which other packages it conflicts with, and numeric acceptance criteria measurable in headless Chrome at 384 x 832 (for example: "zero animations on non-compositor properties in this region", "tapping a set row re-renders only that row: MutationObserver count of replaced nodes <= 3", "screen change takes 250 to 350 ms and keeps scroll position on return"). Order them so packages touching disjoint regions can run in parallel.

## Rules
- Do not modify any file other than your two. Do not run a browser; this is a reading audit.
- Append to the log after each section. End the report with `Final report`: the top five packages in recommended order and the parallel groups.
