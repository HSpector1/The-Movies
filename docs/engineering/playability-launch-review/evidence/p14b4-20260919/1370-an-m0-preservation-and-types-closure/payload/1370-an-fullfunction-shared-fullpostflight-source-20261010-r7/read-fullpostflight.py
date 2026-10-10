import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry';G=S/'1370-an-current-operational-fullguard-source-20261009-r1'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
assert len(sys.argv)==3 and sys.argv[1].isdigit()
actual=read(P/'ACTUAL-TOOL.json');assert type(actual['sessionId']) is int and actual['sessionId']==int(sys.argv[1]) and type(actual['finalExit']) is int and actual['finalExit']==0 and actual['allToolChunks'][-1]['exit_code']==0
g=read(P/'GRANT.json');assert role(P/'GRANT.json')['sha256']==sys.argv[2]
for key in ('actualRouteReadback','guardSource','guardConfig','baseline','guardSourceReview','guardSourcePins'):assert role(g[key]['path'])==g[key]
rb=read(g['actualRouteReadback']['path']);assert rb['recordedOwnedGroupIds']==g['actualPriorOwnedIds'] and rb['recordedOwnedPids']==g['actualPriorOwnedPids'] and rb['completed'] is True and rb['laneReleased'] is True
assert rb['status']==g['priorRouteStatus'] and {k:rb[k] for k in g['priorRouteExits']}==g['priorRouteExits']
O=Path(g['outputDirectory']);assert O==G/'evidence/postflight-fullfunction-qualification-r4-disk-retry'
summary=read(P/'postflight.stdout');assert summary['status']=='GUARDS_ACCEPTED_READONLY' and summary['snapshotPath']==str(O/'SNAPSHOT.json') and summary['snapshotSha256']==role(O/'SNAPSHOT.json')['sha256'] and summary['pinsSha256']==role(O/'PINS.json')['sha256']
assert (P/'postflight.stderr').read_bytes()==b''
for name,h in read(O/'PINS.json')['files'].items():assert '/' not in name and role(O/name)['sha256']==h
v=read(O/'SNAPSHOT.json');base=read(g['baseline']['path']);assert v['status']=='GUARDS_ACCEPTED_READONLY' and v['phase']=='postflight' and v['baseline']=={k:g['baseline'][k] for k in ('path','sha256')}
assert v['configSha256']==g['guardConfig']['sha256'] and v['snapshotProcedureSha256']==g['guardSource']['sha256'] and v['immutable']==base['immutable']
before=v['rootsBefore'];after=v['rootsAfter'];assert {k:x for k,x in before.items() if k!='scratchParent'}=={k:x for k,x in after.items() if k!='scratchParent'}==v['immutable']['strictRoots']
for k in ('path','device','inode','mode'):assert before['scratchParent'][k]==after['scratchParent'][k]==v['immutable']['scratchParentIdentity'][k]
for side in ('currentBefore','currentAfter'):
 f=v[side];assert f['ownedGroupIdsChecked']==g['actualPriorOwnedIds'] and f['ownedGroupClearanceClaim'] is True and f['relevantWorkersAbsent'] is True and f['fdOriginalAndEphemeralAndRetainedHPassed'] is True and f['fdOriginalM0ParentPassed'] is True
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
ids=sorted(set(g['actualPriorOwnedIds']+[g['ownedScannerPgid']]));pids=sorted(set(g['actualPriorOwnedPids']+[g['ownedScannerPid']]));checks=[]
for values,fn,label in ((pids,os.kill,'pid'),(ids,os.killpg,'pgid')):
 for n in values:
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('Recorded owned identity remains live')
raw=put(P/'RAW-LOCAL-ONLY-CLASSIFICATION.json',{'schema':'1370-an-fullpostflight-raw-local-only/v1','classification':'LOCAL_HASH_SIZE_ONLY','roles':[dict(role(O/name),archiveDisposition='LOCAL_HASH_SIZE_ONLY') for name in ('BEFORE-PS.txt','BEFORE-LSOF.bin','AFTER-PS.txt','AFTER-LSOF.bin')],'rawBytesIncluded':False})
out={'schema':'1370-an-fullfunction-shared-fullpostflight-readback/v1','status':'ACTUAL_FULLFUNCTION_SHARED_FULL_POSTFLIGHT_COMPLETE_PENDING_INDEPENDENT_REVIEW','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':actual['sessionId'],'toolExit':0,'grant':role(P/'GRANT.json'),'actualRouteReadback':g['actualRouteReadback'],'fullPostflightSnapshot':role(O/'SNAPSHOT.json'),'snapshotPins':role(O/'PINS.json'),'baseline':g['baseline'],'guardSource':g['guardSource'],'guardConfig':g['guardConfig'],'guardSourcePins':g['guardSourcePins'],'guardSourceReview':g['guardSourceReview'],'stdout':role(P/'postflight.stdout'),'stderr':role(P/'postflight.stderr'),'fullImmutableEqual':True,'nineStrictRootsEqual':True,'scratchIdentityOnlyEqual':True,'guardSeconds':v['elapsedSeconds'],'inventorySeconds':v['inventoryElapsedSeconds'],'actualOwnedGroupIds':ids,'actualOwnedPids':pids,'priorRouteStatus':g['priorRouteStatus'],'priorRouteExits':g['priorRouteExits'],'priorStopPreserved':g['priorStopPreserved'],'scopedOwnershipChecks':checks,'laneReleased':True,'rawLocalOnlyClassification':raw,'executionAuthorization':False,'m0TypesResultAdopted':False,'collectionAccepted':False,'typesAccepted':False,'game':False,'originalR6StopPreserved':True}
print(json.dumps({'readback':put(P/'READBACK.json',out),'guardSeconds':v['elapsedSeconds'],'inventorySeconds':v['inventoryElapsedSeconds'],'actualOwnedGroupIds':ids,'actualOwnedPids':pids,'priorRouteStatus':g['priorRouteStatus'],'priorRouteExits':g['priorRouteExits'],'priorStopPreserved':g['priorStopPreserved']}))
