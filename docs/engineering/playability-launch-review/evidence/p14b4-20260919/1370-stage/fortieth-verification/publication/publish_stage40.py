"""Publish a future independently reviewed Stage40 H source/STOP evidence map on the evidence branch.

Draft only: independent map, publisher, and exact-launch reviews are pending.
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
PLAN = SCRATCH / '1370-c0-stage40-source-candidate-map-r2'
HERE = SCRATCH / '1370-c0-stage40-publisher-proposal-r1'
MAP = PLAN / 'SOURCE-CANDIDATE-MAP.json'
MAP_REVIEW = SCRATCH / '1370-c0-stage40-source-candidate-map-independent-review-r2' / 'RECEIPT.json'
REVIEW = SCRATCH / '1370-c0-stage40-publisher-independent-static-review-r1' / 'RECEIPT.json'
MANIFEST = HERE / 'MANIFEST.json'
OUT = HERE / 'PUBLISH-RESULT.json'
INDEX_DIR = HERE / 'private-index'

BASE = '6516532ac67ffcafc66fd424abb89bc1bc0acc2e'
PRODUCTION_HEAD = 'afea5fb6abba09bec6cada7e4c5a1ccfaf05caff'
SOURCE_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EVIDENCE_REF = 'refs/heads/evidence/1370-r10-clean-captures'
PRODUCTION_REF = 'refs/heads/wip/headless-program-20260916-ts'
ORIGIN = 'https://github.com/HSpector1/The-Movies.git'
PREFIX = ('docs/engineering/playability-launch-review/evidence/'
          'p14b4-20260919/1370-stage/fortieth-verification/')
MAP_SHA = '5dd24a9d2599bc8fa3e250809f890532b484725f7130c0605217a7e166d51ec4'
PLAN_SHA = '06609aa0bebe91055fbdeec4ebc56fcf3c2fc8717015514b8ef6ce4787d20447'
ROSTER_SHA = '647a871f828b595147fd7ae1a9713f6e8d231c7044d94be9d41f95bbdb5e8f5c'
R11_STOP_SHA = '9b8e6587d415db0d0bbd12ecdff3d67eeb87b39928d70b84baed8ad61600cbb0'
R13_STOP_SHA = '15e901e356b72d80fdebef469bf9e20b171c13a32f34e94bf26858bf2d883ad1'
MAP_REVIEW_SHA = 'f2c8c1ee1d2fe55513265d0b371f998439494bc4ef84616b9d73d20051a0c734'
R1_MAP = SCRATCH / '1370-c0-stage40-source-candidate-map-r1' / 'SOURCE-CANDIDATE-MAP.json'
R1_MAP_SHA = '381740740afac69b5d47d1772294ed2ac9d1ec7ff310cd644db1a13f0f0140f5'
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
    if group_alive(child.pid):
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
    require(value.get('schema') == '1370-c0-stage40-source-candidate-map-r2', 'wrong map schema')
    for key, expected in [('stage39PublishedEvidenceTip', BASE),
                          ('productionHeadAtSourceReview', PRODUCTION_HEAD),
                          ('productionSrcTree', SOURCE_TREE), ('targetPrefix', PREFIX),
                          ('inheritedR1MapSha256', '381740740afac69b5d47d1772294ed2ac9d1ec7ff310cd644db1a13f0f0140f5'),
                          ('observedStopReceiptSha256', R11_STOP_SHA)]:
        require(value.get(key) == expected, f'wrong {key}')
    rows = value.get('rows')
    require(isinstance(rows, list) and len(rows) == 130 and value.get('sourceCount') == 130 and
            value.get('sourceBytes') == 663707 and sum(row.get('bytes', -1) for row in rows) == 663707 and
            value.get('inheritedR1Count') == 60 and value.get('newCount') == 70,
            'wrong source count or byte sum')
    require(value.get('classification') == 'DRAFT_UNREVIEWED_UNPUBLISHED_ACTUAL_FILES_ONLY',
            'wrong map classification')
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
    labels = {
        '1370-c0-h-typecheck-r10-source-independent-static-review-r1/RECEIPT.json': 'R10_SOURCE_REFINE',
        '1370-c0-h-typecheck-recorder-r2-independent-static-review-r1/RECEIPT.json': 'RECORDER_R2_STATIC_REFINE',
        '1370-c0-h-typecheck-r11-independent-observed-stop-review-r1/RECEIPT.json': 'R11_OBSERVED_STOP',
        '1370-c0-h-typecheck-r12-independent-static-review-r1/RECEIPT.json': 'R12_SOURCE_REFINE',
        '1370-c0-h-typecheck-collection-filled-exact-independent-review-r13-r4/RECEIPT.json': 'R13_R4_EXACT_REFINE_UNRUN',
        '1370-c0-h-typecheck-collection-filled-exact-independent-review-r13-r5/RECEIPT.json': 'R13_R5_EXACT_ACCEPT_ONLY',
        '1370-c0-h-typecheck-r13-independent-observed-stop-review-r1/RECEIPT.json': 'R13_OBSERVED_STOP',
    }
    for name, classification in labels.items():
        require(by_name[name]['classification'] == classification, f'claim relabel: {name}')
    require(by_name['1370-c0-h-typecheck-r11-independent-observed-stop-review-r1/RECEIPT.json']['sha256'] == R11_STOP_SHA and
            by_name['1370-c0-h-typecheck-r13-independent-observed-stop-review-r1/RECEIPT.json']['sha256'] == R13_STOP_SHA,
            'observed STOP receipt drift')
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
    r1_map_bytes = read_regular(R1_MAP, 1024 * 1024)
    require(hashlib.sha256(r1_map_bytes).hexdigest() == R1_MAP_SHA, 'inherited r1 map drift')
    plan_bytes = read_regular(PLAN / 'CHECKLIST.md', 1024 * 1024)
    roster_bytes = read_regular(HERE / 'SOURCE-ROSTER.tsv', 1024 * 1024)
    script_bytes = read_regular(HERE / 'publish_stage40.py', 1024 * 1024)
    review_bytes = read_regular(REVIEW, 1024 * 1024)
    map_review_bytes = read_regular(MAP_REVIEW, 1024 * 1024)
    manifest_bytes = read_regular(MANIFEST, 1024 * 1024)
    require(hashlib.sha256(map_bytes).hexdigest() == MAP_SHA, 'map bytes drift')
    require(hashlib.sha256(plan_bytes).hexdigest() == PLAN_SHA, 'plan bytes drift')
    require(hashlib.sha256(roster_bytes).hexdigest() == ROSTER_SHA, 'roster bytes drift')
    rows = validate_map(json.loads(map_bytes))
    r1_rows = json.loads(r1_map_bytes)['rows']
    require(len(r1_rows) == 60 and {row['target']: row for row in rows if row['target'] in {old['target'] for old in r1_rows}} ==
            {row['target']: row for row in r1_rows}, 'inherited r1 rows drift')
    expected_roster = ('source\ttarget\tbytes\tsha256\tgitBlobOid\n' + ''.join(
        f"{row['source']}\t{row['target']}\t{row['bytes']}\t{row['sha256']}\t{row['gitBlobOid']}\n"
        for row in rows)).encode()
    require(roster_bytes == expected_roster, 'roster/map order or bytes drift')
    map_review = json.loads(map_review_bytes)
    require(hashlib.sha256(map_review_bytes).hexdigest() == MAP_REVIEW_SHA == args.map_review_sha and
            map_review.get('decision') == 'ACCEPT_SOURCE_MAP_ONLY' and
            map_review.get('classification') == 'UNPUBLISHED_UNRUN' and
            map_review.get('mapSha256') == MAP_SHA and
            map_review.get('checklistSha256') == PLAN_SHA and
            map_review.get('sourceBytes') == 663707 and
            map_review.get('sourceCount') == 130 and
            map_review.get('evidenceTip') == BASE and
            map_review.get('productionHead') == PRODUCTION_HEAD and
            map_review.get('productionSourceTree') == SOURCE_TREE and
            map_review.get('inheritedR1MapSha256') == R1_MAP_SHA and
            map_review.get('r13ObservedStopReceiptSha256') == R13_STOP_SHA,
            'stage40 plan/map review mismatch')
    manifest = json.loads(manifest_bytes)
    require(manifest.get('schema') == '1370-c0-stage40-publisher-proposal-r1' and
            manifest.get('classification') == 'DRAFT_UNREVIEWED_UNRUN',
            'publisher manifest mismatch')
    expected_manifest_files = {
        str(HERE / 'publish_stage40.py'): script_bytes,
        str(PLAN / 'SOURCE-CANDIDATE-MAP.json'): map_bytes,
        str(PLAN / 'CHECKLIST.md'): plan_bytes,
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
            review.get('decision') == 'ACCEPT_STATIC_STAGE40_PUBLISHER_R1' and
            review.get('mapSha256') == MAP_SHA and
            review.get('scriptSha256') == hashlib.sha256(script_bytes).hexdigest() and
            review.get('baseEvidenceCommit') == BASE and
            review.get('planSha256') == PLAN_SHA and
            review.get('rosterSha256') == ROSTER_SHA and
            review.get('manifestSha256') == hashlib.sha256(manifest_bytes).hexdigest() and
            review.get('mapReviewReceiptSha256') == hashlib.sha256(map_review_bytes).hexdigest(),
            'independent publisher receipt mismatch')
    require(run('git', 'symbolic-ref', 'HEAD') == PRODUCTION_REF and
            run('git', 'rev-parse', 'HEAD') == PRODUCTION_HEAD and
            run('git', 'rev-parse', 'HEAD:src') == SOURCE_TREE and
            run('git', 'status', '--porcelain') == '', 'production checkout drift/dirty')
    require(run('git', 'remote', 'get-url', 'origin') == ORIGIN, 'wrong origin')
    require(run('git', 'ls-remote', 'origin', PRODUCTION_REF).split()[0] == PRODUCTION_HEAD,
            'remote production ref drift')
    require(run('git', 'rev-parse', EVIDENCE_REF) == BASE and
            run('git', 'ls-remote', 'origin', EVIDENCE_REF).split()[0] == BASE,
            'evidence base drift')
    require(run('git', 'ls-tree', '-r', '--name-only', BASE, PREFIX) == '',
            'stage40 prefix already exists')
    require(run('git', 'merge-base', '--is-ancestor',
                'fe9e8a7d84da164e9a413dc2c3efe49f529c2a78', BASE) == '',
            'stage39 ancestry unavailable')
    for row in rows:
        read_source(Path(row['source']), row, False)
    require_ac()
    require(free_bytes() >= PREFLIGHT, 'less than 3 GiB after source preflight')
    os.mkdir(INDEX_DIR, 0o700)
    require(stat.S_ISDIR(INDEX_DIR.lstat().st_mode) and not INDEX_DIR.is_symlink() and
            not os.path.lexists(INDEX_DIR / 'index'), 'private index collision')
    env = {'GIT_INDEX_FILE': str(INDEX_DIR / 'index')}
    run('git', 'read-tree', BASE, env=env)
    names = {}
    for row in rows:
        require_ac()
        read_source(Path(row['source']), row, True)
        require(run('git', 'cat-file', '-s', row['gitBlobOid']) == str(row['bytes']),
                'Git blob size mismatch')
        run('git', 'update-index', '--add', '--cacheinfo',
            f"100644,{row['gitBlobOid']},{row['target']}", env=env)
        names[row['target']] = row['gitBlobOid']
    require_ac()
    extras = {
        'publication/SOURCE-CANDIDATE-MAP.json': map_bytes,
        'publication/CHECKLIST.md': plan_bytes,
        'publication/SOURCE-ROSTER.tsv': roster_bytes,
        'publication/publish_stage40.py': script_bytes,
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
        names[destination] = oid
    tree = run('git', 'write-tree', env=env)
    tree_lines = run('git', 'ls-tree', '-r', tree, PREFIX).splitlines()
    actual = {}
    for line in tree_lines:
        metadata, path = line.split('\t', 1)
        mode, kind, oid = metadata.split()
        require(mode == '100644' and kind == 'blob' and path not in actual, 'bad stage40 tree entry')
        actual[path] = oid
    require(actual == names and len(actual) == 138, 'stage40 subtree path/OID mismatch')
    commit = run('git', 'commit-tree', tree, '-p', BASE, '-m',
                 'evidence(1370): preserve H type-route STOP proofs')
    require(run('git', 'rev-parse', f'{commit}^') == BASE and
            run('git', 'rev-parse', f'{commit}^{{tree}}') == tree and
            set(run('git', 'diff-tree', '--no-commit-id', '--name-only', '-r', commit).splitlines()) == set(names),
            'commit parent/tree/delta mismatch')
    require(run('git', 'ls-remote', 'origin', EVIDENCE_REF).split()[0] == BASE,
            'remote changed before compare-and-swap')
    require_ac()
    run('git', 'update-ref', EVIDENCE_REF, commit, BASE)
    require(run('git', 'rev-parse', EVIDENCE_REF) == commit, 'local evidence CAS mismatch')
    try:
        run('git', 'push', '--no-force', 'origin', f'{EVIDENCE_REF}:{EVIDENCE_REF}')
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
    result = {'schema': '1370-c0-stage40-publish-result-r1',
              'status': 'PUBLISHED_REMOTE_TIP_VERIFIED_REMOTE_BYTES_PENDING',
              'base': BASE, 'commit': commit, 'tree': tree,
              'remoteRef': EVIDENCE_REF, 'fileCount': len(actual),
              'mapSha256': MAP_SHA,
              'publisherSha256': hashlib.sha256(script_bytes).hexdigest(),
              'manifestSha256': hashlib.sha256(manifest_bytes).hexdigest(),
              'mapReviewReceiptSha256': hashlib.sha256(map_review_bytes).hexdigest(),
              'r11ObservedStopReceiptSha256': R11_STOP_SHA,
              'r13ObservedStopReceiptSha256': R13_STOP_SHA,
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
        print(f'STAGE40_PUBLISH_FAILED: {error}', file=sys.stderr)
        raise
