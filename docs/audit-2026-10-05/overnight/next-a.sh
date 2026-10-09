#!/usr/bin/env bash
# Day 2, lane A follow-on: once the overnight driver logs "lane A done", run P5 stacked on P9.
source <(sed -n '1,59p' "$(dirname "$0")/overnight.sh")
LOG=$OV/day2.log
until grep -q "lane A done" "$OV/driver.log"; do
  grep -q "lane A stops here\|codex P9 GAVE UP\|codex P7 GAVE UP" "$OV/driver.log" && { say "next-a: lane A did not finish, P5 not started"; exit 1; }
  sleep 300
done
say "next-a: P5 start"
git -C "$FT" worktree add -q "$WT/p5" -b overnight/p5 overnight/p9 >> "$LOG" 2>&1 || { say "worktree p5 failed"; exit 1; }
codex_run P5 "$WT/p5" medium "$OV/_lane-a-header.md" "$OV/P5.md" && commit_pkg "$WT/p5" P5 "$OV/P5.md"
say "next-a: done"
