import {TASK_GUIDES} from './task-guides.mjs';
import {STAGES,ITEMS,AVATARS,stageById,stageNumber,skillKey,label,lettersFor,CONTEXTS,choiceFeedback,speaker} from './data.mjs';
import {illustration} from './pictures.mjs';
import {CHAPTERS} from './level-catalog.mjs';
import {stepsFor,currentStep,stepById,stepStats} from './reading-path.mjs';
import {etappeMap,readingReport} from './reading-path-view.mjs';
import {storyBody} from './story-view.mjs';
import {bindStoryDrag} from './story-drag.mjs';
import {storyFilmBody,startStoryFilm} from './story-film.mjs';
import {readStored,saveStored,activeProfile,createProfile,validateStore,freshProgress,startSession,answer,advance,recommended,availableThrough,mastered,stageMastered,levelProgress,showHelp,resumePractice,useReadingHelp,readingAudioAvailable,duePractice,startReview,arrangeStory,placeStoryFrame,resetStory} from './learning.mjs';
import {playAudio,stopAudio,playSuccess,stopFeedback} from './audio.mjs';
const root=document.querySelector('#app');let storage;try{storage=window.localStorage;}catch{}
let {store,warning}=readStored(storage),heard=false,previewAll=false,pendingImport=null;
let transition=null,viewToken=0,keyboardMode=false;
let storyDrag=null,filmPlayer=null;
document.addEventListener('keydown',()=>{keyboardMode=true;});document.addEventListener('pointerdown',()=>{keyboardMode=false;});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const profile=()=>activeProfile(store),progress=()=>profile().progress;
function save(){if(!saveStored(storage,store))warning='Speichern ist gerade nicht möglich. Üben geht trotzdem. Sichere die Profile im Elternbereich als Datei.';}
function setProgress(p){profile().progress=p;save();}
function announcement(text){const node=document.querySelector('#audio-status');if(node)node.textContent=text;}
function play(ids,done=()=>{}){playAudio(ids,done,()=>announcement('Der Ton konnte nicht starten. Tippe noch einmal auf den Lautsprecher.'));}
function leave(){viewToken++;clearTimeout(transition);transition=null;storyDrag?.cancel();filmPlayer?.destroy();filmPlayer=null;stopAudio();stopFeedback();heard=false;}
function flower(fraction=1,size=120,petals=9){
 const count=Math.min(12,Math.max(6,petals)),headY=100-45*fraction;
 return `<svg class="progress-flower" viewBox="0 0 120 140" width="${size}" aria-hidden="true"><path d="M60 129V${headY+12}" stroke="#548067" stroke-width="5" stroke-linecap="round"/><g opacity="${Math.min(1,fraction*2)}"><path d="M60 113Q26 88 40 117Q50 124 60 113M60 101Q94 80 82 108Q70 117 60 101" fill="#a0b78c"/></g><g class="flower-head" transform="translate(0 ${headY-55})">${Array.from({length:count},(_,i)=>`<ellipse cx="60" cy="28" rx="10" ry="21" transform="rotate(${i*360/count} 60 55)" fill="#dfa478" opacity="${0.18+Math.min(1,Math.max(0,fraction*count-i))*.82}"/>`).join('')}<circle cx="60" cy="55" r="${10+fraction*4}" fill="#f2d790"/></g></svg>`;
}
function field(p=progress()){const count=Math.min(18,p.sessions);return `<div class="flower-field" role="img" aria-label="${p.sessions} gesammelte Blumen">${Array.from({length:count},(_,i)=>`<span style="--flower-hue:${i%4*25}deg">${flower(1,56,6+i%4)}</span>`).join('')}</div>`;}
function playButton(id,text='Los geht’s'){return `<button class="play-main" id="${id}" aria-label="${text}"><svg class="play-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="M8 4 28 16 8 28Z" fill="currentColor"/></svg><span>${text}</span></button>`;}
function home(){
 leave();const p=profile(),state=p.progress,done=!state.pending&&!recommended(state),due=duePractice(state).reduce((n,s)=>n+s.targets.length,0);
 root.innerHTML=`<section class="home minimal-home"><div class="learner-row">${store.profiles.map(l=>`<button class="learner ${l.id===p.id?'selected':''}" data-profile="${l.id}" aria-label="Profil ${esc(l.name)}" aria-pressed="${l.id===p.id}"><span>${l.avatar}</span><small>${esc(l.name)}</small></button>`).join('')}<button class="add-learner" id="add-home" aria-label="Neues Profil hinzufügen">＋</button></div>${playButton('play',done?'Level auswählen':state.pending?'Fortsetzen':'Los geht’s')}${done?'<p class="subtle">Alle Level geschafft. Wähle selbst, was du noch einmal üben möchtest.</p>':''}${due?`<button class="review-home quiet" id="review-home" aria-label="${due} fällige Wiederholungen"><span aria-hidden="true">↻</span> Wiederholen <small>${due}</small></button>`:''}<button class="collection-link quiet" id="collection" aria-label="Blumen ansehen">✿ ${state.sessions}</button>${warning?`<p class="notice">${esc(warning)}</p>`:''}</section>`;
 root.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{store.activeId=b.dataset.profile;save();home();});document.querySelector('#add-home').onclick=()=>settings(true);document.querySelector('#play').onclick=()=>begin();document.querySelector('#collection').onclick=collection;if(due)document.querySelector('#review-home').onclick=beginReview;
}
function collection(){leave();root.innerHTML=`<section class="panel collection"><button id="back" class="quiet">← Zurück</button><h1>Deine Blumen</h1>${field()}<p>${progress().sessions} Blumen gesammelt.</p>${playButton('play','Weiterlernen')}</section>`;document.querySelector('#back').onclick=home;document.querySelector('#play').onclick=()=>begin();}
function begin(stageId=null,etappeId=null){
 leave();window.scrollTo({top:0,behavior:'instant'});
 if(stageId)setProgress(startSession(progress(),stageId,Math.random,Date.now(),etappeId));
 else if(!progress().pending){const next=recommended(progress());if(!next){path();return;}setProgress(startSession(progress(),next.id));}
 const r=progress().pending.round;if(r.help==='pending')setProgress(showHelp(progress()));else if(r.help==='ack')setProgress(resumePractice(progress()));if(progress().pending.round.solved&&!ITEMS[r.target]?.film)advanceNow();else renderRound(true);
}
function beginReview(){const next=startReview(progress());if(next===progress())return;setProgress(next);begin();}
function advanceNow(){clearTimeout(transition);transition=null;const result=advance(progress());setProgress(result.progress);heard=false;if(result.completed)complete(result);else renderRound(true);}
function scheduleHelpReturn(){const mine=viewToken;clearTimeout(transition);transition=setTimeout(()=>{if(mine===viewToken&&progress().pending?.round.help==='ack'){setProgress(resumePractice(progress()));renderRound(true);}},340);}
function afterWrongAudio(){if(progress().pending?.round.help==='pending'){setProgress(showHelp(progress()));renderRound(true);}else {enableAnswers();announcement('Versuch es noch einmal.');}}
function scheduleAdvance(){const mine=viewToken;clearTimeout(transition);transition=setTimeout(()=>{if(mine===viewToken&&progress().pending?.round.solved)advanceNow();},340);}
function path(){
 leave();window.scrollTo({top:0,behavior:'instant'});
 const p=progress(),through=availableThrough(p),current=p.pending?.stageId??recommended(p)?.id;
 const due=new Map(duePractice(p).map(s=>[s.stageId,s.targets.length]));
 const available=(s,i)=>previewAll||p.stages[s.id]?.passed||i<=through;
 const node=s=>{
  const i=stageNumber(s.id)-1,done=p.stages[s.id]?.passed,secure=s.targets.filter(t=>mastered(p.skills[skillKey(s,t)])).length,saved=p.pending?.stageId===s.id||Object.values(p.paused??{}).some(v=>v.stageId===s.id),steps=stepsFor(s),step=currentStep(p,s);
  const detail=steps.length?`${steps.filter(v=>stepStats(p,v).completed).length}/${steps.length} Etappen · ${esc(step.title)}`:`${secure}/${s.targets.length} sicher geübt`;
  return `<div class="stage-block"><button class="stage-node ${s.color} ${done?'passed':''}" data-stage="${s.id}" ${s.id===current?'aria-current="step"':''} ${available(s,i)?'':'disabled'}><span class="stage-number">${i+1}</span><span><strong>Level ${i+1} · ${s.title}</strong><small class="activity-label">${s.activity}</small><small>${s.short}</small><small>${done?s.mode==='order'&&!stageMastered(p,s)?'✓ Bisheriger Abschluss · neue Geschichten':'✓ Erreicht':saved?'Angefangen':available(s,i)?'Zum Üben':'Kommt später'} · ${detail}${due.has(s.id)?` · ↻ ${due.get(s.id)} fällig`:''}</small></span><span aria-hidden="true">${available(s,i)?'▶':'○'}</span></button>${etappeMap(p,s,available(s,i))}</div>`;
 };
 root.innerHTML=`<div class="panel level-map"><button class="quiet" id="back">← Zurück</button><h1>Deine Level</h1>${p.pending?`<button class="quiet resume-path" id="resume-path">▶ Level ${stageNumber(p.pending.stageId)} fortsetzen</button>`:''}<label class="subtle preview-toggle"><input id="preview" type="checkbox" ${previewAll?'checked':''}> Für Eltern: alle Level zum Ausprobieren freigeben</label><nav class="level-grid" aria-label="Level direkt auswählen">${STAGES.map((s,i)=>`<button class="level-shortcut" data-level="${s.id}" aria-label="Level ${i+1}: ${s.title}" ${s.id===current?'aria-current="step"':''} ${available(s,i)?'':'disabled'}>${i+1}${p.stages[s.id]?.passed?'<small aria-hidden="true">✓</small>':''}</button>`).join('')}</nav><div class="grouped-path">${CHAPTERS.map(c=>`<section class="level-chapter" aria-labelledby="chapter-${c.id}"><h2 id="chapter-${c.id}">${c.title}<small>Level ${c.from}–${c.to}</small></h2><div class="stage-path">${STAGES.filter(s=>s.chapter===c.id).map(node).join('')}</div></section>`).join('')}</div><p class="subtle">Angefangene Aufgaben bleiben beim Levelwechsel erhalten. Frühere Level kannst du selbst wählen. Fällige Wiederholungen findest du auch auf der Startseite unter ↻. „Erreicht“ bezeichnet unsere Übungsregel, keinen Lesetest.</p></div>`;
 document.querySelector('#back').onclick=home;if(p.pending)document.querySelector('#resume-path').onclick=()=>begin();
 document.querySelector('#preview').onchange=e=>{previewAll=e.target.checked;path();};root.querySelectorAll('[data-stage],[data-level]').forEach(b=>b.onclick=()=>begin(b.dataset.stage??b.dataset.level));
 root.querySelectorAll('[data-etappe]').forEach(b=>b.onclick=()=>begin(b.dataset.readingStage,b.dataset.etappe));
 // Reopening the map from a reading task shows its Etappen immediately instead
 // of making a phone user scroll past the preceding thirty-two levels.
 const mine=viewToken;
 if(stepsFor(current??'').length||current==='story_order')requestAnimationFrame(()=>{if(mine===viewToken)root.querySelector(`[data-stage="${current}"]`)?.scrollIntoView({block:'start',behavior:'instant'});});
}

