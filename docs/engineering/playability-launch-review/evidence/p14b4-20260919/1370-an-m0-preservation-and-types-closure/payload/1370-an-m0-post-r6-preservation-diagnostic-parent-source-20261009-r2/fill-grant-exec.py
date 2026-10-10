#!/usr/bin/env python3
# Parent-owned once-only binding/emission under the already acquired reviewed lane.
# Source-only until parent supplies a genuine filled specification and invokes it.
import hashlib,json,os,pathlib,signal,stat,sys,time
PREP_START=time.monotonic()
def prep_alarm(*_):raise TimeoutError("60-second parent context preparation deadline")
signal.signal(signal.SIGALRM,prep_alarm)
signal.setitimer(signal.ITIMER_REAL,60)
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
HERE=pathlib.Path(__file__).resolve().parent
PROFILE_SHA='640814ab17810d46dd47f5653cc9ef961823a1674ec1d2d2f38bcb2a274cd9e0'
CAP=128*1024*1024

def require(ok,msg):
 if not ok:raise RuntimeError('STOP_PARENT_FILL_'+msg)
def stamp(v):return (v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
def normalized(v):return [v.st_dev,v.st_ino,stat.S_IMODE(v.st_mode),v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns]
def physical(path):
 p=pathlib.Path(path);require(p.is_absolute() and p.resolve(strict=True)==p,'PHYSICAL_PATH')
 before=p.lstat();require(stat.S_ISREG(before.st_mode) and before.st_nlink==1,'REGULAR_SINGLE_LINK')
 return p,before
def read(path,cap):
 p,before=physical(path);require(0<=before.st_size<=cap,'READ_CAP')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(stamp(os.fstat(fd))==stamp(before),'OPEN_STAMP');chunks=[];count=0
  while True:
   b=os.read(fd,65536)
   if not b:break
   count+=len(b);require(count<=cap and count<=before.st_size,'STREAM_CAP');chunks.append(b)
  require(count==before.st_size and stamp(os.fstat(fd))==stamp(before)==stamp(p.lstat()),'READ_STAMP')
  return b''.join(chunks),before
 finally:os.close(fd)
def digest(b):return hashlib.sha256(b).hexdigest()
def pin(role,cap=1024*1024):
 require(type(role) is dict and set(role)=={'path','bytes','sha256'} and type(role['bytes']) is int and 0<role['bytes']<=cap,'ROLE_SCHEMA')
 b,st=read(role['path'],cap);require(len(b)==role['bytes'] and digest(b)==role['sha256'],'ROLE_BYTES_HASH');return b

def durable(parent,name,row):
 raw=(json.dumps(row,sort_keys=True,indent=2)+'\n').encode();require(len(raw)<=128*1024,'WRITE_CAP')
 p=parent/name;fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 try:
  os.fchmod(fd,0o600);view=memoryview(raw)
  while view:view=view[os.write(fd,view):]
  os.fsync(fd)
 finally:os.close(fd)
 actual,_=read(p,128*1024);require(actual==raw,'WRITE_READBACK')
 return {'path':str(p),'bytes':len(raw),'sha256':digest(raw)}

def main():
 require(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize,'PYTHON_I_B')
 require(len(sys.argv)==3,'SPEC_PATH_SHA')
 specpath=pathlib.Path(sys.argv[1]);require(specpath.is_absolute() and specpath.is_relative_to(S),'EXTERNAL_SCRATCH_SPEC')
 raw,_=read(specpath,128*1024);require(digest(raw)==sys.argv[2],'SPEC_SHA');spec=json.loads(raw)
 require(spec['schema']=='1370-root-m0-parent-fill-launch-spec/v1' and spec['executionAuthorization'] is True,'REAL_PARENT_GRANT_SPEC_REQUIRED')
 pr,_=read(HERE/'PROFILES.json',128*1024);require(digest(pr)==PROFILE_SHA,'PROFILES_SHA');profiles=json.loads(pr)
 require(spec['mode'] in profiles,'EXACT_MODE');p=profiles[spec['mode']]
 cfg=json.loads(pin(p['config']));pin(p['sourcePins'])
 for r in p['executableRoles'].values():pin(r)
 accepted=json.loads(pin(spec['sourceReview']));require(accepted['decision']==p['sourceReviewDecision'],'SOURCE_REVIEW_DECISION')
 for name,r in dict(p['executableRoles'],**{'CONFIG.json':p['config']}).items():require(accepted['sourcePins'][name]==r,'SOURCE_REVIEW_EXACT_ROLE')
 require(cfg['runId']==p['runId'] and cfg['mirrorPath']==p['mirrorPath'] and cfg['laneLog']==p['laneLog'],'CONFIG_PATHS')
 require(cfg['operationalProductionHead']=='7087f116cf998fd86e33fb8e004df628e0686dbd' and cfg['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','CURRENT_AM_SCOPE')
 require(cfg['mainOid']=='c902a704eb948cc576083d0973c8c23e59937dc1' and cfg['localMainRef']=='refs/remotes/origin/main' and cfg['mainRef']=='refs/heads/main','DISTINCT_MAIN_ROLES')
 # Recorded identity is durable before GO/exec and remains the same in LAUNCH.py.
 if os.getpgrp()!=os.getpid():os.setsid()
 require(os.getpgrp()==os.getpid() and os.getsid(0)==os.getpid(),'OWNED_SESSION')
 parent=pathlib.Path(p['parentPath']);require(parent.parent==S,'EXACT_PARENT')
 parent.mkdir(mode=0o700,exist_ok=True);require(parent.resolve(strict=True)==parent and not parent.is_symlink() and stat.S_ISDIR(parent.lstat().st_mode),'PARENT_PHYSICAL')
 require(not any(os.path.lexists(parent/n) for n in ['OWNED-IDENTITY.json','EXECUTION-CONTEXT.json','EXECUTION-GRANT.json','FILL-RESULT.json']),'ONCE_ONLY_ABSENT')
 owned=durable(parent,'OWNED-IDENTITY.json',{'schema':'1370-root-m0-parent-owned-exec-identity/v1','pid':os.getpid(),'pgid':os.getpgrp(),'sid':os.getsid(0),'mode':spec['mode'],'specPath':str(specpath),'specSha256':sys.argv[2],'numericIdentityReuseCaveat':True,'preparationStartMonotonic':PREP_START,'preparationDeadlineSeconds':60})
 tools=spec['runtimeTools'];require(type(tools) is dict and set(tools)=={'node','python','rootCompilerWrapper','uiCompilerWrapper','collectionWrapper'},'FIVE_GENUINE_TOOLS')
 for name,r in tools.items():
  require(set(r)=={'invokedPath','physicalPath','bytes','sha256','physicalIdentity','links'} and type(r['bytes']) is int and 0<r['bytes']<=CAP,'TOOL_SCHEMA')
  body,st=read(r['physicalPath'],CAP);require(len(body)==r['bytes'] and digest(body)==r['sha256'] and normalized(st)==r['physicalIdentity'],'TOOL_PHYSICAL_ROLE')
  require(type(r['physicalIdentity']) is list and len(r['physicalIdentity'])==7 and all(type(v) is int for v in r['physicalIdentity']),'TOOL_IDENTITY_TYPES')
  require(type(r['links']) is list and len(r['links'])<=40,'LINK_ROSTER')
  for link in r['links']:
   require(set(link)=={'path','identity','target'},'LINK_SCHEMA');st=pathlib.Path(link['path']).lstat()
   require(stat.S_ISLNK(st.st_mode) and normalized(st)==link['identity'] and os.readlink(link['path'])==link['target'],'EXACT_LINK_ROLE')
   require(stamp(st)==stamp(pathlib.Path(link['path']).lstat()),'LINK_STAMP')
  require(pathlib.Path(r['invokedPath']).resolve(strict=True)==pathlib.Path(r['physicalPath']),'TOOL_ALIAS')
 require(tools['node']['invokedPath']=='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node' and tools['node']['sha256']=='0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6','EXACT_NODE22')
 require(tools['python']['invokedPath']=='/usr/local/bin/python3' and tools['python']['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835','EXACT_PYTHON')
 compiler=str(pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')/'node_modules'/'.bin'/('t'+'sc'))
 collector=str(pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')/'node_modules'/'.bin'/('vi'+'test'))
 require(tools['rootCompilerWrapper']['invokedPath']==compiler==tools['uiCompilerWrapper']['invokedPath'] and tools['collectionWrapper']['invokedPath']==collector,'EXACT_WRAPPER_NAMES')
 lock=S/'HEAVY-LANE-LOCK';lockraw,lockst=read(lock,10000)
 require(lockraw.startswith(('lane-run '+p['laneLog']+' token=').encode()) and lockraw.endswith(b'\n') and lockraw.count(b'\n')==1,'EXACT_HELPER_LOCK')
 lockrole={'path':str(lock),'bytes':len(lockraw),'sha256':digest(lockraw)}
 # No future proof/protection is consumed by proof-only execution.
 protection=spec['currentProtection'];source=None;deps=None;additional=spec['additionalRefs']
 require(type(additional) is dict,'ADDITIONAL_REFS_MAP')
 if spec['mode']=='proof':require(protection is None,'PROOF_PROTECTION_NULL')
 else:
  prot=json.loads(pin(protection));require(prot['schema']=='1370-root-current-m0-types-protection/v1' and prot['m0TypesProtectionAccepted'] is True,'ACTUAL_TYPES_PROTECTION')
  require(prot['productionHead']==cfg['operationalProductionHead'] and prot['productionSourceTree']==cfg['productionSourceTree'] and prot['mirrorPath']==cfg['mirrorPath'],'PROTECTION_CURRENT_SCOPE')
  require(prot['physicalFactsSha256']==cfg['sourceAuthorities']['m0PhysicalFacts']['sha256'] and prot['completeM0AdoptionSha256']==cfg['sourceAuthorities']['m0CompleteParentAdoption']['sha256'],'PROTECTION_HISTORICAL_LINKS')
  require(prot['fullProtectedPostflightAccepted'] is True and prot['soleLaneReleased'] is True and prot['additionalRefs']==additional,'PROTECTION_ACTUAL_POSTFLIGHT')
  source=prot['freshSourceProof'];deps=prot['freshDependencyProof'];require(type(source) is dict and type(deps) is dict,'OBSERVED_PLAIN_PROOF_OBJECTS')
 diagnostic=spec['diagnosticInputs'];require(type(diagnostic) is dict and set(diagnostic)=={'controlsObservedReview','controlsRootAdoption','currentAMFullPreflight','currentAMFullPreflightAdoption'},'EXACT_DIAGNOSTIC_INPUT_ROLES')
 for name,r in diagnostic.items():pin(r,16*1024*1024 if name=='currentAMFullPreflight' else 128*1024)
 context={'schema':p['contextSchema'],'configSha256':p['config']['sha256'],'runId':p['runId'],'mirrorPath':p['mirrorPath'],'sourceReview':spec['sourceReview'],'diagnosticInputs':diagnostic,'currentProtection':protection,'freshSourceProof':source,'freshDependencyProof':deps,'additionalRefs':additional,'runtimeTools':tools,'laneLock':lockrole,'executionAuthorization':False}
 ungranted=digest(json.dumps(context,sort_keys=True,separators=(',',':')).encode())
 grant={'schema':p['grantSchema'],'executionAuthorization':True,'contextWithoutGrantSha256':ungranted,'runId':p['runId'],'configSha256':p['config']['sha256'],'sourceReviewSha256':spec['sourceReview']['sha256'],'scope':p['grantScope'],'gameAuthorization':False,'parentIssuedViaReviewedOnceOnlyLauncher':True,'parentSpecSha256':sys.argv[2],'ownedIdentity':owned}
 if spec['mode']=='types':grant['currentProtectionSha256']=protection['sha256']
 gr=durable(parent,'EXECUTION-GRANT.json',grant);context['actualGrant']=gr;cr=durable(parent,'EXECUTION-CONTEXT.json',context)
 require(digest(json.dumps({k:v for k,v in context.items() if k!='actualGrant'},sort_keys=True,separators=(',',':')).encode())==ungranted,'ACYCLIC_GRANT_DIGEST')
 require(stamp(lock.lstat())==stamp(lockst) and read(lock,10000)[0]==lockraw,'LOCK_REBOUND_READBACK')
 argv=[tools['python']['physicalPath'],'-I','-B',p['executableRoles']['LAUNCH.py']['path'],cr['path'],cr['sha256']]
 durable(parent,'FILL-RESULT.json',{'schema':'1370-root-m0-recorded-context-fill-result/v1','status':'ACTUAL_BINDINGS_WRITTEN_EXECUTION_NOT_YET_MEASURED','mode':spec['mode'],'sourceReview':spec['sourceReview'],'context':cr,'grant':gr,'ownedIdentity':owned,'laneLock':lockrole,'runtimeTools':tools,'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','proofOrTypesAccepted':False,'preparationStartMonotonic':PREP_START,'preparationElapsedSeconds':time.monotonic()-PREP_START,'preparationDeadlineSeconds':60,'runtimeBoundsSeconds':{'runner':300,'active':320,'whole':330},'runtimeClockStartsInsideUnchangedLAUNCH':True,'combinedPreparationRuntimeDeadline':None})
 print(json.dumps({'status':'PARENT_CONTEXT_GRANT_WRITTEN_BEFORE_EXEC','pid':os.getpid(),'pgid':os.getpgrp(),'sid':os.getsid(0),'context':cr,'grant':gr}),flush=True)
 os.chdir('/Users/zacheryspector/The-Movies-headless-program')
 env=dict(os.environ);env.pop('NODE_OPTIONS',None);env.pop('NODE_PATH',None);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin:/usr/sbin:/sbin';env['PYTHONDONTWRITEBYTECODE']='1'
 prep_elapsed=time.monotonic()-PREP_START
 require(0<=prep_elapsed<60,'PREPARATION_DEADLINE')
 signal.setitimer(signal.ITIMER_REAL,0)
 os.execve(argv[0],argv,env)

if __name__=='__main__':
 try:main()
 except BaseException as error:
  print(json.dumps({'status':'STOP_PARENT_CONTEXT_FILL_LAUNCH','error':repr(error)}),file=sys.stderr,flush=True);raise
