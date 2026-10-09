import datetime,hashlib,importlib.util,json,os,stat,sys,time
from pathlib import Path
P=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');H=Path(__file__).resolve().parent;G=P/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2';S=P/'1370-c0-b-release-109-tick-source-proposal-20261008-r2';D=P/'1370-c0-b-release-109-tick-exact-draft-20261008-r1';O=P/'1370-b-release-109-tick-run-20261008-4812-r1'
records={}
def sha(b):return hashlib.sha256(b).hexdigest()
def identity(s):return {'device':s.st_dev,'inode':s.st_ino,'bytes':s.st_size,'mode':stat.S_IMODE(s.st_mode),'nlink':s.st_nlink,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}
def read(p,h=None,links=1):
 p=Path(p);assert p.is_absolute() and p.resolve(strict=True)==p
 a=p.lstat();assert stat.S_ISREG(a.st_mode) and a.st_nlink==links
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW);raw=bytearray()
 try:
  assert identity(os.fstat(fd))==identity(a)
  while True:
   v=os.read(fd,1048576)
   if not v:break
   raw.extend(v)
  assert identity(a)==identity(os.fstat(fd))==identity(p.lstat()) and len(raw)==a.st_size
 finally:os.close(fd)
 raw=bytes(raw);digest=sha(raw);assert h is None or digest==h,(str(p),digest,h)
 records[str(p)]={**identity(a),'sha256':digest};return raw

