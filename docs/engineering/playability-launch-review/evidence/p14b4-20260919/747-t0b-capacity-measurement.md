# 747 — T0b capacity measurement: the Owner's 3/1/2 case is blocked by a product law, and 2/0/2 reaches it

Source `4cba7090`. Probe archived at `747-t0b-capacity-probe.test.ts.txt`,
sha256 `f1f9dd7c6e332d6e795eab2d85c102f3455372506ecc2fbc64a965d92315bccf`.

Record 744 §7 carried a HYPOTHESIS: that raising the archived `part-served-p1` mint route's promise
count from 2 to 3 would pass the feasibility gate, giving the world the Owner's edge case needs.
This record reports the measurement instead. The hypothesis is FALSE, and the reason is a product
law, not a fixture-construction shortfall.

## What was measured

The probe rebuilds the archived route (record 722, lines 224-260) verbatim through the throwaway
greenlight, then reads `promiseFeasibility` directly across a count and window grid at the attach
week, then drives the real freeze.

**Grid, at probe week 97, contract start 104, term 104 weeks:**

| count | window 90 | window 104 | window 130 |
| --- | --- | --- | --- |
| 1 | REASONABLY_ACHIEVABLE | REASONABLY_ACHIEVABLE | IMPOSSIBLE (due week outside the contract) |
| 2 | REASONABLY_ACHIEVABLE | REASONABLY_ACHIEVABLE | IMPOSSIBLE (due week outside the contract) |
| 3 | FRAGILE (needs a picture not yet commissioned) | FRAGILE (same) | IMPOSSIBLE |
| 4 | FRAGILE (same) | FRAGILE (same) | IMPOSSIBLE |

Two facts fall out of the grid before any lever is tried. The window cannot be widened past the
contract: 130 weeks against a 104-week term reads IMPOSSIBLE on every count, including count 1. And
the count-3 bottleneck is the existingPath gate, which `promiseFeasibility` tests AFTER the
spare-picture buffer gate (`src/core/promises.ts:437-442`), so the buffer is not the constraint. The
whole gap is `existingPath`.

## The three levers, each measured

`existingPath = seatedPreFirstTake + unproducedScripts + (stockGreenlightAvailable ? 1 : 0)`
(`src/core/promises.ts:429-431`).

**Stock greenlight.** Already contributing 1. No headroom.

**Unproduced scripts.** Unavailable. `commissionScript` on this world throws
`script development: commission rejected — screenplay development is not managed`
(`src/core/scriptDevelopment.ts:219-221`). Every fixture in the pre-b7 corpus is built on
`p13aGeneratedStudio`, whose screenplay development is not managed. Reaching this lever means
changing the world shape the entire corpus shares, which is a larger change than the Owner's edge
case asks for.

**A second seated production.** This is where the product law lands. Two greenlights both seating the
target refuse:

```
applyActions: greenlight talent "t-act-09" is already engaged in an active production (exclusivity, M16)
```

The first attempt refused on the shared director; signing a second writer, director and craft moved
the refusal onto the target actor itself. A person cannot be seated in two concurrent productions, so
`seatedPreFirstTake` for one beneficiary is capped at 1 by M16 exclusivity.

`existingPath` therefore maxes at 2 on this world shape, and a promise of count 3 cannot be
REASONABLY_ACHIEVABLE.

## Attaching anyway does not help, and the freeze is where it dies

`attachPromise` ADMITS a FRAGILE draft: the probe attached count 3 at window 90 and 104 and got a
promise back. The market freeze then refuses to bind it. Driven to the real freeze week:

```
attachedClassification: FRAGILE
promiseStillPresent:    true
contractId:             null
bound:                  false
employmentResolves:     false
```

An unbound promise is useless for the Owner's case. `waiverAccepted`'s rule 2 ("nobody took up this
promise, so there is no commitment to waive") fires at `src/core/promises.ts:931`, four rules before
the count rule the case exists to exercise. The fixture would test the wrong refusal.

## What reaches the Owner's case instead

The Owner asked for a substitute count that is positive and still insufficient, to separate that
protection from the zero-count case which is also invalid under the basic count rule. The separation
needs a remaining obligation of at least 2. It does not need the specific numbers 3 and 1.

`remaining = count - progress`. The archived route already mints a count-2 promise that classifies
REASONABLY_ACHIEVABLE and binds for real; `part-served-p1` then films one take to reach progress 1.
Stopping the route at the freeze instead leaves count 2, progress 0, remaining 2, and a substitute of
count 1 is then positive and insufficient:

> only 1 of the 2 pictures still owed would be covered

That is the Owner's protection, exercised, with the substitute count well inside the wire's
`minimum: 1`.

**What the substitution costs, stated rather than buried.** At progress 0 the remaining obligation
equals the original count, so this world alone cannot tell `count` from `count - progress`. That
discrimination is already pinned, on `part-served-p1` where count 2 and progress 1 make the two laws
diverge, by group13 of `tests/p14b7-promise-waiver.test.ts`, and both directions of it were proven by
defect injection at record 743. The two worlds are complementary: one separates the denominators, the
other separates positive-insufficient from zero-invalid. Neither replaces the other.

**What stays unreachable, and why.** A world with remaining 2 AND progress above 0 needs count 3,
which M16 exclusivity blocks on every fixture shape this corpus uses. Recorded as measured, not
declared impossible in general: a managed-screenplay-development world would lift the existingPath
ceiling, and if a later slice needs that shape it is available at the cost of diverging the corpus.

## Disposition of the probe

Run alone by positional filename, four times, never inside a suite pass. It asserts nothing about the
product and writes no artifact; it prints. No `record-check.mjs`, full-core or `test:ui` run occurred
in its window, so no baseline was touched and no published count includes it. Archived at
`747-t0b-capacity-probe.test.ts.txt` and removed from `tests/`, so no suite collects it.
