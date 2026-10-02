# 1361-F4: parent response to 1361-D2, the review of P15A.1 r1 and slice 2a r2

[1361-D2](1361-D2-p15a1-r1-review.md) reviewed the stack that [1361-X2](1361-X2-p15a1-stack-dry-run.md) measured:
slice 2a r2 (5eccada) and P15A.1's (a) 39d0481, (b) 1074744 and (c) c524911.
- **Verdict:** PROCEED. (c) c524911 stays the frozen G2 candidate, and P15C may build on it.
- **What needs no change:** no finding asks the writer to change (a), (b) or (c).
- **What it confirmed:**
  - R1 to R4 as 1361-F3 wrote them, with no leaf's status or message moved from r1 to r2;
  - R3's wider sequence walk;
  - the (b) and (c) split;
  - the validator, the witness and the seam, with every unpressured release bit-identical.

**Pre-registration.** Ruling 1 was written and pushed before the G2 report existed. The candidate runs had finished;
the parent had read no K3 field of them.

## Rulings

1. **How G2 reads K3 when paths lie outside K1's chain** (finding F1).
   - **The gap.** 1355-A §4's list of "what moves in week W", which `k1AllowedPaths` encodes
     (`tests/helpers/p15a1-market-route.ts:447-475`), omits the steps at the end of the tick:
     - lifecycle intent, promises, the talent market and lifecycle settlement (`src/core/tick.ts:1178-1179`);
     - these steps read what the pressured chain moves: cash (`talentMarket.ts:389-401`), Standing (:825-834, :883) and
       fame (`releaseCareers.ts:56`), which sets every stored price.

     The production follows the charter, and 1355-A:159 says that later weeks inherit those changes. K1's leaf passes
     at week 21 only because that week holds no market case.
   - **The amendment.** 1355-A §4's list adds the end-of-tick steps and every path they write in the pressured week.
     The landed RED's `k1AllowedPaths` stays unchanged. A re-mint of the K1 pin (1361-R Part 0 item 8) keeps a K1 week
     with no open market case, or carries the amended list.
   - **How K3 reads.**
     - **(a) No outside path,** and K3's other conditions hold: K3 holds.
     - **(b) Outside paths, with every other K3 condition holding.** The other conditions are:
       - equal through the pressured week;
       - the factor-1 twin equal to the control;
       - the seam called;
       - at least one differing path.

       K3 stays undecided until an attribution check runs, and the verdict waits for it. The check takes the same seed
       and pressured week and runs both twins, the pressured tick and the probe's factor-1 tick. It captures each
       twin's state where the end-of-tick chain begins, the input to `advanceLifecycleIntent`. It then diffs the two
       with the probe's `diffPaths` and `stripP15` against `k1AllowedPaths`.
       - If no outside path exists at that point, the end-of-tick steps wrote every outside path. K3 then holds under
         the amended list, and the record names the gap as a finding.
       - If an outside path exists there, K3 reads Defect.
     - **(c) Any other K3 failure** reads Defect (1361-F2 ruling 4.4).
   - **The check's form.** The parent writes it from the probe's own K3 code, leaving the probe unchanged, and runs it
     in the candidate tree through the lane. An independent reviewer reads it before its result decides K3.
   - **Why a path list does not settle it.** Some outside paths could come from either side: ledger rows,
     account-period movements and receipts. Only the state at the chain's entry tells the two apart.
2. **d16 reads the factor** (finding F2).
   - **The fix.** The writer adds commit (d) on c524911, tagged `p15a1-d-r1` and touching `src/harness` only.
     `reconstructDiscovery` (`src/harness/d16/driver.ts:1288-1290`) takes the stored factor by `releaseId` from the
     post-tick state (:826-838) and sets it as `competitionFactor`.
   - **Order.** c524911 stays the G2 identity. P15C's commits build on (d).
   - **Dry runs.** The parent's next dry run adds `src/harness/d16/vitest.d16.config.ts` at `base`, (c) and (d). The
     `base` run measures what was never measured. The fallout run (1361-F ruling 20) and the landing's broad gates
     add that config.
3. **If G2 reads Retune, the original path returns** (review item 3; supersedes 1361-F2 ruling 3).
   - **Why ruling 3 falls.** Its premise was that (a) and (b) fail validation at the first release.
     - The writer's decision D1 removes that: (b)'s tick write moves `recordedFromWeek` to the produced week.
     - Every state (b) writes then validates.
     - A (b) save loads under (c) with no step, and (c) replaces the write.
     - Measured at (b): the 1356 harness save validates, and both capture leaves pass (1361-X2).
   - **The path** is 1361-F ruling 13's. (a) and (b) land at Save45. (c) lands later after its retune and a new G2,
     with no save step.
   - **D2's five conditions bind:**
     1. D1 is adopted by name.
     2. The 44 leaves of 1355 red at (b) are declared by name from `1361-stage/x-r2b/p15a1.json` as waiting for (c).
     3. If P15C joins, its production is rebased on (b), dry-run there, and G-P runs on that tree (tag
        `p15a1-b-r1`, roots line `p15Sequence, powerRanking, sharedMarket`). The landing record discloses that a
        campaign reaching 2040 on a (b) build freezes a Legacy with no market lens. No Owner-facing build carries
        Wave 2 without Waves 3 and 4 (1359-A:214).
     4. F3's guard joins (b): its write refuses by name when the root holds a row, so a (c)-era save fails at the
        first tick instead of at save.
     5. The retuned (c)'s new G2 reads K3 under ruling 1.
4. **The harness figure is noise** (finding F5).
   - **The overstatement.** 1361-X2 says the harness runs 5% slower at (c) "with the batch on". That attributes a cause
     the runs cannot carry: r1 and r2 run identical tick code and differ by 4.1%, and (c) plays a different campaign.
   - **What stands.** Only the measured times stand. 1361-X2 carries a correction line.
   - **What decides.** Ruling 15's merged-tick run decides against the 300,000 ms ceiling.
5. **The rest go to their owners.**
   - **F4** goes to Wave 3's open items. The UI release breakdown (`ui/src/engine/adapter.ts:3442`) omits the factor,
     and the comment at :3538 is false for a pressured release.
   - **F6** goes to the first retune: a mixed-era week refuses by digest message, not by name
     (`marketIntegration.ts:230`). The missing `ponytail:` marker at :99 goes to the closure's text items.
   - **F7** goes to the sweep plan `1361-N`: at (b) and (c), ticking a hand-built industry state without
     `sharedMarket` fails by name at the first tick.
6. **The disclosure stands.** The reviewer ran `git rev-parse HEAD` and `git branch -a` in the writer's tree, outside
   its allowed verbs. Both read refs only, nothing was written, and no recorded run used that tree.
