# Level groups and spaced practice (v8)

The user requested clearer numbered levels/groups and less repetitive practice,
especially for words already answered correctly many times. This update addresses
those requests. The separately deferred voice, picture-feedback, AI-illustration
and curriculum-expansion plans remain pending.

## Navigation

Numbers and persistent IDs stay unchanged. Five contiguous groups organise the
map: Laute und Silben (1–6), Erste Wörter und Wortbausteine (7–14), Wörter lesen
und Bilder zuordnen (15–21), Schreibmuster in Wörtern (22–29), and Von kleinen
Wörtern zu Sätzen (30–32). The numbered shortcuts remain available.

Titles and activity labels distinguish listening/spelling recognition from
independent reading and word building. Level 31 is honestly called “Wörter im
Satz lesen”: its last-noun shortcut is not fixed or described as a comprehension
test. Level 32 is “Sätze verstehen: Was ist wo?”. No content reordering/removal or
new sound/image assets are part of this release.

## Selection within a round

The old 0.08 penalty for the previous item could be overwhelmed by the priority
of one weak target, causing it to recur immediately. The new selector excludes the
last two completed skill targets when at least three targets are available.
A hypothetical two-target pool alternates. Correction attempts within the same
question, including the existing two-error teaching/retry step, are intentionally
not new spaced questions.

Unseen and under-practised targets get priority. Mistakes/assistance keep the item
weak, with another retrieval after intervening work. Correct first attempts grow
the preferred turn gap (3, 6, 12, then 24 completed-question turns). When a level's
small target pool cannot satisfy the preferred long gap, least-recently-practised
items fill the remaining fixed goal; the strict no-immediate-repeat gap still
holds. This is why merely adding large numerical gaps would not solve repetitive
three-word levels on its own.

New round goals therefore depend on target count and prior independent accuracy.
A new three-word practice round normally has six questions, rather than eighteen;
an already-secure set can receive one retrieval per item. Round goals are fixed
when the round starts and never shrink mid-round. Saved unfinished totals of
9/12/14/18 remain exact. A flower still rewards a completed practice goal;
independent mastery remains a separate rule, not a diagnosis.

## Review across visits

Per-skill metadata stores a capped successful streak, last practice time/turn,
next preferred turn and next due timestamp. First successful learning retrievals
can recur during the lesson; after secure repeat retrievals, dates expand to
1, 3, 7, 14 and 30 days. A mistake or read-aloud/syllable assistance resets the
streak and requests review after ten minutes, while in-lesson weak-item practice
can return sooner after the question gap. Teaching taps, partial word blocks and
duplicate solved taps do not advance the spacing clock or create extra dates.

The ↻ Wiederholen button offers due work from previously completed levels. It
does not automatically send the main learning path backwards. Each due target is
tested once in a short review queue, so a single due word does not become a run
of identical questions. Reviews save exact position, choices, assistance and
return path. An existing unfinished session for that level is resumed rather than
discarded. After review, the latest chosen forward cursor and any paused higher
question resume. Opening the same old review after later course work updates its
return destination, preventing a stale return path.

Shared skill keys across overlapping levels are counted only once in due work.
Hearing and independent reading keep distinct skill groups. Demonstrations do
not become independent mastery. Adult date/interval details stay separate from
the child's minimal play/review controls.

## Storage and limits

The version-3 storage key/schema and curriculumVersion 7 remain, since content
IDs/order have not changed. The optional `spacing` field contains a bounded turn
counter, eight recent keys and at most one review record per valid skill key.
Existing saves acquire defaults without losing old progress or inventing past
dates. Previously secure words get a delayed next review after their first new
independent retrieval. Validation rejects unknown keys, invalid timestamps,
impossible future turns and invalid review queues/return paths. Backup/import,
profile isolation and quota-failure in-memory practice remain available.

This is a transparent heuristic, not a validated individual memory model. Wall
time schedules review only; response speed is never scored. Dates follow the
device clock, with no account/server/scheduler. The UI refreshes due counts when
the home screen returns from the background. Audio, words, images, voice settings
and third-party/runtime dependencies are unchanged.

## Verification

Run the existing learning/content/reading tests plus `tests/spacing.test.mjs`.
The new browser suite `tests/spacing.cjs` checks grouping, actual gapped practice,
old-profile migration, review/resume, fixed old goals and mobile layouts. The
existing full-browser, reading, profiles, navigation, teaching and reduced-motion
checks remain required. Exact executed results and deployed commits: PROGRESS.md.
