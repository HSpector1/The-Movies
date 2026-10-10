import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r7'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
sp=role(Q/'SOURCE-PINS.json');assert sp['sha256']=='2615fe13cac2b243b94606f79e28031ceb603efe8cf4562375651570431eaea2';m=read(sp['path'])
rr=role(S/'1370-an-m0-fullfunction-current-prelaunch-preparation-independent-source-review-20261010-r7/RECEIPT.json')
assert rr['sha256']=='3ad6913607e10e4076ede01f611a0931f92cffcfb612a80ae939156ecdf23f11'
r=read(rr['path']);assert r['sourceManifest']==sp and r['decision']=='ACCEPT_STATIC_FULLFUNCTION_RETRY_CURRENT_PRELAUNCH_PREPARATION_SOURCE_ONLY' and r['concreteFindings']==[] and r['executionAuthorization'] is False
for x in m['files'].values():assert role(x['path'])==x
for k in ('EXACT-ARGV.json','run_fullfunction_current_prelaunch_once.py','read_fullfunction_current_prelaunch.py'):assert r['sourcePins'][k]==r['routeSourcePins'][k]==m['files'][k]
x=read(Q/'EXACT-ARGV.json');argv=x['launcherArgv'][:]
for k in ('knownPriorSharedReadback','knownPriorProtectedStopAdoption','expectedPriorReadback'):assert role(x[k]['path'])==x[k]
argv[-4:]=[x['knownPriorSharedReadback']['path'],x['knownPriorSharedReadback']['sha256'],x['knownPriorProtectedStopAdoption']['path'],x['knownPriorProtectedStopAdoption']['sha256']]
assert len(argv)==12 and all(isinstance(a,str) for a in argv) and argv[3]==str(Q/'run_fullfunction_current_prelaunch_once.py')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
v={'schema':'1370-root-current-prelaunch-preparation-adoption/v1','status':'ROOT_ADOPTED_R5_CURRENT_PRELAUNCH_PREPARATION_SOURCE_ONLY','sourcePins':sp,'sourceReview':rr,'exactFilledArgv':argv,'executionAuthorization':False,'actualOutcome':None}
p=A/'M0-FULLFUNCTION-R5-PRELAUNCH-PREPARATION-ADOPTION.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);assert role(argv[0])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
print(json.dumps({'preparationAdoption':role(p)}),flush=True)
os.chdir(x['cwd']);os.execve(argv[0],argv,dict(os.environ,**x['environment']))
