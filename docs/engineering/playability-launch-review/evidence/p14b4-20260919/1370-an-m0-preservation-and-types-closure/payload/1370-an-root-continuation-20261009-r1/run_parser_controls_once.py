import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-exact-identity-json-controls-recorded-route-source-20261010-r2'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
sp=role(Q/'SOURCE-PINS.json');assert sp['sha256']=='640d300aadc66b4f7bc225f91841b5fd235945d446c056214d8b4cda27b4313a';pins=read(sp['path'])
for r in [*pins['files'].values(),*pins['externalInputs'].values()]:assert role(r['path'])==r
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];rv=read(rr['path']);assert rv['schema']=='1370-exact-identity-json-controls-recorded-route-independent-source-review/v1' and rv['decision']=='ACCEPT_STATIC_EXACT_IDENTITY_JSON_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY' and rv['executionAuthorization'] is False and rv['concreteFindings']==[] and rv['sourceManifest']==sp
for name in ('CONFIG.json','CONTRACT.json','record-parser-controls.py','launch-parser-controls.py','exact-json.mjs','run-parser-controls.mjs'):
 wanted=pins['files'].get(name,pins['externalInputs'].get(name));assert rv['sourcePins'][name]==rv['routeSourcePins'][name]==wanted
recipe=read(Q/'RECIPE.json');config=read(Q/'CONFIG.json');contract=read(Q/'CONTRACT.json');assert recipe['bounds']==config['bounds']==contract['bounds']
pre=read(A/'M0-FULLFUNCTION-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json');assert pre['actualToolSessionId']==86072 and pre['toolExit']==0 and pre['scannerAbsent'] is True and pre['newFullInventory'] is False
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
P=Path(contract['parentPath']);assert not os.path.lexists(P)
for p in (contract['outputPath'],contract['recorderOutputPath'],contract['laneLog'],contract['laneLog']+'.meta'):assert not os.path.lexists(p)
ar=put(A/'PARSER-CONTROLS-SOURCE-ADOPTION.json',{'schema':recipe['rootSourceAdoptionContract']['schema'],'status':recipe['rootSourceAdoptionContract']['status'],'sourcePins':sp,'sourceReview':rr,'parentAdapterSourcePins':sp,'parentAdapterSourceReview':rr,'executionAuthorization':False,'game':False,'actualOutcome':None})
g={'schema':recipe['rootOnceGrantContract']['schema'],'scope':recipe['scope'],'executionAuthorization':True,'oneAggregateRun':True,'automaticRetry':False,'clockEnforcedByOriginalRecordedRoute':True,'parentAdapterSourcePins':sp,'parentAdapterSourceReview':rr,'sourcePins':sp,'sourceReview':rr,'config':pins['files']['CONFIG.json'],'recipe':pins['files']['RECIPE.json'],'bounds':config['bounds'],'configSha256':pins['files']['CONFIG.json']['sha256'],'outputPath':config['outputPath'],'sourceAdoption':ar,'runtimeToolsObservation':recipe['runtimeToolsObservation'],'runtimeTools':recipe['rootOnceGrantContract']['runtimeTools'],'argvTemplate':recipe['helperArgvTemplate'],'cwd':recipe['cwd'],'environment':recipe['environment'],'laneLog':recipe['outputs']['lane'],'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootLauncher':role(__file__),'priorPreflightReadback':role(A/'M0-FULLFUNCTION-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json'),'privateM0ReadOrWritten':False,'game':False}
for r in g['runtimeTools'].values():assert role(r['path'])==r
assert role(g['runtimeToolsObservation']['path'])==g['runtimeToolsObservation'];P.mkdir(mode=0o700);gr=put(P/'GRANT.json',g)
argv=recipe['parentArgv'][:];argv[-1]=gr['sha256'];assert argv[-2]==gr['path'] and argv[3]==str(Q/'launch-parser-controls.py') and role(argv[0])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
print(json.dumps({'grant':gr,'sourceAdoption':ar}),flush=True);os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,**g['environment']))
