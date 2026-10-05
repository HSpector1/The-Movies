"""One reviewed original-Save45 delayed-player route. Parent prepares and typechecks the immutable layout first."""
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

R = Path('/Users/zacheryspector/The-Movies-headless-program')
PREP = Path('/Users/zacheryspector/studio-scratch/1368-postrelease-prep-v3')
ROOT = Path('/Users/zacheryspector/studio-scratch/1368-postrelease-run-01')
E = R / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
OLD = 'd5e2dad1e23183f1a94fe7b7d30e65ed88617f34'
SRC = '88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837'
STEM = '1368-original45-delayed-postrelease-r1'
SCOPE = ['src', 'bridge', 'tests', 'ui', 'generated', 'scripts', 'package.json', 'package-lock.json', 'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', ':(exclude)tests/fixtures', ':(exclude)ui/e2e', ':(exclude)ui/public']
ARCHIVE_PATHS = ['src', 'package.json', 'package-lock.json', 'tsconfig.json']
NODE = Path('/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin')

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def git(*args):
    return subprocess.check_output(['git', *args], cwd=R, env={**os.environ, 'GIT_OPTIONAL_LOCKS': '0'})

def safe(path):
    for p in [path, *path.parents]:
        assert not p.is_symlink(), 'symlink path: ' + str(p)

def exclusive(path):
    safe(path)
    assert not os.path.lexists(path), 'existing output: ' + str(path)

def verify_prep(pin):
    safe(PREP)
    assert sha(PREP / 'SHA256.json') == pin, 'reviewed package manifest changed'
    pins = json.loads((PREP / 'SHA256.json').read_text())
    for name, expected in pins.items():
        p = PREP / name; safe(p)
        assert p.is_file() and sha(p) == expected, 'prep hash changed: ' + name
    for name in ['probe/postrelease.ts', 'probe/vite.config.ts', 'tsconfig.postrelease.json']:
        p = ROOT / name; safe(p)
        assert p.is_file() and sha(p) == pins[name], 'prepared consumed helper changed: ' + name
    return pins

def verify_archive():
    safe(ROOT); safe(ROOT / 'tree')
    assert git('rev-parse', OLD + ':src').decode().strip() == SRC
    actual = []
    for name in ARCHIVE_PATHS:
        p = ROOT / 'tree' / name; safe(p)
        files = sorted(p.rglob('*')) if p.is_dir() else [p]
        for f in files:
            safe(f)
            if f.is_dir():
                continue
            assert f.is_file(), 'nonregular archive entry'
            actual.append(f.relative_to(ROOT / 'tree').as_posix())
    entries = []
    for row in git('ls-tree', '-r', '-z', OLD, '--', *ARCHIVE_PATHS).split(b'\0'):
        if not row:
            continue
        meta, name = row.split(b'\t', 1); mode, kind, blob = meta.decode().split(); name = name.decode()
        assert mode in ('100644', '100755') and kind == 'blob'
        p = ROOT / 'tree' / name; data = p.read_bytes()
        computed = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        assert computed == blob, 'archive source differs: ' + name
        entries.append({'path': name, 'gitBlob': blob, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)})
    assert sorted(actual) == sorted(row['path'] for row in entries), 'archive inventory differs'
    assert sorted(p.name for p in (ROOT / 'tree').iterdir()) == sorted(ARCHIVE_PATHS + ['node_modules'])
    # This one explicit dependency link is allowed; source/config/probe symlinks are forbidden.
    assert (ROOT / 'tree/node_modules').is_symlink() and (ROOT / 'tree/node_modules').resolve() == (R / 'node_modules').resolve()
    return entries

