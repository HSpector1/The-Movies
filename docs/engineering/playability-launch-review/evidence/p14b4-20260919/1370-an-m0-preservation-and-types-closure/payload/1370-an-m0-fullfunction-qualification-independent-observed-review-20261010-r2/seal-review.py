import json,hashlib,os,stat
from pathlib import Path
B=Path(__file__).parent
receipt=json.loads((B/'RECEIPT-DRAFT.json').read_bytes())
p=Path('/Users/zacheryspector/studio-scratch/1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r2/READER-ACTUAL-TOOL.json');raw=p.read_bytes();s=p.lstat();assert stat.S_ISREG(s.st_mode) and s.st_nlink==1 and p.resolve(strict=True)==p
tool=json.loads(raw);assert tool['sessionId']==47023 and tool['finalExit']==0 and tool['allToolChunks'][-1]['exit_code']==0
summary=json.loads(tool['allToolChunks'][-1]['output']);assert summary['readback']==receipt['fullPostflightReadback']
receipt['fullPostflightReaderActualTool']={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
encoded=(json.dumps(receipt,sort_keys=True,indent=2)+'\n').encode();fd=os.open(B/'RECEIPT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
names=['CONTRACT.json','TERMINAL-EVIDENCE-INPUT.json','audit-terminal-evidence.py','INITIAL-TERMINAL-EVIDENCE-AUDIT.json','POST-EVIDENCE-INPUT.json','audit-post-evidence.py','FINAL-POST-EVIDENCE-AUDIT.json','RECEIPT-DRAFT.json','RECEIPT.json','seal-review.py'];roles={}
for name in names:
 p=B/name;raw=p.read_bytes();roles[name]={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
encoded=(json.dumps({'schema':'1370-fullfunction-r2-stop-independent-review-seal/v1','files':roles,'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode();fd=os.open(B/'SEAL.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
for name in names+['SEAL.json']:os.chmod(B/name,0o444)
os.chmod(B,0o555);print(json.dumps(roles['RECEIPT.json']))

