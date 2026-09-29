# 1332-F: parent adoption of the R3 plan with the two 1332-B amendments

The parent read [1332-B](1332-B-r3-plan-review.md) (REFINE) in full. It accepts both blocking items. 1332-A stays
byte-frozen; this record governs where the two differ. The attribution, the scope (three rows; the seven ledger and
seating rows wait on D-1329-1) and rules 1, 2, 5, 6 and 7 are adopted as written.

## Amendment 1: rule 4, the unbound subject's receipt

1332-A rule 4 says an unbound subject "keeps its week-207 receipt unchanged". The receipt a subject holds before the
tick carries week 196 for both measured subjects. The rule reads: **otherwise the subject keeps the receipt it held in
the pre-tick state, unchanged (every field equal); for `promise-3` and `promise-26` that receipt has week 196.** The
expectation is derived from the pre-tick state, never from a literal week.

## Amendment 2: rule 3, the `firstTakeSubjects` guard

A guard that checks only `eventId` would leave the fact's payload (`conceptId`, `genre`, `scriptProjectId`) outside
every assertion once the root leaves the digest. Before the repair, the whole-state digest covered it. The guard
therefore asserts the root's full content before `bytes()` strips it, derived from the law, not from the probe output:

- `version` 1, and `cutoverOrdinal` equal to the ordinal the Save39-to-Save40 lift wrote
  (`src/core/save.ts:10497`: the lifted envelope's `firstTakes.length`), unchanged across the tick;
- `facts` holds exactly one row per take recorded after the cutover. For this leaf that is one row whose `eventId` is
  `FROZEN.takeEventId`, and whose `conceptId`, `genre` and `scriptProjectId` equal what `subjectForNewTake` derives
  from the scheduled production (`src/core/firstTakeSubjects.ts:18-28`: the production's concept, that concept's
  genre, and the issuer-owned screenplay linked to the production or `null`);
- the parent's measured values (`c-00`, `comedy`, `null`, cutover 24) are the cross-check the author reports, not the
  source of the expectation.

`bytes()` has one call site (1332-B note 1), the seam leaf. The author may put the guard inside `bytes()` (throwing,
like the `extensionUsed` guard) or assert it in the leaf before the digest comparison. Either way the content is
asserted wherever the root is stripped. The `termination` guard stays as written (a scalar that must be 0).

## Other notes adopted

- 1332-B note 4: the `relationships[].sharedCompetitions` lift does not reach either leaf (the checkpoint's
  `relationships` is `[]`; `bytes()` strips `relationships` whole). The author confirms this still holds in its tree.
- 1332-B did not open the cited raw lines; the parent took them from the 1330 raw with `grep -n` before writing
  1332-A. The author re-measures the checkpoint diff in its own tree.

Next: test-author staging (1332-C) against 1332-A as amended here, then the parent dry run, independent review,
application and the recorded gates.
