# 1315-F: parent adoption of the casting-driver RED

The parent read the staged RED rounds (1315-C to C4), its own scratch dry runs (1315-X to X4) and the independent review
[1315-D](1315-D-casting-drivers-red-review.md) (REFINE, two required changes) in full. Adopt
[1315-stage5](1315-stage5/tests/) (revision [1315-C5](1315-C5-casting-drivers-red-r5-handback.md)) as the RED.

## Dispositions

1. **Change 1 adopted verbatim.** The P-dedup leaf also asserts no `repeatedCompetition` driver on that production.
2. **Change 2 adopted in substance, not in its literal form.** The support actor's committed term (52 weeks) ends before
   the lead's expiry (week 60), so the committed-term condition excludes support whatever its tier; asserting "support
   is not named" would pass under a broken tier gate. The new leaf elevates only the director and requires the
   antagonist (a real, un-elevated edge with the lead; a 208-week term) to be absent while the director is named, with
   the three route premises asserted first.
3. **The committed-term reading stands** (1315-D check 4: a lawful and necessary completion of 1313-F amendment 4 for a
   future week). Its leaf now also elevates the director and requires the director's name, so it fails on the unchanged
   engine instead of passing vacuously. The parent's Save42 draft implements the same condition.
4. **Open, carried to the handoff:** the `state.hollywood === null` clause of 1313-F amendment 1 has no executable leaf;
   no lawful route to a managed casting session without an initialized industry was found. The production guard exists
   and is read by review, not by a test.

## Dry run of the adopted set ([1315-X5](1315-X5-red-r5-dry-run-head.txt), [draft](1315-X5-red-r5-dry-run-draft.txt))

Unchanged engine: 21 failed, 13 passed, 1 skipped; every failure is a stated RED (the 19 of 1315-X4 plus the two expiry
leaves above, both on the director-name assertion). Save42 draft: 34 passed, 1 skipped.

## Order

The RED is applied to `tests/` and recorded only after the 1309 sweep lands and the broad core and UI gates close the
R2/R3 increment, so those gates attribute without these 21 planned failures. Then: recorded RED on unchanged
production, parent production (the reviewed draft), GREEN, implementation review, Save42 pin sweep.
