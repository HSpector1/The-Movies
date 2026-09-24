# 760 — T0 corpus reachability, measured, and one correction to the audit

Source `f2c28f40`. Probe archived at `760-c1-t0-corpus-probe.test.ts.txt`. Run alone by positional
filename, twice, never inside a suite pass. It asserts nothing about the product and writes no
artifact; it prints. Removed from `tests/` after use, so no suite collects it.

Record 759-C replaced the expansion's corpus axes with five measured ones. This record establishes by
BUILDING them which are reachable and what each world actually contains, before a minter commits
bytes. Seed `p14c1-corpus-01`.

## All five axes are reachable

| axis | route | measured |
| --- | --- | --- |
| 1. `hollywood === null` | `generateWorld(seed)` | hollywood null, tick 0, 60 talent, ALL 60 ages fractional, save V32 accepted, 258956 bytes |
| 1b. null hollywood at tick > 0 | `tick(bare)` | **TICKED to 1, hollywood still null.** So axes 1 and 2 separate fully rather than conflating |
| 2. `market.tick === 0` with hollywood | `p13aGeneratedStudio(seed)` | tick 0, `originWeek` 0, 84 talent, **24 rival-employed rows**, save V32, 383685 bytes |
| 3. an AUTHORED person | `createTalent` | talent 84 → 85. `createCustomTalent` and `createBalancedTalent` need `fame` and `presetId` respectively and are not needed |
| 4. a SCIENTIST | `p13aResearchReady()` | **1 scientist.** An existing accepted harness builder, not a route this record invents |
| 5. near the top of the draw | the held fixture | this seed tops out at 61.93, BELOW the held fixture's 68.28, so axis 5 stays satisfied by `genuine-v32-owes-two-p1` and needs no new world |

The scientist route needed correcting twice before it ran. `recruitScientist` takes
`{ kind, laboratoryFacilityId }`, not a `scientistId`, and it refuses with "Complete this Research
Laboratory before recruiting its Scientist" until the lab is built. `p13aResearchReady`
(`src/harness/p13a/fixtures.ts:26-33`) already does the whole chain and advances to week 260.

## THE CORRECTION: integer stored ages already exist without any authored person

759-C §3 called an authored person "the only lawful way to reach the `[18, 70]` edge" and, in
amendment 11, "the only lawful route to an integer stored age". The first half stands. **The second
half is wrong, and the probe measured it.**

The fresh-hollywood world at tick 0 holds **80 fractional and 4 INTEGER ages** with ZERO authored
people. The cause is `src/core/hollywood.ts:221`:

```ts
person = {...person, age: Math.max(28, person.age), ...}
```

`enterRival` raises any rival hire drawn below 28 to **exactly 28**, an integer. So integer stored
ages arrive through ordinary rival entry in every world, and C.1's validator cross-check meets them
on axis 2 rather than only on axis 3.

That matters for two reasons. It is a fifth age-write consequence the expansion's census did not
describe even after A1 corrected it, since `hollywood.ts:221` was listed as a write site without
anyone noticing it MANUFACTURES integers. And it means the FLOOR decision (A5) is already exercised
against integers by the cheapest fixture in the corpus, not only by the authored one.

Axis 3 keeps its place: it is still the only route to the authored `[18, 70]` clamp and the only
world carrying `authored: true`.

## What the corpus will be

Four new worlds plus the one already held:

1. `genuine-v32-bare-world` — hollywood null, tick 0. The axis most likely to find a real defect,
   because a recording boundary read from `hollywood.originWeek` crashes here and one read from
   `market.tick` does not.
2. `genuine-v32-bare-ticked` — hollywood null, tick 1. Separates "null hollywood" from "week zero",
   which a single combined world cannot.
3. `genuine-v32-fresh-tick0` — hollywood present, tick 0, 24 rival rows, 4 manufactured integer ages.
   Distinguishes a correct `migrationWeek` from one defaulted to zero.
4. `genuine-v32-authored` — one authored person at the `[18, 70]` edge with `authored: true`.
5. `genuine-v32-owes-two-p1` — ALREADY HELD (`6d93e62c`), tick 104, rival-employed, age top 68.28.

A scientist world is minted as part of 4 or separately, per the minter's own assertion; the
`p13aResearchReady` route reaches week 260, which is a different and useful tick from the others.

## Standing qualification

These are measurements at `f2c28f40` on one seed. Byte counts and counts of people are properties of
this seed and are not laws. No baseline was touched: no `record-check.mjs`, full-core or `test:ui`
run occurred in the probe's window.
