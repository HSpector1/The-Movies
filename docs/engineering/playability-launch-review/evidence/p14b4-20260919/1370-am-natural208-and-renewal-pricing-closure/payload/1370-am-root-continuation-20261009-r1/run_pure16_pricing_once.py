import datetime,hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';Q=S/'1370-c0-renewal208-pure16-pricing-filled-source-after-al-20261009-r1';C=S/'1370-c0-renewal208-pure16-controls-parent-recorded-after-al-20261009-r1';P=S/'1370-c0-renewal208-pure16-pricing-parent-recorded-after-al-20261009-r1'
def role(p):
 p=Path(p);assert p.resolve(strict=True)==p and not p.is_symlink();b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rp=S/'1370-c0-renewal208-pure16-pricing-filled-independent-source-review-after-al-20261009-r1/RECEIPT.json';rr=role(rp);assert rr['sha256']=='2397b7427328670a34cbd6bfa5fd0b3672a0bccf524f73718dc7fbf0eed9fd6e';rv=json.loads(rp.read_bytes());assert rv['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_PURE16_EXACT_FILL_AND_RECORDED_ROUTES' and rv['findings']==[] and rv['executionAuthorization'] is False
pins=role(Q/'SOURCE-PINS.json');assert pins==rv['sourcePins']==rv['routeSourcePins']
for r in json.loads((Q/'SOURCE-PINS.json').read_bytes())['files'].values():assert role(r['path'])==r
actual=json.loads((C/'ACTUAL-TOOL.json').read_bytes());assert actual['initial']['exit_code']==0 and not actual['polls'];assert (C/'controls.stdout').read_bytes()==b'';err=(C/'controls.stderr').read_text();assert err.startswith('.\n') and 'Ran 1 test in ' in err and err.endswith('\nOK\n')
g=json.loads((C/'CONTROLS-GRANT.json').read_bytes());assert g['ownPid']==g['ownPgid']==g['ownSid']==44455
checks=[]
for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:fn(44455,0)
 except ProcessLookupError:checks.append({'kind':label,'id':44455,'result':'ESRCH'})
 else:raise RuntimeError('STOP controls owner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
cr=put(A/'PURE16-CONTROLS-OBSERVED-ADOPTION.json',{'schema':'1370-root-pure16-controls-observed-adoption/v1','status':'ROOT_ADOPTED_ACTUAL_REPORT_PROTOCOL_CONTROLS','independentExactSourceReview':rr,'sourcePins':pins,'grant':role(C/'CONTROLS-GRANT.json'),'actualTool':role(C/'ACTUAL-TOOL.json'),'stdout':role(C/'controls.stdout'),'stderr':role(C/'controls.stderr'),'actualToolExit':0,'unittestMethods':1,'subtestsBySource':6,'predicateAssertionsBySource':10,'ownershipChecks':checks,'laneReleased':True,'pricing':False,'game':False,'executionAuthorization':False})
recipe=json.loads((Q/'RECIPE.json').read_bytes());assert recipe['config']==role(Q/'CONFIG.json') and recipe['recorder']==role(Q/'record-pure-node.py')
argv=recipe['argv'];assert argv[:3]==['/bin/bash',str(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh'),'0']
for path,key in ((argv[1],'helperSha256'),(argv[4],'pythonSha256')):assert role(path)['sha256']==recipe['tools'][key]
assert recipe['gameRootObservedAdoption']==role(A/'A208-GAME-OBSERVED-ADOPTION.json')
config=json.loads((Q/'CONFIG.json').read_bytes());assert role(config['nodePath'])['sha256']==recipe['tools']['nodeSha256']
for r in config['roles'].values():assert role(r['path'])==r
out=S/'1370-c0-renewal208-pure16-pricing-verification-output-after-al-20261009-r1';lane=Path(argv[3]);assert not os.path.lexists(P) and not os.path.lexists(out) and not os.path.lexists(lane.parent)
if os.getpgrp()!=os.getpid():os.setsid()
assert os.getpid()==os.getpgrp()==os.getsid(0)
P.mkdir(mode=0o700);lane.parent.mkdir(mode=0o700)
grant=put(P/'GRANT.json',{'schema':'1370-root-pure16-pricing-recorded-execution-grant/v1','status':'GRANTED_ONCE_EXACT_PURE16_PRICING','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executionAuthorization':True,'independentSourceReview':rr,'sourcePins':pins,'controlsObservedAdoption':cr,'recipe':role(Q/'RECIPE.json'),'rootLauncher':role(__file__),'argv':argv,'cwd':recipe['cwd'],'environment':recipe['environment'],'ownPid':os.getpid(),'ownPgid':os.getpgrp(),'ownSid':os.getsid(0),'directExecPreservesHelperIdentity':True,'boundsSeconds':{'node':60,'active':75,'whole':90},'stdoutAndStderrCapBytes':1048576,'ledgerCapBytes':65536,'game':False,'pricing':True,'renewalCauseAdmission':False,'actualOutcome':None,'automaticRetry':False})
print(json.dumps({'grant':grant,'ownPid':os.getpid(),'ownPgid':os.getpgrp()}),flush=True);os.chdir(recipe['cwd']);os.execve(argv[0],argv,dict(os.environ,**recipe['environment']))
