import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../app/learning.mjs';
import {STORIES,newStoryRound,dropStoryRound,fullStoryOrder} from '../app/stories.mjs';
import {FILM_FRAMES} from '../app/film-data.mjs';
import {filmState,filmMarkup,filmFrame} from '../app/film-scenes.mjs';
import {ITEMS,stageById} from '../app/data.mjs';
const NOW=1_794_300_000_000;
const start=()=>L.startSession(L.freshProgress(),'story_order',()=>.4,NOW);

test('three new film stories are first, use matching static/animated frames, and retain the eight old stories',()=>{
 const ids=Object.keys(STORIES);assert.deepEqual(ids.slice(0,3),['story_dog_hat','story_frog_ball','story_cat_box']);assert.equal(ids.length,11);
 for(const id of ids.slice(0,3)){const story=STORIES[id];assert.ok(story.film);for(const frame of story.frames)assert.equal(FILM_FRAMES[frame].film,story.film);}
 assert.ok(ids.includes('story_book_bed'));assert.equal(STORIES.story_book_bed.film,undefined);
});

test('pool cards can be placed into any empty position without inventing a completion',()=>{
 let p=start(),frame=p.pending.round.choices[0];p=L.placeStoryFrame(p,frame,2);
 assert.deepEqual(p.pending.round.order,[null,null,frame]);assert.equal(fullStoryOrder(p.pending.round),false);assert.strictEqual(L.answer(p,p.pending.round.target,NOW).progress,p);assert.equal(p.seeds,0);
 assert.deepEqual(L.validateProgress(JSON.parse(JSON.stringify(p))),p);
 p=L.arrangeStory(p,p.pending.round.choices[1]);assert.equal(p.pending.round.order[0],p.pending.round.choices[1]);assert.equal(p.pending.round.order[2],frame);
});

test('dragging between occupied boxes swaps cards; replacing from the pool returns the displaced one',()=>{
 let p=start();const [a,b,c]=p.pending.round.choices;
 p=L.placeStoryFrame(p,a,0);p=L.placeStoryFrame(p,b,1);p=L.placeStoryFrame(p,a,1);assert.deepEqual(p.pending.round.order,[b,a]);
 p=L.placeStoryFrame(p,c,1);assert.deepEqual(p.pending.round.order,[b,c]);assert.ok(!p.pending.round.order.includes(a));
 p=L.placeStoryFrame(p,b,null);assert.deepEqual(p.pending.round.order,[null,c]);assert.equal(p.seeds,0);
});

test('invalid or cancelled drops are inert and dropping a card on itself preserves checked feedback',()=>{
 let p=start();for(const f of p.pending.round.choices)p=L.arrangeStory(p,f);p=L.answer(p,p.pending.round.target,NOW).progress;
 assert.equal(p.pending.round.checked,true);
 for(const [f,index]of [['missing',0],[p.pending.round.choices[0],-1],[p.pending.round.choices[0],3],[p.pending.round.choices[0],.5],[p.pending.round.order[0],0]])assert.strictEqual(L.placeStoryFrame(p,f,index),p);
});

test('editing/resetting after a wrong drag preserves errors and opt-in help, and cannot create independent first success',()=>{
 let p=start();for(const [i,f]of p.pending.round.choices.entries())p=L.placeStoryFrame(p,f,i);
 p=L.answer(p,p.pending.round.target,NOW).progress;p=L.answer(p,p.pending.round.target,NOW).progress;p=L.useReadingHelp(p,true);const tries=p.pending.round.tries;
 p=L.resetStory(p);for(const [i,f]of ITEMS[p.pending.round.target].frames.entries())p=L.placeStoryFrame(p,f,i);
 assert.equal(p.pending.round.tries,tries);assert.equal(p.pending.round.assisted,true);p=L.answer(p,p.pending.round.target,NOW).progress;
 assert.equal(p.pending.round.solved,true);assert.equal(p.skills['story:'+p.pending.round.target].first,0);assert.equal(p.seeds,1);assert.strictEqual(L.placeStoryFrame(p,p.pending.round.choices[0],null),p);
});

