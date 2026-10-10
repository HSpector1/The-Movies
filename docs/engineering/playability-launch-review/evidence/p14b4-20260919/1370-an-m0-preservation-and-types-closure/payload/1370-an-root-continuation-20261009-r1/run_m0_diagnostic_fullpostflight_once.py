import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;D=S/'1370-an-m0-post-r6-preservation-diagnostic-parent-recorded-20261009-r2';G=S/'1370-an-current-operational-fullguard-source-20261009-r1';P=S/'1370-an-m0-preservation-diagnostic-fullpostflight-parent-recorded-20261009-r2'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rb=read(D/'READBACK.json');assert role(D/'READBACK.json')['sha256']=='7d6f24c7bedaf8ff18441de661312f77d86e8e258ca0da95fbe2e7c8c29a7626'
assert rb['status']=='ACTUAL_M0_PRESERVATION_DIAGNOSTIC_COMPLETE_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW' and rb['toolExit']==rb['helperExit']==rb['recorderExit']==rb['runnerExit']==0 and rb['laneReleased'] is True
rootgrant=read(D/'ROOT-LANE-GRANT.json');preRole=rootgrant['preflightObservedAdoption'];assert role(preRole['path'])==preRole;pre=read(preRole['path']);assert pre['status']=='ROOT_ADOPTED_CURRENT_AM_FULL_PREFLIGHT' and pre['protectedFreezeContinues'] is True
for key in ('snapshot','config','guardSource','sourcePins','sourceReview'):assert role(pre[key]['path'])==pre[key]
assert pre['sourcePins']['sha256']=='e638252b8082aa756f56471552327706a17dcf0e2d6bd01628710624ce7ec435'
for r in read(G/'SOURCE-PINS.json')['files'].values():assert role(r['path'])==r
config=read(G/'CONFIG.json');baseline=pre['snapshot'];ids=rb['recordedOwnedIds'];assert ids==sorted(set(ids)) and len(ids)==3
checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('Prior owned identity present')
label='postflight-m0-preservation-diagnostic-r2';output=G/'evidence'/label
assert not os.path.lexists(P) and not os.path.lexists(output) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
PY=config['requiredPythonPath'];assert role(PY)['sha256']==config['requiredPythonSha256']
argv=[PY,'-I','-B',str(G/'snapshot.py'),config['observedCopyReceipt']['path'],config['observedCopyReceipt']['sha256'],config['observedDecision'],str(S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'),'postflight',label,baseline['path'],baseline['sha256'],','.join(map(str,ids))]
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);out=P/'postflight.stdout';err=P/'postflight.stderr'
grant={'schema':'1370-root-m0-direct-original-shared-full-postflight-grant/v1','status':'GRANTED_ONCE_ORIGINAL_SHARED_FULL_POSTFLIGHT','mode':'post-r6-preservation-diagnostic','executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'rootLauncher':role(__file__),'guardSourceReview':pre['sourceReview'],'guardSourcePins':pre['sourcePins'],'actualRouteReadback':role(D/'READBACK.json'),'guardSource':pre['guardSource'],'guardConfig':pre['config'],'baseline':baseline,'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':{'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'ownedScannerPid':os.getpid(),'ownedScannerPgid':os.getpgrp(),'ownedScannerSid':os.getsid(0),'directExecPreservesPid':True,'actualPriorOwnedIds':ids,'priorOwnedIdentityPostChecks':checks,'outputDirectory':str(output),'stdoutPath':str(out),'stderrPath':str(err),'perCommandTimeoutSeconds':180,'wholeScanDeadline':None,'noHelperOriginalLockAbsentRequired':True,'rawPsFdLocalOnly':True,'protectedFreezeContinues':True,'scope':'Original shared nine-root/R9/dependency/full protected maps under current AM. Actual complete M0 source/dependency diagnostic stays a separately reviewed result. No root baseline adoption until actual independent observed admission.','proofOrTypesAccepted':False,'automaticRetry':False}
gr=put(P/'GRANT.json',grant);print(json.dumps({'grant':gr,'scannerPid':os.getpid(),'scannerPgid':os.getpgrp()}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(grant['cwd']);os.execve(argv[0],argv,dict(os.environ,**grant['environment']))
