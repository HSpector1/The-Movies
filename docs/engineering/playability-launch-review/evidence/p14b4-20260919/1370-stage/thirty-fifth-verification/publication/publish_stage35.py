"""Publish the exact reviewed stage35 adoption archive on the evidence branch.

Proposal only until an independent receipt accepts this file and the exact launch.
This script is deliberately one-shot. It never changes the production index.
"""
from __future__ import annotations

import hashlib
import json
import argparse
import os
from pathlib import Path, PurePosixPath
import signal
import stat
import subprocess
import sys
import time


REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
PLAN = SCRATCH / '1370-ebg-adoption-stage35-publication-plan-r1'
HERE = SCRATCH / '1370-ebg-adoption-stage35-publisher-proposal-r1'
MAP = PLAN / 'MAP.json'
MAP_REVIEW = SCRATCH / '1370-ebg-adoption-stage35-publication-independent-map-review-r1' / 'RECEIPT.json'
REVIEW = SCRATCH / '1370-ebg-adoption-stage35-publisher-static-review-r1' / 'RECEIPT.json'
MANIFEST = HERE / 'MANIFEST.json'
OUT = HERE / 'PUBLISH-RESULT.json'
INDEX_DIR = HERE / 'private-index'

BASE = '15bda3eefedb2d00f74b65b143199f5f8be77d15'
PRODUCTION_HEAD = 'b97129610a07d3529fc482daeddc0cd9bf798713'
SOURCE_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
CAPTURE_PREDECESSOR = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
EVIDENCE_REF = 'refs/heads/evidence/1370-r10-clean-captures'
PRODUCTION_REF = 'refs/heads/wip/headless-program-20260916-ts'
ORIGIN = 'https://github.com/HSpector1/The-Movies.git'
PREFIX = ('docs/engineering/playability-launch-review/evidence/'
          'p14b4-20260919/1370-stage/thirty-fifth-verification/')
MAP_SHA = 'ccc002e5c9f3f3bca85fae4a3031495d3d5fe9c86d73fdddcd52696bea581ed2'
PLAN_SHA = 'eb19a684825bd8f83da78ae301fc1cec895d5ebaaefc7e1e8ff72800c2354eb0'
FLOOR = 3 * 1024 * 1024 * 1024
PREFLIGHT = 15 * 1024 * 1024 * 1024 // 4
WALL_SECONDS = 900
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
        completed = subprocess.run(['pmset', '-g', 'batt'], cwd=REPO,
                                   text=True, stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE, timeout=10)
    except (OSError, subprocess.TimeoutExpired) as error:
        raise RuntimeError('AC power unavailable or uncheckable') from error
    require(completed.returncode == 0 and parse_power_status(completed.stdout),
            'AC power unavailable or uncheckable')


