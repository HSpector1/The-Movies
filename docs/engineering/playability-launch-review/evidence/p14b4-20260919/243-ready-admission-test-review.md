# 243 — Ready-admission independent test review

DONE — REFINE three concrete assertions before installation. The remaining
reviewed structure is suitable for this bounded tranche. Native contract-auditor
full report, preserved by parent on2026-09-20.

Read the complete434-line draft and brief; rehashed:

- Draft: ade2d742bb935d0d84e43ff42590a9837bb1040e9505d94271b485af5273e71c
- Brief: 73207f745de64a058752dc0ece558646e507ca79e3ee6b98a43db217439719ae

No files changed or runtime executed by auditor.

## Required corrections

1. Original greenlight is incorrectly moved forward — draft258.
   existingAndReady admits A at week1, then ticks to source week2. The assertion
   expects A's greenlight at now—week2—rather than its actual start. Preserve
   {week: old.startTick, step:0}, with explicit fixture guards old.startTick===1
   and now===2. Keep new Ready picture's distinct {week:now, step:1} unchanged.
2. Wrong existing kernel discriminator — draft316. JointTraceCapacityResult
   uses status, not kind. Expect {status:'UNCERTIFIED',reason:'domainIncomplete'}.
   Retain real kernel call, input immutability and shared-work assertions. This
   is an API mismatch, not an unexecuted fixture hypothesis.
3. Zero-budget envelope contradicts176 — draft424–425.176 requires empty fixed
   holds and attempts at zero allowance without scanning plans to manufacture
   named cuts. Remove unconditional one-attempt requirement. Preserve zero owner
   calls and nonempty omission; require saturated preparationWork===work. At zero
   assert empty fixedHolds/attempts; at work1 require no complete attempt without
   inventing a compulsory named per-plan cut.

## Confirmed correct

The oldPath=['production',issuer,old.id] assertion is correct. Existing200
coverage retains that production path and suppresses its linked inProduction
screenplay path. Do not change it to a second screenplay opportunity.

The draft otherwise preserves genuine historical-control founding, actual hiring,
commissions, acceptance, admission and ticks; strict save guards and actual
finance-authorized reference states; transparent owner spies and restoration;
whole-slate[8,8]→[7,8] parity and original opaque references; admission-only script
snapshot semantics; separate new company/grant boundaries, compulsory old holds
and no writer-credit company hold; legal sibling alternatives with independent
roots and one shared physical screenplay identity; exact refusal controls,
unchanged limits and default timeout.

## Remaining qualifications

The new fixture conjunctions remain UNEXECUTED: third commission, audition,
selected non-market outsider, foreign-relevance guards, available funds and
cumulative sibling/kernel cost. No additional source-proven construction
contradiction was found.

The brief accurately leaves identity-history collisions, later-release commands,
ordinal/horizon validation, financial refusal versus operational success and
longer transitions outside these seven cases.

Preserve v1, apply only the three independent oracle corrections, freeze/review
the exact delta, then install and record actual RED. Missing exports alone would
not prove any behavioral assertion was reached.

Parent independently confirmed all three against unchanged182/200 tests and
contracts; 244 test-author correction released, no production writer/runtime.
