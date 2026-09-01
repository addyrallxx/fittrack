/* Screenshot + tour GIF capture for the FitTrack PWA, from a seeded demo
   profile only. Never captures the real owner's data.

   Usage:
     node tools/capture-media.mjs [outDir] [--write-manifest]

   outDir defaults to docs/ (screenshots go to <outDir>/screenshots/*.png,
   the tour GIF to <outDir>/media/fittrack-tour.gif). Pass a scratch
   directory to dry-run the whole pipeline without touching the real
   deliverables.

   --write-manifest additionally patches manifest.json's screenshots[]
   sizes and the README.md tour alt text for the files this run produced.
   It is off by default on purpose: a dry run into a scratch directory
   must never touch manifest.json or README.md, and even a "real" run
   should only rewrite them when someone deliberately asks.

   No dependencies: reuses the exact CDP pattern from test/layout-probe.mjs,
   real headless Chrome driven over Node 24's native WebSocket. */
import { spawn, spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 8899;
let DEBUG_PORT = 9334; // starting point; picked fresh at startup, see pickFreePort()
const URL = `http://127.0.0.1:${PORT}/fittrack.html`;

const rawArgs = process.argv.slice(2);
const flags = new Set(rawArgs.filter(a => a.startsWith('--')));
const positional = rawArgs.filter(a => !a.startsWith('--'));
const outDir = path.resolve(positional[0] || path.join(REPO_ROOT, 'docs'));
const screenshotsDir = path.join(outDir, 'screenshots');
const mediaDir = path.join(outDir, 'media');
const WRITE_MANIFEST = flags.has('--write-manifest');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];

/* ── DEMO PROFILE ──────────────────────────────────────────────────────
   Reviewable, fixed shape. Only the calendar anchor moves with "today",
   because the app's own streaks/charts/dose schedule are all computed
   relative to today (recentDates(), calcStreak(), doseSummary()), so a
   hardcoded absolute date would rot the moment this script isn't run on
   the day it was written.

   name Alex, 178cm, 84.0 -> 81.2 kg trending to a 76.0 target, RHR 58,
   glp1 on with a generic "Semaglutide" label, three past dose steps and
   one future one, two completed gym sessions forming a small streak. */
function pad(n) { return String(n).padStart(2, '0'); }
function fmtDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function addDays(base, days) { const d = new Date(base); d.setDate(d.getDate() + days); return d; }

function demoMealsFor(date) {
  const t = date + 'T12:00:00.000Z';
  return [
    { id: 'm_demo_' + date + '_1', foodId: null, name: 'Chicken and rice bowl', cal: 620, protein: 52, carbs: 68, fat: 12, mealType: 'Lunch', time: t },
    { id: 'm_demo_' + date + '_2', foodId: null, name: 'Whey protein shake', cal: 180, protein: 30, carbs: 6, fat: 3, mealType: 'Snack', time: t },
    { id: 'm_demo_' + date + '_3', foodId: null, name: 'Greek yogurt and berries', cal: 260, protein: 22, carbs: 30, fat: 6, mealType: 'Breakfast', time: t },
  ];
}

