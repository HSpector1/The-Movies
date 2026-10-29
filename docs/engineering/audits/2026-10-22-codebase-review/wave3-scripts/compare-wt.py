"""Compare a vitest JSON report from the rebase worktree against the recorded baseline keys; group new failures by file.
usage: compare-wt.py <report.json> <baseline.txt> [msgwidth]"""
import json, re, sys
d = json.load(open(sys.argv[1])); base = set(l.rstrip() for l in open(sys.argv[2])); W = int(sys.argv[3]) if len(sys.argv) > 3 else 300
print({k: d[k] for k in d if k.startswith('num')})
strip = lambda p: re.split(r'/(?:The-Movies-headless-program|p16-rebase-20261024-wt|p16-c01-red-wt)/', p)[-1]
known, new = [], {}
for r in d['testResults']:
    f = strip(r['name'])
    for a in r['assertionResults']:
        if a['status'] == 'failed':
            key = (f + ' :: ' + a['fullName'][:110]).rstrip()
            msg = (a.get('failureMessages') or [''])[0]
            if key in base: known.append((f, a['fullName']))
            else: new.setdefault(f, []).append((a['fullName'], msg))
    if r.get('status') == 'failed' and not any(a['status'] == 'failed' for a in r['assertionResults']):
        new.setdefault(f, []).append(('<file failed before its tests ran (load or beforeAll)>', r.get('message') or ''))
print('known baseline failures reproduced:', len(known), 'in', len(set(f for f, _ in known)), 'files')
print('NEW failures:', sum(len(v) for v in new.values()), 'in', len(new), 'files')
for f in sorted(new):
    print(f'\n## {f} ({len(new[f])})')
    for n, m in new[f]:
        first = ' | '.join(l.strip() for l in m.splitlines() if l.strip())[:W]
        print(f'  - {n[:120]}\n      {first}')
