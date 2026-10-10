#!/usr/bin/env python3
"""HELD M0 dependency, types and diagnostic collection executor; no runtime grant embedded."""
import argparse, hashlib, json, math, os, pathlib, re, selectors, shutil, signal, stat, subprocess, sys, time, traceback
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
P=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-an-m0-post-r6-preservation-diagnostic-source-20261009-r2')
CONFIG_PATH=P/'CONFIG.json'
CONFIG_SHA='c40c0a34d07532d4690552318958029ec736d32283dcec59b0b33191bf82bc4c'
OUT_ROOT=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-an-m0-post-r6-preservation-diagnostic-results-20261009-r2')
MIRROR_ROOT=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-m0-observer-mirrors-20261009-r2')
CURRENT_HEAD='7087f116cf998fd86e33fb8e004df628e0686dbd'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF='refs/heads/wip/headless-program-20260916-ts'
MAIN_REF='refs/heads/main'
LOCAL_MAIN_REF='refs/remotes/origin/main'
MAIN_OID='c902a704eb948cc576083d0973c8c23e59937dc1'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
LOCK_SHA='728ee1693d3d4f33d04fc731264e442cb5f00e922fb36943aee9db9bf2e7c5de'
DEPS_CHECK_SHA='e61f6a88614eac49fcec3f326c162e4d44d75ea2999b6751581e30e7685b6a64'
NODE='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
MAX_CHILD_LOG=8*1024*1024
MAX_COLLECTION=1*1024*1024
MAX_RESULT=128*1024
WALL=300
FLOOR=3*1024**3
PREFLIGHT=int(3.5*1024**3)
START=globals().get('_BOOTSTRAP_START')
AUTHORITY=globals().get('_AUTHORITY')
CURRENT=None
GROUP_ALTERNATE_PROOFS=[]
CONFIG=None
M0_FACTS=None
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
 env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
 env['GIT_OPTIONAL_LOCKS']='0'
 return env


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
  raise RuntimeError('group signal denied; no accepted cleanup regardless of later clearance') from error


def stop_group(proc):
 if not group_alive(proc.pid,proc):
  try:proc.wait(timeout=1)
  except subprocess.TimeoutExpired as error:raise RuntimeError('group absent but direct child not reaped') from error
  need(proc.poll() is not None,'group absent but direct child status unknown')
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
 need(proc.poll() is not None,'direct child not reaped after cleanup')


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


def canonical_proof(rows):
 """Match the accepted r5 readback: UTF-8 path order and exact five-field rows."""
 need(isinstance(rows,dict) and len(rows)==len(set(rows)), 'proof row map')
 digest=hashlib.sha256()
 for rel in sorted(rows,key=lambda x:x.encode('utf-8')):
  row=rows[rel]
  need(isinstance(row,list) and len(row)==5 and row[0]==rel, 'proof row schema/order')
  digest.update(json.dumps(row,separators=(',',':')).encode('utf-8')+b'\n')
 return digest.hexdigest()


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
               'TMPDIR':str(out),'VITEST_CACHE_DIR':str(out/'vitest-cache')})
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


