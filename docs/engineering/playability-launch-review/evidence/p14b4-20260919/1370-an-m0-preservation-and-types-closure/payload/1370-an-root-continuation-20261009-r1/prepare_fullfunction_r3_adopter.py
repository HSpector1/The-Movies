import os
from pathlib import Path
A=Path(__file__).parent;b=(A/'adopt_fullfunction_retry_current_protection.py').read_text()
for old,new in [('M0-FULLFUNCTION-RETRY-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json','M0-FULLFUNCTION-R3-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json'),('FULLFUNCTION-R1-STOP-OBSERVED-ADOPTION.json','FULLFUNCTION-R2-STOP-OBSERVED-ADOPTION.json'),('M0-FULLFUNCTION-RETRY-CURRENT-PROTECTION.json','M0-FULLFUNCTION-R3-CURRENT-PROTECTION.json')]:
 assert b.count(old)==1;b=b.replace(old,new)
compile(b,'adopt_fullfunction_r3_current_protection.py','exec')
p=A/'adopt_fullfunction_r3_current_protection.py'
with p.open('x') as f:f.write(b);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
