import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
Q=S/'1370-c0-b109-ascii-focused-route-source-after-al-20261009-r2'
def role(path):
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(path,sha):
 r=role(path);assert r['sha256']==sha;return r,json.loads(Path(path).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
arole,ad=checked(S/'1370-am-root-continuation-20261009-r1/B109-FOCUSED-R2-SOURCE-ADOPTION.json','ce32b9e5bb696c109b7ba1c8a7efc22051b4cc1943bd0e13e2094da0b77e4712')
assert ad['status']=='ROOT_ADOPTED_UNRUN_R2_FOCUSED_ROUTE_SOURCE' and ad['executionAuthorization'] is False
review,rv=checked(S/'1370-c0-b109-ascii-focused-route-independent-review-after-al-20261009-r2/RECEIPT.json','fb4d1883ddd67c49698d6b9e4b4dde12a3ec6f672a40538a2b30eddb8ed1cc47')
assert review==ad['independentReview'] and rv['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_B109_ASCII_FOCUSED_RECORDED_ROUTE' and not rv['findings']
pins,pv=checked(Q/'SOURCE-PINS.json','b5f3103ed8ac1585ff63406be5c776824e0e678089ac0239cb287318ea42520a')
assert pins==rv['routeSourcePins']==ad['routeSourcePins']
for expected in pv['files'].values():assert role(expected['path'])==expected
recipe=json.loads((Q/'CONTROL-RECIPE.json').read_bytes())
# The parent has a single heavy lane. Do not run before the active direct guard finishes.
ap=S/'1370-c0-a208-fullguard-after-fill-parent-after-al-20261009-r4'
toolrole=role(ap/'ACTUAL-TOOL.json');at=json.loads((ap/'ACTUAL-TOOL.json').read_bytes());assert at['toolSessionId']==74599 and type(at['finalExit']) is int and at['finalExit']==0
for fn in (os.kill,os.killpg):
 try:fn(56863,0)
 except ProcessLookupError:pass
 else:raise RuntimeError('STOP prior scanner still present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
P=Path(recipe['parentGrantOutputDirectory']);assert not os.path.lexists(P);P.mkdir(mode=0o700)
g={'schema':recipe['rootGrantSchemaRequired'],'status':recipe['rootGrantStatusRequired'],'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executionAuthorization':True,'scope':'PURE_FOCUSED_CONTROLS_ONLY','sourceAdoption':arole,'routeSourcePins':pins,'routeSourceReview':review,'rootLauncher':role(__file__),'currentProtection':recipe['currentProtection'],'priorActualFullguardTool':toolrole,'priorScannerPidPgidFreshlyAbsent':56863,'game':False,'benchmark':False,'full109':False,'environment':recipe['requiredEnvironment'],'ownershipContract':recipe['ownershipContract'],'automaticRetry':False,'actualOutcome':None}
for key in ('argv','cwd','bounds','expected','operational'):g[key]=recipe[key]
gp=P/'GRANT.json'
with gp.open('xb') as f:f.write((json.dumps(g,sort_keys=True,indent=2)+'\n').encode());f.flush();os.fsync(f.fileno())
grant=role(gp);print(json.dumps({'grant':grant}),flush=True)
argv=[recipe['python']['path'],'-B',str(Q/'launch-focused-controls.py'),str(gp),grant['sha256']]
os.chdir(recipe['cwd']);os.execve(argv[0],argv,dict(os.environ,**recipe['requiredEnvironment']))

