# GitHub audit, 2026-10-05

Repository: https://github.com/addyrallxx/fittrack. Read-only audit of GitHub and the tracked checkout at `657619d4e84afbd3fcd1a4ebffab9dc357778b0a`. The only authorized write is this report. No settings, refs, code, index, secrets, or GitHub resources were changed. Commands below are proposed fixes, not executed. Commands use PowerShell; define `$gh = 'C:/Program Files/GitHub CLI/gh.exe'` first.

## High priority

### H1. Public tracked material discloses the owner's personal information

This is a disclosure inventory, not a judgment about the app's personal design. A stranger can learn:

- `NEXT-SESSION.md:194-235`: exact birthday, age, height, dated weight, estimated body composition, fitness goals, gym and city, neighborhood, dietary preferences, delivery habits, self-assessment, calorie and macro targets, medication start date and confirmed dose history. Later sections contain operational history and local paths.
- `data/orders-parsed.json`: restaurants, ordered items, quantities, order dates and times, prices, delivery providers, screenshot filenames, and transcription prompts with local paths. Representative evidence at lines 239-321, 751-855 and 1013 onward.
- `data/foods.json`: 53 entries tagged `featured`, personal purchase references in `src`, and notes tying foods to the owner's medication and targets. Examples at lines 19-84 and 143.
- `docs/research/2026-08-26-rebuild-research.json` and `docs/research/2026-08-26-agent-journal.jsonl`: owner-focused medication, location, nutrition and gym research plus agent execution records.
- `AGENTS.md`, `CLAUDE.md`, `GOAL.md`, audit briefs/logs and overnight scripts: Windows username and local workspace/vault paths, device priorities, tools and working practices.
- `worker/wrangler.toml`: a personal contact email in `VAPID_SUBJECT`. It is a contact identifier, not a secret. The public worker hostname and KV namespace identifier also identify infrastructure.
- Beyond tracked file contents, public commit metadata exposes an author email and institutional affiliation. Changing a future email does not remove existing commit metadata.

Exact remediation text: "Keep health profiles, dose history, delivery-order transcriptions and raw agent journals in a private local record. Remove their owner-specific contents from public handoffs and research. Replace `featured` with a neutral ranking tag where needed, and rewrite food notes and source descriptions to describe the food rather than the owner. Preserve nutrition figures, provenance, user-entered dose support and the app's personal design. Keep public documentation limited to implementation and verification facts. Existing Git history still contains earlier copies."

If retaining those three raw records locally after a later authorized cleanup:

```powershell
git rm --cached -- data/orders-parsed.json docs/research/2026-08-26-agent-journal.jsonl docs/research/2026-08-26-rebuild-research.json
```

Add those exact three paths to `.gitignore`. This command does not sanitize other files or history. Do not rewrite shared history as an automatic audit fix. For future commit metadata, set a verified GitHub noreply address using `git config user.email '<verified GitHub noreply address>'`. Use an owner-approved role contact for VAPID if available; do not invent an address or write any secret store.

### H2. Published release and live Pages version do not match

GitHub `main` and tag `v1.2.0` both point to `657619d`. The sole release is FitTrack 1.2.0, published at `2026-10-05T19:45:34Z`, with no attached assets. Actual GET requests returned HTTP 200 but `APP_VERSION` in both live `fittrack.html` and `sw.js`, and the live `VERSION` file, still say `1.1.0`. Repeated cache-busting GETs with `Cache-Control: no-cache` confirmed all three.

The newest Pages deployment is for earlier commit `01f05b3`, with deployment status `success` at `19:37:46Z`. Its associated Actions run still reports `queued`, with no conclusion. The build API says `built`. These APIs disagree, and neither proves the current release commit is deployed. The live metadata check is the decisive evidence here. This does not establish that all 1.2.0 features are absent: the older deployed commit may include feature changes preceding the release metadata commits.

Exact fix text: "Open Settings > Pages and retain main / root with HTTPS enforced. Open Actions > pages build and deployment and inspect the queued run and whether a build for `657619d` exists. Once the queue is resolved, request a Pages build of current main, then verify the served HTML, service worker and VERSION all say 1.2.0. Do not change the service worker's network-first policy."

Proposed explicit rebuild, after resolving any running deployment:

```powershell
& $gh api --method POST repos/addyrallxx/fittrack/pages/builds
```

Read-only follow-up: `& $gh api repos/addyrallxx/fittrack/pages/builds/latest`. Recheck the three public files with a cache-busting URL. Do not call this completed merely because a build returns success.

## Medium priority

### M1. Main has no branch protection or rulesets, and no test workflow

