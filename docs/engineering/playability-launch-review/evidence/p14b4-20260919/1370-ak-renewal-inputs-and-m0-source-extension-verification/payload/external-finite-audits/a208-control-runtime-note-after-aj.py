from pathlib import Path
import json,hashlib
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-c0-a208-original-controls-runtime-qualification-addendum-after-aj-20261009-r1';Q.mkdir(mode=0o700)
roles={}
def obj(p,expected=None):
 p=Path(p);raw=p.read_bytes();assert len(raw)<100000
 sha=hashlib.sha256(raw).hexdigest()
 if expected:assert sha==expected
 roles[str(p)]={'path':str(p),'bytes':len(raw),'sha256':sha};return json.loads(raw)
r9=obj(S/'1370-c0-aging-era-employment-witness-independent-static-review-r9/RECEIPT.json','9652d41c68cf1adcbc6614702226a49ed5c49b4cbabd3857f96baa9134c1c75f')
result=obj(r9['actualControlsResult']['path'],r9['actualControlsResult']['sha256'])
parent=obj(S/'1370-c0-aging-era-employment-witness-r9-devnull-preparation-20261008-r1/PARENT-CONTROLS-OUTCOME.json',r9['actualControlsOutcomeSha256'])
recipe=obj(S/'1370-c0-aging-era-employment-witness-r9-devnull-preparation-20261008-r1/CONTROL-RECIPE.json')
assert len(result['records'])==17 and not any('node' in Path(x['argv'][0]).name for x in result['records'])
assert parent['actualExit']==0 and parent['argv']==recipe['argv'] and recipe['pythonRole']['path'] in parent['argv']
r6=obj(S/'1370-c0-aging-era-employment-witness-independent-static-review-r6/RECEIPT.json','02b6052169f67c29464f1b8b6c08b1fc7921a7a13f0e3b0328537b8e8e7ba8f0')
r7=obj(S/'1370-c0-aging-era-employment-witness-independent-static-review-r7/RECEIPT.json')
ad=obj(S/'1370-c0-aging-era-employment-witness-r9-adoption-output-20261008-r1/ADOPTED-LAUNCH-SPEC.json')
bind=obj(ad['bindingPath'],ad['bindingSha256'])
cfg=obj(S/'1370-c0-a208-finite-recorded-controls-filled-source-after-aj-20261009-r1/CONFIG.json','53b996cf65721bab186ed2043031fb470ad8868d838fac7ab0cd17bad81b0565')
review=obj(S/'1370-c0-a208-finite-recorded-controls-filled-independent-source-review-after-aj-20261009-r1/RECEIPT.json','e304e8707580bae518ba12e7e15eb353c2a5d67b23dbc491fba29c2cdfbda6d4')
facts={'decision':'SOURCE_ONLY_ORIGINAL_CONTROL_RUNTIME_QUALIFICATION_LIMIT_RECORDED','originalR9ControlScope':'17 shell/Git/sandbox policy probes, no Node process','actualOriginalR9ControlsToolSession':r9['actualControlsToolSession'],'actualOriginalR9ControlsExit':parent['actualExit'],'originalR9ControlsPythonRole':recipe['pythonRole'],'originalR9ControlsNodeRole':None,'inheritedR6NodeQualification':{'reportedTests':'node --test test-synthetic.mjs5/5','authenticatedNodePathVersionHashInReceipt':False},'inheritedR7NodeQualification':{'reportedTests':'Node6/6','authenticatedNodePathVersionHashInReceipt':False},'acceptedActualHistoricalR9Runtime':{'nodeExecPath':bind['nodeExecPath'],'nodeVersion':bind['nodeVersion'],'bindingSha256':ad['bindingSha256'],'requiredEnvironment':ad['requiredEnvironment'],'nodeExecutableSha256InBinding':None},'proposedCurrentA208ControlsNode':{'path':cfg['nodePath'],'bytes':cfg['nodeBytes'],'sha256':cfg['nodeSha256']},'sourceReviewPermitsOnlyUnrunControls':review['decision'],'actualA208ControlsObserved':False,'crossVersionEquivalenceEstablished':False,'pendingChoice':'Either explicitly adopt Node20-only mechanism controls and retain distinct Node22 runtime qualification, or author a fresh independently reviewed Node22 CONFIG/tool-role derivative before controls when exact-runtime qualification is intended. Preserve Node20 versions; no in-place switch/relabel.','sourceTestsNodeGameScanGitOrProtectedMutationPerformed':False,'roles':roles}
(Q/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n')
note='''Original R9 actual control qualification does not establish Node20 or Node22 synthetic-control execution. Source receipt9652d41c authenticates actual tool71024/outcome9fbdfac8/resultb3124183:17 tiny Git, shell and sandbox policy probes with Python3.14, physical executable /usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14, SHA7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835. Every recorded child argv is Git or sandbox-exec; no Node child appears. The actual policy result is source-only and the accepted reviewer expressly limits it to tiny policy controls.

The earlier accepted r6 source receipt02b605 reports unqualified node --test5/5; accepted r7 receipt reports Node6/6. These source/synthetic approvals expressly exclude real checkout/game/dependency runtime. Neither receipt pins a Node executable/version/hash or exposes an authenticated Node tool outcome. Their summaries therefore cannot substantiate the premise that original Node controls were20, or an exact Node22 control qualification. This finite audit leaves the missing tool role unknown rather than inferring it from today's shell PATH.

The accepted ACTUAL R9 binding5e1c3010 separately pins /Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node and v22.23.2, and the accepted actual frame source flights enforce that identity. The old binding does not carry a Node executable SHA; future launch tools must receive fresh authentication. New A208 controls CONFIG53b996cf explicitly selects /Users/zacheryspector/.nvm/versions/node/v20.20.2/bin/node,92,324,688B/SHAafea68f4c6280aa32707b2c037084931114a72b5c65412371244e060390c1fc6. Reviewe304 accepts that exact UNRUN source configuration, with actual control admission still pending.

Before any control run, root must make the operational qualification explicit: Node20-only bounded mechanism tests can be labelled as such, but cannot be relabelled as Node22 tests or support cross-version equivalence. If the required scope is actual R9 runtime Node22, the minimal remedy is a fresh immutable Node22 CONFIG/tool-role derivative and independent review BEFORE execution, preserving Node20 source versions and all source assertions/ownership/bounds. This note does not authorize that change, run tests or choose a runtime for the parent. No original synthetic run, Node tool hash or game qualification has been invented.
'''
(Q/'NOTE.md').write_text(note)
def role(p):b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
rec={'decision':facts['decision'],'executionAuthorization':False,'facts':role(Q/'FACTS.json'),'note':role(Q/'NOTE.md'),'author':role(Path(__file__)),'sourceQualificationGap':'Authenticated original synthetic Node executable/version/hash is not present in the bounded accepted receipts examined.','actualTestsRun':False,'A208Run':False}
(Q/'RECEIPT.json').write_text(json.dumps(rec,indent=2,sort_keys=True)+'\n');print(json.dumps({'receipt':role(Q/'RECEIPT.json'),'facts':rec['facts'],'note':rec['note']}))
