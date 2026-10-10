"""Finite data/AST-only checks of the held source. Does not import candidate code."""
from pathlib import Path
import ast,difflib,hashlib,json,re
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
F=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2'
P=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r2'
F0=S/'1370-ap-m0-fullfunction-native-observer-source-20261010-r3'
def load(p):return json.loads(Path(p['path'] if isinstance(p,dict) else p).read_text())
def role(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
c=load(F/'CONFIG.json');m=load(F/'SOURCE-PINS.json');recipe=load(F/'RECIPE.json')
checks=[];roles=0
for n,r in m['files'].items():
 assert role(r['path'])==r,n;roles+=1
assert {n:m['files'][n] for n in c['reviewAliases']}==recipe['sourcePins']==recipe['routeSourcePins'] and len(c['reviewAliases'])==20
def walk(v):
 if isinstance(v,dict):
  if set(v)=={'path','bytes','sha256'} and Path(v['path']).parent==F:assert role(v['path'])==v,v
  else:
   for x in v.values():walk(x)
 elif isinstance(v,list):
  for x in v:walk(x)
walk(c);walk(recipe)
for base in [F,P]:
 for n,item in load(base/'WHOLE-FORWARD-INVERSE.json').items():
  assert ''.join(difflib.restore(item['losslessNdiff'],1)).encode()==Path(item['baseline']['path']).read_bytes()
  assert ''.join(difflib.restore(item['losslessNdiff'],2)).encode()==(base/n).read_bytes()
  assert role(item['baseline']['path'])==item['baseline']
for base,n in [(F,'run-fullfunction.py'),(F,'record-fullfunction.py'),(P,'launch-fullfunction.py'),(P,'read-fullfunction.py')]:
 t=(base/n).read_text();tree=ast.parse(t,filename=str(base/n))
 required={node.slice.value for node in ast.walk(tree) if isinstance(node,ast.Subscript) and isinstance(node.value,ast.Name) and node.value.id in ['c','parser_config'] and isinstance(node.slice,ast.Constant) and isinstance(node.slice.value,str)}
 assert required<=set(c),(n,required-set(c))
 assert F0.name not in t,n
 checks.append(dict(file=n,staticConfigurationKeys=sorted(required),astParsedOnly=True))
t=(F/'run-fullfunction.mjs').read_text();keys=set(re.findall(r'\bc\.([A-Za-z][A-Za-z0-9_]*)',t));assert keys<=set(c),keys-set(c)
assert c['actualCurrentAPFullPreflightAdoption'] is not None and c['currentProtection'] is None
assert c['historicalNativeObserverInputs']['m0ObserverRowDiagnostic.mjs']['sha256']=='be7c1f330fe816e668c5e2fc6028f1cd2490297f23d3be09ac53d17ee9889397'
assert c['nativeObserverInputs']['m0ObserverRowDiagnostic.mjs']['sha256']=='db78301bf62d52b574ed8df272d0fe3d7b10c2568f930d10eb359092725bbba6'
o=load(c['actualNativeRefusalControlsObservedAdoption']['path']);a=c['nativeRefusalDiagnosticAuthorities'];sa=load(a['implementationControlsSourceAdoption']['path'])
for k,r in a.items():assert o[k]==r and (k=='implementationControlsSourceAdoption' or sa['prospectiveProtocol' if k=='prospectiveObservedContract' else k]==r) and role(r['path'])==r,k
ir=load(a['diagnosticSourceReview']['path']);im=load(a['diagnosticSourceManifest']['path']);cr=load(a['controlsSourceReview']['path']);cm=load(a['controlsSourcePins']['path'])
for n in ['m0ObserverRowDiagnostic.mjs','INTERFACE.json']:assert ir['sourcePins'][n]==ir['routeSourcePins'][n]==im['files'][n]
for n in ['run-native-observer-controls.mjs','MATRIX.json','CONTRACT.json']:assert cr['sourcePins'][n]==cr['routeSourcePins'][n]==cm['files'][n]
rv=load(o['independentObservedReview']['path']);result=load(o['result']['path']);matrix=load(cm['files']['MATRIX.json']);ct=c['nativeRefusalObservedAdoptionContract']
assert rv['schema']==ct['reviewSchema'] and rv['decision']==ct['reviewDecision'] and rv['concreteFindings']==[] and rv['executionAuthorization'] is False
assert o['schema']==ct['schema'] and o['status']==ct['status']
for k in ['caseCount','positiveCount','specificNegativeCount','originalOrderingCases','originalParserCasesReplayed']:assert type(o[k]) is int and o[k]==result[k]==ct[k]
assert result['results']==[{**row,'verdict':'ACCEPT_POSITIVE' if row['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for row in matrix['cases']]
for k in ['diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption','controlsSourcePins','controlsSourceReview','prospectiveObservedContract']:assert result[k]==a[k]
for n in ['m0ObserverRowDiagnostic.mjs','m0NativeObserverRows.mjs','m0FeasibilityWitness-native.ts','ordering.ts']:assert o['inputRoles'][n]==m['files'][n]
original=load(F0/'CONFIG.json');assert c['bounds']==original['bounds'] and c['typesAdoptionContract']==original['typesAdoptionContract']
resolution=load(F/'RESOLUTION-SOURCE-BINDING.json');r0=load(F0/'RESOLUTION-SOURCE-BINDING.json');r0['derivatives']['src/core/m0ObserverRowDiagnostic.mjs']=c['nativeObserverInputs']['m0ObserverRowDiagnostic.mjs'];assert resolution==r0
assert (F/'CORE-TEST-TEMPLATE.ts').read_bytes()==(F0/'CORE-TEST-TEMPLATE.ts').read_bytes()
for n in ['m0NativeObserverRows.mjs','m0FeasibilityWitness-native.ts','ordering.ts','talentMarket.ts','typed-propagation-removed-talentMarket.ts','FULL-BODY-CONTROLS-TEMPLATE.ts']:assert c['nativeObserverInputs'][n]==original['nativeObserverInputs'][n]
report={'schema':'1370-aq-fullfunction-held-draft-static-audit/v1','executionAuthorization':False,'route':role(F/'SOURCE-PINS.json'),'parent':role(P/'SOURCE-PINS.json'),'authenticatedManifestRoles':roles,'exactReviewAliases':20,'wholeInverseApplications':22,'pythonConfigurationKeys':checks,'nodeConfigurationKeys':sorted(keys),'genuine86AuthorityPredicatesMatchRetainedProducerData':True,'historical72VersusCurrentDiagnosticRolesDistinct':True,'soleResolutionDerivativeChange':'src/core/m0ObserverRowDiagnostic.mjs','sixOtherNativeInputsUnchanged':True,'coreTemplateByteExact':True,'boundsAndHistoricalTypesContractUnchanged':True,'pendingActualFields':c['heldUnfilledActualRoles'],'sourceSealed':False,'actualCandidateExecuted':False,'privateTreeRead':False}
(D/'STATIC-AUDIT.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'audit':role(D/'STATIC-AUDIT.json'),'route':report['route'],'parent':report['parent'],'pending':report['pendingActualFields']}))
