/* The guard that would have caught the April black screen.
 *
 * fittrack.html carries its entire application inside one inline <script>, so
 * a syntax error there is invisible to every tool in the repo and shows up
 * only as a blank white app on his phone. Node cannot parse HTML, so pull the
 * script out and hand the bare JavaScript to node --check.
 *
 * Runs on the JSON data files too, because a stray trailing comma in
 * data/foods/*.json breaks the food logger exactly as completely.
 *
 * Usage: node test/syntax-check.mjs
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = path.join(root, '.syntax-check.tmp.js');
let failed = 0;

const ok = m => console.log('PASS  ' + m);
const bad = (m, e) => { failed++; console.log('FAIL  ' + m + '\n      ' + String(e).split('\n').slice(0, 6).join('\n      ')); };

function checkJs(file) {
  const rel = path.relative(root, file);
  if (!fs.existsSync(file)) return bad(rel, 'missing');
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); ok(rel); }
  catch (e) { bad(rel, e.stderr ? e.stderr.toString() : e); }
}

function checkInlineScripts(file) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  if (!blocks.length) return bad(rel, 'no inline script block found, so this check is silently doing nothing');
  blocks.sort((a, b) => b.length - a.length);
  blocks.forEach((code, i) => {
    fs.writeFileSync(tmp, code);
    try {
      execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
      ok(rel + ' inline script ' + (i + 1) + ' (' + code.length + ' chars)');
    } catch (e) {
      // Line numbers are relative to the extracted block, not the html file.
      bad(rel + ' inline script ' + (i + 1), e.stderr ? e.stderr.toString() : e);
    }
  });
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}

function checkJson(file) {
  const rel = path.relative(root, file);
  try { JSON.parse(fs.readFileSync(file, 'utf8')); ok(rel); }
  catch (e) { bad(rel, e.message); }
}

function walkJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return walkJson(full);
    return d.name.endsWith('.json') ? [full] : [];
  });
}

checkInlineScripts(path.join(root, 'fittrack.html'));
checkJs(path.join(root, 'sw.js'));
checkJs(path.join(root, 'worker', 'src', 'index.js'));
for (const f of ['manifest.json', 'worker/package.json']) checkJson(path.join(root, f));
for (const f of walkJson(path.join(root, 'data'))) checkJson(f);

console.log('\nVERDICT: ' + (failed ? 'FAIL (' + failed + ' broken)' : 'PASS'));
process.exit(failed ? 1 : 0);
