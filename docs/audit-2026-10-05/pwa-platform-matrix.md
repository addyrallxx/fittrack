# FitTrack PWA Platform Capabilities Matrix (2026 Mobile Targets)

## Overview and Purpose

FitTrack is an installed Progressive Web App (Add to Home Screen) designed to deliver native-grade smoothness, functionality, UI feel, and user experience. 

This platform audit establishes the exact capabilities and limitations of modern mobile engines when running inside an installed, standalone PWA container. All data points, version numbers, and platform behaviors have been verified by inspecting official documentation from MDN Web Docs, Apple WebKit release notes and engineering blogs, Google Chrome for Developers, web.dev, and W3C/WHATWG specifications.

### Target Device Profiles

1. **Primary Target: Samsung Galaxy S26 Ultra**
   - Operating System: Android 16 with Samsung One UI.
   - Engine: Chromium / Google Chrome for Android (version 135+).
   - Installation Architecture: Installed WebAPK. Android packages the PWA into an operating-system-registered application package minted by Google Play Services, providing system launcher integration, notification channels, and full access to Android intent filters.
   - Display Geometry: CSS viewport 384 x 832, Device Pixel Ratio 3.75, 120 Hz adaptive dynamic AMOLED.

2. **Secondary Target: Apple iPhone**
   - Operating System: iOS 18 and iOS 19.
   - Engine: Apple WebKit / iOS Safari.
   - Installation Architecture: Home Screen Web App in standalone mode (`display: standalone`). WebKit executes the application within an isolated web app container without Safari navigation chrome.
   - Display Geometry: CSS viewport 393 x 852 (standard reference) up to 440 x 956 (Pro Max), Dynamic Island and bottom home indicator bar.

---

## The Platform Capability Matrix

### 1. View Transitions API (Same-Document)

Enables smooth, animated transitions between DOM states (e.g. switching between Home, Workout, Nutrition, Progress, and Settings screens) via `document.startViewTransition()`.

- **Chrome Android Installed (WebAPK):**
  - Status: Supported.
  - Minimum Version: Chrome 111 (March 2023).
  - Standalone Mode Gotchas:
    - Fully hardware accelerated on Android compositor thread.
    - Concurrent transitions: Calling `document.startViewTransition()` while an existing transition is running immediately aborts the active transition, rejecting its `transition.finished` promise with an `AbortError`. Rapid navigation taps must either be debounced or cleanly await transition completion.
    - View Transition Names: Every element assigned a `view-transition-name` must have a unique identifier in the DOM. Duplicate non-none names cause the browser to skip the transition entirely.
    - Motion Sensitivity: Users with "Remove animations" enabled in Android / One UI Settings should receive instant DOM updates via `@media (prefers-reduced-motion: reduce)`.
- **iOS Safari Home-Screen Web App (Standalone):**
  - Status: Supported.
  - Minimum Version: Safari 18.0 (iOS 18.0, September 2024). WebKit implemented same-document view transitions in Safari 18.0 (`document.startViewTransition`), followed by cross-document transitions in Safari 18.2.
  - Standalone Mode Gotchas:
    - Runs in standalone home screen mode as well as Safari tabs.
    - Default duration: Default cross-fade is 250ms. Longer animations can feel floaty on iOS. Keep transitions between 150ms and 200ms.
    - Stacking Contexts: Early Safari 18.0 builds experienced stacking context rendering glitches with nested `::view-transition` pseudo-elements. These were addressed in Safari 18.3.
    - Gesture Synchronization: Native iOS edge-swipe back navigation does not automatically interpolate same-document SPA view transitions; custom routing must hook into `popstate`.
    - Motion Override: Must include an explicit CSS override:
      `@media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }`
- **Opened and Verified Sources:**
  - WebKit Safari 18.0 Release Notes: https://webkit.org/blog/15865/webkit-features-in-safari-18-0/
  - MDN startViewTransition: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
  - Chrome for Developers Same-Document View Transitions: https://developer.chrome.com/docs/web-platform/view-transitions/same-document
  - Can I Use View Transitions: https://caniuse.com/view-transitions

---

### 2. Vibration API (`navigator.vibrate`) and iOS Haptic Routes

Provides physical tactile feedback on button presses, set completion checks, workout timers, and chart scrubbing.

- **Chrome Android Installed (WebAPK):**
  - Status: Supported.
  - Minimum Version: Chrome 32 (January 2014).
  - Standalone Mode Gotchas:
    - User Activation Requirement: Since Chrome 60, `navigator.vibrate()` requires a transient user gesture (direct tap or click). Invoking it outside a user gesture returns `false` and is ignored.
    - Samsung One UI Interaction: Samsung devices feature separate system vibration sliders under Settings > Sounds and vibration > Vibration intensity (specifically "System vibration" and "Touch interactions"). If the user has disabled touch vibration or put the device in Silent mode without vibration, `navigator.vibrate()` returns `true` per specification, but the physical motor remains inactive.
    - Battery Saver: Android Power Saving Mode suppresses vibration motor triggers to conserve battery.
    - Background Execution: Vibration is suppressed when `document.hidden` is `true`.
- **iOS Safari Home-Screen Web App (Standalone):**
  - Status: `navigator.vibrate` is NOT supported (property is `undefined` on `window.navigator` in WebKit).
  - Native Switch Haptic Route (`<input type="checkbox" switch>`):
    - Safari 17.4 introduced the `switch` attribute for checkbox inputs. Starting in iOS 18 (Safari 18.0), WebKit integrated native Taptic Engine feedback into this control. Tapping a native `<input type="checkbox" switch>` triggers a hardware haptic click identical to toggling an iOS system setting.
    - Synthetic Event Restriction: Programmatically calling `.click()` on the switch element does NOT trigger haptics because WebKit requires `event.isTrusted === true`.
    - Touch Overlay Technique: Libraries (e.g. `ios-haptics`, `web-haptics`) overlay a transparent `<label>` associated with an `<input type="checkbox" switch>` directly over actionable buttons. When the user taps, the touch physically lands on the trusted label, triggering the switch toggle and producing a native haptic tick.
  - Alternative Haptic Fallbacks on iOS:
    - Scroller Pickers: Native date, time, and select wheel pickers generate mechanical haptic ticks when manually scrolled by the user, but cannot be triggered via script.
    - Web Audio Impulses: Playing a 3ms to 5ms synthesized 200 Hz burst through the Web Audio API speaker output creates an auditory click that mimics a physical tactile sensation.
