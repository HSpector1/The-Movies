#!/usr/bin/env python3
"""1360-D helper: check every row of a P15C classification against a vitest JSON report.

For each row: the measured status must match `atRed` (pass, or fail with or without a note), and when
`firstMessageAtRed` is set, the measured first message line must equal it. Read-only.
usage: python3 check-r8-vs-s10.py <classification.json> <vitest.json>
"""
import json
import sys

rows = json.load(open(sys.argv[1]))
d = json.load(open(sys.argv[2]))
measured = {}
for f in d['testResults']:
    short = f['name'][f['name'].index('tests/'):]
    for a in f.get('assertionResults', []):
        msgs = a.get('failureMessages') or []
        measured[(short, a['title'])] = (a['status'], msgs[0].split('\n')[0] if msgs else None)
bad = 0
seen = set()
for r in rows:
    key = (r['file'], r['leaf'])
    seen.add(key)
    if key not in measured:
        print('NOT MEASURED', key)
        bad += 1
        continue
    status, first = measured[key]
    want = 'passed' if r['atRed'].startswith('pass') else 'failed'
    if status != want:
        print('STATUS', key, 'classified', r['atRed'], 'measured', status)
        bad += 1
    if r.get('firstMessageAtRed') is not None and r['firstMessageAtRed'] != first:
        print('MESSAGE', key)
        print('   classified:', r['firstMessageAtRed'])
        print('   measured:  ', first)
        bad += 1
for key in sorted(set(measured) - seen):
    print('UNCLASSIFIED', key)
    bad += 1
print(f'rows {len(rows)}; measured {len(measured)}; mismatches {bad}')
