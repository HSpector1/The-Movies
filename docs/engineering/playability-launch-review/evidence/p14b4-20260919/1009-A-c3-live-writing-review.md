# 1009-A — independent live-writing attribution and follow-up review

## Closed1006 attribution

**KEEP** the bounded attribution below. Reviewer read the closed JSON, raw log
and frozen patch, with no test/gameplay/compiler execution and no source/test
mutation. Parent-owned1006 ran on
`ea4f1b6de24436d9cb8bd6dd4cdfa9ecea9ba425` plus patch SHA256
`a4010793ddcf0645ef5cc4387f89726563e2767bb61c54c0451a6ed5c7e3dd0e`,
whose on-disk hash was independently checked. The recorder reports identical
start/end source and diff, `fixedSource: true`, child exit1, and25.852 seconds
from2026-09-26T21:32:58.274Z to21:33:24.126Z.

Four cases pass and eight fail. The eight failed cases contain18 separately
reported assertion/error observations; these are not18 test cases.

| Cases, both destinations | Observation | Attribution |
| --- | --- | --- |
| W1/W2, four PASS | Actual own renewal260→468, payment, real hard75 announcement364, derived E468 and retained actor history satisfy their assertions. | Genuine controls pass. |
| W3, two FAIL | All three mandatory live callers per destination reject `script-0000` as writer not contracted. Genuine finishing E468, expiry evidence, draft due>E+1, spare slot/young writer and full Save38 admission are reached first. | Six expected live-context failures. |
| W4/W5, four FAIL | First continuation tick stops at `assertLiveStudioPlacementInvariants`→construction→script contract validation. | Four expected live-context failures, before completion/finality assertions. |
| W6 missing current row | Whole Save38 rejects the retained retirementExtension case for authored-0000/1 because its retirement record is missing; test expected the later writer-contract error. | Two test expected-cause mismatches; production correctly refuses. |
| W6 missing old actor row | Whole Save38 correctly refuses the missing completed acting predecessor; construction, Calendar and unrelated screenplay each accept the malformed snapshot. | Six expected live fallback failures. |

Thus16 observations concern missing/unsafe live authority and two concern a
test's predicted refusal owner. The malformed snapshots remain labelled negative
controls. The missing-current live checks and missing-old whole-save checks
already meet their expectations; no general weakening of their refusals is needed.

Correct only the missing-current whole-save expectation to the observed specific
retirementExtension/missing-retirement-record cause. Retain the full positive
before mutation, both missing-row mutants, exact C3/task/employment preservation,
all three live refusal requirements, and frozen1006 evidence unchanged. No
production change is justified merely to move a correct refusal to a later check.

## What1006 does not yet establish

W4 imports the actual E save and passes canonical equality before constructing
its result. The direct continuation is evaluated first and throws, so the loaded
continuation does not independently reach its first tick. W5 repeats that
uncached completion failure. Neither completed screenplay equivalence nor
noCatalogue finality has executed yet; their intended assertions remain pending.

This run establishes the real E468 setup for each subject, including the current
Director with writing discipline. It does not qualify queue context transport,
an unrelated transition due in the arriving week, full malformed-state proof,
idle-path cost, rival work, two actual used extensions or broader C.3 completion.

At this initial attribution point,1008-A was not yet available. Its later review
and the production follow-up are recorded below. Parent retains implementation and
the sole heavy test lane; only this review document is writable by the reviewer.

## Frozen seven-file implementation — KEEP

Reviewed the frozen production candidate on the same published source. The
record1008 consumed patch SHA256 is
`6664c9336f5b45946b61f9fe46f11c19f0484487b8c1a817e7f8396f3780a1db`;
its on-disk hash was independently checked. No production-blocking finding.

- `save.ts:10203–10222` factors the complete existing current validation into
  `proveSaveV38`. Copied context escapes only after provenance, profession history
  and all private historical delegates succeed. Public validateSaveV38 preserves
  original envelope identity. Frozen public readers and frozen placement calls
  at4307/4482 are unchanged; no serialization repairs malformed proof input.
- `retirementWriting.ts:25–71` first finds unfinished future-due task writers
  without a contract at the task's owning studio. Player contracts and rival
  employment are checked separately; unrelated employment cannot hide a needed
  player permission. No candidates returns before career-history inspection.
  Relevant changes, mismatched/missing anchors or episodes and malformed scaffold
  require full proof, including the missing-old-row fallback discriminator.
