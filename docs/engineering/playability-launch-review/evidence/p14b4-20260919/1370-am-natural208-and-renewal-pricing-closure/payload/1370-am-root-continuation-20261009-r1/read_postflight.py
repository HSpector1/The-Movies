import json,hashlib,os,datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-c0-a208-fullguard-postflight-parent-after-al-20261009-r4';D=S/'1370-c0-a208-fullguard-game-filled-after-al-20261009-r1/evidence/postflight-after-al-a208-r4'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
tool=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert tool['toolSessionId']==32424 and type(tool['finalExit']) is int and tool['finalExit']==0
summary=json.loads((P/'postflight.stdout').read_bytes());assert summary['status']=='GUARDS_ACCEPTED_READONLY' and (P/'postflight.stderr').stat().st_size==0
snapshot=json.loads((D/'SNAPSHOT.json').read_bytes());pins=json.loads((D/'PINS.json').read_bytes());assert snapshot['status']==pins['status']=='GUARDS_ACCEPTED_READONLY' and snapshot['phase']=='postflight'
for name,h in pins['files'].items():assert role(D/name)['sha256']==h
assert role(D/'SNAPSHOT.json')['sha256']==summary['snapshotSha256'] and role(D/'PINS.json')['sha256']==summary['pinsSha256']
before=json.loads((D.parent/'before-fill-after-al-r1/SNAPSHOT.json').read_bytes());after=json.loads((D.parent/'after-fill-after-al-game-r4/SNAPSHOT.json').read_bytes())
assert snapshot['immutable']==before['immutable']==after['immutable']
assert snapshot['rootsBefore']==snapshot['rootsAfter']
checks=[]
for n in [34390,42893]:
 for kind,fn in [('pid',os.kill),('pgid',os.killpg)]:
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':kind,'id':n,'signal':0,'result':'ESRCH'})
  else:raise RuntimeError('recorded identity present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
owned=put(P/'POST-OWNERSHIP.json',{'schema':'1370-root-scoped-post-ownership/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'heavyLaneLockAbsent':True,'scope':'Recorded game helper34390 and direct scanner42893 only. Internal game child IDs unknown; no global or historical numeric absence claim.'})
raw=[dict(role(D/n),archiveDisposition='LOCAL_HASH_SIZE_ONLY') for n in ['BEFORE-PS.txt','AFTER-PS.txt','BEFORE-LSOF.bin','AFTER-LSOF.bin']]
classification=put(P/'RAW-LOCAL-ONLY-ROLES.json',{'schema':'1370-explicit-semantic-local-raw-roles/v1','roles':raw,'totalBytes':sum(x['bytes'] for x in raw),'reason':'Whole-machine PS/FD raw captures regardless filename extension; publish metadata only.'})
r={'schema':'1370-root-a208-postflight-readback/v1','status':'ACTUAL_ORIGINAL_FULL_POSTFLIGHT_MATCH_PENDING_INDEPENDENT_GAME_ADMISSION','actualTool':role(P/'ACTUAL-TOOL.json'),'actualToolSessionId':32424,'actualToolExit':0,'scannerExit':0,'grant':role(P/'POSTFLIGHT-GRANT.json'),'snapshot':role(D/'SNAPSHOT.json'),'pins':role(D/'PINS.json'),'stdout':role(P/'postflight.stdout'),'stderr':role(P/'postflight.stderr'),'summary':summary,'immutableBaselineEquality':True,'afterFillEquality':True,'postOwnership':owned,'rawLocalOnlyClassification':classification,'numericGameChildIdsUnknown':True,'protectedFreezeContinues':True,'gameAccepted':False}
print(json.dumps(put(P/'POSTFLIGHT-READBACK.json',r)))
print(json.dumps(summary))
