# Isolated feedback sounds

User request: in an ending task for Fisch, pressing f should play /f/ alone, never
Schaf or another example word. Words remain the original task cues. The PHONEMES
map in app/data.mjs routes every letter/block feedback to exactly one sound clip.
ll shares /l/. Whole-word reading choices still play the selected whole word.

## Source and license

Eleven extracts from Excello-Recherche-Education/Kalulu-Languages revision
bb0f71766c5e27fdb775e544ffe62ca98e6a615c, under its CC BY-SA 4.0 LICENSE.
Credit: Excello / Kalulu contributors; individual speakers are not identified in
that repository. These are dedicated phonics demonstrations, not narration assets.
Do not attribute them to a named speaker or certify native-German pronunciation.

French Look & Learn sources f-f, n-n, l-l, s-s, ch-cap.s, b-b, d-d, g-g, t-t and k-k
begin with one standalone phone, a long pause, then a separate context example.
Only the complete first utterance before that pause is used, within [0,.95] seconds.
Spectrograms and source waveforms were inspected to distinguish the two utterances;
no phoneme was cut out of a word. German shares these phone categories, while
language-specific release/voicing still needs listening review. Stops can have a
brief natural release, not a full German/French letter name.

h uses pt_BR/look_and_learn/sounds/r-h.mp3, explicitly mapped to phoneme h in that
pack's gp_list.csv. The breath interval [.14,.31] seconds is retained, excluding
the following neutral voiced release. It is a short isolated breath, not a word
fragment. This especially needs a phone-speaker listening check. Do not synthesize,
stretch or claim phonetic certification to hide an unsuitable recording.

Exact source URLs, SHA256, selected intervals, locale, processed hashes and changes
are in app/audio/manifest.json. Source files/LFS hashes were verified before use.
Originals and analysis figures stay under /workspace/phonics-phonemes-v6 outside Git.
German targets and all nine Thorsten High instructions remain unchanged.

## Reproduction and review

```sh
python3 scripts/prepare_phonemes.py
python3 scripts/audit_audio.py
```

The generator downloads only missing pinned originals; ffmpeg retains the selected
sound, trims quiet margins, normalizes to -20 LUFS/-3 dB, adds 4/8 ms leading/trailing
fades and 160 ms quiet padding, then encodes mono 22.05 kHz 64 kbps MP3. Fades avoid
hard noise boundaries, especially on h. No time stretching or model inference.

Use Töne prüfen → Einzellaute to review all eleven clips individually. They are
explicitly labeled as Kalulu extracts, with pending German listening review.
Technical decode/headroom/quiet-end tests and correct playback routing do not prove
native phonetic quality or educational efficacy.

Rejected direct alternatives included German letter-name recordings and Commons
IPA demonstrations explicitly containing [afa], [asa], [aha], etc. Playing those
whole clips would repeat the user's reported problem. No such clips are active.
