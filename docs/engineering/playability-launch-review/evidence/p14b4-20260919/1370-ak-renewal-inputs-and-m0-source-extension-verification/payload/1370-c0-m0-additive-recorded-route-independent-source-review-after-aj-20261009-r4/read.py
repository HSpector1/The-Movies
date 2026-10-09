from pathlib import Path
import json
p=Path('/Users/zacheryspector/studio-scratch/1370-c0-m0-additive-recorded-route-proposal-20261009-r4')
x=json.loads((p/'PROVENANCE.json').read_text())
for r in x['roles']:
 if any(v in r['path'] for v in ['independent-source-review','SOURCE-ACCEPTANCE-ADDENDUM','observed-independent-review']):print('ROLE',r);print(Path(r['path']).read_text())