remaining()
SOURCE_LAST_GUARD=float("-inf")
def guard(run_id):
 remaining()
 need(CONFIG is not None and run_id==CONFIG['runId'],'wrong M0 run')
 lane=read_pin(S/'HEAVY-LANE-LOCK',AUTHORITY['laneLock']['sha256'],10000)
 need(pathlib.Path(CONFIG['laneLog']).name.encode() in lane,'wrong heavy lane')
 need(cmd(['pmset','-g','batt']).splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB disk floor')
 need(cmd(['git','rev-parse','HEAD'])==CURRENT_HEAD and cmd(['git','rev-parse','HEAD:src'])==TREE and
      cmd(['git','status','--porcelain=v1'])=='','production source drift')
 need(cmd(['git','remote','get-url','origin'])==ORIGIN,'origin URL drift')
 for local_ref,remote_ref,oid in ((REF,REF,CURRENT_HEAD),(LOCAL_MAIN_REF,MAIN_REF,MAIN_OID)):
  need(cmd(['git','rev-parse',local_ref])==oid and cmd(['git','ls-remote','origin',remote_ref])==oid+'\t'+remote_ref,'local/remote ref drift')
 for ref,oid in AUTHORITY.get('additionalRefs',{}).items():
  need(type(ref) is str and ref.startswith('refs/heads/') and re.fullmatch('[0-9a-f]{40}',oid),'additional ref type')
  need(cmd(['git','rev-parse',ref])==oid and cmd(['git','ls-remote','origin',ref])==oid+'\t'+ref,'additional current ref drift')
def normalized(st):
 return (st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def full_source_check(mirror,manifest,run_id,allow_deps_link=False):
 """Exact admitted M0 roster, content and physical metadata through no-follow dirfds."""
 expected=M0_FACTS['files'];directories=M0_FACTS['directories'];links=M0_FACTS['symlinks']
 need(len(expected)==1740 and sum(r['bytes'] for r in expected.values())==119393120 and
      len(directories)==113 and set(links)=={'node_modules'},'M0 authenticated roster')
 overlays={r['destination']:r for r in manifest['files']}
 need(len(overlays)==5 and all(expected[k]['bytes']==v['bytes'] and expected[k]['sha256']==v['sha256'] for k,v in overlays.items()),'five M0 overlays')
 held=open_dir_chain(mirror);rootfd=held[-1];root_before=fields(os.fstat(rootfd))
 proof_rows={};metadata_rows={};seen_dirs=set();state={'entries':0};total=0;deps_link=None
 try:
  def descend(fd,prefix):
   nonlocal total,deps_link
   before=fields(os.fstat(fd));dirrel=prefix[:-1] if prefix else '.'
   if dirrel=='.':
    need(fields(os.fstat(fd))==tuple(CONFIG['knownRootDrift']['recordedAfterIdentity']),'exact recorded post-R6 root metadata')
    need(tuple(directories['.'])==tuple(CONFIG['knownRootDrift']['historicalNormalizedIdentity']),'historical root metadata binding')
   else:
    need(dirrel in directories and normalized(os.fstat(fd))==tuple(directories[dirrel]),'admitted directory metadata '+dirrel)
   seen_dirs.add(dirrel);metadata_rows[dirrel]=list(before)
   for name in bounded_names(fd,state,CONFIG['entryCap'],run_id):
    source_step(run_id)
    need(name not in ('','.','..') and '/' not in name,'unsafe mirror name')
    rel=prefix+name;st=os.stat(name,dir_fd=fd,follow_symlinks=False)
    if stat.S_ISDIR(st.st_mode):
     need(rel in directories,'extra mirror directory '+rel)
     child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(child))==fields(st),'mirror directory open drift')
      descend(child,rel+'/')
      need(fields(os.fstat(child))==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'mirror directory changed')
     finally:os.close(child)
    elif stat.S_ISLNK(st.st_mode):
     need(allow_deps_link and rel=='node_modules' and deps_link is None and st.st_nlink==1,'unexpected dependency link')
     target=os.readlink(name,dir_fd=fd)
     need(normalized(st)==tuple(links[rel]['identity']) and target==links[rel]['target']==str(REPO/'node_modules') and
          fields(st)==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'dependency link changed')
     deps_link=fields(st)+(target,);metadata_rows[rel]=list(deps_link)
    else:
     need(rel in expected and rel not in proof_rows,'extra/duplicate mirror file '+rel)
     row=expected[rel];size=row['bytes']
     need(stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size==size and normalized(st)==tuple(row['identity']),'admitted mirror file metadata '+rel)
     filefd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(filefd))==fields(st),'mirror open drift '+rel)
      blob=hashlib.sha1(f'blob {size}\0'.encode());content=hashlib.sha256();count=0
      while True:
       source_step(run_id);chunk=os.read(filefd,1<<20)
       if not chunk:break
       count+=len(chunk);need(count<=size,'mirror file grew '+rel);blob.update(chunk);content.update(chunk)
      need(count==size and fields(os.fstat(filefd))==fields(st)==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'mirror file read drift '+rel)
     finally:os.close(filefd)
     got_oid=blob.hexdigest();got_sha=content.hexdigest();got_mode=stat.S_IMODE(st.st_mode)
     need(got_oid==row['gitBlobOid'] and got_sha==row['sha256'],'M0 file bytes '+rel)
     proof_rows[rel]=[rel,size,got_oid,got_sha,got_mode];metadata_rows[rel]=list(fields(st));total+=size
   need(fields(os.fstat(fd))==before,'mirror directory mutation')
  descend(rootfd,'')
  need(set(proof_rows)==set(expected) and seen_dirs==set(directories) and len(proof_rows)==1740 and total==119393120 and
       deps_link is not None and state['entries']==CONFIG['entryCap'],'M0 complete roster/count/bytes/link')
  need(fields(os.fstat(rootfd))==root_before,'mirror root mutation');verify_dir_chain(mirror,held)
  meta=b''.join(json.dumps([k,metadata_rows[k]],separators=(',',':')).encode()+b'\n' for k in sorted(metadata_rows,key=lambda x:x.encode()))
  historical_rows=dict(metadata_rows);historical_rows['.']=CONFIG['knownRootDrift']['recordedBeforeIdentity']
  historical_meta=b''.join(json.dumps([k,historical_rows[k]],separators=(',',':')).encode()+b'\n' for k in sorted(historical_rows,key=lambda x:x.encode()))
  nonroot_meta=b''.join(json.dumps([k,metadata_rows[k]],separators=(',',':')).encode()+b'\n' for k in sorted(metadata_rows,key=lambda x:x.encode()) if k!='.')
  need(sha(historical_meta)==CONFIG['knownRootDrift']['historicalMetadataSha256'] and sha(nonroot_meta)==CONFIG['knownRootDrift']['nonrootMetadataSha256'],'complete historical remainder metadata')
  return {'fileProofDigestSha256':canonical_proof(proof_rows),'physicalMetadataSha256':sha(meta),
          'historicalRootSubstitutedMetadataSha256':sha(historical_meta),'nonrootMetadataSha256':sha(nonroot_meta),
          'mirrorFiles':len(proof_rows),'mirrorBytes':total,'dependencyLink':list(deps_link),'traversedEntries':state['entries'],'mirrorRootIdentity':list(root_before)}
 finally:close_chain(held)
