# Phonics Lab

A small browser-based phonics and early-reading prototype, starting with German.
Inspired by Kalulu’s staged sound-to-print learning. No installation, account or engine.

**[Start learning](https://patrickjendritza.com/phonics-lab/?v=9.0.0)** · **[Check the sounds](https://patrickjendritza.com/phonics-lab/audio-review.html?v=9.0.0)**

The 33 numbered levels now have clearer names and five groups. Labels distinguish
listening/spelling recognition, independent word reading and sentence understanding.
Spaced practice interleaves mistakes with other questions, reduces padding of
already-secure words and saves expanding review intervals. A separate **↻ Wiederholen**
button offers due reviews without moving the forward learning cursor backwards.
[Scheduling rules and limits](docs/SPACED-PRACTICE.md).

Choose an animal profile and press play. Answers stay still. A correct answer gives
a brief nonverbal chime/check and a small sparkle, fills the level meter and automatically advances.
Every finished level adds a flower. Mistakes give time and replay without taking
progress away. There are no timers, speed scores or spoken success messages.

**33 levels**, from sounds and syllables to independent word reading and short
sentence comprehension. The expanded vocabulary includes **35 additional complete human word recordings**,
syllable/pattern help, and new AI-generated picture-book illustrations bundled with the app. Words include
Salami, Tomate, Banane, Kanne, Seil, Maus, Biene and Boot. Listening lessons introduce
vocabulary and spelling patterns before children read those words themselves.

Reading levels **do not speak the answer first**. Children read a word or sentence
and choose its picture. The optional speaker reads it aloud; syllable help can
highlight chunks. Both count as assistance, rather than independent mastery.
Level 15 introduces common sentence words; Level 17 adds short im/am phrases. Confident word listeners get same-initial alternatives with one-letter changes, including silent invented comparison forms. Sentence choices contrast object, im/am relation and location: “Ein Ball ist im Bus.” versus
“Ein Ball ist im Haus.” versus “Ein Hut ist im Bus.”
[Lesson sequence and limits](docs/READING-CURRICULUM.md).

**76 human recordings**, **11 licensed Kalulu consonant clips**, 22 full-sentence
instructions and 26 optional sentence/phrase readings (including six legacy clips). Piper Thorsten High uses the
approved length_scale 1.5 and added 0.3-second sentence pause; human words are not
synthesised. After two errors, brief one-choice teaching restores the original
choices without extra rewards. Independent accuracy adjusts two/three/four choices.
New round goals depend on the number of targets and existing knowledge (3–18 questions); saved unfinished rounds keep their exact old goal.
Practice flowers and independent mastery remain separate.

Up to eight local profiles resume exact questions or partial words. Existing demo
profiles migrate/persist, including across the repository path rename on the same
website origin. Numbered level navigation is accessible during exercises; switching levels preserves each unfinished question. Successful levels continue forward instead of selecting an earlier weaker level. After the last success, earlier review is an explicit choice. Parent tools offer a later-stage preview checkbox and
confirmed JSON backup/restore. Data stays in that browser/device; no login or sync.
The bundled Andika-based literacy font has a curved lowercase l and single-storey a; no external font requests. Wrong letters play only the selected sound; a wrong recorded word in a listening-to-written-word task plays that selected word. Wrong pictures and invented forms stay silent. The larger flower and the same seven, more visible sparkles mark correct taps. This is a prototype, not a complete or validated reading course. New recordings
still need listening/educator review. [Audio and credits](docs/AUDIO.md).

## Run and test

Python 3 and Node 18+; no runtime dependencies or bundler. Development:

```sh
python3 -m http.server 8070 --directory app
node --test tests/learning.test.mjs tests/content.test.mjs tests/reading.test.mjs tests/spacing.test.mjs tests/close-reading.test.mjs
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
node tests/choice-help.cjs
node tests/reading.cjs
node tests/spacing.cjs
node tests/close-reading.cjs
python3 scripts/audit_audio.py
```

TEST_URL overrides the main browser-test base. Tests use actual MP3 playback;
after a natural-speed initial cue they accelerate media to shorten execution.
Screenshots/builds stay outside Git. [Executed results](PROGRESS.md).

## Structure

| Location | Purpose |
| --- | --- |
| app/ | Complete static website and small licensed MP3 collection |
| app/data.mjs | Stable foundation stages, human-audio targets, word contexts and grapheme blocks |
| app/reading-data.mjs · app/pictures.mjs | Vocabulary, sentence progression and AI artwork composed with SVG |
| app/learning.mjs | Pure adaptive learning, level goals, profiles and migration |
| app/audio/manifest.json | Individual sources, credits, licenses and hashes |
| scripts/ | Packaging, audio preparation, publication and live verification |
| tests/ | Learning/content integrity and real-browser checks |
| docs/ | Goals, architecture, provenance, history and evidence |
| main | Source and small audio assets |
| gh-pages | Generated website only |

The name is independent of garden/space or other future activity themes. The old
Godot prototype remains in tagged Git history. No engines/models/generated bundles
belong on the source branch. The illustrated complete package stays below 4 MB; audio loads on demand.

## Publish the existing site

From a clean tested source commit already pushed to main:

```sh
python3 scripts/build.py
python3 scripts/publish.py --checkout /workspace/kalulu-browser-build/publish-NEW
python3 scripts/verify_live.py
```

Use a fresh external publication checkout. Publication requires passing browser, reading, spacing and close-word/art
evidence bound to the exact app content and checked build files. It makes a normal
push to the existing gh-pages branch without changing hosting settings. Live HTTPS
hash verification after propagation is separate from a successful push. Versioned
nested modules/media prevent stale phone caches mixing releases. BUILD_INFO.json
identifies the actual app source commit; later docs-only commits do not redeploy it.

## Background and rights

[Kalulu by Excello](https://kalulu.excellolab.org/) inspired staged grapheme/phoneme,
syllable and word learning. This independent app does not inherit research evidence
from the original intervention. [Historical attempt](docs/history/GODOT-PROTOTYPE.md).

Project CC BY-SA 4.0; human Wikimedia recordings individually CC BY-SA 3.0/4.0; Kalulu-derived consonant clips CC BY-SA 4.0; bundled Andika-derived fonts SIL OFL 1.1 ([font provenance](docs/FONTS.md)).
See LICENSE, [audio provenance](docs/AUDIO.md), [source metadata](docs/audio-sources.json)
and in-app About/Töne prüfen. The user’s positive physical-phone report applies to
v2; current release browser emulation is not a new physical-device listening test.