test('all insertion permutations and swap paths retain each frame at most once through validation',()=>{
 const target='story_dog_hat',frames=STORIES[target].frames;
 for(const slots of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]){
  let p=start();for(let i=0;i<3;i++){p=L.placeStoryFrame(p,frames[i],slots[i]);assert.deepEqual(L.validateProgress(p),p);}
  assert.equal(fullStoryOrder(p.pending.round),true);assert.equal(new Set(p.pending.round.order).size,3);
  for(let i=0;i<3;i++)p=L.placeStoryFrame(p,frames[i],i);
  assert.deepEqual(p.pending.round.order,frames);assert.equal(L.answer(p,target,NOW).correct,true);
 }
});

test('legacy compact partial orders remain exact, while malformed holes/duplicates still reject imports',()=>{
 let p=start();p.pending.round=newStoryRound('story_book_bed',()=>.4);p.pending.round.order=[p.pending.round.choices[0]];p.curriculumVersion=14;
 const pending=structuredClone(p.pending);assert.deepEqual(L.validateProgress(p).pending,pending);
 for(const order of [[null,'missing'],[p.pending.round.choices[0],null,p.pending.round.choices[0]],[null,null,null,null]]){const bad=structuredClone(p);bad.pending.round.order=order;assert.throws(()=>L.validateProgress(bad));}
});

test('v14 story awards/history survive but the three new stories require fresh independent evidence',()=>{
 const p=L.freshProgress();p.curriculumVersion=14;p.continuation='complete';p.sessions=30;p.seeds=500;p.stages.story_order={passed:true,completed:6,best:1};
 for(const id of Object.keys(STORIES).slice(3))p.skills['story:'+id]={introduced:true,seen:4,first:4,recent:[1,1,1,1],timeline:[[1,1]]};
 const q=L.validateProgress(p);assert.equal(q.sessions,30);assert.equal(q.seeds,500);assert.equal(q.stages.story_order.completed,6);assert.equal(q.stages.story_order.passed,true);assert.equal(L.stageMastered(q,stageById('story_order')),false);assert.deepEqual(q.skills,p.skills);
 assert.equal(q.continuation,'story_order');assert.equal(L.startSession(q,'story_order',()=>.4,NOW).pending.round.target,'story_dog_hat');
});

test('solved movie questions can pause/reload/replay without scoring or advancing twice',()=>{
 let p=start();for(const [i,f]of ITEMS[p.pending.round.target].frames.entries())p=L.placeStoryFrame(p,f,i);p=L.answer(p,p.pending.round.target,NOW).progress;
 assert.ok(ITEMS[p.pending.round.target].film);const solved=structuredClone(p.pending);p=L.startSession(p,'letters',()=>.4,NOW);p=L.validateProgress(p);p=L.startSession(p,'story_order',()=>.4,NOW);
 assert.deepEqual(p.pending,solved);assert.equal(p.seeds,1);assert.strictEqual(L.answer(p,p.pending.round.target,NOW).progress,p);p=L.advance(p,()=>.4,NOW).progress;assert.equal(p.pending.index,1);assert.equal(p.seeds,1);
});

test('film keyframes show one final animal and a ball rotating about its own centre instead of disappearing',()=>{
 const final=filmState('frog',1);assert.equal(final.find(p=>p.id==='frog-sit').opacity,1);assert.equal(final.find(p=>p.id==='frog-jump').opacity,0);
 for(const t of [0,.2,1/3,.54,.8,1]){const ball=filmState('frog',t).find(p=>p.id==='ball');assert.equal(ball.pivot.x,ball.w/2);assert.equal(ball.pivot.y,ball.h/2);assert.equal(ball.opacity,1);}
 for(const [id,frame]of Object.entries(FILM_FRAMES)){const svg=filmFrame(id);assert.ok(svg.includes(`viewBox="${frame.viewBox}"`));assert.ok(svg.includes(`data-film="${frame.film}"`));}
});

test('animated actors move between stages while image resources and narrative order remain fixed',()=>{
 for(const kind of ['dog','frog','cat']){
  const times=[0,.18,.45,.73,1],states=times.map(t=>filmState(kind,t));assert.ok(states.some(s=>JSON.stringify(s)!==JSON.stringify(states[0])));
  const arts=states.map(s=>s.map(p=>p.art));assert.ok(arts.every(a=>JSON.stringify(a)===JSON.stringify(arts[0])));
  for(const parts of states)for(const p of parts)for(const field of ['x','y','w','h','angle','opacity'])assert.ok(Number.isFinite(p[field]));
  assert.equal(filmMarkup(kind).includes('<script'),false);
 }
 assert.equal(stageById('story_order').targets.length,11);
});
