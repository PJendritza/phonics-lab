# German prototype content

`content.json` is an original, small German adaptation dataset for **adult technical
review** of Kalulu. It is not an approved German curriculum, an assessment, a
recommendation for unsupervised child use, or evidence of educational efficacy.
It deliberately contains only six cumulative lessons and a very small vocabulary.
The original game's animations and activities can exercise these data without
implying that the original French pedagogy has been validated for German.

## What the six lessons introduce

| Lesson | New letters/readings | Example decoding material | Words first available |
| --- | --- | --- | --- |
| 1 | `a` /aː, a/ and `m` /m/ | a, ma, am | am |
| 2 | `i` /iː, ɪ, i/ | i, mi, im | im; Mimi (chosen name) |
| 3 | `o` /oː/ | o, mo | Oma, Omi |
| 4 | `l` /l/; unstressed `o` /o/ | la, li, lo, al, il | Lama, lila, Limo, Mal |
| 5 | `n` /n/ | na, ni, no, an, in, man | an, in, man; Lina, Nina (chosen names) |
| 6 | `u` /uː, ʊ, u/ | u, mu, lu, nu, um, un | um, nun, Uni, Alu |

There are **13 explicitly identified readings of seven letters**, 25 syllable
stimuli and 18 word/name stimuli. A later lesson may also use all earlier material.
Most CV items (`ma`, `mi`, etc.) are **practice syllables**, not vocabulary; JSON
marks them `pseudo: true`. Items such as `am` and `im` are real words and are marked
`pseudo: false`. The syllable `un` is a decoding exercise, not a claimed German word.
Names have `word_kind: "proper_name"`; ordinary vocabulary has `common_word`.

A grapheme becoming known is a necessary condition for a word to enter the game;
it is not sufficient evidence that a child can infer every vowel's pronunciation
from that spelling alone. This prototype explicitly models the selected reading
of each word instead of silently pretending German vowel length is predictable
from one isolated letter.

## Pronunciation decisions and traps

- **Vowel length and quality are explicit.** `a_long` is /aː/; `a_short` is /a/.
  `i_long` /iː/ differs from lax short `i_short` /ɪ/; `u_long` /uː/ differs from
  `u_short` /ʊ/. Unstressed tense /i o u/ have their own IDs. This is more complex
  than one sound per letter and needs specialist review before use with beginners.
- Standalone practice `ma` is deliberately /maː/, while the final syllable of
  `Oma` is /ma/. The lesson explanations say so. Neither CV structure nor this
  small word list is presented as a universal vowel-length rule.
- The selected words do not require /ə/, short /ɔ/, r, s/z alternation, digraphs,
  umlauts, diphthongs, silent letters, doubled-consonant spellings or sentence rules.
  Final `a` is /a/, not an invented schwa. These omitted rules must be designed
  explicitly when the vocabulary grows.
- Consonants mean **sounds** /m l n/, never German letter names /ɛm ɛl ɛn/ and
  never a consonant with an appended schwa. `isolated_target` marks one canonical
  sound per grapheme for any future isolated-letter activity. Contextual vowel
  variants must not become different answers with identical visible letters.
  The current syllable/word activities should use their exact GP decompositions.
- Capital letters in nouns/names are **case variants of known graphemes**, not new
  sounds. Display conventional German spelling (`Oma`, `Lama`, `Mal`); a validator
  may NFC-normalize and casefold when checking the reconstructed spelling.
- `Lama` is the animal, with /ˈlaːma/. `Limo` deliberately uses /ˈliːmo/; /ˈlɪmo/
  is also established and should not be called incorrect in human review.
