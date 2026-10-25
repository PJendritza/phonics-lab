import test from 'node:test';import assert from 'node:assert/strict';
import {freshProgress,freshStore,createProfile,activeProfile,validateProgress,validateStore,migrateLegacy,readStored,saveStored,startSession,answer,advance,mastered,stageMastered,recommended,difficulty,levelProgress,availableThrough,showHelp,resumePractice} from '../app/learning.mjs';import {STAGES,skillKey,lettersFor,CONTEXTS,levelGoal,choiceFeedback} from '../app/data.mjs';
const rng=()=>0.4;
function solve(p,wrong=false){const s=STAGES.find(s=>s.id===p.pending.stageId),r=p.pending.round;if(wrong){const incorrect=r.choices.find(c=>c!==(s.mode==='build'?lettersFor(r.target)[r.position].toLowerCase():r.target));if(incorrect)p=answer(p,incorrect).progress;}if(s.mode==='build'){while(!p.pending.round.solved){const r=p.pending.round;p=answer(p,lettersFor(r.target)[r.position].toLowerCase()).progress;}}else p=answer(p,r.target).progress;return p;}
test('guided start, introductory answers and repeated taps do not create mastery',()=>{const original=freshProgress();let p=startSession(original,'letters',rng);const target=p.pending.round.target;assert.equal(p.pending.round.choices.length,1);p=solve(p);assert.equal(p.skills['sound:'+target].introduced,true);assert.equal(p.skills['sound:'+target].seen,0);assert.equal(p.seeds,1);const second=answer(p,target);assert.strictEqual(second.progress,p);assert.equal(second.progress.seeds,1);assert.equal(mastered(p.skills['sound:'+target]),false);assert.deepEqual(original,freshProgress());});
test('strong independent responses increase choices and automatically unlock the next stage',()=>{let p=startSession(freshProgress(),'letters',rng);let completed;for(let n=0;n<14;n++){p=solve(p);const a=advance(p,rng);p=a.progress;if(a.completed){completed=a;break;}}assert.equal(completed.passed,true);assert.equal(p.stages.letters.passed,true);assert.equal(recommended(p).id,'vowels');assert.equal(difficulty(p),4);assert.equal(p.sessions,1);assert.equal(p.seeds,levelGoal(STAGES[0]));assert.equal(validateProgress(p).seeds,levelGoal(STAGES[0]));});
test('mistakes are preserved, do not remove seeds, and make the next selection easier',()=>{let p=freshProgress();for(const s of STAGES.slice(0,2))for(const t of s.targets)p.skills[skillKey(s,t)]={introduced:true,seen:2,first:2,recent:[1,1],timeline:[]};p=startSession(p,'vowels',rng);p=solve(p,true);assert.equal(p.seeds,1);assert.equal(p.skills[skillKey(STAGES[1],p.pending.round.target)].recent.at(-1),0);p=advance(p,rng).progress;p=solve(p,true);p=advance(p,rng).progress;p=solve(p,true);assert.equal(difficulty(p),2);assert.equal(p.seeds,3);assert.equal(mastered({recent:[1,1,0,1]}),false);});
test('profile stores and a pending wrong answer round-trip without changing choices or counters',()=>{let store=freshStore();store.profiles.push(createProfile('Zwei','🐼'));const one=store.profiles[0];one.progress=startSession(one.progress,'letters',rng);one.progress=solve(one.progress);one.progress=advance(one.progress,rng).progress;const restored=validateStore(JSON.parse(JSON.stringify(store)));assert.deepEqual(restored,store);restored.profiles[1].progress.seeds=8;assert.equal(restored.profiles[0].progress.seeds,1);assert.equal(activeProfile(store).id,one.id);});
test('partial word and solved word resume without duplicated rewards',()=>{let p=startSession(freshProgress(),'build',rng);const word=lettersFor(p.pending.round.target);p=answer(p,word[0].toLowerCase()).progress;const round=structuredClone(p.pending.round);p=validateProgress(JSON.parse(JSON.stringify(p)));assert.deepEqual(p.pending.round,round);p=solve(p);assert.equal(p.seeds,1);assert.equal(answer(p,word.at(-1).toLowerCase()).progress.seeds,1);assert.equal(validateProgress(p).pending.round.solved,true);});
test('v2 progress migrates without granting mastery from one-choice history',()=>{const v2={version:2,skills:{a:{attempts:5,correct:4,firstTry:3},'word:am':{attempts:2,correct:2,firstTry:1}},completed:{letters:2,words:1},sessions:3};const store=migrateLegacy(v2),p=activeProfile(store).progress;assert.equal(p.skills['sound:a'].seen,5);assert.equal(p.skills['build:am'].first,1);assert.equal(p.stages.letters.completed,2);assert.equal(p.stages.letters.passed,false);assert.equal(p.sessions,3);assert.equal(mastered(p.skills['sound:a']),false);assert.equal(validateStore(store).profiles.length,1);});
test('invalid imports reject unsafe profile shape, impossible audio/choices and inconsistent counts',()=>{for(const mutate of [s=>s.activeId='missing',s=>s.profiles.push(s.profiles[0]),s=>s.profiles[0].avatar='unknown',s=>s.profiles[0].progress.skills={'unit:unknown':{}},s=>s.profiles[0].progress.sessions=-1,s=>s.profiles[0].progress.pending.round.cue='../outside',s=>s.profiles[0].progress.pending.round.choices=[],s=>s.profiles[0].progress.pending.round.solved=true,s=>s.profiles[0].progress.pending.round.choices=['zzz']]){const s=freshStore();s.profiles[0].progress=startSession(s.profiles[0].progress,'letters',rng);mutate(s);assert.throws(()=>validateStore(s));}});
test('broken or unavailable storage permits play; migration leaves the old key intact',()=>{assert.equal(readStored(undefined).warning!==null,true);assert.equal(readStored({getItem:()=>'{broken'}).store.profiles.length,1);assert.equal(saveStored({setItem:()=>{throw Error('quota');}},freshStore()),false);const old={version:2,skills:{},completed:{},sessions:0};const reads=[];const result=readStored({getItem:k=>{reads.push(k);return k.includes('calm')?JSON.stringify(old):null;}});assert.equal(result.store.version,3);assert.equal(reads.length,2);});
test('all stages can advance through independent learning without dropping previous flowers',()=>{let p=freshProgress();for(const stage of STAGES){for(let tries=0;tries<8&&!p.stages[stage.id]?.passed;tries++){p=startSession(p,stage.id,rng);for(let round=0;round<levelGoal(stage);round++){p=solve(p);const result=advance(p,rng);p=result.progress;if(result.completed)break;}}assert.equal(p.stages[stage.id].passed,true,stage.id);assert.equal(stageMastered(p,stage),true);assert.deepEqual(validateProgress(p),p);}assert.equal(Object.values(p.stages).filter(s=>s.passed).length,STAGES.length);assert.equal(recommended(p),null);assert.equal(p.continuation,'complete');});

