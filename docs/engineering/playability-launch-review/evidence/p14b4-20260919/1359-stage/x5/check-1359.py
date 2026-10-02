"""1359-X5 check: compare each classified P15C leaf's outcome with the r6 classification, at the RED commit or at
reference r4, and list leaves the classification does not name.
usage: python3 check-1359.py <classification.json> <vitest json> red|ref   Exit 1 on any mismatch or missing row."""
import json
import sys

cls = json.load(open(sys.argv[1]))
run = json.load(open(sys.argv[2]))
mode = sys.argv[3]
field = {'red': 'atRed', 'ref': 'atReferenceR4'}[mode]

results = {}
for f in run['testResults']:
    file = 'tests/' + f['name'].split('/tests/')[-1]
    for a in f['assertionResults']:
        results.setdefault((file, a['title']), []).append(a)


def first_line(a):
    msgs = a.get('failureMessages') or []
    return msgs[0].splitlines()[0].strip() if msgs else ''


bad, seen = [], set()
for r in cls:
    key = (r['file'], r['leaf'])
    seen.add(key)
    hits = results.get(key, [])
    if len(hits) != 1:
        bad.append(('MISSING' if not hits else f'AMBIGUOUS x{len(hits)}', r['file'].split('/')[-1], r['leaf'][:90]))
        continue
    a = hits[0]
    want = 'failed' if r[field].startswith('fail') else 'passed'
    if a['status'] != want:
        bad.append(('STATUS', r['leaf'][:80], f'want {want} got {a["status"]}', first_line(a)[:160]))
        continue
    if mode == 'red' and want == 'failed':
        exp = (r.get('firstMessageAtRed') or '').strip()
        got = first_line(a)
        if exp and not (got == exp or got.startswith(exp) or exp.startswith(got)):
            bad.append(('MESSAGE', r['leaf'][:80], 'want ' + exp[:150], 'got ' + got[:150]))
extra = [(k[0].split('/')[-1], k[1][:100], v[0]['status']) for k, v in results.items() if k not in seen]
totals = {}
for (file, _), v in results.items():
    for a in v:
        t = totals.setdefault(file.split('/')[-1], [0, 0])
        t[0 if a['status'] == 'failed' else 1] += 1
print(f'{mode}: per file (failed, passed):', dict(sorted(totals.items())))
print(f'{mode}: classified {len(cls)}, mismatches {len(bad)}, unclassified leaves {len(extra)}')
for b in bad:
    print('  ', b)
for e in extra:
    print('  UNCLASSIFIED', e)
sys.exit(1 if bad else 0)
