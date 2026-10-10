import datetime,hashlib,json,os,stat,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-c0-a208-adopted-preflight-source-after-al-20261009-r2';P=S/'1370-c0-a208-adopted-preflight-parent-after-al-20261009-r2'
def role(path):
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(path,sha):
 r=role(path);assert r['sha256']==sha;return r,json.loads(Path(path).read_bytes())
def dump(path,obj):
 with Path(path).open('xb') as f:f.write((json.dumps(obj,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
 return role(path)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
review,rv=checked(S/'1370-c0-a208-adopted-preflight-independent-source-review-after-al-20261009-r2/RECEIPT.json','a8956c52486499a1bd4e752f9cc27d68c16c1ca1f33323ac5790e864cd3bbea0')
assert rv['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_ORIGINAL_PERMITTED_ADOPTED_PREFLIGHT' and rv['executionAuthorization'] is False and not rv['findings']
pins,pv=checked(Q/'SOURCE-PINS.json','70a9b35e76220d5b6059729f4859f0cf3d5eda46c6952b3c5d488505cccd3d12')
assert pins==rv['sourcePins']
for expected in pv['files'].values():assert role(expected['path'])==expected
adoption,ar=checked(S/'1370-c0-a208-game-adoption-parent-after-al-20261009-r4/ACTUAL-ADOPTION-READBACK.json','dd8b9a64baacf0a57e1f9df1beab3e861bdd751db6f720cb1c7cc99c45e0f766')
assert ar['status']=='ACTUAL_ARCHIVE6_ADOPT3_COMPLETE_PREFLIGHT_REQUIRED' and ar['actualToolExit']==ar['adopterExit']==0
exact,er=checked(S/'1370-c0-a208-game-exact-filled-independent-review-after-al-20261009-r4/RECEIPT.json','6949f4287cc25b139d1d8fa62d891a876e5e565b078f893b1f665bf3037646cd')
assert er['decision']=='ACCEPT_EXACT_FILLED_UNRUN'
c=json.loads((Q/'CONFIG-PENDING.json').read_bytes());before=json.loads((Q/'CONFIG-PENDING.json').read_bytes())
for k in ('adoptedBinding','adoptionResult','archiveManifest','adoptedLaunch'):assert c[k] is None;c[k]=ar[k];assert role(c[k]['path'])==c[k]
assert c['exactCandidateReview'] is None and c['afterFillSnapshot'] is None
c['exactCandidateReview']=exact;c['afterFillSnapshot']=er['actualGuardAfterFill'];assert role(c['afterFillSnapshot']['path'])==c['afterFillSnapshot']
c['ownedPgids']=[17003,17510,21229,54612,56863,75073]
c['status']='FILLED_GENUINE_ADOPTED_ROLES_PREFLIGHT_UNRUN'
changed=sorted(k for k in c if c[k]!=before[k]);assert changed==sorted(['adoptedBinding','adoptionResult','archiveManifest','adoptedLaunch','exactCandidateReview','afterFillSnapshot','ownedPgids','status'])
assert not os.path.lexists(P) and not os.path.lexists(c['outputPath']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
ad=dump(S/'1370-am-root-continuation-20261009-r1/A208-PREFLIGHT-SOURCE-ADOPTION.json',{'schema':'1370-root-a208-original-permitted-preflight-source-adoption/v1','status':'ROOT_ADOPTED_R2_ORIGINAL_PERMITTED_PREFLIGHT_SOURCE','sourcePins':pins,'sourceReview':review,'actualAdoptionReadback':adoption,'exactCandidateReview':exact,'originalFullAfterFillReuseUnderContinuedFreeze':True,'preservedR1Stop':rv['preservedR1Stop'],'executionAuthorization':False,'game':False})
P.mkdir(mode=0o700);config=dump(P/'CONFIG.json',c)
proof=dump(P/'CONFIG-FILL-PROOF.json',{'schema':'1370-root-preflight-external-config-literal-fill/v1','sourcePendingConfig':rv['configPending'],'actualConfig':config,'actualAdoptionReadback':adoption,'exactCandidateReview':exact,'changedKeys':changed,'fieldDiff':{k:{'before':before[k],'after':c[k]} for k in changed},'otherFieldsUnchanged':True,'preflightSourceUnchanged':True,'game':False})
python='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14';argv=[python,'-I','-B',str(Q/'preflight.py'),config['path'],config['sha256']]
env=rv['externalConfigComposition']['environment']
if os.getpgid(0)!=os.getpid():os.setsid()
assert os.getpid()==os.getpgid(0)
out=P/'preflight.stdout';err=P/'preflight.stderr'
g={'schema':'1370-root-a208-adopted-preflight-grant/v1','status':'GRANTED_ONE_EXACT_ORIGINAL_PERMITTED_R2_ADOPTED_PREFLIGHT','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'executionAuthorization':True,'scope':'ADOPTED_CURRENT_AND_ROOT_PREFLIGHT_OBSERVATION_ONLY','sourceAdoption':ad,'sourcePins':pins,'sourceReview':review,'source':rv['source'],'externalConfig':config,'literalFillProof':proof,'rootLauncher':role(__file__),'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':env,'ownedPreflightPid':os.getpid(),'ownedPreflightPgid':os.getpgid(0),'ownedPreflightSid':os.getsid(0),'directExecPreservesPid':True,'stdoutPath':str(out),'stderrPath':str(err),'protectedFreezeContinues':True,'perCommandTimeoutSeconds':180,'wholePreflightDeadline':None,'rawPsFdLocalOnly':True,'actualTool':None,'actualOutcome':None,'game':False,'automaticRetry':False}
grant=dump(P/'PREFLIGHT-GRANT.json',g);print(json.dumps({'grant':grant,'preflightPid':os.getpid(),'preflightPgid':os.getpgid(0)}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe)
os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,**env))