test('word building uses one lowercase choice per sound even in capitalized nouns',()=>{let p=freshProgress();p.skills['build:am']={introduced:true,seen:2,first:2,recent:[1,1],timeline:[]};p.skills['build:im']=p.skills['build:am'];p.skills['build:um']=p.skills['build:am'];p=startSession(p,'build',rng);assert.equal(p.pending.round.target,'oma');assert.ok(p.pending.round.choices.includes('o'));assert.equal(p.pending.round.choices.includes('O'),false);p=answer(p,'o').progress;assert.equal(p.pending.round.position,1);assert.deepEqual(validateProgress(p),p);});

test('level progress accumulates every correct step, never errors, and reaches the exact goal',()=>{let p=startSession(freshProgress(),'build',rng);assert.equal(levelProgress(p).value,0);p=answer(p,'a').progress;assert.equal(levelProgress(p).value,.5);const value=levelProgress(p).value;p=answer(p,'a').progress;assert.equal(levelProgress(p).value,value);p=answer(p,'m').progress;assert.equal(levelProgress(p).value,1);p=advance(p,rng).progress;assert.equal(levelProgress(p).value,1);});
test('a secure stage gets a short fixed goal; saved longer goals still fill completely',()=>{
 let p=freshProgress();for(const t of STAGES[0].targets)p.skills['sound:'+t]={introduced:true,seen:5,first:5,recent:[1,1,1,1],timeline:[]};
 p=startSession(p,'letters',rng);assert.equal(p.pending.total,3);
 // Existing long rounds keep their original goal, even with already-secure items.
 p.pending.total=14;p=validateProgress(p);
 for(let n=0;n<13;n++){p=solve(p);const a=advance(p,rng);assert.equal(a.completed,false);p=a.progress;}
 p=solve(p);assert.equal(levelProgress(p).ratio,1);const done=advance(p,rng);assert.equal(done.completed,true);assert.equal(done.goal,14);assert.equal(done.progress.sessions,1);
});
test('expanded consonants use valid natural first/last contexts and preserve legacy 9-question rounds',()=>{for(const id of ['onsets','stops','more_endings']){let p=startSession(freshProgress(),id,rng);const stage=STAGES.find(s=>s.id===id);assert.ok(CONTEXTS[stage.mode][p.pending.round.target].includes(p.pending.round.cue));assert.equal(p.pending.total,levelGoal(stage));assert.deepEqual(validateProgress(p),p);}const p=startSession(freshProgress(),'letters');p.pending.total=9;assert.equal(validateProgress(p).pending.total,9);});
test('sch and ll remain grapheme blocks rather than invented separate consonant sounds',()=>{assert.deepEqual(lettersFor('fisch'),['F','i','sch']);assert.deepEqual(lettersFor('ball'),['B','a','ll']);let p=startSession(freshProgress(),'more_build',rng);assert.equal(p.pending.round.target,'fisch');assert.ok(p.pending.round.choices.includes('sch'));assert.equal(p.pending.round.choices.includes('c'),false);p=solve(p);assert.equal(p.pending.round.position,3);assert.deepEqual(validateProgress(p),p);});


