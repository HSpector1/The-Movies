#!/usr/bin/env python3
"""UNRUN Stage41 evidence publisher r4; launch requires reviewed threat model."""
from __future__ import annotations
import argparse, hashlib, json, math, os, select, selectors, signal, stat, subprocess, sys, time
from pathlib import Path, PurePosixPath

REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH=Path('/Users/zacheryspector/studio-scratch')
HERE=Path(__file__).resolve().parent
COMMON=Path('/Users/zacheryspector/The Movies - Unity Production Convergence 80H/.git')
OBJECTS=COMMON/'objects'
MAP=SCRATCH/'1370-c0-stage41-h-attribution-evidence-backup-plan-r1/SOURCE-CANDIDATE-MAP.json'
MAP_REVIEW=SCRATCH/'1370-c0-stage41-h-attribution-source-map-independent-review-r1/RECEIPT.json'
MAP_SHA='16087fcaa2836456044ba911ae5e7033fa70fda6e882a06033f94de0b509703c'
MAP_REVIEW_SHA='818fbf056228e85b6a449b8eca245b0654904fbfcb413628e158079b2269b14b'
BASE='eb58bc0042ebf0c02a16d0bdaa1f5734e1f5f9eb'
PRODUCTION_HEAD='a3da64a9a267ec5ac66544c70bff7a75e0e02e52'
SOURCE_TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EVIDENCE_REF='refs/heads/evidence/1370-r10-clean-captures'
PRODUCTION_REF='refs/heads/wip/headless-program-20260916-ts'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
PREFIX='docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/forty-first-verification/'
FLOOR=3*1024**3; ACTIVE_SECONDS=870; OUTPUT_CAP=2*1024**2; RAW_CAP=16*1024**2
MAX_ROW_BYTES=64*1024; DIR_FLAGS=os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW
AMENDMENT_PLAN=SCRATCH/'1370-c0-stage41-publisher-concurrent-rename-amendment-design-r1/PLAN.md'
AMENDMENT_PLAN_SHA='230e05e3280115ab9891ae50af5003852f8ac843da79dfde873e388b7b282289'
AMENDMENT_REVIEW=SCRATCH/'1370-c0-stage41-publisher-concurrent-rename-amendment-independent-review-r1/RECEIPT.json'
AMENDMENT_REVIEW_SHA='4580b147a48590fc0870032c18760ecdd20bd0a3a4771aefa05b9ba89bf0fd40'
START=None; LOGS=None; STAGE=None; WATCH=None

def need(ok, why):
    if not ok: raise RuntimeError(why)
def sha(data): return hashlib.sha256(data).hexdigest()
def free_bytes():
    s=os.statvfs(SCRATCH); return s.f_bavail*s.f_frsize
def clean_env(extra=None):
    env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
    env['GIT_OPTIONAL_LOCKS']='0'
    if extra: env.update(extra)
    return env

def open_dir(path):
    path=Path(path)
    need(path.is_absolute() and str(path)==os.path.normpath(str(path)),f'noncanonical directory {path}')
    fd=os.open('/',DIR_FLAGS)
    try:
        for part in path.parts[1:]:
            need(part not in ('','.','..'),'ambiguous directory part')
            next_fd=os.open(part,DIR_FLAGS,dir_fd=fd); os.close(fd); fd=next_fd
        need(path.resolve(strict=True)==path,f'symlink directory ancestry {path}')
        return fd
    except BaseException:
        os.close(fd); raise

def attrs(st):
    return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def dirid(st): return (st.st_dev,st.st_ino,st.st_mode)
def overlap(a,b):
    a=Path(a);b=Path(b);return a==b or a in b.parents or b in a.parents
def read_regular(path,cap):
    path=Path(path); parent=open_dir(path.parent)
    try:
        named=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
        need(stat.S_ISREG(named.st_mode) and named.st_nlink==1 and named.st_size<=cap,f'nonregular/oversize {path}')
        fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
        try:
            before=os.fstat(fd); need(attrs(before)==attrs(named),f'open identity drift {path}')
            chunks=[]; size=0
            while True:
                block=os.read(fd,min(65536,cap+1-size))
                if not block: break
                chunks.append(block);size+=len(block);need(size<=cap,f'read cap {path}')
            need(size==before.st_size and attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False)),f'file drift {path}')
            return b''.join(chunks),before
        finally: os.close(fd)
    finally: os.close(parent)

