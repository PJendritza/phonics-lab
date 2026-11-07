"""Generate the tiny UI direction map from the same text used for recorded guides."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 guides={}
 for name in ['instructions.json','reading-instructions.json']:
  guides.update(json.loads((ROOT/'scripts'/name).read_text()))
 out='// Short task directions; generated from the two instruction JSON files.\nexport const TASK_GUIDES='+json.dumps(guides,ensure_ascii=False,separators=(',',':'))+';\n'
 (ROOT/'app/task-guides.mjs').write_text(out)
 print(f'{len(guides)} short task directions generated.')
if __name__=='__main__':main()
