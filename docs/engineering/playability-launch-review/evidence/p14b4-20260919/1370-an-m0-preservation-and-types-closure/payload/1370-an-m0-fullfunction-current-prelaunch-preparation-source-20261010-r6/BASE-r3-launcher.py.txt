import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-an-root-continuation-20261009-r1';F=S/'1370-an-m0-types-external-config-fullpostflight-parent-recorded-20261009-r3';Q=S/'1370-an-m0-types-current-root-prelaunch-source-20261009-r1';P=S/'1370-an-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r3'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==9
rr,review=check(sys.argv[1],sys.argv[2]);fr,post=check(F/'READBACK.json',sys.argv[3]);typesrole,types=check(A/'M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json',sys.argv[4])
assert review['decision']=='ACCEPT_OBSERVED_M0_EXTERNAL_CONFIG_TYPES_COLLECTION_WITH_FULL_POSTFLIGHT' and review['concreteFindings']==[] and review['executionAuthorization'] is False
assert types['schema']=='1370-root-m0-external-config-types-observed-adoption/v1' and types['status']=='ROOT_ADOPTED_M0_EXTERNAL_CONFIG_TYPES_AND_COLLECTION_WITH_FULL_POSTFLIGHT' and types['independentObservedReview']==rr and types['fullPostflightReadback']==fr
assert types['typesAccepted'] is True and types['collectionAccepted'] is True and types['fullProtectedPostflightAccepted'] is True and types['soleLaneReleased'] is True and types['protectedFreezeContinues'] is True and types['game'] is False and types['executionAuthorization'] is False
assert review['typesAccepted'] is True and review['collectionAccepted'] is True and review['fullProtectedPostflight'] is True and review['fullPostflightSnapshot']==types['fullPostflightSnapshot']==post['fullPostflightSnapshot'] and review['readback']==types['readback'] and review['result']==types['result']
assert types['historicalRootUnchanged'] is False and types['originalR6StopPreserved'] is True and types['originalR1DiskStopPreserved'] is True
for key in ('result','readback','fullPostflightSnapshot','currentProtection','postR6RootAdoption'):assert role(types[key]['path'])==types[key]
assert post['toolExit']==0 and post['fullImmutableEqual'] is True and post['laneReleased'] is True and post['typesAccepted'] is False
for key in ('fullPostflightSnapshot','baseline','guardSource','guardConfig','guardSourcePins','actualRouteReadback'):assert role(post[key]['path'])==post[key]
typespost=post
latestrole,latest=check(sys.argv[5],sys.argv[6]);stoprole,stop=check(sys.argv[7],sys.argv[8])
assert stop['schema']=='1370-root-fullfunction-protected-stop-observed-adoption/v1' and stop['status']=='ROOT_ADOPTED_FULLFUNCTION_GENERATED_TYPESCRIPT_PARSE_STOP_WITH_FULL_SHARED_POSTFLIGHT'
assert stop['originalAttemptRemainsStop'] is True and stop['fullSharedPostflightAccepted'] is True and stop['soleLaneReleased'] is True and stop['executionAuthorization'] is False and stop['game'] is False
assert stop['currentTypesAdoption']==typesrole and stop['fullPostflightReadback']==latestrole and stop['fullPostflightSnapshot']==latest['fullPostflightSnapshot'] and stop['readback']==latest['actualRouteReadback']
for key in ('independentObservedReview','readback','fullPostflightReadback','fullPostflightSnapshot','currentTypesAdoption'):assert role(stop[key]['path'])==stop[key]
prior=json.loads(Path(stop['readback']['path']).read_bytes())
assert prior['status']=='ACTUAL_FULLFUNCTION_STOP_PRESERVED_PENDING_SHARED_FULL_POSTFLIGHT' and prior['completed'] is True and prior['toolExit']==2 and prior['controllerStatus']=='STOP_NODE_EXIT' and prior['runnerExit']==1 and prior['actualGameplayPrefixExecuted'] is None and prior['naturalBoundaryWeeks'] is None and prior['nodeResult'] is None and prior['sourceAfter'] is None and prior['dependencyAfter'] is None
assert latest['schema']=='1370-an-fullfunction-shared-fullpostflight-readback/v1' and latest['toolExit']==0 and latest['fullImmutableEqual'] is True and latest['nineStrictRootsEqual'] is True and latest['scratchIdentityOnlyEqual'] is True and latest['laneReleased'] is True and latest['priorStopPreserved'] is True
for key in ('fullPostflightSnapshot','baseline','guardSource','guardConfig','guardSourcePins','actualRouteReadback'):assert role(latest[key]['path'])==latest[key]
snapshot=json.loads(Path(latest['fullPostflightSnapshot']['path']).read_bytes());baseline=json.loads(Path(latest['baseline']['path']).read_bytes())
assert latest['baseline']['sha256']=='0136b4370cca27ab9af635c16124283049eb394b3dbaa63c32a755973e9c3596' and snapshot['immutable']==baseline['immutable']
assert latest['actualOwnedGroupIds'] and all(type(n) is int and n>1 for n in latest['actualOwnedGroupIds']) and len(set(latest['actualOwnedGroupIds']))==len(latest['actualOwnedGroupIds'])
post=latest
pr,preReview=check(S/'1370-an-m0-types-current-root-prelaunch-independent-source-review-20261009-r1/RECEIPT.json','6f7e329107fb6942580553a40ea7395695b090ef32d256e69b59a708baf672b9')
sp,pins=check(Q/'SOURCE-PINS.json','7015e2de01cb9964fcc6e362338461e9d8c3e5d6ab81bd618f67d04b4e51c455')
assert preReview['decision']=='ACCEPT_STATIC_CURRENT_AM_ORIGINAL_M0_PRELAUNCH_SOURCE_ONLY' and preReview['concreteFindings']==[] and preReview['executionAuthorization'] is False
for r in pins['files'].values():assert role(r['path'])==r
for name in ('original-current-root-prelaunch.py','PRELAUNCH-CONFIG-UNFILLED.json'):assert preReview['sourcePins'][name]==preReview['routeSourcePins'][name]==pins['files'][name]
config=json.loads((Q/'PRELAUNCH-CONFIG-UNFILLED.json').read_bytes());assert all(config[k] is None for k in ('protectedSnapshot','ownedPgids','outputPath'))
config['protectedSnapshot']=post['fullPostflightSnapshot'];config['ownedPgids']=post['actualOwnedGroupIds'];config['outputPath']=str(S/'1370-an-m0-fullfunction-current-prelaunch-output-20261010-r3')
for name in ('baseline','copyAdmission','guardConfig','guardSource','materializerBinding','materializerSource','originalPrelaunchSource','originalReusePlan','protectedSnapshot'):assert role(config[name]['path'])==config[name]
assert not os.path.lexists(P) and not os.path.lexists(config['outputPath']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
ar,ad=check(A/'M0-POST-R6-PRESERVATION-DIAGNOSTIC-OBSERVED-ADOPTION.json','5b5e062b8c5ac12bc70aa5ccb46ad101340ad692cdf0147ea44890882c0f44e1')
protr,prot=check(A/'M0-CURRENT-EXTERNAL-CONFIG-TYPES-PROTECTION.json','5980e69d3e2962f068f10fa3217caa45f3ff752cc93a5064eb0637f54a2439d0')
assert prot['postR6RootAdoptionSha256']==ar['sha256'] and prot['freshSourceProof']==ad['freshSourceProof'] and prot['freshDependencyProof']==ad['freshDependencyProof']
cr=put(A/'M0-FULLFUNCTION-R3-CURRENT-PRELAUNCH-CONFIG.json',config)
PY='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14';assert role(PY)['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);out=P/'prelaunch.stdout';err=P/'prelaunch.stderr';argv=[PY,'-I','-B',str(Q/'original-current-root-prelaunch.py'),cr['path'],cr['sha256']]
grant={'schema':'1370-root-direct-m0-original-prelaunch-observation-grant/v1','status':'GRANTED_ONCE_ORIGINAL_CURRENT_ROOT_PREFLIGHT','executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'mode':'fullfunction-current-protection','sourceReview':pr,'sourcePins':sp,'rootLauncher':role(__file__),'config':cr,'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','ownedPid':os.getpid(),'ownedPgid':os.getpgrp(),'ownedSid':os.getsid(0),'directExecPreservesPid':True,'perCommandTimeoutSeconds':180,'originalFullObservationsReusedUnderContinuousFreeze':True,'actualFullInventoryRun':False,'noHelperOriginalLockAbsentRequired':True,'rawPsFdLocalOnly':True,'ownedPgidsPassedToOriginalCurrent':config['ownedPgids'],'ownedGroupAbsenceClaimInPreflight':True,'protectedFreezeContinues':True,'proofOrTypesAccepted':False,'game':False,'automaticRetry':False,'postR6RootAdoption':ar,'currentProtection':protr,'typesObservedAdoption':typesrole,'successfulTypesAndFullPostflightAuthority':True,'typesFullPostflightSnapshot':types['fullPostflightSnapshot'],'latestSharedFullPostflightSnapshot':post['fullPostflightSnapshot'],'latestSharedFullPostflightReadback':latestrole,'reviewedPriorStopAdoption':stoprole,'originalAttemptRemainsStop':True}
gr=put(P/'GRANT.json',grant);print(json.dumps({'grant':gr,'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(grant['cwd']);os.execve(argv[0],argv,dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
