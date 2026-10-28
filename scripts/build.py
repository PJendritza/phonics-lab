"""Package the dependency-free static app; reject missing/changed audio assets."""
import argparse, hashlib, json, shutil, subprocess, re
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
 font_manifest=json.loads((ROOT/'app/fonts/manifest.json').read_text())
 for font in font_manifest['files']:
  if sha(ROOT/'app'/font['src'])!=font['sha256']:raise SystemExit('Font checksum mismatch: '+font['src'])
 image_manifest=ROOT/'app/images/manifest.json'
 if image_manifest.exists():
  for asset in json.loads(image_manifest.read_text())['files']:
   if sha(ROOT/'app'/asset['src'])!=asset['sha256']:raise SystemExit('Image checksum mismatch: '+asset['src'])
 out.mkdir(parents=True,exist_ok=True)
 # Only replace a known app output, never recursively delete an arbitrary directory.
 if any(out.iterdir()) and not (out/'BUILD_INFO.json').exists():raise SystemExit('Output directory is not an existing build; choose an empty directory.')
 for old in out.iterdir():
  if old.is_dir():shutil.rmtree(old)
  else:old.unlink()
 shutil.copytree(ROOT/'app',out,dirs_exist_ok=True);shutil.copy2(ROOT/'LICENSE',out/'LICENSE');(out/'.nojekyll').touch()
 # A shared content-derived version invalidates nested modules as well as HTML
 # entrypoints. Returning phones must not combine cached v2 and new v3 exports.
 digest=hashlib.sha256()
 for source in sorted((ROOT/'app').rglob('*'),key=lambda p:str(p)):
  if source.is_file():digest.update(str(source.relative_to(ROOT)).encode());digest.update(b'\0');digest.update(source.read_bytes())
 asset_version=digest.hexdigest()[:12]
 for target in out.rglob('*'):
  if target.suffix=='.json':
   target.write_text(json.dumps(json.loads(target.read_text()),ensure_ascii=False,separators=(',',':'))+'\n')
  if target.suffix in ('.html','.mjs'):
   content=target.read_text()
   content=re.sub(r"(?P<quote>['\"])(?P<path>(?:\./)?[A-Za-z0-9_-]+\.(?:css|mjs))(?P=quote)",lambda m:m['quote']+m['path']+'?v='+asset_version+m['quote'],content)
   target.write_text(content)
 commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
 dirty=bool(subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True))
 version=re.search(r"export const VERSION\s*=\s*'([^']+)'",(ROOT/'app/data.mjs').read_text()).group(1)
 info={'version':version,'sourceCommit':commit,'sourceDirty':dirty,'assetVersion':asset_version,'stack':'HTML / CSS / ES modules','audioPolicy':manifest['policy']}
 (out/'BUILD_INFO.json').write_text(json.dumps(info,indent=2)+'\n')
 files={str(p.relative_to(out)):sha(p) for p in sorted(out.rglob('*')) if p.is_file()}
 (out/'SHA256SUMS').write_text(''.join(f'{h}  {name}\n' for name,h in files.items()))
 size=sum(p.stat().st_size for p in out.rglob('*') if p.is_file())
 # More human vocabulary and optional sentence support are fetched on demand.
 # Keep a firm total budget without compressing/cropping speech into poor cues.
 if size>10_000_000:raise SystemExit(f'Build exceeds 10 MB expanded-curriculum budget: {size}')
 print(f'{len(files)+1} files, {size:,} bytes, source {commit}, dirty={dirty}; {out}')
if __name__=='__main__':main()
