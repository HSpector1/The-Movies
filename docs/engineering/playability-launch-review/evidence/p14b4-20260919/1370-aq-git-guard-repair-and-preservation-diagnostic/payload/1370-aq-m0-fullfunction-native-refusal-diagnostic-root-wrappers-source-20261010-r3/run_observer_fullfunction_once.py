import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path('/Users/zacheryspector/studio-scratch/1370-aq-root-continuation-20261010-r1');H=Path('/Users/zacheryspector/studio-scratch/1370-an-root-continuation-20261009-r1');Q=Path('/Users/zacheryspector/studio-scratch/1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r3');P=Path('/Users/zacheryspector/studio-scratch/1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r3')
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def checked(p,h):
 r=role(p);assert r['sha256']==h;return r
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==5
sp=checked(Q/'SOURCE-PINS.json','86d6cc43c35e182c25d42ed4cdf9042e0da700e916d35037490c3dd80d530973')
sr=checked(sys.argv[1],sys.argv[2])
pr=checked(sys.argv[3],sys.argv[4]);combined=read(pr['path']);pp=checked(P/'SOURCE-PINS.json',combined['sourceManifest']['sha256'])
wp=role(Path(__file__).parent/'SOURCE-PINS.json');assert combined['schema']=='1370-aq-fullfunction-parent-readback-wrappers-independent-source-review/v1' and combined['wrapperSourceManifest']==wp and combined['rootReadbackDecision']=='ACCEPT_STATIC_FULLFUNCTION_ROOT_READBACK_SOURCE_ONLY'
for r in read(wp['path'])['files'].values():assert role(r['path'])==r
for name in ('run_observer_fullfunction_once.py','run_observer_reader_once.py'):assert combined['wrapperSourcePins'][name]==read(wp['path'])['files'][name]
assert combined['sourcePins']['launch-fullfunction.py']==combined['routeSourcePins']['launch-fullfunction.py']==read(pp['path'])['files']['launch-fullfunction.py'] and combined['sourcePins']['read-fullfunction.py']==combined['routeSourcePins']['read-fullfunction.py']==read(pp['path'])['files']['read-fullfunction.py']
for manifest in (sp,pp):
 for r in read(manifest['path'])['files'].values():assert role(r['path'])==r
for rev,manifest,decision in [(sr,sp,'ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY'),(pr,pp,'ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY')]:
 v=read(rev['path']);assert v['decision']==decision and v['sourceManifest']==manifest and v['concreteFindings']==[] and v['executionAuthorization'] is False
