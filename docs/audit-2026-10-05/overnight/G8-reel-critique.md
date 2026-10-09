# G8: critique reel v2 against v1 and against Adnan's taste rules

Open exactly two images with view_file, once each: `docs/audit-2026-10-05/overnight/reel-v1-contact.jpg` (v1, 30 s, 18 stills in time order, left to right, top to bottom) and `docs/audit-2026-10-05/overnight/reel-v2-contact.jpg` (v2, 36 s, two stills per scene, labelled). Use no other tools. Then answer in Markdown:

1. For each of Adnan's rules below: v1 score, v2 score (0 to 10), one line of evidence from the stills.
2. Is v2 actually more tasteful and higher quality than v1? One honest paragraph.
3. The 10 highest-impact fixes for v2, ranked, each naming the scene and what to change in camera, framing, light, scale or type, concrete enough for a Remotion and three.js builder (for example "phone fills 65 percent of frame height" not "make it bigger").
4. What v2 still lacks compared with a real Apple product film (be specific).

No em dashes.

## Adnan's rules (verbatim file)
---
type: resource
title: "Adnan's motion taste: standing feedback and rules"
created: 2026-10-05
tags: [resource, motion-graphics, feedback, taste, apple-style, remotion]
status: active
related:
  - "[[_index]]"
  - "[[raw-2026-10-05-adnan-batch-1]]"
  - "[[raw-2026-10-05-adnan-batch-2]]"
---

# Adnan's motion taste: standing feedback and rules

**Read this before writing any motion brief.** It records what Adnan rejected and why, so the next reel starts at his bar instead of rediscovering it.

## 2026-10-05: FitTrack reel v1 review (verbatim)

> "I like the reel but its not quite tasteful. it does the same motion for every new screen, no variance or fancy motion, warping, morphing, parallax effect. the last few screens are very underwhelming. we need better sound too. more moving around of the phone and changing placement along the reel. use an iphone 18 pro max in the future for the phone on screen. I am sure the prompts I gave you earlier provide better outcomes."

> "there is no zooming in and out too on the reel. no immersive motion. I want apple product launch style."

He supplied the Verso prompt ([[raw-2026-10-05-adnan-batch-2]]) as the register to hit.

**Why v1 fell short (Claude's own diagnosis):** the v1 brief specified ONE phone presentation for the whole film ("lives between rotateY -14 and +14, moves on springs") and asked for "calm, never static". That produced the same rise-and-turn for every screen, a flat 2D phone, no camera language, plain crossfades, and a back third that wound down instead of escalating. The code-synthesized score was percussion-led with a thin pluck, which reads cheap next to a melodic launch score.

## Standing rules for every reel, launch film or motion piece

1. **Register: Apple product launch.** Product as the hero, lighting as the star, lots of negative space, calm but cinematic. Verso is the reference.
2. **Device: iPhone 18 Pro Max** for any phone on screen (Adnan, 2026-10-05). Build it accurately (verify current dimensions, corner radius, camera plateau and frame finish from Apple's published specs and design resources before modelling). Show the device, never Apple's logo or wordmark.
3. **No repeated move.** Every scene gets a different camera move AND a different placement. Before rendering, fill a variety table (scene x camera move, device placement, transition in, transition out, depth layers); any duplicate in a column is a fail.
4. **Real camera language:** push-ins, pull-backs, orbits, slow rotations, rack focus, macro to wide, zoom-throughs. Immersive, not a slideshow.
5. **Depth:** at least three parallax layers in every scene; exploded or separated UI layers as a set piece; shallow depth of field on macro moments.
6. **Designed transitions:** match cuts on shape, morphs, light sweeps, zoom-throughs, soft dissolves. Never the same transition twice in a row.
7. **The back third escalates.** The strongest set piece sits at 65 to 85 percent of the runtime; the end card is a payoff (light sweep, lockup), not a wind-down.
8. **Sound is half the film.** A melodic score (piano motif, warm pad, pulse on the beat, airy percussion entering halfway, a build to an uplifting final chord) plus crisp foley synced to on-screen actions (taps, clicks, snaps, shimmer on glints, whoosh on separation, snap on reassembly). Percussion-only synthesis is not acceptable. If code synthesis cannot reach this quality, say so and propose a free, licence-clean alternative before building.
9. **Write briefs at the reference level:** per scene, the camera move, the lighting move, the device placement, the on-screen type (main line plus grey subline), and the exact sound cue.
10. **Alternate grounds** like Verso: pure black `#000000` and off-white `#F5F5F7` studio backgrounds. For an app with dark and light themes this is a gift: alternate the themes with the grounds.

## FitTrack reel v2 direction (ready for the next session)

- **Format:** 30 to 40 s, 1920 x 1080, 60 fps, plus a 9:16 cut through `brag`.
- **Tech:** `@remotion/three` (three.js) for a real 3D iPhone 18 Pro Max: rounded body with a titanium-style frame (PBR, metalness about 1, roughness about 0.35), glass front, camera plateau on the back, the app capture as the screen texture, environment lighting plus moving rim lights for travelling highlights and soft contact shadows. 2D overlays (type, UI layers) composited in Remotion. Render with GL enabled (`--gl=angle`).
- **Scene ideas (each a different move):** a rim light travels along the phone's edge in darkness (cold open); push-in through the screen into the progress ring at macro scale; orbit at three-quarter showing the frame; a top-down flat-lay on off-white with the app live; the "exploded UI" set piece where Home's cards lift off the screen into stacked parallax layers and snap back (FitTrack's version of Verso's exploded pen); macro on giant light spec numbers ("1,502 foods", "0 accounts", "$0", "Works offline"); three phones side by side rotating in sync (dark theme, light theme, a third screen) like Verso's colorways; the end card with a light sweep along the device and the lockup.
- **Match cuts:** the ring to the camera plateau lens, the chart line morphing into the wordmark underline, the app icon zoom-through.
- **Score:** follow rule 8; consider a Verso-like 100 BPM warm major-key piano score with UI foley.
- **Captures:** recapture the app after the UI waves land, from the seeded demo profile only.
