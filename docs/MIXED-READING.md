# v10 mixed reading

The current request authorises implementation of the prior plans. The app retains
33 stable numbered stages and the same local v3 profile key; it now has an eighty-
target mixed scene bank instead of sixteen object/location sentences at Level 33.
Active utterances: curriculum/RELEASE-V10.txt. The two larger draft files are not
silently all included in the app. New draft CREATIVE-EXTENSIONS-DE.txt adds 244
unique texts beyond the initial 635, covering more everyday topics and structures.

## Active content

Level 17 and Level 32 each have 14 place tasks. Level 18/19 now use nine complete
human word models (Sofa, Lama, Salami, Tomate, Banane, Melone, Nudel, Hase, Hose).
Level 33 contains 44 place scenes, 12 quantities (1–3), eight size contrasts,
four possession scenes, eight animal action/state scenes and four two-statement
scenes. Noun gender and plural forms are explicit; Eine Maus is fixed in all
full models. Basic words, short/full variants and images are distinct data fields.

Locations include bus/house im/am, tree am, table/chair auf/unter and box in/neben.
Am Baum and unter dem Baum can both describe the same scene, so they are not
contrasted as mutually exclusive answers. The generated bed's clearance is not
suitable for a clear under-bed scene; its unused sprite is retained in the atlas
rather than putting an ambiguous question into the app. Each question contrasts
available dimensions one at a time and filters equivalent meanings. Quantities
include same-number/different-subject and same-subject/different-number answers.
An isolated number word (sieben) maps to a numeral; a quantity+noun maps to an
exact counted scene. Digit distractors have no audio/skill records of their own.

## Selection, difficulty and progression

Ordinary new mixed rounds use the least-covered task families within that round,
then choose unseen/weak/due targets. Place selections first cover both im and am,
then rotate available relations. This also handles old profiles with secure im
and unseen am history, the case where unseen priority previously excluded im.
No strict alternating relation sequence is imposed. Error reviews, when eligible
after two different completed questions, take priority over the big unseen pool.
Explicit due-only review queues remain targeted; they need not contain every family.

completedTargets is an optional bounded pending field. It persists round coverage
across reload/navigation/backup; old pending questions retain their choices/cue/
goal without fabricated history. Exact resume is preserved. Partial legacy rounds
may have too few remaining questions to cover all new families; the next ordinary
round provides full balance. No question goal changes while the round is running.

Family history chooses short text/cue while uncertain, full text after independent
success; failures ease the subsequent tasks. No response-time adaptation. Both
variants express the same scene. Pair statements retain both clauses rather than
shortening away a fact needed to disambiguate the answer. Optional model audio
sets assistance and cannot create independent mastery. Wrong pictures remain
silent and two-error teaching plays only the original saved task cue.

All other levels keep per-target mastery. Mixed-level completion requires at least
three distinct independently successful targets per family, im/am/auf/unter
coverage, all three quantities and at least 75% recent independent accuracy in
each family (at least three recent events). This is representative practice, not
an assertion that every one of the 80 texts or all new spelling patterns is mastered.

CurriculumVersion 10 reassesses expanded stage pass flags while retaining scores,
flowers, all old skills and exact pending/paused sessions. Old completed courses
continue at the expanded final level; existing cursors retain stable IDs. There
is no automatic backward course jump to the earlier expanded word stage.

## Media and limits

279 active clips: 76 human, 11 isolated phonics, 23 full instructions, 168 optional
full/short sentence/phrase recordings and one chime. Human/isolated bytes are
unchanged. Four old mouse recordings and two existing guides change; 143 clips
are added. Generation remains local free Piper Thorsten High, length_scale 1.5,
0.3-second sentence pause. No API account, runtime TTS or voice-cloning service.

Five AI artwork sheets contain 54 sprites and total 1,232,726 WebP bytes. New atlas
E provides furniture and paired awake/asleep animal art. Prompts/hashes/source
rectangles remain in illustration-sources.json. Its chair display rectangle
excludes a neighboring bed leg. Full build is about 5.92 MB, under a new 10 MB
static-media cap; media remain on demand and no engine/runtime dependency is added.

Context words such as unter, zwei, Mäuse and Stuhl bring new letters, graphemes
and morphology. EXPANSION_VOCABULARY declares them; the model plays a whole
utterance on request or after errors. This is an advanced reading prototype,
not a claim that every prerequisite was taught or that tests certify pronunciation,
image recognizability or educational efficacy. Parent/native/educator review and
physical-phone testing remain necessary. Follow-up should prepare missing phonics
and expand only clearly illustrated families, not simply deploy every draft row.

Executed checks and exact release commits are in PROGRESS.md.
