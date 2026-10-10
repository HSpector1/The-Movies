from pathlib import Path
import hashlib,json,os,re

S=Path('/Users/zacheryspector/studio-scratch')
AN=S/'1370-an-root-continuation-20261009-r1'
OUT=S/'1370-an-checkpoint-documentation-drafts-20261010-r9'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(p,sha=None):
 r=role(p)
 if sha:assert r['sha256']==sha
 return r,json.loads(p.read_bytes())
def save(n,b):
 p=OUT/n
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert p.read_bytes()==b
 return role(p)
def one(t,old,new):
 assert t.count(old)==1,old[:100]
 return t.replace(old,new)
assert sorted(p.name for p in OUT.iterdir())==['prepare-drafts.py']
report_in=S/'1370-an-checkpoint-documentation-drafts-20261010-r6'/'AN-REPORT-PROPOSED.md'
handoff_in=S/'1370-an-checkpoint-documentation-drafts-20261010-r7'/'HANDOFF-PROPOSED.md'
inputs={'previousReport':role(report_in),'previousHandoff':role(handoff_in)}
assert inputs['previousReport']['sha256']=='c7c0671f5107da37430c72ba4891d02fd1e0551e7ca9e5551a05631746a390df'
assert inputs['previousHandoff']['sha256']=='e1fc0d74890f22a7b851d7612fd18aa46b26619b793ba02a1dd81a526f2ede29'
inputs['partialObservedReview'],partial=load(S/'1370-an-m0-fullfunction-qualification-independent-partial-observed-review-20261010-r5'/'RECEIPT.json','92868e9640ec9b6c52a076964d2c9a541cb21a28a9b528bf0da97cb524ffda59')
assert partial['decision']=='OBSERVED_R5_OBSERVER_ROW_REFUSAL_STOP_PENDING_SHARED_FULL_POSTFLIGHT'
assert partial['observed']['actualGenerationPhaseSucceeded'] is True
assert partial['observed']['typedCatchMutantExecuted'] is False
assert partial['scope']['mandatoryFullProtectedPostflightAccepted'] is False
for k in ['readback','actualTool','generationReport','baselineReport','fullbodyTemplate','sourceReview']:
 inputs[k],d=load(Path(partial[k]['path'])) if k!='fullbodyTemplate' else (role(Path(partial[k]['path'])),None)
 assert inputs[k]==partial[k]
 if k=='readback':readback=d
 if k=='actualTool':assert d['sessionId']==56544 and d['finalExit']==2
 if k=='sourceReview':assert d['decision']=='ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY'
inputs['readerSourceReview'],reader=load(S/'1370-an-fullfunction-r5-root-readback-independent-source-review-20261010-r2'/'RECEIPT.json','2927e08c69b4a02232f68f7723e6a1f496dd6de24442e60ce14ea0a1e47345d2')
assert reader['decision']=='ACCEPT_STATIC_FULLFUNCTION_ROOT_READBACK_SOURCE_ONLY'
inputs['resolutionBinding'],binding=load(S/'1370-an-m0-fullfunction-qualification-source-20261010-r13'/'RESOLUTION-SOURCE-BINDING.json')
inputs['scalarReservationSource']=role(Path(binding['derivatives']['src/core/promises.ts']['path']))
assert inputs['scalarReservationSource']==binding['derivatives']['src/core/promises.ts']
assert inputs['scalarReservationSource']['sha256']=='0e14a0056d8d70ed2b93d217bc0829c6284142fd9ed93033ce8880e56691b6cb'
promise_lines=Path(inputs['scalarReservationSource']['path']).read_text().splitlines()
assert '.map((p) => directingScope' in promise_lines[440]
assert 'p.predicate.count' in promise_lines[442]
template=Path(partial['fullbodyTemplate']['path']).read_text().splitlines()
assert 'pair(fixtures.author196)' in template[67] and 'pair(fixtures.freeze208)' in template[72]
assert 'for(const fixture of [fixtures.opportunity196,fixtures.opportunity208])' in template[82]
assert 'const result=pair(fixture)' in template[84]
inputs['lessonsR17']=role(AN/'LESSONS-r17.md')
assert inputs['lessonsR17']['sha256']=='de514f44b783ba457e30b69279efd04e5d440d6bd94aa8df61707590fb6703cc'

