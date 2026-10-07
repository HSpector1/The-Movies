#!/usr/bin/env python3
"""Guarded no-follow removal of only two remotely preserved 1361 sweep trees.

Proposal only. Run only as the exact lane-run.sh child documented in REVIEW-REQUEST.md.
The lane's log is the durable receipt; this script creates no Git commit or branch.
"""

import argparse
import hashlib
import importlib.util
import json
import os
import pathlib
import re
import shlex
import stat
import subprocess
import sys

SCRATCH = pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO = pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
EVIDENCE = SCRATCH / '1370-r10-clean-evidence-worktree'
RETRIEVED = SCRATCH / '1370-1361-sweep-remote-retrieved-r2'
REVIEW = SCRATCH / '1370-1361-sweep-tree-preservation-remote-review-r2'
RECEIPT = REVIEW / 'RECEIPT.json'
LANE_RUNNER = SCRATCH / 'heavy-queue' / 'lane-run.sh'
LANE_LOG = SCRATCH / 'heavy-queue' / '1370-1361-tree-disposition-r2.log'
PROBE_LOG = SCRATCH / 'heavy-queue' / '1370-1361-tree-disposition-r2-probe.log'
LANE_LOCK = SCRATCH / 'HEAVY-LANE-LOCK'
REMOTE_HEAD = 'f90aed0908cf1963288936f444811ad698649fc3'
WORK_HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
REMOTE_BRANCH = 'refs/heads/evidence/1370-r10-clean-captures'
REMOTE_URL = 'https://github.com/HSpector1/The-Movies.git'
MANIFEST_SHA = '2ca6045473034b1c28218ed06de30dc26e47a2ff25ca12e564edeecedc9acf11'
RECEIPT_SHA = 'b1377e297efcd979b5af8f412bba944e8e27950669ececa7c3f47e3ce12d7187'
BUILD_SHA = '7fd06d6bd8555409d7e1bdefee3f2afce1731d8f1b4e23c8a99d21fdd04f1688'
VERIFY_SHA = '078130d2a23a50d2b4153056dfabaf2a8d2bda1afd185d9bbe0faa5be747c801'
REL = ('docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
       '1370-stage/twenty-seventh-verification/1361-sweep-tree-preservation-r2')
SOURCE_TREES = {unit: SCRATCH / '1361-sweep' / unit / 'tree' for unit in ('x2', 'x3')}
EXPECTED = {
    'x2': ('838dce0218d5c940cdcfd57e01232fbcd1082bf0', '0165274ffeedc3783ef215e68b773b7e8a6b5410'),
    'x3': ('ee289de67e453ce269c98d840a48799265c62993', 'd8b993bb0c078613baa07313f7845367d5e90829'),
}


def require(condition: bool, reason: str) -> None:
    if not condition:
        raise RuntimeError(reason)


