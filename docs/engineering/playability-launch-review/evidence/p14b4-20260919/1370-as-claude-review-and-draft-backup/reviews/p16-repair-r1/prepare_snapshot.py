from pathlib import Path
import hashlib
import json
import os
import subprocess

ROOT = Path('/Users/zacheryspector/studio-specialists/p16')
OUT = Path(__file__).parent
NAMES = ('src/core/financeReport.ts', 'src/core/save.ts', 'tests/p16a-save-v46.test.ts', 'tests/p16a-valuation.test.ts')
RED = Path('/Users/zacheryspector/studio-scratch/1370-ar-p16-rights-estate-implementation-20261010-r1/evidence/tsc-run1.txt')

def role(path):
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

def identity(path):
    s = path.stat()
    return [s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns]

def write_json(name, data):
    (OUT / name).write_text(json.dumps(data, indent=2) + '\n')

if (OUT / 'BEFORE.json').exists():
    raise RuntimeError('snapshot already exists')
ps = subprocess.run(['ps', '-axo', 'pid,ppid,command'], check=True, capture_output=True, text=True, timeout=10).stdout
hits = []
for line in ps.splitlines()[1:]:
    parts = line.strip().split(None, 2)
    if len(parts) != 3 or int(parts[0]) == os.getpid():
        continue
    if str(ROOT) in parts[2]:
        hits.append(line.strip())
if hits:
    write_json('PROCESS-STOP.json', {'reason': 'process argv references target clone; refuse to edit', 'matches': hits})
    raise RuntimeError('observed process references target clone')
write_json('PROCESS-CHECK.json', {'command': ['ps', '-axo', 'pid,ppid,command'], 'exitCode': 0, 'targetClone': str(ROOT), 'targetCloneArgvMatches': [], 'meaning': 'No process argv referencing the clone was observed. Earlier Claude cwd checks returned /Users/zacheryspector for PIDs 80155 and 81602. This does not prove an idle editor cannot write later; exact file identity and SHA checks gate the edits.'})
rows = []
for name in NAMES:
    src = ROOT / name
    before = identity(src)
    data = src.read_bytes()
    if before != identity(src):
        raise RuntimeError('file changed during snapshot: ' + name)
    dest = OUT / 'before' / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    rows.append({'name': name, 'original': role(src), 'backup': role(dest), 'identityBefore': before})
red_copy = OUT / 'prior-evidence' / 'tsc-run1.txt'
red_copy.parent.mkdir(parents=True, exist_ok=True)
red_copy.write_bytes(RED.read_bytes())
write_json('BEFORE.json', {'schema': '1370-p16-bounded-type-repair-before/v1', 'clone': str(ROOT), 'files': rows, 'priorIndependentCompilerEvidence': role(RED), 'priorEvidenceBackup': role(red_copy), 'compilerExecutedByThisTask': False})
for row in rows:
    src = ROOT / row['name']
    if role(src) != row['original'] or identity(src) != row['identityBefore']:
        raise RuntimeError('file changed after snapshot: ' + row['name'])
print(json.dumps({'snapshot': role(OUT / 'BEFORE.json'), 'originalFileCount': len(rows), 'priorEvidence': role(RED)}))
