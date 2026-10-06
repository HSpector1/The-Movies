#!/usr/bin/env python3
"""Build a deterministic, exact-scope C0 observer/comparison archive."""

import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import stat
import tarfile

S = Path('/Users/zacheryspector/studio-scratch')
R = Path('/Users/zacheryspector/The-Movies-headless-program')
E = R / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
OUT = Path(__file__).resolve().parent
SCRATCH_NAMES = [
    '1370-c0-external-observer-proposal-r3',
    '1370-c0-observer-independent-review-r3',
    '1370-c0-observer-route-launcher-proposal-r1',
    '1370-c0-observer-route-launcher-independent-review-r1',
    '1370-c0-observer-route-launcher-proposal-r2',
    '1370-c0-observer-route-launcher-independent-review-r2',
    '1370-c0-observer-recorded-runs-r3',
    '1370-c0-observer-route-launches-r2',
    '1370-c0-observer-route-result-independent-review-r1',
    '1370-c0-observer-compare-proposal-r1',
    '1370-c0-observer-compare-independent-review-r1',
    '1370-c0-observer-compare-proposal-r2',
    '1370-c0-observer-compare-independent-review-r2',
    '1370-c0-observer-comparison-r2-output.json',
    '1370-c0-observer-comparison-independent-audit-r1',
]
REPO_NAMES = [
    '1370-C-c0-observer-recorded-exploratory.md',
    '1370-D-c0-observer-comparison.md',
    '1370-D-c0-observer-comparison-output.json',
    '1370-D-c0-observer-comparison-independent-review.md',
    '1370-D-c0-observer-comparison-independent-receipt.json',
]

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def name(path):
    try:
        return 'scratch/' + str(path.relative_to(S))
    except ValueError:
        return 'repo/' + str(path.relative_to(R))

def walk(path, collected):
    mode = path.lstat().st_mode
    if stat.S_ISDIR(mode):
        collected.append((path, 'dir', None))
        for child in sorted(path.iterdir(), key=lambda p: p.name):
            walk(child, collected)
    elif stat.S_ISREG(mode):
        collected.append((path, 'file', path.read_bytes()))
    elif stat.S_ISLNK(mode):
        collected.append((path, 'symlink', os.readlink(path)))
    else:
        raise RuntimeError(f'unsupported source object: {path}')

def tarinfo(member, kind, size=0, target=''):
    info = tarfile.TarInfo(member.rstrip('/') + ('/' if kind == 'dir' else ''))
    info.uid = info.gid = 0
    info.uname = info.gname = ''
    info.mode = 0o755 if kind == 'dir' else 0o644
    info.mtime = 0
    info.size = size
    info.type = {'dir': tarfile.DIRTYPE, 'file': tarfile.REGTYPE,
                 'symlink': tarfile.SYMTYPE}[kind]
    info.linkname = target
    return info

def main():
    roots = [S / item for item in SCRATCH_NAMES]
    roots += [E / item for item in REPO_NAMES]
    formals = sorted(E.glob('1370-c0-observer-r3-*-c0-observer-recorded-r1*'))
    if len(formals) != 20:
        raise RuntimeError(f'expected 20 exact formal files, found {len(formals)}')
    roots += formals
    roots += [S / 'heavy-queue/1370-c0-observer-route-r2-recorded-r1.log',
              S / 'heavy-queue/1370-c0-observer-route-r2-recorded-r1.log.meta']
    entries = []
    for root in roots:
        if not root.exists() or root.is_symlink():
            raise RuntimeError(f'missing/symlinked root: {root}')
        walk(root, entries)
    entries.sort(key=lambda row: name(row[0]))
    names = [name(row[0]) for row in entries]
    if len(names) != len(set(names)):
        raise RuntimeError('duplicate source membership')
    members = []
    archive = OUT / 'evidence.tar.gz'
    with archive.open('wb') as raw_out:
        with gzip.GzipFile(fileobj=raw_out, mode='wb', filename='', mtime=0,
                           compresslevel=6) as gz:
            with tarfile.open(fileobj=gz, mode='w|', format=tarfile.PAX_FORMAT) as tar:
                for path, kind, value in entries:
                    member = name(path)
                    if kind == 'file':
                        tar.addfile(tarinfo(member, kind, len(value)), io.BytesIO(value))
                        members.append({'name': member, 'kind': kind,
                                        'source': str(path), 'bytes': len(value),
                                        'sha256': sha(value)})
                    elif kind == 'symlink':
                        tar.addfile(tarinfo(member, kind, target=value))
                        members.append({'name': member, 'kind': kind,
                                        'source': str(path), 'target': value})
                    else:
                        tar.addfile(tarinfo(member, kind))
                        members.append({'name': member, 'kind': kind,
                                        'source': str(path)})
    for path, kind, value in entries:
        mode = path.lstat().st_mode
        if kind == 'file' and (not stat.S_ISREG(mode) or sha(path.read_bytes()) != sha(value)):
            raise RuntimeError(f'source changed during archive: {path}')
        if kind == 'symlink' and (not stat.S_ISLNK(mode) or os.readlink(path) != value):
            raise RuntimeError(f'link changed during archive: {path}')
        if kind == 'dir' and not stat.S_ISDIR(mode):
            raise RuntimeError(f'directory changed during archive: {path}')
    scope = {'schema': '1370-cd-exact-archive-scope-r1',
             'launchHead': 'ec81334589982378032bc21715c23dd09d88f201',
             'publishedPredecessor': '69e63af6cb4751b155c4ac280b7cb2d810fe639e',
             'scratchRoots': SCRATCH_NAMES, 'repoRoots': REPO_NAMES,
             'formalFiles': [p.name for p in formals],
             'laneFiles': [str(p.relative_to(S)) for p in roots[-2:]],
             'exclusions': []}
    scope_raw = (json.dumps(scope, sort_keys=True, indent=2) + '\n').encode()
    member_raw = (json.dumps(members, sort_keys=True, indent=2) + '\n').encode()
    (OUT / 'SCOPE.json').write_bytes(scope_raw)
    (OUT / 'MEMBERS.json').write_bytes(member_raw)
    manifest = {'schema': '1370-cd-evidence-archive-r1',
                'scopeSha256': sha(scope_raw), 'membersSha256': sha(member_raw),
                'archiveSha256': sha(archive.read_bytes()),
                'compressedBytes': archive.stat().st_size,
                'members': len(members),
                'regular': sum(m['kind'] == 'file' for m in members),
                'directories': sum(m['kind'] == 'dir' for m in members),
                'symlinks': sum(m['kind'] == 'symlink' for m in members),
                'logicalBytes': sum(m.get('bytes', 0) for m in members)}
    (OUT / 'MANIFEST.json').write_text(json.dumps(manifest, sort_keys=True, indent=2) + '\n')
    print(json.dumps(manifest, sort_keys=True))

if __name__ == '__main__':
    main()
