import fs from 'node:fs';
import crypto from 'node:crypto';

const FILE = new URL('../data/foods.json', import.meta.url);
const ORIGINAL_COUNT = 244;
const ORIGINAL_IMMUTABLE_HASH = '0d9b7973dde30ce4369900467fdd403bd2dbb283c690e6ca4614091124b5b9fb';
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const withoutPop = entry => Object.fromEntries(Object.entries(entry).filter(([key]) => key !== 'pop'));
const originals = db.entries.slice(0, ORIGINAL_COUNT).map(withoutPop);
const originalImmutable = originals.map(({ id, name, cat, tags }) => ({ id, name, cat, tags }));
const originalHash = crypto.createHash('sha256').update(JSON.stringify(originalImmutable)).digest('hex');

if (originals.length !== ORIGINAL_COUNT || originalHash !== ORIGINAL_IMMUTABLE_HASH) {
  throw new Error('The original 244 food ids, names, categories, or tags changed. Refusing to regenerate.');
}

const slug = value => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const popularity = entry => {
  if (entry.tags?.includes('his-usual')) return 92;
  const text = `${entry.name} ${entry.brand}`.toLowerCase();
  if (/chicken breast|white rice|whole egg|double double|whey|creatine/.test(text)) return 95;
  if (/chicken|rice|egg|coffee|milk|yogurt|banana|salmon|oat|bread/.test(text)) return 84;
  if (/protein|beef|turkey|tuna|potato|pasta|lentil|bean/.test(text)) return 74;
  if (entry.cat === 'restaurant') return 58;
  if (entry.cat === 'grocery') return 62;
  if (entry.cat === 'recipe') return 55;
  return 40;
};

const entries = originals.map(entry => ({ ...entry, pop: popularity(entry) }));
const ids = new Set(entries.map(entry => entry.id));
const names = new Set(entries.map(entry => `${entry.brand}|${entry.name}`.toLowerCase()));

function tagsFor({ protein, cal, cat, tags = [] }) {
  const result = [...tags];
  if (protein >= 25 && protein * 4 / Math.max(cal, 1) >= 0.25) result.push('high-protein');
  if (cal >= 250 && protein * 4 / cal < 0.12) result.push('low-protein-density');
  if (cat === 'restaurant') result.push('restaurant');
  return [...new Set(result)];
}

function add({ name, brand = '', cat, serving, grams, protein, carbs, fat, pop, src, conf = 'estimate', tags = [], note = '' }) {
  const key = `${brand}|${name}`.toLowerCase();
  if (names.has(key)) return;
  const id = `library-${slug(cat)}-${slug(brand || 'generic')}-${slug(name)}`;
  if (ids.has(id)) throw new Error(`Duplicate generated id: ${id}`);
  const macros = [protein, carbs, fat].map(value => Math.max(0, Math.round(value * 10) / 10));
  const cal = Math.round(macros[0] * 4 + macros[1] * 4 + macros[2] * 9);
  const entry = {
    id,
    name,
    brand,
    cat,
    serving,
    grams: Math.max(0, Math.round(grams)),
    cal,
    protein: macros[0],
    carbs: macros[1],
    fat: macros[2],
    src: src || 'estimated from typical nutrition-label values; live source data was unavailable during generation',
    conf,
    tags: tagsFor({ protein: macros[0], cal, cat, tags }),
    note,
    pop: Math.max(0, Math.min(100, Math.round(pop)))
  };
  entries.push(entry);
  ids.add(id);
  names.add(key);
}

function addScaled(base, grams, suffix, serving, popDelta = 0) {
  const scale = grams / 100;
  add({
    name: `${base.name}, ${suffix}`,
    brand: base.brand || '',
    cat: 'grocery',
    serving,
    grams,
    protein: base.p * scale,
    carbs: base.c * scale,
    fat: base.f * scale,
    pop: base.pop + popDelta,
    tags: base.tags || [],
    src: 'estimated from typical USDA-style per-100 g values; the live FoodData Central download was unavailable during generation'
  });
}

