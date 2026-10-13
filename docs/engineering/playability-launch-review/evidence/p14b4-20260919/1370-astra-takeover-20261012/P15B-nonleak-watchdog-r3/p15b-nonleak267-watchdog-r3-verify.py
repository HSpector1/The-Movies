# Parent-only isolated harness verification. Never imports game code or signals foreign groups.
import importlib.util, json, os, signal, sys
from pathlib import Path
p = Path(__file__).with_name('p15b-nonleak267-watchdog-r3.py')
spec = importlib.util.spec_from_file_location('watchdog_r3', p)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
results = []
def verify(label, command, **kwargs):
    result = m.run(command, cleanup_seconds=.3, **kwargs)
    results.append(dict(label=label, result=result))
    return result
r = verify('normal', [sys.executable, '-c', 'pass'])
assert r['exit'] == 0 and r['ownedGroupGone'] and not r['deadlineExceeded']
r = verify('timeout', [sys.executable, '-c', 'import time; time.sleep(10)'], deadline_seconds=.1)
assert r['exit'] == 124 and r['ownedGroupGone'] and r['deadlineExceeded'] and r['childExit'] is not None
# Permission seams act on already completed owned children; fake signalling never calls os.killpg.
calls = []
def denied_probe(pgid, sig):
    calls.append((pgid, sig))
    raise PermissionError(1, 'simulated probe EPERM')
r = verify('probe EPERM', [sys.executable, '-c', 'pass'], killpg=denied_probe)
assert r['exit'] == 98 and r['groupState'] == 'unknown' and r['childExit'] == 0
assert len(calls) == 1 and calls[0][1] == 0
calls.clear()
def denied_signal(pgid, sig):
    calls.append((pgid, sig))
    if sig == 0: return # Simulated alive only; no real syscall/foreign group involved.
    raise PermissionError(1, 'simulated signal EPERM')
r = verify('signal EPERM', [sys.executable, '-c', 'pass'], killpg=denied_signal)
assert r['exit'] == 98 and r['groupState'] == 'unknown' and r['childExit'] == 0
assert [s for _, s in calls] == [0, signal.SIGTERM]
print(json.dumps(dict(kind='isolated watchdog harness verification only', checks=results)), flush=True)
