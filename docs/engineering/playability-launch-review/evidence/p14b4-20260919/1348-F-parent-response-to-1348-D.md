# 1348-F: parent response to the slice A RED review 1348-D

[1348-D](1348-D-rel-sliceA-red-review.md) returned REFINE with two blocking defects. The parent accepts both and
closes both in revision 1348-C2 now, rather than tracking the second for later.

1. **Mentor RED per leaf.** `tests/p14b10-mentor-label.test.ts` imports `relationshipLabels.js` per leaf with a
   dynamic import (the 1346-C technique), so each of the nine leaves shows its own RED reason.
2. **D5 through the real combinator.** A settlement-level leaf drives the real `bandsFor` path through the existing
   `f6Base()`/`settlementAt208()` apparatus of `tests/p14b5-relationships.test.ts`. It shows that with a close tie and
   an enemy (holding conflict evidence) both on the issuer's roster, D5 reads `close ties here` (2), and with only the
   enemy, `enemies here` (0). The copied-combinator leaves may stay as documentation, but the settlement leaf is the
   evidence.

Note adopted: the D1 roster predicate is `talentMarket.ts:867-874`, not `:894-900`. The comment and header are
corrected.
