import os,signal,subprocess,sys,time,json
class Interrupted(BaseException):
    def __init__(self,signum):self.signum=signum
child=None
started=time.monotonic()
code=98
reason='watchdog error'
def interrupted(signum,frame):raise Interrupted(signum)
for signum in (signal.SIGINT,signal.SIGTERM,signal.SIGHUP):signal.signal(signum,interrupted)
def send_owned_group(sig):
    if child is None:return
    try:os.killpg(child.pid,sig)
    except ProcessLookupError:pass
def group_alive():
    if child is None:return False
    try:os.killpg(child.pid,0);return True
    except ProcessLookupError:return False
try:
    child=subprocess.Popen(sys.argv[1:],start_new_session=True)
    try:
        status=child.wait(timeout=30)
        code=status if status>=0 else 128-status
        reason='completed within30s'
    except subprocess.TimeoutExpired:
        code=124;reason='own process group exceeded30s'
except Interrupted as stop:
    code=128+stop.signum;reason='watchdog interrupted'
finally:
    # Cleanup only the process group this invocation created; never scan/kill foreign processes.
    for signum in (signal.SIGINT,signal.SIGTERM,signal.SIGHUP):signal.signal(signum,signal.SIG_IGN)
    if child is not None:
        send_owned_group(signal.SIGTERM)
        deadline=time.monotonic()+2
        while group_alive() and time.monotonic()<deadline:
            child.poll()
            time.sleep(.05)
        if group_alive():send_owned_group(signal.SIGKILL)
        try:child.wait(timeout=2)
        except subprocess.TimeoutExpired:
            code=98;reason='owned child did not reap after cleanup'
        deadline=time.monotonic()+2
        while group_alive() and time.monotonic()<deadline:time.sleep(.05)
        if group_alive():code=98;reason='owned process group remains after cleanup'
    print(json.dumps({'watchdog':reason,'childExit':None if child is None else child.returncode,'seconds':time.monotonic()-started,'ownedGroupGone':not group_alive(),'exit':code}),flush=True)
sys.exit(code)
