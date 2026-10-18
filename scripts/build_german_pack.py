"""Validate authored German content and build an upstream-schema offline pack.

Only stdlib + ffmpeg are required. Piper is needed to regenerate WAVs, not to
build from the small reviewed-in-Git draft clips. Outputs belong outside Git.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
import sqlite3
import subprocess
import unicodedata

REPO = Path(__file__).resolve().parent.parent
if not __debug__:
    raise RuntimeError('Run this content validator with ordinary Python, without -O.')


def encoded(text):
    symbols = {'#': 'sharp', '@': 'at', '*': 'star', '$': 'usd', '%': 'pcent', '§': 'para'}
    return symbols.get(text, text if text == text.lower() else 'cap.' + text.lower())


def verified_audio_clips(audio_dir=None):
    audio_dir = Path(audio_dir) if audio_dir else REPO/'app/content/de_DE/audio'
    clips = json.loads((audio_dir/'manifest.json').read_text())['clips']
    metadata = json.loads((audio_dir/'metadata.json').read_text())
    by_id = {c['id']: c for c in metadata['clips']}
    if len(by_id) != len(metadata['clips']) or len(by_id) != len(clips) or set(by_id) != {c['id'] for c in clips}:
        raise ValueError('Audio manifest and provenance clip IDs differ')
    for clip in clips:
        clip_id = clip['id']
        record = by_id[clip_id]
        if not re.fullmatch('[a-z0-9_]+', clip_id) or record['file'] != clip_id+'.wav':
            raise ValueError(f'Unsafe audio filename: {clip_id}')
        if any(clip.get(key) != record.get(key) for key in ['kind', 'text', 'phonemes']):
            raise ValueError(f'Audio provenance labels differ: {clip_id}')
        actual = hashlib.sha256((audio_dir/record['file']).read_bytes()).hexdigest()
        if actual != record['sha256']:
            raise ValueError(f'Audio SHA256 differs from generation provenance: {clip_id}')
    return clips


def validate(content):
    assert content['schema_version'] == 1 and content['locale'] == 'de_DE'
    gps = {gp['id']: gp for gp in content['gps']}
    assert len(gps) == len(content['gps'])
    assert [l['number'] for l in content['lessons']] == list(range(1, 7))
    seen = {'syllables': set(), 'words': set()}
    for lesson in content['lessons']:
        number = lesson['number']
        assert set(lesson['new_gps']) == {g['id'] for g in gps.values() if g['introduced_lesson'] == number}
        for category in seen:
            assert lesson[category], f'Empty {category} in lesson {number}'
            for item in lesson[category]:
                text = item['text']
                assert text == unicodedata.normalize('NFC', text)
                assert text.casefold() not in seen[category], f'Duplicate printed {category}: {text}'
                seen[category].add(text.casefold())
                parts = [gps[key] for key in item['gps']]
                assert ''.join(g['grapheme'] for g in parts).casefold() == text.casefold(), text
                assert max(g['introduced_lesson'] for g in parts) == number, f'Early/late pool: {text}'
                assert ''.join(g['phoneme'] for g in parts) == item['ipa'].replace('ˈ', '').replace('ˌ', ''), text
                assert item['audio']['phonemes'] == item['ipa'], text
                if category == 'words':
                    assert 2 <= len(parts) <= 6, text
                    assert ''.join(item['syllable_breaks']) == text
                    assert sum(item['syllable_gp_lengths']) == len(parts)
    for gp in gps.values():
        assert gp['type'] in (1, 2)
        assert gp['audio']['phonemes'] == gp['phoneme']
        assert not any(c in gp['phoneme'] for c in '/\\'), gp
    return gps


def build(output, schema):
    content = json.loads((REPO/'app/content/de_DE/content.json').read_text())
    gps = validate(content)
    output.mkdir(parents=True, exist_ok=True)
    path = output/'language.db'
    path.unlink(missing_ok=True)
    db = sqlite3.connect(path)
    db.executescript(schema.read_text())
    db.execute('PRAGMA foreign_keys=ON')
    ids = {key: index for index, key in enumerate(gps, 1)}
    for gp in gps.values():
        db.execute('INSERT INTO GPs(ID,Grapheme,Phoneme,Type) VALUES(?,?,?,?)',
                   (ids[gp['id']], gp['grapheme'], gp['phoneme'], gp['type']))
    for name in ['jellyfish', 'crabs', 'parakeets', 'monkey', 'caterpillar', 'frog', 'turtles', 'ants', 'penguin', 'boss']:
        db.execute('INSERT INTO ExerciseTypes(Type) VALUES(?)', (name,))
    for lesson in content['lessons']:
        number = lesson['number']
        db.execute('INSERT INTO Lessons(ID,LessonNb) VALUES(?,?)', (number, number))
        db.execute('INSERT INTO LessonsExercises(LessonID,Exercise1,Exercise2,Exercise3) VALUES(?,1,6,0)', (number,))
        for key in lesson['new_gps']:
            db.execute('INSERT INTO GPsInLessons(GPID,LessonID) VALUES(?,?)', (ids[key], number))
        for category, table, column in [('syllables', 'Syllables', 'Syllable'), ('words', 'Words', 'Word')]:
            for item in lesson[category]:
                cursor = db.execute(f'INSERT INTO {table}({column}) VALUES(?)', (item['text'],))
                item_id = cursor.lastrowid
                for position, key in enumerate(item['gps']):
                    db.execute(f'INSERT INTO GPsIn{table}({column}ID,GPID,Position) VALUES(?,?,?)', (item_id, ids[key], position))
    assert not db.execute('PRAGMA foreign_key_check').fetchall()
    assert db.execute('PRAGMA integrity_check').fetchone() == ('ok',)
    assert db.execute('PRAGMA user_version').fetchone() == (1,)
    db.commit()
    counts = {t: db.execute(f'SELECT count(*) FROM {t}').fetchone()[0] for t in ['GPs', 'Syllables', 'Words', 'Lessons']}
    db.close()

    clips = verified_audio_clips()
    by_id = {c['id']: c for c in clips}
    # Different authored entries may share one canonical sound (e.g. am word/syllable).
    # A same-name/different-pronunciation collision must fail, never overwrite.
    assets = {}
    def add(name, audio):
        assert audio == by_id[audio['id']], f'Audio manifest drift: {audio}'
        destination = 'language_sounds/' + name + '.mp3'
        if destination in assets:
            assert assets[destination]['phonemes'] == audio['phonemes'], destination
        else:
            assets[destination] = audio
    for gp in gps.values():
        add(encoded(gp['grapheme'])+'-'+encoded(gp['phoneme']), gp['audio'])
    for lesson in content['lessons']:
        for item in lesson['syllables'] + lesson['words']:
            add(encoded(item['text']), item['audio'])
    for clip in clips:
        if clip['kind'] == 'instruction':
            add('kalulu/'+clip['id'], clip)
    for name, clip in assets.items():
        wav = REPO/'app/content/de_DE/audio'/f"{clip['id']}.wav"
        assert wav.is_file(), f'Missing generated draft clip {wav}'
        target = output/name
        target.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(wav), '-codec:a', 'libmp3lame', '-b:a', '64k', '-ar', '22050', '-ac', '1', str(target)], check=True)
        assert target.stat().st_size > 1000, name
    summary = {'counts': counts, 'sound_files': len(assets), 'content_sha256': hashlib.sha256((REPO/'app/content/de_DE/content.json').read_bytes()).hexdigest(),
               'schema_sha256': hashlib.sha256(schema.read_bytes()).hexdigest()}
    (output/'PACK_INFO.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(summary, ensure_ascii=False))
    return summary


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--schema', type=Path, default=Path('/workspace/kalulu-feasibility/languages/schema/v1.sql'))
    args = parser.parse_args()
    build(args.output, args.schema)