- `liveRetirementWriting.ts` distinguishes legacy/proved/rejected invocation
  tokens. Rejected proof returns no writing authority, with no context-free retry.
  Successful context contains copied immutable profession facts; the base factory
  still recomputes exact studio/task/writer/date/week grants from each phase state.
  Its original chronology/expiry-receipt guards remain unchanged.
- `tick.ts:195/221/419`, `queueAdmission.ts:57/70` and
  `actions.ts:1755/1902/2866` explicitly carry the token from the settled source
  through placement, queue admission, queued commit and private script calls,
  including the greenlight Now function. Public direct queue functions retain
  their standalone default preparation; the real tick always supplies its token.
  Ordinary actions prepare once and pass it to every affected script/placement
  invariant call. Physical-plan direct commits remain unchanged.
- The new live→save→placement module cycle is lazy: imported proof functions are
  invoked only at calls, with no top-level proof/cache. The base factory has no
  runtime save import. Full save validation delegates to frozen placement, so it
  does not recurse through the live wrapper.

Reviewed production file SHA256 values:

| File under src/core | SHA256 |
| --- | --- |
| actions.ts | `52d88fe62ec41e6063c2d5928c54ca2dfdbb612cb31c5b5f7ad3d3cbc801cf1d` |
| liveRetirementWriting.ts | `eb8736770ae2d96ad90069d981327acbebb661852101143ca53afa8d1553530b` |
| placement.ts | `28c2f23521d752ecdccf260c25b0ee06a7b8fd0a01a29b39060796d05e4086ed` |
| queueAdmission.ts | `ad74544f539f1d383839cbbe8b19d6324b5c5fffd3e7249ae6a2cc1b330b1047` |
| retirementWriting.ts | `73590d43ce9e374fdfa784b24e6e11a5751a91f1cecf581f128be6483ecf4f0d` |
| save.ts | `7d05eb0e4d9921e72cf2889eabc77fc96372f743366d33a05884343c9cde3ace` |
| tick.ts | `003b2196545e16241581d1de1f986177fd6873bdf373e7a11be6c0de879cdc71` |

## Corrected expectation and closed1008 evidence

The author changed only the missing-current fullSaveCause to the specific actual
person's retirementExtension/missing-record clause. The corrected test hash is
`4982f360cbf039d100e18d5ea5a012d266a6ae67481fc55c43f1c21c27949090`;
the helper remains unchanged. Positive setup, malformed inputs, missing-old
history and all live assertions remain intact. **KEEP** this causal correction.

Reviewer read parent-owned1008's closed JSON and raw log:12 PASS, child0,
35.511 seconds, `fixedSource: true`, ending2026-09-26T21:44:54.263Z on the
source/patch above. Both destinations now execute actual screenplay completion,
loaded/continuous equality, current retirement and noCatalogue finality, as well
as the live positives and missing-row negatives. These were unexecuted in1006;
their qualification comes from1008. Neighbor/type gates remain separately owned
and recorded by the parent; this review claims no result for an active gate.

## 1008-A six-case follow-up plan — KEEP

Reviewed plan SHA256
`6e61f08263e70806b427fdedc31602bf6a4fec9a5c77743872929c5ebf858e23`.
The public actor at261, age70, with real104-week employment through365 has a
source-supported first birthday313 at71, notice/E365, then zero-take deferred
evaluations365/417/469 at ages72/73/74. All are mandatory unrun premises; no row
is fabricated and actual75/due521 is not advanced to.

Q1 combines real settled468 expiry/finishing evidence, original due>469, a real
one-week pool draft occupying the spare slot and an actual queued original.
The call-through queue spy must observe due469 still unconsumed in the transient
arriving state. The history-proof spy has a positive full-save interception
control, then requires one settled468 proof and no transient469 re-proof, restoring
before final save assertions. This discriminates phase transport without treating
the transient state as a settled save.

Q2's unrelated retirement intentRulesVersion0 mutant must pass only the narrow new
history checker and fail the complete older delegate. Its live checks distinguish
whole-proof refusal from a partial history-only permission. Q3 independently
proves spy interception, then requires zero history-proof calls on actual idle or
currently contracted writing operations. It is a call-count control, not a timing
benchmark or an assertion of no other validation work.

The successful-suite bound525 includes both262-tick branches and the shared
initial choice; failed uncached prefixes remain separately attributable. The
plan keeps the first12 files unchanged and describes no production instrumentation
API. All six cases remain unexecuted at this review. No further production fix is
justified until their actual result identifies a defect. The inherited E−1→E edge,
B4b extensions/rival work and remaining971/938 scope stay separate.
