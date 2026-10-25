# v8 update: clearer numbered levels and spaced practice

The latest request authorises this focused implementation. It does not include
executing the separately deferred image/audio/curriculum redesign below.

- [x] Keep all 32 numbers/IDs; add clearer activity names and five map groups.
- [x] Distinguish hearing a word from reading it independently; label Level 31 as
      word reading within sentences and Level 32 as sentence understanding.
- [x] Replace the tiny last-item penalty with a firm gap between new questions.
- [x] Prefer unseen/weak/due targets; expand review dates after independent success.
- [x] Reduce padding in new rounds while preserving all existing unfinished goals.
- [x] Offer explicit due reviews; preserve paused work and the latest forward cursor.
- [x] All local unit/content and eight browser suites pass; publication state is
      recorded in PROGRESS.md.

Rules and limits: docs/SPACED-PRACTICE.md.

Further curriculum requests from discussion remain pending: introduce common
sentence words earlier (alongside necessary spelling patterns), expand Level 32's
meaningful object/location contrasts with shorter phrases, and address Level 31's
last-noun shortcut. Naming is corrected now; content/order are not changed.

---

# Next update: instruction clarity, picture feedback and illustrations

User feedback recorded 2026-10-19 (Europe/Berlin). **Planning only: do not implement,
generate images/audio, build or deploy until a later authorised run.** The public
app remains the released v7.0.0.

- [ ] **Review Level 18's explanation and audio.** The user reports confusion
      between E and I in the instruction around Tomate/Banane. The current written
      `soft_words` instruction is “Ein e am Wortende klingt oft ganz leicht.
      Hör das Wort und finde es.” Listen to the actual instruction and complete
      target recordings before diagnosing whether this is pronunciation, wording
      or both. The written text has been checked; the audio has not been audited
      for this report. Make the distinction between the letter e and its weak
      word-final sound clear. Final e in Tomate/Banane is normally schwa /ə/,
      not i /ɪ/ and not a forced long /eː/. If the spoken instruction names the
      letter E, it must be unambiguous. Replace the vague explanation with simple,
      concrete wording and appropriate whole-word examples; keep phonetic jargon
      out of the child flow. Review the paired reading level (19) as well.
- [ ] **Stop automatically speaking the selected wrong picture's label.** The user
      encountered this in picture matching, probably Level 17 (exact level
      uncertain). Apply the correction to word-to-picture and sentence-to-picture
      tasks, rather than hard-coding one level number. Keep the current written
      prompt and stationary choices, a brief neutral visual retry indication and
      no progress award. Keep explicit speaker help available and preserve the
      existing two-error teaching of the original task, without independent
      mastery or duplicate rewards. This is an exception to the older wrong-choice
      audio rule: retain selected isolated-sound feedback in letter tasks and
      selected-word feedback for written word-answer tiles. Update the picture
      playback tests instead of retaining the rejected behaviour as a regression.
- [ ] **Replace the current drawings with AI-generated illustrations.** The user
      finds the hand-authored SVGs unattractive and insufficiently recognisable.
      Aim for simple, appealing, child-friendly illustrations with clear
      silhouettes, consistent style, uncluttered backgrounds and no photorealism.
      Avoid text labels on answer images. Establish the style with a small set
      including ambiguous current objects (e.g. Nudel, Leim, Beet, Lama), then
      expand consistently. Reuse recognisable objects in sentence scenes so
      subject/location comparisons remain clear. AI output need not be native
      SVG: optimise and bundle suitable local web assets, preserving stationary
      choices, readable phone-sized images and a lightweight browser app.
- [ ] In the later implementation, review pronunciation and picture recognisability
      directly, then check picture mistakes/help, saved profiles, mobile layouts,
      success feedback and sentence contrasts before republishing. Technical
      decoding alone does not establish that an instruction or picture is clear.

No implementation, synthesis, image generation, tests, build or deployment was
performed for this feedback. Existing voice settings and unrelated working
behaviour are not being changed by this planning entry.

---

# v7 update: from phonics to reading comprehension

- [x] Keep the first fourteen levels and add Levels 15–32 with a larger word bank.
- [x] Separate listening/spelling recognition from independent word-to-picture reading.
- [x] Introduce longer words and spelling patterns with full human recordings.
- [x] Offer optional syllable/pattern support, preserving spelling and assisted status.
- [x] Add short sentence-to-picture reading, including object/location contrasts.
- [x] Keep correct feedback, flower goals, auto-advance and two-error teaching.
- [x] Preserve existing profiles, paused questions and backups; old course finishers continue at Level 15.
- [x] Keep microphone/speech recognition out of scope.

