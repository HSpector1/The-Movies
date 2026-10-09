#!/usr/bin/env python3
"""UNREVIEWED/UNRUN 109-tick continuation recorder. Reuses authenticated EBG assembler/runtime.

One new private output child; no Git/source writes. No sandbox/native imports.
The390s recorder starts before binding read; at most300s combined Node activity;109continuous ticks per arm.
"""
import hashlib
import json
import os
import select
import shutil
import signal
import stat
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path('/Users/zacheryspector/studio-scratch/1370-c0-b-release-109-tick-source-proposal-20261008-r1')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
ROUTE = Path('/Users/zacheryspector/studio-scratch/1370-ebg-adoption-clean-route-proposal-r3')
SCRATCH = Path('/Users/zacheryspector/studio-scratch')
FLOOR = 3 * 1024**3
PRE_FREE = FLOOR + 128 * 1024**2 + 256 * 1024**2 + 32 * 1024**2
MAX_OUTPUT = 256 * 1024**2
MAX_JSON = 16 * 1024**2
FINAL_RESERVE = 128 * 1024
WHOLE = 390
ACTIVE = 375
COMBINED = 300


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def file_sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def read_json_bytes(path):
    """Bound actual nofollow regular bytes before parsing, including reporters."""
    path = Path(path)
    before = path.lstat()
    assert stat.S_ISREG(before.st_mode) and before.st_nlink == 1, 'STOP_JSON_KIND'
    assert before.st_size <= MAX_JSON, 'STOP_SINGLE_JSON_CAP'
    assert hasattr(os, 'O_NOFOLLOW'), 'STOP_JSON_NOFOLLOW_UNAVAILABLE'
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    identity = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns)
    try:
        opened = os.fstat(fd)
        assert stat.S_ISREG(opened.st_mode) and opened.st_nlink == 1
        assert identity(opened) == identity(before), 'STOP_JSON_OPEN_RACE'
        raw = bytearray()
        while True:
            chunk = os.read(fd, min(65536, MAX_JSON + 1 - len(raw)))
            if not chunk:
                break
            raw.extend(chunk)
            assert len(raw) <= MAX_JSON, 'STOP_SINGLE_JSON_CAP'
        after_fd = os.fstat(fd)
        after_path = path.lstat()
        assert identity(opened) == identity(after_fd) == identity(after_path), 'STOP_JSON_READ_RACE'
        assert stat.S_ISREG(after_path.st_mode) and after_path.st_nlink == 1
        assert len(raw) == opened.st_size, 'STOP_JSON_READ_LENGTH'
        return bytes(raw)
    finally:
        os.close(fd)


def read_json(path):
    return json.loads(read_json_bytes(path))


def checked(pin):
    path = Path(pin['path'])
    assert path.is_absolute() and path.is_file() and not path.is_symlink()
    raw = read_json_bytes(path) if path.suffix == '.json' else path.read_bytes()
    assert sha(raw) == pin['sha256'], 'STOP_EXTERNAL_PIN:' + str(path)
    return raw


def write(path, value):
    raw = (json.dumps(value, separators=(',', ':')) + '\n').encode()
    assert len(raw) <= MAX_JSON
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


class OwnedChild:
    def __init__(self, pid):
        self.pid = pid
        self.returncode = None

    def poll(self):
        if self.returncode is None:
            got, status = os.waitpid(self.pid, os.WNOHANG)
            if got == self.pid:
                self.returncode = os.waitstatus_to_exitcode(status)
        return self.returncode


def start_owned(command, cwd, env, stdout_fd, stderr_fd, owned, before_ready=None):
    """Fork/readiness/GO pattern: record PID before exec or waiting.

    Block only SIGALRM across fork and in-memory registration. The shared owned
    dictionary closes the function-return assignment window too. No filesystem
    I/O or wait occurs with the recorder alarm blocked in the parent.
    """
    ready_read, ready_write = os.pipe()
    go_read, go_write = os.pipe()
    old_mask = signal.pthread_sigmask(signal.SIG_BLOCK, {signal.SIGALRM})
    try:
        pid = os.fork()
        if pid == 0:
            try:
                signal.setitimer(signal.ITIMER_REAL, 0)
                os.close(ready_read); os.close(go_write)
                os.setsid()
                signal.pthread_sigmask(signal.SIG_SETMASK, old_mask)
                if before_ready is not None:
                    before_ready()  # Tiny source-only fixture hook; main never supplies it.
                os.write(ready_write, (str(os.getpid()) + '\n').encode())
                os.close(ready_write)
                if os.read(go_read, 1) != b'G':
                    os._exit(126)
                os.close(go_read)
                os.chdir(cwd)
                null = os.open('/dev/null', os.O_RDONLY)
                os.dup2(null, 0); os.dup2(stdout_fd, 1); os.dup2(stderr_fd, 2)
                os.closerange(3, os.sysconf('SC_OPEN_MAX'))
                os.execve(command[0], command, env)
            except BaseException:
                os._exit(126)
        owned.update({'child': OwnedChild(pid), 'readyRead': ready_read,
                      'goWrite': go_write, 'pgidConfirmed': False})
        if 'info' in owned:
            owned['info'].update({'pid': pid, 'pgid': pid, 'startupOwnedBeforeExec': True})
        os.close(ready_write); os.close(go_read)
    except BaseException:
        if owned.get('child') is None:
            for fd in (ready_read, ready_write, go_read, go_write):
                try:
                    os.close(fd)
                except OSError:
                    pass
        raise
    finally:
        signal.pthread_sigmask(signal.SIG_SETMASK, old_mask)


