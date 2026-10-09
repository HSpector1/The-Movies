#!/usr/bin/env python3
"""UNRUN read-only composition of accepted r6 functions. Never materialize/main.
Args: approved observed-copy receipt path SHA decision phase output-label
      [baseline SNAPSHOT.json baseline SHA [owned PGIDs CSV]]
phase: before-fill, after-fill, or postflight. Parent authorizes each actual invocation.
"""
import datetime,hashlib,importlib.util,json,os,shutil,stat,subprocess,sys,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH=Path('/Users/zacheryspector/studio-scratch')
CONFIG_SHA='7232a61e4115f774d2e21ffd99aea707993de434fd575cc5cf8793d119610e62'
EXCLUDED={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
def require(ok,msg):
 if not ok:raise RuntimeError('STOP: '+msg)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':')).encode()
def read(path):
 p=Path(path);require(p.is_absolute() and p.resolve(strict=True)==p,'physical input '+str(p))
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);require(stat.S_ISREG(a.st_mode) and a.st_nlink==1,'regular single-link input '+str(p))
  with os.fdopen(os.dup(fd),'rb') as f:raw=f.read()
  b=os.fstat(fd);require((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(b.st_dev,b.st_ino,b.st_size,b.st_mtime_ns,b.st_ctime_ns),'input changed '+str(p));return raw
 finally:os.close(fd)
def write(path,raw):
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(raw);f.flush();os.fsync(f.fileno())
def dump(path,value):write(path,(json.dumps(value,sort_keys=True,indent=2)+'\n').encode())
def command(argv,allowed=(0,)):
 p=subprocess.run(argv,cwd=REPO,env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'),stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=180)
 require(p.returncode in allowed,'command exit '+str(p.returncode)+' '+argv[0]);return p

def directory_identity(path):
 p=Path(path);require(p.resolve(strict=True)==p and p.is_dir() and not p.is_symlink(),'physical directory '+str(p));s=p.lstat()
 return {'path':str(p),'device':s.st_dev,'inode':s.st_ino,'mode':stat.S_IMODE(s.st_mode),'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}
def ancestry(path):
 result=[]
 for p in reversed([Path(path),*Path(path).parents]):
  row=directory_identity(p);result.append({k:row[k] for k in ('path','device','inode','mode')})
 return result

def current(config,binding,module,copied,owned):
 require(command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid']).stdout.decode().strip()==config['bootSessionUuid'],'boot session drift')
 old=command(['/bin/ps','-p','25951,29271','-o','pid,ppid,pgid,lstart,state,command'],allowed=(0,1));require(old.returncode==1,'old numeric PID requires identity review')
 raw=command(['/bin/ps','-axo','pid=,ppid=,pgid=,lstart=,state=,comm=,args=']).stdout
 # Preserve complete identities; a second comm/args view avoids positional lstart parsing.
 lines=command(['/bin/ps','-axo','comm=,args=']).stdout.decode().splitlines()
 markers=('fixture_worker.py','vitest','/bin/tsc','/lib/tsc.js','witness.mts','outer-recorder.py','/1370-c0-aging-era-employment-witness-source-r7/supervise.py')
 require(not any(any(marker in line for marker in markers) for line in lines),'fixture/heavy/witness worker activity')
 for pgid in owned:
  try:os.killpg(pgid,0)
  except ProcessLookupError:continue
  except PermissionError:raise RuntimeError('STOP: owned group clearance unknown '+str(pgid))
  raise RuntimeError('STOP: owned group survives '+str(pgid))
 require(not os.path.lexists(SCRATCH/'HEAVY-LANE-LOCK') and not os.path.lexists(binding['recorderLockPath']),'active heavy/copy lock')
 power=command(['/usr/bin/pmset','-g','batt']).stdout.decode();require('AC Power' in power,'AC unavailable')
 free=shutil.disk_usage(SCRATCH).free;require(free>=config['requiredFreeBytes'],'disk floor/reserve')
 for where,head in ((REPO,config['productionHead']),(copied,binding['sourceSha'])):
  require(module.git(binding,where,'rev-parse','HEAD').decode().strip()==head,'HEAD drift '+str(where))
  require(module.git(binding,where,'status','--porcelain=v1','-z','--untracked-files=all')==b'','dirty root '+str(where))
 require(module.git(binding,REPO,'rev-parse','HEAD:src').decode().strip()==config['productionSourceTree'],'production src drift')
 require(module.git(binding,REPO,'ls-remote','origin','refs/heads/wip/headless-program-20260916-ts').decode()==config['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts\n','live remote drift')
 module.assert_no_protected_writable_fds(binding)
 ephemeral=dict(binding,productionRoot=str(copied),commonGitRoot=str(copied/'.git'))
 module.assert_no_protected_writable_fds(ephemeral)
 lsof=command([binding['lsofPath'],'-n','-P','-w','-F0pftan']).stdout
 return {'bootSessionUuid':config['bootSessionUuid'],'power':power,'freeBytes':free,'oldNumericPidsAbsent':True,'relevantWorkersAbsent':True,'ownedGroupIdsChecked':owned,'ownedGroupClearanceClaim':bool(owned),'fdOriginalAndEphemeralPassed':True,'psRawSha256':sha(raw),'lsofRawSha256':sha(lsof),'psRaw':raw,'lsofRaw':lsof}

def main():
 require(sys.dont_write_bytecode and not sys.flags.optimize,'invoke Python -B without optimization')
 require(len(sys.argv) in (6,8,9),'receipt/hash/decision/phase/label plus optional baseline/hash/owned PGIDs')
 configraw=read(HERE/'CONFIG.json');require(sha(configraw)==CONFIG_SHA,'guard config drift');config=json.loads(configraw)
 phase,label=sys.argv[4:6];require(phase in ('before-fill','after-fill','postflight'),'phase');require(label and len(label)<=80 and all(c.isalnum() or c in '-_' for c in label),'output label')
 require((phase=='before-fill' and len(sys.argv)==6) or (phase!='before-fill' and len(sys.argv) in (8,9)),'baseline required only after first snapshot')
 receiptpath=Path(sys.argv[1]);copied=Path(config['copiedRoot'])
 # Lexical exclusion precedes resolve/read: caller cannot put admission inside an incomplete copied root.
 require(receiptpath.is_absolute() and str(receiptpath)!=str(copied) and not str(receiptpath).startswith(str(copied)+os.sep),'receipt must be outside copied root')
 receiptraw=read(receiptpath);require(sha(receiptraw)==sys.argv[2],'approved observed receipt bytes');receipt=json.loads(receiptraw)
 require(sys.argv[3]==config['observedDecision'] and receipt.get('decision')==config['observedDecision'],'observed copy decision')
 require(str(copied) in [receipt.get(k) for k in ('materializedRoot','scratchRoot','repoRoot','reviewedMaterializedRoot')],'observed receipt exact root')
 # EVERY copied-root read, stat, resolve and tool call is after authenticated admission above.
 procedure_role=config['procedureReviewReceipt'];require(sha(read(procedure_role['path']))==procedure_role['sha256'],'accepted fill/adoption procedure receipt drift')
 bindingraw=read(config['bindingPath']);binding=json.loads(bindingraw)
 require(binding['scratchRoot']==str(copied) and binding['productionHead']==config['productionHead'],'accepted binding root/HEAD')
 require(sha(canonical({k:v for k,v in binding.items() if k not in EXCLUDED}))==config['bindingSemanticSha256'],'accepted exact binding semantics')
 require(binding['status']=='REVIEWED_FILLED_UNRUN' and binding['executionAuthorization'] is True,'materializer not adopted')
 require(binding['sourcePinsSha256']==config['sourcePinsSha256'] and binding['sourceReviewSha256']==config['sourceReviewSha256'],'accepted r6 source roles')
 sourcepinsraw=read(binding['sourcePinsPath']);require(sha(sourcepinsraw)==config['sourcePinsSha256'],'r6 source pins drift');sourcepins=json.loads(sourcepinsraw)
 require(sha(read(binding['sourceReviewPath']))==config['sourceReviewSha256'],'r6 source review drift')
 for name,h in sourcepins['files'].items():require(sha(read(Path(binding['sourcePinsPath']).parent/name))==h,'r6 source file drift '+name)
 source=Path(binding['materializerPath']);require(sha(read(source))==config['materializerSha256']==binding['materializerSha256'],'read-only import bytes')
 for tool in ('git','ls','lsof','xattr','du'):require(sha(read(binding[tool+'Path']))==binding[tool+'Sha256'],'tool drift '+tool)
 spec=importlib.util.spec_from_file_location('accepted_r6_readonly_parent_guard',source);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 resultroot=Path(binding['outputRoot']);require(not os.path.lexists(resultroot/'SUPERVISOR-OVERRIDE-STOP.json'),'authoritative copy override STOP')
 supervisorraw=read(resultroot/'SUPERVISOR.json');workerraw=read(resultroot/'RESULT.json');supervisor=json.loads(supervisorraw);worker=json.loads(workerraw)
 require(supervisor['status']==worker['status']=='MATERIALIZED_UNREVIEWED_UNRUN' and supervisor['specSha256']==worker['specSha256']==sha(bindingraw),'actual copy status/binding')
 require(supervisor.get('workerExit')==0 and supervisor.get('timedOut') is False and supervisor.get('workerGroupClear') is True and supervisor.get('childGroupClear') is True and worker.get('childExit')==0 and worker.get('groupClear') is True,'copy actual exit/group')
 require(supervisor['recorderSha256']==sha(workerraw),'actual recorder receipt digest')
 payloadraw=read(resultroot/'child.stdout');require(worker['stdoutSha256']==sha(payloadraw),'actual materializer payload digest');payload=json.loads(payloadraw)
 require(payload['status']=='MATERIALIZED_UNREVIEWED_UNRUN' and payload['scratchRoot']==str(copied) and payload['sourceSha']==binding['sourceSha'],'materializer payload roles')
 baseline=None
 if phase!='before-fill':
  baseraw=read(Path(sys.argv[6]));require(sha(baseraw)==sys.argv[7],'approved baseline SHA');baseline=json.loads(baseraw)
  require(baseline['phase']=='before-fill' and baseline['status']=='GUARDS_ACCEPTED_READONLY' and baseline['admission']=={'path':str(receiptpath),'sha256':sys.argv[2],'decision':sys.argv[3]},'baseline admission/phase')
 owned=[]
 if len(sys.argv)==9:
  require(sys.argv[8] and all(x.isdigit() and int(x)>1 for x in sys.argv[8].split(',')),'owned PGID values');owned=sorted(set(map(int,sys.argv[8].split(','))))
 output=HERE/'evidence'/label;require(not os.path.lexists(output),'snapshot output already used');output.mkdir(mode=0o700)
 paths={'productionRoot':Path(binding['productionRoot']),'commonGitRoot':Path(binding['commonGitRoot']),'commonObjects':Path(binding['commonObjects']),'productionDependencyRoot':Path(binding['dependencyRoot']),'copiedRoot':copied,'copiedGit':copied/'.git','copiedDependencies':copied/'node_modules','scratchParent':SCRATCH}
 roots=lambda:{name:directory_identity(path) for name,path in paths.items()}
 ancestry_records={name:ancestry(path) for name,path in paths.items()}
 roots_before=roots();scratch_children_before=sorted(p.name for p in SCRATCH.iterdir());started=time.monotonic()
 facts_before=current(config,binding,module,copied,owned)
 physical=module.physical_source_paths(copied);module.assert_physical_checkout(physical,payload['sourceManifest']);require(physical==payload['physicalCheckout'],'accepted physical checkout drift')
 protected={'production':module.protected_snapshot(paths['productionRoot']),'commonGit':module.protected_snapshot(paths['commonGitRoot']),'copied':module.protected_snapshot(copied)}
 require(protected['production']==payload['protectedProductionSha256'] and protected['commonGit']==payload['protectedCommonSha256'],'accepted production/common bytes drift')
 inventory_started=time.monotonic();production_deps=module.inventory(paths['productionDependencyRoot'],binding);copied_deps=module.inventory(paths['copiedDependencies'],binding);inventory_seconds=time.monotonic()-inventory_started
 require(copied_deps==payload['dependencyManifest'],'accepted clone dependency inventory/inodes drift')
 require(module.comparable(production_deps)==module.comparable(copied_deps),'production/clone full dependency metadata drift');module.require_independent_inodes(production_deps,copied_deps)
 counts={kind:sum(row['type']==kind for row in copied_deps.values()) for kind in ('regular','directory','symlink')};require(counts=={'regular':11060,'directory':1401,'symlink':24},'dependency shape')
 allocated={'production':module.allocated_bytes(paths['productionDependencyRoot'],binding),'copied':module.allocated_bytes(paths['copiedDependencies'],binding)}
 require(allocated=={'production':payload['dependencySourceAllocated'],'copied':payload['dependencyCopiedAllocated']},'accepted dependency allocation drift')
 facts_after=current(config,binding,module,copied,owned);roots_after=roots()
 require({k:v for k,v in roots_before.items() if k!='scratchParent'}=={k:v for k,v in roots_after.items() if k!='scratchParent'},'protected root metadata changed during full snapshot')
 parent_keys=('path','device','inode','mode');require({k:roots_before['scratchParent'][k] for k in parent_keys}=={k:roots_after['scratchParent'][k] for k in parent_keys},'scratch parent physical identity drift')
 require(read(config['bindingPath'])==bindingraw and read(resultroot/'SUPERVISOR.json')==supervisorraw and read(resultroot/'RESULT.json')==workerraw and read(resultroot/'child.stdout')==payloadraw and not os.path.lexists(resultroot/'SUPERVISOR-OVERRIDE-STOP.json'),'copy admission bytes/override changed during snapshot')
 immutable={'bindingSha256':sha(bindingraw),'actualCopySupervisorSha256':sha(supervisorraw),'actualCopyResultSha256':sha(workerraw),'actualCopyPayloadSha256':sha(payloadraw),'protectedDigests':protected,'physicalCheckout':physical,'productionDependencies':production_deps,'copiedDependencies':copied_deps,'allocatedBytes':allocated,'strictRoots':{k:v for k,v in roots_after.items() if k!='scratchParent'},'ancestry':ancestry_records,'scratchParentIdentity':{k:roots_after['scratchParent'][k] for k in parent_keys}}
 if baseline is not None:require(immutable==baseline['immutable'],'full baseline byte/metadata/inode/root equality failed')
 for when,facts in (('BEFORE',facts_before),('AFTER',facts_after)):
  write(output/(when+'-PS.txt'),facts.pop('psRaw'));write(output/(when+'-LSOF.bin'),facts.pop('lsofRaw'))
 snapshot={'schema':'1370-witness-r7-parent-full-guard-snapshot-r1','status':'GUARDS_ACCEPTED_READONLY','phase':phase,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'admission':{'path':str(receiptpath),'sha256':sys.argv[2],'decision':sys.argv[3]},'configSha256':CONFIG_SHA,'snapshotProcedureSha256':sha(read(Path(__file__).resolve())),'baseline':None if baseline is None else {'path':sys.argv[6],'sha256':sys.argv[7]},'immutable':immutable,'currentBefore':facts_before,'currentAfter':facts_after,'rootsBefore':roots_before,'rootsAfter':roots_after,'scratchParentChildrenBefore':scratch_children_before,'scratchParentChildrenAfter':sorted(p.name for p in SCRATCH.iterdir()),'declaredWitnessScratchChildren':config['declaredWitnessScratchChildren'],'scratchParentPolicy':config['scratchParentPolicy'],'inventoryElapsedSeconds':inventory_seconds,'elapsedSeconds':time.monotonic()-started,'claimLimit':'Full read-only external guards only; no fill/adoption/launch/test/game. Source/adapter/exact argv and actual owned-group/frame/exit acceptance remain parent independent gates. Owned group clearance is claimed only for explicitly supplied observed PGIDs.'}
 dump(output/'SNAPSHOT.json',snapshot)
 manifest={'status':'GUARDS_ACCEPTED_READONLY','files':{p.name:sha(read(p)) for p in sorted(output.iterdir())}};dump(output/'PINS.json',manifest)
 print(json.dumps({'status':snapshot['status'],'snapshotPath':str(output/'SNAPSHOT.json'),'snapshotSha256':sha(read(output/'SNAPSHOT.json')),'pinsSha256':sha(read(output/'PINS.json')),'inventoryElapsedSeconds':inventory_seconds,'elapsedSeconds':snapshot['elapsedSeconds']},sort_keys=True))
if __name__=='__main__':main()
