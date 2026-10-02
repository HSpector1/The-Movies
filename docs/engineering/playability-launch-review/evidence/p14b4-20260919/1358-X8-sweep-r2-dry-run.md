# 1358-X8: parent dry run of sweep r2, the first full core measurement of the sweep

This run measures sweep revision r2 ([1358-F11](1358-F11-parent-rulings-after-X6-and-X7t.md)) on HEAD plus production
step 4 r2, with probe 4. **Against 1348-I, core shows 78 SAME, 7 CHANGED, 9 NEW and 0 GONE.**
- Every CHANGED row and 8 of the 9 NEW rows are attributed: C20, scratch-path and scratch-process artifacts, and the
  week-93 control.
- The ninth NEW row is the F10 generator leaf. It fails only because this tree linked `tests/fixtures`.
- UI equals 1348-I2.
- The type gates exit 0, and the slice B files read as the GREEN must.

## How it ran

- **Script.** [run-1358-sweep-dry.sh](1358-stage/sweep-r1/run-1358-sweep-dry.sh) `x8 sweep-x8.patch probe4.patch
  probe4-files.txt`, alone in the heavy lane under `HEAVY-LANE-LOCK`, on 2026-10-02 from 06:58:49 to 08:47:03 CDT, Node
  v20.20.2.
- **Tree.** An archive of HEAD 4e411b78, whose source equals 5245072a's. Step 4 r2 (2004b500…) and the sweep r2 patch
  ([1358-sweep-r2.patch](1358-stage/sweep-r2/1358-sweep-r2.patch), e1f93665…, 154 test files, +1,039/-676) were applied.
  `docs`, `node_modules`, `art`, `tools` and `tests/fixtures` were linked.
- **Probe 4.** Two files: F1's capture lines in `p14p3-directing-promises` and the week-93 counts in
  `p14d1-rival-shelving`. It was applied after the slice B run and reversed before core.
- **Outputs.** [1358-stage/sweep-r2/x8/](1358-stage/sweep-r2/x8/). The parent deleted the tree after reading them.

## Results

| Stage | Result |
|---|---|
| Type gates (root, UI, Bridge) | exit 0, 0, 0; 0 errors |
| Generator checks | both exit 0 |
| Six slice B files plus `p14b10-mentor-label` | 154 passed, 3 failed (157): the three 1344-F6 row 6 exceptions |
| Probe 4 | 45 passed, 3 failed (48); 3 probe lines |
| Core, 440 files | **94 failed, 4,983 passed**, 3 skipped, 11 todo (5,091) |
| UI | 2,689 passed, 3 failed, 5 skipped (2,697) |

### Core against 1348-I

[core-vs1348I.json](1358-stage/sweep-r2/x8/core-vs1348I.json):

- **SAME 78.**
- **CHANGED 7:**
  - C20 (`p14c3-save-v38`, "exposes matching strict38 conversion …"), whose primary embeds the live version, now 44
    (1358-F9 ruling 7);
  - six `r3n1-stale-schedule-take-02*` C17 rows, whose `ENOENT` primaries differ only in the scratch path.
- **NEW 9:**
  - **Seven `bridge-supervisor` rows, "Fake Unity did not report …".** These are the scratch-tree process artifact of
    1320-X and 1344-X9; 1358-M2 shows them too.
  - **`p14d1-rival-shelving`, the week-93 control.** Probe 4 counted the candidate's week-93 state: 24 edges, 0 log
    rows and 15 romance tracks. The state equals the genuine input once both sides carry empty roots
    (`equalNormalized: true`). Revision r3 settles it ([1358-F12](1358-F12-parent-rulings-on-D9-and-X8.md)).
  - **`bridge-contract-generator`, "F10 emits sound request and response union shapes …".** It fails because
    `'// Schema identity: sha256:74826ef4…'` is missing; the rendered C# names `349b2d3e…` beside `ProjectionVersion =
    57`.
    - The cause is the scratch tree. `tests/fixtures/bridge-contract-union-fixtures.ts` builds F10 and F11 from
      `BRIDGE_SCHEMA`, imported by a path relative to itself.
    - Vite resolves a module's real path, so the linked fixtures file imported the repository's pre-step-4 schema.
    - The same artifact let the P4 leaf, "pins exact positive output identities …", pass here.
    - In the repository, or in a tree whose fixtures file is a real copy, F10 renders step 4's schema. G2's identity
      pin then holds, and F10 and F11 move as 1358-J finding 10 states.
    - No other test imports a module from `tests/fixtures` (a `git grep` over tests and `ui/src`).
- **GONE 0.** Every retained identity fails again with its 1348 primary, apart from the attributed CHANGED rows.

### UI against 1348-I2

[ui-vs1348I2.json](1358-stage/sweep-r2/x8/ui-vs1348I2.json): CHANGED 3 (the numpy rows, by path), NEW 0, GONE 0.

### Probe 4

[probe-lines.txt](1358-stage/sweep-r2/x8/probe-lines.txt):
- **D13's and D12's captures.** Both captures (Save39) reach V40 through `convertV39ToV40` and round-trip equal. They
  hold no romance or log key. `makeSaveV1`, `makeSaveV13` and `makeSaveV18` each refuse: "cannot downgrade or discard an
  explicit Director promise predicate". D13 and D12 pass.
- **N-0140.** The candidate has 24 edges, 0 log rows and 15 tracks; `equal` is false and `equalNormalized` is true.

## What follows

- **Revision r3** answers [1358-D9](1358-D9-sweep-r2-review.md) R2 and R4, the comment items N1 to N3, and 1358-F12.
- **1358-X9t** measures r3 on a targeted set with a real fixtures file, to show the F10 identity leaf passing before
  the landing.
- **In the repository, the P4 leaf fails until F10 and F11 take the recorded producer run's values.** The landing
  orders that run (1358-L).
