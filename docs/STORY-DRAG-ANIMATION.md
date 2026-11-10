# Story dragging and short animation rewards — v15

Level 36 still practices reading and ordering three events, with three correct
stories per round. Eleven stories are available. The original eight are retained;
the three new playful stories are first for fresh/completed profiles. Existing
partial questions keep exactly their saved story, positions and attempts.

Pictures start small in a triangular cluster, without number/column clues. Tap or
use mouse, pen or touch to move them into the larger numbered boxes. A placed
card can return to the pool or swap slots. Dropping a pool card onto an occupied
slot returns the displaced card to the pool. A cancelled/outside drag does
nothing. Keyboard buttons remain. Reset restores the original shuffle without
removing errors or assistance. The complete order is explicitly checked; only
the whole correct story earns one reward. Individual placements earn nothing.

The new stories are Der Hund und der Hut, Der Frosch auf dem Ball, and Die Katze
und die Kiste. After success, the same illustrated actors move through three
2.8-second phases, with each sentence displayed at its event. These are browser
2D animations, not generated videos. Moving, rotating and fading sprite layers
are deterministic and require no extra service/model/GPU or runtime dependency.
The AI-generated atlas has nine reusable transparent sprites; provenance and the
exact prompt are in illustration-sources.json. Existing sprites supply tree,
hat and ball. Static exercise cards are cropped, sampled film keyframes.

The short movie starts silently; pause, replay and Weiter are always available.
Weiter may skip immediately; after the final frame it waits for Weiter. Optional
narration is available once the story is solved and never upgrades first-try
evidence. Reduced-motion preference shows three still pictures and captions;
a live preference change cancels animation. Original eight stories retain fast
automatic advance. All answer targets remain stationary.

Persistence retains the v3 key, backups, old compact orders and earned completion
flags. Explicit null holes now preserve empty numbered positions after a drag.
Incomplete holes never enable checking. New curriculum content is an extension:
old awards remain visible separately from current eleven-story mastery. Solved
resume may replay a movie but cannot score again. No sentence success certifies
individual-word mastery.

New full-story recordings use the existing local Piper Thorsten High settings:
length_scale 1.5 and added 0.3-second sentence pause. No isolated human clips were
replaced. The generic guide now says “Lies die Geschichte. Ordne die Bilder.”
Instruction audio remains optional; story audio stays hidden until two wrong
checks during the exercise. Counts: 654 audio files (76 human, 24 directions,
553 optional readings and one chime), 150 actual word forms, nine atlases with
92 named sprites (2,598,912 WebP bytes). Complete package remains below 14 MB.

Verification: 107 Node unit/content tests; dedicated real Chromium mouse/CDP
 touch/keyboard gestures, cancelled drops, swap/reset, backup/reload with holes,
actual timed movie completion, replay/pause/narration/skip, one-time rewards,
live reduced motion; all eleven stories at 320×568, 390×844 and 768×1024; all prior
browser suites and full decoded audio audit. Evidence in verification/v15-*.json
and the current-hash older release gates. This does not establish physical-phone
playability or educational efficacy. Listening and child testing remain useful.
