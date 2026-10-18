# Phonics Lab v7 status

Updated 2026-10-18 (Europe/Berlin). Canonical repository:
https://github.com/PJendritza/phonics-lab . Feature branch: reading-comprehension.
Read AGENTS.md and recent Git history. Source checkout: /workspace/Kalulu-DE.

## Implemented from the reading-comprehension request

The user set speech detection aside and authorised expanded vocabulary, independent
word reading, optional syllable support and the first sentence comprehension tasks.
Levels 1–14 retain their IDs and content. Levels 15–32 append human-word listening,
word-to-picture reading, longer words/spelling patterns and short sentence-to-picture
comprehension. See docs/READING-CURRICULUM.md for the exact sequence and limits.

- 35 additional complete human word recordings; 58 word/numeral/function-word entries
  in total. 41 picture-word targets, with original local SVG drawings. New patterns
  include voiced s, weak endings, doubled consonants, ei, au, ie, ee and oo.
- Independent reading never automatically plays the answer. Generic entry guidance
  explains the task. Optional read-aloud or syllable/pattern help persists assisted
  state and disqualifies first-try mastery. Reading/meaning skills are separate
  from the previous sound-to-print skills.
- Fourteen controlled sentences. The final level varies both subject and location,
  including same-subject/different-place and same-place/different-subject choices.
  All written sentence tokens have appeared earlier. This is narrow sentence
  comprehension, not stories or a validated reading-comprehension assessment.
- Later levels start with choices. Two mistakes still trigger teaching and restore
  the original choices without extra rewards. New goals remain 18 complete questions;
  existing chime, flower, sparkles and automatic advance are retained. No microphone.
- Original version-3 storage key/schema retained, with curriculumVersion 7. Existing
  14-level finishers continue at Level 15; paused questions, goals, choices, errors,
  help states and rewards survive. No accounts, uploads, paid APIs or scheduling.
- 76 human clips, 11 isolated Kalulu phones, 21 full-sentence instructions, 14 optional
  sentence readings and one nonverbal effect. All 62 old active MP3s stay byte-identical.
  New sentence speech uses unchanged local Thorsten High 1.5 / added 0.3 s pause.
- The complete on-demand-audio package cap is now 3 MB. The current test build is
  about 2.25 MB. Source recordings, voice model, dependencies, generated builds and
  screenshots stay outside Git. New provenance and per-clip hashes are retained.

## Executed verification

```sh
# Discovery metadata and originals were cached externally. Reproduction:
/workspace/kalulu-tools/tts/bin/python scripts/prepare_reading_audio.py
node --test tests/learning.test.mjs tests/content.test.mjs tests/reading.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
# Existing server: /workspace/kalulu-browser-build on port 8070,
# preview/phonics-lab -> ../site
node tests/browser.cjs
node tests/reading.cjs
node tests/mobile-smoke.cjs
node tests/profiles.cjs
node tests/word-hints.cjs
node tests/level-navigation.cjs
node tests/choice-help.cjs
```

34 pure/content tests pass, including complete 32-level state progression,
separate reading mastery, assistance/no false first success, exact resumed help,
sentence distractor contrasts, old-course migration and sentence vocabulary checks.
All 123 active MP3s decode with headroom/quiet endings. Existing 62 output hashes
are unchanged against the v6 baseline. New 35 human originals have pinned source
hashes and explicit Commons author/license attribution.

The new reading browser suite passes with actual playback: all 18 appended levels
execute a response and automatic transition; words are silent until help; syllable
help preserves spelling/choices through reload; wrong-picture audio corresponds to
that choice; two-error teaching gives no extra progress; full 18-question sentence
practice earns one flower. Four picture choices fit at 320×568, 390×844 and
768×1024. Adult sound review exposes all 14 sentence clips. Zero app errors or
third-party runtime requests in those checks. Profile, word-hint, mobile,
level-navigation and choice-help regressions also pass. Final full-browser suite
passes too, including all 126 active/comparison MP3 decodes, actual navigation,
profiles/imports, keyboard, blocked-media recovery and automatic flow. Exact app
SHA256: c4a39a6756b6f0f167e3fe248e44184eca285de44e452a1b30a929e67dac9771.

Diagnosis: a preliminary reading run stopped on not-yet-downloaded Biene audio;
it was rerun successfully after all words arrived. Initial compact reading layouts
put the last picture below a 320×568 viewport; corrected, then real-browser checks
passed at all three sizes. Wikimedia temporarily returned HTTP 429. Retained caches,
respected the initial 600-second pause, reduced request pace and used properly
attributed alternative recordings. Final sources are all present, including
Jeuwre's Sonne2/Leim2/See2/Tee2/das2/ist2 variants. No synthetic-word substitution.
No TLS or hash checks were disabled. All new audio/illustrations still require
native-speaker/educator review; technical checks do not establish learning efficacy.

## Verified publication

