# 770 — the missing causal link, measured, and one label corrected

Record 769's probe measured `talent.age >= 30` while its own comment claimed to copy `isProven`'s
"exact predicate". The real predicate (`src/core/talentMarket.ts:690-692`) is a DISJUNCTION:

```ts
careerIdentity(talent).identityDisciplines.length > 0 || talent.age >= 30
```

A person can already be proven BEFORE turning 30, by holding a real credit in a capable discipline
(`careerIdentity`, `talentSummary.ts:543`: capable is `roleOVR >= 60`, proven is capable AND
`workHistory > 0`). **Measuring a birthday establishes correct aging; it does not establish that
`isProven` changed then.** 769 overclaimed when it called the whole attribution measured on that
evidence. Not a production defect — an evidence gap, and it is now closed.

Probe archived at `770-isproven-probe.test.ts.txt`, run alone, asserting nothing, removed from
`tests/`.

## The measurement

Both subjects, `seed-b`, sampled every week from 0 to 211:

| | `…r01-4` | `…r01-2` |
| --- | --- | --- |
| anchor | `authored_exact_week`, **28 at week 0** | same |
| first week the CREDIT term became true | **never (null)** | **never (null)** |
| first week the AGE term became true | **104** | **104** |
| first week `isProven` became true | **104** | **104** |
| `identityDisciplines` at weeks 0 / 103 / 104 / 211 | `[]` / `[]` / `[]` / `[]` | same |

**The credit term is false at every one of the 211 weeks.** So `isProven` flips at week 104 and it
flips on the age term alone. The disjunction's other arm never fires for either person.

## The link to the promise family, read at the branch itself

`authorRivalPromise` (`talentMarket.ts:1325`) is a one-line branch on the full predicate:

```ts
for (const attachment of isProven(state, talentId) ? [p1] : [flexible, p1]) { … }
```

Measured at the branch, for both subjects: **week 103 → `[LEAD_OR_SIGNIFICANT_ROLE_COUNT, APPEARANCE_COUNT]`;
week 104 → `[APPEARANCE_COUNT]` only.** The flexible `castRoleCount / leadOrAntagonist` family stops
being offered at exactly the crossing week.

So the chain the attribution asserted is now evidenced end to end at every link: **entry anchor 28 at
week 0 → stored age crosses 30 at week 104 → `isProven` flips at 104, by age, the credit term never
having fired → `authorRivalPromise` drops the flexible family → a different `promiseCastSlots` mask →
the moved seating expectations.** The downstream links beyond the branch are the ones the attribution
already recorded per case; they are reused, not re-measured, and no reviewer was re-dispatched.

## The label correction, and the measurement is stronger than the correction

769 wrote "6 people under 30" and then used it as "capable-but-unproven". Those are different
populations, because the credit term can prove someone the age term has not reached. Measured at
week 211 in an 84-person world:

| | count |
| --- | --- |
| under 30 | 6 |
| **proven by CREDIT only** | **0** |
| proven by AGE only | 72 |
| proven by both | 6 |
| **not proven at all** | **6** |

The two numbers coincide here, and the reason is worth more than the coincidence: **nobody in this
population is proven by credit alone.** The credit arm of the disjunction is inert in this world, so
`isProven` behaves as a pure age test, and "under 30" happens to equal "unproven" by measurement
rather than by definition. The general label stays as Current Ops states it: they are different
populations and only a measurement may equate them.

**And this sharpens D1 rather than softening it.** If the capable-but-unproven archetype is reachable
almost only by being under 30, then the pool drain is not one contributor among several to the
flexible branch's decay — it is very nearly the whole mechanism. That strengthens the recorded
recommendation to treat replenishment as a first-class dependency of the acceptance criterion, not a
side effect of retirement.

## What this record does not claim

It does not re-verify the downstream seating results; those remain as the attribution measured them
per case. It does not measure any other seed or any other population. `provenByCreditOnly: 0` is a
property of this world at this week, not a law.
