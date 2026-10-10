import os,signal,time
START=time.monotonic();ACTIVE=45;WHOLE=55
class ControlStop(KeyboardInterrupt):pass
SLOTS=[];HISTORY=[];POPENS=[];REG=None
REAL_FORK=os.fork;REAL_WAIT=os.waitpid
MASK={signal.SIGALRM};PHASE='suite';STOP=None;ROOT=None;CLEANUP=None

def cap_check():
 if ROOT is None:return
 total=0
 for parent,dirs,files in os.walk(ROOT,followlinks=False):
  for name in dirs+files:
   try:st=os.lstat(os.path.join(parent,name))
   except FileNotFoundError:continue  # Own TemporaryDirectory cleanup may remove it.
   if stat.S_ISREG(st.st_mode):total+=st.st_size
   elif not stat.S_ISDIR(st.st_mode):raise ControlStop('owned fixture special file')
 if total>8*1024**2:raise ControlStop('8 MiB owned fixture cap')

def group_alive(pid):
 try:os.killpg(pid,0);return True
 except ProcessLookupError:return False
 except PermissionError:return True

def refresh():
 for slot in SLOTS:
  if not slot['ready']:
   try:slot['ready']=os.getpgid(slot['pid'])==slot['pid']
   except ProcessLookupError:pass

def deadline_guard():
 if time.monotonic()-START>=WHOLE:os._exit(124)

def cleanup_snapshot():
 remaining,interval=signal.getitimer(signal.ITIMER_REAL)
 handler=signal.getsignal(signal.SIGALRM)
 return {'pid':os.getpid(),'pgrp':os.getpgrp(),'session':os.getsid(0),'euid':os.geteuid(),
  'alarmHandler':'SIG_DFL' if handler==signal.SIG_DFL else 'SIG_IGN' if handler==signal.SIG_IGN else getattr(handler,'__name__','callable'),
  'timerRemaining':remaining,'timerInterval':interval,'alarmBlocked':None,'phase':PHASE}

def diagnostic_emitter(raw):
 # The recorder already drains this existing pipe. Never write to a regular file.
 deadline_guard()
 if os.write(1,raw)!=len(raw):raise OSError('short nonblocking diagnostic write')
 deadline_guard()

def cleanup_group_probe(pid):
 os.killpg(pid,0);return True

def hard_kill():
 deadline_guard()
 try:CLEANUP.cleanup_targets(SLOTS,POPENS,killpg=os.killpg,kill=os.kill,getpgid=os.getpgid,poll=lambda child:child.poll())
 except CleanupDeadline:os._exit(124)

def alarm(signum,frame):
 global STOP
 elapsed=time.monotonic()-START
 if elapsed>=WHOLE:os._exit(124)  # No recursive cleanup or diagnostics after deadline.
 if PHASE=='suite':refresh()  # Cleanup refresh belongs to bounded per-target attempts.
 try:cap_check()
 except ControlStop as exc:
  STOP=STOP or str(exc)
  if PHASE=='suite':raise
  if CLEANUP is not None:CLEANUP.refuse('cleanup-error')
 if PHASE=='suite' and elapsed>=ACTIVE:STOP=STOP or '45-second active suite cap';raise ControlStop(STOP)

def tracked_fork():
 previous=signal.pthread_sigmask(signal.SIG_BLOCK,MASK)
 slot={'pid':None,'ready':False,'reaped':False};SLOTS.append(slot)
 try:
  if time.monotonic()-START>=ACTIVE:raise ControlStop('before-fork cap')
  pid=REAL_FORK()
  if pid==0:return 0
  slot['pid']=pid
 finally:
  if slot['pid'] is None and slot in SLOTS:SLOTS.remove(slot)
  signal.pthread_sigmask(signal.SIG_SETMASK,previous)
 # Ownership is assigned before durability; no blocking file write while masked.
 os.write(REG,(json.dumps({'event':'ownedFork','pid':pid})+'\n').encode());os.fsync(REG)
 return pid

def tracked_wait(pid,flags):
 if flags not in (0,os.WNOHANG):raise ControlStop('unexpected wait')
 while True:
  previous=signal.pthread_sigmask(signal.SIG_BLOCK,MASK)
  try:
   refresh();got,status=REAL_WAIT(pid,os.WNOHANG)
   if got:
    for slot in SLOTS:
     if slot['pid']==got:slot['reaped']=True;slot['exit']=os.waitstatus_to_exitcode(status);slot['waitStatus']=status;slot['groupClear']=not group_alive(got)
  finally:signal.pthread_sigmask(signal.SIG_SETMASK,previous)
  if flags==os.WNOHANG or got:return got,status
  time.sleep(.025)

