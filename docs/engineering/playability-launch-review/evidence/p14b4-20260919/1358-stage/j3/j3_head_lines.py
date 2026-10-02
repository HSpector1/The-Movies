"""1358-J3 check 8: where each of the 29 census rows without a classification row sits at b60db650. Read-only."""
import json, re, subprocess
R = '/Users/zacheryspector/The-Movies-headless-program'
S = f'{R}/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1358-stage'
c = {r['id']: r for r in json.load(open(f'{S}/n/census.json'))['rows']}
ids = json.load(open(f'{S}/sweep-r4/1358-sweep-classification-merged.json'))['census']['withoutClassificationRow']
def show(rev, f): return subprocess.run(['git', '-C', R, 'show', f'{rev}:{f}'], check=True, capture_output=True, text=True).stdout.split('\n')
norm = lambda s: re.sub(r'\s+', '', s.replace('convertV44ToV43(', '').replace('validateSaveV44', 'validateSaveV43'))
for i in ids:
    r = c[i]
    base = show('65515b66', r['file']); head = show('b60db650', r['file'])
    at_base = base[r['line'] - 1].strip() == r['text'].strip()[:len(base[r['line'] - 1].strip())] if r['line'] <= len(base) else False
    key = norm(r['text'])[:60]
    hits = [n for n, l in enumerate(head, 1) if norm(l).startswith(key[:40]) or key[:40] in norm(l)]
    print(f"{i} {r['file']}:{r['line']} census-line text at 65515b66: {at_base}; HEAD candidates: {hits[:6]}")
