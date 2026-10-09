#!/usr/bin/env python3
"""Unrun historical witness: sandboxed child -> bounded stdout frame; no output files."""
import base64
import hashlib
import json
import os
import select
import selectors
import signal
import stat
import subprocess
import sys
import time
from pathlib import Path

MAX_STDOUT = 512 * 1024
MAX_STDERR = 64 * 1024
OUTER_SECONDS = 750
CHILD_STOP_SECONDS = 742
SOURCE = '3aaf55e0c06c4b745b0b722cc56913050b1ee229'
SOURCE_FILES = ('witness-core.mjs', 'worktree-guard.mjs', 'bounds-guard.mjs', 'witness.mts', 'supervise.py', 'outer-recorder.py', 'POLICY.sb',
                'test-synthetic.mjs', 'test-supervisor.py', 'test-outer.py',
                'BINDING-UNFILLED.json', 'PLAN.md')
OBSERVER_FILES = ('witness-core.mjs', 'worktree-guard.mjs', 'bounds-guard.mjs', 'witness.mts', 'supervise.py', 'outer-recorder.py', 'POLICY.sb')
RUNTIME_FILES = ('package.json', 'package-lock.json', 'node_modules/vite/package.json',
                 'node_modules/vite-node/package.json', 'node_modules/vite-node/vite-node.mjs')
BLOB_PINS = {
    'src/core/aging.ts': 'e1b88562ded631e0142b2783555e866d4a884d04',
    'src/core/employment.ts': 'e8e5acaa1e6a94ac1de7db13eb46840efb55616f',
    'src/core/hollywood.ts': '377da502bcfa55afe31c243ab0909b2c0012d269',
    'src/core/worldgen.ts': '94f83a85e1e59532013ab4735f73a67a916a5332',
    'src/core/tick.ts': '328c2e28f7e209b4ab6b96c6e59f1d1739ad0db5',
    'src/harness/p13a/fixtures.ts': '9ab3eee75b0b2b2733f350bbc3964aa5ba176de8',
    'tests/bridge-p14b5-relationships.test.ts': '0815114340a983348eae6e98c33843c32c297228',
    'tests/fixtures/p13a/accepted-v19.json.gz': 'a987ecc4411c48fc8f256e81c93e9abf1fd61d6c',
}
EXPECTED = {
    'employment': '4cffcb410893395f8ee93da2d7d6146f35db2369962fe333e02de8d2fc7c0b58',
    'settlement': '706e54c6ec9728df1664025982ebbafeb0fc36afb245b6bd0b983305f6a10a77',
    'receipts': 'af8c4d1325ecb350dbc07fbf2f762dd8257db04075b8030bf7bd975b4cb2a766',
    'takes': '8af116b1687ed210c02953b5b506456e638a64482e8042b0e549b0d57e428694',
    'rng': '2598418427,508725886,1318803286,3129010527',
}
PROTOCOL = 'single-bounded-stdout-frame-no-files'
MAX_FAILURE_BYTES = 8 * 1024
STDERR_PREFIX_BYTES = 4 * 1024


class FailureStop(RuntimeError):
    def __init__(self, status, diagnostic):
        super().__init__(status)
        self.diagnostic = diagnostic


def failure_record(buffers, child, stage='supervisor-child'):
    err = bytes(buffers['stderr'])
    out = bytes(buffers['stdout'])
    prefix = err[:STDERR_PREFIX_BYTES]
    return {'stage': stage, 'childPid': child.pid, 'ownedPgid': os.getpgrp(),
            'childExit': child.poll(), 'directChildReaped': child.poll() is not None,
            'stdoutBytes': len(out), 'stdoutSha256': hashlib.sha256(out).hexdigest(),
            'stderrBytes': len(err), 'stderrSha256': hashlib.sha256(err).hexdigest(),
            'stderrPrefixBase64': base64.b64encode(prefix).decode('ascii'),
            'stderrPrefixBytes': len(prefix), 'stderrTruncated': len(prefix) != len(err),
            'byteCountsScope': 'Already captured bytes; cap-crossing read is excluded.'}


