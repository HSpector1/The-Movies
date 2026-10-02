# 1359-X5: parent dry run of the P15C Wave 2 RED r7 and reference r4

[1359-F6](1359-F6-parent-response-to-1359-D5.md) ruling 3 ordered this run on r7. **Every leaf behaves as declared.**
The RED commit reads 40 failed and 76 passed of 116, and reference r4 reads 113 passed, with C2-C4 on FIXTURE
PENDING. The checker finds 0 mismatches and 0 unclassified leaves at both. 1359-D5's REFINE item is closed: the
old-law leaf passes at reference r4 with both relabels refusing.

## How it ran

- **Script.** [run-1359-X5.sh](1359-stage/x5/run-1359-X5.sh), alone in the heavy lane under `HEAVY-LANE-LOCK`, on
  2026-10-02 from 02:24:59 to 02:28:49 CDT, Node v20.20.2 ([x5.lane.meta](1359-stage/x5/x5.lane.meta),
  [x5.log.txt](1359-stage/x5/x5.log.txt)).
- **Tree.** A fresh scratch tree from repo HEAD e1a793fd, whose `src` and `tests` equal bc2f6007's. On it, the
  staged patches only:
  - RED r7 [1359-p15c-wave2-red-r7.patch](1359-stage/1359-p15c-wave2-red-r7.patch) (sha256 e3ccde79…), tests only;
  - then reference r4 [1359-p15c-wave2-reference-r4.patch](1359-stage/1359-p15c-wave2-reference-r4.patch)
    (66dc946d…), `src` only.

  The tree's `git status` read empty afterwards, and the parent deleted it after the run.
- **Not minted.** The route L captures mint at the last writer below the P15 step, so C2-C4 stay FIXTURE PENDING.
- **Files.** Each vitest command ran three files: `p15c2-campaign-legacy-integration`, `p15c-wave-r-retention` and
  `p15c1-campaign-legacy`, with `--no-cache` and the verbose and JSON reporters.
- **Checker.** [check-1359.py](1359-stage/x5/check-1359.py) matches every classified leaf by file and title with the
  r7 classification (116 rows). At the RED commit it compares each leaf's outcome and first message with `atRed` and
  `firstMessageAtRed`; at the reference it compares outcomes with `atReferenceR4`.

## Results

| Run | Tests | Per file (failed, passed) | Checker | Root type gate |
|---|---|---|---|---|
| RED r7 | **40 failed, 76 passed** (116), 65.44 s | integration 35, 2; Wave R 0, 7; p15c1 5, 67 | 0 mismatches, 0 unclassified | exit 0, no output |
| Reference r4 | **3 failed, 113 passed** (116), 74.59 s | integration 3, 34; Wave R 0, 7; p15c1 0, 72 | 0 mismatches, 0 unclassified | exit 2, 35 errors |

- **At the RED commit**, every failure's first line equals its declared `firstMessageAtRed`. That includes the five
  moved Wave 1 leaves (p15c1 :334-337, :580-600, :627-652, :942-1007, :1892-1920).
- **At reference r4**, the three failures are `legacy-migration-empty-root`, `legacy-migration-before-boundary` and
  `legacy-migration-past-boundary` (C2-C4). Each fails on "FIXTURE PENDING: tests/fixtures/p15/p15c2-route-l-captures/
  MANIFEST.json does not exist". C11, B1, the old-law leaf and the moved Wave 1 leaves pass.
- **The reference type gate** reports 35 errors at exactly 1359-X2's 35 positions (TS code and file position), for
  example `src/core/save.ts(10498,53)` and `src/harness/roster-wall/historical-control.ts(33,3)`. None falls in
  `campaignLegacy.ts`, `tuning.ts` or a RED file.

## Outputs

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| [x5-red.txt](1359-stage/x5/x5-red.txt) | 52,816 | 330e7965d60f987d |
| [x5-red.json](1359-stage/x5/x5-red.json) | 92,564 | 63530d3b2e1179a2 |
| [x5-red-tsc.txt](1359-stage/x5/x5-red-tsc.txt) | 0 | e3b0c44298fc1c14 |
| [x5-red-check.txt](1359-stage/x5/x5-red-check.txt) | 227 | 7be2ab9a6e3db9ae |
| [x5-ref.txt](1359-stage/x5/x5-ref.txt) | 23,404 | 3a7528e30cce6b82 |
| [x5-ref.json](1359-stage/x5/x5-ref.json) | 47,196 | 93c2dd53e820ae66 |
| [x5-ref-tsc.txt](1359-stage/x5/x5-ref-tsc.txt) | 14,496 | 80155cc43b45de2e |
| [x5-ref-check.txt](1359-stage/x5/x5-ref-check.txt) | 227 | cbf8bbb7de5b2b22 |

## Next

- The P15C RED stays staged. Its mint (1359-P r4) and recorded RED come after slice B's Save44 production.
- Before them, the RED rebases onto that base: I:151 pins the base's live save version as 43, and 1359-F6 ruling 5
  orders the move. The declaration check then runs again on the Save44 base.
