import test from 'node:test';
import assert from 'node:assert/strict';
import {lettersFor,stageById,skillKey} from '../app/data.mjs';
import {stepById} from '../app/reading-path.mjs';
import {
  advance,answer,exerciseReplay,freshExercises,freshProgress,levelProgress,
  navigateExercise,startSession,validateProgress,
} from '../app/learning.mjs';

const rng = () => .4;
const now = 1_790_000_000_000;
const restore = progress => validateProgress(JSON.parse(JSON.stringify(progress)));

test('skipped partially built words and replay state survive backup without duplicate credit', () => {
  let progress = startSession(freshProgress(),'build',rng,now);
  const letters = lettersFor(progress.pending.round.target);
  progress = answer(progress,letters[0].toLowerCase(),now).progress;
  const partial = progress.pending.round;
  const earned = levelProgress(progress);
  progress = navigateExercise(progress,1,rng,now);
  assert.deepEqual(levelProgress(progress),earned);
  progress = restore(progress);
  progress = navigateExercise(progress,-1,rng,now);
  assert.deepEqual(progress.pending.round,partial);
  for(const letter of letters.slice(1))progress = answer(progress,letter.toLowerCase(),now).progress;
  progress = advance(progress,rng,now).progress;
  progress = navigateExercise(progress,-1,rng,now);
  assert.ok(exerciseReplay(progress.pending));
  progress = answer(progress,letters[0].toLowerCase(),now).progress;
  progress = restore(progress);
  assert.ok(exerciseReplay(progress.pending));
  assert.equal(progress.pending.round.position,1);
  for(const letter of letters.slice(1))progress = answer(progress,letter.toLowerCase(),now).progress;
  assert.equal(progress.seeds,1);
  assert.equal(progress.pending.first,1);
  assert.equal(progress.pending.independent,1);
  assert.equal(levelProgress(progress).value,1);

  const bad = structuredClone(progress);
  bad.pending.exerciseHistory.rounds[1] = null;
  assert.throws(() => restore(bad),/Ungültige Aufgabe/);
});

test('a legacy mid-round save has an exact starting point for the new arrows', () => {
  let legacy = startSession(freshProgress(),'reading_everyday',rng,now);
  legacy.pending.index = 3;
  legacy.seeds = 3;
  const exact = legacy.pending.round;
  assert.equal(levelProgress(legacy).value,3);
  assert.strictEqual(navigateExercise(legacy,-1,rng,now),legacy);
  let progress = navigateExercise(restore(legacy),1,rng,now);
  assert.equal(levelProgress(progress).value,3);
  progress = restore(progress);
  progress = navigateExercise(progress,-1,rng,now);
  assert.deepEqual(progress.pending.round,exact);
  assert.equal(progress.pending.index,3);
});

test('fresh selection prioritises unseen prompts from the same Etappe', () => {
  const stage = stageById('reading_everyday');
  const progress = startSession(freshProgress(),stage.id,rng,now);
  const targets = stepById(progress.pending.etappeId).targets;
  const unseen = targets.findLast(target => target !== progress.pending.round.target);
  for(const target of targets){
    if(target===unseen)continue;
    progress.skills[skillKey(stage,target)] = {introduced:true,seen:2,first:2,recent:[1,1],timeline:[]};
  }
  const fresh = freshExercises(progress,rng,now);
  assert.equal(fresh.pending.round.target,unseen);
  assert.equal(fresh.pending.etappeId,progress.pending.etappeId);
  assert.deepEqual(fresh.skills,progress.skills);
  assert.deepEqual(restore(fresh),fresh);
});