signal.signal(signal.SIGALRM,alarm);signal.setitimer(signal.ITIMER_REAL,.25,.25)
import hashlib,json,importlib.util,sys,unittest,subprocess,stat
from pathlib import Path
HERE=Path(__file__).parent
cleanup_spec=importlib.util.spec_from_file_location('owned_cleanup',HERE/'owned_cleanup.py')
cleanup_module=importlib.util.module_from_spec(cleanup_spec);cleanup_spec.loader.exec_module(cleanup_module)
CleanupDeadline=cleanup_module.CleanupDeadline

def need(ok,why):
 if not ok:raise ControlStop(why)
def sha(b):return hashlib.sha256(b).hexdigest()
def exclusive(path,raw):
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
def auth(role):
 path=Path(role['path']);before=path.lstat();need(path.resolve(strict=True)==path and stat.S_ISREG(before.st_mode) and before.st_nlink==1,'physical role')
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  need(os.fstat(fd)==before,'open race');raw=os.read(fd,role['bytes']+1);need(len(raw)==role['bytes'] and sha(raw)==role['sha256'],'role bytes/hash');need(os.fstat(fd)==before==path.lstat(),'read race');return raw
 finally:os.close(fd)
def main():
 global REG,PHASE,ROOT,CLEANUP
 need(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize,'-I -B no -O');need(len(sys.argv)==2,'exact configsha')
 raw=(HERE/'CONFIG.json').read_bytes();need(sha(raw)==sys.argv[1],'config hash');c=json.loads(raw);need(isinstance(c.get('runtimeGrant'),dict),'grant unfilled')
 need(Path(sys.executable).resolve(strict=True)==Path(c['pythonPath']),'exact Python')
 CLEANUP=cleanup_module.CleanupDiagnostics(time.monotonic,cleanup_snapshot,whole=WHOLE,start=START)
 for role in c['roles'].values():auth(role)
 root=Path(c['pythonFixture']);need(root.parent==Path('/Users/zacheryspector/studio-scratch') and not os.path.lexists(root),'absent exact fixture');root.mkdir(mode=0o700);ROOT=root
 REG=os.open(root/'OWNED.ndjson',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 for name,item in c['observerFiles'].items():exclusive(root/name,auth(item))
 original_popen=subprocess.Popen
 def inherited_probe(*args,**kwargs):
  need(not kwargs.get('start_new_session') and not kwargs.get('preexec_fn'),'only inherited sandbox probes')
  argv=list(args[0]);need(argv[0]=='/usr/bin/sandbox-exec','exact synthetic probe tool')
  if '/usr/local/bin/python3' in argv:argv[argv.index('/usr/local/bin/python3')]=c['pythonPath']
  child=original_popen(argv,*args[1:],**kwargs);POPENS.append(child)
  communicate=child.communicate
  def retained(*ca,**ck):
   out,err=communicate(*ca,**ck)
   need(len(out or b'')<=1048576 and len(err or b'')<=1048576,'probe stream cap')
   exclusive(root/(str(child.pid)+'.probe.stdout'),out or b'');exclusive(root/(str(child.pid)+'.probe.stderr'),err or b'')
   return out,err
  child.communicate=retained
  os.write(REG,(json.dumps({'event':'inheritedProbe','pid':child.pid,'ownedPgid':os.getpgrp(),'argv':argv})+'\n').encode());os.fsync(REG)
  return child
 subprocess.Popen=inherited_probe;os.fork=tracked_fork;os.waitpid=tracked_wait
 outcome=None;reason=None;cleanup=[]
 # Setup outside alarm-critical code; regular-file stdout is refused, not written.
 try:
  if not stat.S_ISFIFO(os.fstat(1).st_mode):raise OSError('diagnostic stdout must be existing pipe')
  os.set_blocking(1,False);CLEANUP.emit=diagnostic_emitter
 except Exception:CLEANUP.refuse('diagnostic-emission')
 try:
  suite=unittest.TestSuite()
  for name in ['test-supervisor.py','test-outer.py','test-settlement208-frame.py']:
   spec=importlib.util.spec_from_file_location(name,root/name);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
   if name=='test-outer.py':
    old_failure=module.outer.failure_record
    def retained_failure(streams,pid,child_exit,cleared):
     record=old_failure(streams,pid,child_exit,cleared)
     for label,data in streams.items():
      raw=bytes(data);need(len(raw)<=1048576,'outer retained stream cap');exclusive(root/(str(pid)+'.outer.'+label),raw)
     exclusive(root/(str(pid)+'.outer-refusal.json'),(json.dumps(record,sort_keys=True)+'\n').encode());return record
    module.outer.failure_record=retained_failure
   suite.addTests(unittest.defaultTestLoader.loadTestsFromModule(module))
  report_spec=importlib.util.spec_from_file_location('a208_report_checks',HERE/'test_reports.py');report_module=importlib.util.module_from_spec(report_spec);report_spec.loader.exec_module(report_module)
  report_outcome=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(report_module));need(report_outcome.testsRun==3 and report_outcome.wasSuccessful(),'report validator controls')
  outcome=unittest.TextTestRunner(verbosity=2).run(suite);need(outcome.testsRun==14,'exact14 methods')
 except BaseException as exc:reason=type(exc).__name__+':'+str(exc)
 finally:
  PHASE='cleanup';hard_kill()
  try:
   for slot in SLOTS:
    while not slot['reaped'] and time.monotonic()-START<WHOLE-1:
     good,wait=CLEANUP.attempt('waitpid',slot['pid'],slot,lambda:REAL_WAIT(slot['pid'],os.WNOHANG))
     if not good:break
     got,status=wait
     if got:slot['reaped']=True;slot['exit']=os.waitstatus_to_exitcode(status);slot['waitStatus']=status
     else:time.sleep(.025)
    good,alive=CLEANUP.attempt('group-check',slot['pid'],slot,lambda:cleanup_group_probe(slot['pid']))
    # A successful probe returns True; exact ESRCH returns None; errors stay unknown.
    slot['groupClear']=(alive is None) if good else None
    if not slot['reaped'] or not slot['groupClear']:CLEANUP.refuse('ownership-uncertain')
    HISTORY.append(dict(slot))
   for child in POPENS:
    good,status=CLEANUP.attempt('probe-wait',child.pid,{'pid':child.pid},lambda:child.wait(timeout=max(0,min(1,WHOLE-1-(time.monotonic()-START)))))
    if not good or status is None:CLEANUP.refuse('ownership-uncertain')
   CLEANUP.attempt('registry-fsync',os.getpid(),None,lambda:os.fsync(REG))
   CLEANUP.attempt('registry-close',os.getpid(),None,lambda:os.close(REG))
  except CleanupDeadline:os._exit(124)
  if CLEANUP.refusal_codes:
   STOP=STOP or 'owned-cleanup-diagnostic-refusal'
   cleanup.append('owned-cleanup:'+','.join(CLEANUP.refusal_codes))
 ok=outcome is not None and outcome.wasSuccessful() and outcome.testsRun==14 and not reason and not STOP and not cleanup and not CLEANUP.refusal_codes and len(SLOTS)==7 and len(POPENS)==4 and all(x['reaped'] and x['groupClear'] for x in HISTORY) and all(x.returncode is not None for x in POPENS) and time.monotonic()-START<ACTIVE
 result={'status':'A208_PYTHON_CONTROLS_PASS' if ok else 'A208_PYTHON_CONTROLS_STOP','methods':None if outcome is None else outcome.testsRun,'failures':None if outcome is None else len(outcome.failures),'errors':None if outcome is None else len(outcome.errors),'reason':reason,'stickyStop':STOP,'cleanupErrors':cleanup,'ownedGroups':HISTORY,'inheritedProbes':[{'pid':x.pid,'exit':x.returncode,'ownedPgid':os.getpgrp()} for x in POPENS],'elapsedSeconds':time.monotonic()-START,'game':False,'cleanupDiagnostics':CLEANUP.summary()}
 deadline_guard();cap_check()
 exclusive(root/'RESULT.json',(json.dumps(result,sort_keys=True)+'\n').encode())
 need(not ok or (time.monotonic()-START<ACTIVE and not STOP and not CLEANUP.refusal_codes),'late successful artifact')
 print(json.dumps(result,sort_keys=True),flush=True);cap_check();deadline_guard()
 need(not ok or (time.monotonic()-START<ACTIVE and not STOP and not CLEANUP.refusal_codes),'late successful emission')
 need(time.monotonic()-START<WHOLE,'late finalization');signal.setitimer(signal.ITIMER_REAL,0)
 return 0 if ok else 2
if __name__=='__main__':raise SystemExit(main())
