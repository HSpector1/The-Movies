import hashlib,json,math,os,pathlib,signal,stat,time
LAUNCH_START=time.monotonic()
def early_alarm(*_):raise TimeoutError('330-second M0 type recorder whole deadline before supervisor load')
signal.signal(signal.SIGALRM,early_alarm)
elapsed=time.monotonic()-LAUNCH_START
assert math.isfinite(elapsed) and 0<=elapsed<330
signal.setitimer(signal.ITIMER_REAL,330-elapsed)
import sys
assert len(sys.argv)==3,'context path and exact hash required'
context=pathlib.Path(sys.argv[1]);context_sha=sys.argv[2]
assert len(context_sha)==64 and set(context_sha)<=set('0123456789abcdef')
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpgrp()==os.getpid() and os.getsid(0)==os.getpid(),'launch helper must own its actual session/group'
HELPER_PID=os.getpid();HELPER_PGID=os.getpgrp();HELPER_SID=os.getsid(0)
def attrs(v):return v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns
def identity(v):return v.st_dev,v.st_ino,v.st_mode
def read_pin(path,pin,cap):
 assert path.is_absolute()
 parent=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);held=[parent]
 try:
  for component in path.parts[1:-1]:
   assert component not in ('','.','..')
   before=os.stat(component,dir_fd=parent,follow_symlinks=False)
   child=os.open(component,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
   assert stat.S_ISDIR(before.st_mode) and identity(before)==identity(os.fstat(child))
   held.append(child);parent=child
  before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   assert attrs(before)==attrs(os.fstat(fd))
   pieces=[];count=0
   while piece:=os.read(fd,65536):
    assert 0<=time.monotonic()-LAUNCH_START<330
    count+=len(piece);assert count<=cap and count<=before.st_size
    pieces.append(piece)
   raw=b''.join(pieces)
   assert count==before.st_size and attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False))
  finally:os.close(fd)
  for i,component in enumerate(path.parts[1:-1]):
   assert identity(os.fstat(held[i+1]))==identity(os.stat(component,dir_fd=held[i],follow_symlinks=False))
  assert hashlib.sha256(raw).hexdigest()==pin
  return raw
 finally:
  for item in reversed(held):os.close(item)
P=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-an-m0-post-r6-preservation-diagnostic-source-20261009-r1')
config=json.loads(read_pin(P/'CONFIG.json','114d5cabe8e201193e57a8667ec9d419712fb439e6ee7e98adb6a197e833d30c',100000))
authority=json.loads(read_pin(context,context_sha,128*1024))
expected={'runner.py':'cf25620abdcd6a15101e9c9a8746efb46c89f92f62b3f86b4db24eb150ab0e67','BOOTSTRAP.py':'7581248b3cde60c94100ed2b3ae927b031e496d5e892e63e9d89b491d41c1fac','supervise.py':'704098513cf8c48914569dd7ad35e7b5bc46590e8f2910f31dfea1104f74c3c8','CONFIG.json':'114d5cabe8e201193e57a8667ec9d419712fb439e6ee7e98adb6a197e833d30c','check-deps.mjs':'e61f6a88614eac49fcec3f326c162e4d44d75ea2999b6751581e30e7685b6a64'}
assert authority['schema']=='1370-post-r6-m0-preservation-diagnostic-context/v1'
assert type(authority['diagnosticInputs']) is dict and set(authority['diagnosticInputs'])=={'controlsObservedReview','controlsRootAdoption','currentAMFullPreflight','currentAMFullPreflightAdoption'}
assert authority['configSha256']==expected['CONFIG.json'] and authority['runId']==config['runId'] and authority['mirrorPath']==config['mirrorPath']
def role(name,cap=100000):
 r=authority[name]
 assert type(r) is dict and set(r)=={'path','bytes','sha256'} and type(r['bytes']) is int and 0<r['bytes']<=cap
 raw=read_pin(pathlib.Path(r['path']),r['sha256'],cap);assert len(raw)==r['bytes'];return json.loads(raw)
review=role('sourceReview');grant=role('actualGrant')
assert review['decision']=='ACCEPT_STATIC_POST_R6_M0_PRESERVATION_DIAGNOSTIC_SOURCE_ONLY'
assert all(review['sourcePins'][k]['sha256']==v for k,v in expected.items())
launch_role=review['sourcePins']['LAUNCH.py']
launch_bytes=read_pin(P/'LAUNCH.py',launch_role['sha256'],250000)
assert launch_role['path']==str(P/'LAUNCH.py') and launch_role['bytes']==len(launch_bytes)
assert authority.get('currentProtection') is None and authority.get('freshSourceProof') is None and authority.get('freshDependencyProof') is None,'future proof/protection must remain null at proof launch'
assert grant['schema']=='1370-root-post-r6-m0-preservation-diagnostic-grant/v1' and grant['executionAuthorization'] is True
assert grant['contextWithoutGrantSha256']==hashlib.sha256(json.dumps({k:v for k,v in authority.items() if k!='actualGrant'},sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert grant['runId']==config['runId'] and grant['configSha256']==expected['CONFIG.json']
assert grant['sourceReviewSha256']==authority['sourceReview']['sha256']
assert grant['scope']=='READONLY_POST_R6_M0_PRESERVATION_DIAGNOSTIC_KNOWN_ROOT_DRIFT_ONLY' and grant['gameAuthorization'] is False
assert type(authority['additionalRefs']) is dict
assert set(authority['runtimeTools'])=={'node','python','rootCompilerWrapper','uiCompilerWrapper','collectionWrapper'}
def normalized(st):return [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
for name,r in authority['runtimeTools'].items():
 assert type(r['bytes']) is int and 0<r['bytes']<=128*1024*1024
 raw=read_pin(pathlib.Path(r['physicalPath']),r['sha256'],128*1024*1024)
 assert len(raw)==r['bytes'] and normalized(os.stat(r['physicalPath'],follow_symlinks=False))==r['physicalIdentity']
 for link in r['links']:
  st=os.stat(link['path'],follow_symlinks=False)
  assert stat.S_ISLNK(st.st_mode) and normalized(st)==link['identity'] and os.readlink(link['path'])==link['target']
 assert pathlib.Path(r['invokedPath']).resolve(strict=True)==pathlib.Path(r['physicalPath'])
assert authority['runtimeTools']['node']['invokedPath']=='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
assert authority['runtimeTools']['python']['invokedPath']=='/usr/local/bin/python3'
compiler=str(pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')/'node_modules/.bin'/'tsc')
collector=str(pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')/'node_modules/.bin'/'vitest')
assert authority['runtimeTools']['rootCompilerWrapper']['invokedPath']==compiler==authority['runtimeTools']['uiCompilerWrapper']['invokedPath']
assert authority['runtimeTools']['collectionWrapper']['invokedPath']==collector
source=read_pin(P/'supervise.py',expected['supervise.py'],250000)
for name,pin in expected.items():read_pin(P/name,pin,250000)
print(json.dumps({'schema':'1370-m0-types-launch-helper-identity/v1','helperPid':HELPER_PID,'helperPgid':HELPER_PGID,'helperSid':HELPER_SID,'contextSha256':context_sha}),flush=True)
exec(compile(source,str(P/'supervise.py'),'exec'),{'__name__':'__main__','__file__':str(P/'supervise.py'),
 'LAUNCH_START':LAUNCH_START,'_AUTHORITY':authority,'_CONTEXT_PATH':str(context),'_CONTEXT_SHA':context_sha,
 '_HELPER':{'pid':HELPER_PID,'pgid':HELPER_PGID,'sid':HELPER_SID}})
