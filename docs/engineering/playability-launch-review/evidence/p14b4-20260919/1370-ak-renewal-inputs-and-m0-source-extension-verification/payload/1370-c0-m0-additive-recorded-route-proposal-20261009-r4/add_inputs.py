#!/usr/bin/env python3
"""UNRUN held M0 additive input draft; no execution authority."""
import argparse,hashlib,json,os,pathlib,shutil,signal,stat,subprocess,sys,tarfile,time,selectors
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
MIRROR=S/'1370-c0-m0-observer-mirrors-20261009-r2/20261009-m0-types-r2'
OUT=S/'1370-c0-m0-additive-input-output-20261009-r2/RESULT.json'
INPUTS=S/'1370-c0-m0-additive-recorded-route-proposal-20261009-r3/INPUTS.json'
INPUTS_SHA='a9f50c1d0cb6ae54084becf514ed7908c41572050e0df19a50007e3a804ff881'
SOURCE='292d6fd3b5293fe2a520b681ae4c1dde997dc113'
HEAD='f0fb818fe7534c3e3784206d16728b015c7f059a'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF='refs/heads/wip/headless-program-20260916-ts'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
LANE_LOG='m0-additive-input-20261009-r2.lane.log'
WALL=180
START=time.monotonic()
ORIGINAL_DEADLINE=float(os.environ.get("ADDITIVE_ORIGINAL_DEADLINE", START+180))
PHASE_PATH=RESULT_PATH=None
PRE=3758096384
FLOOR=3221225472
MIRROR_FD=None
MIRROR_CHAIN=None
MIRROR_ID=None

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def remaining():
 n=ORIGINAL_DEADLINE-time.monotonic();need(n>1,'180-second addendum deadline');return n
def sha(raw):return hashlib.sha256(raw).hexdigest()
def attrs(x):return (x.st_dev,x.st_ino,x.st_mode,x.st_nlink,x.st_size,x.st_mtime_ns,x.st_ctime_ns)
def dir_id(x):return (x.st_dev,x.st_ino,x.st_mode)
def clean_env():return {k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
def scrub_ambient_git():
 for key in list(os.environ):
  if key.startswith('GIT_'):del os.environ[key]
def open_parent(path):
 need(path.is_absolute() and all(p not in ('','.','..') for p in path.parts[1:]),'unsafe absolute path')
 fd=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);chain=[]
 try:
  for part in path.parts[1:-1]:
   before=os.stat(part,dir_fd=fd,follow_symlinks=False)
   nextfd=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
   need(stat.S_ISDIR(before.st_mode) and dir_id(before)==dir_id(os.fstat(nextfd)),'parent traversal drift')
   chain.append((part,dir_id(before)));os.close(fd);fd=nextfd
  return fd,chain
 except BaseException:os.close(fd);raise
def same_parent(path,chain):
 fd,after=open_parent(path)
 try:need(after==chain,'parent pathname drift')
 finally:os.close(fd)
def attach_mirror():
 global MIRROR_FD,MIRROR_CHAIN,MIRROR_ID
 parent,chain=open_parent(MIRROR)
 try:
  before=os.stat(MIRROR.name,dir_fd=parent,follow_symlinks=False)
  fd=os.open(MIRROR.name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
  need(stat.S_ISDIR(before.st_mode) and dir_id(before)==dir_id(os.fstat(fd)),'mirror root open drift')
  MIRROR_FD=fd;MIRROR_CHAIN=chain;MIRROR_ID=dir_id(before)
 finally:os.close(parent)
 mirror_guard()
def mirror_guard():
 need(MIRROR_FD is not None,'mirror fd unattached')
 parent,chain=open_parent(MIRROR)
 try:
  need(chain==MIRROR_CHAIN and dir_id(os.fstat(MIRROR_FD))==MIRROR_ID and
       dir_id(os.stat(MIRROR.name,dir_fd=parent,follow_symlinks=False))==MIRROR_ID,'mirror parent/root pathname drift')
 finally:os.close(parent)
def read_pin(path,pin,cap):
 parent,chain=open_parent(path)
 try:
  before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap,'unsafe pinned file '+str(path))
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   need(attrs(before)==attrs(os.fstat(fd)),'pinned file open drift')
   chunks=[];count=0
   while part:=os.read(fd,65536):
    remaining();count+=len(part);need(count<=cap and count<=before.st_size,'pinned file grew beyond cap/preimage');chunks.append(part)
   raw=b''.join(chunks);after=os.fstat(fd);path_after=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
   need(attrs(before)==attrs(after)==attrs(path_after) and len(raw)==before.st_size,'pinned file read drift')
  finally:os.close(fd)
  same_parent(path,chain)
 finally:os.close(parent)
 need(sha(raw)==pin,'pinned file SHA drift '+str(path));return raw
