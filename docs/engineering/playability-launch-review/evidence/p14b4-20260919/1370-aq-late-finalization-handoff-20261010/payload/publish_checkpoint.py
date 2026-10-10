"""Root-authorized normal AQ commit/push plus explicit tracking-ref fetch."""
import datetime,hashlib,json,os,subprocess,sys
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program');D=Path(__file__).resolve().parent
BRANCH='wip/headless-program-20260916-ts';PARENT='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8';SOURCE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554';MAIN='c902a704eb948cc576083d0973c8c23e59937dc1'
def role(p):
 p=Path(p);assert p.is_absolute() and p.resolve(strict=True)==p and p.is_file() and p.stat().st_nlink==1;b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
def git(*args):
 env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')};env['GIT_OPTIONAL_LOCKS']='0'
 return subprocess.run(['git','--no-optional-locks','-c','gc.auto=0','-c','maintenance.auto=0',*args],cwd=R,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=180)
def get(*args):
 p=git(*args);assert p.returncode==0 and not p.stderr,(args,p.returncode,p.stderr);return p.stdout
def main():
 assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==5
 review=role(sys.argv[1]);indexRole=role(sys.argv[3]);assert review['sha256']==sys.argv[2] and indexRole['sha256']==sys.argv[4]
 rv=json.loads(Path(review['path']).read_bytes());index=json.loads(Path(indexRole['path']).read_bytes());assert rv['concreteFindings']==[] and rv['executionAuthorization'] is False
 assert index['schema']=='1370-aq-index-verification/v1' and index['status']=='COMPLETE_AQ_INDEX_VERIFIED_PENDING_PUBLICATION' and index['parent']==PARENT and index['indexedSourceTree']==SOURCE and index['manifestCoverageComplete'] and index['allIndexedBytesEqualWorkingFiles'] and index['currentDocsWhitespaceCheck']==0
 assert role(index['binding']['path'])==index['binding'];binding=json.loads(Path(index['binding']['path']).read_bytes());assert binding['status']=='ROOT_FINALIZED_AQ_ARCHIVE_AND_DOCS' and binding['executionAuthorization'] is True and binding['productionSourceTree']==SOURCE
 assert role(index['archiveManifest']['path'])==index['archiveManifest']==binding['archiveManifest']
 manifest=json.loads(Path(index['archiveManifest']['path']).read_bytes());A=binding['archiveRelativeDirectory'];report=binding['reportRelativePath']
 E='docs/engineering/playability-launch-review/evidence/p14b4-20260919/';assert A==E+'1370-aq-git-guard-repair-and-preservation-diagnostic/' and report==E+'1370-AQ-git-guard-repair-and-preservation-diagnostic.md'
 expected={A+x['archiveRelativePath'] for x in manifest['files'] if x['archiveDisposition']=='COPIED_FINITE_PAYLOAD'}|{A+'ARCHIVE-MANIFEST.json',A+'INVENTORY-FINAL.json',A+'ROOT-FINAL-CLAIM.txt','HANDOFF.md',report}
 assert expected==set(index['stagedPaths'])==set(index['indexedRoles']) and len(expected)==index['stagedFiles']==index['expectedStagedFiles']
 assert get('rev-parse','HEAD').decode().strip()==PARENT and get('branch','--show-current').decode().strip()==BRANCH and get('rev-parse','HEAD:src').decode().strip()==SOURCE
 assert get('write-tree').decode().strip()==index['indexedTree'] and not get('diff','--name-only','-z')
 assert {os.fsdecode(x) for x in get('diff','--cached','--name-only','-z').split(b'\0') if x}==expected
 for path,rr in index['indexedRoles'].items():assert role(R/path)==rr and get('show',':'+path)==(R/path).read_bytes()
 commands=[('COMMIT',['commit','--quiet','-m','docs: preserve Git guard repair and preservation diagnostic']),('PUSH',['push','origin','HEAD:refs/heads/'+BRANCH]),('FETCH',['fetch','origin','refs/heads/'+BRANCH+':refs/remotes/origin/'+BRANCH])]
 for name,args in commands:
  p=git(*args);put(D/(name+'.stdout'),p.stdout);put(D/(name+'.stderr'),p.stderr);put(D/(name+'-RESULT.json'),(json.dumps({'argv':args,'actualExit':p.returncode},sort_keys=True,indent=2)+'\n').encode());assert p.returncode==0,(name,p.returncode,p.stderr)
  if name=='COMMIT':
   head=get('rev-parse','HEAD').decode().strip();assert get('rev-parse','HEAD^').decode().strip()==PARENT and get('rev-parse','HEAD^{tree}').decode().strip()==index['indexedTree']
 head=get('rev-parse','HEAD').decode().strip();refs={line.split('\t')[1]:line.split('\t')[0] for line in get('ls-remote','origin','refs/heads/main','refs/heads/'+BRANCH).decode().splitlines()}
 assert refs=={'refs/heads/main':MAIN,'refs/heads/'+BRANCH:head} and get('rev-parse','refs/remotes/origin/'+BRANCH).decode().strip()==head and get('rev-parse','refs/remotes/origin/main').decode().strip()==MAIN
 assert get('rev-parse','HEAD^').decode().strip()==PARENT and get('rev-parse','HEAD^{tree}').decode().strip()==index['indexedTree'] and get('rev-parse','HEAD:src').decode().strip()==SOURCE
 assert not get('status','--porcelain=v1','-z','--untracked-files=all')
 changed={os.fsdecode(x) for x in get('diff','--name-only','-z',PARENT,head).split(b'\0') if x};assert changed==expected and all(p=='HANDOFF.md' or p.startswith('docs/') for p in changed)
 v={'schema':'1370-aq-publication-readback/v1','status':'PUBLISHED_REMOTE_ANCESTRY_SOURCE_AND_COMPLETE_INDEX_VERIFIED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'parent':PARENT,'branch':BRANCH,'sourceTree':SOURCE,'trackedMain':MAIN,'advertisedRemoteRefs':refs,'workingTreeClean':True,'docsOnlyPathCount':len(changed),'completeIndexedTreeEqualsCommitTree':True,'independentReview':review,'finalIndexVerification':indexRole,'explicitFetchRefspec':commands[2][1][-1],'mainMerged':False,'fullfunctionQualificationAccepted':False,'priorFreezeEndedByAuthorizedArchivePublication':True,'nextRuntimeRequiresNewOperationalProtection':True,'lateFinalizationCarryRequired':str(D)}
 rr=put(D/'PUSH-READBACK.json',(json.dumps(v,sort_keys=True,indent=2)+'\n').encode());print(json.dumps({'head':head,'readback':rr}))
if __name__=='__main__':main()
