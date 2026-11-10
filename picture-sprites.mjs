import {SHEETS,SPRITES} from './image-data.mjs?v=45f8c9e435d7';
export const ALIASES={becher:'ballon',kind:'action_kind_wach',katze:'action_katze_wach',hund:'action_hund_wach',ente:'action_ente_wach',frosch:'action_frosch_wach',buch:'action_buch_zu',tasche:'action_tasche_zu'};
export const hasSprite=id=>Object.hasOwn(SPRITES,ALIASES[id]??id);
export function sprite(id,x,y,width,height){
 const spec=SPRITES[ALIASES[id]??id],sheet=SHEETS[spec.sheet],url=new URL(sheet.src,import.meta.url).href;
 const scale=Math.min(width/spec.rect[2],height/spec.rect[3]),w=spec.rect[2]*scale,h=spec.rect[3]*scale;
 return `<svg x="${x+(width-w)/2}" y="${y+(height-h)/2}" width="${w}" height="${h}" viewBox="${spec.rect.join(' ')}" preserveAspectRatio="xMidYMid meet" overflow="hidden"><image href="${url}" x="0" y="0" width="${sheet.width}" height="${sheet.height}"/></svg>`;
}
