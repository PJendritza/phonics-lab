"""Add the landing page, notices, source modifications and same-origin policy."""
from pathlib import Path
import os
import shutil
import subprocess
import zipfile

repo = Path(__file__).resolve().parent.parent
source = Path(os.environ.get('KALULU_WORKSPACE', '/workspace/kalulu-feasibility'))
root = Path(os.environ.get('KALULU_DEMO_WORKSPACE', '/workspace/kalulu-phone-demo'))
web = root/'web'
shutil.copyfile(repo/'demo/index.html', web/'index.html')
(web/'.nojekyll').touch()
play = web/'play.html'
text = play.read_text()
policy = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' \'wasm-unsafe-eval\'; style-src \'self\' \'unsafe-inline\'; connect-src \'self\'; worker-src \'self\' blob:;">'
if policy not in text:
    text = text.replace('<head>', '<head>\n'+policy, 1)
play.write_text(text)
notices = '''Kalulu French phone demo

Original application: Excello Recherche & Education
https://github.com/Excello-Recherche-Education/Kalulu-Frontend
Commit: 51043b23f8e32e72ca79ca914ba3efd6b76b272e
French data and recordings:
https://github.com/Excello-Recherche-Education/Kalulu-Languages
Commit: bb0f71766c5e27fdb775e544ffe62ca98e6a615c

Changes by the PJendritza/tmp adaptation project, 2026:
offline demo bootstrap/menu, return to demo menu, web export settings,
lossless texture import configuration, landing page and test/build helpers.
These adaptations are licensed CC BY-SA 4.0, like the original project.
https://creativecommons.org/licenses/by-sa/4.0/
No endorsement by Excello is implied. French teaching content is unchanged.

Uses Godot 4.7, MIT license, https://godotengine.org/license/
Godot third-party notices: https://github.com/godotengine/godot/blob/4.7-stable/COPYRIGHT.txt

'''
for label, name in [('Application license','LICENSE'),
                    ('SQLite addon license','addons/godot-sqlite/LICENSE.md')]:
    notices += '\n'+label+'\n'+(source/'frontend'/name).read_text()+'\n'
# Preserve every other bundled addon license, even if unused by this demo.
for path in (source/'frontend/addons').rglob('*'):
    if path.is_file() and ('license' in path.name.lower() or 'copying' in path.name.lower()) and path != source/'frontend/addons/godot-sqlite/LICENSE.md':
        notices += '\n'+str(path.relative_to(source/'frontend'))+'\n'+path.read_text(errors='replace')+'\n'
for file in (repo/'demo/licenses').glob('*.txt'):
    notices += '\n'+file.name+'\n'+file.read_text()+'\n'
(web/'THIRD_PARTY.txt').write_text(notices)
(web/'BUILD_INFO.json').write_text(__import__('json').dumps({
    'project':'PJendritza/tmp French phone demo',
    'source_branch':subprocess.check_output(['git','-C',str(repo),'branch','--show-current']).decode().strip(),
    'source_commit':subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD']).decode().strip(),
    'upstream_commit':'51043b23f8e32e72ca79ca914ba3efd6b76b272e',
    'godot':'4.7.stable', 'threads':False, 'language':'fr_FR',
},indent=2))
with zipfile.ZipFile(web/'demo-source.zip', 'w', zipfile.ZIP_DEFLATED) as output:
    for directory in ['demo', 'scripts']:
        for file in (repo/directory).rglob('*'):
            if file.is_file() and '__pycache__' not in file.parts:
                output.write(file, file.relative_to(repo))
    output.writestr('SOURCE-NOTES.txt', notices)
for path in web.rglob('*'):
    if path.is_file():
        assert path.stat().st_size < 100_000_000, f'GitHub per-file limit: {path}'
print('Packaged phone demo bytes:', sum(p.stat().st_size for p in web.rglob('*') if p.is_file()))
