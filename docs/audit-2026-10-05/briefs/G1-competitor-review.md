# G1: competitor review, the apps that feel best in the category

Read `docs/audit-2026-10-05/RULES.md` first. You are doing research only. You own exactly one output file: `docs/audit-2026-10-05/competitor-review.md`. Do not edit any other file. Helper scripts go in `gemini-scratch/` only.

## Why
Adnan wants FitTrack (a free, offline-first PWA for workouts, nutrition, body weight and GLP-1 dose tracking) to match the smoothness, functionality, UI feel and UX of the best Apple apps. Quote: "I want the best smoothness, functionality, UI feel, UX like apple apps." His own phone is a Samsung Galaxy S26 Ultra on Chrome; friends use iPhones.

## Apps to cover (fan out one subagent per group)
1. Apple first party: Fitness (rings, workout summary, trends), Health (Summary, Highlights, Trends), the watchOS Workout app's summary screens.
2. Strength loggers: Hevy, Strong, Fitbod, Setgraph.
3. Nutrition: MacroFactor, Cronometer, Foodnoms, Lose It!, MyFitnessPal.
4. GLP-1 trackers: find the top three by rating and review count on the App Store and Google Play (Shotsy is a likely one). Verify, do not assume.
5. Design-award and "feel" leaders: Gentler Streak, Bevel, Athlytic, Streaks, Happy Scale, plus Samsung Health (native on Adnan's phone).

## For each app, with every claim tied to a source you actually opened
- Store rating and rating count on App Store and Google Play, with the date you read it and the URL.
- 3 to 6 signature interactions described mechanically: what the user does, what moves, how it moves (spring, fade, sheet, scale), haptic feedback if documented, roughly how long. Example of the level wanted: "Hevy: finishing a set taps the checkmark, the row tints green, the rest timer sheet slides up from the bottom with a countdown ring; the timer persists as a Live Activity."
- What reviewers praise and what they complain about (App Store reviews, Reddit threads such as r/MacroFactor, r/Hevy, r/fitness, design write-ups). Two short paraphrases each, with links.
- Logging speed: taps needed to log a common thing (a set, a meal from history, a weight) if a source states it or a video shows it.

## Then, across all apps
- An "Apple feel" mechanics list: the concrete techniques that make these apps feel smooth (spring physics, bottom sheets with detents, rubber banding, large titles that collapse on scroll, number tickers, chart scrubbing with haptic ticks, swipe-to-delete with undo, context menus, skeletons, optimistic UI). For each: whether it is buildable in a no-build vanilla JS PWA on Chrome Android and iOS Safari, and the web API involved (View Transitions, Web Animations API, `navigator.vibrate`, CSS `scroll-snap`, `overscroll-behavior`, `content-visibility`, etc.). Check current browser support on caniuse or MDN and cite it. Note that `navigator.vibrate` does not work on iOS Safari.
- A ranked top 15 adoptions for FitTrack. Each: the pattern, which apps prove it, the evidence, the effort (S/M/L), and which FitTrack screen it lands on (Home, Workout, Nutrition, Progress, Settings). Respect the rulings in RULES.md: anything on the "no" list is out, say so if a competitor's best feature is one of them.

## Method
- Use `search_web` and `read_url_content`. Open every source you cite. Answering from memory is a failure.
- Fan out with `define_subagent` / `invoke_subagent`, one subagent per app group.
- Write the output file incrementally: append each app section as soon as it is done, so a cut-off keeps what is finished. End with a section headed `Final report`.
- Never invent a rating, a review quote, a person's name or a feature. If you cannot verify, write "unverified".
