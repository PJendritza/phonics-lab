// Finite presentation units over stable tasks. Completion rewards practice;
// contextual exposure never becomes an independently recognised word.
import {SCENE_ITEMS, NOUNS} from './mixed-reading.mjs?v=45f8c9e435d7';
import {STORIES} from './stories.mjs?v=45f8c9e435d7';

const bank = pack => Object.keys(SCENE_ITEMS).filter(t => SCENE_ITEMS[t].pack === pack);
const subjects = (pack, names) => bank(pack).filter(t => {
  const s = SCENE_ITEMS[t].scene;
  return names.includes(s.subject) || s.family === 'pair';
});
const original = pack => bank(pack).filter(t => !t.startsWith('daily_'));
const step = (id, title, targets, words, full = false) => ({id, version:1, title, targets, words, full});

export const READING_PATHS = {
  sentence_meaning: [
    step('s33-things', 'Ball und Hut', subjects(33, ['ball','hut']), ['Ball','Hut','im','am','auf','unter','zwei','drei']),
    step('s33-animals', 'Maus und Schaf', subjects(33, ['maus','schaf']), ['Maus','Schaf','im','am','mit','hat','zwei','drei']),
    step('s33-actions', 'Wach und müde', bank(33).filter(t => SCENE_ITEMS[t].family === 'action' || ['maus','schaf'].includes(SCENE_ITEMS[t].scene.subject)), ['Maus','Schaf','Hase','Affe','sitzt','steht','schläft']),
    step('s33-mix', 'Alles zusammen lesen', bank(33), ['Ball','Hut','Maus','Schaf','oben','unten','auf','unter'], true),
  ],
  reading_animals: [
    step('s34-pets', 'Katze und Hund', subjects(34, ['katze','hund']).filter(t => !t.startsWith('daily_')), ['Katze','Hund','im','am','auf','unter','zwei','drei']),
    step('s34-pond', 'Ente und Frosch', subjects(34, ['ente','frosch']).filter(t => !t.startsWith('daily_')), ['Ente','Frosch','im','am','sitzt','steht','schläft']),
    step('s34-mix', 'Tiere und ihre Dinge', original(34), ['Katze','Hund','Ente','Frosch','Buch','Ballon','hat','mit'], true),
    step('s34-people', 'Menschen im Alltag', bank(34).filter(t => t.startsWith('daily_')), ['Kind','Kinder','Frau','Mann','Brot','Wasser','nicht'], true),
  ],
  reading_everyday: [
    step('s35-book', 'Buch und Apfel', subjects(35, ['buch','apfel']).filter(t => !t.startsWith('daily_')), ['Buch','Apfel','im','am','auf','unter','zwei','drei']),
    step('s35-things', 'Schuh und Puppe', subjects(35, ['schuh','puppe']).filter(t => !t.startsWith('daily_')), ['Schuh','Puppe','groß','klein','im','am','zwei','drei']),
    step('s35-mix', 'Sachen und Familie', original(35), ['Mama','Oma','Buch','Schuh','Tasche','offen','zu'], true),
    step('s35-daily', 'Essen, trinken und lesen', bank(35).filter(t => t.startsWith('daily_')), ['Kind','Brot','Wasser','Milch','liest','isst','trinkt','und','nicht'], true),
  ],
};
export const stepsFor = stage => READING_PATHS[typeof stage === 'string' ? stage : stage.id] ?? [];
export const stepById = id => Object.values(READING_PATHS).flat().find(s => s.id === id);
export const tokens = text => [...new Set((text.match(/\p{L}+/gu) ?? []).map(w => w.toLocaleLowerCase('de')))];
export const freshReadingPath = () => ({version:1, cursors:{}, steps:{}, words:{}, patterns:{}});
const freshStep = () => ({version:1, completed:false, legacy:false, rounds:0, seen:[], first:[], recent:[], words:[]});
export const allStepsComplete = (p, stage) => stepsFor(stage).every(s => p.readingPath?.steps[s.id]?.completed);
export function currentStep(p, stage) {
  const steps = stepsFor(stage), cursor = p.readingPath?.cursors[typeof stage === 'string' ? stage : stage.id];
  return steps.find(s => s.id === cursor) ?? steps.find(s => !p.readingPath?.steps[s.id]?.completed) ?? steps.at(-1);
}
export function stepStats(p, step) {
  const s = p.readingPath?.steps[step.id] ?? freshStep();
  const words = step.words.filter(w => s.words.includes(w.toLocaleLowerCase('de')));
  const accuracy = s.recent.length ? s.recent.reduce((a,b) => a+b, 0) / s.recent.length : null;
  return {...s, wordsSeen:words.length, wordsTotal:step.words.length, accuracy};
}
export function patternKeys(item, text = item.text) {
  if(item.kind==='story')return ['story:sequence'];
  const s = item.scene;
  if (!s) return [];
  const main = s.family === 'place' ? `place:${s.relation}` : s.family === 'quantity' ? `quantity:${s.count}` : s.family;
  return [main, ...(tokens(text).includes('nicht') ? ['negation'] : []), ...(tokens(text).includes('und') ? ['coordination'] : [])];
}
const addUnique = (array, values) => [...new Set([...array, ...values])];
export function recordReadingEvidence(p, stage, round, item, first, now) {
  if (!['word','sentence','phrase','story'].includes(item?.kind)) return;
  const path = p.readingPath ??= freshReadingPath();
  const text = round.cue === item.shortAudio ? item.shortText : item.text;
  for (const word of tokens(text)) {
    const w = path.words[word] ??= {encounters:0, recognised:0, firstSuccessAt:null, lastSuccessAt:null, later:false};
    w.encounters++;
    if (stage.mode === 'picture' && item.kind === 'word' && first) {
      w.recognised++;
      if (w.firstSuccessAt === null) w.firstSuccessAt = now;
      w.lastSuccessAt = Math.max(w.lastSuccessAt ?? 0, now);
      w.later ||= now - w.firstSuccessAt >= 86_400_000;
    }
  }
  if (!['picture','order'].includes(stage.mode)) return;
  for (const key of patternKeys(item, text)) {
    const evidence = path.patterns[key] ??= {seen:0, first:0, recent:[]};
    evidence.seen++; evidence.first += Number(first);
    evidence.recent = [...evidence.recent, Number(first)].slice(-12);
  }
  const step = stepById(p.pending.etappeId);
  if (!step || !step.targets.includes(round.target) || p.pending.returnTo !== undefined) return;
  const s = path.steps[step.id] ??= freshStep();
  s.seen = addUnique(s.seen, [round.target]);
  if (first) s.first = addUnique(s.first, [round.target]);
  s.recent = [...s.recent, Number(first)].slice(-12);
  s.words = addUnique(s.words, tokens(text));
}
export function finishStep(p, stage, id) {
  const step = stepById(id), path = p.readingPath, s = path.steps[id] ??= freshStep();
  s.rounds++;
  const families = new Set(s.first.map(t => SCENE_ITEMS[t].family));
  const familyGoal = Math.min(3, new Set(step.targets.map(t => SCENE_ITEMS[t].family)).size);
  const enough = s.rounds >= 2 && s.seen.length >= Math.min(12, step.targets.length)
    && s.first.length >= Math.min(8, step.targets.length) && families.size >= familyGoal
    && s.recent.length >= 8 && s.recent.reduce((a,b) => a+b, 0) / s.recent.length >= .8;
  const firstCompletion = enough && !s.completed;
  s.completed ||= enough;
  const steps = stepsFor(stage), index = steps.findIndex(v => v.id === id);
  const next = s.completed ? steps.slice(index+1).find(v => !path.steps[v.id]?.completed) : step;
  if (next) path.cursors[stage.id] = next.id;
  return {completed:s.completed, firstCompletion, next:next?.id ?? null};
}
// Every fourth question may retrieve due content from a completed earlier Etappe.
// It is still part of this level; it never changes the forward continuation.
export function embeddedReview(p, stage, step, index, now) {
  if (index % 4 !== 3) return [];
  const earlier = stepsFor(stage).slice(0, stepsFor(stage).indexOf(step));
  return [...new Set(earlier.filter(s => p.readingPath?.steps[s.id]?.completed).flatMap(s => s.targets))]
    .filter(t => !step.targets.includes(t) && p.skills[`${stage.group}:${t}`]?.seen
      && p.spacing?.reviews[`${stage.group}:${t}`]?.due <= now);
}
export function migrateReadingPath(p) {
  p.readingPath ??= freshReadingPath();
  // Preserve earlier awards, but do not pretend old completion proves knowledge
  // of the added people/food vocabulary. No fabricated word/pattern evidence.
  for (const [stageId, steps] of Object.entries(READING_PATHS)) {
    if (!p.stages[stageId]?.passed) continue;
    const oldSteps = stageId === 'sentence_meaning' ? steps : steps.slice(0,3);
    for (const step of oldSteps) p.readingPath.steps[step.id] ??= {...freshStep(), completed:true, legacy:true};
    const next = steps.find(s => !p.readingPath.steps[s.id]?.completed);
    p.readingPath.cursors[stageId] ??= (next ?? steps.at(-1)).id;
  }
  const next = Object.keys(READING_PATHS).find(id => p.stages[id]?.passed && !allStepsComplete(p,id));
  if (next) {
    if (p.continuation === 'complete') p.continuation = next;
    for (const session of [p.pending,...Object.values(p.paused??{})]) {
      if (session?.returnTo === 'complete') session.returnTo = next;
    }
  }
}

