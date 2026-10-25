import json
from pathlib import Path
S=Path(__file__).parent
A=Path('/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs')
def cases(path):
 d=json.loads(path.read_text());return {(Path(f['name']).name,t['fullName']):t for f in d['testResults'] for t in f['assertionResults']}
base=cases(A/'wave3m-core.json')
# Final predecessor follow-up repaired the drafting receipt expectation; preserve its earlier failure.
for path in A.glob('wave3n-*.json'):base.update(cases(path))
new=cases(S/'broader-f.json')
rows=[]
for key,t in new.items():
 if t['status']=='failed':
  old=base.get(key)
  cause=t.get('failureMessages',[''])[0].split('\n')[0]
  prior=old.get('failureMessages',[''])[0].split('\n')[0] if old and old.get('failureMessages') else None
  rows.append({'file':key[0],'test':key[1],'cause':cause,'predecessorStatus':old and old['status'],'predecessorCause':prior,'sameFirstCause':prior==cause,'duration':t.get('duration'),'predecessorDuration':old and old.get('duration')})
(S/'broader-comparison.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps(rows,indent=2))
