#!/usr/bin/env python3
"""Proposal only: losslessly package one observed r12 CLEAN_ONLY leaf.

The independently reviewed per-leaf pin is an input, never derived here. Run only
after that leaf, its outer recorder, and its lane record have stopped changing.
"""

import argparse
import hashlib
import json
import os
import re
import stat
import tarfile
from pathlib import Path

BASE = Path('/Users/zacheryspector/studio-scratch')
HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
ROLES = {'ag-adoption', 'e0g-p13a', 'e0g-adoption'}
SEEDS = {'adoption': 'p13-public-commercial-adoption',
         'p13a': 'p13a-core-causal-01'}
PART_BYTES = 48 * 1024 * 1024
READ_BYTES = 1024 * 1024
MAX_MEMBERS = 1000
MAX_TAR_BYTES = 3 * 1024 * 1024 * 1024
FREE_FLOOR_BYTES = 3 * 1024 * 1024 * 1024
SCHEMA = '1370-r12-followon-clean-archive-r2'
SCRATCH_PARTS = ('Users', 'zacheryspector', 'studio-scratch')


def sha_bytes(raw):
    return hashlib.sha256(raw).hexdigest()


def sha_path(path):
    digest = hashlib.sha256()
    with nofollow_file(path) as stream:
        while block := stream.read(READ_BYTES):
            digest.update(block)
    return digest.hexdigest()


def canonical(value):
    return (json.dumps(value, sort_keys=True, separators=(',', ':'),
                       ensure_ascii=False) + '\n').encode()


def checked_parts(raw_path):
    """Validate raw lexical components before pathlib can normalize any of them."""
    raw = os.fspath(raw_path)
    if not isinstance(raw, str) or not raw.startswith('/') or '\x00' in raw:
        raise RuntimeError('expected absolute scratch path')
    parts = raw.split('/')[1:]
    if any(part in ('', '.', '..') for part in parts) or tuple(parts[:3]) != SCRATCH_PARTS:
        raise RuntimeError('empty/dot/dotdot/outside-scratch component')
    return parts


def anchored_dir(path):
    parts = checked_parts(path)
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in parts:
            child = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = child
        return fd
    except BaseException:
        os.close(fd)
        raise


def anchored_parent(path):
    parts = checked_parts(path)
    parent = '/' + '/'.join(parts[:-1])
    return anchored_dir(parent), parts[-1]


def anchored_stat(path):
    parent_fd, name = anchored_parent(path)
    try:
        return os.stat(name, dir_fd=parent_fd, follow_symlinks=False)
    finally:
        os.close(parent_fd)


def anchored_readlink(path):
    parent_fd, name = anchored_parent(path)
    try:
        return os.readlink(name, dir_fd=parent_fd)
    finally:
        os.close(parent_fd)


def anchored_regular_fd(path):
    parent_fd, name = anchored_parent(path)
    try:
        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent_fd)
    finally:
        os.close(parent_fd)
    if not stat.S_ISREG(os.fstat(fd).st_mode):
        os.close(fd)
        raise RuntimeError(f'nonregular file: {path}')
    return fd


def nofollow_file(path):
    return os.fdopen(anchored_regular_fd(path), 'rb')


def nofollow_dir(path):
    return anchored_dir(path)


def source_paths(pin):
    role = pin['role']
    run = pin['runId']
    if role not in ROLES or not re.fullmatch(r'r12-' + role + r'-clean-[0-9]{8}-[0-9]{4}', run):
        raise RuntimeError('role/run ID outside exact r12 follow-on set')
    arm, seed_name = role.split('-')
    if pin['head'] != HEAD or pin['sourceTree'] != TREE or pin['arm'] != arm.upper():
        raise RuntimeError('source identity pin mismatch')
    if pin['seed'] != SEEDS[seed_name] or pin['stage'] != 'clean':
        raise RuntimeError('seed/stage pin mismatch')
    leaf = f'{role}-clean-{run}'
    lane = BASE / f'1370-ag-e0g-full-state-r12-{role}-clean-{run}.lane.log'
    return {
        'target': BASE / '1370-ag-e0g-full-state-clean-recorded-r12' / leaf,
        'outer': BASE / '1370-ag-e0g-full-state-clean-outer-recorded-r12' / leaf,
        'lane': lane,
        'lane_meta': Path(str(lane) + '.meta'),
    }


