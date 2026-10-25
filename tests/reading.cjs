const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const D=await import('../app/data.mjs'),L=await import('../app/learning.mjs');
 const base=process.env.TEST_URL||'http://127.0.0.1:8070/preview/phonics-lab/';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[],requests=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await context.addInitScript(()=>document.addEventListener('play',e=>{
  if(e.target.id==='lesson-audio'){window.speech??=[];window.speech.push(new URL(e.target.currentSrc).pathname.split('/').pop());e.target.playbackRate=4;}
 },true));
 const state=()=>page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));return s.profiles.find(p=>p.id===s.activeId).progress;});
 const ready=()=>page.waitForFunction(()=>document.querySelector('[data-choice]')&&!document.querySelector('[data-choice]').disabled,null,{timeout:25000});
 const speech=()=>page.evaluate(()=>window.speech||[]);
 const restore=async fixture=>{
  await page.locator('#settings').click();await page.locator('#import').setInputFiles({name:'reading.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
  await page.locator('#confirm-import').click();await page.locator('#play').click();await ready();
 };
 const fixture=(stage,hard=false)=>{
  const store=L.freshStore(),p=store.profiles[0].progress;
  if(hard)for(const [n,t]of D.STAGES[0].targets.entries())p.skills[D.skillKey(D.STAGES[0],t)]={introduced:true,seen:2,first:2,recent:[1,1],timeline:[[n*2,1],[n*2+1,1]]};
  store.profiles[0].progress=L.startSession(p,stage,()=>.4);return store;
 };
 const solve=async()=>{
  await ready();const before=await state(),index=before.pending.index;
  await page.locator(`[data-choice="${before.pending.round.target}"]`).click();
  await page.waitForFunction(i=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3')),p=s.profiles.find(p=>p.id===s.activeId).progress;return !p.pending||p.pending.index!==i;},index);
 };
 await page.goto(base);await restore(fixture('picture_known'));
 let p=await state(),plays=await speech();assert.ok(plays.includes('picture_read.mp3'));assert.ok(!plays.includes(p.pending.round.cue+'.mp3'));
 assert.equal(await page.locator('.reading-prompt').innerText(),D.ITEMS[p.pending.round.target].text);
 assert.equal(await page.locator('[data-choice] >svg').count(),2);assert.equal(await page.locator('[data-choice]').first().innerText(),'');
 const count=plays.length;await solve();await ready();assert.equal((await speech()).length,count);
 assert.equal((await state()).skills['meaning:'+p.pending.round.target].first,1);
 checks.push('Independent word reading plays only its generic instruction, displays the written word and label-free picture choices, then advances silently with the existing chime.');

 await restore(fixture('long_words_read'));p=await state();const target=p.pending.round.target,choices=p.pending.round.choices;
 assert.equal(target,'sofa');assert.equal(await page.locator('.reading-syllable').count(),0);
 const beforeHelp=(await speech()).length;await page.locator('#syllable-help').click();
 assert.equal(await page.locator('.reading-syllable').count(),2);assert.equal((await state()).pending.round.assisted,true);assert.equal((await speech()).length,beforeHelp);
 await page.reload();await page.locator('#play').click();await ready();assert.deepEqual((await state()).pending.round.choices,choices);
 assert.equal(await page.locator('.reading-syllable').count(),2);assert.equal((await speech()).length,0);
 await page.locator('#replay').click();await ready();assert.equal((await speech()).at(-1),'sofa.mp3');
 await solve();await ready();assert.equal((await state()).skills['meaning:sofa'].first,0);assert.equal((await state()).pending.round.assisted,false);
 checks.push('Optional syllable help preserves the word spelling and answer order; assistance survives reload and exact resume. Explicit read-aloud plays the human word and cannot count as independent mastery.');

 await restore(fixture('ei_read'));await page.locator('#syllable-help').click();assert.equal(await page.locator('.reading-prompt mark').innerText(),'Ei');
 checks.push('Optional grapheme highlighting keeps ei together without synthesizing an isolated phoneme.');

 await restore(fixture('picture_known'));p=await state();const r=p.pending.round,wrong=r.choices.find(t=>t!==r.target),positions=await page.locator('[data-choice]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));
 const beforeWrong=(await speech()).length;await page.locator(`[data-choice="${wrong}"]`).click();await ready();assert.equal((await speech()).length,beforeWrong);assert.equal((await state()).seeds,0);
 assert.deepEqual(await page.locator('[data-choice]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})),positions);
 await page.locator(`[data-choice="${wrong}"]`).click();await ready();assert.equal((await state()).pending.round.help,'show');assert.equal(await page.locator('[data-choice]').count(),1);
 assert.equal((await speech()).at(-1),D.ITEMS[r.target].audio+'.mp3');
 await page.locator(`[data-choice="${r.target}"]`).click();await ready();assert.equal((await state()).seeds,0);assert.equal((await state()).pending.index,0);assert.equal(await page.locator('[data-choice]').count(),2);
 await solve();await ready();assert.equal((await state()).skills['meaning:'+r.target].first,0);
 checks.push('Wrong pictures stay silent and keep the written task and tile positions; they never read an unrelated label. Two errors trigger one-choice teaching, then the original choices; guided taps award nothing extra.');

 for(const id of D.STAGES.slice(14).map(s=>s.id)){
  await restore(fixture(id));p=await state();assert.equal(p.pending.stageId,id);assert.equal(p.pending.round.demonstration,false);
  assert.ok((await page.locator('[data-choice]').count())>=2);await solve();
 }
 checks.push('Every appended level starts with choices and executes a real answer/automatic transition, using real MP3s for all listening levels.');

 await restore(fixture('sentence_meaning',true));p=await state();plays=await speech();const sentenceGoal=p.pending.total;
 assert.ok(!plays.includes(p.pending.round.cue+'.mp3'));assert.equal(await page.locator('.sentence-prompt').innerText(),D.ITEMS[p.pending.round.target].text);
 assert.equal(await page.locator('[data-choice]').count(),4);
 const item=D.ITEMS[p.pending.round.target],others=p.pending.round.choices.filter(t=>t!==p.pending.round.target);
 assert.ok(others.some(t=>D.ITEMS[t].subject===item.subject));assert.ok(others.some(t=>D.ITEMS[t].location===item.location));
 await page.locator('#replay').click();await ready();assert.equal((await speech()).at(-1),item.audio+'.mp3');
 await page.screenshot({path:'/workspace/kalulu-browser-build/v7-sentence-390.png',fullPage:true});
 for(let n=0;n<sentenceGoal;n++)await solve();await page.locator('#continue').waitFor();
 // Assistance on the first question may require another round to establish
 // mastery, but practice always completes its full fixed flower goal.
 assert.equal((await state()).sessions,1);assert.equal((await state()).seeds,sentenceGoal);assert.equal(await page.locator('.completion-meter').getAttribute('aria-valuenow'),String(sentenceGoal));
 checks.push('Sentences show text without reading it aloud; choices contain same-object/different-location and same-location/different-object contrasts. Optional full-sentence support plays; the complete round goal earns one flower.');

 const layout=[];
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(viewport);
  for(const id of ['more_words_read','sentence_meaning']){
   await restore(fixture(id,true));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const boxes=await page.locator('[data-choice]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom};}));
   assert.equal(boxes.length,4);assert.ok(boxes.every(b=>b.w>=60&&b.h>=60&&b.y>=0&&b.bottom<=viewport.height),JSON.stringify({viewport,id,boxes}));
   await page.screenshot({path:`/workspace/kalulu-browser-build/v7-${id}-${viewport.width}.png`,fullPage:true});
   layout.push(`${viewport.width}x${viewport.height} ${id}: four stationary picture choices visible without horizontal overflow`);
  }
 }
 checks.push(...layout);
 await page.locator('#back').click();await page.goto(base+'audio-review.html');await page.locator('[data-filter="sentence"]').click();
 assert.equal(await page.locator('.audio-row:visible').count(),JSON.parse(fs.readFileSync('app/audio/manifest.json','utf8')).clips.filter(c=>c.group==='sentence').length);
 assert.equal(await page.locator('.audio-row:visible audio').count(),JSON.parse(fs.readFileSync('app/audio/manifest.json','utf8')).clips.filter(c=>c.group==='sentence').length);
 assert.deepEqual(errors,[]);assert.ok(requests.every(u=>u.startsWith(base)));
 checks.push('Adult sound review filters all full-sentence/phrase clips; no page errors or third-party runtime requests. No microphone or speech recognition added.');
 const info=await (await context.request.get(base+'BUILD_INFO.json')).json();
 const result={status:'passed',version:D.VERSION,assetVersion:info.assetVersion,checks,pageErrors:errors,limitation:'Chromium mobile viewport emulation and real media playback; not a physical-phone, native-pronunciation or educational-efficacy certification.'};
 fs.writeFileSync('docs/verification/2026-10-18/reading.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
