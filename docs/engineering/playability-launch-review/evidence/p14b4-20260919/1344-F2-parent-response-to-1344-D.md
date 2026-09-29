# 1344-F2: parent response to the shelving RED review 1344-D

[1344-D](1344-D-shelving-red-review.md) returned REFINE with two additive blocking defects. The parent accepts both
and sends them to the author as revision 1344-C2. The 41 other leaves stay as they are.

1. **The chooser's counts, tested directly.** Using the existing spy technique of
   `tests/helpers/p14p3-fixtures.ts` (`rivalStep`'s `chooseIndustryPackage` spy), capture the real arguments during a
   tick of the genuine week-130 input. Then assert on them:
   - `searchIndustryPackages(...).choice` deep-equals `chooseIndustryPackage(...)`;
   - `affordable + unaffordable` equals the candidate count derived independently from the inputs (screenplay shapes
     × billings × negative scales × marketing menu size). 1329-A's 54 was one measured case, not a constant;
   - `viable <= affordable`;
   - `(choice === null) === (viable === 0)`.
   A second, decide-level case builds a partly cash-constrained week: cash sits between the cheapest and the dearest
   candidate, and no affordable candidate is viable. That week must read cashBlocked, with the count unchanged.
2. **Rival promise authoring.** The test covers the exported `rivalPromiseProjectCandidates(state, studioId)` (parent
   decision in 1344-X2), which returns the issuer's non-produced, non-shelved screenplays sorted by id, first two.
   Required cases: a shelved screenplay is absent; without shelving, the result equals today's selection (the first
   two non-produced by id).

Non-blocking notes adopted in the same revision:
- test 3's second case asserts its own premise (no economic rejection for that studio in the window);
- the Save43 validator also rejects a rejection entry with count 0, one naming a non-active or non-ready ordinal, and
  a shelved entry with `retryWeek <= week`.

The Save43 sweep measurement (1344-M) stays where 1344-A §8 puts it, after production. The implementation review
must diff the production shapes of `screenplayShelving` and the receipt against the tests' local future-shape
types, because the type gate cannot catch a field-name drift there.
