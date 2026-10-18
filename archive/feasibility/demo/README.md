# French phone demo

This demo preserves Kalulu's original jellyfish minigame, animation, French
recordings, eight-round activity, and local learner scoring. It adds a separate
offline menu for French lessons 1 and 2. It does not log into or alter the official
service. Its browser data lives under the separate application name
`Kalulu French Phone Demo`.

Build from the project repository:

```bash
bash scripts/prepare_original.sh
bash scripts/build_phone_demo.sh
python3 -m http.server 8060 --bind 127.0.0.1 --directory /workspace/kalulu-phone-demo/web
# Separate terminal (requires system Chromium, Playwright, Python and Pillow):
timeout 360s node scripts/test_phone_demo.cjs
KALULU_DEMO_LESSON=2 timeout 360s node scripts/test_phone_demo.cjs
```

The preparation helper pins upstream source, Godot 4.7 and matching templates.
The phone build fetches and verifies just the original French recordings needed
for these activities via Git LFS. It retains original texture dimensions and atlas
coordinates, changing texture import compression to lossless for portability.
The original editor export-manager plugin is disabled in the disposable copy
because it overwrites the application's name and entry scene at export time.

The build uses the non-threaded SQLite extension and Godot dynamic-linking template.
It works without cross-origin isolation headers. The landing page explains the
roughly 84 MiB initial transfer, landscape orientation and sound. Progress is local
to the browser; no teacher or child account is needed. A same-origin Content Security
Policy blocks connections to the official backend. Production game scene logic is
preserved apart from routing a completed activity/back button to the demo menu.

The browser test supplies real clicks/taps. It finds nonempty letter plaques in
screenshots rather than exposing answers or invoking game methods. For lesson 2,
these inputs also include distractors: this is a functional completion test, not
a test of pedagogical decision-making. It requires the actual win log at 8/8 and
return to menu. It also observes nonzero WebAudio samples and checks landscape
touch, runtime errors and external requests. Mobile emulation is not real Safari
or Android hardware testing.

After both activities have been validated and source changes committed:

```bash
bash scripts/publish_phone_demo.sh
```

This pushes generated files to **gh-pages**, never main. It does not enable Pages.
If Pages is disabled, an owner must select **Settings → Pages → Deploy from a
branch → gh-pages → / (root)**. Do not change the repository's visibility merely
to make that option available. Current integration permissions cannot enable Pages;
do not request a token in chat. Verify the actual public URL and perform another
smoke test before presenting it as live.

Source and content: [Kalulu-Frontend](https://github.com/Excello-Recherche-Education/Kalulu-Frontend)
and [Kalulu-Languages](https://github.com/Excello-Recherche-Education/Kalulu-Languages),
Excello Recherche & Éducation, CC BY-SA 4.0. Demo adaptations use the same license.
The packaged landing page includes attribution, license notices and a source ZIP
of the build scripts and demo modifications. Bundled Godot/SQLite retain their
respective MIT and third-party notices. No endorsement is implied.
