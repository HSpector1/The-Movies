import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path('/Users/zacheryspector/studio-scratch/1370-ap-root-continuation-20261010-r1');P=S/'1370-ap-current-ao-fullpreflight-parent-recorded-20261010-r1';G=S/'1370-ap-current-operational-fullguard-source-20261010-r1';O=G/'evidence/before-fill-current-ao-r1'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
actual=read(P/'ACTUAL-TOOL.json');assert type(actual['finalExit']) is int and actual['finalExit']==0 and actual['allToolChunks'][-1]['exit_code']==0
grant=read(P/'GRANT.json');config=read(G/'CONFIG.json');pins=read(G/'SOURCE-PINS.json')
assert grant['sourcePins']==role(G/'SOURCE-PINS.json') and grant['argv'][3]==str(G/'snapshot.py')
for r in pins['files'].values():assert role(r['path'])==r
stdout=(P/'scan.stdout').read_bytes();assert stdout.endswith(b'\n') and len(stdout.splitlines())==1
summary=json.loads(stdout);assert summary['status']=='GUARDS_ACCEPTED_READONLY' and summary['snapshotPath']==str(O/'SNAPSHOT.json')
assert summary['snapshotSha256']==role(O/'SNAPSHOT.json')['sha256'] and summary['pinsSha256']==role(O/'PINS.json')['sha256']
assert (P/'scan.stderr').read_bytes()==b''
evidencepins=read(O/'PINS.json');assert evidencepins['status']=='GUARDS_ACCEPTED_READONLY'
for name,h in evidencepins['files'].items():assert '/' not in name and role(O/name)['sha256']==h
snapshot=read(O/'SNAPSHOT.json');assert snapshot['status']=='GUARDS_ACCEPTED_READONLY' and snapshot['phase']=='before-fill' and snapshot['baseline'] is None
assert snapshot['configSha256']==role(G/'CONFIG.json')['sha256'] and snapshot['snapshotProcedureSha256']==role(G/'snapshot.py')['sha256']
assert snapshot['admission']==dict(config['observedCopyReceipt'],decision=config['observedDecision'])
imm=snapshot['immutable'];assert imm['operationalProductionHead']=='f2f97c622db7f5332164b790d1646355e89c00f4' and imm['operationalSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert imm['parentScopeAdoption']==config['parentScopeAdoption'] and len(imm['strictRoots'])==9
before=snapshot['rootsBefore'];after=snapshot['rootsAfter'];assert {k:v for k,v in before.items() if k!='scratchParent'}=={k:v for k,v in after.items() if k!='scratchParent'}==imm['strictRoots']
for k in ('path','device','inode','mode'):assert before['scratchParent'][k]==after['scratchParent'][k]==imm['scratchParentIdentity'][k]
assert len(imm['productionDependencies'])==len(imm['copiedDependencies'])==12485
assert len(imm['physicalCheckout'])==176
for key in ('currentBefore','currentAfter'):
 f=snapshot[key];assert f['oldNumericPidsAbsent'] is True and f['relevantWorkersAbsent'] is True and f['fdOriginalAndEphemeralAndRetainedHPassed'] is True and f['fdOriginalM0ParentPassed'] is True
 assert f['freeBytes']>=3758096384 and 'AC Power' in f['power'] and f['ownedGroupIdsChecked']==[] and f['ownedGroupClearanceClaim'] is False
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
checks=[]
for kind,value in [('pid',grant['ownedPid']),('pgid',grant['ownedPgid'])]:
 assert type(value) is int and value>1
 try:
  if kind=='pid':os.kill(value,0)
  else:os.killpg(value,0)
 except ProcessLookupError:checks.append({'kind':kind,'id':value,'result':'ESRCH'})
 else:raise RuntimeError('Owned scanner identity remains live')
post=put(P/'POST-OWNERSHIP.json',{'schema':'1370-ap-fullpreflight-owned-absence/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'heavyLaneLockAbsent':True,'noInventedInternalIds':True})
raw=put(P/'RAW-LOCAL-ONLY-CLASSIFICATION.json',{'schema':'1370-ap-fullpreflight-raw-local-only/v1','classification':'LOCAL_HASH_SIZE_ONLY','roles':[dict(role(O/name),archiveDisposition='LOCAL_HASH_SIZE_ONLY') for name in ('BEFORE-PS.txt','BEFORE-LSOF.bin','AFTER-PS.txt','AFTER-LSOF.bin')],'rawBytesIncluded':False})
result={'schema':'1370-ap-current-ao-fullpreflight-readback/v1','status':'ACTUAL_CURRENT_AO_FULL_PREFLIGHT_COMPLETE_UNADOPTED','productionHead':imm['operationalProductionHead'],'productionSourceTree':imm['operationalSourceTree'],'freshFullInventory':True,'snapshot':role(O/'SNAPSHOT.json'),'guardSource':role(G/'snapshot.py'),'config':role(G/'CONFIG.json'),'sourcePins':role(G/'SOURCE-PINS.json'),'actualTool':role(P/'ACTUAL-TOOL.json'),'postOwnership':post,'rawLocalOnlyClassification':raw,'grant':role(P/'GRANT.json'),'sourceReview':grant['sourceReview'],'sourceAdoption':grant['sourceAdoption'],'scanStdout':role(P/'scan.stdout'),'scanStderr':role(P/'scan.stderr'),'snapshotPins':role(O/'PINS.json'),'guardSeconds':snapshot['elapsedSeconds'],'inventorySeconds':snapshot['inventoryElapsedSeconds'],'strictRoots':9,'dependencyEntriesPerCopy':12485,'privateSourceEntries':176,'originalM0ContentProof':False,'game':False,'executionAuthorization':False}
print(json.dumps({'readback':put(P/'READBACK.json',result),'elapsedSeconds':snapshot['elapsedSeconds'],'inventorySeconds':snapshot['inventoryElapsedSeconds']}))
