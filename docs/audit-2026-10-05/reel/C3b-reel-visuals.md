# C3b: FitTrack showcase reel, visuals (Remotion)

Work in `C:/Users/adnan/projects/motion-studio` (Remotion 4, set up by run C2; read its README first). Read `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/RULES.md` for the hard limits; they apply here too.

**You own:** `src/projects/fittrack/**` (except `timeline.json`), `scripts/capture-fittrack.mjs`, `public/fittrack/captures/**`, the FitTrack entries in `src/Root.tsx`, and your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/C3b.log.md`.
**Another run (C3a) owns** `scripts/synth-fittrack.mjs` and `public/fittrack/music.wav`. Do not touch them. Reference the music with `<Audio src={staticFile("fittrack/music.wav")} />` guarded so the composition still renders if the file is missing.
**Read-only:** everything in `C:/Users/adnan/projects/fittrack`. Never edit it.
**Pinned interface:** copy `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/reel/timeline.json` to `src/projects/fittrack/timeline.json` unchanged and drive EVERY scene boundary, transition, caption and visual event from it. C3a builds the score from the same file, so sync is guaranteed only if you never hardcode a frame that the file defines. Need a change? Write it in your log; do not edit the file.

Before writing code, read `C:/Users/adnan/.claude/skills/remotion-best-practices/SKILL.md` and the rule files it routes to for animation, fonts, sequencing, transitions and assets.

## The film
A 30 second, 1920 x 1080, 60 fps (1800 frames) showcase of FitTrack, a free offline-first fitness PWA (workouts, nutrition with a calorie floor, weight trend, flexible gym days, light and dark themes, one HTML file, no account, no subscription). The register is an Apple product film: black ground, big confident type, one hero object per moment, calm but never static. Adnan's bar for the app is "the best smoothness, functionality, UI feel, UX like apple apps", so the film must feel that way too: if a single frame stutters or jumps, the film fails.

**The spine is the ring.** FitTrack's mark is an orange-to-coral progress ring with an open gap, around three ascending bars. The ring is the camera's portal: it draws itself in the cold open, the camera dives through its gap into the story, the app's screens live inside the ring's world, and at the end the camera dives back through the app icon to land on the ring as it locks into the logo. Keep the ring present as a faint, slowly rotating outline behind scenes 2 to 7 (opacity 0.06 to 0.10) so the device stays continuous.

## Brand
- Ground: pure black `#000000`, made alive with one soft radial glow in the active scene's accent at 10 to 14 percent opacity, drifting slowly on a sum of slow sines. Never flat, never busy.
- Type: `Inter Tight` 800 for headlines (tracking -3 percent), `Inter` 500 for labels, all numbers with `font-variant-numeric: tabular-nums`. Load with `@remotion/google-fonts`. White `#FFFFFF` primary, `#AEAEB2` secondary.
- App palette (from `fittrack.html` `:root`): orange `#FF9500`, coral `#FF6B6B`, blue `#0A84FF`, green `#30D158`, purple `#BF5AF2`, yellow `#FFD60A`, surfaces `#111111`, `#1C1C1E`, `#2C2C2E`. The `app-*` accents in the timeline mean: use the accent the app itself uses for that tab or feature (read `fittrack.html` to find it) so the film and app agree.
- Logo: build `FitTrackMark.tsx` as a vector React component from the geometry in `C:/Users/adnan/projects/fittrack/assets/icon.svg`: the ring path `M168.96 105.235 A174.08 174.08 0 1 1 81.92 256` with stroke 56.32, round caps, a userSpaceOnUse gradient `#FF9500` to `#FF6B6B`, and the three rounded bars. Props: `ringProgress` (0 to 1, drives a stroke-dash draw), `barsProgress` (0 to 1 per bar via springs), `glow` (0 to 1, a soft orange radial bloom, never a flat fill). Build `Wordmark.tsx`: "FitTrack" in Inter Tight 800, and a horizontal lockup (mark left, wordmark right, optical vertical centring). No new logo; this IS the mark, made motion-native.
- Platform logos for the ownership scene: Chrome, Safari, Android, Apple from Simple Icons (`simple-icons` npm package, CC0 SVG paths), monochrome white at 40 px, small labels under them. Nominative use only: they say where it runs.

## The phone
A generic, brandless phone drawn in code: rounded slab (radius 64 px at a 900 px tall phone), uniform 10 px black bezel, a 1 px light edge highlight gradient, a centred punch-hole camera, a large soft contact shadow below. No manufacturer marks. The screen is a captured app PNG with matching inner radius. Present it in 3D with CSS perspective (1600 px): it lives between rotateY -14 and +14 degrees and rotateX 4 to 8 degrees, moving on springs, never snapping. To scroll a screen, translate a tall full-page capture inside the screen mask.

