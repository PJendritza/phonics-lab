# Kalulu-DE status

Updated: 2026-10-18. Permanent repository: https://github.com/PJendritza/Kalulu-DE.
Read this file, AGENTS.md and recent Git history before continuing.

## Current result

The migration is complete. `main` contains organized app source, German content,
build/deployment inputs, tests and documentation. `gh-pages` contains the generated
browser deployment. The working checkout is `/workspace/Kalulu-DE`.

**Open the prototype: https://patrickjendritza.com/Kalulu-DE/**

GitHub automatically enabled Pages on the first gh-pages push, using the account's
existing custom domain. No Pages settings API writes were made. The HTTPS landing
page and eight other core game/audio files return successfully and hash-match the
tested build. A local /Kalulu-DE/ subpath simulation loads the menu and GP preview.
Real iPhone/Android hardware and human pronunciation review remain untested.

## Verified application

- Six cumulative lessons, seven letters, 13 GP readings, 25 syllables, 18 words/names,
  63 synthetic German clips; original jellyfish/frog mechanics and animations reused.
- All 19 content/audio tests passed after path migration and again after tmp removal.
- Fresh Godot 4.7 import, Web export and actual 12-game-pool audit passed. All 57
  required MP3 files decode; no SCRIPT ERROR/ERROR in import/audit/export logs.
- Chromium jellyfish lesson 1 completed 8/8 in 72 seconds with 8 mouse clicks;
  frog lesson 1 completed 5/5 in 104 seconds with 10 correct scored answers.
- Nonzero audio, completion/menu return, reload persistence, all six menu choices
  and 844x390 phone touch (one tap advances the gauge) passed. No game runtime
  errors or external requests. All 63 review WAVs fully decode in Chromium;
  actual native audio controls play a phoneme and word.
- The audio-generator path/default documentation changed. All 63 clips were
  regenerated with the same pinned deterministic recipe: every WAV hash is
  identical to the original collection, while metadata now records the real script.

Evidence: `docs/verification/2026-10-18/`. Earlier evidence and the original progress
record are preserved under `docs/verification/2026-10-17/` and `docs/history/`.

```bash
python3 -m unittest discover -s tests -p 'test_german_*.py' -v
bash scripts/build_german_demo.sh
python3 -m http.server 8062 --bind 127.0.0.1 --directory /workspace/kalulu-de-build/web
# Separate terminal; these suites were all executed successfully:
KALULU_GERMAN_URL=http://127.0.0.1:8062/ OMP_THREAD_LIMIT=1 node tests/browser/test_german_demo.cjs
KALULU_GERMAN_URL=http://127.0.0.1:8062/ OMP_THREAD_LIMIT=1 node tests/browser/test_german_frog.cjs
KALULU_GERMAN_URL=http://127.0.0.1:8062/ node tests/browser/test_german_audio_review.cjs
# From a clean committed tree, update deployment:
bash scripts/publish_web_build.sh
```

Default output is `/workspace/kalulu-de-build/web`. Pinned source/tools stay in the
external `/workspace/kalulu-feasibility` cache; TTS is in `/workspace/kalulu-tools`.
These are dependencies/build caches, not additional development repositories.

## Migration and remote verification

All 136 original tracked files are mapped in `docs/migration-manifest.json`.
Its hashes describe the first organized source snapshot, commit 670e87b; 119 files
were unchanged there, including every WAV, curriculum JSON and Godot integration
script/scene. Later documentation edits do not rewrite this historical inventory.
The full German development history is an ancestor of main. Nine `archive/tmp/*`
tags retain all original remote branch tips, including French/German artifacts.
Historical experiments are inactive under `archive/feasibility/`.

Independent fresh source and deployment clones were byte/hash checked before
cleanup. The final pre-cleanup check verified all 154 source files, all 86 deployment
checksums, and the corresponding source archive. All nine archive tags/objects were
also independently fetched and checked. Records: migration-verification.json and
pre-cleanup-verification.json in the dated evidence directory.

The tested deployment is frozen from source
bbc98e1b2a3079add57417dbd58323f2991c851e, deployment
92c6fbf6cb72f99fdd9570b8aa27c53fabc2190a. Later commits update retirement records and
uploader documentation; application behavior is unchanged. BUILD_INFO.json and
SHA256SUMS identify the deployed snapshot, not necessarily the latest docs commit.

## Old tmp cleanup

Only after the independent remote checks succeeded, the former active tmp branch
was retired with a redirect commit:
2d65acebd109c79cb7bd14a61c43e0c17f79f977. Its original main was left unchanged;
the tmp GitHub repository/history was not deleted or rewritten.

The local `/workspace/tmp` and temporary access-test checkout were removed. Full
working-copy archives including Git metadata and ignored files were verified first:

- `/workspace/kalulu-migration/tmp-before-retirement.tar.gz`
- `/workspace/kalulu-migration/kalulu-de-access-check-before-retirement.tar.gz`
- `/workspace/kalulu-migration/complete-history.bundle` (complete history verified)

All 136 original tracked file hashes were checked inside the archive. Old local
French/German servers were stopped. Post-removal, the 19 tests, full Godot audit and
new-directory asset requests passed. See cleanup-verification.json. Retained
checkouts elsewhere in /workspace are explicitly classified dependency, generated
build or independent verification caches. Do not resume development there.

## Next step

Use the live HTTPS link on a real phone, in landscape with sound enabled. Review
German isolated sounds/vowel contrasts and word stress using the audio-review page
before expanding the curriculum. Native German and educator review are still
required; technical checks are not pedagogical validation. No scheduling configured.
Future cloud work should select Kalulu-DE and read its instructions, not tmp.
Configuration draft saving is separate from publishing a new environment snapshot;
no fresh-task restoration claim is made.
