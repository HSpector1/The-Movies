# Independent AG p13a r12 clean observed audit

Decision: **ACCEPT_OBSERVED_R12_AG_P13A_CLEAN_ONLY**. This admits only the one AG p13a clean leaf under the original 300/330-second caps. It does not admit AG adoption, E0G, comparator, or the 1363 ledger.

Observed UTC: 2026-10-07T23:54:50.937536+00:00

The lane recorded actual child exit 0. Target and recorder both passed, with matching SHA sidecars, unchanged source guards, admitted fresh types receipt, AC power, free-space floors, and no surviving children.

Independent gzip member readback found **417** complete CRC-checked members, 968056328 logical bytes, 107371606 compressed bytes, and a largest row of 2867907 bytes. Uncompressed and compressed SHA-256 values match summary and target result. Source-bound Vitest captured and reread all 417 rows; both tests passed.

Run `r12-ag-p13a-clean-20261007-1850` elapsed 270.542s; target `ec8a5ea033291f2d3149578eee7a794d962372619e594def5b6978a971ce2ade`; recorder `56d5458fe52d39ad5240a45b80285a19a06e8f15e9bdc977714221177d741f7f`; compressed boundaries `a1668b2f5b537b19972d72f280f9aaeba73faa218a99c0481b2fa93cd52eb52b`; logical rows `a1a7e36f4786c47083323a5701593c9d1ca10903708642783c5ad702d53f39b4`.
