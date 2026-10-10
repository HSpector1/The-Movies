"""Static roster extraction; does not import or execute the control library."""
from pathlib import Path
import ast,hashlib,json
D=Path(__file__).resolve().parent
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,v):Path(p).write_text(json.dumps(v,indent=2)+'\n')
p=D/'run_guard_diagnostic_controls.py';text=p.read_text();tree=ast.parse(text);compile(text,str(p),'exec')
main=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='runGuardDiagnosticControls')
def value(n,env):
 if isinstance(n,ast.Constant):return n.value
 if isinstance(n,ast.Name):return env[n.id]
 if isinstance(n,ast.List):return [value(x,env) for x in n.elts]
 if isinstance(n,ast.Tuple):return tuple(value(x,env) for x in n.elts)
 if isinstance(n,ast.BinOp) and isinstance(n.op,ast.Add):return value(n.left,env)+value(n.right,env)
 if isinstance(n,ast.IfExp):return value(n.body if value(n.test,env) else n.orelse,env)
 if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='startswith':return value(n.func.value,env).startswith(value(n.args[0],env))
 raise AssertionError(ast.dump(n))
cases=[]
def scan(nodes,env):
 for n in nodes:
  if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call) and isinstance(n.value.func,ast.Name) and n.value.func.id=='case':
   c=n.value;cases.append(dict(zip(['id','expected','predicate'],[value(a,env) for a in c.args[:3]])))
  elif isinstance(n,ast.For):
   for item in value(n.iter,env):
    e=dict(env)
    if isinstance(n.target,ast.Name):e[n.target.id]=item
    else:
     assert isinstance(n.target,ast.Tuple)
     for target,v in zip(n.target.elts,item):e[target.id]=v
    scan(n.body,e)
scan(main.body,{})
assert len(cases)==len({r['id'] for r in cases})
matrix={'schema':'1370-original-shared-postflight-diagnostic-control-matrix/v1','cases':cases,'caseCount':len(cases),'positiveCount':sum(r['expected']=='GREEN' for r in cases),'specificNegativeCount':sum(r['expected']=='RED' for r in cases)}
put(D/'MATRIX.json',matrix)
contract={'schema':'1370-original-shared-postflight-diagnostic-independent-controls-source-contract/v1','executionAuthorization':False,'entryPoint':'runGuardDiagnosticControls(api, outputRoot)','library':role(p),'actualInjectedExports':['differences','run_original','emit','MAP_CAP','SUMMARY_CAP'],'implementationSourceManifest':None,'implementationSourceReview':None,'sourceOperandsRemainFutureUntilGenuine':True,'outputRoot':'Fresh physical disposable scratch directory supplied by the recorded control worker; no protected paths.','resultSchema':'1370-original-shared-postflight-diagnostic-independent-controls-result/v1','resultStatus':'PURE_SHARED_POSTFLIGHT_EXCEPTION_DIAGNOSTIC_CONTROLS_COMPLETE_UNADOPTED','matrix':role(D/'MATRIX.json'),'caseCount':matrix['caseCount'],'positiveCount':matrix['positiveCount'],'specificNegativeCount':matrix['specificNegativeCount'],'originalGuardExecuted':False,'protectedTreesReadOrWritten':False,'game':False,'refusalPolicy':'Each negative requires an exact original exception identity, exact declared partial-coverage predicate, or an actual streaming budget/exclusive-publication predicate. Setup/compiler/authentication failures outside those specific cases are fatal, never accepted refusal.','syntheticFrameContract':'Tiny source functions compiled only under eventual recorded grant. Exact original filename/main/line154/__file__ combinations establish controlled target frames. No original scanner function is loaded or run.','bounds':{'immutableOutputBytes':16777216,'summaryOutputBytes':32768,'traversalVisits':65536,'summaryChanges':32,'newlineIncluded':True,'expandedViewsOrWholeTreeReads':False},'aggregateControlClock':'No invented timer. Root recorded worker must use its separately reviewed original bounded route; this library does not execute now.','claimLimits':['Synthetic diagnostic mechanism and public emitter only; no protected preservation/fullscan acceptance.','Later original return cannot retroactively admit failed54871.','Incomplete diff coverage stays explicit; aggregate digests cannot identify individual protected leaves.','Static source checks will separately authenticate unchanged guard/body/argv and launcher JSON role types.']}
put(D/'CONTRACT.json',contract)
put(D/'SOURCE-PINS.json',{'schema':'1370-original-shared-postflight-diagnostic-independent-controls-source-pins/v1','executionAuthorization':False,'files':{n:role(D/n) for n in ['run_guard_diagnostic_controls.py','MATRIX.json','CONTRACT.json']},'actualControlsExecuted':False})
print(json.dumps({'sourceManifest':role(D/'SOURCE-PINS.json'),'caseCount':matrix['caseCount'],'positiveCount':matrix['positiveCount'],'specificNegativeCount':matrix['specificNegativeCount']}))
