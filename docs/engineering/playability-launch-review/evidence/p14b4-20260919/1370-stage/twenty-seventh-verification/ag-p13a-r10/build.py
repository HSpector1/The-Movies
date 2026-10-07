#!/usr/bin/env python3
"""Proposal: archive exactly the finished r10 AG p13a leaf; no raw tar."""
import argparse
import hashlib
import json
import lzma
import os
import shutil
import stat
import tarfile
from pathlib import Path

SOURCE = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r10/ag-p13a-clean-r10-ag-p13a-20261007-222146')
HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
SCHEMA = '1370-r10-ag-p13a-raw-archive-r1'
DIRECT = ('LAUNCH.json', 'RESULT.json', 'RESULT.sha256.json',
          'summary.json', 'vitest.json', 'progress.ndjson',
          'child.stdout.log', 'child.stderr.log')
CHUNK = 1024 * 1024


def sha_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(CHUNK), b''):
            h.update(block)
    return h.hexdigest()


def write_json(path, value):
    with open(path, 'xb') as f:
        f.write((json.dumps(value, sort_keys=True, indent=2) + '\n').encode())


def scan():
    if not SOURCE.is_dir() or SOURCE.is_symlink():
        raise RuntimeError('exact source root is missing or is a symlink')
    items = []

    def walk(path, archive_path):
        st = path.lstat()
        mode = stat.S_IMODE(st.st_mode)
        item = {'path': archive_path, 'mode': mode}
        if stat.S_ISLNK(st.st_mode):
            target = os.readlink(path)
            raw = os.fsencode(target)
            item.update(kind='symlink', target=target, size=len(raw),
                        sha256=hashlib.sha256(raw).hexdigest())
        elif stat.S_ISDIR(st.st_mode):
            item.update(kind='directory', size=0)
        elif stat.S_ISREG(st.st_mode):
            item.update(kind='file', size=st.st_size, sha256=sha_file(path))
        else:
            raise RuntimeError(f'unsupported source object: {path}')
        items.append(item)
        if item['kind'] == 'directory':
            for child in sorted(path.iterdir(), key=lambda p: os.fsencode(p.name)):
                if child.name in ('.git', '.vite', '__pycache__'):
                    raise RuntimeError(f'excluded generated path: {child}')
                walk(child, archive_path + '/' + child.name)

    walk(SOURCE, SOURCE.name)
    return items


class HashReader:
    def __init__(self, fileobj):
        self.fileobj = fileobj
        self.hash = hashlib.sha256()
        self.count = 0

    def read(self, size=-1):
        data = self.fileobj.read(size)
        self.hash.update(data)
        self.count += len(data)
        return data


class XzTarWriter:
    def __init__(self, output, max_bytes):
        self.output = output
        self.max_bytes = max_bytes
        self.tar_hash = hashlib.sha256()
        self.xz_hash = hashlib.sha256()
        self.tar_bytes = self.xz_bytes = 0
        self.compressor = lzma.LZMACompressor(format=lzma.FORMAT_XZ,
                                              check=lzma.CHECK_CRC64, preset=6)

    def write(self, data):
        self.tar_hash.update(data)
        self.tar_bytes += len(data)
        self._compressed(self.compressor.compress(data))
        return len(data)

    def _compressed(self, data):
        if self.xz_bytes + len(data) > self.max_bytes:
            raise RuntimeError('xz output exceeded configured size guard; keep raw leaf')
        self.output.write(data)
        self.xz_hash.update(data)
        self.xz_bytes += len(data)

    def finish(self):
        self._compressed(self.compressor.flush())


