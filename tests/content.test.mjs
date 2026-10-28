import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {STAGES,ITEMS,CONTEXTS,BUILD_UNITS,choiceFeedback} from '../app/data.mjs';
import {hasPicture,illustration} from '../app/pictures.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../app/audio/manifest.json',import.meta.url)));const clips=new Map(manifest.clips.map(c=>[c.id,c]));
test('word cues remain human; full sentence help is pre-generated speech and consonant cues never use TTS',()=>{for(const stage of STAGES){assert.equal(clips.get(stage.instruction)?.kind,'tts',stage.id);for(const target of stage.targets){const cues=CONTEXTS[stage.mode]?.[target]??[ITEMS[target]?.audio];for(const cue of cues){assert.equal(clips.get(cue)?.kind,['sentence','phrase'].includes(ITEMS[target]?.kind)?'tts':'human',stage.id+':'+cue);assert.ok(fs.existsSync(new URL('../app/'+clips.get(cue).src,import.meta.url)));}}}for(const item of Object.values(ITEMS).filter(i=>i.kind!=='numeral'))assert.equal(clips.get(item.audio)?.kind,['sentence','phrase'].includes(item.kind)?'tts':'human',item.audio);});
test('active audio hashes, human attribution and nonverbal feedback provenance are intact',()=>{for(const c of manifest.clips){const bytes=fs.readFileSync(new URL('../app/'+c.src,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),c.sha256,c.id);assert.ok(c.artist&&c.source&&c.licenseUrl);if(c.kind==='human')assert.ok(c.sourceSha256&&c.sourceAudio);}assert.equal(clips.get('success').kind,'effect');for(const id of ['correct','retry','done','garden','placed'])assert.equal(clips.has(id),false);});

test('every clicked phoneme resolves to one isolated clip without word-context or TTS fallback',()=>{
 for(const stage of STAGES){const choices=stage.mode==='build'?BUILD_UNITS:[...stage.targets,...stage.distractors??[]];for(const choice of choices){const feedback=choiceFeedback(stage,choice);if(stage.mode==='picture'){assert.deepEqual(feedback.audio,[]);continue;}for(const id of feedback.audio)assert.ok(clips.has(id),stage.id+':'+choice+':'+id);assert.equal(feedback.audio.length,1);assert.ok((stage.group==='sentence'?['tts']:['human','phoneme']).includes(clips.get(feedback.audio[0]).kind));if(CONTEXTS[stage.mode]||stage.mode==='build')assert.ok(feedback.audio[0].startsWith('phoneme_')||['a','m','i','o','u','e'].includes(feedback.audio[0]));}}
 for(const c of manifest.clips.filter(c=>c.kind==='tts')){assert.equal(c.generation.model,'de_DE-thorsten-high');assert.equal(c.generation.lengthScale,1.5);assert.equal(c.generation.sentencePauseSeconds,.3);}
});

test('isolated phonics clips retain pinned source segments and attribution',()=>{
 const sounds=manifest.clips.filter(c=>c.kind==='phoneme');assert.equal(sounds.length,11);
 for(const c of sounds){assert.equal(c.group,'phoneme');assert.ok(c.sourceSha256&&c.sourceAudio&&c.segmentSeconds);assert.equal(c.license,'CC BY-SA 4.0');assert.ok(c.segmentSeconds[1]<=.95);assert.ok(!c.sourceAudio.includes('/words/'));}
});
