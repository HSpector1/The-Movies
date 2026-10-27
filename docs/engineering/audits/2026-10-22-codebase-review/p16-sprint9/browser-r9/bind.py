# Bind SELECTION.json and SOURCE-MANIFEST.json to the current experimental HEAD.
# Default is check-only; pass --bind to write. Run from anywhere with python3 -I.
import hashlib, json, subprocess, sys
from pathlib import Path
X = Path('/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt')
S = Path(__file__).resolve().parent
KEYS = Path('/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-obligations/coherent-consumers/SOURCE-MANIFEST.json')
G = ['git', '-c', 'gc.auto=0', '-c', 'maintenance.auto=0', '--no-optional-locks', '-C', str(X)]
sel = json.loads((S / 'SELECTION.json').read_text())
head = subprocess.check_output(G + ['rev-parse', 'HEAD'], text=True).strip()
gameplay = sel['gameplaySource']
ALLOWED = {'HANDOFF.md','tests/bridge.test.ts','tests/bridge-stabilization-l22-retired-projections.test.ts','tests/bridge-p14b6-relationship-read-models.test.ts','tests/bridge-p14b4-runtime47-compatibility.test.ts','tests/p16-healthy-new-drafting171.test.ts','tests/p16-stopped-drafting171-refusals.test.ts','ui/playwright.config.ts','ui/e2e/smoke.spec.ts'}
changed_files = set(subprocess.check_output(G + ['diff', '--name-only', gameplay, head], text=True).split())
assert changed_files <= ALLOWED, f'HEAD {head} changes unexpected files since gameplay {gameplay}: {sorted(changed_files - ALLOWED)}'
assert subprocess.check_output(G + ['status', '--porcelain'], text=True) == '', 'experimental tree not clean'
old = json.loads(KEYS.read_text())
manifest = {k: hashlib.sha256((X / k).read_bytes()).hexdigest() for k in old}
changed = [k for k in old if old[k] != manifest[k] and Path(k).name != 'HANDOFF.md' and k not in ALLOWED and not any(k.endswith('/'+a) for a in ALLOWED)]
handoff_moved = [k for k in old if old[k] != manifest[k] and Path(k).name == 'HANDOFF.md']
print(json.dumps(dict(head=head, entries=len(manifest), changedSinceCoherent=changed, handoffOnlyChanges=handoff_moved)))
if '--bind' in sys.argv:
    assert not changed, 'source changed since coherent-consumers; re-select before binding'
    (S / 'SOURCE-MANIFEST.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
    sel['head'] = head
    sel['sourceManifestEntries'] = len(manifest)
    (S / 'SELECTION.json').write_text(json.dumps(sel, indent=2) + '\n')
    print('BOUND')
