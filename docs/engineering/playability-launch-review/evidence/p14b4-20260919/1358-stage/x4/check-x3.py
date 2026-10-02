"""1358-X3 check: compare each classified leaf's X3 outcome and first message with the staged classification.
usage: python3 check-x3.py <classification.json> <x3 vitest json>   Prints a summary and every mismatch; exit 1 on any."""
import json, sys

cls = json.load(open(sys.argv[1]))
run = json.load(open(sys.argv[2]))
results = {}
for f in run['testResults']:
    file = 'tests/' + f['name'].split('/tests/')[-1]
    for a in f['assertionResults']:
        results[(file, ' > '.join(a['ancestorTitles'] + [a['title']]))] = a


def first_line(a):
    msgs = a.get('failureMessages') or []
    return msgs[0].splitlines()[0].strip() if msgs else ''


missing, status_bad, message_bad, ok = [], [], [], 0
for r in cls:
    a = results.get((r['file'], r['leaf']))
    if a is None:
        missing.append(r['leaf'][:110])
        continue
    want = r['expectedX3']
    if a['status'] != want:
        status_bad.append((r['leaf'][:90], want, a['status'], first_line(a)[:160]))
        continue
    if want == 'failed':
        exp = (r.get('expectedFirstMessage') or '').strip()
        got = first_line(a)
        if exp and not (got == exp or got.startswith(exp) or exp.startswith(got)):
            message_bad.append((r['leaf'][:90], exp[:160], got[:160]))
            continue
    ok += 1
totals = {}
for (file, _), a in results.items():
    t = totals.setdefault(file, [0, 0])
    t[0 if a['status'] == 'failed' else 1] += 1
print('per file (failed, passed):', {k.split('/')[-1]: v for k, v in sorted(totals.items())})
print('total failed', sum(v[0] for v in totals.values()), 'passed', sum(v[1] for v in totals.values()))
print(f'classified {len(cls)}: ok {ok}, missing {len(missing)}, status mismatches {len(status_bad)}, message mismatches {len(message_bad)}')
for m in missing: print('MISSING', m)
for s in status_bad: print('STATUS', s)
for m in message_bad: print('MESSAGE', m)
sys.exit(1 if (missing or status_bad or message_bad) else 0)
