# Mobbin references, 2026-10-05

## Status: BLOCKED, no references collected

The Mobbin MCP is connected and its tools load (search_screens, search_flows, search_sections), but every call returned the same error:

> Mobbin MCP requires a paid plan. Upgrade at https://mobbin.com/pricing to continue.

Calls tried: search_screens (deep and standard mode), search_flows. All failed identically, so this is an account-level restriction, not a bad query. No screens, flows or images were returned, so nothing below was seen.

Per the brief (describe only what was actually returned, never invent an app or a detail), all ten topic sections are empty. No plan was purchased and no workaround was attempted. Upgrading the Mobbin plan is the owner's call.

## Topics (all empty, nothing returned)

1. Workout logging: no results.
2. Food search and logging: no results.
3. Body weight trend chart: no results.
4. Today dashboard with rings or progress: no results.
5. Bottom sheets, modals, number entry: no results.
6. Settings, grouped-list style: no results.
7. Medication and injection tracking: no results.
8. Empty states and first-run onboarding: no results.
9. Notification permission priming: no results.
10. Tab bars and top-level navigation: no results.

## Top 12 patterns to adopt

None. A ranked list tied to Mobbin references cannot be written without returned references. Writing one from memory would break the "only what you saw" rule.

## Queries ready to re-run once the plan is active

Use platform ios, output_destination doc, search_screens unless noted.

1. "Hevy workout logging screen with exercise set rows, weight and reps columns, and a checkmark to complete each set"; "Strong active workout with rest timer countdown"; search_flows "logging a workout set and starting a rest timer"; also Fitbod, Ladder, Apple Fitness.
2. "MacroFactor food search results with recent foods and quick add"; also Cronometer, Lose It, MyFitnessPal, Yazio, "re-log a recent food".
3. "body weight trend line chart with range toggle"; also Apple Health, Happy Scale, Withings, "chart scrubbing with a value readout".
4. "daily summary dashboard with activity rings" for Apple Fitness, Gentler Streak, Bevel, Oura, Whoop (skip any readiness score).
5. "bottom sheet with number stepper", "number keypad entry sheet", "wheel picker for weight".
6. "settings screen with grouped list rows and toggles".
7. "medication tracker dose schedule", "injection log with site rotation" for Shotsy, Medisafe, Apple Health Medications (skip any dose optimizer).
8. "empty state for a health tracking app", search_flows "health app first-run onboarding".
9. "notification permission priming screen before the system prompt".
10. "bottom tab bar in a health app".
