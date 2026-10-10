import json,os,hashlib,stat
from pathlib import Path
base=Path(__file__).parent
names=['INITIAL-READBACK-INPUT.json','INITIAL-EVIDENCE-READBACK.json','audit-post-evidence.py','POST-EVIDENCE-INPUT.json','POST-EVIDENCE-AUDIT.json','audit-post-facts.py','FINAL-POST-EVIDENCE-AUDIT.json','RECEIPT.json','seal-review.py']
roles={}
for name in names:
 p=base/name
 s=p.lstat()
 if not stat.S_ISREG(s.st_mode) or s.st_nlink!=1:raise RuntimeError('owned regular file')
 raw=p.read_bytes();roles[name]={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
seal={'schema':'1370-independent-retained-stop-review-seal/v1','files':roles,'executionAuthorization':False,'privateInventory':False}
raw=(json.dumps(seal,sort_keys=True,indent=2)+'\n').encode();p=base/'SEAL.json'
fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
for name in names+['SEAL.json']:os.chmod(base/name,0o444)
os.chmod(base,0o555)
print(json.dumps({'receipt':roles['RECEIPT.json'],'seal':{'path':str(p),'bytes':len(p.read_bytes()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}}))

