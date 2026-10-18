# Literacy font

Phonics Lab v5 bundles regular and bold Latin subsets of Andika 7.000, SIL Global.
The default single-storey a is retained. OpenType cv39=1 activates the curved-tail
lowercase l. German ä/ö/ü/ß/ẞ and l/I/1 are included. Exercise tiles disable optional
ligatures so visual letter sequences remain explicit. Font files are served locally;
there are no runtime Google Fonts or other external font dependencies.

Original: https://software.sil.org/andika/ . Source release, original/subset hashes
and changes: app/fonts/manifest.json. License: app/fonts/OFL.txt (SIL OFL 1.1).
Andika/SIL are reserved font names; the subset's internal primary family is renamed
**Phonics Lesson**. This does not change the source letter shapes. Copyright/license
metadata is retained; the font is an exception to the project CC BY-SA collection.

Optional reproduction (normal builds use the committed subsets):

```sh
python3 -m venv --system-site-packages /workspace/phonics-fonts/venv
/workspace/phonics-fonts/venv/bin/pip install 'fonttools==4.61.1' 'Brotli==1.1.0'
/workspace/phonics-fonts/venv/bin/python scripts/prepare_fonts.py
```

This environment already supplies fontTools 4.61.1. The generator verifies the pinned
release archive SHA256, subsets the needed characters/features, retains original
font timestamps and writes content-hashed filenames. Repeated generation is checked
for stable hashes. After regenerating, update CSS/preload paths from the manifest
if hashes change, and repeat build/browser checks. Do not restore reserved internal
family names on a modified subset. Full originals/caches remain outside Git.

Browser verification checks actual loading and the enabled cv39 feature. Screenshots
outside Git show the l/I/1, a/g and German character sample. Technical shape checks
and adult preference do not prove an educational advantage for a particular font.
