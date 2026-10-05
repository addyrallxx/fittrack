// Run: node test/finish-summary.test.mjs. Synthetic workout data only.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../fittrack.html',import.meta.url),'utf8');
const start=html.indexOf('function showWorkoutSummary(');
const end=html.indexOf('/*',start);
assert.ok(start>=0&&end>start);
const dialog={dataset:{dragBound:'true'},setAttribute(){},innerHTML:''};
const day={name:'Demo <session>',exercises:[{id:'demo',name:'Demo <lift>'}]};
const current={completed:true,sets:[{done:true,weight:40,reps:8},{done:true,weight:40,reps:10},{done:false,weight:999,reps:99}]};
const prior={sets:[{done:true,weight:40,reps:8}]};
const logs={'2026-10-04':{workout:{exercises:{demo:prior}}}};
const context=vm.createContext({
  S:{today:'2026-10-05',cfg:{units:'kg'},log:{workout:{startTime:'2026-10-05T12:00:00Z',exercises:{demo:current}}}},
  DB:{allLogs:()=>logs},document:{getElementById:()=>dialog},modalPresent:(_,fill)=>fill(),
  esc:value=>value.replaceAll('<','&lt;').replaceAll('>','&gt;'),
  fmtTime:s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0'),
});
vm.runInContext("function wUnit(){return S.cfg.units;}function fmtW(kg){return (wUnit()==='lb'?kg/0.45359237:kg).toFixed(1);}"+html.slice(start,end),context);
const render=()=>{context.showWorkoutSummary(day,Date.parse('2026-10-05T12:01:05Z'));return dialog.innerHTML;};
let result=render();
assert.match(result,/<dd>1:05<\/dd>/);assert.match(result,/<dd>1 of 1<\/dd>/);
assert.match(result,/<dd>2<\/dd>/);assert.match(result,/<dd>720.0<\/dd>/);
assert.match(result,/Top set: 40.0 kg × 10/);assert.match(result,/Up from last time/);
assert.match(result,/Demo &lt;lift&gt;/);assert.match(result,/Demo &lt;session&gt;/);
assert.equal((result.match(/<button /g)||[]).length,1);
for(const reps of [10,12]){prior.sets[0].reps=reps;assert.doesNotMatch(render(),/Up from last time/);}
delete logs['2026-10-04'];assert.doesNotMatch(render(),/Up from last time/);
context.S.cfg.units='lb';assert.match(render(),/<dd>1587.3<\/dd>/);assert.equal(current.sets[0].weight,40);
context.S.log.workout.startTime=null;current.sets=[];result=render();
assert.match(result,/<dd>Not timed<\/dd>/);assert.match(result,/<dd>0<\/dd>/);assert.match(result,/<dd>0.0<\/dd>/);assert.match(result,/No sets logged/);
console.log('PASS finish summary: checked-set totals, top-set ties, quiet comparison, units, escaping, missing data and one Done.');
