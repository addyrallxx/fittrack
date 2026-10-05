# F1b: verify and finish F1 (the gym flow)

Worktree `C:/Users/adnan/projects/ft-wt/f1` (branch `wave2/f1`). A previous run implemented F1 there and hit its usage limit before verifying. Do NOT start over. Read its log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/F1.log.md` (Part 1 says what was built), the brief `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/briefs/F1-workout-flow.md` (the acceptance list), and `docs/audit-2026-10-05/RULES.md`. Inspect the current work with `git -C C:/Users/adnan/projects/ft-wt/f1 diff`.

Your job, in order, appending to the same F1 log under "Part 2: verification":
1. Run every acceptance check in the F1 brief in headless Chrome at 384 x 832 then 393 x 852 (one instance, free CDP port, close it after). Fix only what fails, inside the Workout code F1 owns.
2. Run `node test/syntax-check.mjs`, the five suites (serve on a free port with in-memory port substitution; port 8899 belongs to another process, never kill it) and the feel gate `node test/feel.test.mjs` (it reuses the server on 8899). Add no KNOWN entries.
3. End the log with `Final report`. Do not commit. No frame timing.
