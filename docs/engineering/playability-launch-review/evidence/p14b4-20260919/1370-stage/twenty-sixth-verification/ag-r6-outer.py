"""Active whole-leaf recorder and process-group owner for AG/E0G neutrality."""
import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import signal
import stat
import subprocess
import sys
import time
from pathlib import Path

assert sys.flags.isolated and sys.dont_write_bytecode
assert isinstance(_AUTHENTICATED_OUTER_BYTES, bytes)
assert isinstance(_AUTHENTICATED_MANIFEST_BYTES, bytes)
assert isinstance(_AUTHENTICATED_REVIEW_BYTES, bytes)
assert isinstance(_BOOTSTRAP_START, float)

ROOT = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-proposal-r6')
REVIEW = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-independent-review-r6/RECEIPT.json')
OUT = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-outer-recorded-r6')
TARGET = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r6')

CHILD_BOOTSTRAP = '''import base64,hashlib,json,os,stat,sys
from pathlib import Path
assert sys.flags.isolated and sys.dont_write_bytecode
root=Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-proposal-r6')
review=Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-independent-review-r6/RECEIPT.json')
sha=lambda raw:hashlib.sha256(raw).hexdigest()
manifest_raw=(root/'MANIFEST.json').read_bytes();assert sha(manifest_raw)==os.environ['NEUTRALITY_MANIFEST_SHA256']
m=json.loads(manifest_raw);assert m['schema']=='1370-ag-e0g-full-state-clean-r6'
assert not root.is_symlink()
files={};dirs=[];links={}
for base,sub,names in os.walk(root,followlinks=False):
 folder=Path(base)
 for name in list(sub):
  path=folder/name;rel=path.relative_to(root).as_posix();mode=path.lstat().st_mode
  if stat.S_ISLNK(mode):links[rel]=os.readlink(path);sub.remove(name)
  else:assert stat.S_ISDIR(mode);dirs.append(rel)
 for name in names:
  path=folder/name;rel=path.relative_to(root).as_posix();mode=path.lstat().st_mode
  if stat.S_ISLNK(mode):links[rel]=os.readlink(path)
  else:
   assert stat.S_ISREG(mode) and path.stat().st_nlink==1
   if rel!='MANIFEST.json':files[rel]=sha(path.read_bytes())
assert {'files':files,'directories':sorted(dirs),'links':links}==m['inventory']
rb=base64.b64decode(os.environ['NEUTRALITY_REVIEW_B64'],validate=True)
assert sha(rb)==os.environ['NEUTRALITY_REVIEW_SHA256'] and review.read_bytes()==rb
assert json.loads(rb)=={'decision':'ACCEPT_STATIC_CLEAN_ONLY','manifestSha256':sha(manifest_raw),'runnerSha256':files['runner.py'],'outerSha256':files['outer.py'],'commandSha256':os.environ['NEUTRALITY_COMMAND_SHA256']}
helper=(root/'runtime_guard.py').read_bytes();assert sha(helper)==files['runtime_guard.py']
space={};exec(compile(helper,str(root/'runtime_guard.py'),'exec'),space)
code=(root/'runner.py').read_bytes();assert sha(code)==files['runner.py']
sys.argv=[str(root/'runner.py'),*sys.argv[1:]]
exec(compile(code,str(root/'runner.py'),'exec'),{'__name__':'__main__','__file__':str(root/'runner.py'),
 '_AUTHENTICATED_RUNNER_BYTES':code,'_AUTHENTICATED_MANIFEST_BYTES':manifest_raw,
 '_AUTHENTICATED_REVIEW_BYTES':rb,'_AUTHENTICATED_VERIFY_RUNTIME':space['verify_runtime']})'''

def sha(raw): return hashlib.sha256(raw).hexdigest()
def file_sha(path): return sha(Path(path).read_bytes())
def write(path, value):
    with path.open('x') as stream:
        json.dump(value, stream, sort_keys=True, indent=2)
        stream.write('\n')
