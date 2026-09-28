# 1316-I: attribution of the recorded broad core gate after the 1309 sweep

## Run identity

- Command: `node_modules/.bin/vitest run --project core` over the 417-file allowlist of
  [1316-r2r3-broad-core-collection-preflight.json](1316-r2r3-broad-core-collection-preflight.json) (423 tracked core
  test files less the six 1296-A exclusions), recorded by `run-bounded-source-c2.mjs` as
  [1316-r2r3-broad-core](1316-r2r3-broad-core.json) at source and HEAD cd79e85b (equal to the remote at preflight),
  17:32:20Z to 18:53:18Z, exit 1. Empty tested diff ([patch](1316-r2r3-broad-core.patch), 0 bytes).
- Bounded preflight and postflight: `allGuardsExact: true`, `fixedSource: true`; source inventory 1145 files, sha256
  8588a083…. Collection postflight: 417 reported files, equal to the allowlist, no excluded path seen.
- Raw log: [1316-r2r3-broad-core.txt](1316-r2r3-broad-core.txt), 28,938,325 bytes, sha256
  e1515cff14d6b179821d5f026b40e61c3ea6296adb62b71415924abab12ccfa4.
- Tally: **35 failed files, 151 failed tests, 4496 passed, 2 skipped, 11 todo** (4660); no unhandled error.

## Method

The 1302-I identity method, unchanged: the full `FAIL |core|` header is the identity; the primary is the first
non-empty message line before the first frame; shared headers expand to one row each. Each identity is compared with
[1302-I](1302-I-failures.json) (RETAINED-SAME: byte-identical primary; RETAINED-CHANGED: other primary; NEW: absent
from 1302). The script is [1316-I-attribution.py](1316-I-attribution.py) (the 1302-I parser inlined) and its output,
every row with its 1302 cluster and its 1309-X4 scratch cluster, is [1316-I-failures.json](1316-I-failures.json).

## Result

**No new failure identity.** 137 RETAINED-SAME, 14 RETAINED-CHANGED, 0 NEW. 347 of the 498 1302 identities no longer
fail: C1 143, C2 94, C3 40, C4 23, C5 15, UNRESOLVED 10, C9 8, C13 5, C10 3, C14 2, C18 2, C11 1, C19 1. Against the
1309-X4 scratch run of r4 (165), the 9 rows X4 marked NEW are gone (the `bridge-supervisor` 7 and the
`world-first-scenery` manifest ENOENT were scratch artifacts; Q04 is fixed by Z2), and Z1, Z3 and Z4 remove the
`bridge-schema:576`, `p14c3-save-v38` A11 and `bridge-p14c2s-scientist-runtime` rows.

| 1302 cluster | Rows | Files | Status |
| --- | --- | --- | --- |
| C8 natural-search exhaustion | 42 | `p14b1-t4-regressions` 15, `p14b4-rival-seating-preference` 13, `p14b4-cast-class-outcomes` 9, `bridge-p14b2-trust` 4, `p14b2-fixture-preconditions` 1 | same |
| C6 `v13TwinOf` carrier premise | 25 | `v14-migration.contract` | same |
| C7 `firstTakeSubjects` guard | 23 | `p14c1-materialized-aging` 12, `p14b5-t-failure-tuning` 11 | same |
| UNRESOLVED | 10 | `bridge-p14b5-relationships` 4, `p14b4-rival-seating-preference` 3, `bridge-p14b2-checkpoint`, `p14b5-relationships`, `p14c3-promise-digest-continuity` | 9 same, 1 changed |
| Inherited from 1100 | 9 | seven files | same |
| C20 migration purity | 9 | `p14c3-save-v38` 5, `bridge-p14c2rm-runtime` 2, `bridge-p14c3-promise-digest-continuity`, `p14p3-directing-promises` | 8 same, 1 changed |
| C15 frozen chain boundary | 7 | five files | same |
| C3 (masked leaves) | 7 | `p14c3-canonical-rival-history` 6, `bridge-p14c3-runtime` R8 | changed |
| C17 missing generated evidence | 6 | three `r3n1-stale-schedule-take-02*` files | same |
| C16 `poachingFixture` premise | 5 | three files | same |
| C1 (masked leaves) | 3 | `c2a-m2-sets-save` 2, `bridge-p14b2-trust:363` | changed |
| C12 generator hash pins | 2 | `bridge-contract-generator` | 1 same, 1 changed |
| C16b `rivalWinner` premise | 2 | `p14p3-directing-promises` | same |
| Benign tmp suffix | 1 | `world-first-scenery-load-in-provenance` | changed |

## The 14 changed primaries

Every one is a cause 1309-X3 or X4 named in advance; none is a new production behavior.

1. `c2a-m2-sets-save` (2, C1 at 1302): the version selection no longer masks them; they now meet the C6
   `v13TwinOf` contract message ("C2a-M1 (§8.3, the widened-leaf boundary rule) contract not met"), the cause 1119-A
   documents for this file.
2. `bridge-p14b2-trust:363` (C1 at 1302): now "P14B.2 fixture: no natural rival-only promise outcome by 240", the C8
   natural-search exhaustion of its sibling rows.
3. `p14c3-canonical-rival-history` (6, C3 at 1302): the helper literal no longer masks them; they reach the digest
   pin at `:144` (received `53d1afb4…`, pinned `2f9ec0fa…`), the canonical history digest 1309-X3 lists as retained
   with its 1100/1119-A cause.
4. `bridge-p14c3-runtime` R8 (C3 at 1302): now the 5000 ms timeout 1309-X2 recorded once the literal was fixed.
5. `p14b5-relationships:544` (UNRESOLVED): the rngState digest pin, stale at 1302, receives a new value
   (`d53438d4…`); R3 moves the world-evolution digest. Retained for its premise increment.
6. `p14c3-save-v38:79` (C20): the migrated envelope reads `saveVersion` 41 where it read 40; same purity comparison.
7. `bridge-contract-generator:725` (C12): the F10 union hash moves with projection 56 (received `a0f316eb…`, was
   `8c5d2453…`); retained for re-measurement once the contract settles.
8. `world-first-scenery-load-in-provenance` (benign): the exporter command line differs only in its temporary path.

Three rows time out (`bridge-p13-campaign-isolation`, `bridge-runtime-checkpoint-prepared-reuse`, both inherited from
1100, and R8 above).

## Disposition

The 1309 sweep and the R2/R3/Save41/projection 56 production introduce no failing identity in the broad core gate.
The 151 retained failures keep their 1302 causes, open and owned as listed. None is a new failing identity
attributable to R2/R3; three of the fourteen changed-value rows (items 5-7 above) have R3, Save41 or projection 56 as
the cause of their new received value on a failure already open before 1316 (corrected per 1316-J). The UI gate
(1317) and an independent review of this attribution precede the closure (1311-K).
