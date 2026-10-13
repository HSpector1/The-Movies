import json, os, signal, subprocess, sys, time

class Interrupted(BaseException):
    def __init__(self, signum): self.signum = signum

def run(command, *, deadline_seconds=30, cleanup_seconds=2, killpg=os.killpg):
    # Optional short deadlines/syscall seam are for isolated parent harness verification only.
    started = time.monotonic()
    child = None
    child_status = None
    intended_exit = 98
    reason = 'launch error'
    deadline_exceeded = False
    cleanup_error = None
    group_state = 'absent'
    blocked = False
    old_handlers = {}
    def interrupted(signum, frame): raise Interrupted(signum)
    def probe():
        nonlocal blocked, cleanup_error
        if blocked: return 'unknown'
        try:
            killpg(child.pid, 0)
            return 'alive'
        except ProcessLookupError: return 'absent'
        except OSError as error:
            blocked = True
            cleanup_error = f'group probe unverified: {error}'
            return 'unknown'
    def send(sig):
        nonlocal blocked, cleanup_error
        if blocked: return
        try: killpg(child.pid, sig)
        except ProcessLookupError: pass
        except OSError as error:
            blocked = True
            cleanup_error = f'group signal unverified: {error}'
    try:
        for sig in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP):
            old_handlers[sig] = signal.signal(sig, interrupted)
        child = subprocess.Popen(command, start_new_session=True)
        try:
            child_status = child.wait(timeout=deadline_seconds)
            intended_exit = child_status if child_status >= 0 else 128 - child_status
            reason = 'child completed'
        except subprocess.TimeoutExpired:
            deadline_exceeded = True
            intended_exit = 124
            reason = 'deadline exceeded'
    except Interrupted as stop:
        intended_exit = 128 + stop.signum
        reason = 'watchdog interrupted'
    except Exception as error:
        reason = f'watchdog error: {error}'
    finally:
        for sig in old_handlers: signal.signal(sig, signal.SIG_IGN)
        if child is not None:
            # Probe first; an already absent completed group is never signalled.
            group_state = probe()
            if group_state == 'alive':
                send(signal.SIGTERM)
                until = time.monotonic() + cleanup_seconds
                while not blocked and time.monotonic() < until:
                    child.poll()
                    group_state = probe()
                    if group_state != 'alive': break
                    time.sleep(.05)
                if not blocked:
                    group_state = probe()
                    if group_state == 'alive': send(signal.SIGKILL)
            try: child.wait(timeout=cleanup_seconds)
            except subprocess.TimeoutExpired:
                cleanup_error = cleanup_error or 'direct owned child did not reap'
            until = time.monotonic() + cleanup_seconds
            group_state = probe()
            while group_state == 'alive' and time.monotonic() < until:
                time.sleep(.05)
                group_state = probe()
            if group_state != 'absent': cleanup_error = cleanup_error or 'owned group disappearance unverified'
            child_status = child.returncode
        for sig, handler in old_handlers.items(): signal.signal(sig, handler)
    exit_code = 98 if cleanup_error else intended_exit
    result = dict(watchdog=reason, childPid=None if child is None else child.pid,
        groupId=None if child is None else child.pid, childExit=child_status,
        intendedExit=intended_exit, deadlineExceeded=deadline_exceeded,
        seconds=time.monotonic()-started, groupState=group_state,
        ownedGroupGone=group_state == 'absent', cleanupError=cleanup_error, exit=exit_code)
    return result

if __name__ == '__main__':
    result = run(sys.argv[1:])  # Production diagnostic deadline stays exactly30s.
    print(json.dumps(result), flush=True)
    sys.exit(result['exit'])
