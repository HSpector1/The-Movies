# Twenty-third disjoint historical scratch disposition proposal r1

Status: **FROZEN FOR INDEPENDENT STATIC REVIEW; NO REMOTE FETCH, HEAVY READ, OR DELETION EXECUTED.** Use this only if measured `df -Pk` remains below the E0G 4,456,448 KiB preflight after the independently reviewed twenty-fifth disposition. The 13 exact remaining scratch roots total 40,008 KiB by `du -sk`; APFS physical recovery may differ. Two of the original 15 roots overlap the already completed twenty-second disposition and must remain absent. This proposal deletes only the other 13 roots, including one regular JSON file root. It never targets production source, Owner saves, current r12 captures, HANDOFF, Git evidence, or current-r12 review inputs.

Published evidence is pinned to HTTPS `https://github.com/HSpector1/The-Movies.git`, ref `refs/heads/evidence/1370-r10-clean-captures` at `4566887f3795b07326259b7ab6f0adb19536a12c`, archive commit `d1c6bd948ae56b81c9f50361bce20bef805b416f`, and `twenty-third-verification/evidence.tar.gz` SHA-256 `00f6888a1ea3c7a8209d3194010ec0d0caad77dd0664da234df6dae45712a19`. All seven published artifact SHA-256 values are embedded in `verify.py` and `PINS.json`. The published receipt SHA-256 `2017e0e88efe08dda2b4c6a5931aa0108970ceed7c3136fd6a39cf0b9dbd106b` says `ACCEPT_ARCHIVE_SCOPE_ONLY`: it is not current-source byte proof. The twenty-second disposition RESULT SHA-256 `fd3d7ad46a67523bad7b7f20111c123667a5d2e39444f1ea29d9ef21a8924942` proves the two overlapping roots were intentionally removed; both must remain absent. Assessment CANDIDATES SHA-256 `b939aee0df883af2e23191751cab6bae40125af9a1d77d338ea5a70d7ff0105c`, production HEAD `b995a83e5363a3843f9b902e08c2df4dd95840cb`, and `src` tree `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554` are fixed.

`verify.py` requires a recorded exclusive heavy lane, a clean production worktree, 3.75 GiB free before remote retrieval and at least 3 GiB throughout. It creates a fresh bare HTTPS `blob:none` promisor store, fetches only the exact historical commit, rejects alternates, and checks every remote artifact hash. It checks the published scope and 560 archive members (505 files, 53 directories, two symlinks) byte by byte, then all 138 currently present archived sources through no-follow descriptors. Exactly 422 sources under the two already removed roots must remain absent. It enumerates every object inside each of the 13 deletion roots and refuses unarchived extras or changed bytes. The dry-run report and audit lane must be independently observed before deletion.

`dispose.py` requires an exact independent `REVIEW.json` decision `ACCEPT_1370_23_DISJOINT_REMOTE_DISPOSITION_R1` pinning the actual audit SHA-256 and both frozen script hashes. It freshly checks remote/worktree/source identities, all 138 present source entries, target membership, no open files (`lsof +D` for directories; exact file for the one file root), sole lane ownership, and the 3 GiB floor. It writes a durable STOP marker before unlink, then removes only the 13 exact roots through FD-anchored no-follow per-entry rechecks and writes durable progress/failure/result receipts. Any partial failure is STOP and requires reassessment, never a blind retry.

Reviewers should first verify that the actual remote audit passes and its report is a regular file at the pinned path. Like the prior accepted pattern, the verifier writes its final report with `Path.write_text` after fixed-path absent and no-symlink ancestor checks; this is not an atomic exclusive create. No disposal is authorized by this draft itself. If the measured reserve is already adequate, skip this proposal entirely.

Proposed commands, not run:

```sh
mkdir /Users/zacheryspector/studio-scratch/1370-twenty-third-disjoint-remote-disposition-audit-r1
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/heavy-queue/1370-twenty-third-disjoint-remote-audit-r1.lane.log \
  python3 -I -B /Users/zacheryspector/studio-scratch/1370-twenty-third-disjoint-remote-disposition-proposal-r1/verify.py \
  --output /Users/zacheryspector/studio-scratch/1370-twenty-third-disjoint-remote-disposition-audit-r1/REPORT.json
# Independent observed audit review and exact pinned REVIEW.json required here.
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/heavy-queue/1370-twenty-third-disjoint-disposition-r1.lane.log \
  python3 -I -B /Users/zacheryspector/studio-scratch/1370-twenty-third-disjoint-remote-disposition-proposal-r1/dispose.py \
  --audit /Users/zacheryspector/studio-scratch/1370-twenty-third-disjoint-remote-disposition-audit-r1/REPORT.json \
  --review /Users/zacheryspector/studio-scratch/1370-twenty-third-disjoint-remote-disposition-independent-review-r1/REVIEW.json \
  --output-dir /Users/zacheryspector/studio-scratch/1370-twenty-third-disjoint-remote-disposition-result-r1
```