def make_archive(items, partial, max_bytes):
    with open(partial, 'xb') as out:
        writer = XzTarWriter(out, max_bytes)
        with tarfile.open(fileobj=writer, mode='w|', format=tarfile.PAX_FORMAT) as tar:
            for item in items:
                source = SOURCE.joinpath(*Path(item['path']).parts[1:])
                st = source.lstat()
                if stat.S_IMODE(st.st_mode) != item['mode']:
                    raise RuntimeError(f'mode drift: {source}')
                info = tarfile.TarInfo(item['path'])
                info.uid = info.gid = 0
                info.uname = info.gname = ''
                info.mtime = 0
                info.mode = item['mode']
                info.pax_headers = {}
                if item['kind'] == 'directory':
                    if not stat.S_ISDIR(st.st_mode):
                        raise RuntimeError(f'kind drift: {source}')
                    info.type = tarfile.DIRTYPE
                    tar.addfile(info)
                elif item['kind'] == 'symlink':
                    if not stat.S_ISLNK(st.st_mode) or os.readlink(source) != item['target']:
                        raise RuntimeError(f'symlink drift: {source}')
                    info.type = tarfile.SYMTYPE
                    info.linkname = item['target']
                    tar.addfile(info)
                else:
                    if not stat.S_ISREG(st.st_mode) or st.st_size != item['size']:
                        raise RuntimeError(f'file drift: {source}')
                    info.type = tarfile.REGTYPE
                    info.size = item['size']
                    with open(source, 'rb') as source_file:
                        reader = HashReader(source_file)
                        tar.addfile(info, reader)
                    if reader.count != item['size'] or reader.hash.hexdigest() != item['sha256']:
                        raise RuntimeError(f'file-content drift: {source}')
        writer.finish()
        out.flush()
        os.fsync(out.fileno())
    return {'bytes': writer.xz_bytes, 'sha256': writer.xz_hash.hexdigest(),
            'tarBytes': writer.tar_bytes, 'tarSha256': writer.tar_hash.hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--max-mib', type=int, default=16)
    args = parser.parse_args()
    if not 1 <= args.max_mib <= 64:
        raise RuntimeError('max-mib must be 1..64; check disk budget before raising it')
    output = args.output_dir.absolute()
    if output == SOURCE or SOURCE in output.parents:
        raise RuntimeError('output directory must be outside source leaf')
    output.mkdir(parents=True, exist_ok=False)
    items = scan()
    members = {'schema': SCHEMA, 'source': str(SOURCE), 'head': HEAD,
               'members': items}
    write_json(output / 'MEMBERS.json', members)
    shutil.copyfile(__file__, output / 'build.py')
    direct_dir = output / 'DIRECT'
    direct_dir.mkdir()
    direct = {}
    by_path = {item['path']: item for item in items}
    for name in DIRECT:
        item = by_path.get(SOURCE.name + '/' + name)
        if item is None or item['kind'] != 'file':
            raise RuntimeError(f'missing direct receipt: {name}')
        dest = direct_dir / name
        shutil.copyfile(SOURCE / name, dest)
        if sha_file(dest) != item['sha256']:
            raise RuntimeError(f'direct receipt drift: {name}')
        direct[name] = {'bytes': item['size'], 'sha256': item['sha256']}
    result = json.loads((SOURCE / 'RESULT.json').read_bytes())
    if result.get('head') != HEAD or result.get('cleanArtifacts', {}).get('boundariesSha256') != by_path[SOURCE.name + '/boundaries.ndjson']['sha256']:
        raise RuntimeError('key RESULT identity or boundaries digest mismatch')
    if json.loads((SOURCE / 'RESULT.sha256.json').read_bytes()).get('sha256') != direct['RESULT.json']['sha256']:
        raise RuntimeError('RESULT digest receipt mismatch')
    partial = output / 'EVIDENCE.tar.xz.partial'
    archive = make_archive(items, partial, args.max_mib * 1024 * 1024)
    if scan() != items:
        raise RuntimeError('source changed during archive; keep partial and raw leaf')
    os.replace(partial, output / 'EVIDENCE.tar.xz')
    manifest = {'schema': SCHEMA, 'classification': 'BYTE_PRESERVATION_ONLY',
                'source': str(SOURCE), 'head': HEAD,
                'memberCount': len(items),
                'counts': {kind: sum(x['kind'] == kind for x in items)
                           for kind in ('file', 'directory', 'symlink')},
                'logicalBytes': sum(x['size'] for x in items),
                'files': {'MEMBERS.json': {'bytes': (output / 'MEMBERS.json').stat().st_size,
                                           'sha256': sha_file(output / 'MEMBERS.json')},
                          'build.py': {'bytes': (output / 'build.py').stat().st_size,
                                       'sha256': sha_file(output / 'build.py')},
                          'EVIDENCE.tar.xz': archive},
                'direct': direct,
                'reviewRequiredBeforeRawRemoval': True}
    write_json(output / 'MANIFEST.json', manifest)
    print(json.dumps({'output': str(output), 'archive': archive,
                      'memberCount': len(items)}, sort_keys=True))


if __name__ == '__main__':
    main()
