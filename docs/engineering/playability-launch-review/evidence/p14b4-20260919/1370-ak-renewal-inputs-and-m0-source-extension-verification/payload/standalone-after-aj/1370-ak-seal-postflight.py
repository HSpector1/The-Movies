import datetime,hashlib,json,os,stat
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-m0-additive-postflight-grant-preparation-after-aj-20261009-r1'
Q=S/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();assert len(b)==s.st_size;return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
actual=json.loads((P/'POSTFLIGHT-ACTUAL-TOOL.json').read_text());assert actual['chunks'][-1]['exit_code']==0
grant=json.loads((P/'POSTFLIGHT-GRANT.json').read_text());pid=grant['parentPidBecomesSnapshotPid']
assert pid==76882 and not os.path.lexists(S/'HEAVY-LANE-LOCK')
for n in [pid,*grant['actualOwnedPidsAndPgids']]:
 for check in (os.kill,os.killpg):
  try:check(n,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('Known owned PID/PGID remains '+str(n))
out=P/'postflight.stdout';err=P/'postflight.stderr';assert err.stat().st_size==0
result=json.loads(out.read_text());assert result['status']=='GUARDS_ACCEPTED_READONLY'
snapshot=Path(result['snapshotPath']);assert snapshot.parent==Q/'evidence/postflight-after-aj-r2'
assert role(snapshot)['sha256']==result['snapshotSha256']
pins=snapshot.parent/'PINS.json';assert role(pins)['sha256']==result['pinsSha256']
base=Path(grant['baselineSnapshot']['path']);assert role(base)==grant['baselineSnapshot']
j=json.loads(snapshot.read_text());b=json.loads(base.read_text());assert j['immutable']==b['immutable']
raw=[role(snapshot.parent/n) for n in ['BEFORE-PS.txt','AFTER-PS.txt','BEFORE-LSOF.bin','AFTER-LSOF.bin']]
d={'status':'ACTUAL_TOOL_EXIT0_READONLY_POSTFLIGHT_EQUAL_REQUIRES_INDEPENDENT_ADMISSION','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualToolSession':84610,'actualToolExit':0,'actualTool':role(P/'POSTFLIGHT-ACTUAL-TOOL.json'),'grant':role(P/'POSTFLIGHT-GRANT.json'),'stdout':role(out),'stderr':role(err),'source':role(Q/'snapshot.py'),'config':role(Q/'CONFIG.json'),'snapshot':role(snapshot),'pins':role(pins),'beforeSnapshot':role(base),'result':result,'fullImmutableEqualsBefore':True,'ownedScannerPidAndPgidAbsent':pid,'selectedOtherOwnedPidsAndPgidsAbsent':grant['actualOwnedPidsAndPgids'],'rawProcessFilesLocalHashSizeOnly':raw,'globalProcessAbsenceClaim':False,'protectedFreezeContinuesPendingIndependentFinalAdoption':True,'additiveTypesOrGameExecutionAuthorized':False}
p=P/'POSTFLIGHT-TOOL-OUTCOME.json';fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(d,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'outcome':role(p),'result':result}),flush=True)