- **Opened and Verified Sources:**
  - WebKit Safari 17.4 Release Notes (Switch Control): https://webkit.org/blog/15063/webkit-features-in-safari-17-4/
  - WebKit Safari 18.0 Release Notes (Native Switch Haptics): https://webkit.org/blog/15865/webkit-features-in-safari-18-0/
  - MDN Navigator.vibrate: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
  - GitHub ios-haptics repository: https://raw.githubusercontent.com/tijnjh/ios-haptics/main/README.md

---

### 3. Screen Wake Lock API

Prevents the mobile device screen from dimming or locking during active rest intervals and workout logging.

- **Chrome Android Installed (WebAPK):**
  - Status: Supported.
  - Minimum Version: Chrome 84 (July 2020).
  - Standalone Mode Gotchas:
    - Functions reliably in WebAPK standalone mode.
    - Automatic Release: The wake lock automatically releases whenever the app is minimized, the user switches apps, pulls down the notification shade, or turns off the screen.
    - Visibility Re-acquisition: Apps must listen to `visibilitychange` to re-request the lock when returning to the foreground:
      `document.addEventListener('visibilitychange', async () => { if (wakeLock !== null && document.visibilityState === 'visible') { wakeLock = await navigator.wakeLock.request('screen'); } });`
    - Battery Saver: Extreme low battery mode may force screen sleep despite an active wake lock.
- **iOS Safari Home-Screen Web App (Standalone):**
  - Status: Supported in iOS 18.4+. Broken in iOS 16.4 through 18.3.
  - Minimum Version:
    - Safari Browser Tab: Safari 16.4 (March 2023).
    - Standalone Home Screen Web App: Safari 18.4 (March 2025).
  - Standalone Mode Gotchas:
    - Critical Standalone Bug (WebKit Bug 254545): Although Apple shipped `navigator.wakeLock` in Safari 16.4 for browser tabs, the API was completely non-functional inside standalone Home Screen Web Apps for two years. Calls either hung or silently failed to prevent sleep. Apple resolved WebKit Bug 254545 in Safari 18.4 / iOS 18.4.
    - Standalone PWAs on iOS 18.4 and later keep the screen awake via `navigator.wakeLock.request('screen')`.
  - Fallback Considerations (Silent Video Loop):
    - The legacy workaround (looping a tiny inline `<video>` element) keeps the screen awake on older iOS builds, but introduces severe side effects: it displays an active "Now Playing" widget with media controls on the iOS Lock Screen and Control Center, and can pause or silence background music apps (Spotify, Apple Music). For a fitness app where users listen to workout music, native `wakeLock` is the preferred path, with a clean UI notification fallback rather than video hacking.
- **Opened and Verified Sources:**
  - WebKit Bug 254545 (Resolution in Safari 18.4): https://bugs.webkit.org/show_bug.cgi?id=254545
  - Apple Developer Safari 18.4 Release Notes: https://developer.apple.com/documentation/safari-release-notes/safari-18_4-release-notes
  - WebKit Safari 18.4 Release Notes: https://webkit.org/blog/16478/webkit-features-in-safari-18-4/
  - MDN Screen Wake Lock API: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API

---

### 4. Web Push and Badging API

Delivers scheduled reminders (GLP-1 medication injection doses, hydration checkpoints, gym workouts) and displays badge counts on the home screen icon.

- **Chrome Android Installed (WebAPK):**
  - Web Push Status: Supported (Chrome 42/50+). Delivers reliably via Firebase Cloud Messaging (FCM) and standard VAPID authentication. Push messages wake the service worker in the background.
  - Notification Actions: Supported since Chrome 53. Action buttons declared in the notification payload (e.g. `actions: [{ action: 'logged', title: 'Mark Done' }]`) render directly inside the Android notification tray. Clicking an action button triggers the service worker `notificationclick` event with `event.action` populated.
  - Badging API (`navigator.setAppBadge`): NOT supported on Chrome Android. The Web Badging API is not exposed on Android Chrome. However, Android OS and Samsung One UI automatically place a notification badge dot on the WebAPK icon whenever an active notification exists in the notification drawer.
- **iOS Safari Home-Screen Web App (Standalone):**
  - Web Push Status: Supported since iOS 16.4 (March 2023).
  - Standalone Home Screen Requirement: Web Push is strictly restricted to web apps installed to the Home Screen (`display: standalone`). It is unavailable in mobile Safari browser tabs.
  - Push Prerequisites: Subscribing requires a direct user gesture (e.g. tapping "Enable Push Notifications" in settings). Messages must be encrypted and signed using standard VAPID. Delivery routes through the Apple Push Notification service (APNs) without requiring an Apple Developer account.
  - Notification Actions: NOT supported on iOS Web Push. Action buttons in the push payload are ignored by iOS. Tapping a notification opens the standalone web app directly, dispatching `notificationclick` with an empty `event.action`.
  - Badging API (`navigator.setAppBadge`): Supported since iOS 16.4. Both foreground scripts and background service worker push handlers can call `navigator.setAppBadge(count)` and `navigator.clearAppBadge()`. Badging permissions are bundled with push notification permissions.
