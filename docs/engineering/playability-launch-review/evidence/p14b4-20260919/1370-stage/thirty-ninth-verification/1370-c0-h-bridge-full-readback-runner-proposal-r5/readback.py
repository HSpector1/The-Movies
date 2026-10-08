#!/usr/bin/env python3
"""Unrun H bridge-inclusive full mirror readback; requires a reviewed filled binding."""
import hashlib
import json
import math
import os
import pathlib
import shutil
import signal
import stat
import subprocess
import time

S = pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO = pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
HERE = S / '1370-c0-h-bridge-full-readback-runner-proposal-r5'
SPEC = HERE / 'SPEC.json'
BINDING = pathlib.Path(globals().get('_BINDING_PATH', str(HERE / 'BINDING-UNFILLED.json')))
MIRROR = S / '1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'
OUT = S / '1370-c0-h-bridge-full-readback-recorded-r5/READBACK.json'
LOCK = S / 'HEAVY-LANE-LOCK'
LOG_NAME = 'c0-h-bridge-full-readback-20261008-r5.lane.log'
SPEC_SHA = '61377447a4ae70f49b090102ce85267a9487025f807c195252ef99f82ad64e07'
STATIC_SHA = '2d68b3686fea754398a76265b632a1c37bf58444169b9201f56982cfdc187eb6'
RECORDER_STATIC_SHA = '903429313815be42c2d9fd2e37af69b0c4ebea57f842cdc85a99f3aa3386e34e'
RECORDER_SOURCE_SHA = '3ce344244945298a11668abc04fc8a244f7a3884666d2f461797ede35aa11d44'
WALL = 600
FLOOR = 3 * 1024**3
PREFLIGHT = int(3.5 * 1024**3)
START = globals().get('_BOOTSTRAP_START')
LAST_ENV_CHECK = float('-inf')
ENV_INTERVAL = 5.0


def need(ok, reason):
    if not ok:
        raise RuntimeError(reason)


def same(st):
    return st.st_dev, st.st_ino, st.st_mode, st.st_nlink, st.st_size, st.st_mtime_ns, st.st_ctime_ns


def remaining():
    need(type(START) in (int, float) and math.isfinite(float(START)), 'invalid armed SHA bootstrap start')
    elapsed = time.monotonic() - START
    need(math.isfinite(elapsed) and 0 <= elapsed < WALL, 'whole-child start/deadline')
    return WALL - elapsed


# Validate the authenticated start immediately at import, before any mirror/control read.
remaining()

def ac():
    raw = subprocess.run(['pmset', '-g', 'batt'], capture_output=True, text=True, timeout=min(10, remaining()))
    need(raw.returncode == 0 and raw.stdout.splitlines()[:1] == ["Now drawing from 'AC Power'"], 'AC power')


def guard(preflight=False, force=False):
    global LAST_ENV_CHECK
    now = time.monotonic()
    remaining()
    need(shutil.disk_usage(S).free >= (PREFLIGHT if preflight else FLOOR), 'disk floor')
    if preflight or force or now - LAST_ENV_CHECK >= ENV_INTERVAL:
        ac()
        lock_raw, _ = read_control(LOCK, 10000)
        need(LOG_NAME.encode() in lock_raw, 'sole recorded lane')
        LAST_ENV_CHECK = now


def open_chain(path, want_directory=True):
    """Open every parent via dirfd O_NOFOLLOW and verify descriptor/path identity."""
    p = pathlib.Path(path)
    need(p.is_absolute(), 'absolute path')
    held = [os.open('/', os.O_RDONLY | os.O_DIRECTORY)]
    fd = held[0]
    parts = p.parts[1:] if want_directory else p.parts[1:-1]
    try:
        for name in parts:
            need(name not in ('', '.', '..'), 'bad path component')
            before = os.stat(name, dir_fd=fd, follow_symlinks=False)
            need(stat.S_ISDIR(before.st_mode), 'symlink/non-directory parent')
            child = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            after = os.fstat(child)
            path_after = os.stat(name, dir_fd=fd, follow_symlinks=False)
            need(same(before) == same(after) == same(path_after), 'directory identity drift')
            held.append(child)
            fd = child
        return held
    except BaseException:
        for item in reversed(held):
            os.close(item)
        raise


