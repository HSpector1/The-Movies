"""Read-only acceptance after parent supplies completed after-fill SHA. No inventories or launch."""
import json,hashlib,pathlib,os,stat,sys,datetime
S=pathlib.Path('/Users/zacheryspector/studio-scratch');O=pathlib.Path(__file__).parent
D=S/'1370-c0-aging-era-employment-witness-r7-exact-draft-20261008-r2'
G=S/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2'
def require(v,m):
 if not v:raise RuntimeError(m)
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p,h=None):
 p=pathlib.Path(p);require(p.resolve(strict=True)==p,'physical path');fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);require(stat.S_ISREG(a.st_mode) and a.st_nlink==1,'single regular file')
  with os.fdopen(os.dup(fd),'rb') as f:b=f.read()
  z=os.fstat(fd);require((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'unstable input');require(h is None or sha(b)==h,'approved input hash');return b
 finally:os.close(fd)
def load(p,h=None):return json.loads(read(p,h))
def dump(p,v):
 b=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode();fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return sha(b)
require(sys.dont_write_bytecode and len(sys.argv)==2,'-B and parent-approved after-fill SHA required')
facts=load(O/'EXACT-FACTS.json','d1bfd3f4d29de787c52beea8941eb163b02aa4e826ede8a2a192ea28d26ea5d6');identity=facts['candidateIdentity']
read(D/'DRAFT-IDENTITY.json','0794238e0b059835fe6086f3d096c993ca81890e21bd8b9a5aa39846f691de75')
for n,h in identity['files'].items():read(D/n,h)
for rec in facts['configuredRoles'].values():read(rec['path'],rec['sha256'])
beforepath=G/'evidence/before-fill-r1/SNAPSHOT.json';afterpath=G/'evidence/after-fill-r1/SNAPSHOT.json'
before=load(beforepath,facts['beforeFillSnapshotSha256']);after=load(afterpath,sys.argv[1]);pins=load(afterpath.parent/'PINS.json')
require(pins['status']=='GUARDS_ACCEPTED_READONLY','snapshot pins status')
for n,h in pins['files'].items():read(afterpath.parent/n,h)
require(after['status']=='GUARDS_ACCEPTED_READONLY' and after['phase']=='after-fill','completed after-fill accepted status')
require(after['baseline']=={'path':str(beforepath),'sha256':facts['beforeFillSnapshotSha256']},'exact baseline role')
require(after['snapshotProcedureSha256']==before['snapshotProcedureSha256']=='ed43cd95fbbc13a2194338a8fe8dd48e05a56b1b77a4cdcb377f60ea17429740','accepted guard source')
require(after['configSha256']==before['configSha256']=='7232a61e4115f774d2e21ffd99aea707993de434fd575cc5cf8793d119610e62','guard config')
require(after['admission']==before['admission'] and after['immutable']==before['immutable'],'full immutable baseline equality')
require(after['declaredWitnessScratchChildren']==before['declaredWitnessScratchChildren'],'scratch exception scope')
for snap in (before,after):
 require({k:v for k,v in snap['rootsBefore'].items() if k!='scratchParent'}=={k:v for k,v in snap['rootsAfter'].items() if k!='scratchParent'},'strict root metadata within guard')
 for when in ('Before','After'):
  r=snap['current'+when];require(r['bootSessionUuid']=='452DE205-E1D6-462E-8673-553462BB0166' and r['fdOriginalAndEphemeralPassed'] is True and r['oldNumericPidsAbsent'] is True and r['relevantWorkersAbsent'] is True and r['freeBytes']>=3355443200 and 'AC Power' in r['power'],'current clearance facts')
  require(r['ownedGroupIdsChecked']==[] and r['ownedGroupClearanceClaim'] is False,'no invented witness groups')
 for when in ('BEFORE','AFTER'):
  read((beforepath if snap is before else afterpath).parent/(when+'-PS.txt'),snap['current'+when.title()]['psRawSha256'])
  read((beforepath if snap is before else afterpath).parent/(when+'-LSOF.bin'),snap['current'+when.title()]['lsofRawSha256'])
immutable=after['immutable'];require(len(immutable['physicalCheckout'])==176 and sum(r['bytes'] for r in immutable['physicalCheckout'].values())==4803106,'physical176/4803106')
deps=immutable['copiedDependencies'];require({t:sum(r['type']==t for r in deps.values()) for t in ('regular','directory','symlink')}=={'regular':11060,'directory':1401,'symlink':24},'full dependency shape')
require(immutable['allocatedBytes']=={'copied':250314752,'production':250314752},'allocation')
guard={'schema':'1370-witness-r7-exact-independent-guard-comparison-r2','beforeFillPath':str(beforepath),'beforeFillSha256':facts['beforeFillSnapshotSha256'],'afterFillPath':str(afterpath),'afterFillSha256':sys.argv[1],'afterFillPinsSha256':sha(read(afterpath.parent/'PINS.json')),'fullImmutableBaselineEqual':True,'immutableCanonicalSha256':sha(json.dumps(immutable,sort_keys=True,separators=(',',':')).encode()),'currentAfter':after['currentAfter'],'protectedDigests':immutable['protectedDigests'],'fullInventoryRepeated':False,'snapshotSourceReviewSha256':facts['guardSourceReviewSha256'],'status':'ACCEPTED_BASELINE_EQUAL'}
guardsha=dump(O/'GUARD-FACTS.json',guard)
finalreport={'outcome':'The exact filled candidate, original-path adoption procedure and bounded pipeline argv are accepted unrun. The authenticated completed after-fill full snapshot matches the before-fill baseline exactly.','preparedStaticReportSha256':sha(read(O/'REPORT.md')),'afterFillSnapshotSha256':sys.argv[1],'guardFactsSha256':guardsha,'remainingAction':'Parent three-field adoption, then independent adopted preflight before parent launches one witness lane.','limits':'No witness/game/frame or source tests ran in this review. Original r7 source and bounds are unchanged. No-detach scope and separate sink allowances remain as reviewed.'}
finalreportsha=dump(O/'FINAL-REPORT.json',finalreport)
receipt={'schema':'1370-c0-aging-era-employment-witness-r7-exact-independent-review-r2','decision':'ACCEPT_EXACT_FILLED_UNRUN','reviewedDraftBindingSha256':identity['draftBindingSha256'],'bindingSemanticSha256':identity['bindingSemanticSha256'],'candidatePinsSha256':identity['candidatePinsSha256'],'productionHead':identity['productionHead'],'sourcePinsSha256':identity['sourcePinsSha256'],'adoptionProcedureSha256':facts['adoptionProcedureSha256'],'fillProcedureSha256':facts['fillProcedureSha256'],'bindingPath':identity['bindingPath'],'reviewedDraftPath':str(D),'draftIdentitySha256':'0794238e0b059835fe6086f3d096c993ca81890e21bd8b9a5aa39846f691de75','sourceReviewSha256':'4f873fc7b0d0d24d0d339d1893f523a717da6bd00942a5920bc67ee659d317ff','materializedRoot':load(D/'BINDING-DRAFT.json')['repoRoot'],'exactFactsSha256':sha(read(O/'EXACT-FACTS.json')),'guardFactsSha256':guardsha,'afterFillSnapshotSha256':sys.argv[1],'beforeFillSnapshotSha256':facts['beforeFillSnapshotSha256'],'reportSha256':sha(read(O/'REPORT.md')),'fullImmutableBaselineEqual':True,'semanticExcludedOnly':['status','executionAuthorization','exactReview'],'draftDecision':'ACCEPT_DRAFT_ONLY','executionAuthorization':False,'launchAuthorized':False,'adoptionExecuted':False,'gameRun':False,'sourceTestsRun':False,'fullInventoryRepeated':False,'remainingLaunchGate':'Reviewed original-path three-field adoption and fresh independent adopted preflight; parent owns actual lane and no-detach scope. Prepared REPORT pending wording describes its interim state; this receipt and GUARD-FACTS resolve that gate.','utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
receipt['reportSha256']=finalreportsha
receipt['preparedStaticReportSha256']=sha(read(O/'REPORT.md'))
receipt['remainingLaunchGate']='Reviewed original-path three-field adoption and fresh independent adopted preflight; parent owns actual lane and no-detach scope.'
print(json.dumps({'decision':receipt['decision'],'receiptPath':str(O/'RECEIPT.json'),'receiptSha256':dump(O/'RECEIPT.json',receipt),'guardFactsSha256':guardsha},sort_keys=True))
