"""Build small, renamed OFL web subsets from the pinned Andika 7 release.

Optional development tool: fontTools with WOFF2 support. Normal builds use the
committed fonts and require no font-processing dependencies.
"""
import hashlib,json,urllib.request,zipfile
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path('/workspace/phonics-fonts')
URL='https://github.com/silnrsi/font-andika/releases/download/v7.000/Andika-7.000.zip'
ARCHIVE_SHA='88ba6ea41ef4a8e5214b090df8fa2983be1babe4843efaa99cdb6078b0e2c070'
CACHE.mkdir(parents=True,exist_ok=True);archive=CACHE/'Andika-7.000.zip'
if not archive.exists():
 with urllib.request.urlopen(URL,timeout=60) as response:archive.write_bytes(response.read())
if hashlib.sha256(archive.read_bytes()).hexdigest()!=ARCHIVE_SHA:raise SystemExit('Font archive checksum mismatch')
out=ROOT/'app/fonts';out.mkdir(exist_ok=True)
previous=json.loads((out/'manifest.json').read_text())['files'] if (out/'manifest.json').exists() else []
manifest={'source':URL,'sourceSha256':ARCHIVE_SHA,'originalFamily':'Andika','version':'7.000','family':'Phonics Lesson','license':'SIL Open Font License 1.1','changes':'Latin subset; internal family renamed as required by reserved font names. Original glyph shapes and cv39 curved-tail l retained.','files':[]}
with zipfile.ZipFile(archive) as package:
 (out/'OFL.txt').write_bytes(package.read('Andika-7.000/OFL.txt'))
 for style,weight in [('Regular',400),('Bold',700)]:
  original=CACHE/('Andika-'+style+'.ttf');original.write_bytes(package.read('Andika-7.000/'+original.name))
  font=TTFont(original,recalcTimestamp=False);options=subset.Options();options.flavor='woff2';options.layout_features=['cv39','ss01','ss13','ss14','kern','liga','mark','mkmk','ccmp','locl'];options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*']
  worker=subset.Subsetter(options=options);worker.populate(unicodes=list(range(0x20,0x100))+[0x131,0x152,0x153,0x178,0x1e9e,0x20ac]+list(range(0x2000,0x2070)));worker.subset(font)
  names={1:'Phonics Lesson',2:style,3:'PhonicsLesson-'+style+'-7.000-Latin',4:'Phonics Lesson '+style,6:'PhonicsLesson-'+style,16:'Phonics Lesson',17:style}
  for record in font['name'].names:
   if record.nameID in names:record.string=names[record.nameID].encode(record.getEncoding(),errors='replace')
  font.flavor='woff2';target=out/('phonics-'+style.lower()+'.woff2');font.save(target)
  digest=hashlib.sha256(target.read_bytes()).hexdigest();renamed=target.with_name(target.stem+'-'+digest[:12]+'.woff2');target.rename(renamed)
  manifest['files'].append({'src':'fonts/'+renamed.name,'weight':weight,'sha256':digest,'sourceSha256':hashlib.sha256(original.read_bytes()).hexdigest()})
for old in previous:
 if old['src'] not in [f['src'] for f in manifest['files']]:
  candidate=ROOT/'app'/old['src']
  if candidate.parent==out and candidate.suffix=='.woff2':candidate.unlink(missing_ok=True)
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
