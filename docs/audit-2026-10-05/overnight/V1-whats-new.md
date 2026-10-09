# V1: versions and "What's new" inside the app

Worktree `C:/Users/adnan/projects/ft-wt/v1` (branch `feat/whats-new`, from main at 1.2.0). Log: `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/overnight/logs/V1.log.md`. You own the Settings version row, a new What's new sheet and its update notice, a `RELEASE_NOTES` constant, and one test case in `test/push.test.mjs` beside the existing version-drift test.

Read `GOAL.md`, then in `fittrack.html` the sheet system (`modalPresent`, `modalDismiss`, native `<dialog>` sheets with drag-to-dismiss), `toast`, the motion tokens and the Settings render. Reuse them; add nothing parallel.

- `RELEASE_NOTES`: an array, newest first, of `{version, date, title, notes:[...]}`; 3 to 6 short bullets each. Seed 1.2.0 from `docs/audit-2026-10-05/overnight/notes-1.2.0.md` (shorten bullets for a phone) and 1.1.0 from `CHANGELOG.md`.
- Settings: the existing version line becomes a 48 px row "Version 1.2.0" with "What's new" that opens a sheet listing the notes of the current version, older versions collapsed below, and "All updates" linking to https://github.com/addyrallxx/fittrack/releases (new tab).
- After an update: when the stored last-seen version is older than `APP_VERSION` and onboarding is complete, show one calm notice once, "Updated to 1.2.0. See what's new", that opens the sheet; store the new version when shown. Never on a first install, never during onboarding or a workout, never more than once per version.
- Test: `RELEASE_NOTES[0].version === APP_VERSION`, so a release can never ship without notes.
- Gates: syntax, progress, push, schedule, and `PORT=8902 node test/feel.test.mjs` (both viewports, both themes, reduced motion). Verify the sheet and the notice in headless Chrome at 384 x 832.

Rules: never run git stash, checkout, restore, reset, clean, commit or push. No em dashes in code or copy. End with `Final report`.
