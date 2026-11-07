"""Recheck vocabulary membership against pinned official lists; never a build step.

Original PDFs/text stay external; requires Python 3 and pdftotext. Membership
does not supply a frequency rank or establish a pedagogical reading sequence.
"""
import argparse, hashlib, json, re, subprocess, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache', type=Path, default=Path('/workspace/phonics-research'))
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    spec = json.loads((ROOT/'docs/curriculum/useful-words-v13.json').read_text())
    corpora = {}
    for source in spec['sources']:
        path = args.cache/(source['id']+'.pdf')
        if not path.exists():
            request = urllib.request.Request(source['url'], headers={'User-Agent':'Phonics Lab vocabulary research'})
            with urllib.request.urlopen(request, timeout=40) as response:
                path.write_bytes(response.read())
        if hashlib.sha256(path.read_bytes()).hexdigest() != source['sha256']:
            raise SystemExit('Official source changed; review before repinning: '+source['id'])
        text = subprocess.check_output(['pdftotext','-layout',str(path),'-'], text=True)
        corpora[source['id']] = set(re.findall(r'[^\W\d_]+', text.casefold()))
    report = {word:{source:word.casefold() in words for source,words in corpora.items()}
              for word in spec['selectedLemmas']}
    for word in ['nicht','und']:
        if not report[word]['bb-100']:
            raise SystemExit('Missing expected high-frequency function word: '+word)
    for word in spec['selectedLemmas']:
        if word not in ['nicht','und'] and not (report[word]['bb-grades'] and report[word]['nrw']):
            raise SystemExit('Missing expected primary-school vocabulary membership: '+word)
    print(json.dumps({'status':'passed','memberships':report,'meaning':'Exact word membership, not a frequency ranking or reading-efficacy validation.'},ensure_ascii=False,indent=2))

if __name__ == '__main__':
    main()
