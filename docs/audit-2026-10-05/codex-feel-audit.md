# C1: FitTrack smoothness and feel audit

2026-10-05. Static reading audit of the 3,152-line fittrack.html baseline. All line ranges below refer to that file unless a filename is given. No browser was run. Dimensions marked calculated are CSS-derived, not measured. Timing values describe source configuration, not achieved frame delivery. Compositor eligibility does not prove promotion or smoothness on a device.

The highest-value change is preserving the surface the user is interacting with. Existing transitions are plentiful, but navigation and several small actions rebuild content and reset scroll. Fix continuity before adding more animation. Keep classic script scope, canonical kg storage, confirmed-only dose rows, free infrastructure, system fonts and network-first service worker behavior.

## 1. Map

### Shell and navigation

| Region | Lines and entry points | Behavior |
|---|---|---|
| Theme and launch | 6-43, 71-86, 88-156; resolveTheme/applyTheme/setTheme 901-921 | Theme paints before CSS. System stack, no downloaded font. Chart.js is a synchronous head script from CDN. Viewport disables zoom. |
| Shell | CSS 157-175; DOM 546-559 | Five absolutely positioned, independently scrolling screens. 100dvh app, fixed safe-area-aware tab bar, status-bar fill. All screens retain will-change:transform. |
| Tab navigation | go/updateTabs 973-988; buildTabs 3089-3102 | go ignores current tab, rebuilds destination, stages it at +/-100%, then double-rAF slides old/new screens for 360 ms. Direction follows index, including non-adjacent tabs. S.screen changes before animation ends. No transition cancellation or history stack. |
| Swipe navigation | initSwipe 3065-3082 | Passive touchstart/move/end. Horizontal dominance plus 8 px activates recognition, release beyond 55 px invokes go to adjacent screen. No finger-following motion, touchcancel, input exclusion or nested scroller exclusion. |
| Render dispatch | renderScreen 3084-3087 | Every dispatched render explicitly sets that screen's scrollTop to zero. |
| External entry | ingestFromHash 941-954, handleAction 2954-2970; init 3104-3149 | Hash actions/steps and SW messages reuse app actions. replaceState only removes consumed hash. No popstate navigation. Manifest shortcuts: water, weight, workout, food. |

### Every screen, list and chart

| Screen | Renderer and CSS | Content and actions |
|---|---|---|
| Home, s0 | renderHome 1027-1129; CSS 176-215, 273-285 | Greeting/date/next-session badge, notification button, three SVG activity rings, duplicate metric totals, three check-in cards, steps progress/log button, four quick-log buttons, current-weight card. ring/animRing/countUp 990-1025; ciCard/toggleCI 1130-1152. Entire s0 replaced on render. |
| Workout, s1 | renderWorkout/exCard 1154-1252; CSS 286-358 | Empty program state or session tabs, progress and whole-session action, ramp-in/warmup, exercise list, expandable cue/set bodies, weight/reps inputs and +/- controls, set checks, per-exercise rest timer/skip, exercise complete, conditional finish action. toggleEx/switchDay/adj/updSet/toggleSet 1253-1294; startRest/stopRest 1295-1315; completeEx 1316-1332; confirm/logWholeSession/finishWorkout 1336-1363. |
| Nutrition, s2 | renderNutrition 1365-1472; CSS 259-272, 359-408 | Calorie total/remaining, three macro bars, floor warning/help, shake/creatine rows, search input/clear/results/manual fallback, grouped meal list/delete, water total/bar/four increments. renderMealSec 1473-1486; delMeal/addWater/quickShake/toggleCreatine 1487-1509. |
| Food search list | allFoods/findFood 1525-1534; foodHistoryIndex/searchFoods 1542-1578; handleSearch/runSearch/fetchFoodAPI/clearSearch 1582-1635 | 120 ms local debounce, 700 ms delayed remote search, up to 10 local plus 4 API results. API insertion replaces the results container's entire HTML. Confidence badges 1536-1541. No recent-meal picker or repeat-meal list. |
| Progress, s3 | renderProgress 2176-2274; CSS 409-462 | Weight chart/range tabs, trend/projection, estimated maintenance, resting HR action/status, optional dose card/history/edit, three streak cards, calendar, body stats/edit. Prediction helpers 1952-2053; doseScheduleCard 2081-2109. Streak UI remains despite research ruling. |
| Weight chart | setRange/buildChart 2329-2358; CSS 410-416 | One Chart.js canvas, weight and target datasets, tooltip, responsive 160 px height, 800 ms canvas animation. Range and theme rebuild chart. No other chart, including no HR chart. |
| Calendar/day detail | calcStreak/buildCal/calNav/showDay 2275-2328; CSS 417-439 | Seven-column monthly grid, previous/next controls, colored dots and legend; tap day opens read-only summary sheet. calNav replaces only cal-card. |
| Settings, s4 | renderSettings 2360-2504; notifRow/pushBanner/toggleNotif 2505-2549; CSS 463-477 | Profile/body, four daily targets, push status/banner and four switches/test, theme selector, system/weight/height/volume selectors, export/clear, About/GitHub link. All settings selector mutations rebuild s4 (861, 869, 885, 890-895, 916-921). Archived toggleRamadan 2552-2555 has no visible control. |
| First-run cover | openOnboard through renderOnboard 1727-1937; CSS 216-252 | Five stages: introduction/name, sex/height/birthday, current/target weight and kg/lb, weekly sessions/optional supplements/GLP-1, summary/start. Back/Continue/Start. Choice/toggle updates are targeted and preserve input. Stage changes rebuild cover/reset scroll deliberately. Three entrance/error keyframes, summary rAF count-up with reduced-motion and hidden-document guards. |

