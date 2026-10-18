"""Prepare the German prototype in a disposable pinned upstream copy."""
from pathlib import Path
import json
import os
import re
import shutil
import subprocess
from build_german_pack import build

repo = Path(__file__).resolve().parent.parent
source = Path(os.environ.get('KALULU_WORKSPACE', '/workspace/kalulu-feasibility'))
root = Path(os.environ.get('KALULU_GERMAN_WORKSPACE', '/workspace/kalulu-de-build'))
app = root/'frontend'
if not app.exists():
    assert not subprocess.check_output(['git', '-C', str(source/'frontend'), 'status', '--porcelain']).strip()
    shutil.copytree(source/'frontend', app)
assert subprocess.check_output(['git', '-C', str(app), 'rev-parse', 'HEAD']).strip() == b'51043b23f8e32e72ca79ca914ba3efd6b76b272e'
def original(name):
    return subprocess.check_output(['git', '-C', str(app), 'show', 'HEAD:'+name]).decode()

project = original('project.godot')
project = project.replace('config/name="Kalulu"', 'config/name="Kalulu German Prototype"')
project = re.sub(r'run/main_scene="[^"]+"', 'run/main_scene="res://demo/menu.tscn"', project)
project = project.replace('[debug]', 'Demo="*res://demo/bootstrap.gd"\n\n[debug]')
project = re.sub(r'enabled=PackedStringArray\([^\n]*\)', 'enabled=PackedStringArray("res://addons/godot-form-validator/plugin.cfg", "res://addons/godot-sqlite/plugin.cfg")', project)
if '[input_devices]' not in project:
    project += '\n[input_devices]\n'
project = project.replace('[input_devices]', '[input_devices]\npointing/emulate_mouse_from_touch=true')
(app/'project.godot').write_text(project)
base = original('sources/minigames/base/base_minigame.gd')
base = base.replace('func _go_back_to_the_garden() -> void:', '''func _go_back_to_the_garden() -> void:
\tif ProjectSettings.get_setting("application/config/name") == "Kalulu German Prototype":
\t\t_save_logs()
\t\tDemo.home(current_progression >= max_progression)
\t\treturn''')
(app/'sources/minigames/base/base_minigame.gd').write_text(base)
utils = original('sources/utils/autoloads/utils.gd')
utils = utils.replace('const SUPPORTED_LOCALES: Dictionary[String, String] = {', 'const SUPPORTED_LOCALES: Dictionary[String, String] = {\n\t"de_DE": "Deutsch (Prototyp)",')
(app/'sources/utils/autoloads/utils.gd').write_text(utils)
shutil.copytree(repo/'app/godot', app/'demo', dirs_exist_ok=True)
shutil.copyfile(repo/'app/content/de_DE/content.json', app/'demo/content.json')
build(root/'language/de_DE', source/'languages/schema/v1.sql')
pack = app/'demo/pack'
if pack.exists():
    shutil.rmtree(pack)
pack.mkdir(parents=True)
manifest = []
for asset in sorted((root/'language/de_DE').rglob('*')):
    if not asset.is_file():
        continue
    name = str(len(manifest))+'.bin'
    shutil.copyfile(asset, pack/name)
    manifest.append({'path': str(asset.relative_to(root/'language/de_DE')), 'file': name})
(pack/'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False))
for imported in (app/'assets').rglob('*.import'):
    text = imported.read_text()
    if 'compress/mode=2' in text:
        imported.write_text(text.replace('compress/mode=2', 'compress/mode=0'))
shutil.copyfile(repo/'deployment/godot-web-export.cfg', app/'export_presets.cfg')
print('Prepared German prototype:', app)
