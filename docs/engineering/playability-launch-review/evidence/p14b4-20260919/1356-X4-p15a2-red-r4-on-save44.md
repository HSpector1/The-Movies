# 1356-X4: the P15A.2 Wave 2 slice 2a RED r4 on the Save44 base

Relationship slice B made Save44 live ([1358-L](1358-L-rel-sliceB-landing.md)). The parent ran RED r4 on the last
Save43 commit and on the Save44 HEAD.
- **Both bases give the same result.** Every classified leaf has its expected status on both.
- **What differs.** One message's computed version digit, and the importing test file that 13 load errors name.
- **The root type gate** carries exactly 1356-X3's four missing-module errors.

The run's method is in [1359-X6](1359-X6-p15c-red-r8-on-save44.md) ("How the run went"). Outputs are in
[1356-stage/x4/](1356-stage/x4/).

## Results

| Base | Tests | Root type gate |
|---|---|---|
| OLD 65515b66 (Save43) | 70 failed, 2 passed (72) | 21 errors: slice B RED's 17, plus this RED's 4 |
| NEW 1706d844 (Save44) | 70 failed, 2 passed (72) | 4 errors |

- **The four NEW errors** are 1356-X3's four TS2307 errors, at the same positions. Each names `src/core/powerRankingArchive.js`
  or `src/core/p15Phases.js`, which slice 2a's production supplies:
  - `p15a2-power-ranking-archive-isolation.test.ts(66,29)`;
  - `p15a2-power-ranking-archive.test.ts(85,29)`, (97,29) and (348,31).
- **The totals** equal 1356-X2 and X3 together: 69 failed and 2 passed in the archive and isolation files, and the
  harness leaf failed.
- **Against the classification.** All 72 leaves of [1356-p15a2-wave2-red-r4-classification.json](1356-stage/1356-p15a2-wave2-red-r4-classification.json)
  have their expected status on both bases. No leaf is missing or unclassified.

### OLD against NEW: 14 first messages differ

- **13 load errors** ("Failed to load url ../src/core/powerRankingArchive.js" or "../src/core/p15Phases.js") name a
  different importing test file. Vite reports the first file that loaded the missing module.
- **One message**, `rank-root-migration-genuine-below-step-capture`, computes its version digit:
  - OLD: "RED: no genuine capture below the P15 save step at tests/fixtures/p15/genuine-below-p15-save-step/ (1356-A §9:
    mint it at the last Save42 writer)";
  - NEW: the same with "Save43".

  The digit is `Save${ARCHIVE_STEP - 1}`. It reads Save44 once the P15 step lands.
- **The capture** is the one 1355-P r3 mints in mint mode ([1355-X5](1355-X5-p15a1-red-r4-on-save44.md)). Until that
  mint lands, the leaf fails with this message.

## What follows

- This RED lands first among the three (1355-F4). It creates `tests/helpers/p15-roots.ts` with
  `['p15Sequence', 'powerRanking']`.
- It has no producer of its own. Its genuine-capture leaf depends on P15A.1's mint. The parent compiles from the records
  which message the recorded RED pins, given that order.
- Slice 2a's production follows the RED. The P15A.2 reference mints Save44 itself, so it retargets to Save45 on this
  base.