types=checked(H/'M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json','be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83');bound=checked(H/'FULL-STATE-FIXTURE-ARTIFACT-BOUND.json','186c55ff7381787d3abe401e175d8c1c468be5bfb5e8ef169f89d7c94a0bc546')
config=read(Q/'CONFIG.json');assert config['currentProtection'] is not None,'UNFILLED_CURRENT_AP_PROTECTION'
protection=role(A/'M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PROTECTION.json');p=read(protection['path']);assert p['schema']=='1370-root-fullfunction-current-protection/v4' and p['status']=='ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE' and p['historicalTypesAdoption']==types and p['historicalTypesHead']=='7087f116cf998fd86e33fb8e004df628e0686dbd' and p['productionHead']=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8' and p['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and p['protectedFreezeContinues'] is True and p['game'] is False and p['executionAuthorization'] is False
for key in ('actualPreflight','actualPreflightReadback','independentPreflightReview','currentAPFullPreflightAdoption','currentAPFullPreflightSnapshot','historicalTypesAdoption','currentOperationalTransition','reviewedPriorStopAdoption','nativeControlsObservedAdoption','nativeRefusalControlsObservedAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot'):assert role(p[key]['path'])==p[key]
parser=role(H/'PARSER-CONTROLS-OBSERVED-ADOPTION.json');v=read(parser['path']);assert v['status']=='ROOT_ADOPTED_ACTUAL_EXACT_IDENTITY_JSON_CONTROLS_ONLY' and type(v['actualExit']) is int and v['actualExit']==0 and v['executionAuthorization'] is False
for key in ('independentObservedReview','result','actualTool'):assert role(v[key]['path'])==v[key]
assert read(v['independentObservedReview']['path'])['decision']=='ACCEPT_ACTUAL_EXACT_IDENTITY_JSON_PURE_CONTROLS_ONLY'
pins=read(sp['path']);assert v['parserSource']==pins['files']['exact-json.mjs'] and v['controlsSource']==pins['files']['run-parser-controls.mjs']
lossless=checked(H/'LOSSLESS-CONTROLS-OBSERVED-ADOPTION.json','fa668549c4526317f1c5f7f17494ae3bdaec2f6713e6b72351f30d384cfa096a');lv=read(lossless['path'])
assert lv['schema']=='1370-root-lossless-trace-controls-observed-adoption/v1' and lv['status']=='ROOT_ADOPTED_ACTUAL_LOSSLESS_TRACE_49_CONTROLS_ONLY' and lv['actualExit']==0 and lv['caseCount']==49 and lv['positiveCount']==9 and lv['specificNegativeCount']==40 and lv['soleLaneReleased'] is True and lv['executionAuthorization'] is False and lv['game'] is False and lv['fullBodyGameAssertionsExecuted'] is False
for key in ('independentObservedReview','readback','result','actualTool','implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','sourceReviewedFullBodyTemplate'):assert role(lv[key]['path'])==lv[key]
assert read(lv['independentObservedReview']['path'])['decision']=='ACCEPT_ACTUAL_PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_CONTROLS_ONLY'
assert lv['sourceReviewedFullBodyTemplate']==read(Q/'CONFIG.json')['historicalPure49Template']
for key in ('m0TraceCodec.mjs','m0WiringProbe.ts','ordering.ts','traceSequences.mjs'):assert lv['inputRoles'][key]==read(Q/'CONFIG.json')['historicalRepresentationInputs'][key]
config=read(Q/'CONFIG.json');assert config['actualLosslessControlsObservedAdoption']==lossless and config['currentProtection']==protection and config['historicalTypesAdoption']==types and config['historicalTypesHead']==p['historicalTypesHead'] and config['operationalHead']==p['productionHead']
diagnostic=config['actualNativeObserverControlsObservedAdoption'];assert role(diagnostic['path'])==diagnostic;dv=read(diagnostic['path'])
assert dv['schema']=='1370-root-native-observer-controls-observed-adoption/v1' and dv['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_OBSERVER_72_CONTROLS_ONLY' and dv['actualExit']==0 and dv['caseCount']==72 and dv['positiveCount']==13 and dv['specificNegativeCount']==59 and dv['soleLaneReleased'] is True and dv['executionAuthorization'] is False and dv['game'] is False and dv['fullBodyGameAssertionsExecuted'] is False
for key in ('independentObservedReview','readback','result','workerResult','recorderResult','actualTool','implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','sourceReviewedFullBodyTemplate','api','apiAdoption','supplementAdoption'):assert role(dv[key]['path'])==dv[key]
assert read(dv['independentObservedReview']['path'])['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY'
assert p['nativeControlsObservedAdoption']==diagnostic and config['actualNativeObserverControlsObservedAdoption']==diagnostic and dv['sourceReviewedFullBodyTemplate']==pins['files']['FULL-BODY-CONTROLS-TEMPLATE.ts'] and dv['inputRoles']['m0ObserverRowDiagnostic.mjs']==config['historicalNativeObserverInputs']['m0ObserverRowDiagnostic.mjs']
for key,r in config['nativeObserverAuthorities'].items():assert role(r['path'])==r and dv[key]==r
earlier=read(config['historicalAMToANTransition']['path']);middle=read(config['historicalANToAOTransition']['path']);current=read(config['actualCurrentOperationalTransition']['path'])
for key in ('historicalAMToANTransition','historicalANToAOTransition','actualCurrentOperationalTransition'):assert role(config[key]['path'])==config[key]
assert earlier['actualHead']==middle['predecessor'] and earlier['predecessor']==config['historicalTypesHead'] and middle['actualHead']==current['predecessor']==config['historicalAOHead'] and current['actualHead']==config['operationalHead'] and earlier['sourceTree']==middle['sourceTree']==current['sourceTree']==config['productionSourceTree']
assert p['currentAPFullPreflightAdoption']==config['actualCurrentAPFullPreflightAdoption'] and p['currentOperationalTransition']==config['actualCurrentOperationalTransition'] and p['reviewedPriorStopAdoption']==config['reviewedPriorStopAdoption']
refusal=config['actualNativeRefusalControlsObservedAdoption'];assert role(refusal['path'])==refusal;fv=read(refusal['path'])
assert fv['schema']=='1370-root-native-refusal-diagnostic-controls-observed-adoption/v1' and fv['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY' and fv['actualExit']==0 and fv['caseCount']==86 and fv['positiveCount']==13 and fv['specificNegativeCount']==73 and fv['soleLaneReleased'] is True and fv['executionAuthorization'] is False and fv['game'] is False and fv['privateM0ReadOrWritten'] is False and fv['fullQualificationAccepted'] is False
for key in ('independentObservedReview','readback','result','workerResult','recorderResult','actualTool','rootReaderActualTool','diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption','controlsSourcePins','controlsSourceReview'):assert role(fv[key]['path'])==fv[key]
assert read(fv['independentObservedReview']['path'])['schema']=='1370-native-refusal-diagnostic-controls-independent-observed-review/v1' and read(fv['independentObservedReview']['path'])['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY'
assert p['nativeRefusalControlsObservedAdoption']==refusal and fv['inputRoles']['m0ObserverRowDiagnostic.mjs']==pins['files']['m0ObserverRowDiagnostic.mjs']
for key,r in config['nativeRefusalDiagnosticAuthorities'].items():assert role(r['path'])==r and fv[key]==r
for name in read(Q/'RECIPE.json')['reviewAliases']:assert read(sr['path'])['sourcePins'][name]==read(sr['path'])['routeSourcePins'][name]==pins['files'][name]
rt=checked(H/'FULLFUNCTION-RUNTIME-TOOLS.json','e7d0f540655698dac3c15f4210307bef0112abe9316283d6c68a8245dd9eca9e');tools=read(rt['path'])['runtimeTools']
for r in tools.values():assert role(r['path'])==r
helper=checked(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh','aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
source=put(A/'NATIVE-REFUSAL-FULLFUNCTION-R3-SOURCE-ADOPTION.json',{'schema':'1370-root-fullfunction-qualified-route-source-adoption/v1','status':'ROOT_ADOPTED_REAL_FULL_FUNCTION_QUALIFICATION_SOURCE_WITH_ACTUAL_PREREQUISITES','sourcePins':sp,'sourceReview':sr,'parentSourcePins':pp,'parentSourceReview':pr,'typesAdoption':types,'parserControlsAdoption':parser,'losslessControlsObservedAdoption':lossless,'nativeObserverControlsObservedAdoption':diagnostic,'nativeRefusalControlsObservedAdoption':refusal,'currentProtection':protection,'artifactBoundAdoption':bound,'runtimeToolsObservation':rt,'executionAuthorization':False,'actualRuntimeOutcome':None,'scope':'Bounded real prefix fixture generation, baseline and specific typed-catch mutant only. Not neutrality416 or ledger admission.'})
b={'schema':'1370-root-fullfunction-parent-binding/v1','executionAuthorization':True,'oneAggregateRun':True,'automaticRetry':False,'parentSourcePins':pp,'parentSourceReview':pr,'sourcePins':sp,'sourceReview':sr,'typesAdoption':types,'currentProtection':protection,'parserControlsAdoption':parser,'losslessControlsObservedAdoption':lossless,'nativeObserverControlsObservedAdoption':diagnostic,'nativeRefusalControlsObservedAdoption':refusal,'artifactBoundAdoption':bound,'runtimeTools':tools,'runtimeToolsObservation':rt,'helper':helper,'parentPath':str(S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-recorded-20261010-r2'),'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':{'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'sourceAdoption':source,'rootLauncher':role(__file__),'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
br=put(A/'NATIVE-REFUSAL-FULLFUNCTION-R3-ROOT-BINDING.json',b);argv=[tools['python']['path'],'-I','-B',str(P/'launch-fullfunction.py'),'outer',br['path'],br['sha256']]
print(json.dumps({'rootBinding':br,'sourceAdoption':source}),flush=True);os.chdir(b['cwd']);os.execve(argv[0],argv,dict(os.environ,**b['environment']))
