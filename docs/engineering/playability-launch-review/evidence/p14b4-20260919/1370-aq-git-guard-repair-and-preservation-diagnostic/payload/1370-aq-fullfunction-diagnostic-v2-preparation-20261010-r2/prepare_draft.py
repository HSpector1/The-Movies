"""Data-only source preparation. Never import or execute the prepared route."""
from pathlib import Path
import ast,copy,difflib,hashlib,json,re
S=Path('/Users/zacheryspector/studio-scratch')
A=S/'1370-aq-root-continuation-20261010-r1'
F0=S/'1370-ap-m0-fullfunction-native-observer-source-20261010-r3'
P0=S/'1370-ap-m0-fullfunction-native-observer-parent-source-20261010-r3'
F=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2'
P=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r2'
D=Path(__file__).resolve().parent
def role(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def load(p):return json.loads(Path(p).read_text())
def put(p,x):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,indent=2)+'\n')
def change(t,a,b):
 assert a in t,a[:90];return t.replace(a,b)
def diff(base,new,name):
 a=base.splitlines(keepends=True);b=new.splitlines(keepends=True);delta=list(difflib.ndiff(a,b))
 assert ''.join(difflib.restore(delta,1))==base and ''.join(difflib.restore(delta,2))==new
 return dict(baseline=role(name),forward=''.join(difflib.unified_diff(a,b,fromfile='baseline',tofile='draft')),inverse=''.join(difflib.unified_diff(b,a,fromfile='draft',tofile='baseline')),losslessNdiff=delta,bothApplicationsVerified=True)
original=load(F0/'CONFIG.json');c=copy.deepcopy(original)
observedRole=role(A/'NATIVE-REFUSAL-DIAGNOSTIC-CONTROLS-OBSERVED-ADOPTION.json');observed=load(observedRole['path'])
contract=load(A/'FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json')
diag=observed['inputRoles']['m0ObserverRowDiagnostic.mjs']
assert diag['sha256']=='db78301bf62d52b574ed8df272d0fe3d7b10c2568f930d10eb359092725bbba6'
assert role(F0/'SOURCE-PINS.json')['sha256']=='88b8d5b06a3e4fc0f37fe0b0f7054ef0572effceac839a4078f416e4fd946055'
F.mkdir(exist_ok=True);P.mkdir(exist_ok=True)
names=['CONFIG-TEMPLATE.mts','CORE-TEST-TEMPLATE.ts','canonical-typescript-transform.mjs','record-fullfunction.py','run-fullfunction.py','run-fullfunction.mjs','RESOLUTION-SOURCE-BINDING.json']
outmap={str(F0):str(F),'1370-ap-m0-fullfunction-native-observer-results-20261010-r1':'1370-aq-m0-fullfunction-native-refusal-diagnostic-results-20261010-r1','1370-ap-m0-fullfunction-native-observer-recorder-results-20261010-r1':'1370-aq-m0-fullfunction-native-refusal-diagnostic-recorder-results-20261010-r1','1370-ap-m0-fullfunction-native-observer-parent-recorded-20261010-r1':'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-recorded-20261010-r1','1370-ap-m0-fullfunction-native-observer-lane-20261010-r1':'1370-aq-m0-fullfunction-native-refusal-diagnostic-lane-20261010-r1','20261010-ap-m0-fullfunction-native-observer-r1':'20261010-aq-m0-fullfunction-native-refusal-diagnostic-r1'}
def rebase(v):
 if isinstance(v,dict):return {k:rebase(x) for k,x in v.items()}
 if isinstance(v,list):return [rebase(x) for x in v]
 if isinstance(v,str):
  for a,b in outmap.items():v=v.replace(a,b)
 return v