def validate_map(value):
    need(value.get('schema')=='1370-c0-stage41-h-attribution-source-candidate-map-r1','map schema')
    need(value.get('classification')=='DRAFT_UNREVIEWED_UNPUBLISHED_SOURCE_BYTES_ONLY','map status')
    need(value.get('stage40PublishedTip')==BASE and value.get('stage40PublishedTree')=='d7d2f707b7b1e377ce337519a33f91e894dac04a','stage40 base')
    need(value.get('stage40ObservedRemoteReceiptSha256')=='b464dfce16ac7649d9a014fcf3dc491d56ddfca1e4069fa44ade75183fda14a7','stage40 remote control')
    need(value.get('targetPrefix')==PREFIX and value.get('sourceCount')==75 and value.get('sourceBytes')==377751 and value.get('maxSourceBytes')==50655,'map aggregate')
    rows=value.get('rows');need(isinstance(rows,list) and len(rows)==75 and sum(r.get('bytes',-1) for r in rows)==377751,'map rows')
    seen=set();by_name={}
    classes={'R4_DESIGN_ACCEPTED_UNRUN','R5_DISK_AMENDMENT_ACCEPTED_UNRUN','BOOTSTRAP_DESIGN_ACCEPTED_UNRUN','PRELOADER_SOURCE_ACCEPTED_UNRUN','SANDBOX_SOURCE_ACCEPTED_UNRUN','CONTROL_RECORDER_REFINE_UNRUN','CONTROL_RECORDER_SUPERSEDED_SOURCE_ONLY','MATERIALIZER_REFINE_UNRUN','MATERIALIZER_BOOTSTRAP_REFINE_UNRUN','STAGE40_REMOTE_CONTROL_ACCEPTED','STAGE40_REMOTE_CONTROL_OBSERVED'}
    for row in rows:
        need(set(row)=={'source','target','classification','sha256','gitBlobOid','bytes','mode'},'row keys')
        src=Path(row['source']);dest=row['target']
        need(src.is_absolute() and SCRATCH in src.parents and '..' not in src.parts and src!=SCRATCH,'unsafe source')
        need(isinstance(dest,str) and dest.startswith(PREFIX) and dest not in seen and '\\' not in dest and PurePosixPath(dest).as_posix()==dest and all(x not in ('','.','..') for x in PurePosixPath(dest).parts),'unsafe target')
        need(type(row['bytes']) is int and 0<=row['bytes']<=MAX_ROW_BYTES,'row byte cap')
        need(row['mode'] in ('0o600','0o644','0o755'),'source mode')
        need(row['classification'] in classes,'unknown classification')
        for field,size in (('sha256',64),('gitBlobOid',40)):
            x=row[field];need(isinstance(x,str) and len(x)==size and all(c in '0123456789abcdef' for c in x),'digest shape')
        seen.add(dest);by_name[dest[len(PREFIX):]]=row
    pins={
      '1370-c0-h-r4-control-recorder-independent-addendum-r1/RECEIPT.json':'CONTROL_RECORDER_REFINE_UNRUN',
      '1370-c0-h-r4-materializer-independent-static-review-r4/RECEIPT.json':'MATERIALIZER_REFINE_UNRUN',
      '1370-c0-h-r4-materializer-bootstrap-independent-static-review-r1/RECEIPT.json':'MATERIALIZER_BOOTSTRAP_REFINE_UNRUN',
      '1370-c0-h-r4-sandbox-independent-static-review-r4/RECEIPT.json':'SANDBOX_SOURCE_ACCEPTED_UNRUN',
      '1370-c0-h-r4-control-recorder-independent-static-review-r3/RECEIPT.json':'CONTROL_RECORDER_SUPERSEDED_SOURCE_ONLY'}
    for name,classification in pins.items():need(by_name[name]['classification']==classification,f'claim relabel {name}')
    return sorted(rows,key=lambda r:r['target'])

def source_bytes(row):
    data,st=read_regular(Path(row['source']),MAX_ROW_BYTES)
    need(len(data)==row['bytes'] and oct(stat.S_IMODE(st.st_mode))==row['mode'],'source length/mode drift')
    need(sha(data)==row['sha256'] and hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==row['gitBlobOid'],'source SHA/OID drift')
    return data

