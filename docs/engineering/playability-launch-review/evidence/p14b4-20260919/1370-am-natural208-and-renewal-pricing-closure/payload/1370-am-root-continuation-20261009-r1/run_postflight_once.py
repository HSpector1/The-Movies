import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-c0-a208-fullguard-postflight-parent-after-al-20261009-r4'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(p,h):
 r=role(p);assert r['sha256']==h;return json.loads(Path(p).read_bytes()),r
assert len(sys.argv)==3 and sys.flags.isolated and not sys.flags.optimize and sys.dont_write_bytecode
review,rr=checked(sys.argv[1],sys.argv[2])
m,mr=checked(S/'1370-c0-a208-original-postflight-and-output-argument-map-after-al-20261009-r1/MAP.json','e2227b000a118dc80a0e3af63a875ab2d4b7d4a15abf9be2126286f6cf4102e4')
a=m['postflight'];argv=a['argvTemplate'][:];assert argv[-1]=='__ACTUAL_GAME_OWNED_PGIDS_CSV_PENDING__';argv[-1]='34390'
assert review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_ORIGINAL_A208_POSTFLIGHT_ARGV_KNOWN_HELPER_ONLY' and review['argv']==argv
for key in ['beforeFillBaseline','acceptedActualAfterFill','unchangedConfig','unchangedProcedure','originalObservedCopyReceipt']:assert role(a[key]['path'])==a[key]
r,gr=checked(S/'1370-c0-a208-game-parent-recorded-after-al-20261009-r4/ACTUAL-GAME-READBACK.json','9af3e1e93ba5c47045bbe7cef9e5f07204454e2275cb0bf5db9212d4e574d2a1')
assert r['actualToolExit']==r['helperExit']==r['helperMetaExit']==r['outerExit']==r['sinkExit']==0
checks=[]
for kind,fn in [('pid',os.kill),('pgid',os.killpg)]:
 try:fn(34390,0)
 except ProcessLookupError:checks.append({'id':34390,'kind':kind,'result':'ESRCH','signal':0})
 else:raise RuntimeError('recorded helper still present')
assert not os.path.lexists(P) and not os.path.lexists(a['plannedOutputDirectory']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
assert str(Path(sys.executable).resolve(strict=True))==argv[0] and role(argv[0])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpgrp()==os.getpid()
P.mkdir(mode=0o700);out=P/'postflight.stdout';err=P/'postflight.stderr'
g={'schema':'1370-root-a208-direct-original-full-postflight-grant/v1','status':'GRANTED_ONCE_ORIGINAL_FULL_POSTFLIGHT','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'executionAuthorization':True,'rootLauncher':role(__file__),'argumentMap':mr,'independentExactArgvReview':rr,'actualGameReadback':gr,'guardSource':a['unchangedProcedure'],'guardConfig':a['unchangedConfig'],'baseline':a['beforeFillBaseline'],'argv':argv,'cwd':a['cwd'],'environment':a['environment'],'ownedScannerPid':os.getpid(),'ownedScannerPgid':os.getpgrp(),'ownedScannerSid':os.getsid(0),'directExecPreservesPid':True,'recordedGameOwnerPostChecks':checks,'suppliedActualGameOwnedPgids':[34390],'unknownNumericSupervisorOrNodeIds':True,'stdoutPath':str(out),'stderrPath':str(err),'perCommandTimeoutSeconds':180,'wholeScanDeadline':None,'parentAddedStreamCap':None,'noHelperBecauseOriginalGuardRequiresLockAbsent':True,'rawPsFdLocalOnly':True,'protectedFreezeContinues':True,'actualOutcome':None,'gameAccepted':False,'automaticRetry':False}
gp=P/'POSTFLIGHT-GRANT.json'
with gp.open('x') as f:json.dump(g,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps({'grant':role(gp),'scannerPid':os.getpid(),'scannerPgid':os.getpgrp()}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe)
os.chdir(a['cwd']);os.execve(argv[0],argv,dict(os.environ,**a['environment']))
