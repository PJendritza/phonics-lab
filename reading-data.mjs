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

// Sentence vocabulary is deliberately restricted to preceding word lessons plus
// am/im from Levels 3/6. Picture contrasts vary the object AND the location.
export const SENTENCES={};
for(const id of ['hut','ball','bus','fisch','schaf','gans']){
 const article=['gans'].includes(id)?'eine':'ein';
 SENTENCES['s_'+id]={text:`Das ist ${article} ${id[0].toUpperCase()+id.slice(1)}.`,picture:id,kind:'sentence',audio:'s_'+id};
}
for(const subject of ['ball','hut','schaf','maus'])for(const location of ['bus','haus']){
 const id=subject+'_im_'+location;
 SENTENCES[id]={text:`Ein ${subject[0].toUpperCase()+subject.slice(1)} ist im ${location[0].toUpperCase()+location.slice(1)}.`,kind:'sentence',audio:id,subject,location,picture:id};
}
const stage=(id,title,short,targets,mode,extra={})=>({id,title,short,targets,mode,group:mode==='picture'?'meaning':'vocabulary',instruction:mode==='picture'?'picture_read':'word_intro',goal:12,icon:'blocks',color:mode==='picture'?'mint':'peach',...extra});
const paired=(id,title,targets,extra={})=>[
 stage(id+'_listen',title+' hören',targets.map(t=>READING_ITEMS[t]?.text??t).join(' · '),targets,'find',{...extra}),
 stage(id+'_read',title+' lesen','Selbst lesen und das Bild finden',targets,'picture',{...extra}),
];
export const READING_STAGES=[
 stage('picture_known','Wörter verstehen','Ohne Vorsprechen: Wort → Bild',['hut','ball','bus','fisch','schaf','gans','oma','mama'],'picture'),
 ...paired('long_words','Längere Wörter',['sofa','lama','salami'],{instruction:'long_words',support:'syllables',patterns:['voiced_s']}),
 ...paired('more_words','Neue Wörter',['tomate','banane','melone','igel','esel','nudel','hase','hose','salat'],{instruction:'soft_words',support:'syllables',patterns:['schwa']}),
 ...paired('double_letters','Kurze Vokale',['bett','kamm','tasse','kanne','sonne','affe'],{instruction:'double_letters',support:'syllables',focus:['tt','mm','ss','nn','ff'],patterns:['double']}),
 ...paired('ei','Wörter mit ei',['eis','seil','bein','leim'],{instruction:'pattern_ei',focus:['ei'],patterns:['ei']}),
 ...paired('au','Wörter mit au',['baum','maus','haus','laub'],{instruction:'pattern_au',focus:['au'],patterns:['au','final_devoicing']}),
 ...paired('ie','Wörter mit ie',['biene','sieb','sieben'],{instruction:'pattern_ie',focus:['ie'],support:'syllables',patterns:['ie','final_devoicing']}),
 ...paired('long_vowels','Doppelte Vokale',['boot','beet','see','tee'],{instruction:'long_vowels',focus:['oo','ee'],patterns:['vowel_pairs']}),
 stage('sentence_words','Kleine Satzwörter','das · ist · ein · eine',['das','ist','ein','eine'],'find',{instruction:'sentence_words',patterns:['ei']}),
 stage('first_sentences','Meine ersten Sätze','Einen Satz lesen und das Bild finden',Object.keys(SENTENCES).filter(id=>id.startsWith('s_')),'picture',{group:'sentence',instruction:'sentence_read'}),
 stage('sentence_meaning','Den ganzen Satz verstehen','Wer oder was ist wo?',Object.keys(SENTENCES).filter(id=>!id.startsWith('s_')),'picture',{group:'sentence',instruction:'sentence_where',contrast:true}),
];
// Reading instructions explain the task, never the answer or the new pattern.
// Pattern explanations belong to the preceding listening level and optional help.
for(const s of READING_STAGES)if(s.mode==='picture'&&s.group!=='sentence')s.instruction='picture_read';
