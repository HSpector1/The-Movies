import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-m0-types-external-config-parent-adapter-source-20261009-r1'
profile=json.loads((Q/'PROFILES.json').read_bytes())['types'];P=Path(profile['parentPath']);O=Path(profile['resultRoot'])/profile['runId'];L=Path(profile['laneLog'])
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['toolSessionId']==55264 and a['finalExit']==1
r=json.loads(Path(profile['recorderResult']).read_bytes());v=json.loads((O/'RESULT.json').read_bytes());prot=json.loads((A/'M0-CURRENT-EXTERNAL-CONFIG-TYPES-PROTECTION.json').read_bytes())
assert role(O/'RESULT.json')['sha256']=='b725d97e93fd0344d96b30e304246df447c39d517ef26d734aa42cb527767637'
assert r['status']=='STOP_CHILD_NONZERO' and r['childExit']==1 and r['groupClear'] is True and r['sourceDeadlineSeconds']==300 and r['recorderActiveSeconds']==320 and r['recorderWholeSeconds']==330 and r['elapsedSeconds']<320
assert v['status']=='STOP_POSTFLIGHT_UNVERIFIED' and v['error']=="RuntimeError('3 GiB disk floor')" and v['postflightError']=="RuntimeError('3 GiB disk floor')" and v['elapsedSeconds']<300 and v['h13MetadataStopWaived'] is False and v['gameAccepted'] is False
assert v['sourceBefore']==prot['freshSourceProof'] and v['nodeModulesBefore']==prot['freshDependencyProof']
assert 'sourceAfter' not in v and 'nodeModulesAfter' not in v
assert [(x['name'],x['exit']) for x in v['children']]==[('dependency-versions',0)]
assert [x['name'] for x in v['rootChildBoundaries']]==['dependency-versions','root-tsc']
assert v['rootChildBoundaries'][0]['before']==v['rootChildBoundaries'][0]['after']
boundary=v['rootChildBoundaries'][1]
assert boundary['after'] is None and boundary['afterError']==v['error'] and boundary['childError']==v['error'] and boundary['childPhase']=='pipe-pump'
for child in v['children']:
 for stream in ('stdout','stderr'):
  rr=role(O/(child['name']+'.'+stream));assert rr['bytes']==child[stream+'Bytes']<=8388608 and rr['sha256']==child[stream+'Sha256']
assert not os.path.lexists(O/'collection.json') and v['historicalRootUnchanged'] is False and v['originalR6StopPreserved'] is True
f=json.loads((P/'FILL-RESULT.json').read_bytes());assert 0<=f['preparationElapsedSeconds']<60 and f['preparationDeadlineSeconds']==60
for key in ('context','grant','ownedIdentity'):assert role(f[key]['path'])==f[key]
assert f['context']['sha256']==r['contextSha256'] and f['grant']['sha256']==v['actualGrantSha256']
assert 'end, exit 1;' in Path(str(L)+'.meta').read_text()
g=json.loads((P/'ROOT-LANE-GRANT.json').read_bytes());assert g['ownedOuterHelperPid']==g['ownedOuterHelperPgid']==g['ownedOuterHelperSid']==24146 and r['helperPid']==r['helperPgid']==r['helperSid']==24401 and r['childPid']==24665
ids=[24146,24401,24665];checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('STOP recorded owner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-m0-types-actual-stop-readback/v1','status':'ACTUAL_M0_TYPES_DISK_FLOOR_STOP_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW','mode':'types','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':55264,'toolExit':1,'helperExit':1,'recorderExit':1,'runnerExit':1,'rootLaneGrant':role(P/'ROOT-LANE-GRANT.json'),'fill':role(P/'FILL-RESULT.json'),'context':f['context'],'grant':f['grant'],'recorderResult':role(profile['recorderResult']),'typesResult':role(O/'RESULT.json'),'laneLog':role(L),'laneMetadata':role(Path(str(L)+'.meta')),'preparationElapsedSeconds':f['preparationElapsedSeconds'],'recorderElapsedSeconds':r['elapsedSeconds'],'runnerElapsedSeconds':v['elapsedSeconds'],'children':v['children'],'commandsNotExecuted':['ui-tsc','diagnostic-collection'],'rootCompilerInterrupted':True,'dependencyChildRootBoundaryEqual':True,'rootCompilerBoundary':boundary,'diskFloorError':v['error'],'postflightError':v['postflightError'],'sourceAfterAvailable':False,'dependencyAfterAvailable':False,'sourcePreservationAccepted':False,'dependencyPreservationAccepted':False,'retainedCollectionArtifact':None,'collectionAccepted':False,'recordedOwnedIds':ids,'scopedOwnershipChecks':checks,'laneReleased':True,'executionAuthorization':False,'proofOrTypesAccepted':False,'game':False,'h13HistoricalStopWaived':False,'automaticRetry':False,'originalR6StopPreserved':True,'historicalRootUnchanged':False,'currentProtection':role(A/'M0-CURRENT-EXTERNAL-CONFIG-TYPES-PROTECTION.json'),'postR6RootAdoption':v['postR6RootAdoption'],'actualRuntimeDiskFloorStop':True}
p=P/'READBACK.json'
with p.open('x') as z:json.dump(d,z,sort_keys=True,indent=2);z.write('\n');z.flush();os.fsync(z.fileno())
p.chmod(0o444);print(json.dumps(role(p)));print(json.dumps({'result':'STOP_PRESERVED','fourChildrenExitZero':False,'recordedOwnedIds':ids,'sourcePreservationAccepted':False}))
