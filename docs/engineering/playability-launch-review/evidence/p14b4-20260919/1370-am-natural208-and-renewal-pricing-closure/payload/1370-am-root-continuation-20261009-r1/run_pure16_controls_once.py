import json,hashlib,os,sys,signal,time,datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-c0-renewal208-pure16-pricing-filled-source-after-al-20261009-r1';P=S/'1370-c0-renewal208-pure16-controls-parent-recorded-after-al-20261009-r1'
def role(p):
 p=Path(p);assert p.resolve(strict=True)==p and not p.is_symlink();b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert len(sys.argv)==4 and sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];review=json.loads(Path(sys.argv[1]).read_bytes());assert review['decision'].startswith('ACCEPT_') and review['executionAuthorization'] is False
pins=role(Q/'SOURCE-PINS.json');assert pins['sha256']==sys.argv[3];manifest=json.loads((Q/'SOURCE-PINS.json').read_bytes())
for r in manifest['files'].values():assert role(r['path'])==r
recipe=json.loads((Q/'PROTOCOL-CHECK-RECIPE.json').read_bytes());assert recipe['parentRecording']['alarmSeconds']==60 and recipe['parentRecording']['route']=='direct recorded exec; no helper or adapter'
assert role(recipe['argv'][0])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and not P.exists()
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpgrp()==os.getpid()
P.mkdir(mode=0o700);out=P/'controls.stdout';err=P/'controls.stderr'
g={'schema':'1370-root-pure16-direct-bounded-protocol-controls-grant/v1','status':'GRANTED_ONCE_EXACT_REPORT_PROTOCOL_CONTROLS','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'executionAuthorization':True,'independentExactSourceReview':rr,'sourcePins':pins,'recipe':role(Q/'PROTOCOL-CHECK-RECIPE.json'),'rootLauncher':role(__file__),'argv':recipe['argv'],'cwd':recipe['cwd'],'ownPid':os.getpid(),'ownPgid':os.getpgrp(),'ownSid':os.getsid(0),'directExecPreservesPid':True,'alarmSeconds':60,'alarmPersistsExec':True,'stdoutPath':str(out),'stderrPath':str(err),'singleLaneParentSerialization':True,'expectedUnittestMethods':1,'expectedSubtests':6,'expectedPredicateAssertions':10,'game':False,'pricing':False,'noChildProcessExpected':True,'actualOutcome':None,'automaticRetry':False}
p=P/'CONTROLS-GRANT.json'
with p.open('x') as f:json.dump(g,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps({'grant':role(p),'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(recipe['cwd'])
signal.signal(signal.SIGALRM,signal.SIG_DFL);signal.alarm(60);os.execve(recipe['argv'][0],recipe['argv'],dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
