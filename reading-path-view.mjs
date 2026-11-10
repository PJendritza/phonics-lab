import {stepsFor, currentStep, stepStats} from './reading-path.mjs?v=07c9eb6dc793';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function etappeMap(p, stage, enabled) {
  const steps = stepsFor(stage);
  if (!steps.length) return '';
  const current = p.pending?.stageId === stage.id && p.pending.etappeId
    ? steps.find(s => s.id === p.pending.etappeId) : currentStep(p,stage);
  const completed = steps.filter(s => stepStats(p,s).completed).length;
  return `<details class="etappe-map" ${p.pending?.stageId === stage.id ? 'open' : ''}>
    <summary>${completed}/${steps.length} Etappen abgeschlossen · Etappen ansehen</summary>
    <ol>${steps.map((s,i) => {
      const stats = stepStats(p,s), paused = p.pending?.etappeId === s.id || Object.values(p.paused??{}).some(v => v.etappeId === s.id);
      return `<li><button class="etappe-choice ${stats.completed?'completed':''}" data-etappe="${s.id}" data-reading-stage="${stage.id}" ${enabled?'':'disabled'} ${s.id === current?.id ? 'aria-current="step"' : ''}>
        <strong>${i+1}. ${esc(s.title)}</strong>
        <small>${esc(s.words.join(' · '))}</small>
        <small>${stats.legacy?'✓ Bisheriger Levelabschluss':stats.completed?'✓ Abgeschlossen':paused?'Angefangen':s.id===current?.id?'Als Nächstes':'Zum Üben'} · ${stats.wordsSeen}/${stats.wordsTotal} Zielwörter im Text geübt</small>
      </button></li>`;
    }).join('')}</ol><p class="subtle">Eine Etappe umfasst mehrere kurze Runden. Ihr Abschluss belohnt eigenständige Übung mit verschiedenen Aufgaben, nicht jedes Wort des gesamten Satzvorrats.</p>
  </details>`;
}
const PATTERNS = {place:'Ortsangaben',quantity:'Mengen',size:'Größen',possession:'Wer hat was?',action:'Handlungen und Zustände',pair:'Zwei Aussagen',negation:'nicht verstehen',coordination:'und: beide Aussagen verstehen','story:sequence':'Geschichten: Bilderfolge verstehen'};
export function readingReport(p) {
  const path = p.readingPath, words = Object.values(path?.words??{});
  const recognised = words.filter(w=>w.recognised>0).length, later = words.filter(w=>w.later).length;
  const labels = key => key.startsWith('place:')?`Ort: ${key.slice(6)}`:key.startsWith('quantity:')?`Menge: ${key.slice(9)}`:PATTERNS[key];
  return `<section class="reading-report"><h2>Lesefortschritt</h2>
    <div class="reading-metrics"><p><strong>${words.length}</strong> Wörter und Wortformen in Übungen vorgekommen</p><p><strong>${recognised}</strong> selbstständig als einzelnes Wort erkannt</p><p><strong>${later}</strong> nach mindestens einem Tag erneut als Wort erkannt</p></div>
    <p class="subtle">Ein richtig zugeordnetes Satzbild beweist nicht, dass jedes Wort einzeln gelesen werden kann. Die Wort- und Satznachweise beginnen mit Version 13; bisherige Abschlüsse und Blumen bleiben erhalten.</p>
    <details><summary>Satzmuster: eigenständig richtige Antworten ansehen</summary><ul>${Object.entries(path?.patterns??{}).map(([key,s])=>`<li>${esc(labels(key))}: ${s.first}/${s.seen}</li>`).join('')||'<li>Noch keine Satzaufgaben geübt.</li>'}</ul><p class="subtle">Gezeigt werden Antworten ohne Fehler und ohne Lesehilfe. Diese Übungswerte sind kein Lesetest.</p></details>
  </section>`;
}