def group_alive(pgid):
    try: os.killpg(pgid,0)
    except ProcessLookupError: return False
    except OSError: return True
    return True

def clear_group(proc):
    errors=[]
    for sig,delay in ((signal.SIGTERM,.5),(signal.SIGKILL,2)):
        try: os.killpg(proc.pid,sig)
        except ProcessLookupError: pass
        except OSError as error: errors.append(repr(error))
        until=time.monotonic()+delay
        while group_alive(proc.pid) and time.monotonic()<until: time.sleep(.02)
        if not group_alive(proc.pid): break
    if proc.poll() is None:
        try: proc.terminate();proc.wait(timeout=.5)
        except subprocess.TimeoutExpired: proc.kill()
        except OSError as error: errors.append(repr(error))
    try: proc.wait(timeout=2)
    except subprocess.TimeoutExpired: errors.append('direct child unreaped')
    until=time.monotonic()+2
    while group_alive(proc.pid) and time.monotonic()<until: time.sleep(.02)
    need(not errors and proc.poll() is not None and not group_alive(proc.pid),f'group cleanup uncertain {errors}')

class ParentWatch:
    """Detect parent rename/delete events; this is telemetry, not race protection."""
    def __init__(self,parents):
        need(hasattr(select,'kqueue') and hasattr(select,'KQ_FILTER_VNODE'),'Darwin vnode watcher unavailable')
        self.watches=[];self.queue=select.kqueue();self.closed=False
        try:
            for path in parents:
                fd=open_dir(path)
                self.watches.append((Path(path),fd,dirid(os.fstat(fd))))
                event=select.kevent(fd,filter=select.KQ_FILTER_VNODE,flags=select.KQ_EV_ADD|select.KQ_EV_ENABLE|select.KQ_EV_CLEAR,
                                    fflags=select.KQ_NOTE_RENAME|select.KQ_NOTE_DELETE|select.KQ_NOTE_REVOKE)
                self.queue.control([event],0,0)
            self.check()
        except BaseException:self.close();raise
    def check(self):
        need(not self.closed,'watcher closed')
        need(not self.queue.control(None,len(self.watches),0),'staging/output parent vnode event')
        for path,fd,identity in self.watches:
            current=open_dir(path)
            try:need(dirid(os.fstat(fd))==identity and dirid(os.fstat(current))==identity,f'watched parent drift {path}')
            finally:os.close(current)
    def close(self):
        if self.closed:return
        self.closed=True
        for _,fd,_ in self.watches:os.close(fd)
        self.queue.close()