- **Opened and Verified Sources:**
  - WebKit Web Push for Web Apps on iOS and iPadOS: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
  - Chrome for Developers Badging API: https://developer.chrome.com/docs/capabilities/web-apis/badging-api
  - MDN PushManager: https://developer.mozilla.org/en-US/docs/Web/API/PushManager
  - MDN Notification actions: https://developer.mozilla.org/en-US/docs/Web/API/Notification/actions
  - MDN Badging API: https://developer.mozilla.org/en-US/docs/Web/API/Badging_API

---

### 5. `interactive-widget` Viewport Meta and `visualViewport` API

Ensures that focused input fields (such as weight, reps, and nutrition quantities) remain visible above the on-screen virtual keyboard.

- **Chrome Android Installed (WebAPK):**
  - Status: Supported.
  - Minimum Version: Chrome 108 (November 2022).
  - Default Behavior vs `interactive-widget`:
    - Prior to Chrome 108, Chrome on Android automatically resized the Layout Viewport when the keyboard appeared.
    - Starting in Chrome 108, Chrome changed the default mobile behavior to `resizes-visual` to match desktop and iOS. Under this default, the layout viewport stays fixed, and elements styled with `position: fixed; bottom: 0` remain pinned behind the keyboard.
    - Adding `interactive-widget=resizes-content` to the viewport meta tag:
      `<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content, viewport-fit=cover">`
      restores automatic layout viewport resizing. The layout viewport height shrinks to the visible space above the keyboard, automatically pushing bottom sheets and fixed toolbars upward.
  - Gotchas: When `resizes-content` is active, keyboard appearance triggers layout recalculation and reflow. Background containers referencing `100vh` or `100dvh` will compress accordingly.
- **iOS Safari Home-Screen Web App (Standalone):**
  - Status: `interactive-widget` is NOT supported in public iOS releases (iOS 18/19). Safari ignores `interactive-widget`.
  - Virtual Keyboard Handling:
    - WebKit never resizes the Layout Viewport when the virtual keyboard appears. Only the Visual Viewport (`window.visualViewport`) shrinks.
    - Viewport units (`100vh`, `100dvh`, `100svh`) do NOT change height when the keyboard opens.
    - iOS Safari attempts to scroll the window to center the focused input, but elements with `position: fixed` remain anchored to layout viewport coordinates, leaving fixed bottom sheets trapped beneath the keyboard.
  - Standalone Mode Mitigation:
    - FitTrack must use the `window.visualViewport` resize listener:
      `window.visualViewport.addEventListener('resize', () => { const offset = window.innerHeight - window.visualViewport.height; sheet.style.transform = offset > 0 ? \`translateY(-\${offset}px)\` : ''; });`
    - Body Scroll Bleed: Tapping an input inside a sheet can cause iOS to scroll the underlying `body` even if `body` has `overflow: hidden`. Setting `preventScroll: true` on programmatic focus or scrolling the sheet content into view prevents screen displacement.
- **Opened and Verified Sources:**
  - Chrome for Developers Viewport Resize Behavior: https://developer.chrome.com/blog/viewport-resize-behavior/
  - Can I Use (interactive-widget): https://caniuse.com/mdn-html_elements_meta_viewport_interactive-widget
  - WebKit Bug 259770 (interactive-widget support): https://bugs.webkit.org/show_bug.cgi?id=259770
  - MDN VisualViewport API: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport

---

### 6. Back Gesture and History in an Installed PWA

Manages Android predictive back navigation and iOS edge-swipe gestures to close modals and bottom sheets before navigating out of the app.

- **Chrome Android Installed (WebAPK):**
  - Status: Supported.
  - Minimum Version: Android 14/15/16, Chrome 120+. Navigation API supported since Chrome 102.
  - System Predictive Back on Galaxy S26 Ultra (One UI):
    - Android 15 and 16 enforce predictive back system-wide.
    - When the user swipes inward from either display edge, Chrome evaluates the history stack. If entries exist (`history.length > 1` or entries pushed via `history.pushState()`), the gesture pops history and dispatches a `popstate` event.
    - Critical UX Requirement: When a bottom sheet, modal, or drawer opens, the application MUST push a synthetic state: `history.pushState({ modal: 'sheetId' }, '')`. When the user swipes from the edge, `popstate` fires, allowing the app to close the sheet while keeping the user inside the app.
    - Trap: If a sheet opens without pushing a history entry, an edge swipe finds no history to pop. The OS immediately initiates the predictive back "minimize app to home screen" transition, inadvertently closing the app.
- **iOS Safari Home-Screen Web App (Standalone):**
  - Status: Supported since iOS 12.2 (March 2019).
  - Standalone Mode Edge Swipe:
    - Standalone home screen PWAs support swiping from the left screen edge to navigate back through history (`pushState` and hash changes).
    - WebKit renders an interactive transition sliding the current view snapshot to reveal the previous view snapshot.
    - Safari 18.0 added `PopStateEvent.hasUAVisualTransition`, allowing SPA scripts to detect whether WebKit has already performed an edge-swipe visual transition so the app can skip running a duplicate transition.
  - Gotchas and Traps:
    - Snapshot Flicker: WebKit captures a static bitmap of the previous state. In SPAs that dynamically re-render content upon `popstate`, users may see a brief flicker of the old snapshot before the fresh DOM renders.
    - Edge Touch Hijacking: Swipes starting within 20px of the left bezel are intercepted by the OS. Horizontal touch carousels or sliders positioned near the left edge will trigger back navigation. Setting `touch-action: pan-y` does not block the iOS system back gesture.
    - Mandatory On-Screen Navigation: Standalone iOS web apps have no hardware or system back button. If an app fails to push history or the user cannot use edge swipe, they become trapped unless an explicit on-screen Back button is provided.
