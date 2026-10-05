# ADR 0001: a portfolio-grade structure, still free and build-free

Date: 2026-10-05. Status: accepted.

## Context

FitTrack began as a fun single-file project. Adnan, 2026-10-05: "I wanna make it
a capability project that I can showcase on my portfolio ... I don't want to make
fittrack a running app on the app stores or start selling it ... I'll still be the
main user and its going to be a fitness app for me that satisfies all my goals and
requirements and I never have to pay for anything similar. fix the structuring
accordingly if needed."

Two consequences. The code is now read by people judging engineering skill, so a
243 KB `fittrack.html` holding markup, 600 lines of CSS and 2,800 lines of
classic-scope JavaScript wired through inline `onclick` reads as a prototype. And
the public repo must carry no personal data: Adnan's profile lives on his device.

## Decision

Keep what still serves the goal; change what only served a weekend project.

Kept: no build step, no bundler, no framework, no runtime dependencies beyond
Chart.js; static hosting on GitHub Pages; the network-first service worker;
kilograms in storage; free forever; `fittrack.html` stays the entry URL
(`start_url` must never change after installs exist).

Changed, in phases, each gated by the feel gate and the unit suites:

1. **A1 split:** CSS to `css/`, JavaScript to `js/` as classic scripts loaded in
   order. No behaviour change; the shell HTML becomes readable.
2. **A2 domains:** split the script by domain (storage, units, motion, sheets,
   navigation, home, workout, nutrition, progress, settings, onboarding, push,
   foods, chart).
3. **A3 modules:** native ES modules, and delegated `data-action` handlers in
   place of inline `onclick`, which then allows a strict Content-Security-Policy.
4. **A4 proof:** GitHub Actions CI running the suites and the feel gate on every
   push, JSDoc types checked with `tsc --noEmit` (dev-only, no output), an
   architecture page and these ADRs.

Feature work pauses while A1 to A3 land, so the split never races a feature branch.

## Consequences

The repo reads like a deliberate small app instead of a prototype, the README can
later show architecture and CI badges honestly, and personal data never ships.
The cost is one careful migration; the feel gate and unit suites are the safety net,
and every phase ships on its own (the April 2026 black screen came from a
big-bang commit, never again).