const groceryRows = `
Chicken breast skinless raw|23.1|0|1.9|180|100|lean
Chicken breast skinless cooked|31|0|3.6|150|100|lean
Chicken thigh skinless raw|19.7|0|5.4|180|91|
Chicken thigh skinless cooked|26|0|10.9|150|90|
Chicken drumstick skinless cooked|27|0|5.7|120|78|
Chicken wings roasted|30.5|0|8.1|100|68|
Turkey breast roasted|29|0|1.8|150|86|lean
Turkey ground lean cooked|27|0|8|150|78|
Beef sirloin steak lean cooked|27|0|10|170|83|
Beef tenderloin cooked|27|0|11|170|72|
Beef strip loin cooked|26|0|13|170|76|
Beef ribeye cooked|24|0|22|170|70|
Beef eye of round cooked|29|0|6|170|74|lean
Beef top round cooked|29|0|7|170|76|lean
Beef chuck roast cooked|27|0|17|170|68|
Beef stew meat cooked|28|0|9|170|72|
Ground beef extra lean cooked|28|0|8|150|86|lean
Ground beef lean cooked|26|0|15|150|82|
Ground beef medium cooked|25|0|20|150|68|
Lamb leg lean cooked|28|0|9|150|62|
Lamb shoulder cooked|25|0|20|150|52|
Goat meat cooked|27|0|3|150|58|lean
Bison ground cooked|28|0|8|150|48|lean
Venison cooked|30|0|3|150|45|lean
Salmon Atlantic cooked|25|0|13|150|91|
Salmon sockeye cooked|27|0|8|150|78|
Tuna light canned in water|25.5|0|0.8|120|90|lean
Tuna albacore canned in water|26|0|1|120|78|lean
Cod cooked|23|0|0.9|150|75|lean
Haddock cooked|24|0|0.9|150|64|lean
Pollock cooked|24|0|1|150|58|lean
Tilapia cooked|26|0|2.7|150|82|lean
Rainbow trout cooked|26|0|8|150|70|
Halibut cooked|27|0|3|150|62|lean
Sardines canned in oil drained|25|0|11|100|60|
Mackerel cooked|24|0|18|150|52|
Shrimp cooked|24|0.2|0.3|140|80|lean
Scallops cooked|24|5|1|140|52|lean
Crab meat cooked|19|0|1.5|120|52|lean
Mussels cooked|24|7|4.5|150|45|
Egg whole cooked|12.6|1.1|10.6|100|96|
Egg whites cooked|11|0.7|0.2|150|92|lean
Greek yogurt plain nonfat|10.3|3.6|0.4|175|94|lean
Greek yogurt plain 2 percent|9.5|4|2|175|88|
Skyr plain nonfat|11|4|0.2|175|82|lean
Cottage cheese 1 percent|12.4|3|1|125|90|lean
Cottage cheese 2 percent|11.5|3.5|2.3|125|85|
Cheddar cheese|25|1.3|33|30|82|
Mozzarella part skim|24|3|17|30|78|
Feta cheese|14|4|21|30|62|
Parmesan cheese|36|4|26|20|68|
Ricotta part skim|11|7|8|125|62|
Milk skim|3.4|5|0.1|250|90|
Milk 1 percent|3.4|5|1|250|84|
Milk 2 percent|3.3|4.8|2|250|92|
Milk whole|3.2|4.7|3.3|250|80|
Soy beverage unsweetened|3.3|0.7|1.8|250|72|
Almond beverage unsweetened|0.5|0.6|1.2|250|68|
Oat beverage unsweetened|1|6.7|1.5|250|65|
White rice long grain cooked|2.7|28.2|0.3|180|100|
Basmati rice cooked|3.1|25.2|0.4|180|97|
Brown rice cooked|2.6|23|0.9|180|84|
Jasmine rice cooked|2.4|28.6|0.2|180|86|
Wild rice cooked|4|21|0.3|165|55|
Quinoa cooked|4.4|21.3|1.9|185|80|
Couscous cooked|3.8|23.2|0.2|175|65|
Bulgur cooked|3.1|18.6|0.2|180|45|
Pearl barley cooked|2.3|28.2|0.4|160|48|
Rolled oats dry|16.9|66.3|6.9|50|94|
Steel cut oats dry|12.5|67.5|7.5|50|72|
Pasta white cooked|5.8|30.9|0.9|180|88|
Pasta whole wheat cooked|5.3|27.4|1.4|180|74|
Rice noodles cooked|1.8|24.9|0.2|180|65|
Egg noodles cooked|4.5|25|2.1|180|55|
Whole wheat bread|12.5|43|4.2|70|91|
White bread|8.5|49|3.3|70|88|
Sourdough bread|9|49|2.2|70|82|
Rye bread|8.5|48|3.3|70|55|
Pita whole wheat|9.8|55|1.8|64|75|
Tortilla whole wheat|8|48|7|60|70|
Bagel plain|10|52|1.5|100|82|
English muffin whole wheat|10|45|2|60|68|
Potato russet baked|2.5|21|0.1|200|91|
Sweet potato baked|2|20.7|0.2|200|84|
Corn cooked|3.4|21|1.5|125|72|
Green peas cooked|5.4|15.6|0.4|125|75|
Lentils cooked|9|20|0.4|175|90|
Chickpeas cooked|8.9|27.4|2.6|165|88|
Black beans cooked|8.9|23.7|0.5|170|82|
Kidney beans cooked|8.7|22.8|0.5|170|76|
Navy beans cooked|8.2|26.1|0.6|170|60|
Pinto beans cooked|9|26|0.7|170|68|
Edamame cooked|11.9|8.9|5.2|155|72|
Tofu firm|17.3|2.8|8.7|150|78|
Tempeh cooked|19.9|7.6|11.4|150|52|
Broccoli steamed|2.4|7.2|0.4|150|88|
Cauliflower steamed|1.8|4.1|0.5|150|82|
Spinach cooked|3|3.8|0.3|150|74|
Kale cooked|1.9|5.6|0.4|150|55|
Green beans cooked|1.9|7.9|0.3|150|72|
Brussels sprouts roasted|3.4|9|1.2|150|58|
Carrots cooked|0.8|8.2|0.2|150|78|
Bell pepper raw|1|6|0.3|120|72|
Onion raw|1.1|9.3|0.1|100|86|
Tomato raw|0.9|3.9|0.2|150|88|
Cucumber raw|0.7|3.6|0.1|150|80|
Mushrooms cooked|3.6|5.3|0.5|150|70|
Zucchini cooked|1.1|2.7|0.4|150|68|
Eggplant cooked|0.8|8.7|0.2|150|55|
Cabbage cooked|1.3|5.5|0.1|150|65|
Avocado raw|2|8.5|14.7|100|86|
Banana raw|1.1|22.8|0.3|118|96|
Apple with skin|0.3|13.8|0.2|180|92|
Orange raw|0.9|11.8|0.1|140|88|
Blueberries raw|0.7|14.5|0.3|140|88|
Strawberries raw|0.7|7.7|0.3|150|90|
Raspberries raw|1.2|11.9|0.7|125|72|
Mango raw|0.8|15|0.4|165|84|
Pineapple raw|0.5|13.1|0.1|165|75|
Grapes raw|0.7|18.1|0.2|150|78|
Watermelon raw|0.6|7.6|0.2|250|80|
Pear raw|0.4|15.2|0.1|180|65|
Peach raw|0.9|9.5|0.3|150|68|
Almonds raw|21.2|21.6|49.9|30|86|
Walnuts raw|15.2|13.7|65.2|30|70|
Cashews roasted unsalted|15.3|32.7|46.4|30|78|
Pistachios roasted|21|28|45|30|72|
Peanuts roasted|25.8|16.1|49.2|30|82|
Peanut butter natural|25|20|50|32|92|
Almond butter|21|19|56|32|62|
Chia seeds|16.5|42.1|30.7|20|66|
Ground flaxseed|18.3|28.9|42.2|15|58|
Olive oil|0|0|100|14|88|
Canola oil|0|0|100|14|74|
Butter salted|0.9|0.1|81.1|14|82|
`.trim().split('\n').map(row => {
  const [name, p, c, f, portion, pop, tag] = row.split('|');
  return { name, p: +p, c: +c, f: +f, portion: +portion, pop: +pop, tags: tag ? [tag] : [] };
});

for (const food of groceryRows) {
  addScaled(food, 100, 'per 100 g', '100 g', -8);
  if (food.portion !== 100) addScaled(food, food.portion, 'common serving', `${food.portion} g`, 0);
}

