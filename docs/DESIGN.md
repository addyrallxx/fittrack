# FitTrack design system

Recorded from the current checkout on 2026-10-09. This is a documentation baseline, not a redesign or a claim of live/device verification. Existing locked, decided and approved choices win over blueprint suggestions.

Sources: `fittrack.html` (inline CSS, final P5 overrides and render functions), `docs/research/competitive-and-design-plan.md` (especially sections 4 and 5), `docs/audit-2026-10-05/design-critique.md`, `GOAL.md`, `CLAUDE.md`, `AGENTS.md`, `NEXT-SESSION.md`. The critique describes v1.1.0; its recommendations and older handoff queues are not evidence of today's shipped values. Read the CSS cascade through its final overrides.

## Overview

A calm, local-first fitness instrument for Adnan, then friends and family. Samsung Galaxy S26 Ultra in Android Chrome comes first, iPhone Safari second. Five app screens: Home, Workout, Nutrition, Progress, Settings. Desktop adaptation waits for Adnan's direction. Free, accountless, no ads or paid tools. Keep `fittrack.html` as the entry, classic scripts until the planned module phase, no build step, and network-first GET handling.

Nutrition uses saved targets and shows the energy floor for GLP-1 users. Weight is stored in kg and converted only for display. Dose UI shows only user-stored dates and doses. No inferred schedule, medical recommendations, opaque readiness score, streaks or social ranking. Public renders use synthetic data only.

## Colors

Exact source values below. Light appearance overrides surfaces and readable accent text, not the bright fill palette. Multiple metric colors and the existing orange/coral identity stay; the blueprint's one-accent rule does not authorize recoloring.

| Token | Dark | Light | Job |
|---|---|---|---|
| `--black` | `#000000` | `#F2F2F7` | Page and safe areas |
| `--s1` | `#111111` | `#FFFFFF` | Cards, sheets |
| `--s2` | `#1C1C1E` | `#EDEDF2` | Inputs, inset surfaces |
| `--s3` | `#2C2C2E` | `#DFDFE6` | Tracks, secondary buttons |
| `--s4` | `#3A3A3C` | `#C7C7CC` | Raised surface |
| `--t1` | `#FFFFFF` | `#000000` | Primary text |
| `--t2` | `#AEAEB2` | `#48484A` | Secondary text |
| `--t3` | `#8E8E93` | `#5C5C60` | Metadata and placeholders |
| `--t4` | `#5A5A5E` | `#949498` | Decoration only |
| `--border` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.08)` | Hairlines |
| `--border2` | `rgba(255,255,255,0.13)` | `rgba(0,0,0,0.14)` | Stronger hairlines |
| `--tabbar-bg` | `rgba(15,15,15,0.94)` | `rgba(255,255,255,0.85)` | Translucent navigation |

| Fill token (both themes) | Hex | Dark text alias | Light text override | Existing role |
|---|---|---|---|---|
| `--orange` | `#FF9500` | `--orange-text:var(--orange)` | `#9C4D00` | Brand, navigation, primary actions, energy |
| `--coral` | `#FF6B6B` | `--coral-text:var(--coral)` | `#C23131` | Protein |
| `--blue` | `#0A84FF` | `--blue-text:var(--blue)` | `#0B5FA5` | Workout controls |
| `--blue-light` | `#4FC3F7` | `--blue-light-text:var(--blue-light)` | `#0B5FA5` | Water |
| `--green` | `#30D158` | `--green-text:var(--green)` | `#1C7A34` | Steps, completion |
| `--purple` | `#BF5AF2` | `--purple-text:var(--purple)` | `#8A3FC4` | Weight and body composition |
| `--red` | `#FF453A` | `--red-text:var(--red)` | `#C22A20` | Destructive actions and errors |
| `--yellow` | `#FFD60A` | No text alias | No override | Supporting emphasis |

Alpha tokens are also shipped values, not a new palette:

- `--orange-dim:rgba(255,149,0,0.18)`, `--orange-wash:rgba(255,149,0,0.08)`, `--orange-border:rgba(255,149,0,0.25)`.
- `--coral-dim:rgba(255,107,107,0.18)`, `--coral-border:rgba(255,107,107,0.25)`.
- `--blue-dim:rgba(79,195,247,0.18)`, `--blue-wash:rgba(10,132,255,0.07)`, `--blue-border:rgba(79,195,247,0.25)`.
- `--green-dim:rgba(48,209,88,0.18)`, `--green-wash:rgba(48,209,88,0.06)`, `--green-faint:rgba(48,209,88,0.03)`, `--green-border:rgba(48,209,88,0.25)`.
- `--purple-dim:rgba(191,90,242,0.18)`, `--purple-border:rgba(191,90,242,0.25)`, `--red-dim:rgba(255,69,58,0.12)`.
- Light overrides: `--orange-wash:rgba(156,77,0,0.08)`, `--blue-wash:rgba(11,95,165,0.07)`, `--green-wash:rgba(28,122,52,0.06)`, `--green-faint:rgba(28,122,52,0.03)`, `--red-dim:rgba(194,42,32,0.12)`.

