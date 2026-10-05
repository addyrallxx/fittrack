# FitTrack Visual and UX Critique (Shipped v1.1.0)

**Audit Date:** 2026-10-05  
**Auditor:** Outside Reviewer (G2 Design Critique)  
**Target Standard:** Apple-quality native feel (Apple Fitness, Apple Health, MacroFactor, Hevy, Gentler Streak)  
**Primary Device Target:** Samsung Galaxy S26 Ultra (Chrome on Android, viewport 384 x 832, DPR 3.75, 120 Hz)  
**Secondary Device Target:** iPhone (Installed PWA, Safari, viewport 393 x 852)  
**Baseline Build:** v1.1.0 (commit `ae3b0aa`)  

---

## Executive Summary and Evaluation Framework

FitTrack has established a lean, commendable foundation: it is zero-cost, local-first, fast, free of advertisements or subscription paywalls, and respects user autonomy with no accounts and no social pressure. Its data calculations for GLP-1 titration safety, time-aware weight smoothing, and adaptive expenditure are exceptionally transparent and scientifically grounded.

However, evaluated against Adnan's explicit design bar ("the best smoothness, functionality, UI feel, UX like apple apps"), the shipped v1.1.0 interface suffers from clear structural defects:
1. **Container Proliferation ("Card Soup"):** Every datum is wrapped in an isolated rounded card with a 1px border. The screen reads as an unedited stack of boxes rather than an intentional information hierarchy.
2. **Inverted Visual Hierarchy:** Secondary metrics (such as daily steps) visually overpower primary health objectives (protein floor, energy floor, and resistance sessions). On Nutrition, the app celebrates remaining calories even when the user is deep in a dangerous deficit below the 1,600 kcal floor.
3. **Sub-44pt / Sub-48dp Touch Targets:** Multiple critical interactive controls (notification bell, set checkboxes, meal deletion buttons, range toggles, calendar chevrons, water quick-add pills) measure between 22px and 36px, causing high tap-miss rates on a large mobile screen.
4. **Data Duplication:** The home screen repeats identical data points in adjacent modules (activity rings immediately followed by floating text rows and check-in cards).
5. **Disconnected Interaction Grammar:** Peer tab transitions use lateral sliding carousels rather than instant cross-fades; rerenders replay progress fills from zero; button colors shift arbitrarily between orange, blue, green, and gradients.

The following audit provides an itemized, concrete critique per screen with exact token values, measurements, root causes, and visual remediation plans.

---

## 1. Home Screen (Dark and Light Modes)

**Screenshots Audited:** `docs/screenshots/home-dark.png`, `docs/screenshots/home-light.png`  
**Current Structure:** Greeting header with bell icon, "Trained today" badge, "Today's Activity" rings card with raw text row underneath, "Daily Check-ins" 3-card row, "Steps" card with progress bar, "Quick Log" 4-card grid, "Weight" card with log action, bottom navigation tab bar.

```
+-------------------------------------------------------------+
| Good night, Alex.                                       (B) | <- 36px Bell (undersized)
| Tuesday, September 1                                        |
| [🏋️ Trained today ✓]                                        |
+-------------------------------------------------------------+
| TODAY'S ACTIVITY                                            |
| +---------------------------------------------------------+ |
| |   ( CAL )             ( PRO )             ( H2O )       | | <- 86px rings with 800-weight text
| |  1,060 kcal           104 protein          2.4L water   | |
| +---------------------------------------------------------+ |
|   1060 / 1800 kcal     104g / 150g          2.4L / 3.5L     | <- Redundant uncontained text row
|                                                             |
| DAILY CHECK-INS                                             |
| +-------------+       +-------------+       +-------------+ |
| | 🏋️ Gym     |       | 💧 Water    |       | 🥩 Protein  | | <- Redundant with rings & badge
| | Done ✓      |       | Tap to log  |       | Tap to log  | |
| +-------------+       +-------------+       +-------------+ |
|                                                             |
| STEPS                                                       |
| +---------------------------------------------------------+ |
| | TODAY                                       Goal: 8,000 | |
| | 6,000                                               75% | | <- Dominates screen visually (32px green)
| | [=========================------------]                 | |
| | [Log steps]                                             | | <- 30px height target
| +---------------------------------------------------------+ |
|                                                             |
| QUICK LOG                                                   |
| +-------+       +-------+       +-------+       +-------+   |
| | Meal  |       | Water |       | Weight|       | Steps |   | <- 0.92 active spring scale
| +-------+       +-------+       +-------+       +-------+   |
|                                                             |
| WEIGHT                                                      |
| +---------------------------------------------------------+ |
| | CURRENT                                                 | |
| | 81.2 kg                                  [ Log weight ] | | <- 34px button height
| | Not logged today                                        | |
| | Target: 76.0 kg · 5.2 kg to go                          | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Concrete Defects Ranked by Severity

#### Defect 1.1: Inverted Visual Weight and False Eye Attraction
- **Location:** Middle viewport, "Steps" card (`.steps-card`, lines 1075-1088).
- **What is wrong:** The 32px extra-bold (#30D158 / `--green-text`) "6,000" numerals paired with the vibrant green bar and "75%" completion badge command the highest visual contrast on the entire screen. The user's eye lands on Steps first before seeing protein intake, caloric safety, or workout readiness. For an individual on a detrained GLP-1 program, step volume is a tertiary maintenance habit; the primary risks are muscle wasting from inadequate protein and undereating below the energy floor.
- **Why it matters:** Apple Health and Gentler Streak prioritize actionable status and core health rings first. Giving steps the loudest typography and saturation misleads the user regarding what matters today.
- **The fix:**
  - Reduce the primary step count typography from 32px 800-weight to 22px 700-weight tabular numerals (`font-variant-numeric: tabular-nums`).
  - Move Steps into a unified secondary metrics summary section below Quick Log.
  - Color the step metric with neutral `--t1` (#FFFFFF dark / #000000 light), using muted green (`#30D158`) solely for the 4px thin progress track fill.
  - Spacing: 12px gap between label and value, 8px padding above track.

#### Defect 1.2: Redundant Metric Representations and Cluttered "Double Deck"
- **Location:** "Today's Activity" card (`.rings-wrap`) and immediately following text row (lines 1058-1067).
- **What is wrong:** The exact same three metrics (Calories, Protein, Water) are displayed twice within a 120px vertical span:
  1. Inside the rings: `1,060 kcal`, `104 protein`, `2.4L water`.
  2. Directly underneath the card in an uncontained flex row: `1060 / 1800 kcal`, `104g / 150g`, `2.4L / 3.5L` in 10px `--t3` text.
  Furthermore, the very next card group ("Daily Check-ins") repeats Water and Protein again with emoji icons.
- **Why it matters:** Apple Fitness never shows a ring and then immediately duplicates the fraction below it in loose text. This conveys layout indecision, wastes roughly 72px of premium vertical viewport, and forces the user to scan repeated numbers.
- **The fix:**
  - Eliminate the loose floating text row (`lines 1063-1067`) completely.
  - Embed the target ratio directly into a calm secondary descriptor under each ring or inside a structured focus block.
  - Present: Ring value at 18px 700-weight (`font-variant-numeric: tabular-nums`), sub-label at 11px 500-weight (`var(--t2)`) reading `104 / 150g` in neutral typography without repeating the unit redundantly.

