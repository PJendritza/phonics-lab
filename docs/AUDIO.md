# German prototype audio

The prototype uses **synthetic German speech**, generated offline with Piper's
`de_DE-thorsten-medium` voice. The clips are temporary development material.
File validation and successful game playback do **not** establish that a sound is
phonetically or pedagogically correct. No native-speaker listening approval has
been recorded. Replace or approve the clips before use for children's instruction.

## Reproduce

Run from the project repository with Python 3.12 and system `ffprobe` (FFmpeg).
The current environment was tested using Python 3.12.14 and FFmpeg 7.1.5.
Keep the virtual environment and 60 MiB voice model outside Git:

```bash
python3 -m venv /workspace/kalulu-tools/tts
/workspace/kalulu-tools/tts/bin/python -m pip install -r app/content/de_DE/audio/requirements-generation.txt
/workspace/kalulu-tools/tts/bin/python scripts/generate_german_audio.py \
  --manifest app/content/de_DE/audio/manifest.json \
  --output-dir app/content/de_DE/audio \
  --cache-dir /workspace/kalulu-tools/tts-models
```

This downloads the model only if absent, uses verified HTTPS through the inherited
proxy, and verifies both downloaded files against pinned SHA256 values before
loading them. Existing mismatching assets are rejected. No account, paid API,
network voice service, or credentials are used. Once the model is cached,
generation works offline. Only the small generated WAV files and their provenance
are committed; the engine and model are not shipped in the browser build.

The manifest format is:

```json
{
  "version": 1,
  "clips": [
    {"id": "gp_m", "text": "m", "kind": "phoneme", "phonemes": "m"},
    {"id": "word_oma", "text": "Oma", "kind": "word", "phonemes": "ˈoːma"},
    {"id": "minigame_lose", "text": "Versuche es noch einmal.", "kind": "instruction"}
  ]
}
```

IDs must contain only lowercase ASCII letters, digits and underscores. `phonemes`
is a Unicode sequence in the model's phoneme inventory (IPA-like eSpeak/Piper
symbols), without brackets, slashes or dots denoting syllable boundaries.
Unsupported symbols fail validation. If supplied, it bypasses the text phonemizer.
`kind` values `phoneme`, `grapheme` and `gp` require this explicit sequence. They
must not synthesize a grapheme's written letter name, e.g. `em` for /m/.

Instruction and ordinary word text can use the German text phonemizer; the actual
phoneme sequence used is stored in `metadata.json`. Curriculum phoneme choices
remain distinct from what the synthetic waveform actually realizes.

Generation uses CPU ONNX inference with zero model noise for repeatability,
length scale 3.6 for isolated long vowels, 1.8 for other isolated phonemes and 1.15
for contextual words/syllables/instructions, trimming at -44 dB
relative to each clip's peak with 80 ms retained padding. Peaks are normalized to
-3 dBFS, encoded as 22,050 Hz, mono, signed 16-bit WAV. This is simple peak
normalization, not a claim of equal perceived loudness. Zero noise trades some
voice naturalness for reproducibility; phoneme length is not a pronunciation
guarantee. At a uniform rate, this model produced isolated /uː/ shorter than /ʊ/;
the explicit long-vowel rate adjustment makes the intended duration distinction
clearer. Review vowels and sustained consonants in particular.

Cache keys cover the utterance, phoneme sequence, model/config checksums, Piper
version and generator source checksum. A cache hit also verifies the WAV checksum.
Regeneration after recipe edits is intentional. `--force` bypasses the cache.

## Validation and review

```bash
/workspace/kalulu-tools/tts/bin/python scripts/generate_german_audio.py \
  --manifest app/content/de_DE/audio/manifest.json --output-dir app/content/de_DE/audio --validate-only
```

Every clip is checked with `ffprobe` for PCM encoding, 22,050 Hz, mono and duration;
sample RMS must be nonzero and the peak must stay below clipping. Metadata stores
duration, peak/RMS level, SHA256, input text and actual synthesized phonemes. These
checks detect broken assets, not wrong pronunciations. A four-clip smoke run also
verified that forced regeneration produced byte-identical outputs on this host;
other platforms/runtime versions are not claimed bit-identical.

A native German speaker familiar with initial reading instruction must listen
before classroom/child use. In particular:

- Confirm /m/, /l/, /n/ are sustained sounds without letter names or a trailing
  schwa; listen for model artifacts and unnatural onsets.
- Confirm long and short /a/, /i/, /o/, /u/ contrasts and their word contexts.
- Confirm word stress, syllable blending, instructions and child comprehension.
- Approve or replace clips individually; retain the speaker's recording consent
  and license if replacing synthetic audio.

Every generated clip currently has `listening_review: pending_native_speaker` and
`phonetic_correctness_verified: false`. No automated acoustic check overrides that.

## Sources, licenses and provenance

- Engine: [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl), installed
  package **piper-tts 1.4.2**, whose package metadata says **GPL-3.0-or-later**.
  The engine and its dependencies remain outside the repository/browser package.
- Voice repository: [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices),
  pinned revision `c10ece1aade47bb51c153c893d14e5bf8e5b7117`. Its repository metadata
  declares **MIT**. Individual voice cards describe their own dataset provenance;
  do not generalize a dataset license to every model component.
- [Thorsten medium model card](https://huggingface.co/rhasspy/piper-voices/blob/c10ece1aade47bb51c153c893d14e5bf8e5b7117/de/de_DE/thorsten/medium/MODEL_CARD)
  identifies German/Germany, 22,050 Hz, one speaker, the
  [Thorsten-Voice dataset](https://github.com/thorstenMueller/Thorsten-Voice) under
  **CC0**, and fine-tuning from the U.S. English lessac medium voice. Attribution:
  Thorsten Müller, Thorsten-Voice; Piper contributors / Open Home Foundation.
- Model `.onnx` SHA256:
  `7e64762d8e5118bb578f2eea6207e1a35a8e0c30595010b666f983fc87bb7819`,
  corroborated by Hugging Face Git LFS metadata over verified HTTPS.
- Model `.onnx.json` SHA256:
  `974adee790533adb273a1ac88f49027d2a1b8f0f2cf4905954a4791e79264e85`,
  measured from the pinned-revision configuration over verified HTTPS.
- Newly authored German text, synthetic clip collection and integration are
  distributed for this project under **CC BY-SA 4.0**, consistent with the Kalulu
  adaptation. This does not replace upstream dataset, model or engine licenses.
  Attribution: German Kalulu prototype contributors; generated with Thorsten-Voice
  and Piper. Kalulu original: Excello Recherche & Education, CC BY-SA 4.0.

Dependency pins in `audio/requirements-generation.txt` record the installed Linux
Python environment. PyPI distribution integrity checks and standard TLS verification
remain enabled. No model checksum or TLS check was bypassed during generation.
