# 355 — Single-pass reconciliation source review

2026-09-20. Native contract-auditor DONE, qualified KEEP. No concrete defect,
edits or runtime checks. Parent read full report.

Independently verified base52ba3ab8e552c29ffb7b0963411c555412770c14;
replay393d4dc7f8997183468c84b6b6c6e31ff839c626f765607b5391368a20996486;
handbackd5d9c8cb56d5b2952d0c28f3e76cd721bd1ef27ffeeaeedfc7866cafecc8981d.
Complete handback/production diff read; protected source only replay.

## MET with bounded source evidence

Both cardinality directions remain exact. Expected-fact construction, first-pass
filters/picture lookup/path-subject comparison order and immediate rowmatches1
guard retained. Every successful pair also increments that fact's count. Final
checks remain in original expected order, each requiring exactly1.

All expected facts are resources on known prepared-picture paths. Closed rows,
people, null paths and non-picture paths cannot contribute to the old second
scan. Resource identity comparison is symmetric. Therefore duplicate expected
facts/stale unmatched live resources retain first diagnostic; missing reservations/
duplicate live holds retain second. No collapsed multiplicity, deduplication or
earlycounter>1 rejection. Diagnostic order preserved WHEN checks execute; changed
expenditure can legitimately move a work-limit boundary.

New work prepaid:
- Expected literal14→22 includes full matches key/write.
- Both constructors separately add zero-initialization1 beforeconstruction.
- Successfulpair pays16 BEFOREbothincrements: localincrement/factread/add/keyed
  write/control. Existing exact string/subject payments unchanged.
- Final check pays12 BEFOREvisit/read/comparison/invariant.
Counters remain per reconciliation invocation, cannot survive a cut or approach
unsafe integer magnitudes under shared allowance.

Event drain/hold mutation/subject equality/actualowner calls/tests/limits/
validators/versions/publictypes unchanged. Savings remove actual repeated
comparisons; no still-executed work receives a discount.

## Limits

Bounded354 source acceptance only, not numerical usefulness/universal inherited
accounting. Runtime is parent-owned. Long firsttake/wrap/output/stale routes must
still prove required results under unchanged200000/tests. NoReady/B4acceptance.