def guard():
 remaining()
 if MIRROR_FD is not None:mirror_guard()
 lane=S/'HEAVY-LANE-LOCK'
 need(lane.is_file() and not lane.is_symlink() and LANE_LOG in lane.read_text(),'sole recorded lane')
 p=subprocess.run(['pmset','-g','batt'],capture_output=True,text=True,timeout=min(10,remaining()))
 need(p.returncode==0 and p.stdout.splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB floor')
def cmd(argv):
 guard();p=subprocess.run(argv,cwd=REPO,env=clean_env(),capture_output=True,timeout=remaining())
 need(p.returncode==0,'command failed '+repr(argv)+repr(p.stderr[-500:]));return p.stdout
def preflight_space():
 need(shutil.disk_usage(S).free>=PRE,'3.5 GiB preflight')

def bounded_blob(oid,expected):
 # All pipes bounded while reading, not after subprocess capture_output.
 guard();need(0<=expected<=1517743,'blob expected size cap')
 proc=subprocess.Popen(['git','cat-file','blob',oid],cwd=REPO,env=clean_env(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 selector=selectors.DefaultSelector();buffers={'stdout':bytearray(),'stderr':bytearray()}
 try:
  for name,pipe in [('stdout',proc.stdout),('stderr',proc.stderr)]:
   os.set_blocking(pipe.fileno(),False);selector.register(pipe,selectors.EVENT_READ,name)
  while selector.get_map():
   wait=min(.1,remaining())
   for key,_ in selector.select(wait):
    name=key.data;cap=expected if name=='stdout' else 4096
    # One extra byte detects overflow without accumulating it.
    chunk=os.read(key.fileobj.fileno(),min(65536,cap-len(buffers[name])+1))
    if not chunk:selector.unregister(key.fileobj);continue
    need(len(buffers[name])+len(chunk)<=cap,'blob '+name+' cap')
    buffers[name].extend(chunk)
  need(proc.wait(timeout=remaining())==0,'blob child exit')
  need(not buffers['stderr'],'blob stderr')
  need(len(buffers['stdout'])==expected,'blob truncated')
  return bytes(buffers['stdout'])
 except BaseException:
  if proc.poll() is None:proc.kill()
  proc.wait(timeout=1)
  raise
 finally:
  selector.close();proc.stdout.close();proc.stderr.close()

def source_guard():
 need(cmd(['git','rev-parse','HEAD']).strip().decode()==HEAD,'production HEAD')
 need(cmd(['git','rev-parse','HEAD:src']).strip().decode()==TREE,'production src')
 need(cmd(['git','status','--porcelain=v1'])==b'','production dirty')
 need(cmd(['git','remote','get-url','origin']).strip().decode()==ORIGIN,'production origin URL')
 need(cmd(['git','config','--get','remote.origin.url']).strip().decode()==ORIGIN,'production origin config')
 need(cmd(['git','ls-remote','origin',REF]).strip().decode()==HEAD+'\t'+REF,'production remote')


def relative_fd(parts):
 mirror_guard();fd=os.dup(MIRROR_FD)
 try:
  for part in parts:
   need(part not in ('','.','..') and '/' not in part,'unsafe component')
   nextfd=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd);os.close(fd);fd=nextfd
  return fd
 except BaseException:os.close(fd);raise

def check_old(facts):
 # Read all existing admitted files through stable dirfds. Never change their metadata.
 need(len(facts['materializedFiles'])==1677 and sum(r['bytes'] for r in facts['materializedFiles'].values())==117875377,'prior count')
 for name,row in sorted(facts['materializedFiles'].items()):
  guard();parts=pathlib.PurePosixPath(name).parts;parent=relative_fd(parts[:-1])
  try:
   before=os.stat(parts[-1],dir_fd=parent,follow_symlinks=False);mode=stat.S_IMODE(before.st_mode)
   observed=[before.st_dev,before.st_ino,mode,before.st_nlink,before.st_size,before.st_mtime_ns,before.st_ctime_ns]
   need(observed==row['identity'] and stat.S_ISREG(before.st_mode),'old file metadata drift')
   fd=os.open(parts[-1],os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
   try:
    need(attrs(os.fstat(fd))==attrs(before),'old open drift');h=hashlib.sha256();count=0
    while b:=os.read(fd,65536):remaining();count+=len(b);need(count<=row['bytes'],'old grew');h.update(b)
    need(count==row['bytes'] and h.hexdigest()==row['sha256'],'old bytes changed')
    need(attrs(os.fstat(fd))==attrs(before)==attrs(os.stat(parts[-1],dir_fd=parent,follow_symlinks=False)),'old read drift')
   finally:os.close(fd)
  finally:os.close(parent)
 mirror_guard()

def exact_roster(expected_files,expected_dirs,link=False):
 # Finite mirror-only enumeration; never follows dependency link.
 found=set();dirs={'.'};special=set()
 def walk(fd,prefix):
  for name in sorted(os.listdir(fd)):
   guard();rel=prefix+'/'+name if prefix else name;st=os.stat(name,dir_fd=fd,follow_symlinks=False)
   if stat.S_ISDIR(st.st_mode):
    need(rel in expected_dirs,'extra directory');dirs.add(rel);child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
    try:walk(child,rel)
    finally:os.close(child)
   elif stat.S_ISREG(st.st_mode):need(rel in expected_files,'extra file');found.add(rel)
   else:
    need(link and rel=='node_modules' and stat.S_ISLNK(st.st_mode),'extra special path')
    need(os.readlink(name,dir_fd=fd)==str(REPO/'node_modules'),'dependency target drift');special.add(rel)
 walk(MIRROR_FD,'');need(found==set(expected_files) and dirs==set(expected_dirs),'incomplete roster')
 need(special==({'node_modules'} if link else set()),'dependency link missing or unexpected')

def dependency_preflight(inputs):
 # Version/lock input admission only. No Node launch, install, generator or whole dependency inventory.
 need((REPO/'node_modules').resolve(strict=True)==REPO/'node_modules','dependency root must be physical')
 for r in inputs['dependencyPackages']:
  b=read_pin(pathlib.Path(r['path']),r['sha256'],1000000);a=json.loads(b)
  need(a['name']==r['name'] and a['version']==r['version'],'installed version drift')
 return attrs((REPO/'node_modules').lstat())

def add(inputs,facts):
 preflight_space()
 olddirs=facts['materializedDirectoryIdentities'];rootbefore=attrs(os.fstat(MIRROR_FD))
 for name in olddirs:
  fd=relative_fd(() if name=='.' else pathlib.PurePosixPath(name).parts)
  try:
   st=os.fstat(fd);need([st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]==olddirs[name],'old directory metadata drift')
  finally:os.close(fd)
 exact_roster(facts['materializedFiles'],olddirs);check_old(facts)
 for name in ['bridge','node_modules']:
  try:os.stat(name,dir_fd=MIRROR_FD,follow_symlinks=False)
  except FileNotFoundError:pass
  else:raise RuntimeError('additive path exists')
 depsbefore=dependency_preflight(inputs);rows=inputs['bridge']['files'];need(len(rows)==63 and sum(r['bytes'] for r in rows)==1517743,'bridge counts')
 need(cmd(['git','rev-parse',SOURCE+':bridge']).strip().decode()==inputs['bridge']['bridgeTree'],'bridge tree drift')
 listing=[]
 for rec in cmd(['git','ls-tree','-rl','-z',SOURCE,'bridge']).split(b'\0'):
  if rec:
   head,name=rec.split(b'\t',1);mode,kind,oid,size=head.decode().split();listing.append({'path':name.decode(),'mode':mode,'kind':kind,'oid':oid,'bytes':int(size)})
 need(listing==[{k:r[k] for k in ['path','mode','kind','oid','bytes']} for r in rows],'bridge roster drift')
 # Authenticate all63 blobs before the first write; bounded1,517,743 total.
 blobs={}
 for r in rows:
  need(r['mode']=='100644' and r['kind']=='blob','unsupported bridge mode');b=bounded_blob(r['oid'],r['bytes'])
  need(len(b)==r['bytes'] and sha(b)==r['sha256'] and hashlib.sha1(('blob '+str(len(b))+'\0').encode()+b).hexdigest()==r['oid'],'bridge blob drift');blobs[r['path']]=b
 bridge_dirs={'bridge'}
 for r in rows:
  parts=pathlib.PurePosixPath(r['path']).parts;need(parts[0]=='bridge' and '..' not in parts,'bridge path')
  for i in range(1,len(parts)):bridge_dirs.add('/'.join(parts[:i]))
 preflight_space() # Recheck3.5GiB immediately before first exclusive write.
 publish_phase(rootbefore)
 for name in sorted(bridge_dirs,key=lambda n:(n.count('/'),n)):
  parts=pathlib.PurePosixPath(name).parts;fd=relative_fd(parts[:-1])
  try:os.mkdir(parts[-1],0o700,dir_fd=fd);os.fsync(fd)
  finally:os.close(fd)
 written=[]
 for r in rows:
  guard();parts=pathlib.PurePosixPath(r['path']).parts;parent=relative_fd(parts[:-1])
  try:
   fd=os.open(parts[-1],os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o644,dir_fd=parent)
   try:
    view=memoryview(blobs[r['path']])
    while view:view=view[os.write(fd,view):]
    os.fchmod(fd,0o644);os.fsync(fd);st=os.fstat(fd);need(st.st_nlink==1 and st.st_size==r['bytes'] and attrs(st)==attrs(os.stat(parts[-1],dir_fd=parent,follow_symlinks=False)),'write identity')
   finally:os.close(fd)
   os.fsync(parent)
  finally:os.close(parent)
  written.append(r['path'])
 need(dependency_preflight(inputs)==depsbefore,'dependency target changed')
 os.symlink(str(REPO/'node_modules'),'node_modules',dir_fd=MIRROR_FD);os.fsync(MIRROR_FD)
 check_old(facts);exact_roster([*facts['materializedFiles'],*written],[*olddirs,*bridge_dirs],True)
 for r in rows:need(sha(read_pin(MIRROR/r['path'],r['sha256'],1000000))==r['sha256'],'bridge readback')
 for name in olddirs:
  if name=='.':continue
  fd=relative_fd(pathlib.PurePosixPath(name).parts)
  try:
   st=os.fstat(fd);need([st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]==olddirs[name],'old directory changed')
  finally:os.close(fd)
 source_guard();guard();need(dependency_preflight(inputs)==depsbefore,'dependency changed postflight')
 return {'status':'ADDITIVE_SOURCE_INPUTS_PENDING_INDEPENDENT_EXPANDED_READBACK','regularFiles':1740,'regularBytes':119393120,'originalFilesUnchanged':1677,'bridgeFiles':63,'bridgeBytes':1517743,'rootBefore':rootbefore,'rootAfter':attrs(os.fstat(MIRROR_FD)),'intentionalRootTransition':['bridge directory','node_modules symlink'],'dependencyTargetIdentity':depsbefore,'typesReady':False,'gameAccepted':False}

def durable(path,payload):
 encoded=(json.dumps(payload,sort_keys=True)+"\n").encode();need(len(encoded)<=100000,'body result cap')
 parent,chain=open_parent(path)
 try:
  fd=os.open(path.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
  with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
  os.fsync(parent);same_parent(path,chain)
 finally:os.close(parent)
 return sha(encoded)

def publish_phase(rootbefore):
 need(PHASE_PATH is not None,'recorded first-write phase role required');mirror_guard()
 durable(PHASE_PATH,{'status':'ORIGINAL_PREFLIGHT_COMPLETE_FIRST_WRITE_ALLOWED','rootBefore':rootbefore,'originalFiles':1677,'originalBytes':117875377,'copyFactsSha256':'e46dcc9cf81f7ce3462e1cdd34618f37f68ac75a90d5f95f112ee93966e96bfe','mirrorPath':str(MIRROR),'pid':os.getpid()})

def body_authority(binding):
 excluded={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
 canonical=lambda value:json.dumps(value,sort_keys=True,separators=(',',':')).encode()
 semantic=sha(canonical({k:v for k,v in binding.items() if k not in excluded}))
 exact=json.loads(read_pin(pathlib.Path(binding['exactBindingReviewPath']),binding['exactBindingReviewSha256'],100000))
 source=json.loads(read_pin(pathlib.Path(binding['materializerSourceReviewPath']),binding['materializerSourceReviewSha256'],100000))
 preflight=json.loads(read_pin(pathlib.Path(binding['preflightReviewPath']),binding['preflightReviewSha256'],100000))
 core=sha(canonical({k:v for k,v in binding.items() if k not in excluded|{'preflightReviewPath','preflightReviewSha256'}}))
 need(exact.get('decision')=='ACCEPT_EXACT_FILLED_UNRUN' and exact.get('bindingSemanticSha256')==semantic,'body exact review semantic authority')
 need(source.get('decision')=='ACCEPT_SOURCE_ONLY_UNRUN_ADDITIVE_RECORDED_ROUTE' and source.get('sourceSha256')==binding['materializerSha256'],'body source review authority')
 need(preflight.get('decision')=='ACCEPT_M0_ADDITIVE_PREFLIGHT' and preflight.get('guardCoreSha256')==core and preflight.get('productionHead')==HEAD and preflight.get('freshProductionCommonFullProofAccepted') is True and preflight.get('r9PrivateRootReuseExplicitlyAccepted') is True,'body fresh operational guard authority')

def main():
 global PHASE_PATH,RESULT_PATH,LANE_LOG
 need(len(sys.argv)==2 and os.environ.get('ADDITIVE_ORIGINAL_DEADLINE'),'external original180 deadline required')
 need(ORIGINAL_DEADLINE<=START+180 and ORIGINAL_DEADLINE>START,'invalid or expired original child deadline')
 signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('original child180 deadline')))
 signal.setitimer(signal.ITIMER_REAL,ORIGINAL_DEADLINE-time.monotonic()) # Never reset to180.
 bindingpath=pathlib.Path(sys.argv[1]);binding=json.loads(read_pin(bindingpath,os.environ['ADDITIVE_BINDING_SHA'],128*1024))
 need(binding.get('executionAuthorization') is True and binding.get('status')=='REVIEWED_FILLED_UNRUN','held body requires exact adopted binding')
 body_authority(binding)
 need(binding.get('mirrorPath')==str(MIRROR) and binding.get('materializerSha256')==sha(pathlib.Path(__file__).read_bytes()),'body exact source/mirror mismatch')
 PHASE_PATH=pathlib.Path(binding['phaseReceiptPath']);RESULT_PATH=pathlib.Path(binding['additiveReceiptPath']);LANE_LOG=binding['helperLogName']
 need(PHASE_PATH.parent==RESULT_PATH.parent==pathlib.Path(binding['outputRoot']),'bound external receipt parents')
 inputs=json.loads(read_pin(INPUTS,INPUTS_SHA,100000));roles=inputs['roles']
 for r in roles.values():read_pin(pathlib.Path(r['path']),r['sha256'],2000000)
 copy=json.loads(read_pin(pathlib.Path(roles['copyReceipt']['path']),roles['copyReceipt']['sha256'],100000));parent=json.loads(read_pin(pathlib.Path(roles['copyParentAdoption']['path']),roles['copyParentAdoption']['sha256'],100000))
 need(copy['decision']=='ACCEPT_OBSERVED_M0_SOURCE_ONLY_MATERIALIZATION_COPY' and parent['decision']=='ADOPT_OBSERVED_M0_SOURCE_ONLY_COPY_AND_FULL_POSTFLIGHT','original copy not admitted')
 facts=json.loads(read_pin(pathlib.Path(roles['copyFacts']['path']),roles['copyFacts']['sha256'],2000000))
 result={'status':'STOP_PARTIAL_ADDITIVE_INPUTS','mirrorPath':str(MIRROR),'sourceCommit':SOURCE,'sourceTree':TREE,'inputsSha256':INPUTS_SHA,'childPid':os.getpid(),'originalDeadline':ORIGINAL_DEADLINE}
 failure=None
 try:
  guard();source_guard();attach_mirror();result.update(add(inputs,facts));remaining();mirror_guard()
 except BaseException as exc:
  failure=exc;result['failure']=str(exc) or repr(exc);result['status']='STOP_PARTIAL_ADDITIVE_INPUTS'
 finally:
  if MIRROR_FD is not None:
   try:mirror_guard();result['rootFinal']=attrs(os.fstat(MIRROR_FD))
   except BaseException as exc:failure=failure or exc;result['failure']=str(exc) or repr(exc);result['status']='STOP_PARTIAL_ADDITIVE_INPUTS'
  if time.monotonic()>=ORIGINAL_DEADLINE:failure=failure or TimeoutError('late child finalization');result['status']='STOP_PARTIAL_ADDITIVE_INPUTS';result['failure']='original deadline through result'
  result['elapsedSeconds']=time.monotonic()-START;result['partialMirrorPreserved']=True
  digest=durable(RESULT_PATH,result)
  if MIRROR_FD is not None:os.close(MIRROR_FD)
 if failure:raise failure
 remaining();print(json.dumps({'status':result['status'],'receiptSha256':digest,'mirrorPath':str(MIRROR)},sort_keys=True),flush=True);remaining()
 signal.setitimer(signal.ITIMER_REAL,0)
if __name__=='__main__':
 try:main()
 except BaseException as exc:print('STOP_ADDITIVE '+(str(exc) or repr(exc)),file=sys.stderr,flush=True);sys.exit(2)
