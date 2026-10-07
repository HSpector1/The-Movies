"""One source-bound AG/E0G full-state types or clean leaf. Never run without reviewed bootstrap."""
import argparse
import hashlib
import zlib
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

ROOT = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-proposal-r12')
REVIEW = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-independent-review-r12/RECEIPT.json')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
OUT = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r12')
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

def inventory(root, exclude_manifest=False):
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
                if not (exclude_manifest and rel == 'MANIFEST.json'):
                    files[rel] = file_sha(path)
    return {'files': files, 'directories': sorted(dirs), 'links': links}

def arm_inventory(manifest, arm):
    prefix = f'arms/{arm}/tree/'
    dirs = [p[len(prefix):] for p in manifest['inventory']['directories'] if p.startswith(prefix)]
    return {'files': {p[len(prefix):]: digest for p, digest in manifest['inventory']['files'].items()
                      if p.startswith(prefix)}, 'directories': sorted(dirs),
            'links': {p[len(prefix):]: target for p, target in manifest['inventory']['links'].items()
                      if p.startswith(prefix)}}

def verify_mirror(mirror, expected):
    assert mirror.is_dir() and not mirror.is_symlink(), 'runtime mirror root object'
    actual = inventory(mirror, exclude_manifest=False)
    assert actual == expected, 'runtime mirror differs from authenticated arm tree'
    return sha(json.dumps(actual, sort_keys=True).encode())

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
    assert inventory(ROOT, exclude_manifest=True) == manifest['inventory'], 'source/package inventory drift'
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

def gzip_member_rows(path):
    # A gzip member must contain exactly one complete original NDJSON row.
    with path.open('rb') as compressed:
        data = compressed.read(65536)
        while data:
            decoder = zlib.decompressobj(wbits=31)
            raw = bytearray()
            while not decoder.eof:
                assert len(raw) <= 16 * 1024 * 1024, 'gzip member raw bound'
                block = decoder.decompress(data, 16 * 1024 * 1024 + 1 - len(raw))
                raw.extend(block)
                assert len(raw) <= 16 * 1024 * 1024, 'gzip member raw bound'
                if decoder.eof:
                    data = decoder.unused_data
                else:
                    data = decoder.unconsumed_tail or compressed.read(65536)
                    assert data, 'truncated gzip member'
            assert bytes(raw).endswith(b'\n') and raw.count(b'\n') == 1, 'one newline-terminated row per gzip member'
            yield bytes(raw)
            if not data: data = compressed.read(65536)

def verify_inner_row(row, role, seed, boundary):
    required = {'boundary','week','role','seed','originalStateSha256','originalState',
        'save','serializedSaveSha256','owner','emptyProof','rng',
        'marketReceiptCount','industryReceiptCount'}
    assert type(row) is dict and set(row) == required, 'complete boundary field set'
    assert row['boundary'] == row['week'] == boundary
    assert row['role'] == role and row['seed'] == seed
    for name in ('originalStateSha256','serializedSaveSha256'):
        assert type(row[name]) is str and re.fullmatch(r'[0-9a-f]{64}', row[name]), name
    state = row['originalState']; save = row['save']
    assert type(state) is dict and type(save) is dict
    assert state['seed'] == save['seed'] == seed
    assert save['saveVersion'] == (45 if role == 'AG' else 46)
    assert save['state'] == state, 'detached save state differs from original state'
    assert state['market']['tick'] == boundary
    assert row['rng'] == state['rngState']
    market_receipts = state['talentMarket']['receipts']
    assert type(market_receipts) is list and type(row['marketReceiptCount']) is int
    assert row['marketReceiptCount'] == len(market_receipts)
    hollywood = state.get('hollywood')
    businesses = [] if hollywood is None else hollywood['businesses']
    industry_receipts = [] if hollywood is None else hollywood['receipts']
    assert type(businesses) is list and type(industry_receipts) is list
    assert type(row['industryReceiptCount']) is int and row['industryReceiptCount'] == len(industry_receipts)
    assert all(type(receipt) is dict and receipt.get('kind') != 'facilityDisposed'
               for receipt in industry_receipts)
    proof = row['emptyProof']
    assert type(proof) is dict and set(proof) == {'businesses','periods','cuttingNull','positiveZeroRefund'}
    periods = 0; cutting = 0; refunds = 0; owner = []
    for business in businesses:
        assert type(business) is dict and type(business['account']) is dict
        account = business['account']; entries = account['periods']
        assert type(entries) is list
        if role == 'E0G':
            assert 'costCutting' in business
            c = business['costCutting']
            assert type(c) is dict and list(c) == ['version','since']
            assert type(c['version']) is int and c['version'] == 1 and c['since'] is None
            cutting += 1
        else:
            assert 'costCutting' not in business
        projected = {}
        if 'studioId' in business: projected['studioId'] = business['studioId']
        if 'cash' in account: projected['cash'] = account['cash']
        projected['account'] = account
        projected['costCutting'] = business.get('costCutting')
        for field in ('productions','runs','activeScriptOrdinals','nextDecisionWeek'):
            if field in business: projected[field] = business[field]
        owner.append(projected)
        for period in entries:
            assert type(period) is dict and type(period['movements']) is dict
            movements = period['movements']; periods += 1
            if role == 'E0G':
                assert 'facilityDemolitionRefund' in movements
                amount = movements['facilityDemolitionRefund']
                assert type(amount) in (int,float) and amount == 0
                refunds += 1
            else:
                assert 'facilityDemolitionRefund' not in movements
    expected_proof = {'businesses':len(businesses),'periods':periods,
        'cuttingNull':cutting,'positiveZeroRefund':refunds}
    assert proof == expected_proof, 'representation proof disagrees with state'
    assert row['owner'] == (owner if hollywood is not None else None), 'owner view differs from state'
    # Exact JS JSON.stringify and exportSave digests are checked by the second
    # source-bound Vitest readback and its authenticated audit receipt.