const restaurantGroups = [
  {
    brands: ["McDonald's", "A&W", "Harvey's", "Wendy's", 'Five Guys', 'Dairy Queen'],
    items: [
      ['Classic Hamburger', 22, 34, 17, 190, 86], ['Classic Cheeseburger', 27, 35, 24, 220, 88],
      ['Double Cheeseburger', 39, 37, 35, 290, 80], ['Grilled Chicken Sandwich', 32, 42, 14, 240, 82],
      ['Crispy Chicken Sandwich', 28, 51, 25, 260, 80], ['Regular Fries', 5, 48, 16, 125, 90],
      ['Large Fries', 7, 67, 23, 180, 76], ['Garden Side Salad, No Dressing', 3, 9, 1, 160, 45],
      ['Vanilla Shake, Medium', 12, 91, 18, 500, 62], ['Chicken Strips, 3 Piece', 28, 24, 18, 180, 74]
    ]
  },
  {
    brands: ['Popeyes', 'KFC', "Mary Brown's", "Church's Chicken"],
    items: [
      ['Original Chicken Breast, 1 Piece', 35, 12, 18, 170, 85], ['Spicy Chicken Thigh, 1 Piece', 18, 10, 16, 110, 78],
      ['Chicken Tenders, 3 Piece', 30, 24, 20, 190, 88], ['Chicken Sandwich, Classic', 29, 49, 27, 250, 86],
      ['Chicken Sandwich, Spicy', 29, 51, 28, 255, 84], ['Regular Fries', 5, 43, 17, 130, 82],
      ['Mashed Potatoes and Gravy', 4, 28, 7, 160, 68], ['Coleslaw', 1, 18, 11, 120, 55],
      ['Biscuit', 4, 26, 10, 60, 66], ['Chicken Meal, 3 Piece with Fries', 54, 79, 49, 650, 72]
    ]
  },
  {
    brands: ['Pizza 73', 'Pizza Hut', "Domino's", 'Panago', 'Boston Pizza'],
    items: [
      ['Cheese Pizza, Large Slice', 13, 36, 12, 145, 86], ['Grilled Chicken Pizza, Large Slice', 16, 35, 11, 150, 78],
      ['Vegetable Pizza, Large Slice', 12, 38, 10, 150, 72], ['Beef and Mushroom Pizza, Large Slice', 16, 36, 14, 155, 62],
      ['BBQ Chicken Pizza, Large Slice', 16, 40, 12, 160, 76], ['Thin Crust Cheese Pizza, Slice', 11, 27, 9, 110, 68],
      ['Garlic Bread, 2 Pieces', 6, 36, 13, 100, 74], ['Cheese Bread, 4 Pieces', 18, 52, 25, 220, 66],
      ['Chicken Wings, 8 Piece', 48, 10, 35, 320, 72], ['Garden Salad with Dressing', 5, 18, 14, 250, 45]
    ]
  },
  {
    brands: ['Tim Hortons', 'Starbucks', 'Second Cup'],
    items: [
      ['Brewed Coffee, Black, Medium', 0.5, 0, 0, 400, 96], ['Coffee Double Double, Medium', 2, 34, 18, 400, 98],
      ['Latte with 2 Percent Milk, Medium', 13, 20, 7, 475, 88], ['Cappuccino with 2 Percent Milk, Medium', 10, 14, 5, 350, 76],
      ['Vanilla Latte, Medium', 12, 48, 7, 475, 78], ['Iced Coffee Sweetened, Medium', 3, 38, 9, 475, 84],
      ['Cold Brew, Black, Medium', 1, 2, 0, 475, 82], ['Plain Bagel with Cream Cheese', 13, 61, 15, 170, 82],
      ['Egg and Cheese Breakfast Sandwich', 17, 34, 18, 170, 88], ['Blueberry Muffin', 6, 62, 14, 120, 74]
    ]
  },
  {
    brands: ['Chipotle', 'Quesada', 'Mucho Burrito', 'Taco Bell'],
    items: [
      ['Chicken Burrito Bowl', 42, 75, 24, 620, 92], ['Double Chicken Burrito Bowl', 70, 75, 30, 760, 86],
      ['Steak Burrito Bowl', 40, 76, 28, 630, 78], ['Chicken Burrito', 44, 96, 29, 760, 90],
      ['Chicken Tacos, 3', 31, 48, 20, 420, 82], ['Bean and Cheese Burrito', 20, 78, 20, 520, 74],
      ['Chicken Quesadilla', 39, 52, 32, 430, 78], ['Chips and Guacamole', 7, 65, 32, 260, 70],
      ['Chicken Salad Bowl', 40, 34, 20, 510, 80], ['Black Beans, Side', 8, 22, 2, 130, 66]
    ]
  },
  {
    brands: ['Swiss Chalet', "Montana's", 'The Keg', 'Earls', 'JOEY'],
    items: [
      ['Grilled Chicken Breast Dinner', 52, 48, 22, 520, 84], ['Rotisserie Chicken Quarter, White Meat', 46, 8, 18, 300, 88],
      ['Sirloin Steak Dinner', 55, 52, 31, 560, 78], ['Grilled Salmon Dinner', 45, 48, 27, 500, 80],
      ['Chicken Caesar Salad', 42, 24, 31, 460, 80], ['Steak Salad', 40, 28, 29, 470, 66],
      ['Chicken Rice Bowl', 43, 72, 20, 600, 82], ['Beef Burger with Fries', 40, 82, 48, 600, 76],
      ['Vegetable Pasta', 19, 91, 22, 620, 58], ['Mashed Potatoes, Side', 5, 35, 10, 200, 60]
    ]
  },
  {
    brands: ['Subway'],
    items: [
      ['Grilled Chicken Sub, 6 Inch', 28, 48, 7, 240, 88], ['Grilled Chicken Sub, Footlong', 56, 96, 14, 480, 78],
      ['Turkey Breast Sub, 6 Inch', 25, 46, 5, 230, 84], ['Turkey Breast Sub, Footlong', 50, 92, 10, 460, 74],
      ['Steak and Cheese Sub, 6 Inch', 28, 49, 12, 260, 80], ['Steak and Cheese Sub, Footlong', 56, 98, 24, 520, 70],
      ['Tuna Sub, 6 Inch', 20, 47, 25, 260, 74], ['Tuna Sub, Footlong', 40, 94, 50, 520, 62],
      ['Veggie Delite Sub, 6 Inch', 8, 44, 3, 210, 68], ['Rotisserie Chicken Salad', 27, 18, 10, 350, 72],
      ['Chicken Teriyaki Rice Bowl', 32, 66, 12, 480, 68], ['Chocolate Chip Cookie, 1', 2, 30, 10, 45, 70]
    ]
  },
  {
    brands: ["Osmow's"],
    items: [
      ['Chicken on the Rocks, Regular', 42, 80, 22, 650, 90], ['Chicken on the Rocks, Large', 58, 108, 31, 850, 82],
      ['Chicken Half and Half, Regular', 40, 68, 24, 620, 86], ['Chicken Shawarma Wrap', 35, 54, 20, 400, 88],
      ['Chicken Shawarma Salad', 42, 22, 18, 500, 78], ['Beef Shawarma Rice Bowl', 37, 82, 28, 650, 70],
      ['Falafel Rice Bowl', 20, 96, 25, 650, 62], ['Chicken Shawarma Meat, Side', 38, 4, 15, 250, 72],
      ['Hummus, Side', 5, 16, 9, 90, 58], ['Garlic Sauce, Side', 1, 4, 18, 60, 52]
    ]
  },
  {
    brands: ['Freshii'],
    items: [
      ['Chicken Buddha Bowl', 39, 78, 21, 600, 78], ['Chicken Teriyaki Bowl', 40, 82, 18, 600, 76],
      ['Chicken Kale Caesar Salad', 38, 26, 24, 480, 72], ['Cobb Salad with Chicken', 41, 24, 27, 500, 70],
      ['Chicken Burrito', 36, 72, 20, 520, 72], ['Tofu Buddha Bowl', 24, 82, 22, 600, 58],
      ['Greek Yogurt Smoothie', 18, 58, 5, 500, 64], ['Green Fruit Smoothie', 5, 66, 3, 500, 60],
      ['Chicken Pocket', 31, 48, 16, 350, 62], ['Chia Pudding Cup', 9, 34, 14, 250, 50]
    ]
  },
  {
    brands: ['Booster Juice'],
    items: [
      ['Protein Smoothie, Regular', 28, 62, 8, 600, 78], ['Whey Protein Smoothie, Regular', 32, 68, 7, 600, 76],
      ['Berry Smoothie, Regular', 5, 76, 2, 600, 72], ['Mango Smoothie, Regular', 4, 82, 2, 600, 70],
      ['Banana Strawberry Smoothie, Regular', 6, 78, 3, 600, 74], ['Green Smoothie, Regular', 6, 66, 3, 600, 62],
      ['Peanut Butter Protein Smoothie', 30, 69, 16, 600, 74], ['Tropical Smoothie, Regular', 5, 84, 2, 600, 66],
      ['Whey Protein Booster', 20, 3, 1, 25, 58], ['Fresh Orange Juice, Regular', 3, 48, 0, 450, 58]
    ]
  },
  {
    brands: ['Edo Japan'],
    items: [
      ['Chicken Teriyaki Rice Meal', 38, 88, 16, 650, 84], ['Double Chicken Teriyaki Rice Meal', 64, 90, 22, 780, 76],
      ['Beef Teriyaki Rice Meal', 34, 88, 23, 650, 72], ['Chicken and Beef Teriyaki Meal', 38, 88, 21, 680, 74],
      ['Chicken Teriyaki Noodle Meal', 36, 94, 19, 680, 72], ['Sukiyaki Beef Noodle Meal', 32, 96, 23, 680, 64],
      ['Chicken Teriyaki Vegetable Meal', 41, 36, 15, 550, 74], ['Vegetable Tofu Rice Meal', 23, 86, 19, 650, 56],
      ['Edamame, Side', 11, 14, 5, 160, 58], ['California Roll, 8 Pieces', 9, 46, 8, 220, 62]
    ]
  }
];

