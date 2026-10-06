#!/usr/bin/env python3
"""Deterministic, closed regular-file archive for the 1369 diagnostic checkpoint."""
import gzip
import hashlib
import io
import json
import tarfile
from pathlib import Path

SCRATCH = Path('/Users/zacheryspector/studio-scratch')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
E = REPO / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
OUT = SCRATCH / '1369-checkpoint-20-archive-r1'
DIRS = [
    '1369-causal-p13a-original-proposal-r2',
    '1369-causal-p13a-original-proposal-r3',
    '1369-causal-p13a-original-recorded-runs-r2',
    '1369-causal-p13a-original-recorded-runs-r3',
    '1369-causal-p13a-package-independent-review-r1',
    '1369-causal-p13a-package-independent-review-r2',
    '1369-causal-p13a-package-independent-review-r3',
    '1369-causal-p13a-c0g-r3-types-independent-review-r1',
    '1369-causal-p13a-f6g-ag-r3-types-independent-review-r1',
    '1369-causal-p13a-abg-r3-types-independent-review-r1',
    '1369-causal-c0g-clean-independent-review-r1',
    '1369-causal-f6g-clean-independent-review-r1',
    '1369-causal-ag-clean-independent-review-r1',
    '1369-causal-abg-clean-independent-review-r1',
    '1369-causal-p13a-four-arm-comparator-proposal-r1',
    '1369-causal-p13a-four-arm-comparator-proposal-r2',
    '1369-causal-p13a-four-arm-comparator-independent-review-r1',
    '1369-causal-p13a-four-arm-comparator-independent-review-r2',
    '1369-causal-adoption-exploratory-proposal-r1',
    '1369-causal-adoption-exploratory-independent-review-r1',
    '1369-c0-preimage-replay-proposal-r6',
    '1369-c0-preimage-recorded-runs-r6',
    '1369-c0-preimage-proposal-independent-review-r2',
    '1369-c0-preimage-proposal-independent-review-r3',
    '1369-c0-preimage-proposal-independent-review-r4',
    '1369-c0-preimage-proposal-independent-review-r5',
    '1369-c0-preimage-proposal-independent-review-r6',
    '1369-c0-preimage-cap-amendment-r1',
    '1369-c0-preimage-cap-independent-review-r1',
    '1369-save46-empty-typed-probe-r2',
    '1369-save46-empty-typed-independent-review-r2',
    '1369-save46-empty-typed-external-launcher-proposal-r1',
    '1369-save46-empty-typed-external-launcher-independent-review-r1',
]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def collect():
    members = {}
    for dirname in DIRS:
        root = SCRATCH / dirname
        assert root.is_dir(), dirname
        for path in sorted(root.rglob('*')):
            if path.is_symlink() or '__pycache__' in path.parts or path.suffix == '.pyc':
                continue
            if path.is_dir():
                continue
            assert path.is_file(), f'unexpected object: {path}'
            name = 'scratch/' + dirname + '/' + str(path.relative_to(root))
            assert name not in members
            members[name] = path.read_bytes()
    lesson = SCRATCH / '1369-lessons-current.md'
    members['scratch/1369-lessons-current.md'] = lesson.read_bytes()
    formal = sorted(p for p in E.iterdir() if p.is_file() and
                    (p.name.startswith('1369-causal-p13a-clean-r2-') or
                     p.name.startswith('1369-causal-p13a-clean-r3-') or
                     p.name.startswith('1369-c0-preimage-r6-')))
    assert len(formal) == 50, f'expected ten five-file formal routes, got {len(formal)}'
    for path in formal:
        members['repo-formal/' + path.name] = path.read_bytes()
    return dict(sorted(members.items()))

def build(outpath):
    members = collect()
    index = {name: {'sha256': sha(data), 'bytes': len(data)} for name, data in members.items()}
    index_bytes = (json.dumps(index, sort_keys=True, separators=(',', ':')) + '\n').encode()
    members['MEMBERS.json'] = index_bytes
    with outpath.open('wb') as raw:
        with gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0, compresslevel=6) as gz:
            with tarfile.open(fileobj=gz, mode='w', format=tarfile.PAX_FORMAT) as tar:
                for name, data in sorted(members.items()):
                    entry = tarfile.TarInfo(name)
                    entry.size = len(data)
                    entry.mode = 0o644
                    entry.mtime = 0
                    entry.uid = entry.gid = 0
                    entry.uname = entry.gname = ''
                    tar.addfile(entry, io.BytesIO(data))
    return {'archiveSha256': sha(outpath.read_bytes()), 'membersSha256': sha(index_bytes),
            'members': len(index), 'logicalBytes': sum(len(x) for x in members.values()),
            'compressedBytes': outpath.stat().st_size, 'formalFiles': 50,
            'sourceDirs': DIRS}

if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    a = build(OUT / 'evidence.tar.gz')
    b = build(OUT / 'repeat.tar.gz')
    assert a == {**b}, 'repeat build differed'
    (OUT / 'MANIFEST.json').write_text(json.dumps(a, indent=2, sort_keys=True) + '\n')
    print(json.dumps(a, sort_keys=True))
