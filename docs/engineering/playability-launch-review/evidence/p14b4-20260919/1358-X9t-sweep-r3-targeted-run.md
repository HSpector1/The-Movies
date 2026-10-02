# 1358-X9t: parent targeted run of sweep r3

The parent ran sweep revision r3 ([1358-F12](1358-F12-parent-rulings-on-D9-and-X8.md)) on HEAD plus production step 4
r2. The run covered the eleven files r3 changed and `bridge-contract-generator`, on dry-run script v2.
- **Results.** The type gates exit 0 and the generator checks pass. The slice B files fail only on the three row 6
  exceptions.
- **The 12 files.** 241 of 244 pass. The three failures are D07 and D18, two retained 1348-I identities, and the P4
  leaf, which waits for the recorded producer run.
- **F10.** The identity leaf that failed in 1358-X8 passes, now that the union fixtures module is a real copy.

## How it ran

- **Script.** [run-1358-sweep-dry-v2.sh](1358-stage/sweep-r3/run-1358-sweep-dry-v2.sh) `x9t sweep-r3.patch`, with
  `CORE_LIST` set to [x9t-list.txt](1358-stage/sweep-r3/x9t-list.txt) and `SKIP_UI=1`.
  - It ran alone in the heavy lane on 2026-10-02 from 08:48:55 to 08:59:56 CDT, on Node v20.20.2.
  - v2 differs from v1 in one respect. `tests/fixtures` is a real directory of links, and
    `bridge-contract-union-fixtures.ts` is a real copy, so its relative import of `bridge/schema/bridge-schema.ts`
    resolves inside the tree (1358-F12 ruling 8).
- **Tree.** An archive of HEAD e0dfe065, whose source equals 5245072a's.
  - Step 4 r2 (2004b500…) was applied: 13 files, +712/-122.
  - Sweep r3 ([1358-sweep-r3.patch](1358-stage/sweep-r3/1358-sweep-r3.patch), d2e89b46…) was applied: 154 files,
    +1,057/-679.
- **Outputs.** [1358-stage/sweep-r3/x9t/](1358-stage/sweep-r3/x9t/). The parent deleted the tree after reading them.

## Results

| Stage | Result |
|---|---|
| Type gates (root, UI, Bridge) | exit 0, 0, 0; 0 errors |
| Generator checks | both exit 0 |
| Six slice B files plus `p14b10-mentor-label` | 154 passed, 3 failed (157): the three 1344-F6 row 6 exceptions in `p14b5-relationships` (family 2, two leaves; family 5, one leaf) |
| r3's eleven files plus `bridge-contract-generator` | 241 passed, 3 failed (244) |

Per file:

| File | Tests | Failed |
|---|---|---|
| `bridge-contract-generator` | 31 | 1: the P4 leaf, "pins exact positive output identities and deterministic rerendering" |
| `p14p3-directing-promises` | 20 | 2: D07 and D18, retained 1348-I identities ("fixture premise: the same fixed rival really wins the later focus case") |
| `p14c2rm-writer-continuation` | 64 | 0 |
| `p14d1-rival-shelving` | 28 | 0 |
| `p14d1-rival-shelving-save-v43` | 18 | 0 |
| `p14r3-save-v41` | 17 | 0 |
| `p14c2s-scientist-retirement` | 15 | 0 |
| `p14c2b-save-v36` | 14 | 0 |
| `p14c3-dual-extensions` | 12 | 0 |
| `p14c3-cohort-transition` | 9 | 0 |
| `p13b-s8-save-v27` | 8 | 0 |
| `p14c3-offmenu-extensions` | 8 | 0 |

## What the run shows

- **R2.** "validation authority never leaks between campaigns …" passes with the pinned case-1 refusal.
- **R4.** The receipt cover passes with the engine's shelving values (`p14d1-rival-shelving-save-v43`, 18 of 18).
- **The week-93 control.** It passes with slice B's edge roots taken out of the candidate (1358-F12 ruling 7).
- **F10 and F11.** "F10 emits sound request and response union shapes …" and "F11 preserves command member-only
  directorId …" both pass. F10 now renders step 4's schema identity, `74826ef4…`.
- **The P4 leaf.** It fails as 1358-F9 expects. F10 renders to sha256
  `1dadf88fb7230405a6232fff3a37e3aee9014718200dfdb8baf4ff385ab71fa4` against the projection-56 pin `a0f316eb…`.
  - The leaf stops at the first mismatch, so F11's render goes unreported here.
  - Neither value comes from this message. The recorded producer run supplies both, and the parent cross-checks its F10
    against the value above.
- **D07 and D18.** They fail with their 1348-I premise message, unchanged.

## Revision r4

[1358-D9b](1358-D9b-sweep-r3-delta.md) confirmed r3 and recommended one comment fix (D9b N1). Revision r4 applies it:
- **The delta.** The r2 comment above the week-93 lift (`p14d1-rival-shelving:565-567`) now states what the r3 code
  does. One file changes, +2/-1, comment lines only.
- **The patch.** [1358-sweep-r4.patch](1358-stage/sweep-r4/1358-sweep-r4.patch), sha256 94f0b476…, covers 154 test files
  (+1,058/-679).
- **Scratch.** It sits on branch `sweep-r4` (4e36a25) in the merge worktree.
- **Coverage.** X9t measured every r4 line except that comment. The recorded gates measure the landed tree.
