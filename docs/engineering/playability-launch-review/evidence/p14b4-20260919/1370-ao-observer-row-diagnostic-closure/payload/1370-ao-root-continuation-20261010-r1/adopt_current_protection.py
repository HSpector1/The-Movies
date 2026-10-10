import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-ao-root-continuation-20261010-r1';H=S/'1370-an-root-continuation-20261009-r1';P=S/'1370-ao-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def get(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
assert len(sys.argv)==4 and sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
ir,i=get(sys.argv[1],sys.argv[2]);assert i['decision']==sys.argv[3] and i['concreteFindings']==[] and i['executionAuthorization'] is False
rb,r=get(A/'M0-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json','be051cf9352269a852106bbdc7df4e67c4debae174f1d2a7dbbfa43680ca6e85')
assert r['toolExit']==0 and r['actualToolSessionId']==4674 and r['protectedFreezeContinues'] is True and r['nineRootsAndAncestryAndCurrentChecksAccepted'] is True and r['scannerAbsent'] is True and r['game'] is False and r['proofOrTypesAccepted'] is False
for v in r.values():
 if type(v) is dict and set(v)=={'path','bytes','sha256'}:assert role(v['path'])==v
assert rb in list(i.values()) and r['preflight'] in list(i.values())
actual=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert actual['toolSessionId']==4674 and actual['finalExit']==actual['chunks'][-1]['exit_code']==0
reader=json.loads((P/'READER-ACTUAL-TOOL.json').read_bytes());assert reader['finalExit']==reader['chunks'][-1]['exit_code']==0
full,_=get(A/'CURRENT-AN-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','753a7597c20032c70b2a07c9001de15ba1f72b5a0a5ac7706e340228da5fef5a')
tr,_=get(A/'CURRENT-AN-OPERATIONAL-TRANSITION.json','d92458f0d1af8249280ae2298c3d2eff4e62d53b271814dd8d745c3d9f073ccd')
ty,t=get(H/'M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json','be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83')
stop,_=get(H/'FULLFUNCTION-R5-STOP-OBSERVED-ADOPTION.json','ab5b801da2ec6408281115aa424bfafad8a8e458b96e3f068d5fecfb2346669f')
am,_=get(A/'CURRENT-AN-PRELAUNCH-SOURCE-AND-AMENDMENT-ADOPTION.json','c073425c2e24a8146648d0c68942b84af8bb0a421fe6210b0a113afbb3831784')
v={'schema':'1370-root-fullfunction-current-protection/v2','status':'ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE','actualPreflight':r['preflight'],'independentPreflightReview':ir,'actualPreflightReadback':rb,'currentANFullPreflightAdoption':full,'currentANFullPreflightSnapshot':r['originalFullSnapshot'],'historicalTypesAdoption':ty,'historicalTypesHead':'7087f116cf998fd86e33fb8e004df628e0686dbd','currentOperationalTransition':tr,'reviewedPriorStopAdoption':stop,'productionHead':'0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4','productionSourceTree':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','protectedFreezeContinues':True,'game':False,'executionAuthorization':False,'actualTool':r['actualTool'],'actualReaderTool':role(P/'READER-ACTUAL-TOOL.json'),'sourceAndScopeAmendmentAdoption':am,'actualSessionId':4674,'toolExit':0,'rawLocalOnlyRoles':4,'rawLocalOnlyBytes':1318834,'historicalTypesRemainHistorical':True,'mandatoryOriginalFullPostflightAfterGame':True,'fullQualificationAccepted':False,'m0BeforeAfterProofsRemainSeparate':True}
out=A/'M0-FULLFUNCTION-CURRENT-PROTECTION.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444)
for p in (P/'ACTUAL-TOOL.json',P/'READER-ACTUAL-TOOL.json'):p.chmod(0o444)
print(json.dumps(role(out)))