- Tested app source: 8f8c124142811593b7c509c3d4796535d6f6b6e1, pushed to
  reading-comprehension and main with normal pushes.
- Clean `python3 scripts/build.py`: 146 files, 2,254,626 bytes, sourceDirty false;
  asset version c4a39a6756b6. No generated build/model/source-cache files in Git.
- Executed `python3 scripts/publish.py --checkout
  /workspace/kalulu-browser-build/publish-v7-8f8c124` successfully.
- Deployment commit: e59c2952a6b4aee6d831a908a6f998495e754aae on gh-pages.
  Existing hosting/settings remain unchanged; no new hosting or account.
- Waited for public BUILD_INFO to report 7.0.0 and source 8f8c124, then executed
  `python3 scripts/verify_live.py`: all 146 public HTTPS files exactly hash-match
  the tested package, 2,254,626 bytes. Evidence: docs/verification/2026-10-18/live.json.
- Play: https://patrickjendritza.com/phonics-lab/?v=7.0.0
- Sound review: https://patrickjendritza.com/phonics-lab/audio-review.html?v=7.0.0
- Source branch: https://github.com/PJendritza/phonics-lab/tree/reading-comprehension
- Later documentation-only commit records publication; the deployed app source
  remains 8f8c124. Browser evidence is tied to the unchanged app hash, not docs.

No unresolved build, Git or hosting blocker remains. The environment already had
all required Python/Node/ffmpeg/Piper/Playwright/Chromium tools; no new secret,
cloud configuration, paid service or scheduler was needed.

Next: test Levels 15, 17, 19, 23, 31 and 32 through Level → parent
preview checkbox. Review picture recognisability as well as new word/sentence audio.
Physical-phone playback and native pronunciation are not newly certified by cloud
Chromium. Next teaching work: explicit final-devoicing transfer (Laub/Sieb currently
have whole-word models), ch/sp/st, consonant clusters, actions/role reversals, then
connected short texts after actual child/educator feedback.

---
Historical v6 and earlier release context follows; v7 above supersedes its active status.

# Phonics Lab v6 status

Updated 2026-10-18 (Europe/Berlin). Repository:
https://github.com/PJendritza/phonics-lab . Branch: choice-first-sound-feedback.
Read AGENTS.md and recent Git history. Checkout stays /workspace/Kalulu-DE.

## Implemented from the latest phone feedback

- Later levels (2–14) start immediately with multiple choices, including word
  building without a copied model. Level 1 retains first-sound introductions.
- After two mistakes per question/current block, the selected wrong sound finishes,
  then the original task cue plays with only the correct answer interactive.
  Invisible placeholders preserve that answer's old location. A teaching tap gives
  the normal small confirmation but no extra progress/point or independent mastery;
  the original choices return for another try. Error history makes first-try false.
- help=pending/show/ack and misses are saved per round. Pause, level switches and
  reload preserve teaching/partial states without duplicate rewards. Old untouched
  later introductions upgrade to choices; attempted/solved work keeps its meaning.
  Old non-building questions with two recorded mistakes resume with help.
- Wrong letters now route through PHONEMES to one isolated sound, with no unrelated
  word or prefixed whole beginning/ending instruction. ll shares l. A selected
  whole word in a word-reading task still plays that exact word. Original whole
  German task cues, all 41 human targets and all nine Thorsten High instructions
  remain unchanged byte for byte.
- Eleven CC BY-SA 4.0 extracts from pinned original Kalulu language assets. Ten
  complete first standalone French phones before a long pause; h is the breath
  portion of a dedicated Portuguese /h/ sound asset, excluding its voiced release.
  No word was cropped. Source hashes, intervals, attribution and processing are
  explicit; sources are not certified native-German recordings. See PHONEMES.md.
  New clips are easy to audition via Töne prüfen → Einzellaute; stops/h especially
  need listening review. No new synthesis engine or paid generation.
- Flower width increased to 62–76px, stronger petals/center contrast. The same seven
  particles are larger (9×12px), darker and move inward from a wider radius. No
  answer-target movement, longer success delay or added particle count. Reduced
  motion retains the static check/meter. Four word choices still fit at 320×568.
- Generated JSON is minified without removing provenance/license fields. Readable
  source manifests remain; build stays below the existing 1 MB budget.

## Executed checks

```sh
python3 scripts/prepare_phonemes.py
node --test tests/learning.test.mjs tests/content.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
# Existing local server: /workspace/kalulu-browser-build, port 8070,
# preview/phonics-lab -> ../site
node tests/browser.cjs
node tests/mobile-smoke.cjs
node tests/profiles.cjs
node tests/word-hints.cjs
node tests/level-navigation.cjs
node tests/choice-help.cjs
```

