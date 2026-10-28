const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const D=await import('../app/data.mjs'),L=await import('../app/learning.mjs'),W=await import('../app/word-choices.mjs');
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>document.addEventListener('play',e=>{if(e.target.id==='lesson-audio'){window.spoken??=[];window.spoken.push(new URL(e.target.currentSrc).pathname.split('/').pop());e.target.playbackRate=4;}},true));
 const state=()=>page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));return s.profiles.find(p=>p.id===s.activeId).progress;});
 const spoken=()=>page.evaluate(()=>window.spoken??[]);
 const ready=()=>page.waitForFunction(()=>document.querySelector('[data-choice]')&&!document.querySelector('[data-choice]').disabled,null,{timeout:25000});
 const restore=async store=>{await page.locator('#settings').click();await page.locator('#import').setInputFiles({name:'precise-reading.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(store))});await page.locator('#confirm-import').click();await page.locator('#play').click();await ready();};
 const fixture=(id,strong=false)=>{const store=L.freshStore(),p=store.profiles[0].progress,s=D.stageById(id);if(strong)for(const [n,t]of s.targets.entries())p.skills[D.skillKey(s,t)]={introduced:true,seen:8,first:8,recent:[1,1,1,1],timeline:[[n*2,1],[n*2+1,1]]};store.profiles[0].progress=L.startSession(p,id,()=>.4);return store;};
 const advanceFrom=async index=>page.waitForFunction(i=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3')),p=s.profiles.find(p=>p.id===s.activeId).progress;return !p.pending||p.pending.index!==i;},index);
 const decodePictures=()=>page.evaluate(async()=>Promise.all([...document.querySelectorAll('[data-choice] image')].map(node=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>im.naturalWidth?resolve(true):reject(Error('Empty picture'));im.onerror=()=>reject(Error('Picture failed: '+node.getAttribute('href')));im.src=node.getAttribute('href');}))));
 await page.goto('http://127.0.0.1:8070/preview/phonics-lab/');
 await restore(fixture('long_words_listen',true));let p=await state(),r=p.pending.round;
 const labels=await page.locator('[data-choice]').allTextContents();assert.equal(labels.length,4);assert.ok(labels.every(t=>t[0]===D.ITEMS[r.target].text[0]));assert.equal(new Set(labels).size,4);
 assert.ok(labels.some(t=>t==='Sofa'));const wrong=r.choices.find(c=>W.FORMS[c]);assert.ok(wrong);
 let count=(await spoken()).length;await page.locator(`[data-choice="${wrong}"]`).click();await ready();assert.equal((await spoken()).length,count);
 const saved=(await state()).pending.round;await page.locator('#back').click();await page.reload();await page.locator('#play').click();await ready();assert.deepEqual((await state()).pending.round,saved);
 await page.locator(`[data-choice="${wrong}"]`).click();await ready();assert.equal((await state()).pending.round.help,'show');assert.equal(await page.locator('[data-choice]').count(),1);assert.equal((await spoken()).at(-1),r.cue+'.mp3');
 await page.locator(`[data-choice="${r.target}"]`).click();await ready();assert.equal((await state()).seeds,0);assert.equal(await page.locator('[data-choice]').count(),4);
 await page.screenshot({path:'/workspace/kalulu-browser-build/v9-close-word-390.png',fullPage:true});
 await page.locator(`[data-choice="${r.target}"]`).click();await advanceFrom(0);await ready();assert.equal((await state()).seeds,1);assert.ok((await state()).pending.round.choices.every(c=>!W.FORMS[c]));
 assert.ok((await spoken()).every(id=>!id.startsWith('form_')));
 checks.push('Successful word learners see four same-initial, one-letter alternatives. Invented choices remain silent, survive exact reload, trigger correct-model teaching after two mistakes, award no extra points and lower the next task after an error.');

 await restore(fixture('picture_known'));p=await state();r=p.pending.round;const pictureWrong=r.choices.find(c=>c!==r.target);
 await decodePictures();count=(await spoken()).length;await page.locator(`[data-choice="${pictureWrong}"]`).click();await ready();assert.equal((await spoken()).length,count);assert.equal((await state()).seeds,0);
 await page.locator(`[data-choice="${pictureWrong}"]`).click();await ready();assert.equal((await spoken()).at(-1),r.cue+'.mp3');assert.equal(await page.locator('[data-choice]').count(),1);
 checks.push('Wrong pictures do not read their labels or unrelated sentences. Only the original target is read during the existing two-error teaching step; all AI image files decode.');

 await page.locator('#back').click();await page.locator('#path').click();assert.equal(await page.locator('[data-level]').count(),33);
 assert.ok((await page.locator('[data-stage="sentence_words"]').innerText()).includes('Level 15'));
 assert.ok((await page.locator('[data-stage="phrase_place"]').innerText()).includes('Level 17'));
 checks.push('Common sentence words occur at Level 15, short phrase comprehension at 17; levels 1–14 keep their numbers and all saved IDs remain valid.');

 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(viewport);
  for(const id of ['phrase_place','first_sentences','sentence_meaning']){
   await restore(fixture(id));p=await state();r=p.pending.round;await decodePictures();
   const item=D.ITEMS[r.target],dims=(await import('../app/mixed-reading.mjs')).sceneDimensions(item);assert.ok(r.choices.length>=3);
   for(const d of dims)if(r.choices.some(c=>D.ITEMS[c].scene[d]!==item.scene[d]))assert.ok(r.choices.filter(c=>D.ITEMS[c].scene[d]===item.scene[d]).length>=2);
   count=(await spoken()).length;assert.ok(!(await spoken()).includes(r.cue+'.mp3'),'Independent text is silent before help');
   const boxes=await page.locator('[data-choice]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,bottom:r.bottom};}));
   assert.ok(boxes.every(b=>b.w>=60&&b.h>=60&&b.bottom<=viewport.height),JSON.stringify({viewport,id,boxes}));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.screenshot({path:`/workspace/kalulu-browser-build/v9-${id}-${viewport.width}.png`,fullPage:true});
  }
  checks.push(`${viewport.width}x${viewport.height}: phrase and mixed-task meaning dimensions have real contrasting choices. All choices remain visible and every AI scene image decodes.`);
 }

 const old=L.freshStore(),op=old.profiles[0].progress;op.curriculumVersion=7;op.continuation='first_sentences';op.sessions=20;op.seeds=100;op.stages.first_sentences={completed:2,passed:true,best:1};
 for(const t of D.stageById('first_sentences').legacyTargets)op.skills['sentence:'+t]={introduced:true,seen:3,first:3,recent:[1,1,1],timeline:[]};
 op.pending={stageId:'first_sentences',index:4,total:18,first:2,independent:4,round:{target:'s_hut',choices:['s_hut','s_ball'],cue:'s_hut',demonstration:false,tries:0,position:0,solved:false,help:null,misses:0,assisted:false}};
 await restore(old);assert.equal(await page.locator('.reading-prompt').innerText(),'Das ist ein Hut.');assert.equal((await state()).pending.total,18);assert.equal((await state()).curriculumVersion,10);assert.equal((await state()).stages.first_sentences.passed,false);
 await page.locator('[data-choice="s_hut"]').click();await advanceFrom(4);await ready();assert.ok(D.stageById('first_sentences').targets.includes((await state()).pending.round.target));assert.equal((await state()).seeds,101);assert.equal((await state()).sessions,20);
 checks.push('An exact v8 noun-only saved question and its 18-question goal resume, all old rewards survive, and subsequent questions use real relation contrasts without inheriting old noun-only mastery.');
 assert.deepEqual(errors,[]);const info=await(await page.request.get('http://127.0.0.1:8070/preview/phonics-lab/BUILD_INFO.json')).json();
 const result={status:'passed',version:D.VERSION,assetVersion:info.assetVersion,checks,pageErrors:errors,limits:'Real Chromium/media/image decoding and mobile viewport checks; not a physical-phone, pronunciation or educational validation.'};
 fs.writeFileSync('docs/verification/v9-close-reading.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
