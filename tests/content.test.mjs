import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {STAGES,ITEMS,CONTEXTS,BUILD_UNITS,PHONEMES,choiceFeedback} from '../app/data.mjs';
import {hasPicture,illustration} from '../app/pictures.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../app/audio/manifest.json',import.meta.url)));const clips=new Map(manifest.clips.map(c=>[c.id,c]));
test('word cues remain human; full sentence help is pre-generated speech and consonant cues never use TTS',()=>{for(const stage of STAGES){assert.equal(clips.get(stage.instruction)?.kind,'tts',stage.id);for(const target of stage.targets){const cues=CONTEXTS[stage.mode]?.[target]??[ITEMS[target]?.audio];for(const cue of cues){assert.equal(clips.get(cue)?.kind,['sentence','phrase','story'].includes(ITEMS[target]?.kind)?'tts':'human',stage.id+':'+cue);assert.ok(fs.existsSync(new URL('../app/'+clips.get(cue).src,import.meta.url)));}}}for(const item of Object.values(ITEMS).filter(i=>i.kind!=='numeral'))assert.equal(clips.get(item.audio)?.kind,['sentence','phrase','story'].includes(item.kind)?'tts':'human',item.audio);});
test('active audio hashes, human attribution and nonverbal feedback provenance are intact',()=>{for(const c of manifest.clips){const bytes=fs.readFileSync(new URL('../app/'+c.src,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),c.sha256,c.id);assert.ok(c.artist&&c.source&&c.licenseUrl);if(c.kind==='human')assert.ok(c.sourceSha256&&c.sourceAudio);}assert.equal(clips.get('success').kind,'effect');for(const id of ['correct','retry','done','garden','placed'])assert.equal(clips.has(id),false);});

test('only approved German isolated sounds play; unapproved consonants never fall back to words or TTS',()=>{
 for(const stage of STAGES){const choices=stage.mode==='build'?BUILD_UNITS:[...stage.targets,...stage.distractors??[]];for(const choice of choices){const feedback=choiceFeedback(stage,choice);if(['picture','order'].includes(stage.mode)){assert.deepEqual(feedback.audio,[]);continue;}if((CONTEXTS[stage.mode]||stage.mode==='build')&&!PHONEMES[choice]){assert.deepEqual(feedback.audio,[]);continue;}for(const id of feedback.audio)assert.ok(clips.has(id),stage.id+':'+choice+':'+id);assert.equal(feedback.audio.length,1);assert.ok((stage.group==='sentence'?['tts']:['human','phoneme']).includes(clips.get(feedback.audio[0]).kind));if(CONTEXTS[stage.mode]||stage.mode==='build')assert.ok(feedback.audio[0].startsWith('phoneme_')||['a','m','i','o','u','e'].includes(feedback.audio[0]));}}
 for(const c of manifest.clips.filter(c=>c.kind==='tts')){assert.equal(c.generation.model,'de_DE-thorsten-high');assert.equal(c.generation.lengthScale,1.5);assert.equal(c.generation.sentencePauseSeconds,.3);}
});

test('all foreign Kalulu clips are excluded from the active app and archive provenance is retained',()=>{
 assert.equal(manifest.clips.filter(c=>c.kind==='phoneme').length,0);
 for(const c of manifest.clips){assert.ok(!c.source.includes('Kalulu-Languages'));assert.ok(!c.src.includes('phoneme_'));}
 for(const c of Object.values(PHONEMES)){assert.equal(clips.get(c).kind,'human');assert.ok(clips.get(c).source.includes('De-'));}
 const archived=JSON.parse(fs.readFileSync('docs/archive/rejected-kalulu-phonemes.json'));assert.equal(archived.length,11);for(const c of archived){assert.ok(c.sourceSha256&&c.licenseUrl);assert.equal(fs.existsSync('app/'+c.src),false);}
});
