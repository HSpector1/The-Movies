"""Root-only future finite retained-evidence readback. No source-author runtime."""
import hashlib,json,os,re,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-ao-m0-fullfunction-observer-row-diagnostic-parent-recorded-20261010-r1';F=S/'1370-ao-m0-fullfunction-observer-row-diagnostic-source-20261010-r2'
def need(v,m):
 if not v:raise RuntimeError(m)
def meta(s):return s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns
def role(p,cap=131072):
 p=Path(p);a=p.lstat();need(p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(a.st_mode) and a.st_nlink==1 and 0<=a.st_size<=cap,'PHYSICAL_BOUNDED_REGULAR');h=hashlib.sha256();n=0;fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  need(meta(os.fstat(fd))==meta(a),'OPEN_RACE')
  while True:
   b=os.read(fd,65536)
   if not b:break
   n+=len(b);need(n<=cap and n<=a.st_size,'READ_CAP');h.update(b)
  need(n==a.st_size and meta(os.fstat(fd))==meta(a)==meta(p.lstat()),'READ_RACE')
 finally:os.close(fd)
 return dict(path=str(p),bytes=n,sha256=h.hexdigest())
def pairs(rows):
 d={}
 for k,v in rows:need(k not in d,'DUPLICATE_KEY');d[k]=v
 return d
def load(r,cap=131072):
 need(role(r['path'],cap)==r,'PIN_ROLE');b=Path(r['path']).read_bytes();need(len(b)<=cap and hashlib.sha256(b).hexdigest()==r['sha256'],'LOAD_PIN');return json.loads(b,object_pairs_hook=pairs,parse_constant=lambda x:(_ for _ in ()).throw(RuntimeError('NONFINITE_JSON')))
def put(name,v):
 raw=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode();need(len(raw)<=131072,'READBACK_CAP');fd=os.open(P/name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o444)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
 return role(P/name)
def identity(v):
 need(set(v)=={'pid','pgid','sid'} and all(type(n) is int and n>1 for n in v.values()) and v['pid']==v['pgid']==v['sid'],'OWNED_GROUP_CLAIM');return v['pid']
def output_role(r,out,cap):
 need(Path(r['path']).is_relative_to(out),'OUTPUT_ROLE_SCOPE');return load(r,cap)
