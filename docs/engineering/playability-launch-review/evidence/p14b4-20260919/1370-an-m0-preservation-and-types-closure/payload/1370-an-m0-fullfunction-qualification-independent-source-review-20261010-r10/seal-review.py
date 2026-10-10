import os,json,hashlib,stat
from pathlib import Path
B=Path(__file__).parent
names=['EVIDENCE-INPUT.json','audit-source-evidence.py','EVIDENCE-READBACK.json','VITE-EXCERPT-INPUT.json','audit-vite-excerpt.py','VITE-EXCERPT-READBACK.json','RECEIPT.json','seal-review.py'];roles={}
for n in names:
 p=B/n;s=p.lstat();assert stat.S_ISREG(s.st_mode) and s.st_nlink==1;raw=p.read_bytes();roles[n]={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
raw=(json.dumps({'schema':'1370-independent-fullfunction-r10-source-review-seal/v1','files':roles,'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode();fd=os.open(B/'SEAL.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
for n in names+['SEAL.json']:os.chmod(B/n,0o444)
os.chmod(B,0o555);print(json.dumps(roles['RECEIPT.json']))

