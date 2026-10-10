import hashlib,json,os,stat
from pathlib import Path
A=Path(__file__).parent;S=A.parent;Q=S/'1370-an-fullfunction-r2-root-readback-source-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
mr=role(Q/'SOURCE-PINS.json');assert mr['sha256']=='74504bf6282dd68d8e747b0234fd6453f42a5ccd164f585f2fcca25224be5dd1'
m=json.loads((Q/'SOURCE-PINS.json').read_bytes())
for r in m['files'].values():assert role(r['path'])==r
sr=role(Q/'read-fullfunction.py');assert sr['sha256']=='fb660a270df060ff72234099f4148c317f33df31f658b5f42354e78f2edd8909';compile((Q/'read-fullfunction.py').read_bytes(),str(Q/'read-fullfunction.py'),'exec')
v={'schema':'1370-root-independent-fullfunction-retained-readback-source-review/v1','decision':'ACCEPT_STATIC_FINITE_R2_FULLFUNCTION_RETAINED_READBACK_ONLY','sourceManifest':mr,'source':sr,'reviewer':'root; source authored by m0_types_source_review','concreteFindings':[],'executionAuthorization':False,'actualOutcome':None,'checks':['Exact future actual session/final/grant/tool hashes required; claims authenticate direct helper/recorder identities and actual executed argv; lane terminal exit agrees.','R9 fixed source/config/review and nine reviewed aliases authenticate. Only finite named retained files are read; no private inventory or source modification.','Recorder stream hashes and original clocks retained. Nullable runner/controller/afterproof and gameplay states remain nullable; failed paths are preserved without qualification.','Successful result requires actual0, exact recorder/controller/node status, all complete before/after proofs equal adopted types, real fixture role, three exact phase reports, and specific intended mutant assertion. Independent observed review and full shared postflight are still required.','Recorded helper/recorder/ownedchild group identities are separate from Node PID. Fresh scoped absence and lock absence required before completed READBACK. Incomplete evidence produces a separate incomplete report.','No original R1 result overwritten; fresh P2 READBACK uses exclusive creation. No raw process inventory/export or inferred game acceptance.']}
p=A/'FULLFUNCTION-RETRY-READBACK-SOURCE-REVIEW.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