report=report_in.read_text()
old='The held R12 plan binds the exact tested representation modules into the existing full-function route. Pure49 does not execute the full-body game assertions: their template is separately authenticated and source-reviewed. Fresh current prelaunch32283 and reader40232 pass; independentb0303533/root1f084410 qualify current protection using the original continuous-freeze provision. R12 source review34d22823 stopped a stale recipe map with eight mismatched roles and three missing aliases before execution. The corrected derivative and its independent review remain pending at this draft. No real encoded-fit, baseline or mutant result is inferred from pure49.'
new='Pure49 does not execute the full-body game assertions: their template is separately authenticated and source-reviewed. Fresh current prelaunch32283 and reader40232 pass; independentb0303533/root1f084410 qualify current protection using the original continuous-freeze provision. R12 source review34d22823 stopped eight stale recipe roles and three missing aliases before execution. Corrected R13 manifest5eb43712 and independent1120c87f admit the exact15-role recipe and consequent bindings with unchanged gameplay bodies and bounds. Qualified R5 reader2927e08c preserves the original PASS/STOP/nullability/ownership protocol. The parent decision-label3298/b29b and builder alias-location0552 corrections remain separate preserved pre-runtime interface failures.'
report=one(report,old,new)
section='''## Latest attempt: generation passed; observer row refused

Actual R5 fullfunction56544 completed exit2. Root readback32103543 and independent partial review92868e96 retain the concrete failure, without admitting a protected final result while mandatory shared post92358 is still running.

Real generation passed its one test in3.915457094 seconds and again retained the same12,428,510-byte natural196/197/208 packet, SHA2560ae4a9a261600c23b1bfd05eb860d65ef0f6769c9918670eb97bf7120b74ec62. This remains earned phase evidence.

The baseline's one test failed with `M0 feasibility row byte bound exceeded`: the separate gameplay observer's original16KiB row limit refused a row. The recorded stack is the capture-on arm at the explicit synthetic opportunity196/208 loop, fullbody line85. Sequential source order shows that the earlier natural author196, natural freeze208 and offweek paired checks returned before this location. That is bounded source-qualified progress; it does not admit the complete baseline, all helper traces, a separately measured natural encoded-fit result, or the meaningful typed-catch mutant. The precise failing synthetic iteration, row length and row payload have not yet been retained.

Recorder55.66051677400537 seconds was within the unchanged300/320/330 bounds, with no timeout. Tool/helper/recorder exited2 and controller/Node exited1. Complete BEFORE source/dependency proofs match the admitted type authority. AFTER source/dependency proofs, final Node result, terminal gameplay-prefix and terminal natural-week fields remain null; the mutant was not run. Scoped owned-ID absences and released lane are retained, but are not a substitute for the pending full shared postflight.

The earlier helper storage2MiB refusal and this observer row16KiB refusal are different limits. Encoded helper storage and successful pure49 controls did not waive or prove the observer limits fit every real or synthetic input. No limit is expanded here.

Public source analysis disproves the proposed explanation that a promise count of1001 alone creates1001 reservation elements. Exact authenticated derivative promises.ts lines440–443 maps actual reservations and places `p.predicate.count` in a scalar tuple field. This refutes that expansion premise; it neither identifies the oversized observer row nor authorizes changing1001. No source change follows from the refuted hypothesis. A bounded diagnostic design to retain the exact offending-row metrics is still pending.

At this draft cutoff, original shared post92358/scanner14120 is running. No live artifacts are read, no final shared snapshot or root equality is claimed, and no final protected R5 STOP adoption is invented. Root must finish and independently admit the genuine postflight, then reconcile the diagnostic design, final archive and publisher identity.

'''
report=one(report,'## Preserved failures and claims\n',section+'## Preserved failures and claims\n')
report=one(report,'After the lossless representation controls pass with exact source identity, independently qualify its full-function route on real196/197/208 fixtures, the unchanged baseline and meaningful typed-catch mutant. Then establish the original neutral416 route with417 boundaries, ten artifacts,40 contexts and43 external rows under its original caps.','First finish the already running original shared post92358 and independently admit PASS or its concrete failure. Preserve actual56544 as STOP. Qualify a bounded diagnostic that records the offending observer row length/predicate and failing fixture identity under the existing fatal limits before selecting any repair. Do not alter1001, expand caps, sample calls or automatically retry. Full-function baseline and meaningful typed-catch mutant remain required; only their genuine qualification permits the original neutral416 route with417 boundaries, ten artifacts,40 contexts and43 external rows under its original caps.')
report=one(report,'This is a scratch draft. Final inventory, publication identity, exact archive counts, latest controls outcome and next execution instruction must be reconciled before publication.','This R9 scratch draft records retained terminal56544 evidence and the partial review only. Final92358 postflight evidence/admission, bounded diagnostic design, exact archive counts and publication identity remain for root reconciliation. LESSONS-r17 de514f44 is a preserved earlier source-only cutoff; later observed failure evidence is not backfilled into that historical draft.')