def verify_clean(leaf, role, seed):
    summary_path = leaf / 'summary.json'; boundaries = leaf / 'boundaries.ndjson.gz'
    progress = leaf / 'progress.ndjson'; vitest = leaf / 'vitest.json'
    assert all(p.is_file() and not p.is_symlink() for p in (summary_path, boundaries, progress, vitest))
    summary = json.loads(summary_path.read_bytes())
    assert summary['schema'] == '1370-ag-e0g-full-state-leaf-r12-gzip-verified'
    assert summary['role'] == role and summary['seed'] == seed
    assert summary['ticks'] == 416 and summary['boundaries'] == 417 and summary['progressRows'] == 8
    assert summary['version'] == (45 if role == 'AG' else 46)
    digest = hashlib.sha256(); count = 0; raw_bytes = 0
    assert boundaries.stat().st_size == summary['boundaryCompressedBytes'] <= 1024 * 1024 * 1024
    assert file_sha(boundaries) == summary['boundaryCompressedSha256']
    assert summary['boundaryEncoding'] == 'gzip-concatenated-members-one-per-boundary'
    for line in gzip_member_rows(boundaries):
        assert line.endswith(b'\n') and len(line) <= 16 * 1024 * 1024
        row = json.loads(line)
        verify_inner_row(row, role, seed, count)
        digest.update(line); raw_bytes += len(line); count += 1
        assert raw_bytes <= 2 * 1024 * 1024 * 1024 and count <= 417
    assert count == 417 and summary['boundarySha256'] == digest.hexdigest()
    assert summary['boundaryBytes'] == raw_bytes <= 2 * 1024 * 1024 * 1024
    progress_rows = [json.loads(line) for line in progress.read_text().splitlines()]
    assert [r['week'] for r in progress_rows] == [52, 104, 156, 208, 260, 312, 364, 416]
    test = json.loads(vitest.read_bytes())
    assert test['numTotalTests'] == 2 and test['numPassedTests'] == 2 and test['numFailedTests'] == 0
    audit_path = leaf / 'readback-audit.json'
    assert audit_path.is_file() and not audit_path.is_symlink()
    audit = json.loads(audit_path.read_bytes())
    assert audit == {'schema':'1370-ag-e0g-full-state-readback-r12','role':role,'seed':seed,
        'rows':417,'rawBytes':raw_bytes,'rawSha256':digest.hexdigest(),
        'sourceRuntime':'pinned Vitest Node plus source exportSave and representation proof'}
    return {'summarySha256': file_sha(summary_path), 'boundariesSha256': file_sha(boundaries),
            'progressSha256': file_sha(progress), 'vitestSha256': file_sha(vitest),
            'readbackAuditSha256': file_sha(audit_path),
            'boundaryCount': count, 'boundaryUncompressedBytes': raw_bytes,
            'boundaryCompressedBytes': boundaries.stat().st_size, 'terminal': summary['terminal']}

