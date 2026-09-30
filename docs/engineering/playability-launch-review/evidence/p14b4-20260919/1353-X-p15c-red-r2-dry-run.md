# 1353-X: parent dry run of the P15C RED r2 (1353-C2), Part B

Scratch tree from HEAD c614b7e9, which already holds the landed shelving. The patch
[1353-p15c-red-r2.patch](1353-stage/1353-p15c-red-r2.patch), sha256 ce41bd0a…, applies cleanly: two files, 2,191 insertions.

- **Part B** (`tests/p15c1-campaign-legacy.test.ts`, [output](1353-X-partB-red-r2-run.txt)): **62 of 62 fail** in
  3.60 s. 61 fail on `Failed to load url ../src/core/campaignLegacy.js`, and the TUNING bounded-term leaf fails on
  `expected undefined to be 70`.
- **Part A**, the Wave R retention guards: deferred. The Save43 broad core measurement (1344-M) was running during
  this pass, and Part A's first guard builds an 85-90 s campaign, which would add load to that measurement. The
  author's hash shows Part A is byte-unchanged since 1353-C, whose six injection proofs are recorded. The parent runs
  Part A once the measurement ends, and this record gains its result.
