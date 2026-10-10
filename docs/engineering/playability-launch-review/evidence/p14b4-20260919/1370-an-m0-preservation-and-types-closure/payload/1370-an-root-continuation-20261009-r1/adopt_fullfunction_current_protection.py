import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];r=read(rr['path']);assert r['decision']=='ACCEPT_ACTUAL_CURRENT_AM_FULLFUNCTION_PRELAUNCH_ONLY' and r['concreteFindings']==[] and r['executionAuthorization'] is False
ar=role(A/'M0-FULLFUNCTION-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json');assert ar['sha256']=='57661966ff99c6ae2a0441a3c85187969745b1f30ee0f2051a3314dd94e38163';v=read(ar['path'])
assert v['actualToolSessionId']==86072 and v['toolExit']==0 and v['scannerAbsent'] and v['nineRootsAndAncestryAndCurrentChecksAccepted'] and v['fullMapReuseUnderOriginalContinuousFreezeProvision'] and v['newFullInventory'] is False
tr=role(A/'M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json');assert tr['sha256']=='be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83';t=read(tr['path'])
assert v['typesObservedAdoption']==tr and v['originalFullSnapshot']==t['fullPostflightSnapshot'] and r['preflight']==v['preflight'] and r['readback']==ar
out={'schema':'1370-root-fullfunction-current-protection/v1','status':'ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE','productionHead':t['productionHead'],'productionSourceTree':t['productionSourceTree'],'typesAdoption':tr,'fullPostflightSnapshot':t['fullPostflightSnapshot'],'actualPreflight':v['preflight'],'independentPreflightReview':rr,'rootPreflightReadback':ar,'protectedFreezeContinues':True,'fullMapReusedUnderOriginalProvision':True,'newFullInventory':False,'rawWholeMachinePayloadExported':False,'executionAuthorization':False,'game':False}
p=A/'M0-FULLFUNCTION-CURRENT-PROTECTION.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
