# 290 — Single-picture transition source review

2026-09-20. Native contract-auditor: DONE, REFINE. Parent read complete report.
Full delta against b1ad9f6bdacb34fb6ae04508e5633ae0de4c444b,287 handback and
relevant unchanged owners inspected. Replay SHA
290dc598921abdcef7a04093496d05274bd03ae8e7fa110fdbc362565392d955;
handback917da71724b6a7b482e676ec3f6ed33addcdfb5cdc434cb2a9e1c5114a210348.

## Required correction — calculator string comparisons underpaid

Replay957–964 reserves14 per facility, then directly compares capability with
soundstage and potentially set-scenery. A lawful Post row requires15 for
post/soundstage and16 for post/set-scenery under1+bothlengths:31 BEFORE scalar
loop/control. Neither branch executes saturating-add payments. Earlier dimensions
do not prepay these later comparisons; later payment cannot repair pay-before.
Retain scalar reserve and use Work.equal, or documented sufficient fixed reserve.
No owner/metric/limit/test change warranted.

## Bounded requirements otherwise supported

- Selector confines specialization to actual one-picture7/6 transitions; other
  inputs retain general billing.
- allSilent examines all technology rows; missing selection is actual owner's
  lawful silent default. Adoption/installation traversals unreachable, real
  shooting lock lookup and immutable updates remain priced.
- Retry proof matches actual ordering: at7 <=2 allocations, at6 <=1; both <=2
  outer visits and <=1 success.
- Both occupancy workflow passes covered; at6 stage and bound-Set claims built
  before same-owner exclusion; external occupancy retained.
- Facility copy/filter/sort, stage composite, sticky reservation copy, Scenery
  search, full Set filtering and genre lookup represented.
- smallTransitionBill covers both key maps/opposite includes without invented
  retained-stage release/grant events.
- New literal schemas match actual release/entry/result, bindings, task/blocker;
  generic copied fields and actual callbacks preserved.

No other concrete defect found within delta; NOT universal existing-bill proof.
Reviewer ran no checks or edits. Actual293 Ready12PASS2workLimitFAIL,294original26
PASS do not establish usefulness or repair this static defect.292 test syntax is
separate. Preserve all evidence; next sole-source fix includes comparison payment.
