import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {STAGES,ITEMS,stageById,stageNumber,skillKey,label,choiceFeedback} from '../app/data.mjs';
import {FORMS,formsFor,challengeTier} from '../app/word-choices.mjs';
import {SHEETS,SPRITES} from '../app/image-data.mjs';
import {hasPicture,illustration} from '../app/pictures.mjs';
import {PICTURE_IDS} from '../app/reading-data.mjs';
import {freshProgress,startSession,answer,advance,validateProgress,showHelp,resumePractice,recommended,mastered} from '../app/learning.mjs';
const rng=()=>.4,NOW=1_793_000_000_000;
const strong=()=>({introduced:true,seen:8,first:8,recent:[1,1,1,1],timeline:[]});
const solve=p=>answer(p,p.pending.round.target,NOW).progress;
const finish=p=>{while(p.pending){p=solve(p);p=advance(p,rng,NOW).progress;}return p;};

test('authored close forms preserve the initial, length and taught multi-letter units',()=>{
 const targets=[...new Set(STAGES.filter(s=>s.mode==='find').flatMap(s=>s.targets.filter(t=>ITEMS[t]?.kind==='word')))];
 for(const target of targets){const text=ITEMS[target].text,forms=formsFor(target);if(['see','tee'].includes(target)){assert.deepEqual(forms,[]);continue;}assert.equal(forms.length,3,target);
  for(const id of forms){const alt=FORMS[id].text;assert.equal(alt.length,text.length,id);assert.equal(alt[0],text[0]);assert.equal([...alt].filter((c,i)=>c!==text[i]).length,1,id);assert.ok(/^[a-z]+$/i.test(alt));for(const unit of ['sch','ei','au','ie','ee','oo','ll','tt','mm','ss','nn','ff'])if(text.toLowerCase().includes(unit))assert.ok(alt.toLowerCase().includes(unit),id+': '+unit);assert.equal(FORMS[id].target,target);assert.equal(ITEMS[id],undefined);}
 }
 assert.deepEqual(formsFor('sieben').map(id=>FORMS[id].text),['siegen','sieden','siefen']);
});
test('strong learners get same-initial close choices, with the real word as the only correct answer',()=>{
 for(const stage of STAGES.filter(s=>s.mode==='find'&&s.targets.every(t=>ITEMS[t]?.kind==='word'))){
  let p=freshProgress();for(const t of stage.targets)p.skills[skillKey(stage,t)]=strong();
  p=startSession(p,stage.id,rng,NOW);const r=p.pending.round;
  assert.equal(challengeTier(p,stage,r.target,ITEMS),2,stage.id);
  assert.ok(r.choices.length>=2);assert.equal(r.choices.filter(c=>label(stage,c)===ITEMS[r.target].text).length,1);
  assert.ok(r.choices.every(c=>label(stage,c)[0]===ITEMS[r.target].text[0]),stage.id);
  assert.deepEqual(validateProgress(JSON.parse(JSON.stringify(p))),p);
 }
});
test('global phoneme success alone does not force new word learners into close forms; errors ease the next word task',()=>{
 let p=freshProgress();for(const [i,t]of STAGES[0].targets.entries())p.skills['sound:'+t]={...strong(),timeline:[[i*2,1],[i*2+1,1]]};
 p=startSession(p,'long_words_listen',rng,NOW);assert.equal(challengeTier(p,stageById('long_words_listen'),p.pending.round.target,ITEMS),0);assert.ok(p.pending.round.choices.every(c=>!FORMS[c]));
 p=freshProgress();const stage=stageById('long_words_listen');for(const t of stage.targets)p.skills[skillKey(stage,t)]=strong();p=startSession(p,stage.id,rng,NOW);
 const wrong=p.pending.round.choices.find(c=>FORMS[c]);assert.ok(wrong);p=answer(p,wrong,NOW).progress;p=solve(p);p=advance(p,rng,NOW).progress;
 assert.equal(challengeTier(p,stage,p.pending.round.target,ITEMS),0);assert.ok(p.pending.round.choices.every(c=>!FORMS[c]));
});
test('invented forms are silent distractors, never target vocabulary, audio models or independent mastery',()=>{
 const stage=stageById('long_words_listen');let p=freshProgress();for(const t of stage.targets)p.skills[skillKey(stage,t)]=strong();p=startSession(p,stage.id,rng,NOW);
 const target=p.pending.round.target,wrong=p.pending.round.choices.find(c=>FORMS[c]),before=p.seeds;
 assert.deepEqual(choiceFeedback(stage,wrong).audio,[]);p=answer(p,wrong,NOW).progress;p=answer(p,wrong,NOW).progress;
 assert.equal(p.pending.round.help,'pending');p=showHelp(p);const guided=answer(p,target,NOW);assert.equal(guided.teaching,true);p=guided.progress;
 assert.equal(p.seeds,before);p=resumePractice(p);p=solve(p);assert.equal(p.seeds,before+1);assert.equal(p.skills[skillKey(stage,target)].recent.at(-1),0);
 assert.ok(Object.keys(p.skills).every(k=>!k.includes('form_')));assert.ok(Object.keys(p.spacing.reviews).every(k=>!k.includes('form_')));
 const bad=structuredClone(p);bad.pending.round.choices.push('form_ein_0');assert.throws(()=>validateProgress(bad));
});
test('picture mistakes are silent; isolated letters and real written word alternatives retain their own feedback',()=>{
 for(const stage of STAGES.filter(s=>s.mode==='picture'))for(const t of stage.targets)assert.deepEqual(choiceFeedback(stage,t).audio,[]);
 assert.deepEqual(choiceFeedback(stageById('more_endings'),'f').audio,['phoneme_f']);assert.deepEqual(choiceFeedback(stageById('read'),'omi').audio,['omi']);
});
test('early phrases and basic sentences always require reading subject AND relation, even before success',()=>{
 for(const id of ['phrase_place','first_sentences']){
  let p=startSession(freshProgress(),id,rng,NOW);while(p.pending){const r=p.pending.round,item=ITEMS[r.target];assert.ok(r.choices.length>=3);
   for(const dimension of ['subject','relation'])assert.ok(r.choices.filter(c=>ITEMS[c][dimension]===item[dimension]).length>=2,id+': '+dimension);
   p=solve(p);p=advance(p,rng,NOW).progress;
  }
 }
 assert.equal(stageNumber('sentence_words'),15);assert.equal(stageNumber('phrase_place'),17);assert.equal(stageNumber('first_sentences'),32);assert.equal(stageNumber('sentence_meaning'),33);
});
function oldProgress(){
 const p=freshProgress();p.curriculumVersion=7;p.continuation='complete';p.sessions=80;p.seeds=900;
 for(const stage of STAGES){if(stage.id==='phrase_place')continue;p.stages[stage.id]={completed:2,passed:true,best:1};
  const targets=stage.id==='first_sentences'?stage.legacyTargets:stage.id==='sentence_meaning'?stage.targets.filter(t=>ITEMS[t].relation==='im'):stage.targets;
  for(const t of targets)p.skills[skillKey(stage,t)]=strong();
 }
 return p;
}
test('v8 history keeps all practice rewards and legacy skills while new meaning contrasts require fresh evidence',()=>{
 const old=oldProgress(),p=validateProgress(old);assert.equal(p.curriculumVersion,10);assert.equal(p.sessions,80);assert.equal(p.seeds,900);
 assert.equal(p.continuation,'phrase_place');assert.equal(p.stages.first_sentences.completed,2);assert.equal(p.stages.first_sentences.passed,false);assert.equal(p.stages.sentence_meaning.passed,false);
 for(const [key,value]of Object.entries(old.skills))assert.deepEqual(p.skills[key],value,key);
 let next=p;for(let i=0;i<4&&!next.stages.phrase_place?.passed;i++)next=finish(startSession(next,'phrase_place',rng,NOW));assert.equal(recommended(next).id,'first_sentences');
 assert.equal(next.stages.long_words_read.passed,true);
});
test('an exact saved noun-only sentence remains resumable, then gives way to the new targets without erasing its goal',()=>{
 const old=oldProgress();old.continuation='first_sentences';old.pending={stageId:'first_sentences',index:4,total:18,first:2,independent:4,round:{target:'s_hut',choices:['s_hut','s_ball'],cue:'s_hut',demonstration:false,tries:1,position:0,solved:false,help:null,misses:1,assisted:false}};
 let p=validateProgress(old);assert.deepEqual(p.pending,old.pending);p=solve(p);p=advance(p,rng,NOW).progress;
 assert.equal(p.pending.total,18);assert.equal(p.pending.index,5);assert.ok(stageById('first_sentences').targets.includes(p.pending.round.target));assert.ok(!p.pending.round.target.startsWith('s_'));
 assert.equal(p.stages.first_sentences.passed,false);
});
test('image assets have pinned hashes; all words/scenes resolve and seven is a numeral without counted objects',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('../app/images/manifest.json',import.meta.url)));
 for(const f of manifest.files){const bytes=fs.readFileSync(new URL('../app/'+f.src,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256);assert.equal(f.aiGenerated,true);}
 for(const id of PICTURE_IDS){assert.ok(hasPicture(id),id);assert.ok(illustration(id).startsWith('<svg'));}
 assert.match(illustration('sieben'),/>7<\/text>/);assert.equal((illustration('sieben').match(/<image /g)??[]).length,0);
 for(const [id,spec]of Object.entries(SPRITES)){const s=SHEETS[spec.sheet];assert.ok(spec.rect[0]>=0&&spec.rect[1]>=0&&spec.rect[0]+spec.rect[2]<=s.width+.01&&spec.rect[1]+spec.rect[3]<=s.height+.01,id);}
 const one=illustration('sofa').match(/<svg x="[^"]+" y="[^"]+" width="([^"]+)" height="([^"]+)" viewBox="([^"]+)"/);assert.ok(one);
 const rect=one[3].split(' ').map(Number);assert.ok(Math.abs(Number(one[1])/Number(one[2])-rect[2]/rect[3])<1e-10,'No sprite pixels may leak into letterboxed margins');
});
test('the replacement ending instruction uses concrete whole-word examples without a bare E/I letter-name instruction',()=>{
 const instructions=JSON.parse(fs.readFileSync(new URL('../scripts/reading-instructions.json',import.meta.url)));
 assert.match(instructions.soft_words,/Tomate und Banane/);assert.doesNotMatch(instructions.soft_words,/\b[eEiI]\b/);
});
