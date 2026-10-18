# Phonics Lab

A small browser-based phonics and early-reading prototype, starting with German.
Inspired by Kalulu’s staged sound-to-print learning. No installation, account or engine.

**[Start learning](https://patrickjendritza.com/phonics-lab/?v=5.0.0)** · **[Check the sounds](https://patrickjendritza.com/phonics-lab/audio-review.html?v=5.0.0)**

Choose an animal profile and press play. Answers stay still. A correct answer gives
a brief nonverbal chime/check and a small sparkle, fills the level meter and automatically advances.
Every finished level adds a flower. Mistakes give time and replay without taking
progress away. There are no timers, speed scores or spoken success messages.

**14 stages**, from a/m/i and vowels through syllables, beginning/ending sounds,
word recognition and grapheme-block building. **41 human German recordings** supply
target sounds and words; nine complete sentence instructions use Piper Thorsten High at length_scale 1.5 with an added 0.3-second sentence pause. New
consonants use natural whole-word contexts rather than artificial isolated clips.
sch and ll remain single blocks in relevant word-building tasks.
Independent accuracy adjusts two/three/four choices and stage unlocking; one-choice
introductions do not count as mastery. New level goals are 12–18 questions, about 50% longer; saved unfinished levels keep their original total.
Practice flowers and mastery are separate. [Teaching design](docs/GOALS.md).

Up to eight local profiles resume exact questions or partial words. Existing demo
profiles migrate/persist, including across the repository path rename on the same
website origin. Numbered level navigation is accessible during exercises; switching levels preserves each unfinished question. Successful levels continue forward instead of selecting an earlier weaker level. After the last success, earlier review is an explicit choice. Parent tools offer a later-stage preview checkbox and
confirmed JSON backup/restore. Data stays in that browser/device; no login or sync.
The bundled Andika-based literacy font has a curved lowercase l and single-storey a; no external font requests. Wrong answers play the clicked option’s human sound/word context, then allow retry. This is a prototype, not a complete or validated reading course. New recordings
still need listening/educator review. [Audio and credits](docs/AUDIO.md).

## Run and test

Python 3 and Node 18+; no runtime dependencies or bundler. Development:

```sh
python3 -m http.server 8070 --directory app
node --test tests/learning.test.mjs tests/content.test.mjs
python3 scripts/build.py
```

Packaged browser checks use Playwright 1.62.1 and /usr/bin/chromium, installed outside
the repository. Stop any source server on the port before starting the build server:

```sh
mkdir -p /workspace/kalulu-browser-build/preview
ln -sfn ../site /workspace/kalulu-browser-build/preview/phonics-lab
python3 -m http.server 8070 --directory /workspace/kalulu-browser-build
# Another terminal:
node tests/browser.cjs
node tests/mobile-smoke.cjs
node tests/profiles.cjs
node tests/word-hints.cjs
node tests/level-navigation.cjs
python3 scripts/audit_audio.py
```

TEST_URL overrides the main browser-test base. Tests use actual MP3 playback;
after a natural-speed initial cue they accelerate media to shorten execution.
Screenshots/builds stay outside Git. [Executed results](PROGRESS.md).

## Structure

| Location | Purpose |
| --- | --- |
| app/ | Complete static website and small licensed MP3 collection |
| app/data.mjs | Fourteen stages, human-audio targets, word contexts and grapheme blocks |
| app/learning.mjs | Pure adaptive learning, level goals, profiles and migration |
| app/audio/manifest.json | Individual sources, credits, licenses and hashes |
| scripts/ | Packaging, audio preparation, publication and live verification |
| tests/ | Learning/content integrity and real-browser checks |
| docs/ | Goals, architecture, provenance, history and evidence |
| main | Source and small audio assets |
| gh-pages | Generated website only |

The name is independent of garden/space or other future activity themes. The old
Godot prototype remains in tagged Git history. No engines/models/generated bundles
belong on the source branch. The complete package stays below 1 MB.

## Publish the existing site

From a clean tested source commit already pushed to main:

```sh
python3 scripts/build.py
python3 scripts/publish.py --checkout /workspace/kalulu-browser-build/publish-NEW
python3 scripts/verify_live.py
```

Use a fresh external publication checkout. Publication requires passing browser
evidence bound to the exact app hash and checked build files. It makes a normal
push to the existing gh-pages branch without changing hosting settings. Live HTTPS
hash verification after propagation is separate from a successful push. Versioned
nested modules/media prevent stale phone caches mixing releases. BUILD_INFO.json
identifies the actual app source commit; later docs-only commits do not redeploy it.

## Background and rights

[Kalulu by Excello](https://kalulu.excellolab.org/) inspired staged grapheme/phoneme,
syllable and word learning. This independent app does not inherit research evidence
from the original intervention. [Historical attempt](docs/history/GODOT-PROTOTYPE.md).

Project CC BY-SA 4.0; human Wikimedia recordings individually CC BY-SA 3.0/4.0; bundled Andika-derived fonts SIL OFL 1.1 ([font provenance](docs/FONTS.md)).
See LICENSE, [audio provenance](docs/AUDIO.md), [source metadata](docs/audio-sources.json)
and in-app About/Töne prüfen. The user’s positive physical-phone report applies to
v2; current release browser emulation is not a new physical-device listening test.
