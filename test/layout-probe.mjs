/* End to end check of the shipped app in real Chrome over CDP.
   No dependencies: Node 24 has a native WebSocket. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8899/fittrack.html';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ftchrome-'));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=9333', `--user-data-dir=${profile}`,
  '--window-size=360,800', '--force-device-scale-factor=1', 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch('http://127.0.0.1:9333/json/list');
      const list = await r.json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(500);
  }
  throw new Error('chrome devtools never came up');
}

const ws = new WebSocket(await target());
await new Promise(r => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise(res => {
  const n = ++id; pending.set(n, res);
  ws.send(JSON.stringify({ id: n, method, params }));
});

const errors = [];
await send('Runtime.enable');
await send('Log.enable');
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown')
    errors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error')
    errors.push(m.params.entry.text);
});

await send('Emulation.setDeviceMetricsOverride',{width:360,height:800,deviceScaleFactor:1,mobile:true});
 await send('Page.enable');
await send('Page.navigate', { url: URL });
await sleep(4000);

async function evaluate(expr) {
  const r = await send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: true,
  });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
  return r.result?.result?.value;
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

console.log('BASE   ', JSON.stringify(base, null, 1));
console.log('SCREENS', JSON.stringify(perScreen, null, 1));
console.log('ERRORS ', errors.length ? errors.slice(0, 10) : 'none');

ws.close(); chrome.kill();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
