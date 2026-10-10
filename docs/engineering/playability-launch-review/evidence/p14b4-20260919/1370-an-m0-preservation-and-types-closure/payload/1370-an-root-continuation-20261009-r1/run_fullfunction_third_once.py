import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-m0-fullfunction-qualification-source-20261010-r10';P=S/'1370-an-m0-fullfunction-parent-source-20261010-r3'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def checked(p,h):
 r=role(p);assert r['sha256']==h;return r
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
sp=checked(Q/'SOURCE-PINS.json','eb43fa973b7a9ded1a834a944b2351150236df1c5b7e566b8df904661f689f46')
sr=checked(sys.argv[1],sys.argv[2])
pp=checked(P/'SOURCE-PINS.json','bfd2caee59bf7bdc5698b97bca19340513dcf0b761ef66dfe3b970eef39eec86');pr=checked(S/'1370-an-m0-fullfunction-parent-independent-source-review-20261010-r3/RECEIPT.json','410d3e784e742abe9c089a8b9ae52cd4db426dabda6022212ea2f09df2417fe7')
for manifest in (sp,pp):
 for r in read(manifest['path'])['files'].values():assert role(r['path'])==r
for rev,manifest,decision in [(sr,sp,'ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY'),(pr,pp,'ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY')]:
 v=read(rev['path']);assert v['decision']==decision and v['sourceManifest']==manifest and v['concreteFindings']==[] and v['executionAuthorization'] is False
types=checked(A/'M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json','be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83');bound=checked(A/'FULL-STATE-FIXTURE-ARTIFACT-BOUND.json','186c55ff7381787d3abe401e175d8c1c468be5bfb5e8ef169f89d7c94a0bc546')
protection=role(A/'M0-FULLFUNCTION-R3-CURRENT-PROTECTION.json');p=read(protection['path']);assert p['status']=='ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE' and p['typesAdoption']==types and p['executionAuthorization'] is False
parser=role(A/'PARSER-CONTROLS-OBSERVED-ADOPTION.json');v=read(parser['path']);assert v['status']=='ROOT_ADOPTED_ACTUAL_EXACT_IDENTITY_JSON_CONTROLS_ONLY' and type(v['actualExit']) is int and v['actualExit']==0 and v['executionAuthorization'] is False
for key in ('independentObservedReview','result','actualTool'):assert role(v[key]['path'])==v[key]
assert read(v['independentObservedReview']['path'])['decision']=='ACCEPT_ACTUAL_EXACT_IDENTITY_JSON_PURE_CONTROLS_ONLY'
pins=read(sp['path']);assert v['parserSource']==pins['files']['exact-json.mjs'] and v['controlsSource']==pins['files']['run-parser-controls.mjs']
rt=checked(A/'FULLFUNCTION-RUNTIME-TOOLS.json','e7d0f540655698dac3c15f4210307bef0112abe9316283d6c68a8245dd9eca9e');tools=read(rt['path'])['runtimeTools']
for r in tools.values():assert role(r['path'])==r
helper=checked(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh','aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
source=put(A/'FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION-R3.json',{'schema':'1370-root-fullfunction-qualified-route-source-adoption/v1','status':'ROOT_ADOPTED_REAL_FULL_FUNCTION_QUALIFICATION_SOURCE_WITH_ACTUAL_PREREQUISITES','sourcePins':sp,'sourceReview':sr,'parentSourcePins':pp,'parentSourceReview':pr,'typesAdoption':types,'parserControlsAdoption':parser,'currentProtection':protection,'artifactBoundAdoption':bound,'runtimeToolsObservation':rt,'executionAuthorization':False,'actualRuntimeOutcome':None,'scope':'Bounded real prefix fixture generation, baseline and specific typed-catch mutant only. Not neutrality416 or ledger admission.'})
b={'schema':'1370-root-fullfunction-parent-binding/v1','executionAuthorization':True,'oneAggregateRun':True,'automaticRetry':False,'parentSourcePins':pp,'parentSourceReview':pr,'sourcePins':sp,'sourceReview':sr,'typesAdoption':types,'currentProtection':protection,'parserControlsAdoption':parser,'artifactBoundAdoption':bound,'runtimeTools':tools,'runtimeToolsObservation':rt,'helper':helper,'parentPath':str(S/'1370-an-m0-fullfunction-parent-recorded-20261010-r3'),'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':{'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'sourceAdoption':source,'rootLauncher':role(__file__),'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
br=put(A/'FULLFUNCTION-ROOT-BINDING-R3.json',b);argv=[tools['python']['path'],'-I','-B',str(P/'launch-fullfunction.py'),'outer',br['path'],br['sha256']]
print(json.dumps({'rootBinding':br,'sourceAdoption':source}),flush=True);os.chdir(b['cwd']);os.execve(argv[0],argv,dict(os.environ,**b['environment']))
