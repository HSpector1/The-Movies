#!/usr/bin/env python3
"""UNRUN read-only Stage41 launcher: render exact in-memory kernel write policy."""
import hashlib,json,os,selectors,signal,stat,subprocess,sys,time
from pathlib import Path

HERE=Path(__file__).resolve().parent
SCRATCH=Path('/Users/zacheryspector/studio-scratch')
REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
COMMON_PARENT=Path('/Users/zacheryspector/The Movies - Unity Production Convergence 80H')
OBJECTS=COMMON_PARENT/'.git/objects'
H=SCRATCH/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'
MAP=SCRATCH/'1370-c0-stage41-h-attribution-evidence-backup-plan-r1/SOURCE-CANDIDATE-MAP.json'
MAP_REVIEW=SCRATCH/'1370-c0-stage41-h-attribution-source-map-independent-review-r1/RECEIPT.json'
MAP_SHA='16087fcaa2836456044ba911ae5e7033fa70fda6e882a06033f94de0b509703c'
MAP_REVIEW_SHA='818fbf056228e85b6a449b8eca245b0654904fbfcb413628e158079b2269b14b'
R1_REFINE=SCRATCH/'1370-c0-stage41-publisher-independent-static-review-r1/RECEIPT.json'
R1_REFINE_SHA='1ae5321c691c3312fff475df9df72923727e27cb9cb2a7bc52bed8282b43bcb0'
R2_REFINE=SCRATCH/'1370-c0-stage41-publisher-independent-static-review-r2/RECEIPT.json'
R2_REFINE_SHA='708cedae2d0c285f651bacdfc2a18dcbfa740be0421e8f8eeced1d705a16a6b1'
AMENDMENT_PLAN=SCRATCH/'1370-c0-stage41-publisher-concurrent-rename-amendment-design-r1/PLAN.md'
AMENDMENT_SHA='230e05e3280115ab9891ae50af5003852f8ac843da79dfde873e388b7b282289'
AMENDMENT_REVIEW=SCRATCH/'1370-c0-stage41-publisher-concurrent-rename-amendment-independent-review-r1/RECEIPT.json'
AMENDMENT_REVIEW_SHA='4580b147a48590fc0870032c18760ecdd20bd0a3a4771aefa05b9ba89bf0fd40'
SANDBOX=Path('/usr/bin/sandbox-exec');GIT=Path('/usr/bin/git')
POLICY_CAP=16384; PIPE_CAP=2*1024*1024; OUTER_SECONDS=900
DIR_FLAGS=os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW

def need(ok,why):
    if not ok:raise RuntimeError(why)
def sha(data):return hashlib.sha256(data).hexdigest()
def open_dir(path):
    p=Path(path);need(p.is_absolute() and str(p)==os.path.normpath(str(p)),'noncanonical dir')
    fd=os.open('/',DIR_FLAGS)
    try:
        for part in p.parts[1:]:
            child=os.open(part,DIR_FLAGS,dir_fd=fd);os.close(fd);fd=child
        need(p.resolve(strict=True)==p,'symlink dir ancestry')
        return fd
    except BaseException:os.close(fd);raise