- `Uni` deliberately uses dictionary /ˈʊni/, **not assumed /ˈuːni/**. `Alu` is
  /ˈaːlu/. These colloquial abbreviations may need adult meaning explanations;
  they were chosen to keep every written segment within the taught inventory.
- Mimi, Lina and Nina are fictional named examples with the displayed chosen
  pronunciations. Pronunciation of a person's actual name is their choice.
- `Mama` is **not active content**. References show a familiar /ˈmama/ and an
  archaic/formal /maˈmaː/. It was omitted rather than silently choosing a disputed
  length/stress or incorrectly declaring every initial `a` long.

A native German speaker must listen to every synthetic clip, especially isolated
/l/, short lax vowels, length contrasts and final unstressed vowels. A model's
acceptance of an IPA string does not establish acoustic or instructional accuracy.
Speech/audio validation and a successful game test are separate checks.

## JSON contract

The human-readable UTF-8 source is `content.json` (`schema_version: 1`, `locale:
"de_DE"`). Root keys include `gps`, `lessons`, limitations, and the references used.
The SQLite compiler should preserve the original upstream version-1 database
schema, generate a pack, and leave upstream French data unchanged.

Each `gps` entry has:

- stable ASCII `id`, written `grapheme`, IPA `phoneme` without enclosing slashes;
- numeric `type` matching Kalulu: `1` vowel, `2` consonant;
- `introduced_lesson` and a boolean `isolated_target`;
- an `audio` object with a stable ASCII `id`, `kind: "gp"`, display `text`, and
  explicit Unicode IPA `phonemes`; and a note explaining its use.

Each lesson has `number`, `title`, `new_gps`, a German `explanation`, and arrays
`syllables` and `words` listing **new items**, not repeated cumulative copies.
An item has stable `id`, displayed `text`, ordered `gps` IDs, selected `ipa`, and an
`audio` object (`id`, `kind`, `text`, `phonemes`). Syllables have `pseudo`; words
have `word_kind`, `syllable_breaks`, `syllable_gp_lengths` and notes. Syllable breaks
are spoken/reading chunks; they are not asserted to be every dictionary's official
end-of-line hyphenation rule.

The audio object's `phonemes` is intentionally explicit even for words: do not let
an unrelated text-to-speech default silently choose a different vowel variant.
These fields describe the intended target, not proof the resulting waveform
realizes it. Stable IDs avoid filenames with IPA or case-dependent differences;
the compiler handles Kalulu's own filename encoding separately.

Content invariants checked during authoring:

1. Each item uses only GP IDs introduced by its lesson.
2. Its latest constituent GP is introduced in that exact lesson, consistent with
   Kalulu's runtime cumulative pool queries.
3. Ordered graphemes reconstruct the displayed spelling after case normalization.
4. Ordered phonemes reconstruct its selected IPA after removing stress marks.
5. Word syllable chunks reconstruct the displayed word, and GP chunk lengths
   cover every GP exactly once.

The generated pack should additionally pass SQLite integrity/foreign-key checks
and the pinned upstream `Kalulu-Languages/.github/scripts/validate_packs.py` with
`--strict` where possible. Those checks assess structural correctness and do not
approve German phonology, sequencing or audio.

## Sources and review boundary

Duden entries were read on **2026-10-17** for German words, word meaning/stress and
available transcription: [Lama (animal)](https://www.duden.de/rechtschreibung/Lama_Tier),
[Oma](https://www.duden.de/rechtschreibung/Oma),
[Omi](https://www.duden.de/rechtschreibung/Omi),
[lila](https://www.duden.de/rechtschreibung/lila),
[Uni](https://www.duden.de/rechtschreibung/Uni_Universitaet), and
[Mama](https://www.duden.de/rechtschreibung/Mama).
Duden does not expose full IPA for every entry, so these are not represented as
verifying every phoneme decision.

Open dictionary IPA was cross-checked in German Wiktionary for
[Oma](https://de.wiktionary.org/wiki/Oma),
[Lama](https://de.wiktionary.org/wiki/Lama),
[lila](https://de.wiktionary.org/wiki/lila),
[Limo](https://de.wiktionary.org/wiki/Limo),
[Uni](https://de.wiktionary.org/wiki/Uni),
[Alu](https://de.wiktionary.org/wiki/Alu), and the excluded
[Mama](https://de.wiktionary.org/wiki/Mama). These are pronunciation references,
not evidence that this progression is an established German literacy curriculum.
The entries and their recorded source choices are linked in JSON; no recordings
or substantial dictionary text were copied.

Before expanding, request review by a German early-literacy educator and a native
speaker of the intended target variety. Review whether this much vowel variation
is suitable for six beginner lessons, whether practice syllables and real words
are clearly distinguished, the limited word meanings, and every synthetic clip.
The best next content change should follow that review rather than adding more
ambiguous spellings by guesswork.
