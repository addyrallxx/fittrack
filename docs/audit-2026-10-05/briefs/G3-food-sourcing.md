# G3: source real nutrition values for the most-used estimated foods

You are researching only. You own exactly two output files: `docs/audit-2026-10-05/food-sourcing-batch1.json` and `docs/audit-2026-10-05/food-sourcing-batch1.md`. Do not edit `data/foods.json` or any other file. Helper scripts go in `gemini-scratch/` only.

## Why
FitTrack ships 1,502 foods; 1,087 are marked `conf: "estimate"` (made-up-but-plausible macros). Users log these daily, so a wrong number is a wrong day. Replace estimates with published numbers wherever a real source exists.

## The batch
Run this to get your list (it prints the 150 highest-`pop` estimated entries from the restaurant and grocery categories, as JSON lines):
```
node -e "const d=require('./data/foods.json');d.entries.filter(x=>x.conf==='estimate'&&(x.cat==='restaurant'||x.cat==='grocery')).sort((a,b)=>(b.pop||0)-(a.pop||0)).slice(0,150).forEach(x=>console.log(JSON.stringify({id:x.id,name:x.name,brand:x.brand,cat:x.cat,serving:x.serving,grams:x.grams,cal:x.cal,protein:x.protein,carbs:x.carbs,fat:x.fat})))"
```

## For each entry
Find the published nutrition for that exact item and serving, preferring in this order: the brand's own Canadian nutrition page or PDF (these are Canadian chains and products), the brand's US page if the Canadian one does not exist (say so), the product's Open Food Facts page (barcode in the URL), USDA FoodData Central (FDC id) for generic grocery items. Open every page you cite. If the published serving differs from ours, scale to our `grams` and say so. If you cannot find a real source, mark it `"unresolved"`, never guess.

## Output
`food-sourcing-batch1.json`: an array, one object per entry:
`{"id": "...", "status": "sourced" | "unresolved", "cal": n, "protein": n, "carbs": n, "fat": n, "grams": n, "conf": "published" | "derived", "src": "short human citation", "url": "the page you opened", "scaled": true|false, "checked": "2026-10-05"}`. Use `published` when the source states the values for this serving, `derived` when you scaled or combined. Numbers are integers except protein, carbs and fat which may have one decimal.
Sanity rule: `4*protein + 4*carbs + 9*fat` must be within 25 percent of `cal` (the repo's own check enforces this). If a published label breaks it, keep the label values and note it.

`food-sourcing-batch1.md`: counts (sourced, derived, unresolved), every entry whose calories moved more than 20 percent from the old estimate (old, new, source), and a `Final report`.

## Method
Use `search_web` and `read_url_content`. Fan out with subagents, about 25 entries per subagent, grouped by brand so one nutrition PDF serves many items. Write the JSON incrementally (rewrite the whole valid array after each subagent finishes) so a cut-off keeps finished work. Never invent a number, a URL or a source.
