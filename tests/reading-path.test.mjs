import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,ITEMS,stageById} from '../app/data.mjs';
import * as L from '../app/learning.mjs';
import {READING_PATHS,stepsFor,stepStats,currentStep,patternKeys} from '../app/reading-path.mjs';
import {equivalentScene,sceneDimensions,SCENE_ITEMS} from '../app/mixed-reading.mjs';
import {illustration} from '../app/pictures.mjs';
import {SHEETS,SPRITES} from '../app/image-data.mjs';
import {wordInventory} from '../app/word-inventory.mjs';
const NOW=1_793_000_000_000, DAY=86_400_000, rng=()=>.4;
function finish(p,now=NOW){while(p.pending){p=L.answer(p,p.pending.round.target,now).progress;p=L.advance(p,rng,now).progress;}return p;}
function single(p,id,target,now=NOW){p=structuredClone(p);p.stages[id]??={completed:1,passed:false,best:0};p.skills[`${stageById(id).group}:${target}`]??={introduced:true,seen:1,first:0,recent:[0],timeline:[[1,0]]};return L.startReview(p,id,rng,now);}

test('three numbered reading levels have four finite named Etappen covering every live target',()=>{
 assert.equal(STAGES.length,36);
 for(const [id,steps]of Object.entries(READING_PATHS)){
  assert.equal(steps.length,4);assert.equal(new Set(steps.map(s=>s.id)).size,4);
  assert.deepEqual(new Set(steps.flatMap(s=>s.targets)),new Set(stageById(id).targets));
  for(const s of steps){assert.ok(s.title&&s.words.length>=6);assert.ok(new Set(s.targets.map(t=>ITEMS[t].family)).size>=3);}
 }
 assert.equal(stageById('sentence_meaning').targets.length,80);
 assert.deepEqual(STAGES.slice(33,35).map(s=>s.targets.length),[105,102]);
 for(const id of ['reading_animals','reading_everyday'])assert.ok(stepsFor(id)[3].targets.every(t=>t.startsWith('daily_')));
});

test('reachable Etappen complete in finite rounds and continue forward through all three levels',()=>{
 let p=L.freshProgress();
 for(const id of Object.keys(READING_PATHS)){
  const visited=[];
  for(let n=0;n<8;n++){
   p=L.startSession(p,id,rng,NOW);const before=p.pending;visited.push(before.etappeId);
   assert.ok(before.total>=8&&before.total<=12);p=finish(p);
   assert.deepEqual(L.validateProgress(JSON.parse(JSON.stringify(p))),p);
   if(n%2===0)assert.equal(stepStats(p,stepsFor(id)[n>>1]).completed,false);
  }
  assert.deepEqual(visited,stepsFor(id).flatMap(s=>[s.id,s.id]));
  assert.equal(p.stages[id].passed,true);assert.ok(stepsFor(id).every(s=>stepStats(p,s).completed));
 }
 assert.equal(p.continuation,'story_order');assert.equal(p.sessions,24);
});

test('same-level Etappe jumps, wrong answers and solved tasks resume exactly without double reward',()=>{
 let p=L.startSession(L.freshProgress(),'reading_animals',rng,NOW),first=p.pending.etappeId;
 p=L.answer(p,p.pending.round.choices.find(c=>c!==p.pending.round.target),NOW).progress;
 const saved=structuredClone(p.pending);
 p=L.startSession(p,'reading_animals',rng,NOW,'s34-people');const second=structuredClone(p.pending);
 assert.deepEqual(p.paused[L.sessionKey(saved)],saved);
 p=L.validateProgress(JSON.parse(JSON.stringify(p)));
 p=L.startSession(p,'reading_animals',rng,NOW,first);assert.deepEqual(p.pending,saved);
 p=L.startSession(p,'reading_everyday',rng,NOW);p=L.startSession(p,'reading_animals',rng,NOW,'s34-people');assert.deepEqual(p.pending,second);
 p=L.answer(p,p.pending.round.target,NOW).progress;const seeds=p.seeds,solved=structuredClone(p.pending);
 p=L.startSession(p,'letters',rng,NOW);p=L.validateProgress(p);assert.ok(L.availableThrough(p)>=33);p=L.startSession(p,'reading_animals',rng,NOW,'s34-people');
 assert.deepEqual(p.pending,solved);assert.equal(L.answer(p,p.pending.round.target,NOW).progress.seeds,seeds);
});

