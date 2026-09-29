# 1321-I: attribution of the recorded broad core gate after the Save42 sweep

## Run identity

- Command: `vitest run --project core` over the 422-file allowlist of
  [1321-save42-broad-core-collection-preflight.json](1321-save42-broad-core-collection-preflight.json) (428 tracked core
  test files less the six 1296-A exclusions; the five casting files are new since 1316), recorded as
  [1321-save42-broad-core](1321-save42-broad-core.json) at source and HEAD 25501835 (equal to the remote at preflight),
  empty tested diff. Bounded guards `allGuardsExact: true`, `fixedSource: true`; collection postflight 422 reported
  files, equal to the allowlist, no excluded path.
- Raw: [1321-save42-broad-core.txt](1321-save42-broad-core.txt), 28,946,018 bytes, sha256
  bb3f0bb918bf2a41c8731ff865467a4dfafe094bc168bc556c8e3a0bc3c70df5.
- Tally: **35 failed files, 151 failed tests, 4530 passed, 3 skipped, 11 todo** (4695); no unhandled error; no suite
  fails to load.

## Method

Every failing identity is compared with [1316-I](1316-I-failures.json) by the 1302-I identity method
([1321-I-attribution.py](1321-I-attribution.py), which also parses a Failed Suites section). Output:
[1321-I-failures.json](1321-I-failures.json). Run on the 1316 raw itself the script returns 151 RETAINED-SAME.

## Result

**The failing set equals 1316's exactly: 151 identities, 0 new, 0 gone.** 143 fail with the same primary; 8 with a
changed primary and the same cause:

1. `p14c3-canonical-rival-history` K1-K4, L1, L2 (6, C3): the digest pin at `:144` is unchanged (`2f9ec0fa…`); the
   received `sha(exportSave(makeSave(state)))` moves from `53d1afb4…` to `a7d0034f…` because the live save format is
   Save42. Same 1100/1119-A cause.
2. `p14c3-save-v38:85` (C20): the migrated envelope reads `saveVersion` 42 where it read 41; the purity comparison
   against a V38 conversion is the same cause (1320-C unresolved item 2).
3. `world-first-scenery-load-in-provenance` (benign): the exporter's temporary path.

The 705 Save42 rows of [1320-M](1320-M-save42-fallout-rows.json) and the suite-load failure no longer occur. The five
casting files pass (their one skip is the `state.hollywood === null` clause). `bridge-supervisor`, which failed in the
1320-X scratch tree, passes here, as at 1316.

## Disposition

The Save42 production and its test sweep introduce no failing identity in the broad core gate. The 151 retained
failures keep their 1302/1316 causes and stay open.
