"""Data-only recorder main derivative; ownership/clocks/cleanup functions preserved."""
from pathlib import Path
import ast,difflib,hashlib,json
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
BASE=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2/record-fullfunction.py'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
F=S/'1370-aq-original-shared-postflight-diagnostic-source-20261010-r1';C=S/'1370-aq-original-guard-diagnostic-independent-controls-source-20261010-r2'
cfg={'schema':'1370-original-guard-diagnostic-pure-config/v1','executionAuthorization':False,'diagnosticSourceManifest':role(F/'SOURCE-PINS.json'),'diagnosticSourceReview':role(S/'1370-aq-original-shared-postflight-diagnostic-independent-source-review-20261010-r1/RECEIPT.json'),'diagnosticAliases':['diagnose_shared_post.py','launch_shared_post_diagnostic.py','read_shared_post_diagnostic.py'],'controlsSourceManifest':role(C/'SOURCE-PINS.json'),'controlsSourceReview':role(S/'1370-aq-original-guard-diagnostic-controls-independent-source-review-20261010-r2/RECEIPT.json'),'controlsAliases':['run_guard_diagnostic_controls.py','MATRIX.json','CONTRACT.json','R1-TO-R2-WHOLE-INVERSE.json'],'outputPath':str(S/'1370-aq-original-guard-diagnostic-pure-controls-results-20261010-r1'),'recorderOutputPath':str(S/'1370-aq-original-guard-diagnostic-pure-controls-recorder-results-20261010-r1'),'laneLog':str(S/'1370-aq-original-guard-diagnostic-pure-controls-lane-20261010-r1'),'bounds':{'aggregateChild':300,'activeRecorder':320,'wholeRecorder':330,'streamBytes':8388608,'resultBytes':131072,'syntheticArtifactBytes':67108864}}
binding=json.loads((S/'1370-aq-root-continuation-20261010-r1/NATIVE-REFUSAL-FULLFUNCTION-ROOT-BINDING.json').read_text());helper=binding['helper'];python=binding['runtimeTools']['python'];cfg['python']=python
put(D/'CONFIG.json',cfg);old=BASE.read_text();t=old
import re
t=re.sub(r"CONFIG_SHA='[^']+';WORKER_SHA='[^']+'",f"CONFIG_SHA='{role(D/'CONFIG.json')['sha256']}';WORKER_SHA='{role(D/'run_pure_controls.py')['sha256']}'",t,count=1)
t=t.replace("SCRATCH/'1370-aq-m0-fullfunction-native-refusal-diagnostic-recorder-results-20261010-r1'",'SCRATCH/'+repr(Path(cfg['recorderOutputPath']).name))
a=t.index("  configraw=(HERE/'CONFIG.json')");b=t.index('  out_read,out_write=os.pipe()',a)
t=t[:a]+'''  configraw=(HERE/'CONFIG.json').read_bytes();require(sha(configraw)==CONFIG_SHA,'CONFIG_HASH');config=json.loads(configraw);require(config['schema']=='1370-original-guard-diagnostic-pure-config/v1' and config['executionAuthorization'] is False,'PURE_CONFIG')
  grantpath=pathlib.Path(sys.argv[2]);authenticate(grantpath,sys.argv[3],128*1024);grant=json.loads(grantpath.read_bytes())
  require(grant['schema']=='1370-root-original-guard-diagnostic-pure-controls-once-grant/v1' and grant['executionAuthorization'] is True and grant['oneAggregateRun'] is True and grant['automaticRetry'] is False,'ROOT_PURE_ONCE_GRANT')
  require(grant['config']['sha256']==CONFIG_SHA and grant['bounds']==config['bounds'],'EXACT_PURE_BOUNDS')
  script=HERE/'run_pure_controls.py';authenticate(script,WORKER_SHA,128*1024)
  python=grant['python'];require(python==config['python'],'PINNED_PYTHON_ROLE');authenticate(python['path'],python['sha256'],128*1024**2);require(os.access(python['path'],os.X_OK),'PYTHON_EXECUTABLE');active_guard(started)
  output=OUTPUTS[mode];require(output.parent==SCRATCH and SCRATCH.resolve(strict=True)==SCRATCH and not os.path.lexists(output),'ABSENT_OWNED_OUTPUT');output.mkdir(mode=0o700)
  argv=[python['path'],'-I','-B',str(script),str(grantpath),sys.argv[3]]
'''+t[b:]
a=t.index("     last=json.loads(bytes(buffers['stdout'])");b=t.index('    except BaseException as exc:',a)
t=t[:a]+'''     last=json.loads(bytes(buffers['stdout']).splitlines()[-1]);expected='PURE_SHARED_POSTFLIGHT_EXCEPTION_DIAGNOSTIC_CONTROLS_COMPLETE_UNADOPTED'
     require(last.get('status')==expected and last['caseCount']==32 and not buffers['stderr'],'PURE_WORKER_FRAME')
     rr=last['result'];require(set(rr)=={'path','bytes','sha256'} and rr['path']==str(pathlib.Path(config['outputPath'])/'RESULT.json') and type(rr['bytes']) is int and 0<rr['bytes']<=128*1024,'PURE_REPORT_ROLE')
     authenticate(rr['path'],rr['sha256'],128*1024);report=json.loads(pathlib.Path(rr['path']).read_bytes())
     require(report['status']==expected and report['caseCount']==32 and report['positiveCount']==9 and report['specificNegativeCount']==23 and report['originalGuardExecuted'] is False and report['protectedTreesReadOrWritten'] is False and report['game'] is False and report['executionAuthorization'] is False,'PURE_COMPLETE_SCOPE');active_guard(started)
'''+t[b:]
t=t.replace("'1370-real-fullfunction-qualification-recorder/v1'","'1370-original-guard-diagnostic-pure-recorder/v1'").replace("'REAL_FULLFUNCTION_QUALIFICATION_COMPLETE_UNADOPTED'","'PURE_DIAGNOSTIC_CONTROLS_COMPLETE_UNADOPTED'").replace("'realGameplayPrefixScope':True","'realGameplayPrefixScope':False,'pureMechanismControlsOnly':True")
(D/'record_pure_controls.py').write_text(t)
def funcs(text):return {n.name:ast.get_source_segment(text,n) for n in ast.parse(text).body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
of=funcs(old);nf=funcs(t);assert set(of)==set(nf);assert [n for n in of if of[n]!=nf[n]]==['main']
delta=list(difflib.ndiff(old.splitlines(True),t.splitlines(True)));assert ''.join(difflib.restore(delta,1))==old and ''.join(difflib.restore(delta,2))==t
put(D/'RECORDER-WHOLE-INVERSE.json',{'baseline':role(BASE),'losslessNdiff':delta,'bothApplicationsVerified':True,'unchangedDefinitions':[n for n in of if n!='main'],'onlyChangedDefinition':'main','original300320330And8MiBStreamsUnchanged':True})
binding=json.loads((S/'1370-aq-root-continuation-20261010-r1/NATIVE-REFUSAL-FULLFUNCTION-ROOT-BINDING.json').read_text());helper=binding['helper'];python=binding['runtimeTools']['python']
assert role(Path(helper['path']))==helper and role(Path(python['path']))==python
recipe={'schema':'1370-original-guard-diagnostic-pure-recorded-recipe/v1','executionAuthorization':False,'config':role(D/'CONFIG.json'),'bounds':cfg['bounds'],'python':python,'helper':helper,'helperSecondsOperand':0,'helperHasNoOverallWatchdog':True,'runtimeClockOwnedByOriginalRecorder':True,'recorderArgv':[python['path'],'-I','-B',str(D/'record_pure_controls.py'),'verification','GENUINE_GRANT_PATH','GENUINE_GRANT_SHA'],'laneArgv':['/bin/bash',helper['path'],'0',cfg['laneLog'],python['path'],'-I','-B',str(D/'record_pure_controls.py'),'verification','GENUINE_GRANT_PATH','GENUINE_GRANT_SHA'],'grantSchema':'1370-root-original-guard-diagnostic-pure-controls-once-grant/v1','requiredGrantFields':['executionAuthorization','oneAggregateRun','automaticRetry','config','bounds','outputPath','python','sourceManifest','sourceReview','diagnosticSourceManifest','diagnosticSourceReview','controlsSourceManifest','controlsSourceReview'],'sourceReviewSchema':'1370-original-guard-diagnostic-pure-runner-independent-source-review/v1','sourceReviewDecision':'ACCEPT_STATIC_ORIGINAL_GUARD_DIAGNOSTIC_PURE_RECORDED_RUNNER_SOURCE_ONLY','sourceReviewAliasNames':['run_pure_controls.py','record_pure_controls.py','CONFIG.json'],'observedDecision':'ACCEPT_ACTUAL_PURE_ORIGINAL_GUARD_DIAGNOSTIC_CONTROLS_ONLY','actualCaseCount':32,'positiveCount':9,'specificNegativeCount':23,'resultRoot':cfg['outputPath'],'recorderResultRoot':cfg['recorderOutputPath'],'localOnlySyntheticEvidence':'Every synthetic emitter output/partial in resultRoot except RESULT.json is hash/size-only rebuildable padding; no raw machine PS/FD or protected map.','scopedCleanup':'Original recorder reports childPID==PGID/reap/groupclear; root separately records actual helper PID/PGID from genuine launch and postabsence. No guessed IDs.','futureGrantAndToolRoles':None,'claimLimits':['No actual guard/fullscan/game/private-tree execution or protection acceptance.','Later-run behavior and synthetic evidence cannot retroactively admit54871.']}
put(D/'RECIPE.json',recipe)
for n in ['run_pure_controls.py','record_pure_controls.py']:compile((D/n).read_text(),str(D/n),'exec')
put(D/'SOURCE-PINS.json',{'schema':'1370-original-guard-diagnostic-pure-recorded-source-pins/v1','executionAuthorization':False,'files':{n:role(D/n) for n in ['run_pure_controls.py','record_pure_controls.py','CONFIG.json','RECIPE.json','RECORDER-WHOLE-INVERSE.json']},'actualRun':None})
print(json.dumps(role(D/'SOURCE-PINS.json')))