27 pure/content tests passed, covering choice-first stages, assisted states, old
save migration, no guided scoring/mastery, source hashes and sound-only routing.
Audio audit checks all 62 active files; original three adult comparisons are also
browser-decoded. Mobile checks at 320×568/390×844/768×1024 cover the larger flower,
fixed feedback layout, visible four-word choices and reduced motion. Profiles,
word-hint and level-navigation regressions passed. Dedicated actual-playback tests
verify the exact Fisch end-sound/wrong-f case, one-choice fallback and pause/reload.
The final full-browser regression passed, including all 65 MP3 decodes, full
levels, profiles/imports, keyboard, retry and automatic progression. Exact app hash:
1d1af35b9128081edc001e641ce3f8fa77bf627ecf644e71957eb9d26964c7fb.
Publication is verified: all 83 public files match the tested package exactly.
The final clean package is 993,427 bytes, below 1 MB.

Research/diagnosis: several Commons IPA demos explicitly include surrounding
vowels ([afa]/[asa]/[aha]) and were rejected as direct feedback. Kalulu Look & Learn
has a separate first isolated sound before a pause; spectrograms/source segmentation
were inspected, and all original MP3s match the pinned LFS hashes. h is a short
breath extract from a sound asset, not from a word. Added gentle trailing fades to
avoid a hard noise boundary; final audit/browser checks are repeated on that audio.
One new browser fixture initially omitted re-enabling parent preview after reload;
corrected the test to use the UI checkbox rather than weakening level availability.
Full runs were repeated after final media/page/migration changes. The browser
runner now verifies that the served asset hash matches source at the start and that
source remains unchanged through the run, preventing stale-package evidence.
Final reliability corrections cover replay recovery when second-error phoneme
playback fails and removing assisted highlights when returning to choices/next
blocks. Dedicated browser regressions exercise both cases.

## Verified release and next useful step

- App source: 6509d5dae7e561fe80d6bb8b96b10b5a935fb187, pushed to
  choice-first-sound-feedback and main.
- Clean python3 scripts/build.py: 83 files, 993,427 bytes, sourceDirty false.
- python3 scripts/publish.py --checkout /workspace/kalulu-browser-build/publish-v6
  pushed deployment 7eb3d003dbd50a0c5b6abc4e2a7d8d3b8fa569e2 normally to gh-pages.
- Public BUILD_INFO reports 6.0.0 and source 6509d5d. Executed
  python3 scripts/verify_live.py: all 83 certificate-verified HTTPS files exactly
  match the tested package. Evidence: docs/verification/2026-10-18/live.json.
- Play: https://patrickjendritza.com/phonics-lab/?v=6.0.0
- Review: https://patrickjendritza.com/phonics-lab/audio-review.html?v=6.0.0
  Select Einzellaute for the 11 new clips.
- Subsequent documentation-only commit records publication. Deployed app source
  remains 6509d5d; no hosting/domain/settings changes or new service.

Next: user tests the v6 link, later-level choice-first flow, two-error support and
isolated wrong-letter feedback. Listen especially to the new stops/h clips.
Technical audio checks are not a native-speaker/educator listening approval. No
physical-phone v6 playback test is claimed. Preserve the approved instruction voice
(Thorsten High 1.5, added 0.3-second sentence pause) and existing local learners.

---
Historical v5 status below; current v6 notes supersede its context-word feedback.

# Phonics Lab v5 status

Updated 2026-10-18 (Europe/Berlin). Repository:
https://github.com/PJendritza/phonics-lab . Feature branch: numbered-levels-update.
Read AGENTS.md and recent Git history. Local checkout remains /workspace/Kalulu-DE.

## Implemented from the agreed update

- Thorsten High instructions: length_scale=1.5, 0.3 seconds added between separately
  generated sentences. Nine instructions regenerated, all 41 human targets unchanged
  byte for byte. Pinned model/config hashes and settings in scripts/tts-settings.json
  and each instruction's manifest entry. No paid API or heavier model installation.
- Local regular/bold Andika 7.000 subsets, default single-storey a and cv39 curved l.
  Internal family renamed Phonics Lesson for OFL reserved names. Original font
  source/license metadata retained. Reproduction generates stable hashes and
  content-hashed filenames. German characters and l/I/1 displayed on About.
- Levels approximately 50% longer: original 9→14; new 8→12, 10→15, 12→18. Added
  questions provide choices after the existing introductions. No extra repeated
  one-choice introduction phase; no timing-based scores. Existing pending totals
  keep their exact original goals on resume.
- Header Level link, exercise Level N dropdown-style button, numbered quick grid
  and descriptive map. Parent preview checkbox still allows later-level testing.
- Wrong taps play the selected option's human recording, not automatically the
  requested target. Context exercises use complete example words; unavailable pure
  consonants in word-building use an explicitly announced onset/ending example.
  Controls wait for speech; replay returns to the requested target. No wrong-score
  reward, target motion or spoken success praise.
