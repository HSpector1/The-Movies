#!/usr/bin/env python3
"""Independent, lane-guarded, no-follow inventory of the immutable E0G adoption clean leaf."""
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import stat
import subprocess

B = Path('/Users/zacheryspector/studio-scratch')
R = Path('/Users/zacheryspector/The-Movies-headless-program')
NAME = 'e0g-adoption-clean-r12-e0g-adoption-clean-20261007-1850'
TARGET = B / '1370-ag-e0g-full-state-clean-recorded-r12' / NAME
OUTER = B / '1370-ag-e0g-full-state-clean-outer-recorded-r12' / NAME
LANE = B / f'1370-ag-e0g-full-state-r12-{NAME}.lane.log'
META = Path(str(LANE) + '.meta')
OBSERVED = B / '1370-e0g-adoption-clean-observed-review-r12-r1/RECEIPT.json'
OBSERVED_SHA = '3f833354bf9eeff08a8c4e82cd235b85a0875c323b7e30f68e8eafd9b489f8c7'
INDEPENDENT = B / '1370-e0g-adoption-clean-observed-independent-review-r1/RECEIPT.json'
INDEPENDENT_SHA = '0a672b38e5d9c810cb82aa24fa26c47b2e5b1071b02a8daa3e9157bd0cc9196d'
OUTPUT = B / '1370-r12-e0g-adoption-archive-pin-r1'
RUN_LOG = B / 'heavy-queue/1370-r12-e0g-adoption-inventory-r1.lane.log'
HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
FLOOR = 3 * 1024 * 1024 * 1024

def fail(reason): raise RuntimeError('STOP: ' + reason)
def free_bytes():
    st = os.statvfs(B)
    n = st.f_bavail * st.f_frsize
    if n < FLOOR: fail(f'less than 3 GiB free: {n}')
    return n

def checked_parts(path):
    raw = os.fspath(path)
    parts = raw.split('/')[1:]
    if not raw.startswith('/') or '\x00' in raw or any(x in ('', '.', '..') for x in parts): fail('unsafe path')
    if tuple(parts[:3]) != ('Users','zacheryspector','studio-scratch'): fail('outside scratch')
    return parts

def dirfd(path):
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in checked_parts(path):
            nxt = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd); fd = nxt
        return fd
    except BaseException:
        os.close(fd); raise

def parentfd(path):
    parts = checked_parts(path)
    parent = dirfd('/' + '/'.join(parts[:-1]))
    return parent, parts[-1]

def regular(path):
    parent, name = parentfd(path)
    try:
        before = os.stat(name, dir_fd=parent, follow_symlinks=False)
        if not stat.S_ISREG(before.st_mode): fail('nonregular source: '+str(path))
        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent)
    finally: os.close(parent)
    opened = os.fstat(fd)
    if (opened.st_dev,opened.st_ino) != (before.st_dev,before.st_ino):
        os.close(fd); fail('source changed while opening: '+str(path))
    return fd, before

def digest_fd(fd):
    h = hashlib.sha256(); size = 0
    while True:
        block = os.read(fd,1<<20)
        if not block: break
        h.update(block); size += len(block); free_bytes()
    return size,h.hexdigest()

def file_entry(path, prefix):
    fd, before = regular(path)
    try:
        size, digest = digest_fd(fd)
        after = os.fstat(fd)
        if (size,after.st_mtime_ns,after.st_ctime_ns) != (before.st_size,before.st_mtime_ns,before.st_ctime_ns):
            fail('source changed during hash: '+str(path))
    finally: os.close(fd)
    return {'path':prefix,'type':'file','mode':stat.S_IMODE(before.st_mode),'bytes':size,'sha256':digest}

def walk(root,prefix,items):
    fd = dirfd(root)
    try:
        def visit(parent, rel):
            for name in sorted(os.listdir(parent), key=os.fsencode):
                if name in ('', '.', '..') or '/' in name: fail('unsafe member')
                sub = f'{rel}/{name}' if rel else name
                key = f'{prefix}/{sub}'
                st = os.stat(name, dir_fd=parent, follow_symlinks=False)
                item = {'path':key,'mode':stat.S_IMODE(st.st_mode)}
                if stat.S_ISDIR(st.st_mode):
                    child = os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
                    try:
                        opened = os.fstat(child)
                        if (opened.st_dev,opened.st_ino) != (st.st_dev,st.st_ino): fail('directory changed')
                        item['type']='directory';items.append(item);visit(child,sub)
                    finally: os.close(child)
                elif stat.S_ISLNK(st.st_mode):
                    target=os.readlink(name,dir_fd=parent)
                    item.update(type='symlink',target=target,targetSha256=hashlib.sha256(os.fsencode(target)).hexdigest())
                    items.append(item)
                elif stat.S_ISREG(st.st_mode):
                    child=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
                    try:
                        opened=os.fstat(child)
                        if (opened.st_dev,opened.st_ino,opened.st_size)!=(st.st_dev,st.st_ino,st.st_size):fail('file changed')
                        size,digest=digest_fd(child)
                        after=os.fstat(child)
                        if (size,after.st_mtime_ns,after.st_ctime_ns)!=(st.st_size,st.st_mtime_ns,st.st_ctime_ns):fail('file changed during hash')
                        item.update(type='file',bytes=size,sha256=digest)
                        items.append(item)
                    finally:os.close(child)
                else:fail('special source: '+key)
                if len(items)>1000:fail('member count cap')
        visit(fd,'')
    finally:os.close(fd)

