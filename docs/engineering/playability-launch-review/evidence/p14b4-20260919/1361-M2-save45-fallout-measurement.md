# 1361-M2: the Save45 fallout, measured in scratch

1361-F ruling 20 orders this measurement on [1358-M2](1358-M2-rel-sliceB-fallout-measurement.md)'s method. It runs
the whole suite on the merged candidate with no test edit. The candidate is slice 2a r2, P15A.1's (a) and (b) r2, and
P15C's (a) to (c), through `p15c-c-r1`. The result is the input to the sweep plan `1361-N`.

**Result.**
- **The P15 files** do what the dry runs measured. 1355's files fail exactly the 45 declared leaves, and every 1356 and
  1359 leaf passes.
- **The type gates and generators.** `src` is type-clean, and both generator checks pass.
- **d16** fails the same 12 leaves as at `base`.
- **Core:** 809 new rows outside the P15 files, in 138 files. Every kind among them is Save45 pin fallout or a known
  environment row.
- **UI:** 11 new rows, all live-version pins.

## How it ran

| Item | Value |
|---|---|
| Script | [run-1361-M2.sh](1361-stage/m2/run-1361-M2.sh), alone in the heavy lane |
| Tree | an archive of HEAD a0e51c93 (`src` 762d8e09, the writer's base) plus [1361-p15c-production-c-r1.patch](1361-stage/prod/1361-p15c-production-c-r1.patch) (sha256 a7a70ad9…), committed in the tree (14 files, +1,490 −79) |
| Links | `docs`, `node_modules`, `art` and `tools`. `tests/fixtures` was a real directory of per-entry links, with `bridge-contract-union-fixtures.ts` copied (memory `scratch-tree-fixture-links`). Nothing was written under a link |
| Core list | [core-list.txt](1361-stage/m2/core-list.txt), 447 files: 1358-M2's 440 plus the seven P15 RED files. 1296-A's six Owner-input files stay out |
| Node, flags | v20.20.2; `--no-cache`; `.venv/bin` first on PATH for core and UI (the numpy the Owner approved, 1362-V) |
| Times (CDT) | 2026-10-02 17:16:35 start; type gates to 17:19:07; generators to 17:19:09; core 17:19:09-18:38:07; UI to 18:57:54; d16 from 18:57 to 2026-10-03 09:23:48 |
| The overnight gap | The machine slept at 19:01, with its battery at 0%, and woke at 09:19 when the power button was pressed (`pmset` log). Only d16 spanned the sleep. Its result equals `base`'s leaf for leaf, so the sleep moved nothing |
| End state | the tree's status shows only `?? dist/`, a build output one test writes in the tree root |
| Raw logs | `S/1361-m2/m2-core.txt` (sha256 fb5345e4…) and `m2-ui.txt` (sha256 17043571…), gzipped beside them; the parsed rows are staged |

## Type gates and generator checks

| Gate | Errors in `src/` | Errors in `tests/` |
|---|---:|---:|
| Root `tsconfig.json` | 0 | 33 |
| `ui/tsconfig.json` | 0 | 4 |
| `tsconfig.bridge.json` | 0 | 9 |

These are the same counts as 1361-X4 at every P15C tag. Both generator checks exit 0.

## Core: 938 failed, 4,272 passed, 39 skipped, 11 todo (5,260)

[1321-I-attribution.py](1321-I-attribution.py) parses the raw core log, and [1344-I-compare.py](1344-I-compare.py)
compares it against [1358-I](1358-I-core-failures.json), the Save44 recorded gates (1358-M3). Result:
**SAME 71, CHANGED 14, NEW 854, GONE 0**
([m2-core-vs1358I.json](1361-stage/m2/m2-core-vs1358I.json)).

**The P15 files account for 45 of the NEW rows.** They are the 45 declared 1355 leaves: 40 in the integration file, 4
in atomicity and 1 in phases. No 1356 or 1359 leaf fails.

**The other 809 NEW rows, by first message.** This is the parent's first grouping; `1361-N` classifies every row.

| Rows | Files | Kind |
|---:|---:|---|
| 312 | 50 | `validateSaveV44: expected version 44`: the frozen V44 validator on a live envelope (S1) |
| 270 | 79 | `expected 45 to be 44`: live-version pins |
| 93 | 7 | a shared helper's live-writer pin, 45 against 44 |
| 30 | 8 | whole-state or shape comparisons: a Save45 state against a Save44 expectation (S5) |
| 28 | 11 | a live call under `not.toThrow` that now throws (S1 family) |
| 25 | 1 | the C2a-M1 genuine-V13 contract helper |
| 19 | 17 | refusal and sentinel message pins: "1 through 44 only", "unknown saveVersion 45", downgrade wording (S3, S8, S9) |
| 16 | 1 | hand-built industry states without `sharedMarket`, which now refuse at the first tick (1361-D2 F7) |
| 7 | 1 | `bridge-supervisor` "Fake Unity did not report …", the scratch-tree environment row of 1320-X |
| 3 | 2 | a test that reconstructs an older envelope by hand from a live state that now carries `powerRanking`, so `validateSaveV12` refuses "unknown field" |
| 6 | 5 or 6 | single rows: a stringified state now naming `campaignLegacy`; two `releaseCommitted` live-call refusals; a hash pin; "validateSaveV45: the p15Sequence root is missing" from a hand-built Save45 envelope |

**The CHANGED rows** are 14 baseline rows that still fail with a different first message:
- **Moved to a Save45 pin message:** 8 rows (`bridge-p14b2-trust`, `bridge-p14c2rm-retirement` ×2, `bridge-p14c3-runtime`,
  `p14c3-admission-boundaries`, `p14c3-canonical-rival-history` ×2, `p14c3-save-v38`). 1361-N re-attributes each.
- **Still ENOENT:** 6 `r3n1-stale-schedule-take-02*` rows, ENOENT before and after, differing only in the tree path,
  a scratch-tree environment row.

## UI: 11 failed, 2,681 passed, 5 skipped (2,697)

Against [1358-I2](1358-I2-ui-failures.json): **NEW 11, GONE 3**
([m2-ui-vs1358I2.json](1361-stage/m2/m2-ui-vs1358I2.json)).
- **Every NEW row** reads `expected 45 to be 44`, in six files: `d17-save-migration`, `film-chronicle-adapter`,
  `v14SetHolderBoundary`, `saves`, `StudioCalendar.career` and `session`.
- **The three GONE rows** are the `authored-rgba-export` leaves. They failed for want of numpy and pass with the
  approved `.venv` on PATH.

## d16

The suite fails 12 of 176: the same leaves with the same messages as at `base`
([m2-d16.json](1361-stage/m2/m2-d16.json); 1361-X3 section 2).

## What follows

- **The sweep plan `1361-N`** (1361-F ruling 20; 1358-N's method). It takes the 809 core rows, the 8 CHANGED Save45 rows
  and the 11 UI rows.
- **Notes the planner carries:**
  - 1361-D2 F7: hand-built states without `sharedMarket` refuse at the first tick;
  - 1361-D3 F4: at the 6240 tick, a hand-built industry state without `campaignLegacy` throws a `TypeError`;
  - the 33, 4 and 9 test type-error sites.
- **What the sweep leaves alone** (1361-F ruling 20): the P15 RED files, `BASE_LIVE_SAVE_VERSION`, and F10 and F11
  unless a production edited the Bridge schema. Both generator checks pass on this tree, so none did.
