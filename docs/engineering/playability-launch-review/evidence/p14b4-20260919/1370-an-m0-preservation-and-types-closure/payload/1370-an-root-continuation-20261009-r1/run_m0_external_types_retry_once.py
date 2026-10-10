import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-m0-types-external-config-parent-adapter-source-20261009-r3'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==5
pr,pins=check(Q/'SOURCE-PINS.json','257e049bb9c2aba5aca3c96b83dccfd376c18cedd524328fb151e4cfc0091603')
for r in pins['files'].values():assert role(r['path'])==r
rr,rv=check(sys.argv[1],sys.argv[2])
assert rv['decision']=='ACCEPT_STATIC_M0_TYPES_EXTERNAL_CONFIG_PARENT_ADAPTER_SOURCE_ONLY' and rv['concreteFindings']==[] and rv['executionAuthorization'] is False
for name,r in rv['sourcePins'].items():assert rv['routeSourcePins'][name]==pins['files'][name]==r
profile=json.loads((Q/'PROFILES.json').read_bytes())['types']
assert profile['sourcePins']['sha256']=='4a6a87c20feffe96e08807b605019e8d6caeb896d0a4eb6069f55e8e98cc934f' and role(profile['sourcePins']['path'])==profile['sourcePins']
for r in json.loads(Path(profile['sourcePins']['path']).read_bytes())['files'].values():assert role(r['path'])==r
sr,sv=check(sys.argv[3],sys.argv[4])
assert sv['decision']==profile['sourceReviewDecision'] and sv['concreteFindings']==[] and sv['executionAuthorization'] is False
for name,r in dict(profile['executableRoles'],**{'CONFIG.json':profile['config']}).items():assert role(r['path'])==r==sv['sourcePins'][name]==sv['routeSourcePins'][name]
prepath=A/'M0-TYPES-RETRY-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json';pre=json.loads(prepath.read_bytes());assert pre['status']=='ROOT_ADOPTED_ORIGINAL_CURRENT_ROOT_PREFLIGHT' and pre['mode']=='types' and pre['toolExit']==0 and pre['scannerAbsent'] is True and pre['protectedFreezeContinues'] is True
for key in ('actualTool','grant','sourceReview','preflight','originalFullSnapshot','baseline','rawLocalOnlyClassification'):assert role(pre[key]['path'])==pre[key]
assert role(prepath)['sha256']=='b32e06dad9a1da9df311dd85c7372fb22c7b8a717f4ac488ed79867da5a1f256'
stoprole,stop=check(A/'M0-EXTERNAL-CONFIG-R1-DISK-STOP-OBSERVED-ADOPTION.json','5d1976a6e498101a028cd3b2e371b1cb1bef2986c3446df15c5670a649972612');assert stop['originalAttemptRemainsStop'] is True and stop['fullProtectedSharedPostflightAccepted'] is True and stop['soleLaneReleased'] is True
ar,ad=check(A/'M0-POST-R6-PRESERVATION-DIAGNOSTIC-OBSERVED-ADOPTION.json','5b5e062b8c5ac12bc70aa5ccb46ad101340ad692cdf0147ea44890882c0f44e1')
protrole,prot=check(A/'M0-CURRENT-EXTERNAL-CONFIG-TYPES-PROTECTION.json','5980e69d3e2962f068f10fa3217caa45f3ff752cc93a5064eb0637f54a2439d0')
assert pre['postR6RootAdoption']==ar and pre['currentProtection']==protrole and prot['postR6RootAdoptionSha256']==ar['sha256'] and prot['fullProtectedPostflightAccepted'] is True and prot['soleLaneReleased'] is True and ad['currentRootBaselineQualified'] is True and ad['historicalRootUnchanged'] is False and ad['originalR6StopPreserved'] is True and ad['typesAccepted'] is False and ad['collectionAccepted'] is False
toolsrole,runtime=check(A/'M0-RUNTIME-TOOLS.json','a681efc4a9b29dfc62bffb6c1e7cd434107bfb1064769f712fca48227bd64106')
spec=json.loads((Q/'TYPES-SPEC-UNFILLED.json').read_bytes());assert spec['executionAuthorization'] is False and all(spec[k] is None for k in ('sourceReview','runtimeTools','currentProtection','postR6RootAdoption'))
spec.update(executionAuthorization=True,sourceReview=sr,runtimeTools=runtime['runtimeTools'],currentProtection=protrole,postR6RootAdoption=ar,additionalRefs=prot['additionalRefs'])
P=Path(profile['parentPath'])
for path in (P,profile['laneLog'],profile['laneLog']+'.meta',profile['resultRoot'],Path(profile['recorderResult']).parent,S/'HEAVY-LANE-LOCK'):assert not os.path.lexists(path)
helper=S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh';assert role(helper)['sha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e'
PY='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14';assert role(PY)['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);specrole=put(P/'FILLED-SPEC.json',spec)
sourcead=put(A/'M0-EXTERNAL-CONFIG-TYPES-SOURCE-ADOPTION-R3.json',{'schema':'1370-root-external-config-m0-types-source-adoption/v1','status':'ROOT_ADOPTED_EXTERNAL_CONFIG_M0_TYPES_SOURCE_ONLY','executorSourcePins':profile['sourcePins'],'executorSourceReview':sr,'parentSourcePins':pr,'parentSourceReview':rr,'postR6RootAdoption':ar,'currentProtection':protrole,'executionAuthorization':False,'typesAccepted':False,'collectionAccepted':False,'game':False,'historicalRootUnchanged':False,'originalR6StopPreserved':True})
argv=['/bin/bash',str(helper),'0',profile['laneLog'],PY,'-I','-B',str(Q/'fill-grant-exec.py'),specrole['path'],specrole['sha256']]
g={'schema':'1370-root-m0-once-recorded-lane-grant/v1','status':'GRANTED_ONCE_EXACT_M0_TYPES_EXTERNAL_CONFIG_RETRY_R3','executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':'types','sourceReview':sr,'parentFillAndPrelaunchSourceReview':rr,'parentSourcePins':pr,'sourcePins':profile['sourcePins'],'sourceAdoption':sourcead,'preflightObservedAdoption':role(prepath),'runtimeToolsObservation':toolsrole,'filledSpec':specrole,'postR6RootAdoption':ar,'currentProtection':protrole,'rootLauncher':role(__file__),'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':{'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'ownedOuterHelperPid':os.getpid(),'ownedOuterHelperPgid':os.getpgrp(),'ownedOuterHelperSid':os.getsid(0),'directExecPreservesOuterHelperIdentity':True,'preparationSeconds':60,'runtimeBoundsSeconds':{'runner':300,'active':320,'whole':330},'runtimeClockStartsInsideUnchangedLAUNCH':True,'combinedFillRuntime330Claim':False,'originalChildCommandStreamCapsBytes':8388608,'helperCapture':'Original r8 combined log; no added live parent byte limiter','actualOutcome':None,'previousAttemptStopAdoption':stoprole,'expectedBaselineNotPreviousAttemptAfterProof':True,'game':False,'proofOrTypesAccepted':False,'automaticRetry':False,'protectedFreezeContinues':True}
gr=put(P/'ROOT-LANE-GRANT.json',g);print(json.dumps({'grant':gr,'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True);os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,**g['environment']))
