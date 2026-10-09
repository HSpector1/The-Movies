#!/usr/bin/env python3
"""UNRUN held M0 additive input draft; no execution authority."""
import argparse,hashlib,json,os,pathlib,shutil,signal,stat,subprocess,sys,tarfile,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
MIRROR=S/'1370-c0-m0-observer-mirrors-20261009-r2/20261009-m0-types-r2'
OUT=S/'1370-c0-m0-additive-input-output-20261009-r1/RESULT.json'
INPUTS=S/'1370-c0-m0-additive-bridge-dependency-proposal-20261009-r1/INPUTS.json'
INPUTS_SHA='cccd58d0d990767a197996f533237995b19548fdd080c24afb245c0bb0df490d'
SOURCE='292d6fd3b5293fe2a520b681ae4c1dde997dc113'
HEAD='282f8477e61a33bd5ec4a571b934829490adef73'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF='refs/heads/wip/headless-program-20260916-ts'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
LANE_LOG='m0-additive-input-20261009-r1.lane.log'
WALL=180
START=time.monotonic()
PRE=3758096384
FLOOR=3221225472
MIRROR_FD=None
MIRROR_CHAIN=None
MIRROR_ID=None

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def remaining():
 n=WALL-(time.monotonic()-START);need(n>1,'180-second addendum deadline');return n
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
 found=set();dirs={'.'}
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
    need(os.readlink(name,dir_fd=fd)==str(REPO/'node_modules'),'dependency target drift')
 walk(MIRROR_FD,'');need(found==set(expected_files) and dirs==set(expected_dirs),'incomplete roster')

def dependency_preflight(inputs):
 # Version/lock input admission only. No Node launch, install, generator or whole dependency inventory.
 need((REPO/'node_modules').resolve(strict=True)==REPO/'node_modules','dependency root must be physical')
 for r in inputs['dependencyPackages']:
  b=read_pin(pathlib.Path(r['path']),r['sha256'],1000000);a=json.loads(b)
  need(a['name']==r['name'] and a['version']==r['version'],'installed version drift')
 return attrs((REPO/'node_modules').lstat())

def add(inputs,facts):
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
  need(r['mode']=='100644' and r['kind']=='blob','unsupported bridge mode');b=cmd(['git','cat-file','blob',r['oid']])
  need(len(b)==r['bytes'] and sha(b)==r['sha256'] and hashlib.sha1(('blob '+str(len(b))+'\0').encode()+b).hexdigest()==r['oid'],'bridge blob drift');blobs[r['path']]=b
 bridge_dirs={'bridge'}
 for r in rows:
  parts=pathlib.PurePosixPath(r['path']).parts;need(parts[0]=='bridge' and '..' not in parts,'bridge path')
  for i in range(1,len(parts)):bridge_dirs.add('/'.join(parts[:i]))
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

def main():
 # r1 is deliberately held. Fresh guards/exact authenticated outer launch are missing roles;
 # changing these placeholders requires a versioned independently reviewed exact fill.
 inputs=json.loads(read_pin(INPUTS,INPUTS_SHA,100000));need(inputs['executionAuthorization'] is True,'HELD_UNRUN_NO_EXECUTION_AUTHORITY')
 need(inputs['freshQualifiedProductionCommonGuard'] is not None and inputs['independentExactLaunchReview'] is not None,'missing fresh operational guards/exact launch')
 raise RuntimeError('HELD_R1_REQUIRES_REVIEWED_EXACT_LAUNCH_ADAPTATION')
if __name__=='__main__':main()
