import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const args = Object.fromEntries(argv.map((value, index) => value.startsWith('--') ? [value.slice(2), !argv[index + 1] || argv[index + 1].startsWith('--') ? true : argv[index + 1]] : null).filter(Boolean));
const dataRoot = args['data-root'];
if (!dataRoot) throw new Error('Usage: node tools/source-foods.mjs --data-root <extracted USDA directory> [--report]');

const foodsFile = new URL('../data/foods.json', import.meta.url);
const db = JSON.parse(fs.readFileSync(foodsFile, 'utf8'));

function findFile(root, name, contains = '') {
  for (const item of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, item.name);
    if (item.isDirectory()) {
      const found = findFile(full, name, contains);
      if (found) return found;
    } else if (item.name === name && full.toLowerCase().includes(contains.toLowerCase())) return full;
  }
}

function csvLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') field += line[++i];
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      fields.push(field);
      field = '';
    } else field += char;
  }
  fields.push(field);
  return fields;
}

function readCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').replace(/^\ufeff/, '').split(/\r?\n/).filter(Boolean);
  const header = csvLine(lines.shift());
  return lines.map(line => Object.fromEntries(csvLine(line).map((value, index) => [header[index], value])));
}

function loadCsvDataset(folder, label) {
  const foodFile = findFile(path.join(dataRoot, folder), 'food.csv');
  const nutrientFile = findFile(path.join(dataRoot, folder), 'food_nutrient.csv');
  if (!foodFile || !nutrientFile) throw new Error(`Missing ${label} CSV files below ${path.join(dataRoot, folder)}`);
  const foods = new Map(readCsv(foodFile).map(food => [food.fdc_id, food]));
  for (const row of readCsv(nutrientFile)) {
    if (!['1003', '1004', '1005', '1008'].includes(row.nutrient_id)) continue;
    const food = foods.get(row.fdc_id);
    if (food) (food.nutrients ||= {})[row.nutrient_id] = Number(row.amount);
  }
  return [...foods.values()].filter(food => ['1003', '1004', '1005', '1008'].every(id => Number.isFinite(food.nutrients?.[id]))).map(food => ({
    dataset: label,
    fdcId: Number(food.fdc_id),
    description: food.description,
    cal: food.nutrients['1008'],
    protein: food.nutrients['1003'],
    carbs: food.nutrients['1005'],
    fat: food.nutrients['1004']
  }));
}

function loadFndds() {
  const file = findFile(path.join(dataRoot, 'fndds'), 'surveyDownload.json');
  if (!file) throw new Error(`Missing surveyDownload.json below ${path.join(dataRoot, 'fndds')}`);
  return JSON.parse(fs.readFileSync(file, 'utf8')).SurveyFoods.map(food => {
    const nutrients = Object.fromEntries(food.foodNutrients.map(row => [row.nutrient.id, row.amount]));
    return {
      dataset: 'FNDDS 2021-2023',
      fdcId: food.fdcId,
      description: food.description,
      cal: nutrients[1008],
      protein: nutrients[1003],
      carbs: nutrients[1005],
      fat: nutrients[1004]
    };
  }).filter(food => ['cal', 'protein', 'carbs', 'fat'].every(field => Number.isFinite(food[field])));
}

const records = [
  ...loadCsvDataset('sr', 'SR Legacy'),
  ...loadCsvDataset('foundation', 'Foundation Foods'),
  ...loadFndds()
];
const recordsById = new Map(records.map(record => [record.fdcId, record]));

