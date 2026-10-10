import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-ao-observer-row-diagnostic-pure-controls-recorded-route-source-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
sp=role(Q/'SOURCE-PINS.json');assert sp['sha256']=='a27f8bf8756ab5804411ff1592aef49f8012c3dc65e14cbf073dcec2995a97ec';pins=read(sp['path'])
for r in [*pins['files'].values(),*pins['externalInputs'].values()]:assert role(r['path'])==r
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];rv=read(rr['path'])
assert rv['schema']=='1370-observer-row-diagnostic-pure-controls-recorded-route-independent-source-review/v1' and rv['decision']=='ACCEPT_STATIC_OBSERVER_ROW_DIAGNOSTIC_PURE_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY' and rv['executionAuthorization'] is False and rv['concreteFindings']==[] and rv['sourceManifest']==sp
recipe=read(Q/'RECIPE.json');config=read(Q/'CONFIG.json');contract=read(Q/'CONTRACT.json')
assert recipe['bounds']==config['bounds']==contract['bounds']=={'active':320,'childStreamBytes':8388608,'compiledModuleBytes':131072,'resultBytes':131072,'runner':300,'whole':330}
for name in config['reviewAliases']:
 wanted=pins['files'].get(name,pins['externalInputs'].get(name));assert wanted is not None and rv['sourcePins'][name]==rv['routeSourcePins'][name]==wanted
assert config['caseCount']==48 and config['positiveCount']==6 and config['specificNegativeCount']==42
prior=role(S/'1370-an-root-continuation-20261009-r1/FULLFUNCTION-R5-STOP-OBSERVED-ADOPTION.json');assert prior['sha256']=='ab5b801da2ec6408281115aa424bfafad8a8e458b96e3f068d5fecfb2346669f'
priorValue=read(prior['path']);assert priorValue['fullSharedPostflightAccepted'] is True and priorValue['soleLaneReleased'] is True and priorValue['freshPassingSharedPostSession']==92358
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
P=Path(contract['parentPath']);assert not os.path.lexists(P)
assert contract['outputPath']!=contract['recorderOutputPath']
for p in (contract['outputPath'],contract['recorderOutputPath'],contract['laneLog'],contract['laneLog']+'.meta'):assert not os.path.lexists(p)
ar=put(A/'OBSERVER-DIAGNOSTIC-CONTROLS-SOURCE-ADOPTION.json',{'schema':recipe['rootSourceAdoptionContract']['schema'],'status':recipe['rootSourceAdoptionContract']['status'],'sourcePins':sp,'sourceReview':rr,'parentAdapterSourcePins':sp,'parentAdapterSourceReview':rr,'executionAuthorization':False,'game':False,'actualOutcome':None})
g={'schema':recipe['rootOnceGrantContract']['schema'],'scope':recipe['scope'],'executionAuthorization':True,'oneAggregateRun':True,'automaticRetry':False,'clockEnforcedByOriginalRecordedRoute':True,'parentAdapterSourcePins':sp,'parentAdapterSourceReview':rr,'sourcePins':sp,'sourceReview':rr,'config':pins['files']['CONFIG.json'],'recipe':pins['files']['RECIPE.json'],'bounds':config['bounds'],'configSha256':pins['files']['CONFIG.json']['sha256'],'outputPath':config['outputPath'],'sourceAdoption':ar,'runtimeToolsObservation':recipe['runtimeToolsObservation'],'runtimeTools':recipe['rootOnceGrantContract']['runtimeTools'],'argvTemplate':recipe['helperArgvTemplate'],'cwd':recipe['cwd'],'environment':recipe['environment'],'laneLog':recipe['outputs']['lane'],'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootLauncher':role(__file__),'priorProtectedStopAdoption':prior,'privateM0ReadOrWritten':False,'game':False}
for key in ('implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption','implementationControlsSourceAdoption','api'):
 g[key]=recipe[key];assert role(g[key]['path'])==g[key] and config[key]==g[key]
assert g['implementationControlsSourceAdoption']['sha256']=='1112ed2166d623284be4a1c1bd40ae455212921d16ec32da0e727f9bcca566c7'
for r in g['runtimeTools'].values():assert role(r['path'])==r
assert role(g['runtimeToolsObservation']['path'])==g['runtimeToolsObservation']
assert g['runtimeToolsObservation']['sha256']=='12d11061dd21827447ef0563d9ab4c5bec0c636986e8690ed067eb0be37dfa0c'
P.mkdir(mode=0o700);gr=put(P/'GRANT.json',g)
argv=recipe['parentArgv'][:];argv[-1]=gr['sha256']
assert len(argv)==6 and argv[-2]==gr['path'] and argv[3]==str(Q/'launch-observer-row-controls.py') and role(argv[0])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
print(json.dumps({'grant':gr,'sourceAdoption':ar}),flush=True);os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,**g['environment']))
