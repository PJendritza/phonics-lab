"""Verify audio packaging rejects assets that disagree with their provenance.

Run: python3 -m unittest discover -s tests -p 'test_german_audio_integrity.py' -v
These checks use hashes and tiny temporary WAVs, without encoding or synthesis.
They do not certify pronunciation or educational suitability.
"""
from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest
import wave

REPO = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('audio_pack_builder', REPO / 'scripts/build_german_pack.py')
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


class CurrentAudioCollectionTests(unittest.TestCase):
    def test_all_63_authored_clips_have_matching_provenance_and_bytes(self):
        clips = BUILDER.verified_audio_clips()
        self.assertEqual(len(clips), 63)
        self.assertEqual(len({clip['id'] for clip in clips}), 63)
        expected = json.loads((REPO / 'app/content/de_DE/audio/manifest.json').read_text(encoding='utf-8'))['clips']
        self.assertEqual(clips, expected)
        for kind, count in [('gp', 13), ('syllable', 25), ('word', 18), ('instruction', 7)]:
            self.assertEqual(sum(clip['kind'] == kind for clip in clips), count)


class AudioProvenanceTamperTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='kalulu-audio-integrity-')
        self.addCleanup(self.temp.cleanup)
        self.audio = Path(self.temp.name)
        self.wav = self.audio / 'word_lila.wav'
        with wave.open(str(self.wav), 'wb') as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(22050)
            output.writeframes(struct.pack('<64h', *([1000, -1000] * 32)))
        clip = {'id': 'word_lila', 'kind': 'word', 'text': 'lila', 'phonemes': 'ˈliːla'}
        self.manifest = {'version': 1, 'clips': [clip]}
        self.metadata = {'schema_version': 1, 'clips': [{
            **clip, 'file': self.wav.name,
            'sha256': hashlib.sha256(self.wav.read_bytes()).hexdigest(),
        }]}
        self.write_records()

    def write_records(self, manifest=None, metadata=None):
        (self.audio / 'manifest.json').write_text(
            json.dumps(self.manifest if manifest is None else manifest, ensure_ascii=False), encoding='utf-8')
        (self.audio / 'metadata.json').write_text(
            json.dumps(self.metadata if metadata is None else metadata, ensure_ascii=False), encoding='utf-8')

    def test_matching_small_valid_wav_is_accepted(self):
        self.assertEqual(BUILDER.verified_audio_clips(self.audio), self.manifest['clips'])

    def test_changed_audio_samples_are_rejected_even_when_wav_still_decodes(self):
        original = self.wav.read_bytes()
        # Alter PCM only, leaving a valid header and the recorded duration intact.
        self.wav.write_bytes(original[:-2] + struct.pack('<h', 2000))
        with wave.open(str(self.wav), 'rb') as actual:
            self.assertEqual(actual.getnframes(), 64)
        with self.assertRaisesRegex(ValueError, 'SHA256'):
            BUILDER.verified_audio_clips(self.audio)

    def test_provenance_text_phonemes_or_kind_cannot_drift_from_manifest(self):
        for key, replacement in [('text', 'Lama'), ('phonemes', 'ˈlaːma'), ('kind', 'syllable')]:
            with self.subTest(key=key):
                altered = deepcopy(self.metadata)
                altered['clips'][0][key] = replacement
                self.write_records(metadata=altered)
                with self.assertRaisesRegex(ValueError, 'labels differ'):
                    BUILDER.verified_audio_clips(self.audio)

    def test_missing_or_different_manifest_and_metadata_ids_are_rejected(self):
        variants = [
            ({'version': 1, 'clips': []}, self.metadata),
            (self.manifest, {'schema_version': 1, 'clips': []}),
        ]
        mismatched = deepcopy(self.metadata)
        mismatched['clips'][0]['id'] = 'word_lama'
        variants.append((self.manifest, mismatched))
        for index, (manifest, metadata) in enumerate(variants):
            with self.subTest(variant=index):
                self.write_records(manifest=manifest, metadata=metadata)
                with self.assertRaisesRegex(ValueError, 'IDs differ'):
                    BUILDER.verified_audio_clips(self.audio)

    def test_duplicate_manifest_ids_are_rejected(self):
        duplicated = deepcopy(self.manifest)
        duplicated['clips'].append(deepcopy(duplicated['clips'][0]))
        self.write_records(manifest=duplicated)
        with self.assertRaisesRegex(ValueError, 'IDs differ'):
            BUILDER.verified_audio_clips(self.audio)

    def test_duplicate_provenance_ids_are_rejected(self):
        duplicated = deepcopy(self.metadata)
        duplicated['clips'].append(deepcopy(duplicated['clips'][0]))
        self.write_records(metadata=duplicated)
        with self.assertRaisesRegex(ValueError, 'IDs differ'):
            BUILDER.verified_audio_clips(self.audio)

    def test_unsafe_ids_are_rejected_before_file_access(self):
        for clip_id in ['../outside', 'with.dot', '/absolute', 'Uppercase', '']:
            with self.subTest(clip_id=clip_id):
                manifest, metadata = deepcopy(self.manifest), deepcopy(self.metadata)
                manifest['clips'][0]['id'] = metadata['clips'][0]['id'] = clip_id
                metadata['clips'][0]['file'] = clip_id + '.wav'
                self.write_records(manifest=manifest, metadata=metadata)
                with self.assertRaisesRegex(ValueError, 'Unsafe audio filename'):
                    BUILDER.verified_audio_clips(self.audio)

    def test_recorded_path_cannot_escape_audio_directory_or_select_other_file(self):
        for filename in ['../word_lila.wav', '/tmp/word_lila.wav', 'other.wav']:
            with self.subTest(filename=filename):
                altered = deepcopy(self.metadata)
                altered['clips'][0]['file'] = filename
                self.write_records(metadata=altered)
                with self.assertRaisesRegex(ValueError, 'Unsafe audio filename'):
                    BUILDER.verified_audio_clips(self.audio)


if __name__ == '__main__':
    unittest.main()
