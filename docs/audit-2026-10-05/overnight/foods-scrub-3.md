# Scrub phase 3: fix the tag collision

Same worktree (`C:/Users/adnan/projects/ft-wt/foods`) and log (`logs/foods-scrub.log.md` in that worktree), append "Phase 3". Claude's review found that `staple` already existed on 60 entries as a nutritional tag before phase 2, so renaming `featured` to `staple` merged two meanings and forced the hardcoded `genericStaples` exclusion list in `fittrack.html`.

- Restore the original 60 nutritional `staple` tags exactly as on `main`. The 53 entries that had `featured` get `featured` instead (and `featured-variant` becomes `featured-variant`, if you kept it). Compare against `git show main:data/foods.json` by id to get this exactly right.
- In `fittrack.html` the search tie-breaker reads `featured`; delete the `genericStaples` list. Update the tools, the hashes and `test/progress.test.mjs` to match.
- Gates: `node tools/check-foods.mjs`, `node test/syntax-check.mjs`, `node test/progress.test.mjs`, `node test/push.test.mjs`, `node test/schedule.test.mjs`. Paste the counts of `staple`, `featured` and any remaining personal pattern.
- Update `logs/history-replace.txt` so the history rewrite maps `featured` to `featured` (not `staple`).

Rules: never run git stash, checkout, restore, reset, clean, commit or push. No em dashes. End with `Final report`.
