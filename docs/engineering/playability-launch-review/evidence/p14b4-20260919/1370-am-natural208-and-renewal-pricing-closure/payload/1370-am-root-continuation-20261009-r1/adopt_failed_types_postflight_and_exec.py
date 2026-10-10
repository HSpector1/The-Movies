import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
R=S/'1370-c0-m0-failed-types-postflight-adapter-independent-source-review-after-al-20261009-r1/RECEIPT.json';P=A/'run_m0_failed_types_postflight_once.py'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(R)['sha256']=='50c17c09ce79a9bfcabd2c1b1f0d9fd6ae5f76bcfa87563c198b3e593e14cd4f' and role(P)['sha256']=='8cfc673c40e272de990b9e2135e29f066c762fe7f8215bc18e1b2816ad61e3f4'
v=json.loads(R.read_bytes());assert v['decision'].startswith('ACCEPT_')
d={'schema':'1370-root-failed-types-postflight-parent-adapter-source-adoption/v1','status':'ROOT_ADOPTED_FAILURE_SPECIFIC_PARENT_READBACK_ADAPTER_FOR_ORIGINAL_POSTFLIGHT','source':role(P),'sourceReview':role(R),'exactInverseProof':role(A/'M0-FAILED-TYPES-POSTFLIGHT-ADAPTER.json'),'typeFailurePreserved':True,'originalGuardAndArgumentsUnchanged':True,'typeRetryAuthorized':False,'executionAuthorization':False}
p=A/'M0-FAILED-TYPES-POSTFLIGHT-ADAPTER-SOURCE-ADOPTION.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444)
os.execv(sys.executable,[sys.executable,'-I','-B',str(P),'types'])
