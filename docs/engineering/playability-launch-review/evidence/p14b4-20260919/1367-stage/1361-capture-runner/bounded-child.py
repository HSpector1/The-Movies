"""Bound only the owned child session; let the outer source recorder finish postflight."""
import json, os, signal, subprocess, sys, time
seconds = int(sys.argv[1])
if seconds not in (240, 330):
    raise SystemExit('unsupported capture ceiling')
command = sys.argv[2:]
if not command or command[0] != 'node':
    raise SystemExit('capture child must be the pinned Node command')
start = time.monotonic()
child = subprocess.Popen(command, start_new_session=True)
timed_out = False
try:
    code = child.wait(timeout=seconds)
except subprocess.TimeoutExpired:
    timed_out = True
    try:
        os.killpg(child.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    grace = time.monotonic() + 5
    while time.monotonic() < grace:
        child.poll()  # Reap the leader without mistaking its exit for all workers exiting.
        try:
            os.killpg(child.pid, 0)
        except ProcessLookupError:
            break
        time.sleep(min(0.1, max(0, grace - time.monotonic())))
    try:
        os.killpg(child.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    code = child.wait()
print(json.dumps({'boundedCaptureChild': True, 'timeoutSeconds': seconds,
                 'timedOut': timed_out, 'childExit': code,
                 'elapsedMs': (time.monotonic() - start) * 1000}), flush=True)
sys.exit(124 if timed_out else (code if code >= 0 else 1))