class RunLogs:
    """Memory capture; write complete staged files, then atomic no-replace links."""
    def __init__(self,parent,protected,staging,synthetic=False):
        self.path=Path(parent);self.staging=Path(staging)
        need(SCRATCH in self.path.parents and SCRATCH in self.staging.parents and not overlap(self.path,self.staging),'unsafe output/staging')
        self.fd=open_dir(self.path);self.identity=dirid(os.fstat(self.fd))
        try:
            for p in protected:
                p=Path(p);need(not overlap(self.path,p),f'output overlaps protected {p}')
            need(not os.listdir(self.fd),'one-shot output parent must be empty')
        except BaseException:
            os.close(self.fd);raise
        self.buffers={name:bytearray() for name in ('CHILD-STDOUT.bin','CHILD-STDERR.bin','COMMANDS.jsonl')}
        self.synthetic=synthetic;self.closed=False
    def recheck(self):
        current=open_dir(self.path)
        try:need(dirid(os.fstat(self.fd))==self.identity and dirid(os.fstat(current))==self.identity,'output parent drift')
        finally:os.close(current)
    def write(self,name,data,cap):
        target=self.buffers[name];need(len(target)+len(data)<=cap,f'{name} cap');target.extend(data)
    def size(self,name):return len(self.buffers[name])
    def record(self,argv,code,out_start,err_start,out,err):
        entry={'argv':list(argv),'exit':code,'stdoutOffset':out_start,'stdoutBytes':len(out),'stdoutSha256':sha(out),'stderrOffset':err_start,'stderrBytes':len(err),'stderrSha256':sha(err)}
        self.write('COMMANDS.jsonl',(json.dumps(entry,sort_keys=True)+'\n').encode(),RAW_CAP)
    def finish(self,result):
        payloads={**{name:bytes(value) for name,value in self.buffers.items()},
                  'PUBLISH-RESULT.json':(json.dumps(result,sort_keys=True,indent=2)+'\n').encode()}
        need(len(payloads['PUBLISH-RESULT.json'])<=1024*1024,'result cap')
        stage_fd=open_dir(self.staging)
        try:
            need(not os.path.lexists(self.staging/'late-results'),'late stage collision')
            os.mkdir('late-results',0o700,dir_fd=stage_fd)
            staged=self.staging/'late-results';source_fd=open_dir(staged)
            try:
                for name,data in payloads.items():
                    fd=os.open(name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=source_fd)
                    try:
                        view=memoryview(data)
                        while view:view=view[os.write(fd,view):]
                        os.fsync(fd)
                    finally:os.close(fd)
                    st=os.stat(name,dir_fd=source_fd,follow_symlinks=False)
                    need(stat.S_ISREG(st.st_mode) and st.st_size==len(data),'staged log identity/size')
                os.fsync(source_fd)
                self.recheck()
                skip_first=False
                if self.synthetic and os.environ.get('STAGE41_TEST_STOP')=='before_install':
                    print('READY_BEFORE_ATOMIC_INSTALL',flush=True)
                    os.kill(os.getpid(),signal.SIGSTOP)
                    skip_first=True
                for index,(name,data) in enumerate(payloads.items()):
                    if not (skip_first and index==0):self.recheck()
                    os.link(name,name,src_dir_fd=source_fd,dst_dir_fd=self.fd,follow_symlinks=False)
                    src=os.stat(name,dir_fd=source_fd,follow_symlinks=False)
                    dst=os.stat(name,dir_fd=self.fd,follow_symlinks=False)
                    need((src.st_dev,src.st_ino,src.st_size,src.st_nlink)==(dst.st_dev,dst.st_ino,dst.st_size,2),'atomic installed log inode/link mismatch')
                    read_fd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=self.fd)
                    try:
                        chunks=[];total=0
                        while total<=len(data):
                            part=os.read(read_fd,min(65536,len(data)+1-total))
                            if not part:break
                            chunks.append(part);total+=len(part)
                        need(total==len(data) and sha(b''.join(chunks))==sha(data),'installed log byte digest mismatch')
                    finally:os.close(read_fd)
                for name,data in payloads.items():
                    os.unlink(name,dir_fd=source_fd)
                    dst=os.stat(name,dir_fd=self.fd,follow_symlinks=False)
                    need(stat.S_ISREG(dst.st_mode) and dst.st_nlink==1 and dst.st_size==len(data),'final output nlink/size mismatch')
                os.fsync(source_fd)
                self.recheck()
            finally:os.close(source_fd)
        finally:os.close(stage_fd)
    def close(self):
        if not self.closed:self.closed=True;os.close(self.fd)

