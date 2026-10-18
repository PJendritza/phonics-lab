# Repository rename completed

User renamed Kalulu-DE to **phonics-lab**. Canonical repository:
https://github.com/PJendritza/phonics-lab . Product name: **Phonics Lab**.
History and source/deployment branches are retained; no second project was created.

Verified October 18: new HTTPS Git access succeeds; origin now points to
https://github.com/PJendritza/phonics-lab.git . New site responds HTTP 200:
https://patrickjendritza.com/phonics-lab/ . The old /Kalulu-DE/ website returns 404;
GitHub repository redirects do not imply project Pages redirects. Use the new URL.
Source links, README, live-verifier default and packaged-test prefix are updated.
No Pages settings, repository visibility or domain settings were changed.

Local checkout deliberately stays /workspace/Kalulu-DE. The cloud environment was
originally created for that path; a future saved environment snapshot may still
show its historical repository label. Do not create a duplicate checkout to fix it.
Runtime build/test commands use the existing directory and updated Git origin.

Legacy kalulu-de:* keys and backup compatibility remain. localStorage belongs to
the HTTPS origin rather than project path, so existing profiles on the same domain
remain available. Other domains/browsers require backup/import. Historical archive
names and upstream/audio credits retain factual names.

Suggested GitHub About text (separate from the website description):
Experimental browser-based phonics and early-reading activities, starting with German. Inspired by Kalulu.
