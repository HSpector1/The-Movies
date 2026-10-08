#!/usr/bin/env python3
"""Unrun inline-sandbox supervisor for H dependency manifest/materializer workers."""
import hashlib
import json
import os
from pathlib import Path
import selectors
import signal
import stat
import subprocess
import sys
import time

SANDBOX = '/usr/bin/sandbox-exec'
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
PRODUCTION = Path('/Users/zacheryspector/The-Movies-headless-program')
H = Path('/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1')
DEPENDENCIES = PRODUCTION / 'node_modules'
SOURCE = Path('/Users/zacheryspector/studio-scratch/1370-c0-h-r4-materializer-proposal-r4')
REQUIRED_RECEIPTS = frozenset({
    '/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-independent-observed-review-r6/RECEIPT.json',
    '/Users/zacheryspector/studio-scratch/1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json',
    '/Users/zacheryspector/studio-scratch/1370-c0-h-r13-root-drift-attribution-r5-independent-design-review-r1/RECEIPT.json',
    '/Users/zacheryspector/studio-scratch/1370-c0-h-r4-materializer-independent-static-review-r1/RECEIPT.json',
    '/Users/zacheryspector/studio-scratch/1370-c0-h-typecheck-r13-independent-observed-stop-review-r1/RECEIPT.json',
    '/Users/zacheryspector/studio-scratch/1370-c0-stage40-remote-audit-independent-observed-review-r2/RECEIPT.json',
})
CAP = 8192
POLICY_CAP = 32768
DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW


def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as handle:
        while block := handle.read(1024 * 1024): h.update(block)
    return h.hexdigest()


def held_chain(value):
    path = Path(value)
    if not path.is_absolute() or str(path) != os.path.normpath(str(path)):
        raise ValueError('noncanonical directory path')
    fd = os.open('/', DIR_FLAGS)
    chain = []
    try:
        s = os.fstat(fd); chain.append((s.st_dev, s.st_ino))
        for item in path.parts[1:]:
            if item in ('', '.', '..'): raise ValueError('ambiguous path component')
            next_fd = os.open(item, DIR_FLAGS, dir_fd=fd)
            os.close(fd); fd = next_fd
            s = os.fstat(fd); chain.append((s.st_dev, s.st_ino))
        return fd, chain
    except BaseException:
        os.close(fd)
        raise


def checked_dir(path):
    fd, chain = held_chain(path)
    try:
        if Path(path).resolve(strict=True) != Path(path):
            raise ValueError('symlink directory ancestry')
        return Path(path), chain
    finally: os.close(fd)


def path_overlap(a, b):
    return a == b or a in b.parents or b in a.parents


def policy(protected, exact_files, writable_trees):
    """Default deny; exact literals and explicitly named one-shot subtrees only."""
    protected = [Path(x) for x in protected]
    exact_files = [Path(x) for x in exact_files]
    writable_trees = [Path(x) for x in writable_trees]
    for output in exact_files + writable_trees:
        if not output.is_absolute() or str(output) != os.path.normpath(str(output)):
            raise ValueError('noncanonical output')
        if any(path_overlap(output, item) for item in protected):
            raise ValueError('output overlaps protected input')
    def q(value):
        if any(ord(char) < 32 for char in str(value)):
            raise ValueError('control character in policy path')
        return json.dumps(str(value), ensure_ascii=True)
    lines = ['(version 1)', '(deny default)', '(allow process*)',
             '(allow file-read*)', '(allow mach-lookup)']
    lines += [f'(deny file-write* (subpath {q(x)}))' for x in sorted(set(protected))]
    lines += [f'(allow file-write* (literal {q(x)}))' for x in sorted(set(exact_files + writable_trees))]
    lines += [f'(allow file-write* (subpath {q(x)}))' for x in sorted(set(writable_trees))]
    value = '\n'.join(lines) + '\n'
    if len(value.encode()) > POLICY_CAP: raise ValueError('inline policy exceeds cap')
    return value


def group_exists(pgid):
    try: os.killpg(pgid, 0)
    except ProcessLookupError: return False
    except OSError: return True
    return True


