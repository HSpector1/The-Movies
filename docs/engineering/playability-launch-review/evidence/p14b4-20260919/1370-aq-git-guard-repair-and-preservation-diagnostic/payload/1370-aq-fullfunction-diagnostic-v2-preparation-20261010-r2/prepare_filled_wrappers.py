"""Data-only wrapper derivative. Candidate files are never imported."""
from pathlib import Path
import ast,difflib,hashlib,json
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
A=S/'1370-aq-root-continuation-20261010-r1';F=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2';P=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r2'
W=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-root-wrappers-source-20261010-r2'
W0=S/'1370-ap-m0-fullfunction-native-observer-root-wrappers-source-20261010-r3'
F0=S/'1370-ap-m0-fullfunction-native-observer-source-20261010-r3';P0=S/'1370-ap-m0-fullfunction-native-observer-parent-source-20261010-r3'
def role(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def load(p):return json.loads(Path(p).read_text())
def put(p,v):Path(p).write_text(json.dumps(v,indent=2)+'\n')
def change(t,a,b):assert a in t,a[:90];return t.replace(a,b)
def difference(a,b,p):
 d=list(difflib.ndiff(a.splitlines(True),b.splitlines(True)));assert ''.join(difflib.restore(d,1))==a and ''.join(difflib.restore(d,2))==b
 return dict(baseline=role(p),losslessNdiff=d,forward=''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True))),inverse=''.join(difflib.unified_diff(b.splitlines(True),a.splitlines(True))),bothApplicationsVerified=True)
W.mkdir(exist_ok=True)
c=load(F/'CONFIG.json');proof={};helpers={}
combinedSchema='1370-aq-fullfunction-parent-readback-wrappers-independent-source-review/v1'
for n in ['run_observer_fullfunction_once.py','run_observer_reader_once.py']:
 old=(W0/n).read_text();t=old.replace(str(F0),str(F)).replace(str(P0),str(P)).replace(str(S/'1370-ap-root-continuation-20261010-r1'),str(A))
 t=t.replace('1370-ap-m0-fullfunction-native-observer-parent-recorded-20261010-r1','1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-recorded-20261010-r1')
 t=t.replace('1370-ap-fullfunction-parent-readback-wrappers-independent-source-review/v1',combinedSchema)
 if n=='run_observer_fullfunction_once.py':
  t=change(t,role(F0/'SOURCE-PINS.json')['sha256'],role(F/'SOURCE-PINS.json')['sha256'])
  t=t.replace('M0-NATIVE-FULLFUNCTION-CURRENT-PROTECTION.json','M0-NATIVE-REFUSAL-FULLFUNCTION-CURRENT-PROTECTION.json').replace('1370-root-fullfunction-current-protection/v3','1370-root-fullfunction-current-protection/v4').replace('currentAOFullPreflight','currentAPFullPreflight').replace('actualCurrentAOFullPreflight','actualCurrentAPFullPreflight').replace('f2f97c622db7f5332164b790d1646355e89c00f4',c['operationalHead'])
  t=change(t,"protection=role(A/", "config=read(Q/'CONFIG.json');assert config['currentProtection'] is not None,'UNFILLED_CURRENT_AP_PROTECTION'\nprotection=role(A/")
  t=change(t,"'nativeControlsObservedAdoption'):assert role", "'nativeControlsObservedAdoption','nativeRefusalControlsObservedAdoption'):assert role")
  line=next(x for x in t.splitlines() if x.startswith('diagnostic=checked('));tail=line.split(';dv=')[1];t=change(t,line,"diagnostic=config['actualNativeObserverControlsObservedAdoption'];assert role(diagnostic['path'])==diagnostic;dv="+tail)
  t=change(t,"dv['inputRoles']['m0ObserverRowDiagnostic.mjs']==pins['files']['m0ObserverRowDiagnostic.mjs']", "dv['inputRoles']['m0ObserverRowDiagnostic.mjs']==config['historicalNativeObserverInputs']['m0ObserverRowDiagnostic.mjs']")
  a=t.index("earlier=read(config['historicalAMToANTransition']['path']);");b=t.index("assert p['currentAPFullPreflightAdoption']",a)
  t=t[:a]+"earlier=read(config['historicalAMToANTransition']['path']);middle=read(config['historicalANToAOTransition']['path']);current=read(config['actualCurrentOperationalTransition']['path'])\nfor key in ('historicalAMToANTransition','historicalANToAOTransition','actualCurrentOperationalTransition'):assert role(config[key]['path'])==config[key]\nassert earlier['actualHead']==middle['predecessor'] and earlier['predecessor']==config['historicalTypesHead'] and middle['actualHead']==current['predecessor']==config['historicalAOHead'] and current['actualHead']==config['operationalHead'] and earlier['sourceTree']==middle['sourceTree']==current['sourceTree']==config['productionSourceTree']\n"+t[b:]
  marker="for name in read(Q/'RECIPE.json')['reviewAliases']:"
  gate="""refusal=config['actualNativeRefusalControlsObservedAdoption'];assert role(refusal['path'])==refusal;fv=read(refusal['path'])
assert fv['schema']=='1370-root-native-refusal-diagnostic-controls-observed-adoption/v1' and fv['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY' and fv['actualExit']==0 and fv['caseCount']==86 and fv['positiveCount']==13 and fv['specificNegativeCount']==73 and fv['soleLaneReleased'] is True and fv['executionAuthorization'] is False and fv['game'] is False and fv['privateM0ReadOrWritten'] is False and fv['fullQualificationAccepted'] is False
for key in ('independentObservedReview','readback','result','workerResult','recorderResult','actualTool','rootReaderActualTool','diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption','controlsSourcePins','controlsSourceReview'):assert role(fv[key]['path'])==fv[key]
assert read(fv['independentObservedReview']['path'])['schema']=='1370-native-refusal-diagnostic-controls-independent-observed-review/v1' and read(fv['independentObservedReview']['path'])['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY'
assert p['nativeRefusalControlsObservedAdoption']==refusal and fv['inputRoles']['m0ObserverRowDiagnostic.mjs']==pins['files']['m0ObserverRowDiagnostic.mjs']
for key,r in config['nativeRefusalDiagnosticAuthorities'].items():assert role(r['path'])==r and fv[key]==r
"""
  t=change(t,marker,gate+marker)
  t=t.replace("'nativeObserverControlsObservedAdoption':diagnostic,'currentProtection'", "'nativeObserverControlsObservedAdoption':diagnostic,'nativeRefusalControlsObservedAdoption':refusal,'currentProtection'")
  t=t.replace("'nativeObserverControlsObservedAdoption':diagnostic,'artifactBoundAdoption'", "'nativeObserverControlsObservedAdoption':diagnostic,'nativeRefusalControlsObservedAdoption':refusal,'artifactBoundAdoption'")
  t=t.replace("A/'NATIVE-FULLFUNCTION-SOURCE-ADOPTION.json'", "A/'NATIVE-REFUSAL-FULLFUNCTION-SOURCE-ADOPTION.json'").replace("A/'NATIVE-FULLFUNCTION-ROOT-BINDING.json'", "A/'NATIVE-REFUSAL-FULLFUNCTION-ROOT-BINDING.json'")
 (W/n).write_text(t);proof[n]=difference(old,t,W0/n)
 def functions(source):return {x.name:ast.get_source_segment(source,x) for x in ast.parse(source).body if isinstance(x,ast.FunctionDef)}
 before=functions(old);after=functions(t);assert before==after,n;helpers[n]=list(before)
 for stale in [F0.name,P0.name]:assert stale not in t,(n,stale)
