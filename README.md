# Kalulu-DE

German adaptation of [Kalulu](https://github.com/Excello-Recherche-Education/Kalulu-Frontend),
the reading game by Excello Recherche & Éducation. The first browser prototype
contains six lessons, 25 syllables, 18 words/names and 63 synthetic German clips,
using the original jellyfish and frog games.

This is an adult-testing prototype. Pronunciation and lesson sequencing need
native German and educator review. It is not an officially validated German course.

**[Open the browser prototype](https://patrickjendritza.com/Kalulu-DE/)** · Phone hardware testing is still pending.

## App source versus deployment

`main` is the development source. [`gh-pages`](https://github.com/PJendritza/Kalulu-DE/tree/gh-pages)
contains only the generated, ready-to-serve website. GitHub automatically enabled
Pages when this branch was first pushed; the HTTPS landing page and game asset
hashes have been checked. See PROGRESS.md for the exact verification limits.

```text
app/
  content/de_DE/    German curriculum, WAV clips and generation provenance
  godot/            Small integration scripts/scenes for the original Godot game
deployment/
  site/             Website landing page
  licenses/         Bundled engine attribution and notices
  godot-web-export.cfg
scripts/             Prepare dependencies, build, package and publish the web build
tests/
  browser/          Real browser mouse/touch/audio tests and screenshot helpers
docs/                Curriculum, audio, running instructions and verification
archive/feasibility/ Earlier French demo and exploratory helpers; inactive
```

The full original Godot game and export templates are fetched at pinned revisions
into an external build cache. We do not duplicate large upstream assets or TTS
models in this source branch. See [architecture](docs/ARCHITECTURE.md).

## Run or develop

- [Run the ready-made build on a computer or phone](docs/RUNNING.md)
- [Rebuild and test](docs/RUNNING.md#rebuild-from-source-in-the-cloud-workspace)
- [Audio generation and review](docs/AUDIO.md)
- [Curriculum and pronunciation choices](docs/CURRICULUM.md)
- [Current status and next step](PROGRESS.md)

Start new development by reading `AGENTS.md`, `PROGRESS.md` and recent Git history.

## License and attribution

Kalulu and these adaptations use [CC BY-SA 4.0](LICENSE). Credit Excello Recherche
& Éducation and the Kalulu-DE contributors. Godot and SQLite keep their MIT
licenses; the packaged website includes third-party notices and corresponding
source. Draft speech was generated with Piper/Thorsten-Voice; its provenance is
documented separately. No endorsement by Excello is implied.

## Migration history

This repository continues the work previously developed in `PJendritza/tmp`.
Git history is retained; `archive/tmp/*` tags preserve the previous branch tips,
including the earlier French and German browser artifacts. See
[migration notes](docs/MIGRATION.md). There is no need to copy code from `tmp` again.
