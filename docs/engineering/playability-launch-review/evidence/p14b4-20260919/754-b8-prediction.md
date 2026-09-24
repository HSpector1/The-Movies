# 754 — pre-registered prediction for the B.8 full-core confirming run

Written BEFORE the run, at source `c368e6b1`, so the run can falsify it. This discipline earned its
keep twice in B.7: prediction 736 was falsified and caught four sweep misses the sweep's own
"residue: none" had denied, and prediction 738 named FU-2's timeout in advance.

## The baseline

Run `739-b7-full-core-confirm`, source `d5293b1f`, `fixedSource: true`, 3151.67s:

| | run 739 |
| --- | --- |
| test files | 10 failed / 345 passed (355) |
| cases | 25 failed / 4010 passed / 8 todo (4043) |

## What B.8 adds

Two new files and 44 new cases, both already green in isolation and verified by the parent at
`c368e6b1`: `tests/bridge-p14b8-waiver-surface.test.ts` (32) and
`tests/p14b8-waiver-surface-oracle.test.ts` (12).

## The prediction

| | predicted |
| --- | --- |
| test files | **9 failed / 348 passed (357)** |
| cases | **24 failed / 4055 passed / 8 todo (4087)** |

Arithmetic stated so an error in it is visible: 355 + 2 = 357 files; 4043 + 44 = 4087 cases;
4010 + 44 + 1 = 4055 passing if the one intermittent failure below passes.

**Failure-NAME set: exactly the 24 inherited names from run 717, byte-identical, ZERO new, ZERO
vanished.** The failure-NAME set is the instrument, not the cause-TEXT diff. B.7 recorded why: a new
failure whose text duplicates an existing message is invisible to a cause diff, and that nearly hid
run 739's only new failure.

## The one predicted difference from 739, named in advance

739 carried **25** failures against 717's 24. The extra one is FU-2, the prepared-reuse timeout at
`:367` with its explicit `}, 20000)` budget. Record 741 diagnosed it as a measurement question and
not a regression: four measurements across three commits read 13328 / 13710 / 14161 / 14278 ms, a 7%
spread, against a budget only 1.412x the operation cost, while contention multiplies that file
1.67x-1.74x. It passed in run 737 and failed in run 739 on nearly identical source. The threshold was
deliberately NOT moved, per the Owner.

So this run predicts 24, not 25, and **either outcome is informative**. 25 confirms the intermittency
diagnosis. 24 confirms it too, from the other side. What would falsify record 741 is a DIFFERENT
timeout, or this one failing with a materially different measured duration.

## Named falsifiers

1. Any new failure name that is not the FU-2 timeout.
2. Any inherited failure that VANISHES. B.8 fixed nothing in the inherited set and a disappearance
   would mean the run did not collect what 717 collected.
3. A file count other than 357, which would mean collection changed.
4. A case count other than 4087.
5. Any failure inside the 31 swept files. The writer ran them consolidated (33 files, 539 passed) and
   the parent verified the eight residue classes at zero, so a sweep failure here falsifies that
   verification rather than merely reporting a miss.

## What this run does not claim

Unity NOT VERIFIED. The `ui` project is NOT run; FU-1 has not returned and no UI-affecting claim
rests on this. The 24 inherited failures are not B.8's and B.8 touched none of them.
