> v15 adds drag/tap ordering, a triangular small-card pool and three animated stories. See [current behavior](STORY-DRAG-ANIMATION.md). Earlier eight-story details below are historical.

# Level 36: read a mini-story and order its pictures (v14)

Oliver's proposed exercise is implemented as one appended numbered level,
story_order, in a sixth chapter, Geschichten verstehen. All first 35 level IDs,
numbers, targets and saved Etappen remain. Eight stories contain three short
sentences and three corresponding event pictures with one consistent protagonist.
The actual texts and frame IDs are in app/stories.mjs and the readable export
docs/curriculum/STORIES-V14.txt. This is an initial sequence-comprehension task,
not an assessment of general reading fluency or broad story comprehension.

## Interaction

- The complete written story stays visible while arranging; it is a reading
  task, not a memory-only test. No initial solution speech, timer or moving targets.
- Three numbered empty slots precede a shuffled tray of three image buttons.
  Tapping a picture fills the next slot. Tapping a placed picture removes it;
  remaining placed pictures close the gap. Keyboard buttons work too.
- The unused tray cells retain their positions. Initially the tray is never the
  correct answer order. Correct order is determined only by the story text.
- Prüfen is enabled only for a full sequence. A wrong complete sequence stays
  visible/editable with a general retry message; no per-position correctness,
  unrelated word playback or automatic answer reveal.
- Zurücksetzen clears the three slots and restores the exact initial tray. It
  never changes the story, trial count, reading assistance or learner profile.
- One fully correct sequence earns one progress unit/chime and advances after
  the existing short delay. Individual placements and incorrect checks earn
  nothing. A fixed round contains three stories and then adds one flower.
- After two incorrect COMPLETE checks, optional full-story speech becomes
  available. It does not autoplay, reorder the pictures or become a one-choice
  demonstration. Explicit playback marks the trial assisted. The small info
  button plays only the generic direction. Audio failure leaves ordering usable.

On short phones the story can scroll naturally; it retains readable 21px+ text,
60px+ picture cards and 44px+ buttons. Four-picture older exercises retain their
existing above-the-fold layout. Screenshots stay outside Git.

## Content and reuse

The child stories reuse the identical yellow-shirt child in existing waking,
reading, eating, drinking and sleeping pictures. Cat/dog stories use the same
existing actor artwork in place and sleeping scenes. No new raster art or model
dependency is needed. The same three event cards are deliberately used in
different textual orders for two pairs of stories, so visual plausibility alone
does not determine every answer. The text must be consulted.

Pronouns es/er/sie have explicit grammatical antecedents (das Kind, der Hund,
die Katze). New context words es, er, sie, dann and danach are declared in the
level, reflected in the alphabetical inventory, and modelled in optional complete
utterances. Inventory grows from 131 to 136 word forms. No claim is made that all
these words or their spelling patterns were separately mastered before this task.
Story titles are orientation captions, not extra target vocabulary.

Eight optional story readings and one short guide were generated with the
approved free local Thorsten High setup: length_scale 1.5, added sentence pause
0.3 seconds. Human models and all old audio remain byte-identical. There are now
651 active clips: 76 human, 24 guides, 550 utterances, one effect. No isolated
phones are synthesised and no runtime TTS, recording, speech recognition, paid
API, new account or server storage is introduced.

## Progress and compatibility

The v3 storage key/schema stays. Curriculum version is 14. Round metadata adds
order (chosen frame IDs) and checked (last full arrangement submitted). The
initial shuffled tray, story text ID, attempts, optional help, chosen sequence,
wrong-check feedback and solved state persist through reload, same/different
level selection, profile switching and confirmed JSON backup/restore.

Submission validates the full permutation; unknown/duplicate frames, inconsistent
checked/solved flags and impossible help states are rejected at import. Reset
cannot turn an assisted/wrong trial into an independent first-try success, and
resuming a solved sequence cannot award twice. Existing spacing operates on the
whole story ID. Secure first-try retrievals get delayed reviews; errors are
interleaved with other stories. Explicit story-review rounds are capped at three
stories rather than eighteen. Mastery uses the existing two-independent-success
and recent-accuracy rule for all eight stories; individual picture choices are
not separate skills. Wrong orders do not remove already earned awards.

The parent evidence report records story:sequence successes/attempts and context
word encounters. Correct sequences do not certify individual-word recognition.
v13 completed profiles and old active/paused reviews returning to the former
course end now continue forward into Level 36. Exact earlier unfinished goals,
choices, counters, pauses, help, Etappen and flowers are retained.

## Validation and release

Run node --test tests/*.test.mjs, python3 scripts/audit_audio.py,
python3 scripts/build.py and node tests/story-order.cjs plus the existing
release/browser suites. Existing whole-course fixture helpers now explicitly
arrange story cards before submitting; they do not bypass full-sequence checks.
The publication script additionally requires current-app-hash-bound
docs/verification/v14-stories.json. Actual executed results and public deployment
hashes belong in PROGRESS.md. Chromium emulation is not a physical-phone test;
educator/pronunciation review remains separate.
