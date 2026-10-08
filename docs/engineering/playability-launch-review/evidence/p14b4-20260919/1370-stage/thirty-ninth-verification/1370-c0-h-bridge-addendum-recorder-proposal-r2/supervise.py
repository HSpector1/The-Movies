BOOTSTRAP_SOURCE='import hashlib,json,os,pathlib,stat,sys\nS=pathlib.Path("/Users/zacheryspector/studio-scratch")\nsource=S/"1370-c0-h-bridge-addendum-proposal-r3/add_bridge.py"\ninventory=S/"1370-c0-h-bridge-addendum-proposal-r3/INVENTORY.json"\nreview=S/"1370-c0-h-bridge-addendum-independent-static-review-r3/RECEIPT.json"\npins={source:"72a9bf9f6567afac320373532486c6bfd40663cf019eadb93d32db73a651678d",inventory:"2cd8b613ebc4315f16e1383159cc89bbf19fb23de13042de933c3dc84296d83d",review:"2d68b3686fea754398a76265b632a1c37bf58444169b9201f56982cfdc187eb6"}\nassert len(pins[review])==64 and set(pins[review])<=set("0123456789abcdef") and "__" not in str(review),"static review not yet bound"\ndef fields(x):return (x.st_dev,x.st_ino,x.st_mode,x.st_nlink,x.st_size,x.st_mtime_ns,x.st_ctime_ns)\ndef identity(x):return (x.st_dev,x.st_ino,x.st_mode)\ndef parent_fd(path):\n assert path.is_absolute() and all(p not in ("",".","..") for p in path.parts[1:])\n fd=os.open("/",os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);chain=[]\n try:\n  for component in path.parts[1:-1]:\n   before=os.stat(component,dir_fd=fd,follow_symlinks=False)\n   child=os.open(component,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)\n   assert stat.S_ISDIR(before.st_mode) and identity(before)==identity(os.fstat(child))\n   chain.append((component,identity(before)));os.close(fd);fd=child\n  return fd,chain\n except BaseException:os.close(fd);raise\ndef read_pin(path,pin,cap):\n parent,chain=parent_fd(path)\n try:\n  before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)\n  assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap\n  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)\n  try:\n   assert fields(before)==fields(os.fstat(fd))\n   parts=[];count=0\n   while chunk:=os.read(fd,65536):\n    count+=len(chunk);assert count<=cap and count<=before.st_size\n    parts.append(chunk)\n   raw=b"".join(parts)\n   assert count==before.st_size and fields(before)==fields(os.fstat(fd))==fields(os.stat(path.name,dir_fd=parent,follow_symlinks=False))\n  finally:os.close(fd)\n finally:os.close(parent)\n check,after=parent_fd(path)\n try:assert after==chain\n finally:os.close(check)\n assert hashlib.sha256(raw).hexdigest()==pin\n return raw\nraw={path:read_pin(path,pin,1000000 if path==source else 100000) for path,pin in pins.items()}\nlisting=json.loads(raw[inventory]);assert listing["status"]=="STATIC_PROPOSAL_UNRUN" and listing["productionHeadAtFreeze"]=="9651546af98c44f04e8b6b2714d10d67dadb8f9c"\nassert any(row["path"]=="add_bridge.py" and row["sha256"]==pins[source] for row in listing["files"])\naccepted=json.loads(raw[review]);assert accepted["decision"]=="ACCEPT_STATIC_H_BRIDGE_ADDENDUM_ONLY" and accepted["inputsSha256"]=="2598b0c372eed48d9be04192eb7e33aa52e398a9323d4e2155c176e4cce5efaa"\nassert accepted.get("scriptSha256")==pins[source] and accepted.get("inventorySha256")==pins[inventory]\nfor key in list(os.environ):\n if key.startswith("GIT_"):del os.environ[key]\nsys.argv=[str(source),"--static-review",str(review),"--static-review-sha",pins[review],"--production-head","9651546af98c44f04e8b6b2714d10d67dadb8f9c"]\nexec(compile(raw[source],str(source),"exec"),{"__name__":"__main__","__file__":str(source)})'
# This source is authenticated by the exact launch loader and is UNRUN.
import json,os,pathlib,signal,stat,subprocess,sys,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
RESULT=S/'1370-c0-h-bridge-addendum-recorder-results-r2/20261008-h-bridge-addendum-r3.RECORDER-RESULT.json'
LIMIT=210
START=globals().get('LAUNCH_START',time.monotonic())
CHILD=None

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def remaining():
 value=LIMIT-(time.monotonic()-START);need(value>0,'210-second recorder deadline');return value
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
 need(not group_alive(pid),'surviving addendum child process group')
