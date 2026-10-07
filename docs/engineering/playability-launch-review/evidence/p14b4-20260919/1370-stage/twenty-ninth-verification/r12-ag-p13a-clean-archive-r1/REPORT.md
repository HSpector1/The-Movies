# R12 AG p13a clean capture archive, local build record

The completed `r12-ag-p13a-clean-20261007-1850` target leaf, its outer leaf, and both lane logs were streamed into one uncompressed tar archive split at exactly 48 MiB. The archive source code did not follow the runtime tree's `node_modules` symlink, copy the original capture separately, or delete any source.

- Target `RESULT.json` and outer `RESULT.json`: both `STAGE_PASS`; recorded lane `.meta`: `end, exit 0`.
- Original `boundaries.ndjson.gz`: 107,371,606 bytes, SHA-256 `a1668b2f5b537b19972d72f280f9aaeba73faa218a99c0481b2fa93cd52eb52b`; 417 rows and 968,056,328 uncompressed bytes in target result.
- Builder `package.py` SHA-256 `195053aa0105c896a064f1895b3404ab618631580551e56c4bcd17d605581836`.
- Builder lane log `build.lane.log` and `.meta`: actual child exit 0.
- Package manifest SHA-256 `1aacbd7cfec79556dd6a2a86f96fa324cd1375c14cfd8b9a332369612dc07132`, 219 archived members.
- Reconstructed tar length 112,936,960 bytes, SHA-256 `87731d731d58d5d5b229fe170751744da62b1658765d59159cf6ed61355853fd`.
- `capture.tar.part-001`: 50,331,648 bytes, SHA-256 `27b4ec1a8a00efa3af7e26eff851d71a62c9d5f97e45447eefe97fd2e669ddf2`.
- `capture.tar.part-002`: 50,331,648 bytes, SHA-256 `2af49bef98b08c3077266ce6787e3fc11ee1bacb97ff2121a95d8cd29c7e21f3`.
- `capture.tar.part-003`: 12,273,664 bytes, SHA-256 `7987560d46d65cb7fc49763888fa5d1c159fc359ae3cc19ae8da8e0af39a98d1`.

The initial verifier `verify-r1.py` SHA-256 `65ee6ec8aa973924909e0bee5de1800f5abaad54fa0d1d967dc5283ba166a4d3` failed at the first part boundary because it referenced a local variable out of scope. `verify.lane.log` and `.meta` preserve the actual child exit 1. The corrected `verify-r2.py` SHA-256 `ab21059157a673eabe818cf307e3cfac79edf3c0bc52148d026ad75dd1615ef8` changed only that reference to the current part record. It was launched before independent review; `verify-r2.lane.log` and `.meta` show actual child exit 0 and a streaming reconstruction check of all 219 members and all three part/full-stream hashes. Treat that result as exploratory pending independent static review and a fresh reviewed verification.

All source and package bytes remain on disk. This record does not claim remote publication or clearance to remove the original.
