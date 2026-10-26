# V5 — invalid runtime constant import

The frozen v4-resume report records one failed and two skipped cases, with the positive leaf at 7.072 seconds and a wrapped frozen V37→V30 `Cannot read properties of undefined (reading 'some')`. The report does not independently establish the exact reached first-take count. No additional reproduction or instrumentation was run.

A definite source defect matches this route: firstTakeSubjects.ts imports CAST_SLOTS from tuning.ts, which has no such export. The v3/v4 native paid-crew check calls that binding's `.some`. The other `.some` sites were inspected: the V40 promise wrapper invokes the subject validator before entering its lower V28 try/catch; the observed error likewise lacks that lower V28 wrapper. The ordinary first-take producer's state.concepts.some is not called by this validation path. The acquisition map's continuedProductions.some is bypassed for known native IDs by v4's explicit branch. Those are not justification for defaulting missing arrays or weakening validation.

The patch removes the invalid named import and declares the same local `['lead', 'antagonist', 'support'] as const` tuple already used by promises.ts:50. It preserves the complete native paid-crew comparison, issuer/timing checks and historical context. No assertion, guard or collection membership is removed or made optional. No contextual owner or frozen reader needs changing for this defect.

The earlier all-zero typechecks ran before v3/v4 introduced this import and do not qualify it. This correction is source-inferred and uncompiled/unrun; the coordinator's original positive test is the appropriate continuation, with its original budget and original failure report retained. No full-save or subsequent release success is claimed.

V1 through V4 remain untouched. The manifest binds the exact installed-v4 preimage, one changed postimage, source evidence and retained runtime report. No repository or test files were modified.
