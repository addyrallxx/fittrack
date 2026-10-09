# Food sourcing, day 2 batch 5: published nutrition for 10 foods

**Budget rule (hard): your FIRST action is write_to_file creating docs/audit-2026-10-05/overnight/food-d2-5.json containing []. After EVERY food, rewrite the whole valid JSON array. Last night every run spent its step cap searching and was killed with nothing written.** Edit nothing else, never download files into the project, no helper scripts, read pages with read_url_content only.

For each entry, find the published nutrition for that exact item: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. If a brand site gives no readable nutrition within two steps, mark that brand unresolved and move on. **Portions:** when the published item is the same portion as ours (same piece count or named size), use the published grams and values as they are and set grams to the published grams; scale only when ours is a different portion of the same item, and say so in src. Never guess.

Objects: {"id","status":"sourced"|"unresolved","cal","protein","carbs","fat","grams","conf":"published"|"derived","src","url","scaled","checked":"2026-10-06"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src.

Entries:
{"id":"library-restaurant-chipotle-chicken-burrito-bowl","name":"Chicken Burrito Bowl","brand":"Chipotle","serving":"1 restaurant order","grams":620,"cal":684,"protein":42,"carbs":75,"fat":24}
{"id":"library-restaurant-chipotle-chicken-burrito","name":"Chicken Burrito","brand":"Chipotle","serving":"1 restaurant order","grams":760,"cal":821,"protein":44,"carbs":96,"fat":29}
{"id":"library-restaurant-chipotle-double-chicken-burrito-bowl","name":"Double Chicken Burrito Bowl","brand":"Chipotle","serving":"1 restaurant order","grams":760,"cal":850,"protein":70,"carbs":75,"fat":30}
{"id":"library-restaurant-church-s-chicken-chicken-tenders-3-piece","name":"Chicken Tenders, 3 Piece","brand":"Church's Chicken","serving":"1 restaurant order","grams":190,"cal":396,"protein":30,"carbs":24,"fat":20}
{"id":"library-restaurant-church-s-chicken-chicken-sandwich-classic","name":"Chicken Sandwich, Classic","brand":"Church's Chicken","serving":"1 restaurant order","grams":250,"cal":555,"protein":29,"carbs":49,"fat":27}
{"id":"library-restaurant-church-s-chicken-original-chicken-breast-1-piece","name":"Original Chicken Breast, 1 Piece","brand":"Church's Chicken","serving":"1 restaurant order","grams":170,"cal":350,"protein":35,"carbs":12,"fat":18}
{"id":"churchs-original-chicken-breast","name":"Original Chicken Breast","brand":"Church's Texas Chicken","serving":"1 piece, ~113g","grams":113,"cal":200,"protein":22,"carbs":3,"fat":11}
{"id":"library-grocery-coca-cola-original-cola-355-ml","name":"Original Cola, 355 mL","brand":"Coca-Cola","serving":"1 bottle or can","grams":355,"cal":156,"protein":0,"carbs":39,"fat":0}
{"id":"library-grocery-coca-cola-zero-sugar-cola-355-ml","name":"Zero Sugar Cola, 355 mL","brand":"Coca-Cola","serving":"1 bottle or can","grams":355,"cal":0,"protein":0,"carbs":0,"fat":0}
{"id":"library-grocery-coca-cola-zero-sugar-cola-500-ml","name":"Zero Sugar Cola, 500 mL","brand":"Coca-Cola","serving":"1 bottle or can","grams":500,"cal":0,"protein":0,"carbs":0,"fat":0}