GitHub lists only remote branch `main`, `protected: false`. Protection returns 404 "Branch not protected"; rulesets return `[]`. The only workflow is GitHub's generated `dynamic/pages/pages-build-deployment`. There is no tracked `.github/workflows` test workflow. Manual local guards therefore have no server-side counterpart. This is relevant to the documented black-screen incident, without requiring a framework or build step.

Exact future workflow text for `.github/workflows/checks.yml`:

```yaml
name: Checks
on: [push, pull_request, workflow_dispatch]
permissions:
  contents: read
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: node test/syntax-check.mjs
      - run: node test/progress.test.mjs
      - run: node test/push.test.mjs
      - run: node test/schedule.test.mjs
      - run: node test/serve.test.mjs
```

Run and confirm this workflow first. Exact settings text: "Settings > Rules > Rulesets > New branch ruleset. Name: main safeguards. Target: default branch. Enforcement: Active. Block force pushes and restrict deletions. Require status checks to pass: checks. Keep paid features off." This allows the existing direct-push workflow when checks pass and avoids adding a mandatory multi-person review flow. Chrome-dependent feel checks need a separately validated runner configuration; do not assume the laptop harness works on Linux.

### M2. Dependabot is disabled

Repository metadata reports `dependabot_security_updates.status: disabled`. The vulnerability-alert endpoint returns 404 explicitly saying alerts are disabled; the Dependabot alerts endpoint returns 403 explicitly saying they are disabled. It also reports a missing `admin:repo_hook` scope. This audit did not change authentication scopes. There is no `.github/dependabot.yml`.

Exact fix text: "Settings > Advanced Security (or Code security) > Dependabot. Enable Dependabot alerts and Dependabot security updates on the free public repository." Proposed alerts command, with appropriately authorized credentials:

```powershell
& $gh api --method PUT repos/addyrallxx/fittrack/vulnerability-alerts
```

`worker/package.json` declares no dependencies or devDependencies and has no tracked lockfile. Chart.js is loaded from a CDN, so npm Dependabot does not cover it. Do not add a bundler or npm dependencies to make Dependabot look busy. When the checks workflow exists, use this exact configuration for action updates:

```yaml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: monthly
```

### M3. Missing historical tags break three CHANGELOG links

Only `v1.2.0` exists remotely. HTTP checks and authenticated compare API checks confirm:

| CHANGELOG reference | Result |
|---|---|
| `v1.2.0...HEAD` | HTTP 200, API identical, ahead 0 / behind 0 |
| `v1.1.0...v1.2.0` | HTTP 404 |
| `v1.0.0...v1.1.0` | HTTP 404 |
| `/releases/tag/v1.0.0` | HTTP 404 |

History identifies `22ecc1513882d482bff06e00a72adca594f154c4` as the explicit August 29 v1.0.0 feature commit. `f7bd2ccfcad5aa336ce7906d9e2678b95434db45` is the immediately following favicon fix, not the explicit version commit. Use the explicit baseline for an unambiguous retrospective tag.

For 1.1.0, `ba88f6024a1987f2c7b86a74490f4b99b6ca88a7` introduced the versioned features; `ae3b0aa9ce25f99b5913d15e9ac9361849efcffe` completed the release changelog after the September 1 README/screenshots cleanup. The handoff calls `a00ec79` through `ae3b0aa` the shipped five-commit range. Tag `ae3b0aa` to include that full release. Both selected commits were confirmed accessible through GitHub's commit API.

Exact local tag commands, for later execution only:

```powershell
git tag -a v1.0.0 22ecc1513882d482bff06e00a72adca594f154c4 -m "FitTrack 1.0.0"
git tag -a v1.1.0 ae3b0aa9ce25f99b5913d15e9ac9361849efcffe -m "FitTrack 1.1.0"
```

Adnan handles publishing. Local tags alone do not repair public compare links. Change the `[1.0.0]` reference text to `https://github.com/addyrallxx/fittrack/tree/v1.0.0`, so it resolves after tag publication without requiring a new GitHub Release. Leave the two compare references as written and recheck after publication. No push or release creation was performed or requested here.

### M4. README has narrow factual inaccuracies

Preserve its showcase and voice. Do not rewrite the description or README structure. Apply only these exact corrections in a later authorized edit:

| Current claim | Evidence and exact correction text |
|---|---|
| "Your data stays on your device" and "localStorage and nowhere else" | `fittrack.html:3311-3320` sends subscription, timezone, preferences, water goal, gym target and optional medication name plus dose/date steps; `3351-3360` sends daily reminder state. Use: "Your tracking history stays on your device. If you enable reminders, the server receives the subscription, timezone, reminder preferences, water and gym targets, optional medication schedule, and the daily state needed to decide whether to remind you." |
| Server stores "only" the subscription, timezone, preferences and four daily numbers | Omits water/gym targets and the medication schedule stored in `cfg` by `worker/src/index.js:402`. Add: "It also stores your water goal, weekly gym target and, when supplied, medication name and confirmed dose/date schedule." Preserve the accurate statement that it does not receive food logs or weight history. |
| "No dependencies" and "That is the entire supply chain" | Chart.js 4.4.0 is a runtime CDN dependency (`fittrack.html:86`), and deployment uses Wrangler. Use: "No build step or installed runtime packages. Charts use Chart.js from a CDN, food search uses Open Food Facts, and worker deployment uses Wrangler." |
| "Full offline support" | `sw.js` precaches only HTML, manifest and two icons. Data files are cached only after successful fetches; CDN Chart.js and external food search pass through the service worker untouched. Use: "Local logging works offline after an online load. Food and program files need to have been loaded and cached first; external food search needs a connection, and charts depend on Chart.js being available." |
| Five test entry points | There is now `test/feel.test.mjs` in addition to the five listed suites. Use: "Five core entry points, plus a Chrome-based feel gate." Add `node test/feel.test.mjs` with a note about its real-Chrome/server requirements. The listed 28 + 18 + 25 = 71 count remains valid for those three suites; this audit did not rerun them. |
| `file://` "disables storage" | Overstates browser behavior. `file:` storage is browser-dependent and does not provide the app's supported HTTP/service-worker origin. Use: "Use HTTP on localhost or HTTPS when hosted. Opening file:// is unsupported and does not provide the service worker's install and offline behavior." |
| Screens and GIF illustrate the current app | Last asset update is September 1 commit `6a6fa3a`; inspected `home.png` shows the old rings plus duplicate metrics and no floor-first hierarchy. They predate the October navigation, rest-bar, floor-first and weekly-card changes. Exact fix: regenerate seeded demo assets with `node tools/capture-media.mjs docs --write-manifest`, then inspect all six screenshots and the GIF against current main. Do not use the real owner's profile. |

Install steps match the current Android install flow and iOS standalone push requirement. "Enable notifications" exists in the app's notification sheet. The live app link and GitHub repo link returned HTTP 200. The clone URL targets the same verified repo; the named local files and README heading anchors exist. No broken README showcase links were identified. Device installation was not exercised in this audit. Features such as three sessions, 1,502 foods, dose editing, local export and closed-app server push are supported by current source. Counts were checked against `data/foods.json.entries.length`, not inferred from the README.

## Low priority and verified settings

### L1. Repository metadata and feature switches

| Setting | Verified state | Exact action |
|---|---|---|
| Visibility | Public | Keep public; address H1 separately. |
| Description | Empty/null | Record only. Description work is explicitly deferred. |
| Topics | Empty | Proposed command: `& $gh repo edit addyrallxx/fittrack --add-topic pwa --add-topic fitness --add-topic vanilla-javascript --add-topic offline-first` |
| Homepage | Empty/null | Proposed command: `& $gh repo edit addyrallxx/fittrack --homepage 'https://addyrallxx.github.io/fittrack/fittrack.html'` |
| Default branch | main | Keep. |
| Pages | Legacy branch deployment, main, `/`, no custom domain, HTTPS enforced | Keep. H2 covers deployment verification. |
| Issues | Enabled, zero issues across all states | Keep as the bug intake. |
| Wiki | Enabled; wiki Git endpoint returned repository not found | No accessible initialized wiki found. Disable unused switch: `& $gh repo edit addyrallxx/fittrack --enable-wiki=false` |
| Projects | Enabled | Usage could not be verified: Projects V2 query requires `read:project`, absent from the authenticated token. No auth change made. Exact check text: "Open the repository Projects tab and record existing linked boards before deciding whether to disable Projects." |
| Discussions | Disabled, zero discussions | Keep. |
| Pull requests | Zero across all states | No evidence of a PR-based workflow. |
| Merge methods | Merge commit, squash and rebase all enabled; auto-merge disabled; automatic branch deletion disabled | Preserve merge methods to avoid changing the existing workflow. Enable cleanup for future merged PRs: `& $gh repo edit addyrallxx/fittrack --delete-branch-on-merge` |

### L2. Secret scanning and worker configuration passed the current-tree check

Secret scanning and secret-scanning push protection are enabled. The alert endpoint returned `[]`. Non-provider patterns and validity checks are disabled. Exact optional settings text: "Keep Secret scanning and Push protection enabled. Enable non-provider patterns and validity checks only if available free for this public repository."