- Each correct tap/block gets a restrained seven-particle sparkle, small check,
  existing success tune and animated growing stem/leaves/petals. Cumulative progress
  remains visible; automatic next-question delay remains 340 ms. Reduced-motion
  preference removes decorative animations. Fixed feedback height keeps choices
  stationary even while a two-line word-context label is shown.
- Successful current levels continue to the next numbered level even with earlier
  unfinished stages. No automatic weak-stage fallback. Final success offers explicit
  review selection. Profiles store a continuation cursor and per-level paused
  questions, preserving partial/solved/wrong answers across navigation/reload.
  Mastery still requires independent accuracy; jumps never mark skipped levels passed.
  Data version/key remain v3; old v3 saves infer the cursor from pending/highest
  completed stage. v2 migration/backups and up to eight local profiles are retained.

## Executed validation

```sh
/workspace/phonics-fonts/venv/bin/pip install 'Brotli==1.1.0'
/workspace/phonics-fonts/venv/bin/python scripts/prepare_fonts.py
# Repeated generation produced identical font hashes.
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py --instructions-only
node --test tests/learning.test.mjs tests/content.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
# Existing server serves /workspace/kalulu-browser-build at port 8070,
# preview/phonics-lab -> ../site exercises the Pages prefix.
node tests/browser.cjs
node tests/mobile-smoke.cjs
node tests/profiles.cjs
node tests/word-hints.cjs
node tests/level-navigation.cjs
```

Passed: 22 Node tests; all 51 current audio decode/headroom/quiet-ending
checks; profile and word-hint browser regressions; actual-playback numbered-level
navigation tests; reduced-motion mobile checks at 320x568, 390x844 and 768x1024.
Navigation suite checks real selected-option source files, preserved partial/solved
rounds and legacy goals, no double rewards, forward continuation despite skipped
lower stages, final review choice and actual Andika loading with cv39. No page errors.
Screenshots outside Git: v5-letterforms.png, v5-font-sample.png, v5-graphemes-*.png.
The full browser regression also passed, including real MP3 playback/decode, complete
14/12/15/18-question goals, error recovery, success-effect failure, migration,
profile import/export and keyboard interaction. Exact app SHA256:
fe987b493899f447d07e29386db37d50aad6459df1ea459a786ff0dde3bb5bbf.
The final clean build and publication are complete. All 72 live HTTPS files match
the tested package exactly: 910,105 bytes, below the 1 MB budget. See live.json.

Development dependencies: external Piper 1.4.2, pinned Thorsten High ONNX;
fontTools with Brotli 1.1.0. Normal app/build require no synthesis/font tools.
Font generator's first attempt lacked Brotli; installed it in an external venv and
regenerated successfully. New navigation test initially assumed CSS serialization
would retain an explicit feature value 1; Chromium serializes enabled cv39 without
it. Corrected the assertion to accept both equivalent forms. Its test-only media
hook also needed a null guard on About, which has no lesson element. The old browser
suite's final keyboard check assumed post-final automatic review; updated it to
explicitly choose a numbered review level as now intended. These checks were rerun.

## Release and next step

Publication verified:
- App source 7fc8c23c786219f0cf75d14a95154744cb0658fc, pushed to numbered-levels-update
  and main. Clean python3 scripts/build.py: 72 files, 910,105 bytes, sourceDirty false.
- python3 scripts/publish.py --checkout /workspace/kalulu-browser-build/publish-v5
  pushed normal deployment f3b8e1a9ea420c579bb5f55c4d86d002df62c3a2 to gh-pages.
- Initial BUILD_INFO check returned v4 during Pages propagation. After it reported
  v5.0.0 and source 7fc8c23, python3 scripts/verify_live.py passed all 72 files over
  certificate-verified HTTPS. Evidence: docs/verification/2026-10-18/live.json.
- Play: https://patrickjendritza.com/phonics-lab/?v=5.0.0
- Sound review: https://patrickjendritza.com/phonics-lab/audio-review.html?v=5.0.0
- Subsequent documentation-only commit records the audit; deployed app source is
  7fc8c23, distinct from that documentation commit. Source/main and generated
  deployment branches remain separate; no hosting/domain/settings changes.
Next user check after release: open the v5 link, resume an existing profile, jump
between levels without losing a partial word, hear selected wrong options and try
higher-level success. Listen to the regenerated instructions on phone speakers.
No physical-device v5 test or native/educator approval of every clip is claimed.
Cloud public Chromium previously had a proxy-CA issue; local real-playback checks
and HTTPS byte verification are separate evidence and preserve TLS verification.

---
Historical v4 status below; current behavior and pending release supersede its
old next-version plans. Earlier verification revisions remain in Git history.

# Phonics Lab v4 status

Updated 2026-10-18 (Europe/Berlin). Repository:
https://github.com/PJendritza/phonics-lab . Read AGENTS.md and recent Git history.
Feature branch: fluent-progress. Local checkout stays /workspace/Kalulu-DE.

## Latest feedback recorded for the next version

