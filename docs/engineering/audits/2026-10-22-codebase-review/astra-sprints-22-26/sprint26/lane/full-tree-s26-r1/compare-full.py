"""Compare a vitest JSON report against a baseline JSON report (and optional name-list) for the Sprint 9 gate.
usage: python3 -I compare-full.py <report.json> <baseline.json> [<names.txt>] [budget_ms=5000]
Keys: relative file path + fullName. Messages compared after worktree-prefix normalization, first line and full text.
Classes: NEW (not in baseline), INHERITED-SAME (same first line), INHERITED-CHANGED (different first line),
MISSING-INPUT (ENOENT / no such file), LOAD-FAILURE (file failed before tests), BASELINE-NOT-REPRODUCED, OVER-BUDGET passes."""
import json, re, sys
rep, base = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
names = set(l.rstrip() for l in open(sys.argv[3])) if len(sys.argv) > 3 and '=' not in sys.argv[3] else set()
budget = next((int(a.split('=')[1]) for a in sys.argv[3:] if a.startswith('budget_ms=')), 5000)
skipfile = next((a.split('=',1)[1] for a in sys.argv[3:] if a.startswith('skip=')), None)
skipped = set(l.strip() for l in open(skipfile)) if skipfile else set()
PATHRE = re.compile(r"(?:ENOENT[^']*'|open ')([^']+)'")
def recoverable(msg):
    m = PATHRE.search(msg)
    if not m: return 'path-unparsed'
    rel = m.group(1).split('<WT>/')[-1]
    return 'SPARSE-EXCLUDED-TRACKED (recoverable from HEAD)' if rel in skipped else 'UNTRACKED (not recoverable here)'
PREFIX = re.compile(r'/Users/[^\s:]*?/(?:The-Movies-headless-program|p16-rebase-20261024-wt|p16-c01-red-wt|p16-retained-writing-20261026-wt|p16-rebase-r5-wt|p17-continuation-20261027-wt)/')
norm = lambda s: PREFIX.sub('<WT>/', s or '')
strip = lambda p: PREFIX.split(p)[-1]
def index(d):
    out, loads = {}, {}
    for r in d['testResults']:
        f = strip(r['name'])
        if r.get('status') == 'failed' and not any(a['status'] == 'failed' for a in r['assertionResults']):
            loads[f] = norm(r.get('message') or '')
        for a in r['assertionResults']:
            out[(f, a['fullName'])] = (a['status'], norm((a.get('failureMessages') or [''])[0]), a.get('duration'))
    return out, loads
R, Rload = index(rep); B, Bload = index(base)
first = lambda m: next((l.strip() for l in m.splitlines() if l.strip()), '')
ENOENT = re.compile(r'ENOENT|no such file', re.I)
cls = {k: [] for k in ('NEW', 'INHERITED-SAME', 'INHERITED-CHANGED', 'MISSING-INPUT', 'LOAD-FAILURE', 'BASELINE-NOT-REPRODUCED', 'OVER-BUDGET-PASS')}
for key, (st, msg, dur) in R.items():
    if st == 'failed':
        if ENOENT.search(msg): cls['MISSING-INPUT'].append((key, first(msg), recoverable(msg)))
        elif key not in B or B[key][0] != 'failed': cls['NEW'].append((key, first(msg)))
        elif first(B[key][1]) == first(msg): cls['INHERITED-SAME'].append((key, first(msg)))
        else: cls['INHERITED-CHANGED'].append((key, first(msg), first(B[key][1])))
    elif st == 'passed' and dur is not None and dur > budget: cls['OVER-BUDGET-PASS'].append((key, round(dur, 3)))
for f, m in Rload.items(): cls['LOAD-FAILURE'].append(((f, '<load>'), first(m)))
for key, (st, msg, dur) in B.items():
    if st == 'failed' and key in R and R[key][0] == 'passed': cls['BASELINE-NOT-REPRODUCED'].append((key, first(msg)))
print({k: rep[k] for k in rep if k.startswith('num')})
print({k: len(v) for k, v in cls.items()}, 'report tests', len(R), 'baseline tests', len(B), 'in both', len(set(R) & set(B)))
if names:
    nkeys = set(f"{f} :: {n[:110]}".rstrip() for (f, n), (st, _, _) in R.items() if st == 'failed')
    print('failed keys in name baseline:', len(nkeys & names), 'not in name baseline:', len(nkeys - names))
for k in ('NEW', 'INHERITED-CHANGED', 'LOAD-FAILURE', 'MISSING-INPUT'):
    if cls[k]:
        print(f'\n## {k} ({len(cls[k])})')
        for row in sorted(cls[k], key=lambda r: r[0]):
            print(f'  - {row[0][0]} :: {row[0][1][:110]}\n      {row[1][:220]}' + (f'\n      {"baseline: " if k=="INHERITED-CHANGED" else ""}{row[2][:220]}' if len(row) > 2 else ''))
print(f"\n## OVER-BUDGET-PASS ({len(cls['OVER-BUDGET-PASS'])}) max", max([r[1] for r in cls['OVER-BUDGET-PASS']] or [0]))
print(f"## BASELINE-NOT-REPRODUCED ({len(cls['BASELINE-NOT-REPRODUCED'])})")
for row in sorted(cls['BASELINE-NOT-REPRODUCED'])[:200]: print(f'  - {row[0][0]} :: {row[0][1][:100]}')
