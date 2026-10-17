# Kalulu browser feasibility

Updated: 2026-10-17. Scope: first feasibility step only. No German content, speech,
redesign, deployment, accounts, or recurring schedule created. Branch starts from
`main` at `c1e1a634ed3319534cc97cca3060d1a233fc5943`, excluding the earlier terminal-test
branch. Future runs: read AGENTS.md, this file, and `git log` before continuing.

## Result

**Original application exports, but its supplied Web Test preset does not start in
a browser.** This is a verified browser startup failure, not merely a predicted
compatibility concern. No lessons or gameplay were reached or verified.

## Official upstream and assumptions

- Application: https://github.com/Excello-Recherche-Education/Kalulu-Frontend
  inspected commit `51043b23f8e32e72ca79ca914ba3efd6b76b272e`.
- Language packs: https://github.com/Excello-Recherche-Education/Kalulu-Languages
  inspected commit `bb0f71766c5e27fdb775e544ffe62ca98e6a615c`.
- These repositories identify Excello Recherche & Education as their developer,
  link each other, and describe the original Godot educational reading game.
  Located via GitHub search and the Excello organization's repository listing;
  older unrelated/name-matching repositories were not used.
- The application README describes grapheme–phoneme decoding, educational and
  neuroscience research, and links published papers. Papers were not independently
  reviewed in this feasibility task; no claim about efficacy is established here.
- Pack folders are `fr_FR`, `es_AR`, `es_CO`, `es_UY`, `pt_BR`. No German pack at
  the inspected revision. UI translations include Spanish, French, Brazilian
  Portuguese, and Italian; UI translation is distinct from a teaching pack.
- Both root LICENSE files say **Creative Commons Attribution-ShareAlike 4.0
  International**, copyright 2023 Excello: attribution, license link, indication of
  changes, and share-alike required. Source is publicly available; do not assume
  MIT/GPL or an OSI software license. Bundled addons have separate licenses
  (e.g. godot-sqlite/LICENSE.md, gut/LICENSE.md); review notices before distribution.
- The application README's web FAQ says “We are working on it, stay tuned!”
  Release CI exports Android/Linux/macOS/Windows, not web.

## Engine, dependencies, and web evidence

- Actual `project.godot`: application version 3.1.6, features Godot **4.7**,
  rendering method **gl_compatibility**. README says 4.6+ and CONTRIBUTING recommends
  4.6.3, but current project and test/export CI target 4.7. Used 4.7 accordingly,
  rather than preinstalled 4.6.3.
- Used official Linux Godot **4.7.stable.official.5b4e0cb0f**, matching 4.7.stable
  web export templates. Both release archives verified against the upstream
  `SHA512-SUMS.txt` fetched over verified HTTPS. No engine source compilation needed.
- Required native/GDExtension dependency: **godot-sqlite v4.7**, as pinned by upstream
  plugin.cfg and CI. Its ignored binary directory is not in Git. Downloaded official
  `https://github.com/2shady4u/godot-sqlite/releases/download/v4.7/bin.zip` over verified
  HTTPS; installed Linux editor debug library plus web WASM libraries.
  Reproducibility SHA256 of this downloaded archive:
  `123c92c2d0d023b8998672eb2d8f7843f4f090b7ef1ecd900dd3568d89ae6775`
  (locally measured release pin, not a separately published signature).
- Other bundled addons: export_tool_manager, godot-form-validator, GUT.
  Missing optional ignored `script-ide` editor plugin causes a warning and Godot
  removes it from project.godot during import. The export helper detects and restores
  ONLY this known automatic editor-setting edit. No application code, scenes,
  export settings, dependencies, or other tracked upstream files were changed.
- `export_presets.cfg`, preset 8 **Web Test**: extensions_support=false,
  thread_support=true, PWA=false. Its SQLite .gdextension declares threaded and
  non-threaded web WASM libraries. `sources/utils/autoloads/database.gd` uses
  `SQLite.new()`; the extension is a runtime requirement.
- Threaded export needs cross-origin isolation; local server supplies COOP
  `same-origin` and COEP `require-corp`. Browser confirmed crossOriginIsolated=true,
  so the observed failure is not missing isolation headers.
- Real gameplay also depends on downloaded SQLite/audio/media language packs,
  persisted user data, and initial registration/login/backend connectivity per
  upstream documentation. Code references `api.kalulu.org/prod/`,
  `dev.api.kalulu.org/dev/`, an internet probe at google.com, and backend-provided
  S3 pack URLs. CORS, credentials, backend health, persistence, audio interaction,
  and pack installation in browsers remain **untested**. Do not create an account
  or alter production data merely to test feasibility.