## Captures (real app, demo data only)
Write `scripts/capture-fittrack.mjs` (puppeteer-core with system Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`, one instance, free CDP port). Serve the app with its own `node serve.mjs` from the fittrack folder (read it for the port), seed the SAME demo profile `tools/capture-media.mjs` uses (import or copy its seed; the reel must never show real personal data, and you must reuse that script's assertion approach: fail if any non-demo value appears), and freeze transitions and animations before each shot, as that script does. Viewport 384 x 832 at deviceScaleFactor 2.5. States: home (viewport and full page), workout (default, one set done, two sets done), nutrition (default, food search with "chicken" typed and results shown, and a state where intake sits just above the floor), progress (dark), progress (light theme), plus anything a scene below needs. Save PNGs to `public/fittrack/captures/<state>.png` with a `manifest.json`. The app will be upgraded in the next days, so this script must be the one command that refreshes every capture.

## Scenes (frames come from timeline.json; descriptions say what happens)
1. **signal**: black. An orange point appears with a tiny scale-pop, then sweeps clockwise into the ring (stroke draw along the true arc, leading cap glowing), leaving the gap. The three bars spring up one per cue, each with a small overshoot. Hold, then the camera pushes into the ring gap (zoom-through, motion blur only during the 12 transition frames).
2. **kinetic**: the four captions land on their cue frames, centre frame, Inter Tight 800 at 150 px ("Tracked." at 220 px). Each word group enters with a 6 frame scale 1.08 to 1.0 plus opacity, letters staggered 1 frame, and exits by sliding up 40 px while the next lands. The faint ring behind rotates one notch (15 degrees) on every hit. Nothing else on screen.
3. **home**: the phone rises from below on a spring (stiffness 140, damping 18), turning from rotateY -14 to -6. Over the screen, three or four key numbers from the home capture get number tickers that count up during the tick-roll cue and settle exactly on the captured values (position each ticker over the captured number; the ticker and capture must agree to the pixel when it settles). Caption on the left.
4. **workout**: whip from the previous scene. A tap ripple (expanding ring, 18 frames) at the first set's check control on the tap cue, then crossfade to the "one set done" capture over 6 frames on the confirm cue; same for set two. On the notify cue a notification card (generic rounded glass card, app icon, title "FitTrack", body taken from the app's real reminder copy in `fittrack.html` or `worker/`, never invented) slides down from above the phone with a spring. Captions as timed.
5. **nutrition**: the search field fills with "chicken" one character per key cue (draw the typed text as an overlay matching the app's field font and position, or step through captures), results stagger in, then the intake bar animates to just past a labelled floor marker, shifting from coral to green as it crosses on the confirm cue. If the app's actual floor UI differs, show the real one and follow it.
6. **progress**: the weight trend line draws itself along its path over the capture's chart (trace the line from the capture, or draw a matching line with the demo data), then a scrub cursor glides along it with a value bubble that ticks. On the flip cue a diagonal wipe turns the phone from the dark capture to the light capture. Weight shown in the demo profile's units only.
7. **ownership**: the phone pulls back and its screen condenses (scale and corner radius morph) into a small glowing file chip reading `fittrack.html`. Caption. The chip becomes the app icon (the mark on a rounded black tile) and flies onto a simple home-screen grid of abstract blank rounded tiles, landing with a small squash and stretch on the land cue. The four platform logos tick in. "Works offline." appears with a wifi glyph that gets a calm diagonal strike.
8. **finale**: zoom through the app icon into the ring. The ring completes its draw and locks on the boom cue: glow pulse, one shockwave ring expanding and fading, a 1.0 to 1.015 scale push that settles. The lockup forms (wordmark wipes in with a light sweep), then the tagline, then the URL in `Inter` 500 at 28 px. Fade to black over the last 30 frames.

## Smoothness law (non-negotiable)
- Every value is a pure function of the frame. Use Remotion's `random(seed)`, never `Math.random`.
- Animate transform and opacity. Glows are a few pre-blurred layers or radial gradients, not dozens of live `filter: blur()`.
- `@remotion/motion-blur` only on the transitions and the fastest moves, and only for those frames; it multiplies render time.
- No camera shake. Impact is a tiny scale push that settles.
- Every scene keeps a slow continuous camera drift (scale 1.00 to 1.04 across the scene), so nothing is ever a frozen frame.
- Grain: one small pre-made noise tile, offset per frame, 3 percent opacity. Subtle vignette.
- 72 px safe margin for all text.
- No em dashes in any on-screen text.

## Render and verify
1. `npx remotion still` at frames 60, 240, 300, 480, 690, 790, 900, 1010, 1150, 1275, 1380, 1450, 1500, 1600, 1700, then tile them into ONE contact sheet `out/fittrack-contact.jpg` (5 columns, 1900 px wide) with ffmpeg. Look at it yourself and fix anything clipped, overlapping, misaligned or unreadable before rendering the film.
2. Render `out/fittrack-reel-16x9.mp4`: H.264, CRF 16, yuv420p, AAC 320k if the music exists, `--concurrency=2` (Adnan is gaming on this laptop). Report the render time.
3. ffprobe: 1800 frames, 60 fps, 1920 x 1080. Paste the line.
4. Log ends with `Final report`: what was built, deviations from this brief and why, the capture states made, anything you could not verify.
