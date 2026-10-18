#!/usr/bin/env bash
# Upload a tested deployment branch. GitHub Pages may publish it automatically.
set -euo pipefail
root=${KALULU_GERMAN_WORKSPACE:-/workspace/kalulu-de-build}
repo=$(cd "$(dirname "$0")/.." && pwd)
test -z "$(git -C "$repo" status --porcelain)" || { echo 'Commit source changes before packaging the reproducible artifact.' >&2; exit 1; }
python3 - "$root" <<'PY'
import json,pathlib,sys
root=pathlib.Path(sys.argv[1])
names=['german-jellyfish-lesson-1.json','german-frog-lesson-1.json']
newest=max(path.stat().st_mtime for path in (root/'web').glob('*') if path.suffix in ('.pck','.wasm','.js'))
checks=[]
for name in names:
    path=root/'logs'/name
    check=json.loads(path.read_text())['checks']
    assert not check.get('failure'),check
    assert check['noRuntimeErrors'] and check['noExternalRequests'],check
    assert path.stat().st_mtime>=newest,'Build changed since browser testing'
    checks.append(check)
assert checks[0]['originalGermanJellyfishCompleted']['lesson']==1
assert checks[0]['emulatedPhoneTouch']['progressGaugeAdvanced']
assert checks[0]['lessonAndCompletionPersistAfterReload']
assert checks[1]['completedOriginalFrog']['progression']=='5/5'
review=root/'logs/german-audio-review.json'
assert json.loads(review.read_text())['passed'],'Standalone audio review browser test must pass'
assert review.stat().st_mtime>=newest,'Build changed since audio browser testing'
PY
python3 "$repo/scripts/package_german_demo.py"
deploy="$root/publish-german"
if [ ! -d "$deploy" ]; then
  git init -b gh-pages "$deploy"
  git -C "$deploy" remote add origin https://github.com/PJendritza/Kalulu-DE.git
  if git -C "$deploy" ls-remote --exit-code origin refs/heads/gh-pages >/dev/null; then
    git -C "$deploy" fetch origin gh-pages
    git -C "$deploy" checkout -B gh-pages FETCH_HEAD
  fi
else
  test -d "$deploy/.git"
  test "$(git -C "$deploy" branch --show-current)" = gh-pages
  test -z "$(git -C "$deploy" status --porcelain)" || { echo 'Preserve artifact checkout changes before continuing.' >&2; exit 1; }
  git -C "$deploy" pull --ff-only origin gh-pages
fi
python3 - "$root" "$deploy" <<'PY'
import hashlib,json,pathlib,shutil,sys
root,deploy=map(pathlib.Path,sys.argv[1:])
web=root/'web'
previous=deploy/'FILES.json'
if previous.exists():
    for name in json.loads(previous.read_text()):
        path=pathlib.PurePosixPath(name)
        assert not path.is_absolute() and '..' not in path.parts and '.git' not in path.parts,name
        target=deploy/name
        if target.is_file(): target.unlink()
elif any(p.name!='.git' for p in deploy.iterdir()):
    raise SystemExit('Artifact checkout contains files not managed by this script')
results={}
for name in ['german-jellyfish-lesson-1.json','german-frog-lesson-1.json','german-frog-lesson-6-touch.json','german-audio-review.json']:
    path=root/'logs'/name
    if path.exists(): results[name]=json.loads(path.read_text())['checks']
(web/'TEST_RESULTS.json').write_text(json.dumps(results,indent=2)+'\n')
files=[]
for source in sorted(web.rglob('*')):
    if not source.is_file(): continue
    assert source.stat().st_size<100_000_000,source
    name=source.relative_to(web).as_posix()
    destination=deploy/name
    destination.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(source,destination)
    files.append(name)
(deploy/'FILES.json').write_text(json.dumps(files,indent=2)+'\n')
with (deploy/'SHA256SUMS').open('w') as output:
    for name in files:
        output.write(hashlib.sha256((deploy/name).read_bytes()).hexdigest()+'  '+name+'\n')
PY
git -C "$deploy" add --all
if ! git -C "$deploy" diff --cached --quiet; then
  git -C "$deploy" commit -m 'Store tested six-lesson German Kalulu browser prototype'
fi
git -C "$deploy" push -u origin HEAD:refs/heads/gh-pages
echo 'Tested build uploaded to gh-pages; GitHub Pages may automatically publish it.'