handoff=handoff_in.read_text()
handoff=one(handoff,'root R6 scratch AN report at /Users/zacheryspector/studio-scratch/1370-an-checkpoint-documentation-drafts-20261010-r6/AN-REPORT-PROPOSED.md; exact AN/LESSONS-r16.md (43193B, SHA644d7d1ec2512131aeba0be2b634dbbb6b81761b511bda1c318fb1770b801324);','root R9 scratch AN report at /Users/zacheryspector/studio-scratch/1370-an-checkpoint-documentation-drafts-20261010-r9/AN-REPORT-PROPOSED.md; exact AN/LESSONS-r17.md (48015B, SHAde514f44b783ba457e30b69279efd04e5d440d6bd94aa8df61707590fb6703cc);')
handoff=one(handoff,'R6 report remains a draft and must be reconciled with later actual results.','R9 report remains a draft: finish actual92358 shared protection and reconcile its independent admission, diagnostic design and final publication. LESSONS-r17 retains its earlier source-only cutoff.')
start=handoff.index('- Fresh current prelaunch32283/reader40232,')
end=handoff.index('\n\nAM facts remain closed:',start)
handoff=handoff[:start]+'''- Fresh current prelaunch32283/reader40232, independentb0303533/root1f084410, admits original nine-root/current facts and full-map reuse under continuous freeze. R12 recipe STOP34d22823 remains; corrected R13 source1120c87f and R5 reader2927e08c are qualified with all15 exact aliases and unchanged bounds/protocol. Parent3298 wrong decision label was correctedb29b before execution; builder0552 assumed CONFIG held RECIPE.reviewAliases and was corrected before launcher output. These interface repairs do not erase their original held failures.
- Actual R5 fullfunction56544 completed2. Root READBACK32103543 and independent partial92868e96 authenticate generation's one passing real test3.915457094s and the same natural packet0ae4a9a2. Baseline then failed its one test with M0 feasibility row byte bound exceeded in capture-on pair at synthetic opportunity196/208 loop line85. Source order qualifies return of preceding natural author196/freeze208/offweek paired checks; exact failing iteration and row metrics remain unrecorded. No whole-baseline or meaningful catch-mutant result is accepted.
- Recorder55.66051677400537s, no timeout; original300/320/330 unchanged. BEFORE source/dependency proofs agree, AFTER proofs and terminal prefix/weeks/Node result remain null; typed-catch mutant unrun. Owned IDs10032/10530/10531/12621 and groups10032/10530/10531 are scoped absent, lane released. Shared post92358/scanner14120 remains running, so final protected admission is pending.
- Observer512-row/16KiB-row/2MiB limits remain distinct from helper16384-entry/64KiB-row/2MiB encoded-storage limits. This failure concerns observer row16KiB; helper compression and public49 did not establish universal observer fit. Public derivative promises.ts440–443 serializes one tuple per actual reservation with count as scalar; count1001 alone does not create1001 elements. That premise is source-disproved, not an observed cause. Keep1001 unchanged; exact oversized-row diagnosis and bounded diagnostic design remain pending.''' +handoff[end:]
start=handoff.index('In flight:')
end=handoff.index('\n\n## Open decisions for the Owner',start)
handoff=handoff[:start]+'''In flight: root's mandatory original shared post92358/scanner14120 after actual56544. Do not inspect live outputs or publish a passed protected map until the genuine final tool/readback/snapshot and independent admission exist. The bounded observer-row diagnostic design is pending. Root must reconcile completed postflight, final diagnostic role and archive/publisher identity before publication.

Claims limits: current M0 types/preservation, public49 and real generation remain earned. Source order supports preceding natural checks returned, but no complete R5 baseline, aggregate AFTER proof, typed-catch RED, neutral416 or fullqualification is accepted. Observer limit remains fatal; no cap waiver, game source mutation or1001 repair is authorized by this draft.

## Next step

1. Root waits for already running original shared post92358, retains its terminal envelope and qualified readback/snapshot, and obtains independent observed admission. Keep gameplay56544 STOP, null after-proofs/prefix and the exact successful generation as separate scopes. If postflight stops, preserve that failure and finish required protection before further actual work.
2. Complete a source-reviewed bounded diagnostic for the actual observer refusal: retain the failing fixture identity, row byte count and bounded contributing metrics with unchanged512/16KiB/2MiB fatal predicates. The count1001 expansion hypothesis is disproved; leave the scalar/input unchanged. No automatic gameplay retry or limit expansion.
3. Root may authorize one genuine recorded diagnostic/repair route only after required current authority and source reviews. Independently admit its baseline, meaningful typed-catch mutant, full BEFORE/AFTER proofs and shared protection if earned. Then proceed to original neutral416/417 boundaries/ten artifacts/40 contexts/43 external rows under unchanged caps.
4. Continue occurrence-aware A-to-M0 shared39/eight changed pay/31same plus5left-only/5right-only, four protected C0 digests, adoption48-to42 and p13a40-to18 through pinned intermediate arms. Keep H8708 and historical promise attribution separate. Follow1363 closure/recovery/regression/promotion and1367-O2 before main merge or downstream1364/1365/P15B/P15C/P16/P17/P18.''' +handoff[end:]
handoff=one(handoff,'Fullfunction qualification and1363 residual attribution remain unresolved. Successful synthetic49 controls and separate shared protection cannot replace real baseline/catch-mutant/neutrality or missing M0 AFTER proofs.','Fullfunction qualification and1363 residual attribution remain unresolved. Latest56544 has earned generation and observer-row STOP only; partial92868e96 is not final protected admission. Original92358 postflight is in flight. Successful synthetic49 controls and earlier shared protection cannot replace complete baseline/catch-mutant/neutrality or missing M0 AFTER proofs.')
auto_pattern=rb'<!-- AUTO:BEGIN[\s\S]*?<!-- AUTO:END -->'
old_auto=re.search(auto_pattern,handoff_in.read_bytes()).group()
assert re.search(auto_pattern,handoff.encode()).group()==old_auto
report_role=save('AN-REPORT-PROPOSED.md',report.encode())
handoff_role=save('HANDOFF-PROPOSED.md',handoff.encode())
audit={'schema':'1370-scratch-checkpoint-drafts-audit/v1','inputs':inputs,'drafts':{'report':report_role,'handoff':handoff_role},'autoBlockExact':True,'autoBlockSha256':hashlib.sha256(old_auto).hexdigest(),'inputCutoff':'Retained56544 partial observed review; original92358/scanner14120 still running according to root. No live output reads.','pending':{'fullPostflightObservedReview':None,'fullPostflightReadback':None,'finalDiagnosticDesign':None,'finalArchive':None,'publisherIdentity':None},'sourceAnalysisOnly':{'count1001DoesNotExpandReservationArray':True,'exactOffendingObserverRowUnknown':True,'exactFailingSyntheticIterationUnknown':True},'repoAndRootANModified':False,'candidateExecutionOrPrivateTraversalByDraftAuthor':False,'executionAuthorization':False}
audit_role=save('DRAFT-AUDIT.json',(json.dumps(audit,indent=2,sort_keys=True)+'\n').encode())
seal={'schema':'1370-scratch-checkpoint-drafts-seal/v1','files':{'AN-REPORT-PROPOSED.md':report_role,'HANDOFF-PROPOSED.md':handoff_role,'DRAFT-AUDIT.json':audit_role,'prepare-drafts.py':role(OUT/'prepare-drafts.py')},'executionAuthorization':False}
for r in seal['files'].values():assert role(Path(r['path']))==r
seal_role=save('SEAL.json',(json.dumps(seal,indent=2,sort_keys=True)+'\n').encode())
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'report':report_role,'handoff':handoff_role,'audit':audit_role,'seal':seal_role,'autoBlockExact':True},indent=2))
