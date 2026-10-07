#!/usr/bin/env python3
"""Proposal: byte-preserve exactly the failed r10 AG adoption leaf."""

import argparse
import hashlib
import json
import lzma
import os
import shutil
import stat
import tarfile
from pathlib import Path

SOURCE = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r10/ag-adoption-clean-r10-ag-adoption-20261007-224614')
OUTPUT_PARENT = Path('/Users/zacheryspector/studio-scratch/1370-r10-clean-evidence-worktree/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-seventh-verification')
OUTPUT_NAME = 'ag-adoption-r10-failure'
HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
BOUNDARIES_SHA256 = 'd8fef4ae3a56021778764c121fccd261621e50b6bcc8027819ef8ecd381ec12b'
BOUNDARIES_BYTES = 1069911027
RESULT_SHA256 = '3e1f9a8b67f0d03090c1e1641812d87a816c6b91ac7f22cbe81abbf7a83e9515'
SCHEMA = '1370-r10-ag-adoption-failure-raw-archive-r1'
DIRECT = ('LAUNCH.json', 'RESULT.json', 'RESULT.sha256.json',
          'vitest.json', 'progress.ndjson', 'child.stdout.log', 'child.stderr.log')
CHUNK = 1024 * 1024


def sha_file(path):
    digest = hashlib.sha256()
    with open_regular_nofollow(path) as stream:
        for block in iter(lambda: stream.read(CHUNK), b''):
            digest.update(block)
    return digest.hexdigest()


def inspect_boundaries(path):
    digest = hashlib.sha256()
    rows = 0
    pending = b''
    last_line = b''
    with open_regular_nofollow(path) as stream:
        for block in iter(lambda: stream.read(CHUNK), b''):
            digest.update(block)
            parts = block.split(b'\n')
            if len(parts) > 1:
                last_line = pending + parts[0]
                rows += len(parts) - 1
                if len(parts) > 2:
                    last_line = parts[-2]
                pending = parts[-1]
            else:
                pending += block
            if len(pending) > 16 * CHUNK:
                raise RuntimeError('boundary row exceeds 16 MiB')
    if pending or rows != 365:
        raise RuntimeError('partial boundaries are not 365 complete rows')
    if not last_line.startswith(b'{"boundary":364,"week":364,'):
        raise RuntimeError('last partial boundary is not week 364')
    return digest.hexdigest(), rows, 364


def open_regular_nofollow(path):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    if not stat.S_ISREG(os.fstat(fd).st_mode):
        os.close(fd)
        raise RuntimeError(f'not a regular file: {path}')
    return os.fdopen(fd, 'rb')


def write_json(path, value):
    with open(path, 'xb') as stream:
        stream.write((json.dumps(value, sort_keys=True, indent=2) + '\n').encode())


def scan():
    if not SOURCE.is_dir() or SOURCE.is_symlink():
        raise RuntimeError('exact source root is missing or is a symlink')
    items = []

    def walk(path, archive_path):
        st = path.lstat()
        item = {'path': archive_path, 'mode': stat.S_IMODE(st.st_mode),
                'dev': st.st_dev, 'ino': st.st_ino,
                'mtimeNs': st.st_mtime_ns, 'ctimeNs': st.st_ctime_ns}
        if stat.S_ISLNK(st.st_mode):
            target = os.readlink(path)
            raw = os.fsencode(target)
            item.update(kind='symlink', target=target, size=len(raw),
                        sha256=hashlib.sha256(raw).hexdigest())
        elif stat.S_ISDIR(st.st_mode):
            item.update(kind='directory', size=0)
        elif stat.S_ISREG(st.st_mode):
            if path == SOURCE / 'boundaries.ndjson':
                digest, rows, last_week = inspect_boundaries(path)
                item.update(kind='file', size=st.st_size, sha256=digest,
                            completeRows=rows, lastWeek=last_week)
            else:
                item.update(kind='file', size=st.st_size, sha256=sha_file(path))
            check_stat(item, path.lstat())
        else:
            raise RuntimeError(f'unsupported source object: {path}')
        items.append(item)
        if len(items) > 1000:
            raise RuntimeError('source has more than 1000 members')
        if item['kind'] == 'directory':
            for child in sorted(path.iterdir(), key=lambda p: os.fsencode(p.name)):
                walk(child, archive_path + '/' + child.name)

    walk(SOURCE, SOURCE.name)
    return items


def source_path(item):
    return SOURCE.joinpath(*Path(item['path']).parts[1:])


