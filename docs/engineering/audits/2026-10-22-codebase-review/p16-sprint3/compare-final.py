import json,re
from pathlib import Path
s=Path(__file__).resolve().parent
old=Path('/Users/zacheryspector/studio-scratch/p16-c03-sprint2-20261025/p16-integration.json')
def rows(p):
 return {(Path(f['name']).name,t['fullName']):t for f in json.load(open(p))['testResults'] for t in f['assertionResults']}
a,b=rows(old),rows(s/'p16-integration.json')
out=[]
for key,t in b.items():
 prior=a.get(key)
 if prior is None and key[0]=='p16-r2-acquisition.test.ts' and 'whole dollars' in key[1]:
  prior=next(v for (f,n),v in a.items() if f==key[0] and 'at the ask' in n)
 out.append(dict(file=key[0],test=key[1],before=prior['status'] if prior else None,after=t['status'],beforeMs=prior.get('duration') if prior else None,afterMs=t.get('duration'),failureMessages=t['failureMessages']))
(s/'final-comparison.json').write_text(json.dumps(out,indent=2)+'\n')
print('passed',sum(t['after']=='passed' for t in out),'failed',sum(t['after']=='failed' for t in out),'old failures now',[(t['file'],t['after']) for t in out if t['before']=='failed'])
print('durations above 5000ms',sum((t['afterMs'] or 0)>5000 for t in out),'(screen only; larger explicit budgets exist)')
for t in out:
 if t['after']=='failed' or ((t['afterMs'] or 0)>5000 and ('estate' in t['file'] or 'authority' in t['file'] or 'join' in t['file'])): print(t['file'],t['test'],t['beforeMs'],t['afterMs'],t['failureMessages'])