def ready_go(owned, deadline, clock=time.monotonic):
    child = owned['child']
    raw = b''
    os.set_blocking(owned['readyRead'], False)
    while b'\n' not in raw:
        assert clock() < deadline, 'STOP_STARTUP_DEADLINE'
        got, _, _ = select.select([owned['readyRead']], [], [], min(.02, deadline - clock()))
        if got:
            block = os.read(owned['readyRead'], 128)
            assert block, 'STOP_STARTUP_EOF'
            raw += block
            assert len(raw) <= 128, 'STOP_STARTUP_CAP'
        assert clock() < deadline, 'STOP_STARTUP_DEADLINE'
        assert child.poll() is None, 'STOP_STARTUP_EXIT'
    assert raw == (str(child.pid) + '\n').encode(), 'STOP_STARTUP_IDENTITY'
    assert os.getpgid(child.pid) == child.pid, 'STOP_STARTUP_GROUP'
    owned['pgidConfirmed'] = True
    os.close(owned['readyRead']); owned['readyRead'] = None
    assert clock() < deadline, 'STOP_STARTUP_DEADLINE'
    assert os.write(owned['goWrite'], b'G') == 1
    os.close(owned['goWrite']); owned['goWrite'] = None


def close_startup_fds(owned):
    for name in ('readyRead', 'goWrite'):
        fd = owned.get(name)
        if fd is not None:
            os.close(fd)
            owned[name] = None


def clear(process, end):
    # Only the exact child PGID created by start_new_session=True is signalled.
    for sig, grace in ((signal.SIGTERM, 3), (signal.SIGKILL, 4)):
        try:
            os.killpg(process.pid, sig)
        except ProcessLookupError:
            pass
        if process.returncode is None:
            try:
                os.kill(process.pid, sig)  # Exact owned child before setsid/READY.
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
    raise TimeoutError('STOP_WHOLE_390_SECONDS')


def sizes(leaf):
    leaf = Path(leaf)
    assert stat.S_ISDIR(leaf.lstat().st_mode) and not leaf.is_symlink()
    excluded = {leaf / 'baseline-tree', leaf / 'intervention-tree'}
    def visit(folder):
        total = 0
        for path in folder.iterdir():
            facts = path.lstat()
            assert not stat.S_ISLNK(facts.st_mode), 'STOP_OUTPUT_SYMLINK'
            if stat.S_ISDIR(facts.st_mode):
                if path not in excluded:
                    total += visit(path)
            else:
                assert stat.S_ISREG(facts.st_mode) and facts.st_nlink == 1, 'STOP_OUTPUT_SPECIAL_OR_LINK'
                if path.suffix == '.json':
                    assert facts.st_size <= MAX_JSON, 'STOP_SINGLE_JSON_CAP'
                total += facts.st_size
        return total
    return visit(leaf)


def observed_exit_guard(started, started_tests, log_bytes, clock=time.monotonic):
    assert clock() < min(started + ACTIVE, started_tests + COMBINED), 'STOP_ACTIVE_OR_COMBINED_TEST_CAP'
    assert log_bytes <= 1024**2, 'STOP_LOG_CAP'