def main():
 need(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==5,'ARGS_I_B_SESSION_FINAL_GRANTSHA_TOOLSHA')
 session=int(sys.argv[1]);final=int(sys.argv[2]);toolRole=role(P/'ACTUAL-TOOL.json',16*1024**2);need(toolRole['sha256']==sys.argv[4],'TOOL_PIN');actual=load(toolRole,16*1024**2)
 need(type(actual['sessionId']) is int and actual['sessionId']==session and type(actual['finalExit']) is int and actual['finalExit']==final and actual['allToolChunks'] and type(actual['allToolChunks'][-1]['exit_code']) is int and actual['allToolChunks'][-1]['exit_code']==final,'TERMINAL_ACTUAL_TOOL')
 gr=role(P/'EXECUTION-GRANT.json');need(gr['sha256']==sys.argv[3],'GRANT_SHA');g=load(gr);need(g['schema']=='1370-root-fullfunction-qualification-once-grant/v1' and g['oneAggregateRun'] is True and g['automaticRetry'] is False,'GRANT_PROTOCOL')
 cfgRole=role(F/'CONFIG.json');need(cfgRole==g['config'] and cfgRole['sha256']==g['configSha256']=='596a893e476e77b8d87c1704b90ac5048b1f66611f61cdf3154ab6072ff27f5b','R9_CONFIG');c=load(cfgRole)
 manifest=load(g['sourcePins']);need(g['sourcePins']==role(F/'SOURCE-PINS.json') and g['sourcePins']['sha256']=='9a2d56c0b7263792b3e67f29d1cb40349ddc52593fe2ec9a80ff5463b0e99aef','R9_MANIFEST');review=load(g['sourceReview']);need(review['decision']=='ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY' and review['concreteFindings']==[] and review['executionAuthorization'] is False and review['sourceManifest']==g['sourcePins'],'R9_REVIEW')
 for n in ('CONFIG.json', 'run-fullfunction.py', 'run-fullfunction.mjs', 'record-fullfunction.py', 'CORE-TEST-TEMPLATE.ts', 'CONFIG-TEMPLATE.mts', 'FULL-BODY-CONTROLS-TEMPLATE.ts', 'exact-json.mjs', 'run-parser-controls.mjs', 'canonical-typescript-transform.mjs', 'm0WiringProbe.ts', 'RESOLUTION-SOURCE-BINDING.json', 'm0TraceCodec.mjs', 'traceSequences.mjs', 'ordering.ts', 'talentMarket.ts', 'typed-propagation-removed-talentMarket.ts', 'm0ObserverRowDiagnostic.mjs'):
  need(review['sourcePins'][n]==review['routeSourcePins'][n]==manifest['files'][n],'R9_ALIASES');loadrole=manifest['files'][n];need(role(loadrole['path'],131072)==loadrole,'SOURCE_AUTH')
 protection=load(g['currentProtection']);pre=protection['actualPreflightReadback'];load(pre);need(protection['schema']=='1370-root-fullfunction-current-protection/v2' and protection['status']=='ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE' and protection['protectedFreezeContinues'] is True and protection['game'] is False and protection['executionAuthorization'] is False and protection['productionHead']==c['operationalHead'] and protection['historicalTypesHead']==c['historicalTypesHead'] and protection['historicalTypesAdoption']==g['typesAdoption'],'CURRENT_AN_PREFLIGHT_SEPARATE_FROM_HISTORICAL_TYPES')
 for n in ('actualPreflight','actualPreflightReadback','independentPreflightReview','currentANFullPreflightAdoption','currentANFullPreflightSnapshot','historicalTypesAdoption','currentOperationalTransition','reviewedPriorStopAdoption'):need(role(protection[n]['path'],16*1024**2)==protection[n],'PROTECTION_EXTERNAL_ROLE')
 need(protection['currentANFullPreflightAdoption']==c['actualCurrentANFullPreflightAdoption'] and protection['currentOperationalTransition']==c['actualCurrentOperationalTransition'] and protection['reviewedPriorStopAdoption']==c['reviewedPriorStopAdoption'],'CURRENT_AN_PROTECTION_CHAIN')
 diagnostic=load(g['observerDiagnosticControlsObservedAdoption']);need(g['observerDiagnosticControlsObservedAdoption']==c['actualObserverDiagnosticControlsObservedAdoption'] and diagnostic['status']=='ROOT_ADOPTED_ACTUAL_OBSERVER_ROW_DIAGNOSTIC_48_CONTROLS_ONLY' and diagnostic['actualExit']==0 and diagnostic['caseCount']==48 and diagnostic['soleLaneReleased'] is True and diagnostic['executionAuthorization'] is False,'ACTUAL_OBSERVER_DIAGNOSTIC_CONTROLS')
 rootRole=role(P/'ROOT-LAUNCH-CLAIM.json');root=load(rootRole);innerRole=role(P/'RECORDER-LAUNCH-CLAIM.json');inner=load(innerRole)
 need(rootRole==g['rootLaunchClaim'] and root['rootBinding']==inner['rootBinding']==g['rootBinding'],'CLAIM_GRANT_CHAIN');binding=load(g['rootBinding']);need(binding['sourcePins']==g['sourcePins'] if 'sourcePins' in binding else True,'BINDING_SOURCE')
 need(root['directExecPreservesIdentity'] is True and inner['directExecPreservesIdentity'] is True and inner['grant']==gr,'DIRECT_EXEC_CLAIMS');helper=identity(root['ownedHelper']);recorder=identity(inner['ownedRecorder'])
 need(inner['argv']==[g['runtimeTools']['python']['path'],'-I','-B',str(F/'record-fullfunction.py'),'verification',gr['path'],gr['sha256']],'RECORDER_EXEC_ARGV')
 need(root['argv'][0:4]==['/bin/bash',str(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh'),'0',c['laneLog']],'HELPER_LANE_ARGV')
 lane=role(c['laneLog'],8*1024**2);laneMeta=role(c['laneLog']+'.meta',1048576);mb=Path(laneMeta['path']).read_bytes();ends=re.findall(rb'^end, exit (-?\d+);[^\n]*$',mb,re.M);need(len(ends)==1 and int(ends[0])==final,'LANE_TERMINAL_EXIT');recExit=int(ends[0])
 out=Path(c['outputPath']);R=Path(c['recorderOutputPath']);rr=role(R/'RESULT.json');rec=load(rr);need(rec['schema']=='1370-real-fullfunction-qualification-recorder/v1' and rec['configSha256']==cfgRole['sha256'] and rec['mode']=='verification' and rec['boundsSeconds']=={'aggregateChild':300,'active':320,'whole':330},'RECORDER_RESULT')
 streamRoles={}
 for n in ('stdout','stderr'):
  r=role(R/(n+'.bin'),8*1024**2);need(r['bytes']==rec[n+'Bytes'] and r['sha256']==rec[n+'Sha256'],'RECORDER_STREAM');streamRoles[n]=r
 pids=[helper,recorder];groups=[helper,recorder];runner=rec['actualChildExit'];need(type(runner) is int or runner is None,'CHILD_EXIT_NULL')
 if rec['childPid'] is not None:
  need(type(rec['childPid']) is int and rec['childPid']>1 and rec['ownedPgid']==rec['childPid'] and rec['pgidConfirmed'] is True and rec['startupOwnedBeforeExec'] is True,'RECORDED_CHILD_GROUP');pids.append(rec['childPid']);groups.append(rec['ownedPgid'])
 else:need(rec['ownedPgid'] is None and runner is None,'NO_CHILD_GROUP')
 need(rec['groupClear'] is True,'RECORDER_GROUP_CLEAR')
 controller=None;controllerRole=None;node=None;nodeRole=None;inconsistencies=[]
 if os.path.lexists(out/'RESULT.json'):
  controllerRole=role(out/'RESULT.json');controller=load(controllerRole);need(controller['schema']=='1370-real-fullfunction-qualification-result/v1','CONTROLLER_SCHEMA')
  if controller['nodePid'] is not None:need(type(controller['nodePid']) is int and controller['nodePid']>1,'NODE_PID');pids.append(controller['nodePid'])
  if controller['nodeResult'] is not None:
   nodeRole=controller['nodeResult'];need(nodeRole['path']==str(out/'NODE-RESULT.json'),'NODE_RESULT_PATH');node=output_role(nodeRole,out,131072)
  if controller['status']=='PASS_REAL_FULL_FUNCTION_QUALIFICATION_PENDING_FULL_POSTFLIGHT':
   try:
    types=load(g['typesAdoption']);need(controller['actualNodeExit']==0 and controller['actualGameplayPrefixExecuted'] is True and controller['sourceBefore']==controller['sourceAfter']==types['freshSourceProof'] and controller['dependencyBefore']==controller['dependencyAfter']==types['freshDependencyProof'],'COMPLETE_PROOFS')
    need(node is not None and node['status']=='PASS_REAL_FULL_FUNCTION_FIXTURES_BASELINE_SPECIFIC_TYPED_CATCH_RED' and node['actualGameplayPrefixExecuted'] is True and node['naturalBoundaryWeeks']==[196,197,208] and [x['name'] for x in node['phases']]==['generate','baseline','typed-catch-mutant'] and all(type(x['childExit']) is int and x['childExit']==0 for x in node['phases']),'NODE_THREE_PHASES')
    need(controller['fixture']==node['fixture'] and node['fixture']['path']==str(out/'fixtures.json') and role(node['fixture']['path'],67108864)==node['fixture'],'FIXTURE_PIN')
    for phase in node['phases']:
     for n,r in phase['streams'].items():need(n in ('stdout','stderr') and Path(r['path']).is_relative_to(out) and role(r['path'],8388608)==r,'PHASE_STREAM_ROLE')
     report=output_role(phase['report'],out,1048576);control=output_role(phase['controlResult'],out,131072);need(control==phase['result'],'PHASE_CONTROL_INLINE_EQUAL');need(report['success'] is True and report['numTotalTests']==report['numPassedTests']==1 and report['numFailedTests']==0,'PHASE_REPORT_PASS')
    baseline=node['phases'][1]['result'];mut=node['phases'][2]['result'];need(baseline['status']=='BASELINE_FULL_FUNCTION_CONTROLS_PASSED' and baseline['fixture']==node['fixture'] and mut['fixture']==node['fixture'] and mut['status']=='EXPECTED_REAL_TYPED_CATCH_PROPAGATION_ASSERTION_RED' and mut['faultKind']=='row-cap' and mut['loaderOrOtherErrorAccepted'] is False and mut['error']['code']=='ERR_ASSERTION' and mut['error']['operator']=='throws' and mut['error']['message']=='Missing expected exception: actual recorder failure must cross actual submitProposal catch' and mut['error']['actualUndefined'] is True,'SPECIFIC_MUTANT_RED')
   except Exception as e:inconsistencies.append(str(e))
 else:controllerRole=None
 pids=sorted(set(pids));groups=sorted(set(groups));checks=[]
 for values,fn,label in ((pids,os.kill,'pid'),(groups,os.killpg,'pgid')):
  for n in values:
   try:fn(n,0)
   except ProcessLookupError:checks.append(dict(kind=label,id=n,result='ESRCH'))
   else:raise RuntimeError('RECORDED_ID_PRESENT')
 need(not os.path.lexists(S/'HEAVY-LANE-LOCK'),'LANE_LOCK_PRESENT')
 expected='REAL_FULLFUNCTION_QUALIFICATION_COMPLETE_UNADOPTED';success=not inconsistencies and final==recExit==runner==0 and rec['status']==expected and controller is not None and controller['status']=='PASS_REAL_FULL_FUNCTION_QUALIFICATION_PENDING_FULL_POSTFLIGHT' and streamRoles['stderr']['bytes']==0
 result={'schema':'1370-root-fullfunction-actual-readback/v1','status':'ACTUAL_FULLFUNCTION_COMPLETE_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW' if success else 'ACTUAL_FULLFUNCTION_STOP_PRESERVED_PENDING_SHARED_FULL_POSTFLIGHT','completed':True,'toolSessionId':session,'toolExit':final,'helperExit':final,'recorderExit':recExit,'runnerExit':runner,'runnerStatus':'NOT_STARTED' if rec['childPid'] is None else ('UNKNOWN' if runner is None else 'EXITED'),'actualTool':toolRole,'grant':gr,'rootLaunchClaim':rootRole,'recorderLaunchClaim':innerRole,'sourcePins':g['sourcePins'],'sourceReview':g['sourceReview'],'recorderResult':rr,'recorderStatus':rec['status'],'controllerResult':controllerRole,'controllerStatus':None if controller is None else controller['status'],'nodeResult':nodeRole,'nodePid':None if controller is None else controller['nodePid'],'sourceBefore':None if controller is None else controller['sourceBefore'],'sourceAfter':None if controller is None else controller['sourceAfter'],'dependencyBefore':None if controller is None else controller['dependencyBefore'],'dependencyAfter':None if controller is None else controller['dependencyAfter'],'actualGameplayPrefixExecuted':None if controller is None else controller['actualGameplayPrefixExecuted'],'naturalBoundaryWeeks':None if controller is None else controller['naturalBoundaryWeeks'],'runtimeOutputAbsent':not os.path.lexists(out),'recordedOwnedPids':pids,'recordedOwnedGroupIds':groups,'scopedOwnershipChecks':checks,'laneReleased':True,'laneLog':lane,'laneMetadata':laneMeta,'preflightObservedAdoption':pre,'currentProtection':g['currentProtection'],'typesAdoption':g['typesAdoption'],'parserControlsAdoption':g['parserControlsAdoption'],'observerDiagnosticControlsObservedAdoption':g['observerDiagnosticControlsObservedAdoption'],'historicalTypesRemainHistorical':True,'currentANFullPreflightSnapshot':protection['currentANFullPreflightSnapshot'],'stdout':streamRoles['stdout'],'stderr':streamRoles['stderr'],'retainedInconsistencies':inconsistencies,'fullProtectedPostflightAccepted':False,'fixtureQualificationAccepted':False,'neutralityAccepted':False,'executionAuthorization':False}
 print(json.dumps({'readback':put('READBACK.json',result),'status':result['status']}))
if __name__=='__main__':
 try:main()
 except Exception as e:
  print(json.dumps({'incompleteReadback':put('INCOMPLETE-READBACK.json',{'schema':'1370-root-fullfunction-incomplete-readback/v1','status':'STOP_RETAINED_EVIDENCE_OR_CLEANUP_INCOMPLETE','error':repr(e),'completed':False,'laneReleased':None,'executionAuthorization':False,'fullProtectedPostflightAccepted':False,'fixtureQualificationAccepted':False})}));sys.exit(1)
