#!/usr/bin/env python3
"""UNRUN proposal: H full-era dependency, types and diagnostic collection only."""
import argparse, hashlib, json, math, os, pathlib, re, selectors, shutil, signal, stat, subprocess, sys, time, traceback
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
OUT_ROOT=S/'1370-c0-h-typecheck-collection-results-r12'
MIRROR_ROOT=S/'1370-c0-h-m0-observer-mirrors-r2'
CAPTURE_HEAD='9651546af98c44f04e8b6b2714d10d67dadb8f9c'  # historical receipt identity
CURRENT_HEAD='afea5fb6abba09bec6cada7e4c5a1ccfaf05caff'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF='refs/heads/wip/headless-program-20260916-ts'
H_COMMIT='8708d6a98e6eb4ad53e3a54e431c4b40b974f79d'
H_TREE='0ee21d8179977aaa0726ffb5d1b2bb2568c9df97'
MANIFEST_SHA='e2f92aa60063b754f110ec31f08080bfd461f6a150f74394464739c2d4cab7ff'
REVIEW_SHA='5e6f23884af9527f991665020414404455f182cc3a62abe5a5602bb019804dbf'
LOCK_SHA='728ee1693d3d4f33d04fc731264e442cb5f00e922fb36943aee9db9bf2e7c5de'
BRIDGE_TREE='a697b042eccb85adacd40ef1303869be6d26239a'
BRIDGE_SOURCE_SHA='659b5a436fd874df8485cba90e3e1b5d5847e02f21f3b2dcc27c21e555a5785f'
BRIDGE_OBSERVED_SHA='f2baf6d6f44b3582f3a70384c1c3acae2a328de254101dad076d428c9ea57a9d'
OLD_TYPE_STOP_SHA='6c8e310bca8d581a479ffda929b3edad83670c5bdb52c2ef45b419e4953f0f4d'
OLD_TYPE_RESULT_SHA='3eb6294278eda61893738cdc1ee5b6a80c44ced5a3cd9fd7197511bbb6198216'
R10_STATIC_REFINE_SHA='dcd6d7bc1315e5a3322b65b3b3de425b1ea8c92755adc452c74e69cd4aac0350'
R11_OBSERVED_STOP_SHA='9b8e6587d415db0d0bbd12ecdff3d67eeb87b39928d70b84baed8ad61600cbb0'
R11_RESULT_SHA='e701188970a432296f850369b5cc72dfd4ce1745692fc3154f7ed7c3d9a5e45c'
EVIDENCE_REF='refs/heads/evidence/1370-r10-clean-captures'
CAPTURE_EVIDENCE_TIP='fe9e8a7d84da164e9a413dc2c3efe49f529c2a78'  # historical receipt identity
CURRENT_EVIDENCE_TIP='6516532ac67ffcafc66fd424abb89bc1bc0acc2e'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
MAX_CHILD_LOG=8*1024*1024
MAX_COLLECTION=1*1024*1024
MAX_RESULT=128*1024
# Pending full 1,402-file observed readback digest/receipt are mandatory filled binding fields.

DEPS_CHECK_SHA='e61f6a88614eac49fcec3f326c162e4d44d75ea2999b6751581e30e7685b6a64'
NODE='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
WALL=300
FLOOR=3*1024**3
PREFLIGHT=int(3.5*1024**3)
START=globals().get('_BOOTSTRAP_START')
CURRENT=None
GROUP_ALTERNATE_PROOFS=[]
def stop_current():
 global CURRENT
 proc=CURRENT;CURRENT=None
 if proc is None:return
 stop_group(proc)
def on_signal(signum,_frame):
 stop_current()
 raise InterruptedError('runner interrupted by signal '+str(signum))

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def remaining():
 need(type(START) in (int,float) and math.isfinite(float(START)),
      'invalid authenticated child start')
 elapsed=time.monotonic()-START
 need(math.isfinite(elapsed) and 0<=elapsed<WALL,'300-second whole-child deadline')
 return WALL-elapsed
# The recorder's SHA-authenticated bootstrap supplies START and arms the same 300s limit.
remaining()
def fields(st):
 return st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns

def open_dir_chain(path):
 need(path.is_absolute(),'absolute directory path')
 held=[os.open('/',os.O_RDONLY|os.O_DIRECTORY)]
 try:
  for name in path.parts[1:]:
   parent=held[-1]
   need(name not in ('','.','..'),'unsafe directory component')
   before=os.stat(name,dir_fd=parent,follow_symlinks=False)
   need(stat.S_ISDIR(before.st_mode),'symlink/non-directory parent')
   child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
   need(fields(os.fstat(child))==fields(before)==fields(os.stat(name,dir_fd=parent,follow_symlinks=False)),
        'directory open drift')
   held.append(child)
  return held
 except BaseException:
  for fd in reversed(held):os.close(fd)
  raise

def verify_dir_chain(path,held):
 need(len(held)==len(path.parts),'directory chain length')
 for parent,child,name in zip(held,held[1:],path.parts[1:]):
  need(fields(os.fstat(child))==fields(os.stat(name,dir_fd=parent,follow_symlinks=False)),
       'directory chain drift')

def close_chain(held):
 for fd in reversed(held):os.close(fd)

def read_pin(path,expected,cap=1<<20):
 need(path.is_absolute() and re.fullmatch('[0-9a-f]{64}',expected or ''),'pinned control path/SHA')
 held=open_dir_chain(path.parent)
 try:
  parent=held[-1];before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and 0<=before.st_size<=cap,'unsafe pinned file '+str(path))
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   need(fields(os.fstat(fd))==fields(before),'control open drift')
   data=bytearray()
   while True:
    remaining();chunk=os.read(fd,min(65536,cap+1-len(data)))
    if not chunk:break
    data.extend(chunk);need(len(data)<=before.st_size and len(data)<=cap,'control grew')
   need(len(data)==before.st_size and fields(os.fstat(fd))==fields(before)==
        fields(os.stat(path.name,dir_fd=parent,follow_symlinks=False)),'control changed')
  finally:os.close(fd)
  verify_dir_chain(path.parent,held)
  raw=bytes(data);need(sha(raw)==expected,'pin drift '+str(path));return raw
 finally:close_chain(held)

