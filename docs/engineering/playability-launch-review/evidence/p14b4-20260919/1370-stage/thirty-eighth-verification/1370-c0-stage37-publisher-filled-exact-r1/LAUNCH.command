bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/1370-c0-stage37-publish-20261008-r1.lane.log python3 -I -B -c 'import hashlib,json,os,stat,sys
from pathlib import Path
s=Path("/Users/zacheryspector/studio-scratch")
p=s/"1370-c0-stage37-publisher-proposal-r1/publish_stage37.py"
manifest=s/"1370-c0-stage37-publisher-proposal-r1/MANIFEST.json"
review=s/"1370-c0-stage37-publisher-independent-static-review-r1/RECEIPT.json"
map_review=s/"1370-c0-stage37-source-map-independent-review-r1/RECEIPT.json"
pins={p:"1a1b313eb12e3b9faed4e4c13745bfdb2a67e152baf096507db6c3ddf764c988",manifest:"ee77282f077ca2e22a2554c2f91efc8dcb49c10808ffb6ba069397f77c78d032",review:"0d586719822786dcd02542b722cd74c588c6e46d5eac39db9f9ee2380660b4ad",map_review:"9838aa2db117013c99d207eff3e3196ab9e79b54477b651c51fde6696c01c5a9"}
def read(file,pin):
 for parent in file.parents: assert stat.S_ISDIR(parent.lstat().st_mode)
 before=file.lstat();assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<1048576
 fd=os.open(file,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  chunks=[]
  while part:=os.read(fd,65536): chunks.append(part)
  raw=b"".join(chunks);during=os.fstat(fd);after=file.lstat()
  fields=lambda v:(v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
  assert fields(before)==fields(during)==fields(after) and len(raw)==before.st_size
 finally: os.close(fd)
 assert hashlib.sha256(raw).hexdigest()==pin
 return raw
data={file:read(file,pin) for file,pin in pins.items()}
assert json.loads(data[review])["decision"]=="ACCEPT_STATIC_STAGE37_PUBLISHER_R1"
assert json.loads(data[map_review])["decision"]=="ACCEPT_STATIC_MAP_ONLY"
sys.argv=[str(p),"--map-review-sha",pins[map_review],"--publisher-review-sha",pins[review]]
exec(compile(data[p],str(p),"exec"),{"__name__":"__main__","__file__":str(p)})
'
