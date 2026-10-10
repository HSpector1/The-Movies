import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-a208-fullguard-after-fill-parent-after-al-20261009-r4'
def role(path):
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(path,sha):
 r=role(path);assert r['sha256']==sha;return r,json.loads(Path(path).read_bytes())
def absent(pid):
 for kind,fn in [('pid',os.kill),('pgid',os.killpg)]:
  try:fn(pid,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('STOP recorded identity survives '+str(pid)+' '+kind)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
review,rv=checked(S/'1370-c0-a208-game-exact-preparation-independent-source-review-after-al-20261009-r4/RECEIPT.json','105445b8625884887c7c2ebdd310665745781e8964a8953dcbb5a0281fd00661')
mapping,m=checked(S/'1370-c0-a208-game-fill-after-fill-argument-map-after-al-20261009-r1/MAP.json','5f23c5c9bc88ba696ef106456da9926fb8ba6c696da0749459a65f707256ed89')
a=m['afterFill'];assert rv['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_R4_EXACT_PREPARATION_AND_FILL_AFTER_FILL_ARGUMENT_MAP' and rv['executionAuthorization'] is False
assert a['argv']==rv['exactArgumentReview']['afterFill']['argv'] and a['environment']==rv['exactArgumentReview']['afterFill']['environment']
for key in ('baseline','unchangedConfig','unchangedScanner','originalObservedCopyReceipt'):assert role(a[key]['path'])==a[key]
assert str(Path(sys.executable).resolve(strict=True))==a['argv'][0] and role(a['argv'][0])['sha256']==m['fill']['python']['sha256']
fill,fr=checked(S/'1370-c0-a208-game-fill-parent-after-al-20261009-r4/ACTUAL-FILL-READBACK.json','d6bd98a2192fdec37f06768e6a780bc3313a3c10c40d7ab6c54079a7fbe0f60f')
assert fr['status']=='ACTUAL_SIX_FILLED_UNREVIEWED_READY_FOR_AFTER_FILL_GUARD' and fr['actualToolExit']==fr['fillerExit']==0 and fr['game'] is False
for expected in fr['files'].values():assert role(expected['path'])==expected
for key in ('actualTool','grant','stdout','stderr'):assert role(fr[key]['path'])==fr[key]
beforeGrant,bg=checked(S/'1370-c0-a208-fullguard-before-fill-parent-after-al-20261009-r1/BEFORE-FILL-GRANT.json','86cada08291887fe71850dea8d849fccb01caa67187d2ea1c9e3f6763be5bd70')
ids=sorted(set(bg['priorRecordedIdsFreshlyAbsent']+[75073,54612]))
for pid in ids:absent(pid)
assert not os.path.lexists(P) and not os.path.lexists(a['plannedOutputDirectory']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
parent=Path(a['plannedOutputDirectory']).parent;st=parent.lstat();assert {'path':str(parent),'device':st.st_dev,'inode':st.st_ino,'mode':stat.S_IMODE(st.st_mode)}==bg['outputParentRole']
if os.getpgid(0)!=os.getpid():os.setsid()
assert os.getpid()==os.getpgid(0)
P.mkdir(mode=0o700);out=P/'after-fill.stdout';err=P/'after-fill.stderr'
g={'schema':'1370-root-a208-direct-after-fill-fullguard-grant/v1','status':'GRANTED_ONE_EXACT_AL_A208_AFTER_FILL_FULL_GUARD','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'executionAuthorization':True,'scope':'AFTER_FILL_FULL_PROTECTION_ONLY','rootLauncher':role(__file__),'argumentMap':mapping,'independentSourceAndArgvReview':review,'actualFillReadback':fill,'actualCandidateIdentity':fr['identity'],'actualCandidateFiles':fr['files'],'baseline':a['baseline'],'guardSource':a['unchangedScanner'],'guardConfig':a['unchangedConfig'],'argv':a['argv'],'cwd':a['cwd'],'environment':a['environment'],'ownedScannerPid':os.getpid(),'ownedScannerPgid':os.getpgid(0),'ownedScannerSid':os.getsid(0),'directExecPreservesPid':True,'priorRecordedIdsFreshlyAbsent':ids,'globalWorkerAbsenceClaim':False,'stdoutPath':str(out),'stderrPath':str(err),'perCommandTimeoutSeconds':180,'wholeScanDeadline':None,'parentAddedStreamCap':None,'noHelperBecauseGuardRequiresLockAbsent':True,'rawPsFdLocalOnly':True,'protectedFreezeContinues':True,'actualTool':None,'actualOutcome':None,'game':False,'automaticRetry':False}
gp=P/'AFTER-FILL-GRANT.json'
with gp.open('xb') as f:f.write((json.dumps(g,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
print(json.dumps({'grant':role(gp),'scannerPid':os.getpid(),'scannerPgid':os.getpgid(0)}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe)
os.chdir(a['cwd']);os.execve(a['argv'][0],a['argv'],dict(os.environ,**a['environment']))