put(W/'WHOLE-FORWARD-INVERSE.json',proof)
r=load(W0/'RECIPE.json');r['sourceManifest']=role(F/'SOURCE-PINS.json');r['parentSourceManifest']=role(P/'SOURCE-PINS.json');r['currentProtection']=c['currentProtection'];r['nativeRefusalControlsObservedAdoption']=c['actualNativeRefusalControlsObservedAdoption'];r['combinedReviewSchema']=combinedSchema
r['outputs']={n:c[n] for n in ['outputPath','recorderOutputPath','parentRecordedPath','laneLog']};r['sourceOnlyUnfilled']=False;r['actualSourceReview']=None;r['actualCombinedAdapterReview']=None;r['actualRun']=None
r['launcherArgv']=['PINNED_PHYSICAL_PYTHON','-I','-B',str(W/'run_observer_fullfunction_once.py'),'GENUINE_ROUTE_REVIEW_PATH','GENUINE_ROUTE_REVIEW_SHA','GENUINE_COMBINED_ADAPTER_REVIEW_PATH','GENUINE_COMBINED_ADAPTER_REVIEW_SHA']
r['readerWrapperArgv']=['PINNED_PHYSICAL_PYTHON','-I','-B',str(W/'run_observer_reader_once.py'),'GENUINE_COMBINED_ADAPTER_REVIEW_PATH','GENUINE_COMBINED_ADAPTER_REVIEW_SHA']
r['operandPlaceholdersAreNotArtifactRoles']=True;r['actualToolSessionAndFinalExitFromRetainedEnvelopeOnly']=True;put(W/'RECIPE.json',r)
put(W/'SOURCE-PINS.json',dict(schema='1370-native-fullfunction-root-wrapper-source-pins/v1',executionAuthorization=False,files={n:role(W/n) for n in ['run_observer_fullfunction_once.py','run_observer_reader_once.py','RECIPE.json','WHOLE-FORWARD-INVERSE.json']},sourceOnlyUnfilled=False,actualCombinedReview=None))
# Preserve complete draft-R1 to draft-R2 inverses separately from accepted-AP inverses.
changes={}
for new,prior in [(F,S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r1'),(P,S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r1')]:
 for n in load(prior/'WHOLE-FORWARD-INVERSE.json'):
  changes[new.name+'/'+n]=difference((prior/n).read_text(),(new/n).read_text(),prior/n)
put(D/'R1-DRAFT-TO-R2-WHOLE-INVERSES.json',changes)
report={'schema':'1370-aq-fullfunction-root-wrapper-held-preparation/v1','executionAuthorization':False,'sourceSealed':True,'wrapperSourceManifest':role(W/'SOURCE-PINS.json'),'routeSourceManifest':role(F/'SOURCE-PINS.json'),'parentSourceManifest':role(P/'SOURCE-PINS.json'),'originalWrapperHelpersByteExact':helpers,'wrapperInverseApplications':4,'priorDraftInverseApplications':22,'combinedReviewSchema':combinedSchema,'decision':'ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY','rootReadbackDecision':'ACCEPT_STATIC_FULLFUNCTION_ROOT_READBACK_SOURCE_ONLY','pendingActualFields':c['heldUnfilledActualRoles'],'actualCandidateExecuted':False,'privateTreeRead':False}
put(D/'WRAPPER-DRAFT-READBACK.json',report);print(json.dumps(report))