function sparkles(){return `<span class="answer-sparkle" aria-hidden="true">${Array.from({length:7},(_,i)=>`<i style="--dx:${Math.cos(i*2*Math.PI/7)*46}px;--dy:${Math.sin(i*2*Math.PI/7)*42}px;--turn:${i*47}deg;--spark-color:${['#bd7139','#5e8454','#c7a537'][i%3]}"></i>`).join('')}</span>`;}
function meter(reward=false){const p=levelProgress(progress());return `<div class="level-progress ${reward?'rewarded':''}" role="progressbar" aria-label="Fortschritt zum Rundenziel" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.value}" aria-valuetext="${Math.floor(p.value)} von ${p.total} Aufgaben"><div class="meter-flower">${flower(p.ratio,78,p.total)}${reward?sparkles():''}</div><div class="meter-track"><span class="meter-fill" style="width:${p.ratio*100}%"></span></div><span class="meter-count">${Math.floor(p.value)}/${p.total}</span></div>`;}
function enableAnswers(){heard=true;announcement('');root.querySelectorAll('[data-choice],#syllable-help').forEach(b=>b.disabled=!!progress().pending?.round.solved||progress().pending?.round.help==='ack');if(keyboardMode&&!progress().pending?.round.solved)root.querySelector('[data-choice]')?.focus({preventScroll:true});}
function disableAnswers(){heard=false;root.querySelectorAll('[data-choice],#syllable-help').forEach(b=>b.disabled=true);}
function readingText(item,stage,help){
 if(!help||item.kind!=='word')return esc(item.text);
 const marked=text=>{
  const patterns=(stage.focus??[]).join('|');
  if(!patterns)return esc(text);
  return text.split(new RegExp('('+patterns+')','ig')).map(part=>stage.focus.some(f=>f===part.toLowerCase())?`<mark>${esc(part)}</mark>`:esc(part)).join('');
 };
 return (item.syllables??[item.text]).map((part,i)=>`<span class="reading-syllable syllable-${i%2}">${marked(part)}</span>`).join('');
}
function renderRound(playCue=true,feedbackCorrect=null,selected=null){
 storyDrag?.cancel();filmPlayer?.destroy();filmPlayer=null;
 const p=progress(),session=p.pending;if(!session){home();return;}
 if(stageById(session.stageId).mode==='order'){renderStoryRound(feedbackCorrect);return;}
 const s=stageById(session.stageId),r=session.round,word=s.mode==='build',picture=s.mode==='picture',item={...ITEMS[r.target],...(r.cue===ITEMS[r.target]?.shortAudio?{text:ITEMS[r.target].shortText}:{})},letters=word?lettersFor(r.target):[],finished=r.solved;
 const feedback=feedbackCorrect===false&&selected?choiceFeedback(s,selected):null;
 const teaching=r.help==='show'||r.help==='ack',expected=word?letters[r.position]?.toLowerCase():r.target;
 const title=TASK_GUIDES[s.instruction],audioHelp=picture&&readingAudioAvailable(p);
 const steps=stepsFor(s),etappe=stepById(session.etappeId),stepLabel=etappe?`Etappe ${steps.indexOf(etappe)+1}/${steps.length} · ${etappe.title}`:steps.length?session.returnTo!==undefined?'Wiederholung':'Bisherige Runde fortsetzen':'';
 const options=r.choices.map(c=>{
  const content=picture?illustration(ITEMS[c].picture):!word&&teaching&&s.focus&&ITEMS[c]?.kind==='word'?readingText(ITEMS[c],s,true):esc(word?c:label(s,c));
  if(teaching&&c!==expected)return `<span class="tile help-placeholder" aria-hidden="true">${content}</span>`;
  return `<button class="tile ${finished&&(word||c===r.target)?'good':''} ${feedbackCorrect===false&&c===selected?'wrong':''} ${!finished&&teaching&&c===expected?'hint':''}" data-choice="${c}" ${picture?`aria-label="Bild: ${esc(ITEMS[c].text)}"`:''} ${!heard||finished||r.help==='ack'?'disabled':''}>${content}</button>`;
 }).join('');
 root.innerHTML=`<section class="session auto-session ${picture?'reading-session':''}">
  <div class="session-top"><button class="quiet pause" id="back" aria-label="Pause und zur Startseite">⌂</button><button class="quiet level-jump ${stepLabel?'with-etappe':''}" id="level-menu" aria-label="Level ${stageNumber(s.id)}: ${s.title}. ${esc(stepLabel)}. Level auswählen"><span>Level ${stageNumber(s.id)} · ${s.title} ▾</span>${stepLabel?`<small>${esc(stepLabel)}</small>`:''}</button></div>
  ${meter(feedbackCorrect===true)}<h1 class="task-instruction"><span>${esc(title)}</span><button class="task-info" id="instruction-info" aria-label="Anleitung anhören" title="Anleitung anhören" ${finished?'disabled':''}>ⓘ</button></h1>
  ${picture?`<div class="reading-prompt ${item.kind!=='word'?'sentence-prompt':''}" aria-label="${esc(item.text)}">${readingText(item,s,r.assisted||teaching)}</div>`:''}
  <div class="reading-tools">${!picture||audioHelp?`<button class="replay" id="replay" aria-label="${picture?'Lesehilfe: Text vorlesen':'Ton noch einmal anhören'}" ${finished?'disabled':''}>${speaker}<span>${picture?'Vorlesen':'Anhören'}</span></button>`:''}${picture&&item.kind==='word'&&(s.support||s.focus)?`<button class="quiet" id="syllable-help" aria-label="Silben und Bausteine als Lesehilfe zeigen" ${finished||!heard?'disabled':''}>◒ <span>Hilfe</span></button>`:''}</div>
  <div id="audio-status" class="audio-status subtle" role="status">${feedback?esc(feedback.text):picture?(audioHelp?'Du kannst dir den Text jetzt vorlesen lassen.':''):heard?'':'Hör erst einmal zu.'}</div>
  ${word?`${r.demonstration?`<div class="word-model" aria-label="Vorbild ${esc(item.text)}">${esc(item.text)}</div>`:''}<div class="slots" aria-label="Wort mit ${letters.length} Bausteinen">${letters.map((letter,i)=>`<span class="slot ${i===r.position?'active':''}">${i<r.position?letter:''}</span>`).join('')}</div>`:''}
  <div class="tiles ${picture?'picture-tiles':word?'bank':''} ${!picture&&(s.group==='read'||(!word&&!CONTEXTS[s.mode]&&r.choices.some(c=>label(s,c).length>3)))?'word-tiles':''} ${CONTEXTS[s.mode]?'phoneme-tiles':''}" ${word||CONTEXTS[s.mode]?`style="--bank-columns:${r.choices.length}"`:''}>${options}</div>
  <div class="feedback-area"><span id="feedback" class="feedback ${feedbackCorrect===true?'correct-flash':''}" role="status">${feedbackCorrect===true?'<span aria-hidden="true">✓</span><span class="sr-only">Richtig.</span>':''}</span></div>
 </section>`;
 document.querySelector('#back').onclick=home;document.querySelector('#level-menu').onclick=path;
 const cue=()=>s.mode==='ending'&&r.demonstration&&r.target==='n'?['an','in']:[r.cue];
 const listen=(instruction=false)=>{disableAnswers();announcement('Hör erst einmal zu.');const prefix=instruction?[word&&r.demonstration&&s.id==='build'?'model':s.instruction]:[];play([...prefix,...cue()],enableAnswers);};
 const readingHelp=(withAudio)=>{
  if(withAudio&&!readingAudioAvailable(progress()))return;
  setProgress(useReadingHelp(progress(),withAudio));renderRound(false);
  if(withAudio){disableAnswers();announcement('Lesehilfe: Hör zu und lies mit.');play(cue(),enableAnswers);}
 };
 const replay=document.querySelector('#replay');if(replay)replay.onclick=()=>{if(progress().pending?.round.help==='pending'){setProgress(showHelp(progress()));renderRound(true);}else if(picture)readingHelp(true);else listen(false);};
 document.querySelector('#instruction-info').onclick=()=>{
  if(finished)return;disableAnswers();announcement('Hör die Anleitung.');
  if(picture)playAudio([s.instruction],enableAnswers,()=>{enableAnswers();announcement('Die Anleitung konnte nicht starten.');});
  else listen(true);
 };
 const helpButton=document.querySelector('#syllable-help');if(helpButton)helpButton.onclick=()=>readingHelp(false);
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
  if(!heard||progress().pending?.round.solved)return;
  const selected=b.dataset.choice,result=answer(progress(),selected);setProgress(result.progress);
  if(!result.correct)heard=false;
  renderRound(false,result.correct,selected);
  if(result.correct){stopAudio();playSuccess();if(result.teaching)scheduleHelpReturn();else if(result.finished)scheduleAdvance();}
  else {const ids=choiceFeedback(s,selected).audio;if(ids.length)play(ids,afterWrongAudio);else afterWrongAudio();}
  if(!result.finished&&keyboardMode&&heard)root.querySelector(`[data-choice="${selected}"]`)?.focus({preventScroll:true});
 });
 if(playCue){
  heard=false;
  if(finished)scheduleAdvance();
  else if(picture){
   // Reading answers and directions are never spoken automatically. Audio help
   // appears only after two wrong attempts, including in the teaching view.
   enableAnswers();
  }else listen(false);
 }
}

