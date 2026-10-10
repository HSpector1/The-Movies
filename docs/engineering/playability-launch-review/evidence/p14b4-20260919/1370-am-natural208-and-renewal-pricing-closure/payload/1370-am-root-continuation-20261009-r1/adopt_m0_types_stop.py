import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
P=S/'1370-c0-m0-types-parent-recorded-after-al-20261009-r5';F=S/'1370-c0-m0-types-fullguard-postflight-parent-after-al-20261009-r2'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert len(sys.argv)==3 and sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rp=Path(sys.argv[1]);rr=role(rp);assert rr['sha256']==sys.argv[2]
rv=json.loads(rp.read_bytes());assert rv['decision']=='ACCEPT_OBSERVED_STOP_M0_TYPES_ROOT_TS5097_WITH_FULL_PROTECTED_POSTFLIGHT' and rv['concreteFindings']==[]
rb=json.loads((P/'READBACK.json').read_bytes());assert role(P/'READBACK.json')['sha256']=='940fe91bee93b9a78a4a4a138aa3397088f047434a43481f4a1ee00e417e895e'
assert rb['toolExit']==rb['helperExit']==rb['recorderExit']==rb['runnerExit']==1 and rb['rootCompilerExit']==2 and rb['laneReleased'] is True and len(rb['compilerErrors'])==11
post=json.loads((F/'POSTFLIGHT-READBACK.json').read_bytes());assert post['mode']=='types' and post['actualToolExit']==post['scannerExit']==0 and post['immutableBaselineEquality'] is True and post['previousAcceptedPostflightEquality'] is True and post['protectedFreezeContinues'] is True
for r in [rb['typesResult'],rb['rootCompilerStdout'],post['snapshot'],post['pins'],post['postOwnership'],post['actualTool']]:assert role(r['path'])==r
v=json.loads(Path(rb['typesResult']['path']).read_bytes());prot=json.loads((A/'M0-CURRENT-TYPES-PROTECTION.json').read_bytes());assert v['sourceBefore']==v['sourceAfter']==prot['freshSourceProof'] and v['nodeModulesBefore']==v['nodeModulesAfter']==prot['freshDependencyProof']
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-m0-types-observed-stop-adoption/v1','status':'ROOT_ADOPTED_OBSERVED_STOP_M0_TYPES_ROOT_TS5097_WITH_FULL_PROTECTED_POSTFLIGHT','executionAuthorization':False,'independentObservedReview':rr,'actualStopReadback':role(P/'READBACK.json'),'actualTypesResult':rb['typesResult'],'rootCompilerStdout':rb['rootCompilerStdout'],'actualTypesPreflight':role(A/'M0-TYPES-PREFLIGHT-OBSERVED-ADOPTION.json'),'currentProofAdoption':role(A/'M0-CURRENT-PROOF-OBSERVED-ADOPTION.json'),'currentTypesProtection':role(A/'M0-CURRENT-TYPES-PROTECTION.json'),'fullPostflightReadback':role(F/'POSTFLIGHT-READBACK.json'),'fullPostflightSnapshot':post['snapshot'],'productionHead':v['productionHead'],'productionSourceTree':v['productionSourceTree'],'children':rb['children'],'compilerErrors':rb['compilerErrors'],'commandsNotExecuted':rb['commandsNotExecuted'],'twoChildRootBoundariesEqual':True,'sourceDependencyProofsEqual':True,'fullProtectedPostflightAccepted':True,'recordedOwnedIds':rb['recordedOwnedIds'],'postOwnership':post['postOwnership'],'soleLaneReleased':True,'protectedFreezeContinues':True,'typeFailurePreserved':True,'typesAccepted':False,'collectionAccepted':False,'controlsAccepted':False,'gameAccepted':False,'h13HistoricalFailureWaived':False,'automaticRetry':False,'scope':'Observed compiler STOP and unchanged source/dependency/shared protections only. Original source proof stays valid in its scope; future corrected type route requires genuine reviewed source and a separate actual grant.'}
p=A/'M0-TYPES-STOP-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
