"""Content/pack contract tests, including the real upstream SQLite schema.

Run from the repository root:
    python3 -m unittest discover -s tests -p 'test_german_pack.py' -v

The integration fixture uses ffmpeg and the existing draft WAV files, writes only
into a temporary directory, and accepts KALULU_LANGUAGE_SCHEMA for another pinned
Kalulu-Languages checkout. These checks do not certify educational/audio quality.
"""
from copy import deepcopy
import importlib.util
import json
import os
import re
from pathlib import Path
import shutil
import sqlite3
import tempfile
import unittest

REPO = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('build_german_pack', REPO / 'scripts/build_german_pack.py')
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)
CONTENT = json.loads((REPO / 'app/content/de_DE/content.json').read_text(encoding='utf-8'))
SCHEMA = Path(os.environ.get('KALULU_LANGUAGE_SCHEMA', '/workspace/kalulu-feasibility/languages/schema/v1.sql'))
FRONTEND = Path(os.environ.get('KALULU_FRONTEND', '/workspace/kalulu-feasibility/frontend'))


class ContentSafetyTests(unittest.TestCase):
    def test_authored_content_is_valid_and_has_six_lessons(self):
        BUILDER.validate(CONTENT)
        self.assertEqual(len(CONTENT['lessons']), 6)
        self.assertTrue(all(lesson['syllables'] for lesson in CONTENT['lessons']))
        self.assertTrue(all(lesson['words'] for lesson in CONTENT['lessons'][2:]))

    def test_unknown_or_not_yet_taught_gp_cannot_enter_early_item(self):
        # A typo must not disappear from a decomposition, nor can a sound from a
        # future lesson silently become eligible in the first lesson's pool.
        unknown = deepcopy(CONTENT)
        unknown['lessons'][0]['words'][0]['gps'][-1] = 'missing_gp'
        with self.assertRaises((AssertionError, KeyError, ValueError)):
            BUILDER.validate(unknown)
        future = deepcopy(CONTENT)
        gp = next(g for g in future['gps'] if g['id'] == 'm')
        gp['introduced_lesson'] = 7
        future['lessons'][0]['new_gps'].remove('m')
        with self.assertRaises((AssertionError, KeyError, ValueError)):
            BUILDER.validate(future)

    def test_same_printed_syllable_cannot_have_competing_pronunciations(self):
        # Two targets with identical visible letters cannot be distinguished by a
        # child even when a designer assigned different phoneme IDs/audio files.
        for printed in ('ma', 'Ma'):
            with self.subTest(printed=printed):
                content = deepcopy(CONTENT)
                item = deepcopy(next(s for s in content['lessons'][0]['syllables'] if s['text'] == 'ma'))
                item.update(id='ma_short', text=printed, gps=['m', 'a_short'], ipa='ma')
                item['audio'].update(id='syllable_ma_short', text=printed, phonemes='ma')
                content['lessons'][0]['syllables'].append(item)
                with self.assertRaises((AssertionError, KeyError, ValueError)):
                    BUILDER.validate(content)

    def test_plausible_ipa_cannot_disagree_with_taught_decomposition(self):
        content = deepcopy(CONTENT)
        item = next(w for lesson in content['lessons'] for w in lesson['words'] if w['text'] == 'lila')
        # Keep audio and item mutually consistent so this catches a disagreement
        # with the teaching data, rather than only an audio metadata typo.
        item['ipa'] = 'ˈlɪla'
        item['audio']['phonemes'] = item['ipa']
        with self.assertRaises((AssertionError, KeyError, ValueError)):
            BUILDER.validate(content)

    def test_selected_vowel_contrasts_and_case_variants_are_explicit(self):
        gps = {gp['id']: gp for gp in CONTENT['gps']}
        for long_id, short_id in [('i_long', 'i_short'), ('u_long', 'u_short')]:
            self.assertNotEqual(gps[long_id]['phoneme'], gps[short_id]['phoneme'])
            self.assertEqual(gps[long_id]['grapheme'], gps[short_id]['grapheme'])
        words = {w['text']: w for lesson in CONTENT['lessons'] for w in lesson['words']}
        self.assertEqual(gps[words['Uni']['gps'][0]]['phoneme'], 'ʊ')
        self.assertEqual(gps[words['Oma']['gps'][-1]]['phoneme'], 'a')
        self.assertNotIn('Mama', words)
        for name in ('Mimi', 'Lina', 'Nina'):
            self.assertEqual(words[name]['word_kind'], 'proper_name')


@unittest.skipUnless(SCHEMA.is_file() and shutil.which('ffmpeg'),
                     'integration tests require the pinned upstream schema and ffmpeg')
class CompiledPackContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='kalulu-pack-test-')
        cls.output = Path(cls.temp.name) / 'de_DE'
        cls.summary = BUILDER.build(cls.output, SCHEMA)
        cls.db = sqlite3.connect(cls.output / 'language.db')

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        cls.temp.cleanup()

    def test_actual_schema_version_integrity_and_foreign_keys(self):
        self.assertEqual(self.db.execute('PRAGMA user_version').fetchone(), (1,))
        self.assertEqual(self.db.execute('PRAGMA integrity_check').fetchone(), ('ok',))
        self.assertEqual(self.db.execute('PRAGMA foreign_key_check').fetchall(), [])
        reference = sqlite3.connect(':memory:')
        try:
            reference.executescript(SCHEMA.read_text(encoding='utf-8'))
            tables = {r[0] for r in reference.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            actual_tables = {r[0] for r in self.db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            self.assertEqual(actual_tables, tables)
            for table in sorted(tables):
                with self.subTest(table=table):
                    self.assertEqual(self.db.execute(f'PRAGMA table_info("{table}")').fetchall(),
                                     reference.execute(f'PRAGMA table_info("{table}")').fetchall())
                    self.assertEqual(self.db.execute(f'PRAGMA foreign_key_list("{table}")').fetchall(),
                                     reference.execute(f'PRAGMA foreign_key_list("{table}")').fetchall())
        finally:
            reference.close()

    def test_decompositions_start_at_zero_and_preserve_every_letter(self):
        # This is an upstream data contract: sorting alone would hide a 1-based
        # position bug, although the official strict validator correctly fails it.
        for table, text_column, relation, key in [
            ('Words', 'Word', 'GPsInWords', 'WordID'),
            ('Syllables', 'Syllable', 'GPsInSyllables', 'SyllableID'),
        ]:
            for item_id, text in self.db.execute(f'SELECT ID,{text_column} FROM {table}'):
                with self.subTest(table=table, text=text):
                    parts = self.db.execute(
                        f'SELECT r.Position,g.Grapheme FROM {relation} r '
                        f'JOIN GPs g ON g.ID=r.GPID WHERE r.{key}=? ORDER BY r.Position',
                        (item_id,)).fetchall()
                    self.assertTrue(parts)
                    self.assertEqual([p[0] for p in parts], list(range(len(parts))))
                    self.assertEqual(''.join(p[1] for p in parts).casefold(), text.casefold())

    def test_runtime_word_pools_are_cumulative_without_future_sounds(self):
        # Query eligibility independently of the compiler and compare with the
        # authored introduction schedule. NULL/missing teaching rows also block.
        expected = set()
        for lesson in CONTENT['lessons']:
            expected.update(item['text'] for item in lesson['words'])
            eligible = {row[0] for row in self.db.execute('''
                SELECT w.Word FROM Words w
                WHERE EXISTS (SELECT 1 FROM GPsInWords WHERE WordID=w.ID)
                AND NOT EXISTS (
                  SELECT 1 FROM GPsInWords d
                  LEFT JOIN GPsInLessons teaching ON teaching.GPID=d.GPID
                  LEFT JOIN Lessons l ON l.ID=teaching.LessonID
                  WHERE d.WordID=w.ID AND (l.LessonNb IS NULL OR l.LessonNb > ?)
                )
                AND w.Exception=0
                ''', (lesson['number'],))}
            with self.subTest(lesson=lesson['number']):
                self.assertEqual(eligible, expected)
        self.assertEqual(len(expected), self.summary['counts']['Words'])

    def test_all_exercise_names_match_pinned_game_runtime(self):
        # The pinned game calls this Minigame.TYPE_NAMES; newer upstream schema
        # tooling expects MinigameTypes.NAMES at a different source path.
        for relative in ('sources/minigames/base/base_minigame.gd',
                         'sources/utils/minigame_types.gd'):
            source = FRONTEND / relative
            if not source.is_file():
                continue
            match = re.search(r'const (?:TYPE_NAMES|NAMES)[^=]*=\s*\[(.*?)\]',
                              source.read_text(encoding='utf-8'), re.S)
            if match:
                names = re.findall(r'"([^"]*)"', match.group(1))
                expected = list(enumerate(names, 1))
                self.assertEqual(self.db.execute('SELECT ID,Type FROM ExerciseTypes ORDER BY ID').fetchall(), expected)
                return
        self.skipTest('pinned frontend minigame type-name declaration not available')

    def test_game_ids_and_capitalised_audio_use_upstream_contract(self):
        self.assertEqual(self.db.execute('SELECT ID,Type FROM ExerciseTypes WHERE Type IN (\'jellyfish\',\'frog\') ORDER BY ID').fetchall(),
                         [(1, 'jellyfish'), (6, 'frog')])
        for name in ('cap.oma.mp3', 'cap.uni.mp3', 'lila.mp3', 'am.mp3', 'a-aː.mp3', 'u-ʊ.mp3'):
            with self.subTest(name=name):
                path = self.output / 'language_sounds' / name
                self.assertTrue(path.is_file(), f'Original game cannot resolve {name}')
                self.assertGreater(path.stat().st_size, 1000)


if __name__ == '__main__':
    unittest.main()