def check_stat(item, st):
    if (stat.S_IMODE(st.st_mode) != item['mode'] or st.st_dev != item['dev']
            or st.st_ino != item['ino'] or st.st_mtime_ns != item['mtimeNs']
            or st.st_ctime_ns != item['ctimeNs']):
        raise RuntimeError(f'source metadata changed: {item["path"]}')
    kind_ok = {'file': stat.S_ISREG, 'directory': stat.S_ISDIR,
               'symlink': stat.S_ISLNK}[item['kind']](st.st_mode)
    if not kind_ok or (item['kind'] == 'file' and st.st_size != item['size']):
        raise RuntimeError(f'source kind or size changed: {item["path"]}')


def check_failure(items):
    by_path = {item['path']: item for item in items}
    prefix = SOURCE.name + '/'
    if prefix + 'summary.json' in by_path:
        raise RuntimeError('unexpected summary.json; failed leaf identity changed')
    boundaries = by_path.get(prefix + 'boundaries.ndjson')
    if (boundaries is None or boundaries['kind'] != 'file'
            or boundaries['size'] != BOUNDARIES_BYTES
            or boundaries['sha256'] != BOUNDARIES_SHA256
            or boundaries['completeRows'] != 365 or boundaries['lastWeek'] != 364):
        raise RuntimeError('partial boundaries identity mismatch')
    result_item = by_path.get(prefix + 'RESULT.json')
    if result_item is None or result_item['kind'] != 'file' or result_item['sha256'] != RESULT_SHA256:
        raise RuntimeError('failed RESULT identity mismatch')
    for name in DIRECT:
        item = by_path.get(prefix + name)
        if item is None or item['kind'] != 'file':
            raise RuntimeError(f'missing direct failure receipt: {name}')
    with open_regular_nofollow(SOURCE / 'RESULT.json') as stream:
        result = json.load(stream)
    with open_regular_nofollow(SOURCE / 'RESULT.sha256.json') as stream:
        seal = json.load(stream)
    with open_regular_nofollow(SOURCE / 'vitest.json') as stream:
        vitest = json.load(stream)
    if (result.get('head') != HEAD or result.get('arm') != 'AG'
            or result.get('seed') != 'p13-public-commercial-adoption'
            or result.get('status') != 'STAGE_OR_GUARD_FAILURE'
            or result.get('stagePassed') is not False
            or result.get('child', {}).get('exit') != 1
            or result.get('child', {}).get('timedOut') is not False
            or seal.get('sha256') != RESULT_SHA256):
        raise RuntimeError('failure result or seal mismatch')
    failures = [message for suite in vitest.get('testResults', [])
                for assertion in suite.get('assertionResults', [])
                for message in assertion.get('failureMessages', [])]
    if (vitest.get('success') is not False or vitest.get('numTotalTests') != 1
            or vitest.get('numPassedTests') != 0 or vitest.get('numFailedTests') != 1
            or len(failures) != 1 or 'complete captures exceed 1 GiB' not in failures[0]):
        raise RuntimeError('Vitest 1 GiB failure mismatch')
    return by_path


class HashReader:
    def __init__(self, stream):
        self.stream = stream
        self.hash = hashlib.sha256()
        self.count = 0

    def read(self, size=-1):
        data = self.stream.read(min(size, CHUNK) if size >= 0 else CHUNK)
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
        # Preset 0 keeps liblzma's dictionary and encoder working set small.
        self.compressor = lzma.LZMACompressor(format=lzma.FORMAT_XZ,
                                              check=lzma.CHECK_CRC64, preset=0)

    def write(self, data):
        self.tar_hash.update(data)
        self.tar_bytes += len(data)
        self.compressed(self.compressor.compress(data))
        return len(data)

    def compressed(self, data):
        if self.xz_bytes + len(data) > self.max_bytes:
            raise RuntimeError('xz output exceeded the 64 MiB maximum; retain raw leaf')
        self.output.write(data)
        self.xz_hash.update(data)
        self.xz_bytes += len(data)

    def finish(self):
        self.compressed(self.compressor.flush())


def make_archive(items, partial, max_bytes):
    with open(partial, 'xb') as output:
        writer = XzTarWriter(output, max_bytes)
        with tarfile.open(fileobj=writer, mode='w|', format=tarfile.PAX_FORMAT) as tar:
            for item in items:
                path = source_path(item)
                check_stat(item, path.lstat())
                info = tarfile.TarInfo(item['path'])
                info.uid = info.gid = 0
                info.uname = info.gname = ''
                info.mtime = 0
                info.mode = item['mode']
                info.pax_headers = {}
                if item['kind'] == 'directory':
                    info.type = tarfile.DIRTYPE
                    tar.addfile(info)
                elif item['kind'] == 'symlink':
                    if os.readlink(path) != item['target']:
                        raise RuntimeError(f'symlink changed: {path}')
                    info.type = tarfile.SYMTYPE
                    info.linkname = item['target']
                    tar.addfile(info)
                else:
                    info.type = tarfile.REGTYPE
                    info.size = item['size']
                    with open_regular_nofollow(path) as stream:
                        check_stat(item, os.fstat(stream.fileno()))
                        reader = HashReader(stream)
                        tar.addfile(info, reader)
                        check_stat(item, os.fstat(stream.fileno()))
                    if reader.count != item['size'] or reader.hash.hexdigest() != item['sha256']:
                        raise RuntimeError(f'file bytes changed: {path}')
        writer.finish()
        output.flush()
        os.fsync(output.fileno())
    return {'bytes': writer.xz_bytes, 'sha256': writer.xz_hash.hexdigest(),
            'tarBytes': writer.tar_bytes, 'tarSha256': writer.tar_hash.hexdigest()}


