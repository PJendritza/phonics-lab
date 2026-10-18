# Browser-first structure

The website is app/: static HTML, CSS and native ES modules with relative URLs.
No compilation, framework, service worker, API, cross-origin isolation, WASM or
runtime dependency is needed. It works under the /Kalulu-DE/ Pages prefix.

- data.mjs: declarative lessons and content. Introductory choices are fixed; choices
  are shuffled once per round, never while the child is answering.
- learning.mjs: pure state transitions and practice selection. JSON schema version
  2 rejects invalid imported data. Each skill stores attempts, correct and firstTry;
  completions are distinct from auditory/teaching approval.
- main.mjs: UI and one shared Audio instance. Cancellation tokens prevent late media
  callbacks changing screens after navigation or a new replay. Answers unlock only
  after successful first playback. Failure offers manual replay, never a different
  unvetted speech-synthesis voice. Correct answers expose an explicit next button.
- review.mjs: audio inventory, source credits, human/TTS labels, local ratings/notes,
  JSON export and previous-version comparisons. No review is sent anywhere.
- style.css: stationary responsive layouts, native controls, visible focus, large
  targets, text feedback and no position animations. Reduced-motion settings are
  respected. System fonts avoid downloads.

## Persistence

Storage key kalulu-de:calm:v2 is separate from historical game state. One learner per
browser. Save after answer/completion; a completed lesson is saved across reloads.
The current round is not resumed after leaving: the child can start the lesson again.
Export/import is manual device transfer. Schema validation protects current state
from invalid imports; private mode/quota failure must permit in-memory practice.
No PII, analytics or server persistence is implemented. Hosting has ordinary request
logs. Audio-review ratings use a separate key kalulu-de:audio-review:v2.

Future profiles/cloud sync should use a storage adapter around the pure progress
object, retain migration/version validation and explicitly address identity/consent.
Do not put server credentials in the static bundle.

## Build and deployment

scripts/build.py verifies the committed audio hashes, copies app unchanged, writes
BUILD_INFO.json (source commit and dirty flag), .nojekyll, LICENSE and SHA256SUMS,
and enforces a 1 MB total budget. No generated files are committed to main.
scripts/publish.py accepts only clean builds corresponding to pushed main and passing
browser evidence bound to the exact current app-tree SHA256. It
clones existing gh-pages, replaces deployment files and normal-pushes. It neither
creates hosting nor changes Pages configuration. Use a fresh checkout per release.

The previous engine, SQLite, pack templates and 90+ MB export are absent from the
active website and source layout; archive tags retain them. Browser tests use actual
MP3 decoding and playback, not mocked successful audio, and run under a path prefix.
