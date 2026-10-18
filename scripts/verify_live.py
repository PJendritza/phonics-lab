"""Verify every deployed file against a local packaged build over verified HTTPS."""
import argparse,concurrent.futures,datetime,hashlib,json,urllib.parse,urllib.request
from pathlib import Path

def main():
 p=argparse.ArgumentParser();p.add_argument('--base',default='https://patrickjendritza.com/Kalulu-DE/');p.add_argument('--site',type=Path,default=Path('/workspace/kalulu-browser-build/site'));p.add_argument('--output',type=Path,default=Path('docs/verification/2026-10-18/live.json'));a=p.parse_args()
 if not a.base.startswith('https://'):raise SystemExit('Public verification requires HTTPS.')
 info=json.loads((a.site/'BUILD_INFO.json').read_text())
 def verify(path):
  name=str(path.relative_to(a.site));url=a.base.rstrip('/')+'/'+urllib.parse.quote(name)+'?release='+info['sourceCommit'][:12]
  request=urllib.request.Request(url,headers={'User-Agent':'Phonics Lab release verification','Cache-Control':'no-cache'})
  with urllib.request.urlopen(request,timeout=40) as response:data=response.read();status=response.status
  expected=hashlib.sha256(path.read_bytes()).hexdigest();actual=hashlib.sha256(data).hexdigest()
  if status!=200 or expected!=actual:raise RuntimeError('Live file differs: '+name)
  return {'file':name,'status':status,'sha256':actual,'bytes':len(data)}
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:files=list(pool.map(verify,sorted(p for p in a.site.rglob('*') if p.is_file())))
 evidence={'status':'passed','timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':a.base,'sourceCommit':info['sourceCommit'],'files':files,'totalBytes':sum(f['bytes'] for f in files),'meaning':'All deployed bytes match the locally browser-tested build over certificate-verified HTTPS. Not a real-phone playability test.'}
 a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(evidence,indent=2)+'\n');print(f'{len(files)} live HTTPS files verified; {evidence["totalBytes"]:,} bytes; source {info["sourceCommit"]}')
if __name__=='__main__':main()
