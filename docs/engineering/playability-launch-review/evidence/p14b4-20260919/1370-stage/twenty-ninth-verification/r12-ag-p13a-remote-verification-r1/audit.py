#!/usr/bin/env python3
"""Independently compare the remotely retrieved split tar to live source bytes."""
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import tarfile

SCRATCH = Path('/Users/zacheryspector/studio-scratch')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
REMOTE = SCRATCH / '1370-r12-ag-p13a-remote-retrieved-r1'
LOCAL = SCRATCH / '1370-r12-ag-p13a-clean-archive-r1'
STAGE = Path('docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-ninth-verification')
REMOTE_ARCHIVE = REMOTE / STAGE / 'r12-ag-p13a-clean-archive-r1'
LOCAL_EVIDENCE = SCRATCH / '1370-r12-evidence-worktree-b' / STAGE
EXPECTED_HEAD = 'f8d06ffcb8d575d94b1e52eb78da9c9d888b857a'
EXPECTED_WORK_HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
EXPECTED_MANIFEST_SHA = '1aacbd7cfec79556dd6a2a86f96fa324cd1375c14cfd8b9a332369612dc07132'
SOURCES = {
    'target': SCRATCH / '1370-ag-e0g-full-state-clean-recorded-r12/ag-p13a-clean-r12-ag-p13a-clean-20261007-1850',
    'outer': SCRATCH / '1370-ag-e0g-full-state-clean-outer-recorded-r12/ag-p13a-clean-r12-ag-p13a-clean-20261007-1850',
    'lane': SCRATCH,
}

