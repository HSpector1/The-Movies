import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
R=S/'1370-c0-m0-r6-metadata-stop-postflight-adapter-independent-source-review-after-al-20261009-r1/RECEIPT.json';P=A/'run_m0_metadata_stop_postflight_r6_once.py'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(R)['sha256']=='15304a4e2b57fbd76c729c37a391576fc6c7bce3cac4813af04c83752b2bd969' and role(P)['sha256']=='f97b84ddb61f2313c5dbfe04f5a720cffb81d17673caa479fdfcd5c409089d22'
v=json.loads(R.read_bytes());assert v['decision']=='ACCEPT_STATIC_METADATA_STOP_ORIGINAL_FULL_POSTFLIGHT_ADAPTER_SOURCE_ONLY' and v['concreteFindings']==[]
for k in ('actualStopReadback','adapter','predecessor'):assert role(Path(v[k]['path']))==v[k]
d={'schema':'1370-root-metadata-stop-postflight-adapter-source-adoption/v1','status':'ROOT_ADOPTED_METADATA_STOP_PARENT_ADAPTER_FOR_ORIGINAL_POSTFLIGHT','source':role(P),'sourceReview':role(R),'metadataFailurePreserved':True,'originalGuardAndArgumentsUnchanged':True,'m0SourcePreservationAccepted':False,'typeRetryAuthorized':False,'executionAuthorization':False}
p=A/'M0-R6-METADATA-STOP-POSTFLIGHT-ADAPTER-SOURCE-ADOPTION.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444)
os.execv(sys.executable,[sys.executable,'-I','-B',str(P),'types'])
