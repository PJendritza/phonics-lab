const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const D=await import('../app/data.mjs'),L=await import('../app/learning.mjs'),S=await import('../app/stories.mjs');
 const base='http://127.0.0.1:8070/preview/phonics-lab/';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>document.addEventListener('play',e=>{if(e.target.id==='lesson-audio'){window.spoken??=[];window.spoken.push(new URL(e.target.currentSrc).pathname.split('/').pop());e.target.playbackRate=4;}},true));
 await page.addInitScript(()=>{window.gestures=[];for(const type of ['pointerdown','pointerup','pointercancel','click'])document.addEventListener(type,e=>{window.gestures.push({type,x:e.clientX,y:e.clientY,primary:e.isPrimary,pointer:e.pointerType,frame:e.target.closest('[data-story-frame],[data-story-remove]')?.dataset,button:e.target.closest('button')?.id,scroll:scrollY});window.gestures=window.gestures.slice(-16);},true);});
 const state=()=>page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));return s.profiles.find(p=>p.id===s.activeId).progress;});
 const ready=()=>page.waitForFunction(()=>document.querySelector('#story-check')&&!document.querySelector('#instruction-info').disabled);
 const fixture=target=>{const store=L.freshStore();store.profiles[0].progress=L.startSession(store.profiles[0].progress,'story_order',()=>.4);store.profiles[0].progress.pending.round=S.newStoryRound(target,()=>.4);return store;};
 const restore=async store=>{await page.locator('#settings').click();await page.locator('#import').setInputFiles({name:'drag-film.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(store))});await page.locator('#confirm-import').click();await page.locator('#play').click();await ready();};
 const center=async locator=>{const r=await locator.boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2};};
 const mouseDrag=async(source,target,outside=null)=>{
  await source.scrollIntoViewIfNeeded();const a=await center(source),b=outside??await center(target);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move((a.x+b.x)/2,(a.y+b.y)/2,{steps:4});assert.equal(await page.locator('.story-drag-ghost').count(),1);await page.mouse.move(b.x,b.y,{steps:5});await page.mouse.up();assert.equal(await page.locator('.story-drag-ghost').count(),0);
 };
 const slot=i=>page.locator(`[data-story-slot="${i}"]`),pool=page.locator('.story-tray');
 const touch=await page.context().newCDPSession(page);
 async function touchDrag(source,target,cancel=false){
  await source.scrollIntoViewIfNeeded();const a=await center(source),b=await center(target);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y,id:3}]});
  for(let i=1;i<=6;i++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/6,y:a.y+(b.y-a.y)*i/6,id:3}]});
  assert.equal(await page.locator('.story-drag-ghost').count(),1);await touch.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});assert.equal(await page.locator('.story-drag-ghost').count(),0);
 }
 async function solve(){const r=(await state()).pending.round;for(const frame of D.ITEMS[r.target].frames){await page.locator(`[data-story-frame="${frame}"]`).tap();assert.ok((await state()).pending.round.order.includes(frame),JSON.stringify({frame,round:(await state()).pending.round,viewport:page.viewportSize(),gestures:await page.evaluate(()=>window.gestures)}));}await page.locator('#story-check').tap();await page.locator('#film-next').waitFor();}
 await page.goto(base);await restore(fixture('story_dog_hat'));let p=await state(),r=p.pending.round;const [a,b,c]=r.choices;
 const sizes=await page.evaluate(()=>{const cards=[...document.querySelectorAll('[data-story-frame]')].map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}),slot=document.querySelector('[data-story-slot]').getBoundingClientRect();return{cards,slot:{w:slot.width,h:slot.height}};});
 assert.ok(sizes.cards[1].y<sizes.cards[0].y&&sizes.cards[1].y<sizes.cards[2].y);assert.ok(sizes.cards.every(c=>c.w<sizes.slot.w&&c.h<sizes.slot.h));
 await mouseDrag(page.locator(`[data-story-frame="${a}"]`),slot(2));assert.deepEqual((await state()).pending.round.order,[null,null,a]);assert.equal((await state()).seeds,0);assert.equal(await page.locator('#story-check').isDisabled(),true);
 const large=await page.locator(`[data-story-remove="${a}"]`).boundingBox();assert.ok(large.width>sizes.cards[0].w);
 await mouseDrag(page.locator(`[data-story-frame="${b}"]`),slot(0));await mouseDrag(page.locator(`[data-story-remove="${a}"]`),slot(0));assert.deepEqual((await state()).pending.round.order,[a,null,b]);
 await mouseDrag(page.locator(`[data-story-remove="${b}"]`),pool);assert.deepEqual((await state()).pending.round.order,[a]);
 const before=structuredClone((await state()).pending);await mouseDrag(page.locator(`[data-story-frame="${c}"]`),null,{x:10,y:10});assert.deepEqual((await state()).pending,before);
 await page.locator(`[data-story-frame="${c}"]`).tap();await page.locator(`[data-story-frame="${b}"]`).focus();await page.keyboard.press('Enter');assert.deepEqual((await state()).pending.round.order,[a,c,b]);
 await page.locator('#story-reset').tap();assert.equal((await state()).pending.round.order.length,0);
 await touchDrag(page.locator(`[data-story-frame="${a}"]`),slot(1));assert.deepEqual((await state()).pending.round.order,[null,a]);
 const touched=(await state()).pending;await touchDrag(page.locator(`[data-story-frame="${b}"]`),slot(0),true);assert.deepEqual((await state()).pending,touched);
 await page.locator('#back').click();await page.reload();await page.locator('#play').click();await ready();assert.deepEqual((await state()).pending,touched);
 await page.locator('#settings').click();const download=page.waitForEvent('download');await page.locator('#export').click();const backup=JSON.parse(fs.readFileSync(await(await download).path(),'utf8'));assert.deepEqual(backup.profiles[0].progress.pending,touched);await restore(backup);assert.deepEqual((await state()).pending,touched);
 checks.push('Real mouse and CDP touch drags place into any empty numbered box, swap occupied boxes, return to the pool, cancel safely, and enlarge cards. Native taps and keyboard selection still work without synthetic duplicate clicks. The small triangular pool has no column alignment. Null-position orders survive actual confirmed backup and reload.');
 await page.locator('#story-reset').tap();await solve();p=await state();assert.equal(p.pending.round.solved,true);assert.equal(p.seeds,1);assert.equal(p.skills['story:story_dog_hat'].first,1);
 assert.equal(await page.locator('[data-story-frame]').count(),0);const section=page.locator('.story-film');await page.waitForFunction(()=>Number(document.querySelector('.story-film').dataset.progress)>.03);
 await page.locator('#film-pause').click();const paused=await section.getAttribute('data-progress'),transform=await page.locator('[data-film-part="sniff"]').getAttribute('transform');await page.waitForTimeout(180);assert.equal(await section.getAttribute('data-progress'),paused);assert.equal(await page.locator('[data-film-part="sniff"]').getAttribute('transform'),transform);
 await page.locator('#film-replay').click();assert.ok(Number(await section.getAttribute('data-progress'))<.12);assert.equal((await state()).seeds,1);
 await page.waitForFunction(()=>document.querySelector('.story-film').dataset.playing==='false',null,{timeout:12000});assert.equal(await page.locator('.film-caption').innerText(),S.STORIES.story_dog_hat.sentences[2]);assert.equal(await page.locator('[data-film-part="sleep"]').getAttribute('opacity'),'1.000');
 await page.screenshot({path:'/workspace/kalulu-browser-build/v15-dog-movie-end.png',fullPage:true});await page.locator('#film-narrate').click();await page.waitForFunction(()=>window.spoken?.includes('story_dog_hat.mp3'));assert.equal((await state()).pending.round.assisted,false);assert.equal((await state()).skills['story:story_dog_hat'].seen,1);
 const solved=(await state()).pending;await page.locator('#back').click();assert.equal(await page.locator('.story-drag-ghost').count(),0);await page.reload();await page.locator('#play').click();await page.locator('#film-next').waitFor();assert.deepEqual((await state()).pending,solved);assert.equal((await state()).seeds,1);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.film-stills').waitFor();assert.equal(await page.locator('.film-stills figure').count(),3);assert.equal(await page.locator('#film-pause').count(),0);assert.equal(await page.locator('#film-replay').count(),0);await page.locator('#film-next').click();await ready();assert.equal((await state()).pending.index,1);assert.equal((await state()).seeds,1);await page.emulateMedia({reducedMotion:'no-preference'});
 checks.push('Only a correct whole story starts a real moving 2D scene. Pause, actual timed end, replay, opt-in narration, skip/continue and solved resume preserve a single reward. A live reduced-motion preference change stops animation and shows three stills.');
 for(const target of ['story_frog_ball','story_cat_box']){
  await restore(fixture(target));await solve();await page.waitForFunction(()=>Number(document.querySelector('.story-film').dataset.progress)>.08);assert.equal(await page.locator('.story-film-scene').getAttribute('data-film'),S.STORIES[target].film);await page.locator('#film-pause').click();await page.screenshot({path:`/workspace/kalulu-browser-build/v15-${target}-movie.png`,fullPage:true});await page.locator('#film-next').click();await ready();
 }
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(viewport);await restore(fixture('story_cat_box'));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  r=(await state()).pending.round;await touchDrag(page.locator(`[data-story-frame="${r.choices[0]}"]`),slot(2));assert.equal((await state()).pending.round.order[2],r.choices[0]);await page.locator('#story-reset').click();assert.deepEqual((await state()).pending.round.order,[]);
  await page.screenshot({path:`/workspace/kalulu-browser-build/v15-pool-${viewport.width}.png`,fullPage:true});await solve();await page.locator('#film-next').scrollIntoViewIfNeeded();assert.ok(await page.locator('#film-next').evaluate(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.top>=0&&r.bottom<=innerHeight;}));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#film-next').click();await ready();
  checks.push(viewport.width+'x'+viewport.height+': triangular pool, actual touch drop, reset and reachable movie controls work without horizontal overflow.');
 }
 assert.deepEqual(errors,[]);const info=await(await page.request.get(base+'BUILD_INFO.json')).json();await browser.close();
 const result={status:'passed',version:D.VERSION,assetVersion:info.assetVersion,checks,pageErrors:errors,limits:'Actual Chromium/CDP touch/mouse/keyboard and media with phone-sized viewports; not a physical-device or educational-efficacy test.'};fs.writeFileSync('docs/verification/v15-story-drag-film.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
