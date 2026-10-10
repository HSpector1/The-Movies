from pathlib import Path
import hashlib
import json
import os

S = Path('/Users/zacheryspector/studio-scratch')
AN = S / '1370-an-root-continuation-20261009-r1'
OUT = S / '1370-an-checkpoint-documentation-drafts-20261010-r8'

def role(p):
    b = p.read_bytes()
    return {'path': str(p), 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}

def retained(p, expected=None):
    r = role(p)
    if expected:
        assert r['sha256'] == expected
    return r, json.loads(p.read_bytes())

def save(name, b):
    p = OUT / name
    with p.open('xb') as f:
        f.write(b)
        f.flush()
        os.fsync(f.fileno())
    assert p.read_bytes() == b
    return role(p)

old = AN / 'LESSONS-r16.md'
old_bytes = old.read_bytes()
assert len(old_bytes) == 43193
assert hashlib.sha256(old_bytes).hexdigest() == '644d7d1ec2512131aeba0be2b634dbbb6b81761b511bda1c318fb1770b801324'
assert sorted(p.name for p in OUT.iterdir()) == ['prepare-lessons.py']
inputs = {'previousLessons': role(old)}

inputs['pure49RootAdoption'], pure = retained(AN / 'LOSSLESS-CONTROLS-OBSERVED-ADOPTION.json', 'fa668549c4526317f1c5f7f17494ae3bdaec2f6713e6b72351f30d384cfa096a')
assert pure['status'] == 'ROOT_ADOPTED_ACTUAL_LOSSLESS_TRACE_49_CONTROLS_ONLY'
assert (pure['caseCount'], pure['positiveCount'], pure['specificNegativeCount']) == (49, 9, 40)
assert pure['actualExit'] == 0 and pure['soleLaneReleased'] is True
assert pure['fullQualificationAccepted'] is False and pure['fullBodyGameAssertionsExecuted'] is False
inputs['pure49IndependentObservedReview'], pure_review = retained(Path(pure['independentObservedReview']['path']))
assert inputs['pure49IndependentObservedReview'] == pure['independentObservedReview']

inputs['currentProtection'], protection = retained(AN / 'M0-FULLFUNCTION-R5-CURRENT-PROTECTION.json', '1f0844105f6c76c94603099fccf0cff5d7769775e8e5a0cc840fabcf79cc0bcb')
inputs['prelaunchIndependentReview'], pre = retained(Path(protection['independentPreflightReview']['path']), 'b03035336055bc806e76a7749eabc79da399185170908d7463862d0b25e73f8e')
assert inputs['prelaunchIndependentReview'] == protection['independentPreflightReview']
assert pre['decision'] == 'ACCEPT_ACTUAL_CURRENT_AM_FULLFUNCTION_PRELAUNCH_ONLY'
assert pre['checks']['actualPrelaunchSession'] == 32283 and pre['checks']['actualReaderSession'] == 40232
assert pre['checks']['actualExits'] == [0, 0] and pre['checks']['strictRootsEqual'] == 9
assert pre['checks']['newFullInventory'] is False and pre['checks']['originalContinuousFreezeReuse'] is True
for k in ['actualTool', 'readerActualTool', 'readback']:
    inputs['prelaunch_' + k], obj = retained(Path(pre[k]['path']))
    assert inputs['prelaunch_' + k] == pre[k]
    if k != 'readback':
        assert obj['finalExit'] == 0

inputs['r13IndependentSourceReview'], repaired = retained(S / '1370-an-m0-fullfunction-qualification-independent-source-review-20261010-r13' / 'RECEIPT.json', '1120c87f9509b5e3a7b19dbd35974b6c2e7f1a88391304a4bf0fbf1e6a226e02')
assert repaired['decision'] == 'ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY'
assert repaired['executionAuthorization'] is False and repaired['concreteFindings'] == []
assert repaired['checks']['reviewAliases'] == 15 and repaired['scope']['candidateExecuted'] is False
inputs['r12PreservedSourceStop'], stop = retained(Path(repaired['predecessorIndependentReview']['path']), '34d228234553139b55c60cebf4cfa07a73652681e439f2244397443d5c270845')
finding = stop['concreteFindings'][0]
assert stop['decision'] == 'STOP_STATIC_R12_RECIPE_ROLE_MAP_STALE'
assert len(finding['mismatchedRoles']) == 8 and len(finding['missingAliases']) == 3