const stop = new Set('and or with without in of the a an style generic common serving per g percent whole plain lean meat'.split(' '));
const aliases = new Map(Object.entries({
  atlantic: 'atlantic', skinless: 'skin', steamed: 'cooked', baked: 'cooked', broiled: 'cooked', roasted: 'cooked', roast: 'cooked',
  breasts: 'breast', thighs: 'thigh', wings: 'wing', eggs: 'egg', whites: 'white', beans: 'bean', nuts: 'nut', noodles: 'noodle',
  potatoes: 'potato', mushrooms: 'mushroom', carrots: 'carrot', almonds: 'almond', walnuts: 'walnut', cashews: 'cashew', peanuts: 'peanut',
  raspberries: 'raspberry', blueberries: 'blueberry', strawberries: 'strawberry', grapes: 'grape', oats: 'oat', skimmed: 'skim', nonfat: 'skim',
  yoghurt: 'yogurt', garbanzo: 'chickpea', garbanzos: 'chickpea', soybeans: 'edamame', oil: 'oil', oils: 'oil'
}));

function tokens(value) {
  return new Set(value.toLowerCase().replace(/\b2%\b/g, ' 2 percent ').replace(/\b1%\b/g, ' 1 percent ').replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).map(word => aliases.get(word) || word).filter(word => word && !stop.has(word)));
}

function macroDistance(entry, record) {
  const scale = 100 / entry.grams;
  const expected = [entry.protein * scale, entry.carbs * scale, entry.fat * scale];
  const actual = [record.protein, record.carbs, record.fat];
  return expected.reduce((sum, value, index) => sum + Math.abs(value - actual[index]) / Math.max(3, value, actual[index]), 0) / 3;
}

function score(entry, record) {
  const wanted = tokens(entry.name.replace(/, (per 100 g|common serving)$/i, ''));
  const offered = tokens(record.description);
  const shared = [...wanted].filter(token => offered.has(token)).length;
  const coverage = shared / Math.max(1, wanted.size);
  const precision = shared / Math.max(1, offered.size);
  const stateWords = ['raw', 'cooked', 'fried', 'canned', 'dry', 'unsweetened', 'salted'];
  const statePenalty = stateWords.some(word => wanted.has(word) !== offered.has(word)) ? 0.14 : 0;
  return coverage * 0.72 + precision * 0.08 + (1 - macroDistance(entry, record)) * 0.2 - statePenalty;
}

const groceryOverrides = new Map(Object.entries({
  'Chicken thigh skinless raw': 173627,
  'Beef strip loin cooked': 170240,
  'Beef ribeye cooked': 173392,
  'Ground beef medium cooked': 169447,
  'Venison cooked': 175085,
  'Tuna albacore canned in water': 175158,
  'Mussels cooked': 174217,
  'Greek yogurt plain 2 percent': 2705423,
  'Pearl barley cooked': 170285,
  'Rolled oats dry': 173904,
  'Pasta white cooked': 168928,
  'Tofu firm': 172448,
  'Bell pepper raw': 2709801,
  'Onion raw': 170000,
  'Tomato raw': 2709719,
  'Apple with skin': 2709215,
  'Almonds raw': 170567,
  'Walnuts raw': 170187,
  'Cashews roasted unsalted': 170572,
  'Pistachios roasted': 170185,
  'Peanut butter natural': 172469,
  'Ground flaxseed': 169414
  ,'Ground beef extra lean cooked': 174754
  ,'Salmon Atlantic cooked': 175168
  ,'Salmon sockeye cooked': 173692
  ,'Rainbow trout cooked': 173718
  ,'Sardines canned in oil drained': 175139
  ,'Soy beverage unsweetened': 2705405
  ,'Almond beverage unsweetened': 2705409
}));

const recipeMatches = new Map(Object.entries({
  'Chicken Curry': 2706437,
  'Beef Curry': 2706388,
  'Fish Curry': 2706460,
  'Palak paneer': 2709631,
  'Tuna pasta salad': 2708942,
  'Iced coffee sweetened': 2710430,
  'Black tea plain': 2710488,
  'Green tea plain': 2710490,
  'Hot chocolate with milk': 171277
  ,'Chicken biryani, restaurant portion': 2706538
  ,'Lentil soup': 2707462
}));

