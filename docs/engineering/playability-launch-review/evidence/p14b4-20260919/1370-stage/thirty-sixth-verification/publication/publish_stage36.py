"""Publish the exact reviewed stage36 adoption diagnostic on the evidence branch.

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
PLAN = SCRATCH / '1370-e0g-ebg-b-only-adoption-stage36-publication-plan-r1'
HERE = SCRATCH / '1370-e0g-ebg-b-only-adoption-stage36-publisher-proposal-r1'
MAP = PLAN / 'MAP.json'
MAP_REVIEW = SCRATCH / '1370-e0g-ebg-b-only-adoption-stage36-independent-map-review-r1' / 'RECEIPT.json'
REVIEW = SCRATCH / '1370-e0g-ebg-b-only-adoption-stage36-publisher-static-review-r1' / 'RECEIPT.json'
MANIFEST = HERE / 'MANIFEST.json'
OUT = HERE / 'PUBLISH-RESULT.json'
INDEX_DIR = HERE / 'private-index'

BASE = 'd8cb45ee094bd8647e19ebed7b63ce2d773dacd4'
PRODUCTION_HEAD = 'b97129610a07d3529fc482daeddc0cd9bf798713'
SOURCE_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EVIDENCE_REF = 'refs/heads/evidence/1370-r10-clean-captures'
PRODUCTION_REF = 'refs/heads/wip/headless-program-20260916-ts'
ORIGIN = 'https://github.com/HSpector1/The-Movies.git'
PREFIX = ('docs/engineering/playability-launch-review/evidence/'
          'p14b4-20260919/1370-stage/thirty-sixth-verification/')
MAP_SHA = '8b82dc3a892ad3a012721b419b6219f222d5800e302c746825154f6b03fbab10'
PLAN_SHA = 'ee8278af34df7cdb8e375fdcadf76f63846afcddecc9c9b1a6d5ed42f0385539'
ROSTER_SHA = '20bb8a667b114285bc9e35489d18b0fcfa8712529eaa963fef784bf9d9216ced'
FLOOR = 3 * 1024 * 1024 * 1024
PREFLIGHT = FLOOR
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
    require(value.get('schema') == '1370-e0g-ebg-b-only-adoption-stage36-source-map-r1',
            'wrong map schema')
    for key, expected in [('baseEvidenceCommit', BASE),
                          ('baseEvidenceRef', EVIDENCE_REF),
                          ('productionHead', PRODUCTION_HEAD),
                          ('productionSourceTree', SOURCE_TREE),
                          ('prefix', PREFIX)]:
        require(value.get(key) == expected, f'wrong {key}')
    rows = value.get('files')
    require(isinstance(rows, list) and len(rows) == 68, 'wrong file count')
    require(value.get('fileCount') == 68 and
            value.get('totalBytes') == 4449678 and
            sum(row.get('bytes', -1) for row in rows) == 4449678,
            'wrong stage byte count')
    require(value.get('classification') == 'PROPOSAL_ONLY_NO_GIT_MUTATION',
            'wrong source-map classification')
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
    require(by_name['comparator/recorded/RESULT.json']['sha256'] ==
            '2e909fd66897f142e11830b92d51ec10d2a7b26cec3aa23f626b42a781ead8fa' and
            by_name['audit/recorded/AUDIT.json']['sha256'] ==
            '3598f789f8d928b0dc26a7582fa5578196ac86e07e3a55fa0bb0142765c64654' and
            by_name['postreadback/recorded/CHECK.json']['sha256'] ==
            'f869fdcace204026f50139447db463239395e7cb0142332d20005ecb74e3dc4e' and
            by_name['postreadback/observed-review-r1/RECEIPT.json']['sha256'] ==
            '3a57d7b0cafcfb9f694de5866ef3cda0bdb0ee9f9f5166d844f9b88dfbfe544a',
            'wrong accepted diagnostic authority')
    require(by_name['prior-stop/p13a-r3/RECEIPT.json']['sha256'] ==
            '03ba66a7e680b217bf3f900dd4234a9832f0657fbc3970bce4d01067be97902d',
            'wrong prior STOP authority')
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
    require(free_bytes() >= PREFLIGHT, 'less than 3 GiB before publication')
    require(not os.path.lexists(INDEX_DIR) and not os.path.lexists(OUT),
            'one-shot output/index path exists')
    map_bytes = read_regular(MAP, 1024 * 1024)
    plan_bytes = read_regular(PLAN / 'PLAN.md', 1024 * 1024)
    roster_bytes = read_regular(PLAN / 'SOURCE-ROSTER.tsv', 1024 * 1024)
    script_bytes = read_regular(HERE / 'publish_stage36.py', 1024 * 1024)
    review_bytes = read_regular(REVIEW, 1024 * 1024)
    map_review_bytes = read_regular(MAP_REVIEW, 1024 * 1024)
    manifest_bytes = read_regular(MANIFEST, 1024 * 1024)
    require(hashlib.sha256(map_bytes).hexdigest() == MAP_SHA, 'map bytes drift')
    require(hashlib.sha256(plan_bytes).hexdigest() == PLAN_SHA, 'plan bytes drift')
    require(hashlib.sha256(roster_bytes).hexdigest() == ROSTER_SHA, 'roster bytes drift')
    rows = validate_map(json.loads(map_bytes))
    map_review = json.loads(map_review_bytes)
    require(hashlib.sha256(map_review_bytes).hexdigest() == args.map_review_sha and
            map_review.get('decision') == 'ACCEPT_DESIGN_ONLY' and
            map_review.get('mapSha256') == MAP_SHA and
            map_review.get('planSha256') == PLAN_SHA and
            map_review.get('sourceBytes') == 4449678 and
            map_review.get('fileCount') == 68 and
            map_review.get('rosterSha256') == ROSTER_SHA and
            map_review.get('baseEvidenceCommit') == BASE and
            map_review.get('productionHead') == PRODUCTION_HEAD and
            map_review.get('sourceTree') == SOURCE_TREE,
            'stage36 plan/map review mismatch')
    manifest = json.loads(manifest_bytes)
    require(manifest.get('schema') == '1370-e0g-ebg-b-only-adoption-stage36-publisher-proposal-r1' and
            manifest.get('classification') == 'PROPOSAL_ONLY_UNRUN_NO_GIT_MUTATION',
            'publisher manifest mismatch')
    expected_manifest_files = {
        str(HERE / 'publish_stage36.py'): script_bytes,
        str(PLAN / 'MAP.json'): map_bytes,
        str(PLAN / 'PLAN.md'): plan_bytes,
        str(PLAN / 'SOURCE-ROSTER.tsv'): roster_bytes,
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
            review.get('decision') == 'ACCEPT_STATIC_STAGE36_PUBLISHER_R1' and
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
            'stage36 prefix already exists')
    for row in rows:
        read_source(Path(row['source']), row, False)
    require_ac()
    require(free_bytes() >= PREFLIGHT, 'less than 3 GiB after source preflight')
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
        'publication/SOURCE-ROSTER.tsv': roster_bytes,
        'publication/publish_stage36.py': script_bytes,
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
    require(actual == names and len(actual) == 75, 'stage36 subtree mismatch')
    commit = run('git', 'commit-tree', tree, '-p', BASE, '-m',
                 'evidence(1370): preserve adoption B-bundle diagnostic')
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
    result = {'schema': '1370-e0g-ebg-b-only-adoption-stage36-publish-result-r1',
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
        print(f'STAGE36_PUBLISH_FAILED: {error}', file=sys.stderr)
        raise
