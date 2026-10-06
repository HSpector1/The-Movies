# Independent sixteenth archive review

Decision: **ACCEPT** for archive integrity and stated coverage. This is a read-only comparison of the frozen archive and manifest against the current original regular files; it does not reclassify ledger behavior or unblock the unchanged comparator.

Archive `1368-sixteenth-publication-prep-r1/evidence.tar.gz` hashes to `8cca3370c901c21b33539b0ce48747738a5f1b98ae738120f0273848f109bfcb` (1,001,119 bytes). Its `MANIFEST.json` hashes to `92384616452ec593f62e78f68ba716b981e60b59caab42d45fd3dfa10f6dc117`. All 154 tar entries are regular files with names, sizes, bytes, and SHA-256 matching their manifest rows and live source files; logical bytes total 19,215,664. No duplicate names, symlinks, source trees, path traversal, or omitted regular files in the 18 listed source directories were found.

The archive contains complete regular-file contents of the five formal run directories; all 25 preflight/record/postflight/patch/text formal files; all ten lane log/meta files; the completed independent C0 audit and two-clean descriptive report; and the r5 index r2 `R2-REVIEW.md` and `R2-RECEIPT.json`. The manifest openly lists `1368-ledger-r5-index-r2-refine-review-20261005` as optional and omitted because no completed review pair was present; this is outside the included directories and not an omission from the stated bundle.

`verify.py` is the independent verifier. `RECEIPT.json` records the exact aggregate result.
