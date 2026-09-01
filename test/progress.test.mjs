/* Tests for the prediction maths on the Progress screen.
 *
 * These functions decide what the app tells him about his own body, so a quiet
 * arithmetic error here is worse than a crash: a crash gets noticed. The hard
 * requirement is that every one of them refuses to answer rather than guessing
 * from thin data, and that where two readings of the data disagree the
 * pessimistic one wins. Both are tested here, not assumed.
 *
 * The app is a single html file with no module boundary, so the inline script
 * is extracted and run inside a vm with just enough browser stubbed to let it
 * load. The script hands its internals out through globalThis.__T on the way
 * past, which is the only concession the app makes to being testable.
 *
 *   node test/progress.test.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log('PASS  ' + name); pass++; }
  catch (e) { console.log('FAIL  ' + name + '\n      ' + e.message); fail++; }
}
async function acheck(name, fn) {
  try { await fn(); console.log('PASS  ' + name); pass++; }
  catch (e) { console.log('FAIL  ' + name + '\n      ' + e.message); fail++; }
}

/* ── load the app ─────────────────────────────────────────────────────── */
function loadApp(fetchImpl = () => new Promise(() => {})) {
  const html = fs.readFileSync(path.join(root, 'fittrack.html'), 'utf8');
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  blocks.sort((a, b) => b.length - a.length);
  const code = blocks[0] + `
    ;globalThis.__T={trendSeries,weeklyRate,estimateTDEE,projectTarget,rhrStatus,
                     shiftDate,recentDates,freshLog,S,DB,migrateDoseSettings,
                     doseForDate,foodHistoryIndex,searchFoods,sendSub,
                     wUnit,toDisp,fromDisp,setUnits,htUnit,htDisp,htFrom,setHtUnit,
                     volUnit,volDisp,volFrom,setVolUnit,setUnitSystem,resolveTheme,
                     computeTargets,obEaseData,exCard,updSet};`;

  const store = new Map();
  const noop = () => {};
  const el = () => ({ innerHTML: '', value: '', textContent: '', style: {},
                      classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
                      querySelector: () => null, querySelectorAll: () => [], appendChild: noop });
  const sandbox = {
    console,
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
      clear: () => store.clear(),
      key: i => [...store.keys()][i],
      get length() { return store.size; },
    },
    document: { addEventListener: noop, getElementById: el, querySelector: () => null,
                querySelectorAll: () => [], createElement: el, body: el(),
                documentElement: el(), readyState: 'complete' },
    navigator: { serviceWorker: undefined, userAgent: 'node', standalone: false },
    fetch: fetchImpl,
    setTimeout: noop, clearTimeout: noop, setInterval: noop, clearInterval: noop,
    requestAnimationFrame: noop, matchMedia: () => ({ matches: false, addListener: noop }),
    Notification: undefined, Chart: undefined, Intl, Date, Math, JSON,
    // window is the sandbox itself, so these are what the app installs its
    // beforeinstallprompt and hashchange listeners on. Without them the
    // script throws on load and every test below fails for the wrong reason.
    addEventListener: noop, removeEventListener: noop,
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000000",
             getRandomValues: a => a },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  new vm.Script(code, { filename: 'fittrack-inline.js' }).runInContext(sandbox);
  return sandbox.__T;
}

const T = loadApp();

/* The app never ran init(), because DOMContentLoaded never fires in here.
 * Set only the state these functions actually read. */
const TODAY = '2026-08-27';
T.S.today = TODAY;
T.S.cfg = { body: { targetWeight: 65.0 }, targets: { calories: 1800 }, units: 'kg' };

const shift = (d, n) => T.shiftDate(d, n);
const reset = () => { T.DB.set('ft_weights', []); T.DB.set('ft_logs', {}); };

function seedDays(n, opts) {
  const o = opts || {};
  const logs = {};
  for (let i = n - 1; i >= 0; i--) {
    const d = shift(TODAY, -i);
    const l = T.freshLog(d);
    if (o.cal != null) l.nutrition.meals = [{ id: 'x', name: 'day', cal: o.cal, protein: 0, carbs: 0, fat: 0 }];
    if (o.rhr != null) l.rhr = typeof o.rhr === 'function' ? o.rhr(i) : o.rhr;
    logs[d] = l;
  }
  T.DB.set('ft_logs', logs);
}