export function validateReadingPath(value, allowedWords) {
  if (value === undefined) return freshReadingPath();
  const plain = v => v && typeof v === 'object' && !Array.isArray(v);
  const integer = (v,max=1e7) => Number.isSafeInteger(v) && v >= 0 && v <= max;
  const fail = () => {throw Error('Ungültige Leseetappen oder Wortnachweise.');};
  if (!plain(value) || value.version !== 1 || !['cursors','steps','words','patterns'].every(k => plain(value[k]))) fail();
  const out = freshReadingPath(), allowedPatterns = new Set(Object.values({...SCENE_ITEMS,...STORIES}).flatMap(i => patternKeys(i)));
  for (const [id,cursor] of Object.entries(value.cursors)) {
    if (!stepsFor(id).some(s => s.id === cursor)) fail();
    out.cursors[id] = cursor;
  }
  for (const [id,s] of Object.entries(value.steps)) {
    const step = stepById(id);
    if (!step || !plain(s) || s.version !== step.version || typeof s.completed !== 'boolean'
      || typeof s.legacy !== 'boolean' || !integer(s.rounds)) fail();
    const allowed = new Set(step.targets.flatMap(t => tokens(SCENE_ITEMS[t].text+' '+(SCENE_ITEMS[t].shortText ?? ''))));
    for (const key of ['seen','first','words']) {
      if (!Array.isArray(s[key]) || new Set(s[key]).size !== s[key].length || s[key].some(t => !(key === 'words' ? allowed.has(t) : step.targets.includes(t)))) fail();
    }
    if (s.first.some(t => !s.seen.includes(t)) || !Array.isArray(s.recent) || s.recent.length > 12 || s.recent.some(v => v !== 0 && v !== 1)) fail();
    out.steps[id] = {version:1, completed:s.completed, legacy:s.legacy, rounds:s.rounds, seen:[...s.seen], first:[...s.first], recent:[...s.recent], words:[...s.words]};
  }
  for (const [word,w] of Object.entries(value.words)) {
    if (!allowedWords.has(word) || !plain(w) || !integer(w.encounters) || !integer(w.recognised,w.encounters)
      || typeof w.later !== 'boolean' || (w.recognised === 0 ? w.firstSuccessAt !== null || w.lastSuccessAt !== null || w.later
        : !integer(w.firstSuccessAt,8.64e15) || !integer(w.lastSuccessAt,8.64e15) || w.lastSuccessAt < w.firstSuccessAt || (w.later && w.lastSuccessAt-w.firstSuccessAt < 86_400_000))) fail();
    out.words[word] = {encounters:w.encounters, recognised:w.recognised, firstSuccessAt:w.firstSuccessAt, lastSuccessAt:w.lastSuccessAt, later:w.later};
  }
  for (const [key,s] of Object.entries(value.patterns)) {
    if (!allowedPatterns.has(key) || !plain(s) || !integer(s.seen) || !integer(s.first,s.seen)
      || !Array.isArray(s.recent) || s.recent.length > Math.min(12,s.seen) || s.recent.some(v => v !== 0 && v !== 1)) fail();
    out.patterns[key] = {seen:s.seen, first:s.first, recent:[...s.recent]};
  }
  return out;
}
