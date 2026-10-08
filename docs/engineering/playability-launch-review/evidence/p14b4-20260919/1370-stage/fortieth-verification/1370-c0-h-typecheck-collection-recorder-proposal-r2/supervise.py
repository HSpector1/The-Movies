#!/usr/bin/env python3
"""UNRUN H full-era typecheck collection outer recorder; requires reviewed exact loader."""
# This source is authenticated by the exact launch loader and is UNRUN.
import hashlib,json,math,os,pathlib,selectors,shutil,signal,stat,subprocess,sys,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
RESULT=S/'1370-c0-h-typecheck-collection-recorder-results-r2/20261008-h-types-r9.RECORDER-RESULT.json'
BOOTSTRAP=S/'1370-c0-h-typecheck-collection-recorder-proposal-r2/BOOTSTRAP.py'
BOOTSTRAP_SHA='2533104797bca7feac9a0d4215c9144f57d14f53488bdb7364e55e8cdcdca4a4'
STATIC_REVIEW=S/'1370-c0-h-typecheck-r11-source-independent-static-review-r1/RECEIPT.json'
STATIC_SHA='5893c1dea2d14162cc6d666de0258ee8ebea7328f516aedc4cbcccc987acb5c1'
BINDING=S/'1370-c0-h-typecheck-collection-filled-exact-r11/BINDING.json'
BINDING_SHA=globals().get('BINDING_SHA')
HEAD='afea5fb6abba09bec6cada7e4c5a1ccfaf05caff'
SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EVIDENCE='6516532ac67ffcafc66fd424abb89bc1bc0acc2e'
PRODUCTION_REF='refs/heads/wip/headless-program-20260916-ts'
EVIDENCE_REF='refs/heads/evidence/1370-r10-clean-captures'
LANE_LOG='c0-h-types-20261008-h-types-r9.lane.log'
ACTIVE=320
LIMIT=330
START=globals()['LAUNCH_START']
if type(START) not in (int,float) or not math.isfinite(START) or not 0<=time.monotonic()-START<ACTIVE:
 raise RuntimeError('invalid recorder loader start / elapsed bound')
CHILD=None

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def identity(x):return (x.st_dev,x.st_ino,x.st_mode)
def attrs(x):return (x.st_dev,x.st_ino,x.st_mode,x.st_nlink,x.st_size,x.st_mtime_ns,x.st_ctime_ns)
def parent_fd(path):
 need(path.is_absolute() and all(p not in ('','.','..') for p in path.parts[1:]),'unsafe pin path')
 fd=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);chain=[]
 try:
  for component in path.parts[1:-1]:
   before=os.stat(component,dir_fd=fd,follow_symlinks=False)
   child=os.open(component,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
   need(stat.S_ISDIR(before.st_mode) and identity(before)==identity(os.fstat(child)),'pin parent drift')
   chain.append((component,identity(before)));os.close(fd);fd=child
  return fd,chain
 except BaseException:os.close(fd);raise
def read_pin(path,cap,pin=None):
 parent,chain=parent_fd(path)
 try:
  before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap,'unsafe pin file')
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   need(attrs(before)==attrs(os.fstat(fd)),'pin open drift')
   parts=[];count=0
   while chunk:=os.read(fd,65536):
    remaining_active();count+=len(chunk);need(count<=cap and count<=before.st_size,'pin growth')
    parts.append(chunk)
   raw=b''.join(parts)
   need(count==before.st_size and attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False)),'pin changed')
  finally:os.close(fd)
 finally:os.close(parent)
 check,after=parent_fd(path)
 try:need(after==chain,'pin parent pathname changed')
 finally:os.close(check)
 if pin is not None:need(hashlib.sha256(raw).hexdigest()==pin,'pin SHA')
 return raw
