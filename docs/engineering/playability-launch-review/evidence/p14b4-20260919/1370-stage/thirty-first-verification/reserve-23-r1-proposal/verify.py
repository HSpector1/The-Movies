#!/usr/bin/env python3
"""Draft: fresh remote archive and present-source byte audit for 13 remaining roots. Do not run before independent review."""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import shlex
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
BASE = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-third-verification'
EXPECTED = {'MANIFEST.json': '11087369c3d52c8eae19017942f9c17f1e398583d46d387011935de39a456f68', 'MEMBERS.json': 'dc13613225440452ee879c73e1c836d2e90b08dd7ed2f71e7283aefc40a7c874', 'RECEIPT.json': '2017e0e88efe08dda2b4c6a5931aa0108970ceed7c3136fd6a39cf0b9dbd106b', 'REVIEW.md': 'a878f0830066d21a198be35b6d76ab5e5c933f91b856eb9f571641c4cfe11bff', 'SCOPE.json': '3cc2a9ad78cf4d587728abb07334b7058cc427ba348ef86b3252894265caf577', 'build.py': '86b3408899d66a7b4fc2fb07ffc2d68b074f52e617d4680b4130d289e181458c', 'evidence.tar.gz': '00f6888a1ea3c7a8209d3194010ec0d0caad77dd0664da234df6dae45712a19'}
ASSESSMENT = Path('/Users/zacheryspector/studio-scratch/1370-post-adoption-reserve-assessment-r1/CANDIDATES.json')
ASSESSMENT_SHA = 'b939aee0df883af2e23191751cab6bae40125af9a1d77d338ea5a70d7ff0105c'
PROD_HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
PROD_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
MIN_FREE_KIB = 3 * 1024 * 1024
MIN_FETCH_PREFLIGHT_KIB = 15 * 1024 * 1024 // 4
PROPOSAL = SCRATCH / '1370-twenty-third-disjoint-remote-disposition-proposal-r1'
AUDIT_OUTPUT = SCRATCH / '1370-twenty-third-disjoint-remote-disposition-audit-r1/REPORT.json'
REVIEW = SCRATCH / '1370-twenty-third-disjoint-remote-disposition-independent-review-r1/REVIEW.json'
RESULT_DIR = SCRATCH / '1370-twenty-third-disjoint-remote-disposition-result-r1'
AUDIT_LOG = SCRATCH / 'heavy-queue/1370-twenty-third-disjoint-remote-audit-r1.lane.log'
DISPOSE_LOG = SCRATCH / 'heavy-queue/1370-twenty-third-disjoint-disposition-r1.lane.log'
PRIOR_RESULT = SCRATCH / '1370-twenty-second-remote-disposition-result-r3/RESULT.json'
PRIOR_RESULT_SHA = 'fd3d7ad46a67523bad7b7f20111c123667a5d2e39444f1ea29d9ef21a8924942'
ABSENT_ROOT_NAMES = ('1370-c0-external-observer-proposal-r3','1370-c0-observer-independent-review-r3')

