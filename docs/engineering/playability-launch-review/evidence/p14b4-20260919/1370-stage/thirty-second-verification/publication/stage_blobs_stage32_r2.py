from __future__ import annotations
import hashlib, json, os, pathlib, stat, subprocess

R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-r12-e0g-adoption-publication-plan-r1'
MAP=P/'MAP.json'
OUT=P/'BLOBS.json'
BASE='343644e8615b730c11a4683f95ea06e3e15fde7e'
CAPTURE_HEAD='b995a83e5363a3843f9b902e08c2df4dd95840cb'
CHECKPOINT_HEAD='87e2d7c76212fa8485aa99f5997fb9bc70fd1772'
SRC_TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REVIEW=S/'1370-r12-e0g-adoption-stage-blobs-static-review-r2/RECEIPT.json'
MAPSHA='98f9a5d3442d4f0fa185c7cf813624312bc853e3be4845ca6fec5703f82db6ff'
REF='refs/heads/evidence/1370-r10-clean-captures'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
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
                        assert free()>=3*1024*1024, '3 GiB floor breached during source blob stream'
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
    assert len(MAPSHA)==64 and all(c in '0123456789abcdef' for c in MAPSHA), 'unfrozen map SHA'
    map_bytes=read_control(MAP)
    assert hashlib.sha256(map_bytes).hexdigest()==MAPSHA
    data=json.loads(map_bytes)
    assert data['baseEvidenceCommit']==BASE and data['sourceHead']==CAPTURE_HEAD and data['schema']=='1370-r12-e0g-adoption-publication-map-r1'
    assert run('git','rev-parse','HEAD')==CHECKPOINT_HEAD
    assert run('git','rev-parse','HEAD:src')==SRC_TREE
    assert not run('git','status','--porcelain')
    assert run('git','remote','get-url','origin')==ORIGIN
    assert run('git','rev-parse',REF)==BASE
    assert run('git','ls-remote','origin',REF).split()[0]==BASE
    review=json.loads(read_control(REVIEW))
    assert review.get('decision')=='ACCEPT_STATIC_STAGE32_STAGER_R2'
    assert review.get('scriptSha256')==hashlib.sha256(read_control(P/'stage_blobs_stage32_r2.py')).hexdigest()
    assert review.get('mapSha256')==MAPSHA
    assert free()>=3*1024*1024
    rows=[]
    for item in data['files']:
        path=pathlib.Path(item['source'])
        assert path.is_absolute() and path.is_relative_to(S)
        digest,blob=hash_blob(path,item['bytes'])
        rows.append({'source':str(path),'destination':item['destination'],'bytes':item['bytes'],'sha256':digest,'gitBlob':blob})
        assert free()>=3*1024*1024
    assert len(rows)==48 and sum(x['bytes'] for x in rows)==146984645
    result={'schema':'1370-r12-e0g-adoption-publication-blobs-r1','mapSha256':MAPSHA,'baseEvidenceCommit':BASE,'sourceHead':CAPTURE_HEAD,'checkpointHead':CHECKPOINT_HEAD,'sourceTree':SRC_TREE,'files':rows,'freeKiBAfter':free()}
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