for (const group of restaurantGroups) {
  for (const brand of group.brands) {
    for (const [name, protein, carbs, fat, grams, pop] of group.items) {
      add({
        name,
        brand,
        cat: 'restaurant',
        serving: '1 restaurant order',
        grams,
        protein,
        carbs,
        fat,
        pop,
        tags: ['chain-estimate'],
        src: `estimated from a typical ${brand} menu item and comparable published chain nutrition; exact Canadian item data was unavailable`
      });
    }
  }
}

const curryStyles = [
  ['Curry', 12, 8, 300, 84], ['Bhuna', 9, 12, 280, 65], ['Korma', 14, 18, 320, 72],
  ['Karahi', 10, 13, 300, 78], ['Jalfrezi', 14, 9, 320, 58], ['Madras Curry', 13, 11, 310, 55],
  ['Saag', 11, 12, 320, 60], ['Vindaloo', 15, 10, 310, 52], ['Tikka Masala', 18, 16, 330, 82],
  ['Rezala', 10, 15, 310, 48], ['Shatkora Curry', 10, 11, 310, 42], ['Do Pyaza', 16, 12, 320, 45]
];
const curryProteins = [
  ['Chicken', 40, 5, 8], ['Beef', 35, 3, 15], ['Lamb', 32, 2, 19], ['Goat', 34, 2, 10],
  ['Fish', 34, 2, 9], ['Shrimp', 32, 2, 5], ['Paneer', 25, 6, 22], ['Chickpea', 15, 34, 5]
];
for (const [proteinName, baseProtein, baseCarbs, baseFat] of curryProteins) {
  for (const [style, sauceCarbs, sauceFat, grams, pop] of curryStyles) {
    add({
      name: `${proteinName} ${style}`,
      cat: 'recipe',
      serving: '1 bowl without rice or bread',
      grams,
      protein: baseProtein,
      carbs: baseCarbs + sauceCarbs,
      fat: baseFat + sauceFat,
      pop: pop - (proteinName === 'Chicken' ? 0 : proteinName === 'Beef' ? 5 : 12),
      tags: ['south-asian'],
      src: 'estimated from a typical South Asian restaurant portion; recipes and oil use vary widely'
    });
  }
}

const southAsianRows = `
Chicken biryani, restaurant portion|38|92|24|550|94
Beef biryani, restaurant portion|34|91|29|550|76
Goat biryani, restaurant portion|32|90|26|550|70
Fish biryani, restaurant portion|31|92|20|550|48
Vegetable biryani, restaurant portion|13|101|19|550|68
Chicken tehari|35|88|23|520|78
Beef tehari|32|86|27|520|66
Plain khichuri|16|85|15|500|74
Chicken khichuri|34|82|20|550|82
Beef khichuri|32|80|25|550|64
Moong dal khichuri|20|83|14|520|68
Masoor dal|18|42|9|350|82
Moong dal|19|40|8|350|78
Chana dal|20|45|10|350|80
Toor dal|19|43|9|350|64
Dal makhani|19|47|22|380|76
Cholar dal|17|49|12|360|58
Haleem chicken|34|48|16|420|66
Haleem beef|32|47|22|420|70
Nihari beef|36|18|27|400|72
Keema beef|36|18|24|350|76
Keema chicken|40|17|15|350|72
Keema peas beef|34|28|22|380|68
Tandoori chicken breast|50|10|12|260|90
Tandoori chicken leg|38|9|18|260|82
Chicken tikka skewers|45|12|13|260|88
Beef seekh kebab, 2 skewers|35|10|24|240|76
Chicken seekh kebab, 2 skewers|39|12|16|240|80
Lamb seekh kebab, 2 skewers|32|10|27|240|62
Shami kebab beef, 2 pieces|25|18|19|200|58
Chapli kebab beef, 2 pieces|34|15|26|260|66
Reshmi kebab chicken|42|11|15|250|62
Chicken malai tikka|43|12|22|270|74
Chicken 65|38|28|25|300|70
Butter chicken|36|20|28|350|88
Palak paneer|24|22|25|350|74
Matar paneer|23|30|24|360|68
Chana masala|17|48|11|350|82
Rajma masala|18|50|10|360|74
Aloo gobi|9|46|13|350|72
Baingan bharta|7|32|14|350|55
Bhindi masala|8|30|16|320|58
Mixed vegetable bhaji|8|34|12|350|72
Saag bhaji|9|22|11|320|55
Rui macher jhol|35|18|16|350|65
Tilapia macher jhol|38|16|12|350|70
Salmon shorshe|38|14|25|350|58
Shrimp bhuna|35|18|13|320|66
Ilish bhapa|31|10|29|300|48
Plain basmati rice, 1 cup|4|45|0.5|180|96
Jeera rice, 1 cup|4|47|7|190|76
Pulao rice, 1 cup|5|49|11|210|72
Peas pulao, 1 cup|7|54|9|220|70
Naan plain, 1 piece|9|48|6|120|90
Garlic naan, 1 piece|10|51|9|130|84
Butter naan, 1 piece|9|50|12|130|78
Whole wheat roti, 1 piece|4|22|2|50|92
Chapati, 1 piece|4|21|2|50|86
Paratha plain, 1 piece|6|40|15|100|82
Aloo paratha, 1 piece|8|52|17|150|78
Dal paratha, 1 piece|9|48|14|140|62
Chicken samosa, 1 piece|7|20|9|90|74
Vegetable samosa, 1 piece|4|22|10|90|82
Beef samosa, 1 piece|7|19|10|90|64
Pakora vegetable, 5 pieces|7|38|18|180|70
Onion bhaji, 4 pieces|6|34|17|170|66
Raita cucumber, half cup|5|8|4|125|68
Mint chutney, 2 tablespoons|1|6|1|30|52
Tamarind chutney, 2 tablespoons|0|16|0|30|50
Mango lassi, regular|9|62|8|400|76
Salt lassi, regular|9|18|7|400|48
Falafel wrap|18|65|22|350|82
Chicken shawarma wrap|36|55|21|400|92
Beef shawarma wrap|32|54|25|400|78
Chicken shawarma rice platter|48|92|28|700|90
Beef shawarma rice platter|42|91|33|700|74
Chicken shawarma salad|44|22|20|500|80
Falafel rice platter|21|105|26|700|68
Hummus, quarter cup|5|16|9|60|82
Baba ghanoush, quarter cup|2|10|7|60|56
Tabbouleh, one cup|5|28|14|180|62
Fattoush salad|6|28|16|300|55
Chicken souvlaki platter|48|65|25|650|78
Chicken kofta platter|43|70|29|650|65
Beef kofta platter|39|68|34|650|62
Lentil soup|15|34|6|400|72
Chicken lentil soup|28|32|8|400|68
`.trim().split('\n');
for (const row of southAsianRows) {
  const [name, protein, carbs, fat, grams, pop] = row.split('|');
  add({ name, cat: 'recipe', serving: '1 stated serving', grams: +grams, protein: +protein, carbs: +carbs, fat: +fat, pop: +pop, tags: ['south-asian-or-middle-eastern'], src: 'estimated from a typical restaurant or home-style portion; recipe and oil use vary' });
}

