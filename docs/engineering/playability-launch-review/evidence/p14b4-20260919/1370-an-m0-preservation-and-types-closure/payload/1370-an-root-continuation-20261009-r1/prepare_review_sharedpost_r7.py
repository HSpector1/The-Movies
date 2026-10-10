import os
from pathlib import Path
A=Path(__file__).parent;old=(A/'review_attempt4_adapters.py').read_text()
prefix=old[:old.index('for folder,h,out,decision,allowed in [')];body=old[old.index(' Q=S/folder;'):]
loop="for folder,h,out,decision,allowed in [('1370-an-fullfunction-shared-fullpostflight-source-20261010-r7','827e809acded4d54a4d69ed34a1dfb06f3b31f5ea6ce2ddcd5f732abb1681342','1370-an-fullfunction-shared-fullpostflight-independent-source-review-20261010-r7','ACCEPT_STATIC_ORIGINAL_SHARED_FULL_POSTFLIGHT_ADAPTER_AFTER_FULLFUNCTION_PASS_OR_STOP',{'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4':'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry','postflight-fullfunction-qualification-r4':'postflight-fullfunction-qualification-r4-disk-retry'})]:\n"
new=prefix+loop+body;new=new.replace('Only explicitly enumerated fresh R4 identities.','Only explicitly enumerated fresh R4 post-disk-retry identities; failed7509 remains failed and separate root35222 ownership checks remain required.');compile(new,'review_sharedpost_r7.py','exec');p=A/'review_sharedpost_r7.py'
with p.open('x') as f:f.write(new);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
