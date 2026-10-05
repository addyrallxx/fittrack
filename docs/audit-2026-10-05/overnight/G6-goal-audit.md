# G6: audit FitTrack against its goal, and load the next upgrades

Research and critique only. Write exactly one file: `docs/audit-2026-10-05/overnight/gemini-goal-audit.md`. Edit nothing else; never download files into the project.

Adnan wants FitTrack (a free, offline, single-file PWA for workouts, nutrition, weight and GLP-1 dose tracking) to have "the best smoothness, functionality, UI feel, UX like apple apps", mobile first (Samsung S26 Ultra Chrome, then iPhone Safari). Read, in this order and only these: `GOAL.md` (including its Progress table), the section "Session 2026-10-05" near the top of `NEXT-SESSION.md`, `docs/audit-2026-10-05/competitor-review.md` (only the "Ranked Top 15 Adoptions" section, find it with Select-String), `docs/audit-2026-10-05/design-critique.md` (only section 8), and the screenshots in `C:/Users/adnan/projects/motion-studio/public/fittrack/captures/` (taken today from the demo profile; some predate the latest merges, so say when something may already be fixed). Do not read `fittrack.html` whole; if you must check code, pull single lines with Select-String.

Write:
1. **Goal progress:** for each GOAL criterion, agree or disagree with its status and why (evidence only).
2. **Next 15 upgrades,** ranked by visible improvement per unit of effort, each with: what, where (screen), why (cite a competitor pattern, a critique defect or a GOAL gap), effort S/M/L. Respect the "no" rulings (no streaks, badges, points, social, opaque scores, AI coach, photo meal estimator, dose maths, fasting programs).
3. **12 micro-polish items** visible in the captures: copy, spacing, alignment, hierarchy, colour, with exact proposed values.
4. **5 delight ideas** that fit the rulings (for example a better first-run, a richer finish-workout moment, a weekly reflection), each with how it would feel.
5. **Risks:** anything in today's changes that could feel worse on a real phone than in emulation.
Every claim needs evidence you can point to; never invent a person, a name, a number or a feature. Use at most two web searches, only to confirm a competitor detail. End with `Final report`.
