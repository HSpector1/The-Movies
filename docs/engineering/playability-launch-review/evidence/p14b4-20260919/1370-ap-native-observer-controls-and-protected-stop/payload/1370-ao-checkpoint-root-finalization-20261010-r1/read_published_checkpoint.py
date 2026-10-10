import datetime,hashlib,json,subprocess
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program');D=Path(__file__).parent
def git(*args):
 result=subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
 return result.stdout
def role(path):
 data=path.read_bytes();return {'path':str(path),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
head=git('rev-parse','HEAD').decode().strip()
assert head=='f2f97c622db7f5332164b790d1646355e89c00f4'
parent=git('rev-parse','HEAD^').decode().strip()
assert parent=='0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4'
source=git('rev-parse','HEAD:src').decode().strip()
assert source=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
refs={line.split('\t')[1]:line.split('\t')[0] for line in git('ls-remote','origin','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').decode().splitlines()}
assert refs=={'refs/heads/main':'c902a704eb948cc576083d0973c8c23e59937dc1','refs/heads/wip/headless-program-20260916-ts':head}
assert git('rev-parse','refs/remotes/origin/wip/headless-program-20260916-ts').decode().strip()==head
assert git('rev-parse','refs/remotes/origin/main').decode().strip()==refs['refs/heads/main']
assert not git('status','--porcelain=v1','-z','--untracked-files=all')
assert git('branch','--show-current').decode().strip()=='wip/headless-program-20260916-ts'
paths=[x.decode() for x in git('diff','--name-only','-z',parent,head).split(b'\0') if x]
assert len(paths)==463 and all(p=='HANDOFF.md' or p.startswith('docs/') for p in paths)
index=json.loads((D/'INDEX-VERIFICATION-COMPLETE.json').read_bytes())
assert git('rev-parse','HEAD^{tree}').decode().strip()==index['indexedTree']
review=role(D/'INDEPENDENT-DOCS-ARCHIVE-REVIEW.json')
assert review['sha256']=='7beb6295bb480a92d750d6d3713f594ddf6dbf5a177cd90eadc433382b1bc757'
v={'schema':'1370-ao-publication-readback/v1','status':'PUBLISHED_REMOTE_ANCESTRY_SOURCE_AND_COMPLETE_INDEX_VERIFIED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'parent':parent,'branch':'wip/headless-program-20260916-ts','sourceTree':source,'trackedMain':refs['refs/heads/main'],'advertisedRemoteRefs':refs,'workingTreeClean':True,'docsOnlyPathCount':len(paths),'completeIndexedTreeEqualsCommitTree':True,'independentReview':review,'pushStdout':role(D/'PUSH.stdout'),'pushStderr':role(D/'PUSH.stderr'),'mainMerged':False,'fullfunctionQualificationAccepted':False,'initialFailuresPreserved':['Successful push did not refresh local tracking ref; explicit fetch corrected local reference, with no repeated push.','First readback adaptation selected the wrong subprocess occurrence and returned None; no repository mutation. Original script and traceback retained by tool record.'],'currentANFreezeEnded':True,'nextRuntimeRequiresNewAOOperationalProtection':True}
p=D/'PUSH-READBACK.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
print(json.dumps({'head':head,'sourceTree':source,'workingTreeClean':True,'readback':role(p)}))
