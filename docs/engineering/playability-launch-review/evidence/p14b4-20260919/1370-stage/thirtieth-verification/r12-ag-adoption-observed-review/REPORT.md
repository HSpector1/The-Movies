# Independent AG adoption r12 clean observed audit

Decision: **ACCEPT_OBSERVED_R12_AG_ADOPTION_CLEAN_ONLY**. This admits only the one AG adoption clean leaf under the exploratory 720/750-second caps. It does not admit AG p13a, E0G, comparator, or the 1363 ledger.

Observed UTC: 2026-10-08T00:25:43.950737+00:00

The lane recorded actual child exit 0. Target and recorder both passed, with matching SHA sidecars, unchanged source guards, admitted fresh types receipt, AC power, free-space floors, and no surviving children.

Independent gzip member readback found **417** complete CRC-checked members, 1313417794 logical bytes, 141150606 compressed bytes, and a largest row of 4854547 bytes. Uncompressed and compressed SHA-256 values match summary and target result. Source-bound Vitest captured and reread all 417 rows; both tests passed.

Run `r12-ag-adoption-clean-20261007-1850` elapsed 328.918s; target `ac77533257abc675b5f89986fabd26102e29919a4b80f7c2716b0002e7a817f5`; recorder `87880a72abc46e537afe1169815ddee2a91ffcca1f3ffc5b89e445fffb4d7079`; compressed boundaries `b90d6b3dbce57e890a4c3c3e1b1ebd2056b33b114aa7b4b857e1eb0dc9621f04`; logical rows `ff8bcb3cdafb9ffc825769b3a9f09535d67bfb051c2f3974e75dc50d3e480180`.

Canonical source inventory: 232 exact retained target/outer/lane entries; SHA-256 `cd9d63d2be330d386bc1e29ff5101671aa9f4ce68431fd2d4f827c54e50efd88`. The JSON list is sorted by UTF-8 path and retained as `SOURCE-INVENTORY.json`.
