# Goal: a calm, guided German phonics learning path

On October 18 the user confirmed that v2 opened immediately on their phone, worked
well and sounded much better. They requested more content, light gamification,
automatic difficulty, a simple entrance for nonreaders, profiles and resumable progress.
The browser-first direction is retained. No original moving-target games return.

## The learning path

1. **First sounds:** a, m, i, initially one target, then independent discrimination.
2. **More vowels:** o, u, e; previously introduced sounds become distractors.
3. **Short vowels in context:** am /am/, im /ɪm/, um /ʊm/. These are natural whole
   recordings; do not synthesize isolated short vowels or splice them from words.
4. **Combine and distinguish:** ma /maː/, mi /miː/, am, im, um. ma uses the complete
   German word Ma, labelled a practice syllable. The different vowel qualities and
   lengths are deliberate. Whole German words may also be one-syllable teaching units.
5. **Last-sound detective:** identify m, n, l at the end of am/im/um, an/in/man/nun,
   and mal. New n is introduced with both an and in. l is introduced with mal.
   This is explicit final-phoneme awareness; no letter-name recordings of en/el
   are passed off as /n/ or /l/. Natural word contexts retain coarticulation.
6. **New syllables:** an, in, man, nun, mal, after n/l have appeared in final contexts.
7. **Read contrasting words:** Oma, Omi, Mama, Mami. Whole recordings preserve
   pronunciation and stress. Upper/lowercase and variable vowel realization remain
   points for educator review, rather than universal one-letter/one-sound claims.
8. **Build words:** am, im, um, Oma, Omi, Mama, Mami, man, mal, nun. Copy a model
   once for introduction; then hear the word and fill fixed letter slots without it.
   The letter bank supports repeated letters and accepts lowercase tiles for capitals;
   the canonical word is capitalized in its slots, without a capitalization penalty. Harder practice adds a distractor.

The original French Kalulu language pack uses staged grapheme/phoneme introduction,
CV/VC syllables, cumulative decodable words and separate reading/writing flags.
Inspected fr_FR/gp_list.csv, syllables_list.csv, words_list.csv, summary.txt and schema
v1.sql at Kalulu-Languages bb0f71766c5e27fdb775e544ffe62ca98e6a615c.
Those structures inspired the sequence; French vowel/letter mappings were not copied
into German. The existing open-source game is not bundled, and this app does not
inherit evidence of educational efficacy from Kalulu research.

## Automatic progression

A big play button starts/resumes the appropriate activity with spoken guidance.
There is no child-facing requirement to read a menu. Animal avatars identify learners.
An explicit, large arrow follows each successful answer; the target never moves.

A new target is introduced with one choice (or a visible model for word building).
That teaches the association but grants no mastery evidence. Independent completed
questions update first-try accuracy. Two recent first-try successes and at least 75%
across the last up to four responses make a target secure enough for this prototype.
A stage is passed when every target is secure. Session length is at most nine
questions; secure stages may finish early after four. The next play action chooses
the first unfinished stage; after all stages it chooses weaker material for review.

Two recent correct responses allow three choices; five allow four. Two errors in
three independent questions return to two choices. Choices change only for a new
question. Underexposed/uncertain targets come first. After repeated errors a quiet
highlight helps; assisted success cannot count as first-try evidence. No timer,
response-speed scoring, lost lives, erased rewards, public score or daily streak.

## Gentle rewards and usable persistence

Each finished question earns a seed once, including guided introductions. Passing
a stage adds one permanent flower. The small garden grows without making answer
targets move. Feedback has a brief sprout animation; reduced-motion preference removes
it. Incorrect answers never take seeds or flowers away.

Up to eight local learner profiles, optional nicknames and animal pictures. Current
question, answer order, errors, partial word, already-awarded answer and stage progress
survive leaving/reloading. Profiles never share learning state. One browser/device;
JSON export/import transfers all profiles. No login, analytics, server or automatic
cross-device synchronization. Existing v2 progress migrates, without treating earlier
one-choice or unverified answers as new mastery.

## Remaining work

This is a usable expanded prototype, not a complete or clinically validated course.
The user’s positive phone/audio report applies to v2, not automatic approval of new
clips. Review the 12 new human recordings, especially Ma, Mama/Mami and vowel lengths,
and observe an actual child’s final-sound/word-building use. Review the teaching of
short-vowel contexts and capital letters with an educator. Consider more final-sound
examples for l, spaced review, lowercase/capital matching, additional graphemes and
explicit blending models only after that feedback. Continue purpose-recording with
one consistent native speaker if mixed recording voices prove distracting.