inputs['rootBuilderCorrection'], builder = retained(AN / 'R5-ROOT-BUILDER-ALIAS-LOCATION-CORRECTION.json')
assert builder['actualFailure'].startswith('0552e0 exit1 before launcher output:')
assert builder['runtimeAttempted'] is False and builder['sourceOrCandidateChanged'] is False
inputs['parentLabelCorrection'], correction = retained(AN / 'R5-PARENT-REVIEW-LABEL-CORRECTION.json')
assert correction['runtimeAttempted'] is False
inputs['priorParentReview'], prior = retained(Path(correction['priorReview']['path']), '3298d4569626e6b2a837f8dc772e78a9201916b1faad34853f7cdd94ef8a6edd')
inputs['correctedParentReview'], corrected = retained(S / '1370-an-m0-fullfunction-parent-independent-source-review-20261010-r5-r2' / 'RECEIPT.json', 'b29b7f890250b749ea6bda0d7a4751016c75a684945021a6bdb22cee4e3b274a')
assert corrected['decision'] == 'ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY'
assert {k:v for k,v in prior.items() if k != 'decision'} == {k:v for k,v in corrected.items() if k != 'decision'}
inputs['rootLauncherCorrection'], launch = retained(AN / 'FULLFUNCTION-R5-ROOT-LAUNCHER-R13-DELTA.json')
assert launch['runtimeExecuted'] is False and launch['preservedHeldR12Launcher'] is True
inputs['r13SourceManifest'], manifest = retained(Path(repaired['sourceManifest']['path']))
assert inputs['r13SourceManifest'] == repaired['sourceManifest']

