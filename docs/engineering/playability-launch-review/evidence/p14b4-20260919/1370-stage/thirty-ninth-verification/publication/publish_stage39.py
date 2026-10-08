"""Publish the exact reviewed stage39 C0 remote and H source-mirror proof trail on the evidence branch.

Proposal only until an independent receipt accepts this file and the exact launch.
This script is deliberately one-shot. It never changes the production index.
"""
from __future__ import annotations

import hashlib
import json
import math
import argparse
import os
from pathlib import Path, PurePosixPath
import signal
import selectors
import stat
import subprocess
import sys
import time


REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
PLAN = SCRATCH / '1370-c0-stage39-source-map-draft-r4'
HERE = SCRATCH / '1370-c0-stage39-publisher-proposal-r3'
MAP = PLAN / 'SOURCE-MAP-DRAFT.json'
MAP_REVIEW = SCRATCH / '1370-c0-stage39-source-map-independent-review-r4' / 'RECEIPT.json'
REVIEW = SCRATCH / '1370-c0-stage39-publisher-independent-static-review-r3' / 'RECEIPT.json'
R2_STOP = SCRATCH / '1370-c0-stage39-publisher-independent-observed-stop-review-r2' / 'RECEIPT.json'
MANIFEST = HERE / 'MANIFEST.json'
OUT = HERE / 'PUBLISH-RESULT.json'
INDEX_DIR = HERE / 'private-index'

BASE = 'fe9e8a7d84da164e9a413dc2c3efe49f529c2a78'
PRODUCTION_HEAD = '9651546af98c44f04e8b6b2714d10d67dadb8f9c'
SOURCE_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EVIDENCE_REF = 'refs/heads/evidence/1370-r10-clean-captures'
PRODUCTION_REF = 'refs/heads/wip/headless-program-20260916-ts'
ORIGIN = 'https://github.com/HSpector1/The-Movies.git'
PREFIX = ('docs/engineering/playability-launch-review/evidence/'
          'p14b4-20260919/1370-stage/thirty-ninth-verification/')
MAP_SHA = 'e0fa0cbda5a351a4e7065639d10c70f8bd633f049dc61691f0f836bd25e9c894'
PLAN_SHA = '2102abf5a21b7ab55cdb38ef3f03165f99a86dd1236ef54624aa99df444fd487'
ROSTER_SHA = '358b36c4230b8d8a8bf8daab4f5af7e1aaeb2558eaf55224f838d3e65fd5acca'
R2_STOP_SHA = 'acd7fe3d74923802e6d156c31063a1d7bf5d05b2eea4d63ec76c5e2646402300'
FLOOR = 3 * 1024 * 1024 * 1024
PREFLIGHT = FLOOR
ACTIVE_SECONDS = 870
WHOLE_SECONDS = 900
OUTPUT_CAP = 2 * 1024 * 1024
MAX_ROW_BYTES = 64 * 1024
START = None
DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
FILE_FLAGS = os.O_RDONLY | os.O_NOFOLLOW


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def free_bytes() -> int:
    info = os.statvfs(SCRATCH)
    return info.f_bavail * info.f_frsize


def parse_power_status(output: str) -> bool:
    first = output.splitlines()[0] if output.splitlines() else ''
    return first.strip() == "Now drawing from 'AC Power'"


def require_ac() -> None:
    try:
        output = child_command('pmset', '-g', 'batt')
    except BaseException as error:
        raise RuntimeError('AC power unavailable or uncheckable') from error
    require(parse_power_status(output), 'AC power unavailable or uncheckable')


def clean_env(extra: dict[str, str] | None = None) -> dict[str, str]:
    value = {key: item for key, item in os.environ.items() if not key.startswith('GIT_')}
    if extra:
        value.update(extra)
    return value


def group_alive(pid: int) -> bool:
    try:
        os.killpg(pid, 0)
        return True
    except ProcessLookupError:
        return False


