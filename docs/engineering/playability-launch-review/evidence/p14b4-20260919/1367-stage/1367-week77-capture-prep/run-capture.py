"""Record the fixed original-engine Save42 week77 capture. No archive construction or automatic retries."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
HERE = Path('/Users/zacheryspector/studio-scratch/1367-week77-capture-prep/run-capture.py')
E = Path('docs/engineering/playability-launch-review/evidence/p14b4-20260919')
NODE_DIR = Path('/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin')
BRANCH = 'refs/heads/wip/headless-program-20260916-ts'
SOURCE = ['src', 'bridge', 'tests', 'ui', 'generated', 'scripts', 'package.json', 'package-lock.json',
          'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json']
PATHS = SOURCE + [':(exclude)tests/fixtures', ':(exclude)ui/e2e', ':(exclude)ui/public']
SPECS = {'week77': {'producer': 'scripts/captures/1367-week77-capture.ts', 'config': 'scripts/captures/1367-week77-capture.config.ts', 'watchdog': 'scripts/captures/1367-week77-watchdog.py', 'types': 'scripts/captures/tsconfig.1367-week77-capture.json', 'output': '/Users/zacheryspector/studio-scratch/1367-week77-capture-01', 'pins': {'scripts/captures/1367-week77-capture.config.ts': 'e9fa6a3653caed8b63f7b82d2254a7ed6ee514f5a1aef6ed6273d120d411c485', 'scripts/captures/1367-week77-capture.ts': '7f3acb1b161cbb67e409f59fe5ea28ed245df2362ed99626b1fb1d5470350a59', 'scripts/captures/1367-week77-watchdog.py': 'c545b0f048634ce7d8f9ab0bd3aa40134b7bd1f4ed21146238c540aa630d0a20', 'scripts/captures/tsconfig.1367-week77-capture.json': 'e184db94e02bdc482f0029aa7c11d8b77a5e7927b7467a6dcfd6e88c89ab353b'}}}

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
    spec = SPECS['week77']
    pins = spec['pins']
    env = {k: v for k, v in os.environ.items() if not k.startswith('P1367_WEEK77_')}
    env['PATH'] = str(NODE_DIR) + os.pathsep + env.get('PATH', '')
    env['GIT_OPTIONAL_LOCKS'] = '0'
    values = {
        'P1367_WEEK77_CURRENT_HEAD': binding['head'],
        'P1367_WEEK77_CURRENT_VERSION': str(binding['currentVersion']),
        'P1367_WEEK77_ARCHIVE_ROOT': binding['archiveRoot'],
        'P1367_WEEK77_ARCHIVE_SHA256': binding['archiveSha256'],
        'P1367_WEEK77_OUTPUT': binding['output'],
        'P1367_WEEK77_PRODUCER_SHA256': pins[spec['producer']],
        'P1367_WEEK77_CONFIG_SHA256': pins[spec['config']],
        'P1367_WEEK77_WATCHDOG_SHA256': pins[spec['watchdog']],
        'P1367_WEEK77_TYPES_SHA256': pins[spec['types']],
    }
    env.update(values)
    return env, values


def child(binding):
    verify_scripts('week77', binding['runnerSha256'])
    assert Path.cwd() == REPO and git('rev-parse', 'HEAD') == binding['head']
    spec = SPECS['week77']
    env, values = build_environment(binding)
    print(json.dumps({'captureBinding': binding, 'exactProducerEnvironment': values,
                      'installedScripts': spec['pins'], 'pythonVersion': sys.version}), flush=True)
    command = ['node', 'node_modules/vite-node/vite-node.mjs', '--config', spec['config'], '--script', spec['producer']]
    return subprocess.run([sys.executable, spec['watchdog'], *command], cwd=REPO, env=env).returncode


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.set_defaults(mode='week77')
    parser.add_argument('--current-version', type=int, choices=[45, 46], required=True)
    parser.add_argument('--head', required=True)
    parser.add_argument('--stem', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--runner-sha256', required=True)
    parser.add_argument('--archive-root')
    parser.add_argument('--archive-sha256')
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
    assert args.archive_root, 'archive must be prepared independently'
    archive = Path(args.archive_root)
    no_symlinks(archive)
    assert archive == archive.resolve(), 'archive path must be canonical'
    assert archive.is_dir() and (archive / 'src').is_dir()
    for other in [REPO, output]:
        assert not archive.is_relative_to(other) and not other.is_relative_to(archive), 'archive/output/repo must be disjoint'
    binding.update(archiveRoot=str(archive), archiveSha256=hex_pin(args.archive_sha256, 64), currentVersion=args.current_version)
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
    print(json.dumps({'actualChildExit': code, 'fixedSource': True, 'allGuardsExact': True,
                      'producerStatus': result.get('status') if result else None,
                      'resultSha256': digest(result_path) if result else None,
                      'adoption': 'Independent generated-artifact review still required; failures/absence are not coverage.'}), flush=True)
    return code if code >= 0 else 1


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--child':
        sys.exit(child(json.loads(sys.argv[2])))
    sys.exit(main())
