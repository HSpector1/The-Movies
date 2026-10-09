from pathlib import Path
import ast,json,hashlib
p=Path('/Users/zacheryspector/studio-scratch/1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r2')
x=json.loads((p/'SOURCE-PINS.json').read_text())
for n,r in x['files'].items():
 b=(p/n).read_bytes();assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
for n in ['record-pure-node.py','test-report-protocol.py']:ast.parse((p/n).read_text())
c=json.loads((p/'CONFIG.json').read_text());assert c['futureA208'] is None
for r in c['roles'].values():
 b=Path(r['path']).read_bytes();assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
print(json.dumps({'sourceReadback':'PASS','pinnedFiles':len(x['files']),'configRoles':len(c['roles']),'testExecuted':False,'proposalImported':False}))
