"""Finite retained-evidence review; no signals, inventory, imports or raw-content inspection."""
from pathlib import Path
import hashlib,json,os
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-ap-current-ao-fullpreflight-parent-recorded-20261010-r1'
D=Path(__file__).resolve().parent
def role(path):
 p=Path(path);h=hashlib.sha256();n=0
 with p.open('rb') as f:
  while chunk:=f.read(1048576):h.update(chunk);n+=len(chunk)
 return {'path':str(p),'bytes':n,'sha256':h.hexdigest()}
def load(path):return json.loads(Path(path).read_bytes())
def verify(r):
 actual=role(r['path']);assert actual['sha256']==r['sha256']
 if 'bytes'in r:assert actual['bytes']==r['bytes']
 return actual
readback=load(P/'READBACK.json');readback_role=role(P/'READBACK.json')
assert readback_role['sha256']=='d3b186df25cc897038ac510d893d3c853e40586a8896b8dc7115d81d927b3db2'
for r in readback.values():
 if isinstance(r,dict) and {'path','sha256'}<=r.keys():verify(r)
actual=load(readback['actualTool']['path']);reader_actual=load(P/'READER-ACTUAL-TOOL.json')
assert actual['sessionId']==3186 and type(actual['finalExit'])is int and actual['finalExit']==0
assert actual['allToolChunks'][-1]['exit_code']==0
assert reader_actual['finalExit']==0 and reader_actual['sessionId'] is None and reader_actual['allToolChunks'][-1]['exit_code']==0
assert json.loads(reader_actual['allToolChunks'][-1]['output'])['readback']==readback_role
source_review=load(readback['sourceReview']['path']);verify(source_review['adapterSourcePins'])
verify(source_review['launcherSourceReviewed']);verify(source_review['readerSourceReviewed']);verify(source_review['operationalScope'])
assert source_review['decision']=='ACCEPT_CURRENT_AO_FULLGUARD_BINDINGS_SOURCE_ONLY' and source_review['concreteFindings']==[]
pins=load(readback['sourcePins']['path'])
for r in pins['files'].values():verify(r)
adapterpins=load(source_review['adapterSourcePins']['path'])
for r in adapterpins['files'].values():verify(r)
config=load(readback['config']['path']);grant=load(readback['grant']['path'])
scope=load(config['parentScopeAdoption']['path']);verify(config['parentScopeAdoption']);verify(scope['publishedReadback']);verify(scope['operationalTransition']['docsTransitionFactsRole'])
assert scope['operationalTransition']['docsOnlyVerified'] is True
assert scope['status']=='PARENT_ADOPTED_A208_OPERATIONAL_GUARD_SCOPE_ONLY'
assert scope['combinedHFirstRouteUnchanged'] is True and scope['H8708Waived'] is False and scope['executionAuthorization'] is False
head='f2f97c622db7f5332164b790d1646355e89c00f4';src='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert config['productionHead']==scope['productionGuardHead']==head
assert config['productionSourceTree']==scope['productionSourceTree']==src
assert config['operationalRemoteRefs']==scope['remoteRefsVerified']
assert grant['sourcePins']==readback['sourcePins'] and grant['sourceReview']==readback['sourceReview']
assert grant['sourceAdoption']==readback['sourceAdoption']
assert grant['ownedPid']==grant['ownedPgid']==grant['ownedSid']==18361
assert grant['argv']==[config['requiredPythonPath'],'-I','-B',readback['guardSource']['path'],config['observedCopyReceipt']['path'],config['observedCopyReceipt']['sha256'],config['observedDecision'],config['retainedHParent']+'/20261008-h-types-r1','before-fill','before-fill-current-ao-r1']
assert grant['perCommandTimeoutSeconds']==180 and grant['wholeScanDeadline'] is None and grant['game'] is False
stdout=Path(readback['scanStdout']['path']).read_bytes();assert stdout.endswith(b'\n') and len(stdout.splitlines())==1
summary=json.loads(stdout);assert summary['status']=='GUARDS_ACCEPTED_READONLY'
assert summary['snapshotPath']==readback['snapshot']['path'] and summary['snapshotSha256']==readback['snapshot']['sha256'] and summary['pinsSha256']==readback['snapshotPins']['sha256']
assert Path(readback['scanStderr']['path']).read_bytes()==b''
x=load(readback['snapshot']['path']);i=x['immutable']
assert x['status']=='GUARDS_ACCEPTED_READONLY' and x['phase']=='before-fill' and x['baseline'] is None
assert x['configSha256']==readback['config']['sha256'] and x['snapshotProcedureSha256']==readback['guardSource']['sha256']
assert x['admission']==dict(config['observedCopyReceipt'],decision=config['observedDecision'])
assert i['operationalProductionHead']==head and i['operationalSourceTree']==src
assert i['parentScopeAdoption']==config['parentScopeAdoption']
strict_before={k:v for k,v in x['rootsBefore'].items() if k!='scratchParent'}
strict_after={k:v for k,v in x['rootsAfter'].items() if k!='scratchParent'}
assert len(strict_before)==9 and strict_before==strict_after==i['strictRoots']
for key in ['path','device','inode','mode']:assert x['rootsBefore']['scratchParent'][key]==x['rootsAfter']['scratchParent'][key]==i['scratchParentIdentity'][key]
assert len(i['physicalCheckout'])==176 and len(i['productionDependencies'])==len(i['copiedDependencies'])==12485
verify(config['privateBaseline']);old=load(config['privateBaseline']['path'])['immutable']
unchanged=['physicalCheckout','productionDependencies','copiedDependencies','allocatedBytes','bindingSha256','actualCopyPayloadSha256','actualCopyResultSha256','actualCopySupervisorSha256']
for key in unchanged:assert i[key]==old[key],key
assert i['protectedDigests']['copied']==old['protectedDigests']['copied']
for key in ['currentBefore','currentAfter']:
 f=x[key]
 for flag in ['oldNumericPidsAbsent','relevantWorkersAbsent','fdOriginalAndEphemeralAndRetainedHPassed','fdOriginalM0ParentPassed']:assert f[flag] is True
 assert f['freeBytes']>=config['requiredFreeBytes']==3758096384 and 'AC Power' in f['power']
 assert f['bootSessionUuid']==config['bootSessionUuid'] and f['ownedGroupIdsChecked']==[] and f['ownedGroupClearanceClaim'] is False
