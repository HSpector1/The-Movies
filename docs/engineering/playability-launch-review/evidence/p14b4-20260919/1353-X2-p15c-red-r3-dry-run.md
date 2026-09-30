# 1353-X2: parent dry run of the P15C RED r3 (1353-C3)

Scratch tree from HEAD c614b7e9 (the 1353-X tree, r2 reversed with `git apply -R`). The patch
[1353-p15c-red-r3.patch](1353-stage/1353-p15c-red-r3.patch), sha256 fd6c8472…, applies cleanly: against r2 it
changes `tests/p15c1-campaign-legacy.test.ts` (+129) and `tests/p15c-wave-r-retention.test.ts` (+24/-7).

- **Part B** (`tests/p15c1-campaign-legacy.test.ts`, [output](1353-X2-partB-red-r3-run.txt)): **66 of 66 fail** in
  2.51 s. Counted from the failure blocks: 65 fail on `Failed to load url ../src/core/campaignLegacy.js`, and the
  TUNING bounded-term leaf fails on `expected undefined to be 70`. The four new boundary leaves and the strengthened
  audience-institution leaf fail on the missing module, as a RED requires.
- **Part A**, the Wave R retention guards: deferred again while the Save43 broad core measurement (1344-M) runs. The
  parent runs Part A over r3 once the measurement ends, and this record gains its result.

Review: [1353-D2](1353-D2-p15c-red-r3-confirmation.md), **ACCEPT**. r3 is the final RED. Production 1353-E (sim-core,
the single writer) is dispatched with it; the writer does not run Part A.
