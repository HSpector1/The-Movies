# 1324-X: scratch dry run of the staged retained-defect repair R1

Scratch tree: an archive of HEAD 133aca7a (`src`, `bridge`, `ui`, `generated`, `scripts`, configs,
`AUDIO-PROVENANCE.md`, `tests/` without fixture payloads), with `tests/fixtures`, `docs`, `node_modules`, `art` and
`tools` linked read-only, then [1324-retained-r1.patch](1324-stage/1324-retained-r1.patch) (7 files under `tests/`,
sha256 cbbbed4e…, applies cleanly; no added or renamed file).

- Type gates: root, Bridge and UI `tsc --noEmit` exit 0.
- Full core, the 422-file allowlist of 1321: **100 failed, 4581 passed, 3 skipped, 11 todo**
  ([extract](1324-X-fullcore-extract.txt), [rows](1324-X-fullcore-rows.json)). Against 1316: 93 retained identities
  fail (79 same primary, 14 changed), 58 are gone, 7 are new.
- The 7 new rows are `bridge-supervisor` ("Fake Unity did not report started/health/helper"), the scratch artifact
  1309-X3/X4 and 1320-X recorded; the file passed in the repository at 1316 and 1321.
- The 14 changed primaries are the rows 1320-X and 1321-I recorded with the same causes: six
  `p14c3-canonical-rival-history` leaves (received digest of the Save42 format, pin unchanged), six C17 ENOENT rows and
  the benign exporter row (scratch path), and `p14c3-save-v38` "exposes matching strict38 conversion…", now at `:93`
  because the patch adds eight lines above it.
- The 58 gone identities: the 56 target rows the handback reports passing (C6 25, C7 23, C20 8) plus the two
  `c2a-m2-sets-save` leaves 1302-I filed under C1. Their 1321 refusal was
  `validateSaveV12: state has unknown field "firstTakeSubjects"` thrown inside `v13TwinOf`
  (`tests/contracts/_v14Contract.ts:520`), the C6 cause; the C6 edit clears it and both leaves run to their own
  assertions (the file passes, 4 tests). The handback's `_v14Contract` consumer run records the same result.
- The one target row left failing is the Rule 4 leaf `p14c3-save-v38:93`: it compares a V38 conversion with
  `migrateToLive`, which tracks the live version (received `saveVersion` 42, expected 38). It stays retained under C20;
  no edit short of changing what it asserts makes it pass.
- Touched files in the full run: `p14c1-materialized-aging` 46/46, `p14b5-t-failure-tuning` 12/12,
  `v14-migration.contract` 30/30, `bridge-p14c2rm-runtime` 8/8, `bridge-p14c3-promise-digest-continuity` 2/2,
  `p14c3-save-v38` 46/47 (the Rule 4 leaf), `p14p3-directing-promises` 18/20 (D07 and D18, retained C16b, outside R1).
- UI: not run. No UI test imports any of the seven touched files (`ui/src/test/pinnedSaveFixture.ts` names
  `_v14Contract.ts` in a comment only), and the UI project includes `ui/**` only. The recorded UI gate after
  application confirms it.

## The dispatcher change in `p14c1-materialized-aging`

The patch replaces the `validateSaveV38` alias with the generic `validateSave` at the week-12/13 reload (section 8)
and the tamper helper of section 11. `validateSave` (`src/core/save.ts:5383`) validates only; it dispatches on the
envelope's own `saveVersion` and throws for an unknown one. Both call sites build the envelope with
`saveVersion: LIVE_SAVE_VERSION`, so each check runs `validateSaveV42`, the same validator 1320-A S1 names for a live
envelope. The four tamper causes stay distinguishable by substring. The parent judges it equal in strength to naming
`validateSaveV42`; the independent review rules on it.

Next: independent review 1324-D, then application (1324-E) and the recorded broad core and UI gates.
