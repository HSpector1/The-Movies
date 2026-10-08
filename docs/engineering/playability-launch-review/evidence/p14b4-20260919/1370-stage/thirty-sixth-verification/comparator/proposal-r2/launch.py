"""Authenticate comparator bytes in memory and dispatch only under reviewed lane."""
import hashlib,json,os,pathlib,signal,stat,sys,time
P=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-e0g-ebg-b-only-adoption-comparator-proposal-r2')
MANIFEST_SHA='95930155db3882eba46a77d44ad8514af57f45be9b2f2e0b01ffa2d1dc8e2be7'
def read(path,cap):
    st=path.lstat();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=cap
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        raw=os.read(fd,cap+1);after=os.fstat(fd)
        assert (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
        assert len(raw)==st.st_size
    finally:os.close(fd)
    return raw
start=globals().get('_BOOTSTRAP_START')
assert type(start)==float and 0<start<=time.monotonic()
signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('900-second comparator deadline')))
signal.setitimer(signal.ITIMER_REAL,max(0.001,900-(time.monotonic()-start)))
assert len(sys.argv)==3 and not P.is_symlink()
mb=read(P/'MANIFEST.json',100_000)
assert hashlib.sha256(mb).hexdigest()==MANIFEST_SHA
m=json.loads(mb);assert m['schema']=='1370-e0g-ebg-b-only-adoption-comparator-proposal-r2' and m['classification']=='UNRUN_STATIC_REVIEW_REQUIRED'
source=read(P/'compare.py',100_000)
assert hashlib.sha256(source).hexdigest()==m['files']['compare.py']['sha256'] and len(source)==m['files']['compare.py']['bytes']
review_path=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-e0g-ebg-b-only-adoption-comparator-independent-static-review-r2/RECEIPT.json')
review_raw=read(review_path,100_000)
assert hashlib.sha256(review_raw).hexdigest()==sys.argv[2]
review=json.loads(review_raw)
assert review=={'decision':'ACCEPT_STATIC_ONLY','manifestSha256':MANIFEST_SHA,'compareSha256':m['files']['compare.py']['sha256'],'selfcheckSha256':m['files']['selfcheck.py']['sha256']}
namespace={'__name__':'reviewed_comparator','__file__':str(P/'compare.py'),'BOOTSTRAP_START':start,'AUTHENTICATED_SOURCE_BYTES':source}
exec(compile(source,str(P/'compare.py'),'exec'),namespace)
namespace['main'](sys.argv[1])
