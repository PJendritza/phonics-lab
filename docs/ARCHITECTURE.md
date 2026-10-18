# Project layout and build boundary

## Editable application

`app/content/de_DE/content.json` is the source of teaching data. Its audio IDs map
to WAVs and provenance in `app/content/de_DE/audio/`. `app/godot/` contains the
offline bootstrap, six-lesson menu and read-only integration audit. It is an
overlay for the original game, not a second game implementation.

The build clones/pins the official repositories through `scripts/prepare_original.sh`:

- Kalulu-Frontend: `51043b23f8e32e72ca79ca914ba3efd6b76b272e`.
- Kalulu-Languages: `bb0f71766c5e27fdb775e544ffe62ca98e6a615c` (schema only for German).
- Godot: official 4.7 stable engine/templates; SQLite extension v4.7.

Original checkouts stay clean. `scripts/build_german_demo.py` prepares a disposable
frontend, installs the German pack and applies the small menu-return/configuration
patches. Game mechanics, scoring and animation remain upstream.

## Deployment

`deployment/site/` and `deployment/godot-web-export.cfg` hold web-specific inputs.
`scripts/build_german_demo.sh` imports, audits and exports; `package_german_demo.py`
adds the landing/audio-review pages, notices, source archive and build metadata.
The default generated directory is `/workspace/kalulu-de-build/web`, outside Git.

`scripts/publish_web_build.sh` requires successful current gameplay/audio browser
checks and a clean source tree. It uploads only generated files to `gh-pages`.
It does not alter source or call the Pages settings API. GitHub automatically
publishes the branch under the current configuration. Never put WASM/PCK builds on `main`.

The export is single-threaded with GDExtension support. It works on an ordinary
static HTTP server without special COOP/COEP headers. Progress stays in browser
storage. There is no production login, backend account or database service.

## Tests and records

Python tests exercise the real schema/encoder and content/audio integrity.
`tests/browser/` uses real input, screenshots and audio output against the built
site. The Godot audit also invokes all twelve lesson/game stimulus builders.
Evidence is dated under `docs/verification/`; historical evidence is kept intact.

`archive/feasibility/` contains the old exploratory material. Its paths and scripts
are historical, not the supported build interface. Old commits and snapshots
remain recoverable from `archive/tmp/*` tags. Do not deploy the French historical
`gh-pages` archive by mistake; the current `gh-pages` branch is the German build.
