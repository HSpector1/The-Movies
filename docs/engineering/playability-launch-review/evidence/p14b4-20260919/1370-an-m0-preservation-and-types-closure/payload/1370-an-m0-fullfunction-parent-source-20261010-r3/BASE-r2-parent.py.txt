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
 for name,r in sp['files'].items():
  if name in ('exact-json.mjs','run-parser-controls.mjs'):
   require(exact(r,parser_config['parserInputs'][name]) and Path(r['path'])==S/'1370-an-m0-fullfunction-qualification-source-20261010-r7'/name,'EXACT_TESTED_EXTERNAL_PARSER_ROLE')
  else:require(Path(r['path'])==source/name,'ROUTE_FILE_PATH')
  authenticate(r)
 require(sr['decision']=='ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY' and sr['executionAuthorization'] is False and sr['concreteFindings']==[] and exact(sr['sourceManifest'],b['sourcePins']),'ROUTE_REVIEW')
 for name in ('CONFIG.json','run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py','CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs'):require(exact(sr['sourcePins'][name],sp['files'][name]) and exact(sr['routeSourcePins'][name],sp['files'][name]),'ROUTE_REVIEW_ALIASES')
 c=load(authenticate(sp['files']['CONFIG.json']));require(c['operationalHead']=='7087f116cf998fd86e33fb8e004df628e0686dbd' and c['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and c['executionAuthorization'] is False,'CURRENT_SOURCE_CONFIG')
 require(c['bounds']['aggregateChild']==300 and c['bounds']['activeRecorder']==320 and c['bounds']['wholeRecorder']==330 and c['bounds']['streamBytes']==8388608,'ORIGINAL_RUNTIME_CLOCKS_CAPS')
 t=load(authenticate(b['typesAdoption']));require(t['status']=='ROOT_ADOPTED_M0_EXTERNAL_CONFIG_TYPES_AND_COLLECTION_WITH_FULL_POSTFLIGHT' and t['typesAccepted'] is True and t['collectionAccepted'] is True and t['fullProtectedPostflightAccepted'] is True and t['soleLaneReleased'] is True and t['executionAuthorization'] is False,'ACTUAL_TYPES_ADMISSION')
 require(t['productionHead']==c['operationalHead'] and t['productionSourceTree']==c['productionSourceTree'],'CURRENT_TYPES')
 protection=load(authenticate(b['currentProtection']));require(protection['schema']=='1370-root-fullfunction-current-protection/v1' and protection['status']=='ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE' and protection['executionAuthorization'] is False and protection['protectedFreezeContinues'] is True and exact(protection['typesAdoption'],b['typesAdoption']) and exact(protection['fullPostflightSnapshot'],t['fullPostflightSnapshot']) and protection['productionHead']==c['operationalHead'] and protection['productionSourceTree']==c['productionSourceTree'],'CURRENT_PREFLIGHT_PROTECTION')
 for name in ('actualPreflight','independentPreflightReview'):authenticate(protection[name])
 parser=load(authenticate(b['parserControlsAdoption']));require(parser['status']=='ROOT_ADOPTED_ACTUAL_EXACT_IDENTITY_JSON_CONTROLS_ONLY' and parser['executionAuthorization'] is False and type(parser['actualExit']) is int and parser['actualExit']==0 and exact(parser['parserSource'],sp['files']['exact-json.mjs']) and exact(parser['controlsSource'],sp['files']['run-parser-controls.mjs']),'ACTUAL_PARSER_CONTROLS')
 artifact=load(authenticate(b['artifactBoundAdoption']));require(artifact['status']=='ROOT_AUTHORIZED_FULL_STATE_FIXTURE_ARTIFACT_BYTE_BOUND' and type(artifact['bytes']) is int and artifact['bytes']==c['bounds']['fixturePacketBytes']==67108864 and artifact['serializedPacketFiles']==1 and artifact['fullStateSerializationsInPacket']==10 and artifact['operationalStopBoundNotFitPrediction'] is True,'ARTIFACT_BOUND')
 rt=b['runtimeTools'];require(set(rt)=={'python','node','vitestEntry','vitestPackage'},'RUNTIME_TOOL_ROLES')
 for r in rt.values():authenticate(r)
 require(Path(sys.executable).resolve(strict=True)==Path(rt['python']['path']) and rt['python']['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835' and rt['node']['sha256']=='0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6','PHYSICAL_PYTHON_NODE')
 require(load(rt['vitestPackage']['path'])['version']=='2.1.9' and os.access(rt['node']['path'],os.X_OK),'RUNTIME_VERSIONS')
 helper=authenticate(b['helper']);require(b['helper']['sha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e','ORIGINAL_R8_HELPER')
 out=Path(b['parentPath']);require(out==S/'1370-an-m0-fullfunction-parent-recorded-20261010-r2' and Path(c['laneLog']).parent==S and Path(c['outputPath']).parent==S and Path(c['recorderOutputPath']).parent==S,'OWNED_OUTPUT_SCOPE')
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
  grant={'schema':'1370-root-fullfunction-qualification-once-grant/v1','scope':'REAL_FULL_FUNCTION_BOUNDARIES_BASELINE_AND_TYPED_CATCH_MUTANT_ONLY','executionAuthorization':True,'oneAggregateRun':True,'automaticRetry':False,'clockEnforcedByOriginalRecordedRoute':True,'sourcePins':b['sourcePins'],'sourceReview':b['sourceReview'],'config':sp['files']['CONFIG.json'],'configSha256':sp['files']['CONFIG.json']['sha256'],'bounds':c['bounds'],'typesAdoption':b['typesAdoption'],'artifactBoundAdoption':b['artifactBoundAdoption'],'currentProtection':b['currentProtection'],'parserControlsAdoption':b['parserControlsAdoption'],'runtimeTools':rt,'laneLock':lock,'rootBinding':br,'rootLaunchClaim':role(out/'ROOT-LAUNCH-CLAIM.json')}
  gr=write(out/'EXECUTION-GRANT.json',grant);argv=[rt['python']['path'],'-I','-B',str(source/'record-fullfunction.py'),'verification',gr['path'],gr['sha256']]
  cr=write(out/'RECORDER-LAUNCH-CLAIM.json',{'schema':'1370-fullfunction-recorder-launch-claim/v1','grant':gr,'argv':argv,'ownedRecorder':own,'directExecPreservesIdentity':True,'rootBinding':br,'preparationElapsedSeconds':time.monotonic()-START,'preparationDeadlineSeconds':60,'combinedPreparationRuntimeDeadline':None,'runtimeBounds':c['bounds'],'executionAuthorization':False,'gameExecutedByPreparation':False})
 remaining();print(json.dumps({'launchClaim':cr,'mode':mode,'actualOwned':own}),flush=True)
 os.chdir(R);signal.setitimer(signal.ITIMER_REAL,0);os.execvpe(argv[0],argv,dict(os.environ,**b['environment']))
if __name__=='__main__':main()
