import hashlib,json,os,stat,sys
ACTUAL_CURRENT_AP_FULL_PREFLIGHT_ADOPTION={'path': '/Users/zacheryspector/studio-scratch/1370-aq-root-continuation-20261010-r1/CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json', 'bytes': 5252, 'sha256': '4bd6fe3766e73cd621f939b124d0da27e09fa4d097b64ae58041ee6955358cf1'}
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path('/Users/zacheryspector/studio-scratch/1370-aq-root-continuation-20261010-r1');P=Path('/Users/zacheryspector/studio-scratch/1370-aq-native-refusal-fullfunction-current-prelaunch-parent-recorded-20261010-r1');O=Path('/Users/zacheryspector/studio-scratch/1370-aq-native-refusal-fullfunction-current-prelaunch-output-20261010-r1')
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
assert all(x.isdecimal() and int(x)>1 for x in sys.argv[1:3]);actual_session,actual_scanner=map(int,sys.argv[1:3])
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['toolSessionId']==actual_session and a['finalExit']==a['chunks'][-1]['exit_code']==0
g=json.loads((P/'GRANT.json').read_bytes());assert g['schema']=='1370-ap-current-ap-root-prelaunch-grant/v2' and g['mode']=='fullfunction-current-ap-protection' and g['ownedPid']==g['ownedPgid']==g['ownedSid']==actual_scanner
for key in ('sourceReview','sourcePins','rootLauncher','config','currentFullGuardGrant','currentFullPreflightAdoption','currentFullPreflightSnapshot','nativeRefusalControlsObservedAdoption','nativeRefusalControlsReadback','historicalTypesObservedAdoption','historicalTypesFullPostflightSnapshot'):assert role(g[key]['path'])==g[key]
authority=json.loads(Path(g['currentFullPreflightAdoption']['path']).read_bytes());assert authority['status']=='ROOT_ADOPTED_CURRENT_AP_FULL_PREFLIGHT' and authority['snapshot']==g['currentFullPreflightSnapshot'] and authority['protectedFreezeContinues'] is True
assert g['currentFullPreflightAdoption']==ACTUAL_CURRENT_AP_FULL_PREFLIGHT_ADOPTION
controls=json.loads(Path(g['nativeRefusalControlsObservedAdoption']['path']).read_bytes())
assert controls['schema']=='1370-root-native-refusal-diagnostic-controls-observed-adoption/v1' and controls['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY' and controls['executionAuthorization'] is False
assert controls['actualExit']==0 and controls['soleLaneReleased'] is True and controls['caseCount']==86 and controls['positiveCount']==13 and controls['specificNegativeCount']==73
for flag in ('game','fullQualificationAccepted','fullBodyGameAssertionsExecuted','privateM0ReadOrWritten'):assert controls[flag] is False
for value in controls.values():
 if type(value) is dict and set(value)=={'path','bytes','sha256'}:assert role(value['path'])==value
rbrole=controls['readback'];rb=json.loads(Path(rbrole['path']).read_bytes())
assert rb['schema']=='1370-root-native-refusal-diagnostic-controls-actual-readback/v1' and rb['status']=='ACTUAL_PURE_86_NATIVE_REFUSAL_DIAGNOSTIC_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW'
assert rb['toolExit']==0 and rb['laneReleased'] is True and rb['caseCount']==86 and rb['positiveCount']==13 and rb['specificNegativeCount']==73
assert controls['actualOwnedIds']==rb['actualOwnedIds'] and type(rb['actualOwnedIds']) is list and rb['actualOwnedIds'] and all(type(n) is int and n>1 for n in rb['actualOwnedIds']) and rb['actualOwnedIds']==sorted(set(rb['actualOwnedIds']))
assert rb['scopedOwnershipChecks']==controls['scopedOwnershipChecks']==[{'id':n,'kind':kind,'result':'ESRCH'} for n in rb['actualOwnedIds'] for kind in ('pid','pgid')]
ind=json.loads(Path(controls['independentObservedReview']['path']).read_bytes());assert ind['schema']=='1370-native-refusal-diagnostic-controls-independent-observed-review/v1' and ind['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY' and ind['concreteFindings']==[] and ind['executionAuthorization'] is False
assert ind['readback']==controls['readback']
worker=json.loads(Path(controls['workerResult']['path']).read_bytes());matrix=json.loads(Path(controls['inputRoles']['MATRIX.json']['path']).read_bytes())
assert role(controls['inputRoles']['MATRIX.json']['path'])==controls['inputRoles']['MATRIX.json']
assert worker['schema']=='1370-native-observer-independent-controls-result/v1' and worker['status']=='PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED'
assert worker['caseCount']==86 and worker['positiveCount']==13 and worker['specificNegativeCount']==73 and worker['originalOrderingCases']==18 and worker['originalParserCasesReplayed']==0
assert worker['results']==[dict(c,verdict='ACCEPT_POSITIVE' if c['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL') for c in matrix['cases']]
assert g['nativeRefusalControlsReadback']==rbrole
types=json.loads(Path(g['historicalTypesObservedAdoption']['path']).read_bytes());assert types['status']=='ROOT_ADOPTED_M0_EXTERNAL_CONFIG_TYPES_AND_COLLECTION_WITH_FULL_POSTFLIGHT' and types['typesAccepted'] is True and types['collectionAccepted'] is True and types['fullPostflightSnapshot']==g['historicalTypesFullPostflightSnapshot'] and g['historicalTypesRemainHistorical'] is True
guardGrant=json.loads(Path(g['currentFullGuardGrant']['path']).read_bytes());assert authority['grant']==g['currentFullGuardGrant'] and type(guardGrant['ownedPgid']) is int and guardGrant['ownedPgid']>1
config=json.loads(Path(g['config']['path']).read_bytes());assert config['schema']=='1370-root-m0-current-ap-root-prelaunch-config/v2' and config['protectedSnapshot']==config['baseline']==authority['snapshot'] and config['currentFullPreflightAdoption']==g['currentFullPreflightAdoption'] and config['ownedPgids']==g['ownedPgidsPassedToOriginalCurrent']==sorted(set([guardGrant['ownedPgid']]+rb['actualOwnedIds'])) and config['outputPath']==str(O)
assert g['argv']==['/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14','-I','-B','/Users/zacheryspector/studio-scratch/1370-aq-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r1/current-ap-root-prelaunch.py',g['config']['path'],g['config']['sha256']]
summary=json.loads((P/'prelaunch.stdout').read_bytes());assert summary['status']=='CURRENT_AP_ROOT_PREFLIGHT_COMPLETED_UNREVIEWED' and summary['path']==str(O/'PREFLIGHT.json') and role(O/'PREFLIGHT.json')['sha256']==summary['sha256'] and (P/'prelaunch.stderr').stat().st_size==0
v=json.loads((O/'PREFLIGHT.json').read_bytes());assert v['schema']=='1370-root-m0-current-ap-root-prelaunch-observation/v2' and v['status']==summary['status'] and v['configSha256']==g['config']['sha256'] and v['configPath']==g['config']['path'] and v['protectedSnapshot']==v['baseline']==authority['snapshot'] and v['currentFullPreflightAdoption']==g['currentFullPreflightAdoption'] and v['baselinePhase']=='before-fill'
assert v['protectedFullMapReusedUnderContinuousFreeze'] is True and v['freshFullInventoryRun'] is False and v['rootsBefore']==v['rootsAfter'] and len(v['rootsBefore'])==9 and v['executionAuthorization'] is False and v['m0ProofOrTypesAccepted'] is False and v['game'] is False
snap=json.loads(Path(v['protectedSnapshot']['path']).read_bytes());assert role(v['protectedSnapshot']['path'])==v['protectedSnapshot'] and v['rootsBefore']==snap['immutable']['strictRoots'] and snap['phase']=='before-fill' and snap['baseline'] is None and snap['immutable']['operationalProductionHead']=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8'
for when in ('currentBefore','currentAfter'):
 f=v[when];assert all(f[k] is True for k in ('oldNumericPidsAbsent','relevantWorkersAbsent','fdOriginalAndEphemeralAndRetainedHPassed','fdOriginalM0ParentPassed'));assert f['ownedGroupIdsChecked']==config['ownedPgids'] and f['ownedGroupClearanceClaim'] is True and f['freeBytes']>=3758096384
for r in v['rawLocalOnly']:assert role(r['path'])=={k:r[k] for k in ('path','bytes','sha256')} and r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY'
assert len(v['rawLocalOnly'])==4 and json.loads((O/'RAW-LOCAL-ONLY-ROLES.json').read_bytes())=={'roles':v['rawLocalOnly']}
checks=[]
for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:fn(actual_scanner,0)
 except ProcessLookupError:checks.append({'kind':label,'id':actual_scanner,'result':'ESRCH'})
 else:raise RuntimeError('STOP own scanner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-ap-current-ap-root-prelaunch-readback/v2','status':'ACTUAL_CURRENT_AP_ROOT_PREFLIGHT_COMPLETED_PENDING_INDEPENDENT_REVIEW','actualTool':role(P/'ACTUAL-TOOL.json'),'actualToolSessionId':actual_session,'toolExit':0,'grant':role(P/'GRANT.json'),'sourceReview':g['sourceReview'],'sourcePins':g['sourcePins'],'config':g['config'],'preflight':role(O/'PREFLIGHT.json'),'stdout':role(P/'prelaunch.stdout'),'stderr':role(P/'prelaunch.stderr'),'currentFullPreflightAdoption':g['currentFullPreflightAdoption'],'currentFullGuardGrant':g['currentFullGuardGrant'],'originalFullSnapshot':v['protectedSnapshot'],'baseline':v['baseline'],'baselinePhase':'before-fill','nineRootsAndAncestryAndCurrentChecksAccepted':True,'fullMapReuseUnderContinuousFreezeScopeAmendment':True,'newFullInventory':False,'postOwnScannerChecks':checks,'scannerAbsent':True,'rawLocalOnlyClassification':role(O/'RAW-LOCAL-ONLY-ROLES.json'),'rawLocalOnlyRoles':4,'rawLocalOnlyBytes':sum(x['bytes'] for x in v['rawLocalOnly']),'scope':v['scope'],'protectedFreezeContinues':True,'proofOrTypesAccepted':False,'game':False,'executionAuthorization':False,'nativeRefusalControlsObservedAdoption':g['nativeRefusalControlsObservedAdoption'],'nativeRefusalControlsReadback':g['nativeRefusalControlsReadback'],'historicalTypesObservedAdoption':g['historicalTypesObservedAdoption'],'historicalTypesFullPostflightSnapshot':g['historicalTypesFullPostflightSnapshot'],'historicalTypesRemainHistorical':True,'actualOwnedGroupIds':config['ownedPgids']}
print(json.dumps(put(A/'M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json',d)))
