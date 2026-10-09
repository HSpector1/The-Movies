#!/usr/bin/env python3
"""UNRUN scratch-only runner for the unchanged 14 M0 route controls."""
import os,signal,time
START=time.monotonic()
if __name__=='__main__':
 signal.signal(signal.SIGALRM,lambda signum,frame: os._exit(124))
 signal.setitimer(signal.ITIMER_REAL,285)  # Bound remaining startup imports too.
import hashlib,importlib.util,json,stat,sys,unittest
from pathlib import Path
from types import SimpleNamespace
ACTIVE=255; WHOLE=285; PHASE='suite'; STOP=None
OWNED=[]; HISTORY=[]; REC=None; C=None
REAL_FORK=os.fork; REAL_WAIT=os.waitpid; MASK={signal.SIGALRM}
class SuiteStop(KeyboardInterrupt): pass
def sha(raw): return hashlib.sha256(raw).hexdigest()
def need(ok,why):
 if not ok: raise SuiteStop(why)
def group_alive(pid):
 try: os.killpg(pid,0); return True
 except ProcessLookupError: return False
 except PermissionError: return True
def cap_check():
 if C is None: return
 total=0
 for root in (Path(C['controlOutput']),Path(C['runnerOutput'])):
  if not root.exists(): continue
  for parent,dirs,files in os.walk(root,followlinks=False):
   for name in dirs+files:
    st=(Path(parent)/name).lstat(); need(not stat.S_ISLNK(st.st_mode),'owned output symlink')
    if stat.S_ISREG(st.st_mode): total+=st.st_size
    else: need(stat.S_ISDIR(st.st_mode),'owned output special file')
 need(total<=80*1024**2,'80 MiB owned output cap')
 log=Path(C['helperLog'])
 if log.exists():
  st=log.lstat(); need(stat.S_ISREG(st.st_mode) and not log.is_symlink() and st.st_size<=1024**2,'1 MiB helper log cap')
def hard_kill():
 for slot in OWNED:
  pid=slot['pid']
  if pid is None: continue
  if slot['ready']:
   try: os.killpg(pid,signal.SIGKILL)
   except ProcessLookupError: pass
  if not slot['reaped']:
   try: os.kill(pid,signal.SIGKILL)
   except ProcessLookupError: pass
def alarm(signum,frame):
 global STOP
 if time.monotonic()-START>=WHOLE:
  hard_kill(); os._exit(124)  # No zero/cleanup claim if hard finalization cannot finish.
 if PHASE=='suite':
  if time.monotonic()-START>=ACTIVE: STOP=STOP or '255-second suite deadline'
  try: cap_check()
  except SuiteStop as exc: STOP=STOP or str(exc)
  if STOP: raise SuiteStop(STOP)
def retire():
 for slot in OWNED[:]:
  if slot['reaped'] and not group_alive(slot['pid']):
   HISTORY.append(dict(slot,groupClear=True)); OWNED.remove(slot)
def tracked_fork():
 previous=signal.pthread_sigmask(signal.SIG_BLOCK,MASK)
 slot={'pid':None,'ready':False,'reaped':False}; OWNED.append(slot)
 try:
  need(STOP is None and time.monotonic()-START<ACTIVE,'suite stopped before fork')
  retire(); need(len(OWNED)==1,'unresolved earlier owned child')
  pid=REAL_FORK()
  if pid==0: return 0
  slot['pid']=pid  # In-memory ownership is complete before pending alarms resume.
 finally:
  if slot['pid'] is None and slot in OWNED: OWNED.remove(slot)
  signal.pthread_sigmask(signal.SIG_SETMASK,previous)
 # Potentially blocking durability is outside the signal-masked section.
 os.write(REGFD,(json.dumps({'event':'ownedFork','pid':pid})+'\n').encode()); os.fsync(REGFD)
 return pid
def tracked_wait(pid,flags):
 need(flags in (0,os.WNOHANG),'unexpected owned wait flags')
 while True:
  previous=signal.pthread_sigmask(signal.SIG_BLOCK,MASK)
  try:
   result=REAL_WAIT(pid,os.WNOHANG)  # Never intentionally block while masked.
   if result[0]:
    for slot in OWNED:
     if slot['pid']==result[0]: slot['reaped']=True
    retire()
  finally: signal.pthread_sigmask(signal.SIG_SETMASK,previous)
  if flags==os.WNOHANG or result[0]: return result
  time.sleep(.05)  # Preserve blocking-wait semantics with unmasked bounded polls.
