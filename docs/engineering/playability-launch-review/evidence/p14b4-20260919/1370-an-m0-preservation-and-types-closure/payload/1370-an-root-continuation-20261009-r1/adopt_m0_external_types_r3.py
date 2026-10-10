import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rp=S/'1370-an-m0-types-external-config-independent-observed-review-20261009-r3/RECEIPT.json';rr=role(rp)
assert rr['sha256']=='aa9b78e2591dfba86233b7c216a85f3eff89088444c2fd138d4c08bc37c8df87' and rr['bytes']==27172
r=read(rp);assert r['decision']=='ACCEPT_OBSERVED_M0_EXTERNAL_CONFIG_TYPES_COLLECTION_WITH_FULL_POSTFLIGHT' and r['concreteFindings']==[] and r['executionAuthorization'] is False
keys=('result','readback','fullPostflightSnapshot','fullPostflightReadback','currentProtection','postR6RootAdoption','actualTool','fullPostflightActualTool','preflightObservedAdoption','collection')
for k in keys:assert role(r[k]['path'])==r[k]
v=read(r['result']['path']);rb=read(r['readback']['path']);f=read(r['fullPostflightReadback']['path']);root=read(r['postR6RootAdoption']['path'])
assert v['status']=='PASS_M0_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY' and v['sourceBefore']==v['sourceAfter']==r['freshSourceProof']==root['freshSourceProof'] and v['nodeModulesBefore']==v['nodeModulesAfter']==r['freshDependencyProof']==root['freshDependencyProof']
assert rb['fourChildExitsZero'] and rb['fourChildRootBoundariesEqual'] and rb['toolExit']==0 and rb['toolSessionId']==56426
assert f['toolExit']==0 and f['toolSessionId']==46072 and f['fullImmutableEqual'] and f['nineStrictRootsEqual'] and f['laneReleased'] and f['fullPostflightSnapshot']==r['fullPostflightSnapshot']
assert all(r[k] is True for k in ('typesAccepted','collectionAccepted','fullProtectedPostflight','soleLaneReleased','originalR6StopPreserved','originalR1DiskStopPreserved'))
assert r['historicalRootUnchanged'] is False and r['game'] is False and not os.path.lexists(S/'HEAVY-LANE-LOCK')
out={'schema':'1370-root-m0-external-config-types-observed-adoption/v1','status':'ROOT_ADOPTED_M0_EXTERNAL_CONFIG_TYPES_AND_COLLECTION_WITH_FULL_POSTFLIGHT','independentObservedReview':rr,**{k:r[k] for k in keys},'freshSourceProof':v['sourceAfter'],'freshDependencyProof':v['nodeModulesAfter'],'typesAccepted':True,'collectionAccepted':True,'fullProtectedPostflightAccepted':True,'soleLaneReleased':True,'historicalRootUnchanged':False,'originalR6StopPreserved':True,'originalR1DiskStopPreserved':True,'game':False,'executionAuthorization':False,'productionHead':'7087f116cf998fd86e33fb8e004df628e0686dbd','productionSourceTree':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','protectedFreezeContinues':True,'scope':'Fresh R3 M0 root and UI type checks, exact one-test collection and full protected preservation only. Collection did not execute the diagnostic or gameplay. Historical failures remain failures.'}
print(json.dumps(put(A/'M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json',out)))
