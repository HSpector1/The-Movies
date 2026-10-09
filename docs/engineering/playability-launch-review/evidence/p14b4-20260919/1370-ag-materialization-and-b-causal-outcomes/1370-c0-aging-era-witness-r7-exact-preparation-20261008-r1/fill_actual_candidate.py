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
SOURCE=SCRATCH/'1370-c0-aging-era-employment-witness-source-r7'
CONFIG_SHA='__CONFIG_SHA__'
EXCLUDED={'status','executionAuthorization','exactReview'}
BLOBS={'src/core/aging.ts':'e1b88562ded631e0142b2783555e866d4a884d04','src/core/employment.ts':'e8e5acaa1e6a94ac1de7db13eb46840efb55616f','src/core/hollywood.ts':'377da502bcfa55afe31c243ab0909b2c0012d269','src/core/worldgen.ts':'94f83a85e1e59532013ab4735f73a67a916a5332','src/core/tick.ts':'328c2e28f7e209b4ab6b96c6e59f1d1739ad0db5','src/harness/p13a/fixtures.ts':'9ab3eee75b0b2b2733f350bbc3964aa5ba176de8','tests/bridge-p14b5-relationships.test.ts':'0815114340a983348eae6e98c33843c32c297228','tests/fixtures/p13a/accepted-v19.json.gz':'a987ecc4411c48fc8f256e81c93e9abf1fd61d6c'}
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

