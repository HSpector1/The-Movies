/bin/bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/c0-mirror-20261008-h-types-r1.lane.log /usr/local/bin/python3 -I -B -c 'import hashlib,json,os,stat,sys
from pathlib import Path
s=Path("/Users/zacheryspector/studio-scratch")
script=s/"1370-c0-h-m0-mirror-materializer-proposal-r2/materialize.py"
manifest=s/"1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json"
source_review=s/"1370-c0-h-m0-corrected-overlay-source-manifest-independent-review-r2/H-RECEIPT.json"
materializer_review=s/"1370-c0-h-m0-mirror-materializer-independent-static-review-r2/RECEIPT.json"
pins={script:"28e546e77e6dfd414427b5d645a65a3c549c1f1011be812d07ee13da9a5e26ed",manifest:"e2f92aa60063b754f110ec31f08080bfd461f6a150f74394464739c2d4cab7ff",source_review:"5e6f23884af9527f991665020414404455f182cc3a62abe5a5602bb019804dbf",materializer_review:"2e3f28a983d80cd1e7e626fad921773bc17e11331c338b4d4ce63be9c25efddf"}
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
assert json.loads(data[source_review])["decision"]=="ACCEPT_STATIC_FULL_ERA_OBSERVER_ONLY"
assert json.loads(data[source_review])["sourceManifestSha256"]==pins[manifest]
assert json.loads(data[materializer_review])["decision"]=="ACCEPT_STATIC_ONLY"
assert json.loads(data[materializer_review])["scriptSha256"]==pins[script]
assert json.loads(data[manifest])["arm"]=="H"
sys.argv=[str(script),"--arm","H","--run-id","20261008-h-types-r1","--source-manifest",str(manifest),"--source-manifest-sha",pins[manifest],"--source-review",str(source_review),"--source-review-sha",pins[source_review]]
exec(compile(data[script],str(script),"exec"),{"__name__":"__main__","__file__":str(script)})
'
