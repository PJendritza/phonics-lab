"""Prepare pinned human vocabulary and optional full-sentence reading support.

Free local Piper only; never synthesize isolated phones or splice syllables.
Normal site builds need neither this tool, ffmpeg, nor the voice model.
"""
import argparse, hashlib, json, re, subprocess, tempfile, urllib.request, wave
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
 parser=argparse.ArgumentParser()
 parser.add_argument('--cache',type=Path,default=Path('/workspace/kalulu-browser-audio/reading'))
 parser.add_argument('--model',type=Path,default=Path('/workspace/kalulu-tools/tts-models/de_DE-thorsten-high.onnx'))
 args=parser.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
 manifest_path=ROOT/'app/audio/manifest.json';manifest=json.loads(manifest_path.read_text());clips={c['id']:c for c in manifest['clips']}
 for source in json.loads((ROOT/'docs/reading-audio-sources.json').read_text()):
  path=args.cache/source['filename']
  if not path.exists():
   request=urllib.request.Request(source['sourceAudio'],headers={'User-Agent':'PhonicsLab/0.7 (https://github.com/PJendritza/phonics-lab; educational audio preparation)'})
   with urllib.request.urlopen(request,timeout=45) as response:path.write_bytes(response.read())
  if sha(path)!=source['sourceSha256']:raise SystemExit('Source checksum mismatch: '+source['id'])
  out=ROOT/'app/audio'/(source['id']+'.mp3')
  old=clips.get(source['id'])
  if not old or old.get('sourceSha256')!=source['sourceSha256'] or not out.exists() or sha(out)!=old['sha256']:
   subprocess.run(['ffmpeg','-v','error','-y','-i',str(path),'-af',
    'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB:start_silence=0.12,areverse,silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB:start_silence=0.16,areverse,loudnorm=I=-20:TP=-3:LRA=7,afade=t=in:d=0.008,apad=pad_dur=0.12',
    '-ar','44100','-ac','1','-c:a','libmp3lame','-b:a','80k',str(out)],check=True)
  clips[source['id']]={k:source[k] for k in ['id','label','artist','license','licenseUrl','source','sourceAudio','sourceSha256']}
  clips[source['id']].update(kind='human',group='word',src='audio/'+out.name,sha256=sha(out),ipa=None,review='pending',note='Vollständige deutsche Wortaufnahme. Leise Ränder gekürzt, Lautstärke angeglichen, kurze Einblendung und Endpause. Keine Änderung von Sprechtempo oder Tonhöhe. Hörprüfung ausstehend.')
 settings=json.loads((ROOT/'scripts/tts-settings.json').read_text())
 if sha(args.model)!=settings['modelSha256'] or sha(args.model.with_suffix('.onnx.json'))!=settings['configSha256']:raise SystemExit('Voice model/config checksum mismatch.')
 from piper import PiperVoice,SynthesisConfig
 voice=PiperVoice.load(str(args.model));config=SynthesisConfig(length_scale=settings['lengthScale'],noise_scale=settings['noiseScale'],noise_w_scale=settings['noiseWScale'])
 instructions=json.loads((ROOT/'scripts/reading-instructions.json').read_text())
 sentences=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {SENTENCES,PHRASES} from './app/reading-data.mjs'; console.log(JSON.stringify(Object.fromEntries(Object.entries({...SENTENCES,...PHRASES}).map(([id,v])=>[id,v.text]))));"],cwd=ROOT,text=True))
 for id,text in {**instructions,**sentences}.items():
  out=ROOT/'app/audio'/(id+'.mp3');old=clips.get(id)
  if not(old and old['label']==text and old.get('generation')==settings and out.exists() and sha(out)==old['sha256']):
   pieces=[];rate=None
   for part in re.findall(r'[^.!?]+[.!?]?',text):
    with tempfile.NamedTemporaryFile(suffix='.wav') as temp:
     with wave.open(temp.name,'wb') as wav:voice.synthesize_wav(part.strip(),wav,syn_config=config)
     with wave.open(temp.name,'rb') as wav:
      if wav.getnchannels()!=1 or wav.getsampwidth()!=2:raise SystemExit('Unexpected voice format.')
      if rate is not None and rate!=wav.getframerate():raise SystemExit('Inconsistent voice sample rate.')
      rate=wav.getframerate();pieces.append(wav.readframes(wav.getnframes()))
   with tempfile.NamedTemporaryFile(suffix='.wav') as temp:
    with wave.open(temp.name,'wb') as wav:
     wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate)
     wav.writeframes((b'\0'*(int(rate*settings['sentencePauseSeconds'])*2)).join(pieces))
    subprocess.run(['ffmpeg','-v','error','-y','-i',temp.name,'-af','loudnorm=I=-20:TP=-3:LRA=7,apad=pad_dur=0.16','-ar',str(settings['sampleRate']),'-ac','1','-c:a','libmp3lame','-b:a',settings['bitrate'],str(out)],check=True)
  clips[id]={'id':id,'label':text,'ipa':None,'group':'sentence' if id in sentences else 'instruction','src':'audio/'+out.name,'kind':'tts','artist':'Piper / Thorsten High','license':'CC BY-SA 4.0 (authored clip collection)','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','source':settings['source'],'sha256':sha(out),'review':'pending','generation':settings,'note':'Thorsten High, Längenskala 1,5, zusätzliche Satzpause 0,3 s. Vollständiger Satz; beim selbstständigen Lesen nur auf Hilfewunsch oder nach Fehlern vorgelesen.'}
 manifest.update(clips=list(clips.values()),policy='Human complete sounds, syllables and words. Piper only for full instructions/sentence help. Independent reading never autoplays its answer. No pronunciation approval claimed.',readingGeneratorSha256=sha(Path(__file__)))
 manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 print(f'{len(clips)} clips: {len(instructions)} new instructions, {len(sentences)} optional sentence readings; existing clips preserved.')
if __name__=='__main__':main()
