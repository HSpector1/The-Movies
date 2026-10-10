from pathlib import Path
import hashlib
import json
import os
import subprocess

OUT = Path(__file__).parent
SRC = Path('/Users/zacheryspector/studio-specialists/p16/src/core/save.ts')
R1 = OUT.parent / '1370-as-p16-type-repair-20261010-r1'

def role(path):
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

if (OUT / 'BEFORE.json').exists():
    raise RuntimeError('R2 original already preserved')
changes = json.loads((R1 / 'CHANGED-FILES.json').read_text())
expected = next(row['after'] for row in changes['files'] if row['name'] == 'src/core/save.ts')
if role(SRC) != expected:
    raise RuntimeError('current save differs from preserved R1 result')
ps = subprocess.run(['ps', '-axo', 'pid,ppid,command'], capture_output=True, text=True, check=True, timeout=10).stdout
hits = []
for line in ps.splitlines()[1:]:
    parts = line.strip().split(None, 2)
    if len(parts) == 3 and int(parts[0]) != os.getpid() and '/Users/zacheryspector/studio-specialists/p16' in parts[2]:
        hits.append(line.strip())
if hits:
    raise RuntimeError('target clone process observed: ' + repr(hits))
dest = OUT / 'before' / 'src' / 'core' / 'save.ts'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_bytes(SRC.read_bytes())
if role(SRC) != expected:
    raise RuntimeError('source changed during backup')
(OUT / 'BEFORE.json').write_text(json.dumps({'schema': '1370-p16-type-repair-correction-before/v1', 'source': expected, 'backup': role(dest), 'preservedR1SourcePins': role(R1 / 'SOURCE-PINS.json'), 'targetCloneArgvMatches': [], 'executionAuthorization': False}, indent=2) + '\n')
print(json.dumps({'before': role(OUT / 'BEFORE.json')}))
