import datetime,hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';Q=S/'1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r4'
def role(p):
 p=Path(p);assert p.resolve(strict=True)==p and not p.is_symlink();b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==2
mode=sys.argv[1];assert mode=='types';profiles=json.loads((Q/'PROFILES.json').read_bytes());profile=profiles[mode]
pr=role(Q/'SOURCE-PINS.json');assert pr['sha256']=='f27d8eae1416d94346dd43e495acad272bd203dfb1270c818e2ca949bdb35d15'
for r in json.loads((Q/'SOURCE-PINS.json').read_bytes())['files'].values():assert role(r['path'])==r
rp=S/'1370-c0-m0-proof-types-parent-launch-preparation-independent-source-review-after-al-20261009-r4/RECEIPT.json';rr=role(rp);assert rr['sha256']=='63f3482c050b339375eb868178a614ff5d2191b2712cc454e619094c127306c5';rv=json.loads(rp.read_bytes());assert rv['decision'].startswith('ACCEPT_') and rv['executionAuthorization'] is False
review_paths={'proof':('1370-c0-m0-current-source-dependency-proof-source-independent-review-after-al-20261009-r2','65dfe1810fc36a1c467f3c4e44e578368eb18dde71f3b737fba794a57b972030'),'types':('1370-c0-m0-types-collection-source-independent-review-after-al-20261009-r6','0b2402bc664192c3a57b73bed3ce7e461d50171e8d01d5d0261ed4c921a101ea')}
name,sha=review_paths[mode];sr=role(S/name/'RECEIPT.json');assert sr['sha256']==sha;source_review=json.loads(Path(sr['path']).read_bytes());assert source_review['decision']==profile['sourceReviewDecision'] and source_review['executionAuthorization'] is False
for name,r in dict(profile['executableRoles'],**{'CONFIG.json':profile['config']}).items():assert role(r['path'])==r==source_review['sourcePins'][name]
prepath=A/('M0-'+mode.upper()+'-PREFLIGHT-OBSERVED-ADOPTION-R6.json');pre=json.loads(prepath.read_bytes());assert pre['status']=='ROOT_ADOPTED_ORIGINAL_CURRENT_ROOT_PREFLIGHT' and pre['mode']==mode and pre['toolExit']==0 and pre['scannerAbsent'] is True and pre['protectedFreezeContinues'] is True
toolsrole=role(A/'M0-RUNTIME-TOOLS.json');assert toolsrole['sha256']=='62be5c7f93316af15d73952140d2ef77316efbf27d73887871eb38f4abf8df7b';runtime=json.loads(Path(toolsrole['path']).read_bytes())['runtimeTools']
spec=json.loads((Q/(mode.upper()+'-SPEC-UNFILLED.json')).read_bytes());spec.update(executionAuthorization=True,sourceReview=sr,runtimeTools=runtime)
if mode=='types':
 spec['currentProtection']=role(A/'M0-CURRENT-TYPES-PROTECTION-R6.json');prot=json.loads(Path(spec['currentProtection']['path']).read_bytes());assert prot['m0TypesProtectionAccepted'] is True and prot['fullProtectedPostflightAccepted'] is True;spec['additionalRefs']=prot['additionalRefs']
else:assert spec['currentProtection'] is None and spec['additionalRefs']=={}
P=Path(profile['parentPath']);assert not os.path.lexists(P) and not os.path.lexists(profile['laneLog']) and not os.path.lexists(profile['laneLog']+'.meta') and not os.path.lexists(profile['resultRoot']) and not os.path.lexists(profile['recorderResult']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);sp=P/'FILLED-SPEC.json';specrole=put(sp,spec)
mp=json.loads((Q/'MAP.json').read_bytes());argv=mp['helperInvocations'][mode][:];argv[-2:]=[str(sp),specrole['sha256']];assert argv[:3]==['/bin/bash',str(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh'),'0'];assert argv[3]==profile['laneLog'] and argv[7]==str(Q/'fill-grant-exec.py')
assert role(argv[1])==mp['helper'];assert role(argv[4])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
g={'schema':'1370-root-m0-once-recorded-lane-grant/v1','status':'GRANTED_ONCE_EXACT_M0_'+mode.upper(),'executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':mode,'sourceReview':sr,'parentFillAndPrelaunchSourceReview':rr,'parentSourcePins':pr,'sourcePins':profile['sourcePins'],'preflightObservedAdoption':role(prepath),'clockScopeAdoption':role(A/'M0-CLOCK-STREAM-SCOPE-ADOPTION.json'),'runtimeToolsObservation':toolsrole,'filledSpec':specrole,'rootLauncher':role(__file__),'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':{'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'ownedOuterHelperPid':os.getpid(),'ownedOuterHelperPgid':os.getpgrp(),'ownedOuterHelperSid':os.getsid(0),'directExecPreservesOuterHelperIdentity':True,'preparationSeconds':60,'runtimeBoundsSeconds':{'runner':300,'active':320,'whole':330},'runtimeClockStartsInsideUnchangedLAUNCH':True,'combinedFillRuntime330Claim':False,'originalChildCommandStreamCapsBytes':8388608,'helperCapture':'Original r8 combined log; no added live parent byte limiter','actualOutcome':None,'game':False,'proofOrTypesAccepted':False,'automaticRetry':False,'protectedFreezeContinues':True}
gr=put(P/'ROOT-LANE-GRANT.json',g);print(json.dumps({'grant':gr,'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True);os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,**g['environment']))