test('v12 completion awards survive; new vocabulary is an extension without invented word evidence',()=>{
 const p=L.freshProgress();delete p.readingPath;p.curriculumVersion=12;p.continuation='complete';p.sessions=80;p.seeds=900;
 for(const id of Object.keys(READING_PATHS))p.stages[id]={passed:true,completed:5,best:1};
 const q=L.validateProgress(p);assert.equal(q.sessions,80);assert.equal(q.seeds,900);assert.deepEqual(q.stages,p.stages);
 assert.equal(q.continuation,'reading_animals');assert.equal(currentStep(q,'reading_animals').id,'s34-people');
 assert.equal(currentStep(q,'reading_everyday').id,'s35-daily');assert.deepEqual(q.readingPath.words,{});assert.deepEqual(q.readingPath.patterns,{});
 assert.ok(stepsFor('sentence_meaning').every(s=>stepStats(q,s).completed));
 let r=q;for(let n=0;n<2;n++)r=finish(L.startSession(r,'reading_animals',rng,NOW));
 assert.equal(r.continuation,'reading_everyday');assert.equal(currentStep(r,'reading_everyday').id,'s35-daily');
});

test('exact legacy eighteen-question round and paused question are not relabelled as a new Etappe',()=>{
 let p=L.startSession(L.freshProgress(),'reading_everyday',rng,NOW);delete p.pending.etappeId;delete p.pending.etappeVersion;
 p.pending.total=18;p.pending.round.tries=1;p.pending.round.misses=1;p.curriculumVersion=12;delete p.readingPath;
 const saved=structuredClone(p.pending);p=L.validateProgress(p);assert.deepEqual(p.pending,saved);
 p=L.startSession(p,'letters',rng,NOW);p=L.validateProgress(p);p=L.startSession(p,'reading_everyday',rng,NOW);assert.deepEqual(p.pending,saved);
 p=finish(p);p=L.startSession(p,'reading_everyday',rng,NOW);assert.equal(p.pending.etappeId,'s35-book');
});

test('old active and paused reviews return into the added reading extension instead of an obsolete course end',()=>{
 let p=L.freshProgress();p.curriculumVersion=12;delete p.readingPath;
 for(const id of Object.keys(READING_PATHS))p.stages[id]={passed:true,completed:5,best:1};
 p=single(p,'picture_known','hut');p.pending.returnTo='complete';p.continuation='complete';
 const original=structuredClone(p.pending);let q=L.validateProgress(p);
 assert.equal(q.pending.returnTo,'reading_animals');assert.equal(q.pending.total,original.total);assert.deepEqual(q.pending.round,original.round);
 q=finish(q);assert.equal(q.continuation,'reading_animals');
 const paused=L.startSession(p,'letters',rng,NOW);paused.continuation='complete';q=L.validateProgress(paused);
 assert.equal(q.paused.picture_known.returnTo,'reading_animals');assert.deepEqual(q.paused.picture_known.round,original.round);
});

test('due earlier targets are interleaved without crediting or moving the current Etappe backwards',()=>{
 let p=L.freshProgress();for(let n=0;n<2;n++)p=finish(L.startSession(p,'sentence_meaning',rng,NOW));
 assert.equal(currentStep(p,'sentence_meaning').id,'s33-animals');
 p=L.startSession(p,'sentence_meaning',rng,NOW+DAY);const active=stepsFor('sentence_meaning')[1],seen=[];
 while(p.pending){const i=p.pending.index,t=p.pending.round.target;seen.push({i,t});p=L.answer(p,t,NOW+DAY).progress;p=L.advance(p,rng,NOW+DAY).progress;}
 const review=seen.filter(v=>!active.targets.includes(v.t));assert.equal(review.length,3);assert.deepEqual(review.map(v=>v.i),[3,7,11]);
 assert.equal(currentStep(p,'sentence_meaning').id,active.id);assert.ok(p.readingPath.steps[active.id].seen.every(t=>active.targets.includes(t)));
 assert.equal(p.continuation,'sentence_meaning');
});

