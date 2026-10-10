import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
R=S/'1370-c0-m0-real-full-body-wiring-next-slice-independent-source-review-after-al-20261009-r2/RECEIPT.json'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(R)['sha256']=='af4a51151b1c04e18b6b41d03feed32b97aba7c9d3f0d7cbdc69e815d025b881'
r=json.loads(R.read_bytes());assert r['decision']=='ACCEPT_SOURCE_ONLY_HELD_FULL_BODY_WIRING_DESIGN_AND_MINIMAL_CONTINUATION' and r['concreteFindings']==[] and r['executionAuthorization'] is False and r['controlsReadyForRuntime'] is False
for p in r['all31PackageRoles']:assert role(p['path'])==p
d={'schema':'1370-root-m0-full-body-held-design-adoption/v1','status':'ROOT_ADOPTED_SOURCE_ONLY_HELD_FULL_BODY_WIRING_DESIGN','review':role(R),'sourcePins':r['sourcePins'],'sourceSeal':r['sourceSeal'],'executionAuthorization':False,'controlsReadyForRuntime':False,'actualControlsAccepted':False,'actualNeutralityAccepted':False,'scope':'Five complete module derivatives and exact catch mutant are accepted as held source design. Continue finite source preparation for fixtures, canonical resolver, complete ordering projections and actual route; no runtime grant is implied.','remaining':['Actual current M0 types and complete protections','Already-incremented pre-market196/208 actual fixture authorities and valid fallback/off-target premises','Canonical whole-module loader identity and complete source-array/chooser ordinals','Independently reviewed recorded controls and specific catch-removal RED outcome'],'originalFailuresPreserved':True}
p=A/'M0-FULLBODY-HELD-DESIGN-SOURCE-ADOPTION.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
