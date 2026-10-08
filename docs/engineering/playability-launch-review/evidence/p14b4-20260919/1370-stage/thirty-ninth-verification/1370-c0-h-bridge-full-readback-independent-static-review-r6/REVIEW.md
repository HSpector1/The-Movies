# H bridge full-readback r6 independent static review

Decision: ACCEPT_STATIC_H_BRIDGE_FULL_READBACK_ONLY. No full mirror scan or heavy route was run.

R5 failed before scan because its historical tree guard compared a commit root tree with the pinned `src` subtree. R6 separately pins and checks the root tree `e3fdd8c2...`, the `src` tree `0ee21d81...`, and the bridge tree `a697b042...`. The SPEC changes are limited to this root pin, fresh r6 output/schema, and the independent r5 STOP authority. Its source additionally reads and verifies both the raw r5 STOP and observed r5 STOP receipt before traversal.

All eight frozen manifest member hashes match. The r6 selfcheck passes actual r5 binding/STOP, distinct root/src/bridge and M0 tree roles, local/remote refs, the 1,402-row Git roster, and synthetic refusals without reading the mirror. Inherited bounds and full mirror content proof remain source-only until actual run and separate observed review. Recorder, filled binding and exact launch require their own independent review.
