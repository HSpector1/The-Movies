# 785 — parent mutation controls for the C.2a tick wiring (targeted, disposable, not committed source)

Run by the parent 2026-09-25 ≈21:00 CEST in a disposable detached worktree
(`/Users/zacheryspector/The-Movies-c2a-wiring-control`, removed afterwards) holding the FULL implementation
(`ad154f5b` src) plus the coverage-addition test files of record 784, with ONE edit to `src/core/tick.ts`'s
final return. Command each time: `node_modules/.bin/vitest run tests/p14c2a-core-lifecycle.test.ts
--minWorkers=1 --maxWorkers=1` (the second with `-t "tick-wiring"`).

Why: record 784's control ran the new tick-wiring case against the SCAFFOLD, where it fails because
`retirementRecordFor` throws — that proves nothing about the wiring specifically.

| mutation | result | reading |
| --- | --- | --- |
| M1 wiring removed: `return advanceTalentMarketWeek(advancePromisesWeek(withBonds))` | 5 failed / 8 passed: A1, A2a, A2b, A5 and the tick-wiring case, each `AssertionError … expected undefined …` (no record) | GENUINE discrimination: with the helper now driving `tick()` alone, removing the wiring is caught |
| M2 lifecycle AFTER market: `advanceCareerLifecycleWeek(advanceTalentMarketWeek(…), birthdays)` | the tick-wiring case fails, but by `Error: talentMarket: case for "authored-0000" names employment row "synthetic-tick-wiring-case", which does not exist` (`decisionWeekOf`, `talentMarket.ts:125`) | NOT the intended assertion: the case injected a market case naming a nonexistent employment row — an unlawful state that the correct order merely invalidates before anything dereferences it. Sent back for a lawful construction (real contract, real discovered case); the parent re-runs M2 on the rebuilt case |

## Re-run on the rebuilt case (≈21:20 CEST), disposable worktree `…-c2a-wiring-control2` at `ad154f5b` src

`tests/p14c2a-core-lifecycle.test.ts` sha256 `5994ec18…` (record 784 §1: real genesis director, real
208-week interval shortened to end at 52 — labeled SYNTHETIC, lawful shape — real natural case discovery at
week 40, real birthday at week 45 via `nextBirthdayWeek`, bare `tick()` only, no injected market rows).

| control | tick-wiring case | reading |
| --- | --- | --- |
| unmutated | 1 passed | baseline |
| M2 lifecycle AFTER market | FAILED on `AssertionError: the SAME tick must invalidate the REAL case — proving the lifecycle step ran BEFORE the market step (777 §4): expected null to be 'invalidated'` | the intended ordering assertion now discriminates |
| M1 wiring removed | 5 failed / 8 passed (A1, A2a, A2b, A5, tick-wiring) | unchanged, genuine |

Worktree removed afterwards; no source edit left anywhere.
