"""UNRUN r4 recorder failure-capture repair only: exact owned fork/READY/GO, hard whole timer,
late exit/active checks and sanitized Node environment; no game or Save imports."""
import datetime,hashlib,json,os,pathlib,selectors,select,signal,stat,sys,time
HERE=pathlib.Path(__file__).resolve().parent;SCRATCH=pathlib.Path('/Users/zacheryspector/studio-scratch')
CONFIG_SHA='22597cd15bceec96176ad4247cdf11146aa6651bfd15d01366b105731fff83ba';CAP=1024**2;CHILD=60;ACTIVE=75;WHOLE=90
OUTPUTS={mode:SCRATCH/('1370-c0-renewal208-r03-2-first-draw-after-aj-'+mode+'-output-20261009-r1') for mode in ('controls','witness')}
def require(v,m):
 if not v:raise RuntimeError('STOP_'+m)
def sha(b):return hashlib.sha256(b).hexdigest()
def write(p,b):
 require(len(b)<=CAP,'OUTPUT_CAP');fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(b);f.flush();os.fsync(f.fileno())
def metadata(st):return (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode,st.st_nlink)
def authenticate(path,expected,cap=None):
 p=pathlib.Path(path);require(p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_SOURCE');before=p.lstat();require(stat.S_ISREG(before.st_mode) and before.st_nlink==1,'REGULAR_SOURCE')
 if cap is not None:require(before.st_size<=cap,'SOURCE_CAP')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(metadata(os.fstat(fd))==metadata(before),'SOURCE_OPEN_RACE');h=hashlib.sha256()
  while True:
   b=os.read(fd,1024**2)
   if not b:break
   h.update(b)
  require(h.hexdigest()==expected,'SOURCE_HASH');require(metadata(os.fstat(fd))==metadata(before)==metadata(p.lstat()),'SOURCE_READ_RACE')
 finally:os.close(fd)
def process_alive(pgid):
    try:
        os.killpg(pgid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


class OwnedChild:
    def __init__(self, pid):
        self.pid = pid
        self.returncode = None

    def poll(self):
        if self.returncode is None:
            got, status = os.waitpid(self.pid, os.WNOHANG)
            if got == self.pid:
                self.returncode = os.waitstatus_to_exitcode(status)
        return self.returncode


def start_owned(command, cwd, env, stdout_fd, stderr_fd, owned, before_ready=None):
    """Fork/readiness/GO pattern: record PID before exec or waiting.

    Block only SIGALRM across fork and in-memory registration. The shared owned
    dictionary closes the function-return assignment window too. No filesystem
    I/O or wait occurs with the recorder alarm blocked in the parent.
    """
    ready_read, ready_write = os.pipe()
    go_read, go_write = os.pipe()
    old_mask = signal.pthread_sigmask(signal.SIG_BLOCK, {signal.SIGALRM})
    try:
        pid = os.fork()
        if pid == 0:
            try:
                signal.setitimer(signal.ITIMER_REAL, 0)
                os.close(ready_read); os.close(go_write)
                os.setsid()
                signal.pthread_sigmask(signal.SIG_SETMASK, old_mask)
                if before_ready is not None:
                    before_ready()  # Tiny source-only fixture hook; main never supplies it.
                os.write(ready_write, (str(os.getpid()) + '\n').encode())
                os.close(ready_write)
                if os.read(go_read, 1) != b'G':
                    os._exit(126)
                os.close(go_read)
                os.chdir(cwd)
                null = os.open('/dev/null', os.O_RDONLY)
                os.dup2(null, 0); os.dup2(stdout_fd, 1); os.dup2(stderr_fd, 2)
                os.closerange(3, os.sysconf('SC_OPEN_MAX'))
                os.execve(command[0], command, env)
            except BaseException:
                os._exit(126)
        owned.update({'child': OwnedChild(pid), 'readyRead': ready_read,
                      'goWrite': go_write, 'pgidConfirmed': False})
        if 'info' in owned:
            owned['info'].update({'pid': pid, 'pgid': pid, 'startupOwnedBeforeExec': True})
        os.close(ready_write); os.close(go_read)
    except BaseException:
        if owned.get('child') is None:
            for fd in (ready_read, ready_write, go_read, go_write):
                try:
                    os.close(fd)
                except OSError:
                    pass
        raise
    finally:
        signal.pthread_sigmask(signal.SIG_SETMASK, old_mask)


def ready_go(owned, deadline, clock=time.monotonic):
    child = owned['child']
    raw = b''
    os.set_blocking(owned['readyRead'], False)
    while b'\n' not in raw:
        assert clock() < deadline, 'STOP_STARTUP_DEADLINE'
        got, _, _ = select.select([owned['readyRead']], [], [], min(.02, deadline - clock()))
        if got:
            block = os.read(owned['readyRead'], 128)
            assert block, 'STOP_STARTUP_EOF'
            raw += block
            assert len(raw) <= 128, 'STOP_STARTUP_CAP'
        assert clock() < deadline, 'STOP_STARTUP_DEADLINE'
        assert child.poll() is None, 'STOP_STARTUP_EXIT'
    assert raw == (str(child.pid) + '\n').encode(), 'STOP_STARTUP_IDENTITY'
    assert os.getpgid(child.pid) == child.pid, 'STOP_STARTUP_GROUP'
    owned['pgidConfirmed'] = True
    os.close(owned['readyRead']); owned['readyRead'] = None
    assert clock() < deadline, 'STOP_STARTUP_DEADLINE'
    assert os.write(owned['goWrite'], b'G') == 1
    os.close(owned['goWrite']); owned['goWrite'] = None


def close_startup_fds(owned):
    for name in ('readyRead', 'goWrite'):
        fd = owned.get(name)
        if fd is not None:
            os.close(fd)
            owned[name] = None


def clear(process, end):
    # Only the exact child PGID created by start_new_session=True is signalled.
    for sig, grace in ((signal.SIGTERM, 3), (signal.SIGKILL, 4)):
        try:
            os.killpg(process.pid, sig)
        except ProcessLookupError:
            pass
        if process.returncode is None:
            try:
                os.kill(process.pid, sig)  # Exact owned child before setsid/READY.
            except ProcessLookupError:
                pass
        limit = min(end, time.monotonic() + grace)
        while time.monotonic() < limit:
            process.poll()
            if process.returncode is not None and not process_alive(process.pid):
                return True
            time.sleep(.02)
    process.poll()
    return process.returncode is not None and not process_alive(process.pid)


def alarm(*_):raise TimeoutError('STOP_WHOLE_90_SECONDS')
def whole_guard(end,clock=time.monotonic):require(clock()<end,'WHOLE_90_SECONDS')
def active_guard(started,clock=time.monotonic):require(clock()<started+ACTIVE,'ACTIVE_75_SECONDS')
def observed_exit_guard(started,child_started,stdout_bytes,stderr_bytes,clock=time.monotonic):
 require(clock()<min(started+ACTIVE,child_started+CHILD),'OBSERVED_CHILD_OR_ACTIVE_DEADLINE')
 require(max(stdout_bytes,stderr_bytes)<=CAP,'OBSERVED_STREAM_CAP')
def child_environment(source=None):
 env=dict(os.environ if source is None else source);env.pop('NODE_OPTIONS',None);env.pop('NODE_PATH',None);env['PYTHONDONTWRITEBYTECODE']='1';return env
def finalize_result(output,result,end,clock=time.monotonic,writer=write):
 try:
  whole_guard(end,clock);writer(output/'RESULT.json',(json.dumps(result,sort_keys=True,indent=2)+'\n').encode());whole_guard(end,clock);return result
 except BaseException as exc:
  stop=dict(result,status='STOP_FINALIZATION',finalizationError=repr(exc))
  # Never perform another blocking artifact write after the whole deadline.
  # A late durable candidate is invalid unless actual helper+recorder exit0;
  # nonzero and any override always take precedence over its stale status.
  if clock()<end:
   try:writer(output/'OVERRIDE-STOP.json',(json.dumps(stop,sort_keys=True,indent=2)+'\n').encode());whole_guard(end,clock)
   except BaseException as override:stop['overrideError']=repr(override)
  else:stop['overrideNotWrittenAfterWholeDeadline']=True
  return stop

def main():
 started=time.monotonic();end=started+WHOLE
 previous_handler=signal.getsignal(signal.SIGALRM);signal.signal(signal.SIGALRM,alarm);signal.setitimer(signal.ITIMER_REAL,WHOLE)
 owned={};pipes=[];sel=None;output=None;buffers={'stdout':bytearray(),'stderr':bytearray()};child=None;child_started=None;failure=None;mode=None;groupclear=True;timedout=False
 try:
  require(sys.dont_write_bytecode and not sys.flags.optimize,'PYTHON_B_REQUIRED');require(len(sys.argv)==2 and sys.argv[1] in OUTPUTS,'EXACT_MODE');mode=sys.argv[1]
  configraw=(HERE/'CONFIG.json').read_bytes();require(sha(configraw)==CONFIG_SHA,'CONFIG_HASH');config=json.loads(configraw)
  for role in config['roles'].values():authenticate(role['path'],role['sha256'],16*1024**2);whole_guard(end)
  authenticate(config['nodePath'],config['nodeSha256']);require(os.access(config['nodePath'],os.X_OK),'NODE_EXECUTABLE');active_guard(started)
  output=OUTPUTS[mode];require(output.parent==SCRATCH and SCRATCH.resolve(strict=True)==SCRATCH and not os.path.lexists(output),'ABSENT_OWNED_OUTPUT');output.mkdir(mode=0o700)
  script=config['roles']['controls' if mode=='controls' else 'witness']['path'];argv=[config['nodePath'],script,CONFIG_SHA]
  out_read,out_write=os.pipe();pipes.extend([out_read,out_write]);err_read,err_write=os.pipe();pipes.extend([err_read,err_write])
  child_started=time.monotonic() # 60 starts before fork or GO permits execution.
  start_owned(argv,str(HERE),child_environment(),out_write,err_write,owned)
  child=owned['child'];os.close(out_write);pipes.remove(out_write);os.close(err_write);pipes.remove(err_write)
  ready_go(owned,min(child_started+CHILD,started+ACTIVE));sel=selectors.DefaultSelector()
  for name,fd in [('stdout',out_read),('stderr',err_read)]:os.set_blocking(fd,False);sel.register(fd,selectors.EVENT_READ,name)
  while sel.get_map() or child.poll() is None:
   observed_exit_guard(started,child_started,len(buffers['stdout']),len(buffers['stderr']))
   for key,_ in sel.select(timeout=0.05):
    b=os.read(key.fileobj,8192)
    if not b:sel.unregister(key.fileobj);os.close(key.fileobj);pipes.remove(key.fileobj);continue
    target=buffers[key.data];require(len(target)+len(b)<=CAP,key.data.upper()+'_CAP');target.extend(b)
   observed_exit_guard(started,child_started,len(buffers['stdout']),len(buffers['stderr']))
  # EOF/exit can terminate the loop without another loop-head deadline check.
  observed_exit_guard(started,child_started,len(buffers['stdout']),len(buffers['stderr']))
 except BaseException as exc:
  failure=str(exc) or repr(exc);timedout=isinstance(exc,TimeoutError) or 'DEADLINE' in failure or '_SECONDS' in failure
 finally:
  try:
   if child is None:child=owned.get('child')
   try:close_startup_fds(owned)
   except BaseException as exc:failure='STOP_STARTUP_FD_CLEANUP_'+repr(exc)
   if child is not None:
    try:groupclear=clear(child,end)
    except BaseException as exc:
     groupclear=False;failure='STOP_OWNED_GROUP_CLEARANCE_UNKNOWN_'+repr(exc)
     # Alarm during cleanup still receives an exact-owned emergency KILL.
     # No wait or blocking artifact write is introduced after whole90.
     for target in ('group','pid'):
      try:
       if target=='group':os.killpg(child.pid,signal.SIGKILL)
       elif child.returncode is None:os.kill(child.pid,signal.SIGKILL)
      except ProcessLookupError:pass
    if not groupclear:failure='STOP_OWNED_GROUP_CLEARANCE_UNKNOWN'
   if sel is not None:sel.close()
   for fd in pipes:
    try:os.close(fd)
    except OSError:pass
   if time.monotonic()>=end:failure='STOP_WHOLE_90_SECONDS';timedout=True
   if not failure:
    try:
     require(child is not None and child.poll()==0,'CHILD_EXIT_'+str(None if child is None else child.returncode))
     observed_exit_guard(started,child_started,len(buffers['stdout']),len(buffers['stderr']))
     last=json.loads(bytes(buffers['stdout']).splitlines()[-1]);expected='PURE_RENEWAL208_R03_2_INPUT_AND_REFUSAL_CONTROLS_PASSED' if mode=='controls' else 'PURE_RENEWAL208_R03_2_FIRST_DRAW_COMPLETE'
     require(last.get('status')==expected and not buffers['stderr'] and ((mode=='controls' and last.get('groups')==8 and last.get('unknownDrawsMeasured')==0 and last.get('knownControlDraws')==0 and last.get('syntheticControlOnly') is True) or (mode=='witness' and isinstance(last.get('rows'),list) and len(last['rows'])==1 and last.get('salaryAttribution') is False and last.get('renewalAttribution') is False)),'REPORT_ROLE');active_guard(started)
    except BaseException as exc:
     failure=str(exc) or repr(exc);timedout=isinstance(exc,TimeoutError) or 'DEADLINE' in failure or '_SECONDS' in failure
   result={'schema':'1370-b109-pure-encoder-recorder-r4','status':failure or 'PURE_RENEWAL208_R03_2_'+str(mode).upper()+'_COMPLETE_UNADOPTED','mode':mode,'configSha256':CONFIG_SHA,'actualChildExit':None if child is None else child.returncode,'childPid':None if child is None else child.pid,'ownedPgid':None if child is None else child.pid,'startupOwnedBeforeExec':child is not None,'pgidConfirmed':owned.get('pgidConfirmed',False),'groupClear':groupclear,'timedOut':timedout,'elapsedSeconds':time.monotonic()-started,'boundsSeconds':{'node':CHILD,'active':ACTIVE,'whole':WHOLE},'stdoutBytes':len(buffers['stdout']),'stdoutSha256':sha(bytes(buffers['stdout'])),'stderrBytes':len(buffers['stderr']),'stderrSha256':sha(bytes(buffers['stderr'])),'sanitizedEnvironment':['NODE_OPTIONS','NODE_PATH'],'game':False,'sourceOrGameplayAdoption':False,'executionAuthorization':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
   if output is not None and time.monotonic()<end:
    for name,raw in buffers.items():whole_guard(end);write(output/(name+'.bin'),bytes(raw));whole_guard(end)
    if not failure:active_guard(started)
    result=finalize_result(output,result,end)
   code=0 if result['status'].endswith('_COMPLETE_UNADOPTED') and not failure else 2
   print(json.dumps({'status':result['status'],'output':None if output is None else str(output),'actualChildExit':result['actualChildExit'],'groupClear':groupclear}))
   whole_guard(end)
   return code
  finally:
   # The hard alarm remains armed through authentication, startup, cleanup,
   # raw writes, fsync, RESULT/override finalization and emitted summary.
   signal.setitimer(signal.ITIMER_REAL,0);signal.signal(signal.SIGALRM,previous_handler)
if __name__=='__main__':
 try:sys.exit(main())
 except BaseException as exc:
  if isinstance(exc,SystemExit):raise
  print(json.dumps({'status':'STOP_RECORDER','error':repr(exc)}),file=sys.stderr);sys.exit(2)
