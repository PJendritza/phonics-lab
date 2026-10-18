# Goal: calm, explicit German phonics in a browser

The user’s October 18 feedback changes the direction: keep sound-to-letter learning,
replace stressful moving Godot games and poor isolated synthetic speech. The app
should be lightweight, modern, stationary, understandable on a phone and easy to
review with an adult. Animation is unnecessary; colors and filled word slots are
sufficient feedback. No time pressure or penalty for an incorrect answer.

## Demonstration now

- **Discover sounds:** hear a human recording, find its printed letter. One choice
  provides an initial association; two/three choices require discrimination. Replay
  is explicit. A wrong answer keeps the exact same choices and positions. The child
  presses Weiter after success; the app never advances on a timer.
- **Hear combinations:** am /am/, im /ɪm/, mi /miː/. Whole recordings preserve
  coarticulation. This is a preview: introduce short /a/ and /ɪ/ explicitly before
  treating it as an instructional next lesson. One printed letter can represent
  more than one vowel quality/length; do not conceal that fact.
- **Build a word:** hear am, im, Oma; choose successive letters into fixed slots.
  This previews spelling/segmentation, beyond recognition. Oma adds /oː/ and capital
  O. It uses the natural whole-word recording, not concatenated long vowels.

Letter and syllable practice reuse weak/underexposed targets after a completed
introductory sequence. This is a small deterministic heuristic, not a diagnostic
reading model. It uses first-try success and exposure, not response latency.
Word building currently repeats the three fixed examples; no invented mastery claim.

## Next learning design

1. Native-speaking adult reviews every current clip in Töne prüfen, especially m
   (a natural closed-mouth hum sourced from hm), all vowel endings and am/im.
   Replace questionable clips with purpose-recorded phonemes by one consistent
   native speaker. Use the same recording conditions and licensing consent.
2. Educator reviews grapheme order, instructions and the distinction between
   recognition, blending, segmentation and spelling. Add a separate controlled
   short-vowel introduction and an explicit o introduction. Expand only after those
   work, rather than generating six unchecked lessons or pretending to have a course.
3. Add a guided blending demonstration (continuous /m/ into /aː/, with a vetted
   natural recording) and additional decodable real words when the grapheme set
   supports them. Avoid fake words being presented as normal German words.
4. Observe use on an actual iPhone/Android and tablet: sound audibility, gesture
   playback, touch accuracy, cognitive load. Chromium emulation cannot establish
   real Safari compatibility or appropriateness for a child.
5. Add richer local learner profiles and resuming unfinished lessons if needed.
   Account-based device synchronization is a separate future decision; keep the
   persistence boundary and versioned schema ready, without building a server now.

No new engine, large dependency, gamified redesign, tracking, account system,
scheduling, commercial voice API or automatic expansion into an unreviewed course.
