import hashlib,os
from pathlib import Path
A=Path(__file__).parent
b=(A/'prepare_retry_prelaunch_source_review.py').read_text()
changes=[('1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r2','1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r3'),('1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261009-r1','1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r2'),('07832ac63601daf7077d126514a44feb91adb4c553afe2148d80b8fbbc516ce7','91b581a7658c2875186cbbc57e1245d0fd7a83a9aa025b84900bbc64b73e1cbc'),('BASE-r1-','BASE-r2-'),('FULLFUNCTION-RETRY-PREFLIGHT-PREPARATION-SOURCE-REVIEW.json','FULLFUNCTION-R3-PREFLIGHT-PREPARATION-SOURCE-REVIEW.json'),('fresh R2 output','fresh R3 output')]
for old,new in changes:
 assert b.count(old)==1;b=b.replace(old,new)
compile(b,'review_prelaunch_r3.py','exec')
p=A/'review_prelaunch_r3.py'
with p.open('x') as f:f.write(b);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