const packagedGroups = [
  {
    brands: ["President's Choice", 'No Name', 'Compliments', 'Great Value', 'Kirkland Signature'],
    items: [
      ['Frozen Chicken Breast Strips', 30, 8, 5, 150, 72], ['Frozen Mixed Vegetables', 4, 18, 1, 180, 68],
      ['Canned Black Beans, Drained', 8, 22, 1, 125, 72], ['Canned Chickpeas, Drained', 8, 24, 2, 125, 74],
      ['Natural Peanut Butter', 8, 6, 16, 32, 80], ['Large Rolled Oats', 7, 33, 4, 50, 82],
      ['Basmati Rice, Dry', 4, 36, 0.5, 50, 82], ['Whole Wheat Pasta, Dry', 7, 35, 1.5, 56, 70],
      ['Canned Tuna in Water', 26, 0, 1, 120, 82], ['Extra Virgin Olive Oil', 0, 0, 14, 14, 70],
      ['Plain Greek Yogurt', 18, 7, 2, 175, 80], ['Frozen Blueberries', 1, 18, 0, 140, 66]
    ]
  },
  {
    brands: ['Quaker', "Kellogg's", 'General Mills', "Nature's Path"],
    items: [
      ['Original Oatmeal', 5, 27, 3, 40, 88], ['Maple Oatmeal', 4, 33, 3, 43, 72],
      ['High Protein Oatmeal', 10, 31, 4, 50, 78], ['Whole Grain Breakfast Cereal', 4, 34, 2, 40, 76],
      ['Bran Breakfast Cereal', 5, 32, 2, 45, 66], ['Granola with Almonds', 6, 35, 10, 55, 62],
      ['Honey Oat Cereal', 3, 34, 2, 40, 72], ['Protein Granola', 10, 31, 9, 55, 64]
    ]
  },
  {
    brands: ['Olympic', 'Liberte', 'Astro'],
    items: [
      ['Plain Greek Yogurt 0 Percent', 18, 7, 0, 175, 84], ['Plain Greek Yogurt 2 Percent', 17, 7, 4, 175, 78],
      ['Vanilla Greek Yogurt', 16, 20, 2, 175, 74], ['Plain Skyr', 19, 8, 0, 175, 72],
      ['Vanilla Skyr', 17, 18, 0, 175, 68], ['Cottage Cheese 2 Percent', 16, 5, 3, 125, 72],
      ['Plain Yogurt 2 Percent', 11, 9, 4, 175, 70], ['Vanilla Yogurt Cup', 9, 24, 3, 175, 68]
    ]
  },
  {
    brands: ['Silk'],
    items: [
      ['Unsweetened Soy Beverage, 1 Cup', 8, 4, 4, 250, 72], ['Original Soy Beverage, 1 Cup', 8, 9, 4, 250, 68],
      ['Vanilla Soy Beverage, 1 Cup', 8, 14, 4, 250, 64], ['Unsweetened Almond Beverage, 1 Cup', 1, 2, 3, 250, 70],
      ['Original Almond Beverage, 1 Cup', 1, 8, 3, 250, 64], ['Unsweetened Oat Beverage, 1 Cup', 3, 15, 4, 250, 66],
      ['Vanilla Oat Beverage, 1 Cup', 3, 22, 4, 250, 58], ['Chocolate Soy Beverage, 1 Cup', 8, 24, 4, 250, 60]
    ]
  },
  {
    brands: ['Natrel'],
    items: [
      ['Skim Milk, 1 Cup', 9, 13, 0, 250, 76], ['Milk 1 Percent, 1 Cup', 9, 13, 2.5, 250, 78],
      ['Milk 2 Percent, 1 Cup', 9, 13, 5, 250, 82], ['Whole Milk, 1 Cup', 8, 12, 8, 250, 72],
      ['Lactose Free Milk 2 Percent, 1 Cup', 9, 13, 5, 250, 68], ['Chocolate Milk, 1 Cup', 9, 27, 5, 250, 68],
      ['High Protein Milk, 1 Cup', 18, 12, 3, 250, 72], ['Half and Half Cream, 2 Tablespoons', 1, 2, 3, 30, 52]
    ]
  },
  {
    brands: ["Chapman's"],
    items: [
      ['Vanilla Ice Cream, Half Cup', 3, 28, 8, 125, 64], ['Chocolate Ice Cream, Half Cup', 3, 30, 8, 125, 62],
      ['Strawberry Ice Cream, Half Cup', 3, 29, 7, 125, 56], ['Vanilla Frozen Yogurt, Half Cup', 4, 27, 3, 125, 54],
      ['Chocolate Frozen Yogurt, Half Cup', 4, 29, 3, 125, 52], ['Vanilla Ice Cream Bar', 3, 24, 8, 80, 58],
      ['Chocolate Ice Cream Bar', 3, 26, 10, 90, 56], ['Fruit Ice Pop', 0, 18, 0, 75, 48]
    ]
  },
  {
    brands: ["Dempster's", 'Villaggio', 'Wonder'],
    items: [
      ['Whole Wheat Bread, 2 Slices', 8, 34, 3, 70, 86], ['White Bread, 2 Slices', 6, 36, 2, 70, 82],
      ['Multigrain Bread, 2 Slices', 8, 32, 4, 75, 76], ['Sourdough Bread, 2 Slices', 7, 38, 2, 80, 70],
      ['Whole Wheat Tortilla, Large', 7, 40, 6, 70, 68], ['Plain Bagel', 10, 52, 2, 100, 78],
      ['Everything Bagel', 10, 52, 3, 105, 72], ['English Muffin', 6, 27, 1, 60, 66]
    ]
  },
  {
    brands: ["Campbell's", "President's Choice", 'Compliments'],
    items: [
      ['Chicken Noodle Soup, 1 Can', 15, 32, 8, 500, 72], ['Tomato Soup, 1 Can', 5, 42, 4, 500, 68],
      ['Lentil Soup, 1 Can', 18, 54, 6, 500, 74], ['Minestrone Soup, 1 Can', 12, 48, 5, 500, 62],
      ['Butter Chicken Sauce, Half Cup', 3, 16, 12, 125, 70], ['Tikka Masala Sauce, Half Cup', 3, 14, 11, 125, 68],
      ['Pasta Sauce Tomato Basil, Half Cup', 2, 12, 2, 125, 72], ['Low Sodium Chicken Broth, 1 Cup', 5, 1, 1, 250, 58]
    ]
  },
  {
    brands: ['Oikos', 'iOGO'],
    items: [
      ['Plain Greek Yogurt Cup', 17, 7, 0, 175, 82], ['Vanilla Greek Yogurt Cup', 16, 19, 1, 175, 74],
      ['High Protein Yogurt Cup', 18, 11, 1, 175, 78], ['Plain Yogurt 2 Percent', 11, 9, 4, 175, 70],
      ['Vanilla Yogurt Cup', 9, 24, 3, 175, 68], ['Strawberry Greek Yogurt Cup', 15, 20, 1, 175, 68],
      ['Mixed Berry Greek Yogurt Cup', 15, 19, 1, 175, 66], ['Plain Greek Yogurt 2 Percent', 16, 7, 4, 175, 74]
    ]
  },
  {
    brands: ['Dairyland', 'Neilson'],
    items: [
      ['Skim Milk, 1 Cup', 9, 13, 0, 250, 76], ['Milk 1 Percent, 1 Cup', 9, 13, 2.5, 250, 78],
      ['Milk 2 Percent, 1 Cup', 9, 13, 5, 250, 82], ['Whole Milk, 1 Cup', 8, 12, 8, 250, 72],
      ['Lactose Free Milk 2 Percent, 1 Cup', 9, 13, 5, 250, 66], ['Chocolate Milk, 1 Cup', 9, 27, 5, 250, 68],
      ['Coffee Cream 10 Percent, 2 Tablespoons', 1, 2, 3, 30, 52], ['Half and Half Cream, 2 Tablespoons', 1, 2, 3, 30, 54]
    ]
  },
  {
    brands: ["Earth's Own"],
    items: [
      ['Unsweetened Oat Beverage, 1 Cup', 3, 16, 5, 250, 72], ['Original Oat Beverage, 1 Cup', 3, 20, 5, 250, 68],
      ['Vanilla Oat Beverage, 1 Cup', 3, 23, 5, 250, 64], ['Unsweetened Almond Beverage, 1 Cup', 1, 2, 3, 250, 68],
      ['Original Almond Beverage, 1 Cup', 1, 8, 3, 250, 60], ['Unsweetened Soy Beverage, 1 Cup', 8, 4, 4, 250, 70],
      ['Barista Oat Beverage, 1 Cup', 3, 20, 7, 250, 54], ['Chocolate Oat Beverage, 1 Cup', 3, 29, 5, 250, 58]
    ]
  }
];
for (const group of packagedGroups) {
  for (const brand of group.brands) {
    for (const [name, protein, carbs, fat, grams, pop] of group.items) {
      add({ name, brand, cat: 'grocery', serving: '1 package-label serving', grams, protein, carbs, fat, pop, tags: ['packaged'], src: `estimated from typical Canadian ${brand} package-label values; verify the current package for exact nutrition` });
    }
  }
}

