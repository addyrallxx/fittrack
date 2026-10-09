# G3b-2: source published nutrition for 40 estimated foods

Research only. Write exactly one file: docs/audit-2026-10-05/overnight/food-batch-2.json (rewrite the whole valid array after each brand). Edit nothing else and NEVER download files into the project (read pages with read_url_content only).

For each entry below (grouped by brand), find the published nutrition for that exact item and serving: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. Scale to our grams if the serving differs. If not found, status unresolved; never guess.

Output objects: {"id","status":"sourced"|"unresolved","cal","protein","carbs","fat","grams","conf":"published"|"derived","src","url","scaled","checked":"2026-10-06"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src. One search can cover a whole brand. End with a Final report line in a separate file docs/audit-2026-10-05/overnight/food-batch-2.md.

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
{"id":"flirty-bird-the-sando","name":"The Sando (Mild)","brand":"Flirty Bird Nashville Hot Chicken","serving":"1 fried chicken sandwich, mild spice","grams":280,"cal":700,"protein":32,"carbs":60,"fat":38}
{"id":"flirty-bird-the-tenders","name":"The Tenders (Mild, Comeback Sauce)","brand":"Flirty Bird Nashville Hot Chicken","serving":"1 order of tenders, mild spice, with Comeback Sauce","grams":260,"cal":650,"protein":35,"carbs":45,"fat":36}
{"id":"foodyard-butter-chicken-bowl","name":"Butter Chicken Bowl","brand":"Foodyard","serving":"1 bowl, butter chicken over rice","grams":420,"cal":650,"protein":35,"carbs":60,"fat":28}
{"id":"foodyard-butter-chicken-crispy-wrap","name":"Butter Chicken Crispy Chicken Wrap","brand":"Foodyard","serving":"1 wrap","grams":350,"cal":750,"protein":32,"carbs":68,"fat":38}
{"id":"foodyard-grilled-chicken-donair-plate","name":"Grilled Chicken Donair Plate (no fries)","brand":"Foodyard","serving":"~400g plate","grams":400,"cal":600,"protein":42,"carbs":50,"fat":24}
{"id":"library-grocery-general-mills-original-oatmeal","name":"Original Oatmeal","brand":"General Mills","serving":"1 package-label serving","grams":40,"cal":155,"protein":5,"carbs":27,"fat":3}
{"id":"library-restaurant-harvey-s-regular-fries","name":"Regular Fries","brand":"Harvey's","serving":"1 restaurant order","grams":125,"cal":356,"protein":5,"carbs":48,"fat":16}
{"id":"library-restaurant-harvey-s-classic-cheeseburger","name":"Classic Cheeseburger","brand":"Harvey's","serving":"1 restaurant order","grams":220,"cal":464,"protein":27,"carbs":35,"fat":24}
{"id":"library-restaurant-harvey-s-classic-hamburger","name":"Classic Hamburger","brand":"Harvey's","serving":"1 restaurant order","grams":190,"cal":377,"protein":22,"carbs":34,"fat":17}
{"id":"jaffa-chicken-shawarma-wrap","name":"Chicken Shawarma Wrap","brand":"Jaffa Shawarma","serving":"1 wrap, ~350g","grams":350,"cal":650,"protein":30,"carbs":60,"fat":30}
{"id":"library-restaurant-joey-rotisserie-chicken-quarter-white-meat","name":"Rotisserie Chicken Quarter, White Meat","brand":"JOEY","serving":"1 restaurant order","grams":300,"cal":378,"protein":46,"carbs":8,"fat":18}
{"id":"library-grocery-kellogg-s-original-oatmeal","name":"Original Oatmeal","brand":"Kellogg's","serving":"1 package-label serving","grams":40,"cal":155,"protein":5,"carbs":27,"fat":3}
{"id":"library-restaurant-kfc-chicken-tenders-3-piece","name":"Chicken Tenders, 3 Piece","brand":"KFC","serving":"1 restaurant order","grams":190,"cal":396,"protein":30,"carbs":24,"fat":20}
{"id":"library-restaurant-kfc-chicken-sandwich-classic","name":"Chicken Sandwich, Classic","brand":"KFC","serving":"1 restaurant order","grams":250,"cal":555,"protein":29,"carbs":49,"fat":27}
{"id":"library-restaurant-kfc-original-chicken-breast-1-piece","name":"Original Chicken Breast, 1 Piece","brand":"KFC","serving":"1 restaurant order","grams":170,"cal":350,"protein":35,"carbs":12,"fat":18}
{"id":"kolachi-beef-seekh-kabab-platter","name":"Beef Seekh Kabab Platter (2 kababs, rice, salad)","brand":"Kolachi BBQ & Grill","serving":"1 platter (~450g)","grams":450,"cal":650,"protein":40,"carbs":45,"fat":30}
{"id":"kolachi-chicken-karahi-naan","name":"Chicken Karahi with 1 naan","brand":"Kolachi BBQ & Grill","serving":"~500g karahi plus 1 naan","grams":550,"cal":700,"protein":45,"carbs":55,"fat":32}
{"id":"kolachi-chicken-tikka-boti-platter","name":"Chicken Tikka Boti Platter (grilled chicken chunks, no rice)","brand":"Kolachi BBQ & Grill","serving":"1 platter, ~350g chicken plus salad","grams":400,"cal":480,"protein":55,"carbs":10,"fat":24}
{"id":"marhaba-chicken-kabsa","name":"Chicken Kabsa","brand":"Marhaba Restaurant","serving":"~400g","grams":400,"cal":800,"protein":40,"carbs":85,"fat":30}
{"id":"marhaba-chicken-shawarma-platter","name":"Chicken Shawarma Platter with rice and fries","brand":"Marhaba Restaurant","serving":"~500g platter","grams":500,"cal":950,"protein":45,"carbs":90,"fat":45}
