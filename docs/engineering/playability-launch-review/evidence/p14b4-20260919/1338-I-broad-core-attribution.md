# 1338-I: attribution of the recorded broad core gate after timing repair T1

## Run identity

- Command: `vitest run --project core` over the 422-file allowlist of
  [1338-t1-broad-core-collection-preflight.json](1338-t1-broad-core-collection-preflight.json), recorded as
  [1338-t1-broad-core](1338-t1-broad-core.json) at source and HEAD ff803032 (equal to the remote at preflight),
  17:02:22Z to 18:27:53Z, exit 1, empty tested diff. Bounded guards `allGuardsExact: true`, `fixedSource: true`;
  collection postflight 422 reported files, equal to the allowlist, no excluded path.
- Raw: [1338-t1-broad-core.txt](1338-t1-broad-core.txt), 14,839,463 bytes, sha256
  eda4ae257e5c71d42f1bb5823314b6a1d30872ae9d98350d851cd1d9ebf1b68c.
- Tally: **21 failed files, 79 failed tests, 4602 passed, 3 skipped, 11 todo** (4695); no unhandled error.

## Method

The archived [1321-I-attribution.py](1321-I-attribution.py), unchanged, classifies each identity against 1316
(`status_vs_1316`). The parent then compares identities and primaries with [1333-I](1333-I-failures.json). Output:
[1338-I-failures.json](1338-I-failures.json).

## Result

- Against 1316: 75 RETAINED-SAME, 4 RETAINED-CHANGED, 0 NEW.
- Against 1333: **1 gone, 0 new, 1 changed primary.**
  - Gone: `bridge-p14p3-directing-promises` D17, the T1 core target.
  - Changed: only the benign exporter row (temporary directory suffix).
- The file T1 touched passes whole: D15 124,558 ms, D16 109,560 ms, D17 93,169 ms, all inside the new 300,000 ms
  `TIMEOUT`. The file took 327,289 ms.

## Retained after T1 (79)

C8 natural-search exhaustion 42, inherited from 1100 9, UNRESOLVED 7 (ledger 4, seating preference 3; D-1329-1), C17
6, C16 5, C3 3, C15 2, C16b 2, C1 1, C20 1 (Rule 4 leaf), benign 1. No timing row fails.

## Disposition

T1 removes the D17 identity from the broad core gate and introduces none. The three P3 Bridge leaves ran 93-125 s under
full-suite load, well inside the 300 s budget.
