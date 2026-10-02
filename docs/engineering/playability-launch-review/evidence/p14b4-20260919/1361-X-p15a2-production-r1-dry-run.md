# 1361-X: dry run of the P15A.2 slice 2a production r1, the shared Save45 step

[1361-F](1361-F-parent-rulings-p15-save45-productions.md) ruling 1 has the parent measure each candidate in the
writer's tree. This run measures r1, the writer's one `src`-only commit on the archive of f3fe97d0:
- **The commit:** 1f2495a, tag `p15a2-r1`, in `/Users/zacheryspector/studio-scratch/1361-prod/tree`.
- **The patch:** [1361-p15a2-production-r1.patch](1361-stage/prod/1361-p15a2-production-r1.patch), sha256 0b654b03….
- **The handback:** [1361-E](1361-E-p15a2-production-handback.md).

**Result.** r1 passes every check slice 2a owns:
- `src` is type-clean on the root, UI and Bridge gates;
- all 72 leaves of the 1356 RED pass, the harness included, at 27% of its ceiling;
- both generator checks pass;
- the 1355 and 1359 REDs move only as the handback predicted (O3).

The 46 test-side type errors are Save45 pin fallout of the sweep's classes.

## How it ran

- **Script:** [run-1361-X.sh](1361-stage/prod/run-1361-X.sh) `p15a2-r1 r1`, alone in the heavy lane.
- **When:** 2026-10-02, 13:56:19 to 14:02:17 CDT, on Node v20.20.2.
- **The tree:** at the tag and clean before and after ([run-meta.txt](1361-stage/x-r1/run-meta.txt)).
- **Outputs:** in [1361-stage/x-r1/](1361-stage/x-r1/).

## Results

| Check | Result |
|---|---|
| Root type gate | exit 2: **0 errors in `src/`**, 33 in `tests/` |
| UI type gate | exit 2: 0 in `src/`, 4 in `tests/helpers` |
| Bridge type gate | exit 2: 0 in `src/`, 9 in `tests/` |
| 1356 archive and isolation files | **71 passed (71)** |
| 1356 harness, alone | **1 passed (1)**; `campaignMs` 81,692 against the 300,000 ms ceiling; `makeSaveMs` 800, `validateSaveMs` 417 |
| 1355's three files | 50 failed, 9 passed (59); at RED, 51 and 8 |
| 1359's three files | 40 failed, 76 passed (116), as at RED |
| `check:bridge-contract`, `check:bridge-contract:fixtures` | exit 0, exit 0 |

**1361-F ruling 7 holds by measurement.** The two `src` type-error sites that every reference carried are gone:
- `validateOpportunityWaiverLinks` now takes `GameStateV40`;
- the historical lift carries the empty P15 roots.

No gate reports an error in any `src/` file.

**The test-side errors** are of the sweep's kinds.
- **Root gate:** 18 TS2345, 10 TS2379, 4 TS2375 and 1 TS2322, in 25 files. The largest count is 6 in
  `tests/p14b4-material-evidence-core.test.ts`.
- **UI gate:** four, all in `tests/helpers`:
  - `p14c2b-fixtures.ts:69` and `p14c4-fixtures.ts:71`: a `SaveFileV45` where a helper expects `SaveFileV44`;
  - `p14c2c-fixtures.ts:29` and `p14c2rm-fixtures.ts:24`: a `GameStateV40` where the live `GameState` is now V45.
- **Bridge gate:** those four, plus five TS2379 in `tests/bridge-p14b2-trust`, `bridge-p14p3-directing-promises` and
  `bridge-p14p4p5-opportunities`.

Each error passes an older-era state or envelope where the live V45 type is required, or the reverse. These are the
sweep's S4 (typed APIs) and S5 (helper states) classes ([1361-R](1361-R-p15-save45-production-protocol.md) Part 3.3).
The P15 references carried 33 such sites on Save43 (1356-X F-3).

**The 1356 RED: 72 of 72 pass.**
- The capture leaf passes. `rank-root-migration-genuine-below-step-capture` reads the landed Save44 capture, which is
  45 − 1, and the step adds only `P15_ROOTS` keys.
- The two controls pass.
- **The harness** ran in 81,692 ms. The reference measured 57,710 to 66,546 ms on a quieter machine (1356-X2, X3). This
  run shared the machine with four reading agents under memory pressure: about 20 MB of pages free and 1.8 GB of
  swap in use at 13:58.

**The 1355 RED** moves as 1361-E O3 reads it.
- **One leaf now passes,** `market-validator-reconciles: refuses a stale p15Sequence.next by name`. It needs only the
  shared allocator check, which arrives with the first P15 root (1355-F2 item 1; 1361-F ruling 5).
- **Five leaves fail on a later reason.** Their first failure moved to `RED: GameState has no sharedMarket root
  (1355-A §3.3); the P15A.1 Wave 2 step has not landed`. Three of them had failed to load `p15Phases.ts`:
  `market-phase-version-immutable`, `market-live-window-stock-retire` and `market-root-append-canonical`. The other two
  are the `market-old-save` capture leaves, which had failed the version check (44 against 43). They now pass that
  check and stop at the missing root.
- **The four pin controls still pass:** the default seam, K1, K2 and M0A. The step changes no root they pin.

**The 1359 RED** still fails 40 and passes 76. Compared leaf by leaf with 1360-X s10
([p15c.json](1361-stage/x-r1/p15c.json)), exactly three leaves moved:
- **C2, C3 and C4** (`legacy-migration-empty-root`, `-before-boundary` and `-past-boundary`) had failed with "the route
  L captures are Save44, the live version".
- Their STEP now reads 45, so the Save44 captures pass the STEP − 1 check, and they fail with `RED: the state carries
  no campaignLegacy root (1359-A §5: a top-level GameState key)`.

Every other leaf keeps its status and first message. P15C's production owns all 40.

## For the review

The implementation review (`1361-D`) reads r1 against the 1356 charter, 1361-F and this measurement. It takes the
handback's open items:
- **The silent-failure hazard.** `prepareLiveWritingContext` (`src/core/liveRetirementWriting.ts:19-27`) swallows a
  failed live profession proof. A sibling root left out of `P15_ROOT_KEYS` would therefore drop writing authority
  every tick, silently.
- **O1:** P15B's era flag on the frozen `validateSaveV45`.
- **D2:** the generic allocator walk.
- The two type fixes, and the harness time.
