# 1359-F2: parent response to the P15C Wave 2 RED review (1359-D)

[1359-D](1359-D-p15c-wave2-red-review.md) returned REFINE on [1359-C](1359-C-p15c-wave2-red-handback.md) with seven
required changes and a recommendation on F1. The parent adopts all of it. The test author revises the RED as r2.

## F1: the law changes, not the charter

- The landed Wave 1 law refuses a null `settledWeek` (`src/core/campaignLegacy.ts:351`). The Wave 2 charter gives an
  authored film a null `settledWeek` (1359-A §3.1).
- **Ruling:** relax the law for authored films only. A film with `authoredPreCampaign: true` may carry a null
  `settledWeek`. Every other film keeps the refusal.
- Authored films count in no lane (1351-F), so no evaluation outcome moves. `CAMPAIGN_LEGACY_DEFINITION` stays v1, and
  Wave 1's landed tests stay green.
- The relaxation lands with Wave 2's production, under that wave's implementation review.
- **RED:** a new leaf pins both sides. An authored film with a null `settledWeek` is accepted. A non-authored film with
  a null `settledWeek` is refused by name.

## Required in r2 (1359-D items 1-7)

1. **C11 pins v1's values as literals.** The test pins the v1 TUNING values as literals. Copying TUNING when the
   module loads would make a later retune without a definition bump invisible.
2. **Time budgets that can fire.** vitest 2.1.9 starts a test's timer only after a synchronous body finishes, so no
   budget can fire. Every budgeted leaf measures its own elapsed time and asserts it against a budget marked
   PROVISIONAL, set by the parent from the first single-file run (the 1353-F3 method).
   - **The landed Wave R guard has the same flaw.** `tests/p15c-wave-r-retention.test.ts` is already in this RED
     (Amendment 2), so r2 fixes its guard the same way. This is a test-only change.
3. **Sibling roots** (1356-F2 R3). Use the shared `tests/helpers/p15-roots.ts`, with the same path and contents as
   1356-C r2's, and add `campaignLegacy` to `P15_ROOTS` in this patch. Whichever lands second merges the list. Declare
   which leaves are re-pinned at each sibling's landing.
4. **C2 and B4b** gain premises so neither can pass without testing what it names.
5. **A producer for the route L captures** (weeks 6239 and 6240), in the 1355-P form: it runs at the last writer
   below the step, writes only to the stated fixture paths, and refuses a wrong tree.
6. **B3** declares that it ticks a state the validator refuses, and why that is lawful for the leaf.
7. **The F1 leaf** above.

## SIBLING PENDING leaves are split out

The six leaves that would still fail after this wave's GREEN move out of this RED before the recorded RED runs. They
are B2, B4b, B7, C3b, C8b and C10c.
- B7 moves to P15B's RED.
- The other five go to a separate patch, `1359-p15c-wave2-sibling.patch`, which lands with the sibling root they need.
- No leaf in this RED may stay red after this wave's GREEN.

## Dropped

The claim that the Legacy downgrade refusal must fire first in a shared step has no charter basis, and C5 does not
need it. It is dropped.

## Next

- r2 from the test author, then a confirmation review.
- The parent's reference run and the route L capture follow the heavy queue: x3, then 1356-X, then 1355-X.
