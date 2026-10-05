# C2: set up the shared Remotion motion studio

You are working in `C:/Users/adnan/projects/motion-studio` (create it). This is a new local repo, separate from FitTrack. You own everything inside it, plus your log `C:/Users/adnan/projects/fittrack/docs/audit-2026-10-05/logs/C2.log.md`. Touch nothing in `C:/Users/adnan/projects/fittrack` except that log.

## Why
Adnan wants Remotion (https://github.com/remotion-dev/remotion) as the motion graphics tool for all future reels, next to HyperFrames (already installed as skills) and the `brag` skill. Remotion's free license covers him: individuals and companies of up to 3 people may use it free, including commercially (verified in LICENSE.md today). The first project in it will be a FitTrack showcase reel, built by a later run. Your job is the clean, working base, nothing speculative.

## Do
1. Check what exists first: `npm ls -g --depth=0`, `ls C:/Users/adnan/.claude/skills | grep -i remotion`. Report it.
2. Create the project with Remotion 4.x latest, TypeScript, React. Prefer the official scaffolder non-interactively (`npx create-video@latest` with the blank template; find the right flags with `--help`). If it insists on prompts, set it up by hand: `remotion`, `@remotion/cli`, `react`, `react-dom`, `typescript`, plus `@remotion/google-fonts`, `@remotion/transitions`, `@remotion/motion-blur`, `@remotion/noise`, `@remotion/shapes`, `@remotion/paths`, `@remotion/media-utils`. Every `@remotion/*` package pinned to the SAME exact version as `remotion` (mismatched versions are Remotion's most common breakage).
3. Layout: `src/index.ts`, `src/Root.tsx`, one composition per project under `src/projects/<name>/`. Add only one composition now: `src/projects/smoke/Smoke.tsx`, 2 seconds, 1080 x 1080, 60 fps, a spring-animated circle and a line of text loaded with `@remotion/google-fonts`. It proves fonts, springs and rendering work.
4. Install Remotion's official agent skills for Claude Code from `remotion-dev/skills`. On this machine the pattern is `npx skills@latest add <owner/repo> -g -a claude-code --copy -s <name> -y`, one `-s` per skill name. List available names first with the add command's list option, redirecting output to a file and reading the file. NEVER pipe `npx skills` output into `head` or similar (SIGPIPE kills the install silently). Confirm the skill directory exists under `C:/Users/adnan/.claude/skills/` afterwards.
5. Verify: `npx remotion compositions` lists Smoke; render it with `npx remotion render Smoke out/smoke.mp4 --concurrency=2` (Adnan is gaming; a guard keeps node and headless Chrome at Idle priority, keep concurrency at 2); confirm with `ffprobe` that it is 120 frames, 60 fps, 1080 x 1080, H.264. Also confirm `npx remotion studio` starts (start it, check the port answers, stop it).
6. Add `.gitignore` (`node_modules`, `out`), a short `README.md` (what this is, the studio and render commands, "keep every @remotion package on the same exact version", "render with --concurrency=2 while the laptop is in use", the license note above), then `git init` and make ONE local commit. No remote, no push.

## Acceptance
- `out/smoke.mp4`: 120 frames, 60 fps, 1080 x 1080, H.264 (paste the ffprobe line).
- `npm ls | grep remotion` shows one version for every @remotion package.
- The Remotion skill directory path, and its SKILL.md `name:` line.
- Log ends with `Final report`. No em dashes in anything you write.
