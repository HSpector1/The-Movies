import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
P=S/'1370-c0-m0-current-proof-parent-recorded-after-al-20261009-r2'
F=S/'1370-c0-m0-proof-fullguard-postflight-parent-after-al-20261009-r2'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert len(sys.argv)==3 and sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rp=Path(sys.argv[1]);rr=role(rp);assert rr['sha256']==sys.argv[2]
rv=json.loads(rp.read_bytes());assert rv['decision']=='ACCEPT_OBSERVED_CURRENT_M0_SOURCE_DEPENDENCY_PROOF_WITH_FULL_PROTECTED_POSTFLIGHT' and rv['concreteFindings']==[]
rb=json.loads((P/'READBACK.json').read_bytes());assert role(P/'READBACK.json')['sha256']=='f6352d724b5c0d6e36f0b3f895382daa5201d8776b322fa6e2a38d4d242dda2e'
assert rb['toolExit']==rb['helperExit']==rb['recorderExit']==rb['runnerExit']==0 and rb['laneReleased'] is True
pre=json.loads((A/'M0-PROOF-PREFLIGHT-OBSERVED-ADOPTION.json').read_bytes());assert pre['status']=='ROOT_ADOPTED_ORIGINAL_CURRENT_ROOT_PREFLIGHT' and pre['mode']=='proof'
post=json.loads((F/'POSTFLIGHT-READBACK.json').read_bytes());assert post['mode']=='proof' and post['actualToolExit']==post['scannerExit']==0 and post['immutableBaselineEquality'] is True and post['previousAcceptedPostflightEquality'] is True and post['protectedFreezeContinues'] is True
for r in [rb['sourceDependencyResult'],post['snapshot'],post['pins'],post['postOwnership'],post['actualTool']]:assert role(r['path'])==r
v=json.loads(Path(rb['sourceDependencyResult']['path']).read_bytes());assert v['status']=='PASS_READONLY_CURRENT_M0_SOURCE_DEPENDENCY_PROOF' and v['freshSourceProof']==v['sourceAfter'] and v['freshDependencyProof']==v['dependencyAfter'] and v['typesCommandsExecuted']==v['collectionCommandsExecuted']==0
assert v['productionHead']=='8cb704e2f18e6a635943893422c9cfdc206e106d' and v['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert v['completeM0AdoptionSha256']=='4711b938d126a0eea67d1c81c8bb47467690cb949c3e3ff731bf646608eb34ad' and v['physicalFactsSha256']=='e9f4829c501cc90475b9067c8ae32580fe5fca14fc40950ee083031f89081ba2'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
ad={'schema':'1370-root-current-m0-proof-observed-adoption/v1','status':'ROOT_ADOPTED_CURRENT_M0_SOURCE_DEPENDENCY_PROOF_WITH_FULL_POSTFLIGHT','executionAuthorization':False,'independentObservedReview':rr,'actualProofReadback':role(P/'READBACK.json'),'actualProofResult':rb['sourceDependencyResult'],'preflightObservedAdoption':role(A/'M0-PROOF-PREFLIGHT-OBSERVED-ADOPTION.json'),'fullPostflightReadback':role(F/'POSTFLIGHT-READBACK.json'),'fullPostflightSnapshot':post['snapshot'],'fullProtectedPostflightAccepted':True,'sourceAndDependencyBeforeAfterEqual':True,'productionHead':v['productionHead'],'productionSourceTree':v['productionSourceTree'],'mirrorPath':v['mirrorPath'],'mirrorFiles':1740,'mirrorBytes':119393120,'sourceEntriesExcludingRoot':1853,'dependencyEntriesExcludingRoot':12484,'dependencyContentBytes':348223802,'fullGuardDependencyEntriesIncludingRoot':12485,'sharedGuardM0SourceScopeSeparate':True,'recordedOwnedIds':rb['recordedOwnedIds'],'postOwnership':post['postOwnership'],'soleLaneReleased':True,'protectedFreezeContinues':True,'typesAccepted':False,'gameAccepted':False,'h13HistoricalFailureRemains':True}
ar=put(A/'M0-CURRENT-PROOF-OBSERVED-ADOPTION.json',ad)
protection={'schema':'1370-root-current-m0-types-protection/v1','m0TypesProtectionAccepted':True,'productionHead':v['productionHead'],'productionSourceTree':v['productionSourceTree'],'mirrorPath':v['mirrorPath'],'physicalFactsSha256':v['physicalFactsSha256'],'completeM0AdoptionSha256':v['completeM0AdoptionSha256'],'fullProtectedPostflightAccepted':True,'soleLaneReleased':True,'freshSourceProof':v['freshSourceProof'],'freshDependencyProof':v['freshDependencyProof'],'additionalRefs':{},'observedProofAdoption':ar,'independentObservedReview':rr,'fullPostflightSnapshot':post['snapshot'],'typesOrGameOutcomeAdmitted':False,'scope':'Current source/dependency protection authority for separately granted original four-command M0 type/collection route only; actual type or game outcomes remain unperformed.'}
pr=put(A/'M0-CURRENT-TYPES-PROTECTION.json',protection)
print(json.dumps({'adoption':ar,'currentTypesProtection':pr}))
