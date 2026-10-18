# Kalulu-DE status

Updated 2026-10-18 (Europe/Berlin). Read AGENTS.md and recent Git history first.
Canonical repository: https://github.com/PJendritza/Kalulu-DE.

## New direction and implemented result

The user rejected the original moving-target Godot games and the sound quality of
synthetic isolated vowels/syllables. The active project is now a **small plain-browser
phonics demo**: three stationary exercises, explicit next step, replay, gentle feedback,
no timers/lives, modern phone-friendly layout. No framework or engine is required.

- Letter recognition: a, m, i; first one choice, then two/three fixed choices.
- Whole-recording syllable recognition: am, im, mi. Intro notes explain short/long
  vowels and preview buttons let an adult/child hear each combination first.
- Later preview: word building am, im, Oma in fixed letter slots. Whole natural
  words play; long isolated vowels are never stitched into short-vowel words.
- Saved local learner state, completed-lesson counts, repeat-practice preference
  for less secure/underexposed sounds, JSON backup/import and two-step reset.
- Sound-review page: all 12 current clips; three old synthetic comparisons only in
  adult review; local ratings/notes and JSON export. Individual source/license links.
- Eight human German recordings replace the short TTS targets. Four full sentence
  instructions use Piper. No claim that a native speaker approved the new sounds.
- app/ holds the website; main holds source; gh-pages holds generated output.
  The build measured 252,333 bytes including all audio and review clips, 28 files.
  A 1 MB maximum is enforced; no engine, PCK, WASM, model or bulk upstream assets.

## Preservation and cleanup

Before removing active old app/deployment/scripts/tests, pushed source tag
archive/godot-prototype-2026-10-18 (9e8c4afe65a1430484eed883d283c5e70bc1dfcd)
and generated-site tag archive/godot-deployment-2026-10-18
(92c6fbf6cb72f99fdd9570b8aa27c53fabc2190a). docs/history/GODOT-PROTOTYPE.md links
both and records why the approach changed. Earlier archive/tmp/* tags/history remain.
An external Git bundle and original-audio backup are also in
/workspace/kalulu-browser-backup. The tmp repository is not recreated or modified.
No force push, visibility change, hosting configuration change or history rewrite.

## Executed verification

```sh
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py
node --test tests/learning.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
python3 -m http.server 8070 --bind 0.0.0.0 --directory /workspace/kalulu-browser-build
mkdir -p /workspace/kalulu-browser-build/preview
ln -sfn ../site /workspace/kalulu-browser-build/preview/Kalulu-DE
node tests/browser.cjs
node tests/mobile-smoke.cjs
```

- Four learning-state tests pass: immutable answers/history, first/repeat progression,
  validation/rejection of invalid imports, and corrupt/unavailable storage fallback.
- Browser checks pass in real headless Chromium with 390x844 touch/mobile emulation,
  then desktop: complete 7 letter rounds, 6 syllable rounds and 3 words; actual audio
  playback/decode; wrong answer keeps target positions and does not advance; replay
  twice; completion; reload persistence; backup download; invalid/valid restore.
- Audio-review inventory: all 15 MP3s decode (12 current + 3 comparison); ratings
  persist and export. Audio failure disables choices and reports retry; replay
  recovers; leaving the exercise cancels playback. No page errors, external runtime
  requests, engine downloads or autoplay failure masked by a test stub.
- Additional 320px phone / 768px tablet introductory screens fit without horizontal
  overflow; each preview requests the corresponding audio. Keyboard activation works.
- All 12 current clips decode to nonzero PCM with unclipped headroom and quiet
  last 50 ms. This checks accidental clipping/end padding, not German pronunciation.
- Source audio and voice model checksums were verified. The ONNX engine prints an
  inability to persist its telemetry device ID; synthesis succeeds using an in-memory
  ID. This warning is not a browser/runtime dependency or a failed audio generation.

Evidence: docs/verification/2026-10-18/browser.json and audio-audit.json.
Additional viewport evidence: docs/verification/2026-10-18/mobile.json.
Screenshots stay outside Git in /workspace/kalulu-browser-build/.
Tools executed: Python 3.12.14, Playwright 1.62.1, Chromium 154.0.8037.57.

## Publication

Implemented on browser-first-demo, fast-forwarded to main and pushed. Live Pages URL:
https://patrickjendritza.com/Kalulu-DE/?v=2
Sound-review URL: https://patrickjendritza.com/Kalulu-DE/audio-review.html?v=2

Publication completed and verified:

- App source: 79621ff92ecf90a44878e7c2e5c4f06849acd57c (main and browser-first-demo).
- Deployment: 06922a634ebf6634c6cc2bc8b8b0c5c6ab8317f2 (gh-pages).
- Executed python3 scripts/build.py from clean source, then python3 scripts/publish.py.
  The publisher checks passing browser evidence against the current app-tree hash,
  source cleanliness, remote main and build checksums before a normal push.
- First python3 scripts/verify_live.py saw the previous BUILD_INFO during Pages
  propagation. After the live metadata changed to version 2.0.0, reran it successfully:
  **all 28 files, 252,333 bytes match the tested build over verified HTTPS**.
  Evidence: docs/verification/2026-10-18/live.json.
- A direct live Chromium landing-page smoke was attempted and blocked by this
  environment's proxy CA trust: net::ERR_CERT_AUTHORITY_INVALID. TLS verification
  was not disabled. Python's certificate-verified HTTPS file audit succeeds; this
  is distinct from the complete locally served Chromium gameplay checks that pass.
  Evidence: docs/verification/2026-10-18/live-browser.json.
- git ls-remote confirms the pushed main and gh-pages commits. Later source commits
  record these release results only; BUILD_INFO identifies the actual deployed app.

The cloud startup draft was saved successfully with the new browser workflow and
source checkpoint 537713ae154f8f58951f3e9326ce99b28bcacb7e, replacing the obsolete
Godot startup instructions. Full workspace discovery identified the canonical
project plus only known dependency/export/verification caches; the empty protected
/workspace/.git directory is not a checkout. The draft contains only Kalulu-DE as
a project. No secrets/network/install settings changed. The tool reports
requires_publish=true: review/save settings and publish the environment to activate
the future-task snapshot. That is separate from the already live website. Fresh-task
restoration is not verified. No accounts, scheduling or new hosting were configured.

## Limits and smallest next step

No account sync, multiple learner profiles, resume of unfinished rounds, validated
curriculum or teacher dashboard. Data is local to one browser; export/import moves it.
O and short vowels still require explicit instructional introduction before a complete
course can be claimed. The word-building activity is a later-stage demonstration.

Real iPhone/Safari and Android hardware are untested. Chromium mobile emulation is
not real-phone verification. Neither German pronunciation nor educational suitability
has received human approval. m uses an entire natural hum from hm; specifically
check no extra h/e. Different original speakers have different sound/recording quality.

Smallest next step: the user listens on their phone in Töne prüfen, exports ratings,
and identifies clips needing replacement. Then purpose-record any questionable
phonemes with one native speaker and have the short-vowel/o progression reviewed.
Do not automatically expand into dozens of unreviewed lessons.
