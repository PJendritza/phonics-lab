"""Package a self-contained static German demo with source and audio review page."""
from pathlib import Path
import hashlib
import html
import json
import os
import shutil
import subprocess
import zipfile
from build_german_pack import verified_audio_clips

repo = Path(__file__).resolve().parent.parent
source = Path(os.environ.get('KALULU_WORKSPACE', '/workspace/kalulu-feasibility'))
root = Path(os.environ.get('KALULU_GERMAN_WORKSPACE', '/workspace/kalulu-german-demo'))
web = root/'web'
shutil.copyfile(repo/'german/index.html', web/'index.html')
shutil.copyfile(repo/'german/README.md', web/'CONTENT-NOTES.md')
shutil.copyfile(repo/'german/AUDIO.md', web/'AUDIO-NOTES.md')
shutil.copyfile(repo/'german/RUNNING.md', web/'README.md')
(web/'.nojekyll').touch()
play = web/'play.html'
text = play.read_text()
policy = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' \'wasm-unsafe-eval\'; style-src \'self\' \'unsafe-inline\'; connect-src \'self\'; worker-src \'self\' blob:;">'
if policy not in text:
    text = text.replace('<head>', '<head>\n'+policy, 1)
play.write_text(text)
notices = '''Kalulu German technical prototype, 2026

Original application: Excello Recherche & Education
https://github.com/Excello-Recherche-Education/Kalulu-Frontend
Commit: 51043b23f8e32e72ca79ca914ba3efd6b76b272e
Language-pack schema:
https://github.com/Excello-Recherche-Education/Kalulu-Languages
Commit: bb0f71766c5e27fdb775e544ffe62ca98e6a615c

Changes by the PJendritza/tmp adaptation project, 2026:
six draft German lessons, synthetic German speech, local offline entry/menu,
return to demo menu, web export settings, lossless texture import configuration,
landing/audio-review pages, source packaging and test/build helpers.
These adaptations and authored draft clips are licensed CC BY-SA 4.0,
like the original project. https://creativecommons.org/licenses/by-sa/4.0/
No endorsement by Excello is implied. This is not a validated reading curriculum.

Uses Godot 4.7, MIT: https://godotengine.org/license/
Godot third-party notices: https://github.com/godotengine/godot/blob/4.7-stable/COPYRIGHT.txt
Piper inference engine/model are NOT included in the browser runtime.
Synthetic voice provenance and generation licenses are documented below.

'''
for label, path in [('Application license', source/'frontend/LICENSE'), ('SQLite addon license', source/'frontend/addons/godot-sqlite/LICENSE.md')]:
    notices += '\n'+label+'\n'+path.read_text()+'\n'
for path in (source/'frontend/addons').rglob('*'):
    if path.is_file() and ('license' in path.name.lower() or 'copying' in path.name.lower()) and path != source/'frontend/addons/godot-sqlite/LICENSE.md':
        notices += '\n'+str(path.relative_to(source/'frontend'))+'\n'+path.read_text(errors='replace')+'\n'
for path in (repo/'demo/licenses').glob('*.txt'):
    notices += '\n'+path.name+'\n'+path.read_text()+'\n'
notices += '\nGerman draft audio provenance\n'+(repo/'german/AUDIO.md').read_text()
(web/'THIRD_PARTY.txt').write_text(notices)
clips = verified_audio_clips()
review = web/'review-audio'
review.mkdir(exist_ok=True)
rows = []
for clip in clips:
    name = clip['id']+'.wav'
    shutil.copyfile(repo/'german/audio'/name, review/name)
    text = html.escape(clip['text'])
    pronunciation = html.escape(clip.get('phonemes', 'gesprochene Anleitung'))
    rows.append(f'<tr><td>{text}<small>{html.escape(clip["id"])}</small></td><td>/{pronunciation}/</td><td><audio controls preload="none" src="review-audio/{name}"></audio></td></tr>')
(web/'audio-review.html').write_text('''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kalulu – Aussprache prüfen</title><link rel="icon" type="image/png" href="play.icon.png"><style>body{font:1rem/1.5 system-ui;margin:2rem;background:#f3f5ff;color:#1a2350}table{border-collapse:collapse;width:100%;max-width:70rem}td{border-bottom:1px solid #b5bbd9;padding:.6rem}small{display:block;color:#48527b}audio{max-width:100%;width:16rem}@media(max-width:600px){td{display:block}td:first-child{border:0;font-weight:bold}td:nth-child(2){border:0}}</style>
<h1>Aussprache prüfen</h1><p>Alle Clips sind synthetische Entwürfe. Bitte insbesondere lange/kurze Vokale, Wortakzent und Konsonanten ohne angehängtes „e“ prüfen. Die technische Prüfung ersetzt kein Zuhören.</p>
<p>Namen haben eine vereinbarte Aussprache. Übungssilben sind teilweise keine Wörter. <a href="CONTENT-NOTES.md">Details</a> · <a href="index.html">Zur Demo</a></p><table>'''+''.join(rows)+'</table></html>')
info = {
    'project': 'PJendritza/tmp German prototype',
    'source_branch': subprocess.check_output(['git','-C',str(repo),'branch','--show-current']).decode().strip(),
    'source_commit': subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD']).decode().strip(),
    'source_dirty': bool(subprocess.check_output(['git','-C',str(repo),'status','--porcelain']).strip()),
    'upstream_commit': '51043b23f8e32e72ca79ca914ba3efd6b76b272e',
    'godot': '4.7.stable', 'threads': False, 'language': 'de_DE',
    'content_sha256': hashlib.sha256((repo/'german/content.json').read_bytes()).hexdigest(),
    'pack': json.loads((root/'language/de_DE/PACK_INFO.json').read_text()),
}
(web/'BUILD_INFO.json').write_text(json.dumps(info, indent=2)+'\n')
with zipfile.ZipFile(web/'demo-source.zip', 'w', zipfile.ZIP_DEFLATED) as output:
    for directory in ['german', 'demo/licenses', 'scripts', 'tests']:
        for path in (repo/directory).rglob('*'):
            if path.is_file() and '__pycache__' not in path.parts:
                output.write(path, path.relative_to(repo))
    for name in ['AGENTS.md', 'PROGRESS.md', 'LICENSE']:
        output.write(repo/name, name)
    output.writestr('SOURCE-NOTES.txt', notices)
for path in web.rglob('*'):
    if path.is_file():
        assert path.stat().st_size < 100_000_000, f'GitHub per-file limit: {path}'
print('German prototype bytes:', sum(p.stat().st_size for p in web.rglob('*') if p.is_file()))
