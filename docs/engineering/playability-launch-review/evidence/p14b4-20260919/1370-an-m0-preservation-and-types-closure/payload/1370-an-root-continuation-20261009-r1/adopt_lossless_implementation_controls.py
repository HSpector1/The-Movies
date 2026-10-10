import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
records={}
for key,name,sha,decision,manifestSha in [
 ('implementation','1370-an-lossless-trace-codec-consumers-independent-source-review-20261010-r3','c2e5a3929f49115e1ab8f70545d8578e0533937d0f8672e26f6957389fcefb4f','ACCEPT_STATIC_LOSSLESS_TRACE_CODEC_AND_STREAMING_CONSUMERS_WITH_ORDERING_ADAPTER_SOURCE_ONLY','7f2ef8499136e025a90ec67c417b1788e1209c69764a448527bb0a5244d68027'),
 ('controls','1370-an-lossless-trace-independent-controls-source-review-20261010-r2','ef8bfd51dd7298f377853bf242eb7968651c6f912a6e8a971c38dae4acafec50','ACCEPT_STATIC_PURE_LOSSLESS_TRACE_CONTROLS_SOURCE_ONLY','45d34dbe026cc53c4cb102a77b39e3e5319240f327eb7f5bcb4f12cebf27c33f')]:
 rr=role(S/name/'RECEIPT.json');assert rr['sha256']==sha
 r=read(rr['path']);assert r['decision']==decision and r['executionAuthorization'] is False and r['concreteFindings']==[]
 mr=r['sourceManifest'];assert role(mr['path'])==mr and mr['sha256']==manifestSha
 m=read(mr['path']);assert m['executionAuthorization'] is False
 for n,v in m['files'].items():assert role(v['path'])==v and r['sourcePins'][n]==v
 records[key+'Review']=rr;records[key+'SourcePins']=mr;records[key+'Roles']=m['files']
design=role(A/'LOSSLESS-TRACE-REPRESENTATION-DESIGN-ADOPTION.json');assert design['sha256']=='bafc6e88970215b0ff90c476f5fb62f2019404847de9b218aee8d71db97a1d86'
matrix=read(records['controlsRoles']['MATRIX.json']['path']);assert matrix['total']==len(matrix['cases'])==49 and matrix['positiveCount']==9 and matrix['specificNegativeCount']==40
assert len({r['id'] for r in matrix['cases']})==49
v={'schema':'1370-root-lossless-implementation-controls-source-adoption/v1','status':'ROOT_ADOPTED_LOSSLESS_IMPLEMENTATION_R3_AND_INDEPENDENT_CONTROLS_R2_SOURCE_ONLY',**records,'rootDesignAdoption':design,'caseCount':49,'positiveCount':9,'specificNegativeCount':40,'executionAuthorization':False,'runtimePerformed':False,'actualControls':None,'actualFit':None,'fullQualificationAccepted':False,'productionChanged':False,'claims':['Explicit encoded-storage accounting amendment only; old expanded-total failures remain failures.','Original logical and expanded row limits and gameplay observer limits unchanged.','One sticky closed-API fix and four nested reset-finally fixes preserve failures.','Only a separately independently reviewed recorded route with genuine root once grant may execute controls.']}
p=A/'LOSSLESS-IMPLEMENTATION-CONTROLS-SOURCE-ADOPTION.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