def failure_line(exc):
    status = str(exc).encode('utf8', errors='replace')
    record = {'status': status[:256].decode('utf8', errors='replace'),
              'statusBytes': len(status), 'statusSha256': hashlib.sha256(status).hexdigest(),
              'statusTruncated': len(status) > 256,
              'reporterPid': os.getpid(), 'reporterPgid': os.getpgrp()}
    if isinstance(exc, FailureStop):
        record['failure'] = exc.diagnostic
    raw = (json.dumps(record, sort_keys=True, separators=(',', ':')) + '\n').encode('ascii')
    if len(raw) > MAX_FAILURE_BYTES:
        record.pop('failure', None)
        record['failureMetadataOmittedForCap'] = True
        raw = (json.dumps(record, sort_keys=True, separators=(',', ':')) + '\n').encode('ascii')
    if len(raw) > MAX_FAILURE_BYTES:
        raise RuntimeError('STOP_DIAGNOSTIC_CAP')
    return raw
BOUNDS = {
    'path': '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-source-r6/AMENDMENT-BOUNDS-PROPOSED.md',
    'sha256': '3e705b81cd4991b628eff0a084e8088f53005be49098ee449b025c1d8606f0d4',
    'reviewPath': '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-bounds-independent-design-review-r1/RECEIPT.json',
    'reviewSha256': '8dc9c50b2ba7edf3702b42fd3dbeefb2e26e4089891af32127fa816c1704df3d',
}
ADOPTION = {
    'path': '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-bounds-parent-adoption-r1/ADOPTION.json',
    'sha256': '6b4b83cd3470a9a882d8045ae6300bca0a39635c793c4a3b312c8d0fed94dc46',
}
SOURCE_REVIEW_PATH = '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-independent-static-review-r6/RECEIPT.json'
SOURCE_REVIEW_SHA = '02b6052169f67c29464f1b8b6c08b1fc7921a7a13f0e3b0328537b8e8e7ba8f0'
REVIEW_CLAIM = 'Design-only independent acceptance of historical diagnostic time bounds; no Owner adoption, no real witness/game/H/dependency/native run, no output preimage and no 1363 or C0 acceptance.'
ADOPTION_CLAIM = 'Historical diagnostic witness bounds only; exact filled launch review and observed run remain required. No C0, 1363, native or game acceptance. Prior 300/330 and 600/630 labels unchanged. Timeout or survivor is STOP.'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def stop_child(child, end):
    for sig in (signal.SIGTERM, signal.SIGKILL):
        if child.poll() is not None:
            break
        try:
            child.send_signal(sig)
        except ProcessLookupError:
            pass
        except PermissionError as exc:
            raise RuntimeError('STOP_SIGNAL_DENIED') from exc
        limit = min(end, time.monotonic() + (1 if sig == signal.SIGTERM else 3))
        while child.poll() is None and time.monotonic() < limit:
            time.sleep(0.05)
    try:
        child.wait(timeout=max(0, end - time.monotonic()))
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError('STOP_CHILD_SURVIVOR') from exc
    if child.poll() is None:
        raise RuntimeError('STOP_CHILD_SURVIVOR')


def digest_map(value, keys):
    return (isinstance(value, dict) and set(value) == set(keys) and
            all(isinstance(value[key], str) and len(value[key]) == 64 and
                all(c in '0123456789abcdef' for c in value[key]) for key in keys))