def load_pin(path):
    checked_parts(path)
    with nofollow_file(path) as stream:
        raw = stream.read()
    pin = json.loads(raw)
    required = {'schema', 'role', 'runId', 'head', 'sourceTree', 'arm',
                'seed', 'stage', 'classification', 'status', 'stagePassed',
                'childExit', 'laneProcessExit', 'targetResultSha256', 'outerResultSha256',
                'laneSha256', 'laneMetaSha256', 'boundariesSha256',
                'observedReceiptPath', 'observedReceiptSha256',
                'observedDecision', 'sourceInventorySha256'}
    if set(pin) != required or pin['schema'] != SCHEMA + '-pin':
        raise RuntimeError('pin schema or fields mismatch')
    paths = source_paths(pin)
    for field in ('targetResultSha256', 'outerResultSha256', 'laneSha256',
                  'laneMetaSha256', 'boundariesSha256', 'observedReceiptSha256',
                  'sourceInventorySha256'):
        if not re.fullmatch('[0-9a-f]{64}', pin[field]):
            raise RuntimeError(f'invalid digest: {field}')
    checked_parts(pin['observedReceiptPath'])
    receipt = Path(pin['observedReceiptPath'])
    if sha_path(receipt) != pin['observedReceiptSha256']:
        raise RuntimeError('observed receipt path/digest mismatch')
    with nofollow_file(receipt) as stream:
        observed = json.load(stream)
    for key in ('runId', 'arm', 'seed'):
        if observed.get(key) != pin[key]:
            raise RuntimeError(f'observed receipt {key} mismatch')
    if observed.get('decision') != pin['observedDecision']:
        raise RuntimeError('observed receipt decision mismatch')
    return pin, sha_bytes(raw), paths


def scan_tree(root, prefix):
    """Sorted no-follow inventory, including empty directories and link bytes."""
    entries = []
    root_fd = nofollow_dir(root)
    try:
        def visit(dir_fd, rel):
            for name in sorted(os.listdir(dir_fd), key=os.fsencode):
                if name in ('.', '..') or '/' in name:
                    raise RuntimeError('unsafe source member')
                sub = f'{rel}/{name}' if rel else name
                path = f'{prefix}/{sub}'
                st = os.stat(name, dir_fd=dir_fd, follow_symlinks=False)
                item = {'path': path, 'mode': stat.S_IMODE(st.st_mode)}
                if stat.S_ISDIR(st.st_mode):
                    item['type'] = 'directory'
                    child_fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                                       dir_fd=dir_fd)
                    try:
                        if (os.fstat(child_fd).st_dev, os.fstat(child_fd).st_ino) != (st.st_dev, st.st_ino):
                            raise RuntimeError('directory changed during open')
                        entries.append(item)
                        visit(child_fd, sub)
                    finally:
                        os.close(child_fd)
                elif stat.S_ISLNK(st.st_mode):
                    target = os.readlink(name, dir_fd=dir_fd)
                    item.update(type='symlink', target=target,
                                targetSha256=sha_bytes(os.fsencode(target)))
                    entries.append(item)
                elif stat.S_ISREG(st.st_mode):
                    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=dir_fd)
                    try:
                        before = os.fstat(fd)
                        if (before.st_dev, before.st_ino, before.st_size) != (st.st_dev, st.st_ino, st.st_size):
                            raise RuntimeError('file changed during open')
                        digest = hashlib.sha256()
                        size = 0
                        while block := os.read(fd, READ_BYTES):
                            digest.update(block)
                            size += len(block)
                        after = os.fstat(fd)
                        if (size != st.st_size or before.st_mtime_ns != after.st_mtime_ns
                                or before.st_ctime_ns != after.st_ctime_ns):
                            raise RuntimeError('file changed during scan')
                    finally:
                        os.close(fd)
                    item.update(type='file', bytes=size, sha256=digest.hexdigest())
                    entries.append(item)
                else:
                    raise RuntimeError(f'unsupported source member: {path}')
                if len(entries) > MAX_MEMBERS:
                    raise RuntimeError('member count cap exceeded')
        visit(root_fd, '')
    finally:
        os.close(root_fd)
    return entries