/* Daily weights falling at a known rate with realistic day to day water noise. */
function seedWeights(days, startKg, kgPerWeek) {
  const noise = [0.6, -0.5, 0.2, -0.8, 0.9, -0.3, 0.1];
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const elapsed = days - 1 - i;
    out.push({ date: shift(TODAY, -i),
               weight: Math.round((startKg + elapsed * (kgPerWeek / 7) + noise[i % 7]) * 10) / 10 });
  }
  T.DB.set('ft_weights', out);
  return out;
}

/* ── trend smoothing ──────────────────────────────────────────────────── */
check('trend weight is closer to the real line than the raw reading is', () => {
  reset();
  const raw = seedWeights(42, 73.0, -0.35);
  const trend = T.trendSeries(T.DB.weights());
  assert.equal(trend.length, raw.length);
  // An exponential average trades bias for variance: it lags a falling line by
  // roughly half-life over ln2 days, so its LEVEL is not more accurate and
  // asserting that would be testing the wrong property. What it buys is
  // stability, which is the entire reason the screen shows it.
  const spread = a => {
    const d = a.slice(1).map((v, i) => v - a[i]);
    const m = d.reduce((x, y) => x + y, 0) / d.length;
    return Math.sqrt(d.reduce((x, y) => x + (y - m) * (y - m), 0) / d.length);
  };
  const rawSpread = spread(raw.map(w => w.weight));
  const trendSpread = spread(trend.map(t => t.trend));
  assert.ok(trendSpread < rawSpread / 3,
    `trend must be far steadier day to day: raw ${rawSpread.toFixed(3)}, trend ${trendSpread.toFixed(3)}`);
  // The lag must sit ABOVE the true line while losing. A trend reading low would
  // flatter him and shorten every projection built on it.
  const truth = 73.0 + 41 * (-0.35 / 7);
  assert.ok(trend[trend.length - 1].trend >= truth,
    'the lag must stay on the conservative side of the real line');
});

check('trend smoothing is time aware, so a gap is not read as a flat week', () => {
  reset();
  // Two readings a month apart. A count-based average would barely move off the
  // first value; a time-aware one has to carry most of the way to the second.
  T.DB.set('ft_weights', [{ date: shift(TODAY, -30), weight: 75 }, { date: TODAY, weight: 70 }]);
  const t = T.trendSeries(T.DB.weights());
  assert.ok(t[1].trend < 71.5, `30 days of decline should carry the trend down, got ${t[1].trend.toFixed(2)}`);
});

check('trendSeries survives empty and malformed input', () => {
  // Arrays cross a vm realm boundary here, so deepEqual compares prototypes from
  // two different realms and fails on identical data. Length is the assertion.
  assert.equal(T.trendSeries([]).length, 0);
  assert.equal(T.trendSeries(null).length, 0);
  assert.equal(T.trendSeries([{ date: '2026-01-01' }, { weight: 70 }, null]).length, 0);
});

/* ── rate ─────────────────────────────────────────────────────────────── */
check('weekly rate recovers the seeded rate through the noise', () => {
  reset();
  seedWeights(42, 73.0, -0.35);
  const r = T.weeklyRate(T.trendSeries(T.DB.weights()), 28);
  assert.ok(r < 0, 'must read as losing');
  assert.ok(Math.abs(r - (-0.35)) < 0.12, `expected about -0.35 kg/wk, got ${r.toFixed(3)}`);
});

check('weekly rate refuses a short span even with plenty of readings', () => {
  reset();
  // Five weigh-ins inside one week say nothing about a weekly rate.
  T.DB.set('ft_weights', [0, 1, 2, 3, 4].map(i => ({ date: shift(TODAY, -i), weight: 72 - i * 0.3 })));
  assert.equal(T.weeklyRate(T.trendSeries(T.DB.weights()), 28), null);
});

/* ── tdee ─────────────────────────────────────────────────────────────── */
check('tdee back-calculates to the real number from intake and weight change', () => {
  reset();
  seedWeights(42, 73.0, -0.35);
  seedDays(42, { cal: 1800 });
  const e = T.estimateTDEE(28);
  assert.ok(e.ok, 'should have enough data: ' + e.why);
  // 0.35 kg/wk of fat is 0.05 kg/day, which is 385 kcal/day. 1800 + 385 = 2185.
  assert.ok(Math.abs(e.tdee - 2185) < 120, `expected about 2185, got ${e.tdee}`);
  assert.equal(e.meanIntake, 1800);
});