- **Opened and Verified Sources:**
  - Android Developers Predictive Back: https://developer.android.com/about/versions/15/behavior-changes-15
  - Apple Developer Safari 18 Release Notes (hasUAVisualTransition): https://developer.apple.com/documentation/safari-release-notes/safari-18-release-notes.md
  - Maximiliano Firtman (iOS 12.2 Navigation Gestures): https://firt.dev/ios-12.2

---

### 7. `overscroll-behavior`, Pull-to-Refresh Suppression, and Rubber Banding

Prevents accidental page reloads and maintains fixed app structure during rapid vertical scrolling.

- **Chrome Android Installed (WebAPK):**
  - Status: Supported.
  - Minimum Version: Chrome 63 (December 2017).
  - Behavior:
    - Setting `overscroll-behavior-y: contain` on `html, body` completely disables the browser pull-to-refresh reload gesture while preserving the native Android overscroll stretch animation.
    - Setting `overscroll-behavior-y: none` eliminates both pull-to-refresh and overscroll glow animations.
    - Inner scroll containers: Applying `overscroll-behavior-y: contain` to scrollable modal sheets prevents scroll chaining from propagating to the main viewport.
- **iOS Safari Home-Screen Web App (Standalone):**
  - Status: Partial support (works on overflow containers, ineffective on document root).
  - Minimum Version: Safari 16.0 (iOS 16.0, September 2022).
  - Standalone Mode Rubber Banding:
    - Setting `overscroll-behavior: none` or `contain` on `html` or `body` does NOT stop root window rubber banding in iOS Safari. WebKit considers root window bounce a native system attribute and permits elastic bouncing regardless of root CSS declarations.
    - On scrollable sub-containers (`overflow-y: auto`), `overscroll-behavior: contain` correctly halts scroll chaining once the child reaches its boundary, provided content actually overflows the container height.
  - Workaround for True Elastic Lock on iOS:
    To completely eliminate root window bounce in standalone mode, apply the fixed root shell pattern:
    `html, body { position: fixed; width: 100%; height: 100%; overflow: hidden; }`
    `#app-scroller { width: 100%; height: 100%; overflow-y: auto; overscroll-behavior-y: none; -webkit-overflow-scrolling: touch; }`
- **Opened and Verified Sources:**
  - Chrome for Developers overscroll-behavior: https://developer.chrome.com/blog/overscroll-behavior/
  - WebKit Safari 16.0 Release Notes: https://webkit.org/blog/13152/webkit-features-in-safari-16-0/
  - WebKit Bug 176454 (overscroll-behavior): https://bugs.webkit.org/show_bug.cgi?id=176454

---

### 8. Safe Areas and Status Bar Styling

Manages immersive edge-to-edge layouts behind device cameras, Dynamic Island, status bars, and system navigation controls.

- **Safe Area Insets (`env(safe-area-inset-*)`) and `viewport-fit=cover`:**
  - Prerequisite: `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">` is mandatory. Without `viewport-fit=cover`, mobile browsers letterbox content and set all safe area insets to `0px`.
  - Android 15/16 Edge-to-Edge Enforcement (Galaxy S26 Ultra):
    - Apps targeting modern Android are rendered edge-to-edge by default. The system status bar and navigation bar are transparent.
    - WebAPKs draw edge-to-edge underneath the top camera hole and bottom gesture pill.
    - `env(safe-area-inset-top)` reports the camera hole and status bar height (24px to 36px depending on One UI display scaling).
    - `env(safe-area-inset-bottom)` reports the gesture navigation pill height (16px to 24px) or 3-button navigation height (48px). Bottom navigation bars must declare `padding-bottom: env(safe-area-inset-bottom)` to prevent touch collisions with the Android home bar.
  - iOS Safe Area Metrics:
    - Dynamic Island (iPhone 14 Pro, 15, 16): `env(safe-area-inset-top)` is 59px in portrait. In landscape, top inset is 0px, and left or right expands to 59px.
    - Home Indicator: `env(safe-area-inset-bottom)` is 34px in portrait, 21px in landscape.
- **Status Bar Color: `theme-color` vs `apple-mobile-web-app-status-bar-style`:**
  - `<meta name="theme-color">` with Media Queries:
    Supported on Chrome Android 93+ and iOS Safari 15.0+:
    `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFFFFF">`
    `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">`
    Both platforms adapt the status bar background color and automatically set status bar icons to high contrast (black icons on light backgrounds, white icons on dark backgrounds).
  - `apple-mobile-web-app-status-bar-style`:
    - Values: `default`, `black`, `black-translucent`.
    - In iOS 15, Apple deprecated `default` and `black` in favor of standard `theme-color`.
    - `content="black-translucent"` remains active and allows a standalone iOS PWA to render edge-to-edge behind the status bar.
    - Critical Dual-Theme Gotcha: `black-translucent` FORCES white status bar text and icons. On light themes with white backgrounds, the status bar text becomes invisible. FitTrack avoids `black-translucent` and uses standard `theme-color` with CSS safe area padding, allowing iOS and Android to maintain readable status bar text in both dark and light modes.
- **Opened and Verified Sources:**
  - Android Developers Edge-to-Edge: https://developer.android.com/develop/ui/views/layout/edge-to-edge
  - WebKit Safari 15 Release Notes: https://webkit.org/blog/11989/new-webkit-features-in-safari-15/
  - Chrome for Developers theme-color media: https://developer.chrome.com/blog/new-in-chrome-93/
  - Apple Safari HTML Meta Tag Reference: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html

---

### 9. Modern CSS Animation and Performance Features

High-performance declarative CSS primitives for native-grade responsiveness and lightweight rendering.

- **CSS `linear()` Easing Function:**
  - Chrome Android Installed: Supported since Chrome 113 (May 2023).
  - iOS Safari Standalone: Supported since Safari 17.2 (December 2023).
  - Gotchas: Allows approximating physics springs and bounces as multi-stop linear functions running on the compositor thread. Devices on older iOS releases (iOS 17.0, 17.1) discard `linear()`. Always declare a cubic-bezier fallback immediately before `linear()`.
