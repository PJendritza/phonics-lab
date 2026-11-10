# Phonics Lab development instructions

Read this file, PROGRESS.md and recent Git history before continuing. Canonical
repository: https://github.com/PJendritza/phonics-lab. Use /workspace/Kalulu-DE;
do not recreate tmp or create worktrees without a specific need/request.
The local directory intentionally retains its old name. Product: Phonics Lab.
Repository rename is verified; website: https://patrickjendritza.com/phonics-lab/ .
Keep Kalulu inspiration and historical/source/audio credits in About. Preserve
legacy storage keys and existing backups; a name/path change must not erase learners.

Goal: a calm, lightweight German phonics app using plain HTML/CSS/ES modules.
No game engine, moving answer targets, countdowns, speed scoring or lost lives.
Minimal entrance: profile plus large start/continue. Keep the parent stage map and
its preview checkbox. See docs/GOALS.md and docs/NEXT-VERSION.md.

Latest authorised update is v15: smaller triangular story pool, real mouse/pen/
touch dragging as well as tap/keyboard, and three new short animated stories in
existing Level 36. Eleven stories total; first 35 IDs/Etappen unchanged. See
docs/STORY-DRAG-ANIMATION.md and docs/curriculum/STORIES-V15.txt. Three correct
complete orders per round. Only the three new stories offer an 8.4-second 2D
reward scene after success; explicit Weiter may skip it, replay never scores.
The original eight retain fast automatic advance. Never animate answer targets.
Reduced motion shows three stills; optional narration only after success (or the
existing two-error help). Reset preserves errors/help, and solved resume never
scores twice. Saved orders may contain explicit null holes: use fullStoryOrder,
not array length, before checking. Preserve old compact arrays and earned v14
completion flags; current eleven-story mastery is separate, with extensions
labelled. Curriculum 15; original v3 storage/backup keys unchanged.
Physical story taps are handled by pointerup; avoid duplicated compatibility
clicks. Keyboard/assistive clicks with detail 0 remain supported. Cancelled drags
must never persist a placement. Keep current-hash browser gates, including both
story-order.cjs and story-drag-film.cjs. 150 inventory forms, 654 audio clips,
nine atlases/92 sprites; no runtime dependencies, video APIs, or GPU required.

Historical v14 rules (v15 supersedes pool geometry and new-story progression):
Latest authorised update is v14: Oliver's new Level 36 story_order, with eight
three-sentence mini-stories and tap-to-order picture sequences. See
docs/STORY-ORDERING.md. First 35 numbers/IDs and Etappen remain. A new sixth
chapter groups stories; old "35/no extra levels" instructions below are historical.
Do not turn story mode into listening or single-picture matching. Three complete
orders per round; only a correct whole sequence scores. Keep fixed tray positions,
readable full text, remove/reinsert taps, explicit Prüfen and Zurücksetzen. Reset
restores the initial shuffled tray and never erases attempts or assistance. No
initial sorted answer tray or per-position correctness hints. Story mode never
automatically enters one-choice teaching; two wrong full checks unlock only
opt-in full-story speech. Info remains a generic guide. All selected/checked/solved
states survive pause/reload/profile backup with no duplicate reward. v3 storage
remains, curriculum is 14; prior course ends/review return paths enter Level 36.
Story success counts as sequence evidence, never constituent-word mastery. The
eight stories reuse existing consistent art and add five context forms (es/er/sie/
dann/danach); inventory 136 forms, 651 audio clips. No new models/dependencies.
Run tests/story-order.cjs and all prior release gates; publisher requires its
current-hash v14-stories.json evidence. Use tests/helpers/story-fixture.mjs only
to prepare correct sequences in older course fixtures, not to bypass UI checks.

Latest authorised implementation is v13: four finite named Etappen each in
Levels 33–35, correct attached apple-at-tree art, researched everyday vocabulary,
parent coverage/independent evidence and within-level due Etappe interleaving.
See docs/READING-ETAPPEN.md and docs/curriculum/USEFUL-WORDS-V13.md. No extra level
numbers. Original IDs remain; scene counts are 80/105/102 and inventory 131 forms.
Reading Path data version 1 supplements v3 storage; curriculumVersion is 13.
Preserve exact legacy pending sessions and multi-Etappe paused keys. Old awards
stay; new people/food units are extensions, never inferred from old completion.
Do not infer individual-word mastery from correct sentence images or listening.
New mixed rounds have 8–12 questions; old saved goals remain unchanged. Etappe
completion requires varied independent evidence and at least two rounds. New
content must use a separate versioned unit, not silently change a completed goal.
The apple "am Baum" must visibly attach to a branch in EVERY answer variant.
New vocabulary is contextual sentence reading with full-utterance optional help,
not additional isolated TTS phones. Mass nouns Wasser/Milch do not take a forced
ein/einem. New directions/speech-gating/silent-picture rules remain in force.
Keep confirmed backup imports bounded to four MB (eight extensively practised
profiles can exceed one MB), with strict validation. Paused Etappen must remain
selectable even after the learner temporarily visits an earlier level.
Run tests/reading-path.cjs after path, tracking, migration, reading art or new-word
changes; scripts/publish.py requires its current app-hash-bound evidence too.

