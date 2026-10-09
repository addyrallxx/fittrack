# Food sourcing, day 2 batch 6: published nutrition for 10 foods

**Budget rule (hard): your FIRST action is write_to_file creating docs/audit-2026-10-05/overnight/food-d2-6.json containing []. After EVERY food, rewrite the whole valid JSON array. Last night every run spent its step cap searching and was killed with nothing written.** Edit nothing else, never download files into the project, no helper scripts, read pages with read_url_content only.

For each entry, find the published nutrition for that exact item: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. If a brand site gives no readable nutrition within two steps, mark that brand unresolved and move on. **Portions:** when the published item is the same portion as ours (same piece count or named size), use the published grams and values as they are and set grams to the published grams; scale only when ours is a different portion of the same item, and say so in src. Never guess.

Objects: {"id","status":"sourced"|"unresolved","cal","protein","carbs","fat","grams","conf":"published"|"derived","src","url","scaled","checked":"2026-10-06"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src.

Entries:
{"id":"library-restaurant-dairy-queen-regular-fries","name":"Regular Fries","brand":"Dairy Queen","serving":"1 restaurant order","grams":125,"cal":356,"protein":5,"carbs":48,"fat":16}
{"id":"library-restaurant-dairy-queen-classic-cheeseburger","name":"Classic Cheeseburger","brand":"Dairy Queen","serving":"1 restaurant order","grams":220,"cal":464,"protein":27,"carbs":35,"fat":24}
{"id":"library-restaurant-dairy-queen-classic-hamburger","name":"Classic Hamburger","brand":"Dairy Queen","serving":"1 restaurant order","grams":190,"cal":377,"protein":22,"carbs":34,"fat":17}
{"id":"daves-hot-chicken-3-tender-combo","name":"3-Tender Combo, No/Lite spice (no fries)","brand":"Dave's Hot Chicken","serving":"3 tenders, ~250g","grams":250,"cal":490,"protein":45,"carbs":30,"fat":20}
{"id":"library-restaurant-domino-s-cheese-pizza-large-slice","name":"Cheese Pizza, Large Slice","brand":"Domino's","serving":"1 restaurant order","grams":145,"cal":304,"protein":13,"carbs":36,"fat":12}
{"id":"library-restaurant-earls-rotisserie-chicken-quarter-white-meat","name":"Rotisserie Chicken Quarter, White Meat","brand":"Earls","serving":"1 restaurant order","grams":300,"cal":378,"protein":46,"carbs":8,"fat":18}
{"id":"library-restaurant-five-guys-regular-fries","name":"Regular Fries","brand":"Five Guys","serving":"1 restaurant order","grams":125,"cal":356,"protein":5,"carbs":48,"fat":16}
{"id":"library-restaurant-five-guys-classic-cheeseburger","name":"Classic Cheeseburger","brand":"Five Guys","serving":"1 restaurant order","grams":220,"cal":464,"protein":27,"carbs":35,"fat":24}
{"id":"library-restaurant-five-guys-classic-hamburger","name":"Classic Hamburger","brand":"Five Guys","serving":"1 restaurant order","grams":190,"cal":377,"protein":22,"carbs":34,"fat":17}
{"id":"flippn-burgers-beefy-bacon-cheddar-burger","name":"Beefy Bacon Cheddar Cheese Burger","brand":"Flipp'n Burgers","serving":"1 burger, white bun, lettuce, tomato, red onion, Flipp'n sauce, mayo, garlic, cheddar, bacon","grams":320,"cal":750,"protein":38,"carbs":45,"fat":45}
