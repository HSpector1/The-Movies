"""HELD SOURCE ONLY: one exact-owned natural-exit child, zero probes around reap.
No candidate import, game, process discovery, or positive signal dispatch.
"""
import hashlib,json,os,pathlib,select,signal,stat,sys,time
CHILD_SECONDS=2;PARENT_SECONDS=20;SUMMARY_CAP=16384
STATUS='OWNED_EXIT_REAP_PROBE_COMPLETE_UNADOPTED'
REGISTRY=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-a208-owned-zombie-diagnostic-parent-after-ak-20261009-r2/OWNED-MICROCHILD.jsonl');REGISTRY_CAP=4096;RECORD_CAP=1024
def need(value,reason):
 if not value:raise RuntimeError('STOP_'+reason)
def hard_deadline(signum,frame):os._exit(124)
def run():
 start=time.monotonic();end=start+PARENT_SECONDS
 signal.signal(signal.SIGALRM,hard_deadline);signal.setitimer(signal.ITIMER_REAL,PARENT_SECONDS)
 child=None;reaped=False;wait_status=None;kq=None;fds=[];rows=[];failure=None
 pgid_confirmed=False;session_confirmed=False;exit_event=None;go_sent=False;registered=False
 registry_fd=None;registry_raw=bytearray();registry_rows=0;initial_durable=False;ready_durable=False
 def guard():need(time.monotonic()<end,'PARENT_20_SECONDS')
 def persist(phase):
  nonlocal registry_fd,registry_rows,initial_durable,ready_durable
  guard()
  if registry_fd is None:
   parent=REGISTRY.parent;st=parent.lstat()
   need(parent.resolve(strict=True)==parent and stat.S_ISDIR(st.st_mode) and not parent.is_symlink() and stat.S_IMODE(st.st_mode)==0o700 and st.st_uid==os.geteuid(),'PHYSICAL_PRIVATE_REGISTRY_PARENT')
   registry_fd=os.open(REGISTRY,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
   after=parent.lstat();need((after.st_dev,after.st_ino,after.st_mode,after.st_uid)==(st.st_dev,st.st_ino,st.st_mode,st.st_uid) and parent.resolve(strict=True)==parent,'REGISTRY_PARENT_IDENTITY_RACE')
  row={'schema':'a208-owned-microchild-registry/v1','phase':phase,'parentPid':os.getpid(),'pid':child,'pgid':child if pgid_confirmed else None,'sid':child if session_confirmed else None,'registeredBeforeReady':registered,'pgidConfirmed':pgid_confirmed,'sessionConfirmed':session_confirmed,'goSent':go_sent,'reaped':reaped,'waitStatus':wait_status,'elapsedSeconds':time.monotonic()-start}
  raw=(json.dumps(row,sort_keys=True,separators=(',',':'),allow_nan=False)+'\n').encode()
  need(len(raw)<=RECORD_CAP and len(registry_raw)+len(raw)<=REGISTRY_CAP,'REGISTRY_CAP')
  guard();need(os.write(registry_fd,raw)==len(raw),'REGISTRY_COMPLETE_WRITE');guard()
  os.fsync(registry_fd);guard() # Parent20 alarm stays unmasked across every IO.
  registry_raw.extend(raw);registry_rows+=1
  if phase=='forked':initial_durable=True
  if phase=='ready':ready_durable=True
 def capture(phase,op):
  guard();row={'phase':phase,'operation':op,'target':child,'signal':0 if op!='getpgid' else None}
  try:
   if op=='getpgid':value=os.getpgid(child)
   elif op=='killpg':value=os.killpg(child,0)
   elif op=='kill':value=os.kill(child,0)
   else:raise RuntimeError('STOP_UNKNOWN_OPERATION')
   row.update(outcome='ok',value=value,errno=None,exception=None)
  except OSError as exc:
   row.update(outcome='error',value=None,errno=exc.errno,exception=type(exc).__name__[:64])
  row['elapsedSeconds']=time.monotonic()-start;rows.append(row);guard()
 def snapshot(phase):
  for op in ('getpgid','killpg','kill'):capture(phase,op)
 def reap():
  nonlocal reaped,wait_status
  while not reaped:
   guard();got,status=os.waitpid(child,os.WNOHANG);guard()
   if got==child:reaped=True;wait_status=status;return
   need(got==0,'WAITPID_OTHER_TARGET');time.sleep(min(.005,max(0,end-time.monotonic())))
 try:
  need(sys.dont_write_bytecode and sys.flags.isolated and not sys.flags.optimize,'PINNED_I_B')
  need(len(sys.argv)==3 and sys.argv[1]=='probe' and sys.argv[2]==str(REGISTRY),'EXACT_ARGV')
  need(sys.platform=='darwin' and hasattr(select,'kqueue'),'DARWIN_KQUEUE_REQUIRED')
  need(signal.getsignal(signal.SIGCHLD)==signal.SIG_DFL,'SIGCHLD_DEFAULT_REQUIRED')
  rr,rw=os.pipe();gr,gw=os.pipe();fds.extend((rr,rw,gr,gw))
  mask=signal.pthread_sigmask(signal.SIG_BLOCK,{signal.SIGALRM})
  try:
   pid=os.fork()
   if pid==0:
    try:
     signal.setitimer(signal.ITIMER_REAL,0)
     signal.signal(signal.SIGALRM,hard_deadline);signal.setitimer(signal.ITIMER_REAL,CHILD_SECONDS)
     signal.pthread_sigmask(signal.SIG_SETMASK,mask)
     os.close(rr);os.close(gw);os.setsid()
     os.write(rw,(str(os.getpid())+'\n').encode('ascii'));os.close(rw)
     token=os.read(gr,1);os.close(gr)
     os._exit(0 if token==b'G' else 126)
    except BaseException:os._exit(126)
   child=pid;registered=True # Register before unmask, READY, GO, or any wait.
  finally:signal.pthread_sigmask(signal.SIG_SETMASK,mask)
  persist('forked') # Durable numeric child identity before READY processing or GO.
  os.close(rw);fds.remove(rw);os.close(gr);fds.remove(gr)
  guard();need(child>1 and child!=os.getpid(),'EXACT_OWNED_PID')
  readable,_,_=select.select([rr],[],[],max(0,end-time.monotonic()));guard()
  need(readable==[rr] and os.read(rr,64)==(str(child)+'\n').encode('ascii'),'EXACT_READY')
  os.close(rr);fds.remove(rr)
  guard();pgid_confirmed=os.getpgid(child)==child;guard()
  session_confirmed=os.getsid(child)==child;guard()
  need(pgid_confirmed and session_confirmed and child!=os.getpgrp(),'OWNED_SETSID_PROOF')
  persist('ready');need(initial_durable and ready_durable,'DURABLE_OWNERSHIP_BEFORE_GO')
  kq=select.kqueue()
  change=select.kevent(child,filter=select.KQ_FILTER_PROC,flags=select.KQ_EV_ADD|select.KQ_EV_ONESHOT,fflags=select.KQ_NOTE_EXIT)
  kq.control([change],0,0);guard() # Register while child is still blocked on GO.
  snapshot('live_ready')
  need(all(row['outcome']=='ok' for row in rows),'LIVE_ZERO_PROBE_REFUSAL')
  guard();need(os.write(gw,b'G')==1,'EXACT_GO');go_sent=True
  os.close(gw);fds.remove(gw)
  events=kq.control(None,1,max(0,end-time.monotonic()));guard()
  need(len(events)==1,'EXACT_EXIT_NOTIFICATION')
  ev=events[0]
  need(ev.ident==child and ev.filter==select.KQ_FILTER_PROC and ev.fflags & select.KQ_NOTE_EXIT and not ev.flags & select.KQ_EV_ERROR,'OWNED_EXIT_NOTIFICATION')
  exit_event={'ident':ev.ident,'filter':ev.filter,'flags':ev.flags,'fflags':ev.fflags,'data':ev.data,'elapsedSeconds':time.monotonic()-start}
  # NOTE_EXIT does not alone claim the precise kernel SZOMB transition time.
  # No wait/poll happened before these probes; actual wait status is captured next.
  snapshot('exit_notified_unreaped')
  reap();need(os.WIFEXITED(wait_status) and os.WEXITSTATUS(wait_status)==0,'NATURAL_EXIT_ZERO')
  snapshot('after_reap') # Read-only zero probes; never send a positive signal after reap.
  persist('reaped')
 except BaseException as exc:failure=(type(exc).__name__+':'+str(exc))[:192]
 finally:
  for fd in fds:
   try:os.close(fd)
   except OSError:pass
  if kq is not None:kq.close()
  if child is not None and not reaped:
   try:reap() # Exact child only; its2s selfdeadline bounds failure paths too.
   except BaseException as exc:failure=failure or ('reap:'+type(exc).__name__)[:192]
  if registry_fd is not None:os.close(registry_fd)
  guard()
  result={'schema':'a208-owned-exit-reap-zero-probe/v2','status':STATUS if failure is None else 'STOP_OWNED_EXIT_REAP_PROBE','failure':failure,'parentPid':os.getpid(),'ownedChildPid':child,'ownedPgid':child,'registeredBeforeReady':registered,'pgidConfirmed':pgid_confirmed,'sessionConfirmed':session_confirmed,'goSent':go_sent,'exitNotification':exit_event,'ownedRegistry':{'path':str(REGISTRY),'bytes':len(registry_raw),'sha256':hashlib.sha256(registry_raw).hexdigest(),'records':registry_rows,'beforeGoDurable':initial_durable and ready_durable},'waitStatus':wait_status,'actualChildExit':None if wait_status is None else os.waitstatus_to_exitcode(wait_status),'reaped':reaped,'probes':rows,'boundsSeconds':{'naturalChild':CHILD_SECONDS,'parent':PARENT_SECONDS,'recorderWhole':30},'elapsedSeconds':time.monotonic()-start,'uname':{key:getattr(os.uname(),key) for key in ('release','version','machine')},'positiveSignalsSent':False,'game':False,'causeEstablished':False,'executionAuthorization':False}
  raw=(json.dumps(result,sort_keys=True,separators=(',',':'),allow_nan=False)+'\n').encode();need(len(raw)<=SUMMARY_CAP,'SUMMARY_CAP')
  os.set_blocking(1,False);guard();need(os.write(1,raw)==len(raw),'COMPLETE_STDOUT_WRITE');guard()
  signal.setitimer(signal.ITIMER_REAL,0)
 return 0 if failure is None else 2
if __name__=='__main__':
 try:sys.exit(run())
 except BaseException as exc:
  if isinstance(exc,SystemExit):raise
  os._exit(2)
