# From phonics to meaning

Release 7 appends Levels 15–32; the first fourteen keep their IDs, content and saved
sessions. This is an expanded prototype, not a validated German reading course.
Kalulu inspired the staged progression; the German sequence and new illustrations
are original work. No microphone, speech recognition, accounts or uploads.

## Lesson sequence

| Level | Task | Content |
| --- | --- | --- |
| 15 | Read a familiar word and choose its picture | Hut, Ball, Bus, Fisch, Schaf, Gans, Oma, Mama |
| 16–17 | Hear/find, then independently read longer words | Sofa, Lama, Salami |
| 18–19 | Hear/find, then read syllables and unstressed endings | Tomate, Banane, Melone, Igel, Esel, Nudel, Hase, Hose, Salat |
| 20–21 | Hear/find, then read words with short vowels and doubled consonants | Bett, Kamm, Tasse, Kanne, Sonne, Affe |
| 22–23 | Hear/find, then read ei as one spelling pattern | Eis, Seil, Bein, Leim |
| 24–25 | Hear/find, then read au | Baum, Maus, Haus, Laub |
| 26–27 | Hear/find, then read long i written ie | Biene, Sieb, sieben |
| 28–29 | Hear/find, then read long vowels written twice | Boot, Beet, See, Tee |
| 30 | Hear and recognise sentence words | das, ist, ein, eine |
| 31 | Read and understand six short sentences | Das ist ein Hut. / Das ist eine Gans. / etc. |
| 32 | Read eight object/location contrasts | Ein Ball ist im Bus. / Ein Ball ist im Haus. / Ein Hut ist im Bus. / etc. |

Originally each new level had 18 completed questions; v8 now sizes new rounds to the target count and current knowledge, with 3–18 questions. Saved unfinished goals are preserved. See SPACED-PRACTICE.md. Listening levels introduce a whole-word
model, spelling and vocabulary before reading levels remove automatic spoken
answers. These are several focused practice rounds, not lengthy introductions
with forced single-choice taps. Later levels use the existing two-error teaching
step. Stage goals never finish early, and correct answers keep the existing quiet
chime, sparkle, flower and automatic transition.

## What is actually being assessed

- The old sound-to-print activities practise identifying a written response to
  speech. They remain useful but do not demonstrate independent word reading.
- New word-to-picture questions start with written text and a generic spoken
  instruction. The target is not read aloud automatically. All drawings are local
  vectors with no written labels or per-target emoji/font dependency.
- The optional speaker reads the complete human word or a complete pre-generated
  sentence. Optional syllable/pattern help highlights the original spelling without
  changing it. Either assistance is saved and disqualifies first-try mastery for
  that question. It still earns normal practice progress when completed.
- Word-meaning skills use a separate group from the old listening skills; sentence
  meaning is separate again. Two independent successes and the existing recent
  accuracy rule remain necessary for each target. No response-time scoring.
- Level 32 deliberately includes minimal contrasts. At two choices, alternating
  questions include the same subject with another location or the same location
  with another subject. At three/four choices both contrast types are included.
  The child cannot reliably solve every task by recognising just “Ball” or “Bus”.
- A completed question gives one practice point only. Guided teaching taps neither
  add points nor erase earlier errors. Saved assistance and choices survive reload,
  pause, profile backup and navigation. Old course completion continues at Level 15.

## German spelling and pronunciation limits

Only existing letter inventory is needed in these new written words. New spelling
patterns are introduced in preceding listening levels. The first longer words
introduce voiced initial s (/z/) through complete models; the next set expands
unstressed e/schwa and common weak syllables. Written syllable chunks are reading
support, not a promise that every printed letter has its isolated vowel sound.
For example, Igel is I-gel, Tomate is To-ma-te and Salami is Sa-la-mi. No spoken
syllables are stitched together.

Doubled consonants mark a preceding short vowel; they are not read twice. ie and
ei must not be confused; au is a diphthong; ee/oo mark long vowels here. Laub and
Sieb also expose final devoicing (final written b sounds /p/), with complete human
models before independent practice. They are vocabulary items, not a complete
explicit lesson on final devoicing; a future dedicated transfer lesson is needed.
Do not use voiced onset b recordings to fabricate their final sounds. The new
words are not added to the isolated-letter feedback or block-building tasks.

All sentence tokens have appeared earlier: the new sentence words, previously
practised nouns, and im from Level 3. Sentence text uses canonical German noun
capitalisation. “Ein … ist im …” requires reading the subject and its location,
but this is still a deliberately narrow form of comprehension. There are no
stories, open responses or general comprehension claims in this release.

Full human German word recordings are pinned with source hashes, author/license
credits and processing notes. Voices differ; vocabulary, syllable support,
illustration recognisability and pronunciation need native-speaker and educator
review. Technical tests cannot certify them or prove learning transfer.

## Reproduction

Ordinary app development requires Python 3 and Node 18+, with no runtime packages.
New audio regeneration additionally uses the already-installed free Piper, pinned
Thorsten High model and ffmpeg:

```sh
/workspace/kalulu-tools/tts/bin/python scripts/prepare_reading_audio.py
node --test tests/learning.test.mjs tests/content.test.mjs tests/reading.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
node tests/reading.cjs
```

The script reads docs/reading-audio-sources.json, verifies original file hashes and
voice-model/config hashes, and preserves existing active clips. Every newly
generated sentence uses the approved length_scale 1.5 and added 0.3 s sentence
pause. Words remain human recordings. Sources/models/cache stay outside Git;
small finished MP3s and provenance are committed. The expanded total-site cap is
3 MB; audio is loaded on demand. No external runtime TTS or paid API.

## Next review

Try Levels 15, 17, 19, 23, 31 and 32 through the parent preview checkbox. Check
whether pictures can be recognised before using mistakes as evidence of reading
difficulty. Listen to new words under Töne prüfen → Wörter and sentence help under
Sätze. Then test with a child before increasing complexity. Useful later steps
are explicit final-devoicing transfer, ch/sp/st and consonant-cluster work, actions
and role reversals, followed by connected two/three-sentence texts. These are not
implemented or silently treated as mastered by this release.