- **`@starting-style`:**
  - Chrome Android Installed: Supported since Chrome 117 (September 2023).
  - iOS Safari Standalone: Supported since Safari 17.5 (May 2024), full parity in Safari 18.0.
  - Gotchas: Defines initial entry values for elements transitioning from `display: none` to visible states without requiring JavaScript `requestAnimationFrame` timing hacks.
- **`transition-behavior: allow-discrete`:**
  - Chrome Android Installed: Supported since Chrome 117 (September 2023).
  - iOS Safari Standalone: Supported since Safari 18.0 (September 2024) for animating `display` (syntax introduced in Safari 17.4).
  - Gotchas: Holds `display: block` during exit transitions until opacity or transform animations finish. On exit, scripts must not remove the element from the DOM until the transition finishes.
- **`content-visibility: auto`:**
  - Chrome Android Installed: Supported since Chrome 85 (August 2020).
  - iOS Safari Standalone: Supported since Safari 18.0 (September 2024).
  - Gotchas: Skips layout and painting for offscreen cards, logs, and food lists. You MUST pair `content-visibility: auto` with `contain-intrinsic-size` (e.g. `contain-intrinsic-size: auto 120px`). Omitting intrinsic size causes container collapse to 0px, causing severe scroll jumping during fast flings.
- **Scroll-Driven Animations (`animation-timeline: scroll() / view()`):**
  - Chrome Android Installed: Supported since Chrome 115 (July 2023). Compositor-driven, 120 fps linked headers and progress meters.
  - iOS Safari Standalone: NOT supported in iOS 18 or iOS 19 (Safari 18/19). Supported in Safari 26 / WebKit mainline.
  - Gotchas: Animations linked to `scroll()` fail silently on current iPhones. Must guard with `@supports (animation-timeline: scroll())` and provide a lightweight passive scroll or IntersectionObserver fallback.
- **Opened and Verified Sources:**
  - WebKit Safari 17.2 Release Notes (`linear()`): https://webkit.org/blog/14787/webkit-features-in-safari-17-2/
  - WebKit Safari 17.5 Release Notes (`@starting-style`): https://webkit.org/blog/15383/webkit-features-in-safari-17-5/
  - WebKit Safari 18.0 Release Notes (`content-visibility`, discrete transitions): https://webkit.org/blog/15865/webkit-features-in-safari-18-0/
  - Chrome for Developers Scroll-Driven Animations: https://developer.chrome.com/docs/css-ui/scroll-driven-animations
  - MDN CSS easing functions: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function

---

### 10. Popover API and `<dialog>` with `showModal()`

Native top-layer presentation primitives providing backdrop dimming, focus isolation, and automated dismiss interactions.

- **Popover API (`popover`, `showPopover()`, `hidePopover()`, `:popover-open`):**
  - Chrome Android Installed: Supported since Chrome 114 (May 2023).
  - iOS Safari Standalone: Supported since Safari 17.0 (September 2023).
  - Behavior: Promoted to the browser top layer above all z-indexes. Provides built-in light dismiss on outside taps or Escape. Popovers do not trap focus, allowing users to tab out.
  - Gotchas: Tapping outside an open popover dismisses the popover and simultaneously executes the click on underlying buttons. On iOS standalone, background scrolling is not automatically blocked by popovers.
- **`<dialog>` with `showModal()`:**
  - Chrome Android Installed: Supported since Chrome 37 (August 2014).
  - iOS Safari Standalone: Supported since Safari 15.4 (March 2022).
  - Behavior: Promoted to top layer with built-in strict focus trapping, native `::backdrop` pseudo-element, and automatic inertness for all background content outside the modal.
  - Standalone Mode Gotchas:
    - Android Back Button: In WebAPKs, pressing Android back or performing an edge swipe triggers the dialog `cancel` event, closing the modal. Apps should coordinate this with history state to avoid desynchronizing navigation stacks.
    - iOS Dismissal: iPhones have no hardware Escape key. Modal dialogs on iOS cannot be dismissed by keyboard; an explicit on-screen close button or backdrop click listener is mandatory.
    - Scrolling Leak: In iOS Safari, scrolling inside a dialog can occasionally drag the background document when hitting boundaries. Setting `overscroll-behavior: contain` on the dialog prevents this leak.
- **Opened and Verified Sources:**
  - WebKit Safari 17.0 Release Notes (Popover API): https://webkit.org/blog/14445/webkit-features-in-safari-17-0/
  - WebKit Safari 15.4 Release Notes (`<dialog>`): https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/
  - MDN Popover API: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
  - MDN HTMLDialogElement.showModal: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal

---

### 11. `inert` Attribute

Global HTML attribute (`<div inert>` or `element.inert = true`) that isolates background screens, inactive bottom sheets, and inactive tab contents.

- **Chrome Android Installed (WebAPK):**
  - Status: Supported.
  - Minimum Version: Chrome 102 (May 2022).
  - Behavior: Blocks all pointer, click, and touch events. Removes descendant elements from the sequential tab order. Strips the subtree from the accessibility tree (TalkBack). Chrome 124+ also hides inert content from find-in-page.
  - Gotcha: Applying `inert` to an element containing `document.activeElement` causes the browser to reset focus to `document.body`. Focus should be moved to the active surface before applying `inert` to the background.
- **iOS Safari Home-Screen Web App (Standalone):**
  - Status: Supported.
  - Minimum Version: Safari 15.5 / 16.0 (May/September 2022).
  - Standalone Mode Gotchas:
    - Tree Hierarchy Trap: If a custom modal or sheet is nested inside `#app-root`, applying `inert` to `#app-root` will also disable the sheet. The modal container must sit as a direct sibling to the container made inert.
    - Visual Styling: The `inert` attribute does not automatically adjust visual styling. Apply CSS explicitly: `[inert] { pointer-events: none; user-select: none; }`.
    - VoiceOver: When removing `inert`, iOS VoiceOver may take a layout tick before recognizing restored interactivity.
