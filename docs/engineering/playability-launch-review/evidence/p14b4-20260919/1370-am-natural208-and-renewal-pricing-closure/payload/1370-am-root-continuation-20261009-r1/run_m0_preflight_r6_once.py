import datetime,hashlib,json,os,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';Q=S/'1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r4';PYTHON='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14'
def role(p):
 p=Path(p);assert p.resolve(strict=True)==p and not p.is_symlink();b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==4
mode,rpath,rsha=sys.argv[1:];assert mode=='types';rr=role(rpath);assert rr['sha256']==rsha;rv=json.loads(Path(rpath).read_bytes());assert rv['decision'].startswith('ACCEPT_') and rv['executionAuthorization'] is False
pr=role(Q/'SOURCE-PINS.json');assert pr['sha256']=='f27d8eae1416d94346dd43e495acad272bd203dfb1270c818e2ca949bdb35d15'
for r in json.loads((Q/'SOURCE-PINS.json').read_bytes())['files'].values():assert role(r['path'])==r
assert role(PYTHON)['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
config=json.loads((Q/'PRELAUNCH-CONFIG-UNFILLED.json').read_bytes());assert config['outputPath'] is None and config['ownedPgids'] is None
if mode=='types':
 adoption=json.loads((A/'M0-TYPES-STOP-OBSERVED-ADOPTION.json').read_bytes());assert adoption['status']=='ROOT_ADOPTED_OBSERVED_STOP_M0_TYPES_ROOT_TS5097_WITH_FULL_PROTECTED_POSTFLIGHT';config['protectedSnapshot']=adoption['fullPostflightSnapshot']
config['outputPath']=str(S/('1370-c0-m0-'+mode+'-prelaunch-output-after-al-20261009-r3'));config['ownedPgids']=[]
for name in ('baseline','copyAdmission','guardConfig','guardSource','materializerBinding','materializerSource','originalPrelaunchSource','originalReusePlan','protectedSnapshot'):assert role(config[name]['path'])==config[name]
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(config['outputPath'])
P=S/('1370-c0-m0-'+mode+'-prelaunch-parent-after-al-20261009-r3');assert not os.path.lexists(P)
cp=A/('M0-'+mode.upper()+'-PRELAUNCH-CONFIG-R6.json');cr=put(cp,config)
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);out=P/'prelaunch.stdout';err=P/'prelaunch.stderr';argv=[PYTHON,'-I','-B',str(Q/'original-current-root-prelaunch.py'),str(cp),cr['sha256']]
g={'schema':'1370-root-direct-m0-original-prelaunch-observation-grant/v1','status':'GRANTED_ONCE_ORIGINAL_CURRENT_ROOT_PREFLIGHT','executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'mode':mode,'sourceReview':rr,'sourcePins':pr,'rootLauncher':role(__file__),'config':cr,'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','ownedPid':os.getpid(),'ownedPgid':os.getpgrp(),'ownedSid':os.getsid(0),'directExecPreservesPid':True,'perCommandTimeoutSeconds':180,'originalFullObservationsReusedUnderContinuousFreeze':True,'actualFullInventoryRun':False,'noHelperOriginalLockAbsentRequired':True,'rawPsFdLocalOnly':True,'ownedPgidsPassedToOriginalCurrent':[],'ownedGroupAbsenceClaimInPreflight':False,'priorOwnershipAdmittedSeparately':True,'protectedFreezeContinues':True,'proofOrTypesAccepted':False,'game':False,'automaticRetry':False}
gr=put(P/'GRANT.json',g);print(json.dumps({'grant':gr,'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