def command(*args):
 env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
 deadline=time.monotonic()+min(15,remaining_active())
 selector=selectors.DefaultSelector()
 try:
  proc=subprocess.Popen(args,cwd=REPO,env=env,stdin=subprocess.DEVNULL,
                        stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
 except BaseException:selector.close();raise
 out=bytearray();err=bytearray()
 try:
  for stream,target in ((proc.stdout,out),(proc.stderr,err)):
   os.set_blocking(stream.fileno(),False)
   selector.register(stream,selectors.EVENT_READ,target)
  while selector.get_map():
   remaining_active();need(time.monotonic()<deadline,'guard 15-second deadline')
   for key,_ in selector.select(timeout=min(.25,deadline-time.monotonic())):
    try:part=os.read(key.fileobj.fileno(),65536)
    except BlockingIOError:continue
    if not part:selector.unregister(key.fileobj);key.fileobj.close()
    else:key.data.extend(part);need(len(key.data)<=2*1024*1024,'guard output cap')
  proc.wait(timeout=min(remaining_active(),max(.001,deadline-time.monotonic())))
  need(not group_alive(proc.pid),'guard descendant survived')
  need(proc.returncode==0,'guard failed '+repr(args)+repr(bytes(err[-300:])))
  return bytes(out).strip().decode('utf-8','replace')
 except BaseException:
  try:os.killpg(proc.pid,signal.SIGTERM)
  except ProcessLookupError:pass
  try:proc.wait(timeout=2)
  except subprocess.TimeoutExpired:pass
  try:os.killpg(proc.pid,signal.SIGKILL)
  except ProcessLookupError:pass
  try:proc.wait(timeout=2)
  except subprocess.TimeoutExpired:pass
  need(not group_alive(proc.pid),'guard group survived cleanup')
  raise
 finally:
  selector.close()
  for stream in (proc.stdout,proc.stderr):
   if stream is not None and not stream.closed:stream.close()
def git(*args):return command('git',*args)
def preflight():
 need(shutil.disk_usage(S).free>=int(3.5*1024**3),'3.5 GiB preflight')
 need(command('pmset','-g','batt').splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(LANE_LOG.encode() in read_pin(S/'HEAVY-LANE-LOCK',10000),'sole recorded lane')
 need(git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')==SRC and git('status','--porcelain=v1')=='','production source identity')
 need(git('remote','get-url','origin')=='https://github.com/HSpector1/The-Movies.git' and
      git('config','--get','remote.origin.url')=='https://github.com/HSpector1/The-Movies.git','origin URL')
 for ref,oid in ((PRODUCTION_REF,HEAD),(EVIDENCE_REF,EVIDENCE)):
  need(git('rev-parse',ref)==oid and git('ls-remote','origin',ref)==oid+'\t'+ref,'local/remote ref')
 need(shutil.disk_usage(S).free>=3*1024**3,'3 GiB floor')
def remaining_active():
 elapsed=time.monotonic()-START
 need(type(START) in (int,float) and math.isfinite(START) and 0<=elapsed<ACTIVE,'invalid/expired recorder active elapsed')
 return ACTIVE-elapsed
def remaining_total():
 elapsed=time.monotonic()-START
 need(type(START) in (int,float) and math.isfinite(START) and 0<=elapsed<LIMIT,'invalid/expired recorder whole elapsed')
 return LIMIT-elapsed
def group_alive(pid):
 try:os.killpg(pid,0);return True
 except ProcessLookupError:return False
def stop_group(pid):
 try:os.killpg(pid,signal.SIGTERM)
 except ProcessLookupError:return
 if CHILD is not None:
  try:CHILD.wait(timeout=3)
  except subprocess.TimeoutExpired:pass
 until=time.monotonic()+3
 while time.monotonic()<until and group_alive(pid):time.sleep(.05)
 if group_alive(pid):
  try:os.killpg(pid,signal.SIGKILL)
  except ProcessLookupError:pass
  if CHILD is not None:
   try:CHILD.wait(timeout=3)
   except subprocess.TimeoutExpired:pass
  until=time.monotonic()+3
  while time.monotonic()<until and group_alive(pid):time.sleep(.05)
 need(not group_alive(pid),'surviving typecheck child process group')
def alarm(*_):raise TimeoutError('320-second recorder active deadline')
def hard_alarm(*_):
 if CHILD is not None:
  try:os.killpg(CHILD.pid,signal.SIGKILL)
  except ProcessLookupError:pass
 os.write(2,b'STOP_H_TYPES_RECORDER_WHOLE_DEADLINE_330S_CHILD_GROUP_KILLED\n')
 raise TimeoutError('330-second recorder whole deadline; child group KILL sent')
def interrupted(signum,*_):raise InterruptedError('recorder signal '+str(signum))
def scratch_fd():
 need(S.is_absolute(),'scratch path')
 parent=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  for component in S.parts[1:]:
   before=os.stat(component,dir_fd=parent,follow_symlinks=False)
   child=os.open(component,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
   after=os.fstat(child)
   need(stat.S_ISDIR(before.st_mode) and (before.st_dev,before.st_ino,before.st_mode)==(after.st_dev,after.st_ino,after.st_mode),'scratch parent drift')
   os.close(parent);parent=child
  return parent
 except BaseException:os.close(parent);raise
def safe_result(row):
 raw=(json.dumps(row,indent=2,sort_keys=True)+'\n').encode();need(len(raw)<=100000,'recorder result cap')
 digest=hashlib.sha256(raw).hexdigest()
 root=scratch_fd();rootstat=os.fstat(root)
 try:
  name=RESULT.parent.name
  try:os.mkdir(name,0o700,dir_fd=root)
  except FileExistsError:pass
  parent=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=root)
  try:
   st=os.fstat(parent);pathst=os.stat(name,dir_fd=root,follow_symlinks=False)
   need((st.st_dev,st.st_ino,st.st_mode)==(pathst.st_dev,pathst.st_ino,pathst.st_mode),'recorder result parent drift')
   temp=RESULT.name+'.partial'
   fd=os.open(temp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
   with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
   os.link(temp,RESULT.name,src_dir_fd=parent,dst_dir_fd=parent,follow_symlinks=False)
   os.unlink(temp,dir_fd=parent)
   os.fsync(parent)
   fstat=os.stat(RESULT.name,dir_fd=parent,follow_symlinks=False)
   fd=os.open(RESULT.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
   try:
    need(stat.S_ISREG(fstat.st_mode) and fstat.st_nlink==1 and fstat.st_size==len(raw),'recorder result file identity')
    got=b''
    while piece:=os.read(fd,65536):
     got+=piece;need(len(got)<=len(raw),'recorder result grew')
    after=os.fstat(fd);pathafter=os.stat(RESULT.name,dir_fd=parent,follow_symlinks=False)
    fields=lambda x:(x.st_dev,x.st_ino,x.st_mode,x.st_nlink,x.st_size,x.st_mtime_ns,x.st_ctime_ns)
    need(fields(fstat)==fields(after)==fields(pathafter) and hashlib.sha256(got).hexdigest()==digest,'recorder result readback drift')
   finally:os.close(fd)
   post=os.stat(name,dir_fd=root,follow_symlinks=False)
   need((st.st_dev,st.st_ino,st.st_mode)==(post.st_dev,post.st_ino,post.st_mode),'recorder result parent post-drift')
  finally:os.close(parent)
 finally:os.close(root)
 check=scratch_fd()
 try:
  afterroot=os.fstat(check)
  need((rootstat.st_dev,rootstat.st_ino,rootstat.st_mode)==(afterroot.st_dev,afterroot.st_ino,afterroot.st_mode),'scratch root pathname drift')
 finally:os.close(check)

def main():
 global CHILD
 signal.signal(signal.SIGALRM,alarm)
 signal.signal(signal.SIGTERM,interrupted)
 signal.signal(signal.SIGINT,interrupted)
 signal.setitimer(signal.ITIMER_REAL,remaining_active())
 need(not os.path.lexists(RESULT),'recorder result collision')
 need(not os.path.lexists(pathlib.Path(str(RESULT)+'.partial')),'recorder partial collision')
 need(type(BINDING_SHA) is str and len(BINDING_SHA)==64 and set(BINDING_SHA)<=set('0123456789abcdef'),'filled binding SHA')
 row={'schema':'1370-c0-h-typecheck-collection-recorder-result-r2','status':'RUNNING',
      'sourceDeadlineSeconds':300,'recorderActiveSeconds':ACTIVE,'recorderWholeSeconds':LIMIT,
      'sourceSha256':'83f4b7b07f68f8424824a6369a5e9425d423c0a6d10ef3581931a689c2c727e3',
      'bootstrapSha256':BOOTSTRAP_SHA,'bindingSha256':BINDING_SHA,
      'staticReviewSha256':STATIC_SHA,'productionHead':HEAD,'productionSourceTree':SRC,'evidenceTip':EVIDENCE}
 failure=None
 try:
  preflight()
  static=json.loads(read_pin(STATIC_REVIEW,100000,STATIC_SHA))
  need(static['decision']=='ACCEPT_STATIC_H_TYPECHECK_COLLECTION_SOURCE_ONLY' and
       static['sourcePins']['runner.py']['sha256']==row['sourceSha256'],
       'type source static authority')
  binding=json.loads(read_pin(BINDING,100000,BINDING_SHA))
  need(binding['runId']=='20261008-h-types-r9' and
       binding['fullReadbackObservedReceiptSha256']=='35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a' and
       binding['childWallSeconds']==300 and binding['recorderWallSeconds']==330,'type binding authority')
  bootstrap_source=read_pin(BOOTSTRAP,100000,BOOTSTRAP_SHA).decode('utf-8')
  need(shutil.disk_usage(S).free>=3*1024**3,'3 GiB floor')
  clean={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
  CHILD=subprocess.Popen(['/usr/local/bin/python3','-I','-B','-c',bootstrap_source,BINDING_SHA,STATIC_SHA],
                         cwd='/Users/zacheryspector/The-Movies-headless-program',env=clean,
                         start_new_session=True,stdout=sys.stdout,stderr=sys.stderr)
  row['childPid']=CHILD.pid
  row['childExit']=CHILD.wait(timeout=remaining_active())
  if group_alive(CHILD.pid):
   stop_group(CHILD.pid)
   row['status']='STOP_CHILD_DESCENDANT_SURVIVED_NORMAL_EXIT'
  else:
   row['status']='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' if row['childExit']==0 else 'STOP_CHILD_NONZERO'
 except BaseException as error:
  failure=error;row['status']='STOP_RECORDER_TIMEOUT_OR_ERROR';row['error']=repr(error)
 finally:
  signal.signal(signal.SIGALRM,hard_alarm)
  signal.setitimer(signal.ITIMER_REAL,remaining_total())
  if CHILD is not None:
   if group_alive(CHILD.pid):
    try:stop_group(CHILD.pid)
    except BaseException as error:row['status']='STOP_SURVIVOR';row['cleanupError']=repr(error)
   try:row['childExit']=CHILD.wait(timeout=1)
   except BaseException as error:row['status']='STOP_SURVIVOR';row['cleanupError']=repr(error)
   row['groupClear']=not group_alive(CHILD.pid)
  row['elapsedSeconds']=round(time.monotonic()-START,3)
  safe_result(row)
  remaining_total()
  signal.setitimer(signal.ITIMER_REAL,0)
  print(json.dumps({'recorderStatus':row['status'],'childExit':row.get('childExit'),'groupClear':row.get('groupClear')}),flush=True)
 if failure is not None or row['status']!='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW':raise SystemExit(1)
if __name__=='__main__':main()
