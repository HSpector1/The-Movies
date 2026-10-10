import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-m0-fullbody-r3-ordering-controls-parent-source-20261009-r2'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==1
pr=role(Q/'SOURCE-PINS.json');assert pr['sha256']=='30ae3db8d6cf974e85ff5e416ed360a65b004b5cd5945a3289cb1d880c062a7c'
for r in read(pr['path'])['files'].values():assert role(r['path'])==r
rp=S/'1370-an-m0-fullbody-r3-ordering-controls-parent-independent-source-review-20261009-r2/RECEIPT.json';rr=role(rp);assert rr['sha256']=='8d25710323efd209c4ec86bc2ee72ce96ef7074e4f4b5bd80d18ef8793879b1e';review=read(rp)
assert review['decision']=='ACCEPT_STATIC_R3_ORDERING_CONTROLS_PARENT_SOURCE_ONLY' and review['sourcePins']==pr and review['concreteFindings']==[] and review['executionAuthorization'] is False
recipe=read(Q/'RECIPE.json');source=recipe['sourceRoles']
for r in source.values():assert role(r['path'])==r
assert source['sourcePins']['sha256']=='9976469fd0db93e77eea6842f28572493d02aded92b0924f984785f48f1d2938' and source['sourceReview']['sha256']=='0bf5c4456471f1efee11f552e7cbb0f79f2c6a27ea5949f4acb41f8395521419'
config=read(source['config']['path']);controlReview=read(source['sourceReview']['path']);assert controlReview['decision']=='ACCEPT_STATIC_R3_ORDERING_CONSUMER_CONTROLS_SOURCE_ONLY' and controlReview['concreteFindings']==[] and controlReview['executionAuthorization'] is False
for name,r in read(source['sourcePins']['path'])['files'].items():assert role(r['path'])==r
for name,r in controlReview['sourcePins'].items():assert role(r['path'])==r==controlReview['routeSourcePins'][name]
postpath=S/'1370-an-m0-types-external-config-fullpostflight-parent-recorded-20261009-r1/READBACK.json';post=read(postpath);assert post['toolExit']==0 and post['laneReleased'] is True
for n in post['actualOwnedIds']:
 for fn in (os.kill,os.killpg):
  try:fn(n,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('Prior owned job still present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
P=Path(recipe['parentPath']);assert not os.path.lexists(P)
for p in (recipe['outputs']['worker'],recipe['outputs']['recorder'],recipe['laneLog'],recipe['laneLog']+'.meta'):assert not os.path.lexists(p)
ar=put(A/'ORDERING-CONTROLS-SOURCE-ADOPTION.json',{'schema':'1370-root-r3-ordering-controls-source-adoption/v1','status':'ROOT_ADOPTED_PURE_ORDERING_CONTROLS_SOURCE_ONLY','sourcePins':source['sourcePins'],'sourceReview':source['sourceReview'],'parentAdapterSourcePins':pr,'parentAdapterSourceReview':rr,'executionAuthorization':False,'fixtureQualification':False,'meaningfulCatchMutantRed':False,'game':False,'actualControlOutcome':None})
g={'schema':recipe['grantSchema'],'executionAuthorization':True,'scope':recipe['scope'],'oneAggregateRun':True,'automaticRetry':False,'parentAdapterSourcePins':pr,'parentAdapterSourceReview':rr,**source,'bounds':config['bounds'],'clockEnforcedByOriginalRecordedRoute':True,'configSha256':source['config']['sha256'],'outputPath':config['outputPath'],'acceptedSourcePins':config['acceptedSourcePins'],'heldRootAdoption':config['heldRootAdoption'],'sourceAdoption':ar,'runtimeToolsObservation':recipe['runtimeToolsObservation'],'runtimeTools':recipe['grantRuntimeTools'],'argvTemplate':recipe['grantArgvTemplate'],'cwd':recipe['cwd'],'environment':recipe['environment'],'laneLog':recipe['laneLog'],'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootLauncher':role(__file__),'priorLaneReleaseReadback':role(postpath),'typesAccepted':False,'fixtureQualification':False,'game':False}
for r in g['runtimeTools'].values():assert role(r['path'])==r
assert role(g['runtimeToolsObservation']['path'])==g['runtimeToolsObservation']
P.mkdir(mode=0o700);gr=put(P/'GRANT.json',g);argv=recipe['cli'][:];argv[-1]=gr['sha256'];assert argv[-2]==gr['path'] and argv[3]==str(Q/'launch-ordering-controls.py')
assert role(argv[0])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
print(json.dumps({'grant':gr,'sourceAdoption':ar}),flush=True);os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,**g['environment']))