check('tdee refuses to answer when most days have no food logged', () => {
  reset();
  seedWeights(42, 73.0, -0.35);
  const logs = {};
  for (let i = 0; i < 42; i++) {
    const d = shift(TODAY, -i);
    const l = T.freshLog(d);
    if (i % 5 === 0) l.nutrition.meals = [{ id: 'x', name: 'day', cal: 1800 }];
    logs[d] = l;
  }
  T.DB.set('ft_logs', logs);
  const e = T.estimateTDEE(28);
  assert.equal(e.ok, false, 'a mean built from one day in five is not an estimate');
  assert.match(e.why, /days have food logged/);
});

check('tdee refuses an impossible number rather than printing it', () => {
  reset();
  // Logs 900 kcal a day while gaining fast. The arithmetic says a sub-1200
  // maintenance, which in reality means the food log is missing most of it.
  seedWeights(42, 70.0, 0.8);
  seedDays(42, { cal: 900 });
  const e = T.estimateTDEE(28);
  assert.equal(e.ok, false);
  assert.match(e.why, /do not add up/);
});

check('tdee needs three weigh-ins and a real span', () => {
  reset();
  T.DB.set('ft_weights', [{ date: TODAY, weight: 71.2 }]);
  assert.match(T.estimateTDEE(28).why, /three weigh-ins/);
  T.DB.set('ft_weights', [0, 1, 2].map(i => ({ date: shift(TODAY, -i), weight: 71 })));
  assert.match(T.estimateTDEE(28).why, /two weeks/);
});

/* ── projection ───────────────────────────────────────────────────────── */
check('projection reports a date and never a flattering one', () => {
  reset();
  seedWeights(42, 73.0, -0.35);
  const p = T.projectTarget();
  assert.ok(p.ok, p.why);
  // Where the 28 day window and the whole run disagree, the slower must win.
  const trend = T.trendSeries(T.DB.weights());
  const slower = Math.max(T.weeklyRate(trend, 28), T.weeklyRate(trend, 3650));
  assert.equal(p.rate, slower, 'must take the least negative of the two rates');
  assert.ok(p.weeks > 0 && p.date > TODAY);
});

check('a flat trend gets no projected date', () => {
  reset();
  T.DB.set('ft_weights', [
    { date: shift(TODAY, -28), weight: 71.2 },
    { date: shift(TODAY, -14), weight: 71.3 },
    { date: TODAY, weight: 71.2 }]);
  const p = T.projectTarget();
  assert.equal(p.ok, false);
  assert.match(p.why, /No measurable downward trend/);
});

check('gaining is reported as gaining, not softened into not losing', () => {
  reset();
  T.DB.set('ft_weights', [
    { date: shift(TODAY, -28), weight: 70.0 },
    { date: shift(TODAY, -14), weight: 70.8 },
    { date: TODAY, weight: 71.6 }]);
  const p = T.projectTarget();
  assert.equal(p.ok, false, 'must never project a target date while gaining');
  assert.match(p.why, /up, not down/);
});

check('an absurdly slow rate is called out instead of dated', () => {
  reset();
  // 55 grams a week: fast enough to clear the 50 gram noise floor, slow enough
  // that 65 kg is 113 weeks away. The window between those two guards is narrow
  // by construction, and this is the case that lives inside it.
  T.DB.set('ft_weights', [
    { date: shift(TODAY, -84), weight: 71.86 },
    { date: shift(TODAY, -42), weight: 71.53 },
    { date: TODAY, weight: 71.2 }]);
  const p = T.projectTarget();
  assert.equal(p.ok, false);
  assert.match(p.why, /more than two years/);
});

check('reaching the target is stated plainly', () => {
  reset();
  T.DB.set('ft_weights', [
    { date: shift(TODAY, -28), weight: 66.0 },
    { date: shift(TODAY, -14), weight: 65.0 },
    { date: TODAY, weight: 64.0 }]);
  const p = T.projectTarget();
  assert.equal(p.ok, true);
  assert.equal(p.done, true);
});

/* ── resting heart rate ───────────────────────────────────────────────── */
check('resting heart rate stays quiet inside normal variation', () => {
  reset();
  seedDays(30, { rhr: i => 60 + (i % 3) });
  const r = T.rhrStatus();
  assert.equal(r.ok, true);
  assert.equal(r.level, 'fine');
});

