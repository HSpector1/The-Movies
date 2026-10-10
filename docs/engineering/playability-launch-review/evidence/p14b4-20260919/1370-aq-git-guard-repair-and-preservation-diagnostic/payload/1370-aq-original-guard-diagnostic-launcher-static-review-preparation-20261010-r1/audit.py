"""Retained JSON/source operands only. Never execute the actual launcher."""
from pathlib import Path
import ast,hashlib,json
S=Path('/Users/zacheryspector/studio-scratch')
F=S/'1370-aq-original-shared-postflight-diagnostic-source-20261010-r1'
OUT=S/'1370-aq-original-guard-diagnostic-launcher-static-review-20261010-r1'
def role(p):
 b=Path(p).read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
launcher=F/'launch_shared_post_diagnostic.py';text=launcher.read_text();tree=ast.parse(text)
calls=[]
for n in ast.walk(tree):
 if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='load':calls.append(ast.unparse(n.args[0]))
assert calls==['reviewRole','sp','ar',"a['failureReadback']","a['grant']","a['guardConfig']"],calls
ar=S/'1370-aq-root-continuation-20261010-r1/SHARED-POSTFLIGHT-FAILURE-OBSERVED-ADOPTION.json'
a=json.loads(ar.read_bytes());checked=[]
for name in ['failureReadback','grant','guardConfig']:
 r=a[name];assert role(Path(r['path']))==r;v=json.loads(Path(r['path']).read_bytes());assert type(v) is dict
 checked.append(dict(name=name,role=r,jsonObject=True))
guard=a['guardSource'];assert role(Path(guard['path']))==guard
config=json.loads(Path(a['guardConfig']['path']).read_bytes());old=json.loads(Path(a['grant']['path']).read_bytes())
argv=old['argv'];assert len(argv)==13 and argv[:4]==[config['requiredPythonPath'],'-I','-B',guard['path']] and argv[8]=='postflight' and argv[10:12]==[a['baseline']['path'],a['baseline']['sha256']]
baseline=json.loads(Path(a['baseline']['path']).read_bytes());assert baseline['phase']=='before-fill' and baseline['configSha256']==a['guardConfig']['sha256'] and baseline['snapshotProcedureSha256']==guard['sha256']
report={'schema':'1370-original-guard-diagnostic-launcher-operand-static-review/v1','executionAuthorization':False,'launcherExecuted':False,'originalScannerExecuted':False,'protectedTreesOrProcessesRead':False,'launcherSource':role(launcher),'loadOperandExpressions':calls,'actualJsonOperands':checked,'sourceRoleAuthenticatedWithoutJsonParsing':guard,'failureAdoption':role(ar),'originalArgvLength':13,'literalBindingIndicesVerified':True,'baselineConfigAndProcedureExact':True,'prospectiveJsonOperands':['External genuine independent review','Final source manifest'],'claimLimits':['No current process/FD/disk/Git predicate was invoked.','This finite check supplements the full independent wrapper source review; it is not runtime authority.']}
OUT.mkdir(exist_ok=False);p=OUT/'RECEIPT.json';p.write_text(json.dumps(report,indent=2)+'\n');p.chmod(0o444);OUT.chmod(0o555);print(json.dumps(role(p)))
