# Phonics Lab status

Updated 2026-10-18 (Europe/Berlin). Read AGENTS.md and recent Git history first.
Project: https://github.com/PJendritza/Kalulu-DE. Implemented on guided-learning; main now contains the released app and verification.

## Latest task: Phonics Lab branding (3.0.1)

The user chose **Phonics Lab**, independent of garden/space or other activity themes.
Updated the app/header/home title, all three page titles and descriptions, About,
README, project copyright label and backup download names. Kalulu remains credited
as inspiration and historical source. Legacy storage keys and existing learner
names/backups are preserved; changing branding must not reset saved progress.

The GitHub repository is still **PJendritza/Kalulu-DE** until the user renames it.
Recommended slug: **phonics-lab**. No repository rename or Pages setting was performed.
Current external links deliberately retain the working old path. docs/RENAME.md
contains precise UI steps, expected new project Pages path and the required checks.
The publisher now uses origin instead of a hard-coded repository URL.

The previous feedback's interaction changes are recorded in docs/NEXT-VERSION.md:
minimal entrance, auto-advance, no spoken success praise, tiny nonverbal feedback,
per-level visual progress and retained parent stage-preview access. They are not
implemented by this branding change.

Verification: 10 learning tests passed; 320x568, 390x844 and 768x1024 layout/reduced-
motion checks passed; all three branded headers/titles/meta descriptions pass at
320px. Full existing browser suite also passed, including profile migration, resume,
renamed backup export, audio and later exercises. Evidence:
branding.json and mobile.json under docs/verification/2026-10-18. At this source
checkpoint the 3.0.1 branding publication is pending; the tested source/build and
live file hashes will be recorded after publishing.

## User feedback and new goal

The user confirmed that v2 opened immediately on their phone, worked very well and
sounded much better. They requested expanded content, small rewards, automatic
challenge, an entrance a nonreader can use, individual profiles, resume and a stage map.
This supersedes the earlier three-demo limit. Preserve calm stationary interactions;
no moving targets, engine, countdown, speed scoring or lost lives.

## Implemented in v3

- One large play button starts/resumes the appropriate lesson. Spoken guidance,
  speaker replay, animal profile pictures and a large explicit next arrow; no need
  for a child to read a menu. Parent controls remain separate.
- Eight stages: a/m/i; o/u/e; am/im/um short-vowel contexts; ma/mi with reversed
  combinations; final-sound m/n/l identification; an/in/man/nun/mal; recognition of
  Oma/Omi/Mama/Mami; building ten short words/units. Details: docs/GOALS.md.
- 20 human target recordings (12 added) + 15 full-sentence Piper instructions.
  No new isolated synthetic phonemes, no letter-name consonant substitutions and
  no vowels cropped out of words. n/l use last sounds of complete natural words.
  All individual sources, licenses and hashes are retained; new clips need listening
  review. Sound review adds category filters and retains three old comparisons.
- Independent first-try accuracy controls two/three/four choices, weak-target
  repetition and automatic stage progression. Demonstrations do not count toward
  mastery. Minimum two recent independent successes plus >=75% across the last up
  to four; every stage target must qualify. Sessions cap at nine questions and may
  finish early when secure. No speed metric. Parent preview opens later exercises.
- A completed question earns one seed exactly once; a passed stage earns a flower.
  Garden/sprout feedback does not move targets, removes no earned rewards and
  respects reduced-motion settings.
- Up to eight separate local learner profiles, optional nicknames, animal avatars,
  rename/switch, confirmed reset/deletion, all-profile JSON backup/confirmed restore.
  Resume exact question, answer order, errors, partial word and already-awarded
  result. Existing v2 history/backups migrate; the old local key is not deleted.
  Historical completions alone cannot confer new independent mastery.
- Lowercase word-building tiles accept the same phoneme for a capitalized noun;
  the finished slots show canonical capitalization. No spelling-case penalty.
- The source remains plain HTML/CSS/modules. Build versions entrypoints, nested
  modules, audio and manifest requests using an app-content hash, so returning
  phone browsers cannot mix old v2 exports with new v3 scripts. Budget <1 MB.
  The verified clean package is 768,713 bytes (52 files), including all
  audio, adult review, notices, source metadata pointer and checksums.

## Executed and passed

```sh
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py --instructions-only
node --test tests/learning.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
# Existing server, started in the previous task, remained available:
python3 -m http.server 8070 --bind 0.0.0.0 --directory /workspace/kalulu-browser-build
# Existing preview/Kalulu-DE -> ../site symlink exercises the Pages subpath:
node tests/browser.cjs
node tests/profiles.cjs
node tests/mobile-smoke.cjs
node tests/word-hints.cjs
```

- 10 Node tests pass: no mastery/repeated rewards from demos/taps; accuracy makes
  choices harder/unlocks stages; errors ease next questions; immutable state and
  profile isolation; exact partial/solved resume; v2 migration; invalid data/audio
  rejection; unavailable storage; the entire eight-stage progression; lowercase
  noun-building choices. The full-path test actually completes every stage via the
  learning transitions, without setting passed flags by hand.
