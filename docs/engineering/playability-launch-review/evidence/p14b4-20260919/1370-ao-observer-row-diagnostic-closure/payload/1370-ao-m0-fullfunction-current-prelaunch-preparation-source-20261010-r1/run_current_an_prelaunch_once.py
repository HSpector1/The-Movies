import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-an-root-continuation-20261009-r1';Q=Path('/Users/zacheryspector/studio-scratch/1370-ao-m0-fullfunction-current-prelaunch-preparation-source-20261010-r1');P=Path('/Users/zacheryspector/studio-scratch/1370-ao-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r1');O=Path('/Users/zacheryspector/studio-scratch/1370-ao-m0-fullfunction-current-prelaunch-output-20261010-r1')
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr,review=check(sys.argv[1],sys.argv[2]);sp,pins=check(Q/'SOURCE-PINS.json',review['sourceManifest']['sha256'])
assert review['decision']=='ACCEPT_STATIC_CURRENT_AN_FULLFUNCTION_PRELAUNCH_SOURCE_ONLY' and review['concreteFindings']==[] and review['executionAuthorization'] is False and review['sourceManifest']==sp
for name,r in pins['files'].items():assert role(r['path'])==r
for name in ('current-an-root-prelaunch.py','PRELAUNCH-CONFIG-UNFILLED.json','run_current_an_prelaunch_once.py','read_current_an_prelaunch.py'):assert review['sourcePins'][name]==review['routeSourcePins'][name]==pins['files'][name]
ar,authority=check('/Users/zacheryspector/studio-scratch/1370-ao-root-continuation-20261010-r1/CURRENT-AN-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','753a7597c20032c70b2a07c9001de15ba1f72b5a0a5ac7706e340228da5fef5a');cr,controls=check('/Users/zacheryspector/studio-scratch/1370-ao-root-continuation-20261010-r1/OBSERVER-DIAGNOSTIC-CONTROLS-OBSERVED-ADOPTION.json','6de3da4778f3fa6a8901e44e473f33dd5eaea5ec174abdd54ddd1398f5f99d47')
assert authority['schema']=='1370-ao-root-current-an-fullpreflight-adoption/v1' and authority['status']=='ROOT_ADOPTED_CURRENT_AN_FULL_PREFLIGHT' and authority['protectedFreezeContinues'] is True and authority['executionAuthorization'] is False and authority['game'] is False
assert controls['schema']=='1370-root-observer-row-diagnostic-controls-observed-adoption/v1' and controls['status']=='ROOT_ADOPTED_ACTUAL_OBSERVER_ROW_DIAGNOSTIC_48_CONTROLS_ONLY' and controls['executionAuthorization'] is False
for value in authority.values():
 if type(value) is dict and set(value)=={'path','bytes','sha256'}:assert role(value['path'])==value
for value in controls.values():
 if type(value) is dict and set(value)=={'path','bytes','sha256'}:assert role(value['path'])==value
