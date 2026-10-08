#!/usr/bin/env python3
"""Only tiny scratch manifest/openat and real /bin/cp sandbox fixtures."""
import json
import os
from pathlib import Path
import sys
import tempfile

import bootstrap

HERE = Path(__file__).resolve().parent


def supervisor_checks(area):
    scripts = {
        'nonzero': ('import sys; sys.exit(7)', 'child exit 7'),
        'timeout': ('import time; time.sleep(30)', 'timeout'),
        'noisy-grandchild': (
            "import subprocess,sys,time; "
            "subprocess.Popen([sys.executable,'-c',"
            "'import sys,time; sys.stdout.buffer.write(bytes([120])*100000); sys.stdout.flush(); time.sleep(30)']); "
            "time.sleep(30)", 'pipe cap')
    }
    for label, (program, expected) in scripts.items():
        try:
            bootstrap.bounded([sys.executable, '-B', '-c', program], cwd=str(area),
                              timeout=0.4 if label == 'timeout' else 3)
        except RuntimeError as error:
            message = str(error)
            assert expected in message and "'groupClear': True" in message and "'reaped': True" in message, (label, message)
        else: raise AssertionError(f'{label} did not STOP')
    return True


def attempt(area, mode, swap):
    area.mkdir()
    protected = area / 'protected'; protected.mkdir()
    output = area / 'output'
    if mode != 'cp-create': output.mkdir()
    source = area / 'source.txt'; source.write_text('clone fixture\n')
    exact = [output / 'manifest.json'] if mode == 'manifest' else []
    trees = [] if mode == 'manifest' else [output]
    policy = bootstrap.policy([protected], exact, trees)
    argv = [bootstrap.SANDBOX, '-p', policy, sys.executable, '-B',
            str(HERE / 'fixture_worker.py'), mode, str(output), str(source)]
    def ready(proc):
        if swap:
            output.rename(protected / 'moved-output')
            if mode == 'cp': output.symlink_to(protected / 'moved-output', target_is_directory=True)
        proc.stdin.write(b'go\n'); proc.stdin.flush()
    try:
        result = bootstrap.bounded(argv, cwd=str(area), timeout=8, ready=ready)
        stopped = None
        text = result['stdout'].decode().splitlines()
        observed = json.loads(text[-1])
    except RuntimeError as error:
        stopped = str(error)
        observed = {'write': 'DENIED'}
    protected_name = 'manifest.json' if mode == 'manifest' else 'copied.txt'
    protected_file = protected / 'moved-output' / protected_name
    return {'mode': mode, 'swap': swap, 'observed': observed,
            'protectedFileExists': protected_file.exists(),
            'ordinaryFileExists': (output / protected_name).exists() if not swap else False,
            'supervisorStop': stopped}


with tempfile.TemporaryDirectory(prefix='materializer-bootstrap-selfcheck-', dir=HERE) as value:
    root = Path(value)
    manifest_ordinary = attempt(root / 'manifest-ordinary', 'manifest', False)
    manifest_moved = attempt(root / 'manifest-moved', 'manifest', True)
    cp_ordinary = attempt(root / 'cp-ordinary', 'cp', False)
    cp_create = attempt(root / 'cp-create', 'cp-create', False)
    cp_moved = attempt(root / 'cp-moved', 'cp', True)
    supervisor = supervisor_checks(root)
    result = {'status': 'PASS_SCRATCH_BOOTSTRAP_MANIFEST_AND_CP',
              'manifestOrdinary': manifest_ordinary, 'manifestMoved': manifest_moved,
              'cpOrdinary': cp_ordinary, 'cpCreate': cp_create, 'cpMoved': cp_moved,
              'boundedSupervisorRed': supervisor}
    assert manifest_ordinary['observed']['write'] == 'ALLOWED' and manifest_ordinary['ordinaryFileExists']
    assert not manifest_moved['protectedFileExists'] and manifest_moved['observed']['write'] == 'DENIED'
    assert cp_ordinary['observed']['write'] == 'ALLOWED' and cp_ordinary['ordinaryFileExists']
    assert cp_create['observed']['write'] == 'ALLOWED' and cp_create['ordinaryFileExists']
    assert not cp_moved['protectedFileExists'] and cp_moved['observed']['write'] == 'DENIED'
    print(json.dumps(result, indent=2, sort_keys=True))
