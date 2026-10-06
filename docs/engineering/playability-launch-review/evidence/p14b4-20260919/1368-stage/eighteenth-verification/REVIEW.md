# Independent eighteenth archive review

Decision: **ACCEPT** for preservation and stated membership. Eighteenth r4 archive SHA-256 is `3f42e3644a22532ea9845b17e93661a9e90beff79da790333d3c1d993f5e3ded`; manifest SHA-256 is `7dbd826d32b86b1037e1377812f656c18375263390613f2433288a20e7508a9f`.

I independently enumerated all 31 included scratch directories plus the 25 exact formal files, ten lane log/meta files, prior-checkpoint links and archive builder/scope. The resulting complete regular-file set equals the manifest's 833 unique members. For every member, the tar entry is a regular file and its name, size, bytes and SHA-256 match both the manifest and the original source. Logical bytes total 71,565,363. There are no omitted regular files in scope, duplicate members or included symlinks/caches.

The scope includes R6 capture proposal, formal types/clean results, state fixture and independent capture/benchmark reviews; R7 r1 REFINE and corrected r2 proposals, all three R7 formal runs, their types/clean/observed independent gates; and comparator r1/r2/r3 source, descriptive result and independent review. The R6 and both R7 packages each contribute all 197 pinned arm files, including all 188 production files. The 25 formal files and ten lane files cover exactly the five R6/R7 runs. Three `node_modules` symlinks and two runner `__pycache__` directories are explicitly listed as exclusions and are absent from the tar.

This is an archive-integrity check. It preserves the separate `EXPLORATORY_NOT_ACCEPTANCE` classification of the R7 route and comparator; archive readback does not convert them into original-cap or gameplay acceptance.

`verify.py` is the independent read-only verifier and `RECEIPT.json` records its result.