def stop_group(child: subprocess.Popen) -> None:
    try:
        os.killpg(child.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        child.wait(timeout=2)
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(child.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    try:
        child.wait(timeout=2)
    except subprocess.TimeoutExpired as error:
        raise RuntimeError('child would not terminate after SIGKILL') from error
    deadline = time.monotonic() + 2
    while group_alive(child.pid) and time.monotonic() < deadline:
        time.sleep(0.05)
    require(not group_alive(child.pid), 'child process group survived cleanup')


def child_command(*argv: str, env: dict[str, str] | None = None,
                  input_bytes: bytes | None = None) -> str:
    require(free_bytes() >= FLOOR, '3 GiB free-space floor breached')
    remaining = ACTIVE_SECONDS - (time.monotonic() - START)
    require(remaining > 0, '870-second publisher active deadline reached')
    if input_bytes is not None:
        require(len(input_bytes) <= 1024 * 1024, 'child input exceeds 1 MiB cap')
    child = subprocess.Popen(argv, cwd=REPO, env=clean_env(env),
                             stdin=subprocess.PIPE if input_bytes is not None else subprocess.DEVNULL,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             start_new_session=True)
    output = bytearray()
    errors = bytearray()
    sent = 0
    selector = selectors.DefaultSelector()
    try:
        os.set_blocking(child.stdout.fileno(), False)
        os.set_blocking(child.stderr.fileno(), False)
        if child.stdin is not None:
            os.set_blocking(child.stdin.fileno(), False)
        selector.register(child.stdout, selectors.EVENT_READ, output)
        selector.register(child.stderr, selectors.EVENT_READ, errors)
        if input_bytes is not None:
            selector.register(child.stdin, selectors.EVENT_WRITE, None)
        while selector.get_map():
            remaining = ACTIVE_SECONDS - (time.monotonic() - START)
            require(remaining > 0, '870-second publisher active deadline reached')
            events = selector.select(timeout=min(remaining, 0.25))
            for key, _ in events:
                if key.events & selectors.EVENT_WRITE:
                    if sent == len(input_bytes):
                        selector.unregister(key.fileobj)
                        key.fileobj.close()
                        continue
                    try:
                        written = os.write(key.fileobj.fileno(), input_bytes[sent:sent + 65536])
                    except BlockingIOError:
                        continue
                    except BrokenPipeError as error:
                        raise RuntimeError('child closed stdin before complete input') from error
                    sent += written
                else:
                    try:
                        part = os.read(key.fileobj.fileno(), 65536)
                    except BlockingIOError:
                        continue
                    if not part:
                        selector.unregister(key.fileobj)
                        key.fileobj.close()
                    else:
                        key.data.extend(part)
                        require(len(key.data) <= OUTPUT_CAP, 'child stdout/stderr cap exceeded')
            require(free_bytes() >= FLOOR, '3 GiB free-space floor breached during child')
        remaining = ACTIVE_SECONDS - (time.monotonic() - START)
        require(remaining > 0, '870-second publisher active deadline reached')
        child.wait(timeout=remaining)
        require(not group_alive(child.pid), f'child group survived normal exit: {argv!r}')
        require(child.returncode == 0,
                f'{argv!r} exit {child.returncode}: {bytes(errors[-2000:]).decode("utf-8", "replace")}')
        require(sent == len(input_bytes or b''), 'child input incomplete')
        require(free_bytes() >= FLOOR, '3 GiB free-space floor breached after command')
        return output.decode('utf-8', 'replace').strip()
    except BaseException as error:
        stop_group(child)
        raise RuntimeError(f'child command STOP {argv!r}: {error}') from error
    finally:
        selector.close()
        for stream in (child.stdin, child.stdout, child.stderr):
            if stream is not None and not stream.closed:
                stream.close()


def run(*argv: str, env: dict[str, str] | None = None) -> str:
    return child_command(*argv, env=env)


def open_dir(path: Path) -> int:
    require(path.is_absolute(), f'nonabsolute directory: {path}')
    fd = os.open('/', DIR_FLAGS)
    try:
        for component in path.parts[1:]:
            next_fd = os.open(component, DIR_FLAGS, dir_fd=fd)
            os.close(fd)
            fd = next_fd
        return fd
    except BaseException:
        os.close(fd)
        raise


def attrs(value: os.stat_result) -> tuple[int, ...]:
    return (value.st_dev, value.st_ino, value.st_mode, value.st_nlink,
            value.st_size, value.st_mtime_ns, value.st_ctime_ns)


def read_regular(path: Path, limit: int | None = None) -> bytes:
    parent = open_dir(path.parent)
    try:
        named = os.stat(path.name, dir_fd=parent, follow_symlinks=False)
        require(stat.S_ISREG(named.st_mode) and named.st_nlink == 1,
                f'not a single-link regular file: {path}')
        fd = os.open(path.name, FILE_FLAGS, dir_fd=parent)
        try:
            before = os.fstat(fd)
            require(attrs(before) == attrs(named), f'file changed on open: {path}')
            if limit is not None:
                require(before.st_size <= limit, f'control file too large: {path}')
            chunks = []
            total = 0
            while True:
                part = os.read(fd, 1024 * 1024)
                if not part:
                    break
                total += len(part)
                if limit is not None:
                    require(total <= limit, f'control file grew over cap: {path}')
                chunks.append(part)
                require(free_bytes() >= FLOOR, '3 GiB free-space floor breached')
            require(attrs(before) == attrs(os.fstat(fd)) ==
                    attrs(os.stat(path.name, dir_fd=parent, follow_symlinks=False)),
                    f'file changed while reading: {path}')
            return b''.join(chunks)
        finally:
            os.close(fd)
    finally:
        os.close(parent)


def read_source(path: Path, expected: dict, emit_blob: bool) -> tuple[str, str | None]:
    parent = open_dir(path.parent)
    try:
        named = os.stat(path.name, dir_fd=parent, follow_symlinks=False)
        require(stat.S_ISREG(named.st_mode) and named.st_nlink == 1,
                f'not a single-link regular source: {path}')
        require(named.st_size == expected['bytes'], f'source length drift: {path}')
        fd = os.open(path.name, FILE_FLAGS, dir_fd=parent)
        try:
            before = os.fstat(fd)
            require(attrs(before) == attrs(named), f'source changed on open: {path}')
            sha = hashlib.sha256()
            blob_sha = hashlib.sha1()
            blob_sha.update(f"blob {expected['bytes']}\0".encode('ascii'))
            captured = bytearray() if emit_blob else None
            total = 0
            while True:
                part = os.read(fd, 1024 * 1024)
                if not part:
                    break
                total += len(part)
                require(total <= expected['bytes'] <= MAX_ROW_BYTES,
                        f'source grew over bounded row size: {path}')
                sha.update(part)
                blob_sha.update(part)
                if captured is not None:
                    captured.extend(part)
                require_ac()
                require(free_bytes() >= FLOOR, '3 GiB free-space floor breached')
            result = None
            if captured is not None:
                result = child_command('git', 'hash-object', '-w', '--stdin',
                                       input_bytes=bytes(captured))
            require(total == expected['bytes'], f'source short read: {path}')
            require(sha.hexdigest() == expected['sha256'], f'SHA-256 drift: {path}')
            require(blob_sha.hexdigest() == expected['gitBlobOid'], f'Git OID drift: {path}')
            if result is not None:
                require(result == expected['gitBlobOid'], f'written blob mismatch: {path}')
            require(attrs(before) == attrs(os.fstat(fd)) ==
                    attrs(os.stat(path.name, dir_fd=parent, follow_symlinks=False)),
                    f'source changed while reading: {path}')
            return sha.hexdigest(), result
        finally:
            os.close(fd)
    finally:
        os.close(parent)


def validate_map(value: dict) -> list[dict]:
    require(value.get('schema') == '1370-c0-stage39-source-map-draft-r4', 'wrong map schema')
    for key, expected in [('baseEvidenceCommit', BASE), ('evidenceRef', EVIDENCE_REF),
                          ('productionHead', PRODUCTION_HEAD), ('productionSrcTree', SOURCE_TREE),
                          ('productionRef', PRODUCTION_REF), ('targetPrefix', PREFIX)]:
        require(value.get(key) == expected, f'wrong {key}')
    rows = value.get('rows')
    require(isinstance(rows, list) and len(rows) == 318 and value.get('sourceCount') == 318 and
            value.get('sourceBytes') == 1070532 and sum(row.get('bytes', -1) for row in rows) == 1070532,
            'wrong source count or byte sum')
    require(value.get('classification') == 'DRAFT_UNREVIEWED_UNPUBLISHED_ACTUAL_FILES_ONLY',
            'wrong map classification')
    authority = value.get('authority', {})
    require(authority.get('stage38RemoteObservedSha256') ==
            'c90a1007eec7847a033eaca2a51bb9a53c9db8f35b357a0f9f876c4fe815375b' and
            authority.get('r6ObservedFullSourceReadbackSha256') ==
            '35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a' and
            authority.get('r9TypeObservedStopSha256') ==
            '4cffcd747b9b538631314997134561de143f4a7f0d45aaf0c577a893b4558db4' and
            authority.get('postR9CurrentBaselineObservedSha256') ==
            'b0b58d06f21e81bfb6357e2295708e5fc11b5a2248f1c1cd5babf331689e8de3' and
            authority.get('r8TypeStaticRefineSha256') ==
            'ec8ca236351799b4d337b37a33fa8e8d97bd2dc46e4dfa3ce3180f5d9fbf15b9',
            'source/STOP authority drift')
    seen = set()
    for row in rows:
        require(set(row) == {'source', 'target', 'bytes', 'sha256', 'gitBlobOid', 'classification'},
                'wrong map row keys')
        path = Path(row['source'])
        require(path.is_absolute() and path.is_relative_to(SCRATCH) and '..' not in path.parts and
                path != SCRATCH, f'unsafe source path: {path}')
        dest = row['target']
        require(isinstance(dest, str) and dest.startswith(PREFIX) and dest not in seen and
                '\\' not in dest and all(piece not in ('', '.', '..') for piece in PurePosixPath(dest).parts) and
                PurePosixPath(dest).as_posix() == dest, f'unsafe or duplicate destination: {dest}')
        seen.add(dest)
        require(type(row['bytes']) is int and 0 <= row['bytes'] <= MAX_ROW_BYTES,
                f'blob over cap: {dest}')
        require(isinstance(row['sha256'], str) and len(row['sha256']) == 64 and
                all(c in '0123456789abcdef' for c in row['sha256']), f'invalid SHA-256: {dest}')
        require(isinstance(row['gitBlobOid'], str) and len(row['gitBlobOid']) == 40 and
                all(c in '0123456789abcdef' for c in row['gitBlobOid']), f'invalid Git OID: {dest}')
    by_name = {row['target'][len(PREFIX):]: row for row in rows}
    require(by_name['1370-c0-stage38-remote-audit-independent-observed-review-r1/RECEIPT.json']['sha256'] ==
            authority['stage38RemoteObservedSha256'] and
            by_name['1370-c0-h-bridge-full-readback-independent-observed-review-r6/RECEIPT.json']['sha256'] ==
            authority['r6ObservedFullSourceReadbackSha256'] and
            by_name['1370-c0-h-typecheck-collection-independent-observed-stop-review-r9/RECEIPT.json']['sha256'] ==
            authority['r9TypeObservedStopSha256'] and
            by_name['1370-c0-h-mirror-post-r9-baseline-independent-observed-review-r1/RECEIPT.json']['sha256'] ==
            authority['postR9CurrentBaselineObservedSha256'] and
            by_name['1370-c0-h-typecheck-collection-runner-independent-static-review-r8/RECEIPT.json']['sha256'] ==
            authority['r8TypeStaticRefineSha256'] and
            by_name['1370-c0-h-typecheck-collection-independent-observed-stop-review-r9/RECEIPT.json']['classification'] == 'R9_OBSERVED_STOP' and
            by_name['1370-c0-h-typecheck-collection-runner-independent-static-review-r8/RECEIPT.json']['classification'] == 'REFINE_STATIC_UNRUN' and
            by_name['1370-c0-h-mirror-post-r9-baseline-independent-observed-review-r1/RECEIPT.json']['classification'] == 'ACCEPT_OBSERVED_CURRENT_SOURCE_BYTES_ONLY',
            'key source/failure authority drift')
    return sorted(rows, key=lambda row: row['target'])


def blob_for_bytes(value: bytes) -> str:
    require(len(value) <= 1024 * 1024, 'publication control exceeds input cap')
    oid = child_command('git', 'hash-object', '-w', '--stdin', input_bytes=value)
    require(len(oid) == 40 and run('git', 'cat-file', '-s', oid) == str(len(value)),
            'small blob write mismatch')
    return oid


def exclusive_json(path: Path, value: dict) -> None:
    parent = open_dir(path.parent)
    try:
        fd = os.open(path.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                     0o600, dir_fd=parent)
        try:
            with os.fdopen(fd, 'w', closefd=False) as handle:
                json.dump(value, handle, indent=2, sort_keys=True)
                handle.write('\n')
                handle.flush()
                os.fsync(fd)
        finally:
            os.close(fd)
        os.fsync(parent)
    finally:
        os.close(parent)


def main() -> None:
    global START
    launch_start = globals().get('_PUBLISH_LAUNCH_START', time.monotonic())
    require(type(launch_start) in (int, float) and math.isfinite(launch_start),
            'invalid publisher launch start')
    elapsed = time.monotonic() - launch_start
    require(0 <= elapsed < ACTIVE_SECONDS, 'publisher launch start outside 870-second active envelope')
    START = launch_start
    signal.signal(signal.SIGALRM,
                  lambda *_: (_ for _ in ()).throw(TimeoutError('870-second publisher active deadline')))
    signal.setitimer(signal.ITIMER_REAL, ACTIVE_SECONDS - elapsed)
    parser = argparse.ArgumentParser()
    parser.add_argument('--map-review-sha', required=True)
    parser.add_argument('--publisher-review-sha', required=True)
    args = parser.parse_args()
    for pin in (args.map_review_sha, args.publisher_review_sha):
        require(len(pin) == 64 and all(c in '0123456789abcdef' for c in pin),
                'invalid review SHA-256')
    require_ac()
    require(free_bytes() >= PREFLIGHT, 'less than 3 GiB before publication')
    require(not os.path.lexists(INDEX_DIR) and not os.path.lexists(OUT),
            'one-shot output/index path exists')
    map_bytes = read_regular(MAP, 1024 * 1024)
    plan_bytes = read_regular(PLAN / 'PLAN.md', 1024 * 1024)
    roster_bytes = read_regular(HERE / 'SOURCE-ROSTER.tsv', 1024 * 1024)
    script_bytes = read_regular(HERE / 'publish_stage39.py', 1024 * 1024)
    review_bytes = read_regular(REVIEW, 1024 * 1024)
    map_review_bytes = read_regular(MAP_REVIEW, 1024 * 1024)
    manifest_bytes = read_regular(MANIFEST, 1024 * 1024)
    stop_bytes = read_regular(R2_STOP, 1024 * 1024)
    stop = json.loads(stop_bytes)
    require(hashlib.sha256(stop_bytes).hexdigest() == R2_STOP_SHA and
            stop.get('decision') == 'ACCEPT_OBSERVED_STOP_STAGE39_PUBLISHER_R2' and
            stop.get('gitReadTreeSignal') == 'SIGXFSZ' and
            stop.get('localEvidenceTip') == BASE and
            stop.get('remoteEvidenceTip') == BASE and
            stop.get('publisherResultAbsent') is True,
            'r2 observed STOP authority drift')
    require(hashlib.sha256(map_bytes).hexdigest() == MAP_SHA, 'map bytes drift')
    require(hashlib.sha256(plan_bytes).hexdigest() == PLAN_SHA, 'plan bytes drift')
    require(hashlib.sha256(roster_bytes).hexdigest() == ROSTER_SHA, 'roster bytes drift')
    rows = validate_map(json.loads(map_bytes))
    expected_roster = ('source\ttarget\tbytes\tsha256\tgitBlobOid\n' + ''.join(
        f"{row['source']}\t{row['target']}\t{row['bytes']}\t{row['sha256']}\t{row['gitBlobOid']}\n"
        for row in rows)).encode()
    require(roster_bytes == expected_roster, 'roster/map order or bytes drift')
    map_review = json.loads(map_review_bytes)
    require(hashlib.sha256(map_review_bytes).hexdigest() == args.map_review_sha and
            map_review.get('decision') == 'ACCEPT_STATIC_MAP_ONLY' and
            map_review.get('mapSha256') == MAP_SHA and
            map_review.get('planSha256') == PLAN_SHA and
            map_review.get('sourceBytes') == 1070532 and
            map_review.get('sourceCount') == 318 and
            map_review.get('baseEvidenceCommit') == BASE and
            map_review.get('productionHead') == PRODUCTION_HEAD and
            map_review.get('productionSrcTree') == SOURCE_TREE,
            'stage39 plan/map review mismatch')
    manifest = json.loads(manifest_bytes)
    require(manifest.get('schema') == '1370-c0-stage39-publisher-proposal-r3' and
            manifest.get('classification') == 'FROZEN_UNRUN_STATIC_REVIEW_PENDING',
            'publisher manifest mismatch')
    expected_manifest_files = {
        str(HERE / 'publish_stage39.py'): script_bytes,
        str(PLAN / 'SOURCE-MAP-DRAFT.json'): map_bytes,
        str(PLAN / 'PLAN.md'): plan_bytes,
        str(HERE / 'SOURCE-ROSTER.tsv'): roster_bytes,
        str(HERE / 'test_static.py'): read_regular(HERE / 'test_static.py', 1024 * 1024),
    }
    listed = manifest.get('files')
    require(isinstance(listed, list) and set(item.get('path') for item in listed) ==
            set(expected_manifest_files), 'publisher manifest roster mismatch')
    for item in listed:
        data = expected_manifest_files[item['path']]
        require(item.get('bytes') == len(data) and
                item.get('sha256') == hashlib.sha256(data).hexdigest(),
                f"publisher manifest byte mismatch: {item['path']}")
    review = json.loads(review_bytes)
    require(hashlib.sha256(review_bytes).hexdigest() == args.publisher_review_sha and
            review.get('decision') == 'ACCEPT_STATIC_STAGE39_PUBLISHER_R3' and
            review.get('mapSha256') == MAP_SHA and
            review.get('scriptSha256') == hashlib.sha256(script_bytes).hexdigest() and
            review.get('baseEvidenceCommit') == BASE and
            review.get('planSha256') == PLAN_SHA and
            review.get('rosterSha256') == ROSTER_SHA and
            review.get('manifestSha256') == hashlib.sha256(manifest_bytes).hexdigest() and
            review.get('mapReviewReceiptSha256') == hashlib.sha256(map_review_bytes).hexdigest(),
            'independent publisher receipt mismatch')
    require(run('git', 'rev-parse', 'HEAD') == PRODUCTION_HEAD and
            run('git', 'rev-parse', 'HEAD:src') == SOURCE_TREE and
            run('git', 'status', '--porcelain') == '', 'production checkout drift/dirty')
    require(run('git', 'remote', 'get-url', 'origin') == ORIGIN, 'wrong origin')
    require(run('git', 'ls-remote', 'origin', PRODUCTION_REF).split()[0] == PRODUCTION_HEAD,
            'remote production ref drift')
    require(run('git', 'rev-parse', EVIDENCE_REF) == BASE and
            run('git', 'ls-remote', 'origin', EVIDENCE_REF).split()[0] == BASE,
            'evidence base drift')
    require(run('git', 'ls-tree', '-r', '--name-only', BASE, PREFIX) == '',
            'stage39 prefix already exists')
    for row in rows:
        read_source(Path(row['source']), row, False)
    require_ac()
    require(free_bytes() >= PREFLIGHT, 'less than 3 GiB after source preflight')
    os.mkdir(INDEX_DIR, 0o700)
    require(stat.S_ISDIR(INDEX_DIR.lstat().st_mode) and not INDEX_DIR.is_symlink() and
            not os.path.lexists(INDEX_DIR / 'index'), 'private index collision')
    env = {'GIT_INDEX_FILE': str(INDEX_DIR / 'index')}
    run('git', 'read-tree', BASE, env=env)
    names = set()
    for row in rows:
        require_ac()
        read_source(Path(row['source']), row, True)
        require(run('git', 'cat-file', '-s', row['gitBlobOid']) == str(row['bytes']),
                'Git blob size mismatch')
        run('git', 'update-index', '--add', '--cacheinfo',
            f"100644,{row['gitBlobOid']},{row['target']}", env=env)
        names.add(row['target'])
    require_ac()
    extras = {
        'publication/SOURCE-MAP-DRAFT.json': map_bytes,
        'publication/PLAN.md': plan_bytes,
        'publication/SOURCE-ROSTER.tsv': roster_bytes,
        'publication/publish_stage39.py': script_bytes,
        'publication/test_static.py': expected_manifest_files[str(HERE / 'test_static.py')],
        'publication/MANIFEST.json': manifest_bytes,
        'publication/map-review/RECEIPT.json': map_review_bytes,
        'publication/publisher-review/RECEIPT.json': review_bytes,
    }
    for suffix, data in extras.items():
        destination = PREFIX + suffix
        require(destination not in names, 'publication destination collision')
        oid = blob_for_bytes(data)
        run('git', 'update-index', '--add', '--cacheinfo',
            f'100644,{oid},{destination}', env=env)
        names.add(destination)
    tree = run('git', 'write-tree', env=env)
    actual = set(run('git', 'ls-tree', '-r', '--name-only', tree, PREFIX).splitlines())
    require(actual == names and len(actual) == 326, 'stage39 subtree mismatch')
    commit = run('git', 'commit-tree', tree, '-p', BASE, '-m',
                 'evidence(1370): preserve H baseline and type-stop proof')
    require(run('git', 'rev-parse', f'{commit}^') == BASE and
            run('git', 'rev-parse', f'{commit}^{{tree}}') == tree,
            'commit parent/tree mismatch')
    require(run('git', 'ls-remote', 'origin', EVIDENCE_REF).split()[0] == BASE,
            'remote changed before compare-and-swap')
    require_ac()
    run('git', 'update-ref', EVIDENCE_REF, commit, BASE)
    try:
        run('git', 'push', 'origin', f'{EVIDENCE_REF}:{EVIDENCE_REF}')
    except BaseException as error:
        raise RuntimeError(f'PUSH_FAILED; local evidence ref retained at {commit}') from error
    require(run('git', 'ls-remote', 'origin', EVIDENCE_REF).split()[0] == commit,
            'remote evidence tip mismatch after push')
    require(run('git', 'ls-remote', 'origin', PRODUCTION_REF).split()[0] == PRODUCTION_HEAD,
            'remote production ref changed during publication')
    require_ac()
    require(run('git', 'rev-parse', 'HEAD') == PRODUCTION_HEAD and
            run('git', 'rev-parse', 'HEAD:src') == SOURCE_TREE and
            run('git', 'status', '--porcelain') == '',
            'production checkout changed during publication')
    result = {'schema': '1370-c0-stage39-publish-result-r3',
              'status': 'PUBLISHED_REMOTE_TIP_VERIFIED_REMOTE_BYTES_PENDING',
              'base': BASE, 'commit': commit, 'tree': tree,
              'remoteRef': EVIDENCE_REF, 'fileCount': len(actual),
              'mapSha256': MAP_SHA,
              'publisherSha256': hashlib.sha256(script_bytes).hexdigest(),
              'manifestSha256': hashlib.sha256(manifest_bytes).hexdigest(),
              'mapReviewReceiptSha256': hashlib.sha256(map_review_bytes).hexdigest(),
              'r2ObservedStopReceiptSha256': R2_STOP_SHA,
              'reviewSha256': hashlib.sha256(review_bytes).hexdigest(),
              'productionHead': PRODUCTION_HEAD, 'sourceTree': SOURCE_TREE,
              'freeBytesAfter': free_bytes()}
    exclusive_json(OUT, result)
    signal.setitimer(signal.ITIMER_REAL, 0)
    print(json.dumps(result, sort_keys=True))


if __name__ == '__main__':
    try:
        main()
    except BaseException as error:
        print(f'STAGE39_PUBLISH_FAILED: {error}', file=sys.stderr)
        raise
