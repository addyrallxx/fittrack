# Food sourcing, day 2 batch 2: published nutrition for 10 foods

**Budget rule (hard): your FIRST action is write_to_file creating docs/audit-2026-10-05/overnight/food-d2-2.json containing []. After EVERY food, rewrite the whole valid JSON array. Last night every run spent its step cap searching and was killed with nothing written.** Edit nothing else, never download files into the project, no helper scripts, read pages with read_url_content only.

For each entry, find the published nutrition for that exact item: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. If a brand site gives no readable nutrition within two steps, mark that brand unresolved and move on. **Portions:** when the published item is the same portion as ours (same piece count or named size), use the published grams and values as they are and set grams to the published grams; scale only when ours is a different portion of the same item, and say so in src. Never guess.

Objects: {"id","status":"sourced"|"unresolved","cal","protein","carbs","fat","grams","conf":"published"|"derived","src","url","scaled","checked":"2026-10-06"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src.

Entries:
{"id":"generic-thai-chicken-larb-salad","name":"Chicken Larb Salad (no rice)","brand":"","serving":"1 salad, ~350g","grams":350,"cal":380,"protein":38,"carbs":20,"fat":16}
{"id":"generic-tandoori-chicken-tikka-masala-half-rice","name":"Chicken Tikka Masala, half rice","brand":"","serving":"~350g curry plus half cup rice","grams":400,"cal":500,"protein":40,"carbs":40,"fat":22}
{"id":"generic-chicken-tikka-skewers-plate","name":"Chicken Tikka Skewers Plate, no rice","brand":"","serving":"~350g, 3 skewers plus salad","grams":350,"cal":420,"protein":50,"carbs":10,"fat":20}
{"id":"generic-falafel-chicken-combo-plate","name":"Falafel and Chicken Combo Plate, hummus, no rice","brand":"","serving":"1 plate, ~400g","grams":400,"cal":550,"protein":42,"carbs":35,"fat":26}
{"id":"generic-greek-chicken-gyro-bowl-no-pita","name":"Greek Chicken Gyro Bowl, no pita, double chicken","brand":"","serving":"1 bowl, ~400g","grams":400,"cal":480,"protein":50,"carbs":25,"fat":20}
{"id":"generic-halal-kebab-plate-no-rice","name":"Halal Kebab Plate, no rice, extra salad","brand":"","serving":"1 plate, ~400g","grams":400,"cal":480,"protein":55,"carbs":15,"fat":22}
{"id":"generic-halal-shawarma-bowl-double-chicken","name":"Halal Shawarma Bowl, double chicken, half rice, no pita","brand":"","serving":"1 bowl, ~450g","grams":450,"cal":550,"protein":50,"carbs":40,"fat":20}
{"id":"generic-halal-shawarma-salad-no-pita","name":"Halal Shawarma Salad (no pita, no rice, double chicken)","brand":"","serving":"1 salad, ~400g","grams":400,"cal":420,"protein":48,"carbs":15,"fat":18}
{"id":"generic-vietnamese-lemongrass-chicken-vermicelli","name":"Lemongrass Grilled Chicken Vermicelli Bowl (bun ga nuong)","brand":"","serving":"1 bowl, ~500g","grams":500,"cal":520,"protein":38,"carbs":58,"fat":14}
{"id":"generic-poke-bowl-double-protein","name":"Poke Bowl, double salmon/tuna, half rice, extra vegetables","brand":"","serving":"1 bowl, ~450g","grams":450,"cal":520,"protein":42,"carbs":45,"fat":18}