def clean_git_env():
 return {k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
def bounded_ps_snapshot(argv=None):
 """Read the full ps table with live pipe caps; never inherit its own group status."""
 deadline=time.monotonic()+min(5,remaining())
 if argv is None:argv=['/bin/ps','-axo','pid=,ppid=,pgid=,uid=']
 proc=subprocess.Popen(argv,stdin=subprocess.DEVNULL,
                       stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True,
                       env=clean_git_env())
 selector=selectors.DefaultSelector();out=bytearray();err=bytearray()
 try:
  for stream,target in ((proc.stdout,out),(proc.stderr,err)):
   os.set_blocking(stream.fileno(),False);selector.register(stream,selectors.EVENT_READ,target)
  while selector.get_map():
   need(time.monotonic()<deadline,'EPERM process-table deadline')
   for key,_ in selector.select(timeout=min(.1,max(.001,deadline-time.monotonic()))):
    try:part=os.read(key.fileobj.fileno(),65536)
    except BlockingIOError:continue
    if not part:selector.unregister(key.fileobj);key.fileobj.close()
    else:key.data.extend(part);need(len(key.data)<=2*1024*1024,'EPERM process-table stream cap')
  proc.wait(timeout=min(remaining(),max(.001,deadline-time.monotonic())))
  need(proc.returncode==0 and out and not err,'EPERM process-table unavailable')
  try:os.killpg(proc.pid,0)
  except ProcessLookupError:pass
  except PermissionError as error:raise RuntimeError('EPERM process-table child group unclear') from error
  else:raise RuntimeError('EPERM process-table child group survived')
  return bytes(out)
 except BaseException:
  try:os.killpg(proc.pid,signal.SIGTERM)
  except ProcessLookupError:pass
  except PermissionError as error:raise RuntimeError('EPERM ps cleanup signal denied') from error
  try:proc.wait(timeout=2)
  except subprocess.TimeoutExpired:pass
  try:os.killpg(proc.pid,0)
  except ProcessLookupError:pass
  except PermissionError as error:raise RuntimeError('EPERM ps cleanup group unclear') from error
  else:
   try:os.killpg(proc.pid,signal.SIGKILL)
   except ProcessLookupError:pass
   except PermissionError as error:raise RuntimeError('EPERM ps cleanup KILL denied') from error
   try:proc.wait(timeout=2)
   except subprocess.TimeoutExpired:pass
  raise
 finally:
  selector.close()
  for stream in (proc.stdout,proc.stderr):
   if stream is not None and not stream.closed:stream.close()
def group_alive(pid,proc=None):
 try:os.killpg(pid,0);return True
 except ProcessLookupError:return False
 except PermissionError as error:
  # EPERM itself proves neither survival nor clearance. The direct child must
  # already be reaped, and two complete process-table samples must agree.
  need(proc is not None and proc.pid==pid and proc.poll() is not None,
       'EPERM with unreaped/unidentified group')
  samples=[]
  for sample in range(2):
   probe=bounded_ps_snapshot()
   parsed=[]
   for line in probe.splitlines():
    cols=line.split();need(len(cols)==4 and all(x.isdigit() for x in cols),'EPERM process-table parse')
    parsed.append(tuple(map(int,cols)))
   need(parsed and all(row[2]!=pid and row[1]!=pid for row in parsed),
        'EPERM group/child descendant remains or inventory uncertain')
   samples.append({'sample':sample,'rows':len(parsed),'exactGroupMembers':0,'directChildren':0})
   if sample==0:time.sleep(.05)
  GROUP_ALTERNATE_PROOFS.append({'pgid':pid,'reason':'EPERM_DIRECT_CHILD_REAPED',
                                 'samples':samples,'originalError':repr(error)})
  return False
def signal_group(pid,sig,proc=None):
 if not group_alive(pid,proc):return
 try:os.killpg(pid,sig)
 except ProcessLookupError:return
 except PermissionError as error:
  if group_alive(pid,proc):raise RuntimeError('group signal denied; survivor status unresolved') from error
def stop_group(proc):
 if not group_alive(proc.pid,proc):
  try:proc.wait(timeout=1)
  except subprocess.TimeoutExpired:pass
  return
 signal_group(proc.pid,signal.SIGTERM,proc)
 try:proc.wait(timeout=2)
 except subprocess.TimeoutExpired:pass
 deadline=time.monotonic()+2
 while group_alive(proc.pid,proc) and time.monotonic()<deadline:time.sleep(.05)
 if group_alive(proc.pid,proc):
  signal_group(proc.pid,signal.SIGKILL,proc)
  try:proc.wait(timeout=2)
  except subprocess.TimeoutExpired:pass
  deadline=time.monotonic()+2
  while group_alive(proc.pid,proc) and time.monotonic()<deadline:time.sleep(.05)
 need(not group_alive(proc.pid,proc),'guard/child process group survived cleanup')
def guard_command_bytes(argv,cwd=REPO,cap=2*1024*1024):
 """Cap captured pipes, not child filesystem writes, and reap descendants."""
 need(cap<=2*1024*1024 and cap>0,'guard output cap')
 deadline=time.monotonic()+min(15,remaining())
 env=clean_git_env() if argv and argv[0]=='git' else os.environ.copy()
 selector=selectors.DefaultSelector()
 try:
  proc=subprocess.Popen(argv,cwd=cwd,env=env,stdin=subprocess.DEVNULL,
                        stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
 except BaseException:
  selector.close()
  raise
 out=bytearray();err=bytearray()
 try:
  for stream,target in ((proc.stdout,out),(proc.stderr,err)):
   os.set_blocking(stream.fileno(),False)
   selector.register(stream,selectors.EVENT_READ,target)
  while selector.get_map():
   need(time.monotonic()<deadline,'guard command 15-second deadline')
   remaining()
   for key,_ in selector.select(timeout=min(.25,deadline-time.monotonic())):
    try:chunk=os.read(key.fileobj.fileno(),65536)
    except BlockingIOError:continue
    if not chunk:
     selector.unregister(key.fileobj);key.fileobj.close()
    else:
     key.data.extend(chunk);need(len(key.data)<=cap,'guard command output cap')
  proc.wait(timeout=min(remaining(),max(.001,deadline-time.monotonic())))
  need(not group_alive(proc.pid,proc),'guard command descendant survived')
  need(proc.returncode==0,'guard command failed: '+repr(argv)+' '+repr(bytes(err[-500:])))
  return bytes(out)
 except BaseException:
  stop_group(proc)
  raise
 finally:
  selector.close()
  for stream in (proc.stdout,proc.stderr):
   if stream is not None and not stream.closed:stream.close()
def cmd(argv,cwd=REPO):return guard_command_bytes(argv,cwd).decode('utf-8','replace').strip()
def guard(run_id):
 remaining()
 lane=S/'HEAVY-LANE-LOCK'
 need(lane.is_file() and not lane.is_symlink() and f'c0-h-types-{run_id}.lane.log' in lane.read_text(),'wrong heavy lane')
 need(cmd(['pmset','-g','batt']).splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB disk floor')
 need(re.fullmatch('[0-9a-f]{40}',CURRENT_HEAD) and
      re.fullmatch('[0-9a-f]{40}',CURRENT_EVIDENCE_TIP),'current refs unbound')
 need(cmd(['git','rev-parse','HEAD'])==CURRENT_HEAD and cmd(['git','rev-parse','HEAD:src'])==TREE and
      cmd(['git','status','--porcelain=v1'])=='','production source drift')
 need(cmd(['git','remote','get-url','origin'])==ORIGIN,'origin URL drift')
 need(cmd(['git','ls-remote','origin',REF])==CURRENT_HEAD+'\t'+REF,'remote production drift')
 need(cmd(['git','rev-parse',EVIDENCE_REF])==CURRENT_EVIDENCE_TIP and
      cmd(['git','ls-remote','origin',EVIDENCE_REF])==CURRENT_EVIDENCE_TIP+'\t'+EVIDENCE_REF,
      'local/remote evidence drift')
SOURCE_LAST_GUARD=float('-inf')
def source_step(run_id):
 global SOURCE_LAST_GUARD
 remaining()
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB disk floor')
 now=time.monotonic()
 if now-SOURCE_LAST_GUARD>=5:
  guard(run_id);SOURCE_LAST_GUARD=now

def bounded_names(fd,state,cap,run_id):
 names=[];local=0
 source_step(run_id)
 with os.scandir(fd) as it:
  for item in it:
   local+=1;state['entries']+=1
   need(local<=cap and state['entries']<=cap,'directory/global entry cap')
   if local%16==0:source_step(run_id)
   names.append(item.name)
 source_step(run_id)
 return sorted(names,key=lambda x:x.encode('utf-8'))

def walk_meta(root,run_id):
 """No-follow dependency proof with stable dirfd reads and a 512 MiB content cap."""
 held=open_dir_chain(root);rootfd=held[-1];root_before=fields(os.fstat(rootfd))
 digest=hashlib.sha256();state={'entries':0};content_bytes=0
 try:
  def descend(fd,prefix):
   nonlocal content_bytes
   before=fields(os.fstat(fd))
   for name in bounded_names(fd,state,500000,run_id):
    source_step(run_id)
    need(name not in ('','.','..') and '/' not in name and '\n' not in name,'unsafe dependency name')
    rel=prefix+name
    st=os.stat(name,dir_fd=fd,follow_symlinks=False)
    extra='';file_hash=None
    if stat.S_ISDIR(st.st_mode):
     child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(child))==fields(st),'dependency directory open drift')
      # Metadata row precedes descendants, preserving a single deterministic walk.
      row=[rel,st.st_mode,st.st_dev,st.st_ino,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns,extra,file_hash]
      digest.update(json.dumps(row,separators=(',',':')).encode()+b'\n')
      descend(child,rel+'/')
      need(fields(os.fstat(child))==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),
           'dependency directory changed')
     finally:os.close(child)
    else:
     if stat.S_ISLNK(st.st_mode):
      extra=os.readlink(name,dir_fd=fd)
      need(fields(st)==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'dependency link drift')
     elif stat.S_ISREG(st.st_mode):
      need(0<=st.st_size<=512*1024**2-content_bytes,'dependency content audit cap')
      filefd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=fd)
      try:
       need(fields(os.fstat(filefd))==fields(st),'dependency file open drift')
       h=hashlib.sha256();size=0
       while True:
        source_step(run_id);chunk=os.read(filefd,1<<20)
        if not chunk:break
        size+=len(chunk);need(size<=st.st_size,'dependency grew during audit');h.update(chunk)
       need(size==st.st_size and fields(os.fstat(filefd))==fields(st)==
            fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'dependency file changed')
      finally:os.close(filefd)
      file_hash=h.hexdigest();content_bytes+=size
     else:raise RuntimeError('special dependency entry '+rel)
     row=[rel,st.st_mode,st.st_dev,st.st_ino,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns,extra,file_hash]
     digest.update(json.dumps(row,separators=(',',':')).encode()+b'\n')
   need(fields(os.fstat(fd))==before,'dependency directory mutation')
  descend(rootfd,'')
  need(fields(os.fstat(rootfd))==root_before,'dependency root mutation')
  verify_dir_chain(root,held)
  return {'entries':state['entries'],'contentBytes':content_bytes,
          'contentAndMetadataSha256':digest.hexdigest(),
          'rootDevice':root_before[0],'rootInode':root_before[1]}
 finally:close_chain(held)

