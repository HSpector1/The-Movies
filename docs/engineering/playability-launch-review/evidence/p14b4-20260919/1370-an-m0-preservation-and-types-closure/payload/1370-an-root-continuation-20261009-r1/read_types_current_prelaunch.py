import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;P=S/'1370-an-m0-types-current-prelaunch-parent-recorded-20261009-r1';O=S/'1370-an-m0-types-current-prelaunch-output-20261009-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['toolSessionId']==78183 and a['finalExit']==a['chunks'][-1]['exit_code']==0
g=json.loads((P/'GRANT.json').read_bytes());assert g['mode']=='types' and g['ownedPid']==g['ownedPgid']==g['ownedSid']==11041
summary=json.loads((P/'prelaunch.stdout').read_bytes());assert summary['status']=='ORIGINAL_CURRENT_ROOT_PREFLIGHT_COMPLETED_UNREVIEWED' and role(O/'PREFLIGHT.json')['sha256']==summary['sha256']=='1018583ed7dba2f784e4a9d08cba18c47a1e030bbeeb65809e7f9598e892185a' and (P/'prelaunch.stderr').stat().st_size==0
v=json.loads((O/'PREFLIGHT.json').read_bytes());assert v['status']==summary['status'] and v['protectedFullMapReusedUnderContinuousFreeze'] is True and v['freshFullInventoryRun'] is False and v['rootsBefore']==v['rootsAfter'] and len(v['rootsBefore'])==9
snap=json.loads(Path(v['protectedSnapshot']['path']).read_bytes());assert role(v['protectedSnapshot']['path'])==v['protectedSnapshot'] and v['rootsBefore']==snap['immutable']['strictRoots']
assert role(v['baseline']['path'])==v['baseline'] and v['baseline']['sha256']=='0136b4370cca27ab9af635c16124283049eb394b3dbaa63c32a755973e9c3596'
for when in ('currentBefore','currentAfter'):
 f=v[when];assert all(f[k] is True for k in ('oldNumericPidsAbsent','relevantWorkersAbsent','fdOriginalAndEphemeralAndRetainedHPassed','fdOriginalM0ParentPassed'));assert f['ownedGroupIdsChecked']==g['ownedPgidsPassedToOriginalCurrent']==[32502,32757,33019,37863] and f['ownedGroupClearanceClaim'] is True and f['freeBytes']>=3758096384
for r in v['rawLocalOnly']:assert role(r['path'])=={k:r[k] for k in ('path','bytes','sha256')} and r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY'
assert len(v['rawLocalOnly'])==4
checks=[]
for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:fn(g['ownedPid'],0)
 except ProcessLookupError:checks.append({'kind':label,'id':g['ownedPid'],'result':'ESRCH'})
 else:raise RuntimeError('STOP own scanner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-original-current-root-preflight-observed-adoption/v1','status':'ROOT_ADOPTED_ORIGINAL_CURRENT_ROOT_PREFLIGHT','mode':'types','actualTool':role(P/'ACTUAL-TOOL.json'),'actualToolSessionId':a['toolSessionId'],'toolExit':0,'grant':role(P/'GRANT.json'),'sourceReview':g['sourceReview'],'preflight':role(O/'PREFLIGHT.json'),'stdout':role(P/'prelaunch.stdout'),'stderr':role(P/'prelaunch.stderr'),'originalFullSnapshot':v['protectedSnapshot'],'baseline':v['baseline'],'nineRootsAndAncestryAndCurrentChecksAccepted':True,'fullMapReuseUnderOriginalContinuousFreezeProvision':True,'newFullInventory':False,'postOwnScannerChecks':checks,'scannerAbsent':True,'rawLocalOnlyClassification':role(O/'RAW-LOCAL-ONLY-ROLES.json'),'rawLocalOnlyRoles':4,'rawLocalOnlyBytes':sum(x['bytes'] for x in v['rawLocalOnly']),'scope':v['scope'],'protectedFreezeContinues':True,'proofOrTypesAccepted':False,'game':False,'executionAuthorization':False,'postR6RootAdoption':g['postR6RootAdoption'],'currentProtection':g['currentProtection']}
print(json.dumps(put(A/'M0-TYPES-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json',d)))