- Full Chromium flow passes: natural-speed first cue, then actual MP3 playback may
  be accelerated in the runner (no mocked media success); guided start, audio gating,
  wrong-answer stationary positions, exact reload resume, one-time rewards, stage
  unlock/automatic next stage, two profiles, exports and confirmed valid restore,
  invalid restore preservation, all later exercise types, partial-word resume,
  final-sound word contexts, 35 current/38 total MP3 decodes, filters and ratings,
  old local-history migration, blocked-sound retry, stale-callback cancellation,
  storage-quota in-memory fallback, desktop keyboard operation and cache queries.
  No app page errors, external runtime requests or engine downloads.
- Separate profile browser checks pass: all eight earned stages remain selectable;
  automatic review after the last stage; isolated partial-word resume; names display
  as text; explicit reset/delete confirmation preserves the other learner; cap of
  eight disables additional creation; confirmed import of a v2 backup.
- Final word-hint browser regression passes: two correctly placed letters do not
  reveal the next letter; two actual mistakes do. Assisted completion earns its
  seed once but cannot become first-try mastery. Full browser checks were repeated
  successfully after this correction.
- Viewports 320x568, 390x844 and 768x1024 pass: play above fold, next arrow visible,
  home/map/parents without horizontal overflow and reduced-motion animation off.
- All 35 current MP3s decode to nonzero PCM, have peak headroom and quiet last 50 ms.
  Source downloads/voice model use verified TLS and pinned checksums. ONNX’s telemetry
  ID warning uses an in-memory fallback; synthesis completed successfully.

Evidence: docs/verification/2026-10-18/browser.json, profiles.json, mobile.json,
audio-audit.json, word-hints.json. Screenshots remain outside Git under /workspace/kalulu-browser-build/.
Tools: Python 3.12.14, Playwright 1.62.1, Chromium 154.0.8037.57.

## Previous release checkpoint (3.0.0)

Open the released app: https://patrickjendritza.com/Kalulu-DE/?v=3.0.0
Tones: https://patrickjendritza.com/Kalulu-DE/audio-review.html?v=3.0.0

**Publication complete; live version 3.0.0 is verified.**

- Final app source: 953495d67bb96aec34653cf8958c4148267176dd, pushed to
  guided-learning and main. Main subsequently receives verification-only documentation.
- Final deployment: 72acbb727dda416255af3dc86868ddc501497808 on gh-pages.
- Executed clean python3 scripts/build.py, then
  python3 scripts/publish.py --checkout /workspace/kalulu-browser-build/publish-v3-final.
- Executed python3 scripts/verify_live.py after live BUILD_INFO reported the final
  source. All **52 HTTPS files / 768,713 bytes** hash-match the browser-tested build,
  including the new hint fix, content, audio, profiles and versioned module references.
  Full evidence: docs/verification/2026-10-18/live.json.
- The earlier expanded v3 source fb117e4 / deployment ca15e4a was also published and
  HTTPS-verified before the final word-hint correction. The final source supersedes it.
- Content asset version: 3b581d7042f2. Use the fresh ?v=3.0.0 link above to obtain a
  new entry page on returning phones; nested scripts/styles/media have their own
  content-derived queries. No service worker, Pages settings write or new hosting.

The publisher required clean pushed source, passing app-hash-bound browser evidence
and checksums, then made normal non-force pushes. Live-byte verification is distinct
from a new physical-phone or cloud-public-browser test; those are not claimed.

The v2 release remains in Git history: source 79621ff92ecf90a44878e7c2e5c4f06849acd57c,
deployment 06922a634ebf6634c6cc2bc8b8b0c5c6ab8317f2; old results are in the corresponding
source snapshot. A direct public Chromium check previously failed on the cloud proxy
CA (ERR_CERT_AUTHORITY_INVALID), while certificate-verified HTTPS file audits passed.
Do not disable TLS or imply that this is a new physical-device test.

## Limits and next useful step

Profiles are local to one browser/device, with backup/import for transfer. No account,
server sync, tracking, recurring schedule or production identity service. Concurrent
cloud accounts are outside scope. Source and deployment branches remain separate.

The user’s positive phone report is evidence for v2, not an exhaustive v3 phone or
native-speaker review. The added recordings have different voices; Ma, Mama/Mami,
vowel lengths, final-sound instructions and child use need focused adult/educator
review. This is an expanded usable prototype, not a complete curriculum or validated
intervention. See goals for the phonetic distinctions; do not silently equate long
isolated vowels with their short/unstressed word forms.

Smallest next step after release: user tries their existing phone progress, adds a
second learner, checks automatic continue and later stages via the parent map, and
reviews the new recordings in Töne prüfen. Then refine voice consistency, final-l
examples, capital/lowercase recognition and blending based on actual child feedback.

## History and environment

Godot source/deployment are retained in archive/godot-prototype-2026-10-18 and
archive/godot-deployment-2026-10-18, plus earlier archive/tmp/* tags. No old engine
code/assets are active. The old tmp project was not recreated or changed. No force
push, repository visibility change, new hosting, schedule or Git history rewrite.
The current cloud environment already has the Python/Node/browser tools; this task
requires no new secret, paid dependency or environment configuration to run.
