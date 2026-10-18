import {READING_ITEMS,READING_STAGES,SENTENCES} from './reading-data.mjs';
export const VERSION='7.0.0';
export const CURRICULUM_VERSION=7;
export const AVATARS=['🦊','🐼','🐸','🐨','🐱','🐰','🦁','🐻'];
export const ITEMS={
 a:{text:'a',audio:'a',kind:'sound'},m:{text:'m',audio:'m',kind:'sound'},i:{text:'i',audio:'i',kind:'sound'},
 o:{text:'o',audio:'o',kind:'sound'},u:{text:'u',audio:'u',kind:'sound'},e:{text:'e',audio:'e',kind:'sound'},
 ma:{text:'ma',audio:'ma',kind:'unit'},mi:{text:'mi',audio:'mi',kind:'unit'},
 am:{text:'am',audio:'am',kind:'unit'},im:{text:'im',audio:'im',kind:'unit'},um:{text:'um',audio:'um',kind:'unit'},
 an:{text:'an',audio:'an',kind:'unit'},in:{text:'in',audio:'in',kind:'unit'},man:{text:'man',audio:'man',kind:'unit'},nun:{text:'nun',audio:'nun',kind:'unit'},mal:{text:'mal',audio:'mal',kind:'unit'},
 oma:{text:'Oma',audio:'oma',kind:'word'},omi:{text:'Omi',audio:'omi',kind:'word'},mama:{text:'Mama',audio:'mama',kind:'word'},mami:{text:'Mami',audio:'mami',kind:'word'},
 fisch:{text:'Fisch',audio:'fisch',kind:'word',graphemes:['F', 'i', 'sch']},
 feder:{text:'Feder',audio:'feder',kind:'word'},
 schaf:{text:'Schaf',audio:'schaf',kind:'word',graphemes:['Sch', 'a', 'f']},
 schuh:{text:'Schuh',audio:'schuh',kind:'word'},
 nase:{text:'Nase',audio:'nase',kind:'word'},
 loewe:{text:'Löwe',audio:'loewe',kind:'word'},
 ball:{text:'Ball',audio:'ball',kind:'word',graphemes:['B', 'a', 'll']},
 baum:{text:'Baum',audio:'baum',kind:'word'},
 dose:{text:'Dose',audio:'dose',kind:'word'},
 dach:{text:'Dach',audio:'dach',kind:'word'},
 gabel:{text:'Gabel',audio:'gabel',kind:'word'},
 gans:{text:'Gans',audio:'gans',kind:'word'},
 hut:{text:'Hut',audio:'hut',kind:'word',graphemes:['H', 'u', 't']},
 bus:{text:'Bus',audio:'bus',kind:'word'},
 eis:{text:'Eis',audio:'eis',kind:'word'},
 tisch:{text:'Tisch',audio:'tisch',kind:'word'},
 rot:{text:'rot',audio:'rot',kind:'word'},
 auf:{text:'auf',audio:'auf',kind:'word'},
 park:{text:'Park',audio:'park',kind:'word'},
 da:{text:'da',audio:'da',kind:'unit'},
 du:{text:'du',audio:'du',kind:'unit'},
};
for(const [id,details]of Object.entries(READING_ITEMS))ITEMS[id]={...ITEMS[id],...details};
Object.assign(ITEMS,SENTENCES);
export const ENDINGS={m:['am','im','um'],n:['an','in','man','nun'],l:['mal'],f:['schaf','auf'],s:['bus','eis'],sch:['fisch','tisch'],t:['hut','rot'],k:['park']};
export const ONSETS={f:['fisch','feder'],n:['nase','nun'],l:['loewe'],sch:['schaf','schuh'],b:['ball','baum'],d:['dose','dach'],g:['gabel','gans'],h:['hut']};
export const CONTEXTS={ending:ENDINGS,onset:ONSETS};
export const STAGES=[
 {id:'letters',title:'Die ersten Laute',short:'a · m · i',mode:'find',group:'sound',targets:['a','m','i'],instruction:'listen',icon:'spark',color:'peach'},
 {id:'vowels',title:'Mehr Vokale',short:'o · u · e',mode:'find',group:'sound',targets:['o','u','e'],distractors:['a','i','m'],instruction:'listen',icon:'spark',color:'mint'},
 {id:'short',title:'Kurz und klar',short:'am · im · um',mode:'find',group:'unit',targets:['am','im','um'],instruction:'short',icon:'bridge',color:'lavender'},
 {id:'blend',title:'Laute verbinden',short:'ma · mi · am · im · um',mode:'find',group:'unit',targets:['ma','mi','am','im','um'],instruction:'syllable',icon:'bridge',color:'peach'},
 {id:'endings',title:'Lautdetektive',short:'m · n · l am Wortende',mode:'ending',group:'end',targets:['m','n','l'],instruction:'ending',icon:'spark',color:'mint'},
 {id:'syllables',title:'Neue Silben',short:'an · in · man · nun · mal',mode:'find',group:'unit',targets:['an','in','man','nun','mal'],instruction:'syllable',icon:'bridge',color:'lavender'},
 {id:'read',title:'Wörter entdecken',short:'Oma · Omi · Mama · Mami',mode:'find',group:'read',targets:['oma','omi','mama','mami'],instruction:'read',icon:'blocks',color:'peach'},
 {id:'build',title:'Wörter bauen',short:'Hören, zerlegen, aufbauen',mode:'build',group:'build',targets:['am','im','um','oma','omi','mama','mami','man','mal','nun'],instruction:'word',icon:'blocks',color:'mint'},
 {id:'onsets',title:'Erste Laute hören',short:'f · n · l · sch',mode:'onset',group:'start',targets:['f','n','l','sch'],instruction:'onset',goal:12,icon:'spark',color:'peach'},
 {id:'stops',title:'Neue Anfangslaute',short:'b · d · g · h',mode:'onset',group:'start',targets:['b','d','g','h'],instruction:'onset',goal:12,icon:'spark',color:'mint'},
 {id:'more_endings',title:'Noch mehr Endlaute',short:'f · s · sch · t · k',mode:'ending',group:'end',targets:['f','s','sch','t','k'],instruction:'ending',goal:10,icon:'spark',color:'lavender'},
 {id:'more_syllables',title:'Silben und kurze Wörter',short:'da · du · Bus · Hut · Fisch · Schaf',mode:'find',group:'unit',targets:['da','du','bus','hut','fisch','schaf'],instruction:'syllable',goal:10,icon:'bridge',color:'peach'},
 {id:'more_read',title:'Mehr Wörter lesen',short:'Fisch · Schaf · Hut · Ball',mode:'find',group:'read',targets:['fisch','schaf','hut','ball'],instruction:'read',goal:12,icon:'blocks',color:'mint'},
 {id:'more_build',title:'Wörter mit Bausteinen',short:'sch und ll als Bausteine',mode:'build',group:'build',targets:['fisch','schaf','hut','ball'],instruction:'word_blocks',goal:8,icon:'blocks',color:'lavender'},
 ...READING_STAGES,
];
export const stageById=id=>STAGES.find(s=>s.id===id);
export const stageNumber=id=>STAGES.findIndex(s=>s.id===id)+1;
export const levelGoal=stage=>Math.round((stage.goal??9)*1.5);
export const skillKey=(stage,target)=>`${stage.group}:${target}`;
export const label=(stage,target)=>CONTEXTS[stage.mode]?target:ITEMS[target].text;
export const lettersFor=target=>ITEMS[target].graphemes??[...ITEMS[target].text];
export const BUILD_UNITS=['a','m','i','o','u','n','l','f','s','sch','t','k','b','d','g','h','ll'];
export const PHONEMES=Object.fromEntries(['a','m','i','o','u','e'].map(c=>[c,c]).concat(['f','n','l','s','sch','b','d','g','t','k','h'].map(c=>[c,'phoneme_'+c]),[['ll','phoneme_l']]));
// Whole words remain task cues. A clicked letter always plays only that sound.
export function choiceFeedback(stage,choice){
 const audio=CONTEXTS[stage.mode]||stage.mode==='build'?PHONEMES[choice]:ITEMS[choice]?.audio;
 if(!audio)throw Error('Kein Klang für diese Auswahl.');
 return {audio:[audio],text:stage.group==='sentence'?'Deine Bildauswahl.':`Deine Auswahl: ${stage.mode==='build'||CONTEXTS[stage.mode]?choice:ITEMS[choice].text}`};
}
export const speaker = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
export const icons = {
 spark:'<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m32 9 5.7 16.3L54 31l-16.3 5.7L32 53l-5.7-16.3L10 31l16.3-5.7L32 9Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M49 8v10m-5-5h10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
 bridge:'<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M9 45V24m46 21V24M9 32c12-18 34-18 46 0M9 44c12-18 34-18 46 0M20 23v12m12-16v12m12-8v12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
 blocks:'<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="8" y="32" width="22" height="22" rx="6" stroke="currentColor" stroke-width="3"/><rect x="34" y="32" width="22" height="22" rx="6" stroke="currentColor" stroke-width="3"/><rect x="21" y="7" width="22" height="21" rx="6" stroke="currentColor" stroke-width="3"/><path d="m17 46 2-6 2 6m21-4h6m-6 5h6M29 17h6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
};
