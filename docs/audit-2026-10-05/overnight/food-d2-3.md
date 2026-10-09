# Food sourcing, day 2 batch 3: published nutrition for 10 foods

**Budget rule (hard): your FIRST action is write_to_file creating docs/audit-2026-10-05/overnight/food-d2-3.json containing []. After EVERY food, rewrite the whole valid JSON array. Last night every run spent its step cap searching and was killed with nothing written.** Edit nothing else, never download files into the project, no helper scripts, read pages with read_url_content only.

For each entry, find the published nutrition for that exact item: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. If a brand site gives no readable nutrition within two steps, mark that brand unresolved and move on. **Portions:** when the published item is the same portion as ours (same piece count or named size), use the published grams and values as they are and set grams to the published grams; scale only when ours is a different portion of the same item, and say so in src. Never guess.

Objects: {"id","status":"sourced"|"unresolved","cal","protein","carbs","fat","grams","conf":"published"|"derived","src","url","scaled","checked":"2026-10-06"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src.

Entries:
{"id":"generic-poke-tofu-chicken-bowl","name":"Poke-style Bowl, Tofu and Chicken hybrid, extra protein add-on","brand":"","serving":"1 bowl, ~420g","grams":420,"cal":480,"protein":40,"carbs":40,"fat":18}
{"id":"generic-rotisserie-chicken-breast-portion","name":"Rotisserie Chicken, Breast Portion (delivery rotisserie chicken)","brand":"","serving":"~150g breast meat, no skin","grams":150,"cal":280,"protein":50,"carbs":0,"fat":8}
{"id":"library-restaurant-a-and-w-regular-fries","name":"Regular Fries","brand":"A&W","serving":"1 restaurant order","grams":125,"cal":356,"protein":5,"carbs":48,"fat":16}
{"id":"library-restaurant-a-and-w-classic-cheeseburger","name":"Classic Cheeseburger","brand":"A&W","serving":"1 restaurant order","grams":220,"cal":464,"protein":27,"carbs":35,"fat":24}
{"id":"library-restaurant-a-and-w-classic-hamburger","name":"Classic Hamburger","brand":"A&W","serving":"1 restaurant order","grams":190,"cal":377,"protein":22,"carbs":34,"fat":17}
{"id":"baladi-chicken-shawarma-plate-rice","name":"Chicken Shawarma Plate with rice","brand":"Baladi Shawarma","serving":"~450g","grams":450,"cal":750,"protein":40,"carbs":70,"fat":30}
{"id":"barcelos-half-chicken-breast","name":"Half Chicken Breast (grilled, no skin)","brand":"Barcelos Flame Grilled Chicken","serving":"~300g","grams":300,"cal":540,"protein":85,"carbs":4,"fat":18}
{"id":"barcelos-quarter-chicken-breast","name":"Quarter Chicken Breast (grilled, no skin)","brand":"Barcelos Flame Grilled Chicken","serving":"~150g","grams":150,"cal":280,"protein":45,"carbs":2,"fat":10}
{"id":"biryani-garden-chicken-biryani-combo","name":"Chicken Biriyani Combo","brand":"Biryani Garden","serving":"1 combo platter with rice, chicken biryani, side salad/raita, plus a Diet Cola","grams":650,"cal":950,"protein":40,"carbs":110,"fat":38}
{"id":"blowers-grafton-grilled-chicken-caesar-salad","name":"Grilled Chicken Caesar Salad (dressing on side)","brand":"Blowers & Grafton","serving":"1 entree salad","grams":350,"cal":450,"protein":42,"carbs":15,"fat":26}