## Commands actually executed and outcomes

Workspace: `/workspace/kalulu-feasibility`, outside PJendritza/tmp. 5 CPU cores and
ample disk/RAM checked before import. Use bounded single import/export operations;
no manual parallel compilation. Generated files remain outside the project repo.

Initial checkouts:

```bash
git clone --depth 1 https://github.com/Excello-Recherche-Education/Kalulu-Frontend.git /workspace/kalulu-feasibility/frontend
git clone --depth 1 https://github.com/Excello-Recherche-Education/Kalulu-Languages.git /workspace/kalulu-feasibility/languages
```

Reproducible commands from `/workspace/tmp` (scripts also accept KALULU_WORKSPACE):

```bash
bash scripts/prepare_original.sh
bash scripts/export_original.sh
python3 scripts/serve_web.py /workspace/kalulu-feasibility/web
# In another terminal:
node scripts/smoke_web.cjs
```

- Preparation helper executed successfully against existing pinned clones/downloads:
  official SHA512 verification passed for both Godot archives, SQLite SHA256 passed,
  matching engine ran. First helper attempt correctly refused Godot's local editor
  modification; inspected and restored it before successful rerun.
- Export helper executed successfully twice (initially then after adding automatic
  editor-setting restoration). Underlying commands:
  `Godot_v4.7-stable_linux.x86_64 --headless --path /workspace/kalulu-feasibility/frontend --editor --import`
  then `--headless --path /workspace/kalulu-feasibility/frontend --export-release 'Web Test' /workspace/kalulu-feasibility/web/index.html`.
  Import/export exited 0. Cold import initially complained about absent generated
  imports/translations before producing them; subsequent import had no such errors.
  Export warnings: absent optional script-ide plugin, one leaked ObjectDB instance.
- Output: index.html, index.js, approximately 38 MiB index.wasm, 535 MiB index.pck,
  audio worklets, icons, SQLite WASM. File existence/size checked. This is a large
  unoptimized baseline; no build files committed.
- Local HTTP HEAD returned 200 with required COOP/COEP headers. Server logs show
  successful requests for HTML, JS, PCK and WASM.
- **Chromium + Playwright smoke test executed** with system Chromium, headless,
  software WebGL (SwiftShader). Playwright is already available in this environment;
  on a fresh machine install it outside the checkout if absent.
  After a 30-second observation, the page showed the Godot loading screen and:

  > GDExtension libraries are not supported by this engine version. Enable
  > "Extensions Support" for your export preset and/or build your custom template
  > with "dlink_enabled=yes".

  Browser console reports the same startup error; smoke script exits **1**.
  Screenshot visually inspected. Canvas exists but remains 300x150; neither a canvas
  nor completed export constitutes playable-game evidence. Compact browser evidence
  is in `evidence/original-browser.json`; full local logs/screenshots are in
  `/workspace/kalulu-feasibility/logs/` (not committed).
- `git diff --exit-code` and `git status --porcelain` on both upstream clones were
  checked clean after setup/restoration. PJendritza/tmp contains only instructions,
  small helpers/evidence and its original .gitkeep; main was not checked out or pushed.

## Access blockers and configuration

- https://kalulu.excellolab.org/ returned HTTP 403; api.github.com failed CONNECT
  with HTTP 403. GitHub HTML search, native Git clone/fetch, and release downloads
  worked with existing injected authentication. No new token requested.
- Saved a configuration **draft** adding custom destinations kalulu.excellolab.org
  and api.github.com while retaining existing preset destinations. This does not
  apply or publish network changes. Optional for this completed feasibility result:
  review/save those additions in environment settings and publish to use them later.
- No missing tools/access blocked export or the browser smoke test. The concrete
  playability blocker is the upstream web preset's missing extension support.

## Smallest next actionable step

On a separate development step/branch, enable `variant/extensions_support=true`
for Web Test in a disposable source copy or controlled configuration patch, keeping
game code and thread support unchanged. Use matching stock `web_dlink_release.zip`
template and v4.7 SQLite threaded WASM, then repeat the same isolated browser probe.
This is a small export-configuration experiment, not evidence that a large port is
required. If startup works, test navigation and offline pack/persistence separately;
then assess CORS/backend and actual lesson play before German adaptation. Do not
start a port, deployment, or content authoring on the present evidence alone.

For eventual GitHub Pages: threaded baseline needs isolation headers that Pages does
not directly configure; investigate Godot PWA isolation support or a tested non-threaded
configuration later. Do not infer that extension support alone solves hosting/gameplay.
