import datetime,hashlib,json,os,shutil,stat,subprocess,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');P=Path(__file__).parent
CONFIG='3854a5e57881fe5374b65b36912c66a656e2768d0fcf78abf5aa27c224e507bf'
LAUNCH='b5e2883b8c9864632c9d38491e210b06d5b4d8a82063251b27f14de432588ec6'
def meta(st):return(st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def role(path):
 path=Path(path);a=path.lstat();assert path.resolve(strict=True)==path and stat.S_ISREG(a.st_mode) and a.st_nlink==1
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert meta(os.fstat(fd))==meta(a);h=hashlib.sha256()
  while b:=os.read(fd,1024*1024):h.update(b)
  assert meta(os.fstat(fd))==meta(a)==meta(path.lstat())
 finally:os.close(fd)
 return {'path':str(path),'bytes':a.st_size,'sha256':h.hexdigest()}
def git(*args):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True,timeout=30).strip()
assert len(sys.argv)==3
review=Path(sys.argv[1]);rr=role(review);assert rr['sha256']==sys.argv[2];rv=json.loads(review.read_text())
assert rv['decision']=='ACCEPT_EXACT_ADDITIVE_CONTROLS_CONFIG_AND_LAUNCH' and rv['configSha256']==CONFIG and rv['launchSha256']==LAUNCH
assert role(P/'CONFIG.json')['sha256']==CONFIG and role(P/'LAUNCH.json')['sha256']==LAUNCH
c=json.loads((P/'CONFIG.json').read_text());launch=json.loads((P/'LAUNCH.json').read_text());roles=[rr,role(P/'CONFIG.json'),role(P/'LAUNCH.json'),role(Path(__file__))]
assert c['executionAuthorization'] is True and c['authoredMethods']==7
for expected in c['roles'].values():
 actual=role(expected['path']);assert actual['sha256']==expected['sha256'];roles.append(actual)
for key in ['controlsPins','routePins']:
 pp=Path(c['roles'][key]['path']);pins=json.loads(pp.read_text())
 for name,expected in pins['files'].items():
  actual=role(pp.parent/name);assert actual['sha256']==expected['sha256'] and actual['bytes']==expected['bytes'];roles.append(actual)
assert json.loads(Path(c['roles']['controlsReview']['path']).read_text())['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_ADDITIVE_CONTROLS'
assert json.loads(Path(c['roles']['routeReview']['path']).read_text())['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_ADDITIVE_RECORDED_ROUTE'
py=role(c['pythonPath']);assert py['sha256']==c['pythonSha256'];roles.append(py)
head='282f8477e61a33bd5ec4a571b934829490adef73'
assert git('rev-parse','HEAD')==head and git('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')==head+'\trefs/heads/wip/headless-program-20260916-ts'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
for group in [14652,18122,28843,34331,38312]:
 try:os.killpg(group,0)
 except ProcessLookupError:pass
 else:raise RuntimeError('Previously owned group remains '+str(group))
free=shutil.disk_usage(S).free;assert free>=3.5*1024**3
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True,timeout=5)
lane=Path(c['helperLog']).parent
for path in [lane,Path(c['controlOutput']),Path(c['runnerOutput'])]:assert not os.path.lexists(path)
grant={'schema':'additive-tiny-controls-parent-grant/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'decision':'GRANT_EXACT_SEVEN_TINY_CONTROLS_ONLY','roles':roles,'argv':launch['argv'],'cwd':launch['cwd'],'environment':launch['environment'],'bounds':c['bounds'],'freeBytes':free,'rootPidBecomesHelperPid':os.getpid(),'selectedPriorOwnedGroupsAbsent':[14652,18122,28843,34331,38312],'unexpectedHelperWaitIsStop':True,'currentHead':head,'actualAdditiveOrGameAuthorized':False,'observedClaim':False}
gp=P/'GRANT.json';fd=os.open(gp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(grant,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
lane.mkdir(mode=0o700)
print(json.dumps({'grant':role(gp),'helperPid':os.getpid()}),flush=True)
os.chdir(launch['cwd']);os.execve(launch['argv'][0],launch['argv'],dict(os.environ,**launch['environment']))
