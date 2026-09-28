# 1315-X4: parent scratch dry run of the casting-driver RED r4 (1315-C4)

Same scratch trees as [1315-X](1315-X-red-dry-run.md) with the five 1315-stage4 files (the expiry file differs from the
parent's 1315-X3 trial copy only in its header comment).

| Tree | Result | Log |
| --- | --- | --- |
| A, unchanged engine | 19 failed, 14 passed, 1 skipped | [head](1315-X4-red-r4-dry-run-head.txt) |
| B, Save42 draft ([1315-X-production-draft.patch](1315-X-production-draft.patch)) | 33 passed, 1 skipped | [draft](1315-X4-red-r4-dry-run-draft.txt) |

Every failure on tree A is a stated RED (missing constants and converters, `LIVE_SAVE_VERSION` 41, the dispatcher
text, empty driver lists, missing copy, the expiry naming leaf, the readers leaves). The passes on tree A are the named
regression pins and interpretation leaves (frozen V41/V40 readers on the genuine inputs, the synthetic-variant
acceptance, the committed-term exclusion, no rival edge). The skip is the `state.hollywood === null` leaf, which has no
lawful route. The staged RED is ready for independent review (1315-D) before its recorded run.
