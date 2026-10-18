# Kalulu-DE status

Updated2026-10-18. Permanent project: PJendritza/Kalulu-DE. Migration is in progress;
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
 12-pool audit and web export passed with no SCRIPT ERROR/ERROR. Browser and remote
 checks are running before any cleanup.
- No Pages activation, repository deletion, history rewrite or scheduling performed.

Next: complete migration checks and push, fetch-verify everything, then retire the
old tmp working copy. Details: docs/MIGRATION.md. Keep originals until verification.

## Remaining product checks

Native German listening/educator review and actual iPhone/Android testing remain.
GitHub Pages is not live merely because a gh-pages branch exists. After migration,
hosting activation is a separate step. Do not repeat the Sites detour.
