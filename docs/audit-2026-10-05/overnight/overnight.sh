#!/usr/bin/env bash
# Overnight autopilot, 2026-10-05 to 06. Adnan asleep, Claude resting.
# Lane A: FitTrack packages stacked F1 -> F3 -> P7 -> P9, each gated, committed on its own branch, never on main.
# Lane B: reel v2 in motion-studio, R1 -> R3 -> R2 -> R4.
# Lane G: Gemini, one job at a time, budgeted (gem.ps1 turn caps).
# Every partner limit is waited out with partner-wait.sh and the same brief re-run.
set -u
export PATH="/c/Program Files/nodejs:/c/Users/adnan/AppData/Roaming/npm:/c/Program Files/Git/usr/bin:$PATH"
FT=/c/Users/adnan/projects/fittrack
MS=/c/Users/adnan/projects/motion-studio
WT=/c/Users/adnan/projects/ft-wt
OV=$FT/docs/audit-2026-10-05/overnight
TOOLS=/c/Users/adnan/.claude/tools
LOG=$OV/driver.log
say(){ echo "$(date '+%m-%d %H:%M') $*" >> "$LOG"; }

codex_run(){ # name dir effort brief...
  local name=$1 dir=$2 effort=$3 n log; shift 3
  for n in 1 2 3 4 5 6; do
    log="$OV/logs/$name.run$n.log"
    say "codex $name attempt $n start ($effort)"
    cat "$@" | codex exec -m gpt-6.1-sol -c model_reasoning_effort="$effort" --dangerously-bypass-approvals-and-sandbox -C "$dir" > "$log" 2>&1
    if grep -q "hit your usage limit" "$log"; then
      say "codex $name usage limit: $(grep -o 'try again at [^.]*' "$log" | tail -1)"
      bash "$TOOLS/partner-wait.sh" codex "$log" >> "$LOG" 2>&1; continue
    fi
    if grep -qi "at capacity" "$log"; then say "codex $name at capacity, retry in 3 min"; sleep 180; continue; fi
    say "codex $name finished, tokens $(grep -A1 'tokens used' "$log" | tail -1)"; return 0
  done
  say "codex $name GAVE UP"; return 1
}

gate(){ # dir name
  local dir=$1 name=$2 out="$OV/logs/$2.gate.log" i
  for i in $(seq 1 18); do curl -s -o /dev/null --max-time 2 http://127.0.0.1:8899/ || break; sleep 10; done
  if curl -s -o /dev/null --max-time 2 http://127.0.0.1:8899/ && ! curl -s --max-time 5 http://127.0.0.1:8899/fittrack.html | cmp -s - "$dir/fittrack.html"; then
    say "gate $name: port 8899 serves another tree, gate unreliable"; return 3
  fi
  ( cd "$dir" && node test/syntax-check.mjs && node test/progress.test.mjs && node test/push.test.mjs && node test/schedule.test.mjs && node test/feel.test.mjs ) > "$out" 2>&1
  local rc=$?
  say "gate $name rc=$rc $(grep -h 'VERDICT' "$out" | tr '\n' ' ')"
  return $rc
}

commit_pkg(){ # worktree-dir name brief
  local d=$1 name=$2 brief=$3
  if ! gate "$d" "$name"; then
    say "$name gate failed, one fix run"
    printf '# Fix the failing overnight gate for %s\n\nWorktree `%s`. The gate output is in `%s`. Fix only what fails, inside the code your package owns (brief: `%s`). Never add KNOWN entries to the feel gate. Re-run the failing commands until they pass. Append to your package log under "Gate fix". Do not commit.\n' \
      "$name" "$d" "$OV/logs/$name.gate.log" "$brief" > "$OV/logs/$name.fix.md"
    codex_run "$name-fix" "$d" low "$OV/_lane-a-header.md" "$OV/logs/$name.fix.md"
    if ! gate "$d" "$name-refix"; then
      git -C "$d" add -- fittrack.html; git -C "$d" commit -q -m "overnight: $name (GATE FAILED, unreviewed)"
      say "$name committed with a FAILED gate; lane A stops here"; return 1
    fi
  fi
  git -C "$d" add -- fittrack.html; git -C "$d" commit -q -m "overnight: $name (gates PASS, unreviewed)"
  say "$name committed $(git -C "$d" rev-parse --short HEAD) on $(git -C "$d" branch --show-current)"
}

laneA(){
  say "lane A start"
  codex_run F1b "$WT/f1" low "$OV/_lane-a-header.md" "$FT/docs/audit-2026-10-05/briefs/F1b-verify.md" || return
  commit_pkg "$WT/f1" F1 "$FT/docs/audit-2026-10-05/briefs/F1-workout-flow.md" || return
  local prev=wave2/f1 pkg lc
  for pkg in F3 P7 P9; do
    lc=$(echo "$pkg" | tr 'A-Z' 'a-z')
    git -C "$FT" worktree add -q "$WT/$lc" -b "overnight/$lc" "$prev" >> "$LOG" 2>&1 || { say "worktree $lc failed"; return; }
    codex_run "$pkg" "$WT/$lc" medium "$OV/_lane-a-header.md" "$OV/$pkg.md" || return
    commit_pkg "$WT/$lc" "$pkg" "$OV/$pkg.md" || return
    prev="overnight/$lc"
  done
  say "lane A done"
}

