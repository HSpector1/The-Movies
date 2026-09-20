# 196 — PARTIAL / REFINE: preserve behavior, correct prepaid construction

2026-09-20. Native independent contract-auditor report, persisted by parent.
No files changed or runtime executed by reviewer. Parent adopts the concrete
refinement and all qualifications; this is NOT whole-cost acceptance.

## Exact candidate reviewed

Base0bc641a10f995a418a180b1d4fe4e6018aa4a14a; identical production bytes now
publisheda5eb3cf2b90e68d47430ce59af6a33e39eff0c20.

| File | SHA256 |
| --- | --- |
|src/core/promiseCapacityOwnerReplay.ts|6e681ce3a23e236e638efe1db2ee0ec340b17633133e70c3a187cf7d8c48662f|
|src/core/scriptDevelopment.ts|a82629e70d467c4716a280c7cac6fcaa67ce26137accc0d5d9e7835fefd63a49|
|src/core/castingSessions.ts|497a8a32152e556378db96d8363be6de9a0719f2eed1fbec4a4fcfe222cf3a3b|
|src/core/productionPeople.ts|2c6ea9affd6811d25cd36d85808d9470441f579153a7f0a2fb5b6a2c8a118d58|

Reviewed complete replay,191, three companion changes,137/176/185/186 and relevant
actual owner bodies.

## Blocking finding — DEVIATES: adopted literal model not fully prepaid

176§2 requires literal(keys)=1+sum(1+key.length), plus separate array/callback/
reference-write work.

1. Branch construction at1114–1120 pays30+fixed.length*4+pictures.length*6.
   Each {hold,fixed,closed} literal alone costs19; each
   {productionId,firstTake,personRelease} costs38, before map visits/output writes
   and enclosing branch. Ordinary one-picture/ten-fixed-hold branch pays76 for
   construction, whereas ten ledger wrappers alone require190.
2. Completed proof rows853–872 pay35 per picture. Fourteen keys/span145 give
   literal-only160 before nested greenlight, arrays and output writes. Separately
   charged lookup/token work cannot fund those property writes. Background/mount
   rows pay13 versus six-key literal-only64.

These invalidate the claimed prepaid upper bound despite passing behavior and
counter tests. They do NOT show gameplay-output regression. Correct construction
accounting throughout this SAME module, not just these two constants: decorated
sort rows, contexts, ledger/proof, nested arrays, projections, success/cut results.
Respect only the explicitly allowed administrative work-limit exception. Preserve
prepaid calculators, saturation/shared counter,200000 and all acceptance tests.

## MET WITH SOURCE EVIDENCE

- Due-predicate seams preserve exact boolean conditions/non-finite comparison
  behavior and actual owner mode/week guards. Company signature is type-only.
- Real whole-slate owners/fresh narrow contexts; no fabricated GameState,
  replacement admission policy, live promise, version/save or kernel change.
- Commands resolve CURRENT branch state; released IDs are not resurrected.
- Due backgrounds close before sweep; original ordered owner events, arrived-week
  takes and186 stage/Set endpoint preserved. Historical takes not re-emitted;
  whole-ledger reconciliation retained.
- All4 Post `other=n-1` is NOT a demonstrated defect. operations1317–1356 removes
  transitioning old reservations/task/stage binding BEFORE allocation. All rows
  and raw producer visits remain billed; no assumed eager-filter optimization.
- Charged linear joins depart from proposed indexes but are not automatically
  a breach. They must pay real traversals/strings, not assumed constant lookups.

## PARTIAL / NOT VERIFIED

Reviewer has NOT independently certified every remaining owner coefficient,
calculator operation, variable string comparison, shallow copy, callback and
construction. Definite literal omissions require refinement; no blanket remaining
arithmetic endorsement. Behavioral usefulness does not prove conservatism. Real
one/two H6 plus unchanged kernel must still fit SAME cap AFTER correction.

Already-started slice does not establish complete future choices/general adapter,
liveP2/wholeB4, Unity/native or Owner acceptance.

## Runtime qualification / next action

Reviewer read complete198 raw+metadata: fixed19PASS/1FAIL, all182sixteenPASS;
strictmakeSave fixture rejects fresh week>0 BEFOREreplay. Parent later reported
20522PASS/lawfully corrected fixture/unchanged production but reviewer had not
independently reread205.197rootUIpass/20198PASS/202soleoldP2bridge error likewise
parent-reported at handback, not closure of accounting findings.

One writer corrects SAME-module bills, reruns immutable usefulness/threshold/
shared-budget/parity checks, then frozen accounting delta goes to bounded review.
No new product decision or broader prerequisite campaign is needed.
