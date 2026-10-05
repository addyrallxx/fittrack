# P1: motion contract

You work in the git worktree `C:/Users/adnan/projects/ft-wt/p1` (branch `wave2/p1`, cut from main). All edits happen there. The main checkout `C:/Users/adnan/projects/fittrack` is read-only for you, except your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/P1.log.md`.

Read first: `docs/audit-2026-10-05/RULES.md`, then `docs/audit-2026-10-05/codex-feel-audit.md` sections 1 (the transition inventory), 2 (F04, F18, F19) and 3 (package P1, which is your exact scope and acceptance list). `GOAL.md` has the bar.

## Scope
Exactly package P1 from the audit: token declarations near the `:root` block, the reduced-motion block, `obShowError`, `launchConfetti`. You own those regions of `fittrack.html` only. Another run (F20a) is editing the macro bars in `renderNutrition` and the streak row in `renderProgress` at the same time in its own worktree; stay out of those.

## Decisions already made (do not re-litigate)
- Four duration roles: press 120 ms, navigation 200 ms, sheet 350 ms, data 550 ms. Name them `--dur-press`, `--dur-nav`, `--dur-sheet`, `--dur-data`.
- Easings: `--ease-out` `cubic-bezier(0.22, 1, 0.36, 1)` (the existing `--ease-data`, keep that name as an alias), `--ease-sheet` `cubic-bezier(0.32, 0.72, 0, 1)` (the iOS sheet curve, no overshoot), `--ease-press` `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, and `--spring` redefined as a CSS `linear()` spring with gentle overshoot (no more than 4 percent) behind an `@supports` check, keeping a cubic-bezier fallback. The current `--spring` overshoots 11 percent; reduce it, and note in your log every selector that uses it so later packages can re-point them.
- A JS helper `prefersReducedMotion()` reading a single cached `matchMedia` that updates on change, defined before any startup code calls it.
- Do not rewrite every transition in the file. Later packages consume the tokens in their own regions.

## Acceptance (paste the evidence in your log)
Everything in the audit's P1 acceptance list, plus: `node test/syntax-check.mjs` and the five suites pass in the worktree; `git -C C:/Users/adnan/projects/ft-wt/p1 diff --stat` touches only `fittrack.html`; a headless Chrome check at 384 x 832 (one instance, free port, close it after) confirms the computed values of the four duration tokens and that `launchConfetti()` under emulated reduced motion appends zero `.cp` nodes. Do not commit. End the log with `Final report`.
