"""Package the dependency-free static app; reject missing/changed audio assets."""
import argparse, hashlib, json, shutil, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,default=Path('/workspace/kalulu-browser-build/site'));args=p.parse_args();out=args.output.resolve()
 if out==ROOT or ROOT in out.parents:raise SystemExit('Keep generated output outside the source checkout.')
 manifest=json.loads((ROOT/'app/audio/manifest.json').read_text())
 for clip in manifest['clips']:
  source=ROOT/'app'/clip['src']
  if sha(source)!=clip['sha256']:raise SystemExit('Audio checksum mismatch: '+clip['id'])
  if clip.get('previous') and not (ROOT/'app'/clip['previous']).is_file():raise SystemExit('Missing comparison clip')
 out.mkdir(parents=True,exist_ok=True)
 # Only replace a known app output, never recursively delete an arbitrary directory.
 if any(out.iterdir()) and not (out/'BUILD_INFO.json').exists():raise SystemExit('Output directory is not an existing build; choose an empty directory.')
 for old in out.iterdir():
  if old.is_dir():shutil.rmtree(old)
  else:old.unlink()
 shutil.copytree(ROOT/'app',out,dirs_exist_ok=True);shutil.copy2(ROOT/'LICENSE',out/'LICENSE');(out/'.nojekyll').touch()
 commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
 dirty=bool(subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True))
 info={'version':'2.0.0','sourceCommit':commit,'sourceDirty':dirty,'stack':'HTML / CSS / ES modules','audioPolicy':manifest['policy']}
 (out/'BUILD_INFO.json').write_text(json.dumps(info,indent=2)+'\n')
 files={str(p.relative_to(out)):sha(p) for p in sorted(out.rglob('*')) if p.is_file()}
 (out/'SHA256SUMS').write_text(''.join(f'{h}  {name}\n' for name,h in files.items()))
 size=sum(p.stat().st_size for p in out.rglob('*') if p.is_file())
 if size>1_000_000:raise SystemExit(f'Build exceeds 1 MB budget: {size}')
 print(f'{len(files)+1} files, {size:,} bytes, source {commit}, dirty={dirty}; {out}')
if __name__=='__main__':main()
