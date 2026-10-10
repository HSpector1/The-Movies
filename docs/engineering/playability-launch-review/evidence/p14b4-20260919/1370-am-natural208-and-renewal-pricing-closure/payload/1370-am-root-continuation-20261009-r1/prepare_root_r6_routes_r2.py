import ast,hashlib,json,os
from pathlib import Path
A=Path('/Users/zacheryspector/studio-scratch/1370-am-root-continuation-20261009-r1')
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
common=[
 ('1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r2','1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r4'),
 ('05c10ea344c211e4a57e55229a2b7b9244a86e7cf76919efeb08f0a410877572','f27d8eae1416d94346dd43e495acad272bd203dfb1270c818e2ca949bdb35d15'),
 ('1370-c0-m0-proof-types-parent-launch-preparation-independent-source-review-after-al-20261009-r2','1370-c0-m0-proof-types-parent-launch-preparation-independent-source-review-after-al-20261009-r4'),
 ('d60c40db318d682289988ad4c86fa27d964d2c555e85d18919def1a1dc794d7c','63f3482c050b339375eb868178a614ff5d2191b2712cc454e619094c127306c5'),
 ('1370-c0-m0-types-collection-source-independent-review-after-al-20261009-r5','1370-c0-m0-types-collection-source-independent-review-after-al-20261009-r6'),
 ('d857ef103c2a6214d69bf10a2695eda1fdbba7cbe80fa1ac0c0b39c4c0b21de0','0b2402bc664192c3a57b73bed3ce7e461d50171e8d01d5d0261ed4c921a101ea'),
 ("assert mode in ('proof','types')","assert mode=='types'"),
 ('M0-CURRENT-TYPES-PROTECTION.json','M0-CURRENT-TYPES-PROTECTION-R6.json'),
 ("'-prelaunch-parent-after-al-20261009-r2'","'-prelaunch-parent-after-al-20261009-r3'"),
 ("'-prelaunch-output-after-al-20261009-r2'","'-prelaunch-output-after-al-20261009-r3'"),
 ("'-PRELAUNCH-CONFIG.json'","'-PRELAUNCH-CONFIG-R6.json'"),
 ("'-PREFLIGHT-OBSERVED-ADOPTION.json'","'-PREFLIGHT-OBSERVED-ADOPTION-R6.json'"),
 ('M0-TYPES-PREFLIGHT-OBSERVED-ADOPTION.json','M0-TYPES-PREFLIGHT-OBSERVED-ADOPTION-R6.json'),
 ('1370-c0-m0-types-parent-recorded-after-al-20261009-r5','1370-c0-m0-types-parent-recorded-after-al-20261009-r6'),
 ("'-fullguard-postflight-parent-after-al-20261009-r2'","'-fullguard-postflight-parent-after-al-20261009-r3'"),
 ('1370-c0-m0-types-fullguard-postflight-parent-after-al-20261009-r2','1370-c0-m0-types-fullguard-postflight-parent-after-al-20261009-r3'),
 ("('postflight-after-al-m0-'+mode+'-r2')","('postflight-after-al-m0-'+mode+'-r3')")]
specs=[
 ('run_m0_preflight_once.py','run_m0_preflight_r6_once.py',[
  ('M0-CURRENT-PROOF-OBSERVED-ADOPTION.json','M0-TYPES-STOP-OBSERVED-ADOPTION.json'),
  ('ROOT_ADOPTED_CURRENT_M0_SOURCE_DEPENDENCY_PROOF_WITH_FULL_POSTFLIGHT','ROOT_ADOPTED_OBSERVED_STOP_M0_TYPES_ROOT_TS5097_WITH_FULL_PROTECTED_POSTFLIGHT')]),
 ('read_m0_preflight.py','read_m0_preflight_r6.py',[]),
 ('run_m0_route_once.py','run_m0_types_r6_once.py',[]),
 ('read_m0_types.py','read_m0_types_r6.py',[]),
 ('run_m0_postflight_once.py','run_m0_postflight_r6_once.py',[]),
 ('read_m0_postflight.py','read_m0_postflight_r6.py',[("sys.argv[1] in ('proof','types')","sys.argv[1]=='types'")]),
 ('adopt_m0_types.py','adopt_m0_types_r6.py',[])]
rows=[]
for oldname,newname,specific in specs:
 old=A/oldname;original=old.read_text();body=original;edits=[]
 for before,after in common+specific:
  count=body.count(before)
  if not count:
   assert (before,after) not in specific,(oldname,before)
   continue
  body=body.replace(before,after);edits.append({'before':before,'after':after,'count':count})
 assert body!=original
 inverse=body
 for e in reversed(edits):
  assert inverse.count(e['after'])==e['count'],(oldname,e)
  inverse=inverse.replace(e['after'],e['before'])
 assert inverse==original
 ast.parse(body,filename=newname)
 p=A/newname
 with p.open('x') as f:f.write(body);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);rows.append({'original':role(old),'derivative':role(p),'exactReplacements':edits,'wholeFileInverseEqualsOriginal':True,'syntaxParsedOnly':True})
d={'schema':'1370-root-m0-r6-route-binding-derivatives/v1','status':'ROOT_SOURCE_BINDING_PREPARATION_ONLY','files':rows,'executionAuthorization':False,'actualR6Outcome':None,'scope':'Rebind genuine reviewed R6 executor/R4 parent, retain original functions, use fresh paths and genuinely adopted R5 STOP full postflight for next preflight. No original failure or evidence overwritten; actual future grants and outcomes remain separate.'}
print(json.dumps(put(A/'M0-R6-ROOT-ROUTE-BINDING-PROOF.json',d)))
