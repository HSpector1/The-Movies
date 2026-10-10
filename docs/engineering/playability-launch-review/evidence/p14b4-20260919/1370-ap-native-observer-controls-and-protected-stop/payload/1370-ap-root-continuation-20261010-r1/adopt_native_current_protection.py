import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;P=S/'1370-ap-native-fullfunction-current-prelaunch-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def get(p,h):
 r=role(p);assert r['sha256']==h;return r,read(r['path'])
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
ir,iv=get(sys.argv[1],sys.argv[2]);assert iv['schema']=='1370-native-current-ao-prelaunch-independent-observed-review/v1' and iv['decision']=='ACCEPT_ACTUAL_CURRENT_AO_NATIVE_PRELAUNCH_ONLY' and iv['concreteFindings']==[] and iv['executionAuthorization'] is False
rr=role(A/'M0-NATIVE-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json');r=read(rr['path']);assert iv['readback']==rr and iv['preflight']==r['preflight']
assert r['schema']=='1370-ap-current-ao-root-prelaunch-readback/v2' and r['status']=='ACTUAL_CURRENT_AO_ROOT_PREFLIGHT_COMPLETED_PENDING_INDEPENDENT_REVIEW'
for v in r.values():
 if type(v) is dict and set(v)=={'path','bytes','sha256'}:assert role(v['path'])==v
assert r['toolExit']==0 and r['protectedFreezeContinues'] is True and r['nineRootsAndAncestryAndCurrentChecksAccepted'] is True and r['scannerAbsent'] is True and r['game'] is False and r['proofOrTypesAccepted'] is False
actual=read(P/'ACTUAL-TOOL.json');assert actual['toolSessionId']==r['actualToolSessionId'] and actual['finalExit']==actual['chunks'][-1]['exit_code']==0
ra=role(P/'READER-ACTUAL-TOOL.json');reader=read(ra['path']);assert reader['finalExit']==reader['allToolChunks'][-1]['exit_code']==0
full,fullv=get(A/'CURRENT-AO-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','e3804904e003a7178e98c3d6d83c52ff32194f1117cef780d24c3d1c88849552');assert r['currentFullPreflightAdoption']==full and r['originalFullSnapshot']==fullv['snapshot']
tr,trv=get(A/'CURRENT-AO-OPERATIONAL-TRANSITION.json','8ed8eab0ba445edbd2b93f0f87e932e9c3f902d42fe56cf14e6c7d7166b8976c')
ty,t=get(S/'1370-an-root-continuation-20261009-r1/M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json','be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83');assert r['historicalTypesObservedAdoption']==ty
stop,sv=get(S/'1370-ao-root-continuation-20261010-r1/FULLFUNCTION-OBSERVER-DIAGNOSTIC-STOP-OBSERVED-ADOPTION.json','ecd5d47f19cf731a9b187849d03323d3c431ee7f908006690948d10af34846de')
am,amv=get(A/'CURRENT-AO-NATIVE-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json','55be16812ba10968ac66e84bd4b9616159d594bfdd1b79501df65573f42bb61f');assert amv['independentSourceReview']==r['sourceReview'] and amv['sourceManifest']==r['sourcePins']
controls=role(A/'NATIVE-OBSERVER-CONTROLS-OBSERVED-ADOPTION.json');assert controls==r['observerControlsAdoption'];cv=read(controls['path']);assert cv['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_OBSERVER_72_CONTROLS_ONLY' and cv['readback']==r['observerControlsReadback']
v={'schema':'1370-root-fullfunction-current-protection/v3','status':'ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE','actualPreflight':r['preflight'],'independentPreflightReview':ir,'actualPreflightReadback':rr,'currentAOFullPreflightAdoption':full,'currentAOFullPreflightSnapshot':r['originalFullSnapshot'],'historicalTypesAdoption':ty,'historicalTypesHead':'7087f116cf998fd86e33fb8e004df628e0686dbd','currentOperationalTransition':tr,'reviewedPriorStopAdoption':stop,'productionHead':'f2f97c622db7f5332164b790d1646355e89c00f4','productionSourceTree':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','protectedFreezeContinues':True,'game':False,'executionAuthorization':False,'actualTool':r['actualTool'],'actualReaderTool':ra,'sourceAndScopeAmendmentAdoption':am,'actualSessionId':r['actualToolSessionId'],'toolExit':0,'rawLocalOnlyRoles':r['rawLocalOnlyRoles'],'rawLocalOnlyBytes':r['rawLocalOnlyBytes'],'historicalTypesRemainHistorical':True,'mandatoryOriginalFullPostflightAfterGame':True,'fullQualificationAccepted':False,'m0BeforeAfterProofsRemainSeparate':True,'nativeControlsObservedAdoption':controls,'rootAdopterSource':role(__file__)}
p=A/'M0-NATIVE-FULLFUNCTION-CURRENT-PROTECTION.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'protection':role(p)}))