const supplementGroups = [
  ['Optimum Nutrition', [
    ['Gold Standard Whey Chocolate, 1 Scoop', 24, 4, 2, 32, 92], ['Gold Standard Whey Vanilla, 1 Scoop', 24, 4, 1, 31, 88],
    ['Gold Standard Whey Mocha, 1 Scoop', 24, 4, 2, 32, 80], ['Gold Standard Isolate Chocolate, 1 Scoop', 25, 2, 1, 31, 84],
    ['Gold Standard Casein Chocolate, 1 Scoop', 24, 5, 1, 34, 70], ['Gold Standard Casein Vanilla, 1 Scoop', 24, 5, 1, 34, 66],
    ['Gold Standard Whey Chocolate, Half Scoop', 12, 2, 1, 16, 62], ['Gold Standard Whey Vanilla, Half Scoop', 12, 2, 0.5, 16, 60]
  ]],
  ['Quest', [
    ['Protein Bar Chocolate Brownie', 20, 23, 7, 60, 82], ['Protein Bar Chocolate Chip Cookie Dough', 20, 22, 8, 60, 84],
    ['Protein Bar Cookies and Cream', 20, 22, 8, 60, 78], ['Protein Bar Peanut Butter', 20, 22, 9, 60, 72],
    ['Protein Chips Nacho Cheese', 19, 5, 6, 32, 72], ['Protein Chips Ranch', 19, 5, 6, 32, 66],
    ['Protein Shake Chocolate', 30, 5, 3, 325, 68], ['Protein Shake Vanilla', 30, 5, 3, 325, 66]
  ]],
  ['Pure Protein', [
    ['Protein Bar Chocolate Deluxe', 21, 18, 5, 50, 78], ['Protein Bar Chocolate Peanut Butter', 20, 19, 6, 50, 76],
    ['Protein Bar Cookies and Cream', 20, 18, 6, 50, 72], ['Protein Bar Chewy Chocolate Chip', 20, 19, 6, 50, 70],
    ['Protein Shake Chocolate', 30, 6, 3, 325, 74], ['Protein Shake Vanilla', 30, 6, 3, 325, 72],
    ['Whey Protein Chocolate, 1 Scoop', 25, 5, 2, 35, 68], ['Whey Protein Vanilla, 1 Scoop', 25, 5, 2, 35, 66]
  ]],
  ['Simply Protein', [
    ['Crispy Protein Bar Dark Chocolate', 12, 18, 5, 40, 68], ['Crispy Protein Bar Lemon Coconut', 12, 18, 5, 40, 62],
    ['Crispy Protein Bar Peanut Butter', 12, 17, 6, 40, 66], ['Crispy Protein Bar Chocolate Mint', 12, 18, 5, 40, 58],
    ['Snack Bar Dark Chocolate Almond', 10, 20, 7, 45, 54], ['Snack Bar Lemon Coconut', 10, 20, 7, 45, 52],
    ['Protein Bites Chocolate', 10, 18, 7, 45, 50], ['Protein Bites Peanut Butter', 10, 17, 8, 45, 52]
  ]],
  ['ONE', [
    ['Protein Bar Maple Glazed Doughnut', 20, 23, 8, 60, 70], ['Protein Bar Birthday Cake', 20, 23, 8, 60, 68],
    ['Protein Bar Peanut Butter Pie', 20, 23, 9, 60, 66], ['Protein Bar Almond Bliss', 20, 22, 9, 60, 58],
    ['Protein Bar Chocolate Brownie', 20, 23, 8, 60, 64], ['Protein Bar Cinnamon Roll', 20, 24, 8, 60, 56],
    ['Protein Bar Cookies and Cream', 20, 23, 8, 60, 62], ['Protein Bar Fruity Cereal', 20, 24, 8, 60, 50]
  ]],
  ['Premier Protein', [
    ['Protein Shake Chocolate', 30, 5, 3, 325, 86], ['Protein Shake Vanilla', 30, 5, 3, 325, 84],
    ['Protein Shake Caramel', 30, 5, 3, 325, 80], ['Protein Shake Cafe Latte', 30, 5, 3, 325, 82],
    ['Protein Shake Strawberries and Cream', 30, 6, 3, 325, 72], ['Protein Shake Cookies and Cream', 30, 6, 3, 325, 70],
    ['Whey Protein Chocolate, 1 Scoop', 30, 4, 2, 41, 72], ['Whey Protein Vanilla, 1 Scoop', 30, 4, 2, 41, 70]
  ]],
  ['Fairlife', [
    ['Core Power Chocolate, 26 g Protein', 26, 8, 4, 414, 84], ['Core Power Vanilla, 26 g Protein', 26, 8, 4, 414, 82],
    ['Core Power Strawberry, 26 g Protein', 26, 9, 4, 414, 72], ['Core Power Elite Chocolate, 42 g Protein', 42, 9, 4, 414, 78],
    ['Core Power Elite Vanilla, 42 g Protein', 42, 9, 4, 414, 76], ['Nutrition Plan Chocolate Shake', 30, 4, 2.5, 340, 80],
    ['Nutrition Plan Vanilla Shake', 30, 4, 2.5, 340, 78], ['High Protein Chocolate Milk, 1 Cup', 13, 12, 4.5, 250, 68]
  ]],
  ['Kirkland Signature', [
    ['Protein Bar Chocolate Brownie', 21, 22, 7, 60, 74], ['Protein Bar Chocolate Chip Cookie Dough', 21, 22, 7, 60, 76],
    ['Protein Bar Cookies and Cream', 21, 23, 7, 60, 68], ['Protein Bar Peanut Butter Chunk', 21, 22, 8, 60, 66],
    ['Whey Protein Chocolate, 1 Scoop', 25, 4, 2, 34, 74], ['Whey Protein Vanilla, 1 Scoop', 25, 4, 2, 34, 72],
    ['Whey Protein Chocolate, Half Scoop', 12.5, 2, 1, 17, 58], ['Whey Protein Vanilla, Half Scoop', 12.5, 2, 1, 17, 56]
  ]]
];
for (const [brand, items] of supplementGroups) {
  for (const [name, protein, carbs, fat, grams, pop] of items) {
    add({ name, brand, cat: 'supplement', serving: '1 stated serving', grams, protein, carbs, fat, pop, tags: ['protein-supplement'], src: `estimated from typical ${brand} product-label values; formulations vary, so verify the current label` });
  }
}
add({ name: 'Creatine Monohydrate, 3 g', cat: 'supplement', serving: '3 g scoop', grams: 3, protein: 0, carbs: 0, fat: 0, pop: 86, tags: ['creatine'], src: 'creatine monohydrate contains no energy-yielding macronutrients' });
add({ name: 'Creatine Monohydrate, 5 g', cat: 'supplement', serving: '5 g scoop', grams: 5, protein: 0, carbs: 0, fat: 0, pop: 100, tags: ['creatine'], src: 'creatine monohydrate contains no energy-yielding macronutrients' });
add({ name: 'Electrolyte Powder, Sugar Free', cat: 'supplement', serving: '1 packet in water', grams: 5, protein: 0, carbs: 1, fat: 0, pop: 54, tags: ['electrolyte'], src: 'estimated from typical sugar-free electrolyte packet labels' });
add({ name: 'Trace Mineral Electrolyte Capsule', cat: 'supplement', serving: '1 capsule', grams: 1, protein: 0, carbs: 0, fat: 0, pop: 0, tags: ['electrolyte'], src: 'mineral capsule contains no energy-yielding macronutrients' });

