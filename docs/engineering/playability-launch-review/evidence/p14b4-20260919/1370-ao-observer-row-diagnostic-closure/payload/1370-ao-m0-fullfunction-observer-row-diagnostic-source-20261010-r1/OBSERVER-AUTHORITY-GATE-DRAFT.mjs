function authenticateObserverDiagnostic(grant,c,manifest){
 const a=c.observerDiagnosticControlsAuthorities,im=json(a.implementationSourcePins),ir=json(a.implementationSourceReview),cm=json(a.controlsSourcePins),cr=json(a.controlsSourceReview);
 need(ir.decision==='ACCEPT_STATIC_BOUNDED_OBSERVER_ROW_DIAGNOSTIC_IMPLEMENTATION_SOURCE_ONLY'&&equal(ir.sourceManifest,a.implementationSourcePins)&&equal(ir.concreteFindings,[])&&ir.executionAuthorization===false,'DIAGNOSTIC_IMPLEMENTATION_REVIEW');
 for(const [n,r] of Object.entries(c.diagnosticInputs)){need(equal(r,im.files[n])&&equal(r,ir.sourcePins[n])&&equal(r,ir.routeSourcePins[n])&&equal(r,manifest.files[n]),'DIAGNOSTIC_SOURCE_BINDINGS');readRole(r)}
 need(cr.decision==='ACCEPT_STATIC_PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_SOURCE_ONLY'&&equal(cr.sourceManifest,a.controlsSourcePins)&&equal(cr.concreteFindings,[])&&cr.executionAuthorization===false,'DIAGNOSTIC_CONTROLS_REVIEW');
 for(const k of ['implementationControlsSourceAdoption','rootDesignAdoption','api'])readRole(a[k]);
 const sa=json(a.implementationControlsSourceAdoption);need(sa.status==='ROOT_ADOPTED_OBSERVER_ROW_DIAGNOSTIC_IMPLEMENTATION_AND_CONTROLS_SOURCE_ONLY'&&sa.executionAuthorization===false,'DIAGNOSTIC_SOURCE_ADOPTION');
 for(const [x,y] of [['implementationSourcePins','implementationSourcePins'],['implementationReview','implementationSourceReview'],['controlsSourcePins','controlsSourcePins'],['controlsReview','controlsSourceReview'],['rootDesignAdoption','rootDesignAdoption'],['api','api']])need(equal(sa[x],a[y]),'DIAGNOSTIC_SOURCE_ADOPTION_ROLES');
 need(equal(grant.observerDiagnosticControlsObservedAdoption,c.actualObserverDiagnosticControlsObservedAdoption),'EXACT_DIAGNOSTIC_OBSERVED_ROLE');const o=json(grant.observerDiagnosticControlsObservedAdoption),ct=c.observerDiagnosticControlsObservedAdoptionContract;
 need(o.schema===ct.schema&&o.status===ct.status,'DIAGNOSTIC_OBSERVED_CONTRACT');
 for(const k of ['caseCount','positiveCount','specificNegativeCount'])need(Number.isSafeInteger(o[k])&&o[k]===ct[k],'DIAGNOSTIC_CONTROL_COUNT');
 need(Number.isSafeInteger(o.actualExit)&&o.actualExit===0&&o.soleLaneReleased===true,'DIAGNOSTIC_ACTUAL_EXIT_RELEASE');
 for(const k of ['executionAuthorization','game','privateM0ReadOrWritten','fullQualificationAccepted','fullBodyGameAssertionsExecuted'])need(o[k]===false,'DIAGNOSTIC_PURE_SCOPE');
 for(const [k,r] of Object.entries(a))need(equal(o[k],r),'DIAGNOSTIC_OBSERVED_AUTHORITIES');
 need(equal(o.sourceReviewedFullBodyTemplate,c.diagnosticInputs['FULL-BODY-CONTROLS-TEMPLATE.ts'])&&equal(o.inputRoles['m0ObserverRowDiagnostic.mjs'],c.diagnosticInputs['m0ObserverRowDiagnostic.mjs'])&&equal(o.inputRoles['m0FeasibilityWitness.ts'],im.files['m0FeasibilityWitness.ts']),'DIAGNOSTIC_ACTUAL_TESTED_INPUTS');
 const review=json(o.independentObservedReview);need(review.decision===ct.reviewDecision&&equal(review.concreteFindings,[])&&review.executionAuthorization===false,'DIAGNOSTIC_OBSERVED_REVIEW');
 const r=json(o.result),m=json(cm.files['MATRIX.json']);need(r.schema==='1370-observer-row-independent-controls-result/v1'&&r.status==='PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_COMPLETED_UNADOPTED'&&r.caseCount===48&&r.positiveCount===6&&r.specificNegativeCount===42&&equal(r.results,m.cases.map(row=>({...row,verdict:row.expected==='GREEN'?'ACCEPT_POSITIVE':'ACCEPT_SPECIFIC_REFUSAL'}))),'DIAGNOSTIC_EXACT_ACTUAL_ROSTER');
 need(equal(r.inputRoles,o.inputRoles)&&r.executionAuthorization===false&&r.game===false&&r.privateM0ReadOrWritten===false&&r.fullQualificationAccepted===false,'DIAGNOSTIC_RESULT_SCOPE');
 for(const k of ['implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption'])need(equal(r[k],a[k]),'DIAGNOSTIC_RESULT_AUTHORITIES');
 for(const k of ['readback','actualTool','sourceAdoption','sourcePins','sourceReview','workerResult'])readRole(o[k],16*1024*1024);
 return o;
}
