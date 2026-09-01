# Changelog

All notable changes to FitTrack are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

FitTrack uses semantic versioning from this baseline. Patches fix defects, minor releases add features, and major releases may break the stored-data schema.

## [Unreleased]

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

[Unreleased]: https://github.com/addyrallxx/fittrack/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/addyrallxx/fittrack/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/addyrallxx/fittrack/releases/tag/v1.0.0
