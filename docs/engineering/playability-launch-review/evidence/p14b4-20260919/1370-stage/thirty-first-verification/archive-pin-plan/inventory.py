#!/usr/bin/env python3
"""Independent, lane-guarded, no-follow inventory of the immutable E0G p13a clean leaf."""
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
NAME = 'e0g-p13a-clean-r12-e0g-p13a-clean-20261007-1850'
TARGET = B / '1370-ag-e0g-full-state-clean-recorded-r12' / NAME
OUTER = B / '1370-ag-e0g-full-state-clean-outer-recorded-r12' / NAME
LANE = B / f'1370-ag-e0g-full-state-r12-{NAME}.lane.log'
META = Path(str(LANE) + '.meta')
OBSERVED = B / '1370-e0g-p13a-clean-observed-review-r12-r2/RECEIPT.json'
OBSERVED_SHA = '27be46a6d79cd232dd810d9afefd497fa2aa802bc432d9bf823d5e42f8423e59'
OUTPUT = B / '1370-r12-e0g-p13a-archive-pin-r1'
RUN_LOG = B / 'heavy-queue/1370-r12-e0g-p13a-inventory-r1.lane.log'
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

def main():
    if OUTPUT.exists() or OUTPUT.is_symlink():fail('output exists')
    free_before=free_bytes()
    lock=B/'HEAVY-LANE-LOCK'
    if lock.is_symlink() or not lock.is_file() or not lock.read_text().startswith('lane-run '+RUN_LOG.name+', started '):fail('wrong heavy lane lock')
    parent=subprocess.check_output(['ps','-ww','-p',str(os.getppid()),'-o','command='],text=True).strip()
    tokens=shlex.split(parent)
    if not any(t.endswith('/lane-run.sh') for t in tokens) or str(RUN_LOG) not in tokens or str(Path(__file__).resolve()) not in tokens:fail('wrong lane parent')
    if sha_path(OBSERVED)!=OBSERVED_SHA:fail('observed receipt changed')
    observed=json.loads(OBSERVED.read_bytes())
    if observed.get('decision')!='ACCEPT_OBSERVED_R12_E0G_P13A_CLEAN_ONLY' or observed.get('members')!=417:fail('observed result not admitted')
    meta_text=META.read_text()
    if not re.search(r'(?m)^end, exit 0; ',meta_text) or len(re.findall(r'(?m)^end, exit ',meta_text))!=1:fail('source lane not complete')
    if subprocess.check_output(['git','-C',str(R),'status','--porcelain']):fail('repo dirty')
    if subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD'],text=True).strip()!=HEAD:fail('HEAD moved')
    if subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD:src'],text=True).strip()!=TREE:fail('source tree moved')
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
    os.mkdir(OUTPUT,mode=0o700)
    with (OUTPUT/'SOURCE-INVENTORY.json').open('xb') as f:
        f.write(canonical);f.flush();os.fsync(f.fileno())
    result={'schema':'1370-r12-e0g-p13a-inventory-r1','sourceInventorySha256':hashlib.sha256(canonical).hexdigest(),'members':len(items),'regularBytes':sum(x.get('bytes',0) for x in items),'observedReceiptSha256':OBSERVED_SHA,'freeBytesBefore':free_before,'freeBytesAfter':free_bytes()}
    with (OUTPUT/'INVENTORY-RESULT.json').open('xb') as f:
        f.write((json.dumps(result,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
    print(json.dumps(result,sort_keys=True))

if __name__=='__main__':main()