### Every sheet, modal and toast

All ordinary sheets share CSS 478-518 and openSheet/closeSheet 2557-2582. openSheet replaces sheet-wrap, adds dialog semantics, schedules show and focus separately, then binds backdrop close. With a title, the header close button is the first querySelector match, so the comment promising input-first focus is inaccurate. There is no sheet stack, drag handler, focus trap, focus return, Escape handler or inert background. Closing moves the DOM offscreen without clearing or making its controls inert.

| Sheet | Exact entry points/ranges | Inputs or list/actions |
|---|---|---|
| Whole session confirmation | confirmWholeSession/logWholeSession 1336-1352 | Confirm all exercises, shared close. |
| Local food meal selection | pickMealType/logFood 1639-1656, 1668-1677 | Optional grams, confidence/source/note, meal-type button list. |
| API food meal selection | pickMealTypeAPI/logFoodAPI 1657-1667, 1678-1683 | Grams and meal-type list. |
| Dose editor | openDoseSheet/renderDoseEditor/doseDraftChange/Add/Remove/saveDoseSchedule 2115-2159 | Medication name, repeatable date/mg/delete rows, Add row, Save, error block. Add/remove/error rebuild whole sheet. |
| Resting HR | openRhrSheet/saveRhr 2160-2173 | Numeric bpm, Save. |
| Calendar day summary | showDay 2306-2328 | Empty state or badges, workout/nutrition/weight/steps summaries. |
| Help | HELP_TOPICS 610-642; helpBtn 643-646; openHelp 2574-2578 | Six topics: calorie floor, macro targets, weight projection, trend weight, dose schedule, ramp-in. Paragraphs and Close. |
| Weight | openWeightSheet/adjWt/saveWeight 2583-2610 | Decimal weight, +/-0.5, kg/lb, Save. Unit switch reopens sheet. |
| Steps/catch-up | openStepsSheet/saveSteps 2611-2642 | Date, numeric steps, Save, seven recent-date rows. Changing date replaces sheet. |
| Water | openWaterSheet 2643-2656 | Four increments, custom amount, Add. |
| Meal library | openMealSheet 2657-2668 | First 14 inline presets/custom foods, manual button. Uses preset-item rows. |
| Manual food | openManualSheet/saveManual 2669-2697 | Name, calories, protein/carbs/fat, meal select, Add/Save as preset. Closes prior sheet then reopens after 80 ms, before 400 ms close finishes. |
| Target | openTargetSheet/saveTarget 2698-2710 | One numeric target, Save. |
| Body stats | openBodySheet/saveBody 2711-2749 | Current/target weight, body fat, lean mass, height cm or ft/in, Save. |
| Name | openNameSheet/saveName 2750-2756 | Name, Save. |
| Custom exercise | openAddExSheet/saveNewEx 2757-2776 | Name, sets, reps range, starting-weight free text, muscle, Add. |
| Notifications/install | openNotifInfo/reqNotif 2972-3021; promptInstall 2819-2825 | Conditional Enable/Install, Not now/Close, platform guidance. Permission/subscription/network awaits. |
| Clear confirmation | confirmClear 3029-3037 | Destructive confirmation and Cancel. No native confirm dialog. |
| Celebration modal | DOM 560-568; CSS 519-529; celebrate/hideCel/launchConfetti 3039-3055 | Workout complete, Keep going, 52 confetti nodes. Overlay lacks dialog/focus management. |
| Toast | DOM 569-575; CSS 530-535; toast 3056-3063 | Icon/title/subtitle, one shared slot, hides after 3 seconds, later messages overwrite earlier ones. No live-region semantics. |

Native browser surfaces also exist: install prompt, notification permission, date/select pickers and export download. These are not custom app modals. sw.js delivers notification actions without navigating an already-open matching client; preserve that continuity.

### Input and button families

