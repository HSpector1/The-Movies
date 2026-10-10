import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];r=read(rr['path'])
assert r['decision']=='ACCEPT_OBSERVED_FULLFUNCTION_GENERATED_TYPESCRIPT_PARSE_STOP_WITH_FULL_SHARED_POSTFLIGHT' and r['executionAuthorization'] is False and r['concreteFindings']==[]
keys=('readback','fullPostflightReadback','fullPostflightSnapshot','currentTypesAdoption')
for k in keys:assert role(r[k]['path'])==r[k]
assert r['readback']['sha256']=='fcc8bebdacd7ea7730e5b861676c980b386c8ef6d1e97e453daf03895b2822d1' and r['currentTypesAdoption']['sha256']=='be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83'
b=read(r['readback']['path']);f=read(r['fullPostflightReadback']['path']);t=read(r['currentTypesAdoption']['path'])
assert b['completed'] and b['laneReleased'] and b['toolSessionId']==21388 and b['toolExit']==2 and b['runnerExit']==1 and b['controllerStatus']=='STOP_NODE_EXIT' and b['actualGameplayPrefixExecuted'] is None and b['sourceAfter'] is None and b['dependencyAfter'] is None and b['sourceBefore']==t['freshSourceProof'] and b['dependencyBefore']==t['freshDependencyProof']
assert f['toolSessionId']==38091 and f['toolExit']==0 and f['fullImmutableEqual'] and f['nineStrictRootsEqual'] and f['laneReleased'] and f['priorStopPreserved'] and f['actualRouteReadback']==r['readback'] and f['fullPostflightSnapshot']==r['fullPostflightSnapshot']
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
v={'schema':'1370-root-fullfunction-protected-stop-observed-adoption/v1','status':'ROOT_ADOPTED_FULLFUNCTION_GENERATED_TYPESCRIPT_PARSE_STOP_WITH_FULL_SHARED_POSTFLIGHT','independentObservedReview':rr,**{k:r[k] for k in keys},'originalAttemptRemainsStop':True,'fullSharedPostflightAccepted':True,'soleLaneReleased':True,'executionAuthorization':False,'game':False,'actualGameplayPrefixExecuted':None,'sourceAfter':None,'dependencyAfter':None,'completeBeforeSourceAndDependenciesMatch':True,'fullM0AfterProofAccepted':False,'protectedFreezeContinues':True,'scope':'Actual21388 reached Node after full matching before proofs but generation suite failed at parsing with zero tests; no fixture, baseline or intended mutant RED accepted. Shared fullpost preserves original shared state without creating missing M0 afterproofs. Runtime report does not identify the exact imported token.'}
p=A/'FULLFUNCTION-R2-STOP-OBSERVED-ADOPTION.json'
with p.open('x') as h:json.dump(v,h,sort_keys=True,indent=2);h.write('\n');h.flush();os.fsync(h.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
