// One delegated Pointer Events controller for mouse, pen and touch; no framework.
// Persistent learning state changes only on a valid completed drop.
export function bindStoryDrag(root,onDrop){
 let drag=null,ghost=null,highlight=null,scrollFrame=null,lastDrop=null;
 const clearHighlight=()=>{highlight?.classList.remove('story-drop-active');highlight=null;};
 function cancel(){
  const previous=drag;drag=null;cancelAnimationFrame(scrollFrame);scrollFrame=null;
  ghost?.remove();ghost=null;clearHighlight();previous?.source.classList.remove('story-drag-source');
  try{if(previous?.source.hasPointerCapture(previous.id))previous.source.releasePointerCapture(previous.id);}catch{}
 }
 function targetAt(x,y){
  const el=document.elementFromPoint(x,y),slot=el?.closest('[data-story-slot]'),pool=el?.closest('.story-tray');
  return slot&&root.contains(slot)?slot:pool&&root.contains(pool)?pool:null;
 }
 function paint(){
  if(!drag?.active)return;
  ghost.style.transform=`translate(${drag.x-ghost.offsetWidth/2}px,${drag.y-ghost.offsetHeight/2-12}px)`;
  const target=targetAt(drag.x,drag.y);if(target!==highlight){clearHighlight();highlight=target;highlight?.classList.add('story-drop-active');}
 }
 function autoScroll(){
  if(!drag?.active)return;
  if(drag.y<48)window.scrollBy(0,-7);else if(drag.y>innerHeight-48)window.scrollBy(0,7);
  paint();scrollFrame=requestAnimationFrame(autoScroll);
 }
 root.addEventListener('pointerdown',e=>{
  // Suppress only the compatibility click belonging to the completed drag,
  // never the user's next deliberate tap after scrolling or resetting.
  lastDrop=null;
  const source=e.target.closest('[data-story-frame],[data-story-remove]');
  if(!source||source.disabled||e.button!==0||e.isPrimary===false)return;
  cancel();drag={id:e.pointerId,source,frame:source.dataset.storyFrame??source.dataset.storyRemove,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,active:false};
  try{source.setPointerCapture(e.pointerId);}catch{}
 });
 root.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  drag.x=e.clientX;drag.y=e.clientY;
  if(!drag.active&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>8){
   drag.active=true;drag.source.classList.add('story-drag-source');ghost=document.createElement('div');ghost.className='story-drag-ghost';ghost.setAttribute('aria-hidden','true');ghost.innerHTML=drag.source.innerHTML;
   const width=root.querySelector('[data-story-slot]')?.getBoundingClientRect().width??100;ghost.style.width=width+'px';document.body.append(ghost);autoScroll();
  }
  if(drag.active){e.preventDefault();paint();}
 });
 root.addEventListener('pointerup',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const saved=drag,target=saved.active?targetAt(e.clientX,e.clientY):null;
  const tapped=!saved.active&&saved.source.contains(document.elementFromPoint(e.clientX,e.clientY));
  // Handle physical taps here too: a browser may omit the compatibility click
  // on the first touch after a drag. Keyboard/assistive clicks remain native.
  if(saved.active||tapped){e.preventDefault();lastDrop={x:e.clientX,y:e.clientY,time:performance.now()};}
  cancel();
  if(target){onDrop(saved.frame,target.hasAttribute('data-story-slot')?Number(target.dataset.storySlot):null);}
  else if(tapped)onDrop(saved.frame,undefined);
 });
 root.addEventListener('pointercancel',e=>{if(drag?.id===e.pointerId)cancel();});
 root.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId)cancel();});
 root.addEventListener('dragstart',e=>{if(e.target.closest('.story-card'))e.preventDefault();});
 root.addEventListener('click',e=>{
  if(lastDrop&&e.detail!==0&&performance.now()-lastDrop.time<400&&Math.hypot(e.clientX-lastDrop.x,e.clientY-lastDrop.y)<10){lastDrop=null;e.preventDefault();e.stopImmediatePropagation();}
 },true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 return {cancel};
}