#### Defect 1.3: Caloric Ring Semantic Mismatch for GLP-1 Therapy
- **Location:** "Today's Activity", first ring (`ring('cal', ...)`).
- **What is wrong:** The orange ring is filled to roughly 58% (1,060 of 1,800 kcal). In standard fitness apps (Apple Fitness, MyFitnessPal), a partially filled ring signals incomplete progress that must be filled. However, on GLP-1 medication, 1,060 kcal represents an acute danger: it sits 540 kcal below the owner's 1,600 kcal hard floor! A half-empty ring provides zero indication of floor proximity, floor violation, or muscle catabolism risk.
- **Why it matters:** Ring closure semantics work for positive goals (steps, water, exercise minutes). For calories on an appetite suppressant, treating intake as an ordinary "fill to win" circle is biologically misleading.
- **The fix:**
  - Replace the 3-ring circular dashboard on Home with an Apple Health-style "Status and Protection" hero card.
  - Display Protein intake as the lead progress bar (`--coral`: #FF6B6B) with an explicit milestone indicator for the 130g floor and 150g stretch target.
  - Display Caloric intake with explicit floor awareness: when below 1,600 kcal after 18:00, show a structured amber indicator reading `540 kcal to energy floor`, not a neutral ring.

#### Defect 1.4: Undersized Touch Targets on Header and Cards
- **Location:** Top-right notification bell (`.hdr-btn`, line 1055), Step log button (`.steps-card button`, line 1087), and Weight log button (`.wt-log-btn`, line 1119).
- **What is wrong:**
  - `.hdr-btn` has explicit geometry of 36 x 36 px (line 180).
  - The Step log button has padding 7px 14px with 12px text, yielding an effective height of ~30px.
  - `.wt-log-btn` has padding 9px 16px with 13px text, yielding an effective height of ~34px.
  All three violate the 44 x 44 pt Apple HIG floor and the 48 x 48 dp Android One UI specification.
- **Why it matters:** On a Samsung Galaxy S26 Ultra (6.9-inch diagonal display), thumb reach to a 36px icon at the top right corner results in frequent tap misses and accidental swipes.
- **The fix:**
  - `.hdr-btn`: Set `min-width: 44px; min-height: 44px;` with an invisible touch expansion (`display: flex; align-items: center; justify-content: center;`). Keep the visible background squircle at 36px if desired, or scale to 40px radius 12px with 20px SVG icon.
  - `.wt-log-btn`: Increase padding to `12px 18px` with 14px 600-weight text, reaching a minimum height of 44px, radius 22px.
  - Step button: Convert to a full 44px action row or trigger the step sheet from tapping the entire steps focus block.

#### Defect 1.5: Container Overload and Inconsistent Elevation ("Card Soup")
- **Location:** Entire screen container structure (`.rings-wrap`, `.ci-card`, `.steps-card`, `.qa-btn`, `.wt-card`).
- **What is wrong:** The screen is divided into 10 separate outlined card boxes, each featuring a 1px `rgba(255,255,255,0.07)` border and `var(--s1)` background (#111111).
- **Why it matters:** In One UI and iOS design, related items are grouped into cohesive "focus blocks" using background surface elevation rather than individual borders around every row. The current layout forces the eye to parse dozens of bounding boxes.
- **The fix:**
  - Establish a 24px spacing rhythm between primary focus blocks.
  - Group Quick Actions and Daily Check-ins into unified grouped containers with subtle 1px dividers (`rgba(255,255,255,0.06)`), identical to the Settings screen layout.
  - Standardize outer margins using a responsive gutter token: `margin: 0 clamp(16px, 4.5vw, 24px)`.
  - Use radius `var(--r-lg)` (20px) for focus blocks, removing borders from nested rows.

#### Defect 1.6: Light Mode Contrast and Visual Discordance
- **Location:** `docs/screenshots/home-light.png` across all cards.
- **What is wrong:** In light mode (`data-theme="light"`), the page background is `#F2F2F7` and card backgrounds are `#FFFFFF`. While text contrast was fixed in v1.1.0 using `-text` tokens (e.g. `--orange-text: #9C4D00`), the colored ring tracks still use the bright dark-mode accents (`#FF9500`, `#FF6B6B`, `#4FC3F7`). Against a pure white card, the uncompleted ring tracks (`stroke: var(--s3)` / `#DFDFE6`) fade into near-invisibility, while the bright neon ring fills clash with the darkened text numbers inside them.
- **Why it matters:** Apple Fitness in light appearance softens track colors and uses rich, harmonious saturation curves rather than mixing dark mud-tone text with neon vector strokes.
- **The fix:**
  - Adjust light-mode ring track backgrounds to `#E5E5EA` (providing a crisp 1.35:1 container edge against `#FFFFFF`).
  - Harmonize ring stroke colors for light mode: Calorie stroke `#E07A00`, Protein stroke `#E05353`, Water stroke `#1E9AD6`.

---

## 2. Workout Screen

**Screenshot Audited:** `docs/screenshots/workout.png`  
**Current Structure:** Screen header with add button, Session selection pill tabs (A, B, C), exercise progress row with "Log whole session" button, Warm-up banner, exercise cards list (Chest Press open with 3 set rows, rest timer container, form cues, "Done, skip the set details" button; Seated Row collapsed), bottom tab bar.

```
+-------------------------------------------------------------+
| Workout                                                 (+) | <- 36px (+) button
| Session C, Plate-loaded and legs full body                  |
+-------------------------------------------------------------+
| [Session A]    [Session B]    [ Session C ]                 | <- Solid blue #0A84FF tab
|   Push            Pull         Plate-loaded                 |
+-------------------------------------------------------------+
| 0/7 exercises done            [ Log whole session ]         | <- 12px text / 44px button
| 0%                                                          |
| [---------------------------------------------------------] | <- 6px blue progress bar
+-------------------------------------------------------------+
| 🔥 WARM-UP FIRST                                            | <- Orange banner on blue screen
| 5 min incline walk, then one easy set of 10 on the first... |
+-------------------------------------------------------------+
| +---------------------------------------------------------+ |
| | [Dumbbell]  Chest Press                               ^ | |
| |             3 sets x 8-12                               | |
| |             [PLATE LOADED]                              | |
| |---------------------------------------------------------| |
| |  SET       WEIGHT (KG)          REPS          ✓         | |
| |   1      [-]  20.0  [+]     [-]   8   [+]    [✓]        | | <- 34px checkbox, 32px steppers
| |   2      [-]  20.0  [+]     [-]   8   [+]    [✓]        | |
| |   3      [-]  20.0  [+]     [-]   8   [+]    [✓]        | |
| |                                                         | |
| | WHERE TO FIND IT                                        | |
| | Plate-loaded strength zone, near the free weights       | |
| | FORM CUES                                               | |
| | • Load plates evenly on both sides and press each...    | |
| | • Target RPE 7. Stop with 2 or 3 reps left in tank.     | |
| |                                                         | |
| | [   Done, skip the set details (0/3 logged)   ]         | | <- 44-char ambiguous button
| +---------------------------------------------------------+ |
| +---------------------------------------------------------+ |
| | [Dumbbell]  Seated Row                                v | |
| |             3 sets x 8-12                               | |
| |             [PLATE LOADED]                              | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Concrete Defects Ranked by Severity

#### Defect 2.1: Chromatic Disconnect and Accent Color Confusion
- **Location:** Workout session tabs (`.day-tab.active`), exercise card icons (`.ex-icon`), completion buttons (`.ex-complete-btn`), and progress track (`#wk-prog`).
- **What is wrong:** The Workout screen introduces a piercing electric blue (`#0A84FF` / `var(--blue)`) as its dominant primary UI accent. At the same time, the warm-up banner directly below the session selector uses orange (`var(--orange)` / `#FF9500`), the "Finish workout" button at the bottom of the list uses an orange-to-coral gradient (`linear-gradient(135deg, #FF9500, #FF6B35)`), and the global app brand accent is orange.
- **Why it matters:** Apple HIG dictates that an app should maintain a consistent, purposeful tint color across all primary interactive controls. Introducing electric blue solely for workout elements makes the workout screen look like a different third-party app bolted into the shell. Furthermore, blue in the rest of FitTrack is strictly reserved for Water / Hydration. Re-using blue for lifting confuses semantic color mapping.
- **The fix:**
  - Retire electric blue (`#0A84FF`) as the workout accent.
  - Anchor Workout to the app's established workout identity: warm primary orange (`#FF9500`) for active session tabs, workout progress track, and primary completion buttons.
  - In light mode, use `--orange-text` (`#9C4D00`) for text links and borders, and solid `#FF9500` for active tab fills with pure black text (`#000000`).
  - Reserve blue exclusively for water and hydration data.

#### Defect 2.2: Ambiguous and Verbose Primary Action Copy
- **Location:** Primary action button inside expanded exercise card (`.ex-complete-btn`, line 1247).
- **What is wrong:** The button copy reads: `"Done, skip the set details (0/3 logged)"`. At 44 characters, this button text is confusingly phrased and visually crowded. It forces the user to parse two contradictory ideas simultaneously ("Done" vs "skip the set details") while displaying a fractional counter in parentheses. When tapped, it marks the exercise complete and hides the card without logging individual weights.
- **Why it matters:** In a gym setting, cognitive load must be near zero. Lifters scanning a button during heavy training need immediate clarity: does this save my workout, skip this exercise, or confirm my sets?
- **The fix:**
  - Split the dual-purpose intent into two clear states:
    1. If sets have been checked off: `Save Exercise (3/3 sets)` in solid orange (`#FF9500`), height 48px, font 15px 700-weight, radius 14px.
    2. If zero sets are checked: Provide a secondary neutral button: `Quick Complete (Skip sets)` in `var(--s2)` surface background, 1px border `var(--border)`, text `var(--t2)`.
  - Alternatively, adopt Hevy's model: checking the last set automatically prompts or transitions to the next exercise.

#### Defect 2.3: Absence of Exact Per-Set Recall
- **Location:** Set logging rows (`.set-row`, lines 1202-1215).
- **What is wrong:** Every set row for Chest Press opens with the identical prefilled value: `20.0 kg` and `8 reps`. The code calls `lastWeightFor(ex.id)` which returns only the single last weight logged in previous history and applies it globally to every set.
- **Why it matters:** Lifters detrained or experienced rarely lift the exact same weight and reps across all sets; they perform ramp-up sets, drop sets, or experience rep fatigue (e.g. Set 1: 20kg x 12, Set 2: 20kg x 10, Set 3: 20kg x 8). By flattening the history into a single repeated number, FitTrack forces the user to manually adjust weight and reps on sets 2 and 3 every session. Boostcamp and Hevy store and present the exact set-by-set pair from the previous session as placeholder or prefilled values.
- **The fix:**
  - Store previous workout logs with array indexes matching sets: `previousSets: [{weight: 20, reps: 12}, {weight: 20, reps: 10}, {weight: 17.5, reps: 8}]`.
  - Render previous performance as a subdued 11px metadata hint directly above or inside the set row (e.g. `Prev: 20 kg x 10` in `var(--t3)`).
  - Tapping the row accepts the previous values with a single confirmation.

#### Defect 2.4: Undersized and Precision-Heavy Set Checkbox Target
- **Location:** Checkbox button at the end of each set row (`.set-chk`, line 1214, CSS line 335).
- **What is wrong:** `.set-chk` is sized at 34 x 34 px with a 15px check SVG. It is placed within a grid column capped at 36px width (`display: grid; grid-template-columns: 32px minmax(0,1fr) minmax(0,1fr) 36px;`).
- **Why it matters:** Set completion is the single most frequent physical interaction on this screen, performed between 15 and 25 times per workout with shaky, fatigued fingers. A 34px target in a 36px column fails both Apple (44pt) and Android (48dp) touch accessibility guidelines, causing frequent missed taps that hit the input wrapper instead.
- **The fix:**
  - Expand the set row grid layout: `grid-template-columns: 28px minmax(0, 1fr) minmax(0, 1fr) 48px; gap: 10px;`.
  - Set `.set-chk` minimum hit target to 48 x 48 px. The visible squircle can remain 38 x 38 px with radius 10px, centered within the 48px hit box.
  - When checked, provide instant haptic feedback (where supported) and transition background to `var(--green)` (#30D158) with black checkmark.

#### Defect 2.5: Horizontal Cramping from Inline Stepper Buttons
- **Location:** Set input wrappers (`.set-inp-wrap`, lines 1204-1213, CSS lines 330-334).
- **What is wrong:** Each input field is flanked by two 32px stepper buttons (`−` and `+`). For two fields (weight and reps), four stepper buttons consume 128px of horizontal width. On a 384px screen (352px usable within 16px margins), this leaves only roughly 44px of visible width for the numeric input value itself.
- **Why it matters:** In Apple and Hevy workout interfaces, numeric inputs are clean, large, easily readable text boxes. Tapping them summons a bottom number pad sheet or inline modal with direct quick-tap increments (+1.25, +2.5, +5 kg), rather than forcing users to repeatedly click tiny 32px buttons.
- **The fix:**
  - Increase input height to 46px.
  - Ensure the numeric text is styled at 16px 700-weight tabular figures (`font-variant-numeric: tabular-nums`).
  - Increase stepper button touch padding to an explicit 44px width while maintaining a clean divider between stepper and value.

#### Defect 2.6: Missing Sticky Rest Timer and Workout Summary Bar
- **Location:** Scrolling screen layout and rest timer container (`.rest-bar`, line 1240).
- **What is wrong:** When a set is checked, `.rest-bar` appears inside the body of that specific exercise card. If the user scrolls down to inspect form cues, check the next exercise, or browse Session B, the rest countdown timer scrolls completely off-screen. Furthermore, the "Finish workout" button is placed at the absolute bottom of the 7-exercise list (line 1190), requiring a long scroll down.
- **Why it matters:** During a 90-second rest interval, lifters set their phone down or review upcoming movements. Losing visibility of the rest countdown leads to over-resting. Hevy, Strong, and Apple Workout consistently keep active workout timers pinned to a persistent floating bar directly above the tab bar.
- **The fix:**
  - Detach the rest countdown from the inner exercise card.
  - Implement a persistent 52px sticky bar pinned directly above the bottom tab bar whenever a workout is in progress.
  - Display: Current movement name (13px 600-weight), active set, rest countdown (16px bold tabular numbers in `--orange-text`), and a 44px "Skip" chip.

---

## 3. Nutrition Screen

**Screenshot Audited:** `docs/screenshots/nutrition.png`  
**Current Structure:** Screen header with "+ Add meal" pill button, Macro card (calories eaten, calories remaining, daily macro bars for Protein, Carbs, Fat, and Hard floor warning box), Supplements card (Whey shake and Creatine rows), Food search bar, Meal log sections (Breakfast, Lunch, Snack with individual meal cards), Water intake card with progress bar and increment buttons.

```
+-------------------------------------------------------------+
| Nutrition                                      [ + Add meal]| <- 34px height pill
| Tuesday, September 1                                        |
+-------------------------------------------------------------+
| +---------------------------------------------------------+ |
| | 1060                                                740 | | <- 36px orange vs 22px remaining
| | kcal eaten today                         kcal remaining | |
| |                                                         | |
| | DAILY MACRO TARGETS                                 (i) | |
| | Protein [=================-----------------] 104g / 150g| |
| | Carbs   [=============---------------------] 104g / 210g| | <- Hardcoded 210g in code!
| | Fat     [========--------------------------]  21g /  65g| | <- Hardcoded 65g in code!
| |                                                         | |
| | +-----------------------------------------------------+ | |
| | | Hard floor: 1,600 kcal                          (i) | | | <- Buried warning! 540 kcal below floor
| | | Do not finish the day below this intake.            | | |
| | +-----------------------------------------------------+ | |
| +---------------------------------------------------------+ |
|                                                             |
| SUPPLEMENTS                                                 |
| +---------------------------------------------------------+ |
| | [Protein] ON Whey Protein Shake                  [ Log ]| | <- 44px button, clean
| |           130 kcal, 24g protein                         | |
| |---------------------------------------------------------| |
| | [Creatine] Creatine 5g                          [✓ Done]| |
| |            Done today                                   | |
| +---------------------------------------------------------+ |
|                                                             |
| [🔍 Search food or browse presets...                     ]  | <- No recent items or one-tap repeat
|                                                             |
| Breakfast                                         260 kcal  |
| +---------------------------------------------------------+ |
| | Greek yogurt and berries                        260 [🗑️]| | <- 28px red trash button!
| | P: 22g · C: 30g · F: 6g                                 | |
| +---------------------------------------------------------+ |
| Lunch                                             620 kcal  |
| +---------------------------------------------------------+ |
| | Chicken and rice bowl                           620 [🗑️]| |
| | P: 52g · C: 68g · F: 12g                                | |
| +---------------------------------------------------------+ |
| Snack                                             180 kcal  |
| +---------------------------------------------------------+ |
| | Whey protein shake                              180 [🗑️]| |
| | P: 30g · C: 6g · F: 3g                                  | |
| +---------------------------------------------------------+ |
|                                                             |
| WATER INTAKE                                                |
| +---------------------------------------------------------+ |
| | 2.4L                                                69% | |
| | Goal: 3.5L                                              | |
| | [=============================------------------------] | |
| | [+250ml]       [+500ml]       [+750ml]       [+1L]      | | <- 35px height buttons
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Concrete Defects Ranked by Severity

#### Defect 3.1: Inverted Clinical Hierarchy (Celebrating Deficit while Undereating)
- **Location:** Top Macro card (`.macro-card`, lines 1400-1434).
- **What is wrong:** The card prominently displays "1060 kcal eaten today" on the left in 36px bold orange, and pairs it on the right with "740 kcal remaining" in calm 22px bold text. The "Hard floor: 1,600 kcal" warning is relegated to a small secondary container at the bottom of the card.
- **Why it matters:** On a GLP-1 receptor agonist (GLP-1 medication), the primary physiological danger is severe undereating, dehydration, and lean tissue loss. At 1,060 kcal, the user is 540 kcal below their non-negotiable safety floor. Framing 740 kcal as "remaining" applies the psychology of an ordinary weight-loss app celebrating an aggressive deficit. The user feels they are "winning" by having 740 kcal left, when in reality their muscle mass is actively compromised.
- **The fix:**
  - Invert the card hierarchy: Lead with floor proximity rather than ceiling distance.
  - When intake is below the floor after mid-afternoon (e.g. past 16:00), replace "kcal remaining" with an urgent, calm floor indicator:
    - Primary value: `540 kcal to floor` in `--orange-text` (#FF9500 / #9C4D00).
    - Status label: `Floor: 1,600 kcal minimum`.
  - Place a dedicated Protein Floor milestone on the protein bar: show a distinct tick mark at 130g (the safety floor) and 150g (the stretch target).
  - Only when intake surpasses the 1,600 kcal floor should the interface transition to showing distance to the 1,800 kcal ceiling.

#### Defect 3.2: Hardcoded Macro Targets Truth Defect
- **Location:** Daily Macro Targets display lines in `renderNutrition()` (lines 1421 and 1426):
  ```javascript
  // Line 1421:
  <div class="macro-bar-val">${Math.round(tCarbs)}g / 210g</div>
  // Line 1426:
  <div class="macro-bar-val">${Math.round(tFat)}g / 65g</div>
  ```
- **What is wrong:** The denominators for Carbs (`210g`) and Fat (`65g`) are hardcoded string literals inside `fittrack.html`! Meanwhile, `DEF_SETTINGS.targets` defines `carbs: 165, fat: 60`, and Settings allows the user to customize them. The progress bar math also uses hardcoded denominators: `tCarbs / 210` and `tFat / 65`.
- **Why it matters:** This is an explicit truth defect. If the user edits their targets in Settings, the Nutrition screen stubbornly continues to render 210g and 65g. In an app where Adnan asked for absolute trust and accuracy, hardcoded numbers silently undermine data integrity.
- **The fix:**
  - Replace the hardcoded literals with live configuration values:
    - Carbs: `${Math.round(tCarbs)}g / ${c.targets.carbs}g` and fill `Math.min((tCarbs / c.targets.carbs) * 100, 100) + '%'`.
    - Fat: `${Math.round(tFat)}g / ${c.targets.fat}g` and fill `Math.min((tFat / c.targets.fat) * 100, 100) + '%'`.

#### Defect 3.3: Dangerous and Undersized Destructive Controls (Trash Cans)
- **Location:** Meal items list (`.meal-del`, line 1483, CSS line 401).
- **What is wrong:**
  - Each logged food row features a circular red trash icon (`.meal-del`) sized at 28 x 28 px.
  - Tapping this 28px icon triggers `delMeal(id)`, which immediately deletes the entry without confirmation and without an undo toast.
  - Red trash cans repeat on every single logged row (3 red cans visible in the screenshot).
- **Why it matters:**
  1. A 28px target on a touchscreen is extremely difficult to tap reliably, violating the 44px minimum.
  2. Because it sits directly adjacent to the food name and calories, a thumb tap intended to view food details or edit portion easily hits the trash can, permanently wiping the logged meal.
  3. Visually, multiple bright red circular icons scatter noise across the screen, violating Apple HIG's recommendation to reserve destructive red for deliberate modal confirmations.
- **The fix:**
  - Remove permanent inline red trash buttons from every row.
  - Adopt Apple Health / iOS standard swipe-to-delete gesture on `.meal-item`, or place delete inside an edit sheet.
  - If a button must remain, provide an expand-to-delete pattern with at least a 44 x 44 px hit target.
  - Whenever an item is deleted, immediately display an undo toast: `"Item deleted" [Undo]` lasting 4 seconds.

#### Defect 3.4: High-Friction Logging Path (No Recent Foods or One-Tap Repeat)
- **Location:** Food search input (`.food-search-wrap`, lines 1436-1441).
- **What is wrong:** The search bar sits empty below the supplements card. There are no recent food chips, no "Repeat yesterday's lunch" shortcut, and no frequent meal suggestions.
- **Why it matters:** Adnan orders repeat delivery meals (shawarma plate, chicken curry, biryani, Greek yogurt) frequently. Under the current UI, logging the same shawarma plate for the fiftieth time requires tapping the search input, typing at least 4 characters ("shaw..."), waiting for the debounced search results to open, tapping the item, and then selecting the meal category from a sheet. MacroFactor, Lose It, and Cronometer place recent meals for the current time of day directly on the screen for one-tap re-logging.
- **The fix:**
  - Above the search input or directly below the meal category headers, expose a "Recent for [Meal]" carousel of horizontal chips (e.g. `[+ Greek yogurt 260 kcal]`, `[+ Chicken & rice 620 kcal]`).
  - Add a small 44px header button on each meal section: `Repeat last [Meal]` (e.g. "Repeat yesterday's lunch") that logs the saved meal in a single deliberate tap.

#### Defect 3.5: Disjointed Meal Rows vs Grouped Supplement Cards
- **Location:** Contrast between `.supp-card` (lines 1435) and `.meal-item` list (lines 1477-1485).
- **What is wrong:** The Supplements section uses a clean, unified iOS-style grouped card (`.supp-card`) where whey and creatine share an inset container separated by a 1px border. Directly below, each logged food item is rendered as a standalone floating card (`.meal-item`) with 6px bottom margin, its own 1px border, and a separate background.
- **Why it matters:** This creates visual inconsistency within the same screen. The user wonders why supplements are a grouped list while meals are a fragmented pile of disconnected boxes.
- **The fix:**
  - Group all items for a given meal (e.g. Breakfast) inside a single `.card` container with 20px radius and 1px border.
  - Separate individual food items within the meal group using 1px hairline dividers (`rgba(255,255,255,0.06)` in dark mode, `rgba(0,0,0,0.06)` in light mode), identical to `.supp-card` and `.settings-grp`.

#### Defect 3.6: Undersized Water Increment Buttons and Header Pill
- **Location:** "+ Add meal" header button (line 1398) and Water increment buttons (`.water-btn`, lines 1456-1459).
- **What is wrong:**
  - "+ Add meal" has padding `8px 16px` with font 13px, resulting in an effective height of 34px.
  - `.water-btn` has padding `10px 4px`, font 11px, height ~35px.
- **Why it matters:** Both buttons are primary logging shortcuts used multiple times a day. Their sub-44px height causes missed taps on mobile.
- **The fix:**
  - "+ Add meal": Set `min-height: 44px; padding: 0 18px; font-size: 14px; font-weight: 700; border-radius: 22px;`.
  - `.water-btn`: Set `min-height: 44px; padding: 12px 6px; font-size: 13px; font-weight: 700; border-radius: 12px;`.

---

## 4. Progress Screen

**Screenshot Audited:** `docs/screenshots/progress.png`  
**Current Structure:** Screen header, Weight history chart card with 30d/90d range tabs, Trend and projection card, "Your actual maintenance" adaptive TDEE card, Resting heart rate card, Dose schedule card (conditional), Streaks card row (Gym, Protein, Hydration), Activity calendar card, Body composition card.

```
+-------------------------------------------------------------+
| Progress                                                    |
| What the numbers actually say                               |
+-------------------------------------------------------------+
| WEIGHT HISTORY                                              |
| +---------------------------------------------------------+ |
| | 81.2 kg                                     [30d] [90d] | | <- 26px height range tabs!
| | ↓ 2.8 kg from start                        Target: 76kg | |
| |                                                         | |
| |  83 |-------------------------------------------------  | |
| |  81 |                                                   | |
| |  79 |--------*-----*-----*-----*-----*-----*----------  | | <- Canvas line chart (160px)
| |  76 | - - - - - - - - - - - - - - - - - - - - - - - -   | | <- Dashed target line
| |     8/5           8/13          8/21          8/28      | |
| +---------------------------------------------------------+ |
|                                                             |
| TREND AND PROJECTION                                        |
| +---------------------------------------------------------+ |
| | TREND WEIGHT (i)            Smoothed over 10 days, so a | |
| | 82.0 kg                     salty meal does not read... | |
| |---------------------------------------------------------| |
| | WEIGHT PROJECTION (i)                                   | |
| | Currently down 0.34 kg a week. At that rate you reach   | |
| | 76.0 kg around Friday, January 1, about 17 weeks out... | |
| +---------------------------------------------------------+ |
|                                                             |
| YOUR ACTUAL MAINTENANCE                                     |
| +---------------------------------------------------------+ |
| | Only 5 of the last 27 days have food logged. This needs | | <- Honest but un-actionable empty state
| | about 17.                                               | |
| | This works out what you actually burn from what you...  | |
| +---------------------------------------------------------+ |
|                                                             |
| RESTING HEART RATE                                          |
| +---------------------------------------------------------+ |
| | 58 bpm                                       [ Update ] | | <- 37px button
| | Baseline 58 bpm                                         | |
| |---------------------------------------------------------| |
| | In line with your own baseline.                         | |
| +---------------------------------------------------------+ |
|                                                             |
| STREAKS (BELOW FOLD)                                        |
| +-------------+       +-------------+       +-------------+ |
| | 🔥 0        |       | 🔥 0        |       | 🔥 0        | | <- VIOLATES RULES: Streaks retained!
| | Gym days    |       | Protein     |       | Hydration   | |
| +-------------+       +-------------+       +-------------+ |
+-------------------------------------------------------------+
```

### Concrete Defects Ranked by Severity

#### Defect 4.1: Flagrant Breach of Project Direction (Retention of Fire Streaks)
- **Location:** Lower Progress screen, Streaks section (`.streak-row`, lines 2251-2256, CSS lines 417-420).
- **What is wrong:** The shipped app renders three streak cards featuring flame emojis (`🔥 0`) for Gym days, Protein, and Hydration.
- **Why it matters:** This directly contradicts the explicit design decisions codified in `docs/research/competitive-and-design-plan.md` (Section 5: "What not to build: No streaks, badges, levels, points, or daily completion score. The existing fire streaks should be removed. A daily chain gives a missed day permanent visual weight"). For a detrained lifter who stated "plans must survive missed days", returning after a 4-day hiatus to see triple zeros and dead flame icons transforms the app into an instrument of guilt and shame, driving abandonment.
- **The fix:**
  - Delete the entire Streaks section (`lines 2251-2256`) and the helper `calcStreak()`.
  - Replace with the planned rolling 7-day commitment card:
    - Workouts completed: e.g. `2 of 3 sessions this week` (with neutral circle indicators).
    - Usable food days: e.g. `4 of 7 days logged`.
    - Weigh-in status: e.g. `Last weighed 2 days ago`.
    - Never display fire icons, lost-streak warnings, or zero-day shame counters.

#### Defect 4.2: Severely Undersized Range Toggle and Calendar Navigation Targets
- **Location:** Chart range tabs (`.range-tab`, line 2195, CSS lines 413-415) and Calendar month chevrons (`.cal-nav-btn`, line 2297, CSS lines 424-426).
- **What is wrong:**
  - `.range-tab` buttons ("30d", "90d") have padding `5px 12px`, radius 14px, and font 11px, measuring only **26px in total height**.
  - `.cal-nav-btn` buttons are circular targets measuring **30 x 30 px** with 14px icons.
- **Why it matters:** Both controls sit far below the 44px / 48px standard. On mobile, switching from 30-day to 90-day chart views is an exercise in finger gymnastics that frequently fails or registers as an accidental swipe.
- **The fix:**
  - Convert `.range-tabs` into an iOS-style segmented control:
    - Container height: 36px with 44px touch envelope.
    - Segment buttons: `min-width: 54px; height: 32px; font-size: 13px; font-weight: 600; border-radius: 8px;`.
  - `.cal-nav-btn`: Expand button container to `44 x 44 px` with a centered 32px visible background circle and 16px icon.

#### Defect 4.3: Dead-End Empty State on Actual Maintenance
- **Location:** "Your actual maintenance" card (lines 2223-2236).
- **What is wrong:** When insufficient data exists, the card renders a raw block of text: `"Only 5 of the last 27 days have food logged. This needs about 17. This works out what you actually burn from what you ate and what the scale did, which beats any formula. It needs the food log to be reasonably complete to mean anything."`
- **Why it matters:** While honest, this is an inert, dead-end presentation. It leaves the user staring at an unformatted paragraph without a visual indicator of their progress toward unlocking the estimate, and without a direct call to action.
- **The fix:**
  - Structure the holding state using MacroFactor-style progress disclosure:
    - Headline: `Adaptive Maintenance: Holding` (in `--t2` or `--orange-text`).
    - Progress visualization: A clean 6px progress track showing `5 / 17 usable food days` (29% complete).
    - Status copy: `Log 12 more complete food days to unlock your personalized energy expenditure.`
    - Action button: A 44px primary action button reading `Log today's food` that routes directly to Nutrition.

#### Defect 4.4: Monolithic 2,000px Vertical Scroll Stack
- **Location:** Entire screen scroll container (`#s3`).
- **What is wrong:** The Progress screen stacks 8 massive cards sequentially:
  1. Weight History Chart (300px)
  2. Trend and Projection (220px)
  3. Actual Maintenance (180px)
  4. Resting Heart Rate (160px)
  5. Dose Schedule (320px)
  6. Streaks (120px)
  7. Activity Calendar (340px)
  8. Body Composition (260px)
  Total vertical height exceeds 2,100px (nearly 3 full screen heights on Galaxy S26 Ultra).
- **Why it matters:** Apple Health separates Summary, Highlights, and Trends rather than creating an endless vertical scroll. On mobile, excessive screen length degrades recall, makes lower cards (like Body Composition and Calendar) functionally invisible, and creates scroll fatigue.
- **The fix:**
  - Group Progress into two clear visual tiers:
    - Tier 1 (Daily/Weekly Trend Summary): Weight history chart with embedded trend number, and Rolling weekly commitments card.
    - Tier 2 (Deep Diagnostics): Grouped focus blocks for Adaptive TDEE, Resting HR, and Dose Schedule.
  - Relocate the static Activity Calendar into a sheet or secondary view.

#### Defect 4.5: Numeric Layout Jitter (Absence of Tabular Figures)
- **Location:** Weight chart header (`.chart-current`), Trend Weight (`.stat-box-val`), and Resting HR (`.flex-bc div`).
- **What is wrong:** Primary metrics (such as `81.2 kg`, `82.0 kg`, `58 bpm`) use proportional font numerals without `font-variant-numeric: tabular-nums`.
- **Why it matters:** When values update or when toggling between 30d and 90d views, numbers with proportional spacing cause neighboring labels, units, and buttons to jitter horizontally. In Apple design, all data instrumentation strictly enforces monospaced tabular figures.
- **The fix:**
  - Apply `font-variant-numeric: tabular-nums;` to `.chart-current`, `.stat-box-val`, and all metric displays.
  - Explicitly lock unit labels (`kg`, `bpm`, `kcal`) to a fixed baseline alignment.

---

## 5. Settings Screen and Notifications Sheet

**Screenshots Audited:** `docs/screenshots/settings.png`, `docs/screenshots/notifications.png`  
**Current Structure:**  
- **Settings Screen:** Profile group (Name, Body stats), Daily targets group (Calories, Protein, Water, Steps), Notifications group (Master status banner, Water, Gym, Monday weigh-in, Dose toggles, Test reminder row), Appearance group (Theme buttons), Units group, Data export/clear group, About group.  
- **Notifications Sheet:** Modal bottom sheet with drag handle, title, description, and stacked action buttons ("Enable notifications", "Install app first", "Not now").

```
Settings Screen:
+-------------------------------------------------------------+
| Settings                                                    |
| Personalise your experience                                 |
+-------------------------------------------------------------+
| PROFILE                                                     |
| +---------------------------------------------------------+ |
| | [👤] Name                                      Alex   > | | <- 54px row, clean iOS HIG pattern
| |---------------------------------------------------------| |
| | [📈] Body stats                        81.2 kg · 22% BF > | |
| +---------------------------------------------------------+ |
|                                                             |
| DAILY TARGETS                                               |
| +---------------------------------------------------------+ |
| | [🔥] Calories                              1800 kcal  > | |
| | [🎯] Protein                                    150g  > | |
| | [💧] Water                                      3.5L  > | |
| | [🏃] Steps                                     8,000  > | |
| +---------------------------------------------------------+ |
|                                                             |
| NOTIFICATIONS                                               |
| +---------------------------------------------------------+ |
| | [🔔] Reminders are not switched on yet                > | | <- Master banner opening sheet
| +---------------------------------------------------------+ |
| +---------------------------------------------------------+ |
| | [🔔] Water reminders (Not delivering yet)    [  ( )   ] | | <- 0.55 opacity disabled toggles
| | [🔔] Gym prompts     (Not delivering yet)    [  ( )   ] | |
| | [🔔] Monday weigh-in (Not delivering yet)    [  ( )   ] | |
| | [🔔] Dose reminders  (Not delivering yet)    [  ( )   ] | |
| +---------------------------------------------------------+ |
| +---------------------------------------------------------+ |
| | [🔔] Send a test reminder                               | |
| |      Checks the whole path, phone included              | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+

Notifications Sheet (Modal):
+-------------------------------------------------------------+
|                            ---                              | <- 36x4px drag handle
| Notifications                                           (X) | <- 30px close button
| Set up reminders                                            |
| Water through the day, a nudge twice on gym days, weight... |
|                                                             |
| [               Enable notifications                      ] | <- Solid orange primary
|                                                             |
| [                 Install app first                       ] | <- Identical gray secondary
|                                                             |
| [                      Not now                            ] | <- Identical gray secondary!
+-------------------------------------------------------------+
```

### Concrete Defects Ranked by Severity

#### Defect 5.1: Confusing Triple-Button Stacking on Notifications Sheet
- **Location:** Bottom modal sheet (`docs/screenshots/notifications.png`, lines 2985-2991).
- **What is wrong:** The sheet presents three vertically stacked full-width pill buttons:
  1. `Enable notifications` in solid orange (`#FF9500`, white text).
  2. `Install app first` in dark gray (`var(--s3)` / `#2C2C2E`, white text).
  3. `Not now` in identical dark gray (`var(--s3)` / `#2C2C2E`, white text).
- **Why it matters:** In Apple iOS Human Interface Guidelines, a modal sheet should feature one primary call to action, at most one secondary option, and a distinct tertiary or plain-text dismiss action. Stacking two identical dark gray pill buttons creates visual ambiguity: "Not now" (cancellation/dismissal) looks identical in weight and visual priority to "Install app first" (an action that prompts a browser installation flow).
- **The fix:**
  - Demote `Not now` from a thick gray card button to a plain text/ghost button: `sheet-btn-ghost` with `background: none; border: none; color: var(--t2); font-size: 15px; font-weight: 600; padding: 12px; margin-top: 4px;`.
  - Style `Install app first` as an outlined button: `background: var(--s2); border: 1px solid var(--border2); color: var(--t1);`.
  - Maintain `Enable notifications` as the single dominant primary button in solid orange (`#FF9500`, height 50px, radius 16px).

#### Defect 5.2: Undersized Modal Sheet Close Target
- **Location:** Top-right modal close button (`.sheet-close`, line 2561, CSS line 488).
- **What is wrong:** `.sheet-close` is an explicit 30 x 30 px circle with a 13px SVG icon.
- **Why it matters:** On both iPhone and Galaxy devices, tapping the top-right corner of a modal to dismiss it is standard behavior. A 30px target is too small for reliable thumb interaction, leading to accidental taps on the sheet title or backdrop.
- **The fix:**
  - Increase `.sheet-close` container to at least `44 x 44 px` with `display: flex; align-items: center; justify-content: center;`.
  - The visible background circle can measure 32 x 32 px with radius 16px (`var(--s3)`), centered within the 44px touch bounding box.

#### Defect 5.3: Dead-State Presentation of Disabled Notification Toggles
- **Location:** Settings notifications list (`.settings-grp`, lines 2408-2413, rendered via `notifRow()`).
- **What is wrong:** When notifications are disabled at the system level (`pushStatus !== 'live'`), all four reminder toggles are rendered with `opacity: 0.55` and subtitle "Not delivering yet". Tapping them toggles an internal preference in localStorage, but no notification can actually fire.
- **Why it matters:** Having 4 disabled-looking toggles directly beneath a banner warning creates visual dead space. In iOS Settings, dependent toggles are either hidden until master authorization is granted, or tapping any toggle immediately presents the authorization prompt explaining why the setting is inactive.
- **The fix:**
  - When `pushStatus !== 'live'`, replace the individual disabled toggle rows with a single, clear explanation card:
    `"Reminders require notification permission. Enable them above to schedule water, gym, weigh-in, and dose prompts."`
  - Reveal the individual granular toggle rows only once system notifications have been successfully granted and synced.

#### Defect 5.4: Inconsistent Row Layout in Units Section
- **Location:** Units group in Settings (`.settings-sec`, lines 2435-2472).
- **What is wrong:** While Profile, Targets, and Notifications use standard iOS-style disclosure rows (label on left, value on right, chevron trailing, leading to dedicated detail sheets), the Units group nests multiple raw button groups directly inside the rows:
  - Metric / Imperial master row contains two buttons (`padding: 7px 14px; font-size: 12px;`).
  - Weight row contains `[kg]` and `[lb]` buttons.
  - Height row contains `[cm]` and `[in]` buttons.
  - Volume row contains `[ml]` and `[fl oz]` buttons.
- **Why it matters:** These tiny 28px height buttons introduce inconsistent alignment and visual clutter into an otherwise clean grouped table.
- **The fix:**
  - Standardize unit toggles into proper iOS-style segmented controls:
    - Container: `height: 36px; background: var(--s2); border-radius: 9px; padding: 2px; display: flex; gap: 2px;`.
    - Segment: `height: 32px; border-radius: 7px; font-size: 13px; font-weight: 600; flex: 1;`. Active segment uses `background: var(--s4); color: var(--t1); box-shadow: 0 1px 3px rgba(0,0,0,0.2);`.

---

## 6. Cross-Screen Consistency Problems

Evaluating FitTrack across all five screens reveals several architectural design inconsistencies where identical functional patterns are solved differently for no user-facing reason.

### 6.1 Card Styles, Elevation, and Geometry
- **Inconsistent Radii:** The codebase declares four radius tokens (`--r-sm: 10px`, `--r-md: 16px`, `--r-lg: 20px`, `--r-xl: 28px`), but applies them unpredictably:
  - 20px (`--r-lg`): `.rings-wrap`, `.steps-card`, `.wt-card`, `.ex-card`, `.macro-card`, `.water-card`, `.wt-chart-card`, `.bstats-card`, `.cal-card`, `.settings-grp`.
  - 16px (`--r-md`): `.ci-card`, `.qa-btn`, `.streak-card`, `.meal-item`, `.warmup-banner`, `ex-complete-btn`.
  - 12px: `.supp-action`, `.whole-session-btn`, `.sr-icon`, `.ex-icon`.
  - 10px (`--r-sm`): `.floor-warning`, `.stat-box`.
  - 28px (`--r-xl`): `.sheet`, `.cel-card`.
- **Inconsistent Inset Margins:**
  - Standard cards use `margin: 0 16px 12px;`.
  - `.macro-card` uses `margin: 4px 16px 12px;`.
  - `.meal-sec` uses `margin: 0 16px 10px;`.
  - `.day-tabs` uses `padding: 0 16px; margin-bottom: 12px;`.
  - There is no unified `--page-gutter` variable, making responsive scaling between the Galaxy S26 Ultra (384px) and iPhone (393px) brittle.

### 6.2 Header Patterns and Trailing Actions
Every screen shares a 28px bold title and 13px subtitle, but the trailing action slot in `.screen-header` diverges completely:
- **Home:** Circular 36px icon button (Notification bell).
- **Workout:** Circular 36px icon button (Add custom exercise).
- **Nutrition:** Oval text pill button (`+ Add meal`, padding 8px 16px, orange-dimmed background).
- **Progress:** Empty (no trailing action).
- **Settings:** Empty (no trailing action).
In Apple apps, header accessory actions are consistent in geometry: either a 44px circular glyph button or a clear text action button (`Edit`, `Add`), never an ad-hoc mix of text pills on one tab and icon circles on another.

### 6.3 Fragmented Button and Interactive Accent Styles
Primary actions lack a unified visual language:
- **Home:** Quick Log buttons use surface cards with an aggressive 0.92 spring scale. The Weight log button is a purple pill.
- **Workout:** The active session tab is solid blue (`#0A84FF`). The "Done, skip set details" button is solid blue. The "Finish workout" button is an orange-to-coral gradient. The "Log whole session" button is dark gray.
- **Nutrition:** "+ Add meal" is orange-dim with an orange border. Water increment buttons are blue-dim with blue borders.
- **Bottom Sheets:** Primary button is solid orange (`#FF9500`), but in Steps Sheet it is solid green (`#30D158`), and in Water Sheet it is solid blue (`#0A84FF`).
This chromatic shifting makes it impossible for the user to develop an instinct for what a primary interactive element looks like.

### 6.4 List Row Divergence (Grouped vs Isolated)
- **Settings Rows (`.settings-row`):** Clean, 54px min-height, inset grouped container with subtle 1px dividers.
- **Supplement Rows (`.supp-row`):** Grouped container with 64px min-height and 1px divider.
- **Meal Logs (`.meal-item`):** Broken into individual isolated cards with 6px bottom margins, each carrying its own border, background, and persistent red trash button.
- **Dose History Rows (`.dose-history-row`):** Grouped list with 44px min-height and 1px dividers.
Meal items should be brought into alignment with Settings, Supplements, and Dose History by grouping them inside a shared card with dividers.

---

## 7. Motion and Interaction Opportunities

Based on analysis of the shipped code and the visual tour (`docs/media/fittrack-tour.gif`), FitTrack has several high-leverage opportunities to transition from a static web layout to a responsive, native-feeling health tool while adhering to the constraints in `docs/research/competitive-and-design-plan.md`.

### 7.1 Replace Lateral Screen Slides with Instant Fade-Through on Tab Navigation
- **Current Behavior:** In `go(idx)` (lines 973-984), switching tabs applies `translateX(100%)` to `translateX(0)` with a 360ms slide transition.
- **Native Problem:** In iOS and One UI, the bottom tab bar represents a set of parallel top-level spaces. Sliding horizontally across peer tabs implies a hierarchical push/pop drill-down (like pushing a detail view onto a navigation stack). It feels disorienting and slow.
- **Remediation:** Keep lateral swipe gestures only when initiated by a touch drag (`initSwipe()`). When the user taps a tab in the bottom bar, use an instant 120ms to 150ms cross-fade (`opacity: 0 -> 1`) without horizontal displacement.

### 7.2 Eliminate Animation Replay from Zero on Every Rerender
- **Current Behavior:** Every call to `renderHome()` or `renderNutrition()` triggers `animRing()`, `countUp()`, and progress track animations that start from zero. If a user logs a 250ml glass of water or marks a set complete, the entire dashboard rewinds to 0 and re-fills over 1.3 seconds.
- **Native Problem:** Repeatedly replaying full-scale animations on routine data updates feels toy-like and creates severe visual restlessness.
- **Remediation:** Store the previously rendered value in state. On update, smoothly animate only the delta (e.g. from 2,150ml to 2,400ml over 400ms using `--ease-data`), or render the settled value immediately on screen open.

### 7.3 Calibrate Active Press States (Dampen Exaggerated Scales)
- **Current Behavior:** `.qa-btn:active` scales to `0.92` (an 8% shrink).
- **Native Problem:** An 8% reduction on a 70px card creates a jarring visual jump that feels loose and unpolished.
- **Remediation:** Adopt the refined press state already proven in `.supp-row`: `transform: scale(0.985); background: var(--s2); transition: transform 0.12s var(--smooth);`. This provides tactile confirmation without bouncing.

### 7.4 Refine Bottom Sheet Spring Physics
- **Current Behavior:** `#sheet-wrap` uses `transition: transform 0.4s var(--spring)`, where `--spring` is `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **Native Problem:** A curve with a Y2 value of 1.56 produces an intentional 11% overshoot. When a sheet slides up from the bottom of the screen, bouncing past its resting position and settling backward feels bouncy and non-native.
- **Remediation:** Use Apple's standard sheet deceleration curve: `cubic-bezier(0.32, 0.72, 0, 1)` with a 320ms duration. The sheet glides up rapidly and docks smoothly with zero rubber-banding.

### 7.5 Tabular Numeral Transitions on Metric Changes
- **Current Behavior:** Numeric displays use standard proportional font glyphs.
- **Native Problem:** When a number ticks upward (e.g. during a step increment or water logging), glyphs with different character widths (e.g. '1' vs '8') cause adjacent text, units, and card boundaries to jitter horizontally.
- **Remediation:** Enforce `font-variant-numeric: tabular-nums` globally across all counters, badges, and progress readouts.

---

## 8. First 10 Fixes (Ranked by Value per Unit of Effort)

These 10 targeted improvements deliver the largest visible UX upgrades with minimal code complexity, zero risk of regression, and complete fidelity to project facts.

| Rank | Fix Target | Specific Action | Effort | Impact |
|:---:|:---|:---|:---:|:---:|
| **1** | **Truth Defect in Nutrition** | Replace hardcoded `210g` Carbs and `65g` Fat strings on Nutrition screen with live `c.targets.carbs` and `c.targets.fat`. | Very Low (2 lines) | Critical (Data Truth) |
| **2** | **Delete Streaks on Progress** | Remove the `.streak-row` and fire emojis (`🔥 0`) entirely, replacing with a neutral weekly commitments summary. | Low (15 lines) | High (Anti-Guilt UX) |
| **3** | **Global Touch Target Expansion** | Expand `.hdr-btn` (36px to 44px), `.meal-del` (28px to 44px hit box), `.range-tab` (26px to 36px), and `.cal-nav-btn` (30px to 44px). | Low (CSS hit areas) | High (Ergonomics) |
| **4** | **Lead with Clinical Floors** | On Home and Nutrition, replace "kcal remaining" with "kcal to floor" when under 1,600 kcal after 16:00. | Low (Logic branch) | High (Clinical Safety) |
| **5** | **Eliminate Metric Duplication** | Remove the redundant uncontained text row directly beneath Home activity rings (`lines 1063-1067`). | Very Low (5 lines) | Medium (Cleanliness) |
| **6** | **Enforce Tabular Numerals** | Add `font-variant-numeric: tabular-nums` to `.ring-val`, `.steps-num`, `.wt-big`, `.macro-cal-big`, and `.set-inp`. | Very Low (1 CSS rule) | Medium (Visual Polish) |
| **7** | **Instant Tab Cross-Fade** | Replace 360ms lateral `translateX` slide in `go()` with a clean 140ms cross-fade on tab-bar taps. | Low (10 lines JS/CSS) | High (Native Feel) |
| **8** | **Stop Animation Replay from 0** | Cache previous metric values and animate only active deltas rather than rewinding rings to 0 on every render. | Medium (State checks) | High (Calmness) |
| **9** | **Group Meal Items into Cards** | Wrap individual logged meal rows into cohesive grouped cards with 1px dividers, matching the Supplements card. | Low (HTML/CSS wrapper) | High (Visual Unity) |
| **10** | **Notifications Sheet Button Hierarchy** | Demote "Not now" in the notification modal from an identical secondary gray pill to a clean ghost/text button. | Very Low (CSS class) | Medium (Clarity) |

---

## Final report

### Scope and Verification Statement
This visual and UX critique was executed directly against the shipped v1.1.0 codebase (`fittrack.html`, `sw.js`, and associated assets) and the official demo screenshots (`home-dark.png`, `home-light.png`, `workout.png`, `nutrition.png`, `progress.png`, `settings.png`, `notifications.png`). Every finding, line citation, and CSS metric reported above has been verified directly against source files.

In strict adherence to the operating brief:
- **Write Scope:** Exactly one output file was created: `docs/audit-2026-10-05/design-critique.md`. No application code, test files, or existing repository assets were modified.
- **Copy Constraints:** Em dashes have been rigorously excluded across all documentation.
- **Test Integrity:** All automated test suites on the tree were executed and remain 100% green:
  - `node test/syntax-check.mjs`: **PASS** (Inline scripts, sw.js, worker, and all data files valid)
  - `node test/schedule.test.mjs`: **PASS** (25/25 assertions)
  - `node test/progress.test.mjs`: **PASS** (28/28 assertions)
  - `node test/push.test.mjs`: **PASS** (18/18 assertions)
  - `node test/serve.test.mjs`: **PASS** (6/6 assertions)

### Key Takeaway for Implementation
FitTrack's core calculation engines, privacy stance, and local-first architecture are already best-in-class. By executing the 10 prioritized refinements, resolving container proliferation ("card soup"), aligning primary action colors, and respecting minimum 44pt touch geometry, FitTrack will match the calm, polished, native instrument feel exemplified by Apple Health, MacroFactor, and Gentler Streak.