def finalize_result(output, result, end, clock=time.monotonic, writer=write, limit=MAX_OUTPUT):
    """Final and override bytes count. Any failure/nonzero beats candidate."""
    try:
        assert clock() < end, 'STOP_FINALIZATION_DEADLINE'
        raw_size = len((json.dumps(result, separators=(',', ':')) + '\n').encode())
        assert raw_size <= FINAL_RESERVE // 2, 'STOP_FINAL_RESULT_CAP'
        assert sizes(output) + raw_size + FINAL_RESERVE // 2 <= limit, 'STOP_FINAL_OUTPUT_CAP'
        writer(output / 'RESULT.json', result)
        assert sizes(output) <= limit, 'STOP_FINAL_OUTPUT_CAP'
        assert clock() < end, 'STOP_FINALIZATION_DEADLINE'
        return result
    except BaseException as exc:
        stop = {'status': 'STOP_FINALIZATION', 'error': repr(exc),
                'children': result.get('children', []),
                'bindingSha256': result.get('bindingSha256')}
        raw_size = len((json.dumps(stop, separators=(',', ':')) + '\n').encode())
        assert raw_size <= FINAL_RESERVE // 2, 'STOP_OVERRIDE_RESULT_CAP'
        assert sizes(output) + raw_size <= limit, 'STOP_OVERRIDE_OUTPUT_CAP'
        writer(output / 'OVERRIDE-STOP.json', stop)
        assert sizes(output) <= limit, 'STOP_OVERRIDE_OUTPUT_CAP'
        result['status'] = 'STOP'
        return result


