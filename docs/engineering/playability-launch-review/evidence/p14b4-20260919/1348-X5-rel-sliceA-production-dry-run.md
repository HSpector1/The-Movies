# 1348-X5: parent dry run of slice A production step 3 over RED r5, at HEAD after shelving

Scratch tree from HEAD 8b4db4e7, which holds Save43 shelving and P15B Wave 1. The run applied RED r5 (commit
`red-r5`), then the cumulative production step 3. Runs followed [1348-F5](1348-F5-parent-response-to-1348-J.md). The
outputs are archived as `1348-X5-*.txt`.

| Run | Files | Result |
|---|---|---|
| r5 at HEAD | the four slice A files | 49 failed, 43 passed ([red-sliceA](1348-X5-red-sliceA.txt)) |
| step 3 | the four slice A files | 28 failed, 64 passed ([step3-sliceA](1348-X5-step3-sliceA.txt)) |
| r5 at HEAD | the seven transition files named by 1348-J | 42 failed, 29 passed ([red-transitions](1348-X5-red-transitions.txt)) |
| step 3 | the seven transition files | 42 failed, 29 passed ([step3-transitions](1348-X5-step3-transitions.txt)) |
| step 3 | root type gate | 19 errors, every one `SaveFileV42`/`SaveFileV43` ([tsc](1348-X5-step3-tsc-root.txt)) |

## Attribution (identity sets from the failure headers)

- **Step 3 fixes 21 leaves and breaks none.** No identity fails on step 3 that passed at r5.
- **The shared helper preserves behaviour** (1348-F4 item 4). The transition files' failing identity sets are equal
  before and after step 3 (42 = 42). All 42 are in the 1344-M Save43 fallout.
- **Every remaining slice A failure is Save43 fallout.**
  - 22 of the 28 are 1344-M identities.
  - The other six are all in `tests/p14b10-mentor-label.test.ts`, which 1344-M did not run because the file lands with
    slice A. They share one failure: `expected 43 to be 42` at `acceptedEvidence`
    (`tests/helpers/p14c3-genuine-evidence-fixtures.ts:17`). That is the S2 helper pin of the Save43 sweep (1344-N;
    1358-C F2).
- The type gate shows no error from slice A.

## Consequence

Slice A's production is verified against its RED, apart from the Save43 pins it cannot see past. Landing follows the
Save43 sweep, as 1344-N orders it. After the sweep, the test author rebases r5 onto the swept HEAD, and a recorded
RED and GREEN run then covers the four files with the fallout removed. The 80-leaf expectation of 1348-F5 is
re-measured then.