rbrole,rb=check('/Users/zacheryspector/studio-scratch/1370-ao-observer-row-diagnostic-pure-controls-parent-recorded-20261010-r1/READBACK.json','e82d8783ee95ee8dc7cdfdaee1979380c809d8d3eaa108eee8e994cb53d2fb64')
assert controls['readback']==rbrole and controls['actualOwnedIds']==rb['actualOwnedIds']==[82947,83213] and controls['actualExit']==0 and controls['soleLaneReleased'] is True
assert rb['toolExit']==0 and rb['laneReleased'] is True and rb['caseCount']==48 and rb['positiveCount']==6 and rb['specificNegativeCount']==42 and rb['allSpecificControlsPassed'] is True
assert rb['scopedOwnershipChecks']==[{'id':n,'kind':kind,'result':'ESRCH'} for n in rb['actualOwnedIds'] for kind in ('pid','pgid')]
ind=json.loads(Path(controls['independentObservedReview']['path']).read_bytes());assert ind['decision']=='ACCEPT_ACTUAL_PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_ONLY' and ind['concreteFindings']==[] and ind['executionAuthorization'] is False
typesrole,types=check(A/'M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json','be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83')
assert types['schema']=='1370-root-m0-external-config-types-observed-adoption/v1' and types['status']=='ROOT_ADOPTED_M0_EXTERNAL_CONFIG_TYPES_AND_COLLECTION_WITH_FULL_POSTFLIGHT' and types['typesAccepted'] is True and types['collectionAccepted'] is True and types['fullProtectedPostflightAccepted'] is True and types['originalR6StopPreserved'] is True and types['originalR1DiskStopPreserved'] is True and types['game'] is False and types['executionAuthorization'] is False
for key in ('independentObservedReview','result','readback','fullPostflightSnapshot','fullPostflightReadback','currentProtection','postR6RootAdoption'):assert role(types[key]['path'])==types[key]
typedReview=json.loads(Path(types['independentObservedReview']['path']).read_bytes());assert typedReview['decision']=='ACCEPT_OBSERVED_M0_EXTERNAL_CONFIG_TYPES_COLLECTION_WITH_FULL_POSTFLIGHT' and typedReview['concreteFindings']==[] and typedReview['executionAuthorization'] is False
assert typedReview['result']==types['result'] and typedReview['readback']==types['readback'] and typedReview['fullPostflightSnapshot']==types['fullPostflightSnapshot']
config=json.loads((Q/'PRELAUNCH-CONFIG-UNFILLED.json').read_bytes());assert all(config[k] is None for k in ('protectedSnapshot','ownedPgids','outputPath'))
config['protectedSnapshot']=authority['snapshot'];config['ownedPgids']=[14070,82947,83213];config['outputPath']=str(O)
assert config['currentFullPreflightAdoption']==ar and config['baseline']==authority['snapshot'] and config['guardConfig']==authority['config'] and config['guardSource']==authority['guardSource']
for key in ('baseline','copyAdmission','guardConfig','guardSource','materializerBinding','materializerSource','originalPrelaunchSource','originalReusePlan','protectedSnapshot'):assert role(config[key]['path'])==config[key]
assert not os.path.lexists(P) and not os.path.lexists(O) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
PY='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14';assert role(PY)['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);configRole=put(P/'CONFIG.json',config);argv=[PY,'-I','-B',str(Q/'current-an-root-prelaunch.py'),configRole['path'],configRole['sha256']]
grant={'schema':'1370-ao-current-an-root-prelaunch-grant/v2','status':'GRANTED_ONCE_CURRENT_AN_ROOT_PREFLIGHT','executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'mode':'fullfunction-current-an-protection','sourceReview':rr,'sourcePins':sp,'rootLauncher':role(__file__),'config':configRole,'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','ownedPid':os.getpid(),'ownedPgid':os.getpgrp(),'ownedSid':os.getsid(0),'directExecPreservesPid':True,'perCommandTimeoutSeconds':180,'overallTimeoutAdded':False,'originalFullObservationsReusedUnderContinuousFreeze':True,'actualFullInventoryRun':False,'rawPsFdLocalOnly':True,'ownedPgidsPassedToOriginalCurrent':config['ownedPgids'],'protectedFreezeContinues':True,'game':False,'automaticRetry':False,'currentFullPreflightAdoption':ar,'currentFullPreflightSnapshot':authority['snapshot'],'observerControlsAdoption':cr,'observerControlsReadback':rbrole,'historicalTypesObservedAdoption':typesrole,'historicalTypesFullPostflightSnapshot':types['fullPostflightSnapshot'],'historicalTypesRemainHistorical':True}
gr=put(P/'GRANT.json',grant);print(json.dumps({'grant':gr,'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True)
fo=os.open(P/'prelaunch.stdout',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(P/'prelaunch.stderr',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(grant['cwd']);os.execve(argv[0],argv,dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
