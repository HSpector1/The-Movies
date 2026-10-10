import json,os,hashlib
from pathlib import Path
BASE=Path(__file__).parent
def pairs(rows):
 d={}
 for k,v in rows:
  if k in d:raise ValueError('duplicate key')
  d[k]=v
 return d
def obj(p):return json.loads(p.read_bytes(),object_pairs_hook=pairs)
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
initial=obj(BASE/'INITIAL-TERMINAL-EVIDENCE-AUDIT.json');post=obj(BASE/'FINAL-POST-EVIDENCE-AUDIT.json');recovery=obj(BASE/'FAILED-POST-RECOVERY-EVIDENCE.json')
assert initial['allExactExpectedRolesMatched'] and initial['losslessTypedProofEquality']
assert post['completeImmutableTypedEqual'] and post['nineStrictRootsTypedEqual'] and post['rawLocalOnlyFourRolesAuthenticated'] and post['duringSnapshotStrictRootsTypedEqual']
assert initial['actualToolFinalExit']==2 and post['actualTerminalExit']==0
roles=initial['roles'];pr=post['roles'];rb=obj(Path(pr['fullPostflightReadback']['path']))
reader=obj(Path(pr['readerActualTool']['path']))
assert reader.get('finalExit')==0 and reader['allToolChunks'][-1]['exit_code']==0
assert reader['sessionId']==int(obj(BASE/'POST-EVIDENCE-INPUT.json')['readerSessionId'])
reader_stdout=json.loads(reader['allToolChunks'][-1]['output'])
assert reader_stdout['readback']==pr['fullPostflightReadback']
receipt={
 'schema':'1370-fullfunction-helper-probe-total-byte-cap-stop-independent-observed-review/v1',
 'decision':'ACCEPT_OBSERVED_FULLFUNCTION_HELPER_PROBE_TOTAL_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT',
 'readback':roles['readback'],'currentTypesAdoption':roles['typesAdoption'],
 'fullPostflightReadback':pr['fullPostflightReadback'],'fullPostflightSnapshot':pr['fullPostflightSnapshot'],
 'fullPostflightReaderActualTool':pr['readerActualTool'],
 'generationReport':roles['generateReport'],'generationReceipt':roles['fixtureReceipt'],
 'fixture':roles['fixturePacket'],'currentGenerationFixture':roles['fixturePacket'],'priorGenerationFixture':roles['priorR3Fixture'],'repeatedFixtureBytesEqual':True,'diagnosis':initial['firstOverflow'],'baselineReport':roles['baselineReport'],
 'generationControl':roles['generateControl'],'generationBinding':roles['generateBinding'],'baselineBinding':roles['baselineBinding'],
 'sourceManifest':roles['sourcePins'],'sourceReview':roles['sourceReview'],
 'actualTool':roles['actualTool'],'grant':roles['grant'],'currentProtection':roles['currentProtection'],
 'preflightObservedAdoption':roles['preflightObservedAdoption'],'parserControlsAdoption':roles['parserControlsAdoption'],
 'controllerResult':roles['controllerResult'],'controllerBinding':roles['controllerBinding'],'firstProof':roles['firstProof'],
 'retainedCore':roles['coreTest'],'retainedFullBodyControls':roles['fullBodyControls'],
 'initialTerminalEvidenceAudit':role(BASE/'INITIAL-TERMINAL-EVIDENCE-AUDIT.json'),
 'finalPostflightEvidenceAudit':role(BASE/'FINAL-POST-EVIDENCE-AUDIT.json'),
 'failedSharedPostflight':{'sessionId':7509,'terminalToolExit':1,'originalAttemptRemainsFailure':True,'fullMapAccepted':False,'snapshot':None,'sourceFailure':'STOP: disk floor/reserve at facts_after=current(), before roots_after and snapshot output writes','roles':recovery['roles'],'independentFailedPostAudit':recovery['roles']['independentFailedPostAudit'],'failedScannerChecksBeforeAndAfterRecovery':recovery['separateFailedScanner35222ChecksBeforeAndAfterRecovery'],'failedScannerAbsentEvidenceKeptSeparate':True},
 'diskRecovery':{'evidenceAudit':role(BASE/'FAILED-POST-RECOVERY-EVIDENCE.json'),'cleanupResult':recovery['roles']['cleanupResult'],'rootObservation':recovery['roles']['failedPostRootObservation'],'failedScannerAfterRecovery':recovery['roles']['failedScannerAfterRecovery'],'partialNpmPermissionStopPreserved':True,'measuredReserveRestoredBeforeFreshPostflight':True,'reserveGuaranteed':False,'exclusiveCleanupOrSwapCausalityClaim':False,'automaticRetryAuthorizedByThisReceipt':False},
 'concreteFindings':[],'findings':[],'executionAuthorization':False,
 'independence':{'reviewer':'/root/b109_focused_route_review','sourceAuthor':'/root/m0_types_source_review','actualExecutor':'/root','candidateNotAuthoredOrExecutedByReviewer':True,'method':'Finite named retained scratch artifact byte/hash authentication and lossless typed comparisons; no imports, runtime replay, private traversal, inventory or new process probes.'},
 'originalAttemptRemainsStop':True,'originalR1AndR2StopPreserved':True,'originalR3StopPreserved':True,'originalR6StopPreserved':True,
 'actualGenerationPhaseSucceeded':True,'generatedNaturalBoundaryWeeks':[196,197,208],
 'baselineAccepted':False,'fixtureQualificationAccepted':False,'meaningfulCatchMutantRedAccepted':False,'fullFunctionQualificationAccepted':False,
 'fullSharedPostflightAccepted':True,'soleLaneReleased':True,
 'observedAttempt':{'sessionId':21948,'toolExit':2,'helperExit':2,'recorderExit':2,'runnerExit':1,'actualNodeExit':1,'actualNodePid':34407,
  'actualHelper':{'pid':31838,'pgid':31838,'sid':31838},'actualRecorder':{'pid':32093,'pgid':32093,'sid':32093},'actualController':{'pid':32094,'pgid':32094},
  'recorderStatus':'STOP_CHILD_EXIT_1','controllerStatus':'STOP_NODE_EXIT','recorderSeconds':initial['recorderElapsedSeconds'],'controllerSeconds':initial['controllerElapsedSeconds'],
  'runtimeBoundsSeconds':{'aggregateChild':300,'activeRecorder':320,'wholeRecorder':330},'separatePreparationDeadlineSecondsPerStage':60,'combinedPreparationRuntimeDeadline':None,
  'actualGameplayPrefixExecuted':None,'naturalBoundaryWeeks':None,'requestedNaturalBoundaryWeeks':[196,197,208],'nodeResult':None,
  'sourceBeforeComplete':True,'dependencyBeforeComplete':True,'sourceBeforeExactCurrentTypes':True,'dependencyBeforeExactCurrentTypes':True,
  'beforeProofsExactAcrossFirstProofControllerBindingResultAndReadback':True,'comparisonLosslessAndTypeStrict':True,'nineSourceProofFieldsRetained':True,
  'sourceAfter':None,'dependencyAfter':None,'freshRecordedScopedAbsences':initial['recordedOwnershipChecks'],'laneReleased':True,'timedOut':False,
  'typesAcceptedByThisAttempt':False,'collectionAcceptedByThisAttempt':False,'neutralityAccepted':False},
 'generationScope':{'passedTests':1,'failedTests':0,'durationMilliseconds':initial['generateReport']['testResults'][0]['assertionResults'][0]['duration'],'fixtureBytes':12428510,
  'actualNaturalSourcePhase':'tick.before.advanceTalentMarketWeek','actualNaturalReturnedWeeksUsedAsBoundaries':False,
  'packetNaturalAndFixtureCopiesTypeExact':True,'fullStateOccurrences':10,'explicitSyntheticRoles':initial['explicitSyntheticRoles'],
  'packetIdentitySameForGenerateAndAttemptedBaseline':True,'packetBytesAlsoIdenticalToActualR3':True,'priorR3Fixture':roles['priorR3Fixture'],'artifactFitClaim':'This measured packet is below the original64MiB cap; no universal fit guarantee.',
  'qualification':'Authenticated passing generation, admitted generation source and retained packet establish actual natural prefix generation despite the final controller summary being null. Generated packet and explicit synthetic variants remain unqualified for full baseline/neutrality/game acceptance.'},
 'specificStopEvidence':{'phase':'baseline','firstArm':'off(author196)','passedTests':0,'failedTests':1,'totalTests':1,
  'assertion':'complete bounded helper/RNG trace, never dropped evidence','actual':'true !== false','location':'full-body-controls.ts arm line29, pair line44, controls line67',
  'nestedNodeError':'STOP_PHASE_EXIT_baseline','failureIsNotMeaningfulMutantRed':True,'catchMutantAttempted':False,
  'sourceBoundedRefusalPredicates':{'probeEntries':16384,'probeRowBytes':65536,'probeAggregateBytes':2097152},
  'userObserverSeparateLimits':{'rows':512,'rowBytes':16384,'aggregateBytes':2097152},
  'whichThresholdOrCountsCaptured':True,'firstOverflow':initial['firstOverflow'],'refusedProjectedAggregateBytes':2107757,'aggregateExcessBytes':10605,'remainingBytesBeforeRefusedRow':21636,'sameGeneratedFixtureBytesAsR3':True,'finitePacketRepeatNotBroadReplayAcceptance':True,'causeQualification':'Actual first-refusal scalar diagnostic establishes that only the original helper-probe aggregate byte cap failed: 1450 entries =1298 calls +152 evaluations; retained2075516 plus next32241 =2107757, exceeding2097152 by10605. Entry and row caps individually fit. The refused next row remains unretained; no complete helper/RNG parity, cap choice, waiver or broad replay acceptance is admitted.',
  'controllerNullSummaryPreserved':True,'noMissingAfterProofInvented':True},
 'streams':{'recorderStdout':roles['stdout'],'recorderStderr':roles['stderr'],'recorderStderrEmpty':True,'recorderStdoutSingleSummaryStatus':'STOP_NODE_EXIT',
  'nestedNodeStdout':roles['nodeStdout'],'nestedNodeStderr':roles['nodeStderr'],'generationStdout':roles['generateStdout'],'generationStderr':roles['generateStderr'],
  'baselineStdout':roles['baselineStdout'],'baselineStderr':roles['baselineStderr'],'combinedHelperLog':roles['laneLog'],'laneMetadata':roles['laneMetadata'],'allStreamsQuiet':False,
  'qualifiedRecorderWarning':{'source':roles['qualifiedSource:record-fullfunction.py'],'location':'main() outer finally, line249','scope':'Combined helper log only','preserved':True},'controllerFinallyWarningObserved':False},
 'sharedPostflight':{'sessionId':17336,'terminalToolExit':0,'status':'GUARDS_ACCEPTED_READONLY','actualTool':pr['actualTool'],'grant':pr['grant'],
  'guardSource':pr['guardSource'],'guardConfig':pr['guardConfig'],'guardSourceReview':pr['guardSourceReview'],'baseline':pr['baseline'],'snapshotPins':pr['snapshotPins'],
  'stdout':pr['stdout'],'stderr':pr['stderr'],'guardSeconds':rb['guardSeconds'],'inventorySeconds':rb['inventorySeconds'],
  'completeImmutableLosslessTypedEqual':True,'nineStrictRootsLosslessTypedEqual':True,'scratchIdentityOnlyEqual':True,'duringSnapshotStrictRootsEqual':True,'currentFactsBeforeAfterAccepted':True,
  'recordedOwnedPids':rb['actualOwnedPids'],'recordedOwnedGroups':rb['actualOwnedGroupIds'],'freshRecordedScopedAbsences':post['scopedRecordedAbsences'],'laneReleased':True,
  'rawLocalOnlyFourPsFdRoleHashesAuthenticated':True,'rawPsFdDisposition':'LOCAL_HASH_SIZE_ONLY; raw contents excluded.',
  'originalQualifiedFullSharedScannerUsed':True,'originalPerCommandTimeoutSeconds':180,'wholeScanDeadline':None,'independentAdditionalInventory':False,'missingM0AfterProofSuppliedBySharedScan':False},
 'claimLimit':'Accepts only authenticated partial natural generation, the baseline bounded helper-probe overflow STOP, complete BEFORE/current proof boundary, owned cleanup and completed original shared preservation postflight. Original attempt remains STOP; no complete baseline, meaningful catch-mutant RED, fullfixture/game/neutrality/performance/full1363/P17/P18 or source promotion acceptance. No new execution authority.',
 'lessons':['A terminal null prefix summary does not erase an independently authenticated completed generation phase; preserve both scopes.','Fatal trace overflow is incomplete evidence, never helper/RNG parity or a meaningful catch-mutant RED. Captured first-refusal predicates/counts identify aggregate byte refusal; finite same-packet identity does not establish full baseline/parity. No cap increase or sampling is authorized.','The helper probe16384/64KiB/2MiB limits are separate from the user observer512/16KiB/2MiB limits.','Complete BEFORE proof and completed shared protection scan do not manufacture absent M0 after proofs.','Preserve nested baseline failure and helper-only warning separately from empty recorder producer stderr.']}
