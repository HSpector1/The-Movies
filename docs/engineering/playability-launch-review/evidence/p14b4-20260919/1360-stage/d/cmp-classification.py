#!/usr/bin/env python3
"""1360-D helper: compare the P15C r7 and r8 classifications as parsed JSON, row by row and field by field.

Read-only. Prints every row whose fields differ, with r7 and r8 values, then a summary.
usage: python3 cmp-classification.py <r7.json> <r8.json>
"""
import json
import sys

r7 = json.load(open(sys.argv[1]))
r8 = json.load(open(sys.argv[2]))
assert len(r7) == len(r8), (len(r7), len(r8))
changed = []
for i, (a, b) in enumerate(zip(r7, r8)):
    assert (a['file'], a['leaf']) == (b['file'], b['leaf']), (i, a['leaf'], b['leaf'])
    keys = sorted(set(a) | set(b))
    diffs = [k for k in keys if a.get(k, '<absent>') != b.get(k, '<absent>')]
    if diffs:
        changed.append(a['leaf'])
        print(f'== row {i} {a["file"]} :: {a["leaf"]}')
        for k in diffs:
            print(f'  [{k}]')
            print(f'    r7: {json.dumps(a.get(k, "<absent>"))}')
            print(f'    r8: {json.dumps(b.get(k, "<absent>"))}')
print(f'rows {len(r7)}; changed {len(changed)}: {changed}')