def verify_chain(held, path, want_directory=True):
    parts = pathlib.Path(path).parts[1:] if want_directory else pathlib.Path(path).parts[1:-1]
    need(len(held) == len(parts) + 1, 'chain length')
    for parent, child, name in zip(held, held[1:], parts):
        a = os.fstat(child)
        b = os.stat(name, dir_fd=parent, follow_symlinks=False)
        need((a.st_dev, a.st_ino, a.st_mode) == (b.st_dev, b.st_ino, b.st_mode), 'parent chain drift')

def close_chain(held):
    for fd in reversed(held):
        os.close(fd)


def read_control(path, maximum, expected_sha=None):
    held = open_chain(path, False)
    try:
        parent = held[-1]
        name = pathlib.Path(path).name
        before = os.stat(name, dir_fd=parent, follow_symlinks=False)
        need(stat.S_ISREG(before.st_mode) and before.st_nlink == 1 and before.st_size <= maximum, 'unsafe control')
        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent)
        try:
            need(same(os.fstat(fd)) == same(before), 'control open drift')
            data = bytearray()
            while True:
                remaining()
                part = os.read(fd, min(65536, maximum + 1 - len(data)))
                if not part:
                    break
                data.extend(part)
                need(len(data) <= maximum and len(data) <= before.st_size, 'control growth')
            need(len(data) == before.st_size and same(os.fstat(fd)) == same(before) ==
                 same(os.stat(name, dir_fd=parent, follow_symlinks=False)), 'control changed')
            digest = hashlib.sha256(data).hexdigest()
            if expected_sha is not None:
                need(digest == expected_sha, 'control SHA')
            verify_chain(held, path, False)
            return bytes(data), digest
        finally:
            os.close(fd)
    finally:
        close_chain(held)


def command(*args):
    guard()
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    p = subprocess.run(args, cwd=REPO, env=env, capture_output=True, timeout=min(30, remaining()))
    need(p.returncode == 0, f'command failed {args!r}: {p.stderr[-300:]!r}')
    return p.stdout


def source_guard(spec):
    need(command('git', 'rev-parse', 'HEAD').strip().decode() == spec['productionHead'], 'production HEAD')
    need(command('git', 'rev-parse', 'HEAD:src').strip().decode() == spec['productionSrcTree'], 'production source')
    need(command('git', 'status', '--porcelain=v1') == b'', 'dirty production')
    need(command('git', 'remote', 'get-url', 'origin').strip() == b'https://github.com/HSpector1/The-Movies.git', 'origin URL')
    for ref, oid in ((spec['productionRef'], spec['productionHead']),
                     (spec['evidenceRef'], spec['evidenceTip'])):
        need(command('git', 'rev-parse', ref).strip().decode() == oid, 'local ref')
        need(command('git', 'ls-remote', 'origin', ref).strip().decode() == oid+'\t'+ref, 'remote ref')
    need(command('git', 'rev-parse', spec['historicalHCommit']+'^{tree}').strip().decode() == spec['historicalHTree'], 'H tree')
    need(command('git', 'rev-parse', spec['historicalHCommit']+':bridge').strip().decode() == spec['historicalBridgeTree'], 'bridge tree')


def roster(raw):
    out = {}
    for rec in raw.split(b'\0'):
        if not rec:
            continue
        header, name = rec.split(b'\t', 1)
        mode, kind, oid, size = header.decode('ascii').split()
        path = name.decode('utf-8')
        need(kind == 'blob' and mode in ('100644', '100755') and path not in out, 'Git roster entry')
        out[path] = (mode, oid, int(size))
    return out


