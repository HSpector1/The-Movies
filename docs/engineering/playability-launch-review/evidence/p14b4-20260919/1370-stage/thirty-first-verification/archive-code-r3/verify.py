#!/usr/bin/env python3
"""Proposal only: read every part/member and compare to retained r12 sources."""

import argparse
import hashlib
import json
import os
import re
import stat
import tarfile
from pathlib import Path

BASE = Path('/Users/zacheryspector/studio-scratch')
SCHEMA = '1370-r12-followon-clean-archive-r2'
PART_BYTES = 48 * 1024 * 1024
MAX_BYTES = 3 * 1024 * 1024 * 1024
READ_BYTES = 1024 * 1024
SCRATCH_PARTS = ('Users', 'zacheryspector', 'studio-scratch')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def checked_parts(raw_path):
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


def anchored_regular_fd(path):
    parts = checked_parts(path)
    parent = '/' + '/'.join(parts[:-1])
    parent_fd = anchored_dir(parent)
    try:
        fd = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent_fd)
    finally:
        os.close(parent_fd)
    if not stat.S_ISREG(os.fstat(fd).st_mode):
        os.close(fd)
        raise RuntimeError(f'nonregular file: {path}')
    return fd


def read_regular(path):
    fd = anchored_regular_fd(path)
    try:
        blocks = []
        total = 0
        while block := os.read(fd, READ_BYTES):
            blocks.append(block)
            total += len(block)
            if total > 4 * READ_BYTES:
                raise RuntimeError(f'control file too large: {path}')
        return b''.join(blocks)
    finally:
        os.close(fd)


def read_regular_at(dir_fd, name):
    if name in ('', '.', '..') or '/' in name:
        raise RuntimeError('unsafe control-file name')
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=dir_fd)
    try:
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise RuntimeError('nonregular package control file')
        blocks = []
        total = 0
        while block := os.read(fd, READ_BYTES):
            blocks.append(block)
            total += len(block)
            if total > 4 * READ_BYTES:
                raise RuntimeError('package control file too large')
        return b''.join(blocks)
    finally:
        os.close(fd)


def sha_regular(path):
    fd = anchored_regular_fd(path)
    try:
        digest = hashlib.sha256()
        total = 0
        while block := os.read(fd, READ_BYTES):
            digest.update(block)
            total += len(block)
        return total, digest.hexdigest()
    finally:
        os.close(fd)


class PartReader:
    def __init__(self, root_fd, parts):
        self.root_fd = root_fd
        self.parts = parts
        self.index = 0
        self.fd = None
        self.part_count = 0
        self.part_hash = None
        self.total = 0
        self.digest = hashlib.sha256()

    def read(self, size=-1):
        limit = READ_BYTES if size < 0 else min(size, READ_BYTES)
        out = bytearray()
        while len(out) < limit and self.index < len(self.parts):
            record = self.parts[self.index]
            if self.fd is None:
                expected = f'capture.tar.part-{self.index + 1:03d}'
                if record['name'] != expected or not (0 < record['bytes'] <= PART_BYTES):
                    raise RuntimeError('part name/size mismatch')
                self.fd = os.open(expected, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=self.root_fd)
                st = os.fstat(self.fd)
                if not stat.S_ISREG(st.st_mode) or st.st_size != record['bytes']:
                    raise RuntimeError('part file type/length mismatch')
                self.part_count = 0
                self.part_hash = hashlib.sha256()
            block = os.read(self.fd, min(limit - len(out), READ_BYTES))
            if block:
                out.extend(block)
                self.part_hash.update(block)
                self.digest.update(block)
                self.part_count += len(block)
                self.total += len(block)
                if self.total > MAX_BYTES:
                    raise RuntimeError('archive exceeds 3 GiB cap')
            else:
                if (self.part_count != record['bytes']
                        or self.part_hash.hexdigest() != record['sha256']):
                    raise RuntimeError('part digest mismatch')
                os.close(self.fd)
                self.fd = None
                self.index += 1
        return bytes(out)

    def close(self):
        if self.fd is not None:
            os.close(self.fd)
            self.fd = None


