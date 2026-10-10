"""UNRUN source. Root invokes only after exact combined review and once-only scan decision.
CLI: independentReviewPath independentReviewSHA. Direct exec, no heavy helper or
invented whole-scan timer. Actual tool chunks and observed acceptance are root's.
"""
import datetime,hashlib,json,os,shutil,stat,subprocess,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program')
Q=S/'1370-c0-a208-fullguard-game-filled-after-al-20261009-r1'
HEAD='8cb704e2f18e6a635943893422c9cfdc206e106d';SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
MAIN='c902a704eb948cc576083d0973c8c23e59937dc1'
DECISION='ACCEPT_SOURCE_ONLY_UNRUN_A208_AL_FILLED_GUARD_AND_EXACT_FIRST_BASELINE_WRAPPER'
def stamp(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def read_role(path,links=1):
 p=Path(path);before=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(before.st_mode) and before.st_nlink==links and before.st_size<=128*1024**2
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert stamp(os.fstat(fd))==stamp(before);blocks=[];size=0;h=hashlib.sha256()
  while True:
   b=os.read(fd,65536)
   if not b:break
   size+=len(b);assert size<=128*1024**2;h.update(b);blocks.append(b)
  assert size==before.st_size and stamp(os.fstat(fd))==stamp(before)==stamp(p.lstat())
 finally:os.close(fd)
 return {'path':str(p),'bytes':size,'sha256':h.hexdigest()},b''.join(blocks)
def authenticate(expected,links=1):
 actual,raw=read_role(expected['path'],links);assert actual==expected;return raw
def json_role(expected,links=1):return json.loads(authenticate(expected,links))
def git(*args):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True,timeout=30).strip()
def absent(pid):
 assert type(pid) is int and pid>1
 for probe in (os.kill,os.killpg):
  try:probe(pid,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('STOP previously recorded PID or PGID survives '+str(pid))
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
review_role,raw=read_role(sys.argv[1]);assert review_role['sha256']==sys.argv[2];review=json.loads(raw)
assert review['decision']==DECISION and review['executionAuthorization'] is False
pins_role,pins_raw=read_role(Q/'SOURCE-PINS.json');assert pins_role['sha256']==review['sourcePinsSha256'];pins=json.loads(pins_raw);assert pins['executionAuthorization'] is False
for name,expected in pins['files'].items():assert expected['path']==str(Q/name);authenticate(expected)
wrapper_role,_=read_role(Path(__file__));assert review['wrapper']==wrapper_role
x=json.loads(read_role(Q/'EXACT-ARGV.json')[1]);assert x['executionAuthorization'] is False and x['actualGrant'] is None and x['actualTool'] is None and x['actualOutcome'] is None
assert review['argv']==x['argv'] and review['outputParentRole']==x['outputParentRole']
for name,expected in x['roles'].items():authenticate(expected,76 if name=='git' else 1)
c=json.loads(read_role(Q/'CONFIG.json')[1]);assert c['executionAuthorization'] is False and c['productionHead']==HEAD and c['productionSourceTree']==SRC
assert Path(sys.executable).resolve(strict=True)==Path(c['requiredPythonPath']) and x['roles']['python']['path']==c['requiredPythonPath'] and x['roles']['python']['sha256']==c['requiredPythonSha256']
scope=json_role(x['roles']['scope']);pub=json_role(x['roles']['readback']);controls=json_role(x['roles']['controls'])
assert c['parentScopeAdoption']=={'path':x['roles']['scope']['path'],'sha256':x['roles']['scope']['sha256']}
assert scope['status']=='PARENT_ADOPTED_A208_OPERATIONAL_GUARD_SCOPE_ONLY' and scope['executionAuthorization'] is False and scope['actualScanGrant'] is None and scope['gameGrant'] is None
assert scope['productionGuardHead']==scope['operationalTransition']['actualHead']==HEAD and scope['productionSourceTree']==SRC and scope['combinedHFirstRouteUnchanged'] is True and scope['H8708Waived'] is False and scope['operationalTransition']['docsOnlyVerified'] is True
refs={'refs/heads/main':MAIN,'refs/heads/wip/headless-program-20260916-ts':HEAD};assert scope['remoteRefsVerified']==c['operationalRemoteRefs']==refs
assert scope['publishedReadback']==scope['operationalTransition']['docsTransitionFactsRole']==x['roles']['readback']
assert pub['status']=='PUSHED_REMOTE_AND_COMMITTED_TREE_VERIFIED' and pub['head']==pub['trackingWorkingHead']==HEAD and pub['main']==MAIN and pub['sourceTree']==SRC and pub['workingTreeClean'] is True and pub['docsOnlyTransitionVerified'] is True
assert controls['status']=='ROOT_ADOPTED_OBSERVED_A208_JS13_PYTHON17_CONTROLS_COMPLETE' and controls['actualControlsAccepted'] is True and controls['executionAuthorization'] is False and controls['gameGrant'] is None
assert set(controls['actualPythonExits'])=={'tool','helper','recorder','driver'} and all(type(v) is int and v==0 for v in controls['actualPythonExits'].values())
assert all(type(controls[k]) is int and controls[k]==v for k,v in [('jsGroups',13),('pythonProtocolMethods',3),('pythonObserverMethods',14),('pythonTotalMethods',17)])
assert scope['actualControlsAdoption']==x['roles']['controls'] and scope['sourceAmendmentAdoption']==x['roles']['heldSourceAdoption']
held=json_role(x['roles']['heldSourceAdoption']);assert held['status']=='ROOT_ADOPTED_SOURCE_ONLY_HELD_A208_OPERATIONAL_SCOPE_AMENDMENT' and held['executionAuthorization'] is False and held['sourcePins']==pins['heldSourcePins']
assert x['argv']==[c['requiredPythonPath'],'-I','-B',str(Q/'snapshot.py'),c['observedCopyReceipt']['path'],c['observedCopyReceipt']['sha256'],c['observedDecision'],'/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1','before-fill','before-fill-after-al-r1']
assert x['cwd']==str(R) and x['environment']=={'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'} and x['perCommandTimeoutSeconds']==180 and x['wholeScanDeadline'] is None
parent=Path(x['outputParentRole']['path']);st=parent.lstat();assert parent.resolve(strict=True)==parent and stat.S_ISDIR(st.st_mode) and {'path':str(parent),'device':st.st_dev,'inode':st.st_ino,'mode':stat.S_IMODE(st.st_mode)}==x['outputParentRole'] and stat.S_IMODE(st.st_mode)==0o700
binding=json_role(x['roles']['originalBinding'])
assert git('symbolic-ref','--quiet','--short','HEAD')=='wip/headless-program-20260916-ts' and git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')==SRC and not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').splitlines()==[MAIN+'\trefs/heads/main',HEAD+'\trefs/heads/wip/headless-program-20260916-ts']
for lock in (S/'HEAVY-LANE-LOCK',Path(binding['recorderLockPath']),Path(c['m0RecorderLockPath']),Path(c['additiveRecorderLockPath'])):assert not os.path.lexists(lock)
for pid in x['priorRecordedIds']:absent(pid)
free=shutil.disk_usage(S).free;assert free>=3758096384;assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True,timeout=5)
P=Path(x['parentRuntimeDirectory']);output=parent/x['argv'][-1]
assert P.parent==S and not any(os.path.lexists(p) for p in (P,output))
# Direct exec preserves this exact PID. Only establish our own group; no signals.
if os.getpgid(0)!=os.getpid():os.setsid()
pid=os.getpid();pgid=os.getpgid(0);assert pgid==pid;sid=os.getsid(0)
P.mkdir(mode=0o700);assert P.resolve(strict=True)==P and stat.S_IMODE(P.stat().st_mode)==0o700
out=P/'before-fill.stdout';err=P/'before-fill.stderr'
g={'schema':'1370-a208-al-direct-first-fullguard-root-grant/v1','status':'GRANTED_ONE_EXACT_DIRECT_AL_BEFORE_FILL_FULL_GUARD','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'parentPidBecomesSnapshotPid':pid,'ownedScannerPid':pid,'ownedScannerPgid':pgid,'scannerSid':sid,'scannerGroupVerifiedBeforeExec':True,'argv':x['argv'],'cwd':x['cwd'],'environment':x['environment'],'sourcePins':pins_role,'wrapper':wrapper_role,'independentSourceReview':review_role,'exactArgv':read_role(Q/'EXACT-ARGV.json')[0],'guardSource':read_role(Q/'snapshot.py')[0],'config':read_role(Q/'CONFIG.json')[0],'actualScope':x['roles']['scope'],'publishedReadback':x['roles']['readback'],'actualControlsAdoption':x['roles']['controls'],'outputParentRole':x['outputParentRole'],'stdoutPath':str(out),'stderrPath':str(err),'productionHead':HEAD,'sourceTree':SRC,'priorRecordedIdsFreshlyAbsent':x['priorRecordedIds'],'freeBytes':free,'acPower':True,'globalWorkerAbsenceClaim':False,'soleRecordedHeavyLane':True,'noHeavyHelperBecauseGuardRequiresLockAbsent':True,'perCommandTimeoutSeconds':180,'wholeScanDeadline':None,'rawPsFdLocalOnly':True,'protectedWriteAndRenamerFreeze':'Production/common/R9/H/dependencies remain read-only from this baseline through dependent reviewed route and protected postflight.','actualToolChunksAndFinalExitRequired':True,'actualTool':None,'actualOutcome':None,'gameOrM0ExecutionAuthorized':False,'automaticRetryAuthorized':False}
gp=P/'BEFORE-FILL-GRANT.json';fd=os.open(gp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as stream:json.dump(g,stream,sort_keys=True,indent=2);stream.write('\n');stream.flush();os.fsync(stream.fileno())
print(json.dumps({'grant':read_role(gp)[0],'snapshotPid':pid,'snapshotPgid':pgid}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(R);os.execve(x['argv'][0],x['argv'],dict(os.environ,**x['environment']))
