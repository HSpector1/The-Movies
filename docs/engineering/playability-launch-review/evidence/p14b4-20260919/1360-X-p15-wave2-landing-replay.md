# 1360-X: the P15 Wave 2 RED landing, replayed in scratch on the Save44 base

[1360-F](1360-F-parent-rulings-p15-wave2-red-landings.md) ruling 5 orders the post-mint states measured before any
recorded run. This replay carries out 1360-F's whole sequence in a scratch tree:
- the three RED commits, with the merged `P15_ROOTS`;
- both producers, in mint mode where it applies;
- the capture sha pin;
- each RED's files at the point where its recorded RED will run.

**Every stage matches 1360-F's reading.**
- 1356 fails 70 and passes 2 before any mint.
- 1355 fails 51 and passes 8 after its mint and pin. The four pin controls pass, and both capture leaves stop at the
  version check.
- P15C fails 40 and passes 76. Its C2-C4 leaves fail by name on the Save44 captures.
- The root type gate holds exactly the six missing-module errors.
- Both producers wrote the same bytes as their Save44 dry runs.

Nothing was written to the repository (1360-F ruling 6).

## How it ran

- **Script.** [run-1360-X.sh](1360-stage/x/run-1360-X.sh), alone in the heavy lane, on 2026-10-02 from 11:50:17 to
  11:53:52 CDT, Node v20.20.2 ([run-meta.txt](1360-stage/x/run-meta.txt)).
- **Tree.** A fresh tree from an archive of cb49fd02 (Save44; source equal to 1706d844).
  - `node_modules`, `art` and `tools` were linked.
  - `tests/fixtures` and the E directory were real directories of per-entry links. The P15C RED reads a genuine
    Save38 capture from E.
  - The producers were copied into the tree's E as real files, and the captures went to a real `tests/fixtures/p15`.
- **Steps.** The tree's commits ([tree-log.txt](1360-stage/x/tree-log.txt)):
  1. the 1356 RED;
  2. the 1355 RED with `['p15Sequence', 'powerRanking', 'sharedMarket']` and its producer;
  3. the 1355 fixtures with `CAPTURE_MANIFEST_SHA256` set to the minted MANIFEST's sha256 (8a1d56d6… in this tree);
  4. the 1359 RED r8 with `['p15Sequence', 'powerRanking', 'sharedMarket', 'campaignLegacy']` and its producer;
  5. the 1359 fixtures.

  The tree ended clean. The parent removed it afterwards.

## Results

| Stage | Where the recorded run will sit | Result |
|---|---|---|
| s2: 1356's archive, isolation and harness files | 1360-F step 2, before any mint | 70 failed, 2 passed (72) |
| s4: 1355-P r3, mint mode | step 4 | exit 0; K1 week 21 (committed null), K2 week 12, M0A 40 weeks, capture week 30 ([s4-1355-mint.txt](1360-stage/x/s4-1355-mint.txt)) |
| s6: 1355's three market files | step 6, after the fixture commit with the pin | **51 failed, 8 passed (59)** |
| s8: 1359-P r4 | step 8 | exit 0; weeks 6239 and 6240, `saveVersion` 44 ([s8-1359-mint.txt](1360-stage/x/s8-1359-mint.txt)) |
| s10: 1359's integration, retention and p15c1 files | step 10 | 40 failed, 76 passed (116) |
| s11: 1356's files again, after both mints | the next broad gate | 70 failed, 2 passed (72) |
| s12: root type gate | the next type gate | exit 2, 6 errors: 1356's four TS2307 and 1355's two (the missing `powerRankingArchive.ts` and `p15Phases.ts`); 1359 adds none |

### What each mint changes

The comparison is against each RED alone before its mint (1355-X5, 1359-X6, and s2 for 1356). Two failing load errors
that name a different importing test file are left out.

- **1355: four leaves turn green,** exactly the four pin controls whose classification rows read "after minting it
  passes on unchanged production":
  - `market-seam-default-exact`;
  - `market-week-diff-confined (K1)`;
  - `market-no-pressure-week-identity (K2)`;
  - `market-disengaged-world` (M0A).
- **1355: both `market-old-save` capture leaves** move from FIXTURE PENDING to `AssertionError: expected 44 to be 43`.
  That is their rows' declared final reason: "fails on manifest.saveVersion = N, expected N - 1 (no step yet)".
- **1359: C2-C4 move.** `legacy-migration-empty-root`, `-before-boundary` and `-past-boundary` move from FIXTURE
  PENDING to `Error: RED: the route L captures are Save44, the live version: the Legacy's save step has not landed
  above them (1359-A §5.2)`. Every other leaf is unchanged.
- **1356: one leaf moves.** `rank-root-migration-genuine-below-step-capture` moves from "RED: no genuine capture …" to
  `AssertionError: expected 44 to be 43` once the 1355 mint exists. The next broad gate attributes this change
  (1360-F ruling 3).

### The bytes are deterministic

The replay's captures and pins equal the Save44 dry runs'. That covers each input's gzip and decoded sha256, and the
K2 and M0A digests:
- [x-genuine-below-p15-save-step-MANIFEST.json](1360-stage/x/x-genuine-below-p15-save-step-MANIFEST.json) against
  1355-X5;
- [x-p15a1-market-pins-MANIFEST.json](1360-stage/x/x-p15a1-market-pins-MANIFEST.json) against 1355-X5;
- [x-p15c2-route-l-captures-MANIFEST.json](1360-stage/x/x-p15c2-route-l-captures-MANIFEST.json) against 1359-X6.

The recorded mints should write the same bytes. Only each MANIFEST's `executionHead` and `elapsedMs`, and so the
1355 capture MANIFEST's sha256, will differ. The sha pin takes the recorded mint's value (1360-F ruling 4).

## Classification revision: P15C r8

[1359-p15c-wave2-red-r8-classification.json](1359-stage/1359-p15c-wave2-red-r8-classification.json) (116 rows, sha256
fbd0908a…) equals r7's classification except for rows C2-C4. In each:
- `atRed` becomes `fail` (was `fail (FIXTURE PENDING)`);
- `firstMessageAtRed` becomes the measured Save44 message above;
- `fixturePending` becomes false;
- `expectedFailureToday` gives the pre-mint and post-mint messages;
- `redBasis` cites this replay.

The 1355 and 1356 classifications need no revision:
- 1355's rows already declare the post-mint sequence, and the replay confirms it;
- 1356's recorded RED runs before any mint, where its row's message holds.
