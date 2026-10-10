import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;G=S/'1370-ao-current-operational-fullguard-source-20261010-r1';P=S/'1370-ao-current-an-fullpreflight-parent-recorded-20261010-r1'
PY='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];review=json.loads(Path(sys.argv[1]).read_bytes())
sp=role(G/'SOURCE-PINS.json');assert sp['sha256']=='9df63e39d302e3b8481198999e129233ab4eb5709848d91cb1d45af0dfee0e88'
assert review['decision']=='ACCEPT_CURRENT_AN_FULLGUARD_BINDINGS_SOURCE_ONLY' and review['sourcePins']==sp and review['concreteFindings']==[] and review['executionAuthorization'] is False
pins=json.loads((G/'SOURCE-PINS.json').read_bytes())
for r in pins['files'].values():assert role(r['path'])==r
assert role(PY)['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
assert role(pins['operationalScope']['path'])==pins['operationalScope']
config=json.loads((G/'CONFIG.json').read_bytes());ad=json.loads(Path(pins['operationalScope']['path']).read_bytes())
assert config['productionHead']==ad['productionGuardHead']=='0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(P) and not os.path.lexists(G/'evidence/before-fill-current-an-r1')
sourceadoption=put(A/'CURRENT-AN-FULLGUARD-SOURCE-ADOPTION.json',{'schema':'1370-ao-root-current-an-fullguard-source-adoption/v1','status':'ROOT_ADOPTED_CURRENT_AN_FULLGUARD_BINDINGS_SOURCE_ONLY','sourcePins':sp,'sourceReview':rr,'operationalScope':pins['operationalScope'],'actualGuardsAccepted':False,'executionAuthorization':False,'originalProcedureLogicUnchanged':True})
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()
P.mkdir(mode=0o700)
argv=[PY,'-I','-B',str(G/'snapshot.py'),config['observedCopyReceipt']['path'],config['observedCopyReceipt']['sha256'],config['observedDecision'],str(S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'),'before-fill','before-fill-current-an-r1']
grant={'schema':'1370-ao-root-direct-current-an-fullpreflight-grant/v1','status':'GRANTED_ONCE_ORIGINAL_COMPLETE_CURRENT_AN_FULL_PREFLIGHT','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'executionAuthorization':True,'sourcePins':sp,'sourceReview':rr,'sourceAdoption':sourceadoption,'rootLauncher':role(__file__),'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','ownedPid':os.getpid(),'ownedPgid':os.getpgrp(),'ownedSid':os.getsid(0),'directExecPreservesPid':True,'perCommandTimeoutSeconds':180,'wholeScanDeadline':None,'actualFullInventoryRun':True,'noHelperOriginalLockAbsentRequired':True,'rawPsFdLocalOnly':True,'originalM0ContentProof':False,'game':False,'automaticRetry':False}
gr=put(P/'GRANT.json',grant);print(json.dumps({'grant':gr,'ownedPid':os.getpid(),'ownedPgid':os.getpgrp()}),flush=True)
fo=os.open(P/'scan.stdout',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(P/'scan.stderr',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(grant['cwd'])
os.execve(argv[0],argv,dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
