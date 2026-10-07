#!/usr/bin/env python3
"""Delete only the exact, remotely published failed r10 adoption raw leaf."""

import hashlib
import json
import os
import re
import stat
import subprocess
from pathlib import Path

SOURCE = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r10/ag-adoption-clean-r10-ag-adoption-20261007-224614')
WORK = Path('/Users/zacheryspector/The-Movies-headless-program')
EVIDENCE = Path('/Users/zacheryspector/studio-scratch/1370-r10-clean-evidence-worktree')
STAGE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-seventh-verification/ag-adoption-r10-failure-r2/'
LOCK = Path('/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK')
EXPECTED_LANE_LOG = Path('/Users/zacheryspector/studio-scratch/1370-r10-raw-leaf-disposition-r2.log')
SELF = Path('/Users/zacheryspector/studio-scratch/1370-r10-raw-leaf-disposition-proposal-r2/delete_exact_raw_leaf_r2.py')
WORK_HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
SOURCE_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EVIDENCE_HEAD = '6413324956a98b0426e7959843b72dfd8bcb34fe'
MEMBERS_SHA = 'dd066bf7fe8db551bf7f7cfc6642a39ce8b61a188fb82fe40bbc19762ef4c104'
ARCHIVE_SHA = '1d065ca4f946269a464c526a80e8d34b932cf56c06bf04fc812fc96590d567df'
BOUNDARIES_SHA = 'd8fef4ae3a56021778764c121fccd261621e50b6bcc8027819ef8ecd381ec12b'
RESULT_SHA = '3e1f9a8b67f0d03090c1e1641812d87a816c6b91ac7f22cbe81abbf7a83e9515'
CHUNK = 1024 * 1024
PARTS = (
    ('EVIDENCE.tar.xz.part-0001-of-0003', 50331648, '1063ae48fc0772f0dab73cb4559f5bb06b4e11e72b52583d83366110452b5f60'),
    ('EVIDENCE.tar.xz.part-0002-of-0003', 50331648, 'cf6863d2ee30bd31e965ffc7279cd8b0875a510e6df28c050688565b221ed2b9'),
    ('EVIDENCE.tar.xz.part-0003-of-0003', 12633512, '715f91806f36908594b7383eb24518e021a9accea576492544653bda8ddddaee'),
)
DIRECT = ('LAUNCH.json', 'RESULT.json', 'RESULT.sha256.json', 'vitest.json',
          'progress.ndjson', 'child.stdout.log', 'child.stderr.log')


def run(*args, cwd=None):
    return subprocess.check_output(args, cwd=cwd).decode().strip()


def git_blob(path):
    return subprocess.check_output(['git', 'show', EVIDENCE_HEAD + ':' + path], cwd=EVIDENCE)


def no_symlink_components(path):
    current = Path('/')
    for component in path.parts[1:]:
        current /= component
        if stat.S_ISLNK(current.lstat().st_mode):
            raise RuntimeError(f'symlink path component: {current}')