def install_registration(test):
 original_setup=test.Controls.setUpClass
 def setup(cls):
  global REC
  original_setup(); REC=cls.rec; ready=REC.fork_ready
  def registered_ready(*args):
   pid=ready(*args)
   for slot in OWNED:
    if slot['pid']==pid: slot['ready']=True
   return pid
  REC.fork_ready=registered_ready; REC.os.fork=tracked_fork; REC.os.waitpid=tracked_wait
 test.Controls.setUpClass=classmethod(setup)
def authenticate(path,digest):
 raw=path.read_bytes(); need(sha(raw)==digest,'pin drift: '+str(path)); return raw
def main():
 global C,PHASE,STOP,REGFD
 need(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize,'isolated -I -B without -O required')
 signal.signal(signal.SIGALRM,alarm); signal.setitimer(signal.ITIMER_REAL,.25,.25)
 here=Path(__file__).parent
 pins=json.loads(authenticate(here/'SOURCE-PINS.json',sys.argv[1]))
 for name,role in pins['files'].items(): authenticate(here/name,role['sha256'])
 C=json.loads((here/'CONFIG.json').read_bytes())
 need(Path(sys.executable).resolve(strict=True)==Path(C['pythonPath']),'exact Python path')
 authenticate(Path(C['pythonPath']),C['pythonSha256'])
 for role in C['roles'].values(): authenticate(Path(role['path']),role['sha256'])
 root=Path(C['runnerOutput']); need(root.parent==Path('/Users/zacheryspector/studio-scratch') and not os.path.lexists(root),'runner output collision'); root.mkdir(mode=0o700)
 REGFD=os.open(root/'OWNED-FORKS.ndjson',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 outcome=None; reason=None; cleanup=[]
 try:
  role=C['roles']['controls']; spec=importlib.util.spec_from_file_location('exact_m0_controls',role['path']); test=importlib.util.module_from_spec(spec); spec.loader.exec_module(test)
  test.ARGS=SimpleNamespace(**C['controlArgs']); test.SOURCE,test.ROOT,test.REVIEW=test.prepare(test.ARGS)
  install_registration(test)
  outcome=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(test.Controls))
  need(outcome.testsRun==14,'expected exact 14 groups')
 except BaseException as exc: reason=type(exc).__name__+':'+str(exc)
 finally:
  PHASE='cleanup'
  for slot in OWNED[:]:
   pid=slot['pid']
   try:
    need(pid is not None,'fork ownership incomplete')
    if not slot['ready'] and not slot['reaped']:
     try: slot['ready']=os.getpgid(pid)==pid
     except ProcessLookupError: pass
     if not slot['ready']: os.kill(pid,signal.SIGKILL)
    REC.terminate(pid,pid) if REC else need(False,'recorder ownership helper unavailable')
    slot['reaped']=True; retire()
   except BaseException as exc: cleanup.append(type(exc).__name__+':'+str(exc))
  os.fsync(REGFD); os.close(REGFD); PHASE='finalize'
  try: cap_check()
  except BaseException as exc: reason=reason or type(exc).__name__+':'+str(exc)
  ok=outcome is not None and outcome.wasSuccessful() and outcome.testsRun==14 and not reason and not STOP and not cleanup and not OWNED and len(HISTORY)==16 and time.monotonic()-START<ACTIVE
  result={'status':'CONTROLS_PASS' if ok else 'CONTROLS_STOP','testsRun':None if outcome is None else outcome.testsRun,'failures':None if outcome is None else len(outcome.failures),'errors':None if outcome is None else len(outcome.errors),'reason':reason,'stickyStop':STOP,'cleanupErrors':cleanup,'ownedGroups':HISTORY,'unresolvedOwned':OWNED,'elapsedSeconds':time.monotonic()-START,'wholeLimitSeconds':WHOLE,'sourcePinsSha256':sys.argv[1],'routeSourcePinsSha256':C['controlArgs']['source_pins_sha'],'routeReviewSha256':C['controlArgs']['route_review_sha'],'controlsSourcePinsSha256':C['roles']['controlsPins']['sha256'],'suiteLimitSeconds':ACTIVE,'gameOrMaterialization':False}
  fd=os.open(root/'RESULT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
  with os.fdopen(fd,'wb') as stream: stream.write(json.dumps(result,sort_keys=True).encode()+b'\n'); stream.flush(); os.fsync(stream.fileno())
  cap_check(); print(json.dumps({'status':result['status'],'result':str(root/'RESULT.json')},sort_keys=True),flush=True)
  need(time.monotonic()-START<WHOLE,'late finalization')
  signal.setitimer(signal.ITIMER_REAL,0)  # Only after final artifact/log/cap/deadline checks.
 return 0 if ok else 2
if __name__=='__main__': raise SystemExit(main())
