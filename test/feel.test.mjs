// Run: node test/feel.test.mjs. Chrome emulation is not a Safari/device claim.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { browser, root, sleep } from './cdp.mjs';

// No grandfathered defects. Calendar width is the explicit geometry exception below.
export const KNOWN = [];
const devices = [
  { name: 'S26', width: 384, height: 832, deviceScaleFactor: 3.75, ua: 'Mozilla/5.0 (Linux; Android 16; SM-S948B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36' },
  { name: 'iPhone', width: 393, height: 852, deviceScaleFactor: 3, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1' },
];
const screens = ['Home', 'Workout', 'Nutrition', 'Progress', 'Settings'];
const appHash = createHash('sha256').update(fs.readFileSync(path.join(root, 'fittrack.html'))).digest('hex');
// Copy the capture tool's seed functions verbatim at runtime, without importing
// its executable main (which would launch a second Chrome and write media).
const capture = fs.readFileSync(path.join(root, 'tools/capture-media.mjs'), 'utf8');
const start = capture.indexOf('function pad('), end = capture.indexOf('/*', capture.indexOf('return { schema: 2, today, settings, weights, logs };', start));
if (start < 0 || end < 0) throw new Error('capture-media demo seed boundary changed');
const seed = vm.runInNewContext(capture.slice(start, end) + '\nbuildDemoSeed(new Date())');
const sentinelPath = path.join(process.env.FITTRACK_PRIVATE_DIR || path.join(os.homedir(), 'projects', 'fittrack-private'), 'sentinels.json');
const privacyTokens = fs.existsSync(sentinelPath) ? JSON.parse(fs.readFileSync(sentinelPath, 'utf8')) : null;
if (privacyTokens && (!Array.isArray(privacyTokens) || privacyTokens.some(t => typeof t !== 'string' || !t))) throw new Error('Invalid private sentinel list');
if (!privacyTokens) console.log('Privacy assertion skipped: private sentinels.json absent (expected in CI).');

function inspect(reduced = false) {
  const findings = [];
  const pathFor = el => {
    if (!el || el.nodeType !== 1) return '(document)';
    if (el.id) return '#' + CSS.escape(el.id);
    const part = el.tagName.toLowerCase() + [...el.classList].map(c => '.' + CSS.escape(c)).join('');
    return pathFor(el.parentElement) + ' > ' + part + ':nth-child(' + ([...el.parentElement.children].indexOf(el) + 1) + ')';
  };
  const emit = (kind, el, detail, property = '') => findings.push({ kind, selector: pathFor(el), classes: [...(el?.classList || [])], id: el?.id || '', onclick:el?.getAttribute('onclick'), href:el?.getAttribute('href'), detail, property });
  const forbidden = name => /^(height|max-height|width|top|left|right|bottom|margin.*|padding.*|box-shadow|all)$/.test(name.replace(/[A-Z]/g, c => '-' + c.toLowerCase()));
  const seconds = value => value.split(',').map(s => parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000));
  const active = document.querySelector('#s' + S.screen);
  const sheet = document.querySelector('#sheet-wrap.show');
  const roots = sheet ? [sheet] : [active, document.querySelector('#tab-bar'), document.querySelector('#workout-rest.show'), document.querySelector('#toast.show')];
  const inState = new Set(roots.filter(Boolean).flatMap(el => [el, ...el.querySelectorAll('*')]));
  const elements = [...document.querySelectorAll('*')];
  // Audit animation effects while they are still running, then finish them so
  // geometry is measured at the destination, never at a halfway sheet position.
  for (const animation of document.getAnimations()) {
    const target = animation.effect?.target;
    for (const frame of animation.effect?.getKeyframes() || []) for (const key of Object.keys(frame)) {
      if (!reduced && forbidden(key)) emit('motion', target, 'animation ' + key, key.replace(/[A-Z]/g, c => '-' + c.toLowerCase()));
    }
    if (reduced && animation.playState === 'running' && Number(animation.effect?.getComputedTiming().duration) > 1)
      emit('reduced', target, 'running duration ' + animation.effect.getComputedTiming().duration + 'ms');
    try { animation.finish(); } catch {}
  }
  for (const el of elements) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || !el.getClientRects().length) continue;
    for (const pseudo of [null, '::before', '::after']) {
      const cs = pseudo ? getComputedStyle(el, pseudo) : style;
      if (pseudo && ['none', 'normal'].includes(cs.content)) continue;
      const durations = seconds(cs.transitionDuration);
      cs.transitionProperty.split(',').map(s => s.trim()).forEach((property, i) => {
        if (!reduced && forbidden(property) && durations[i % durations.length] > 0) emit('motion', el, (pseudo || '') + ' transition ' + property, property);
      });
      if (reduced && Math.max(...durations, ...seconds(cs.animationDuration)) > 1)
        emit('reduced', el, (pseudo || '') + ' declared duration >1ms');
    }
    if (reduced || !inState.has(el)) continue;
    if (/(val|num|big|ring|cal|count|stat)/i.test(el.className?.baseVal ?? el.className ?? '') && /^\s*[+−-]?\d[\d.,\s/%a-zA-Z°:+−-]*\s*$/.test(el.textContent) && !style.fontVariantNumeric.includes('tabular-nums'))
      emit('numeric', el, 'font-variant-numeric=' + style.fontVariantNumeric);
    if (el.matches('input[type=number],input[inputmode=numeric],input[inputmode=decimal]') && !style.fontVariantNumeric.includes('tabular-nums')) emit('numeric',el,'numeric input lacks tabular-nums');
    if (!el.matches('button,a,input,select,textarea,[onclick],[role=button],[role=switch],[tabindex]')) continue;
    if (el.matches('div[onclick],span[onclick]') && (el.getAttribute('role') !== 'button' || el.tabIndex < 0)) emit('keyboard',el,'missing button semantics');
    if (el.closest('[inert]') || el.closest('.ex-body')?.getBoundingClientRect().height === 0) continue;
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const rect = el.getBoundingClientRect();
    if (rect.right <= 0 || rect.left >= innerWidth || rect.bottom <= 0 || rect.top >= innerHeight) continue;
    // Calendar is the sole width exception: seven card columns, each at least 48px tall.
    const box = { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    const width = box.right - box.left, height = box.bottom - box.top;
    const hit = document.elementFromPoint((box.left + box.right) / 2, (box.top + box.bottom) / 2);
    const reached = hit === el || el.contains(hit);
    if ((!el.matches('.cal-cell') && width < 48 - 0.01) || height < 48 - 0.01 || !reached)
      emit('hit', el, width.toFixed(1) + 'x' + height.toFixed(1) + (reached ? '' : ' centre blocked by ' + pathFor(hit)));
  }
  if (!reduced) for (const el of [active, sheet, document.documentElement, document.body].filter(Boolean))
    if (el.scrollWidth > el.clientWidth + 1) emit('overflow', el, el.scrollWidth + ' > ' + el.clientWidth);
  return findings;
}

