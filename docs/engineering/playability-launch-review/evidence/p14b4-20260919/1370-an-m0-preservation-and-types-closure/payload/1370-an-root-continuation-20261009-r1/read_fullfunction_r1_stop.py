import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;P=S/'1370-an-m0-fullfunction-parent-recorded-20261010-r1';O=S/'1370-an-m0-fullfunction-qualification-recorder-results-20261009-r1';Q=S/'1370-an-m0-fullfunction-qualification-source-20261010-r7'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def fields(p):
 s=Path(p).lstat();return [s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
a=read(P/'ACTUAL-TOOL.json');assert a['sessionId']==95737 and a['finalExit']==a['allToolChunks'][-1]['exit_code']==2
outer=read(P/'ROOT-LAUNCH-CLAIM.json');inner=read(P/'RECORDER-LAUNCH-CLAIM.json');g=read(P/'EXECUTION-GRANT.json');r=read(O/'RESULT.json');c=read(Q/'CONFIG.json')
assert inner['grant']==role(P/'EXECUTION-GRANT.json') and g['rootLaunchClaim']==role(P/'ROOT-LAUNCH-CLAIM.json') and outer['rootBinding']==inner['rootBinding']==g['rootBinding']
for x in (g['rootBinding'],g['sourcePins'],g['sourceReview'],g['config'],g['typesAdoption'],g['currentProtection'],g['parserControlsAdoption']):assert role(x['path'])==x
assert r['status']=='STOP_CHILD_EXIT_1' and r['actualChildExit']==1 and r['groupClear'] is True and r['timedOut'] is False and r['childPid']==r['ownedPgid']==49313 and r['pgidConfirmed'] is True
assert not (O/'OVERRIDE-STOP.json').exists() and r['boundsSeconds']=={'aggregateChild':300,'active':320,'whole':330}
for name in ('stdout','stderr'):
 x=role(O/(name+'.bin'));assert x['bytes']==r[name+'Bytes'] and x['sha256']==r[name+'Sha256']
assert r['stdoutBytes']==0 and r['stderrBytes']==381 and r['stderrSha256']=='f3125983077da1bdf243cf67604e21d808247b9b341e36e94d7473c9517d90a3'
err=(O/'stderr.bin').read_text();assert "STOP_FULLFUNCTION RuntimeError('exact recorded post-R6 root metadata')" in err and "SyntaxWarning: 'return' in a 'finally' block" in err
lane=Path(c['laneLog']);meta=Path(str(lane)+'.meta');assert 'end, exit 2;' in meta.read_text()
frames=[json.loads(x) for x in lane.read_text().splitlines() if x.startswith('{')];assert len(frames)==2 and frames[-1]['status']==r['status'] and frames[-1]['actualChildExit']==1 and frames[-1]['groupClear'] is True
assert not os.path.lexists(c['outputPath'])
groups=sorted([outer['ownedHelper']['pid'],inner['ownedRecorder']['pid'],r['ownedPgid']]);assert groups==[49057,49312,49313]
for own in (outer['ownedHelper'],inner['ownedRecorder']):assert own['pid']==own['pgid']==own['sid']
checks=[]
for n in groups:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('Recorded actual owned identity still present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
pc=read(c['proofConfig']['path']);leaf=Path(pc['mirrorPath']);container=leaf.parent
assert role(c['proofConfig']['path'])==c['proofConfig'] and role(c['proofMethods']['path'])==c['proofMethods']
expected=pc['knownRootDrift']['recordedAfterIdentity'];observedleaf=fields(leaf);observedparent=fields(container)
assert observedleaf==expected and observedparent!=expected
source=(Q/'run-fullfunction.py').read_text();original=Path(c['proofMethods']['path']).read_text()
assert "ns['full_source_check'](ns['MIRROR_ROOT'],manifest5,run,True)" in source and "MIRROR_ROOT=pathlib.Path('"+str(container)+"')" in original
assert original.count("'exact recorded post-R6 root metadata'")==1
out={'schema':'1370-root-fullfunction-actual-stop-readback/v1','status':'ACTUAL_STOP_WRONG_CONTAINER_ARGUMENT_AT_FIRST_LEAF_METADATA_GATE','completed':True,'laneReleased':True,'toolExit':2,'helperExit':2,'recorderExit':2,'runnerExit':1,'runnerStatus':'EXITED_NONZERO','toolSessionId':95737,'actualTool':role(P/'ACTUAL-TOOL.json'),'rootLaunchClaim':role(P/'ROOT-LAUNCH-CLAIM.json'),'recorderLaunchClaim':role(P/'RECORDER-LAUNCH-CLAIM.json'),'grant':role(P/'EXECUTION-GRANT.json'),'recorderResult':role(O/'RESULT.json'),'stdout':role(O/'stdout.bin'),'stderr':role(O/'stderr.bin'),'laneLog':role(lane),'laneMetadata':role(meta),'preflightObservedAdoption':role(A/'M0-FULLFUNCTION-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json'),'sourcePins':g['sourcePins'],'sourceReview':g['sourceReview'],'currentProtection':g['currentProtection'],'typesAdoption':g['typesAdoption'],'parserControlsAdoption':g['parserControlsAdoption'],'recordedOwnedPids':groups,'recordedOwnedGroupIds':groups,'scopedOwnershipChecks':checks,'nodePid':None,'runtimeOutputAbsent':True,'fullM0SourceProofCompleted':False,'sourceAfter':None,'dependencyAfter':None,'actualGameplayPrefixExecuted':False,'gameNotStartedEvidence':'Exact unique first full_source_check leaf-root metadata gate, before output directory creation and Node spawn in pinned controller; output directory absent. Not inferred from absent success alone.','recorderSeconds':r['elapsedSeconds'],'timedOut':False,'diagnosticRootMetadataOnly':{'containerPath':str(container),'containerIdentity':observedparent,'authenticConfiguredLeaf':str(leaf),'leafIdentity':observedleaf,'expectedLeafIdentity':expected,'leafIdentityMatches':True,'containerIdentityDoesNotMatchLeaf':True,'completeSourceOrDependencyProof':False},'diagnosis':'Caller passes the configured mirror container rather than authenticated leaf. Original guard correctly refuses its wrong identity before enumeration. Independently review attribution; do not repin metadata.','controllerFinallyWarningPreserved':True,'fullProtectedPostflightAccepted':False,'fixtureQualificationAccepted':False,'neutralityAccepted':False,'executionAuthorization':False}
p=P/'READBACK.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'readback':role(p),'recordedOwnedPids':groups,'recordedOwnedGroupIds':groups,'leafMetadataMatches':True}))
