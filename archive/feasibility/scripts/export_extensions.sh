#!/usr/bin/env bash
# Small, isolated export configuration experiment; no changes to original checkout.
set -euo pipefail
source_root=${KALULU_WORKSPACE:-/workspace/kalulu-feasibility}
root=${KALULU_EXTENSION_WORKSPACE:-/workspace/kalulu-extension-test}
test "$root" != "$source_root"
mkdir -p "$root/logs" "$root/web"
if [ ! -d "$root/frontend" ]; then
  test -z "$(git -C "$source_root/frontend" status --porcelain)"
  cp -a --reflink=auto "$source_root/frontend" "$root/frontend"
fi
python3 - "$root/frontend" <<'PY'
import pathlib, subprocess, sys
root = pathlib.Path(sys.argv[1])
def original(name):
    return subprocess.check_output(['git', '-C', str(root), 'show', 'HEAD:' + name])
assert subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD']).strip() == b'51043b23f8e32e72ca79ca914ba3efd6b76b272e'
names = subprocess.check_output(['git', '-C', str(root), 'diff', '--name-only', 'HEAD']).decode().splitlines()
assert set(names) <= {'project.godot', 'export_presets.cfg'}, names
assert not subprocess.check_output(['git', '-C', str(root), 'ls-files', '--others', '--exclude-standard']).strip(), 'Unexpected untracked files'
presets = original('export_presets.cfg')
assert presets.count(b'variant/extensions_support=false') == 1
patched = presets.replace(b'variant/extensions_support=false', b'variant/extensions_support=true')
file = root / 'export_presets.cfg'
assert file.read_bytes() in (presets, patched), 'Unexpected preset edits'
project = original('project.godot')
assert (root / 'project.godot').read_bytes() in (project, project.replace(b', "res://addons/script-ide/plugin.cfg"', b'')), 'Unexpected project edits'
# Restore the optional editor plugin edit from previous runs of this experiment.
(root / 'project.godot').write_bytes(project)
file.write_bytes(patched)
PY
export XDG_DATA_HOME="$source_root/xdg-data" XDG_CONFIG_HOME="$source_root/xdg-config" XDG_CACHE_HOME="$source_root/xdg-cache"
"$source_root/tools/Godot_v4.7-stable_linux.x86_64" --headless --path "$root/frontend" --export-release 'Web Test' "$root/web/index.html" > "$root/logs/export.log" 2>&1
test -s "$root/web/index.html"
test -s "$root/web/index.wasm"
test -s "$root/web/index.pck"
test -s "$root/web/libgdsqlite.web.template_release.wasm32.wasm"
echo 'Extension-enabled export files exist; browser validation is still required.'
