# Run the German prototype

This is an adult-testing prototype with six lessons and two original Kalulu games
per lesson. All lessons are unlocked for review. German audio is synthetic draft
material: listen and check the phonemes, vowel length, word stress and instructions
before using it with a child. It is not a validated German reading course.

## Use the prebuilt version (no Godot needed)

The separate [`kalulu-german-build`](https://github.com/PJendritza/tmp/tree/kalulu-german-build)
branch contains the ready-to-serve browser files. This is a Git artifact branch,
not a hosted website. The private repository requires your existing GitHub access.
Download that branch as a ZIP in GitHub, or clone it into a new directory:

```bash
git clone --single-branch --branch kalulu-german-build https://github.com/PJendritza/tmp.git kalulu-german-build
cd kalulu-german-build
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000/** in a browser on that computer. On Windows with the
Python launcher, use `py -m http.server 8000 --bind 127.0.0.1`. Opening `play.html`
directly as a file will not load the WebAssembly game correctly. Use an ordinary
HTTP server; special isolation headers, accounts and backend access are unnecessary.

For a phone on the same trusted Wi-Fi, you may instead start the server with
`--bind 0.0.0.0` and open `http://YOUR-COMPUTER-LAN-IP:8000/` on the phone. The
computer firewall must allow that local connection. This is a temporary local
test, not Internet hosting. Use landscape orientation and enable sound.

On the landing page choose **Deutsch-Demo starten**. Use the six numbered lesson
buttons, preview each new sound, then choose **Silben hören · Quallen** or
**Wörter lesen · Frosch**. Both activities also revise earlier content. The frog
plays a word; tap its letters in order on the lily pads. The pause menu uses the
original icons. Completed activities receive a check mark and remain stored in
this browser. Clearing site data removes this local progress.

**Laute und Wörter einzeln anhören** opens all 63 clips for adult listening review,
including IPA, stable clip IDs and instructions. Please record problematic clip
IDs and your device/browser when reporting feedback. Browser sound may require a
tap; real iOS/Android compatibility still needs hardware testing.

## Rebuild from source in the cloud workspace

Source development stays on `kalulu-german-prototype`; main is unchanged.
Requirements: Linux x86_64, Python3, Git/Git LFS, curl, unzip, ffmpeg and ripgrep.
Allow several GB for upstream assets/templates and imports. The setup script
skips bulk language-pack LFS audio; the German build uses its committed small WAVs.

```bash
# From the source checkout; inspect AGENTS.md, PROGRESS.md and Git history first.
bash scripts/prepare_original.sh
python3 -m unittest discover -s tests -p 'test_german*.py' -v
bash scripts/build_german_demo.sh
python3 -m http.server 8061 --bind 127.0.0.1 --directory /workspace/kalulu-german-demo/web
# In another terminal with the existing Playwright/Pillow/Tesseract tools:
OMP_THREAD_LIMIT=1 node scripts/test_german_demo.cjs
OMP_THREAD_LIMIT=1 node scripts/test_german_frog.cjs
KALULU_GERMAN_LESSON=6 OMP_THREAD_LIMIT=1 node scripts/test_german_frog.cjs
```

Outputs: `/workspace/kalulu-german-demo/web`; full logs/screenshots:
`/workspace/kalulu-german-demo/logs`. Build-time Godot audit exercises all twelve
lesson/game stimulus pools and decodes all required German MP3s. Export completion
is distinct from the real browser gameplay checks above. Piper/model installation
is only necessary to regenerate speech; see [AUDIO.md](AUDIO.md).

`KALULU_WORKSPACE` overrides the upstream/tool root; `KALULU_GERMAN_WORKSPACE`
overrides the disposable German build root. The prepared project uses pinned Godot
4.7, not the unrelated generic `godot` command. Custom roots require matching test
environment variables and an HTTP URL in `KALULU_GERMAN_URL`.

After tests pass, `bash scripts/push_german_build.sh` uploads the tested files to
the dedicated artifact branch without enabling hosting or changing main. It
refuses dirty source trees, stale/missing test results and unexpected artifact
checkout contents. `SHA256SUMS`, `BUILD_INFO.json`, `TEST_RESULTS.json` and the
corresponding source archive identify the stored build.
