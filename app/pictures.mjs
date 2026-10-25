// AI-generated picture-book artwork. Layout uses SVG; the objects are not hand-
// drawn SVG icons. Exact source prompts/hashes: docs/illustration-sources.json.
import {SHEETS,SPRITES} from './image-data.mjs';
const sprite=(id,x,y,width,height)=>{
 const spec=SPRITES[id],sheet=SHEETS[spec.sheet],url=new URL(sheet.src,import.meta.url).href;
 const scale=Math.min(width/spec.rect[2],height/spec.rect[3]),w=spec.rect[2]*scale,h=spec.rect[3]*scale;
 return `<svg x="${x+(width-w)/2}" y="${y+(height-h)/2}" width="${w}" height="${h}" viewBox="${spec.rect.join(' ')}" preserveAspectRatio="xMidYMid meet" overflow="hidden"><image href="${url}" x="0" y="0" width="${sheet.width}" height="${sheet.height}"/></svg>`;
};
const scenePattern=/^(ball|hut|schaf|maus)_(im|am)_(bus|haus)$/;
export const hasPicture=id=>Object.hasOwn(SPRITES,id)||id==='sieben'||scenePattern.test(id);
export function illustration(id){
 if(!hasPicture(id))throw Error('Missing picture: '+id);
 if(id==='sieben'){
  const points=[[21,4],[66,4],[111,4],[21,44],[66,44],[111,44],[66,84]];
  return `<svg viewBox="0 0 160 125" aria-hidden="true" focusable="false">${points.map(([x,y])=>sprite('ball',x,y,28,28)).join('')}</svg>`;
 }
 const match=id.match(scenePattern);
 if(!match)return `<svg viewBox="0 0 160 125" aria-hidden="true" focusable="false">${sprite(id,0,0,160,125)}</svg>`;
 const [,subject,relation,location]=match;
 const inside=relation==='im',clip='inside-'+id;
 const box=location==='bus'?{x:25,y:33,w:98,h:47,ox:49,oy:35}:{x:37,y:61,w:86,h:55,ox:54,oy:66};
 // The same object at the same scale appears either within the open cabin/room
 // or beside it. All alternatives reuse these exact backgrounds and objects.
 const object=sprite(subject,inside?box.ox:145,inside?box.oy:96,55,44);
 return `<svg viewBox="0 0 200 150" aria-hidden="true" focusable="false">${sprite('scene_'+location,5,2,140,140)}${inside?`<defs><clipPath id="${clip}"><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="4"/></clipPath></defs><g clip-path="url(#${clip})">${object}</g>`:object}</svg>`;
}