addition = '''

## R17: close actual controls and source interfaces without borrowing runtime authority

This append preserves every byte of r16, including its then-pending states and prior failures. These updates use the retained named records at the source-only input cutoff preceding root's actual56544 notification; no R5 fullfunction runtime outcome had been supplied at that cutoff. No R5 baseline, typed-catch mutant, natural encoded fit, after-proof, neutrality, or full qualification is admitted here. Later actual results belong in a separate observed update, not in this historical source-only draft.

- Keep observed authority at its measured scope. Genuine root adoption `fa668549` closes the independently observed pure49 route: 49 exact cases, 9 GREEN and 40 specific RED, including the original18 ordering cases, actual exit0 and released lane. The fullbody game template remains source-reviewed only; its game assertions were not executed by that public route. This closes the finite codec/probe/pair/ordering interface and does not establish natural-game trace fit or baseline/mutant success.
- Close the fresh current prelaunch separately. Actual original prelaunch32283 and reader40232 both exited0. Independent receipt `b0303533` admits the original continuous-freeze reuse, nine strict roots, four raw local-only roles and scanner89985 PID/group ESRCH; current protection `1f084410` binds it to the prior protected STOP and latest shared postflight. Reusing the admitted full inventory under the original provision is recorded as reuse, with no new full inventory and no game qualification. The r16 statement that this independent review was pending remains historical text, not the current admission state.
- Rebuild concrete recipe maps from the finalized retained roles. R12 source STOP `34d22823` caught eight stale role entries and three missing aliases in `RECIPE.json.routeSourcePins`; the recipe still represented12 while the consumers required15. Preserve R12 and its held reader/launcher rather than treating a stale documentary map as harmless. Fresh R13 manifest `5eb43712` and independent source receipt `1120c87f` close the correction: exact15 recipe roles, consequent local path/hash bindings, six complete inverse pairs, unchanged function bodies and bounds. This is source acceptance only; future actual authority remains external.
- Read the actual interface where it is defined. Root correction record `74e622c5` preserves builder0552e0 exit1 before launcher output: it assumed `reviewAliases` lived directly in CONFIG, while the real field was `RECIPE.reviewAliases`. Correct the lookup before producing the root launcher; no candidate/source change or runtime attempt resulted from that builder failure. The fresh R13 launcher delta `4fa51550` retains the old held launcher and records only source-package/manifest substitutions, with runtimeExecuted false. Do not guess one document's fields from another document's role.
- Decision labels are executable receipt fields. Preserve parent receipt `3298d456`, whose checks succeeded but whose free-form decision was rejected by the unchanged parent predicate. Corrected receipt `b29b7f89` supplies exact `ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY`; the other receipt content is identical. Root correction `386cbc41` records no runtime attempted with the incompatible label. Authenticate the actual consumer-required schema, role aliases, decision and false execution-authorization fields before grant preparation.
- Track distinct authority states in the working model: a proposed or sealed source package; independent source acceptance; genuine externally issued launch authority; retained terminal tool/result/ownership evidence; independent observed admission; and root adoption. Source acceptance cannot fill an observed result, and a finite observed control result cannot fill a fullbody game result. Leave unknown future outcomes null; keep old failures and corrected derivatives as separate roles. These are existing contract stages, not additional gates or permission requests.
- Deliver tasks to idle agents with `followup_task`. A `send_message` updates an agent's mailbox but does not start an idle turn. Use messages for coordination while an agent is active, and an explicit follow-up task to activate the already assigned bounded work. This operational lesson is grounded in the collaboration tool contract, not inferred from a candidate test outcome.

At this draft boundary, published AM7087/src13880/mainc902 and the governing order remain as recorded in r16. No Owner decision, P17/P18 runtime, or R5 fullfunction runtime outcome is added. Root must reconcile any later actual outcome and publication into its own final checkpoint; this scratch draft does not mutate AN, the repository, private M0, or prior receipts.
'''.encode('utf-8')
draft = save('LESSONS-r17-PROPOSED.md', old_bytes + addition)
assert (OUT / 'LESSONS-r17-PROPOSED.md').read_bytes()[:len(old_bytes)] == old_bytes
audit = {
    'schema': '1370-scratch-lessons-draft-audit/v1',
    'draft': draft,
    'exactR16PrefixPreserved': True,
    'originalPrefixBytes': len(old_bytes),
    'appendedBytes': len(addition),
    'inputs': inputs,
    'sourceOnlyDocumentaryDraft': True,
    'candidateRuntimeExecutedByAuthor': False,
    'repoOrRootANModified': False,
    'r5RuntimeOutcome': None,
    'inputCutoff': 'Source-only named-role review before root supplied actual56544; root explicitly requested this historical draft remain at that cutoff.',
    'fullQualificationAcceptedByDraft': False,
    'builderFailureEvidenceScope': 'Authenticated root correction record; no separately supplied raw 0552 tool envelope is invented.',
    'idleAgentLessonEvidence': 'Declared collaboration tool send_message and followup_task contracts.',
}
audit_role = save('DRAFT-AUDIT.json', (json.dumps(audit, indent=2, sort_keys=True) + '\n').encode('utf-8'))
builder_role = role(OUT / 'prepare-lessons.py')
seal = {'schema': '1370-scratch-documentation-draft-seal/v1', 'files': {'LESSONS-r17-PROPOSED.md': draft, 'DRAFT-AUDIT.json': audit_role, 'prepare-lessons.py': builder_role}, 'executionAuthorization': False}
for r in seal['files'].values():
    assert role(Path(r['path'])) == r
seal_role = save('SEAL.json', (json.dumps(seal, indent=2, sort_keys=True) + '\n').encode('utf-8'))
for p in OUT.iterdir():
    p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'draft': draft, 'audit': audit_role, 'seal': seal_role, 'exactR16PrefixPreserved': True, 'r5RuntimeOutcome': None}, indent=2))
