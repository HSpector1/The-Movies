"""Five-minute bound on this capture's owned child session; outer recorder stays alive."""
import json
import os
import signal
import subprocess
import sys
import time

command = sys.argv[1:]
expected = ['node', 'node_modules/vite-node/vite-node.mjs', '--config',
            'scripts/captures/1367-week77-capture.config.ts', '--script',
            'scripts/captures/1367-week77-capture.ts']
if command != expected:
    raise SystemExit('watchdog accepts only the named week77 capture command')
started = time.monotonic()
child = subprocess.Popen(command, start_new_session=True)
timed_out = False
try:
    code = child.wait(timeout=300)
except subprocess.TimeoutExpired:
    timed_out = True
    try:
        os.killpg(child.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    grace = time.monotonic() + 5
    while time.monotonic() < grace:
        child.poll()
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
print(json.dumps({'boundedWeek77Child': True, 'timeoutSeconds': 300,
                  'timedOut': timed_out, 'childExit': code,
                  'elapsedMs': (time.monotonic() - started) * 1000}), flush=True)
sys.exit(124 if timed_out else (code if code >= 0 else 1))
