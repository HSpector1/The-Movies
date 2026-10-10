from pathlib import Path
import hashlib
import json
import re
import stat

S = Path('/Users/zacheryspector/studio-scratch')
A = S / '1370-am-root-continuation-20261009-r1'
OLD_I = S / '1370-am-checkpoint-archive-input-readiness-independent-review-after-al-20261009-r2'
OLD_D = S / '1370-am-checkpoint-documentation-drafts-independent-after-al-20261009-r2'
I = S / '1370-am-checkpoint-archive-input-readiness-independent-review-after-al-20261009-r3'
D = S / '1370-am-checkpoint-documentation-drafts-independent-after-al-20261009-r3'

def role(p):
    b = p.read_bytes()
    return dict(path=str(p), bytes=len(b), sha256=hashlib.sha256(b).hexdigest())

def read(p):
    return json.loads(p.read_text())

def write(p, j):
    p.write_text(json.dumps(j, indent=2, sort_keys=True) + '\n')

for directory in (I, D):
    directory.mkdir(mode=0o700, exist_ok=True)

old = read(OLD_I / 'PROPOSED-INPUT-PACKAGES.json')
names = '''1370-c0-m0-current-source-dependency-proof-independent-observed-review-after-al-20261009-r2
1370-c0-m0-failed-types-postflight-adapter-independent-source-review-after-al-20261009-r1
1370-c0-m0-full-body-fixture-resolver-independent-source-review-after-al-20261009-r2
1370-c0-m0-full-body-fixture-resolver-independent-source-review-after-al-20261009-r3
1370-c0-m0-full-body-fixture-resolver-source-after-al-20261009-r1
1370-c0-m0-full-body-fixture-resolver-source-after-al-20261009-r2
1370-c0-m0-full-body-fixture-resolver-source-after-al-20261009-r3
1370-c0-m0-proof-fullguard-postflight-parent-after-al-20261009-r2
1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r3
1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r4
1370-c0-m0-proof-types-parent-launch-preparation-independent-source-review-after-al-20261009-r4
1370-c0-m0-root-option-parent-map-author-stop-after-al-20261009-r1
1370-c0-m0-types-collection-executor-results-after-al-20261009-r2
1370-c0-m0-types-collection-executor-results-after-al-20261009-r3
1370-c0-m0-types-collection-executor-source-after-al-20261009-r6
1370-c0-m0-types-collection-recorder-results-after-al-20261009-r2
1370-c0-m0-types-collection-recorder-results-after-al-20261009-r3
1370-c0-m0-types-collection-source-independent-review-after-al-20261009-r6
1370-c0-m0-types-extension-import-repair-proposal-source-after-al-20261009-r1
1370-c0-m0-types-fullguard-postflight-parent-after-al-20261009-r2
1370-c0-m0-types-independent-observed-stop-review-after-al-20261009-r5
1370-c0-m0-types-parent-recorded-after-al-20261009-r5
1370-c0-m0-types-parent-recorded-after-al-20261009-r6
1370-c0-m0-types-prelaunch-output-after-al-20261009-r2
1370-c0-m0-types-prelaunch-output-after-al-20261009-r3
1370-c0-m0-types-prelaunch-parent-after-al-20261009-r2
1370-c0-m0-types-prelaunch-parent-after-al-20261009-r3
1370-c0-m0-types-r6-independent-stop-diagnosis-after-al-20261009-r1
1370-c0-m0-types-r6-config-write-independent-source-proposal-after-al-20261009-r1
1370-c0-m0-types-r6-config-write-independent-source-proposal-after-al-20261009-r2
1370-c0-m0-r6-metadata-stop-postflight-adapter-independent-source-review-after-al-20261009-r1
1370-c0-m0-metadata-stop-original-postflight-adapter-source-after-al-20261009-r1'''.splitlines()
added = [str(S / n) for n in names] + [str(OLD_I), str(OLD_D), str(Path(__file__).parent)]
r5 = read(S / '1370-c0-m0-types-parent-recorded-after-al-20261009-r5' / 'READBACK.json')
r6 = read(S / '1370-c0-m0-types-parent-recorded-after-al-20261009-r6' / 'READBACK.json')
for j in (r5, r6):
    added += [j['laneLog']['path'], j['laneMetadata']['path']]
