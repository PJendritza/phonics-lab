# Phonics Lab development instructions

Read this file, PROGRESS.md and recent Git history before continuing. Canonical
repository: https://github.com/PJendritza/phonics-lab. Use /workspace/Kalulu-DE;
do not recreate tmp or create worktrees without a specific need/request.
The local directory intentionally retains its old name. Product: Phonics Lab.
Repository rename is verified; website: https://patrickjendritza.com/phonics-lab/ .
Keep Kalulu inspiration and historical/source/audio credits in About. Preserve
legacy storage keys and existing backups; a name/path change must not erase learners.

Goal: a calm, lightweight German phonics app using plain HTML/CSS/ES modules.
No game engine, moving answer targets, countdowns, speed scoring or lost lives.
Minimal entrance: profile plus large start/continue. Keep the parent stage map and
its preview checkbox. See docs/GOALS.md and docs/NEXT-VERSION.md.

Correct answers produce a brief nonverbal chime/check and automatically advance
about 340 ms after a complete response, with a small local sparkle and growing flower. No spoken success praise or per-question
next button. Every correct choice visibly advances the fixed level goal, including
partial grapheme blocks. New goals are 12–18 questions; saved pending goals stay unchanged; never finish early. Completing
a level adds a flower; this rewards practice, while independent accuracy separately
controls mastery/unlocking. Wrong answers play the selected option’s human sound/context, keep choices stationary and award no progress. Never cover selected-option feedback with automatic original-target replay.
Animations affect feedback/progress only; respect reduced motion. Successful current levels advance to the next numbered level, even with unfinished earlier levels; never automatically select an earlier weak stage. Earlier review and post-final-level review are explicit choices. A level-boundary
play button is intentional. Theme presentation must remain interchangeable.

Layout: app/ is the complete static website; scripts/ builds, publishes and prepares
audio; tests/ holds learning/browser checks; docs/ records provenance and evidence.
main is source; gh-pages generated deployment. Use feature branches, normal commits
and pushes. Preserve user changes. No force pushes, repository deletion/visibility
changes, recurring scheduling, production accounts or new hosting without explicit
authorization. Updating the existing demo is authorized in demo-development requests.
Old Godot assets remain in archive tags, outside the active app.

Generated builds/checkouts belong outside source (/workspace/kalulu-browser-build).
Keep model/audio caches external. Do not commit engines, models, dependencies or
bulk upstream assets. Keep TLS/checksum verification; use existing Git auth without
extracting tokens. Preserve content-derived asset queries for returning phone caches.

Fonts: locally bundled OFL subsets of Andika 7.000, internally renamed Phonics Lesson to respect reserved names. Keep cv39=1 curved l and default single-storey a; preserve license and content-hashed filenames. See docs/FONTS.md.

Audio: 41 complete human target recordings, nine full-sentence Piper instructions,
one nonverbal effect. Three legacy synthetic comparisons are adult-review only.
Never synthesize isolated phonemes, substitute letter names, crop consonants/vowels
from words, or stitch long vowels into short-vowel words. New consonants are heard
in natural word beginnings/endings. These are context exercises, not verified pure
isolated phoneme samples. b/d/g are initial; final s differs from voiced initial s.
sch and ll are grapheme blocks. Preserve source/license versions and original/output
hashes. See docs/AUDIO.md and app/audio/manifest.json. Technical decode tests cannot
prove pronunciation or educational efficacy; new material needs native/educator review.

Progress: schema version 3 and kalulu-de:learners:v3 remain deliberately unchanged.
Up to eight animal profiles, a separate continuation cursor and per-level paused questions, exact pending/partial-word resume and confirmed backup
import/reset/deletion. Preserve v2 migration and its original key. Demonstrations
never become independent mastery. Accuracy/underexposure drive adaptation, never
response time. Save before auto-advance, cancel navigation timers/audio, and never
award twice after pause/reload. Failed storage still permits in-memory practice.
No tracking, accounts, uploads, paid APIs or cloud sync without a separate decision.
User budget preference: use free/local generation; do not propose paid services or
assume ChatGPT Plus/Google subscription access includes external API/GPU credits.
Current instruction voice: Thorsten High, length_scale=1.5, added 0.3-second
sentence pause. See docs/NEXT-VERSION.md before implementing the next release.

After functional changes run node --test tests/learning.test.mjs tests/content.test.mjs,
python3 scripts/audit_audio.py, python3 scripts/build.py and relevant Playwright
checks. tests/browser.cjs checks actual playback/automatic flow and binds evidence
to the app tree hash. Also run tests/mobile-smoke.cjs, tests/profiles.cjs and
tests/word-hints.cjs and tests/level-navigation.cjs when those behaviors change. Exercise the /phonics-lab/ prefix.
Chromium emulation is not a physical-phone test. Keep exact commands/results/limits
in PROGRESS.md and concise JSON in docs/verification; screenshots outside Git.

Publish clean tested main with scripts/publish.py and a fresh external checkout.
It requires pushed source, current app-hash-bound browser evidence and checksums.
Do not change Pages settings. Verify all HTTPS bytes with scripts/verify_live.py.
Later documentation-only commits are distinct from the deployed app source commit.
License: project CC BY-SA 4.0; individual recordings CC BY-SA 3.0/4.0. Preserve credits.