function renderStoryRound(feedbackCorrect=null){
 const p=progress(),s=stageById(p.pending.stageId),r=p.pending.round,item=ITEMS[r.target];
 if(r.solved&&item.film){renderSolvedFilm(s,item);return;}
 root.innerHTML=`<section class="session auto-session story-session"><div class="session-top"><button class="quiet pause" id="back" aria-label="Pause und zur Startseite">⌂</button><button class="quiet level-jump" id="level-menu" aria-label="Level ${stageNumber(s.id)}: ${s.title}. Level auswählen">Level ${stageNumber(s.id)} · ${s.title} ▾</button></div>
  ${meter(feedbackCorrect===true)}<h1 class="task-instruction"><span>${esc(TASK_GUIDES[s.instruction])}</span><button class="task-info" id="instruction-info" aria-label="Anleitung anhören" ${r.solved?'disabled':''}>ⓘ</button></h1>${storyBody(r,item,readingAudioAvailable(p))}</section>`;
 document.querySelector('#back').onclick=home;document.querySelector('#level-menu').onclick=path;
 root.querySelectorAll('[data-story-frame],[data-story-remove]').forEach(b=>b.onclick=event=>{
  if(event.detail!==0)return; // Physical taps are handled once by Pointer Events.
  const frame=b.dataset.storyFrame??b.dataset.storyRemove;
  setProgress(arrangeStory(progress(),frame));renderRound(false);
  if(keyboardMode){const selector=b.dataset.storyFrame?`[data-story-remove="${frame}"]`:`[data-story-frame="${frame}"]`;root.querySelector(selector)?.focus({preventScroll:true});}
 });
 document.querySelector('#story-reset').onclick=()=>{setProgress(resetStory(progress()));renderRound(false);if(keyboardMode)root.querySelector('[data-story-frame]')?.focus({preventScroll:true});};
 document.querySelector('#story-check').onclick=()=>{
  const result=answer(progress(),r.target);setProgress(result.progress);renderRound(false,result.correct);
  if(result.finished){stopAudio();playSuccess();if(!item.film)scheduleAdvance();}
  else if(keyboardMode)root.querySelector('[data-story-remove]')?.focus({preventScroll:true});
 };
 const listen=withAnswer=>{
  if(withAnswer&&!readingAudioAvailable(progress()))return;
  if(withAnswer)setProgress(useReadingHelp(progress(),true));
  stopAudio();root.querySelectorAll('button:not(#back):not(#level-menu)').forEach(b=>b.disabled=true);
  announcement(withAnswer?'Lies mit und höre zu.':'Hör die Anleitung.');
  const mine=viewToken,finish=()=>{if(mine===viewToken&&progress().pending?.stageId===s.id)renderRound(false);};
  playAudio([withAnswer?r.cue:s.instruction],finish,()=>{finish();announcement('Der Ton konnte nicht starten. Du kannst weiter ordnen.');});
 };
 document.querySelector('#instruction-info').onclick=()=>listen(false);
 const replay=document.querySelector('#replay');if(replay)replay.onclick=()=>listen(true);
 if(r.solved)scheduleAdvance();
}

