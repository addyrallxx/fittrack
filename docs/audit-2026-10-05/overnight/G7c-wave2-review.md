**SINGLE-SHOT MODE (overrides any instruction to read or write files):** everything you need is inline below. Use NO tools at all: no file reads, no searches, no commands, no writes. Reply with the complete report in Markdown as your one and only answer. No em dashes anywhere.

# G7: adversarial review of today's FitTrack changes


Below is the full `fittrack.html` diff of today's wave (a single-file vanilla JS PWA, classic scripts, inline onclick handlers, kg in storage, network-first service worker). Find REAL defects only: logic bugs, regressions in existing behaviour, state that can go stale, history or focus bugs, accessibility breaks, layout-property animation, places that ignore reduced motion, unit-conversion mistakes (storage must stay kg), memory leaks (listeners or observers never removed), anything that could break offline. For each: severity (high, medium, low), the exact diff lines quoted, what goes wrong and the concrete steps to trigger it, and the minimal fix. If you are not sure a defect is real, label it "suspect" and say what would confirm it. Do not report style preferences. Do not invent code that is not in the diff. End with `Final report` listing the high-severity items.

---
diff --git a/fittrack.html b/fittrack.html
index 6a3691e..f8b5926 100755
--- a/fittrack.html
+++ b/fittrack.html
@@ -112,14 +112,20 @@
   --coral-text:var(--coral);--blue-text:var(--blue);--blue-light-text:var(--blue-light);
   --red-text:var(--red);
-  --spring:cubic-bezier(0.34,1.56,0.64,1);
-  /* Data-bearing fills use ease-out-quint, never --spring. A spring overshoots
-     its target by ~11%, so a ring or bar driven by a real number would render
-     past that number before settling back. Fine on a button press, misleading
-     on a value the user is meant to read. */
-  --ease-data:cubic-bezier(0.22,1,0.36,1);
-  --smooth:cubic-bezier(0.25,0.46,0.45,0.94);
+  --dur-press:120ms;--dur-nav:200ms;--dur-sheet:350ms;--dur-data:550ms;
+  --ease-out:cubic-bezier(0.22,1,0.36,1);
+  --ease-sheet:cubic-bezier(0.32,0.72,0,1);
+  --ease-press:cubic-bezier(0.25,0.46,0.45,0.94);
+  /* Data-bearing fills stay monotonic. Springs belong to spatial feedback. */
+  --ease-data:var(--ease-out);
+  --smooth:var(--ease-press);
+  --spring:cubic-bezier(0.22,1,0.36,1);
   --r-sm:10px;--r-md:16px;--r-lg:20px;--r-xl:28px;
   --tab-h:64px;--safe-b:env(safe-area-inset-bottom,16px);--safe-t:env(safe-area-inset-top,0px);
 }
+/* Piecewise spring peaks at 1.03 (3 percent), then settles. Older browsers
+   retain the monotonic cubic-bezier fallback above. */
+@supports (animation-timing-function:linear(0,1)){
+  :root{--spring:linear(0,0.2 10%,0.55 22%,0.82 36%,0.97 50%,1.03 64%,1.015 78%,1 100%);}
+}
 /* Light appearance. Designed, not inverted: real surfaces (white cards on an
    off-white page, the same elevation direction dark mode uses, just toward
@@ -142,9 +148,8 @@
 }
 *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;}
-/* One switch for the whole app. Confetti, ring fills and screen slides all run
-   off animation/transition, so cutting both to ~0 honours the OS setting
-   without hunting down every keyframe. */
+/* CSS movement completes immediately, including delayed animations.
+   JS allocation and motion use prefersReducedMotion() below. */
 @media (prefers-reduced-motion:reduce){
-  *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important;}
+  *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;animation-delay:0ms!important;transition-duration:0.01ms!important;transition-delay:0ms!important;scroll-behavior:auto!important;}
 }
 html{height:100%;overflow:hidden;background:var(--black);}
@@ -158,9 +163,17 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 #app{width:100vw;height:100dvh;display:flex;flex-direction:column;position:relative;overflow:hidden;}
 #screen-container{flex:1;position:relative;overflow:hidden;}
-.screen{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;padding-bottom:calc(var(--tab-h) + var(--safe-b) + 20px);padding-top:var(--safe-t);will-change:transform;background:var(--black);transform:translateX(100%);}
+.screen{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;padding-bottom:calc(var(--tab-h) + var(--safe-b) + 20px);padding-top:var(--safe-t);background:var(--black);visibility:hidden;pointer-events:none;transition-property:none;}
 /* Home is the only screen parked on-stage at first paint. Without this every
-   .screen sits at translateX(0) and #s4 (Settings), last in the DOM, covers
-   Home on load. go() overwrites these via inline cssText afterwards. */
-#s0{transform:translateX(0);}
+   Settings, last in the DOM, would otherwise cover Home on load. */
+#s0:not([aria-hidden="true"]),.screen.nav-active{visibility:visible;pointer-events:auto;}
+.screen.nav-out{visibility:visible;pointer-events:none;}
+.screen.nav-fade-in{will-change:opacity;animation:nav-fade-in calc(var(--dur-nav) * .8) var(--ease-out) both;}
+.screen.nav-fade-out{will-change:opacity;animation:nav-fade-out calc(var(--dur-nav) * .8) var(--ease-out) both;}
+.screen.nav-slide-in{will-change:transform;animation:nav-slide-in calc(var(--dur-nav) * 1.2) var(--ease-out) both;}
+.screen.nav-slide-out{will-change:transform;animation:nav-slide-out calc(var(--dur-nav) * 1.2) var(--ease-out) both;}
+@keyframes nav-fade-in{0%,40%{opacity:0;}100%{opacity:1;}}
+@keyframes nav-fade-out{0%{opacity:1;}40%,100%{opacity:0;}}
+@keyframes nav-slide-in{from{transform:translateX(calc(var(--nav-dir) * 100%));}to{transform:translateX(0);}}
+@keyframes nav-slide-out{from{transform:translateX(0);}to{transform:translateX(calc(var(--nav-dir) * -100%));}}
 .screen::-webkit-scrollbar{display:none;}
 /* TAB BAR */
@@ -189,5 +202,6 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .ring-svg-wrap svg{width:86px;height:86px;transform:rotate(-90deg);}
 .ring-bg{stroke:var(--s3);fill:none;}
-.ring-track{fill:none;stroke-linecap:round;transition:stroke-dashoffset 1.3s var(--ease-data);}
+#s0,#s0 *,#s2,#s2 *{font-variant-numeric:tabular-nums;}
+.ring-track{fill:none;stroke-linecap:round;transition:stroke-dashoffset var(--dur-data) var(--ease-out);}
 .ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
 .ring-val{font-size:16px;font-weight:800;line-height:1;letter-spacing:-0.5px;}
@@ -209,5 +223,5 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .steps-num{font-size:32px;font-weight:800;color:var(--green-text);letter-spacing:-1px;line-height:1;}
 .prog-track{height:6px;background:var(--s3);border-radius:3px;overflow:hidden;}
-.prog-fill{height:100%;border-radius:3px;transition:width 1s var(--ease-data);}
+.prog-fill{height:100%;border-radius:3px;width:100%;transform-origin:left;transition:transform var(--dur-data) var(--ease-out);}
 /* QUICK ACTIONS */
 .qa-grid{margin:0 16px 12px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;}
@@ -287,5 +301,5 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .day-tabs{padding:0 16px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px;}
 .day-tabs::-webkit-scrollbar{display:none;}
-.day-tab{flex-shrink:0;min-height:44px;padding:7px 14px;border-radius:20px;border:1px solid var(--border);background:var(--s1);color:var(--t2);font-size:12px;font-weight:600;transition:all 0.2s var(--smooth);line-height:1.15;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;}
+.day-tab{flex-shrink:0;min-height:44px;padding:7px 14px;border-radius:20px;border:1px solid var(--border);background:var(--s1);color:var(--t2);font-size:12px;font-weight:600;transition:background var(--dur-press) var(--ease-out),border-color var(--dur-press) var(--ease-out),color var(--dur-press) var(--ease-out);line-height:1.15;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;}
 .day-tab-label{font-size:9px;opacity:.7;}
 .day-tab.active{background:var(--blue);border-color:var(--blue-text);color:#fff;}
@@ -299,5 +313,5 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .ex-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;transition:border-color 0.3s;}
 .ex-card.completed{border-color:var(--green-border);background:var(--green-faint);}
-.ex-hdr{padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;touch-action:manipulation;}
+.ex-hdr{padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;touch-action:manipulation;position:relative;}
 .ex-icon{width:42px;height:42px;background:var(--blue-dim);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.3s;}
 .ex-card.completed .ex-icon{background:var(--green-dim);}
@@ -310,14 +324,18 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .ex-meta{font-size:12px;color:var(--t2);max-width:100%;overflow-wrap:anywhere;}
 .ex-muscle{max-width:100%;overflow:hidden;text-overflow:ellipsis;font-size:9px;font-weight:700;background:var(--blue-dim);color:var(--blue-light-text);padding:3px 8px;border-radius:8px;white-space:nowrap;letter-spacing:0.3px;text-transform:uppercase;}
