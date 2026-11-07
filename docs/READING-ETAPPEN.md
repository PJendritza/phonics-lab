# Reading Etappen (v13)

The five existing chapters and all 35 level IDs/numbers remain. Levels 33–35
contain four named Etappen each, defined in app/reading-path.mjs. These are finite
content definitions (version 1), not a fresh level for every word combination.

| Level | Etappe 1 | Etappe 2 | Etappe 3 | Etappe 4 |
| --- | --- | --- | --- | --- |
| 33 – Dinge und Tiere verstehen | Ball und Hut | Maus und Schaf | Wach und müde | Alles zusammen lesen |
| 34 – Tiere und Menschen | Katze und Hund | Ente und Frosch | Tiere und ihre Dinge | Menschen im Alltag |
| 35 – Alltag und kleine Geschichten | Buch und Apfel | Schuh und Puppe | Sachen und Familie | Essen, trinken und lesen |

Each unit has bounded target-word forms and several mixed task families. Counts,
positions, objects and actions are not blocked into predictable answer patterns.
Early Etappen retain adaptive short/full text; later transfer/extension Etappen
show full sentences. Articles/case remain correct, including short forms. Water
and milk use natural mass-noun grammar. All new tasks stay picture multiple choice.
No microphone, server account or runtime speech synthesis is introduced.

## Child and parent interfaces

The start/continue button remains the main entrance. The existing flower/bar
measures the CURRENT ROUND, not an entire Etappe or all words in the level. A
compact second line at the level button identifies the current Etappe out of four.
The end-of-round action explicitly continues that Etappe or starts the next one.
Its completion gives "Etappe geschafft!"; ordinary round flowers remain rewards.

The numbered map has expandable named Etappen with focus words, actual exposure
counts and current/completed states. Parents/testers can select any Etappe in an
available/previewed level. Opening the map from a reading task scrolls to that
level, avoiding a long phone scroll through the earlier levels. Parent tools add
separate evidence counters and sentence-pattern totals. Word inventory/CSV now
include the new actual vocabulary. The home remains uncluttered.

## Finite goals and honest evidence

New reading rounds contain 8–12 tasks; the goal is fixed at the start. Existing
unfinished goals remain exact, including old 18-question rounds. An Etappe's
completion requires all of the following accumulated practice evidence:

- at least two completed rounds;
- at least 12 distinct targets attempted (or all when fewer exist);
- at least 8 distinct targets independently correct on the first attempt;
- independent success in at least three of the Etappe's task families;
- at least eight recent answers and at least 80% independent first answers in
  the most recent twelve recorded answers (or the smaller available window).

This is a reachable practice rule, not proof of every sentence in the task bank.
The current pools all have at least three families and more than twelve targets.
A round finishing alone need not finish an Etappe. Completion flags/awards persist
after later mistakes, while current accuracy/review evidence can become weaker.
Explicitly finishing a higher selected Etappe never automatically selects an
earlier incomplete one. The next higher incomplete Etappe, then next level is used.

Evidence is stored by stable task, word-form, pattern and Etappe IDs, separately:

- **Context/encounter:** completed tasks contain this written word form. Actual
  displayed short/full wording is used, not unshown words from a longer variant.
- **Independent word recognition:** only an unassisted, first-try correct
  standalone written-word-to-picture task. Listening/spelling tasks and correct
  sentence pictures do not infer recognition of each constituent word.
- **Later word retrieval:** a further independent standalone-word success at
  least 24 hours after its first such success. Clock times are not speed scores.
- **Sentence patterns:** actual first-try/attempt totals for relations, quantities,
  sizes, actions, possession, paired assertions, und and nicht. No per-word
  decoding or spoken fluency is inferred from them.

No global "X of 500 words learned" score is fabricated. The 131 inventory entries
are forms used in tasks/cues, not 131 independent lemmas or learned words.

## Repetition and migration

Existing error spacing and 1/3/7/14/30-day review logic remain. At every fourth
question of a new Etappe round, a due, previously practised target from a completed
earlier Etappe in the SAME level may be retrieved (normally up to 25% of twelve
questions). It must lie outside the current pool. If none is due, practise current
content. These reviews update task/word/pattern evidence but do not award current
Etappe coverage for an unrelated target or change the forward cursor. Overlapping
familiar words also occur naturally in later task pools. Due earlier LEVELS still
use the separate explicit ↻ review path; we do not claim automatic cross-level
interleaving. Large explicit review selections are bounded to eighteen questions.

Storage key/schema stays v3, curriculum becomes 13. readingPath.version=1 holds
independent words/patterns, per-Etappe records and cursors. Same-level Etappe
switches use paused keys stageId::etappeId; old sessions retain plain stageId.
Pending cue/choice order, partial errors/help, solved status, fixed goals and
backups survive switching, reload and migration. Import accepts up to four MB
with the existing strict schema validation, so eight heavily practised profiles
with saved Etappen can round-trip beyond the former one-MB input limit. No reward is awarded twice.

For old completed levels, preserve awards/flags. Their existing content maps to
legacy completion markers, explicitly without invented word/pattern evidence.
Level 33's four units are old content; Levels 34/35 each gain a new fourth unit.
Completed v12 courses therefore continue into Level 34's extension, then Level
35's extension. Active/paused old reviews returning to the former course end
are redirected to the extension without changing their question/goal. Old
unfinished rounds are labelled "Bisherige Runde" and finish
unchanged before the next new Etappe round. Existing pending/paused work remains.
Future additions need a new versioned unit rather than changing the denominator
and silently revoking an earned completion. A changed meaning needs fresh evidence.

## Pictures, audio and verification

The apple-at-tree renderer uses a dedicated illustration with exactly one apple
attached to a branch. All correct and wrong-choice scenes take this same route;
the old side-by-side composition is no longer used for apple am Baum. Atlas H
adds people, food and child actions; exact prompts/hashes are in
docs/illustration-sources.json. Source PNGs remain external; only WebP delivery
assets and clipping rectangles are committed. No original Kalulu art is added.

51 additional targets (25 in 34, 26 in 35) bring the scene banks to 80/105/102.
82 complete, optional sentence/phrase recordings use the approved free local
Thorsten High settings: length_scale 1.5 and added 0.3-second sentence pause.
642 total active clips: 76 human, 23 guides, 542 sentence/phrase, one effect.
Existing human clips are unchanged. Speech unlocks only after two mistakes and
plays only on explicit request; generic info does not reveal the reading answer.
No unsupported German consonant recording was obtained in this update.

Run node --test tests/*.test.mjs and the existing release suites, plus
node tests/reading-path.cjs. The publisher now requires current app-hash-bound
v13-reading-path.json evidence in addition to all prior release gates.
See PROGRESS.md for actual execution/publication status and exact source commits.
