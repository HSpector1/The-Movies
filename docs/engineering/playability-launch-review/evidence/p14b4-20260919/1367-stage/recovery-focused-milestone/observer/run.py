"""Parent-controlled S+O type/parity runner. Preparation does not execute this file."""
from pathlib import Path
import argparse, hashlib, json, os, re, shutil, subprocess, sys, time

ROOT = Path('/Users/zacheryspector/studio-scratch/1367-recovery-schema-observer-candidate')
TREE = ROOT / 'candidate'
SCHEMA = Path('/Users/zacheryspector/studio-scratch/1367-recovery-schema-candidate/candidate')
BOUNDED = Path('/Users/zacheryspector/studio-scratch/1361-capture-runner/bounded-child.py')
NODE_BIN = Path('/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin')
MODULES = Path('/Users/zacheryspector/The-Movies-headless-program/node_modules')
sha = lambda value: hashlib.sha256(value).hexdigest()

def real_directory(path):
    assert path.is_dir() and not path.is_symlink(), str(path)
    assert path.resolve() == path, 'noncanonical directory: ' + str(path)

def exclusive_json(path, value):
    with path.open('x') as handle:
        json.dump(value, handle, indent=2)
        handle.write('\n')

parser = argparse.ArgumentParser()
parser.add_argument('mode', choices=['types', 'parity'])
parser.add_argument('attempt')
args = parser.parse_args()
assert re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,47}', args.attempt), 'bounded attempt name required'
for directory in [ROOT, TREE, ROOT / 'runs', SCHEMA]: real_directory(directory)
assert Path(__file__).absolute() == ROOT / 'run.py', 'use the pinned wrapper location'

pin_paths = [ROOT / 'CANDIDATE-PINS.json', ROOT / 'S-BASE-PINS.json', ROOT / 'RUNNER-PINS.json']
raw_pins = {str(path): path.read_bytes() for path in pin_paths}
candidate_pins, schema_pins, runner_pins = [json.loads(raw_pins[str(path)]) for path in pin_paths]

def check():
    for path, raw in raw_pins.items():
        assert Path(path).read_bytes() == raw, 'changed pin file: ' + path
    for rel, expected in candidate_pins.items():
        path = TREE / rel
        assert path.is_file() and not path.is_symlink(), str(path)
        assert sha(path.read_bytes()) == expected, 'candidate changed: ' + rel
    for rel, expected in schema_pins.items():
        path = SCHEMA / rel
        assert path.is_file() and not path.is_symlink(), str(path)
        assert sha(path.read_bytes()) == expected, 'original S changed: ' + rel
    # Include exactly the reviewed source and tests; do not admit hidden additions.
    for subtree in ['src', 'tests']:
        found = set()
        for path in (TREE / subtree).rglob('*'):
            assert not path.is_symlink(), 'unexpected source/test symlink: ' + str(path)
            if path.is_file(): found.add(str(path.relative_to(TREE)))
        assert found == {rel for rel in candidate_pins if rel.startswith(subtree + '/')}, subtree + ' file census changed'
    for absolute, expected in runner_pins.items():
        assert sha(Path(absolute).read_bytes()) == expected, 'runner dependency changed: ' + absolute
    assert (TREE / 'node_modules').is_symlink()
    assert (TREE / 'node_modules').resolve(strict=True) == MODULES.resolve(strict=True)

check()
env = dict(os.environ)
env['PATH'] = str(NODE_BIN) + os.pathsep + env.get('PATH', '')
assert subprocess.check_output([str(NODE_BIN / 'node'), '--version'], env=env, text=True).strip() == 'v20.20.2'
command = ['node', 'node_modules/typescript/bin/tsc', '-p', 'tsconfig.observer-tests.json', '--noEmit']
if args.mode == 'parity':
    command = ['node', 'node_modules/vitest/vitest.mjs', 'run', '--project', 'core',
               'tests/p14d2-schema-observer-parity.test.ts', '--maxWorkers=1', '--minWorkers=1',
               '--no-file-parallelism', '--reporter=verbose']
command = ['python3', str(BOUNDED), '330', *command]
out = ROOT / 'runs' / (args.mode + '-' + args.attempt)
out.mkdir()  # Exclusive output; an existing directory or symlink refuses.
real_directory(out)
exclusive_json(out / 'preflight.json', {
    'mode': args.mode, 'command': command, 'cwd': str(TREE), 'nodeVersion': 'v20.20.2',
    'pinHashes': {Path(path).name: sha(raw) for path, raw in raw_pins.items()},
    'freeBytes': shutil.disk_usage(ROOT).free, 'candidateAndOriginalSExact': True,
})
start = time.monotonic()
with (out / 'output.txt').open('x') as handle:
    child = subprocess.run(command, cwd=TREE, env=env, stdout=handle, stderr=subprocess.STDOUT)
post_error = None
try: check()
except Exception as error: post_error = str(error)
records = []
for line in (out / 'output.txt').read_text(errors='replace').splitlines():
    try: row = json.loads(line)
    except (ValueError, TypeError): continue
    if isinstance(row, dict) and row.get('boundedCaptureChild') is True: records.append(row)
post = {'candidateAndOriginalSExact': post_error is None, 'guardError': post_error,
        'pinHashes': {Path(path).name: sha(raw) for path, raw in raw_pins.items()}}
exclusive_json(out / 'postflight.json', post)
result = {'mode': args.mode, 'exitCode': child.returncode, 'elapsedSeconds': time.monotonic() - start,
          'command': command, 'boundedChild': records[0] if len(records) == 1 else None,
          'boundedRecordCount': len(records), 'postflightPassed': post_error is None,
          'outputSha256': sha((out / 'output.txt').read_bytes())}
exclusive_json(out / 'result.json', result)
print(json.dumps(result))
sys.exit(child.returncode if post_error is None and len(records) == 1 else 1)
