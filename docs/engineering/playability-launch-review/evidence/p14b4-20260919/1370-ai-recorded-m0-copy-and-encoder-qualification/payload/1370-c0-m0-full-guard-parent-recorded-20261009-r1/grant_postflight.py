import datetime, hashlib, json, os, sys, time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
P=Path(__file__).parent
Q=S/'1370-c0-m0-operational-full-guard-preparation-20261009-r1'
E=S/'1370-c0-m0-exact-parent-adoption-20261009-r1/EXACT-POSTFLIGHT-ARGV.json'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def role(p):
 p=Path(p);assert p.is_file() and not p.is_symlink()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
review=Path(sys.argv[1]);assert sha(review)==sys.argv[2]
rv=json.loads(review.read_text());assert rv['decision'].startswith('ACCEPT')
assert sha(E)=='a4eda7f0640623445ccd713195a7bca646e30c705b7aa4ebb703e630673bc029'
e=json.loads(E.read_text())
assert rv['roles'][str(E)]['sha256']==sha(E)
assert sha(Q/'snapshot.py')==e['guardSourceSha256']=='259c4bac30fd506a67779d2c59fd29f51c8a6f75e140f7c37f6cff625aa23a58'
assert sha(Q/'CONFIG.json')==e['configSha256']=='03d8bdfeba06f14d9f371484805f66d7fcc1013825e9d0875a4368f0d5a9033d'
assert sha(e['argv'][0])=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
assert sha(e['argv'][10])==e['baselineSha256']=='28679dbcc0536c72ec9da4bff8e591b8988025101e1977914334e6f8a538ed15'
for k in ['actualRunOutcome','actualSupervisor','actualRecorder']:
 assert role(e[k]['path'])==e[k]
assert e['argv'][-1]=='10639,10655' and e['actualWorkerChildPgids']==[10639,10655]
for g in [10372,10639,10655]:
 try:os.killpg(g,0)
 except ProcessLookupError:pass
 else:raise RuntimeError('actual owned group survives '+str(g))
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(e['requiredFreshOutput'])
out=P/'postflight.stdout';err=P/'postflight.stderr'
assert not os.path.lexists(out) and not os.path.lexists(err)
grant={'schema':'m0-postflight-parent-full-guard-grant/v1','status':'ROOT_ADOPTED_EXACT_POSTFLIGHT_ARGV_AND_GRANTED_ONE_DIRECT_FULL_GUARD','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'parentPidBecomesSnapshotPid':os.getpid(),'startMonotonic':time.monotonic(),'argv':e['argv'],'cwd':e['cwd'],'environment':e['environment'],'exactArgvRole':role(E),'independentArgvReview':role(review),'guardSource':role(Q/'snapshot.py'),'config':role(Q/'CONFIG.json'),'baseline':role(e['argv'][10]),'actualRunOutcome':e['actualRunOutcome'],'actualSupervisor':e['actualSupervisor'],'actualRecorder':e['actualRecorder'],'actualWorkerChildPgids':[10639,10655],'sourceScript':role(Path(__file__)),'stdoutPath':str(out),'stderrPath':str(err),'soleRecordedHeavyLane':True,'noHeavyHelperBecauseGuardRequiresLockAbsent':True,'protectedFreezeMaintained':True,'rawPsFdLocalOnly':True,'gameTypesMaterializationAuthorized':False}
fd=os.open(P/'POSTFLIGHT-GRANT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(grant,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps({'grant':role(P/'POSTFLIGHT-GRANT.json'),'snapshotPid':os.getpid()}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe)
os.chdir(e['cwd']);os.execve(e['argv'][0],e['argv'],dict(os.environ,**e['environment']))
