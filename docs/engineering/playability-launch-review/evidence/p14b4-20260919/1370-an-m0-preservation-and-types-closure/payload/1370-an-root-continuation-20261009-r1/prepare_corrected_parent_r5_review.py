import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent
base=A/'review_fullfunction_parent_r5.py';b=base.read_text()
old="ACCEPT_STATIC_COMPLETE_FULLFUNCTION_PARENT_LAUNCHER_SOURCE_ONLY";new="ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY"
assert b.count(old)==1
b=b.replace(old,new)
oldpath="D=S/'1370-an-m0-fullfunction-parent-independent-source-review-20261010-r5'"
assert b.count(oldpath)==1
b=b.replace(oldpath,"D=S/'1370-an-m0-fullfunction-parent-independent-source-review-20261010-r5-r2'")
p=A/'review_fullfunction_parent_r5_corrected.py'
with p.open('x') as f:f.write(b);f.flush();os.fsync(f.fileno())
compile(b,str(p),'exec')
v={'schema':'1370-root-review-contract-label-correction/v1','scope':'Original R5 source review checks succeeded but root used a free-form decision label inconsistent with unchanged parent PARENT_REVIEW predicate. Source/runtime unchanged; no run was attempted using that receipt. Fresh review reruns identical full normalization/helpers/role checks with exact required ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY label.','priorReview':{'path':str(S/'1370-an-m0-fullfunction-parent-independent-source-review-20261010-r5/RECEIPT.json'),'bytes':6633,'sha256':'3298d4569626e6b2a837f8dc772e78a9201916b1faad34853f7cdd94ef8a6edd'},'executionAuthorization':False,'runtimeAttempted':False}
q=A/'R5-PARENT-REVIEW-LABEL-CORRECTION.json'
with q.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
q.chmod(0o444)
print(str(p))
