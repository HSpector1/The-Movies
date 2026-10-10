import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
P=S/'1370-c0-m0-types-parent-recorded-after-al-20261009-r6';F=S/'1370-c0-m0-types-fullguard-postflight-parent-after-al-20261009-r3'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert len(sys.argv)==3 and sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rp=Path(sys.argv[1]);rr=role(rp);assert rr['sha256']==sys.argv[2]
rv=json.loads(rp.read_bytes());assert rv['decision']=='ACCEPT_OBSERVED_STOP_M0_TYPES_ROOT_METADATA_DRIFT_WITH_SHARED_FULL_POSTFLIGHT' and rv['concreteFindings']==[]
rb=json.loads((P/'READBACK.json').read_bytes());assert role(P/'READBACK.json')['sha256']=='1456317c3f33bdba89e30cef89a133a649c79517eed36dda43c6c5f67afe57f3'
assert rb['toolExit']==rb['helperExit']==rb['recorderExit']==rb['runnerExit']==1 and rb['laneReleased'] is True and all(x['exit']==0 for x in rb['children']) and len(rb['children'])==4
assert rb['sourceAfterAvailable'] is False and rb['dependencyAfterAvailable'] is False and rb['sourcePreservationAccepted'] is False and rb['fourthChildRootMetadataChanged'] is True
post=json.loads((F/'POSTFLIGHT-READBACK.json').read_bytes());assert post['mode']=='types' and post['actualToolExit']==post['scannerExit']==0 and post['immutableBaselineEquality'] is True and post['previousAcceptedPostflightEquality'] is True and post['protectedFreezeContinues'] is True
for r in [rb['typesResult'],rb['retainedCollectionArtifact'],post['snapshot'],post['pins'],post['postOwnership'],post['actualTool']]:assert role(r['path'])==r
v=json.loads(Path(rb['typesResult']['path']).read_bytes());assert v['status']=='STOP_POSTFLIGHT_UNVERIFIED' and 'sourceAfter' not in v and 'nodeModulesAfter' not in v
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-m0-types-observed-metadata-stop-adoption/v1','status':'ROOT_ADOPTED_OBSERVED_STOP_M0_TYPES_ROOT_METADATA_DRIFT_WITH_SHARED_FULL_POSTFLIGHT','executionAuthorization':False,'independentObservedReview':rr,'actualStopReadback':role(P/'READBACK.json'),'actualTypesResult':rb['typesResult'],'actualTypesPreflight':role(A/'M0-TYPES-PREFLIGHT-OBSERVED-ADOPTION-R6.json'),'historicalCurrentProofAdoption':role(A/'M0-CURRENT-PROOF-OBSERVED-ADOPTION.json'),'preRunTypesProtection':role(A/'M0-CURRENT-TYPES-PROTECTION-R6.json'),'fullPostflightReadback':role(F/'POSTFLIGHT-READBACK.json'),'fullPostflightSnapshot':post['snapshot'],'productionHead':v['productionHead'],'productionSourceTree':v['productionSourceTree'],'children':rb['children'],'firstThreeChildRootBoundariesEqual':True,'fourthChildRootRosterEqual':True,'fourthChildRootMetadataChanged':True,'m0SourceAfterAvailable':False,'m0RouteDependencyAfterAvailable':False,'m0SourcePreservationAccepted':False,'sharedR9DependencyFullPostflightAccepted':True,'recordedOwnedIds':rb['recordedOwnedIds'],'postOwnership':post['postOwnership'],'soleLaneReleased':True,'protectedFreezeContinues':True,'metadataFailurePreserved':True,'typesAccepted':False,'collectionAccepted':False,'controlsAccepted':False,'gameAccepted':False,'h13HistoricalFailureWaived':False,'automaticRetry':False,'scope':'Observed metadata STOP plus unchanged separately scoped shared/R9/dependency protections only. Four successful children do not establish accepted types/collection. Current M0 full source preservation is unresolved; no timestamp restoration, unexplained repin or automatic retry is authorized.'}
p=A/'M0-R6-METADATA-STOP-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