def verify_r12_types_admission(manifest, arm, seed):
    audit_path = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-types-observed-review-r12/RECEIPT.json')
    pin = os.environ.get('NEUTRALITY_TYPES_AUDIT_SHA256', '')
    assert re.fullmatch(r'[0-9a-f]{64}', pin), 'missing fresh r12 types audit pin'
    assert audit_path.is_file() and not audit_path.is_symlink() and file_sha(audit_path) == pin
    audit = json.loads(audit_path.read_bytes())
    assert audit['decision'] == 'ACCEPT_OBSERVED_R12_TYPES_ONLY'
    assert audit['manifestSha256'] == manifest['manifestSha256']
    assert audit['staticReviewSha256'] == sha(_AUTHENTICATED_REVIEW_BYTES)
    evidence = audit['leaves']
    assert set(evidence) == {'AG:p13a-core-causal-01','AG:p13-public-commercial-adoption',
                             'E0G:p13a-core-causal-01','E0G:p13-public-commercial-adoption'}
    for key, row in evidence.items():
        expected_arm, expected_seed = key.split(':', 1)
        run_id = row['runId']
        assert re.fullmatch(r'[a-z0-9-]{1,48}', run_id)
        tag = 'p13a' if expected_seed == 'p13a-core-causal-01' else 'adoption'
        leaf_name = f'{expected_arm.lower()}-{tag}-types-{run_id}'
        target = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r12') / leaf_name / 'RESULT.json'
        outer = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-outer-recorded-r12') / leaf_name / 'RESULT.json'
        assert target.is_file() and outer.is_file() and not target.is_symlink() and not outer.is_symlink()
        assert file_sha(target) == row['targetResultSha256'] and file_sha(outer) == row['outerResultSha256']
        t = json.loads(target.read_bytes()); o = json.loads(outer.read_bytes())
        assert t['status'] == o['status'] == 'STAGE_PASS' and t['stagePassed'] is True and o['stagePassed'] is True
        assert t['head'] == o['head'] == manifest['head']
        assert t['manifestSha256'] == o['manifestSha256'] == manifest['manifestSha256']
        assert t['arm'] == o['arm'] == expected_arm and t['seed'] == o['seed'] == expected_seed
        assert t['stage'] == o['stage'] == 'types' and o['targetResultSha256'] == row['targetResultSha256']
        assert t['child']['exit'] == 0 and t['child']['timedOut'] is False
        assert t['preflight'] == t['postflight'] and t['mirrorPreflightSha256'] == t['mirrorPostflightSha256']
    selected = evidence[f'{arm}:{seed}']
    return {'observedAuditReceiptSha256': pin, 'typesRunId': selected['runId'],
            'targetResultSha256': selected['targetResultSha256'], 'outerResultSha256': selected['outerResultSha256']}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--arm', choices=('AG', 'E0G'), required=True)
    parser.add_argument('--seed', choices=('p13a-core-causal-01', 'p13-public-commercial-adoption'), required=True)
    parser.add_argument('--stage', choices=('types', 'clean'), required=True)
    parser.add_argument('--run-id', required=True)
    args = parser.parse_args()
    assert re.fullmatch(r'[a-z0-9-]{1,48}', args.run_id)
    manifest = json.loads(_AUTHENTICATED_MANIFEST_BYTES)
    assert manifest['schema'] == '1370-ag-e0g-full-state-clean-r12'
    manifest['manifestSha256'] = sha(_AUTHENTICATED_MANIFEST_BYTES)
    assert json.loads(_AUTHENTICATED_REVIEW_BYTES) == {'decision': 'ACCEPT_STATIC_CLEAN_ONLY',
        'manifestSha256': manifest['manifestSha256'], 'runnerSha256': manifest['inventory']['files']['runner.py'],
        'outerSha256': manifest['inventory']['files']['outer.py'], 'commandSha256':os.environ['NEUTRALITY_COMMAND_SHA256']}
    assert REVIEW.read_bytes() == _AUTHENTICATED_REVIEW_BYTES
    seed_tag = 'p13a' if args.seed == 'p13a-core-causal-01' else 'adoption'
    leaf = OUT / f'{args.arm.lower()}-{seed_tag}-{args.stage}-{args.run_id}'
    assert not os.path.lexists(leaf)
    leaf.mkdir(parents=True)
    result = {'schema': '1370-ag-e0g-full-state-clean-leaf-route-r12', 'classification':
        'TYPES_ONLY' if args.stage == 'types' else ('ORIGINAL_CAP_DIAGNOSTIC' if seed_tag == 'p13a' else 'EXPLORATORY_720_750'),
        'arm': args.arm, 'seed': args.seed, 'stage': args.stage, 'head': manifest['head'],
        'manifestSha256': manifest['manifestSha256'], 'status': 'UNCLASSIFIED', 'stagePassed': False}
    error = None
    mirror = leaf / 'runtime-tree'
    expected_mirror = arm_inventory(manifest, args.arm)
    try:
        result['preflight'] = guard(manifest, 'pre')
        if args.stage == 'clean': result['typesAdmission'] = verify_r12_types_admission(manifest, args.arm, args.seed)
        runtime = manifest['runtime']; node = runtime['nodePath']
        tree = ROOT / 'arms' / args.arm / 'tree'
        shutil.copytree(tree, mirror, symlinks=True)
        mirror.chmod(mirror.stat().st_mode | stat.S_IWUSR)
        result['mirrorPreflightSha256'] = verify_mirror(mirror, expected_mirror)
        env = os.environ.copy()
        env['NEUTRALITY_ARM'] = args.arm; env['NEUTRALITY_SEED'] = args.seed
        env['NEUTRALITY_BOUNDARIES'] = str(leaf / 'boundaries.ndjson.gz')
        env['NEUTRALITY_SUMMARY'] = str(leaf / 'summary.json')
        env['NEUTRALITY_PROGRESS'] = str(leaf / 'progress.ndjson')
        env['NEUTRALITY_AUDIT'] = str(leaf / 'readback-audit.json')
        command = ([node, runtime['typescriptPath'], '--noEmit', '-p', 'tsconfig.json'] if args.stage == 'types' else
                   [node, runtime['vitestPath'], 'run', '--config', 'vitest.neutrality.config.ts',
                    '--reporter=json', '--outputFile', str(leaf / 'vitest.json')])
        cap = 300 if args.stage == 'types' or seed_tag == 'p13a' else 720
        result['child'] = child(command, str(mirror), env, leaf, cap)
        assert result['child']['exit'] == 0, 'child exited nonzero'
        result['childStdoutSha256'] = file_sha(leaf / 'child.stdout.log')
        result['childStderrSha256'] = file_sha(leaf / 'child.stderr.log')
        if args.stage == 'clean': result['cleanArtifacts'] = verify_clean(leaf, args.arm, args.seed)
        result['status'] = 'STAGE_PASS'; result['stagePassed'] = True
    except Exception as exc:
        error = exc
        result['status'] = 'CHILD_TIMEOUT' if isinstance(exc, TimeoutError) else 'STAGE_OR_GUARD_FAILURE'
        result['timedOut'] = isinstance(exc, TimeoutError)
        result['error'] = repr(exc)
    finally:
        try:
            assert os.path.lexists(leaf), 'output leaf missing at postflight'
            assert stat.S_ISDIR(leaf.lstat().st_mode), 'output leaf replaced at postflight'
            assert os.path.lexists(mirror), 'runtime mirror missing at postflight'
            assert stat.S_ISDIR(mirror.lstat().st_mode), 'runtime mirror replaced at postflight'
            result['mirrorPostflightSha256'] = verify_mirror(mirror, expected_mirror)
            assert result.get('mirrorPreflightSha256') == result['mirrorPostflightSha256'], 'runtime mirror pre/post mismatch'
        except Exception as exc:
            if error is None: error = exc
            if result['stagePassed']: result['status'] = 'STAGE_OR_GUARD_FAILURE'
            result['stagePassed'] = False
            result['mirrorError'] = repr(exc)
        try:
            result['postflight'] = guard(manifest, 'post')
            if 'preflight' in result:
                assert result['preflight'] == result['postflight'], 'sealed package pre/post mismatch'
        except Exception as exc:
            if error is None: error = exc
            if result['stagePassed']: result['status'] = 'STAGE_OR_GUARD_FAILURE'
            result['stagePassed'] = False
            result['postflightError'] = repr(exc)
        result['finishedUtc'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        safe_leaf = os.path.lexists(leaf) and stat.S_ISDIR(leaf.lstat().st_mode)
        receipt = leaf / 'RESULT.json' if safe_leaf else OUT / f'{leaf.name}.FAILURE-RESULT.json'
        if not safe_leaf:
            result['fallbackReceiptPath'] = str(receipt)
            result['status'] = 'STAGE_OR_GUARD_FAILURE'; result['stagePassed'] = False
            if error is None: error = AssertionError('output leaf unavailable for result receipt')
        write(receipt, result)
        write(receipt.with_name(receipt.stem + '.sha256.json'), {'sha256': file_sha(receipt)})
    print(json.dumps({'status': result['status'], 'resultSha256': file_sha(receipt)}, sort_keys=True))
    if error is not None: raise SystemExit(1)

if __name__ == '__main__': main()