let app;
const failures = new Map(), known = new Map(), consoleErrors = [];
const keyFor = item => [item.kind, item.selector, item.property, item.detail].join('|');
function record(items, context, counts) {
  for (const item of items) {
    const exception = !item.detail.includes('centre blocked') && KNOWN.find(entry => entry.kind === item.kind && (!entry.property || entry.property === item.property) && (entry.id ? item.id === entry.id : entry.onclick ? item.onclick === entry.onclick : entry.href ? item.href === entry.href : item.classes.includes(entry.className)));
    const key = keyFor(item);
    if (exception) { const exceptionKey=JSON.stringify(exception); known.set(exceptionKey, { ...item, package: exception.package, context, exception }); counts.known++; }
    else { const failureKey=key+'|'+context;if(!failures.has(failureKey))console.log('FAIL '+item.kind+' '+context+' '+item.selector+' '+item.detail);failures.set(failureKey, { ...item, context }); counts.fail++; }
  }
}
async function main() {
  app = await browser();
  app.onEvent(message => {
    if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') consoleErrors.push(message.params.args.map(arg => arg.value ?? arg.description).join(' '));
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') consoleErrors.push(message.params.entry.text);
  });
  await app.send('Page.navigate', { url: app.url });
  for (let i = 0; i < 100; i++) { if (await app.evaluate("typeof renderScreen==='function' && typeof S!=='undefined'")) break; if (i === 99) throw new Error('App failed to boot'); await sleep(100); }
  await app.evaluate(`(() => {localStorage.clear(); const seed=${JSON.stringify(seed)}; for(const [key,value] of Object.entries({schema:seed.schema,settings:seed.settings,weights:seed.weights,logs:seed.logs,custom_foods:[]}))localStorage.setItem('ft_'+key,JSON.stringify(value));})()`);
  await app.send('Page.reload');
  for (let i = 0; i < 100; i++) { if (await app.evaluate("typeof S!=='undefined' && S.cfg?.name==='Alex' && S.workout?.days?.length && S.foods?.length")) break; if (i === 99) throw new Error('Demo seed/data did not load'); await sleep(100); }
  console.log('Seed: capture-media Alex demo only. One Chrome, no motion overrides.');
  console.log('App SHA256: ' + appHash);
  for (const device of devices) {
    await app.send('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: device.deviceScaleFactor, mobile: true });
    await app.send('Emulation.setUserAgentOverride', { userAgent: device.ua });
    // Device detection can be cached at app boot, so UA changes need a reload.
    await app.send('Page.reload');
    await sleep(200);
    for (let i=0;i<100;i++) {
      if(await app.evaluate("typeof S!=='undefined' && S.cfg?.name==='Alex' && S.workout?.days?.length && S.foods?.length"))break;
      if(i===99)throw new Error('Device reload did not initialize demo data');
      await sleep(100);
    }
    for (const theme of ['dark', 'light']) {
      console.log(`\n${device.name} ${device.width}x${device.height} DPR ${device.deviceScaleFactor} ${theme}`);
      console.log('Screen     states  known  fail');
      await app.evaluate(`setTheme('${theme}')`);
      // Sheets close with an animation and stay modal until closed (P6): wait for it.
      const closeModals = async () => { await app.evaluate('closeSheet()'); for (let i = 0; i < 60; i++) { if (await app.evaluate("!document.querySelector('dialog[open]')")) return; await sleep(25); } throw new Error('A dialog did not close'); };
      for (let index = 0; index < screens.length; index++) {
        const counts = { known: 0, fail: 0 }, context = `${device.name}/${theme}/${screens[index]}`;
        await app.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
        await closeModals(); await app.evaluate(`go(${index});`);
        await sleep(100);
        if (index === 1) await app.evaluate("(() => {document.querySelector('.ex-hdr')?.click(); const exerciseId=document.querySelector('.ex-card')?.id.replace(/^ec-/,''); if(exerciseId)startRest(exerciseId,60);})()");
        const inspectState = async (label, replay) => {
          await sleep(100);
          if (privacyTokens) {
            const text = (await app.evaluate('document.body.innerText')).replace(/Built by[\s\S]*?All rights reserved\./, ''); // the author credit is attribution, not private data
            if (privacyTokens.some(t => text.includes(t))) throw new Error('Privacy violation in demo media text: '+label+' sentinel indexes '+privacyTokens.map((t,i)=>text.includes(t)?i:null).filter(i=>i!==null));
          }
          record(await app.evaluate(`(${inspect.toString()})(false)`), context + '/' + label, counts);
          await app.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
          await app.evaluate(replay);
          record(await app.evaluate(`(${inspect.toString()})(true)`), context + '/' + label, counts);
          await sleep(110); // manual sheet handoff has a deferred opener
          record(await app.evaluate(`(${inspect.toString()})(true)`), context + '/' + label, counts);
          await app.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
        };
        await inspectState('screen', `renderScreen(${index})`);
        if (index === 1) await app.evaluate('Object.keys(S.restTimers).forEach(stopRest)');
        if (index === 2) {
          await app.evaluate("document.querySelector('#fsearch').value='chicken';handleSearch('chicken');clearTimeout(S.searchTimer);runSearch('chicken');clearTimeout(S.searchTimer)");
          await inspectState('food-search', "document.querySelector('#fsearch').value='chicken';handleSearch('chicken');clearTimeout(S.searchTimer);runSearch('chicken');clearTimeout(S.searchTimer)");
        }
        const triggers = await app.evaluate(`(() => {const seen=new Set(); return [...document.querySelectorAll('#s${index} [onclick]')].filter(el=>el.getClientRects().length).map(el=>el.getAttribute('onclick')).filter(code=>/^(open\\w+|showDay|confirmWholeSession|confirmClear|pickMealType)\\(/.test(code)).filter(code=>{const key=/^openStepsSheet\\(/.test(code)?'steps':/^showDay\\(/.test(code)?(code.includes(S.today)?'day-today':'day-other'):code;if(seen.has(key))return false;seen.add(key);return true;});})()`);
        let states = index === 2 ? 2 : 1;
        const visited = new Set();
        for (let t = 0; t < triggers.length; t++) {
          const code = triggers[t];
          if (visited.has(code)) continue;
          visited.add(code);
          await closeModals();
          await app.evaluate(code);
          await sleep(110);
          if (!await app.evaluate("!!document.querySelector('#sheet-wrap.show')")) throw new Error('Sheet trigger did not open: ' + code);
          await inspectState(code, code); states++;
          const nested = await app.evaluate("[...document.querySelectorAll('#sheet-wrap [onclick]')].map(el=>el.getAttribute('onclick')).filter(code=>/^(openManualSheet|pickMealType|openHelp)\\(/.test(code))");
          for (const next of nested) if (!visited.has(next) && !triggers.includes(next)) triggers.push(next);
        }
        await closeModals();
        console.log(`${screens[index].padEnd(10)} ${String(states).padStart(5)} ${String(counts.known).padStart(6)} ${String(counts.fail).padStart(5)}`);
      }
    }
  }
  // Div buttons must activate with both keyboard keys and show a visible focus ring.
  await app.evaluate('go(1)');await sleep(200);
  await app.evaluate("document.querySelector('.ex-hdr').focus()");
  for(const key of ['Enter',' ']){
    const opened=await app.evaluate("document.querySelector('.ex-card').classList.contains('open')");
    await app.send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key==='Enter'?'Enter':'Space',windowsVirtualKeyCode:key==='Enter'?13:32});
    await app.send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key==='Enter'?'Enter':'Space',windowsVirtualKeyCode:key==='Enter'?13:32});
    if(await app.evaluate("document.querySelector('.ex-card').classList.contains('open')")===opened)throw new Error('Exercise header did not activate with '+key);
  }
  if(!await app.evaluate("getComputedStyle(document.querySelector('.ex-hdr')).outlineStyle!=='none'"))throw new Error('Keyboard focus is not visible');
  // Exercise the delegated success contract, including a real pointer event.
  await app.send('Emulation.setUserAgentOverride', {userAgent:devices[0].ua});
  await app.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await app.evaluate(`(() => {
    window.p5VibrationDescriptor=Object.getOwnPropertyDescriptor(navigator,'vibrate');
    window.p5Pulses=[];Object.defineProperty(navigator,'vibrate',{configurable:true,value:ms=>{p5Pulses.push(ms);return true;}});
    window.saveP5Fixture=()=>{DB.set('ft_p5_fixture',1);DB.set('ft_p5_fixture',2);};
    const host=document.createElement('div');host.id='p5-contract';host.style.cssText='position:fixed;top:60px;left:20px;z-index:10000;display:flex;gap:10px';
    host.innerHTML='<button id="p5-action" onclick="saveP5Fixture()">Save</button><button id="p5-neighbor">Next</button>';document.body.append(host);
  })()`);
  const box=await app.evaluate("document.querySelector('#p5-action').getBoundingClientRect().toJSON()");
  const before=await app.evaluate("document.querySelector('#p5-neighbor').getBoundingClientRect().toJSON()");
  await app.send('Input.dispatchMouseEvent',{type:'mousePressed',x:box.x+box.width/2,y:box.y+box.height/2,button:'left',clickCount:1});
  if(!await app.evaluate("document.querySelector('#p5-action').matches(':active')"))throw new Error('Pointerdown did not activate press state');
  await sleep(40); // Allow the press transition its first frames, not the click or release.
  const press=await app.evaluate("({active:document.querySelector('#p5-action').matches(':active'),opacity:getComputedStyle(document.querySelector('#p5-action')).opacity,neighbor:document.querySelector('#p5-neighbor').getBoundingClientRect().toJSON()})");
  if(!press.active||Number(press.opacity)>=1||Math.abs(press.neighbor.x-before.x)>.01)throw new Error('Press state missing or moves neighbor');
  await app.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:box.x+box.width/2,y:box.y+box.height/2,button:'left',clickCount:1});
  if(JSON.stringify(await app.evaluate('p5Pulses'))!=='[10]')throw new Error('Successful real pointer action must pulse exactly once');
  await app.evaluate("p5Pulses=[];saveP5Fixture();document.querySelector('#p5-neighbor').click();document.querySelector('#p5-action').onclick=()=>{};document.querySelector('#p5-action').click()");
  if(await app.evaluate('p5Pulses.length'))throw new Error('Automatic or unsuccessful action vibrated');
  await app.evaluate("document.querySelector('#p5-action').onclick=saveP5Fixture");
  for(const device of devices){
    await app.send('Emulation.setUserAgentOverride',{userAgent:device.ua});
    for(const reduced of [false,true]){
      await app.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]});
      const pulses=await app.evaluate("p5Pulses=[];document.querySelector('#p5-action').click();p5Pulses");
      if(JSON.stringify(pulses)!==JSON.stringify(device.name==='S26'&&!reduced?[10]:[]))throw new Error('Platform/reduced haptic contract failed');
    }
  }
  await app.evaluate("Object.defineProperty(navigator,'vibrate',{configurable:true,value:undefined});document.querySelector('#p5-action').click();document.querySelector('#p5-contract').remove();localStorage.removeItem('ft_p5_fixture');if(p5VibrationDescriptor)Object.defineProperty(navigator,'vibrate',p5VibrationDescriptor);else delete navigator.vibrate;delete window.saveP5Fixture;delete window.p5Pulses;delete window.p5VibrationDescriptor");
  console.log('Touch contract: real pointer press, stable neighbor, one successful pulse, no automatic/unsuccessful/iOS/reduced/unsupported pulses PASS');
  // Prove that the scanner rejects synthetic regressions, with no app edits.
  await app.send('Emulation.setEmulatedMedia', { features: [{ name:'prefers-reduced-motion', value:'no-preference' }] });
  await app.evaluate(`(() => {const host=document.querySelector('#s'+S.screen); const fixture=document.createElement('div'); fixture.id='feel-fixture'; fixture.innerHTML='<style>#feel-fixture{position:fixed;inset:0;z-index:9999;background:white}#feel-fixture button{min-width:0;min-height:0}#feel-pseudo{position:absolute;left:80px;top:80px;width:24px;height:24px;border:0;padding:0}#feel-pseudo::before{content:"";position:absolute;inset:-10px}#feel-small{position:absolute;left:10px;top:10px;width:20px;height:20px;padding:0;border:0}#feel-motion{transition:width 500ms!important}#feel-numeric{font-variant-numeric:normal!important}</style><button id="feel-small">x</button><button id="feel-pseudo">x</button><div id="feel-motion">motion</div><div id="feel-numeric" class="feel-num">123</div>';host.append(fixture);window.feelOverflow=document.createElement('div');feelOverflow.style.cssText='width:'+(innerWidth+100)+'px;height:1px';host.append(feelOverflow);})()`);
  const normalProbe = await app.evaluate(`(${inspect.toString()})(false)`);
  for (const kind of ['motion','hit','numeric','overflow']) if (!normalProbe.some(item => item.kind === kind && (item.selector.startsWith('#feel-') || kind === 'overflow'))) throw new Error('Scanner self-check missed ' + kind);
  if (!normalProbe.some(item => item.kind==='hit' && item.selector==='#feel-pseudo')) throw new Error('Scanner accepted an invisible pseudo target extension');
  await app.evaluate("(() => {const target=document.createElement('button');target.id='feel-blocked';target.style.cssText='position:absolute;left:160px;top:80px;width:48px;height:48px';document.querySelector('#feel-fixture').append(target);const cover=document.createElement('div');cover.style.cssText='position:absolute;left:160px;top:80px;width:48px;height:48px';target.after(cover);})()");
  const blockedProbe=await app.evaluate(`(${inspect.toString()})(false)`);
  if(!blockedProbe.some(item=>item.kind==='hit'&&item.selector==='#feel-blocked'&&item.detail.includes('centre blocked')))throw new Error('Scanner self-check missed blocked target');
  await app.send('Emulation.setEmulatedMedia', { features: [{ name:'prefers-reduced-motion', value:'reduce' }] });
  await app.evaluate("document.querySelector('#feel-motion').animate([{transform:'translateX(0)'},{transform:'translateX(10px)'}],{duration:500})");
  const reducedProbe = await app.evaluate(`(${inspect.toString()})(true)`);
  if (!reducedProbe.some(item => item.kind==='reduced' && item.selector==='#feel-motion')) throw new Error('Scanner self-check missed reduced motion');
  await app.evaluate("document.querySelector('#feel-fixture').remove();feelOverflow.remove();delete window.feelOverflow");
  console.log('Scanner self-check: motion, small/blocked targets, pseudo extension rejection, overflow, numeric and reduced motion PASS');
  // Registration warnings are not errors. Only this exact documented browser
  // error is exempt, never a substring such as all service-worker failures.
  const SW_ERROR = "SW registration failed TypeError: Failed to register a ServiceWorker: The document is in an invalid state.";
  for (const message of new Set(consoleErrors)) if (message !== SW_ERROR) failures.set('console|' + message, { kind: 'console', context: 'browser', detail: message });
  for (const item of known.values()) console.log(`known ${item.package} ${item.kind} ${item.exception.className ? '.'+item.exception.className : item.exception.id ? '#'+item.exception.id : item.exception.onclick || item.exception.href} ${item.detail}`);
  for (const item of failures.values()) console.log(`FAIL ${item.kind} ${item.context} ${item.selector || ''} ${item.detail}`);
}
const started = Date.now();
try { await main(); } catch (error) { failures.set('runner', { kind: 'runner', detail: error.stack }); console.log('FAIL runner ' + error.stack); }
finally { try { await app?.close(); if(app)console.log(`Cleanup: Chrome CDP ${app.port} closed; ${app.startedServer?'owned server closed':'shared server retained'}`); } catch(error) { failures.set('cleanup',{kind:'cleanup',detail:error.message});console.log('FAIL cleanup '+error.message); } }
console.log(`Elapsed: ${((Date.now() - started) / 1000).toFixed(1)}s (correctness gate, no frame benchmark)`);
console.log(failures.size ? `VERDICT: FAIL (${failures.size})` : 'VERDICT: PASS');
process.exitCode = failures.size ? 1 : 0;
