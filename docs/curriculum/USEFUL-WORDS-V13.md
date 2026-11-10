# Useful German words for the next reading Etappen

Later update: v14 introduces es/er/sie and dann/danach in complete mini-stories.
The figures and remaining-word comparison below are the v13 research snapshot.
See [STORIES-V14.txt](STORIES-V14.txt).

Research executed 2026-11-07. Compared the 119 active v12 word forms (source
83dbb50ecb1274e7593f622badcc1641528d2a7b) against official vocabulary references.
Selected six concrete everyday nouns, two highly frequent function words and
three useful verbs. The active inventory now has 131 distinct word forms, not
131 proved acquired words. Kinder is a form of Kind, not a twelfth new lemma.

## Sources actually downloaded and read

1. [LISUM: 100 häufig gebrauchte Wörter, 2024](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/faecher/sprachen/deutsch/schreiben_rechtschreiben/100_haeufig_gebrauchte_Woerter.pdf).
   In particular **und** and **nicht** are absent in v12 and present in this list.
   The accompanying [2024 planning guide](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/faecher/sprachen/deutsch/schreiben_rechtschreiben/Grundwortschatz_Planungshilfe_Rechtschreiben_2024-09-20.pdf),
   p. 10, separates 100 frequent words from approximately 300 spelling/model words
   for grades 1/2 and another 300 for grades 3/4. Therefore membership in the
   whole Grundwortschatz does NOT mean "the most frequent words".
2. [LIBRA: Grundwortschatz nach Jahrgangsstufen, 2026](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/faecher/sprachen/deutsch/schreiben_rechtschreiben/GWS_sortiertnachJG_2026-02-11_1131.pdf).
   Brot and Frau appear on p. 2, Kind/Mann/Milch/lesen on p. 3, Wasser/trinken on
   p. 4 in the grades 1/2 section. essen, with isst, appears in the later grades
   3/4 section: its utility does not make its spelling an early regular pattern.
3. [QUA-LiS NRW: Wortliste Grundwortschatz](https://www.qua-lis.nrw.de/system/files/media/document/file/wortliste-grundwortschatz-nrw.pdf).
   All six selected noun lemmas and essen/lesen/trinken are present. This is also
   a spelling-oriented primary-school reference, not a ranked frequency corpus.
4. [Goethe-Institut: Start Deutsch 1 Wortliste](https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf).
   Used only as a supplementary everyday-language cross-check. Its introduction
   explicitly describes adult A1 examination vocabulary and warns that the list
   itself is less suitable as practice material. It is not our child curriculum.

Exact URLs, original-file hashes, byte counts and selection metadata:
[useful-words-v13.json](useful-words-v13.json). PDFs and extracted text remain
outside Git. No official worksheets, example sentences or illustrations copied
into the app; the exercise text and pictures are newly authored/generated.

## Implemented selection

| New word/lemma | Why prioritise it | Actual use |
| --- | --- | --- |
| Kind / Kinder | people, number and daily-life meaning | Ein Kind ist im Bus. / Zwei Kinder |
| Frau, Mann | everyday people; useful subject contrast | Eine Frau ist am Haus. / Ein Mann ist am Haus. |
| Brot | everyday food, concrete meaning | Das Kind isst ein Brot. / Oma hat ein Brot. |
| Wasser, Milch | common drinks with a visible semantic contrast | Das Kind trinkt Wasser. / Das Kind trinkt Milch. |
| und | explicitly in the 100 frequent words; combine both meanings | Das Brot ist oben und das Wasser ist unten. |
| nicht | explicitly in the 100 frequent words; negation matters | Das Buch ist nicht zu. / Das Kind schläft nicht. |
| lesen → liest | useful reading action and verb/object distinction | Das Kind liest ein Buch. versus Das Kind hat ein Buch. |
| essen → isst, trinken → trinkt | daily activities, not exotic nouns | eating/drinking contrasted with simply having the same object |

Water/milk are used as mass nouns: **hat Wasser**, **mit Milch**, not forced into
"ein Milch" or "mit einem Wasser". Singular count nouns retain articles and mit
takes dative. Plurals use the appropriate numeral. New vocabulary belongs to
Level 34 Etappe 4 and Level 35 Etappe 4. The new banks contain 25 and 26 tasks;
the existing banks/IDs remain. Each task has reviewed meaning contrasts, with
optional full-utterance help. 82 new complete optional sentence/phrase clips use
the approved local Thorsten High settings; no synthetic isolated phones added.

## Selection limits and the next candidates

Frequency, common spelling patterns, a child's likely familiarity and clear
picture contrasts all matter. These are useful words, not a claimed optimal
or clinically validated reading order. Kind (final devoicing), Frau (fr/au), Milch
(ch), Wasser (ss), liest (ie) and isst (ss/irregular verb form) require support.
Their appearance in a successfully matched sentence never certifies independent
word reading. Standalone word recognition and later retrieval have separate
evidence counters; no speech recognition is used.

Additional missing words in the frequent-word list include **auch, noch, es,
ich, wir, er, sie, was, wo, oder, aber, ohne, kann, für**. Keep them as prioritised
candidates, not silently counted as implemented. Pronouns need a clear referent;
auch/noch need context; oder/aber need meaningful alternatives. A next small
extension could contrast **mit/ohne** and introduce **ich/wir** with explicit
speaker context, rather than add more interchangeable animal nouns.

Reproduce source membership checks (verified HTTPS, pinned source hashes):

```sh
python3 scripts/research_vocabulary.py --cache /workspace/phonics-research
```

The script verifies membership, not corpus ranks, and is never needed to run or
build the static website. Early guessed URLs returned 404 and search endpoints
were unhelpful/challenged; official pages above provided the actual downloadable
references. No conclusion relies on those failed search results.