Exact verification/publication state: PROGRESS.md. Teaching sequence and known
limits: docs/READING-CURRICULUM.md. New sounds and pictures need human review;
a successful technical test is not educational validation.

---
Historical release checklists follow.

# v6 update: choice-first practice and isolated feedback

Implemented from the user's latest phone feedback; release status in PROGRESS.md.

- [x] Only Level 1 introduces unseen targets with one choice. Later levels begin
      directly with multiple choices; later word building has no copying model.
- [x] Two mistakes per question/current block trigger a one-choice teaching step:
      first the selected wrong sound, then the original task cue with only the
      correct answer. The guided tap earns nothing extra; original choices return
      for another attempt, preserving order and error history. No false mastery.
- [x] Preserve help phases and partial words through pause, level switches, reload,
      backup and import. Untouched older later-stage introductions become choices.
- [x] Enlarge the flower and improve its contrast. Keep seven sparkles, with larger,
      darker particles moving in from outside; retain reduced-motion support.
- [x] Wrong letters play only that selected sound, including the Fisch → wrong f
      case; never unrelated words or letter names. Original German words remain
      task cues; a wrong whole-word choice plays that selected word.
- [x] Eleven licensed Kalulu phonics extracts with original hashes, selected
      intervals and processing/rights notes; dedicated Einzellaute review filter.
      German listening review remains pending, especially stops and h.

These supersede v5's whole-word fallback for unavailable consonants. No paid API,
new model, engine, hosting configuration or learning-target expansion in this update.

---

# v5 update: feedback from the v4 phone test

Implemented October 18. Exact tests and publication status are in PROGRESS.md.

- [x] Improve visible flower growth and add a small, noticeable sparkle/confetti
      burst on every correct press, including correct word blocks. Keep it brief,
      sparse and local to the feedback/progress area; never move answer targets or
      delay automatic advancement. Preserve cumulative progress, the existing quiet
      success tune and reduced-motion support (static acknowledgement instead).
- [x] Regenerate instruction sentences with the approved **regular Thorsten High,
      length_scale=1.5 and an added 0.3-second pause between sentences**. The user
      selected the final 1.5 setting after comparing slower/faster samples. Preserve human vowel/word targets.
      Samples exist outside source under /workspace/kalulu-browser-build/audio-samples;
      the new instructions now use Thorsten High. Future free-model comparisons are
      separate research in docs/VOICE-OPTIONS.md, not a reason to block this update.
- [x] **Move forward after a successful level:** continue to the next numbered
      level, never silently jump to a lower one because an earlier skill is weaker
      or a lower stage was skipped during testing. Track the learner's continuation
      position separately from the weakest-skill recommendation. Extra needed
      practice can stay within the current level; earlier review should be an
      explicit choice. After the last level show completion/review options rather
      than automatically restarting below. Preserve independent mastery evidence,
      profile isolation and saved-round behavior; a preview jump must not fabricate
      success for skipped levels. Add regression checks for higher-level success
      with incomplete earlier levels and for reload/continue.
- [x] Bundle **Andika**, keeping its default single-storey a and enabling the
      curved-tail lowercase l with OpenType `cv39=1` (`font-feature-settings:
      "cv39" 1`). Use the same bundled font across devices for exercise letters,
      words and blocks. Check l/I/1, a/g and German ä/ö/ü/ß on a phone; retain the
      font license. Feature reference: https://software.sil.org/andika/features/ .
- [x] Make practice levels **approximately 50% longer**: totals 8→12,
      9→14, 10→15 and 12→18 questions. The user finds that initial one-choice
      introductions leave too few independent choice questions before completion.
      Keep introductions brief; allocate the extra questions to independent
      discrimination/practice rather than repeating more one-choice demonstrations.
      Preserve accuracy-based adaptation, automatic advance and a clearly filling
      goal meter. Updated total validation/tests, including completed-level counts,
      while preserving existing profiles and the original goal of already saved
      unfinished levels. These are question counts, not time limits or speed targets.
- [x] Number the exercise stages consistently as **Level 1–14**, retaining their
      descriptive names. Show the current level during an exercise and provide
      easy access to a numbered level selector from the top or bottom navigation.
      Make jumping directly to Level 3/4 (or any other level in parent/debug preview)
      straightforward for testing. Keep the child entrance simple and distinguish
      the exercise level from its question/progress count. Navigation must not
      fabricate mastery, award progress or accidentally discard a saved question.
- [x] On a **wrong answer**, play audio corresponding to the option actually
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
every recording's pronunciation. These changes preserve the current successful feedback and local learner data. Per-level paused sessions permit switching without discarding a question, and old backups migrate their continuation from the pending/highest completed level.

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
