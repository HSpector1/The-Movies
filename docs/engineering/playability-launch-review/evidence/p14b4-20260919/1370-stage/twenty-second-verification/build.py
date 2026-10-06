#!/usr/bin/env python3
"""Build the 1370-B evidence archive from an externally pinned exact scope."""

import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import stat
import sys
import tarfile


REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
OUT = Path(__file__).resolve().parent


def digest(data):
    return hashlib.sha256(data).hexdigest()


def member_name(path):
    path = Path(path)
    for prefix, root in (('repo', REPO), ('scratch', SCRATCH)):
        try:
            return prefix + '/' + str(path.relative_to(root))
        except ValueError:
            pass
    raise ValueError(f'outside approved roots: {path}')


def tar_info(name, kind, size=0, link=''):
    info = tarfile.TarInfo(name)
    info.uid = info.gid = 0
    info.uname = info.gname = ''
    info.mtime = 0
    info.mode = 0o755 if kind == 'dir' else 0o644
    info.size = size
    info.type = {'dir': tarfile.DIRTYPE, 'file': tarfile.REGTYPE,
                 'symlink': tarfile.SYMTYPE}[kind]
    info.linkname = link
    return info


def main():
    if len(sys.argv) != 3:
        raise SystemExit('usage: build.py SCOPE.json EXPECTED_SCOPE_SHA256')
    scope_path = Path(sys.argv[1])
    raw = scope_path.read_bytes()
    scope_sha = digest(raw)
    if scope_sha != sys.argv[2]:
        raise RuntimeError('scope SHA mismatch')
    scope = json.loads(raw)
    if scope['schema'] != '1370-b-evidence-archive-scope-proposal-r5':
        raise RuntimeError('wrong scope version')
    expected_cache_exclusions = {
        '/Users/zacheryspector/studio-scratch/1369-save46-empty-typed-external-launcher-recorded-r5/package/runs/direct-r6/vitest-cache',
        '/Users/zacheryspector/studio-scratch/1369-save46-empty-typed-external-launcher-recorded-r6/package/runs/direct-r6/vitest-cache',
    }
    if scope['missingExpected'] or set(scope['excludedFound']) != expected_cache_exclusions:
        raise RuntimeError('scope missing members or cache exclusions changed')

    entries = []
    for source in scope['directories']:
        mode = os.lstat(source).st_mode
        if not stat.S_ISDIR(mode):
            raise RuntimeError(f'directory changed: {source}')
        entries.append((member_name(source), 'dir', source, None))
    for source, expected in scope['regularFiles'].items():
        mode = os.lstat(source).st_mode
        if not stat.S_ISREG(mode):
            raise RuntimeError(f'file changed type: {source}')
        data = Path(source).read_bytes()
        if len(data) != expected['bytes'] or digest(data) != expected['sha256']:
            raise RuntimeError(f'file changed bytes: {source}')
        entries.append((member_name(source), 'file', source, data))
    for source, target in scope['symlinks'].items():
        mode = os.lstat(source).st_mode
        if not stat.S_ISLNK(mode) or os.readlink(source) != target:
            raise RuntimeError(f'symlink changed: {source}')
        entries.append((member_name(source), 'symlink', source, target))
    entries.sort(key=lambda entry: entry[0])
    names = [entry[0] for entry in entries]
    if len(names) != len(set(names)) or len(names) != scope['counts']['members']:
        raise RuntimeError('duplicate or incomplete archive names')

    members = []
    tar_path = OUT / 'evidence.tar.gz'
    with tar_path.open('wb') as raw_out:
        with gzip.GzipFile(filename='', mode='wb', fileobj=raw_out, mtime=0,
                           compresslevel=6) as gz:
            with tarfile.open(mode='w|', fileobj=gz, format=tarfile.PAX_FORMAT) as tar:
                for name, kind, source, value in entries:
                    if kind == 'file':
                        tar.addfile(tar_info(name, kind, len(value)), io.BytesIO(value))
                        members.append({'name': name, 'kind': kind, 'bytes': len(value),
                                        'sha256': digest(value), 'source': source})
                    elif kind == 'symlink':
                        tar.addfile(tar_info(name, kind, link=value))
                        members.append({'name': name, 'kind': kind, 'target': value,
                                        'source': source})
                    else:
                        tar.addfile(tar_info(name.rstrip('/') + '/', kind))
                        members.append({'name': name, 'kind': kind, 'source': source})

    members_bytes = (json.dumps(members, sort_keys=True, indent=2) + '\n').encode()
    (OUT / 'MEMBERS.json').write_bytes(members_bytes)
    (OUT / 'SCOPE.json').write_bytes(raw)
    manifest = {
        'schema': '1370-b-evidence-archive-r1',
        'scopeSha256': scope_sha,
        'archiveSha256': digest(tar_path.read_bytes()),
        'compressedBytes': tar_path.stat().st_size,
        'membersSha256': digest(members_bytes),
        'members': len(members),
        'regular': scope['counts']['regular'],
        'directories': scope['counts']['directories'],
        'symlinks': scope['counts']['symlinks'],
        'logicalBytes': scope['counts']['logicalBytes'],
    }
    (OUT / 'MANIFEST.json').write_text(json.dumps(manifest, sort_keys=True, indent=2) + '\n')
    print(json.dumps(manifest, sort_keys=True))


if __name__ == '__main__':
    main()
