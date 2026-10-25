import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,stageById,skillKey,levelGoal,lettersFor} from '../app/data.mjs';
import {CHAPTERS} from '../app/level-catalog.mjs';
import {DAY} from '../app/spacing.mjs';
import {freshProgress,startSession,answer,advance,useReadingHelp,showHelp,resumePractice,validateProgress,stageMastered,duePractice,startReview,recommended} from '../app/learning.mjs';
const NOW=1_793_000_000_000,rng=()=>.4;
const secure=()=>({introduced:true,seen:5,first:5,recent:[1,1,1,1],timeline:[]});
function solve(p,now=NOW){const stage=stageById(p.pending.stageId);while(!p.pending.round.solved){const r=p.pending.round;p=answer(p,stage.mode==='build'?lettersFor(r.target)[r.position].toLowerCase():r.target,now).progress;}return p;}
function finish(p,now=NOW){while(p.pending){p=solve(p,now);p=advance(p,rng,now).progress;}return p;}

test('an error does not cause back-to-back retries of the same word in later questions',()=>{
 let p=startSession(freshProgress(),'long_words_read',rng,NOW),target=p.pending.round.target;
 p=answer(p,p.pending.round.choices.find(t=>t!==target),NOW).progress;
 p=solve(p);p=advance(p,rng,NOW).progress;
 const next=[];for(let n=0;n<3;n++){next.push(p.pending.round.target);p=solve(p);p=advance(p,rng,NOW).progress;}
 assert.ok(next.slice(0,2).every(t=>t!==target));assert.equal(next[2],target);
});
test('every level interleaves completed targets, even when a single skill remains much weaker',()=>{
 for(const stage of STAGES){
  let p=freshProgress();for(const t of stage.targets)p.skills[skillKey(stage,t)]=secure();
  const weak=stage.targets[0];p.skills[skillKey(stage,weak)]={introduced:true,seen:5,first:0,recent:[0,0,0,0],timeline:[]};
  p=startSession(p,stage.id,rng,NOW);p.pending.total=18;const targets=[];
  while(p.pending){const t=p.pending.round.target;assert.ok(!targets.slice(-2).includes(t),stage.id+': '+targets+' / '+t);targets.push(t);p=solve(p);p=advance(p,rng,NOW).progress;}
  assert.ok(targets.includes(weak));
 }
});
test('successful retrievals expand calendar spacing; an error/assistance resets it without granting mastery',()=>{
 let p=startSession(freshProgress(),'long_words_read',rng,NOW);
 const target=p.pending.round.target,key='meaning:'+target;
 p=solve(p);assert.equal(p.spacing.reviews[key].days,0);
 p=advance(p,rng,NOW).progress;
 while(p.pending.round.target!==target){p=solve(p);p=advance(p,rng,NOW).progress;}
 p=solve(p);assert.equal(p.spacing.reviews[key].days,1);assert.equal(p.spacing.reviews[key].due,NOW+DAY);
 p=finish(p);assert.ok(stageMastered(p,stageById('long_words_read')));assert.deepEqual(duePractice(p,NOW),[]);
 for(const [days,expected]of [[1,3],[4,7],[11,14],[25,30]]){
  p=startReview(p,'long_words_read',rng,NOW+days*DAY);
  p=finish(p,NOW+days*DAY);assert.equal(p.spacing.reviews[key].days,expected);
 }
 p=startReview(p,'long_words_read',rng,NOW+55*DAY);
 const helped=p.pending.round.target,helpedKey='meaning:'+helped;
 p=useReadingHelp(p);p=answer(p,helped,NOW+55*DAY).progress;
 assert.equal(p.spacing.reviews[helpedKey].streak,0);assert.equal(p.spacing.reviews[helpedKey].days,0);
 assert.equal(p.spacing.reviews[helpedKey].due,NOW+55*DAY+600_000);assert.equal(p.skills[helpedKey].recent.at(-1),0);
});
test('legacy secure words start with a genuine delayed review, not immediate repeat requests',()=>{
 let p=freshProgress();const stage=stageById('long_words_read');
 for(const t of stage.targets)p.skills[skillKey(stage,t)]=secure();p.stages[stage.id]={completed:2,passed:true,best:1};
 assert.equal(duePractice(p,NOW)[0].targets.length,3);
 p=startReview(p,stage.id,rng,NOW);assert.equal(p.pending.total,3);p=finish(p);
 assert.deepEqual(duePractice(p,NOW),[]);assert.equal(p.spacing.reviews['meaning:sofa'].due,NOW+DAY);
});
test('new rounds stop padding already-secure words; saved unfinished totals remain exact',()=>{
 let p=freshProgress();const stage=stageById('long_words_read');
 assert.equal(startSession(p,stage.id,rng,NOW).pending.total,6);
 for(const t of stage.targets)p.skills[skillKey(stage,t)]=secure();
 p=startSession(p,stage.id,rng,NOW);assert.equal(p.pending.total,3);
 p.pending.total=18;const pending=structuredClone(p.pending);p=startSession(p,'letters',rng,NOW);
 p=validateProgress(p);p=startSession(p,stage.id,rng,NOW);assert.deepEqual(p.pending,pending);
 assert.equal(levelGoal(stage),6);
});
test('one due word is tested once; explicit review returns to the higher continuation and paused work',()=>{
 let p=freshProgress();const stage=stageById('long_words_read');
 for(const t of stage.targets)p.skills[skillKey(stage,t)]=secure();p.stages[stage.id]={completed:1,passed:true,best:1};
 p=startReview(p,stage.id,rng,NOW);p=finish(p);
 // Only one target becomes due; the others retain later dates.
 p.spacing.reviews['meaning:sofa'].due=NOW;
 p=startSession(p,'sentence_meaning',rng,NOW);const saved=structuredClone(p.pending),seeds=p.seeds;
 p=startReview(p,stage.id,rng,NOW);assert.equal(p.pending.total,1);assert.deepEqual(p.pending.reviewTargets,['sofa']);
 assert.equal(p.continuation,'sentence_meaning');assert.deepEqual(p.paused.sentence_meaning,saved);
 p=validateProgress(JSON.parse(JSON.stringify(p)));p=finish(p,NOW);
 assert.equal(p.seeds,seeds+1);assert.equal(recommended(p).id,'sentence_meaning');
 p=startSession(p,'sentence_meaning',rng,NOW);assert.deepEqual(p.pending,saved);
});
test('a paused review returns to the latest learning cursor if the child has moved forward meanwhile',()=>{
 let p=freshProgress();const stage=stageById('long_words_read');
 for(const t of stage.targets)p.skills[skillKey(stage,t)]=secure();p.stages[stage.id]={completed:1,passed:true,best:1};
 p=startSession(p,'more_words_read',rng,NOW);p=startReview(p,stage.id,rng,NOW);
 assert.equal(p.pending.returnTo,'more_words_read');
 p=startSession(p,'sentence_meaning',rng,NOW);p=startSession(p,stage.id,rng,NOW);
 assert.equal(p.continuation,'sentence_meaning');assert.equal(p.pending.returnTo,'sentence_meaning');
 p=finish(p,NOW);assert.equal(recommended(p).id,'sentence_meaning');
});
test('teaching taps and repeated solved taps do not advance the spacing clock or dates',()=>{
 let p=startSession(freshProgress(),'long_words_read',rng,NOW),r=p.pending.round,wrong=r.choices.find(t=>t!==r.target);
 p=answer(p,wrong,NOW).progress;p=answer(p,wrong,NOW).progress;p=showHelp(p);
 p=answer(p,r.target,NOW).progress;assert.equal(p.spacing.turn,0);assert.deepEqual(p.spacing.reviews,{});
 p=resumePractice(p);p=answer(p,r.target,NOW).progress;const spacing=structuredClone(p.spacing);
 p=answer(p,r.target,NOW+DAY).progress;assert.deepEqual(p.spacing,spacing);assert.equal(p.spacing.turn,1);
});
test('due reviews are unique across overlapping levels, separate from hearing versus reading knowledge',()=>{
 let p=freshProgress();for(const id of ['short','blend']){const s=stageById(id);p.stages[id]={completed:1,passed:true,best:1};for(const t of s.targets)p.skills[skillKey(s,t)]=secure();}
 const keys=duePractice(p,NOW).flatMap(s=>s.targets.map(t=>skillKey(stageById(s.stageId),t)));
 assert.equal(new Set(keys).size,keys.length);
 assert.equal(keys.filter(k=>k==='unit:am').length,1);
});
test('spacing and review state round-trip; malformed dates, paths or future counters are rejected',()=>{
 let p=startSession(freshProgress(),'long_words_read',rng,NOW);p=solve(p);assert.deepEqual(validateProgress(p),p);
 const legacy=structuredClone(p);delete legacy.spacing;const migrated=validateProgress(legacy);assert.equal(migrated.spacing.turn,p.seeds);assert.equal(migrated.seeds,p.seeds);assert.deepEqual(migrated.pending,p.pending);
 for(const change of [v=>v.spacing.turn=-1,v=>v.spacing.history=['bad:key'],v=>v.spacing.reviews['meaning:sofa'].due=-1,v=>v.spacing.reviews['meaning:sofa'].days=999,v=>v.spacing.reviews['meaning:sofa'].after=999,v=>v.pending.returnTo='missing',v=>v.pending.reviewTargets=['sofa']]){
  const bad=structuredClone(p);change(bad);assert.throws(()=>validateProgress(bad));
 }
});
test('groups cover all 32 stable numbered levels and distinguish actual reading from listening',()=>{
 assert.equal(CHAPTERS.length,5);assert.equal(STAGES.length,32);
 for(const [index,s]of STAGES.entries())assert.ok(CHAPTERS.some(c=>c.id===s.chapter&&index+1>=c.from&&index+1<=c.to));
 assert.match(stageById('long_words_listen').title,/hören/);assert.match(stageById('long_words_read').title,/selbst lesen/);
 assert.equal(stageById('first_sentences').activity,'Wörter im Satz lesen');assert.equal(stageById('sentence_meaning').activity,'Sätze verstehen');
});
