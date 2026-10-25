const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const L=await import('../app/learning.mjs'),D=await import('../app/data.mjs');
 const base='http://127.0.0.1:8070/preview/phonics-lab/';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>document.addEventListener('play',e=>{if(e.target.id==='lesson-audio')e.target.playbackRate=4;},true));
 const state=()=>page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));return s.profiles.find(p=>p.id===s.activeId).progress;});
 const ready=()=>page.waitForFunction(()=>document.querySelector('[data-choice]')&&!document.querySelector('[data-choice]').disabled,null,{timeout:25000});
 const restore=async store=>{await page.locator('#settings').click();await page.locator('#import').setInputFiles({name:'review.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(store))});await page.locator('#confirm-import').click();};
 const choose=async()=>{await ready();const before=await state(),index=before.pending.index;await page.locator(`[data-choice="${before.pending.round.target}"]`).click();await page.waitForFunction(i=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3')),p=s.profiles.find(p=>p.id===s.activeId).progress;return !p.pending||p.pending.index!==i;},index);};
 await page.goto(base);await page.locator('#path').click();
 assert.equal(await page.locator('.level-chapter').count(),5);assert.equal(await page.locator('[data-stage]').count(),32);
 assert.ok((await page.locator('[data-stage="long_words_listen"]').innerText()).includes('hören und erkennen'));
 assert.ok((await page.locator('[data-stage="long_words_read"]').innerText()).includes('selbst lesen'));
 assert.ok((await page.locator('[data-stage="first_sentences"]').innerText()).includes('Wörter im Satz lesen'));
 assert.equal(await page.locator('[data-level]').count(),32);
 checks.push('Five named groups retain all 32 stable numbers; activity labels distinguish listening, independent word reading, word-in-sentence reading and sentence understanding.');

 const fixture=L.freshStore();fixture.profiles[0].progress=L.startSession(fixture.profiles[0].progress,'long_words_read',()=>.4);
 await restore(fixture);await page.locator('#play').click();await ready();let p=await state();
 assert.equal(p.pending.total,6);assert.ok((await page.locator('#level-menu').innerText()).includes(D.stageById('long_words_read').title));
 const target=p.pending.round.target,wrong=p.pending.round.choices.find(t=>t!==target);
 await page.locator(`[data-choice="${wrong}"]`).click();await ready();await choose();
 const intervening=[];for(let n=0;n<2;n++){await ready();intervening.push((await state()).pending.round.target);await choose();}
 await ready();assert.ok(intervening.every(t=>t!==target));assert.equal((await state()).pending.round.target,target);
 assert.equal((await state()).spacing.turn,3);
 await page.locator('#back').click();await page.reload();await page.locator('#play').click();await ready();assert.equal((await state()).pending.round.target,target);assert.equal((await state()).spacing.turn,3);
 while((await state()).pending)await choose();assert.equal(await page.locator('.completion-meter').getAttribute('aria-valuenow'),'6');
 checks.push('A real wrong-picture attempt returns after two other questions; spacing survives reload. A new three-word round completes at its full six-question goal.');

 // A v7-style save with known words, an unfinished higher level and no scheduler.
 const legacy=L.freshStore(),lp=legacy.profiles[0].progress,stage=D.stageById('long_words_read');
 for(const t of stage.targets)lp.skills[D.skillKey(stage,t)]={introduced:true,seen:8,first:8,recent:[1,1,1,1],timeline:[]};
 lp.stages[stage.id]={completed:2,passed:true,best:1};legacy.profiles[0].progress=L.startSession(lp,'sentence_meaning',()=>.4);
 const paused=structuredClone(legacy.profiles[0].progress.pending);delete legacy.profiles[0].progress.spacing;
 await restore(legacy);assert.equal(await page.locator('#review-home').count(),1);await page.locator('#review-home').click();await ready();
 p=await state();assert.equal(p.continuation,'sentence_meaning');assert.equal(p.pending.stageId,'long_words_read');assert.equal(p.pending.total,3);assert.deepEqual(p.paused.sentence_meaning,paused);
 const first=p.pending.round.target;await page.locator(`[data-choice="${first}"]`).click();const awarded=(await state()).seeds;
 await page.locator('#back').click();await page.reload();await page.locator('#play').click();await ready();
 p=await state();assert.equal(p.pending.index,1);assert.equal(p.seeds,awarded);assert.equal(p.pending.returnTo,'sentence_meaning');
 while((await state()).pending)await choose();assert.equal(await page.locator('h1').innerText(),'Wiederholung geschafft!');
 p=await state();assert.equal(p.continuation,'sentence_meaning');assert.equal(p.seeds,3);assert.equal(L.duePractice(p).length,0);
 for(const r of Object.values(p.spacing.reviews)){assert.equal(r.days,1);assert.ok(r.due>Date.now());}
 await page.locator('#continue').click();await ready();assert.deepEqual((await state()).pending,paused);
 await page.locator('#back').click();assert.equal(await page.locator('#review-home').count(),0);
 checks.push('Legacy profiles acquire real due reviews without resetting progress. Review keeps the higher forward cursor, survives pause/reload without double awards, schedules secure words for the next day and restores the exact paused sentence question.');

 const old=L.freshStore();old.profiles[0].progress=L.startSession(old.profiles[0].progress,'long_words_read');old.profiles[0].progress.pending.total=18;
 await restore(old);await page.locator('#play').click();await ready();assert.equal((await state()).pending.total,18);
 assert.equal(await page.locator('[role="progressbar"]').getAttribute('aria-valuemax'),'18');
 checks.push('Existing unfinished 18-question goals are not shortened or reset.');

 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(viewport);await restore(legacy);
  assert.equal(await page.locator('#play').evaluate(e=>e.getBoundingClientRect().bottom<innerHeight),true);
  assert.equal(await page.locator('#review-home').evaluate(e=>e.getBoundingClientRect().bottom<innerHeight),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#path').click();assert.equal(await page.locator('.level-chapter').count(),5);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:`/workspace/kalulu-browser-build/v8-groups-${viewport.width}.png`,fullPage:true});
  checks.push(`${viewport.width}x${viewport.height}: continue/review above fold; grouped numbered map has no horizontal overflow.`);
 }
 assert.deepEqual(errors,[]);const info=await(await page.request.get(base+'BUILD_INFO.json')).json();
 const result={status:'passed',version:D.VERSION,assetVersion:info.assetVersion,checks,pageErrors:errors,limits:'Real Chromium/MP3 playback and mobile viewports, not physical-device or educational validation.'};
 fs.writeFileSync('docs/verification/v8-spacing.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
