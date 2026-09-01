import fs from 'node:fs';
import crypto from 'node:crypto';

const FILE = new URL('../data/foods.json', import.meta.url);
const ORIGINAL_COUNT = 244;
const ORIGINAL_IMMUTABLE_HASH = '0d9b7973dde30ce4369900467fdd403bd2dbb283c690e6ca4614091124b5b9fb';
const LEGACY_BLOCKED_NAMES = new Set([
  'flippn-burgers-beefy-bacon-cheddar-burger',
  'boardwalk-chipotle-beef-bacon-fries',
  'calgary-pizza-master-pepperoni-slice',
  'blowers-grafton-grilled-chicken-sandwich',
  'brokin-yolk-turkey-bacon-egg-white-wrap'
]);
const required = ['name', 'cal', 'protein', 'carbs', 'fat', 'src', 'conf', 'pop'];
const allowedFields = new Set(['id', 'name', 'brand', 'cat', 'serving', 'grams', 'cal', 'protein', 'carbs', 'fat', 'src', 'conf', 'tags', 'note', 'pop']);
const allowedConf = new Set(['published', 'derived', 'estimate']);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const blockedName = /\b(?:pork|bacon|ham|pepperoni|prosciutto|chorizo)\b/i;

let db;
try {
  db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  console.log('PASS JSON.parse');
} catch (error) {
  console.error(`FAIL JSON.parse: ${error.message}`);
  process.exit(1);
}

const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
check(db.version === 1, `version ${db.version} does not equal 1`);
check(Object.keys(db).join(',') === 'version,count,entries', 'top-level schema or field order changed');
check(db.count === db.entries.length, `count ${db.count} does not equal entries.length ${db.entries.length}`);
check(db.entries.length >= 1200, `only ${db.entries.length} entries, expected at least 1200`);

const ids = new Set();
for (const [index, entry] of db.entries.entries()) {
  const label = entry.id || `entry ${index}`;
  check(idPattern.test(entry.id || ''), `${label}: id is not kebab-case`);
  check(!ids.has(entry.id), `${label}: duplicate id`);
  ids.add(entry.id);
  for (const field of required) check(Object.hasOwn(entry, field) && entry[field] !== '', `${label}: missing ${field}`);
  for (const field of Object.keys(entry)) check(allowedFields.has(field), `${label}: unexpected field ${field}`);
  for (const field of ['cal', 'protein', 'carbs', 'fat']) check(Number.isFinite(entry[field]) && entry[field] >= 0, `${label}: ${field} must be a nonnegative number`);
  check(allowedConf.has(entry.conf), `${label}: invalid conf ${entry.conf}`);
  if (entry.conf !== 'estimate') {
    const concreteSource = /(?:fdc(?:_id)?\s*\d+|USDA FDC(?:,|\s)|FoodData Central|nutrition (?:facts|label|information|page)|product label|packaging|published|official nutrition|DoorDash order screen|mynetdiary|\blabel\b|\b[A-Za-z0-9-]+\.(?:ca|com|org)\b)/i.test(entry.src);
    check(concreteSource, `${label}: ${entry.conf} entry has a vague src: ${entry.src}`);
  }
  check(Number.isInteger(entry.pop) && entry.pop >= 0 && entry.pop <= 100, `${label}: pop must be an integer from 0 to 100`);
  const macroCalories = 4 * entry.protein + 4 * entry.carbs + 9 * entry.fat;
  const mismatch = entry.cal === 0 ? macroCalories !== 0 : Math.abs(macroCalories - entry.cal) / entry.cal > 0.25;
  check(!mismatch || Boolean(entry.note?.trim()), `${label}: macros differ from calories by more than 25% without a note`);
  if (blockedName.test(entry.name)) {
    check(index < ORIGINAL_COUNT && LEGACY_BLOCKED_NAMES.has(entry.id), `${label}: added entry name contains a blocked meat word`);
  }
  if (entry.tags?.includes('his-usual')) check(entry.pop >= 85, `${label}: his-usual pop is below 85`);
}

const originalImmutable = db.entries.slice(0, ORIGINAL_COUNT).map(({ id, name, cat, tags }) => ({ id, name, cat, tags }));
const originalHash = crypto.createHash('sha256').update(JSON.stringify(originalImmutable)).digest('hex');
check(originalImmutable.length === ORIGINAL_COUNT && originalHash === ORIGINAL_IMMUTABLE_HASH, 'the original 244 ids, names, categories, or tags were removed, reordered, or rewritten');

if (errors.length) {
  console.error(`FAIL ${errors.length} food-library checks:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const addedBlocked = db.entries.slice(ORIGINAL_COUNT).filter(entry => blockedName.test(entry.name));
console.log(`PASS count: ${db.count} entries`);
console.log(`PASS ids: ${ids.size} unique kebab-case ids`);
console.log('PASS required fields, conf values, and pop range');
console.log('PASS macro sanity: every entry is within 25% or has a note');
console.log(`PASS blocked names: ${addedBlocked.length} in added entries; 5 immutable legacy exceptions identified`);
console.log('PASS original records: all 244 ids, names, categories, and tags preserved');

const split = [];
for (const cat of ['grocery', 'restaurant', 'recipe', 'supplement']) {
  const entries = db.entries.filter(entry => entry.cat === cat);
  split.push({
    category: cat,
    published: entries.filter(entry => entry.conf === 'published').length,
    derived: entries.filter(entry => entry.conf === 'derived').length,
    estimate: entries.filter(entry => entry.conf === 'estimate').length
  });
}
console.table(split);
