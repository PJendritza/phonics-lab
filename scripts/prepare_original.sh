#!/usr/bin/env bash
# Pinned original source, Godot and required extension; no tracked upstream edits.
set -euo pipefail
root=${KALULU_WORKSPACE:-/workspace/kalulu-feasibility}
mkdir -p "$root" "$root/downloads" "$root/tools" "$root/xdg-data/godot/export_templates/4.7.stable" "$root/xdg-config" "$root/xdg-cache"
checkout() {
  local name=$1 repo=$2 revision=$3
  if [ ! -d "$root/$name/.git" ]; then
    GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 "https://github.com/Excello-Recherche-Education/$repo.git" "$root/$name"
    if [ "$(git -C "$root/$name" rev-parse HEAD)" != "$revision" ]; then
      git -C "$root/$name" fetch --depth 1 origin "$revision"
      git -C "$root/$name" checkout --detach "$revision"
    fi
  fi
  test "$(git -C "$root/$name" rev-parse HEAD)" = "$revision" || { echo "Unexpected existing $name revision; preserve and inspect it." >&2; exit 1; }
  test -z "$(git -C "$root/$name" status --porcelain)" || { echo "Existing $name changes; preserve and inspect them." >&2; exit 1; }
}
checkout frontend Kalulu-Frontend 51043b23f8e32e72ca79ca914ba3efd6b76b272e
checkout languages Kalulu-Languages bb0f71766c5e27fdb775e544ffe62ca98e6a615c
cd "$root/downloads"
base=https://github.com/godotengine/godot/releases/download/4.7-stable
curl -fLsS --retry 2 "$base/SHA512-SUMS.txt" -o SHA512-SUMS.txt
for asset in Godot_v4.7-stable_linux.x86_64.zip Godot_v4.7-stable_export_templates.tpz; do
  if [ ! -f "$asset" ]; then
    curl -fLsS --retry 2 "$base/$asset" -o "$asset.part"
    mv "$asset.part" "$asset"
  fi
  python3 - "$asset" <<'PY'
import hashlib, pathlib, sys
name = sys.argv[1]
expected = next(line.split()[0] for line in pathlib.Path('SHA512-SUMS.txt').read_text().splitlines() if line.split()[-1].lstrip('*') == name)
with open(name, 'rb') as source:
    actual = hashlib.file_digest(source, 'sha512').hexdigest()
if actual != expected:
    raise SystemExit('Official SHA512 mismatch: ' + name)
print('Official SHA512 verified:', name)
PY
done
if [ ! -f sqlite-bin.zip ]; then
  curl -fLsS --retry 2 https://github.com/2shady4u/godot-sqlite/releases/download/v4.7/bin.zip -o sqlite-bin.zip.part
  mv sqlite-bin.zip.part sqlite-bin.zip
fi
# Reproducibility pin measured on the upstream HTTPS release asset, not a signature.
printf '%s  %s\n' 123c92c2d0d023b8998672eb2d8f7843f4f090b7ef1ecd900dd3568d89ae6775 sqlite-bin.zip | sha256sum -c -
unzip -q -o Godot_v4.7-stable_linux.x86_64.zip -d "$root/tools"
unzip -q -o -j Godot_v4.7-stable_export_templates.tpz 'templates/web*.zip' 'templates/version.txt' -d "$root/xdg-data/godot/export_templates/4.7.stable"
unzip -q -o sqlite-bin.zip 'bin/libgdsqlite.linux.template_debug.x86_64.so' 'bin/libgdsqlite.web.*' -d "$root/frontend/addons/godot-sqlite"
"$root/tools/Godot_v4.7-stable_linux.x86_64" --version