def main():
    started = time.monotonic()
    end = started + WHOLE
    signal.signal(signal.SIGALRM, alarm)
    signal.setitimer(signal.ITIMER_REAL, WHOLE)
    assert sys.flags.isolated and sys.dont_write_bytecode
    assert len(sys.argv) == 3
    binding_path = Path(sys.argv[1])
    binding_bytes = read_json_bytes(binding_path)
    assert sha(binding_bytes) == sys.argv[2]
    binding = json.loads(binding_bytes)
    # Refuse before any output or source assembly when unfilled/unadopted.
    assert binding['status'] == 'REVIEWED_FILLED_UNRUN' and binding['executionAuthorization'] is True
    manifest_bytes = read_json_bytes(ROOT / 'MANIFEST.json')
    assert sha(manifest_bytes) == binding['manifestSha256']
    manifest = json.loads(manifest_bytes)
    semantic = {k: v for k, v in binding.items() if k not in ('status', 'executionAuthorization', 'exactReview')}
    semantic_sha = sha(json.dumps(semantic, sort_keys=True, separators=(',', ':')).encode())
    review = json.loads(checked(binding['exactReview']))
    assert review['decision'] == 'ACCEPT_EXACT_B_RELEASE_109_TICK_UNRUN'
    assert review['manifestSha256'] == sha(manifest_bytes)
    assert review['bindingSemanticSha256'] == semantic_sha
    for name, pin in manifest['files'].items():
        assert file_sha(ROOT / name) == pin['sha256']
    # Manifest HEAD is preparation provenance. Docs checkpoints may advance HEAD;
    # exact review semantic identity and live guards bind the actual launch HEAD.
    assert isinstance(binding['productionHead'], str) and len(binding['productionHead']) == 40
    assert set(binding['productionHead']) <= set('0123456789abcdef')
    assert binding['productionSourceTree'] == manifest['productionSourceTree']
    output = Path(binding['outputRoot'])
    assert output.parent == SCRATCH and output.name.startswith('1370-b-release-109-tick-run-')
    assert not SCRATCH.is_symlink() and not os.path.lexists(output)
    output.mkdir(mode=0o700)
    result = {'status': 'STOP_UNCLASSIFIED', 'bindingSha256': sha(binding_bytes),
              'manifestSha256': sha(manifest_bytes), 'classification': '109_TICK_CONTINUATION_DIAGNOSTIC_ONLY',
              'continuationTicks': 109, 'boundariesPerArm': 110, 'children': [], 'groupClear': False}
    process = None
    owned = {}
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
        members = {i: next(x['ebg'] for x in indices if x['week'] == i) for i in range(307, 417)}
        assert members == manifest['members'] or {str(k): v for k, v in members.items()} == manifest['members']
        frozen_index = read_json(ROOT / 'DESIGN-MEMBER-INDEX-307-416.json')
        assert frozen_index['capture'] == manifest['capture']
        assert frozen_index['members'] == [members[i] for i in range(307, 417)]
        result['inputs'] = {'capture': manifest['capture'], 'memberIndexSha256': manifest['files']['DESIGN-MEMBER-INDEX-307-416.json']['sha256'], 'boundaries': 110, 'start': 307, 'end': 416}
        assert json.loads(external['designReview'])['decision'] == 'ACCEPT_DESIGN_ONLY_PARENT_BOUNDS_ADOPTION_REQUIRED'
        adoption = json.loads(external['designParentAdoption'])
        assert adoption['decision'] == 'ADOPT_DESIGN_AND_PROSPECTIVE_OPERATIONAL_BOUNDS_SOURCE_PREPARATION_ONLY'
        assert adoption['designManifestSha256'] == manifest['externalPins']['designManifest']['sha256']
        assert adoption['independentReviewSha256'] == manifest['externalPins']['designReview']['sha256']
        assert adoption['adoptedCaps'] == manifest['adoptedCaps']
        inherited = assembler['verify_external_sources'](original_manifest)
        started_tests = None
        for arm, folder in (('EBG', 'baseline-tree'), ('EBG_R04_RELEASE_OFF', 'intervention-tree')):
            mirror = output / folder
            shutil.copytree(assembler['R12'] / 'arms/E0G/tree', mirror, symlinks=True)
            assert assembler['inventory'](mirror) == inherited
            expected = json.loads(json.dumps(original_manifest['assembledInventory']))
            overlays = [(p, assembler['EBG'] / 'tree' / p) for p in original_manifest['changedProductionPaths']]
            overlays += [('tests/full-state-neutrality.test.ts', ROOT / 'continuation.test.ts'),
                         ('vitest.neutrality.config.ts', ROOT / 'vitest.continuation.config.ts')]
            for path, source in overlays:
                new_sha = file_sha(source)
                if path in original_manifest['changedProductionPaths']:
                    assert new_sha == expected['files'][path]
                else:
                    expected['files'][path] = new_sha
                assembler['replace_pinned_file'](mirror / path, source, inherited['files'][path], new_sha)
            # Pure identity observer helper; no game semantic change.
            helper_parent = mirror / 'tests'
            helper_mode = stat.S_IMODE(helper_parent.lstat().st_mode)
            try:
                helper_parent.chmod(helper_mode | stat.S_IWUSR)
                for name in ('retention.mjs', 'retention.d.mts', 'streaming.mjs', 'streaming.d.mts'):
                    data = (ROOT / name).read_bytes()
                    helper_fd = os.open(helper_parent / name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
                    with os.fdopen(helper_fd, 'wb') as stream:
                        stream.write(data)
                    assert stat.S_IMODE((helper_parent / name).lstat().st_mode) == 0o600
                    expected['files']['tests/' + name] = sha(data)
            finally:
                helper_parent.chmod(helper_mode)
            if arm != 'EBG':
                path = 'src/core/hollywoodTick.ts'
                assembler['replace_pinned_file'](mirror / path, ROOT / 'hollywoodTick.r04-release-off.ts',
                                                 expected['files'][path], manifest['candidateWholeFileSha256'])
                expected['files'][path] = manifest['candidateWholeFileSha256']
            mirror.chmod(mirror.stat().st_mode | stat.S_IWUSR)
            mirror_digest = assembler['verify_mirror'](mirror, expected)
            mirrors.append((mirror, expected, mirror_digest))
            env = {k: v for k, v in os.environ.items() if not k.startswith(('GIT_', 'NODE_OPTIONS', 'NEUTRALITY_', 'B_RELEASE_'))}
            env.update({'B_RELEASE_ARM': arm, 'B_RELEASE_OUTPUT_ROOT': str(output),
                        'B_RELEASE_INDEX': str(ROOT / 'DESIGN-MEMBER-INDEX-307-416.json'),
                        'B_RELEASE_INDEX_SHA': manifest['files']['DESIGN-MEMBER-INDEX-307-416.json']['sha256'],
                        'B_RELEASE_FACTS': manifest['externalPins']['oneTickFacts']['path'],
                        'B_RELEASE_FACTS_SHA': manifest['externalPins']['oneTickFacts']['sha256'],
                        'B_RELEASE_CACHE': str(output / f'cache-{arm}')})
            runtime = original_manifest['runtime']
            command = [runtime['nodePath'], runtime['vitestPath'], 'run', '--config', 'vitest.neutrality.config.ts',
                       '--reporter=json', '--outputFile', str(output / f'{arm}.vitest.json')]
            assert time.monotonic() < started + ACTIVE
            with (output / f'{arm}.stdout.log').open('xb') as stdout, (output / f'{arm}.stderr.log').open('xb') as stderr:
                launched = time.monotonic()
                if started_tests is None:
                    started_tests = launched
                child_info = {'arm': arm, 'pid': None, 'pgid': None, 'command': command,
                              'sourceInventorySha256': mirror_digest, 'actualExit': None, 'groupClear': False}
                result['children'].append(child_info)
                owned = {'info': child_info}
                start_owned(command, str(mirror), env, stdout.fileno(), stderr.fileno(), owned)
                process = owned['child']
                write(output / f'{arm}.LAUNCH.json', child_info)
                ready_go(owned, min(started + ACTIVE, started_tests + COMBINED))
                child_info['pgidConfirmed'] = owned['pgidConfirmed']
                while process.poll() is None:
                    assert time.monotonic() < min(started + ACTIVE, started_tests + COMBINED), 'STOP_ACTIVE_OR_COMBINED_TEST_CAP'
                    assert sizes(output) <= MAX_OUTPUT - FINAL_RESERVE, 'STOP_OUTPUT_CAP'
                    assert stdout.tell() + stderr.tell() <= 1024**2, 'STOP_LOG_CAP'
                    assert shutil.disk_usage(SCRATCH).free >= FLOOR + 128 * 1024**2, 'STOP_DISK_FLOOR'
                    time.sleep(.05)
                child_info['actualExit'] = process.returncode
                observed_exit_guard(started, started_tests, stdout.tell() + stderr.tell())
                child_info['groupClear'] = clear(process, min(end, time.monotonic() + 7))
                assert child_info['groupClear'], 'STOP_CHILD_SURVIVOR'
                observed_exit_guard(started, started_tests,
                                    (output / f'{arm}.stdout.log').stat().st_size +
                                    (output / f'{arm}.stderr.log').stat().st_size)
                close_startup_fds(owned)
                owned = {}
                process = None
                assert child_info['actualExit'] == 0, 'STOP_CHILD_EXIT'
            assert sizes(output) <= MAX_OUTPUT - FINAL_RESERVE
            assert assembler['verify_mirror'](mirror, expected) == mirror_digest
            test_result = read_json(output / f'{arm}.vitest.json')
            assert test_result['numTotalTests'] == test_result['numPassedTests'] == 1
            assert test_result['numFailedTests'] == 0
            assert (output / f'{arm}.stderr.log').stat().st_size == 0
        result['armSummaries'] = {}
        for arm in ('EBG', 'EBG_R04_RELEASE_OFF'):
            summary = read_json(output / f'{arm}.summary.json')
            assert summary['status'] == 'CONTINUATION_ARM_CANDIDATE'
            assert summary['ticks'] == 109 and summary['boundaries'] == 110
            assert summary['fullCaptureReadback'] is True and summary['allBoundarySave46Admission'] is True
            assert summary['arm'] == arm and summary['seed'] == 'p13-public-commercial-adoption'
            result['armSummaries'][arm] = {
                'summaryPath': str(output / f'{arm}.summary.json'),
                'summarySha256': file_sha(output / f'{arm}.summary.json'),
                'ticks': summary['ticks'], 'boundaries': summary['boundaries'],
                'baselineExact': summary['baselineExact'],
                'fullCaptureReadback': summary['fullCaptureReadback'],
                'allBoundarySave46Admission': summary['allBoundarySave46Admission'],
                'indexSha256': summary['indexSha256'],
                'diffIndexSha256': summary['diffIndexSha256'],
                'discoveryReturn': summary['finalTarget']['discoveryReturn'],
                'declineReturn': summary['finalTarget']['declineReturn']}
        assert result['armSummaries']['EBG']['baselineExact'] is True
        result['postflight'] = guard('post')
        assert result['preflight']['runtime'] == result['postflight']['runtime']
        assert file_sha(manifest['capture']['path']) == manifest['capture']['sha256']
        # Every regular JSON output, including both reporter files, passes the
        # same declared bound immediately before final candidate acceptance.
        for path in output.iterdir():
            if path.suffix == '.json':
                read_json(path)
        result['artifacts'] = {p.name: {'sha256': file_sha(p), 'bytes': p.stat().st_size}
                               for p in output.iterdir() if p.is_file()}
        result['groupClear'] = all(x['groupClear'] for x in result['children'])
        assert result['groupClear'] and sizes(output) <= MAX_OUTPUT - FINAL_RESERVE
        assert time.monotonic() < end
        result['status'] = 'CONTINUATION_DIAGNOSTIC_CANDIDATE'
    except BaseException as exc:
        error = exc
        result['status'] = 'STOP'
        result['error'] = repr(exc)
    finally:
        # Even an alarm before start_owned returns leaves the exact PID here.
        if process is None and owned.get('child') is not None:
            process = owned['child']
        close_startup_fds(owned)
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
        finalize_result(output, result, end)
        signal.setitimer(signal.ITIMER_REAL, 0)
    print(json.dumps({'status': result['status'], 'outputRoot': str(output)}))
    return 0 if result['status'] == 'CONTINUATION_DIAGNOSTIC_CANDIDATE' else 2


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({'status': 'STOP', 'error': repr(exc)}), file=sys.stderr)
        raise SystemExit(2)
