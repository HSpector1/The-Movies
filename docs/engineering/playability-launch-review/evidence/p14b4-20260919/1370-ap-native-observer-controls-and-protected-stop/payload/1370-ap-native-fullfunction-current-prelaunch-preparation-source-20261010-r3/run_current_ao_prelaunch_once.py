import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-an-root-continuation-20261009-r1';Q=Path('/Users/zacheryspector/studio-scratch/1370-ap-native-fullfunction-current-prelaunch-preparation-source-20261010-r3');P=Path('/Users/zacheryspector/studio-scratch/1370-ap-native-fullfunction-current-prelaunch-parent-recorded-20261010-r1');O=Path('/Users/zacheryspector/studio-scratch/1370-ap-native-fullfunction-current-prelaunch-output-20261010-r1')
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==5
rr,review=check(sys.argv[1],sys.argv[2]);sp,pins=check(Q/'SOURCE-PINS.json',review['sourceManifest']['sha256'])
assert review['decision']=='ACCEPT_STATIC_CURRENT_AO_FULLFUNCTION_PRELAUNCH_SOURCE_ONLY' and review['concreteFindings']==[] and review['executionAuthorization'] is False and review['sourceManifest']==sp
for name,r in pins['files'].items():assert role(r['path'])==r
for name in ('current-ao-root-prelaunch.py','PRELAUNCH-CONFIG-UNFILLED.json','run_current_ao_prelaunch_once.py','read_current_ao_prelaunch.py'):assert review['sourcePins'][name]==review['routeSourcePins'][name]==pins['files'][name]
ar,authority=check('/Users/zacheryspector/studio-scratch/1370-ap-root-continuation-20261010-r1/CURRENT-AO-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','e3804904e003a7178e98c3d6d83c52ff32194f1117cef780d24c3d1c88849552');cr,controls=check(sys.argv[3],sys.argv[4])
assert authority['schema']=='1370-ap-root-current-ao-fullpreflight-adoption/v1' and authority['status']=='ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT' and authority['protectedFreezeContinues'] is True and authority['executionAuthorization'] is False and authority['game'] is False
for value in authority.values():
 if type(value) is dict and set(value)=={'path','bytes','sha256'}:assert role(value['path'])==value
