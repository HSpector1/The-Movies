*** SUPERSEDED BY COMMITTED HEAD b6130c81 ***

As of the 2026-07-28 follow-up commit, this WIP package is HISTORICAL EVIDENCE ONLY.
The Lab03 hero-soundstage work it captured has since been COMMITTED in the source repo as
`b6130c81` ("refine hero soundstage visual target") and now lives directly under
`../committed/`. Restore from `../committed/` (which is at b6130c81), NOT from this package.

Do NOT apply `working-tree.patch` to a tree already at b6130c81 — it was generated against
the earlier `1c86dd3` and would conflict. This directory is retained only to preserve the
exact working-tree state that existed at the original backup (2026-07-28T17:09Z).

--------------------------------------------------------------------------

UNCOMMITTED WORK-IN-PROGRESS RECOVERY  (state at original capture; now superseded)

These files and patches were not accepted or committed in the source
repository AT THE TIME OF THE ORIGINAL CAPTURE. They are preserved only so active
work can be recovered. They must not be treated as an approved milestone.

--------------------------------------------------------------------------

This is the Asset Lab's Lab03 hero-soundstage work, which was uncommitted
(pending owner review) at capture on 2026-07-28.

Contents:
  working-tree.patch          binary patch of the 10 modified tracked files
  staged.patch                empty (nothing was staged)
  untracked-manifest.txt      all 52 untracked paths at capture
  excluded-proof-manifest.txt the 42 proof/lab03 PNGs (~123 MB) NOT copied here
  untracked/                  the 10 recoverable untracked source/doc/tool files

To recover, restore asset-lab/committed/ FIRST, then apply this package on top.
Inspect before applying:  git apply --check working-tree.patch
Full steps: see ../../RECOVERY-GUIDE.md section 4.

The excluded proof PNGs can be regenerated with tools/capture-lab03.mjs after
the lab runs; they were left out to keep the backup lean, per owner instruction.
