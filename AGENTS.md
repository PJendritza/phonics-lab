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

Latest post-v9 feedback is planning only: record sentence grammar/audio corrections
(Eine Maus, not Ein Maus) and later investigate Level 33 im/am mixing. See the first section of docs/NEXT-VERSION.md; do not implement or
deploy that next update until requested. The completed v9 authorisation follows.

The latest request authorises close written word alternatives AND the previously
planned instruction, picture-feedback, AI-art and comprehension changes. v9 implements
them; see docs/CLOSE-READING.md and docs/ILLUSTRATIONS.md. Do not keep treating the
older planning-only hold as current. Keep speech recognition out of scope.

Correct answers produce a brief nonverbal chime/check and automatically advance
about 340 ms after a complete response, with a small local sparkle and growing flower. No spoken success praise or per-question
next button. Every correct choice visibly advances the fixed level goal, including
partial grapheme blocks. New goals adapt to target count and independent accuracy (3–18 questions); saved pending goals stay unchanged and a round never finishes before its fixed goal. Completing
a level adds a flower; this rewards practice, while independent accuracy separately
controls mastery/unlocking. Wrong letters play only the selected isolated sound through PHONEMES, never another word or prefixed beginning/ending instruction. Wrong real written-word choices with a recorded model play that word. Picture choices and invented written forms remain silent; after two errors only the original correct task is modelled. Keep choices stationary and award no progress. Never cover selected-option feedback with automatic original-target replay.
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

Audio: 76 complete human target recordings, 11 isolated Kalulu phonics clips, 22 full-sentence Piper instructions and 26 optional sentence/phrase readings including six legacy sentences,
one nonverbal effect. Three legacy synthetic comparisons are adult-review only.
Never synthesize isolated phonemes, substitute letter names, crop consonants/vowels
from words, or stitch long vowels into short-vowel words. German whole words remain the beginning/ending cues. Isolated wrong-letter feedback is taken from dedicated Kalulu phonics recordings, not words: ten complete first sound utterances before a long pause; h uses the unvoiced breath of a phoneme-only /h/ sample. Source French/Portuguese phones are not certified native-German recordings. Preserve per-clip source segment, license and processing notes; especially review stops and h by listening. b/d/g are initial; final s differs from voiced initial s.
sch and ll are grapheme blocks. Preserve source/license versions and original/output
hashes. See docs/AUDIO.md and app/audio/manifest.json. Technical decode tests cannot
prove pronunciation or educational efficacy; new material needs native/educator review.

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

Reading: 33 levels; keep the first 14 IDs/numbers stable. Level 15 is the moved common-word stage; Level 17 is new phrase comprehension; 32/33 use subject/relation/place contrasts. See docs/READING-CURRICULUM.md.
New word/picture and sentence/picture levels must never automatically read the
answer aloud. Generic entry instructions are allowed. Explicit read-aloud or
syllable help sets round.assisted and cannot count as independent first-try mastery;
preserve it across navigation, reload and backup. Whole-word human speech stays
separate from pre-generated full-sentence help. Do not add new words to isolated
phone feedback/build banks without real phoneme recordings. Phrase/sentence distractors
must contrast subject and relation; advanced sentences also contrast location. CurriculumVersion 9 preserves stable IDs/history/goals, allows old legacy sentence tasks to resume exactly and reassesses the expanded comprehension flags. Previously completed courses enter new phrases; v6 completion enters sentence words. Skip already-passed forward stages rather than replaying old material.
AI-generated WebP illustrations are composed using SVG; sources/hashes/prompts are documented. Keep sprite aspect ratios exact so adjacent cells cannot leak. Current v9 uses seven generated balls; the pending user-requested replacement is the numeral 7 for sieben and numerals for other number words. Do not retain the ball-count requirement in the next implementation. New vocabulary and artwork need human review. Total illustrated static-site budget is 4 MB; media are on demand.

Grouping/spacing: preserve stable IDs and the first 14 numbers; v9 has 33 levels. level-catalog.mjs defines five
chapters and honest activity names. spacing.mjs prevents the same target in the
last two completed questions (pool >=3), favours weak/due work and expands dates
1/3/7/14/30 days. No speed scoring or validated-memory claims. Optional due reviews
must preserve/update the latest forward cursor, paused questions and one-time
awards; never silently send the main path backwards. Save/validate spacing and
review queues with the existing v3 key; missing metadata must not erase progress.
New goals are sized before starting; all existing unfinished totals remain exact.
See docs/SPACED-PRACTICE.md. v9 close-choice challenge affects whole-word recognition only: use curated same-initial one-letter forms for confident word learners, ease after errors, never give forms speech/skills/mastery/review entries. Do not use homophone/silent-letter/doubling traps. Picture mistakes remain silent. Meaning exercises need 3 basic or 4 advanced choices to prevent single-keyword solutions.

After functional changes run node --test tests/learning.test.mjs tests/content.test.mjs tests/reading.test.mjs tests/spacing.test.mjs tests/close-reading.test.mjs,
python3 scripts/audit_audio.py, python3 scripts/build.py and relevant Playwright
checks. tests/browser.cjs checks actual playback/automatic flow and binds evidence
to the app tree hash. Also run tests/mobile-smoke.cjs, tests/profiles.cjs and
tests/word-hints.cjs and tests/level-navigation.cjs plus tests/choice-help.cjs when those behaviors change. Run tests/close-reading.cjs for word/AI-art/migration/comprehension changes. Run tests/reading.cjs for reading/help/comprehension changes and tests/spacing.cjs for grouping/repetition/review changes. Exercise the /phonics-lab/ prefix.
Chromium emulation is not a physical-phone test. Keep exact commands/results/limits
in PROGRESS.md and concise JSON in docs/verification; screenshots outside Git.

Publish clean tested main with scripts/publish.py and a fresh external checkout.
It requires pushed source, current app-hash-bound browser, reading, spacing and close-reading evidence, and checksums.
Do not change Pages settings. Verify all HTTPS bytes with scripts/verify_live.py.
Later documentation-only commits are distinct from the deployed app source commit.
License: project CC BY-SA 4.0; individual recordings CC BY-SA 3.0/4.0. Preserve credits.
