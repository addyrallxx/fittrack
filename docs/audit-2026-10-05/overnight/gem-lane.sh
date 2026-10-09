#!/usr/bin/env bash
# Day 2 Gemini lane. Single-shot jobs first (inputs inline, no tools), then
# small tool jobs that must write their output file first and after every item.
source <(sed -n '1,16p' "$(dirname "$0")/overnight.sh")
source <(sed -n '86,97p' "$(dirname "$0")/overnight.sh")
LOG=$OV/day2.log
say "gem-lane start"
gem G6b gemini-3.1-pro-high 6 "$OV/G6b-goal-audit.md"
gem G7b gemini-3.8-flash-high 6 "$OV/G7b-f1f3-review.md"
gem G5b gemini-3.8-flash-medium 30 "$OV/G5b-specs-verify.md"
gem G7c gemini-3.8-flash-high 6 "$OV/G7c-wave2-review.md"
ftw=$(cygpath -m "$FT"); ovw=$(cygpath -m "$OV")
for b in 1 2 3 4 5 6; do
  n=$(node -e "
const fs=require('fs');const b=$b;
const done=JSON.parse(fs.readFileSync('$ftw/docs/audit-2026-10-05/food-sourcing-batch1.json','utf8'));
const skip=new Set(JSON.parse(fs.readFileSync('$ovw/food-batch-3.json','utf8')).map(x=>x.id));
const foods=JSON.parse(fs.readFileSync('$ftw/data/foods.json','utf8')).entries;const byId=new Map(foods.map(f=>[f.id,f]));
const todo=done.filter(x=>x.status!=='sourced'&&!skip.has(x.id)).map(x=>byId.get(x.id)).filter(Boolean).sort((a,c)=>(a.brand||'').localeCompare(c.brand||''));
const slice=todo.slice((b-1)*10,b*10).map(x=>JSON.stringify({id:x.id,name:x.name,brand:x.brand,serving:x.serving,grams:x.grams,cal:x.cal,protein:x.protein,carbs:x.carbs,fat:x.fat}));
const out='docs/audit-2026-10-05/overnight/food-d2-'+b+'.json';
const brief='# Food sourcing, day 2 batch '+b+': published nutrition for '+slice.length+' foods\n\n**Budget rule (hard): your FIRST action is write_to_file creating '+out+' containing []. After EVERY food, rewrite the whole valid JSON array. Last night every run spent its step cap searching and was killed with nothing written.** Edit nothing else, never download files into the project, no helper scripts, read pages with read_url_content only.\n\nFor each entry, find the published nutrition for that exact item: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. If a brand site gives no readable nutrition within two steps, mark that brand unresolved and move on. **Portions:** when the published item is the same portion as ours (same piece count or named size), use the published grams and values as they are and set grams to the published grams; scale only when ours is a different portion of the same item, and say so in src. Never guess.\n\nObjects: {\"id\",\"status\":\"sourced\"|\"unresolved\",\"cal\",\"protein\",\"carbs\",\"fat\",\"grams\",\"conf\":\"published\"|\"derived\",\"src\",\"url\",\"scaled\",\"checked\":\"2026-10-06\"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src.\n\nEntries:\n'+slice.join('\n')+'\n';
fs.writeFileSync('$ovw/food-d2-'+b+'.md',brief);console.log(slice.length);")
  [ "${n:-0}" -gt 0 ] || break
  gem "food-d2-$b" gemini-3.8-flash-medium 30 "$OV/food-d2-$b.md"
done
say "gem-lane done"
