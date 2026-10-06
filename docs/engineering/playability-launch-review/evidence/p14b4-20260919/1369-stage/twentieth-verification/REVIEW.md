# Independent checkpoint 20 archive review

Verdict: **ACCEPT** for archive integrity and publication of the frozen diagnostic evidence. This is an archive review, not an admission of the underlying failed diagnostic routes or of 1363.

I independently enumerated all 33 named scratch source directories, the lessons file, and the 50 direct repository formal files. There are exactly 3,047 eligible regular source members, with no missing or extra archive members. I read every tar member and compared its full bytes against its source. The internal `MEMBERS.json` SHA-256 is `973d648f27f371da7a0c0ab9bceed01f4175cbe51f90f14bd9671e8896930374`; every size and content hash matches. All tar entries are regular files with safe relative names, fixed metadata, and no symlink, cache, or path escape. Fourteen source `node_modules` symlinks were correctly excluded; there were no cache entries to exclude.

The archived ten five-file formal routes comprise r2 C0G types (exit 2), r3 C0G/F6G/AG/ABG types and clean (eight exit 0 routes), and r6 historical types (exit 2). All 50 direct files match byte for byte. The two failures remain recorded as failures.

I rebuilt the archive independently from those same source bytes. My repeated tar SHA-256, the builder's two tar SHA-256 values, and the manifest's pinned SHA-256 all equal `e06cd73d4fbe10b2195d50d9fd88443baa96190969e259d2650762529762edb0`. The compressed size is 22,075,931 bytes and logical content size is 114,352,288 bytes. The source and result details are in `RECEIPT.json`; `audit.py` can reproduce this review without modifying the reviewed archive.

This review validates the frozen archive at review time. It does not interpret the causal comparisons or waive any failed run, types error, ledger discrepancy, or downstream acceptance gate.