evidencepins=load(readback['snapshotPins']['path']);raw=load(readback['rawLocalOnlyClassification']['path'])
assert raw['classification']=='LOCAL_HASH_SIZE_ONLY' and raw['rawBytesIncluded'] is False and len(raw['roles'])==4
assert {Path(r['path']).name for r in raw['roles']}=={'BEFORE-PS.txt','AFTER-PS.txt','BEFORE-LSOF.bin','AFTER-LSOF.bin'}
for r in raw['roles']:
 verify(r);assert r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY'
 assert evidencepins['files'][Path(r['path']).name]==r['sha256']
assert evidencepins['status']=='GUARDS_ACCEPTED_READONLY' and evidencepins['files']['SNAPSHOT.json']==readback['snapshot']['sha256']
for phase in ['Before','After']:
 for suffix,name in [('PS.txt','ps'),('LSOF.bin','lsof')]:
  r=next(r for r in raw['roles'] if Path(r['path']).name==phase.upper()+'-'+suffix)
  assert x['current'+phase][name+'RawSha256']==r['sha256'] and x['current'+phase][name+'RawBytes']==r['bytes']
post=load(readback['postOwnership']['path'])
assert post['checks']==[{'kind':'pid','id':18361,'result':'ESRCH'},{'kind':'pgid','id':18361,'result':'ESRCH'}]
assert post['heavyLaneLockAbsent'] is True and post['noInventedInternalIds'] is True
assert x['elapsedSeconds']==readback['guardSeconds'] and x['inventoryElapsedSeconds']==readback['inventorySeconds']
receipt={'schema':'1370-ap-current-ao-fullpreflight-independent-observed-review/v1','decision':'ACCEPT_ACTUAL_CURRENT_AO_FULL_PREFLIGHT_ONLY','concreteFindings':[],
 'readback':readback_role,'snapshot':readback['snapshot'],'fullPreflightSnapshot':readback['snapshot'],'snapshotPins':readback['snapshotPins'],
 'actualTool':readback['actualTool'],'readerActualTool':role(P/'READER-ACTUAL-TOOL.json'),'sourceReader':source_review['readerSourceReviewed'],'sourceLauncher':source_review['launcherSourceReviewed'],
 'sourceReview':readback['sourceReview'],'sourcePins':readback['sourcePins'],'sourceAdoption':readback['sourceAdoption'],'config':readback['config'],'grant':readback['grant'],
 'postOwnership':readback['postOwnership'],'rawLocalOnlyClassification':readback['rawLocalOnlyClassification'],'scanStdout':readback['scanStdout'],'scanStderr':readback['scanStderr'],
 'productionHead':head,'productionSourceTree':src,'actualSessionId':3186,'scannerPidPgid':18361,'actualExit':0,'readerExit':0,
 'guardSeconds':x['elapsedSeconds'],'inventorySeconds':x['inventoryElapsedSeconds'],'strictRoots':9,'privateSourceEntries':176,'dependencyEntriesPerCopy':12485,
 'immutableObjectSha256':hashlib.sha256(json.dumps(i,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
 'comparison':{'nineStrictRootsBeforeAfterAndImmutableEqual':True,'scratchDeviceInodeModeEqual':True,'historicalPrivateProofUnchangedFields':unchanged,'privateFullProtectedDigestEqual':True,
 'productionCommonMap':'Fresh actual AO docs-only protection baseline; deliberately distinct from original4812 and earlier operational maps. No wholesale historical immutable-map equality claim.',
 'scratchPolicy':'Parent mtime/ctime and authorized child deltas informational under original policy; strict copied/production/common/H roots have no such exception.'},
 'freeBytesBefore':x['currentBefore']['freeBytes'],'freeBytesAfter':x['currentAfter']['freeBytes'],'requiredFreeBytes':config['requiredFreeBytes'],
 'ownershipScope':'Only recorded scanner18361 PID and PGID fresh ESRCH plus lock absent; no global or invented internal-ID absence claim.',
 'rawRoles':raw['roles'],'rawBytesExported':False,'rawContentsInspected':False,'rawHashSizeOnly':True,
 'freshFullInventory':True,'historicalM0TypesAndSourceProofRemainSeparate':True,'originalM0ContentProof':False,'types':False,'collection':False,'game':False,'executionAuthorization':False,
 'reviewScope':'Retained public source and actual evidence only. No repeat inventory, signal, current probe, candidate import, private tree traversal or Git operation.',
 'lessons':['A current docs-only publication requires a fresh production/common protection baseline; preserved original private copy facts remain distinct.','Scratch parent metadata exceptions do not waive nine strict roots. Raw process/FD files are explicit LOCAL hash-size-only roles regardless of extension.']}
out=D/'RECEIPT.json'
with out.open('x') as f:json.dump(receipt,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444);Path(__file__).chmod(0o444);D.chmod(0o555)
print(json.dumps(role(out)))
