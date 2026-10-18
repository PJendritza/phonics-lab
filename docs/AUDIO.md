# Audio: natural German target recordings, spoken sentence guidance

20 complete human German recordings supply all sound/letter, syllable, final-sound
and word tasks. 15 ordinary full-sentence instructions use Piper. No synthetic
isolated vowel/consonant was added. Three old synthetic a/i/m clips remain only in
collapsed adult A/B comparisons. The user confirmed the v2 audio was substantially
better on their phone; the 12 added recordings still need specific listening review.

app/audio/manifest.json records every original source, speaker, original/output SHA256,
license version, processing and pending review. docs/audio-sources.json preserves
Commons metadata. The About page and Tonstudio display individual attribution.

| ID | Speaker | License | Original source |
| --- | --- | --- | --- |
| a | Jeuwre | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-a.ogg) |
| i | Jeuwre | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-i.ogg) |
| o | T.Voekler | CC BY-SA 3.0 | [Source](https://commons.wikimedia.org/wiki/File:De-O.ogg) |
| m | Jeuwre | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-hm.ogg) |
| am | T.Voekler | CC BY-SA 3.0 | [Source](https://commons.wikimedia.org/wiki/File:De-am.ogg) |
| im | joni | CC BY-SA 3.0 | [Source](https://commons.wikimedia.org/wiki/File:De-im.ogg) |
| mi | Jeuwre | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-mi.ogg) |
| oma | Dinock90 | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-Oma.ogg) |
| e | Jeuwre | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-e.ogg) |
| u | Jeuwre | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-u.ogg) |
| ma | Jeuwre | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-Ma.ogg) |
| um | Kampy | CC BY-SA 3.0 | [Source](https://commons.wikimedia.org/wiki/File:De-um.ogg) |
| an | joni | CC BY-SA 3.0 | [Source](https://commons.wikimedia.org/wiki/File:De-an.ogg) |
| in | joni | CC BY-SA 3.0 | [Source](https://commons.wikimedia.org/wiki/File:De-in.ogg) |
| man | Dinock90 | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-man.ogg) |
| nun | Dinock90 | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-nun.ogg) |
| mal | Dinock90 | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-mal.ogg) |
| mama | Bleibein | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-Mama.ogg) |
| mami | Dinock90 | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-Mami.ogg) |
| omi | Jeuwre | CC BY-SA 4.0 | [Source](https://commons.wikimedia.org/wiki/File:De-Omi.ogg) |

Long vowels a/i/o/e/u retain their natural recordings. The m is the complete German
hum from hm, not a clip cut out of a word. New n/l are introduced by listening for
the **last sound in complete natural words**, never by playing German letter names
“en” or “el” as phonemes. mal is /maːl/, nun /nuːn/; am /am/, im /ɪm/, um /ʊm/, an /an/
and in /ɪn/ have short vowels. The short vowel is heard in its word context, not
fabricated as a clipped isolated recording. ma uses the complete German word Ma
as a practice syllable; mi uses the complete recorded German abbreviation /miː/.
Both are labelled teaching syllables rather than ordinary child vocabulary.

Oma/Omi/Mama/Mami play whole words; stress and unstressed vowel quality can vary
between speakers. Where metadata did not establish the precise transcription,
new word entries omit IPA rather than certify a guessed recording-specific form.
Different voices/recording conditions remain audible; consistent purpose-recording
with one native speaker is the next production-quality improvement if needed.

## Processing and regeneration

Quiet margins shortened with 120/160 ms retained, -20 LUFS / -3 dB true-peak target,
8 ms leading fade, 120 ms trailing pause; mono 44.1 kHz MP3, 80 kbps. No phoneme
extraction, time stretching, pitch changes or stitched vowel-word synthesis. Original
file checksums pin the downloaded licensed sources. Ordinary builds use committed
MP3s and need neither a voice model nor an engine.

Optional regeneration needs ffmpeg and an external Python environment with
piper-tts==1.4.2 plus the pinned model and its .onnx.json config:

```sh
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py
# To preserve the processed human clips and regenerate only sentence guidance:
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py --instructions-only
```

Pass --cache and --model elsewhere. The manifest itself inventories all human
recordings; adding clips does not require a second drifting hard-coded generator
list. Missing originals are downloaded from their pinned URLs with TLS and SHA256
checks. Sentence text lives in scripts/instructions.json. Comparison MP3s are already
committed and are left untouched. Regeneration updates hashes; audit differences and
repeat playback tests. Different ffmpeg/Piper versions may change output bytes.

Piper voice: de_DE-thorsten-medium, revision c10ece1aade47bb51c153c893d14e5bf8e5b7117;
model SHA256 7e64762d8e5118bb578f2eea6207e1a35a8e0c30595010b666f983fc87bb7819.
Model metadata MIT; Thorsten dataset CC0; model mentions Lessac fine-tuning. Piper’s
GPL engine is a production tool outside the browser. Authored instruction collection:
project CC BY-SA 4.0. Exact model source links are in each instruction’s manifest entry.

## Reviewing and testing

Tonstudio filters letters, syllables, words and instructions. Ratings/notes remain
local and export as JSON with clip IDs/hashes; they never silently publish approval.
Use normal phone speakers/headphones to check starts/ends, vowel length, stress and
pure phoneme/context matches. An educator should review final-sound identification,
capital letters, short-vowel teaching and overall progression.

scripts/audit_audio.py decodes all current clips and checks nonzero PCM, peak headroom
and quiet endings. Browser tests check actual audio playback, MP3 decode, retry and
cancellation. None of those measurements proves that German pronunciation or a
learning method is correct. Native listening, child observation and educator review
remain separate evidence.
