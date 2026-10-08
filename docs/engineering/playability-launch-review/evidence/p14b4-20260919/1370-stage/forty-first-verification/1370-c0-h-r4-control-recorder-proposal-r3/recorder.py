#!/usr/bin/env python3
"""Unrun H r4/r5 control-arm proposal. Exact binding and independent review required."""
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
import safe_output
import native_metadata

FLOOR = 3 * 2**30
START_BUFFER = 256 * 2**20
STOP_BUFFER = 128 * 2**20
CHILD_SECONDS = 90
RECORDER_SECONDS = 120
OUT_CAP = 8 * 2**20
WATCH_CAP = 4 * 2**20
EXPECTED_FILE = 'tests/diagnostic.test.ts'

class Stop(Exception):
    def __init__(self, status, detail): super().__init__(detail); self.status = status; self.detail = detail

def sha_file(path, deadline=None):
    h = hashlib.sha256()
    fd = os.open(path, os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0))
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode): raise Stop('STOP_GUARD', f'not regular: {path}')
        while True:
            if deadline and time.monotonic() >= deadline: raise Stop('STOP_RECORDER_TIMEOUT', 'hash deadline')
            block = os.read(fd, 1024 * 1024)
            if not block: break
            h.update(block)
        after = os.fstat(fd)
        if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns, before.st_ctime_ns) != \
           (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns, after.st_ctime_ns):
            raise Stop('STOP_GUARD', f'file changed during hash: {path}')
        return h.hexdigest(), before.st_size
    finally: os.close(fd)

