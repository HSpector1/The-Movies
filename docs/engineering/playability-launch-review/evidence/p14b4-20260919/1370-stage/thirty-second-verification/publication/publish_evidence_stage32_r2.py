from __future__ import annotations
import hashlib,json,os,pathlib,stat,subprocess
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-r12-e0g-adoption-publication-plan-r1'
MAP=P/'MAP.json';BLOBS=P/'BLOBS.json';OUT=P/'PUBLISH-RESULT-stage32-r2.json';INDEXDIR=P/'publication-index-stage32-r2'
BASE='343644e8615b730c11a4683f95ea06e3e15fde7e'
CAPTURE_HEAD='b995a83e5363a3843f9b902e08c2df4dd95840cb'
CURRENT_HEAD='87e2d7c76212fa8485aa99f5997fb9bc70fd1772'
SRC_TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF='refs/heads/evidence/1370-r10-clean-captures'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
PREFIX='docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/thirty-second-verification/'
MAPSHA='98f9a5d3442d4f0fa185c7cf813624312bc853e3be4845ca6fec5703f82db6ff'
BLOBSHA='69c2635e2d94561dfaf40a3be8ce4e41201c466748f66e787842eca440002684'
STAGER_REVIEW_SHA='f59361bca8fabb07063bf344ae6027f0e765da4acc75f3cdf51eb2b6ab89db48'
STAGER_LOG_SHA='654d40e99a35fbf740eb32c267d2b61b4cab4d348d2de42bf7ac91aee85fba70'
STAGER_META_SHA='d7b113e0d80986ffa234209b59ffedbc80787ccfcacd888e2c6f59985858b4dd'
STAGER_OBSERVED_SHA='d84e3c9251d2cac23c07090871e44327e36aa8a53bde3acbed65914485264e5c'
STAGER_OBSERVED=S/'1370-r12-e0g-adoption-blobs-observed-review-r1/RECEIPT.json'
STAGER_SCRIPT_SHA='16ebae3dd874774696194699c23205dde16490cc4388eb27edd23c265284adc4'
FLOOR=3*1024*1024*1024
PREFLIGHT=4*1024*1024*1024
D=os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW
F=os.O_RDONLY|os.O_NOFOLLOW

def free():
    st=os.statvfs(S); n=st.f_bavail*st.f_frsize
    assert n>=FLOOR, f'3 GiB floor breached: {n}'
    return n
def run(*args,env=None):
    free()
    result=subprocess.check_output(args,cwd=R,env=env,text=True).strip()
    free()
    return result
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
                parts.append(chunk);free()
            assert attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False))
            return b''.join(parts)
        finally:os.close(fd)
    finally:os.close(parent)
def hash_bytes(data):
    free()
    p=subprocess.run(['git','hash-object','-w','--stdin'],cwd=R,input=data,capture_output=True,check=True)
    free()
    blob=p.stdout.decode().strip()
    assert len(blob)==40 and run('git','cat-file','-s',blob)==str(len(data))
    return blob
def hash_small(path):return hash_bytes(read_control(path))