function buildDemoSeed(now) {
  const today = fmtDate(now);
  const programStart = fmtDate(addDays(now, -42));

  const weights = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11; // 0 -> 1 across the 12 readings
    const daysAgo = Math.round(42 * (1 - t));
    const date = fmtDate(addDays(now, -daysAgo));
    const weight = Math.round((84.0 - 2.8 * t) * 10) / 10; // 84.0 -> 81.2
    weights.push({ date, weight });
  }

  const settings = {
    name: 'Alex',
    units: 'kg',
    profile: { heightCm: 178, birthday: '1996-04-12', sex: 'male' },
    programStart,
    targets: { calories: 1800, protein: 150, carbs: 165, fat: 60, water: 3500, steps: 8000, creatine: 5 },
    proteinPowder: true,
    body: { currentWeight: 81.2, startingWeight: 84.0, targetWeight: 76.0, bodyFat: 22, startBodyFat: 25, muscleMass: 56.4 },
    notifications: { water: { enabled: true }, gym: { enabled: true }, weight: { enabled: true }, dose: { enabled: true } },
    glp1: true,
    dose: {
      med: 'Semaglutide',
      steps: [
        { date: fmtDate(addDays(now, -42)), mg: 0.25 },
        { date: fmtDate(addDays(now, -28)), mg: 0.5 },
        { date: fmtDate(addDays(now, -14)), mg: 1.0 },
        { date: fmtDate(addDays(now, 7)), mg: 1.0 }, // one confirmed future step
      ],
    },
    gymTarget: 3,
    ramadanMode: false,
  };

  const logs = {};
  for (let i = 0; i < 14; i++) {
    const date = fmtDate(addDays(now, -i));
    const log = {
      date,
      workout: { completed: false, dayIndex: -1, exercises: {}, startTime: null },
      nutrition: { meals: [], water: 0 },
      checkins: { gym: false, protein: false, water: false },
      steps: 0, weight: null, creatine: 0, rhr: null,
    };
    if (i < 2) { // today + yesterday: two completed sessions -> a small streak
      log.workout = { completed: true, dayIndex: i === 0 ? 1 : 0, exercises: {}, startTime: null };
      log.checkins.gym = true;
    }
    if (i < 5) { // last 5 days: meals, water, steps, creatine
      log.nutrition.meals = demoMealsFor(date);
      log.nutrition.water = 2400 + i * 150;
      log.checkins.water = log.nutrition.water >= settings.targets.water;
      const totalProtein = log.nutrition.meals.reduce((a, m) => a + m.protein, 0);
      log.checkins.protein = totalProtein >= settings.targets.protein;
      log.creatine = settings.targets.creatine;
      log.steps = 6000 + i * 900;
      // Constant, not the real 59: three-plus readings so rhrStatus().ok is
      // true and the card shows the real message, not the generic
      // "Retatrutide can lift resting heart rate" boilerplate that only
      // shows while fewer than 3 readings exist.
      log.rhr = 58;
    }
    logs[date] = log;
  }

  return { schema: 2, today, settings, weights, logs };
}

/* ── FORBIDDEN STRINGS: the entire point of this task ──────────────────
   The owner's real health data must never appear in a captured page. Every
   number here is his, not the demo profile's, so a match proves a leak. */
const FORBIDDEN_TOKENS = ['69.4', '71.2', '70.6', '65.0', '59 bpm', 'Retatrutide'];

/* "Adnan" is handled separately: the Settings screen legitimately shows a
   static "Built by Adnan Shakib" developer credit (fittrack.html line
   ~2188), which is authorship, not a health-data leak, and untouchable
   under this run's file ownership anyway. The check below still fails hard
   if "Adnan" shows up ANYWHERE else. */

function pngDims(buf) { return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }; }

function isPortInUse(port) {
  return new Promise(resolve => {
    const sock = net.createConnection({ port, host: '127.0.0.1' });
    const done = v => { try { sock.destroy(); } catch {} resolve(v); };
    sock.once('connect', () => done(true));
    sock.once('error', () => done(false));
    sock.setTimeout(500, () => done(false));
  });
}

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(URL); if (r.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('serve.mjs never came up on port ' + PORT);
}

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const list = await r.json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(500);
  }
  throw new Error('chrome devtools never came up');
}

const RAF_OVERRIDE_SRC = `
  window.requestAnimationFrame = function(cb) {
    return setTimeout(function() { cb(performance.now() + 100000); }, 0);
  };
`; // This machine's automation Chrome reports document.hidden=true, which
   // throttles real rAF into never firing again after the first frame. The
   // app's countUp() animation is rAF-driven, so without this override the
   // home screen's ring numbers can capture stuck at 0. Forcing every rAF
   // callback to run with a timestamp far in the future makes p=1 on the
   // very first call, completing the animation instantly and deterministically.

/* The rAF override above does nothing for CSS transitions, which run on the
   compositor and are invisible to waitSettled(): that polls the DOM text, and
   a transform animating from 0 to 180 degrees never changes a single
   character. The first real capture caught .ex-chevron mid-rotation at about
   135 degrees, which renders as a right-angle corner and reads as a broken
   icon in a published screenshot.

   Zeroing every duration and delay is the same switch the app already flips
   for prefers-reduced-motion, so it lands every element on its final frame
   rather than approximating one. Injected per document, so it survives the
   reload that follows seeding. */
const MOTION_FREEZE_SRC = `
  document.addEventListener('DOMContentLoaded', function() {
    var s = document.createElement('style');
    s.id = 'capture-motion-freeze';
    s.textContent = '*,*::before,*::after{transition-duration:0s!important;' +
      'transition-delay:0s!important;animation-duration:0s!important;' +
      'animation-delay:0s!important;animation-iteration-count:1!important}';
    document.head.appendChild(s);
  });
`;