def write(name,data):
 p=BASE/name;fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 try:os.write(fd,data);os.fsync(fd)
 finally:os.close(fd)
 assert p.read_bytes()==data
 return p
write('RECEIPT.json',(json.dumps(receipt,sort_keys=True,indent=2)+'\n').encode())
write('REPORT.txt',b'Authenticated actual R4 generation passed and retained the natural pre-market196/197/208 packet. The first baseline off(author196) arm failed the unchanged fatal helper-probe overflow assertion. Captured scalar predicates prove only the original helper-probe total byte cap refused the next row; no meaningful mutant RED or full qualification is admitted. Terminal null prefix and missing after proofs remain null. Original shared postflight completed and the complete immutable/nine-root comparison and recorded owned absences passed. Recorder producer stderr is empty; nested baseline STOP and qualified helper-only warning remain retained. Original attempt remains STOP; no retry or cap waiver is authorized by this receipt.\n')
names=['TERMINAL-EVIDENCE-INPUT.json','audit-terminal-evidence.py','INITIAL-TERMINAL-EVIDENCE-AUDIT.json','collect-post-roles.py','POST-EVIDENCE-INPUT.json','FAILED-POST-RECOVERY-EVIDENCE.json','audit-post-evidence.py','audit-post-facts.py','FINAL-POST-EVIDENCE-AUDIT.json','finalize-observed-review.py','RECEIPT.json','REPORT.txt']
write('SEAL.json',(json.dumps({'schema':'1370-independent-observed-review-seal/v1','files':{n:role(BASE/n) for n in names},'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode())
for n in names+['SEAL.json']:os.chmod(BASE/n,0o444)
os.chmod(BASE,0o555)
print(json.dumps({'receipt':role(BASE/'RECEIPT.json'),'seal':role(BASE/'SEAL.json')}))
