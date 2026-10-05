# C3a: FitTrack synthesized score

## Part 1: Contract and implementation

Read RULES.md, timeline.json, and NEXT-SESSION.md Testing. Ownership is limited to the two synthesis scripts, music.wav, and this log. No changes to C3b visuals or captures.

Implemented dependency-free seeded Node synthesis, stereo mixing, timeline-derived sections and cue dispatch, and a WAV writer. The exported placement table includes all scheduled cues and repeated keyboard events. Control cues apply after all audio tails, ensuring true digital silence at frames 1575 through 1590. The finale resolves at the timeline's final hit cue, frame 1680.

The check script verifies PCM format and length, exact cue dispatch and section boundaries, digital silence, final zero sample, no sample clipping, byte equality of two renders and the written WAV, and ffmpeg integrated loudness and true peak.

## Part 2: Master calibration

The first measurement was -19.8 LUFS with -1.7 dBTP. Increased the linked stereo master gain to reach the requested loudness while retaining smooth peak limiting. Calibration uses ffmpeg only for measurement; audio generation and mastering remain pure Node.

## Part 3: Verification and finale polish

The calibrated intermediate score passed at -13.3 LUFS and -1.1 dBTP. Lowered master gain slightly for additional margin and extended the final bell chord's decay so it rings through the closing card. Finale accompaniment follows the bar chord until the resolution cue, then holds A major.

Required FitTrack checks passed on the shared tree: syntax, schedule 25/25, progress 28/28, push 18/18, and serve 6/6. These are separate from the synthesis checks. No browser was launched.

## Part 4: Final artifact checks

Two consecutive invocations of `node scripts/synth-fittrack.mjs` wrote byte-identical WAV files, verified with PowerShell Get-FileHash. `node scripts/synth-fittrack.check.mjs` also compared two independent in-memory renders with the written artifact. Both scripts passed `node --check`.

The file is 5,292,044 bytes: a 44-byte PCM WAV header and 1,323,000 stereo frames at 44,100 Hz, 16 bits per channel. Duration is exactly 30.000 seconds. All 52 dispatched cue instances, including 12 keyboard events (870 through 925, until 930 exclusive), match their independently recomputed frame sample indices exactly. Intentional instrument attack envelopes follow those scheduled onsets. All six music section boundaries match timeline.json. The silence spans samples 1,157,625 through 1,168,649 inclusive, exactly 11,025 zero stereo samples. The last stereo sample is also zero. Sample peak is -1.62 dBFS, with no clipped PCM samples.

Placement data is exported by `renderScore().placements` and printed as JSON by the generation command. No extra placement file is required, keeping writes within the assigned ownership list. No timeline changes are requested.

## Final report

Delivered `scripts/synth-fittrack.mjs`, `scripts/synth-fittrack.check.mjs`, and `public/fittrack/music.wav`. Pure Node synthesis uses a reset xorshift seed, analytic oscillators, shaped filtered noise, and no samples, downloads, or npm dependencies. The check script uses installed ffmpeg for measurement only.

Measured with `ffmpeg -i public/fittrack/music.wav -af ebur128=peak=true -f null -`. Final ffmpeg summary (its true-peak field is labeled dBFS):

```text
Summary:

  Integrated loudness:
    I:         -13.9 LUFS
    Threshold: -23.9 LUFS

  Loudness range:
    LRA:         2.3 LU
    Threshold: -33.7 LUFS
    LRA low:   -15.1 LUFS
    LRA high:  -12.8 LUFS

  True peak:
    Peak:       -1.2 dBFS
```

SHA-256, identical for both consecutive file-generation runs and both check-script renders:

```text
0373d7e2594b8348794ff037a78f1629795d41407a4dd19640d18f9267a6b3f7
```

Simplifications: the pad uses spectrally tapered triangle partials instead of a dynamic low-pass stack. Hit-big reverb is four quiet alternating stereo reflections. Tick-roll keeps the specified two-frame tick interval while intensity rises and settles, rather than changing tick spacing. The finale reprises the opening hook notes in the available interval before frame 1680, then holds the A-major pad and bell tails. Sidechain ducking is an analytic recovery envelope on bass notes coinciding with kicks. No subjective listening review is claimed; acceptance here covers synthesis construction and the numeric measurements above.
