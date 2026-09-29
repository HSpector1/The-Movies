# 1351-F2: parent response to the P15A.2 implementation review 1351-J

[1351-J](1351-J-p15a2-implementation-review.md) returned REVISE. It re-derived the whole law, including the F3 change,
and found it correct against 1350-A §3 and 1351-F. The two blocking items are review-completeness gaps. The parent
takes both, and one of the notes.

1. **TUNING ranges.** The seven `POWER_RANKING_*` comments state their reasons but not the ranges RED r4 asserts
   (`tests/p15a2-power-ranking.test.ts:388-394`): window and caps above 0, `0 < CRITIC_SHARE ≤ 1`, `REACH_SCALE > 0`,
   `THRIVING_WEEKS > STABLE_WEEKS`. As with P15A.1 (3b6cd98c), the parent adds the ranges in a separate comment-only
   commit at landing. The production patch stays as reviewed.
2. **Fail-loud paths.** The law throws on malformed input so that a frozen snapshot can never hold a NaN or a
   duplicate. No test guards those throws. Revision 1351-C5 adds an error-handling block:
   - one leaf per throw condition: a non-integer week, originWeek, enteredWeek or releaseTick; a non-finite
     baseMarketValue or cash; a duplicate studioId or filmId; a critic score outside 0..100; a negative or non-finite
     totalGross or weeklyFixedCost;
   - each assertion matches the condition's own message, never a generic throw;
   - one leaf asserting that no thrown message from `computePowerRanking` or `financialStrengthBand` contains a probe
     cash or fixed-cost value.
3. **Inputs are not mutated** (note 1). 1351-C5 adds one leaf: a deep-frozen input survives the call byte-identical.
4. **The "no finished release in the window" reason** (note 2). It belongs to Wave 2's view. A row with
   `filmsTenths` 0 and no `filmIds` carries the fact, and the Wave 2 adapter renders the sentence from it. The Wave 2
   charter pins it.

Order: 1351-C5 → parent dry run over production r2, where every new leaf is expected to pass without a production
change → landing with the comment commit → broad gates together with P15A.1.