c=rebase(c)
c['historicalNativeObserverInputs']=copy.deepcopy(original['nativeObserverInputs'])
c['nativeObserverInputs']['m0ObserverRowDiagnostic.mjs']=diag
c['historicalANToAOTransition']=original['actualCurrentOperationalTransition']
c['historicalAOHead']=original['operationalHead']
c['operationalHead']=contract['productionHead']
c['actualCurrentOperationalTransition']=contract['currentOperationalTransition']
c['reviewedPriorStopAdoption']=contract['priorProtectedStopAdoption']
c.pop('actualCurrentAOFullPreflightAdoption')
c['actualCurrentAPFullPreflightAdoption']=role(A/'CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json')
c['currentProtection']=None;c['currentProtectionSchema']=contract['protectionSchema']
c['fullfunctionProtectionProspectiveContract']=role(A/'FULLFUNCTION-PROTECTION-PROSPECTIVE-CONTRACT.json')
c['currentFullPreflightContract']={'schema':'1370-aq-root-current-ap-fullpreflight-adoption/v1','status':'ROOT_ADOPTED_CURRENT_AP_FULL_PREFLIGHT'}
c['actualNativeRefusalControlsObservedAdoption']=observedRole
keys=['diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption','controlsSourcePins','controlsSourceReview','implementationControlsSourceAdoption','prospectiveObservedContract']
c['nativeRefusalDiagnosticAuthorities']={k:observed[k] for k in keys}
c['nativeRefusalObservedAdoptionContract']={'schema':observed['schema'],'status':observed['status'],'reviewSchema':'1370-native-refusal-diagnostic-controls-independent-observed-review/v1','reviewDecision':'ACCEPT_ACTUAL_PURE_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY','caseCount':86,'positiveCount':13,'specificNegativeCount':73,'originalOrderingCases':18,'originalParserCasesReplayed':0}
c['heldUnfilledActualRoles']=['currentProtection','actualSourceReview','actualGrant']
for n in ['CONFIG-TEMPLATE.mts','CORE-TEST-TEMPLATE.ts','canonical-typescript-transform.mjs','RESOLUTION-SOURCE-BINDING.json']:
 t=(F0/n).read_text()
 for a,b in outmap.items():t=t.replace(a,b)
 if n=='RESOLUTION-SOURCE-BINDING.json':
  r=load(F0/n);r['derivatives']['src/core/m0ObserverRowDiagnostic.mjs']=diag;t=json.dumps(rebase(r),indent=2)+'\n'
 (F/n).write_text(t)
for mapping in ['inputs','templates']:
 for n,r in c[mapping].items():
  if Path(r['path']).parent==F:c[mapping][n]=role(F/n)