The research proposes orange for workout and neutral/yellow for energy. The current workout still uses blue. Record that disagreement, do not silently apply the proposal.

## Typography

Keep the installed system stack: `-apple-system,'SF Pro Display','SF Pro Text','Roboto',system-ui,sans-serif`. No downloaded font or new font family. Body is 16px with line-height 1.4. Inputs inherit the family. Global body and form fields use tabular numerals.

Existing sizes are component values, not a newly normalized scale: screen title 28px/700/1.15, subtitle 13px, energy headline 32px/800/1.15, sheet title 18px/700, input and sheet button 16px, help copy 16px/1.6, onboarding prose 16px/1.55, empty copy 16px/1.5, uppercase section label 11px/600 with 0.8px tracking, tab label 10px/500. Small labels remain compact; explanatory prose meets the 16px floor.

## Layout

Full viewport shell (`100vw`, `100dvh`), independently scrolling screens. Most cards use `margin:0 16px 12px`; header uses `padding:18px 20px 10px`. Quick log has four columns and 8px gaps; check-ins have three columns and 8px gaps. No shipped page-gutter token or prose `ch` limit.

`--tab-h:64px`; `--safe-b:env(safe-area-inset-bottom,16px)`; `--safe-t:env(safe-area-inset-top,0px)`. Screen bottom clearance is tab height plus safe bottom plus 20px. Native sheets cap at `92dvh` by default and account for the keyboard. Preserve safe areas and bottom reachability.

## Elevation and depth

Cards use `--s1` and 1px `--border`, inset controls use `--s2`/`--s3`. Tab bar blur is 20px. Dialog backdrop is `rgba(0,0,0,0.72)`. Toast uses `--s2`, `--border2`, and `0 8px 32px rgba(0,0,0,0.5)`. Do not add decorative shadows or borders to every nested row.

## Shapes

`--r-sm:10px`, `--r-md:16px`, `--r-lg:20px`, `--r-xl:28px`. Cards commonly use 20px, compact controls 16px, sheets 28px top corners. Supplement icon chips are 40px with 12px radius. Keep these exceptions, do not replace them with an imposed 8-point grid.

## Components

- Final P5 rules set ordinary button, link, input and switch minima to 48px in both dimensions. Header, sheet close, meal delete, set check and calendar arrows are explicit 48px boxes. Sheet buttons have 52px minimum height.
- Calendar remains seven columns with 2px gaps and 48px height. The grid and day headings reclaim 7px of inner padding on each side, giving 44px cell width at 372px and 45.71px at 384px.
- Settings rows have 54px minimum height and grouped dividers. Supplements share one card, 64px rows, 40px icon chips and a trailing action. Preserve this approved grouping.
- Workout muscle metadata sits below the movement name, with one trailing completion/chevron slot. Set rows have a 48px completion column. A single docked rest bar accompanies exact prior-set recall.
- Primary sheet buttons use orange fill with `#111111` text; active workout tabs and incomplete exercise actions use blue with the same text. Selected purple range and weight-unit buttons also use `#111111`.
- Native dialogs handle modal focus, Back and drag dismissal. Food log supports recent/repeat actions and Undo. Progress uses a reusable Chart.js canvas with loading/unavailable copy.

## Motion

| Token | Shipped value |
|---|---|
| `--dur-press` | `150ms` |
| `--dur-nav` | `200ms` |
| `--dur-sheet` | `300ms` |
| `--dur-data` | `550ms` |
| `--ease-out` | `cubic-bezier(0.22,1,0.36,1)` |
| `--ease-sheet` | `cubic-bezier(0.32,0.72,0,1)` |
| `--ease-press` | `cubic-bezier(0.25,0.46,0.45,0.94)` |
| `--ease-data` | `var(--ease-out)` |
| `--smooth` | `var(--ease-press)` |
| `--spring` fallback | `cubic-bezier(0.22,1,0.36,1)` |
| `--spring` when `linear()` supported | `linear(0,0.2 10%,0.55 22%,0.82 36%,0.97 50%,1.03 64%,1.015 78%,1 100%)` |