def clear_group(proc):
    pgid = proc.pid; errors = []
    for sig, seconds in ((signal.SIGTERM, 0.5), (signal.SIGKILL, 2.0)):
        try: os.killpg(pgid, sig)
        except ProcessLookupError: pass
        except OSError as error: errors.append(repr(error))
        until = time.monotonic() + seconds
        while group_exists(pgid) and time.monotonic() < until: time.sleep(0.02)
        if not group_exists(pgid): break
    if proc.poll() is None:
        try: proc.terminate()
        except ProcessLookupError: pass
        except OSError as error: errors.append(repr(error))
        try: proc.wait(timeout=0.5)
        except subprocess.TimeoutExpired:
            try: proc.kill()
            except ProcessLookupError: pass
            except OSError as error: errors.append(repr(error))
    try: proc.wait(timeout=2.0)
    except subprocess.TimeoutExpired: errors.append('direct child unreaped')
    until = time.monotonic() + 2.0
    while group_exists(pgid) and time.monotonic() < until: time.sleep(0.02)
    if group_exists(pgid): errors.append('group not clear')
    return {'reaped': proc.poll() is not None, 'groupClear': not group_exists(pgid), 'errors': errors}


def bounded(argv, *, cwd, timeout, environment=None, ready=None):
    """No inherited writable FD, bounded pipes, owned-group STOP cleanup."""
    env = dict(os.environ)
    if environment: env.update(environment)
    env['PYTHONDONTWRITEBYTECODE'] = '1'
    proc = subprocess.Popen(argv, cwd=cwd, env=env, stdin=subprocess.PIPE,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            close_fds=True, pass_fds=(), start_new_session=True)
    streams = {proc.stdout: bytearray(), proc.stderr: bytearray()}
    selector = selectors.DefaultSelector(); reason = None; cleanup = None
    try:
        for pipe in streams:
            os.set_blocking(pipe.fileno(), False)
            selector.register(pipe, selectors.EVENT_READ)
        deadline = time.monotonic() + timeout
        notified = False
        while selector.get_map() or proc.poll() is None:
            if time.monotonic() >= deadline:
                reason = 'timeout'; break
            for key, _ in selector.select(0.05):
                pipe = key.fileobj
                remaining = CAP + 1 - len(streams[pipe])
                block = os.read(pipe.fileno(), min(65536, remaining))
                if not block:
                    selector.unregister(pipe); continue
                streams[pipe].extend(block)
                if len(streams[pipe]) > CAP:
                    reason = 'pipe cap'; break
            if reason: break
            if ready and not notified and b'READY\n' in streams[proc.stdout]:
                ready(proc)
                notified = True
        if reason is None:
            proc.wait(timeout=1)
            if proc.returncode: reason = f'child exit {proc.returncode}'
            elif group_exists(proc.pid): reason = 'surviving descendant'
        if reason:
            cleanup = clear_group(proc)
            raise RuntimeError(f'STOP_BOOTSTRAP {reason}; cleanup={cleanup}')
        return {'stdout': bytes(streams[proc.stdout]), 'stderr': bytes(streams[proc.stderr]),
                'exit': proc.returncode, 'groupClear': True}
    except BaseException:
        if cleanup is None and (proc.poll() is None or group_exists(proc.pid)):
            clear_group(proc)
        raise
    finally:
        selector.close()
        for pipe in (*streams, proc.stdin): pipe.close()


