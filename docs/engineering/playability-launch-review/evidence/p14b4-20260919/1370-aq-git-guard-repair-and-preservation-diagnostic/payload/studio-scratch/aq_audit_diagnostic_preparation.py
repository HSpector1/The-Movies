import ast,hashlib,json
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');D=S/'1370-aq-original-shared-postflight-diagnostic-source-20261010-r1'
def role(p):
 b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
a=json.loads((S/'1370-aq-root-continuation-20261010-r1/SHARED-POSTFLIGHT-FAILURE-OBSERVED-ADOPTION.json').read_bytes())
checked={}
for key in ('failureReadback','independentObservedReview','grant','guardSource','guardConfig','baseline'):
 r=a[key];assert role(Path(r['path']))==r;checked[key]={'roleAuthenticated':True,'parsedAsJSON':key!='guardSource'}
 if key!='guardSource':json.loads(Path(r['path']).read_bytes())
old=json.loads(Path(a['grant']['path']).read_bytes());argv=old['argv'];assert len(argv)==13 and argv[3]==a['guardSource']['path'] and argv[8]=='postflight' and argv[10:12]==[a['baseline']['path'],a['baseline']['sha256']]
for n in ('diagnose_shared_post.py','launch_shared_post_diagnostic.py','read_shared_post_diagnostic.py'):ast.parse((D/n).read_text())
report={'schema':'1370-original-shared-postflight-diagnostic-preparation-audit/v1','finiteRoleKinds':checked,'actualOriginalArgvPositionsVerified':True,'originalScannerNeverExecuted':True,'candidateNeverImported':True,'privateTreeTraversal':False,'preparationFindingsCorrected':[{'finding':'Unsealed initial launcher loop parsed Python guard source as JSON','correction':'Authenticate mixed role bytes only; parse JSON only at actual JSON consumers','runtimeOccurred':False},{'finding':'Draft role comparison included atime via stat_result equality','correction':'Compare stable dev/inode/mode/nlink/size/mtime/ctime fields only','runtimeOccurred':False}],'completeMapSurvivesSummaryFailureInReadback':True}
(D/'PREPARATION-AUDIT.json').write_text(json.dumps(report,sort_keys=True,indent=2)+'\n');print(json.dumps(report))
