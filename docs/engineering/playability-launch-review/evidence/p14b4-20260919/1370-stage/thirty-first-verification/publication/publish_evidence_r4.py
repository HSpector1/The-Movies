from __future__ import annotations
import hashlib,json,os,pathlib,stat,subprocess
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-r12-e0g-p13a-publication-plan-r2'
MAP=P/'MAP.json';BLOBS=P/'BLOBS.json';OUT=P/'PUBLISH-RESULT-r4.json';INDEXDIR=P/'publication-index-r4'
BASE='4566887f3795b07326259b7ab6f0adb19536a12c'
HEAD='b995a83e5363a3843f9b902e08c2df4dd95840cb'
REF='refs/heads/evidence/1370-r10-clean-captures'
PREFIX='docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/thirty-first-verification/'
MAPSHA='1ae2b1445c3a47de83877e34e5afd3ad048f845423e1d2ac572261702da12b8c'
BLOBSHA='5d39fffd2c638c76fbbe57df031426a28768c25de294dce78168d58796d4fe03'
D=os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW
F=os.O_RDONLY|os.O_NOFOLLOW

def run(*args,env=None):
    return subprocess.check_output(args,cwd=R,env=env,text=True).strip()
def open_dir(path):
    assert path.is_absolute()
    fd=os.open('/',D)
    try:
        for part in path.parts[1:]:
            nxt=os.open(part,D,dir_fd=fd);os.close(fd);fd=nxt
        return fd
    except BaseException:os.close(fd);raise
def attrs(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def read_control(path):
    parent=open_dir(path.parent)
    try:
        a=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
        assert stat.S_ISREG(a.st_mode)
        fd=os.open(path.name,F,dir_fd=parent)
        try:
            before=os.fstat(fd);assert attrs(before)==attrs(a)
            parts=[]
            while True:
                chunk=os.read(fd,1024*1024)
                if not chunk:break
                parts.append(chunk)
            assert attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False))
            return b''.join(parts)
        finally:os.close(fd)
    finally:os.close(parent)
def hash_bytes(data):
    p=subprocess.run(['git','hash-object','-w','--stdin'],cwd=R,input=data,capture_output=True,check=True)
    blob=p.stdout.decode().strip()
    assert len(blob)==40 and run('git','cat-file','-s',blob)==str(len(data))
    return blob
def hash_small(path):return hash_bytes(read_control(path))