Latest authorised update is v12: add articles to shortened noun phrases, use
correct dative after mit, replace ambiguous Becher with Ballon, improve the duck
art and add an alphabetic active-word inventory at words.html (parent/About links).
Inventory must derive from live task texts/cues, not draft banks or invented
forms. Keep singular/plural word forms and level mapping, search and CSV export.
Internal legacy IDs containing becher remain for resume; visible text/audio/art
use Ballon. Requeue affected recent mastery without deleting historical totals.

Latest authorised release is v11: append two mixed reading levels (34/35), overhaul
all child directions, make directions small with an explicit info replay, gate
reading speech after two errors and remove the foreign Kalulu sound clips. Earlier
holds or isolated-phoneme playback requirements below are superseded. See
docs/CHILD-GUIDANCE.md. Do not restore rejected French/Portuguese phones, fabricate
German phonemes using TTS/letter names, or crop sounds from whole words. Until
licensed appropriate German isolated models exist, unsupported consonants are
silent visual retries. The six retained German letter/hum clips and all whole
human word models remain. Archived Kalulu attribution is historical, not active.

Correct answers produce a brief nonverbal chime/check and automatically advance
about 340 ms after a complete response, with a small local sparkle and growing flower. No spoken success praise or per-question
next button. Every correct choice visibly advances the fixed level goal, including
partial grapheme blocks. New goals adapt to target count and independent accuracy (3–18 questions); saved pending goals stay unchanged and a round never finishes before its fixed goal. Completing
a level adds a flower; this rewards practice, while independent accuracy separately
controls mastery/unlocking. Only approved German entries in PHONEMES play on wrong letters; all other consonants stay silent. Never substitute another word or a letter name. Wrong real written-word choices with a recorded model play that word. Picture choices and invented written forms remain silent; after two errors only the original correct task is modelled. For picture reading the model is opt-in, never automatic. Keep choices stationary and award no progress. Never cover selected-option feedback with automatic original-target replay.
Animations affect feedback/progress only; respect reduced motion. Successful current levels advance to the next numbered level, even with unfinished earlier levels; never automatically select an earlier weak stage. Earlier review and post-final-level review are explicit choices. A level-boundary
play button is intentional. Theme presentation must remain interchangeable.

Layout: app/ is the complete static website; scripts/ builds, publishes and prepares
audio; tests/ holds learning/browser checks; docs/ records provenance and evidence.
main is source; gh-pages generated deployment. Use feature branches, normal commits
and pushes. Preserve user changes. No force pushes, repository deletion/visibility
changes, recurring scheduling, production accounts or new hosting without explicit
authorization. Updating the existing demo is authorized in demo-development requests.
Old Godot assets remain in archive tags, outside the active app.

Generated builds/checkouts belong outside source (/workspace/kalulu-browser-build).
Keep model/audio caches external. Do not commit engines, models, dependencies or
bulk upstream assets. Keep TLS/checksum verification; use existing Git auth without
extracting tokens. Preserve content-derived asset queries for returning phone caches.

Fonts: locally bundled OFL subsets of Andika 7.000, internally renamed Phonics Lesson to respect reserved names. Keep cv39=1 curved l and default single-storey a; preserve license and content-hashed filenames. See docs/FONTS.md.

Learning: only Level 1 introduces unseen targets with one choice. All later levels begin with choices, including word building without a copying model. After two mistakes per question/current block, finish any applicable selected-sound feedback (none for pictures/forms), then show the original cue with one correct choice. A guided tap gives no extra score/progress and returns to the original choices. Preserve help pending/show/ack and misses through navigation/reload; never treat assisted completion as first-try mastery.

Audio v11: 76 complete human models, 23 short full-sentence instructions, 460
full/short optional sentence/phrase models and one effect (560 total); no active
Kalulu phoneme clips. All 76 human hashes are unchanged. Human letter sources are
De-a/De-i/De-O/De-e/De-u and the existing German hm recording. Do not claim new
native isolated consonant recordings were obtained: the verified replacement
source remains missing. Commons metadata search returned HTTP 403. Technical
checks do not certify pronunciation. Retain archive provenance and pending review.
Instructions contain no vowel/consonant terminology. Generate task-guides.mjs
from both instruction JSON files with scripts/prepare_guides.py, and regenerate
complete Piper instruction clips with the approved voice settings. No paid API.

Progress: schema version 3 and kalulu-de:learners:v3 remain deliberately unchanged.
Up to eight animal profiles, a separate continuation cursor and per-level paused questions, exact pending/partial-word resume and confirmed backup
import/reset/deletion. Preserve v2 migration and its original key. Demonstrations
never become independent mastery. Accuracy/underexposure drive adaptation, never
response time. Save before auto-advance, cancel navigation timers/audio, and never
award twice after pause/reload. Failed storage still permits in-memory practice.
No tracking, accounts, uploads, paid APIs or cloud sync without a separate decision.
User budget preference: use free/local generation; do not propose paid services or
assume ChatGPT Plus/Google subscription access includes external API/GPU credits.
Current instruction voice: Thorsten High, length_scale=1.5, added 0.3-second
sentence pause. See docs/NEXT-VERSION.md before implementing the next release.

