"""1358-J3 check 8: the merged classification (1358-C9) against the unit files, the parent file and the scratch commits.
Read-only (git show in the merge worktree)."""
import collections, json, re, subprocess
S = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1358-stage'
M = '/Users/zacheryspector/studio-scratch/1358-sweep/merge'
merged = json.load(open(f'{S}/sweep-r4/1358-sweep-classification-merged.json'))
rows = merged['rows']

def load(p):
    d = json.load(open(p))
    return d['rows'] if isinstance(d, dict) and 'rows' in d else d

units = {'H': 'sweep-r1/h', 'G1': 'sweep-r1/g1', 'G2': 'sweep-r1/g2', 'G3': 'sweep-r1/g3', 'G4': 'sweep-r1/g4',
         'G5': 'sweep-r1/g5', 'G6': 'sweep-r1/g6', 'F1': 'sweep-r2/f1', 'F2': 'sweep-r2/f2'}
strip = lambda r: {k: v for k, v in r.items() if k != 'unit'}
for u, d in units.items():
    src = load(f'{S}/{d}/classification.json')
    mine = [strip(r) for r in rows if r['unit'] == u]
    # compare on the shared keys only (the merge may add 'unit' and normalise nothing else)
    same = len(src) == len(mine) and all(all(a.get(k) == b.get(k) for k in a) for a, b in zip(src, mine))
    print(f'{u}: unit file {len(src)} rows, merged {len(mine)}, equal in order on the unit keys: {same}')
parent = load(f'{S}/sweep-r4/1358-classification-parent.json')
mp = [strip(r) for r in rows if r['unit'] == 'parent']
print('parent file', len(parent), 'merged parent', len(mp), 'first 44 equal:', all(all(a.get(k) == b.get(k) for k in a) for a, b in zip(parent, mp[:44])))
print('merged extra parent row:', json.dumps(mp[44])[:400])
# the 45th row against 4e36a25 and its parent 7e7a065
r = mp[44]
def show(rev, f): return subprocess.run(['git', '-C', M, 'show', f'{rev}:{f}'], check=True, capture_output=True, text=True).stdout.split('\n')
new = show(r['commit'], r['file']); old = show(r['commit'] + '^', r['file'])
n = r['new'].split('\n'); L = r['line']
print('new text at', L, 'in', r['commit'], ':', new[L-1:L-1+len(n)] == n)
print('old text at', L, 'in parent:', old[L-1] == r['old'])
print('row count', len(rows), 'stated', merged['counts']['rows'], 'byUnit stated == computed:',
      merged['counts']['byUnit'] == dict(collections.Counter(x['unit'] for x in rows)),
      'byClass stated == computed:', merged['counts']['byClass'] == dict(collections.Counter(x['cls'] for x in rows)))
# C9 class summary
cls = collections.Counter(x['cls'] for x in rows)
fold = collections.Counter()
for k, v in cls.items():
    base = k.split(' ')[0]
    fold[base if base in {'S1','S2','S3','S4','S5','S6','S7','S8','P1','P2','P3','P5'} and (k == base or k in ('S5 (helper)', 'S8 (column)')) else 'rest:' + k] += v
print(sorted(fold.items(), key=lambda kv: -kv[1]))
