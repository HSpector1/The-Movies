CONSOLIDATED RECOVERY SNAPSHOT

This branch preserves multiple Project: Studio development tracks.
It is not a production integration branch and must not be merged wholesale.

Each snapshot records its original repository, branch, commit, working state,
license boundaries, and recovery instructions.

--------------------------------------------------------------------------

WHAT THIS BRANCH IS

  A point-in-time disaster-recovery copy of four separate Project: Studio
  repositories plus the governance document package, captured on 2026-07-28.

  It is an ORPHAN branch. It shares no history with any line of development
  (main, phase-5.1-talent, phase-5.2-*, studio-lot-spike). That is deliberate:
  it cannot be fast-forwarded or "merged" into a working branch. It exists
  only to be READ and to have individual tracks RESTORED from it.

WHAT THIS BRANCH IS NOT

  Not a merge. Not production integration. Not Gate D. Not OC-01.
  Not a refactor. Not newer authority than the live source documents.

WHERE TO START

  Read  project-studio-backup/README.md
  Then  project-studio-backup/RECOVERY-GUIDE.md   (how to restore each track)
  And   project-studio-backup/SOURCE-STATE.md     (exact source commits/state)

DO NOT

  Do not merge this branch into a default or working branch.
  Do not treat the WIP-recovery patches as accepted, reviewed, or committed work.
  Do not treat the governance copies as more current than the live source package.
