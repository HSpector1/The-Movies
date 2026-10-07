# 1361 x2/x3 exact disposition r2 — independent review request

R1 independent review was **REFINE** (`/Users/zacheryspector/studio-scratch/1370-1361-tree-disposition-static-review-r1/REPORT.md`). This r2 is a separate frozen candidate. Neither source tree was deleted, and no Git state was edited. The r2 script SHA-256 is **`d6c65a479cc5238e7c040ce180bc108be33b345536e61c101d2a8b1c19e64288`**. Python AST parsed; a read-only preflight traversed each exact source tree through no-follow directory descriptors and saw **3,717 supported entries** in each. No deletion function or full script action was executed.

## R1 findings addressed

1. The request pins the exact current r2 script SHA above. Review and run only that hash. R1 stays unchanged.
2. `lane-run.sh` is mode 0644; both launch commands below invoke it with **`bash`**. The script requires an exact `bash .../lane-run.sh 0 <expected log> python3 -I -B <script>` parent and checks that the heavy-lane lock belongs to its own log. A separate `--probe-lane` mode validates only that parent and lock, emits `lane_probe_pass`, and returns without reading archives or touching either tree. Run the probe and inspect its `.meta` actual child exit and event before the deletion launch.
3. Before any mutation, the script checks remote publication and independent restoration; compares both complete original source states with the published manifest; checks `lsof` and competing processes; then enumerates **both** trees with `O_DIRECTORY|O_NOFOLLOW` directory descriptors. The enumeration checks parent and nested directory write/traverse access and rejects unsupported entries. It repeats the current tree scan before each removal.
4. Every STOP event measures free KiB and records `absent`, `present` (exact published source-state match), or `partial` for each tree. It writes an exact no-follow survivor inventory to `STOP-SURVIVORS-<pid>.json` under this scratch proposal, with each remaining path, type, mode, regular-file size/SHA-256, and symlink text; the lane log pins that file's SHA-256. If storage or access prevents a full inventory, the STOP event records that error explicitly. This covers partial `prune_fd` failure after any successful unlink.

## Frozen inputs and safety boundary

The script pins published evidence ref **`f90aed0908cf1963288936f444811ad698649fc3`**, preservation manifest SHA-256 **`2ca6045473034b1c28218ed06de30dc26e47a2ff25ca12e564edeecedc9acf11`**, and independent remote-restoration receipt SHA-256 **`b1377e297efcd979b5af8f412bba944e8e27950669ececa7c3f47e3ce12d7187`**. It verifies both x2/x3 private HEAD/tree, refs, clean ordinary status, 29 ignored entries and hashes/modes, 15 absolute symlink paths/targets and live-repository dependencies, plus the published and independently retrieved manifest bytes. The published source-state checker is pinned at SHA-256 `7fd06d6bd8555409d7e1bdefee3f2afce1731d8f1b4e23c8a99d21fdd04f1688` and imported with Python `-B` to keep the evidence worktree clean. Remote ref drift, missing receipt, a different lane lock, open files, or a changed source stops removal.

The only removal roots are `/Users/zacheryspector/studio-scratch/1361-sweep/x2/tree` and `/Users/zacheryspector/studio-scratch/1361-sweep/x3/tree`. Relative directory-descriptor operations use `stat(..., follow_symlinks=False)`, `O_NOFOLLOW`, `unlink`, and `rmdir`. Symlink targets are never opened by the removal loop. Sibling 1361 logs, patches, attribution and root stay outside the opened `tree` descriptors. Free KiB is measured after each tree. The final event reports whether the unchanged **4,456,448 KiB** floor is actually met; no projected `du` gain is treated as clearance.

## Proposed observed sequence after static acceptance

Harmless lane/lock probe, using its own log:

```bash
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/heavy-queue/1370-1361-tree-disposition-r2-probe.log python3 -I -B /Users/zacheryspector/studio-scratch/1370-1361-tree-disposition-proposal-r2/delete.py --probe-lane
```

Only if the probe child exit is 0 and independent review accepts the exact script, run the disposition under the same queue protocol:

```bash
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/heavy-queue/1370-1361-tree-disposition-r2.log python3 -I -B /Users/zacheryspector/studio-scratch/1370-1361-tree-disposition-proposal-r2/delete.py --execute
```

`lane-run.sh` may itself return 0 after a failed child; inspect each log's `.meta` **actual child exit**, `STOP` events, and surviving-state file. The current free-space measurement is **4,118,960 KiB**; the two sources have **256,320 KiB** gross allocated, so another bounded reserve action will likely be needed before r12's 4.25 GiB preflight. Preserve the remote archive and retrieval checkout through disposition.
