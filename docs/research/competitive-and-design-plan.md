# FitTrack competitive research and design upgrade plan

**Research date:** 2026-08-29  
**Baseline:** v1.0.0 working tree  
**Primary device:** Samsung Galaxy S26 Ultra in Chrome  
**Secondary device:** iPhone as an installed PWA

## Decision

FitTrack should become the fastest, calmest way for Adnan to answer three questions:

1. Am I eating enough protein and enough total food to protect lean mass?
2. What is the next useful action today, even if I ignored the app last week?
3. Is the weight trend supported by enough real data to trust?

It should not become a smaller copy of Apple Health, Samsung Health, MacroFactor, or Hevy. It should borrow their strongest mechanics while keeping its actual advantage: a free, local-first tool built around one body, one flexible three-session program, ordered food, and a confirmed GLP-1 schedule that is never guessed.

### Research method and confidence

I checked the current FitTrack source, its handoff, its existing competitor research, and the current home screenshot. Competitor mechanics below come from official support pages, official design guidance, current product pages, and current App Store listings. I did not install or operate the paid competitor apps. A mechanic documented by an official help page is treated as verified documentation. A mechanic seen only in a product page or App Store listing is labelled as a product claim, not as hands-on verification.

### Mechanics worth knowing

| Product | Specific mechanic checked | FitTrack decision |
|---|---|---|
| Apple Fitness | Three distinct colors summarize Move, Exercise, and Stand in one compact object. Apple also provides a weekly summary and longer-term Trends, rather than making the rings the only view. The overlapping ring shows that a target was exceeded. [Apple Watch activity guide](https://support.apple.com/guide/watch/track-daily-activity-apd3bf6d85a6/watchos) | Keep stable metric colors and weekly framing. Do not copy ring closure as a success model for calorie intake. On a GLP-1, a partially filled intake ring can represent risk, not failure. |
| Apple Health | The Summary feed lets people pin and reorder important categories. Highlights and Trends sit below those pinned items, and detailed categories offer weekly, monthly, and yearly views. [Apple Health data guide](https://support.apple.com/guide/iphone/view-your-health-data-iphe3d379c32/ios) | Put the current number and meaning first, then reveal the chart. Use progressive disclosure instead of charting every number. |
| Samsung Health and One UI | Samsung Health's Favorite category lets people add, remove, and rearrange trackers. Daily activity groups walking or running time, calories, and distance. Together is a separate surface for leaderboards and challenges. [Samsung Health tracker guide](https://www.samsung.com/us/support/answer/ANS10001351/) One UI separates a top viewing area from a lower interaction area and groups content into focus blocks. [One UI basic layout](https://developer.samsung.com/one-ui/layout/basic.html) | Use a glanceable top area and move frequent controls into comfortable thumb reach. Group related rows into fewer focus blocks. Do not build Together-style social features. |
| MacroFactor | Its expenditure estimate uses weight trend plus logged intake. With insufficient data, the estimate changes to holding instead of inventing an update. Current guidance says nutrition on at least four of seven days and weight at least weekly; a blank day is safer than a partially logged day. [Nutrition frequency](https://help.macrofactorapp.com/en/articles/110-how-frequently-do-i-need-to-log-my-nutrition-for-the-expenditure-algorithm-and-weekly-coaching-updates), [partial logging](https://help.macrofactorapp.com/en/articles/241-what-is-partial-logging), [expenditure versions](https://help.macrofactorapp.com/en/articles/74-expenditure-version) Its food logger surfaces hour-specific go-tos, Latest foods, history results, barcode access, and whole-day copy. [Food logging](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor), [copy and paste](https://help.macrofactorapp.com/en/articles/95-copy-and-paste) | Keep FitTrack's transparent math, add an explicit updating or holding state, and stop treating a partly logged day as a complete low-intake day. Put recent and repeated food before new search. |
| Cronometer | Add Food and Scan Food share the entry flow. Favorites, category filters, multi-add, custom meals, and copied diary groups reduce repeat work. Its paid repeating-food feature can add scheduled items in one action. [Add Food](https://support.cronometer.com/hc/en-us/articles/360018955211-Mobile-Add-a-Food), [custom meals](https://support.cronometer.com/hc/en-us/articles/16510542794004-Mobile-Create-Custom-Meal), [copy and paste](https://support.cronometer.com/hc/en-us/articles/360018695932-Mobile-Copy-Paste) | Add local recent meals and one-tap meal reuse. Do not add scheduling complexity or a paid tier. |
| MyFitnessPal | Its current Today tab opens on the diary. Tapping Log beside a meal opens recent or frequent items, and swiping below a meal name brings forward the foods last logged under that meal. Its barcode scanner is a paid feature. [Today tab](https://support.myfitnesspal.com/hc/en-us/articles/39985611667341-Your-Today-tab), [Premium features](https://support.myfitnesspal.com/hc/en-us/articles/360032625951-MyFitnessPal-Premium-features) | Steal the repeat-last-meal gesture or button. Do not copy the paywall or make the diary the whole product. |
| Lose It | Search learns foods often eaten at the chosen mealtime and shows recent meals for that time. The same flow exposes saved foods, meals, recipes, barcode, photo, and voice. [Lose It food logging](https://loseit.zendesk.com/hc/en-us/articles/49210381551380-How-to-Log-Food-in-Lose-It) | Rank local history by meal and recency. Keep search, manual entry, and the existing sourced database. Skip photo and voice AI. |
| Hevy | During a workout, it shows previous workout values, starts the rest timer when a set is completed, can keep the phone awake, and offers plate math. [Workout tracking](https://www.hevyapp.com/features/track-workouts/), [workout settings](https://help.hevyapp.com/hc/en-us/articles/33882110558743-Workout-Settings-Preferences-Timer-Warm-up-calculator-Plate-Calculator-Smart-Superset-Scrolling) | FitTrack already auto-starts rest and prefills one prior weight. Extend recall to the exact prior weight and reps for each set, keep the active set near the thumb, and add plate math later. |
| Strong | A set is entered as weight and reps, then completed with a checkbox. The default rest timer starts immediately after completion. Templates turn repeated sessions into a starting point. [Perform a workout](https://help.strongapp.io/article/229-my-first-workout), [rest timer](https://help.strongapp.io/article/231-rest-timer), [templates](https://help.strongapp.io/article/105-about-templates) | Preserve FitTrack's checkbox plus automatic timer. Make the timer persistent and the next set obvious. The fixed three-session program already removes the need for a template builder. |
| Boostcamp | Its previous column can autofill today's weight and reps, a set completion starts the timer, and a prior session can repopulate an entire workout. It also includes plate math. [Boostcamp logging tips](https://www.boostcamp.app/blogs/tips-and-tricks-to-using-boostcamp-app), [workout tracker](https://www.boostcamp.app/workout-tracker) | This is the clearest model for the next workout pass: exact per-set recall, one tap to accept, then automatic rest. Do not copy its program marketplace or analytics breadth. |
| Oura | Readiness is a 0 to 100 score built from nine contributors compared with personal baselines, and it may take two weeks to establish those baselines. [Oura readiness contributors](https://support.ouraring.com/hc/en-us/articles/360057791533-Readiness-Contributors) | Borrow a compact daily status presentation, not the score. FitTrack lacks HRV, temperature, and sleep inputs, so a readiness number would be false precision. |
| Whoop | Recovery uses a green, yellow, or red daily status and combines it with a suggested Strain target. Recovery depends on wearable physiology and sleep. [Whoop Recovery](https://support.whoop.com/s/article/WHOOP-Recovery), [Strain Target](https://support.whoop.com/s/article/Strain-Coach) | Use plain-language states such as `Needs a log`, `Protect protein`, or `On track`, each with the exact cause. Do not reduce the app to an opaque traffic-light score. |
| Rise | Rise predicts energy peaks and dips from recent sleep, light exposure, and activity, then lays them out across the day. [Rise energy schedule](https://help.risescience.com/hc/en-us/articles/40672503374871-How-does-RISE-predict-my-Energy-Schedule) | Do not imitate the prediction. FitTrack has none of the inputs. The useful lesson is one current line plus one next action. |
| Zero | Zero's current Protein Score updates with each logged meal and is explicitly positioned for muscle protection, including for people on GLP-1 medication. [Zero Protein Score](https://zerofasting.zendesk.com/hc/en-us/articles/45241450249115-Protein-Score) Its current listing also promotes fasting streaks and challenges. [Zero App Store listing](https://apps.apple.com/us/app/zero-fasting-health-tracker/id1168348542) | Make protein the leading nutrition signal. Reject fasting streaks and challenges because Adnan's present risk is inadequate intake. |
| GLP-1-specific products | Tonic's current App Store listing claims dose and injection-site logging, reminders, side-effect logging, and meal logging. [Tonic App Store listing](https://apps.apple.com/us/app/glp-1-tracker-tonic/id6768771449) Steady's listing claims a dose-cycle view, side-effect check-ins, protein tracking, and a muscle-preservation score. [Steady App Store listing](https://apps.apple.com/us/app/steady-glp-1-tracker/id6761083351) These are listing claims, not hands-on verification. Several product sites make similar claims, including dose-cycle symptom patterns and protein-first plans. | Add a small, factual dose and symptom timeline based only on saved actuals. Do not add an invented medication-level curve, dose advice, or a proprietary muscle score. No checked app demonstrated a verified first-meal protein-front-loading mechanic. FitTrack can make that instruction concrete without pretending it is a score. |

The protein emphasis is not only competitor fashion. A current review proposes an energy floor, at least 1.2 g/kg protein for appropriate adults, meal-wise protein targets, and progressive resistance training during GLP-1 therapy. [PubMed record](https://pubmed.ncbi.nlm.nih.gov/42036071/) FitTrack should still treat Adnan's saved targets as owner decisions, not recalculate them silently.

## 1. What FitTrack already does better than the field, and must not lose

### It has no business-model friction

FitTrack is a free PWA that installs from a link, keeps its core history in local storage, needs no account, and has no subscription prompts or ads. MacroFactor, Oura, Whoop, Rise, and the advanced tiers of the food trackers all have recurring commercial pressure. FitTrack can open directly into the owner's day without login, upsell, onboarding detours, or a cloud dependency. That is a genuine daily advantage, not merely a pricing advantage.

### It is built around the real user, not a generic wellness persona

The food database contains Adnan's actual ordered meals and restaurant context, with published, derived, and estimated confidence badges. It does not assume meal prep or a cooking habit. The training program has three interchangeable full-body sessions, selects the least recently completed session, and includes a detraining ramp-in. A missed Tuesday does not corrupt the program because there is no sacred Tuesday workout.

This is more useful for this owner than Boostcamp's program catalogue or MyFitnessPal's enormous generic database. FitTrack already knows which decisions should not be decisions.

### Its weight and energy logic is unusually honest

The current `trendSeries()` is time-aware, so a missed weigh-in is not treated as a day of no change. `projectTarget()` refuses to project from insufficient data, a rising trend, a flat trend, or an implausibly distant date. It also takes the slower of recent and whole-program loss rates. `estimateTDEE()` works backward from logged intake and smoothed weight change, requires a real time span, requires a minimum amount of food data, and refuses implausible outputs.

MacroFactor is the field leader in adaptive expenditure, but its core algorithm is proprietary. FitTrack's smaller engine has an important advantage for this app: the user can read why a number exists and why it is withheld. Preserve that explainability.

### It understands that low intake is a risk

The saved plan has an explicit calorie floor and a protein target. The Progress screen already explains that on this medication, eating too little can cost muscle. It also tracks creatine and resting heart rate, compares resting heart rate with the owner's own baseline, and refuses to turn a single reading into a conclusion.

Generic calorie trackers primarily celebrate eating less or staying below a ceiling. FitTrack already contains the more relevant model. The design simply does not surface it early enough yet.

### Its GLP-1 schedule model is conservative by construction

The reminder code accepts explicit dated dose steps, checks both ends of the confirmed range, and refuses to name a dose outside it. It never extrapolates the next retatrutide step. That is safer than the medication-level curves and automatic titration tools promoted by several GLP-1 products.

There is one important current-state caveat. The client is not yet sending the owner's confirmed steps to the worker, so dose reminders are intentionally silent. The model is sound, but the v1.0 experience does not yet deliver the promised owner-specific reminder. The plan below fixes that only by recording confirmed actuals, never by recreating a global schedule or inferring a future dose.

### It already contains several best-in-class logging mechanics

FitTrack already does more than the comparison brief assumed:

- Workout sets open with the most recently logged weight for the same exercise.
- Completing a set starts its rest timer automatically.
- A completed session can be logged in one action when Adnan trained but did not record every set.
- A protein shake, creatine, water, steps, and weight all have short logging paths.
- Food search ranks the owner's usual items ahead of weaker generic matches and exposes source confidence.
- Reduced motion is respected, and data-bearing fills use a non-overshooting easing curve.

Do not rebuild these. Tighten the missing last 20 percent.

## 2. Concrete gaps

| Gap in FitTrack now | Named competitor mechanic | The real moment where it bites | Decision |
|---|---|---|---|
| The Progress screen still shows daily gym, protein, and water streaks with fire icons. | MacroFactor labels low-data periods as holding and welcomes the user back. Samsung also offers a weekly report rather than only a daily chain. | Adnan ignores the app from Thursday through Sunday, opens it Monday, and sees three zeros. The interface turns returning into evidence that he failed. | Delete streaks. Replace them with a rolling seven-day card: workouts completed out of three, days with a useful food log, and last weigh-in. Missed days stay visually empty, never red. |
| Home gives calories, protein, and water equal rings, and Nutrition leads with calories eaten and calories remaining. The calorie floor is buried in Progress. | Zero makes protein update after each meal. GLP-1-specific products consistently put protein and muscle protection near the top. Apple uses color to distinguish metrics but does not require every health number to share one equal visualization. | It is 8:30 p.m. after two small meals. The screen says there are calories remaining, but it does not plainly say that intake is below the 1,600 kcal floor or that protein is below the roughly 130 g floor that matters. | Lead with `Protein floor` and `Energy floor`, in plain numbers. Calories above the floor and below the target are neutral. Below the floor is a factual warning. Do not use a closed calorie ring as a moral success state. |
| The configured targets and the Nutrition display can disagree. Current defaults store 165 g carbs and 60 g fat, while the visible bars are hardcoded to 210 g and 65 g. | MacroFactor's visible targets are the current program targets, and Apple Health maintains continuity when the same data appears in summary and detail. | Adnan edits a target in Settings, then Nutrition continues to show another number. The app loses trust in the exact screen where accuracy matters. | Render every visible target from `settings.targets`. Treat this as a truth defect, not a future feature. |
| Food logging starts with search or presets. There is no recent-food row, meal-time history, repeat-last-meal action, or copy-day action. | MyFitnessPal can bring forward the last foods under a meal. Lose It ranks often-eaten and recent meals for that mealtime. MacroFactor surfaces hourly go-tos and Latest. Cronometer supports saved meals and diary-group copy. | Adnan orders the same shawarma plate for the hundredth time and still types `shaw...`, selects it, then selects Dinner. Repetition has not made the hundredth log cheaper than the first. | Show `Recent for this meal` before search and add `Repeat last meal` on each meal header. Keep full-day copy secondary because an entire day is less likely to repeat than one delivered meal. |
| `estimateTDEE()` counts any day with calories as a logged day. A half-logged day can look like a real low-intake day. | MacroFactor explicitly treats partial logging as worse than a blank day and places its expenditure estimate in holding when data is insufficient. | Adnan logs lunch, forgets a late DoorDash dinner, and the app interprets 600 kcal as the whole day. One lazy evening can push the maintenance estimate down for weeks. | Add a local day state: `complete`, `rough estimate`, or `not usable`. Only complete and deliberately estimated days feed expenditure. Display `Updating` or `Holding`, with the exact counts needed to resume. |
| Workout recall applies one previous weight to every set and returns to the programmed rep default. It does not show the exact prior value per set. | Boostcamp lets a previous column autofill today's weight and reps. Hevy displays context-specific previous values. Strong and Hevy start rest immediately on completion. | In the gym with one hand on the S26 Ultra, Adnan did 45 kg for 12, 11, and 9 last time. FitTrack opens three rows at 45 kg and the generic rep target, so he must remember or correct each set. | Store and render exact prior set pairs. One tap accepts both values. After completion, focus or scroll to the next set while the existing timer remains visible. |
| The active rest timer lives inside the expanded exercise card. The next relevant control can move above the thumb or out of view. | Hevy's keep-awake option, Strong's persistent timer, and Boostcamp's next-set flow keep the active workout state visible. | During a 90-second rest, Adnan scrolls to form cues or the next exercise and loses the countdown. He unlocks the phone and searches for the active card. | Add a compact sticky workout strip above the tab bar with exercise, next set, and countdown. Do not add a second timer system. |
| There is no compact, transparent daily status line. The closest equivalent is three equal rings plus several cards. | Oura and Whoop make the day's status glanceable, while Rise pairs a current condition with what comes next. Their scores are supported by data FitTrack does not have. | Adnan opens the app for ten seconds between classes or before ordering dinner. He needs one sentence, not a dashboard tour. | Add one rule-based sentence: `Protein first: 42 g to the floor`, `Log one meal to restart the estimate`, or `2 of 3 sessions done this week`. Always show the cause and the action. Never invent a readiness score. |
| Dose reminders exist in worker logic, but the current client sends no owner-specific confirmed schedule. There is also no symptom log tied to dose day. | Tonic and Steady claim dose, site, reminder, and side-effect timelines. This is the most consistent mechanic across current GLP-1-specific products. | Sunday night arrives and the reminder is silent. After a dose increase, Adnan cannot tell whether nausea and low intake clustered on day one, two, or three. | Let the owner save only confirmed dated doses, log a taken dose, and record a few symptoms with severity. Show the relationship by days since actual dose. Never calculate a new dose or medication level. |
| Plate-loaded work still requires mental arithmetic. | Hevy, Strong, and Boostcamp all document plate calculators. | On Session C, Adnan enters a total load after a hard set and still works out which plates belong on each side. | Add a small offline plate calculator only for exercises marked plate-loaded. Use configured bar and available plates. Keep it out of machine exercises. |
| The Home screen is a long sequence of outlined cards and mini-card grids. Many low-priority items have equal visual weight. | Apple Health separates Pinned, Highlights, and Trends. Samsung Health groups Favorite trackers and lets categories be ordered. One UI uses focus blocks, not an outline around every datum. | On the large Galaxy screen, the primary action can be visually lost among rings, check-ins, steps, four quick actions, and weight. Reaching the top-right 36 px bell also requires hand shifting. | Reduce the number of containers, group related rows, and order cards by safety and next action. Keep the top for viewing and the lower half for logging. Do not add customization until shared users prove they need it. |
| Several controls are visually and physically small: `.hdr-btn` is 36 px, `.meal-del` 28 px, `.cal-nav-btn` 30 px, `.search-clr` 22 px, `.set-chk` 34 px. | One UI calls for comfortably spaced touch areas, and Android recommends at least 48 dp for every interactive target. [Android accessibility guidance](https://developer.android.com/design/ui/mobile/guides/foundations/accessibility) | One-handed use during a workout or meal log causes missed taps, especially on a very large phone where the thumb approaches at an angle. | Expand hit areas to at least 48 by 48 CSS px while keeping icons visually smaller. Put destructive food deletion behind a 48 px target and an undo toast, not a tiny red circle. |
| There is no barcode path. | Cronometer exposes Scan Food beside Add Food. MacroFactor keeps barcode in its toolbar. MyFitnessPal and Lose It put barcode behind paid tiers in their current listings. | A packaged protein snack has a clean barcode but is not in the owner's local list. Manual search costs time and may surface the wrong serving. | Defer to v2.0. First make repeated ordered meals fast. Add camera barcode only if it remains client-only, free, and reliable in both Chrome and Safari with a manual fallback. |

### GLP-1 feature conclusion

The current GLP-1 field is converging on four useful mechanics: dose reminders, symptom severity by day since dose, protein visibility, and muscle-preservation framing. FitTrack already owns the hardest part, an owner-specific plan and honest prediction logic. It needs the small logging surfaces, not a new coaching platform.

No checked product gave verified evidence of a first-meal protein-front-loading UI. Several product pages say `protein first`, but that is a claim, not a demonstrated mechanic. FitTrack should implement it simply: before the first logged meal, the Nutrition header says `Start with protein while appetite is available`; after the first meal, it shows grams logged and grams left to the saved floor. No score is needed.

## 3. Ranked backlog

Scoring uses a 1 to 5 scale. Value is specific to Adnan, where 5 is highest. Cost is implementation cost inside the existing single-file vanilla-JS PWA, where 1 is lowest. Risk is regression or data-integrity risk, where 1 is lowest. Priority score is `value / cost`. Ties are broken by lower risk, then by the feature that protects data or health interpretation.

| Rank | Backlog item | Value | Cost | Risk | Value / cost | Acceptance test |
|---:|---|---:|---:|---:|---:|---|
| 1 | Make nutrition truthful and floor-first. Render configured macro targets, show 130 g protein floor separately from the 150 g stretch target, and show distance from the 1,600 kcal floor before distance from the 1,800 kcal target. | 5 | 1 | 1 | 5.00 | Editing any target changes every display. At 8 p.m. below the energy or protein floor, Home states the exact shortfall and one next action. |
| 2 | Replace daily streaks with a rolling seven-day commitments card and a neutral return state. | 5 | 1 | 1 | 5.00 | After seven empty days, opening Progress shows `0 of 3 sessions this week` and the next session, with no fire, red failure, lost-streak copy, or reset animation. |
| 3 | Add recent meals and `Repeat last meal` before new food search. | 5 | 2 | 2 | 2.50 | A meal logged yesterday can be logged into the same meal today in at most two deliberate taps, with its saved serving and macros visible before confirmation. |
| 4 | Add complete, estimated, and unusable food-day states, plus an explicit expenditure `Updating` or `Holding` state. | 5 | 2 | 3 | 2.50 | A half-logged day does not enter the TDEE calculation. The UI names the number of usable food days and the one log needed to resume. Existing valid estimates remain stable through migration. |
| 5 | Recall exact previous weight and reps per set, then advance to the next set while preserving the automatic rest timer. | 4 | 2 | 2 | 2.00 | If the prior session was 45 x 12, 45 x 11, 45 x 9, the three rows show those three pairs. Completing set one starts rest and places set two in comfortable reach. |
| 6 | Add one transparent daily status line driven by existing facts. | 4 | 2 | 2 | 2.00 | Every state names both cause and action. There is no synthetic score. Empty data produces `Log one meal` or `Log weight`, not `Low readiness`. |
| 7 | Add a weekly recap that combines three sessions, usable food days, protein-floor days, weight trend, and whether the adaptive estimate is holding. | 5 | 3 | 2 | 1.67 | The recap remains useful with missed days and never divides by seven as if blank days were zeros. It fits in one card before any detailed charts. |
| 8 | Add confirmed-dose and symptom logging tied to days since an actual saved dose. | 5 | 3 | 3 | 1.67 | The app never creates a future dose. Outside confirmed dated steps, it says `Confirm dose`. Symptoms can be recorded without enabling reminders, and no symptom changes dose guidance. |
| 9 | Add offline plate math to marked plate-loaded exercises. | 3 | 2 | 1 | 1.50 | Given total load, bar weight, and available plates, the result shows plates per side. Impossible loads are identified rather than rounded silently. |
| 10 | Recompose the visual hierarchy and expand every touch target to at least 48 px. | 4 | 3 | 2 | 1.33 | At S26 Ultra portrait width, the first viewport contains the status, primary safety metric, and one useful action. No target measures under 48 by 48 px, including invisible hit area. iPhone safe areas still work. |
| 11 | Add client-only barcode scanning with search and manual fallback. | 3 | 4 | 3 | 0.75 | It works on current Chrome and Safari without an account, paid API, or build step. A failed scan drops into search without losing the meal context. If that contract cannot be met, do not ship it. |
| 12 | Add per-install pin and reorder controls for Home cards. | 2 | 3 | 2 | 0.67 | Only pursue after real shared users request different priorities. Defaults remain protein, energy floor, weekly training, then secondary metrics. |

## 4. Visual and motion direction

### Design thesis

Make FitTrack feel like a calm health instrument with a human voice. Borrow Apple Health's hierarchy and stable color-to-metric mapping. Borrow One UI's generous viewing area, rounded focus blocks, and bottom-weighted interaction. Keep FitTrack's black canvas, orange-coral identity, direct language, and owner-specific data.

The target is not `Apple Health in orange`. The target is an interface whose visual hierarchy makes the safe next action obvious before it makes the dashboard impressive.

### Information hierarchy

Use this order on Home:

1. **Viewing area:** `Today`, the date, and one factual status sentence. No primary action at the top edge.
2. **Protection card:** protein floor and energy floor. The card changes emphasis only when the saved facts justify it.
3. **Next action card:** active workout, next interchangeable session, confirmed dose action, or weigh-in. Only one leads.
4. **Quick log group:** meal, water, weight, and steps in the lower half, directly above the tab bar.
5. **Secondary summary:** weekly training, water, steps, and weight in grouped rows. Detailed charts remain in Progress.

Apple Health's Pinned plus Highlights pattern is the right structural reference. FitTrack should pin by product logic first, not ask a low-commitment user to configure a dashboard before using it.

### Spacing and reachability

The current UI hardcodes 16 px horizontal margins across most cards. One UI recommends at least 24 dp at the screen edges to avoid curved edges and improve focus. [One UI grid guidance](https://developer.samsung.com/one-ui/layout/grid.html) Do not replace every measurement. Add one page-gutter token, approximately `clamp(18px, 5.8vw, 24px)`, and migrate outer screen margins to it. This gives compact iPhones enough room while letting the S26 Ultra breathe.

Keep 8 px only inside dense set rows. Use 12 px between related rows, 16 px between controls, and 24 px between focus blocks. The current repeated 12 px card gaps make every section feel equally important.

All interactive hit areas must reach 48 by 48 px even when the visible glyph stays at 18 to 24 px. This applies first to the notification button, set completion, food deletion, search clear, range tabs, and calendar navigation.

### Typography

The current system-font stack is correct and should stay. It already resolves to Samsung's system font on Galaxy and San Francisco on iPhone. Do not add a webfont.

The hierarchy needs fewer tiny labels and fewer unrelated sizes:

- Use a 32 to 36 px large title in the top viewing area.
- Use 28 to 34 px tabular numerals for the one leading metric in a card.
- Use 17 px semibold card titles.
- Use 15 px regular body copy with a 1.45 to 1.55 line height.
- Use 12 to 13 px metadata. Reserve 11 px for truly supplemental labels.
- Change `.section-label` from 11 px all-caps to 13 px semibold sentence case. The current uppercase label appears so often that it becomes visual wallpaper.

Keep strong weights for metrics, but stop using 800 weight on every number. Apple guidance recommends using size, weight, and color together to establish hierarchy and avoiding light weights. [Apple typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography)

### Color as data

The current palette is already strong. Keep these roles:

- `--coral`: protein.
- `--blue-light`: water.
- `--purple`: weight and body composition.
- `--green`: completed or safe state, always paired with text or a glyph.
- `--red`: destructive action or urgent factual warning only.
- `--black`, `--s1`, `--s2`: background hierarchy.

The token that is wrong in practice is `--orange`, because it currently means brand accent, selected navigation, calories, food, warm-up, and workout. One color should not mean six things. Apple explicitly recommends consistent meaning, and Samsung uses bright color in small areas while keeping large focus blocks subdued. [Apple color guidance](https://developer.apple.com/design/human-interface-guidelines/color), [One UI color guidance](https://developer.samsung.com/one-ui/color/system.html)

Decision: reserve `--orange` for FitTrack's primary action and workout identity. Use neutral white or `--yellow` for energy intake, with text that distinguishes floor, target, and above-target states. Do not use orange body text merely for decoration.

`--t1`, `--t2`, and `--t3` have already been corrected to useful contrast levels. Keep them. `--t4` is acceptable only for decoration, as the source comment says.

Color may reinforce a state, never carry it alone. `42 g to protein floor` is the meaning. Coral is only the fast visual channel. Apple makes the same recommendation for charts, including alternative shapes and labels. [Apple chart guidance](https://developer.apple.com/design/human-interface-guidelines/charts)

### Card grouping and geometry

The radii are not the problem. `--r-sm:10px`, `--r-md:16px`, `--r-lg:20px`, and `--r-xl:28px` form a coherent family. The problem is applying a rounded outline to nearly every piece of content.

Use:

- `--r-lg` for one primary focus block.
- `--r-md` for grouped rows and compact logging controls.
- `--r-sm` for chips, inline status, and small fields.
- `--r-xl` for sheets only.

Remove borders from most nested rows. Use surface contrast or a single divider inside a grouped card. This creates One UI-style focus blocks and Apple Health-style card grouping without copying either component library.

Do not put three equal activity rings inside one card and then repeat their numbers underneath. That is two representations of the same facts. Show one leading number, one short explanation, and at most one compact supporting bar. A chart belongs only where change over time is the point.

### Empty, missed, and uncertain states

Every empty state should preserve momentum without praise, guilt, or fiction:

- Nutrition: `Nothing logged today. Repeat a recent meal or search food.`
- Workout after a missed week: `Next is Session B. The three sessions are interchangeable.`
- Adaptive maintenance: `Holding at 2,060 kcal. Log one usable food day and a weight to resume.`
- Weight projection: `Not enough spread yet. Three weigh-ins across at least two weeks will start the trend.`
- Symptoms: `No symptoms logged after this dose.`

Do not use an emoji as the only explanation. Keep the current honesty of `not enough data` states, then add the smallest action that resolves them.

### Motion

Keep `prefers-reduced-motion`; it is already implemented correctly. Keep `--ease-data` for progress fills because it does not overshoot. Stop replaying rings, bars, and count-up numbers from zero every time a screen rerenders. A value should animate from its previous rendered value only when it changes, or appear immediately on first render.

`--spring` is valid for a one-time completion check or a sheet settling into place. It is overused on routine presses. Current quick actions scale to 0.92, which feels toy-like and causes too much visual movement for a frequently used control. Use a restrained 0.98 press scale or a surface-color change.

Use motion according to hierarchy:

- A direct tap gets feedback within roughly 100 ms.
- Bottom sheets rise from the bottom while the old surface dims, then reverse on close.
- A horizontal swipe may move peer screens horizontally because the gesture supplies the spatial model.
- A tab-bar tap should use a short fade-through rather than forcing a full-screen lateral journey.
- Expand and collapse should preserve the tapped header's position as much as possible.
- Data transitions should take roughly 450 to 700 ms and never overshoot the represented value.

One UI's current guidance says motion should reveal spatial relationships, respond immediately, accelerate quickly, and settle gently, with ordinary motion kept between 100 and 500 ms. [One UI motion guidance](https://developer.samsung.com/one-ui/motion/basic.html) Apple likewise recommends brief, purposeful motion and avoiding repeated animation on frequent actions. [Apple motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion)

## 5. What not to build

This section is the guardrail. FitTrack will get worse if it chases breadth.

### No social feed, Together clone, leaderboard, or challenges

Samsung Together and Hevy's social feed are account products. They require identities, contact graphs, moderation, and a backend. More importantly, they turn personal health work into comparison. Adnan needs an app that works after silence, not one that tells friends he disappeared.

### No streaks, badges, levels, points, or daily completion score

The existing fire streaks should be removed. A daily chain gives a missed day permanent visual weight. Weekly commitments are sufficient: three flexible sessions, useful food coverage, and an occasional weigh-in. A small completion animation after a real action is feedback, not gamification, and can stay.

### No opaque readiness, recovery, or muscle-preservation score

Oura and Whoop have wearable physiology and personal baselines. FitTrack does not. Steady and newer GLP-1 apps promote proprietary muscle scores, but FitTrack can show the underlying facts directly: loss rate, protein-floor days, and resistance sessions. A made-up 83 out of 100 would be less useful and less honest than `2 of 3 sessions, protein floor on 4 days`.

### No AI chat coach, photo meal estimator, voice nutrition model, or generated meal plan

These features need a model service, an account or key, ongoing cost, and a privacy story. They also introduce uncertainty exactly where FitTrack currently distinguishes published, derived, and estimated food data. Adnan orders repeat meals. Recent history solves his main logging problem more cheaply and more accurately.

### No medication-level curve, dose optimizer, reconstitution calculator, or automatic titration

Several current GLP-1 apps market these. FitTrack must not. Retatrutide is not a normal supplement, the owner's schedule is actual dated information, and the table must stop at the last confirmed step. The app may record a dose and remind from saved confirmed data. It may never recommend, extrapolate, or calculate what to draw.

### No fasting program

Zero's core product is fasting. That is the wrong product model here. The current risk is appetite suppression and under-fuelling. FitTrack should make protein and the energy floor harder to miss, not add a timer that rewards eating less.

### No recipe planner or cooking workflow

The user orders delivery more often than he cooks. The correct nutrition feature is repeatable restaurant meals with transparent confidence, not a seven-day recipe calendar that assumes shopping, preparation, and adherence he has explicitly said will not happen.

### No framework, build step, native wrapper, account system, or new backend

The single-file classic-script PWA is a product constraint. It is why the app is free, link-installable, understandable, and easy to hand to family. Health Connect or Apple Health integration would require a native bridge or wrapper, so it stays out. Cloud sync stays out. Existing free push infrastructure remains the only remote service.

### No dashboard configurator in the near term

Apple Health and Samsung Health let people reorder cards because they serve millions of different use cases. FitTrack knows its primary user. Use that knowledge. Only add local pin and reorder controls after friends and family produce conflicting real needs.

### No chart for every number

Apple's own chart guidance says not every dataset needs a chart. FitTrack should show current protein, floor distance, water, and weekly sessions as numbers or compact bars. Save charts for weight trend, expenditure over time, resting-heart-rate trend, and later dose-cycle symptom patterns.

## 6. Staged roadmap

v1.0.0 remains the usable baseline. Every item below should land as a small, separately verified change, not as one redesign commit.

### v1.1: Resume easily and log faster

Goal: remove the two biggest reasons to avoid reopening the app.

1. Render all macro targets from settings and put protein floor plus energy floor first on Home and Nutrition.
2. Replace daily streaks with a rolling seven-day commitments card and neutral return copy.
3. Add recent foods by meal and `Repeat last meal`.
4. Recall exact prior weight and reps per set, keep the rest timer visible, and advance to the next set.
5. Apply the first visual pass: page gutter, grouped focus blocks, sentence-case section labels, 48 px targets, restrained press feedback, and no replay-from-zero data animation.

This release should already feel materially more like FitTrack's own version of Apple Health and One UI. It does not need new data types.

### v1.2: Make the estimates and GLP-1 week trustworthy

Goal: connect the logs without pretending incomplete data is complete.

1. Add complete, estimated, and unusable food-day states.
2. Add `Updating` and `Holding` to actual maintenance, with exact data requirements.
3. Add confirmed dose logging and a minimal symptom severity log tied to days since the actual dose.
4. Add the one-line daily status and a compact weekly recap.
5. Add plate math only to plate-loaded exercises.

The dose feature must ship only with boundary tests proving no date before the first confirmed step or after the last one can produce a named dose.

### v2.0: Local patterns, only after enough real use

Goal: reveal useful relationships from on-device history without a service, account, or opaque model.

1. Show dose-cycle patterns only after repeated actual observations, for example `nausea was logged on day 2 after 3 of the last 4 doses`. Always show sample count and never imply causation.
2. Show a local muscle-protection summary from plain components: weekly loss rate, protein-floor coverage, and completed resistance sessions. Do not collapse it into a proprietary score.
3. Add barcode scanning only if a free client-only implementation works reliably on both primary and secondary browsers with search and manual fallback.
4. Consider per-install card ordering only if shared users demonstrate different priorities.
5. Add wider-layout adaptations for tablet or landscape only after the primary S26 Ultra portrait and iPhone flows are proven on real devices.

### Definition of success

The upgrade succeeds when all of these are true:

- Returning after seven ignored days feels like resuming, not restarting.
- A repeated ordered meal takes no search and no re-entry.
- A repeated gym set needs one confirmation, not memory and typing.
- The first screen states protein or energy-floor risk before celebrating a calorie deficit.
- The maintenance estimate visibly holds when the log cannot support an update.
- No screen invents readiness, muscle protection, symptoms, or medication dose.
- Every core action is comfortably tappable with one hand on the S26 Ultra and still works in iPhone safe areas.
- The app remains one classic-script PWA, free, accountless, and usable without a paid service.
