import hashlib,json,os,stat
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
P=S/'1370-an-fullfunction-r3-probe-overflow-diagnostic-source-proposal-20261010-r1';rr=role(S/'1370-an-fullfunction-r3-probe-overflow-diagnostic-independent-source-review-20261010-r1/RECEIPT.json');assert rr['sha256']=='d2da23a4e866001b528027d76591efbb3c724712e4aea00e1259d0dbf5e7759f'
r=json.loads(Path(rr['path']).read_bytes());assert r['decision']=='ACCEPT_STATIC_BOUNDED_PROBE_OVERFLOW_DIAGNOSTIC_PROPOSAL_ONLY' and r['executionAuthorization'] is False and r['concreteFindings']==[]
mr=role(P/'SOURCE-PINS.json');assert mr['sha256']=='54cdeea9afeda3135d87affcd455ce1dcd2805c54cf7e7ed654bf0665aa9e830'
m=json.loads((P/'SOURCE-PINS.json').read_bytes())
for f in m['files'].values():assert role(f['path'])==f
v={'schema':'1370-root-held-probe-overflow-diagnostic-source-adoption/v1','status':'ROOT_ADOPTED_HELD_FIRST_OVERFLOW_DIAGNOSTIC_SOURCE_ONLY','sourceManifest':mr,'independentSourceReview':rr,'diagnosis':role(P/'DIAGNOSIS.json'),'executionAuthorization':False,'runtimeReady':False,'automaticRetry':False,'limitsChanged':False,'completeTraceStillRequired':True,'helperProbeCaps':{'entries':16384,'rowBytes':65536,'totalBytes':2097152},'observerCaps':{'rows':512,'rowBytes':16384,'totalBytes':2097152},'scope':'Retain only the first failed resource predicates and scalar counters in the existing fatal assertion. No acceptance of truncated evidence, cap increase, call filtering, replay or gameplay change. Integrate in a fresh independently reviewed recorded diagnostic route under actual next operational authority before execution.'}
p=A/'PROBE-OVERFLOW-DIAGNOSTIC-HELD-SOURCE-ADOPTION.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
