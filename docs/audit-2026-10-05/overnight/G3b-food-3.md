# G3b-3: source published nutrition for 40 estimated foods

Research only. Write exactly one file: docs/audit-2026-10-05/overnight/food-batch-3.json (rewrite the whole valid array after each brand). Edit nothing else and NEVER download files into the project (read pages with read_url_content only).

For each entry below (grouped by brand), find the published nutrition for that exact item and serving: the brand Canadian nutrition page or PDF first, then the US page (say so), then Open Food Facts (barcode URL), then USDA FoodData Central (FDC id) for generic items. Open every page you cite. Scale to our grams if the serving differs. If not found, status unresolved; never guess.

Output objects: {"id","status":"sourced"|"unresolved","cal","protein","carbs","fat","grams","conf":"published"|"derived","src","url","scaled","checked":"2026-10-06"}. Check 4p+4c+9f within 25 percent of cal; keep label values if a real label breaks it and note it in src. One search can cover a whole brand. End with a Final report line in a separate file docs/audit-2026-10-05/overnight/food-batch-3.md.

Entries:
{"id":"library-restaurant-mary-brown-s-chicken-tenders-3-piece","name":"Chicken Tenders, 3 Piece","brand":"Mary Brown's","serving":"1 restaurant order","grams":190,"cal":396,"protein":30,"carbs":24,"fat":20}
{"id":"library-restaurant-mary-brown-s-chicken-sandwich-classic","name":"Chicken Sandwich, Classic","brand":"Mary Brown's","serving":"1 restaurant order","grams":250,"cal":555,"protein":29,"carbs":49,"fat":27}
{"id":"library-restaurant-mary-brown-s-original-chicken-breast-1-piece","name":"Original Chicken Breast, 1 Piece","brand":"Mary Brown's","serving":"1 restaurant order","grams":170,"cal":350,"protein":35,"carbs":12,"fat":18}
{"id":"library-restaurant-mcdonald-s-regular-fries","name":"Regular Fries","brand":"McDonald's","serving":"1 restaurant order","grams":125,"cal":356,"protein":5,"carbs":48,"fat":16}
{"id":"library-restaurant-mcdonald-s-classic-cheeseburger","name":"Classic Cheeseburger","brand":"McDonald's","serving":"1 restaurant order","grams":220,"cal":464,"protein":27,"carbs":35,"fat":24}
{"id":"library-restaurant-mcdonald-s-classic-hamburger","name":"Classic Hamburger","brand":"McDonald's","serving":"1 restaurant order","grams":190,"cal":377,"protein":22,"carbs":34,"fat":17}
{"id":"library-restaurant-montana-s-rotisserie-chicken-quarter-white-meat","name":"Rotisserie Chicken Quarter, White Meat","brand":"Montana's","serving":"1 restaurant order","grams":300,"cal":378,"protein":46,"carbs":8,"fat":18}
{"id":"library-restaurant-mucho-burrito-chicken-burrito-bowl","name":"Chicken Burrito Bowl","brand":"Mucho Burrito","serving":"1 restaurant order","grams":620,"cal":684,"protein":42,"carbs":75,"fat":24}
{"id":"library-restaurant-mucho-burrito-chicken-burrito","name":"Chicken Burrito","brand":"Mucho Burrito","serving":"1 restaurant order","grams":760,"cal":821,"protein":44,"carbs":96,"fat":29}
{"id":"library-restaurant-mucho-burrito-double-chicken-burrito-bowl","name":"Double Chicken Burrito Bowl","brand":"Mucho Burrito","serving":"1 restaurant order","grams":760,"cal":850,"protein":70,"carbs":75,"fat":30}
{"id":"library-grocery-nature-s-path-original-oatmeal","name":"Original Oatmeal","brand":"Nature's Path","serving":"1 package-label serving","grams":40,"cal":155,"protein":5,"carbs":27,"fat":3}
{"id":"library-restaurant-panago-cheese-pizza-large-slice","name":"Cheese Pizza, Large Slice","brand":"Panago","serving":"1 restaurant order","grams":145,"cal":304,"protein":13,"carbs":36,"fat":12}
{"id":"paros-chicken-souvlaki-pita","name":"Chicken Souvlaki Pita (no fries)","brand":"Paros Real Greek","serving":"1 pita wrap","grams":320,"cal":450,"protein":35,"carbs":40,"fat":16}
{"id":"paros-chicken-souvlaki-platter","name":"Chicken Souvlaki Platter","brand":"Paros Real Greek","serving":"~450g with rice and salad","grams":450,"cal":750,"protein":50,"carbs":55,"fat":30}
{"id":"pizza-73-12pc-wedgie-bread","name":"12pc Wedgie Bread","brand":"Pizza 73","serving":"1 order of 12 garlic cheese bread wedges","grams":480,"cal":1320,"protein":36,"carbs":144,"fat":60}
{"id":"library-restaurant-pizza-73-cheese-pizza-large-slice","name":"Cheese Pizza, Large Slice","brand":"Pizza 73","serving":"1 restaurant order","grams":145,"cal":304,"protein":13,"carbs":36,"fat":12}
{"id":"library-restaurant-pizza-hut-cheese-pizza-large-slice","name":"Cheese Pizza, Large Slice","brand":"Pizza Hut","serving":"1 restaurant order","grams":145,"cal":304,"protein":13,"carbs":36,"fat":12}
{"id":"popeyes-signature-sauce","name":"Signature Sauce (side)","brand":"Popeyes","serving":"1 side dip cup","grams":28,"cal":110,"protein":0,"carbs":1,"fat":12}
{"id":"library-restaurant-popeyes-chicken-tenders-3-piece","name":"Chicken Tenders, 3 Piece","brand":"Popeyes","serving":"1 restaurant order","grams":190,"cal":396,"protein":30,"carbs":24,"fat":20}
{"id":"library-restaurant-popeyes-chicken-sandwich-classic","name":"Chicken Sandwich, Classic","brand":"Popeyes","serving":"1 restaurant order","grams":250,"cal":555,"protein":29,"carbs":49,"fat":27}
{"id":"library-restaurant-popeyes-original-chicken-breast-1-piece","name":"Original Chicken Breast, 1 Piece","brand":"Popeyes","serving":"1 restaurant order","grams":170,"cal":350,"protein":35,"carbs":12,"fat":18}
{"id":"primetime-big-boy-smash-burger-combo","name":"Big Boy Smash Burger Combo","brand":"PrimeTime Donair & Poutine","serving":"1 combo: three smash patties, melted cheese, lettuce, tomato, smash sauce, side fries, Diet Pepsi","grams":700,"cal":1400,"protein":70,"carbs":95,"fat":85}
{"id":"primetime-side-inferno-sauce","name":"Side of Inferno Sauce","brand":"PrimeTime Donair & Poutine","serving":"1 side sauce cup","grams":30,"cal":30,"protein":0,"carbs":3,"fat":2}
{"id":"library-grocery-quaker-original-oatmeal","name":"Original Oatmeal","brand":"Quaker","serving":"1 package-label serving","grams":40,"cal":155,"protein":5,"carbs":27,"fat":3}
{"id":"library-restaurant-quesada-chicken-burrito-bowl","name":"Chicken Burrito Bowl","brand":"Quesada","serving":"1 restaurant order","grams":620,"cal":684,"protein":42,"carbs":75,"fat":24}
{"id":"library-restaurant-quesada-chicken-burrito","name":"Chicken Burrito","brand":"Quesada","serving":"1 restaurant order","grams":760,"cal":821,"protein":44,"carbs":96,"fat":29}
{"id":"library-restaurant-quesada-double-chicken-burrito-bowl","name":"Double Chicken Burrito Bowl","brand":"Quesada","serving":"1 restaurant order","grams":760,"cal":850,"protein":70,"carbs":75,"fat":30}
{"id":"rice-table-beef-bulgogi-bowl","name":"Beef Bulgogi Bowl","brand":"Rice Table Korean Kitchen","serving":"~450g bowl","grams":450,"cal":680,"protein":38,"carbs":78,"fat":20}
{"id":"rice-table-chicken-bulgogi-bowl","name":"Chicken Bulgogi Bowl","brand":"Rice Table Korean Kitchen","serving":"~450g bowl","grams":450,"cal":650,"protein":35,"carbs":80,"fat":18}
{"id":"library-restaurant-second-cup-coffee-double-double-medium","name":"Coffee Double Double, Medium","brand":"Second Cup","serving":"1 restaurant order","grams":400,"cal":306,"protein":2,"carbs":34,"fat":18}
{"id":"library-restaurant-second-cup-brewed-coffee-black-medium","name":"Brewed Coffee, Black, Medium","brand":"Second Cup","serving":"1 restaurant order","grams":400,"cal":2,"protein":0.5,"carbs":0,"fat":0}
{"id":"library-restaurant-second-cup-latte-with-2-percent-milk-medium","name":"Latte with 2 Percent Milk, Medium","brand":"Second Cup","serving":"1 restaurant order","grams":475,"cal":195,"protein":13,"carbs":20,"fat":7}
{"id":"library-restaurant-second-cup-egg-and-cheese-breakfast-sandwich","name":"Egg and Cheese Breakfast Sandwich","brand":"Second Cup","serving":"1 restaurant order","grams":170,"cal":366,"protein":17,"carbs":34,"fat":18}
{"id":"shawarma-palace-chicken-platter-7","name":"Chicken Shawarma Platter #7","brand":"Shawarma Palace","serving":"1 platter, chicken shawarma, garlic sauce, spicy garlic, sweet sauce, Greek salad","grams":550,"cal":900,"protein":45,"carbs":70,"fat":48}
{"id":"shawarma-palace-mango-juice","name":"Mango Juice","brand":"Shawarma Palace","serving":"1 cup","grams":350,"cal":180,"protein":0,"carbs":44,"fat":0}
{"id":"shawarma-palace-mix-platter-11-no-donair","name":"Mix Chicken, Lamb & Beef Shawarma Platter #11 (no donair)","brand":"Shawarma Palace","serving":"1 platter, mixed chicken/lamb/beef shawarma, garlic sauce, spicy garlic, sweet sauce, Greek salad","grams":600,"cal":1000,"protein":50,"carbs":75,"fat":55}
{"id":"spice-avenue-vuna-khichuri-beef","name":"Vuna Khichuri, Beef","brand":"Spice Avenue","serving":"1 order, mixed lentil-rice khichuri with bhuna-style beef","grams":460,"cal":780,"protein":35,"carbs":78,"fat":34}
{"id":"spice-avenue-vuna-khichuri-chicken","name":"Vuna Khichuri, Chicken","brand":"Spice Avenue","serving":"1 order, mixed lentil-rice khichuri with bhuna-style chicken","grams":450,"cal":700,"protein":32,"carbs":80,"fat":26}
{"id":"library-restaurant-starbucks-coffee-double-double-medium","name":"Coffee Double Double, Medium","brand":"Starbucks","serving":"1 restaurant order","grams":400,"cal":306,"protein":2,"carbs":34,"fat":18}
{"id":"library-restaurant-starbucks-brewed-coffee-black-medium","name":"Brewed Coffee, Black, Medium","brand":"Starbucks","serving":"1 restaurant order","grams":400,"cal":2,"protein":0.5,"carbs":0,"fat":0}