const drinkGroups = [
  ['Coca-Cola', [
    ['Original Cola, 355 mL', 0, 39, 0, 355, 90], ['Original Cola, 500 mL', 0, 55, 0, 500, 82],
    ['Zero Sugar Cola, 355 mL', 0, 0, 0, 355, 90], ['Zero Sugar Cola, 500 mL', 0, 0, 0, 500, 86],
    ['Diet Cola, 355 mL', 0, 0, 0, 355, 84], ['Cherry Cola, 355 mL', 0, 42, 0, 355, 62],
    ['Vanilla Cola, 355 mL', 0, 42, 0, 355, 54], ['Mini Cola, 222 mL', 0, 25, 0, 222, 60]
  ]],
  ['Pepsi', [
    ['Original Cola, 355 mL', 0, 41, 0, 355, 84], ['Original Cola, 591 mL', 0, 69, 0, 591, 74],
    ['Zero Sugar Cola, 355 mL', 0, 0, 0, 355, 82], ['Zero Sugar Cola, 591 mL', 0, 0, 0, 591, 76],
    ['Diet Cola, 355 mL', 0, 0, 0, 355, 78], ['Cherry Cola, 355 mL', 0, 43, 0, 355, 54],
    ['Lime Cola, 355 mL', 0, 41, 0, 355, 48], ['Mini Cola, 222 mL', 0, 26, 0, 222, 56]
  ]],
  ['Gatorade', [
    ['Sports Drink Lemon Lime, 591 mL', 0, 36, 0, 591, 78], ['Sports Drink Orange, 591 mL', 0, 36, 0, 591, 76],
    ['Sports Drink Fruit Punch, 591 mL', 0, 36, 0, 591, 74], ['Sports Drink Glacier Freeze, 591 mL', 0, 36, 0, 591, 72],
    ['Zero Lemon Lime, 591 mL', 0, 2, 0, 591, 72], ['Zero Orange, 591 mL', 0, 2, 0, 591, 70],
    ['Zero Glacier Freeze, 591 mL', 0, 2, 0, 591, 70], ['Electrolyte Powder, 1 Packet', 0, 22, 0, 35, 58]
  ]],
  ['Powerade', [
    ['Sports Drink Mountain Berry, 591 mL', 0, 35, 0, 591, 70], ['Sports Drink Fruit Punch, 591 mL', 0, 35, 0, 591, 68],
    ['Sports Drink Orange, 591 mL', 0, 35, 0, 591, 66], ['Sports Drink Grape, 591 mL', 0, 35, 0, 591, 62],
    ['Zero Mountain Berry, 591 mL', 0, 2, 0, 591, 68], ['Zero Fruit Punch, 591 mL', 0, 2, 0, 591, 64],
    ['Zero Orange, 591 mL', 0, 2, 0, 591, 62], ['Electrolyte Powder, 1 Packet', 0, 22, 0, 35, 52]
  ]],
  ['Red Bull', [
    ['Energy Drink Original, 250 mL', 1, 28, 0, 250, 82], ['Energy Drink Original, 355 mL', 1, 40, 0, 355, 74],
    ['Sugar Free Energy Drink, 250 mL', 1, 3, 0, 250, 80], ['Zero Energy Drink, 250 mL', 1, 2, 0, 250, 72],
    ['Tropical Energy Drink, 250 mL', 1, 29, 0, 250, 58], ['Watermelon Energy Drink, 250 mL', 1, 29, 0, 250, 56],
    ['Blueberry Energy Drink, 250 mL', 1, 29, 0, 250, 54], ['Peach Energy Drink, 250 mL', 1, 29, 0, 250, 52]
  ]],
  ['Monster', [
    ['Energy Drink Original, 473 mL', 0, 54, 0, 473, 78], ['Zero Ultra Energy Drink, 473 mL', 0, 3, 0, 473, 82],
    ['Ultra Sunrise Energy Drink, 473 mL', 0, 3, 0, 473, 66], ['Ultra Paradise Energy Drink, 473 mL', 0, 3, 0, 473, 64],
    ['Mango Energy Drink, 473 mL', 0, 56, 0, 473, 62], ['Pipeline Punch Energy Drink, 473 mL', 0, 55, 0, 473, 58],
    ['Coffee Energy Drink, 444 mL', 10, 45, 8, 444, 60], ['Rehab Tea Energy Drink, 458 mL', 0, 8, 0, 458, 56]
  ]],
  ['Starbucks', [
    ['Bottled Frappuccino Coffee, 405 mL', 6, 51, 4, 405, 70], ['Bottled Frappuccino Mocha, 405 mL', 6, 53, 4, 405, 68],
    ['Bottled Frappuccino Vanilla, 405 mL', 6, 54, 4, 405, 66], ['Doubleshot Coffee Drink, 444 mL', 10, 34, 6, 444, 64],
    ['Cold Brew Black, 325 mL', 1, 2, 0, 325, 72], ['Cold Brew Vanilla Sweet Cream, 325 mL', 3, 18, 5, 325, 68],
    ['Iced Latte Vanilla, 414 mL', 8, 34, 5, 414, 66], ['Iced Latte Mocha, 414 mL', 8, 38, 6, 414, 64]
  ]],
  ['Tim Hortons', [
    ['Ready-to-Drink Iced Coffee Original, 340 mL', 5, 33, 5, 340, 72], ['Ready-to-Drink Iced Coffee Vanilla, 340 mL', 5, 37, 5, 340, 68],
    ['Ready-to-Drink Iced Coffee Mocha, 340 mL', 5, 38, 6, 340, 66], ['Cold Brew Black, 340 mL', 1, 2, 0, 340, 68],
    ['Cold Brew Vanilla Cream, 340 mL', 3, 19, 5, 340, 64], ['Ready-to-Drink Double Double, 340 mL', 4, 35, 10, 340, 76],
    ['French Vanilla Beverage, 340 mL', 5, 48, 8, 340, 70], ['Hot Chocolate Beverage, 340 mL', 5, 43, 7, 340, 66]
  ]],
  ['Silk', [
    ['Soy Beverage Original, 946 mL', 30, 34, 16, 946, 54], ['Soy Beverage Unsweetened, 946 mL', 30, 15, 16, 946, 56],
    ['Soy Beverage Vanilla, 946 mL', 30, 53, 16, 946, 52], ['Almond Beverage Original, 946 mL', 4, 30, 11, 946, 54],
    ['Almond Beverage Unsweetened, 946 mL', 4, 8, 11, 946, 58], ['Oat Beverage Original, 946 mL', 11, 76, 15, 946, 52],
    ['Oat Beverage Unsweetened, 946 mL', 11, 57, 15, 946, 54], ['Chocolate Soy Beverage, 946 mL', 30, 91, 16, 946, 50]
  ]],
  ['Tropicana', [
    ['Orange Juice, 250 mL', 2, 26, 0, 250, 78], ['Orange Juice with Calcium, 250 mL', 2, 26, 0, 250, 68],
    ['Orange Juice with Pulp, 250 mL', 2, 26, 0, 250, 66], ['Low Acid Orange Juice, 250 mL', 2, 26, 0, 250, 58],
    ['Apple Juice, 250 mL', 0, 29, 0, 250, 64], ['Lemonade, 250 mL', 0, 30, 0, 250, 60],
    ['Fruit Punch, 250 mL', 0, 31, 0, 250, 56], ['Orange Mango Juice, 250 mL', 1, 28, 0, 250, 62]
  ]]
];
for (const [brand, items] of drinkGroups) {
  for (const [name, protein, carbs, fat, grams, pop] of items) {
    add({ name, brand, cat: 'grocery', serving: '1 bottle or can', grams, protein, carbs, fat, pop, tags: ['drink'], src: `estimated from typical ${brand} beverage-label values; verify the current package` });
  }
}
const genericDrinks = `
Black coffee, 250 mL|0.3|0|0|250|98
Coffee with 2 percent milk|2|3|1|300|90
Coffee with cream and sugar|1|20|9|300|86
Americano, medium|1|2|0|350|80
Latte, medium|12|18|7|475|86
Cappuccino, medium|9|13|5|350|72
Iced coffee sweetened|3|36|8|475|80
Cold brew black|1|2|0|475|78
Masala chai with milk|6|28|6|350|84
Black tea plain|0|0|0|300|74
Green tea plain|0|0|0|300|68
Tea with milk and sugar|3|18|3|300|88
Orange juice|2|26|0|250|80
Apple juice|0|29|0|250|70
Mango juice|1|35|0|250|74
Coconut water|1|11|0|330|62
Sparkling water|0|0|0|355|76
Lemon water|0|1|0|500|66
Protein coffee|25|12|3|400|72
Hot chocolate with milk|9|40|8|350|68
`.trim().split('\n');
for (const row of genericDrinks) {
  const [name, protein, carbs, fat, grams, pop] = row.split('|');
  add({ name, cat: 'recipe', serving: '1 drink', grams: +grams, protein: +protein, carbs: +carbs, fat: +fat, pop: +pop, tags: ['drink'], src: 'estimated from a typical prepared serving; milk, sweetener, and recipe amounts vary' });
}

