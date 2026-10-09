// Builds the day-2 Gemini briefs. Lesson from the night: every tool-driven run
// spent its whole step cap exploring and was killed before writing a byte.
// Review and audit jobs are now SINGLE-SHOT: all inputs inline, no tools, the
// answer is the report (gem.ps1 writes it to <brief>.log).
import fs from 'fs'; import { execSync } from 'child_process';
const FT = 'C:/Users/adnan/projects/fittrack', OV = FT + '/docs/audit-2026-10-05/overnight';
const rd = p => fs.readFileSync(p, 'utf8');
const sh = c => execSync(c, { cwd: FT, maxBuffer: 1 << 26 }).toString();
const section = (p, re, n) => { const L = rd(p).split('\n'); const i = L.findIndex(l => re.test(l)); return i < 0 ? '' : L.slice(i, i + n).join('\n'); };
const SINGLE = '**SINGLE-SHOT MODE (overrides any instruction to read or write files):** everything you need is inline below. Use NO tools at all: no file reads, no searches, no commands, no writes. Reply with the complete report in Markdown as your one and only answer. No em dashes anywhere.\n\n';
const ns = rd(FT + '/NEXT-SESSION.md'); const a = ns.indexOf('Session 2026-10-05'); const nsSec = a < 0 ? '' : ns.slice(a, ns.indexOf('\n## ', a + 30) > 0 ? ns.indexOf('\n## ', a + 30) : a + 8000);
const code = sh('git show overnight/f3:fittrack.html');
const g6 = rd(OV + '/G6-goal-audit.md').split('\n').filter(l => !/^Research and critique only|^Adnan wants|screenshots|Use at most two web/.test(l)).join('\n')
  .replace(/Read, in this order[^\n]*\n?/, '');
fs.writeFileSync(OV + '/G6b-goal-audit.md', SINGLE + g6 +
  '\n\nAdnan wants FitTrack (a free, offline, single-file PWA for workouts, nutrition, weight and GLP-1 dose tracking) to have "the best smoothness, functionality, UI feel, UX like apple apps", mobile first (Samsung S26 Ultra Chrome, then iPhone Safari). Section 3 (micro-polish) must cite code lines instead of screenshots. Cite `fittrack.html` by function name.' +
  '\n\n# Inputs\n\n## GOAL.md\n' + rd(FT + '/GOAL.md') +
  '\n\n## NEXT-SESSION.md, session 2026-10-05\n' + nsSec +
  '\n\n## competitor-review.md, ranked top 15\n' + section(FT + '/docs/audit-2026-10-05/competitor-review.md', /Ranked Top 15 Adoptions/, 120) +
  '\n\n## design-critique.md, section 8\n' + section(FT + '/docs/audit-2026-10-05/design-critique.md', /^#+ 8/, 100) +
  '\n\n## Already queued, do not re-propose: F3 floor-first Home, P7 input ergonomics, P9 storage and startup, P5 touch contract (48 px targets, press states, tabular numerals, Android haptics).\n' +
  '\n\n## fittrack.html (current code, main plus the F1 and F3 packages)\n```html\n' + code + '\n```\n');
fs.writeFileSync(OV + '/G7b-f1f3-review.md', SINGLE + rd(OV + '/_g7-header.md').replace(/^Review only\.[^\n]*\n/m, '').replace("today's wave", 'the F1 (gym flow: previous-set recall, rest bar with plus and minus 15 s, keep-screen-on) and F3 (calories-to-floor first on Home) packages') +
  '\n```diff\n' + sh('git diff -U4 main...overnight/f3 -- fittrack.html') + '\n```\n');
fs.writeFileSync(OV + '/G7c-wave2-review.md', SINGLE + rd(OV + '/G7-wave2-review.md').replace(/^Review only\.[^\n]*\n/m, ''));
const spec = rd('C:/Users/adnan/projects/motion-studio/src/devices/iphone-18-pro-max.ts');
fs.writeFileSync(OV + '/G5b-specs-verify.md', `# G5b: verify the iPhone 18 Pro Max spec our 3D model uses

**Budget rule (hard): your FIRST action is write_to_file creating docs/audit-2026-10-05/overnight/iphone-18-pro-max-specs.md with a table skeleton (field, our value, verdict, published value, source URL). After EVERY field you check, rewrite that file. Last night's run spent its whole step cap exploring and was killed with nothing written.** Edit nothing else; never download files into the project; no helper scripts.

Below is the spec file our Remotion model was built from. For each field, open apple.com/iphone-18-pro/specs/ (read_url_content, once) and Apple's Accessory Design Guidelines or Human Interface Guidelines only if a field needs it. Verdicts: VERIFIED (matches, cite), CORRECTED (give the published value and URL), UNVERIFIABLE (no official source; say what you checked). Never estimate a value yourself. End the file with a Final report line.

\`\`\`ts
${spec}
\`\`\`
`);
console.log('ok', fs.statSync(OV + '/G6b-goal-audit.md').size, fs.statSync(OV + '/G7b-f1f3-review.md').size, fs.statSync(OV + '/G7c-wave2-review.md').size, fs.statSync(OV + '/G5b-specs-verify.md').size);
