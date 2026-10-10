from pathlib import Path
import datetime, gzip, hashlib, json, os, stat, subprocess

R = Path('/Users/zacheryspector/The-Movies-headless-program')
S = Path('/Users/zacheryspector/studio-scratch')
C = Path('/Users/zacheryspector/studio-specialists')
A = R / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-as-claude-review-and-draft-backup'
ENV = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
ENV['GIT_OPTIONAL_LOCKS'] = '0'
LANES = {
    'r8': '1370-ar-1363-r8-rebase-20261010-r1',
    'founding': '1370-ar-1364-1365-founding-market-implementation-20261010-r1',
    'p15b': '1370-ar-p15b-waves2-5-implementation-20261010-r1',
    'p16': '1370-ar-p16-rights-estate-implementation-20261010-r1',
    'p17': '1370-ar-p17-continuation-cameo-implementation-20261010-r1',
    'p18': '1370-ar-p18-first-season-implementation-20261010-r1',
}

def git(root, args, accepted=(0,)):
    p = subprocess.run(['git', '--no-optional-locks', '-c', 'gc.auto=0', '-c', 'maintenance.auto=0', *args],
                       cwd=root, env=ENV, capture_output=True)
    if p.returncode not in accepted:
        raise RuntimeError((args, p.returncode, p.stderr.decode(errors='replace')))
    return p.stdout

def digest(data):
    return hashlib.sha256(data).hexdigest()

def put(rel, data):
    p = A / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        raise RuntimeError(f'will not overwrite {p}')
    p.write_bytes(data)

def write_json(rel, obj):
    put(rel, (json.dumps(obj, indent=2) + '\n').encode())

def identity(path):
    data = path.read_bytes()
    return {'bytes': len(data), 'sha256': digest(data), 'mode': oct(stat.S_IMODE(path.stat().st_mode))}

assert not (S / 'HEAVY-LANE-LOCK').exists()
assert git(R, ['rev-parse', 'HEAD']).decode().strip() == 'f7d0dc0fd4f31ff1a3bff47abb4db07bd3ce298c'
A.mkdir(exist_ok=False)
manifest = {'schema': '1370-as-claude-draft-backup/v1',
            'createdAt': datetime.datetime.now().astimezone().isoformat(),
            'disposition': 'UNLANDED_DRAFTS_NOT_GAMEPLAY_ADMISSION', 'lanes': {}, 'evidence': []}

for lane, package in LANES.items():
    root = C / lane
    head = git(root, ['rev-parse', 'HEAD']).decode().strip()
    tracked = set(git(root, ['diff', '--name-only', '-z', 'HEAD']).decode().split('\0')) - {''}
    new = set(git(root, ['ls-files', '--others', '--exclude-standard', '-z']).decode().split('\0')) - {''}
    names = sorted(tracked | new)
    selected = [n for n in names if n.split('/')[0] in ('src', 'tests', 'ui', 'generated', 'bridge', 'scripts', 'tools')
                and (not n.startswith('tests/fixtures/') or n.endswith(('.ts', '.mjs')))]
    local = [n for n in names if n not in selected]
    pins = []
    for name in selected:
        path = root / name
        if path.is_symlink():
            raise RuntimeError(f'unexpected changed source symlink {path}')
        pins.append({'path': name, 'status': 'untracked' if name in new else 'tracked-delta',
                     'postimage': identity(path) if path.exists() else None})
    tracked_selected = [n for n in selected if n in tracked]
    patch = git(root, ['diff', '--binary', '--no-ext-diff', '--no-renames', 'HEAD', '--', *tracked_selected]) if tracked_selected else b''
    for name in selected:
        if name in new:
            patch += git(root, ['diff', '--no-index', '--binary', '--no-ext-diff', '--', '/dev/null', name], accepted=(1,))
    # Reverse-check against the actual retained draft; no apply or index mutation.
    patch_path = f'drafts/{lane}/SOURCE.patch'
    put(patch_path, patch)
    git(root, ['apply', '--reverse', '--check', str(A / patch_path)])
    for pin in pins:
        path = root / pin['path']
        assert (identity(path) if path.exists() else None) == pin['postimage'], f'source changed during backup: {path}'
    assert head == git(root, ['rev-parse', 'HEAD']).decode().strip()
    detail = {'clone': str(root), 'baseHead': head, 'patch': patch_path,
              'patchBytes': len(patch), 'patchSha256': digest(patch),
              'reverseApplyCheck': 'PASS (read-only)', 'files': pins,
              'localOnly': [{'path': str(root / n), 'bytes': (root / n).stat().st_size if (root / n).exists() else None,
                             'reason': 'Fixture payload/metadata retained locally; not exported by this code-only backup.'} for n in local]}
    write_json(f'drafts/{lane}/MANIFEST.json', detail)
    manifest['lanes'][lane] = {'manifest': f'drafts/{lane}/MANIFEST.json', 'files': len(pins), 'localOnlyPaths': len(local)}
    package_root = S / package
    for src in sorted(package_root.rglob('*')):
        if not src.is_file():
            continue
        if src.is_symlink():
            raise RuntimeError(f'unexpected evidence symlink {src}')
        rel = src.relative_to(package_root)
        if lane == 'r8' and rel.as_posix() == 'PATCH.diff':
            # Original contains fixture payloads; current source-only delta is above.
            manifest['evidence'].append({'source': str(src), **identity(src), 'disposition': 'LOCAL_ORIGINAL_FULL_PATCH_INCLUDES_FIXTURES'})
            continue
        data = src.read_bytes()
        dest = f'claude-evidence/{lane}/{rel.as_posix()}'
        encoding = 'identity'
        if len(data) > 256 * 1024 and src.suffix == '.log':
            encoded = gzip.compress(data, mtime=0)
            assert gzip.decompress(encoded) == data
            dest += '.gz'
            encoding = 'gzip (lossless)'
        else:
            encoded = data
        put(dest, encoded)
        manifest['evidence'].append({'source': str(src), 'archive': dest, 'encoding': encoding,
                                     'bytes': len(data), 'sha256': digest(data), 'storedSha256': digest(encoded)})

# Founding outputs were left in Claude's temporary session directory. Preserve exact named outputs only.
temp = Path('/tmp/claude-501/-Users-zacheryspector/21e515ff-0aed-48b0-9b7f-11c9d5239850/scratchpad')
for name in ('red-base-p15a1.json', 'red-base-p15a1.log', 'after-c-p15a1.json', 'after-c-p15a1.log',
             'red-retune.log', 'green-retune-r2.json', 'green-retune-r2.log',
             'red-1364.json', 'red-1364.log', 'run-1364-r1.json', 'run-1364-r1.log',
             'run-1364-r2.json', 'run-1364-r2.log', 'measure-market-storage.ts'):
    src = temp / name
    data = src.read_bytes()
    dest = f'claude-evidence/founding/recovered-scratchpad/{name}'
    put(dest, data)
    manifest['evidence'].append({'source': str(src), 'archive': dest, 'encoding': 'identity',
                                 'bytes': len(data), 'sha256': digest(data), 'storedSha256': digest(data)})

write_json('DRAFT-BACKUP-MANIFEST.json', manifest)
print(json.dumps({'archive': str(A), 'lanes': manifest['lanes'], 'evidenceFiles': len(manifest['evidence'])}, indent=2))