def full_source_check(mirror,manifest,run_id,allow_deps_link=False):
 """Rebuild the H 1,402-file Git/overlay proof through no-follow dirfds."""
 paths=['src','tests','ui','bridge','package.json','package-lock.json','tsconfig.json','tsconfig.src.json','vitest.config.ts','vitest.workspace.ts']
 roster=guard_command_bytes(['git','ls-tree','-rl','-z',H_COMMIT,*paths],cap=2*1024*1024)
 base={}
 for rec in roster.split(b'\0'):
  if not rec:continue
  header,name=rec.split(b'\t',1);mode,kind,oid,size=header.decode().split();rel=name.decode()
  need(kind=='blob' and mode in ('100644','100755') and rel not in base,'H Git roster entry')
  base[rel]=(mode,oid,int(size))
 need(len(base)==1400 and sum(v[2] for v in base.values())==99472197,'H Git+bridge roster count/bytes')
 need(cmd(['git','rev-parse',H_COMMIT+':bridge'])==BRIDGE_TREE,'H bridge tree drift')
 overlays={r['destination']:r for r in manifest['files']}
 need(len(overlays)==4,'H overlay roster')
 expected=set(base)|set(overlays);need(len(expected)==1402,'H amended mirror expected count')
 held=open_dir_chain(mirror);rootfd=held[-1];root_before=fields(os.fstat(rootfd))
 proof_rows={};state={'entries':0};total=0;deps_link=None
 try:
  def descend(fd,prefix):
   nonlocal total,deps_link
   before=fields(os.fstat(fd))
   for name in bounded_names(fd,state,1500,run_id):
    source_step(run_id)
    need(name not in ('','.','..') and '/' not in name,'unsafe mirror name')
    rel=prefix+name;st=os.stat(name,dir_fd=fd,follow_symlinks=False)
    if stat.S_ISDIR(st.st_mode):
     need(any(x.startswith(rel+'/') for x in expected),'extra mirror directory '+rel)
     child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(child))==fields(st),'mirror directory open drift')
      descend(child,rel+'/')
      need(fields(os.fstat(child))==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),
           'mirror directory changed')
     finally:os.close(child)
    elif stat.S_ISLNK(st.st_mode):
     need(allow_deps_link and rel=='node_modules' and deps_link is None and st.st_nlink==1,
          'unexpected dependency link')
     target=os.readlink(name,dir_fd=fd)
     need(target==str(REPO/'node_modules') and fields(st)==
          fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'dependency link changed')
     deps_link=fields(st)+(target,)
    else:
     need(rel in expected and rel not in proof_rows,'extra/duplicate mirror file '+rel)
     need(stat.S_ISREG(st.st_mode) and st.st_nlink==1,'unsafe mirror file '+rel)
     if rel in overlays:
      mode='100644';oid=None;size=overlays[rel]['bytes']
     else:mode,oid,size=base[rel]
     need(st.st_size==size and stat.S_IMODE(st.st_mode)==
          (0o755 if mode=='100755' else 0o644),'mirror file size/mode '+rel)
     filefd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(filefd))==fields(st),'mirror open drift '+rel)
      blob=hashlib.sha1(f'blob {size}\0'.encode());content=hashlib.sha256();count=0
      while True:
       source_step(run_id);chunk=os.read(filefd,1<<20)
       if not chunk:break
       count+=len(chunk);need(count<=size,'mirror file grew '+rel)
       blob.update(chunk);content.update(chunk)
      need(count==size and fields(os.fstat(filefd))==fields(st)==
           fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'mirror file read drift '+rel)
     finally:os.close(filefd)
     got_oid=blob.hexdigest();got_sha=content.hexdigest();got_mode=stat.S_IMODE(st.st_mode)
     if rel in overlays:need(got_sha==overlays[rel]['sha256'],'overlay SHA '+rel)
     else:need(got_oid==oid,'Git blob OID '+rel)
     proof_rows[rel]=[rel,size,got_oid,got_sha,got_mode];total+=size
   need(fields(os.fstat(fd))==before,'mirror directory mutation')
  descend(rootfd,'')
  need(set(proof_rows)==expected and len(proof_rows)==1402 and total==99516095 and
       (deps_link is not None)==allow_deps_link and state['entries']<=1500,
       'amended mirror roster/count/bytes/link')
  need(fields(os.fstat(rootfd))==root_before,'mirror root mutation')
  verify_dir_chain(mirror,held)
  return {'fileProofDigestSha256':canonical_proof(proof_rows),'mirrorFiles':len(proof_rows),
          'mirrorBytes':total,'dependencyLink':deps_link,'traversedEntries':state['entries'],'mirrorRootIdentity':root_before}
 finally:close_chain(held)

def canonical_proof(rows):
 """Match the accepted r5 readback: UTF-8 path order and exact five-field rows."""
 need(isinstance(rows,dict) and len(rows)==len(set(rows)), 'proof row map')
 digest=hashlib.sha256()
 for rel in sorted(rows,key=lambda x:x.encode('utf-8')):
  row=rows[rel]
  need(isinstance(row,list) and len(row)==5 and row[0]==rel, 'proof row schema/order')
  digest.update(json.dumps(row,separators=(',',':')).encode('utf-8')+b'\n')
 return digest.hexdigest()