Tab taps fade through in 160ms; gesture swipes slide in 240ms. Routine data updates animate the delta, never count from zero. Common press scale is 0.98 or a surface/opacity change. Reduced motion globally reduces CSS timing to 0.01ms and removes delays; JS reads the live `MediaQueryList` via `prefersReducedMotion()`. Sheets meet the 300ms floor ceiling. The 550ms data-chart reveal remains an accepted exception.

## Iconography and voice

Shipped icon source is the inline `I` map via `svgIcon()` (default 22px, 1.8px stroke), with component-specific sizes/strokes and some emoji. No named external icon family is recorded. App mark source is `assets/icon.svg`: one 300-degree orange/coral arc with three ascending white bars, rendered by `tools/render-icons.mjs`; keep the approved mark and separate maskable assets. No logo replacement is authorized.

Voice: calm, factual, direct. Explain saved facts and the next action. Missed days are neutral. Never invent a health score, achievement, estimate confidence or dose.

## Design protocol (Jack Roberts blueprint, 2026-10-09)

Precedence: this file (including existing locked, decided and approved choices), then `C:/Users/adnan/.claude/CLAUDE.md` section "Design task protocol", then taste skills. Blueprint conflicts are flagged for Adnan, never silently fixed. Existing tokens, fonts, spacing and component decisions remain intact.

Zero-dollar rule: Linearity, Mobbin, Refero, Higgsfield and Kie.ai are excluded, including paid connectors, trials and generation APIs. Use existing local assets, public reference pages and subscription-covered tools only. No purchases or new infrastructure.

### FitTrack bar.md

This embedded bar is the baseline for a future task's `bar.md`, not an additional file created by this documentation task. References already recorded in the research: [Apple Health Summary](https://support.apple.com/guide/iphone/view-your-health-data-iphe3d379c32/ios), [Samsung One UI layout](https://developer.samsung.com/one-ui/layout/basic.html), [One UI motion](https://developer.samsung.com/one-ui/motion/basic.html), [Hevy workout tracking](https://www.hevyapp.com/features/track-workouts/), [MacroFactor food logging](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor). These are recorded references, not freshly operated competitor apps. Numbers below are FitTrack measurements/contracts, not claimed competitor measurements.

1. Hierarchy (Apple Health): a 28px/700 screen title and 32px/800 energy headline separate title, leading fact and detail. For GLP-1 Home/Nutrition, show the saved floor shortfall before ceiling distance, with one clear next action.
2. Grouping (One UI): retain 16px card insets, 20px focus-card radii, 54px Settings rows and 64px supplement rows with 1px dividers. Supplements remain one shared block, not two floating cards.
3. Metric color (Apple Health): protein coral, hydration light blue, weight purple, completion green. Every colored state includes at least one text label or glyph; no color-only success/failure signal. Keep current workout blue until a separately authorized change.
4. Reach (One UI): show five bottom navigation destinations in the 64px bar plus safe area. Routine targets are 48px; the leading action should sit in the bottom 40% of the viewport. Flag calendar exceptions rather than hiding them.
5. Workout continuity (Hevy): display one previous weight/reps pair per set, one visible docked rest timer, and a 48px completion target. Completing a set must preserve typed inputs and the expanded movement.
6. Logging economy (MacroFactor): expose Recent/Repeat before new food search; repeat a saved meal in at most two deliberate taps. Retain visible source-confidence labels and Undo after deletion.
7. Motion (One UI): tab taps use a 160ms fade, swipes a 240ms slide, sheets a 300ms non-overshooting curve, data deltas 550ms. Press scale stays at least 0.98. No count-up replay on a routine log; reduced motion settles immediately.

Before future UI work: name the screen's one job in ten words or fewer, choose one exact reference view, fetch/render it, and identify missing inputs or a blind critic. Check the vault's `wiki/resources/21st-components/_index.md` situation table before building UI. Pick one direction skill. Show the task bar before building, honoring the session's existing authorization. Borrow structure, never copy words, logos or artwork; credit the reference in a comment. For a large brand surface, compare three directions from safest to boldest; for a small edit, make one. Use the raw five-versions and one-screen-test templates for simplification, counting fields, buttons, links and words. Do not create an account/signup flow to satisfy a template.

### Floors audit

Source audit only, not a fresh browser or physical-device pass. Contrast was recomputed with sRGB linearization and WCAG relative luminance: `(Llighter + 0.05)/(Ldarker + 0.05)`, rounded to two decimals. Opaque text/background pairs only; alpha washes and opacity require compositing in a later rendered audit.

