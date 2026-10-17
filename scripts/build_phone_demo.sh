#!/usr/bin/env bash
set -euo pipefail
source_root=${KALULU_WORKSPACE:-/workspace/kalulu-feasibility}
root=${KALULU_DEMO_WORKSPACE:-/workspace/kalulu-phone-demo}
repo=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$root/logs" "$root/web"
python3 "$repo/scripts/build_phone_demo.py"
export XDG_DATA_HOME="$source_root/xdg-data" XDG_CONFIG_HOME="$source_root/xdg-config" XDG_CACHE_HOME="$source_root/xdg-cache"
engine="$source_root/tools/Godot_v4.7-stable_linux.x86_64"
"$engine" --headless --path "$root/frontend" --editor --import > "$root/logs/import.log" 2>&1
"$engine" --headless --path "$root/frontend" --export-release 'French Phone Demo' "$root/web/play.html" > "$root/logs/export.log" 2>&1
test -s "$root/web/play.pck"
python3 "$repo/scripts/package_phone_demo.py"
echo 'Phone demo exported; run browser gameplay checks before publishing.'
