// Auditory word recognition: close written alternatives, never new target words.
// Forms may coincide with rare words/names. They are not a vocabulary list and
// get no speech model, skill, mastery score or spaced-review record of their own.
// Each varies a noninitial letter, keeping taught multi-letter units intact.
// See/Tee keep ordinary real-word choices: a one-letter noninitial change
// cannot preserve their taught ee unit and length.
const VARIANTS={
 oma:['Omi','Omu','Omo'],omi:['Oma','Omu','Omo'],mama:['Mami','Mamu','Mamo'],mami:['Mama','Mamu','Mamo'],
 bus:['Bum','Buf','Bul'],hut:['Hum','Huf','Huk'],fisch:['Fasch','Fusch','Fesch'],schaf:['Schof','Schuf','Schif'],ball:['Boll','Bell','Bill'],
 sofa:['Sofe','Sofu','Sufa'],lama:['Lamo','Lamu','Lema'],salami:['Salamo','Salamu','Selami'],
 tomate:['Tomale','Tomafe','Tomane'],banane:['Baname','Banale','Banafe'],melone:['Melome','Melole','Melofe'],
 igel:['Imel','Ifel','Inel'],esel:['Emel','Efel','Enel'],nudel:['Numel','Nufel','Nugel'],
 hase:['Hose','Hame','Hafe'],hose:['Hase','Home','Hofe'],salat:['Salam','Salaf','Salak'],
 bett:['Batt','Bitt','Butt'],kamm:['Komm','Kimm','Kumm'],tasse:['Tosse','Tusse','Tisse'],
 kanne:['Konne','Kunne','Kinne'],sonne:['Sanne','Sunne','Sinne'],affe:['Affi','Affu','Affo'],
 eis:['Eim','Eif','Eit'],seil:['Seim','Seif','Seit'],bein:['Beim','Beif','Beit'],leim:['Lein','Leif','Leit'],
 baum:['Baun','Bauf','Baut'],maus:['Maum','Mauf','Maut'],haus:['Haum','Hauf','Haut'],laub:['Laum','Lauf','Laud'],
 biene:['Bieme','Biele','Biete'],sieb:['Sief','Siel','Sied'],sieben:['siegen','sieden','siefen'],
 boot:['Boom','Boof','Boon'],beet:['Beem','Been','Beel'],
 das:['dam','dal','daf'],ist:['ift','ilt','ism'],ein:['eim','eif','eit'],eine:['eime','eife','eite'],
};
export const FORMS=Object.fromEntries(Object.entries(VARIANTS).flatMap(([target,texts])=>texts.map((text,i)=>['form_'+target+'_'+i,{text,target,kind:'form'}])));
export const formsFor=target=>Object.keys(FORMS).filter(id=>FORMS[id].target===target);
export function challengeTier(progress,stage,target,items){
 if(stage.mode!=='find'||items[target]?.kind!=='word'||!progress.skills[`${stage.group}:${target}`]?.seen||!VARIANTS[target])return 0;
 const events=stage.targets.filter(t=>items[t]?.kind==='word').flatMap(t=>progress.skills[`${stage.group}:${t}`]?.timeline??[]).sort((a,b)=>a[0]-b[0]).slice(-6).map(v=>v[1]);
 if(events.slice(-2).some(v=>v===0))return 0;
 if(events.length>=6&&events.every(Boolean))return 2;
 if(events.length>=3&&events.slice(-3).every(Boolean))return 1;
 const recent=progress.skills[`${stage.group}:${target}`]?.recent??[];
 if(recent.length>=3&&recent.slice(-3).every(Boolean))return 2;
 return recent.length>=2&&recent.slice(-2).every(Boolean)?1:0;
}
export function closeChoices(stage,target,items){
 return formsFor(target).map(id=>stage.targets.find(t=>items[t]?.text===FORMS[id].text)??id);
}
export function validForms(stage,target,items){
 return stage.mode==='find'&&items[target]?.kind==='word'?formsFor(target):[];
}
