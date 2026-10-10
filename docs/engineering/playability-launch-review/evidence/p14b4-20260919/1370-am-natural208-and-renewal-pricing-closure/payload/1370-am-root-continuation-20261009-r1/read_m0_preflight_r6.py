import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';assert len(sys.argv)==2;mode=sys.argv[1];assert mode=='types';P=S/('1370-c0-m0-'+mode+'-prelaunch-parent-after-al-20261009-r3');O=S/('1370-c0-m0-'+mode+'-prelaunch-output-after-al-20261009-r3')
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['finalExit']==0;g=json.loads((P/'GRANT.json').read_bytes());assert g['mode']==mode and g['ownedPid']==g['ownedPgid']==g['ownedSid']
summary=json.loads((P/'prelaunch.stdout').read_bytes());assert summary['status']=='ORIGINAL_CURRENT_ROOT_PREFLIGHT_COMPLETED_UNREVIEWED' and role(O/'PREFLIGHT.json')['sha256']==summary['sha256'] and (P/'prelaunch.stderr').stat().st_size==0
v=json.loads((O/'PREFLIGHT.json').read_bytes());assert v['status']==summary['status'] and v['protectedFullMapReusedUnderContinuousFreeze'] is True and v['freshFullInventoryRun'] is False and v['rootsBefore']==v['rootsAfter'] and len(v['rootsBefore'])==9
snap=json.loads(Path(v['protectedSnapshot']['path']).read_bytes());assert role(Path(v['protectedSnapshot']['path']))==v['protectedSnapshot'];assert v['rootsBefore']==snap['immutable']['strictRoots']
for when in ('currentBefore','currentAfter'):
 f=v[when];assert all(f[k] is True for k in ('oldNumericPidsAbsent','relevantWorkersAbsent','fdOriginalAndEphemeralAndRetainedHPassed','fdOriginalM0ParentPassed'));assert f['ownedGroupIdsChecked']==[] and f['ownedGroupClearanceClaim'] is False and f['freeBytes']>=3758096384
for r in v['rawLocalOnly']:assert role(Path(r['path']))=={k:r[k] for k in ('path','bytes','sha256')} and r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY'
checks=[]
for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:fn(g['ownedPid'],0)
 except ProcessLookupError:checks.append({'kind':label,'id':g['ownedPid'],'result':'ESRCH'})
 else:raise RuntimeError('STOP own scanner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-original-current-root-preflight-observed-adoption/v1','status':'ROOT_ADOPTED_ORIGINAL_CURRENT_ROOT_PREFLIGHT','mode':mode,'actualTool':role(P/'ACTUAL-TOOL.json'),'actualToolSessionId':a['toolSessionId'],'toolExit':0,'grant':role(P/'GRANT.json'),'sourceReview':g['sourceReview'],'preflight':role(O/'PREFLIGHT.json'),'stdout':role(P/'prelaunch.stdout'),'stderr':role(P/'prelaunch.stderr'),'originalFullSnapshot':v['protectedSnapshot'],'baseline':v['baseline'],'nineRootsAndAncestryAndCurrentChecksAccepted':True,'fullMapReuseUnderOriginalContinuousFreezeProvision':True,'newFullInventory':False,'postOwnScannerChecks':checks,'scannerAbsent':True,'rawLocalOnlyClassification':role(O/'RAW-LOCAL-ONLY-ROLES.json'),'rawLocalOnlyRoles':4,'rawLocalOnlyBytes':sum(x['bytes'] for x in v['rawLocalOnly']),'scope':v['scope'],'protectedFreezeContinues':True,'proofOrTypesAccepted':False,'game':False,'executionAuthorization':False}
p=A/('M0-'+mode.upper()+'-PREFLIGHT-OBSERVED-ADOPTION-R6.json')
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
