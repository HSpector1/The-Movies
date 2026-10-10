import os,json,hashlib,pathlib,datetime,uuid
S=pathlib.Path('/Users/zacheryspector/studio-scratch'); A=S/'1370-am-root-continuation-20261009-r1'
P=S/'1370-c0-a208-game-parent-recorded-after-al-20261009-r4'
def role(p,expected=None):
 p=pathlib.Path(p); b=p.read_bytes(); h=hashlib.sha256(b).hexdigest()
 assert expected is None or h==expected,(str(p),h)
 return {'path':str(p),'bytes':len(b),'sha256':h}
def read(p,expected=None):
 r=role(p,expected);return json.loads(pathlib.Path(p).read_bytes()),r
def put(p,d):
 b=(json.dumps(d,indent=2,sort_keys=True)+'\n').encode()
 with open(p,'xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 os.chmod(p,0o444);assert p.read_bytes()==b
 return role(p)
def authenticate(v):
 if isinstance(v,dict):
  if isinstance(v.get('path'),str) and isinstance(v.get('sha256'),str):
   r=role(v['path'],v['sha256']);assert 'bytes' not in v or r['bytes']==v['bytes']
  for x in v.values():authenticate(x)
 elif isinstance(v,list):
  for x in v:authenticate(x)
m,mr=read(S/'1370-c0-a208-final-external-game-grant-fieldmap-after-al-20261009-r1/MAP.json','65d00ce1f69622875b35290694424b7ce1a9329e54394b5d8008df0d14037bc3')
r,rr=read(S/'1370-c0-a208-adopted-preflight-independent-observed-review-after-al-20261009-r2/RECEIPT.json','8465f006d60042f2ebb3a8e0f3f47fcf6ba425fa50a598881c9deaeb50075763')
assert r['decision']=='ACCEPT_OBSERVED_ADOPTION_AND_ADOPTED_PREFLIGHT_UNRUN' and r['findings']==[]
f=m['fieldsForSeparateParentFinalGrant'];authenticate(f)
pre,pr=read(r['actualAdoptedPreflight']['path'],r['preflightRawSha256'])
launch,lr=read(f['adoptedLaunch']['path'],f['adoptedLaunch']['sha256'])
binding,br=read(f['adoptedBinding']['path'],f['adoptedRawBindingSha256'])
assert binding['witnessGrant'] is None and launch['argv']==f['exactArgv']==r['exactGameProposal']['argv']
assert launch['bounds']==f['bounds']==r['exactGameProposal']['bounds']
assert launch['cwd']==f['cwd']==os.getcwd()
assert not (S/'HEAVY-LANE-LOCK').exists()
for p in [f['onceOnlyLane']['logPath'],f['onceOnlyLane']['metaPath']]:assert not os.path.lexists(p)
assert not P.exists();P.mkdir(mode=0o700)
lane=pathlib.Path(f['onceOnlyLane']['path']);lane.mkdir(mode=0o700,exist_ok=True)
assert list(lane.iterdir())==[]
adopt={'schema':'1370-root-a208-observed-adoption-and-preflight-adoption/v1','status':'ROOT_ADOPTED_OBSERVED_ADOPTION_AND_PREFLIGHT_UNRUN','independentReview':rr,'actualAdoptedPreflight':pr,'adoptedBinding':br,'adoptedLaunch':lr,'bindingSemanticSha256':f['bindingSemanticSha256'],'exactCandidateReview':f['exactCandidateReview'],'actualGuardBaseline':f['actualGuardBaseline'],'actualGuardAfterFill':f['actualGuardAfterFill'],'actualAdoptionReadback':f['actualAdoptionReadback'],'actualControlsAdoption':f['actualControlsAdoption'],'archiveSixAndAuthorizationThreeAccepted':True,'originalFullMapReuseUnderContinuousFreezeAccepted':True,'protectedFreezeContinues':True,'executionAuthorization':False,'gameAccepted':False,'finalGrant':None,'scopeLimit':'Observed preparation only; separate exclusive final grant, actual game, full postflight and independent raw208/full416 admission still required.'}
ar=put(A/'A208-ADOPTED-PREFLIGHT-OBSERVED-ADOPTION.json',adopt)
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpgrp()==os.getpid()
ids={'pid':os.getpid(),'pgid':os.getpgrp(),'sid':os.getsid(0),'directExecHelperSamePid':True}
grant=dict(f)
grant.update(schema='1370-root-exclusive-external-a208-game-grant/v1',status='GRANTED_ONCE_EXACT_ADOPTED_A208_GAME',executionAuthorization=True,gameAccepted=False,issuedUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),finalGrantIdentity=str(uuid.uuid4()),ownerIdsMeasuredAtIssue=ids,admittedAdoptedPreflight=pr,independentActualPreflightReview=rr,rootActualPreflightAdoption=ar,fieldMap=mr,protectedFreezeContinues=True,requiredObservedAcceptance=launch['requiredObservedAcceptance'],actualCaptureRequirements=m['actualCaptureRequirements'],grantIsExternalToBinding=True,bindingWitnessGrantMustRemainNull=True,helperPrechildWaitIsNotAuthorized=True,actualGame=None)
gr=put(P/'FINAL-GAME-GRANT.json',grant)
print(json.dumps({'status':'ROOT_FINAL_GAME_GRANT_ISSUED_EXECUTING_EXACT_ONCE','grant':gr,'rootPreflightAdoption':ar,'ownerIds':ids,'argv':f['exactArgv']},sort_keys=True),flush=True)
env=os.environ.copy();env.update(f['environment'])
os.execve(f['exactArgv'][0],f['exactArgv'],env)