def validate_r6_chain(binding,readback):
 """Authenticate actual r6 child0 source proof; never self-award observed acceptance."""
 expect={
  'fullReadbackResultPath':S/'1370-c0-h-bridge-full-readback-recorded-r6/READBACK.json',
  'fullReadbackR6RecorderResultPath':S/'1370-c0-h-bridge-full-readback-recorder-results-r3/20261008-h-bridge-full-readback-r6.RECORDER-RESULT.json',
  'fullReadbackR6LaneLogPath':S/'c0-h-bridge-full-readback-20261008-r6.lane.log',
  'fullReadbackR6LaneMetaPath':S/'c0-h-bridge-full-readback-20261008-r6.lane.log.meta',
  'fullReadbackR6ExactReviewPath':S/'1370-c0-h-bridge-full-readback-filled-exact-independent-review-r6/RECEIPT.json',
  'fullReadbackR6StaticReceiptPath':S/'1370-c0-h-bridge-full-readback-independent-static-review-r6/RECEIPT.json'}
 for field,path in expect.items():need(binding.get(field)==str(path),'r6 path '+field)
 need(binding.get('fullReadbackDigestSha256')=='1534ca888a99c1f41e3eb2a7201d6d6d56f1343bab3f4040518348cc34d276b4','r6 digest pin')
 need(binding.get('fullReadbackR6RunnerSha256')=='6d2c51bc6a802e7e19e41849d27569e35bcfcee31dfc12480c0f6a22998314d1' and
      binding.get('fullReadbackR6SpecSha256')=='24952774515fd0e36eb2d2895e3e1d6996371c93617995612e3db5c75ac3a5d5' and
      binding.get('fullReadbackR6SourceManifestSha256')=='e70a1382c47019e70acac5739fbc33ca0da7c0961f70dda13cca9ba8ac31a11e',
      'r6 source pins')
 need(binding.get('fullReadbackR6StaticReceiptSha256')=='63767792d0a2e43a052141c13f3e1e15c2d4c3dbc450f4a73a3210d5daa564e1' and
      binding.get('fullReadbackR6ExactReviewSha256')=='feb6a592008230f89767693aefcf1077b01b110297e30ed8cfcc9e6c790a762d',
      'r6 review pins')
 need(binding.get('fullReadbackResultSha256')=='3da9e86417520a6e75591e107e85f4bacf3ba8b7e9fef4b33bca30f854723724' and
      binding.get('fullReadbackR6RecorderResultSha256')=='3341a65bae54cae0ca481c652a36621556da8ed885436947078f3fc48bd9f88a' and
      binding.get('fullReadbackR6LaneLogSha256')=='323aea0900a0a074371651fd52c21ee9b3785047903f32275a1ccbc571793a42' and
      binding.get('fullReadbackR6LaneMetaSha256')=='7037896827b418977e06959e48652e68fbc7581243fc4a87726171ce3e0ed0b5',
      'r6 observed raw pins')
 need(readback.get('decision')=='SOURCE_BYTES_CHECKED_OBSERVED_REVIEW_PENDING' and
      readback.get('fileProofDigestSha256')==binding['fullReadbackDigestSha256'] and
      readback.get('regularFiles')==1402 and readback.get('regularBytes')==99516095 and
      readback.get('symlinks')==1 and readback.get('sourceCommit')==H_COMMIT and
      readback.get('sourceTree')==H_TREE and readback.get('bridgeTree')==BRIDGE_TREE and
      readback.get('addendumResultSha256')==BRIDGE_SOURCE_SHA and
      readback.get('recorderResultSha256')=='613b0487f37cfe9b2e0267ec8e0c5943ace463a531705567e96e4e41de656b10' and
      readback.get('productionHead')==CAPTURE_HEAD and readback.get('productionSrcTree')==TREE and
      readback.get('sourceManifestSha256')==MANIFEST_SHA and
      readback.get('evidenceTip')=='fe9e8a7d84da164e9a413dc2c3efe49f529c2a78',
      'r6 raw source proof')
 static=json.loads(read_pin(expect['fullReadbackR6StaticReceiptPath'],binding['fullReadbackR6StaticReceiptSha256'],100000))
 exact=json.loads(read_pin(expect['fullReadbackR6ExactReviewPath'],binding['fullReadbackR6ExactReviewSha256'],100000))
 need(static.get('decision')=='ACCEPT_STATIC_H_BRIDGE_FULL_READBACK_ONLY' and
      static.get('scriptSha256')==binding['fullReadbackR6RunnerSha256'] and
      static.get('specSha256')==binding['fullReadbackR6SpecSha256'] and
      static.get('manifestSha256')==binding['fullReadbackR6SourceManifestSha256'] and
      exact.get('decision')=='ACCEPT_EXACT_H_BRIDGE_FULL_READBACK_RETRY_R6_ONLY' and
      exact.get('readbackSourceSha256')==binding['fullReadbackR6RunnerSha256'] and
      exact.get('readbackR6StaticReviewSha256')==binding['fullReadbackR6StaticReceiptSha256'] and
      exact.get('bindingSha256')=='09120c19b820efcdf4d534b07b818a4b08129a10857bdcc5b370e5a7b8ef74a4',
      'r6 independent static/exact authority')
 recorder=json.loads(read_pin(expect['fullReadbackR6RecorderResultPath'],binding['fullReadbackR6RecorderResultSha256'],100000))
 need(recorder.get('schema')=='1370-c0-h-bridge-full-readback-recorder-result-r3' and
      recorder.get('status')=='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' and
      recorder.get('childExit')==0 and recorder.get('groupClear') is True and
      recorder.get('sourceDeadlineSeconds')==600 and recorder.get('recorderActiveSeconds')==620 and
      recorder.get('recorderWholeSeconds')==630 and 0<=recorder.get('elapsedSeconds',-1)<=630 and
      recorder.get('sourceSha256')==binding['fullReadbackR6RunnerSha256'] and
      recorder.get('staticReviewSha256')==binding['fullReadbackR6StaticReceiptSha256'] and
      recorder.get('productionHead')==CAPTURE_HEAD and recorder.get('productionSourceTree')==TREE and
      'error' not in recorder and 'cleanupError' not in recorder,
      'r6 recorder child/timeout/group')
 lane=read_pin(expect['fullReadbackR6LaneLogPath'],binding['fullReadbackR6LaneLogSha256'],100000)
 meta=read_pin(expect['fullReadbackR6LaneMetaPath'],binding['fullReadbackR6LaneMetaSha256'],100000)
 lines=meta.splitlines();terminal=[x for x in lines if x.startswith(b'end, exit ')]
 need(len(terminal)==1 and lines[-1]==terminal[0] and terminal[0].startswith(b'end, exit 0; '),
      'r6 lane child terminal')
 need(b'Traceback' not in lane,'r6 lane traceback')
 records=[json.loads(x) for x in lane.splitlines()]
 need(len(records)==2 and records[0].get('decision')==readback['decision'] and
      records[0].get('receiptSha256')==binding['fullReadbackResultSha256'] and
      records[0].get('regularFiles')==1402 and records[0].get('regularBytes')==99516095 and
      records[1].get('recorderStatus')==recorder['status'] and records[1].get('childExit')==0 and
      records[1].get('groupClear') is True,'r6 lane result/recorder lines')
 old4=S/'1370-c0-h-bridge-full-readback-independent-observed-stop-review-r4/RECEIPT.json'
 old5=S/'1370-c0-h-bridge-full-readback-independent-observed-stop-review-r5/RECEIPT.json'
 need(binding.get('fullReadbackR4ObservedStopReceiptSha256')=='8d7c904eefdaacc5e8905c2a3166d80907768cb7c97c75d46be1c26de98beec6' and
      binding.get('fullReadbackR5ObservedStopReceiptSha256')=='ded3a4f895ca393dedb3099712a7d01f1ee6f2c22cc780d215f51de397d37fd9',
      'r4/r5 STOP pins')
 need(json.loads(read_pin(old4,binding['fullReadbackR4ObservedStopReceiptSha256'],100000)).get('decision')=='ACCEPT_OBSERVED_STOP_H_BRIDGE_FULL_READBACK_R4' and
      json.loads(read_pin(old5,binding['fullReadbackR5ObservedStopReceiptSha256'],100000)).get('decision')=='ACCEPT_OBSERVED_STOP_H_BRIDGE_FULL_READBACK_R5',
      'r4/r5 preserved STOP')
 need(readback.get('nodeModulesLinkIdentity') is not None and
      isinstance(readback.get('mirrorRootIdentity'),list),'r6 source/link identity shape')
 return {'rawSha256':binding['fullReadbackResultSha256'],'proofDigestSha256':binding['fullReadbackDigestSha256'],
         'recorderSha256':binding['fullReadbackR6RecorderResultSha256']}

def validate_r6_observed(binding,readback):
 path=S/'1370-c0-h-bridge-full-readback-independent-observed-review-r6/RECEIPT.json'
 pin='35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a'
 need(binding.get('fullReadbackObservedReceiptPath')==str(path) and
      binding.get('fullReadbackObservedReceiptSha256')==pin and
      binding.get('fullReadbackObservedDecision')=='ACCEPT_OBSERVED_H_BRIDGE_FULL_SOURCE_BYTES_ONLY',
      'r6 observed receipt route')
 observed=json.loads(read_pin(path,pin,100000))
 need(observed.get('schema')=='1370-c0-h-bridge-full-readback-independent-observed-review-r6' and
      observed.get('decision')==binding['fullReadbackObservedDecision'] and
      observed.get('independentByteAuditDecision')=='PASS_INDEPENDENT_H_MIRROR_BYTES_ONLY' and
      observed.get('readbackSha256')==binding['fullReadbackResultSha256'] and
      observed.get('fileProofDigestSha256')==binding['fullReadbackDigestSha256'] and
      observed.get('recorderResultSha256')==binding['fullReadbackR6RecorderResultSha256'] and
      observed.get('laneLogSha256')==binding['fullReadbackR6LaneLogSha256'] and
      observed.get('laneMetaSha256')==binding['fullReadbackR6LaneMetaSha256'] and
      observed.get('exactLaunchReviewSha256')==binding['fullReadbackR6ExactReviewSha256'] and
      observed.get('sourceSha256')==binding['fullReadbackR6RunnerSha256'] and
      observed.get('sourceStaticReviewSha256')==binding['fullReadbackR6StaticReceiptSha256'] and
      observed.get('sourceCommit')==H_COMMIT and observed.get('sourceTree')==H_TREE and
      observed.get('bridgeTree')==BRIDGE_TREE and observed.get('productionHead')==CAPTURE_HEAD and
      observed.get('productionSrcTree')==TREE and
      observed.get('r4ObservedStopSha256')==binding['fullReadbackR4ObservedStopReceiptSha256'] and
      observed.get('r5ObservedStopSha256')==binding['fullReadbackR5ObservedStopReceiptSha256'] and
      observed.get('regularFiles')==1402 and observed.get('regularBytes')==99516095 and
      observed.get('symlinks')==1 and observed.get('entries')==1479 and
      observed.get('laneChildExit')==0 and observed.get('recorderChildExit')==0 and
      observed.get('recorderGroupClear') is True and
      observed.get('postflightNoLaneLockPartialsOrSurvivors') is True and
      observed.get('postflightAC') is True and
      observed.get('postflightProductionClean') is True and
      observed.get('postflightRemoteRefsMatch') is True and
      observed.get('mirrorRootIdentity')==readback.get('mirrorRootIdentity') and
      observed.get('nodeModulesLinkIdentity')==readback.get('nodeModulesLinkIdentity'),
      'r6 independent observed source-only proof')
 return observed

