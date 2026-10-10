import json,hashlib,os,datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-c0-b109-ascii-paired308-benchmark-parent-recorded-after-al-20261009-r1';D=S/'1370-c0-b109-ascii-paired308-benchmark-output-after-al-20261009-r1';L=S/'1370-c0-b109-ascii-paired308-benchmark-lane-after-al-20261009-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
tool=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert type(tool['finalExit']) is int and tool['finalExit']==0
r=json.loads((D/'RESULT.json').read_bytes());claim=json.loads((P/'LAUNCH-CLAIM.json').read_bytes());assert r['actualChildExit']==0 and r['groupClear'] is True and r['timedOut'] is False
checks=[]
for kind,fn,ids in [('pid',os.kill,[claim['helperPid'],r['childPid']]),('pgid',os.killpg,[claim['helperPgid'],r['ownedPgid']])]:
 for n in ids:
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':kind,'id':n,'signal':0,'result':'ESRCH'})
  else:raise RuntimeError('owned identity remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
meta=(L/'benchmark.lane.log.meta').read_text();assert meta.count('end, exit 0;')==1 and meta.count('start;')==1
out={'schema':'1370-root-b109-ascii-paired308-benchmark-tool-outcome/v1','status':'ACTUAL_PAIRED308_BENCHMARK_COMPLETE_AWAIT_INDEPENDENT_REVIEW','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualTool':role(P/'ACTUAL-TOOL.json'),'actualToolSessionId':tool['toolSessionId'],'actualToolExit':0,'helperExit':0,'helperMetaExit':0,'recorderExit':0,'nodeExit':0,'grant':role(P/'GRANT.json'),'launchClaim':role(P/'LAUNCH-CLAIM.json'),'result':role(D/'RESULT.json'),'laneLog':role(L/'benchmark.lane.log'),'laneMeta':role(L/'benchmark.lane.log.meta'),'helperPid':claim['helperPid'],'helperPgid':claim['helperPgid'],'helperSid':claim['helperSid'],'actualOwnedPidsFreshlyAbsent':[claim['helperPid'],r['childPid']],'actualOwnedGroupsFreshlyAbsent':[claim['helperPgid'],r['ownedPgid']],'recordedPostChecks':checks,'heavyLaneLockAbsent':True,'diagnosticMeaning':'Producer stderr must be empty. Inherited Python main outer-finally SyntaxWarning may remain in helper combinedlog under actual focused qualification; no suppression or all-streams-quiet claim.','performanceAccepted':False,'game':False}
p=P/'TOOL-OUTCOME.json'
with p.open('x') as f:json.dump(out,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)));print(json.dumps({'result':r,'producer':json.loads((D/'stdout.bin').read_bytes())},sort_keys=True))
