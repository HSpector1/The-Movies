#!/usr/bin/env python3
"""UNREVIEWED/UNRUN one-tick recorder. Reuses authenticated EBG assembler/runtime.

One new private output child; no Git/source writes. No sandbox/native imports.
The 90s recorder starts before binding read; at most 60s combined Node activity.
"""
import hashlib
import json
import os
import shutil
import signal
import stat
import subprocess
import sys
import time
import zlib
from pathlib import Path

ROOT = Path('/Users/zacheryspector/studio-scratch/1370-c0-b-release-one-tick-source-proposal-20261008-r1')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
ROUTE = Path('/Users/zacheryspector/studio-scratch/1370-ebg-adoption-clean-route-proposal-r3')
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
FLOOR = 3 * 1024**3
PRE_FREE = FLOOR + 128 * 1024**2 + 64 * 1024**2 + 32 * 1024**2
MAX_OUTPUT = 64 * 1024**2
WHOLE = 90
ACTIVE = 75


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def file_sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def checked(pin):
    path = Path(pin['path'])
    assert path.is_absolute() and path.is_file() and not path.is_symlink()
    assert file_sha(path) == pin['sha256'], 'STOP_EXTERNAL_PIN:' + str(path)
    return path.read_bytes()


def write(path, value):
    raw = (json.dumps(value, separators=(',', ':')) + '\n').encode()
    assert len(raw) <= 16 * 1024**2
    with path.open('xb') as stream:
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())


def git(*args):
    return subprocess.check_output(['git', '-c', 'gc.auto=0', '-c', 'maintenance.auto=0', *args],
                                   cwd=REPO, timeout=10).decode().strip()