def sha_path(path):
    fd,_=regular(path)
    try:return digest_fd(fd)[1]
    finally:os.close(fd)

def read_small(path,limit=4*1024*1024):
    fd,before=regular(path)
    try:
        data=bytearray()
        while block:=os.read(fd,1<<20):
            data.extend(block);free_bytes()
            if len(data)>limit:fail('oversized control file: '+str(path))
        after=os.fstat(fd)
        if (after.st_size,after.st_mtime_ns,after.st_ctime_ns)!=(before.st_size,before.st_mtime_ns,before.st_ctime_ns):
            fail('control file changed: '+str(path))
        return bytes(data)
    finally:os.close(fd)

def main():
    if OUTPUT.exists() or OUTPUT.is_symlink():fail('output exists')
    free_before=free_bytes()
    lock=B/'HEAVY-LANE-LOCK'
    if lock.is_symlink() or not lock.is_file() or not lock.read_text().startswith('lane-run '+RUN_LOG.name+', started '):fail('wrong heavy lane lock')
    parent=subprocess.check_output(['ps','-ww','-p',str(os.getppid()),'-o','command='],text=True).strip()
    tokens=shlex.split(parent)
    if not any(t.endswith('/lane-run.sh') for t in tokens) or str(RUN_LOG) not in tokens or str(Path(__file__).resolve()) not in tokens:fail('wrong lane parent')
    if len(OBSERVED_SHA)!=64:fail('observed receipt SHA has not been frozen')
    observed_raw=read_small(OBSERVED)
    if hashlib.sha256(observed_raw).hexdigest()!=OBSERVED_SHA:fail('observed receipt changed')
    independent_raw=read_small(INDEPENDENT)
    if hashlib.sha256(independent_raw).hexdigest()!=INDEPENDENT_SHA:fail('independent observed review changed')
    independent=json.loads(independent_raw)
    if (independent.get('decision')!='ACCEPT_INDEPENDENT_OBSERVED_E0G_ADOPTION_CLEAN_EXPLORATORY_ONLY'
            or independent.get('sourceObservedReceiptSha256')!=OBSERVED_SHA):fail('independent observed review not admitted')
    observed=json.loads(observed_raw)
    if (observed.get('decision')!='ACCEPT_OBSERVED_R12_E0G_ADOPTION_CLEAN_EXPLORATORY_ONLY'
            or observed.get('members')!=417
            or observed.get('runId')!='r12-e0g-adoption-clean-20261007-1850'
            or observed.get('arm')!='E0G'
            or observed.get('seed')!='p13-public-commercial-adoption'):
        fail('observed adoption result not admitted')
    meta_text=read_small(META).decode()
    if not re.search(r'(?m)^end, exit 0; ',meta_text) or len(re.findall(r'(?m)^end, exit ',meta_text))!=1:fail('source lane not complete')
    if subprocess.check_output(['git','-C',str(R),'status','--porcelain']):fail('repo dirty')
    if subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD'],text=True).strip()!=HEAD:fail('HEAD moved')
    if subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD:src'],text=True).strip()!=TREE:fail('source tree moved')
    target=json.loads(read_small(TARGET/'RESULT.json'))
    outer=json.loads(read_small(OUTER/'RESULT.json'))
    if (target.get('status')!='STAGE_PASS' or outer.get('status')!='STAGE_PASS'
            or target.get('stagePassed') is not True or outer.get('stagePassed') is not True
            or target.get('arm')!='E0G' or outer.get('arm')!='E0G'
            or target.get('seed')!='p13-public-commercial-adoption'
            or outer.get('seed')!='p13-public-commercial-adoption'
            or target.get('stage')!='clean' or outer.get('stage')!='clean'
            or target.get('classification')!='EXPLORATORY_720_750'
            or target.get('child')!={'elapsedCapSeconds':720,'exit':0,'timedOut':False}
            or outer.get('childExit')!=0 or outer.get('deadlineSeconds')!=750
            or not 0<outer.get('elapsedSeconds',0)<750):
        fail('target/outer adoption exploratory gate changed')
    if (target.get('head')!=HEAD or outer.get('head')!=HEAD
            or target.get('preflight',{}).get('sourceTree')!=TREE
            or target.get('typesAdmission',{}).get('observedAuditReceiptSha256')!='2c0b373753393dae964cb21aa30b02929e53749f40ab38751e530a8e1b3f328b'):
        fail('source/types admission changed')
    items=[]
    walk(TARGET,'target',items);walk(OUTER,'outer',items)
    items.append(file_entry(LANE,'lane/'+LANE.name))
    items.append(file_entry(META,'lane/'+META.name))
    items.sort(key=lambda x:os.fsencode(x['path']))
    if len(items)!=len({x['path'] for x in items}) or len(items)>1000:fail('inventory uniqueness/count')
    table={x['path']:x for x in items}
    for name,digest in [('target/RESULT.json',observed['targetResultSha256']),('outer/RESULT.json',observed['outerResultSha256']),('target/boundaries.ndjson.gz',observed['boundariesSha256']),('lane/'+LANE.name,observed['laneLogSha256']),('lane/'+META.name,observed['laneMetaSha256'])]:
        if table.get(name,{}).get('sha256')!=digest:fail('observed byte mismatch: '+name)
    canonical=(json.dumps(items,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n').encode()
    parent=dirfd(B)
    try:
        os.mkdir(OUTPUT.name,mode=0o700,dir_fd=parent);os.fsync(parent)
    finally:os.close(parent)
    output_fd=dirfd(OUTPUT)
    try:
        fd=os.open('SOURCE-INVENTORY.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=output_fd)
        with os.fdopen(fd,'wb') as f:f.write(canonical);f.flush();os.fsync(f.fileno())
        os.fsync(output_fd)
    finally:os.close(output_fd)
    result={'schema':'1370-r12-e0g-adoption-inventory-r1','sourceInventorySha256':hashlib.sha256(canonical).hexdigest(),'members':len(items),'regularBytes':sum(x.get('bytes',0) for x in items),'observedReceiptSha256':OBSERVED_SHA,'freeBytesBefore':free_before,'freeBytesAfter':free_bytes()}
    output_fd=dirfd(OUTPUT)
    try:
        fd=os.open('INVENTORY-RESULT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=output_fd)
        with os.fdopen(fd,'wb') as f:f.write((json.dumps(result,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
        os.fsync(output_fd)
    finally:os.close(output_fd)
    pin={'schema':'1370-r12-followon-clean-archive-r2-pin','role':'e0g-adoption',
         'runId':'r12-e0g-adoption-clean-20261007-1850','head':HEAD,'sourceTree':TREE,
         'arm':'E0G','seed':'p13-public-commercial-adoption','stage':'clean',
         'classification':'EXPLORATORY_720_750','status':'STAGE_PASS','stagePassed':True,
         'childExit':0,'laneProcessExit':0,
         'targetResultSha256':table['target/RESULT.json']['sha256'],
         'outerResultSha256':table['outer/RESULT.json']['sha256'],
         'laneSha256':table['lane/'+LANE.name]['sha256'],
         'laneMetaSha256':table['lane/'+META.name]['sha256'],
         'boundariesSha256':table['target/boundaries.ndjson.gz']['sha256'],
         'observedReceiptPath':str(OBSERVED),'observedReceiptSha256':OBSERVED_SHA,
         'observedDecision':observed['decision'],
         'sourceInventorySha256':result['sourceInventorySha256']}
    if len(pin)!=22:fail('wrong pin field count')
    archive=B/'1370-r12-followon-e0g-adoption-archive-r2'
    pin_path=OUTPUT/'PIN.json'
    code=B/'1370-r12-followon-clean-archive-proposal-r3'
    commands={
      'build.command':f"bash {B}/heavy-queue/lane-run.sh 0 '{archive}/build-r3.lane.log' python3 -I -B {code}/package.py --pin {pin_path}\n",
      'verify.command':f"bash {B}/heavy-queue/lane-run.sh 0 '{archive}/verify-r3.lane.log' python3 -I -B {code}/verify.py --pin {pin_path}\n",
    }
    output_fd=dirfd(OUTPUT)
    try:
        payloads={'PIN.json':(json.dumps(pin,sort_keys=True,separators=(',',':'))+'\n').encode(),
                  **{name:command.encode() for name,command in commands.items()}}
        for name,payload in payloads.items():
            fd=os.open(name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=output_fd)
            with os.fdopen(fd,'wb') as f:f.write(payload);f.flush();os.fsync(f.fileno())
        os.fsync(output_fd)
    finally:os.close(output_fd)
    print(json.dumps({**result,'pinSha256':sha_path(pin_path),'buildCommandSha256':sha_path(OUTPUT/'build.command'),
                      'verifyCommandSha256':sha_path(OUTPUT/'verify.command')},sort_keys=True))

if __name__=='__main__':main()
