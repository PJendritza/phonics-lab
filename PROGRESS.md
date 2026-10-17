# Kalulu browser feasibility

Updated: 2026-10-17. Scope: browser feasibility and authorized extension-support follow-up. No German content, generated speech,
redesign, deployment, accounts, or recurring schedule created. Branch starts from
`main` at `c1e1a634ed3319534cc97cca3060d1a233fc5943`, excluding the earlier terminal-test
branch. Future runs: read AGENTS.md, this file, and `git log` before continuing.

## Result

**The game starts and its welcome UI responds in Chromium after enabling the single
web export setting `variant/extensions_support=true`.** No application code changes
were needed. The original supplied preset still fails; its baseline evidence is kept.
No complete lesson or gameplay inside the original application has been verified.

## Extension-support follow-up (current)

The user explicitly authorized this next experiment after the initial feasibility
report. Branch `kalulu-web-extension-test` starts at the previous report commit
`9d5a248`; main remains unchanged.

### Executed

```bash
# From /workspace/tmp, after the original preparation:
bash scripts/export_extensions.sh
bash scripts/export_capabilities.sh
python3 scripts/serve_web.py /workspace/kalulu-extension-test/web
# Separate terminal:
KALULU_WORKSPACE=/workspace/kalulu-extension-test KALULU_EXPECT_WELCOME=1 KALULU_PROBE_NAME=interactive timeout 180s node scripts/smoke_web.cjs
timeout 180s node scripts/test_capabilities.cjs
KALULU_WORKSPACE=/workspace/kalulu-extension-test KALULU_EXPECT_WELCOME=1 KALULU_TEST_LOCALE_RELOAD=1 KALULU_PROBE_NAME=locale-reload timeout 240s node scripts/smoke_web.cjs
```

`export_extensions.sh` uses a separate copy at
`/workspace/kalulu-extension-test/frontend`, reusing the already imported assets and
matching tools. It refuses unrelated tracked changes/untracked files. The only
intentional upstream diff is the extension-support property; Godot again drops the
missing optional script-ide editor plugin in that disposable copy. Original upstream
checkouts remain clean. No game code, scene, renderer, or threading changes.

- Extension-enabled export executed manually and again through the committed helper:
  both exit 0. Uses official dynamic-linking web release template, matching SQLite
  threaded WASM, same 535 MiB game-data pack. Browser logs confirm “multi-threaded,
  GDExtension support.” No custom engine compilation required.
- Initial 30-second observation only reached the splash. A longer probe reached
  `Welcome: Loaded`; on separate runs it took roughly 26–41 seconds after engine
  initialization under software WebGL. This was slow loading, not a proven deadlock.
  The smoke helper now waits for the actual welcome-screen log when requested and
  fails if it never appears. Its baseline/default mode remains only observational;
  always use KALULU_EXPECT_WELCOME=1 for this follow-up.
- Browser interaction executed: login → sign-up adult challenge → login → language
  selector. Screenshots were visually inspected and confirmed changed UI states.
  No form submitted, credentials entered, account created, or production data changed.
- The game's locale was changed to **Spanish (Colombia), es_CO**, then the page was
  reloaded in the same browser context. It read the saved device/environment settings
  and again showed the welcome screen in Spanish with that locale selected. This
  application-level persistence test exited 0; screenshot visually verified. A browser
  autoplay warning appeared after reload (audio needs a user gesture); it did not
  prevent navigation. The independent audio test supplies a real gesture and passed.
- Committed compact evidence: `extension-browser.json`, `locale-reload-browser.json`,
  `web-capabilities.json`, plus welcome and post-reload screenshots in `evidence/`.
  All other screenshots, generated exports and diagnostic assets remain outside Git.
- Local warnings: missing initial device/environment files (created/defaulted), no
  installed language pack, unsupported OS locale falling back to French, browser
  HTTP/HTTPS proxy methods unavailable. No GDScript parse errors or JavaScript
  page errors in the successful application probe. These warnings do not prove
  backend connectivity. Missing French pack is expected on a fresh install.

### Independent pack/audio/storage probe

`tests/web-capabilities/` is a separate minimal Godot diagnostic, **not a game port
or an authentication bypass**. The helper copies the real pinned French database,
one original audio clip, and required SQLite addon into a local throwaway project;
none of those upstream assets/binaries are committed here.

- Browser SQLite WASM opened the real French `language.db`, queried **118 GPs and
  60 lessons**, created a diagnostic table in its user-data COPY, inserted a value,
  and verified that value after page reload. It never modifies the upstream DB.
- A marker file in user:// and SQLite changes survived reload via Godot's IndexedDB
  filesystem, within the same browser context/origin. Browser-close/reopen, storage
  quotas/eviction, mobile browsers and private browsing remain untested.
- Used original French `avancer.mp3` (0.662 seconds), loaded through FileAccess bytes
  into AudioStreamMP3 like the game does. A real Playwright mouse click starts it.
  A WebAudio analyser measured nonzero samples and Godot emitted playback-finished.
  This verifies browser audio output, not human listening or pedagogical quality.
- **Capability suite exit 0**, all five recorded checks passed. Its result is in
  `evidence/web-capabilities.json`. This is real-asset dependency validation, not
  evidence that an original minigame/lesson was played.

### Failures diagnosed during this follow-up

- The language checkout initially contained Git LFS pointer files instead of media.
  Consequently the first MP3 probe failed to decode (suite failed, not counted as a
  pass). Installed Git LFS configuration **locally** and pulled only
  `fr_FR/language_sounds/avancer.mp3`; verified exact LFS size **7965 bytes** and
  SHA256 `7f8b31cbc6ec0ffb044a72fc78309674f842ddad9470d8ed71ae7f2559c1cacf`.
  The build helper repeats this check/fetch. Other language media may still be LFS
  pointers: explicitly hydrate the chosen pack before future gameplay tests.
- First custom diagnostic import reported a missing `exclude_filter` preset key and
  terminated with exit 134. Added the explicit empty key; import/export then exited
  0 and the browser capability suite passed. No integrity checks were bypassed.
- A diagnostic attempt to pass the welcome scene through generated HTML command-line
  arguments was rejected: stock release templates disable path overrides. Abandoned
  this approach; normal splash → welcome routing works without it. It is not needed
  by either committed build helper and no such HTML override is committed.
- A native headless welcome-scene comparison also reached `Welcome: Loaded` (exit 0),
  with resource/leak warnings on forced short shutdown; it is not used as browser
  evidence.

### Remaining boundary and next step

The stock game's normal flow requires a teacher account, language installation and
device/child setup before reaching lessons. No existing account or credentials were
provided; no production account was created. Its default backend is production.
Full pack download/unzip, backend CORS/authentication, original lesson audio/animation,
and lesson progress remain unverified. Current configuration inspection reported no
configured credential bindings; none were requested or fabricated.

The smallest recommended development step is a **development-only offline entry point**
using a fully hydrated original French pack and local test learner data, then play
one existing lesson in Chromium. Keep this separate from production authentication
and preserve the existing game scenes. Alternatively use an explicitly designated
test account/backend; never store credentials in this repo or chat. No German
content, deployment, scheduling, or broad engine port is needed for the next test.

The temporary local HTTP server is stopped at the end of the run; no background
development or deployment is scheduled. Build files and logs remain outside Git.

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

## Initial recommendation (completed by the follow-up above)

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