assert controls['schema']=='1370-root-native-observer-controls-observed-adoption/v1' and controls['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_OBSERVER_72_CONTROLS_ONLY' and controls['executionAuthorization'] is False
assert controls['actualExit']==0 and controls['soleLaneReleased'] is True and controls['caseCount']==72 and controls['positiveCount']==13 and controls['specificNegativeCount']==59
for flag in ('game','fullQualificationAccepted','fullBodyGameAssertionsExecuted','privateM0ReadOrWritten'):assert controls[flag] is False
for value in controls.values():
 if type(value) is dict and set(value)=={'path','bytes','sha256'}:assert role(value['path'])==value
rbrole=controls['readback'];rb=json.loads(Path(rbrole['path']).read_bytes())
assert rb['schema']=='1370-root-native-observer-controls-actual-readback/v1' and rb['status']=='ACTUAL_PURE_72_NATIVE_OBSERVER_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW'
assert rb['toolExit']==0 and rb['laneReleased'] is True and rb['caseCount']==72 and rb['positiveCount']==13 and rb['specificNegativeCount']==59
assert controls['actualOwnedIds']==rb['actualOwnedIds'] and type(rb['actualOwnedIds']) is list and rb['actualOwnedIds'] and all(type(n) is int and n>1 for n in rb['actualOwnedIds']) and rb['actualOwnedIds']==sorted(set(rb['actualOwnedIds']))
assert rb['scopedOwnershipChecks']==controls['scopedOwnershipChecks']==[{'id':n,'kind':kind,'result':'ESRCH'} for n in rb['actualOwnedIds'] for kind in ('pid','pgid')]
ind=json.loads(Path(controls['independentObservedReview']['path']).read_bytes());assert ind['schema']=='1370-native-observer-controls-independent-observed-review/v1' and ind['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY' and ind['concreteFindings']==[] and ind['executionAuthorization'] is False
assert ind['readback']==controls['readback']
worker=json.loads(Path(controls['workerResult']['path']).read_bytes());matrix=json.loads(Path(controls['inputRoles']['MATRIX.json']['path']).read_bytes())
assert role(controls['inputRoles']['MATRIX.json']['path'])==controls['inputRoles']['MATRIX.json']
assert worker['schema']=='1370-native-observer-independent-controls-result/v1' and worker['status']=='PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED'
assert worker['caseCount']==72 and worker['positiveCount']==13 and worker['specificNegativeCount']==59 and worker['originalOrderingCases']==18 and worker['originalParserCasesReplayed']==0
assert worker['results']==[dict(c,verdict='ACCEPT_POSITIVE' if c['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL') for c in matrix['cases']]
typesrole,types=check(A/'M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json','be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83')
assert types['schema']=='1370-root-m0-external-config-types-observed-adoption/v1' and types['status']=='ROOT_ADOPTED_M0_EXTERNAL_CONFIG_TYPES_AND_COLLECTION_WITH_FULL_POSTFLIGHT' and types['typesAccepted'] is True and types['collectionAccepted'] is True and types['fullProtectedPostflightAccepted'] is True and types['originalR6StopPreserved'] is True and types['originalR1DiskStopPreserved'] is True and types['game'] is False and types['executionAuthorization'] is False
for key in ('independentObservedReview','result','readback','fullPostflightSnapshot','fullPostflightReadback','currentProtection','postR6RootAdoption'):assert role(types[key]['path'])==types[key]
typedReview=json.loads(Path(types['independentObservedReview']['path']).read_bytes());assert typedReview['decision']=='ACCEPT_OBSERVED_M0_EXTERNAL_CONFIG_TYPES_COLLECTION_WITH_FULL_POSTFLIGHT' and typedReview['concreteFindings']==[] and typedReview['executionAuthorization'] is False
assert typedReview['result']==types['result'] and typedReview['readback']==types['readback'] and typedReview['fullPostflightSnapshot']==types['fullPostflightSnapshot']
config=json.loads((Q/'PRELAUNCH-CONFIG-UNFILLED.json').read_bytes());assert all(config[k] is None for k in ('protectedSnapshot','ownedPgids','outputPath'))
config['protectedSnapshot']=authority['snapshot'];config['ownedPgids']=sorted(set([18361]+rb['actualOwnedIds']));config['outputPath']=str(O)
assert config['currentFullPreflightAdoption']==ar and config['baseline']==authority['snapshot'] and config['guardConfig']==authority['config'] and config['guardSource']==authority['guardSource']
for key in ('baseline','copyAdmission','guardConfig','guardSource','materializerBinding','materializerSource','originalPrelaunchSource','originalReusePlan','protectedSnapshot'):assert role(config[key]['path'])==config[key]
assert not os.path.lexists(P) and not os.path.lexists(O) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
PY='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14';assert role(PY)['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);configRole=put(P/'CONFIG.json',config);argv=[PY,'-I','-B',str(Q/'current-ao-root-prelaunch.py'),configRole['path'],configRole['sha256']]
grant={'schema':'1370-ap-current-ao-root-prelaunch-grant/v2','status':'GRANTED_ONCE_CURRENT_AO_ROOT_PREFLIGHT','executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'mode':'fullfunction-current-ao-protection','sourceReview':rr,'sourcePins':sp,'rootLauncher':role(__file__),'config':configRole,'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','ownedPid':os.getpid(),'ownedPgid':os.getpgrp(),'ownedSid':os.getsid(0),'directExecPreservesPid':True,'perCommandTimeoutSeconds':180,'overallTimeoutAdded':False,'originalFullObservationsReusedUnderContinuousFreeze':True,'actualFullInventoryRun':False,'rawPsFdLocalOnly':True,'ownedPgidsPassedToOriginalCurrent':config['ownedPgids'],'protectedFreezeContinues':True,'game':False,'automaticRetry':False,'currentFullPreflightAdoption':ar,'currentFullPreflightSnapshot':authority['snapshot'],'observerControlsAdoption':cr,'observerControlsReadback':rbrole,'historicalTypesObservedAdoption':typesrole,'historicalTypesFullPostflightSnapshot':types['fullPostflightSnapshot'],'historicalTypesRemainHistorical':True}
gr=put(P/'GRANT.json',grant);print(json.dumps({'grant':gr,'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True)
fo=os.open(P/'prelaunch.stdout',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(P/'prelaunch.stderr',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(grant['cwd']);os.execve(argv[0],argv,dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
