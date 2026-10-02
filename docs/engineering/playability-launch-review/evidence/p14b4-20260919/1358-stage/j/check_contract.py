#!/usr/bin/env python3
"""1358-J independent check of the projection-57 artifacts. Reads git blobs from the scratch
repo (tags base and step4) and prints. Writes nothing."""
import hashlib, json, struct, subprocess, sys

REPO = '/Users/zacheryspector/studio-scratch/1358-j/tree'
LOCK = '/Users/zacheryspector/studio-scratch/1358-j/package-lock.head.json'


def blob(rev, path):
    return subprocess.run(['git', '-C', REPO, 'show', f'{rev}:{path}'], capture_output=True, check=True).stdout


def compact(v):
    return json.dumps(v, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def pretty(v):
    return json.dumps(v, indent=2, sort_keys=True, ensure_ascii=False) + '\n'


def ident(v):
    return 'sha256:' + hashlib.sha256(compact(v).encode('utf-8')).hexdigest()


SOURCES = ['bridge/schema/bridge-schema.ts', 'bridge/schema/industry-schema.ts', 'bridge/schema/intent-schema.ts',
           'bridge/schema/canonical.ts', 'bridge/schema/dsl.ts', 'package-lock.json', 'package.json',
           'scripts/bridge-contract-csharp.ts', 'scripts/generate-bridge-contract.ts']


def bundle(rev):
    data = b'PROJECT_STUDIO_CF09_SOURCE_BUNDLE_V1' + b'\x00' + struct.pack('>I', len(SOURCES))
    for path in sorted(SOURCES):
        raw = open(LOCK, 'rb').read() if path == 'package-lock.json' else blob(rev, path)
        p = path.encode('utf-8')
        data += struct.pack('>I', len(p)) + p + struct.pack('>Q', len(raw)) + raw
    return hashlib.sha256(data).hexdigest()


def diff_tree(a, b, path=''):
    out = []
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a:
                out.append(f'+ {path}/{k}')
            elif k not in b:
                out.append(f'- {path}/{k}')
            else:
                out += diff_tree(a[k], b[k], f'{path}/{k}')
    elif a != b:
        out.append(f'~ {path}: {json.dumps(a)[:80]} -> {json.dumps(b)[:80]}')
    return out


for rev in ['base', 'step4']:
    text = blob(rev, 'bridge/schema/project-studio-bridge.schema.json').decode('utf-8')
    schema = json.loads(text)
    man_text = blob(rev, 'generated/unity/project-studio-bridge.contract-manifest.json').decode('utf-8')
    man = json.loads(man_text)
    cs = blob(rev, 'generated/unity/StudioBridgeDtos.Generated.cs')
    print(f'== {rev}')
    print(' schema round-trips:', pretty(schema) == text, ' bytes', len(text.encode('utf-8')))
    print(' schemaId == manifest:', ident(schema) == man['schemaId'], ident(schema))
    print(' C# sha256 == manifest ts/unity:', hashlib.sha256(cs).hexdigest() == man['typescriptGeneratedContractSha256'] == man['unityGeneratedContractSha256'], len(cs))
    print(' C# header names schemaId:', f'// Schema identity: {man["schemaId"]}\n'.encode() in cs)
    print(' C# ProjectionVersion line:', f'        public const int ProjectionVersion = {man["projectionVersion"]};\n'.encode() in cs)
    print(' bundle sha256 == manifest:', bundle(rev) == man['generatorSourceSha256'], bundle(rev))
    print(' manifest round-trips:', pretty(man) == man_text)

old = json.loads(blob('base', 'bridge/schema/project-studio-bridge.schema.json'))
new = json.loads(blob('step4', 'bridge/schema/project-studio-bridge.schema.json'))
print('== structural schema delta base -> step4')
for line in diff_tree(old, new):
    print(' ', line)
print('StudioRelationshipLabel:', compact(new['$defs']['StudioRelationshipLabel']))
print('StudioRelationshipRomance:', compact(new['$defs']['StudioRelationshipRomance']))
print('row.labels:', compact(new['$defs']['StudioRelationshipRow']['properties']['labels']))
print('row.romance:', compact(new['$defs']['StudioRelationshipRow']['properties']['romance']))
print('row.required:', new['$defs']['StudioRelationshipRow']['required'])
print('outgoing56 id registered in step4 runtime-checkpoint:', ident(old).encode() in blob('step4', 'bridge/runtime-checkpoint.ts'))