const mealPrepProteins = new Map(Object.entries({
  'Grilled chicken breast': 171534,
  'Roasted chicken thigh': 2706030,
  'Lean ground beef': 174032,
  'Lean ground turkey': 171506,
  'Baked salmon': 175168,
  'Baked tilapia': 2706323,
  'Canned tuna': 171986,
  'Firm tofu': 172448,
  'Lentils': 172421,
  'Chickpeas': 173757
}));
const mealPrepCarbs = new Map(Object.entries({
  'white rice': 168878,
  'brown rice': 2710789,
  'quinoa': 168917,
  'roasted potatoes': 170030,
  'whole wheat pasta': 168916
}));

const directPublished = new Map(Object.entries({
  'library-restaurant-subway-grilled-chicken-sub-6-inch': [237, 420, 22, 43, 17, 'Grilled Chicken 6-inch'],
  'library-restaurant-subway-grilled-chicken-sub-footlong': [474, 840, 44, 86, 34, 'Grilled Chicken footlong, double the published 6-inch row'],
  'library-restaurant-subway-turkey-breast-sub-6-inch': [233, 430, 20, 46, 18, 'Turkey Breast 6-inch'],
  'library-restaurant-subway-turkey-breast-sub-footlong': [466, 860, 40, 92, 36, 'Turkey Breast footlong, double the published 6-inch row'],
  'library-restaurant-subway-steak-and-cheese-sub-6-inch': [244, 470, 25, 46, 21, 'Steak & Cheese 6-inch'],
  'library-restaurant-subway-steak-and-cheese-sub-footlong': [488, 940, 50, 92, 42, 'Steak & Cheese footlong, double the published 6-inch row'],
  'library-restaurant-subway-tuna-sub-6-inch': [230, 490, 22, 43, 25, 'Tuna 6-inch'],
  'library-restaurant-subway-tuna-sub-footlong': [460, 980, 44, 86, 50, 'Tuna footlong, double the published 6-inch row'],
  'library-restaurant-subway-veggie-delite-sub-6-inch': [188, 360, 11, 43, 16, 'Veggie Delite 6-inch'],
  'library-restaurant-subway-rotisserie-chicken-salad': [358, 140, 20, 9, 4, 'Rotisserie-Style Chicken salad']
}));

const round1 = value => Math.round(value * 10) / 10;

function applyUsda(entry, record) {
  const scale = entry.grams / 100;
  entry.cal = Math.round(record.cal * scale);
  entry.protein = round1(record.protein * scale);
  entry.carbs = round1(record.carbs * scale);
  entry.fat = round1(record.fat * scale);
  entry.conf = entry.grams === 100 ? 'published' : 'derived';
  entry.src = `USDA FoodData Central, ${record.dataset}, fdc_id ${record.fdcId}, per 100 g${entry.grams === 100 ? '' : ` scaled to a ${entry.grams} g serving`}`;
}

function applyMealPrep(entry, protein, carb) {
  const carbGrams = entry.grams - 300;
  const vegetables = recordsById.get(170472);
  const oil = recordsById.get(172336);
  const components = [[protein, 150], [carb, carbGrams], [vegetables, 150], [oil, 5]];
  entry.grams = carbGrams + 305;
  for (const field of ['cal', 'protein', 'carbs', 'fat']) {
    const total = components.reduce((sum, [record, grams]) => sum + record[field] * grams / 100, 0);
    entry[field] = field === 'cal' ? Math.round(total) : round1(total);
  }
  entry.conf = 'derived';
  entry.src = `USDA FoodData Central recipe: fdc_id ${protein.fdcId} (150 g), fdc_id ${carb.fdcId} (${carbGrams} g), fdc_id 170472 (150 g mixed vegetables), fdc_id 172336 (5 g canola oil)`;
}

if (args.report) {
  const generic = args.category
    ? db.entries.filter(entry => entry.cat === args.category && entry.conf === 'estimate')
    : db.entries.filter(entry => entry.id.startsWith('library-grocery-generic-') && /, (per 100 g|common serving)$/i.test(entry.name));
  const seen = new Set();
  for (const entry of generic) {
    const base = entry.name.replace(/, (per 100 g|common serving)$/i, '');
    if (seen.has(base)) continue;
    seen.add(base);
    const candidates = records.map(record => ({ record, score: score(entry, record) })).sort((a, b) => b.score - a.score).slice(0, 5);
    console.log(`\n${base}`);
    for (const { record, score: value } of candidates) console.log(`${value.toFixed(3)}\t${record.dataset}\t${record.fdcId}\t${record.description}\t${record.cal}/${record.protein}/${record.carbs}/${record.fat}`);
  }
  process.exit();
}

