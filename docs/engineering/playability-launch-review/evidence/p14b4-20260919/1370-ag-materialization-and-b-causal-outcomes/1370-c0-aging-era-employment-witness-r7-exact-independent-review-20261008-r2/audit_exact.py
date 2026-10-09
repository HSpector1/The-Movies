import hashlib,json,os,stat,sys,datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
D=S/'1370-c0-aging-era-employment-witness-r7-exact-draft-20261008-r2'
P=S/'1370-c0-aging-era-witness-r7-exact-preparation-20261008-r2'
G=S/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2'
O=Path(__file__).parent
def require(v,m):
 if not v:raise RuntimeError(m)
def digest(b):return hashlib.sha256(b).hexdigest()
def read(p,sha=None,mode=None):
 p=Path(p);require(p.is_absolute() and p.resolve(strict=True)==p,'physical '+str(p))
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);require(stat.S_ISREG(a.st_mode) and a.st_nlink==1,'single regular '+str(p))
  with os.fdopen(os.dup(fd),'rb') as f:b=f.read()
  z=os.fstat(fd);require((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'unstable '+str(p))
  h=digest(b);require(sha is None or h==sha,'hash '+str(p));require(mode is None or format(stat.S_IMODE(a.st_mode),'04o')==mode,'mode '+str(p))
  return b,{'path':str(p),'sha256':h,'device':a.st_dev,'inode':a.st_ino,'bytes':len(b),'mode':format(stat.S_IMODE(a.st_mode),'04o'),'links':a.st_nlink}
 finally:os.close(fd)
def load(p,sha=None,mode=None):return json.loads(read(p,sha,mode)[0])
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':')).encode()
def dump(p,v):
 b=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode();fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return digest(b)
