# 761 — the outgoing V32 corpus is minted, and it carries the Owner's crossing case

Minted at `ace2773a`, which `git ls-remote origin wip/headless-program-20260916-ts` returned at mint
time, so every artifact records a published recovery sha rather than a local-only one. The minter is
archived at `761-mint-v32-c1-corpus-minter.test.ts` and removed from `tests/`, so no suite collects
it. Its bytes hash to `08fa86e0b24a0628dc27fa06b705a9d929bf61c308fb90fc448a0ceb653bacff`, which is
the value each provenance file records for itself.

Output: `tests/fixtures/p14/genuine-v32-c1-corpus/`, five worlds plus `MANIFEST.json`. The minter
refuses to overwrite an existing directory before it produces a byte, builds and asserts all five
worlds before it creates the directory, and re-reads every artifact from disk to prove the axis
survives the save/load round trip rather than only the in-memory state.

## What was minted, measured

| fixture | tick | hollywood | talent | fractional / integer ages | age range | notes |
| --- | --- | --- | --- | --- | --- | --- |
| `genuine-v32-bare-world` | 0 | **null** | 60 | 60 / **0** | 21.67–61.93 | no rival rows, no `originWeek` |
| `genuine-v32-bare-ticked` | **1** | **null** | 60 | 60 / 0 | 21.67–61.93 | one real tick, industry still null |
| `genuine-v32-fresh-tick0` | 0 | present | 84 | 80 / **4** | 21.67–61.93 | 24 rival rows, `originWeek` 0 |
| `genuine-v32-authored` | 0 | present | 86 | 81 / 5 | **18**–61.93 | 2 authored, the crossing case |
| `genuine-v32-scientist` | **260** | present | 85 | 84 / 1 | 20.68–**68.28** | **1 scientist**, 40 rival rows |

Two things fell out of the build that the plan did not predict.

**The scientist world reaches the top of the age draw on its own.** `p13aResearchReady` runs its own
seed, and its population tops out at 68.279, the same maximum as the held `genuine-v32-owes-two-p1`.
Record 760 planned axis 5 as satisfied only by the held fixture. It is now covered twice, at two
different weeks (104 and 260), which is better than planned and cost nothing.

**The authored world holds five integer ages, not one.** Four arrive through ordinary rival entry
via `src/core/hollywood.ts:221`, exactly as record 760's correction measured, and the fifth is the
authored clamp-edge person at 18. So the FLOOR decision (A5) meets integers in three of the five
worlds without any authored person being required.

## The Owner's worked case is committed into the fixture, not only into prose

`genuine-v32-authored` carries `authored-0001` at **29.75** at week 0, and its provenance records
the prediction the RED will be written against:

```
pinnedFormula:            age(w) = floor(a0 + (w - w0) / 52)
weeksToCrossing:          13
predictedCrossingWeek:    13
predictedAgeAtWeekBefore: 29   (week 12)
predictedAgeAtCrossing:   30   (week 13)
crossingIsProvenAtMint:   false
disprovedFracTimes52:     39
```

Both 30 and 29.75 are exactly representable in IEEE double, so `(30 - 29.75) * 52` is exactly 13
with no rounding, and the minter asserted that before writing. The refuted arithmetic is recorded
beside the correction: `frac(29.75) * 52 = 39`, three quarters of a year out of phase.

That person crosses `talentMarket.ts:690`'s `isProven` test at week 13, and `priorityOrder` branches
on it, so this is a market decision rather than a display change. The number is now committed before
any implementation exists, which is the only ordering under which the prediction can falsify the
implementation rather than the reverse.

`authored-0000` sits at exactly 18, the authored clamp's lower edge. `createTalent`
(`src/core/actions.ts:748`) validates `[18, 70]` and stores the value unrounded, so both land
verbatim.

## What this corpus does not cover

- **No V33 fixture exists and none should yet.** These are outgoing artifacts by definition.
- **The held `genuine-v32-owes-two-p1` is not re-minted.** It stays the promise-shaped world.
- **Byte counts and people counts are properties of these seeds**, not laws.
- **No baseline run occurred in this window.** No `record-check.mjs`, full-core or `test:ui` run
  happened while the minter ran, so no measurement was disturbed.
- **Nothing here tests aging.** The corpus is the outgoing evidence a save step needs. The RED comes
  next, authored independently against expansion 758 as amended by its §9 and §10.
