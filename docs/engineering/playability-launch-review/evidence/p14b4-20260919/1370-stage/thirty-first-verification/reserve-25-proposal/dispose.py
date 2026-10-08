#!/usr/bin/env python3
"""Draft exact-path cleanup, gated by independent review of verify.py output.

Do not run until verify.py and this file receive independent static/observed review.
Only the 12 reviewed scratch roots may be removed. STOP is durable before unlink.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from verify import (ARCHIVE_COMMIT, ASSESSMENT, ASSESSMENT_SHA, EXPECTED,
                    AUDIT_OUTPUT, REVIEW, RESULT_DIR, PROPOSAL, AUDIT_LOG, DISPOSE_LOG,
                    MIN_FREE_KIB, PROD_HEAD, PROD_TREE,
                    REPO, SCRATCH, REF, REF_SHA, REMOTE, PROTECTED_ROOT, fail, run, sha,
                    source_entry, walk, open_parent, open_directory,
                    free_kib, df_pk, safe_outside, require_lane)

DECISION = 'ACCEPT_1370_25_REMOTE_DISPOSITION_R1'

def lsof_guard(roots):
    for root in roots:
        try:
            p = subprocess.run(['lsof', '-Fn', '+D', root], capture_output=True, timeout=90, check=False)
        except (OSError, subprocess.TimeoutExpired) as exc:
            fail('lsof unavailable or timed out: '+repr(exc))
        # lsof returns 1 for no matching open files. Any output or other code stops.
        if p.stdout or p.stderr or p.returncode != 1:
            fail('lsof root has open files or abnormal result: '+root)
    proc = run('ps','-ww','-axo','pid=,command=').decode(errors='replace')
    for line in proc.splitlines():
        if 'lane-run.sh' in line and str(Path(__file__).resolve()) not in line:
            fail('heavy lane process active')

def durable_json(directory, name, payload, replace=False):
    """Write through a no-follow directory FD and sync file and parent."""
    parent = open_directory(directory)
    temp = f'.{name}.{os.getpid()}.tmp' if replace else name
    try:
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW
        fd = os.open(temp, flags, 0o600, dir_fd=parent)
        try:
            raw = (json.dumps(payload, sort_keys=True, indent=2)+'\n').encode()
            position = 0
            while position < len(raw):
                position += os.write(fd, raw[position:])
            os.fsync(fd)
        finally: os.close(fd)
        if replace:
            os.replace(temp, name, src_dir_fd=parent, dst_dir_fd=parent)
        os.fsync(parent)
    finally: os.close(parent)

def check_snapshot(report):
    expected = report['currentSources']; excluded = report['excludedCacheEntries']
    if not expected or excluded != {}: fail('incomplete or unexpected dry-run report')
    for path, old in expected.items():
        if source_entry(path) != old: fail('archived source changed: '+path)
    seen = {}
    for root in report['candidateRoots']:
        seen.update(walk(root))
    if set(seen) != ({p for p in expected if any(p == r or p.startswith(r+'/') for r in report['candidateRoots'])}
                     | set(excluded)):
        fail('candidate tree membership changed')
    for path, now in seen.items():
        old = expected.get(path, excluded.get(path))
        if now != old: fail('candidate entry changed: '+path)

def nofollow_remove(root, snapshot):
    """Recheck every object immediately before FD-anchored unlink/rmdir."""
    parent, name = open_parent(root)
    try:
        def remove_in(dir_fd, child_name, path):
            st = os.stat(child_name, dir_fd=dir_fd, follow_symlinks=False)
            old = snapshot.get(path)
            if old is None or (st.st_dev, st.st_ino, stat.S_IMODE(st.st_mode), st.st_size,
                               st.st_mtime_ns, st.st_ctime_ns) != (
                    old['dev'], old['ino'], old['mode'], old['size'], old['mtimeNs'], old['ctimeNs']):
                fail('entry changed during deletion: '+path)
            if stat.S_ISDIR(st.st_mode):
                child_fd = os.open(child_name, os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW, dir_fd=dir_fd)
                try:
                    if (os.fstat(child_fd).st_dev, os.fstat(child_fd).st_ino) != (st.st_dev, st.st_ino):
                        fail('directory replaced during open: '+path)
                    for item in sorted(os.listdir(child_fd)):
                        remove_in(child_fd, item, path+'/'+item)
                    if os.listdir(child_fd): fail('new child appeared: '+path)
                finally: os.close(child_fd)
                # Child removals change directory mtime/ctime; check identity and type only.
                after = os.stat(child_name, dir_fd=dir_fd, follow_symlinks=False)
                if (after.st_dev, after.st_ino) != (st.st_dev, st.st_ino) or not stat.S_ISDIR(after.st_mode):
                    fail('directory replaced before rmdir: '+path)
                os.rmdir(child_name, dir_fd=dir_fd)
            else:
                # Rehash files through O_NOFOLLOW and recheck the link target.
                now = source_entry(path)
                if now != old: fail('entry bytes changed before unlink: '+path)
                os.unlink(child_name, dir_fd=dir_fd)
        remove_in(parent, name, root)
    finally: os.close(parent)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--audit',required=True,type=Path)
    p.add_argument('--review',required=True,type=Path)
    p.add_argument('--output-dir',required=True,type=Path)
    args = p.parse_args()
    if (args.audit, args.review, args.output_dir) != (AUDIT_OUTPUT, REVIEW, RESULT_DIR):
        fail('only pinned audit/review/result paths allowed')
    if sha(ASSESSMENT.read_bytes()) != ASSESSMENT_SHA: fail('candidate assessment changed')
    candidates = json.loads(ASSESSMENT.read_bytes())
    pinned_roots = sorted(x['path'] for x in candidates['paths'] if 'twenty-fifth' in x['archiveGroups'] and not x['excludedCurrentR12Reference'])
    protected = sorted(x['path'] for x in candidates['paths'] if 'twenty-fifth' in x['archiveGroups'] and x['excludedCurrentR12Reference'])
    if protected != [PROTECTED_ROOT] or PROTECTED_ROOT in pinned_roots: fail('protected current r12 root changed')
    if len(pinned_roots) != 12: fail('wrong root count')
    for path in (PROPOSAL, AUDIT_OUTPUT, REVIEW, RESULT_DIR, AUDIT_LOG,
                 Path(str(AUDIT_LOG)+'.meta'), DISPOSE_LOG, Path(str(DISPOSE_LOG)+'.meta')):
        safe_outside(path, pinned_roots)
    if args.output_dir.exists() or args.output_dir.is_symlink(): fail('receipt output already exists')
    require_lane(DISPOSE_LOG, Path(__file__).resolve())
    free_kib()
    raw = args.audit.read_bytes(); report = json.loads(raw)
    review = json.loads(args.review.read_bytes())
    if review.get('decision') != DECISION: fail('independent review not accepted')
    if review.get('auditSha256') != sha(raw): fail('audit report not reviewed')
    if review.get('verifyScriptSha256') != sha((Path(__file__).parent/'verify.py').read_bytes()):
        fail('verifier source not reviewed')
    if review.get('disposeScriptSha256') != sha(Path(__file__).read_bytes()):
        fail('disposition source not reviewed')
    if (report.get('schema') != '1370-25-remote-restore-current-audit-r1'
            or report.get('status') != 'DRY_RUN_ONLY' or report.get('remoteRef') != REF_SHA
            or report.get('fetchFilter') != 'blob:none' or report.get('fetchDepth') != 1
            or report.get('archiveScopeReceiptSha256') != EXPECTED['RECEIPT.json']
            or report.get('protectedCurrentR12Root') != PROTECTED_ROOT
            or report.get('memberCount') != 1441):
        fail('wrong dry-run report')
    roots = report['candidateRoots']
    if len(roots) != 12 or roots != sorted(set(roots)) or any(not r.startswith(str(SCRATCH)+'/') for r in roots):
        fail('exact root set changed')
    if roots != pinned_roots or report.get('archiveCommit') != ARCHIVE_COMMIT or report.get('archiveSha256') != EXPECTED['EVIDENCE.tar.gz']:
        fail('reviewed archive or candidate roots changed')
    current_remote = run('git','ls-remote',REMOTE,REF).decode().strip()
    if current_remote != REF_SHA+'\t'+REF: fail('remote ref moved')
    if run('git','-C',str(REPO),'rev-parse','HEAD').decode().strip() != PROD_HEAD:
        fail('production HEAD changed')
    if run('git','-C',str(REPO),'rev-parse','HEAD:src').decode().strip() != PROD_TREE:
        fail('production source tree changed')
    if run('git','-C',str(REPO),'status','--porcelain'): fail('production worktree dirty')
    free_kib()
    lsof_guard(roots)
    check_snapshot(report)
    df_before = df_pk()
    scratch_fd = open_directory(SCRATCH)
    try:
        os.mkdir(args.output_dir.name, mode=0o700, dir_fd=scratch_fd)
        os.fsync(scratch_fd)
    finally: os.close(scratch_fd)
    marker = {'schema':'1370-25-disposition-stop-marker-r1','status':'STOP_BEFORE_DELETE',
              'auditSha256':sha(raw),'reviewSha256':sha(args.review.read_bytes()),
              'roots':roots,'protectedCurrentR12Root':PROTECTED_ROOT,
              'archiveCommit':report['archiveCommit'],
              'archiveSha256':report['archiveSha256'],
              'freeKiBBefore':free_kib(),'dfPkBefore':df_before}
    durable_json(args.output_dir,'STOP.json',marker)
    snapshot = {**report['currentSources'], **report['excludedCacheEntries']}
    removed = []
    try:
        for root in roots:
            require_lane(DISPOSE_LOG, Path(__file__).resolve())
            free_kib()
            lsof_guard([root])
            nofollow_remove(root,snapshot)
            if os.path.lexists(root): fail('root still exists: '+root)
            removed.append(root)
            free_after = free_kib()
            durable_json(args.output_dir,'PROGRESS.json',
                         {'removedRoots':removed,'freeKiB':free_after,
                          'dfPkAfterRoot':df_pk()},replace=True)
    except BaseException as exc:
        durable_json(args.output_dir,'FAILURE.json',
                     {'status':'STOP_PARTIAL','removedRoots':removed,'error':repr(exc),
                      'dfPkAtStop':df_pk()})
        raise
    receipt = {'schema':'1370-25-disposition-r1','status':'PASS_EXACT_ROOTS_REMOVED',
               'removedRoots':removed,'auditSha256':sha(raw),
               'freeKiBBefore':marker['freeKiBBefore'],
               'freeKiBAfter':free_kib(),'dfPkAfter':df_pk()}
    durable_json(args.output_dir,'RESULT.json',receipt)
    print(json.dumps(receipt,sort_keys=True))

if __name__ == '__main__': main()