require(sys.dont_write_bytecode and not sys.flags.optimize,'-B required')
identity=load(D/'DRAFT-IDENTITY.json','0794238e0b059835fe6086f3d096c993ca81890e21bd8b9a5aa39846f691de75','0600')
require(set(p.name for p in D.iterdir())==set(identity['files'])|{'DRAFT-IDENTITY.json'},'six exact files')
require(identity['draftPath']==str(D) and identity['bindingPath']==str(D/'BINDING-DRAFT.json'),'identity paths')
for name,h in identity['files'].items():read(D/name,h,'0600')
require(stat.S_IMODE(D.stat().st_mode)==0o700,'private draft')
binding=load(D/'BINDING-DRAFT.json');report=load(D/'DRAFT-REPORT.json');launch=load(D/'LAUNCH-SPEC-DRAFT.json');pins=load(D/'CANDIDATE-PINS.json')
require(binding['status']=='DRAFT_FILLED_UNREVIEWED_UNRUN' and binding['executionAuthorization'] is False and binding['exactReview'] is None,'unauthorized draft')
semantic={k:v for k,v in binding.items() if k not in {'status','executionAuthorization','exactReview'}}
require(semantic==load(D/'BINDING-SEMANTIC.json') and digest(canonical(semantic))==identity['bindingSemanticSha256'],'three-field semantics')
require(identity['candidatePinsSha256']==digest(read(D/'CANDIDATE-PINS.json')[0]),'candidate pins')
for name,h in pins['files'].items():read(D/name,h,'0600')
preppins=load(P/'PREPARATION-PINS.json','bd5ed8745b5ebcbdc33f4b90230cfe983456f09eaf8c8b03114c95507cf89bd0')
for name,h in preppins['files'].items():read(P/name,h)
config=load(P/'CONFIG-PENDING.json');require(report['roles']==config['roles']==launch['roles'],'roles equal')
verified={}
for name,role in config['roles'].items():verified[name]=read(role['path'],role['sha256'],role['mode'])[1]
root=Path(binding['repoRoot']);require(root==Path(config['materializedRoot']) and binding['sourceSha']=='3aaf55e0c06c4b745b0b722cc56913050b1ee229','historical role')
st=root.lstat();r=report['rootIdentity'];require(stat.S_ISDIR(st.st_mode) and root.resolve()==root and (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'),st.st_mtime_ns,st.st_ctime_ns)==(r['device'],r['inode'],r['mode'],r['mtimeNs'],r['ctimeNs']),'root identity')
require(set(report['actualFiles'])==set(binding['worktreeSha256'])|set(binding['runtimeSha256']) and len(report['actualFiles'])==13,'actual 8+5')
actual={}
for rel,rec in report['actualFiles'].items():
 require(rec['path']==str(root/rel),'actual path')
 raw,now=read(root/rel,rec['sha256'],rec['mode']);require(now==rec,'actual identity '+rel)
 require(rec['sha256']==(binding['worktreeSha256']|binding['runtimeSha256'])[rel],'binding actual bytes '+rel);actual[rel]=now
source=Path(config['roles']['witnessSourcePins']['path']).parent;sp=load(source/'SOURCE-PINS.json',identity['sourcePinsSha256'])
for name,rec in sp['files'].items():
 raw,_=read(source/name,rec['sha256']);require(len(raw)==rec['bytes'],'source length')
require(len(binding['observerSha256'])==7 and all(sp['files'][n]['sha256']==h for n,h in binding['observerSha256'].items()),'seven observers')
node=report['actualNode'];raw,now=read(node['path'],node['sha256'],node['mode']);require(all(now[k]==node[k] for k in node),'Node identity');require(binding['nodeExecPath']==node['path'] and binding['nodeVersion']=='v22.23.2','Node version/path role')
runner=report['runner'];rp=Path(runner['path']);require(rp.is_symlink() and os.readlink(rp)==runner['target'] and str(rp.resolve())==runner['resolved'],'runner link');read(rp.resolve(),runner['sha256'],'0755')
require(launch['requiredEnvironment']==report['launchEnvironment'] and report['launchEnvironment']=={'PATH':str(Path(node['path']).parent)+':/usr/bin:/bin:/usr/sbin:/sbin','PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'launch environment')
require(launch['argv']==['/bin/bash',config['roles']['acceptedLaneHelper']['path'],'0',config['laneLog'],'/bin/bash',config['roles']['pipeAdapter']['path'],str(D/'BINDING-DRAFT.json'),identity['draftBindingSha256']],'exact argv')
require(launch['bounds']=={'innerSeconds':720,'activeStopSeconds':742,'wholeRecorderSeconds':750,'stdoutFrameBytes':524288,'preimageBytes':262144,'stderrBytes':65536,'sinkReadSeconds':760,'sinkForwardSeconds':10},'bounds')
require(launch['launchAuthorized'] is False and launch['exactReview'] is None,'launch unadopted')
require(report['productionHead']==identity['productionHead']==config['productionHead']==launch['productionHead']=='4812bb123781632dd39e44f918eb85a6a2c12623','production frozen HEAD')
require(report['productionSourceTree']==config['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','production source role')
material=report['materializationReceipt'];mr=load(material['path'],material['sha256']);require(mr['decision']==material['decision']=='ACCEPT_OBSERVED_MATERIALIZATION_COPY' and mr['materializedRoot']==str(root),'copy admission')
for k in ['archivePath','adoptionOutputPath']:require(not os.path.lexists(config[k]),'reserved absent '+k)
lane=Path(config['laneParent']);require(lane.resolve()==lane and stat.S_IMODE(lane.stat().st_mode)==0o700 and list(lane.iterdir())==[],'private empty lane')
proc=G/'CONFIG.json';gc=load(proc);pr=load(gc['procedureReviewReceipt']['path'],gc['procedureReviewReceipt']['sha256']);require(pr['fillProcedureSha256']==preppins['files']['fill_actual_candidate.py'] and pr['adoptionProcedureSha256']==preppins['files']['adopt_reviewed_candidate.py'],'procedure accepted bytes')
gr=load(S/'1370-c0-aging-era-witness-r7-parent-guard-independent-source-review-20261008-r2/RECEIPT.json','2c7acfc9f585a67962949f2f6a4ad2769110f78f03afb97547249f34c808747d');gp=load(G/'PREPARATION-PINS.json',gr['preparationPinsSha256'])
for name,h in gp['files'].items():read(G/name,h)
require(gr['snapshotProcedureSha256']==gp['files']['snapshot.py'] and gr['configSha256']==digest(read(proc)[0]),'guard source/config identity')
basepath=G/'evidence/before-fill-r1/SNAPSHOT.json';base=load(basepath,'b087ec768c52328d142433555d8549e4d9e365fe4293810fe4fac5c042281a12');require(base['status']=='GUARDS_ACCEPTED_READONLY' and base['phase']=='before-fill' and base['baseline'] is None and base['snapshotProcedureSha256']==gp['files']['snapshot.py'],'baseline identity')
facts={'status':'EXACT_STATIC_CHECKS_PASSED_FINAL_GUARD_PENDING','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'candidateIdentity':identity,'configuredRoles':verified,'actualFiles':actual,'nodeIdentity':now,'semanticExcludedOnly':['status','executionAuthorization','exactReview'],'adoptionProcedureSha256':preppins['files']['adopt_reviewed_candidate.py'],'fillProcedureSha256':preppins['files']['fill_actual_candidate.py'],'beforeFillSnapshotSha256':digest(read(basepath)[0]),'guardSourceReviewSha256':digest(read(S/'1370-c0-aging-era-witness-r7-parent-guard-independent-source-review-20261008-r2/RECEIPT.json')[0]),'executionAuthorization':False,'sourceTestsRun':False,'gameRun':False,'fullInventoryRepeated':False}
print(json.dumps({'factsSha256':dump(O/'EXACT-FACTS.json',facts),'status':facts['status'],'files':13,'observers':7,'sourceFiles':len(sp['files']),'roles':len(verified)},sort_keys=True))
