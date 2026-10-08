/bin/bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/c0-h-bridge-full-readback-20261008-r5.lane.log /usr/local/bin/python3 -I -B -c 'import hashlib,json,math,os,pathlib,signal,stat,time
LAUNCH_START=time.monotonic()
def early_alarm(*_):raise TimeoutError("630-second H readback recorder deadline before supervisor loaded")
signal.signal(signal.SIGALRM,early_alarm)
elapsed=time.monotonic()-LAUNCH_START
assert math.isfinite(elapsed) and 0<=elapsed<630
signal.setitimer(signal.ITIMER_REAL,630-elapsed)
S=pathlib.Path("/Users/zacheryspector/studio-scratch")
source=S/"1370-c0-h-bridge-full-readback-outer-recorder-proposal-r2/supervise.py"
review=S/"__FILL_RECORDER_STATIC_REVIEW_DIR__/RECEIPT.json"
binding=S/"1370-c0-h-bridge-full-readback-filled-exact-r5/BINDING.json"
pins={source:"8a4171a3cf9749850538a59cc947a31dfd234890879b87a821832ad675a76913",review:"__FILL_RECORDER_STATIC_REVIEW_SHA256__",binding:"__FILL_READBACK_BINDING_SHA256__"}
assert all(len(x)==64 and set(x)<=set("0123456789abcdef") for x in pins.values()),"unfilled exact pins"
def attrs(v):return (v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
def identity(v):return (v.st_dev,v.st_ino,v.st_mode)
def read_pin(path,pin,cap):
 assert path.is_absolute()
 parent=os.open("/",os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);held=[parent]
 try:
  for component in path.parts[1:-1]:
   assert component not in ("",".","..")
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
    count+=len(piece);assert count<=cap and count<=before.st_size
    pieces.append(piece)
   raw=b"".join(pieces)
   assert count==before.st_size and attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False))
  finally:os.close(fd)
  for i,component in enumerate(path.parts[1:-1]):
   assert identity(os.fstat(held[i+1]))==identity(os.stat(component,dir_fd=held[i],follow_symlinks=False))
  assert hashlib.sha256(raw).hexdigest()==pin
  return raw
 finally:
  for item in reversed(held):os.close(item)
raw={path:read_pin(path,pin,100000 if path!=source else 250000) for path,pin in pins.items()}
accepted=json.loads(raw[review]);assert accepted["decision"]=="__FILL_RECORDER_ACCEPT_DECISION__" and accepted["supervisorSha256"]==pins[source]
bound=json.loads(raw[binding]);assert bound["specSha256"]=="61377447a4ae70f49b090102ce85267a9487025f807c195252ef99f82ad64e07" and bound["independentReadbackStaticReviewSha256"]=="c540f11967aac7d0fc30f4452a24ad47441ea45ff3377cb10e8bec94988196f0"
exec(compile(raw[source],str(source),"exec"),{"__name__":"__main__","__file__":str(source),"LAUNCH_START":LAUNCH_START,"BINDING_SHA":pins[binding]})'
