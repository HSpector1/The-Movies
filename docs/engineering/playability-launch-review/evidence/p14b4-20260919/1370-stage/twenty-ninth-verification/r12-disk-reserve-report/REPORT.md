# R12 disk reserve: exact scratch archive replicas

Read-only inspection on 2026-10-07. No files were removed.

The production worktree was clean at `b995a83e5363a3843f9b902e08c2df4dd95840cb`; `git ls-remote origin refs/heads/wip/headless-program-20260916-ts` returned that same commit. The two published twins below are tracked at that commit. The filesystem had **4,470,428 KiB** available (`df -k`) at the final measurement; the R12 launch preflight is **4,456,448 KiB**, leaving only **13,980 KiB**. Recheck immediately before each launch.

| Exact scratch replica | Allocated `du -sk` | Published twin under `/Users/zacheryspector/The-Movies-headless-program/` | SHA-256 of both |
|---|---:|---|---|
| `1369-checkpoint-20-archive-r1/evidence.tar.gz` | 21,560 KiB | `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1369-stage/twentieth-verification/evidence.tar.gz` | `e06cd73d4fbe10b2195d50d9fd88443baa96190969e259d2650762529762edb0` |
| `1369-checkpoint-20-archive-r1/repeat.tar.gz` | 21,560 KiB | same published twin | same |
| `1369-checkpoint-20-archive-independent-review-r1/independent-repeat.tar.gz` | 21,560 KiB | same published twin | same |
| `1370-k-evidence-archive-proposal-r1/EVIDENCE.tar.gz` | 27,484 KiB | `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-fifth-verification/EVIDENCE.tar.gz` | `4026eca5b58355ac2832bdf82c766a5754f6e2ad72ddeac5424fdf69a753456c` |

All six inspected files have distinct inode numbers and link count 1. The four scratch copies occupy **92,164 KiB** in total. They are byte-identical to published, remotely backed-up evidence, while their build scripts, manifests, receipts, and reviews should remain. A cautious deletion order is the three twentieth-verification scratch replicas, one at a time with SHA check and `df -k` after each, then the twenty-fifth-verification scratch replica. Check the remote ref, clean worktree, exact path, inode/link count, twin SHA and target SHA immediately before removing each specific file. Recheck available blocks afterward; APFS physical reclamation can vary.

The 1368 save46 proposal checkouts are **not** candidates for routine cleanup. Their Git trees contain dirty, unlanded source/test/fixture states, including the R8 kit. Do not delete them without a separate complete preservation and restoration audit. Also leave active R12 candidates, recordings, and the remote-retrieval directory untouched.
