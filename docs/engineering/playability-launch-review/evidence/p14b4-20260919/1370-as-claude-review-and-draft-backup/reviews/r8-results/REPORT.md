# R8 retained-result reconciliation

No test, source edit, production write or Git command was performed. Original reports are preserved.

## Corrected observed state

| Batch | PASS | FAIL | SKIP | TODO | SAME | NEW | CHANGED | GONE | UNPAIRED |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| b1-modified10 | 140 | 7 | 0 | 0 | 0 | 7 | 0 | 0 | 0 |
| b2-recovery-own | 210 | 1 | 2 | 2 | 1 | 0 | 0 | 0 | 0 |
| b3-p15 | 35 | 61 | 0 | 0 | 40 | 21 | 0 | 0 | 0 |
| b4-helper-consumers | 405 | 25 | 1 | 5 | 24 | 0 | 1 | 0 | 0 |
| b5-backward | 283 | 2 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| b6-current | 1349 | 45 | 0 | 1 | 42 | 0 | 3 | 0 | 0 |
| b7-rerun-docs-fixed | 189 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Latest per-file union:** 167 files, 2,450 PASS / 113 FAIL / 3 SKIP / 8 TODO. b7 is an observation replacement, not 189 additional cases.

Root and bridge types, UI types after sparse-public repair, and both generator checks passed. Exact commands/exits/log paths remain in the authenticated gates/results.jsonl; the first UI type failure remains retained.

b7 passed 189/189 and resolves all seven original b1 and all 21 original b3 docs-ENOENT failures by exact identity/occurrence. Their original failures remain historical observations. The 40 market failures in b3 are not erased.

## Broad predecessor comparison

The authentic named core-6510c971 baseline completed exit 1 from 20:20:32Z to 22:34:15Z. Its recorded HEAD is 6510c971bed8079f7ca02e528b224988de092c87. The baseline JSON and immediate metadata are backed up under predecessor/. No other scratch session was searched.

b4/b5/b6 pair 72 current failed occurrences: 68 SAME primary diagnostics, zero NEW, four CHANGED, zero GONE and zero UNPAIRED. All exact identities and both primary diagnostics are in RESULTS-REVIEW.json. SAME excludes stack/timing and does not claim semantic neutrality.

### Four changed diagnostics

- tests/p14b4-rival-seating-preference.test.ts — P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) a met promise never counts (control, r02 chain): after r02's w211 picture satisfies its three P1 roots at w216, its next real decision has no member and takes the ordinary pick (occurrence 1). Previous: `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:`; current: `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:`.
- tests/bridge-p14b5-relationships.test.ts — family 12 — the R-D5 natural-chain LEDGER (measured; the frozen controls MUST NOT move at T2; after T2 every settlement is checked against the D5 receipt facts) p13a-core-causal-01: chain digests, row counts, churn rosters empty under D1, zero exposed rows through 416; the nine frozen drop templates only (occurrence 1). Previous: `AssertionError: expected '8a4df62fdd64ba26fc6e00e438c47c2574992…' to be '706e54c6ec9728df1664025982ebbafeb0fc3…' // Object.is equality`; current: `AssertionError: expected [ { week: 208, …(11) }, …(17) ] to have a length of 40 but got 18`.
- tests/bridge-p14b5-relationships.test.ts — family 12 — the R-D5 natural-chain LEDGER (measured; the frozen controls MUST NOT move at T2; after T2 every settlement is checked against the D5 receipt facts) p13-public-commercial-adoption: chain digests, row counts, churn rosters empty under D1, zero exposed rows through 416; the nine frozen drop templates only (occurrence 1). Previous: `AssertionError: expected '62c9fd5d2d7887b1b6263a38f9545f2ad77cd…' to be 'c034f2fb5a8e5f454a475020cec9de1ac764d…' // Object.is equality`; current: `AssertionError: expected [ { week: 208, …(11) }, …(41) ] to have a length of 48 but got 42`.
- tests/p14c3-save-v38.test.ts — C.3 A01/A02 exact Save38 opening exposes matching strict38 conversion, validation and current migration over a genuine37 save (occurrence 1). Previous: `AssertionError: expected '{"broadcastCache":[],"saveVersion":45…' to be '{"broadcastCache":[],"saveVersion":38…' // Object.is equality`; current: `AssertionError: expected '{"broadcastCache":[],"saveVersion":46…' to be '{"broadcastCache":[],"saveVersion":38…' // Object.is equality`.

The two relationship diagnostics expose the already-named 40→18 and 48→42 ledger boundaries. This comparison does not explain their cause or admit them. The Save38 opening diagnostic changes the current serialized era from 45 to 46; that is plausibly affected by the intentional sweep but remains CHANGED pending exact predicate attribution. The seating control reports a different falsy assertion and needs source/premise examination.

## Useful bounded corrections

1. Replace REPORT.md RESULTS-* placeholders with these actual results, recording b7 reconciliation and its separate environment repair. Do not replace original JSON/logs.
2. Extend the report’s predecessor attribution to include these four CHANGED diagnostics. Existing tests/comparison.json covers only b1–b3 and cannot justify broad success.
3. Preserve all remaining SAME failures as failures. Any closure or fixture replacement needs its original causal/premise contract, not a generic CLI fix.
4. Package missing report/manifests/actual founding evidence separately and reconcile incompatible Save46 allocations at integration; this review does not authorize source landing.

## Lessons

- Sparse clones require explicit test evidence/public-asset dependencies before running a selection; later GREEN is paired against the same original test occurrences.
- Reconcile reruns by file/test/occurrence rather than summing JSON headers or retaining stale NEW labels.
- Pair exact predecessor diagnostics before calling an inherited failure SAME; preserve CHANGED even where both attempts are red.
- A successful transplant, type check or generator check is distinct from broad behavior, full ledger and source landing admission.

All inspected input hashes and exact existing log paths are recorded in RESULTS-REVIEW.json.