- **Opened and Verified Sources:**
  - WebKit Safari 15.5 Release Notes: https://webkit.org/blog/12669/new-webkit-features-in-safari-15-5/
  - MDN HTML global inert attribute: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert
  - web.dev inert article: https://web.dev/articles/inert

---

### 12. Web Share API and Web Share Target

Enables sharing progress summaries, weight cards, and workout logs directly into native apps, and receiving shared content into FitTrack.

- **Web Share API (`navigator.share`, `navigator.canShare`):**
  - Chrome Android Installed: Supported since Chrome 61 (text, URLs) and Chrome 75/76 (files/blobs). Invokes Android native share sheet. Rejection with `AbortError` on user cancel must be caught and ignored.
  - iOS Safari Standalone: Supported since Safari 12.1 (text, URLs) and Safari 14.0 (files/blobs). Opens native iOS Share Sheet (AirDrop, Messages, Mail, Save to Files).
  - Critical iOS Gotcha (Strict Transient User Activation): On iOS Safari, user gesture activation expires almost instantly. If an application performs asynchronous network fetching or heavy `canvas.toBlob()` processing inside a click handler before calling `navigator.share()`, iOS Safari rejects the call with `NotAllowedError`. Workout summary images must be pre-rendered or generated synchronously before invoking `navigator.share()`.
- **Web Share Target (`share_target` in `manifest.json`):**
  - Chrome Android Installed (WebAPK): Supported since Chrome 71 (GET) and Chrome 76 (POST / files).
    - When Chrome mints a WebAPK, it translates manifest `share_target` into native Android `<intent-filter>` entries. FitTrack appears directly in the system share sheet across all Android apps.
    - Incoming files are intercepted by the Service Worker `fetch` handler via `event.request.formData()`.
    - Gotcha: Updates to `share_target` require WebAPK re-minting, which can take 24 to 72 hours to propagate to installed user devices.
  - iOS Safari Standalone: NOT supported.
    - Unsupported across all iOS versions (including iOS 17, 18, 19).
    - Apple WebKit does not implement Web Share Target. iOS reserves system share sheet targets exclusively for native App Store applications with Swift/Obj-C Share Extensions.
    - Manifest declarations are safely ignored by iOS.
- **Opened and Verified Sources:**
  - MDN Web Share API: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
  - MDN Web App Manifest share_target: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
  - Chrome for Developers Web Share Target: https://developer.chrome.com/docs/capabilities/web-apis/web-share-target
  - W3C Web Share Target Specification: https://w3c.github.io/web-share-target/

---

### 13. App Shortcuts, `display_override`, and `launch_handler`

Advanced manifest controls for home screen launcher menus and multi-instance window management.

- **App Shortcuts in Manifest (`"shortcuts"`):**
  - Chrome Android Installed (WebAPK): Supported since Chrome 84 on Android 7.1+.
    - Long-pressing the FitTrack app icon on Samsung One UI reveals quick-action shortcuts (e.g. "Log Workout", "Log Weight").
    - Quota: Chrome limits custom shortcuts to at most 3 entries (one slot is reserved for app info).
    - Format: Requires PNG icons (recommended 192x192); SVG icons are ignored by the Android launcher.
  - iOS Safari Standalone: NOT supported on iOS / iPadOS.
    - Safari 17.4 added manifest `shortcuts` support exclusively for macOS Sonoma. On iOS/iPadOS, long-pressing the home screen icon displays only system actions (Edit Home Screen, Share App, Delete Bookmark). The `shortcuts` array is completely ignored.
- **`display_override`:**
  - Chrome Android Installed: Supported since Chrome 89. Allows prioritizing display modes (e.g. `["standalone", "minimal-ui"]`).
  - iOS Safari Standalone: NOT supported. Safari only evaluates the standard `"display": "standalone"` property.
- **`launch_handler` (`client_mode: "focus-existing"`):**
  - Chrome Android Installed: Supported since Chrome 110. Ensures that tapping the home screen icon or an external notification brings the running app instance into focus rather than creating a duplicate tab or forcing a full page reload.
  - iOS Safari Standalone: NOT supported. Safari ignores `launch_handler` and does not implement `window.launchQueue`.
- **Opened and Verified Sources:**
  - web.dev App Shortcuts: https://web.dev/articles/app-shortcuts
  - WebKit Safari 17.4 Release Notes (Shortcuts on macOS): https://webkit.org/blog/15063/webkit-features-in-safari-17-4/
  - Chrome for Developers Launch Handler: https://developer.chrome.com/docs/web-platform/launch-handler
  - MDN Manifest display_override: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display_override

---

### 14. Storage Persistence and iOS Eviction Rules

Data durability for local logs, nutrition caches, and workout history stored in IndexedDB and LocalStorage.

- **Storage Persistence (`navigator.storage.persist()`):**
  - Chrome Android Installed (WebAPK): Supported since Chrome 55. Calling `navigator.storage.persist()` resolves to `true` automatically for installed WebAPKs without prompting the user. Once persistent mode is granted, storage is protected from automated LRU eviction during low disk space. Origin quota can use up to 60% of available storage.
  - iOS Safari Standalone: Supported since Safari 15.2 (`persist()`) and Safari 17.0 (`estimate()`). In Safari 17.0 (iOS 17), WebKit overhauled storage policies: origin storage can consume up to 60% of total disk space without permission dialogs. WebKit heuristics grant persistent mode to installed Home Screen web apps.
