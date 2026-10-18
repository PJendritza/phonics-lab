// One media element retains the user's mobile audio gesture permission.
const element=document.querySelector('#lesson-audio');let token=0;
const release=new URL(import.meta.url).search;
export function stopAudio(){token++;element.pause();element.onended=null;element.onerror=null;}
export function playAudio(ids,done=()=>{},failed=()=>{}){
 stopAudio();const mine=token;let index=0;
 const fail=()=>{if(token===mine)failed();};
 const next=()=>{if(token!==mine)return;if(index===ids.length){done();return;}element.src=`audio/${ids[index++]}.mp3${release}`;element.onended=next;element.onerror=fail;element.play().catch(fail);};next();
}

// Nonverbal feedback is a separate tiny, preloaded sound. It must never gate the
// next exercise or replace a human speech cue, and plays directly in the tap.
const feedback=document.querySelector('#feedback-audio');
feedback.src=`audio/success.mp3${release}`;feedback.volume=0.6;
export function playSuccess(){feedback.pause();feedback.currentTime=0;feedback.play().catch(()=>{});}
export function stopFeedback(){feedback.pause();feedback.currentTime=0;}
