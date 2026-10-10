import datetime,hashlib,json,os,subprocess,sys
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program');D=Path(__file__).parent
BRANCH='wip/headless-program-20260916-ts';PARENT='f2f97c622db7f5332164b790d1646355e89c00f4';SOURCE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554';MAIN='c902a704eb948cc576083d0973c8c23e59937dc1'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def git(*args):return subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,capture_output=True)
def get(*args):
 r=git(*args);assert r.returncode==0,(args,r.returncode,r.stderr.decode());return r.stdout
assert sys.flags.isolated and sys.dont_write_bytecode and len(sys.argv)==2
review=role(D/'INDEPENDENT-DOCS-ARCHIVE-REVIEW.json');assert review['sha256']==sys.argv[1]
v=json.loads(Path(review['path']).read_bytes());assert v['concreteFindings']==[] and v['executionAuthorization'] is False
index=json.loads((D/'INDEX-VERIFICATION-FINAL.json').read_bytes());assert role(D/'INDEX-VERIFICATION-FINAL.json')['sha256']=='d89951a8e770d32ac1eb6b811e60850b9ab207cf92b165ecfeb38d55e3b6c92a'
assert get('rev-parse','HEAD').decode().strip()==PARENT and get('branch','--show-current').decode().strip()==BRANCH
assert get('write-tree').decode().strip()==index['indexedTree'] and not get('diff','--name-only')
assert get('rev-parse','HEAD:src').decode().strip()==SOURCE
for r in index['changedDocs'].values():assert role(r['path'])==r
for name,args in [('COMMIT',('commit','--quiet','-m','docs: preserve native observer controls, protected failure, and lessons')),('PUSH',('push','origin','HEAD:refs/heads/'+BRANCH)),('FETCH',('fetch','origin'))]:
 r=git(*args);(D/(name+'.stdout')).write_bytes(r.stdout);(D/(name+'.stderr')).write_bytes(r.stderr)
 assert r.returncode==0,(name,r.returncode,r.stderr.decode())
 if name=='COMMIT':
  head=get('rev-parse','HEAD').decode().strip();assert get('rev-parse','HEAD^').decode().strip()==PARENT
  assert get('rev-parse','HEAD^{tree}').decode().strip()==index['indexedTree']
  (D/'COMMIT-RESULT.json').write_text(json.dumps({'head':head,'parent':PARENT,'indexedTree':index['indexedTree'],'actualExit':0},sort_keys=True,indent=2)+'\n')
head=get('rev-parse','HEAD').decode().strip();refs={line.split('\t')[1]:line.split('\t')[0] for line in get('ls-remote','origin','refs/heads/main','refs/heads/'+BRANCH).decode().splitlines()}
assert refs=={'refs/heads/main':MAIN,'refs/heads/'+BRANCH:head}
assert get('rev-parse','refs/remotes/origin/'+BRANCH).decode().strip()==head and get('rev-parse','refs/remotes/origin/main').decode().strip()==MAIN
assert get('rev-parse','HEAD:src').decode().strip()==SOURCE and not get('status','--porcelain=v1','-z','--untracked-files=all')
changed=[x.decode() for x in get('diff','--name-only','-z',PARENT,head).split(b'\0') if x];assert len(changed)==765 and all(p=='HANDOFF.md' or p.startswith('docs/') for p in changed)
out={'schema':'1370-ap-publication-readback/v1','status':'PUBLISHED_REMOTE_ANCESTRY_SOURCE_AND_COMPLETE_INDEX_VERIFIED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'parent':PARENT,'branch':BRANCH,'sourceTree':SOURCE,'trackedMain':MAIN,'advertisedRemoteRefs':refs,'workingTreeClean':True,'docsOnlyPathCount':len(changed),'completeIndexedTreeEqualsCommitTree':True,'independentReview':review,'finalIndexVerification':role(D/'INDEX-VERIFICATION-FINAL.json'),'pushStdout':role(D/'PUSH.stdout'),'pushStderr':role(D/'PUSH.stderr'),'explicitFetchPerformed':True,'mainMerged':False,'fullfunctionQualificationAccepted':False,'currentAOFreezeEnded':True,'nextRuntimeRequiresNewAPOperationalProtection':True,'lateFinalizationCarryRequired':str(D)}
p=D/'PUSH-READBACK.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'head':head,'sourceTree':SOURCE,'workingTreeClean':True,'readback':role(p)}))
