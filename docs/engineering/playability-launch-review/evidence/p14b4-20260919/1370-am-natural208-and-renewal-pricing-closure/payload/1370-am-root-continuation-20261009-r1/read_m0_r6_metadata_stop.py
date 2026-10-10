import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';Q=S/'1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r4'
profile=json.loads((Q/'PROFILES.json').read_bytes())['types'];P=Path(profile['parentPath']);O=Path(profile['resultRoot'])/profile['runId'];L=Path(profile['laneLog'])
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['toolSessionId']==97276 and a['finalExit']==1
r=json.loads(Path(profile['recorderResult']).read_bytes());v=json.loads((O/'RESULT.json').read_bytes());prot=json.loads((A/'M0-CURRENT-TYPES-PROTECTION-R6.json').read_bytes())
assert role(O/'RESULT.json')['sha256']=='85e1f6763f40b8232b851ef2caf3611ed9e3b6d3962d748eeeda063da608d781'
assert r['status']=='STOP_CHILD_NONZERO' and r['childExit']==1 and r['groupClear'] is True and r['sourceDeadlineSeconds']==300 and r['recorderActiveSeconds']==320 and r['recorderWholeSeconds']==330 and r['elapsedSeconds']<320
assert v['status']=='STOP_POSTFLIGHT_UNVERIFIED' and v['error']=="RuntimeError('diagnostic-collection mirror root entry/metadata drift')" and v['postflightError']=="RuntimeError('admitted directory metadata .')" and v['elapsedSeconds']<300 and v['h13MetadataStopWaived'] is False and v['gameAccepted'] is False
assert v['sourceBefore']==prot['freshSourceProof'] and v['nodeModulesBefore']==prot['freshDependencyProof']
assert 'sourceAfter' not in v and 'nodeModulesAfter' not in v
names=['dependency-versions','root-tsc','ui-tsc','diagnostic-collection']
assert [(x['name'],x['exit']) for x in v['children']]==[(n,0) for n in names] and [x['name'] for x in v['rootChildBoundaries']]==names
for i,(child,boundary) in enumerate(zip(v['children'],v['rootChildBoundaries'])):
 if i<3:assert boundary['before']==boundary['after']
 else:
  assert boundary['before']['entries']==boundary['after']['entries'] and boundary['before']['rosterSha256']==boundary['after']['rosterSha256']
  assert boundary['before']['identity'][:5]==boundary['after']['identity'][:5] and boundary['before']['identity'][5:]==[1791577446298737027]*2 and boundary['after']['identity'][5:]==[1791600924862151724]*2
 for stream in ('stdout','stderr'):
  rr=role(O/(child['name']+'.'+stream));assert rr['bytes']==child[stream+'Bytes']<=8388608 and rr['sha256']==child[stream+'Sha256']
f=json.loads((P/'FILL-RESULT.json').read_bytes());assert 0<=f['preparationElapsedSeconds']<60 and f['preparationDeadlineSeconds']==60
for key in ('context','grant','ownedIdentity'):assert role(f[key]['path'])==f[key]
assert f['context']['sha256']==r['contextSha256'] and f['grant']['sha256']==v['actualGrantSha256']
assert 'end, exit 1;' in Path(str(L)+'.meta').read_text()
g=json.loads((P/'ROOT-LANE-GRANT.json').read_bytes());assert g['ownedOuterHelperPid']==g['ownedOuterHelperPgid']==g['ownedOuterHelperSid']==27153 and r['helperPid']==r['helperPgid']==r['helperSid']==27410 and r['childPid']==27430
ids=[27153,27410,27430];checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('STOP recorded owner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-m0-types-actual-stop-readback/v1','status':'ACTUAL_M0_TYPES_METADATA_STOP_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW','mode':'types','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':97276,'toolExit':1,'helperExit':1,'recorderExit':1,'runnerExit':1,'rootLaneGrant':role(P/'ROOT-LANE-GRANT.json'),'fill':role(P/'FILL-RESULT.json'),'context':f['context'],'grant':f['grant'],'recorderResult':role(profile['recorderResult']),'typesResult':role(O/'RESULT.json'),'laneLog':role(L),'laneMetadata':role(Path(str(L)+'.meta')),'preparationElapsedSeconds':f['preparationElapsedSeconds'],'recorderElapsedSeconds':r['elapsedSeconds'],'runnerElapsedSeconds':v['elapsedSeconds'],'children':v['children'],'commandsNotExecuted':[],'firstThreeChildRootBoundariesEqual':True,'fourthChildRootRosterEqual':True,'fourthChildRootMetadataChanged':True,'fourthChildBoundary':v['rootChildBoundaries'][3],'sourceAfterAvailable':False,'dependencyAfterAvailable':False,'sourcePreservationAccepted':False,'dependencyPreservationAccepted':False,'retainedCollectionArtifact':role(O/'collection.json'),'collectionAccepted':False,'recordedOwnedIds':ids,'scopedOwnershipChecks':checks,'laneReleased':True,'executionAuthorization':False,'proofOrTypesAccepted':False,'game':False,'h13HistoricalStopWaived':False,'automaticRetry':False,'unexplainedMetadataMutationCausePending':True}
p=P/'READBACK.json'
with p.open('x') as z:json.dump(d,z,sort_keys=True,indent=2);z.write('\n');z.flush();os.fsync(z.fileno())
p.chmod(0o444);print(json.dumps(role(p)));print(json.dumps({'result':'STOP_PRESERVED','fourChildrenExitZero':True,'recordedOwnedIds':ids,'sourcePreservationAccepted':False}))