| Family | Source locations | Current ergonomics |
|---|---|---|
| Shared form | 491-502; callers in sheet table | inp-field, inp-row, visual inp-lbl divs, primary/secondary/danger sheet-btn. Inputs lose UA outline and use border-color focus. |
| Workout numbers | 323-338, 1202-1215 | Decimal weight and numeric reps, 44 px inputs, +/- steppers, 34 px completion. Change events save kg/reps. |
| Onboarding | 234-252, 1883-1936 | Button choices/toggles/nav with focus-visible; name, decimal height/weights, date birthday. aria-pressed on choices. |
| Search | 372-392, 1436-1441 | Text, autocomplete off/autocorrect off/spellcheck false, clear div role/button/tabindex without keyboard handler. |
| Integer entries | 1651, 1663, 2164, 2621, 2653, 2675, 2761 | Portion, HR, steps, custom water, calories, exercise sets generally have numeric inputmode. Custom fl oz cannot conveniently enter fractions with numeric keypad. |
| Decimal entries | 2125, 2588, 2676-2680, 2700, 2715-2726 | Doses/weights/macros/body/height have decimal inputmode. Generic target also uses decimal for steps. |
| Dates/text/select | 2124/2130, 2617, 2673/2684, 2752, 2759-2766 | Dose/step dates, medication/food/name/exercise/muscle/reps-range/load strings, meal type select. No enterkeyhint anywhere. Only search declares autocomplete. Most visible labels are unassociated divs. |
| Navigation/actions | 169-181, 213-215, 282-297, 350-358, 407-415, 425-426, 458-477, 488-518 | Tabs, header circles, quick logs, weight, session tabs, complete/finish, water/range/calendar, dose, settings/switch, close/help/preset controls. Numerous inline buttons bypass family feedback (1087, 1398, 1654/1665, 2245, 2429-2468, 2591-2596, 2629). |

### Complete transition and animation inventory

C = only transform/opacity, compositor-eligible. P = paint/style animation, not compositor-only. L = layout animation. M = mixed. `all` is explicitly unsafe even where today's changed properties are narrow. Static top/width/shadow declarations are not animations.

| Line | Selector/site | Animated property and configured duration | Class |
|---:|---|---|---|
| 170 | tab-icon | all, currently selected scale/translate, 250 ms spring | C currently, all hazard |
| 171 | tab SVG | stroke 200 ms | P |
| 172 | tab-label | color 200 ms | P |
| 191 | ring-track | stroke-dashoffset 1,300 ms | P |
| 198 | ci-card | all: background/border, plus scripted transform, 300 ms spring | M |
| 204 | ci-check | all: opacity/scale, 400 ms spring | C currently, all hazard |
| 211 | prog-fill | width 1,000 ms | L |
| 214 | qa-btn | transform 150 ms spring, press .92 | C |
| 234 | ob-opt | transform 140 ms; background/border/color 180 ms | M |
| 236 | ob-tog | transform 140 ms; background/border 180 ms | M |
| 240 | ob-box | transform/background/border 180 ms | M |
| 243 | ob-btn | transform 140 ms spring | C |
| 261 | supp-row | transform/background 150 ms | M |
| 282 | wt-log-btn | transform 150 ms spring, press .95 | C |
| 289 | day-tab | all: background/border/color 200 ms | P currently, all hazard |
| 296 | whole-session-btn | transform 150 ms; border 200 ms | M |
| 299 | ex-card | border-color 300 ms | P |
| 302 | ex-icon | background 300 ms | P |
| 304 | ex SVG | stroke 300 ms | P |
| 316 | ex-chevron | rotation 300 ms | C |
| 320 | ex-body | max-height 0 to 1,600 px, 450 ms | L |
| 326 | set-row | opacity 300 ms | C |
| 328 | set-num | all: background/color, scripted transform, 300 ms | M |
| 335 | set-chk | all: background 300 ms | P currently, all hazard |
| 350 | ex-complete-btn | all: transform/background/color 200 ms | M |
| 356 | finish-btn | transform 150 ms | C |
| 370 | macro-bar-fill | width 900 ms | L |
| 373 | food-search-input | border-color 200 ms | P |
| 383 | sri | background 100 ms | P |
| 407 | water-btn | transform 150 ms, press .94 | C |
| 414 | range-tab | all: background/border/color 200 ms | P currently, all hazard |
| 466 | settings-row | background 100 ms | P |
| 474 | toggle | background 250 ms | P |
| 476 | toggle-knob | translateX 250 ms spring | C |
| 479 | backdrop | background alpha 300 ms; show also enables blur | P |
| 481 | sheet-wrap | translateY 400 ms spring | C |
| 493 | inp-field | border-color 200 ms | P |
| 498 | sheet-btn | transform 150 ms, press .97 | C |
| 514 | preset-item | background 100 ms | P |
| 520 | celebration | opacity 350 ms | C |
| 522 | cel-card | scale .8 to 1, 500 ms spring | C |
| 531 | toast | translateY 400 ms spring | C |
| 979-983 | go | staging transition:none then old/new transform 360 ms | C |
| 1016 | animRing | inline stroke-dashoffset 1,300 ms after 60 ms | P |
| 1147-1148 | toggleCI | inline scale .93 to 1, 400 ms after 60 ms | C |
| 1185 | workout progress | inline width 600 ms | L |
| 1286 | toggleSet | inline scale 0 to 1, 300 ms after 60 ms | C |

