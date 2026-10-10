import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';Q=S/'1370-c0-b109-ascii-paired308-benchmark-source-after-al-20261009-r1'
def role(path):
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(path,sha):
 r=role(path);assert r['sha256']==sha;return r,json.loads(Path(path).read_bytes())
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
review,rv=checked(sys.argv[1],sys.argv[2])
assert rv['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_B109_ASCII_PAIRED308_BENCHMARK_ROUTE' and not rv['findings']
pins,pv=checked(Q/'SOURCE-PINS.json','1800e05d6a9fbab6eae4f4e7a8bee65969da4785e5b47672d1bf06fc4fbba51b')
assert pins==rv['routeSourcePins']
for expected in pv['files'].values():assert role(expected['path'])==expected
recipe=json.loads((Q/'BENCHMARK-RECIPE.json').read_bytes())
ap=S/'1370-c0-a208-fullguard-postflight-parent-after-al-20261009-r4'
toolrole=role(ap/'ACTUAL-TOOL.json');at=json.loads((ap/'ACTUAL-TOOL.json').read_bytes());assert at['toolSessionId']==32424 and type(at['finalExit']) is int and at['finalExit']==0
pr=json.loads((ap/'POSTFLIGHT-READBACK.json').read_bytes());assert pr['immutableBaselineEquality'] is True and pr['actualToolExit']==0
for fn in (os.kill,os.killpg):
 try:fn(42893,0)
 except ProcessLookupError:pass
 else:raise RuntimeError('STOP prior scanner still present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
ar=put(A/'B109-PAIRED308-BENCHMARK-SOURCE-ADOPTION.json',{'schema':'1370-root-b109-paired308-benchmark-source-adoption/v1','status':'ROOT_ADOPTED_SOURCE_ONLY_PAIRED308_BENCHMARK','independentReview':review,'routeSourcePins':pins,'exactRecipe':role(Q/'BENCHMARK-RECIPE.json'),'actualFocusedCorrectness':recipe['correctnessAdoption'],'selectedEncoderUnchanged':'2529dc0b14a41b99c4e533be5ee444d1b94401f30b7623a51b6122ff1c6f6e4b','executionAuthorization':False,'performanceAccepted':False,'scope':'One indexed308 paired measurement only; keep original fixture/reader/purity/FD/closures and60/75/90, no full109 or source promotion.'})
P=Path(recipe['parentGrantOutputDirectory']);assert not os.path.lexists(P);P.mkdir(mode=0o700)
g={'schema':recipe['rootGrantSchemaRequired'],'status':recipe['rootGrantStatusRequired'],'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executionAuthorization':True,'scope':'PURE_PAIRED_INDEXED308_BENCHMARK_ONLY','sourceAdoption':ar,'routeSourcePins':pins,'routeSourceReview':review,'rootLauncher':role(__file__),'currentProtection':recipe['currentProtection'],'priorActualFullguardTool':toolrole,'priorPostflightReadback':role(ap/'POSTFLIGHT-READBACK.json'),'priorScannerPidPgidFreshlyAbsent':42893,'game':False,'benchmark':True,'full109':False,'environment':recipe['requiredEnvironment'],'ownershipContract':recipe['ownershipContract'],'automaticRetry':False,'actualOutcome':None}
for key in ('argv','cwd','bounds','expected','operational'):g[key]=recipe[key]
gp=P/'GRANT.json';grant=put(gp,g);print(json.dumps({'grant':grant}),flush=True)
argv=[recipe['python']['path'],'-B',str(Q/'launch-benchmark.py'),str(gp),grant['sha256']]
os.chdir(recipe['cwd']);os.execve(argv[0],argv,dict(os.environ,**recipe['requiredEnvironment']))
