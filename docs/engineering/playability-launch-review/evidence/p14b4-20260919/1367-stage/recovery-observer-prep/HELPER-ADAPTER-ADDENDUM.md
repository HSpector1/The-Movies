# Bounded historical helper adapter review

**PROCEED with the exact adapter for candidate type verification.** Reviewed parent patch `S/1367-recovery-integrated-candidate/test-helper-save46-downgrade.patch`, SHA-256 `a351c8a1103662bd79b134ae1288abcaceb89e0027143f785701bb4e7b56e4bd` (recomputed).

Completed `test-types-r1/output.txt` reports the single TS2345 at `tests/helpers/p14c2b-fixtures.ts(69,154)`: makeSave returns SaveFileV46 but convertV45ToV44 requires SaveFileV45. Result records actual child2, no timeout, exact before/after files. This is a real era mismatch, not a reason to cast away the version.

The patch imports and inserts the actual convertV46ToV45 between makeSave and the existing 45→44→…→36 converter chain. Current46 admission remains first. The real converter validates46, refuses any nonempty since/refund/tombstone authority, strips only admitted empty recovery fields and publicly admits45. Every existing older converter/refusal remains. No root deletion, fabricated older envelope, error broadening or assertion weakening is introduced. Nonempty recovery state must now stop at its new owner; an existing helper caller that needs an older historical control must use genuine historical bytes, not bypass this guard.

No substantive source-level defect found. This report does not infer that affected runtime callers have empty recovery authority or that the later test compilation passed. No moving r2 output, runtime, fixture payload, source/index change or extra agent; only this addendum written beside the approved O review.
