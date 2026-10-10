import datetime,hashlib,json,os,subprocess
from pathlib import Path
R=Path('/Users/zacheryspector/The-Movies-headless-program');D=Path(__file__).parent
BRANCH='wip/headless-program-20260916-ts';HEAD='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8';PARENT='f2f97c622db7f5332164b790d1646355e89c00f4';SOURCE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554';MAIN='c902a704eb948cc576083d0973c8c23e59937dc1'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def git(*args):
 r=subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,capture_output=True,check=True);return r.stdout
assert git('rev-parse','HEAD').decode().strip()==HEAD and git('rev-parse','HEAD^').decode().strip()==PARENT
assert git('branch','--show-current').decode().strip()==BRANCH and git('rev-parse','HEAD:src').decode().strip()==SOURCE
index=json.loads((D/'INDEX-VERIFICATION-FINAL.json').read_bytes());assert role(D/'INDEX-VERIFICATION-FINAL.json')['sha256']=='d89951a8e770d32ac1eb6b811e60850b9ab207cf92b165ecfeb38d55e3b6c92a'
assert git('rev-parse','HEAD^{tree}').decode().strip()==index['indexedTree']
refs={line.split('\t')[1]:line.split('\t')[0] for line in git('ls-remote','origin','refs/heads/main','refs/heads/'+BRANCH).decode().splitlines()}
assert refs=={'refs/heads/main':MAIN,'refs/heads/'+BRANCH:HEAD}
assert git('rev-parse','refs/remotes/origin/'+BRANCH).decode().strip()==HEAD and git('rev-parse','refs/remotes/origin/main').decode().strip()==MAIN
assert not git('status','--porcelain=v1','-z','--untracked-files=all')
changed=[x.decode() for x in git('diff','--name-only','-z',PARENT,HEAD).split(b'\0') if x];assert len(changed)==765 and all(p=='HANDOFF.md' or p.startswith('docs/') for p in changed)
review=role(D/'INDEPENDENT-DOCS-ARCHIVE-REVIEW.json');assert review['sha256']=='7b770112da978edef8a976ee33a3fb680752610255a41913f1e40af6a6125a37'
v={'schema':'1370-ap-publication-readback/v1','status':'PUBLISHED_REMOTE_ANCESTRY_SOURCE_AND_COMPLETE_INDEX_VERIFIED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':HEAD,'parent':PARENT,'branch':BRANCH,'sourceTree':SOURCE,'trackedMain':MAIN,'advertisedRemoteRefs':refs,'workingTreeClean':True,'docsOnlyPathCount':len(changed),'completeIndexedTreeEqualsCommitTree':True,'independentReview':review,'finalIndexVerification':role(D/'INDEX-VERIFICATION-FINAL.json'),'pushStdout':role(D/'PUSH.stdout'),'pushStderr':role(D/'PUSH.stderr'),'mainMerged':False,'fullfunctionQualificationAccepted':False,'initialPublicationReaderFailurePreserved':role(D/'PUBLISH-ACTUAL-TOOL.json'),'correction':'Push succeeded and advertised remote matched. Plain fetch origin did not update this branch tracking ref; explicit source:destination branch refspec fetch fcbd80 updated it. No second push.','currentAOFreezeEnded':True,'nextRuntimeRequiresNewAPOperationalProtection':True,'lateFinalizationCarryRequired':str(D)}
p=D/'PUSH-READBACK.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'head':HEAD,'sourceTree':SOURCE,'workingTreeClean':True,'readback':role(p)}))
