import ast,datetime,hashlib,json,stat
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
N=S/'1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r2'
O=S/'1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r1'
P=S/'1370-c0-renewal208-pure16-pricing-verifier-root-source-review-after-aj-20261009-r2'
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(r):
 assert role(r['path'])==r
 return r
pins=role(N/'SOURCE-PINS.json');assert pins['sha256']=='77a01dd3b821ac4a4396ee123b00f86bb28a64f6f6d5cb56dad28fcbababe175'
m=json.loads((N/'SOURCE-PINS.json').read_text());roles={**m['files'],**m['externalRoles']}
for r in roles.values():auth(r)
proof=json.loads((N/'REPAIR-PROOF.json').read_text());auth(proof['refineReceipt']);auth(proof['predecessorSourcePins'])
for pair in proof['unchangedFiles'].values():
 auth(pair['old']);auth(pair['new']);assert Path(pair['old']['path']).read_bytes()==Path(pair['new']['path']).read_bytes()
current=(N/'record-pure-node.py').read_text();restored=current
for old,new in reversed(proof['recorderInverseSubstitutions']):
 assert restored.count(new)==1;restored=restored.replace(new,old)
assert restored==(O/'record-pure-node.py').read_text()
oldconfig=json.loads((O/'CONFIG.json').read_text());config=json.loads((N/'CONFIG.json').read_text())
assert config['futureA208'] is None
assert json.loads(json.dumps(config).replace(str(N),str(O)))==oldconfig
assert hashlib.sha256((N/'CONFIG.json').read_bytes()).hexdigest() in current
core=(N/'verify-pricing-core.mjs').read_text()
assert "PURE_RENEWAL208_PRICING_PAIRS_AGREE" in core and 'renewalCauseAdmission: false' in core
assert "expected='PURE_RENEWAL208_PRICING_PAIRS_AGREE'" in current and "last.get('selectedRows')==16" in current and "last.get('renewalCauseAdmission') is False" in current
tree=ast.parse(current);main=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='main')
require_calls=[n for n in ast.walk(main) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='require']
report_gate=[n for n in require_calls if len(n.args)==2 and isinstance(n.args[1],ast.Constant) and n.args[1].value=='REPORT_ROLE'];assert len(report_gate)==1
protocol=ast.parse((N/'test-report-protocol.py').read_text());calls=[n for n in ast.walk(protocol) if isinstance(n,ast.Call)]
assert not any(isinstance(n.func,ast.Attribute) and n.func.attr in ('Popen','fork','run','system','import_module') for n in calls)
recipe=json.loads((N/'PROTOCOL-CHECK-RECIPE.json').read_text());assert recipe['executionAuthorization'] is False and recipe['actualRun'] is False
P.mkdir(mode=0o700)
r={'schema':'pure16-r2-independent-minimal-repair-review','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'decision':'ACCEPT_SOURCE_ONLY_UNRUN_PURE16_REPAIR_WITH_A208_RUNTIME_HELD','sourcePins':pins,'recorder':role(N/'record-pure-node.py'),'config':role(N/'CONFIG.json'),'priorIndependentReview':proof['refineReceipt'],'repairProof':role(N/'REPAIR-PROOF.json'),'protocolCheck':role(N/'test-report-protocol.py'),'protocolRecipe':role(N/'PROTOCOL-CHECK-RECIPE.json'),'reviewScript':role(Path(__file__)),'authenticatedRoles':roles,'findings':[],'exactFiveInverseSubstitutionsRecoverOldRecorder':True,'unchangedArithmeticAndComparators':True,'configChangesOnlyLocalPaths':True,'successSchemaMatchesFrozenCore':True,'syntheticProtocolSourceReviewedButNotExecuted':True,'executionAuthorization':False,'futureA208':None,'numericPayCausesClosed':0,'claimLimit':'Source-only three positive report predicate repair; no pricing, RNG, recorder import, protocol execution, game execution or future A208 admission. Prior independent arithmetic/source review retained. Synthetic protocol test remains held until protected lane ends.'}
o=P/'RECEIPT.json';o.write_text(json.dumps(r,indent=2,sort_keys=True)+'\n');print(json.dumps(role(o)))
