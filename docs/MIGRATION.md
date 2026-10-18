# Migration from PJendritza/tmp

Requested and performed on 2026-10-18. Kalulu-DE is the permanent project repository.

## Preservation and organization

- The complete German source history through `405ba1a2349c779d29c5bb0c32b4b163268a7d63`
  is an ancestor of the new `main`; history is not squashed.
- Earlier branch tips are retained under `archive/tmp/*` tags, including the
  previous French and German artifact branches and terminal-access tests.
- All136 tracked source files are accounted for in `migration-manifest.json`.
  Some paths/code/docs intentionally change; curriculum and game integration
  behavior are preserved. Historical files remain under `archive/feasibility/`
  and `docs/history/`.
- The source is separated from generated deployment files: `main` versus `gh-pages`.
  No original assets, build caches, TTS engine or model are added to `main`.
- The old development record is preserved verbatim in
  `history/PROGRESS-2026-10-17.md`; references there describe the old layout.

The TTS generator's default/output documentation now uses the new paths. Its
63 clips are regenerated with the same pinned deterministic recipe so generation
metadata records the actual updated script. Their waveform hashes are compared
with the original collection; no pronunciation changes are intended by migration.

## Verification and cleanup order

1. Account for every tracked source file and preserve Git history/old branch tips.
2. Run content/audio tests and a fresh Godot export from the new folder.
3. Exercise gameplay, phone touch, persistence and audio-review browser tests.
4. Push source, archive tags and the isolated deployment branch to Kalulu-DE.
5. Fetch source/deployment into independent checkouts; verify source bytes, every
   deployed SHA256 and the corresponding source archive.
6. Only then retire the old tmp working copy. Preserve a recoverable local bundle
   and full working-copy archive outside both checkout roots, and leave a redirect
   on tmp's former active development branch. Do not delete the tmp GitHub repository
   or rewrite its historical commits/main.

The migration manifest records the first organized-source snapshot commit; its
after-hashes describe that snapshot, not future edited documents.

Exact results and commits are recorded in `../PROGRESS.md` and dated evidence.
The environment configuration draft should point future work to `/workspace/Kalulu-DE`;
saving a draft is separate from publishing a new environment snapshot.
