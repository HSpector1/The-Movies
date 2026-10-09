from pathlib import Path
import json
p=Path('/Users/zacheryspector/studio-scratch/1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r1')
f=json.loads((p/'CONFIG.json').read_text())
for n in ['premiumSelected','gapFacts']:
 x=json.loads(Path(f['roles'][n]['path']).read_text());row=x[0] if isinstance(x,list) else x['remainingRenewalRows'][0];print(n,list(row));print({k:v for k,v in row.items() if 'Person' not in k and 'Contract' not in k and 'Terms' not in k})
x=json.loads(Path(f['roles']['H_context']['path']).read_text().splitlines()[0]);print('CONTEXTKEYS',list(x));print(str(x)[:2000])
