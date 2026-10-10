import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
p=S/'1370-ao-observer-row-diagnostic-api-independent-review-20261010-r2/RECEIPT.json';r=role(p);assert r['sha256']=='3e976ae75addcefe331784183bb8ebbb6cbf619d1ba2f6782c3a1a2c003678be'
v=json.loads(p.read_bytes());assert v['decision']=='ACCEPT_STATIC_BOUNDED_OBSERVER_ROW_DIAGNOSTIC_API_ONLY' and v['executionAuthorization'] is False and not v['concreteFindings']
api=role(S/'1370-ao-observer-row-diagnostic-api-20261010-r2/API.md');assert api['sha256']=='8b23588f28233794a7d0317b76d0770912015bc3ffd20dd823aae74b21225eb8'
out={'schema':'1370-ao-root-observer-diagnostic-api-adoption/v1','status':'ROOT_ADOPTED_R2_BOUNDED_DIAGNOSTIC_API_SOURCE_ONLY','api':api,'independentReview':r,'governingDesign':role(S/'1370-an-root-continuation-20261009-r1/OBSERVER-ROW-DIAGNOSTIC-DESIGN-ADOPTION.json'),'startingAuthority':role(A/'STARTING-AUTHORITY.json'),'sourcePreparationAuthorized':True,'implementationAccepted':False,'controlsAccepted':False,'executionAuthorization':False,'priorApiStopPreserved':True,'actual56544ErrorReplacementClaim':False,'scope':'Actual shared runObserverArm helper preserves sticky original row Error through later thrown Error and end/reset failures, with ordinary cleanup semantics unchanged absent row Error. Independent implementation/tests and recorded controls still required.'}
q=A/'API-R2-ADOPTION.json'
with q.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
q.chmod(0o444);print(json.dumps(role(q)))