def load(p,h=None,links=1):return json.loads(read(p,h,links))
def dump(n,v):
 fd=os.open(H/n,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write((json.dumps(v,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
def canon(v):return json.dumps(v,sort_keys=True,separators=(',',':')).encode()
started=time.monotonic()
parent=load(D/'PARENT-TOOL-OUTCOME.json','0c09a2287f26ebacc5e89939bace8ae099f296634edc48da53465f3171387785');assert parent['actualToolSession']==40421 and parent['actualToolExit']==parent['helperMetaExit']==2
for name,pin in parent['artifacts'].items():assert len(read(name,pin['sha256']))==pin['bytes']
result=load(O/'RESULT.json','4b9532372a117d238cec7725134cecd75c0d0957c9efa7fd279467bdf28f22de')
assert result['status']=='STOP' and result['error']=="AssertionError('STOP_ACTIVE_OR_COMBINED_TEST_CAP')"
assert result['elapsedSeconds']<375 and result['elapsedSeconds']<390 and len(result['children'])==1
child=result['children'][0];assert child['arm']=='EBG' and child['pid']==child['pgid']==66578 and child['actualExit']==-15 and child['groupClear'] is True and child['startupOwnedBeforeExec'] is True and child['pgidConfirmed'] is True
assert result['groupClear'] is True and all(k not in result for k in ('postflight','cleanupError','mirrorError','deadlineExceeded','armSummaries'))
launch=load(O/'EBG.LAUNCH.json');assert launch['pid']==launch['pgid']==66578 and launch['command']==child['command'] and launch['sourceInventorySha256']==child['sourceInventorySha256'] and launch['actualExit'] is None and launch['groupClear'] is False
meta=read(D/'continuation.lane.log.meta').decode();assert meta.startswith('waiting for pid 0;') and '\nstart; 2026-10-08 19:19:48 CDT\n' in meta and 'end, exit 2; 2026-10-08 19:25:12 CDT' in meta and 'STOP:' not in meta
b=load(D/'BINDING-DRAFT.json','2cb97371f25dcb20bf375222c59f63028d3e4b52f490d289c31a532273e3772c');assert sha(canon({k:v for k,v in b.items() if k not in ('status','executionAuthorization','exactReview')}))=='88826e1b557ebe04840ff63bc0dffa74691f10986adcb982c467a63ddf2d5068'
read(D/'BINDING-DRAFT.UNADOPTED-ARCHIVE.json','b1d0189450efb4753c074295c1256daf930c13ddd1171bf7ef288482ac93ed40');load(D/'ADOPTED-LAUNCH.json','f55e114d94e0de0763e17a2e7bdcd5a2fddf0be8afae34434f1d7ef041d1ccd6');read(b['exactReview']['path'],b['exactReview']['sha256'])
m=load(S/'MANIFEST.json','67945d92e6a330f98482a893cb9a39005e7eed9fcc428b5c1d3a339cca116578')
assert result['manifestSha256']==sha(read(S/'MANIFEST.json')) and result['bindingSha256']==sha(read(D/'BINDING-DRAFT.json'))
for n,pin in m['files'].items():read(S/n,pin['sha256'])
external={n:read(pin['path'],pin['sha256']) for n,pin in m['externalPins'].items()};route=json.loads(external['routeManifest']);runtime=route['runtime']
for role,hashkey in [('nodePath','nodeSha256'),('typescriptPath','typescriptSha256'),('vitestPath','vitestSha256')]:read(Path(runtime[role]).resolve(strict=True),runtime[hashkey])
assert result['preflight']['runtime']=='377f5d06726f292eb4b6bf80c288e84eb48716906a5ec331d36928ea46124356'
assert child['command'][0]==runtime['nodePath'] and child['command'][1]==runtime['vitestPath']
# Stable partial artifact hashing only, never decode/count its gzip members.
read(O/'EBG.ndjson.gz');assert read(O/'EBG.stdout.log')==read(O/'EBG.stderr.log')==b''
allowed={'baseline-tree','RESULT.json','EBG.ndjson.gz','EBG.stderr.log','EBG.LAUNCH.json','EBG.stdout.log'};assert set(p.name for p in O.iterdir())==allowed
assert not os.path.lexists(O/'OVERRIDE-STOP.json') and not os.path.lexists(O/'intervention-tree')
counted=0;outputmeta={}
for p in O.iterdir():
 s=p.lstat();assert not stat.S_ISLNK(s.st_mode);outputmeta[p.name]=identity(s)
 if p.name=='baseline-tree':assert stat.S_ISDIR(s.st_mode);continue
 assert stat.S_ISREG(s.st_mode) and s.st_nlink==1;counted+=s.st_size
 if p.suffix=='.json':assert s.st_size<=16*1024**2
assert counted<256*1024**2 and sum((O/('EBG.'+suffix+'.log')).stat().st_size for suffix in ('stdout','stderr'))<=1024**2
snapshot=load(G/'evidence/postflight-r8-r1/SNAPSHOT.json','07b785480707a2c972dbdba4b0865461507939c1891f8b5386c40a375dab105e');load(G/'evidence/postflight-r8-r1/PINS.json','c7aadd41903e6e6ba67312eaeefb61fca5cdb00341c5b37a8c397c3463e1e7a4');load(P/'1370-c0-aging-era-employment-witness-r8-observed-stop-full-postflight-independent-review-20261008-r1/RECEIPT.json','9bc5f3d9ccff1625c3af8532a9153e3385933cc7848bde0f9eb17be97af3e0e5')
config=load(G/'CONFIG.json','7232a61e4115f774d2e21ffd99aea707993de434fd575cc5cf8793d119610e62');sgraw=read(G/'snapshot.py','ed43cd95fbbc13a2194338a8fe8dd48e05a56b1b77a4cdcb377f60ea17429740');sg={'__name__':'accepted_guard_readonly','__file__':str(G/'snapshot.py')};exec(compile(sgraw,str(G/'snapshot.py'),'exec'),sg)
mb=load(config['bindingPath'],snapshot['immutable']['bindingSha256']);assert sha(canon({k:v for k,v in mb.items() if k not in sg['EXCLUDED']}))==config['bindingSemanticSha256']
assert mb['status']=='REVIEWED_FILLED_UNRUN' and mb['executionAuthorization'] is True
pins=load(mb['sourcePinsPath'],config['sourcePinsSha256']);read(mb['sourceReviewPath'],config['sourceReviewSha256'])
for n,h in pins['files'].items():read(Path(mb['sourcePinsPath']).parent/n,h)
read(mb['materializerPath'],config['materializerSha256'])
for t in ('git','ls','lsof','xattr','du'):read(mb[t+'Path'],mb[t+'Sha256'],76 if t=='git' and mb[t+'Path']=='/usr/bin/git' else 1)
spec=importlib.util.spec_from_file_location('accepted_materializer_readonly',mb['materializerPath']);module=importlib.util.module_from_spec(spec);sys.modules[spec.name]=module;spec.loader.exec_module(module)
assert not os.path.lexists(Path(mb['outputRoot'])/'SUPERVISOR-OVERRIDE-STOP.json')
# Parent reserves idle lane; both invocations remain OUTSIDE helper. No new helper/game.
facts=[]
for label in ('BEFORE','AFTER'):
 current=sg['current'](config,mb,module,Path(config['copiedRoot']),[66578,64755,94462]);assert current['freeBytes']>=3657433088
 for key,suffix in [('psRaw','PS.txt'),('lsofRaw','LSOF.bin')]:
  raw=current.pop(key);fd=os.open(H/(label+'-'+suffix),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
  with os.fdopen(fd,'wb') as f:f.write(raw)
 roots={n:sg['directory_identity'](r['path']) for n,r in snapshot['rootsAfter'].items()}
 for n,row in roots.items():
  keys=('path','device','inode','mode') if n=='scratchParent' else tuple(row)
  assert {k:row[k] for k in keys}=={k:snapshot['rootsAfter'][n][k] for k in keys},'protected root metadata drift '+n
  assert sg['ancestry'](row['path'])==snapshot['immutable']['ancestry'][n]
 dump(label+'-CURRENT.json',{'facts':current,'roots':roots,'ancestryEqualToAcceptedFullSnapshot':True});facts.append(current)
assert read(O/'RESULT.json')==json.dumps(result,separators=(',',':')).encode()+b'\n'
# Source literals establish exact cap branch; no invented launch monotonic time.
source=read(S/'run.py',m['files']['run.py']['sha256']).decode();assert 'COMBINED = 300' in source and 'ACTIVE = 375' in source and 'WHOLE = 390' in source and "assert time.monotonic() < min(started + ACTIVE, started_tests + COMBINED), 'STOP_ACTIVE_OR_COMBINED_TEST_CAP'" in source
read(H/'audit-stop.py')
dump('FACTS.json',{'status':'OBSERVED_STOP_WITH_FRESH_GUARDS_ACCEPTED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualToolSession':40421,'actualToolExit':2,'actualHelperMetaExit':2,'result':result,'actualChildPidPgid':66578,'actualChildExit':-15,'recordedAndFreshGroupClear':True,'ownedGroupsCheckedAbsent':[66578,64755,94462],'capAttribution':'Shared300-second Node activity bound fired; elapsed324.414479<active375/whole390. Exact child launch monotonic timestamp is not recorded, so its exact elapsed time is not claimed.','partialCaptureBoundaryCount':'UNCLAIMED_NOT_DECODED','resultTickBoundaryDeclarations':'Requested contract counts109/110, not actual completion evidence.','interventionExecuted':False,'comparisonProduced':False,'outputCountedBytes':counted,'outputMetadata':outputmeta,'current':facts,'fullProtectedInventoryReusedSha256':'07b785480707a2c972dbdba4b0865461507939c1891f8b5386c40a375dab105e','fullProtectedInventoryRepeated':False,'freshRuntimeEntrypointHashesVerified':True,'runtimeFullInventoryObservedPreflight':result['preflight']['runtime'],'recorderPostflightCompleted':False,'remaining':'Recorder source/runtime inventory postflight was not reached; complete110 boundary admission/baseline/readback, intervention and comparison remain absent. Full protected baseline reused under maintained freeze; fresh current root/FD/ref/boot/AC/disk/free-lane guards pass, no repeated full inventory.','records':records,'reviewElapsedSeconds':time.monotonic()-started,'newGameOrTestsOrAssembly':False})
print(json.dumps({'status':'OBSERVED_STOP_WITH_FRESH_GUARDS_ACCEPTED','actualChildPgid':66578,'freshGroupClear':True,'countedBytes':counted,'elapsedSeconds':time.monotonic()-started},sort_keys=True))
