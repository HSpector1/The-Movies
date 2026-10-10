import datetime,difflib,hashlib,json,os,stat,subprocess,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;R=Path('/Users/zacheryspector/The-Movies-headless-program')
G=S/'1370-c0-a208-fullguard-game-filled-after-al-20261009-r1';N=S/'1370-an-current-operational-fullguard-source-20261009-r1'
AM='7087f116cf998fd86e33fb8e004df628e0686dbd';AL='8cb704e2f18e6a635943893422c9cfdc206e106d';SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554';MAIN='c902a704eb948cc576083d0973c8c23e59937dc1'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
def putraw(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
def put(p,v):return putraw(p,(json.dumps(v,sort_keys=True,indent=2)+'\n').encode())
def git(*args):
 p=subprocess.run(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,env=dict(os.environ,GIT_OPTIONAL_LOCKS='0'),capture_output=True,timeout=30)
 assert p.returncode==0 and len(p.stdout)<8388608 and len(p.stderr)<1048576,(args,p.returncode,p.stderr.decode(errors='replace'));return p.stdout
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
assert not N.exists() and not os.path.lexists(S/'HEAVY-LANE-LOCK')
pub,p=check(S/'1370-am-checkpoint-root-finalization-20261009-r1/PUSH-READBACK.json','a7ca327d2d4610704f426630d79343722fb92c19f3762dd521221d77a567479b')
assert p['head']==AM and p['sourceTree']==SRC and p['trackedMain']==MAIN and p['workingTreeClean'] is True
assert git('rev-parse','HEAD').decode().strip()==AM and git('rev-parse','HEAD:src').decode().strip()==SRC
assert git('branch','--show-current').decode().strip()=='wip/headless-program-20260916-ts'
assert git('status','--porcelain=v1','-z','--untracked-files=all')==b''
assert git('rev-parse','refs/remotes/origin/wip/headless-program-20260916-ts').decode().strip()==AM
assert git('rev-parse','refs/remotes/origin/main').decode().strip()==MAIN
remote=git('ls-remote','origin','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').decode()
refs={line.split('\t')[1]:line.split('\t')[0] for line in remote.splitlines()};assert refs=={'refs/heads/main':MAIN,'refs/heads/wip/headless-program-20260916-ts':AM}
git('merge-base','--is-ancestor',AL,AM)
changes=git('diff','--name-only','-z',AL,AM);paths=[x.decode() for x in changes.split(b'\0') if x]
assert len(paths)==1135 and all(x=='HANDOFF.md' or x.startswith('docs/') for x in paths)
facts=put(A/'CURRENT-AM-OPERATIONAL-TRANSITION.json',{'schema':'1370-an-current-am-operational-transition/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualHead':AM,'predecessor':AL,'sourceTree':SRC,'main':MAIN,'docsOnlyVerified':True,'docsOnlyPathCount':len(paths),'docsOnlyPathsNulSha256':hashlib.sha256(changes).hexdigest(),'remoteRefsVerified':refs,'workingTreeClean':True,'publishedReadback':pub,'fullGuardsYetRun':False,'executionAuthorization':False})
oldrole,ad=check(S/'1370-am-root-continuation-20261009-r1/A208-OPERATIONAL-SCOPE-ADOPTION.json','5307f365af644cefb94f6eca5bd8188b9e4a4c2198a9ccf6b72f0671dfd32998')
ad['productionGuardHead']=AM;ad['publishedReadback']=pub;ad['remoteRefsVerified']=refs
ad['operationalTransition']={'actualHead':AM,'docsOnlyVerified':True,'docsTransitionFactsRole':facts,'predecessor':AL,'wholeProductionCommonGuardMustRefresh':True}
ad['scope']='Unchanged original A208 protection procedure rebound to actual published AM solely for fresh M0 diagnostic/type-route protection. Current full production/common baseline must be reread. Private R9 original proof and historical M0 authority remain distinct and unchanged. No M0 root metadata adoption, scientific waiver or runtime grant.'
ad['previousScopeAdoption']=oldrole
adoption=put(A/'CURRENT-AM-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json',ad)
base=role(G/'snapshot.py');assert base['sha256']=='3cd55319db6c3d5ec25a3a1df16c327ea5b8bc03ee98afcb80a5e1b2f4866992'
baseconfig,config=check(G/'CONFIG.json','20c3022895e55ad0f5e84a60014ee3416fe5b6c8f8545087e8b7d4e2b3c22b41')
config['productionHead']=AM;config['operationalRemoteRefs']=refs;config['parentScopeAdoption']={k:adoption[k] for k in ('path','sha256')};config['status']='FILLED_SOURCE_ONLY_AM_PROTECTION_SCOPE_SEPARATE_SCAN_GRANT_REQUIRED'
N.mkdir(mode=0o700)
cr=put(N/'CONFIG.json',config)
old=(G/'snapshot.py').read_bytes();needle=('CONFIG_SHA='+repr(baseconfig['sha256'])).encode();replacement=('CONFIG_SHA='+repr(cr['sha256'])).encode()
assert old.count(needle)==1;new=old.replace(needle,replacement);assert new.replace(replacement,needle)==old
nr=putraw(N/'snapshot.py',new)
putraw(N/'BASE-snapshot.py.txt',old);putraw(N/'BASE-CONFIG.json',(G/'CONFIG.json').read_bytes())
putraw(N/'forward.diff',''.join(difflib.unified_diff(old.decode().splitlines(True),new.decode().splitlines(True),fromfile='original/snapshot.py',tofile='AM/snapshot.py')).encode())
putraw(N/'inverse.diff',''.join(difflib.unified_diff(new.decode().splitlines(True),old.decode().splitlines(True),fromfile='AM/snapshot.py',tofile='original/snapshot.py')).encode())
proof=put(N/'PROOF.json',{'schema':'1370-an-fullguard-am-binding-source-proof/v1','originalSource':base,'originalConfig':baseconfig,'newSource':nr,'newConfig':cr,'sourceDelta':'Only CONFIG_SHA literal; complete inverse byte-equal. All procedure logic/180s per command/no overall deadline/guards/private inventory/cleanup/claim limit unchanged. Original docstrings contain historical A208/post-AL wording; current config and explicit root scope determine actual AM role.','configChangedKeys':[k for k in config if config[k]!=json.loads((G/'CONFIG.json').read_bytes())[k]],'currentOperationalFacts':facts,'currentOperationalScope':adoption,'runtimeOccurred':False,'executionAuthorization':False})
(N/'evidence').mkdir(mode=0o700)
files={p.name:role(p) for p in sorted(N.iterdir()) if p.is_file()}
pins=put(N/'SOURCE-PINS.json',{'schema':'1370-an-fullguard-am-binding-source-pins/v1','files':files,'executionAuthorization':False,'status':'SOURCE_ONLY_UNRUN','operationalScope':adoption,'independentReview':None,'actualGrant':None})
print(json.dumps({'sourcePins':pins,'proof':proof,'operationalFacts':facts,'operationalScope':adoption}),flush=True)
