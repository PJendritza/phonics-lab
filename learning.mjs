import {STAGES,ITEMS,CONTEXTS,BUILD_UNITS,AVATARS,stageById,skillKey,lettersFor} from './data.mjs?v=93c3228db761';
export const STORAGE_KEY='kalulu-de:learners:v3',LEGACY_KEY='kalulu-de:calm:v2';
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const integer=(v,max=1e7)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const id=()=>globalThis.crypto?.randomUUID?.()??`child-${Date.now()}-${Math.floor(Math.random()*1e6)}`;
export function freshProgress(){return {version:3,skills:{},stages:{},sessions:0,seeds:0,pending:null};}
export function createProfile(name='Mein Profil',avatar=AVATARS[0]){return {id:id(),name:name.trim().slice(0,24)||'Mein Profil',avatar,progress:freshProgress()};}
export function freshStore(){const p=createProfile();return {version:3,activeId:p.id,profiles:[p]};}
export const activeProfile=store=>store.profiles.find(p=>p.id===store.activeId);
export function shuffled(items,rng=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
const allowedSkills=new Set(STAGES.flatMap(s=>s.targets.map(t=>skillKey(s,t))));
export function mastered(skill){return !!skill&&skill.recent.length>=2&&skill.recent.slice(-2).every(Boolean)&&skill.recent.slice(-4).filter(Boolean).length/Math.min(4,skill.recent.length)>=0.75;}
export const stageMastered=(progress,stage)=>stage.targets.every(t=>mastered(progress.skills[skillKey(stage,t)]));
export function recommended(progress){return STAGES.find(s=>!progress.stages[s.id]?.passed)??STAGES.reduce((lowest,s)=>stagePriority(progress,s)<stagePriority(progress,lowest)?s:lowest,STAGES[0]);}
function stagePriority(progress,s){return s.targets.reduce((sum,t)=>sum+priority(progress.skills[skillKey(s,t)]),0)/s.targets.length;}
function priority(skill){if(!skill?.introduced)return -10;if(!skill.recent.length)return -5;return (skill.recent.filter(Boolean).length+0.5)/(skill.recent.length+1)+(mastered(skill)?2:0)+Math.min(skill.seen,100)*0.001;}
export function difficulty(progress){const recent=Object.values(progress.skills).flatMap(s=>s.timeline??[]).sort((a,b)=>a[0]-b[0]).slice(-5).map(x=>x[1]);if(recent.length>=3&&recent.slice(-3).filter(x=>!x).length>=2)return 2;return recent.length>=5&&recent.every(Boolean)?4:recent.length>=2&&recent.slice(-2).every(Boolean)?3:2;}
function chooseTarget(progress,stage,previous){return [...stage.targets].sort((a,b)=>(priority(progress.skills[skillKey(stage,a)])+(a===previous?0.08:0))-(priority(progress.skills[skillKey(stage,b)])+(b===previous?0.08:0)))[0];}
function makeRound(progress,stage,index=0,previous=null,rng=Math.random){
 const target=chooseTarget(progress,stage,previous),key=skillKey(stage,target),demonstration=!progress.skills[key]?.introduced;
 let choices;
 if(stage.mode==='build'){
  const actual=[...new Set(lettersFor(target).map(c=>c.toLowerCase()))],others=(stage.id==='more_build'?BUILD_UNITS:['a','m','i','o','u','n','l']).filter(c=>!actual.includes(c));choices=shuffled([...actual,...shuffled(others,rng).slice(0,difficulty(progress)>=3?1:0)],rng);
 }else{const pool=[...new Set([...stage.targets,...(stage.distractors??[])])];choices=demonstration?[target]:shuffled([target,...shuffled(pool.filter(t=>t!==target),rng).slice(0,difficulty(progress)-1)],rng);}
 const cue=CONTEXTS[stage.mode]?CONTEXTS[stage.mode][target][index%CONTEXTS[stage.mode][target].length]:ITEMS[target].audio;
 return {target,choices,cue,demonstration,tries:0,position:0,solved:false};
}
export function startSession(progress,stageId,rng=Math.random){const next=structuredClone(progress),stage=stageById(stageId);if(!stage)throw Error('Unbekannte Stufe.');next.pending={stageId,index:0,total:stage.goal??9,first:0,independent:0,round:makeRound(next,stage,0,null,rng)};return next;}
export function answer(progress,choice){
 if(!progress.pending)return {progress,correct:false,finished:false};const next=structuredClone(progress),session=next.pending,stage=stageById(session.stageId),r=session.round;
 if(r.solved||!r.choices.includes(choice))return {progress,correct:false,finished:false};
 const expected=stage.mode==='build'?lettersFor(r.target)[r.position].toLowerCase():r.target,correct=choice===expected;r.tries++;
 if(!correct)return {progress:next,correct:false,finished:false};
 if(stage.mode==='build'&&++r.position<lettersFor(r.target).length)return {progress:next,correct:true,finished:false};
 r.solved=true;next.seeds++;const key=skillKey(stage,r.target),skill=next.skills[key]??{introduced:false,seen:0,first:0,recent:[],timeline:[]};skill.introduced=true;
 if(!r.demonstration){const first=r.tries===(stage.mode==='build'?lettersFor(r.target).length:1);skill.seen++;skill.first+=Number(first);skill.recent=[...skill.recent,Number(first)].slice(-8);const tick=Object.values(progress.skills).reduce((n,s)=>n+s.seen,0)+1;skill.timeline=[...(skill.timeline??[]),[tick,Number(first)]].slice(-5);session.independent++;session.first+=Number(first);}
 next.skills[key]=skill;return {progress:next,correct:true,finished:true};
}
export function advance(progress,rng=Math.random){
 const next=structuredClone(progress),session=next.pending;if(!session?.round.solved)return {progress,completed:false};const stage=stageById(session.stageId);
 if(session.index+1>=session.total){
  const previous=next.stages[stage.id]??{completed:0,passed:false,best:0};const passed=stageMastered(next,stage);next.stages[stage.id]={completed:previous.completed+1,passed:previous.passed||passed,best:Math.max(previous.best,session.independent?session.first/session.independent:0)};next.sessions++;next.pending=null;
  return {progress:next,completed:true,stageId:stage.id,passed,firstPass:passed&&!previous.passed,score:session.first,total:session.independent,goal:session.total};
 }
 session.index++;session.round=makeRound(next,stage,session.index,session.round.target,rng);return {progress:next,completed:false};
}
function validatePending(value){
 if(value===null)return null;if(!plain(value))throw Error('Ungültige Sitzung.');const s=stageById(value.stageId),r=value.round;
 if(!s||!integer(value.total,12)||value.total<1||!integer(value.index,value.total-1)||!integer(value.first,value.total)||!integer(value.independent,value.total)||value.first>value.independent||!plain(r)||!s.targets.includes(r.target)||!Array.isArray(r.choices)||!r.choices.length||new Set(r.choices).size!==r.choices.length||typeof r.demonstration!=='boolean'||typeof r.solved!=='boolean'||!integer(r.tries,10000)||!integer(r.position,12))throw Error('Ungültige Sitzung.');
 const allowed=s.mode==='build'?[...BUILD_UNITS,...lettersFor(r.target).map(c=>c.toLowerCase())]:[...s.targets,...(s.distractors??[])];
 if(r.choices.length>7||r.choices.some(c=>typeof c!=='string'||!allowed.includes(c)))throw Error('Ungültige Auswahl.');
 if(s.mode==='build'){
  const letters=lettersFor(r.target);if(letters.some(c=>!r.choices.includes(c.toLowerCase()))||r.position>letters.length||r.solved!==(r.position===letters.length)||r.tries<r.position)throw Error('Ungültiges Wort.');
 }else if(!r.choices.includes(r.target)||r.position!==0||(!r.demonstration&&r.choices.length<2)||(r.solved&&r.tries===0))throw Error('Ungültige Antwort.');
 if(CONTEXTS[s.mode]?!CONTEXTS[s.mode][r.target].includes(r.cue):r.cue!==ITEMS[r.target].audio)throw Error('Ungültiger Ton.');
 return {stageId:s.id,index:value.index,total:value.total,first:value.first,independent:value.independent,round:{target:r.target,choices:[...r.choices],cue:r.cue,demonstration:r.demonstration,tries:r.tries,position:r.position,solved:r.solved}};
}
export function validateProgress(p){
 if(!plain(p)||p.version!==3||!plain(p.skills)||!plain(p.stages)||!integer(p.sessions)||!integer(p.seeds)||Object.keys(p.skills).length>160)throw Error('Ungültiger Lernstand.');const result=freshProgress();result.sessions=p.sessions;result.seeds=p.seeds;
 for(const [key,s]of Object.entries(p.skills)){
  if(!allowedSkills.has(key)||!plain(s)||typeof s.introduced!=='boolean'||!integer(s.seen)||!integer(s.first)||s.first>s.seen||!Array.isArray(s.recent)||s.recent.length>8||s.recent.some(v=>v!==0&&v!==1)||s.recent.length>s.seen||!Array.isArray(s.timeline)||s.timeline.length>5||s.timeline.some(t=>!Array.isArray(t)||t.length!==2||!integer(t[0])||(t[1]!==0&&t[1]!==1)))throw Error('Ungültige Lautdaten.');
  result.skills[key]={introduced:s.introduced,seen:s.seen,first:s.first,recent:[...s.recent],timeline:s.timeline.map(t=>[...t])};
 }
 for(const [key,s]of Object.entries(p.stages)){if(!stageById(key)||!plain(s)||!integer(s.completed)||typeof s.passed!=='boolean'||!Number.isFinite(s.best)||s.best<0||s.best>1)throw Error('Ungültige Stufendaten.');result.stages[key]={completed:s.completed,passed:s.passed,best:s.best};}
 result.pending=validatePending(p.pending);return result;
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