assert r6['toolExit'] == 1 and len(r6['children']) == 4
assert all(c['exit'] == 0 for c in r6['children'])
assert r6['sourceAfterAvailable'] is False and r6['dependencyAfterAvailable'] is False
assert r6['fourthChildRootMetadataChanged'] and r6['fourthChildRootRosterEqual']
paths = sorted(set(old['paths'] + added))
assert len(paths) == len(old['paths']) + len(added)
for p in paths:
    assert Path(p).exists(), p
for ix, p in enumerate(paths):
    assert not any(q.startswith(p + '/') for q in paths[ix+1:]), p

classifiers = [S / n / 'RAW-LOCAL-ONLY-ROLES.json' for n in [
    '1370-c0-m0-proof-fullguard-postflight-parent-after-al-20261009-r2',
    '1370-c0-m0-types-fullguard-postflight-parent-after-al-20261009-r2',
    '1370-c0-m0-types-prelaunch-output-after-al-20261009-r2',
    '1370-c0-m0-types-prelaunch-output-after-al-20261009-r3']]
rows = []
for p in classifiers:
    j = read(p)
    assert len(j['roles']) == 4
    for row in j['roles']:
        assert row['archiveDisposition'] == 'LOCAL_HASH_SIZE_ONLY'
        st = Path(row['path']).lstat()
        assert stat.S_ISREG(st.st_mode) and st.st_size == row['bytes']
        assert any(row['path'].startswith(parent + '/') for parent in paths)
        rows.append(row)
raw = sorted(set(old['localRawPaths'] + [r['path'] for r in rows]))
assert len(raw) == 37
raw_bytes = sum(Path(p).lstat().st_size for p in raw)
pending_parent = str(S / '1370-c0-m0-types-fullguard-postflight-parent-after-al-20261009-r3')
pending = dict(actualFullPostflightToolSessionId=98815, scannerPidPgid=39702,
    parentPath=pending_parent, expectedAdditionalSemanticRawRoles=4,
    expectedTotalOnlyAfterActualClassification=41, actualFullPostflightAccepted=False,
    finalM0SourceAndDependencyProofsAbsent=True,
    noSharedGuardPassCanRepairAbsentM0AfterProofs=True)
plan = dict(schema='1370-am-proposed-finite-package-list/v3',
    status='PROPOSED_EXPLICIT_PACKAGES_PENDING_R6_METADATA_STOP_FULL_POSTFLIGHT',
    inventoryExecutionReady=False, proposedForParentFinalization=True,
    futureActualM0RolesNotInvented=True, paths=paths, localRawPaths=raw,
    reason='The existing fullguard ancestor includes the running R6 postflight evidence subtree. No inventory may run before root closes it and appends four actual raw classifications, completed parent/review/adoption and final draft/manifest roles.',
    pendingActualRoles=pending)
write(I / 'PROPOSED-INPUT-PACKAGES.json', plan)
sources = {
    'currentProofAdoption': A / 'M0-CURRENT-PROOF-OBSERVED-ADOPTION.json',
    'r5StopAdoption': A / 'M0-TYPES-STOP-OBSERVED-ADOPTION.json',
    'r6SourceAdoption': A / 'M0-R6-PARENT-R4-SOURCE-ADOPTION.json',
    'r6PreflightAdoption': A / 'M0-TYPES-PREFLIGHT-OBSERVED-ADOPTION-R6.json',
    'r6RootBindingProof': A / 'M0-R6-ROOT-ROUTE-BINDING-PROOF.json',
    'fullBodyR3HeldSourceAdoption': A / 'M0-FULLBODY-R3-HELD-SOURCE-ADOPTION.json',
    'r6ActualReadback': S / '1370-c0-m0-types-parent-recorded-after-al-20261009-r6' / 'READBACK.json',
    'r6ActualTool': S / '1370-c0-m0-types-parent-recorded-after-al-20261009-r6' / 'ACTUAL-TOOL.json',
    'r6PendingStopDiagnosis': S / '1370-c0-m0-types-r6-independent-stop-diagnosis-after-al-20261009-r1' / 'RECEIPT.json',
    'r6PossibleConfigWriteMechanismR1': S / '1370-c0-m0-types-r6-config-write-independent-source-proposal-after-al-20261009-r1' / 'PROPOSAL.json',
    'r6PossibleConfigWriteMechanismR2': S / '1370-c0-m0-types-r6-config-write-independent-source-proposal-after-al-20261009-r2' / 'PROPOSAL.json',
    'r6MetadataStopAdapterSourceReview': S / '1370-c0-m0-r6-metadata-stop-postflight-adapter-independent-source-review-after-al-20261009-r1' / 'RECEIPT.json',
    'latestLessons': A / 'LESSONS-r21.md'}