| Floor | This system's value | Pass/fail/unknown |
|---|---|---|
| Text 4.5:1, primary/secondary | Dark `--t1`/`--t2` on `--black`/`--s1`/`--s2`: 21.00/18.88/17.01 and 9.50/8.54/7.69. Light: 18.82/21.00/18.00 and 8.18/9.12/7.82 | PASS for these pairs |
| Text 4.5:1, metadata | Dark `--t3 #8E8E93` on black/s1/s2: 6.44/5.79/5.22. `.conf-est` now uses `--t2 #AEAEB2` on `--s3 #2C2C2E`: 6.30 (was 4.27); light `#48484A` on `#DFDFE6`: 6.88. Light t3 on page/s1/s2: 5.97/6.66/5.70 | PASS for these pairs |
| Text 4.5:1, filled actions | `#111111` on orange `#FF9500`: 8.59 (was white 2.20); on blue `#0A84FF`: 5.18 (was 3.65); on purple `#BF5AF2`: 5.36 (was 3.52). Both themes retain fills. Finish gradient endpoint `#FF6B35`: 6.66; steps green `#30D158`: 9.34 | PASS for these pairs |
| Text 4.5:1, accent text | Dark orange/coral/blue/light-blue/green/purple/red on s1: 8.59/6.80/5.18/9.42/9.34/5.36/5.54. Light text overrides on page: 5.42/4.98/5.89/5.89/4.85/5.24/5.16 | PASS for these pairs; UNKNOWN for all washes/raised surfaces |
| Decoration is not readable text | t4 dark on black/s1: 3.06/2.75; light on page/s1: 2.71/3.02. Source restricts t4 to decoration | PASS for intended use only; not a text token |
| Taps at least 44 x 44px | Most final rules use 48px, sheet buttons 52px. Calendar grid reclaims 14px total inner padding: calculated width 44px at 372px and 45.71px at 384px (was 42/43.71px), height 48px | PASS in source geometry: calendar at audited widths; other runtime hit boxes UNKNOWN |
| Body at least 16px | Base body and `.ob-p`, `.help-sheet-copy`, `.empty-txt` are 16px (prose was 14px) | PASS for these classes |
| Prose line length 45 to 75ch | No `ch` constraint; viewport-width cards with fixed insets. No rendered character-width measurement performed | UNKNOWN; compact labels are not prose columns |
| Five states per control | Default component styles; pointer hover uses a 2px outline; focus-visible uses the accent outline; active uses an accent outline and existing press scales without fading text; disabled and aria-disabled use 0.6 opacity and block pointer interaction | PASS in source: five-state shared matrix |
| Designed empty states | Meal empty has Add meal instruction; chart has empty/loading messages. No complete five-screen empty-state inventory or action guarantee | UNKNOWN: partial coverage |
| Designed error states | Onboarding `.ob-err`, dose `.dose-error` with alert/field association, program-fetch and chart-unavailable copy exist. No complete per-field/per-screen inventory | UNKNOWN: partial coverage |
| Reduced motion | Global CSS timing/delay override, dialog override and live JS query implemented | PASS in source; physical-device behavior UNKNOWN |
| Motion 150 to 300ms, ease-out | Navigation 160/240ms; press 150ms (was 120ms); sheet 300ms (was 350ms). Existing easing curves retained | PASS for these UI timings. ACCEPTED EXCEPTION: 550ms data-chart reveal conveys a measured data delta |

Floor fixes above were authorized on 2026-10-09. Locked, decided and approved choices outside these fixes remain intact. A partial PASS is not whole-app accessibility certification. Additional preship concerns include body line-height 1.4 versus 1.5, calendar 2px gaps versus 8px, and decorative hairlines that must not substitute for accessible focus/control boundaries.

### Design Loop critics

Use the loop only for a FitTrack hero (including a deliberate Home hero redesign), install landing page, promotional poster or pitch slides. Ordinary workout rows, food sheets, Settings controls, calendar fixes and all other small surfaces get one preship pass. This documentation update does not run a loop or spawn critics.

For an eligible task, split into three or four independently renderable pieces. Use three fresh-context critics, without builder rationale. Each check and final verdict is binary PASS/FAIL, never a score. All three must pass; send the single biggest gap back to the builder and record piece, round, verdict and gap history. Missing reference/render means the craft critic is blind and cannot pass.

Brief critic (stated brief and renders only, not implementation or system):