def load_m0_authorities():
 global M0_FACTS
 def role(name,cap=100000):
  r=CONFIG['sourceAuthorities'][name];return json.loads(read_pin(pathlib.Path(r['path']),r['sha256'],cap))
 copied=role('m0CopyParentAdoption');complete=role('m0CompleteParentAdoption');review=role('m0CompleteIndependentReview')
 need(copied['decision']=='ADOPT_OBSERVED_M0_SOURCE_ONLY_COPY_AND_FULL_POSTFLIGHT','M0 source copy adoption')
 need(complete['status']=='ROOT_ADOPTED_OBSERVED_M0_ADDITIVE_WITH_FULL_PROTECTION' and
      review['decision']=='ACCEPT_OBSERVED_M0_ADDITIVE_COMPLETE_WITH_FULL_PROTECTED_POSTFLIGHT','complete M0 adoption/review')
 need(complete['regularFiles']==1740 and complete['regularBytes']==119393120 and complete['bridgeFiles']==63 and
      complete['bridgeBytes']==1517743 and complete['dependencyLinks']==1 and complete['dependencyPackageRoles']==21,'M0 complete physical counts')
 need(complete['acceptedRoles']['facts']==CONFIG['sourceAuthorities']['m0PhysicalFacts'] and
      complete['acceptedRoles']['completeIndependentReview']==CONFIG['sourceAuthorities']['m0CompleteIndependentReview'] and
      complete['protectedPostflightAccepted'] is True and complete['fullImmutableEqualityAccepted'] is True and
      complete['original1677StrictPreservationAccepted'] is True,'complete M0 exact adopted facts/review/protection')
 M0_FACTS=role('m0PhysicalFacts',2*1024*1024)
 need(M0_FACTS['original1677StrictFileMetadataPreserved'] is True and M0_FACTS['actualRegularFiles']==1740 and
      M0_FACTS['actualRegularBytes']==119393120,'original source physical facts')
 manifest=role('sourceManifest');source_review=role('sourceReview');hstop=role('typeObservedHStop')
 need(manifest['arm']=='M0' and len(manifest['files'])==5 and source_review['decision']=='ACCEPT_STATIC_FULL_ERA_OBSERVER_ONLY' and
      source_review['sourceManifestSha256']==CONFIG['sourceAuthorities']['sourceManifest']['sha256'] and
      source_review['sourceCommit']==copied['sourceCommit']==CONFIG['historicalM0SourceCommit'] and
      copied['sourceTree']==CONFIG['productionSourceTree'],'M0 five-overlay authority')
 need(hstop['decision']=='ACCEPT_OBSERVED_STOP_H_TYPECHECK_COLLECTION_R13' and
      hstop['sourceStatus']=='STOP_POSTFLIGHT_DRIFT' and hstop['runtimeClaim']=='STOP_ONLY_NO_TYPE_GATE','H13 metadata STOP remains')
 return manifest