source_roles = {k: role(p) for k,p in sources.items()}
write(I / 'RECEIPT.json', dict(schema='1370-am-archive-input-readiness-source-preparation/v3',
    decision='PREPARED_EXPLICIT_AM_INPUTS_PENDING_R6_FULL_POSTFLIGHT_NOT_FINAL_ARCHIVE_ADMISSION',
    executionAuthorization=False, inventoryExecutionReady=False, previousPlan=role(OLD_I / 'PROPOSED-INPUT-PACKAGES.json'),
    proposedPlan=role(I / 'PROPOSED-INPUT-PACKAGES.json'), exactPathCount=len(paths), addedPaths=added,
    exactLocalRawPathCount=len(raw), localRawBytes=raw_bytes,
    newLocalRawClassifications=[role(p) for p in classifiers], newLocalRawRows=rows,
    rawPayloadRead=False, rawHashesTakenFromExplicitProducerClassifications=True,
    activePostflightOutputRead=False, activePostflightParentExcluded=pending_parent,
    guardAncestorAlreadyCoversPostflightEvidence=True, noDuplicateAncestorDescendants=True,
    rootContinuationAlreadyCoversAllNewRootAdoptionsAndLessons=True,
    alFinalizerLateThreeRolesPreserved=True, finalInventoryNotRun=True,
    protectedCopiesOrGitReadOrChanged=False, sourceRoles=source_roles,
    pendingRootUpdates=[pending, 'Append this fresh readiness/docs package and final builder/input/manifest/review/publication roles without self-hash cycles.'],
    majorFailuresPreserved=True, actualTypesAccepted=False))

