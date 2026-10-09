# Food sourcing, day 2 batch 1: published nutrition for 10 foods

**Budget rule (hard): your FIRST action is write_to_file creating docs/audit-2026-10-05/overnight/food-d2-1.json containing []. After EVERY food, rewrite the whole valid JSON array. Last night every run spent its step cap searching and was killed with nothing written.** Edit nothing else, never download files into the project, no helper scripts, read pages with read_url_content only.

For each entry, find the published nutrition for that exact item: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. If a brand site gives no readable nutrition within two steps, mark that brand unresolved and move on. **Portions:** when the published item is the same portion as ours (same piece count or named size), use the published grams and values as they are and set grams to the published grams; scale only when ours is a different portion of the same item, and say so in src. Never guess.

Objects: {"id","status":"sourced"|"unresolved","cal","protein","carbs","fat","grams","conf":"published"|"derived","src","url","scaled","checked":"2026-10-06"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src.

Entries:
{"id":"library-grocery-generic-basmati-rice-cooked-common-serving","name":"Basmati rice cooked, common serving","brand":"","serving":"180 g","grams":180,"cal":210,"protein":5.6,"carbs":45.4,"fat":0.7}
{"id":"library-grocery-generic-salmon-atlantic-cooked-common-serving","name":"Salmon Atlantic cooked, common serving","brand":"","serving":"150 g","grams":150,"cal":326,"protein":37.5,"carbs":0,"fat":19.5}
{"id":"library-grocery-generic-basmati-rice-cooked-per-100-g","name":"Basmati rice cooked, per 100 g","brand":"","serving":"100 g","grams":100,"cal":117,"protein":3.1,"carbs":25.2,"fat":0.4}
{"id":"library-grocery-generic-ground-beef-extra-lean-cooked-common-serving","name":"Ground beef extra lean cooked, common serving","brand":"","serving":"150 g","grams":150,"cal":276,"protein":42,"carbs":0,"fat":12}
{"id":"library-grocery-generic-jasmine-rice-cooked-common-serving","name":"Jasmine rice cooked, common serving","brand":"","serving":"180 g","grams":180,"cal":227,"protein":4.3,"carbs":51.5,"fat":0.4}
{"id":"generic-banh-mi-grilled-chicken","name":"Banh Mi, Grilled Chicken (no pate)","brand":"","serving":"1 sandwich, ~280g","grams":280,"cal":480,"protein":28,"carbs":55,"fat":16}
{"id":"generic-butter-chicken-half-rice","name":"Butter Chicken, half rice, sauce on side","brand":"","serving":"~350g curry plus half cup rice","grams":400,"cal":520,"protein":35,"carbs":45,"fat":22}
{"id":"generic-sushi-california-roll-salmon-side","name":"California Roll plus extra salmon sashimi side","brand":"","serving":"1 roll (8pc) plus 4pc sashimi","grams":350,"cal":500,"protein":30,"carbs":55,"fat":16}
{"id":"generic-chicken-katsu-baked","name":"Chicken Katsu (baked, not fried, side salad not rice)","brand":"","serving":"1 order, ~300g","grams":300,"cal":420,"protein":42,"carbs":25,"fat":16}
{"id":"generic-koobideh-kabob-plate","name":"Chicken Koobideh Kabob Plate, no rice","brand":"","serving":"~350g, 2 skewers plus salad","grams":350,"cal":500,"protein":48,"carbs":10,"fat":28}
