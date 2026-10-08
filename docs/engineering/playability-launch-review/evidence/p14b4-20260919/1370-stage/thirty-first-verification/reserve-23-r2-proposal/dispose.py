#!/usr/bin/env python3
"""Draft exact-path removal of 13 archived disjoint historical scratch roots; independent review required."""
import argparse
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
from verify import (ARCHIVE_COMMIT,ASSESSMENT,ASSESSMENT_SHA,EXPECTED,AUDIT_OUTPUT,REVIEW,RESULT_DIR,PROPOSAL,
                    AUDIT_LOG,DISPOSE_LOG,MIN_FREE_KIB,PROD_HEAD,PROD_TREE,REPO,SCRATCH,REF,REF_SHA,REMOTE,
                    PRIOR_RESULT,PRIOR_RESULT_SHA,split_roots,fail,run,sha,source_entry,walk,open_parent,
                    open_directory,free_kib,df_pk,safe_outside,require_lane)
DECISION='ACCEPT_1370_23_DISJOINT_REMOTE_DISPOSITION_R2'

def lsof_guard(roots):
    for root in roots:
        flag=['+D',root] if os.path.isdir(root) else ['--',root]
        try: p=subprocess.run(['lsof','-Fn',*flag],capture_output=True,timeout=90,check=False)
        except (OSError,subprocess.TimeoutExpired) as exc: fail('lsof unavailable or timed out: '+repr(exc))
        if p.stdout or p.stderr or p.returncode!=1: fail('open file or abnormal lsof result: '+root)
    proc=run('ps','-ww','-axo','pid=,command=').decode(errors='replace')
    for line in proc.splitlines():
        if 'lane-run.sh' in line and str(Path(__file__).resolve()) not in line: fail('another heavy lane active')

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
    expected = report['currentSources']; excluded = {}
    if not expected: fail('incomplete dry-run report')
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
    p=argparse.ArgumentParser()
    p.add_argument('--audit',required=True,type=Path)
    p.add_argument('--review',required=True,type=Path)
    p.add_argument('--output-dir',required=True,type=Path)
    args=p.parse_args()
    if (args.audit,args.review,args.output_dir)!=(AUDIT_OUTPUT,REVIEW,RESULT_DIR): fail('only pinned paths allowed')
    if sha(ASSESSMENT.read_bytes())!=ASSESSMENT_SHA: fail('assessment changed')
    roots,missing,all_roots=split_roots(json.loads(ASSESSMENT.read_bytes()))
    for path in (PROPOSAL,AUDIT_OUTPUT,REVIEW,RESULT_DIR,AUDIT_LOG,Path(str(AUDIT_LOG)+'.meta'),DISPOSE_LOG,Path(str(DISPOSE_LOG)+'.meta')):
        safe_outside(path,all_roots)
    if os.path.lexists(args.output_dir): fail('result directory already exists')
    require_lane(DISPOSE_LOG,Path(__file__).resolve())
    free_kib()
    raw=args.audit.read_bytes();report=json.loads(raw);review=json.loads(args.review.read_bytes())
    if review.get('decision')!=DECISION or review.get('auditSha256')!=sha(raw): fail('independent observed review absent')
    if review.get('verifyScriptSha256')!=sha((Path(__file__).parent/'verify.py').read_bytes()): fail('verifier source changed')
    if review.get('disposeScriptSha256')!=sha(Path(__file__).read_bytes()): fail('disposer source changed')
    if (report.get('schema')!='1370-23-disjoint-remote-current-audit-r2' or report.get('status')!='DRY_RUN_ONLY'
            or report.get('remoteRef')!=REF_SHA or report.get('archiveCommit')!=ARCHIVE_COMMIT
            or report.get('archiveSha256')!=EXPECTED['evidence.tar.gz']
            or report.get('archiveScopeReceiptSha256')!=EXPECTED['RECEIPT.json']
            or report.get('memberCount')!=560 or report.get('presentSourceCount')!=138
            or report.get('priorRemovedSourceCount')!=422 or report.get('fetchFilter')!='blob:none'
            or report.get('fetchDepth')!=1 or report.get('candidateRoots')!=roots
            or report.get('priorRemovedRoots')!=missing): fail('audit report identity changed')
    if sha(PRIOR_RESULT.read_bytes())!=PRIOR_RESULT_SHA: fail('prior disposition result changed')
    if run('git','ls-remote',REMOTE,REF).decode().strip()!=REF_SHA+'\t'+REF: fail('remote ref moved')
    if run('git','-C',str(REPO),'rev-parse','HEAD').decode().strip()!=PROD_HEAD: fail('production HEAD changed')
    if run('git','-C',str(REPO),'rev-parse','HEAD:src').decode().strip()!=PROD_TREE: fail('source tree changed')
    if run('git','-C',str(REPO),'status','--porcelain'): fail('production worktree dirty')
    lsof_guard(roots)
    check_snapshot(report)
    df_before=df_pk()
    scratch_fd=open_directory(SCRATCH)
    try:
        os.mkdir(args.output_dir.name,mode=0o700,dir_fd=scratch_fd)
        os.fsync(scratch_fd)
    finally: os.close(scratch_fd)
    marker={'schema':'1370-23-disjoint-stop-r2','status':'STOP_BEFORE_DELETE','auditSha256':sha(raw),
            'reviewSha256':sha(args.review.read_bytes()),'roots':roots,'priorRemovedRoots':missing,
            'archiveCommit':ARCHIVE_COMMIT,'archiveSha256':EXPECTED['evidence.tar.gz'],
            'freeKiBBefore':free_kib(),'dfPkBefore':df_before}
    durable_json(args.output_dir,'STOP.json',marker)
    snapshot=report['currentSources'];removed=[]
    try:
        for root in roots:
            require_lane(DISPOSE_LOG,Path(__file__).resolve())
            free_kib();lsof_guard([root])
            nofollow_remove(root,snapshot)
            if os.path.lexists(root): fail('root still exists: '+root)
            removed.append(root)
            durable_json(args.output_dir,'PROGRESS.json',{'removedRoots':removed,'freeKiB':free_kib(),
                         'dfPkAfterRoot':df_pk()},replace=True)
    except BaseException as exc:
        durable_json(args.output_dir,'FAILURE.json',{'status':'STOP_PARTIAL','removedRoots':removed,
                     'error':repr(exc),'dfPkAtStop':df_pk()})
        raise
    result={'schema':'1370-23-disjoint-disposition-r2','status':'PASS_EXACT_ROOTS_REMOVED',
            'removedRoots':removed,'priorRemovedRoots':missing,'auditSha256':sha(raw),
            'freeKiBBefore':marker['freeKiBBefore'],'freeKiBAfter':free_kib(),'dfPkAfter':df_pk()}
    durable_json(args.output_dir,'RESULT.json',result)
    print(json.dumps(result,sort_keys=True))

if __name__=='__main__': main()
