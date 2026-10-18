# Rename the repository to phonics-lab

Product display name: **Phonics Lab**. Recommended GitHub slug: **phonics-lab**.
The existing repository can be renamed; creating a second repository is unnecessary.
History, branches, issues and releases remain with the repository.

1. Open https://github.com/PJendritza/Kalulu-DE/settings .
2. Under General, change Repository name to phonics-lab and select Rename.
3. New repository URL: https://github.com/PJendritza/phonics-lab .

Suggested GitHub About description:

> Experimental browser-based phonics and early-reading activities, starting with German. Inspired by Kalulu.

The public website's title/description and README are branded Phonics Lab. The
repository's GitHub About field is separate; edit it using the gear beside About
on the repository's Code page if needed.

## Follow-up after the rename actually happens

GitHub redirects old repository links and Git operations. Project Pages websites
have different behavior: the project path normally changes from /Kalulu-DE/ to
/phonics-lab/, and the old website URL must not be assumed to redirect.
With the existing account domain the expected new URL is
https://patrickjendritza.com/phonics-lab/ . Verify it after the rename.

- Verify new HTTPS Git access; update the existing checkout's origin using
  git remote set-url origin https://github.com/PJendritza/phonics-lab.git .
- Do not create a fresh project or reset user work. The checkout directory can
  remain /workspace/Kalulu-DE until a deliberate environment-path migration.
- The publisher now derives its destination from origin. Update public/source
  links, live verifier's default base and environment repository configuration
  after the new identity is real, not before.
- Retain gh-pages as the generated deployment branch. Inspect Pages and republish
  only if needed, then run the full live hash verification against the new base.
- Keep legacy kalulu-de:* storage keys and backup import compatibility. With the
  same patrickjendritza.com origin, changing only the project path does not move
  localStorage to another origin, so existing saved profiles remain accessible.
- Original project/audio attribution and historical archive names remain factual.

The branding task does not rename the GitHub repository or alter Pages settings.