check('a 10 bpm rise is escalated, a 5 bpm one is only watched', () => {
  reset();
  // Oldest five readings set the baseline, newest five the current figure.
  seedDays(20, { rhr: i => (i >= 15 ? 60 : i < 5 ? 66 : 62) });
  assert.equal(T.rhrStatus().level, 'watch');
  reset();
  seedDays(20, { rhr: i => (i >= 15 ? 60 : i < 5 ? 71 : 65) });
  const hi = T.rhrStatus();
  assert.equal(hi.level, 'high');
  assert.match(hi.msg, /doctor/);
});

check('resting heart rate says nothing at all from one or two readings', () => {
  reset();
  seedDays(2, { rhr: 62 });
  assert.equal(T.rhrStatus().ok, false);
});

/* Dose schedules and food ranking share this file because the same VM harness
 * exercises the real inline app code without introducing a build boundary. */
check('dose migration seeds the owner once and never auto-extends', () => {
  const cfg = { name: 'Adnan', profile: { birthday: '2002-11-23' }, glp1: false };
  assert.equal(T.migrateDoseSettings(cfg, false), true);
  assert.equal(cfg.glp1, true);
  assert.equal(cfg.dose.med, 'Retatrutide');
  assert.equal(cfg.dose.steps.length, 6);
  assert.equal(cfg.dose.steps.at(-1).date, '2026-09-28');
  assert.equal(T.migrateDoseSettings(cfg, false), false);
  assert.equal(cfg.dose.steps.length, 6, 'a later launch must not append another inferred step');

  const fresh = { name: '', profile: {}, glp1: true };
  assert.equal(T.migrateDoseSettings(fresh, true), true);
  assert.equal(fresh.dose.steps.length, 0, 'a fresh install must start with no claimed dose history');
});

check('a date past the confirmed dose table yields no number', () => {
  const cfg = { name: 'Adnan', profile: { birthday: '2002-11-23' } };
  T.migrateDoseSettings(cfg, false);
  assert.equal(T.doseForDate('2026-10-05', cfg.dose.steps), null);
});

check('frequently logged food outranks a high-pop never-logged match', () => {
  const foods = [
    { id: 'habit', name: 'Apple yogurt bowl', pop: 5, tags: [] },
    { id: 'popular', name: 'Apple pie', pop: 100, tags: ['his-usual'] },
  ];
  const logs = {
    '2026-08-20': { nutrition: { meals: [{ foodId: 'habit', name: 'Apple yogurt bowl' }] } },
    '2026-08-27': { nutrition: { meals: [{ foodId: 'habit', name: 'Apple yogurt bowl' }] } },
  };
  const history = T.foodHistoryIndex(logs, foods);
  const ranked = T.searchFoods('apple', foods, history);
  assert.equal(ranked[0].id, 'habit');
  assert.equal(history.habit.count, 2);
  assert.equal(history.habit.last, '2026-08-27');
});

await acheck('sendSub carries confirmed dose steps and otherwise sends null', async () => {
  const requests = [];
  const app = loadApp(async (url, options) => { requests.push(JSON.parse(options.body)); return { ok: true }; });
  app.S.cfg = {
    targets: { water: 3500 }, gymTarget: 3, notifications: {},
    dose: { med: 'Tirzepatide', steps: [{ date: '2026-09-01', mg: 2.5 }] },
  };
  assert.equal(await app.sendSub({ endpoint: 'https://push.example/one', keys: {} }), true);
  assert.equal(requests[0].cfg.dose.med, 'Tirzepatide');
  assert.equal(requests[0].cfg.dose.steps[0].mg, 2.5);

  app.S.cfg.dose.steps = [];
  assert.equal(await app.sendSub({ endpoint: 'https://push.example/two', keys: {} }), true);
  assert.equal(requests[1].cfg.dose, null);
});

/* Theme and units: storage is canonical (kg, cm, ml, dark/light/system as
 * chosen), only the display layer converts. These check the two failure
 * modes that class of bug actually ships as: a conversion that drifts on
 * round-trip, and a unit switch that quietly rewrites what is on disk. */