def scan(paths):
    items = scan_tree(paths['target'], 'target') + scan_tree(paths['outer'], 'outer')
    for key in ('lane', 'lane_meta'):
        path = paths[key]
        st = anchored_stat(path)
        if not stat.S_ISREG(st.st_mode):
            raise RuntimeError(f'nonregular lane source: {path}')
        items.append({'path': 'lane/' + path.name, 'type': 'file',
                      'mode': stat.S_IMODE(st.st_mode), 'bytes': st.st_size,
                      'sha256': sha_path(path)})
    items.sort(key=lambda item: os.fsencode(item['path']))
    if len(items) > MAX_MEMBERS or len({x['path'] for x in items}) != len(items):
        raise RuntimeError('member count/uniqueness failure')
    return items


def guard_identity(pin, paths, items):
    table = {item['path']: item for item in items}
    expected = {'target/RESULT.json': pin['targetResultSha256'],
                'outer/RESULT.json': pin['outerResultSha256'],
                'target/boundaries.ndjson.gz': pin['boundariesSha256'],
                'lane/' + paths['lane'].name: pin['laneSha256'],
                'lane/' + paths['lane_meta'].name: pin['laneMetaSha256']}
    for name, digest in expected.items():
        if table.get(name, {}).get('sha256') != digest:
            raise RuntimeError(f'source byte pin mismatch: {name}')
    inventory_sha = sha_bytes(canonical(items))
    if inventory_sha != pin['sourceInventorySha256']:
        raise RuntimeError('independently pinned complete inventory mismatch')
    with nofollow_file(paths['target'] / 'RESULT.json') as stream:
        target = json.load(stream)
    with nofollow_file(paths['outer'] / 'RESULT.json') as stream:
        outer = json.load(stream)
    for result in (target, outer):
        for key in ('head', 'arm', 'seed', 'stage', 'status', 'stagePassed'):
            if result.get(key) != pin[key]:
                raise RuntimeError(f'target/outer {key} differs from reviewed pin')
    if target.get('classification') != pin['classification']:
        raise RuntimeError('target classification differs from reviewed pin')
    if target.get('child', {}).get('exit') != pin['childExit'] or outer.get('childExit') != pin['childExit']:
        raise RuntimeError('child exit differs from reviewed pin')
    for label, root, result in (('target', paths['target'], target),
                                ('outer', paths['outer'], outer)):
        with nofollow_file(root / 'RESULT.sha256.json') as stream:
            seal = json.load(stream)
        if seal.get('sha256') != pin[label + 'ResultSha256']:
            raise RuntimeError(f'{label} RESULT seal mismatch')
    if target.get('cleanArtifacts', {}).get('boundariesSha256') != pin['boundariesSha256']:
        raise RuntimeError('target boundaries digest mismatch')
    with nofollow_file(paths['lane_meta']) as stream:
        meta = stream.read().decode()
    if not re.search(r'(?m)^end, exit ' + str(pin['laneProcessExit']) + r'; ', meta):
        raise RuntimeError('lane actual process exit mismatch')


class HashingReader:
    def __init__(self, fd):
        self.fd = fd
        self.count = 0
        self.digest = hashlib.sha256()

    def read(self, size=-1):
        data = os.read(self.fd, READ_BYTES if size < 0 else min(size, READ_BYTES))
        self.digest.update(data)
        self.count += len(data)
        return data