There are 42 stylesheet transition declarations and eight further transition declarations/assignments in script/template source (979, 981, 982, 983, 1016, 1148, 1185, 1286). That is 50 declaration/assignment sites. The comment and transition-duration reduced-motion override explain why a text search reports a different count. No explicit height, top, margin or box-shadow transition exists; max-height and width are the confirmed layout animations. Shadows on toggle/toast are static.

| Keyframe | Definition/use | What animates | Class |
|---|---|---|---|
| ob-progress-in | 228 / 224 | scaleX between saved progress fractions, 240 ms | C |
| ob-step-in | 229 / 227, 1935 | opacity/translateX, 220 ms, 0-128 ms stagger | C |
| ob-error-in | 230 / 252 | opacity/horizontal shake, 220 ms | C |
| ex-done-in | 314 / 313 | opacity/scale, 400 ms | C |
| cf-fall | 529 / 528, 3052 | translateY/rotation/opacity, randomized 1.5-2.5 s, delay 0-1.5 s | C |

Other animation: countUp 1018-1025 writes Home text every rAF for 900 ms from zero (not compositor-only). animateObSummary 1853-1871 writes seven summary text values for 460 ms each plus 42 ms stagger, guarded against reduced motion/hidden document. Chart.js canvas animation 2357 lasts 800 ms and is not compositor-only. Rest countdown updates text each second, 1295-1310. Delayed Home/macro fill writes at 1122-1128/1464-1471 replay data after every rebuild. CSS reduced-motion 147-149 covers CSS transitions/keyframes, including inline transitions, but not Home rAF or Chart.js.

## 2. Defects against the bar

Severity: High = disrupts a core repeated flow, accessibility or displayed state. Medium = noticeable continuity/ergonomics cost or credible scaling risk. Low = polish or bounded rare-path cost. Static evidence confirms code behavior; it cannot confirm dropped frames, keyboard occlusion or actual device hit geometry.