Latest additions: successful higher levels must continue forward to the next
numbered level, never silently send the learner back to a weaker/unfinished lower
level. Earlier review should be explicit. Update continuation state independently
of weakest-skill selection while preserving independent mastery and existing saves.

Voice decision from listening samples: regular Thorsten High at length_scale=1.35
with 0.2 seconds added between sentences is approved for the next update. Generated
sample duration 3.866 seconds; earlier High samples at 1.8 + 0.4-second pause were
too slow, and 1.25 without extra pause was faster. High model source SHA256:
9df1c43c61149ef9b39e618e2b861fbe41e1fcea9390b2dac62e8761573ea4f1.
All samples/models remain outside source; no app audio replaced yet.

Assessed user's free-model list against official sources: Qwen3-TTS 0.6B/1.7B
explicit German support, Apache 2.0; Chatterbox Multilingual V3 exists, 0.5B,
German support, MIT, documented CPU option; XTTS-v2 CPML non-commercial;
OpenAudio S1-mini redirects to fishaudio/s1-mini, gated and CC BY-NC-SA 4.0.
No empirical quality ranking or successful local inference is claimed. Current
environment: five reported CPUs, ~33 GiB RAM, no nvidia-smi or /dev/nvidia* device.
Heavy free models need a bounded CPU trial before promising autonomous generation.
Official demos exist but queues/quotas/access are not verified. See updated
docs/VOICE-OPTIONS.md. No installation, heavy download or model execution for this
assessment. Budget: no paid API/GPU recommendations or assumed subscription credits.

Further phone feedback: make flower growth clearer and add a restrained local
sparkle/confetti on each correct press, preserving stationary choices, the tune,
automatic flow and reduced-motion accessibility. Synthetic instructions sound too
fast and insufficiently natural; human vowel/word recordings are liked and should
stay. Added docs/VOICE-OPTIONS.md with current Piper settings, slower local option,
OpenAI/ElevenLabs/Azure alternatives and official documentation links. This is
documentation research, not a synthesis/listening benchmark or API-access test.
No new audio, application changes or publication in this task.

The user is testing v4 on their phone, reports it is pretty good and likes the
current success feedback. Requested planning notes (no implementation this turn):
number the exercise stages as levels and add an easily accessible numbered selector
for jumping between them, especially during testing; wrong answers should play the
selected option's audio rather than only replay the requested target. Correct
answers retain the current short tune/check, visible progress and automatic advance.
Details and consonant-audio constraints are in docs/NEXT-VERSION.md.

Additional agreed plan: bundle Andika with its single-storey a and curved-tail l
(`cv39=1`); increase level question counts by roughly 50% (8→12, 9→14, 10→15,
12→18). Extra questions should give independent choices after the introductions,
not lengthen the one-choice introduction phase. Preserve existing pending-level
goals on resume and extend validation/tests for the new totals when implemented.

Documentation-only updates on next-version-feedback-notes and font-and-length-plan. No app, audio, storage,
build or deployment changes; v4.0.0 remains the verified live release below.
Validation: git diff --check. Next development task: implement the recorded plan
and verify font shapes, longer goals, navigation/resume, selected-option playback
and unchanged mastery rules.

## Current work: automatic practice, cumulative goals and consonants

Implemented user-requested v4.0.0: minimal profile/play entrance, automatic advance
about 340 ms after each complete answer, quiet nonverbal chime/check and no spoken
success messages. Wrong answers stay with stationary choices and replay/time.
Every correct choice advances a visible fixed level meter/flower, including partial
grapheme blocks. Goals are 8–12 questions, never early completion. Each finished
level adds a flower to the field; practice rewards are separate from accuracy mastery.
One play button remains at the level boundary. Parent later-stage checkbox retained.

Expanded eight to fourteen stages and 20 to 41 complete human target recordings.
New initial f/n/l/sch and b/d/g/h; final f/s/sch/t/k; more monosyllabic words; reading
and block-building Fisch/Schaf/Hut/Ball with sch/ll. These are natural whole-word
context exercises, not unverified isolated consonant samples or letter names.
Nine full-sentence Piper instructions and one own nonverbal effect; 51 active clips
plus three historical adult comparisons. Individual sources/licenses/hashes retained.
Five optional words hit Commons HTTP 429 after bounded retries and were omitted;
all current references resolve. Full pronunciation/listening approval remains pending.

Existing v3 storage schema/keys, v2 migration, exact solved/partial resume and eight
profiles remain. Saved learners stay accessible on the same HTTPS origin after
renaming the path. Navigation cancels timers/audio; paused solved answers cannot
score twice. Optional feedback failure does not block progression.

Repository rename verified: new Git origin/read access works; new Pages base
https://patrickjendritza.com/phonics-lab/ responds HTTP 200; old /Kalulu-DE/ is 404.
Updated source links/test prefix/verifier default; no Pages settings or new hosting.

