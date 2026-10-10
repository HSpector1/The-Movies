import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-m0-post-r6-preservation-diagnostic-parent-source-20261009-r2';E=S/'1370-an-m0-post-r6-preservation-diagnostic-source-20261009-r2'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
preReview,preR=check(sys.argv[1],sys.argv[2]);assert preR['decision']=='ACCEPT_ACTUAL_CURRENT_AM_FULL_PREFLIGHT_ONLY' and preR['concreteFindings']==[] and preR['executionAuthorization'] is False
preReadback,pre=check(S/'1370-an-current-am-fullpreflight-parent-recorded-20261009-r1/READBACK.json','12f58775e2fdaae5622393f53397cff9ea0f3cbdbb07ac1af91bb768ee2cfad2')
assert preR['readback']==preReadback and pre['status']=='ACTUAL_CURRENT_AM_FULL_PREFLIGHT_COMPLETE_UNADOPTED'
for r in pre.values():
 if type(r) is dict and set(r)=={'path','bytes','sha256'}:assert role(r['path'])==r
assert pre['productionHead']=='7087f116cf998fd86e33fb8e004df628e0686dbd' and pre['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and pre['freshFullInventory'] is True
pr,parentPins=check(Q/'SOURCE-PINS.json','38648e516daf240705f6583a580594d947835240e73e1bb53b8105252e67276b')
er,executorPins=check(E/'SOURCE-PINS.json','42611a6faecc6b13e7b8a18cfef210b06d7167bb3e2a23d08862db65c4531262')
rr,parentReview=check(S/'1370-an-m0-post-r6-preservation-diagnostic-parent-independent-source-review-20261009-r2/RECEIPT.json','c6aa159c8404f4587711c9bfaac08178f8a8fb3865f00d22ac9c29e3936a6434')
sr,sourceReview=check(S/'1370-an-m0-post-r6-preservation-diagnostic-independent-source-review-20261009-r2/RECEIPT.json','69c21815277b22aedf9c6c222a8fac25f265296e473de9973f21999ec4f03d8d')
assert parentReview['decision']=='ACCEPT_STATIC_POST_R6_M0_PRESERVATION_DIAGNOSTIC_PARENT_SOURCE_ONLY' and parentReview['concreteFindings']==[] and parentReview['executionAuthorization'] is False
assert sourceReview['decision']=='ACCEPT_STATIC_POST_R6_M0_PRESERVATION_DIAGNOSTIC_SOURCE_ONLY' and sourceReview['concreteFindings']==[] and sourceReview['executionAuthorization'] is False
for pins,review in ((parentPins,parentReview),(executorPins,sourceReview)):
 for name,r in pins['files'].items():assert role(r['path'])==r==review['sourcePins'][name]==review['routeSourcePins'][name]
profile=json.loads((Q/'PROFILES.json').read_bytes())['proof'];assert profile['sourcePins']==er
for name,r in dict(profile['executableRoles'],**{'CONFIG.json':profile['config']}).items():assert role(r['path'])==r==sourceReview['sourcePins'][name]
toolsrole,tools=check(A/'M0-RUNTIME-TOOLS.json','a681efc4a9b29dfc62bffb6c1e7cd434107bfb1064769f712fca48227bd64106');runtime=tools['runtimeTools']
controlsRole,controls=check(A/'DISPOSABLE-METADATA-PAIR-OBSERVED-ADOPTION.json','9badcf90e1e70153c5a51a9cf27ec3be1e889304188750b573bea422b33c5c01')
assert controls['status']=='ROOT_ADOPTED_ACTUAL_DISPOSABLE_METADATA_PAIR_ONLY'
P=Path(profile['parentPath']);assert not os.path.lexists(P) and not os.path.lexists(profile['laneLog']) and not os.path.lexists(profile['laneLog']+'.meta') and not os.path.lexists(profile['resultRoot']) and not os.path.lexists(profile['recorderResult']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
preAd=dict(pre,schema='1370-an-root-current-am-fullpreflight-adoption/v1',status='ROOT_ADOPTED_CURRENT_AM_FULL_PREFLIGHT',independentObservedReview=preReview,actualReadback=preReadback,protectedFreezeContinues=True)
preAdoption=put(A/'CURRENT-AM-FULL-PREFLIGHT-OBSERVED-ADOPTION.json',preAd)
sourceAdoption=put(A/'M0-PRESERVATION-DIAGNOSTIC-SOURCE-ADOPTION.json',{'schema':'1370-an-root-m0-preservation-diagnostic-source-adoption/v1','status':'ROOT_ADOPTED_M0_PRESERVATION_DIAGNOSTIC_EXECUTOR_AND_PARENT_SOURCE','sourcePins':er,'sourceReview':sr,'parentSourcePins':pr,'parentSourceReview':rr,'currentAMPreflightAdoption':preAdoption,'controlsRootAdoption':controlsRole,'executionAuthorization':False,'actualDiagnosticAccepted':False,'typesAccepted':False,'game':False,'originalR6StopPreserved':True,'scope':'Complete historical content/nonroot/dependencies audit with only separately recorded post-R6 root tuple. Original before-root identity remains historical; new root baseline needs actual diagnostic, full postflight and independent observed adoption.'})
spec=json.loads((Q/'SPEC-UNFILLED.json').read_bytes());assert spec['executionAuthorization'] is False and spec['mode']=='proof' and spec['currentProtection'] is None and spec['additionalRefs']=={}
assert all(v is None for v in spec['diagnosticInputs'].values())
spec.update(executionAuthorization=True,sourceReview=sr,runtimeTools=runtime,diagnosticInputs={'controlsObservedReview':controls['independentObservedReview'],'controlsRootAdoption':controlsRole,'currentAMFullPreflight':pre['snapshot'],'currentAMFullPreflightAdoption':preAdoption})
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);specrole=put(P/'FILLED-SPEC.json',spec)
helper=S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh';assert role(helper)['sha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e'
python=runtime['python']['physicalPath'];assert role(python)['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
argv=['/bin/bash',str(helper),'0',profile['laneLog'],python,'-I','-B',str(Q/'fill-grant-exec.py'),specrole['path'],specrole['sha256']]
grant={'schema':'1370-root-m0-once-recorded-lane-grant/v1','status':'GRANTED_ONCE_EXACT_POST_R6_M0_PRESERVATION_DIAGNOSTIC','executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':'proof','sourceReview':sr,'parentFillAndPrelaunchSourceReview':rr,'parentSourcePins':pr,'sourcePins':er,'sourceAdoption':sourceAdoption,'preflightObservedAdoption':preAdoption,'runtimeToolsObservation':toolsrole,'filledSpec':specrole,'rootLauncher':role(__file__),'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':{'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'ownedOuterHelperPid':os.getpid(),'ownedOuterHelperPgid':os.getpgrp(),'ownedOuterHelperSid':os.getsid(0),'directExecPreservesOuterHelperIdentity':True,'preparationSeconds':60,'runtimeBoundsSeconds':{'runner':300,'active':320,'whole':330},'runtimeClockStartsInsideUnchangedLAUNCH':True,'combinedFillRuntime330Claim':False,'originalChildCommandStreamCapsBytes':8388608,'helperCapture':'Original r8 combined log; no added live parent byte limiter','actualOutcome':None,'game':False,'proofOrTypesAccepted':False,'automaticRetry':False,'protectedFreezeContinues':True}
gr=put(P/'ROOT-LANE-GRANT.json',grant);print(json.dumps({'grant':gr,'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True)
os.chdir(grant['cwd']);os.execve(argv[0],argv,dict(os.environ,**grant['environment']))
