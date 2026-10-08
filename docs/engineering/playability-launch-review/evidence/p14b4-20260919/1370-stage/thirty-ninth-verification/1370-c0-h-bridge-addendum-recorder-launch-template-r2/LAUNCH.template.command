/bin/bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/c0-h-bridge-addendum-20261008-r3.lane.log /usr/local/bin/python3 -I -B -c 'import hashlib,json,os,pathlib,signal,stat,time
LAUNCH_START=time.monotonic()
def fail_alarm(*_):raise TimeoutError("210-second whole recorder deadline before supervisor loaded")
signal.signal(signal.SIGALRM,fail_alarm)
signal.setitimer(signal.ITIMER_REAL,210)
S=pathlib.Path("/Users/zacheryspector/studio-scratch")
source=S/"1370-c0-h-bridge-addendum-recorder-proposal-r3/supervise.py"
inventory=S/"1370-c0-h-bridge-addendum-recorder-proposal-r3/INVENTORY.json"
review=S/"__FILL_STATIC_REVIEW_DIR__/RECEIPT.json"
pins={source:"90b980bd331978da9c2da02e04739b76857eaa1daa4880ecaac2f89f0e185b1e",inventory:"79bd10eae10d6d3555b5cf4a5af8a097ab14ea5101e8cb65416dd3b69de6c494",review:"__FILL_STATIC_REVIEW_SHA256__"}
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
accepted=json.loads(raw[review]);assert accepted["decision"]=="__FILL_ACCEPT_DECISION__" and accepted["scriptSha256"]==pins[source] and accepted["inventorySha256"]==pins[inventory]
exec(compile(raw[source],str(source),"exec"),{"__name__":"__main__","__file__":str(source),"LAUNCH_START":LAUNCH_START})'
