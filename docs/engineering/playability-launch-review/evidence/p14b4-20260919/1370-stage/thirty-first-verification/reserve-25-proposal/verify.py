#!/usr/bin/env python3
"""Draft: twenty-fifth fresh remote archive and no-follow source audit.

This script never deletes or chmods source paths. Do not run until independent review.
"""
import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import shlex
import shutil
import stat
import subprocess
import tarfile
import tempfile

REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
REMOTE = 'https://github.com/HSpector1/The-Movies.git'
REF = 'refs/heads/evidence/1370-r10-clean-captures'
REF_SHA = '4566887f3795b07326259b7ab6f0adb19536a12c'
ARCHIVE_COMMIT = 'd1c6bd948ae56b81c9f50361bce20bef805b416f'
BASE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-fifth-verification'
EXPECTED = {
    'SCOPE.json': 'd1e3a946b746b6f5d3471724ac9338ec2b0837208690d325305145fe5056d674',
    'MEMBERS.json': 'b4f3fbfb603b94e3dcf69cf3dd6dc5beb93fbdff5c21c1073f6d01655ce5ce84',
    'MANIFEST.json': 'f3d39a10ef729b41fb5144bd496bb823f57e3a952f86a9e9d30b8f8ccf0cc4a2',
    'REPORT.md': '9812ed3688192da6254b76ce5ddc04ad7dc9a7508897e1cce254d3088dc0e652',
    'REVIEW.md': '36181978f2feef1aa9aa2c70437c7c994ee68d0b8a01587384989033ab195473',
    'RECEIPT.json': '15da1de08443ffd2a867bd022ee582c332595479e69d1198551953a02c296af4',
    'EVIDENCE.tar.gz': '4026eca5b58355ac2832bdf82c766a5754f6e2ad72ddeac5424fdf69a753456c',
}
TAR_SHA = 'a9cb87a253d483d609cb810a7ca5a1525c0fd438acaf5d383b73e6b9c95448f0'
PROTECTED_ROOT = '/Users/zacheryspector/studio-scratch/1369-ebg-r8-observed-green-independent-review-r1'

ASSESSMENT = Path('/Users/zacheryspector/studio-scratch/1370-post-adoption-reserve-assessment-r1/CANDIDATES.json')
ASSESSMENT_SHA = 'b939aee0df883af2e23191751cab6bae40125af9a1d77d338ea5a70d7ff0105c'
PROD_HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
PROD_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
MIN_FREE_KIB = 3 * 1024 * 1024
MIN_FETCH_PREFLIGHT_KIB = 15 * 1024 * 1024 // 4
PROPOSAL = SCRATCH / '1370-twenty-fifth-remote-disposition-proposal-r1'
AUDIT_OUTPUT = SCRATCH / '1370-twenty-fifth-remote-disposition-audit-r1/REPORT.json'
REVIEW = SCRATCH / '1370-twenty-fifth-remote-disposition-independent-review-r1/REVIEW.json'
RESULT_DIR = SCRATCH / '1370-twenty-fifth-remote-disposition-result-r1'
AUDIT_LOG = SCRATCH / 'heavy-queue/1370-twenty-fifth-remote-audit-r1.lane.log'
DISPOSE_LOG = SCRATCH / 'heavy-queue/1370-twenty-fifth-disposition-r1.lane.log'

def sha(raw): return hashlib.sha256(raw).hexdigest()
def fail(message): raise RuntimeError('STOP: ' + message)
def free_kib():
    st = os.statvfs(SCRATCH)
    value = st.f_bavail * st.f_frsize // 1024
    if value < MIN_FREE_KIB: fail(f'free disk below 3 GiB: {value} KiB')
    return value
def df_pk():
    p = subprocess.run(['df','-Pk',str(SCRATCH)],capture_output=True,check=False)
    if p.returncode: fail('df -Pk failed: '+p.stderr.decode(errors='replace')[:300])
    return p.stdout.decode()
def safe_outside(path, roots):
    value = str(path)
    if not Path(value).is_absolute() or any(value == r or value.startswith(r+'/') for r in roots):
        fail('output/control path falls inside candidate root: '+value)
    # Existing ancestors may not be links; don't silently route a receipt into scope.
    node = Path('/')
    for component in Path(value).parts[1:]:
        node /= component
        if os.path.lexists(node) and stat.S_ISLNK(os.lstat(node).st_mode):
            fail('symlink output/control ancestor: '+str(node))