def full_dependency_check(root,run_id):
 held=open_dir_chain(root)
 try:
  before=fields(os.fstat(held[-1]));proof=walk_meta(root,run_id)
  need(fields(os.fstat(held[-1]))==before,'dependency root metadata mutation')
  verify_dir_chain(root,held);proof['rootIdentity']=list(before);return proof
 finally:close_chain(held)
def exact_package_roles(run_id):
 packages=CONFIG['dependencyPackages']
 need(type(packages) is dict and len(packages)==21 and len(M0_FACTS['roleIdentities'])==1802 and
      all(row==M0_FACTS['roleIdentities'].get(path) for path,row in packages.items()),
      'exact 21-package projection of complete 1802-role physical facts')
 for path,row in packages.items():
  source_step(run_id);p=pathlib.Path(path);held=open_dir_chain(p.parent)
  try:
   st=os.stat(p.name,dir_fd=held[-1],follow_symlinks=False)
   need(normalized(st)==tuple(row['identity']),'dependency package metadata drift '+path)
   raw=read_pin(p,row['sha256'],1024*1024)
   need(len(raw)==row['bytes'] and normalized(os.stat(p.name,dir_fd=held[-1],follow_symlinks=False))==tuple(row['identity']),'dependency package role drift '+path)
   verify_dir_chain(p.parent,held)
  finally:close_chain(held)
def diagnostic_role(r,cap=128*1024,parse_json=True):
 need(type(r) is dict and set(r)=={'path','bytes','sha256'} and type(r['bytes']) is int and 0<r['bytes']<=cap,'diagnostic evidence role schema')
 raw=read_pin(pathlib.Path(r['path']),r['sha256'],cap);need(len(raw)==r['bytes'],'diagnostic evidence role size')
 return json.loads(raw) if parse_json else raw