/* Found the hard way: this machine runs several agents in parallel, each
   liable to spin up its own headless-Chrome-over-CDP tooling (this repo's
   own test/layout-probe.mjs pattern, copied here, is exactly the kind of
   thing that gets copied again). A hardcoded debug port that collides with
   someone else's already-listening Chrome doesn't fail -- Chrome's own
   remote-debugging-port bind silently loses the race, and target() below
   then happily finds and drives THEIR tab instead of the one this script
   just spawned. chrome.kill() then kills the wrong (functionally inert)
   process, and the real one -- now carrying this run's seeded demo data --
   is orphaned. Confirmed on this machine: another agent's Chrome (PID
   43024, profile "ftchrome-debug-...", clearly not spawned by this script)
   was still holding 9334 from an earlier collision, showing this run's
   "Alex" seed. Scanning forward to a port nobody holds, right before
   spawning, closes that race. */
async function pickFreePort(start, tries = 20) {
  for (let p = start; p < start + tries; p++) {
    if (!(await isPortInUse(p))) return p;
  }
  throw new Error(`no free debug port found in ${start}..${start + tries - 1}`);
}

async function confirmPortFree() {
  for (let i = 0; i < 10; i++) {
    if (!(await isPortInUse(PORT))) { console.log(`Port ${PORT} confirmed free.`); return true; }
    await sleep(300);
  }
  console.warn(`WARNING: port ${PORT} still appears in use after cleanup.`);
  return false;
}

