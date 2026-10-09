**SINGLE-SHOT MODE (overrides any instruction to read or write files):** everything you need is inline below. Use NO tools at all: no file reads, no searches, no commands, no writes. Reply with the complete report in Markdown as your one and only answer. No em dashes anywhere.

# G7: adversarial review of today's FitTrack changes


Below is the full `fittrack.html` diff of the F1 (gym flow: previous-set recall, rest bar with plus and minus 15 s, keep-screen-on) and F3 (calories-to-floor first on Home) packages (a single-file vanilla JS PWA, classic scripts, inline onclick handlers, kg in storage, network-first service worker). Find REAL defects only: logic bugs, regressions in existing behaviour, state that can go stale, history or focus bugs, accessibility breaks, layout-property animation, places that ignore reduced motion, unit-conversion mistakes (storage must stay kg), memory leaks (listeners or observers never removed), anything that could break offline. For each: severity (high, medium, low), the exact diff lines quoted, what goes wrong and the concrete steps to trigger it, and the minimal fix. If you are not sure a defect is real, label it "suspect" and say what would confirm it. Do not report style preferences. Do not invent code that is not in the diff. End with `Final report` listing the high-severity items.

---

```diff
diff --git a/fittrack.html b/fittrack.html
index f8b5926..ef2721b 100755
--- a/fittrack.html
+++ b/fittrack.html
@@ -206,8 +206,13 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
 .ring-val{font-size:16px;font-weight:800;line-height:1;letter-spacing:-0.5px;}
 .ring-unit{font-size:9px;color:var(--t2);font-weight:500;margin-top:2px;}
 .ring-name{font-size:11px;font-weight:600;color:var(--t2);text-align:center;}
+.energy-hero{margin:4px 16px 12px;padding:18px 16px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-lg);}
+.energy-headline{font-size:32px;font-weight:800;letter-spacing:-.8px;line-height:1.15;color:var(--orange-text);font-variant-numeric:tabular-nums;}
+.energy-label{font-size:14px;font-weight:600;letter-spacing:0;color:var(--t2);}
+.energy-secondary{margin-top:8px;font-size:14px;font-weight:600;color:var(--t1);font-variant-numeric:tabular-nums;}
+.energy-context{margin-top:6px;font-size:12px;line-height:1.5;color:var(--t2);font-variant-numeric:tabular-nums;}
 /* CHECK-IN CARDS */
 .checkin-row{margin:0 16px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
 .ci-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r-md);padding:13px 8px;display:flex;flex-direction:column;align-items:center;gap:5px;transition:all 0.3s var(--spring);position:relative;overflow:hidden;}
 .ci-card.done{background:var(--green-wash);border-color:var(--green-border);}
@@ -353,13 +358,23 @@ input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-
 .set-chk{width:34px;height:34px;background:var(--s3);border-radius:9px;display:flex;align-items:center;justify-content:center;transition:transform var(--dur-press) var(--ease-out),background var(--dur-press) var(--ease-out),color var(--dur-press) var(--ease-out);margin:auto;}
 .set-chk svg{width:15px;height:15px;stroke:var(--t3);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
 .set-chk.on{background:var(--green);}
 .set-chk.on svg{stroke:#000;}
-.rest-bar{margin-top:12px;background:var(--s2);border-radius:12px;padding:11px 14px;display:none;align-items:center;justify-content:space-between;}
-.rest-bar.show{display:flex;}
-.rest-lbl{font-size:12px;color:var(--t2);font-weight:500;}
-.rest-cd{font-size:20px;font-weight:800;color:var(--orange-text);letter-spacing:-0.5px;}
-.rest-skip{font-size:12px;font-weight:700;color:var(--blue-text);background:var(--blue-dim);padding:6px 12px;border-radius:8px;}
+.set-last{grid-column:2 / 4;font-size:11px;color:var(--t3);font-variant-numeric:tabular-nums;text-align:center;}
+.rest-bar{position:fixed;bottom:calc(var(--tab-h) + var(--safe-b));left:0;right:0;z-index:90;background:var(--s2);border-top:1px solid var(--border);padding:10px 16px 12px;transform:translateY(100%);opacity:0;pointer-events:none;transition:transform var(--dur-nav) var(--ease-out),opacity var(--dur-nav) var(--ease-out);}
+.rest-bar.show{transform:translateY(0);opacity:1;pointer-events:auto;}
+.rest-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}
+.rest-lbl{font-size:11px;color:var(--t2);font-weight:500;}
+.rest-cd{font-size:28px;line-height:32px;font-weight:800;color:var(--orange-text);letter-spacing:-0.5px;font-variant-numeric:tabular-nums;}
+.rest-actions{display:flex;gap:6px;}
+.rest-action{min-width:48px;min-height:44px;border-radius:10px;padding:0 8px;background:var(--s3);color:var(--t1);font-size:12px;font-weight:700;transition:transform var(--dur-press) var(--ease-out);}
+.rest-action:active{transform:scale(.96);}
+.rest-track{height:3px;background:var(--s3);margin-top:8px;overflow:hidden;border-radius:3px;}
+.rest-fill{height:100%;background:var(--orange);transform-origin:left center;transition:transform 250ms linear;}
+.rest-bar.done .rest-cd{color:var(--green-text);font-size:22px;}
+.rest-bar.done .rest-fill{background:var(--green);}
+#s1.rest-space{padding-bottom:calc(var(--tab-h) + var(--safe-b) + 120px);scroll-padding-bottom:calc(var(--tab-h) + var(--safe-b) + 120px);}
+@media(prefers-reduced-motion:reduce){.rest-bar{transform:none;transition:opacity var(--dur-nav) var(--ease-out);}.rest-fill,.rest-action{transition:none;}}
 .form-cues{margin-top:12px;background:var(--blue-wash);border-radius:12px;padding:12px;}
 .cue-title{font-size:9px;font-weight:700;color:var(--blue-light-text);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;}
 .cue-item{display:flex;gap:7px;margin-bottom:6px;font-size:12px;color:var(--t2);line-height:1.45;align-items:flex-start;}
 .cue-dot{width:5px;height:5px;border-radius:50%;background:var(--blue-light);flex-shrink:0;margin-top:5px;}
@@ -782,21 +797,23 @@ function suggestSession(){
   return 0;
 }
 /* What he lifted last time on this exact movement, so the set rows open on a
    real number instead of a default he has to correct every single session. */
-function lastWeightFor(exId){
-  /* One parse, not 28. DB.log() re-reads and re-parses the entire ft_logs blob
-     on every call, and this loop used to call it once per day scanned, on every
-     unfilled set of every workout render. */
+let workoutRecall={};
+function cacheWorkoutRecall(){
+  workoutRecall={};
   const all=DB.allLogs();
-  for(const d of recentDates(28)){
-    if(d===S.today)continue;
-    const l=all[d]||null;
-    const sets=l&&l.workout&&l.workout.exercises&&l.workout.exercises[exId]&&l.workout.exercises[exId].sets;
-    if(!sets)continue;
-    for(let i=sets.length-1;i>=0;i--)if(sets[i]&&sets[i].weight)return sets[i].weight;
+  for(const date of Object.keys(all).filter(d=>d<S.today).sort().reverse()){
+    for(const [id,entry] of Object.entries(all[date]?.workout?.exercises||{})){
+      if(workoutRecall[id]||!entry.sets?.some(s=>s?.done))continue;
+      workoutRecall[id]=entry.sets.map(s=>s?.done?{weight:s.weight,reps:s.reps}:null);
+    }
   }
-  return null;
+}
+function lastWeightFor(exId,i=0){return workoutRecall[exId]?.[i]?.weight??null;}
+function setDefaults(ex,i){
+  return {weight:lastWeightFor(ex.id,i)??Number(ex.weight?.match(/\d+/)?.[0]??20),
+    reps:workoutRecall[ex.id]?.[i]?.reps??Number(ex.reps?.match(/^\d+/)?.[0]??10)};
 }
 /* ── FOOD PRESETS ─────────────────────────────── */
 const PRESETS=[
 {id:'p1',name:'Beef Tehari (300g)',cal:1750,protein:90,carbs:165,fat:84},
@@ -1157,8 +1174,22 @@ function refreshDataScreens(){
     else markScreenDirty(i);
   }
   markScreenDirty(3);
 }
+/* Presentation only. Keep the established Nutrition floor calculation. */
+function calorieSummary(c,cal,protein,id){
+  const hasFloor=!!c.glp1||Number(c.targets.floor)>0;
+  const floor=Math.max(1600,c.targets.floor||c.targets.calories-200);
+  const remaining=Math.max(0,c.targets.calories-cal);
+  const below=hasFloor&&cal<floor;
+  const number=hasFloor?(below?Math.round(floor-cal).toLocaleString():'Floor reached'):Math.round(remaining).toLocaleString();
+  const label=hasFloor?(below?'kcal to your floor':''):'kcal remaining';
+  const proteinLeft=Math.max(0,c.targets.protein-protein);
+  const proteinCopy=proteinLeft>0?`${Math.round(proteinLeft).toLocaleString()}g protein to your target`:'Protein target reached';
+  return `<div class="energy-headline" id="${id}">${number}${label?` <span class="energy-label">${label}</span>`:''}</div>
+    <div class="energy-secondary">${hasFloor&&!below?`${Math.round(remaining).toLocaleString()} kcal left to your target`:proteinCopy}</div>
+    <div class="energy-context">${hasFloor&&!below?proteinCopy+'<br>':''}${Math.round(cal).toLocaleString()} kcal eaten / ${c.targets.calories.toLocaleString()} kcal target${hasFloor?`<br>Floor: ${floor.toLocaleString()} kcal`:''}</div>`;
+}
 function renderHome(){
   const l=S.log,c=S.cfg;
   const meals=l.nutrition.meals||[];
   const totalCal=meals.reduce((a,m)=>a+(m.cal||0),0);
@@ -1188,18 +1219,14 @@ function renderHome(){
       </div>
       <button class="hdr-btn" onclick="openNotifInfo()">${svgIcon('bell',18,'var(--t2)')}</button>
     </div>
     <div class="section-label">Today's activity</div>
+    <div class="energy-hero">${calorieSummary(c,totalCal,totalProt,'home-cal-num')}</div>
     <div class="rings-wrap">
       ${ring('cal','var(--orange)',totalCal,calGoal,Math.round(totalCal).toLocaleString(),'kcal','var(--orange-text)')}
       ${ring('pro','var(--coral)',totalProt,protGoal,Math.round(totalProt)+'g','protein','var(--coral-text)')}
       ${ring('h2o','var(--blue-light)',water,waterGoal,fmtVolBig(water),'water','var(--blue-light-text)')}
     </div>
-    <div style="display:flex;justify-content:space-around;padding:0 20px;margin-bottom:14px;">
-      <div style="text-align:center;font-size:10px;color:var(--t3)">${Math.round(totalCal)} / ${calGoal} kcal</div>
-      <div style="text-align:center;font-size:10px;color:var(--t3)">${Math.round(totalProt)}g / ${protGoal}g</div>
-      <div style="text-align:center;font-size:10px;color:var(--t3)">${fmtVolBig(water)} / ${fmtVolBig(waterGoal)}</div>
-    </div>
     <div class="section-label">Daily check-ins</div>
     <div class="checkin-row">
       ${ciCard('gym','🏋️','Gym',l.checkins.gym)}
       ${ciCard('water','💧','Water',l.checkins.water)}
@@ -1293,8 +1320,9 @@ function renderWorkout(){
   const exLogs=l.workout.exercises||{};
   const done=d.exercises.filter(e=>exLogs[e.id]?.completed).length;
   const total=d.exercises.length;
   const tabs=days.map((x,i)=>`<button class="day-tab${i===S.workoutDay?' active':''}" onclick="switchDay(${i})"><span>${x.name}</span><span class="day-tab-label">${x.label}</span></button>`).join('');
+  cacheWorkoutRecall();
   const cards=d.exercises.map(e=>exCard(e,exLogs[e.id])).join('');
   const pct=total>0?(done/total*100):0;
   const dayDone=l.workout.completed&&l.workout.dayIndex===S.workoutDay;
   document.getElementById('s1').innerHTML=`
