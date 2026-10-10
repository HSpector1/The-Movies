import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';Q=S/'1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r4'
profile=json.loads((Q/'PROFILES.json').read_bytes())['types'];P=Path(profile['parentPath']);O=Path(profile['resultRoot'])/profile['runId'];L=Path(profile['laneLog'])
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert type(a['finalExit']) is int and a['finalExit']==0
r=json.loads(Path(profile['recorderResult']).read_bytes());v=json.loads((O/'RESULT.json').read_bytes());prot=json.loads((A/'M0-CURRENT-TYPES-PROTECTION-R6.json').read_bytes())
assert r['status']=='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' and r['childExit']==0 and r['groupClear'] is True and r['sourceDeadlineSeconds']==300 and r['recorderActiveSeconds']==320 and r['recorderWholeSeconds']==330 and r['elapsedSeconds']<330
assert v['status']=='PASS_M0_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY' and v['elapsedSeconds']<300 and v['gameAccepted'] is False and v['h13MetadataStopWaived'] is False
assert v['sourceBefore']==v['sourceAfter']==prot['freshSourceProof'] and v['nodeModulesBefore']==v['nodeModulesAfter']==prot['freshDependencyProof']
assert v['currentProtectionSha256']==role(A/'M0-CURRENT-TYPES-PROTECTION-R6.json')['sha256']
names=['dependency-versions','root-tsc','ui-tsc','diagnostic-collection']
assert [x['name'] for x in v['children']]==names and [x['name'] for x in v['rootChildBoundaries']]==names
for child,boundary in zip(v['children'],v['rootChildBoundaries']):
 assert type(child['exit']) is int and child['exit']==0 and boundary['before']==boundary['after']
 for stream in ('stdout','stderr'):
  rr=role(O/(child['name']+'.'+stream));assert rr['bytes']==child[stream+'Bytes']<=8388608 and rr['sha256']==child[stream+'Sha256']
col=role(O/'collection.json');assert col['bytes']==v['collectionBytes']<=1048576 and col['sha256']==v['collectionSha256']
assert 'tests/diagnostic.test.ts' in json.dumps(json.loads((O/'collection.json').read_bytes()))
f=json.loads((P/'FILL-RESULT.json').read_bytes());assert f['preparationDeadlineSeconds']==60 and 0<=f['preparationElapsedSeconds']<60 and f['runtimeClockStartsInsideUnchangedLAUNCH'] is True and f['combinedPreparationRuntimeDeadline'] is None
for key in ('context','grant','ownedIdentity'):assert role(f[key]['path'])==f[key]
assert f['context']['sha256']==r['contextSha256'] and f['grant']['sha256']==v['actualGrantSha256']
meta=Path(str(L)+'.meta').read_text();assert 'end, exit 0;' in meta and 'STOP' not in meta
lines=[json.loads(x) for x in L.read_bytes().splitlines()];assert len(lines)==4 and lines[0]['status']=='PARENT_CONTEXT_GRANT_WRITTEN_BEFORE_EXEC' and lines[1]['helperPid']==r['helperPid'] and lines[2]['status']==v['status'] and lines[2]['sha256']==role(O/'RESULT.json')['sha256'] and lines[3]['recorderStatus']==r['status'] and lines[3]['childExit']==0 and lines[3]['groupClear'] is True
g=json.loads((P/'ROOT-LANE-GRANT.json').read_bytes());assert g['ownedOuterHelperPid']==g['ownedOuterHelperPgid']==g['ownedOuterHelperSid'] and r['helperPid']==r['helperPgid']==r['helperSid']
ids=sorted([g['ownedOuterHelperPid'],r['helperPid'],r['childPid']]);assert len(set(ids))==3;checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('STOP recorded owner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-m0-types-actual-readback/v1','status':'ACTUAL_M0_TYPES_COMPLETE_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW','mode':'types','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':a['toolSessionId'],'toolExit':0,'helperExit':0,'recorderExit':0,'runnerExit':0,'rootLaneGrant':role(P/'ROOT-LANE-GRANT.json'),'fill':role(P/'FILL-RESULT.json'),'context':f['context'],'grant':f['grant'],'recorderResult':role(profile['recorderResult']),'typesResult':role(O/'RESULT.json'),'laneLog':role(L),'laneMetadata':role(Path(str(L)+'.meta')),'preparationElapsedSeconds':f['preparationElapsedSeconds'],'recorderElapsedSeconds':r['elapsedSeconds'],'runnerElapsedSeconds':v['elapsedSeconds'],'children':v['children'],'collection':col,'fourChildExitsZero':True,'fourChildRootBoundariesEqual':True,'sourceProofsEqual':True,'dependencyProofsEqual':True,'recordedOwnedIds':ids,'scopedOwnershipChecks':checks,'laneReleased':True,'executionAuthorization':False,'proofOrTypesAccepted':False,'game':False,'h13HistoricalStopWaived':False}
p=P/'READBACK.json'
with p.open('x') as z:json.dump(d,z,sort_keys=True,indent=2);z.write('\n');z.flush();os.fsync(z.fileno())
p.chmod(0o444);print(json.dumps(role(p)));print(json.dumps({k:d[k] for k in ('preparationElapsedSeconds','recorderElapsedSeconds','runnerElapsedSeconds','recordedOwnedIds')}))
