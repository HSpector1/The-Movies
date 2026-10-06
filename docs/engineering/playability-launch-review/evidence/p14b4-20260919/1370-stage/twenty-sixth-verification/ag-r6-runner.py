"""One source-bound AG/E0G full-state types or clean leaf. Never run without reviewed bootstrap."""
import argparse
import hashlib
import json
import os
import re
import shutil
import signal
import stat
import subprocess
import sys
import time
from pathlib import Path

assert sys.flags.isolated and sys.dont_write_bytecode
assert isinstance(_AUTHENTICATED_RUNNER_BYTES, bytes)
assert isinstance(_AUTHENTICATED_MANIFEST_BYTES, bytes)
assert isinstance(_AUTHENTICATED_REVIEW_BYTES, bytes)
assert callable(_AUTHENTICATED_VERIFY_RUNTIME)

ROOT = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-proposal-r6')
REVIEW = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-independent-review-r6/RECEIPT.json')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
OUT = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r6')
BRANCH = 'refs/heads/wip/headless-program-20260916-ts'

def sha(raw): return hashlib.sha256(raw).hexdigest()
def file_sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''): digest.update(chunk)
    return digest.hexdigest()
def write(path, value):
    with path.open('x') as stream:
        json.dump(value, stream, sort_keys=True, indent=2)
        stream.write('\n')

def inventory(root):
    files, dirs, links = {}, [], {}
    for base, sub, names in os.walk(root, followlinks=False):
        folder = Path(base)
        for name in list(sub):
            path = folder / name; rel = path.relative_to(root).as_posix(); mode = path.lstat().st_mode
            if stat.S_ISLNK(mode): links[rel] = os.readlink(path); sub.remove(name)
            else: assert stat.S_ISDIR(mode); dirs.append(rel)
        for name in names:
            path = folder / name; rel = path.relative_to(root).as_posix(); mode = path.lstat().st_mode
            if stat.S_ISLNK(mode): links[rel] = os.readlink(path)
            else:
                assert stat.S_ISREG(mode) and path.stat().st_nlink == 1
                if rel != 'MANIFEST.json': files[rel] = file_sha(path)
    return {'files': files, 'directories': sorted(dirs), 'links': links}

def git(*args): return subprocess.check_output(['git', *args], cwd=REPO, timeout=15).decode().strip()
def check_environment(manifest, phase):
    assert phase in ('pre', 'post')
    free = shutil.disk_usage(ROOT).free
    minimum = manifest['diskReserve']['preflightFreeBytes'] if phase == 'pre' else manifest['diskReserve']['runningFloorBytes']
    assert free >= minimum, 'STOP: disk reserve below required clean-route bound'
    power = subprocess.check_output(['pmset', '-g', 'batt'], timeout=5).decode()
    assert "Now drawing from 'AC Power'" in power, 'STOP: AC power unavailable'
    return 'AC Power'

def guard(manifest, phase):
    power = check_environment(manifest, phase)
    assert file_sha(ROOT / 'MANIFEST.json') == manifest['manifestSha256']
    assert (ROOT / 'runner.py').read_bytes() == _AUTHENTICATED_RUNNER_BYTES
    assert inventory(ROOT) == manifest['inventory'], 'source/package inventory drift'
    for name, pin in manifest['externalPins'].items():
        assert file_sha(pin['path']) == pin['sha256'], name
    assert git('rev-parse', 'HEAD') == manifest['head']
    assert git('rev-parse', 'HEAD:src') == manifest['headSourceTree']
    assert git('status', '--porcelain=v1') == ''
    assert git('ls-remote', '--exit-code', 'origin', BRANCH) == manifest['head'] + '\t' + BRANCH
    return {'power':power, 'head': manifest['head'], 'sourceTree': manifest['headSourceTree'],
            'inventorySha256': sha(json.dumps(manifest['inventory'], sort_keys=True).encode()),
            'runtimeDigest': _AUTHENTICATED_VERIFY_RUNTIME(ROOT, manifest)}

def alive(group):
    try: os.killpg(group, 0); return True
    except ProcessLookupError: return False

def stop(group):
    if not alive(group): return True
    try: os.killpg(group, signal.SIGTERM)
    except ProcessLookupError: return True
    for _ in range(30):
        if not alive(group): return True
        time.sleep(.1)
    try: os.killpg(group, signal.SIGKILL)
    except ProcessLookupError: return True
    for _ in range(30):
        if not alive(group): return True
        time.sleep(.1)
    return False

