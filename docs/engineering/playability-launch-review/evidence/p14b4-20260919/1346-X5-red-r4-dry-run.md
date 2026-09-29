# 1346-X5: parent dry run of P15A.1 RED r4 (1346-C4)

Scratch tree from HEAD 8e8a4e56 (the 1327-C method). RED r4 is
[1346-p15a1-red-r4.patch](1346-stage/1346-p15a1-red-r4.patch), sha256 5fb31d61…; it applies cleanly to HEAD.

| Run | Result | Reasons (counted by `grep -c` over whole lines) |
|---|---|---|
| r4 alone ([output](1346-runs/1346-X5-red-r4.txt)) | 35 of 35 fail | 34 on `Failed to load url ../src/core/sharedMarket.js`; 1 `market-tuning-bounded-terms` on `expected undefined to deeply equal [ 1, 0.55, 0.55, 0.2 ]` |
| r4 over production v1 ([1346-p15a1-production.patch](1346-stage/1346-p15a1-production.patch), sha256 ed343684…; [output](1346-runs/1346-X5-red-r4-over-production-v1.txt)) | 34 pass, 1 fails | `market-release-contribution-seam`: `src/core/sharedMarket.ts does not export a function named 'releaseContribution'` |

The two new or revised leaves that pass over v1 pin behaviour production already has:
- the two-studio `SAME_WEEK_RELEASES` leaf: one reason, both ids, value 2.0;
- the loosened floor leaf: `>= 0.75` at P = 1000, strict above 0.75 up to P = 20.

The production revision (1346-E2) owes three changes, and nothing else:
1. Export `releaseContribution`.
2. Route every weight through it.
3. Remove `nextDoubleAbove` so the factor is the plain formula (1346-F3 item 1).

The floor leaf has to pass again after item 3.
