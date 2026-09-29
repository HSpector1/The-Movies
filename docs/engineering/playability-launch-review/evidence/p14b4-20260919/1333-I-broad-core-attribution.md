# 1333-I: attribution of the recorded broad core gate after repair R3

## Run identity

- Command: `vitest run --project core` over the 422-file allowlist of
  [1333-r3-broad-core-collection-preflight.json](1333-r3-broad-core-collection-preflight.json) (428 tracked core test
  files less the six 1296-A exclusions), recorded as [1333-r3-broad-core](1333-r3-broad-core.json) at source and HEAD
  59e2666a (equal to the remote at preflight), 13:21:47Z to 14:50:49Z, exit 1, empty tested diff. Bounded guards
  `allGuardsExact: true`, `fixedSource: true`; collection postflight 422 reported files, equal to the allowlist, no
  excluded path.
- Raw: [1333-r3-broad-core.txt](1333-r3-broad-core.txt), 14,840,775 bytes, sha256
  bfe9d4f6f65ac1d347ec36abf32da93a66361d1ebe1f2c98af220cf1ec4b9447.
- Tally: **22 failed files, 80 failed tests, 4601 passed, 3 skipped, 11 todo** (4695); no unhandled error.

## Method

Every failing identity is compared with [1316-I](1316-I-failures.json) by the 1302-I identity method, using the
archived [1321-I-attribution.py](1321-I-attribution.py) unchanged (the script's `byStatus` counts status against
1316). The parent then compares identities and primaries with [1330-I](1330-I-failures.json). Output:
[1333-I-failures.json](1333-I-failures.json).

## Result

**80 identities fail. Against 1316: 75 same primary, 4 changed, 1 new. Against 1330: 3 gone, 1 new, 1 changed
primary.**

- Gone against 1330: the three R3 target rows (`bridge-p14b2-checkpoint` "opens genuine45 …", `p14b5-relationships`
  "no RNG reaches the seam …", `p14c3-promise-digest-continuity` "produces identical208 saves …"). The set equals
  the [1332-X](1332-X-retained-r3-dry-run.md) gone set.
- Changed primary against 1330: only the benign exporter row (temporary directory suffix). The four RETAINED-CHANGED
  rows against 1316 are L1, L2, the `p14c3-save-v38` Rule 4 leaf and that exporter row, as at 1330.
- The seven `bridge-supervisor` rows of the 1332-X scratch tree do not appear; the file passes in the repository.
- The three files R3 touched pass: `bridge-p14b2-checkpoint`, `p14b5-relationships` and
  `p14c3-promise-digest-continuity` show no failing leaf.

## The one new identity

`tests/bridge-p14p3-directing-promises.test.ts` "D17 migrates outgoing53 independently and isolates current55
campaigns" fails with "Test timed out in 60000ms." (no frame).

- **R3 did not touch it.** The file imports only `bridge/` and `src/core/` modules; it imports none of the three R3
  files or any helper they changed. Nothing under `src`, `bridge`, `generated` or `scripts` changed between the 1330
  source (350f9db5) and 59e2666a.
- **It passed in the three earlier gates** on the same imported bytes: 1321, 1325 and 1330. The whole file took
  306,929 ms, 312,353 ms and 322,085 ms there, and 374,984 ms here.
- **Measured alone at HEAD** after the gate ([run 1](1333-I-d17-solo-run1.txt), [run 2](1333-I-d17-solo-run2.txt)):
  the leaf passes both times, in 100,081 ms and 97,285 ms, with the file's `TIMEOUT` of 60,000 ms (`:30`, applied at
  `:671`). Run alone, it also builds the memoized `bound52` world that D15 builds first in the full file.

The leaf's measured duration exceeds its declared budget. Vitest's timeout can fire only while the event loop is
free, so a synchronous body can outrun it; whether the timeout fires depends on when the body next yields and on load.
The parent infers this mechanism and has not isolated it further. The outcome depends on load, not on the source
under test. The row is attributed to the time-budget class: the two core timeouts inherited from 1100 (1302-I) and the
UI C1 cluster (1303-I) have the same cause. The new row carries no 1302 cluster id (`cluster_1302: null`). The leaf's budget is a separate test-side fix outside R3.

## Retained after R3 (80)

C8 natural-search exhaustion 42, inherited from 1100 9, UNRESOLVED 7 (ledger 4, seating preference 3; attributed by
1332-A to 969fb459 and waiting on D-1329-1), C17 6, C16 5, C3 3, C15 2, C16b 2, C1 1, C20 1 (Rule 4 leaf), benign 1,
plus the new D17 timing row.

## Disposition

Repair R3 removes the three identities it targeted from the broad core gate. It introduces no failure it caused; the
one new identity is a load-dependent timeout in a file whose imported source is unchanged.
