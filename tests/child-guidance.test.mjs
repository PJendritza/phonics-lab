import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {STAGES,ITEMS,stageById,choiceFeedback}from'../app/data.mjs';import{TASK_GUIDES}from'../app/task-guides.mjs';
import{freshProgress,startSession,answer,advance,validateProgress,readingAudioAvailable,useReadingHelp,showHelp,resumePractice}from'../app/learning.mjs';
import{SCENE_ITEMS,equivalentScene,sceneDimensions}from'../app/mixed-reading.mjs';import{illustration}from'../app/pictures.mjs';
const rng=()=>.4,solve=p=>answer(p,p.pending.round.target).progress;
test('two new mixed levels append to the 33 existing IDs with distinct new words and six task families',()=>{
 assert.equal(STAGES.length,35);assert.equal(STAGES[32].id,'sentence_meaning');assert.deepEqual(STAGES.slice(-2).map(s=>s.targets.length),[80,76]);
 assert.equal(ITEMS.mix34_katze_im_bus.text,'Eine Katze ist im Bus.');assert.equal(ITEMS.mix35_buch_auf_tisch.text,'Ein Buch ist auf dem Tisch.');assert.equal(ITEMS.mix35_has_mama_schuh.text,'Mama hat einen Schuh.');assert.equal(ITEMS.mix35_state_tasche_offen.text,'Die Tasche ist offen.');
 for(const stage of STAGES.slice(-3)){assert.equal(new Set(stage.targets.map(t=>ITEMS[t].family)).size,6);assert.equal(new Set(stage.targets.map(t=>ITEMS[t].pack)).size,1);for(const t of stage.targets)assert.ok(illustration(t).startsWith('<svg'));}
});
test('new ordinary rounds really mix families and im/am; profile progression and exact resume are preserved',()=>{
 for(const stage of STAGES.slice(-2)){let p=startSession(freshProgress(),stage.id,rng),scenes=[];while(p.pending){scenes.push(ITEMS[p.pending.round.target].scene);assert.deepEqual(validateProgress(JSON.parse(JSON.stringify(p))),p);p=advance(solve(p),rng).progress;}assert.equal(scenes.length,18);assert.equal(new Set(scenes.map(s=>s.family)).size,6);assert.ok(scenes.some(s=>s.relation==='im'));assert.ok(scenes.some(s=>s.relation==='am'));}
 const old=freshProgress();old.curriculumVersion=10;old.continuation='complete';old.sessions=40;old.seeds=600;old.stages.sentence_meaning={passed:true,completed:4,best:1};const p=validateProgress(old);assert.equal(p.continuation,'reading_animals');assert.equal(p.sessions,40);assert.equal(p.seeds,600);assert.deepEqual(p.stages,old.stages);
});
test('every new target has genuine one-axis meaning alternatives and no equivalent distractor',()=>{
 for(const stage of STAGES.slice(-2))for(const t of stage.targets){const item=ITEMS[t],pool=stage.targets.map(t=>ITEMS[t]).filter(i=>i.family===item.family);for(const dimension of sceneDimensions(item)){const d=pool.filter(i=>i.scene[dimension]!==item.scene[dimension]&&sceneDimensions(item).filter(k=>k!==dimension).every(k=>i.scene[k]===item.scene[k]));if(d.length)assert.ok(d.every(i=>!equivalentScene(item,i)));}assert.equal(pool.filter(i=>equivalentScene(item,i)).length,1);}
});
test('reading speech is locked until two actual wrong attempts, persists through reload and resets for the next task',()=>{
 let p=startSession(freshProgress(),'reading_animals',rng);const r=p.pending.round,wrong=r.choices.find(c=>c!==r.target);assert.equal(readingAudioAvailable(p),false);assert.strictEqual(useReadingHelp(p,true),p);
 p=answer(p,wrong).progress;assert.equal(readingAudioAvailable(p),false);assert.strictEqual(useReadingHelp(p,true),p);
 p=answer(p,wrong).progress;assert.equal(readingAudioAvailable(p),true);p=showHelp(p);p=useReadingHelp(p,true);assert.equal(p.pending.round.assisted,true);assert.equal(p.seeds,0);p=validateProgress(JSON.parse(JSON.stringify(p)));assert.equal(readingAudioAvailable(p),true);p=answer(p,r.target).progress;p=resumePractice(p);assert.equal(readingAudioAvailable(p),true);p=solve(p);assert.equal(p.skills['sentence:'+r.target].first,0);p=advance(p,rng).progress;assert.equal(readingAudioAvailable(p),false);assert.equal(p.pending.round.assisted,false);
});
test('past optional help is retained as assistance but does not unlock speech on a zero-error imported task',()=>{
 let p=startSession(freshProgress(),'sentence_meaning',rng);p.pending.round.assisted=true;p.curriculumVersion=10;const pending=structuredClone(p.pending);p=validateProgress(p);assert.deepEqual(p.pending,pending);assert.equal(readingAudioAvailable(p),false);
});
test('all 23 task directions are a short child action, match the generated speech text, and avoid phonetics jargon',()=>{
 const guides={...JSON.parse(fs.readFileSync('scripts/instructions.json')),...JSON.parse(fs.readFileSync('scripts/reading-instructions.json'))};assert.deepEqual(TASK_GUIDES,guides);const m=new Map(JSON.parse(fs.readFileSync('app/audio/manifest.json')).clips.map(c=>[c.id,c]));
 for(const s of STAGES){const text=TASK_GUIDES[s.instruction];assert.ok(text.split(' ').length<=11,s.id);assert.doesNotMatch(text,/Konsonant|Vokal|Silbe|langes|kurz|Lautsprecher hilft/i);assert.equal(m.get(s.instruction).label,text);}
});
test('unapproved consonants stay silent rather than using a foreign phone, a letter name or another word',()=>{
 for(const id of ['onsets','stops','more_endings','more_build'])for(const c of ['f','n','l','sch','b','d','g','h','t','k','s','ll'])assert.deepEqual(choiceFeedback(stageById(id),c).audio,[]);
 assert.deepEqual(choiceFeedback(stageById('letters'),'a').audio,['a']);assert.deepEqual(choiceFeedback(stageById('read'),'oma').audio,['oma']);
});
