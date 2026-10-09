import os,stat,json,hashlib,sys,pathlib,importlib.util,subprocess,datetime
S=pathlib.Path('/Users/zacheryspector/studio-scratch');O=pathlib.Path(__file__).parent
D=S/'1370-c0-aging-era-employment-witness-r7-exact-draft-20261008-r2';P=S/'1370-c0-aging-era-witness-r7-exact-preparation-20261008-r2';G=S/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2'
A=S/'1370-c0-aging-era-employment-witness-r7-pre-adoption-archive-20261008-r2';U=S/'1370-c0-aging-era-employment-witness-r7-adoption-output-20261008-r2'
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
def require(v,m):
 if not v:raise RuntimeError(m)
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p,h=None,mode=None,links=1):
 p=pathlib.Path(p);require(p.resolve(strict=True)==p,'physical input '+str(p));fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);require(stat.S_ISREG(a.st_mode) and a.st_nlink==links,'regular/nlink '+str(p))
  with os.fdopen(os.dup(fd),'rb') as f:b=f.read()
  z=os.fstat(fd);require((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'changed input');require(h is None or sha(b)==h,'hash '+str(p));require(mode is None or format(stat.S_IMODE(a.st_mode),'04o')==mode,'mode '+str(p))
  return b,a
 finally:os.close(fd)
def load(p,h=None):return json.loads(read(p,h)[0])
def dump(p,v):
 b=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode();fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return sha(b)
def save(p,b):
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b)
def module(p,name,h):
 read(p,h);sp=importlib.util.spec_from_file_location(name,p);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m
require(sys.dont_write_bytecode and not sys.flags.optimize,'Python -B required')
exactpath=S/'1370-c0-aging-era-employment-witness-r7-exact-independent-review-20261008-r2/RECEIPT.json';exactsha='562215cc2003b871147f111a1b33c75005512c1abd2fbc9d3cd0424390a0bc77';exact=load(exactpath,exactsha)
config=load(P/'CONFIG-PENDING.json','4b6bf16518e9ab7c472c9147376a9a9ed5ca15f79f0dc656af8175abd85a6bf5');manifest=load(U/'ARCHIVE-MANIFEST.json','089d40177dcd888806746f83b9eecbb97927e32101fac058f94425ccdbcafd58');result=load(U/'ADOPTION-RESULT.json','a9187d4fd43eeaddecfced9b3b2eecdfbbd32aef3bc6591c16e11796f99b84f5');launch=load(U/'ADOPTED-LAUNCH-SPEC.json','699c1be5454d65b2ee960fcac01611b44d1db5610967f4b5bd308fad2c9aeb82')
require(manifest['count']==6 and manifest['draftPath']==str(D) and set(p.name for p in A.iterdir())==set(manifest['files']),'six-file archive')
for n,r in manifest['files'].items():b,_=read(A/n,r['sha256'],'0600');require(len(b)==r['bytes'],'archive length')
identity=load(A/'DRAFT-IDENTITY.json','0794238e0b059835fe6086f3d096c993ca81890e21bd8b9a5aa39846f691de75')
for n,h in identity['files'].items():read(A/n,h,'0600')
require(set(p.name for p in D.iterdir())==set(manifest['files']),'current six-file candidate')
for n,r in manifest['files'].items():
 if n!='BINDING-DRAFT.json':require(read(D/n,r['sha256'],'0600')[0]==read(A/n)[0],'unchanged file '+n)
