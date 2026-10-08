from __future__ import annotations
import hashlib, json, os, pathlib, stat, subprocess

R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-r12-e0g-p13a-publication-plan-r2'
MAP=P/'MAP.json'
OUT=P/'BLOBS.json'
BASE='4566887f3795b07326259b7ab6f0adb19536a12c'
HEAD='b995a83e5363a3843f9b902e08c2df4dd95840cb'
MAPSHA='1ae2b1445c3a47de83877e34e5afd3ad048f845423e1d2ac572261702da12b8c'
REF='refs/heads/evidence/1370-r10-clean-captures'
D=os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW
F=os.O_RDONLY|os.O_NOFOLLOW

def run(*args):
    return subprocess.check_output(args,cwd=R,text=True).strip()
def free():
    return int(run('df','-Pk',str(S)).splitlines()[-1].split()[3])
def open_dir(path):
    assert path.is_absolute()
    fd=os.open('/',D)
    try:
        for part in path.parts[1:]:
            nxt=os.open(part,D,dir_fd=fd)
            os.close(fd);fd=nxt
        return fd
    except BaseException:
        os.close(fd);raise
def attrs(st):
    return (st.st_dev,st.st_ino,st.st_mode,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def hash_blob(path, expected_size):
    parent=open_dir(path.parent)
    try:
        before_name=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
        assert stat.S_ISREG(before_name.st_mode) and before_name.st_size==expected_size
        fd=os.open(path.name,F,dir_fd=parent)
        try:
            before=os.fstat(fd)
            assert attrs(before)==attrs(before_name)
            proc=subprocess.Popen(['git','hash-object','-w','--stdin'],cwd=R,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
            h=hashlib.sha256();total=0
            try:
                with os.fdopen(fd,'rb',closefd=False) as source:
                    while True:
                        chunk=source.read(1024*1024)
                        if not chunk:break
                        h.update(chunk);total+=len(chunk)
                        proc.stdin.write(chunk)
                proc.stdin.close()
                blob_out=proc.stdout.read();err=proc.stderr.read();code=proc.wait()
            except BaseException:
                proc.kill();proc.wait();raise
            assert code==0,err.decode(errors='replace')
            assert total==expected_size
            after=os.fstat(fd)
            after_name=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
            assert attrs(before)==attrs(after)==attrs(after_name)
            blob=blob_out.decode().strip()
            assert len(blob)==40 and run('git','cat-file','-s',blob)==str(expected_size)
            return h.hexdigest(),blob
        finally:os.close(fd)
    finally:os.close(parent)
def sha_file(path):
    h=hashlib.sha256();parent=open_dir(path.parent)
    try:
        fd=os.open(path.name,F,dir_fd=parent)
        try:
            with os.fdopen(fd,'rb',closefd=False) as source:
                while True:
                    chunk=source.read(1024*1024)
                    if not chunk:break
                    h.update(chunk)
        finally:os.close(fd)
    finally:os.close(parent)
    return h.hexdigest()
def read_control(path):
    parent=open_dir(path.parent)
    try:
        before_name=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
        assert stat.S_ISREG(before_name.st_mode)
        fd=os.open(path.name,F,dir_fd=parent)
        try:
            before=os.fstat(fd)
            assert attrs(before)==attrs(before_name)
            chunks=[]
            while True:
                chunk=os.read(fd,1024*1024)
                if not chunk:break
                chunks.append(chunk)
            after=os.fstat(fd)
            after_name=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
            assert attrs(before)==attrs(after)==attrs(after_name)
            return b''.join(chunks)
        finally:os.close(fd)
    finally:os.close(parent)
def main():
    map_bytes=read_control(MAP)
    assert hashlib.sha256(map_bytes).hexdigest()==MAPSHA
    data=json.loads(map_bytes)
    assert data['baseEvidenceCommit']==BASE and data['sourceHead']==HEAD
    assert run('git','rev-parse','HEAD')==HEAD
    assert run('git','rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
    assert not run('git','status','--porcelain')
    assert run('git','rev-parse',REF)==BASE
    assert run('git','ls-remote','origin',REF).split()[0]==BASE
    assert free()>=3*1024*1024
    rows=[]
    for item in data['files']:
        path=pathlib.Path(item['source'])
        assert path.is_absolute() and path.is_relative_to(S)
        digest,blob=hash_blob(path,item['bytes'])
        rows.append({'source':str(path),'destination':item['destination'],'bytes':item['bytes'],'sha256':digest,'gitBlob':blob})
        assert free()>=3*1024*1024
    assert len(rows)==94 and sum(x['bytes'] for x in rows)==114202207
    result={'schema':'1370-r12-e0g-p13a-publication-blobs-r2','mapSha256':MAPSHA,'baseEvidenceCommit':BASE,'sourceHead':HEAD,'files':rows,'freeKiBAfter':free()}
    parent=open_dir(P)
    try:
        fd=os.open(OUT.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
        try:
            with os.fdopen(fd,'w',closefd=False) as f:
                json.dump(result,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(fd)
        finally:os.close(fd)
        os.fsync(parent)
    finally:os.close(parent)
    print(json.dumps({'status':'STAGED_BLOBS_ONLY','files':len(rows),'bytes':sum(x['bytes'] for x in rows),'receiptSha256':sha_file(OUT),'freeKiBAfter':result['freeKiBAfter']},sort_keys=True))
if __name__=='__main__':main()