check('weight round-trips through kg and lb without drift', () => {
  const kg = 71.234;
  T.S.cfg = { units: 'kg' };
  assert.ok(Math.abs(T.fromDisp(T.toDisp(kg)) - kg) < 1e-9);
  T.S.cfg.units = 'lb';
  assert.ok(Math.abs(T.fromDisp(T.toDisp(kg)) - kg) < 1e-9, 'lb round-trip drifted');
  T.S.today = '2026-09-01';
  T.S.log = { workout: { exercises: {} } };
  const card = T.exCard(
    { id: 'press', name: 'Press', sets: 1, reps: '8-12', weight: '', muscle: '', cues: [], restSec: 90 },
    { sets: [{ weight: 10 }], completed: false },
  );
  assert.match(card, /value="22\.0"/, 'a stored 10 kg set should display as 22.0 lb');
  T.updSet('press', 0, 'w', '22.0');
  assert.ok(Math.abs(T.S.log.workout.exercises.press.sets[0].weight - 22 * 0.45359237) < 1e-9,
    'an entered pound value must be stored as kilograms');
});
check('height round-trips through cm and inches without drift', () => {
  const cm = 171.5;
  T.S.cfg = { unitHeight: 'cm' };
  assert.ok(Math.abs(T.htFrom(T.htDisp(cm)) - cm) < 1e-9);
  T.S.cfg.unitHeight = 'in';
  assert.ok(Math.abs(T.htFrom(T.htDisp(cm)) - cm) < 1e-9, 'inch round-trip drifted');
});
check('volume round-trips through ml and fl oz without drift', () => {
  const ml = 3500;
  T.S.cfg = { unitVol: 'ml' };
  assert.ok(Math.abs(T.volFrom(T.volDisp(ml)) - ml) < 1e-9);
  T.S.cfg.unitVol = 'floz';
  assert.ok(Math.abs(T.volFrom(T.volDisp(ml)) - ml) < 1e-9, 'fl oz round-trip drifted');
});
check('switching units never rewrites the stored weight history or body numbers', () => {
  const body = { currentWeight: 71.2, startingWeight: 71.2, targetWeight: 65.0, bodyFat: 31, startBodyFat: 31, muscleMass: 49.1 };
  T.DB.saveSettings({ units: 'kg', unitHeight: 'cm', unitVol: 'ml', body,
    profile: { heightCm: 171.5, birthday: '2002-11-23', sex: 'male' } });
  T.DB.set('ft_weights', [{ date: '2026-08-20', weight: 71.5 }, { date: '2026-08-27', weight: 71.2 }]);
  const beforeWeights = JSON.stringify(T.DB.get('ft_weights', null));
  const beforeBody = JSON.stringify(T.DB.settings().body);

  T.S.cfg = T.DB.settings();
  T.setUnits('lb'); T.setHtUnit('in'); T.setVolUnit('floz');
  T.setUnitSystem('metric');
  T.setUnits('lb'); T.setHtUnit('in'); T.setVolUnit('floz');

  assert.equal(JSON.stringify(T.DB.get('ft_weights', null)), beforeWeights,
    'ft_weights must be byte-identical after switching display units');
  assert.equal(JSON.stringify(T.DB.settings().body), beforeBody,
    'ft_settings.body must be byte-identical after switching display units');
});
check('theme resolves dark, light and system to the right token', () => {
  T.S.cfg = { theme: 'dark' };
  assert.equal(T.resolveTheme(), 'dark');
  T.S.cfg.theme = 'light';
  assert.equal(T.resolveTheme(), 'light');
  T.S.cfg.theme = 'system';
  // The sandboxed matchMedia always reports matches:false (not light), so
  // "system" resolves to "dark" here, deterministically.
  assert.equal(T.resolveTheme(), 'dark');
  T.S.cfg.theme = 'bogus';
  assert.equal(T.resolveTheme(), 'dark', 'an unrecognised theme value must fall back through system, not crash');
});

check('onboarding targets stay exact while summary motion is only presentation', () => {
  const targets = T.computeTargets({ weightKg: 80, heightCm: 180, age: 30, sex: 'male', sessions: 3, glp1: false, creatine: true });
  assert.deepEqual(JSON.parse(JSON.stringify(targets)), {
    bmr: 1780, tdee: 2225, calories: 1750, protein: 168, carbs: 119,
    fat: 67, water: 4000, steps: 8000, creatine: 5, floor: 1700,
  });
});
check('onboarding count-up uses the monotonic ease-data curve and lands exactly', () => {
  const samples = [0, .1, .25, .5, .75, .9, 1].map(T.obEaseData);
  assert.equal(samples[0], 0);
  assert.equal(samples.at(-1), 1);
  assert.ok(samples.every((v, i) => i === 0 || v >= samples[i - 1]), 'ease-data must never count backwards');
  assert.ok(T.obEaseData(.5) > .5, 'ease-data should arrive quickly, then settle');
});

console.log('\nVERDICT: ' + (fail ? `FAIL (${pass}/${pass + fail})` : `PASS (${pass}/${pass + fail})`));
process.exit(fail ? 1 : 0);
