"""Record one reviewed predecessor capture. No archive construction or automatic retries."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import time

REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
HERE = Path('/Users/zacheryspector/studio-scratch/1367-predecessor-capture-runner/run-capture.py')
E = Path('docs/engineering/playability-launch-review/evidence/p14b4-20260919')
NODE_DIR = Path('/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin')
BRANCH = 'refs/heads/wip/headless-program-20260916-ts'
SOURCE = ['src', 'bridge', 'tests', 'ui', 'generated', 'scripts', 'package.json', 'package-lock.json',
          'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json']
PATHS = SOURCE + [':(exclude)tests/fixtures', ':(exclude)ui/e2e', ':(exclude)ui/public']
SPECS = {
    'save45': {
        'producer': 'scripts/captures/1363-save45-predecessor.ts',
        'config': 'scripts/captures/1363-save45-predecessor.config.ts',
        'output': '/Users/zacheryspector/studio-scratch/1363-save45-predecessor-capture-01',
        'pins': {
            'scripts/captures/1363-save45-predecessor.ts': '7c94086ca4787a931f0bd61b7eb94cacee3062ec14973a7132799f37036eebac',
            'scripts/captures/1363-save45-predecessor.config.ts': '7b935bef9808c4bae3371515c31ee3fb25bc78744070decab92e7c995a28abff',
        },
    },
    'extension37': {
        'producer': 'scripts/captures/1367-extension-capture.ts',
        'config': 'scripts/captures/1367-extension-capture.config.ts',
        'output': '/Users/zacheryspector/studio-scratch/1367-extension-capture-prep/run-01',
        'pins': {
            'scripts/captures/1367-extension-capture.ts': '714be0ea30e3e236b55c5e54454909adbf358264fca66e50f0de2d652d5dc77c',
            'scripts/captures/1367-extension-capture.config.ts': '71c006047d7b2887b2f2f6fec5f75f70dd07626fc95221f84b45fcf6dd540029',
        },
    },
    'period26': {
        'producer': 'scripts/captures/1363-old-era-period-capture.ts',
        'config': 'scripts/captures/1363-old-era-period-capture.config.ts',
        'watchdog': 'scripts/captures/1363-old-era-period-watchdog.py',
        'types': 'scripts/captures/tsconfig.1363-old-era-period-capture.json',
        'output': '/Users/zacheryspector/studio-scratch/1363-old-era-period-capture-01',
        'pins': {
            'scripts/captures/1363-old-era-period-capture.ts': '84643aa7517682b1c090fd74581419c30fa5e3bed02a52f30ff96536ba53ef86',
            'scripts/captures/1363-old-era-period-capture.config.ts': 'e9fa6a3653caed8b63f7b82d2254a7ed6ee514f5a1aef6ed6273d120d411c485',
            'scripts/captures/1363-old-era-period-watchdog.py': 'c077dbb9a8a4351fd2fc058054782ff603285ed39ec11ade8c4be519f5f573fa',
            'scripts/captures/tsconfig.1363-old-era-period-capture.json': 'c47667c5277e4b4219de75f9a7bef3dff642bad72b15aa2aec23ff3ea3083ee7',
        },
    },
}


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def hex_pin(value, length):
    assert isinstance(value, str) and re.fullmatch('[0-9a-f]{' + str(length) + '}', value), 'missing/invalid concrete hash'
    return value


def no_symlinks(path, allow_missing_leaf=False):
    path = Path(path)
    assert path.is_absolute(), 'absolute path required'
    for item in [path, *path.parents]:
        assert not item.is_symlink(), 'symlink path: ' + str(item)
        if item == path and allow_missing_leaf:
            continue
        assert item.exists(), 'missing path: ' + str(item)


def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO, env={**os.environ, 'GIT_OPTIONAL_LOCKS': '0'}, text=True).strip()


def verify_scripts(mode, runner_sha):
    assert Path(__file__).resolve() == HERE
    no_symlinks(HERE)
    assert digest(HERE) == hex_pin(runner_sha, 64), 'runner differs from independent accepted hash'
    for name, expected in SPECS[mode]['pins'].items():
        git('ls-files', '--error-unmatch', '--', name)
        path = REPO / name
        no_symlinks(path)
        assert path.is_file() and digest(path) == expected, 'installed producer/script differs: ' + name


def build_environment(binding):
    mode, head, output = binding['mode'], binding['head'], binding['output']
    spec = SPECS[mode]
    assert output == spec['output']
    pins = spec['pins']
    env = dict(os.environ)
    # No ambient pin or capture mode can silently change this invocation.
    for key in list(env):
        if key.startswith(('P1363_SAVE45_', 'P1367_', 'P1363_OLD_PERIOD_')):
            del env[key]
    env['PATH'] = str(NODE_DIR) + os.pathsep + env.get('PATH', '')
    env['GIT_OPTIONAL_LOCKS'] = '0'
    if mode == 'save45':
        values = {
            'P1363_SAVE45_GENERATING_HEAD': head,
            'P1363_SAVE45_SRC_TREE': binding['srcTree'],
            'P1363_SAVE45_PRODUCER_SHA256': pins[spec['producer']],
            'P1363_SAVE45_CONFIG_SHA256': pins[spec['config']],
            'P1363_SAVE45_OUTPUT': output,
        }
    elif mode == 'extension37':
        values = {
            'P1367_CURRENT_HEAD': head,
            'P1367_PRODUCER_SHA256': pins[spec['producer']],
            'P1367_CONFIG_SHA256': pins[spec['config']],
            'P1367_ARCHIVE_ROOT': binding['archiveRoot'],
            'P1367_ARCHIVE_FILES_SHA256': binding['archiveSha256'],
            'P1367_INPUT_MANIFEST_SHA256': binding['inputManifestSha256'],
            'P1367_OUTPUT': output,
        }
    else:
        values = {
            'P1363_OLD_PERIOD_CURRENT_HEAD': head,
            'P1363_OLD_PERIOD_PRODUCER_SHA256': pins[spec['producer']],
            'P1363_OLD_PERIOD_CONFIG_SHA256': pins[spec['config']],
            'P1363_OLD_PERIOD_WATCHDOG_SHA256': pins[spec['watchdog']],
            'P1363_OLD_PERIOD_TYPES_SHA256': pins[spec['types']],
            'P1363_OLD_PERIOD_ARCHIVE_ROOT': binding['archiveRoot'],
            'P1363_OLD_PERIOD_ARCHIVE_SHA256': binding['archiveSha256'],
            'P1363_OLD_PERIOD_INPUT_GZIP_SHA256': binding['inputGzipSha256'],
            'P1363_OLD_PERIOD_INPUT_PROVENANCE_SHA256': binding['inputProvenanceSha256'],
            'P1363_OLD_PERIOD_OUTPUT': output,
        }
    env.update(values)
    return env, values


def child(binding):
    mode = binding['mode']
    verify_scripts(mode, binding['runnerSha256'])
    assert Path.cwd() == REPO and git('rev-parse', 'HEAD') == binding['head']
    spec = SPECS[mode]
    env, pins = build_environment(binding)
    print(json.dumps({'captureBinding': binding, 'exactProducerEnvironment': pins,
                      'installedScripts': spec['pins'], 'pythonVersion': sys.version}), flush=True)
    command = ['node', 'node_modules/vite-node/vite-node.mjs', '--config', spec['config'], '--script', spec['producer']]
    if mode == 'period26':
        # Reuse the reviewed exact-command 300s watchdog; do not double-wrap it.
        return subprocess.run([sys.executable, spec['watchdog'], *command], cwd=REPO, env=env).returncode
    # The other two producers require a five-minute outer deadline but do not
    # supply a watchdog. This is the same owned-session cleanup as the reviewed runner.
    started = time.monotonic()
    process = subprocess.Popen(command, cwd=REPO, env=env, start_new_session=True)
    timed_out = False
    try:
        code = process.wait(timeout=300)
    except subprocess.TimeoutExpired:
        timed_out = True
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        grace = time.monotonic() + 5
        while time.monotonic() < grace:
            process.poll()
            try:
                os.killpg(process.pid, 0)
            except ProcessLookupError:
                break
            time.sleep(min(0.1, max(0, grace - time.monotonic())))
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        code = process.wait()
    print(json.dumps({'boundedPredecessorChild': True, 'mode': mode, 'timeoutSeconds': 300,
                      'timedOut': timed_out, 'childExit': code,
                      'elapsedMs': (time.monotonic() - started) * 1000}), flush=True)
    return 124 if timed_out else (code if code >= 0 else 1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=list(SPECS))
    parser.add_argument('--head', required=True)
    parser.add_argument('--stem', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--runner-sha256', required=True)
    parser.add_argument('--src-tree')
    parser.add_argument('--archive-root')
    parser.add_argument('--archive-sha256')
    parser.add_argument('--input-manifest-sha256')
    parser.add_argument('--input-gzip-sha256')
    parser.add_argument('--input-provenance-sha256')
    args = parser.parse_args()
    assert Path.cwd() == REPO, 'run from actual repository top level'
    no_symlinks(REPO)
    assert git('rev-parse', '--show-toplevel') == str(REPO)
    head = hex_pin(args.head, 40)
    assert re.fullmatch(r'[0-9]{3,4}[a-z0-9-]*', args.stem)
    verify_scripts(args.mode, args.runner_sha256)
    assert git('rev-parse', 'HEAD') == head
    remote = git('ls-remote', '--exit-code', 'origin', BRANCH).split()
    assert remote == [head, BRANCH], 'exact accepted HEAD must already be published'
    assert subprocess.run(['git', 'diff', '--quiet', 'HEAD', '--', *PATHS], cwd=REPO, env={**os.environ, 'GIT_OPTIONAL_LOCKS': '0'}).returncode == 0, 'dirty bounded source'
    assert git('ls-files', '--others', '--exclude-standard', '--', *PATHS) == '', 'untracked consumed source'
    assert shutil.disk_usage(REPO).free >= 5 * 1024**3, 'requires 5 GiB free'
    output = Path(args.output)
    assert str(output) == SPECS[args.mode]['output'], 'output must be the reviewed named attempt'
    no_symlinks(output, allow_missing_leaf=True)
    assert not os.path.lexists(output) and output.parent.is_dir(), 'exclusive output parent required; no overwrite'
    assert not output.is_relative_to(REPO) and not REPO.is_relative_to(output)
    for suffix in ['.json', '.patch', '.txt', '-preflight.json', '-postflight.json']:
        assert not os.path.lexists(REPO / E / (args.stem + suffix)), 'recorder output exists: ' + suffix
    binding = {'mode': args.mode, 'head': head, 'stem': args.stem, 'output': str(output),
               'runnerSha256': hex_pin(args.runner_sha256, 64)}
    if args.mode == 'save45':
        binding['srcTree'] = hex_pin(args.src_tree, 40)
        assert binding['srcTree'] == git('rev-parse', head + ':src') == git('rev-parse', '2eaa697effc38538c37da28b486786ce267a2284:src')
        assert all(v is None for v in [args.archive_root, args.archive_sha256, args.input_manifest_sha256, args.input_gzip_sha256, args.input_provenance_sha256])
    else:
        assert args.src_tree is None
        assert args.archive_root, 'archive must be prepared independently'
        archive = Path(args.archive_root)
        no_symlinks(archive)
        assert archive == archive.resolve(), 'archive path must be canonical'
        assert archive.is_dir() and (archive / 'src').is_dir()
        for other in [REPO, output]:
            assert not archive.is_relative_to(other) and not other.is_relative_to(archive), 'archive/output/repo must be disjoint'
        binding.update(archiveRoot=str(archive), archiveSha256=hex_pin(args.archive_sha256, 64))
        if args.mode == 'extension37':
            assert args.input_gzip_sha256 is None and args.input_provenance_sha256 is None
            binding['inputManifestSha256'] = hex_pin(args.input_manifest_sha256, 64)
        else:
            assert args.input_manifest_sha256 is None
            binding['inputGzipSha256'] = hex_pin(args.input_gzip_sha256, 64)
            binding['inputProvenanceSha256'] = hex_pin(args.input_provenance_sha256, 64)
    env, _ = build_environment(binding)
    assert subprocess.check_output(['node', '--version'], env=env, text=True).strip() == 'v20.20.2'
    print(json.dumps({'predecessorCapturePreparation': binding, 'installedScripts': SPECS[args.mode]['pins']}), flush=True)
    subprocess.run(['pmset', '-g', 'batt'], check=True)
    subprocess.Popen(['caffeinate', '-is', '-w', str(os.getpid())], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    guard = [sys.executable, str(E / 'run-bounded-source-guards.py')]
    subprocess.run([*guard, 'pre', args.stem, '0'], cwd=REPO, env=env, check=True)
    recorder = ['node', str(E / 'run-bounded-source-c2.mjs'), args.stem,
                sys.executable, str(HERE), '--child', json.dumps(binding, sort_keys=True, separators=(',', ':'))]
    recorder_exit = None
    try:
        recorder_exit = subprocess.run(recorder, cwd=REPO, env=env).returncode
    finally:
        post_exit = subprocess.run([*guard, 'post', args.stem], cwd=REPO, env=env).returncode
    assert recorder_exit == post_exit == 0, 'recorder or postflight failure; no adoption'
    verify_scripts(args.mode, args.runner_sha256)
    record = json.loads((REPO / E / (args.stem + '.json')).read_text())
    post = json.loads((REPO / E / (args.stem + '-postflight.json')).read_text())
    assert record['fixedSource'] and post['fixedSource'] and post['allGuardsExact']
    assert record['sourceSha'] == record['sourceShaAtEnd'] == post['head'] == head
    assert record['exitCode'] == post['exitCode'] and isinstance(record['exitCode'], int)
    code = record['exitCode']
    result_path = output / 'RESULT.json'
    result = json.loads(result_path.read_text()) if result_path.is_file() and not result_path.is_symlink() else None
    if code == 0:
        assert result is not None and result['status'] == 'MINTED', 'zero child exit without producer MINTED'
    elif code == 2:
        assert result is not None and result['status'] == 'ABSENT', 'exit2 is not justified absence'
    print(json.dumps({'actualChildExit': code, 'fixedSource': True, 'allGuardsExact': True,
                      'producerStatus': result.get('status') if result else None,
                      'resultSha256': digest(result_path) if result else None,
                      'adoption': 'Independent generated-artifact review still required; failures/absence are not coverage.'}), flush=True)
    return code if code >= 0 else 1


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--child':
        sys.exit(child(json.loads(sys.argv[2])))
    sys.exit(main())
