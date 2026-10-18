# Kalulu-DE development instructions

Read this file, PROGRESS.md and recent Git history before continuing. This is the
permanent repository: https://github.com/PJendritza/Kalulu-DE. Work here, not in tmp.
Use existing checkouts; do not create worktrees unless explicitly requested.

Layout: app/content/de_DE holds teaching data/audio; app/godot is the original-game
integration overlay; deployment holds web inputs; scripts builds/packages; tests
contains content/browser checks; docs records usage/provenance/evidence. main is
source, gh-pages is generated deployment only. archive/feasibility and archive/tmp/*
tags preserve earlier experiments; they are not the current build interface.

Work autonomously within the requested scope: research, dependencies, build, test,
debug and commit/push meaningful progress. Use feature branches for future changes;
this initial migration establishes main. Preserve user changes and upstream pinned
checkouts. No force pushes, repository deletion, visibility changes, scheduling,
production accounts or new hosting activation without user authorization.

Keep generated outputs/caches outside the source checkout (default build root:
/workspace/kalulu-de-build). Original tools/dependencies remain in the external
/workspace/kalulu-feasibility cache. Never commit TTS model/engine or bulk upstream
assets. Keep TLS/checksum verification and existing Git proxy authentication.

The six-lesson German prototype uses the original jellyfish/frog games. Technical
playability is verified separately from native-phone compatibility, German listening
approval and educator review. Those human/device reviews remain outstanding. Model
vowel length/context explicitly and never offer visually identical wrong answers.

Maintain PROGRESS.md with exact commands, outcomes, blockers and next actionable
step. Keep dated evidence under docs/verification. After source changes run relevant
Python tests, build/audit and meaningful browser checks. Export alone is not gameplay.
Publish only tested artifacts using scripts/publish_web_build.sh; that script does
not enable Pages. Keep source/version/license notices consistent in packaged ZIPs.

Preserve upstream CC BY-SA4.0 attribution/share-alike and third-party notices. See
README.md, docs/RUNNING.md, docs/ARCHITECTURE.md and docs/AUDIO.md for details.
