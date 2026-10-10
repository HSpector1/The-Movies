import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-an-m0-fullbody-r3-ordering-controls-parent-recorded-20261009-r1';Q=S/'1370-an-m0-fullbody-r3-ordering-controls-parent-source-20261009-r2'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
recipe=read(Q/'RECIPE.json');O=Path(recipe['outputs']['worker']);R=Path(recipe['outputs']['recorder']);L=Path(recipe['laneLog'])
a=read(P/'ACTUAL-TOOL.json');assert a['finalExit']==0 and a['allToolChunks'][-1]['exit_code']==0
g=read(P/'GRANT.json');claim=read(P/'LAUNCH-CLAIM.json');assert role(P/'GRANT.json')==claim['grant'] and 0<=claim['preparationElapsedSeconds']<60 and claim['combinedPreparationRuntimeDeadline'] is None
r=read(R/'RESULT.json');v=read(O/'RESULT.json');config=read(g['config']['path'])
assert r['status']=='R3_ORDERING_CONSUMER_CONTROLS_COMPLETE_UNADOPTED' and r['actualChildExit']==0 and r['groupClear'] is True and r['timedOut'] is False and r['boundsSeconds']=={'node':300,'active':320,'whole':330} and r['elapsedSeconds']<330
assert v['status']=='PURE_ORDERING_CONSUMER_18_CASES_COMPLETED_PENDING_OBSERVED_REVIEW' and v['positiveCount']==2 and v['specificNegativeCount']==16 and v['grantSha256']==role(P/'GRANT.json')['sha256']
assert v['sourceReview']==g['sourceReview'] and v['acceptedSourcePins']==g['acceptedSourcePins'] and v['heldRootAdoption']==g['heldRootAdoption']
assert v['candidateChanged'] is False and v['syntheticOnly'] is True and all(v[k] is False for k in ('fixtureQualification','meaningfulCatchMutantRed','game','originalM0ReadOrWritten','executionAuthorization'))
assert [{'id':x['id'],'expected':x['expected'],'assertion':x['intendedAssertion']} for x in v['results']]==config['cases']
for x in v['results']:
 assert x['verdict']==('ACCEPT_POSITIVE_CONSUMER_INPUT' if x['expected']=='GREEN' else 'ACCEPT_EXPECTED_CONSUMER_ASSERTION') and x['negativePredicate']==(None if x['expected']=='GREEN' else 'AssertionError && message.includes(intendedAssertion)')
for p in v['generatedModules'].values():assert role(p['path'])==p
for stream in ('stdout','stderr'):
 sr=role(R/(stream+'.bin'));assert sr['bytes']==r[stream+'Bytes']<=8388608 and sr['sha256']==r[stream+'Sha256']
assert (R/'stderr.bin').read_bytes()==b'' and not os.path.lexists(R/'OVERRIDE-STOP.json')
workerFrame=json.loads((R/'stdout.bin').read_bytes());assert workerFrame['result']==role(O/'RESULT.json') and workerFrame['status']==v['status']
meta=Path(str(L)+'.meta').read_text();assert 'end, exit 0;' in meta and 'STOP' not in meta
frames=[];other=[]
for line in L.read_text().splitlines():
 try:frames.append(json.loads(line))
 except json.JSONDecodeError:other.append(line)
assert len(frames)==1 and frames[0]['status']==r['status'] and frames[0]['actualChildExit']==0 and frames[0]['groupClear'] is True
assert all('SyntaxWarning' in line or 'return' in line or not line.strip() for line in other)
assert claim['helperPid']==claim['helperPgid']==claim['helperSid'] and r['childPid']==r['ownedPgid']
ids=sorted([claim['helperPid'],r['ownedPgid']]);assert len(set(ids))==2;checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('Owned control identity remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
out={'schema':'1370-root-r3-ordering-controls-actual-readback/v1','status':'ACTUAL_PURE_ORDERING_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':a['sessionId'],'toolExit':0,'rootGrant':role(P/'GRANT.json'),'launchClaim':role(P/'LAUNCH-CLAIM.json'),'workerResult':role(O/'RESULT.json'),'recorderResult':role(R/'RESULT.json'),'stdout':role(R/'stdout.bin'),'stderr':role(R/'stderr.bin'),'laneLog':role(L),'laneMetadata':role(Path(str(L)+'.meta')),'preparationElapsedSeconds':claim['preparationElapsedSeconds'],'recorderElapsedSeconds':r['elapsedSeconds'],'positiveCount':2,'specificNegativeCount':16,'recordedOwnedIds':ids,'scopedOwnershipChecks':checks,'laneReleased':True,'syntheticOnly':True,'fixtureQualification':False,'meaningfulCatchMutantRed':False,'typesAccepted':False,'game':False,'executionAuthorization':False,'originalM0ReadOrWritten':False,'helperWarningsSeparateFromEmptyProducerStderr':True}
print(json.dumps(put(P/'READBACK.json',out)))
