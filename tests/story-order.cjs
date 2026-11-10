const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const D=await import('../app/data.mjs'),L=await import('../app/learning.mjs'),S=await import('../app/stories.mjs');
 const base='http://127.0.0.1:8070/preview/phonics-lab/';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>document.addEventListener('play',e=>{if(e.target.id==='lesson-audio'){window.spoken??=[];window.spoken.push(new URL(e.target.currentSrc).pathname.split('/').pop());e.target.playbackRate=4;}},true));
 const state=()=>page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));return s.profiles.find(p=>p.id===s.activeId).progress;});
 const ready=()=>page.waitForFunction(()=>document.querySelector('#story-check')&&document.querySelector('#instruction-info')&&!document.querySelector('#instruction-info').disabled,null,{timeout:25000});
 const spoken=()=>page.evaluate(()=>window.spoken??[]);
 const restore=async(store,play=true)=>{await page.locator('#settings').click();await page.locator('#import').setInputFiles({name:'stories.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(store))});await page.locator('#confirm-import').click();if(play){await page.locator('#play').click();await ready();}};
 const fixture=target=>{const store=L.freshStore();store.profiles[0].progress=L.startSession(store.profiles[0].progress,'story_order',()=>.4);store.profiles[0].progress.pending.round=S.newStoryRound(target,()=>.4);return store;};
 const choose=async frames=>{for(const frame of frames)await page.locator(`[data-story-frame="${frame}"]`).tap();};
 const decode=()=>page.evaluate(async()=>{for(const src of new Set([...document.querySelectorAll('.story-card image')].map(e=>e.href.baseVal)))await new Promise((ok,bad)=>{const i=new Image;i.onload=()=>i.naturalWidth?ok():bad(Error('Empty story sprite'));i.onerror=bad;i.src=src;});});
 const positions=()=>page.locator('[data-story-frame]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return[r.x+scrollX,r.y+scrollY,r.width,r.height];}));
 const checkAndAdvance=async()=>{const index=(await state()).pending.index;await page.locator('#story-check').tap();await page.waitForFunction(i=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));return !s.profiles[0].progress.pending||s.profiles[0].progress.pending.index!==i;},index);};
 await page.goto(base);await page.locator('#path').click();assert.equal(await page.locator('[data-level]').count(),36);assert.equal(await page.locator('[data-level="story_order"]').isDisabled(),true);await page.locator('#preview').check();await page.locator('[data-level="story_order"]').click();await ready();
 assert.match(await page.locator('#level-menu').innerText(),/Level 36/);assert.equal(await page.locator('.story-text p').count(),3);assert.equal(await page.locator('[data-story-frame]').count(),3);assert.equal(await page.locator('.story-empty').count(),3);assert.equal(await page.locator('#story-check').isDisabled(),true);assert.deepEqual(await spoken(),[]);
 let p=await state(),r=p.pending.round;const tray=[...r.choices],bounds=await positions();assert.notDeepEqual(tray,D.ITEMS[r.target].frames);
 await choose(tray);assert.equal((await state()).seeds,0);assert.equal((await state()).pending.index,0);assert.deepEqual(await positions(),bounds);await page.locator('#story-check').tap();await ready();
 assert.equal((await state()).pending.round.tries,1);assert.equal((await state()).pending.round.help,null);assert.deepEqual((await state()).pending.round.order,tray);assert.equal(await page.locator('#replay').count(),0);assert.equal(await page.locator('.order-retry').count(),1);assert.equal((await state()).seeds,0);assert.deepEqual(await spoken(),[]);
 await page.locator('#story-reset').tap();assert.deepEqual((await state()).pending.round.order,[]);assert.equal((await state()).pending.round.tries,1);assert.deepEqual(await positions(),bounds);
 await choose(tray);await page.locator('#story-check').tap();await ready();assert.equal(await page.locator('#replay').count(),1);assert.equal((await state()).pending.round.order.length,3);assert.deepEqual(await spoken(),[]);assert.deepEqual(await positions(),bounds);
 await page.locator('#replay').tap();await ready();assert.deepEqual(await spoken(),[r.cue+'.mp3']);assert.equal((await state()).pending.round.assisted,true);
 const saved=(await state()).pending;await page.locator('#back').tap();await page.reload();await page.locator('#play').tap();await ready();assert.deepEqual((await state()).pending,saved);assert.deepEqual(await spoken(),[]);
 await page.locator('#settings').click();const download=page.waitForEvent('download');await page.locator('#export').click();const backup=JSON.parse(fs.readFileSync(await(await download).path(),'utf8'));assert.deepEqual(backup.profiles[0].progress.pending,saved);await page.locator('#back').click();await page.locator('#play').click();await ready();await page.locator('#story-reset').click();assert.equal((await state()).pending.round.order.length,0);await restore(backup);assert.deepEqual((await state()).pending,saved);
 // Removing a placed card and keyboard reset keep all error/help evidence.
 await page.locator(`[data-story-remove="${tray[1]}"]`).click();assert.equal((await state()).pending.round.order.length,2);assert.equal(await page.locator('#story-check').isDisabled(),true);
 await page.locator('#story-reset').focus();await page.keyboard.press('Enter');assert.equal((await state()).pending.round.tries,2);assert.equal((await state()).pending.round.assisted,true);assert.equal(await page.locator('[data-story-frame]').first().evaluate(e=>e===document.activeElement),true);
 await choose(D.ITEMS[r.target].frames);
 // Stop inside the same event loop before automatic advance to verify exact solved resume.
 await page.evaluate(()=>{document.querySelector('#story-check').click();document.querySelector('#back').click();});p=await state();assert.equal(p.pending.round.solved,true);assert.equal(p.seeds,1);assert.equal(p.skills['story:'+r.target].first,0);assert.equal(p.readingPath.patterns['story:sequence'].first,0);
 await page.reload();await page.locator('#play').click();await ready();assert.equal((await state()).pending.index,1);assert.equal((await state()).seeds,1);
 while((await state()).pending){await ready();const story=D.ITEMS[(await state()).pending.round.target];await choose(story.frames);await checkAndAdvance();}
 assert.equal((await state()).sessions,1);assert.equal((await state()).seeds,3);assert.equal(await page.locator('.completion-meter').getAttribute('aria-valuenow'),'3');
 checks.push('Real touch ordering, explicit full-order check, wrong editable sequence, stationary tray, individual removal and keyboard reset work. Reset preserves attempts/help; two wrong checks unlock only opt-in speech. Partial/wrong/solved states survive confirmed backup, pause and reload without double rewards. Three stories fill the fixed round flower.');
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(viewport);
  for(const target of Object.keys(S.STORIES)){
   await restore(fixture(target));await decode();assert.deepEqual(await page.locator('.story-text p').allTextContents(),S.STORIES[target].sentences);assert.equal(await page.locator('#replay').count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.ok(await page.locator('.story-text').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=20));
   const boxes=await page.locator('[data-story-frame]').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert.ok(boxes.every(b=>b.w>=60&&b.h>=60));
   const pos=await positions();await choose(S.STORIES[target].frames);assert.deepEqual(await positions(),pos);await page.locator('#story-check').scrollIntoViewIfNeeded();assert.ok(await page.locator('#story-check').evaluate(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.top>=0&&r.bottom<=innerHeight;}));
   if(viewport.width===390&&['story_book_bed','story_book_snack','story_cat_rest'].includes(target))await page.screenshot({path:`/workspace/kalulu-browser-build/v14-${target}.png`,fullPage:true});
  }
  checks.push(viewport.width+'x'+viewport.height+': all eight stories and pictures decode; readable text, stable 60px+ cards, reachable 44px+ controls and no horizontal overflow. Short phones can scroll naturally.');
 }
 await page.setViewportSize({width:390,height:844});await restore(fixture('story_book_bed'));await page.route('**/audio/story_order.mp3*',route=>route.abort());await page.locator('#instruction-info').click();await ready();assert.equal(await page.locator('#replay').count(),0);await page.locator('[data-story-frame]').first().click();assert.equal((await state()).pending.round.order.length,1);await page.unroute('**/audio/story_order.mp3*');
 const old=L.freshStore();old.profiles[0].progress.curriculumVersion=13;old.profiles[0].progress.continuation='complete';old.profiles[0].progress.sessions=90;old.profiles[0].progress.seeds=900;
 await restore(old);assert.equal((await state()).pending.stageId,'story_order');assert.equal((await state()).sessions,90);assert.equal((await state()).seeds,900);
 await page.locator('#instruction-info').click();await ready();assert.equal((await spoken()).at(-1),'story_order.mp3');assert.equal((await state()).pending.round.assisted,false);
 checks.push('Optional direction failure does not strand the child. A completed v13 profile starts Level 36 and preserves prior rewards. Info plays only the short instruction, not the story or its answer.');
 assert.deepEqual(errors,[]);const info=await(await page.request.get(base+'BUILD_INFO.json')).json();await browser.close();
 const result={status:'passed',version:D.VERSION,assetVersion:info.assetVersion,stories:8,checks,pageErrors:errors,limits:'Actual Chromium touch/keyboard, real media and backup UI; not a physical-phone or general reading-comprehension validation.'};fs.writeFileSync('docs/verification/v14-stories.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
