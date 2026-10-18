"""Decode committed MP3s and report clipping/padding; not pronunciation approval."""
from array import array
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'app/audio/manifest.json').read_text());report=[]
for c in manifest['clips']:
 path=ROOT/'app'/c['src'];assert hashlib.sha256(path.read_bytes()).hexdigest()==c['sha256']
 data=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','s16le','-ar','44100','-ac','1','-'])
 samples=array('h');samples.frombytes(data);assert len(samples)>8820
 peak=max(abs(s) for s in samples)/32768;tail=max(abs(s) for s in samples[-2205:])/32768
 assert 0.01<peak<0.99,(c['id'],peak)
 assert tail<0.002,(c['id'],tail)
 report.append({'id':c['id'],'seconds':round(len(samples)/44100,3),'peak':round(peak,4),'last50msPeak':round(tail,6),'sha256':c['sha256']})
output={'status':'passed','meaning':'Decoded PCM has nonzero audio, headroom and quiet endings. This does not certify pronunciation.','clips':report}
(ROOT/'docs/verification/2026-10-18/audio-audit.json').write_text(json.dumps(output,indent=2)+'\n')
print(f'All {len(report)} current MP3s decode, have headroom and end with quiet padding; pronunciation review remains pending.')
