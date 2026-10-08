# Independent E0G adoption r12 clean observed audit

Decision: **ACCEPT_OBSERVED_R12_E0G_ADOPTION_CLEAN_EXPLORATORY_ONLY**. This admits only the one E0G adoption clean leaf under the exploratory 720/750-second bounds. It does not admit AG, E0G p13a, comparator, the 1363 ledger, or native acceptance.

Observed UTC: 2026-10-08T01:56:04.546027+00:00

The lane recorded actual child exit 0. Target and recorder both passed, with matching SHA sidecars, unchanged source guards, admitted fresh types receipt, AC power, free-space floors, and no surviving children.

Independent gzip member readback found **417** complete CRC-checked members, 1314244321 logical bytes, 141216253 compressed bytes, and a largest row of 4857749 bytes. Uncompressed and compressed SHA-256 values match summary and target result. Source-bound Vitest captured and reread all 417 rows; both tests passed.

Run `r12-e0g-adoption-clean-20261007-1850` elapsed 358.379s; target `e1c4bb4096cdee11ecba100e55df6cab9efb2b91ac8a10227fe173dccb214162`; recorder `d367aa5046969975374c5bdd8cc3cb733d26351f0d84c635ef8565b7e014140f`; compressed boundaries `809e5b12b23f4a898ef39a2a64879ddeec93ed8a22de769d5f6b3fbcd8db4f06`; logical rows `eb45144641401f0a83b51d8f47bfa70df7b872a1cad1204dfb77f2c1f083eb99`.
