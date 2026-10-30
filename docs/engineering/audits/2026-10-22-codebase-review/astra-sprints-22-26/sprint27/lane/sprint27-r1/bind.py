# Bind SELECTION.json and SOURCE-MANIFEST.json to the P17 worktree HEAD: every tracked file hashed. --bind writes.
import hashlib, json, subprocess, sys
from pathlib import Path
T = Path('/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt')
S = Path(__file__).resolve().parent
G = ['git', '-c', 'gc.auto=0', '-c', 'maintenance.auto=0', '--no-optional-locks', '-C', str(T)]
head = subprocess.check_output(G + ['rev-parse', 'HEAD'], text=True).strip()
assert subprocess.check_output(G + ['status', '--porcelain'], text=True) == '', 'tree not clean'
files = [f for f in subprocess.check_output(G + ['ls-files'], text=True).split('\n') if f and (T / f).is_file()]
manifest = {f: hashlib.sha256((T / f).read_bytes()).hexdigest() for f in files}
print(json.dumps(dict(head=head, entries=len(manifest))))
if '--bind' in sys.argv:
    sel = json.loads((S / 'SELECTION.json').read_text()); sel['head'] = head; sel['sourceManifestEntries'] = len(manifest)
    (S / 'SOURCE-MANIFEST.json').write_text(json.dumps(manifest, indent=1, sort_keys=True) + '\n')
    (S / 'SELECTION.json').write_text(json.dumps(sel, indent=2) + '\n'); print('BOUND')
