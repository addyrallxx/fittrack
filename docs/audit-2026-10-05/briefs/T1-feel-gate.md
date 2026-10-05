# T1: an automated feel gate, so every package is judged by numbers

You work in the MAIN checkout `C:/Users/adnan/projects/fittrack`, but you own ONLY these files: `test/feel.test.mjs` (new), `test/layout-probe.mjs` (you may refactor shared helpers out of it into `test/cdp.mjs`, new), and your log `docs/audit-2026-10-05/logs/T1.log.md`. You must NOT edit `fittrack.html`, `sw.js`, `manifest.json` or anything else: other runs are changing `fittrack.html` in their own worktrees right now. Read `docs/audit-2026-10-05/RULES.md` and `GOAL.md` (the bar section is your spec).

## Why
Several builders are changing the app in parallel. The goal file sets measurable bars; nothing checks them automatically yet. `test/layout-probe.mjs` already drives real Chrome over CDP with no dependencies (Node 24 native WebSocket, free-port scan, seeded data). Build on it.

## What `node test/feel.test.mjs` must do
Serve the app itself (spawn `node serve.mjs` if port 8899 is free, otherwise reuse the running server), launch ONE headless Chrome on a free CDP port, seed the same demo profile `tools/capture-media.mjs` uses (import or copy the seed; never real data), then for each viewport (384 x 832 at DPR 3.75 with an Android Chrome user agent; 393 x 852 at DPR 3 with an iPhone Safari user agent) and each theme (dark, light) visit every screen (Home, Workout, Nutrition, Progress, Settings) and open each sheet that has an obvious trigger, and assert:
1. **No layout-property motion.** Walk `document.getAnimations()` plus every element's computed `transition-property` in the visited state: any of `height`, `max-height`, `width`, `top`, `left`, `right`, `bottom`, `margin*`, `padding*`, `box-shadow` (and `all` with a nonzero duration) is a failure, reported with a selector path. Allow-list nothing silently; if a legacy case must pass for now, it goes in an explicit `KNOWN` array in the test with a comment naming the package that will fix it.
2. **Hit targets.** Every visible interactive element (button, a, input, select, textarea, `[onclick]`, `[role=button]`, `[role=switch]`, `[tabindex]`) has a hit box of at least 44 x 44 CSS px, measured as the element's rect unioned with any `::before`/`::after` hit-area extension it declares, and confirmed with `elementFromPoint` at the box centre returning the element or a descendant. Failures list selector, size and screen. Use a `KNOWN` array the same way (the audit's F07/F08 list is the expected initial set; package P5 will empty it).
3. **No horizontal overflow** on any screen (`scrollWidth <= clientWidth + 1` on the screen and the document).
4. **Tabular numbers.** Every element whose text matches a number and that has a class containing `val`, `num`, `big`, `ring`, `cal`, `count` or `stat` computes `font-variant-numeric` containing `tabular-nums` (`KNOWN` array allowed, P5 empties it).
5. **No console errors** except the known service-worker registration failure in automation, matched exactly.
6. **Reduced motion.** With `prefers-reduced-motion: reduce` emulated, every running animation and transition has a duration of at most 1 ms.
Print a compact table per screen and viewport, then `VERDICT: PASS` or `VERDICT: FAIL (n)` exactly like the other suites, exit code 0 or 1. The `KNOWN` entries are reported as `known` rows, not failures, so the gate is green today and catches regressions; every `KNOWN` row must name its fixing package.

## Acceptance
`node test/feel.test.mjs` runs end to end on today's main in under 3 minutes, closes Chrome and the server it started, and prints the table. Paste its output in your log. The existing five suites still pass. Do not commit. End the log with `Final report` listing every `KNOWN` entry.
