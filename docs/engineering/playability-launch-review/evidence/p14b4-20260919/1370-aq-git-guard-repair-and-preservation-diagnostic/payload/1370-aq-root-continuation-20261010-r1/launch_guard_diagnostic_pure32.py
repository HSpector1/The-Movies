import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');F=S/'1370-aq-original-guard-diagnostic-pure-controls-recorded-source-20261010-r1';P=S/'1370-aq-original-guard-diagnostic-pure-controls-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and p.is_file() and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];rv=read(rr['path']);sp=role(F/'SOURCE-PINS.json');pins=read(sp['path']);recipe=read(F/'RECIPE.json');c=read(F/'CONFIG.json')
assert rv['schema']==recipe['sourceReviewSchema'] and rv['decision']==recipe['sourceReviewDecision'] and rv['sourceManifest']==sp and rv['concreteFindings']==[] and rv['executionAuthorization'] is False
assert rv['rootLauncherRole']==role(__file__)
for r in pins['files'].values():assert role(r['path'])==r
for n in recipe['sourceReviewAliasNames']:assert rv['sourcePins'][n]==rv['routeSourcePins'][n]==pins['files'][n]
assert role(recipe['python']['path'])==recipe['python'] and Path(sys.executable).resolve(strict=True)==Path(recipe['python']['path']) and role(recipe['helper']['path'])==recipe['helper']
assert not os.path.lexists(P) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
for p in [recipe['resultRoot'],recipe['recorderResultRoot'],recipe['laneArgv'][3],recipe['laneArgv'][3]+'.meta']:assert not os.path.lexists(p)
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700)
g={'schema':recipe['grantSchema'],'executionAuthorization':True,'oneAggregateRun':True,'automaticRetry':False,'config':role(F/'CONFIG.json'),'bounds':c['bounds'],'outputPath':c['outputPath'],'python':recipe['python'],'sourceManifest':sp,'sourceReview':rr}
for k in ['diagnosticSourceManifest','diagnosticSourceReview','controlsSourceManifest','controlsSourceReview']:g[k]=c[k];assert role(c[k]['path'])==c[k]
gr=put(P/'GRANT.json',g)
argv=[gr['path'] if x=='GENUINE_GRANT_PATH' else gr['sha256'] if x=='GENUINE_GRANT_SHA' else x for x in recipe['laneArgv']]
claim=put(P/'ROOT-LAUNCH-CLAIM.json',{'schema':'1370-root-pure32-launch-claim/v1','grant':gr,'launcher':role(__file__),'argv':argv,'ownedPid':os.getpid(),'ownedPgid':os.getpgrp(),'ownedSid':os.getsid(0),'directExecPreservesPid':True,'cwd':'/Users/zacheryspector/The-Movies-headless-program'})
print(json.dumps({'grant':gr,'launchClaim':claim}),flush=True)
os.chdir('/Users/zacheryspector/The-Movies-headless-program');os.execve(argv[0],argv,dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
