# Kalulu-DE — Laut für Laut

A calm, German phonics browser prototype, inspired by Kalulu’s sound-to-print approach. **The Godot prototype has been replaced.** No engine, installation, account, moving targets, timers or lost lives.

**[Open the exercises](https://patrickjendritza.com/Kalulu-DE/?v=2)** · **[Check the audio](https://patrickjendritza.com/Kalulu-DE/audio-review.html?v=2)**

Three working demonstrations:

1. Match a spoken sound to **a, m, i**: one choice first, then two or three stationary choices.
2. Recognize **am, im, mi** using complete human recordings.
3. Preview later learning: build **am, im, Oma** one letter at a time, hearing the whole word.

Answers wait for sound playback; replay stays available. Progress is saved locally for one learner per browser. Completed lessons offer practice weighted toward less secure sounds, without measuring response speed. Lernstand provides JSON backup/restore; no cross-device sync or login yet.

This is an early demonstration, **not a complete curriculum or validated reading intervention**. Short vowels in *am/im* and new *o* in *Oma* still need their own teaching sequence. Human German recordings replace the old synthetic isolated sounds; native-speaker and educator approval remains pending. The sound-review page keeps three old clips for A/B comparison and exports your ratings.

## Run and test

Ordinary use requires only a browser. Development needs Python 3 and Node 18+; there are no runtime packages or bundler.

```sh
python3 -m http.server 8070 --directory app
# Open http://localhost:8070
node --test tests/learning.test.mjs
python3 scripts/build.py --output /workspace/kalulu-browser-build/site
```

For browser verification, install Playwright and Chromium in your development environment (not in the app). This environment already has them:

```sh
python3 -m http.server 8070 --directory /workspace/kalulu-browser-build
# In another terminal, serve under a GitHub Pages-like prefix:
mkdir -p /workspace/kalulu-browser-build/preview
ln -sfn ../site /workspace/kalulu-browser-build/preview/Kalulu-DE
node tests/browser.cjs
```

Do not run both example servers on port 8070 simultaneously. `TEST_URL` can override the browser test URL. The test uses `/usr/bin/chromium`; screenshots stay outside Git. Current evidence: [PROGRESS.md](PROGRESS.md) and [browser checks](docs/verification/2026-10-18/browser.json).

## Repository structure

| Location | Purpose |
| --- | --- |
| `app/` | The entire static website: HTML, CSS, ES modules, small reviewed-source audio collection |
| `app/data.mjs` | Teaching content, fixed introductory rounds and word data |
| `app/learning.mjs` | Validated local progress and repeat-practice selection |
| `app/audio/manifest.json` | Individual audio source, attribution, processing, license, hash and review status |
| `scripts/` | Build, audio regeneration and deployment tools; generated output stays outside this checkout |
| `tests/` | Learning-state unit tests and browser interaction checks |
| `docs/` | Goals, architecture, audio provenance, historical record and test evidence |
| `main` | Source, documentation and small audio assets |
| `gh-pages` | Generated static deployment only; no application source development here |

## Publishing

Existing GitHub Pages hosting publishes `gh-pages`. No Pages configuration changes or new hosting service are necessary. From a clean, tested source commit already pushed to `main`:

```sh
python3 scripts/build.py
python3 scripts/publish.py
python3 scripts/verify_live.py
```

The publisher refuses dirty source, mismatched hashes or an existing publication checkout. Choose `--checkout /workspace/kalulu-browser-build/publish-N` for a later publication. It uses a normal push and preserves deployment history. Verify live HTTP responses and hashes after Pages finishes; a successful push is not a verified release. The account’s existing domain is `patrickjendritza.com`; use HTTPS explicitly.

## Background and rights

[Original Kalulu](https://kalulu.excellolab.org/) is by Excello and contributors. The prior Godot integration and its documentation are preserved in [historical tags](docs/history/GODOT-PROTOTYPE.md), rather than shipped with the new app. This independent implementation borrows the phonics idea, not a claim of the original intervention’s research results.

Project: CC BY-SA 4.0; Wikimedia audio: individually credited CC BY-SA 3.0 or 4.0. See [LICENSE](LICENSE), [audio documentation](docs/AUDIO.md), [sources](docs/audio-sources.json), and the in-app About page. No Godot, model binaries, upstream bulk assets or generated exports belong on the source branch.
