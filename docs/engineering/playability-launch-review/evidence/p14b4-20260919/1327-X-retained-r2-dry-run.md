# 1327-X: scratch dry run of the staged retained-defect repair R2 (revision 2)

Scratch tree: an archive of HEAD 4c851445 (`src`, `bridge`, `ui`, `generated`, `scripts`, configs,
`AUDIO-PROVENANCE.md`, `tests/` without fixture payloads), with `tests/fixtures`, `docs`, `node_modules`, `art` and
`tools` linked read-only, then [1327-retained-r2.patch](1327-stage/1327-retained-r2.patch) revision 2 (7 files under
`tests/`, sha256 fbc3ac33…, applies cleanly; no added or renamed file).

- Type gates: root, Bridge and UI `tsc --noEmit` exit 0.
- Full core, the 422-file allowlist: **89 failed, 4592 passed, 3 skipped, 11 todo**
  ([extract](1327-X-fullcore-extract.txt), [rows](1327-X-fullcore-rows.json)).
- Against the recorded [1325](1325-I-broad-core-attribution.md) set: **11 gone, 7 new, 10 changed primaries.**
  - Gone: the 10 R2 target rows the handback reports passing (C12 2; C15 5: `p13b-r07-save-v25` 2,
    `facility-move-demolish:870`, `p14c2s-scientist-retirement` S10, `bridge-runtime-checkpoint:431`; C3 K1-K3) plus K4
    under the 1327-F amendment.
  - New: the 7 `bridge-supervisor` rows ("Fake Unity did not report started/health/helper"), the scratch artifact of
    1309-X3/X4, 1320-X and 1324-X; the file passes in the repository (1325).
  - Changed: L1 and L2 of `p14c3-canonical-rival-history` now reach the cause the C3 memo masked,
    "L passive work premise ended without an obligation" with finality cause `noCatalogue` at week 607
    (`tests/helpers/p14c3-canonical-rival-fixtures.ts:290`, frame `tests/p14c3-canonical-rival-history.test.ts:260`),
    as 1327-C measured; the six C17 ENOENT rows and the benign exporter row carry the scratch path.
- Touched files: `bridge-contract-generator` 31/31, `bridge-runtime-checkpoint` 71/71, `facility-move-demolish` 30/30,
  `p14c2s-scientist-retirement` 15/15, `p13b-r07-save-v25` 8/8; `p14c3-canonical-rival-history` 4/6 (L1, L2);
  `bridge-p14c2rm-retirement` (untouched) keeps its two rule 6 leaves.
- UI: not run. No UI test imports any touched file; the recorded UI gate after application confirms it.

## Points for the independent review

1. The S10 block strips a non-empty `firstTakeSubjects` unconditionally under its own "reader-only schema mutations"
   convention (1327-F accepts the reading); the other two C15 reconstructions assert the root is empty before
   removing it.
2. `bridge-runtime-checkpoint:431` expects `/canonical V42 save bytes exactly/`, the measured message of
   `bridge/runtime-checkpoint.ts:501` (`V${LIVE_SAVE_VERSION}`); the literal 42 will need the next live-version sweep,
   as the other S2/S8 literals do.
3. `p14c3-canonical-rival-fixtures.ts:187` compares the Save38 down-projection with the unchanged
   `CANONICAL_INITIAL_SHA` and asserts the live envelope's version; the converters' own guards throw on non-empty V40-V42
   content, so a week-0 change in those roots fails loudly (1327-B).

Next: independent review 1327-D, then application (1327-E) and the recorded broad core and UI gates.