old=load(A/'BINDING-DRAFT.json');newraw,_=read(D/'BINDING-DRAFT.json','31eed0401487d0be2849c11dcb8e73c8ca6a3a636ec3a755085981ddd9bb4817','0600');new=json.loads(newraw)
fields={'status','executionAuthorization','exactReview'};require(set(old)==set(new) and {k for k in old if old[k]!=new[k]}==fields,'exact three-field diff');require(new['status']=='REVIEWED_FILLED_UNRUN' and new['executionAuthorization'] is True and new['exactReview']=={'path':str(exactpath),'sha256':exactsha,'decision':'ACCEPT_EXACT_FILLED_UNRUN'},'review adoption')
semantic={k:v for k,v in new.items() if k not in fields};semanticsha=sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode());require(semanticsha==exact['bindingSemanticSha256']=='172b8405bceda94e539619fdf53cfb0f3ea9cfc09042c4a32cbf95a7210102c6' and semantic==load(D/'BINDING-SEMANTIC.json'),'same semantics')
oldlaunch=load(A/'LAUNCH-SPEC-DRAFT.json');expected=dict(oldlaunch,status='ADOPTED_UNRUN_PREFLIGHT_REQUIRED',bindingSha256=sha(newraw),exactReview=new['exactReview']);expected['argv']=oldlaunch['argv'][:-1]+[sha(newraw)];require(launch==expected,'exact adopted launch diff')
require(result['changedFields']==sorted(fields) and result['newBindingSha256']==sha(newraw) and result['bindingSemanticSha256']==semanticsha,'adoption result')
for name,role in config['roles'].items():read(role['path'],role['sha256'],role['mode'])
report=load(D/'DRAFT-REPORT.json');root=pathlib.Path(new['repoRoot']);require(root==pathlib.Path(config['materializedRoot']),'exact target')
for rel,r in report['actualFiles'].items():
 b,st=read(root/rel,r['sha256'],r['mode']);require((st.st_dev,st.st_ino,st.st_nlink,len(b))==(r['device'],r['inode'],r['links'],r['bytes']),'actual identity '+rel)
source=pathlib.Path(config['roles']['witnessSourcePins']['path']).parent;sp=load(source/'SOURCE-PINS.json',exact['sourcePinsSha256'])
for n,r in sp['files'].items():b,_=read(source/n,r['sha256']);require(len(b)==r['bytes'],'source length')
node=report['actualNode'];b,st=read(node['path'],node['sha256'],node['mode']);require((st.st_dev,st.st_ino)==(node['device'],node['inode']),'Node identity')
runner=report['runner'];rp=pathlib.Path(runner['path']);require(rp.is_symlink() and os.readlink(rp)==runner['target'] and str(rp.resolve())==runner['resolved'],'runner contained link')
env=dict(os.environ,**launch['requiredEnvironment']);require(launch['requiredEnvironment']==report['launchEnvironment'],'environment exact')
proc=subprocess.run([node['path'],'-p','JSON.stringify({version:process.version,execPath:require("node:fs").realpathSync(process.execPath)})'],cwd=REPO,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30);require(proc.returncode==0 and not proc.stderr and json.loads(proc.stdout)=={'version':'v22.23.2','execPath':node['path']},'current Node version/path')
basepath=G/'evidence/after-fill-r1/SNAPSHOT.json';base=load(basepath,'641757b4399a0daa05354d5b1ea4586a1b59cfd17b8af2c8e88eb248dce1deae');require(base['immutable']==load(G/'evidence/before-fill-r1/SNAPSHOT.json','b087ec768c52328d142433555d8549e4d9e365fe4293810fe4fac5c042281a12')['immutable'],'full baseline remains authenticated')
gm=module(G/'snapshot.py','accepted_r7_guard','ed43cd95fbbc13a2194338a8fe8dd48e05a56b1b77a4cdcb377f60ea17429740');gc=load(G/'CONFIG.json','7232a61e4115f774d2e21ffd99aea707993de434fd575cc5cf8793d119610e62')
m=load(config['materializerBindingPath']);mm=module(pathlib.Path(m['materializerPath']),'accepted_r6_guard',m['materializerSha256'])
for tool in ('git','ls','lsof','xattr','du'):read(m[tool+'Path'],m[tool+'Sha256'],links=76 if tool=='git' and m['gitPath']=='/usr/bin/git' else 1)
def checkroots():
 for rec in base['immutable']['strictRoots'].values():require(gm.directory_identity(rec['path'])==rec,'strict current root '+rec['path'])
 for recs in base['immutable']['ancestry'].values():
  for rec in recs:require({k:gm.directory_identity(rec['path'])[k] for k in rec}==rec,'physical ancestry')
