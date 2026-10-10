import hashlib,json,subprocess
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program');D=Path(__file__).parent
def git(*args):
 p=subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 assert p.returncode==0,(args,p.returncode,p.stderr.decode())
 return p.stdout
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
head=git('rev-parse','HEAD').decode().strip();parent=git('rev-parse','HEAD^').decode().strip()
assert parent=='0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4'
source=git('rev-parse','HEAD:src').decode().strip();assert source=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
review=role(D/'INDEPENDENT-DOCS-ARCHIVE-REVIEW.json');assert review['sha256']=='7beb6295bb480a92d750d6d3713f594ddf6dbf5a177cd90eadc433382b1bc757'
assert not git('status','--porcelain=v1','-z','--untracked-files=all')
paths=[x.decode() for x in git('diff','--name-only','-z',parent,head).split(b'\0') if x]
assert len(paths)==463 and all(x=='HANDOFF.md' or x.startswith('docs/') for x in paths)
p=subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','push','origin','HEAD:refs/heads/wip/headless-program-20260916-ts'],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
(D/'PUSH.stdout').write_bytes(p.stdout);(D/'PUSH.stderr').write_bytes(p.stderr)
assert p.returncode==0,p.stderr.decode()
refs={x.split('\t')[1]:x.split('\t')[0] for x in git('ls-remote','origin','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').decode().splitlines()}
assert refs=={'refs/heads/main':'c902a704eb948cc576083d0973c8c23e59937dc1','refs/heads/wip/headless-program-20260916-ts':head}
assert git('rev-parse','refs/remotes/origin/wip/headless-program-20260916-ts').decode().strip()==head
assert not git('status','--porcelain=v1','-z','--untracked-files=all')
v={'schema':'1370-ao-publication-readback/v1','head':head,'parent':parent,'branch':'wip/headless-program-20260916-ts','sourceTree':source,'trackedMain':refs['refs/heads/main'],'advertisedRemoteRefs':refs,'workingTreeClean':True,'docsOnlyPathCount':len(paths),'parentAncestryVerified':True,'pushExit':p.returncode,'independentReview':review,'indexVerification':role(D/'INDEX-VERIFICATION-COMPLETE.json'),'pushStdout':role(D/'PUSH.stdout'),'pushStderr':role(D/'PUSH.stderr'),'currentANFreezeEnded':True,'nextRuntimeRequiresNewAOOperationalProtection':True}
out=D/'PUSH-READBACK.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
print(json.dumps({'head':head,'sourceTree':source,'workingTreeClean':True,'readback':role(out)}))
