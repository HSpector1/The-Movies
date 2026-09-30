# 1352-X: parent dry run of the P15B Wave 1 RED r2 (1352-C2)

Scratch tree from HEAD 78af2754 (the 1327-C method). The patch
[1352-p15b1-red-r2.patch](1352-stage/1352-p15b1-red-r2.patch), sha256 1c8f2748…, applies cleanly: two new test files,
1,384 insertions.

[Output](1352-X-red-r2-run.txt): **50 of 50 fail** in 1.76 s. Counted over whole lines:

| Count | Reason |
|---:|---|
| 38 | `Failed to load url ../src/core/corporateCondition.js` |
| 10 | `Failed to load url ../src/core/studioLoan.js` |
| 1 | the TUNING bounded-term leaf: `expected undefined to be 4` |
| 1 | the no-RNG source-text read: `ENOENT` on the missing module file |

The root type gate shows exactly two errors, both `TS2307`, one per missing module.

Next: an independent RED review (1352-D) against 1352-A as amended by 1352-F and 1352-F2. It checks every
hand-derived week table, including the two off-by-one values the test author caught and fixed in C2.
