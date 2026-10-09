import datetime,hashlib,importlib.util,json,os,signal,stat,sys,time
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program'); P=Path('/Users/zacheryspector/studio-scratch'); H=Path(__file__).resolve().parent
D=P/'1370-c0-b-release-109-tick-exact-draft-20261008-r1'; S=P/'1370-c0-b-release-109-tick-source-proposal-20261008-r2'; G=P/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2'
NEW='2cb97371f25dcb20bf375222c59f63028d3e4b52f490d289c31a532273e3772c'; OLD='b1d0189450efb4753c074295c1256daf930c13ddd1171bf7ef288482ac93ed40'; SEM='88826e1b557ebe04840ff63bc0dffa74691f10986adcb982c467a63ddf2d5068'; MAN='67945d92e6a330f98482a893cb9a39005e7eed9fcc428b5c1d3a339cca116578'
records={}
def sha(b):return hashlib.sha256(b).hexdigest()
def canon(v):return json.dumps(v,sort_keys=True,separators=(',',':')).encode()
def identity(s):return dict(device=s.st_dev,inode=s.st_ino,bytes=s.st_size,mode=stat.S_IMODE(s.st_mode),nlink=s.st_nlink,mtimeNs=s.st_mtime_ns,ctimeNs=s.st_ctime_ns)
def read(p,h=None,links=1):
 p=Path(p); assert p.is_absolute() and p.resolve(strict=True)==p
 a=p.lstat(); assert stat.S_ISREG(a.st_mode) and a.st_nlink==links
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  b=os.fstat(fd);assert identity(a)==identity(b)
  raw=bytearray()
  while True:
   v=os.read(fd,1048576)
   if not v:break
   raw.extend(v)
  assert identity(a)==identity(os.fstat(fd))==identity(p.lstat()) and len(raw)==a.st_size
 finally:os.close(fd)
 raw=bytes(raw);digest=sha(raw); assert h is None or digest==h,(str(p),digest,h)
 records[str(p)]=dict(identity(a),sha256=digest);return raw

