"""Finite exact observational gate. Completion never requires a hypothesis match."""
import json,math
class ReportStop(ValueError):pass
def need(ok,reason):
 if not ok:raise ReportStop('STOP_ZERO_PROBE_REPORT_'+reason)
def validate(mode,stdout,stderr,owned_pgid):
 need(mode=='probe','MODE');need(len(stdout)<=16384 and len(stderr)<=65536 and not stderr,'STREAM_CAP_OR_STDERR')
 need(stdout.endswith(b'\n') and len(stdout.splitlines())==1,'ONE_LINE')
 def unique(pairs):
  out={}
  for key,value in pairs:need(key not in out,'DUPLICATE_KEY');out[key]=value
  return out
 def nonfinite(value):raise ReportStop('STOP_ZERO_PROBE_NONFINITE')
 obj=json.loads(stdout,object_pairs_hook=unique,parse_constant=nonfinite)
 expected={'schema','status','failure','parentPid','ownedChildPid','ownedPgid','registeredBeforeReady','pgidConfirmed','sessionConfirmed','goSent','exitNotification','waitStatus','actualChildExit','reaped','probes','boundsSeconds','elapsedSeconds','uname','positiveSignalsSent','game','causeEstablished','executionAuthorization'}
 need(type(obj) is dict and set(obj)==expected,'FIELDS')
 need(obj['schema']=='a208-owned-exit-reap-zero-probe/v1' and obj['status']=='OWNED_EXIT_REAP_PROBE_COMPLETE_UNADOPTED' and obj['failure'] is None,'STATUS')
 need(type(obj['parentPid']) is int and obj['parentPid']==owned_pgid,'RECORDER_OWNED_PARENT')
 child=obj['ownedChildPid'];need(type(child) is int and child>1 and child!=owned_pgid and obj['ownedPgid']==child,'OWNED_CHILD')
 for key in ('registeredBeforeReady','pgidConfirmed','sessionConfirmed','goSent','reaped'):need(obj[key] is True,key)
 for key in ('positiveSignalsSent','game','causeEstablished','executionAuthorization'):need(obj[key] is False,key)
 need(type(obj['actualChildExit']) is int and obj['actualChildExit']==0 and type(obj['waitStatus']) is int and obj['waitStatus']==0,'NATURAL_EXIT_ZERO')
 need(obj['boundsSeconds']=={'naturalChild':2,'parent':20,'recorderWhole':30},'BOUNDS')
 need(type(obj['elapsedSeconds']) in (int,float) and math.isfinite(obj['elapsedSeconds']) and 0<=obj['elapsedSeconds']<20,'ELAPSED')
 ev=obj['exitNotification'];need(type(ev) is dict and set(ev)=={'ident','filter','flags','fflags','data','elapsedSeconds'} and ev['ident']==child,'OWNED_EVENT')
 # Darwin Python constants from the kqueue ABI: EVFILT_PROC=-5, NOTE_EXIT=0x80000000, EV_ERROR=0x4000.
 need(ev['filter']==-5 and type(ev['fflags']) is int and ev['fflags'] & 0x80000000 and type(ev['flags']) is int and not ev['flags'] & 0x4000,'EXIT_EVENT')
 rows=obj['probes'];need(type(rows) is list and len(rows)==9,'EXACT_NINE')
 previous=-1
 for row,(phase,operation) in zip(rows,[(phase,operation) for phase in ('live_ready','exit_notified_unreaped','after_reap') for operation in ('getpgid','killpg','kill')]):
  need(type(row) is dict and set(row)=={'phase','operation','target','signal','outcome','value','errno','exception','elapsedSeconds'},'ROW_FIELDS')
  need(row['phase']==phase and row['operation']==operation and type(row['target']) is int and row['target']==child and (row['signal'] is None if operation=='getpgid' else type(row['signal']) is int and row['signal']==0),'EXACT_TARGET_ROSTER_ZERO')
  t=row['elapsedSeconds'];need(type(t) in (int,float) and math.isfinite(t) and 0<=t and previous<=t<=obj['elapsedSeconds'],'ROW_TIME');previous=t
  need(row['outcome'] in ('ok','error'),'OUTCOME')
  if row['outcome']=='ok':need(row['errno'] is None and row['exception'] is None and (type(row['value']) is int if operation=='getpgid' else row['value'] is None),'OK_RESULT')
  else:need(type(row['errno']) is int and row['errno']>0 and type(row['exception']) is str and 0<len(row['exception'])<=64 and row['value'] is None,'ERROR_RESULT')
  if phase=='live_ready':need(row['outcome']=='ok' and (row['value']==child if operation=='getpgid' else True),'LIVE_OWNERSHIP')
 need(type(ev['elapsedSeconds']) in (int,float) and math.isfinite(ev['elapsedSeconds']) and 0<=ev['elapsedSeconds']<=rows[3]['elapsedSeconds'],'EVENT_PRECEDES_UNREAPED_PROBES')
 need(type(obj['uname']) is dict and set(obj['uname'])=={'sysname','nodename','release','version','machine'} and obj['uname']['sysname']=='Darwin' and all(type(v) is str and len(v.encode('utf-8'))<=1024 for v in obj['uname'].values()),'UNAME')
 return {'protocol':obj['schema'],'rows':9,'naturalChildExit':0,'observationalOnly':True,'positiveSignalsSent':False,'causeEstablished':False}
