# Kalulu-DE development instructions

Read this file, PROGRESS.md and recent Git history before continuing. Canonical
repository: https://github.com/PJendritza/Kalulu-DE. Use /workspace/Kalulu-DE;
do not recreate tmp or create worktrees without a specific need/request.

Current goal: a calm, lightweight German phonics app using plain HTML/CSS/ES
modules. No game engine, moving answer targets, countdowns, speed scoring or lost
lives. Keep child-facing screens simple. See docs/GOALS.md. Do not restore the old
Godot project into the active tree; it is preserved by archive tags.

Layout: app is the complete static app; scripts builds/publishes/regenerates audio;
tests holds learning and browser checks; docs records plan, provenance and evidence.
main is source; gh-pages is generated deployment. Work in feature branches and
commit/push meaningful progress. Preserve user changes. No force pushes, repository
deletion, visibility changes, recurring scheduling, production accounts or new
hosting activation without authorization. Updating the existing demo is authorized
within an explicit demo-development request.

Generated outputs and publication checkouts stay outside source, default
/workspace/kalulu-browser-build. Audio/model caches are external. Never commit
Piper/Godot engines, models, node_modules or bulk upstream assets. Keep TLS and
checksums enabled and use existing Git authentication; do not extract tokens.
Packaging versions all CSS/module imports and media by a content-derived release
query; preserve this cache invalidation for returning phone browsers.

Human recordings are used for isolated vowels, syllables and words. Piper is only
for complete sentence instructions. Never clip vowels out of words, confuse letter
names with phonemes, stitch long vowels into short-vowel words, or label technical
playback tests as native-speaker/educator approval. The user confirmed v2 worked on their phone and sounded better; new recordings
still require listening approval. Preserve individual credits, license versions and source hashes.
Use docs/AUDIO.md and app/audio/manifest.json. The eight-stage path introduces
short vowels in complete word contexts and n/l via final-sound detection. Never
substitute letter names or pretend this is a complete validated curriculum.

Progress: validated v3 browser-local store, up to eight separate animal profiles,
exact pending-round/partial-word resume and all-profile backup/import. Preserve
v2 migration and its original storage key. Imports/reset/deletion require explicit
UI confirmation; independent first-try evidence controls mastery, not demonstrations.
Use the prominent play button for the guided path, spoken instructions and large
next arrow so a nonreader does not need menus. Keep reward animations away from
answer targets and respect reduced motion. Do not silently add tracking, accounts,
uploads or paid APIs. Never base adaptation
on speed; favor errors and underexposure. Failed persistence must allow practice.

Run node --test tests/learning.test.mjs, python3 scripts/build.py, and relevant
Playwright checks after functional changes. tests/browser.cjs exercises actual
media playback, stationary targets, retries, complete lessons and saved progress.
Also run tests/profiles.cjs and tests/mobile-smoke.cjs when profiles, progression or
layout change. Test all-complete stage access and confirmed profile reset/deletion.
Use a path prefix for Pages checks. Distinguish Chromium mobile emulation from a
real phone test. Keep exact results and next action in PROGRESS.md. Store concise
verification JSON under docs/verification, screenshots outside Git.

Publish clean tested main using scripts/publish.py (normal push, existing Pages
settings). Verify HTTPS responses and artifact hashes. Update docs after publishing
if needed without claiming a later docs-only commit is the deployed app commit.
The public URL is https://patrickjendritza.com/Kalulu-DE/ .

License: project CC BY-SA 4.0; individual human recordings CC BY-SA 3.0/4.0. Preserve
upstream historical attribution and third-party audio notices. No scientific or
native-phonetic validation claims without evidence.