def dump(n,v):
 fd=os.open(H/n,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write((json.dumps(v,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
def load(p,h=None,links=1):return json.loads(read(p,h,links))
def authsource():
 m=load(S/'MANIFEST.json',MAN)
 for n,pin in m['files'].items():read(S/n,pin['sha256'])
 ex={n:read(pin['path'],pin['sha256']) for n,pin in m['externalPins'].items()}
 return m,ex

def worker():
 started=time.monotonic();m,ex=authsource()
 rg={'__name__':'authenticated_runtime_guard'};exec(compile(ex['runtimeGuard'],m['externalPins']['runtimeGuard']['path'],'exec'),rg)
 a={'__name__':'authenticated_assembler','_AUTHENTICATED_RUNNER_BYTES':ex['assembler'],'_AUTHENTICATED_MANIFEST_BYTES':ex['routeManifest'],'_AUTHENTICATED_REVIEW_BYTES':ex['sourceReview'],'_AUTHENTICATED_VERIFY_RUNTIME':rg['verify_runtime']}
 exec(compile(ex['assembler'],m['externalPins']['assembler']['path'],'exec'),a)
 route=json.loads(ex['routeManifest']); inherited=a['verify_external_sources'](route); runtime=rg['verify_runtime'](S,route)
 assert runtime=='377f5d06726f292eb4b6bf80c288e84eb48716906a5ec331d36928ea46124356'
 dep=load(S/'DEPENDENCIES.json');assert (len(dep['files']),len(dep['directories']),len(dep['links']))==(11060,1401,24)
 result=dict(status='ACCEPTED_READONLY_SOURCE_RUNTIME_GUARD',runtimeSha256=runtime,inheritedSourceKitFiles=len(inherited['files']),productionSourceFilesPerArm=188,equalProductionFiles=180,changedProductionFiles=route['changedProductionPaths'],dependencyCounts=dict(regular=len(dep['files']),directory=len(dep['directories']),symlink=len(dep['links'])),node=route['runtime']['nodePath'],nodeSha256=route['runtime']['nodeSha256'],elapsedSeconds=time.monotonic()-started,assemblyCalled=False,game=False,tests=False)
 dump('RUNTIME-SOURCE-GUARD.json',result);print(json.dumps(result,sort_keys=True))

def main():
 started=time.monotonic();m,ex=authsource()
 braw=read(D/'BINDING-DRAFT.json',NEW);oldraw=read(D/'BINDING-DRAFT.UNADOPTED-ARCHIVE.json',OLD);b=json.loads(braw);old=json.loads(oldraw)
 assert len(braw)==7338 and len(oldraw)==7110
 assert records[str(D/'BINDING-DRAFT.json')]['mode']==records[str(D/'BINDING-DRAFT.UNADOPTED-ARCHIVE.json')]['mode']==0o600
 changed=sorted(k for k in set(b)|set(old) if b.get(k)!=old.get(k));assert changed==['exactReview','executionAuthorization','status']
 assert b['status']=='REVIEWED_FILLED_UNRUN' and b['executionAuthorization'] is True
 for v in (b,old):assert sha(canon({k:x for k,x in v.items() if k not in changed}))==SEM
 er=load(b['exactReview']['path'],b['exactReview']['sha256']);assert er['decision']=='ACCEPT_EXACT_B_RELEASE_109_TICK_UNRUN' and er['manifestSha256']==MAN and er['bindingSemanticSha256']==SEM
 assert records[b['exactReview']['path']]['bytes']==b['exactReview']['bytes']
 adoption=load(D/'PARENT-ADOPTION.json','43514e3f212fc60fb800412431d360835c62a0975673d479af6cd62d32698152')
 launch=load(D/'ADOPTED-LAUNCH.json','f55e114d94e0de0763e17a2e7bdcd5a2fddf0be8afae34434f1d7ef041d1ccd6');plan=load(D/'LAUNCH-PLAN.json','6ce377d60179a112dd9cb3c466aecf015d9fe907ed71ef378cdc2fc833a1a898')
 assert sorted(k for k in set(plan)|set(launch) if plan.get(k)!=launch.get(k))==['argv','status']
 assert launch['argv'][:-1]==plan['argv'][:-1] and launch['argv'][-1]==NEW
 python=b['recorderPython']['path'];read(python,b['recorderPython']['sha256'])
 helper=m['externalPins']['acceptedLaneHelper']['path']
 expected=['/bin/bash',helper,'0',str(D/'continuation.lane.log'),python,'-I','-B',str(S/'run.py'),str(D/'BINDING-DRAFT.json'),NEW]
 assert launch['argv']==expected and launch['cwd']==str(R) and launch['environment']=={'PYTHONDONTWRITEBYTECODE':'1'}
 assert 'sandbox' not in ' '.join(expected)
 assert launch['clockCaps']==plan['clockCaps'] and launch['clockCaps']['wholeSeconds']==390 and launch['clockCaps']['activeSeconds']==375 and launch['clockCaps']['sharedNodeSeconds']==300
 pre=load(D/'READONLY-PREFLIGHT.json','e8115231f94017d4873ed3ae2f0e4d22328235d4ec9d5e5cb1a8b2da496dc849')
 cp=pre['capture'];p=Path(cp['path']); fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  cap=identity(os.fstat(fd));assert cap==identity(p.lstat())
  for k in ('device','inode','bytes','nlink','mtimeNs','ctimeNs'):assert cap[k]==cp[k]
  assert cap['mode']==int(cp['mode'],8)
 finally:os.close(fd)
 # Exact accepted full snapshot/admission precedes copied-root reads. No tree walks.
 baseline=load(G/'evidence/postflight-r8-r1/SNAPSHOT.json','07b785480707a2c972dbdba4b0865461507939c1891f8b5386c40a375dab105e')
 fullpins=load(G/'evidence/postflight-r8-r1/PINS.json','c7aadd41903e6e6ba67312eaeefb61fca5cdb00341c5b37a8c397c3463e1e7a4')
 br=load(P/'1370-c0-aging-era-employment-witness-r8-observed-stop-full-postflight-independent-review-20261008-r1/RECEIPT.json','9bc5f3d9ccff1625c3af8532a9153e3385933cc7848bde0f9eb17be97af3e0e5')
 initial=load(G/'evidence/before-fill-r1/SNAPSHOT.json','b087ec768c52328d142433555d8549e4d9e365fe4293810fe4fac5c042281a12')
 assert baseline['status']=='GUARDS_ACCEPTED_READONLY' and baseline['immutable']==initial['immutable']
 sgraw=read(G/'snapshot.py','ed43cd95fbbc13a2194338a8fe8dd48e05a56b1b77a4cdcb377f60ea17429740');cfg=load(G/'CONFIG.json','7232a61e4115f774d2e21ffd99aea707993de434fd575cc5cf8793d119610e62')
 sg={'__name__':'accepted_parent_guard','__file__':str(G/'snapshot.py')};exec(compile(sgraw,str(G/'snapshot.py'),'exec'),sg)
 mbraw=read(cfg['bindingPath'],baseline['immutable']['bindingSha256']);mb=json.loads(mbraw)
 assert sha(canon({k:v for k,v in mb.items() if k not in sg['EXCLUDED']}))==cfg['bindingSemanticSha256']
 assert mb['status']=='REVIEWED_FILLED_UNRUN' and mb['executionAuthorization'] is True
 pins=load(mb['sourcePinsPath'],cfg['sourcePinsSha256']);read(mb['sourceReviewPath'],cfg['sourceReviewSha256'])
 for n,h in pins['files'].items():read(Path(mb['sourcePinsPath']).parent/n,h)
 matraw=read(mb['materializerPath'],cfg['materializerSha256'])
 for t in ('git','ls','lsof','xattr','du'):read(mb[t+'Path'],mb[t+'Sha256'],76 if t=='git' and mb[t+'Path']=='/usr/bin/git' else 1)
 spec=importlib.util.spec_from_file_location('accepted_materializer_readonly',mb['materializerPath']);mod=importlib.util.module_from_spec(spec);sys.modules[spec.name]=mod;spec.loader.exec_module(mod)
 copied=Path(cfg['copiedRoot']);assert not os.path.lexists(Path(mb['outputRoot'])/'SUPERVISOR-OVERRIDE-STOP.json')
 absent=[Path(b['outputRoot']),D/'continuation.lane.log',D/'continuation.lane.log.meta']
 def edges(label,owned):
  facts=sg['current'](cfg,mb,mod,copied,owned);assert facts['freeBytes']>=launch['clockCaps']['preflightFreeBytes']
  for n,k in [('psRaw','PS.txt'),('lsofRaw','LSOF.bin')]:
   raw=facts.pop(n);fd=os.open(H/(label+'-'+k),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
   with os.fdopen(fd,'wb') as f:f.write(raw)
  roots={n:sg['directory_identity'](v['path']) for n,v in baseline['rootsAfter'].items()}
  for n,row in roots.items():
   keys=('path','device','inode','mode') if n=='scratchParent' else tuple(row)
   assert {k:row[k] for k in keys}=={k:baseline['rootsAfter'][n][k] for k in keys},'root metadata drift '+n
   assert sg['ancestry'](row['path'])==baseline['immutable']['ancestry'][n]
  assert all(not os.path.lexists(p) for p in absent)
  assert read(D/'BINDING-DRAFT.json',NEW)==braw and read(D/'BINDING-DRAFT.UNADOPTED-ARCHIVE.json',OLD)==oldraw
  dump(label+'-CURRENT.json',dict(facts=facts,roots=roots,ancestryMatchesAcceptedFullSnapshot=True,absentPaths={str(p):True for p in absent}));return facts
 before=edges('BEFORE',[94462])
 # Accepted recorder startup ownership reused solely for bounded read-only helper.
 rns={'__name__':'accepted_recorder_readonly'};exec(compile(read(S/'run.py',m['files']['run.py']['sha256']),str(S/'run.py'),'exec'),rns)
 owned={};end=time.monotonic()+180
 signal.signal(signal.SIGALRM,lambda *_: (_ for _ in ()).throw(TimeoutError('preflight guard 180-second cap')));signal.setitimer(signal.ITIMER_REAL,180)
 fdout=os.open(H/'driver.stdout',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fderr=os.open(H/'driver.stderr',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 command=['/bin/bash',helper,'0',str(H/'runtime-source.lane.log'),python,'-I','-B',str(H/'audit-adopted.py'),'--runtime-worker']
 child=None;actual=None
 try:
  rns['start_owned'](command,str(R),dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'),fdout,fderr,owned)
  child=owned['child'];rns['ready_go'](owned,end)
  while child.poll() is None:
   assert time.monotonic()<end
   assert os.stat(H/'driver.stderr').st_size<=1048576 and os.stat(H/'driver.stdout').st_size<=1048576
   time.sleep(.05)
  actual=child.returncode;assert actual==0
 finally:
  rns['close_startup_fds'](owned)
  if child is None:child=owned.get('child')
  cleared=child is not None and rns['clear'](child,time.monotonic()+10)
  os.close(fdout);os.close(fderr);signal.setitimer(signal.ITIMER_REAL,0)
 assert cleared and actual==0
 runtime=load(H/'RUNTIME-SOURCE-GUARD.json');lograw=read(H/'runtime-source.lane.log');metaraw=read(H/'runtime-source.lane.log.meta');meta=metaraw.decode()
 assert 'end, exit 0;' in meta and '\nstart;' in meta and 'STOP' not in meta and meta.startswith('waiting for pid 0;')
 assert read(H/'driver.stderr')==b'' and read(H/'driver.stdout')==b''
 assert sha(read(S/'MANIFEST.json'))==MAN
 after=edges('AFTER',[94462,child.pid])
 dump('FACTS.json',dict(status='ADOPTED_EXACT_PREFLIGHT_PASSED_UNRUN',utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),bindingSha256=NEW,originalArchiveSha256=OLD,semanticSha256=SEM,changedFields=changed,argv=expected,helperCommand=command,helperPid=child.pid,helperPgid=child.pid,startupOwnedBeforeExec=True,readyGoGroupConfirmed=owned['pgidConfirmed'],actualHelperExit=actual,metaExit=0,ownedGroupClear=True,noUnexpectedWait=True,runtime=runtime,acceptedFullProtectedSnapshotSha256=records[str(G/'evidence/postflight-r8-r1/SNAPSHOT.json')]['sha256'],fullProtectedMetadataReused=True,fullProtectedInventoryRepeated=False,currentBefore=before,currentAfter=after,captureMetadata=cap,captureContentsNotRead=True,records=records,elapsedSeconds=time.monotonic()-started,game=False,tests=False,assembly=False,productionOrGitWrites=False))
 print(json.dumps(dict(status='ADOPTED_EXACT_PREFLIGHT_PASSED_UNRUN',helperPid=child.pid,helperActualExit=actual,groupClear=cleared,elapsedSeconds=time.monotonic()-started),sort_keys=True))
if __name__=='__main__':
 assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
 worker() if len(sys.argv)==2 and sys.argv[1]=='--runtime-worker' else main()