def stable_output(path,cap,body=False):
 """Bounded, no-follow, stable descriptor read of a child-created regular file."""
 held=open_dir_chain(path.parent)
 try:
  parent=held[-1];before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and 0<=before.st_size<cap,
       'child output cap/type '+str(path))
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   need(fields(os.fstat(fd))==fields(before),'child output open drift')
   h=hashlib.sha256();parts=[];size=0
   while True:
    remaining();chunk=os.read(fd,min(65536,cap-size))
    if not chunk:break
    size+=len(chunk);need(size<cap and size<=before.st_size,'child output growth')
    h.update(chunk)
    if body:parts.append(chunk)
   need(size==before.st_size and fields(os.fstat(fd))==fields(before)==
        fields(os.stat(path.name,dir_fd=parent,follow_symlinks=False)),
        'child output changed')
  finally:os.close(fd)
  verify_dir_chain(path.parent,held)
  return {'sha256':h.hexdigest(),'bytes':size,'body':b''.join(parts) if body else None}
 finally:close_chain(held)

def write_result(path,record):
 raw=(json.dumps(record,sort_keys=True,indent=2)+'\n').encode()
 need(len(raw)<=MAX_RESULT,'result receipt cap')
 held=open_dir_chain(path.parent)
 try:
  parent=held[-1]
  need(not os.path.lexists(path),'result collision')
  fd=os.open(path.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
  try:
   view=memoryview(raw)
   while view:
    remaining();view=view[os.write(fd,view):]
   os.fsync(fd)
  finally:os.close(fd)
  os.fsync(parent)
  verify_dir_chain(path.parent,held)
 finally:close_chain(held)
 proof=stable_output(path,MAX_RESULT+1,True)
 need(proof['body']==raw,'result receipt readback')
 return proof['sha256']

def root_checkpoint(mirror,run_id):
 """Bounded no-follow root-entry roster and exact root tuple at a child boundary."""
 held=open_dir_chain(mirror);fd=held[-1];before=fields(os.fstat(fd));rows=[]
 try:
  for name in bounded_names(fd,{'entries':0},1500,run_id):
   source_step(run_id)
   need(name not in ('','.','..') and '/' not in name,'unsafe root entry')
   st=os.stat(name,dir_fd=fd,follow_symlinks=False)
   need(stat.S_ISDIR(st.st_mode) or stat.S_ISREG(st.st_mode) or stat.S_ISLNK(st.st_mode),
        'special root entry')
   rows.append([name,st.st_mode,st.st_dev,st.st_ino,st.st_nlink,st.st_size,
                st.st_mtime_ns,st.st_ctime_ns])
  need(fields(os.fstat(fd))==before,'root mutated during checkpoint')
  verify_dir_chain(mirror,held)
  raw=b''.join(json.dumps(row,separators=(',',':')).encode()+b'\n' for row in rows)
  need(len(raw)<=128*1024,'root checkpoint receipt cap')
  return {'identity':before,'entries':rows,'rosterSha256':sha(raw)}
 finally:close_chain(held)

def scratch_preimage_output(out):
 """Only a fresh absolute scratch child path can be exported to test imports."""
 target=out/'preimage-output'
 need(out.is_absolute() and out.is_relative_to(S) and not out.is_relative_to(MIRROR_ROOT) and
      target==out/'preimage-output' and not os.path.lexists(target),
      'unsafe/preexisting PREIMAGE_OUTPUT')
 held=open_dir_chain(out)
 try:verify_dir_chain(out,held)
 finally:close_chain(held)
 return str(target)

def check_preimage_output(out,run_id):
 """Collection import may create only its fresh scratch output directory."""
 target=out/'preimage-output'
 need(target.is_absolute() and target.is_relative_to(S) and not target.is_relative_to(MIRROR_ROOT),
      'unsafe PREIMAGE_OUTPUT postflight path')
 held=open_dir_chain(target);fd=held[-1];before=fields(os.fstat(fd))
 try:
  names=bounded_names(fd,{'entries':0},32,run_id)
  need(not names and fields(os.fstat(fd))==before,'collection wrote unexpected preimage files')
  verify_dir_chain(target,held)
  return before
 finally:close_chain(held)

def run_child(name,argv,mirror,out,run_id,extra_env=None):
 global CURRENT
 phase='preflight';guard(run_id);remaining()
 stdout=out/(name+'.stdout');stderr=out/(name+'.stderr')
 need(not os.path.lexists(stdout) and not os.path.lexists(stderr),'child output collision')
 started=time.monotonic();held=open_dir_chain(out)
 try:
  parent=held[-1]
  phase='open-sidecars'
  sofd=os.open(stdout.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
  try:sefd=os.open(stderr.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
  except BaseException:os.close(sofd);raise
  try:
   env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
   env.update({'PATH':str(pathlib.Path(NODE).parent)+':/usr/local/bin:/usr/bin:/bin',
               'HOME':str(out),'TMPDIR':str(out),'VITEST_CACHE_DIR':str(out/'vitest-cache')})
   if extra_env:
    need(name=='diagnostic-collection' and set(extra_env)=={'PREIMAGE_OUTPUT'} and
         extra_env['PREIMAGE_OUTPUT']==str(out/'preimage-output'),'unsafe child env override')
    env.update(extra_env)
   blocked={signal.SIGTERM,signal.SIGINT,signal.SIGALRM}
   oldmask=signal.pthread_sigmask(signal.SIG_BLOCK,blocked)
   def child_setup():signal.pthread_sigmask(signal.SIG_UNBLOCK,blocked)
   selector=selectors.DefaultSelector()
   phase='spawn'
   try:
    proc=subprocess.Popen(argv,cwd=mirror,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE,start_new_session=True,preexec_fn=child_setup,env=env)
    CURRENT=proc
   except BaseException as spawn_error:
    selector.close()
    try:setattr(spawn_error,'_h_type_child_phase',phase)
    except BaseException:pass
    raise
   finally:signal.pthread_sigmask(signal.SIG_SETMASK,oldmask)
   counts={proc.stdout:0,proc.stderr:0}
   phase='pipe-pump'
   try:
    for stream in (proc.stdout,proc.stderr):
     os.set_blocking(stream.fileno(),False)
     selector.register(stream,selectors.EVENT_READ,
                       sofd if stream is proc.stdout else sefd)
    while selector.get_map():
     source_step(run_id)
     for key,_ in selector.select(timeout=min(.25,remaining())):
      try:chunk=os.read(key.fileobj.fileno(),65536)
      except BlockingIOError:continue
      if not chunk:
       selector.unregister(key.fileobj);key.fileobj.close()
      else:
       counts[key.fileobj]+=len(chunk)
       need(counts[key.fileobj]<MAX_CHILD_LOG,'child output cap '+name)
       view=memoryview(chunk)
       while view:
        remaining();view=view[os.write(key.data,view):]
    phase='wait-child'
    proc.wait(timeout=remaining())
    source_step(run_id)
    guard(run_id)
    phase='probe-child-group'
    need(not group_alive(proc.pid,proc),name+' process group survivor')
   except BaseException as child_error:
    try:stop_current()
    except BaseException as cleanup_error:
     raise RuntimeError('child phase '+phase+' failed '+repr(child_error)+
                        '; cleanup failed '+repr(cleanup_error)) from cleanup_error
    try:setattr(child_error,'_h_type_child_phase',phase)
    except BaseException:pass
    raise
   finally:
    selector.close()
    for stream in (proc.stdout,proc.stderr):
     if stream is not None and not stream.closed:stream.close()
    CURRENT=None
   phase='fsync-sidecars';os.fsync(sofd);os.fsync(sefd)
  finally:os.close(sofd);os.close(sefd)
  verify_dir_chain(out,held)
 finally:close_chain(held)
 phase='read-sidecars';out_proof=stable_output(stdout,MAX_CHILD_LOG);err_proof=stable_output(stderr,MAX_CHILD_LOG)
 return {'name':name,'argv':argv,'exit':proc.returncode,'seconds':round(time.monotonic()-started,3),
         'stdoutSha256':out_proof['sha256'],'stdoutBytes':out_proof['bytes'],
         'stderrSha256':err_proof['sha256'],'stderrBytes':err_proof['bytes']}

def main():
 signal.signal(signal.SIGTERM,on_signal);signal.signal(signal.SIGINT,on_signal)
 ap=argparse.ArgumentParser()
 ap.add_argument('--binding',required=True);ap.add_argument('--binding-sha',required=True)
 args=ap.parse_args();need(re.fullmatch('[0-9a-f]{64}',args.binding_sha),'binding SHA')
 binding=json.loads(read_pin(pathlib.Path(args.binding),args.binding_sha,100000))
 run_id=binding.get('runId');need(run_id=='20261008-h-types-r10','run ID')
 need(binding.get('schema')=='1370-c0-h-typecheck-collection-source-binding-r12' and
      binding.get('status')=='FILLED_INDEPENDENT_REVIEW_REQUIRED' and binding.get('arm')=='H',
      'unfilled/wrong binding')
 need(binding.get('productionHead')==CURRENT_HEAD and binding.get('captureHead')==CAPTURE_HEAD and
      binding.get('captureEvidenceTip')==CAPTURE_EVIDENCE_TIP and binding.get('productionSrcTree')==TREE and
      binding.get('sourceCommit')==H_COMMIT and binding.get('sourceTree')==H_TREE and
      binding.get('bridgeTree')==BRIDGE_TREE and binding.get('childWallSeconds')==300 and
      binding.get('recorderWallSeconds')==330 and
      binding.get('evidenceTip')==CURRENT_EVIDENCE_TIP and binding.get('evidenceRef')==EVIDENCE_REF and
      binding.get('origin')==ORIGIN,'binding role/bounds/ref drift')
 need(binding.get('r10StaticRefineReceiptSha256')==R10_STATIC_REFINE_SHA,
      'r10 independent REFINE pin')
 r10_refine=json.loads(read_pin(S/'1370-c0-h-typecheck-r10-source-independent-static-review-r1/RECEIPT.json',
                                R10_STATIC_REFINE_SHA,100000))
 need(r10_refine.get('decision')=='REFINE_STATIC_SOURCE_UNRUN' and
      r10_refine.get('runtimeClaim')=='NONE_UNRUN','r10 REFINE authority')
 need(binding.get('r11ObservedStopReceiptSha256')==R11_OBSERVED_STOP_SHA and
      binding.get('r11SourceResultSha256')==R11_RESULT_SHA,'r11 STOP lineage pin')
 r11_stop=json.loads(read_pin(S/'1370-c0-h-typecheck-r11-independent-observed-stop-review-r1/RECEIPT.json',
                             R11_OBSERVED_STOP_SHA,100000))
 r11_result=json.loads(read_pin(S/'1370-c0-h-typecheck-collection-results-r11/20261008-h-types-r9/RESULT.json',
                               R11_RESULT_SHA,128*1024))
 need(r11_stop.get('decision')=='ACCEPT_OBSERVED_STOP_H_TYPECHECK_COLLECTION_R11' and
      r11_stop.get('exactFailureLineProven') is False and
      r11_stop.get('reviewedPins',{}).get('sourceResult',{}).get('sha256')==R11_RESULT_SHA and
      r11_result.get('status')=='STOP_TYPECHECK_COLLECTION' and
      r11_result.get('error')=="PermissionError(1, 'Operation not permitted')" and
      [x.get('name') for x in r11_result.get('children',[])]==['dependency-versions'],
      'r11 independently observed STOP authority')
 need(re.fullmatch('[0-9a-f]{64}',binding.get('fullReadbackResultSha256','')) and
      re.fullmatch('[0-9a-f]{64}',binding.get('fullReadbackDigestSha256','')) and
      re.fullmatch('[0-9a-f]{64}',binding.get('fullReadbackObservedReceiptSha256','')),'unfilled full-readback authority')
 mirror=MIRROR_ROOT/binding['mirrorRunId'];result_path=MIRROR_ROOT/(binding['mirrorRunId']+'.MATERIALIZE-RESULT.json')
 need(binding['mirrorRunId']=='20261008-h-types-r1' and str(mirror)==binding.get('mirrorPath') and
      str(result_path)==binding.get('materializerResultPath'),'mirror binding mismatch')
 readback_path=pathlib.Path(binding.get('fullReadbackResultPath',''))
 need(readback_path.is_absolute() and readback_path.is_relative_to(S),'readback receipt path')
 readback=json.loads(read_pin(readback_path,binding['fullReadbackResultSha256'],100000))
 need(readback.get('decision')=='SOURCE_BYTES_CHECKED_OBSERVED_REVIEW_PENDING' and
      readback.get('fileProofDigestSha256')==binding['fullReadbackDigestSha256'] and
      readback.get('regularFiles')==1402 and readback.get('regularBytes')==99516095 and
      readback.get('sourceCommit')==H_COMMIT and readback.get('sourceTree')==H_TREE and
      readback.get('bridgeTree')==BRIDGE_TREE and
      readback.get('addendumResultSha256')==BRIDGE_SOURCE_SHA,'raw full mirror readback authority')
 validate_r6_chain(binding,readback)
 validate_r6_observed(binding,readback)
 manifest_path=S/'1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json'
 review_path=S/'1370-c0-h-m0-corrected-overlay-source-manifest-independent-review-r2/H-RECEIPT.json'
 manifest=json.loads(read_pin(manifest_path,MANIFEST_SHA));review=json.loads(read_pin(review_path,REVIEW_SHA))
 need(review.get('decision')=='ACCEPT_STATIC_FULL_ERA_OBSERVER_ONLY' and review.get('sourceManifestSha256')==MANIFEST_SHA,'source review')
 need(manifest.get('arm')=='H' and manifest.get('sourceCommit')==H_COMMIT and manifest.get('sourceTree')==H_TREE,'source role')
 result=json.loads(read_pin(result_path,binding['materializerResultSha256'],100000))
 need(result.get('status')=='MIRROR_MATERIALIZED_SOURCE_ONLY' and result.get('arm')=='H' and
      result.get('runId')==binding['mirrorRunId'] and result.get('sourceCommit')==H_COMMIT and
      result.get('sourceTree')==H_TREE and result.get('mirrorPath')==str(mirror) and
      result.get('sourceManifestSha256')==MANIFEST_SHA and result.get('sourceReviewSha256')==REVIEW_SHA and
      len(result.get('overlayFiles',[]))==4,'materializer authority')
 bridge_source_path=S/'1370-c0-h-bridge-addendum-results-r3/20261008-h-bridge-addendum-r3.RESULT.json'
 bridge_observed_path=S/'1370-c0-h-bridge-addendum-independent-observed-source-review-r1/RECEIPT.json'
 old_stop_path=S/'1370-c0-h-typecheck-independent-observed-stop-review-r1/RECEIPT.json'
 old_result_path=S/'1370-c0-h-typecheck-collection-results-r5/20261008-h-types-r3/RESULT.json'
 bridge_source=json.loads(read_pin(bridge_source_path,BRIDGE_SOURCE_SHA,100000))
 bridge_observed=json.loads(read_pin(bridge_observed_path,BRIDGE_OBSERVED_SHA,100000))
 read_pin(old_stop_path,OLD_TYPE_STOP_SHA,100000)
 old_result=json.loads(read_pin(old_result_path,OLD_TYPE_RESULT_SHA,100000))
 need(bridge_source.get('status')=='BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK' and
      bridge_source.get('bridgeTree')==BRIDGE_TREE and bridge_source.get('bridgeFiles')==58 and
      bridge_source.get('bridgeBytes')==1357248 and
      bridge_observed.get('decision')=='ACCEPT_OBSERVED_H_BRIDGE_SOURCE_ROUTE_ONLY' and
      bridge_observed.get('sourceResultSha256')==BRIDGE_SOURCE_SHA and
      old_result.get('status')=='STOP_TYPECHECK_COLLECTION','prior/addendum authority mismatch')
 need(mirror.is_dir() and not mirror.is_symlink(),'mirror absent/unsafe')
 need(shutil.disk_usage(S).free>=PREFLIGHT,'3.5 GiB preflight')
 guard(run_id)
 need(not OUT_ROOT.exists() or (OUT_ROOT.is_dir() and not OUT_ROOT.is_symlink()),'unsafe result root')
 out=OUT_ROOT/run_id;need(not out.exists(),'output collision')
 r9_stop_path=S/'1370-c0-h-typecheck-collection-independent-observed-stop-review-r9/RECEIPT.json'
 r9_stop_pin='4cffcd747b9b538631314997134561de143f4a7f0d45aaf0c577a893b4558db4'
 need(binding.get('r9ObservedStopReceiptSha256')==r9_stop_pin and
      binding.get('rootDriftCause')=='UNATTRIBUTED_R9','r9 STOP attribution binding')
 r9_stop=json.loads(read_pin(r9_stop_path,r9_stop_pin,100000))
 need(r9_stop.get('decision')=='ACCEPT_OBSERVED_STOP_H_TYPECHECK_COLLECTION_R9' and
      r9_stop.get('resultStatus')=='STOP_POSTFLIGHT_DRIFT' and
      r9_stop.get('resultSha256')=='02cabccb0dcf7c3dea903690f7311eb23dda80790a9ab2b363eda1ab76075b90' and
      r9_stop.get('mirrorRootIdentityBefore')!=r9_stop.get('mirrorRootIdentityAfter') and
      r9_stop.get('sourceProofDigestBeforeAfter')==binding['fullReadbackDigestSha256'],
      'r9 independently observed STOP')
 baseline_path=S/'1370-c0-h-mirror-post-r9-baseline-recorded-r1/BASELINE.json'
 baseline_sha='f132e25fabc3fa654e85c3dcbe3616d10337b66fd9307b2e34b131bf9615d605'
 need(binding.get('freshBaselineResultPath')==str(baseline_path) and
      binding.get('freshBaselineResultSha256')==baseline_sha,'fresh baseline raw binding')
 baseline=json.loads(read_pin(baseline_path,baseline_sha,100000))
 need(baseline.get('decision')=='H_MIRROR_CURRENT_BASELINE_BYTES_CHECKED_OBSERVED_REVIEW_PENDING' and
      baseline.get('regularFiles')==1402 and baseline.get('regularBytes')==99516095 and
      baseline.get('symlinks')==1 and baseline.get('fileProofDigestSha256')==binding['fullReadbackDigestSha256'] and
      baseline.get('mirrorRootIdentity')==r9_stop['mirrorRootIdentityAfter'] and
      baseline.get('r9ObservedStopSha256')==r9_stop_pin and
      baseline.get('rootDriftCause')=='UNATTRIBUTED_R9' and
      baseline.get('sourceCommit')==H_COMMIT and baseline.get('sourceTree')==H_TREE and
      baseline.get('bridgeTree')==BRIDGE_TREE and baseline.get('productionHead')==CAPTURE_HEAD and
      baseline.get('productionSrcTree')==TREE and baseline.get('evidenceTip')==CAPTURE_EVIDENCE_TIP,
      'fresh baseline raw source/STOP/root roles')
 baseline_recorder_path=S/'1370-c0-h-mirror-post-r9-baseline-recorder-results-r1/20261008-h-mirror-post-r9-baseline-r1.RECORDER-RESULT.json'
 baseline_recorder_sha='19ad27f09ea9cce21a219a3a3ce8689cf8d40b569e10e13ca2dfd3cf0bdc986e'
 need(binding.get('freshBaselineRecorderResultPath')==str(baseline_recorder_path) and
      binding.get('freshBaselineRecorderResultSha256')==baseline_recorder_sha,
      'fresh baseline recorder binding')
 baseline_recorder=json.loads(read_pin(baseline_recorder_path,baseline_recorder_sha,100000))
 need(baseline_recorder.get('status')=='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' and
      baseline_recorder.get('childExit')==0 and baseline_recorder.get('groupClear') is True and
      baseline_recorder.get('sourceDeadlineSeconds')==600 and
      baseline_recorder.get('recorderActiveSeconds')==620 and
      baseline_recorder.get('recorderWholeSeconds')==630 and
      baseline_recorder.get('sourceSha256')=='7c65072c7a7f6b88eb668cc70efed3a7b7b1d28e6f60806d63b8e0543f0f8d36' and
      baseline_recorder.get('productionHead')==CAPTURE_HEAD and
      'error' not in baseline_recorder,'fresh baseline recorder child/group/bounds')
 baseline_meta_path=S/'c0-h-mirror-post-r9-baseline-20261008-r1.lane.log.meta'
 baseline_log_path=S/'c0-h-mirror-post-r9-baseline-20261008-r1.lane.log'
 need(binding.get('freshBaselineLaneMetaSha256')=='c10f17c660da06d3fa52a5c4521aea197b4e1056bea08faadba6713ad0623da2' and
      binding.get('freshBaselineLaneLogSha256')=='1b256419218b8100c1785bc7d7e86118c23f6ff6ccc605f2d1a1f51770f855b4',
      'fresh baseline lane pins')
 baseline_meta=read_pin(baseline_meta_path,binding['freshBaselineLaneMetaSha256'],100000)
 baseline_log=read_pin(baseline_log_path,binding['freshBaselineLaneLogSha256'],100000)
 terminal=[x for x in baseline_meta.splitlines() if x.startswith(b'end, exit ')]
 need(len(terminal)==1 and baseline_meta.splitlines()[-1]==terminal[0] and
      terminal[0].startswith(b'end, exit 0; ') and b'Traceback' not in baseline_log,
      'fresh baseline lane terminal')
 lane_lines=[json.loads(x) for x in baseline_log.splitlines()]
 need(len(lane_lines)==2 and lane_lines[0].get('receiptSha256')==baseline_sha and
      lane_lines[0].get('regularFiles')==1402 and lane_lines[0].get('regularBytes')==99516095 and
      lane_lines[1].get('recorderStatus')==baseline_recorder['status'] and
      lane_lines[1].get('childExit')==0 and lane_lines[1].get('groupClear') is True,
      'fresh baseline lane receipt/recorder lines')
 baseline_static_path=S/'1370-c0-h-mirror-post-r9-baseline-independent-static-review-r1/RECEIPT.json'
 baseline_exact_path=S/'1370-c0-h-mirror-post-r9-baseline-filled-launch-independent-exact-review-r2/RECEIPT.json'
 need(binding.get('freshBaselineStaticReviewSha256')=='7aae4ad9836dd1f98017a21eb9a3249ba16b71dbb043c0343255912a56002799' and
      binding.get('freshBaselineExactReviewSha256')=='c8307e9a62953e8d1e7f683eb3914a832188b357c355968b2e3d7ddc1234a09d',
      'fresh baseline independent review pins')
 baseline_static=json.loads(read_pin(baseline_static_path,binding['freshBaselineStaticReviewSha256'],100000))
 baseline_exact=json.loads(read_pin(baseline_exact_path,binding['freshBaselineExactReviewSha256'],100000))
 need(baseline_static.get('decision')=='ACCEPT_STATIC_CURRENT_H_MIRROR_BASELINE_SOURCE_ONLY' and
      baseline_exact.get('decision')=='ACCEPT_EXACT_H_POST_R9_BASELINE_LAUNCH_R2_ONLY' and
      baseline_static.get('sourceSha256')==baseline_recorder['sourceSha256'] and
      baseline_exact.get('sourceStaticReviewSha256')==binding['freshBaselineStaticReviewSha256'] and
      baseline_exact.get('productionHead')==CAPTURE_HEAD and
      baseline_exact.get('evidenceTip')==CAPTURE_EVIDENCE_TIP,
      'fresh baseline static/exact route')
 observed_path=S/'1370-c0-h-mirror-post-r9-baseline-independent-observed-review-r1/RECEIPT.json'
 observed_pin=binding.get('freshBaselineObservedReceiptSha256')
 need(binding.get('freshBaselineObservedReceiptPath')==str(observed_path) and
      isinstance(observed_pin,str) and re.fullmatch('[0-9a-f]{64}',observed_pin),
      'fresh baseline observed review unfilled')
 baseline_observed=json.loads(read_pin(observed_path,observed_pin,100000))
 need(baseline_observed.get('decision')=='ACCEPT_OBSERVED_H_CURRENT_MIRROR_BASELINE_BYTES_ONLY' and
      baseline_observed.get('baselineSha256')==baseline_sha and
      baseline_observed.get('recorderResultSha256')==baseline_recorder_sha and
      baseline_observed.get('r9ObservedStopSha256')==r9_stop_pin and
      baseline_observed.get('fileProofDigestSha256')==binding['fullReadbackDigestSha256'] and
      baseline_observed.get('mirrorRootIdentity')==baseline['mirrorRootIdentity'] and
      baseline_observed.get('nodeModulesLinkIdentity')==baseline['nodeModulesLinkIdentity'] and
      baseline_observed.get('r9RootIdentityAfter')==baseline['mirrorRootIdentity'] and
      baseline_observed.get('rootDriftCause')=='UNATTRIBUTED_R9' and
      baseline_observed.get('regularFiles')==1402 and baseline_observed.get('regularBytes')==99516095 and
      baseline_observed.get('entries')==1479 and baseline_observed.get('symlinks')==1 and
      baseline_observed.get('productionHead')==CAPTURE_HEAD and baseline_observed.get('productionSrcTree')==TREE and
      baseline_observed.get('evidenceTip')==CAPTURE_EVIDENCE_TIP and
      baseline_observed.get('sourceStaticReviewSha256')==binding['freshBaselineStaticReviewSha256'] and
      baseline_observed.get('exactLaunchR2ReviewSha256')==binding['freshBaselineExactReviewSha256'] and
      baseline_observed.get('laneLogSha256')==binding['freshBaselineLaneLogSha256'] and
      baseline_observed.get('laneMetaSha256')==binding['freshBaselineLaneMetaSha256'] and
      baseline_observed.get('recorderChildExit')==0 and baseline_observed.get('recorderGroupClear') is True, 
      'fresh baseline independent observed authority')
 source_before=full_source_check(mirror,manifest,run_id,True)
 need(source_before['fileProofDigestSha256']==binding['fullReadbackDigestSha256'] and
      source_before['dependencyLink']==tuple(old_result['sourceAfter']['dependencyLink']) and
      source_before['mirrorRootIdentity']==tuple(baseline['mirrorRootIdentity']) and
      source_before['dependencyLink'][:7]==tuple(baseline['nodeModulesLinkIdentity'])==tuple(readback['nodeModulesLinkIdentity']),
      'amended mirror proof/root/link drift')
 prod_deps=REPO/'node_modules';need(prod_deps.is_dir() and not prod_deps.is_symlink(),'production deps root')
 dep_before=walk_meta(prod_deps,run_id)
 link=mirror/'node_modules';need(link.is_symlink() and os.readlink(link)==str(prod_deps),'preexisting dependency link drift')
 OUT_ROOT.mkdir(mode=0o700,exist_ok=True);out.mkdir(mode=0o700)
 record={'schema':'1370-c0-h-typecheck-collection-result-r12','status':'RUNNING','arm':'H','runId':run_id,
         'mirrorRunId':binding['mirrorRunId'],'materializerResultSha256':binding['materializerResultSha256'],
         'sourceManifestSha256':MANIFEST_SHA,'sourceReviewSha256':REVIEW_SHA,
         'bridgeSourceResultSha256':BRIDGE_SOURCE_SHA,'fullReadbackResultSha256':binding['fullReadbackResultSha256'],
         'fullReadbackDigestSha256':binding['fullReadbackDigestSha256'],
         'freshBaselineResultSha256':baseline_sha,'freshBaselineObservedReceiptSha256':observed_pin,
         'r9ObservedStopReceiptSha256':r9_stop_pin,'r11ObservedStopReceiptSha256':R11_OBSERVED_STOP_SHA,
         'r11FailureLineProven':False,'rootDriftCause':'UNATTRIBUTED_R9',
         'sourceBefore':source_before,
         'nodeModulesBefore':dep_before,'children':[]}
 try:
  guard(run_id)
  node=NODE;tsc=str(REPO/'node_modules/.bin/tsc');vitest=str(REPO/'node_modules/.bin/vitest')
  dependency_check=str(S/'1370-c0-h-m0-typecheck-collection-route-template-r1/check-deps.mjs')
  read_pin(pathlib.Path(dependency_check),DEPS_CHECK_SHA,100000)
  need(cmd([NODE,'--version'])=='v22.23.2','Node runtime drift')
  for name,argv in [
      ('dependency-versions',[node,dependency_check,str(mirror),str(REPO),LOCK_SHA]),
      ('root-tsc',[tsc,'--noEmit']),
      ('ui-tsc',[tsc,'-p','ui/tsconfig.json','--noEmit']),
      ('diagnostic-collection',[vitest,'list','tests/diagnostic.test.ts','--project','core','--json',str(out/'collection.json'),'--no-cache'])]:
   before_child=root_checkpoint(mirror,run_id)
   boundary={'name':name,'before':before_child,'after':None}
   record.setdefault('rootChildBoundaries',[]).append(boundary)
   child_env={'PREIMAGE_OUTPUT':scratch_preimage_output(out)} if name=='diagnostic-collection' else None
   try:
    child=run_child(name,argv,mirror,out,run_id,child_env)
   except BaseException as child_error:
    boundary['childError']=repr(child_error)
    boundary['childPhase']=getattr(child_error,'_h_type_child_phase','unknown')
    boundary['childTraceback']=traceback.format_exc()[-6000:]
    raise
   finally:
    try:
     after_child=root_checkpoint(mirror,run_id)
     boundary['after']=after_child
    except BaseException as checkpoint_error:
     boundary['afterError']=repr(checkpoint_error)
     raise
   record['children'].append(child)
   if name=='diagnostic-collection' and child['exit']==0:
    record['preimageOutputIdentity']=check_preimage_output(out,run_id)
   need(child['exit']==0,name+' child exit '+str(child['exit']))
   need(before_child==after_child,name+' mirror root entry/metadata drift')
  collection=out/'collection.json'
  collected=stable_output(collection,MAX_COLLECTION,True)
  raw=collected['body'];parsed=json.loads(raw)
  need('tests/diagnostic.test.ts' in json.dumps(parsed) and len(raw)>10,'diagnostic test not collected')
  record['collectionSha256']=collected['sha256'];record['collectionBytes']=collected['bytes']
  need(full_source_check(mirror,manifest,run_id,True)['fileProofDigestSha256']==source_before['fileProofDigestSha256'],'source changed during checks')
  guard(run_id)
  record['status']='PASS_FULL_ERA_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY'
 except BaseException as error:
  record['status']='STOP_TYPECHECK_COLLECTION';record['error']=repr(error)
  raise
 finally:
  record['groupAlternateProofs']=GROUP_ALTERNATE_PROOFS
  try:
   record['sourceAfter']=full_source_check(mirror,manifest,run_id,True)
   record['nodeModulesAfter']=walk_meta(prod_deps,run_id)
   if (record['sourceAfter']['fileProofDigestSha256']!=source_before['fileProofDigestSha256'] or
       record['sourceAfter']['dependencyLink']!=source_before['dependencyLink'] or
       record['sourceAfter']['mirrorRootIdentity']!=source_before['mirrorRootIdentity'] or
       record['nodeModulesAfter']!=dep_before):
    record['status']='STOP_POSTFLIGHT_DRIFT'
  except BaseException as post_error:
   record['status']='STOP_POSTFLIGHT_UNVERIFIED';record['postflightError']=repr(post_error)
  record['elapsedSeconds']=round(time.monotonic()-START,3)
  receipt=out/'RESULT.json'
  receipt_sha=write_result(receipt,record)
  print(json.dumps({'status':record['status'],'receipt':str(receipt),'sha256':receipt_sha}),flush=True)
  need(record['status']=='PASS_FULL_ERA_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY','postflight or child failure')

if __name__=='__main__':
 try:main()
 except BaseException as e:
  print('STOP_TYPECHECK_COLLECTION '+repr(e),file=sys.stderr,flush=True)
  sys.exit(1)
