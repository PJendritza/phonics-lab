"""Create our short, quiet nonverbal success chime; no speech synthesis involved."""
from array import array
from pathlib import Path
import hashlib,json,math,subprocess,tempfile,wave
ROOT=Path(__file__).resolve().parents[1]
rate=44100;samples=array('h')
for i in range(int(rate*.24)):
 t=i/rate;value=0.0
 for start,hz in [(0,659.255),(.045,880.0)]:
  age=t-start
  if 0<=age<.12:
   envelope=math.sin(math.pi*age/.12)**2
   value+=.075*envelope*math.sin(2*math.pi*hz*age)
 samples.append(round(32767*value))
with tempfile.NamedTemporaryFile(suffix='.wav') as temp:
 with wave.open(temp.name,'wb') as wav:wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(samples.tobytes())
 target=ROOT/'app/audio/success.mp3';subprocess.run(['ffmpeg','-v','error','-y','-i',temp.name,'-c:a','libmp3lame','-b:a','64k',str(target)],check=True)
p=ROOT/'app/audio/manifest.json';manifest=json.loads(p.read_text());manifest['clips']=[c for c in manifest['clips'] if c['id']!='success'];manifest['clips'].append({'id':'success','label':'Kurzer Bestätigungston (ohne Sprache)','ipa':None,'group':'effect','src':'audio/success.mp3','kind':'effect','artist':'Phonics Lab contributors','license':'CC BY-SA 4.0','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','source':'https://github.com/PJendritza/phonics-lab/blob/main/scripts/make_feedback.py','sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'review':'pending','note':'Eigener leiser Zweiklang, kein gesprochener Erfolgskommentar. Wird nicht als Sprachlaut verwendet.'});p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print('Generated quiet 240 ms nonverbal chime.')