| ID | Severity | Evidence and consequence | Package |
|---|---|---|---|
| F01 | High | renderScreen 3084-3087 resets scroll on every dispatch; go 978 dispatches on every visit. Returning to a long Workout/Progress/Settings screen loses place. delMeal 1487, toggleCreatine 1507, completeEx 1331 and settings setters also jump to top after small actions. | P2, P3, P4 |
| F02 | High | First completeEx 1331 rebuilds s1 to add finish control. All expanded exercise bodies are recreated closed; existing timer intervals survive but recreated rest bars are hidden. finishWorkout 1362 and switchDay 1254 also discard DOM. toggleSet 1270-1294 itself is already targeted, do not misreport it as full render. | P3 |
| F03 | High | delMeal/toggleCreatine/addMealItem 1487/1507/1689 replace s2, dropping search query/focus/results and replaying all bars. quickShake uses addMealItem and closes any sheet. addWater 1488-1499 is targeted but leaves percent/goal text stale; Home rings stay stale when water is added there or by a notification action until next render. | P4 |
| F04 | Medium | Width transitions 211/370/1185 and max-height 320-321 cause layout work. The 1,600 px ceiling makes visible expansion timing depend on content height and can clip unusually large custom set counts. Completion collapses body and inserts/hides badges, shifting the tapped area. | P1, P3, P4 |
| F05 | High | Home ring/bar markup starts empty 999-1000/1086, then 1122-1128 replays it. countUp 1018-1025 starts at zero, temporarily replacing correct initial values and repeatedly writing text. Macros/water 1415/1420/1425/1454 replay after 80 ms. Reduced motion does not stop Home countUp; queued callbacks are not canceled on rerender/navigation. | P4 |
| F06 | High | setRange 2331 and buildChart 2338 destroy instead of updating chart. applyTheme 914 also rebuilds. renderProgress 2273 delays rebuild 100 ms and replaces canvas, causing repeated entrance animation. Chart.js 800 ms JS animation ignores CSS reduced motion. | P8 |
| F07 | High | CSS-confirmed targets below 44: hdr-btn 36x36 (180), set-chk 34x34 (335), search-clr 22x22 (378), meal-del 28x28 (401), cal-nav 30x30 (425), sheet-close 30x30 (488), notification switch 44x26 (474/2515). Parent notifRow has no toggle click handler, so its 54 px row does not expand the switch hit area. | P5 |
| F08 | Medium | Calculated calendar cells: (384 - 32 outer margins - 32 card padding - 2 borders - 12 gaps)/7 = about 43.7 px (421/429-430). Water, weight-log, range, skip and inline settings/unit/add-meal buttons have no minimum height and calculated heights below 44 (282, 343, 407, 414, 1087, 1398, 2429-2468, 2595-2596). set-adj 331-332 has 44x44 pseudo hit area, but this can overlap narrow neighboring inputs; actual reach must be hit-tested. sri-add 28 px is a decorative glyph inside a clickable row, not an independent small target. | P5 |
| F09 | Medium | Missing immediate press state on header, tab, day/range/calendar, set check, exercise header, dose buttons, close, deletion and many inline controls. .qa-btn .92/.water-btn .94/.wt-log-btn .95 and scripted CI .93 move too much for frequent taps (215/408/283/1147). reqNotif 2993-3021 awaits work without busy/disabled state. testPush 2884 already gives immediate toast feedback. No in-app haptics; SW notification vibration is a separate behavior. | P5 |
| F10 | High | openSheet query 2569 focuses header Close before input. No saved opener, trap, Escape, background inertness or focus return (2557-2582). Closed sheet DOM remains focusable; offscreen .screen nodes also remain focusable (160, 973-987). Celebration 560-568/3039-3046 has no dialog semantics or focus handling. | P2, P6 |
| F11 | Medium | Sheet handle is decorative (485/2560), no drag-to-dismiss. Replacing sheet content can snap its scroll/focus. openManualSheet closes then reopens in 80 ms (2670-2690) against 400 ms transition; no cancellation or sequencing. Dose add/remove/errors 2138-2150 re-open and rebuild entire editor. | P6, P7 |
| F12 | Medium | Inputs usually have correct inputmode, but no enterkeyhint, generally no explicit autocomplete, and labels are divs (492, input table). No form submit/Enter flow, visualViewport handling or focused-field reveal. preventScroll focus plus bottom fixed sheet may leave an input covered by keyboard; this is a device-validation risk, not a proven observed failure. 15 px shared input font also deserves iPhone keyboard/zoom validation once zoom restriction is corrected. | P7 |
| F13 | High | viewport 6 disables user zoom. body manipulation 151 already reduces double-tap activation, so zoom prohibition should not be the feel strategy. focus-visible styling only covers onboarding and help (239/508); inputs remove default outline at 154. CI/exercise headers/result/preset/settings/calendar divs lack keyboard activation; switch role lacks tabindex/key handling, clear tabindex has no key handling. Toast 569-575 has no status/live region. | P5, P6, P7 |
| F14 | Medium | Tab and swipe both use index-based lateral 360 ms movement (975-983), conflicting with research fade-through for taps. Swipe only reacts on release, can trigger from fields/day-tabs, and has no cancellation handler (3065-3082). Rapid go calls can leave stale double-rAF transitions acting on screens. Browser/Android Back has no app navigation or sheet dismissal integration. | P2 |
| F15 | Medium | Repeated whole-log parsing: DB.log 831, lastWeightFor 737-749 once per unfilled set via 1199, estimateTDEE loop 1993-1996, rhrSeries 2035-2037 (120 full parses), suggestSession 729-731, gymWeekCount 2846-2848. runSearch 1593 reconstructs all meal history per settled query. DB.saveLog 832 rewrites the full log blob on each set adjustment. Cost grows with history; no measured latency claimed. | P9 |
| F16 | Medium | Synchronous CDN Chart.js at 86 blocks parsing even if Progress is never opened. init 3104-3148 reads/parses storage and renders Home/count-up beneath onboarding. loadProgram 721 rebuilds visible Workout after fetch, risking focus/scroll loss. loadFoods 1520 changes data without refreshing current search. push status arrival 2929 rebuilds Settings and removes/inserts banner, shifting controls. | P9, P3, P4 |
| F17 | Medium | Only ob-v and dose-history-mg have tabular-nums (250/454). Home steps/weight/ring, rest countdown, nutrition totals, progress metrics and settings values use proportional numbers (193/209/278/342/366/371/400/405/412/419/438/444/449/472). Text count-up and timer digits can change width. System fonts and reserved chart height 416 are already sound. | P4, P5 |
| F18 | Low | Confirmed forced layout: obShowError writes text/class, then reads offsetWidth to restart animation (1800). applyTheme writes theme then reads getComputedStyle (908-910), forcing style resolution, not necessarily geometric layout. buildChart reads computed styles (2351); no getBoundingClientRect/scrollHeight loops found. Avoid describing all DOM queries or input.value reads as forced layout. | P1 |
| F19 | Low | Paint transitions are common and not automatically jank: colors/borders/strokes in inventory. Full-screen blur surfaces (168/480), permanent five-screen will-change 160 and 52 confetti appends 3050-3053 are plausible memory/paint costs, unmeasured. Confetti still allocates under reduced motion. No explicit animated box-shadow/top/margin was found. | P1, P2, P6 |
| F20 | High | Product feel still contradicts supplied research: Home duplicates rings/totals before floor action (1057-1088); Progress still shows streaks (2182/2251-2255); nutrition renders hardcoded 210/65 targets and denominators (1421/1426/1468-1469). These are known roadmap correctness/hierarchy work, not justification to add scores or rewards. Builders must coordinate separately scoped follow-up rather than quietly redesign semantics in this wave. | Follow-up |

No non-passive scroll/touch listener exists in the reviewed source. Tap highlight is already suppressed (143/152), body touch-action:manipulation is present (151), screens and sheets contain overscroll (160/483), and root overflow is hidden (150-151). Do not report these as missing. Onboarding lacks explicit overscroll containment (218); add coverage and validate installed/browser behavior. Actual Android pull-to-refresh/glow and iPhone rubber-banding require device evidence. No custom font loading shift is present. Data arrival can still replace program/settings regions and shift layout as noted above.

## 3. Work packages

