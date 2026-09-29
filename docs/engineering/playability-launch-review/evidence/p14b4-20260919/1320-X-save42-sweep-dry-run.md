# 1320-X: scratch dry run of the staged Save42 pin sweep

Scratch tree: an archive of HEAD 2aca66ec (`src`, `bridge`, `ui`, `generated`, `scripts`, configs,
`AUDIO-PROVENANCE.md`, `tests/` without fixture payloads), with `tests/fixtures`, `docs`, `node_modules`, `art` and
`tools` linked read-only, then [1320-save42-sweep.patch](1320-stage/1320-save42-sweep.patch) (131 files, sha256
0145afcb…, applies cleanly; no added or renamed file).

- Type gates: root, Bridge and UI `tsc --noEmit` exit 0 (1319-T's 22 errors are gone).
- Full core, the 422-file allowlist: **158 failed, 4523 passed, 3 skipped, 11 todo**
  ([extract](1320-X-fullcore-extract.txt), [rows](1320-X-fullcore-rows.json)). Against 1316: all 151 retained
  identities fail (137 same primary, 14 changed), none is gone, and 7 are new. The 7 new rows are `bridge-supervisor`
  ("Fake Unity did not report started/health/helper"), the scratch artifact 1309-X3/X4 recorded; the file passed at
  1316 in the repository. The 14 changed primaries keep their 1316 causes: the six
  `p14c3-canonical-rival-history` leaves receive a different `sha(exportSave(makeSave(state)))` because the live save
  format changed (pinned value unchanged); `p14c3-save-v38:85` (C20) reads `saveVersion` 42; the six C17 ENOENT rows and
  the benign exporter row carry the scratch path. The 705 Save42 rows of 1320-M are gone.
- UI project: **26 failed, 2666 passed, 5 skipped** ([extract](1320-X-ui-extract.txt)). Against 1317: 1 new, 8 gone.
  The new row is `livingTurn.scheduler`'s first leaf at the first Lot mount (`:207`), the C1-family mount race 1317-I
  measured; the 8 gone rows are timing rows that passed this run. The `NextEventApp:1929` leaf 1320-M2 set aside passes.
  The `audio-provenance` artifact of earlier scratch runs is gone with `AUDIO-PROVENANCE.md` archived.

The handback's four unresolved items (`p14c3-save-v38:72` and `:79`, `p14p3-directing-promises` D14, D07/D18) are
retained 1316 identities (C20, C16b) and fail here as retained rows; the sweep does not change their causes.

Next: independent review 1320-D, then application (1320-E) and the recorded broad gates.