def build_expected(spec):
    h = spec['historicalHCommit']
    base = roster(command('git', 'ls-tree', '-rl', '-z', h, 'src', 'tests', 'ui', 'package.json',
                          'package-lock.json', 'tsconfig.json', 'tsconfig.src.json',
                          'vitest.config.ts', 'vitest.workspace.ts'))
    bridge = roster(command('git', 'ls-tree', '-rl', '-z', h, 'bridge'))
    need(len(base) == 1342 and sum(x[2] for x in base.values()) == 98114949, 'base count/size')
    need(len(bridge) == 58 and sum(x[2] for x in bridge.values()) == 1357248, 'bridge count/size')
    expected_bridge = {x['path']: (x['mode'], x['oid'], x['bytes']) for x in spec['baseRoster']['bridge']['rows']}
    need(bridge == expected_bridge and set(base).isdisjoint(bridge), 'bridge OID/mode/order roster')
    merged = dict(base)
    merged.update(bridge)
    need(len(merged) == 1400 and sum(x[2] for x in merged.values()) == 99472197, 'merged base')
    overlays = {x['destination']: x for x in spec['overlays']}
    need(len(overlays) == 4, 'overlay count')
    for path, x in overlays.items():
        prior = x['baseline']
        if prior['status'] == 'PRESENT':
            need(path in merged and merged[path] == (prior['gitMode'], prior['gitBlob'], prior['bytes']), 'overlay baseline')
        else:
            need(prior['status'] == 'ABSENT_AT_SOURCE_COMMIT' and path not in merged, 'overlay addition')
        merged[path] = ('OVERLAY', x['sha256'], x['bytes'])
    need(len(merged) == 1402 and sum(x[2] for x in merged.values()) == 99516095, 'final count/size')
    return merged


def check_regular(parent, name, rel, entry):
    mode, expected_hash, expected_size = entry
    before = os.stat(name, dir_fd=parent, follow_symlinks=False)
    need(stat.S_ISREG(before.st_mode) and before.st_nlink == 1 and before.st_size == expected_size, f'unsafe file {rel}')
    need(stat.S_IMODE(before.st_mode) == (0o755 if mode == '100755' else 0o644), f'mode {rel}')
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent)
    try:
        need(same(os.fstat(fd)) == same(before), f'open drift {rel}')
        oid = hashlib.sha1(f'blob {expected_size}\0'.encode())
        sha = hashlib.sha256()
        size = 0
        while True:
            guard()
            part = os.read(fd, 1 << 20)
            if not part:
                break
            size += len(part)
            need(size <= expected_size, f'concurrent growth {rel}')
            oid.update(part)
            sha.update(part)
        need(size == expected_size and same(os.fstat(fd)) == same(before) ==
             same(os.stat(name, dir_fd=parent, follow_symlinks=False)), f'changed file {rel}')
        need((sha.hexdigest() if mode == 'OVERLAY' else oid.hexdigest()) == expected_hash, f'bytes {rel}')
        return [rel, size, oid.hexdigest(), sha.hexdigest(), stat.S_IMODE(before.st_mode)]
    finally:
        os.close(fd)


MAX_ENTRIES = 1500
SCAN_GUARD_EVERY = 16

def bounded_names(fd, state, scan=os.scandir):
    names = []
    count = 0
    guard()
    with scan(fd) as it:
        for item in it:
            count += 1
            state['totalEntries'] += 1
            need(count <= MAX_ENTRIES and state['totalEntries'] <= MAX_ENTRIES,
                 'directory/global entry cap')
            if count % SCAN_GUARD_EVERY == 0:
                guard()
            names.append(item.name)
    guard()
    return sorted(names, key=lambda x: x.encode('utf-8'))