if (!args.apply) {
  console.log(`Loaded ${records.length} usable USDA records. Pass --report to inspect candidates or --apply to update data/foods.json.`);
  process.exit();
}

let usdaCount = 0;
let recipeCount = 0;
let restaurantCount = 0;
const selectedByBase = new Map();
for (const entry of db.entries.filter(entry => entry.id.startsWith('library-grocery-generic-'))) {
  const base = entry.name.replace(/, (per 100 g|common serving)$/i, '');
  if (selectedByBase.has(base) || !/, per 100 g$/i.test(entry.name)) continue;
  let record = recordsById.get(groceryOverrides.get(base));
  if (!record) {
    const best = records.map(candidate => ({ candidate, value: score(entry, candidate) })).sort((a, b) => b.value - a.value)[0];
    if (best.value >= 0.9) record = best.candidate;
  }
  if (record) selectedByBase.set(base, record);
}
for (const entry of db.entries) {
  if (!entry.id.startsWith('library-')) continue;
  if (entry.id.startsWith('library-grocery-generic-')) {
    const base = entry.name.replace(/, (per 100 g|common serving)$/i, '');
    const record = selectedByBase.get(base);
    if (record) {
      applyUsda(entry, record);
      usdaCount++;
    }
  } else if (entry.cat === 'recipe' && recipeMatches.has(entry.name)) {
    applyUsda(entry, recordsById.get(recipeMatches.get(entry.name)));
    recipeCount++;
  } else if (entry.cat === 'recipe') {
    const match = entry.name.match(/^(.+) with (.+) and vegetables$/);
    const protein = recordsById.get(mealPrepProteins.get(match?.[1]));
    const carb = recordsById.get(mealPrepCarbs.get(match?.[2]));
    if (protein && carb) {
      applyMealPrep(entry, protein, carb);
      recipeCount++;
    }
  }

  const direct = directPublished.get(entry.id);
  if (direct) {
    const [grams, cal, protein, carbs, fat, row] = direct;
    Object.assign(entry, { grams, cal, protein, carbs, fat, conf: 'published', src: `Subway Canada Nutrition Information, June 2026, ${row}` });
    restaurantCount++;
  }
}

const sourceCorrections = new Map([
  ['barcelos-half-chicken-breast', { conf: 'estimate', src: 'estimated by doubling the unsourced quarter chicken breast estimate' }],
  ['protein-shake-whey-milk', { src: 'derived from Optimum Nutrition Gold Standard whey isolate label plus USDA FDC 746782, 2% milk' }],
  ['tuna-on-toast', { src: 'derived from USDA FDC canned tuna in water drained, light mayo, and Dempster’s Canada whole wheat bread nutrition facts' }]
]);
for (const entry of db.entries) {
  if (sourceCorrections.has(entry.id)) Object.assign(entry, sourceCorrections.get(entry.id));
  const macroCalories = 4 * entry.protein + 4 * entry.carbs + 9 * entry.fat;
  const mismatch = entry.cal === 0 ? macroCalories !== 0 : Math.abs(macroCalories - entry.cal) / entry.cal > 0.25;
  if (mismatch && entry.src.includes('FoodData Central') && !entry.note?.trim()) {
    entry.note = 'USDA energy can differ from 4/4/9 macro arithmetic because FoodData Central uses food-specific Atwater factors.';
  }
}

fs.writeFileSync(foodsFile, `${JSON.stringify(db, null, 1)}\n`);
console.log(`Updated ${usdaCount} grocery rows, ${recipeCount} recipe rows, and ${restaurantCount} restaurant rows.`);
