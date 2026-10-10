import datetime,hashlib,json,os,sys,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';Q=S/'1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r2'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==2
mode=sys.argv[1];assert mode=='types';profile=json.loads((Q/'PROFILES.json').read_bytes())[mode];mapping=json.loads((Q/'MAP.json').read_bytes())
review=S/'1370-c0-m0-proof-types-parent-launch-preparation-independent-source-review-after-al-20261009-r2/RECEIPT.json';assert role(review)['sha256']=='d60c40db318d682289988ad4c86fa27d964d2c555e85d18919def1a1dc794d7c'
for r in json.loads((Q/'SOURCE-PINS.json').read_bytes())['files'].values():assert role(r['path'])==r
parent=Path(profile['parentPath']);rb=json.loads((parent/'READBACK.json').read_bytes());assert rb['toolExit']==rb['helperExit']==rb['recorderExit']==rb['runnerExit']==1 and rb['laneReleased'] is True and rb['mode']==mode and rb['status']=='ACTUAL_M0_TYPES_STOP_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW' and rb['rootCompilerExit']==2 and rb['sourceProofsEqual'] is True and rb['dependencyProofsEqual'] is True
ids=rb['recordedOwnedIds'];assert type(ids) is list and len(ids)==3 and ids==sorted(set(ids))
checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('STOP prior owned identity present')
for key in ('baseline','config','copyAdmission','source'):r=mapping['postflightOriginalRoles'][key];assert role(r['path'])==r
argv=mapping['postflightArgv'][mode][:];argv[-1]=','.join(map(str,ids));output=Path(mapping['postflightOriginalRoles']['source']['path']).parent/'evidence'/argv[-4]
P=S/('1370-c0-m0-'+mode+'-fullguard-postflight-parent-after-al-20261009-r2');assert not os.path.lexists(P) and not os.path.lexists(output) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);out=P/'postflight.stdout';err=P/'postflight.stderr'
g={'schema':'1370-root-m0-direct-original-shared-full-postflight-grant/v1','status':'GRANTED_ONCE_ORIGINAL_SHARED_FULL_POSTFLIGHT_AFTER_TYPE_FAILURE','priorTypeFailurePreserved':True,'mode':mode,'executionAuthorization':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startMonotonic':time.monotonic(),'rootLauncher':role(__file__),'parentRouteSourceReview':role(review),'argumentMap':role(Q/'MAP.json'),'actualRouteReadback':role(parent/'READBACK.json'),'guardSource':mapping['postflightOriginalRoles']['source'],'guardConfig':mapping['postflightOriginalRoles']['config'],'baseline':mapping['postflightOriginalRoles']['baseline'],'argv':argv,'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':{'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'ownedScannerPid':os.getpid(),'ownedScannerPgid':os.getpgrp(),'ownedScannerSid':os.getsid(0),'directExecPreservesPid':True,'actualPriorOwnedIds':ids,'priorOwnedIdentityPostChecks':checks,'outputDirectory':str(output),'stdoutPath':str(out),'stderrPath':str(err),'perCommandTimeoutSeconds':180,'wholeScanDeadline':None,'noHelperOriginalLockAbsentRequired':True,'rawPsFdLocalOnly':True,'protectedFreezeContinues':True,'scope':'Unchanged original A208/shared nine-root/R9/dependency/fullprotected maps under currentAL. Actual completeM0source/deps proofs remain separate originalroute results.','proofOrTypesAccepted':False,'automaticRetry':False}
gr=put(P/'GRANT.json',g);print(json.dumps({'grant':gr,'scannerPid':os.getpid(),'scannerPgid':os.getpgrp()}),flush=True)
fo=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);fe=os.open(err,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);os.dup2(fo,1);os.dup2(fe,2);os.close(fo);os.close(fe);os.chdir(g['cwd']);os.execve(argv[0],argv,dict(os.environ,**g['environment']))