def no_active_writer():
    if LOCK.is_symlink() or not LOCK.is_file():
        raise RuntimeError('exact own heavy-lane lock missing or symlinked')
    fd = os.open(LOCK, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        locked = os.read(fd, 512)
        if os.read(fd, 1):
            raise RuntimeError('heavy-lane lock too long')
    finally:
        os.close(fd)
    expected = r'^lane-run 1370-r10-raw-leaf-disposition-r2\.log, started \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [A-Z]+\n$'
    if re.fullmatch(expected, locked.decode('ascii', errors='strict')) is None:
        raise RuntimeError('heavy-lane lock belongs to another job')
    parent = run('ps', '-ww', '-p', str(os.getppid()), '-o', 'args=')
    if not all(token in parent for token in (
            '/Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh',
            str(EXPECTED_LANE_LOG), str(SELF))):
        raise RuntimeError('current process is not the exact locked lane child')
    processes = run('ps', '-ww', '-axo', 'pid=,args=')
    for line in processes.splitlines():
        if any(token in line for token in ('full-state-neutrality.test.ts',
                                            'ag-adoption-clean-r10-ag-adoption-20261007-224614',
                                            'vitest', '/bin/tsc', '/lib/tsc.js')):
            if str(SELF) not in line:
                raise RuntimeError(f'possible source writer or competing heavy job: {line}')
    opened = subprocess.run(['lsof', '+D', str(SOURCE)], capture_output=True, text=True)
    if opened.returncode != 1 or opened.stdout.strip():
        raise RuntimeError(f'open source files or lsof error: {opened.returncode}: {opened.stdout[:400]} {opened.stderr[:400]}')


def verify_committed_archive():
    if run('git', 'rev-parse', 'HEAD', cwd=WORK) != WORK_HEAD:
        raise RuntimeError('work HEAD changed')
    if run('git', 'rev-parse', 'HEAD:src', cwd=WORK) != SOURCE_TREE:
        raise RuntimeError('work source tree changed')
    if run('git', 'status', '--porcelain=v1', cwd=WORK):
        raise RuntimeError('worktree dirty')
    if run('git', 'rev-parse', 'HEAD', cwd=EVIDENCE) != EVIDENCE_HEAD:
        raise RuntimeError('local evidence HEAD changed')
    remote = run('git', 'ls-remote', 'origin', 'refs/heads/evidence/1370-r10-clean-captures', cwd=EVIDENCE)
    if remote != EVIDENCE_HEAD + '\trefs/heads/evidence/1370-r10-clean-captures':
        raise RuntimeError('remote evidence HEAD changed')
    work_remote = run('git', 'ls-remote', 'origin', 'refs/heads/wip/headless-program-20260916-ts', cwd=WORK)
    if work_remote != WORK_HEAD + '\trefs/heads/wip/headless-program-20260916-ts':
        raise RuntimeError('remote work HEAD changed')
    members_raw = git_blob(STAGE + 'MEMBERS.json')
    if hashlib.sha256(members_raw).hexdigest() != MEMBERS_SHA:
        raise RuntimeError('published member manifest changed')
    manifest = json.loads(git_blob(STAGE + 'MANIFEST.json'))
    segments = json.loads(git_blob(STAGE + 'SEGMENTS.json'))
    if (manifest['files']['EVIDENCE.tar.xz']['bytes'] != 113296808 or
            manifest['files']['EVIDENCE.tar.xz']['sha256'] != ARCHIVE_SHA or
            segments['archiveBytes'] != 113296808 or segments['archiveSha256'] != ARCHIVE_SHA or
            len(segments['parts']) != 3):
        raise RuntimeError('published archive manifest mismatch')
    combined = hashlib.sha256()
    total = 0
    for ordinal, (name, size, digest) in enumerate(PARTS):
        if segments['parts'][ordinal] != {'name': name, 'bytes': size, 'sha256': digest}:
            raise RuntimeError(f'published part metadata mismatch: {name}')
        object_spec = EVIDENCE_HEAD + ':' + STAGE + name
        child = subprocess.Popen(['git', 'cat-file', 'blob', object_spec], cwd=EVIDENCE, stdout=subprocess.PIPE)
        part_hash = hashlib.sha256()
        part_bytes = 0
        try:
            for block in iter(lambda: child.stdout.read(CHUNK), b''):
                part_hash.update(block)
                combined.update(block)
                part_bytes += len(block)
        finally:
            child.stdout.close()
        if child.wait() != 0 or part_bytes != size or part_hash.hexdigest() != digest:
            raise RuntimeError(f'published Git blob mismatch: {name}')
        total += part_bytes
    if total != 113296808 or combined.hexdigest() != ARCHIVE_SHA:
        raise RuntimeError('published ordered archive reassembly mismatch')
    return json.loads(members_raw), manifest


def hash_regular(path, inspect_boundary=False):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    st = os.fstat(fd)
    if not stat.S_ISREG(st.st_mode):
        os.close(fd)
        raise RuntimeError(f'nonregular source file: {path}')
    digest = hashlib.sha256()
    size = rows = 0
    pending = last = b''
    with os.fdopen(fd, 'rb') as stream:
        for block in iter(lambda: stream.read(CHUNK), b''):
            digest.update(block)
            size += len(block)
            if inspect_boundary:
                pieces = (pending + block).split(b'\n')
                if len(pieces) > 1:
                    rows += len(pieces) - 1
                    last = pieces[-2]
                pending = pieces[-1]
                if len(pending) > 16 * CHUNK:
                    raise RuntimeError('boundary row exceeds 16 MiB')
    result = {'size': size, 'sha256': digest.hexdigest()}
    if inspect_boundary:
        if pending or rows != 365 or not last.startswith(b'{"boundary":364,"week":364,'):
            raise RuntimeError('failed boundary capture changed')
        result.update(completeRows=rows, lastWeek=364)
    return result


def inventory():
    result = []
    def walk(path, rel):
        st = path.lstat()
        entry = {'path': rel, 'mode': stat.S_IMODE(st.st_mode), 'dev': st.st_dev,
                 'ino': st.st_ino, 'mtimeNs': st.st_mtime_ns, 'ctimeNs': st.st_ctime_ns}
        if stat.S_ISDIR(st.st_mode):
            entry.update(kind='directory', size=0)
        elif stat.S_ISLNK(st.st_mode):
            target = os.readlink(path)
            raw = os.fsencode(target)
            entry.update(kind='symlink', target=target, size=len(raw),
                         sha256=hashlib.sha256(raw).hexdigest())
        elif stat.S_ISREG(st.st_mode):
            entry.update(kind='file', **hash_regular(path, path == SOURCE / 'boundaries.ndjson'))
        else:
            raise RuntimeError(f'unsupported source member: {path}')
        result.append(entry)
        if entry['kind'] == 'directory':
            for child in sorted(path.iterdir(), key=lambda p: os.fsencode(p.name)):
                walk(child, rel + '/' + child.name)
    walk(SOURCE, SOURCE.name)
    return result


def exact_path(entry):
    parts = Path(entry['path']).parts
    if not parts or parts[0] != SOURCE.name or any(p in ('.', '..') for p in parts):
        raise RuntimeError('invalid manifest path')
    return SOURCE.joinpath(*parts[1:])


def verify_source(members, manifest):
    if SOURCE.is_symlink() or not SOURCE.is_dir() or (SOURCE / 'summary.json').exists():
        raise RuntimeError('source root or failed summary state changed')
    raw = inventory()
    if len(raw) != 223 or raw != members['members']:
        raise RuntimeError('raw leaf differs from remotely published exact inventory')
    if members['disposition'] != 'FAILED_PARTIAL_CAPTURE' or manifest['classification'] != 'FAILED_RUN_BYTE_PRESERVATION_ONLY':
        raise RuntimeError('failure label changed')
    if manifest['boundaries'] != {'bytes':1069911027,'completeRows':365,'lastWeek':364,'sha256':BOUNDARIES_SHA}:
        raise RuntimeError('failed boundaries metadata changed')
    for name in DIRECT:
        published = git_blob(STAGE + 'DIRECT/' + name)
        fd = os.open(SOURCE / name, os.O_RDONLY | os.O_NOFOLLOW)
        with os.fdopen(fd, 'rb') as stream:
            actual = stream.read()
        if actual != published or hashlib.sha256(actual).hexdigest() != manifest['direct'][name]['sha256']:
            raise RuntimeError(f'direct failed receipt changed: {name}')
    if hashlib.sha256((SOURCE / 'RESULT.json').read_bytes()).hexdigest() != RESULT_SHA:
        raise RuntimeError('failed RESULT changed')
    return raw


def remove_exact(raw):
    # All complete inventory and published-byte checks precede the first unlink.
    leaves = [entry for entry in raw if entry['kind'] != 'directory']
    dirs = [entry for entry in raw if entry['kind'] == 'directory']
    for entry in sorted(dirs, key=lambda e: (len(Path(e['path']).parts), e['path'])):
        path = exact_path(entry)
        fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        try:
            st = os.fstat(fd)
            if (st.st_dev, st.st_ino, stat.S_IMODE(st.st_mode)) != (
                    entry['dev'], entry['ino'], entry['mode']):
                raise RuntimeError(f'directory changed before chmod: {path}')
            os.fchmod(fd, stat.S_IMODE(st.st_mode) | stat.S_IWUSR)
        finally:
            os.close(fd)
    for entry in leaves:
        path = exact_path(entry)
        st = path.lstat()
        if (st.st_dev, st.st_ino, stat.S_IMODE(st.st_mode), st.st_mtime_ns, st.st_ctime_ns) != (
                entry['dev'], entry['ino'], entry['mode'], entry['mtimeNs'], entry['ctimeNs']):
            raise RuntimeError(f'leaf metadata changed before unlink: {path}')
        if entry['kind'] == 'file':
            if not stat.S_ISREG(st.st_mode) or hash_regular(path)['sha256'] != entry['sha256']:
                raise RuntimeError(f'file changed before unlink: {path}')
        elif not stat.S_ISLNK(st.st_mode) or os.readlink(path) != entry['target']:
            raise RuntimeError(f'symlink changed before unlink: {path}')
        os.unlink(path)
    for entry in sorted(dirs, key=lambda e: (len(Path(e['path']).parts), e['path']), reverse=True):
        path = exact_path(entry)
        fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        try:
            st = os.fstat(fd)
            if (st.st_dev, st.st_ino) != (entry['dev'], entry['ino']) or not stat.S_ISDIR(st.st_mode):
                raise RuntimeError(f'directory changed before rmdir: {path}')
        finally:
            os.close(fd)
        os.rmdir(path)


def main():
    no_symlink_components(SOURCE)
    no_symlink_components(EVIDENCE)
    no_active_writer()
    members, manifest = verify_committed_archive()
    raw = verify_source(members, manifest)
    no_active_writer()
    before = os.statvfs(SOURCE.parent)
    free_before = before.f_bavail * before.f_frsize
    remove_exact(raw)
    if SOURCE.exists() or SOURCE.is_symlink():
        raise RuntimeError('exact source root survived deletion')
    after = os.statvfs(SOURCE.parent)
    free_after = after.f_bavail * after.f_frsize
    print(json.dumps({'status':'EXACT_PUBLISHED_FAILED_RAW_LEAF_REMOVED',
                      'membersRemoved':len(raw), 'source':str(SOURCE),
                      'remoteEvidenceHead':EVIDENCE_HEAD, 'archiveSha256':ARCHIVE_SHA,
                      'freeBytesBefore':free_before, 'freeBytesAfter':free_after,
                      'freeBytesGained':free_after-free_before}, sort_keys=True))


if __name__ == '__main__':
    main()