old_report = (OLD_D / '1370-AM-natural208-and-renewal-pricing-closure.md').read_text()
prefix = old_report.split('## M0 source repairs and pending work')[0]
m0 = '''## Current M0 proof admitted; type route remains stopped

The count STOP07aeb and missing-local-main prelaunch STOPfc9094 remain preserved. Source reviews2d6ab/65dfe/d857 and root62132 repair the exact dependency projection and distinguish existing local remote-tracking from advertised remote refs. No branch, protected Git metadata or admitted mirror is changed. The parent-clock finding777161 is resolved by original-source interpretation958eca/root69c5: separate60-second preparation, then unchanged loader/runtime300/320/330. The original8MiB limit covers child-command streams; the merged helper log has no separate live8MiB limiter or combined fill-plus-runtime330 promise.

Proof20818 exits0 through helper/recorder/runner: preparation1.176433264001389s, recorder75.045s, runner72.745s. Both complete current proofs agree:1740 mirror files119393120 bytes,1853 source entries excluding root, and12484 dependency entries excluding root348223802 content bytes. The shared full guard includes the dependency root and reports12485 entries; this scope difference is not missing evidence. Original fullpostflight39284 completes0; full immutable map e28f equals c818/692, strict roots pass and all four recorded identities are absent. Independent093/root8ef now admit the current M0 source/dependency proof with that fullpostflight. This is preservation acceptance, not type, wiring, gameplay or scientific acceptance.

R5 types79362 then fails: dependency versions0, root compiler2 with eleven TS5097 diagnostics in five canonical bridge files. UI and collection are unrun. Runner106.938s/recorder109.379s are within unchanged bounds. Source/dependency maps and both executed-child boundaries stay equal; the three recorded owned identities are absent. Required original failurepostflight51441 also completes0, immutable8b971 equals the admitted map, and independent749/rootf3f4 admit this observed STOP with protected postflight. Result85106763/stdout4955f55b remain failed; this is not a timeout or a four-command pass.

Finite source attribution authenticates all63 canonical bridge roles and historical root/UI configs. Root lacks allowImportingTsExtensions while UI already enables it. R6 adds only that option to the existing root noEmit command, keeping checked files, strict rules, UI, source/dependencies, clocks and caps unchanged. Source05ca/review0b240 and corrected parentR4f27d/review63f348/root372 are source-only accepted. Author MAP STOP4b7 wrote a fresh label at phase argument8; corrected R4 keeps phase postflight and changes label argument9. Root inverse-builder STOP000b targeted an overly broad replacement; corrected exact-statement proofeca05 covers seven derivatives. Neither incorrect preparation was run.

Actual R6 tool97276 has four child exits0: dependency versions, root compiler50.663s, UI compiler45.133s and diagnostic collection7.832s; both compilers emit no diagnostics. The enclosing runner144.379s/recorder146.971s/helper/tool nevertheless exit1 with STOP_POSTFLIGHT_UNVERIFIED85e1f676. The fourth child preserves the immediate roster and root device/inode/mode/linkcount/size but changes strict root mtime/ctime. The complete source postflight stops at directory metadata '.', so no sourceAfter or dependencyAfter proof exists. Collection5e6d remains unadmitted. Readback1456317c reports the three scoped identities27153/27410/27430 PID/PGID absent and lane released. Pending diagnosisf41ab identifies the failed predicate; possible nested configuration temporary-file mechanismb437/3341 is source-backed but not proven actual cause. Equal final entries cannot prove no temporary sibling existed. No timestamp restoration, guard relaxation or guessed causal claim is allowed.

The required R6 failure fullpostflight98815/scanner39702 is running under the original guard with source-reviewed metadata-STOP adapter15304. Its actual outputs, four new raw classifications and independent admission remain pending. A shared guard success could establish its own protected scope but cannot replace the missing final M0 source/dependency proofs or turn R6 into accepted types. No active output was read for this draft.

Full-body fixture/resolver R3 source2703/independentb2a2/root2d528 is held source-only. It repairs the emitted issuerStudioId identity and verifies every one of twelve freeze-predicate positions; undefined-equals-undefined and omitted events must not pass an ordering oracle. The proposed two GREEN/sixteen RED consumer cases remain unrun and are not real fixture or catch-mutant execution. No runtime-ready fixtures, controls, wiring or neutral416 are admitted. Real196/208/off-target controls, helper/RNG parity, typed failures and then neutral416 remain future work.

## Preserved order, major lessons and archive scope

1363 closure and1367-O2 still gate the conditionally authorized history-preserving main merge. Then1364→1365→P15B/P15C→P16→canonical P17→bounded P18. P17/P18 are unimplemented; P19/native/Unity is outside scope. P15B principal/installments/closure/claims, A-to-M039 shared/eight changed pay/31 unchanged plus five unmatched rows per side, protected digests, H8708 and H13 metadata STOP15e901 remain open. Guarded14-file R8 recovery and adopted1363-V roles precede105 matched processes and separate long routes/same-candidate G-P/G-L/K3. Historical copy/additive/readback successes do not admit M0 types, wiring or scientific neutrality.

Preserve every original STOP and lesson revision. Current lessons-r21 includes earlier lessons in their original chronology; later paragraphs supersede historical pending statements without editing them. The major lessons are concrete: test actual integration scope as well as isolated helpers; distinguish canonical source from operational authority; place genuine external grants after adopted preflight; audit every future field in the authority DAG; compile source-only test producers for warnings before sealing; preserve unfavourable performance pairs; explain five age-only versus eleven other complete vectors honestly; distinguish full inventories from projections and local from advertised refs; state implemented clock/cap scopes; run protection postflights on failures; authenticate every observer field/order predicate; target exact argument positions and inverse statements; and require complete preservation proofs even when all children exit0. AL real Python17 controls44123 and exact JS reuse remain closed; original10832/66101/micro25659 and all prior encoder/authority failures remain preserved. No unchanged control is rerun for this checkpoint.

Original archive readiness79/17 and R2 readiness100/21 stay immutable. Fresh R3 adds closed proof/failure/repaired-source/parent/result/recorder/lane/diagnosis/proposal packages and prior R2 drafts/readiness. Explicit semantic local-only classification currently covers37 raw PS/FD roles; four R6 postflight captures will bring the count to41 only after genuine completion and classification. The existing guard ancestor already covers its evidence subtree: no duplicate descendant inventory path is added. Root AM covers all new adoptions and lessons, and AL finalizer late three roles stay included. Active R6 postflight parent/output is not enumerated or admitted. Raw whole-machine PS/FD and padding remain local hash/size-only regardless extension; no raw contents are read or exported. Inventory execution and final archive acceptance remain pending, as do root publication and genuine new current authority afterward.

'''
report = prefix + m0
report += 'The [complete major-lessons record](' + str(sources['latestLessons']) + ') retains all earlier revisions and the exact failure-to-repair chronology.\n\n'
report += '## Exact current checkpoint roles\n\n| Role | Retained source | SHA-256 |\n| --- | --- | --- |\n'
principal = {
    'A208 observed acceptance': S / '1370-c0-a208-game-independent-observed-review-after-al-20261009-r4' / 'RECEIPT.json',
    'A208 root adoption': A / 'A208-GAME-OBSERVED-ADOPTION.json',
    'Pure16 observed acceptance': S / '1370-c0-renewal208-pure16-pricing-independent-observed-review-after-al-20261009-r1' / 'RECEIPT.json',
    'Pure16 root adoption': A / 'PURE16-PRICING-OBSERVED-ADOPTION.json',
    'B109 benchmark root adoption': A / 'B109-ASCII-BENCHMARK-OBSERVED-ADOPTION.json',
    **sources,
    'Current archive readiness': I / 'RECEIPT.json'}
