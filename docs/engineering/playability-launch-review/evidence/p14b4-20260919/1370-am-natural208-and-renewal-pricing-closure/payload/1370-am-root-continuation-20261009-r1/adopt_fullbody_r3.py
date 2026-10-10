import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
R=S/'1370-c0-m0-full-body-fixture-resolver-independent-source-review-after-al-20261009-r3/RECEIPT.json'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(R)['sha256']=='b2a2e12cb88992b695d3a5e355a1ac58a95698187b05c4f74fec045fd0065bb9'
r=json.loads(R.read_bytes());assert r['decision']=='ACCEPT_SOURCE_ONLY_HELD_R3_ISSUER_AND_FREEZE_ORDERING_REPAIRS' and r['concreteFindings']==[] and r['executionAuthorization'] is False and r['controlsReadyForRuntime'] is False
for key in ('sourcePins','sourceSeal','sourceProof'):assert role(r[key]['path'])==r[key]
for row in json.loads(Path(r['sourcePins']['path']).read_bytes())['files'].values():assert role(row['path'])==row
d={'schema':'1370-root-full-body-fixture-resolver-r3-held-source-adoption/v1','status':'ROOT_ADOPTED_HELD_SOURCE_R3_FIXTURE_RESOLVER_AND_TWO_ORDERING_REPAIRS','independentReview':role(R),'sourcePins':r['sourcePins'],'sourceSeal':r['sourceSeal'],'sourceProof':r['sourceProof'],'executionAuthorization':False,'controlsReadyForRuntime':False,'actualFixtures':None,'actualTypesAccepted':False,'actualControlsAccepted':False,'actualNeutralityAccepted':False,'scope':'Held source-only canonical resolver, natural boundary capture methods, explicit synthetic fixture builders, exact issuer and twelve-slot freeze-order checks. Both R2 findings are repaired and original STOP is retained;18 proposed consumer cases remain unrun. Actual route, bounded artifacts, recorded cleanup and real fixture/control/type outcomes remain separate pending work.','originalFailuresPreserved':True}
p=A/'M0-FULLBODY-R3-HELD-SOURCE-ADOPTION.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
