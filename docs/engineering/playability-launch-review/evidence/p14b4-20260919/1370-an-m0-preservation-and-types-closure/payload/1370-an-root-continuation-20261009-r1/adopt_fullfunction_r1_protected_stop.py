import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];r=read(rr['path'])
assert r['decision']=='ACCEPT_OBSERVED_FULLFUNCTION_WRONG_MIRROR_SUBJECT_STOP_WITH_FULL_SHARED_POSTFLIGHT' and r['executionAuthorization'] is False and r['concreteFindings']==[]
keys=('readback','fullPostflightReadback','fullPostflightSnapshot','currentTypesAdoption')
for k in keys:assert role(r[k]['path'])==r[k]
assert r['readback']['sha256']=='2292a2f92aac3d837885b5686720416bdaf4fff123f2610c3ce3dd81ac73c30d' and r['fullPostflightReadback']['sha256']=='735e8d8fcaf1ae96f2b4f39608f71a66d85eba14b1941e5bd97d23afda096b55' and r['currentTypesAdoption']['sha256']=='be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83'
b=read(r['readback']['path']);f=read(r['fullPostflightReadback']['path'])
assert b['completed'] and b['laneReleased'] and b['toolSessionId']==95737 and b['toolExit']==2 and b['runnerExit']==1 and b['actualGameplayPrefixExecuted'] is False and b['sourceAfter'] is None and b['dependencyAfter'] is None
assert f['toolSessionId']==89456 and f['toolExit']==0 and f['fullImmutableEqual'] and f['nineStrictRootsEqual'] and f['laneReleased'] and f['priorStopPreserved'] and f['actualRouteReadback']==r['readback'] and f['fullPostflightSnapshot']==r['fullPostflightSnapshot']
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
v={'schema':'1370-root-fullfunction-protected-stop-observed-adoption/v1','status':'ROOT_ADOPTED_FULLFUNCTION_WRONG_MIRROR_SUBJECT_STOP_WITH_FULL_SHARED_POSTFLIGHT','independentObservedReview':rr,**{k:r[k] for k in keys},'originalAttemptRemainsStop':True,'fullSharedPostflightAccepted':True,'soleLaneReleased':True,'executionAuthorization':False,'game':False,'actualGameplayPrefixExecuted':False,'sourceAfter':None,'dependencyAfter':None,'fullM0AfterProofAccepted':False,'protectedFreezeContinues':True,'scope':'Original95737 failed at wrong container argument before enumeration or Node. Shared protected postflight passed; no fixture qualification, full M0 after-proof or neutrality admission. Retry requires reviewed correction and fresh original current preflight.'}
p=A/'FULLFUNCTION-R1-STOP-OBSERVED-ADOPTION.json'
with p.open('x') as h:json.dump(v,h,sort_keys=True,indent=2);h.write('\n');h.flush();os.fsync(h.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
