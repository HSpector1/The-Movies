import ast,difflib,hashlib,json,pathlib
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
T=S/'1370-aq-original-guard-diagnostic-pure-controls-recorded-source-20261010-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(r):
 p=pathlib.Path(r['path']);assert role(p)==r;return p.read_text()
m=json.loads((T/'SOURCE-PINS.json').read_text())
for r in m['files'].values():auth(r)
p=json.loads((T/'RECORDER-WHOLE-INVERSE.json').read_text());print('proof keys',list(p))
base=auth(p['baseline']);new=(T/'record_pure_controls.py').read_text()
assert ''.join(difflib.restore(p['losslessNdiff'],1))==base
assert ''.join(difflib.restore(p['losslessNdiff'],2))==new
def defs(s):
 t=ast.parse(s);return {n.name:ast.get_source_segment(s,n) for n in t.body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
b,n=defs(base),defs(new)
for k in b:
 if k!='main':assert b[k]==n[k],k
c=json.loads((T/'CONFIG.json').read_text());recipe=json.loads((T/'RECIPE.json').read_text())
assert recipe['config']==role(T/'CONFIG.json')
assert recipe['python']==c['python'];assert role(pathlib.Path(c['python']['path']))==c['python']
for prefix in ['diagnostic','controls']:
 mm=json.loads(auth(c[prefix+'SourceManifest']));rr=json.loads(auth(c[prefix+'SourceReview']))
 for r in mm['files'].values():auth(r)
 assert rr['sourceManifest']==c[prefix+'SourceManifest']
 for k in c[prefix+'Aliases']:assert rr['sourcePins'][k]==rr['routeSourcePins'][k]==mm['files'][k]
 if prefix=='controls':matrix=json.loads(auth(mm['files']['MATRIX.json']))
assert matrix['caseCount']==32 and matrix['positiveCount']==9 and matrix['specificNegativeCount']==23
assert recipe['laneArgv'][4:]==recipe['recorderArgv']
assert recipe['laneArgv'][2]=='0'
for f in ['run_pure_controls.py','record_pure_controls.py']:ast.parse((T/f).read_text())
caller=S/'1370-aq-root-continuation-20261010-r1/launch_guard_diagnostic_pure32.py';ast.parse(caller.read_text())
print(json.dumps({'manifest':role(T/'SOURCE-PINS.json'),'helperDefinitionsExact':len(b)-1,'rootLauncherRole':role(caller),'matrixCount':32}))
R=S/'1370-aq-original-guard-diagnostic-pure-runner-independent-source-review-20261010-r1'
R.mkdir(mode=0o700)
aliases={k:m['files'][k] for k in ['run_pure_controls.py','record_pure_controls.py','CONFIG.json']}
receipt={'schema':'1370-original-guard-diagnostic-pure-runner-independent-source-review/v1','decision':'ACCEPT_STATIC_ORIGINAL_GUARD_DIAGNOSTIC_PURE_RECORDED_RUNNER_SOURCE_ONLY','sourceManifest':role(T/'SOURCE-PINS.json'),'sourcePins':aliases,'routeSourcePins':aliases,'rootLauncherRole':role(caller),'concreteFindings':[],'executionAuthorization':False,'reviewScope':{'sourceOnly':True,'candidateModulesImported':False,'controlsExecuted':False,'originalScannerExecuted':False,'protectedTreesReadOrWritten':False,'game':False,'manifestPayloadRolesAuthenticated':len(m['files']),'completeInverseApplications':2,'originalHelperAndClassDefinitionsByteExact':17,'matrixCaseCount':32,'positiveCount':9,'specificNegativeCount':23,'nonMainImports':['authenticated_pure_diagnostic_module','authenticated_pure_diagnostic_controls'],'originalBoundsSeconds':{'aggregateChild':300,'activeRecorder':320,'wholeRecorder':330},'streamBytes':8388608,'reportBytes':131072,'syntheticArtifactBytes':67108864,'helperSecondsOperand':0,'helperHasNoOverallWatchdog':True},'findingsRationale':['Both complete recorder inverse applications reproduce authenticated original and final bytes; all definitions except main are byte exact.','Worker authenticates source and control review schemas, decisions, aliases and all payload roles before the two non-main imports; controls use synthetic injected runners and authenticated expected-code seams, never the original scanner default.','Actual matrix order and specific predicates are compared exactly; unknown control errors fail the worker rather than becoming RED.','Recorder preserves pre-exec owned process-group handshake, aggregate clocks, streams, reaping and group cleanup; nonzero, timeout and override take precedence.','Root caller authenticates exact receipt and self role, evaluated fresh paths, physical Python and helper, then records genuine PID/PGID/SID and direct-execs original lane helper with operand0.','Synthetic emitter files are explicitly LOCAL_HASH_SIZE_ONLY; no current protection, retroactive failed-postflight acceptance or original-scan claim is made.'],'limitations':['Pure controls remain unrun. Actual helper/worker exits, groups, result and fresh absence checks require root recording and observed review.','Inherited recorder return-in-finally warning is qualified separately from the required empty worker stderr.'],'authorAuditAttempts':['Initial read command lacked existing workdir and failed without reading source; corrected explicit scratch workdir.','Requested guessed proof filename was absent; actual manifest supplied RECORDER-WHOLE-INVERSE.json.','First audit authenticated physical Python bytes then accidentally attempted UTF8 decode of the executable; UnicodeDecodeError preserved in tool output, corrected to byte-only authentication. No candidate execution occurred.']}
p=R/'RECEIPT.json';p.write_text(json.dumps(receipt,sort_keys=True,indent=2)+'\n');p.chmod(0o444);R.chmod(0o555);print(json.dumps(role(p)))
