# Failed r10 adoption raw leaf: r2 exact-disposition static review

Decision: **ACCEPT_STATIC_EXACT_REMOVAL_WITH_OWN_LANE_LOCK_ONLY** for `delete_exact_raw_leaf_r2.py` at SHA-256 `e37b6113e37af8fd90e4873c49fdfc8366311e31ff7e5085adbe7790cf62ff07`. The r2 script was syntax parsed and statically compared with r1; it was **not executed** in this review. No source file or package was deleted.

The r1 lane attempted deletion at 18:18:58 CDT and recorded actual child exit **1** before `verify_committed_archive`, `inventory`, chmod or unlink. Its only error was `RuntimeError: heavy lane is active` from seeing its own lock. The r1 log SHA-256 is `6def8151da0aa83fa976e9a20c659faf29e8755e48ddf46dd`; lane metadata SHA-256 is `bc4340b4a34768d009899a50beb2d2c22e0afa0fb45c47120747b162eae8247c`. The exact raw leaf still exists, and measured free disk was 3,198,560 KiB during this review. R1 remains a failed preflight only; no deletion/admission is inferred.

The r2 diff changes only the lane ownership guard. It requires a regular no-follow `HEAVY-LANE-LOCK` whose complete content matches the exact r2 log basename and lane-run timestamp format. It also requires the current process's parent command to contain the exact `heavy-queue/lane-run.sh` path, exact r2 log path, and exact r2 script path. It rejects a missing, symlinked, oversized or differently named lock; it checks process arguments for source writers, Vitest and TypeScript, and requires `lsof +D` to find no open source files. These checks run before and after the full source inventory. The 223-member exact published-source inventory, remote commit and three Git blob reconstruction, direct failed receipts, no-follow file hashes, exact chmod/unlink/rmdir scope, and failed-run labels are unchanged from the independently reviewed r1 script.

The **only** reviewed invocation is:

```sh
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/1370-r10-raw-leaf-disposition-r2.log python3 -I -B /Users/zacheryspector/studio-scratch/1370-r10-raw-leaf-disposition-proposal-r2/delete_exact_raw_leaf_r2.py
```

Inspect the `.log.meta` **actual child exit**, script JSON, exact source absence, and adjacent artifact survival. If any guard fails, preserve the source and record the failure. The raw leaf currently occupies 1,050,528 KiB; even full reclamation projects free space near 4,249,088 KiB, about 207,360 KiB below the 4.25 GiB r12 preflight. Remeasure after any successful deletion and do not launch r12 until its own disk and AC guards pass. This is only disk disposition of a remotely preserved **failed** capture.
