# 1361-X2: dry run of the P15A.1 r1 stack on slice 2a r2

This run measures the writer's rebuilt stack in `/Users/zacheryspector/studio-scratch/1361-prod/tree`, staged in
[1361-stage/prod/](1361-stage/prod/):
- **`p15a2-r2`** (5eccada): slice 2a with [1361-F3](1361-F3-parent-response-to-1361-D.md)'s R1 to R4 folded in. The
  delta is in [1361-E](1361-E-p15a2-production-handback.md).
- **P15A.1's three commits** ([1361-E2](1361-E2-p15a1-production-handback.md)):
  - `p15a1-a-r1` (39d0481), the reception seam at 1;
  - `p15a1-b-r1` (1074744), the `sharedMarket` root and its save step;
  - `p15a1-c-r1` (c524911), the batch, the witness and the factor. This is the frozen candidate that G2 measures.

**Result.** Every tag is `src` type-clean on all three gates, and 1356 passes 72 of 72 at each. 1355 climbs 9, 15, 59
exactly as the writer read it: at (c) all 59 pass, including K1, K2, M0A and both capture leaves. 1359 stays at
40 failing; P15C owns those. Both generator checks pass at each tag.

## How it ran

- **The script:** [run-1361-X-stack-r2.sh](1361-stage/prod/run-1361-X-stack-r2.sh). It calls
  [run-1361-X.sh](1361-stage/prod/run-1361-X.sh) once per tag, with the tree checked out at that tag, then returns the
  tree to `main`.
- **The run:** alone in the heavy lane, on Node v20.20.2, 2026-10-02 from 14:48:56 to 15:05:52 CDT.
- **The tree:** clean before and after each run, and back on `main` at c524911 at the end.
- **Outputs:** [x-r2c](1361-stage/x-r2c/), [x-r2b](1361-stage/x-r2b/) and [x-r2s](1361-stage/x-r2s/).

## Results

| Check | (c) `p15a1-c-r1` | (b) `p15a1-b-r1` | slice 2a r2 `p15a2-r2` |
|---|---|---|---|
| Root, UI, Bridge type gates: errors in `src/` | 0, 0, 0 | 0, 0, 0 | 0, 0, 0 |
| The same gates: errors in `tests/` (Save45 sweep material) | 33, 4, 9 | 33, 4, 9 | 33, 4, 9 |
| 1356 archive and isolation | 71 passed (71) | 71 passed (71) | 71 passed (71) |
| 1356 harness, alone (`campaignMs`; ceiling 300,000) | passed, 83,603 | passed, 79,889 | passed, 78,490 |
| 1355's three files | **59 passed (59)** | 15 passed, 44 failed | 9 passed, 50 failed |
| 1359's three files | 40 failed, 76 passed | the same | the same |
| Both generator checks | exit 0 | exit 0 | exit 0 |

- **Slice 2a r2 changes nothing measured.** 1356 passes 72 of 72 and 1355 passes 9 of 59, as at r1 (1361-X).
  R1's compile-time tie holds: `src` stays type-clean.
- **(b) adds the root and its validator.** Six more 1355 leaves pass. The batch leaves wait for (c), as the
  classification declares.
- **(c) passes every 1355 leaf.** That includes the four pin controls: the default seam, K1, K2 and M0A against the
  pins minted at the RED commit, so the batch moves nothing outside the declared fields at week 21. Both
  `market-old-save` capture leaves pass on the landed Save44 capture.
- **The harness** runs 5% slower at (c) than at r2 (83,603 against 78,490 ms), with the batch on. That is 28% of the
  ceiling.
- **(a)** was not measured on its own. It never ships without (b).

## What follows

- **G2** runs on `p15a1-c-r1` with this run's [x-r2c/p15a1.json](1361-stage/x-r2c/p15a1.json) as its `RED_JSON`
  (1361-G2-F ruling 3).
- **The independent review `1361-D2`** reads the stack against the charter and these results. That includes the
  writer's claim that (b) can land alone, which would bear on 1361-F2 ruling 3.
