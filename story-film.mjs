import {filmMarkup,paintFilm} from './film-scenes.mjs?v=45f8c9e435d7';
import {illustration} from './pictures.mjs?v=45f8c9e435d7';
import {speaker} from './data.mjs?v=45f8c9e435d7';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function storyFilmBody(item,reduced){
 return `<section class="story-film" aria-label="Die gelöste Geschichte als Animation" data-reduced="${reduced}"><p class="subtle">${esc(item.title)}</p>
  ${reduced?`<div class="film-stills">${item.frames.map((f,i)=>`<figure>${illustration(f)}<figcaption>${esc(item.sentences[i])}</figcaption></figure>`).join('')}</div><p class="subtle">Bildergeschichte ohne Bewegung</p>`:`<div class="film-screen">${filmMarkup(item.film)}</div><p class="film-caption" aria-live="off">${esc(item.sentences[0])}</p>`}
  <div class="film-controls">${!reduced?'<button class="quiet" id="film-pause" aria-label="Film anhalten">Ⅱ</button><button class="quiet" id="film-replay" aria-label="Film noch einmal abspielen">↻</button>':''}<button class="quiet" id="film-narrate" aria-label="Geschichte zum Film anhören">${speaker}</button><button id="film-next" aria-label="Weiter zur nächsten Geschichte"><span aria-hidden="true">▶</span> Weiter</button></div></section>`;
}
export function startStoryFilm(section,item,{duration=8400,autoplay=true}={}){
 const svg=section.querySelector('.story-film-scene'),caption=section.querySelector('.film-caption');
 let elapsed=0,started=0,raf=null,playing=false,destroyed=false,lastPaint=-Infinity;
 const update=()=>{
  const progress=Math.min(1,elapsed/duration);paintFilm(svg,item.film,progress);section.dataset.progress=progress.toFixed(3);
  caption.textContent=item.sentences[Math.min(2,Math.floor(progress*3))];
  const button=section.querySelector('#film-pause');button.textContent=playing?'Ⅱ':'▶';button.setAttribute('aria-label',playing?'Film anhalten':'Film abspielen');section.dataset.playing=String(playing);
 };
 function tick(now){
  if(destroyed||!playing)return;
  elapsed=Math.min(duration,now-started);
  if(now-lastPaint>=1000/30||elapsed>=duration){lastPaint=now;if(elapsed>=duration)playing=false;update();}
  if(playing)raf=requestAnimationFrame(tick);
 }
 function play(restart=false){
  if(destroyed)return;
  cancelAnimationFrame(raf);if(restart||elapsed>=duration)elapsed=0;
  playing=true;started=performance.now()-elapsed;lastPaint=-Infinity;update();raf=requestAnimationFrame(tick);
 }
 function pause(){if(destroyed)return;playing=false;cancelAnimationFrame(raf);update();}
 function destroy(){destroyed=true;playing=false;cancelAnimationFrame(raf);}
 update();if(autoplay)play();
 return {play,pause,destroy,isPlaying:()=>playing};
}