def walk_mirror(spec, expected):
    held = open_chain(MIRROR)
    rootfd = held[-1]
    root_before = same(os.fstat(rootfd))
    seen = {}
    entry_state = {'totalEntries': 0}
    symlink_before = None
    try:
        def descend(fd, prefix):
            nonlocal symlink_before
            guard()
            before = same(os.fstat(fd))
            names = bounded_names(fd, entry_state)
            for name in names:
                need(name not in ('', '.', '..') and '/' not in name, 'entry name')
                rel = prefix + name
                st = os.stat(name, dir_fd=fd, follow_symlinks=False)
                if stat.S_ISDIR(st.st_mode):
                    need(any(x.startswith(rel + '/') for x in expected), f'extra directory {rel}')
                    child = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
                    try:
                        need(same(os.fstat(child)) == same(st), f'directory open drift {rel}')
                        descend(child, rel + '/')
                        need(same(os.fstat(child)) == same(os.stat(name, dir_fd=fd, follow_symlinks=False)), f'directory changed {rel}')
                    finally:
                        os.close(child)
                elif stat.S_ISLNK(st.st_mode):
                    need(rel == 'node_modules' and symlink_before is None and st.st_nlink == 1, 'unexpected link')
                    text = os.readlink(name, dir_fd=fd)
                    need(text == spec['expected']['symlinkText'] and same(st) ==
                         same(os.stat(name, dir_fd=fd, follow_symlinks=False)), 'node link drift')
                    symlink_before = same(st)
                else:
                    need(rel in expected and rel not in seen, f'extra/duplicate file {rel}')
                    seen[rel] = check_regular(fd, name, rel, expected[rel])
            need(same(os.fstat(fd)) == before, f'directory mutated {prefix}')
        descend(rootfd, '')
        need(set(seen) == set(expected) and symlink_before is not None and
             len(seen) < entry_state['totalEntries'] <= MAX_ENTRIES, 'missing files/link or entry count')
        need(same(os.fstat(rootfd)) == root_before, 'mirror root mutated')
        link_now = os.stat('node_modules', dir_fd=rootfd, follow_symlinks=False)
        need(link_now.st_nlink == 1 and same(link_now) == symlink_before and
             os.readlink('node_modules', dir_fd=rootfd) == spec['expected']['symlinkText'], 'node link postflight')
        digest = hashlib.sha256()
        total = 0
        for rel in sorted(seen, key=lambda x: x.encode('utf-8')):
            row = seen[rel]
            digest.update(json.dumps(row, separators=(',', ':')).encode('utf-8') + b'\n')
            total += row[1]
        need(len(seen) == 1402 and total == 99516095, 'final counts')
        verify_chain(held, MIRROR)
        return digest.hexdigest(), total, root_before, symlink_before
    finally:
        close_chain(held)


def matches_original_link(link_id, text, original):
    return list(link_id) + [text] == original

def write_receipt(payload):
    need(not os.path.lexists(OUT), 'output exists')
    OUT.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    held = open_chain(OUT, False)
    try:
        parent = held[-1]
        need(not os.path.lexists(OUT), 'output collision')
        fd = os.open(OUT.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=parent)
        try:
            raw = (json.dumps(payload, sort_keys=True, indent=2) + '\n').encode()
            view = memoryview(raw)
            while view:
                view = view[os.write(fd, view):]
            os.fsync(fd)
        finally:
            os.close(fd)
        os.fsync(parent)
        readback, got = read_control(OUT, 100000)
        need(readback == raw, 'receipt readback')
        return got
    finally:
        close_chain(held)


def verify_lane_lines(meta, lane_raw, result_sha, source_status, recorder):
    lines = meta.splitlines()
    terminal = [line for line in lines if line.startswith(b'end, exit ')]
    need(len(terminal) == 1 and lines[-1] == terminal[0] and
         terminal[0].startswith(b'end, exit 0; '), 'unique final addendum lane child exit')
    need(b'Traceback' not in lane_raw, 'lane traceback')
    source_lines = []
    recorder_lines = []
    for line in lane_raw.splitlines():
        try:
            item = json.loads(line)
        except (ValueError, TypeError):
            continue
        if isinstance(item, dict) and 'resultSha256' in item:
            source_lines.append(item)
        if isinstance(item, dict) and 'recorderStatus' in item:
            recorder_lines.append(item)
    need(len(source_lines) == 1 and source_lines[0].get('resultSha256') == result_sha and
         source_lines[0].get('status') == source_status, 'lane/source result identity')
    need(len(recorder_lines) == 1 and recorder_lines[0].get('recorderStatus') == recorder['status'] and
         recorder_lines[0].get('childExit') == 0 and recorder_lines[0].get('groupClear') is True,
         'lane/recorder identity')


