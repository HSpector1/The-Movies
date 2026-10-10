from pathlib import Path
import json, hashlib
root = Path('/Users/zacheryspector/studio-scratch')
for name in sorted(p.name for p in root.iterdir() if any(k in p.name for k in ['fixture', 'wiring', 'neutral-capture', 'typecheck-collection-route-template', 'recorded-materialization-route-proposal', 'operational-materializer-proposal'])):
    print(name)
source = root / '1370-c0-m0-real-full-body-wiring-next-slice-source-after-al-20261009-r2'
data = json.loads((source/'NEXT-SLICE.json').read_text())
for key in ['sourceManifest', 'm0BridgeInputs', 'h13ExactBinding', 'h13ExactBootstrap']:
    role=data['sourceAuthorities'][key]; p=Path(role['path']); raw=p.read_bytes()
    assert len(raw)==role['bytes'] and hashlib.sha256(raw).hexdigest()==role['sha256']
    print('\nROLE',key,role['path']); print(raw.decode())
receipt = root/'1370-c0-m0-real-full-body-wiring-next-slice-independent-source-review-after-al-20261009-r2/RECEIPT.json'
assert hashlib.sha256(receipt.read_bytes()).hexdigest() == 'af4a51151b1c04e18b6b41d03feed32b97aba7c9d3f0d7cbdc69e815d025b881'
