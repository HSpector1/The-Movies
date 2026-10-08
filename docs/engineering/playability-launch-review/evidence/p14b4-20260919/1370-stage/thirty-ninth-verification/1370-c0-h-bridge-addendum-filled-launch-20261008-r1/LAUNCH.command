/bin/bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/c0-h-bridge-addendum-20261008-r3.lane.log /usr/local/bin/python3 -I -B -c 'import hashlib,json,os,pathlib,stat,sys
S=pathlib.Path("/Users/zacheryspector/studio-scratch")
source=S/"1370-c0-h-bridge-addendum-proposal-r3/add_bridge.py"
inventory=S/"1370-c0-h-bridge-addendum-proposal-r3/INVENTORY.json"
review=S/"1370-c0-h-bridge-addendum-independent-static-review-r3/RECEIPT.json"
pins={source:"72a9bf9f6567afac320373532486c6bfd40663cf019eadb93d32db73a651678d",inventory:"2cd8b613ebc4315f16e1383159cc89bbf19fb23de13042de933c3dc84296d83d",review:"2d68b3686fea754398a76265b632a1c37bf58444169b9201f56982cfdc187eb6"}
assert len(pins[review])==64 and set(pins[review])<=set("0123456789abcdef") and "__" not in str(review),"static review not yet bound"
def fields(x):return (x.st_dev,x.st_ino,x.st_mode,x.st_nlink,x.st_size,x.st_mtime_ns,x.st_ctime_ns)
def identity(x):return (x.st_dev,x.st_ino,x.st_mode)
def parent_fd(path):
 assert path.is_absolute() and all(p not in ("",".","..") for p in path.parts[1:])
 fd=os.open("/",os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);chain=[]
 try:
  for component in path.parts[1:-1]:
   before=os.stat(component,dir_fd=fd,follow_symlinks=False)
   child=os.open(component,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
   assert stat.S_ISDIR(before.st_mode) and identity(before)==identity(os.fstat(child))
   chain.append((component,identity(before)));os.close(fd);fd=child
  return fd,chain
 except BaseException:os.close(fd);raise
def read_pin(path,pin,cap):
 parent,chain=parent_fd(path)
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
 check,after=parent_fd(path)
 try:assert after==chain
 finally:os.close(check)
 assert hashlib.sha256(raw).hexdigest()==pin
 return raw
raw={path:read_pin(path,pin,1000000 if path==source else 100000) for path,pin in pins.items()}
listing=json.loads(raw[inventory]);assert listing["status"]=="STATIC_PROPOSAL_UNRUN" and listing["productionHeadAtFreeze"]=="9651546af98c44f04e8b6b2714d10d67dadb8f9c"
assert any(row["path"]=="add_bridge.py" and row["sha256"]==pins[source] for row in listing["files"])
accepted=json.loads(raw[review]);assert accepted["decision"]=="ACCEPT_STATIC_H_BRIDGE_ADDENDUM_ONLY" and accepted["inputsSha256"]=="2598b0c372eed48d9be04192eb7e33aa52e398a9323d4e2155c176e4cce5efaa"
assert accepted.get("scriptSha256")==pins[source] and accepted.get("inventorySha256")==pins[inventory]
for key in list(os.environ):
 if key.startswith("GIT_"):del os.environ[key]
sys.argv=[str(source),"--static-review",str(review),"--static-review-sha",pins[review],"--production-head","9651546af98c44f04e8b6b2714d10d67dadb8f9c"]
exec(compile(raw[source],str(source),"exec"),{"__name__":"__main__","__file__":str(source)})'