current=[]
for label in ('BEFORE','AFTER'):
 checkroots();facts=gm.current(gc,m,mm,root,[]);save(O/(label+'-PS.txt'),facts.pop('psRaw'));save(O/(label+'-LSOF.bin'),facts.pop('lsofRaw'));current.append(facts)
require(not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(m['recorderLockPath']),'helper idle')
lane=pathlib.Path(config['laneParent']);require(lane.resolve()==lane and stat.S_IMODE(lane.lstat().st_mode)==0o700 and list(lane.iterdir())==[],'unused lane')
refs=mm.git(m,REPO,'for-each-ref','--format=%(objectname) %(refname)','refs/heads/evidence','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').decode();remote=mm.git(m,REPO,'ls-remote','origin','refs/heads/evidence','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').decode()
facts={'schema':'1370-witness-r7-adopted-preflight-facts-r2','changedFields':sorted(fields),'adoptedBindingSha256':sha(newraw),'bindingSemanticSha256':semanticsha,'archiveFilesVerified':6,'adoptedLaunchSpecSha256':sha(read(U/'ADOPTED-LAUNCH-SPEC.json')[0]),'argv':launch['argv'],'requiredEnvironment':launch['requiredEnvironment'],'currentBefore':current[0],'currentAfter':current[1],'localHeadsCommand':'git -c gc.auto=0 -c maintenance.auto=0 for-each-ref --format=%(objectname) %(refname) refs/heads/evidence refs/heads/main refs/heads/wip/headless-program-20260916-ts','localHeadsStdout':refs,'remoteHeadsCommand':'git -c gc.auto=0 -c maintenance.auto=0 ls-remote origin refs/heads/evidence refs/heads/main refs/heads/wip/headless-program-20260916-ts','remoteHeadsStdout':remote,'fullBaselineSha256':'641757b4399a0daa05354d5b1ea4586a1b59cfd17b8af2c8e88eb248dce1deae','fullInventoryRepeated':False,'freshStrictRootMetadataEqual':True,'freshProtectedAndCopiedFdChecksPassed':True,'scope':'Parent-adopted no-detach and no external protected renamer; only declared scratch adoption outputs since authenticated full baseline. Protected full bytes/dependency inventories reused; fresh roles/files/root metadata/FD/worker/local-remote/AC/disk checks performed.','utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
factsha=dump(O/'FACTS.json',facts)
receipt={'schema':'1370-c0-aging-era-employment-witness-r7-adopted-preflight-independent-review-r2','decision':'ACCEPT_ADOPTED_PREFLIGHT_UNRUN','bindingPath':str(D/'BINDING-DRAFT.json'),'adoptedBindingSha256':sha(newraw),'bindingSemanticSha256':semanticsha,'candidatePinsSha256':exact['candidatePinsSha256'],'sourcePinsSha256':exact['sourcePinsSha256'],'productionHead':exact['productionHead'],'exactReviewSha256':exactsha,'adoptionResultSha256':sha(read(U/'ADOPTION-RESULT.json')[0]),'adoptedLaunchSpecSha256':facts['adoptedLaunchSpecSha256'],'archiveManifestSha256':sha(read(U/'ARCHIVE-MANIFEST.json')[0]),'factsSha256':factsha,'materializedRoot':str(root),'archiveByteProof':True,'changedFields':sorted(fields),'launchExecuted':False,'gameRun':False,'fullInventoryRepeated':False,'fullBaselineSha256':facts['fullBaselineSha256'],'freshClearancePassed':True,'scope':facts['scope'],'utc':facts['utc']}
print(json.dumps({'decision':receipt['decision'],'receiptPath':str(O/'RECEIPT.json'),'receiptSha256':dump(O/'RECEIPT.json',receipt),'factsSha256':factsha},sort_keys=True))
