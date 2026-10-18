# Phonics Lab browser architecture (v3)

Phonics Lab is independent of the current garden theme. Legacy storage keys retain
their old names to preserve existing learners. Repository/Pages paths stay unchanged
until the user performs the repository rename.

app/ is a static HTML/CSS/ES-module website. No engine, framework, server API,
service worker, WASM, cross-origin isolation or runtime package. Relative URLs work
under /Kalulu-DE/. Build output remains below 1 MB including all audio.

- data.mjs: eight stage definitions, human-audio content, groups, final-sound contexts,
  avatars and a version constant. Content progression is distinct from game UI.
- learning.mjs: pure question creation, scoring, accuracy-based difficulty, mastery,
  recommendation, validation, migration and storage functions. Demonstrations never
  enter independent mastery. No timestamps for child response speed or deadlines.
- main.mjs: one-tap guided flow, persistent per-profile question, parent profile tools,
  map, backups and seed/flower garden. Answer order is generated once per question
  and persisted. The next button requires an explicit gesture; no auto-advance.
- audio.mjs: one shared HTMLAudioElement and cancellation tokens. Playback unlocks
  answers; media failure reports manual replay, never a substituted system voice.
  Navigation/replay cancels stale callbacks and overlapping instructions.
- review.mjs: per-clip source/rights, local listening notes, export, category filters
  and old synthetic comparison clips. No local opinion auto-approves repository audio.

## State and resuming

Key kalulu-de:learners:v3 stores {version:3, activeId, profiles:[{id,name,avatar,progress}]}.
Each progress object contains skills (introduced, independent seen/first counts,
recent accuracy and order-only timeline), stages, sessions, seeds and pending session.
A pending round holds its target/cue/choice order, demonstration flag, attempt count,
word position and solved flag. Save after every response and advancement. A solved
round has already credited its seed/skill once; reload cannot award it twice. Audio
must be heard again for a resumed unanswered question; it is not restored mid-sound.

The original kalulu-de:calm:v2 key is read only when no v3 store exists, and never
deleted. Counts/completions migrate into the first profile. Earlier history has no
reliable independent-answer evidence, so recent mastery starts empty and completed
counts alone do not unlock stages. Original backups are also accepted in the import
UI. JSON validation whitelists IDs, content/audio cues, choices, avatars and counts;
malformed files cannot silently replace current profiles. Valid imports require
explicit confirmation because they replace all profiles. Deleting/resetting also
requires confirmation and leaves other learners unchanged.

There are at most eight local profiles; optional nicknames are stored only on the
device and in exported files. No accounts, identifiers sent to a backend, telemetry,
profile uploads or cloud sync. Hosting processes ordinary static request metadata.
Storage failure keeps an in-memory session working and offers manual backup. Browser
private-mode/data deletion can erase local profiles; backup/import is the transfer
and recovery mechanism. A future storage adapter can add explicit sync without
changing the pure learning object; identity/consent remain a separate design step.

## Assets, testing and deployment

scripts/build.py verifies every audio checksum, copies the app, adds a content-derived
version query to HTML and ES-module CSS/JS references, and records the same release
query for media/manifest loading. This invalidates nested old modules on returning
phones, not just the entry HTML. It writes version/source/assetVersion metadata,
.nojekyll, LICENSE and checksums; refuses in-tree outputs and a package over 1 MB.

The main branch holds source and small licensed audio. gh-pages holds only generated
files. scripts/publish.py requires a clean source commit already pushed to main,
passing browser evidence bound to the exact app-tree hash, and matching packaged
checksums. It uses normal pushes and never changes hosting settings. Every release
uses a fresh external publication checkout. scripts/verify_live.py certificate-checks
HTTPS and compares all public file bytes with the tested package after Pages updates.

Tests cover pure accuracy rules, the full eight-stage path, migrations/validation,
profile isolation, saved partial words, actual audio playback/decode, failure/replay,
exports/restores, small-screen layouts and reduced-motion behavior. Chromium viewport
emulation and software audio checks do not replace new physical-phone/child/listening
review. The old Godot implementation and first browser prototype remain in Git history.