def alarm(*_):raise TimeoutError('210-second recorder deadline')
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
 root=scratch_fd()
 try:
  name=RESULT.parent.name
  try:os.mkdir(name,0o700,dir_fd=root)
  except FileExistsError:pass
  parent=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=root)
  try:
   st=os.fstat(parent);pathst=os.stat(name,dir_fd=root,follow_symlinks=False)
   need((st.st_dev,st.st_ino,st.st_mode)==(pathst.st_dev,pathst.st_ino,pathst.st_mode),'recorder result parent drift')
   fd=os.open(RESULT.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
   with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
   os.fsync(parent)
  finally:os.close(parent)
 finally:os.close(root)

def main():
 global CHILD
 signal.signal(signal.SIGALRM,alarm)
 signal.signal(signal.SIGTERM,interrupted)
 signal.signal(signal.SIGINT,interrupted)
 signal.setitimer(signal.ITIMER_REAL,remaining())
 need(not os.path.lexists(RESULT),'recorder result collision')
 row={'schema':'1370-c0-h-bridge-addendum-recorder-result-r2','status':'RUNNING',
      'sourceDeadlineSeconds':180,'recorderDeadlineSeconds':210,
      'sourceSha256':'72a9bf9f6567afac320373532486c6bfd40663cf019eadb93d32db73a651678d',
      'staticReviewSha256':'2d68b3686fea754398a76265b632a1c37bf58444169b9201f56982cfdc187eb6',
      'productionHead':'9651546af98c44f04e8b6b2714d10d67dadb8f9c'}
 failure=None
 try:
  clean={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
  CHILD=subprocess.Popen(['/usr/local/bin/python3','-I','-B','-c',BOOTSTRAP_SOURCE],
                         cwd='/Users/zacheryspector/The-Movies-headless-program',env=clean,
                         start_new_session=True,stdout=sys.stdout,stderr=sys.stderr)
  row['childPid']=CHILD.pid
  row['childExit']=CHILD.wait(timeout=remaining())
  if group_alive(CHILD.pid):stop_group(CHILD.pid)
  row['status']='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' if row['childExit']==0 else 'STOP_CHILD_NONZERO'
 except BaseException as error:
  failure=error;row['status']='STOP_RECORDER_TIMEOUT_OR_ERROR';row['error']=repr(error)
 finally:
  signal.setitimer(signal.ITIMER_REAL,0)
  if CHILD is not None:
   if group_alive(CHILD.pid):
    try:stop_group(CHILD.pid)
    except BaseException as error:row['status']='STOP_SURVIVOR';row['cleanupError']=repr(error)
   try:row['childExit']=CHILD.wait(timeout=1)
   except BaseException as error:row['status']='STOP_SURVIVOR';row['cleanupError']=repr(error)
   row['groupClear']=not group_alive(CHILD.pid)
  row['elapsedSeconds']=round(time.monotonic()-START,3)
  safe_result(row)
  print(json.dumps({'recorderStatus':row['status'],'childExit':row.get('childExit'),'groupClear':row.get('groupClear')}),flush=True)
 if failure is not None or row['status']!='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW':raise SystemExit(1)
if __name__=='__main__':main()