def run(*args: str, timeout: int = 30) -> bytes:
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout).stdout


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def digest_file(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def event(kind: str, **values: object) -> None:
    print(json.dumps({'event': kind, **values}, sort_keys=True), flush=True)


def lane_guard(lock_inode: int | None = None, *, expected_log: pathlib.Path = LANE_LOG) -> int:
    parent = os.getppid()
    command = run('ps', '-ww', '-p', str(parent), '-o', 'command=').decode().strip()
    tokens = shlex.split(command)
    runner = str(LANE_RUNNER)
    matches = [i for i, value in enumerate(tokens) if value == runner]
    require(len(matches) == 1 and matches[0] in (0, 1), 'direct or unexpected parent; exact lane-run.sh required')
    pos = matches[0]
    require(tokens[pos + 1:pos + 3] == ['0', str(expected_log)], 'lane parent has unexpected wait PID or log')
    require(str(pathlib.Path(__file__).resolve()) in tokens[pos + 3:], 'lane parent does not name this script')
    require(LANE_LOCK.is_file() and not LANE_LOCK.is_symlink(), 'own lane lock missing or symlink')
    st = LANE_LOCK.stat()
    if lock_inode is not None:
        require(st.st_ino == lock_inode, 'lane lock inode changed')
    lock_text = LANE_LOCK.read_text()
    require(lock_text.startswith(f'lane-run {expected_log.name}, started '), 'lane lock belongs to another command')
    process_lines = run('ps', '-ww', '-axo', 'pid=,ppid=,command=').decode().splitlines()
    for line in process_lines:
        match = re.match(r'^\s*(\d+)\s+(\d+)\s+(.*)$', line)
        if not match:
            continue
        pid, ppid, args = int(match[1]), int(match[2]), match[3]
        if pid in (os.getpid(), parent):
            continue
        require(runner not in args, f'another lane-run process exists: {pid}')
        if re.search(r'(^|[ /])(?:vitest|tsc\.js|bin/tsc)(?:[ /]|$)', args) and re.search(r'(^|[ /])node(?:[ /]|$)', args):
            raise RuntimeError(f'competing Node test/type process exists: {pid}')
    return st.st_ino


def no_open_files() -> None:
    # Global lsof avoids recursively traversing the source trees or their links.
    output = run('lsof', '-nP', '-Fn', timeout=45).decode(errors='replace')
    prefixes = [str(path) for path in SOURCE_TREES.values()]
    for line in output.splitlines():
        if not line.startswith('n'):
            continue
        name = line[1:]
        for prefix in prefixes:
            require(not (name == prefix or name.startswith(prefix + '/')),
                    f'open file/cwd inside source tree: {name}')


def archive_guard() -> dict:
    require(run('git', '-C', str(REPO), 'remote', 'get-url', 'origin').decode().strip() == REMOTE_URL,
            'live repository origin changed')
    require(run('git', '-C', str(REPO), 'rev-parse', 'HEAD').decode().strip() == WORK_HEAD,
            'live work HEAD changed')
    require(run('git', '-C', str(REPO), 'status', '--porcelain=v1', '-z') == b'',
            'live worktree dirty')
    remote_line = run('git', '-C', str(REPO), 'ls-remote', 'origin', REMOTE_BRANCH, timeout=40).decode().strip()
    require(remote_line == f'{REMOTE_HEAD}\t{REMOTE_BRANCH}', 'remote evidence branch drift or unavailable')
    require(run('git', '-C', str(EVIDENCE), 'rev-parse', 'HEAD').decode().strip() == REMOTE_HEAD,
            'evidence worktree HEAD drift')
    require(run('git', '-C', str(EVIDENCE), 'status', '--porcelain=v1', '-z') == b'',
            'evidence worktree dirty')
    blob = run('git', '-C', str(EVIDENCE), 'show', f'{REMOTE_HEAD}:{REL}/MANIFEST.json')
    require(sha(blob) == MANIFEST_SHA, 'published manifest SHA changed')
    local_manifest = EVIDENCE / REL / 'MANIFEST.json'
    require(local_manifest.is_file() and digest_file(local_manifest) == MANIFEST_SHA,
            'materialized evidence manifest changed')
    require(run('git', '-C', str(RETRIEVED), 'rev-parse', 'HEAD').decode().strip() == REMOTE_HEAD,
            'independently retrieved commit changed')
    retrieved_manifest = RETRIEVED / REL / 'MANIFEST.json'
    require(retrieved_manifest.is_file() and digest_file(retrieved_manifest) == MANIFEST_SHA,
            'independently retrieved manifest changed')
    require(RECEIPT.is_file() and not RECEIPT.is_symlink() and digest_file(RECEIPT) == RECEIPT_SHA,
            'independent remote-restoration receipt absent or changed')
    receipt = json.loads(RECEIPT.read_bytes())
    require(receipt.get('decision') == 'ACCEPT_REMOTE_RESTORATION_ONLY' and
            receipt.get('remote_commit') == REMOTE_HEAD and
            receipt.get('manifest_sha256') == MANIFEST_SHA and
            receipt.get('actual_child_exit') == 0 and
            receipt.get('restored_clean_checkouts') == ['x2', 'x3'] and
            receipt.get('source_state_match') == ['x2', 'x3'] and
            receipt.get('verifier_sha256') == VERIFY_SHA and
            receipt.get('retrieved_package_files') == 22 and
            receipt.get('scope') == 'remote retrieval only; no source deletion or reserve clearance',
            'remote-restoration receipt does not admit both exact sources')
    report = REVIEW / 'REPORT.md'
    require(report.is_file() and digest_file(report) == receipt['report_sha256'],
            'independent report missing or changed')
    builder = EVIDENCE / REL / 'SUPPORT' / 'BUILD.py'
    require(builder.is_file() and digest_file(builder) == BUILD_SHA,
            'published source-state checker changed')
    return json.loads(blob)


def source_guard(manifest: dict, unit: str, builder_module: object) -> None:
    rows = {row['unit']: row for row in manifest['rows']}
    require(set(rows) == {'x2', 'x3'}, 'manifest unit set changed')
    row = rows[unit]
    require((row['head'], row['tree']) == EXPECTED[unit], f'{unit}: source pin mismatch')
    require(row['source'] == str(SOURCE_TREES[unit]), f'{unit}: source path mismatch')
    state = builder_module.source_state(unit)
    for key, value in state.items():
        require(row.get(key) == value, f'{unit}: source state changed at {key}')
    require(len(state['symlinks']) == len(state['external_dependencies']) == 15,
            f'{unit}: external dependency count changed')
    require(len(state['ignored_inventory']) == 29, f'{unit}: ignored inventory changed')


def free_kib() -> int:
    lines = run('df', '-k', str(SCRATCH)).decode().splitlines()
    require(len(lines) >= 2, 'df result missing')
    return int(lines[-1].split()[3])


def scan_fd(fd: int, prefix: str = '', *, hash_files: bool = False) -> list[dict]:
    """Enumerate without following links; also proves access and supported types."""
    require(os.access('.', os.W_OK | os.X_OK, dir_fd=fd),
            f'no write/traverse access to directory: {prefix or "."}')
    rows = []
    for name in sorted(os.listdir(fd)):
        rel = f'{prefix}/{name}' if prefix else name
        st = os.stat(name, dir_fd=fd, follow_symlinks=False)
        base = {'path': rel, 'mode': stat.S_IMODE(st.st_mode)}
        if stat.S_ISDIR(st.st_mode):
            child = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            try:
                require(os.fstat(child).st_ino == st.st_ino, f'directory changed during scan: {rel}')
                rows.append({**base, 'kind': 'directory'})
                rows.extend(scan_fd(child, rel, hash_files=hash_files))
            finally:
                os.close(child)
        elif stat.S_ISLNK(st.st_mode):
            rows.append({**base, 'kind': 'symlink', 'target': os.readlink(name, dir_fd=fd)})
        elif stat.S_ISREG(st.st_mode):
            row = {**base, 'kind': 'file', 'bytes': st.st_size}
            if hash_files:
                file_fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=fd)
                try:
                    require(os.fstat(file_fd).st_ino == st.st_ino, f'file changed during scan: {rel}')
                    h = hashlib.sha256()
                    with os.fdopen(file_fd, 'rb', closefd=False) as stream:
                        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                            h.update(chunk)
                    row['sha256'] = h.hexdigest()
                finally:
                    os.close(file_fd)
            rows.append(row)
        else:
            raise RuntimeError(f'unsupported entry type before removal: {rel}')
    return rows