@@ -1308,9 +1336,9 @@ function renderWorkout(){
       <div class="workout-progress-row">
         <div><div class="workout-progress-count">${done}/${total} exercises done</div><div class="workout-progress-pct">${Math.round(pct)}%</div></div>
         ${dayDone?'':`<button class="whole-session-btn" onclick="confirmWholeSession()">Log whole session</button>`}
       </div>
-      <div class="prog-track"><div class="prog-fill" id="wk-prog" style="width:${pct}%;background:var(--blue);transition:width 0.6s var(--ease-data)"></div></div>
+      <div class="prog-track"><div class="prog-fill" id="wk-prog" style="transform:scaleX(${pct/100});background:var(--blue)"></div></div>
     </div>
     ${S.workout.ramp?`<div class="warmup-banner help-anchor" style="border-color:var(--orange-text)">${helpBtn('rampIn')}<div class="warmup-title">Ramp-in week ${S.workout.rampWeek} of ${S.workout.rampWeeks}</div><div class="warmup-txt">${S.workout.rampRule}</div></div>`:''}
     <div class="warmup-banner"><div class="warmup-title">\u{1F525} Warm-up first</div><div class="warmup-txt">${d.warmup}</div></div>
     <div class="ex-list">${cards}</div>
@@ -1323,24 +1351,25 @@ function exCard(ex,exLog){
   const done=exLog?.completed||false;
   const setRows=Array.from({length:ex.sets},(_,i)=>{
     const s=exLog?.sets?.[i];
     const isDone=s?.done||false;
-    const storedWeight=s?.weight??lastWeightFor(ex.id)??ex.weight?.match(/\d+/)?.[0]??20;
-    const w=fmtW(storedWeight);
-    const r=s?.reps??ex.reps?.match(/^\d+/)?.[0]??'10';
+    const fallback=setDefaults(ex,i),previous=workoutRecall[ex.id]?.[i];
+    const w=s?.weight!=null?fmtW(s.weight):'';
+    const r=s?.reps??'';
     return `<div class="set-row${isDone?' done':''}" id="sr-${ex.id}-${i}">
       <div class="set-num">${i+1}</div>
       <div class="set-inp-wrap">
         <button class="set-adj" onclick="adj('${ex.id}',${i},'w',-2.5)">−</button>
-        <input class="set-inp" type="number" id="sw-${ex.id}-${i}" value="${w}" inputmode="decimal" onchange="updSet('${ex.id}',${i},'w',this.value)">
+        <input class="set-inp" type="number" id="sw-${ex.id}-${i}" value="${w}" placeholder="${fmtW(fallback.weight)}" inputmode="decimal" enterkeyhint="next" aria-label="Set ${i+1} weight in ${wUnit()}" onchange="updSet('${ex.id}',${i},'w',this.value)">
         <button class="set-adj" onclick="adj('${ex.id}',${i},'w',2.5)">+</button>
       </div>
       <div class="set-inp-wrap">
         <button class="set-adj" onclick="adj('${ex.id}',${i},'r',-1)">−</button>
-        <input class="set-inp" type="number" id="sr-inp-${ex.id}-${i}" value="${r}" inputmode="numeric" onchange="updSet('${ex.id}',${i},'r',this.value)">
+        <input class="set-inp" type="number" id="sr-inp-${ex.id}-${i}" value="${r}" placeholder="${fallback.reps}" inputmode="numeric" enterkeyhint="done" aria-label="Set ${i+1} reps" onchange="updSet('${ex.id}',${i},'r',this.value)">
         <button class="set-adj" onclick="adj('${ex.id}',${i},'r',1)">+</button>
       </div>
       <button class="set-chk${isDone?' on':''}" id="sc-${ex.id}-${i}" onclick="toggleSet('${ex.id}',${i})">${svgIcon('check',15,'var(--t3)')}</button>
+      ${previous?`<div class="set-last">Last ${fmtW(previous.weight??0)} ${wUnit()} × ${previous.reps??0}</div>`:''}
     </div>`;
   }).join('');
   const cues=ex.cues.map(c=>`<div class="cue-item"><div class="cue-dot"></div>${c}</div>`).join('');
   const meta=[`${ex.sets} sets × ${ex.reps}`,ex.weight].filter(Boolean).join(' · ');
@@ -1364,13 +1393,8 @@ function exCard(ex,exLog){
           <div class="set-hdr-lbl">Reps</div>
           <div class="set-hdr-lbl">✓</div>
         </div>
         ${setRows}
-        <div class="rest-bar" id="rb-${ex.id}">
-          <div class="rest-lbl">Rest time</div>
-          <div class="rest-cd" id="rc-${ex.id}">--:--</div>
-          <button class="rest-skip" onclick="stopRest('${ex.id}')">Skip</button>
-        </div>
         <div class="form-cues">${where}<div class="cue-title">Form cues</div>${cues}</div>
         <button class="ex-complete-btn${done?' done':''}" id="ecb-${ex.id}" onclick="completeEx('${ex.id}')">
           ${done?'\u2713 Complete':`Done, skip the set details (${sdone}/${ex.sets} logged)`}
         </button>
@@ -1382,9 +1406,9 @@ let workoutReconcileQueued=false;
 function queueWorkoutReconcile(){
   if(workoutReconcileQueued)return;
   workoutReconcileQueued=true;
   const defer=typeof queueMicrotask==='function'?queueMicrotask:fn=>setTimeout(fn,0);
-  defer(()=>{workoutReconcileQueued=false;reconcileRestTimers();updateWorkoutProgress();});
+  defer(()=>{workoutReconcileQueued=false;reconcileRestTimers();updateWorkoutProgress();syncWorkoutWakeLock();});
 }
 function toggleEx(id){
   const c=document.getElementById('ec-'+id);if(!c)return;
   // Commit layout once, then reveal with opacity and transform only.
@@ -1424,18 +1448,20 @@ function updateWorkoutProgress(){
 }
 function adj(exId,i,field,delta){
   const id=field==='w'?`sw-${exId}-${i}`:`sr-inp-${exId}-${i}`;
   const el=document.getElementById(id);if(!el)return;
-  let v=parseFloat(el.value)||0;
+  let v=parseFloat(el.value||el.placeholder)||0;
   v=Math.max(0,v+delta);
   el.value=field==='w'?v.toFixed(1):Math.round(v);
   updSet(exId,i,field,el.value);
 }
 function updSet(exId,i,field,val){
   if(!S.log.workout.exercises[exId])S.log.workout.exercises[exId]={sets:[],completed:false};
   if(!S.log.workout.exercises[exId].sets)S.log.workout.exercises[exId].sets=[];
   if(!S.log.workout.exercises[exId].sets[i])S.log.workout.exercises[exId].sets[i]={};
-  S.log.workout.exercises[exId].sets[i][field==='w'?'weight':'reps']=field==='w'?fromDisp(parseFloat(val)):parseInt(val);
+  const key=field==='w'?'weight':'reps';
+  if(val==='')delete S.log.workout.exercises[exId].sets[i][key];
+  else S.log.workout.exercises[exId].sets[i][key]=field==='w'?fromDisp(parseFloat(val)):parseInt(val);
   DB.saveLog(S.today,S.log);
 }
 function toggleSet(exId,i){
   if(!S.log.workout.exercises[exId])S.log.workout.exercises[exId]={sets:[],completed:false};
@@ -1443,10 +1469,15 @@ function toggleSet(exId,i){
   if(!exLog.sets)exLog.sets=[];
   if(!exLog.sets[i])exLog.sets[i]={};
   const w=document.getElementById(`sw-${exId}-${i}`)?.value;
   const r=document.getElementById(`sr-inp-${exId}-${i}`)?.value;
-  if(w)exLog.sets[i].weight=fromDisp(parseFloat(w));
-  if(r)exLog.sets[i].reps=parseInt(r);
+  const ex=S.workout.days[S.workoutDay].exercises.find(e=>e.id===exId);
+  const fallback=ex?setDefaults(ex,i):{weight:0,reps:0};
+  exLog.sets[i].weight=w!==''&&w!=null?fromDisp(parseFloat(w)):fallback.weight;
+  exLog.sets[i].reps=r!==''&&r!=null?parseInt(r):fallback.reps;
+  const weightInput=document.getElementById(`sw-${exId}-${i}`),repInput=document.getElementById(`sr-inp-${exId}-${i}`);
+  if(weightInput)weightInput.value=fmtW(exLog.sets[i].weight);
+  if(repInput)repInput.value=exLog.sets[i].reps;
   exLog.sets[i].done=!exLog.sets[i].done;
   DB.saveLog(S.today,S.log);
   const row=document.getElementById(`sr-${exId}-${i}`);
   const chk=document.getElementById(`sc-${exId}-${i}`);
@@ -1455,40 +1486,88 @@ function toggleSet(exId,i){
   if(chk)chk.classList.toggle('on',exLog.sets[i].done);
   if(num&&exLog.sets[i].done&&!prefersReducedMotion())num.animate(
     [{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:140,easing:'ease-out'});
   dirtyWorkoutDependents();
-  const ex=S.workout.days[S.workoutDay].exercises.find(e=>e.id===exId);
+  syncWorkoutWakeLock();
   if(ex){
     const sdone=(exLog.sets||[]).filter(s=>s?.done).length;
     const btn=document.getElementById('ecb-'+exId);
     if(btn&&!exLog.completed)btn.textContent=`Mark complete (${sdone}/${ex.sets} sets done)`;
     if(exLog.sets[i].done)startRest(exId,ex.restSec||90);
   }
 }
 function restSessionKey(){return S.today+':'+S.workoutDay;}
+function ensureRestBar(){
+  let bar=document.getElementById('workout-rest');
+  if(!bar){
+    bar=document.createElement('div');bar.id='workout-rest';bar.className='rest-bar';
+    bar.innerHTML=`<div class="rest-row"><div><div class="rest-lbl">Rest time</div><div class="rest-cd" role="timer">0:00</div></div><div class="rest-actions"><button class="rest-action" onclick="adjustRest(-15)" aria-label="Shorten rest by 15 seconds">−15 s</button><button class="rest-action" onclick="adjustRest(15)" aria-label="Extend rest by 15 seconds">+15 s</button><button class="rest-action" onclick="cancelWorkoutTimers()">Skip</button></div></div><div class="rest-track"><div class="rest-fill"></div></div>`;
+    document.getElementById('tab-bar').before(bar);
+  }
+  return bar;
+}
 function reconcileRestTimers(){
+  const bar=ensureRestBar();
   for(const [id,timer] of Object.entries(S.restTimers)){
     if(timer.session!==restSessionKey()){stopRest(id);continue;}
     const rem=Math.max(0,Math.ceil((timer.end-Date.now())/1000));
-    const bar=document.getElementById('rb-'+id),cd=document.getElementById('rc-'+id);
-    if(!rem){stopRest(id);toast('\u23f1','Rest complete!','Time for next set');continue;}
-    if(bar){bar.style.visibility='';bar.classList.add('show');}
-    if(cd)cd.textContent=fmtTime(rem);
-    const card=document.getElementById('ec-'+id);
-    if(card&&timer.bar!==bar){card.classList.add('open');timer.bar=bar;}
+    if(!rem&&!timer.doneUntil){
+      timer.doneUntil=Date.now()+3000;
+      if(/Android/i.test(navigator.userAgent)&&!prefersReducedMotion()&&typeof navigator.vibrate==='function'){
+        try{navigator.vibrate([0,80,60,80]);}catch(e){}
+      }
+    }
+    if(timer.doneUntil&&Date.now()>=timer.doneUntil){stopRest(id);continue;}
+    const visible=S.screen===1;
+    bar.classList.toggle('show',visible);bar.classList.toggle('done',!!timer.doneUntil);
+    bar.inert=!visible;bar.setAttribute('aria-hidden',String(!visible));
+    bar.querySelector('.rest-cd').textContent=timer.doneUntil?'Rest done':fmtTime(rem);
+    bar.querySelector('.rest-fill').style.transform='scaleX('+Math.max(0,Math.min(1,(timer.end-Date.now())/timer.duration))+')';
+    for(const button of bar.querySelectorAll('.rest-action'))button.disabled=!!timer.doneUntil&&button!==bar.querySelector('.rest-action:last-child');
+    document.getElementById('s1').classList.toggle('rest-space',visible);
   }
 }
 function startRest(exId,secs){
-  stopRest(exId);
-  const timer={end:Date.now()+secs*1000,session:restSessionKey(),bar:document.getElementById('rb-'+exId)};
+  cancelWorkoutTimers();
+  const timer={end:Date.now()+secs*1000,duration:secs*1000,session:restSessionKey()};
   S.restTimers[exId]=timer;
   timer.t=setInterval(reconcileRestTimers,250);reconcileRestTimers();
 }
-function stopRest(exId,keepSpace=false){
+function adjustRest(secs){
+  const timer=Object.values(S.restTimers)[0];if(!timer||timer.doneUntil)return;
+  timer.end+=secs*1000;timer.duration=Math.max(timer.duration,timer.end-Date.now());reconcileRestTimers();
+}
+function stopRest(exId){
   if(S.restTimers[exId]){clearInterval(S.restTimers[exId].t);delete S.restTimers[exId];}
-  const bar=document.getElementById('rb-'+exId);
-  if(bar){bar.style.visibility=keepSpace?'hidden':'';if(!keepSpace)bar.classList.remove('show');}
+  const bar=document.getElementById('workout-rest');
+  if(bar&&!Object.keys(S.restTimers).length){bar.classList.remove('show');bar.inert=true;bar.setAttribute('aria-hidden','true');document.getElementById('s1').classList.remove('rest-space');}
+}
+let workoutWakeSentinel=null,workoutWakePending=false,workoutWakeEpoch=0,workoutPageHidden=false;
+function workoutSessionActive(){
+  return S.log?.date===S.today&&!S.log.workout.completed&&Object.values(S.log.workout.exercises||{}).some(e=>e.sets?.some(s=>s?.done));
+}
+function releaseWorkoutWakeLock(){
+  workoutWakeEpoch++;
+  const sentinel=workoutWakeSentinel;workoutWakeSentinel=null;
+  if(sentinel)try{Promise.resolve(sentinel.release()).catch(()=>{});}catch(e){}
+}
+async function syncWorkoutWakeLock(){
+  if(workoutPageHidden||document.visibilityState!=='visible'||!workoutSessionActive()){releaseWorkoutWakeLock();return;}
+  if(workoutWakeSentinel||workoutWakePending||!navigator.wakeLock?.request)return;
+  const epoch=workoutWakeEpoch;workoutWakePending=true;
+  try{
+    const sentinel=await navigator.wakeLock.request('screen');
+    if(epoch!==workoutWakeEpoch||workoutPageHidden||document.visibilityState!=='visible'||!workoutSessionActive()){
+      try{await sentinel.release();}catch(e){}
+    }else{
+      workoutWakeSentinel=sentinel;
+      sentinel.addEventListener('release',()=>{if(workoutWakeSentinel===sentinel)workoutWakeSentinel=null;});
+    }
+  }catch(e){}finally{workoutWakePending=false;}
 }
+document.addEventListener('visibilitychange',()=>{syncWorkoutWakeLock();reconcileRestTimers();});
+window.addEventListener('pagehide',()=>{workoutPageHidden=true;releaseWorkoutWakeLock();});
+window.addEventListener('pageshow',()=>{workoutPageHidden=false;syncWorkoutWakeLock();reconcileRestTimers();});
 function completeEx(exId){
   if(!S.log.workout.exercises[exId])S.log.workout.exercises[exId]={sets:[],completed:false};
   S.log.workout.exercises[exId].completed=true;DB.saveLog(S.today,S.log);stopRest(exId,true);
   const card=document.getElementById('ec-'+exId),btn=document.getElementById('ecb-'+exId);
@@ -1517,8 +1596,9 @@ function logWholeSession(){
   finishWorkout();
 }
 function finishWorkout(){
   S.log.workout.completed=true;
+  syncWorkoutWakeLock();
   S.log.workout.dayIndex=S.workoutDay;
   S.log.workout.startTime=S.log.workout.startTime||new Date().toISOString();
   S.log.checkins.gym=true;
   DB.saveLog(S.today,S.log);
@@ -1544,9 +1624,8 @@ function renderNutrition(){
   const tCarbs=meals.reduce((a,m)=>a+(m.carbs||0),0);
   const tFat=meals.reduce((a,m)=>a+(m.fat||0),0);
   const carbGoal=Number(c.targets.carbs),fatGoal=Number(c.targets.fat);
   const hasCarbGoal=Number.isFinite(carbGoal)&&carbGoal>0,hasFatGoal=Number.isFinite(fatGoal)&&fatGoal>0;
-  const remain=Math.max(0,c.targets.calories-tCal);
   const floor=Math.max(1600,c.targets.floor||c.targets.calories-200);
   const water=l.nutrition.water||0;
   const waterGoal=waterTarget();
   const hasProteinPowder=c.proteinPowder!==false;
@@ -1573,18 +1652,9 @@ function renderNutrition(){
       <div><div class="header-title">Nutrition</div><div class="header-sub">${fmtDate(S.today)}</div></div>
       <button onclick="openMealSheet()" style="background:var(--orange-dim);border:1px solid var(--orange-border);border-radius:20px;padding:8px 16px;font-size:13px;font-weight:700;color:var(--orange-text)">+ Add meal</button>
     </div>
     <div class="macro-card">
-      <div class="macro-top">
-        <div>
-          <div class="macro-cal-big" id="cal-num">${Math.round(tCal)}</div>
-          <div style="font-size:12px;color:var(--t2);margin-top:3px">kcal eaten today</div>
-        </div>
-        <div style="text-align:right">
-          <div style="font-size:22px;font-weight:800;color:var(--t2)">${Math.round(remain)}</div>
-          <div style="font-size:12px;color:var(--t3);margin-top:2px">kcal remaining</div>
-        </div>
-      </div>
+      <div class="energy-summary" style="margin-bottom:14px">${calorieSummary(c,tCal,tProt,'cal-num')}</div>
       <div>
         <div class="macro-target-head">Daily macro targets${helpBtn('macroTargets')}</div>
         <div class="macro-bar-row">
           <div class="macro-bar-lbl" style="color:var(--coral-text)">Protein</div>
@@ -1601,13 +1671,13 @@ function renderNutrition(){
           <div class="macro-bar-track">${hasFatGoal?`<div class="macro-bar-fill" id="fb" style="transform:scaleX(${dataRatio(tFat,fatGoal)});background:var(--blue-light)"></div>`:''}</div>
           <div class="macro-bar-val">${Math.round(tFat)}g${hasFatGoal?` / ${fatGoal}g`:""}</div>
         </div>
       </div>
-      <div class="floor-warning">
+      ${c.glp1||Number(c.targets.floor)>0?`<div class="floor-warning">
         ${helpBtn('calorieFloor')}
         <div class="floor-warning-title">Hard floor: ${floor.toLocaleString()} kcal</div>
         <div class="floor-warning-copy">Do not finish the day below this intake.</div>
-      </div>
+      </div>`:''}
     </div>
     ${supplementRows.trim()?`<div class="section-label">Supplements</div><div class="supp-card">${supplementRows}</div>`:''}
     <div class="nutrition-context" data-data-key="search-context"><label for="search-meal">Log to</label><select id="search-meal" onchange="nutritionMeal=this.value">${mealOrder.map(t=>'<option'+(t===nutritionMeal?' selected':'')+'>'+t+'</option>').join('')}</select></div>
     <div class="food-search-wrap">

```
