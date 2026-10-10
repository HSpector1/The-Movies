import hashlib,json,os
from pathlib import Path
root=Path('/Users/zacheryspector/studio-scratch/1370-an-fullfunction-r3-probe-overflow-diagnostic-independent-source-review-20261010-r1')
def role(p):
 data=p.read_bytes();return {'path':str(p),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
names=['RECEIPT.json','REPORT.txt','audit-retained-roles.py','EVIDENCE-READBACK.json']
roles={n:role(root/n) for n in names}
data=(json.dumps({'schema':'1370-independent-review-seal/v1','files':roles,'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode()
p=root/'SEAL.json';fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
try:os.write(fd,data);os.fsync(fd)
finally:os.close(fd)
assert p.read_bytes()==data
for n in names+['seal-review.py','SEAL.json']:os.chmod(root/n,0o444)
os.chmod(root,0o555)
print(json.dumps({'receipt':role(root/'RECEIPT.json'),'seal':role(p)}))
