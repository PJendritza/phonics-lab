"""Package AI-generated illustration sheets; do not redraw or modify their content.

Original generation PNGs stay external. This only converts format for web delivery
and records sprite display rectangles; ordinary builds use committed WebP assets.
"""
import argparse,hashlib,json,shutil,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--cache',type=Path,default=Path('/workspace/generated_images'));args=parser.parse_args()
 sources=json.loads((ROOT/'docs/illustration-sources.json').read_text());out=ROOT/'app/images';out.mkdir(exist_ok=True)
 files=[];sheets={};sprites={}
 for source in sources['sheets']:
  path=args.cache/source['file']
  if sha(path)!=source['sha256']:raise SystemExit('Source illustration checksum mismatch: '+source['id'])
  dimensions=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',str(path)]))['streams'][0]
  width,height=dimensions['width'],dimensions['height']
  with tempfile.NamedTemporaryFile(suffix='.webp') as temp:
   subprocess.run(['ffmpeg','-v','error','-y','-i',str(path),'-c:v','libwebp','-q:v','82','-compression_level','6','-frames:v','1',temp.name],check=True)
   digest=sha(Path(temp.name));target=out/('atlas-'+source['id']+'-'+digest[:12]+'.webp');shutil.copy2(temp.name,target)
  src='images/'+target.name;sheets[source['id']]={'src':src,'width':width,'height':height}
  files.append({'id':source['id'],'src':src,'sha256':digest,'sourceSha256':source['sha256'],'width':width,'height':height,'bytes':target.stat().st_size,'aiGenerated':True})
  for index,id in enumerate(source['cells']):
   if id is None:continue
   rect=source.get('rects',{}).get(id,[index%source['columns']*width/source['columns'],index//source['columns']*height/source['rows'],width/source['columns'],height/source['rows']])
   if rect[0]<0 or rect[1]<0 or rect[0]+rect[2]>width+.01 or rect[1]+rect[3]>height+.01:raise SystemExit('Sprite outside atlas: '+id)
   sprites[id]={'sheet':source['id'],'rect':rect}
 (out/'manifest.json').write_text(json.dumps({'source':'docs/illustration-sources.json','processing':'WebP quality 82, compression 6; format conversion only. Sprite rectangles clip display, not source content.','files':files},ensure_ascii=False,indent=2)+'\n')
 (ROOT/'app/image-data.mjs').write_text('// AI-generated artwork; provenance in images/manifest.json and docs/illustration-sources.json.\nexport const SHEETS='+json.dumps(sheets,separators=(',',':'))+';\nexport const SPRITES='+json.dumps(sprites,separators=(',',':'))+';\n')
 print(f'{len(files)} image sheets, {len(sprites)} sprites, {sum(f["bytes"] for f in files):,} bytes.')
if __name__=='__main__':main()