def child(binding_sha):
    assert re.fullmatch('[0-9a-f]{64}', binding_sha) and sha(ROOT / 'binding.json') == binding_sha
    binding = json.loads((ROOT / 'binding.json').read_text())
    pins = verify_prep(binding['prepManifestSha256'])
    assert verify_archive() == binding['originalFiles']
    assert git('rev-parse', 'HEAD').decode().strip() == binding['currentDependencyHead']
    env = dict(os.environ, PATH=str(NODE) + os.pathsep + os.environ.get('PATH', ''), P1368_OUTPUT=str(ROOT / 'out'), P1368_BINDING=str(ROOT / 'binding.json'))
    cmd = ['node', str(R / 'node_modules/vite-node/vite-node.mjs'), '--config', str(ROOT / 'probe/vite.config.ts'), '--script', str(ROOT / 'probe/postrelease.ts')]
    start = time.monotonic(); timed_out = False
    with (ROOT / 'stdout.txt').open('x') as stdout, (ROOT / 'stderr.txt').open('x') as stderr:
        p = subprocess.Popen(cmd, cwd=ROOT / 'tree', env=env, stdout=stdout, stderr=stderr, start_new_session=True)
        try:
            code = p.wait(timeout=7200)
        except subprocess.TimeoutExpired:
            timed_out = True
            try: os.killpg(p.pid, signal.SIGTERM)
            except ProcessLookupError: pass
            deadline = time.monotonic() + 5
            while time.monotonic() < deadline:
                p.poll()
                try: os.killpg(p.pid, 0)
                except ProcessLookupError: break
                time.sleep(0.1)
            try: os.killpg(p.pid, signal.SIGKILL)
            except ProcessLookupError: pass
            code = p.wait()
    assert sha(ROOT / 'binding.json') == binding_sha
    assert verify_archive() == binding['originalFiles']
    assert verify_prep(binding['prepManifestSha256']) == pins
    assert git('rev-parse', 'HEAD').decode().strip() == binding['currentDependencyHead']
    result = {'command': cmd, 'elapsedSeconds': time.monotonic() - start, 'actualChildExit': code, 'timedOut': timed_out, 'archiveAndHelpersExact': True,
              'stdoutSha256': sha(ROOT / 'stdout.txt'), 'stderrSha256': sha(ROOT / 'stderr.txt'), 'bindingSha256': sha(ROOT / 'binding.json'),
              'resultSha256': sha(ROOT / 'out/RESULT.json') if (ROOT / 'out/RESULT.json').is_file() else None,
              'errorSha256': sha(ROOT / 'out/ERROR.json') if (ROOT / 'out/ERROR.json').is_file() else None}
    with (ROOT / 'RUN.json').open('x') as out: json.dump(result, out, indent=2)
    print(json.dumps(result), flush=True)
    return 124 if timed_out else code if code >= 0 else 1

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--head', required=True)
    parser.add_argument('--prep-manifest-sha256', required=True)
    args = parser.parse_args()
    assert re.fullmatch('[0-9a-f]{40}', args.head) and re.fullmatch('[0-9a-f]{64}', args.prep_manifest_sha256)
    assert Path(__file__).resolve() == PREP / 'run-delayed.py'
    assert git('rev-parse', '--show-toplevel').decode().strip() == str(R)
    assert git('rev-parse', 'HEAD').decode().strip() == args.head
    branch = 'refs/heads/wip/headless-program-20260916-ts'
    assert git('ls-remote', '--exit-code', 'origin', branch).decode().split() == [args.head, branch]
    assert subprocess.run(['git', 'diff', '--quiet', 'HEAD', '--', *SCOPE], cwd=R).returncode == 0
    assert git('ls-files', '--others', '--exclude-standard', '--', *SCOPE) == b''
    assert shutil.disk_usage(R).free >= 5 * 1024**3
    env = dict(os.environ, PATH=str(NODE) + os.pathsep + os.environ.get('PATH', ''), GIT_OPTIONAL_LOCKS='0')
    assert subprocess.check_output(['node', '--version'], env=env, text=True).strip() == 'v20.20.2'
    pins = verify_prep(args.prep_manifest_sha256); archive = verify_archive()
    for name in ['out', 'stdout.txt', 'stderr.txt', 'binding.json', 'RUN.json', 'power.txt']:
        exclusive(ROOT / name)
    for suffix in ['.json', '.patch', '.txt', '-preflight.json', '-postflight.json']:
        exclusive(E / (STEM + suffix))
    binding = {'originalHead': OLD, 'originalSrc': SRC, 'currentDependencyHead': args.head,
               'prepManifestSha256': args.prep_manifest_sha256, 'helpers': pins, 'originalFiles': archive,
               'archiveSha256': hashlib.sha256(json.dumps(archive, separators=(',', ':')).encode()).hexdigest(),
               'output': str(ROOT / 'out'), 'seed': 'seed-b', 'horizon': 6344, 'operationalCapSeconds': 7200}
    with (ROOT / 'binding.json').open('x') as out: json.dump(binding, out, indent=2)
    with (ROOT / 'power.txt').open('x') as out: subprocess.run(['pmset', '-g', 'batt'], stdout=out, check=True)
    subprocess.Popen(['caffeinate', '-is', '-w', str(os.getpid())], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    guard = [sys.executable, str(E / 'run-bounded-source-guards.py')]
    subprocess.run([*guard, 'pre', STEM, '0'], cwd=R, env=env, check=True)
    try:
        recorder = subprocess.run(['node', str(E / 'run-bounded-source-c2.mjs'), STEM, sys.executable, str(PREP / 'run-delayed.py'), '--child', sha(ROOT / 'binding.json')], cwd=R, env=env).returncode
    finally:
        postcode = subprocess.run([*guard, 'post', STEM], cwd=R, env=env).returncode
    assert recorder == postcode == 0
    post = json.loads((E / (STEM + '-postflight.json')).read_text())
    record = json.loads((E / (STEM + '.json')).read_text())
    assert record['fixedSource'] and post['fixedSource'] and post['allGuardsExact']
    assert record['sourceSha'] == record['sourceShaAtEnd'] == post['head'] == args.head
    assert record['exitCode'] == post['exitCode']
    verify_prep(args.prep_manifest_sha256); assert verify_archive() == archive
    print(json.dumps({'actualChildExit': record['exitCode'], 'allGuardsExact': True, 'originalGeneratingHead': OLD,
                      'currentDependencyHead': args.head, 'adoption': 'Independent output and performance review required.'}))
    return record['exitCode'] if record['exitCode'] >= 0 else 1

if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--child': sys.exit(child(sys.argv[2]))
    sys.exit(main())
