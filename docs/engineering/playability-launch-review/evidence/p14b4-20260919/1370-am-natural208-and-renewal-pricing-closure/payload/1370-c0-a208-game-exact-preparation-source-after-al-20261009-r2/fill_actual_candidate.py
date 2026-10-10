#!/usr/bin/env python3
"""UNRUN preparation. Only call after parent reports observed copy acceptance.
Args: accepted observed receipt absolute path, approved SHA256, exact decision.
Creates an unauthorized exact r7 candidate; never launches/adopts the witness.
"""
import datetime, hashlib, json, os, shutil, stat, subprocess, sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH=Path('/Users/zacheryspector/studio-scratch')
SOURCE=SCRATCH/'1370-c0-aging-era-settlement208-observer-after-aj-proposal-20261009-r1'
CONFIG_SHA='6a17aef0f43cea9c5c480952ef12a69be3d1ee1b1d562166b4968198c5f1e6d4'
EXCLUDED={'status','executionAuthorization','exactReview'}
BLOBS={'src/core/talentMarket.ts':'f036fcec9191374dc5554c5cdc33372b53cd7926','src/core/talentSummary.ts':'f8e8539d3c0f780e58027640de333d6168db7654','src/core/tuning.ts':'c4fc34447aff0eefd6ea52f34b798a1bfa2fabc9','src/core/aging.ts':'e1b88562ded631e0142b2783555e866d4a884d04','src/core/employment.ts':'e8e5acaa1e6a94ac1de7db13eb46840efb55616f','src/core/hollywood.ts':'377da502bcfa55afe31c243ab0909b2c0012d269','src/core/worldgen.ts':'94f83a85e1e59532013ab4735f73a67a916a5332','src/core/tick.ts':'328c2e28f7e209b4ab6b96c6e59f1d1739ad0db5','src/harness/p13a/fixtures.ts':'9ab3eee75b0b2b2733f350bbc3964aa5ba176de8','tests/bridge-p14b5-relationships.test.ts':'0815114340a983348eae6e98c33843c32c297228','tests/fixtures/p13a/accepted-v19.json.gz':'a987ecc4411c48fc8f256e81c93e9abf1fd61d6c'}
RUNTIME=('package.json','package-lock.json','node_modules/vite/package.json','node_modules/vite-node/package.json','node_modules/vite-node/vite-node.mjs')
def require(ok,msg):
 if not ok: raise RuntimeError('STOP: '+msg)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def read(path):
 p=Path(path); require(p.is_absolute() and p.resolve(strict=True)==p,'physical input path '+str(p))
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  before=os.fstat(fd); require(stat.S_ISREG(before.st_mode) and before.st_nlink==1,'regular/nlink input '+str(p))
  with os.fdopen(os.dup(fd),'rb') as f:raw=f.read()
  after=os.fstat(fd); require((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns),'input changed '+str(p))
  return raw,{'path':str(p),'sha256':sha(raw),'bytes':len(raw),'device':before.st_dev,'inode':before.st_ino,'mode':format(stat.S_IMODE(before.st_mode),'04o'),'links':before.st_nlink}
 finally:os.close(fd)
def executable(path):
 p=Path(path); require(p.resolve(strict=True)==p and p.is_file() and not p.is_symlink() and os.access(p,os.X_OK),'executable path '+str(p)); st=p.lstat()
 return {'path':str(p),'sha256':sha(p.read_bytes()),'device':st.st_dev,'inode':st.st_ino,'mode':format(stat.S_IMODE(st.st_mode),'04o')}
def dump(path,value):
 raw=(json.dumps(value,sort_keys=True,indent=2)+'\n').encode()
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
 return sha(raw)
def command(argv,cwd,env=None):
 p=subprocess.run(argv,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30)
 require(p.returncode==0,'command failed '+str(argv)); return p.stdout

