# Phonics Lab

An experimental browser-based platform for phonics and early reading, starting with German.
Inspired by Kalulu’s staged sound-to-print learning.
Runs entirely in the browser: no installation, account, engine or moving targets.

**[Start learning](https://patrickjendritza.com/Kalulu-DE/?v=3.0.1)** · **[Check the sounds](https://patrickjendritza.com/Kalulu-DE/audio-review.html?v=3.0.1)**

A large play button starts/resumes the right activity. Spoken instructions and a
large next arrow let a child practise without reading a menu. Animal profiles keep
separate progress. Seeds and flowers grow a small garden; mistakes never remove them.

Eight stages cover first sounds, more vowels, short-vowel syllables, ma/mi and reversed
combinations, final-sound detection, an/in/man/nun/mal, word reading and word building.
The app uses **20 human German recordings** and spoken full-sentence instructions.
Independent first-try accuracy increases choices from two to three/four and unlocks
stages; weak material receives more practice. No response-speed scoring or timer.
One-choice introductions do not count as mastery. [Teaching design](docs/GOALS.md).

Up to **eight local profiles**, optional nicknames and animal pictures. Resume the
exact unfinished question or partial word. The previous demo’s progress migrates to
one profile. Parent tools export/restore all profiles and accept older backups.
Data stays on that browser/device; use a backup to move it. No cloud synchronization
or login. This is an expanded prototype, not a complete or validated reading course.

The name **Phonics Lab** is independent of any activity theme. The current garden is
one activity presentation. Repository rename to `phonics-lab` is pending; current
links remain valid until then. See [rename steps](docs/RENAME.md) and the
[agreed next-version list](docs/NEXT-VERSION.md).

## Run and test

Development: Python 3 and Node 18+. No runtime dependencies or bundler.

```sh
python3 -m http.server 8070 --directory app
# http://localhost:8070 is for local development only.
node --test tests/learning.test.mjs
python3 scripts/build.py
```

Browser tests need Playwright and Chromium externally installed. This environment
has Playwright 1.62.1 and /usr/bin/chromium. Stop the source-only server before using
the same port for packaged testing:

```sh
mkdir -p /workspace/kalulu-browser-build/preview
ln -sfn ../site /workspace/kalulu-browser-build/preview/Kalulu-DE
python3 -m http.server 8070 --directory /workspace/kalulu-browser-build
# Another terminal:
node tests/browser.cjs
node tests/mobile-smoke.cjs
node tests/profiles.cjs
node tests/word-hints.cjs
python3 scripts/audit_audio.py
```

TEST_URL overrides the main browser test base. Tests use actual MP3 decoding/playback;
after an initial natural-speed round they may accelerate test media. Screenshots and
generated output stay outside Git. Exact executed results and known limits:
[PROGRESS.md](PROGRESS.md), [test evidence](docs/verification/2026-10-18/).

## Structure

| Location | Purpose |
| --- | --- |
| `app/` | Complete static website, modules, styles and small licensed MP3 collection |
| `app/data.mjs` | Content, eight-stage sequence, final-sound contexts and avatars |
| `app/learning.mjs` | Adaptive questions, mastery, profiles, saved rounds and validation |
| `app/audio/manifest.json` | Per-file source, license, speaker, processing and hashes |
| `scripts/` | Reproducible packaging, audio preparation, publication and live verification |
| `tests/` | Learning-state and real-browser functional checks |
| `docs/` | Goals, architecture, audio provenance, history and evidence |
| `main` | Source and small audio assets |
| `gh-pages` | Generated website only |

The previous Godot prototype is archived in tagged Git history, not in the active app.
No engines, models, generated bundles, dependencies or bulk upstream assets belong
on the source branch. The published package stays under a 1 MB budget.

## Publish the existing site

From a clean, tested source commit already pushed to main:

```sh
python3 scripts/build.py
python3 scripts/publish.py --checkout /workspace/kalulu-browser-build/publish-NEW
python3 scripts/verify_live.py
```

Use a new external publication checkout per release. Publishing requires current
passing app-hash-bound browser evidence and build checksums. It uses a normal push
to existing gh-pages, without changing Pages settings or creating hosting. Verify
all live HTTPS bytes after propagation; pushing alone is not a verified release.
A content-derived asset query prevents old cached modules/audio being mixed with
new releases. BUILD_INFO.json identifies the actual app source commit; later
verification-only commits do not change the deployed app.

## Background and rights

[Kalulu by Excello](https://kalulu.excellolab.org/) inspired staged grapheme/phoneme,
syllable and word learning. This independent app does not inherit research evidence
from the original intervention. [Historical Godot attempt](docs/history/GODOT-PROTOTYPE.md).

Project CC BY-SA 4.0; human Wikimedia recordings individually credited CC BY-SA 3.0/4.0.
See [LICENSE](LICENSE), [audio provenance](docs/AUDIO.md), [source metadata](docs/audio-sources.json)
and the in-app About/Töne prüfen pages. All new clips remain pending focused listening
and educator review. The user confirmed v2 worked immediately on their phone and
sounded substantially better; that report does not automatically approve new content.
