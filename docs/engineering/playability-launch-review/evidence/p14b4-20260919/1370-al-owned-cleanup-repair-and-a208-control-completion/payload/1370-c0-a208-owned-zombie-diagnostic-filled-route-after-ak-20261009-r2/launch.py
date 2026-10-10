"""Root one-shot owned-zombie zero-probe control grant; requires independent exact source receipt."""
import datetime,hashlib,json,os,shutil,stat,subprocess,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program')
Q=Path(__file__).parent
P=S/'1370-c0-a208-owned-zombie-diagnostic-parent-after-ak-20261009-r2'
HEAD='372d15e1ae53b898be2cf633a6bb8bb0058cb01f'
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<128*1024**2
 before=(st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode,st.st_nlink);b=p.read_bytes();after=p.lstat();assert (after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns,after.st_mode,after.st_nlink)==before
 return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def git(*a):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*a],cwd=R,text=True,timeout=30).strip()
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
review=Path(sys.argv[1]);assert role(review)['sha256']==sys.argv[2];rv=json.loads(review.read_text())
assert rv['decision']=='ACCEPT_SOURCE_ONLY_OWNED_ZOMBIE_FILLED_ROUTE_AND_WRAPPER' and rv['wrapper']==role(Path(__file__))
pins=role(Q/'SOURCE-PINS.json');assert rv['sourcePinsSha256']==pins['sha256']
for name,item in json.loads((Q/'SOURCE-PINS.json').read_text())['files'].items():assert role(Q/name)==item
c=json.loads((Q/'CONFIG.json').read_text());route=json.loads((Q/'ROUTE.json').read_text())
for item in [*c['roles'].values(),c['probe']]:assert role(item['path'])==item
assert c['status']=='FILLED_SOURCE_ONLY_UNRUN' and c['executionAuthorization'] is False
assert git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and not git('status','--porcelain=v1','--untracked-files=all')
assert git('remote','get-url','origin')=='https://github.com/HSpector1/The-Movies.git'
refs=git('ls-remote','origin','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').splitlines()
assert sorted(refs)==sorted([c['currentOperationalRefs']['main']+'\trefs/heads/main',HEAD+'\trefs/heads/wip/headless-program-20260916-ts'])
assert c['actualGrantAndReviewOutsideConfig'] is True and c['runtimeGrant'] is None
assert c['ownedRegistry']==str(P/'OWNED-MICROCHILD.jsonl') and route['parentRecordedPath']==str(P)
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and shutil.disk_usage(S).free>=3758096384
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True,timeout=10)
for path in [P,*map(Path,route['absentPathsAtFutureGrant'])]:assert not os.path.lexists(path)
expected=['/bin/bash',c['roles']['helper']['path'],'0',str(S/'1370-c0-a208-owned-zombie-diagnostic-lane-after-ak-20261009-r3/controls.log'),c['pythonPath'],'-I','-B',str(Q/'record.py'),'probe']
assert route['argv']==expected and route['cwd']==str(Q)
def protected_root_snapshot():
 result={}
 for name in c['protectedRoots']:
  path=Path(name);st=path.lstat()
  assert path.resolve(strict=True)==path and stat.S_ISDIR(st.st_mode) and not path.is_symlink()
  result[name]=[st.st_dev,st.st_ino,st.st_mode,st.st_mtime_ns,st.st_ctime_ns]
 return result