def require_lane(log, script):
    lock = SCRATCH/'HEAVY-LANE-LOCK'
    if not lock.is_file() or lock.is_symlink(): fail('recorded heavy lane lock missing')
    content = lock.read_text()
    if not content.startswith('lane-run '+log.name+', started '): fail('wrong heavy lane lock')
    parent = run('ps','-ww','-p',str(os.getppid()),'-o','command=').decode().strip()
    tokens = shlex.split(parent)
    if not any(t.endswith('/lane-run.sh') for t in tokens) or str(log) not in tokens or str(script) not in tokens:
        fail('current parent is not expected recorded heavy lane')
    meta = Path(str(log)+'.meta')
    if not meta.is_file() or meta.is_symlink(): fail('recorded lane meta missing')
    lines = meta.read_text().splitlines()
    if not lines or not lines[-1].startswith('start;') or str(script) not in lines[0]:
        fail('expected lane command not active')
def run(*cmd):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if p.returncode: fail(f'command failed: {cmd[0:3]!r}: {p.stderr.decode(errors="replace")[:500]}')
    free_kib()
    return p.stdout

def safe_parts(path):
    p = Path(path)
    if not p.is_absolute() or any(x in ('', '.', '..') for x in p.parts[1:]): fail('unsafe path')
    return p.parts[1:]

def open_directory(path):
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in safe_parts(path):
            next_fd = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd); fd = next_fd
        return fd
    except BaseException:
        os.close(fd); raise

def open_parent(path):
    parts = safe_parts(path)
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in parts[:-1]:
            next_fd = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd); fd = next_fd
        return fd, parts[-1]
    except BaseException:
        os.close(fd); raise

def source_entry(path):
    free_kib()
    parent, name = open_parent(path)
    try:
        st = os.stat(name, dir_fd=parent, follow_symlinks=False)
        result = {'path': path, 'dev': st.st_dev, 'ino': st.st_ino,
                  'mode': stat.S_IMODE(st.st_mode), 'size': st.st_size,
                  'mtimeNs': st.st_mtime_ns, 'ctimeNs': st.st_ctime_ns}
        if stat.S_ISDIR(st.st_mode): result['kind'] = 'dir'
        elif stat.S_ISLNK(st.st_mode):
            result['kind'] = 'symlink'
            result['target'] = os.readlink(name, dir_fd=parent)
        elif stat.S_ISREG(st.st_mode):
            result['kind'] = 'file'
            fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent)
            try:
                fst = os.fstat(fd)
                if (fst.st_dev, fst.st_ino) != (st.st_dev, st.st_ino): fail('source replaced during open: '+path)
                h = hashlib.sha256()
                while True:
                    block = os.read(fd, 1024 * 1024)
                    if not block: break
                    h.update(block)
                    free_kib()
                fst = os.fstat(fd)
                if (fst.st_size, fst.st_mtime_ns, fst.st_ctime_ns) != (st.st_size, st.st_mtime_ns, st.st_ctime_ns):
                    fail('source changed during hash: '+path)
                result['sha256'] = h.hexdigest()
            finally: os.close(fd)
        else: fail('special source: '+path)
        return result
    finally: os.close(parent)

def walk(root):
    """Enumerate names by no-follow directory FDs; do not follow links."""
    found = {}
    def visit(path):
        entry = source_entry(path)
        found[path] = entry
        if entry['kind'] != 'dir': return
        parent, name = open_parent(path)
        try:
            fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=parent)
            try: names = sorted(os.listdir(fd))
            finally: os.close(fd)
        finally: os.close(parent)
        for child in names: visit(path + '/' + child)
    visit(root)
    return found

