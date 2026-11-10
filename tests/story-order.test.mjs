import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as L from '../app/learning.mjs';
import {STAGES,ITEMS,stageById,stageNumber,levelGoal} from '../app/data.mjs';
import {STORIES,newStoryRound} from '../app/stories.mjs';
import {illustration} from '../app/pictures.mjs';
import {wordInventory} from '../app/word-inventory.mjs';
import {orderedStory} from './helpers/story-fixture.mjs';
const NOW=1_794_000_000_000,rng=()=>.4;
const start=()=>L.startSession(L.freshProgress(),'story_order',rng,NOW);
function finish(p){while(p.pending){p=L.answer(orderedStory(p),p.pending.round.target,NOW).progress;p=L.advance(p,rng,NOW).progress;}return p;}

test('Level 36 appends eight short coherent stories; old reading levels and their targets stay unchanged',()=>{
 assert.equal(STAGES.length,36);assert.equal(stageNumber('story_order'),36);assert.equal(levelGoal(stageById('story_order')),3);
 assert.deepEqual(STAGES.slice(32,35).map(s=>s.targets.length),[80,105,102]);assert.equal(Object.keys(STORIES).length,8);
 for(const s of Object.values(STORIES)){
  assert.equal(s.sentences.length,3);assert.equal(s.frames.length,3);assert.equal(new Set(s.frames).size,3);
  assert.ok(s.text.split(' ').length<=22);for(const frame of s.frames)assert.ok(illustration(frame).startsWith('<svg'));
 }
 assert.deepEqual(new Set(STORIES.story_breakfast_book.frames),new Set(STORIES.story_book_snack.frames));
 assert.notDeepEqual(STORIES.story_breakfast_book.frames,STORIES.story_book_snack.frames);
});

test('tray is a saved permutation and never starts in answer order, including adversarial shuffle endpoints',()=>{
 for(const target of Object.keys(STORIES))for(const random of [()=>0,()=>.4,()=>.999999]){
  const r=newStoryRound(target,random);assert.deepEqual(new Set(r.choices),new Set(STORIES[target].frames));assert.notDeepEqual(r.choices,STORIES[target].frames);assert.deepEqual(r.order,[]);
 }
});

test('placing, removing and resetting are reversible and award no partial reading progress',()=>{
 let p=start(),r=p.pending.round;const original=structuredClone(r),frame=r.choices[0];
 assert.strictEqual(L.answer(p,r.target,NOW).progress,p);
 p=L.arrangeStory(p,frame);assert.deepEqual(p.pending.round.order,[frame]);assert.equal(p.seeds,0);assert.equal(L.levelProgress(p).value,0);
 p=L.arrangeStory(p,frame);assert.deepEqual(p.pending.round.order,[]);
 p=L.arrangeStory(p,frame);p=L.resetStory(p);assert.deepEqual(p.pending.round,original);
 assert.strictEqual(L.arrangeStory(p,'unknown'),p);
});

test('wrong whole orders stay editable; reset preserves attempts and cannot manufacture first-try mastery',()=>{
 let p=start(),r=p.pending.round;
 for(const frame of r.choices)p=L.arrangeStory(p,frame);
 p=L.answer(p,r.target,NOW).progress;assert.equal(p.pending.round.checked,true);assert.equal(p.pending.round.solved,false);assert.equal(p.pending.round.tries,1);assert.equal(p.seeds,0);assert.equal(L.readingAudioAvailable(p),false);
 const choices=[...p.pending.round.choices];p=L.resetStory(p);assert.deepEqual(p.pending.round.choices,choices);assert.deepEqual(p.pending.round.order,[]);assert.equal(p.pending.round.tries,1);
 p=L.answer(orderedStory(p),r.target,NOW).progress;assert.equal(p.pending.round.solved,true);assert.equal(p.skills['story:'+r.target].first,0);assert.equal(p.seeds,1);
 assert.strictEqual(L.resetStory(p),p);assert.strictEqual(L.answer(p,r.target,NOW).progress,p);assert.equal(L.levelProgress(p).value,1);
});