class SplitWriter:
    def __init__(self, root_fd):
        self.root_fd = root_fd
        self.fd = None
        self.parts = []
        self.part_count = 0
        self.part_digest = None
        self.total = 0
        self.digest = hashlib.sha256()

    def open_part(self):
        volume = os.fstatvfs(self.root_fd)
        if volume.f_bavail * volume.f_frsize < FREE_FLOOR_BYTES + PART_BYTES:
            raise RuntimeError('insufficient disk reserve before next part; retain source')
        name = f'capture.tar.part-{len(self.parts) + 1:03d}'
        self.fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                          0o644, dir_fd=self.root_fd)
        self.name = name
        self.part_count = 0
        self.part_digest = hashlib.sha256()

    def close_part(self):
        if self.fd is not None:
            os.fsync(self.fd)
            os.close(self.fd)
            self.parts.append({'name': self.name, 'bytes': self.part_count,
                               'sha256': self.part_digest.hexdigest()})
            self.fd = None

    def write(self, data):
        view = memoryview(data)
        while view:
            if self.fd is None:
                self.open_part()
            count = min(len(view), PART_BYTES - self.part_count)
            piece = view[:count]
            offset = 0
            while offset < count:
                offset += os.write(self.fd, piece[offset:])
            self.part_digest.update(piece)
            self.digest.update(piece)
            self.part_count += count
            self.total += count
            if self.total > MAX_TAR_BYTES:
                raise RuntimeError('tar output exceeded 3 GiB cap; retain source')
            view = view[count:]
            if self.part_count == PART_BYTES:
                self.close_part()
        return len(data)

    def flush(self):
        if self.fd is not None:
            os.fsync(self.fd)

    def close(self):
        self.close_part()


def source_fd(paths, archive_name):
    prefix, _, sub = archive_name.partition('/')
    if prefix == 'lane':
        path = next((paths[x] for x in ('lane', 'lane_meta') if paths[x].name == sub), None)
        if path is None:
            raise RuntimeError('unexpected lane member')
        return anchored_regular_fd(path)
    if prefix not in ('target', 'outer'):
        raise RuntimeError('unexpected archive prefix')
    fd = nofollow_dir(paths[prefix])
    try:
        parts = sub.split('/')
        if any(part in ('', '.', '..') for part in parts):
            raise RuntimeError('unsafe relative source member')
        for component in parts[:-1]:
            next_fd = os.open(component, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = next_fd
        return os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW, dir_fd=fd)
    finally:
        os.close(fd)


def source_path(paths, archive_name):
    prefix, _, sub = archive_name.partition('/')
    if prefix == 'lane':
        for key in ('lane', 'lane_meta'):
            if paths[key].name == sub:
                return paths[key]
        raise RuntimeError('unexpected lane member')
    if prefix not in ('target', 'outer') or any(part in ('', '.', '..') for part in sub.split('/')):
        raise RuntimeError('unsafe relative source member')
    return paths[prefix] / sub