def alive(group):
    try: os.killpg(group, 0); return True
    except ProcessLookupError: return False
def stop(group):
    if not alive(group): return True
    try: os.killpg(group, signal.SIGTERM)
    except ProcessLookupError: return True
    for _ in range(30):
        if not alive(group): return True
        time.sleep(.1)
    try: os.killpg(group, signal.SIGKILL)
    except ProcessLookupError: return True
    for _ in range(30):
        if not alive(group): return True
        time.sleep(.1)
    return False
def process_rows():
    try:
        rows = []
        for line in subprocess.check_output(['ps','-axo','pid=,ppid=,pgid='],timeout=3).decode().splitlines():
            parts = line.split()
            if len(parts) == 3:
                try: rows.append(tuple(map(int, parts)))
                except ValueError: pass
        return rows, []
    except Exception as exc: return [], [repr(exc)]
def descend(pid, rows):
    owned = {pid}; changed = True
    while changed:
        before = len(owned)
        for child, parent, group in rows:
            if parent in owned: owned.add(child)
        changed = len(owned) != before
    return {group for child, parent, group in rows if child in owned}
def watchdog(out, value):
    target = out / 'WATCHDOG.json'; tmp = out / ('.WATCHDOG.' + value['status'] + '.tmp')
    data = (json.dumps(value, sort_keys=True, indent=2) + '\n').encode()
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try: os.write(fd, data); os.fsync(fd)
    finally: os.close(fd)
    os.replace(tmp, target)
    dirfd = os.open(out, os.O_RDONLY)
    try: os.fsync(dirfd)
    finally: os.close(dirfd)
def environment(manifest, phase):
    assert phase in ('pre', 'running', 'post')
    minimum = manifest['diskReserve']['preflightFreeBytes'] if phase == 'pre' else manifest['diskReserve']['runningFloorBytes']
    free = shutil.disk_usage(ROOT).free
    assert free >= minimum, 'STOP: clean-route disk reserve breached'
    power = subprocess.check_output(['pmset', '-g', 'batt'], timeout=5).decode()
    assert "Now drawing from 'AC Power'" in power, 'STOP: clean-route AC power unavailable'
    return {'phase':phase, 'freeBytes':free, 'power':'AC Power', 'minimumBytes':minimum}

def output_sizes(out, target):
    paths = [out / 'child.stdout.log', out / 'child.stderr.log', target / 'child.stdout.log', target / 'child.stderr.log']
    return sum(p.stat().st_size for p in paths if p.is_file())