put(F/'CONFIG.json',c);sha=role(F/'CONFIG.json')['sha256']
pygate='''def authenticate_refusal_diagnostic(g,c,manifest):
 a=c['nativeRefusalDiagnosticAuthorities'];dm=load(a['diagnosticSourceManifest']);dr=load(a['diagnosticSourceReview']);cm=load(a['controlsSourcePins']);cr=load(a['controlsSourceReview'])
 need(dr['schema']=='1370-native-refusal-diagnostic-independent-source-review/v1' and dr['decision']=='ACCEPT_STATIC_NATIVE_REFUSAL_DIAGNOSTIC_IMPLEMENTATION_SOURCE_ONLY' and dr['sourceManifest']==a['diagnosticSourceManifest'] and dr['concreteFindings']==[] and dr['executionAuthorization'] is False,'REFUSAL_DIAGNOSTIC_SOURCE_REVIEW')
 for name in ['m0ObserverRowDiagnostic.mjs','INTERFACE.json']:need(dm['files'][name]==dr['sourcePins'][name]==dr['routeSourcePins'][name],'REFUSAL_DIAGNOSTIC_SOURCE_ALIASES');read(dm['files'][name])
 need(manifest['files']['m0ObserverRowDiagnostic.mjs']==c['nativeObserverInputs']['m0ObserverRowDiagnostic.mjs']==dm['files']['m0ObserverRowDiagnostic.mjs'] and a['diagnosticInterface']==dm['files']['INTERFACE.json'] and dm['dependencies']['m0NativeObserverRows.mjs']==c['nativeObserverInputs']['m0NativeObserverRows.mjs'],'REFUSAL_DIAGNOSTIC_OVERRIDE')
 need(cr['schema']=='1370-native-observer-independent-controls-source-review/v1' and cr['decision']=='ACCEPT_STATIC_PURE_NATIVE_OBSERVER_CONTROLS_SOURCE_ONLY' and cr['sourceManifest']==a['controlsSourcePins'] and cr['concreteFindings']==[] and cr['executionAuthorization'] is False,'REFUSAL_CONTROLS_SOURCE_REVIEW')
 for name in ['run-native-observer-controls.mjs','MATRIX.json','CONTRACT.json']:need(cm['files'][name]==cr['sourcePins'][name]==cr['routeSourcePins'][name],'REFUSAL_CONTROLS_SOURCE_ALIASES');read(cm['files'][name])
 sa=load(a['implementationControlsSourceAdoption']);need(sa['schema']=='1370-root-native-refusal-diagnostic-implementation-controls-source-adoption/v1' and sa['status']=='ROOT_ADOPTED_NATIVE_REFUSAL_DIAGNOSTIC_AND_AFFECTED_CONTROLS_SOURCE_ONLY' and sa['executionAuthorization'] is False,'REFUSAL_SOURCE_ADOPTION')
 for k,r in a.items():need(k=='implementationControlsSourceAdoption' or sa['prospectiveProtocol' if k=='prospectiveObservedContract' else k]==r,'REFUSAL_SOURCE_ADOPTION_BINDINGS');read(r)
 need(g['nativeRefusalControlsObservedAdoption']==c['actualNativeRefusalControlsObservedAdoption'],'REFUSAL_OBSERVED_ROLE');o=load(g['nativeRefusalControlsObservedAdoption']);ct=c['nativeRefusalObservedAdoptionContract']
 need(o['schema']==ct['schema'] and o['status']==ct['status'] and type(o['actualExit']) is int and o['actualExit']==0 and o['soleLaneReleased'] is True,'REFUSAL_ACTUAL_ADOPTION')
 for k in ['caseCount','positiveCount','specificNegativeCount','originalOrderingCases','originalParserCasesReplayed']:need(type(o[k]) is int and o[k]==ct[k],'REFUSAL_ACTUAL_COUNTS')
 for k in ['executionAuthorization','game','privateM0ReadOrWritten','fullQualificationAccepted','fullBodyGameAssertionsExecuted']:need(o[k] is False,'REFUSAL_SCOPE')
 for k,r in a.items():need(o[k]==r,'REFUSAL_OBSERVED_AUTHORITIES')
 for name in ['m0ObserverRowDiagnostic.mjs','m0NativeObserverRows.mjs','m0FeasibilityWitness-native.ts','ordering.ts']:need(o['inputRoles'][name]==manifest['files'][name],'REFUSAL_ACTUAL_INPUT_BINDINGS')
 need(o['implementationSourcePins']==c['nativeObserverAuthorities']['implementationSourcePins'] and o['implementationSourceReview']==c['nativeObserverAuthorities']['implementationSourceReview'],'REFUSAL_BASE_IMPLEMENTATION')
 rv=load(o['independentObservedReview']);need(rv['schema']==ct['reviewSchema'] and rv['decision']==ct['reviewDecision'] and rv['concreteFindings']==[] and rv['executionAuthorization'] is False,'REFUSAL_OBSERVED_REVIEW')
 r=load(o['result']);m=load(cm['files']['MATRIX.json']);need(r['schema']=='1370-native-observer-independent-controls-result/v1' and r['status']=='PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED' and r['caseCount']==86 and r['positiveCount']==13 and r['specificNegativeCount']==73 and r['originalOrderingCases']==18 and r['originalParserCasesReplayed']==0 and r['results']==[{**row,'verdict':'ACCEPT_POSITIVE' if row['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for row in m['cases']],'REFUSAL_EXACT_ACTUAL_ROSTER')
 need(r['inputRoles']==o['inputRoles'] and r['executionAuthorization'] is False and r['game'] is False and r['privateM0ReadOrWritten'] is False and r['fullQualificationAccepted'] is False,'REFUSAL_RESULT_SCOPE')
 for k in ['diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption','controlsSourcePins','controlsSourceReview','prospectiveObservedContract']:need(r[k]==a[k],'REFUSAL_RESULT_AUTHORITIES')
 for k in ['readback','actualTool','rootReaderActualTool','sourceAdoption','sourcePins','sourceReview','workerResult','recorderResult']:read(o[k],16*1024**2)
 return o

'''
jsgate='''function authenticateRefusalDiagnostic(grant,c,manifest){
 const a=c.nativeRefusalDiagnosticAuthorities,dm=json(a.diagnosticSourceManifest),dr=json(a.diagnosticSourceReview),cm=json(a.controlsSourcePins),cr=json(a.controlsSourceReview);
 need(dr.schema==='1370-native-refusal-diagnostic-independent-source-review/v1'&&dr.decision==='ACCEPT_STATIC_NATIVE_REFUSAL_DIAGNOSTIC_IMPLEMENTATION_SOURCE_ONLY'&&equal(dr.sourceManifest,a.diagnosticSourceManifest)&&equal(dr.concreteFindings,[])&&dr.executionAuthorization===false,'REFUSAL_DIAGNOSTIC_SOURCE_REVIEW');
 for(const n of ['m0ObserverRowDiagnostic.mjs','INTERFACE.json']){need(equal(dm.files[n],dr.sourcePins[n])&&equal(dm.files[n],dr.routeSourcePins[n]),'REFUSAL_DIAGNOSTIC_SOURCE_ALIASES');readRole(dm.files[n])}
 need(equal(manifest.files['m0ObserverRowDiagnostic.mjs'],c.nativeObserverInputs['m0ObserverRowDiagnostic.mjs'])&&equal(manifest.files['m0ObserverRowDiagnostic.mjs'],dm.files['m0ObserverRowDiagnostic.mjs'])&&equal(a.diagnosticInterface,dm.files['INTERFACE.json'])&&equal(dm.dependencies['m0NativeObserverRows.mjs'],c.nativeObserverInputs['m0NativeObserverRows.mjs']),'REFUSAL_DIAGNOSTIC_OVERRIDE');
 need(cr.schema==='1370-native-observer-independent-controls-source-review/v1'&&cr.decision==='ACCEPT_STATIC_PURE_NATIVE_OBSERVER_CONTROLS_SOURCE_ONLY'&&equal(cr.sourceManifest,a.controlsSourcePins)&&equal(cr.concreteFindings,[])&&cr.executionAuthorization===false,'REFUSAL_CONTROLS_SOURCE_REVIEW');
 for(const n of ['run-native-observer-controls.mjs','MATRIX.json','CONTRACT.json']){need(equal(cm.files[n],cr.sourcePins[n])&&equal(cm.files[n],cr.routeSourcePins[n]),'REFUSAL_CONTROLS_SOURCE_ALIASES');readRole(cm.files[n])}
 const sa=json(a.implementationControlsSourceAdoption);need(sa.schema==='1370-root-native-refusal-diagnostic-implementation-controls-source-adoption/v1'&&sa.status==='ROOT_ADOPTED_NATIVE_REFUSAL_DIAGNOSTIC_AND_AFFECTED_CONTROLS_SOURCE_ONLY'&&sa.executionAuthorization===false,'REFUSAL_SOURCE_ADOPTION');
 for(const [k,r] of Object.entries(a)){need(k==='implementationControlsSourceAdoption'||equal(sa[k==='prospectiveObservedContract'?'prospectiveProtocol':k],r),'REFUSAL_SOURCE_ADOPTION_BINDINGS');readRole(r)}
 need(equal(grant.nativeRefusalControlsObservedAdoption,c.actualNativeRefusalControlsObservedAdoption),'REFUSAL_OBSERVED_ROLE');const o=json(grant.nativeRefusalControlsObservedAdoption),ct=c.nativeRefusalObservedAdoptionContract;
 need(o.schema===ct.schema&&o.status===ct.status&&Number.isSafeInteger(o.actualExit)&&o.actualExit===0&&o.soleLaneReleased===true,'REFUSAL_ACTUAL_ADOPTION');
 for(const k of ['caseCount','positiveCount','specificNegativeCount','originalOrderingCases','originalParserCasesReplayed'])need(Number.isSafeInteger(o[k])&&o[k]===ct[k],'REFUSAL_ACTUAL_COUNTS');
 for(const k of ['executionAuthorization','game','privateM0ReadOrWritten','fullQualificationAccepted','fullBodyGameAssertionsExecuted'])need(o[k]===false,'REFUSAL_SCOPE');
 for(const [k,r] of Object.entries(a))need(equal(o[k],r),'REFUSAL_OBSERVED_AUTHORITIES');
 for(const n of ['m0ObserverRowDiagnostic.mjs','m0NativeObserverRows.mjs','m0FeasibilityWitness-native.ts','ordering.ts'])need(equal(o.inputRoles[n],manifest.files[n]),'REFUSAL_ACTUAL_INPUT_BINDINGS');
 need(equal(o.implementationSourcePins,c.nativeObserverAuthorities.implementationSourcePins)&&equal(o.implementationSourceReview,c.nativeObserverAuthorities.implementationSourceReview),'REFUSAL_BASE_IMPLEMENTATION');
 const rv=json(o.independentObservedReview);need(rv.schema===ct.reviewSchema&&rv.decision===ct.reviewDecision&&equal(rv.concreteFindings,[])&&rv.executionAuthorization===false,'REFUSAL_OBSERVED_REVIEW');
 const r=json(o.result),m=json(cm.files['MATRIX.json']);need(r.schema==='1370-native-observer-independent-controls-result/v1'&&r.status==='PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED'&&r.caseCount===86&&r.positiveCount===13&&r.specificNegativeCount===73&&r.originalOrderingCases===18&&r.originalParserCasesReplayed===0&&equal(r.results,m.cases.map(row=>({...row,verdict:row.expected==='GREEN'?'ACCEPT_POSITIVE':'ACCEPT_SPECIFIC_REFUSAL'}))),'REFUSAL_EXACT_ACTUAL_ROSTER');
 need(equal(r.inputRoles,o.inputRoles)&&r.executionAuthorization===false&&r.game===false&&r.privateM0ReadOrWritten===false&&r.fullQualificationAccepted===false,'REFUSAL_RESULT_SCOPE');
 for(const k of ['diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption','controlsSourcePins','controlsSourceReview','prospectiveObservedContract'])need(equal(r[k],a[k]),'REFUSAL_RESULT_AUTHORITIES');
 for(const k of ['readback','actualTool','rootReaderActualTool','sourceAdoption','sourcePins','sourceReview','workerResult','recorderResult'])readRole(o[k],16*1024*1024);
 return o;
}

'''
proofs={}
for n in names:
 old=(F0/n).read_text();t=old
 for a,b in outmap.items():t=t.replace(a,b)
 if n=='RESOLUTION-SOURCE-BINDING.json':
  r=load(F0/n);r['derivatives']['src/core/m0ObserverRowDiagnostic.mjs']=diag;t=json.dumps(rebase(r),indent=2)+'\n'
 if n in ['run-fullfunction.py','run-fullfunction.mjs']:
  if n.endswith('.py'):
   a=t.index('def authenticate_observer_diagnostic');b=t.index('def authenticate_current_protection',a);section=t[a:b].replace("c['nativeObserverInputs']","c['historicalNativeObserverInputs']")
   section=change(section,"==manifest['files'][name]"," and (name=='m0ObserverRowDiagnostic.mjs' or r==manifest['files'][name])")
   t=t[:a]+section+pygate+t[b:]
   t=change(t,'authenticate_observer_diagnostic(g,c,manifest)\n proof_config','authenticate_observer_diagnostic(g,c,manifest)\n authenticate_refusal_diagnostic(g,c,manifest)\n proof_config')
   t=change(t,"c=load(cr,131072)","c=load(cr,131072);need(c['actualCurrentAPFullPreflightAdoption'] is not None and c['currentProtection'] is not None,'UNFILLED_CURRENT_AP_AUTHORITY')")
   t=change(t,"need(p['nativeControlsObservedAdoption']", "need(p['nativeRefusalControlsObservedAdoption']==c['actualNativeRefusalControlsObservedAdoption']==g['nativeRefusalControlsObservedAdoption'],'CURRENT_REFUSAL_86_ROLE');need(p['nativeControlsObservedAdoption']")
  else:
   a=t.index('function authenticateObserverDiagnostic');b=t.index('function authenticateCurrentProtection',a);section=t[a:b].replace('c.nativeObserverInputs','c.historicalNativeObserverInputs')
   section=change(section,'&&equal(r,manifest.files[n])',"&&(n==='m0ObserverRowDiagnostic.mjs'||equal(r,manifest.files[n]))")
   t=t[:a]+section+jsgate+t[b:]
   t=change(t,'authenticateObserverDiagnostic(grant,c,manifest);','authenticateObserverDiagnostic(grant,c,manifest);\nauthenticateRefusalDiagnostic(grant,c,manifest);')
   t=change(t,'const c=json(configRole);',"const c=json(configRole);need(c.actualCurrentAPFullPreflightAdoption!==null&&c.currentProtection!==null,'UNFILLED_CURRENT_AP_AUTHORITY');")
   t=change(t,'need(equal(p.nativeControlsObservedAdoption',"need(equal(p.nativeRefusalControlsObservedAdoption,c.actualNativeRefusalControlsObservedAdoption)&&equal(p.nativeRefusalControlsObservedAdoption,grant.nativeRefusalControlsObservedAdoption),'CURRENT_REFUSAL_86_ROLE');need(equal(p.nativeControlsObservedAdoption")
  t=t.replace('currentAOFullPreflight','currentAPFullPreflight').replace('actualCurrentAOFullPreflight','actualCurrentAPFullPreflight').replace('1370-root-fullfunction-current-protection/v3','1370-root-fullfunction-current-protection/v4').replace('1370-ap-root-current-ao-fullpreflight-adoption/v1','1370-aq-root-current-ap-fullpreflight-adoption/v1').replace('ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT','ROOT_ADOPTED_CURRENT_AP_FULL_PREFLIGHT')
  # Keep the AM-to-AN check, then authenticate the historical AN-to-AO link
  # before the new current AO-to-AP transition. Do not join AP directly to AN.
  if n.endswith('.py'):
   marker=" transition=load(p['currentOperationalTransition']);"
   insert=" ao=load(c['historicalANToAOTransition']);need(ao['schema']=='1370-ap-current-ao-operational-transition/v1' and ao['actualHead']==c['historicalAOHead'] and ao['predecessor']==c['historicalANHead'] and ao['sourceTree']==c['productionSourceTree'] and ao['docsOnlyVerified'] is True and ao['workingTreeClean'] is True and ao['executionAuthorization'] is False,'HISTORICAL_AN_TO_AO_CONTINUITY');read(ao['publishedReadback'])\n"
   t=change(t,marker,insert+marker).replace("transition['schema']=='1370-ap-current-ao-operational-transition/v1'","transition['schema']=='1370-aq-current-ap-operational-transition/v1'").replace("transition['predecessor']==c['historicalANHead']","transition['predecessor']==c['historicalAOHead']")
  else:
   marker=' const t=json(p.currentOperationalTransition);'
   insert=" const ao=json(c.historicalANToAOTransition);need(ao.schema==='1370-ap-current-ao-operational-transition/v1'&&ao.actualHead===c.historicalAOHead&&ao.predecessor===c.historicalANHead&&ao.sourceTree===c.productionSourceTree&&ao.docsOnlyVerified===true&&ao.workingTreeClean===true&&ao.executionAuthorization===false,'HISTORICAL_AN_TO_AO_CONTINUITY');readRole(ao.publishedReadback);\n"
   t=change(t,marker,insert+marker).replace("t.schema==='1370-ap-current-ao-operational-transition/v1'","t.schema==='1370-aq-current-ap-operational-transition/v1'").replace('t.predecessor===c.historicalANHead','t.predecessor===c.historicalAOHead')
 if n in ['run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py']:t=change(t,role(F0/'CONFIG.json')['sha256'],sha)
 (F/n).write_text(t)
