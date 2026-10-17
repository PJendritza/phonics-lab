#!/usr/bin/env bash
# Run after scripts/prepare_original.sh. All artifacts remain outside this repo.
set -euo pipefail
root=${KALULU_WORKSPACE:-/workspace/kalulu-feasibility}
export XDG_DATA_HOME="$root/xdg-data" XDG_CONFIG_HOME="$root/xdg-config" XDG_CACHE_HOME="$root/xdg-cache"
mkdir -p "$root/logs" "$root/web"
engine="$root/tools/Godot_v4.7-stable_linux.x86_64"
test -z "$(git -C "$root/frontend" status --porcelain)" || { echo 'Preserve and inspect upstream changes first.' >&2; exit 1; }
# Godot drops an absent, ignored, optional editor plugin. Undo only that known edit.
restore_editor_setting() {
  python3 - "$root/frontend" <<'PY'
import pathlib, subprocess, sys
root = pathlib.Path(sys.argv[1])
original = subprocess.check_output(['git', '-C', str(root), 'show', 'HEAD:project.godot'])
file = root / 'project.godot'
current = file.read_bytes()
expected = original.replace(b', "res://addons/script-ide/plugin.cfg"', b'')
if current not in (original, expected):
    raise SystemExit('Unexpected project.godot change; left untouched for inspection')
if current != original:
    file.write_bytes(original)
PY
}
trap restore_editor_setting EXIT
"$engine" --headless --path "$root/frontend" --editor --import > "$root/logs/import.log" 2>&1
restore_editor_setting
"$engine" --headless --path "$root/frontend" --export-release 'Web Test' "$root/web/index.html" > "$root/logs/export.log" 2>&1
test -s "$root/web/index.html"
test -s "$root/web/index.wasm"
test -s "$root/web/index.pck"
echo 'Export files exist; inspect logs and run browser smoke test before claiming playability.'
