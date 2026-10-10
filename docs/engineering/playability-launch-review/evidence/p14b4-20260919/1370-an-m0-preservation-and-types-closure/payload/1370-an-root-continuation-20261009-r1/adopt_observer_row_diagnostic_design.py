import hashlib,json,os,stat
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
p=S/'1370-an-fullfunction-r5-observer-row-diagnostic-independent-design-review-20261010-r1/RECEIPT.json';rr=role(p)
assert rr['sha256']=='49255bea728ec37f5ae30e0819c2bc1acf598dfb986f2ef4868b64ce81a8335e'
r=json.loads(p.read_bytes());assert r['decision']=='ACCEPT_HELD_BOUNDED_OBSERVER_ROW_DIAGNOSTIC_DESIGN_SOURCE_ONLY' and not r['concreteFindings'] and r['executionAuthorization'] is False and r['implementationAuthorizedByThisReceipt'] is False
for x in [r['design'],r['authorReceipt'],*r['sourceAndObservedRoles']]:assert role(x['path'])==x
assert r['originalObserverCapsChanged'] is False and all(r[k] is None for k in ('actualFailedLoopIteration','actualFailedRowBytes','actualFailedRowKind','actualFailedTupleFamily'))
v={'schema':'1370-root-observer-row-diagnostic-design-adoption/v1','status':'ROOT_ADOPTED_BOUNDED_FIRST_REFUSED_OBSERVER_ROW_DIAGNOSTIC_DESIGN_ONLY','design':r['design'],'authorReceipt':r['authorReceipt'],'independentDesignReview':rr,'sourcePreparationAuthorized':True,'executionAuthorization':False,'implementationAccepted':False,'game':False,'limitsChanged':False,'sourceOnly':True,'scope':'Prepare independent specific RED controls and the exact public wrapper/fullbody diagnostic. Preserve original authoritative witness predicate, same Error, first-only sticky STOP and 4096-byte emitted diagnostic. No private observer, fixture, gameplay or cap changes. Actual row metadata and any repair remain pending. Fresh postpublication operational authority required before runtime.','implementationReviewCriteria':r['implementationReviewCriteria'],'futureSpecificControls':r['futureSpecificControls']}
q=A/'OBSERVER-ROW-DIAGNOSTIC-DESIGN-ADOPTION.json'
with q.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
q.chmod(0o444);print(json.dumps(role(q)))
