# Scrub personal notes from the public food database

Worktree `C:/Users/adnan/projects/ft-wt/foods` (branch `chore/scrub-foods`). Log: `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/overnight/logs/foods-scrub.log.md`. You own `data/foods.json` only.

`data/foods.json` ships publicly (GitHub Pages and a public repo). Some entries carry notes or tags about the app's owner: tags like `featured`, notes about his medication or GLP-1 use, his DoorDash or restaurant orders, his habits, his name. Remove the personal content and keep everything that describes the food: name, brand, serving, grams, macros, sources, confidence, neutral facts (for example "Canadian menu" is fine).

1. First grep `fittrack.html` and `tools/` for every foods field and tag the app reads (tags, notes, flags). If a personal tag drives behaviour (a favourites row, a sort), replace it with a neutral tag that keeps the behaviour and log it. Never break a feature.
2. Scrub. When a note mixes neutral fact and personal detail, keep the fact and drop the detail; drop the field if nothing neutral remains.
3. `node tools/check-foods.mjs` and `node test/syntax-check.mjs` must pass.
4. Log: counts (entries touched, notes removed, notes trimmed, tags renamed) and every change as `id: before -> after`. Also list anything personal you notice in `fittrack.html` or other shipped files, without changing it.

Rules: never run git stash, checkout, restore, reset, clean, commit or push. No em dashes. End the log with `Final report`.
