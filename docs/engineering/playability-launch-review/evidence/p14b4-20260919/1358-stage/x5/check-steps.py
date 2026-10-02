"""1358-X5 check: compare each classified RED row's outcome after production step k with 1358-E's
"What each step leaves red" lists, and list every failure outside the classified rows (sweep fallout).
usage: python3 check-steps.py <classification.json> <vitest json> <step 1-4>
Row numbers follow 1358-E (0-96, r6/r7 order); r8's three inserted rows are mapped below. Exit 1 on any classified mismatch."""
import json
import sys

cls = json.load(open(sys.argv[1]))
run = json.load(open(sys.argv[2]))
step = int(sys.argv[3])
r = lambda a, b: set(range(a, b + 1))
STEP1 = {3, 11, 28, 46, 47, 54} | r(5, 8) | r(12, 23) | r(49, 52) | r(56, 59) | r(60, 73) | r(75, 86) | r(89, 92) | {94, 95}
RED7 = {
    1: STEP1,
    2: STEP1 - (r(5, 8) | {11} | r(12, 23) | {28}),
    3: {46, 47, 54} | r(49, 52) | r(56, 58),
    4: r(56, 58),
}[step]
# The sets above use 1358-E's numbering (r6/r7, 97 rows). r8 (100 rows) inserts its three save-v44 rows at 41-43 and
# keeps r7's order (checked by the parent), so an r7 index i >= 41 is r8 index i + 3. The new rows pass from step 1.
if len(cls) == 100:
    RED = {i if i < 41 else i + 3 for i in RED7}
elif len(cls) == 97:
    RED = RED7
else:
    sys.exit(f'unexpected classification length {len(cls)}')

results = {}
for f in run['testResults']:
    file = 'tests/' + f['name'].split('/tests/')[-1]
    for a in f['assertionResults']:
        results[(file, ' > '.join(a['ancestorTitles'] + [a['title']]))] = a


def first_line(a):
    msgs = a.get('failureMessages') or []
    return msgs[0].splitlines()[0].strip() if msgs else ''


bad, seen = [], set()
for i, row in enumerate(cls):
    key = (row['file'], row['leaf'])
    seen.add(key)
    a = results.get(key)
    want = 'failed' if i in RED else 'passed'
    if a is None:
        bad.append((i, 'MISSING', row['leaf'][:100]))
    elif a['status'] != want:
        bad.append((i, f'want {want} got {a["status"]}', row['leaf'][:90], first_line(a)[:160]))
extra = [(k[0].split('/')[-1], k[1][:110], first_line(a)[:160]) for k, a in results.items()
         if k not in seen and a['status'] == 'failed']
totals = {}
for (file, _), a in results.items():
    t = totals.setdefault(file.split('/')[-1], [0, 0])
    t[0 if a['status'] == 'failed' else 1] += 1
print(f'step {step}: per file (failed, passed):', dict(sorted(totals.items())))
print(f'step {step}: classified rows {len(cls)}, expected red {len(RED)}, mismatches {len(bad)}, unclassified failures {len(extra)}')
for b in bad:
    print('  MISMATCH', b)
for e in extra:
    print('  UNCLASSIFIED FAILURE', e)
sys.exit(1 if bad else 0)
