import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-an-m0-post-r6-preservation-diagnostic-parent-source-20261009-r2';profile=json.loads((Q/'PROFILES.json').read_bytes())['proof'];P=Path(profile['parentPath']);O=Path(profile['resultRoot'])/profile['runId'];L=Path(profile['laneLog'])
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
a=read(P/'ACTUAL-TOOL.json');assert a['toolSessionId']==64460 and type(a['finalExit']) is int and a['finalExit']==0
r=read(profile['recorderResult']);v=read(O/'RESULT.json');cfg=read(profile['config']['path'])
assert r['status']=='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' and r['childExit']==0 and r['groupClear'] is True and r['sourceDeadlineSeconds']==300 and r['recorderActiveSeconds']==320 and r['recorderWholeSeconds']==330 and r['elapsedSeconds']<320
assert v['schema']=='1370-post-r6-m0-preservation-diagnostic-result/v1' and v['status']=='PASS_READONLY_POST_R6_M0_PRESERVATION_DIAGNOSTIC_KNOWN_ROOT_DRIFT'
assert v['sourceAfter']==v['freshSourceProof'] and v['dependencyAfter']==v['freshDependencyProof'] and v['elapsedSeconds']<300 and v['typesCommandsExecuted']==v['collectionCommandsExecuted']==0 and v['game'] is False
assert v['historicalRootUnchanged'] is False and v['newRootBaselineAdopted'] is False and v['typesAccepted'] is False and v['originalR6StopPreserved'] is True and v['knownRootDrift']==cfg['knownRootDrift']
s=v['freshSourceProof'];d=v['freshDependencyProof'];assert s['mirrorFiles']==1740 and s['mirrorBytes']==119393120 and s['traversedEntries']==1853 and d['entries']==12484 and d['contentBytes']==348223802
assert s['fileProofDigestSha256']=='fbbfed3ec13da5618a0194204e2f6c8a87eebb5ee22102707d466340fbe6e1e0' and s['historicalRootSubstitutedMetadataSha256']=='5ce9160187b95711687ccdb7c0534cdc5a470c7a764265b68b64fbd72983ae6c' and s['nonrootMetadataSha256']=='0c9cfd7e1647b08f6ffb7835500044efeecfb2c13e58d4d8e8998e4837e75417'
assert s['mirrorRootIdentity']==cfg['knownRootDrift']['recordedAfterIdentity']
f=read(P/'FILL-RESULT.json');assert f['preparationDeadlineSeconds']==60 and 0<=f['preparationElapsedSeconds']<60 and f['runtimeClockStartsInsideUnchangedLAUNCH'] is True and f['combinedPreparationRuntimeDeadline'] is None
for k in ('context','grant','ownedIdentity'):assert role(f[k]['path'])==f[k]
assert f['context']['sha256']==r['contextSha256'] and f['grant']['sha256']==v['actualGrantSha256']
meta=Path(str(L)+'.meta').read_text().splitlines();assert sum(x.startswith('start; ') for x in meta)==1 and sum(x.startswith('end, exit 0; ') for x in meta)==1 and not any('STOP' in x for x in meta)
lines=[json.loads(x) for x in L.read_bytes().splitlines()];assert len(lines)==4 and lines[0]['status']=='PARENT_CONTEXT_GRANT_WRITTEN_BEFORE_EXEC' and lines[1]['helperPid']==r['helperPid'] and lines[2]['status']==v['status'] and lines[2]['sha256']==role(O/'RESULT.json')['sha256'] and lines[3]['recorderStatus']==r['status'] and lines[3]['childExit']==0 and lines[3]['groupClear'] is True
g=read(P/'ROOT-LANE-GRANT.json');assert g['ownedOuterHelperPid']==g['ownedOuterHelperPgid']==g['ownedOuterHelperSid']==32502 and r['helperPid']==r['helperPgid']==r['helperSid']
ids=sorted([g['ownedOuterHelperPid'],r['helperPid'],r['childPid']]);assert len(set(ids))==3 and all(type(n) is int and n>1 for n in ids);checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('Recorded owner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
out={'schema':'1370-an-m0-preservation-diagnostic-actual-readback/v1','status':'ACTUAL_M0_PRESERVATION_DIAGNOSTIC_COMPLETE_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW','mode':'proof','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':64460,'toolExit':0,'helperExit':0,'recorderExit':0,'runnerExit':0,'rootLaneGrant':role(P/'ROOT-LANE-GRANT.json'),'fill':role(P/'FILL-RESULT.json'),'context':f['context'],'grant':f['grant'],'recorderResult':role(profile['recorderResult']),'sourceDependencyResult':role(O/'RESULT.json'),'laneLog':role(L),'laneMetadata':role(Path(str(L)+'.meta')),'preparationElapsedSeconds':f['preparationElapsedSeconds'],'recorderElapsedSeconds':r['elapsedSeconds'],'runnerElapsedSeconds':v['elapsedSeconds'],'sourceProofsEqual':True,'dependencyProofsEqual':True,'freshSourceProof':s,'freshDependencyProof':d,'knownRootDrift':cfg['knownRootDrift'],'mirrorFiles':1740,'mirrorBytes':119393120,'mirrorEntriesExcludingRoot':1853,'dependencyEntriesExcludingRoot':12484,'dependencyContentBytes':348223802,'recordedOwnedIds':ids,'scopedOwnershipChecks':checks,'laneReleased':True,'executionAuthorization':False,'proofOrTypesAccepted':False,'game':False,'historicalRootUnchanged':False,'newRootBaselineAdopted':False,'originalR6StopPreserved':True}
print(json.dumps({'readback':put(P/'READBACK.json',out),'runnerSeconds':v['elapsedSeconds'],'recorderSeconds':r['elapsedSeconds'],'ownedIds':ids,'freshSourceProof':s}))