## Executed checks on this version

```sh
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py --instructions-only
python3 scripts/make_feedback.py
node --test tests/learning.test.mjs tests/content.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
# Existing server, with preview/phonics-lab -> ../site:
python3 -m http.server 8070 --directory /workspace/kalulu-browser-build
node tests/browser.cjs
node tests/mobile-smoke.cjs
node tests/profiles.cjs
node tests/word-hints.cjs
```

All passed. 16 Node learning/content tests cover all 14 stages, exact level goals,
fractional blocks, demonstration/mastery separation, accuracy adaptation, validation,
profile migration/resume and pinned human cue provenance. All 51 current MP3s pass
nonzero/headroom/quiet-ending audit. Full browser suite uses real MP3 playback
(initial natural speed, later accelerated media), not mocked success. It verifies
automatic advancement, cumulative progress, wrong-answer stability, pause/resume
without duplicate reward, every new exercise type/goal, sch blocks, profiles and
backup/import, retries, optional effect failure, 54 MP3 decodes, review filters,
legacy migration, keyboard and cache queries. No page errors/external runtime requests.

Mobile emulation at 320x568, 390x844 and 768x1024 passes: start above fold, visible
progress, sch bank accessibility, no horizontal overflow and reduced-motion handling.
Additional 320x568 four-word-choice check: all choices visible, final row ends at
462.55 px. Profile suite verifies all 14 earned stages remain selectable, independent
review, name escaping, confirmed reset/deletion, eight-profile cap and v2 backup.
Word-hint regression confirms correct partial blocks do not count as mistakes.

Evidence in docs/verification/2026-10-18: browser.json, mobile.json, profiles.json,
audio-audit.json, word-hints.json. Browser evidence binds exact app SHA256
93c3228db761c9aafda96cd27721154651ee985fd629df0040faad8135231bbd.
Screenshots/builds outside Git. Tools: Python 3.12.14, Playwright 1.62.1, Chromium154.

Publication complete and independently byte-verified:
- Source: f1d732832c1c7870539e8aa7ed1c0af4a3ad1777, pushed to fluent-progress and main.
- Deployment: 6cbb59e24da75dc08f09c500103e751ae7485e5d, normal push to gh-pages.
- Clean python3 scripts/build.py: 68 files, 812,444 bytes, sourceDirty false.
- python3 scripts/publish.py --checkout /workspace/kalulu-browser-build/publish-v4 passed.
- Initial metadata check still returned 3.0.1 during Pages propagation. After
  BUILD_INFO reported 4.0.0/source f1d7328, python3 scripts/verify_live.py passed:
  every one of 68 public HTTPS files exactly matches the tested package.
  Evidence: docs/verification/2026-10-18/live.json.
- Play: https://patrickjendritza.com/phonics-lab/?v=4.0.0
- Review: https://patrickjendritza.com/phonics-lab/audio-review.html?v=4.0.0
- A later documentation-only commit records publication; the deployed source is
  f1d7328, not that later commit. No Pages settings/domain changes.

## Next action and limits

Next: user tests new link, existing profile resume, automatic answers and stage-preview
consonants on their phone, and reviews new words via Töne prüfen. Refine recordings/
context instructions from native/educator feedback before expanding the curriculum.
No new physical-phone test or native pronunciation certification is claimed.
Public Chromium previously failed on cloud proxy CA; keep TLS verified. Local real
browser checks plus all-live-byte HTTPS audit are separate from hardware playability.
No accounts/sync/scheduling, paid dependencies, new hosting or bulk engine assets.

---

The following is historical v3 release context; its old paths/feature descriptions
are superseded above. Earlier verification JSON revisions remain in Git history.

# Phonics Lab status

Updated 2026-10-18 (Europe/Berlin). Read AGENTS.md and recent Git history first.
Project: https://github.com/PJendritza/Kalulu-DE. Implemented on guided-learning; main now contains the released app and verification.

## Latest task: Phonics Lab branding (3.0.1)

The user chose **Phonics Lab**, independent of garden/space or other activity themes.
Updated the app/header/home title, all three page titles and descriptions, About,
README, project copyright label and backup download names. Kalulu remains credited
as inspiration and historical source. Legacy storage keys and existing learner
names/backups are preserved; changing branding must not reset saved progress.

The GitHub repository is still **PJendritza/Kalulu-DE** until the user renames it.
Recommended slug: **phonics-lab**. No repository rename or Pages setting was performed.
Current external links deliberately retain the working old path. docs/RENAME.md
contains precise UI steps, expected new project Pages path and the required checks.
The publisher now uses origin instead of a hard-coded repository URL.

The previous feedback's interaction changes are recorded in docs/NEXT-VERSION.md:
minimal entrance, auto-advance, no spoken success praise, tiny nonverbal feedback,
per-level visual progress and retained parent stage-preview access. They are not
implemented by this branding change.

