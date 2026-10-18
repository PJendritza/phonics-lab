"""Regenerate pinned human audio and sentence instructions; never synthesize phonemes.

Ordinary builds use committed MP3s and need neither Piper nor ffmpeg.
"""
import argparse,hashlib,json,re,subprocess,tempfile,urllib.request,urllib.parse,wave
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,default=Path('/workspace/kalulu-browser-audio'));p.add_argument('--model',type=Path,default=Path('/workspace/kalulu-tools/tts-models/de_DE-thorsten-high.onnx'));p.add_argument('--instructions-only',action='store_true');a=p.parse_args()
 output=ROOT/'app/audio';manifest=json.loads((output/'manifest.json').read_text());humans=[c for c in manifest['clips'] if c['kind']=='human'];a.cache.mkdir(parents=True,exist_ok=True)
 if not a.instructions_only:
  for c in humans:
   source=a.cache/Path(urllib.parse.unquote(urllib.parse.urlparse(c['sourceAudio']).path)).name
   if not source.exists() and (a.cache/'reading'/source.name).exists():source=a.cache/'reading'/source.name
   if not source.exists():
    request=urllib.request.Request(c['sourceAudio'],headers={'User-Agent':'Phonics Lab educational audio preparation'})
    with urllib.request.urlopen(request,timeout=60) as response:source.write_bytes(response.read())
   if sha(source)!=c['sourceSha256']:raise SystemExit('Source checksum mismatch: '+c['id'])
   out=ROOT/'app'/c['src'];subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-af',
    'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB:start_silence=0.12,areverse,silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB:start_silence=0.16,areverse,loudnorm=I=-20:TP=-3:LRA=7,afade=t=in:d=0.008,apad=pad_dur=0.12',
    '-ar','44100','-ac','1','-c:a','libmp3lame','-b:a','80k',str(out)],check=True);c['sha256']=sha(out)
 for c in humans:
  if sha(ROOT/'app'/c['src'])!=c['sha256']:raise SystemExit('Processed checksum mismatch: '+c['id'])
 settings=json.loads((ROOT/'scripts/tts-settings.json').read_text())
 if sha(a.model)!=settings['modelSha256']:raise SystemExit('Voice checksum mismatch.')
 if sha(a.model.with_suffix('.onnx.json'))!=settings['configSha256']:raise SystemExit('Voice config checksum mismatch.')
 from piper import PiperVoice,SynthesisConfig
 instructions=json.loads((ROOT/'scripts/instructions.json').read_text())
 voice=PiperVoice.load(str(a.model));config=SynthesisConfig(length_scale=settings['lengthScale'],noise_scale=settings['noiseScale'],noise_w_scale=settings['noiseWScale']);clips=list(humans)+[c for c in manifest['clips'] if c['kind'] in ('effect','phoneme') or (c['kind']=='tts' and c['id'] not in instructions)]
 for key,sentence in instructions.items():
  pieces=[];rate=None
  for part in re.findall(r'[^.!?]+[.!?]?',sentence):
   with tempfile.NamedTemporaryFile(suffix='.wav') as temp:
    with wave.open(temp.name,'wb') as wav:voice.synthesize_wav(part.strip(),wav,syn_config=config)
    with wave.open(temp.name,'rb') as wav:
     if wav.getnchannels()!=1 or wav.getsampwidth()!=2:raise SystemExit('Unexpected voice format.')
     if rate is not None and rate!=wav.getframerate():raise SystemExit('Inconsistent sample rate.')
     rate=wav.getframerate();pieces.append(wav.readframes(wav.getnframes()))
  with tempfile.NamedTemporaryFile(suffix='.wav') as temp:
   with wave.open(temp.name,'wb') as wav:
    wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate)
    wav.writeframes((b'\0'*(int(rate*settings['sentencePauseSeconds'])*2)).join(pieces))
   out=output/(key+'.mp3');subprocess.run(['ffmpeg','-v','error','-y','-i',temp.name,'-af','loudnorm=I=-20:TP=-3:LRA=7,apad=pad_dur=0.16','-ar',str(settings['sampleRate']),'-ac','1','-c:a','libmp3lame','-b:a',settings['bitrate'],str(out)],check=True)
  clips.append({'id':key,'label':sentence,'ipa':None,'group':'instruction','src':'audio/'+out.name,'kind':'tts','artist':'Piper / Thorsten High','license':'CC BY-SA 4.0 (authored clip collection)','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','source':settings['source'],'sha256':sha(out),'review':'pending','generation':settings,'note':'Thorsten High, Längenskala 1,5, zusätzliche Satzpause 0,3 s. Nur vollständige Anleitungen; keine isolierten Sprachlaute.'})
 manifest.update(version=3,clips=clips,generatorSha256=sha(Path(__file__)));(output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print(f'{len(humans)} human recordings + {sum(c['kind']=='tts' for c in clips)} sentence instructions; old comparisons preserved.')
if __name__=='__main__':main()
