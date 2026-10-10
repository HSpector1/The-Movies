import datetime,hashlib,json,subprocess
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
R=Path('/Users/zacheryspector/The-Movies-headless-program')
HEAD='f2f97c622db7f5332164b790d1646355e89c00f4';PREV='0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4';SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554';MAIN='c902a704eb948cc576083d0973c8c23e59937dc1'
def role(p,h=None):
 b=p.read_bytes();r={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if h: assert r['sha256']==h
 return r
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
 return role(p)
def git(*args):return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R)
pub=role(S/'1370-ao-checkpoint-root-finalization-20261010-r1/PUSH-READBACK.json','cf85cbd810e72613609e0cf3c33f42e84724d282da2c4e383ee8452643e5a74c')
assert git('rev-parse','HEAD').decode().strip()==HEAD and git('rev-parse','HEAD:src').decode().strip()==SRC
assert git('rev-parse','HEAD^').decode().strip()==PREV
assert not git('status','--porcelain=v1','-z','--untracked-files=all')
assert not (S/'HEAVY-LANE-LOCK').exists()
remote={line.split('\t')[1]:line.split('\t')[0] for line in git('ls-remote','origin','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').decode().splitlines()}
assert remote=={'refs/heads/main':MAIN,'refs/heads/wip/headless-program-20260916-ts':HEAD}
changed=git('diff','--name-only','-z',PREV,HEAD);paths=[p.decode() for p in changed.split(b'\0') if p]
assert len(paths)==463 and all(p=='HANDOFF.md' or p.startswith('docs/') for p in paths)
facts=put(A/'CURRENT-AO-OPERATIONAL-TRANSITION.json',{'schema':'1370-ap-current-ao-operational-transition/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualHead':HEAD,'predecessor':PREV,'sourceTree':SRC,'main':MAIN,'docsOnlyVerified':True,'docsOnlyPathCount':len(paths),'docsOnlyPathsNulSha256':hashlib.sha256(changed).hexdigest(),'remoteRefsVerified':remote,'workingTreeClean':True,'publishedReadback':pub,'fullGuardsYetRun':False,'executionAuthorization':False})
prior=role(S/'1370-ao-root-continuation-20261010-r1/CURRENT-AN-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json','74855dea68b2e9a9c8ac4c40c949042cb5f097eff5ed7ff80d37b922e76d743a')
ad=json.loads(Path(prior['path']).read_bytes())
ad.update(productionGuardHead=HEAD,publishedReadback=pub,remoteRefsVerified=remote,operationalTransition={'actualHead':HEAD,'docsOnlyVerified':True,'docsTransitionFactsRole':facts,'predecessor':PREV,'wholeProductionCommonGuardMustRefresh':True},previousScopeAdoption=prior)
ad['scope']='Unchanged original A208 protection procedure rebound to actual published AO solely for current native observer repair qualification protection. Current full production/common baseline must be reread. Private R9 original proof and historical M0 authority remain distinct and unchanged. No M0 root metadata adoption, scientific waiver or runtime grant.'
ar=put(A/'CURRENT-AO-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json',ad)
print(json.dumps({'facts':facts,'scopeAdoption':ar}))
