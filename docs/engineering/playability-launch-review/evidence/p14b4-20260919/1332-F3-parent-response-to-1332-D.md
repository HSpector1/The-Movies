# 1332-F3: parent response to the R3 implementation review 1332-D

[1332-D](1332-D-retained-r3-review.md) returned REFINE with two required changes. The review accepts the staged test
logic of all three leaves.

## Required change 1: the dry run's changed-primary count (answered, no change to 1332-X)

1332-D reads `"RETAINED-CHANGED": 10` in [1332-X-fullcore-rows.json](1332-X-fullcore-rows.json) against 1332-X's
"7 changed primaries". The two counts measure different things:

- `byStatus` in the rows JSON is the status **against 1316**, the reference `1321-I-attribution.py` compares with
  (the field is `status_vs_1316`). Ten rows are RETAINED-CHANGED against 1316: `p14c3-canonical-rival-history` L1
  and L2, the `p14c3-save-v38` Rule 4 leaf, the six C17 ENOENT rows and the benign exporter row.
- 1332-X counts primaries changed **against 1330**. The parent compared the 86 dry-run rows with
  [1330-I-failures.json](1330-I-failures.json) by identity and primary text. L1, L2 and the `p14c3-save-v38` leaf
  carry exactly the 1330 primary (they are RETAINED-CHANGED against 1316 in 1330 too, per 1330-I and 1330-J). Only the
  seven path-bearing rows differ, because their messages carry the scratch path.

1332-X's statement stands; it stays byte-frozen. The same distinction applies to the recorded gate after
application, whose attribution reports both counts.

## Required change 2: the checkpoint comment's citation (revision 3)

The comment added to `tests/bridge-p14b2-checkpoint.test.ts` cites `src/core/save.ts:10490-10497` for
`convertV39ToV40`. The function begins at `:10493` (`:10489-10491` is `validateSaveV40`). The classification row
already cites `:10493-10497`. The author issues revision 3 with that one comment line corrected and nothing else.
The parent verifies that the revision 2 to revision 3 difference is that line alone. It re-applies revision 3 to the
dry-run tree and re-runs the three touched files and the root, Bridge and UI type gates. A comment-only change cannot
alter the full-core result, so 1332-X's full-core run stands for revision 3.

## Non-blocking notes

- The checkpoint's `sourceHollywood` cast has no null guard; this fixture's `hollywood` is non-null (four measured
  `termination` keys), and a null root would fail the leaf loudly at `.businesses`. Left as is.
- The bound-path receipt keeps `toMatchObject({ week: 208, rulesVersion: 4 })`, the leaf's original assertion; the
  determinism check (all twelve receipts equal between `direct` and `resumed`) covers the other fields. Left as is.
