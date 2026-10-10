import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-c0-renewal208-pure16-pricing-parent-recorded-after-al-20261009-r1';O=S/'1370-c0-renewal208-pure16-pricing-verification-output-after-al-20261009-r1';L=S/'1370-c0-renewal208-pure16-pricing-lane-after-al-20261009-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['toolSessionId']==94067 and a['finalExit']==0
r=json.loads((O/'RESULT.json').read_bytes());assert r['status']=='PURE_RENEWAL208_PURE16_PRICING_VERIFICATION_COMPLETE_UNADOPTED' and r['actualChildExit']==0 and r['groupClear'] and not r['timedOut'];assert r['boundsSeconds']=={'node':60,'active':75,'whole':90};assert not (O/'OVERRIDE-STOP.json').exists()
for name in ('stdout','stderr'):
 rr=role(O/(name+'.bin'));assert rr['bytes']==r[name+'Bytes'] and rr['sha256']==r[name+'Sha256']
assert r['stderrBytes']==0 and r['stdoutBytes']<65536
raw=(O/'stdout.bin').read_bytes();assert len(raw.splitlines())==1;v=json.loads(raw);assert v['status']=='PURE_RENEWAL208_PRICING_PAIRS_AGREE' and v['selectedRows']==16 and v['immutablePairs']==44 and v['mismatches']==0 and v['originalOfferLocalCapture'] is False and v['renewalCauseAdmission'] is False
meta=(L/'pricing.lane.log.meta').read_text();assert 'end, exit 0;' in meta and 'STOP' not in meta
log=(L/'pricing.lane.log').read_text();lines=log.splitlines();assert len(lines)==3 and "SyntaxWarning: 'return' in a 'finally' block" in lines[0] and lines[1]=='  return code' and json.loads(lines[2])['actualChildExit']==0
g=json.loads((P/'GRANT.json').read_bytes());assert g['ownPid']==g['ownPgid']==g['ownSid']==46727 and r['childPid']==r['ownedPgid']==46986
checks=[]
for n in (46727,46986):
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('STOP owned identity still present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-actual-pure16-pricing-readback/v1','status':'ACTUAL_PURE16_PAIRS_AGREE_PENDING_INDEPENDENT_REVIEW','actualTool':role(P/'ACTUAL-TOOL.json'),'grant':role(P/'GRANT.json'),'result':role(O/'RESULT.json'),'stdout':role(O/'stdout.bin'),'stderr':role(O/'stderr.bin'),'helperLog':role(L/'pricing.lane.log'),'helperMetadata':role(L/'pricing.lane.log.meta'),'toolSessionId':94067,'toolExit':0,'helperExit':0,'recorderExit':0,'nodeExit':0,'elapsedSeconds':r['elapsedSeconds'],'selectedRows':16,'immutablePairs':44,'mismatches':0,'ownershipChecks':checks,'laneReleased':True,'warning':'Qualified recorder main outer-finally emits SyntaxWarning at239 in helper combined log; producer stderr remains0. Original warning retained.','renewalCauseAdmission':False,'originalOfferLocalCapture':False,'game':False,'executionAuthorization':False}
p=P/'READBACK.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n')
p.chmod(0o444);print(json.dumps(role(p)));print(json.dumps({'reportKeys':list(v),'elapsedSeconds':r['elapsedSeconds'],'selectedRows':16,'immutablePairs':44,'mismatches':0}))
