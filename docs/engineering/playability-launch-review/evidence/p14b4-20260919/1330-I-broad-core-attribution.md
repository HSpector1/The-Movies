# 1330-I: attribution of the recorded broad core gate after repair R2

## Run identity

- Command: `vitest run --project core` over the 422-file allowlist of
  [1330-r2-broad-core-collection-preflight.json](1330-r2-broad-core-collection-preflight.json) (428 tracked core test
  files less the six 1296-A exclusions), recorded as [1330-r2-broad-core](1330-r2-broad-core.json) at source and HEAD
  350f9db5 (equal to the remote at preflight), 08:57:18Z to 10:21:46Z, exit 1, empty tested diff. Bounded guards
  `allGuardsExact: true`, `fixedSource: true`; collection postflight 422 reported files, equal to the allowlist, no
  excluded path.
- Raw: [1330-r2-broad-core.txt](1330-r2-broad-core.txt), 15,967,082 bytes, sha256
  819b1984e9be9e5179718fc1aaa25c429574127f226bed4085ad1485549fd980.
- Tally: **24 failed files, 82 failed tests, 4599 passed, 3 skipped, 11 todo** (4695); no unhandled error; no suite
  fails to load.

## Method

Every failing identity is compared with [1316-I](1316-I-failures.json) by the 1302-I identity method, using the
archived [1321-I-attribution.py](1321-I-attribution.py) unchanged, and then with [1325-I](1325-I-failures.json) by
identity and primary. Output: [1330-I-failures.json](1330-I-failures.json).

## Result

**82 identities fail, all retained from 1316 (78 same primary, 4 changed) and all retained from 1325: 0 new, 11
gone.**

- Gone against 1325: the 10 R2 target rows (C12 2: `bridge-contract-generator` F10 and the positive output
  identities; C15 5: `p13b-r07-save-v25` 2, `facility-move-demolish` law 19, `p14c2s-scientist-retirement` S10,
  `bridge-runtime-checkpoint` canonical bytes; C3 K1-K3) and K4 under the [1327-F](1327-F-parent-r2-handback-adoption.md)
  amendment. The set equals the [1327-X](1327-X-retained-r2-dry-run.md) gone set exactly.
- Changed primaries against 1325, 3:
  - L1 and L2 of `p14c3-canonical-rival-history` now fail with "L passive work premise ended without an obligation"
    (person `person-studio-8c9ee794-r01-4`, week 607, profession writer, cause `noCatalogue`), the cause the
    week-0 digest masked, as 1327-C measured and 1327-X reproduced.
  - The benign exporter row differs only in its temporary output directory suffix.
- The 7 `bridge-supervisor` rows of the 1327-X scratch tree do not appear; the file passes in the repository, as at
  1316, 1321 and 1325.
- The seven files R2 touched: `bridge-contract-generator`, `bridge-runtime-checkpoint`, `facility-move-demolish`,
  `p14c2s-scientist-retirement` and `p13b-r07-save-v25` pass; `p14c3-canonical-rival-history` fails only L1 and L2;
  the helper `tests/helpers/p14c3-canonical-rival-fixtures.ts` has no other importer under `tests/`.

## Retained after R2 (82)

C8 natural-search exhaustion 42, UNRESOLVED 10, inherited from 1100 9, C17 6, C16 5, C3 3 (L1, L2 and the
`bridge-p14c3-runtime` R8 time-budget row), C15 2 (the `bridge-p14c2rm-retirement` pair, rule 6), C16b 2, C1 1, C20 1
(the Rule 4 leaf), benign 1. Their causes are unchanged and they stay open.

## Disposition

Repair R2 removes 11 failing identities from the broad core gate and introduces none.