def source_inventory(manifest):
    """Independently enumerate retained sources through anchored directory fds."""
    paths = {key: Path(value) for key, value in manifest['sourcePaths'].items()}
    items = {}
    for prefix in ('target', 'outer'):
        root_fd = anchored_dir(paths[prefix])
        try:
            def walk(dir_fd, rel):
                for name in sorted(os.listdir(dir_fd), key=os.fsencode):
                    if name in ('', '.', '..') or '/' in name:
                        raise RuntimeError('unsafe source component')
                    sub = f'{rel}/{name}' if rel else name
                    key = f'{prefix}/{sub}'
                    st = os.stat(name, dir_fd=dir_fd, follow_symlinks=False)
                    entry = {'path': key, 'mode': stat.S_IMODE(st.st_mode)}
                    if stat.S_ISDIR(st.st_mode):
                        child_fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                                           dir_fd=dir_fd)
                        try:
                            opened = os.fstat(child_fd)
                            if (opened.st_dev, opened.st_ino) != (st.st_dev, st.st_ino):
                                raise RuntimeError(f'directory replaced: {key}')
                            entry['type'] = 'directory'
                            items[key] = entry
                            walk(child_fd, sub)
                        finally:
                            os.close(child_fd)
                    elif stat.S_ISLNK(st.st_mode):
                        target = os.readlink(name, dir_fd=dir_fd)
                        entry.update(type='symlink', target=target,
                                     targetSha256=sha(os.fsencode(target)))
                        items[key] = entry
                    elif stat.S_ISREG(st.st_mode):
                        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=dir_fd)
                        try:
                            before = os.fstat(fd)
                            if (before.st_dev, before.st_ino, before.st_size) != (st.st_dev, st.st_ino, st.st_size):
                                raise RuntimeError(f'file replaced: {key}')
                            digest = hashlib.sha256()
                            count = 0
                            while block := os.read(fd, READ_BYTES):
                                digest.update(block)
                                count += len(block)
                            after = os.fstat(fd)
                            if (count != st.st_size or before.st_mtime_ns != after.st_mtime_ns
                                    or before.st_ctime_ns != after.st_ctime_ns):
                                raise RuntimeError(f'file drift: {key}')
                            entry.update(type='file', bytes=count, sha256=digest.hexdigest())
                            items[key] = entry
                        finally:
                            os.close(fd)
                    else:
                        raise RuntimeError(f'unsupported source object: {key}')
                    if len(items) > 1000:
                        raise RuntimeError('member count exceeded')
            walk(root_fd, '')
        finally:
            os.close(root_fd)
    for key in ('lane', 'lane_meta'):
        path = paths[key]
        fd = anchored_regular_fd(path)
        try:
            st = os.fstat(fd)
            digest = hashlib.sha256()
            size = 0
            while block := os.read(fd, READ_BYTES):
                digest.update(block)
                size += len(block)
            after = os.fstat(fd)
            if (size != st.st_size or st.st_mtime_ns != after.st_mtime_ns
                    or st.st_ctime_ns != after.st_ctime_ns):
                raise RuntimeError('lane source drift')
        finally:
            os.close(fd)
        entry = {'path': 'lane/' + path.name, 'type': 'file',
                 'mode': stat.S_IMODE(st.st_mode),
                 'bytes': size, 'sha256': digest.hexdigest()}
        if entry['path'] in items:
            raise RuntimeError('duplicate lane member')
        items[entry['path']] = entry
    return items


def verify(pin_path):
    checked_parts(pin_path)
    pin_raw = read_regular(pin_path)
    pin = json.loads(pin_raw)
    role = pin['role']
    if role not in {'ag-adoption', 'e0g-p13a', 'e0g-adoption'}:
        raise RuntimeError('unexpected role')
    if not re.fullmatch(r'r12-' + role + r'-clean-[0-9]{8}-[0-9]{4}', pin['runId']):
        raise RuntimeError('run ID mismatch')
    if (pin['schema'] != SCHEMA + '-pin'
            or pin['head'] != 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
            or pin['sourceTree'] != '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
            or pin['arm'] != role.split('-')[0].upper()):
        raise RuntimeError('source identity mismatch')
    expected_seed = ('p13a-core-causal-01' if role.endswith('p13a')
                     else 'p13-public-commercial-adoption')
    if pin['seed'] != expected_seed or pin['stage'] != 'clean':
        raise RuntimeError('seed/stage mismatch')
    checked_parts(pin['observedReceiptPath'])
    receipt_path = Path(pin['observedReceiptPath'])
    receipt_raw = read_regular(receipt_path)
    if sha(receipt_raw) != pin['observedReceiptSha256']:
        raise RuntimeError('observed receipt byte pin mismatch')
    receipt = json.loads(receipt_raw)
    for key in ('runId', 'arm', 'seed'):
        if receipt.get(key) != pin[key]:
            raise RuntimeError(f'observed receipt {key} mismatch')
    if receipt.get('decision') != pin['observedDecision']:
        raise RuntimeError('observed receipt decision mismatch')
    package = BASE / f'1370-r12-followon-{role}-archive-r2' / 'package'
    package_fd = anchored_dir(package)
    try:
        return verify_open_package(pin, pin_raw, role, package_fd)
    finally:
        os.close(package_fd)