def validate_diagnostic_inputs():
 evidence=CONFIG['diagnosticEvidence'];known=CONFIG['knownRootDrift']
 result=diagnostic_role(evidence['r6Result']);rb=diagnostic_role(evidence['r6Readback']);review=diagnostic_role(evidence['r6ObservedReview']);adoption=diagnostic_role(evidence['r6RootStopAdoption'])
 need(result['status']=='STOP_POSTFLIGHT_UNVERIFIED' and 'sourceAfter' not in result and 'nodeModulesAfter' not in result,'original R6 STOP and missing after proofs')
 boundary=result['rootChildBoundaries'][3]
 need(boundary['name']=='diagnostic-collection' and boundary['before']['identity']==known['recordedBeforeIdentity'] and boundary['after']['identity']==known['recordedAfterIdentity'] and boundary['before']['entries']==boundary['after']['entries'] and boundary['before']['rosterSha256']==boundary['after']['rosterSha256']==known['rosterSha256'],'exact R6 recorded root drift')
 need(known['recordedBeforeIdentity'][:5]==known['recordedAfterIdentity'][:5] and known['recordedBeforeIdentity'][5:]!=known['recordedAfterIdentity'][5:],'only known root timestamps')
 need(rb['typesResult']==evidence['r6Result'] and rb['sourceAfterAvailable'] is False and rb['dependencyAfterAvailable'] is False,'actual R6 readback')
 need(review['decision']=='ACCEPT_OBSERVED_STOP_M0_TYPES_ROOT_METADATA_DRIFT_WITH_SHARED_FULL_POSTFLIGHT' and review['result']==evidence['r6Result'] and review['typesAccepted'] is False and review['m0SourcePreservationAccepted'] is False,'independent original STOP')
 need(adoption['status']=='ROOT_ADOPTED_OBSERVED_STOP_M0_TYPES_ROOT_METADATA_DRIFT_WITH_SHARED_FULL_POSTFLIGHT' and adoption['actualTypesResult']==evidence['r6Result'] and adoption['independentObservedReview']==evidence['r6ObservedReview'] and adoption['typesAccepted'] is False and adoption['m0SourcePreservationAccepted'] is False,'root original STOP')
 need(M0_FACTS['directories']['.']==known['historicalNormalizedIdentity'],'authentic historical dot identity')
 historic=list(known['historicalNormalizedIdentity']);historic[2]|=stat.S_IFDIR
 need(historic==known['recordedBeforeIdentity'],'historical raw dot equals recorded before')
 inputs=AUTHORITY['diagnosticInputs']
 need(type(inputs) is dict and set(inputs)=={'controlsObservedReview','controlsRootAdoption','currentAMFullPreflight','currentAMFullPreflightAdoption'},'external diagnostic prerequisites')
 controls_review=diagnostic_role(inputs['controlsObservedReview']);controls_adoption=diagnostic_role(inputs['controlsRootAdoption'])
 need(controls_review['decision']=='ACCEPT_ACTUAL_DISPOSABLE_METADATA_PAIR_ONLY' and controls_review['concreteFindings']==[] and controls_review['executionAuthorization'] is False,'observed disposable pair independent review')
 need(controls_adoption['status']=='ROOT_ADOPTED_ACTUAL_DISPOSABLE_METADATA_PAIR_ONLY' and controls_adoption['independentObservedReview']==inputs['controlsObservedReview'],'root observed disposable pair adoption')
 outcome=diagnostic_role(controls_adoption['outcome']);summary=diagnostic_role(controls_adoption['consumerSummary']);tool=diagnostic_role(controls_adoption['consumerActualTool'])
 need(outcome['status']=='ACTUAL_DISPOSABLE_METADATA_CONTROLS_COMPLETED' and outcome['oneAggregateRun'] is True and outcome['automaticRetry'] is False and all(type(v) is int and v==0 for v in outcome['actualExits'].values()) and set(outcome['actualExits'])=={'tool','helper','recorder','controller','RED','GREEN'},'actual six disposable exits')
 need(summary['decision']=='ACCEPT_ACTUAL_DISPOSABLE_PAIR_ONLY' and summary['outcomePath']==controls_adoption['outcome']['path'] and summary['outcomeSha256']==controls_adoption['outcome']['sha256'] and summary['redMetadataChanged'] is True and summary['greenFullFixtureMetadataStable'] is True and summary['sameRawCollectedTestIdentity'] is True and summary['originalM0CauseAdmission'] is False and summary['originalM0SourcePreservationAdmission'] is False,'actual disposable consumer scope')
 need(type(tool['actualTool']['exit_code']) is int and tool['actualTool']['exit_code']==0 and tool['stdoutSummary']==summary,'actual disposable consumer terminal tool and retained summary')
 guard_adoption=diagnostic_role(inputs['currentAMFullPreflightAdoption']);snapshot=diagnostic_role(inputs['currentAMFullPreflight'],16*1024*1024)
 need(guard_adoption['status']=='ROOT_ADOPTED_CURRENT_AM_FULL_PREFLIGHT' and guard_adoption['productionHead']==CURRENT_HEAD and guard_adoption['productionSourceTree']==TREE and guard_adoption['freshFullInventory'] is True and guard_adoption['snapshot']==inputs['currentAMFullPreflight'],'fresh current AM full protection adoption')
 need(guard_adoption['sourcePins']==evidence['currentAMGuardSourcePins'],'reviewed AM guard source pins')
 guard_pins=diagnostic_role(evidence['currentAMGuardSourcePins'])
 need(guard_adoption['guardSource']==guard_pins['files']['snapshot.py'] and guard_adoption['config']==guard_pins['files']['CONFIG.json'],'exact original guard AM-only binding')
 diagnostic_role(guard_adoption['guardSource'],parse_json=False);guard_config=diagnostic_role(guard_adoption['config']);old_config=diagnostic_role(evidence['historicalSharedGuardConfig'])
 actual_guard_tool=diagnostic_role(guard_adoption['actualTool']);ownership=diagnostic_role(guard_adoption['postOwnership']);raw_roles=diagnostic_role(guard_adoption['rawLocalOnlyClassification'])
 need(type(actual_guard_tool['finalExit']) is int and actual_guard_tool['finalExit']==0 and ownership['heavyLaneLockAbsent'] is True and all(r['result']=='ESRCH' for r in ownership['checks']),'actual full preflight and scanner clearance')
 need(len(raw_roles['roles'])==4 and all(r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY' for r in raw_roles['roles']),'full preflight raw local-only classification')
 allowed={'productionHead','operationalRemoteRefs','parentScopeAdoption','status','declaredWitnessScratchChildren','sourceReviewSha256','sourcePinsSha256'}
 need(set(guard_config)==set(old_config) and all(guard_config[k]==v for k,v in old_config.items() if k not in allowed),'original full guard config protections')
 need(guard_config['productionHead']==CURRENT_HEAD and guard_config['productionSourceTree']==TREE and guard_config['operationalRemoteRefs']=={REF:CURRENT_HEAD,MAIN_REF:MAIN_OID} and all(k in guard_config['declaredWitnessScratchChildren'] for k in old_config['declaredWitnessScratchChildren']),'current AM guard bindings')
 scope_role=guard_pins['operationalScope']
 need(guard_config['parentScopeAdoption']=={k:scope_role[k] for k in ('path','sha256')},'exact AM operational scope role')
 scope=diagnostic_role(scope_role)
 need(scope['productionGuardHead']==CURRENT_HEAD and scope['productionSourceTree']==TREE,'genuine AM operational scope')
 need(snapshot['status']=='GUARDS_ACCEPTED_READONLY' and snapshot['snapshotProcedureSha256']==guard_adoption['guardSource']['sha256'] and snapshot['configSha256']==guard_adoption['config']['sha256'] and type(snapshot['inventoryElapsedSeconds']) in (int,float) and math.isfinite(snapshot['inventoryElapsedSeconds']) and snapshot['inventoryElapsedSeconds']>0,'actual fresh full AM inventory')
 for side in ('currentBefore','currentAfter'):
  current=snapshot[side]
  need(current['fdOriginalAndEphemeralAndRetainedHPassed'] is True and current['fdOriginalM0ParentPassed'] is True and current['relevantWorkersAbsent'] is True,'full AM current FD/worker guards')
 need(AUTHORITY.get('currentProtection') is None and AUTHORITY.get('freshSourceProof') is None and AUTHORITY.get('freshDependencyProof') is None,'no future diagnostic proof authority cycle')

def main():
 global CONFIG
 signal.signal(signal.SIGTERM,on_signal);signal.signal(signal.SIGINT,on_signal)
 need(type(AUTHORITY) is dict,'authenticated external proof authority required')
 CONFIG=json.loads(read_pin(CONFIG_PATH,CONFIG_SHA,100000))
 run_id=CONFIG['runId'];mirror=pathlib.Path(CONFIG['mirrorPath']);out=OUT_ROOT/run_id
 need(mirror==pathlib.Path(AUTHORITY['mirrorPath']) and not os.path.lexists(out),'mirror role/output collision')
 need(AUTHORITY.get('currentProtection') is None and AUTHORITY.get('freshSourceProof') is None and AUTHORITY.get('freshDependencyProof') is None,'no manufactured future proof/protection')
 guard(run_id);need(shutil.disk_usage(S).free>=PREFLIGHT,'3.5 GiB preflight')
 manifest=load_m0_authorities();validate_diagnostic_inputs()
 prod_deps=REPO/'node_modules';need(prod_deps.is_dir() and not prod_deps.is_symlink(),'production deps root')
 OUT_ROOT.mkdir(mode=0o700,exist_ok=True);out.mkdir(mode=0o700)
 record={'schema':'1370-post-r6-m0-preservation-diagnostic-result/v1','status':'RUNNING','runId':run_id,
         'productionHead':CURRENT_HEAD,'productionSourceTree':TREE,'sourceCommit':CONFIG['historicalM0SourceCommit'],
         'historicalDataAuthorityHead':CONFIG['historicalDataAuthorityHead'],'mirrorPath':str(mirror),
         'completeM0AdoptionSha256':CONFIG['sourceAuthorities']['m0CompleteParentAdoption']['sha256'],
         'physicalFactsSha256':CONFIG['sourceAuthorities']['m0PhysicalFacts']['sha256'],
         'sourceReviewSha256':AUTHORITY['sourceReview']['sha256'],'actualGrantSha256':AUTHORITY['actualGrant']['sha256'],
         'freshSourceProof':None,'freshDependencyProof':None,'sourceAfter':None,'dependencyAfter':None,
         'typesCommandsExecuted':0,'collectionCommandsExecuted':0,'game':False,'currentProtection':None,
         'knownRootDrift':CONFIG['knownRootDrift'],'diagnosticInputs':AUTHORITY['diagnosticInputs'],
         'historicalRootUnchanged':False,'newRootBaselineAdopted':False,'typesAccepted':False,'originalR6StopPreserved':True}
 try:
  source_before=full_source_check(mirror,manifest,run_id,True)
  exact_package_roles(run_id);dep_before=full_dependency_check(prod_deps,run_id)
  record['freshSourceProof']=source_before;record['freshDependencyProof']=dep_before
  guard(run_id)
  record['sourceAfter']=full_source_check(mirror,manifest,run_id,True)
  exact_package_roles(run_id);record['dependencyAfter']=full_dependency_check(prod_deps,run_id)
  need(record['sourceAfter']==source_before and record['dependencyAfter']==dep_before,'current source/dependency proof drift')
  guard(run_id);record['status']='PASS_READONLY_POST_R6_M0_PRESERVATION_DIAGNOSTIC_KNOWN_ROOT_DRIFT'
 except BaseException as error:
  record['status']='STOP_POST_R6_M0_PRESERVATION_DIAGNOSTIC';record['error']=repr(error);raise
 finally:
  record['groupAlternateProofs']=GROUP_ALTERNATE_PROOFS
  record['elapsedSeconds']=round(time.monotonic()-START,3)
  receipt=out/'RESULT.json';receipt_sha=write_result(receipt,record)
  print(json.dumps({'status':record['status'],'receipt':str(receipt),'sha256':receipt_sha}),flush=True)
 need(record['status']=='PASS_READONLY_POST_R6_M0_PRESERVATION_DIAGNOSTIC_KNOWN_ROOT_DRIFT','proof failure')
if __name__=='__main__':
 try:main()
 except BaseException as e:
  print('STOP_TYPECHECK_COLLECTION '+repr(e),file=sys.stderr,flush=True)
  sys.exit(1)
