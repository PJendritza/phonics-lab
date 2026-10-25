import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,ITEMS,CONTEXTS} from '../app/data.mjs';
import {WORDS,READING_STAGES,SENTENCES,PHRASES} from '../app/reading-data.mjs';
import {hasPicture,illustration} from '../app/pictures.mjs';
import {freshProgress,startSession,answer,advance,validateProgress,recommended,useReadingHelp,showHelp,resumePractice,levelProgress} from '../app/learning.mjs';
const rng=()=>.4;

test('new word reading has separate mastery from hearing the same word',()=>{
 let p=freshProgress();
 p.skills['read:hut']={introduced:true,seen:10,first:10,recent:[1,1,1,1],timeline:[]};
 p=startSession(p,'picture_known',rng);
 assert.equal(p.pending.round.target,'hut');assert.equal(p.pending.round.demonstration,false);
 assert.equal(p.skills['meaning:hut'],undefined);
 p=answer(p,'hut').progress;assert.equal(p.skills['meaning:hut'].seen,1);
});
test('optional audio or syllable assistance persists and cannot earn independent first-try mastery',()=>{
 let p=startSession(freshProgress(),'long_words_read',rng);
 const target=p.pending.round.target,choices=[...p.pending.round.choices];
 p=useReadingHelp(p);assert.equal(p.pending.round.assisted,true);assert.equal(levelProgress(p).value,0);
 p=startSession(p,'letters',rng);p=validateProgress(JSON.parse(JSON.stringify(p)));
 p=startSession(p,'long_words_read',rng);assert.equal(p.pending.round.assisted,true);assert.deepEqual(p.pending.round.choices,choices);
 p=answer(p,target).progress;
 assert.equal(p.seeds,1);assert.equal(p.skills['meaning:'+target].first,0);assert.deepEqual(p.skills['meaning:'+target].recent,[0]);
 assert.strictEqual(useReadingHelp(p),p);
 p=advance(p,rng).progress;assert.equal(p.pending.round.assisted,false);
 assert.strictEqual(useReadingHelp(startSession(freshProgress(),'letters',rng)).pending.round.assisted,false);
});
test('sentence alternatives require subject, relation and location; every independent question has all three contrasts',()=>{
 let p=startSession(freshProgress(),'sentence_meaning',rng),completed;
 for(let session=0;session<4&&!p.stages.sentence_meaning?.passed;session++){
  while(p.pending){const r=p.pending.round,item=ITEMS[r.target],wrong=r.choices.filter(c=>c!==r.target),dims=['subject','relation','location'];
   assert.equal(r.choices.length,4);
   for(const d of dims)assert.ok(wrong.some(c=>ITEMS[c][d]!==item[d]&&dims.filter(x=>x!==d).every(x=>ITEMS[c][x]===item[x])),d);
   p=answer(p,r.target).progress;completed=advance(p,rng);p=completed.progress;
  }
  if(!p.stages.sentence_meaning.passed)p=startSession(p,'sentence_meaning',rng);
 }
 assert.equal(p.stages.sentence_meaning.passed,true);assert.equal(recommended(p),null);
});
test('two-error sentence teaching preserves the question, awards no extra progress and retains mistakes',()=>{
 let p=startSession(freshProgress(),'sentence_meaning',rng);const r=p.pending.round,wrong=r.choices.find(c=>c!==r.target);
 p=answer(p,wrong).progress;p=answer(p,wrong).progress;p=showHelp(p);
 const guided=answer(p,r.target);assert.equal(guided.teaching,true);p=guided.progress;
 assert.equal(p.seeds,0);assert.equal(levelProgress(p).value,0);
 p=validateProgress(p);p=resumePractice(p);p=answer(p,r.target).progress;
 assert.equal(p.skills['sentence:'+r.target].first,0);assert.equal(p.seeds,1);
});
test('completed v6 profiles continue at new Level 15 while unfinished work and all rewards survive',()=>{
 const old=freshProgress();delete old.curriculumVersion;old.continuation='complete';old.sessions=20;old.seeds=200;
 old.stages.more_build={completed:2,passed:true,best:1};
 const p=validateProgress(old);assert.equal(recommended(p).id,'sentence_words');assert.equal(p.sessions,20);assert.equal(p.seeds,200);
 assert.equal(p.stages.more_build.completed,2);assert.equal(p.curriculumVersion,9);
 const pending=startSession(old,'more_build',rng);delete pending.curriculumVersion;
 assert.deepEqual(validateProgress(pending).pending,pending.pending);
 const done=freshProgress();done.continuation='complete';assert.equal(validateProgress(done).continuation,'complete');
});
test('pictures and syllable spelling resolve; sentence vocabulary is limited to preceding lessons',()=>{
 assert.equal(STAGES.length,33);assert.ok(WORDS.length>=30);
 for(const stage of READING_STAGES){
  assert.ok(stage.targets.length<=16);
  for(const target of stage.targets){
   const item=ITEMS[target];assert.ok(item.audio&&item.text);
   if(item.syllables)assert.equal(item.syllables.join(''),item.text,target);
   if(stage.mode==='picture'){assert.ok(hasPicture(item.picture),target);assert.ok(illustration(item.picture).startsWith('<svg'));}
  }
  if(stage.mode==='picture'&&!['sentence','phrase'].includes(stage.group)){
   const earlier=STAGES.slice(0,STAGES.indexOf(stage));
   for(const target of stage.targets)assert.ok(earlier.some(s=>s.targets.includes(target)||Object.values(CONTEXTS[s.mode]??{}).flat().includes(target)),target+' introduced before independent reading');
  }
 }
 const taught=new Set(STAGES.slice(0,30).flatMap(s=>s.targets.map(t=>ITEMS[t]?.text.toLowerCase())));
 for(const sentence of Object.values({...SENTENCES,...PHRASES}))for(const word of sentence.text.toLowerCase().replace(/[.]/g,'').split(' '))assert.ok(taught.has(word),'Untaught sentence word '+word);
});
test('assistance import validation rejects corrupt flags without changing the saved profile',()=>{
 const p=startSession(freshProgress(),'picture_known',rng);
 for(const value of ['true',1,null]){const bad=structuredClone(p);bad.pending.round.assisted=value;assert.throws(()=>validateProgress(bad));}
 const old=structuredClone(p);delete old.pending.round.assisted;assert.equal(validateProgress(old).pending.round.assisted,false);
 const bad=structuredClone(p);bad.curriculumVersion=999;assert.throws(()=>validateProgress(bad));
 const basics=startSession(freshProgress(),'letters',rng);basics.pending.round.assisted=true;assert.throws(()=>validateProgress(basics));
});