def scan_exact_tree(unit: str, *, hash_files: bool = False) -> list[dict]:
    tree = SOURCE_TREES[unit]
    parent = tree.parent
    require(parent.resolve() == parent and parent.is_dir() and not parent.is_symlink(),
            f'{unit}: source parent changed')
    parent_fd = os.open(parent, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        require(os.access('.', os.W_OK | os.X_OK, dir_fd=parent_fd),
                f'{unit}: source parent is not writable/traversable')
        st = os.stat('tree', dir_fd=parent_fd, follow_symlinks=False)
        require(stat.S_ISDIR(st.st_mode), f'{unit}: tree is not a real directory')
        tree_fd = os.open('tree', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=parent_fd)
        try:
            require(os.fstat(tree_fd).st_ino == st.st_ino, f'{unit}: tree changed during scan')
            return scan_fd(tree_fd, hash_files=hash_files)
        finally:
            os.close(tree_fd)
    finally:
        os.close(parent_fd)


def stop_state() -> dict:
    """Best-effort exact survivor inventory for a failed or partial disposition."""
    result = {'free_kib': None, 'trees': {}}
    try:
        result['free_kib'] = free_kib()
    except Exception as exc:
        result['df_error'] = f'{type(exc).__name__}: {exc}'
    archive_rows = {}
    source_checker = None
    try:
        manifest_path = EVIDENCE / REL / 'MANIFEST.json'
        builder_path = EVIDENCE / REL / 'SUPPORT' / 'BUILD.py'
        if digest_file(manifest_path) == MANIFEST_SHA and digest_file(builder_path) == BUILD_SHA:
            archive_rows = {row['unit']: row for row in json.loads(manifest_path.read_bytes())['rows']}
            spec = importlib.util.spec_from_file_location('stop_source_checker', builder_path)
            require(spec is not None and spec.loader is not None, 'source checker import unavailable')
            source_checker = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(source_checker)
    except Exception as exc:
        result['source_compare_error'] = f'{type(exc).__name__}: {exc}'
    for unit, tree in SOURCE_TREES.items():
        if not os.path.lexists(tree):
            result['trees'][unit] = {'state': 'absent'}
            continue
        try:
            entries = scan_exact_tree(unit, hash_files=True)
            state = 'partial'
            if source_checker is not None and unit in archive_rows:
                try:
                    actual = source_checker.source_state(unit)
                    if all(archive_rows[unit].get(key) == value for key, value in actual.items()):
                        state = 'present'
                except Exception:
                    pass
            result['trees'][unit] = {'state': state, 'entries': entries}
        except Exception as exc:
            result['trees'][unit] = {'state': 'partial', 'inventory_error': f'{type(exc).__name__}: {exc}'}
    # A complete survivor inventory can be large. Persist exact bytes outside Git
    # and put its digest/path in the STOP lane event, including a partial tree.
    path = SCRATCH / '1370-1361-tree-disposition-proposal-r2' / f'STOP-SURVIVORS-{os.getpid()}.json'
    encoded = (json.dumps(result, sort_keys=True, separators=(',', ':')) + '\n').encode()
    try:
        with path.open('xb') as stream:
            stream.write(encoded)
        return {'survivor_manifest': str(path), 'survivor_manifest_sha256': sha(encoded),
                'free_kib': result['free_kib'],
                'tree_states': {unit: row['state'] for unit, row in result['trees'].items()}}
    except Exception as exc:
        return {'free_kib': result['free_kib'],
                'tree_states': {unit: row['state'] for unit, row in result['trees'].items()},
                'survivor_manifest_error': f'{type(exc).__name__}: {exc}'}


def prune_fd(fd: int) -> dict:
    counts = {'files': 0, 'symlinks': 0, 'directories': 0}
    for name in os.listdir(fd):
        st = os.stat(name, dir_fd=fd, follow_symlinks=False)
        if stat.S_ISDIR(st.st_mode):
            child = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            try:
                nested = prune_fd(child)
            finally:
                os.close(child)
            os.rmdir(name, dir_fd=fd)
            counts['directories'] += 1
            for key, value in nested.items():
                counts[key] += value
        elif stat.S_ISREG(st.st_mode) or stat.S_ISLNK(st.st_mode):
            os.unlink(name, dir_fd=fd)
            counts['symlinks' if stat.S_ISLNK(st.st_mode) else 'files'] += 1
        else:
            raise RuntimeError(f'unsupported entry type during removal: {name}')
    return counts


def remove_exact_tree(unit: str) -> dict:
    tree = SOURCE_TREES[unit]
    parent = tree.parent
    require(parent.resolve() == parent and parent.is_dir() and not parent.is_symlink(),
            f'{unit}: source parent path changed')
    parent_fd = os.open(parent, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        st = os.stat('tree', dir_fd=parent_fd, follow_symlinks=False)
        require(stat.S_ISDIR(st.st_mode), f'{unit}: tree is no longer a real directory')
        tree_fd = os.open('tree', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=parent_fd)
        try:
            require(os.fstat(tree_fd).st_ino == st.st_ino, f'{unit}: tree inode changed')
            counts = prune_fd(tree_fd)
        finally:
            os.close(tree_fd)
        os.rmdir('tree', dir_fd=parent_fd)
        counts['directories'] += 1
        return counts
    finally:
        os.close(parent_fd)


def main() -> None:
    parser = argparse.ArgumentParser()
    actions = parser.add_mutually_exclusive_group(required=True)
    actions.add_argument('--probe-lane', action='store_true')
    actions.add_argument('--execute', action='store_true')
    args = parser.parse_args()
    require(sys.flags.optimize == 0, 'run without -O/PYTHONOPTIMIZE')
    require(sys.dont_write_bytecode, 'run with -B to keep the evidence worktree clean')
    if args.probe_lane:
        lock_inode = lane_guard(expected_log=PROBE_LOG)
        event('lane_probe_pass', lane_log=str(PROBE_LOG), lock_inode=lock_inode)
        return
    lock_inode = lane_guard()
    manifest = archive_guard()
    builder_path = EVIDENCE / REL / 'SUPPORT' / 'BUILD.py'
    spec = importlib.util.spec_from_file_location('published_1361_builder', builder_path)
    require(spec is not None and spec.loader is not None, 'cannot import pinned builder')
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    source_guard(manifest, 'x2', builder)
    source_guard(manifest, 'x3', builder)
    no_open_files()
    x2_preflight = scan_exact_tree('x2')
    x3_preflight = scan_exact_tree('x3')
    require(x2_preflight and x3_preflight, 'empty source tree preflight')
    event('preflight_pass', free_kib=free_kib(), remote_head=REMOTE_HEAD,
          manifest_sha256=MANIFEST_SHA, receipt_sha256=RECEIPT_SHA,
          entries={'x2': len(x2_preflight), 'x3': len(x3_preflight)})
    for unit in ('x2', 'x3'):
        lane_guard(lock_inode)
        archive_guard()
        source_guard(manifest, unit, builder)
        no_open_files()
        scan_exact_tree(unit)
        before = free_kib()
        counts = remove_exact_tree(unit)
        require(not os.path.lexists(SOURCE_TREES[unit]), f'{unit}: tree path reappeared after removal')
        after = free_kib()
        event('removed_exact_tree', unit=unit, source=str(SOURCE_TREES[unit]),
              free_kib_before=before, free_kib_after=after, free_kib_gained=after-before,
              removed=counts)
    final_free = free_kib()
    event('disposition_complete', free_kib=final_free, preflight_kib=4456448,
          reserve_met=final_free >= 4456448)


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        event('STOP', reason=f'{type(exc).__name__}: {exc}', **stop_state())
        raise
