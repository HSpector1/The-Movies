import hashlib,json,os,stat
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-ao-root-continuation-20261010-r1';Q=S/'1370-ao-fullfunction-observer-row-diagnostic-shared-fullpostflight-source-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def get(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
rr,r=get(S/'1370-ao-fullfunction-observer-row-diagnostic-shared-fullpostflight-independent-source-review-20261010-r1/RECEIPT.json','c60c12ddc9100a12917a566ae40b01744c07b89f7c9706a246518e0c47e817f8')
sp,p=get(Q/'SOURCE-PINS.json','a99444f72815ce9db487885c0a9949cb0dcbc1d6bb4b03df449ec08c6fa471c0')
assert r['decision']=='ACCEPT_STATIC_ORIGINAL_SHARED_FULL_POSTFLIGHT_ADAPTER_AFTER_FULLFUNCTION_PASS_OR_STOP' and r['sourceManifest']==sp and r['concreteFindings']==[] and r['executionAuthorization'] is False
for v in p['files'].values():assert role(v['path'])==v
v={'schema':'1370-root-observer-diagnostic-shared-postflight-source-adoption/v1','status':'ROOT_ADOPTED_ORIGINAL_SHARED_FULL_POSTFLIGHT_SOURCE_AFTER_FULLFUNCTION_PASS_OR_STOP','sourceManifest':sp,'independentSourceReview':rr,'protectedFreezeContinues':True,'baselineSha256':'63fe53279f1703e9f67d587481ee741e15502fa4a167b1f33e9c7741d13389e9','requiresActualTerminalRouteReadbackAndReleasedLane':True,'mandatoryAfterActualRunEvenStop':True,'originalFullInventoryAndNineRootsRequired':True,'m0AfterProofRemainsSeparate':True,'game':False,'executionAuthorization':False,'actualPostflight':None}
out=A/'FULLFUNCTION-OBSERVER-DIAGNOSTIC-SHARED-POSTFLIGHT-SOURCE-ADOPTION.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444);print(json.dumps(role(out)))
