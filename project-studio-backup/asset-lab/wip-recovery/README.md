UNCOMMITTED WORK-IN-PROGRESS RECOVERY

These files and patches were not accepted or committed in the source
repository. They are preserved only so active work can be recovered.
They must not be treated as an approved milestone.

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
