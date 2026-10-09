# GH1: audit the GitHub repo (read-only)

Repo `addyrallxx/fittrack`, local checkout `C:/Users/adnan/projects/fittrack`. gh is at `C:/Program Files/GitHub CLI/gh.exe` (authenticated). Change nothing on GitHub or in the repo. Write `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/overnight/github-audit.md`.

Inspect and report, prioritized (high, medium, low), each with the exact fix command or text:
- Settings: visibility, description, topics, homepage, default branch, branch protection, Pages source and HTTPS, features in use (issues, wiki, projects, discussions), merge settings.
- Security: secret scanning and Dependabot status, any token, key or credential pattern in the current tree (run a pattern scan), the Cloudflare worker config (no secrets committed), what a stranger can learn about the owner from tracked files (list, do not judge the app's own single-user design).
- Hygiene: tracked junk, large files, `.gitignore` gaps, stale branches, workflows and their last runs, Pages deploy times.
- Releases and tags: only v1.2.0 exists; find the commits for 1.0.0 and 1.1.0 from CHANGELOG and history and give the `git tag -a` commands; check CHANGELOG compare links resolve.
- README: list inaccuracies against the current app (features, install steps, screenshots, links). Do NOT propose a rewrite of the README showcase or the description; Adnan wants that later.

Rules: read-only. Never run git stash, checkout, restore, reset, clean, commit or push, and no gh command that changes anything. No em dashes. End with `Final report`.
