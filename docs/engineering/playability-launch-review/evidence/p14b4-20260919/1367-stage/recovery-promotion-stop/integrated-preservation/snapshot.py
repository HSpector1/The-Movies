"""Read-only source preservation, fixed named inventory; no gameplay execution."""
from pathlib import Path
import datetime, difflib, hashlib, json, os, re, stat, subprocess

ROOT = Path('/Users/zacheryspector/studio-scratch/1367-integrated-preservation')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
CANDIDATE = ROOT.parent / '1367-recovery-integrated-candidate/candidate'
PINS = ROOT.parent / '1367-recovery-witness-diagnostic-prep/abc-pins.json'
BASE = 'd1e084b65093a940ff2f224941e8cf52ac69a08a'
ENV = {**os.environ, 'GIT_OPTIONAL_LOCKS': '0'}
def sha(data): return hashlib.sha256(data).hexdigest()
def git(*args): return subprocess.check_output(['git', *args], cwd=REPO, env=ENV)
def write(path, data):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('xb') as f: f.write(data)
def dump(path, obj): write(path, (json.dumps(obj, indent=2) + '\n').encode())
def regular(path):
    for part in [path, *path.parents]: assert not part.is_symlink(), str(part)
    assert stat.S_ISREG(path.lstat().st_mode), str(path)
    return path.read_bytes()
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
pin_bytes = regular(PINS)
pins = json.loads(pin_bytes)
paths = sorted(pins)
assert len(paths) == len(set(paths)) == 708
for rel in paths:
    assert not Path(rel).is_absolute() and '..' not in Path(rel).parts
    assert not rel.startswith(('tests/fixtures/', 'node_modules/', 'ui/e2e/', 'ui/public/'))
    assert rel.startswith(('src/', 'tests/')) or rel in {
        'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.src.json',
        'tsconfig.recovery-tests.json', 'tsconfig.witness-diagnostic.json', 'vitest.config.ts', 'vitest.workspace.ts'}
    assert re.fullmatch('[0-9a-f]{64}', pins[rel])
assert git('rev-parse', BASE + '^{commit}').decode().strip() == BASE
base_tree = git('rev-parse', BASE + '^{tree}').decode().strip()
base_src = git('rev-parse', BASE + ':src').decode().strip()
# Exact enumerated paths only. This does not list or read any excluded fixture directory.
entries = git('ls-tree', '-r', '-z', BASE, '--', *paths).split(b'\0')
base_meta = {}
for entry in filter(None, entries):
    head, raw_path = entry.split(b'\t', 1)
    mode, kind, blob = head.decode().split()
    rel = raw_path.decode()
    assert rel in pins and mode in ('100644', '100755') and kind == 'blob', rel
    base_meta[rel] = {'mode': mode, 'gitBlob': blob}
# One bounded batch reads only enumerated original blobs; no checkout/index writes.
ordered = [rel for rel in paths if rel in base_meta]
proc = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=REPO, env=ENV, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
raw, _ = proc.communicate(('\n'.join(base_meta[x]['gitBlob'] for x in ordered) + '\n').encode())
assert proc.returncode == 0
base_bytes = {}; pos = 0
for rel in ordered:
    end = raw.index(b'\n', pos); oid, kind, size = raw[pos:end].decode().split(); size = int(size)
    assert oid == base_meta[rel]['gitBlob'] and kind == 'blob'
    pos = end + 1; data = raw[pos:pos+size]; pos += size
    assert raw[pos:pos+1] == b'\n'; pos += 1
    assert hashlib.sha1(b'blob ' + str(size).encode() + b'\0' + data).hexdigest() == oid
    base_bytes[rel] = data