def child(command, cwd, env, leaf, cap):
    process = None
    with (leaf / 'child.stdout.log').open('xb') as stdout, (leaf / 'child.stderr.log').open('xb') as stderr:
        try:
            process = subprocess.Popen(command, cwd=cwd, env=env, stdout=stdout, stderr=stderr,
                                       start_new_session=True)
            write(leaf / 'LAUNCH.json', {'pid': process.pid, 'pgid': process.pid,
                'startNewSession': True, 'command': command, 'cwd': cwd})
            try: process.wait(timeout=cap)
            except subprocess.TimeoutExpired: raise TimeoutError('child wall-clock cap')
            return {'exit': process.returncode, 'timedOut': False, 'elapsedCapSeconds': cap}
        finally:
            if process is not None:
                stopped = stop(process.pid)
                try: process.wait(timeout=5)
                except subprocess.TimeoutExpired: stopped = False
                assert stopped and not alive(process.pid), 'child group survived cleanup'

def verify_clean(leaf, role, seed):
    summary_path = leaf / 'summary.json'; boundaries = leaf / 'boundaries.ndjson'
    progress = leaf / 'progress.ndjson'; vitest = leaf / 'vitest.json'
    assert all(p.is_file() and not p.is_symlink() for p in (summary_path, boundaries, progress, vitest))
    summary = json.loads(summary_path.read_bytes())
    assert summary['role'] == role and summary['seed'] == seed
    assert summary['ticks'] == 416 and summary['boundaries'] == 417 and summary['progressRows'] == 8
    assert summary['version'] == (45 if role == 'AG' else 46)
    digest = hashlib.sha256(); count = 0; weeks = []
    with boundaries.open('rb') as stream:
        for line in stream:
            assert line.endswith(b'\n') and len(line) <= 16 * 1024 * 1024
            row = json.loads(line); assert row['boundary'] == count and row['week'] == count
            assert row['role'] == role and row['seed'] == seed
            assert row['save']['saveVersion'] == summary['version']
            proof = row['emptyProof']
            assert proof['cuttingNull'] == (proof['businesses'] if role == 'E0G' else 0)
            assert proof['positiveZeroRefund'] == (proof['periods'] if role == 'E0G' else 0)
            digest.update(line); count += 1; weeks.append(row['week'])
    assert count == 417 and summary['boundarySha256'] == digest.hexdigest()
    assert summary['boundaryBytes'] == boundaries.stat().st_size <= 1024 * 1024 * 1024
    progress_rows = [json.loads(line) for line in progress.read_text().splitlines()]
    assert [r['week'] for r in progress_rows] == [52, 104, 156, 208, 260, 312, 364, 416]
    test = json.loads(vitest.read_bytes())
    assert test['numTotalTests'] == 1 and test['numPassedTests'] == 1 and test['numFailedTests'] == 0
    return {'summarySha256': file_sha(summary_path), 'boundariesSha256': file_sha(boundaries),
            'progressSha256': file_sha(progress), 'vitestSha256': file_sha(vitest),
            'boundaryCount': count, 'terminal': summary['terminal']}

