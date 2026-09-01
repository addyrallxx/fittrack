/* End to end check of the shipped app in real Chrome over CDP.
   No dependencies: Node 24 has a native WebSocket. */
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.FITTRACK_URL || 'http://127.0.0.1:8899/fittrack.html';
const headful = process.env.FITTRACK_HEADFUL === '1';
const fullMotion = process.env.FITTRACK_MOTION === 'full';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ftchrome-'));

const portAvailable = port => new Promise(resolve => {
  const server = net.createServer();
  server.once('error', () => resolve(false));
  server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)));
});
async function findDebugPort() {
  for (let port = 9340; port < 9440; port++) if (await portAvailable(port)) return port;
  throw new Error('no free Chrome debug port in 9340..9439');
}
const debugPort = await findDebugPort();

const chromeArgs = [
  '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`,
  '--window-size=360,800', '--force-device-scale-factor=1', 'about:blank',
];
if (!headful) chromeArgs.unshift('--headless=new');
const chrome = spawn(CHROME, chromeArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
let chromeStderr = '';
chrome.stderr.on('data', chunk => { chromeStderr = (chromeStderr + chunk).slice(-4000); });
let ws;
let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  try { ws?.close(); } catch {}
  try { chrome.kill(); } catch {}
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
async function cleanupAndWait() {
  if (cleaned) return;
  try { ws?.close(); } catch {}
  try { chrome.kill(); } catch {}
  if (chrome.exitCode == null) {
    await Promise.race([
      new Promise(resolve => chrome.once('exit', resolve)),
      new Promise(resolve => setTimeout(resolve, 2000)),
    ]);
  }
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  cleaned = true;
}
process.once('exit', cleanup);
process.once('SIGINT', () => process.exit(130));

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const list = await r.json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(500);
  }
  throw new Error('chrome devtools never came up (exit ' + chrome.exitCode + '): ' + chromeStderr.trim());
}

ws = new WebSocket(await target());
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});
let id = 0;
const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const request = pending.get(m.id);
    clearTimeout(request.timer);
    pending.delete(m.id);
    if (m.error) request.reject(new Error(JSON.stringify(m.error)));
    else request.resolve(m);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id;
  const timer = setTimeout(() => { pending.delete(n); reject(new Error('CDP timeout: ' + method)); }, 10000);
  pending.set(n, { resolve, reject, timer });
  ws.send(JSON.stringify({ id: n, method, params }));
});

const errors = [];
await send('Runtime.enable');
await send('Log.enable');
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.method === 'Fetch.requestPaused') {
    void send('Fetch.fulfillRequest', {
      requestId: m.params.requestId,
      responseCode: 200,
      responseHeaders: [{ name: 'Content-Type', value: 'text/javascript' }],
      body: Buffer.from('/* Chart is optional during the offline layout probe. */').toString('base64'),
    });
  }
  if (m.method === 'Runtime.exceptionThrown')
    errors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error')
    errors.push(m.params.entry.text);
});

await send('Emulation.setDeviceMetricsOverride',{width:360,height:800,deviceScaleFactor:1,mobile:true});
await send('Page.enable');
await send('Fetch.enable', { patterns: [{ urlPattern: '*cdnjs.cloudflare.com/ajax/libs/Chart.js/*' }] });
if (!fullMotion) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url: URL });

async function evaluate(expr) {
  const r = await send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: true,
  });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
  return r.result?.result?.value;
}
/* A fixed sleep here used to race init(): the app's inline script waits on
   the Chart.js CDN <script> tag ahead of it in <head>, and a slow or
   uncached fetch (a fresh --user-data-dir every run means no cache) could
   still be loading past a flat 4000ms wait, so renderScreen was
   intermittently undefined below. Poll for it instead of guessing a bigger
   number. */
