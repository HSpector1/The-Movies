import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
ROOT=S/'1370-am-root-continuation-20261009-r1'
P=S/'1370-c0-a208-game-fill-parent-after-al-20261009-r4'
def role(path):
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(path,sha):
 r=role(path);assert r['sha256']==sha;return r,json.loads(Path(path).read_bytes())
def dump(path,obj):
 with Path(path).open('xb') as f:
  f.write((json.dumps(obj,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
 return role(path)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
review,rv=checked(S/'1370-c0-a208-game-exact-preparation-independent-source-review-after-al-20261009-r4/RECEIPT.json','105445b8625884887c7c2ebdd310665745781e8964a8953dcbb5a0281fd00661')
assert rv['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_R4_EXACT_PREPARATION_AND_FILL_AFTER_FILL_ARGUMENT_MAP' and rv['executionAuthorization'] is False and not rv['findings']
mapping,m=checked(S/'1370-c0-a208-game-fill-after-fill-argument-map-after-al-20261009-r1/MAP.json','5f23c5c9bc88ba696ef106456da9926fb8ba6c696da0749459a65f707256ed89')
f=m['fill'];assert rv['exactArgumentReview']['fill']['argv']==f['argv'] and rv['exactArgumentReview']['fill']['environment']==f['environment']
pins,pv=checked(f['sourcePins']['path'],rv['sourcePinsSha256']);assert pins==f['sourcePins']
for expected in list(pv['files'].values())+list(pv['candidateTemplates'].values()):assert role(expected['path'])==expected
for key in ('procedure','config','baseline','knownBeforeFillAuthority','inputReceipt'):assert role(f[key]['path'])==f[key]
assert role(f['python']['path'])['sha256']==f['python']['sha256'] and str(Path(sys.executable).resolve(strict=True))==f['python']['path']
assert not os.path.lexists(P) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
for p in f['exclusiveFuturePaths'].values():assert not os.path.lexists(p)
ad=dump(ROOT/'A208-R4-PREPARATION-SOURCE-ADOPTION.json',{'schema':'1370-root-a208-r4-preparation-source-adoption/v1','status':'ROOT_ADOPTED_R4_EXACT_PREPARATION_SOURCE_AND_ARGV','sourcePins':pins,'independentReview':review,'argumentMap':mapping,'beforeFillAuthority':f['knownBeforeFillAuthority'],'actualGuardBaseline':f['baseline'],'executionAuthorization':False,'gameGrant':None})
if os.getpgid(0)!=os.getpid():os.setsid()
assert os.getpid()==os.getpgid(0)
P.mkdir(mode=0o700);out=P/'fill.stdout';err=P/'fill.stderr'
g={'schema':'1370-root-a208-exact-fill-grant/v1','status':'GRANTED_ONE_EXACT_REVIEWED_A208_R4_FILL','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'executionAuthorization':True,'scope':'EXACT_SIX_ARTIFACT_FILL_ONLY','sourceAdoption':ad,'sourcePins':pins,'independentSourceReview':review,'argumentMap':mapping,'rootLauncher':role(__file__),'argv':f['argv'],'cwd':f['cwd'],'environment':f['environment'],'baseline':f['baseline'],'beforeFillAuthority':f['knownBeforeFillAuthority'],'ownedFillerPid':os.getpid(),'ownedFillerPgid':os.getpgid(0),'ownedFillerSid':os.getsid(0),'directExecPreservesPid':True,'stdoutPath':str(out),'stderrPath':str(err),'originalPerCommandTimeoutSeconds':30,'wholeFillerDeadline':None,'parentAddedStreamCap':None,'noHelperBecauseFillerRequiresLockAbsent':True,'actualTool':None,'actualOutcome':None,'game':False,'automaticRetry':False}
grant=dump(P/'FILL-GRANT.json',g)
print(json.dumps({'grant':grant,'fillerPid':os.getpid(),'fillerPgid':os.getpgid(0)}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe)
os.chdir(f['cwd']);os.execve(f['argv'][0],f['argv'],dict(os.environ,**f['environment']))