def verify_types_receipt(manifest, arm, seed):
    key = arm.lower() + '-' + ('p13a' if seed == 'p13a-core-causal-01' else 'adoption')
    evidence = manifest['typesEvidence'][key]
    audit_pin = manifest['typesAudit']
    review_path = Path(audit_pin['reviewPath'])
    receipt_path = Path(audit_pin['receiptPath'])
    assert review_path.is_file() and not review_path.is_symlink() and file_sha(review_path) == audit_pin['reviewSha256']
    assert receipt_path.is_file() and not receipt_path.is_symlink() and file_sha(receipt_path) == audit_pin['receiptSha256']
    reviewed = json.loads(receipt_path.read_bytes())
    assert reviewed['decision'] == 'ACCEPT_OBSERVED_TYPES_ONLY'
    assert reviewed['reportSha256'] == audit_pin['reviewSha256']
    assert reviewed['manifestSha256'] == audit_pin['typesManifestSha256']
    assert reviewed['reviewReceiptSha256'] == audit_pin['typesStaticReviewReceiptSha256']
    assert reviewed['runIds'] == sorted(row['runId'] for row in manifest['typesEvidence'].values())
    run_id = evidence['runId']
    assert reviewed['targetResults'][run_id] == evidence['targetResultSha256']
    assert reviewed['outerResults'][run_id] == evidence['outerResultSha256']
    target = Path(evidence['targetResultPath']); outer = Path(evidence['outerResultPath'])
    assert target.is_file() and outer.is_file() and not target.is_symlink() and not outer.is_symlink()
    assert target.is_relative_to(Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-types-recorded-r4'))
    assert outer.is_relative_to(Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-types-outer-recorded-r4'))
    assert file_sha(target) == evidence['targetResultSha256'] and file_sha(outer) == evidence['outerResultSha256']
    t = json.loads(target.read_bytes()); o = json.loads(outer.read_bytes())
    assert t['status'] == o['status'] == 'STAGE_PASS' and t['stagePassed'] is True and o['stagePassed'] is True
    assert t['stage'] == o['stage'] == 'types' and t['arm'] == o['arm'] == arm and t['seed'] == o['seed'] == seed
    assert t['manifestSha256'] == o['manifestSha256'] == audit_pin['typesManifestSha256']
    assert o['targetResultSha256'] == evidence['targetResultSha256']
    assert t['preflight'] == t['postflight']
    return {'observedAuditReceiptSha256':audit_pin['receiptSha256'], 'typesRunId':run_id,
            'targetResultSha256':evidence['targetResultSha256'], 'outerResultSha256':evidence['outerResultSha256']}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--arm', choices=('AG', 'E0G'), required=True)
    parser.add_argument('--seed', choices=('p13a-core-causal-01', 'p13-public-commercial-adoption'), required=True)
    parser.add_argument('--stage', choices=('clean',), required=True)
    parser.add_argument('--run-id', required=True)
    args = parser.parse_args()
    assert re.fullmatch(r'[a-z0-9-]{1,48}', args.run_id)
    manifest = json.loads(_AUTHENTICATED_MANIFEST_BYTES)
    assert manifest['schema'] == '1370-ag-e0g-full-state-clean-r6'
    manifest['manifestSha256'] = sha(_AUTHENTICATED_MANIFEST_BYTES)
    assert json.loads(_AUTHENTICATED_REVIEW_BYTES) == {'decision': 'ACCEPT_STATIC_CLEAN_ONLY',
        'manifestSha256': manifest['manifestSha256'], 'runnerSha256': manifest['inventory']['files']['runner.py'],
        'outerSha256': manifest['inventory']['files']['outer.py'], 'commandSha256':os.environ['NEUTRALITY_COMMAND_SHA256']}
    assert REVIEW.read_bytes() == _AUTHENTICATED_REVIEW_BYTES
    seed_tag = 'p13a' if args.seed == 'p13a-core-causal-01' else 'adoption'
    leaf = OUT / f'{args.arm.lower()}-{seed_tag}-{args.stage}-{args.run_id}'
    assert not os.path.lexists(leaf)
    leaf.mkdir(parents=True)
    result = {'schema': '1370-ag-e0g-full-state-clean-leaf-route-r6', 'classification':
        'ORIGINAL_CAP_DIAGNOSTIC' if seed_tag == 'p13a' else 'EXPLORATORY_720_750',
        'arm': args.arm, 'seed': args.seed, 'stage': args.stage, 'head': manifest['head'],
        'manifestSha256': manifest['manifestSha256'], 'status': 'UNCLASSIFIED', 'stagePassed': False}
    error = None
    try:
        result['preflight'] = guard(manifest, 'pre')
        result['typesAdmission'] = verify_types_receipt(manifest, args.arm, args.seed)
        runtime = manifest['runtime']; node = runtime['nodePath']
        tree = ROOT / 'arms' / args.arm / 'tree'
        env = os.environ.copy()
        env['NEUTRALITY_ARM'] = args.arm; env['NEUTRALITY_SEED'] = args.seed
        env['NEUTRALITY_BOUNDARIES'] = str(leaf / 'boundaries.ndjson')
        env['NEUTRALITY_SUMMARY'] = str(leaf / 'summary.json')
        env['NEUTRALITY_PROGRESS'] = str(leaf / 'progress.ndjson')
        command = [node, runtime['vitestPath'], 'run', '--config', 'vitest.neutrality.config.ts',
                   '--reporter=json', '--outputFile', str(leaf / 'vitest.json')]
        cap = 300 if seed_tag == 'p13a' else 720
        result['child'] = child(command, str(tree), env, leaf, cap)
        assert result['child']['exit'] == 0, 'child exited nonzero'
        result['childStdoutSha256'] = file_sha(leaf / 'child.stdout.log')
        result['childStderrSha256'] = file_sha(leaf / 'child.stderr.log')
        result['cleanArtifacts'] = verify_clean(leaf, args.arm, args.seed)
        result['postflight'] = guard(manifest, 'post')
        assert result['preflight'] == result['postflight']
        result['status'] = 'STAGE_PASS'; result['stagePassed'] = True
    except Exception as exc:
        error = exc
        result['status'] = 'CHILD_TIMEOUT' if isinstance(exc, TimeoutError) else 'STAGE_OR_GUARD_FAILURE'
        result['timedOut'] = isinstance(exc, TimeoutError)
        result['error'] = repr(exc)
    finally:
        result['finishedUtc'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        write(leaf / 'RESULT.json', result)
        write(leaf / 'RESULT.sha256.json', {'sha256': file_sha(leaf / 'RESULT.json')})
    print(json.dumps({'status': result['status'], 'resultSha256': file_sha(leaf / 'RESULT.json')}, sort_keys=True))
    if error is not None: raise SystemExit(1)

if __name__ == '__main__': main()
