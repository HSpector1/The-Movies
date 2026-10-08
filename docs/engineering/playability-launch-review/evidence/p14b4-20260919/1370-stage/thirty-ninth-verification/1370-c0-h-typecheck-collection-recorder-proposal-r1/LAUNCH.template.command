/bin/bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/c0-h-types-20261008-h-types-r7.lane.log /usr/local/bin/python3 -I -B -c 'import hashlib,json,math,os,pathlib,signal,stat,time
LAUNCH_START=time.monotonic()
def early_alarm(*_):raise TimeoutError("330-second H typecheck recorder deadline before supervisor loaded")
signal.signal(signal.SIGALRM,early_alarm)
elapsed=time.monotonic()-LAUNCH_START
assert math.isfinite(elapsed) and 0<=elapsed<330
signal.setitimer(signal.ITIMER_REAL,330-elapsed)
S=pathlib.Path("/Users/zacheryspector/studio-scratch")
source=S/"1370-c0-h-typecheck-collection-recorder-proposal-r1/supervise.py"
review=S/"__FILL_RECORDER_STATIC_REVIEW_DIR__/RECEIPT.json"
binding=S/"1370-c0-h-typecheck-collection-filled-exact-r9/BINDING.json"
pins={source:"397f5389e33d8564653aaac9b8e619db030dc4c612139817ec4940a862d3c59a",review:"__FILL_RECORDER_STATIC_REVIEW_SHA256__",binding:"__FILL_READBACK_BINDING_SHA256__"}
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
bound=json.loads(raw[binding]);assert bound["fullReadbackDigestSha256"]=="1534ca888a99c1f41e3eb2a7201d6d6d56f1343bab3f4040518348cc34d276b4" and bound["fullReadbackObservedReceiptSha256"]=="35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a"
exec(compile(raw[source],str(source),"exec"),{"__name__":"__main__","__file__":str(source),"LAUNCH_START":LAUNCH_START,"BINDING_SHA":pins[binding]})'