def split_roots(candidates):
    all_roots = sorted(x['path'] for x in candidates['paths'] if 'twenty-third' in x['archiveGroups'])
    missing = sorted(str(SCRATCH / n) for n in ABSENT_ROOT_NAMES)
    roots = sorted(set(all_roots) - set(missing))
    if len(all_roots) != 15 or len(roots) != 13 or len(set(all_roots)) != 15:
        fail('historical root set changed')
    if not all(p.startswith(str(SCRATCH)+'/') for p in all_roots): fail('non-scratch candidate')
    if sha(PRIOR_RESULT.read_bytes()) != PRIOR_RESULT_SHA: fail('prior disposition result changed')
    prior = json.loads(PRIOR_RESULT.read_bytes())
    if prior.get('status') != 'PASS_EXACT_ROOTS_REMOVED' or not set(missing) <= set(prior.get('removedRoots', [])):
        fail('prior disposition does not cover missing roots')
    if not all(not os.path.lexists(p) for p in missing): fail('prior removed root reappeared')
    if not all(os.path.lexists(p) for p in roots): fail('remaining root absent')
    return roots, missing, all_roots

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
    with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as tar:
        for header in tar:
            name = header.name.rstrip('/')
            if name.startswith('/') or any(p in ('', '.', '..') for p in name.split('/')):
                fail('unsafe tar member name')
            if header.islnk() or header.isdev() or header.isfifo(): fail('unsafe tar member type')
            if header.uid or header.gid or header.uname or header.gname or header.mtime:
                fail('tar metadata changed: '+name)
            kind = 'dir' if header.isdir() else 'symlink' if header.issym() else 'file' if header.isfile() else None
            if kind is None: fail('unexpected tar member type')
            if stat.S_IMODE(header.mode) != (0o755 if kind == 'dir' else 0o644): fail('tar mode changed')
            if len(seen) >= len(members): fail('extra tar member')
            expected = members[len(seen)]
            if (name, kind) != (expected['name'], expected['kind']): fail('tar inventory mismatch')
            if kind == 'file':
                h = hashlib.sha256(); count = 0
                stream = tar.extractfile(header)
                if stream is None: fail('tar file cannot be read')
                while True:
                    block = stream.read(1024 * 1024)
                    if not block: break
                    h.update(block); count += len(block)
                    free_kib()
                if (count, h.hexdigest()) != (expected['bytes'], expected['sha256']): fail('tar file bytes mismatch')
            elif kind == 'symlink':
                if header.linkname != expected['target'] or header.size: fail('tar link mismatch')
            elif header.size: fail('tar directory size mismatch')
            seen.append(name)
            free_kib()
    if len(seen) != 560 or len(set(seen)) != 560: fail('tar count or uniqueness mismatch')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    if args.output != AUDIT_OUTPUT or os.path.lexists(args.output): fail('wrong or existing audit output')
    if sha(ASSESSMENT.read_bytes()) != ASSESSMENT_SHA: fail('assessment pin changed')
    candidates = json.loads(ASSESSMENT.read_bytes())
    roots, missing, all_roots = split_roots(candidates)
    free = free_kib()
    if free < MIN_FETCH_PREFLIGHT_KIB: fail('less than 3.75 GiB before remote retrieval')
    if run('git','ls-remote',REMOTE,REF).decode().strip() != REF_SHA+'\t'+REF: fail('remote ref moved')
    if run('git','-C',str(REPO),'rev-parse','HEAD').decode().strip() != PROD_HEAD: fail('production HEAD moved')
    if run('git','-C',str(REPO),'rev-parse','HEAD:src').decode().strip() != PROD_TREE: fail('production src tree moved')
    if run('git','-C',str(REPO),'status','--porcelain'): fail('production worktree dirty')
    for path in (PROPOSAL,AUDIT_OUTPUT,REVIEW,RESULT_DIR,AUDIT_LOG,Path(str(AUDIT_LOG)+'.meta'),DISPOSE_LOG,Path(str(DISPOSE_LOG)+'.meta')):
        safe_outside(path,all_roots)
    if not AUDIT_OUTPUT.parent.is_dir() or AUDIT_OUTPUT.parent.is_symlink(): fail('audit parent missing or symlink')
    require_lane(AUDIT_LOG,Path(__file__).resolve())
    df_before = df_pk()
    with tempfile.TemporaryDirectory(prefix='1370-23-disjoint-remote-',dir=SCRATCH) as temporary:
        gitdir=Path(temporary)/'git'; gitdir.mkdir()
        run('git','init','--bare',str(gitdir))
        run('git','-C',str(gitdir),'remote','add','origin',REMOTE)
        run('git','-C',str(gitdir),'config','core.repositoryformatversion','1')
        run('git','-C',str(gitdir),'config','extensions.partialClone','origin')
        run('git','-C',str(gitdir),'config','remote.origin.promisor','true')
        run('git','-C',str(gitdir),'config','remote.origin.partialclonefilter','blob:none')
        if run('git','-C',str(gitdir),'remote','get-url','origin').decode().strip() != REMOTE: fail('bare origin changed')
        run('git','-C',str(gitdir),'fetch','--no-tags','--filter=blob:none','--depth=1','origin',ARCHIVE_COMMIT)
        if run('git','-C',str(gitdir),'rev-parse','FETCH_HEAD').decode().strip() != ARCHIVE_COMMIT: fail('archive commit mismatch')
        if not tuple((gitdir/'objects/pack').glob('*.promisor')): fail('missing promisor pack')
        if (gitdir/'objects/info/alternates').exists(): fail('object alternates present')
        blobs={}
        for name,digest in EXPECTED.items():
            raw=run('git','-C',str(gitdir),'show',f'{ARCHIVE_COMMIT}:{BASE}/{name}')
            if sha(raw)!=digest: fail('remote artifact hash mismatch: '+name)
            blobs[name]=raw
        scope=json.loads(blobs['SCOPE.json']);members=json.loads(blobs['MEMBERS.json'])
        manifest=json.loads(blobs['MANIFEST.json']);receipt=json.loads(blobs['RECEIPT.json'])
        if (receipt['decision']!='ACCEPT_ARCHIVE_SCOPE_ONLY' or receipt['package']!='1370-CD-EVIDENCE-ARCHIVE-R1'
                or receipt['archiveSha256']!=EXPECTED['evidence.tar.gz'] or receipt['manifestSha256']!=EXPECTED['MANIFEST.json']
                or receipt['buildSha256']!=EXPECTED['build.py'] or receipt['members']!=560): fail('scope receipt changed')
        if (manifest['archiveSha256']!=EXPECTED['evidence.tar.gz'] or manifest['membersSha256']!=EXPECTED['MEMBERS.json']
                or manifest['scopeSha256']!=EXPECTED['SCOPE.json'] or manifest['members']!=560
                or (manifest['regular'],manifest['directories'],manifest['symlinks'])!=(505,53,2)):
            fail('manifest mismatch')
        if (scope['schema']!='1370-cd-exact-archive-scope-r1' or scope['exclusions']!=[]
                or sorted(str(SCRATCH/x) for x in scope['scratchRoots'])!=all_roots): fail('scope roots changed')
        if len(members)!=560 or len({x['name'] for x in members})!=560 or len({x['source'] for x in members})!=560:
            fail('member list malformed')
        verify_archive(blobs['evidence.tar.gz'],members)
        expected={m['source']:m for m in members}; current={}; absent=[]
        for source,m in expected.items():
            if any(source==r or source.startswith(r+'/') for r in missing):
                if os.path.lexists(source): fail('prior removed source reappeared: '+source)
                absent.append(source);continue
            actual=source_entry(source)
            if actual['kind']!=m['kind']: fail('source kind changed: '+source)
            if m['kind']=='file' and (actual['size'],actual['sha256'])!=(m['bytes'],m['sha256']): fail('source bytes changed: '+source)
            if m['kind']=='symlink' and actual['target']!=m['target']: fail('source link changed: '+source)
            current[source]=actual
        if len(absent)!=422: fail('prior removed membership changed')
        for root in roots:
            for path,actual in walk(root).items():
                if path not in current: fail('unarchived path inside target: '+path)
                if actual!=current[path]: fail('source changed during tree scan: '+path)
        report={'schema':'1370-23-disjoint-remote-current-audit-r1','status':'DRY_RUN_ONLY',
                'remoteRef':REF_SHA,'archiveCommit':ARCHIVE_COMMIT,'archiveSha256':EXPECTED['evidence.tar.gz'],
                'archiveScopeReceiptSha256':EXPECTED['RECEIPT.json'],'memberCount':560,
                'presentSourceCount':len(current),'priorRemovedSourceCount':len(absent),
                'candidateRoots':roots,'priorRemovedRoots':missing,'currentSources':current,
                'fetchFilter':'blob:none','fetchDepth':1,'freeKiBBefore':free,'freeKiBAfter':free_kib(),
                'dfPkBefore':df_before,'dfPkBeforeReport':df_pk()}
        free_kib()
        args.output.write_text(json.dumps(report,sort_keys=True,indent=2)+'\n')
        free_kib()
        print(json.dumps({'status':'DRY_RUN_ONLY','roots':len(roots),'members':560,'presentSources':len(current),
                          'reportSha256':sha(args.output.read_bytes()),'dfPkAfterReport':df_pk()},sort_keys=True))

if __name__=='__main__': main()