Nine packages, each one concern and bounded to one run below 150k tokens. Builders own only fittrack.html unless their subsequent brief explicitly extends ownership. No service worker, manifest, storage schema or worker-routing changes are needed. New helpers stay in classic script scope. Existing tests run unchanged; do not add a dependency. These are proposed acceptance gates, not results from this audit.

All geometry/correctness gates use 384 x 832 first and 393 x 852 second, both themes, empty and populated synthetic logs, with safe-area checks. Inspect bounding boxes plus elementFromPoint on expanded hit areas. Use MutationObserver node identity/counts and animation keyframe/property inspection. Reduced-motion mode must be included. A headless viewport does not reproduce a real Android/iOS keyboard or Back gesture; label those device checks separately. Never use real personal logs in artifacts.

### P1. Motion contract

Own only token declarations 114-120, reduced-motion 143-149, onboarding error restart obShowError 1797-1805, and confetti allocation launchConfetti 3047-3055. Add duration/easing tokens, a restrained CSS linear() spring with cubic-bezier fallback, and a shared reduced-motion query helper at the token-related JS boundary. Other packages consume tokens when they land; P1 must not rewrite every declaration across the file.

Acceptance: four named duration roles (press, navigation, sheet, data); data duration 450-700 ms and monotonic easing, press 100-160 ms; zero offsetWidth/offsetHeight reads in obShowError; reduced-motion launchConfetti creates zero .cp nodes; CSS transitions/keyframes remain <=1 ms in reduced mode; fallback produces valid computed easing when linear() support is absent. Keep meaningful instant completion feedback. Conflicts: P5 shares reduced-motion/focus reset region if it edits there; P7 shares obShowError. Land P1 first. New helpers must be defined before any execution at startup.

### P2. Navigation continuity

Own shell/screen CSS 158-165, go/updateTabs 973-988, initSwipe 3065-3082, renderScreen 3084-3087, buildTabs 3089-3102, and history listener wiring at 3136-3138. Track scroll per screen, separate content invalidation from tab changes, cancel stale scheduled navigation, mark inactive screens inert. Use short fade-through for tab taps and horizontal movement for deliberate swipe. Keep CSS fallback. View Transitions may be a feature-detected enhancement only after the ordinary path works; do not make it required.

Acceptance: return to each screen preserves scroll within 2 px after 5 round trips; tap transition duration 250-350 ms (instant for reduced motion); ten rapid tab changes settle with exactly one visible/interactive screen matching S.screen; no detached-screen mutation from stale navigation callbacks; touches starting in inputs or horizontal day-tabs cause zero screen changes; touchcancel causes zero navigation; all touch listeners remain passive. App-created history entries support Back to previous screen without reopening consumed action hashes or replaying water logs. Inactive screens contribute zero tabbable controls. Conflicts: P3/P4 must mark screens dirty through P2 contract rather than edit dispatcher; P6 owns sheet history/focus interactions and must integrate after P2; P9 shares init wiring. Preserve initial Home staging and notification routing.

### P3. Workout DOM continuity

Own workout CSS 299-358 (exclude hit-target dimensions assigned to P5), last-weight consumer exCard 1194-1252, toggleEx through finishWorkout 1253-1363, and loadProgram visible-update branch 720-721. One concern: keep active workout controls alive during incremental changes. Insert/update finish action and progress in place; preserve open cards and timer DOM across relevant updates. Replace max-height animation with one layout commit plus compositor visual motion, or instant expansion with short opacity reveal and anchor preservation. Do not claim a continuously height-changing accordion is compositor-only.

Acceptance: toggleSet removes zero existing element nodes and retains every input node/value/focus; first completeEx never replaces s1's child wrapper or unrelated cards; expanded sibling headers retain position within 2 px; timer survives leaving and returning to Workout with correct visible remaining time; all timers are canceled or reconciled on session change, never invisibly orphaned. Expand/collapse animations list zero layout properties; clicked header moves <=2 px during opening; custom 20-set exercise clips zero rows. Completion updates count, percentage and finish label correctly. Conflicts: P5 edits set controls in 323-338, P7 edits inputs 1206/1211, P9 edits lastWeightFor caching. Land those changes through narrow hunks, not concurrent P3 edits. Do not introduce prior-set recall/next-set behavior as a second feature in this package.

### P4. Nutrition and Home incremental data rendering

Own ring/animRing/countUp 990-1025, renderHome data hooks 1027-1129 (preserve structure), renderNutrition/renderMealSec through toggleCreatine 1365-1509, addMealItem 1684-1693, Home refresh callers 953/2609/2641, fill CSS 191/211/370. Keep data DOM stable, update changed values from their previous value, and synchronize Home/Nutrition water state. Add narrow metric-update helpers and stable meal IDs. First mount paints actual values immediately. A number ticker is optional and only for changed values, with cancellation and reduced-motion guards.

