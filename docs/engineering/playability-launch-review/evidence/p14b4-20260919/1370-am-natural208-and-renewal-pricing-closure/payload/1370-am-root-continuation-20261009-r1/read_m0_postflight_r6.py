import datetime,hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
assert len(sys.argv)==2 and sys.argv[1]=='types';mode=sys.argv[1]
P=S/('1370-c0-m0-'+mode+'-fullguard-postflight-parent-after-al-20261009-r3')
G=S/'1370-c0-a208-fullguard-game-filled-after-al-20261009-r1';D=G/'evidence'/('postflight-after-al-m0-'+mode+'-r3')
def role(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
tool=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert type(tool['finalExit']) is int and tool['finalExit']==0
grant=json.loads((P/'GRANT.json').read_bytes());assert grant['mode']==mode and grant['ownedScannerPid']==grant['ownedScannerPgid']==grant['ownedScannerSid']
assert grant['outputDirectory']==str(D) and grant['protectedFreezeContinues'] is True
for key in ('guardSource','guardConfig','baseline','actualRouteReadback'):
 assert role(grant[key]['path'])==grant[key]
summary=json.loads((P/'postflight.stdout').read_bytes());assert summary['status']=='GUARDS_ACCEPTED_READONLY' and (P/'postflight.stderr').stat().st_size==0
snapshot=json.loads((D/'SNAPSHOT.json').read_bytes());pins=json.loads((D/'PINS.json').read_bytes())
assert snapshot['status']==pins['status']=='GUARDS_ACCEPTED_READONLY' and snapshot['phase']=='postflight'
for name,h in pins['files'].items():assert role(D/name)['sha256']==h
assert role(D/'SNAPSHOT.json')['sha256']==summary['snapshotSha256'] and role(D/'PINS.json')['sha256']==summary['pinsSha256']
before=json.loads((G/'evidence/before-fill-after-al-r1/SNAPSHOT.json').read_bytes())
previous=json.loads((G/'evidence/postflight-after-al-a208-r4/SNAPSHOT.json').read_bytes())
assert snapshot['immutable']==before['immutable']==previous['immutable']
assert {k:v for k,v in snapshot['rootsBefore'].items() if k!='scratchParent'}=={k:v for k,v in snapshot['rootsAfter'].items() if k!='scratchParent'}
assert {k:v for k,v in snapshot['rootsBefore']['scratchParent'].items() if k not in ('mtimeNs','ctimeNs')}=={k:v for k,v in snapshot['rootsAfter']['scratchParent'].items() if k not in ('mtimeNs','ctimeNs')}
ids=sorted(set(grant['actualPriorOwnedIds']+[grant['ownedScannerPid']]));assert len(ids)==4
checks=[]
for n in ids:
 for kind,fn in [('pid',os.kill),('pgid',os.killpg)]:
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':kind,'id':n,'signal':0,'result':'ESRCH'})
  else:raise RuntimeError('STOP recorded identity present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
owned=put(P/'POST-OWNERSHIP.json',{'schema':'1370-root-scoped-post-ownership/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'heavyLaneLockAbsent':True,'scope':'Actual root helper, preparation/recorder, runner and direct full scanner only. No global or other historical numeric absence claim.'})
raw=[dict(role(D/n),archiveDisposition='LOCAL_HASH_SIZE_ONLY') for n in ['BEFORE-PS.txt','AFTER-PS.txt','BEFORE-LSOF.bin','AFTER-LSOF.bin']]
classification=put(P/'RAW-LOCAL-ONLY-ROLES.json',{'schema':'1370-explicit-semantic-local-raw-roles/v1','roles':raw,'totalBytes':sum(x['bytes'] for x in raw),'reason':'Whole-machine PS/FD captures by semantic role regardless filename extension; publish metadata only.'})
r={'schema':'1370-root-m0-original-shared-full-postflight-readback/v1','status':'ACTUAL_ORIGINAL_FULL_POSTFLIGHT_MATCH_PENDING_INDEPENDENT_M0_ADMISSION','mode':mode,'actualTool':role(P/'ACTUAL-TOOL.json'),'actualToolSessionId':tool['toolSessionId'],'actualToolExit':0,'scannerExit':0,'grant':role(P/'GRANT.json'),'snapshot':role(D/'SNAPSHOT.json'),'pins':role(D/'PINS.json'),'stdout':role(P/'postflight.stdout'),'stderr':role(P/'postflight.stderr'),'summary':summary,'immutableBaselineEquality':True,'previousAcceptedPostflightEquality':True,'postOwnership':owned,'rawLocalOnlyClassification':classification,'protectedFreezeContinues':True,'m0SourceDependencyProofSeparate':True,'proofOrTypesAccepted':False,'gameAccepted':False}
print(json.dumps(put(P/'POSTFLIGHT-READBACK.json',r)));print(json.dumps(summary))