def main():
    assert not os.path.lexists(INDEXDIR) and not os.path.lexists(OUT)
    mb=read_control(MAP);bb=read_control(BLOBS)
    assert hashlib.sha256(mb).hexdigest()==MAPSHA and hashlib.sha256(bb).hexdigest()==BLOBSHA
    a=json.loads(mb);b=json.loads(bb)
    assert a['baseEvidenceCommit']==b['baseEvidenceCommit']==BASE
    assert b['mapSha256']==MAPSHA and a['sourceHead']==b['sourceHead']==HEAD
    assert len(a['files'])==len(b['files'])==94
    assert run('git','rev-parse','HEAD')==HEAD and not run('git','status','--porcelain')
    assert run('git','rev-parse',REF)==BASE
    assert run('git','ls-remote','origin',REF).split()[0]==BASE
    assert run('git','ls-tree','-r','--name-only',BASE,PREFIX)==''
    review_path=S/'1370-r12-e0g-p13a-publish-code-static-review-r4/RECEIPT.json'
    review_bytes=read_control(review_path)
    review=json.loads(review_bytes)
    assert review['decision']=='ACCEPT_STATIC_PUBLICATION_CODE_ONLY'
    script_bytes=read_control(P/'publish_evidence_r4.py')
    assert review['scriptSha256']==hashlib.sha256(script_bytes).hexdigest()
    os.mkdir(INDEXDIR,0o700)
    assert stat.S_ISDIR(INDEXDIR.lstat().st_mode) and not INDEXDIR.is_symlink()
    env=os.environ.copy();env['GIT_INDEX_FILE']=str(INDEXDIR/'index')
    run('git','read-tree',BASE,env=env)
    seen=set()
    for src,blob in zip(a['files'],b['files']):
        assert src['source']==blob['source'] and src['destination']==blob['destination'] and src['bytes']==blob['bytes']
        dest=blob['destination'];parts=pathlib.PurePosixPath(dest).parts
        assert dest.startswith(PREFIX) and dest not in seen and '\\' not in dest and all(x not in ('','.','..') for x in parts)
        seen.add(dest)
        assert len(blob['sha256'])==64 and len(blob['gitBlob'])==40
        assert run('git','cat-file','-s',blob['gitBlob'])==str(blob['bytes'])
        run('git','update-index','--add','--cacheinfo',f"100644,{blob['gitBlob']},{dest}",env=env)
    extras=[
      ('publication/MAP.json',MAP),('publication/BLOBS.json',BLOBS),
      ('publication/stage_blobs_r3.py',P/'stage_blobs_r3.py'),
      ('publication/stage-blobs-r3.lane.log',P/'stage-blobs-r3.lane.log'),
      ('publication/stage-blobs-r3.lane.log.meta',P/'stage-blobs-r3.lane.log.meta'),
      ('publication/map-review/REPORT.md',S/'1370-r12-e0g-p13a-publication-map-static-review-r2/REPORT.md'),
      ('publication/map-review/RECEIPT.json',S/'1370-r12-e0g-p13a-publication-map-static-review-r2/RECEIPT.json'),
      ('publication/stager-review/REPORT.md',S/'1370-r12-e0g-p13a-stage-blobs-static-review-r3/REPORT.md'),
      ('publication/stager-review/RECEIPT.json',S/'1370-r12-e0g-p13a-stage-blobs-static-review-r3/RECEIPT.json'),
      ('publication/publish_evidence_r4.py',P/'publish_evidence_r4.py'),
      ('publication/publisher-review/REPORT.md',S/'1370-r12-e0g-p13a-publish-code-static-review-r4/REPORT.md'),
      ('publication/publisher-review/RECEIPT.json',S/'1370-r12-e0g-p13a-publish-code-static-review-r4/RECEIPT.json'),
    ]
    for suffix,path in extras:
        dest=PREFIX+suffix
        assert dest not in seen;seen.add(dest)
        data=mb if path==MAP else bb if path==BLOBS else script_bytes if path==P/'publish_evidence_r4.py' else review_bytes if path==review_path else read_control(path)
        blob=hash_bytes(data)
        run('git','update-index','--add','--cacheinfo',f'100644,{blob},{dest}',env=env)
    tree=run('git','write-tree',env=env)
    names=run('git','ls-tree','-r','--name-only',tree,PREFIX).splitlines()
    assert len(names)==106 and set(names)==seen
    commit=run('git','commit-tree',tree,'-p',BASE,'-m','evidence(1370): preserve r12 E0G p13a clean capture and reserve audits')
    assert run('git','rev-parse',f'{commit}^')==BASE
    assert run('git','rev-parse',f'{commit}^{{tree}}')==tree
    assert run('git','ls-remote','origin',REF).split()[0]==BASE
    run('git','update-ref',REF,commit,BASE)
    try:run('git','push','origin',f'{REF}:{REF}')
    except subprocess.CalledProcessError:raise SystemExit(f'PUSH_FAILED; local evidence ref now {commit}; inspect remote without reset')
    assert run('git','ls-remote','origin',REF).split()[0]==commit
    assert run('git','rev-parse','HEAD')==HEAD and not run('git','status','--porcelain')
    result={'schema':'1370-r12-e0g-p13a-publication-result-r4','status':'PUBLISHED_REMOTE_TIP_VERIFIED','base':BASE,'commit':commit,'tree':tree,'files':len(names),'mapSha256':MAPSHA,'blobsSha256':BLOBSHA,'remoteRef':REF}
    parent=open_dir(P)
    try:
        fd=os.open(OUT.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
        try:
            with os.fdopen(fd,'w',closefd=False) as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(fd)
        finally:os.close(fd)
        os.fsync(parent)
    finally:os.close(parent)
    print(json.dumps(result,sort_keys=True))
if __name__=='__main__':main()
