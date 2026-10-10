import hashlib,json,os,stat
from pathlib import Path
A=Path('/Users/zacheryspector/studio-scratch/1370-an-root-continuation-20261009-r1')
F=A.parent/'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
checks=[]
for fn,kind in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:fn(35222,0)
 except ProcessLookupError:checks.append({'kind':kind,'id':35222,'result':'ESRCH'})
 else:raise RuntimeError('failed scanner remains')
r=json.loads((F/'READBACK.json').read_bytes())
assert r['toolSessionId']==17336 and r['toolExit']==0
v={'schema':'1370-root-failed-post-scanner-after-recovery/v1','passingRecoveryReadback':role(F/'READBACK.json'),'passingReaderActual':role(F/'READER-ACTUAL-TOOL.json'),'failedScanner':checks,'executionAuthorization':False}
p=A/'FAILED-POST-SCANNER-AFTER-RECOVERY.json'
with p.open('x') as h:json.dump(v,h,sort_keys=True,indent=2);h.write('\n');h.flush();os.fsync(h.fileno())
p.chmod(0o444)
print(json.dumps({'absence':role(p),'readback':v['passingRecoveryReadback'],'reader':v['passingReaderActual'],'snapshot':r['fullPostflightSnapshot']}))