def validate_bounds_roles(profile):
    if profile.get('boundsAmendment') != BOUNDS or profile.get('parentBoundsAdoption') != ADOPTION:
        raise RuntimeError('STOP_BOUNDS_BINDING_PATH')
    amendment = Path(BOUNDS['path']).read_bytes()
    review_bytes = Path(BOUNDS['reviewPath']).read_bytes()
    adoption_bytes = Path(ADOPTION['path']).read_bytes()
    if (sha(amendment) != BOUNDS['sha256'] or sha(review_bytes) != BOUNDS['reviewSha256'] or
            sha(adoption_bytes) != ADOPTION['sha256']):
        raise RuntimeError('STOP_BOUNDS_BYTES')
    review = json.loads(review_bytes)
    owner = json.loads(adoption_bytes)
    if (review.get('schema') != '1370-c0-aging-era-employment-witness-bounds-independent-design-review-r1' or
            review.get('kind') != 'bounds' or review.get('status') != 'FROZEN_DESIGN_ONLY_UNRUN' or
            review.get('verdict') != 'ACCEPT_WITNESS_BOUNDS_DESIGN_ONLY' or
            review.get('decision') != 'INDEPENDENT_ACCEPT' or review.get('ownerAdoption') is not False or
            review.get('executionAuthorization') is not False or review.get('sourceSha') != SOURCE or
            review.get('amendmentPath') != BOUNDS['path'] or
            review.get('amendmentSha256') != BOUNDS['sha256'] or
            review.get('sourceReviewPath') != SOURCE_REVIEW_PATH or
            review.get('sourceReviewSha256') != SOURCE_REVIEW_SHA or
            review.get('claimLimit') != REVIEW_CLAIM):
        raise RuntimeError('STOP_BOUNDS_REVIEW_ROLE')
    if (owner.get('schema') != '1370-c0-aging-era-employment-witness-bounds-parent-adoption-r1' or
            owner.get('status') != 'ADOPTED_OPERATIONAL_BOUNDS_UNRUN' or
            owner.get('decision') != 'PARENT_ADOPT_HISTORICAL_WITNESS_BOUNDS_ONLY' or
            owner.get('executionAuthorization') is not False or owner.get('sourceSha') != SOURCE or
            owner.get('amendmentPath') != BOUNDS['path'] or
            owner.get('amendmentSha256') != BOUNDS['sha256'] or
            owner.get('independentReviewPath') != BOUNDS['reviewPath'] or
            owner.get('independentReviewSha256') != BOUNDS['reviewSha256'] or
            owner.get('innerSeconds') != 720 or owner.get('activeStopSeconds') != 742 or
            owner.get('wholeRecorderSeconds') != 750 or owner.get('weeks') != 416 or
            owner.get('seed') != 'p13a-core-causal-01' or
            owner.get('claimLimit') != ADOPTION_CLAIM):
        raise RuntimeError('STOP_BOUNDS_ADOPTION_ROLE')
    return {'kind': 'bounds', 'amendmentSha256': BOUNDS['sha256'],
            'reviewSha256': BOUNDS['reviewSha256'], 'adoptionSha256': ADOPTION['sha256']}


def require_launch_window(started, now=None):
    if (time.monotonic() if now is None else now) >= started + CHILD_STOP_SECONDS:
        raise RuntimeError('STOP_PREFLIGHT_DEADLINE')


def validate_source_review(profile, source_dir):
    """Require an independent ACCEPT for exactly these source bytes before Popen."""
    source_pins = source_dir / 'SOURCE-PINS.json'
    manifest_bytes = source_pins.read_bytes()
    manifest = json.loads(manifest_bytes)
    files = manifest.get('files')
    if (manifest.get('status') != 'FROZEN_UNRUN_UNLAUNCHABLE_SOURCE_REVIEW_REQUIRED' or
            manifest.get('sourceSha') != SOURCE or manifest.get('protocol') != PROTOCOL or
            not isinstance(files, dict) or set(files) != set(SOURCE_FILES)):
        raise RuntimeError('STOP_SOURCE_MANIFEST')
    for name in SOURCE_FILES:
        item = files[name]
        data = (source_dir / name).read_bytes()
        if set(item) != {'sha256', 'bytes'} or item != {'sha256': sha(data), 'bytes': len(data)}:
            raise RuntimeError('STOP_SOURCE_FILE_PIN')
    review_binding = profile.get('independentSourceReviewReceipt')
    if not isinstance(review_binding, dict) or set(review_binding) != {'path', 'sha256'}:
        raise RuntimeError('STOP_SOURCE_REVIEW_UNFILLED')
    receipt_path = Path(review_binding['path'])
    if not receipt_path.is_absolute() or not receipt_path.is_file():
        raise RuntimeError('STOP_SOURCE_REVIEW_PATH')
    receipt_bytes = receipt_path.read_bytes()
    if sha(receipt_bytes) != review_binding['sha256']:
        raise RuntimeError('STOP_SOURCE_REVIEW_PIN')
    receipt = json.loads(receipt_bytes)
    if (receipt.get('schema') != '1370-c0-aging-era-employment-witness-independent-static-review-r8' or
            receipt.get('status') != 'FROZEN_SOURCE_ONLY_UNRUN' or
            receipt.get('sourceDirectory') != str(source_dir) or
            receipt.get('sourcePinsSha256') != sha(manifest_bytes) or
            receipt.get('sourceSha') != SOURCE or
            receipt.get('decision', {}).get('witnessSource') != 'ACCEPT_SOURCE_ONLY_UNRUN' or
            receipt.get('decision', {}).get('launch') != 'STOP_UNFILLED_UNRUN' or
            receipt.get('frozenHashes') != {name: files[name]['sha256'] for name in SOURCE_FILES}):
        raise RuntimeError('STOP_SOURCE_REVIEW_ROLE')
    observer = profile.get('observerSha256')
    if not digest_map(observer, OBSERVER_FILES) or any(observer[name] != files[name]['sha256'] for name in OBSERVER_FILES):
        raise RuntimeError('STOP_OBSERVER_PIN')
    return receipt


