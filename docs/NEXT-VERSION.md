# Next version: feedback from the v4 phone test

Recorded October 18. Planning notes only; not implemented or deployed.

- [ ] Improve visible flower growth and add a small, noticeable sparkle/confetti
      burst on every correct press, including correct word blocks. Keep it brief,
      sparse and local to the feedback/progress area; never move answer targets or
      delay automatic advancement. Preserve cumulative progress, the existing quiet
      success tune and reduced-motion support (static acknowledgement instead).
- [ ] Regenerate instruction sentences with the approved **regular Thorsten High,
      length_scale=1.35 and an added 0.2-second pause between sentences**. The user
      preferred the generated 3.87-second sample. Preserve human vowel/word targets.
      Samples exist outside source under /workspace/kalulu-browser-build/audio-samples;
      the website still uses Thorsten Medium. Future free-model comparisons are
      separate research in docs/VOICE-OPTIONS.md, not a reason to block this update.
- [ ] **Move forward after a successful level:** continue to the next numbered
      level, never silently jump to a lower one because an earlier skill is weaker
      or a lower stage was skipped during testing. Track the learner's continuation
      position separately from the weakest-skill recommendation. Extra needed
      practice can stay within the current level; earlier review should be an
      explicit choice. After the last level show completion/review options rather
      than automatically restarting below. Preserve independent mastery evidence,
      profile isolation and saved-round behavior; a preview jump must not fabricate
      success for skipped levels. Add regression checks for higher-level success
      with incomplete earlier levels and for reload/continue.
- [ ] Bundle **Andika**, keeping its default single-storey a and enabling the
      curved-tail lowercase l with OpenType `cv39=1` (`font-feature-settings:
      "cv39" 1`). Use the same bundled font across devices for exercise letters,
      words and blocks. Check l/I/1, a/g and German ä/ö/ü/ß on a phone; retain the
      font license. Feature reference: https://software.sil.org/andika/features/ .
- [ ] Make practice levels **approximately 50% longer**: proposed totals 8→12,
      9→14, 10→15 and 12→18 questions. The user finds that initial one-choice
      introductions leave too few independent choice questions before completion.
      Keep introductions brief; allocate the extra questions to independent
      discrimination/practice rather than repeating more one-choice demonstrations.
      Preserve accuracy-based adaptation, automatic advance and a clearly filling
      goal meter. Update total validation/tests, including completed-level counts,
      while preserving existing profiles and the original goal of already saved
      unfinished levels. These are question counts, not time limits or speed targets.
- [ ] Number the exercise stages consistently as **Level 1–14**, retaining their
      descriptive names. Show the current level during an exercise and provide
      easy access to a numbered level selector from the top or bottom navigation.
      Make jumping directly to Level 3/4 (or any other level in parent/debug preview)
      straightforward for testing. Keep the child entrance simple and distinguish
      the exercise level from its question/progress count. Navigation must not
      fabricate mastery, award progress or accidentally discard a saved question.
- [ ] On a **wrong answer**, play audio corresponding to the option actually
      selected, so the learner hears what they clicked. Keep the same question and
      stationary choices, with no progress award. The original cue remains available
      via replay. Do not immediately cover the selected-option audio with the old
      automatic target replay. For context exercises, choose an appropriate verified
      human recording/context for that option; isolated consonant samples are not
      currently available. Do not substitute letter names or crop sounds from words.
- [x] Clarification: **correct answers keep the current brief success tune/check,
      progress increment and automatic advance**. Do not add spoken correctness
      feedback or an additional selected-letter playback on successful answers.

The user reports that the current version works pretty well while testing it on
their phone and likes the existing feedback. This does not independently certify
every recording's pronunciation. Next implementation should cover these planned
changes, preserving the current successful feedback and local learner data.

## Previous interaction update: implemented in v4

User feedback, clarified October 18: small immediate feedback plus a persistent,
clearly growing level goal on every correct click. Not just a transient check.

- [x] Independent name Phonics Lab throughout app/pages/README.
- [x] User renamed repository to phonics-lab; origin and new Pages path verified.
- [x] Minimal profile/start entrance; decorative slogans removed.
- [x] Automatic advance after complete answers, no per-question next button.
- [x] Brief nonverbal sound/check, no spoken success messages; reduced-motion support.
- [x] Wrong answers stay with stable choices, replay and time; accuracy drives adaptation.
- [x] Fixed cumulative level meter/flower, fractional word-block increments and
      completed-level flower field; practice goals remain separate from mastery.
- [x] Parent/debug map retains later-stage preview checkbox.
- [x] Six new stages: beginning/ending consonants, short words, reading/block building.
- [x] Human complete-word recordings; no synthetic isolated consonants/letter names.
- [x] Preserve local profiles, migration, backup and exact resume.
- [x] Preserve Kalulu inspiration and individual audio/source/license credits.

Current release evidence/publication status: PROGRESS.md. Future review: native
listening of new words/contexts, child observation, consistent speaker if needed,
more context examples and educator review before treating this as a complete course.
