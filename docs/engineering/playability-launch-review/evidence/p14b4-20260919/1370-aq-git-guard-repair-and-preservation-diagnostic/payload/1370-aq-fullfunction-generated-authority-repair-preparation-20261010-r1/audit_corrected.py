"""Finite source audit; no candidate imports and no private-tree enumeration."""
from pathlib import Path
import ast,hashlib,json,re
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
names=['source','parent-source','root-wrappers-source']
dirs=[S/('1370-aq-m0-fullfunction-native-refusal-diagnostic-'+n+'-20261010-r3') for n in names]
def role(p):
 b=Path(p).read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def load(p):return json.loads(Path(p).read_text())
def roles(v,at=''):
 if isinstance(v,dict):
  if set(v)=={'path','bytes','sha256'}:yield at,v
  else:
   for k,x in v.items():yield from roles(x,at+'/'+k)
 elif isinstance(v,list):
  for i,x in enumerate(v):yield from roles(x,at+'/'+str(i))
checks=[]
for d in dirs:
 m=load(d/'SOURCE-PINS.json')
 for n,r in m['files'].items():assert role(r['path'])==r,(d.name,n)
 for name in ['CONFIG.json','RECIPE.json']:
  p=d/name
  if not p.exists():continue
  for key,r in roles(load(p)):
   assert role(r['path'])==r,(name,key,'ROLE_MISMATCH',r)
 for n,r in m['files'].items():
  if Path(r['path']).parent!=d or not n.endswith(('.py','.mjs','.ts','.mts')):continue
  text=Path(r['path']).read_text()
  for old in ['1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2','1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r2','1370-aq-m0-fullfunction-native-refusal-diagnostic-root-wrappers-source-20261010-r2']:
   assert old not in text,(n,'STALE_SOURCE_SELECTOR',old)
  if n.endswith('.py'):compile(text,str(Path(r['path'])),'exec')
  checks.append({'file':n,'role':r,'noStaleEvaluatedSourceSelector':True})
 # Exact original definitions must remain untouched except declared authority/main changes.
 prior=S/(d.name[:-1]+'2');unchanged={};changed={}
 for n in m['files']:
  if not n.endswith('.py') or Path(m['files'][n]['path']).parent!=d:continue
  def funcs(p):
   t=Path(p).read_text();return {x.name:ast.get_source_segment(t,x) for x in ast.parse(t).body if isinstance(x,(ast.FunctionDef,ast.ClassDef))}
  a=funcs(prior/n);b=funcs(d/n);assert set(a)==set(b)
  changed[n]=[k for k in a if a[k]!=b[k]];unchanged[n]=[k for k in a if a[k]==b[k]]
  expected={'run-fullfunction.py':['authenticate_current_protection'],'record-fullfunction.py':[],'launch-fullfunction.py':['main'],'read-fullfunction.py':['main'],'run_observer_fullfunction_once.py':[],'run_observer_reader_once.py':[]}[n]
  assert changed[n]==expected,(n,changed[n])
 proof=load(d/'WHOLE-FORWARD-INVERSE.json')
 import difflib
 for n,v in proof.items():
  assert ''.join(difflib.restore(v['losslessNdiff'],1))==Path(v['baseline']['path']).read_text()
  assert ''.join(difflib.restore(v['losslessNdiff'],2))==(d/n).read_text()
 checks.append({'package':d.name,'unchangedDefinitions':unchanged,'changedDefinitions':changed,'wholeInverseApplications':2*len(proof)})
F,P,W=dirs;c=load(F/'CONFIG.json');fr=load(F/'RECIPE.json');pm=load(P/'SOURCE-PINS.json');wr=load(W/'RECIPE.json');pr=load(P/'RECIPE.json');fm=load(F/'SOURCE-PINS.json')
assert fr['sourcePins']==fr['routeSourcePins']=={n:fm['files'][n] for n in c['reviewAliases']}
assert fr['config']==pr['config']==fm['files']['CONFIG.json']
assert pr['sourceManifest']==wr['sourceManifest']==role(F/'SOURCE-PINS.json')
assert wr['parentSourceManifest']==role(P/'SOURCE-PINS.json')
assert c['currentProtection']==fr['currentProtection']==pr['currentProtection']==wr['currentProtection']
assert c['bounds']==load(S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2/CONFIG.json')['bounds']
assert c['typesAdoptionContract']['reviewSchema']=='1370-m0-external-config-types-independent-observed-review/v1'
for n in ['outputPath','recorderOutputPath','parentRecordedPath','laneLog']:assert c[n]==wr['outputs'][n] and c[n].endswith('-r2')
oldcore=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2/CORE-TEST-TEMPLATE.ts'
assert (F/'CORE-TEST-TEMPLATE.ts').read_text().replace(c['operationalHead'],'f2f97c622db7f5332164b790d1646355e89c00f4')==oldcore.read_text()
report={'schema':'1370-aq-corrected-fullfunction-author-static-audit/v1','executionAuthorization':False,'candidateExecuted':False,'privateTreesRead':False,'route':role(F/'SOURCE-PINS.json'),'parent':role(P/'SOURCE-PINS.json'),'wrappers':role(W/'SOURCE-PINS.json'),'checks':checks,'exactTwentyAliases':True,'currentTemplateHeadAndTreeChecked':True,'boundsAndTypesContractUnchanged':True,'pendingActualFields':c['heldUnfilledActualRoles']}
(D/'STATIC-AUDIT.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(role(D/'STATIC-AUDIT.json')))