Verification: 10 learning tests passed; 320x568, 390x844 and 768x1024 layout/reduced-
motion checks passed; all three branded headers/titles/meta descriptions pass at
320px. Full existing browser suite also passed, including profile migration, resume,
renamed backup export, audio and later exercises. Evidence:
branding.json, browser.json and mobile.json under docs/verification/2026-10-18.

Branding publication completed and verified:
- App source: 618a3e5800a478772774caf30418e5d1791138d4 (main / phonics-lab-brand).
- Deployment: acfb05f4e73cc757e3b25a20085238fc75476690 (gh-pages).
- Clean build and scripts/publish.py --checkout
  /workspace/kalulu-browser-build/publish-phonics-lab completed successfully.
- First live audit caught the previous metadata during Pages propagation. After
  BUILD_INFO changed to 3.0.1, scripts/verify_live.py passed: all 52 HTTPS files,
  769,197 bytes match the tested build. Evidence: live.json.
- Open https://patrickjendritza.com/Kalulu-DE/?v=3.0.1 while the repository keeps
  its old slug. The actual GitHub rename and new Pages URL verification are pending
  the user's rename action. Later source commits record verification only.

## User feedback and new goal

The user confirmed that v2 opened immediately on their phone, worked very well and
sounded much better. They requested expanded content, small rewards, automatic
challenge, an entrance a nonreader can use, individual profiles, resume and a stage map.
This supersedes the earlier three-demo limit. Preserve calm stationary interactions;
no moving targets, engine, countdown, speed scoring or lost lives.

## Implemented in v3

- One large play button starts/resumes the appropriate lesson. Spoken guidance,
  speaker replay, animal profile pictures and a large explicit next arrow; no need
  for a child to read a menu. Parent controls remain separate.
- Eight stages: a/m/i; o/u/e; am/im/um short-vowel contexts; ma/mi with reversed
  combinations; final-sound m/n/l identification; an/in/man/nun/mal; recognition of
  Oma/Omi/Mama/Mami; building ten short words/units. Details: docs/GOALS.md.
- 20 human target recordings (12 added) + 15 full-sentence Piper instructions.
  No new isolated synthetic phonemes, no letter-name consonant substitutions and
  no vowels cropped out of words. n/l use last sounds of complete natural words.
  All individual sources, licenses and hashes are retained; new clips need listening
  review. Sound review adds category filters and retains three old comparisons.
- Independent first-try accuracy controls two/three/four choices, weak-target
  repetition and automatic stage progression. Demonstrations do not count toward
  mastery. Minimum two recent independent successes plus >=75% across the last up
  to four; every stage target must qualify. Sessions cap at nine questions and may
  finish early when secure. No speed metric. Parent preview opens later exercises.
- A completed question earns one seed exactly once; a passed stage earns a flower.
  Garden/sprout feedback does not move targets, removes no earned rewards and
  respects reduced-motion settings.
- Up to eight separate local learner profiles, optional nicknames, animal avatars,
  rename/switch, confirmed reset/deletion, all-profile JSON backup/confirmed restore.
  Resume exact question, answer order, errors, partial word and already-awarded
  result. Existing v2 history/backups migrate; the old local key is not deleted.
  Historical completions alone cannot confer new independent mastery.
- Lowercase word-building tiles accept the same phoneme for a capitalized noun;
  the finished slots show canonical capitalization. No spelling-case penalty.
- The source remains plain HTML/CSS/modules. Build versions entrypoints, nested
  modules, audio and manifest requests using an app-content hash, so returning
  phone browsers cannot mix old v2 exports with new v3 scripts. Budget <1 MB.
  The verified clean package is 768,713 bytes (52 files), including all
  audio, adult review, notices, source metadata pointer and checksums.

## Executed and passed

```sh
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py --instructions-only
node --test tests/learning.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
# Existing server, started in the previous task, remained available:
python3 -m http.server 8070 --bind 0.0.0.0 --directory /workspace/kalulu-browser-build
# Existing preview/Kalulu-DE -> ../site symlink exercises the Pages subpath:
node tests/browser.cjs
node tests/profiles.cjs
node tests/mobile-smoke.cjs
node tests/word-hints.cjs
```

- 10 Node tests pass: no mastery/repeated rewards from demos/taps; accuracy makes
  choices harder/unlocks stages; errors ease next questions; immutable state and
  profile isolation; exact partial/solved resume; v2 migration; invalid data/audio
  rejection; unavailable storage; the entire eight-stage progression; lowercase
  noun-building choices. The full-path test actually completes every stage via the
  learning transitions, without setting passed flags by hand.