def verify_archive(archive, members):
    seen = []
    raw_tar = gzip.decompress(archive)
    free_kib()
    if sha(raw_tar) != TAR_SHA: fail('uncompressed tar hash mismatch')
    with tarfile.open(fileobj=io.BytesIO(raw_tar), mode='r:') as tar:
        for header in tar:
            name = header.name.rstrip('/')
            if name.startswith('/') or any(p in ('', '.', '..') for p in name.split('/')):
                fail('unsafe tar member name')
            if header.islnk() or header.isdev() or header.isfifo(): fail('unsafe tar member type')
            if header.uid or header.gid or header.uname or header.gname or header.mtime:
                fail('tar metadata changed: '+name)
            kind = 'directory' if header.isdir() else 'symlink' if header.issym() else 'file' if header.isfile() else None
            if kind is None: fail('unexpected tar member type')
            if len(seen) >= len(members): fail('extra tar member')
            expected = members[len(seen)]
            if (name, kind) != (expected['archivePath'], expected['kind']): fail('tar inventory mismatch')
            if stat.S_IMODE(header.mode) != expected['mode']: fail('tar mode changed')
            if kind == 'file':
                h = hashlib.sha256(); count = 0
                stream = tar.extractfile(header)
                if stream is None: fail('tar file cannot be read')
                while True:
                    block = stream.read(1024 * 1024)
                    if not block: break
                    h.update(block); count += len(block)
                    free_kib()
                if (count, h.hexdigest()) != (expected['size'], expected['sha256']): fail('tar file bytes mismatch')
            elif kind == 'symlink':
                if (header.linkname != expected['target'] or header.size
                        or sha(os.fsencode(header.linkname)) != expected['sha256']
                        or len(os.fsencode(header.linkname)) != expected['size']):
                    fail('tar link mismatch')
            elif header.size: fail('tar directory size mismatch')
            seen.append(name)
            free_kib()
    if len(seen) != 1441 or len(set(seen)) != 1441: fail('tar count or uniqueness mismatch')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    if args.output != AUDIT_OUTPUT or args.output.exists(): fail('wrong or existing audit output')
    if sha(ASSESSMENT.read_bytes()) != ASSESSMENT_SHA: fail('assessment pin changed')
    free = free_kib()
    if free < MIN_FETCH_PREFLIGHT_KIB: fail('less than 3.75 GiB before remote retrieval')
    remote_line = run('git', 'ls-remote', REMOTE, REF).decode().strip()
    if remote_line != REF_SHA + '\t' + REF: fail('remote ref moved')
    if run('git','-C',str(REPO),'rev-parse','HEAD').decode().strip() != PROD_HEAD: fail('production HEAD moved')
    if run('git','-C',str(REPO),'rev-parse','HEAD:src').decode().strip() != PROD_TREE: fail('production src tree moved')
    if run('git','-C',str(REPO),'status','--porcelain'): fail('production worktree dirty')
    candidates = json.loads(ASSESSMENT.read_bytes())
    roots = sorted(x['path'] for x in candidates['paths'] if 'twenty-fifth' in x['archiveGroups'] and not x['excludedCurrentR12Reference'])
    protected = sorted(x['path'] for x in candidates['paths'] if 'twenty-fifth' in x['archiveGroups'] and x['excludedCurrentR12Reference'])
    if protected != [PROTECTED_ROOT] or PROTECTED_ROOT in roots: fail('current r12 protected root changed')
    if len(roots) != 12 or any(not p.startswith(str(SCRATCH) + '/') for p in roots): fail('candidate roots changed')
    for path in (PROPOSAL, AUDIT_OUTPUT, REVIEW, RESULT_DIR, AUDIT_LOG,
                 Path(str(AUDIT_LOG)+'.meta'), DISPOSE_LOG, Path(str(DISPOSE_LOG)+'.meta')):
        safe_outside(path, roots)
    if not AUDIT_OUTPUT.parent.is_dir() or AUDIT_OUTPUT.parent.is_symlink():
        fail('pinned audit parent missing or symlink')
    require_lane(AUDIT_LOG, Path(__file__).resolve())
    df_before = df_pk()
    with tempfile.TemporaryDirectory(prefix='1370-25-remote-', dir=SCRATCH) as temporary:
        gitdir = Path(temporary)/'git'; gitdir.mkdir()
        run('git','init','--bare',str(gitdir))
        run('git','-C',str(gitdir),'remote','add','origin',REMOTE)
        run('git','-C',str(gitdir),'config','core.repositoryformatversion','1')
        run('git','-C',str(gitdir),'config','extensions.partialClone','origin')
        run('git','-C',str(gitdir),'config','remote.origin.promisor','true')
        run('git','-C',str(gitdir),'config','remote.origin.partialclonefilter','blob:none')
        if run('git','-C',str(gitdir),'remote','get-url','origin').decode().strip() != REMOTE:
            fail('fresh bare origin changed')
        run('git','-C',str(gitdir),'fetch','--no-tags','--filter=blob:none','--depth=1',
            'origin',ARCHIVE_COMMIT)
        free_kib()
        if run('git','-C',str(gitdir),'rev-parse','FETCH_HEAD').decode().strip() != ARCHIVE_COMMIT:
            fail('remote archive commit mismatch')
        if not tuple((gitdir/'objects/pack').glob('*.promisor')):
            fail('filtered fetch did not produce a promisor pack')
        if (gitdir/'objects/info/alternates').exists(): fail('object alternates present')
        blobs = {}
        for name, digest in EXPECTED.items():
            raw = run('git','-C',str(gitdir),'show',f'{ARCHIVE_COMMIT}:{BASE}/{name}')
            if sha(raw) != digest: fail('remote artifact hash mismatch: '+name)
            blobs[name] = raw
            free_kib()
        scope = json.loads(blobs['SCOPE.json']); index = json.loads(blobs['MEMBERS.json'])
        members = index['members']
        manifest = json.loads(blobs['MANIFEST.json'])
        receipt = json.loads(blobs['RECEIPT.json'])
        if (receipt['decision'] != 'ACCEPT_ARCHIVE_PRESERVATION_ONLY'
                or receipt['gzipSha256'] != EXPECTED['EVIDENCE.tar.gz']
                or receipt['membersSha256'] != EXPECTED['MEMBERS.json']
                or receipt['scopeSha256'] != EXPECTED['SCOPE.json']
                or receipt['manifestSha256'] != EXPECTED['MANIFEST.json']
                or receipt['reviewSha256'] != EXPECTED['REVIEW.md']
                or receipt['tarSha256'] != TAR_SHA
                or receipt['memberCount'] != 1441):
            fail('independent archive scope receipt changed')
        if (manifest['memberCount'] != 1441 or len(scope['roots']) != 13
                or manifest['files']['EVIDENCE.tar.gz']['sha256'] != EXPECTED['EVIDENCE.tar.gz']
                or manifest['files']['MEMBERS.json']['sha256'] != EXPECTED['MEMBERS.json']
                or manifest['files']['EVIDENCE.tar']['sha256'] != TAR_SHA
                or manifest['counts'] != {'directory':128,'file':1308,'symlink':5}
                or index['scopeSha256'] != EXPECTED['SCOPE.json']):
            fail('manifest mismatch')
        if {x['source'] for x in scope['roots']} != set(roots) | set(protected):
            fail('candidate roots not all in remote scope')
        if (len(members) != 1441 or len({x['archivePath'] for x in members}) != 1441
                or len({x['source'] for x in members}) != 1441):
            fail('remote member list malformed')
        verify_archive(blobs['EVIDENCE.tar.gz'], members)
        expected = {m['source']:m for m in members}
        if len(expected) != len(members): fail('duplicate source')
        # Every present source, including protected repo/log inputs, is compared.
        current = {}
        for source, m in expected.items():
            actual = source_entry(source)
            if {'dir':'directory','file':'file','symlink':'symlink'}[actual['kind']] != m['kind']:
                fail('source kind changed: '+source)
            if actual['mode'] != m['mode']: fail('source mode changed: '+source)
            if m['kind'] == 'file' and (actual['size'], actual['sha256']) != (m['size'], m['sha256']):
                fail('source bytes changed: '+source)
            if m['kind'] == 'symlink' and (actual['target'] != m['target']
                    or sha(os.fsencode(actual['target'])) != m['sha256']
                    or len(os.fsencode(actual['target'])) != m['size']):
                fail('source link changed: '+source)
            current[source] = actual
        for root in roots:
            for path, actual in walk(root).items():
                if path in current:
                    if actual != current[path]: fail('source changed during tree scan: '+path)
                else: fail('unarchived path inside root: '+path)
        report = {'schema':'1370-25-remote-restore-current-audit-r1','status':'DRY_RUN_ONLY',
                  'remoteRef': REF_SHA,'archiveCommit':ARCHIVE_COMMIT,
                  'archiveSha256':EXPECTED['EVIDENCE.tar.gz'],'memberCount':len(members),
                  'archiveScopeReceiptSha256':EXPECTED['RECEIPT.json'],
                  'fetchFilter':'blob:none','fetchDepth':1,
                  'candidateRoots':roots,'protectedCurrentR12Root':PROTECTED_ROOT,
                  'currentSources':current,'excludedCacheEntries':{},
                  'freeKiBBefore':free,'freeKiBAfter':free_kib(),
                  'dfPkBefore':df_before,'dfPkBeforeReport':df_pk()}
        if report['freeKiBAfter'] < MIN_FREE_KIB: fail('less than 3 GiB after audit')
        free_kib()
        args.output.write_text(json.dumps(report,sort_keys=True,indent=2)+'\n')
        free_kib()
        print(json.dumps({'status':'DRY_RUN_ONLY','roots':len(roots),'members':len(members),
                          'protectedCurrentR12Root':PROTECTED_ROOT,
                          'excludedCacheEntries':0,'reportSha256':sha(args.output.read_bytes()),
                          'freeKiB':free_kib(),'dfPkAfterReport':df_pk()},sort_keys=True))

if __name__ == '__main__': main()