test('successful higher-level preview continues forward despite incomplete earlier stages',()=>{
 let p=startSession(freshProgress(),'more_read',rng);
 while(p.pending){p=solve(p);p=advance(p,rng).progress;}
 assert.equal(p.stages.more_read.passed,true);assert.equal(p.stages.letters,undefined);
 assert.equal(recommended(p).id,'more_build');assert.equal(validateProgress(p).continuation,'more_build');
 p=startSession(p,recommended(p).id,rng);
 while(p.pending){p=solve(p);p=advance(p,rng).progress;}
 assert.equal(recommended(p).id,'sentence_words');assert.equal(p.continuation,'sentence_words');
 assert.equal(availableThrough(p),14);
});
test('jumping between levels preserves partial, wrong and solved questions independently',()=>{
 let p=startSession(freshProgress(),'more_build',rng);p=answer(p,'f').progress;
 const round=structuredClone(p.pending);p=startSession(p,'letters',rng);p=solve(p);
 const solved=structuredClone(p.pending),seeds=p.seeds;
 p=startSession(p,'more_build',rng);assert.deepEqual(p.pending,round);assert.deepEqual(p.paused.letters,solved);
 p=validateProgress(JSON.parse(JSON.stringify(p)));p=startSession(p,'letters',rng);
 assert.deepEqual(p.pending,solved);assert.equal(answer(p,p.pending.round.target).progress.seeds,seeds);
 p=advance(p,rng).progress;assert.equal(p.seeds,seeds);assert.equal(p.pending.index,1);
 assert.ok(availableThrough(p)>=13);
});
test('existing v3 saves infer their highest continuation and keep unfinished goal totals',()=>{
 let p=startSession(freshProgress(),'stops',rng);p.pending.total=12;delete p.continuation;delete p.paused;
 p=validateProgress(p);assert.equal(p.continuation,'stops');assert.equal(p.pending.total,12);
 p.pending=null;p.stages.stops={completed:1,passed:true,best:1};delete p.continuation;
 p=validateProgress(p);assert.equal(recommended(p).id,'more_endings');
 p.continuation='bogus';assert.throws(()=>validateProgress(p));
});
test('malformed paused levels and out-of-range goals are rejected without touching original data',()=>{
 const p=startSession(freshProgress(),'letters',rng);
 for(const mutate of [v=>v.pending.total=19,v=>v.paused={letters:v.pending},v=>v.paused={stops:v.pending},v=>v.paused={stops:null}]){
  const bad=structuredClone(p);mutate(bad);assert.throws(()=>validateProgress(bad));
 }
 assert.equal(p.pending.total,levelGoal(STAGES[0]));assert.deepEqual(p.paused,{});
});
test('wrong-option feedback plays only the selected phoneme, never another word or instruction',()=>{
 assert.deepEqual(choiceFeedback(STAGES[0],'i').audio,['i']);
 assert.deepEqual(choiceFeedback(STAGES[8],'sch').audio,['phoneme_sch']);
 assert.deepEqual(choiceFeedback(STAGES[10],'s').audio,['phoneme_s']);
 assert.deepEqual(choiceFeedback(STAGES[13],'n').audio,['phoneme_n']);
 assert.deepEqual(choiceFeedback(STAGES[13],'ll').audio,['phoneme_l']);
});


