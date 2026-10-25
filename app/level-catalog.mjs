// Presentation only. Stable IDs, numbers, content and saved progress are kept.
export const CHAPTERS=[
 {id:'sounds',title:'Laute und Silben',from:1,to:6},
 {id:'first_words',title:'Erste Wörter und Wortbausteine',from:7,to:14},
 {id:'word_meaning',title:'Wörter lesen und Bilder zuordnen',from:15,to:21},
 {id:'spellings',title:'Schreibmuster in Wörtern',from:22,to:29},
 {id:'sentences',title:'Von kleinen Wörtern zu Sätzen',from:30,to:32},
];
const TITLES={
 letters:'Buchstaben zu Lauten finden',vowels:'Weitere Vokale erkennen',
 short:'Kurze Silben erkennen',blend:'Ähnliche Silben unterscheiden',
 endings:'Endlaute: m, n und l',syllables:'Weitere Silben erkennen',
 read:'Gehörte Wörter finden',build:'Wörter aus Buchstaben bauen',
 onsets:'Anfangslaute: f, n, l und sch',stops:'Anfangslaute: b, d, g und h',
 more_endings:'Weitere Endlaute erkennen',more_syllables:'Silben und kurze Wörter erkennen',
 more_read:'Weitere gehörte Wörter finden',more_build:'Wörter mit Lautbausteinen bauen',
 picture_known:'Wörter lesen und Bilder finden',
 long_words_listen:'Längere Wörter hören und erkennen',long_words_read:'Längere Wörter selbst lesen',
 more_words_listen:'Neue Wörter hören und erkennen',more_words_read:'Neue Wörter selbst lesen',
 double_letters_listen:'Kurze Vokale: Wörter erkennen',double_letters_read:'Kurze Vokale: Wörter selbst lesen',
 ei_listen:'ei: Wörter hören und erkennen',ei_read:'ei: Wörter selbst lesen',
 au_listen:'au: Wörter hören und erkennen',au_read:'au: Wörter selbst lesen',
 ie_listen:'ie: Wörter hören und erkennen',ie_read:'ie: Wörter selbst lesen',
 long_vowels_listen:'ee und oo: Wörter hören und erkennen',long_vowels_read:'ee und oo: Wörter selbst lesen',
 sentence_words:'Häufige kleine Wörter erkennen',first_sentences:'Wörter im Satz lesen',
 sentence_meaning:'Sätze verstehen: Was ist wo?',
};
export function describeLevel(stage,index){
 const chapter=CHAPTERS.find(c=>index+1>=c.from&&index+1<=c.to);
 const activity=stage.id==='first_sentences'?'Wörter im Satz lesen':stage.group==='sentence'?'Sätze verstehen':stage.mode==='picture'?'Wörter selbst lesen':stage.mode==='build'?'Wörter bauen':['onset','ending'].includes(stage.mode)||stage.group==='sound'?'Laute hören':stage.group==='unit'?'Silben und Wörter erkennen':'Gehörte Wörter erkennen';
 return {...stage,title:TITLES[stage.id]??stage.title,chapter:chapter.id,activity};
}
