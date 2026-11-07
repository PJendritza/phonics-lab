const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const D=await import('../app/data.mjs'),L=await import('../app/learning.mjs'),R=await import('../app/reading-path.mjs');
 const base='http://127.0.0.1:8070/preview/phonics-lab/';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>document.addEventListener('play',e=>{if(e.target.id==='lesson-audio'){window.spoken??=[];window.spoken.push(new URL(e.target.currentSrc).pathname.split('/').pop());e.target.playbackRate=4;}},true));
 const state=()=>page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));return s.profiles.find(p=>p.id===s.activeId).progress;});
 const ready=()=>page.waitForFunction(()=>document.querySelector('[data-choice]')&&!document.querySelector('[data-choice]').disabled,null,{timeout:25000});
 const restore=async(store,play=true)=>{await page.locator('#settings').click();await page.locator('#import').setInputFiles({name:'etappen.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(store))});await page.locator('#confirm-import').click();if(play){await page.locator('#play').click();await ready();}};
 const goStep=async(id)=>{await page.locator('#path').click();if(!await page.locator('#preview').isChecked())await page.locator('#preview').check();const detail=page.locator('.etappe-map').filter({has:page.locator(`[data-etappe="${id}"]`)});if(!await detail.evaluate(e=>e.open))await detail.locator('summary').click();await page.locator(`[data-etappe="${id}"]`).click();await ready();};
 const solve=async()=>{await ready();const p=await state(),r=p.pending.round,i=p.pending.index;await page.locator(`[data-choice="${r.target}"]`).click();await page.waitForFunction(index=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));return !s.profiles[0].progress.pending||s.profiles[0].progress.pending.index!==index;},i);};
 const finish=async()=>{while((await state()).pending)await solve();await page.locator('#continue').waitFor();};
 const decode=()=>page.evaluate(async()=>{const urls=[...new Set([...document.querySelectorAll('[data-choice] image')].map(i=>i.href.baseVal))];for(const src of urls)await new Promise((ok,bad)=>{const i=new Image();i.onload=()=>i.naturalWidth?ok():bad(Error('Empty sprite'));i.onerror=bad;i.src=src;});});
 const single=target=>{const store=L.freshStore(),p=store.profiles[0].progress,id=D.ITEMS[target].pack===34?'reading_animals':'reading_everyday';p.stages[id]={completed:1,passed:false,best:0};p.skills['sentence:'+target]={introduced:true,seen:1,first:0,recent:[0],timeline:[[1,0]]};store.profiles[0].progress=L.startReview(p,id,()=>.4);return store;};
 await page.goto(base);await goStep('s34-pets');assert.match(await page.locator('#level-menu').innerText(),/Level 34[\s\S]*Etappe 1\/4/);assert.equal((await state()).pending.total,12);
 let p=await state(),r=p.pending.round;await page.locator(`[data-choice="${r.choices.find(c=>c!==r.target)}"]`).click();await ready();const saved=(await state()).pending;
 await goStep('s34-people');assert.match(await page.locator('#level-menu').innerText(),/Etappe 4\/4/);assert.deepEqual((await state()).paused[L.sessionKey(saved)],saved);
 const people=(await state()).pending;await page.reload();await page.locator('#play').click();await ready();assert.deepEqual((await state()).pending,people);await goStep('s34-pets');assert.deepEqual((await state()).pending,saved);
 await page.locator('#path').click();await page.locator('#preview').uncheck();await page.locator('[data-level="letters"]').click();await ready();await page.locator('#path').click();assert.equal(await page.locator('[data-level="reading_animals"]').isDisabled(),false);await page.locator('[data-level="reading_animals"]').click();await ready();assert.deepEqual((await state()).pending,saved);
 assert.equal(await page.locator('#replay').count(),0);assert.deepEqual(await page.evaluate(()=>window.spoken??[]),['a.mp3']);
 await finish();assert.equal(await page.locator('#continue').innerText(),'Etappe 1 weiterüben');await page.locator('#continue').click();await ready();await finish();
 assert.equal(await page.locator('#continue').innerText(),'Etappe 2 starten');assert.equal(await page.locator('h1').innerText(),'Etappe geschafft!');
 assert.equal((await state()).readingPath.steps['s34-pets'].completed,true);await page.locator('#continue').click();await ready();assert.equal((await state()).pending.etappeId,'s34-pond');
 checks.push('Named 1/4–4/4 Etappen are directly selectable. Same-level switching and reload preserve exact mistakes, cues, choices and goals. Two real twelve-question rounds finish the first Etappe and Continue starts the second.');
 await page.locator('#settings').click();assert.ok((await page.locator('.reading-report').innerText()).includes('selbstständig als einzelnes Wort erkannt'));
 assert.equal((await state()).readingPath.words.katze.recognised,0);assert.ok((await state()).readingPath.words.katze.encounters>0);
 const download=page.waitForEvent('download');await page.locator('#export').click();const backup=JSON.parse(fs.readFileSync(await(await download).path(),'utf8'));assert.equal(backup.profiles[0].progress.readingPath.steps['s34-pets'].completed,true);assert.ok(backup.profiles[0].progress.readingPath.patterns['place:im']);
 await page.locator('#path').click();const detail=page.locator('.etappe-map').filter({has:page.locator('[data-etappe="s34-pets"]')});if(!await detail.evaluate(e=>e.open))await detail.locator('summary').click();assert.match(await detail.innerText(),/1\/4 Etappen abgeschlossen/);assert.match(await detail.innerText(),/Zielwörter im Text geübt/);await page.screenshot({path:'/workspace/kalulu-browser-build/v13-etappen-map.png',fullPage:true});
 checks.push('Parent map shows finite completion and target-word coverage, and the report separates contextual encounters from standalone independent word recognition. Confirmed JSON backup contains Etappen, pattern evidence and word evidence.');
 const examples=['mix35_apfel_am_baum','daily_34_frau_hat_wasser','daily_34_kind_count_2','daily_34_kind_not_wach','daily_35_kind_liest_buch','daily_35_kind_trinkt_wasser','daily_35_kind_trinkt_milch','daily_35_food_pair_oben_unten','daily_35_buch_not_offen'];
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(viewport);
  for(const target of examples){
   await restore(single(target));assert.equal((await state()).pending.round.target,target);await decode();assert.equal(await page.locator('#replay').count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const boxes=await page.locator('[data-choice]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,b:r.bottom};}));assert.ok(boxes.length===4&&boxes.every(r=>r.w>=60&&r.h>=60&&r.b<=viewport.height),JSON.stringify({target,viewport,boxes}));
   if(target==='daily_35_kind_liest_buch')assert.ok((await state()).pending.round.choices.includes('daily_35_kind_hat_buch'));
   if(viewport.width===390)await page.screenshot({path:`/workspace/kalulu-browser-build/v13-${target}.png`,fullPage:true});
  }
  checks.push(viewport.width+'x'+viewport.height+': hanging apple, new people/food/actions, negation and und sentences show four decoded stationary images; no horizontal overflow, hidden solution speech or off-screen choices.');
 }
 await page.setViewportSize({width:390,height:844});await restore(single('daily_35_kind_trinkt_milch'));r=(await state()).pending.round;const spokenBeforeHelp=(await page.evaluate(()=>window.spoken??[])).length;
 for(let n=0;n<2;n++){await page.locator(`[data-choice="${r.choices.find(c=>c!==r.target)}"]`).click();await ready();}
 assert.equal(await page.locator('#replay').count(),1);assert.equal((await page.evaluate(()=>window.spoken??[])).length,spokenBeforeHelp);await page.locator('#replay').click();await ready();assert.equal((await page.evaluate(()=>window.spoken??[])).at(-1),'daily_35_kind_trinkt_milch.mp3');assert.equal((await state()).pending.round.assisted,true);
 checks.push('New optional Thorsten sentence MP3 actually plays only after two errors and an explicit request; wrong pictures and automatic teaching stay silent.');
 const old=L.freshStore(),oldp=old.profiles[0].progress;delete oldp.readingPath;oldp.curriculumVersion=12;oldp.continuation='complete';oldp.sessions=80;oldp.seeds=900;for(const id of Object.keys(R.READING_PATHS))oldp.stages[id]={passed:true,completed:5,best:1};
 await restore(old);p=await state();assert.equal(p.sessions,80);assert.equal(p.seeds,900);assert.equal(p.pending.stageId,'reading_animals');assert.equal(p.pending.etappeId,'s34-people');assert.equal(Object.keys(p.readingPath.words).length,0);assert.ok(p.readingPath.steps['s34-pets'].legacy);
 checks.push('An actual imported v12 completed profile resumes directly at the new people Etappe, preserves all previous completion awards and receives no fabricated word evidence.');
 await page.locator('#settings').click();await page.screenshot({path:'/workspace/kalulu-browser-build/v13-parent-progress.png',fullPage:true});
 // A real eight-profile backup can exceed the previous one-MB import limit.
 let full=L.freshProgress();
 for(const stage of D.STAGES)for(let n=0;n<8&&!full.stages[stage.id]?.passed;n++){
  full=L.startSession(full,stage.id,()=>.4);while(full.pending){while(!full.pending.round.solved){const r=full.pending.round;full=L.answer(full,stage.mode==='build'?D.lettersFor(r.target)[r.position].toLowerCase():r.target).progress;}full=L.advance(full,()=>.4).progress;}
 }
 for(const stage of D.STAGES.slice(-3))for(const step of R.stepsFor(stage))for(let n=0;n<8;n++){
  full=L.startSession(full,stage.id,()=>.4,Date.now(),step.id);while(full.pending){full=L.answer(full,full.pending.round.target).progress;full=L.advance(full,()=>.4).progress;}
 }
 for(const stage of D.STAGES){full=L.startSession(full,stage.id,()=>.4);for(const step of R.stepsFor(stage))full=L.startSession(full,stage.id,()=>.4,Date.now(),step.id);}
 const large=L.freshStore();large.profiles=Array.from({length:8},(_,i)=>({...L.createProfile('Lernprofil '+i),progress:structuredClone(full)}));large.activeId=large.profiles[0].id;
 const bytes=Buffer.byteLength(JSON.stringify(large));assert.ok(bytes>1_000_000&&bytes<4_000_000,bytes);assert.equal(L.validateStore(large).profiles.length,8);
 await restore(large,false);assert.equal(await page.locator('[data-profile]').count(),8);const restored=await state();assert.deepEqual(restored,full);
 checks.push('A fully completed eight-profile backup with paused Etappen exceeds one MB and restores through the actual confirmed import UI without truncation; input remains bounded to four MB and schema validation.');
 assert.deepEqual(errors,[]);const info=await(await page.request.get(base+'BUILD_INFO.json')).json();await browser.close();
 const evidence={status:'passed',version:D.VERSION,assetVersion:info.assetVersion,checks,pageErrors:errors,limits:'Real Chromium media, backup UI and phone-sized touch emulation; not a physical-phone or educational-efficacy test.'};fs.writeFileSync('docs/verification/v13-reading-path.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
