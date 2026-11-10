import {ITEMS,speaker} from './data.mjs';
import {illustration} from './pictures.mjs';
import {FILM_FRAMES} from './film-data.mjs';
import {fullStoryOrder} from './stories.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function storyBody(round,item,audioHelp){
 const full=fullStoryOrder(round),label=frame=>FILM_FRAMES[frame]?.text??ITEMS[frame].text;
 return `<p class="story-title subtle">${esc(item.title)}</p>
  <div class="story-text" aria-label="Geschichte">${item.sentences.map(s=>`<p>${esc(s)}</p>`).join('')}</div>
  <div class="story-audio">${audioHelp?`<button class="replay" id="replay" aria-label="Lesehilfe: Geschichte vorlesen" ${round.solved?'disabled':''}>${speaker}<span>Vorlesen</span></button>`:''}</div>
  <div class="story-slots ${round.checked?(round.solved?'order-correct':'order-retry'):''}" role="group" aria-label="Deine Bilderfolge">
   ${item.frames.map((_,i)=>{const frame=round.order[i];return `<div class="story-position" data-story-slot="${i}"><span aria-hidden="true">${i+1}</span>${frame?`<button class="story-card placed" data-story-remove="${frame}" aria-label="Platz ${i+1}: ${esc(label(frame))} Zurücklegen" ${round.solved?'disabled':''}>${illustration(frame)}</button>`:`<div class="story-empty" role="img" aria-label="Platz ${i+1} leer"></div>`}</div>`;}).join('')}
  </div>
  <div class="story-tray" role="group" aria-label="Bilder zum Ordnen">
   ${round.choices.map(frame=>`<button class="story-card ${round.order.includes(frame)?'story-used':''}" data-story-frame="${frame}" aria-label="Bild auswählen: ${esc(label(frame))}" ${round.order.includes(frame)||round.solved?'disabled':''}>${illustration(frame)}</button>`).join('')}
  </div>
  <div class="story-controls"><button id="story-reset" class="quiet" aria-label="Bilder zurücksetzen" ${!round.order.length||round.solved?'disabled':''}><span aria-hidden="true">↺</span> Zurücksetzen</button><button id="story-check" aria-label="Bilderfolge prüfen" ${!full||round.solved?'disabled':''}><span aria-hidden="true">✓</span> Prüfen</button></div>
  <p id="audio-status" class="story-status subtle" role="status">${round.solved?'Richtig.':round.checked?'Schau noch einmal in die Geschichte.':full?'Prüfe deine Bilderfolge.':'Tippe oder ziehe die Bilder in die Kästen.'}</p>`;
}