Acceptance: creatine and water taps replace zero screen-root nodes; deletion removes exactly one meal row plus an empty group if necessary, with no unrelated row replacement; search input node/value/focus survives creatine/deletion; scroll delta <=2 px except an unavoidable deleted-content clamp. At water goal boundary, amount/bar/percentage/goal/check-in agree on both screens without navigation. Unchanged re-render schedules zero numeric rAF loops and zero replay fill animations. Changed data settles in 450-700 ms, never exceeds actual target; reduced-motion final text appears on first update with zero queued count-up frames. Fills animate scaleX, with zero width transitions in owned regions. Conflicts: P5 metric typography and inline controls, P7 search input, P9 search/data invalidation. Does not alter targets, floors, calories, meal math or kg semantics; F20 is a separate correctness brief.

### P5. Touch control contract

Own button/metric CSS in 169-180, 193/209/214-215, 278/282-283, 289/296, 323-338 dimensions only, 342-343, 378/401/407-408/414/425/430, 438/444/449/458/461, 472/474/488/498/504; inline control sizing/semantics at 1087, 1131, 1222, 1398, 1439, 1597/1623, 1654/1665, 2245, 2295/2297, 2368-2484, 2512-2516, 2591-2596, 2629, 2661. Use one consistent press policy and tabular numerals. Expand targets to research's 48 px requirement, which exceeds the audit's 44 px defect threshold. Set row/calendar need actual reflow, not overlapping invisible targets. Add a scoped delegated optional haptic helper near buildTabs without editing navigation itself. Android only via feature detection and isIOS exclusion, one short pulse per successful deliberate action; no haptics for typing or automatic refresh.

Acceptance: every owned actionable hit area >=48x48, no overlaps with neighboring fields and no horizontal overflow at both widths. Seven calendar columns cannot fit seven 48 px square cells within this card: change calendar geometry with >=48 px height and explicitly document width exception if preserving seven columns, or design a separate 48 px day-selection action. Do not falsely pass universal 48x48 with overlapping pseudo targets. Press feedback starts on pointerdown with CSS state immediately and maximum scale reduction 2%; all owned controls have visible focus and keyboard activation. All owned numeric labels compute tabular-nums. Vibrate stub receives at most one 8-15 ms pulse per eligible action, zero on iOS, unsupported devices or reduced motion. Conflicts: broad markup/CSS overlaps P3/P4/P6/P7/P8. Schedule as a serial integration pass after those regions stabilize. Notification busy feedback belongs here only if reqNotif 2993-3021 is explicitly added to builder ownership; then keep requestPermission as the first awaited call.

### P6. Sheet lifecycle

Own sheet/backdrop CSS 479-489, openSheet/openHelp/closeSheet 2557-2582, openManualSheet sequencing 2670/2672/2690, celebration DOM 560-568 and celebrate/hideCel 3039-3046. One reusable sheet/modal lifecycle: cancelable open/close, saved opener/focus trap/background inert, handle-only drag-to-dismiss and history hooks. Fade fixed-color backdrop with opacity instead of background-alpha transition; retain safe-area/scroll behavior. Keep drag independent of sheet content scrolling, and respect reduced motion.

Acceptance: input-first focus when a form is present, otherwise Close; Tab/Shift+Tab never leave modal; Escape and Back dismiss top overlay once; close returns focus to surviving opener; hidden sheet has zero tabbable controls. Drag from handle beyond 80 px dismisses, below 40 px settles, upward/content scroll never dismisses; settle 250-400 ms, instant reduced mode. Twenty rapid open/close/replace calls leave one or zero dialogs and correct backdrop/pointer state. Manual-entry handoff never leaves duplicate dialogs or a stray reopen after closing. Overlay animations use only transform/opacity. Conflicts: P2 history/inert integration, P5 close size, P7 viewport/focus behavior, P1 confetti boundary. Implement after P2. Celebration uses same accessibility lifecycle without changing saved workout behavior.

### P7. Input ergonomics

Own viewport line 6, input focus/label CSS 154/492-495, input attributes/labels in 1206/1211, 1438, 1651/1663, 1887-1899, 2124-2130, 2164, 2587-2588, 2616-2621, 2653, 2673-2684, 2700, 2715-2726, 2752, 2759-2766; obShowError focus branch 1801-1804 and dose editor incremental row changes 2121-2139. Add bounded keyboard-reveal logic at sheet helper boundary through P6's callback contract. Preserve drafts on dose row operations and validation. Keep reps/load ranges as text, not blindly numeric fields.

Acceptance: every owned field has an associated label or explicit accessible name, deliberate autocomplete policy and enterkeyhint; integer/decimal keypads match their values, including fractional fl oz. Enter advances or submits exactly once without hiding validation. Dose Add preserves existing input identities and values, Remove deletes only one row, errors retain focus/draft. Remove zoom lock while retaining manipulation behavior. Simulated visualViewport resize to 384x420 leaves active input and submit reachable by scrolling, no clipped bottom safe area; real Samsung Chrome and iPhone Safari keyboard checks remain mandatory separately. Conflicts: P3/P4 input templates, P5 semantic controls, P6 focus/viewport boundary, P1 error restart. Schedule after renderer and sheet work.

### P8. Chart lifecycle