let ready = false;
for (let i = 0; i < 40; i++) {
  ready = await evaluate(`typeof renderScreen==='function'&&typeof S!=='undefined'`);
  if (ready) break;
  await sleep(250);
}
if (!ready) {
  const diag = await evaluate(`({readyState: document.readyState, url: document.URL, hasRenderScreen: typeof renderScreen, hasChart: typeof Chart, hasS: typeof S})`);
  console.log('NOT READY', JSON.stringify(diag));
  console.log('ERRORS SO FAR', JSON.stringify(errors));
  throw new Error('FitTrack did not initialize in Chrome');
}

const probe = `(() => {
  const out = { screens: {} };
  const seed = () => {
    // Skip onboarding so the real screens render.
    if (typeof S === 'undefined') return 'no S';
    return 'ok';
  };
  out.seed = seed();
  out.version = typeof APP_VERSION !== 'undefined' ? APP_VERSION : null;
  out.hasOnboarding = !!document.querySelector('.ob-wrap, [class*=onboard]');
  out.bodyOverflow = document.body.scrollWidth - document.body.clientWidth;
  out.title = document.title;
  out.helpTopics = typeof HELP_TOPICS !== 'undefined' ? Object.keys(HELP_TOPICS).length : 0;
  out.iconOk = typeof svgIcon === 'function';
  return out;
})()`;

const base = await evaluate(probe);

// Drive through each tab and measure card alignment.
const perScreen = await evaluate(`(async () => {
  const res = {};
  for (let i = 0; i < 5; i++) {
    try { renderScreen(i); } catch (e) { res['screen' + i] = { error: String(e) }; continue; }
    await new Promise(r => setTimeout(r, 250));
    const host = document.getElementById('s' + i) || document.body;
    const cards = [...host.querySelectorAll('.macro-card,.supp-card,.food-search-wrap,.water-card,.wt-chart-card,.card,.ex-list,.warmup-banner')];
    const edges = cards.map(c => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; });
    const lefts = [...new Set(edges.map(e => e[0]))];
    const rights = [...new Set(edges.map(e => e[1]))];
    // hit areas
    const small = [];
    for (const el of host.querySelectorAll('button,input,[onclick]')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.width < 44 || r.height < 44) small.push((el.className||el.tagName) + ':' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
    res['screen' + i] = {
      cards: cards.length, lefts, rights,
      bodyOverflow: document.body.scrollWidth - document.body.clientWidth,
      under44: small.length, sample: small.slice(0, 6),
    };
  }
  return res;
})()`);

const supplementControls = await evaluate(`(() => {
  renderScreen(2);
  return ['.shake-btn .supp-action', '.creat-row .supp-action'].map(selector => {
    const el = document.querySelector(selector);
    if (!el) return { selector, missing: true };
    const style = getComputedStyle(el);
    return { selector, width: parseFloat(style.width), height: parseFloat(style.height) };
  });
})()`);
assert.equal(supplementControls.length, 2);
assert.ok(supplementControls.every(x => !x.missing), 'both supplement controls must render');
assert.equal(supplementControls[0].width, supplementControls[1].width, 'supplement control widths must match');
assert.equal(supplementControls[0].height, supplementControls[1].height, 'supplement control heights must match');

/* Light-theme contrast. Flips data-theme on the live DOM and reads the
   resolved custom properties back out with getComputedStyle, so this is
   measuring what the browser actually resolved, not a hand-typed hex
   double-check. t4 is documented as decoration-only in both palettes (see
   the comments in <style>), so it is reported but not asserted at 4.5:1. */
