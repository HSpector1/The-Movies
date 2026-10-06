# Independent seventeenth archive readback

Decision: **ACCEPT** for archive integrity and exact stated membership. The archive SHA-256 is `d0ff1fdb5afcf2c9dace670b098ca708f2220f6d73d7821dbc0c2d5bcffe73a2` and its manifest SHA-256 is `5f71a7e0a55ebc62db54cad64746301e70eec93b28b9b8504a6790293edd1c7d`.

I independently enumerated the 12 included scratch directories, 15 exact formal evidence files, six lane log/meta files and two prior-checkpoint links. Their complete regular-file set equals the manifest's 304 unique members; no regular file in scope was omitted. The archive includes all 197 arm source files, including the 188 production files, and the observed audit. Every tar entry is a regular file with name, size, SHA-256 and bytes matching both its manifest row and its original source file. The logical total is 15,300,326 bytes.

The sole excluded symlink is the package `arm/tree/node_modules` link, and the sole excluded cache is `runner/__pycache__`; both are listed in the manifest and were confirmed on disk. Neither appears as a tar member. No archive member is a symlink or directory. This readback checks preservation of evidence, not the validity of a completed observed route.

`verify.py` is the independent read-only verifier; `RECEIPT.json` contains the aggregate result.
