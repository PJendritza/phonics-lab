export const VERSION = '2.0.0';
export const SOUNDS = {
  a: {text:'a', spoken:'a', ipa:'aː', audio:'a', kind:'letter', note:'langes a'},
  m: {text:'m', spoken:'m', ipa:'m', audio:'m', kind:'letter', note:'Summ-Laut, nicht „em“'},
  i: {text:'i', spoken:'i', ipa:'iː', audio:'i', kind:'letter', note:'langes i'},
  o: {text:'o', spoken:'o', ipa:'oː', audio:'o', kind:'letter', note:'langes o'},
  am: {text:'am', ipa:'am', audio:'am', kind:'syllable', note:'a ist hier kurz'},
  im: {text:'im', ipa:'ɪm', audio:'im', kind:'syllable', note:'i ist hier kurz'},
  mi: {text:'mi', ipa:'miː', audio:'mi', kind:'syllable', note:'Übungssilbe, i ist hier lang'},
};
export const WORDS = {
  am: {text:'am', letters:['a','m'], audio:'am'},
  im: {text:'im', letters:['i','m'], audio:'im'},
  oma: {text:'Oma', letters:['O','m','a'], audio:'oma'},
};
export const LESSONS = [
  {id:'letters', number:'01', title:'Laute entdecken', short:'a · m · i',
   description:'Ein Laut. Ein Buchstabe. Erst ein Feld, dann eine kleine Auswahl.',
   icon:'spark', color:'peach', instruction:'listen', kind:'find', pool:['a','m','i'],
   rounds:[['a',['a']],['m',['m']],['a',['a','m']],['m',['a','m']],['i',['i']],['i',['a','m','i']],['a',['a','m','i']]]},
  {id:'syllables', number:'02', title:'Silben finden', short:'am · im · mi',
   description:'Laute verbinden und genau hinhören. Die Silben bleiben an ihrem Platz.',
   icon:'bridge', color:'mint', instruction:'syllable', kind:'find', preview:true, pool:['am','im','mi'],
   note:'Genau hinhören: In am und im ist der Vokal kurz. In mi ist das i lang. Tippe auf eine Silbe, um den Unterschied zu hören.',
   rounds:[['am',['am']],['im',['im']],['am',['am','im']],['im',['am','im']],['mi',['mi','im']],['mi',['am','im','mi']]]},
  {id:'words', number:'03', title:'Wörter bauen', short:'am · im · Oma',
   description:'Ein Wort hören und Buchstabe für Buchstabe aufbauen. Ohne Springen und Eile.',
   icon:'blocks', color:'lavender', instruction:'word', kind:'build', preview:true,
   words:['am','im','oma'], note:'Ausblick: Bei Oma kommt o neu dazu. Das a am Wortende ist kurz, nicht das lange a aus der ersten Übung.'},
];
export const speaker = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
export const icons = {
 spark:'<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m32 9 5.7 16.3L54 31l-16.3 5.7L32 53l-5.7-16.3L10 31l16.3-5.7L32 9Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M49 8v10m-5-5h10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
 bridge:'<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M9 45V24m46 21V24M9 32c12-18 34-18 46 0M9 44c12-18 34-18 46 0M20 23v12m12-16v12m12-8v12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
 blocks:'<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="8" y="32" width="22" height="22" rx="6" stroke="currentColor" stroke-width="3"/><rect x="34" y="32" width="22" height="22" rx="6" stroke="currentColor" stroke-width="3"/><rect x="21" y="7" width="22" height="21" rx="6" stroke="currentColor" stroke-width="3"/><path d="m17 46 2-6 2 6m21-4h6m-6 5h6M29 17h6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
};