def verify_open_package(pin, pin_raw, role, package_fd):
    manifest_raw = read_regular_at(package_fd, 'MANIFEST.json')
    manifest = json.loads(manifest_raw)
    if (manifest['schema'] != SCHEMA or manifest['pin'] != pin
            or manifest['pinSha256'] != sha(pin_raw) or manifest['runId'] != pin['runId']
            or manifest['role'] != role or manifest['classification'] != 'BYTE_PRESERVATION_ONLY'
            or manifest['partLimitBytes'] != PART_BYTES):
        raise RuntimeError('manifest/pin mismatch')
    leaf = f'{role}-clean-{pin["runId"]}'
    lane = BASE / f'1370-ag-e0g-full-state-r12-{role}-clean-{pin["runId"]}.lane.log'
    source_paths = {
        'target': str(BASE / '1370-ag-e0g-full-state-clean-recorded-r12' / leaf),
        'outer': str(BASE / '1370-ag-e0g-full-state-clean-outer-recorded-r12' / leaf),
        'lane': str(lane),
        'lane_meta': str(lane) + '.meta',
    }
    if manifest['sourcePaths'] != source_paths:
        raise RuntimeError('source path identity mismatch')
    archive = manifest['archive']
    parts = archive['parts']
    if (archive['type'] != 'uncompressed-tar' or not 1 <= len(parts) <= 64
            or not 0 < archive['bytes'] <= MAX_BYTES):
        raise RuntimeError('archive schema/size mismatch')
    expected_dir = {'MANIFEST.json'} | {part['name'] for part in parts}
    if set(os.listdir(package_fd)) != expected_dir:
        raise RuntimeError('missing/extra package file')
    members = manifest['members']
    if not 1 <= len(members) <= 1000:
        raise RuntimeError('member count mismatch')
    expected = {}
    for entry in members:
        name = entry['path']
        components = name.split('/')
        if (name in expected or any(part in ('', '.', '..') for part in components)
                or components[0] not in {'target', 'outer', 'lane'}):
            raise RuntimeError(f'unsafe/duplicate member: {name}')
        expected[name] = entry
    pinned_members = {
        'target/RESULT.json': pin['targetResultSha256'],
        'outer/RESULT.json': pin['outerResultSha256'],
        'target/boundaries.ndjson.gz': pin['boundariesSha256'],
        'lane/' + lane.name: pin['laneSha256'],
        'lane/' + lane.name + '.meta': pin['laneMetaSha256'],
    }
    for name, digest in pinned_members.items():
        if expected.get(name, {}).get('sha256') != digest:
            raise RuntimeError(f'archive pin mismatch: {name}')
    seen = set()
    reader = PartReader(package_fd, parts)
    try:
        with tarfile.open(fileobj=reader, mode='r|') as tar:
            for member in tar:
                name = member.name
                if name not in expected or name in seen:
                    raise RuntimeError(f'extra/duplicate archive member: {name}')
                entry = expected[name]
                if (member.mode != entry['mode'] or member.uid != 0 or member.gid != 0
                        or member.uname or member.gname or member.mtime != 0):
                    raise RuntimeError(f'tar metadata mismatch: {name}')
                if entry['type'] == 'file':
                    if not member.isfile() or member.size != entry['bytes']:
                        raise RuntimeError(f'tar file type/size mismatch: {name}')
                    stream = tar.extractfile(member)
                    if stream is None:
                        raise RuntimeError(f'unreadable tar file: {name}')
                    digest = hashlib.sha256()
                    total = 0
                    while block := stream.read(READ_BYTES):
                        digest.update(block)
                        total += len(block)
                    if total != entry['bytes'] or digest.hexdigest() != entry['sha256']:
                        raise RuntimeError(f'tar file digest mismatch: {name}')
                elif entry['type'] == 'directory':
                    if not member.isdir():
                        raise RuntimeError(f'tar directory mismatch: {name}')
                elif entry['type'] == 'symlink':
                    if (not member.issym() or member.linkname != entry['target']
                            or sha(os.fsencode(member.linkname)) != entry['targetSha256']):
                        raise RuntimeError(f'tar symlink mismatch: {name}')
                else:
                    raise RuntimeError(f'unsupported manifest type: {name}')
                seen.add(name)
        while reader.read(READ_BYTES):
            pass
        if (len(seen) != len(expected) or reader.index != len(parts)
                or reader.total != archive['bytes']
                or reader.digest.hexdigest() != archive['sha256']):
            raise RuntimeError('archive completeness/hash mismatch')
    finally:
        reader.close()
    live = source_inventory(manifest)
    if live != expected:
        raise RuntimeError('retained source inventory differs from archive')
    canonical = (json.dumps(members, sort_keys=True, separators=(',', ':'),
                            ensure_ascii=False) + '\n').encode()
    if (sha(canonical) != manifest['sourceInventorySha256']
            or sha(canonical) != pin['sourceInventorySha256']):
        raise RuntimeError('source inventory digest mismatch')
    return {'status': 'PASS_LOCAL_BYTE_PRESERVATION_ONLY',
            'runId': pin['runId'], 'manifestSha256': sha(manifest_raw),
            'pinSha256': sha(pin_raw), 'parts': len(parts), 'members': len(seen),
            'archiveBytes': reader.total, 'archiveSha256': reader.digest.hexdigest()}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pin', type=str, required=True)
    args = parser.parse_args()
    print(json.dumps(verify(args.pin), sort_keys=True))
