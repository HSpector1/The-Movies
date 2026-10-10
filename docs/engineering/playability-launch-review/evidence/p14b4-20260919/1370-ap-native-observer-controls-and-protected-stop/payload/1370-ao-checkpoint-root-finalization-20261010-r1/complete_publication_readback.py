import hashlib,json,subprocess
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program');D=Path(__file__).parent
def git(*args):
 assert (D/'PUSH.stdout').exists() and (D/'PUSH.stderr').exists()
refs={x.split('\t')[1]:x.split('\t')[0] for x in git('ls-remote','origin','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').decode().splitlines()}
assert refs=={'refs/heads/main':'c902a704eb948cc576083d0973c8c23e59937dc1','refs/heads/wip/headless-program-20260916-ts':head}
assert git('rev-parse','refs/remotes/origin/wip/headless-program-20260916-ts').decode().strip()==head
assert not git('status','--porcelain=v1','-z','--untracked-files=all')
v={'schema':'1370-ao-publication-readback/v1','head':head,'parent':parent,'branch':'wip/headless-program-20260916-ts','sourceTree':source,'trackedMain':refs['refs/heads/main'],'advertisedRemoteRefs':refs,'workingTreeClean':True,'docsOnlyPathCount':len(paths),'parentAncestryVerified':True,'pushExit':0,'initialReadbackFailure':'Successful explicit push and advertised-remote check did not update the local tracking ref; retained initial assertion failure. Explicit fetch refreshed that local ref; no repeated push.','independentReview':review,'indexVerification':role(D/'INDEX-VERIFICATION-COMPLETE.json'),'pushStdout':role(D/'PUSH.stdout'),'pushStderr':role(D/'PUSH.stderr'),'currentANFreezeEnded':True,'nextRuntimeRequiresNewAOOperationalProtection':True}
out=D/'PUSH-READBACK.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
print(json.dumps({'head':head,'sourceTree':source,'workingTreeClean':True,'readback':role(out)}))