msc(){ git -C "$MS" add -A >/dev/null 2>&1; git -C "$MS" commit -q -m "overnight: $1 (unreviewed)" && say "motion-studio committed: $1"; }
laneB(){
  say "lane B start"
  codex_run R1 "$MS" medium "$OV/_lane-b-header.md" "$OV/R1.md" && msc "R1 3D iPhone 18 Pro Max and studio rig"
  codex_run R3 "$MS" medium "$OV/_lane-b-header.md" "$OV/R3.md" && msc "R3 reel v2 visuals and timeline"
  codex_run R2 "$MS" medium "$OV/_lane-b-header.md" "$OV/R2.md" && msc "R2 reel v2 score"
  codex_run R4 "$MS" low "$OV/_lane-b-header.md" "$OV/R4.md" && msc "R4 reel v2 render"
  say "lane B done"
}

gem(){ # name model turns brief
  local name=$1 model=$2 turns=$3 brief=$4 n out rc
  for n in $(seq 1 12); do
    out="$OV/logs/$name.gem$n.txt"
    powershell.exe -NoProfile -File 'C:\Users\adnan\.claude\tools\gem.ps1' -BriefFile "$(cygpath -w "$brief")" -WorkDir 'C:\Users\adnan\projects\fittrack' -Model "$model" -MaxTurns "$turns" -TimeoutMinutes 45 > "$out" 2>&1
    rc=$?
    say "gemini $name attempt $n rc=$rc $(grep -h '^usage:\|^exit=' "$out" | tr '\n' ' ' | cut -c1-240)"
    say "fittrack strays after $name: $(git -C "$FT" status --short | grep '^??' | grep -v 'docs/audit-2026-10-05' | tr '\n' ' ')"
    if [ "$rc" -eq 4 ] || grep -q "QUOTA EXHAUSTED" "$out"; then bash "$TOOLS/partner-wait.sh" gemini >> "$LOG" 2>&1; continue; fi
    return 0
  done
}

food_brief(){ # batch number
  local b=$1 ftw ovw; ftw=$(cygpath -m "$FT"); ovw=$(cygpath -m "$OV")
  node -e "
const fs=require('fs');const b=$b;
const done=JSON.parse(fs.readFileSync('$ftw/docs/audit-2026-10-05/food-sourcing-batch1.json','utf8'));
const foods=JSON.parse(fs.readFileSync('$ftw/data/foods.json','utf8')).entries;const byId=new Map(foods.map(f=>[f.id,f]));
const todo=done.filter(x=>x.status!=='sourced').map(x=>byId.get(x.id)).filter(Boolean).sort((a,c)=>(a.brand||'').localeCompare(c.brand||''));
const slice=todo.slice((b-1)*40,b*40).map(x=>JSON.stringify({id:x.id,name:x.name,brand:x.brand,serving:x.serving,grams:x.grams,cal:x.cal,protein:x.protein,carbs:x.carbs,fat:x.fat}));
const brief='# G3b-'+b+': source published nutrition for 40 estimated foods\n\nResearch only. Write exactly one file: docs/audit-2026-10-05/overnight/food-batch-'+b+'.json (rewrite the whole valid array after each brand). Edit nothing else and NEVER download files into the project (read pages with read_url_content only).\n\nFor each entry below (grouped by brand), find the published nutrition for that exact item and serving: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. Scale to our grams if the serving differs. If not found, status unresolved; never guess.\n\nOutput objects: {\"id\",\"status\":\"sourced\"|\"unresolved\",\"cal\",\"protein\",\"carbs\",\"fat\",\"grams\",\"conf\":\"published\"|\"derived\",\"src\",\"url\",\"scaled\",\"checked\":\"2026-10-06\"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src. One search can cover a whole brand. End with a Final report line in a separate file docs/audit-2026-10-05/overnight/food-batch-'+b+'.md.\n\nEntries:\n'+slice.join('\n')+'\n';
fs.writeFileSync('$ovw/G3b-food-'+b+'.md',brief);console.log(slice.length);"
}

laneG(){
  say "lane G start"
  gem G5 gemini-3.8-flash-medium 25 "$OV/G5-iphone-specs.md"
  gem G6 gemini-3.8-flash-high 30 "$OV/G6-goal-audit.md"
  { cat "$OV/_g7-header.md"; git -C "$FT" diff -U2 5d76a13 main -- fittrack.html; } > "$OV/G7-wave2-review.md"
  gem G7 gemini-3.8-flash-high 25 "$OV/G7-wave2-review.md"
  local b; for b in 1 2 3; do
    [ "$(food_brief $b)" -gt 0 ] || break
    gem "G3b-$b" gemini-3.8-flash-medium 40 "$OV/G3b-food-$b.md"
  done
  say "lane G done"
}

say "=== overnight driver start ==="
laneA & laneB & laneG & wait
say "=== ALL LANES DONE ==="
