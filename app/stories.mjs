// Three connected events, one protagonist, and unambiguous existing pictures.
// Some stories deliberately share the same cards in a different textual order.
export const STORY_VOCABULARY=['es','er','sie','dann','danach','findet','trägt','ihn','zum','hüpft','den','rollt','los','landet','gras','springt','kippt','schaut','heraus'];
export const STORY_NOUNS={gras:{text:'Gras',definite:'das',plural:'Gras'}};
const story=(id,title,sentences,frames)=>[id,{kind:'story',text:sentences.join(' '),sentences,title,frames,audio:id}];
export const STORIES=Object.fromEntries([
 story('story_dog_hat','Der Hund und der Hut',[
  'Der Hund findet einen Hut.','Er trägt ihn zum Baum.','Dann schläft er mit dem Hut.',
 ],['film_dog_find','film_dog_carry','film_dog_sleep']),
 story('story_frog_ball','Der Frosch auf dem Ball',[
  'Der Frosch hüpft auf den Ball.','Der Ball rollt los.','Der Frosch landet im Gras.',
 ],['film_frog_ball','film_frog_roll','film_frog_grass']),
 story('story_cat_box','Die Katze und die Kiste',[
  'Die Katze springt in die Kiste.','Die Kiste kippt um.','Dann schaut die Katze heraus.',
 ],['film_cat_jump','film_cat_tip','film_cat_peek']),
 story('story_book_bed','Das Buch am Abend',[
  'Das Kind hat ein Buch.','Es liest das Buch.','Dann schläft es.',
 ],['daily_35_kind_hat_buch','daily_35_kind_liest_buch','daily_34_kind_schlaeft']),
 story('story_breakfast_book','Eine kleine Pause',[
  'Das Kind isst ein Brot.','Danach trinkt es Wasser.','Dann liest es ein Buch.',
 ],['daily_35_kind_isst_brot','daily_35_kind_trinkt_wasser','daily_35_kind_liest_buch']),
 story('story_book_snack','Eine andere Pause',[
  'Das Kind liest ein Buch.','Dann trinkt es Wasser.','Danach isst es ein Brot.',
 ],['daily_35_kind_liest_buch','daily_35_kind_trinkt_wasser','daily_35_kind_isst_brot']),
 story('story_morning','Ein ruhiger Morgen',[
  'Das Kind sitzt da.','Dann trinkt es Milch.','Danach liest es ein Buch.',
 ],['daily_34_kind_wach','daily_35_kind_trinkt_milch','daily_35_kind_liest_buch']),
 story('story_evening_book','Eine Geschichte am Abend',[
  'Das Kind liest ein Buch.','Danach trinkt es Milch.','Dann schläft es.',
 ],['daily_35_kind_liest_buch','daily_35_kind_trinkt_milch','daily_34_kind_schlaeft']),
 story('story_evening_milk','Noch ein ruhiger Abend',[
  'Das Kind trinkt Milch.','Dann liest es ein Buch.','Danach schläft es.',
 ],['daily_35_kind_trinkt_milch','daily_35_kind_liest_buch','daily_34_kind_schlaeft']),
 story('story_cat_rest','Die Katze macht Pause',[
  'Die Katze ist am Haus.','Dann ist sie auf dem Stuhl.','Nun schläft sie.',
 ],['mix34_katze_am_haus','mix34_katze_auf_stuhl','mix34_action_katze_schlaeft']),
 story('story_dog_trip','Der Hund unterwegs',[
  'Der Hund ist am Haus.','Dann ist er im Bus.','Nun schläft er.',
 ],['mix34_hund_am_haus','mix34_hund_im_bus','mix34_action_hund_schlaeft']),
]);
for(const [id,film]of [['story_dog_hat','dog'],['story_frog_ball','frog'],['story_cat_box','cat']])STORIES[id].film=film;

export function newStoryRound(target,rng=Math.random){
 const frames=STORIES[target].frames,choices=[...frames];
 for(let i=choices.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
 // Never hand the answer out as the initial tray order.
 if(choices.every((v,i)=>v===frames[i]))choices.push(choices.shift());
 return {target,choices,cue:target,demonstration:false,tries:0,position:0,solved:false,help:null,misses:0,assisted:false,order:[],checked:false};
}
export const storyCorrect=r=>STORIES[r.target].frames.every((v,i)=>r.order[i]===v)&&r.order.length===STORIES[r.target].frames.length;
export const fullStoryOrder=r=>r.order.length===r.choices.length&&r.order.every(f=>typeof f==='string'&&r.choices.includes(f));
const trim=order=>{while(order.length&&order.at(-1)===null)order.pop();return order;};
export function editStoryRound(r,frame){
 if(r.solved||!r.choices.includes(frame))return r;
 const order=[...r.order],index=order.indexOf(frame);
 if(index>=0)order[index]=null;else{const empty=order.indexOf(null);order[empty>=0?empty:order.length]=frame;}
 trim(order);
 return {...r,order,checked:false};
}
export function dropStoryRound(r,frame,index){
 if(r.solved||!r.choices.includes(frame))return r;
 if(index===null)return r.order.includes(frame)?editStoryRound(r,frame):r;
 if(!Number.isInteger(index)||index<0||index>=r.choices.length)return r;
 const order=Array.from({length:r.choices.length},(_,i)=>r.order[i]??null),from=order.indexOf(frame);
 if(from===index)return r;
 const displaced=order[index];if(from>=0)order[from]=displaced;
 order[index]=frame;return {...r,order:trim(order),checked:false};
}
export function resetStoryRound(r){
 if(r.solved||(!r.order.length&&!r.checked))return r;
 return {...r,order:[],checked:false};
}
export function validateStoryRound(r){
 const frames=STORIES[r.target]?.frames,validOrder=v=>Array.isArray(v)&&v.length<=frames.length&&new Set(v.filter(f=>f!==null)).size===v.filter(f=>f!==null).length&&Array.from(v).every(f=>f===null||frames.includes(f));
 if(!frames||r.choices.length!==frames.length||frames.some(f=>!r.choices.includes(f))
  ||!validOrder(r.order)||typeof r.checked!=='boolean'||r.demonstration||r.position!==0||r.help!==null
  ||(r.checked&&(!fullStoryOrder(r)||r.tries===0))
  ||r.solved!==(r.checked&&storyCorrect(r))||(!r.solved&&r.misses!==r.tries)||(r.solved&&r.misses!==0))throw Error('Ungültige Bildergeschichte.');
 return {order:[...r.order],checked:r.checked};
}