A Node pattern scan enumerated all 122 tracked paths using `git ls-files`, read non-NUL text files without printing matching values, and checked GitHub token prefixes, AWS access-key IDs, Google API keys, common API/Slack token prefixes, PEM private-key headers, credential-bearing URLs, and quoted password/secret/token/API-key/private-key assignments. A second scan allowed quoted JSON property names. Both returned zero matches. This is a pattern-based current-tree check, not a full historical scan, entropy detector, or proof that arbitrary secrets cannot exist. Binary screenshots and GIFs were not OCR-scanned. No private untracked secret file was opened.

`worker/wrangler.toml` contains a public VAPID key, contact subject, KV binding identifier, a 30-minute cron, `workers_dev=true`, `preview_urls=false`, and no committed private key. `VAPID_PRIVATE_KEY` is referenced from `env`, not assigned a literal secret. `git check-ignore worker/.dev.vars` confirms the private local file path is ignored. A public VAPID key and namespace identifier are not credentials. No secret rotation is indicated by this scan. Exact action: keep the private key outside Git and preserve the ignore rule; do not write a secret store during this audit.

### L3. Tracked scratch and ignore gaps

No tracked `node_modules`, `.wrangler`, `.dev.vars`, delivery screenshot binaries, conventional `.log` files or build directories were found. However raw research JSONL, order-transcription output, overnight runner scripts/headers, and many `.log.md` execution summaries are tracked. Some are useful project history, so do not mass-delete audit material. H1 addresses personal records.

Exact cleanup text: "Move raw local execution/transcription artifacts to a private archive. Keep concise reviewed decision and verification reports tracked. Review `docs/audit-2026-10-05/overnight/overnight.sh`, `_g7-header.md`, `_lane-a-header.md` and `_lane-b-header.md` before untracking them. Do not touch concurrent overnight work or worktrees."

Root `.gitignore` does not ignore root `.env`, worker `.env`, root `node_modules`, `.DS_Store` or generic scratch files. `worker/.gitignore` covers worker `node_modules`, `.wrangler` and `.dev.vars`. Add this exact root text in a later small hygiene change:

```gitignore
# Local credentials and tooling
.env
.env.*
!.env.example
.dev.vars
node_modules/
.DS_Store
Thumbs.db

# Private research inputs and raw output
data/orders-parsed.json
docs/research/2026-08-26-agent-journal.jsonl
docs/research/2026-08-26-rebuild-research.json
```

Adding an ignore rule does not untrack existing records. Do not ignore all `.log.md` files: reviewed logs are part of this project's evidence record.

### L4. Large files are reasonable; local branches need careful review

Largest tracked blobs: tour GIF 1,030,139 bytes, food data 742,235 bytes, app HTML 249,808 bytes, largest screenshot 203,195 bytes. None approaches GitHub's file-size warning/limit thresholds. No LFS migration or image compression is warranted by these sizes. The two identical Home PNG blobs are intentional dark/default copies, not a meaningful storage problem.

Remote branch API lists only main. There are no stale remote branches. Local wave branches remain, many attached to active worktrees. Cherry-picked branches are not necessarily ancestors of main, so `--merged` alone is insufficient. `wave2/p2` is an unattached branch confirmed merged into main. Exact optional cleanup command: `git branch -d wave2/p2`. For the others, first use `git worktree list` and `git cherry main <branch>` to inspect attachment and patch equivalence. Do not force-delete or remove active branches/worktrees during concurrent overnight work.

### L5. Workflow and Pages timing record

Only the generated Pages workflow is active. Latest eight runs: one queued/inconclusive run (`37363409540`), followed by seven completed successful runs. No completed failure appeared in that sample. Build durations below come from the Pages build API in milliseconds, not the duration of the entire workflow:

| Commit | Build created, UTC | Build updated, UTC | Duration | Build state |
|---|---|---|---|---|
| 01f05b3 | Oct 5 19:26:33 | 19:37:39 | 666.814 s | built |
| 44f35f6 | Oct 5 09:50:01 | 09:50:35 | 34.945 s | built |
| 233888f | Oct 5 09:31:11 | 09:31:54 | 43.650 s | built |
| 9d1d71e | Oct 5 09:01:07 | 09:02:11 | 64.465 s | built |
| c9357ee | Oct 5 08:48:46 | 08:49:22 | 36.373 s | built |

The latest deployment status is success, but its Actions run remains queued and live version files remain 1.1.0. Exact follow-up commands:

```powershell
& $gh run view 37363409540 --repo addyrallxx/fittrack
& $gh api repos/addyrallxx/fittrack/deployments/6868145812/statuses
& $gh api repos/addyrallxx/fittrack/pages/builds/latest
```

No test suites, hardware acceptance, push delivery, runtime security audit or Cloudflare account inspection were performed. Current GitHub settings, tracked patterns, source claims, release history, link status and actual served version metadata were checked directly. Tracked-file status remained clean before the report write; pre-existing untracked overnight files were left alone.

Final report
