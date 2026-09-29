# 1351-X6: parent dry run of the Power Ranking RED r5 (1351-C5)

Scratch tree from HEAD 8cecfd62, which already holds the landed P15A.1. The patch
[1351-p15a2-red-r5.patch](1351-stage/1351-p15a2-red-r5.patch), sha256 3366f2ec…, applies cleanly.

| Run | Result |
|---|---|
| r5 alone ([output](1351-runs/1351-X6-red-r5.txt)) | 47 fail, 1 control passes |
| r5 over production r2 ([output](1351-runs/1351-X6-red-r5-over-production-r2.txt)) | 48 of 48 pass in 2.50 s |

The 13 new leaves come from [1351-C5](1351-C5-p15a2-red-error-handling.md):
- one leaf per throw condition, each matching that condition's own message;
- one leaf showing no thrown message carries a probe cash or fixed-cost value;
- one leaf on a deep-frozen input.

All 13 pass over the unchanged production r2, so the law needs no production change. Next: confirmation from the
1351-J reviewer, then landing with the TUNING range comments (1351-F2 item 1).
