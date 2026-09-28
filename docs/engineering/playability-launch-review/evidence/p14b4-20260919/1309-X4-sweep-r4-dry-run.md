# 1309-X4: full scratch core run of the r4 pin sweep

Scratch tree: archive of HEAD fbae16b6, `tests/fixtures` and `docs` linked read-only, the r4 patch
([1309-stage4](1309-stage4/1309-pin-sweep-r4.patch), 146 files) and the 1308 neighbor change.

- Type gates: root 1 error (`p14c2b-save-v36.test.ts:29`, unused `validateSaveV36` import); Bridge 0; UI 0.
- Full core, 417-file allowlist, `--project core`: **39 failed files, 165 failed tests, 4482 passed, 2 skipped,
  11 todo**, 79 minutes ([extract](1309-X4-fullcore-extract.txt), [rows](1309-X4-fullcore-rows.json)). No identity fails
  here that passed on r3.

By 1302 identity: C8 42, C6 25, C7 23, UNRESOLVED 11, RETAINED 9 (+1), C20 9, NEW 9, C15 7, C3 7, C17 6, C16 5, C1 5,
C12 2, C2 2, C16b 2. Nine of the eleven UNRESOLVED rows fail exactly as at 1302 and stay retained; the
`p14b5-relationships` rngState digest pin was stale at 1302 and R3 moved its received value again (world-evolution
digest, retained for the premise increment). The NEW rows are the scratch artifacts named in 1309-X3 (`bridge-supervisor`
7, `world-first-scenery-load-in-provenance`) and Q04 below. The C1, C2 and C3 rows are retained causes now unmasked
(`c2a-m2-sets-save` and `p14c3-canonical-rival-history` reach their documented 1100/1119-A causes; R8 times out;
`bridge-p14b2-trust:363` reaches C8), except the in-scope items below.

## In-scope items for r5 (measured)

1. `bridge-schema.test.ts:576` pins `ProjectionVersion = 54` in the generated C#; the file says 56 (failed identically at
   1302, never attributed).
2. `p14p4p5-opportunities` Q04 (`:350`): the lossless downgrade compared with the genuine V39 text stops at V40.
3. `p14c3-save-v38` A11 (`:446`, both inputs): the V38 converter receives a live envelope.
4. `bridge-p14c2s-scientist-runtime` (`:119` and its sibling): the migration comparison also meets the V40
   `firstTakeSubjects` root, masked until now.
5. The unused import above.
