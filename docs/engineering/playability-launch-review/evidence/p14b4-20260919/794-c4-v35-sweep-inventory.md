# 794 — the V34 → V35 sweep inventory, keyed on the VALUE

Measured by the parent at `ff7b9ac1` (src identical to the C.2a checkpoint `c34b6674`), before any C.4 writer
starts. Record 763's and 776's rules carry over: grep the value, decide frozen versus live per LINE, and
count the sweep finished only when every test touching the bumped surface has RUN. Ownership as for C.2a:
the writer takes `src/`, `bridge/`, `ui/` and `scripts/`; the test author takes `tests/`, including the helpers.

## 1. What the `migrateToLive` alias bought (776's delegated change, measured)

`migrateToV34` now appears on 4 test lines in 1 file and outside `save.ts` only in the barrel
(`src/core/index.ts:1323-1327`). At C.2a the same class cost 145 lines in 54 files. The live-route class is
closed except for the `migrateToLive` definition itself.

## 2. The classes

| | class | where (at `ff7b9ac1`) | count | rule |
| --- | --- | --- | --- | --- |
| S1 | the live constant | `src/core/save.ts:6457` | 1 | 34 → **35** |
| S2 | dispatch and "through 34" messages | `save.ts`, `=== 34` mentions | 29 lines | add the `35` arm; move messages |
| S3 | type surface | `LiveSaveFile` (`save.ts:557`), `SaveFileV35`, `GameStateV35`, the `SaveFile` union, `makeSave` | ~5 | 793 §2 |
| S4 | downgrade guards | every `=== 34) throw` arm in `save.ts` | 18 | each gains a `=== 35` sibling naming the cohort receipts |
| S5 | conversion arms | every `=== 34) return` arm in `save.ts` | 10 | each gains a `=== 35` sibling through `convertV35ToV34` |
| S6 | new machinery | `save.ts` after `migrateToLive` | new | `validateSaveV35`, `stripV35Cohorts`, `convertV34ToV35`, `convertV35ToV34`, `migrateToV35`; `migrateToLive` → V35 |
| S7 | **the root opener split** | `initialCareerLifecycle` callers: `worldgen.ts:812` (live), `save.ts:9458` (the FROZEN V33→V34 conversion), `historical-control.ts:51` (live lift) | 3 src | `initialCareerLifecycle` becomes the LIVE opener (`cohorts: []`). The frozen `convertV33ToV34` stops calling it and writes the V34 literal `{ boundaryWeek, records: [] }`, because a frozen conversion never calls a live opener |
| S8 | the barrel | `src/core/index.ts:1323-1327, 1373, 1606, 1614` | ~5 | export the V35 surface, `CohortReceipt`, the new lifecycle exports |
| S9 | test `migrateToV34` lines | 1 file | 4 | per line |
| S10 | test literals for the live version (`toBe(34)`, `saveVersion: 34`, `=== 34`) | `tests/` | **77 lines / 44 files** | per line: an assertion that the LIVE writer stamps 34 moves; a V34 fixture validated as V34 stays, with its reason |
| S11 | `validateSaveV34` in tests | `tests/` | 170 lines / 42 files | per line: a check of what the live writer emits moves to V35; a check of a genuine V34 fixture stays |
| S12 | `GameStateV34` / `SaveFileV34` in tests | 14 files | — | per line, same split |
| S13 | test callers of `initialCareerLifecycle` | 11 files (`_historicalCurrent.ts:27`, `save.test.ts:233`, `p14b4-save-v30-compatibility`, `bridge-owner-ux-projection20-migration`, `p14b3-rule-revision`, `bridge-p06-checkpoint-recovery`, `cash-ledger-checkpoint-v11`, `bridge-p14b2-checkpoint`, `c2a-m2-sets-save`, `p14bf2-acting-discipline`) | ~14 lines | each means either "the live root" (follows S7 unchanged) or "exactly the V34 root" (writes the V34 literal); decide per line |
| S14 | literal lifecycle roots in the C.2a suites | `tests/p14c2a-consumers.test.ts` (17), `tests/p14c2a-save-and-settlement.test.ts` (8) | 25 lines | a live state gains `cohorts: []`; a V34 envelope stays V34 |

## 3. The enumerated strip lists (NEXT772's lesson: a value grep does not find these)

All four delete the WHOLE `careerLifecycle` root after asserting `records` is empty. They keep working
structurally, but each must ALSO assert `cohorts` is empty. Otherwise a helper silently drops receipts while
the entrants they describe stay in `state.talent`.

| owner | site |
| --- | --- |
| writer | `src/harness/roster-wall/historical-control.ts:93-101` (the downgrade half; the lift at `:51` follows S7) |
| test | `tests/contracts/_v14Contract.ts:437-440` |
| test | `tests/facility-move-demolish.test.ts:853-854` |
| test | `tests/p13b-r07-save-v25.test.ts:184-189` |
| test | `tests/property-state-v13.test.ts:146-151` spreads the root and resets `boundaryWeek`, so it carries `cohorts` through; check its comparison still means what it says |

## 4. Behavioural blast radius, stated BEFORE the writer starts

C.4 changes behaviour in every hollywood world that reaches a cohort week and has a request. The youth floor
fires at week 52 in any world that has a film profession with nobody under 30. Seed `p14c4-demo-03` has no
writer under 30 at week 0, so this is common. From that week, `state.talent`, `state.freeAgents`, the
hiring-market pool (so every later rotation sample), rival staffing picks and anything that digests them may
change. The companion accepts this: "changes later hiring-market samples deterministically; that is accepted
behavior, not a defect". Every changed test result is still ATTRIBUTED before any expectation moves, and the
matched-pass prediction must bound it structurally: a new failure is admissible only in a test whose
hollywood world reaches week 52 or later and reads talent, free agents, listings, rival staffing or a digest of
them after that week.

## 5. Not sweep sites

The C# DTOs carry no save version, so `git status generated/` must stay EMPTY; if it does not, stop and report.
Evidence records under `docs/` are history and never move.
