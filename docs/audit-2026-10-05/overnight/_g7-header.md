# G7: adversarial review of today's FitTrack changes

Review only. Write exactly one file: `docs/audit-2026-10-05/overnight/gemini-wave2-review.md`. Edit nothing else.

Below is the full `fittrack.html` diff of today's wave (a single-file vanilla JS PWA, classic scripts, inline onclick handlers, kg in storage, network-first service worker). Find REAL defects only: logic bugs, regressions in existing behaviour, state that can go stale, history or focus bugs, accessibility breaks, layout-property animation, places that ignore reduced motion, unit-conversion mistakes (storage must stay kg), memory leaks (listeners or observers never removed), anything that could break offline. For each: severity (high, medium, low), the exact diff lines quoted, what goes wrong and the concrete steps to trigger it, and the minimal fix. If you are not sure a defect is real, label it "suspect" and say what would confirm it. Do not report style preferences. Do not invent code that is not in the diff. End with `Final report` listing the high-severity items.

---
