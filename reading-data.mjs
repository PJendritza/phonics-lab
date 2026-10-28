import {SCENE_ITEMS} from './mixed-reading.mjs?v=5a2760f53294';
// Curated German vocabulary. Whole-word recordings remain separate from spelling
// support: written syllables are never spliced into synthetic spoken words.
export const WORDS=[
 ['sofa','Sofa',['So','fa']],['lama','Lama',['La','ma']],
 ['salami','Salami',['Sa','la','mi']],['tomate','Tomate',['To','ma','te']],
 ['banane','Banane',['Ba','na','ne']],['melone','Melone',['Me','lo','ne']],
 ['igel','Igel',['I','gel']],['esel','Esel',['E','sel']],
 ['nudel','Nudel',['Nu','del']],['hase','Hase',['Ha','se']],
 ['hose','Hose',['Ho','se']],['salat','Salat',['Sa','lat']],
 ['bett','Bett',['Bett']],['kamm','Kamm',['Kamm']],
 ['tasse','Tasse',['Tas','se']],['kanne','Kanne',['Kan','ne']],
 ['sonne','Sonne',['Son','ne']],['affe','Affe',['Af','fe']],
 ['seil','Seil',['Seil']],['bein','Bein',['Bein']],['leim','Leim',['Leim']],
 ['ein','ein',['ein']],['eine','eine',['ei','ne']],
 ['maus','Maus',['Maus']],['haus','Haus',['Haus']],['laub','Laub',['Laub']],
 ['biene','Biene',['Bie','ne']],['sieb','Sieb',['Sieb']],['sieben','sieben',['sie','ben']],
 ['boot','Boot',['Boot']],['beet','Beet',['Beet']],['see','See',['See']],['tee','Tee',['Tee']],
 ['das','das',['das']],['ist','ist',['ist']],
];
export const READING_ITEMS=Object.fromEntries(WORDS.map(([id,text,syllables])=>[id,{text,audio:id,kind:'word',syllables,picture:id}]));
for(const id of ['fisch','schaf','hut','ball','bus','oma','mama','gans','eis','baum'])READING_ITEMS[id]={picture:id};
export const PICTURE_IDS=[...WORDS.map(w=>w[0]).filter(id=>!['ein','eine','das','ist'].includes(id)),'fisch','schaf','hut','ball','bus','oma','mama','gans','eis','baum'];

// Legacy one-noun sentences remain available only for exact saved-task resume.
export const SENTENCES={};
for(const id of ['hut','ball','bus','fisch','schaf','gans']){
 const article=id==='gans'?'eine':'ein';
 SENTENCES['s_'+id]={text:`Das ist ${article} ${id[0].toUpperCase()+id.slice(1)}.`,picture:id,kind:'sentence',audio:'s_'+id,legacy:true};
}
Object.assign(SENTENCES,SCENE_ITEMS);
export const PHRASES={};
for(const subject of ['ball','hut'])for(const location of ['bus','baum','tisch','kiste'])for(const original of Object.values(SCENE_ITEMS).filter(v=>v.scene?.family==='place'&&v.subject===subject&&v.location===location)){
 const base=original.audio,id='phrase_'+base;
 PHRASES[id]={...original,text:original.shortText,audio:id,shortText:undefined,shortAudio:undefined,kind:'phrase',picture:base};
}
const stage=(id,title,short,targets,mode,extra={})=>({id,title,short,targets,mode,group:mode==='picture'?'meaning':'vocabulary',instruction:mode==='picture'?'picture_read':'word_intro',goal:12,icon:'blocks',color:mode==='picture'?'mint':'peach',...extra});
const paired=(id,title,targets,extra={})=>[
 stage(id+'_listen',title+' hören',targets.map(t=>READING_ITEMS[t]?.text??t).join(' · '),targets,'find',{...extra}),
 stage(id+'_read',title+' lesen','Selbst lesen und das Bild finden',targets,'picture',{...extra}),
];
export const READING_STAGES=[
 stage('sentence_words','Kleine Satzwörter','das · ist · ein · eine',['das','ist','ein','eine'],'find',{instruction:'sentence_words',patterns:['ei'],focus:['ei']}),
 stage('picture_known','Wörter verstehen','Ohne Vorsprechen: Wort → Bild',['hut','ball','bus','fisch','schaf','gans','oma','mama'],'picture'),
 stage('phrase_place','Kurze Wortgruppen verstehen','Ball / Hut · im / am Bus',Object.keys(PHRASES),'picture',{group:'phrase',instruction:'phrase_read',contrast:true,balanceRelations:true,minChoices:3}),
 ...paired('long_words','Längere Wörter',['sofa','lama','salami','tomate','banane','melone','nudel','hase','hose'],{instruction:'long_words',support:'syllables',patterns:['voiced_s']}),
 ...paired('more_words','Neue Wörter',['tomate','banane','melone','igel','esel','nudel','hase','hose','salat'],{instruction:'soft_words',support:'syllables',patterns:['schwa']}),
 ...paired('double_letters','Kurze Vokale',['bett','kamm','tasse','kanne','sonne','affe'],{instruction:'double_letters',support:'syllables',focus:['tt','mm','ss','nn','ff'],patterns:['double']}),
 ...paired('ei','Wörter mit ei',['eis','seil','bein','leim'],{instruction:'pattern_ei',focus:['ei'],patterns:['ei']}),
 ...paired('au','Wörter mit au',['baum','maus','haus','laub'],{instruction:'pattern_au',focus:['au'],patterns:['au','final_devoicing']}),
 ...paired('ie','Wörter mit ie',['biene','sieb','sieben'],{instruction:'pattern_ie',focus:['ie'],support:'syllables',patterns:['ie','final_devoicing']}),
 ...paired('long_vowels','Doppelte Vokale',['boot','beet','see','tee'],{instruction:'long_vowels',focus:['oo','ee'],patterns:['vowel_pairs']}),
 stage('first_sentences','Kurze Sätze verstehen','Ein Ball / Hut ist im / am Bus.',Object.keys(SCENE_ITEMS).filter(id=>['ball','hut'].includes(SCENE_ITEMS[id].subject)&&['bus','baum','tisch','kiste'].includes(SCENE_ITEMS[id].location)),'picture',{group:'sentence',instruction:'sentence_read',contrast:true,balanceRelations:true,minChoices:3,legacyTargets:Object.keys(SENTENCES).filter(id=>id.startsWith('s_'))}),
 stage('sentence_meaning','Den ganzen Satz verstehen','Orte · Mengen · Größen · Handlungen · kleine Geschichten',Object.keys(SENTENCES).filter(id=>!id.startsWith('s_')),'picture',{group:'sentence',instruction:'meaning_mix',contrast:true,balanceRelations:true,mixed:true,masteryByFamily:true,minChoices:4}),
];
for(const s of READING_STAGES)if(s.mode==='picture'&&!['sentence','phrase'].includes(s.group))s.instruction='picture_read';

const digitChoices=['digit_6','digit_8'];
READING_ITEMS.digit_6={text:'6',kind:'numeral',picture:'number_6'};READING_ITEMS.digit_8={text:'8',kind:'numeral',picture:'number_8'};
READING_STAGES.find(s=>s.id==='ie_read').distractors=digitChoices;
