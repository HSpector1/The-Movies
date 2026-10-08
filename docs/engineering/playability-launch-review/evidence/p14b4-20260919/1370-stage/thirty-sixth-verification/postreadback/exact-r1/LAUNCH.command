python3 -I -B -c 'import hashlib,json,os,signal,stat
from pathlib import Path
signal.signal(signal.SIGALRM,lambda *_: (_ for _ in ()).throw(TimeoutError("180-second postreadback deadline")))
signal.setitimer(signal.ITIMER_REAL,180)
def read(p,cap):
 for parent in p.parents: assert stat.S_ISDIR(parent.lstat().st_mode)
 s=p.lstat();assert stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<=cap
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  raw=os.read(fd,cap+1);t=os.fstat(fd)
  assert (s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_ctime_ns)==(t.st_dev,t.st_ino,t.st_size,t.st_mtime_ns,t.st_ctime_ns)
  assert len(raw)==s.st_size
 finally:os.close(fd)
 return raw
p=Path("/Users/zacheryspector/studio-scratch/1370-e0g-ebg-b-only-adoption-r2-postreadback-observed-proposal-r3/check.py")
r=Path("/Users/zacheryspector/studio-scratch/1370-e0g-ebg-b-only-adoption-r2-postreadback-observed-independent-static-review-r3/RECEIPT.json")
raw=read(p,100000);rv=read(r,100000)
assert hashlib.sha256(raw).hexdigest()=="f198e17395f72755e6436c8b3dfb5f33535458b97b52c91f88c5c0e826e9dc7f"
assert hashlib.sha256(rv).hexdigest()=="335f47ad6dcd95ecf00254acbf88db17ca446fcd9acc8a065d40ed1e214c8d5f"
assert json.loads(rv)["decision"]=="ACCEPT_STATIC_ONLY"
exec(compile(raw,str(p),"exec"),{"__name__":"__main__","__file__":str(p)})
'
