import hashlib,json,os,stat
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-ao-root-continuation-20261010-r1';Q=S/'1370-ao-m0-fullfunction-current-prelaunch-preparation-source-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
rr,r=load(S/'1370-ao-m0-fullfunction-current-prelaunch-preparation-independent-source-review-20261010-r1/RECEIPT.json','68563676b8134dabaaf7dc47127d59dc12b201d20cd389fbfea93623137cbdfb')
sp,p=load(Q/'SOURCE-PINS.json','d8f3140d834d2441c69838f470a4c4cc26ee38529d597622d54ec29850817092')
am,m=load(Q/'OPERATIONAL-SCOPE-AMENDMENT.json','25a09de444c5a445208ce902983c6c35da30690aae32f3ddc3b157a1df3082e4')
assert r['decision']=='ACCEPT_STATIC_CURRENT_AN_FULLFUNCTION_PRELAUNCH_SOURCE_ONLY' and r['concreteFindings']==[] and r['sourceManifest']==sp and r['scopeAmendment']==am
for v in p['files'].values():assert role(v['path'])==v
v={'schema':'1370-root-current-an-prelaunch-source-and-operational-amendment-adoption/v1','status':'ROOT_ADOPTED_CURRENT_AN_PRELAUNCH_SOURCE_AND_EXPLICIT_BEFORE_FILL_REUSE_AMENDMENT','sourceManifest':sp,'independentSourceReview':rr,'scopeAmendment':am,'currentANFullPreflightAdoption':m['currentFullPreflightAdoption'],'currentANFullPreflightSnapshot':m['snapshot'],'observerControlsAdoption':m['observerControlsAdoption'],'protectedFreezeContinues':True,'explicitBeforeFillReuseAmendmentAdopted':True,'snapshotNotRelabeledPostflight':True,'historicalTypesRemainHistorical':True,'mandatoryOriginalFullPostflightAfterGame':True,'originalM0BeforeAfterProofsRemainSeparate':True,'capsHorizonsSourceIdentityProtectedRootsAcceptanceUnchanged':True,'rootAuthorizesOneReviewedShortPrelaunch':True,'fullfunctionExecutionAuthorization':False,'game':False,'actualPrelaunch':None}
out=A/'CURRENT-AN-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444);print(json.dumps(role(out)))