assert pos == len(raw)
current = {}; inventory = []; changed = []; chunks = []
for rel in paths:
    p = CANDIDATE / rel; data = regular(p)
    assert sha(data) == pins[rel], 'candidate differs from active diagnostic pin: ' + rel
    mode = '100755' if p.stat().st_mode & 0o111 else '100644'
    old = base_bytes.get(rel)
    old_meta = base_meta.get(rel)
    row = {'path': rel, 'candidate': {'bytes': len(data), 'sha256': sha(data), 'mode': mode},
           'base': None if old is None else {**old_meta, 'bytes': len(old), 'sha256': sha(old)},
           'classification': 'unlanded diagnostic preparation' if rel in {
               'tests/p14d2-disposal-witness-diagnostic.test.ts', 'tsconfig.witness-diagnostic.json'}
               else 'unlanded test/build configuration' if not rel.startswith('src/') else 'unlanded production candidate'}
    row['changed'] = old != data or (old_meta is not None and old_meta['mode'] != mode)
    inventory.append(row); current[rel] = (data, mode)
    if not row['changed']: continue
    changed.append(row)
    assert b'\0' not in data and (old is None or b'\0' not in old), 'nontext file needs explicit handling'
    before = (old or b'').decode('utf8'); after = data.decode('utf8')
    # No-final-newline marker emitted explicitly for lossless standard unified patches.
    hunk = list(difflib.unified_diff(before.splitlines(True), after.splitlines(True),
                fromfile='/dev/null' if old is None else 'a/' + rel, tofile='b/' + rel))
    text = f'diff --git a/{rel} b/{rel}\n'
    if old is None: text += f'new file mode {mode}\n'
    elif old_meta['mode'] != mode: text += f"old mode {old_meta['mode']}\nnew mode {mode}\n"
    for line in hunk:
        text += line if line.endswith('\n') else line + '\n\\ No newline at end of file\n'
    chunks.append(text)
    if old is not None:
        write('base-subset/' + rel, old)
        os.chmod(ROOT / 'base-subset' / rel, 0o755 if old_meta['mode'] == '100755' else 0o644)
    write('candidate-subset/' + rel, data)
    os.chmod(ROOT / 'candidate-subset' / rel, 0o755 if mode == '100755' else 0o644)
patch = ''.join(chunks).encode()
write('full-abc.patch', patch)
write('abc-pins.json', pin_bytes)
dump('FILE-INVENTORY.json', inventory)
dump('PATCHED-FILES.json', changed)
# Fresh small standalone subset, reconstructed solely from preserved exact base blobs + patch.
reconstructed = ROOT / 'reconstruction'; reconstructed.mkdir()
for row in changed:
    rel = row['path']
    if rel in base_bytes:
        p = reconstructed / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(base_bytes[rel])
        p.chmod(0o755 if base_meta[rel]['mode'] == '100755' else 0o644)
# Pure standard patch application; no repository, index, HEAD, source, runtime or tests.
result = subprocess.run(['patch', '-p1', '--batch', '--forward', '-i', str(ROOT / 'full-abc.patch')],
                        cwd=reconstructed, capture_output=True)
write('patch-application.stdout.txt', result.stdout); write('patch-application.stderr.txt', result.stderr)
assert result.returncode == 0, 'standalone patch reconstruction failed'
verified = []
for row in changed:
    rel = row['path']; p = reconstructed / rel
    data = regular(p)
    assert data == current[rel][0] and sha(data) == pins[rel], rel
    # Patch content verification is independent of executor mode behavior. Restore exact saved modes explicitly.
    p.chmod(0o755 if current[rel][1] == '100755' else 0o644)
    verified.append({'path': rel, 'bytes': len(data), 'sha256': sha(data), 'mode': current[rel][1]})
assert regular(PINS) == pin_bytes
for rel in paths: assert regular(CANDIDATE / rel) == current[rel][0], 'candidate changed during backup: ' + rel
receipt = {'purpose': 'Lossless preservation only; no implementation/landing/merge approval', 'started': started,
    'ended': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'baseRef': BASE, 'baseTree': base_tree,
    'baseSrcTree': base_src, 'basePublication': 'Published identity supplied by parent; commit object verified locally, no remote mutation/fetch',
    'candidateRoot': str(CANDIDATE), 'pinSource': str(PINS), 'pinSha256': sha(pin_bytes),
    'enumeratedFiles': len(paths), 'differingFiles': len(changed), 'addedFiles': sum(x['base'] is None for x in changed),
    'fullPatchSha256': sha(patch), 'fullPatchBytes': len(patch), 'allCandidatePinsExactBeforeAfter': True,
    'standalonePatchExit': result.returncode, 'everyPatchedFileReconstructedExactly': True, 'reconstructed': verified,
    'scopeLimits': ['Only 708 explicitly enumerated regular consumed files; no inference about unenumerated paths/deletions',
        'No fixture payloads, node_modules or symlinks captured', 'No Node, game runtime, tests or typechecks',
        'Diagnostic source/config remains explicitly unlanded preparation', 'No candidate/live/index/HEAD writes']}
dump('PRESERVATION.json', receipt)
print(json.dumps({k: receipt[k] for k in ['enumeratedFiles','differingFiles','addedFiles','fullPatchSha256','fullPatchBytes','allCandidatePinsExactBeforeAfter','everyPatchedFileReconstructedExactly']}))
