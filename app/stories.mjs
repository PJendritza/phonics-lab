// Three connected events, one protagonist, and unambiguous existing pictures.
// Some stories deliberately share the same cards in a different textual order.
export const STORY_VOCABULARY=['es','er','sie','dann','danach'];
const story=(id,title,sentences,frames)=>[id,{kind:'story',text:sentences.join(' '),sentences,title,frames,audio:id}];
export const STORIES=Object.fromEntries([
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

export function newStoryRound(target,rng=Math.random){
 const frames=STORIES[target].frames,choices=[...frames];
 for(let i=choices.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
 // Never hand the answer out as the initial tray order.
 if(choices.every((v,i)=>v===frames[i]))choices.push(choices.shift());
 return {target,choices,cue:target,demonstration:false,tries:0,position:0,solved:false,help:null,misses:0,assisted:false,order:[],checked:false};
}
export const storyCorrect=r=>STORIES[r.target].frames.every((v,i)=>r.order[i]===v)&&r.order.length===STORIES[r.target].frames.length;
export function editStoryRound(r,frame){
 if(r.solved||!r.choices.includes(frame))return r;
 const order=r.order.includes(frame)?r.order.filter(v=>v!==frame):[...r.order,frame];
 return {...r,order,checked:false};
}
export function resetStoryRound(r){
 if(r.solved||(!r.order.length&&!r.checked))return r;
 return {...r,order:[],checked:false};
}
export function validateStoryRound(r){
 const frames=STORIES[r.target]?.frames,validOrder=v=>Array.isArray(v)&&new Set(v).size===v.length&&v.every(f=>frames.includes(f));
 if(!frames||r.choices.length!==frames.length||frames.some(f=>!r.choices.includes(f))
  ||!validOrder(r.order)||typeof r.checked!=='boolean'||r.demonstration||r.position!==0||r.help!==null
  ||(r.checked&&(r.order.length!==frames.length||r.tries===0))
  ||r.solved!==(r.checked&&storyCorrect(r))||(!r.solved&&r.misses!==r.tries)||(r.solved&&r.misses!==0))throw Error('Ungültige Bildergeschichte.');
 return {order:[...r.order],checked:r.checked};
}
