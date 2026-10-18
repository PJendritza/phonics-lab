# Kalulu-DE status

Updated2026-10-18. Permanent project: PJendritza/Kalulu-DE. Source/build migration and independent remote checks are complete; tmp retirement pending;
read this file, AGENTS.md and recent Git history before continuing.

## Existing working prototype

Six cumulative German lessons;13GP readings over7letters,25syllables,18words/names,
63synthetic German clips. Original jellyfish/frog game mechanics/animations reused.
Earlier Chromium tests completed jellyfish1 8/8 and frog1/6 5/5, checked nonzero audio,
reload persistence and phone/touch emulation. All19content/audio tests passed.
This is adult technical testing, not native-device or pedagogical approval.

## Migration in progress

- Source history retained from tmp commit405ba1a; all prior remote branches fetched.
- Organized source in app/, deployment/, scripts/, tests/ and docs/.
- Historical French/feasibility work is retained in archive/feasibility; original
  progress record is docs/history/PROGRESS-2026-10-17.md.
- New main is development source; gh-pages will hold only generated browser files.
- Updated build/test/source-package paths, repository links and audio-generator
  defaults. Retained pinned upstream revisions and isolated external build caches.
- Existing19tests passed after path updates. Regenerated63clips with the same recipe;
  all63 waveforms are byte-identical to the old collection. The fresh import,
 12-pool audit and web export passed with no SCRIPT ERROR/ERROR. Fresh Chromium
 jellyfish1 completed8/8(72s,8clicks), frog1 completed5/5(104s,10scored correct
 answers). Audio, reload persistence and844x390touch(one tap advances gauge) passed.
 All63clips decode on the review page; native audio controls play correctly.
 No game runtime errors or external requests. Evidence: docs/verification/2026-10-18/.
- No Pages activation, repository deletion, history rewrite or scheduling performed.

Next: complete migration checks and push, fetch-verify everything, then retire the
old tmp working copy. Details: docs/MIGRATION.md. Keep originals until verification.

## Remaining product checks

Native German listening/educator review and actual iPhone/Android testing remain.
GitHub automatically enabled Pages on the first gh-pages push and reports built,
using the existing custom domain. HTTPS https://patrickjendritza.com/Kalulu-DE/
returns200. Nine live game/landing/audio files hash-match the tested deployment.
A local /Kalulu-DE/ subpath simulation loads the menu and GP preview without runtime
errors. Actual phone/Safari remains untested; no live-browser playability claim
beyond those file checks. No Pages API settings were changed; do not repeat Sites.

## Executed migration checks

```bash
python3 -m unittest discover -s tests -p 'test_german_*.py' -v
# PASS19tests after final audio metadata/path migration.
bash scripts/build_german_demo.sh
# PASSfresh import,12game-pool audit,57MP3decodes and Web export.
python3 -m http.server 8062 --bind 127.0.0.1 --directory /workspace/kalulu-de-build/web
KALULU_GERMAN_URL=http://127.0.0.1:8062/ OMP_THREAD_LIMIT=1 node tests/browser/test_german_demo.cjs
KALULU_GERMAN_URL=http://127.0.0.1:8062/ OMP_THREAD_LIMIT=1 node tests/browser/test_german_frog.cjs
KALULU_GERMAN_URL=http://127.0.0.1:8062/ node tests/browser/test_german_audio_review.cjs
# All3browser suitesPASS against the new build; no real phone/listening approval.
```

Source and9archive tags are pushed to Kalulu-DE. All136original tracked files are
mapped;119were unchanged on initial migration (including every WAV, curriculum JSON
and Godot integration script/scene). Full original history is preserved. The local
recoverable history bundle is /workspace/kalulu-migration/complete-history.bundle.
Deployment upload, independent remote byte checks and tmp retirement follow.

## Independent remote migration verification

Fresh source and gh-pages clones were fetched into /workspace/kalulu-migration/.
All151source files matched byte-for-byte, every one of136original tracked files
was accounted for, all9archive tags/commit objects were present, all86deployment
SHA256 checks passed, and the source ZIP matched the new paths/source commit.
See docs/verification/2026-10-18/migration-verification.json. Packaged source was
1ba1251dc20680c865b049fc53ec0eaf47e98897; deployment ca2189227ea16516f1a8945d772eb19d8d5596a3.
Subsequent documentation-only updates may advance main beyond the frozen build.

Full original working copy and Git metadata (including ignored files) have been
archived/verified at /workspace/kalulu-migration/tmp-before-retirement.tar.gz;
all136tracked source hashes were checked inside the archive. The terminal-access
helper has its own archive. Git history also has a complete verified bundle.
No tmp removal occurs until source and deployment verification succeeds.