def validate_frame(raw, profile):
    if not raw.endswith(b'\n') or raw.count(b'\n') != 1 or len(raw) > MAX_STDOUT:
        raise RuntimeError('STOP_FRAME_SHAPE')
    try:
        frame = json.loads(raw.decode('utf8'))
        if frame['status'] != 'MATCHED_AGING_ERA_PREIMAGE_CANDIDATE' or frame['protocol'] != PROTOCOL:
            raise ValueError('status/protocol')
        if frame['sourceSha'] != SOURCE or frame['seed'] != 'p13a-core-causal-01' or frame['weeks'] != 416:
            raise ValueError('source/seed/weeks')
        if frame['digests'] != EXPECTED or frame['employmentRows'] != 44:
            raise ValueError('controls/rows')
        encoded = frame['preimageBase64']
        preimage = base64.b64decode(encoded, validate=True)
        if base64.b64encode(preimage).decode('ascii') != encoded:
            raise ValueError('base64-roundtrip')
        if len(preimage) != frame['employmentBytes'] or not 0 < len(preimage) <= 256 * 1024:
            raise ValueError('preimage-length')
        if sha(preimage) != EXPECTED['employment']:
            raise ValueError('preimage-sha')
        rows = json.loads(preimage.decode('utf8'))
        if not isinstance(rows, list) or len(rows) != 44:
            raise ValueError('preimage-json')
        observer = profile['observerSha256']
        runtime = profile['runtimeSha256']
        worktree = profile['worktreeSha256']
        if (not digest_map(observer, OBSERVER_FILES) or not digest_map(runtime, RUNTIME_FILES) or
                not digest_map(worktree, BLOB_PINS)):
            raise ValueError('binding-hashes')
        amendment = profile['boundsAmendment']
        adoption = profile['parentBoundsAdoption']
        if amendment != BOUNDS or adoption != ADOPTION:
            raise ValueError('amendment-shape')
        expected_amendments = [{'kind': 'bounds', 'amendmentSha256': amendment['sha256'],
                                'reviewSha256': amendment['reviewSha256'],
                                'adoptionSha256': adoption['sha256']}]
        expected_guard = {'head': SOURCE, 'blobs': BLOB_PINS, 'worktreeSha256': worktree,
                          'observer': observer,
                          'runtime': runtime, 'amendments': expected_amendments,
                          'node': profile['nodeVersion'], 'execPath': profile['nodeExecPath']}
        if (frame['sourceBlobs'] != BLOB_PINS or frame['worktreeSha256'] != worktree or
                frame['boundsAmendment'] != amendment or frame['parentBoundsAdoption'] != adoption or
                frame['node'] != profile['nodeVersion'] or
                frame['preflight'] != expected_guard or
                frame['postflight'] != expected_guard or
                frame['finalflight'] != expected_guard):
            raise ValueError('source-guards')
        quote = frame['firstQuote']
        if (quote['index'] != 0 or quote['committedAge'] != 44 or
                quote['row']['terms']['talentId'] != 'person-studio-aca408ec-r01-0' or
                quote['row']['terms']['annualSalary'] != 395548 or
                quote['row']['terms']['signingBonus'] != 71199):
            raise ValueError('first-quote')
    except (KeyError, ValueError, TypeError, UnicodeError, json.JSONDecodeError) as exc:
        raise RuntimeError('STOP_FRAME_VALIDATION') from exc
    return frame