# Recorder binds the final controller bytes, not the historical controller hash.
n='record-fullfunction.py';t=(F/n).read_text();t=change(t,role(F0/'run-fullfunction.py')['sha256'],role(F/'run-fullfunction.py')['sha256']);(F/n).write_text(t)
manifestFiles={n:role(F/n) for n in names};manifestFiles['CONFIG.json']=role(F/'CONFIG.json')
for k,v in {**c['parserInputs'],**c['representationInputs'],**c['nativeObserverInputs']}.items():manifestFiles[k]=v
aliases={k:manifestFiles[k] for k in c['reviewAliases']};assert len(aliases)==20
r=rebase(load(F0/'RECIPE.json'));r['config']=role(F/'CONFIG.json');r['operationalHead']=c['operationalHead'];r['currentProtection']=None;r['currentProtectionContract']=contract;r['currentOperationalTransition']=c['actualCurrentOperationalTransition'];r.pop('currentAOFullPreflightAdoption');r['currentAPFullPreflightAdoption']=c['actualCurrentAPFullPreflightAdoption'];r['nativeObserverInputs']=c['nativeObserverInputs'];r['historicalNativeObserverInputs']=c['historicalNativeObserverInputs'];r['historicalANToAOTransition']=c['historicalANToAOTransition'];r['nativeRefusalDiagnosticAuthorities']=c['nativeRefusalDiagnosticAuthorities'];r['nativeRefusalControlsObservedAdoption']=observedRole;r['futureInputs']['currentProtection']=None;r['futureInputs']['nativeRefusalControlsObservedAdoption']=observedRole;r['grantContract']['fields'].append('nativeRefusalControlsObservedAdoption');r['rootOnceGrantRequired']['nativeRefusalControlsObservedAdoption']=observedRole;r['sourcePins']=aliases;r['routeSourcePins']=aliases;r['sourceSealed']=False;r['heldUnfilledActualRoles']=c['heldUnfilledActualRoles'];r['sourceOnlyUnfilled']=True
r['diagnosticGoal']='AQ diagnostic v2 only: bounded canonical lower-bound or exact physical-row metadata, stage-aware native error classification and first-error preservation. Fullfunction baseline/mutant outcomes remain future; no cap or fixture change.'
r['claimLimits']=['This AQ route is unrun and unsealed; current AP fullguard/current protection/source review/grant remain pending.','Historical AP actual17063 earned real generation but ended in original row-byte Error and unavailable diagnostic; no precise offending row attribution or baseline/mutant qualification follows. Its protected STOP remains preserved.','Actual AQ pure86 admits diagnostic-v2 public behavior only; it does not admit game assertions, private M0 proofs, fixture fit or a real offending game row.','Historical pure72 and pure49 retain their original input roles. AQ diagnostic is a separate override, never an invented entry in the AP implementation manifest.','Original512/16384/2097152 physical observer caps, helper trace caps,64MiB packet bound,300/320/330 route clocks and all fullfunction predicates are unchanged.','Historical AM types remain historical; current AP protection and AM-to-AN-to-AO-to-AP documentary transitions are separately authenticated. Original M0 BEFORE/AFTER proofs remain mandatory and separate.','No neutrality, default enable, release or production promotion claim.']
r['reviewedPriorStopAdoption']=c['reviewedPriorStopAdoption']
put(F/'RECIPE.json',r);manifestFiles['RECIPE.json']=role(F/'RECIPE.json')
for n in [*names,'CONFIG.json','RECIPE.json']:proofs[n]=diff((F0/n).read_text(),(F/n).read_text(),F0/n)
put(F/'WHOLE-FORWARD-INVERSE.json',proofs)
manifestFiles['WHOLE-FORWARD-INVERSE.json']=role(F/'WHOLE-FORWARD-INVERSE.json')
put(F/'SOURCE-PINS.json',dict(schema='1370-fullfunction-qualification-source-pins/v1',executionAuthorization=False,files=manifestFiles,actualSourceReview=None,actualGrant=None,actualResult=None,sourceOnlyUnfilled=True))
# Parent and finite reader: preserve all helper bodies and outcome handling.
parents={}
for n in ['launch-fullfunction.py','read-fullfunction.py']:
 old=(P0/n).read_text();t=old
 for a,b in outmap.items():t=t.replace(a,b)
 t=t.replace(str(P0),str(P))
 t=t.replace("S/'1370-ap-m0-fullfunction-native-observer-source-20261010-r3'",f"S/'{F.name}'")
 t=t.replace('currentAOFullPreflight','currentAPFullPreflight').replace('actualCurrentAOFullPreflight','actualCurrentAPFullPreflight').replace('1370-root-fullfunction-current-protection/v3','1370-root-fullfunction-current-protection/v4').replace('ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT','ROOT_ADOPTED_CURRENT_AP_FULL_PREFLIGHT').replace('1370-ap-current-ao-root-prelaunch-readback/v2','1370-ap-current-ap-root-prelaunch-readback/v2')
 t=t.replace(original['operationalHead'],c['operationalHead'])
 if n=='launch-fullfunction.py':
  line=next(x for x in t.splitlines() if x.startswith(' diagnostic_roles='));t=change(t,line,' diagnostic_roles='+repr(c['nativeObserverInputs']))
  t=change(t,"c=load(authenticate(sp['files']['CONFIG.json']));", "c=load(authenticate(sp['files']['CONFIG.json']));require(c['actualCurrentAPFullPreflightAdoption'] is not None and c['currentProtection'] is not None,'UNFILLED_CURRENT_AP_AUTHORITY');")
  t=change(t,"'nativeControlsObservedAdoption'):authenticate(protection[name])", "'nativeControlsObservedAdoption','nativeRefusalControlsObservedAdoption'):authenticate(protection[name])")
  # The historical72 module comparison remains exact against its historical map.
  t=t.replace("c['nativeObserverInputs']['m0ObserverRowDiagnostic.mjs']","c['historicalNativeObserverInputs']['m0ObserverRowDiagnostic.mjs']")
  t=t.replace("diagnostic_roles['m0ObserverRowDiagnostic.mjs']","c['historicalNativeObserverInputs']['m0ObserverRowDiagnostic.mjs']")
  marker=" earlier=load(authenticate(c['historicalAMToANTransition']));current=load(authenticate(c['actualCurrentOperationalTransition']));"
  a=t.index(marker);b=t.index('\n',a)
  t=t[:a]+" earlier=load(authenticate(c['historicalAMToANTransition']));middle=load(authenticate(c['historicalANToAOTransition']));current=load(authenticate(c['actualCurrentOperationalTransition']));require(earlier['actualHead']==middle['predecessor'] and earlier['predecessor']==c['historicalTypesHead'] and middle['actualHead']==current['predecessor']==c['historicalAOHead'] and current['actualHead']==c['operationalHead'] and earlier['sourceTree']==middle['sourceTree']==current['sourceTree']==c['productionSourceTree'],'AM_AN_AO_AP_CONTINUITY')"+t[b:]
  t=change(t,"'nativeObserverControlsObservedAdoption':b['nativeObserverControlsObservedAdoption'],'runtimeTools'", "'nativeObserverControlsObservedAdoption':b['nativeObserverControlsObservedAdoption'],'nativeRefusalControlsObservedAdoption':b['nativeRefusalControlsObservedAdoption'],'runtimeTools'")
  marker=" artifact=load(authenticate(b['artifactBoundAdoption']));"
 else:
  t=change(t,role(F0/'CONFIG.json')['sha256'],sha);t=change(t,role(F0/'SOURCE-PINS.json')['sha256'],role(F/'SOURCE-PINS.json')['sha256'])
  t=change(t,"'nativeControlsObservedAdoption'):need(role", "'nativeControlsObservedAdoption','nativeRefusalControlsObservedAdoption'):need(role")
  t=change(t,"'nativeObserverControlsObservedAdoption':g['nativeObserverControlsObservedAdoption'],'historicalTypesRemainHistorical'", "'nativeObserverControlsObservedAdoption':g['nativeObserverControlsObservedAdoption'],'nativeRefusalControlsObservedAdoption':g['nativeRefusalControlsObservedAdoption'],'historicalTypesRemainHistorical'")
  marker=" rootRole=role(P/'ROOT-LAUNCH-CLAIM.json');"
 extra=" refusal=load("+("authenticate(b['nativeRefusalControlsObservedAdoption'])" if n=='launch-fullfunction.py' else "g['nativeRefusalControlsObservedAdoption']")+");"+("require" if n=='launch-fullfunction.py' else "need")+"(refusal['schema']=='1370-root-native-refusal-diagnostic-controls-observed-adoption/v1' and refusal['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_REFUSAL_DIAGNOSTIC_86_CONTROLS_ONLY' and refusal['actualExit']==0 and refusal['caseCount']==86 and refusal['positiveCount']==13 and refusal['specificNegativeCount']==73 and refusal['soleLaneReleased'] is True and refusal['executionAuthorization'] is False and refusal['game'] is False and refusal['privateM0ReadOrWritten'] is False and refusal['fullQualificationAccepted'] is False and " + ("exact(b['nativeRefusalControlsObservedAdoption'],c['actualNativeRefusalControlsObservedAdoption']) and exact(protection['nativeRefusalControlsObservedAdoption'],b['nativeRefusalControlsObservedAdoption']) and exact(refusal['inputRoles']['m0ObserverRowDiagnostic.mjs'],diagnostic_roles['m0ObserverRowDiagnostic.mjs'])" if n=='launch-fullfunction.py' else "g['nativeRefusalControlsObservedAdoption']==c['actualNativeRefusalControlsObservedAdoption']==protection['nativeRefusalControlsObservedAdoption'] and refusal['inputRoles']['m0ObserverRowDiagnostic.mjs']==manifest['files']['m0ObserverRowDiagnostic.mjs']")+",'ACTUAL_REFUSAL_86_DIAGNOSTIC_AUTHORITY')\n"
 t=change(t,marker,extra+marker)
 (P/n).write_text(t);parents[n]=diff(old,t,P0/n)