const contrast = await evaluate(`(() => {
  document.documentElement.setAttribute('data-theme','light');
  const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  const hexToRgb = h => {
    h = h.replace('#','');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const lum = ([r, g, b]) => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (fg, bg) => {
    const L1 = lum(hexToRgb(fg)), L2 = lum(hexToRgb(bg));
    const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
    return (hi + 0.05) / (lo + 0.05);
  };
  const bg = v('--black');
  const out = { bg };
  ['--t1', '--t2', '--t3', '--t4',
   '--orange-text', '--green-text', '--purple-text', '--coral-text',
   '--blue-text', '--blue-light-text', '--red-text',
  ].forEach(t => { out[t] = +ratio(v(t), bg).toFixed(2); });
  document.documentElement.removeAttribute('data-theme');
  return out;
})()`);
console.log('CONTRAST(light, against --black)', JSON.stringify(contrast, null, 1));
const mustPass = ['--t1', '--t2', '--t3',
  '--orange-text', '--green-text', '--purple-text', '--coral-text',
  '--blue-text', '--blue-light-text', '--red-text'];
const failed = mustPass.filter(t => contrast[t] < 4.5);
assert.equal(failed.length, 0, 'below 4.5:1 in light mode: ' + failed.map(t => t + '=' + contrast[t]).join(', '));

async function probeOnboarding(width) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:true});
  return evaluate(`(async () => {
    const fullMotion = ${JSON.stringify(fullMotion)};
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    const settle = () => pause(fullMotion ? 380 : 30);
    const host = document.getElementById('onboard');
    S.today = '2026-09-01';
    S.cfg.unitHeight = 'cm';
    S.cfg.unitVol = 'ml';
    openOnboard();
    const steps = [];
    const measure = () => {
      const under44 = [];
      for (const el of host.querySelectorAll('button,input,[onclick]')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.width < 44 || r.height < 44) under44.push((el.id || el.className || el.tagName) + ':' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
      return {
        step: S.ob.step,
        label: host.querySelector('.ob-progress-meta span:last-child')?.textContent || '',
        progressNow: Number(host.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')),
        overflow: Math.max(0, Math.ceil(host.scrollWidth - host.clientWidth), Math.ceil(document.documentElement.scrollWidth - document.documentElement.clientWidth)),
        under44,
      };
    };
    const advance = async () => { host.querySelector('.ob-btn-p').click(); await settle(); };

    await settle();
    steps.push(measure());
    document.getElementById('ob-n').value = 'Layout test';
    await advance();

    steps.push(measure());
    const forwardShift = getComputedStyle(host.querySelector('.ob-stage')).getPropertyValue('--ob-shift').trim();
    const invalidStage = host.querySelector('.ob-stage');
    host.querySelector('.ob-btn-p').click();
    const validationFocus = S.ob.step === 1 && invalidStage === host.querySelector('.ob-stage') &&
      document.activeElement?.id === 'ob-h' && host.querySelector('.ob-err')?.classList.contains('show');
    document.getElementById('ob-h').value = '171.5';
    document.getElementById('ob-bd').value = '1995-01-01';
    await advance();

    steps.push(measure());
    host.querySelector('.ob-btn-s').click();
    await settle();
    const backShift = getComputedStyle(host.querySelector('.ob-stage')).getPropertyValue('--ob-shift').trim();
    const backDirection = S.ob.step === 1 && host.querySelector('.ob-stage')?.classList.contains('ob-back');
    await advance();
    const optionStage = host.querySelector('.ob-stage');
    const pounds = host.querySelector('[data-ob-key="units"][data-ob-value="lb"]');
    const kilos = host.querySelector('[data-ob-key="units"][data-ob-value="kg"]');
    pounds.click();
    const stableOptions = optionStage === host.querySelector('.ob-stage') && pounds.classList.contains('on') && pounds.getAttribute('aria-pressed') === 'true';
    kilos.click();
    document.getElementById('ob-w').value = '72';
    document.getElementById('ob-t').value = '65';
    await advance();

    steps.push(measure());
    const toggleStage = host.querySelector('.ob-stage');
    const glp = host.querySelector('[data-ob-toggle="glp1"]');
    glp.click();
    const stableToggle = toggleStage === host.querySelector('.ob-stage') && glp.classList.contains('on') && glp.getAttribute('aria-pressed') === 'true';
    host.querySelector('.ob-btn-p').click();
    const summaryInitial = Object.fromEntries([...host.querySelectorAll('[data-ob-summary]')].map(el => [el.dataset.obSummary, el.textContent]));
    await settle();

    steps.push(measure());
    const summaryMid = Object.fromEntries([...host.querySelectorAll('[data-ob-summary]')].map(el => [el.dataset.obSummary, el.textContent]));
    await pause(fullMotion ? 900 : 30);
    const targets = computeTargets(S.ob.d);
    const expected = {
      calories: targets.calories + ' kcal', protein: targets.protein + ' g',
      carbs: targets.carbs + ' g', fat: targets.fat + ' g',
      water: fmtVolBig(targets.water), steps: targets.steps.toLocaleString(),
      sessions: S.ob.d.sessions + ' a week',
    };
    const actual = Object.fromEntries([...host.querySelectorAll('[data-ob-summary]')].map(el => [el.dataset.obSummary, el.textContent]));
    return {
      width: ${width}, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, documentHidden: document.hidden,
      steps, forwardShift, backShift, backDirection, validationFocus,
      stableOptions, stableToggle, summaryInitial, summaryMid, targets, expected, actual,
    };
  })()`);
}

