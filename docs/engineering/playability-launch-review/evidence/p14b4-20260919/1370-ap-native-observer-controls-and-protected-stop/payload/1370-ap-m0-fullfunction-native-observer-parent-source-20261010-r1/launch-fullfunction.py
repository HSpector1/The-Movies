"""Root-owned once parent for qualified fullfunction route; source-only until granted."""
import datetime,hashlib,json,os,signal,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=Path(__file__).resolve().parent
START=time.monotonic()
CAP=128*1024*1024

def require(ok,message):
 if not ok:raise RuntimeError('STOP_'+message)

def prep_timeout(signum,frame):raise RuntimeError('STOP_PREPARATION_60_SECONDS')

def remaining():
 left=60-(time.monotonic()-START);require(left>0,'PREPARATION_60_SECONDS');return left

def metadata(st):return (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode,st.st_nlink)

def role(path):
 p=Path(path);require(p.is_absolute() and p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_SOURCE');before=p.lstat();require(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=CAP,'REGULAR_SOURCE_CAP')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(metadata(os.fstat(fd))==metadata(before),'SOURCE_OPEN_RACE');h=hashlib.sha256();size=0
  while True:
   remaining();block=os.read(fd,1024**2)
   if not block:break
   h.update(block);size+=len(block);require(size<=CAP,'SOURCE_CAP')
  require(metadata(os.fstat(fd))==metadata(before)==metadata(p.lstat()),'SOURCE_READ_RACE')
 finally:os.close(fd)
 return {'path':str(p),'bytes':size,'sha256':h.hexdigest()}

def authenticate(wanted):
 require(type(wanted) is dict and set(wanted)=={'path','bytes','sha256'} and type(wanted['path']) is str and type(wanted['bytes']) is int and wanted['bytes']>=0 and type(wanted['sha256']) is str and len(wanted['sha256'])==64 and all(c in '0123456789abcdef' for c in wanted['sha256']),'ROLE_SCHEMA')
 require(role(wanted['path'])==wanted,'ROLE_HASH');return Path(wanted['path'])

def pairs(rows):
 result={}
 for k,v in rows:require(k not in result,'DUPLICATE_JSON_KEY');result[k]=v
 return result

def load(path):
 wanted=role(path);require(wanted['bytes']<=1024*1024,'JSON_CAP');raw=Path(path).read_bytes();require(len(raw)==wanted['bytes'] and hashlib.sha256(raw).hexdigest()==wanted['sha256'],'JSON_READ_RACE');return json.loads(raw,object_pairs_hook=pairs,parse_constant=lambda x:(_ for _ in ()).throw(RuntimeError('STOP_JSON_CONSTANT')))

def exact(a,b):
 if type(a) is not type(b):return False
 if isinstance(a,dict):return set(a)==set(b) and all(exact(a[k],b[k]) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(exact(x,y) for x,y in zip(a,b))
 return a==b

def write(path,obj):
 raw=(json.dumps(obj,sort_keys=True,indent=2)+'\n').encode();fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
 return role(path)

signal.signal(signal.SIGALRM,prep_timeout)
signal.setitimer(signal.ITIMER_REAL,60)
def main():
 require(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==4 and sys.argv[1] in ('outer','inner'),'EXACT_PYTHON_ARGS')
 mode=sys.argv[1];br=role(Path(sys.argv[2]));require(br['sha256']==sys.argv[3],'ROOT_BINDING_HASH');b=load(br['path'])
 require(b['schema']=='1370-root-fullfunction-parent-binding/v1' and b['executionAuthorization'] is True and b['oneAggregateRun'] is True and b['automaticRetry'] is False,'ROOT_ONCE_AUTHORITY')
 pins=load(authenticate(b['parentSourcePins']));require(Path(b['parentSourcePins']['path'])==P/'SOURCE-PINS.json' and pins['schema']=='1370-fullfunction-parent-source-pins/v1' and pins['executionAuthorization'] is False,'PARENT_SOURCE')
 for name,r in pins['files'].items():require(Path(r['path'])==P/name,'PARENT_ROLE_PATH');authenticate(r)
 require(exact(pins['files']['launch-fullfunction.py'],role(Path(__file__).resolve())),'SELF_IDENTITY')
 pr=load(authenticate(b['parentSourceReview']));require(pr['decision']=='ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY' and pr['executionAuthorization'] is False and pr['concreteFindings']==[] and exact(pr['sourceManifest'],b['parentSourcePins']),'PARENT_REVIEW')
 sp=load(authenticate(b['sourcePins']));sr=load(authenticate(b['sourceReview']));source=Path(b['sourcePins']['path']).parent
 require(sp['schema']=='1370-fullfunction-qualification-source-pins/v1' and sp['executionAuthorization'] is False and source.parent==S,'ROUTE_SOURCE')
 require(Path(sp['files']['CONFIG.json']['path'])==source/'CONFIG.json','CONFIG_LOCAL_ROLE')
 parser_config=load(authenticate(sp['files']['CONFIG.json']))
 representation_roles={'m0TraceCodec.mjs': {'bytes': 7882, 'path': '/Users/zacheryspector/studio-scratch/1370-an-lossless-trace-codec-consumers-source-20261010-r3/m0TraceCodec.mjs', 'sha256': '5276c5dcf6502d21afd5f3bdc1669911ef4aebbbfe811c36e34689691eb64768'}, 'm0WiringProbe.ts': {'bytes': 1800, 'path': '/Users/zacheryspector/studio-scratch/1370-an-lossless-trace-codec-consumers-source-20261010-r3/m0WiringProbe.ts', 'sha256': 'c3da292f943a37ae5c3c30005dfec71eb485bf17a211ecfddaa03efe0460c5a9'}, 'traceSequences.mjs': {'bytes': 1286, 'path': '/Users/zacheryspector/studio-scratch/1370-an-lossless-trace-codec-consumers-source-20261010-r3/traceSequences.mjs', 'sha256': '0880717f82b4c18734dcdaaa10037a5ec8c7c32930fb14c58a54f1c1005ffede'}}
 diagnostic_roles={'m0NativeObserverRows.mjs': {'path': '/Users/zacheryspector/studio-scratch/1370-ap-native-observer-source-20261010-r5/m0NativeObserverRows.mjs', 'bytes': 10267, 'sha256': 'b280a92f2f59702e148999450fa67171bc6fdd5aff5f5b2a416f63a3e896b07a'}, 'm0FeasibilityWitness-native.ts': {'path': '/Users/zacheryspector/studio-scratch/1370-ap-native-observer-source-20261010-r5/m0FeasibilityWitness-native.ts', 'bytes': 5868, 'sha256': '53fb7391309f197447fcd029731be0e0b5fd53d0d454deb2be2f8c57c0b6d42b'}, 'm0ObserverRowDiagnostic.mjs': {'path': '/Users/zacheryspector/studio-scratch/1370-ap-native-observer-source-20261010-r5/m0ObserverRowDiagnostic.mjs', 'bytes': 10954, 'sha256': 'be7c1f330fe816e668c5e2fc6028f1cd2490297f23d3be09ac53d17ee9889397'}, 'ordering.ts': {'path': '/Users/zacheryspector/studio-scratch/1370-ap-native-observer-source-20261010-r5/ordering.ts', 'bytes': 12555, 'sha256': '21cefca182d43b3d52a27c0c0546f9e2c51535cdd46ad556fcf06a93057fd87b'}, 'talentMarket.ts': {'path': '/Users/zacheryspector/studio-scratch/1370-ap-native-observer-source-20261010-r5/talentMarket.ts', 'bytes': 120462, 'sha256': '584c460985f2f398e298e1e6b309d415dff038abed0254a420e40a9226d07eeb'}, 'typed-propagation-removed-talentMarket.ts': {'path': '/Users/zacheryspector/studio-scratch/1370-ap-native-observer-source-20261010-r5/typed-propagation-removed-talentMarket.ts', 'bytes': 120492, 'sha256': '2d558ac138c5d8f1b98c31650c4fa9b37cfb62bd3da8058a9b12b60d8177bc25'}, 'FULL-BODY-CONTROLS-TEMPLATE.ts': {'path': '/Users/zacheryspector/studio-scratch/1370-ap-native-observer-source-20261010-r5/FULL-BODY-CONTROLS-TEMPLATE.ts', 'bytes': 9756, 'sha256': '87bd0ec6917e178484013f337eefdeb19ce60384c60e25bfdbd9b3a83ced8777'}}
 require(exact(parser_config['representationInputs'],representation_roles) and exact(parser_config['nativeObserverInputs'],diagnostic_roles),'EXACT_FIXED_REPRESENTATION_AND_NATIVE_INPUTS')
 require(exact(parser_config['historicalPure49Template'],{'bytes': 9744, 'path': '/Users/zacheryspector/studio-scratch/1370-an-lossless-trace-codec-consumers-source-20261010-r3/FULL-BODY-CONTROLS-TEMPLATE.ts', 'sha256': '324c7cc754497e43cc5a9d46865f4cbf7e1a635b5e2ce5ac0857defab8661a02'}),'HISTORICAL_TEMPLATE_PROVENANCE')
 authenticate(parser_config['historicalPure49Template'])
 for name,r in sp['files'].items():
  if name in ('exact-json.mjs','run-parser-controls.mjs'):
   require(exact(r,parser_config['parserInputs'][name]) and Path(r['path'])==S/'1370-an-m0-fullfunction-qualification-source-20261010-r7'/name,'EXACT_TESTED_EXTERNAL_PARSER_ROLE')
  elif name in representation_roles:require(exact(r,representation_roles[name]),'EXACT_REVIEWED_EXTERNAL_REPRESENTATION_ROLE')
  elif name in diagnostic_roles:require(exact(r,diagnostic_roles[name]),'EXACT_REVIEWED_EXTERNAL_DIAGNOSTIC_ROLE')
  else:require(Path(r['path'])==source/name,'ROUTE_FILE_PATH')
  authenticate(r)
 require(sr['decision']=='ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY' and sr['executionAuthorization'] is False and sr['concreteFindings']==[] and exact(sr['sourceManifest'],b['sourcePins']),'ROUTE_REVIEW')
 for name in ('CONFIG.json', 'run-fullfunction.py', 'run-fullfunction.mjs', 'record-fullfunction.py', 'CORE-TEST-TEMPLATE.ts', 'CONFIG-TEMPLATE.mts', 'FULL-BODY-CONTROLS-TEMPLATE.ts', 'exact-json.mjs', 'run-parser-controls.mjs', 'canonical-typescript-transform.mjs', 'm0WiringProbe.ts', 'RESOLUTION-SOURCE-BINDING.json', 'm0TraceCodec.mjs', 'traceSequences.mjs', 'ordering.ts', 'talentMarket.ts', 'typed-propagation-removed-talentMarket.ts', 'm0ObserverRowDiagnostic.mjs', 'm0NativeObserverRows.mjs', 'm0FeasibilityWitness-native.ts'):require(exact(sr['sourcePins'][name],sp['files'][name]) and exact(sr['routeSourcePins'][name],sp['files'][name]),'ROUTE_REVIEW_ALIASES')
 c=load(authenticate(sp['files']['CONFIG.json']));require(c['operationalHead']=='f2f97c622db7f5332164b790d1646355e89c00f4' and c['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and c['executionAuthorization'] is False,'CURRENT_SOURCE_CONFIG')
 require(c['bounds']['aggregateChild']==300 and c['bounds']['activeRecorder']==320 and c['bounds']['wholeRecorder']==330 and c['bounds']['streamBytes']==8388608,'ORIGINAL_RUNTIME_CLOCKS_CAPS')
 t=load(authenticate(b['typesAdoption']));require(t['status']=='ROOT_ADOPTED_M0_EXTERNAL_CONFIG_TYPES_AND_COLLECTION_WITH_FULL_POSTFLIGHT' and t['typesAccepted'] is True and t['collectionAccepted'] is True and t['fullProtectedPostflightAccepted'] is True and t['soleLaneReleased'] is True and t['executionAuthorization'] is False,'ACTUAL_TYPES_ADMISSION')
 require(t['productionHead']==c['historicalTypesHead']=='7087f116cf998fd86e33fb8e004df628e0686dbd' and t['productionSourceTree']==c['productionSourceTree'] and exact(b['typesAdoption'],c['historicalTypesAdoption']),'HISTORICAL_TYPES_WITH_UNCHANGED_SOURCE')
 protection=load(authenticate(b['currentProtection']));require(exact(b['currentProtection'],c['currentProtection']) and protection['schema']=='1370-root-fullfunction-current-protection/v3' and protection['status']=='ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE' and protection['executionAuthorization'] is False and protection['game'] is False and protection['protectedFreezeContinues'] is True and exact(protection['historicalTypesAdoption'],b['typesAdoption']) and protection['historicalTypesHead']==t['productionHead']==c['historicalTypesHead'] and protection['productionHead']==c['operationalHead'] and protection['productionSourceTree']==c['productionSourceTree'],'CURRENT_AN_PREFLIGHT_PROTECTION_WITH_HISTORICAL_TYPES')
 for name in ('actualPreflight','actualPreflightReadback','independentPreflightReview','currentAOFullPreflightAdoption','currentAOFullPreflightSnapshot','historicalTypesAdoption','currentOperationalTransition','reviewedPriorStopAdoption','nativeControlsObservedAdoption'):authenticate(protection[name])
 require(exact(protection['currentAOFullPreflightAdoption'],c['actualCurrentAOFullPreflightAdoption']) and exact(protection['currentOperationalTransition'],c['actualCurrentOperationalTransition']) and exact(protection['reviewedPriorStopAdoption'],c['reviewedPriorStopAdoption']),'CURRENT_AN_AUTHORITY_CHAIN')
 baseline=load(protection['currentAOFullPreflightAdoption']['path']);require(baseline['status']=='ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT' and baseline['protectedFreezeContinues'] is True and baseline['executionAuthorization'] is False and exact(baseline['snapshot'],protection['currentAOFullPreflightSnapshot']),'GENUINE_CURRENT_AN_BASELINE')
 preflight=load(protection['actualPreflightReadback']['path']);require(preflight['schema']=='1370-ap-current-ao-root-prelaunch-readback/v2' and preflight['toolExit']==0 and preflight['scannerAbsent'] is True and exact(preflight['preflight'],protection['actualPreflight']) and exact(preflight['originalFullSnapshot'],protection['currentAOFullPreflightSnapshot']) and exact(preflight['currentFullPreflightAdoption'],protection['currentAOFullPreflightAdoption']) and preflight['baselinePhase']=='before-fill' and preflight['historicalTypesRemainHistorical'] is True,'ACTUAL_CURRENT_AN_SHORT_PREFLIGHT')
 parser=load(authenticate(b['parserControlsAdoption']));require(parser['status']=='ROOT_ADOPTED_ACTUAL_EXACT_IDENTITY_JSON_CONTROLS_ONLY' and parser['executionAuthorization'] is False and type(parser['actualExit']) is int and parser['actualExit']==0 and exact(parser['parserSource'],sp['files']['exact-json.mjs']) and exact(parser['controlsSource'],sp['files']['run-parser-controls.mjs']),'ACTUAL_PARSER_CONTROLS')
 lossless=load(authenticate(b['losslessControlsObservedAdoption']));require(lossless['executionAuthorization'] is False,'EXTERNAL_LOSSLESS_CONTROLS_OBSERVED_ROLE')
 diagnostic=load(authenticate(b['nativeObserverControlsObservedAdoption']));require(exact(b['nativeObserverControlsObservedAdoption'],c['actualNativeObserverControlsObservedAdoption']) and exact(protection['nativeControlsObservedAdoption'],b['nativeObserverControlsObservedAdoption']) and diagnostic['schema']=='1370-root-native-observer-controls-observed-adoption/v1' and diagnostic['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_OBSERVER_72_CONTROLS_ONLY' and diagnostic['executionAuthorization'] is False and type(diagnostic['actualExit']) is int and diagnostic['actualExit']==0 and diagnostic['caseCount']==72 and diagnostic['positiveCount']==13 and diagnostic['specificNegativeCount']==59 and diagnostic['soleLaneReleased'] is True and diagnostic['game'] is False and diagnostic['fullBodyGameAssertionsExecuted'] is False,'ACTUAL_NATIVE_OBSERVER_CONTROLS')
 for name in ('independentObservedReview','readback','result','workerResult','recorderResult','actualTool'):authenticate(diagnostic[name])
 observed=load(diagnostic['independentObservedReview']['path']);require(observed['schema']=='1370-native-observer-controls-independent-observed-review/v1' and observed['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY' and observed['concreteFindings']==[] and observed['executionAuthorization'] is False,'NATIVE_OBSERVED_REVIEW')
 for name,r in c['nativeObserverAuthorities'].items():authenticate(r);require(exact(diagnostic[name],r),'NATIVE_SOURCE_AUTHORITY')
 require(exact(diagnostic['sourceReviewedFullBodyTemplate'],diagnostic_roles['FULL-BODY-CONTROLS-TEMPLATE.ts']) and exact(diagnostic['inputRoles']['m0ObserverRowDiagnostic.mjs'],diagnostic_roles['m0ObserverRowDiagnostic.mjs']) and exact(diagnostic['inputRoles']['m0FeasibilityWitness-native.ts'],diagnostic_roles['m0FeasibilityWitness-native.ts']),'TESTED_NATIVE_HELPER_AND_REVIEWED_TEMPLATE')
 earlier=load(authenticate(c['historicalAMToANTransition']));current=load(authenticate(c['actualCurrentOperationalTransition']));require(earlier['actualHead']==current['predecessorHead'] and earlier['predecessorHead']==c['historicalTypesHead'] and current['actualHead']==c['operationalHead'] and earlier['productionSourceTree']==current['productionSourceTree']==c['productionSourceTree'],'AM_AN_AO_CONTINUITY')
 artifact=load(authenticate(b['artifactBoundAdoption']));require(artifact['status']=='ROOT_AUTHORIZED_FULL_STATE_FIXTURE_ARTIFACT_BYTE_BOUND' and type(artifact['bytes']) is int and artifact['bytes']==c['bounds']['fixturePacketBytes']==67108864 and artifact['serializedPacketFiles']==1 and artifact['fullStateSerializationsInPacket']==10 and artifact['operationalStopBoundNotFitPrediction'] is True,'ARTIFACT_BOUND')
 rt=b['runtimeTools'];require(set(rt)=={'python','node','vitestEntry','vitestPackage'},'RUNTIME_TOOL_ROLES')
 for r in rt.values():authenticate(r)
 require(Path(sys.executable).resolve(strict=True)==Path(rt['python']['path']) and rt['python']['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835' and rt['node']['sha256']=='0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6','PHYSICAL_PYTHON_NODE')
 require(load(rt['vitestPackage']['path'])['version']=='2.1.9' and os.access(rt['node']['path'],os.X_OK),'RUNTIME_VERSIONS')
 helper=authenticate(b['helper']);require(b['helper']['sha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e','ORIGINAL_R8_HELPER')
 out=Path(b['parentPath']);require(out==S/'1370-ap-m0-fullfunction-native-observer-parent-recorded-20261010-r1' and Path(c['laneLog']).parent==S and Path(c['outputPath']).parent==S and Path(c['recorderOutputPath']).parent==S,'OWNED_OUTPUT_SCOPE')
 for p in (Path(c['outputPath']),Path(c['recorderOutputPath'])):require(not os.path.lexists(p),'FRESH_RUNTIME_OUTPUT')
 require(b['cwd']==str(R) and b['environment']=={'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'ORIGINAL_ENVIRONMENT')
 if os.getpgid(0)!=os.getpid():os.setsid()
 own={'pid':os.getpid(),'pgid':os.getpgid(0),'sid':os.getsid(0)};require(own['pid']==own['pgid']==own['sid'],'ACTUAL_OWN_GROUP')
 if mode=='outer':
  for p in (out,S/'HEAVY-LANE-LOCK',Path(c['laneLog']),Path(c['laneLog']+'.meta')):require(not os.path.lexists(p),'FRESH_FREE_LANE')
  out.mkdir(mode=0o700)
  argv=['/bin/bash',str(helper),'0',c['laneLog'],rt['python']['path'],'-I','-B',str(P/'launch-fullfunction.py'),'inner',br['path'],br['sha256']]
  claim={'schema':'1370-fullfunction-root-helper-launch-claim/v1','rootBinding':br,'argv':argv,'cwd':str(R),'environment':b['environment'],'ownedHelper':own,'directExecPreservesIdentity':True,'unexpectedHelperWaitIsStop':True,'preparationElapsedSeconds':time.monotonic()-START,'preparationDeadlineSeconds':60,'combinedPreparationRuntimeDeadline':None,'runtimeBounds':c['bounds'],'executionAuthorization':False,'gameExecutedByPreparation':False}
  cr=write(out/'ROOT-LAUNCH-CLAIM.json',claim);require(not os.path.lexists(S/'HEAVY-LANE-LOCK'),'FREE_LANE_BEFORE_EXEC')
 else:
  require(out.resolve(strict=True)==out,'EXISTING_ROOT_PARENT');claim=load(out/'ROOT-LAUNCH-CLAIM.json');require(exact(claim['rootBinding'],br) and claim['directExecPreservesIdentity'] is True,'ACTUAL_ROOT_CLAIM')
  lock=role(S/'HEAVY-LANE-LOCK');require(lock['bytes']<=10000 and Path(lock['path']).read_text().startswith('lane-run '+c['laneLog']+' token='),'ACTUAL_OWN_LANE_LOCK')
  grant={'schema':'1370-root-fullfunction-qualification-once-grant/v1','scope':'REAL_FULL_FUNCTION_BOUNDARIES_BASELINE_AND_TYPED_CATCH_MUTANT_ONLY','executionAuthorization':True,'oneAggregateRun':True,'automaticRetry':False,'clockEnforcedByOriginalRecordedRoute':True,'sourcePins':b['sourcePins'],'sourceReview':b['sourceReview'],'config':sp['files']['CONFIG.json'],'configSha256':sp['files']['CONFIG.json']['sha256'],'bounds':c['bounds'],'typesAdoption':b['typesAdoption'],'artifactBoundAdoption':b['artifactBoundAdoption'],'currentProtection':b['currentProtection'],'parserControlsAdoption':b['parserControlsAdoption'],'losslessControlsObservedAdoption':b['losslessControlsObservedAdoption'],'nativeObserverControlsObservedAdoption':b['nativeObserverControlsObservedAdoption'],'runtimeTools':rt,'laneLock':lock,'rootBinding':br,'rootLaunchClaim':role(out/'ROOT-LAUNCH-CLAIM.json')}
  gr=write(out/'EXECUTION-GRANT.json',grant);argv=[rt['python']['path'],'-I','-B',str(source/'record-fullfunction.py'),'verification',gr['path'],gr['sha256']]
  cr=write(out/'RECORDER-LAUNCH-CLAIM.json',{'schema':'1370-fullfunction-recorder-launch-claim/v1','grant':gr,'argv':argv,'ownedRecorder':own,'directExecPreservesIdentity':True,'rootBinding':br,'preparationElapsedSeconds':time.monotonic()-START,'preparationDeadlineSeconds':60,'combinedPreparationRuntimeDeadline':None,'runtimeBounds':c['bounds'],'executionAuthorization':False,'gameExecutedByPreparation':False})
 remaining();print(json.dumps({'launchClaim':cr,'mode':mode,'actualOwned':own}),flush=True)
 os.chdir(R);signal.setitimer(signal.ITIMER_REAL,0);os.execvpe(argv[0],argv,dict(os.environ,**b['environment']))
if __name__=='__main__':main()