def main():
 require(sys.dont_write_bytecode and not sys.flags.optimize,'invoke Python -B without optimization')
 require(len(sys.argv)==4,'need approved observed receipt path/hash/decision')
 configraw,_=read(HERE/'CONFIG-PENDING.json'); require(sha(configraw)==CONFIG_SHA,'configuration drift'); config=json.loads(configraw)
 receiptpath=Path(sys.argv[1]); approvedsha=sys.argv[2]; approveddecision=sys.argv[3]
 require(approveddecision.startswith('ACCEPT_OBSERVED_') and any(x in approveddecision for x in ('MATERIALIZ','COPY')),'receipt decision must mean observed materialization/copy acceptance')
 receiptraw,_=read(receiptpath); require(sha(receiptraw)==approvedsha,'observed receipt bytes'); receipt=json.loads(receiptraw)
 require(receipt.get('decision')==approveddecision,'observed decision mismatch')
 root=Path(config['materializedRoot'])
 require(str(root) in [receipt.get(k) for k in ('materializedRoot','scratchRoot','repoRoot','reviewedMaterializedRoot')],'receipt must explicitly bind exact materialized root')
 require(receipt.get('executionAuthorization') is not True,'observed receipt is not witness launch authority')
 # Only after that gate may the completed materialized root or actual tools be read.
 require(root.resolve(strict=True)==root and root.is_dir() and not root.is_symlink(),'materialized physical root')
 mraw,_=read(config['materializerBindingPath']); materializer=json.loads(mraw)
 require(materializer['scratchRoot']==str(root) and materializer['sourceSha']=='3aaf55e0c06c4b745b0b722cc56913050b1ee229','materializer source/root roles')
 require(materializer['productionHead']==config['productionHead'],'materializer HEAD pin')
 observed_output=Path(materializer['outputRoot'])
 require(not os.path.lexists(observed_output/'SUPERVISOR-OVERRIDE-STOP.json'),'authoritative materializer override STOP')
 supervisor=json.loads(read(observed_output/'SUPERVISOR.json')[0]); worker=json.loads(read(observed_output/'RESULT.json')[0])
 require(supervisor.get('status')=='MATERIALIZED_UNREVIEWED_UNRUN' and worker.get('status')=='MATERIALIZED_UNREVIEWED_UNRUN','materializer actual result status')
 require(not os.path.lexists(materializer['recorderLockPath']) and not os.path.lexists(SCRATCH/'HEAVY-LANE-LOCK'),'copy/other lane still active')
 for name,role in config['roles'].items():
  p=Path(role['path']); require(p.is_file() and not p.is_symlink() and sha(p.read_bytes())==role['sha256'] and format(stat.S_IMODE(p.lstat().st_mode),'04o')==role['mode'],'source/adapter/tool role drift '+name)
 profile=json.loads(read(HERE/'BINDING-TEMPLATE-PENDING.json')[0]); profile.update(status='DRAFT_FILLED_UNREVIEWED_UNRUN',executionAuthorization=False,exactReview=None,repoRoot=str(root))
 sourceraw,_=read(SOURCE/'SOURCE-PINS.json'); sourcepins=json.loads(sourceraw)
 require(sha(sourceraw)=='69ca5043bb533908f722126fbc93fd59ce84f0d7388180f3b60c5074076aebc2','r7 source pins')
 for name,pin in sourcepins['files'].items():
  raw,_=read(SOURCE/name); require(pin=={'sha256':sha(raw),'bytes':len(raw)},'r7 source file '+name)
 worktree={}; files={}
 for rel,oid in BLOBS.items():
  raw,rec=read(root/rel); require(hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest()==oid,'actual historical blob '+rel); worktree[rel]=sha(raw);files[rel]=rec
 profile['worktreeSha256']=worktree; runtime={}
 for rel in RUNTIME:
  raw,rec=read(root/rel); runtime[rel]=sha(raw);files[rel]=rec
 require(runtime==materializer['runtimeFiles'],'copied runtime must match observed materializer pins')
 profile['runtimeSha256']=runtime
 require(len(profile['observerSha256'])==7 and all(profile['observerSha256'][name]==sourcepins['files'][name]['sha256'] for name in profile['observerSha256']),'seven observers exact')
 runner=root/'node_modules/.bin/vite-node'; require(runner.is_symlink() and os.readlink(runner)=='../vite-node/vite-node.mjs','vite-node runner link')
 runner_resolved=runner.resolve(strict=True); require(runner_resolved==root/'node_modules/vite-node/vite-node.mjs','contained runner target')
 node=Path(materializer['nodePath']); node_role=executable(node);require(node_role['sha256']==materializer['nodeSha256'],'bound materializer Node executable')
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
 remote=command(git+['ls-remote','origin','refs/heads/wip/headless-program-20260916-ts'],REPO,launch_env).decode();require(remote==config['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts\n','live remote HEAD')
 require(b"AC Power" in command(['/usr/bin/pmset','-g','batt'],REPO),'AC unavailable')
 require(shutil.disk_usage(SCRATCH).free>=3*1024**3+128*1024**2,'fresh floor/reserve')
 candidate=Path(config['candidatePath']);lane=Path(config['laneParent']); log=Path(config['laneLog'])
 require(candidate.parent==SCRATCH and lane.parent==SCRATCH and not os.path.lexists(candidate) and not os.path.lexists(lane),'candidate/lane one-shot paths already used')
 candidate.mkdir(mode=0o700);lane.mkdir(mode=0o700)
 binding_sha=dump(candidate/'BINDING-DRAFT.json',profile);semantic={k:v for k,v in profile.items() if k not in EXCLUDED}; semantic_sha=sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode());dump(candidate/'BINDING-SEMANTIC.json',semantic)
 report={'schema':'1370-r7-exact-draft-report-r1','status':'DRAFT_FILLED_UNREVIEWED_UNRUN','launchAuthorized':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'productionHead':config['productionHead'],'productionSourceTree':config['productionSourceTree'],'historicalRoot':str(root),'materializationReceipt':{'path':str(receiptpath),'sha256':approvedsha,'decision':approveddecision},'materializerBindingSha256':sha(mraw),'sourcePinsSha256':sha(sourceraw),'sourceReviewReceipt':profile['independentSourceReviewReceipt'],'adapterControlsReceipt':config['roles']['adapterSourceControlsReceipt'],'roles':config['roles'],'actualFiles':files,'actualNode':node_role,'runner':{'path':str(runner),'target':os.readlink(runner),'resolved':str(runner_resolved),'sha256':runtime['node_modules/vite-node/vite-node.mjs']},'launchEnvironment':{'PATH':selected_path,'PYTHONDONTWRITEBYTECODE':'1'},'freeBytesAtFill':shutil.disk_usage(SCRATCH).free,'claimLimit':'Exact unlaunchable fill only. Parent must fresh-check full physical/dependency/protected roots/FDs/old workers/no-detach/disk/lane guards and independently review exact binding/adoption/argv. No fixture/witness/sandbox/game test ran.'}
 dump(candidate/'DRAFT-REPORT.json',report)
 pins={'schema':'1370-r7-exact-candidate-pins-r1','status':'DRAFT_FILLED_UNREVIEWED_UNRUN','executionAuthorization':False,'bindingSemanticSha256':semantic_sha,'draftBindingSha256':binding_sha,'files':{p.name:sha(p.read_bytes()) for p in sorted(candidate.iterdir())},'materializationReceipt':report['materializationReceipt'],'sourcePinsSha256':sha(sourceraw)}
 candidate_sha=dump(candidate/'CANDIDATE-PINS.json',pins)
 launch=json.loads(read(HERE/'LAUNCH-SPEC-TEMPLATE.json')[0]);launch.update(status='DRAFT_EXACT_REVIEW_PENDING_UNRUN',bindingSha256=binding_sha,bindingSemanticSha256=semantic_sha,candidatePinsSha256=candidate_sha,observedMaterializationReceipt=report['materializationReceipt'],requiredEnvironment=report['launchEnvironment'])
 launch['argv'][-1]=binding_sha;dump(candidate/'LAUNCH-SPEC-DRAFT.json',launch)
 directory_fd=os.open(candidate,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:os.fsync(directory_fd)
 finally:os.close(directory_fd)
 print(json.dumps({'status':'DRAFT_FILLED_UNREVIEWED_UNRUN','candidatePath':str(candidate),'bindingSha256':binding_sha,'bindingSemanticSha256':semantic_sha,'candidatePinsSha256':candidate_sha,'launchAuthorized':False},sort_keys=True))
if __name__=='__main__':main()