def main():
    started = time.monotonic()
    end = started + OUTER_SECONDS
    if len(sys.argv) != 2:
        raise RuntimeError('STOP_ARGV')
    mode = os.fstat(sys.stdout.fileno()).st_mode
    if not (stat.S_ISFIFO(mode) or stat.S_ISSOCK(mode)):
        raise RuntimeError('STOP_STDOUT_NOT_PIPE')
    binding = Path(sys.argv[1]).resolve(strict=True)
    profile = json.loads(binding.read_text())
    if profile.get('status') != 'REVIEWED_FILLED_UNRUN' or profile.get('sourceSha') != SOURCE or profile.get('outputProtocol') != PROTOCOL:
        raise RuntimeError('STOP_UNFILLED')
    root = Path(profile['repoRoot']).resolve(strict=True)
    source_dir = Path(__file__).resolve().parent
    validate_source_review(profile, source_dir)
    validate_bounds_roles(profile)
    policy = source_dir / 'POLICY.sb'
    if policy.read_bytes() != b'(version 1)\n(allow default)\n(deny file-write*)\n':
        raise RuntimeError('STOP_POLICY_BYTES')
    script = source_dir / 'witness.mts'
    runner = root / 'node_modules/.bin/vite-node'
    if not runner.is_file():
        raise RuntimeError('STOP_RUNNER_MISSING')
    # Preflight is part of the one 750-second recorder envelope. Reserve cleanup.
    require_launch_window(started)
    child = subprocess.Popen(['/usr/bin/sandbox-exec', '-f', str(policy), str(runner), str(script), str(binding)],
                             cwd=root, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, start_new_session=False, close_fds=True,
                             env={k: v for k, v in os.environ.items()
                                  if not k.startswith(('GIT_', 'NODE_OPTIONS'))})
    try:
        require_launch_window(started)
    except RuntimeError as exc:
        empty_buffers = {'stdout': b'', 'stderr': b''}
        try:
            stop_child(child, end)
        except Exception as cleanup_exc:
            raise FailureStop(str(cleanup_exc), failure_record(empty_buffers, child, 'supervisor-cleanup')) from cleanup_exc
        raise FailureStop(str(exc), failure_record(empty_buffers, child, 'supervisor-before-pipe-read')) from exc
    selector = selectors.DefaultSelector()
    buffers = {'stdout': bytearray(), 'stderr': bytearray()}
    for name, pipe in [('stdout', child.stdout), ('stderr', child.stderr)]:
        os.set_blocking(pipe.fileno(), False)
        selector.register(pipe, selectors.EVENT_READ, name)
    failure = None
    try:
        while selector.get_map() or child.poll() is None:
            if time.monotonic() >= started + CHILD_STOP_SECONDS:
                failure = 'STOP_CHILD_TIMEOUT'
                break
            for key, _ in selector.select(timeout=0.1):
                block = os.read(key.fileobj.fileno(), 8192)
                if not block:
                    selector.unregister(key.fileobj)
                    key.fileobj.close()
                    continue
                target = buffers[key.data]
                cap = MAX_STDOUT if key.data == 'stdout' else MAX_STDERR
                if len(target) + len(block) > cap:
                    failure = f'STOP_{key.data.upper()}_CAP'
                    break
                target.extend(block)
            if failure:
                break
        if child.poll() != 0 and failure is None:
            failure = f'STOP_CHILD_EXIT_{child.poll()}'
    finally:
        selector.close()
        try:
            stop_child(child, end)
        except Exception as exc:
            raise FailureStop(str(exc), failure_record(buffers, child, 'supervisor-cleanup')) from exc
    if time.monotonic() >= end:
        failure = 'STOP_OUTER_DEADLINE'
    if failure:
        raise FailureStop(failure, failure_record(buffers, child))
    try:
        validate_frame(bytes(buffers['stdout']), profile)
    except Exception as exc:
        raise FailureStop(str(exc), failure_record(buffers, child, 'supervisor-frame')) from exc
    if buffers['stderr']:
        raise FailureStop('STOP_CHILD_STDERR', failure_record(buffers, child))
    if time.monotonic() >= end:
        raise FailureStop('STOP_OUTER_DEADLINE', failure_record(buffers, child))
    # One exact pipe frame. No regular output file is opened by either process.
    raw = bytes(buffers['stdout'])
    os.set_blocking(sys.stdout.fileno(), False)
    while raw:
        remaining = end - time.monotonic()
        if remaining <= 0:
            raise RuntimeError('STOP_OUTER_DEADLINE')
        _, writable, _ = select.select([], [sys.stdout.fileno()], [], remaining)
        if not writable:
            raise RuntimeError('STOP_OUTER_DEADLINE')
        try:
            count = os.write(sys.stdout.fileno(), raw)
        except BlockingIOError:
            continue
        if count <= 0:
            raise RuntimeError('STOP_FORWARD_WRITE')
        raw = raw[count:]


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        sys.stderr.write(failure_line(exc).decode('ascii'))
        raise SystemExit(2)
