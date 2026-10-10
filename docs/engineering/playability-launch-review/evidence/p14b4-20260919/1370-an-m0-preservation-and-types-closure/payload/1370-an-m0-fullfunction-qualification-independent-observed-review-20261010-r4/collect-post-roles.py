import json,hashlib,os
from pathlib import Path
BASE=Path(__file__).parent
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry'
AN=S/'1370-an-root-continuation-20261009-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def write(name,v):
 b=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
 with (BASE/name).open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
def pinned(p,n,h):
 r=role(p);assert r['bytes']==n and r['sha256']==h,(r,n,h)
 return r
rbrole=pinned(P/'READBACK.json',5254,'23bca5ae5c387c7e10a5e4fb0ab95c4307ce9c28b7c579dd186f7e1eb17350e3')
rb=json.loads(Path(rbrole['path']).read_bytes())
roles={k:rb[k] for k in ('actualTool','baseline','fullPostflightSnapshot','snapshotPins','stdout','stderr','rawLocalOnlyClassification','guardConfig','guardSource','guardSourceReview','grant')}
roles['fullPostflightReadback']=rbrole
roles['readerActualTool']=pinned(P/'READER-ACTUAL-TOOL.json',1058,'72b024c14741855fc593767765e0d4a54c0f6338ea2c066fb71f7a05fc092654')
assert roles['fullPostflightSnapshot']['bytes']==8867475 and roles['fullPostflightSnapshot']['sha256']=='33302fe35a9320a1b16f5bd7ab6575e33ca74e69562e9cccb3b7fe261692eeb1'
write('POST-EVIDENCE-INPUT.json',{'roles':roles,'readerSessionId':44934})
recovery=pinned(AN/'FULLFUNCTION-R4-SHARED-POST-DISK-STOP-OBSERVED-ADOPTION.json',2387,'317c5e580df7599c83c390b1269e1d2a64f34788b1622d89941c7b077a763307')
r=json.loads(Path(recovery['path']).read_bytes())
after=pinned(AN/'FAILED-POST-SCANNER-AFTER-RECOVERY.json',855,'a8c1ccc4522fe64dfdab4e6b96ac243fd164a410d97a557028067e7c7c71676e')
a=json.loads(Path(after['path']).read_bytes())
extra={'failedPostRootObservation':recovery,'failedScannerAfterRecovery':after,'cleanupResult':r['cleanupResult'],'failedPostActualTool':r['failedPostActualTool'],'failedPostGrant':r['failedPostGrant'],'independentFailedPostAudit':r['independentFailureAudit']}
for rolevalue in extra.values():assert role(Path(rolevalue['path']))==rolevalue
assert r['original7509RemainsFailure'] is True and r['fullSharedPostflightAccepted'] is False and r['snapshotRole'] is None and r['automaticRetry'] is False
checks=[{'id':35222,'kind':'pid','result':'ESRCH'},{'id':35222,'kind':'pgid','result':'ESRCH'}]
assert r['postScannerChecks']==a['failedScanner']==checks and a['passingRecoveryReadback']==rbrole and a['passingReaderActual']==roles['readerActualTool']
cleanup=json.loads(Path(extra['cleanupResult']['path']).read_bytes())
write('FAILED-POST-RECOVERY-EVIDENCE.json',{'roles':extra,'original7509RemainsFailure':True,'failedPostWasNotFullMapAccepted':True,'separateFailedScanner35222ChecksBeforeAndAfterRecovery':checks,'failedPostScannerNotInsertedIntoSuccessfulScannerRoster':True,'rootReserveObservationFreeBytes':r['freeBytesNow'],'requiredFreeBytes':r['requiredFreeBytes'],'cleanupResult':cleanup,'partialPermissionStopPreserved':True,'noExclusiveCausalityClaim':True,'automaticRetry':False,'executionAuthorization':False})
print(json.dumps({'input':role(BASE/'POST-EVIDENCE-INPUT.json'),'recovery':role(BASE/'FAILED-POST-RECOVERY-EVIDENCE.json')}))

