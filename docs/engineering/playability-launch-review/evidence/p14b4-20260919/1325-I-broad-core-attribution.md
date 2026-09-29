# 1325-I: attribution of the recorded broad core gate after repair R1

## Run identity

- Command: `vitest run --project core` over the 422-file allowlist of
  [1325-r1-broad-core-collection-preflight.json](1325-r1-broad-core-collection-preflight.json) (428 tracked core test
  files less the six 1296-A exclusions), recorded as [1325-r1-broad-core](1325-r1-broad-core.json) at source and HEAD
  57b7bee9 (equal to the remote at preflight), empty tested diff. Bounded guards `allGuardsExact: true`,
  `fixedSource: true`; collection postflight 422 reported files, equal to the allowlist, no excluded path.
- Raw: [1325-r1-broad-core.txt](1325-r1-broad-core.txt), 16,760,146 bytes, sha256
  b8961d326c8828ee271c49605cde7f989590ee1381be16aa27170b693cab196e.
- Tally: **29 failed files, 93 failed tests, 4588 passed, 3 skipped, 11 todo** (4695); no unhandled error; no suite
  fails to load.

## Method

Every failing identity is compared with [1316-I](1316-I-failures.json) by the 1302-I identity method, using the
archived [1321-I-attribution.py](1321-I-attribution.py) unchanged. Output: [1325-I-failures.json](1325-I-failures.json).

## Result

**93 identities fail, all retained from 1316: 85 with the same primary, 8 changed, 0 new. 58 are gone.**

- Gone: the 56 R1 target rows (C6 25, C7 23, C20 8) and the two `c2a-m2-sets-save` leaves whose 1321 refusal came from
  `v13TwinOf` (`validateSaveV12: state has unknown field "firstTakeSubjects"`). The set equals the
  [1324-X](1324-X-retained-r1-dry-run.md) dry run's gone set exactly.
- The 8 changed primaries are the rows [1321-I](1321-I-broad-core-attribution.md) recorded, with the same causes: six
  `p14c3-canonical-rival-history` leaves (received digest of the Save42 format against the unchanged
  `CANONICAL_INITIAL_SHA`), the Rule 4 leaf `p14c3-save-v38` "exposes matching strict38 conversion…" (now at `:93`,
  received `saveVersion` 42, expected 38), and the benign exporter row (temporary path, `PIL` missing).
- The seven files R1 touched: `p14c1-materialized-aging`, `p14b5-t-failure-tuning`, `v14-migration.contract`,
  `bridge-p14c2rm-runtime` and `bridge-p14c3-promise-digest-continuity` pass; `p14c3-save-v38` fails only its Rule 4
  leaf; `p14p3-directing-promises` fails only D07 and D18 (C16b, outside R1).
- `bridge-supervisor`, which failed in the 1324-X scratch tree, passes here, as at 1316 and 1321.

## Retained after R1 (93)

C8 natural-search exhaustion 42, UNRESOLVED 10, inherited from 1100 9, C15 7, C3 7, C17 6, C16 5, C12 2, C16b 2,
C1 1, C20 1 (the Rule 4 leaf), benign 1. Their causes are unchanged and they stay open.

## Disposition

Repair R1 removes 58 failing identities from the broad core gate and introduces none.
