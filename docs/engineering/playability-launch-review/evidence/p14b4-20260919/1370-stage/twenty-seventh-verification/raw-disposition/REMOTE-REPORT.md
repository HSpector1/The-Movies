# r10 adoption failed archive: independent remote publication verification

Decision: **ACCEPT_REMOTE_SEGMENTED_BYTE_PRESERVATION_ONLY**. The remote `evidence/1370-r10-clean-captures` ref and local evidence branch both point to `6413324956a98b0426e7959843b72dfd8bcb34fe`. The prior published evidence commit `900573e4fee9da765a9937ef948b0030ef367e2f` is an ancestor. Exactly **56** paths were added between those commits; all 56 are tracked in the new tree. The remote work branch `wip/headless-program-20260916-ts` remains `b995a83e5363a3843f9b902e08c2df4dd95840cb`, matching the clean live worktree and source tree `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`.

The three committed Git blobs under `ag-adoption-r10-failure-r2/` are:

| Ordered part | Git blob OID | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `EVIDENCE.tar.xz.part-0001-of-0003` | `b66c20d5812e41f37965e4c7da44c1bad5754548` | 50,331,648 | `1063ae48fc0772f0dab73cb4559f5bb06b4e11e72b52583d83366110452b5f60` |
| `EVIDENCE.tar.xz.part-0002-of-0003` | `11d756e9e58647a34328b392f81c1d2f511b873e` | 50,331,648 | `cf6863d2ee30bd31e965ffc7279cd8b0875a510e6df28c050688565b221ed2b9` |
| `EVIDENCE.tar.xz.part-0003-of-0003` | `70edae2c5e9ba9266e7fccaa310b30def0feb868` | 12,633,512 | `715f91806f36908594b7383eb24518e021a9accea576492544653bda8ddddaee` |

Each blob was streamed from the committed Git object, checked against the segment manifest, and matched to its worktree file. Ordered concatenation is **113,296,808 bytes**, SHA-256 `1d065ca4f946269a464c526a80e8d34b932cf56c06bf04fc812fc96590d567df`, matching `SEGMENTS.json` and the full archive digest in `MANIFEST.json`. Every part is at most 48 MiB. The committed tree contains `MANIFEST.json`, `MEMBERS.json`, original failed-run `REVIEW.md`/`RECEIPT.json`, segment manifest/README, package README, direct receipts, r1 stopped attempt, `1370-P/Q/R/S`, r11 RED report/receipt and r12 static report/receipt/RED results. The seven intentionally ignored README/log files were committed. Neither the oversized monolithic `EVIDENCE.tar.xz` nor the incomplete `ag-adoption-r10-failure/` r1 preliminary directory is tracked.

The original raw failed adoption leaf is still present. Its `boundaries.ndjson` is 1,069,911,027 bytes with SHA-256 `d8fef4ae3a56021778764c121fccd261621e50b6bcc8027819ef8ecd381ec12b`; its target `RESULT.json` SHA-256 is `3e1f9a8b67f0d03090c1e1641812d87a816c6b91ac7f22cbe81abbf7a83e9515`; `summary.json` is absent. This remote verification establishes durable byte preservation of the **failed partial capture**, not a clean run, neutrality admission, 1363 closure or main merge. The parent may now make the separately reviewed exact raw-leaf disk disposition, while preserving this published failure label.
