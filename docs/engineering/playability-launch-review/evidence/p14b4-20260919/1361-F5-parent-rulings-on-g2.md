# 1361-F5: parent rulings on G2's Retune

[1361-G2-X](1361-G2-X-p15a1-g2-run.md) records G2 on `p15a1-c-r1` (c5249114).
- **Verdict:** Retune.
- **K1 to K5** hold exactly.
- **The rows that read Retune:**
  - p13a's industry gross at week 520;
  - seed-b's rival stall weeks, with rivals that stop filming for good;
  - seed-b's rival weeks below zero at week 520;
  - seed-b's root share, which routes to a storage fix.

These rulings apply 1361-F ruling 13, as [1361-F4](1361-F4-parent-response-to-1361-D2.md) ruling 3 restored it.

## Rulings

1. **The verdict stands as read.**
   - **The rules** were all fixed before the run: 1355-A §5's table, 1361-F2 ruling 4's four readings, and 1361-F4
     ruling 1 for K3.
   - **K3 is case (a):** no path lies outside the chain.
   - **No row is re-read after the fact.** That includes seed-b's stall row, where three rivals film later and four
     stop earlier.
2. **Save45 lands slice 2a r2 and P15A.1's (a) and (b) r2.** P15C joins if G-P passes on that tree. D2's five
   conditions are met as follows:
   1. **D1 is adopted.** In every tick with an industry, (b)'s write sets `sharedMarket.recordedFromWeek` to the
      produced week. The film bijection then starts at the produced week, and every state (b) writes validates.
      1355-A §8 item 5's (b), which had no tick write, is amended to carry it.
   2. **The 44 leaves of 1355** that fail at (b) are declared in
      [1355-leaves-red-at-b.tsv](1361-stage/x-r2b/1355-leaves-red-at-b.tsv): 39 in
      `p15a1-market-integration.test.ts`, 4 in its atomicity file and 1 in its phases file. They wait for (c).
      - **The landing's recorded run of 1355's files** fails exactly these 44, each with its message from
        [x-r2b](1361-stage/x-r2b/p15a1.json).
      - **Anything else is a finding:** another failing leaf, or one of the 44 failing with another message.
   3. **P15C rebases on `p15a1-b-r2`** and is dry-run there. G-P runs on that tree (ruling 4). The landing record
      discloses that a campaign reaching 2040 on this build freezes a Legacy with no market lens. No Owner-facing
      build carries Wave 2 without Waves 3 and 4 (1359-A:214).
   4. **The F3 guard** goes into (b) as `p15a1-b-r2`, which the writer is now making.
   5. **The retuned (c)'s G2** reads K3 under 1361-F4 ruling 1.
3. **(c) takes a tuning amendment** (1355-A §5 routing).
   - **The record.** A tuning amendment under D-1323-1's delegation, with its own record and review, then G1 and G2
     again.
   - **The rows it answers:**
     - p13a's industry gross at week 520 (0.875, below 0.90);
     - seed-b's stall row (+12.4% with a new streak at week 520, and stopped rivals at every read-out);
     - seed-b's weeks below zero at week 520 (+325.5%).
   - **The storage fix.** Root share above 2% on seed-b (2.33% to 3.12%) gets a storage fix before Wave 3, in (c)'s
     retune production. It is not tuning.
   - **The Owner's part.** The amendment goes to the Owner only if the stall trigger persists at the Owner's weaker
     named alternative (maximum penalty 0.15), or if a fix needs a shape change (1355-A §5).
   - **When.** The parent opens it after the Save45 landing. Its G1 and G2 run on the tree (c) lands on, and the
     parent orders it against 1363 and 1364.
   - **What it claims.** (c) needs no save step, so it claims no step number. Commit (d) (1361-F4 ruling 2) rides
     with it.
   - **What waits for the retuned (c):**
     - P15A.1's integrated 6,240-week harness (1361-F ruling 16);
     - 1361-F4 ruling 2's d16 runs at (c) and (d). The landing still runs the d16 config at `base` and at the
       landed tree.
4. **G-P runs on the (b) tree**, `run-1361-gp.sh p15a1-b-r2`, with the default roots line. C0 passed (record
   1361-GP-X).

   These expectations are fixed before the run. A miss stops the reading and returns to the parent.

   **Smoke, week 20:**
   - exit 0, and the script's tree guard passes;
   - `adapterRefusals` `[]`, `lawRefusal` null, `f1.standInFilms` 8;
   - `siblings.marketRows` 0, `rankingRecords` 1 (week 13), `rankingRows` 5, `p15SequenceNext` 2;
   - `marketAssessments` reads the root's own `recordedFromWeek` (20) with no assessment, never week 0.

   **Full run, week 6240:**
   - exit 0;
   - both seeds reach week 6240 in `mode` `"g-p"`;
   - `law` reads `campaign-legacy/v2`, and `tuning` reads 60, 20 and 49 with the other values at v1's.

   **Per seed:**
   - `adapterRefusals` `[]`, `lawRefusal` null, `f1.standInFilms` 8;
   - `siblings.roots` names all three roots, `rankingRecords` 480 and `marketRows` 0;
   - `p15SequenceNext − 1` equals 480 and the `powerRanking` watermark;
   - `rankingRows` and `recordIdBridge.standInRows` read 4,229 if 1353-X4's entry weeks hold. A different count is
     reported with the entry weeks, not treated as a failure.

   **The domain table:**
   - `powerRanking` is complete from week 0;
   - `marketAssessments` reads `notRecorded`, because the root records from week 6240, which is B (D2 item 3);
   - `corporateCondition` reads `notRecorded`;
   - the seven array domains are as in 1353-X4.

   **The trigger** follows 1359-F5 ruling 1. A trigger takes 1353-F7's and 1359-F5's routes, and P15C takes its
   fallback.
5. **Records.** G-P's run is `1361-GP-X`. P15C's handback is `1361-E3`. The retune opens as record 1365 after the
   landing.
