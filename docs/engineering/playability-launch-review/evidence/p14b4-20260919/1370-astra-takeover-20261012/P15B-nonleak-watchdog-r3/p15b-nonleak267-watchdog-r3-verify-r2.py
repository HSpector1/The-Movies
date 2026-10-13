# Parent-only controlled observation; original r1 expectations retained, failures collected.
import importlib.util, json, signal, sys
from pathlib import Path
p = Path(__file__).with_name('p15b-nonleak267-watchdog-r3.py')
spec = importlib.util.spec_from_file_location('watchdog_r3', p)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
results, failures = [], []
def check(condition, label):
    if not condition: failures.append(label)
def observe(label, command, **kwargs):
    result = m.run(command, cleanup_seconds=.3, **kwargs)
    observation = dict(label=label, result=result)
    results.append(observation)
    print(json.dumps(observation), flush=True) # Record BEFORE any expectation.
    return result
r = observe('normal', [sys.executable, '-c', 'pass'])
check(r['exit'] == 0 and r['ownedGroupGone'] and not r['deadlineExceeded'], 'original normal expectation')
r = observe('timeout', [sys.executable, '-c', 'import time; time.sleep(10)'], deadline_seconds=.1)
check(r['exit'] == 124 and r['ownedGroupGone'] and r['deadlineExceeded'] and r['childExit'] is not None, 'original timeout124/groupgone expectation')
# Continue only isolated completed-child permission seams; never signal foreign processes.
calls = []
def denied_probe(pgid, sig):
    calls.append((pgid, sig))
    raise PermissionError(1, 'simulated probe EPERM')
r = observe('probe EPERM', [sys.executable, '-c', 'pass'], killpg=denied_probe)
check(r['exit'] == 98 and r['groupState'] == 'unknown' and r['childExit'] == 0, 'probe EPERM safe-unverified expectation')
check(len(calls) == 1 and calls[0][1] == 0, 'probe EPERM no escalation')
calls.clear()
def denied_signal(pgid, sig):
    calls.append((pgid, sig))
    if sig == 0: return
    raise PermissionError(1, 'simulated signal EPERM')
r = observe('signal EPERM', [sys.executable, '-c', 'pass'], killpg=denied_signal)
check(r['exit'] == 98 and r['groupState'] == 'unknown' and r['childExit'] == 0, 'signal EPERM safe-unverified expectation')
check([s for _, s in calls] == [0, signal.SIGTERM], 'signal EPERM no escalation')
print(json.dumps(dict(kind='isolated watchdog observations, original expectations retained', checks=results, failures=failures)), flush=True)
sys.exit(1 if failures else 0)