def process_alive(pgid):
    try:
        os.killpg(pgid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


def clear(process, end):
    # Only the exact child PGID created by start_new_session=True is signalled.
    for sig, grace in ((signal.SIGTERM, 3), (signal.SIGKILL, 4)):
        try:
            os.killpg(process.pid, sig)
        except ProcessLookupError:
            pass
        limit = min(end, time.monotonic() + grace)
        while time.monotonic() < limit:
            process.poll()
            if process.returncode is not None and not process_alive(process.pid):
                return True
            time.sleep(.02)
    process.poll()
    return process.returncode is not None and not process_alive(process.pid)


def alarm(*_):
    raise TimeoutError('STOP_WHOLE_90_SECONDS')


def sizes(leaf):
    total = 0
    for base, dirs, names in os.walk(leaf, followlinks=False):
        # Source mirrors are separately inventoried; output/cache/logs count here.
        dirs[:] = [d for d in dirs if d not in ('baseline-tree', 'intervention-tree')]
        for name in names:
            path = Path(base) / name
            assert path.is_file() and not path.is_symlink()
            total += path.stat().st_size
    return total


def extract_member(pin, locator, destination):
    path = Path(pin['path'])
    assert path.stat().st_size == pin['bytes']
    with path.open('rb') as stream:
        stream.seek(locator['gzipOffsetStart'])
        compressed = stream.read(locator['gzipOffsetEnd'] - locator['gzipOffsetStart'])
    assert len(compressed) == locator['gzipOffsetEnd'] - locator['gzipOffsetStart']
    decoder = zlib.decompressobj(wbits=31)
    raw = decoder.decompress(compressed, 16 * 1024**2 + 1)
    assert len(raw) <= 16 * 1024**2 and decoder.eof
    assert not decoder.unused_data and not decoder.unconsumed_tail
    assert len(raw) == locator['bytes'] and sha(raw) == locator['sha256']
    assert raw.endswith(b'\n') and raw.count(b'\n') == 1
    row = json.loads(raw)
    assert row['week'] == row['boundary'] == locator['member']
    assert row['role'] == 'EBG' and row['seed'] == 'p13-public-commercial-adoption'
    assert row['save']['saveVersion'] == 46 and row['save']['state'] == row['originalState']
    with destination.open('xb') as stream:
        stream.write(raw)
    return {'rawSha256': sha(raw), 'stateSha256': row['originalStateSha256'],
            'serializedSaveSha256': row['serializedSaveSha256'], 'rng': row['rng']}


def main():
    started = time.monotonic()
    end = started + WHOLE
    signal.signal(signal.SIGALRM, alarm)
    signal.setitimer(signal.ITIMER_REAL, WHOLE)
    assert sys.flags.isolated and sys.dont_write_bytecode
    assert len(sys.argv) == 3
    binding_path = Path(sys.argv[1])
    binding_bytes = binding_path.read_bytes()
    assert sha(binding_bytes) == sys.argv[2]
    binding = json.loads(binding_bytes)
    # Refuse before any output or source assembly when unfilled/unadopted.
    assert binding['status'] == 'REVIEWED_FILLED_UNRUN' and binding['executionAuthorization'] is True
    manifest_bytes = (ROOT / 'MANIFEST.json').read_bytes()
    assert sha(manifest_bytes) == binding['manifestSha256']
    manifest = json.loads(manifest_bytes)
    semantic = {k: v for k, v in binding.items() if k not in ('status', 'executionAuthorization', 'exactReview')}
    semantic_sha = sha(json.dumps(semantic, sort_keys=True, separators=(',', ':')).encode())
    review = json.loads(checked(binding['exactReview']))
    assert review['decision'] == 'ACCEPT_EXACT_B_RELEASE_ONE_TICK_UNRUN'
    assert review['manifestSha256'] == sha(manifest_bytes)
    assert review['bindingSemanticSha256'] == semantic_sha
    for name, pin in manifest['files'].items():
        assert file_sha(ROOT / name) == pin['sha256']
    assert binding['productionHead'] == manifest['productionHead']
    assert binding['productionSourceTree'] == manifest['productionSourceTree']
    output = Path(binding['outputRoot'])
    assert output.parent == SCRATCH and output.name.startswith('1370-b-release-one-tick-run-')
    assert not SCRATCH.is_symlink() and not os.path.lexists(output)
    output.mkdir(mode=0o700)
    result = {'status': 'STOP_UNCLASSIFIED', 'bindingSha256': sha(binding_bytes),
              'manifestSha256': sha(manifest_bytes), 'classification': 'ONE_TICK_DIAGNOSTIC_ONLY',
              'followOn109Weeks': 'NOT_IMPLEMENTED_NOT_RUN', 'children': [], 'groupClear': False}
    process = None
    error = None
    mirrors = []
    try:
        external = {name: checked(pin) for name, pin in manifest['externalPins'].items()}
        original_manifest = json.loads(external['routeManifest'])
        accepted = json.loads(external['observedEbg'])
        target_result = json.loads(external['targetResult'])
        outer_result = json.loads(external['outerResult'])
        assert accepted['decision'] == 'ACCEPT_OBSERVED_EBG_ADOPTION_CLEAN_EXPLORATORY_ONLY'
        assert accepted['targetResultSha256'] == manifest['externalPins']['targetResult']['sha256']
        assert accepted['outerResultSha256'] == manifest['externalPins']['outerResult']['sha256']
        assert accepted['manifestSha256'] == manifest['externalPins']['routeManifest']['sha256']
        assert target_result['status'] == outer_result['status'] == 'STAGE_PASS'
        assert target_result['child']['exit'] == 0 and target_result['child']['timedOut'] is False
        assert target_result['cleanArtifacts']['boundariesSha256'] == manifest['capture']['sha256']
        assert file_sha(manifest['capture']['path']) == manifest['capture']['sha256']
        runtime_space = {'__name__': 'authenticated_runtime_guard'}
        exec(compile(external['runtimeGuard'], str(ROUTE / 'runtime_guard.py'), 'exec'), runtime_space)
        assembler = {'__name__': 'authenticated_accepted_assembler',
                     '_AUTHENTICATED_RUNNER_BYTES': external['assembler'],
                     '_AUTHENTICATED_MANIFEST_BYTES': external['routeManifest'],
                     '_AUTHENTICATED_REVIEW_BYTES': external['sourceReview'],
                     '_AUTHENTICATED_VERIFY_RUNTIME': runtime_space['verify_runtime']}
        exec(compile(external['assembler'], str(ROUTE / 'runner.py'), 'exec'), assembler)
        original_review = json.loads(external['sourceReview'])
        assert original_review['decision'] == 'ACCEPT_STATIC_EBG_ADOPTION_ROUTE_ONLY'
        assert original_review['manifestSha256'] == sha(external['routeManifest'])
        assert original_review['runnerSha256'] == sha(external['assembler'])
        assert original_review['outerSha256'] == original_manifest['inventory']['files']['outer.py']
        def guard(phase):
            assert git('rev-parse', 'HEAD') == binding['productionHead']
            assert git('rev-parse', 'HEAD:src') == binding['productionSourceTree']
            assert git('status', '--porcelain=v1', '--untracked-files=all') == ''
            ref = 'refs/heads/wip/headless-program-20260916-ts'
            assert git('ls-remote', '--exit-code', 'origin', ref) == binding['productionHead'] + '\t' + ref
            assert sha(binding_path.read_bytes()) == sha(binding_bytes)
            assert sha((ROOT / 'MANIFEST.json').read_bytes()) == sha(manifest_bytes)
            for name, pin in manifest['files'].items():
                assert file_sha(ROOT / name) == pin['sha256']
            for name, pin in manifest['externalPins'].items():
                assert file_sha(pin['path']) == pin['sha256'], name
            assembler['verify_external_sources'](original_manifest)
            runtime = runtime_space['verify_runtime'](ROOT, original_manifest)
            free = shutil.disk_usage(SCRATCH).free
            assert free >= (PRE_FREE if phase == 'pre' else FLOOR + 128 * 1024**2)
            power = subprocess.check_output(['pmset', '-g', 'batt'], cwd=REPO, timeout=5).decode()
            assert "Now drawing from 'AC Power'" in power
            return {'head': binding['productionHead'], 'source': binding['productionSourceTree'],
                    'runtime': runtime, 'freeBytes': free}
        result['preflight'] = guard('pre')
        indices = json.loads(external['comparatorResult'])['boundaryIndex']
        members = {i: next(x['ebg'] for x in indices if x['week'] == i) for i in (307, 308)}
        assert members == manifest['members'] or {str(k): v for k, v in members.items()} == manifest['members']
        result['inputs'] = {str(i): extract_member(manifest['capture'], members[i], output / f'boundary-{i}.ndjson') for i in (307, 308)}
        inherited = assembler['verify_external_sources'](original_manifest)
        started_tests = None
        for arm, folder in (('EBG', 'baseline-tree'), ('EBG_R04_RELEASE_OFF', 'intervention-tree')):
            mirror = output / folder
            shutil.copytree(assembler['R12'] / 'arms/E0G/tree', mirror, symlinks=True)
            assert assembler['inventory'](mirror) == inherited
            expected = json.loads(json.dumps(original_manifest['assembledInventory']))
            overlays = [(p, assembler['EBG'] / 'tree' / p) for p in original_manifest['changedProductionPaths']]
            overlays += [('tests/full-state-neutrality.test.ts', ROOT / 'one-tick.test.ts'),
                         ('vitest.neutrality.config.ts', ROOT / 'vitest.one-tick.config.ts')]
            for path, source in overlays:
                new_sha = file_sha(source)
                if path in original_manifest['changedProductionPaths']:
                    assert new_sha == expected['files'][path]
                else:
                    expected['files'][path] = new_sha
                assembler['replace_pinned_file'](mirror / path, source, inherited['files'][path], new_sha)
            if arm != 'EBG':
                path = 'src/core/hollywoodTick.ts'
                assembler['replace_pinned_file'](mirror / path, ROOT / 'hollywoodTick.r04-release-off.ts',
                                                 expected['files'][path], manifest['candidateWholeFileSha256'])
                expected['files'][path] = manifest['candidateWholeFileSha256']
            mirror.chmod(mirror.stat().st_mode | stat.S_IWUSR)
            mirror_digest = assembler['verify_mirror'](mirror, expected)
            mirrors.append((mirror, expected, mirror_digest))
            env = {k: v for k, v in os.environ.items() if not k.startswith(('GIT_', 'NODE_OPTIONS', 'NEUTRALITY_', 'B_RELEASE_'))}
            env.update({'B_RELEASE_ARM': arm, 'B_RELEASE_INPUT': str(output / 'boundary-307.ndjson'),
                        'B_RELEASE_EXPECTED': str(output / 'boundary-308.ndjson'),
                        'B_RELEASE_BASELINE': str(output / 'EBG.json'),
                        'B_RELEASE_OUTPUT': str(output / f'{arm}.json'),
                        'B_RELEASE_COMPARISON': str(output / 'COMPARISON.json'),
                        'B_RELEASE_CACHE': str(output / f'cache-{arm}')})
            runtime = original_manifest['runtime']
            command = [runtime['nodePath'], runtime['vitestPath'], 'run', '--config', 'vitest.neutrality.config.ts',
                       '--reporter=json', '--outputFile', str(output / f'{arm}.vitest.json')]
            assert time.monotonic() < started + ACTIVE
            with (output / f'{arm}.stdout.log').open('xb') as stdout, (output / f'{arm}.stderr.log').open('xb') as stderr:
                launched = time.monotonic()
                if started_tests is None:
                    started_tests = launched
                process = subprocess.Popen(command, cwd=mirror, env=env, stdin=subprocess.DEVNULL,
                                           stdout=stdout, stderr=stderr, start_new_session=True, close_fds=True)
                child_info = {'arm': arm, 'pid': process.pid, 'pgid': process.pid, 'command': command,
                              'sourceInventorySha256': mirror_digest, 'actualExit': None, 'groupClear': False}
                result['children'].append(child_info)
                write(output / f'{arm}.LAUNCH.json', child_info)
                while process.poll() is None:
                    assert time.monotonic() < min(started + ACTIVE, started_tests + 60), 'STOP_ACTIVE_OR_COMBINED_TEST_CAP'
                    assert sizes(output) <= MAX_OUTPUT, 'STOP_OUTPUT_CAP'
                    assert stdout.tell() + stderr.tell() <= 1024**2, 'STOP_LOG_CAP'
                    assert shutil.disk_usage(SCRATCH).free >= FLOOR + 128 * 1024**2, 'STOP_DISK_FLOOR'
                    time.sleep(.05)
                child_info['actualExit'] = process.returncode
                child_info['groupClear'] = clear(process, min(end, time.monotonic() + 7))
                assert child_info['groupClear'], 'STOP_CHILD_SURVIVOR'
                process = None
                assert child_info['actualExit'] == 0, 'STOP_CHILD_EXIT'
            assert sizes(output) <= MAX_OUTPUT
            assert assembler['verify_mirror'](mirror, expected) == mirror_digest
            test_result = json.loads((output / f'{arm}.vitest.json').read_bytes())
            assert test_result['numTotalTests'] == test_result['numPassedTests'] == 1
            assert test_result['numFailedTests'] == 0
            assert (output / f'{arm}.stderr.log').stat().st_size == 0
        result['postflight'] = guard('post')
        assert result['preflight']['runtime'] == result['postflight']['runtime']
        assert file_sha(manifest['capture']['path']) == manifest['capture']['sha256']
        result['artifacts'] = {p.name: {'sha256': file_sha(p), 'bytes': p.stat().st_size}
                               for p in output.iterdir() if p.is_file()}
        result['groupClear'] = all(x['groupClear'] for x in result['children'])
        assert result['groupClear'] and sizes(output) <= MAX_OUTPUT
        assert time.monotonic() < end
        result['status'] = 'ONE_TICK_DIAGNOSTIC_CANDIDATE'
    except BaseException as exc:
        error = exc
        result['status'] = 'STOP'
        result['error'] = repr(exc)
    finally:
        if process is not None:
            try:
                result['children'][-1]['groupClear'] = clear(process, end)
                result['children'][-1]['actualExit'] = process.poll()
            except BaseException as exc:
                result['cleanupError'] = repr(exc)
                result['children'][-1]['groupClear'] = False
            result['groupClear'] = all(x['groupClear'] for x in result['children'])
            result['status'] = 'STOP'
        for mirror, expected, digest in mirrors:
            try:
                assert assembler['verify_mirror'](mirror, expected) == digest
            except BaseException as exc:
                result['status'] = 'STOP'
                result['mirrorError'] = repr(exc)
        if time.monotonic() >= end:
            result['status'] = 'STOP'
            result['deadlineExceeded'] = True
        result['elapsedSeconds'] = time.monotonic() - started
        write(output / 'RESULT.json', result)
        # Alarm is retained through final fsync; an override always beats candidate.
        if time.monotonic() >= end:
            write(output / 'OVERRIDE-STOP.json', {'status': 'STOP_FINALIZATION_DEADLINE'})
            result['status'] = 'STOP'
        signal.setitimer(signal.ITIMER_REAL, 0)
    print(json.dumps({'status': result['status'], 'outputRoot': str(output)}))
    return 0 if result['status'] == 'ONE_TICK_DIAGNOSTIC_CANDIDATE' else 2


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({'status': 'STOP', 'error': repr(exc)}), file=sys.stderr)
        raise SystemExit(2)
