// Reviewed template families, not an unrestricted sentence generator.
// Every alternative must differ in meaning, not merely sentence length.
export const SCENE_ITEMS={};
export const NOUNS={ball:{text:'Ball',article:'ein',definite:'der',plural:'Bälle',adjective:'er'},hut:{text:'Hut',article:'ein',definite:'der',plural:'Hüte',adjective:'er'},maus:{text:'Maus',article:'eine',definite:'die',plural:'Mäuse',adjective:'e'},schaf:{text:'Schaf',article:'ein',definite:'das',plural:'Schafe',adjective:'es'}};
const cap=s=>s[0].toUpperCase()+s.slice(1);
export const LOCATIONS={bus:{text:'Bus',relations:{im:'im Bus',am:'am Bus'}},haus:{text:'Haus',relations:{im:'im Haus',am:'am Haus'}},baum:{text:'Baum',relations:{am:'am Baum'}},tisch:{text:'Tisch',relations:{auf:'auf dem Tisch',unter:'unter dem Tisch'}},kiste:{text:'Kiste',relations:{in:'in der Kiste',neben:'neben der Kiste'}},stuhl:{text:'Stuhl',relations:{auf:'auf dem Stuhl',unter:'unter dem Stuhl'}}};
function add(id,text,scene,shortText=null){SCENE_ITEMS[id]={text,audio:id,kind:'sentence',picture:id,family:scene.family,scene,...(shortText?{shortText,shortAudio:id+'_short'}:{})};}
for(const [subject,noun] of Object.entries(NOUNS))for(const [location,place]of Object.entries(LOCATIONS))for(const [relation,words]of Object.entries(place.relations)){
 const id=subject+'_'+relation+'_'+location;
 add(id,`${cap(noun.article)} ${noun.text} ist ${words}.`,{family:'place',subject,relation,location},`${cap(noun.article)} ${noun.text} ${words}`);
 Object.assign(SCENE_ITEMS[id],{subject,relation,location});
}
for(const [subject,noun]of Object.entries(NOUNS))for(const count of [1,2,3]){
 const words=count===1?`${noun.article} ${noun.text}`:`${count===2?'zwei':'drei'} ${noun.plural}`;
 add(`count_${subject}_${count}`,`Hier ${count===1?'ist':'sind'} ${words}.`,{family:'quantity',subject,count},cap(words));
}
for(const [subject,noun]of Object.entries(NOUNS))for(const size of ['gross','klein']){
 const adjective=size==='gross'?'groß':'klein';
 add(`size_${subject}_${size}`,`${cap(noun.definite)} ${noun.text} ist ${adjective}.`,{family:'size',subject,size},`${cap(noun.article)} ${adjective+noun.adjective} ${noun.text}`);
}
for(const subject of ['maus','schaf'])for(const object of ['ball','hut']){
 const noun=NOUNS[subject],obj=NOUNS[object];
 add(`has_${subject}_${object}`,`${cap(noun.definite)} ${noun.text} hat einen ${obj.text}.`,{family:'possession',subject,object},`${cap(noun.article)} ${noun.text} mit ${obj.definite==='die'?'einer':'einem'} ${obj.text}`);
}
for(const [subject,text,article]of [['maus','Maus','Die'],['schaf','Schaf','Das'],['hase','Hase','Der'],['affe','Affe','Der']])for(const action of ['wach','schlaeft']){
 const verb=action==='schlaeft'?'schläft':subject==='schaf'?'steht':'sitzt';
 add(`action_${subject}_${action}`,`${article} ${text} ${verb}.`,{family:'action',subject,action});
}
for(const ball of ['oben','unten'])for(const hut of ['oben','unten']){
 add(`pair_${ball}_${hut}`,`Der Ball ist ${ball}. Der Hut ist ${hut}.`,{family:'pair',ball,hut});
}
export const DIMENSIONS={place:['subject','relation','location'],quantity:['subject','count'],size:['subject','size'],possession:['subject','object'],action:['subject','action'],pair:['ball','hut']};
export const sceneDimensions=item=>(item?.scene?.family==='pair'&&item.scene.first?['upper','lower']:DIMENSIONS[item?.scene?.family])??['subject','relation','location'];
export function equivalentScene(a,b){return !!a?.scene&&!!b?.scene&&a.scene.family===b.scene.family&&sceneDimensions(a).every(k=>a.scene[k]===b.scene[k]);}

// Contextual reading vocabulary: full-utterance help, not claimed as previously
// mastered phonics or new isolated sound recordings.
export const EXPANSION_VOCABULARY=['tisch','auf','in','hier','sind','zwei','drei','mäuse','bälle','hüte','schafe','stuhl','kiste','dem','der','die','den','einen','unter','neben','groß','großer','große','großes','klein','kleiner','kleine','kleines','hat','mit','sitzt','steht','schläft','oben','unten'];

