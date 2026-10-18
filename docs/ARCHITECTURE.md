# Phonics Lab browser architecture (v4)

Static HTML/CSS/ES modules. No engine/framework, API, service worker, WASM,
cross-origin isolation or runtime package. Relative paths work under /phonics-lab/.
The complete packaged site remains below 1 MB.

- data.mjs: fourteen stage definitions, target audio, beginning/ending word contexts,
  grapheme-block overrides, avatars and app version. Content is separate from theme.
- learning.mjs: pure questions, accuracy/mastery, validation/migration, profiles,
  fixed level goals and fractional per-block progress. Introductions are excluded
  from mastery. New stages append without changing original stage IDs.
- main.mjs: minimal start, automatic answer flow, cumulative meter/flower field,
  parent stage preview and profile tools. Save each response before scheduling
  advancement. Cancel timers and playback on navigation; a solved resumed question
  advances without scoring twice. Wrong choices keep the same question and order.
- audio.mjs: shared target/instruction HTMLAudioElement with cancellation tokens;
  required playback gates answers and offers retry on failure. Separate preloaded
  quiet effect element never gates progression. No spoken success/retry praise.
- review.mjs: sources, licenses, category filters, local listening notes/export,
  optional old synthetic comparisons. Ratings never silently publish approval.

## State contract

App version 4.0.0 intentionally retains data version 3 and key kalulu-de:learners:v3:
{version:3,activeId,profiles:[{id,name,avatar,progress}]}. Progress holds skills,
stages, sessions, legacy seeds and pending. Session count represents completed
practice levels/flowers; independent mastery is separate. Original nine-question
pending levels remain valid. New goals are at most twelve. levelProgress combines
completed questions plus solved/partial current question into one cumulative value.
A new question inherits that value; mistakes never decrease or add to it.

Pending stores target/cue/choice order, introduction flag, attempts, word position
and solved status. Replays do not score. Resume restores state, then requires the
unanswered cue again; no mid-sound restoration. A 340 ms transition checks current
solved state, preventing stale/partial callbacks. Navigation cancels it explicitly.
The old v2 key is read only if no v3 store exists and is not deleted. Earlier counts
do not fabricate reliable independent evidence. Validation whitelists IDs, cues,
choice pools, block units and ranges. Imports/reset/deletion require confirmation.
Storage errors allow in-memory practice and manual backup.

Profiles are local to a browser/device with no analytics/uploads/accounts/sync.
The same patrickjendritza.com HTTPS origin retains localStorage after the project
path rename. Export/import handles other browsers/devices or erased storage.
Future synchronization needs a separate identity/storage design.

## Build and release

scripts/build.py checks audio hashes, copies app/, versions HTML/CSS/nested modules
and media with a content-derived query, then writes BUILD_INFO.json, LICENSE,
.nojekyll and checksums. Refuses source-tree output and builds over 1 MB.
main is source; gh-pages generated files. publish.py requires clean pushed main,
passing exact-app-hash browser evidence and checked build bytes. Normal push only,
fresh external checkout, no Pages configuration changes. verify_live.py uses
certificate-verified HTTPS to compare every deployed file against the tested build.
The local checkout retains /workspace/Kalulu-DE; origin and website are phonics-lab.

Tests cover all stages, fixed goals, fractional blocks, first-try mastery, saved
profiles/partial/solved resume, actual MP3 playback, auto transitions, failed media,
stationary errors, parent previews, backups/migration, sch/ll, keyboard and mobile
320/390/768px layouts. Browser checks bind evidence to the app hash. Public byte
verification and mobile emulation do not certify real-phone playback or phonetics.
