import ast,difflib,hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');B=S/'1370-an-m0-fullfunction-parent-source-20261010-r1/launch-fullfunction.py';Q=S/'1370-an-m0-fullfunction-parent-source-20261010-r2'
old=B.read_text();assert hashlib.sha256(old.encode()).hexdigest()=='6019f717cbddc322541c10d41b7fda5869751df95fe8c6ef2f45443bd9660f82'
needle=" for name,r in sp['files'].items():require(Path(r['path'])==source/name,'ROUTE_FILE_PATH');authenticate(r)"
replacement=""" require(Path(sp['files']['CONFIG.json']['path'])==source/'CONFIG.json','CONFIG_LOCAL_ROLE')
 parser_config=load(authenticate(sp['files']['CONFIG.json']))
 for name,r in sp['files'].items():
  if name in ('exact-json.mjs','run-parser-controls.mjs'):
   require(exact(r,parser_config['parserInputs'][name]) and Path(r['path'])==S/'1370-an-m0-fullfunction-qualification-source-20261010-r7'/name,'EXACT_TESTED_EXTERNAL_PARSER_ROLE')
  else:require(Path(r['path'])==source/name,'ROUTE_FILE_PATH')
  authenticate(r)"""
assert old.count(needle)==1
new=old.replace(needle,replacement).replace("S/'1370-an-m0-fullfunction-parent-recorded-20261010-r1'","S/'1370-an-m0-fullfunction-parent-recorded-20261010-r2'")
assert new!=old;ast.parse(new);Q.mkdir(mode=0o700)
def put(name,value):
 p=Q/name
 with p.open('x') as f:f.write(value);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
files={'launch-fullfunction.py':put('launch-fullfunction.py',new),'BASE-r1-parent.py.txt':put('BASE-r1-parent.py.txt',old)}
for name,a,b in [('forward.diff',old,new),('inverse.diff',new,old)]:files[name]=put(name,''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True),fromfile='before',tofile='after')))
bt=ast.parse(old);nt=ast.parse(new);checks=[]
for n in bt.body:
 if isinstance(n,ast.FunctionDef) and n.name!='main':
  x=next(v for v in nt.body if isinstance(v,ast.FunctionDef) and v.name==n.name);a=ast.get_source_segment(old,n);b=ast.get_source_segment(new,x);assert a==b;checks.append({'name':n.name,'bytes':len(a.encode()),'sha256':hashlib.sha256(a.encode()).hexdigest(),'byteExact':True})
assert len(checks)==10
proof={'schema':'1370-fullfunction-parent-r2-narrow-source-proof/v1','sourceOnly':True,'executionAuthorization':False,'baseSource':{'path':str(B),'bytes':len(old.encode()),'sha256':hashlib.sha256(old.encode()).hexdigest()},'changes':['Fresh parent-recorded-r2 once path after actual95737 consumed r1.','Only two named manifest aliases may resolve externally: exact-json.mjs and run-parser-controls.mjs, both exact fixed actually tested R7 paths and equal authenticated CONFIG.parserInputs roles. All other manifest paths remain local. Source review and every role hash still required.'],'helpers':checks,'allOtherSourceRecoveredByInverse':new.replace(replacement,needle).replace("S/'1370-an-m0-fullfunction-parent-recorded-20261010-r2'","S/'1370-an-m0-fullfunction-parent-recorded-20261010-r1'")==old,'runtimeClocksOrOwnershipOrCleanupChanged':False}
assert proof['allOtherSourceRecoveredByInverse'];files['SOURCE-PROOF.json']=put('SOURCE-PROOF.json',json.dumps(proof,sort_keys=True,indent=2)+'\n')
pins={'schema':'1370-fullfunction-parent-source-pins/v1','files':files,'executionAuthorization':False}
print(json.dumps(put('SOURCE-PINS.json',json.dumps(pins,sort_keys=True,indent=2)+'\n')))
