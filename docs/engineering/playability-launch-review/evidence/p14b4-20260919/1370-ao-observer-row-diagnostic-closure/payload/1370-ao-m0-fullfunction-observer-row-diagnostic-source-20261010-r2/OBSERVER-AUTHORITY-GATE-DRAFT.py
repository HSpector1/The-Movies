def authenticate_observer_diagnostic(g,c,manifest):
 authorities=c['observerDiagnosticControlsAuthorities']
 implementation=load(authorities['implementationSourcePins']);implementation_review=load(authorities['implementationSourceReview'])
 need(implementation_review['decision']=='ACCEPT_STATIC_BOUNDED_OBSERVER_ROW_DIAGNOSTIC_IMPLEMENTATION_SOURCE_ONLY' and implementation_review['sourceManifest']==authorities['implementationSourcePins'] and implementation_review['concreteFindings']==[] and implementation_review['executionAuthorization'] is False,'DIAGNOSTIC_IMPLEMENTATION_REVIEW')
 for name,r in c['diagnosticInputs'].items():
  need(r==implementation['files'][name]==implementation_review['sourcePins'][name]==implementation_review['routeSourcePins'][name]==manifest['files'][name],'DIAGNOSTIC_SOURCE_BINDINGS');read(r)
 controls=load(authorities['controlsSourcePins']);controls_review=load(authorities['controlsSourceReview'])
 need(controls_review['decision']=='ACCEPT_STATIC_PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_SOURCE_ONLY' and controls_review['sourceManifest']==authorities['controlsSourcePins'] and controls_review['concreteFindings']==[] and controls_review['executionAuthorization'] is False,'DIAGNOSTIC_CONTROLS_REVIEW')
 for k in ['implementationControlsSourceAdoption','rootDesignAdoption','api']:read(authorities[k])
 source_adoption=load(authorities['implementationControlsSourceAdoption'])
 need(source_adoption['status']=='ROOT_ADOPTED_OBSERVER_ROW_DIAGNOSTIC_IMPLEMENTATION_AND_CONTROLS_SOURCE_ONLY' and source_adoption['executionAuthorization'] is False,'DIAGNOSTIC_SOURCE_ADOPTION')
 for a,b in [('implementationSourcePins','implementationSourcePins'),('implementationReview','implementationSourceReview'),('controlsSourcePins','controlsSourcePins'),('controlsReview','controlsSourceReview'),('rootDesignAdoption','rootDesignAdoption'),('api','api')]:need(source_adoption[a]==authorities[b],'DIAGNOSTIC_SOURCE_ADOPTION_ROLES')
 need(g['observerDiagnosticControlsObservedAdoption']==c['actualObserverDiagnosticControlsObservedAdoption'],'EXACT_DIAGNOSTIC_OBSERVED_ROLE')
 observed=load(g['observerDiagnosticControlsObservedAdoption']);contract=c['observerDiagnosticControlsObservedAdoptionContract']
 need(observed['schema']==contract['schema'] and observed['status']==contract['status'],'DIAGNOSTIC_OBSERVED_CONTRACT')
 for k in ['caseCount','positiveCount','specificNegativeCount']:need(type(observed[k]) is int and observed[k]==contract[k],'DIAGNOSTIC_CONTROL_COUNT')
 need(type(observed['actualExit']) is int and observed['actualExit']==0 and observed['soleLaneReleased'] is True,'DIAGNOSTIC_ACTUAL_EXIT_RELEASE')
 for k in ['executionAuthorization','game','privateM0ReadOrWritten','fullQualificationAccepted','fullBodyGameAssertionsExecuted']:need(observed[k] is False,'DIAGNOSTIC_PURE_SCOPE')
 for k,r in authorities.items():need(observed[k]==r,'DIAGNOSTIC_OBSERVED_AUTHORITIES')
 need(observed['sourceReviewedFullBodyTemplate']==c['diagnosticInputs']['FULL-BODY-CONTROLS-TEMPLATE.ts'] and observed['inputRoles']['m0ObserverRowDiagnostic.mjs']==c['diagnosticInputs']['m0ObserverRowDiagnostic.mjs'] and observed['inputRoles']['m0FeasibilityWitness.ts']==implementation['files']['m0FeasibilityWitness.ts'],'DIAGNOSTIC_ACTUAL_TESTED_INPUTS')
 review=load(observed['independentObservedReview']);need(review['decision']==contract['reviewDecision'] and review['concreteFindings']==[] and review['executionAuthorization'] is False,'DIAGNOSTIC_OBSERVED_REVIEW')
 result=load(observed['result']);matrix=load(controls['files']['MATRIX.json'])
 need(result['caseCount']==48 and result['positiveCount']==6 and result['specificNegativeCount']==42 and result['results']==[{**row,'verdict':'ACCEPT_POSITIVE' if row['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for row in matrix['cases']],'DIAGNOSTIC_EXACT_ACTUAL_ROSTER')
 need(result['inputRoles']==observed['inputRoles'] and result['executionAuthorization'] is False and result['game'] is False and result['privateM0ReadOrWritten'] is False and result['fullQualificationAccepted'] is False,'DIAGNOSTIC_RESULT_SCOPE')
 for k in ['implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview']:need(result[k]==authorities[k],'DIAGNOSTIC_RESULT_AUTHORITIES')
 for k in ['readback','actualTool','sourceAdoption','sourcePins','sourceReview','workerResult']:read(observed[k],16*1024**2)
 return observed
