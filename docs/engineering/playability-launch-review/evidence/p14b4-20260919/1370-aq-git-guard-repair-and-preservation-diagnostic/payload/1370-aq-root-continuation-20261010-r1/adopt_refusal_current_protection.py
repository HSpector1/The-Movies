import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=Path(__file__).parent;P=S/'1370-aq-native-refusal-fullfunction-current-prelaunch-parent-recorded-20261010-r1';AP=S/'1370-ap-root-continuation-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def get(p,h):
 r=role(p);assert r['sha256']==h;return r,read(r['path'])
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
ir,iv=get(sys.argv[1],sys.argv[2]);assert iv['schema']=='1370-aq-current-ap-fullfunction-prelaunch-independent-observed-review/v1' and iv['decision']=='ACCEPT_ACTUAL_CURRENT_AP_FULLFUNCTION_PRELAUNCH_ONLY' and iv['concreteFindings']==[] and iv['executionAuthorization'] is False
rr=role(Q/'M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json');r=read(rr['path']);assert iv['readback']==rr and iv['preflight']==r['preflight']
assert r['schema']=='1370-ap-current-ap-root-prelaunch-readback/v2' and r['status']=='ACTUAL_CURRENT_AP_ROOT_PREFLIGHT_COMPLETED_PENDING_INDEPENDENT_REVIEW'
for x in r.values():
 if type(x) is dict and set(x)=={'path','bytes','sha256'}:assert role(x['path'])==x
assert r['toolExit']==0 and r['protectedFreezeContinues'] is True and r['nineRootsAndAncestryAndCurrentChecksAccepted'] is True and r['scannerAbsent'] is True and r['game'] is False and r['proofOrTypesAccepted'] is False
actual=read(P/'ACTUAL-TOOL.json');assert actual['toolSessionId']==r['actualToolSessionId'] and actual['finalExit']==actual['chunks'][-1]['exit_code']==0
ra=role(P/'READER-ACTUAL-TOOL.json');reader=read(ra['path']);assert reader['sessionId'] is None and reader['finalExit']==reader['allToolChunks'][-1]['exit_code']==0
full,fv=get(Q/'CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','4bd6fe3766e73cd621f939b124d0da27e09fa4d097b64ae58041ee6955358cf1');assert r['currentFullPreflightAdoption']==full and r['originalFullSnapshot']==fv['snapshot']
tr,tv=get(Q/'CURRENT-AP-OPERATIONAL-TRANSITION.json','8a7d765bbc472ccf5717fd2b3e68a362eac5db63f76b5fb523bd6fe3de1ed753')
ty,t=get(S/'1370-an-root-continuation-20261009-r1/M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json','be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83');assert r['historicalTypesObservedAdoption']==ty
stop,sv=get(AP/'NATIVE-FULLFUNCTION-STOP-OBSERVED-ADOPTION.json','b163345cae6eddad877aca5cae37d588ef007240fb56ea68a34575c305f6fcbf')
am=role(Q/'CURRENT-AP-NATIVE-REFUSAL-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json');av=read(am['path']);assert av['independentSourceReview']==r['sourceReview'] and av['sourceManifest']==r['sourcePins'] and av['executionAuthorization'] is False
native,nv=get(AP/'NATIVE-OBSERVER-CONTROLS-OBSERVED-ADOPTION.json','401e54ce61697d70e1fbbf2d10a7d263a2ff7afa465ab58f00faa9a5002431c4');assert nv['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_OBSERVER_72_CONTROLS_ONLY'
controls,cv=get(Q/'NATIVE-REFUSAL-DIAGNOSTIC-CONTROLS-OBSERVED-ADOPTION.json','385249f0239d6999318b62c6781c0f24c97e10600aa47dba6b51ddf6c4693ed4');assert controls==r['nativeRefusalControlsObservedAdoption'] and cv['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY' and cv['readback']==r['nativeRefusalControlsReadback']
protocol,pv=get(Q/'FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json','6be893244e2b268983325c78fa117645ca8ae7afa24983161ee789e330f6b9a3')
assert pv['currentOperationalTransition']==tr and pv['nativeRefusalControlsObservedAdoption']==controls and pv['priorProtectedStopAdoption']==stop and not os.path.lexists(S/'HEAVY-LANE-LOCK')
v={'schema':pv['protectionSchema'],'status':pv['protectionStatus'],'actualPreflight':r['preflight'],'independentPreflightReview':ir,'actualPreflightReadback':rr,'currentAPFullPreflightAdoption':full,'currentAPFullPreflightSnapshot':r['originalFullSnapshot'],'historicalTypesAdoption':ty,'historicalTypesHead':'7087f116cf998fd86e33fb8e004df628e0686dbd','currentOperationalTransition':tr,'reviewedPriorStopAdoption':stop,'productionHead':pv['productionHead'],'productionSourceTree':pv['productionSourceTree'],'protectedFreezeContinues':True,'game':False,'executionAuthorization':False,'actualTool':r['actualTool'],'actualReaderTool':ra,'sourceAndScopeAmendmentAdoption':am,'actualSessionId':r['actualToolSessionId'],'toolExit':0,'rawLocalOnlyRoles':r['rawLocalOnlyRoles'],'rawLocalOnlyBytes':r['rawLocalOnlyBytes'],'historicalTypesRemainHistorical':True,'mandatoryOriginalFullPostflightAfterGame':True,'fullQualificationAccepted':False,'m0BeforeAfterProofsRemainSeparate':True,'nativeControlsObservedAdoption':native,'nativeRefusalControlsObservedAdoption':controls,'prospectiveProtectionContract':protocol,'rootAdopterSource':role(__file__)}
p=Path(pv['protectionPath']);assert p==Q/'M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PROTECTION.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'protection':role(p)}))
