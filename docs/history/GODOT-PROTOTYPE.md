# Historical Godot attempt — preserved, no longer active

The first feasibility work exported the original Excello Kalulu Godot game for the
web, integrated a six-lesson German prototype, generated Piper speech, added audio
review and published on the existing GitHub Pages branch. It was migrated from
PJendritza/tmp to PJendritza/Kalulu-DE; that migration was independently checked.

On October 18, 2026 the user tested it and rejected the moving-target gameplay and
short synthetic sound quality. This is evidence about that prototype, not a reason
to retain the engine in the new app. The replacement is a new simple static browser
implementation inspired by the phonics approach.

Preserved GitHub snapshots:

- [Source, old AGENTS/PROGRESS, upstream investigation, audio generation and build documentation](https://github.com/PJendritza/Kalulu-DE/tree/archive/godot-prototype-2026-10-18)
  — tag archive/godot-prototype-2026-10-18, commit 9e8c4afe65a1430484eed883d283c5e70bc1dfcd.
- [Last original-game generated website and test metadata](https://github.com/PJendritza/Kalulu-DE/tree/archive/godot-deployment-2026-10-18)
  — tag archive/godot-deployment-2026-10-18, commit 92c6fbf6cb72f99fdd9570b8aa27c53fabc2190a.
- Other archive/tmp/* tags preserve earlier source and French/German build stages.

Both named snapshot tags were pushed before replacing the active source/deployment.
Git history retains the old files; removing them from the current tree does not erase
that history. Future cleanup of Git object history is not authorized or necessary.
Only three tiny old synthetic comparison clips remain in the new audio-review page.
They are never used by the exercises. Original bulk assets, Godot code and engine
binaries no longer belong in current source or deployment.

Original application: https://github.com/Excello-Recherche-Education/Kalulu-Frontend — see the archived
investigation for exact upstream revision, repository paths, language packs and
export evidence. Language packs: https://github.com/Excello-Recherche-Education/Kalulu-Languages. Historical Kalulu attribution: Excello and contributors, CC BY-SA
4.0. Do not infer clinical/educational efficacy for the new implementation from the
original Kalulu research.