function renderSolvedFilm(stage,item){
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 root.innerHTML=`<section class="session auto-session story-session story-after-film"><div class="session-top"><button class="quiet pause" id="back" aria-label="Pause und zur Startseite">⌂</button><button class="quiet level-jump" id="level-menu" aria-label="Level ${stageNumber(stage.id)}: ${stage.title}. Level auswählen">Level ${stageNumber(stage.id)} · ${stage.title} ▾</button></div>${meter(true)}${storyFilmBody(item,reduced)}</section>`;
 document.querySelector('#back').onclick=home;document.querySelector('#level-menu').onclick=path;
 const section=root.querySelector('.story-film');
 if(!reduced){
  filmPlayer=startStoryFilm(section,item);
  document.querySelector('#film-pause').onclick=()=>{stopAudio();if(filmPlayer.isPlaying())filmPlayer.pause();else filmPlayer.play();};
  document.querySelector('#film-replay').onclick=()=>{stopAudio();filmPlayer.play(true);};
 }
 document.querySelector('#film-narrate').onclick=()=>{stopAudio();filmPlayer?.play(true);play([item.audio]);};
 document.querySelector('#film-next').onclick=()=>{stopAudio();filmPlayer?.destroy();filmPlayer=null;advanceNow();};
}

function complete(result){
 leave();const p=progress(),next=recommended(p),level=stageNumber(result.stageId);
 const etappe=stepById(result.etappeId),steps=stepsFor(result.stageId),nextStep=next?currentStep(p,next):null;
 const label=next?result.review?'Weiterlernen':next.id===result.stageId&&nextStep?`Etappe ${stepsFor(next).indexOf(nextStep)+1} ${nextStep.id===etappe?.id?'weiterüben':'starten'}`:`Level ${stageNumber(next.id)} ${next.id===result.stageId?'weiterüben':'starten'}`:'Level auswählen';
 root.innerHTML=`<section class="session completion"><p class="subtle">Level ${level} · ${esc(stageById(result.stageId).title)}${etappe?`<br>Etappe ${steps.indexOf(etappe)+1}/${steps.length} · ${esc(etappe.title)}`:''}</p><h1>${result.review?'Wiederholung geschafft!':!next?'Alle Level geschafft!':result.etappeFirst?'Etappe geschafft!':'Eine neue Blume!'}</h1><div class="full-flower">${flower(1,160,result.goal??14)}</div><div class="completion-meter" role="progressbar" aria-label="Rundenziel erreicht" aria-valuemin="0" aria-valuemax="${result.goal??14}" aria-valuenow="${result.goal??14}"><span></span></div>${playButton('continue',label)}${field(p)}<button class="quiet" id="home">⌂ Startseite</button></section>`;
 document.querySelector('#continue').onclick=()=>begin();document.querySelector('#home').onclick=home;
}
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function settings(add=false){leave();pendingImport=null;const p=profile(),state=p.progress;
 root.innerHTML=`<div class="panel"><button class="quiet" id="back">← Zur Startseite</button><h1>Für Eltern</h1><p><a href="words.html">Alle Wörter alphabetisch ansehen</a></p><p>Bis zu acht Profile auf diesem Gerät. Jedes hat einen eigenen Lernpfad und setzt seine angefangene Übung fort. Keine Anmeldung und keine Übertragung an einen Server. Eine Sicherungsdatei kann alle Profile auf ein anderes Gerät mitnehmen.</p>${warning?`<p class="notice">${esc(warning)}</p>`:''}<section><h2>Wer lernt?</h2><div class="learner-row">${store.profiles.map(l=>`<button class="learner ${l.id===p.id?'selected':''}" data-profile="${l.id}" aria-pressed="${l.id===p.id}"><span>${l.avatar}</span><small>${esc(l.name)}</small></button>`).join('')}</div><label>Name oder Spitzname<input id="rename" maxlength="24" value="${esc(p.name)}"></label><label>Bild<select id="avatar">${AVATARS.map(a=>`<option ${a===p.avatar?'selected':''}>${a}</option>`).join('')}</select></label><p class="subtle">${state.sessions} abgeschlossene Runden · ${state.sessions} Blumen</p><button class="quiet" id="delete" ${store.profiles.length===1?'disabled':''}>Dieses Profil entfernen</button><div id="delete-confirm"></div></section><section id="add-section"><h2>Ein neues Profil</h2><form id="new-profile"><label>Spitzname (optional)<input id="new-name" maxlength="24" placeholder="Zum Beispiel: Fuchs"></label><label>Bild<select id="new-avatar">${AVATARS.map((a,i)=>`<option ${i===store.profiles.length%AVATARS.length?'selected':''}>${a}</option>`).join('')}</select></label><button ${store.profiles.length>=8?'disabled':''}>Profil hinzufügen</button><p class="subtle">${store.profiles.length}/8 Profile. Ein Spitzname reicht.</p></form></section><section><h2>Sichern & mitnehmen</h2><button id="export">Alle Profile sichern</button><p><label for="import">Sicherung laden (JSON)</label></p><input type="file" id="import" accept="application/json,.json"><p id="import-status" role="status"></p><button id="confirm-import" hidden>Diese Sicherung laden und vorhandene Profile ersetzen</button><p class="subtle">Auch Sicherungen der ersten Demo werden übernommen. Browserdaten können gelöscht werden; bitte gelegentlich eine Sicherung aufheben.</p></section>${readingReport(state)}<section><h2>Level und Etappen</h2>${STAGES.map((s,i)=>{const secure=s.targets.filter(t=>mastered(state.skills[skillKey(s,t)])).length,steps=stepsFor(s),detail=steps.length?`${steps.filter(e=>stepStats(state,e).completed).length}/${steps.length} Etappen abgeschlossen`:state.stages[s.id]?.passed?s.mode==='order'&&!stageMastered(state,s)?'✓ Bisheriger Abschluss · neue Geschichten':'✓ erreicht':`${secure}/${s.targets.length} Ziele sicher geübt`;return `<p>Level ${i+1} · ${s.title}: ${detail} · ${state.stages[s.id]?.completed??0} Runden</p>`;}).join('')}<p class="subtle">Ein Ziel gilt nach mindestens zwei eigenständigen richtigen Antworten und mindestens 75 % in den letzten bis zu vier Antworten als geübt. Ein-Feld-Einführungen zählen nicht. Vorgelesene oder mit Silbenhilfe gelöste Leseaufgaben zählen als unterstützt. Wörter mit Fehlern kommen nach anderen Aufgaben wieder. Sichere Wörter werden nach längeren Abständen wiederholt: zunächst nach einem Tag, dann nach drei, sieben, vierzehn und dreißig Tagen. ↻ startet freiwillige fällige Wiederholungen, ohne den Lernpfad zurückzusetzen. In den Leseleveln 33–35 gibt es vier Etappen und kurze Runden mit 8–12 Aufgaben. Für den Etappenabschluss braucht es mindestens zwei Runden, verschiedene Aufgaben und zuletzt mindestens 80 % eigenständige Antworten. In jeder vierten Aufgabe können fällige Inhalte früherer Etappen wiederkommen. Andere Rundenziele passen sich dem Übungsbedarf an; gespeicherte Ziele bleiben erhalten. Das ist eine Übungsregel, keine Diagnose; Antwortgeschwindigkeit spielt keine Rolle.</p><button id="open-path">Level auswählen</button></section><section><button class="quiet" id="reset">Nur diesen Lernstand zurücksetzen</button><div id="reset-confirm"></div></section></div>`;
 document.querySelector('#back').onclick=home;document.querySelector('#open-path').onclick=path;root.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{store.activeId=b.dataset.profile;save();settings();});
 document.querySelector('#rename').onchange=e=>{profile().name=e.target.value.trim().slice(0,24)||'Mein Profil';save();settings();};document.querySelector('#avatar').onchange=e=>{profile().avatar=e.target.value;save();settings();};
 document.querySelector('#new-profile').onsubmit=e=>{e.preventDefault();if(store.profiles.length>=8)return;const p=createProfile(document.querySelector('#new-name').value||`Profil ${store.profiles.length+1}`,document.querySelector('#new-avatar').value);store.profiles.push(p);store.activeId=p.id;save();home();};
 document.querySelector('#delete').onclick=()=>{document.querySelector('#delete-confirm').innerHTML='<p class="notice">Dieses Profil und sein Lernstand werden entfernt. Andere Profile bleiben erhalten.</p><button id="delete-now">Ja, dieses Profil entfernen</button>';document.querySelector('#delete-now').onclick=()=>{if(store.profiles.length<2)return;store.profiles=store.profiles.filter(l=>l.id!==p.id);store.activeId=store.profiles[0].id;save();settings();};};
 document.querySelector('#export').onclick=()=>download(store,'phonics-lab-profile.json');document.querySelector('#import').onchange=async e=>{pendingImport=null;document.querySelector('#confirm-import').hidden=true;const f=e.target.files[0];if(!f)return;const status=document.querySelector('#import-status');try{if(f.size>4_000_000)throw Error();pendingImport=validateStore(JSON.parse(await f.text()));status.textContent=`Sicherung mit ${pendingImport.profiles.length} Profilen gefunden. Vorhandene Profile werden erst nach deiner Bestätigung ersetzt.`;document.querySelector('#confirm-import').hidden=false;}catch{status.textContent='Keine gültige Sicherung. Die vorhandenen Profile bleiben erhalten.';}};
 document.querySelector('#confirm-import').onclick=()=>{if(!pendingImport)return;store=pendingImport;pendingImport=null;save();home();};document.querySelector('#reset').onclick=()=>{document.querySelector('#reset-confirm').innerHTML='<p class="notice">Nur die Übungen dieses Profils werden zurückgesetzt. Andere Profile bleiben erhalten.</p><button id="reset-now">Ja, diesen Lernstand zurücksetzen</button>';document.querySelector('#reset-now').onclick=()=>{profile().progress=freshProgress();save();settings();};};
 if(add){document.querySelector('#add-section').scrollIntoView({block:'start'});document.querySelector('#new-name').focus({preventScroll:true});}
}
storyDrag=bindStoryDrag(root,(frame,index)=>{stopAudio();setProgress(index===undefined?arrangeStory(progress(),frame):placeStoryFrame(progress(),frame,index));renderRound(false);});
document.querySelector('#settings').onclick=()=>settings();document.querySelector('#path').onclick=path;document.querySelector('.brand').onclick=e=>{e.preventDefault();home();};home();

// Refresh due dates after a phone returns from the background; never interrupt a lesson.
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&root.querySelector('.home'))home();});
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{if(root.querySelector('.story-film'))renderRound(false);});