- Full Chromium flow passes: natural-speed first cue, then actual MP3 playback may
  be accelerated in the runner (no mocked media success); guided start, audio gating,
  wrong-answer stationary positions, exact reload resume, one-time rewards, stage
  unlock/automatic next stage, two profiles, exports and confirmed valid restore,
  invalid restore preservation, all later exercise types, partial-word resume,
  final-sound word contexts, 35 current/38 total MP3 decodes, filters and ratings,
  old local-history migration, blocked-sound retry, stale-callback cancellation,
  storage-quota in-memory fallback, desktop keyboard operation and cache queries.
  No app page errors, external runtime requests or engine downloads.
- Separate profile browser checks pass: all eight earned stages remain selectable;
  automatic review after the last stage; isolated partial-word resume; names display
  as text; explicit reset/delete confirmation preserves the other learner; cap of
  eight disables additional creation; confirmed import of a v2 backup.
- Final word-hint browser regression passes: two correctly placed letters do not
  reveal the next letter; two actual mistakes do. Assisted completion earns its
  seed once but cannot become first-try mastery. Full browser checks were repeated
  successfully after this correction.
- Viewports 320x568, 390x844 and 768x1024 pass: play above fold, next arrow visible,
  home/map/parents without horizontal overflow and reduced-motion animation off.
- All 35 current MP3s decode to nonzero PCM, have peak headroom and quiet last 50 ms.
  Source downloads/voice model use verified TLS and pinned checksums. ONNX’s telemetry
  ID warning uses an in-memory fallback; synthesis completed successfully.

Evidence: docs/verification/2026-10-18/browser.json, profiles.json, mobile.json,
audio-audit.json, word-hints.json. Screenshots remain outside Git under /workspace/kalulu-browser-build/.
Tools: Python 3.12.14, Playwright 1.62.1, Chromium 154.0.8037.57.

## Previous release checkpoint (3.0.0)

Open the released app: https://patrickjendritza.com/Kalulu-DE/?v=3.0.0
Tones: https://patrickjendritza.com/Kalulu-DE/audio-review.html?v=3.0.0

**Publication complete; live version 3.0.0 is verified.**

- Final app source: 953495d67bb96aec34653cf8958c4148267176dd, pushed to
  guided-learning and main. Main subsequently receives verification-only documentation.
- Final deployment: 72acbb727dda416255af3dc86868ddc501497808 on gh-pages.
- Executed clean python3 scripts/build.py, then
  python3 scripts/publish.py --checkout /workspace/kalulu-browser-build/publish-v3-final.
- Executed python3 scripts/verify_live.py after live BUILD_INFO reported the final
  source. All **52 HTTPS files / 768,713 bytes** hash-match the browser-tested build,
  including the new hint fix, content, audio, profiles and versioned module references.
  Full evidence: docs/verification/2026-10-18/live.json.
- The earlier expanded v3 source fb117e4 / deployment ca15e4a was also published and
  HTTPS-verified before the final word-hint correction. The final source supersedes it.
- Content asset version: 3b581d7042f2. Use the fresh ?v=3.0.0 link above to obtain a
  new entry page on returning phones; nested scripts/styles/media have their own
  content-derived queries. No service worker, Pages settings write or new hosting.

The publisher required clean pushed source, passing app-hash-bound browser evidence
and checksums, then made normal non-force pushes. Live-byte verification is distinct
from a new physical-phone or cloud-public-browser test; those are not claimed.

The v2 release remains in Git history: source 79621ff92ecf90a44878e7c2e5c4f06849acd57c,
deployment 06922a634ebf6634c6cc2bc8b8b0c5c6ab8317f2; old results are in the corresponding
source snapshot. A direct public Chromium check previously failed on the cloud proxy
CA (ERR_CERT_AUTHORITY_INVALID), while certificate-verified HTTPS file audits passed.
Do not disable TLS or imply that this is a new physical-device test.

## Limits and next useful step

Profiles are local to one browser/device, with backup/import for transfer. No account,
server sync, tracking, recurring schedule or production identity service. Concurrent
cloud accounts are outside scope. Source and deployment branches remain separate.

The user’s positive phone report is evidence for v2, not an exhaustive v3 phone or
native-speaker review. The added recordings have different voices; Ma, Mama/Mami,
vowel lengths, final-sound instructions and child use need focused adult/educator
review. This is an expanded usable prototype, not a complete curriculum or validated
intervention. See goals for the phonetic distinctions; do not silently equate long
isolated vowels with their short/unstressed word forms.

Smallest next step after release: user tries their existing phone progress, adds a
second learner, checks automatic continue and later stages via the parent map, and
reviews the new recordings in Töne prüfen. Then refine voice consistency, final-l
examples, capital/lowercase recognition and blending based on actual child feedback.

## History and environment

Godot source/deployment are retained in archive/godot-prototype-2026-10-18 and
archive/godot-deployment-2026-10-18, plus earlier archive/tmp/* tags. No old engine
code/assets are active. The old tmp project was not recreated or changed. No force
push, repository visibility change, new hosting, schedule or Git history rewrite.
The current cloud environment already has the Python/Node/browser tools; this task
requires no new secret, paid dependency or environment configuration to run.