- PASS/FAIL: within five seconds, the intended user can identify today's fact and the next logging/install action at phone width.
- PASS/FAIL: GLP-1 nutrition shows saved floor meaning without rewarding low intake; general fitness screens remain useful with GLP-1 off.
- PASS/FAIL: a return after seven missed days offers a next step without guilt, streak loss or fabricated progress.
- PASS/FAIL: public hero/landing/poster/slides use synthetic examples and make no invented outcome, testimonial, dose or device claim.

System critic (this file and renders only):

- PASS/FAIL: original palette roles, system font stack, radii and applicable component geometry remain intact in dark and light appearances.
- PASS/FAIL: five-tab navigation, safe areas, grouped supplements and one-slot workout headers survive any affected screen change.
- PASS/FAIL: units and target labels agree across the visible views; no person-specific default or extrapolated dose appears.
- PASS/FAIL: rendered timing and reduced-motion output respect the recorded contracts; any floor exception is explicitly reported, not silently normalized.

Craft critic (task bar, reference and renders only, labels stripped for comparison):

- PASS/FAIL: FitTrack's leading fact/action is at least as easy to spot as the selected Apple Health/One UI reference view; name the single biggest gap.
- PASS/FAIL: no clipping, overlap or sideways scroll at 384px and 393px, plus 390px blueprint capture; marketing output also checks 1440px.
- PASS/FAIL: grouped rows, aligned numerals and card insets match the numbered bar without repeated representations crowding the first viewport.
- PASS/FAIL: taps and focus look usable, and motion never interrupts reading or resets a logged value to zero; rendered failures remain visible in the verdict.

### Preship

Run all twenty yes/no checks with evidence from `C:/Users/adnan/second-brain/.raw/design-blueprint/preship-20.md`; rule explanations are in `C:/Users/adnan/second-brain/.raw/design-blueprint/design-checklist-20.md`. Run the selected interface skill's automated detection where available, then the human checklist. Flag every no, unknown and locked-system conflict for Adnan. Do not mark a conflict yes or let the generic checklist authorize a redesign.

FitTrack additions: real Chrome at 384 x 832 first and 393 x 852 second; blueprint captures at 390 and 1440 (wide capture checks overflow, not permission for desktop redesign). Check 320/768/1024 as applicable, both themes, 200% text zoom, keyboard focus and reduced motion. Verify the floor state, unit changes, repeat meal and Undo, last-set recall, rest continuity, dialog Back/drag/keyboard and safe areas. Use synthetic logs only. Physical S26/iPhone verification is separate from emulation.

For future UI code changes, use the existing `node test/feel.test.mjs` and syntax guard plus the relevant suites in `NEXT-SESSION.md`; never add a KNOWN exception to make a failure disappear. This documentation-only change requires document/token checks, not an app deployment. No paid tools, framework, webfont or dependency is needed.

### Copy rules

Follow `C:/Users/adnan/second-brain/.raw/design-blueprint/human-copy-prompt.md`: plain English, short active sentences, one idea per sentence. First line answers the reader's first question: what is logged, what is missing, or what happens next. Buttons name the action: Log weight, Add meal, Save schedule. Explain uncertain estimates with the missing data and smallest next step. Avoid guilt, hype, praise for undereating and medical certainty.

Preserve facts and meaning. Never invent numbers, ratings, quotes, customers, dosage or evidence; use `[needs number]` or TODO where support is missing. No em dashes or en dashes. For substantial public copy use SlopMonster/humanizer and a rival-model pass, report before/after and disclose if the second pass did not run. That copy review is separate from binary visual critics.

### Gaps and TODOs

- TODO: record one exact screenshot/view from the named free references for each future task bar; current reference links do not constitute a fresh visual teardown.
- TODO: inventory Home, Workout, Nutrition, Progress and Settings empty/loading/error states, including offline, invalid input and storage failure, with next-action copy and accessible announcements. Existing examples are partial, not absent.
- TODO: document default, hover, focus-visible, active and disabled states for each control family. Preserve current controls while flagging missing states.
- TODO: review the listed contrast and 14px prose failures with Adnan; record an approved resolution before altering any shipped values.
- TODO: measure prose line length and all hit boxes in real Chrome, including calendar widths and inter-target gaps.
- TODO: identify/provenance the inline icon map and document existing size/stroke exceptions. No new icon library or automatic Lucide migration.
- TODO: document the logo usage/export inventory around the existing `assets/icon.svg` source and maskable variants. The source exists; do not invent a replacement logo.
- TODO: map legacy literal motion timings to the existing four duration tokens and record their blueprint exceptions. Motion tokens already exist; do not create a competing scale.
- TODO: retain device verification as pending until S26 Ultra and iPhone hardware checks supply evidence.