Reading: 35 levels; keep the first 14 IDs/numbers stable. Level 15 is the moved common-word stage; Level 17 is new phrase comprehension; 32/33 use subject/relation/place contrasts. See docs/READING-CURRICULUM.md.
New word/picture and sentence/picture levels must never automatically read the
answer aloud. Generic entry instructions are allowed. Explicit read-aloud or
syllable help sets round.assisted and cannot count as independent first-try mastery;
preserve it across navigation, reload and backup. Whole-word human speech stays
separate from pre-generated full-sentence help. Do not add new words to isolated
phone feedback/build banks without real phoneme recordings. Phrase/sentence distractors
must contrast subject and relation; advanced sentences also contrast location. CurriculumVersion 11 preserves stable IDs/history/goals, allows old legacy sentence tasks to resume exactly and reassesses the expanded comprehension flags. Previously completed courses enter new phrases; v6 completion enters sentence words. Skip already-passed forward stages rather than replaying old material.
AI-generated WebP illustrations are composed using SVG; sources/hashes/prompts are documented. Keep sprite aspect ratios exact so adjacent cells cannot leak. Number words use numerals; quantity+noun tasks use exactly counted objects. New vocabulary and artwork need human review. Total expanded static-site budget is 14 MB; media are on demand.

v11 retains all original 33 IDs/numbers and appends reading_animals (34, 80 tasks)
and reading_everyday (35, 76 tasks). Never add follow-on targets to Level 33.
Completed v10 profiles continue at 34; exact unfinished tasks remain intact.
Directions do not autoplay. The info control plays only a short generic direction,
never a reading answer. readingAudioAvailable gates the sentence speaker until
two wrong attempts, including reload/navigation; no autoplay even in teaching.
Visual syllable help remains separately assisted. Reserve help space to keep
choices stationary. Directions stay 12px; reading targets remain large.

v10 retained all 33 IDs/numbers. Level 17/32 each have 14 location targets, Level
18/19 nine word targets and Level 33 eighty mixed targets from six families.
A normal new mixed round balances families and includes im/am; on/under use
table/chair, not ambiguous am/under-tree scenes. Actual errors beat unseen items
after two intervening completions. Optional due-only reviews remain targeted.
Persist completedTargets through exact resume and validate bounded IDs. Short
texts have their own matching shortAudio cue; help never confers independent
mastery. Level 33 completion uses successful representative family/quantity/relation
coverage plus recent independent accuracy, not mastery of every text in the bank.
New contextual words include previously untaught graphemes/plurals; do not claim
this is already a complete phonics curriculum. Keep them documented and helpable.

Grouping/spacing: preserve stable IDs and the first 14 numbers; v11 has 35 levels. level-catalog.mjs defines five
chapters and honest activity names. spacing.mjs prevents the same target in the
last two completed questions (pool >=3), favours weak/due work and expands dates
1/3/7/14/30 days. No speed scoring or validated-memory claims. Optional due reviews
must preserve/update the latest forward cursor, paused questions and one-time
awards; never silently send the main path backwards. Save/validate spacing and
review queues with the existing v3 key; missing metadata must not erase progress.
New goals are sized before starting; all existing unfinished totals remain exact.
See docs/SPACED-PRACTICE.md. v9 close-choice challenge affects whole-word recognition only: use curated same-initial one-letter forms for confident word learners, ease after errors, never give forms speech/skills/mastery/review entries. Do not use homophone/silent-letter/doubling traps. Picture mistakes remain silent. Meaning exercises need 3 basic or 4 advanced choices to prevent single-keyword solutions.

After functional changes run node --test tests/*.test.mjs,
python3 scripts/audit_audio.py, python3 scripts/build.py and relevant Playwright
checks. tests/browser.cjs checks actual playback/automatic flow and binds evidence
to the app tree hash. Also run tests/mobile-smoke.cjs, tests/profiles.cjs and
tests/word-hints.cjs and tests/level-navigation.cjs plus tests/choice-help.cjs when those behaviors change. Run tests/child-guidance.cjs, tests/mixed-reading.cjs and tests/close-reading.cjs for word/AI-art/migration/comprehension changes. Run tests/reading.cjs for reading/help/comprehension changes and tests/spacing.cjs for grouping/repetition/review changes. Exercise the /phonics-lab/ prefix.
Chromium emulation is not a physical-phone test. Keep exact commands/results/limits
in PROGRESS.md and concise JSON in docs/verification; screenshots outside Git.

Publish clean tested main with scripts/publish.py and a fresh external checkout.
It requires pushed source, current app-hash-bound browser, reading, spacing, close-reading v10 mixed-reading and v11 child-guidance evidence, and checksums.
Do not change Pages settings. Verify all HTTPS bytes with scripts/verify_live.py.
Later documentation-only commits are distinct from the deployed app source commit.
License: project CC BY-SA 4.0; individual recordings CC BY-SA 3.0/4.0. Preserve credits.
