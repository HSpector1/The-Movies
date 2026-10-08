# Independent E0G p13a r12 clean observed audit

Decision: **ACCEPT_OBSERVED_R12_E0G_P13A_CLEAN_ONLY**. This admits only the one E0G p13a clean leaf under the original 300/330-second caps. It does not admit AG, E0G adoption, comparator, or the 1363 ledger.

Observed UTC: 2026-10-08T01:17:52.851245+00:00

The lane recorded actual child exit 0. Target and recorder both passed, with matching SHA sidecars, unchanged source guards, admitted fresh types receipt, AC power, free-space floors, and no surviving children.

Independent gzip member readback found **417** complete CRC-checked members, 968882594 logical bytes, 107412813 compressed bytes, and a largest row of 2871109 bytes. Uncompressed and compressed SHA-256 values match summary and target result. Source-bound Vitest captured and reread all 417 rows; both tests passed.

Run `r12-e0g-p13a-clean-20261007-1850` elapsed 292.841s; target `b955555f6ccdd610b6fd338c751586dc79b9c55583390b4b6143c394a87d76ab`; recorder `38728fa382ce91f44610889430ff065058f4a7b300b4a3e9391bb8b27a1a8686`; compressed boundaries `d6ed471f74cbd5490516882d4eec9ae65dc24a2498b56be21a9595603bb019a1`; logical rows `790f88b59c9660bbd94707228601e7c1939b0cef93a73a0a387fbc87574ef593`.
