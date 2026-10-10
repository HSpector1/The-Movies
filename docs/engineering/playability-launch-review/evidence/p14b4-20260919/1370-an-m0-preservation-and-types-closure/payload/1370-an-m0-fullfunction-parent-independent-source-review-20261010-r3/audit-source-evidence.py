import json,hashlib,os,stat
from pathlib import Path
B=Path(__file__).parent
i=json.loads((B/'EVIDENCE-INPUT.json').read_bytes());roles={}
for k,r in i['roles'].items():
 p=Path(r['path']);assert str(p).startswith('/Users/zacheryspector/studio-scratch/') and p.resolve(strict=True)==p
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);assert stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<1024*1024
  raw=os.read(fd,a.st_size+1);z=os.fstat(fd);assert (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns)
  rr={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()};assert rr==r;roles[k]=rr
  if k=='predecessorReview':
   rev=json.loads(raw);assert rev['decision']=='ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY' and rev['executionAuthorization'] is False and rev['concreteFindings']==[] and rev['sourceManifest']==i['roles']['predecessorManifest']
 finally:os.close(fd)
encoded=(json.dumps({'schema':'1370-finite-parent-r3-source-evidence-audit/v1','roles':roles,'allRolesMatched':True,'candidateImported':False,'privateInventory':False},sort_keys=True,indent=2)+'\n').encode()
p=B/'EVIDENCE-READBACK.json';fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
print(json.dumps({'path':str(p),'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest()}))

