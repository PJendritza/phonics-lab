// Transparent practice scheduling, not a clinical or validated learning model.
// Wall-clock dates never influence score/speed. Turns space retrievals now;
// dates offer deliberate review later without moving the forward cursor back.
export const DAY=86_400_000;
export const freshSpacing=()=>({turn:0,history:[],reviews:{}});
const keyFor=(stage,target)=>`${stage.group}:${target}`;
const isSecure=skill=>!!skill&&skill.recent.length>=2&&skill.recent.slice(-2).every(Boolean)&&skill.recent.slice(-4).filter(Boolean).length/Math.min(4,skill.recent.length)>=.75;

export function selectTarget(progress,stage,now=Date.now()){
 const spacing=progress.spacing??freshSpacing(),history=spacing.history;
 // At least two other questions in a pool of 3+, or one in a pool of 2.
 const gap=Math.min(2,stage.targets.length-1);
 let eligible=stage.targets.filter(t=>!history.slice(-gap).includes(keyFor(stage,t)));
 if(!eligible.length)eligible=stage.targets.filter(t=>keyFor(stage,t)!==history.at(-1));
 if(!eligible.length)eligible=[...stage.targets];
 const rank=target=>{
  const key=keyFor(stage,target),skill=progress.skills[key],review=spacing.reviews[key];
  if(!skill?.introduced)return [0,0,0];
  if(!skill.seen)return [1,0,0];
  const secure=isSecure(skill),ready=!review||(review.after<=spacing.turn+1&&(!secure||review.due<=now));
  const accuracy=skill.recent.filter(Boolean).length/Math.max(1,skill.recent.length);
  return [ready?(secure?3:2):4,ready&&!secure?accuracy:review?.last??0,review?.last??0];
 };
 return eligible.map((target,index)=>({target,index,rank:rank(target)})).sort((a,b)=>a.rank[0]-b.rank[0]||a.rank[1]-b.rank[1]||a.rank[2]-b.rank[2]||a.index-b.index)[0].target;
}

export function recordPractice(progress,stage,target,first,demonstration,now=Date.now()){
 const spacing=progress.spacing??=freshSpacing(),key=keyFor(stage,target);
 spacing.turn++;spacing.history=[...spacing.history,key].slice(-8);
 if(demonstration)return;
 const before=spacing.reviews[key],prior=before?.streak??(isSecure(progress.skills[key])?1:0),streak=first?Math.min(20,prior+1):0;
 const days=[0,0,1,3,7,14,30][Math.min(6,streak)];
 spacing.reviews[key]={streak,days,due:now+(first?days*DAY:10*60_000),lastAt:now,last:spacing.turn,after:spacing.turn+(first?Math.min(24,3*2**Math.max(0,streak-1)):3)};
}

export function practiceGoal(progress,stage,ceiling,now=Date.now()){
 let budget=0,weak=0;
 for(const target of stage.targets){
  const key=keyFor(stage,target),skill=progress.skills[key],review=progress.spacing?.reviews[key];
  if(!isSecure(skill)){budget+=stage.id==='letters'&&!skill?.introduced?3:2;weak++;}
  else if(!review||review.due<=now)budget++;
 }
 // A lone weak word needs two different intervening questions before retry.
 const spacers=weak?Math.max(0,Math.min(3,stage.targets.length)-weak):0;
 return Math.min(ceiling,Math.max(3,budget+spacers));
}

export function dueReviews(progress,stages,now=Date.now()){
 const claimed=new Set(),result=[];
 for(const stage of stages){
  if(!progress.stages[stage.id]?.completed&&!progress.stages[stage.id]?.passed)continue;
  const targets=stage.targets.filter(target=>{
   const key=keyFor(stage,target),skill=progress.skills[key],review=progress.spacing?.reviews[key];
   if(claimed.has(key)||!skill?.introduced||!skill.seen||(review&&review.due>now))return false;
   claimed.add(key);return true;
  });
  if(targets.length)result.push({stageId:stage.id,targets});
 }
 return result;
}

export function validateSpacing(value,allowedSkills,completed){
 if(value===undefined)return {...freshSpacing(),turn:completed};
 const plain=v=>v&&typeof v==='object'&&!Array.isArray(v),int=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
 if(!plain(value)||!int(value.turn,1e7)||!Array.isArray(value.history)||value.history.length>8||value.history.some(k=>!allowedSkills.has(k))||!plain(value.reviews)||Object.keys(value.reviews).length>allowedSkills.size)throw Error('Ungültige Wiederholungsplanung.');
 const result={turn:value.turn,history:[...value.history],reviews:{}};
 for(const [key,r]of Object.entries(value.reviews)){
  if(!allowedSkills.has(key)||!plain(r)||!int(r.streak,20)||![0,1,3,7,14,30].includes(r.days)||!int(r.due,8.64e15)||!int(r.lastAt,8.64e15)||!int(r.last,value.turn)||!int(r.after,value.turn+24)||r.after<=r.last||r.due<r.lastAt)throw Error('Ungültiger Wiederholungstermin.');
  result.reviews[key]={streak:r.streak,days:r.days,due:r.due,lastAt:r.lastAt,last:r.last,after:r.after};
 }
 return result;
}
