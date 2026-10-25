import {STAGES,ITEMS,CONTEXTS,BUILD_UNITS,AVATARS,CURRICULUM_VERSION,stageById,skillKey,lettersFor,levelGoal} from './data.mjs?v=f5464eac2222';
import {freshSpacing,selectTarget,recordPractice,practiceGoal,dueReviews,validateSpacing} from './spacing.mjs?v=f5464eac2222';
import {challengeTier,closeChoices,validForms} from './word-choices.mjs?v=f5464eac2222';
export const duePractice=(progress,now=Date.now())=>dueReviews(progress,STAGES,now);
export const STORAGE_KEY='kalulu-de:learners:v3',LEGACY_KEY='kalulu-de:calm:v2';
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const integer=(v,max=1e7)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const id=()=>globalThis.crypto?.randomUUID?.()??`child-${Date.now()}-${Math.floor(Math.random()*1e6)}`;
export function freshProgress(){return {version:3,curriculumVersion:CURRICULUM_VERSION,skills:{},stages:{},sessions:0,seeds:0,pending:null,paused:{},continuation:STAGES[0].id,spacing:freshSpacing()};}
export function createProfile(name='Mein Profil',avatar=AVATARS[0]){return {id:id(),name:name.trim().slice(0,24)||'Mein Profil',avatar,progress:freshProgress()};}
export function freshStore(){const p=createProfile();return {version:3,activeId:p.id,profiles:[p]};}
export const activeProfile=store=>store.profiles.find(p=>p.id===store.activeId);
export function shuffled(items,rng=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
const allowedSkills=new Set(STAGES.flatMap(s=>[...s.targets,...s.legacyTargets??[]].map(t=>skillKey(s,t))));
const targetPool=(stage,target)=>stage.legacyTargets?.includes(target)?stage.legacyTargets:stage.targets;
export function mastered(skill){return !!skill&&skill.recent.length>=2&&skill.recent.slice(-2).every(Boolean)&&skill.recent.slice(-4).filter(Boolean).length/Math.min(4,skill.recent.length)>=0.75;}
export const stageMastered=(progress,stage)=>stage.targets.every(t=>mastered(progress.skills[skillKey(stage,t)]));
function continuationFor(progress){
 if(progress.continuation!==undefined)return progress.continuation;
 if(progress.pending)return progress.pending.stageId;
 const latest=STAGES.findLast(s=>progress.stages[s.id]?.completed>0||progress.stages[s.id]?.passed);
 return latest?(progress.stages[latest.id].passed?STAGES[STAGES.indexOf(latest)+1]?.id??'complete':latest.id):STAGES[0].id;
}
export function recommended(progress){return stageById(continuationFor(progress))??null;}
export function availableThrough(progress){
 const continuation=continuationFor(progress);
 return continuation==='complete'?STAGES.length-1:Math.max(STAGES.findIndex(s=>s.id===continuation),STAGES.findIndex(s=>s.id===progress.pending?.stageId),...Object.keys(progress.paused??{}).map(id=>STAGES.findIndex(s=>s.id===id)),...STAGES.map((s,i)=>progress.stages[s.id]?.passed?Math.min(i+1,STAGES.length-1):0));
}
export function difficulty(progress){const recent=Object.values(progress.skills).flatMap(s=>s.timeline??[]).sort((a,b)=>a[0]-b[0]).slice(-5).map(x=>x[1]);if(recent.length>=3&&recent.slice(-3).filter(x=>!x).length>=2)return 2;return recent.length>=5&&recent.every(Boolean)?4:recent.length>=2&&recent.slice(-2).every(Boolean)?3:2;}
function makeRound(progress,stage,index=0,previous=null,rng=Math.random,now=Date.now(),forcedTarget=null){
 const target=forcedTarget??selectTarget(progress,stage,now),key=skillKey(stage,target),demonstration=stage.id==='letters'&&!progress.skills[key]?.introduced;
 let choices;
 if(stage.mode==='build'){
  const actual=[...new Set(lettersFor(target).map(c=>c.toLowerCase()))],others=(stage.id==='more_build'?BUILD_UNITS:['a','m','i','o','u','n','l']).filter(c=>!actual.includes(c));choices=shuffled([...actual,...shuffled(others,rng).slice(0,difficulty(progress)>=3?1:0)],rng);
 }else{
  const pool=[...new Set([...targetPool(stage,target),...(stage.distractors??[])])];
  let others=shuffled(pool.filter(t=>t!==target),rng);
  if(stage.contrast&&ITEMS[target].subject){
   const item=ITEMS[target],dimensions=['subject','relation','location'];
   const neighbours=dimensions.map(d=>others.find(t=>ITEMS[t][d]!==item[d]&&dimensions.filter(x=>x!==d).every(x=>ITEMS[t][x]===item[x]))).filter(Boolean);
   const offset=index%Math.max(1,neighbours.length),priority=[...neighbours.slice(offset),...neighbours.slice(0,offset)];
   others=[...priority,...others.filter(t=>!priority.includes(t))];
  }
  const tier=challengeTier(progress,stage,target,ITEMS),close=shuffled(closeChoices(stage,target,ITEMS),rng);
  if(tier===2)others=close;
  else if(tier===1&&close.length)others=[close[0],...others.filter(t=>t!==close[0])];
  choices=demonstration?[target]:shuffled([target,...others.slice(0,Math.max(difficulty(progress),stage.minChoices??2)-1)],rng);
 }
 const cue=CONTEXTS[stage.mode]?CONTEXTS[stage.mode][target][index%CONTEXTS[stage.mode][target].length]:ITEMS[target].audio;
 return {target,choices,cue,demonstration,tries:0,position:0,solved:false,help:null,misses:0,assisted:false};
}
export function startSession(progress,stageId,rng=Math.random,now=Date.now()){
 const next=structuredClone(progress),stage=stageById(stageId),cursor=continuationFor(progress);if(!stage)throw Error('Unbekanntes Level.');
 next.paused??={};next.continuation=stageId;
 if(next.pending?.stageId===stageId){if(next.pending.returnTo!==undefined){next.pending.returnTo=cursor;next.continuation=cursor;}return next;}
 if(next.pending)next.paused[next.pending.stageId]=next.pending;
 next.pending=next.paused[stageId]??{stageId,index:0,total:practiceGoal(next,stage,levelGoal(stage),now),first:0,independent:0,round:makeRound(next,stage,0,null,rng,now)};
 if(next.pending.returnTo!==undefined){next.pending.returnTo=cursor;next.continuation=cursor;}
 delete next.paused[stageId];return next;
}
export function startReview(progress,stageId=null,rng=Math.random,now=Date.now()){
 const due=duePractice(progress,now),selected=stageId?due.find(s=>s.stageId===stageId):due[0];
 if(!selected)return progress;
 const cursor=continuationFor(progress),saved=progress.pending?.stageId===selected.stageId?progress.pending:progress.paused?.[selected.stageId];
 const next=startSession(progress,selected.stageId,rng,now);
 if(!saved){
  const stage=stageById(selected.stageId),targets=shuffled(selected.targets,rng);
  next.pending={stageId:stage.id,index:0,total:targets.length,first:0,independent:0,reviewTargets:targets,returnTo:cursor,round:makeRound(next,stage,0,null,rng,now,targets[0])};
 }else next.pending.returnTo=cursor;
 next.continuation=cursor;return next;
}
export function answer(progress,choice,now=Date.now()){
 if(!progress.pending)return {progress,correct:false,finished:false};const next=structuredClone(progress),session=next.pending,stage=stageById(session.stageId),r=session.round;
 if(r.solved||!r.choices.includes(choice))return {progress,correct:false,finished:false};
 const expected=stage.mode==='build'?lettersFor(r.target)[r.position].toLowerCase():r.target,correct=choice===expected;
 if(r.help){
  if(r.help!=='show'||!correct)return {progress,correct:false,finished:false};
  r.help='ack';return {progress:next,correct:true,finished:false,teaching:true};
 }
 r.tries++;
 if(!correct){r.misses=(r.misses??0)+1;if(r.misses>=2)r.help='pending';return {progress:next,correct:false,finished:false};}
 r.misses=0;
 if(stage.mode==='build'&&++r.position<lettersFor(r.target).length)return {progress:next,correct:true,finished:false};
 r.solved=true;next.seeds++;const key=skillKey(stage,r.target),skill=next.skills[key]??{introduced:false,seen:0,first:0,recent:[],timeline:[]};skill.introduced=true;
 if(!r.demonstration){const first=!r.assisted&&r.tries===(stage.mode==='build'?lettersFor(r.target).length:1);skill.seen++;skill.first+=Number(first);skill.recent=[...skill.recent,Number(first)].slice(-8);const tick=Object.values(progress.skills).reduce((n,s)=>n+s.seen,0)+1;skill.timeline=[...(skill.timeline??[]),[tick,Number(first)]].slice(-5);session.independent++;session.first+=Number(first);}
 next.skills[key]=skill;
 recordPractice(next,stage,r.target,!r.assisted&&r.tries===(stage.mode==='build'?lettersFor(r.target).length:1),r.demonstration,now);
 return {progress:next,correct:true,finished:true};
}
export function showHelp(progress){if(progress.pending?.round.help!=='pending')return progress;const next=structuredClone(progress);next.pending.round.help='show';return next;}
export function resumePractice(progress){if(progress.pending?.round.help!=='ack')return progress;const next=structuredClone(progress);next.pending.round.help=null;next.pending.round.misses=0;return next;}
export function useReadingHelp(progress){
 const session=progress.pending;
 if(!session||stageById(session.stageId).mode!=='picture'||session.round.solved||session.round.assisted)return progress;
 const next=structuredClone(progress);next.pending.round.assisted=true;return next;
}
export function advance(progress,rng=Math.random,now=Date.now()){
 const next=structuredClone(progress),session=next.pending;if(!session?.round.solved)return {progress,completed:false};const stage=stageById(session.stageId);
 if(session.index+1>=session.total){
  const previous=next.stages[stage.id]??{completed:0,passed:false,best:0};const passed=stageMastered(next,stage);next.stages[stage.id]={completed:previous.completed+1,passed:previous.passed||passed,best:Math.max(previous.best,session.independent?session.first/session.independent:0)};next.sessions++;next.pending=null;
  next.continuation=session.returnTo??(passed?STAGES.slice(STAGES.indexOf(stage)+1).find(s=>!next.stages[s.id]?.passed)?.id??'complete':stage.id);
  return {progress:next,completed:true,stageId:stage.id,passed,firstPass:passed&&!previous.passed,score:session.first,total:session.independent,goal:session.total,nextStageId:next.continuation,review:session.returnTo!==undefined};
 }
 session.index++;session.round=makeRound(next,stage,session.index,session.round.target,rng,now,session.reviewTargets?.[session.index]);return {progress:next,completed:false};
}
function validatePending(value){
 if(value===null)return null;if(!plain(value))throw Error('Ungültige Sitzung.');const s=stageById(value.stageId),r=value.round;
 if(!s||!integer(value.total,18)||value.total<1||!integer(value.index,value.total-1)||!integer(value.first,value.total)||!integer(value.independent,value.total)||value.first>value.independent||!plain(r)||![...s.targets,...s.legacyTargets??[]].includes(r.target)||!Array.isArray(r.choices)||!r.choices.length||new Set(r.choices).size!==r.choices.length||typeof r.demonstration!=='boolean'||typeof r.solved!=='boolean'||!integer(r.tries,10000)||!integer(r.position,12))throw Error('Ungültige Sitzung.');
 const allowed=s.mode==='build'?[...BUILD_UNITS,...lettersFor(r.target).map(c=>c.toLowerCase())]:[...targetPool(s,r.target),...(s.distractors??[]),...validForms(s,r.target,ITEMS)];
 if(r.choices.length>7||r.choices.some(c=>typeof c!=='string'||!allowed.includes(c)))throw Error('Ungültige Auswahl.');
 if(s.mode==='build'){
  const letters=lettersFor(r.target);if(letters.some(c=>!r.choices.includes(c.toLowerCase()))||r.position>letters.length||r.solved!==(r.position===letters.length)||r.tries<r.position)throw Error('Ungültiges Wort.');
 }else if(!r.choices.includes(r.target)||r.position!==0||(!r.demonstration&&r.choices.length<2)||(r.solved&&r.tries===0))throw Error('Ungültige Antwort.');
 if(CONTEXTS[s.mode]?!CONTEXTS[s.mode][r.target].includes(r.cue):r.cue!==ITEMS[r.target].audio)throw Error('Ungültiger Ton.');
 let help=r.help??null;const misses=r.misses??Math.max(0,r.tries-r.position);
 if(r.help===undefined&&!r.solved&&s.mode!=='build'&&misses>=2)help='pending';
 if(![null,'pending','show','ack'].includes(help)||!integer(misses,10000)||misses>r.tries-r.position||(help&&(r.solved||misses<2)))throw Error('Ungültige Lernhilfe.');
 let choices=[...r.choices],demonstration=r.demonstration;
 // Untouched introductions saved by v5 become independent choice questions in
 // later levels. Already attempted/solved questions keep their original meaning.
 if(r.help===undefined&&s.id!=='letters'&&demonstration&&r.tries===0&&!r.solved){
  demonstration=false;if(s.mode!=='build'&&choices.length===1)choices.push([...s.targets,...s.distractors??[]].find(c=>c!==r.target));
 }
 if(r.assisted!==undefined&&(typeof r.assisted!=='boolean'||(r.assisted&&s.mode!=='picture')))throw Error('Ungültige Lesehilfe.');
 if(value.returnTo!==undefined&&value.returnTo!=='complete'&&!stageById(value.returnTo))throw Error('Ungültiger Rückweg nach der Wiederholung.');
 if(value.reviewTargets!==undefined&&(!Array.isArray(value.reviewTargets)||value.reviewTargets.length!==value.total||new Set(value.reviewTargets).size!==value.total||value.reviewTargets.some(t=>![...s.targets,...s.legacyTargets??[]].includes(t))||value.reviewTargets[value.index]!==r.target||value.returnTo===undefined))throw Error('Ungültige Wiederholungsrunde.');
 return {stageId:s.id,index:value.index,total:value.total,first:value.first,independent:value.independent,...(value.returnTo!==undefined?{returnTo:value.returnTo}:{}),...(value.reviewTargets?{reviewTargets:[...value.reviewTargets]}:{}),round:{target:r.target,choices,cue:r.cue,demonstration,tries:r.tries,position:r.position,solved:r.solved,help,misses,assisted:r.assisted??false}};
}
export function validateProgress(p){
 if(!plain(p)||p.version!==3||!plain(p.skills)||!plain(p.stages)||!integer(p.sessions)||!integer(p.seeds)||Object.keys(p.skills).length>allowedSkills.size)throw Error('Ungültiger Lernstand.');const result=freshProgress();result.sessions=p.sessions;result.seeds=p.seeds;
 for(const [key,s]of Object.entries(p.skills)){
  if(!allowedSkills.has(key)||!plain(s)||typeof s.introduced!=='boolean'||!integer(s.seen)||!integer(s.first)||s.first>s.seen||!Array.isArray(s.recent)||s.recent.length>8||s.recent.some(v=>v!==0&&v!==1)||s.recent.length>s.seen||!Array.isArray(s.timeline)||s.timeline.length>5||s.timeline.some(t=>!Array.isArray(t)||t.length!==2||!integer(t[0])||(t[1]!==0&&t[1]!==1)))throw Error('Ungültige Lautdaten.');
  result.skills[key]={introduced:s.introduced,seen:s.seen,first:s.first,recent:[...s.recent],timeline:s.timeline.map(t=>[...t])};
 }
 for(const [key,s]of Object.entries(p.stages)){if(!stageById(key)||!plain(s)||!integer(s.completed)||typeof s.passed!=='boolean'||!Number.isFinite(s.best)||s.best<0||s.best>1)throw Error('Ungültige Stufendaten.');result.stages[key]={completed:s.completed,passed:s.passed,best:s.best};}
 result.spacing=validateSpacing(p.spacing,allowedSkills,p.seeds);
 result.pending=validatePending(p.pending);
 if(p.continuation!==undefined&&p.continuation!=='complete'&&!stageById(p.continuation))throw Error('Ungültiges Fortsetzungslevel.');
 result.continuation=continuationFor(p);
 if(p.curriculumVersion!==undefined&&(!integer(p.curriculumVersion,CURRICULUM_VERSION)||p.curriculumVersion<1))throw Error('Unbekannte Lehrplanversion.');
 // Old "all 14 complete" profiles continue into new material; keep all earned
 // flowers, exact pending tasks, and explicit review choices from this release.
 if((p.curriculumVersion??6)<7&&result.continuation==='complete'&&!result.pending)result.continuation='sentence_words';
 if(p.paused!==undefined){
  if(!plain(p.paused)||Object.keys(p.paused).length>STAGES.length)throw Error('Ungültige pausierte Level.');
  for(const [key,value]of Object.entries(p.paused)){
   const session=validatePending(value);if(!session||key!==session.stageId||key===result.pending?.stageId)throw Error('Ungültiges pausiertes Level.');result.paused[key]=session;
  }
 }
 if((p.curriculumVersion??6)<9){
  // Old one-noun matching cannot certify the new relation contrasts. Preserve
  // all old skill history/practice flowers, but reassess expanded activities.
  for(const id of ['first_sentences','sentence_meaning']){
   if(result.stages[id]&&!stageMastered(result,stageById(id)))result.stages[id].passed=false;
  }
  if(result.continuation==='complete')result.continuation='phrase_place';
  for(const session of [result.pending,...Object.values(result.paused)])if(session?.returnTo==='complete')session.returnTo='phrase_place';
 }
 return result;
}
export function migrateLegacy(p){
 if(!plain(p)||p.version!==2||!plain(p.skills)||!plain(p.completed)||!integer(p.sessions)||Object.keys(p.skills).length>64)throw Error('Ungültige alte Sicherung.');const store=freshStore(),out=store.profiles[0].progress;out.sessions=p.sessions;out.seeds=p.sessions*3;
 for(const [key,s]of Object.entries(p.skills)){
  if(!/^[a-z:]+$/.test(key)||!plain(s)||!['attempts','correct','firstTry'].every(k=>integer(s[k]))||s.correct>s.attempts||s.firstTry>s.correct)throw Error('Ungültiger alter Lernstand.');
  const mapped=key.startsWith('word:')?'build:'+key.slice(5):['a','m','i','o'].includes(key)?'sound:'+key:'unit:'+key;
  if(allowedSkills.has(mapped))out.skills[mapped]={introduced:true,seen:s.attempts,first:s.firstTry,recent:[],timeline:[]};
 }
 for(const [key,count]of Object.entries(p.completed)){if(!['letters','syllables','words'].includes(key)||!integer(count))throw Error('Ungültige alte Stufe.');out.stages[{letters:'letters',syllables:'short',words:'build'}[key]]={completed:count,passed:false,best:0};}
 return store;
}
export function validateStore(v){
 if(v?.version===2)return migrateLegacy(v);
 if(!plain(v)||v.version!==3||!Array.isArray(v.profiles)||v.profiles.length<1||v.profiles.length>8)throw Error('Ungültige Profildatei.');
 const profiles=v.profiles.map(p=>{if(!plain(p)||typeof p.id!=='string'||!/^[-a-z0-9]{1,60}$/i.test(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>24||!AVATARS.includes(p.avatar))throw Error('Ungültiges Profil.');return {id:p.id,name:p.name.trim(),avatar:p.avatar,progress:validateProgress(p.progress)};});
 if(new Set(profiles.map(p=>p.id)).size!==profiles.length||!profiles.some(p=>p.id===v.activeId))throw Error('Ungültige Profilauswahl.');return {version:3,activeId:v.activeId,profiles};
}
export function readStored(storage){try{const raw=storage.getItem(STORAGE_KEY);if(raw)return {store:validateStore(JSON.parse(raw)),warning:null};const old=storage.getItem(LEGACY_KEY);if(old)return {store:migrateLegacy(JSON.parse(old)),warning:'Der bisherige Lernstand wurde in dein erstes Profil übernommen.'};return {store:freshStore(),warning:null};}catch{return {store:freshStore(),warning:'Gespeicherte Daten konnten nicht geladen werden. Du kannst trotzdem üben. Eine vorhandene Sicherung kannst du im Elternbereich laden.'};}}
export function saveStored(storage,store){try{storage.setItem(STORAGE_KEY,JSON.stringify(store));return true;}catch{return false;}}

// Progress is based on correct work, including each grapheme of a partial word.
// It never depends on response speed and is exactly full only at the level goal.
export function levelProgress(progress){const s=progress.pending;if(!s)return {value:0,total:0,ratio:0};const stage=stageById(s.stageId),r=s.round;const fraction=stage.mode==='build'?r.position/lettersFor(r.target).length:Number(r.solved);const value=s.index+fraction;return {value,total:s.total,ratio:value/s.total};}