protected_before=protected_root_snapshot()
P.mkdir(mode=0o700);Path(expected[3]).parent.mkdir(mode=0o700)
grant={'status':'ROOT_ONCE_ONLY_OWNED_ZOMBIE_ZERO_PROBE_GRANTED','sourcePins':pins,'independentReview':role(review),'argv':expected,'cwd':str(Q),'bounds':c['bounds'],'game':False,'diagnosticActual17MethodRetry':False,'configSha256':role(Q/'CONFIG.json')['sha256'],'ownedZombieZeroProbeOnly':True,'ownedRegistry':c['ownedRegistry'],'positiveSignalsInMicroprobe':False,'protectedRootBefore':protected_before,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
(P/'GRANT.json').write_text(json.dumps(grant,sort_keys=True,indent=2)+'\n')
env=dict(os.environ,GIT_OPTIONAL_LOCKS='0',PYTHONDONTWRITEBYTECODE='1');env.pop('NODE_OPTIONS',None);env.pop('NODE_PATH',None)
child=subprocess.Popen(expected,cwd=Q,env=env)
(P/'HELPER-PID.json').write_text(json.dumps({'pid':child.pid})+'\n');print(json.dumps({'helperPid':child.pid,'grant':str(P/'GRANT.json')}),flush=True)
code=child.wait()
# Capture the exact tiny registry after helper exit, including a STOP path.
# These are artifact reads only; root may separately perform authorized recorded-ID
# lane-release zero probes. No process discovery or additional experiment rows.
def registry_capture():
 path=Path(c['ownedRegistry'])
 result={'schema':'a208-owned-microchild-registry-capture/v1','path':str(path),'status':'REGISTRY_ABSENT','role':None,'records':None,'recorderParentLinkVerified':False,'numericReuseCaveat':True,'liveProcessQueries':False}
 if not os.path.lexists(path):return result
 def metadata(st):return (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode,st.st_nlink,st.st_uid)
 try:
  st=path.lstat();assert path.resolve(strict=True)==path and stat.S_ISREG(st.st_mode) and st.st_nlink==1 and stat.S_IMODE(st.st_mode)==0o600 and st.st_uid==os.geteuid() and 0<st.st_size<=4096
  fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
  try:
   assert metadata(os.fstat(fd))==metadata(st);raw=os.read(fd,4097);assert len(raw)==st.st_size and metadata(os.fstat(fd))==metadata(st)==metadata(path.lstat())
  finally:os.close(fd)
  result['role']={'path':str(path),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
  assert raw.endswith(b'\n');lines=raw.splitlines();assert 1<=len(lines)<=3 and all(len(line)+1<=1024 for line in lines)
  def unique(pairs):
   obj={}
   for key,value in pairs:assert key not in obj;obj[key]=value
   return obj
  def nonfinite(value):raise ValueError('nonfinite registry')
  entries=[json.loads(line,object_pairs_hook=unique,parse_constant=nonfinite) for line in lines]
  first=entries[0];pid=first['pid'];parent=first['parentPid'];assert type(pid) is int and type(parent) is int and pid>1 and parent>1 and pid!=parent
  fields={'schema','phase','parentPid','pid','pgid','sid','registeredBeforeReady','pgidConfirmed','sessionConfirmed','goSent','reaped','waitStatus','elapsedSeconds'}
  for entry,phase in zip(entries,('forked','ready','reaped')):
   assert set(entry)==fields and entry['schema']=='a208-owned-microchild-registry/v1' and entry['phase']==phase and type(entry['pid']) is int and entry['pid']==pid and type(entry['parentPid']) is int and entry['parentPid']==parent and entry['registeredBeforeReady'] is True
   if phase=='forked':assert entry['pgid'] is None and entry['sid'] is None and entry['pgidConfirmed'] is False and entry['sessionConfirmed'] is False and entry['goSent'] is False and entry['reaped'] is False and entry['waitStatus'] is None
   else:assert type(entry['pgid']) is int and type(entry['sid']) is int and entry['pgid']==entry['sid']==pid and entry['pgidConfirmed'] is True and entry['sessionConfirmed'] is True and entry['goSent'] is (phase=='reaped') and entry['reaped'] is (phase=='reaped') and (entry['waitStatus'] is None if phase=='ready' else type(entry['waitStatus']) is int and entry['waitStatus']==0)
  result.update(status='REGISTRY_CAPTURED_VALID_PREFIX',records=entries,ownedPid=pid,confirmedPgid=pid if len(entries)>=2 else None,confirmedSid=pid if len(entries)>=2 else None)
  rp=Path(c['futureOutput'])/'RESULT.json'
  if os.path.lexists(rp):
   st=rp.lstat();assert rp.resolve(strict=True)==rp and stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=16384
   fd=os.open(rp,os.O_RDONLY|os.O_NOFOLLOW)
   try:
    assert metadata(os.fstat(fd))==metadata(st);rb=os.read(fd,16385);assert len(rb)==st.st_size and metadata(os.fstat(fd))==metadata(st)==metadata(rp.lstat())
   finally:os.close(fd)
   rr=json.loads(rb,object_pairs_hook=unique,parse_constant=nonfinite)
   result['recorderResultRole']={'path':str(rp),'bytes':len(rb),'sha256':hashlib.sha256(rb).hexdigest()}
   result['recorderParentLinkVerified']=type(rr.get('childPid')) is int and rr['childPid']==parent and rr.get('configSha256')==role(Q/'CONFIG.json')['sha256']
 except Exception as exc:result.update(status='STOP_REGISTRY_CAPTURE_UNKNOWN',error=(type(exc).__name__+':'+str(exc))[:192])
 return result
capture=registry_capture()
(P/'REGISTRY-CAPTURE.json').write_text(json.dumps(capture,sort_keys=True,indent=2)+'\n')
if code==0:assert capture['status']=='REGISTRY_CAPTURED_VALID_PREFIX' and len(capture['records'])==3 and capture['recorderParentLinkVerified'] is True,'STOP_REGISTRY_SUCCESS_LINK_UNKNOWN'
protected_after=protected_root_snapshot()
(P/'PROTECTION-AFTER.json').write_text(json.dumps({'scope':'bounded-directory-metadata-only','before':protected_before,'after':protected_after,'equal':protected_before==protected_after,'fullInventoryPerformed':False},sort_keys=True,indent=2)+'\n')
assert protected_before==protected_after,'STOP_BOUNDED_PROTECTED_ROOT_DRIFT'
print(json.dumps({'helperExit':code,'boundedProtectedRootEquality':True}),flush=True)
raise SystemExit(code)
