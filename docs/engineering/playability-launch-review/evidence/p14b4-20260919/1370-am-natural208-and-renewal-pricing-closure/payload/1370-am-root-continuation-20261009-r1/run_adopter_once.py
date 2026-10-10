import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-c0-a208-game-exact-preparation-source-after-al-20261009-r4';P=S/'1370-c0-a208-game-adoption-parent-after-al-20261009-r4'
def role(path):
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(path,sha):
 r=role(path);assert r['sha256']==sha;return r,json.loads(Path(path).read_bytes())
def dump(path,obj):
 with Path(path).open('xb') as f:f.write((json.dumps(obj,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
 return role(path)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
review,rv=checked(S/'1370-c0-a208-game-exact-filled-independent-review-after-al-20261009-r4/RECEIPT.json','6949f4287cc25b139d1d8fa62d891a876e5e565b078f893b1f665bf3037646cd')
assert rv['decision']=='ACCEPT_EXACT_FILLED_UNRUN' and rv['executionAuthorization'] is False and not rv['findings']
pins,pv=checked(Q/'SOURCE-PINS.json','ce2ef3da4cf01792bab5f3abd084c11bba5daa06ef28d2f6fc9839c67500732e')
assert pins==rv['procedureSourcePins']
for expected in list(pv['files'].values())+list(rv['actualSixRoles'].values()):assert role(expected['path'])==expected
assert role(Q/'adopt_reviewed_candidate.py')['sha256']==rv['adoptionProcedureSha256']
for expected in (rv['actualGuardBaseline'],rv['actualGuardAfterFill'],rv['operationalRuntimeAuthority']):assert role(expected['path'])==expected
c=json.loads((Q/'CONFIG-PENDING.json').read_bytes());assert not os.path.lexists(P) and not os.path.lexists(c['archivePath']) and not os.path.lexists(c['adoptionOutputPath']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
for pid in (56863,17003,17510):
 for fn in (os.kill,os.killpg):
  try:fn(pid,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('STOP prior owned identity survives '+str(pid))
ad=dump(S/'1370-am-root-continuation-20261009-r1/A208-EXACT-CANDIDATE-ADOPTION.json',{'schema':'1370-root-a208-exact-candidate-and-after-fill-adoption/v1','status':'ROOT_ADOPTED_EXACT_UNRUN_SIX_AND_AFTER_FILL_PROTECTION','independentReview':review,'sourcePins':pins,'actualSix':rv['actualSixRoles'],'actualGuardBaseline':rv['actualGuardBaseline'],'actualGuardAfterFill':rv['actualGuardAfterFill'],'operationalRuntimeAuthority':rv['operationalRuntimeAuthority'],'executionAuthorization':False,'game':False})
python=c['roles']['pythonResolved']['path']
argv=[python,'-I','-B',str(Q/'adopt_reviewed_candidate.py'),review['path'],review['sha256'],rv['actualFilledIdentity']['sha256']]
env={'PATH':'/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin:/usr/sbin:/sbin','PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'}
if os.getpgid(0)!=os.getpid():os.setsid()
assert os.getpid()==os.getpgid(0)
P.mkdir(mode=0o700);out=P/'adoption.stdout';err=P/'adoption.stderr'
g={'schema':'1370-root-a208-exact-adopter-grant/v1','status':'GRANTED_ONE_EXACT_R4_ARCHIVE6_ADOPT3','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'executionAuthorization':True,'scope':'EXACT_EXISTING_ARCHIVE_AND_AUTH_FIELD_ADOPTION_ONLY','rootLauncher':role(__file__),'rootExactCandidateAdoption':ad,'independentExactReview':review,'sourcePins':pins,'adopter':role(Q/'adopt_reviewed_candidate.py'),'actualOriginalSix':rv['actualSixRoles'],'filledIdentity':rv['actualFilledIdentity'],'actualGuardAfterFill':rv['actualGuardAfterFill'],'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':env,'ownedAdopterPid':os.getpid(),'ownedAdopterPgid':os.getpgid(0),'ownedAdopterSid':os.getsid(0),'directExecPreservesPid':True,'priorOwnedIdsFreshlyAbsent':[56863,17003,17510],'stdoutPath':str(out),'stderrPath':str(err),'noHelperBecauseOriginalProcedureRequiresLockAbsent':True,'actualTool':None,'actualOutcome':None,'game':False,'automaticRetry':False}
grant=dump(P/'ADOPTER-GRANT.json',g);print(json.dumps({'grant':grant,'adopterPid':os.getpid(),'adopterPgid':os.getpgid(0)}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe)
os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,**env))

