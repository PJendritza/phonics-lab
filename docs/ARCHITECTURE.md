# Phonics Lab browser architecture (v9)

Static HTML/CSS/ES modules. No engine/framework, API, service worker, WASM,
cross-origin isolation or runtime package. Relative paths work under /phonics-lab/.
The complete packaged site remains below 4 MB.

- data.mjs: fourteen stable foundation stages plus nineteen reading-data.mjs stages, target audio, beginning/ending word contexts,
  grapheme-block overrides, avatars and app version. Content is separate from theme.
- learning.mjs: pure questions, accuracy/mastery, validation/migration, profiles,
  fixed level goals, a forward continuation cursor, per-level paused sessions and fractional per-block progress. Introductions are excluded
  from mastery. New stages append without changing original stage IDs. Only Level 1 introduces unseen targets with one option; later tasks start with multiple choices.
- main.mjs: minimal start, automatic answer flow, cumulative meter/flower field,
  parent stage preview and profile tools. Save each response before scheduling
  advancement. Cancel timers and playback on navigation; a solved resumed question
  advances without scoring twice. Wrong choices keep the same question and order.
- audio.mjs: shared target/instruction HTMLAudioElement with cancellation tokens;
  required playback gates answers and offers retry on failure. Separate preloaded
  quiet effect element never gates progression. No spoken success/retry praise. Wrong letters play the selected isolated phoneme clip; whole-word choices play that selected word; choices wait for its completion, and replay cancels it in favor of the original target.
- review.mjs: sources, licenses, category filters, local listening notes/export,
  optional old synthetic comparisons. Ratings never silently publish approval.

Bundled fonts are pinned Andika 7.000 Latin WOFF2 subsets with cv39 curved l. Their internal family is renamed Phonics Lesson under OFL reserved-name rules. Content-hashed filenames prevent stale font mixing. No external font runtime requests.

A round now has optional backward-compatible help and misses fields. Two errors set help=pending. Wrong-option audio completes before showHelp changes it to show, at which point only the correct choice is interactive (invisible placeholders preserve the old positions). The original task cue plays. A guided tap sets ack without changing position, goal progress or score; after 340 ms resumePractice restores the original choices and replays the task. Existing mistake counts prevent first-try mastery. Navigation cancels transitions; reload resumes show or returns from ack without duplicate rewards. Correct normal blocks reset misses, so assistance is specific to the current block. Untouched older later-stage introductions migrate to choices; attempted/solved questions retain their original meaning.

## State contract

App version 9.0.0 intentionally retains data version 3 and key kalulu-de:learners:v3:
{version:3,activeId,profiles:[{id,name,avatar,progress}]}. Progress holds skills,
stages, sessions, legacy seeds and pending, paused and continuation. Session count represents completed
practice levels/flowers; independent mastery is separate. Original nine-question
pending levels remain valid. New goals are at most eighteen. levelProgress combines
completed questions plus solved/partial current question into one cumulative value.
A new question inherits that value; mistakes never decrease or add to it.

Pending stores target/cue/choice order, introduction flag, attempts, word position
and solved status. Replays do not score. Resume restores state, then requires the
unanswered cue again; no mid-sound restoration. A 340 ms transition checks current
solved state, preventing stale/partial callbacks. Navigation cancels it explicitly.
`paused` maps stage IDs to validated pending sessions; switching stashes the current question and restores the selected one without resetting choice order or scoring. `continuation` is a stage ID or `complete`. Successful completion sets it to the next unpassed forward stage, never an earlier weak stage. Unsatisfactory practice stays in that stage. Final completion offers explicit review. Earlier v3 saves without these fields derive the cursor from their pending or highest completed stage and use an empty pause map.

The old v2 key is read only if no v3 store exists and is not deleted. Earlier counts
do not fabricate reliable independent evidence. Validation whitelists IDs, cues,
choice pools, block units and ranges. Imports/reset/deletion require confirmation.
Storage errors allow in-memory practice and manual backup.

Profiles are local to a browser/device with no analytics/uploads/accounts/sync.
The same patrickjendritza.com HTTPS origin retains localStorage after the project
path rename. Export/import handles other browsers/devices or erased storage.
Future synchronization needs a separate identity/storage design.

## Build and release

scripts/build.py checks audio, font and illustration hashes, copies app/, versions HTML/CSS/nested modules
and media with a content-derived query, then writes BUILD_INFO.json, LICENSE,
.nojekyll and checksums. Refuses source-tree output and builds over 4 MB.
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

Packaging minifies JSON in the generated copy only, retaining all source/license fields and readable source manifests. The v6 consonant extension fitted its then-current 1 MB budget; v7 uses the 3 MB expanded-word-bank cap. See docs/PHONEMES.md for source segments and limits.

## v7 reading extension

reading-data.mjs appends eighteen stages and adds curated whole words/syllables,
spelling-pattern metadata and fourteen controlled sentences. pictures.mjs contains
original local SVG drawings shared consistently across words and sentence scenes.
Mode picture uses the existing exact-response state machine with target IDs, but
main.mjs suppresses target cue playback until the user requests help or makes two
errors. Generic entry instructions do not reveal the answer. Optional syllable or
read-aloud help persists round.assisted; a helped answer gives normal practice
progress but no independent first success. Existing sound/word/meaning/sentence
skill groups remain separate.

Schema stays version 3 with a curriculumVersion marker. Validation upgrades a v6
complete cursor to picture_known, preserves pending/paused sessions and rewards,
and accepts missing assisted as false. Current-release explicit completion/review
remains complete. Allowed skill count derives from the actual curriculum.

Human words are prepared from pinned Commons metadata; complete sentence support
is pre-generated locally by Piper. No microphone, model download, speech service
or tracking in the browser. The total-site cap rises to 3 MB for the expanded
audio bank; no runtime dependencies or engine.

## v8 grouping and spaced practice

level-catalog.mjs decorates stable stages with five chapters, clearer titles and
activity labels. It changes no IDs/order or skill groups. spacing.mjs stores
bounded per-skill review dates and recent completed targets in progress.spacing.
learning.mjs integrates selection, fixed-at-start adaptive goals, due review queues
and validated return cursors. Older saves initialise missing fields without
changing pending questions or goals. Main play stays on the forward course; the
explicit review action saves/restores other work. See SPACED-PRACTICE.md.

## v9 close reading and illustration assets

word-choices.mjs owns finite written forms and word-specific confidence. Forms
are choices only, outside ITEMS/target skills. Restored choices are validated
against the specific target's authored forms. Wrong pictures/forms return an
empty audio sequence; main.mjs handles it synchronously and still enters the
normal two-error teaching flow.

reading-data.mjs moves sentence_words to Level 15 and adds phrase_place at 17.
Levels 32/33 use subject/relation/location contrasts with minimum 3/4 choices.
Legacy s_* models/skills remain; curriculumVersion 9 changes only the relevant
comprehension pass flags, preserves exact pending work and advances completed
profiles into new material. Forward success skips already-passed later stages.

image-data.mjs references four content-hashed WebP atlases. pictures.mjs uses
source-aspect SVG viewports, exact seven-object composition and shared AI objects
inside/beside two AI scene backgrounds. No external image runtime or model.
Image checksums are now part of build validation. The explicit package cap is
4 MB for the requested art/extra speech; ordinary builds need only committed
assets. See CLOSE-READING.md and ILLUSTRATIONS.md.
