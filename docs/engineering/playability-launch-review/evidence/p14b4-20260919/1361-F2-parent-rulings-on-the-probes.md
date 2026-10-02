# 1361-F2: parent rulings on the probes (G-P r2's review, G2's open choices) and the G2-Retune path

[1361-GP-D](1361-GP-D-review.md) reviewed G-P's sibling-roots branch r2
([1361-GP-probe-r2.ts](1361-stage/gp/1361-GP-probe-r2.ts), sha256 3d460c22…).
- **Verdict:** PROCEED. r2 runs unchanged on the gating tree once P15A.1's candidate exists.
- **The G2 probe** is under its own review. Its author left four choices, which these rulings settle.
- **One finding of 1361-GP-D** shows that 1361-F ruling 11's Retune path cannot hold. Ruling 3 corrects it.

## Rulings

1. **G-P r2: how the parent runs it** (1361-GP-D findings 1, 2 and 7).
   - **The lane.** The `lane-run.sh` logs go outside the run's output directories. Control C0 also runs through the
     lane.
   - **The tree guard.** The smoke stage's output must name all three present roots (`p15Sequence`, `powerRanking`,
     `sharedMarket`), and a missing root stops the run. Without that check, r2 run on the wrong tag would read the
     market as unrecorded and exit 0.
   - **The expected counts** go into the run record: `rankingRows` and `standInRows` are 4,229 per seed, and 5 in the
     smoke.
   - **Deferred to an r3,** if a revision happens for another reason: findings 3, 4, 6 and 8, the id-bridge condition,
     the second id scheme's strength, the script's error handling, and a comment.
2. **G-P r2: the author's two decisions.**
   - **(a) Accepted.** A present `corporateCondition` stops the probe by name. No Save45 tree can carry it (1361-F
     ruling 17). The condition map comes with the first tree that forces a G-P rerun with P15B.
   - **(b) Kept, and disclosed in the run record.** A present, empty market root reads as recorded with no rows (RED A7
     :617-619; the P15C reference r4).
3. **The G2-Retune path is corrected** (1361-GP-D finding 5; amends 1361-F rulings 11 and 13).
   - **Why (a) and (b) cannot land alone.** P15A.1's chartered validator demands a film bijection: every simulated
     release from `max(recordedFromWeek, originWeek)` has exactly one assessment (1355-A §3.4 item 3). Only commit (c)'s
     batch writes assessments (1355-A §8 item 5). A world on (a) and (b) without (c) therefore fails validation at its
     first simulated release, and no save could be written.
   - **The corrected path.** On a G2 Retune, P15A.1 takes its declared fallback: its own later step, a new capture at
     its own path, and the re-pin of its two capture leaves (1355-F5; 1361-R Part 0, item 7).
   - **What lands at Save45 instead:**
     - slice 2a;
     - P15C, if its G-P passed on the tree it lands on. That tree is then slice 2a without P15A.1, so G-P runs there
       (1353-F7:64-65 asks for P15A.1 only "when it lands first or together").
   - **What does not change.** A K1-K5 failure is a Defect (ruling 4), not a Retune, and the path above does not apply
     to it.
4. **G2: the author's four choices.** The G2 review checks the probe against these.
   1. **"A rival that films in control stops for good"** means the candidate's last filming week precedes the
      control's by at least 52 weeks. That matches the same row's "new streak ≥ 52 weeks". The literal reading, any
      earlier last week, is printed and does not decide.
   2. **Only the cumulative figures** at each read-out (520, 1560, 3120, 4680 and 6240) decide. The windows in between
      are reported.
   3. **An increase from a zero baseline** reads Retune, as the table states. The report shows the absolute counts.
   4. **A K1-K5 failure,** or a K4 run that does not finish, reads **Defect**, never Retune: "any failure is a defect,
      not tuning" (1355-A §5). Its route is a production fix and a new G2.
5. **After the recovery amendment, G-L reruns** (1361-GP-D finding 9).
   - **Why.** 1353-F6:76-77 and 1359-F5 ruling 4 ask for G-P again on any tree that carries a 1357-Q1 change. The
     Owner set the recovery amendment after the Save45 landing ([1362-O](1362-O-owner-response-20261002.md)). By then
     P15C has landed, and G-L is the gate on the live root (1359-A §9).
   - **What runs.** G-L on the same seeds and routes, on the tree that carries the recovery change, as part of that
     amendment's verification (1363).
   - **A trigger** there routes to retuning (1359-F5) and is reported as a finding, not accepted because it was
     measured (1362-O, item 7).
