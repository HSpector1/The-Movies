# 1315-X2: parent scratch dry run of the revised casting-driver RED (1315-C2)

Same two scratch trees as [1315-X](1315-X-red-dry-run.md), with the five 1315-stage2 files copied into `tests/` and
`docs` linked read-only.

| Tree | Result | Log |
| --- | --- | --- |
| A, unchanged engine | 22 failed, 9 passed, 1 skipped | [head](1315-X2-red-r2-dry-run-head.txt) |
| B, Save42 draft | 4 failed, 27 passed, 1 skipped | [draft](1315-X2-red-r2-dry-run-draft.txt) |

On tree A every failure is a stated RED: missing constants or converters, `LIVE_SAVE_VERSION` 41, the dispatcher text,
empty driver lists, missing copy, and the expiry and readers leaves. The 9 passes are the named regression pins (no
rival edge, frozen checks). On tree B, the draft satisfies every drivers, queue-admission, copy, readers and Save42
leaf. Two defects remain, both in the tests:

1. **Expiry signing order.** `hiringMarketIds(state)` is recomputed after every signing, so an actor listed at week 0
   can be absent after another signing. [1315-P2](1315-P2-expiry-signing-probe.txt) measured one order on
   `r1314-casting-01` in which every signing succeeds: writer t-wri-05 (208), craft t-cra-09 (208), director t-dir-04
   (208), antagonist t-act-24 (208), support t-act-08 (52), bystander t-act-20 (208), lead t-act-12 (60). The leaf's
   current mapping fails with t-act-12 "not currently available to sign".
2. **Frozen-reader leaf.** A fresh generated world also refuses below V38 ("migrateToV37: cannot downgrade or discard
   profession transition, industry retirement or entrant authority"), so the V4..V39 loop has no lawful input. The house
   form (`tests/p14r3-save-v41.test.ts:294-301`) pins the frozen reader by validating genuine envelopes of its own
   version: `validateSaveV41` still admits both genuine 1314 inputs after V42 lands, plus the migrateToV40/V41 checks
   the leaf already makes on the genuine input.
