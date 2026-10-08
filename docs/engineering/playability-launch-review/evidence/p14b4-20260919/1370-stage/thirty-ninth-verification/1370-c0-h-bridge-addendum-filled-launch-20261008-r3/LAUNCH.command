/bin/bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/c0-h-bridge-addendum-20261008-r3.lane.log /usr/local/bin/python3 -I -B -c 'import hashlib,json,os,pathlib,signal,stat,time
LAUNCH_START=time.monotonic()
def fail_alarm(*_):raise TimeoutError("210-second whole recorder deadline before supervisor loaded")
signal.signal(signal.SIGALRM,fail_alarm)
elapsed=time.monotonic()-LAUNCH_START
assert 0<=elapsed<210,"invalid launch elapsed"
signal.setitimer(signal.ITIMER_REAL,210-elapsed)
S=pathlib.Path("/Users/zacheryspector/studio-scratch")
source=S/"1370-c0-h-bridge-addendum-recorder-proposal-r4/supervise.py"
inventory=S/"1370-c0-h-bridge-addendum-recorder-proposal-r4/INVENTORY.json"
review=S/"1370-c0-h-bridge-addendum-recorder-independent-static-review-r4/RECEIPT.json"
pins={source:"3ce344244945298a11668abc04fc8a244f7a3884666d2f461797ede35aa11d44",inventory:"655ad7c1deaf3e1c2a24a58a3af964f681bb2c9cd4180443ca60c11ec45ee7f4",review:"903429313815be42c2d9fd2e37af69b0c4ebea57f842cdc85a99f3aa3386e34e"}
assert len(pins[review])==64 and set(pins[review])<=set("0123456789abcdef") and "__" not in str(review),"static review unfilled"
def fields(v):return (v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
def directory_id(v):return (v.st_dev,v.st_ino,v.st_mode)
def open_parent(path):
 assert path.is_absolute() and all(p not in ("",".","..") for p in path.parts[1:])
 fd=os.open("/",os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);chain=[]
 try:
  for component in path.parts[1:-1]:
   before=os.stat(component,dir_fd=fd,follow_symlinks=False)
   child=os.open(component,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
   assert stat.S_ISDIR(before.st_mode) and directory_id(before)==directory_id(os.fstat(child))
   chain.append((component,directory_id(before)));os.close(fd);fd=child
  return fd,chain
 except BaseException:os.close(fd);raise
def read_pin(path,pin,cap):
 parent,chain=open_parent(path)
 try:
  before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   assert fields(before)==fields(os.fstat(fd))
   parts=[];count=0
   while chunk:=os.read(fd,65536):
    count+=len(chunk);assert count<=cap and count<=before.st_size
    parts.append(chunk)
   raw=b"".join(parts)
   assert count==before.st_size and fields(before)==fields(os.fstat(fd))==fields(os.stat(path.name,dir_fd=parent,follow_symlinks=False))
  finally:os.close(fd)
 finally:os.close(parent)
 check,after=open_parent(path)
 try:assert after==chain
 finally:os.close(check)
 assert hashlib.sha256(raw).hexdigest()==pin
 return raw
raw={path:read_pin(path,pin,1000000 if path==source else 100000) for path,pin in pins.items()}
listing=json.loads(raw[inventory]);assert listing["status"]=="STATIC_PROPOSAL_UNRUN" and any(row["path"]=="supervise.py" and row["sha256"]==pins[source] for row in listing["files"])
accepted=json.loads(raw[review]);assert accepted["decision"]=="ACCEPT_STATIC_RECORDER_ONLY" and accepted["supervisorSha256"]==pins[source] and accepted["inventorySha256"]==pins[inventory]
exec(compile(raw[source],str(source),"exec"),{"__name__":"__main__","__file__":str(source),"LAUNCH_START":LAUNCH_START})'