def file_bytes(path,cap,single_link=True):
    p=Path(path);parent=open_dir(p.parent)
    try:
        fd=os.open(p.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
        try:
            st=os.fstat(fd);need(stat.S_ISREG(st.st_mode) and (not single_link or st.st_nlink==1) and st.st_size<=cap,'file type/cap')
            chunks=[];total=0
            while total<=cap:
                part=os.read(fd,min(65536,cap+1-total))
                if not part:break
                chunks.append(part);total+=len(part)
            need(total==st.st_size,'file read drift');return b''.join(chunks)
        finally:os.close(fd)
    finally:os.close(parent)

def overlap(a,b):
    a=Path(a);b=Path(b);return a==b or a in b.parents or b in a.parents

def policy(protected,staging,output):
    protected=[Path(p) for p in protected]
    staging=Path(staging);output=Path(output)
    for p in [*protected,staging,output]:
        fd=open_dir(p);os.close(fd)
        need(str(p)==os.path.normpath(str(p)),'ambiguous policy path')
        need(not any(ord(c)<32 for c in str(p)),'control char policy path')
    need(SCRATCH in staging.parents and SCRATCH in output.parents and not overlap(staging,output),'nonunique scratch outputs')
    for p in protected:
        need(not overlap(staging,p) and not overlap(output,p),'allow overlaps protected')
    q=lambda p:json.dumps(str(p),ensure_ascii=True)
    lines=['(version 1)','(deny default)','(allow process*)','(allow file-read*)','(allow mach-lookup)','(allow network*)',
           '(allow file-write* (literal "/dev/null"))']
    lines += [f'(deny file-write* (subpath {q(p)}))' for p in sorted(set(protected))]
    lines += [f'(allow file-write* (subpath {q(p)}))' for p in (staging,output)]
    text='\n'.join(lines)+'\n'
    need(len(text.encode())<=POLICY_CAP,'inline policy cap')
    return text

def real_protected(binding):
    need(sha(file_bytes(MAP,1024*1024))==MAP_SHA and sha(file_bytes(MAP_REVIEW,1024*1024))==MAP_REVIEW_SHA,'map/review drift')
    need(sha(file_bytes(R1_REFINE,1024*1024))==R1_REFINE_SHA,'r1 REFINE receipt drift')
    need(sha(file_bytes(R2_REFINE,1024*1024))==R2_REFINE_SHA,'r2 REFINE receipt drift')
    need(sha(file_bytes(AMENDMENT_PLAN,1024*1024))==AMENDMENT_SHA,'operational amendment plan drift')
    amendment_review=Path(binding['operationalAmendmentReviewPath'])
    need(amendment_review==AMENDMENT_REVIEW and binding.get('operationalAmendmentReviewSha256')==AMENDMENT_REVIEW_SHA,'amendment review identity')
    amendment_bytes=file_bytes(amendment_review,1024*1024)
    amendment=json.loads(amendment_bytes)
    need(sha(amendment_bytes)==AMENDMENT_REVIEW_SHA and
         amendment.get('decision')=='ACCEPT_DESIGN_ONLY_UNRUN' and
         amendment.get('planSha256')==AMENDMENT_SHA,'operational amendment review absent or drifted')
    rows=json.loads(file_bytes(MAP,1024*1024))['rows']
    receipt=Path(binding['publisherReviewPath'])
    paths=[REPO,COMMON_PARENT,H,MAP.parent,MAP_REVIEW.parent,R1_REFINE.parent,R2_REFINE.parent,AMENDMENT_PLAN.parent,amendment_review.parent,HERE,receipt.parent]
    paths += [Path(r['source']).parent for r in rows]
    evidence=binding.get('evidenceCheckout')
    if evidence is None:
        need(binding.get('evidenceCheckoutAbsentAttested') is True,'unbound evidence checkout')
    else:paths.append(Path(evidence))
    for p in paths:fd=open_dir(p);os.close(fd)
    objects_fd=open_dir(OBJECTS);os.close(objects_fd)
    return sorted(set(paths))

def group_alive(pgid):
    try:os.killpg(pgid,0)
    except ProcessLookupError:return False
    except OSError:return True
    return True

def clear_group(proc):
    errs=[]
    for sig,delay in ((signal.SIGTERM,.5),(signal.SIGKILL,2)):
        try:os.killpg(proc.pid,sig)
        except ProcessLookupError:pass
        except OSError as error:errs.append(repr(error))
        until=time.monotonic()+delay
        while group_alive(proc.pid) and time.monotonic()<until:time.sleep(.02)
        if not group_alive(proc.pid):break
    if proc.poll() is None:
        try:proc.terminate();proc.wait(timeout=.5)
        except subprocess.TimeoutExpired:proc.kill()
        except OSError as error:errs.append(repr(error))
    try:proc.wait(timeout=2)
    except subprocess.TimeoutExpired:errs.append('direct child unreaped')
    until=time.monotonic()+2
    while group_alive(proc.pid) and time.monotonic()<until:time.sleep(.02)
    need(not errs and proc.poll() is not None and not group_alive(proc.pid),f'unclear group cleanup {errs}')

def bounded(argv,env,cwd,timeout=OUTER_SECONDS):
    proc=subprocess.Popen(argv,env=env,cwd=cwd,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,close_fds=True,pass_fds=(),start_new_session=True)
    proc.stdin.close();data={proc.stdout:bytearray(),proc.stderr:bytearray()};sel=selectors.DefaultSelector();reason=None
    try:
        for pipe in data:os.set_blocking(pipe.fileno(),False);sel.register(pipe,selectors.EVENT_READ)
        deadline=time.monotonic()+timeout
        while sel.get_map() or proc.poll() is None:
            left=deadline-time.monotonic()
            if left<=0:reason='outer timeout';break
            for key,_ in sel.select(min(left,.1)):
                pipe=key.fileobj;part=os.read(pipe.fileno(),min(65536,PIPE_CAP+1-len(data[pipe])))
                if not part:sel.unregister(pipe);continue
                data[pipe].extend(part)
                if len(data[pipe])>PIPE_CAP:reason='outer pipe cap';break
            if reason:break
        if reason is None:
            proc.wait(timeout=max(.1,deadline-time.monotonic()))
            if proc.returncode:reason=f'child exit {proc.returncode}'
            elif group_alive(proc.pid):reason='surviving descendant'
        if reason:
            clear_group(proc)
            raise RuntimeError(f'STOP_BOOTSTRAP {reason}; stderr={bytes(data[proc.stderr])[-1024:]!r}')
        return bytes(data[proc.stdout]),bytes(data[proc.stderr])
    except BaseException:
        if proc.poll() is None or group_alive(proc.pid):clear_group(proc)
        raise
    finally:
        sel.close()
        for pipe in data:pipe.close()

def launch(binding_path):
    started=time.monotonic()
    b=json.loads(file_bytes(binding_path,1024*1024))
    need(b.get('schema')=='1370-c0-stage41-publisher-binding-r4' and b.get('status')=='FILLED_INDEPENDENTLY_REVIEWED','unreviewed binding')
    need(b.get('r1RefineReceiptSha256')==R1_REFINE_SHA,'r1 REFINE binding drift')
    need(b.get('r2RefineReceiptSha256')==R2_REFINE_SHA,'r2 REFINE binding drift')
    need(b.get('operationalAmendmentPlanSha256')==AMENDMENT_SHA,'operational amendment binding drift')
    need(b.get('productionHead')=='a3da64a9a267ec5ac66544c70bff7a75e0e02e52' and b.get('sourceTree')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','production binding drift')
    need(b.get('coordinatedSingleWriterAttested') is True and b.get('processPathAuditReviewed') is True,'concurrent actor/process-path audit not attested')
    protected=real_protected(b)
    text=policy(protected,b['stagingParent'],b['outputParent'])
    need(sha(text.encode())==b.get('bootstrapPolicySha256'),'policy SHA drift')
    for p,key,cap in ((HERE/'publish_stage41.py','publisherSha256',1024*1024),(HERE/'bootstrap.py','bootstrapSha256',1024*1024),(SANDBOX,'sandboxExecutableSha256',16*1024*1024),(GIT,'gitExecutableSha256',16*1024*1024),(Path(b['pythonExecutable']),'pythonExecutableSha256',64*1024*1024)):
        need(sha(file_bytes(p,cap,single_link=(p!=GIT)))==b.get(key),f'executable/source drift {p}')
    for name in ('stagingParent','outputParent'):
        p=Path(b[name]);fd=open_dir(p)
        try:need(not os.listdir(fd),f'{name} is not empty')
        finally:os.close(fd)
    env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
    env.update(STAGE41_POLICY_SHA=sha(text.encode()),PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0')
    argv=[str(SANDBOX),'-p',text,b['pythonExecutable'],'-B',str(HERE/'publish_stage41.py'),str(binding_path)]
    remaining=OUTER_SECONDS-(time.monotonic()-started)
    need(remaining>0,'900-second bootstrap preflight deadline')
    output,error=bounded(argv,env,str(HERE),timeout=remaining)
    need(not error,'publisher stderr on successful exit')
    child=json.loads(output);need(child.get('status')=='PUBLISHED_REMOTE_TIP_VERIFIED_REMOTE_BYTES_PENDING','child result mismatch')
    return {'status':'BOOTSTRAP_COMPLETED_REMOTE_BYTES_PENDING','policySha256':sha(text.encode()),'child':child}

if __name__=='__main__':
    if len(sys.argv)!=2:raise SystemExit('usage: bootstrap.py FILLED-BINDING.json')
    print(json.dumps(launch(Path(sys.argv[1])),sort_keys=True))
