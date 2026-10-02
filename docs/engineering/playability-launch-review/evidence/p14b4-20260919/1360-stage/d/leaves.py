#!/usr/bin/env python3
"""1360-D helper: list every leaf of a vitest JSON report as  status <TAB> file <TAB> title <TAB> first message line.

Read-only. With two reports, prints only the leaves whose status or first message line differs, and the leaves
present in one report only. Messages are cut at the first newline, as the classifications quote them.
usage: python3 leaves.py <a.json> [<b.json>]
"""
import json
import sys


def load(path):
    d = json.load(open(path))
    out = {}
    for f in d['testResults']:
        name = f['name']
        short = name[name.index('tests/'):] if 'tests/' in name else name
        if not f.get('assertionResults') and f.get('message'):
            out[(short, '<file>')] = ('fail', f['message'].split('\n')[0])
        for a in f.get('assertionResults', []):
            msgs = a.get('failureMessages') or []
            first = msgs[0].split('\n')[0] if msgs else ''
            out[(short, a['title'])] = (a['status'], first)
    totals = (d.get('numFailedTests'), d.get('numPassedTests'), d.get('numTotalTests'))
    return out, totals


a, ta = load(sys.argv[1])
if len(sys.argv) == 2:
    for (f, t), (s, m) in sorted(a.items()):
        print(f'{s}\t{f}\t{t}\t{m}')
    print(f'totals failed/passed/total {ta}')
    sys.exit(0)
b, tb = load(sys.argv[2])
for k in sorted(set(a) | set(b)):
    if a.get(k) != b.get(k):
        print(f'== {k[0]} :: {k[1]}')
        print(f'   A: {a.get(k)}')
        print(f'   B: {b.get(k)}')
print(f'A totals {ta}; B totals {tb}')
