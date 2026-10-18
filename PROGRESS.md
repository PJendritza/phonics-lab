# Kalulu-DE status

Updated2026-10-18. Permanent project: PJendritza/Kalulu-DE. Source migration and local checks are complete; remote deployment verification pending;
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
GitHub Pages is not live merely because a gh-pages branch exists. After migration,
hosting activation is a separate step. Do not repeat the Sites detour.

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