def current_operational_roles(config, adopting=False):
 # Exact actual roles filled in a fresh independently reviewed config; scope is design only.
 for key in ('actualOperationalRuntimeAuthority','actualGuardBaseline'):
  require(isinstance(config.get(key),dict),'current AL observed protection role pending '+key)
 require(isinstance(config.get('actualOperationalRuntimeAuthorityExpectedStatus'),str),'actual protection status pending')
 require(config['actualOperationalRuntimeAuthority']!=config['sourceScopeAdoption'],'source-only scope is not observed protection authority')
 names=['publishedReadback','sourceScopeAdoption','actualOperationalRuntimeAuthority','actualGuardBaseline']
 if adopting:
  require(isinstance(config.get('actualGuardAfterFill'),dict),'current AL after-fill protection pending');names.append('actualGuardAfterFill')
 values={}
 for key in names:
  expected=config[key];raw,_=read(expected['path']);require(sha(raw)==expected['sha256'] and len(raw)==expected['bytes'],'exact current operational role '+key);values[key]=json.loads(raw)
 publication=values['publishedReadback'];scope=values['sourceScopeAdoption'];authority=values['actualOperationalRuntimeAuthority']
 require(publication['status']=='PUSHED_REMOTE_AND_COMMITTED_TREE_VERIFIED' and publication['head']==publication['trackingWorkingHead']==config['productionHead'] and publication['sourceTree']==config['productionSourceTree'] and publication['workingTreeClean'] is True and publication['docsOnlyTransitionVerified'] is True,'current published AL role')
 require(scope['status']=='PARENT_ADOPTED_A208_OPERATIONAL_GUARD_SCOPE_ONLY' and scope['productionGuardHead']==config['productionHead'] and scope['productionSourceTree']==config['productionSourceTree'] and scope['executionAuthorization'] is False and scope['combinedHFirstRouteUnchanged'] is True and scope['H8708Waived'] is False and scope['operationalTransition']['actualHead']==config['productionHead'] and scope['operationalTransition']['docsOnlyVerified'] is True and scope['remoteRefsVerified']==config['operationalRemoteRefs'],'truthful current source-only scope')
 require(authority['status']==config['actualOperationalRuntimeAuthorityExpectedStatus'] and authority['status']!=scope['status'],'exact observed protection authority status')
 return values