def tree_snapshot(root, deadline=None, allowed_links=None):
    root = Path(root)
    if root.is_symlink() or not root.is_dir(): raise Stop('STOP_GUARD', f'root not real directory: {root}')
    rows, files, bytes_total = [], 0, 0
    def metadata(p, s):
        if deadline and time.monotonic() >= deadline: raise Stop('STOP_RECORDER_TIMEOUT', 'metadata deadline')
        try: extra = native_metadata.capture(p)
        except (OSError, ValueError, RuntimeError) as e:
            raise Stop('STOP_GUARD', f'ACL/xattr read failed: {p}: {e}') from e
        return {'mode': stat.S_IMODE(s.st_mode), 'uid': s.st_uid, 'gid': s.st_gid,
                'flags': getattr(s, 'st_flags', 0), 'nlink': s.st_nlink,
                **extra}
    def visit(directory):
        nonlocal files, bytes_total
        if deadline and time.monotonic() >= deadline: raise Stop('STOP_RECORDER_TIMEOUT', 'snapshot deadline')
        for item in sorted(os.scandir(directory), key=lambda e: e.name):
            p = Path(item.path); s = item.stat(follow_symlinks=False)
            rel = p.relative_to(root).as_posix()
            base = {'path': rel, **metadata(p, s)}
            if stat.S_ISLNK(s.st_mode):
                target = os.readlink(p)
                resolved_path = p.resolve(strict=True)
                allowed = (allowed_links or {}).get(rel)
                if allowed is not None:
                    if resolved_path != Path(allowed).resolve(strict=True):
                        raise Stop('STOP_GUARD', f'authorized link target drift: {p}')
                elif not resolved_path.is_relative_to(root):
                    raise Stop('STOP_GUARD', f'escaping link: {p}')
                resolved = str(resolved_path)
                rows.append({**base, 'kind': 'link', 'target': target, 'resolved': resolved})
            elif stat.S_ISDIR(s.st_mode):
                rows.append({**base, 'kind': 'dir', 'dev': s.st_dev, 'ino': s.st_ino}); visit(p)
            elif stat.S_ISREG(s.st_mode):
                if s.st_nlink != 1: raise Stop('STOP_GUARD', f'hardlink: {p}')
                digest, size = sha_file(p, deadline)
                rows.append({**base, 'kind': 'file', 'size': size, 'sha256': digest,
                             'dev': s.st_dev, 'ino': s.st_ino}); files += 1; bytes_total += size
            else: raise Stop('STOP_GUARD', f'unsupported tree item: {p}')
    root_stat = os.lstat(root)
    rows.append({'path': '.', 'kind': 'dir', 'dev': root_stat.st_dev, 'ino': root_stat.st_ino,
                 **metadata(root, root_stat)})
    visit(root)
    packed = json.dumps(rows, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    roster = [row for row in rows if row['path'] != '.' and '/' not in row['path']]
    roster_packed = json.dumps(roster, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    return {'digest': hashlib.sha256(packed).hexdigest(), 'rosterDigest': hashlib.sha256(roster_packed).hexdigest(),
            'entries': len(rows), 'regularFiles': files, 'regularBytes': bytes_total, 'rootTuple': root_tuple(root)}

def root_tuple(root):
    s = os.lstat(root)
    if not stat.S_ISDIR(s.st_mode): raise Stop('STOP_GUARD', 'root is not a directory')
    return {'dev': s.st_dev, 'ino': s.st_ino, 'mode': stat.S_IMODE(s.st_mode),
            'flags': getattr(s, 'st_flags', 0), 'nlink': s.st_nlink,
            'mtimeNs': s.st_mtime_ns, 'ctimeNs': s.st_ctime_ns}

def available(path):
    s = os.statvfs(path); return s.f_bavail * s.f_frsize

def write_bounded(stream, chunk, counts, name, cap):
    if len(chunk) > cap - counts[name]: raise Stop('STOP_OUTPUT_CAP', f'{name} cap')
    stream.write(chunk); counts[name] += len(chunk)

def ac_power():
    proc = subprocess.run(['/usr/bin/pmset', '-g', 'batt'], capture_output=True, text=True, timeout=5)
    if proc.returncode or "Now drawing from 'AC Power'" not in proc.stdout:
        raise Stop('STOP_POWER', 'AC power not proven')
    return {'source': '/usr/bin/pmset -g batt', 'sha256': hashlib.sha256(proc.stdout.encode()).hexdigest()}

def sha_bytes(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def clean_git_env():
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env['GIT_TERMINAL_PROMPT'] = '0'
    return env

def git_ref(repo, remote_ref):
    if not remote_ref.startswith('refs/heads/') or any(x in remote_ref for x in (' ', '\n', '..')):
        raise Stop('STOP_REF', 'invalid remote ref')
    env = clean_git_env()
    proc = subprocess.run(['git', '-C', repo, 'rev-parse', 'HEAD', 'HEAD^{tree}', 'HEAD:src'],
                          capture_output=True, text=True, timeout=15, env=env)
    if proc.returncode: raise Stop('STOP_REF', proc.stderr.strip())
    vals = proc.stdout.splitlines()
    if len(vals) != 3: raise Stop('STOP_REF', 'bad git ref output')
    origin = subprocess.run(['git', '-C', repo, 'remote', 'get-url', 'origin'],
                            capture_output=True, text=True, timeout=15, env=env)
    remote = subprocess.run(['git', '-C', repo, 'ls-remote', '--exit-code', 'origin', remote_ref],
                            capture_output=True, text=True, timeout=15, env=env)
    if origin.returncode or remote.returncode: raise Stop('STOP_REF', 'origin or remote ref unavailable')
    line = remote.stdout.splitlines()
    if len(line) != 1 or line[0].split()[-1] != remote_ref:
        raise Stop('STOP_REF', 'ambiguous remote ref')
    return {'head': vals[0], 'tree': vals[1], 'srcTree': vals[2],
            'origin': origin.stdout.strip(), 'remoteRef': remote_ref, 'remoteHead': line[0].split()[0]}

def lane_lock(b):
    lock_path = b['laneLockPath']
    if lock_path != '/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK':
        raise Stop('STOP_LOCK', 'wrong heavy-lane lock path')
    fd = os.open(lock_path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        s = os.fstat(fd)
        if not stat.S_ISREG(s.st_mode) or s.st_size > 256 or s.st_nlink != 1:
            raise Stop('STOP_LOCK', 'lock type/size/link count mismatch')
        raw = os.read(fd, 257)
        if len(raw) != s.st_size: raise Stop('STOP_LOCK', 'lock size changed')
        digest = hashlib.sha256(raw).hexdigest()
        content = raw.decode()
    finally: os.close(fd)
    expected = 'lane-run ' + Path(b['laneLog']).name + ', started '
    if not content.startswith(expected) or len(content.splitlines()) != 1:
        raise Stop('STOP_LOCK', 'lock does not identify this lane log')
    parent = subprocess.run(['/bin/ps', '-ww', '-p', str(os.getppid()), '-o', 'command='],
                            capture_output=True, text=True, timeout=5)
    if parent.returncode or 'lane-run.sh' not in parent.stdout or b['laneLog'] not in parent.stdout:
        raise Stop('STOP_LOCK', 'recorder parent is not the bound lane wrapper')
    after = os.lstat(lock_path)
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns, after.st_ctime_ns) != \
       (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns) or \
       s.st_uid != os.getuid():
        raise Stop('STOP_LOCK', 'lock owner/link count mismatch')
    return {'sha256': digest, 'dev': s.st_dev, 'ino': s.st_ino,
            'content': content, 'parentPid': os.getppid(), 'parentCommand': parent.stdout.strip()}

def require_binding(b):
    required = ['sourceRoot', 'dependencyRoot', 'outputDir', 'profile', 'profileSha256',
                'probeReceipt', 'probeReceiptSha256', 'sandboxExecutable', 'nodeExecutable',
                'nodeExecutableSha256', 'vitestCli', 'vitestCliSha256', 'productionRepo', 'productionRef',
                'evidenceRepo', 'evidenceRef', 'protectedH', 'protectedHDigest',
                'sourceExpected', 'dependencyExpected', 'guardRoots', 'watcherNode',
                'watcherSha256', 'expectedTestName', 'environment', 'laneLockPath',
                'laneLog', 'receiptDir']
    required += ['stage40Receipt', 'stage40ReceiptSha256']
    for key in required:
        if key not in b: raise Stop('STOP_BINDING', f'missing {key}')
    for key in ['sourceRoot', 'dependencyRoot', 'outputDir', 'profile', 'probeReceipt',
                'sandboxExecutable', 'nodeExecutable', 'vitestCli', 'productionRepo',
                'evidenceRepo', 'protectedH', 'watcherNode', 'laneLockPath', 'laneLog',
                'receiptDir', 'stage40Receipt']:
        if not os.path.isabs(b[key]): raise Stop('STOP_BINDING', f'not absolute: {key}')
    if Path(b['outputDir']).exists(): raise Stop('STOP_BINDING', 'one-shot output already exists')
    out_parent = Path(b['outputDir']).parent.resolve(strict=True)
    for key in ['sourceRoot', 'dependencyRoot', 'protectedH', 'productionRepo', 'evidenceRepo']:
        protected = Path(b[key]).resolve(strict=True)
        if out_parent == protected or protected in out_parent.parents:
            raise Stop('STOP_BINDING', f'output parent lies inside {key}')
    for item in b['guardRoots']:
        protected = Path(item['path']).resolve(strict=True)
        if out_parent == protected or protected in out_parent.parents:
            raise Stop('STOP_BINDING', 'output parent lies inside guard root')
    for key in ['sourceRoot', 'dependencyRoot', 'protectedH', 'productionRepo', 'evidenceRepo']:
        if Path(b[key]).is_symlink() or not Path(b[key]).is_dir(): raise Stop('STOP_BINDING', f'bad root {key}')
    lane_lock(b)
    if 'NODE_OPTIONS' in b['environment'] or os.environ.get('NODE_OPTIONS'):
        raise Stop('STOP_BINDING', 'control must omit NODE_OPTIONS')
    if Path(b['sourceRoot'], 'node_modules').resolve(strict=True) != Path(b['dependencyRoot']).resolve(strict=True):
        raise Stop('STOP_BINDING', 'control node_modules does not point to own dependency view')
    if (sha_bytes(b['profile']) != b['profileSha256'] or sha_bytes(b['vitestCli']) != b['vitestCliSha256'] or
        sha_bytes(b['nodeExecutable']) != b['nodeExecutableSha256']):
        raise Stop('STOP_BINDING', 'profile, Node, or Vitest CLI hash differs')
    if Path(b['vitestCli']).resolve(strict=True) != Path(b['vitestCli']) or \
       Path(b['dependencyRoot']).resolve(strict=True) not in Path(b['vitestCli']).parents:
        raise Stop('STOP_BINDING', 'Vitest CLI is not canonical inside isolated deps')
    if b['watcherNode'] != b['nodeExecutable']:
        raise Stop('STOP_BINDING', 'watcher and child Node differ')
    if sha_bytes(Path(__file__).with_name('watcher.cjs')) != b['watcherSha256']:
        raise Stop('STOP_BINDING', 'watcher source hash differs')
    if sha_bytes(b['probeReceipt']) != b['probeReceiptSha256']:
        raise Stop('STOP_BOUNDARY', 'probe receipt hash differs')
    if sha_bytes(b['stage40Receipt']) != b['stage40ReceiptSha256']:
        raise Stop('STOP_REF', 'Stage40 byte receipt hash differs')
    stage40 = json.loads(Path(b['stage40Receipt']).read_text())
    if (stage40.get('decision') != 'ACCEPT_OBSERVED_REMOTE_STAGE40_C0_H_SOURCE_BYTES_ONLY' or
        stage40.get('fileCount') != 138 or stage40.get('totalBytes') != 828287 or
        stage40.get('commit') != 'eb58bc0042ebf0c02a16d0bdaa1f5734e1f5f9eb' or
        stage40.get('tree') != 'd7d2f707b7b1e377ce337519a33f91e894dac04a'):
        raise Stop('STOP_REF', 'Stage40 remote byte authority mismatch')
    ancestor = subprocess.run(['git', '-C', b['evidenceRepo'], 'merge-base', '--is-ancestor',
                               stage40['commit'], b['evidenceRef']['head']],
                              env=clean_git_env(), capture_output=True, timeout=15)
    if ancestor.returncode: raise Stop('STOP_REF', 'Stage40 is not evidence ancestor')
    probe = json.loads(Path(b['probeReceipt']).read_text())
    if (probe.get('profileSha256') != b['profileSha256'] or not probe.get('canaryDenied') or
        not probe.get('allowedWrite') or not probe.get('descendantAttested') or
        probe.get('argvPrefix') != [b['sandboxExecutable'], '-f', b['profile']]):
        raise Stop('STOP_BOUNDARY', 'probe does not attest actual profile/descendant')
    if (git_ref(b['productionRepo'], b['productionRef']['remoteRef']) != b['productionRef'] or
        git_ref(b['evidenceRepo'], b['evidenceRef']['remoteRef']) != b['evidenceRef']):
        raise Stop('STOP_REF', 'source ref drift')
    if available(b['outputDir'] if Path(b['outputDir']).exists() else Path(b['outputDir']).parent) < FLOOR + START_BUFFER:
        raise Stop('STOP_DISK', 'less than floor + 256 MiB before child')
    if b['sandboxExecutable'] != '/usr/bin/sandbox-exec': raise Stop('STOP_BINDING', 'wrong sandbox executable')
    ac_power()
    if b['expectedTestName'] != 'records the full p13a original digest preimages':
        raise Stop('STOP_BINDING', 'unexpected diagnostic identity')
    for name in ['HOME', 'TMPDIR', 'VITEST_CACHE_DIR', 'PREIMAGE_OUTPUT']:
        value = b['environment'].get(name)
        if not value or not os.path.isabs(value): raise Stop('STOP_BINDING', f'missing absolute {name}')

def verify_snapshots(b, deadline):
    source = tree_snapshot(b['sourceRoot'], deadline, {'node_modules': b['dependencyRoot']})
    deps = tree_snapshot(b['dependencyRoot'], deadline)
    for key in ['digest', 'rosterDigest', 'regularFiles', 'regularBytes']:
        if source[key] != b['sourceExpected'][key]: raise Stop('STOP_GUARD', f'source {key} differs')
    for key in ['digest', 'regularFiles', 'regularBytes', 'entries']:
        if deps[key] != b['dependencyExpected'][key]: raise Stop('STOP_GUARD', f'dependency {key} differs')
    guards = []
    for item in b['guardRoots']:
        measured = tree_snapshot(item['path'], deadline, item.get('allowedLinks', {}))
        if measured['digest'] != item['digest']: raise Stop('STOP_GUARD', f'protected guard differs: {item["path"]}')
        guards.append({'path': item['path'], 'digest': measured['digest'], 'rootTuple': measured['rootTuple']})
    h = tree_snapshot(b['protectedH'], deadline,
                      {'node_modules': str(Path(b['productionRepo']) / 'node_modules')})
    if h['digest'] != b['protectedHDigest']: raise Stop('STOP_GUARD', 'protected H differs')
    return {'source': source, 'dependency': deps, 'protectedH': h, 'guards': guards,
            'productionRef': git_ref(b['productionRepo'], b['productionRef']['remoteRef']),
            'evidenceRef': git_ref(b['evidenceRepo'], b['evidenceRef']['remoteRef']),
            'laneLock': lane_lock(b)}

def collection_ok(path, root, expected_name):
    try: rows = json.loads(Path(path).read_text())
    except Exception: return False
    if not isinstance(rows, list) or len(rows) != 1: return False
    row = rows[0]
    return (row.get('name') == expected_name and row.get('projectName') == 'core' and
            row.get('file') == str(Path(root, EXPECTED_FILE)))

def group_exists(pgid):
    try: os.killpg(pgid, 0)
    except ProcessLookupError: return False
    except OSError: return True  # EPERM is never evidence that a group cleared.
    return True

def kill_group(proc):
    if not proc: return {'reaped': True, 'groupClear': True, 'errors': []}
    pgid = proc.pid; errors = []
    for sig, wait_seconds in ((signal.SIGTERM, 0.4), (signal.SIGKILL, 0.8)):
        if not group_exists(pgid): break
        try: os.killpg(pgid, sig)
        except ProcessLookupError: pass
        except OSError as e: errors.append(f'group signal {sig}: {e!r}')
        until = time.monotonic() + wait_seconds
        while group_exists(pgid) and time.monotonic() < until: time.sleep(0.02)
    if proc.poll() is None:
        try: proc.terminate()
        except ProcessLookupError: pass
        except OSError as e: errors.append(f'direct terminate: {e!r}')
        try: proc.wait(timeout=0.4)
        except subprocess.TimeoutExpired:
            try: proc.kill()
            except ProcessLookupError: pass
            except OSError as e: errors.append(f'direct kill: {e!r}')
        except OSError as e: errors.append(f'direct wait: {e!r}')
    try: proc.wait(timeout=0.8)
    except subprocess.TimeoutExpired: errors.append('direct child unreaped')
    except OSError as e: errors.append(f'final wait: {e!r}')
    until = time.monotonic() + 0.8
    while group_exists(pgid) and time.monotonic() < until: time.sleep(0.02)
    return {'reaped': proc.poll() is not None, 'groupClear': not group_exists(pgid),
            'returnCode': proc.poll(), 'errors': errors}

def run(b):
    start = time.monotonic(); deadline = start + RECORDER_SECONDS
    result = {'status': 'STOP_UNCLASSIFIED', 'startedWall': time.time(), 'bindingSha256': sha_bytes(sys.argv[1])}
    child = watcher = None; streams = {}; sel = selectors.DefaultSelector(); cleanup = {}
    receipt_fd = parent_fd = output_fd = None
    receipt_identity = parent_identity = None
    try:
        protected = [b['sourceRoot'], b['dependencyRoot'], b['protectedH'], b['productionRepo'],
                     b['evidenceRepo'], *[x['path'] for x in b['guardRoots']]]
        receipt_fd, receipt_identity = safe_output.validate_parent(b['receiptDir'], protected)
        parent_fd, parent_identity = safe_output.validate_parent(str(Path(b['outputDir']).parent), protected)
        safe_output.recheck(b['receiptDir'], receipt_fd, receipt_identity)
        safe_output.recheck(str(Path(b['outputDir']).parent), parent_fd, parent_identity)
        require_binding(b)
        pre = verify_snapshots(b, deadline); result['pre'] = pre
        if pre['productionRef'] != b['productionRef'] or pre['evidenceRef'] != b['evidenceRef']:
            raise Stop('STOP_REF', 'preflight git refs changed')
        output = Path(b['outputDir'])
        safe_output.recheck(str(output.parent), parent_fd, parent_identity)
        output_fd = safe_output.create_child(parent_fd, output.name)
        safe_output.recheck(str(output), output_fd, (os.fstat(output_fd).st_dev, os.fstat(output_fd).st_ino))
        paths = {k: output / k for k in ['watcher.jsonl', 'child.stdout', 'child.stderr', 'watcher.stderr']}
        for k, p in paths.items():
            fd = os.open(p.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, 'O_NOFOLLOW', 0),
                         0o600, dir_fd=output_fd)
            streams[k] = os.fdopen(fd, 'wb', buffering=0)
        watcher = subprocess.Popen([b['watcherNode'], str(Path(__file__).with_name('watcher.cjs')), b['sourceRoot']],
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True, cwd=b['outputDir'])
        for name, pipe in [('watcher.jsonl', watcher.stdout), ('watcher.stderr', watcher.stderr)]:
            os.set_blocking(pipe.fileno(), False); sel.register(pipe, selectors.EVENT_READ, name)
        counts = {k: 0 for k in streams}; watcher_buf = b''; ready = None; last_disk = 0
        while ready is None:
            if time.monotonic() >= min(deadline, start + 10): raise Stop('STOP_WATCHER', 'watcher readiness timeout')
            for key, _ in sel.select(timeout=0.2):
                chunk = os.read(key.fileobj.fileno(), 65536)
                if not chunk: sel.unregister(key.fileobj); continue
                name = key.data
                write_bounded(streams[name], chunk, counts, name, WATCH_CAP if name == 'watcher.jsonl' else OUT_CAP)
                if name == 'watcher.jsonl':
                    watcher_buf += chunk
                    if b'\n' in watcher_buf:
                        line, watcher_buf = watcher_buf.split(b'\n', 1)
                        ready = json.loads(line)
                        if ready.get('kind') != 'ready' or int(ready.get('dev', -1)) != pre['source']['rootTuple']['dev'] or \
                           int(ready.get('ino', -1)) != pre['source']['rootTuple']['ino']:
                            raise Stop('STOP_WATCHER', 'watcher identity not ready')
            if watcher.poll() is not None: raise Stop('STOP_WATCHER', 'watcher exited before ready')
        result['watcherReady'] = ready
        command = [b['sandboxExecutable'], '-f', b['profile'], b['nodeExecutable'], b['vitestCli'],
                   'list', EXPECTED_FILE, '--project', 'core', '--json', str(output / 'collection.json'), '--no-cache']
        result['command'] = command
        env = {**os.environ, **b['environment']}; env.pop('NODE_OPTIONS', None)
        result['acBeforeChild'] = ac_power()
        if available(output) < FLOOR + START_BUFFER: raise Stop('STOP_DISK', 'disk below start buffer before child')
        child = subprocess.Popen(command, cwd=b['sourceRoot'], env=env, stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE, start_new_session=True)
        child_start = time.monotonic(); result['childPid'] = child.pid
        for name, pipe in [('child.stdout', child.stdout), ('child.stderr', child.stderr)]:
            os.set_blocking(pipe.fileno(), False); sel.register(pipe, selectors.EVENT_READ, name)
        while True:
            now = time.monotonic()
            if now >= deadline: raise Stop('STOP_RECORDER_TIMEOUT', '120-second recorder bound')
            if now - child_start >= CHILD_SECONDS: raise Stop('STOP_CHILD_TIMEOUT', '90-second child bound')
            if now - last_disk >= 1:
                last_disk = now; free = available(output)
                result.setdefault('diskSamples', []).append({'elapsed': round(now-start, 3), 'available': free})
                if free < FLOOR: raise Stop('STOP_DISK_FLOOR', 'below 3 GiB')
                if free <= FLOOR + STOP_BUFFER: raise Stop('STOP_DISK_BUFFER', 'at 128 MiB stop buffer')
            for key, _ in sel.select(timeout=0.2):
                chunk = os.read(key.fileobj.fileno(), 65536)
                if not chunk: sel.unregister(key.fileobj); continue
                name = key.data
                cap = WATCH_CAP if name == 'watcher.jsonl' else OUT_CAP
                write_bounded(streams[name], chunk, counts, name, cap)
            if child.poll() is not None and not any(key.data.startswith('child.') for key in sel.get_map().values()): break
            if watcher.poll() is not None: raise Stop('STOP_WATCHER', 'watcher exited during child')
        result['childReturnCode'] = child.returncode
        if child.returncode != 0: raise Stop('NO_COMPARABLE_CONTROL_STOP', 'diagnostic collection child nonzero')
        # One short settle interval collects delayed watcher events before final guards.
        settle_until = min(deadline, time.monotonic() + 0.5)
        while time.monotonic() < settle_until:
            for key, _ in sel.select(timeout=0.1):
                chunk = os.read(key.fileobj.fileno(), 65536)
                if not chunk: sel.unregister(key.fileobj); continue
                name = key.data
                write_bounded(streams[name], chunk, counts, name, WATCH_CAP if name == 'watcher.jsonl' else OUT_CAP)
        cleanup['child'] = kill_group(child)
        if not cleanup['child']['groupClear'] or cleanup['child']['errors']:
            raise Stop('STOP_SURVIVOR', 'child group cleanup not clean')
        cleanup['watcher'] = kill_group(watcher)
        if not cleanup['watcher']['groupClear'] or cleanup['watcher']['errors']:
            raise Stop('STOP_SURVIVOR', 'watcher group cleanup not clean')
        for value in streams.values(): value.flush(); os.fsync(value.fileno())
        watch_rows = [json.loads(line) for line in paths['watcher.jsonl'].read_text().splitlines()]
        if any(row.get('kind') in ('error', 'closed') for row in watch_rows) or not watch_rows or watch_rows[0].get('kind') != 'ready':
            raise Stop('STOP_WATCHER', 'watcher error or missing ready')
        if not collection_ok(output / 'collection.json', b['sourceRoot'], b['expectedTestName']):
            raise Stop('NO_COMPARABLE_CONTROL_STOP', 'different collected test')
        post = verify_snapshots(b, deadline); result['post'] = post
        result['acAfterChild'] = ac_power()
        if pre['laneLock'] != post['laneLock']: raise Stop('STOP_LOCK', 'lane ownership/content changed')
        if available(output) < FLOOR: raise Stop('STOP_DISK_FLOOR', 'postflight below 3 GiB')
        if Path(b['sourceRoot'], 'node_modules').resolve(strict=True) != Path(b['dependencyRoot']).resolve(strict=True):
            raise Stop('STOP_GUARD', 'node_modules link drift')
        safe_output.recheck(str(output), output_fd, (os.fstat(output_fd).st_dev, os.fstat(output_fd).st_ino))
        for key in ['digest', 'rosterDigest', 'regularFiles', 'regularBytes']:
            if pre['source'][key] != post['source'][key]: raise Stop('NO_COMPARABLE_CONTROL_STOP', f'source {key} drift')
        if pre['dependency']['digest'] != post['dependency']['digest'] or pre['protectedH']['digest'] != post['protectedH']['digest']:
            raise Stop('STOP_GUARD', 'dependency or protected H drift')
        if pre['productionRef'] != post['productionRef'] or pre['evidenceRef'] != post['evidenceRef']:
            raise Stop('STOP_REF', 'git ref drift')
        before, after = pre['source']['rootTuple'], post['source']['rootTuple']
        if (before['dev'], before['ino'], before['mode'], before['flags']) != \
           (after['dev'], after['ino'], after['mode'], after['flags']):
            raise Stop('NO_COMPARABLE_CONTROL_STOP', 'root identity/mode drift')
        if (before['mtimeNs'], before['ctimeNs']) == (after['mtimeNs'], after['ctimeNs']):
            raise Stop('NO_COMPARABLE_CONTROL_STOP', 'root timestamp transition absent')
        result['status'] = 'COMPARABLE_DISPOSABLE_CONTROL_ONLY'
    except Stop as e: result['status'] = e.status; result['detail'] = e.detail
    except Exception as e: result['status'] = 'STOP_RECORDER_ERROR'; result['detail'] = repr(e)
    finally:
        if child and 'child' not in cleanup:
            try: cleanup['child'] = kill_group(child)
            except BaseException as e:
                cleanup['child'] = {'reaped': False, 'groupClear': False,
                                    'errors': [f'unexpected cleanup error: {e!r}']}
        if watcher and 'watcher' not in cleanup:
            try: cleanup['watcher'] = kill_group(watcher)
            except BaseException as e:
                cleanup['watcher'] = {'reaped': False, 'groupClear': False,
                                      'errors': [f'unexpected cleanup error: {e!r}']}
        if 'pre' in result and 'post' not in result:
            try:
                result['post'] = verify_snapshots(b, deadline)
                result['acAfterChild'] = ac_power()
                if result['pre']['productionRef'] != result['post']['productionRef'] or \
                   result['pre']['evidenceRef'] != result['post']['evidenceRef'] or \
                   result['pre']['source']['digest'] != result['post']['source']['digest'] or \
                   result['pre']['dependency']['digest'] != result['post']['dependency']['digest'] or \
                   result['pre']['protectedH']['digest'] != result['post']['protectedH']['digest']:
                    result['status'] = 'STOP_POSTFLIGHT_DRIFT'
            except Exception as e:
                result['postflightFailure'] = repr(e)
                result['status'] = 'STOP_POSTFLIGHT_UNVERIFIED'
        result['cleanup'] = cleanup; result['endedWall'] = time.time(); result['elapsedSeconds'] = time.monotonic()-start
        if any(not x['groupClear'] or not x['reaped'] or x.get('errors') for x in cleanup.values()):
            result['status'] = 'STOP_SURVIVOR'
        for value in streams.values():
            try: value.close()
            except Exception: pass
        sel.close()
        if receipt_fd is not None:
            try:
                safe_output.recheck(b['receiptDir'], receipt_fd, receipt_identity)
                safe_output.write_once(receipt_fd, 'RESULT.json',
                                       (json.dumps(result, indent=2, sort_keys=True) + '\n').encode())
                safe_output.recheck(b['receiptDir'], receipt_fd, receipt_identity)
            except Exception as e: result['receiptFailure'] = repr(e); result['status'] = 'STOP_RECEIPT'
        for fd in [output_fd, parent_fd, receipt_fd]:
            if fd is not None: os.close(fd)
    return result

if __name__ == '__main__':
    if len(sys.argv) != 2: raise SystemExit('usage: recorder.py <filled-binding.json>')
    binding = json.loads(Path(sys.argv[1]).read_text())
    outcome = run(binding)
    print(json.dumps({'status': outcome['status'], 'detail': outcome.get('detail')}))
    raise SystemExit(0 if outcome['status'] == 'COMPARABLE_DISPOSABLE_CONTROL_ONLY' else 1)
