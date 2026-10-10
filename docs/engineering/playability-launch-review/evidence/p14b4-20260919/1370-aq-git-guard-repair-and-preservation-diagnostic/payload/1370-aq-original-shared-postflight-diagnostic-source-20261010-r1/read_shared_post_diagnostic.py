import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-aq-original-shared-postflight-diagnostic-parent-recorded-20261010-r1'
def role(p,cap=16777216):
 p=Path(p);assert p.is_absolute() and p.resolve(strict=True)==p and p.is_file() and p.lstat().st_nlink==1 and p.stat().st_size<=cap
 b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def load(r,cap=131072):
 assert role(r['path'],cap)==r;return json.loads(Path(r['path']).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
actualRole=role(P/'ACTUAL-TOOL.json');actual=load(actualRole);assert type(actual['sessionId']) is int and actual['sessionId']==int(sys.argv[1]) and type(actual['finalExit']) is int and actual['allToolChunks'][-1]['exit_code']==actual['finalExit']
gr=role(P/'GRANT.json');assert gr['sha256']==sys.argv[2];g=load(gr);assert g['schema']=='1370-root-original-shared-postflight-diagnostic-grant/v1'
for k in ('guardSource','guardConfig','baseline','priorFailureReadback','priorFailureAdoption','sourcePins','sourceReview'):assert role(g[k]['path'])==g[k]
ids=sorted(set(g['actualPriorOwnedGroupIds']+[g['ownedPgid']]));pids=sorted(set(g['actualPriorOwnedPids']+[g['ownedPid']]));checks=[]
for ns,fn,kind in ((pids,os.kill,'pid'),(ids,os.killpg,'pgid')):
 for n in ns:
  try:fn(n,0)
  except ProcessLookupError:checks.append(dict(kind=kind,id=n,result='ESRCH'))
  else:raise RuntimeError('OWNED_ID_PRESENT')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
sr=None;summary=None;mr=None
if (P/'ACTUAL-IMMUTABLE-LOCAL.json').exists():mr=role(P/'ACTUAL-IMMUTABLE-LOCAL.json',16777216)
if (P/'DIAGNOSTIC-SUMMARY-LOCAL.json').exists():
 sr=role(P/'DIAGNOSTIC-SUMMARY-LOCAL.json',32768);summary=load(sr,32768);assert summary['grant']==gr and summary['priorFailurePreserved'] is True and summary['protectionAccepted'] is False and summary['rawPsFdIncluded'] is False
 if summary['actualImmutable'] is not None:assert summary['actualImmutable']==mr and mr['path']==str(P/'ACTUAL-IMMUTABLE-LOCAL.json')
status='ACTUAL_ORIGINAL_SCANNER_DIAGNOSTIC_STOP_RETAINED' if actual['finalExit']!=0 else 'ACTUAL_LATER_ORIGINAL_SCANNER_RETURNED_PENDING_SEPARATE_REVIEW'
result={'schema':'1370-root-original-shared-postflight-diagnostic-readback/v1','status':status,'actualTool':actualRole,'toolExit':actual['finalExit'],'grant':gr,'priorFailureAdoption':g['priorFailureAdoption'],'priorFailureReadback':g['priorFailureReadback'],'guardSource':g['guardSource'],'baseline':g['baseline'],'diagnosticSummary':sr,'actualImmutableLocal':mr,'diagnosticAvailability':None if summary is None else summary['availability'],'stdout':role(P/'diagnostic.stdout'),'stderr':role(P/'diagnostic.stderr'),'actualOwnedPids':pids,'actualOwnedGroupIds':ids,'scopedOwnershipChecks':checks,'laneReleased':True,'priorFailurePreserved':True,'retrospective54871Acceptance':False,'fullProtectedPostflightAccepted':False,'executionAuthorization':False,'game':False,'metadataArchiveDisposition':'LOCAL_HASH_SIZE_ONLY'}
out=P/'READBACK.json'
with out.open('x') as f:json.dump(result,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444);print(json.dumps({'readback':role(out),'status':status}))