def command(*argv,env=None,input_bytes=None):
    global LOGS,WATCH
    if WATCH:WATCH.check()
    need(START is not None and free_bytes()>=FLOOR,'deadline or disk floor')
    need(input_bytes is None or len(input_bytes)<=1024*1024,'input cap')
    left=ACTIVE_SECONDS-(time.monotonic()-START);need(left>0,'publisher deadline')
    child=subprocess.Popen(argv,cwd=HERE,env=clean_env(env),stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,close_fds=True,pass_fds=(),start_new_session=True)
    if input_bytes is None:child.stdin.close()
    output={child.stdout:bytearray(),child.stderr:bytearray()};selector=selectors.DefaultSelector();sent=0;reason=None
    offsets={pipe:LOGS.size(name) if LOGS else 0 for pipe,name in ((child.stdout,'CHILD-STDOUT.bin'),(child.stderr,'CHILD-STDERR.bin'))}
    try:
        for pipe in output:os.set_blocking(pipe.fileno(),False);selector.register(pipe,selectors.EVENT_READ)
        if child.stdin and not child.stdin.closed:
            os.set_blocking(child.stdin.fileno(),False);selector.register(child.stdin,selectors.EVENT_WRITE)
        while selector.get_map() or child.poll() is None:
            if WATCH:WATCH.check()
            left=ACTIVE_SECONDS-(time.monotonic()-START)
            if left<=0 or free_bytes()<FLOOR:reason='deadline/disk floor';break
            for key,_ in selector.select(min(left,.25)):
                pipe=key.fileobj
                if pipe is child.stdin:
                    if sent==len(input_bytes):selector.unregister(pipe);pipe.close();continue
                    try:sent+=os.write(pipe.fileno(),input_bytes[sent:sent+65536])
                    except BlockingIOError:continue
                    except BrokenPipeError:reason='child input broken pipe';break
                else:
                    data=os.read(pipe.fileno(),min(65536,OUTPUT_CAP+1-len(output[pipe])))
                    if not data:selector.unregister(pipe);continue
                    output[pipe].extend(data)
                    if LOGS: LOGS.write('CHILD-STDOUT.bin' if pipe is child.stdout else 'CHILD-STDERR.bin',data,RAW_CAP)
                    if len(output[pipe])>OUTPUT_CAP:reason='child pipe cap';break
            if reason:break
        if reason is None:
            if WATCH:WATCH.check()
            child.wait(timeout=max(.1,ACTIVE_SECONDS-(time.monotonic()-START)))
            if child.returncode:reason=f'child exit {child.returncode}'
            elif group_alive(child.pid):reason='surviving descendant'
            elif sent!=len(input_bytes or b''):reason='short child input'
        if reason:
            clear_group(child)
            raise RuntimeError(f'command STOP {argv!r}: {reason}; stderr={bytes(output[child.stderr])[-1000:]!r}')
        return bytes(output[child.stdout]).decode('utf-8','replace').strip()
    except BaseException:
        if child.poll() is None or group_alive(child.pid):clear_group(child)
        raise
    finally:
        selector.close()
        if LOGS:
            LOGS.record(argv,child.poll(),offsets[child.stdout],offsets[child.stderr],bytes(output[child.stdout]),bytes(output[child.stderr]))
        for stream in (child.stdin,child.stdout,child.stderr):
            if stream is not None and not stream.closed:stream.close()

def live_git(*args):return command('/usr/bin/git','-C',str(REPO),*args)
def git(*args,env=None,input_bytes=None):
    need(STAGE is not None,'scratch Git object dir not initialized')
    extra={'GIT_DIR':str(STAGE)}
    if env:extra.update(env)
    return command('/usr/bin/git',*args,env=extra,input_bytes=input_bytes)
def ac():
    text=command('pmset','-g','batt');need(text.splitlines() and text.splitlines()[0].strip()=="Now drawing from 'AC Power'",'AC unavailable')
def git_blob(data):
    oid=git('hash-object','-w','--stdin',input_bytes=data)
    need(git('cat-file','-s',oid)==str(len(data)),'blob size mismatch')
    return oid

