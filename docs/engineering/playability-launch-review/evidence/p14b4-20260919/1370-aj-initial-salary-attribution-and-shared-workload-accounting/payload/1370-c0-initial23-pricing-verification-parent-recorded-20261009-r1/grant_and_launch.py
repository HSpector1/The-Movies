import datetime, hashlib, json, os, shutil, stat, subprocess, sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=Path(__file__).parent
Q=S/'1370-c0-initial23-source-order-pricing-verification-proposal-20261009-r2'
PINS='335dc84cb31e2b084f95f441737eec0529ea995925f10289615169618fe74924'
def meta(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def role(p):
 p=Path(p);before=p.lstat()
 assert p.resolve(strict=True)==p and stat.S_ISREG(before.st_mode) and before.st_nlink==1
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert meta(os.fstat(fd))==meta(before)
  h=hashlib.sha256()
  while True:
   b=os.read(fd,1024*1024)
   if not b:break
   h.update(b)
  assert meta(os.fstat(fd))==meta(before)==meta(p.lstat())
 finally:os.close(fd)
 return {'path':str(p),'bytes':before.st_size,'sha256':h.hexdigest()}
def git(*args):
 return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True,timeout=30).strip()
assert len(sys.argv)==3
review=Path(sys.argv[1]);review_role=role(review);assert review_role['sha256']==sys.argv[2]
r=json.loads(review.read_text())
assert r['decision']=='ACCEPT_SOURCE_ONLY_FILLED_INITIAL23_PRICING_VERIFICATION' and r['sourcePinsSha256']==PINS
assert role(Q/'SOURCE-PINS.json')['sha256']==PINS
source=json.loads((Q/'SOURCE-PINS.json').read_text());roles=[review_role,role(Q/'SOURCE-PINS.json'),role(Path(__file__))]
for expected in [*source['files'].values(),*source['externalRoles'].values()]:
 assert role(expected['path'])==expected;roles.append(expected)
c=json.loads((Q/'CONFIG.json').read_text());recipe=json.loads((Q/'RECIPE.json').read_text())
assert role(c['nodePath'])=={'path':c['nodePath'],'bytes':c['nodeBytes'],'sha256':c['nodeSha256']}
roles.append(role(c['nodePath']))
for path,key in [(recipe['argv'][0],'helperSha256'),(recipe['argv'][3],'pythonSha256')]:
 rr=role(path);assert rr['sha256']==recipe['tools'][key];roles.append(rr)
assert c['roles']['actualWitnessIndependentReceipt']['sha256']=='54b305c8b48c96cd664c037d592f955b8ca8e59e53337d5c287ffb7331f303c7'
assert c['futureWitness'] and c['executionAuthorization'] is False
head='282f8477e61a33bd5ec4a571b934829490adef73'
assert git('rev-parse','HEAD')==head and git('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')==head+'\trefs/heads/wip/headless-program-20260916-ts'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
cleared=[]
for group in [17678,10372,10639,10655,71794,74268,14652,18122]:
 try:os.killpg(group,0)
 except ProcessLookupError:cleared.append(group)
 else:raise RuntimeError('Previously owned group is present: '+str(group))
free=shutil.disk_usage(S).free;assert free>=3.5*1024**3
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True,timeout=5)
lane=Path(recipe['argv'][2]).parent;out=Path(recipe['outputPath'])
assert not os.path.lexists(lane) and not os.path.lexists(out)
argv=['/bin/bash',*recipe['argv']]
grant={'schema':'initial23-pricing-parent-grant/v1','status':'GRANT_EXACT_PURE_INITIAL23_PRICING_VERIFICATION_ONLY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceRoles':roles,'argv':argv,'cwd':recipe['cwd'],'environment':recipe['environment'],'bounds':c['bounds'],'sourceReview':review_role,'expectedSelectedRows':23,'expectedImmutablePairs':44,'renewalsExcluded':16,'freeBytes':free,'acPower':True,'selectedPreviouslyOwnedGroupsAbsent':cleared,'globalProcessAbsenceClaim':False,'rootPidBecomesHelperPid':os.getpid(),'unexpectedHelperWaitIsStop':True,'gameExecutionAuthorized':False,'productionHead':head,'observedAgreementClaim':False}
gp=P/'GRANT.json';fd=os.open(gp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(grant,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
lane.mkdir(mode=0o700)
print(json.dumps({'grant':role(gp),'helperPid':os.getpid()}),flush=True)
os.chdir(recipe['cwd']);os.execve(argv[0],argv,dict(os.environ,**recipe['environment']))