test('later levels immediately offer independent choices, with no copied word model',()=>{
 for(const s of STAGES.slice(1)){const p=startSession(freshProgress(),s.id,rng);assert.equal(p.pending.round.demonstration,false,s.id);assert.ok(p.pending.round.choices.length>=2,s.id);}
 const first=startSession(freshProgress(),'letters',rng);assert.equal(first.pending.round.demonstration,true);assert.equal(first.pending.round.choices.length,1);
});
test('two mistakes trigger teaching; the obvious guided tap earns no progress or first-try mastery',()=>{
 let p=startSession(freshProgress(),'onsets',rng);const r=p.pending.round,wrong=r.choices.find(c=>c!==r.target),choices=[...r.choices];
 p=answer(p,wrong).progress;assert.equal(p.pending.round.help,null);
 p=answer(p,wrong).progress;assert.equal(p.pending.round.help,'pending');assert.equal(levelProgress(p).value,0);
 assert.strictEqual(answer(p,r.target).progress,p);p=showHelp(p);assert.equal(p.pending.round.help,'show');
 assert.strictEqual(answer(p,wrong).progress,p);const tap=answer(p,r.target);p=tap.progress;
 assert.equal(tap.teaching,true);assert.equal(p.seeds,0);assert.equal(p.skills['start:'+r.target],undefined);assert.equal(p.pending.round.help,'ack');
 assert.deepEqual(validateProgress(p),p);assert.strictEqual(answer(p,r.target).progress,p);
 p=resumePractice(p);assert.deepEqual(p.pending.round.choices,choices);assert.equal(p.pending.round.help,null);assert.equal(p.pending.round.tries,2);
 p=answer(p,r.target).progress;assert.equal(p.seeds,1);assert.equal(p.skills['start:'+r.target].first,0);assert.equal(p.skills['start:'+r.target].recent.at(-1),0);
});
test('partial-word help is local to the current block and its state survives pause/restore',()=>{
 let p=startSession(freshProgress(),'more_build',rng);p=answer(p,'f').progress;assert.equal(p.pending.round.position,1);
 p=answer(p,'sch').progress;p=answer(p,'sch').progress;assert.equal(p.pending.round.help,'pending');
 p=validateProgress(JSON.parse(JSON.stringify(p)));p=showHelp(p);p=answer(p,'i').progress;assert.equal(p.pending.round.position,1);assert.equal(levelProgress(p).value,1/3);
 p=validateProgress(p);p=resumePractice(p);p=answer(p,'i').progress;assert.equal(p.pending.round.position,2);assert.equal(p.pending.round.misses,0);
 p=answer(p,'f').progress;assert.equal(p.pending.round.help,null);p=answer(p,'f').progress;assert.equal(p.pending.round.help,'pending');
});
test('untouched old later introductions become choice questions while attempted work is preserved',()=>{
 let p=startSession(freshProgress(),'endings',rng);p.pending.round.demonstration=true;p.pending.round.choices=[p.pending.round.target];delete p.pending.round.help;delete p.pending.round.misses;
 const migrated=validateProgress(p);assert.equal(migrated.pending.round.demonstration,false);assert.equal(migrated.pending.round.choices.length,2);assert.equal(migrated.pending.round.target,p.pending.round.target);
 const oldErrors=structuredClone(p);oldErrors.pending.round.demonstration=false;oldErrors.pending.round.choices=[oldErrors.pending.round.target,'n'];oldErrors.pending.round.tries=2;assert.equal(validateProgress(oldErrors).pending.round.help,'pending');
 p.pending.round.tries=1;p.pending.round.solved=true;const oldSolved=validateProgress(p);assert.equal(oldSolved.pending.round.demonstration,true);assert.equal(oldSolved.pending.round.choices.length,1);
 for(const mutate of [v=>v.pending.round.help='bogus',v=>{v.pending.round.help='show';v.pending.round.misses=0;},v=>v.pending.round.misses=-1]){const invalid=startSession(freshProgress(),'onsets',rng);mutate(invalid);assert.throws(()=>validateProgress(invalid));}
});