const mealProteins = [
  ['Grilled chicken breast', 46, 0, 6, 96], ['Roasted chicken thigh', 38, 0, 14, 84],
  ['Lean ground beef', 38, 0, 15, 82], ['Lean ground turkey', 40, 0, 10, 78],
  ['Baked salmon', 38, 0, 19, 86], ['Baked tilapia', 40, 0, 4, 76],
  ['Canned tuna', 36, 0, 2, 80], ['Firm tofu', 24, 5, 13, 60],
  ['Lentils', 18, 40, 1, 72], ['Chickpeas', 16, 45, 5, 68]
];
const mealCarbs = [
  ['white rice', 4, 56, 1, 180], ['basmati rice', 5, 52, 1, 180], ['brown rice', 5, 46, 2, 180],
  ['quinoa', 8, 39, 4, 185], ['roasted potatoes', 5, 44, 7, 220], ['whole wheat pasta', 9, 49, 3, 180]
];
for (const [proteinName, p1, c1, f1, pop] of mealProteins) {
  for (const [carbName, p2, c2, f2, grams] of mealCarbs) {
    add({
      name: `${proteinName} with ${carbName} and vegetables`,
      cat: 'recipe',
      serving: '1 meal-prep bowl',
      grams: grams + 300,
      protein: p1 + p2 + 4,
      carbs: c1 + c2 + 14,
      fat: f1 + f2 + 5,
      pop: pop,
      tags: ['home-cooked', 'meal-prep'],
      src: 'estimated from standard cooked portions: 150 g protein, one cup starch, vegetables, and one teaspoon oil'
    });
  }
}

const homeMeals = `
Chicken stir-fry with rice|45|68|17|550|88
Beef stir-fry with rice|39|68|23|550|78
Turkey chili with beans|42|48|14|500|80
Beef chili with beans|38|48|20|500|76
Chicken fajita bowl|45|62|18|550|82
Beef fajita bowl|39|62|24|550|72
Chicken pasta with tomato sauce|48|72|14|600|84
Turkey meat sauce pasta|42|75|17|600|72
Salmon quinoa bowl|42|48|24|550|78
Tuna pasta salad|38|68|18|500|70
Chicken noodle soup, large bowl|35|42|10|550|74
Beef and barley soup, large bowl|31|44|13|550|62
Lentil soup, large bowl|22|56|8|550|76
Chicken vegetable soup, large bowl|36|24|9|550|78
Chicken fried rice, home style|40|78|19|550|84
Shrimp fried rice, home style|34|80|17|550|68
Egg fried rice, home style|22|82|18|550|78
Chicken and chickpea salad|44|38|18|500|72
Tuna and white bean salad|38|42|14|500|64
Greek yogurt overnight oats|28|58|10|400|84
Protein oatmeal with berries|32|55|9|400|86
Egg white vegetable scramble|34|16|7|400|88
Whole egg vegetable scramble|28|17|22|400|82
Chicken breakfast hash|42|45|18|500|68
Turkey breakfast hash|40|45|16|500|64
Greek yogurt fruit bowl|24|42|5|400|88
Cottage cheese fruit bowl|28|38|6|400|84
Protein pancakes with berries|34|52|10|420|82
Chicken wrap with vegetables|42|48|16|420|84
Tuna wrap with vegetables|36|46|13|420|74
Beef burrito bowl, home style|40|72|20|600|76
Chicken burrito bowl, home style|46|72|15|600|88
Tofu burrito bowl, home style|28|78|18|600|58
Lentil curry with basmati rice|24|92|14|600|82
Chickpea curry with basmati rice|23|98|16|600|80
Chicken curry with basmati rice|46|76|20|600|90
Beef curry with basmati rice|40|76|26|600|76
Fish curry with basmati rice|42|75|18|600|72
Chicken kebab plate, home style|48|64|18|600|78
Beef kebab plate, home style|42|64|25|600|68
`.trim().split('\n');
for (const row of homeMeals) {
  const [name, protein, carbs, fat, grams, pop] = row.split('|');
  add({ name, cat: 'recipe', serving: '1 home-cooked portion', grams: +grams, protein: +protein, carbs: +carbs, fat: +fat, pop: +pop, tags: ['home-cooked'], src: 'estimated from a realistic single home-cooked portion; oil and ingredient amounts vary' });
}

db.entries = entries;
db.count = entries.length;
fs.writeFileSync(FILE, `${JSON.stringify(db, null, 1)}\n`);
console.log(`Generated ${entries.length} foods: ${ORIGINAL_COUNT} preserved originals and ${entries.length - ORIGINAL_COUNT} additions.`);