-.ex-done-badge{width:24px;height:24px;background:var(--green);border-radius:50%;display:none;align-items:center;justify-content:center;opacity:0;transform:scale(0);flex-shrink:0;}
+.ex-done-badge{width:24px;height:24px;background:var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0);position:absolute;right:16px;pointer-events:none;}
 .ex-card.completed .ex-done-badge{display:flex;opacity:1;transform:scale(1);animation:ex-done-in 0.4s var(--spring);}
 @keyframes ex-done-in{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
 .ex-done-badge svg{width:12px;height:12px;stroke:#000;stroke-width:2.5;fill:none;stroke-linecap:round;stroke-linejoin:round;}
 .ex-chevron{width:18px;height:18px;flex-shrink:0;transition:transform 0.3s var(--smooth);}
-.ex-card.completed .ex-chevron{display:none;}
+.ex-card.completed .ex-chevron{visibility:hidden;}
 .ex-chevron svg{width:16px;height:16px;stroke:var(--t3);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
 .ex-card.open .ex-chevron{transform:rotate(180deg);}
-.ex-body{max-height:0;overflow:hidden;transition:max-height 0.45s var(--smooth);}
-.ex-card.open .ex-body{max-height:1600px;}
+.ex-body{display:none;}
+.ex-card.open .ex-body{display:block;animation:ex-reveal var(--dur-nav) var(--ease-out);}
+@keyframes ex-reveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
+@media(prefers-reduced-motion:reduce){.ex-card.open .ex-body{animation:none;}}
+.workout-progress #wk-prog{transition:transform var(--dur-data) var(--ease-out)!important;transform-origin:left center;}
+@media(prefers-reduced-motion:reduce){.workout-progress #wk-prog{transition-duration:0.01ms!important;}}
 .ex-body-inner{padding:0 16px 16px;border-top:1px solid var(--border);padding-top:14px;}
 .set-hdr,.set-row{display:grid;grid-template-columns:32px minmax(0,1fr) minmax(0,1fr) 36px;gap:8px;}
@@ -326,5 +344,5 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .set-row{margin-bottom:8px;align-items:center;transition:opacity 0.3s;}
 .set-row.done{opacity:0.45;}
-.set-num{width:26px;height:26px;background:var(--s3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--t2);margin:auto;transition:all 0.3s var(--spring);}
+.set-num{width:26px;height:26px;background:var(--s3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--t2);margin:auto;transition:transform var(--dur-press) var(--ease-out),background var(--dur-press) var(--ease-out),color var(--dur-press) var(--ease-out);}
 .set-row.done .set-num{background:var(--green);color:#000;}
 .set-inp-wrap{min-width:0;background:var(--s2);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;overflow:visible;}
@@ -333,5 +351,5 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .set-adj:active{background:var(--s3);}
 .set-inp{flex:1;text-align:center;font-size:14px;font-weight:700;color:var(--t1);background:none;height:44px;min-width:0;}
-.set-chk{width:34px;height:34px;background:var(--s3);border-radius:9px;display:flex;align-items:center;justify-content:center;transition:all 0.3s var(--spring);margin:auto;}
+.set-chk{width:34px;height:34px;background:var(--s3);border-radius:9px;display:flex;align-items:center;justify-content:center;transition:transform var(--dur-press) var(--ease-out),background var(--dur-press) var(--ease-out),color var(--dur-press) var(--ease-out);margin:auto;}
 .set-chk svg{width:15px;height:15px;stroke:var(--t3);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
 .set-chk.on{background:var(--green);}
@@ -348,5 +366,5 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .ex-where{margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--blue-border);font-size:12px;color:var(--t2);line-height:1.45;overflow-wrap:anywhere;}
 .ex-where .cue-title{margin-bottom:4px;}
-.ex-complete-btn{width:100%;margin-top:14px;padding:13px;background:var(--blue);border-radius:var(--r-md);font-size:15px;font-weight:700;color:#fff;text-align:center;transition:all 0.2s var(--spring);}
+.ex-complete-btn{width:100%;margin-top:14px;padding:13px;background:var(--blue);border-radius:var(--r-md);font-size:15px;font-weight:700;color:#fff;text-align:center;transition:transform var(--dur-press) var(--ease-out),background var(--dur-press) var(--ease-out),color var(--dur-press) var(--ease-out);}
 .ex-complete-btn:active{transform:scale(0.97);}
 .ex-complete-btn.done{background:var(--green);color:#000;}
@@ -368,5 +386,5 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .macro-bar-lbl{font-size:12px;font-weight:500;color:var(--t2);width:54px;}
 .macro-bar-track{flex:1;height:6px;background:var(--s3);border-radius:3px;overflow:hidden;}
-.macro-bar-fill{height:100%;border-radius:3px;transition:width 0.9s var(--ease-data);}
+.macro-bar-fill{height:100%;border-radius:3px;width:100%;transform-origin:left;transition:transform var(--dur-data) var(--ease-out);}
 .macro-bar-val{font-size:11px;font-weight:600;color:var(--t2);width:60px;text-align:right;}
 .food-search-wrap{margin:0 16px 12px;position:relative;}
@@ -399,6 +417,18 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .meal-macro{font-size:10px;color:var(--t2);margin-top:2px;}
 .meal-cal{font-size:14px;font-weight:700;color:var(--orange-text);}
-.meal-del{width:28px;height:28px;background:var(--red-dim);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
+.meal-del{width:44px;height:44px;background:var(--red-dim);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
 .meal-del svg{width:12px;height:12px;stroke:var(--red-text);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
+.nutrition-context{margin:0 16px 8px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;color:var(--t2);}
+.nutrition-context select{min-width:120px;min-height:44px;background:var(--s1);color:var(--t1);border:1px solid var(--border);border-radius:var(--r-md);padding:0 12px;}
+.meal-repeat{min-height:44px;min-width:44px;padding:8px;color:var(--orange-text);font-size:12px;font-weight:500;text-align:right;}
+.recent-food{width:100%;min-height:44px;text-align:left;animation:recent-food-in var(--dur-nav) var(--ease-out) both;}
+@keyframes recent-food-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
+@media(prefers-reduced-motion:reduce){@keyframes recent-food-in{from{opacity:0;}to{opacity:1;}}}
+.recent-heading{padding:12px 16px 4px;font-size:12px;color:var(--t2);font-weight:600;}
+#toast.nutrition-undo{top:auto;bottom:calc(var(--tab-h) + var(--safe-b) + 12px);transform:none;opacity:0;visibility:hidden;pointer-events:none;transition:opacity var(--dur-nav) var(--ease-out);}
+#toast.nutrition-undo.show{transform:none;opacity:1;visibility:visible;pointer-events:auto;}
+#toast.nutrition-undo>div:nth-child(2){flex:1;min-width:0;}
+#t-undo{min-width:60px;min-height:44px;color:var(--orange-text);font-size:14px;font-weight:600;flex-shrink:0;}
+@media(prefers-reduced-motion:reduce){#toast.nutrition-undo,#toast.nutrition-undo.show{transform:none;}}
 .water-card{margin:0 16px 12px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;}
 .water-top{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:12px;}
@@ -414,9 +444,17 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .range-tab{padding:5px 12px;border-radius:14px;border:1px solid var(--border);background:none;color:var(--t3);font-size:11px;font-weight:600;transition:all 0.2s var(--smooth);}
 .range-tab.active{background:var(--purple);border-color:var(--purple-text);color:#fff;}
-.chart-wrap{height:160px;position:relative;}
-.streak-row{margin:0 16px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
-.streak-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 10px;text-align:center;}
-.streak-num{font-size:28px;font-weight:800;line-height:1;letter-spacing:-0.5px;}
-.streak-lbl{font-size:9px;color:var(--t2);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:5px;}
+.chart-wrap{height:160px;position:relative;margin-top:32px;}
+.chart-wrap canvas{touch-action:pan-y;}
+.chart-wrap[data-empty]:not([data-empty=""])::after{content:attr(data-empty);position:absolute;inset:0;display:grid;place-items:center;color:var(--t2);font-size:13px;pointer-events:none;}
+.chart-wrap canvas:focus-visible{outline:2px solid var(--purple-text);outline-offset:3px;}
+.chart-scrub-line{position:absolute;width:1px;background:var(--t2);pointer-events:none;opacity:0;transition:opacity 120ms linear;}
+.chart-scrub-pill{position:absolute;top:-30px;left:0;max-width:100%;box-sizing:border-box;padding:5px 9px;border-radius:999px;background:var(--s2);color:var(--t1);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 120ms linear;}
+.chart-wrap.scrubbing .chart-scrub-line,.chart-wrap.scrubbing .chart-scrub-pill{opacity:1;}
+.chart-scrub-live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}
+.week-summary{margin:0 16px 12px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-md);padding:16px;}
+.week-summary-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;}
+.week-summary-row+.week-summary-row{border-top:1px solid var(--border);}
+.week-summary-num{font-size:15px;font-weight:700;color:var(--t1);font-variant-numeric:tabular-nums;white-space:nowrap;}
+.week-summary-lbl{font-size:13px;color:var(--t2);}
 .cal-card{margin:0 16px 12px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;}
 .cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
@@ -477,16 +515,20 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .toggle.on .toggle-knob{transform:translateX(18px);}
 /* BOTTOM SHEETS */
-#backdrop{position:fixed;inset:0;background:rgba(0,0,0,0);z-index:200;transition:background 0.3s var(--smooth);pointer-events:none;}
-#backdrop.show{background:rgba(0,0,0,0.72);pointer-events:all;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}
-#sheet-wrap{position:fixed;bottom:0;left:0;right:0;z-index:201;transform:translateY(100%);transition:transform 0.4s var(--spring);}
+#sheet-wrap{position:fixed;inset:auto 0 0;margin:0;width:100%;max-width:none;max-height:92dvh;padding:0;border:0;background:transparent;color:var(--t1);overflow:visible;transform:translateY(100%);transition:transform var(--dur-sheet) var(--ease-sheet);}
 #sheet-wrap.show{transform:translateY(0);}
+#sheet-wrap::backdrop,#celebration::backdrop{background:rgba(0,0,0,0.72);opacity:0;transition:opacity var(--dur-sheet) var(--ease-sheet);}
+#sheet-wrap.show::backdrop,#celebration.show::backdrop{opacity:1;}
 .sheet{background:var(--s1);border-radius:var(--r-xl) var(--r-xl) 0 0;border-top:1px solid var(--border);padding-bottom:calc(var(--safe-b) + 10px);max-height:92dvh;overflow-y:auto;overscroll-behavior:contain;}
 .sheet::-webkit-scrollbar{display:none;}
-.sheet-handle{width:36px;height:4px;background:var(--s4);border-radius:2px;margin:12px auto 6px;}
-.sheet-hdr{padding:8px 20px 16px;display:flex;align-items:center;justify-content:space-between;}
+.sheet-handle{height:24px;display:flex;align-items:center;justify-content:center;touch-action:none;}
+.sheet-handle::before{content:'';width:36px;height:4px;background:var(--s4);border-radius:2px;}
+.sheet-hdr{padding:8px 20px 16px;display:flex;align-items:center;justify-content:space-between;touch-action:none;}
 .sheet-title{font-size:18px;font-weight:700;}
-.sheet-close{width:30px;height:30px;background:var(--s3);border-radius:50%;display:flex;align-items:center;justify-content:center;}
+.sheet-close{width:48px;height:48px;background:var(--s3);border-radius:50%;display:flex;align-items:center;justify-content:center;}
+.sheet-close:focus-visible{outline:2px solid var(--orange);outline-offset:3px;}
+@media(prefers-reduced-motion:reduce){#sheet-wrap,#sheet-wrap::backdrop,#celebration,#celebration::backdrop{transition:none;}}
 .sheet-close svg{width:13px;height:13px;stroke:var(--t2);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
 .sheet-body{padding:0 20px;}
+#sheet-wrap .inp-field{transition:none;}
 .inp-grp{margin-bottom:14px;}
 .inp-lbl{font-size:11px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:7px;}
@@ -518,8 +560,8 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .preset-cal{font-size:14px;font-weight:700;color:var(--orange-text);}
 /* CELEBRATION */
-#celebration{position:fixed;inset:0;z-index:300;pointer-events:none;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.35s var(--smooth);}
-#celebration.show{opacity:1;pointer-events:all;}
-.cel-card{background:var(--s2);border:1px solid var(--green-border);border-radius:var(--r-xl);padding:32px 28px;text-align:center;width:82%;max-width:310px;transform:scale(0.8);transition:transform 0.5s var(--spring);}
-#celebration.show .cel-card{transform:scale(1);}
+#celebration{position:fixed;inset:0;margin:auto;padding:0;border:0;background:transparent;color:var(--t1);width:100%;max-width:none;height:100%;max-height:none;opacity:0;transition:opacity var(--dur-sheet) var(--ease-sheet);}
+#celebration[open]{display:flex;align-items:center;justify-content:center;}
+#celebration.show{opacity:1;}
+.cel-card{background:var(--s2);border:1px solid var(--green-border);border-radius:var(--r-xl);padding:32px 28px;text-align:center;width:82%;max-width:310px;}
 .cel-icon{font-size:52px;margin-bottom:12px;}
 .cel-title{font-size:22px;font-weight:800;color:var(--green-text);margin-bottom:8px;}
@@ -556,7 +598,6 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 </div>
 <div id="onboard"></div>
-<div id="backdrop"></div>
-<div id="sheet-wrap"></div>
-<div id="celebration">
+<dialog id="sheet-wrap" aria-modal="true" aria-label="Sheet"></dialog>
+<dialog id="celebration" aria-modal="true" aria-labelledby="cel-title" aria-describedby="cel-sub">
   <div class="confetti-wrap" id="confetti-wrap"></div>
   <div class="cel-card">
@@ -566,6 +607,6 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
     <button class="sheet-btn sheet-btn-primary" onclick="hideCel()" style="margin:0">Keep going 💪</button>
   </div>
-</div>
-<div id="toast">
+</dialog>
+<div id="toast" role="status" aria-live="polite" aria-atomic="true">
   <div class="toast-icon" id="t-icon">✅</div>
   <div>
@@ -573,6 +614,11 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
     <div class="toast-sub" id="t-sub"></div>
   </div>
+  <button id="t-undo" hidden onclick="undoNutrition()">Undo</button>
 </div>
 <script>
+/* One cached OS query, initialized before startup and shared by motion helpers. */
+const reducedMotionQuery=matchMedia('(prefers-reduced-motion: reduce)');
+/* .matches is live, so a setting change applies to the very next animation. */
+function prefersReducedMotion(){return reducedMotionQuery.matches;}
 const APP_VERSION='1.1.0';
 /* ── ICONS ───────────────────────────────────────── */
@@ -716,5 +762,8 @@ async function loadProgram(){
     const prog=await r.json();
     if(!prog.sessions||!prog.sessions.length)return;
-    S.workout=carryCustom(S.workout,mapProgram(prog));
+    const next=carryCustom(S.workout,mapProgram(prog));
+    // Apply arriving definitions on session change, preserving live set drafts.
+    if(document.querySelector('#s1 .ex-list')){S.pendingWorkout=next;DB.saveWorkout(next);return;}
+    S.workout=next;
     DB.saveWorkout(S.workout);
     S.workoutDay=suggestSession();
@@ -912,5 +961,5 @@ function applyTheme(){
   const cs=document.querySelector('meta[name="color-scheme"]');
   if(cs)cs.setAttribute('content',t);
-  if(S.wtChart)buildChart(); /* chart colours are read from CSS vars at build time */
+  if(S.wtChart)buildChart(); /* Update the existing chart colours in place. */
 }
 function setTheme(v){
@@ -951,5 +1000,5 @@ function ingestFromHash(){
   history.replaceState(null,'',location.pathname+location.search);
   toast('👟',`${v.toLocaleString()} steps imported`,shortDate(d));
-  if(S.screen===0)renderScreen(0);
+  if(document.getElementById('s0').firstElementChild)renderHome();else markScreenDirty(0);markScreenDirty(3);
 }
 /* -- SCHEMA RESET -----------------------------------------------------------
@@ -971,20 +1020,67 @@ function fmtDate(ds){const d=new Date(ds+'T12:00:00');return d.toLocaleDateStrin
 function fmtTime(s){return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
 /* ── NAVIGATION ─────────────────────────────── */
-function go(idx){
-  if(idx===S.screen)return;
-  const dir=idx>S.screen?1:-1;
-  const old=document.getElementById('s'+S.screen);
-  const nw=document.getElementById('s'+idx);
-  renderScreen(idx);
-  nw.style.cssText='transform:translateX('+dir*100+'%);transition:none;';
-  requestAnimationFrame(()=>requestAnimationFrame(()=>{
-    const t='transform 0.36s cubic-bezier(0.25,0.46,0.45,0.94)';
-    old.style.cssText='transform:translateX('+(-dir*100)+'%);transition:'+t+';';
-    nw.style.cssText='transform:translateX(0);transition:'+t+';';
-  }));
+const navBackHandlers=[];
+const navRendered=new Set(),navDirty=new Set();
+let navTimer=null,navHasEntry=false,navHistoryReady=false,navReturningHome=false;
+/* Later renderer packages can invalidate content without navigating. */
+function markScreenDirty(idx){navDirty.add(idx);}
+function go(idx,source='tap'){
+  if(!Number.isInteger(idx)||idx<0||idx>4||idx===S.screen)return;
+  const previous=S.screen,dir=idx>previous?1:-1;
+  const old=document.getElementById('s'+previous),nw=document.getElementById('s'+idx);
+  clearTimeout(navTimer);
+  navTimer=null;
+  document.querySelectorAll('.screen').forEach(el=>{
+    el.classList.remove('nav-out','nav-fade-in','nav-fade-out','nav-slide-in','nav-slide-out');
+    el.style.removeProperty('--nav-dir');
+  });
+  if(!navRendered.has(idx)||navDirty.has(idx))renderScreen(idx,true);
   S.screen=idx;
   updateTabs();
+  if(navHistoryReady&&source!=='back'){
+    const state={...history.state,fittrackNav:true,screen:idx};
+    /* Never copy a notification/action fragment into app-created entries. */
+    const url=location.pathname+location.search;
+    if(idx===0&&navHasEntry){
+      /* Consume our extra entry: Back from Home must leave the app. */
+      navReturningHome=true;
+      history.back();
+    }else if(navReturningHome){
+      /* A rapid new tap is recorded after the pending traversal lands. */
+    }else if(!navHasEntry&&previous===0){
+      history.replaceState({...history.state,fittrackNav:true,screen:0},'',url);
+      history.pushState(state,'',url);
+      navHasEntry=true;
+    }else history.replaceState(state,'',url);
+  }
+  if(prefersReducedMotion())return;
+  const swipe=source==='swipe';
+  old.style.setProperty('--nav-dir',dir);
+  nw.style.setProperty('--nav-dir',dir);
+  old.classList.add('nav-out',swipe?'nav-slide-out':'nav-fade-out');
+  nw.classList.add(swipe?'nav-slide-in':'nav-fade-in');
+  const duration=parseFloat(getComputedStyle(nw).animationDuration)*1000;
+  /* One cancellable cleanup, no queued frames or callbacks holding old screens. */
+  navTimer=setTimeout(()=>{
+    document.querySelectorAll('.screen').forEach(el=>{
+      el.classList.remove('nav-out','nav-fade-in','nav-fade-out','nav-slide-in','nav-slide-out');
+      el.style.removeProperty('--nav-dir');
+    });
+    navTimer=null;
+  },duration);
+}
+function updateTabs(){
+  document.querySelectorAll('.tab-btn').forEach((b,i)=>{
+    b.classList.toggle('active',i===S.screen);
+    if(i===S.screen)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
+  });
+  document.querySelectorAll('.screen').forEach((el,i)=>{
+    const active=i===S.screen;
+    el.classList.toggle('nav-active',active);
+    el.inert=!active;
+    el.setAttribute('aria-hidden',String(!active));
+    if(!active&&el.contains(document.activeElement))document.activeElement.blur();
+  });
 }
-function updateTabs(){document.querySelectorAll('.tab-btn').forEach((b,i)=>b.classList.toggle('active',i===S.screen));}
 /* ── RING BUILDER ───────────────────────────── */
 function ring(id,color,val,max,display,unit,textColor){
@@ -998,5 +1094,5 @@ function ring(id,color,val,max,display,unit,textColor){
         <circle class="ring-bg" cx="43" cy="43" r="${r}" stroke-width="7"/>
         <circle class="ring-track" id="rt-${id}" cx="43" cy="43" r="${r}" stroke="${color}" stroke-width="7"
-          stroke-dasharray="${c}" stroke-dashoffset="${c}"/>
+          stroke-dasharray="${c}" stroke-dashoffset="${c*(1-dataRatio(val,max))}"/>
       </svg>
       <div class="ring-center">
@@ -1008,21 +1104,59 @@ function ring(id,color,val,max,display,unit,textColor){
   </div>`;
 }
+function dataRatio(value,goal){return Math.max(0,Math.min(value/goal||0,1));}
+function waterTarget(){return S.cfg.targets.water||DEF_SETTINGS.targets.water;}
 function animRing(id,val,max){
-  const r=35,c=2*Math.PI*r,el=document.getElementById('rt-'+id);
-  if(!el)return;
-  const pct=Math.min(val/max,1);
-  /* --ease-data, not --spring. This inline style overrides the .ring-track CSS
-     rule, so fixing the stylesheet alone left the ring still overshooting. */
-  setTimeout(()=>{el.style.transition='stroke-dashoffset 1.3s var(--ease-data)';el.style.strokeDashoffset=c*(1-pct);},60);
+  const el=document.getElementById('rt-'+id);
+  if(el)el.setAttribute('stroke-dashoffset',2*Math.PI*35*(1-dataRatio(val,max)));
 }
+/* Truthful numbers update immediately. No numeric frame loops to cancel. */
 function countUp(id,target,dec=0){
-  const el=document.getElementById('rv-'+id);if(!el)return;
-  const dur=900,start=performance.now();
-  const step=now=>{const p=Math.min((now-start)/dur,1),e=1-Math.pow(1-p,3),v=target*e;
-    el.textContent=dec>0?v.toFixed(dec):Math.round(v).toLocaleString();
-    if(p<1)requestAnimationFrame(step);};
-  requestAnimationFrame(step);
-}
-/* ── HOME SCREEN ────────────────────────────── */
+  const el=document.getElementById('rv-'+id);
+  if(el){const text=dec?target.toFixed(dec):Math.round(target).toLocaleString();if(el.textContent!==text)el.textContent=text;}
+}
+/* Stable data nodes, including keyed meal groups and rows. Search is user-owned. */
+function patchDataScreen(id,html){
+  const root=document.getElementById(id);
+  if(!root.firstElementChild){root.innerHTML=html;return;}
+  root.querySelectorAll('[data-meal-retiring]').forEach(n=>n.remove());
+  const template=document.createElement('template');template.innerHTML=html;
+  const key=n=>n.nodeType===1?(n.id||n.getAttribute('data-data-key')||n.tagName+':'+(n.getAttribute('class')||'').split(' ')[0]+(n.classList.contains('section-label')?':'+n.textContent:'')):'#text';
+  function patch(parent,desired){
+    const wanted=new Map();
+    for(const n of desired.childNodes){const k=n.nodeType+':'+key(n);wanted.set(k,(wanted.get(k)||0)+1);}
+    for(const n of [...parent.childNodes]){const k=n.nodeType+':'+key(n),count=wanted.get(k)||0;if(count)wanted.set(k,count-1);else if(n.nodeType===1&&(n.classList.contains('meal-item')||n.matches('.meal-sec:has(.meal-item)'))){
+      n.setAttribute('data-meal-retiring','');n.inert=true;
+      n.animate([{opacity:1},{opacity:0}],{duration:prefersReducedMotion()?0:(parseFloat(getComputedStyle(root).getPropertyValue('--dur-nav'))||200)}).finished.then(()=>n.remove()).catch(()=>n.remove());
+    }else n.remove();}
+    const remaining=[...parent.childNodes].filter(n=>!n.hasAttribute?.('data-meal-retiring'));let cursor=parent.firstChild;
+    for(const next of [...desired.childNodes]){
+      const pos=remaining.findIndex(n=>n.nodeType===next.nodeType&&key(n)===key(next));
+      const node=pos<0?next.cloneNode(true):remaining.splice(pos,1)[0];
+      if(node!==cursor)parent.insertBefore(node,cursor);
+      if(pos<0&&node.nodeType===1){
+        const rows=node.matches('.meal-item')?[node]:[...node.querySelectorAll('.meal-item')];
+        for(const row of rows)row.animate([{opacity:0,transform:prefersReducedMotion()?'none':'translateY(8px)'},{opacity:1,transform:'none'}],{duration:parseFloat(getComputedStyle(root).getPropertyValue('--dur-nav'))||200,easing:'ease-out'});
+      }
+      if(pos>=0){
+        if(node.nodeType===3){if(node.nodeValue!==next.nodeValue)node.nodeValue=next.nodeValue;}
+        else if(!node.matches('.food-search-wrap,#sresults')){
+          for(const a of [...node.attributes])if(!next.hasAttribute(a.name))node.removeAttribute(a.name);
+          for(const a of [...next.attributes])if(node.getAttribute(a.name)!==a.value)node.setAttribute(a.name,a.value);
+          patch(node,next);
+        }
+      }
+      cursor=node.nextSibling;
+    }
+    remaining.forEach(n=>n.remove());
+  }
+  patch(root,template.content);
+}
+function refreshDataScreens(){
+  for(const i of [0,2]){
+    if(document.getElementById('s'+i).firstElementChild){if(i===0)renderHome();else renderNutrition();}
+    else markScreenDirty(i);
+  }
+  markScreenDirty(3);
+}
 function renderHome(){
   const l=S.log,c=S.cfg;
@@ -1032,5 +1166,5 @@ function renderHome(){
   const water=l.nutrition.water||0;
   const steps=l.steps||0;
-  const calGoal=c.targets.calories,protGoal=c.targets.protein,waterGoal=c.targets.water||4000;
+  const calGoal=c.targets.calories,protGoal=c.targets.protein,waterGoal=waterTarget();
   const allLogs=DB.allLogs();
   const recent=Object.values(allLogs).filter(x=>x.workout?.completed&&x.date!==S.today).sort((a,b)=>b.date.localeCompare(a.date));
@@ -1045,5 +1179,5 @@ function renderHome(){
   if(l.weight&&wh.length>1){const prev=wh.length>1?wh[wh.length-2].weight:c.body.currentWeight;const d=(toDisp(l.weight)-toDisp(prev)).toFixed(1);if(d<0)deltaHtml=`<span class="wt-delta-down">↓ ${Math.abs(d)} ${wUnit()} from yesterday</span>`;else if(d>0)deltaHtml=`<span class="wt-delta-up">↑ ${d} ${wUnit()} from yesterday</span>`;else deltaHtml=`<span class="wt-delta-same">Same as yesterday</span>`;}
   else if(l.weight)deltaHtml=`<span class="wt-delta-down" style="color:var(--green-text)">Logged ✓</span>`;
-  document.getElementById('s0').innerHTML=`
+  patchDataScreen('s0',`
   <div>
     <div class="screen-header">
@@ -1084,5 +1218,5 @@ function renderHome(){
         </div>
       </div>
-      <div class="prog-track"><div class="prog-fill" id="steps-bar" style="width:0%;background:var(--green)"></div></div>
+      <div class="prog-track"><div class="prog-fill" id="steps-bar" style="transform:scaleX(${dataRatio(steps,c.targets.steps||10000)});background:var(--green)"></div></div>
       <button onclick="openStepsSheet()" style="margin-top:10px;font-size:12px;color:var(--green-text);font-weight:700;background:var(--green-dim);border:1px solid var(--green-border);border-radius:8px;padding:7px 14px">Log steps</button>
     </div>
@@ -1119,12 +1253,5 @@ function renderHome(){
       <button class="wt-log-btn" onclick="openWeightSheet()">Log weight</button>
     </div>
-  </div>`;
-  setTimeout(()=>{
-    animRing('cal',totalCal,calGoal);countUp('cal',totalCal);
-    animRing('pro',totalProt,protGoal);countUp('pro',totalProt);
-    animRing('h2o',water,waterGoal);
-    const sb=document.getElementById('steps-bar');
-    if(sb)setTimeout(()=>{sb.style.width=Math.min((steps/(S.cfg.targets.steps||10000))*100,100)+'%';},80);
-  },80);
+  </div>`);
 }
 function ciCard(type,emoji,label,done){
@@ -1193,4 +1320,5 @@ function renderWorkout(){
 }
 function exCard(ex,exLog){
+  queueWorkoutReconcile();
   const done=exLog?.completed||false;
   const setRows=Array.from({length:ex.sets},(_,i)=>{
@@ -1251,6 +1379,48 @@ function exCard(ex,exLog){
   </div>`;
 }
-function toggleEx(id){const c=document.getElementById('ec-'+id);if(c)c.classList.toggle('open');}
-function switchDay(i){S.workoutDay=i;renderScreen(1);}
+let workoutReconcileQueued=false;
+function queueWorkoutReconcile(){
+  if(workoutReconcileQueued)return;
+  workoutReconcileQueued=true;
+  const defer=typeof queueMicrotask==='function'?queueMicrotask:fn=>setTimeout(fn,0);
+  defer(()=>{workoutReconcileQueued=false;reconcileRestTimers();updateWorkoutProgress();});
+}
+function toggleEx(id){
+  const c=document.getElementById('ec-'+id);if(!c)return;
+  // Commit layout once, then reveal with opacity and transform only.
+  c.classList.toggle('open');
+}
+function cancelWorkoutTimers(){for(const id of Object.keys(S.restTimers))stopRest(id);}
+function switchDay(i){
+  cancelWorkoutTimers();
+  if(S.pendingWorkout){S.workout=S.pendingWorkout;delete S.pendingWorkout;}
+  S.workoutDay=i;renderScreen(1);
+}
+function dirtyWorkoutDependents(){[0,3,4].forEach(markScreenDirty);}
+function updateWorkoutProgress(){
+  const d=S.workout?.days?.[S.workoutDay];if(!d)return;
+  const total=d.exercises.length,done=d.exercises.filter(e=>S.log.workout.exercises[e.id]?.completed).length;
+  const pct=total?done/total*100:0,saved=S.log.workout.completed&&S.log.workout.dayIndex===S.workoutDay;
+  const root=document.getElementById('s1'),prog=root.querySelector('#wk-prog');
+  if(prog){
+    if(prog.style.width!=='100%'){
+      prog.style.transform='scaleX('+(parseFloat(prog.style.width)||0)/100+')';prog.style.width='100%';
+    }
+    prog.style.transform='scaleX('+pct/100+')';
+  }
+  const count=root.querySelector('.workout-progress-count'),percent=root.querySelector('.workout-progress-pct');
+  if(count)count.textContent=done+'/'+total+' exercises done';
+  if(percent)percent.textContent=Math.round(pct)+'%';
+  let finish=root.querySelector('.finish-btn');
+  if(!finish&&(done>0||saved)){
+    finish=document.createElement('button');finish.className='finish-btn';
+    const list=root.querySelector('.ex-list');if(list)list.after(finish);
+  }
+  if(finish){
+    finish.textContent=saved?'\u2713 Workout saved!':'Finish workout ('+done+'/'+total+' done)';
+    finish.classList.toggle('done',saved);finish.disabled=!!saved;finish.onclick=saved?null:finishWorkout;
+  }
+  const whole=root.querySelector('.whole-session-btn');if(whole){whole.style.visibility=saved?'hidden':'';whole.disabled=!!saved;}
+}
 function adj(exId,i,field,delta){
   const id=field==='w'?`sw-${exId}-${i}`:`sr-inp-${exId}-${i}`;
@@ -1284,5 +1454,7 @@ function toggleSet(exId,i){
   if(row)row.classList.toggle('done',exLog.sets[i].done);
   if(chk)chk.classList.toggle('on',exLog.sets[i].done);
-  if(num&&exLog.sets[i].done){num.style.transform='scale(0)';setTimeout(()=>{num.style.transition='transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';num.style.transform='scale(1)';},60);}
+  if(num&&exLog.sets[i].done&&!prefersReducedMotion())num.animate(
+    [{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:140,easing:'ease-out'});
+  dirtyWorkoutDependents();
   const ex=S.workout.days[S.workoutDay].exercises.find(e=>e.id===exId);
   if(ex){
@@ -1293,41 +1465,35 @@ function toggleSet(exId,i){
   }
 }
+function restSessionKey(){return S.today+':'+S.workoutDay;}
+function reconcileRestTimers(){
+  for(const [id,timer] of Object.entries(S.restTimers)){
+    if(timer.session!==restSessionKey()){stopRest(id);continue;}
+    const rem=Math.max(0,Math.ceil((timer.end-Date.now())/1000));
+    const bar=document.getElementById('rb-'+id),cd=document.getElementById('rc-'+id);
+    if(!rem){stopRest(id);toast('\u23f1','Rest complete!','Time for next set');continue;}
+    if(bar){bar.style.visibility='';bar.classList.add('show');}
+    if(cd)cd.textContent=fmtTime(rem);
+    const card=document.getElementById('ec-'+id);
+    if(card&&timer.bar!==bar){card.classList.add('open');timer.bar=bar;}
+  }
+}
 function startRest(exId,secs){
-  if(S.restTimers[exId])clearInterval(S.restTimers[exId].t);
-  const bar=document.getElementById('rb-'+exId);
-  const cd=document.getElementById('rc-'+exId);
-  if(!bar||!cd)return;
-  bar.classList.add('show');
-  let rem=secs;
-  cd.textContent=fmtTime(rem);
-  const t=setInterval(()=>{
-    rem--;
-    const el=document.getElementById('rc-'+exId);
-    if(el)el.textContent=fmtTime(rem);
-    if(rem<=0){clearInterval(t);delete S.restTimers[exId];const b=document.getElementById('rb-'+exId);if(b)b.classList.remove('show');toast('⏱️','Rest complete!','Time for next set');}
-  },1000);
-  S.restTimers[exId]={t};
-}
-function stopRest(exId){
+  stopRest(exId);
+  const timer={end:Date.now()+secs*1000,session:restSessionKey(),bar:document.getElementById('rb-'+exId)};
+  S.restTimers[exId]=timer;
+  timer.t=setInterval(reconcileRestTimers,250);reconcileRestTimers();
+}
+function stopRest(exId,keepSpace=false){
   if(S.restTimers[exId]){clearInterval(S.restTimers[exId].t);delete S.restTimers[exId];}
   const bar=document.getElementById('rb-'+exId);
-  if(bar)bar.classList.remove('show');
+  if(bar){bar.style.visibility=keepSpace?'hidden':'';if(!keepSpace)bar.classList.remove('show');}
 }
 function completeEx(exId){
   if(!S.log.workout.exercises[exId])S.log.workout.exercises[exId]={sets:[],completed:false};
-  S.log.workout.exercises[exId].completed=true;
-  DB.saveLog(S.today,S.log);
-  stopRest(exId);
-  const card=document.getElementById('ec-'+exId);
-  const btn=document.getElementById('ecb-'+exId);
-  if(card){card.classList.add('completed');card.classList.remove('open');}
-  if(btn){btn.textContent='✓ Complete';btn.classList.add('done');}
-  const d=S.workout.days[S.workoutDay];
-  const done=d.exercises.filter(e=>S.log.workout.exercises[e.id]?.completed).length;
-  const prog=document.getElementById('wk-prog');
-  if(prog)prog.style.width=(done/d.exercises.length*100)+'%';
-  const label=document.querySelector('#s1 .workout-progress-count');
-  if(label)label.textContent=`${done}/${d.exercises.length} exercises done`;
-  if(done>0&&!document.querySelector('.finish-btn'))renderScreen(1);
+  S.log.workout.exercises[exId].completed=true;DB.saveLog(S.today,S.log);stopRest(exId,true);
+  const card=document.getElementById('ec-'+exId),btn=document.getElementById('ecb-'+exId);
+  if(card)card.classList.add('completed');
+  if(btn){btn.style.minHeight=btn.getBoundingClientRect().height+'px';btn.textContent='\u2713 Complete';btn.classList.add('done');}
+  updateWorkoutProgress();dirtyWorkoutDependents();
 }
 /* One tap for a session he already did and does not want to retype. It is
@@ -1360,8 +1526,16 @@ function finishWorkout(){
   const exDone=d.exercises.filter(e=>S.log.workout.exercises[e.id]?.completed).length;
   celebrate('\u{1F3CB}','Workout complete',`${d.name}, ${exDone} exercises logged. Three a week is the whole plan, and this was one of them.`);
-  renderScreen(1);
+  cancelWorkoutTimers();
+  for(const e of d.exercises){
+    if(!S.log.workout.exercises[e.id]?.completed)continue;
+    document.getElementById('ec-'+e.id)?.classList.add('completed');
+    const btn=document.getElementById('ecb-'+e.id);
+    if(btn){btn.textContent='\u2713 Complete';btn.classList.add('done');}
+  }
+  updateWorkoutProgress();dirtyWorkoutDependents();
 }
 /* ── NUTRITION SCREEN ───────────────────────── */
 function renderNutrition(){
+  nutritionHistory=deriveNutritionHistory();
   const l=S.log,c=S.cfg;
   const meals=l.nutrition.meals||[];
@@ -1370,8 +1544,10 @@ function renderNutrition(){
   const tCarbs=meals.reduce((a,m)=>a+(m.carbs||0),0);
   const tFat=meals.reduce((a,m)=>a+(m.fat||0),0);
+  const carbGoal=Number(c.targets.carbs),fatGoal=Number(c.targets.fat);
+  const hasCarbGoal=Number.isFinite(carbGoal)&&carbGoal>0,hasFatGoal=Number.isFinite(fatGoal)&&fatGoal>0;
   const remain=Math.max(0,c.targets.calories-tCal);
   const floor=Math.max(1600,c.targets.floor||c.targets.calories-200);
   const water=l.nutrition.water||0;
-  const waterGoal=c.targets.water||4000;
+  const waterGoal=waterTarget();
   const hasProteinPowder=c.proteinPowder!==false;
   const hasCreatine=(c.targets.creatine||0)>0;
@@ -1391,6 +1567,6 @@ function renderNutrition(){
   meals.forEach(m=>{const g=m.mealType||'Other';if(!groups[g])groups[g]=[];groups[g].push(m);});
   const mealOrder=c.ramadanMode!==false?['Suhoor','Iftar','Other','Snack']:['Breakfast','Lunch','Dinner','Snack','Other'];
-  const mealSections=mealOrder.filter(g=>groups[g]?.length>0).map(g=>renderMealSec(g,groups[g])).join('');
-  document.getElementById('s2').innerHTML=`
+  const mealSections=mealOrder.filter(g=>groups[g]?.length>0||nutritionHistory.repeats[g]).map(g=>renderMealSec(g,groups[g]||[])).join('');
+  patchDataScreen('s2',`
   <div>
     <div class="screen-header">
@@ -1413,16 +1589,16 @@ function renderNutrition(){
         <div class="macro-bar-row">
           <div class="macro-bar-lbl" style="color:var(--coral-text)">Protein</div>
-          <div class="macro-bar-track"><div class="macro-bar-fill" id="pb" style="width:0%;background:var(--coral)"></div></div>
+          <div class="macro-bar-track"><div class="macro-bar-fill" id="pb" style="transform:scaleX(${dataRatio(tProt,c.targets.protein)});background:var(--coral)"></div></div>
           <div class="macro-bar-val">${Math.round(tProt)}g / ${c.targets.protein}g</div>
         </div>
         <div class="macro-bar-row">
           <div class="macro-bar-lbl" style="color:var(--orange-text)">Carbs</div>
-          <div class="macro-bar-track"><div class="macro-bar-fill" id="cb" style="width:0%;background:var(--orange)"></div></div>
-          <div class="macro-bar-val">${Math.round(tCarbs)}g / 210g</div>
+          <div class="macro-bar-track">${hasCarbGoal?`<div class="macro-bar-fill" id="cb" style="transform:scaleX(${dataRatio(tCarbs,carbGoal)});background:var(--orange)"></div>`:''}</div>
+          <div class="macro-bar-val">${Math.round(tCarbs)}g${hasCarbGoal?` / ${carbGoal}g`:""}</div>
         </div>
         <div class="macro-bar-row">
           <div class="macro-bar-lbl" style="color:var(--blue-light-text)">Fat</div>
-          <div class="macro-bar-track"><div class="macro-bar-fill" id="fb" style="width:0%;background:var(--blue-light)"></div></div>
-          <div class="macro-bar-val">${Math.round(tFat)}g / 65g</div>
+          <div class="macro-bar-track">${hasFatGoal?`<div class="macro-bar-fill" id="fb" style="transform:scaleX(${dataRatio(tFat,fatGoal)});background:var(--blue-light)"></div>`:''}</div>
+          <div class="macro-bar-val">${Math.round(tFat)}g${hasFatGoal?` / ${fatGoal}g`:""}</div>
         </div>
       </div>
@@ -1434,7 +1610,8 @@ function renderNutrition(){
     </div>
     ${supplementRows.trim()?`<div class="section-label">Supplements</div><div class="supp-card">${supplementRows}</div>`:''}
+    <div class="nutrition-context" data-data-key="search-context"><label for="search-meal">Log to</label><select id="search-meal" onchange="nutritionMeal=this.value">${mealOrder.map(t=>'<option'+(t===nutritionMeal?' selected':'')+'>'+t+'</option>').join('')}</select></div>
     <div class="food-search-wrap">
       <div class="search-ico">${svgIcon('search',18,'var(--t3)')}</div>
-      <input class="food-search-input" id="fsearch" type="text" placeholder="Search food or browse presets..." oninput="handleSearch(this.value)" autocomplete="off" autocorrect="off" spellcheck="false">
+      <input class="food-search-input" id="fsearch" type="text" placeholder="Search food or browse presets..." onfocus="if(!this.value.trim())showRecentFoods()" oninput="handleSearch(this.value)" autocomplete="off" autocorrect="off" spellcheck="false">
       <div class="search-clr" id="sclr" role="button" tabindex="0" aria-label="Clear search" onclick="clearSearch()">${svgIcon('x',10,'var(--t2)')}</div>
     </div>
@@ -1452,5 +1629,5 @@ function renderNutrition(){
         </div>
       </div>
-      <div class="prog-track"><div class="prog-fill" id="wbar" style="width:0%;background:linear-gradient(90deg,var(--blue-light),var(--blue))"></div></div>
+      <div class="prog-track"><div class="prog-fill" id="wbar" style="transform:scaleX(${dataRatio(water,waterGoal)});background:linear-gradient(90deg,var(--blue-light),var(--blue))"></div></div>
       <div class="water-btns">
         <button class="water-btn" onclick="addWater(250)">+${fmtVolInc(250)}</button>
@@ -1461,21 +1638,15 @@ function renderNutrition(){
     </div>
     <div style="height:16px"></div>
-  </div>`;
-  setTimeout(()=>{
-    const wg=c.targets.water||4000;
-    const pb=document.getElementById('pb');const cb=document.getElementById('cb');const fb=document.getElementById('fb');const wb=document.getElementById('wbar');
-    if(pb)pb.style.width=Math.min((tProt/(c.targets.protein))*100,100)+'%';
-    if(cb)cb.style.width=Math.min((tCarbs/210)*100,100)+'%';
-    if(fb)fb.style.width=Math.min((tFat/65)*100,100)+'%';
-    if(wb)wb.style.width=Math.min((water/wg)*100,100)+'%';
-  },80);
+  </div>`);
+  if(document.activeElement?.id==='fsearch'&&!document.activeElement.value.trim())showRecentFoods();
 }
 function renderMealSec(name,items){
   const secCal=items.reduce((a,m)=>a+(m.cal||0),0);
-  return `<div class="meal-sec">
-    <div class="meal-sec-hdr"><div class="meal-sec-name">${name}</div><div class="meal-sec-cals">${Math.round(secCal)} kcal</div></div>
-    ${items.map(m=>`<div class="meal-item">
+  const repeat=!items.length&&nutritionHistory.repeats[name];
+  return `<div class="meal-sec" data-data-key="group-${esc(name)}">
+    <div class="meal-sec-hdr"><div class="meal-sec-name">${name}</div><div class="meal-sec-cals">${repeat?`<button class="meal-repeat" onclick="repeatMeal('${name}')">Repeat ${new Date(repeat.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'})} · ${Math.round(repeat.items.reduce((a,m)=>a+(m.cal||0),0))} kcal</button>`:Math.round(secCal)+' kcal'}</div></div>
+    ${items.map(m=>`<div class="meal-item" data-data-key="meal-${esc(m.id)}">
       <div style="flex:1;min-width:0">
-        <div class="meal-name">${m.name}</div>
+        <div class="meal-name">${esc(m.name)}</div>
         <div class="meal-macro">P: ${m.protein||0}g · C: ${m.carbs||0}g · F: ${m.fat||0}g</div>
       </div>
@@ -1485,16 +1656,17 @@ function renderMealSec(name,items){
   </div>`;
 }
-function delMeal(id){S.log.nutrition.meals=S.log.nutrition.meals.filter(m=>m.id!==id);DB.saveLog(S.today,S.log);renderScreen(2);}
+function delMeal(id){
+  if(!S.log.nutrition.meals?.some(m=>m.id===id))return;
+  const before=nutritionSnapshot();
+  S.log.nutrition.meals=S.log.nutrition.meals.filter(m=>m.id!==id);
+  finishNutritionAction(before,'Food deleted');
+}
 function addWater(ml){
   S.log.nutrition.water=(S.log.nutrition.water||0)+ml;
   DB.saveLog(S.today,S.log);
-  const disp=document.getElementById('water-disp');
-  const bar=document.getElementById('wbar');
-  const w=S.log.nutrition.water;
-  const wg=S.cfg.targets.water||4000;
-  if(disp)disp.innerHTML=`${fmtVolNum(w)}<span style="font-size:14px;color:var(--t2);margin-left:3px">${volBigUnit()}</span>`;
-  if(bar)bar.style.width=Math.min((w/wg)*100,100)+'%';
+  const w=S.log.nutrition.water,wg=waterTarget();
   toast('💧',`+${fmtVolInc(ml)} added`,`Total: ${fmtVolBig(w)} / ${fmtVolBig(wg)}`);
   if(w>=wg&&!S.log.checkins.water){S.log.checkins.water=true;DB.saveLog(S.today,S.log);setTimeout(()=>toast('🎯','Water goal reached!',`${fmtVolBig(wg)} complete 🎉`),1200);}
+  refreshDataScreens();
 }
 function quickShake(){const s=PRESETS.find(p=>p.id==='p12');if(s)addMealItem(s,'Other');}
@@ -1505,5 +1677,5 @@ function toggleCreatine(){
   S.log.creatine=S.log.creatine?0:(S.cfg.targets.creatine||5);
   DB.saveLog(S.today,S.log);
-  renderScreen(2);
+  renderNutrition();
   if(S.log.creatine)toast('\u{1F48A}','Creatine logged',S.log.creatine+'g. Timing does not matter, showing up every day does.');
 }
@@ -1588,8 +1760,9 @@ function handleSearch(q){
 function runSearch(q){
   const res=document.getElementById('sresults');
-  if(!q||q.length<2){if(res)res.classList.remove('show');return;}
+  if(!q.trim()){showRecentFoods();return;}
+  if(q.length<2){if(res)res.classList.remove('show');return;}
   const m=q.toLowerCase();
   const foods=allFoods();
-  const history=foodHistoryIndex(DB.allLogs(),foods);
+  const history=nutritionHistory?.rank||{};
   const local=searchFoods(m,foods,history);
   if(res){
@@ -1611,5 +1784,5 @@ async function fetchFoodAPI(q){
     const d=await r.json();
     const res=document.getElementById('sresults');
-    if(!res||!res.classList.contains('show'))return;
+    if(!res||!res.classList.contains('show')||document.getElementById('fsearch')?.value!==q)return;
     const prods=(d.products||[]).filter(p=>p.product_name&&p.nutriments?.['energy-kcal_100g']).slice(0,4);
     if(!prods.length)return;
@@ -1632,5 +1805,5 @@ async function fetchFoodAPI(q){
 function clearSearch(){
   const i=document.getElementById('fsearch'),c=document.getElementById('sclr'),r=document.getElementById('sresults');
-  if(i)i.value='';if(c)c.classList.remove('show');if(r)r.classList.remove('show');
+  clearTimeout(S.searchTimer);if(i){i.value='';i.focus();}if(c)c.classList.remove('show');showRecentFoods();
 }
 const MEAL_TYPES_R=['Suhoor','Iftar','Other','Snack'];
@@ -1674,5 +1847,5 @@ function logFood(foodId,mealType){
   const k=g/food.grams;
   addMealItem({...food,name:food.name+' ('+Math.round(g)+'g)',cal:Math.round(food.cal*k),
-    protein:Math.round(food.protein*k),carbs:Math.round(food.carbs*k),fat:Math.round(food.fat*k)},mealType);
+    protein:Math.round(food.protein*k),carbs:Math.round(food.carbs*k),fat:Math.round(food.fat*k),grams:g,serving:Math.round(g)+'g'},mealType);
 }
 function logFoodAPI(tempId,mealType){
@@ -1680,15 +1853,73 @@ function logFoodAPI(tempId,mealType){
   const p=parseFloat(document.getElementById('api-portion')?.value)||100;
   const scale=p/100;
-  addMealItem({...food,name:`${food.name} (${p}g)`,cal:Math.round(food.cal*scale),protein:Math.round(food.protein*scale),carbs:Math.round(food.carbs*scale),fat:Math.round(food.fat*scale)},mealType);
+  addMealItem({...food,name:`${food.name} (${p}g)`,cal:Math.round(food.cal*scale),protein:Math.round(food.protein*scale),carbs:Math.round(food.carbs*scale),fat:Math.round(food.fat*scale),grams:p,serving:p+'g'},mealType);
+}
+let nutritionHistory=null,nutritionMeal='Other',nutritionUndo=null;
+function cloneMeals(meals){return JSON.parse(JSON.stringify(meals||[]));}
+function mealId(){return 'm_'+Date.now()+'_'+Math.random().toString(36).slice(2,9);}
+function deriveNutritionHistory(){
+  const logs=DB.allLogs(),foods=allFoods(),seen=new Set(),recent=[],repeats={};
+  const dates=Object.keys(logs).filter(d=>d<=S.today).sort().reverse();
+  const min=shiftDate(S.today,-14);
+  for(const date of dates){
+    const meals=logs[date]?.nutrition?.meals||[];
+    const ordered=meals.map((meal,index)=>({meal,index})).sort((a,b)=>String(b.meal.time||'').localeCompare(String(a.meal.time||''))||b.index-a.index);
+    for(const {meal} of ordered){
+      const key=meal.foodId||String(meal.name||'').toLowerCase().trim().replace(/ \(\d+(?:\.\d+)?g\)$/,'');
+      if(!seen.has(key)&&recent.length<12){seen.add(key);recent.push({...meal});}
+    }
+    if(date<S.today&&date>=min){
+      const groups={};for(const m of meals)(groups[m.mealType||'Other']||=[]).push(m);
+      for(const [type,items] of Object.entries(groups))if(!repeats[type])repeats[type]={date,items:cloneMeals(items)};
+    }
+  }
+  return {recent,repeats,rank:foodHistoryIndex(logs,foods),foods};
+}
+function showRecentFoods(){
+  const res=document.getElementById('sresults');if(!res)return;
+  const recent=nutritionHistory?.recent||[];
+  res.classList.add('show');
+  res.innerHTML='<div class="recent-heading">Recent</div>'+recent.map((m,i)=>{
+    const serving=m.serving||(/\(([^)]+)\)$/.exec(m.name||'')?.[1])||nutritionHistory.foods.find(f=>f.id===m.foodId)?.serving||'1 serving';
+    return '<button class="sri recent-food" onpointerdown="event.preventDefault()" onclick="logRecentFood('+i+')"><div style="flex:1;min-width:0"><div class="sri-name">'+esc(m.name)+'</div><div class="sri-macro">'+esc(serving)+' · '+m.cal+' kcal</div></div><div class="sri-add">'+svgIcon('plus',14,'var(--orange-text)')+'</div></button>';
+  }).join('')+(recent.length?'':'<div style="padding:12px 16px;color:var(--t2);font-size:13px">Logged foods appear here.</div>');
+}
+function nutritionSnapshot(){return {date:S.today,meals:cloneMeals(S.log.nutrition.meals),protein:S.log.checkins.protein};}
+function finishNutritionAction(before,message){
+  const protein=S.log.nutrition.meals.reduce((a,m)=>a+(m.protein||0),0);
+  if(protein>=S.cfg.targets.protein)S.log.checkins.protein=true;
+  DB.saveLog(S.today,S.log);refreshDataScreens();
+  toast('🍽️',message,'',before);
+  if(navigator.vibrate)navigator.vibrate(10);
+}
+function undoNutrition(){
+  const before=nutritionUndo;if(!before)return;nutritionUndo=null;
+  const log=before.date===S.today?S.log:DB.log(before.date);if(!log)return;
+  log.nutrition.meals=cloneMeals(before.meals);
+  if(before.protein===undefined)delete log.checkins.protein;else log.checkins.protein=before.protein;
+  DB.saveLog(before.date,log);if(before.date===S.today)refreshDataScreens();
+  toast('↩️','Undone','');
+}
+function logRecentFood(index){
+  const food=nutritionHistory?.recent[index];if(!food)return;
+  const before=nutritionSnapshot(),type=document.getElementById('search-meal')?.value||nutritionMeal;
+  S.log.nutrition.meals.push({...food,id:mealId(),mealType:type,time:new Date().toISOString()});
+  finishNutritionAction(before,food.name.slice(0,26)+' logged');
+  document.getElementById('fsearch')?.focus({preventScroll:true});
+}
+function repeatMeal(type){
+  const repeat=nutritionHistory?.repeats[type];
+  if(!repeat||S.log.nutrition.meals.some(m=>(m.mealType||'Other')===type))return;
+  const before=nutritionSnapshot();
+  S.log.nutrition.meals.push(...repeat.items.map(m=>({...m,id:mealId(),mealType:type,time:new Date().toISOString()})));
+  finishNutritionAction(before,type+' repeated');
 }
 function addMealItem(food,mealType){
-  const meal={id:'m_'+Date.now(),foodId:food.id||null,name:food.name,cal:food.cal,protein:food.protein||0,carbs:food.carbs||0,fat:food.fat||0,mealType:mealType||'Other',time:new Date().toISOString()};
+  const before=nutritionSnapshot();
+  const meal={id:mealId(),foodId:food.id||null,name:food.name,cal:food.cal,protein:food.protein||0,carbs:food.carbs||0,fat:food.fat||0,mealType:mealType||'Other',time:new Date().toISOString()};
+  if(food.serving)meal.serving=food.serving;if(food.grams)meal.grams=food.grams;
   if(!S.log.nutrition.meals)S.log.nutrition.meals=[];
-  S.log.nutrition.meals.push(meal);
-  DB.saveLog(S.today,S.log);
-  closeSheet();clearSearch();renderScreen(2);
-  toast('🍽️',`${food.name.slice(0,26)} logged`,`${food.cal} kcal · ${food.protein||0}g protein`);
-  const tProt=S.log.nutrition.meals.reduce((a,m)=>a+(m.protein||0),0);
-  if(tProt>=S.cfg.targets.protein&&!S.log.checkins.protein){S.log.checkins.protein=true;DB.saveLog(S.today,S.log);setTimeout(()=>toast('🥩','Protein goal reached!',`${Math.round(tProt)}g / ${S.cfg.targets.protein}g 💪`),1000);}
+  S.log.nutrition.meals.push(meal);nutritionMeal=meal.mealType;
+  closeSheet();finishNutritionAction(before,food.name.slice(0,26)+' logged');
 }
 /* ── ONBOARDING ─────────────────────────────────────────────────────────
@@ -1798,5 +2029,16 @@ function obShowError(message){
   S.ob.err=message;
   const err=document.querySelector('#onboard .ob-err');
-  if(err){err.textContent=message;err.classList.remove('show');void err.offsetWidth;err.classList.add('show');}
+  if(err){
+    err.textContent=message;
+    // Cancel the previous feedback without forcing a geometric layout read.
+    if(err.getAnimations)err.getAnimations().forEach(animation=>animation.cancel());
+    err.style.animation='none';
+    err.classList.add('show');
+    if(!prefersReducedMotion()&&err.animate)err.animate([
+      {opacity:0,transform:'translateX(8px)',offset:0},
+      {opacity:1,transform:'translateX(-2px)',offset:0.65},
+      {opacity:1,transform:'translateX(0)',offset:1}
+    ],{duration:200,easing:'cubic-bezier(0.25,0.46,0.45,0.94)'});
+  }
   const id=S.ob.step===1?(message.startsWith('Height')?'ob-h':'ob-bd'):
     (message.startsWith('Enter your current')||message.startsWith('That weight')?'ob-w':'ob-t');
@@ -2175,4 +2417,5 @@ function saveRhr(){
 /* ── PROGRESS SCREEN ────────────────────────── */
 function renderProgress(){
+  const retainedChart=document.querySelector("#s3 .chart-wrap");
   const wh=DB.weights(),all=DB.allLogs(),c=S.cfg;
   const curW=wh.length>0?wh[wh.length-1].weight:c.body.currentWeight;
@@ -2180,5 +2423,14 @@ function renderProgress(){
   const diffColor=diff<0?'var(--green-text)':diff>0?'var(--coral-text)':'var(--t3)';
   const dDisp=(toDisp(curW)-toDisp(c.body.startingWeight)).toFixed(1);const diffStr=dDisp<0?`↓ ${Math.abs(dDisp)} ${wUnit()}`:dDisp>0?`↑ ${dDisp} ${wUnit()}`:'No change';
-  const gs=calcStreak(all,'gym'),ps=calcStreak(all,'protein'),ws=calcStreak(all,'water');
+  const dow=(new Date(S.today+'T12:00:00').getDay()+6)%7;
+  let gymDays=0,proteinDays=0,waterDays=0;
+  for(let i=0;i<=dow;i++){
+    const log=all[shiftDate(S.today,-i)];
+    if(!log)continue;
+    if(log.workout?.completed)gymDays++;
+    const protein=(log.nutrition?.meals||[]).reduce((sum,meal)=>sum+(meal.protein||0),0);
+    if(c.targets.protein>0&&protein>=c.targets.protein)proteinDays++;
+    if((log.nutrition?.water||0)>=(c.targets.water||4000))waterDays++;
+  }
   document.getElementById('s3').innerHTML=`
   <div>
@@ -2199,5 +2451,5 @@ function renderProgress(){
         </div>
       </div>
-      <div class="chart-wrap"><canvas id="wt-chart"></canvas></div>
+      <div class="chart-wrap"><canvas id="wt-chart" tabindex="0" aria-label="Weight history. Use left and right arrows to explore weigh-ins."></canvas><div class="chart-scrub-line"></div><div class="chart-scrub-pill" aria-hidden="true"></div><div class="chart-scrub-live" aria-live="polite" aria-atomic="true"></div></div>
     </div>
     <div class="section-label">Trend and projection</div>
@@ -2249,9 +2501,9 @@ function renderProgress(){
     </div>
     ${doseScheduleCard()}
-    <div class="section-label">Streaks</div>
-    <div class="streak-row">
-      <div class="streak-card"><div style="font-size:22px">${gs>0?'🔥':'🏋️'}</div><div class="streak-num" style="color:${gs>0?'var(--orange-text)':'var(--t3)'}">${gs}</div><div class="streak-lbl">Gym days</div></div>
-      <div class="streak-card"><div style="font-size:22px">${ps>0?'🔥':'🥩'}</div><div class="streak-num" style="color:${ps>0?'var(--coral-text)':'var(--t3)'}">${ps}</div><div class="streak-lbl">Protein</div></div>
-      <div class="streak-card"><div style="font-size:22px">${ws>0?'🔥':'💧'}</div><div class="streak-num" style="color:${ws>0?'var(--blue-light-text)':'var(--t3)'}">${ws}</div><div class="streak-lbl">Hydration</div></div>
+    <div class="section-label">This week</div>
+    <div class="week-summary">
+      <div class="week-summary-row"><div class="week-summary-lbl">Gym</div><div class="week-summary-num">${gymDays} of ${c.gymTarget??3}</div></div>
+      <div class="week-summary-row"><div class="week-summary-lbl">Protein target met</div><div class="week-summary-num">${proteinDays} of 7 days</div></div>
+      <div class="week-summary-row"><div class="week-summary-lbl">Water goal met</div><div class="week-summary-num">${waterDays} of 7 days</div></div>
     </div>
     <div class="section-label">Activity calendar</div>
@@ -2271,13 +2523,6 @@ function renderProgress(){
     <div style="height:16px"></div>
   </div>`;
-  setTimeout(()=>buildChart(),100);
-}
-function calcStreak(all,field){
-  let s=0;
-  for(let i=0;i<90;i++){
-    const k=shiftDate(S.today,-i);
-    if(all[k]?.checkins?.[field])s++;else break;
-  }
-  return s;
+  if(retainedChart)document.querySelector("#s3 .chart-wrap").replaceWith(retainedChart);
+  buildChart();
 }
 function buildCal(){
@@ -2327,7 +2572,68 @@ function showDay(ds){
   </div>`,dl);
 }
+
+function installChartScrubbing(chart){
+  const canvas=chart.canvas,wrap=canvas.parentElement;
+  const line=wrap.querySelector('.chart-scrub-line'),pill=wrap.querySelector('.chart-scrub-pill'),live=wrap.querySelector('.chart-scrub-live');
+  let selected=-1,lastPulse=-Infinity,gesture=null,tapHide=0;
+  function hide(){wrap.classList.remove('scrubbing');}
+  chart.resetScrub=()=>{selected=-1;gesture=null;hide();};
+  function show(index,haptic){
+    const weights=chart.scrubWeights||[],points=chart.getDatasetMeta(0).data;
+    if(!weights.length||!points[index])return;
+    const point=points[index].getProps(['x'],true),area=chart.chartArea;
+    const text=fmtDate(weights[index].date)+', '+toDisp(weights[index].weight).toFixed(1)+' '+wUnit();
+    pill.textContent=text;if(live.textContent!==text)live.textContent=text;
+    line.style.transform='translateX('+point.x+'px)';
+    line.style.top=area.top+'px';line.style.height=(area.bottom-area.top)+'px';
+    const left=Math.max(0,Math.min(wrap.clientWidth-pill.offsetWidth,point.x-pill.offsetWidth/2));
+    pill.style.transform='translateX('+left+'px)';wrap.classList.add('scrubbing');
+    const now=performance.now();
+    if(haptic&&index!==selected&&!prefersReducedMotion()&&/Android/i.test(navigator.userAgent)&&!/iPhone|iPad|iPod/i.test(navigator.userAgent)&&typeof navigator.vibrate==='function'&&now-lastPulse>=40){
+      navigator.vibrate(8);lastPulse=now;
+    }
+    selected=index;
+  }
+  function at(e,haptic=true){
+    const x=(e.clientX-canvas.getBoundingClientRect().left)*chart.width/canvas.getBoundingClientRect().width;
+    const points=chart.getDatasetMeta(0).data;
+    let nearest=0,distance=Infinity;
+    points.forEach((p,i)=>{const d=Math.abs(p.getProps(['x'],true).x-x);if(d<distance){distance=d;nearest=i;}});
+    show(nearest,haptic);
+  }
+  canvas.addEventListener('pointerdown',e=>{
+    if(!e.isPrimary||e.button!==0)return;
+    selected=-1;clearTimeout(tapHide);gesture={id:e.pointerId,x:e.clientX,y:e.clientY,axis:null,e};
+  });
+  canvas.addEventListener('pointermove',e=>{
+    if(!gesture||gesture.id!==e.pointerId)return;
+    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
+    if(!gesture.axis&&Math.max(Math.abs(dx),Math.abs(dy))>8){
+      gesture.axis=Math.abs(dx)>Math.abs(dy)?'x':'y';
+      if(gesture.axis==='x'&&canvas.setPointerCapture&&e.isTrusted)canvas.setPointerCapture(e.pointerId);
+    }
+    if(gesture.axis==='y'){hide();return;}
+    if(gesture.axis==='x')at(e);
+  });
+  // A vertical scroll that starts on the chart must not flash the pill or buzz: scrub only once the drag is horizontal; a plain tap shows the value briefly, silently.
+  function release(e){const g=gesture;gesture=null;if(g&&!g.axis&&e&&e.type==='pointerup'){at(g.e,false);tapHide=setTimeout(hide,1500);}else hide();}
+  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,release));
+  // Keep chart drags out of the app's horizontal tab-swipe recognizer.
+  ['touchstart','touchmove','touchend'].forEach(type=>canvas.addEventListener(type,e=>e.stopPropagation(),{passive:true}));
+  canvas.addEventListener('keydown',e=>{
+    if(e.key==='Escape'){hide();return;}
+    if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
+    e.preventDefault();
+    const n=(chart.scrubWeights||[]).length;if(!n)return;
+    show(selected<0?(e.key==='ArrowLeft'?n-1:0):Math.max(0,Math.min(n-1,selected+(e.key==='ArrowRight'?1:-1))),false);
+  });
+  canvas.addEventListener('blur',hide);
+  const observer=new MutationObserver(()=>{
+    if(!canvas.isConnected){observer.disconnect();if(chart.canvas===canvas)chart.destroy();if(S.wtChart===chart)S.wtChart=null;}
+  });
+  observer.observe(document.getElementById('s3'),{childList:true,subtree:true});
+}
 function setRange(r){
   S.chartRange=r;
-  if(S.wtChart){S.wtChart.destroy();S.wtChart=null;}
   document.querySelectorAll('.range-tab').forEach(t=>{t.classList.toggle('active',t.textContent===r+'d');});
   buildChart();
@@ -2335,10 +2641,10 @@ function setRange(r){
 function buildChart(){
   const canvas=document.getElementById('wt-chart');
-  if(!canvas||typeof Chart==='undefined')return;
-  if(S.wtChart){S.wtChart.destroy();S.wtChart=null;}
+  if(S.wtChart&&!S.wtChart.canvas.isConnected){S.wtChart.destroy();S.wtChart=null;}
+  if(!canvas||!canvas.isConnected||typeof Chart==='undefined')return;
   const wh=DB.weights(),days=S.chartRange;
   const cut=new Date();cut.setDate(cut.getDate()-days);
   const filtered=wh.filter(w=>new Date(w.date+'T12:00:00')>=cut);
-  if(filtered.length===0)filtered.push({date:S.today,weight:S.cfg.body.currentWeight});
+  canvas.setAttribute('aria-label',filtered.length?'Weight history. Use left and right arrows to explore weigh-ins.':'No weigh-ins in this range.');
   const labels=filtered.map(w=>{const d=new Date(w.date+'T12:00:00');return `${d.getMonth()+1}/${d.getDate()}`;});
   /* toDisp(), not the raw stored kilograms: the chart used to plot kg no
@@ -2352,8 +2658,18 @@ function buildChart(){
   const purple=v('--purple-text'),green=v('--green-text'),surface=v('--s2'),
         text=v('--t1'),tipBorder=v('--border2'),tick=v('--t3'),grid=v('--border');
-  S.wtChart=new Chart(canvas,{type:'line',data:{labels,datasets:[
+  const config={type:'line',data:{labels,datasets:[
     {label:'Weight',data,borderColor:purple,backgroundColor:purple+'12',borderWidth:2.5,pointBackgroundColor:purple,pointRadius:4,pointHoverRadius:6,fill:true,tension:0.4},
     {label:'Target',data:Array(labels.length).fill(toDisp(S.cfg.body.targetWeight)),borderColor:green+'73',borderWidth:1.5,borderDash:[5,5],pointRadius:0,fill:false},
-  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:surface,titleColor:purple,bodyColor:text,borderColor:tipBorder,borderWidth:1,padding:10}},scales:{x:{grid:{color:grid},ticks:{color:tick,font:{size:10},maxTicksLimit:6}},y:{grid:{color:grid},ticks:{color:tick,font:{size:10}}}},animation:{duration:800,easing:'easeOutQuart'}}});
+  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:false,backgroundColor:surface,titleColor:purple,bodyColor:text,borderColor:tipBorder,borderWidth:1,padding:10}},scales:{x:{grid:{color:grid},ticks:{color:tick,font:{size:10},maxTicksLimit:6}},y:{grid:{color:grid},ticks:{color:tick,font:{size:10}}}},animation:{duration:prefersReducedMotion()?0:550,easing:'easeOutQuart'}}};
+  if(S.wtChart){
+    S.wtChart.data=config.data;S.wtChart.options=config.options;
+    S.wtChart.update('none');
+  }else{
+    S.wtChart=new Chart(canvas,config);
+    installChartScrubbing(S.wtChart);
+  }
+  S.wtChart.scrubWeights=filtered;
+  if(S.wtChart.resetScrub)S.wtChart.resetScrub();
+  canvas.parentElement.dataset.empty=filtered.length?'':'No weigh-ins in this range.';
 }
 /* ── SETTINGS SCREEN ────────────────────────── */
@@ -2555,20 +2871,117 @@ function toggleRamadan(){
 }
 /* ── BOTTOM SHEETS ──────────────────────────── */
+/* One history entry and opener for the entire modal session, including handoffs. */
+let modalSession=null,modalBackPending=false,modalQueuedOpen=null,modalSerial=0;
+function modalFocus(dialog){
+  const first=dialog.querySelector('input:not([disabled]):not([type="hidden"]),textarea:not([disabled]),select:not([disabled])')||dialog.querySelector('.sheet-close,button');
+  first?.focus({preventScroll:true});
+}
+function modalBack(){
+  if(!modalSession&&!modalBackPending)return false;
+  const pending=modalBackPending;
+  modalBackPending=false;
+  if(!pending)modalDismiss(true);
+  const idx=navBackHandlers.indexOf(modalBack);
+  if(idx>=0)navBackHandlers.splice(idx,1);
+  const queued=modalQueuedOpen;modalQueuedOpen=null;
+  if(queued){modalSession?.finish?.();queued();}
+  return true;
+}
+function modalPresent(dialog,fill){
+  if(modalBackPending){modalQueuedOpen=()=>modalPresent(dialog,fill);return;}
+  if(modalSession?.closing)modalSession.finish();
+  const replacing=!!modalSession;
+  if(!modalSession){
+    modalSession={opener:document.activeElement,dialog:null,closing:false};
+    history.pushState({...history.state,fittrackModal:true},'',location.pathname+location.search);
+    navBackHandlers.push(modalBack);
+  }
+  const session=modalSession,previous=session.dialog;
+  const serial=++modalSerial;
+  clearTimeout(session.timer);
+  session.closing=false;
+  previous?.getAnimations().forEach(a=>a.cancel());
+  if(previous&&previous!==dialog){previous.classList.remove('show');previous.close();}
+  session.dialog=dialog;
+  dialog.style.removeProperty('transform');dialog.style.removeProperty('transition');
+  dialog.getAnimations().forEach(a=>a.cancel());
+  fill();
+  if(!dialog.open){dialog.showModal();dialog.getBoundingClientRect();}
+  dialog.classList.add('show');
+  if(replacing&&!prefersReducedMotion())dialog.firstElementChild?.animate([{opacity:0},{opacity:1}],{duration:120,easing:'ease-out'});
+  modalFocus(dialog);
+  dialog.oncancel=e=>{e.preventDefault();modalDismiss();};
+  /* Keep the Tab boundary inside the dialog even when Chrome targets its toolbar. */
+  dialog.onkeydown=e=>{
+    if(e.key!=='Tab')return;
+    const controls=[...dialog.querySelectorAll('button,input,textarea,select,a[href],[tabindex]')].filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length);
+    const first=controls[0],last=controls[controls.length-1];
+    if(!first){e.preventDefault();dialog.focus();}
+    else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
+    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
+  };
+  dialog.onclose=()=>{if(!dialog.open&&modalSession===session&&!session.closing&&serial===modalSerial)modalDismiss();};
+  let outside=false;
+  dialog.onpointerdown=e=>{outside=e.target===dialog;};
+  dialog.onclick=e=>{if(outside&&e.target===dialog)modalDismiss();outside=false;};
+}
+function modalDismiss(fromBack=false){
+  modalQueuedOpen=null;
+  const session=modalSession;if(!session)return;
+  if(session.closing)return;
+  session.closing=true;
+  const dialog=session.dialog,serial=++modalSerial;
+  dialog.firstElementChild?.getAnimations().forEach(a=>a.cancel());
+  dialog.style.removeProperty('transform');dialog.style.removeProperty('transition');
+  dialog.classList.remove('show');
+  if(!fromBack){modalBackPending=true;history.back();}
+  const finish=()=>{
+    if(modalSession!==session||serial!==modalSerial)return;
+    dialog.close();
+    if(dialog.id==='sheet-wrap')dialog.replaceChildren();
+    document.getElementById('confetti-wrap').replaceChildren();
+    modalSession=null;
+    if(session.opener?.isConnected)session.opener.focus({preventScroll:true});
+  };
+  session.finish=finish;
+  if(prefersReducedMotion())finish();
+  else session.timer=setTimeout(finish,parseFloat(getComputedStyle(dialog).transitionDuration)*1000+30);
+}
+function bindSheetDrag(dialog){
+  let drag=null;
+  dialog.addEventListener('pointerdown',e=>{
+    if(!e.isPrimary||e.button!==0||modalSession?.closing||!e.target.closest('.sheet-handle,.sheet-hdr')||e.target.closest('button')||dialog.querySelector('.sheet').scrollTop>0)return;
+    drag={id:e.pointerId,start:e.clientY,last:e.clientY,time:e.timeStamp,velocity:0,height:dialog.getBoundingClientRect().height};
+    dialog.setPointerCapture(e.pointerId);dialog.style.transition='none';
+  },{passive:true});
+  dialog.addEventListener('pointermove',e=>{
+    if(!drag||drag.id!==e.pointerId)return;
+    const dt=e.timeStamp-drag.time;
+    if(dt>0)drag.velocity=(e.clientY-drag.last)/dt;
+    drag.last=e.clientY;drag.time=e.timeStamp;
+    const dy=e.clientY-drag.start;
+    dialog.style.transform=`translateY(${dy>=0?dy:Math.max(-24,dy*0.3)}px)`;
+  },{passive:true});
+  const release=e=>{
+    if(!drag||drag.id!==e.pointerId)return;
+    const dy=e.clientY-drag.start;
+    const dismiss=e.type==='pointerup'&&(dy>drag.height*0.3||(dy>0&&e.timeStamp-drag.time<100&&drag.velocity>0.5));
+    drag=null;
+    if(dialog.hasPointerCapture(e.pointerId))dialog.releasePointerCapture(e.pointerId);
+    dialog.style.transition=prefersReducedMotion()?'none':'transform 250ms var(--ease-sheet)';
+    if(dismiss)modalDismiss();else dialog.style.transform='translateY(0)';
+  };
+  dialog.addEventListener('pointerup',release,{passive:true});
+  dialog.addEventListener('pointercancel',release,{passive:true});
+  dialog.addEventListener('lostpointercapture',()=>{if(drag){drag=null;dialog.style.removeProperty('transform');dialog.style.removeProperty('transition');}},{passive:true});
+}
 function openSheet(content,title=''){
-  const sw=document.getElementById('sheet-wrap'),bd=document.getElementById('backdrop');
-  sw.innerHTML=`<div class="sheet" role="dialog" aria-modal="true"${title?' aria-label="'+esc(title)+'"':''}>
-    <div class="sheet-handle"></div>
-    ${title?`<div class="sheet-hdr"><div class="sheet-title">${title}</div><button class="sheet-close" aria-label="Close" onclick="closeSheet()">${svgIcon('x',13,'var(--t2)')}</button></div>`:''}
-    ${content}
-  </div>`;
-  requestAnimationFrame(()=>{bd.classList.add('show');sw.classList.add('show');});
-  /* Move focus into the sheet, or a keyboard and a screen reader are both left
-     behind on the element that opened it. A text input wins when there is one,
-     because every sheet that has one exists to have it typed into. */
-  requestAnimationFrame(()=>{
-    const first=sw.querySelector('input,textarea,select,button');
-    if(first)try{first.focus({preventScroll:true});}catch(e){}
+  const dialog=document.getElementById('sheet-wrap');
+  modalPresent(dialog,()=>{
+    dialog.setAttribute('aria-label',title||'Sheet');
+    dialog.innerHTML=`<div class="sheet"><div class="sheet-handle" aria-hidden="true"></div>
+      <div class="sheet-hdr"><div class="sheet-title">${title}</div><button type="button" class="sheet-close" aria-label="Close" onclick="closeSheet()">${svgIcon('x',13,'var(--t2)')}</button></div>${content}</div>`;
+    if(!dialog.dataset.dragBound){bindSheetDrag(dialog);dialog.dataset.dragBound='true';}
   });
-  bd.onclick=closeSheet;
 }
 function openHelp(topicKey){
@@ -2578,6 +2991,6 @@ function openHelp(topicKey){
 }
 function closeSheet(){
-  document.getElementById('sheet-wrap')?.classList.remove('show');
-  document.getElementById('backdrop')?.classList.remove('show');
+  if(modalSession?.dialog.id==='sheet-wrap')modalDismiss();
+  else if(modalBackPending)modalQueuedOpen=null;
 }
 function openWeightSheet(){
@@ -2607,5 +3020,5 @@ function saveWeight(){
   DB.addWeight(S.today,kg);S.cfg.body.currentWeight=kg;DB.saveSettings(S.cfg);
   closeSheet();toast('⚖️',`Weight logged: ${v} ${wUnit()}`,'Saved to history');
-  if(S.screen===0)renderScreen(0);
+  if(document.getElementById('s0').firstElementChild)renderHome();else markScreenDirty(0);markScreenDirty(3);markScreenDirty(1);
 }
 function openStepsSheet(date){
@@ -2639,5 +3052,5 @@ function saveSteps(){
   saveStepsFor(d,v);closeSheet();
   toast('👟',`${v.toLocaleString()} steps logged`,d===S.today?'':`for ${shortDate(d)}`);
-  if(S.screen===0)renderScreen(0);if(S.screen===3)renderScreen(3);
+  if(document.getElementById('s0').firstElementChild)renderHome();else markScreenDirty(0);markScreenDirty(3);if(S.screen===3)renderScreen(3);
 }
 function openWaterSheet(){
@@ -2668,7 +3081,6 @@ function openMealSheet(){
 }
 function openManualSheet(){
-  closeSheet();
   const types=getMealTypes();
-  setTimeout(()=>openSheet(`<div class="sheet-body">
+  openSheet(`<div class="sheet-body">
     <div class="inp-grp"><div class="inp-lbl">Food name</div><input class="inp-field" id="mn" type="text" placeholder="e.g. Beef Tehari" autocorrect="off"></div>
     <div class="inp-row">
@@ -2688,5 +3100,5 @@ function openManualSheet(){
       <button class="sheet-btn sheet-btn-secondary" style="flex:1" onclick="saveManual(true)">Save as preset</button>
     </div>
-  </div>`,'Manual entry'),80);
+  </div>`,'Manual entry');
 }
 function saveManual(savePreset){
@@ -3038,21 +3450,28 @@ function confirmClear(){
 /* ── CELEBRATION + TOAST ────────────────────── */
 function celebrate(icon,title,sub){
-  document.getElementById('cel-icon').textContent=icon;
-  document.getElementById('cel-title').textContent=title;
-  document.getElementById('cel-sub').textContent=sub;
-  document.getElementById('celebration').classList.add('show');
-  launchConfetti();
+  modalPresent(document.getElementById('celebration'),()=>{
+    document.getElementById('cel-icon').textContent=icon;
+    document.getElementById('cel-title').textContent=title;
+    document.getElementById('cel-sub').textContent=sub;
+    launchConfetti();
+  });
 }
-function hideCel(){document.getElementById('celebration').classList.remove('show');}
+function hideCel(){if(modalSession?.dialog.id==='celebration')modalDismiss();else if(modalBackPending)modalQueuedOpen=null;}
 function launchConfetti(){
   const w=document.getElementById('confetti-wrap');if(!w)return;w.innerHTML='';
+  if(prefersReducedMotion())return;
+  const fragment=document.createDocumentFragment();
   const colors=['#FF9500','#30D158','#0A84FF','#BF5AF2','#FF6B6B','#FFD60A','#4FC3F7'];
   for(let i=0;i<52;i++){
     const p=document.createElement('div');p.className='cp';
     p.style.cssText=`left:${Math.random()*100}%;top:-20px;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*1.5}s;animation-duration:${1.5+Math.random()}s;transform:rotate(${Math.random()*360}deg);width:${6+Math.random()*6}px;height:${6+Math.random()*6}px`;
-    w.appendChild(p);
+    fragment.appendChild(p);
   }
+  w.appendChild(fragment);
 }
-function toast(icon,txt,sub){
+function toast(icon,txt,sub,undo=null){
+  nutritionUndo=undo;
+  document.getElementById('t-undo').hidden=!undo;
+  document.getElementById('toast').classList.toggle('nutrition-undo',!!undo);
   document.getElementById('t-icon').textContent=icon;
   document.getElementById('t-txt').textContent=txt;
@@ -3060,29 +3479,48 @@ function toast(icon,txt,sub){
   const el=document.getElementById('toast');el.classList.add('show');
   if(S.toastTimer)clearTimeout(S.toastTimer);
-  S.toastTimer=setTimeout(()=>el.classList.remove('show'),3000);
+  S.toastTimer=setTimeout(()=>{el.classList.remove('show');document.getElementById('t-undo').hidden=true;nutritionUndo=null;},undo?5000:3000);
 }
 /* ── SWIPE NAVIGATION ───────────────────────── */
 function initSwipe(){
   const c=document.getElementById('screen-container');
-  let sx=0,sy=0,dragging=false;
-  c.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;dragging=false;},{passive:true});
+  let sx=0,sy=0,gesture=null,startScreen=0;
+  c.addEventListener('touchstart',e=>{
+    gesture=null;
+    if(e.touches.length!==1||document.querySelector('#sheet-wrap.show,#backdrop.show'))return;
+    const target=e.target instanceof Element?e.target:e.target.parentElement;
+    if(target?.closest('input,textarea,select,.day-tabs,[role="dialog"]'))return;
+    for(let el=target;el&&el!==c;el=el.parentElement){
+      if(el.scrollWidth>el.clientWidth&&/auto|scroll/.test(getComputedStyle(el).overflowX))return;
+    }
+    sx=e.touches[0].clientX;sy=e.touches[0].clientY;
+    startScreen=S.screen;gesture='pending';
+  },{passive:true});
   c.addEventListener('touchmove',e=>{
+    if(!gesture)return;
+    if(e.touches.length!==1){gesture=null;return;}
     const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
-    if(!dragging&&Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>8)dragging=true;
+    if(gesture==='pending'&&Math.max(Math.abs(dx),Math.abs(dy))>8){
+      gesture=Math.abs(dx)>Math.abs(dy)?'horizontal':null;
+    }
   },{passive:true});
   c.addEventListener('touchend',e=>{
-    if(!dragging)return;
+    const horizontal=gesture==='horizontal';gesture=null;
+    if(!horizontal||S.screen!==startScreen||!e.changedTouches.length||document.querySelector('#sheet-wrap.show,#backdrop.show'))return;
     const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
     if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>55){
-      if(dx<0&&S.screen<4)go(S.screen+1);
-      else if(dx>0&&S.screen>0)go(S.screen-1);
+      if(dx<0&&S.screen<4)go(S.screen+1,'swipe');
+      else if(dx>0&&S.screen>0)go(S.screen-1,'swipe');
     }
-    dragging=false;
   },{passive:true});
+  c.addEventListener('touchcancel',()=>{gesture=null;},{passive:true});
 }
 /* ── RENDER DISPATCHER ──────────────────────── */
-function renderScreen(idx){
+function renderScreen(idx,navigation=false){
+  const el=document.getElementById('s'+idx),scroll=el?el.scrollTop:0;
   switch(idx){case 0:renderHome();break;case 1:renderWorkout();break;case 2:renderNutrition();break;case 3:renderProgress();break;case 4:renderSettings();break;}
-  const el=document.getElementById('s'+idx);if(el)el.scrollTop=0;
+  if(el)el.scrollTop=Math.min(scroll,Math.max(0,el.scrollHeight-el.clientHeight));
+  navRendered.add(idx);navDirty.delete(idx);
+  /* Explicit action renders may change shared logs/settings. Tab visits do not. */
+  if(!navigation)for(let i=0;i<5;i++)if(i!==idx)markScreenDirty(i);
 }
 /* ── TAB BAR BUILD ──────────────────────────── */
@@ -3100,4 +3538,5 @@ function buildTabs(){
       <div class="tab-label">${t.label}</div>
     </button>`).join('');
+  updateTabs();
 }
 /* ── INIT ───────────────────────────────────── */
@@ -3135,4 +3574,26 @@ function init(){
   renderScreen(0);
   ingestFromHash();
+  /* Install after hash consumption so Back can never replay a launch action. */
+  navHasEntry=!!history.state?.fittrackNav&&history.state.screen!==0;
+  if(!navHasEntry&&S.screen!==0){
+    history.replaceState({...history.state,fittrackNav:true,screen:0},'',location.pathname+location.search);
+    history.pushState({...history.state,screen:S.screen},'',location.pathname+location.search);
+    navHasEntry=true;
+  }else history.replaceState({...history.state,fittrackNav:true,screen:S.screen},'');
+  navHistoryReady=true;
+  window.addEventListener('popstate',e=>{
+    for(const handler of [...navBackHandlers].reverse())if(handler(e)===true)return;
+    navHasEntry=false;
+    if(navReturningHome){
+      navReturningHome=false;
+      if(S.screen!==0){
+        history.pushState({...history.state,fittrackNav:true,screen:S.screen},'',location.pathname+location.search);
+        navHasEntry=true;
+      }
+      return;
+    }
+    go(0,'back');
+  });
+  if(navHasEntry&&S.screen===0){navReturningHome=true;history.back();}
   window.addEventListener('hashchange',ingestFromHash);
   initSwipe();
