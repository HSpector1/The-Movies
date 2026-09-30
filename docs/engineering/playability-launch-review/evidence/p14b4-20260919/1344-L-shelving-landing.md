# 1344-L: rival screenplay shelving and Save43 landed (D-1329-1)

| Step | Commit | Evidence |
|---|---|---|
| RED r4 tests (51 leaves; 1344-C..C4; reviews 1344-D, D2, D3 ACCEPT) | 9260baf4 | r4 is comment-only against r3 (parent `diff` of the added lines) |
| Recorded RED run at 9260baf4 | — | [txt](1344-shelving-red-recorded.txt), [json](1344-shelving-red-recorded.json), [patch](1344-shelving-red-recorded.patch), pre/postflight: **46 fail, 5 control-pass**, `fixedSource` true, `allGuardsExact` true |
| Step 1: `searchIndustryPackages` | b6fcf948 | [1344-E](1344-E-shelving-production-handback.md) |
| Step 2: the law in `decide`, the receipt | ecd63b05 | |
| Step 3: Save43-era validation | 83e7e76d | |
| Step 4: Save43 (`LIVE_SAVE_VERSION` 43) | 1993fc4d | |
| Step 5: the readers | a988108b | [review 1344-J](1344-J-shelving-implementation-review.md): KEEP |
| Recorded GREEN run at a988108b | — | [txt](1344-shelving-green-recorded.txt), [json](1344-shelving-green-recorded.json), [patch](1344-shelving-green-recorded.patch), pre/postflight: **51 of 51 pass** in 56.8 s, `fixedSource` true, `allGuardsExact` true |

How the steps landed:
- They are incremental diffs taken between the writer's cumulative patches in a scratch tree, with each step's tree
  built on the RED commit.
- The 13 changed source files at a988108b compare byte-equal (`cmp`) with the reviewed step-5 tree.
- The genuine inputs used: `tests/fixtures/p14/genuine-v42-pre-shelving` (weeks 100 and 130, record 1344) and
  `…-week93` (1344-P2), both minted at the last Save42 writer.

## Status: IN PROGRESS

- Save43 makes the rest of the suite stale where it states Save42 as live. The writer measured 19 new root type
  errors, 2 UI and 2 Bridge, all in test files. The broad core and UI measurement (1344-M, 1344-M2) at a988108b
  measures that fallout against the retained identities of 1338 and 1343.
- Then comes the sweep plan and its test-side sweep (the 1320 method): the §7 verification of the stalled route and
  the controls, re-attribution of the C8 rows, the recorded gates, and closure.
- Follow-ups from 1344-J, not blocking: a validator bound for `commissionHoldUntilWeek` (≥ 0, and equal to the last
  shelving week + 13 when non-zero), and a probe of the chart-timing edge, which predates this work.
