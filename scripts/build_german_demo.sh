#!/usr/bin/env bash
set -euo pipefail
source_root=${KALULU_WORKSPACE:-/workspace/kalulu-feasibility}
root=${KALULU_GERMAN_WORKSPACE:-/workspace/kalulu-de-build}
repo=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$root/logs" "$root/web"
python3 "$repo/scripts/build_german_demo.py"
export XDG_DATA_HOME="$root/xdg-data" XDG_CONFIG_HOME="$root/xdg-config" XDG_CACHE_HOME="$root/xdg-cache"
mkdir -p "$XDG_DATA_HOME/godot"
ln -sfn "$source_root/xdg-data/godot/export_templates" "$XDG_DATA_HOME/godot/export_templates"
engine="$source_root/tools/Godot_v4.7-stable_linux.x86_64"
"$engine" --headless --path "$root/frontend" --editor --import > "$root/logs/import.log" 2>&1
if rg -n 'SCRIPT ERROR|^ERROR:' "$root/logs/import.log"; then exit 1; fi
"$engine" --headless --path "$root/frontend" --script res://demo/audit.gd > "$root/logs/pack-audit.log" 2>&1
if rg -n 'SCRIPT ERROR|^ERROR:' "$root/logs/pack-audit.log"; then exit 1; fi
grep -q GERMAN_AUDIT_PASS "$root/logs/pack-audit.log"
"$engine" --headless --path "$root/frontend" --export-release 'German Prototype' "$root/web/play.html" > "$root/logs/export.log" 2>&1
if rg -n 'SCRIPT ERROR|^ERROR:' "$root/logs/export.log"; then exit 1; fi
test -s "$root/web/play.pck"
python3 "$repo/scripts/package_german_demo.py"
echo 'German prototype exported. Browser gameplay checks are a separate step.'
