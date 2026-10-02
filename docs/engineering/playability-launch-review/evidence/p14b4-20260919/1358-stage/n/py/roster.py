#!/usr/bin/env python3
"""Recompute the prior-schema roster pins (length and sha256 of canonical compact JSON of the sorted
[id, label] pairs, one OLD_SCHEMA excluded) at base and at step 4, from bridge/runtime-checkpoint.ts read
with `git show`. Prints only. Method of the 1309-X3 ruling 5 comment (tests/bridge-p14p4p5-opportunities.test.ts:493-501)."""
import re, json, hashlib, subprocess
T = '/Users/zacheryspector/studio-scratch/1358-n/tree'
def roster(tag):
    src = subprocess.run(['git', '-C', T, 'show', f'{tag}:bridge/runtime-checkpoint.ts'], capture_output=True, text=True, check=True).stdout
    consts = {}
    for m in re.finditer(r"(?:export )?const (\w+)\s*=\s*\n?\s*'(sha256:[0-9a-f]{64})'", src):
        consts[m.group(1)] = m.group(2)
    body = src[src.index('SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS: ReadonlyMap'):]
    body = body[:body.index('])')]
    pairs = []
    for m in re.finditer(r"\[\s*(?:'(sha256:[0-9a-f]{64})'|(\w+))\s*,\s*'([^']+)'\s*\]", body):
        pairs.append([m.group(1) or consts[m.group(2)], m.group(3)])
    return pairs
sha = lambda s: hashlib.sha256(s.encode()).hexdigest()
canon = lambda v: json.dumps(v, separators=(',', ':'), ensure_ascii=False)
OLD55 = 'sha256:2c377b6fa3c559eee753e7a9d91d4956399cca1a5693edb15adb3de7c4f27158'
OLD54 = 'sha256:9c5bba3fcc58e857fe57e33623a86f096cd04e00547bea8f2dae3a656025b302'
for tag in ('base', 'step4'):
    r = roster(tag)
    print(tag, 'size', len(r), 'distinct', len({k for k, _ in r}))
    for old, name in ((OLD55, 'prior55 (excl. v55)'), (OLD54, 'p14p4p5 (excl. v54)')):
        older = sorted([p for p in r if p[0] != old], key=lambda p: p[0])
        print(f'  {name}: length {len(older)} sha {sha(canon(older))}')
