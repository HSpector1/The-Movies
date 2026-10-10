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
P=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-an-m0-types-external-config-executor-source-20261009-r2')
config=json.loads(read_pin(P/'CONFIG.json','6907995db2e8b89a1c801e0426011cabd651fddf2d40309f9fe7d1ae94d73aa8',100000))
authority=json.loads(read_pin(context,context_sha,128*1024))
expected={'runner.py':'f3ce5bc03f44e1de41237eb0a5a68f17130b78aa5c9129286780dbc9f8f895d0','BOOTSTRAP.py':'9ee6f99e0e27544653ffe69bb2f5c916150d94deb7c35e1f49963a444dd4b42a','supervise.py':'c8a8205123469986975979595e4711292f11643e0f896b5ff79239e31f4ad269','CONFIG.json':'6907995db2e8b89a1c801e0426011cabd651fddf2d40309f9fe7d1ae94d73aa8','check-deps.mjs':'e61f6a88614eac49fcec3f326c162e4d44d75ea2999b6751581e30e7685b6a64','ROOT-CONFIG-TEMPLATE.mts':'580ef6c30c0d8106dd111ca67f2e49cb2ec9a2681f26f743cc75398b6ca441a3','WORKSPACE-CONFIG-TEMPLATE.mts':'dffb1ea1d1aeab91bbfbbf3e219f25ae64dd66d8bff31cd545f09a46643e70fd'}
assert authority['schema']=='1370-m0-types-execution-context/v1'
assert authority['configSha256']==expected['CONFIG.json'] and authority['runId']==config['runId'] and authority['mirrorPath']==config['mirrorPath']
def role(name,cap=100000):
 r=authority[name]
 assert type(r) is dict and set(r)=={'path','bytes','sha256'} and type(r['bytes']) is int and 0<r['bytes']<=cap
 raw=read_pin(pathlib.Path(r['path']),r['sha256'],cap);assert len(raw)==r['bytes'];return json.loads(raw)
review=role('sourceReview');protection=role('currentProtection');grant=role('actualGrant')
assert review['decision']=='ACCEPT_STATIC_M0_TYPES_COLLECTION_SOURCE_ONLY'
assert all(review['sourcePins'][k]['sha256']==v for k,v in expected.items())
launch_role=review['sourcePins']['LAUNCH.py']
launch_bytes=read_pin(P/'LAUNCH.py',launch_role['sha256'],250000)
assert launch_role['path']==str(P/'LAUNCH.py') and launch_role['bytes']==len(launch_bytes)
assert protection['schema']=='1370-root-current-m0-types-protection/v1' and protection['m0TypesProtectionAccepted'] is True
assert protection['productionHead']==config['operationalProductionHead'] and protection['productionSourceTree']==config['productionSourceTree']
assert protection['mirrorPath']==config['mirrorPath'] and protection['physicalFactsSha256']==config['sourceAuthorities']['m0PhysicalFacts']['sha256']
assert protection['completeM0AdoptionSha256']==config['sourceAuthorities']['m0CompleteParentAdoption']['sha256']
assert protection['fullProtectedPostflightAccepted'] is True and protection['soleLaneReleased'] is True
assert protection['freshSourceProof']==authority['freshSourceProof'] and protection['freshDependencyProof']==authority['freshDependencyProof']
assert protection['additionalRefs']==authority['additionalRefs']
assert grant['schema']=='1370-root-m0-types-execution-grant/v1' and grant['executionAuthorization'] is True
assert grant['contextWithoutGrantSha256']==hashlib.sha256(json.dumps({k:v for k,v in authority.items() if k!='actualGrant'},sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert grant['runId']==config['runId'] and grant['configSha256']==expected['CONFIG.json']
assert grant['sourceReviewSha256']==authority['sourceReview']['sha256'] and grant['currentProtectionSha256']==authority['currentProtection']['sha256']
assert grant['scope']=='M0_FOUR_COMMAND_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY' and grant['gameAuthorization'] is False
post_role=authority['postR6RootAdoption']
assert pathlib.Path(post_role['path']).is_relative_to(pathlib.Path('/Users/zacheryspector/studio-scratch')) and not pathlib.Path(post_role['path']).is_relative_to(pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-m0-observer-mirrors-20261009-r2'))
post=role('postR6RootAdoption');contract=config['postR6RootAdoptionContract']
assert post['schema']==contract['schema'] and post['status']==contract['status']
for name,wanted in [('currentRootBaselineQualified',True),('historicalRootUnchanged',False),
                    ('originalR6StopPreserved',True),('typesAccepted',False),('collectionAccepted',False)]:
 assert post[name] is wanted
assert post['knownRootDrift']==config['knownRootDrift'] and post['freshSourceProof']==authority['freshSourceProof'] and post['freshDependencyProof']==authority['freshDependencyProof']
assert post['freshSourceProof']['mirrorRootIdentity']==config['knownRootDrift']['recordedAfterIdentity']
assert post['freshSourceProof']['historicalRootSubstitutedMetadataSha256']==config['knownRootDrift']['historicalMetadataSha256'] and post['freshSourceProof']['nonrootMetadataSha256']==config['knownRootDrift']['nonrootMetadataSha256']
assert protection['postR6RootAdoptionSha256']==post_role['sha256']
assert grant['postR6RootAdoptionSha256']==post_role['sha256']
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
