# v11 child guidance, reading extensions and audio policy

Latest user request authorises this implementation and existing-site publication.
The original 33 IDs/order remain. Level 34 (reading_animals) adds 80 targets with
Katze/Hund/Ente/Frosch; Level 35 (reading_everyday) adds 76 with Buch/Apfel/Schuh/
Puppe and open/closed Buch/Tasche. Becher and familiar Mama/Oma appear in possession
scenes. All six families from Level 33 remain: places, quantities, sizes, actions/
states, possession and two statements. Every pair contrasts readable facts using
consistent figures/objects and exact counts. No tasks use nonsensical sleeping
inanimate objects; open/closed states replace animal poses in Level 35.

Same confidence-based short/full forms, spaced errors, representative mastery and
forward progress as v10. New stages have independent target IDs, so no fabricated
mastery transfers. Completed v10 courses enter Level 34; pending/paused v10 tasks,
goals, scores and help state remain exact. Local storage key/schema remain v3.
As before, contextual new spellings/plurals need parent/native/educator review;
this is not a validated complete phonics curriculum.

## Directions and help

All 23 directions are short German actions, e.g. Tippe auf das Wort, das du hörst.
or Welchen Laut hörst du am Ende? They no longer explain vowels, consonants or
spelling theory. The small 12px line is primarily a parent hint, ending with a
44px touchable info control. Reading targets retain large type. Directions never
play automatically on entry. Info in a picture task plays only the generic guide,
not the answer, and does not mark the question assisted. Optional info failure
does not block independent reading. Listening tasks still play their necessary
German task cue; explicit info then repeats the guide and that task cue.

The reading replay button is absent initially and after one wrong attempt. After
two errors it appears; even the one-choice teaching view remains silent until the
child requests the model. readingAudioAvailable and useReadingHelp(withAudio=true)
enforce the same rule in the model. Unlock persists for that question across reload,
navigation and guided-tap return (tries remain >=2); the next question relocks.
Requested speech marks assistance and cannot grant independent first-try mastery.
Visual syllable help is still available for word reading and remains assisted.
Fixed-height help space prevents buttons/images shifting when replay appears.
No countdowns, spoken success praise or moving targets were added.

## Rejected sounds and native replacement limit

All eleven Kalulu phoneme clips were removed from app/audio and the active
manifest; prepare_phonemes.py was removed so future regeneration cannot silently
restore them. Ten clips came from the French pack and h from Portuguese. Their
full provenance remains in docs/archive/rejected-kalulu-phonemes.json and Git
history. Kalulu inspiration/credit remains attributed.

A Commons metadata search for a suitable German isolated f returned HTTP 403.
No appropriate licensed native German replacement was confirmed in this run.
Do not label an international/French recording German or synthesize letter names
as phonemes. Unsupported consonant mistakes are silent with visual retry; after
two errors listening/build tasks model the original complete German task word.
This avoids another unrelated selected word and keeps the reported Fisch/f case
usable. The six existing German letter/hum recordings and all 76 human models
are byte-identical. The missing isolated consonant replacement remains explicit;
the app does not claim this audio gap is resolved with new German recordings.

## Assets and reproduction

Atlas F supplies new paired animals, objects and open/closed states. Raw PNG is
external; exact prompt/source/output hashes and rectangles are committed. The
partial regeneration option --only f verifies existing committed atlases before
retaining them, so a fresh environment need not possess all historical PNG caches.
Six WebP sheets total 1,630,408 bytes; 70 physical sprites plus layout aliases.
560 active clips: 76 human + 23 guides + 460 sentence/phrase models + one chime.
Piper remains free/local, pinned Thorsten High model/config with length_scale1.5
and extra 0.3-second sentence pause. No live TTS, account/API fee or cloud data.
Static budget is 14 MB; actual packaged site is about 10.12 MB, media on demand.

```sh
python3 scripts/prepare_guides.py
python3 scripts/prepare_illustrations.py --only f
/workspace/kalulu-tools/tts/bin/python scripts/prepare_audio.py --instructions-only
/workspace/kalulu-tools/tts/bin/python scripts/prepare_reading_audio.py --utterances-only
node --test tests/*.test.mjs
python3 scripts/audit_audio.py
python3 scripts/build.py
node tests/child-guidance.cjs
```

The utterances-only path checks every retained human clip hash without redownloading
its original source. Ordinary builds need neither Piper nor PNG/model caches.
Exact executed checks, source/deployment commits and limits: PROGRESS.md.
