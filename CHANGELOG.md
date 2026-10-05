# Changelog

All notable changes to FitTrack are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

FitTrack uses semantic versioning from this baseline. Patches fix defects, minor releases add features, and major releases may break the stored-data schema.

## [Unreleased]

## [1.2.0] - 2026-10-05

FitTrack now moves and responds like a native phone app.

### Added

- Each set opens with what you lifted last time, shown under the row, such as "Last 60 kg × 8".
- One rest bar sits above the tabs with minus and plus 15 s and Skip. Android buzzes when rest is done, and a toast tells you if you are on another tab.
- The screen stays awake during a workout, where the browser supports it.
- Drag across the weight chart to see the date and weight of the nearest weigh-in, with a thin marker line and a small readout. Android gives a light tick on each new point. Arrow keys work too, and a tap shows the value briefly.
- Tap the food search to see your 12 most recent foods with their last serving, and log one in a single tap.
- An empty meal that you logged in the last two weeks offers a one-tap repeat, such as "Repeat Tue · 640 kcal".
- Every food add, repeat and delete shows an Undo button for 5 seconds, so deleting needs no confirmation.
- A "This week" card on Progress with plain counts: gym sessions against your weekly target, and the days you met your protein and water goals.
- Sheets can be dragged down to dismiss. Android Back closes an open sheet first, and focus goes back to what you tapped.

### Changed

- With a calorie floor set, Home and Nutrition lead with the calories left to your floor, then protein, then what remains to your target.
- Tapping a tab now fades in place instead of sliding sideways. A deliberate swipe still slides, but it no longer starts from a text field, the day tabs or an open sheet.
- Every screen keeps its place when you leave and come back, and after small actions such as deleting a meal or toggling creatine.
- Android Back goes to Home first, then leaves the app.
- Rings, bars and numbers show the real value straight away. Logging water, creatine or a meal now animates only the change, and keeps your search, focus and scroll.
- Water stays in step between Home and Nutrition, including when you log it from a notification.
- The workout screen keeps open exercise cards, typed weights, focus and the rest timer when you check a set, finish an exercise or finish the workout. A program update that arrives mid-workout waits for the next session.
- The weight chart updates in place when you change the range or theme instead of redrawing.
- Animations share one set of timings and the same curve as iOS sheets, and the springy overshoot is much smaller. Numbers on Home and Nutrition use fixed-width digits so they stop shifting.

### Fixed

- Nutrition showed one person's carb and fat targets for everyone. It now shows your own targets, or plain grams when none are set.
- Removed the Progress streak row (fire emojis and consecutive days). The weekly card replaces it.
- With Reduce Motion on, the workout progress bar, charts, confetti and delayed animations now stay still.

## [1.1.0] - 2026-09-01

### Added

- User-editable GLP-1 medication, dose, and date schedules with a history summary and per-user dose reminders, replacing the fixed read-only table.
- A light theme, system appearance support, metric and imperial controls, and a status bar that follows the active app background.
- An onboarding motion pass with reduced-motion support.
- Root-page discoverability through a landing redirect, sitemap, robots file, canonical metadata, and structured data.

### Changed

- Moved the whole-session workout action into an evenly spaced progress row, stopped machine tags from squeezing set and rep details, removed dangling separators, and added where-to-find guidance in expanded exercise cards.
- Rewrote exercise and machine names in the workout program for readability.
- Combined whey and creatine logging into one shared supplement control.
- Expanded the food library from 244 to 1,502 entries while retaining per-entry source and confidence labels.
- Ranked food search results using the user's own logging history before popularity tie-breakers.

### Fixed

- Presented notification setup with one Android badge instead of competing icon and badge artwork.
- Preserved canonical kilogram storage when workout weights are displayed and edited in pounds.
- Stopped dose reminders from filling gaps between explicitly confirmed schedule dates.
- Routed new workout, nutrition, dose, onboarding, and reminder accents through light-safe theme tokens.

## [1.0.0] - 2026-08-29

### Added

- Installable mobile PWA with network-first caching and an offline fallback.
- Personal onboarding, metric and imperial display units, editable goals, and local data export.
- Flexible three-session workout program with detrained ramp-in weeks, exercise logging, rest timers, and progress tracking.
- Nutrition, supplement, hydration, and step logging with built-in foods and Open Food Facts search.
- Weight history, a smoothed trend, a projection from logged data, estimated maintenance calories, and resting heart-rate tracking.
- Push reminders for water, workouts, and weigh-ins.
- Activity streaks, calendar history, body-composition summaries, and a settings screen.

[Unreleased]: https://github.com/addyrallxx/fittrack/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/addyrallxx/fittrack/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/addyrallxx/fittrack/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/addyrallxx/fittrack/releases/tag/v1.0.0