def main():
    assert len(STAGER_OBSERVED_SHA)==64 and all(c in '0123456789abcdef' for c in STAGER_OBSERVED_SHA), 'unfrozen observed stager SHA'
    assert free()>=PREFLIGHT, 'less than 4 GiB before publication'
    assert len(MAPSHA)==len(BLOBSHA)==64 and all(c in '0123456789abcdef' for c in MAPSHA+BLOBSHA), 'unfrozen publication SHA'
    assert not os.path.lexists(INDEXDIR) and not os.path.lexists(OUT)
    mb=read_control(MAP);bb=read_control(BLOBS)
    assert hashlib.sha256(mb).hexdigest()==MAPSHA and hashlib.sha256(bb).hexdigest()==BLOBSHA
    a=json.loads(mb);b=json.loads(bb)
    assert a['baseEvidenceCommit']==b['baseEvidenceCommit']==BASE
    assert b['mapSha256']==MAPSHA and a['sourceHead']==b['sourceHead']==CAPTURE_HEAD
    assert b['checkpointHead']==CURRENT_HEAD and b['sourceTree']==SRC_TREE
    assert a['schema']=='1370-r12-e0g-adoption-publication-map-r1' and b['schema']=='1370-r12-e0g-adoption-publication-blobs-r1'
    assert len(a['files'])==len(b['files'])==48
    assert sum(x['bytes'] for x in a['files'])==sum(x['bytes'] for x in b['files'])==146984645
    assert run('git','rev-parse','HEAD')==CURRENT_HEAD and run('git','rev-parse','HEAD:src')==SRC_TREE and not run('git','status','--porcelain')
    assert run('git','remote','get-url','origin')==ORIGIN
    assert run('git','rev-parse',f'{CURRENT_HEAD}^')==CAPTURE_HEAD
    assert run('git','rev-parse',REF)==BASE
    assert run('git','ls-remote','origin',REF).split()[0]==BASE
    assert run('git','ls-tree','-r','--name-only',BASE,PREFIX)==''
    assert hashlib.sha256(read_control(P/'stage_blobs_stage32_r2.py')).hexdigest()==STAGER_SCRIPT_SHA
    assert hashlib.sha256(read_control(P/'stage-blobs-stage32-r2.lane.log')).hexdigest()==STAGER_LOG_SHA
    stager_meta=read_control(P/'stage-blobs-stage32-r2.lane.log.meta')
    assert hashlib.sha256(stager_meta).hexdigest()==STAGER_META_SHA and b'end, exit 0;' in stager_meta
    assert hashlib.sha256(read_control(S/'1370-r12-e0g-adoption-stage-blobs-static-review-r2/RECEIPT.json')).hexdigest()==STAGER_REVIEW_SHA
    observed_bytes=read_control(STAGER_OBSERVED)
    assert hashlib.sha256(observed_bytes).hexdigest()==STAGER_OBSERVED_SHA
    observed=json.loads(observed_bytes)
    assert observed.get('decision')=='ACCEPT_OBSERVED_BLOBS_ONLY' and observed.get('blobsSha256')==BLOBSHA
    assert observed.get('mapSha256')==MAPSHA and observed.get('files')==48 and observed.get('bytes')==146984645
    assert observed.get('stagerScriptSha256')==STAGER_SCRIPT_SHA and observed.get('stagerStaticReviewSha256')==STAGER_REVIEW_SHA
    assert observed.get('stagerLaneLogSha256')==STAGER_LOG_SHA and observed.get('stagerLaneMetaSha256')==STAGER_META_SHA
    observed_report_path=STAGER_OBSERVED.with_name('REPORT.md')
    observed_report_bytes=read_control(observed_report_path)
    assert hashlib.sha256(observed_report_bytes).hexdigest()==observed.get('reportSha256')
    review_path=S/'1370-r12-e0g-adoption-publish-static-review-r2/RECEIPT.json'
    review_bytes=read_control(review_path)
    review=json.loads(review_bytes)
    assert review['decision']=='ACCEPT_STATIC_STAGE32_PUBLISHER_R2'
    assert review.get('mapSha256')==MAPSHA and review.get('blobsSha256')==BLOBSHA
    assert review.get('baseEvidenceCommit')==BASE
    script_bytes=read_control(P/'publish_evidence_stage32_r2.py')
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
      ('publication/stage_blobs_stage32_r2.py',P/'stage_blobs_stage32_r2.py'),
      ('publication/stage-blobs-stage32-r2.lane.log',P/'stage-blobs-stage32-r2.lane.log'),
      ('publication/stage-blobs-stage32-r2.lane.log.meta',P/'stage-blobs-stage32-r2.lane.log.meta'),
      ('publication/map-review/REPORT.md',S/'1370-r12-e0g-adoption-publication-map-static-review-r1/REPORT.md'),
      ('publication/map-review/RECEIPT.json',S/'1370-r12-e0g-adoption-publication-map-static-review-r1/RECEIPT.json'),
      ('publication/stager-review/REPORT.md',S/'1370-r12-e0g-adoption-stage-blobs-static-review-r2/REPORT.md'),
      ('publication/stager-review/RECEIPT.json',S/'1370-r12-e0g-adoption-stage-blobs-static-review-r2/RECEIPT.json'),
      ('publication/publish_evidence_stage32_r2.py',P/'publish_evidence_stage32_r2.py'),
      ('publication/publisher-review/REPORT.md',S/'1370-r12-e0g-adoption-publish-static-review-r2/REPORT.md'),
      ('publication/publisher-review/RECEIPT.json',S/'1370-r12-e0g-adoption-publish-static-review-r2/RECEIPT.json'),
      ('publication/stager-observed-review/REPORT.md',S/'1370-r12-e0g-adoption-blobs-observed-review-r1/REPORT.md'),
      ('publication/stager-observed-review/RECEIPT.json',STAGER_OBSERVED),
    ]
    for suffix,path in extras:
        dest=PREFIX+suffix
        assert dest not in seen;seen.add(dest)
        data=mb if path==MAP else bb if path==BLOBS else script_bytes if path==P/'publish_evidence_stage32_r2.py' else review_bytes if path==review_path else observed_bytes if path==STAGER_OBSERVED else observed_report_bytes if path==observed_report_path else read_control(path)
        blob=hash_bytes(data)
        run('git','update-index','--add','--cacheinfo',f'100644,{blob},{dest}',env=env)
    tree=run('git','write-tree',env=env)
    names=run('git','ls-tree','-r','--name-only',tree,PREFIX).splitlines()
    assert len(names)==62 and set(names)==seen
    commit=run('git','commit-tree',tree,'-p',BASE,'-m','evidence(1370): preserve r12 E0G adoption exploratory capture')
    assert run('git','rev-parse',f'{commit}^')==BASE
    assert run('git','rev-parse',f'{commit}^{{tree}}')==tree
    assert run('git','ls-remote','origin',REF).split()[0]==BASE
    run('git','update-ref',REF,commit,BASE)
    try:run('git','push','origin',f'{REF}:{REF}')
    except subprocess.CalledProcessError:raise SystemExit(f'PUSH_FAILED; local evidence ref now {commit}; inspect remote without reset')
    assert run('git','ls-remote','origin',REF).split()[0]==commit
    assert run('git','rev-parse','HEAD')==CURRENT_HEAD and run('git','rev-parse','HEAD:src')==SRC_TREE and not run('git','status','--porcelain')
    result={'schema':'1370-r12-e0g-adoption-publication-result-stage32','status':'PUBLISHED_REMOTE_TIP_VERIFIED','base':BASE,'commit':commit,'tree':tree,'files':len(names),'mapSha256':MAPSHA,'blobsSha256':BLOBSHA,'remoteRef':REF,'captureHead':CAPTURE_HEAD,'checkpointHead':CURRENT_HEAD,'sourceTree':SRC_TREE,'stagerObservedReceiptSha256':STAGER_OBSERVED_SHA,'freeBytesAfter':free()}
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
