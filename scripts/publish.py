"""Publish a tested static build to existing gh-pages; never change Pages settings.

Run after tests and a clean source commit. This replaces only the deployment
branch, with a normal non-force push. Old exports remain in archive tags.
"""
import argparse,hashlib,json,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
REMOTE='https://github.com/PJendritza/Kalulu-DE.git'
def run(*cmd,cwd=ROOT):return subprocess.check_output(cmd,cwd=cwd,text=True).strip()
def main():
 p=argparse.ArgumentParser();p.add_argument('--site',type=Path,default=Path('/workspace/kalulu-browser-build/site'));p.add_argument('--checkout',type=Path,default=Path('/workspace/kalulu-browser-build/publish'));a=p.parse_args();site=a.site.resolve();checkout=a.checkout.resolve()
 if run('git','status','--porcelain'):raise SystemExit('Commit source and test evidence before publishing.')
 evidence=json.loads((ROOT/'docs/verification/2026-10-18/browser.json').read_text())
 digest=hashlib.sha256()
 for source in sorted((ROOT/'app').rglob('*'), key=lambda p: str(p)):
  if source.is_file():
   digest.update(str(source.relative_to(ROOT)).encode());digest.update(b'\0');digest.update(source.read_bytes())
 if evidence.get('status')!='passed' or evidence.get('appSha256')!=digest.hexdigest():raise SystemExit('Run current browser checks before publishing.')
 info=json.loads((site/'BUILD_INFO.json').read_text());commit=run('git','rev-parse','HEAD')
 if info['sourceDirty'] or info['sourceCommit']!=commit:raise SystemExit('Rebuild from the clean current source commit.')
 for line in (site/'SHA256SUMS').read_text().splitlines():
  digest,name=line.split('  ',1)
  if hashlib.sha256((site/name).read_bytes()).hexdigest()!=digest:raise SystemExit('Build checksum mismatch: '+name)
 # Require the source commit on the remote before advertising it in deployment.
 run('git','fetch','origin','main')
 if run('git','rev-parse','origin/main')!=commit:raise SystemExit('Push the tested source to main first.')
 if checkout.exists():raise SystemExit('Choose a new deployment checkout path; existing directories are preserved.')
 if checkout==ROOT or ROOT in checkout.parents or checkout==site or site in checkout.parents:raise SystemExit('Use an external deployment checkout.')
 run('git','clone','--depth','1','--single-branch','--branch','gh-pages',REMOTE,str(checkout))
 run('git','rm','-r','--ignore-unmatch','.',cwd=checkout)
 for source in site.iterdir():
  target=checkout/source.name
  if source.is_dir():shutil.copytree(source,target)
  else:shutil.copy2(source,target)
 run('git','add','--all',cwd=checkout)
 run('git','commit','-m',f'Publish calm browser demo from {commit[:12]}',cwd=checkout)
 print(run('git','push','origin','gh-pages',cwd=checkout));print('Deployment commit:',run('git','rev-parse','HEAD',cwd=checkout))
if __name__=='__main__':main()
