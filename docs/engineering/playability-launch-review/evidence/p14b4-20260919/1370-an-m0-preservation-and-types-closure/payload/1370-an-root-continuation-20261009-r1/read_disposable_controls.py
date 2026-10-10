import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
P=S/'1370-an-disposable-metadata-controls-parent-recorded-20261009-r1'
Q=S/'1370-c0-m0-config-bundle-metadata-disposable-controls-source-after-al-20261009-r2'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 raw=p.read_bytes();assert st==p.lstat();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def put(p,obj):
 with p.open('x') as f:json.dump(obj,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
grant=read(P/'GRANT.json');claim=read(P/'LAUNCH-CLAIM.json');actual=read(P/'ACTUAL-TOOL.json');recipe=read(Q/'RECIPE.json')
assert role(P/'GRANT.json')['sha256']=='77db69b8567732fcf70dbc432f007c9571fe12cca7ddd706363fad5170eb64e7'
assert role(P/'LAUNCH-CLAIM.json')['sha256']=='93840ab4b17a117b069269975da059f9146d57317d9de97e076ea8e504f02c42'
assert actual['actualExit']==0 and type(actual['actualExit']) is int and actual['toolResult']['exit_code']==0 and actual['launchClaim']==role(P/'LAUNCH-CLAIM.json')
output=Path(recipe['recorderOutput']);result=read(output/'RESULT.json');report=read(output/'stdout.bin')
assert result['actualChildExit']==0 and result['groupClear'] is True and result['timedOut'] is False
assert result['status']=='M0_DISPOSABLE_METADATA_VERIFICATION_COMPLETE_UNADOPTED'
assert report['status']=='M0_CONFIG_METADATA_CONTROLS_AGREE' and [x['actualExit'] for x in report['arms']]==[0,0]
absent=[]
for kind,values in [('pid',[claim['helperPid'],result['childPid']]),('pgid',[claim['helperPgid'],result['ownedPgid']])]:
 for value in values:
  assert type(value) is int and value>1
  try:
   if kind=='pid':os.kill(value,0)
   else:os.killpg(value,0)
  except ProcessLookupError:absent.append({'kind':kind,'id':value,'result':'ESRCH'})
  else:raise RuntimeError('Owned identity remains live: '+str(value))
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(output/'OVERRIDE-STOP.json')
lane=Path(recipe['laneLog']);meta=Path(recipe['laneLog']+'.meta');lines=meta.read_text().splitlines()
assert sum(x.startswith('start; ') for x in lines)==1 and sum(x.startswith('end, exit 0; ') for x in lines)==1 and not any('STOP:' in x for x in lines)
fresh=put(P/'FRESH-OWNED-ABSENCE.json',{'schema':'1370-an-scoped-owned-absence/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':absent,'laneLockAbsent':True,'overrideStopAbsent':True,'overrideStopPath':str(output/'OVERRIDE-STOP.json')})
o={'schema':'1370-disposable-controls-completed-outcome/v1','status':'ACTUAL_DISPOSABLE_METADATA_CONTROLS_COMPLETED','sourcePins':grant['sourcePins'],'sourceReview':grant['sourceReview'],'grant':role(P/'GRANT.json'),'launchClaim':role(P/'LAUNCH-CLAIM.json'),'actualTool':role(P/'ACTUAL-TOOL.json'),'recipe':grant['recipe'],'config':grant['config'],'recorderResult':role(output/'RESULT.json'),'producerStdout':role(output/'stdout.bin'),'producerStderr':role(output/'stderr.bin'),'helperCombinedLog':role(lane),'laneMeta':role(meta),'actualExits':{'tool':0,'helper':0,'recorder':0,'controller':0,'RED':0,'GREEN':0},'helperPid':claim['helperPid'],'helperPgid':claim['helperPgid'],'helperSid':claim['helperSid'],'actualOwnedPidsFreshlyAbsent':[claim['helperPid'],result['childPid']],'actualOwnedGroupsFreshlyAbsent':[claim['helperPgid'],result['ownedPgid']],'laneReleased':True,'overrideStopAbsent':True,'oneAggregateRun':True,'automaticRetry':False}
outcome=put(P/'OUTCOME.json',o)
(P/'ACTUAL-TOOL.json').chmod(0o444)
print(json.dumps({'outcome':outcome,'freshOwnedAbsence':fresh,'recorderSeconds':result['elapsedSeconds'],'controllerSeconds':report['aggregateElapsedSeconds'],'metadata':[{'arm':x['arm'],'metadata':x['metadata']} for x in report['arms']]}),flush=True)
argv=[recipe['tools']['python']['path'],'-I','-B',str(Q/'consume-controls.py'),outcome['path'],outcome['sha256']]
os.execve(argv[0],argv,dict(os.environ,PYTHONDONTWRITEBYTECODE='1'))
