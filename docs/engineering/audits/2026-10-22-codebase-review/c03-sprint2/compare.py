import json, pathlib, re
S=pathlib.Path(__file__).parent
OLD=S.parent/'p16-c03-sprint1-20261025'/'broader-f.json'
def rows(path):
 out={}
 for file in json.loads(path.read_text())['testResults']:
  for t in file['assertionResults']:
   name=t['fullName']
   # Explicit law mapping: replacement preserves pending-license authority with authentic activeProduction.
   if 'a paid sequel licence survives actual player closure' in name:
    name="r2 F1/F27/F41: a live licence survives its grantor's closure, an estate sale and archival a licensed property the handoff leaves pending (not offered) keeps its licensee's authority from the closure week on"
   key=pathlib.Path(file['name']).name+' :: '+name
   msg=(t.get('failureMessages') or [''])[0]
   msg=re.sub(r'\x1b\[[0-9;]*m','',msg)
   out[key]={'status':t['status'],'durationMs':t.get('duration'),'firstCause':msg.split('\n')[0], 'failureMessages':t.get('failureMessages',[])}
 return out
before=rows(OLD);after=rows(S/'p16-integration.json')
report={'predecessor':'f6c31caab28ee2290a5d9b8ab35a7463bacc9ce5','predecessorReport':str(OLD),'candidateSource':'771c75b7f26580e2d7a5d0ea8fb53683800c6ad9 + final-e-source.patch', 'changed':[], 'failures':[], 'over5000msDurationScreenNotBudgetVerdict':[]}
for key,t in after.items():
 old=before.get(key)
 if old is None or (old['status'],old['firstCause'])!=(t['status'],t['firstCause']):report['changed'].append({'identity':key,'before':old,'after':t})
 if t['status']=='failed':report['failures'].append({'identity':key,'samePredecessorCause':old is not None and old['firstCause']==t['firstCause'],'before':old,'after':t})
 if (t['durationMs'] or 0)>5000:report['over5000msDurationScreenNotBudgetVerdict'].append({'identity':key,'beforeMs':old['durationMs'] if old else None,'afterMs':t['durationMs']})
report['missingIdentities']=list(before.keys()-after.keys())
(S/'comparison.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'changed':len(report['changed']),'failures':len(report['failures']),'sameCauseFailures':sum(x['samePredecessorCause'] for x in report['failures']),'missing':report['missingIdentities'],'over5000DurationScreen':len(report['over5000msDurationScreenNotBudgetVerdict'])},indent=2))
for x in report['changed']:print(x['identity'],x['before']['status'] if x['before'] else 'NEW','->',x['after']['status'],x['after']['firstCause'])
