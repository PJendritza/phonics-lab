"""Extract complete standalone sounds from licensed Kalulu phonics recordings.

French Look & Learn clips contain an isolated phone, silence, then a separate
vowel/context example. Retain only the first complete utterance, never a word
fragment. h uses the breath portion of a phoneme-only Portuguese /h/ recording;
its neutral voiced release is excluded. Original files and hashes stay explicit.
"""
import hashlib,json,subprocess,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CACHE=Path('/workspace/phonics-phonemes-v6/kalulu');CACHE.mkdir(parents=True,exist_ok=True)
REV='bb0f71766c5e27fdb775e544ffe62ca98e6a615c'
SOURCES={
 'f':('f-f','8a5c47f5e629c958b074063a9f4bfc8ebc67cf769df5a0ac1d22840c66f1ded8'),
 'n':('n-n','4c7ccd93eb2f70a0fe9edd28d92e6a33c9ae0ec503c0577d833fdd2c5eee01da'),
 'l':('l-l','86973507e2035518cf584a5c42a5b13e74ef9697450498b01bbc1036833a86e7'),
 's':('s-s','67dc566bff81028a541c0afe6916c534b8c81da72de142903c88838cd93ab021'),
 'sch':('ch-cap.s','bd897daf0e2dd802262f4a81ab0dd4816fbcdaa66492ad9daf46ef2e1f538bad'),
 'b':('b-b','384b228c2948fa3eafd00743cea75af89f0aa914a3c69f9ef15ee01ef3650787'),
 'd':('d-d','7c5d413f975ae0780c6f9356ffec9309b0f3901303ed0497ed27664e68820c36'),
 'g':('g-g','25287cc1ad6920aa94785ed28c4b060a6a9d2f7fabb48eaa1dee2380578a8d9f'),
 't':('t-t','b6c2d8325e413c3f6f3ccea00a1f0313a9854b632813b1ca3c543f2586758bd6'),
 'k':('k-k','c8a2d5eb3a4bda2aab9071d69794d21f9e4e80c25bf9245552c5c9f4fe06f0dc'),
 'h':('r-h','d678d9d90aacf624d2fdda7f7f05ebd2c6d1edbe7bff47d630b64d9c255efe44'),
}
manifest_path=ROOT/'app/audio/manifest.json';manifest=json.loads(manifest_path.read_text());clips=[c for c in manifest['clips'] if c['kind']!='phoneme']
for unit,(name,digest) in SOURCES.items():
 locale='pt_BR' if unit=='h' else 'fr_FR';relative=locale+'/look_and_learn/sounds/'+name+'.mp3'
 source_url='https://media.githubusercontent.com/media/Excello-Recherche-Education/Kalulu-Languages/'+REV+'/'+relative
 source=CACHE/(name+'.mp3')
 if not source.exists():
  with urllib.request.urlopen(source_url,timeout=40) as response:source.write_bytes(response.read())
 if hashlib.sha256(source.read_bytes()).hexdigest()!=digest:raise SystemExit('Upstream checksum mismatch: '+unit)
 start,end=(.14,.31) if unit=='h' else (0,.95)
 out=ROOT/'app/audio'/('phoneme_'+unit+'.mp3')
 filters=f'atrim=start={start}:end={end},asetpts=PTS-STARTPTS,silenceremove=start_periods=1:start_duration=0.005:start_threshold=-50dB:start_silence=0.06,areverse,silenceremove=start_periods=1:start_duration=0.005:start_threshold=-50dB:start_silence=0.08,areverse,loudnorm=I=-20:TP=-3:LRA=7,areverse,afade=t=in:d=0.008,areverse,afade=t=in:d=0.004,apad=pad_dur=0.16'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-af',filters,'-ar','22050','-ac','1','-c:a','libmp3lame','-b:a','64k',str(out)],check=True)
 clips.append({'id':'phoneme_'+unit,'label':'Einzellaut '+unit,'ipa':'ʃ' if unit=='sch' else unit,'group':'phoneme','kind':'phoneme','src':'audio/'+out.name,'artist':'Excello / Kalulu contributors (speaker not individually identified)','license':'CC BY-SA 4.0','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','source':'https://github.com/Excello-Recherche-Education/Kalulu-Languages/blob/'+REV+'/'+relative,'sourceAudio':source_url,'sourceSha256':digest,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'segmentSeconds':[start,end],'sourceLocale':locale,'processing':{'sampleRate':22050,'bitrate':'64k','loudnessLUFS':-20,'leadingFadeSeconds':.004,'trailingFadeSeconds':.008,'trailingPadSeconds':.16},'review':'pending','note':('Atemanteil der eigenständigen /h/-Lautaufnahme; neutraler stimmhafter Ausklang entfernt. Kein Wort ausgeschnitten.' if unit=='h' else 'Vollständiger einzelner Anfangslaut aus der Lautdemonstration, vor Pause und separatem Kontextbeispiel. Kein Wort ausgeschnitten.')+' Lautübertragung aus Kalulu; deutsche Hörprüfung noch offen. Plosive können einen kurzen natürlichen Löseklang haben.'})
manifest['phonemeGeneratorSha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest();manifest['clips']=clips;manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print('Prepared 11 isolated phonics feedback clips; original German targets unchanged.')
