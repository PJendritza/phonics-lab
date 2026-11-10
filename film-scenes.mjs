import {sprite} from './picture-sprites.mjs?v=45f8c9e435d7';
import {FILM_FRAMES} from './film-data.mjs?v=45f8c9e435d7';
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const lerp=(a,b,t)=>a+(b-a)*t;
const part=(id,art,w,h,x,y,opacity=1,angle=0)=>({id,art,w,h,x,y,opacity,angle});
export function filmState(kind,time){
 const t=clamp(time),a=clamp(t*3),b=clamp(t*3-1),c=clamp(t*3-2);
 if(kind==='dog'){
  const walkX=lerp(52,130,smooth(b)),fade=smooth((t-.64)/.06),pickup=smooth((t-.27)/.08);
  const hatX=t<2/3?lerp(105,walkX+73,pickup):lerp(203,181,smooth(c*3));
  const hatY=t<2/3?lerp(118,95,pickup):lerp(95,123,smooth(c*3));
  return [part('tree','baum',83,135,155,6),part('sniff','film_hund_sucht',99,75,lerp(14,52,smooth(a)),75,1-smooth((t-.29)/.05)),part('walk','film_hund_laeuft',99,75,walkX,70+Math.sin(b*24)*1.3,smooth((t-.29)/.05)*(1-fade)),part('sleep','film_hund_schlaeft',83,59,131,93,fade),part('hat','hut',38,30,hatX,hatY,1,t<2/3?-13*pickup:0)];
 }
 if(kind==='frog'){
  const rollX=lerp(79,153,smooth(b)),jumping=t<1/3||t>2/3;
  let x,y;
  if(t<1/3){x=lerp(20,88,smooth(a));y=lerp(102,47,a)-Math.sin(a*Math.PI)*50;}
  else if(t<2/3){x=rollX+8;y=47+Math.sin(b*10)*2;}
  else{x=lerp(161,106,smooth(c));y=lerp(47,102,c)-Math.sin(c*Math.PI)*35;}
  const final=smooth((c-.7)/.25),seated=t>=1/3&&t<=2/3?1:final;
  const ball=part('ball','ball',67,65,t<2/3?rollX:lerp(153,173,smooth(c)),97,1,b*270+c*100);ball.pivot={x:33.5,y:32.5};
  return [part('grass','film_wiese',94,31,93,125),ball,part('frog-sit','film_frosch_sitzt',64,61,x,y,seated,t<2/3?Math.sin(b*7)*12:0),part('frog-jump','film_frosch_springt',74,58,x,y,jumping?1-final:0)];
 }
 if(kind==='cat'){
  const angle=t<1/3?0:-55*smooth(b);
  const jumpX=lerp(13,149,smooth(a)),jumpY=lerp(103,78,a)-Math.sin(a*Math.PI)*63;
  const jumpOpacity=1-smooth((a-.82)/.18);
  const peek=part('cat-peek','film_katze_schaut',55,51,156,lerp(105,61,smooth(c)),smooth(c*2),angle);
  peek.pivot={x:139-peek.x,y:151-peek.y};
  const box=part('box','film_kiste',87,66,139,85,1,angle);box.pivot={x:0,y:66};
  return [box,part('cat-jump','film_katze_springt',91,64,jumpX,jumpY,jumpOpacity),peek];
 }
 throw Error('Unknown animated story.');
}
const transform=p=>`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.angle.toFixed(2)} ${p.pivot?.x??p.w/2} ${p.pivot?.y??p.h})`;
export function filmMarkup(kind,time=0){
 return `<svg class="story-film-scene" viewBox="0 0 240 160" aria-hidden="true" focusable="false" data-film="${kind}"><ellipse cx="121" cy="146" rx="110" ry="8" fill="#e5ebdd"/>${filmState(kind,time).map(p=>`<g data-film-part="${p.id}" transform="${transform(p)}" opacity="${p.opacity.toFixed(3)}">${sprite(p.art,0,0,p.w,p.h)}</g>`).join('')}</svg>`;
}
export function paintFilm(svg,kind,time){
 for(const p of filmState(kind,time)){
  const node=svg.querySelector(`[data-film-part="${p.id}"]`);node.setAttribute('transform',transform(p));node.setAttribute('opacity',p.opacity.toFixed(3));
 }
 svg.dataset.time=time.toFixed(3);
}
export function filmFrame(id){const frame=FILM_FRAMES[id];return filmMarkup(frame.film,frame.time).replace('viewBox="0 0 240 160"',`viewBox="${frame.viewBox}"`);}