// Two independent follow-on packs; stable v10 IDs remain in pack 33.
for(const v of Object.values(SCENE_ITEMS))v.pack=33;
Object.assign(NOUNS,{
 katze:{text:'Katze',article:'eine',definite:'die',plural:'Katzen',adjective:'e'},hund:{text:'Hund',article:'ein',definite:'der',plural:'Hunde',adjective:'er'},ente:{text:'Ente',article:'eine',definite:'die',plural:'Enten',adjective:'e'},frosch:{text:'Frosch',article:'ein',definite:'der',plural:'Frösche',adjective:'er'},
 buch:{text:'Buch',article:'ein',definite:'das',plural:'Bücher',adjective:'es'},becher:{text:'Ballon',article:'ein',definite:'der',plural:'Ballons',adjective:'er'},apfel:{text:'Apfel',article:'ein',definite:'der',plural:'Äpfel',adjective:'er'},schuh:{text:'Schuh',article:'ein',definite:'der',plural:'Schuhe',adjective:'er'},puppe:{text:'Puppe',article:'eine',definite:'die',plural:'Puppen',adjective:'e'},tasche:{text:'Tasche',article:'eine',definite:'die',plural:'Taschen',adjective:'e'},
});
function packItem(pack,id,text,scene,shortText=null){add(id,text,scene,shortText);SCENE_ITEMS[id].pack=pack;Object.assign(SCENE_ITEMS[id],{subject:scene.subject,relation:scene.relation,location:scene.location});}
for(const [pack,subjects]of [[34,['katze','hund','ente','frosch']],[35,['buch','apfel','schuh','puppe']]]){
 for(const subject of subjects){const noun=NOUNS[subject],prefix=`mix${pack}_${subject}`;
  for(const [location,place]of Object.entries(LOCATIONS))for(const [relation,words]of Object.entries(place.relations))packItem(pack,`${prefix}_${relation}_${location}`,`${cap(noun.article)} ${noun.text} ist ${words}.`,{family:'place',subject,location,relation},`${cap(noun.article)} ${noun.text} ${words}`);
  for(const count of [1,2,3]){const words=count===1?`${noun.article} ${noun.text}`:`${count===2?'zwei':'drei'} ${noun.plural}`;packItem(pack,`${prefix}_count_${count}`,`Hier ${count===1?'ist':'sind'} ${words}.`,{family:'quantity',subject,count},cap(words));}
  for(const size of ['gross','klein']){const adj=size==='gross'?'groß':'klein';packItem(pack,`${prefix}_size_${size}`,`${cap(noun.definite)} ${noun.text} ist ${adj}.`,{family:'size',subject,size},`${cap(noun.article)} ${adj+noun.adjective} ${noun.text}`);}
 }
 const owners=pack===34?['katze','hund']:['mama','oma'],objects=pack===34?['buch','becher']:['buch','schuh'];
 for(const subject of owners)for(const object of objects){const noun=NOUNS[subject],who=noun?`${cap(noun.definite)} ${noun.text}`:subject==='mama'?'Mama':'Oma',shortWho=noun?noun.text:who,obj=NOUNS[object];packItem(pack,`mix${pack}_has_${subject}_${object}`,`${who} hat ${obj.article==='ein'&&obj.definite==='der'?'einen':obj.article} ${obj.text}.`,{family:'possession',subject,object},`${noun?cap(noun.article)+' ':''}${shortWho} mit ${obj.definite==='die'?'einer':'einem'} ${obj.text}`);}
 if(pack===34)for(const subject of subjects)for(const action of ['wach','schlaeft']){const n=NOUNS[subject],verb=action==='schlaeft'?'schläft':subject==='ente'?'steht':'sitzt';packItem(pack,`mix34_action_${subject}_${action}`,`${cap(n.definite)} ${n.text} ${verb}.`,{family:'action',subject,action});}
 else for(const subject of ['buch','tasche'])for(const action of ['offen','zu']){const n=NOUNS[subject];packItem(pack,`mix35_state_${subject}_${action}`,`${cap(n.definite)} ${n.text} ist ${action}.`,{family:'action',subject,action});}
 const [first,second]=pack===34?['buch','becher']:['schuh','puppe'];
 for(const upper of ['oben','unten'])for(const lower of ['oben','unten']){const a=NOUNS[first],b=NOUNS[second];packItem(pack,`mix${pack}_pair_${upper}_${lower}`,`${cap(a.definite)} ${a.text} ist ${upper}. ${cap(b.definite)} ${b.text} ist ${lower}.`,{family:'pair',first,second,upper,lower});}
}

EXPANSION_VOCABULARY.push('offen','zu',...Object.values(NOUNS).flatMap(n=>[n.text.toLowerCase(),n.plural.toLowerCase()]));