const onboarding = [];
for (const width of [360, 320]) onboarding.push(await probeOnboarding(width));
for (const result of onboarding) {
  assert.deepEqual(result.steps.map(s => s.step), [0, 1, 2, 3, 4], result.width + 'px must reach all five onboarding steps');
  assert.deepEqual(result.steps.map(s => s.label), ['Step 1 of 5', 'Step 2 of 5', 'Step 3 of 5', 'Step 4 of 5', 'Step 5 of 5']);
  assert.ok(result.steps.every(s => s.progressNow === s.step + 1), result.width + 'px progress must match the active step');
  assert.ok(result.steps.every(s => s.overflow === 0), result.width + 'px onboarding overflowed horizontally');
  assert.ok(result.steps.every(s => s.under44.length === 0), result.width + 'px onboarding has controls under 44px: ' + JSON.stringify(result.steps.flatMap(s => s.under44)));
  assert.equal(result.forwardShift, '18px', 'forward onboarding motion must enter from the right');
  assert.equal(result.backShift, '-18px', 'back onboarding motion must reverse the same spatial effect');
  assert.equal(result.backDirection, true, 'Back must render the prior onboarding step');
  assert.equal(result.validationFocus, true, 'validation must focus the offending field without rebuilding the step');
  assert.equal(result.stableOptions, true, 'option selection must not rebuild the active step');
  assert.equal(result.stableToggle, true, 'toggle selection must not rebuild the active step');
  assert.deepEqual(result.actual, result.expected, result.width + 'px summary must settle on computeTargets values');
  assert.equal(result.reducedMotion, !fullMotion, 'motion emulation did not match the requested probe mode');
  if (fullMotion) {
    assert.equal(result.documentHidden, false, 'full-motion proof requires visible headful Chrome');
    assert.notDeepEqual(result.summaryInitial, result.expected, 'full-motion summary must begin at zero');
    assert.notDeepEqual(result.summaryMid, result.expected, 'full-motion summary rows must remain staggered mid-reveal');
  } else {
    assert.deepEqual(result.summaryInitial, result.expected, 'reduced motion must publish exact values immediately');
  }
}

console.log('BASE   ', JSON.stringify(base, null, 1));
console.log('SCREENS', JSON.stringify(perScreen, null, 1));
console.log('SUPPLEMENTS', JSON.stringify(supplementControls, null, 1));
console.log('ONBOARDING (' + (fullMotion ? 'full motion' : 'reduced motion') + ', CDP ' + debugPort + ')', JSON.stringify(onboarding, null, 1));
console.log('ERRORS ', errors.length ? errors.slice(0, 10) : 'none');

await cleanupAndWait();
process.exit(0);