def main(binding_path):
    global START,LOGS,STAGE,WATCH
    START=time.monotonic()
    signal.signal(signal.SIGALRM,lambda *_: (_ for _ in ()).throw(TimeoutError('publisher active deadline')))
    signal.setitimer(signal.ITIMER_REAL,ACTIVE_SECONDS)
    binding_bytes,_=read_regular(binding_path,1024*1024);b=json.loads(binding_bytes)
    need(b.get('status')=='FILLED_INDEPENDENTLY_REVIEWED' and b.get('schema')=='1370-c0-stage41-publisher-binding-r4','unreviewed binding')
    need(b.get('base')==BASE and b.get('productionHead')==PRODUCTION_HEAD and b.get('sourceTree')==SOURCE_TREE and b.get('originUrl')==ORIGIN,'binding identity drift')
    need(os.environ.get('STAGE41_POLICY_SHA')==b.get('bootstrapPolicySha256'),'inline sandbox policy attestation mismatch')
    map_bytes,_=read_regular(MAP,1024*1024);need(sha(map_bytes)==MAP_SHA,'source map drift')
    rows=validate_map(json.loads(map_bytes))
    map_review_bytes,_=read_regular(MAP_REVIEW,1024*1024)
    review=json.loads(map_review_bytes)
    need(sha(map_review_bytes)==MAP_REVIEW_SHA and review.get('decision')=='ACCEPT_SOURCE_MAP_ONLY_UNPUBLISHED' and review.get('sourceMapSha256')==MAP_SHA and review.get('sourceCount')==75 and review.get('sourceBytes')==377751,'map review mismatch')
    amendment_plan_bytes,_=read_regular(AMENDMENT_PLAN,1024*1024)
    amendment_review_bytes,_=read_regular(AMENDMENT_REVIEW,1024*1024)
    amendment_review=json.loads(amendment_review_bytes)
    need(sha(amendment_plan_bytes)==AMENDMENT_PLAN_SHA and sha(amendment_review_bytes)==AMENDMENT_REVIEW_SHA and amendment_review.get('decision')=='ACCEPT_DESIGN_ONLY_UNRUN' and amendment_review.get('planSha256')==AMENDMENT_PLAN_SHA,'operational amendment drift')
    need(b.get('operationalAmendmentPlanSha256')==AMENDMENT_PLAN_SHA and b.get('operationalAmendmentReviewPath')==str(AMENDMENT_REVIEW) and b.get('operationalAmendmentReviewSha256')==AMENDMENT_REVIEW_SHA,'amendment binding drift')
    plan_bytes,_=read_regular(HERE/'PLAN.md',1024*1024)
    script_bytes,_=read_regular(HERE/'publish_stage41.py',1024*1024)
    bootstrap_bytes,_=read_regular(HERE/'bootstrap.py',1024*1024)
    test_bytes,_=read_regular(HERE/'test_static.py',1024*1024)
    fixture_bytes,_=read_regular(HERE/'fixture_worker.py',1024*1024)
    race_bytes,_=read_regular(HERE/'race_worker.py',1024*1024)
    roster_bytes,_=read_regular(HERE/'SOURCE-ROSTER.tsv',1024*1024)
    manifest_bytes,_=read_regular(HERE/'MANIFEST.json',1024*1024)
    controls={'PLAN.md':plan_bytes,'publish_stage41.py':script_bytes,'bootstrap.py':bootstrap_bytes,'test_static.py':test_bytes,'fixture_worker.py':fixture_bytes,'race_worker.py':race_bytes,'SOURCE-ROSTER.tsv':roster_bytes,'SOURCE-CANDIDATE-MAP.json':map_bytes,'OPERATIONAL-AMENDMENT-PLAN.md':amendment_plan_bytes,'OPERATIONAL-AMENDMENT-REVIEW.json':amendment_review_bytes}
    manifest=json.loads(manifest_bytes)
    need(manifest.get('schema')=='1370-c0-stage41-publisher-manifest-r4' and manifest.get('classification')=='UNRUN_SOURCE_PROPOSAL','manifest schema')
    need(manifest.get('files')=={k:{'sha256':sha(v),'bytes':len(v)} for k,v in controls.items()},'control manifest drift')
    need(b.get('publisherSha256')==sha(script_bytes) and b.get('manifestSha256')==sha(manifest_bytes) and b.get('planSha256')==sha(plan_bytes) and b.get('mapSha256')==MAP_SHA and b.get('mapReviewSha256')==MAP_REVIEW_SHA,'filled source pins drift')
    review_path=Path(b['publisherReviewPath']);review_bytes,_=read_regular(review_path,1024*1024);pub_review=json.loads(review_bytes)
    need(sha(review_bytes)==b.get('publisherReviewSha256') and pub_review.get('decision')=='ACCEPT_SOURCE_ONLY_STAGE41_PUBLISHER_R4' and pub_review.get('publisherSha256')==sha(script_bytes) and pub_review.get('manifestSha256')==sha(manifest_bytes) and pub_review.get('mapSha256')==MAP_SHA and pub_review.get('mapReviewSha256')==MAP_REVIEW_SHA and pub_review.get('operationalAmendmentReviewSha256')==AMENDMENT_REVIEW_SHA,'publisher review mismatch')
    expected_roster=('source\ttarget\tbytes\tmode\tsha256\tgitBlobOid\n'+''.join(f"{r['source']}\t{r['target']}\t{r['bytes']}\t{r['mode']}\t{r['sha256']}\t{r['gitBlobOid']}\n" for r in rows)).encode()
    need(roster_bytes==expected_roster,'roster drift')
    protected=[REPO,COMMON.parent,SCRATCH/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1',MAP.parent,MAP_REVIEW.parent,AMENDMENT_PLAN.parent,AMENDMENT_REVIEW.parent,SCRATCH/'1370-c0-stage41-publisher-independent-static-review-r1',HERE,review_path.parent]
    protected += [Path(r['source']).parent for r in rows]
    output=Path(b['outputParent']);staging=Path(b['stagingParent'])
    need(output!=staging and output not in staging.parents and staging not in output.parents,'staging/output overlap')
    stage_fd=open_dir(staging)
    try:
        need(SCRATCH in staging.parents and not os.listdir(stage_fd),'staging parent not unique empty scratch child')
        for p in protected:
            need(p!=staging and p not in staging.parents and staging not in p.parents,f'staging overlaps protected {p}')
    finally:os.close(stage_fd)
    LOGS=RunLogs(output,protected+[staging],staging)
    try:WATCH=ParentWatch((staging,output))
    except BaseException:LOGS.close();LOGS=None;signal.setitimer(signal.ITIMER_REAL,0);raise
    result={'schema':'1370-c0-stage41-publish-result-r4','status':'STOP_UNCLASSIFIED','base':BASE,'mapSha256':MAP_SHA,'parentWatch':'DARWIN_KQUEUE_VNODE_RENAME_DELETE_REVOKE'}
    try:
        ac();need(free_bytes()>=FLOOR,'preflight disk floor')
        need(live_git('symbolic-ref','HEAD')==PRODUCTION_REF and live_git('rev-parse','HEAD')==PRODUCTION_HEAD and live_git('rev-parse','HEAD:src')==SOURCE_TREE and live_git('status','--porcelain')=='','production checkout drift')
        need(live_git('remote','get-url','origin')==ORIGIN,'origin drift')
        need(live_git('ls-remote',ORIGIN,PRODUCTION_REF).split()[0]==PRODUCTION_HEAD,'remote production drift')
        need(live_git('rev-parse',EVIDENCE_REF)==BASE and live_git('ls-remote',ORIGIN,EVIDENCE_REF).split()[0]==BASE,'evidence base drift')
        need(live_git('ls-tree','-r','--name-only',BASE,PREFIX)=='','target prefix collision')
        for row in rows:source_bytes(row)
        STAGE=staging/'repo.git'
        need(not os.path.lexists(STAGE),'scratch bare repo collision')
        command('/usr/bin/git','init','--bare',str(STAGE))
        objects_fd=open_dir(OBJECTS);os.close(objects_fd)
        alternate=STAGE/'objects/info/alternates'
        alt_parent=open_dir(alternate.parent)
        try:
            fd=os.open(alternate.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=alt_parent)
            try:os.write(fd,(str(OBJECTS)+'\n').encode());os.fsync(fd)
            finally:os.close(fd)
            os.fsync(alt_parent)
        finally:os.close(alt_parent)
        need(read_regular(alternate,1024)[0]==(str(OBJECTS)+'\n').encode(),'alternates readback drift')
        index_dir=staging/'private-index'
        need(not os.path.lexists(index_dir),'private index exists')
        os.mkdir(index_dir,0o700);env={'GIT_INDEX_FILE':str(index_dir/'index')}
        git('update-ref',EVIDENCE_REF,BASE)
        git('read-tree',BASE,env=env)
        names={};modes={}
        for row in rows:
            ac();data=source_bytes(row);oid=git_blob(data)
            need(oid==row['gitBlobOid'],'blob OID mismatch')
            mode='100755' if int(row['mode'],8)&0o111 else '100644'
            git('update-index','--add','--cacheinfo',f"{mode},{oid},{row['target']}",env=env)
            names[row['target']]=oid;modes[row['target']]=mode
        extras={'publication/SOURCE-CANDIDATE-MAP.json':map_bytes,'publication/PLAN.md':plan_bytes,'publication/SOURCE-ROSTER.tsv':roster_bytes,'publication/publish_stage41.py':script_bytes,'publication/bootstrap.py':bootstrap_bytes,'publication/test_static.py':test_bytes,'publication/fixture_worker.py':fixture_bytes,'publication/race_worker.py':race_bytes,'publication/MANIFEST.json':manifest_bytes,'publication/map-review/RECEIPT.json':map_review_bytes,'publication/publisher-review/RECEIPT.json':review_bytes,'publication/operational-amendment/PLAN.md':amendment_plan_bytes,'publication/operational-amendment/RECEIPT.json':amendment_review_bytes}
        for suffix,data in extras.items():
            target=PREFIX+suffix;need(target not in names,'control collision')
            oid=git_blob(data);git('update-index','--add','--cacheinfo',f'100644,{oid},{target}',env=env)
            names[target]=oid;modes[target]='100644'
        tree=git('write-tree',env=env);actual={}
        for line in git('ls-tree','-r',tree,PREFIX).splitlines():
            head,path=line.split('\t',1);mode,kind,oid=head.split();need(kind=='blob' and path not in actual,'tree kind/collision');actual[path]=(mode,oid)
        need(actual=={p:(modes[p],oid) for p,oid in names.items()} and len(actual)==88,'tree delta mismatch')
        commit=git('commit-tree',tree,'-p',BASE,'-m','evidence(1370): preserve bounded H attribution designs and STOPs')
        need(git('rev-parse',f'{commit}^')==BASE and git('rev-parse',f'{commit}^{{tree}}')==tree and set(git('diff-tree','--no-commit-id','--name-only','-r',commit).splitlines())==set(names),'commit proof mismatch')
        need(git('ls-remote',ORIGIN,EVIDENCE_REF).split()[0]==BASE,'remote evidence moved before CAS')
        ac();git('update-ref',EVIDENCE_REF,commit,BASE)
        need(git('rev-parse',EVIDENCE_REF)==commit,'scratch CAS mismatch')
        git('push','--no-force',ORIGIN,f'{EVIDENCE_REF}:{EVIDENCE_REF}')
        need(git('ls-remote',ORIGIN,EVIDENCE_REF).split()[0]==commit,'remote tip mismatch')
        need(live_git('ls-remote',ORIGIN,PRODUCTION_REF).split()[0]==PRODUCTION_HEAD,'remote production moved')
        need(live_git('rev-parse','HEAD')==PRODUCTION_HEAD and live_git('rev-parse','HEAD:src')==SOURCE_TREE and live_git('status','--porcelain')=='','production postflight drift')
        need(live_git('rev-parse',EVIDENCE_REF)==BASE,'live local evidence ref unexpectedly moved')
        for row in rows:source_bytes(row)
        need(sha(read_regular(MAP,1024*1024)[0])==MAP_SHA and sha(read_regular(MAP_REVIEW,1024*1024)[0])==MAP_REVIEW_SHA,'map/review postflight drift')
        need(sha(read_regular(AMENDMENT_PLAN,1024*1024)[0])==AMENDMENT_PLAN_SHA and sha(read_regular(AMENDMENT_REVIEW,1024*1024)[0])==AMENDMENT_REVIEW_SHA,'amendment postflight drift')
        for path,expected in ((HERE/'PLAN.md',sha(plan_bytes)),(HERE/'publish_stage41.py',sha(script_bytes)),(HERE/'bootstrap.py',sha(bootstrap_bytes)),
                              (HERE/'test_static.py',sha(test_bytes)),(HERE/'fixture_worker.py',sha(fixture_bytes)),(HERE/'race_worker.py',sha(race_bytes)),(HERE/'SOURCE-ROSTER.tsv',sha(roster_bytes)),
                              (HERE/'MANIFEST.json',sha(manifest_bytes)),(review_path,sha(review_bytes))):
            need(sha(read_regular(path,1024*1024)[0])==expected,f'publication control postflight drift: {path}')
        ac();need(free_bytes()>=FLOOR,'postflight disk floor')
        WATCH.check()
        result.update(status='PUBLISHED_REMOTE_TIP_VERIFIED_REMOTE_BYTES_PENDING',commit=commit,tree=tree,fileCount=88,sourceCount=75,sourceBytes=377751,productionHead=PRODUCTION_HEAD,sourceTree=SOURCE_TREE)
        return result
    except BaseException as error:
        result.update(status='STOP_STAGE41_PUBLICATION',error=repr(error))
        raise
    finally:
        try:
            if WATCH:WATCH.check()
            LOGS.finish(result)
            if WATCH:WATCH.check()
        finally:
            if WATCH:WATCH.close();WATCH=None
            LOGS.close();LOGS=None;signal.setitimer(signal.ITIMER_REAL,0)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('binding');args=parser.parse_args()
    try:print(json.dumps(main(Path(args.binding)),sort_keys=True))
    except BaseException as error:print(f'STOP_STAGE41_PUBLICATION {error!r}',file=sys.stderr);raise SystemExit(1)