test('sentence exposure and pattern success never pretend individual word recognition; later word retrieval is separate',()=>{
 let p=single(L.freshProgress(),'reading_everyday','daily_35_kind_liest_buch');
 assert.equal(p.pending.round.target,'daily_35_kind_liest_buch');p=finish(p);
 assert.ok(p.readingPath.words.buch.encounters>0);assert.equal(p.readingPath.words.buch.recognised,0);
 assert.equal(p.readingPath.patterns.action.first,1);
 p=single(p,'picture_known','hut');p=L.answer(p,'hut',NOW).progress;
 assert.equal(p.readingPath.words.hut.recognised,1);assert.equal(p.readingPath.words.hut.later,false);p=finish(p);
 // Make only this real, already-practised word due again.
 p.spacing.reviews['meaning:hut'].due=NOW+DAY;
 p=L.startReview(p,'picture_known',rng,NOW+DAY);p=finish(p,NOW+DAY);
 assert.equal(p.readingPath.words.hut.recognised,2);assert.equal(p.readingPath.words.hut.later,true);assert.deepEqual(L.validateProgress(p),p);
 assert.deepEqual(patternKeys(ITEMS.daily_34_kind_not_wach),['action','negation']);
 assert.deepEqual(patternKeys(ITEMS.daily_35_food_pair_oben_unten),['pair','coordination']);
});

test('all added texts have silent, non-equivalent image foils; reading and holding the same book are contrasted',()=>{
 for(const stage of STAGES.slice(33,35))for(const target of stage.targets.filter(t=>t.startsWith('daily_'))){
  let p=single(L.freshProgress(),stage.id,target),r=p.pending.round,item=ITEMS[target];
  assert.equal(r.target,target);assert.equal(r.choices.length,4);assert.equal(new Set(r.choices).size,4);
  assert.equal(r.choices.filter(c=>equivalentScene(item,ITEMS[c])).length,1,target);
  for(const c of r.choices)assert.ok(illustration(ITEMS[c].picture).startsWith('<svg'));
  for(const d of sceneDimensions(item)){
   const foil=t=>ITEMS[t].family===item.family&&ITEMS[t].scene[d]!==item.scene[d]&&sceneDimensions(item).filter(k=>k!==d).every(k=>ITEMS[t].scene[k]===item.scene[k]);
   if(stage.targets.some(foil))assert.ok(r.choices.some(foil),target+':'+d);
  }
 }
 const r=single(L.freshProgress(),'reading_everyday','daily_35_kind_liest_buch').pending.round;
 assert.ok(r.choices.includes('daily_35_kind_hat_buch'));
 const drinks=single(L.freshProgress(),'reading_everyday','daily_35_kind_trinkt_wasser').pending.round;
 assert.ok(drinks.choices.includes('daily_35_kind_hat_wasser'));assert.ok(drinks.choices.includes('daily_35_kind_trinkt_milch'));
});

test('apple-at-tree answers always use the dedicated attached-apple illustration, including distractors',()=>{
 const ids=Object.keys(SCENE_ITEMS).filter(t=>{const s=SCENE_ITEMS[t].scene;return s.subject==='apfel'&&s.location==='baum'&&s.relation==='am';});
 assert.ok(ids.length);assert.equal(SPRITES.scene_apfel_am_baum.sheet,'h');
 for(const id of ids){const markup=illustration(id);assert.equal((markup.match(/<image /g)??[]).length,1);assert.ok(markup.includes(SHEETS.h.src));}
});

test('new high-utility vocabulary is present in active tasks and the alphabetic inventory',()=>{
 const rows=wordInventory();assert.equal(rows.length,136);
 for(const word of ['Kind','Kinder','Frau','Mann','Brot','Wasser','Milch','und','nicht','liest','isst','trinkt'])assert.ok(rows.some(r=>r.word===word),word);
 assert.match(ITEMS.daily_34_frau_hat_wasser.text,/hat Wasser/);assert.match(ITEMS.daily_35_mama_hat_milch.shortText,/mit Milch/);
 assert.doesNotMatch(Object.values(SCENE_ITEMS).map(i=>i.text).join(' '),/ein Milch|einem Wasser/);
});

test('invalid Etappen, word evidence, review return paths and paused keys cannot enter backups',()=>{
 let p=L.startSession(L.freshProgress(),'reading_animals',rng,NOW);p=L.answer(p,p.pending.round.target,NOW).progress;
 for(const change of [v=>v.readingPath.cursors.reading_animals='missing',v=>v.readingPath.steps.bad={},v=>v.readingPath.words.hack={encounters:1,recognised:0,firstSuccessAt:null,lastSuccessAt:null,later:false},v=>v.pending.etappeVersion=999,v=>v.pending.returnStep='s35-book',v=>v.readingPath.patterns.fake={seen:1,first:1,recent:[1]}]){
  const bad=structuredClone(p);change(bad);assert.throws(()=>L.validateProgress(bad));
 }
 const q=L.startSession(p,'letters',rng,NOW),bad=structuredClone(q);bad.paused.reading_animals=bad.paused['reading_animals::s34-pets'];delete bad.paused['reading_animals::s34-pets'];assert.throws(()=>L.validateProgress(bad));
});
