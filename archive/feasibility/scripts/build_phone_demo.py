"""Prepare a disposable source copy. Run through build_phone_demo.sh."""
from pathlib import Path
import hashlib
import json
import os
import re
import shutil
import subprocess

repo = Path(__file__).resolve().parent.parent
source = Path(os.environ.get('KALULU_WORKSPACE', '/workspace/kalulu-feasibility'))
root = Path(os.environ.get('KALULU_DEMO_WORKSPACE', '/workspace/kalulu-phone-demo'))
app = root / 'frontend'
if not app.exists():
    assert not subprocess.check_output(['git', '-C', str(source/'frontend'), 'status', '--porcelain']).strip()
    shutil.copytree(source/'frontend', app)
assert subprocess.check_output(['git', '-C', str(app), 'rev-parse', 'HEAD']).strip() == b'51043b23f8e32e72ca79ca914ba3efd6b76b272e'
# Always derive the known patches from the pinned original, never stack patches.
def original(name):
    return subprocess.check_output(['git', '-C', str(app), 'show', 'HEAD:'+name]).decode()

project = original('project.godot')
project = project.replace('config/name="Kalulu"', 'config/name="Kalulu French Phone Demo"')
project = re.sub(r'run/main_scene="[^"]+"', 'run/main_scene="res://demo/menu.tscn"', project)
project = project.replace('[debug]', 'Demo="*res://demo/bootstrap.gd"\n\n[debug]')
project = re.sub(r'enabled=PackedStringArray\([^\n]*\)', 'enabled=PackedStringArray("res://addons/godot-form-validator/plugin.cfg", "res://addons/godot-sqlite/plugin.cfg")', project)
project += '\n[input_devices]\n' if '[input_devices]' not in project else ''
project = project.replace('[input_devices]', '[input_devices]\npointing/emulate_mouse_from_touch=true')
(app/'project.godot').write_text(project)
base = original('sources/minigames/base/base_minigame.gd')
base = base.replace('func _go_back_to_the_garden() -> void:', '''func _go_back_to_the_garden() -> void:
\tif ProjectSettings.get_setting("application/config/name") == "Kalulu French Phone Demo":
\t\t_save_logs()
\t\tDemo.home(current_progression >= max_progression)
\t\treturn''')
(app/'sources/minigames/base/base_minigame.gd').write_text(base)
shutil.copytree(repo/'demo', app/'demo', dirs_exist_ok=True)

# Only the authentic recordings needed by the first two lessons and this minigame.
names = ['a.mp3', 'à.mp3', 'e.mp3', 'a-a.mp3', 'à-a.mp3', 'â-a.mp3', 'e-pcent.mp3',
         'kalulu/jellyfish_intro.mp3', 'kalulu/jellyfish_help.mp3',
         'kalulu/jellyfish_end.mp3', 'kalulu/minigame_lose.mp3']
language = source/'languages'
subprocess.run(['git','-C',str(language),'lfs','install','--local'],check=True)
subprocess.run(['git','-C',str(language),'lfs','pull','--include='+','.join('fr_FR/language_sounds/'+x for x in names),'--exclude='],check=True)
pack = app/'demo/pack'
pack.mkdir(exist_ok=True)
manifest = []
for rel in ['language.db'] + ['language_sounds/'+x for x in names]:
    data = (language/'fr_FR'/rel).read_bytes()
    # Verify LFS payload against committed object ID/size before using it.
    pointer = subprocess.check_output(['git','-C',str(language),'show','HEAD:fr_FR/'+rel])
    if pointer.startswith(b'version https://git-lfs'):
        oid = re.search(rb'oid sha256:(\w+)',pointer)[1].decode()
        assert hashlib.sha256(data).hexdigest() == oid, rel
        assert len(data) == int(re.search(rb'size (\d+)',pointer)[1]), rel
    name = str(len(manifest))+'.bin'
    (pack/name).write_bytes(data)
    manifest.append({'path':rel,'file':name})
(pack/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False))

# Lossless compressed textures work on mobile without requiring S3TC extensions.
# No dimensions or atlas coordinates are changed.
for imported in (app/'assets').rglob('*.import'):
    text = imported.read_text()
    if 'compress/mode=2' in text:
        imported.write_text(text.replace('compress/mode=2','compress/mode=0'))

(app/'export_presets.cfg').write_text('''[preset.0]
name="French Phone Demo"
platform="Web"
export_filter="all_resources"
include_filter="demo/pack/*.bin,demo/pack/*.json"
exclude_filter="tests/*,tools/*,addons/gut/*"
export_path=""

[preset.0.options]
variant/extensions_support=true
variant/thread_support=false
vram_texture_compression/for_desktop=true
vram_texture_compression/for_mobile=true
html/canvas_resize_policy=2
progressive_web_app/enabled=false
''')
print('Prepared single-threaded French demo:', app)