test('two incorrect checks unlock optional full-story reading without revealing or automatically fixing the sequence',()=>{
 let p=start(),r=p.pending.round;for(const frame of r.choices)p=L.arrangeStory(p,frame);
 p=L.answer(p,r.target,NOW).progress;p=L.answer(p,r.target,NOW).progress;
 assert.equal(p.pending.round.help,null);assert.equal(L.readingAudioAvailable(p),true);const order=[...p.pending.round.order];
 p=L.useReadingHelp(p,true);assert.equal(p.pending.round.assisted,true);assert.deepEqual(p.pending.round.order,order);
 p=L.resetStory(p);assert.equal(L.readingAudioAvailable(p),true);assert.equal(p.pending.round.assisted,true);
 p=L.answer(orderedStory(p),r.target,NOW).progress;assert.equal(p.skills['story:'+r.target].first,0);
 assert.equal(p.readingPath.patterns['story:sequence'].seen,1);assert.equal(p.readingPath.patterns['story:sequence'].first,0);
 for(const word of Object.values(p.readingPath.words))assert.equal(word.recognised,0);
});

test('partial, wrong and solved story arrangements round-trip and survive switching and independent profiles',()=>{
 let p=start();p=L.arrangeStory(p,p.pending.round.choices[0]);const original=structuredClone(p.pending);
 p=L.startSession(p,'reading_animals',rng,NOW);assert.deepEqual(p.paused.story_order,original);p=L.validateProgress(JSON.parse(JSON.stringify(p)));
 p=L.startSession(p,'story_order',rng,NOW);assert.deepEqual(p.pending,original);p=L.answer(orderedStory(p),p.pending.round.target,NOW).progress;
 const solved=structuredClone(p.pending),seeds=p.seeds;p=L.startSession(p,'letters',rng,NOW);p=L.validateProgress(p);p=L.startSession(p,'story_order',rng,NOW);
 assert.deepEqual(p.pending,solved);assert.equal(p.seeds,seeds);p=L.advance(p,rng,NOW).progress;assert.equal(p.pending.index,1);assert.equal(p.seeds,seeds);
});

test('story practice completes fixed rounds and reaches the new final course boundary without backtracking',()=>{
 let p=start();p=finish(p);assert.equal(p.sessions,1);assert.equal(p.seeds,3);assert.equal(p.continuation,'story_order');
 for(let n=0;n<7&&!p.stages.story_order.passed;n++)p=finish(L.startSession(p,'story_order',rng,NOW));
 assert.equal(p.stages.story_order.passed,true);assert.equal(p.continuation,'complete');assert.equal(L.recommended(p),null);assert.deepEqual(L.validateProgress(p),p);
});

test('v13 course end and old review return move forward to stories while exact old questions and rewards remain',()=>{
 let p=L.freshProgress();p.curriculumVersion=13;p.continuation='complete';p.sessions=100;p.seeds=999;
 p=L.validateProgress(p);assert.equal(p.continuation,'story_order');assert.equal(p.sessions,100);assert.equal(p.seeds,999);
 p=L.startSession(p,'reading_everyday',rng,NOW);p.curriculumVersion=13;p.pending.returnTo='complete';p.continuation='complete';const round=structuredClone(p.pending.round),goal=p.pending.total;
 p=L.validateProgress(p);assert.equal(p.pending.returnTo,'story_order');assert.deepEqual(p.pending.round,round);assert.equal(p.pending.total,goal);
});

test('malformed frame IDs, duplicate cards, inconsistent checks and bypassed solved flags reject backup import',()=>{
 const p=start();for(const mutate of [r=>r.choices[0]='story_book_bed',r=>r.order=['missing'],r=>r.order=[r.choices[0],r.choices[0]],r=>r.checked=true,r=>r.solved=true,r=>r.help='show',r=>r.misses=2,r=>delete r.order]){
  const bad=structuredClone(p);mutate(bad.pending.round);assert.throws(()=>L.validateProgress(bad));
 }
});

test('new stories and their words appear in actual vocabulary and approved optional audio without fabricated phone clips',()=>{
 const rows=wordInventory(),clips=new Map(JSON.parse(fs.readFileSync('app/audio/manifest.json')).clips.map(c=>[c.id,c]));
 for(const word of ['es','er','sie','dann','danach'])assert.ok(rows.some(r=>r.word===word&&r.levels.includes(36)),word);
 for(const [id,s]of Object.entries(STORIES)){assert.equal(clips.get(id).label,s.text);assert.equal(clips.get(id).generation.lengthScale,1.5);assert.equal(clips.get(id).generation.sentencePauseSeconds,.3);}
 assert.equal(clips.get('story_order').label,'Lies die Geschichte. Tippe die Bilder der Reihe nach an.');
 assert.ok(![...clips.keys()].some(id=>id.startsWith('phoneme_')));
});