Own setRange/buildChart 2329-2358, applyTheme chart call 914, renderProgress chart hook 2273, chart CSS 410-416 excluding target sizing P5 owns. Update datasets/options on existing canvas, only destroy when canvas is actually removed. Guard scheduled work against stale render. First presentation should not repeatedly redraw from zero. Use reduced-motion-aware JS animation and honest empty-state presentation. Keep weight data and target conversion at render via toDisp.

Acceptance: ten range switches plus two theme switches on same canvas cause zero destroy calls and exactly one constructor total; no delayed build targets a detached canvas; range/theme update preserves focus/scroll within 2 px. Reduced motion sets chart animation duration to zero; normal data-change animation <=700 ms. Height remains 160 px and chart card edges shift <=1 px on data update; kg/lb labels and plots match existing conversion. Conflicts: P2 invalidation lifecycle, P5 range sizing, P9 data snapshot. Can run parallel with P3/P4 after P2 contract. Canvas drawing is main-thread work; do not call it compositor-only.

### P9. Storage and startup read efficiency

Own DB read/write internals 806-838, lastWeightFor 737-749, suggestSession 726-733, search history/cache hooks 1542-1557/1588-1594, fetchFoodAPI/clearSearch 1607-1635, estimateTDEE read loop 1984-2000, rhrSeries 2033-2040, gymWeekCount 2843-2851, startup ordering 3104-3148, CDN script loading 86. Use operation-scoped snapshots first. If adding longer-lived cache, invalidate after all relevant writes and reconcile external storage events. Prevent stale API queries from appending to new results, clear pending searches, update current search after foods arrive through an explicit P4 contract. Lazy-load existing Chart.js through P8, with offline fallback consistent with current SW, never add a dependency or cache-first rule.

Acceptance: one Progress render parses ft_logs <=2 times (instrument JSON.parse/storage reads), one Workout render <=2, one search query <=1. With synthetic 365-day logs, saved data is byte-equivalent in meaning, and reload/external storage change reflects updates. Deferred responses for query A cannot modify query B results; clearing search produces zero later results insertions. Cold Home renders before Chart.js network response; unavailable Chart.js leaves Home/Workout functional and Progress displays a bounded explanatory state. No repeat foreground renderer runs merely because push status resolves; update only its banner/switch region. Conflicts: P2 init listeners, P3 lastWeightFor/loadProgram consumer, P4 search/render helpers, P8 lazy-chart contract. Run last after these interfaces stabilize. Do not change syncPush subscription sequencing or reminder routes.

List swipe/long-press is deliberately deferred. Current inline delete and exercise expansion already support the essential actions; adding a competing horizontal gesture before P2/P6/P5 settle would increase accidental navigation risk. No standalone number-ticker package is needed because P4 owns value continuity.

### Verification and merge discipline

Each package runs syntax-check plus the five Testing entry points before completion: syntax-check, schedule, progress, push and serve tests. No commit or push in this wave. Parallel agents work in isolated worktrees and own narrow hunks; line ranges identify this baseline, function/selector names anchor later revisions. Renderer packages must not independently modify go/renderScreen/shared sheets. Keep a documented small helper contract between packages, then reconcile sequentially.

This audit runs those tests without browser use. Future builders finish correctness/geometry first, then at most one performance measurement last using one headless Chrome on a scanned free CDP port; close it immediately. Record the result with the required machine busy caveat. Do not iterate on frame timings or mistake 120 Hz emulation for verified phone smoothness.

## Final report

Verification on the audit tree: syntax-check PASS; progress 28/28; push 18/18; schedule 25/25; serve 6/6. Source SHA256 readbacks for fittrack.html, sw.js and manifest.json match the initial audit baseline. Static count confirmed 42 CSS transition declarations and five keyframes. No browser or performance measurement was run. A concurrent .gitignore modification appeared during the run; C1 did not edit it.

Top five packages in recommended order:

1. P1 motion contract, establishing small shared tokens and reduced-motion behavior.
2. P2 navigation continuity, eliminating universal scroll reset and unsafe transition overlap.
3. P3 Workout DOM continuity, preserving set controls, open cards and rest timer.
4. P4 Nutrition/Home incremental data rendering, preserving search/scroll and avoiding replay-from-zero.
5. P6 sheet lifecycle, making overlays dismissible, focus-safe and stable.

Parallel groups: first P1 alone, then P2 alone. After those contracts land, P3, P4 and P8 can run together on disjoint renderer regions. P6 can run with P8 if P8 is still outstanding, but not with P4's sheet-calling action changes without explicit hunk coordination. P7 follows P3/P4/P6. P5 is a serial touch/semantics integration pass because its target spans those templates. P9 follows the lifecycle/render/chart changes and preserves their contracts.

Separate follow-up briefs must address F20 (truthful target displays, floor-first hierarchy and removal of streak UI), plus genuine real-device keyboard/Back/overscroll acceptance. This reading audit makes no device smoothness or performance claim. The main decision is to fix retained state and DOM continuity before adding gestures or decorative motion.
