bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/1370-c0-stage38-remote-audit-20261008-r1.lane.log python3 -I -B -c 'import hashlib,json,os,stat,sys
from pathlib import Path
s=Path("/Users/zacheryspector/studio-scratch")
p=s/"1370-c0-stage38-remote-audit-proposal-r1/audit.py"
spec=s/"1370-c0-stage38-remote-audit-proposal-r1/SPEC.json"
review=s/"1370-c0-stage38-remote-audit-independent-static-review-r1/RECEIPT.json"
publication=s/"1370-c0-stage38-publisher-proposal-r1/PUBLISH-RESULT.json"
observed=s/"1370-c0-stage38-publisher-independent-observed-review-r1/RECEIPT.json"
manifest=s/"1370-c0-stage38-remote-audit-proposal-r1/MANIFEST.json"
pins={p:"e46dc6436781564e4a6472fade8394ef2d2122ee2894ecf10e681e46c5f6b07c",spec:"e7b2a1f87705908ba46de02323b00df9afb05a322fe0c928657b7d360c88abe0",review:"90c2e6de0d8cd0cb8b492cd97c19b452461c97f88c571c309a7632653ef12257",publication:"62d56aad2a6ab569b227423457c14afa3b72c12748951f50dd34465912b05abd",observed:"329bfec90365382401e3713d1ef7329664fbfb4ce7de613f3c37e792d9748257",manifest:"3011d8c8000a1fda98cae8dbf32e80169d3b52fdf06c360c42fdae84e3f311ff"}
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
assert json.loads(data[review])["decision"]=="ACCEPT_STATIC_ONLY"
assert json.loads(data[publication])["status"]=="PUBLISHED_REMOTE_TIP_VERIFIED_REMOTE_BYTES_PENDING"
assert json.loads(data[observed])["decision"]=="ACCEPT_OBSERVED_PUBLICATION_TIP_ONLY"
sys.argv=[str(p),"--tip","fe9e8a7d84da164e9a413dc2c3efe49f529c2a78","--spec-sha",pins[spec],"--publisher-result-sha",pins[publication],"--publisher-observed-sha",pins[observed]]
exec(compile(data[p],str(p),"exec"),{"__name__":"__main__","__file__":str(p)})
'
