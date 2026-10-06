#!/usr/bin/env python3
"""Independent readback and byte-for-byte repeat of checkpoint 20 archive."""
import ast
import gzip
import hashlib
import io
import json
import tarfile
from collections import Counter
from pathlib import Path, PurePosixPath

ROOT = Path('/Users/zacheryspector/studio-scratch/1369-checkpoint-20-archive-r1')
OUT = Path('/Users/zacheryspector/studio-scratch/1369-checkpoint-20-archive-independent-review-r1')
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
FORMAL = REPO / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'

def sha(data):
    return hashlib.sha256(data).hexdigest()

manifest_bytes = (ROOT / 'MANIFEST.json').read_bytes()
manifest = json.loads(manifest_bytes)
source = ast.parse((ROOT / 'build.py').read_text())
dirs = next(ast.literal_eval(n.value) for n in source.body if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'DIRS' for t in n.targets))
assert dirs == manifest['sourceDirs'] and len(dirs) == len(set(dirs))
assert all('/' not in d and d != '..' for d in dirs)
formal_paths = sorted(p for p in FORMAL.iterdir() if p.is_file() and
    (p.name.startswith('1369-causal-p13a-clean-r2-') or p.name.startswith('1369-causal-p13a-clean-r3-') or p.name.startswith('1369-c0-preimage-r6-')))
assert len(formal_paths) == 50
formal_stems = Counter(p.name.rsplit('.',1)[0].removesuffix('-preflight').removesuffix('-postflight') for p in formal_paths)
assert len(formal_stems) == 10 and all(c == 5 for c in formal_stems.values())
assert any('r2-c0g-types' in s for s in formal_stems)
assert any('r6-historical-types' in s for s in formal_stems)
assert len([s for s in formal_stems if 'r3-' in s]) == 8
route_status = {}
for stem in sorted(formal_stems):
    result = json.loads((FORMAL / f'{stem}.json').read_text())
    want = 2 if ('r2-c0g-types' in stem or 'r6-historical-types' in stem) else 0
    assert result['exitCode'] == want, (stem, result['exitCode'], want)
    route_status[stem] = want

expected = {}
excluded_symlinks = []
excluded_cache = []
for dirname in dirs:
    root = SCRATCH / dirname
    assert root.is_dir() and not root.is_symlink()
    for path in root.rglob('*'):
        rel = path.relative_to(root)
        if path.is_symlink():
            excluded_symlinks.append(f'{dirname}/{rel}')
            continue
        if '__pycache__' in path.parts or path.suffix == '.pyc':
            excluded_cache.append(f'{dirname}/{rel}')
            continue
        if path.is_dir():
            continue
        assert path.is_file(), str(path)
        name = f'scratch/{dirname}/{rel.as_posix()}'
        assert name not in expected
        expected[name] = path.read_bytes()
expected['scratch/1369-lessons-current.md'] = (SCRATCH / '1369-lessons-current.md').read_bytes()
for path in formal_paths:
    name = f'repo-formal/{path.name}'
    assert name not in expected
    expected[name] = path.read_bytes()
assert len(expected) == 3047 == manifest['members']
idx_bytes = (json.dumps({n: {'bytes':len(b), 'sha256':sha(b)} for n,b in sorted(expected.items())}, sort_keys=True, separators=(',',':')) + '\n').encode()
assert sha(idx_bytes) == manifest['membersSha256']

archive_bytes = (ROOT / 'evidence.tar.gz').read_bytes()
repeat_bytes = (ROOT / 'repeat.tar.gz').read_bytes()
assert sha(archive_bytes) == sha(repeat_bytes) == manifest['archiveSha256'] == 'e06cd73d4fbe10b2195d50d9fd88443baa96190969e259d2650762529762edb0'
assert len(archive_bytes) == manifest['compressedBytes']
with tarfile.open(fileobj=io.BytesIO(archive_bytes), mode='r:gz') as tar:
    got = tar.getmembers()
    names = [m.name for m in got]
    assert len(got) == len(expected)+1 and len(names) == len(set(names))
    assert names == sorted(names)
    assert set(names) == set(expected) | {'MEMBERS.json'}
    for m in got:
        posix = PurePosixPath(m.name)
        assert m.isfile() and not m.issym() and not m.islnk()
        assert not posix.is_absolute() and '..' not in posix.parts and '\\' not in m.name
        assert m.uid == 0 and m.gid == 0 and m.mtime == 0 and m.mode == 0o644
        content = tar.extractfile(m).read()
        source_bytes = idx_bytes if m.name == 'MEMBERS.json' else expected[m.name]
        assert content == source_bytes, m.name
        assert len(content) == m.size
assert sum(map(len, expected.values())) + len(idx_bytes) == manifest['logicalBytes']

with (OUT / 'independent-repeat.tar.gz').open('wb') as raw:
    with gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0, compresslevel=6) as gz:
        with tarfile.open(fileobj=gz, mode='w', format=tarfile.PAX_FORMAT) as tar:
            for name in sorted([*expected, 'MEMBERS.json']):
                data = idx_bytes if name == 'MEMBERS.json' else expected[name]
                info = tarfile.TarInfo(name)
                info.size = len(data)
                info.mode = 0o644
                info.mtime = 0
                info.uid = info.gid = 0
                info.uname = info.gname = ''
                tar.addfile(info, io.BytesIO(data))
independent_repeat_sha = sha((OUT / 'independent-repeat.tar.gz').read_bytes())
assert independent_repeat_sha == manifest['archiveSha256']
receipt = {
    'verdict': 'ACCEPT',
    'archiveSha256': sha(archive_bytes),
    'manifestSha256': sha(manifest_bytes),
    'builderSha256': sha((ROOT / 'build.py').read_bytes()),
    'membersIndexSha256': sha(idx_bytes),
    'independentRepeatSha256': independent_repeat_sha,
    'regularMembers': len(expected),
    'logicalBytes': manifest['logicalBytes'],
    'formalFiles': len(formal_paths),
    'formalRoutes': route_status,
    'excludedSymlinks': excluded_symlinks,
    'excludedCacheEntries': len(excluded_cache),
    'noMissingOrExtra': True,
    'allSourceBytesMatched': True,
    'tarPathsSafeAndRegular': True,
}
(OUT / 'RECEIPT.json').write_text(json.dumps(receipt, sort_keys=True, indent=2)+'\n')
print(json.dumps(receipt, sort_keys=True))
