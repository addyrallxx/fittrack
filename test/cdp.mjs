// Dependency-free Chrome/CDP lifecycle shared by browser checks.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const portFree = port => new Promise(resolve => {
  const socket = net.createServer();
  socket.once('error', () => resolve(false));
  socket.listen(port, '127.0.0.1', () => socket.close(() => resolve(true)));
});
export async function browser() {
  let server, chrome, ws, profile;
  const pending = new Map(), listeners = [];
  let id = 0;
  async function close() {
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error('CDP closed')); }
    pending.clear();
    ws?.close();
    for (const child of [chrome, server]) if (child && child.exitCode === null) {
      child.kill();
      await Promise.race([new Promise(resolve => child.once('exit', resolve)), sleep(2000)]);
    }
    if (profile) fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
  try {
    if (await portFree(8899)) server = spawn(process.execPath, ['serve.mjs'], { cwd: root, stdio: 'ignore' });
    const url = 'http://127.0.0.1:8899/fittrack.html';
    let serving = false;
    for (let i = 0; i < 40; i++) {
      try { const response = await fetch(url, { signal: AbortSignal.timeout(1000) }); if (response.ok && (await response.text()).includes('renderScreen')) { serving = true; break; } } catch {}
      await sleep(100);
    }
    if (!serving) throw new Error('Port 8899 is not serving FitTrack');
    let port;
    for (let candidate = 9340; candidate < 9440; candidate++) if (await portFree(candidate)) { port = candidate; break; }
    if (!port) throw new Error('No free CDP port');
    profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-feel-'));
    chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
    ], { stdio: 'ignore' });
    let endpoint;
    for (let i = 0; i < 60; i++) {
      try { endpoint = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(tab => tab.type === 'page')?.webSocketDebuggerUrl; } catch {}
      if (endpoint) break;
      await sleep(100);
    }
    if (!endpoint) throw new Error('Chrome did not expose CDP');
    ws = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      const request = pending.get(message.id);
      if (request) { clearTimeout(request.timer); pending.delete(message.id); message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result); }
      else for (const listener of listeners) listener(message);
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const n = ++id;
      const timer = setTimeout(() => { pending.delete(n); reject(new Error(`CDP timeout: ${method}`)); }, 10000);
      pending.set(n, { resolve, reject, timer }); ws.send(JSON.stringify({ id: n, method, params }));
    });
    const evaluate = async expression => {
      const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
      return response.result?.value;
    };
    await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
    return { send, evaluate, onEvent: fn => listeners.push(fn), close, url, port, startedServer:!!server };
  } catch (error) { await close(); throw error; }
}
