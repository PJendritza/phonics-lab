export const STORAGE_KEY = 'kalulu-de:calm:v2';
export function freshProgress() { return {version:2, skills:{}, completed:{}, sessions:0}; }
export function validateProgress(value) {
  if (!value || value.version!==2 || !value.skills || typeof value.skills!=='object' || Array.isArray(value.skills) || !value.completed || typeof value.completed!=='object' || Array.isArray(value.completed)) throw new Error('Unbekanntes Fortschrittsformat.');
  const output=freshProgress();
  const integer=n=>Number.isSafeInteger(n)&&n>=0&&n<=1_000_000;
  if (!integer(value.sessions)) throw new Error('Ungültige Anzahl Übungen.');
  output.sessions=value.sessions;
  if(Object.keys(value.skills).length>64 || Object.keys(value.completed).length>20)throw new Error('Zu viele Fortschrittsdaten.');
  for(const [key,s]of Object.entries(value.skills)){
    if(!/^[a-z:]+$/.test(key)||!s||!['attempts','correct','firstTry'].every(k=>integer(s[k]))||s.correct>s.attempts||s.firstTry>s.correct)throw new Error('Ungültige Lautdaten.');
    output.skills[key]={attempts:s.attempts,correct:s.correct,firstTry:s.firstTry};
  }
  for(const [key,count]of Object.entries(value.completed)){
    if(!['letters','syllables','words'].includes(key)||!integer(count))throw new Error('Ungültige Übungsdaten.');
    output.completed[key]=count;
  }
  return output;
}
export function recordAnswer(progress,key,correct,firstTry=true){
  const next=structuredClone(progress),s=next.skills[key]??{attempts:0,correct:0,firstTry:0};
  s.attempts++; if(correct){s.correct++;if(firstTry)s.firstTry++;}next.skills[key]=s;return next;
}
export function finishLesson(progress,id){const next=structuredClone(progress);next.completed[id]=(next.completed[id]??0)+1;next.sessions++;return next;}
export function choosePractice(pool,progress,previous=null){
  // The priority uses mistakes and exposure, never response speed or a timer.
  return [...pool].sort((a,b)=>{
    const score=k=>{const s=progress.skills[k];return !s?-3:(s.firstTry+1)/(s.attempts+2)+(k===previous ? 0.15 : 0);};
    return score(a)-score(b);
  })[0];
}
export function makePlan(lesson,progress){
  if(lesson.kind==='build')return lesson.words.map(word=>({word}));
  if(!progress.completed[lesson.id])return lesson.rounds.map(([target,choices])=>({target,choices:[...choices]}));
  const result=[];let previous=null;const shadow=structuredClone(progress);
  for(let i=0;i<6;i++){const target=choosePractice(lesson.pool,shadow,previous);result.push({target,choices:[...lesson.pool]});shadow.skills[target]??={attempts:0,correct:0,firstTry:0};shadow.skills[target].attempts++;shadow.skills[target].firstTry+=1;shadow.skills[target].correct+=1;previous=target;}
  return result;
}
export function shuffled(items,rng=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function readStored(storage){
  try{const raw=storage.getItem(STORAGE_KEY);return {progress:raw?validateProgress(JSON.parse(raw)):freshProgress(),warning:null};}
  catch{return {progress:freshProgress(),warning:'Der gespeicherte Lernstand konnte nicht geladen werden. Du kannst trotzdem üben.'};}
}
export function saveStored(storage,progress){try{storage.setItem(STORAGE_KEY,JSON.stringify(progress));return true;}catch{return false;}}
