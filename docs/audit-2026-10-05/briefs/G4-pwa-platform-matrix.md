# G4: what an installed PWA can actually do on a 2026 phone

Read `docs/audit-2026-10-05/RULES.md` first. Research only. You own exactly one file: `docs/audit-2026-10-05/pwa-platform-matrix.md`. Do not edit anything else; helper scripts go in `gemini-scratch/`.

## Why
FitTrack is an installed PWA (Add to Home Screen) that must feel native. Primary: Samsung Galaxy S26 Ultra, current Chrome on Android, One UI. Secondary: current iPhone, iOS Safari (home screen web app). Builders need to know, per API, what really works in an INSTALLED PWA on each, today, so they build progressive enhancement correctly and never ship a dead feature.

## The matrix (one row each; Chrome Android installed, iOS Safari home-screen app; status, minimum version, gotchas, a cited source you opened: MDN, caniuse, WebKit or Chrome release notes, web.dev)
1. View Transitions API, same-document.
2. Vibration API (`navigator.vibrate`), and any working iOS haptic route for web apps (for example the `switch` attribute on checkbox inputs in Safari 18+: does toggling it give haptic feedback, also inside a home-screen web app?).
3. Screen Wake Lock API (keep the screen on during a workout).
4. Web Push in an installed PWA (iOS 16.4+ home-screen requirement), notification actions, badges (Badging API).
5. `interactive-widget` viewport meta (`resizes-content`, `resizes-visual`, `overlays-content`) and `visualViewport` for keeping a focused input above the keyboard.
6. Back gesture and history in an installed PWA (Android predictive back with `popstate`, iOS edge swipe in standalone mode).
7. `overscroll-behavior`, pull-to-refresh suppression, rubber banding in standalone mode.
8. Safe areas (`env(safe-area-inset-*)`, `viewport-fit=cover`), status bar color (`theme-color` with media queries for light and dark), `apple-mobile-web-app-status-bar-style`.
9. CSS `linear()` easing, `@starting-style`, `transition-behavior: allow-discrete`, `content-visibility`, scroll-driven animations (`animation-timeline`).
10. Popover API and `<dialog>` with `showModal()` (focus trap, Escape, backdrop, inertness).
11. `inert` attribute.
12. Web Share API and Web Share Target (sharing a progress image).
13. App shortcuts in the manifest (long-press icon), `display_override`, `launch_handler`.
14. Storage persistence (`navigator.storage.persist()`), eviction rules for home-screen apps on iOS (the 7-day script-writable storage cap and whether installed apps are exempt).
15. Anything else a fitness app would want that changed in the last 12 months.

## Then
A short "build guidance" section: for each of these planned features, the recommended API path and fallback: keep the screen awake during a workout; haptic ticks on set check and chart scrubbing; Android Back closing an open sheet before leaving the screen; the keyboard never covering a numeric field in a bottom sheet; tab transitions.

## Method
Use `search_web` and `read_url_content`; open every source you cite. Fan out subagents, about 4 rows each. Write the file incrementally, end with `Final report`. If something cannot be confirmed for an installed PWA specifically (as opposed to a browser tab), say "unconfirmed for installed mode". Never invent a version number.
