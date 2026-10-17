#!/usr/bin/env bash
set -euo pipefail
source_root=${KALULU_WORKSPACE:-/workspace/kalulu-feasibility}
root=${KALULU_EXTENSION_WORKSPACE:-/workspace/kalulu-extension-test}
project="$root/capability-probe"
repo=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$project/addons" "$root/web/probe" "$root/logs"
cp "$repo"/tests/web-capabilities/* "$project/"
cp -a "$source_root/frontend/addons/godot-sqlite" "$project/addons/"
cp "$source_root/languages/fr_FR/language.db" "$project/language.db"
git -C "$source_root/languages" lfs install --local
git -C "$source_root/languages" lfs pull --include='fr_FR/language_sounds/avancer.mp3' --exclude=''
python3 - "$source_root/languages/fr_FR/language_sounds/avancer.mp3" <<'PY'
import hashlib, pathlib, sys
data = pathlib.Path(sys.argv[1]).read_bytes()
assert len(data) == 7965, 'Expected real LFS recording, not pointer'
assert hashlib.sha256(data).hexdigest() == '7f8b31cbc6ec0ffb044a72fc78309674f842ddad9470d8ed71ae7f2559c1cacf', 'LFS object hash mismatch'
PY
cp "$source_root/languages/fr_FR/language_sounds/avancer.mp3" "$project/speech.bin"
export XDG_DATA_HOME="$source_root/xdg-data" XDG_CONFIG_HOME="$source_root/xdg-config" XDG_CACHE_HOME="$source_root/xdg-cache"
engine="$source_root/tools/Godot_v4.7-stable_linux.x86_64"
"$engine" --headless --path "$project" --editor --import > "$root/logs/capability-import.log" 2>&1
"$engine" --headless --path "$project" --export-release 'Web Probe' "$root/web/probe/index.html" > "$root/logs/capability-export.log" 2>&1
test -s "$root/web/probe/index.pck"
echo 'Capability probe exported; no original application files changed.'
