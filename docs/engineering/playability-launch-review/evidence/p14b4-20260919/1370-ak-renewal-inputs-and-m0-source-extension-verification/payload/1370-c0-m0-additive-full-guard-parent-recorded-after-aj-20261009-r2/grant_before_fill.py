import datetime,hashlib,json,os,shutil,stat,subprocess,time,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=Path(__file__).parent
Q=S/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2'
REVIEW=S/'1370-c0-m0-additive-full-guard-root-source-review-after-aj-20261009-r1/RECEIPT.json'
HEAD='f0fb818fe7534c3e3784206d16728b015c7f059a'
def role(path):
 p=Path(path);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();assert len(b)==s.st_size;return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def git(*args):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True,timeout=30).strip()
assert role(REVIEW)['sha256']=='a06cdade7513d63e793e27b67a74571ca16b896ae0ee2ee1aeda94d2c854053c'
r=json.loads(REVIEW.read_text());assert r['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_CURRENT_AJ_FULL_GUARD_AND_EXACT_BEFORE_FILL_ARGV'
for path,expected in r['roles'].items():assert role(path)==expected
e=json.loads((Q/'ARGV-PROPOSAL.json').read_text());assert e['beforeFill']==r['beforeFillArgv']
assert len(sys.argv)==3
review=Path(sys.argv[1]);assert role(review)['sha256']==sys.argv[2]
rv=json.loads(review.read_text());assert rv['decision']=='ACCEPT_EXACT_FULL_GUARD_ARGV_AFTER_IDENTIFIED_PARENT_SETUP_REPAIR'
proposal=Path(__file__).parent/'EXACT-ARGV-PROPOSAL.json'
x=json.loads(proposal.read_text());assert role(proposal)==rv['exactArgvProposal']
argv=x['argv'];assert argv==rv['argv']==[*e['beforeFill'][:-1],'before-fill-after-aj-r3'] and x['sourceReviewSha256']==role(REVIEW)['sha256']
p=Path(x['outputParentRole']['path']);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISDIR(st.st_mode)
assert {'path':str(p),'device':st.st_dev,'inode':st.st_ino,'mode':stat.S_IMODE(st.st_mode)}==x['outputParentRole'] and stat.S_IMODE(st.st_mode)==0o700
assert rv['wrapperSha256']==role(Path(__file__))['sha256']
assert role(argv[0])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
assert git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')==HEAD+'\trefs/heads/wip/headless-program-20260916-ts'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
ids=[77313,77576,79310,79573,85523]
for pid in ids:
 for check in (os.kill,os.killpg):
  try:check(pid,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('previously owned PID or PGID exists '+str(pid))
free=shutil.disk_usage(S).free;assert free>=3758096384
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True,timeout=5)
output=Q/'evidence'/argv[-1];out=P/'before-fill.stdout';err=P/'before-fill.stderr'
assert not any(os.path.lexists(x) for x in [output,out,err,P/'BEFORE-FILL-GRANT.json'])
g={'status':'ROOT_ADOPTED_EXACT_SOURCE_ARGV_AND_GRANTED_SINGLE_DIRECT_AJ_FULL_GUARD','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'parentPidBecomesSnapshotPid':os.getpid(),'startMonotonic':time.monotonic(),'argv':argv,'cwd':str(R),'environment':e['environment'],'sourceReview':role(REVIEW),'exactRepairReview':role(review),'exactArgvProposal':role(proposal),'outputParentRole':x['outputParentRole'],'sourceScript':role(Path(__file__)),'guardSource':role(Q/'snapshot.py'),'config':role(Q/'CONFIG.json'),'productionHead':HEAD,'freeBytes':free,'acPower':True,'selectedPriorPidAndPgidAbsent':ids,'globalProcessAbsenceClaim':False,'stdoutPath':str(out),'stderrPath':str(err),'soleRecordedHeavyLane':True,'noHeavyHelperBecauseGuardRequiresLockAbsent':True,'protectedWriteAndRenamerFreeze':'Production/common/R9/H/dependencies read-only from this baseline through dependent reviewed route and protected postflight; no Git writes or install/cache operations','rawPsFdLocalOnly':True,'typesGameOrAdditiveExecutionAuthorized':False}
fd=os.open(P/'BEFORE-FILL-GRANT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(g,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps({'grant':role(P/'BEFORE-FILL-GRANT.json'),'snapshotPid':os.getpid()}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(R);os.execve(argv[0],argv,dict(os.environ,**e['environment']))
