"""Pure synthetic ordering controls. External root grant only; source work never executes."""
import datetime,hashlib,json,os,signal,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=Path(__file__).resolve().parent
Q=S/'1370-an-m0-fullbody-r3-ordering-consumer-controls-source-20261009-r2'
START=time.monotonic()
CAP=128*1024*1024

def require(ok,message):
 if not ok:raise RuntimeError('STOP_'+message)
def prep_timeout(signum,frame):raise RuntimeError('STOP_PREPARATION_60_SECONDS')
signal.signal(signal.SIGALRM,prep_timeout)
signal.setitimer(signal.ITIMER_REAL,60)
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
def main():
 require(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3,'EXACT_PYTHON_I_B_GRANT_ARGS')
 gp=Path(sys.argv[1]);require(gp.is_absolute() and gp.name=='GRANT.json' and gp.parent==S/'1370-an-m0-fullbody-r3-ordering-controls-parent-recorded-20261009-r1' and gp.parent.resolve(strict=True)==gp.parent,'ROOT_GRANT_LOCATION')
 gr=role(gp);require(gr['sha256']==sys.argv[2],'ROOT_GRANT_HASH');g=load(gp)
 require(g['schema']=='1370-root-r3-ordering-controls-once-grant/v1' and g['executionAuthorization'] is True and g['scope']=='PURE_SYNTHETIC_ORDERING_CONSUMER_18_CASES_ONLY' and g['oneAggregateRun'] is True and g['automaticRetry'] is False,'EXTERNAL_ROOT_ONCE_GRANT')
 ap=authenticate(g['parentAdapterSourcePins']);require(ap==P/'SOURCE-PINS.json','PARENT_PINS_PATH');pins=load(ap)
 require(pins['schema']=='1370-r3-ordering-controls-parent-source-pins/v1' and pins['executionAuthorization'] is False,'PARENT_PINS_PROTOCOL')
 for name,r in pins['files'].items():require(Path(r['path'])==P/name,'PARENT_FILE_PATH');authenticate(r)
 require(exact(pins['files']['launch-ordering-controls.py'],role(Path(__file__).resolve())),'PARENT_SELF')
 ar=load(authenticate(g['parentAdapterSourceReview']))
 require(ar['decision']=='ACCEPT_STATIC_R3_ORDERING_CONTROLS_PARENT_SOURCE_ONLY' and ar['executionAuthorization'] is False and ar['concreteFindings']==[] and exact(ar['sourcePins'],g['parentAdapterSourcePins']),'PARENT_REVIEW')
 contract=load(authenticate(pins['files']['CONTRACT.json']))
 sp=authenticate(g['sourcePins']);require(sp==Q/'SOURCE-PINS.json' and exact(g['sourcePins'],contract['sourcePins']),'CONTROLS_PINS')
 sourcepins=load(sp);require(sourcepins['schema']=='1370-r3-ordering-controls-source-pins/v1' and sourcepins['executionAuthorization'] is False,'CONTROLS_PINS_PROTOCOL')
 for name,r in sourcepins['files'].items():require(Path(r['path'])==Q/name,'CONTROLS_FILE_PATH');authenticate(r)
 require(exact(g['config'],contract['config']) and exact(g['recipe'],contract['recipe']) and exact(g['sourceReview'],contract['sourceReview']),'QUALIFIED_SOURCE_ROLES')
 require(exact(sourcepins['files']['CONFIG.json'],g['config']) and exact(sourcepins['files']['RECIPE.json'],g['recipe']),'MANIFEST_CONFIG_RECIPE')
 config=load(authenticate(g['config']));recipe=load(authenticate(g['recipe']));rv=load(authenticate(g['sourceReview']))
 require(rv['schema']=='1370-r3-ordering-consumer-controls-independent-source-review/v1' and rv['decision']=='ACCEPT_STATIC_R3_ORDERING_CONSUMER_CONTROLS_SOURCE_ONLY' and rv['executionAuthorization'] is False and rv['concreteFindings']==[] and exact(rv['sourceManifest'],g['sourcePins']),'CONTROLS_REVIEW')
 for name in ('CONFIG.json','run-ordering-controls.mjs','record-ordering-controls.py'):require(exact(rv['sourcePins'][name],sourcepins['files'][name]) and exact(rv['routeSourcePins'][name],sourcepins['files'][name]),'REVIEW_ROLE_ALIAS')
 require(config['syntheticOnly'] is True and config['actualFixtureQualification'] is False and config['candidateChanged'] is False and exact(g['bounds'],contract['bounds']) and exact(config['bounds'],contract['bounds']) and exact(recipe['bounds'],contract['bounds']),'PURE_SCOPE_BOUNDS')
 require(g['clockEnforcedByOriginalRecordedRoute'] is True and g['configSha256']==g['config']['sha256'] and g['outputPath']==config['outputPath']==contract['outputPath'],'RECORDED_ROUTE_BINDINGS')
 require(exact(g['acceptedSourcePins'],config['acceptedSourcePins']) and exact(g['heldRootAdoption'],config['heldRootAdoption']),'HELD_SOURCE_BINDINGS')
 adoption=load(authenticate(g['sourceAdoption']))
 require(adoption['schema']=='1370-root-r3-ordering-controls-source-adoption/v1' and adoption['status']=='ROOT_ADOPTED_PURE_ORDERING_CONTROLS_SOURCE_ONLY' and adoption['executionAuthorization'] is False and exact(adoption['sourcePins'],g['sourcePins']) and exact(adoption['sourceReview'],g['sourceReview']) and exact(adoption['parentAdapterSourcePins'],g['parentAdapterSourcePins']) and exact(adoption['parentAdapterSourceReview'],g['parentAdapterSourceReview']),'ROOT_SOURCE_ADOPTION')
 require(exact(g['runtimeToolsObservation'],contract['runtimeToolsObservation']),'PINNED_TOOLS_OBSERVATION')
 observation=load(authenticate(g['runtimeToolsObservation']));require(observation['schema']=='1370-root-current-m0-runtime-tools-observation/v1' and observation['privateM0MirrorRead'] is False,'GENUINE_TOOLS_OBSERVATION')
 for key in ('python','node'):
  row=observation['runtimeTools'][key];wanted=contract['tools'][key]
  require(row['physicalPath']==wanted['path'] and row['bytes']==wanted['bytes'] and row['sha256']==wanted['sha256'],'OBSERVED_'+key.upper());authenticate(wanted);require(os.access(wanted['path'],os.X_OK),'EXECUTABLE_'+key.upper())
 require(exact(g['runtimeTools'],{'node':contract['tools']['node'],'typescript':contract['tools']['typescript']}) and exact(config['typescriptCompiler'],contract['tools']['typescript']) and config['typescriptVersion']=='5.9.3','ACTUAL_NODE_COMPILER_BINDINGS')
 authenticate(contract['tools']['typescript']);authenticate(contract['tools']['helper'])
 require(Path(sys.executable).resolve(strict=True)==Path(contract['tools']['python']['path']),'ACTUAL_PHYSICAL_PYTHON')
 argv=['/bin/bash',contract['tools']['helper']['path'],'0',contract['laneLog'],contract['tools']['python']['path'],'-I','-B',str(Q/'record-ordering-controls.py'),'verification',str(gp),gr['sha256']]
 require(exact(g['argvTemplate'],argv[:-1]+['EXTERNAL_GRANT_SHA256']) and g['cwd']==contract['cwd'] and exact(g['environment'],contract['environment']) and g['laneLog']==contract['laneLog'],'EXACT_DIRECT_EXEC_INTERFACE')
 require('HOME' not in contract['environment'] and 'CODEX_HOME' not in contract['environment'],'HOME_INHERITED')
 require(S.resolve(strict=True)==S and gp.parent==Path(contract['parentPath']),'PHYSICAL_SCRATCH_PARENT')
 for p in (Path(contract['outputPath']),Path(contract['recorderOutputPath'])):require(p.parent==S and not os.path.lexists(p),'FRESH_DIRECT_OUTPUT')
 for p in (Path(contract['laneLog']),Path(contract['laneLog']+'.meta'),gp.parent/'LAUNCH-CLAIM.json'):require(not os.path.lexists(p),'FRESH_ONCE_ARTIFACT')
 require(not os.path.lexists(S/'HEAVY-LANE-LOCK'),'FREE_LANE')
 if os.getpgid(0)!=os.getpid():os.setsid()
 pid=os.getpid();pgid=os.getpgid(0);sid=os.getsid(0);require(pid>1 and pgid==pid and sid>1,'ACTUAL_OWN_HELPER_GROUP')
 claim={'schema':'1370-r3-ordering-controls-parent-launch-claim/v1','grant':gr,'argv':argv,'cwd':contract['cwd'],'environment':contract['environment'],'helperPid':pid,'helperPgid':pgid,'helperSid':sid,'actualOwnGroupConfirmed':True,'directExecPreservesOuterIdentity':True,'unexpectedHelperWaitIsStop':True,'sourcePins':g['sourcePins'],'sourceReview':g['sourceReview'],'parentAdapterSourcePins':g['parentAdapterSourcePins'],'parentAdapterSourceReview':g['parentAdapterSourceReview'],'runtimeToolsObservation':g['runtimeToolsObservation'],'sourceAdoption':g['sourceAdoption'],'preparationElapsedSeconds':time.monotonic()-START,'preparationDeadlineSeconds':60,'combinedPreparationRuntimeDeadline':None,'runtimeBounds':contract['bounds'],'runtimeClockOwnedByRecorder':True,'syntheticOnly':True,'game':False,'fixtureQualification':False,'meaningfulCatchMutantRed':False,'originalM0ReadOrWritten':False,'executionAuthorization':False}
 cr=write(gp.parent/'LAUNCH-CLAIM.json',claim);remaining();require(not os.path.lexists(S/'HEAVY-LANE-LOCK'),'FREE_LANE_IMMEDIATELY_BEFORE_EXEC')
 print(json.dumps({'launchClaim':cr,'helperPid':pid,'helperPgid':pgid,'helperSid':sid}),flush=True)
 os.chdir(contract['cwd'])
 signal.setitimer(signal.ITIMER_REAL,0)
 os.execvpe(argv[0],argv,dict(os.environ,**contract['environment']))
if __name__=='__main__':main()