def run(*argv: str, env: dict[str, str] | None = None) -> str:
    require(free_bytes() >= FLOOR, '3 GiB free-space floor breached')
    remaining = max(1, int(START + WALL_SECONDS - time.monotonic()))
    completed = subprocess.run(argv, cwd=REPO, env=env, text=True,
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                               timeout=remaining)
    require(completed.returncode == 0,
            f'{argv!r} exit {completed.returncode}: {completed.stderr[-2000:]}')
    require(free_bytes() >= FLOOR, '3 GiB free-space floor breached after command')
    return completed.stdout.strip()


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
            while True:
                part = os.read(fd, 1024 * 1024)
                if not part:
                    break
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
            child = None
            if emit_blob:
                child = subprocess.Popen(['git', 'hash-object', '-w', '--stdin'],
                                         cwd=REPO, stdin=subprocess.PIPE,
                                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            total = 0
            try:
                while True:
                    part = os.read(fd, 1024 * 1024)
                    if not part:
                        break
                    total += len(part)
                    sha.update(part)
                    blob_sha.update(part)
                    if child is not None:
                        child.stdin.write(part)
                    if total == len(part) or total % (8 * 1024 * 1024) == 0:
                        require_ac()
                    require(free_bytes() >= FLOOR, '3 GiB free-space floor breached')
                if child is not None:
                    child.stdin.close()
                    result = child.stdout.read().decode().strip()
                    error = child.stderr.read().decode()
                    code = child.wait()
                    require(code == 0, f'git hash-object failed: {error}')
                else:
                    result = None
            except BaseException:
                if child is not None and child.poll() is None:
                    child.kill()
                    child.wait()
                raise
            require(total == expected['bytes'], f'source short read: {path}')
            require(sha.hexdigest() == expected['sha256'], f'SHA-256 drift: {path}')
            require(blob_sha.hexdigest() == expected['gitBlob'], f'Git OID drift: {path}')
            if result is not None:
                require(result == expected['gitBlob'], f'written blob mismatch: {path}')
            require(attrs(before) == attrs(os.fstat(fd)) ==
                    attrs(os.stat(path.name, dir_fd=parent, follow_symlinks=False)),
                    f'source changed while reading: {path}')
            return sha.hexdigest(), result
        finally:
            os.close(fd)
    finally:
        os.close(parent)


def validate_map(value: dict) -> list[dict]:
    require(value.get('schema') == '1370-ebg-adoption-stage35-publication-source-map-r1',
            'wrong map schema')
    for key, expected in [('baseEvidenceCommit', BASE),
                          ('baseEvidenceRef', EVIDENCE_REF),
                          ('productionHead', PRODUCTION_HEAD),
                          ('productionRef', PRODUCTION_REF),
                          ('sourceTree', SOURCE_TREE),
                          ('capturePredecessor', CAPTURE_PREDECESSOR),
                          ('stagePrefix', PREFIX)]:
        require(value.get(key) == expected, f'wrong {key}')
    rows = value.get('files')
    require(isinstance(rows, list) and len(rows) == 35, 'wrong file count')
    require(value.get('stageFileCount') == 35 and
            value.get('stageSourceBytes') == 141417075 and
            sum(row.get('bytes', -1) for row in rows) == 141417075,
            'wrong stage byte count')
    require(value.get('githubMaxBlobBytesExclusive') == 100000000,
            'wrong blob cap')
    require(value.get('archiveTarBytes') == 141322240 and
            value.get('archiveTarSha256') ==
            '8070202a82fd9cb23474eee632ab44798dbe4bcbb636d58f0e97d59a0e24b3f5' and
            value.get('observedReceiptSha256') ==
            'c98f49e901ac2e4ca8d14eb76b15f01e0030746c046747cf4024717575ce2d15' and
            value.get('localReadbackReceiptSha256') ==
            'f84e80a90dec889f8d9d317dd57a57b5b29cc5e8ded318871a699ea8bad5664c',
            'wrong archive or observed authority')
    seen = set()
    for row in rows:
        require(set(row) == {'source', 'destination', 'bytes', 'sha256', 'gitBlob'},
                'wrong map row keys')
        path = Path(row['source'])
        require(path.is_absolute() and path.is_relative_to(SCRATCH) and
                '..' not in path.parts and path != SCRATCH,
                f'unsafe source path: {path}')
        dest = row['destination']
        parts = PurePosixPath(dest).parts
        require(isinstance(dest, str) and dest.startswith(PREFIX) and
                dest not in seen and '\\' not in dest and
                all(piece not in ('', '.', '..') for piece in parts) and
                PurePosixPath(dest).as_posix() == dest,
                f'unsafe or duplicate destination: {dest}')
        seen.add(dest)
        require(isinstance(row['bytes'], int) and 0 <= row['bytes'] < 100000000,
                f'blob over cap: {dest}')
        require(isinstance(row['sha256'], str) and len(row['sha256']) == 64 and
                all(c in '0123456789abcdef' for c in row['sha256']),
                f'invalid SHA-256: {dest}')
        require(isinstance(row['gitBlob'], str) and len(row['gitBlob']) == 40 and
                all(c in '0123456789abcdef' for c in row['gitBlob']),
                f'invalid Git blob OID: {dest}')
    by_name = {row['destination'][len(PREFIX):]: row for row in rows}
    require([by_name[f'archive/capture.tar.part-{i:03d}']['bytes']
             for i in range(1, 4)] == [67108864, 67108864, 7104512],
            'wrong three-part archive sizes')
    require(by_name['builder/BINDING.json']['sha256'] ==
            '3d93a24d2d2551f8738df9a1af0c99c0c278fa215f8f6330ae97fc67fb7101ba' and
            by_name['builder/EXACT-REVIEW-RECEIPT.json']['sha256'] ==
            '68e0ec64f2159bbdd4789c3b65257b0c7708cd4f8fbe5e3bcf45b3fa52600c73' and
            by_name['local-readback/RECEIPT.json']['sha256'] ==
            'f84e80a90dec889f8d9d317dd57a57b5b29cc5e8ded318871a699ea8bad5664c',
            'wrong corrected builder or local readback authority')
    return rows


def blob_for_bytes(value: bytes) -> str:
    completed = subprocess.run(['git', 'hash-object', '-w', '--stdin'], cwd=REPO,
                               input=value, stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    require(completed.returncode == 0,
            f'git hash-object failed: {completed.stderr.decode()[-2000:]}')
    oid = completed.stdout.decode().strip()
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
    START = time.monotonic()
    signal.signal(signal.SIGALRM,
                  lambda *_: (_ for _ in ()).throw(TimeoutError('900-second publisher deadline')))
    signal.setitimer(signal.ITIMER_REAL, WALL_SECONDS)
    parser = argparse.ArgumentParser()
    parser.add_argument('--map-review-sha', required=True)
    parser.add_argument('--publisher-review-sha', required=True)
    args = parser.parse_args()
    for pin in (args.map_review_sha, args.publisher_review_sha):
        require(len(pin) == 64 and all(c in '0123456789abcdef' for c in pin),
                'invalid review SHA-256')
    require_ac()
    require(free_bytes() >= PREFLIGHT, 'less than 3.75 GiB before publication')
    require(not os.path.lexists(INDEX_DIR) and not os.path.lexists(OUT),
            'one-shot output/index path exists')
    map_bytes = read_regular(MAP, 1024 * 1024)
    plan_bytes = read_regular(PLAN / 'PLAN.md', 1024 * 1024)
    script_bytes = read_regular(HERE / 'publish_stage35.py', 1024 * 1024)
    review_bytes = read_regular(REVIEW, 1024 * 1024)
    map_review_bytes = read_regular(MAP_REVIEW, 1024 * 1024)
    manifest_bytes = read_regular(MANIFEST, 1024 * 1024)
    require(hashlib.sha256(map_bytes).hexdigest() == MAP_SHA, 'map bytes drift')
    require(hashlib.sha256(plan_bytes).hexdigest() == PLAN_SHA, 'plan bytes drift')
    rows = validate_map(json.loads(map_bytes))
    map_review = json.loads(map_review_bytes)
    require(hashlib.sha256(map_review_bytes).hexdigest() == args.map_review_sha and
            map_review.get('decision') == 'ACCEPT_DESIGN_ONLY' and
            map_review.get('mapSha256') == MAP_SHA and
            map_review.get('planSha256') == PLAN_SHA and
            map_review.get('sourceBytes') == 141417075 and
            map_review.get('fileCount') == 35,
            'stage35 plan/map review mismatch')
    manifest = json.loads(manifest_bytes)
    require(manifest.get('schema') == '1370-ebg-adoption-stage35-publisher-proposal-r1' and
            manifest.get('classification') == 'PROPOSAL_ONLY_UNRUN_NO_GIT_MUTATION',
            'publisher manifest mismatch')
    expected_manifest_files = {
        str(HERE / 'publish_stage35.py'): script_bytes,
        str(PLAN / 'MAP.json'): map_bytes,
        str(PLAN / 'PLAN.md'): plan_bytes,
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
            review.get('decision') == 'ACCEPT_STATIC_STAGE35_PUBLISHER_R1' and
            review.get('mapSha256') == MAP_SHA and
            review.get('scriptSha256') == hashlib.sha256(script_bytes).hexdigest() and
            review.get('baseEvidenceCommit') == BASE and
            review.get('planSha256') == PLAN_SHA and
            review.get('manifestSha256') == hashlib.sha256(manifest_bytes).hexdigest() and
            review.get('mapReviewReceiptSha256') == hashlib.sha256(map_review_bytes).hexdigest(),
            'independent publisher receipt mismatch')
    require(run('git', 'rev-parse', 'HEAD') == PRODUCTION_HEAD and
            run('git', 'rev-parse', 'HEAD:src') == SOURCE_TREE and
            run('git', 'status', '--porcelain') == '', 'production checkout drift/dirty')
    require(run('git', 'remote', 'get-url', 'origin') == ORIGIN, 'wrong origin')
    require(run('git', 'rev-parse', EVIDENCE_REF) == BASE and
            run('git', 'ls-remote', 'origin', EVIDENCE_REF).split()[0] == BASE,
            'evidence base drift')
    require(run('git', 'ls-tree', '-r', '--name-only', BASE, PREFIX) == '',
            'stage35 prefix already exists')
    for row in rows:
        read_source(Path(row['source']), row, False)
    require_ac()
    require(free_bytes() >= PREFLIGHT, 'less than 3.75 GiB after source preflight')
    os.mkdir(INDEX_DIR, 0o700)
    require(stat.S_ISDIR(INDEX_DIR.lstat().st_mode) and not INDEX_DIR.is_symlink() and
            not os.path.lexists(INDEX_DIR / 'index'), 'private index collision')
    env = os.environ.copy()
    env['GIT_INDEX_FILE'] = str(INDEX_DIR / 'index')
    run('git', 'read-tree', BASE, env=env)
    names = set()
    for row in rows:
        require_ac()
        read_source(Path(row['source']), row, True)
        require(run('git', 'cat-file', '-s', row['gitBlob']) == str(row['bytes']),
                'Git blob size mismatch')
        run('git', 'update-index', '--add', '--cacheinfo',
            f"100644,{row['gitBlob']},{row['destination']}", env=env)
        names.add(row['destination'])
    require_ac()
    extras = {
        'publication/MAP.json': map_bytes,
        'publication/PLAN.md': plan_bytes,
        'publication/publish_stage35.py': script_bytes,
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
    require(actual == names and len(actual) == 41, 'stage35 subtree mismatch')
    commit = run('git', 'commit-tree', tree, '-p', BASE, '-m',
                 'evidence(1370): preserve EBG adoption clean capture')
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
    require_ac()
    require(run('git', 'rev-parse', 'HEAD') == PRODUCTION_HEAD and
            run('git', 'rev-parse', 'HEAD:src') == SOURCE_TREE and
            run('git', 'status', '--porcelain') == '',
            'production checkout changed during publication')
    result = {'schema': '1370-ebg-adoption-stage35-publish-result-r1',
              'status': 'PUBLISHED_REMOTE_TIP_VERIFIED_REMOTE_BYTES_PENDING',
              'base': BASE, 'commit': commit, 'tree': tree,
              'remoteRef': EVIDENCE_REF, 'fileCount': len(actual),
              'mapSha256': MAP_SHA,
              'publisherSha256': hashlib.sha256(script_bytes).hexdigest(),
              'manifestSha256': hashlib.sha256(manifest_bytes).hexdigest(),
              'mapReviewReceiptSha256': hashlib.sha256(map_review_bytes).hexdigest(),
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
        print(f'STAGE35_PUBLISH_FAILED: {error}', file=sys.stderr)
        raise