def alarm(*_): raise TimeoutError('active whole-leaf recorder deadline')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--arm', choices=('AG','E0G'), required=True)
    parser.add_argument('--seed', choices=('p13a-core-causal-01','p13-public-commercial-adoption'), required=True)
    parser.add_argument('--stage', choices=('clean',), required=True)
    parser.add_argument('--run-id', required=True)
    args = parser.parse_args()
    assert re.fullmatch(r'[a-z0-9-]{1,48}', args.run_id)
    cap = 750 if args.stage == 'clean' and args.seed == 'p13-public-commercial-adoption' else 330
    signal.signal(signal.SIGALRM, alarm)
    signal.setitimer(signal.ITIMER_REAL, max(.001, _BOOTSTRAP_START + cap - time.monotonic()))
    tag = 'p13a' if args.seed == 'p13a-core-causal-01' else 'adoption'
    leaf_name = f'{args.arm.lower()}-{tag}-{args.stage}-{args.run_id}'
    out = OUT / leaf_name; target = TARGET / leaf_name
    assert not os.path.lexists(out); out.mkdir(parents=True)
    watchdog(out, {'status':'ARMED','deadlineSeconds':cap,'startedMonotonic':_BOOTSTRAP_START})
    manifest = json.loads(_AUTHENTICATED_MANIFEST_BYTES)
    assert manifest['schema'] == '1370-ag-e0g-full-state-clean-r6'
    assert sha(_AUTHENTICATED_MANIFEST_BYTES) == os.environ['NEUTRALITY_MANIFEST_SHA256']
    assert sha(_AUTHENTICATED_OUTER_BYTES) == manifest['inventory']['files']['outer.py']
    assert (ROOT / 'outer.py').read_bytes() == _AUTHENTICATED_OUTER_BYTES
    review = _AUTHENTICATED_REVIEW_BYTES
    assert sha(review) == os.environ['NEUTRALITY_REVIEW_SHA256'] and REVIEW.read_bytes() == review
    assert json.loads(review) == {'decision':'ACCEPT_STATIC_CLEAN_ONLY',
        'manifestSha256':sha(_AUTHENTICATED_MANIFEST_BYTES),
        'runnerSha256':manifest['inventory']['files']['runner.py'],
        'outerSha256':manifest['inventory']['files']['outer.py'],'commandSha256':os.environ['NEUTRALITY_COMMAND_SHA256']}
    result = {'schema':'1370-ag-e0g-full-state-clean-outer-result-r6','head':manifest['head'],
        'arm':args.arm,'seed':args.seed,'stage':args.stage,'runId':args.run_id,
        'manifestSha256':sha(_AUTHENTICATED_MANIFEST_BYTES),'reviewSha256':sha(review),
        'deadlineSeconds':cap,'startedMonotonic':_BOOTSTRAP_START,
        'status':'UNCLASSIFIED','stagePassed':False,'targetPath':str(target)}
    proc = None; known = set(); errors = []
    try:
        result['environmentPreflight'] = environment(manifest, 'pre')
        with (out / 'child.stdout.log').open('xb') as stdout, (out / 'child.stderr.log').open('xb') as stderr:
            env = os.environ.copy(); env['NEUTRALITY_REVIEW_B64'] = base64.b64encode(review).decode('ascii')
            command = [sys.executable,'-I','-B','-c',CHILD_BOOTSTRAP,'--arm',args.arm,'--seed',args.seed,
                       '--stage',args.stage,'--run-id',args.run_id]
            proc = subprocess.Popen(command,cwd=str(ROOT),stdout=stdout,stderr=stderr,
                                    env=env,start_new_session=True)
            write(out / 'LAUNCH.json', {'pid':proc.pid,'pgid':proc.pid,'startNewSession':True,
                'commandKind':'authenticated immutable runner bootstrap'})
            last_power_check = time.monotonic()
            while proc.poll() is None:
                assert shutil.disk_usage(ROOT).free >= manifest['diskReserve']['runningFloorBytes'], 'STOP: running disk reserve breached'
                assert output_sizes(out, target) <= manifest['diskReserve']['combinedLogLimitBytes'], 'STOP: combined log limit exceeded'
                if time.monotonic() - last_power_check >= 5:
                    result['environmentDuringLast'] = environment(manifest, 'running')
                    last_power_check = time.monotonic()
                receipt = target / 'LAUNCH.json'
                if receipt.exists():
                    try:
                        row = json.loads(receipt.read_bytes()); group = row['pgid']
                        assert type(group) is int and group > 0 and row['pid'] == group and row['startNewSession'] is True
                        known.add(group)
                    except Exception as exc: errors.append({'receipt':str(receipt),'error':repr(exc)})
                rows, ps_errors = process_rows(); errors += ps_errors; known |= descend(proc.pid, rows)
                time.sleep(.2)
            result['childExit'] = proc.returncode
        result['childStdoutSha256'] = file_sha(out / 'child.stdout.log')
        result['childStderrSha256'] = file_sha(out / 'child.stderr.log')
        assert proc.returncode == 0, 'runner failed'
        receipt = target / 'LAUNCH.json'; assert receipt.is_file() and not receipt.is_symlink()
        row = json.loads(receipt.read_bytes()); known.add(row['pgid'])
        assert type(row['pgid']) is int and row['pid'] == row['pgid'] and row['startNewSession'] is True
        assert not errors, 'ownership monitoring error'
        raw = (target / 'RESULT.json').read_bytes(); digest = sha(raw)
        assert json.loads((target / 'RESULT.sha256.json').read_bytes()) == {'sha256':digest}
        stage = json.loads(raw)
        assert stage['status'] == 'STAGE_PASS' and stage['stagePassed'] is True
        assert stage['head'] == manifest['head'] and stage['manifestSha256'] == result['manifestSha256']
        assert stage['arm'] == args.arm and stage['seed'] == args.seed and stage['stage'] == args.stage
        result['environmentPostflight'] = environment(manifest, 'post')
        assert output_sizes(out, target) <= manifest['diskReserve']['combinedLogLimitBytes']
        result['targetResultSha256'] = digest
        result['status'] = 'STAGE_PASS'; result['stagePassed'] = True
    except TimeoutError as exc:
        result['status'] = 'OUTER_TIMEOUT'; result['error'] = repr(exc)
        emergency = set(known)
        if proc is not None: emergency.add(proc.pid)
        for group in emergency:
            try: os.killpg(group, signal.SIGKILL)
            except ProcessLookupError: pass
        watchdog(out, {'status':'TIMEOUT_DURING_ROUTE','emergencyGroups':sorted(emergency),
                       'survivors':[g for g in sorted(emergency) if alive(g)]})
    except Exception as exc:
        result['status'] = 'GUARD_OR_CHILD_FAILURE'; result['error'] = repr(exc)
    finally:
        def final_alarm(*_):
            emergency = set(known)
            if proc is not None: emergency.add(proc.pid)
            rows, _ = process_rows()
            if proc is not None: emergency |= descend(proc.pid, rows)
            for group in emergency:
                try: os.killpg(group, signal.SIGKILL)
                except ProcessLookupError: pass
            try: watchdog(out, {'status':'TIMEOUT_IN_FINALIZATION','emergencyGroups':sorted(emergency),
                                'survivors':[g for g in sorted(emergency) if alive(g)]})
            except Exception: pass
            raise TimeoutError('deadline during finalization')
        signal.signal(signal.SIGALRM, final_alarm)
        if proc is not None: known.add(proc.pid)
        receipt = target / 'LAUNCH.json'
        if receipt.exists():
            try: known.add(json.loads(receipt.read_bytes())['pgid'])
            except Exception as exc: errors.append({'receipt':str(receipt),'error':repr(exc)})
        rows, ps_errors = process_rows(); errors += ps_errors
        if proc is not None: known |= descend(proc.pid, rows)
        result['knownGroups'] = sorted(known)
        result['ownershipErrors'] = errors
        result['survivedBeforeCleanup'] = [g for g in sorted(known) if alive(g)]
        result['cleanup'] = {str(g):stop(g) for g in sorted(known)}
        result['survivors'] = [g for g in sorted(known) if alive(g)]
        if result['survivors'] or errors or result['survivedBeforeCleanup']:
            result['status'] = 'OWNERSHIP_OR_CLEANUP_FAILURE'; result['stagePassed'] = False
        result['elapsedSeconds'] = time.monotonic() - _BOOTSTRAP_START
        if result['elapsedSeconds'] >= cap:
            result['status'] = 'OUTER_TIMEOUT'; result['stagePassed'] = False
        result['finishedUtc'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        write(out / 'RESULT.json', result)
        write(out / 'RESULT.sha256.json', {'sha256':file_sha(out / 'RESULT.json')})
    watchdog(out, {'status':'FINALIZED_AFTER_RESULT','resultStatus':result['status'],
                   'resultSha256':file_sha(out / 'RESULT.json'),
                   'elapsedSeconds':time.monotonic()-_BOOTSTRAP_START})
    signal.setitimer(signal.ITIMER_REAL, 0)
    print(json.dumps({'status':result['status'],'resultSha256':file_sha(out / 'RESULT.json')},sort_keys=True))
    if not result['stagePassed']: raise SystemExit(1)

if __name__ == '__main__': main()