def build(pin_path):
    pin, pin_sha, paths = load_pin(pin_path)
    output = BASE / f'1370-r12-followon-{pin["role"]}-archive-r2' / 'package'
    parent_fd = anchored_dir(output.parent)
    try:
        try:
            os.stat('package', dir_fd=parent_fd, follow_symlinks=False)
        except FileNotFoundError:
            pass
        else:
            raise RuntimeError('unique per-leaf package already exists; never overwrite')
        if source_paths(pin) != paths:
            raise RuntimeError('source map drift')
        items = scan(paths)
        guard_identity(pin, paths, items)
        predicted_upper = sum(item.get('bytes', 0) for item in items) + 4 * READ_BYTES
        volume = os.fstatvfs(parent_fd)
        if (predicted_upper > MAX_TAR_BYTES
                or volume.f_bavail * volume.f_frsize < FREE_FLOOR_BYTES + predicted_upper):
            raise RuntimeError('archive size/disk reserve preflight failed; retain source')
        os.mkdir('package', dir_fd=parent_fd)
        output_fd = os.open('package', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                            dir_fd=parent_fd)
    finally:
        os.close(parent_fd)
    try:
        writer = SplitWriter(output_fd)
        try:
            with tarfile.open(fileobj=writer, mode='w|', format=tarfile.PAX_FORMAT) as tar:
                for item in items:
                    name = item['path']
                    path = source_path(paths, name)
                    st = anchored_stat(path)
                    if stat.S_IMODE(st.st_mode) != item['mode']:
                        raise RuntimeError(f'mode drift: {name}')
                    info = tarfile.TarInfo(name)
                    info.uid = info.gid = 0
                    info.uname = info.gname = ''
                    info.mtime = 0
                    info.mode = item['mode']
                    info.pax_headers = {}
                    if item['type'] == 'directory':
                        if not stat.S_ISDIR(st.st_mode):
                            raise RuntimeError(f'directory drift: {name}')
                        info.type = tarfile.DIRTYPE
                        tar.addfile(info)
                    elif item['type'] == 'symlink':
                        if not stat.S_ISLNK(st.st_mode) or anchored_readlink(path) != item['target']:
                            raise RuntimeError(f'symlink drift: {name}')
                        info.type = tarfile.SYMTYPE
                        info.linkname = item['target']
                        tar.addfile(info)
                    else:
                        if not stat.S_ISREG(st.st_mode) or st.st_size != item['bytes']:
                            raise RuntimeError(f'file metadata drift: {name}')
                        fd = source_fd(paths, name)
                        try:
                            before = os.fstat(fd)
                            if (before.st_dev, before.st_ino, before.st_size) != (st.st_dev, st.st_ino, st.st_size):
                                raise RuntimeError(f'file replaced: {name}')
                            info.type = tarfile.REGTYPE
                            info.size = item['bytes']
                            reader = HashingReader(fd)
                            tar.addfile(info, reader)
                            after = os.fstat(fd)
                            if (reader.count != item['bytes'] or reader.digest.hexdigest() != item['sha256']
                                    or before.st_mtime_ns != after.st_mtime_ns
                                    or before.st_ctime_ns != after.st_ctime_ns):
                                raise RuntimeError(f'file content drift: {name}')
                        finally:
                            os.close(fd)
        finally:
            writer.close()
        if scan(paths) != items:
            raise RuntimeError('source inventory drift after build; retain package and source for review')
        archive = {'type': 'uncompressed-tar', 'bytes': writer.total,
                   'sha256': writer.digest.hexdigest(), 'parts': writer.parts}
        manifest = {'schema': SCHEMA, 'classification': 'BYTE_PRESERVATION_ONLY',
                    'runId': pin['runId'], 'role': pin['role'], 'pinSha256': pin_sha,
                    'pin': pin, 'sourcePaths': {key: str(path) for key, path in paths.items()},
                    'sourceInventorySha256': sha_bytes(canonical(items)),
                    'members': items, 'partLimitBytes': PART_BYTES, 'archive': archive,
                    'sourceRetained': True, 'independentReviewRequired': True}
        manifest_bytes = (json.dumps(manifest, sort_keys=True, indent=2) + '\n').encode()
        manifest_fd = os.open('MANIFEST.json', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                              0o644, dir_fd=output_fd)
        try:
            offset = 0
            while offset < len(manifest_bytes):
                offset += os.write(manifest_fd, manifest_bytes[offset:])
            os.fsync(manifest_fd)
        finally:
            os.close(manifest_fd)
        print(json.dumps({'package': str(output), 'manifestSha256': sha_bytes(manifest_bytes),
                          'runId': pin['runId'], 'archive': archive,
                          'memberCount': len(items)}, sort_keys=True))
    finally:
        os.close(output_fd)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pin', type=str, required=True)
    args = parser.parse_args()
    build(args.pin)
