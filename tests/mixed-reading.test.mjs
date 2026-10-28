import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {ITEMS,STAGES,stageById,skillKey} from '../app/data.mjs';
import {SCENE_ITEMS,NOUNS,sceneDimensions,equivalentScene} from '../app/mixed-reading.mjs';
import {freshProgress,startSession,startReview,answer,advance,validateProgress,stageMastered} from '../app/learning.mjs';
import {illustration} from '../app/pictures.mjs';
const rng=()=>.4,NOW=1793200000000;
const secure=()=>({introduced:true,seen:5,first:5,recent:[1,1,1,1],timeline:[[1,1],[2,1],[3,1],[4,1]]});
function finish(p,fn=()=>{}){while(p.pending){fn(p.pending.round);p=answer(p,p.pending.round.target,NOW).progress;p=advance(p,rng,NOW).progress;}return p;}
function single(id,strong=false){let p=freshProgress();p.stages.sentence_meaning={completed:1,passed:false,best:0};if(strong){for(const t of stageById('sentence_meaning').targets.filter(t=>ITEMS[t].family===ITEMS[id].family)){p.skills['sentence:'+t]=secure();if(t!==id)p.spacing.reviews['sentence:'+t]={streak:2,days:1,due:NOW+86400000,lastAt:NOW,last:0,after:3};}}else p.skills['sentence:'+id]={introduced:true,seen:1,first:0,recent:[0],timeline:[[1,0]]};return startReview(p,'sentence_meaning',rng,NOW);}
test('active mixed bank has six distinct meaning families and correct mouse/article agreement',()=>{
 assert.equal(Object.keys(SCENE_ITEMS).length,80);assert.equal(new Set(Object.values(SCENE_ITEMS).map(i=>i.family)).size,6);
 for(const item of Object.values(SCENE_ITEMS)){
  assert.ok(illustration(item.picture).startsWith('<svg'));assert.doesNotMatch(item.text,/\bEin Maus\b/);
  if(item.family==='place')assert.ok(item.text.startsWith((NOUNS[item.subject].article==='eine'?'Eine ':'Ein ')+NOUNS[item.subject].text));
 }
 assert.equal(ITEMS.maus_im_haus.text,'Eine Maus ist im Haus.');assert.equal(ITEMS.count_maus_2.shortText,'Zwei Mäuse');
});
test('seven uses a numeral; quantities contain exactly the stated number of objects',()=>{
 assert.match(illustration('sieben'),/>7<\/text>/);assert.equal((illustration('sieben').match(/<image /g)||[]).length,0);
 for(const t of Object.keys(SCENE_ITEMS).filter(t=>ITEMS[t].family==='quantity'))assert.equal((illustration(t).match(/<image /g)||[]).length,ITEMS[t].scene.count);
 let p=freshProgress();p.skills['meaning:sieben']={introduced:true,seen:1,first:0,recent:[0],timeline:[[1,0]]};p.stages.ie_read={completed:1,passed:false,best:0};p=startReview(p,'ie_read',rng,NOW);
 assert.ok(p.pending.round.choices.includes('digit_6'));assert.ok(p.pending.round.choices.includes('digit_8'));assert.equal(p.pending.round.target,'sieben');assert.deepEqual(validateProgress(p),p);
});
test('migrated secure-im/unseen-am profiles get both relations and all six families in a normal mixed round',()=>{
 for(const id of ['phrase_place','first_sentences','sentence_meaning']){
  let p=freshProgress();p.curriculumVersion=9;const stage=stageById(id);for(const t of stage.targets)if(ITEMS[t].scene?.relation==='im')p.skills[skillKey(stage,t)]=secure();
  p=validateProgress(p);p=startSession(p,id,rng,NOW);const scenes=[];finish(p,r=>scenes.push(ITEMS[r.target].scene));
  assert.ok(scenes.some(s=>s.relation==='im'),id);assert.ok(scenes.some(s=>s.relation==='am'),id);
  if(stage.mixed)assert.equal(new Set(scenes.map(s=>s.family)).size,6);
 }
});
test('shorter text is used for uncertain readers; confident families receive full sentences and mistakes ease again',()=>{
 const target='maus_im_haus';let p=single(target);assert.equal(p.pending.round.cue,ITEMS[target].shortAudio);
 p=single(target,true);assert.equal(p.pending.round.cue,ITEMS[target].audio);
 const stage=stageById('sentence_meaning');p=startSession(freshProgress(),stage.id,rng,NOW);p=finish(p);
 const recent=Object.keys(p.skills).find(k=>ITEMS[k.slice(9)]?.family==='place');assert.ok(recent);
 const q=single(target);assert.deepEqual(validateProgress(q).pending,q.pending);
});
test('large word pools repeat an actual error after two intervening questions rather than exhausting unseen words',()=>{
 let p=startSession(freshProgress(),'long_words_listen',rng,NOW),failed=p.pending.round.target;
 p=answer(p,p.pending.round.choices.find(c=>c!==failed),NOW).progress;p=answer(p,failed,NOW).progress;p=advance(p,rng,NOW).progress;
 const next=[];for(let i=0;i<3;i++){next.push(p.pending.round.target);p=answer(p,p.pending.round.target,NOW).progress;p=advance(p,rng,NOW).progress;}
 assert.notEqual(next[0],failed);assert.notEqual(next[1],failed);assert.equal(next[2],failed);
});
test('each curated mixed target has semantically different answers in its own family, including independent one-axis contrasts',()=>{
 for(const target of stageById('sentence_meaning').targets){
  let p=freshProgress();p.stages.sentence_meaning={completed:1,passed:false,best:0};p.skills['sentence:'+target]={introduced:true,seen:1,first:0,recent:[0],timeline:[[1,0]]};p=startReview(p,'sentence_meaning',rng,NOW);
  const r=p.pending.round,item=ITEMS[target];assert.equal(r.target,target);assert.equal(r.choices.length,4);
  assert.ok(r.choices.every(c=>ITEMS[c].family===item.family));assert.ok(r.choices.filter(c=>equivalentScene(ITEMS[c],item)).length===1);
  const pool=stageById('sentence_meaning').targets.filter(t=>ITEMS[t].family===item.family),dims=sceneDimensions(item);
  for(const d of dims){const oneAxis=t=>ITEMS[t].scene[d]!==item.scene[d]&&dims.filter(k=>k!==d).every(k=>ITEMS[t].scene[k]===item.scene[k]);if(pool.some(oneAxis))assert.ok(r.choices.some(oneAxis),target+':'+d);}
 }
});
test('v9 exact pending long sentence, goal, failures and rewards survive while newly expanded pass flags are reassessed',()=>{
 let p=startSession(freshProgress(),'sentence_meaning',rng,NOW);p.curriculumVersion=9;p.sessions=20;p.seeds=200;p.stages.sentence_meaning={completed:3,passed:true,best:1};
 p.pending={stageId:'sentence_meaning',index:14,total:18,first:10,independent:14,round:{target:'maus_im_haus',choices:['maus_im_haus','maus_am_haus','ball_im_haus','maus_im_bus'],cue:'maus_im_haus',demonstration:false,tries:1,position:0,solved:false,help:null,misses:1,assisted:false}};
 const exact=structuredClone(p.pending),q=validateProgress(p);assert.deepEqual(q.pending,exact);assert.equal(q.sessions,20);assert.equal(q.seeds,200);assert.equal(q.stages.sentence_meaning.passed,false);
});
test('round coverage survives reload and cannot be imported as unknown content or future turns',()=>{
 let p=startSession(freshProgress(),'sentence_meaning',rng,NOW);p=advance(answer(p,p.pending.round.target,NOW).progress,rng,NOW).progress;
 assert.deepEqual(validateProgress(p),p);assert.equal(p.pending.completedTargets.length,1);
 for(const list of [['missing'],['ball_im_bus','hut_im_bus']]){const bad=structuredClone(p);bad.pending.completedTargets=list;assert.throws(()=>validateProgress(bad));}
});
test('full and short utterances have matching generated audio labels, approved settings and preserved human clips',()=>{
 const manifest=JSON.parse(fs.readFileSync('app/audio/manifest.json')),clips=new Map(manifest.clips.map(c=>[c.id,c]));
 for(const item of Object.values(SCENE_ITEMS))for(const [id,text]of [[item.audio,item.text],...(item.shortAudio?[[item.shortAudio,item.shortText]]:[])]){const c=clips.get(id);assert.equal(c.label,text);assert.equal(c.generation.lengthScale,1.5);assert.equal(c.generation.sentencePauseSeconds,.3);}
 assert.ok(stageById('long_words_listen').targets.length>=9);
});
