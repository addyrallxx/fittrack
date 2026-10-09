# G3b-1: source published nutrition for 40 estimated foods

Research only. Write exactly one file: docs/audit-2026-10-05/overnight/food-batch-1.json (rewrite the whole valid array after each brand). Edit nothing else and NEVER download files into the project (read pages with read_url_content only).

For each entry below (grouped by brand), find the published nutrition for that exact item and serving: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. Scale to our grams if the serving differs. If not found, status unresolved; never guess.

Output objects: {"id","status":"sourced"|"unresolved","cal","protein","carbs","fat","grams","conf":"published"|"derived","src","url","scaled","checked":"2026-10-06"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src. One search can cover a whole brand. End with a Final report line in a separate file docs/audit-2026-10-05/overnight/food-batch-1.md.

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
{"id":"blowers-grafton-grilled-chicken-sandwich","name":"Grilled Chicken Sandwich (ask no bacon)","brand":"Blowers & Grafton","serving":"1 sandwich","grams":350,"cal":650,"protein":40,"carbs":55,"fat":28}
{"id":"boardwalk-chipotle-beef-bacon-fries","name":"Chipotle Beef Bacon Fries","brand":"Boardwalk Fries Burgers Shakes","serving":"1 order, loaded fries with beef bacon and chipotle sauce","grams":400,"cal":900,"protein":28,"carbs":75,"fat":55}
{"id":"boardwalk-chipotle-burger-combo","name":"Chipotle Burger Combo (Single, Regular Bun, Tater Bites, Diet Cola)","brand":"Boardwalk Fries Burgers Shakes","serving":"1 combo, single chipotle burger, regular bun, small tater bites, fountain diet cola","grams":550,"cal":1050,"protein":40,"carbs":95,"fat":58}
{"id":"library-restaurant-boston-pizza-cheese-pizza-large-slice","name":"Cheese Pizza, Large Slice","brand":"Boston Pizza","serving":"1 restaurant order","grams":145,"cal":304,"protein":13,"carbs":36,"fat":12}
{"id":"calgary-pizza-master-bbq-loaded-slice","name":"BBQ Loaded Pizza Slice (Large)","brand":"Calgary Pizza Master","serving":"1 of 8 slices, BBQ sauce, pepperoni, beef, spicy BBQ chicken, garlic, chilli flakes, cilantro (no sausage)","grams":120,"cal":275,"protein":13,"carbs":29,"fat":12}
{"id":"calgary-pizza-master-butter-chicken-loaded-slice","name":"Butter Chicken Loaded Pizza Slice (Large)","brand":"Calgary Pizza Master","serving":"1 of 8 slices, butter chicken sauce, salami, bacon, tandoori chicken, garlic, chilli flakes, cilantro (no sausage)","grams":125,"cal":300,"protein":14,"carbs":29,"fat":15}
{"id":"calgary-pizza-master-pepperoni-slice","name":"Pepperoni Pizza Slice (Large)","brand":"Calgary Pizza Master","serving":"1 of 8 slices from a large pepperoni pizza","grams":120,"cal":280,"protein":12,"carbs":28,"fat":14}
{"id":"california-thai-chicken-basil-stir-fry","name":"Chicken Basil Stir-fry (Pad Krapow, no rice)","brand":"California Thai","serving":"~350g, chicken and vegetables only","grams":350,"cal":420,"protein":40,"carbs":15,"fat":22}
{"id":"california-thai-chicken-pad-thai","name":"Chicken Pad Thai","brand":"California Thai","serving":"~400g","grams":400,"cal":750,"protein":30,"carbs":90,"fat":25}
{"id":"chicken-world-peri-peri-rice-platter","name":"Peri Peri Rice Platter (Regular)","brand":"Chicken World","serving":"1 regular platter, peri peri chicken over rice","grams":480,"cal":750,"protein":40,"carbs":85,"fat":25}
