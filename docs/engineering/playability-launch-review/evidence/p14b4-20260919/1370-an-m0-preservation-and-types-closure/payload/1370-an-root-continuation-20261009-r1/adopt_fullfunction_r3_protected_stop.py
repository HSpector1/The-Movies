import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];r=read(rr['path'])
assert r['decision']=='ACCEPT_OBSERVED_FULLFUNCTION_BASELINE_TRACE_OVERFLOW_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT' and r['executionAuthorization'] is False and r['concreteFindings']==[]
keys=('readback','fullPostflightReadback','fullPostflightSnapshot','currentTypesAdoption','generationReport','generationReceipt','fixture','baselineReport')
for k in keys:assert role(r[k]['path'])==r[k]
assert r['readback']['sha256']=='62802d2fff9906c2d8e90d7559b627af66f1d413d9d320b6c7b3a3a2da927e5a' and r['currentTypesAdoption']['sha256']=='be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83' and r['fixture']['sha256']=='0ae4a9a261600c23b1bfd05eb860d65ef0f6769c9918670eb97bf7120b74ec62' and r['fixture']['bytes']==12428510
b=read(r['readback']['path']);f=read(r['fullPostflightReadback']['path']);t=read(r['currentTypesAdoption']['path']);g=read(r['generationReport']['path']);gr=read(r['generationReceipt']['path']);bl=read(r['baselineReport']['path'])
assert b['completed'] and b['laneReleased'] and b['toolSessionId']==40169 and b['toolExit']==2 and b['runnerExit']==1 and b['controllerStatus']=='STOP_NODE_EXIT' and b['actualGameplayPrefixExecuted'] is None and b['sourceAfter'] is None and b['dependencyAfter'] is None and b['sourceBefore']==t['freshSourceProof'] and b['dependencyBefore']==t['freshDependencyProof']
assert g['success'] is True and g['numTotalTests']==g['numPassedTests']==1 and g['numFailedTests']==0 and gr['sourcePhase']=='tick.before.advanceTalentMarketWeek' and gr['naturalWeeks']==[196,197,208] and gr['artifact']==r['fixture'] and gr['outcome']=='GENERATED_UNADMITTED'
assert bl['success'] is False and bl['numTotalTests']==bl['numFailedTests']==1 and bl['numPassedTests']==0
assert f['toolSessionId']==71517 and f['toolExit']==0 and f['fullImmutableEqual'] and f['nineStrictRootsEqual'] and f['laneReleased'] and f['priorStopPreserved'] and f['actualRouteReadback']==r['readback'] and f['fullPostflightSnapshot']==r['fullPostflightSnapshot']
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
v={'schema':'1370-root-fullfunction-protected-stop-observed-adoption/v1','status':'ROOT_ADOPTED_FULLFUNCTION_BASELINE_TRACE_OVERFLOW_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT','independentObservedReview':rr,**{k:r[k] for k in keys},'originalAttemptRemainsStop':True,'fullSharedPostflightAccepted':True,'soleLaneReleased':True,'executionAuthorization':False,'game':False,'actualGameplayPrefixExecuted':None,'actualGenerationPhaseSucceeded':True,'generatedNaturalBoundaryWeeks':[196,197,208],'observedFixtureWithinApprovedCap':True,'baselineAccepted':False,'mutantAccepted':False,'fixtureQualificationAccepted':False,'neutralityAccepted':False,'sourceAfter':None,'dependencyAfter':None,'completeBeforeSourceAndDependenciesMatch':True,'fullM0AfterProofAccepted':False,'protectedFreezeContinues':True,'scope':'Actual40169 generated the real natural boundary packet and then failed baseline complete-trace assertion at first off author196 arm. Preserve actual phase success separately from terminal null prefix and missing afterproofs; no complete qualification, intended mutant RED, neutrality or ledger acceptance. Exact overflowing resource predicate remains unmeasured.'}
p=A/'FULLFUNCTION-R3-STOP-OBSERVED-ADOPTION.json'
with p.open('x') as h:json.dump(v,h,sort_keys=True,indent=2);h.write('\n');h.flush();os.fsync(h.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