def copy_direct(items, output):
    by_path = {item['path']: item for item in items}
    direct_dir = output / 'DIRECT'
    direct_dir.mkdir()
    direct = {}
    for name in DIRECT:
        item = by_path[SOURCE.name + '/' + name]
        with open_regular_nofollow(SOURCE / name) as original, open(direct_dir / name, 'xb') as copy:
            check_stat(item, os.fstat(original.fileno()))
            for block in iter(lambda: original.read(CHUNK), b''):
                copy.write(block)
            check_stat(item, os.fstat(original.fileno()))
        if (direct_dir / name).stat().st_size != item['size'] or sha_file(direct_dir / name) != item['sha256']:
            raise RuntimeError(f'direct receipt changed: {name}')
        direct[name] = {'bytes': item['size'], 'sha256': item['sha256']}
    return direct


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--max-mib', type=int, default=64)
    args = parser.parse_args()
    if not 1 <= args.max_mib <= 64:
        raise RuntimeError('max-mib must be 1..64')
    output = args.output_dir.absolute()
    if output.name != OUTPUT_NAME or output.parent != OUTPUT_PARENT or not OUTPUT_PARENT.is_dir():
        raise RuntimeError('output must be the exact nonexistent evidence-worktree child')
    if OUTPUT_PARENT.is_symlink() or SOURCE == output or SOURCE in output.parents:
        raise RuntimeError('output path is symlinked or inside source leaf')
    items = scan()
    check_failure(items)
    output.mkdir(exist_ok=False)
    members = {'schema': SCHEMA, 'source': str(SOURCE), 'head': HEAD,
               'disposition': 'FAILED_PARTIAL_CAPTURE', 'members': items}
    write_json(output / 'MEMBERS.json', members)
    shutil.copyfile(__file__, output / 'build.py')
    direct = copy_direct(items, output)
    partial = output / 'EVIDENCE.tar.xz.partial'
    overhead = sum(path.stat().st_size for path in output.rglob('*') if path.is_file())
    archive_cap = min(args.max_mib * CHUNK, 64 * CHUNK - overhead - CHUNK)
    if archive_cap <= 0:
        raise RuntimeError('package metadata leaves no space under 64 MiB total cap')
    archive = make_archive(items, partial, archive_cap)
    if scan() != items:
        raise RuntimeError('source changed during archive; retain raw leaf and partial output')
    os.replace(partial, output / 'EVIDENCE.tar.xz')
    files = {}
    for name in ('MEMBERS.json', 'build.py'):
        path = output / name
        files[name] = {'bytes': path.stat().st_size, 'sha256': sha_file(path)}
    files['EVIDENCE.tar.xz'] = archive
    manifest = {'schema': SCHEMA, 'classification': 'FAILED_RUN_BYTE_PRESERVATION_ONLY',
                'source': str(SOURCE), 'head': HEAD, 'memberCount': len(items),
                'counts': {kind: sum(x['kind'] == kind for x in items)
                           for kind in ('file', 'directory', 'symlink')},
                'logicalBytes': sum(x['size'] for x in items), 'files': files,
                'direct': direct, 'boundaries': {'bytes': BOUNDARIES_BYTES,
                                                'sha256': BOUNDARIES_SHA256,
                                                'completeRows': 365, 'lastWeek': 364},
                'resultStatus': 'STAGE_OR_GUARD_FAILURE',
                'vitestFailure': 'complete captures exceed 1 GiB',
                'summaryPresent': False, 'reviewRequiredBeforeRawRemoval': True}
    write_json(output / 'MANIFEST.json', manifest)
    total_bytes = sum(path.stat().st_size for path in output.rglob('*') if path.is_file())
    if total_bytes > 64 * CHUNK:
        raise RuntimeError('complete package exceeded 64 MiB total cap')
    print(json.dumps({'output': str(output), 'archive': archive,
                      'memberCount': len(items), 'resultStatus': manifest['resultStatus']}, sort_keys=True))


if __name__ == '__main__':
    main()
