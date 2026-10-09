#!/usr/bin/env bash
# Day 2 Gemini lane on gem v2 (gem2.ps1, now gem.ps1). Weekly Gemini quota resets 23:10 MDT tonight: spend it.
OV=/c/Users/adnan/projects/fittrack/docs/audit-2026-10-05/overnight; LOG=$OV/day2.log
say(){ echo "$(date '+%m-%d %H:%M') $*" >> "$LOG"; }
g(){ # name task brief [extra args]
  local name=$1 task=$2 brief=$3; shift 3
  powershell.exe -NoProfile -File 'C:\Users\adnan\.claude\tools\gem.ps1' -BriefFile "$(cygpath -w "$brief")" -WorkDir 'C:\Users\adnan\projects\fittrack' -Task "$task" -TimeoutMinutes 40 "$@" > "$OV/logs/$name.gem2.txt" 2>&1
  local rc=$?; say "gem2 $name rc=$rc $(grep -h '^exit=\|^usage:\|^deliverable:\|^quota debit:' "$OV/logs/$name.gem2.txt" | tr '\n' ' ' | cut -c1-300)"
  return $rc
}
say "gem-lane2 start"
g G5b research "$OV/G5b-specs-verify.md" -Deliverable 'C:\Users\adnan\projects\fittrack\docs\audit-2026-10-05\overnight\iphone-18-pro-max-specs.md'
g G7c review "$OV/G7c-wave2-review.md"
for b in 1 2 3 4 5 6; do
  g "food-d2-$b" sourcing "$OV/food-d2-$b.md" -Deliverable "C:\Users\adnan\projects\fittrack\docs\audit-2026-10-05\overnight\food-d2-$b.json"
  [ $? -eq 4 ] && { say "gem-lane2: quota floor, stopping"; break; }
done
say "gem-lane2 done"