def check_recorder_review_routes(binding):
    recorder_reviews = (
        ('recorderStaticReviewPath', 'recorderStaticReviewSha256', 'recorderStaticDecision',
         S/'1370-c0-h-bridge-addendum-recorder-independent-static-review-r4/RECEIPT.json',
         RECORDER_STATIC_SHA, 'ACCEPT_STATIC_RECORDER_ONLY'),
        ('recorderExactReviewPath', 'recorderExactReviewSha256', 'recorderExactDecision',
         S/'1370-c0-h-bridge-addendum-filled-launch-independent-exact-review-r4/RECEIPT.json',
         '4fb1bc329324b19d2287130aa9cad161b48198924c9516915ccd1e3bbd293980',
         'ACCEPT_EXACT_H_BRIDGE_RECORDER_ONLY'))
    for path_key, sha_key, decision_key, expected_path, expected_sha, expected_decision in recorder_reviews:
        review_path = pathlib.Path(binding[path_key])
        need(review_path == expected_path and binding[sha_key] == expected_sha and
             binding[decision_key] == expected_decision, 'recorder review route')
        review_raw, _ = read_control(review_path, 100000, expected_sha)
        need(json.loads(review_raw)['decision'] == expected_decision, 'recorder independent review')


def main():
    need(START is not None and remaining() <= WALL, 'bootstrap timer')
    guard(preflight=True)
    need(not os.path.lexists(OUT), 'one-shot output exists')
    spec = json.loads(read_control(SPEC, 100000, SPEC_SHA)[0])
    need(BINDING == S/'1370-c0-h-bridge-full-readback-filled-exact-r5/BINDING.json', 'filled binding path')
    binding = json.loads(read_control(BINDING, 100000)[0])
    authority = spec['acceptedAddendum']
    need(binding.get('bridgeAddendumResultSha256') == authority['sourceResultSha256'] and
         binding.get('bridgeRecorderResultSha256') == authority['recorderR4ResultSha256'] and
         binding.get('recorderStaticReviewSha256') == authority['recorderR4StaticReviewSha256'] and
         binding.get('independentBridgeExactLaunchReviewSha256') == authority['exactLaunchReviewSha256'] and
         binding.get('bridgeObservedReviewSha256') == authority['observedSourceReviewSha256'] and
         binding.get('bridgeAddendumLaneLogSha256') == authority['laneLogSha256'] and
         binding.get('bridgeAddendumLaneMetaSha256') == authority['laneMetaSha256'], 'spec/addendum binding authority')
    required = ('bridgeAddendumResultPath', 'bridgeAddendumResultSha256', 'bridgeAddendumLaneMetaSha256',
                'bridgeAddendumLaneLogSha256', 'bridgeRecorderResultPath', 'bridgeRecorderResultSha256',
                'recorderStaticReviewPath', 'recorderStaticReviewSha256', 'recorderStaticDecision',
                'recorderExactReviewPath', 'recorderExactReviewSha256', 'recorderExactDecision',
                'independentBridgeExactLaunchReviewPath', 'independentBridgeExactLaunchReviewSha256',
                'bridgeObservedReviewPath', 'bridgeObservedReviewSha256', 'bridgeObservedDecision')
    need(all(isinstance(binding.get(k), str) and binding[k] for k in required), 'unfilled addendum binding')
    exact_path = pathlib.Path(binding['independentBridgeExactLaunchReviewPath'])
    need(exact_path.is_absolute() and exact_path.is_relative_to(S) and
         'independent-exact-review-r1' not in str(exact_path) and
         'independent-exact-review-r2' not in str(exact_path), 'retracted addendum exact review')
    exact_raw, _ = read_control(exact_path, 100000, binding['independentBridgeExactLaunchReviewSha256'])
    need(json.loads(exact_raw)['decision'] == 'ACCEPT_EXACT_H_BRIDGE_RECORDER_ONLY',
         'addendum exact review')
    observed_path = pathlib.Path(binding['bridgeObservedReviewPath'])
    need(observed_path.is_absolute() and observed_path.is_relative_to(S) and
         'h-bridge-addendum' in str(observed_path), 'bridge observed review path')
    observed_raw, _ = read_control(observed_path, 100000, binding['bridgeObservedReviewSha256'])
    observed = json.loads(observed_raw)
    need(binding['bridgeObservedReviewPath'] == str(S/'1370-c0-h-bridge-addendum-independent-observed-source-review-r1/RECEIPT.json') and
         binding['bridgeObservedReviewSha256'] == 'f2baf6d6f44b3582f3a70384c1c3acae2a328de254101dad076d428c9ea57a9d' and
         observed.get('decision') == 'ACCEPT_OBSERVED_H_BRIDGE_SOURCE_ROUTE_ONLY' and
         observed['sourceResultSha256'] == binding['bridgeAddendumResultSha256'] and
         observed['recorderResultSha256'] == binding['bridgeRecorderResultSha256'] and
         observed['laneLogSha256'] == binding['bridgeAddendumLaneLogSha256'] and
         observed['laneMetaSha256'] == binding['bridgeAddendumLaneMetaSha256'] and
         observed['exactLaunchReceiptSha256'] == binding['independentBridgeExactLaunchReviewSha256'] and
         observed['productionHead'] == spec['productionHead'] and
         observed['productionSourceTree'] == spec['productionSrcTree'] and
         observed['bridgeTree'] == spec['historicalBridgeTree'] and
         observed['bridgeStatFiles'] == 58 and observed['bridgeStatBytes'] == 1357248,
         'independent observed addendum proof')
    need(binding.get('bridgeStaticReviewSha256') == STATIC_SHA and
         binding.get('bridgeInputsSha256') == '2598b0c372eed48d9be04192eb7e33aa52e398a9323d4e2155c176e4cce5efaa', 'bridge authority')
    need(binding['bridgeAddendumResultPath'] == str(S/'1370-c0-h-bridge-addendum-results-r3/20261008-h-bridge-addendum-r3.RESULT.json'), 'result path')
    need(binding['recorderStaticReviewPath'] == str(S/'1370-c0-h-bridge-addendum-recorder-independent-static-review-r4/RECEIPT.json') and
         binding['recorderStaticReviewSha256'] == RECORDER_STATIC_SHA and
         binding['recorderStaticDecision'] == 'ACCEPT_STATIC_RECORDER_ONLY', 'r4 recorder static authority')
    recorder_review_raw, _ = read_control(S/'1370-c0-h-bridge-addendum-recorder-independent-static-review-r4/RECEIPT.json',
                                          100000, RECORDER_STATIC_SHA)
    recorder_review = json.loads(recorder_review_raw)
    need(recorder_review['decision'] == 'ACCEPT_STATIC_RECORDER_ONLY' and
         recorder_review['supervisorSha256'] == RECORDER_SOURCE_SHA, 'r4 recorder source receipt')
    read_control(S/'1370-c0-h-bridge-addendum-recorder-proposal-r4/supervise.py',
                 100000, RECORDER_SOURCE_SHA)
    recorder_path = pathlib.Path(binding['bridgeRecorderResultPath'])
    need(recorder_path == S/'1370-c0-h-bridge-addendum-recorder-results-r4/20261008-h-bridge-addendum-r3.RECORDER-RESULT.json',
         'recorder r3 exact path')
    check_recorder_review_routes(binding)
    recorder_raw, _ = read_control(recorder_path, 100000, binding['bridgeRecorderResultSha256'])
    recorder = json.loads(recorder_raw)
    need(recorder['schema'] == '1370-c0-h-bridge-addendum-recorder-result-r4' and
         recorder['status'] == 'CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' and
         recorder['childExit'] == 0 and recorder['groupClear'] is True and
         0 <= recorder['elapsedSeconds'] <= recorder['recorderWholeSeconds'] == 210 and
         recorder['recorderActiveSeconds'] == 200 and recorder['sourceDeadlineSeconds'] == 180 and
         recorder['sourceSha256'] == '72a9bf9f6567afac320373532486c6bfd40663cf019eadb93d32db73a651678d' and
         recorder['staticReviewSha256'] == STATIC_SHA and
         recorder['productionHead'] == spec['productionHead'] and
         'error' not in recorder and 'cleanupError' not in recorder,
         'r3 recorder child/timeout/survivor/source')
    raw, result_sha = read_control(pathlib.Path(binding['bridgeAddendumResultPath']), 100000,
                                   binding['bridgeAddendumResultSha256'])
    result = json.loads(raw)
    need(result['schema'] == '1370-c0-h-bridge-addendum-result-r3' and
         result['status'] == 'BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK' and
         result['sourceCommit'] == spec['historicalHCommit'] and
         result['bridgeTree'] == spec['historicalBridgeTree'] and
         result['bridgeFiles'] == 58 and result['bridgeBytes'] == 1357248 and
         result['bridgeInputsSha256'] == binding['bridgeInputsSha256'] and
         result['staticReviewSha256'] == STATIC_SHA and
         result['productionHead'] == spec['productionHead'] and
         result['observedTypeStopReceiptSha256'] == spec['acceptedPrior']['typeStopObservedReceiptSha256'] and
         result['originalMaterializerResultSha256'] == spec['acceptedPrior']['originalMirrorResultSha256'] and
         result['oldMirrorProof']['fileProofDigestSha256'] == spec['acceptedPrior']['originalFileProofDigestSha256'] and
         result['oldMirrorProof']['mirrorFiles'] == 1344 and
         result['oldMirrorProof']['mirrorBytes'] == 98158847,
         'addendum result status/source/roster')
    meta, _ = read_control(S/'c0-h-bridge-addendum-20261008-r3.lane.log.meta',
                           100000, binding['bridgeAddendumLaneMetaSha256'])
    lane_raw, _ = read_control(S/'c0-h-bridge-addendum-20261008-r3.lane.log',
                               100000, binding['bridgeAddendumLaneLogSha256'])
    verify_lane_lines(meta, lane_raw, result_sha, result['status'], recorder)
    read_control(S/'1370-c0-h-bridge-addendum-proposal-r3/BRIDGE-INPUTS.json',
                 100000, binding['bridgeInputsSha256'])
    review, _ = read_control(S/'1370-c0-h-bridge-addendum-independent-static-review-r3/RECEIPT.json',
                             100000, STATIC_SHA)
    need(json.loads(review)['decision'] == 'ACCEPT_STATIC_H_BRIDGE_ADDENDUM_ONLY', 'bridge static review')
    source_guard(spec)
    original, _ = read_control(S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1.MATERIALIZE-RESULT.json',
                               100000, spec['acceptedPrior']['originalMirrorResultSha256'])
    need(json.loads(original)['status'] == 'MIRROR_MATERIALIZED_SOURCE_ONLY', 'original source result')
    read_control(S/'1370-c0-h-mirror-independent-readback-r1/READBACK.json',
                 100000, spec['acceptedPrior']['originalReadbackReceiptSha256'])
    read_control(S/'1370-c0-h-typecheck-independent-observed-stop-review-r1/RECEIPT.json',
                 100000, spec['acceptedPrior']['typeStopObservedReceiptSha256'])
    type_raw, _ = read_control(S/'1370-c0-h-typecheck-collection-results-r5/20261008-h-types-r3/RESULT.json',
                               100000, '3eb6294278eda61893738cdc1ee5b6a80c44ced5a3cd9fd7197511bbb6198216')
    type_result = json.loads(type_raw)
    need(type_result['status'] == 'STOP_TYPECHECK_COLLECTION' and
         type_result['sourceAfter']['fileProofDigestSha256'] == spec['acceptedPrior']['originalFileProofDigestSha256'] and
         result['oldMirrorProof']['dependencyLink'] == type_result['sourceAfter']['dependencyLink'],
         'original failed type proof and exact dependency link')
    manifest_raw, _ = read_control(S/'1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json',
                                    100000, spec['acceptedPrior']['sourceManifestSha256'])
    manifest = json.loads(manifest_raw)
    overlay_keys = ('destination', 'bytes', 'sha256', 'baseline')
    need([{k:x[k] for k in overlay_keys} for x in manifest['files']] == spec['overlays'], 'overlay manifest row drift')
    source_review_raw, _ = read_control(S/'1370-c0-h-m0-corrected-overlay-source-manifest-independent-review-r2/H-RECEIPT.json',
                                         100000, spec['acceptedPrior']['sourceManifestReviewSha256'])
    need(json.loads(source_review_raw)['decision'] == 'ACCEPT_STATIC_FULL_ERA_OBSERVER_ONLY', 'H source review')
    stop_raw, _ = read_control(S/'1370-c0-h-bridge-full-readback-independent-observed-stop-review-r4/RECEIPT.json',
                               100000, '8d7c904eefdaacc5e8905c2a3166d80907768cb7c97c75d46be1c26de98beec6')
    stopped = json.loads(stop_raw)
    need(stopped['decision'] == 'ACCEPT_OBSERVED_STOP_H_BRIDGE_FULL_READBACK_R4' and
         stopped['falseRejectPath'] == str(S/'1370-c0-h-bridge-addendum-filled-launch-independent-exact-review-r4/RECEIPT.json') and
         stopped['error'] == "RuntimeError('recorder review route')" and
         stopped['readbackStopSha256'] == '349ef1efedf574a9fc104222f774acaef4b2e9ceead55cdabf67a8644c7380d1' and
         stopped['readbackSourceSha256'] == 'c66b395388c5d49527d719d454bf870291d908c582e02609dd4ec0306548ad94',
         'preserved r4 observed STOP attribution')
    expected = build_expected(spec)
    proof, total, root_id, link_id = walk_mirror(spec, expected)
    need(matches_original_link(link_id, spec['expected']['symlinkText'],
                               type_result['sourceAfter']['dependencyLink']),
         'post-addendum node link identity drift')
    source_guard(spec)
    guard(force=True)
    read_control(pathlib.Path(binding['bridgeAddendumResultPath']), 100000, result_sha)
    payload = {'decision': 'SOURCE_BYTES_CHECKED_OBSERVED_REVIEW_PENDING', 'sourceCommit': spec['historicalHCommit'],
               'sourceTree': spec['historicalHTree'], 'bridgeTree': spec['historicalBridgeTree'],
               'addendumResultSha256': result_sha, 'recorderResultSha256': binding['bridgeRecorderResultSha256'],
               'productionHead': spec['productionHead'], 'productionSrcTree': spec['productionSrcTree'],
               'evidenceTip': spec['evidenceTip'], 'sourceManifestSha256': spec['acceptedPrior']['sourceManifestSha256'],
               'regularFiles': 1402, 'regularBytes': total,
               'symlinks': 1, 'fileProofDigestSha256': proof, 'mirrorRootIdentity': root_id,
               'nodeModulesLinkIdentity': link_id, 'elapsedSeconds': round(time.monotonic()-START, 3),
               'claimLimit': spec['claimLimit']}
    receipt_sha = write_receipt(payload)
    print(json.dumps({'decision': payload['decision'], 'receiptSha256': receipt_sha,
                      'regularFiles': 1402, 'regularBytes': total}, sort_keys=True), flush=True)


if __name__ == '__main__':
    try:
        main()
    except BaseException as error:
        # A caught refusal gets a one-shot STOP receipt only if the output can be opened safely.
        # Abrupt termination and expired deadlines remain visible in raw lane/meta.
        try:
            if START is not None and remaining() > 2 and not os.path.lexists(OUT):
                stop = {'decision': 'STOP_H_BRIDGE_FULL_READBACK', 'error': repr(error),
                        'claimLimit': 'No H bridge source acceptance from this failed readback'}
                write_receipt(stop)
        except BaseException:
            pass
        raise
