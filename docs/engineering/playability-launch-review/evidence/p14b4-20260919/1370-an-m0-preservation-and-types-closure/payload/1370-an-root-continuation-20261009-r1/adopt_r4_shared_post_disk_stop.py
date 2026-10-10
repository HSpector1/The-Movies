import hashlib,json,os,shutil,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rr=role(S/'1370-an-fullfunction-shared-fullpostflight-disk-floor-stop-independent-observed-audit-20261010-r1/RECEIPT.json');assert rr['sha256']=='4b333b4836a3f52474afc2ee3dd5eb01c1aebb12fd369cf0c75292b684140517';r=read(rr['path'])
assert r['decision']=='OBSERVED_SHARED_FULL_POSTFLIGHT_DISK_FLOOR_STOP_ONLY_NO_PROTECTION_ADMISSION' and r['concreteFindings']==[] and r['executionAuthorization'] is False
for v in r['roles'].values():assert role(v['path'])==v
assert r['observed']['toolSessionId']==7509 and r['observed']['actualFinalExit']==1 and r['observed']['scannerOwnedClaim']=={'pid':35222,'pgid':35222,'sid':35222} and r['qualification']['fullSharedPostflightAccepted'] is False
checks=[]
for f,k in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:f(35222,0)
 except ProcessLookupError:checks.append({'kind':k,'id':35222,'result':'ESRCH'})
 else:raise RuntimeError('Failed post scanner remains')
cr=role(S/'1370-an-approved-browser-npm-cache-cleanup-20261010-r1/RESULT.json');assert cr['sha256']=='9d481eaa9640ccd9bdacfd28d98d0ff5449077d220fe47a6140bc422ec66e707';c=read(cr['path']);assert c['status']=='STOP_CACHE_CLEANUP' and c['errorType']=='PermissionError' and c['projectEvidenceTouched'] is False and c['reopenChrome']['returncode']==0
assert [x['completed'] for x in c['roots']]==[True,True,False]
free=shutil.disk_usage(S).free;assert free>=3758096384 and not os.path.lexists(S/'HEAVY-LANE-LOCK')
v={'schema':'1370-root-failed-postflight-and-restored-reserve-observation/v1','status':'ROOT_ADOPTED_FAILED_SHARED_POST_DISK_STOP_ONLY_RESERVE_RESTORED','independentFailureAudit':rr,'failedPostGrant':r['grant'],'failedPostActualTool':r['actualTool'],'actualRouteReadback':r['actualRouteReadback'],'postScannerChecks':checks,'cleanupResult':cr,'cleanupPartialPermissionStopPreserved':True,'freeBytesNow':free,'requiredFreeBytes':3758096384,'fullSharedPostflightAccepted':False,'snapshotRole':None,'original7509RemainsFailure':True,'executionAuthorization':False,'automaticRetry':False,'protectedFreezeContinues':True,'scope':'Failed original post7509 remains unaccepted; actual source root maps not manufactured. Already-approved Google/Chrome cache content cleanup completed and npm partial PermissionError preserved; Chrome reopened. Measured reserve restored, not guaranteed. Fresh separately reviewed/recorded original post required; scoped failed scanner absent now, to be checked again after fresh post.'}
p=A/'FULLFUNCTION-R4-SHARED-POST-DISK-STOP-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
