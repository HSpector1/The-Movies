# 1309-X5: scratch dry run of the r5 pin sweep

Scratch tree: the 1309-X4 tree (archive of HEAD fbae16b6; `src`, `bridge`, `ui`, `generated`, `tests/` and configs are
identical at b1b40c13), `tests/` and `ui/` reset to that archive, then the r5 patch
([1309-stage5](1309-stage5/1309-pin-sweep-r5.patch), 146 files, sha256 cfabb301…) and the 1308 neighbor change.

## Disk reclamation (disclosed)

The r4 UI run and 1309-C5's baseline extraction both hit a full volume (1.8 GiB free, 99%). Before this run the
parent deleted scratch copies this session had created inside its own scratchpad: the test-author's working trees
for C3, C4 and C5 (nine archive copies of about 770 MB each), the parent's superseded scratch trees for the r2/r3 runs
and the Save42 probe copies, and four raw logs of 6–35 MB whose extracts are archived here. Nothing under the
repository, no git worktree and no fixture was touched. Free space after: 8.4 GiB.

## Results

- Type gates: root `tsc --noEmit` 0 errors, Bridge 0, UI 0. The X4 unused-import error is gone.
- Targeted core run of the five Z files and the neighbor file: **122 passed, 5 failed**
  ([extract](1309-X5-targets-extract.txt)). The five failures are the `p14c3-save-v38` A01/A02 rows that X4 attributes
  to C20 (retained), with the same leaves. Z1–Z5 pass.
- `p14c3-save-v38.test.ts:463`, which 1309-C5 flagged as possibly masked: a probe copy caught the thrown message,
  "migrateToV37: cannot downgrade or discard profession transition, industry retirement or entrant authority". That is
  the entrant guard the leaf names, so the leaf passes for its stated reason and needs no change.
- UI project: **11 failed files, 38 failed tests, 2654 passed, 5 skipped, 1 unhandled error**
  ([extract](1309-X5-ui-extract.txt)). Against the 1303-I identities: C1 timeout 6, C2 duplicate test id 7, C3 PIL 6,
  C4 PIL 4, C5 Gate Hiring 2, C7 DOM race 1 (26 retained); `audio-provenance` 6, a scratch artifact (the tree does
  not carry the root `AUDIO-PROVENANCE.md`); and 6 rows new against 1303: `StudioLotScreen` keyboard focus 1 and
  `livingTurn.scheduler` 5 ("Unable to find `studio-lot-screen`" after the same file's C1 timeout). Rerun alone, both
  files pass, 74 of 74, so the parent reads the six as timing under full-suite load; the recorded UI gate settles them.
  The unhandled `hollywoodPerformance is not a function` error is the one 1303-I records. No longer failing: C8 3,
  C6 1 and one C1 row. None of the five UI files the sweep edits fails.

## Disposition

1309-D2 ([review](1309-D2-final-sweep-review.md)) accepts r5 with no required changes. Its one unexecuted item, the
`bridge-p14p4p5-opportunities` digest pin, passed in the X4 full core run on bytes r5 leaves unchanged. Next: apply r5
and the neighbor change to `tests/` (1309-E), then the recorded broad core and UI gates.
