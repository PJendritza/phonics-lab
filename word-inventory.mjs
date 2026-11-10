import{STAGES,ITEMS,CONTEXTS}from'./data.mjs?v=07c9eb6dc793';import{NOUNS}from'./mixed-reading.mjs?v=07c9eb6dc793';
export function wordInventory(){
 const rows=new Map(),shortWords=new Set(['am','im','um','an','in','man','nun','mal','da','du']);
 const nouns=new Map(Object.values(NOUNS).flatMap(n=>[[n.text.toLocaleLowerCase('de'),n],[n.plural.toLocaleLowerCase('de'),n]]));
 function add(text,level,kind){for(const token of text.match(/\p{L}+/gu)??[]){const key=token.toLocaleLowerCase('de'),noun=nouns.get(key),word=noun?(noun.text.toLocaleLowerCase('de')===key?noun.text:noun.plural):['Wortmodell','Hörbeispiel'].includes(kind)?token:key;const r=rows.get(key)??{word,lemma:noun?`${noun.definite} ${noun.text}`:'',levels:new Set(),uses:new Set()};r.levels.add(level);r.uses.add(kind);rows.set(key,r);}}
 STAGES.forEach((s,i)=>{for(const target of s.targets){const item=ITEMS[target];if(CONTEXTS[s.mode])for(const cue of CONTEXTS[s.mode][target])add(ITEMS[cue].text,i+1,'Hörbeispiel');else if(item?.kind==='word')add(item.text,i+1,'Wortmodell');else if(['sentence','phrase','story'].includes(item?.kind)){add(item.text,i+1,'Lesetext');if(item.shortText)add(item.shortText,i+1,'Lesetext');}else if(shortWords.has(target))add(item.text,i+1,'Kurzes Wort');}});
 return [...rows.values()].map(r=>({...r,levels:[...r.levels].sort((a,b)=>a-b),uses:[...r.uses].sort()})).sort((a,b)=>a.word.localeCompare(b.word,'de'));
}