- **WebKit 7-Day Script-Writable Storage Cap (ITP):**
  - Exemption Status: Installed Home Screen Web Apps are EXEMPT from the Safari 7-day storage cap.
  - Official WebKit Confirmation:
    In "Full Third-Party Cookie Blocking and More" (WebKit Blog, March 24, 2020), WebKit tracking prevention lead John Wilander confirmed:
    > "Web applications added to the home screen are not part of Safari and thus have their own counter of days of use. Their days of use will match actual use of the web application which resets the timer. We do not expect the first-party in such a web application to have its website data deleted. If your web application does experience website data deletion, please let us know since we would consider it a serious bug."
  - Storage Isolation Gotcha: Adding an app to the Home Screen creates an independent storage partition. Existing IndexedDB or LocalStorage populated while testing inside a Safari browser tab is NOT automatically migrated to the standalone container. Standalone apps maintain their own clean storage sandbox.
- **Opened and Verified Sources:**
  - WebKit Blog (Full Third-Party Cookie Blocking and More, 7-Day Cap Policy): https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
  - WebKit Blog (Updates to Storage Policy): https://webkit.org/blog/14403/updates-to-storage-policy/
  - web.dev Persistent Storage: https://web.dev/articles/persistent-storage
  - MDN StorageManager.persist: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

---

### 15. Fitness App Capabilities: Recent Changes (Last 12-24 Months)

Modern platform APIs specifically relevant to workout tracking, metrics, and responsive input.

- **Navigation API (`window.navigation`):**
  - Chrome Android: Supported since Chrome 102. Provides interceptable routing (`navigation.addEventListener('navigate')`) and programmatic history management.
  - iOS Safari: Not supported in iOS 18 stable (supported in Safari 26.2 and Technology Preview). FitTrack must retain standard `popstate` and hash routing for iPhone compatibility.
- **Document Picture-in-Picture API (`window.documentPictureInPicture`):**
  - Desktop vs Mobile Status: Shipped in Chrome 116 for desktop. NOT supported on Chrome Android or iOS Safari.
  - Mobile Alternatives for Floating Workout Timers:
    - HTML5 Video PiP via Canvas: Render a live timer onto an offscreen `<canvas>`, capture stream via `canvas.captureStream()`, pipe to a hidden `<video>`, and call `video.requestPictureInPicture()`. Supported on Chrome Android.
    - MediaSession API: Playing a silent background audio track allows updating `navigator.mediaSession.setPositionState()` to display workout time, set numbers, and pause/skip controls directly on the Android/iOS Lock Screen and Notification Shade.
- **Web Bluetooth API (`navigator.bluetooth` - GATT Heart Rate Service 0x180D):**
  - Chrome Android: Supported since Chrome 56. Can pair directly with Bluetooth Low Energy heart rate chest straps and armbands (Polar H10, Garmin, Scosche) via `navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })`.
  - iOS Safari: NOT supported. Apple WebKit explicitly opposes Web Bluetooth on security and fingerprinting grounds.
- **CSS `field-sizing: content` (Auto-Expanding Number and Text Inputs):**
  - Chrome Android: Supported since Chrome 123 (March 2024). Eliminates JavaScript textarea resizing hacks.
  - iOS Safari: Supported in Safari 26 / Technology Preview 220; not available in iOS 18.0 - 18.3. Progressive enhancement via CSS works seamlessly.
- **Screen Orientation Lock (`screen.orientation.lock()`):**
  - Chrome Android: Supported in installed WebAPKs without requiring fullscreen mode (e.g. `screen.orientation.lock('portrait')`). Also respects manifest `"orientation": "portrait"`.
  - iOS Safari: NOT supported. iOS Safari ignores manifest orientation and throws an error on `screen.orientation.lock()`.
- **Opened and Verified Sources:**
  - MDN Navigation API: https://developer.mozilla.org/en-US/docs/Web/API/Navigation
  - Chrome for Developers Document Picture-in-Picture: https://developer.chrome.com/docs/web-platform/document-picture-in-picture
  - WebKit Standards Positions (Web Bluetooth Opposition): https://webkit.org/standards-positions/
  - MDN CSS field-sizing: https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
  - MDN ScreenOrientation.lock: https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock

---

## Build Guidance: Implementation Paths and Fallbacks

### 1. Keep the Screen Awake During a Workout

- **Recommended API Path:**
  Use the standard Screen Wake Lock API (`navigator.wakeLock.request('screen')`).
  - Supported natively on Chrome Android (Galaxy S26 Ultra) since Chrome 84.
  - Supported natively on iOS Safari standalone PWAs in iOS 18.4+ (March 2025).
- **Mandatory Lifecycle Handling:**
  Always re-acquire the lock when returning from the background:
  ```javascript
  let wakeLockSentinel = null;

  async function requestWorkoutWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', () => {
          wakeLockSentinel = null;
        });
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (wakeLockSentinel === null && document.visibilityState === 'visible' && isWorkoutActive()) {
      requestWorkoutWakeLock();
    }
  });
  ```
- **Fallback Strategy:**
  Do NOT use the silent video loop hack on iOS. A hidden playing video hijacks the iOS Lock Screen media widget and silences user music apps (Spotify, Apple Music). If `!('wakeLock' in navigator)` or if the lock request rejects, render an unobtrusive in-app banner advising the user to check their display sleep settings.

---

### 2. Haptic Ticks on Set Check and Chart Scrubbing

- **Recommended API Path:**
  Implement a unified haptics dispatcher that branches by platform capability:
  ```javascript
  function triggerHapticTick(type = 'light') {
    // 1. Primary path: Android Chrome Vibration API
    if ('vibrate' in navigator) {
      try {
        if (type === 'light') navigator.vibrate(10);
        else if (type === 'medium') navigator.vibrate(25);
        else if (type === 'success') navigator.vibrate([15, 50, 15]);
        return;
      } catch (e) {}
    }

    // 2. Secondary path: iOS 18+ Native Switch Element Haptic
    const iosSwitch = document.getElementById('haptic-switch-trigger');
    if (iosSwitch) {
      // Must be triggered by a trusted user touch or via an overlay label
      iosSwitch.checked = !iosSwitch.checked;
    }
  }
  ```
