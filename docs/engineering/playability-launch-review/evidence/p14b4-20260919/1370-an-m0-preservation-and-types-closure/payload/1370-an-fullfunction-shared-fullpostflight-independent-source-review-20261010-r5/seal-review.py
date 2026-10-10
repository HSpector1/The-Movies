import json,hashlib,os
from pathlib import Path
B=Path(__file__).parent
names=['EVIDENCE-INPUT.json','audit-source-evidence.py','EVIDENCE-READBACK.json','RECEIPT.json','seal-review.py'];roles={}
for name in names:
 p=B/name;raw=p.read_bytes();roles[name]={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
raw=(json.dumps({'schema':'1370-independent-shared-post-r5-review-seal/v1','files':roles,'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode()
fd=os.open(B/'SEAL.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
for name in names+['SEAL.json']:os.chmod(B/name,0o444)
os.chmod(B,0o555);print(json.dumps(roles['RECEIPT.json']))

