# Goal: calm, guided German phonics

Phonics Lab is a browser-only prototype inspired by Kalulu’s staged grapheme/phoneme,
syllable and word practice. It keeps stationary choices, human target audio and
accuracy-based adaptation. No moving-target games, engine, countdown or speed scoring.
The product name is independent of the current flower presentation.

## Fourteen stages

1. First sounds: a, m, i; one-choice introductions then discrimination.
2. More vowels: o, u, e.
3. Short vowels in complete words: am /am/, im /ɪm/, um /ʊm/.
4. Combine/contrast: ma /maː/, mi /miː/, am, im, um.
5. Last sounds: m/n/l in am/im/um, an/in/man/nun and mal.
6. New syllables/short words: an, in, man, nun, mal.
7. Read: Oma, Omi, Mama, Mami.
8. Build: am, im, um, Oma, Omi, Mama, Mami, man, mal, nun.
9. Beginning sounds f/n/l/sch in Fisch/Feder, Nase/nun, Löwe, Schaf/Schuh.
10. Beginning sounds b/d/g/h in Ball/Baum, Dose/Dach, Gabel/Gans, Hut.
11. End sounds f/s/sch/t/k in Schaf/auf, Bus/Eis, Fisch/Tisch, Hut/rot, Park.
12. More syllables and short words: da, du, Bus, Hut, Fisch, Schaf.
13. Read contrasting words: Fisch, Schaf, Hut, Ball.
14. Build those four words with sch and ll as single grapheme blocks.

Capitalized nouns retain canonical spelling. Lowercase block taps are accepted for
capitals without a case penalty. sch is one grapheme, not three independent sounds;
ll is one doubled-consonant spelling block. These tasks introduce block matching,
not a claim that all German sound/spelling relationships are one-to-one.
ma/mi use whole recorded Ma and mi as teaching units. Natural words preserve short
vowels, coarticulation and stress; vowels/consonants are never cropped from them.
Consonant context identification still uses complete German task words. Feedback for a selected letter uses that isolated phone; no unrelated context word is played. See docs/PHONEMES.md for the shared Kalulu phonics sources and pending listening review. Initial
b/d/g avoid German final devoicing; final s here is /s/, not voiced initial /z/.
Some targets have only one context word; expand after native/educator review.

Inspiration inspected: Kalulu-Languages bb0f71766c5e27fdb775e544ffe62ca98e6a615c,
fr_FR/gp_list.csv, syllables_list.csv, words_list.csv, summary.txt and schema v1.sql.
French mappings were not copied into German. Kalulu research does not validate this app.

## Flow, progress and adaptation

Minimal entry: animal profile plus large play/continue. Spoken instruction and replay
let nonreaders practise. Correct answers give a brief nonverbal chime/check and small local sparkle and advance
automatically after about 340 ms. No per-answer next button or spoken praise. Incorrect
letters play only the selected isolated sound; wrong whole-word choices play that word. After two mistakes, show only the correct answer with the original task cue, then restore the same choices. Guided taps earn no extra points or progress. Correct normal answers alone finish the question. Choice positions remain stable; no speed pressure.

The level meter has a fixed total: fourteen questions for the original stages, 12–18 for
new ones (about 50% longer). Existing saved goals retain their original totals. Never finish early. Every correct selection moves the cumulative meter;
a correct block is a fraction of its word question. Completing the goal produces a
flower and a level-boundary play button. A flower rewards practice even if assisted;
it is separate from mastery. Completed levels accumulate in the flower field.

Only Level 1 uses one-choice introductions, which earn practice progress but no independent mastery. Later levels start immediately with multiple choices, without copying models. Guided help appears after two mistakes per question/block. It never grants independent success or doubles the question award.
Mastery requires two recent first-try independent successes and >=75% across the
last up to four. All stage targets must qualify to unlock the next guided stage.
If not, the next practice stays in the current level, favoring weak/underexposed material.
Two recent successes permit three choices; five permit four; two recent errors ease
the next question. Choice positions only change between questions. No time metric.
After a successful level, continuation points to the next numbered level even if earlier ones were skipped. Earlier review is explicit, not automatic. After the last success the learner chooses any review level. Parent preview
can open later stages without falsely setting mastery.

## Persistence and limits

Up to eight browser-local profiles; exact question order, per-level paused sessions, continuation position, attempts, partial blocks
and already-awarded response survive pause/reload. Confirmed JSON export/import
transfers profiles; no accounts/server sync. Existing v2/v3 data remains compatible.
Reduced-motion disables decorative animation; the static meter still shows progress.

This remains a partial experimental curriculum. Next: native listening review of
new words/contexts, actual child use, vowel length/capitalization/blending review
with an educator, and a consistent speaker if mixed voices distract. No scientific
or pronunciation-quality certification is implied by decode/playback tests.

Bundled Andika-based letterforms use curved l and single-storey a consistently on devices. Full-sentence instructions use the approved Thorsten High setting 1.5 with an added 0.3-second sentence pause; human target recordings are preserved.
