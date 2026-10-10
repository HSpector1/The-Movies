import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent
old=(A/'adopt_fullfunction_r4_current_protection.py').read_text();new=old
changes=[('M0-FULLFUNCTION-R4-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json','M0-FULLFUNCTION-R5-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json'),('FULLFUNCTION-R3-STOP-OBSERVED-ADOPTION.json','FULLFUNCTION-R4-STOP-OBSERVED-ADOPTION.json'),('M0-FULLFUNCTION-R4-CURRENT-PROTECTION.json','M0-FULLFUNCTION-R5-CURRENT-PROTECTION.json')]
for a,b in changes:assert new.count(a)==1;new=new.replace(a,b)
back=new
for a,b in reversed(changes):assert back.count(b)==1;back=back.replace(b,a)
assert back==old;compile(new,'adopt_fullfunction_r5_current_protection.py','exec')
p=A/'adopt_fullfunction_r5_current_protection.py'
with p.open('x') as f:f.write(new);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
proof={'schema':'1370-root-fifth-current-protection-adapter-delta/v1','baseSha256':hashlib.sha256(old.encode()).hexdigest(),'updatedSha256':hashlib.sha256(new.encode()).hexdigest(),'changes':changes,'wholeInverseExact':True,'executionAuthorization':False,'actualIndependentObservedReview':None}
q=A/'R5-CURRENT-PROTECTION-ADAPTER-DELTA.json'
with q.open('x') as f:json.dump(proof,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
q.chmod(0o444);print(str(p))
