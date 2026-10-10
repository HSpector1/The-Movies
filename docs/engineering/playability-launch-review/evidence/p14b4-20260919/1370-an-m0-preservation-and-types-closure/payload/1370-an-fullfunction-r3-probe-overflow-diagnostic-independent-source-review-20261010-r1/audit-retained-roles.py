import hashlib,json,os,stat
from pathlib import Path
ROOT=Path('/Users/zacheryspector/studio-scratch/1370-an-fullfunction-r3-probe-overflow-diagnostic-source-proposal-20261010-r1')
OUT=Path('/Users/zacheryspector/studio-scratch/1370-an-fullfunction-r3-probe-overflow-diagnostic-independent-source-review-20261010-r1')
def strict_pairs(pairs):
 d={}
 for k,v in pairs:
  if k in d: raise ValueError('duplicate key')
  d[k]=v
 return d
def obj(b):return json.loads(b,object_pairs_hook=strict_pairs)
def read(r):
 p=Path(r['path']);fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);assert stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=32*1024*1024
  h=hashlib.sha256();parts=[]
  while True:
   chunk=os.read(fd,65536)
   if not chunk:break
   parts.append(chunk);h.update(chunk)
  b=os.fstat(fd);assert (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(b.st_dev,b.st_ino,b.st_size,b.st_mtime_ns,b.st_ctime_ns)
  data=b''.join(parts);actual={'path':str(p),'bytes':len(data),'sha256':h.hexdigest()}
  assert actual==r,(actual,r)
  return data
 finally:os.close(fd)
source={'path':str(ROOT/'SOURCE-PINS.json'),'bytes':3645,'sha256':'54cdeea9afeda3135d87affcd455ce1dcd2805c54cf7e7ed654bf0665aa9e830'}
pins=obj(read(source));roles={'sourceManifest':source}
for name,r in pins['files'].items():read(r);roles[name]=r
proof=obj(read(pins['files']['SOURCE-PROOF.json']))
for name in ['originalControlsTemplate','originalProbe']:
 r=proof[name];data=read(r);roles[name]=r
 baseline='BASELINE-full-body-controls.ts' if name=='originalControlsTemplate' else 'BASELINE-m0WiringProbe.ts'
 assert data==read(pins['files'][baseline])
diagnosis=obj(read(pins['files']['DIAGNOSIS.json']))
for key in ['actualBaselineReport','actualControls','actualCoreTemplate','actualFixture','actualGenerationReport','probeSource']:
 read(diagnosis[key]);roles[key]=diagnosis[key]
result={'schema':'1370-bounded-overflow-proposal-retained-role-audit/v1','roles':roles,'allRolesMatched':True,'originalBaselinesByteExact':True,'candidateExecuted':False,'privateReads':False,'newRuntimeExecuted':False}
data=(json.dumps(result,sort_keys=True,indent=2)+'\n').encode();p=OUT/'EVIDENCE-READBACK.json'
fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
try:os.write(fd,data);os.fsync(fd)
finally:os.close(fd)
retained=p.read_bytes();assert retained==data
print(json.dumps({'path':str(p),'bytes':len(retained),'sha256':hashlib.sha256(retained).hexdigest(),'allRolesMatched':True}))
