# 1360-F: parent rulings for landing the three P15 Wave 2 REDs on the Save44 base

[1360-R](1360-R-p15-wave2-red-landing-protocol.md) compiled the landing protocol from the records. It left twelve
questions open; these rulings settle them. The REDs are:
- P15A.2 slice 2a: 1356 r4;
- P15A.1 Wave 2: 1355 r4, with producer 1355-P r3;
- P15C Wave 2: 1359 r8, with producer 1359-P r4.

[1355-X5](1355-X5-p15a1-red-r4-on-save44.md), [1356-X4](1356-X4-p15a2-red-r4-on-save44.md) and
[1359-X6](1359-X6-p15c-red-r8-on-save44.md) measured each RED alone on the Save44 base.

## Rulings

1. **P15A.2 slice 2a, P15A.1 Wave 2 and P15C Wave 2 share one save step, Save45** (1360-R open question 1).
   - **The authority.** 1355-F Amendment 4 lets the parent put the P15 roots in one save step "when their productions
     are ready together, so one version sweep serves all three". 1359-A §10 item 4 admits P15C to that shared step.
   - **Why.**
     - One sweep replaces three. Slice B's Save44 sweep took 154 test files, four revisions and two reviews
       (1358-C9).
     - Every capture leaf requires its capture's `saveVersion` to be STEP − 1 (1356 patch :1188; 1355 patch :1542;
       1359 patch :299). So captures minted now, on the Save44 writer, serve all three roots.
     - The shared capture then serves the one shared step it was declared for (1355-F5).
   - **The cost** is that slice 2a's production does not land alone. The single writer authors the productions in
     1355-F4's order, slice 2a first, and they land together behind one Save45 sweep.
   - **P15B's condition root** joins Save45 only if its production is ready with them. It waits on Owner question
     1357-Q1; otherwise it takes the next step.
   - **If one of the three cannot be ready** (P15A.1's G2 on its frozen candidate, or a P15C gate), the parent rules
     again before any of them lands. A root at its own later step then mints its own capture at its own path, and its
     reading leaves are re-pinned (1355-F5, declared).
2. **The REDs land in the order 1356, 1355, 1359** (questions 2 and 12).
   - 1355-F4 orders productions, and the parent extends it to the REDs.
   - The 1355 mint must follow the 1355 RED commit, because the producer imports that RED's helpers. It must also
     precede the first P15 production.
   - Landing P15C third keeps its five forged-root leaves in its own patch (1359 patch :848-851).
3. **1356's recorded RED runs before the 1355 mint** (question 2).
   - It then fails with the pre-mint message its classification declares (:165-167), as 1356-X4 measured on Save44.
   - After the mint, its capture leaf fails at the version check (44 against 43) until Save45 lands. The next broad
     gate attributes that change, and 1360-X measures it in advance.
   - Slice B's reason for minting first does not carry over: this leaf stops at a version check either way.
4. **The 1355 capture sha is pinned in the fixture commit** (question 3).
   - `CAPTURE_MANIFEST_SHA256` (`tests/p15a1-market-integration.test.ts`, patch :1529) takes the sha256 of the recorded
     mint's `genuine-below-p15-save-step/MANIFEST.json`, as 1355-F4 orders "after minting".
   - The recorded RED follows, so both capture leaves reach their final classified reason.
   - 1356's optional sha pin (patch :1179-1180) is not adopted: no ruling adopted it, and the 1355 pin guards the same
     bytes. It goes to the closure as an open item.
5. **The post-mint states are measured before any recorded run** (questions 4 and 5). Dry run 1360-X replays the
   landing in a scratch tree at the Save44 HEAD, in order:
   - the 1356 RED;
   - the 1355 RED with the merged `P15_ROOTS`;
   - 1355-P in mint mode, writing into the tree, then the sha pin;
   - the 1359 RED r8 with the merged list, then 1359-P;
   - finally all three REDs' test files and the root type gate.

   This is the slice B precedent: 1358-X3 and X4 placed the capture before the RED commit (1358-F4). The P15C
   classification revises rows C2 to C4 from 1360-X's measurement before P15C's recorded RED, as r8's classification.
   Today those rows declare a pre-mint message and a Save43 post-mint text.
6. **A scratch dry run is not a rehearsal under the house rule** (question 6).
   - **What the rule binds:** "no rehearsal, seed search, state surgery or retry" (1355-P r3 :8; 1359-P r4 :14) binds
     the recorded execution in the repository. That means one run, nothing chosen, nothing retried.
   - **What a dry run is:** a scratch run that writes nothing to the repository and selects nothing. That is house
     practice (1314-X, 1344-X, 1358-F3), and slice B's recorded mint equalled its dry run byte for byte (1358-L).
   - **1355-X5's word** "rehearsed" means that and no more.
7. **The runner is `node_modules/.bin/vite-node`** (question 7), as every measured run used. `npx tsx` would fetch a
   package from the network.
8. **A failed recorded mint is a finding** (question 8). The parent stops, reports and does not retry. The producer
   writes nothing on failure.
9. **Each producer is committed at the E root in its RED's commit** (question 9), as slice B's was (1358-F4). The names
   are `E/1355-P-p15a1-market-producer.ts` and `E/1359-P-p15c2-route-l-producer.ts`, the paths their dry runs used.
10. **The 1356 harness file runs inside 1356's recorded RED** (question 10).
    - At RED it fails at week 13 in under a second (1356-X3).
    - The rule that it runs alone (1356-F2) protects its time budget at the reference and the GREEN.
    - Broad gates run it as its own run.
11. **`tests/helpers/p15-roots.ts`** (question 11). The 1356 commit creates it. The 1355 and 1359 commits apply their
    patches without its new-file hunk and edit line 10. The final list is
    `['p15Sequence', 'powerRanking', 'sharedMarket', 'campaignLegacy']`. P15B's RED adds its own key when it lands.
12. **Classification texts that name Save43** stand as history where status and first message are unchanged. Two cases
    are measured otherwise:
    - 1356 :160, "Save43 today";
    - the 1359 control and downgrade rows (1359-X6).

    The only revision is P15C's C2 to C4 rows (ruling 5).

## The sequence

| # | Step | Recorded run |
|---|---|---|
| 1 | 1356 RED commit (creates `p15-roots.ts`); push | |
| 2 | 1356 recorded RED: the archive, isolation and harness files | `1360-p15a2-red-recorded` |
| 3 | 1355 RED commit (merged list) with `E/1355-P-p15a1-market-producer.ts`; push | |
| 4 | 1355 recorded mint, `P15A1_CAPTURE_MODE=mint` | `1360-p15a1-mint` |
| 5 | Fixture commit: both directories, the mint's outputs and the sha pin; push | |
| 6 | 1355 recorded RED: the three market files | `1360-p15a1-red-recorded` |
| 7 | 1359 RED r8 commit (merged list) with `E/1359-P-p15c2-route-l-producer.ts` and r8's revised classification; push | |
| 8 | 1359 recorded mint | `1360-p15c-mint` |
| 9 | Fixture commit with the mint's outputs; push | |
| 10 | 1359 recorded RED: the integration, retention and p15c1 files | `1360-p15c-red-recorded` |

- **The standing rules hold for every recorded run.** The heavy lane runs alone on Node v20.20.2, with free disk of at
  least 5 GiB, and HEAD equals the pushed remote. No commit and no `git add` happen during a run or its postflight.
- **A mismatch stops the sequence.** Each step's result must match 1360-X before the next step starts. The record of
  the landing is 1360-L.