put(P/'WHOLE-FORWARD-INVERSE.json',parents)
pr=load(P0/'RECIPE.json');pr['sourceManifest']=role(F/'SOURCE-PINS.json');pr['config']=role(F/'CONFIG.json');pr['currentProtection']=None;pr['parentRecordedPath']=c['parentRecordedPath'];pr['nativeRefusalControlsObservedAdoption']=observedRole;pr['sourceOnlyUnfilled']=True;pr['heldUnfilledActualRoles']=c['heldUnfilledActualRoles'];put(P/'RECIPE.json',pr)
put(P/'SOURCE-PINS.json',dict(schema='1370-fullfunction-parent-source-pins/v1',executionAuthorization=False,files={n:role(P/n) for n in ['launch-fullfunction.py','read-fullfunction.py','RECIPE.json','WHOLE-FORWARD-INVERSE.json']},actualSourceReview=None,actualGrant=None,sourceOnlyUnfilled=True))
def funcs(t):
 return {n.name:ast.get_source_segment(t,n) for n in ast.parse(t).body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
checks={}
for path,old in [(F/'run-fullfunction.py',F0/'run-fullfunction.py'),(F/'record-fullfunction.py',F0/'record-fullfunction.py'),(P/'launch-fullfunction.py',P0/'launch-fullfunction.py'),(P/'read-fullfunction.py',P0/'read-fullfunction.py')]:
 before=funcs(old.read_text());after=funcs(path.read_text());checks[path.name]={'unchangedDefinitions':[k for k in before if before[k]==after.get(k)],'changedDefinitions':[k for k in before if before[k]!=after.get(k)],'newDefinitions':[k for k in after if k not in before]}
assert checks['record-fullfunction.py']['changedDefinitions']==[]
assert checks['launch-fullfunction.py']['changedDefinitions']==['main'] and checks['read-fullfunction.py']['changedDefinitions']==['main']
assert c['bounds']==original['bounds'] and c['typesAdoptionContract']==original['typesAdoptionContract']
assert (F/'CONFIG-TEMPLATE.mts').read_text().replace(str(F),str(F0))==(F0/'CONFIG-TEMPLATE.mts').read_text() and (F/'CORE-TEST-TEMPLATE.ts').read_bytes()==(F0/'CORE-TEST-TEMPLATE.ts').read_bytes()
for n in c['nativeObserverInputs']:
 if n!='m0ObserverRowDiagnostic.mjs':assert c['nativeObserverInputs'][n]==original['nativeObserverInputs'][n]
report=dict(schema='1370-aq-fullfunction-diagnostic-v2-held-preparation/v1',executionAuthorization=False,sourceSealed=False,route=role(F/'SOURCE-PINS.json'),parent=role(P/'SOURCE-PINS.json'),baselineRoute=role(F0/'SOURCE-PINS.json'),baselineParent=role(P0/'SOURCE-PINS.json'),genuine86Adoption=observedRole,prospectiveProtectionContract=c['fullfunctionProtectionProspectiveContract'],pendingActualFields=c['heldUnfilledActualRoles'],originalBoundsAndTypesContractExact=True,originalCoreTemplateByteExact=True,configTemplateOnlyOwnTransformPathRebased=True,onlyOperativePublicModuleOverride=diag,definitionChecks=checks,wholeInverseApplications=22,actualRuntimePerformed=False,privateTreesRead=False)
put(D/'DRAFT-READBACK.json',report)
print(json.dumps(report,indent=2))
