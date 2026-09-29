# 1332-X: scratch dry run of the staged retained-defect repair R3 (revision 2)

Scratch tree: an archive of HEAD 59fee88c (`src`, `bridge`, `ui`, `generated`, `scripts`, configs,
`AUDIO-PROVENANCE.md`, `tests/` without fixture payloads), with `tests/fixtures`, `docs`, `node_modules`, `art` and
`tools` linked read-only. Nothing outside `docs/` changed between the author's base ba7a9752 and 59fee88c. The tree
then takes [1332-retained-r3-r2.patch](1332-stage/1332-retained-r3-r2.patch): 3 files under `tests/`, 15,739 bytes,
sha256 1895496e…, applies cleanly, 125 insertions and 4 deletions.

- Type gates: root, Bridge and UI `tsc --noEmit` exit 0.
- Touched files together: `bridge-p14b2-checkpoint` 2/2, `p14b5-relationships` 46/46,
  `p14c3-promise-digest-continuity` 8/8 (56 passed).
- Full core, the 422-file allowlist of the 1330 collection preflight: **86 failed, 4595 passed, 3 skipped, 11 todo**
  ([extract](1332-X-fullcore-extract.txt), [rows](1332-X-fullcore-rows.json), parsed by the archived
  `1321-I-attribution.py` unchanged).
- Against the recorded [1330](1330-I-broad-core-attribution.md) set: **3 gone, 7 new, 7 changed primaries.**
  - Gone: the three R3 target rows (`bridge-p14b2-checkpoint` "opens genuine45 …", `p14b5-relationships` "no RNG
    reaches the seam …", `p14c3-promise-digest-continuity` "produces identical208 saves …").
  - New: the 7 `bridge-supervisor` rows ("Fake Unity did not report started/health/helper"), the scratch artifact of
    1309-X3/X4, 1320-X, 1324-X and 1327-X; the file passes in the repository (1330).
  - Changed: the six C17 ENOENT rows and the benign exporter row, whose messages now carry the scratch path. No other
    primary changed.
- The seven D-1329-1 rows (ledger family 12, seating preference) and every other retained row fail as at 1330.
- UI: not run. The patch touches three core test files only; the UI project includes `ui/**` only and no UI test
  imports them. The recorded UI gate after application confirms it.

## Points for the independent review

1. `bytes()` in `p14b5-relationships` asserts the stripped root through the law's own `validateFirstTakeSubjects`
   rather than a restated fact; 1332-F2 records why the parent accepts that as amendment 2's content check.
2. The digest-continuity leaf splits bound and unbound subjects on `contractId`, which `commitWinningPromise` writes
   together with the receipt. The unbound path `toEqual`s the pre-tick receipt, and both paths assert rulesVersion 4
   (1332-C2). The unbound set and its case facts are pinned to 1332-A Attribution 3.
3. The checkpoint expectation adds `termination: 0` to every period of every `hollywood.businesses[]` entry, as
   `convertV40ToV41` does, and the root from the source's `firstTakes` length.

Next: independent review 1332-D, then application (1332-E) and the recorded broad core and UI gates.
