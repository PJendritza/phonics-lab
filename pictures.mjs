// AI-generated picture-book artwork. Layout uses SVG; the objects are not hand-
// drawn SVG icons. Exact source prompts/hashes: docs/illustration-sources.json.
import {hasSprite,sprite} from './picture-sprites.mjs?v=45f8c9e435d7';
import {FILM_FRAMES} from './film-data.mjs?v=45f8c9e435d7';
import {filmFrame} from './film-scenes.mjs?v=45f8c9e435d7';
import {SCENE_ITEMS} from './mixed-reading.mjs?v=45f8c9e435d7';
export const hasPicture=id=>hasSprite(id)||id==='sieben'||/^number_[0-9]$/.test(id)||Object.hasOwn(SCENE_ITEMS,id)||Object.hasOwn(FILM_FRAMES,id);
const svg=content=>`<svg viewBox="0 0 200 150" aria-hidden="true" focusable="false">${content}</svg>`;
function placeScene(v){
 if(v.subject==='apfel'&&v.location==='baum'&&v.relation==='am')return sprite('scene_apfel_am_baum',10,0,180,148);
 const {subject,relation,location}=v,context=sprite(location==='baum'?'baum':'scene_'+location,5,2,140,140);
 let x=145,y=96,w=50,h=40;
 if(location==='bus'&&relation==='im'){x=49;y=35;w=55;h=44;}
 if(location==='haus'&&relation==='im'){x=54;y=66;w=55;h=44;}
 if(location==='tisch'){x=49;y=relation==='auf'?9:78;w=50;h=36;}
 if(location==='stuhl'){x=49;y=relation==='auf'?45:91;w=47;h=33;}
 if(location==='kiste'&&relation==='in'){x=49;y=44;w=50;h=30;}
 return context+sprite(subject,x,y,w,h);
}
export function illustration(id){
 if(!hasPicture(id))throw Error('Missing picture: '+id);
 if(Object.hasOwn(FILM_FRAMES,id))return filmFrame(id);
 if(id==='sieben'||id.startsWith('number_'))return svg(`<text x="100" y="112" text-anchor="middle" fill="#29463e" font-family="Phonics Lesson, sans-serif" font-size="112">${id==='sieben'?'7':id.slice(7)}</text>`);
 const item=SCENE_ITEMS[id];
 if(!item)return svg(sprite(id,0,0,200,150));
 const v=item.scene;
 if(v.family==='place')return svg(placeScene(v));
 if(v.family==='quantity'){
  const positions=v.count===1?[[72,48]]:v.count===2?[[34,48],[110,48]]:[[18,48],[76,48],[134,48]];
  return svg(positions.map(([x,y])=>sprite(v.subject,x,y,48,54)).join(''));
 }
 if(v.family==='size'){
  // Same reference mat in every answer, so size has a stable visual scale.
  const large=v.size==='gross',size=large?102:45;
  return svg(`<ellipse cx="100" cy="125" rx="82" ry="10" fill="#e2e9df"/>`+sprite(v.subject,100-size/2,125-size,size,size));
 }
 if(v.family==='possession')return svg(sprite(v.subject,20,28,100,100)+sprite(v.object,116,78,53,50));
 if(v.family==='action'){
  if(v.object&&v.action==='hat')return svg(sprite(v.subject,20,28,100,100)+sprite(v.object,116,78,53,50));
  const suffix=v.object&&v.action!=='liest'?'_'+v.object:'';
  return svg(sprite('action_'+v.subject+'_'+v.action+suffix,20,12,160,128));
 }
 if(v.family==='pair')return svg(sprite('scene_tisch',15,5,170,140)+sprite(v.first??'ball',51,(v.upper??v.ball)==='oben'?17:85,36,30)+sprite(v.second??'hut',111,(v.lower??v.hut)==='oben'?17:85,36,30));
 throw Error('Unknown scene family');
}