async function main() {
  if (await isPortInUse(PORT)) {
    console.error(`Port ${PORT} is already in use before this run started. That is a leftover ` +
      `server from a previous session, not something this run caused. Not starting a server or ` +
      `killing whatever is there; find and stop the stale process, then rerun.`);
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(mediaDir, { recursive: true });

  const server = spawn(process.execPath, ['serve.mjs'], { cwd: REPO_ROOT, stdio: 'ignore' });
  await waitForServer();

  DEBUG_PORT = await pickFreePort(DEBUG_PORT);
  console.log(`Using debug port ${DEBUG_PORT} for this run's Chrome instance.`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ftcapture-'));
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`,
    '--window-size=480,1040', '--force-device-scale-factor=2', 'about:blank',
  ], { stdio: 'ignore' });

  let ws;
  try {
    ws = new WebSocket(await target());
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
    const evaluate = async expr => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
      return r.result?.result?.value;
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', { source: RAF_OVERRIDE_SRC });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: MOTION_FREEZE_SRC });
    await send('Emulation.setDeviceMetricsOverride', { width: 480, height: 1040, deviceScaleFactor: 2, mobile: true });

    // First load: whatever state localStorage happens to be in (fresh
    // profile -> onboarding). We only need the document alive long enough
    // to write localStorage, then we reload so init() reads the seed.
    await send('Page.navigate', { url: URL });
    await sleep(1200);

    const seed = buildDemoSeed(new Date());
    const seeded = await evaluate(`(() => {
      localStorage.setItem('ft_schema', JSON.stringify(${seed.schema}));
      localStorage.setItem('ft_settings', ${JSON.stringify(JSON.stringify(seed.settings))});
      localStorage.setItem('ft_weights', ${JSON.stringify(JSON.stringify(seed.weights))});
      localStorage.setItem('ft_logs', ${JSON.stringify(JSON.stringify(seed.logs))});
      localStorage.setItem('ft_custom_foods', JSON.stringify([]));
      return true;
    })()`);
    assert.equal(seeded, true, 'seeding localStorage failed');

    await send('Page.navigate', { url: URL });
    await sleep(2500);

    const bootCheck = await evaluate(`(() => ({
      name: (typeof S !== 'undefined' && S.cfg) ? S.cfg.name : null,
      onboarding: !!document.querySelector('.ob-wrap, [class*=onboard]'),
    }))()`);
    assert.equal(bootCheck.name, 'Alex', 'seed did not take: S.cfg.name is ' + bootCheck.name);
    assert.equal(bootCheck.onboarding, false, 'onboarding rendered instead of the seeded state');
    console.log('Seed verified: S.cfg.name === "Alex", onboarding not shown.');

    async function pageSnapshot() {
      return evaluate(`(() => {
        const body = document.body.innerText || '';
        let aboutText = '';
        document.querySelectorAll('.settings-row').forEach(el => {
          if (el.textContent && el.textContent.includes('Built by')) aboutText += el.innerText;
        });
        const withoutAbout = aboutText ? body.split(aboutText).join('') : body;
        return { body, adnanOutsideAbout: withoutAbout.includes('Adnan'), adnanTotal: body.includes('Adnan') };
      })()`);
    }
    async function waitSettled(maxTries = 20, intervalMs = 100) {
      let prev = null, snap = null;
      for (let i = 0; i < maxTries; i++) {
        snap = await pageSnapshot();
        if (prev !== null && snap.body === prev) return { settled: true, snap };
        prev = snap.body;
        await sleep(intervalMs);
      }
      return { settled: false, snap };
    }
    function assertPrivacy(name, snap) {
      const hits = FORBIDDEN_TOKENS.filter(t => snap.body.includes(t));
      if (hits.length) throw new Error(`PRIVACY VIOLATION in ${name}: found ${JSON.stringify(hits)} in captured page text`);
      if (snap.adnanOutsideAbout) throw new Error(`PRIVACY VIOLATION in ${name}: "Adnan" appears outside the static About/credits row`);
      return { adnanTotal: snap.adnanTotal };
    }
    /* screenId set -> capture the full scrollable height of that .screen
       element (clip + captureBeyondViewport), not just the 1040-logical-px
       viewport. Settings alone is already 1485px of content before the
       concurrent light-theme/units work adds its Appearance and Units rows
       (measured directly: #s4.scrollHeight=1485 vs clientHeight=1040), so a
       plain viewport shot silently truncates the bottom of the screen --
       Data and About today, Appearance/Units once they land. A fixed-size
       shot is correct for the three screens manifest.json actually declares
       sizes for (home/workout/progress, checked to already fit in one
       viewport); everything else should show all of its content instead. */
    async function saveShot(name, priv, screenId) {
      let params = { format: 'png' };
      if (screenId) {
        const h = await evaluate(`document.getElementById('${screenId}').scrollHeight`);
        params = { format: 'png', clip: { x: 0, y: 0, width: 480, height: h, scale: 1 }, captureBeyondViewport: true };
        // #tab-bar is position:fixed, pinned to the ORIGINAL 1040px viewport
        // regardless of captureBeyondViewport, so in a taller clip it renders
        // once mid-image (at the old viewport's bottom edge) instead of at
        // the true bottom -- confirmed visually on nutrition.png. It adds
        // nothing on a full-page shot, so hide it for this one capture.
        await evaluate(`(() => { const t = document.getElementById('tab-bar'); if (t) t.style.display = 'none'; return true; })()`);
      }
      const r = await send('Page.captureScreenshot', params);
      if (screenId) {
        await evaluate(`(() => { const t = document.getElementById('tab-bar'); if (t) t.style.display = ''; return true; })()`);
      }
      const buf = Buffer.from(r.result.data, 'base64');
      const fp = path.join(screenshotsDir, name + '.png');
      fs.writeFileSync(fp, buf);
      const dims = pngDims(buf);
      results.push({ name, path: fp, bytes: buf.length, ...dims, adnanPresent: !!priv?.adnanTotal });
    }
    /* renderScreen(idx) only refills #s{idx}'s innerHTML. Visibility is a
       separate concern owned by go(idx), which slides the previous screen
       out and the new one in via an inline transform, over a 0.36s CSS
       transition kicked off inside a double-nested requestAnimationFrame.
       Screenshotting right after renderScreen() alone (as this script first
       did) captures whichever screen's inline transform happens to already
       be translateX(0) -- #s0 by its own CSS rule at boot -- regardless of
       which screen was just rendered. And screenshotting right after go()
       risks catching the slide mid-transition.
       switchTo() sidesteps both: render the real content, then set every
       screen's transform directly and instantly (transition:none), and
       update S.screen/the tab bar the same way go() does. No animation, no
       timing window to race. */
    async function switchTo(idx) {
      await evaluate(`(() => {
        renderScreen(${idx});
        document.querySelectorAll('.screen').forEach((el, i) => {
          el.style.transition = 'none';
          el.style.transform = i === ${idx} ? 'translateX(0)' : 'translateX(100%)';
        });
        S.screen = ${idx};
        updateTabs();
        return true;
      })()`);
    }
    async function captureTab(idx, name, { fullPage = false } = {}) {
      await switchTo(idx);
      const { settled, snap } = await waitSettled();
      if (!settled) console.warn(`WARNING: ${name} did not visually settle within the poll window; capturing the last observed state.`);
      const priv = assertPrivacy(name, snap);
      await saveShot(name, priv, fullPage ? `s${idx}` : null);
    }
    async function captureWorkout() {
      await switchTo(1);
      let loaded = 0;
      for (let i = 0; i < 40; i++) {
        loaded = await evaluate("(S.workout && S.workout.days) ? S.workout.days.length : 0");
        if (loaded > 0) break;
        await sleep(250);
      }
      if (!loaded) console.warn('WARNING: data/workout-program.json never loaded within 10s; workout.png will show whatever rendered.');
      await evaluate('renderScreen(1)'); // refresh in place, screen 1 is already the visible one
      const exId = await evaluate(`(() => { const c = document.querySelector('.ex-card'); return c ? c.id.replace(/^ec-/, '') : null; })()`);
      if (exId) await evaluate(`toggleEx(${JSON.stringify(exId)})`);
      else console.warn('WARNING: no .ex-card found on the workout screen; the expanded-card capture was skipped.');
      const { settled, snap } = await waitSettled();
      if (!settled) console.warn('WARNING: workout screen did not settle within the poll window.');
      const priv = assertPrivacy('workout', snap);
      await saveShot('workout', priv);
    }
    async function captureNotifications() {
      await switchTo(4);
      await evaluate('openNotifInfo()');
      const { settled, snap } = await waitSettled();
      if (!settled) console.warn('WARNING: notifications sheet did not settle within the poll window.');
      const priv = assertPrivacy('notifications', snap);
      await saveShot('notifications', priv);
      await evaluate('closeSheet()');
    }
    async function captureThemeVariants() {
      const probe = await evaluate(`(() => ({
        hasSetTheme: typeof setTheme === 'function',
        cfgHasTheme: (typeof S !== 'undefined' && S.cfg) ? ('theme' in S.cfg) : false,
      }))()`);
      if (!probe.hasSetTheme && !probe.cfgHasTheme) {
        console.warn('WARNING: no theme toggle found in this build (no setTheme() function, no ' +
          'S.cfg.theme key). Skipping home-light.png and home-dark.png -- the concurrent light-' +
          'theme work has not landed in fittrack.html yet at capture time. Rerun once it has.');
        return;
      }
      await switchTo(0); // theme captures are always the home screen; we're on notifications/settings by now
      for (const mode of ['light', 'dark']) {
        if (probe.hasSetTheme) await evaluate(`setTheme(${JSON.stringify(mode)})`);
        else await evaluate(`(() => { S.cfg.theme = ${JSON.stringify(mode)}; DB.saveSettings(S.cfg); })()`);
        await evaluate('renderScreen(0)');
        const { settled, snap } = await waitSettled();
        if (!settled) console.warn(`WARNING: home-${mode} did not settle within the poll window.`);
        const priv = assertPrivacy('home-' + mode, snap);
        await saveShot('home-' + mode, priv);
      }
    }

    await captureTab(0, 'home');
    await captureWorkout();
    await captureTab(2, 'nutrition', { fullPage: true }); // the supplements card can sit below one viewport
    await captureTab(3, 'progress');
    await captureTab(4, 'settings', { fullPage: true }); // #s4 is 1485px+ of content in a 1040px viewport; a
    await captureNotifications();                        // plain shot truncates Data/About, and would truncate
    await captureThemeVariants();                        // Appearance/Units too once that UI lands

    verifyManifestReadOnly();
    if (WRITE_MANIFEST) updateManifestAndReadme();
    buildGif();
    printReport();
  } finally {
    try { ws && ws.close(); } catch {}
    try { chrome.kill(); } catch {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
    try { server.kill(); } catch {}
    await confirmPortFree();
  }
}

function buildGif() {
  const names = ['home', 'workout', 'nutrition', 'progress', 'settings'];
  const missing = names.filter(n => !fs.existsSync(path.join(screenshotsDir, n + '.png')));
  if (missing.length) { console.warn('Skipping GIF: missing stills for ' + missing.join(', ')); return; }

  const hold = 1.6, xfade = 0.4, dur = hold + xfade, fps = 12, w = 300, h = 650;
  const inputArgs = [];
  names.forEach(n => inputArgs.push('-loop', '1', '-t', String(dur), '-i', path.join(screenshotsDir, n + '.png')));
  let filter = '';
  // nutrition and settings are captured full-page (taller than one 960x2080
  // viewport, see captureTab's fullPage option), so their scaled height
  // exceeds the other three screens'. xfade requires every input in the
  // chain to share one frame size, and a tour GIF only needs the same
  // above-the-fold view a user sees on first opening that tab anyway, so
  // crop every frame to the top 650px (== 2080 physical / 2 device scale *
  // 300/960 scale-down) after scaling. That's a no-op for the three screens
  // already exactly that height and a top-crop for the two taller ones.
  names.forEach((n, i) => { filter += `[${i}:v]scale=${w}:-2,crop=${w}:${h}:0:0,setsar=1,fps=${fps}[v${i}];`; });
  let prev = 'v0';
  for (let i = 1; i < names.length; i++) {
    const out = (i === names.length - 1) ? 'vout' : `x${i}`;
    filter += `[${prev}][v${i}]xfade=transition=fade:duration=${xfade}:offset=${(i * hold).toFixed(2)}[${out}];`;
    prev = out;
  }
  filter += `[vout]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer[outv]`;

  const gifPath = path.join(mediaDir, 'fittrack-tour.gif');
  const args = [...inputArgs, '-filter_complex', filter, '-map', '[outv]', '-y', gifPath];
  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) {
    console.error('ffmpeg stderr (tail):', (r.stderr || '').toString().slice(-2000));
    throw new Error('ffmpeg GIF build failed with exit code ' + r.status);
  }
  const buf = fs.readFileSync(gifPath);
  results.push({ name: 'fittrack-tour.gif', path: gifPath, bytes: buf.length });
}

function verifyManifestReadOnly() {
  const manifestPath = path.join(REPO_ROOT, 'manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf8');
  let manifest;
  try { manifest = JSON.parse(raw); console.log('manifest.json parses OK.'); }
  catch (e) { console.error('manifest.json FAILED to parse:', e.message); return; }
  const realDocs = path.join(REPO_ROOT, 'docs');
  if (outDir !== realDocs) {
    console.log(`outDir (${outDir}) is not docs/, so the manifest size cross-check is skipped ` +
      `(it only means something against the real deliverables).`);
    return;
  }
  for (const entry of manifest.screenshots || []) {
    const fp = path.join(REPO_ROOT, entry.src);
    if (!fs.existsSync(fp)) { console.warn('manifest references a missing file:', entry.src); continue; }
    const dims = pngDims(fs.readFileSync(fp));
    const actual = `${dims.width}x${dims.height}`;
    console.log(entry.src, entry.sizes === actual ? `size OK (${actual})` : `SIZE MISMATCH declared=${entry.sizes} actual=${actual}`);
  }
}

/* Only ever runs with --write-manifest, which this dry run never passes.
   Kept here so the real run needs no edits to this file, just the flag. */
function updateManifestAndReadme() {
  const manifestPath = path.join(REPO_ROOT, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const byName = Object.fromEntries(results.filter(r => r.width).map(r => [r.name, r]));
  let changed = false;
  manifest.screenshots = (manifest.screenshots || []).map(e => {
    const key = path.basename(e.src, '.png');
    const shot = byName[key];
    if (shot) {
      const sizes = `${shot.width}x${shot.height}`;
      if (e.sizes !== sizes) { changed = true; return { ...e, sizes }; }
    }
    return e;
  });
  if (changed) fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  const readmePath = path.join(REPO_ROOT, 'README.md');
  const readme = fs.readFileSync(readmePath, 'utf8');
  const altText = 'A tour through the home, workout, nutrition, progress and settings screens';
  const updated = readme.replace(/(src="docs\/media\/fittrack-tour\.gif"[^>]*\balt=")[^"]*(")/, `$1${altText}$2`);
  if (updated !== readme) fs.writeFileSync(readmePath, updated);
}

function printReport() {
  console.log('\n=== capture-media.mjs report ===');
  console.log('outDir:', outDir);
  for (const r of results) {
    if (r.width) console.log(`${r.name}.png  ${r.bytes} bytes  ${r.width}x${r.height}` +
      (r.adnanPresent ? '  (contains the static "Built by Adnan Shakib" credit only)' : ''));
    else console.log(`${r.name}  ${r.bytes} bytes`);
  }
}

main().catch(e => {
  console.error('CAPTURE FAILED:', e.message);
  process.exitCode = 1;
});
