# Audio: human recordings first

The previous Piper-generated isolated phonemes/syllables were rejected by the user:
cut-off, unnatural short sounds. The replacement does **not** regenerate those with
the same model or crop vowels out of words. It uses small licensed human German
Wikimedia recordings and Piper only for full sentence instructions.

app/audio/manifest.json is the per-clip authority: source URL, original file SHA256,
processed file SHA256, speaker, license version, IPA target, processing and pending
review. docs/audio-sources.json preserves the original Commons metadata. The in-app
About page and Töne prüfen display attribution. There is no automatic hearing approval.

| Clip | Source file | Speaker | License | Teaching role |
| --- | --- | --- | --- | --- |
| a | De-a.ogg | Jeuwre | CC BY-SA 4.0 | long /aː/ |
| i | De-i.ogg | Jeuwre | CC BY-SA 4.0 | long /iː/ |
| o | De-O.ogg | T.Voekler | CC BY-SA 3.0 | long /oː/ |
| m | De-hm.ogg | Jeuwre | CC BY-SA 4.0 | natural sustained nasal hum; specifically check for extra h/e |
| am | De-am.ogg | T.Voekler | CC BY-SA 3.0 | short /a/ in the complete word /am/ |
| im | De-im.ogg | joni | CC BY-SA 3.0 | short /ɪ/ in the complete word /ɪm/ |
| mi | De-mi.ogg | Jeuwre | CC BY-SA 4.0 | whole /miː/ recording, used as a practice syllable |
| Oma | De-Oma.ogg | Dinock90 | CC BY-SA 4.0 | whole /ˈoːma/ word |

Source pages: https://commons.wikimedia.org/wiki/File: followed by the filename.
The source *mi* records a German abbreviation, with the desired /miː/ pronunciation;
the exercise calls it an Übungssilbe, not a normal German vocabulary word.
Recordings have different speakers/recording conditions; uniform voice quality is
not guaranteed. Dedicated recordings by one qualified native speaker are the likely
next quality improvement. Do not confuse a letter name with a consonant phoneme.

## Processing

ffmpeg shortens only quiet leading/trailing margins, retaining 120/160 ms, applies
-20 LUFS loudness normalization with -3 dB true-peak target, an 8 ms leading fade and
120 ms trailing pad; output mono 44.1 kHz, 80 kbps MP3 for iOS/Android browser support.
No phoneme extraction, pitch shift, time stretch or concatenation. The entire voiced
utterance is retained, including the whole hum. File metadata/energy analysis is
useful for detecting accidental cuts or clipping, not proof of correct articulation.

Only full instructions use Piper 1.4.2 with de_DE-thorsten-medium. Voice revision:
c10ece1aade47bb51c153c893d14e5bf8e5b7117, model SHA256:
7e64762d8e5118bb578f2eea6207e1a35a8e0c30595010b666f983fc87bb7819.
Model metadata: MIT; Thorsten dataset: CC0; model card mentions fine-tuning from
Lessac. Piper's GPL engine is an external production tool, absent from the website.
The authored instruction clip collection is offered under project CC BY-SA 4.0.
Full voice/model source links are recorded in each instruction entry in the manifest.

## Regeneration (optional; ordinary builds use committed MP3s)

Needs Python with piper-tts==1.4.2, ffmpeg, the pinned model plus its .onnx.json config.
Install these outside this source repository. In this environment:

```sh
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py
```

Elsewhere pass --cache /path/to/cache --model /path/to/de_DE-thorsten-medium.onnx.
The script downloads missing original human recordings from the pinned manifest URLs,
checks original hashes, validates the voice model hash and regenerates current clips.
It reuses the committed previous-*.mp3 comparison assets when the external historical
WAV cache is absent; --legacy-audio supplies that cache if required. Network TLS
verification stays enabled. Metadata and output hashes are updated; review diffs and
repeat tests before committing a regenerated collection. Synthesis/ffmpeg versions
can change output bytes; this is not a bit-identical cross-platform TTS guarantee.

## Listening workflow

Töne prüfen plays every current clip, shows its human/synthetic label and IPA/source,
and keeps previous synthetic a/i/m under a collapsed comparison. Mark good / review /
replace, add a note and export JSON. Ratings live only in the browser. A good rating
in one local browser does not automatically alter the repository's pending status.

Before child use: listen with normal phone speakers and headphones, especially
endings and vowel lengths. An adult German speaker and reading specialist should
review the phoneme mapping, prompts and complete lesson progression. No such human
or real-phone approval has yet been recorded.
