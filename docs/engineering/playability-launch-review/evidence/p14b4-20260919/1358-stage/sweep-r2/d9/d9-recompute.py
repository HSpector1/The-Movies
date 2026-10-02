"""1358-D9 recomputations, read-only.

1. The two older-roster digests, by the method the pins state
   (tests/bridge-p14p4p5-opportunities.test.ts:499-508): parse the literal [hash, label]
   pairs of SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS (named constants resolved), drop
   OLD_SCHEMA, sort by key, sha256 of json.dumps(..., separators=(',', ':')).
2. The schema identity: sha256 of the key-sorted compact JSON of
   bridge/schema/project-studio-bridge.schema.json (schemaIdentity, bridge/schema/canonical.ts:22-24).
3. The 1221 capture pins the D13/D12 loader uses.

Reads the merge worktree through `git show` and E's 1221 capture by exact path.
"""
import gzip
import hashlib
import json
import re
import subprocess

W = '/Users/zacheryspector/studio-scratch/1358-sweep/merge'
E = ('/Users/zacheryspector/The-Movies-headless-program/docs/engineering/'
     'playability-launch-review/evidence/p14b4-20260919/1221-p4p5-outgoing-capture/')
OLD = {
    'prior55 (bridge-p14r2r3-prior55:183)': 'sha256:2c377b6fa3c559eee753e7a9d91d4956399cca1a5693edb15adb3de7c4f27158',
    'p14p4p5 (bridge-p14p4p5-opportunities:512)': 'sha256:9c5bba3fcc58e857fe57e33623a86f096cd04e00547bea8f2dae3a656025b302',
}


def show(rev, path, text=True):
    return subprocess.run(['git', '-C', W, 'show', f'{rev}:{path}'],
                          capture_output=True, text=text, check=True).stdout


def roster(src):
    consts = dict(re.findall(r"const\s+([A-Z0-9_]+)\s*=\s*\n?\s*'(sha256:[0-9a-f]{64})'", src))
    start = src.index('SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS: ReadonlyMap<string, string> = new Map<string, string>([')
    body = src[start:src.index('\n])', start)]
    body = '\n'.join(l for l in body.split('\n') if not l.strip().startswith('//'))
    pairs = re.findall(r"\[\s*(?:'(sha256:[0-9a-f]{64})'|([A-Z0-9_]+))\s*,\s*'([^']+)'\s*\]", body)
    return [[lit or consts[name], label] for lit, name, label in pairs]


def sha(data):
    return hashlib.sha256(data).hexdigest()


for rev in ['24f631b', 'step4']:
    pairs = roster(show(rev, 'bridge/runtime-checkpoint.ts'))
    assert len({k for k, _ in pairs}) == len(pairs), 'duplicate roster key'
    print(f'{rev}: roster entries {len(pairs)}')
    for name, old in OLD.items():
        older = sorted((p for p in pairs if p[0] != old), key=lambda p: p[0])
        print(f'  {name}: length {len(older)}, sha256 {sha(json.dumps(older, separators=(",", ":")).encode())}')
    schema = json.loads(show(rev, 'bridge/schema/project-studio-bridge.schema.json'))
    canon = json.dumps(schema, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
    manifest = json.loads(show(rev, 'generated/unity/project-studio-bridge.contract-manifest.json'))
    print(f'  schema identity sha256:{sha(canon)}; manifest schemaId {manifest["schemaId"]}')

base = roster(show('24f631b', 'bridge/runtime-checkpoint.ts'))
step4 = roster(show('step4', 'bridge/runtime-checkpoint.ts'))
print('roster added:', [p for p in step4 if p not in base], 'removed:', [p for p in base if p not in step4])

print('MANIFEST.json', sha(open(E + 'MANIFEST.json', 'rb').read()))
for name in ['director-bound-week52', 'director-waived-week61']:
    zipped = open(E + name + '.json.gz', 'rb').read()
    raw = gzip.decompress(zipped)
    save = json.loads(raw)
    edges = save['state']['relationships']
    director = [(p['promiseId'], p['outcome']) for p in save['state']['promises']
                if isinstance(p.get('predicate'), dict) and p['predicate'].get('kind') == 'directorCount']
    print(f'{name}: gz {sha(zipped)} raw {sha(raw)} saveVersion {save["saveVersion"]} '
          f'tick {save["state"]["market"]["tick"]} edges {len(edges)} '
          f'keyed {sum(1 for e in edges if "romance" in e or "competitions" in e)} directorCount {director}')