- **Fallback Strategy:**
  For chart scrubbing where fine-grained feedback is desired, pair visual micro-animations (e.g. scale ticks or color pulses) with a subtle, ultra-short Web Audio synthesized impulse (200 Hz sine burst for 4ms) as an acoustic click substitute when physical actuators are unavailable.

---

### 3. Android Back Closing an Open Sheet Before Leaving the Screen

- **Recommended API Path:**
  Coordinate bottom sheets and overlays with synthetic history states:
  ```javascript
  let activeSheet = null;

  function openBottomSheet(sheetId) {
    activeSheet = sheetId;
    // Push a distinct history state entry
    history.pushState({ modalOpen: sheetId }, '', `#${sheetId}`);
    renderSheetOpen(sheetId);
  }

  function closeBottomSheet() {
    if (activeSheet) {
      activeSheet = null;
      renderSheetClose();
      // If closing via UI button and hash matches, pop history
      if (window.location.hash) {
        history.back();
      }
    }
  }

  window.addEventListener('popstate', (event) => {
    // When the user swipes Android back or clicks system back
    if (activeSheet) {
      activeSheet = null;
      renderSheetClose();
    }
  });
  ```
- **Critical Guard:**
  Never display an overlay without pushing a history entry on Android. An edge swipe with an empty history stack causes One UI to trigger the predictive back app exit animation, throwing the user to their home screen.
- **iOS Standalone Requirement:**
  Always provide an explicit on-screen "Close" or "Done" button at the top-right of bottom sheets, because iOS standalone mode does not have a universal system back gesture for custom overlays.

---

### 4. Keyboard Never Covering a Numeric Field in a Bottom Sheet

- **Recommended API Path:**
  Combine the modern viewport meta tag for Android with a `visualViewport` listener for iOS:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content, viewport-fit=cover">
  ```
  1. On Chrome Android (Galaxy S26 Ultra), `interactive-widget=resizes-content` ensures the layout viewport automatically resizes when Gboard or Samsung Keyboard opens, keeping `bottom: 0` sheets above the keyboard purely via CSS.
  2. On iOS Safari (which ignores `interactive-widget`), apply a dynamic translateY offset driven by `visualViewport`:
  ```javascript
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const activeElement = document.activeElement;
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      const bottomSheet = document.querySelector('.bottom-sheet.open');
      
      if (bottomSheet && isInput) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        if (keyboardHeight > 100) {
          // Virtual keyboard is open
          bottomSheet.style.transform = `translateY(-${keyboardHeight}px)`;
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          bottomSheet.style.transform = '';
        }
      }
    });
  }
  ```
- **Safe Area Integration:**
  Ensure input containers have bottom padding that incorporates `env(safe-area-inset-bottom)` so inputs do not touch the keyboard boundary or home bar.

---

### 5. Tab Transitions

- **Recommended API Path:**
  Use same-document View Transitions with progressive enhancement:
  ```javascript
  function switchTab(newTabId) {
    if (!document.startViewTransition) {
      // Immediate fallback for browsers without View Transitions
      updateActiveTabDOM(newTabId);
      return;
    }

    // Check for user-enabled motion reduction
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      updateActiveTabDOM(newTabId);
      return;
    }

    // Native same-document view transition
    const transition = document.startViewTransition(() => {
      updateActiveTabDOM(newTabId);
    });

    transition.finished.catch((err) => {
      // Ignore AbortError caused by rapid tab clicking
      if (err.name !== 'AbortError') console.error(err);
    });
  }
  ```
- **Required CSS Setup:**
  ```css
  /* Crisp 180ms cross-fade for snappy mobile tabs */
  ::view-transition-old(root) {
    animation-duration: 180ms;
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  }
  ::view-transition-new(root) {
    animation-duration: 180ms;
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  }

  /* Accessibility override */
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none !important;
    }
  }
  ```
- **Platform Scope:**
  Supported across both primary target (Chrome Android 111+) and secondary target (Safari 18.0+). Older browsers seamlessly bypass the transition without breaking navigation.

---

## Final report

All 15 target capabilities have been investigated, verified against canonical engine documentation, and cataloged for installed PWA environments on Samsung Galaxy S26 Ultra (Chrome Android WebAPK) and iPhone (iOS Safari standalone home screen web app).

Key strategic findings for FitTrack:
1. **Screen Wake Lock API:** Fully operational on Chrome Android since version 84. On iOS standalone PWAs, it was broken by WebKit Bug 254545 until Apple resolved it in Safari 18.4 (March 2025). FitTrack can now use native wake lock across both modern platforms, safely avoiding destructive silent video hacks.
2. **Keyboard Management:** Chrome Android supports `interactive-widget=resizes-content` to manage layout viewport shrinking automatically. iOS Safari continues to ignore this attribute, requiring the `visualViewport` resize listener fallback to keep bottom sheet inputs visible.
3. **Android Back Navigation:** To support the Galaxy S26 Ultra predictive back gesture, every bottom sheet and modal must push a synthetic history entry upon opening. This ensures edge swipes dismiss sheets rather than exiting the application.
4. **Haptics:** `navigator.vibrate` is the primary path on Android. On iOS, native Taptic feedback is accessible via user interaction with `<input type="checkbox" switch>`, which can be leveraged via transparent overlay labels.
5. **Storage Durability:** Installed Home Screen PWAs on iOS are officially exempt from the WebKit 7-day ITP storage deletion cap, ensuring IndexedDB and LocalStorage durability for user workout logs. Calling `navigator.storage.persist()` on boot guarantees high-priority storage protection across both Android and iOS.
