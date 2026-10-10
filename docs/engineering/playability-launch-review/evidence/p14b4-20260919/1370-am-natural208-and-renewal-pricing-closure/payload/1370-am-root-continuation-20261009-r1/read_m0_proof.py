import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r2';profile=json.loads((Q/'PROFILES.json').read_bytes())['proof'];P=Path(profile['parentPath']);O=Path(profile['resultRoot'])/profile['runId'];L=Path(profile['laneLog'])
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['toolSessionId']==20818 and a['finalExit']==0
r=json.loads(Path(profile['recorderResult']).read_bytes());v=json.loads((O/'RESULT.json').read_bytes());assert r['status']=='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' and r['childExit']==0 and r['groupClear'] is True and r['sourceDeadlineSeconds']==300 and r['recorderActiveSeconds']==320 and r['recorderWholeSeconds']==330 and r['elapsedSeconds']<320
assert v['status']=='PASS_READONLY_CURRENT_M0_SOURCE_DEPENDENCY_PROOF' and v['sourceAfter']==v['freshSourceProof'] and v['dependencyAfter']==v['freshDependencyProof'] and v['elapsedSeconds']<300 and v['typesCommandsExecuted']==v['collectionCommandsExecuted']==0 and v['game'] is False
assert v['freshSourceProof']['mirrorFiles']==1740 and v['freshSourceProof']['mirrorBytes']==119393120 and v['freshSourceProof']['traversedEntries']==1853 and v['freshDependencyProof']['entries']==12484 and v['freshDependencyProof']['contentBytes']==348223802
f=json.loads((P/'FILL-RESULT.json').read_bytes());assert f['preparationDeadlineSeconds']==60 and 0<=f['preparationElapsedSeconds']<60 and f['runtimeClockStartsInsideUnchangedLAUNCH'] is True and f['combinedPreparationRuntimeDeadline'] is None
for k in ('context','grant','ownedIdentity'):assert role(f[k]['path'])==f[k]
assert f['context']['sha256']==r['contextSha256'] and f['grant']['sha256']==v['actualGrantSha256']
meta=Path(str(L)+'.meta').read_text();assert 'end, exit 0;' in meta and 'STOP' not in meta
lines=[json.loads(x) for x in L.read_bytes().splitlines()];assert len(lines)==4 and lines[0]['status']=='PARENT_CONTEXT_GRANT_WRITTEN_BEFORE_EXEC' and lines[1]['helperPid']==r['helperPid'] and lines[2]['status']==v['status'] and lines[2]['sha256']==role(O/'RESULT.json')['sha256'] and lines[3]['recorderStatus']==r['status'] and lines[3]['childExit']==0 and lines[3]['groupClear'] is True
g=json.loads((P/'ROOT-LANE-GRANT.json').read_bytes());assert g['ownedOuterHelperPid']==g['ownedOuterHelperPgid']==g['ownedOuterHelperSid']==89067 and r['helperPid']==r['helperPgid']==r['helperSid']==89322 and r['childPid']==89341
ids=sorted([g['ownedOuterHelperPid'],r['helperPid'],r['childPid']]);checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('STOP recorded owner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-m0-current-proof-actual-readback/v1','status':'ACTUAL_M0_PROOF_COMPLETE_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW','mode':'proof','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':20818,'toolExit':0,'helperExit':0,'recorderExit':0,'runnerExit':0,'rootLaneGrant':role(P/'ROOT-LANE-GRANT.json'),'fill':role(P/'FILL-RESULT.json'),'context':f['context'],'grant':f['grant'],'recorderResult':role(profile['recorderResult']),'sourceDependencyResult':role(O/'RESULT.json'),'laneLog':role(L),'laneMetadata':role(Path(str(L)+'.meta')),'preparationElapsedSeconds':f['preparationElapsedSeconds'],'recorderElapsedSeconds':r['elapsedSeconds'],'runnerElapsedSeconds':v['elapsedSeconds'],'sourceProofsEqual':True,'dependencyProofsEqual':True,'mirrorFiles':1740,'mirrorBytes':119393120,'mirrorEntriesExcludingRoot':1853,'dependencyEntriesExcludingRoot':12484,'dependencyContentBytes':348223802,'recordedOwnedIds':ids,'scopedOwnershipChecks':checks,'laneReleased':True,'executionAuthorization':False,'proofOrTypesAccepted':False,'game':False}
p=P/'READBACK.json'
with p.open('x') as z:json.dump(d,z,sort_keys=True,indent=2);z.write('\n');z.flush();os.fsync(z.fileno())
p.chmod(0o444);print(json.dumps(role(p)));print(json.dumps({k:d[k] for k in ('preparationElapsedSeconds','recorderElapsedSeconds','runnerElapsedSeconds','recordedOwnedIds')}))
