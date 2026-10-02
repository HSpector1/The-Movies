#!/usr/bin/env python3
"""1360-D helper: compare two producer MANIFEST.json files field by field, ignoring run-specific fields.

Ignored by default: executionHead, elapsedMs, routeMs (and anything under them). Prints each differing field and exits
1 if any differ, else 0. Read-only. Use it to check a recorded mint against 1360-X before the next step:
  python3 cmp-manifest.py E/1360-stage/x/x-genuine-below-p15-save-step-MANIFEST.json tests/fixtures/p15/genuine-below-p15-save-step/MANIFEST.json
usage: python3 cmp-manifest.py <expected.json> <actual.json> [ignored-key ...]
"""
import json
import sys

IGNORED = set(sys.argv[3:]) or {'executionHead', 'elapsedMs', 'routeMs'}


def flat(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items():
            if k not in IGNORED:
                yield from flat(v, f'{path}.{k}')
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from flat(v, f'{path}[{i}]')
    else:
        yield path, o


a = dict(flat(json.load(open(sys.argv[1]))))
b = dict(flat(json.load(open(sys.argv[2]))))
diff = sorted(k for k in set(a) | set(b) if a.get(k, '<absent>') != b.get(k, '<absent>'))
for k in diff:
    print(f'{k}: expected {a.get(k, "<absent>")!r}, actual {b.get(k, "<absent>")!r}')
print(f'{len(a)} fields compared (ignoring {sorted(IGNORED)}); {len(diff)} differ')
sys.exit(1 if diff else 0)
