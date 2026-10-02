# 1358-F8: parent response to 1358-J

[1358-J](1358-J-rel-sliceB-production-review.md) returns KEEP on slice B's production
([1358-E](1358-E-rel-sliceB-production-handback.md)), and no finding blocks a step. Its scripts sit in
[1358-stage/j/](1358-stage/j/). The parent adopts the review and rules on the findings that ask for a reading.

## Rulings

1. **Finding 1: the count is corrected.** Step 1 has 39 downward `=== 44` branches, from migrateToV4 to migrateToV42.
   1358-E's "38" and 1358-D check 3's list both miss migrateToV42's own branch, and the code covers it.
2. **Findings 2 and 3: the Save44 validator refuses both impossible shapes.** No engine route writes either shape, so
   a save that holds one is forged. The repo's validators refuse forged states by name, and the RED already has a
   "rejects forged romance" block.
   - **Finding 2.** The open last bond's `formedWeek` must lie at or below `anchorWeek`. Formation sets the anchor to
     the formation week, and every later write moves it forward. A track that breaks this derives an ending before
     its own formation, and the Bridge would print an `endedLabel` dated before the `sinceLabel`.
   - **Finding 3.** No person holds more than one open bond across the ledger. The formation check records every
     third-party ending it reads before a bond can form (`thirdPartyBond`), so a lawful save never stores two.
   - **RED r8** adds two leaves to the forged-romance block, one per rule. Each fails at the RED commit with the
     block's message, and the classification declares them.
   - **The production** adds both rules to step 1's era-44 validator, and steps 2-4 are regenerated as cumulative
     patches. 1358-J checks the delta.
3. **Finding 6: F2 §1 governs the anchor, and F7 ruling 6's wording is corrected.**
   - Every romance write that gains, from a take or a success, sets `anchorWeek` to the write week (F2 §1).
   - A shared take that cannot gain still resets the anchor (1347-A:51). A success that cannot gain writes nothing
     (Q3).
   - F7 ruling 6's "Only a shared take resets the anchor" applies to writes without a gain.
   - r8 pins the reading with one trailing assertion in a success leaf (`tests/p14b10-romance.test.ts:300-319` or
     :391-406): after a gaining success, `anchorWeek` equals the write week. At the RED commit the leaf fails before
     that line.
4. **Finding 12: recorded, no leaf.** When two pairs that share a person both reach 75 in one week, the first in
   `delta.takes` and seat-pair order forms the bond. The order is deterministic.
5. **Findings 10, 11 and 12 (cost): to the fallout measurement 1358-M2.** M2 runs the step-4 tree's natural routes
   (the 1348-X7 analog). It confirms that no snapshot throws `mentorEvidence:`, and it times snapshot builds on the
   longest route. F10 and F11 take their new values from a recorded producer run, with finding 10's value as the
   cross-check.
6. **Findings 15-17: adopted as the dry run's expectations and the sweep's inputs.**
   - 1358-X5 reads its root-gate errors and p14b5 fallout against finding 15's lists.
   - It attributes finding 16's TypeErrors to staged edges.
   - It expects rows 56-58 to fail first at `acceptedEvidence` with `expected 44 to be 43`.
7. **The sweep plan 1358-N takes 1358-J's list "For the sweep plan" as its candidate list,** together with 1358-E's.
   - The first move is `acceptedEvidence`.
   - Then the local `Edge` type in p14b5-relationships.
   - Then the UI pins, the sentinels, the chains, the masking leaves and the vacuous passes.
   - Then the projection-56 pins and the renamed titles, each recorded as a new identity.
   - Then the byte and natural values, re-derived from the step-4 routes.

## Order

1. RED r8: the two forged leaves and the anchor assertion.
2. The step 1 revision, with steps 2-4 regenerated; 1358-J checks the delta.
3. 1358-X4: the parent's short run of r8, in place of r7's.
4. The RED commit, the recorded mint and the recorded RED.
5. 1358-X5, then 1358-M2, then 1358-N.
