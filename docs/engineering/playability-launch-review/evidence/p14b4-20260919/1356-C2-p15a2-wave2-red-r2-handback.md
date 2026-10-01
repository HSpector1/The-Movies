# 1356-C2: P15A.2 Wave 2 slice 2a RED, revision r2 (answers 1356-D and 1356-F2)

**Status: DONE, unexecuted.** I wrote r2 by reading; no vitest, tsc, node or tsx ran. In the scratch tree `tree/`, branch `main` moves from 138609b (r1) to adeee94 in nine commits, tests only. Branch `ref` stays at 61f13b2. The real HEAD is c9405c3e, with only docs changed since ff05430d, and both r2 patches pass `git apply --check` there.

## Changes from 1356-D/F2
| F2 item | Change | Leaves or files |
|---|---|---|
| 1 (R1) | Two runs whose status and weekIndex contradict the arithmetic: `completed` at W−2 reads running, `active` at W−30 reads ended | `rank-adapter-player-films` |
| 2 (R2) | A memo, `rivalResearchWindow()`, follows the measured S8 route to the first week W > 260 in which a rival booked `researchSpend` and still holds an active project (bounded at 572). The rival leaf checks every rival at W and names the payer | new control `rank-fixed-cost-rival-research-window-premise`; `rank-fixed-cost-rival-operating-cost` |
| 3, one list | `tests/helpers/p15-roots.ts` exports `P15_ROOTS` (`['p15Sequence', 'powerRanking']`), `stripP15` and `p15Rows`; both files import it | helper; archive and isolation files |
| 3, allocation | Sequences are distinct and ascending; `next` is 1 more than the largest value over every row of every P15 root; contiguity and per-week allocation are asserted only while no sibling root holds a row | `rank-record-sequence-allocation` |
| 3, RED 10 | Roots outside `P15_ROOTS` stay byte-identical; each sibling root matches once `p15DomainSequence` is removed and keeps its rows' order; `next` falls by exactly the record count | `rank-step-only-writes-archive` |
| 3, declared | Both headers list RED 9 beside `ARCHIVE_STEP`, plus five leaves found in my own audit | list below |
| 3, audit | `renumber` assigns sequences above every P15 row. The week-only-id leaf picks a record whose sequence differs from its week. Boundary case (c) migrates the genuine Save37 week-103 save of the C3 corpus and no longer downgrades a ticked state | 5 cadence leaves, `-cadence-boundary`, `-id-week-only` |
| 4 | Non-empty premise | `rank-record-phase-triple` |
| 5 | The ceiling is PROVISIONAL at 2 h (r1: 4 h) and unmeasured. The report adds `campaignMs`, and the header says to run the file alone, outside the broad core allowlist | `rank-bounded-harness` |

**R2 route.** No leaf measures rival research on the memo's default seed. The S8 route does: seed `p13b-s8-bridge-probe-01`, with a player Laboratory committed at week 0. `bridge-p13b-s8-rivals` pins nonzero rival `researchSpend` at week 288, the genuine week-280 fixture in p14r3 carries rival projects, and r01 researched from week 265 to 276 when it was last measured. r2 therefore uses this seeded campaign and needs no constructed state. If the route stops paying by week 572, the premise control fails by name.

**Declared, re-pinned at a sibling landing:**
- `ARCHIVE_STEP`, at a later save step.
- RED 9 and `rank-step-record-is-law-snapshot`: P15B's condition step books a rival loan principal at W, after the ranking.
- `rank-root-downgrade-round-trip-claims-less`, `-recorded-quarter-refuses` and `-frozen-builders-refuse`: a sibling root that holds rows refuses the same downgrade, and its own message may come first.
- `rank-root-migration-empty` and `-genuine-below-step-capture`: P15B's step also adds zero loan movements to rival periods (1357-A §4.2).

## Files and leaves (72: 70 RED, 2 controls)
| File | Leaves |
|---|---|
| `tests/p15a2-power-ranking-archive.test.ts` | 69: 67 RED; controls `rank-root-frozen-builder-headless-control` and `rank-fixed-cost-rival-research-window-premise` |
| `tests/p15a2-power-ranking-archive-isolation.test.ts` | 2 RED (RED 9, 10) |
| `tests/p15a2-power-ranking-archive-harness.test.ts` | 1 RED (RED 17) |
| `tests/helpers/p15-roots.ts` | no leaves |

§8 coverage and the save-version approach stand as in 1356-C. Items 18-27 stay deferred to slice 2b.

## Reference
Unchanged: `reference/1356-reference-r2.patch` is byte-identical to r1 (sha256 83cb2a59…). The adapter already decides by arithmetic, and the rival fixed cost already equals `rivalWeeklyOperatingCost`. Every other r2 change is test-only.

## Reference run (parent)
```
T=/Users/zacheryspector/studio-scratch/1356-red/tree; cd $T && git checkout -q main
npx vitest run --project core tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts   # RED: 69 fail, 2 controls pass
git apply /Users/zacheryspector/studio-scratch/1356-red/reference/1356-reference-r2.patch
npx vitest run --project core tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts   # expect 70 pass, 1 fail (the capture leaf)
npx vitest run --project core tests/p15a2-power-ranking-archive-harness.test.ts   # alone; campaignMs sets the budget
git checkout -- src && git clean -fdq src
```

## Names the other REDs must share
The names listed in 1356-C, plus the helper: `P15_ROOTS`, `stripP15(state)` and `p15Rows(state, roots = P15_ROOTS)`, where a row is any object with a numeric `p15DomainSequence`. Each later RED adds its root key to `P15_ROOTS` at its landing; 1355-C names `sharedMarket`. RED 10 strips only `p15DomainSequence` from sibling rows. That holds today because P15B keeps its own `nextEvent` and `nextLoan` ids (1357-A §4).

## Not decided
1. The capture path and its sha256 pin, as in 1356-C.
2. The harness budget, which the parent sets from the first single-file run (1353-F3).
3. The reference has not been swept against the existing Save43 pins.
4. r2 has not been compiled: I checked the types by reading, so the parent's tsc gate is the first compile.
