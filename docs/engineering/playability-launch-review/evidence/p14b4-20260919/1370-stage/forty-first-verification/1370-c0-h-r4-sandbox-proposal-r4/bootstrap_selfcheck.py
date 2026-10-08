#!/usr/bin/env python3
"""Disposable exact-policy ordinary and moved-held-parent fixture."""
import json
import os
import selectors
import signal
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import bootstrap
from canary import clear_group


def make_binding(root, label):
    experiment = root / f'{label}-experiment'
    experiment.mkdir()
    canary = experiment / 'denied'
    canary.mkdir()
    allowed = experiment / 'allowed'
    allowed.mkdir()
    protected = root / f'{label}-protected'
    protected.mkdir()
    (protected / 'sentinel').write_text('unchanged\n')
    output_parent = root / f'{label}-profile-output'
    output_parent.mkdir()
    path = output_parent / 'final.sb'
    spec = {'mode': 'synthetic', 'experimentParent': str(experiment),
            'deniedCanary': str(canary), 'allowedDirectories': [str(allowed)],
            'protectedDirectories': [str(protected)]}
    python = str(Path(sys.executable).resolve(strict=True))
    binding = {'sandboxExecutable': str(bootstrap.SANDBOX),
               'sandboxExecutableSha256': bootstrap.sha(bootstrap.file_bytes(bootstrap.SANDBOX, 16*1024*1024)),
               'pythonExecutable': python,
               'pythonExecutableSha256': bootstrap.sha(bootstrap.file_bytes(python, 64*1024*1024)),
               'profileBinding': spec, 'profilePath': str(path), 'immutableReceiptSha256': {},
               'sourceSha256': {name: bootstrap.sha(bootstrap.file_bytes(bootstrap.HERE / name, 1024*1024))
                                for name in ('profile.py','generate_profile.py','canary.py','bootstrap.py')}}
    binding['bootstrapPolicySha256'] = bootstrap.policy(binding)['sha256']
    binding_path = root / f'{label}-binding.json'
    binding_path.write_text(json.dumps(binding, sort_keys=True))
    return binding, binding_path, protected, output_parent


def moved_parent(root):
    binding, binding_path, protected, output_parent = make_binding(root, 'moved')
    rendered = bootstrap.policy(binding)
    env = {k: v for k,v in os.environ.items() if not k.startswith('GIT_')}
    env.update(PYTHONDONTWRITEBYTECODE='1', H_BOOTSTRAP_POLICY_SHA=rendered['sha256'],
               H_BOOTSTRAP_TEST_STOP='1')
    argv = bootstrap.command(binding, binding_path, rendered['text'])
    child = subprocess.Popen(argv, env=env, cwd=root, stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             start_new_session=True, close_fds=True, pass_fds=())
    child.stdin.close()
    selector = selectors.DefaultSelector()
    output = {child.stdout: bytearray(), child.stderr: bytearray()}
    ready = False
    try:
        for pipe in output:
            os.set_blocking(pipe.fileno(), False)
            selector.register(pipe, selectors.EVENT_READ)
        deadline = time.monotonic() + 12
        while time.monotonic() < deadline and (selector.get_map() or child.poll() is None):
            for event,_ in selector.select(0.05):
                pipe = event.fileobj
                data = os.read(pipe.fileno(), min(8193-len(output[pipe]), 8193))
                if not data:
                    selector.unregister(pipe)
                else:
                    output[pipe].extend(data)
                    if len(output[pipe]) > 8192:
                        raise RuntimeError('synthetic pipe cap')
            if not ready and b'READY_BEFORE_OPEN\n' in output[child.stdout]:
                ready = True
                output_parent.rename(protected / 'moved-output')
                os.kill(child.pid, signal.SIGCONT)
        if not ready or child.poll() is None:
            raise RuntimeError('synthetic moved-parent timeout or no ready marker')
        if child.returncode == 0:
            raise RuntimeError('moved parent unexpectedly wrote profile')
        if (protected / 'moved-output' / 'final.sb').exists():
            raise RuntimeError('protected profile appeared')
        if b'Operation not permitted' not in output[child.stderr] and b'PermissionError' not in output[child.stderr]:
            raise RuntimeError(f'missing sandbox denial: {bytes(output[child.stderr])[:500]!r}')
        if (protected / 'sentinel').read_text() != 'unchanged\n':
            raise RuntimeError('protected sentinel drift')
        return {'exitCode': child.returncode, 'sandboxDenied': True,
                'argvShape': [argv[0], argv[1], '<inline-policy>', *argv[3:]],
                'policySha256': rendered['sha256']}
    finally:
        selector.close()
        clear_group(child, child.pid)
        for pipe in output: pipe.close()


with tempfile.TemporaryDirectory(prefix='bootstrap-r4-', dir=Path(__file__).parent) as temp:
    root = Path(temp)
    binding, path, protected, output_parent = make_binding(root, 'ordinary')
    ordinary = bootstrap.run(path)
    assert (output_parent / 'final.sb').is_file()
    assert (protected / 'sentinel').read_text() == 'unchanged\n'
    moved = moved_parent(root)
    print(json.dumps({'status': 'PASS_SYNTHETIC_ONLY', 'ordinary': ordinary,
                      'movedParent': moved}, sort_keys=True))
