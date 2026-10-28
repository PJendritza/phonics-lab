# v10 artwork addition

Atlas E adds empty furniture and eight paired animal awake/sleep images. Five
sheets now total 1,232,726 WebP bytes; 54 sprites. Source prompts/hashes in
illustration-sources.json. The chair uses a restricted display rectangle to exclude
a neighboring bed leg. Bed art is not active because under-bed clearance was not
clear enough. Number words now show a numeral; quantity+noun scenes use exact
object counts. On-table sprites are aligned with the surface, not floating above.
The media budget is now 10 MB; app images/audio load on demand. Historical v9
artwork description below is superseded for these changes.

---

# Illustration assets

The user requested simple attractive AI-generated pictures to replace the earlier
hand-authored SVG icons. Four image-generation outputs provide consistent
picture-book artwork. No third-party stock images or image APIs are called by the
app. Generation used the image tool available in the user's ChatGPT environment;
no paid external API/account was installed or assumed.

docs/illustration-sources.json records each original filename, SHA256, exact prompt,
grid/cell mapping and any explicit display rectangle. Original PNGs remain in
/workspace/generated_images; the small format-converted WebP sheets and their
manifest are committed in app/images. app/image-data.mjs contains the corresponding
asset URLs and sprite display rectangles. The generated images are identified as
AI assets, not misrepresented as hand-drawn artwork or a third-party photo source.
They are included with the project's asset collection/license; existing source
audio and font licenses remain separately attributed.

Atlas A covers the first sixteen vocabulary objects, B another sixteen, and C
eight familiar words. Atlas D contains large empty front-view bus/house interiors
for meaning exercises. Source C's two earlier scene drafts and blank cells are not
used as answer objects. No raster painting, guessed backgrounds or character edits
were performed by a script: image_gen produced the artwork. The preparation script
only converts format and records display rectangles.

SVG is used as a layout container, not as the new drawing style. Each sprite's
viewport has exactly its source aspect ratio, preventing adjacent atlas cells from
showing through letterboxed margins. The same subject at the same scale appears
inside the empty cabin/room or beside it. All answer contexts reuse those exact
backgrounds; they have no written labels. “sieben” uses exactly seven instances of
the generated ball, rather than trusting a model to render a correct object count.

```sh
python3 scripts/prepare_illustrations.py
```

Requires ffmpeg and the hash-matching original PNG cache; ordinary builds need
only the committed WebPs. Lossy WebP quality 82/compression 6 yields four sheets
totalling 879,262 bytes. Generation itself is not deterministically reproducible
from a prompt; source/output hashes distinguish an exact cached conversion from
a new artwork generation. New art must be inspected before replacing hashes.

The full static-site cap increases from 3 MB to 4 MB to accommodate the requested
art and additional optional speech. Media remain on demand. Sprite/scene contact
sheets and actual phone-sized screenshots were inspected outside Git. Tests check
image integrity/decoding, source rectangles and mobile layout; recognisability
and educational usefulness still need parent/educator/child feedback.