def sha_file(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        while b := f.read(1024 * 1024):
            h.update(b)
    return h.hexdigest()

def git(*args, cwd=REMOTE):
    return subprocess.check_output(['git', *args], cwd=cwd, text=True).strip()

class Parts:
    def __init__(self, root, specs):
        self.root, self.specs = root, specs
        self.index, self.file = 0, None
        self.full_hash, self.full_bytes = hashlib.sha256(), 0
        self.part_hash, self.part_bytes = None, 0
        self.finished = 0

    def read(self, count=-1):
        if count < 0:
            count = 1024 * 1024
        out = bytearray()
        while len(out) < count and self.index < len(self.specs):
            spec = self.specs[self.index]
            if self.file is None:
                assert spec['name'] == f'capture.tar.part-{self.index + 1:03d}'
                self.file = (self.root / spec['name']).open('rb')
                self.part_hash, self.part_bytes = hashlib.sha256(), 0
            b = self.file.read(count - len(out))
            if b:
                out.extend(b)
                self.full_hash.update(b)
                self.part_hash.update(b)
                self.full_bytes += len(b)
                self.part_bytes += len(b)
            else:
                assert self.part_bytes == spec['bytes']
                assert self.part_hash.hexdigest() == spec['sha256']
                self.file.close()
                self.file = None
                self.index += 1
                self.finished += 1
        return bytes(out)

def source_path(name):
    group, suffix = name.split('/', 1)
    assert group in SOURCES and suffix and '..' not in Path(suffix).parts
    if group == 'lane':
        assert suffix.startswith('1370-ag-e0g-full-state-r12-ag-p13a-clean-')
    return SOURCES[group] / suffix

def source_entries():
    result = set()
    for group in ('target', 'outer'):
        root = SOURCES[group]
        for here, dirs, files in os.walk(root, followlinks=False):
            for name in files:
                rel = (Path(here) / name).relative_to(root).as_posix()
                result.add(f'{group}/{rel}')
            for name in list(dirs):
                path = Path(here) / name
                if path.is_symlink():
                    rel = path.relative_to(root).as_posix()
                    result.add(f'{group}/{rel}')
                    dirs.remove(name)
    for suffix in (
        '1370-ag-e0g-full-state-r12-ag-p13a-clean-r12-ag-p13a-clean-20261007-1850.lane.log',
        '1370-ag-e0g-full-state-r12-ag-p13a-clean-r12-ag-p13a-clean-20261007-1850.lane.log.meta',
    ):
        result.add(f'lane/{suffix}')
    return result

def main():
    assert git('rev-parse', 'HEAD') == EXPECTED_HEAD
    assert not git('status', '--porcelain')
    assert git('rev-parse', 'HEAD', cwd=REPO) == EXPECTED_WORK_HEAD
    assert not git('status', '--porcelain', cwd=REPO)
    manifest_file = REMOTE_ARCHIVE / 'package/MANIFEST.json'
    assert sha_file(manifest_file) == EXPECTED_MANIFEST_SHA
    manifest = json.loads(manifest_file.read_text())
    assert manifest['schema'] == '1370-r12-ag-p13a-clean-archive-r1'
    assert manifest['archive']['bytes'] == 112936960
    assert manifest['archive']['sha256'] == '87731d731d58d5d5b229fe170751744da62b1658765d59159cf6ed61355853fd'
    assert len(manifest['files']) == 219
    assert source_entries() == set(manifest['files']), (len(source_entries()), len(manifest['files']))
    remote_files = sorted(p for p in REMOTE_ARCHIVE.rglob('*') if p.is_file())
    assert len(remote_files) == 16, len(remote_files)
    compared = {}
    for path in remote_files:
        rel = path.relative_to(REMOTE_ARCHIVE)
        local = LOCAL / rel
        assert local.is_file(), rel
        remote_hash = sha_file(path)
        assert remote_hash == sha_file(local), rel
        compared[str(rel)] = remote_hash
    direct_docs = [
        '1370-Y-r12-ag-p13a-clean-archive.md',
        'r12-ag-p13a-archive-observed-review-r3/REPORT.md',
        'r12-ag-p13a-archive-observed-review-r3/RECEIPT.json',
    ]
    for rel in direct_docs:
        rp, lp = REMOTE / STAGE / rel, LOCAL_EVIDENCE / rel
        if rp.exists():
            assert rp.is_file() and lp.is_file() and sha_file(rp) == sha_file(lp), rel
            compared[rel] = sha_file(rp)
    reader = Parts(REMOTE_ARCHIVE / 'package', manifest['archive']['parts'])
    seen = set()
    raw_file_bytes = 0
    symlinks = 0
    with tarfile.open(fileobj=reader, mode='r|') as tar:
        for member in tar:
            name = member.name
            assert name in manifest['files'] and name not in seen, name
            path = source_path(name)
            st = path.lstat()
            spec = manifest['files'][name]
            if member.isfile():
                assert stat.S_ISREG(st.st_mode) and spec['type'] == 'file'
                assert member.size == st.st_size == spec['bytes'], name
                archived = tar.extractfile(member)
                assert archived is not None
                h = hashlib.sha256()
                with path.open('rb') as live:
                    while b := archived.read(1024 * 1024):
                        assert b == live.read(len(b)), name
                        h.update(b)
                        raw_file_bytes += len(b)
                    assert not live.read(1), name
                assert h.hexdigest() == spec['sha256'], name
            else:
                assert member.issym() and stat.S_ISLNK(st.st_mode)
                assert os.readlink(path) == member.linkname == spec['target'], name
                symlinks += 1
            seen.add(name)
    assert seen == set(manifest['files'])
    while reader.read(1024 * 1024):
        pass
    assert reader.finished == 3
    assert reader.full_bytes == manifest['archive']['bytes']
    assert reader.full_hash.hexdigest() == manifest['archive']['sha256']
    assert not git('status', '--porcelain')
    assert git('rev-parse', 'HEAD', cwd=REPO) == EXPECTED_WORK_HEAD
    return {
        'decision': 'ACCEPT_REMOTE_SOURCE_BYTE_RESTORE_ONLY',
        'remoteCommit': EXPECTED_HEAD,
        'sourceHead': EXPECTED_WORK_HEAD,
        'manifestSha256': EXPECTED_MANIFEST_SHA,
        'archiveSha256': reader.full_hash.hexdigest(),
        'archiveBytes': reader.full_bytes,
        'members': len(seen),
        'symlinks': symlinks,
        'regularFileBytesCompared': raw_file_bytes,
        'remoteFilesComparedToLocal': len(remote_files),
        'directDocsComparedToLocal': len(direct_docs),
        'remoteFileHashes': compared,
        'sourceLeavesIntact': True,
    }

if __name__ == '__main__':
    print(json.dumps(main(), sort_keys=True))
