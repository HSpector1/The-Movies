# Bind SELECTION.json and SOURCE-MANIFEST.json to the current experimental HEAD.
# Default is check-only; pass --bind to write. Run from anywhere with python3 -I.
import hashlib, json, subprocess, sys
from pathlib import Path
X = Path('/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt')
S = Path(__file__).resolve().parent
KEYS = S.parent / 'coherent-consumers' / 'SOURCE-MANIFEST.json'
G = ['git', '-c', 'gc.auto=0', '-c', 'maintenance.auto=0', '--no-optional-locks', '-C', str(X)]
sel = json.loads((S / 'SELECTION.json').read_text())
head = subprocess.check_output(G + ['rev-parse', 'HEAD'], text=True).strip()
gameplay = sel['gameplaySource']
non_handoff = subprocess.check_output(G + ['diff', '--name-only', gameplay, head, '--', '.', ':!HANDOFF.md'], text=True).split()
assert not non_handoff, f'HEAD {head} changes non-handoff files since gameplay {gameplay}: {non_handoff}'
assert subprocess.check_output(G + ['status', '--porcelain'], text=True) == '', 'experimental tree not clean'
old = json.loads(KEYS.read_text())
manifest = {k: hashlib.sha256((X / k).read_bytes()).hexdigest() for k in old}
changed = [k for k in old if old[k] != manifest[k] and Path(k).name != 'HANDOFF.md']
handoff_moved = [k for k in old if old[k] != manifest[k] and Path(k).name == 'HANDOFF.md']
assert manifest[sel['selector']['file']] == sel['testPostimageSHA256'], 'selector postimage differs'
print(json.dumps(dict(head=head, entries=len(manifest), changedSinceCoherent=changed, handoffOnlyChanges=handoff_moved)))
if '--bind' in sys.argv:
    assert not changed, 'source changed since coherent-consumers; re-select before binding'
    (S / 'SOURCE-MANIFEST.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
    sel['head'] = head
    sel['sourceManifestEntries'] = len(manifest)
    (S / 'SELECTION.json').write_text(json.dumps(sel, indent=2) + '\n')
    print('BOUND')
