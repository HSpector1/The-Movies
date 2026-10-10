import hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');HERE=Path(__file__).resolve().parent
P=S/'1370-aq-original-shared-postflight-diagnostic-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();after=p.lstat();assert (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)==(after.st_dev,after.st_ino,after.st_mode,after.st_nlink,after.st_size,after.st_mtime_ns,after.st_ctime_ns);return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def load(r):
 assert role(r['path'])==r;return json.loads(Path(r['path']).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
reviewRole=role(sys.argv[1]);assert reviewRole['sha256']==sys.argv[2];review=load(reviewRole);sp=role(HERE/'SOURCE-PINS.json');pins=load(sp)
assert review['schema']=='1370-original-shared-postflight-diagnostic-independent-source-review/v1' and review['decision']=='ACCEPT_STATIC_ORIGINAL_SHARED_POSTFLIGHT_EXCEPTION_DIAGNOSTIC_SOURCE_ONLY' and review['sourceManifest']==sp and review['concreteFindings']==[] and review['executionAuthorization'] is False
for n,r in pins['files'].items():assert role(r['path'])==r
for n in ('diagnose_shared_post.py','launch_shared_post_diagnostic.py','read_shared_post_diagnostic.py'):assert review['sourcePins'][n]==review['routeSourcePins'][n]==pins['files'][n]
ar=role(S/'1370-aq-root-continuation-20261010-r1/SHARED-POSTFLIGHT-FAILURE-OBSERVED-ADOPTION.json');assert ar['sha256']=='1de73d51dd02efad1f9d09202de35a90a7c8aaa76b683275a8179d4333052f88';a=load(ar)
assert a['schema']=='1370-root-shared-postflight-failure-observed-adoption/v1' and a['status']=='ROOT_ADOPTED_ACTUAL_SHARED_POSTFLIGHT_IMMUTABLE_STOP_EVIDENCE_ONLY' and a['executionAuthorization'] is False and a['fullProtectedPostflightAccepted'] is False and a['laneReleased'] is True
for k in ('failureReadback','independentObservedReview','grant','guardSource','guardConfig','baseline'):assert role(a[k]['path'])==a[k]
rb=load(a['failureReadback']);old=load(a['grant']);config=load(a['guardConfig']);ids=rb['actualOwnedGroupIds'];pids=rb['actualOwnedPids']
checks=[]
for ns,fn,kind in ((pids,os.kill,'pid'),(ids,os.killpg,'pgid')):
 assert ns==sorted(set(ns)) and all(type(n) is int and n>1 for n in ns)
 for n in ns:
  try:fn(n,0)
  except ProcessLookupError:checks.append(dict(kind=kind,id=n,result='ESRCH'))
  else:raise RuntimeError('OWNED_ID_PRESENT')
argv=list(old['argv']);assert argv[3]==a['guardSource']['path'] and argv[8]=='postflight' and argv[10:12]==[a['baseline']['path'],a['baseline']['sha256']]
label='diagnostic-shared-postflight-final-equality-r1';argv[9]=label;argv[12]=','.join(map(str,ids));output=Path(a['guardSource']['path']).parent/'evidence'/label
PY=config['requiredPythonPath'];assert argv[0]==PY and role(PY)['sha256']==config['requiredPythonSha256']
assert not os.path.lexists(P) and not os.path.lexists(output) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700)
grant={'schema':'1370-root-original-shared-postflight-diagnostic-grant/v1','executionAuthorization':True,'automaticRetry':False,'sourcePins':sp,'sourceReview':reviewRole,'priorFailureAdoption':ar,'priorFailureReadback':a['failureReadback'],'originalScannerArgv':argv,'guardSource':a['guardSource'],'guardConfig':a['guardConfig'],'baseline':a['baseline'],'requiredPythonPath':PY,'requiredPythonRole':role(PY),'parentPath':str(P),'originalOutputPath':str(output),'ownedPid':os.getpid(),'ownedPgid':os.getpgrp(),'ownedSid':os.getsid(0),'actualPriorOwnedPids':pids,'actualPriorOwnedGroupIds':ids,'priorScopedChecks':checks,'perCommandTimeoutSeconds':180,'wholeScanDeadline':None,'metadataCapBytes':16777216,'summaryCapBytes':32768,'startMonotonic':time.monotonic(),'directExecPreservesPid':True,'rootLauncher':role(__file__),'rawPsFdIncludedInDiagnostic':False}
gr=put(P/'GRANT.json',grant);print(json.dumps({'grant':gr,'ownedPid':os.getpid(),'ownedPgid':os.getpgrp()}),flush=True)
fo=os.open(P/'diagnostic.stdout',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(P/'diagnostic.stderr',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe)
os.chdir('/Users/zacheryspector/The-Movies-headless-program');os.execve(PY,[PY,'-I','-B',str(HERE/'diagnose_shared_post.py'),gr['path'],gr['sha256']],dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
