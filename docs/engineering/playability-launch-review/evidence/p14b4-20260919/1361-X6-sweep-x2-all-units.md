# 1361-X6: Save45 sweep x2, all units

The complete scratch run applies the sibling test, hygiene comment and all seven sweep units to the reviewed production through `p15c-c-r1`. **The remaining sweep work is 18 S9 failures in 11 files.** No live validation failure appeared in the two production-stop checks named by the handoff.

## Identity and execution

- Source archive: repository `8757a3d2c041355c2f0d9939d96d4d43f031b18f`.
- Committed scratch candidate: `838dce0218d5c940cdcfd57e01232fbcd1082bf0`, in `S/1361-sweep/x2/tree` (S is `/Users/zacheryspector/studio-scratch`).
- Script: [run-sweep-x.sh](1361-stage/sweep/run-sweep-x.sh), through the single heavy lane, Node v20.20.2.
- Run: 2026-10-03 12:58:12–14:50:06 CDT; core 13:00:11–14:30:54, UI to 14:45:47, then d16. The tree was clean at the end.
- [Run metadata and artifacts](1361-stage/sweep/x2/): raw core/UI/d16 text is preserved as gzip files; type and generator outputs, d16 JSON and attribution are uncompressed.
- Original core text SHA-256: `9abdf0fd5a8a7037ec411e34697583a0e6e9dfbb550c4ad72cd324858ff730e2`.

## Measurements

| Check | Result |
|---|---|
| Root, UI, Bridge type checks | All exit 0 |
| Both generator checks | Exit 0 |
| Core, 448 files | 155 failed, 5,096 passed, 3 skipped, 11 todo (5,265) |
| Core against 1358-I | SAME 78, CHANGED 7, NEW 70, GONE 0 |
| UI, 204 files | 2,692 passed, 5 skipped (2,697), no failures or unhandled errors |
| UI against 1358-I2 | NEW 0, GONE 3 (the numpy rows) |
| d16 | 12 failed, 164 passed (176); identical failing identities and full messages to base after replacing only the absolute scratch-tree prefix |

The existing 1321-I and 1317-I parsers and 1344-I comparator produced [the attribution](1361-stage/sweep/x2/attr/). [attribute-x2.py](1361-stage/sweep/attribute-x2.py) records the exact commands and d16 normalization.

The 70 NEW core rows are:
- 45 declared 1355 leaves. Their full test names and primary messages equal `1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv` exactly.
- 7 `bridge-supervisor` Fake Unity environment rows.
- 18 S9 rows: 1 in G1, 11 in G4a and 6 in G4b. Each receives `migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter` ahead of the older pinned refusal.

The 7 CHANGED rows are the expected C20 version-only change and six existing r3n1 ENOENT rows whose scratch path changed. All other 1358-I identities retain their primary messages. No retained row disappeared.

`p13a-causal-core` passes all eight tests, and `contracts/v14-byte-parity.contract` passes all six. The Power Ranking harness passes. These results do not waive the later recorded runs.

## Follow-up and review

The parent prepared cumulative `patch-r2.diff` and supplemental `rows-r2.json` for G1, G4a and G4b in [the unit staging directory](1361-stage/sweep/units/). They change 17 exact anchored pins across 11 files and their masking/own-era coverage comments. Sequential calls and loop variants that x2 did not reach remain pending confirmation; no assertion or input is relaxed. The patches stack cleanly with the other units in a temporary index.

An independent Codex reviewer (substituting for the historical Sonnet role) sampled 58 edits across all units/classes in [the preliminary review](1361-stage/sweep/review-x2-static.md). Its [r2 delta review](1361-stage/sweep/review-r2-static.md) found no assertion weakening. Three comment findings were corrected: separate writer controls, the termination receipt/movement coverage limit, and explicitly provisional measurement language. Final approval waits for execution.

The separate diagnostic `x2-guards` is running under the heavy lane. Its uninstrumented Git tree must equal x2's. It invokes each observed callback once, returns its result or rethrows the same error, and keeps every assertion unchanged. It observes the three bare refusal sites, studio-events forbidden keys and five loose S9 sites that a passing test cannot attribute. No diagnostic edit may land.

Next: read the guard messages, apply any required F7 ruling 9 pins, then run the full r2 confirmation as x3. Save45 is not landed or ready for recorded gates yet. Free disk remains below their 5 GiB precondition.
