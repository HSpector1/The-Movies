import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-an-root-continuation-20261009-r1';P=S/'1370-an-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r3';O=S/'1370-an-m0-fullfunction-current-prelaunch-output-20261010-r3'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==7
assert all(x.isdecimal() and int(x)>1 for x in sys.argv[1:3]);actual_session,actual_scanner=map(int,sys.argv[1:3])
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['toolSessionId']==actual_session and a['finalExit']==a['chunks'][-1]['exit_code']==0
g=json.loads((P/'GRANT.json').read_bytes());assert g['mode']=='fullfunction-current-protection' and g['ownedPid']==g['ownedPgid']==g['ownedSid']==actual_scanner
authority=json.loads(Path(g['typesObservedAdoption']['path']).read_bytes());assert role(g['typesObservedAdoption']['path'])==g['typesObservedAdoption'] and authority['status']=='ROOT_ADOPTED_M0_EXTERNAL_CONFIG_TYPES_AND_COLLECTION_WITH_FULL_POSTFLIGHT' and authority['typesAccepted'] is True and authority['collectionAccepted'] is True and authority['game'] is False
latestrole=role(sys.argv[3]);assert latestrole['sha256']==sys.argv[4];latest=json.loads(Path(latestrole['path']).read_bytes())
stoprole=role(sys.argv[5]);assert stoprole['sha256']==sys.argv[6];stop=json.loads(Path(stoprole['path']).read_bytes())
assert g['latestSharedFullPostflightReadback']==latestrole and g['reviewedPriorStopAdoption']==stoprole and stop['currentTypesAdoption']==g['typesObservedAdoption']
assert stop['schema']=='1370-root-fullfunction-protected-stop-observed-adoption/v1' and stop['status']=='ROOT_ADOPTED_FULLFUNCTION_GENERATED_TYPESCRIPT_PARSE_STOP_WITH_FULL_SHARED_POSTFLIGHT' and stop['fullPostflightReadback']==latestrole and stop['fullPostflightSnapshot']==latest['fullPostflightSnapshot'] and stop['readback']==latest['actualRouteReadback']
assert stop['originalAttemptRemainsStop'] is True and stop['fullSharedPostflightAccepted'] is True and stop['soleLaneReleased'] is True and stop['executionAuthorization'] is False and stop['game'] is False
for key in ('independentObservedReview','readback','fullPostflightReadback','fullPostflightSnapshot','currentTypesAdoption'):assert role(stop[key]['path'])==stop[key]
assert latest['toolExit']==0 and latest['fullImmutableEqual'] is True and latest['laneReleased'] is True and latest['priorStopPreserved'] is True
assert g['typesFullPostflightSnapshot']==authority['fullPostflightSnapshot'] and g['latestSharedFullPostflightSnapshot']==latest['fullPostflightSnapshot'] and g['originalAttemptRemainsStop'] is True
config=json.loads(Path(g['config']['path']).read_bytes());assert role(g['config']['path'])==g['config'] and config['protectedSnapshot']==latest['fullPostflightSnapshot'] and config['ownedPgids']==g['ownedPgidsPassedToOriginalCurrent']==latest['actualOwnedGroupIds'] and config['outputPath']==str(O)
summary=json.loads((P/'prelaunch.stdout').read_bytes());assert summary['status']=='ORIGINAL_CURRENT_ROOT_PREFLIGHT_COMPLETED_UNREVIEWED' and role(O/'PREFLIGHT.json')['sha256']==summary['sha256'] and (P/'prelaunch.stderr').stat().st_size==0
v=json.loads((O/'PREFLIGHT.json').read_bytes());assert v['configSha256']==g['config']['sha256'] and v['protectedSnapshot']==config['protectedSnapshot'] and v['protectedSnapshot']==latest['fullPostflightSnapshot'];assert v['status']==summary['status'] and v['protectedFullMapReusedUnderContinuousFreeze'] is True and v['freshFullInventoryRun'] is False and v['rootsBefore']==v['rootsAfter'] and len(v['rootsBefore'])==9
snap=json.loads(Path(v['protectedSnapshot']['path']).read_bytes());assert role(v['protectedSnapshot']['path'])==v['protectedSnapshot'] and v['rootsBefore']==snap['immutable']['strictRoots']
assert role(v['baseline']['path'])==v['baseline'] and v['baseline']['sha256']=='0136b4370cca27ab9af635c16124283049eb394b3dbaa63c32a755973e9c3596'
for when in ('currentBefore','currentAfter'):
 f=v[when];assert all(f[k] is True for k in ('oldNumericPidsAbsent','relevantWorkersAbsent','fdOriginalAndEphemeralAndRetainedHPassed','fdOriginalM0ParentPassed'));assert f['ownedGroupIdsChecked']==g['ownedPgidsPassedToOriginalCurrent']==latest['actualOwnedGroupIds'] and f['ownedGroupClearanceClaim'] is True and f['freeBytes']>=3758096384
for r in v['rawLocalOnly']:assert role(r['path'])=={k:r[k] for k in ('path','bytes','sha256')} and r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY'
assert len(v['rawLocalOnly'])==4
checks=[]
for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:fn(g['ownedPid'],0)
 except ProcessLookupError:checks.append({'kind':label,'id':g['ownedPid'],'result':'ESRCH'})
 else:raise RuntimeError('STOP own scanner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-original-current-root-preflight-observed-adoption/v1','status':'ROOT_ADOPTED_ORIGINAL_CURRENT_ROOT_PREFLIGHT','mode':'fullfunction-current-protection','actualTool':role(P/'ACTUAL-TOOL.json'),'actualToolSessionId':a['toolSessionId'],'toolExit':0,'grant':role(P/'GRANT.json'),'sourceReview':g['sourceReview'],'preflight':role(O/'PREFLIGHT.json'),'stdout':role(P/'prelaunch.stdout'),'stderr':role(P/'prelaunch.stderr'),'originalFullSnapshot':v['protectedSnapshot'],'baseline':v['baseline'],'nineRootsAndAncestryAndCurrentChecksAccepted':True,'fullMapReuseUnderOriginalContinuousFreezeProvision':True,'newFullInventory':False,'postOwnScannerChecks':checks,'scannerAbsent':True,'rawLocalOnlyClassification':role(O/'RAW-LOCAL-ONLY-ROLES.json'),'rawLocalOnlyRoles':4,'rawLocalOnlyBytes':sum(x['bytes'] for x in v['rawLocalOnly']),'scope':v['scope'],'protectedFreezeContinues':True,'proofOrTypesAccepted':False,'game':False,'executionAuthorization':False,'postR6RootAdoption':g['postR6RootAdoption'],'currentProtection':g['currentProtection'],'typesObservedAdoption':g['typesObservedAdoption'],'fullPostflightSnapshot':authority['fullPostflightSnapshot'],'latestSharedFullPostflightSnapshot':v['protectedSnapshot'],'latestSharedFullPostflightReadback':latestrole,'reviewedPriorStopAdoption':stoprole,'originalAttemptRemainsStop':True}
print(json.dumps(put(A/'M0-FULLFUNCTION-R3-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json',d)))