def main():
 require(sys.dont_write_bytecode and not sys.flags.optimize,'invoke Python -B without optimization')
 require(len(sys.argv)==4,'need approved observed receipt path/hash/decision')
 configraw,_=read(HERE/'CONFIG-PENDING.json'); require(sha(configraw)==CONFIG_SHA,'configuration drift'); config=json.loads(configraw)
 current_operational_roles(config)
 receiptpath=Path(sys.argv[1]); approvedsha=sys.argv[2]; approveddecision=sys.argv[3]
 require(approveddecision.startswith('ACCEPT_OBSERVED_') and any(x in approveddecision for x in ('MATERIALIZ','COPY')),'receipt decision must mean observed materialization/copy acceptance')
 receiptraw,_=read(receiptpath); require(sha(receiptraw)==approvedsha,'observed receipt bytes'); receipt=json.loads(receiptraw)
 require(receipt.get('decision')==approveddecision,'observed decision mismatch')
 root=Path(config['materializedRoot'])
 require(str(root) in [receipt.get(k) for k in ('materializedRoot','scratchRoot','repoRoot','reviewedMaterializedRoot')],'receipt must explicitly bind exact materialized root')
 require(receipt.get('executionAuthorization') is not True,'observed receipt is not witness launch authority')
 # Only after that gate may the completed materialized root or actual tools be read.
 require(root.resolve(strict=True)==root and root.is_dir() and not root.is_symlink(),'materialized physical root')
 root_before=root.stat();root_identity={'path':str(root),'device':root_before.st_dev,'inode':root_before.st_ino,'mode':format(stat.S_IMODE(root_before.st_mode),'04o'),'mtimeNs':root_before.st_mtime_ns,'ctimeNs':root_before.st_ctime_ns}
 mraw,_=read(config['materializerBindingPath']); materializer=json.loads(mraw)
 require(materializer['scratchRoot']==str(root) and materializer['sourceSha']=='3aaf55e0c06c4b745b0b722cc56913050b1ee229','materializer source/root roles')
 require(materializer['productionHead']==config['materializerProductionHead'],'immutable historical materializer HEAD pin')
 require(materializer['sourcePinsSha256']==config['materializerSourcePinsSha256'],'accepted r6 source pin')
 excluded={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
 require(sha(json.dumps({k:v for k,v in materializer.items() if k not in excluded},sort_keys=True,separators=(',',':')).encode())==config['materializerSemanticSha256'],'exact r6 semantic identity')
 require(materializer['status']=='REVIEWED_FILLED_UNRUN' and materializer['executionAuthorization'] is True,'materializer was not adopted')
 observed_output=Path(materializer['outputRoot'])
 require(not os.path.lexists(observed_output/'SUPERVISOR-OVERRIDE-STOP.json'),'authoritative materializer override STOP')
 supervisor=json.loads(read(observed_output/'SUPERVISOR.json')[0]); worker=json.loads(read(observed_output/'RESULT.json')[0])
 require(supervisor.get('status')=='MATERIALIZED_UNREVIEWED_UNRUN' and worker.get('status')=='MATERIALIZED_UNREVIEWED_UNRUN','materializer actual result status')
 require(supervisor.get('specSha256')==sha(mraw) and worker.get('specSha256')==sha(mraw),'materializer observed binding bytes')
 require(supervisor.get('workerExit')==0 and supervisor.get('timedOut') is False and supervisor.get('workerGroupClear') is True and supervisor.get('childGroupClear') is True and worker.get('groupClear') is True,'actual copy exit/group clearance')
 require(supervisor.get('recorderSha256')==sha(read(observed_output/'RESULT.json')[0]) and worker.get('scratchRoot')==str(root),'copy result byte/root identity')
 require(not os.path.lexists(materializer['recorderLockPath']) and not os.path.lexists(SCRATCH/'HEAVY-LANE-LOCK'),'copy/other lane still active')
 for name,role in config['roles'].items():
  p=Path(role['path']); require(p.is_file() and not p.is_symlink() and sha(p.read_bytes())==role['sha256'] and format(stat.S_IMODE(p.lstat().st_mode),'04o')==role['mode'],'source/adapter/tool role drift '+name)
 profile_raw,_=read(HERE/'BINDING-TEMPLATE-PENDING.json'); require(sha(profile_raw)==config['bindingTemplateSha256'],'binding template drift'); profile=json.loads(profile_raw); profile.update(status='DRAFT_FILLED_UNREVIEWED_UNRUN',executionAuthorization=False,exactReview=None,repoRoot=str(root),productionHeadAtPreparation=config['productionHead'],operationalRuntimeAuthority=config['actualOperationalRuntimeAuthority'])
 sourceraw,_=read(SOURCE/'SOURCE-PINS.json'); sourcepins=json.loads(sourceraw)
 require(sha(sourceraw)=='3452218ceabf6bb63f690db2eff3f83edda56db71c5826982a92ae0c73085aaf','frozen18 A208 source pins')
 for name,pin in sourcepins['files'].items():
  raw,_=read(SOURCE/name); require(pin=={'sha256':sha(raw),'bytes':len(raw)},'r7 source file '+name)
 worktree={}; files={}
 for rel,oid in BLOBS.items():
  raw,rec=read(root/rel); require(rec['mode']=='0644','physical historical source mode '+rel); require(hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest()==oid,'actual historical blob '+rel); worktree[rel]=sha(raw);files[rel]=rec
 profile['worktreeSha256']=worktree; runtime={}
 for rel in RUNTIME:
  raw,rec=read(root/rel); runtime[rel]=sha(raw);files[rel]=rec
 require(runtime==materializer['runtimeFiles'],'copied runtime must match observed materializer pins')
 profile['runtimeSha256']=runtime
 require(len(profile['observerSha256'])==8 and all(profile['observerSha256'][name]==sourcepins['files'][name]['sha256'] for name in profile['observerSha256']),'seven observers exact')
 runner=root/'node_modules/.bin/vite-node'; require(runner.is_symlink() and os.readlink(runner)=='../vite-node/vite-node.mjs','vite-node runner link')
 runner_resolved=runner.resolve(strict=True); require(runner_resolved==root/'node_modules/vite-node/vite-node.mjs','contained runner target')
 node=Path(profile['nodeExecPath']); node_role=executable(node);require(node_role['sha256']=='0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6','accepted physical Node22 executable')
 selected_path=str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin'
 launch_env=dict(os.environ,PATH=selected_path,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0')
 require(Path(shutil.which('node',path=selected_path)).resolve(strict=True)==node,'actual env-node shebang selection')
 facts=json.loads(command([str(node),'-p','JSON.stringify({version:process.version,execPath:require("node:fs").realpathSync(process.execPath)})'],REPO,launch_env))
 require(facts=={'version':'v22.23.2','execPath':str(node)},'actual Node version/path');profile['nodeVersion']=facts['version'];profile['nodeExecPath']=facts['execPath']
 # Read-only Git identity/status: no fetch/maintenance or optional index writes.
 git=[materializer['gitPath'],'-c','gc.auto=0','-c','maintenance.auto=0']
 require(command(git+['rev-parse','HEAD'],root,launch_env).decode().strip()==profile['sourceSha'],'historical checkout HEAD')
 require(command(git+['status','--porcelain=v1','-z','--untracked-files=all'],root,launch_env)==b'','historical checkout clean')
 require(command(git+['rev-parse','HEAD'],REPO,launch_env).decode().strip()==config['productionHead'],'production HEAD')
 require(command(git+['rev-parse','HEAD:src'],REPO,launch_env).decode().strip()==config['productionSourceTree'],'production src')
 require(command(git+['status','--porcelain=v1','-z','--untracked-files=all'],REPO,launch_env)==b'','production clean')
 remote=command(git+['ls-remote','origin','refs/heads/wip/headless-program-20260916-ts','refs/heads/main'],REPO,launch_env).decode();require(remote==''.join(config['operationalRemoteRefs'][key]+'\t'+key+'\n' for key in sorted(config['operationalRemoteRefs'])),'live current AL refs')
 require(b"AC Power" in command(['/usr/bin/pmset','-g','batt'],REPO),'AC unavailable')
 require(command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid'],REPO).decode().strip()==config['bootSessionUuid'],'boot session identity drift')
 oldpid=subprocess.run(['/bin/ps','-p','25951,29271','-o','pid='],cwd=REPO,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30);require(oldpid.returncode==1 and oldpid.stdout==b'','old numeric PID requires identity review')
 require(not any('fixture_worker.py' in line or (line.split() and line.split()[0].endswith('node') and ('vitest' in line or '/bin/tsc' in line or '/lib/tsc.js' in line)) for line in command(['/bin/ps','-axo','comm=,args='],REPO).decode().splitlines()),'fixture/heavy activity')
 import importlib.util
 materializer_source=Path(materializer['materializerPath']);require(sha(read(materializer_source)[0])==materializer['materializerSha256'],'materializer guard drift')
 spec=importlib.util.spec_from_file_location('r6_witness_fill_guard',materializer_source);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.assert_no_protected_writable_fds(materializer)
 require(shutil.disk_usage(SCRATCH).free>=3*1024**3+128*1024**2,'fresh floor/reserve')
 root_after=root.stat();require((root_after.st_dev,root_after.st_ino,root_after.st_mode,root_after.st_mtime_ns,root_after.st_ctime_ns)==(root_before.st_dev,root_before.st_ino,root_before.st_mode,root_before.st_mtime_ns,root_before.st_ctime_ns),'copied root metadata changed during fill')
 candidate=Path(config['candidatePath']);lane=Path(config['laneParent']); log=Path(config['laneLog'])
 require(candidate.parent==SCRATCH and lane.parent==SCRATCH and not os.path.lexists(candidate) and not os.path.lexists(lane),'candidate/lane one-shot paths already used')
 require(not os.path.lexists(config['archivePath']) and not os.path.lexists(config['adoptionOutputPath']),'archive/adoption one-shot paths used')
 candidate.mkdir(mode=0o700);lane.mkdir(mode=0o700)
 binding_sha=dump(candidate/'BINDING-DRAFT.json',profile);semantic={k:v for k,v in profile.items() if k not in EXCLUDED}; semantic_sha=sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode());dump(candidate/'BINDING-SEMANTIC.json',semantic)
 report={'schema':'1370-r7-exact-draft-report-r1','status':'DRAFT_FILLED_UNREVIEWED_UNRUN','launchAuthorized':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'productionHead':config['productionHead'],'productionSourceTree':config['productionSourceTree'],'historicalRoot':str(root),'rootIdentity':root_identity,'materializationReceipt':{'path':str(receiptpath),'sha256':approvedsha,'decision':approveddecision},'materializerBindingSha256':sha(mraw),'materializerActualSupervisorSha256':sha(read(observed_output/'SUPERVISOR.json')[0]),'materializerActualResultSha256':sha(read(observed_output/'RESULT.json')[0]),'bootSessionUuid':config['bootSessionUuid'],'sourcePinsSha256':sha(sourceraw),'sourceReviewReceipt':profile['independentSourceReviewReceipt'],'adapterControlsReceipt':config['roles']['adapterSourceControlsReceipt'],'roles':config['roles'],'actualFiles':files,'actualNode':node_role,'runner':{'path':str(runner),'target':os.readlink(runner),'resolved':str(runner_resolved),'sha256':runtime['node_modules/vite-node/vite-node.mjs']},'launchEnvironment':{'PATH':selected_path,'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'freeBytesAtFill':shutil.disk_usage(SCRATCH).free,'claimLimit':'Exact unlaunchable fill only. Parent must fresh-check full physical/dependency/protected roots/FDs/old workers/no-detach/disk/lane guards and independently review exact binding/adoption/argv. No fixture/witness/sandbox/game test ran.'}
 dump(candidate/'DRAFT-REPORT.json',report)
 pins={'schema':'1370-r7-exact-candidate-pins-r1','status':'DRAFT_FILLED_UNREVIEWED_UNRUN','executionAuthorization':False,'bindingSemanticSha256':semantic_sha,'draftBindingSha256':binding_sha,'files':{p.name:sha(p.read_bytes()) for p in sorted(candidate.iterdir())},'materializationReceipt':report['materializationReceipt'],'sourcePinsSha256':sha(sourceraw)}
 candidate_sha=dump(candidate/'CANDIDATE-PINS.json',pins)
 launch_raw,_=read(HERE/'LAUNCH-SPEC-TEMPLATE.json');require(sha(launch_raw)==config['launchTemplateSha256'],'launch template drift');launch=json.loads(launch_raw);launch.update(status='DRAFT_EXACT_REVIEW_PENDING_UNRUN',bindingSha256=binding_sha,bindingSemanticSha256=semantic_sha,candidatePinsSha256=candidate_sha,observedMaterializationReceipt=report['materializationReceipt'],requiredEnvironment=report['launchEnvironment'])
 launch['argv'][-1]=binding_sha;dump(candidate/'LAUNCH-SPEC-DRAFT.json',launch)
 identity={'schema':'1370-witness-r7-filled-draft-identity-r2','status':'DRAFT_FILLED_UNREVIEWED_UNRUN','launchAuthorized':False,'draftPath':str(candidate),'bindingPath':str(candidate/'BINDING-DRAFT.json'),'draftBindingSha256':binding_sha,'bindingSemanticSha256':semantic_sha,'candidatePinsSha256':candidate_sha,'productionHead':config['productionHead'],'sourcePinsSha256':sha(sourceraw),'files':{p.name:sha(p.read_bytes()) for p in sorted(candidate.iterdir())}}
 identity_sha=dump(candidate/'DRAFT-IDENTITY.json',identity)
 directory_fd=os.open(candidate,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:os.fsync(directory_fd)
 finally:os.close(directory_fd)
 print(json.dumps({'status':'DRAFT_FILLED_UNREVIEWED_UNRUN','candidatePath':str(candidate),'bindingSha256':binding_sha,'bindingSemanticSha256':semantic_sha,'candidatePinsSha256':candidate_sha,'draftIdentitySha256':identity_sha,'launchAuthorized':False},sort_keys=True))
if __name__=='__main__':main()