principal_roles = {k: role(p) for k,p in principal.items()}
for k,r in principal_roles.items():
    report += f"| {k} | [retained evidence]({r['path']}) | `{r['sha256']}` |\n"
report += '\nScratch draft only. Root must fill the pending R6 postflight, archive and publication facts from genuine observations; no repository edit or final archive admission is represented.\n'
report_path = D / '1370-AM-natural208-and-renewal-pricing-closure.md'
report_path.write_text(report)

h = (OLD_D / 'HANDOFF-PROPOSED.md').read_text()
auto = re.search(r'<!-- AUTO:BEGIN.*?<!-- AUTO:END -->', h, re.S).group()
active = h.split('## Active order\n',1)[1].split('\n## State',1)[0]
start = h.index('- Actual M0 runtime-tool')
end = h.index('\n- Preserve AL repair:', start)
new_state = '''- Current M0 source/dependency proof20818 plus fullpostflight39284 is independently admitted093/root8ef:1740 files119393120B,1853 nonroot source entries,12484 nonroot dependency entries348223802B, both complete maps equal. Shared guard12485 includes the dependency root. Preparation1.176433264s remains separate60; recorder75.045/runner72.745 obey300/320/330. Current proof does not admit types, wiring or game.
- R5 types79362 is preserved/admitted STOP749/rootf3f4 with required original fullpostflight51441:dependency0, root2/eleven TS5097 errors in five bridge files, UI/collectionunrun, maps unchanged and owned IDs absent. Minimal R6 adds one root noEmit option, preserves source/deps/UI/scope/bounds; source05ca/review0b240, corrected parentR4f27d/review63f348/root372 and preflight33280/roota154 are source-only/operationally qualified in their exact scopes. Preserve wrong positional parentMAP STOP4b7 and exact inverse-builder STOP000b; corrected bindingproofeca05 is genuine.
- Actual R6 tool97276 has all four child0, root50.663s/UI45.133s with no diagnostics, but helper/recorder/runner/tool1 and STOP_POSTFLIGHT_UNVERIFIED85e1f676. Fourth child leaves identical immediate roster/stable root identity fields but changes strict mtime/ctime; final complete source proof stops at '.', and sourceAfter/dependencyAfter are absent. Readback1456317c records three IDs27153/27410/27430 PID/PGID ESRCH/lane released. Pending diagnosisf41ab attributes the predicate; source proposalsb437/3341 suggest a configuration sibling temporary-file mechanism without proving actual cause. Collection5e6d is unadmitted. Required original failurefullpostflight98815/scanner39702 is running under reviewed adapter15304; do not read incomplete output or claim acceptance. Shared protection cannot repair missing M0-after proofs.
- Full-body fixture/resolver R3source2703/indb2a2/root2d528 is held source-only:issuerStudioId and all twelve freeze-predicate positions repaired, two GREEN/sixteen RED cases unrun. No runtime-ready fixtures, actual controls/type acceptance/wiring/neutral416. Real196/208/off-target/helper-RNG/typed failures precede neutral416;417/10 artifacts/40 contexts/43 external rows/caps remain.'''
h = h[:start] + new_state + h[end:]
h = h.replace('all initial/final receipts and lessons-r18 (`1065ea75df63ad8ebb47db5d6bd97db37d81aa7358d823d8d9fdf9d029411e10`) with earlier revisions.', 'all initial/final receipts and lessons-r21 (`efe3afd635d51a1c0d3d21487773fa15a3c4f36c0b17212318ffa9fb549aaf06`) with all earlier revisions. Source-only helper tests must cover actual integration scoping, observer field names and every freeze predicate; exact argument positions/inverse statements matter. Four child0 cannot replace complete preservation proofs.')
h = h.replace('\n## Next step\n', '\nLinked major lessons: [complete lessons-r21](' + str(sources['latestLessons']) + ') preserves the original chronology, current STOP scopes and all earlier revisions.\n\n## Next step\n')
start = h.index('- Original archive readiness74ff')
end = h.index('\n\n## Next step', start)
h = h[:start] + f'- Original readiness79/17 and R2 readiness100/21 remain immutable. Fresh R3 proposes{len(paths)} exact paths and37 explicit semantic local-only raw roles totaling{raw_bytes} bytes, including closed proof/R5failure/R6STOP/repaired sources/parents/results/recorders/lanes and prior R2 drafts/readiness. Existing guard ancestor covers the active R6 postflight subtree without duplicate paths; its parent and four raws remain pending (41 only when actual). Root AM covers every adoption/lesson; AL late three roles retained. No final archive or inventory execution. Root later appends genuine completed postflight/admission and final drafts/builder/input/manifest/publication. Lessons-r21 is current and all originals remain.' + h[end:]
start = h.index('1. Root completes the currently running original proof postflight')
end = h.index('\n2. Finish finite AM archive', start)
h = h[:start] + '1. Root completes required R6 failurefullpostflight98815/scanner39702 and independently admits only its genuine protected scope, preserving the R6 metadata STOP and missing M0-after proofs. Determine any next operational repair from authenticated source/evidence under separate review/grant; do not restore timestamps, waive strict metadata, infer a temporary-file cause, or call all-child0 accepted types. Update these drafts only from actual records.' + h[end:]
h = h.replace('4. Independently review held full-body wiringR2, prepare real bounded fixtures,', '4. Use held source-reviewed full-body fixture/resolver R3 as source only, prepare real bounded fixtures,')
h = h.replace('M0 proof fullpostflight/independent admission and actual types, real wiring/neutral416 and H8708 remain pending in this draft; completed preflight/proof tool0 are recorded without pre-admission.', 'Current M0 source/dependency proof and its fullpostflight are admitted. R5 compiler STOP remains, and R6 has four child0 but strict root metadata STOP, absent final M0-after proofs and pending failurefullpostflight. Accepted types/collection, real wiring/neutral416 and H8708 remain open.')
assert re.search(r'<!-- AUTO:BEGIN.*?<!-- AUTO:END -->', h, re.S).group() == auto
assert h.split('## Active order\n',1)[1].split('\n## State',1)[0] == active
handoff_path = D / 'HANDOFF-PROPOSED.md'
handoff_path.write_text(h)
write(D / 'DRAFT-RECEIPT.json', dict(schema='1370-am-documentation-drafts/v3',
    decision='PREPARED_SCRATCH_ONLY_AM_DRAFTS_PENDING_R6_POSTFLIGHT_AND_ROOT_PUBLICATION',
    executionAuthorization=False, rootSoleProductionWriter=True,
    previousDraftReceipt=role(OLD_D / 'DRAFT-RECEIPT.json'), report=role(report_path),
    proposedHandoff=role(handoff_path), readinessR3=role(I / 'RECEIPT.json'),
    sourceRoles=principal_roles, autoBlockByteExact=True, originalActiveOrderPreserved=True,
    rawContentRead=False, incompleteGuardOutputRead=False, repositoryOrGitChanges=False,
    actualCurrentProofAccepted=True, actualR5FailureProtectedPostflightAccepted=True,
    actualR6FourChildZero=True, actualR6RouteExit=1, actualTypesAccepted=False,
    absentM0AfterProofsNotRepairedBySharedGuard=True, possibleConfigWriteCauseProven=False,
    fullBodySourceOnly=True, actualFullBodyFixturesAndControlsAccepted=False,
    allOriginalFailuresAndLessonsPreserved=True, currentLessons=source_roles['latestLessons'],
    isolatedPerFieldOrUpstreamPricingCauseAccepted=False,
    pendingRootUpdates=[pending, 'Final archive input/inventory/source review and actual AM commit/blob/ref readback.']))

for directory in (I, D):
    for p in directory.iterdir():
        p.chmod(0o444)
    directory.chmod(0o555)
print(json.dumps(dict(paths=len(paths), localRawRoles=len(raw), localRawBytes=raw_bytes,
    inputPlan=role(I / 'PROPOSED-INPUT-PACKAGES.json'), readiness=role(I / 'RECEIPT.json'),
    report=role(report_path), handoff=role(handoff_path), draftReceipt=role(D / 'DRAFT-RECEIPT.json')),indent=2))
