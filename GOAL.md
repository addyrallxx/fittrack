# GOAL: a fitness app that feels like Apple made it, on the phone in your pocket

This file is the standing objective for this repo. It survives session resets.
Read order for a cold start: `GOAL.md` (this file), then `NEXT-SESSION.md`
(current state), then `CLAUDE.md` (rules that bite).

## The objective, in Adnan's words

> "I want the best smoothness, functionality, UI feel, UX like apple apps."

> "mobile first, android and ios, I might never publish it but I want it
> perfected over time. desktop, pc variant is optional only after we properly
> refine it and properly set up the mobile app."

> "I wanna make it a capability project that I can showcase on my portfolio ...
> I don't want to make fittrack a running app on the app stores or start selling
> it ... I'll still be the main user and its going to be a fitness app for me that
> satisfies all my goals and requirements and I never have to pay for anything
> similar." (2026-10-05)

So: FitTrack is a portfolio-grade passion project with one main user. Publishing
to stores and selling are not goals; polish, engineering quality a reviewer can
read, and Adnan's own needs are. The public repo carries no personal data (his
profile lives on his device), and the structure follows `docs/adr/0001-portfolio-grade-structure.md`.
Publishing is not the goal, polish is. The work never "finishes"; it gets
measurably better every session, one shipped chunk at a time.

## Platform order

1. Samsung Galaxy S26 Ultra, Chrome on Android. CSS viewport 384 x 832, 120 Hz.
2. iPhone, Safari. CSS viewport 393 x 852.
3. Desktop: out of scope until Adnan says the phone app is done. Do not spend
   effort on wide layouts.

## The bar (acceptance criteria, all measured, none "looks good")

**Motion and smoothness**
- Every animation moves only `transform` and `opacity`. Zero layout-property
  animations (height, width, top, margin, box-shadow) anywhere.
- Every tap shows feedback in the same frame (press state), whatever the work
  behind it.
- A routine update (log water, check a set) never replays a ring or counter
  from zero: it animates the delta only.
- Tab switches are calm and fast (no lateral slide on a tab tap, 200 ms or
  less); drill-downs and sheets carry spatial motion.
- Sheets use the iOS sheet curve (`cubic-bezier(0.32, 0.72, 0, 1)`, about
  350 ms), no overshoot, and close by drag with velocity.
- Scrolling stays at the display rate: no scroll-driven layout work, long
  lists use `content-visibility`.
- `prefers-reduced-motion` turns movement into fades everywhere.

**Touch and input**
- Every interactive target is at least 44 x 44 CSS px.
- The primary action of each screen sits in the thumb zone (bottom 40 percent).
- Every numeric field opens a numeric keypad (`inputmode`) with a sensible
  `enterkeyhint`; the keyboard never covers the active field.
- Haptic ticks on Android (`navigator.vibrate`, feature-detected, 8 to 15 ms)
  on set check, log and toggle. iOS gets visual feedback only unless a
  supported native control provides haptics.
- Every number that changes uses `tabular-nums`.

**Truth and rulings**
- No hardcoded target, unit or person-specific value in the UI (the
  `210g` and `65g` macro targets found 2026-10-05 are the type specimen).
- The "what not to build" rulings in
  `docs/research/competitive-and-design-plan.md` section 5 hold: no streaks,
  badges or points (the Progress streak row found 2026-10-05 violates this),
  no social, no opaque scores, no AI coach, no dose maths.
- Nutrition leads with the floor for GLP-1 users (backlog item 1).

**Architecture (never traded for any of the above)**
Single file, no build step, classic scripts, network-first service worker,
kilograms in storage, free hosting only. See `CLAUDE.md`.

## How work ships

- One concern per commit. `node test/syntax-check.mjs` plus every suite in
  `NEXT-SESSION.md` "Testing" green before each commit.
- Push to `main` deploys GitHub Pages. Verify the live URL after each push.
- Each chunk is verified at 384 x 832 in real Chrome with numbers (bounding
  boxes, computed styles, animation property audits), one confirming
  screenshot at most.
- Device check on the S26 Ultra whenever Adnan has it in hand; nothing
  device-facing is called done on emulation alone.

## Where the plan lives

- Wave plans, briefs, audits and logs: `docs/audit-<date>/`.
- Research: `docs/research/`, plus `docs/audit-2026-10-05/competitor-review.md`,
  `design-critique.md`, `codex-feel-audit.md`, `mobbin-references.md`.
- The showcase reel: `C:/Users/adnan/projects/motion-studio`
  (`src/projects/fittrack/`). Re-capture the app after each UI wave with
  `node scripts/capture-fittrack.mjs` so the reel never shows an old UI.

## Progress (updated 2026-10-05, end of wave 2)

| Criterion | Status | Evidence |
|---|---|---|
| Only transform and opacity animate | Met for every screen the feel gate visits; legacy `transition: all` on `.tab-icon`, `.ci-card`, `.ci-check`, `.range-tab` is listed as KNOWN | `test/feel.test.mjs` |
| Same-frame press feedback | Partial: P5 touch contract still open | audit F09 |
| No replay from zero on routine updates | Met on Home and Nutrition (P4); Workout updates in place (P3) | commits 103ca4d, 9d1d71e |
| Calm tab switches, spatial drill-downs | Met: 160 ms fade-through on tap, swipe slides | c9357ee |
| iOS-curve sheets, drag to dismiss, Back closes | Met: native dialogs | P6 commit |
| Scroll at display rate, content-visibility | Open: P9 | audit F15, F16 |
| Reduced motion everywhere | Met and gated | 447dc86, 5248128 |
| 44 x 44 targets | Partial: new controls comply; legacy targets listed as KNOWN for P5 | feel gate |
| Primary action in the thumb zone | Partial: undo toast and rest bar comply; screen-level audit pending | |
| Numeric keypads, enterkeyhint, keyboard never covers | Open: P7 | audit F12 |
| Android haptics | Partial: chart scrubbing; set check and rest end in F1 (pending merge) | f57f28e |
| tabular-nums on changing numbers | Met on Home, Nutrition, weekly summary, chart pill; legacy list in KNOWN | feel gate |
| No hardcoded targets | Met for macros | 6904ba5 |
| No streaks or scores | Met | 6904ba5 |
| Floor-first nutrition for GLP-1 users | Open: F3 | research backlog item 1 |
| Device check on the S26 Ultra | Not done yet | needs Adnan's phone |

Overnight 2026-10-05 to 06 (autopilot, unreviewed until morning): F1 verify, F3 floor-first, P7 input ergonomics, P9 storage and startup, reel v2 (3D iPhone 18 Pro Max, new score), a Gemini goal audit with new upgrade ideas, an adversarial review of wave 2, and food sourcing batches. See `docs/audit-2026-10-05/overnight/`.
