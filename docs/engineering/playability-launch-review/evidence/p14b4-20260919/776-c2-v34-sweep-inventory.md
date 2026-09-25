# 776 — the V33 → V34 sweep inventory, keyed on the VALUE

Measured by the parent at `f2d862d7` (src identical to `f3652852`), before any C.2 writer starts.
Record 763's rules carry over unchanged: grep the value; the frozen/live split is decided per LINE; the
inventory is the starting list, and the sweep is finished only when every test touching the bumped
surface has RUN.

Ownership, as for C.1: the production writer takes `src/`, `bridge/`, `ui/`, `scripts/`; the test
author takes `tests/`, including the shared helpers. Neither crosses.

## One delegated change that shrinks every later bump

C.2b, C.3 and C.4 each plan their own save step. Record 763's R7 class (live-route callers of
`migrateToVn`) cost 132 edits at C.1 and measures **145 lines in 54 files** now. The writer adds ONE
exported alias beside the newest step, `migrateToLive` (typed to the live envelope), and every line whose
meaning is "lift to what the live writer stamps" calls it. A line whose meaning is "lift to exactly
V33" keeps `migrateToV33` and says why. The per-line decision is made once, here; the next bump moves
one definition instead of 145 lines. Class: DELEGATED IMPLEMENTATION DECISION. No other indirection.

## The classes

| | class | where (at `f2d862d7`) | count | rule |
| --- | --- | --- | --- | --- |
| S1 | the live constant | `src/core/save.ts:6437` | 1 | 33 → **34** |
| S2 | the dispatch ceiling | `save.ts:5323` | 1+ | add a `=== 34` arm; any "1 through 33" message moves |
| S3 | type surface | `save.ts:534-575`, `:6441-6445` | 4 | `SaveFileV34`, `GameStateV34`, the `SaveFile` union, `makeSave`'s return type |
| S4 | downgrade guards | `save.ts:7358 … 8265` and every other `=== 33) throw` arm (18 at C.1) | ~18 | each gains a `=== 34` sibling naming the lifecycle root |
| S5 | conversion arms | `save.ts:8432, 8586, 8670, 8771, 8819, 8896, 8983` | 7 | each `=== 33) return … convertV33ToV32` arm gains a `=== 34` sibling routing through `convertV34ToV33` |
| S6 | new root machinery | `save.ts` after `:9257` | new | `validateSaveV34`, `stripV34Root`, `validateCareerLifecycleRoot`, `convertV33ToV34`, `convertV34ToV33`, `migrateToV34`, `migrateToLive` |
| S7 | `migrateToV33` live-route lines outside `save.ts` | src/bridge/ui: `bridge/runtime-checkpoint.ts:6,868`; `bridge/runtime/campaign-library.ts:5,48,127`; `bridge/session.ts:41,140`; `src/core/index.ts:1317-1320`; `src/harness/d16/run-d17b-continuation.ts:37,183`; `src/harness/d16/run-d17b-week86.ts:35,124`; `ui/src/engine/adapter.ts:112,3796,3808,3822` | 17 | per line; these are all live routes today |
| S8 | the bridge checkpoint envelope | `bridge/runtime-checkpoint.ts:7, 461, 476, 865-866, 1014` | 6 | `SaveFileV33` alias and the `!== 33` gate move to the live envelope |
| S9 | test-side `migrateToV33` lines | 43 files under `tests/` | ~128 | per line (test author) |
| S10 | test literals for the live version (`toBe(33)`, `saveVersion: 33`) | `tests/` | **88** | per line: an assertion that the LIVE writer stamps 33 moves; a `validateSaveV33` of a V33 fixture stays, with its reason |
| S11 | the core barrel | `src/core/index.ts` | ~8 | re-export the V34 surface and the new lifecycle module |
| S12 | fixture tooling | `src/harness/p14/legacy-v28-fixtures.ts:25,40` | 2 | the emitter's envelope union gains V34 only if it emits live saves; decide per line |

## THE ENUMERATED ROOT-STRIP LISTS (NEXT772: a value grep does not find these)

Each list names every root a frozen reader must not see. Each must GROW by `careerLifecycle`. The
failure mode is an OMISSION, so it shows up only when the test runs.

| owner | site | what it does today |
| --- | --- | --- |
| writer | `src/core/save.ts:9003` `stripV33Root` | chained by construction; `stripV34Root` is new |
| writer | `src/harness/roster-wall/historical-control.ts:47, 50, 69, 89` | lifts a historical control to live (builds `talentProvenance`) and strips the P14 roots on the way down. It must build the empty lifecycle root and strip it |
| test | `tests/_historicalCurrent.ts:9-12, 23` | `migrateToCurrentControl` hand-builds a LIVE envelope (`saveVersion: 33`) and `liftHistoricalState` must add the empty lifecycle root |
| test | `tests/contracts/_v14Contract.ts:416-431` | deletes each P14 root before a frozen walk |
| test | `tests/facility-move-demolish.test.ts:831-848` | forged V11 deletes each P14 root |
| test | `tests/p13b-r07-save-v25.test.ts:169-183` | strips each P14 root |
| test | `tests/property-state-v13.test.ts:143` | `withoutTalentProvenanceAndAge` compares every other root byte-for-byte; decide whether `careerLifecycle` joins the exclusion (it is empty in that test's worlds unless one retires) |
| test | `tests/p14b5-relationships.test.ts:227, 231` | `stripRoot` removes `relationships` for a V30 view; check whether a V34 state reaches it |

## Not sweep sites

- The C# DTOs carry no save version (measured at C.1); a save bump regenerates nothing under `generated/`.
  C.2a moves no projection, so `git status generated/` must stay EMPTY. If it does not, stop and report.
- Evidence records under `docs/` that mention `migrateToV33` are history and never move.
