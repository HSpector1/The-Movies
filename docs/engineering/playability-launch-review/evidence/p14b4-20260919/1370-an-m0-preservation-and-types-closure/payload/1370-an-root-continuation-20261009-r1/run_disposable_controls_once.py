import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
Q=S/'1370-c0-m0-config-bundle-metadata-disposable-controls-source-after-al-20261009-r2';B=S/'1370-an-disposable-metadata-controls-parent-adapter-source-20261009-r1';P=S/'1370-an-disposable-metadata-controls-parent-recorded-20261009-r1'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==5
sp,pins=check(Q/'SOURCE-PINS.json','bc7fcfc7bcd4ab5e4472733260e1ee5f89658c827a09412d7f98d60b10ffd573')
ap,adapterpins=check(B/'SOURCE-PINS.json','16a42f267504d4b7414301d9a464c27563269db5d5d9a761bdd3f4dd9878dc76')
rr,review=check(sys.argv[1],sys.argv[2]);ar,adapterreview=check(sys.argv[3],sys.argv[4])
assert review['schema']=='1370-disposable-controls-independent-source-review/v1' and review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_HELD' and review['routeSourcePins']==sp and review['concreteFindings']==[] and review['executionAuthorization'] is False
assert adapterreview['decision']=='ACCEPT_STATIC_DISPOSABLE_CONTROLS_PARENT_ADAPTER_SOURCE_ONLY' and adapterreview['sourcePins']==ap and adapterreview['concreteFindings']==[] and adapterreview['executionAuthorization'] is False
for v in (pins,adapterpins):
 for r in v['files'].values():assert role(r['path'])==r
recipe=json.loads((Q/'RECIPE.json').read_bytes());assert recipe['executionAuthorization'] is False
assert recipe['bounds']['aggregateControllerSeconds']==60 and recipe['bounds']['activeRecorderSeconds']==75 and recipe['bounds']['wholeRecorderSeconds']==90 and recipe['bounds']['parentLaunchClock'] is None
rt,tools=check(A/'RUNTIME-TOOLS.json','059056bbee66b15d0f944e390dc16c9312f1349e33bb3094059de4c47b5bfc6f')
publication,pub=check(S/'1370-am-checkpoint-root-finalization-20261009-r1/PUSH-READBACK.json','a7ca327d2d4610704f426630d79343722fb92c19f3762dd521221d77a567479b');assert pub['head']=='7087f116cf998fd86e33fb8e004df628e0686dbd' and pub['workingTreeClean'] is True
for key in ('python','node'):
 row=tools['runtimeTools'][key];assert {k:row[k] for k in ('bytes','sha256')}=={k:recipe['tools'][key][k] for k in ('bytes','sha256')} and row['physicalPath']==recipe['tools'][key]['path']
assert not os.path.lexists(P) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
for name in ('recorderOutput','disposableArtifactRoot'):assert not os.path.lexists(recipe[name])
assert not os.path.lexists(Path(recipe['laneLog']).parent)
adoption=put(A/'DISPOSABLE-CONTROLS-AND-PARENT-SOURCE-ADOPTION.json',{'schema':'1370-an-root-disposable-controls-source-adoption/v1','status':'ROOT_ADOPTED_REVIEWED_DISPOSABLE_PAIR_AND_DIRECT_EXEC_PARENT_SOURCE','sourcePins':sp,'sourceReview':rr,'parentAdapterSourcePins':ap,'parentAdapterSourceReview':ar,'recipe':role(Q/'RECIPE.json'),'runtimeTools':rt,'publishedOperationalPredecessor':publication,'executionAuthorization':False,'typesOrOriginalM0PreservationAccepted':False,'actualControlsAccepted':False,'preparationSeconds':60,'runtimeBounds':recipe['bounds'],'combinedPreparationRuntimeDeadline':None,'originalR1ClockAndHomeFindingsPreserved':True})
P.mkdir(mode=0o700)
g={'schema':'1370-disposable-controls-root-once-grant/v1','decision':'GRANTED_ONCE_DISPOSABLE_METADATA_CONTROLS','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executionAuthorization':True,'sourcePins':sp,'sourceReview':rr,'parentAdapterSourcePins':ap,'parentAdapterSourceReview':ar,'sourceAdoption':adoption,'rootLauncher':role(__file__),'recipe':role(Q/'RECIPE.json'),'config':role(Q/'CONFIG.json'),'runtimeTools':rt,'publishedPredecessor':publication,'operational':{'head':pub['head'],'sourceTree':pub['sourceTree'],'main':pub['trackedMain'],'branch':pub['branch'],'trackingWorkingHead':pub['head'],'localMainRef':'refs/remotes/origin/main','advertisedMainRef':'refs/heads/main'},'oneAggregateRun':True,'automaticRetry':False,'actualOutcome':None,'scope':'Disposable actual loader metadata RED/GREEN only; no original M0 writes, full source audit, types/collection admission, game or downstream acceptance.'}
for key in ('argv','cwd','bounds','environment'):g[key]=recipe[key]
gr=put(P/'GRANT.json',g);print(json.dumps({'grant':gr}),flush=True)
argv=[recipe['tools']['python']['path'],'-I','-B',str(B/'launch-disposable-controls.py'),gr['path'],gr['sha256']]
os.chdir('/Users/zacheryspector/The-Movies-headless-program');os.execve(argv[0],argv,dict(os.environ,**recipe['environment']))