def real_binding(path):
    binding_path = Path(path)
    if not binding_path.is_absolute() or binding_path.is_symlink() or \
       binding_path.resolve(strict=True) != binding_path:
        raise ValueError('bad bootstrap binding path')
    b = json.loads(binding_path.read_text())
    if b.get('status') != 'FILLED_INDEPENDENTLY_REVIEWED' or b.get('operation') not in ('manifest', 'materialize'):
        raise ValueError('real binding unfilled or operation invalid')
    if b.get('codeDir') != str(SOURCE) or b.get('productionRepo') != str(PRODUCTION) or \
       b.get('protectedH') != str(H) or b.get('productionDependencies') != str(DEPENDENCIES):
        raise ValueError('fixed protected source binding mismatch')
    receipts = b.get('immutableReceiptSha256')
    if not isinstance(receipts, dict) or not REQUIRED_RECEIPTS.issubset(receipts):
        raise ValueError('missing baseline immutable receipts')
    if not b.get('evidenceCheckout'): raise ValueError('evidence checkout must be bound')
    protected = [PRODUCTION, H, DEPENDENCIES, Path(b['evidenceCheckout'])]
    protected += [Path(name).parent for name in receipts]
    protected += [SOURCE]
    for item in protected: checked_dir(item)
    for name, expected in receipts.items():
        file = Path(name)
        if not file.is_file() or file.is_symlink() or file.resolve(strict=True) != file or digest(file) != expected:
            raise ValueError(f'immutable receipt drift: {name}')
    code = b.get('sourceSha256', {})
    for name in ('materialize.py', 'dependency_manifest.py', 'safe_output.py', 'native_metadata.py', 'run.py'):
        if digest(SOURCE / name) != code.get(name): raise ValueError(f'worker source drift: {name}')
    if digest(Path(__file__).with_name('worker.py')) != b.get('workerSha256'):
        raise ValueError('bootstrap worker source drift')
    if digest(__file__) != b.get('bootstrapSha256'):
        raise ValueError('bootstrap supervisor source drift')
    python = Path(sys.executable).resolve(strict=True)
    if str(python) != b.get('pythonExecutable') or digest(python) != b.get('pythonExecutableSha256'):
        raise ValueError('Python executable drift')
    if digest(SANDBOX) != b.get('sandboxExecutableSha256'):
        raise ValueError('sandbox-exec executable drift')
    operation_binding = Path(b['operationBinding'])
    if not operation_binding.is_absolute() or operation_binding.is_symlink() or \
       operation_binding.resolve(strict=True) != operation_binding or \
       digest(operation_binding) != b.get('operationBindingSha256'):
        raise ValueError('operation binding drift')
    operation = json.loads(operation_binding.read_text())
    if (operation.get('protectedH') != str(H) or operation.get('productionDependencies') != str(DEPENDENCIES)
            or operation.get('evidenceCheckout') != b['evidenceCheckout']
            or operation.get('immutableReceiptSha256') != receipts):
        raise ValueError('operation protected binding mismatch')
    if b['operation'] == 'manifest':
        if b.get('manifestSource') != str(DEPENDENCIES): raise ValueError('manifest source mismatch')
        target = Path(b['manifestOutput'])
        exact_files, trees = [target], []
        if operation.get('manifestOutput') != str(target): raise ValueError('manifest output mismatch')
    else:
        experiment = Path(b['oneShotParent']); result = Path(b['resultPath'])
        if (operation.get('oneShotParent') != str(experiment) or
                operation.get('resultPath') != str(result) or
                operation.get('wholeSeconds') != 600):
            raise ValueError('materializer output mismatch')
        exact_files, trees = [result], [experiment]
    for item in exact_files + trees:
        if SCRATCH not in item.parents or item.exists() or item.is_symlink():
            raise ValueError('output must be absent in studio scratch')
        checked_dir(item.parent)
    source = operation_binding
    return b, protected, exact_files, trees, source


def launch(path):
    b, protected, files, trees, operation_binding = real_binding(path)
    text = policy(protected, files, trees)
    policy_sha = hashlib.sha256(text.encode()).hexdigest()
    if policy_sha != b.get('bootstrapPolicySha256'):
        raise ValueError('bootstrap policy bytes drift')
    argv = [SANDBOX, '-p', text, b['pythonExecutable'], '-B',
            str(Path(__file__).with_name('worker.py')), b['operation'], str(operation_binding)]
    if len(''.join(argv).encode()) > POLICY_CAP + 4096: raise ValueError('argv cap')
    timeout = 630 if b['operation'] == 'materialize' else 630
    result = bounded(argv, cwd=str(SOURCE), timeout=timeout)
    result['policySha256'] = policy_sha
    result['argvPrefix'] = [SANDBOX, '-p', policy_sha, b['pythonExecutable'], '-B',
                            str(Path(__file__).with_name('worker.py')), b['operation']]
    return result


if __name__ == '__main__':
    if len(sys.argv) != 2: raise SystemExit('usage: bootstrap.py FILLED_BINDING.json')
    try:
        outcome = launch(sys.argv[1])
        print(json.dumps({'status': 'WORKER_EXIT_ZERO_PENDING_REVIEW',
                          'stdoutBytes': len(outcome['stdout']), 'stderrBytes': len(outcome['stderr']),
                          'stdoutSha256': hashlib.sha256(outcome['stdout']).hexdigest(),
                          'stderrSha256': hashlib.sha256(outcome['stderr']).hexdigest(),
                          'policySha256': outcome['policySha256'],
                          'argvPrefix': outcome['argvPrefix']}))
    except BaseException as error:
        print(json.dumps({'status': 'STOP_BOOTSTRAP', 'error': repr(error)}))
        raise SystemExit(1)
