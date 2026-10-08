# Independent remote restoration audit: r12 AG p13a clean

Decision: **ACCEPT_REMOTE_SOURCE_BYTE_RESTORE_ONLY**. The archive at the independently retrieved GitHub commit restores every archived regular-file byte and symlink target from the still-present live target, outer, and lane leaves. This establishes remote byte preservation, not ledger admission or 1363 acceptance.

## Provenance

- Fresh HTTPS clone from `https://github.com/HSpector1/The-Movies.git`, without a local repository reference, alternate object store, or worktree sharing. Exact no-cone sparse checkout retains only the archive package, its observed review, and the direct formal archive record. Its clean detached HEAD is `f8d06ffcb8d575d94b1e52eb78da9c9d888b857a`. `git ls-remote` independently returned the same current evidence-branch tip before and after the audit.
- The live source repository was clean at `b995a83e5363a3843f9b902e08c2df4dd95840cb` (source tree recorded by its clean run: `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`). Its target, outer, and lane leaves remained intact. The clone and audit made no production or evidence edits.
- The remote `MANIFEST.json` SHA-256 is `1aacbd7cfec79556dd6a2a86f96fa324cd1375c14cfd8b9a332369612dc07132`. Every one of the 16 remotely retrieved archive-package files matched the corresponding local published file hash. The formal `1370-Y` record and both observed-review files also matched their locally published copies.

## Byte checks

- The remotely retrieved frozen `verify-r2.py` ran under the recorded heavy lane. Its `.meta` reports actual child exit 0. It reconstructed the 112,936,960-byte tar with SHA-256 `87731d731d58d5d5b229fe170751744da62b1658765d59159cf6ed61355853fd`, verified the three split-part hashes, and closed the exact 219-member manifest.
- A separate, independently written streaming audit compared each tar regular member block-for-block with its original live scratch file and checked each member against its manifest size/hash. It compared 112,763,007 regular-file bytes, including the 107,371,606-byte compressed boundary capture, and verified the one runtime-tree symlink text exactly. Its own lane `.meta` also reports actual child exit 0. The 219 archive paths equal the complete live target, outer, and two lane-file inventory; no member or source leaf was missing or extra.
- Both remote and source worktrees remained clean and at their pinned commits after these checks. Available disk after sparse correction and audit was 4,044,976 KiB, above the 3 GiB continuous guard. An initial cone sparse checkout pulled parent-directory evidence files and temporarily used more space; it was corrected immediately to exact no-cone paths, reducing this clone to about 262,012 KiB. No source evidence was deleted.

## Frozen receipts

- Frozen remote verifier SHA-256 `ab21059157a673eabe818cf307e3cfac79edf3c0bc52148d026ad75dd1615ef8`; recorded output SHA-256 `c5fcf8a097623c81cd621fbef7579e44ba210f1a7ff61e726652ea2170eeb22c`; lane meta SHA-256 `9b2ef80fef6cf011eb79baf0708d02d26040139a317d977eab9194009334f1c6`.
- Independent audit script SHA-256 `490c297021af9e61b411b8815b104aa6b25d72cbe03fac511f03e64940ca4102`; recorded output SHA-256 `41942898f6d953b2150a3c1377269689fee0f234438efbc38d68567c865e868a`; lane meta SHA-256 `4dd979153d7252bc6169b3acdc6210f4ca6e37523cfa6f48e299bda3bbba1373`.

The independently retrieved remote archive may now serve as a lossless backup for the exact r12 AG p13a clean capture. This audit does not authorize changing the original run's diagnostic classification, repinning source, or claiming the downstream ledger and acceptance gates passed.
