"""Prepare the small human-recording-first browser audio collection.

Run with the external Piper venv only to regenerate sentence instructions.
The browser and ordinary builds do not require Piper or any voice model.
"""
from pathlib import Path
import argparse
import urllib.request
import hashlib
import html
import json
import re
import subprocess
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/workspace/kalulu-browser-audio')
OUTPUT = ROOT/'app/audio'
HUMAN = [
    ('a', 'a lang', 'aː', 'De-a.ogg', 'letter'),
    ('i', 'i lang', 'iː', 'De-i.ogg', 'letter'),
    ('o', 'o lang', 'oː', 'De-O.ogg', 'letter'),
    ('m', 'm als Summ-Laut', 'm̩', 'De-hm.ogg', 'letter'),
    ('am', 'am · kurzes a im Zusammenhang', 'am', 'De-am.ogg', 'syllable'),
    ('im', 'im · kurzes i im Zusammenhang', 'ɪm', 'De-im.ogg', 'syllable'),
    ('mi', 'mi · Übungssilbe mit langem i', 'miː', 'De-mi.ogg', 'syllable'),
    ('oma', 'Oma', 'ˈoːma', 'De-Oma.ogg', 'word'),
]
INSTRUCTIONS = [
    ('listen', 'Hör genau hin. Tippe auf den passenden Buchstaben.'),
    ('syllable', 'Hör genau hin. Welche Silbe passt?'),
    ('word', 'Hör dir das Wort an. Baue es Buchstabe für Buchstabe auf.'),
    ('done', 'Das hast du gut gemacht. Du kannst in deinem Tempo weiterüben.'),
]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def text(value):
    return html.unescape(re.sub('<[^>]+>', '', value))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache', type=Path, default=CACHE)
    parser.add_argument('--model', type=Path, default=Path('/workspace/kalulu-tools/tts-models/de_DE-thorsten-medium.onnx'))
    parser.add_argument('--legacy-audio', type=Path, default=Path('/workspace/kalulu-browser-backup/old-audio'))
    args = parser.parse_args()
    cache = args.cache
    OUTPUT.mkdir(parents=True, exist_ok=True)
    metadata = json.loads((ROOT/'docs/audio-sources.json').read_text())
    pins = {c['id']:c for c in json.loads((OUTPUT/'manifest.json').read_text())['clips']}
    cache.mkdir(parents=True, exist_ok=True)
    for key, _, _, file, _ in HUMAN:
        source = cache/file
        if not source.exists():
            request = urllib.request.Request(pins[key]['sourceAudio'], headers={'User-Agent':'Kalulu-DE audio preparation (educational prototype)'})
            with urllib.request.urlopen(request, timeout=60) as response:
                source.write_bytes(response.read())
        if sha(source) != pins[key]['sourceSha256']:
            raise SystemExit('Source audio checksum mismatch: '+file)
    if sha(args.model) != '7e64762d8e5118bb578f2eea6207e1a35a8e0c30595010b666f983fc87bb7819':
        raise SystemExit('Voice model checksum mismatch.')
    clips = []
    for key, label, ipa, file, group in HUMAN:
        source = cache/file
        info = metadata[file]['imageinfo'][0]
        meta = info['extmetadata']
        # Trim only quiet margins, retain breathing room, and fade the outer
        # edges. Never cut a vowel out of a word or stretch its duration.
        output = OUTPUT/(key+'.mp3')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(source), '-af',
            'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB:start_silence=0.12,'
            'areverse,silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB:start_silence=0.16,'
            'areverse,loudnorm=I=-20:TP=-3:LRA=7,afade=t=in:d=0.008,apad=pad_dur=0.12',
            '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '80k', str(output)], check=True)
        clips.append({'id':key, 'label':label, 'ipa':ipa, 'group':group,
            'src':'audio/'+output.name, 'kind':'human', 'artist':text(meta['Artist']['value']),
            'source':info['descriptionurl'], 'sourceAudio':info['url'].split('?')[0],
            'sourceSha256':sha(source), 'sha256':sha(output),
            'license':meta['LicenseShortName']['value'], 'licenseUrl':meta['LicenseUrl']['value'],
            'description':text(meta.get('ImageDescription',{}).get('value','')),
            'processing':'Quiet margins shortened with 120/160ms retained; loudness normalization; 8ms leading fade; 120ms trailing padding. No vowel extraction, pitch shift or time stretch.',
            'review':'pending',
            'note':('Natürlicher deutscher Summ-Laut aus „hm“. Bitte prüfen, dass kein zusätzliches h/e hörbar ist.' if key=='m' else
                    'Kurzer Vokal wird im vollständigen Wort gehört, nicht künstlich isoliert.' if key in ('am','im') else
                    'Menschliche Aufnahme. Pädagogische Hörfreigabe steht noch aus.')})
    # TTS is restricted to ordinary complete sentences, never isolated letters.
    from piper import PiperVoice, SynthesisConfig
    voice = PiperVoice.load(str(args.model))
    config = SynthesisConfig(length_scale=1.05, noise_scale=0.0, noise_w_scale=0.0)
    for key, sentence in INSTRUCTIONS:
        with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
            with wave.open(tmp.name, 'wb') as wav:
                voice.synthesize_wav(sentence, wav, syn_config=config)
            output = OUTPUT/(key+'.mp3')
            subprocess.run(['ffmpeg','-v','error','-y','-i',tmp.name,'-af','loudnorm=I=-20:TP=-3:LRA=7,apad=pad_dur=0.16',
                            '-ar','44100','-ac','1','-c:a','libmp3lame','-b:a','80k',str(output)],check=True)
        clips.append({'id':key,'label':sentence,'ipa':None,'group':'instruction','src':'audio/'+output.name,
            'kind':'tts','artist':'Piper / Thorsten-Voice','license':'CC BY-SA 4.0 (authored clip collection)',
            'licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/',
            'source':'https://huggingface.co/rhasspy/piper-voices/tree/c10ece1aade47bb51c153c893d14e5bf8e5b7117/de/de_DE/thorsten/medium',
            'sha256':sha(output),'review':'pending','note':'Künstliche Stimme nur für vollständige Anleitungen; keine isolierten Sprachlaute.'})
    for key, old in [('a','gp_a_long'),('i','gp_i_long'),('m','gp_m')]:
        output = OUTPUT/('previous-'+key+'.mp3')
        old_source = args.legacy_audio/(old+'.wav')
        if old_source.exists():
            subprocess.run(['ffmpeg','-v','error','-y','-i',str(old_source),
                            '-c:a','libmp3lame','-b:a','80k',str(output)],check=True)
        elif not output.exists():
            raise SystemExit('Missing optional comparison asset: '+str(output))
        next(c for c in clips if c['id']==key)['previous'] = 'audio/'+output.name
    result = {'version':2,'policy':'Human recordings for isolated sounds and syllables; TTS only for sentence instructions. No auditory approval claimed.',
              'clips':clips,'generatorSha256':sha(Path(__file__))}
    (OUTPUT/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'docs/audio-sources.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
    print('Prepared',len(clips),'current clips; 3 old clips retained only for adult A/B review.')


if __name__=='__main__':
    main()
