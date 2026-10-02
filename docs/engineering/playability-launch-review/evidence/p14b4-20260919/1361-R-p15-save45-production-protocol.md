# P15 Save45 production protocol: P15A.2 slice 2a, P15A.1 Wave 2 and P15C Wave 2

Compiled read-only from the project records on 2026-10-02. The clock read 12:42 CDT at the first `date` check and
13:04 CDT at the end.
- **HEAD.** The brief named 6044ad4f. During the compilation the parent landed steps 8 to 10 and closed the RED
  landing, so this protocol reads a63c7de8: 840cf1c7 (route L captures), e16b782e (recorded RED
  `1360-p15c-red-recorded`) and a63c7de8 (1360-L, 1360-D2, 1360-F3, HANDOFF). The `src` tree is 762d8e09 at
  1706d844, 6044ad4f and a63c7de8 alike, so every apply check below holds at all three.
- **Sources.** The E records, the staged reference patches, classifications and producers, the RED tests and helpers
  at HEAD, and `HANDOFF.md` at a63c7de8.
- **What ran.** No node, vitest, tsc, npm or vite-node. Git use was `show`, `rev-parse`, `ls-files`, `ls-tree`,
  `grep` on HEAD, `log --oneline`, and `apply --check --cached` under temporary index files made by
  `GIT_INDEX_FILE=<scratch> git read-tree <commit>`. The real index was never written. Python only read files and
  blobs: a bounds check of every citation in this record, and 1358-N's detector shifted one era. Under
  `tests/fixtures`, only the P15 MANIFEST.json files were read.

**Notation.**
- E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, and S is `/Users/zacheryspector/studio-scratch`.
- `1356-A:237` is line 237 of the E record whose name starts `1356-A`.
- "1356 ref :N", "1355 ref :N" and "1359 ref :N" are lines of the reference patches
  `E/1356-stage/1356-p15a2-wave2-reference.patch`, `E/1355-stage/1355-p15a1-wave2-reference-r3.patch` and
  `E/1359-stage/1359-p15c-wave2-reference-r4.patch`. "sib :N" is a line of `E/1359-stage/1359-p15c-wave2-sibling-r2.patch`.
- "1356 patch :N" (and 1355, 1359) is a line of a staged RED patch, as 1360-R and 1360-D use it.
- "cls :N" is a line of a RED classification: 1356 r4, 1355 r4 or 1359 r8, named in each section.
- `HANDOFF:N` is line N of `HANDOFF.md` at a63c7de8.
- `tests/x.test.ts:N` and `src/core/x.ts:N` are lines of HEAD's blob. In Part 1, A, I and H abbreviate
  `tests/p15a2-power-ranking-archive.test.ts`, `-isolation.test.ts` and `-harness.test.ts`; T abbreviates
  `tests/p15a1-market-integration.test.ts`; L abbreviates `tests/p15c2-campaign-legacy-integration.test.ts`.

---

## Part 0. The frame

**State at HEAD.**
- The P15 Wave 2 RED landing is CLOSED (1360-L:3). The three REDs, both Save44 captures, the 1355 pins and
  `CAPTURE_MANIFEST_SHA256` have landed (1360-L:14-25).
- The live writer is Save44: `LIVE_SAVE_VERSION = 44` (`src/core/save.ts:6567`). By `git log`, no commit after slice
  B's production step 4 (83d1030d) changes `src`; f458680b, the Save44 sweep, changed 149 `tests/` files and five
  `ui/src` test files.
- The root type gate carries six TS2307 errors until the productions add `src/core/p15Phases.ts` and
  `src/core/powerRankingArchive.ts` (1360-L:74-76, :92-93).

**The rulings that bind this phase.**
1. **One save step, Save45,** for slice 2a, P15A.1 and P15C (1360-F:16). The authority is 1355-F Amendment 4
   (1355-F:40-42) and 1359-A §10 item 4 (1359-A:277-278). Each root keeps its own validator, migration, downgrade
   refusal and RED leaves (1355-F:41-42).
2. **One production writer** authors them in 1355-F4's order, slice 2a, then P15A.1, then P15C, on the Save44 base,
   and they land together behind one Save45 sweep (1360-F:25-26; 1360-L:97-99). The writer works in scratch
   (HANDOFF:46), outside the repository (1360-D:73-74).
3. **Save45 is reserved.** No other save step takes 45 (1360-F2:23-24).
4. **No commit that changes `src/` lands before Save45** (1360-F2:25-26 as amended by 1360-F3:42-45). Commits that
   change only tests, fixtures, docs, scripts or `ui/` may land; a test-helper change that alters a producer's route
   still needs its own review (1360-F3:43-45).
5. **If one production cannot be ready,** the parent rules again before any of them lands (1360-F:29-31).
6. **The bound.** Once slice 2a's production has passed its review and its dry run on the landed REDs, the parent
   rules again if P15A.1's G2 or P15C's G-P has not returned. Slice 2a may then land alone at Save45, and the others
   take their declared re-pins at a later step (1360-F2:38-40).
7. **The declared fallbacks.**
   - P15A.1: a new capture below its own step, at its own path, and its two RED 16 leaves re-pin (1355-F5:25-30;
     1355-C3:13-14). Its K1, K2 and M0A pins hold at separate steps (1355-C2:6; 1355-D2:28).
   - P15C: one helper edit moves `CAPTURE_DIRECTORY` (`tests/helpers/p15c2-route-l.ts:41`), 1359-P mints again at
     the last writer below P15C's step, every reader of the route L captures re-pins (C2-C4, and C3b once the sibling
     test lands), and the Save44 directory retires (1360-F2:12-18; 1360-F3:14-22).
8. **A 1357-Q1 production change before Save45.** The parent rules again before its commit; the P15 captures and the
   1355 K1, K2 and M0A pins retire, each producer mints again at the new last writer below Save45, and the reading
   leaves re-pin (1360-F2:27-33). The commit before the re-mint removes the committed fixture directories, and K3's
   baseline moves to an archive of the new last writer (1360-F3:23-27).
9. **P15B** joins Save45 only if its production is ready with the three. It waits on Owner question 1357-Q1
   (1360-F:27-28; 1360-L:109), and no P15B RED is staged (1357-F2:58-60).
10. **The cost of the wait.** Every campaign that keeps playing on a Save44 build migrates later, so its archive and
    its Legacy record from a later week (1360-F2:34-37).
11. **The parent's next record.** The parent rules on this plan as `E/1361-F` and publishes this protocol as
    `E/1361-R` (HANDOFF:45).

---

## Part 1. Per production

Every production also owes the gaps all three references share (Part 2.5).

### 1.1 P15A.2 slice 2a, the Power Ranking archive (1356)

The RED has 72 leaves in A, I and H, classified in `E/1356-stage/1356-p15a2-wave2-red-r4-classification.json` (cls).
The recorded RED failed 70 and passed 2 (1360-L:17).

**src files.**
- New `src/core/powerRankingArchive.ts`: the adapter, the fixed cost, the step and the validator in one module
  (1356-A:45). The reference holds `studioWeeklyFixedCost` (1356 ref :97-109), `recordPowerRankingQuarter` (:189-219)
  and `validatePowerRankingArchive` (:237-313).
- New `src/core/p15Phases.ts`: the v1 phase table and the allocator (1355-F2:31-42; 1356 ref :1-44), in 1355 r3's
  form (Part 2.4, item 1).
- `src/core/tick.ts`: the step wraps tick()'s last expression (1356-A:76-77; 1356 ref :811-814).
- `src/core/worldgen.ts`: a fresh world records from week 0 and starts the allocator at 1 (1356-A:135; 1356 ref
  :876-879).
- `src/core/save.ts` and `src/core/types.ts`: the save step on the V40 pattern (1356-A:137-139; 1356 ref :314-793,
  :818-859), including the strip in `validatedLiveProfessionContext` (1356 ref :687-694).
- Slice 2b, the paged `/industry` view with its projection step, is not part of Save45: "Slice 2b follows 2a with the
  first projection after slice B's 57" (1356-A:13-18, :241).

**What production owes beyond the reference.**
- **Two `src` type errors.** The reference fails the root type gate at `src/core/save.ts:10498` and
  `src/harness/roster-wall/historical-control.ts:33` of its own tree: "The production must not carry them"
  (1356-X:58-60). "The production writer's type gates must be clean on `src`" (1356-F3:33-34). The 1359 reference
  hits the same two sites (1359-X2:45-47). At HEAD they are the cast at `src/core/save.ts:10487` and the
  historical control's state literal at `src/harness/roster-wall/historical-control.ts:33`. No record names the fix.
- **The phase lookup.** Validators read `P15_PHASE_TABLES[row.phaseOrderVersion]` through the export, and "1356-C's
  and 1359-C's references follow the same rule when their productions land" (1355-F5:13-14, :20-21). The reference's
  `p15PhaseMatches` closes over the table (1356 ref :35-40).
- **One cross-root `next` check** (1355-F2:43-45). The reference checks the archive alone (1356 ref :312).
- **The sweep.** "The production's sweep moves the 33 test pins" (1356-F3:33-34). That is now the one Save45 sweep.

**Save-step mechanics.**
- **Roots.** `powerRanking = {version: 1, recordedFromWeek, snapshots}` (1356-A:93-98), and `p15Sequence = {version:
  1, next}`, which arrives in the shared step (1355-F2:24-25, :51-53). A record's id is
  `power-ranking-<p15DomainSequence>`, and it carries the phase triple (1355-F2:26-31, :46-48).
- **Up from V44.** An empty archive at the save's `market.tick`, the allocator at 1, no past quarter, no back-fill,
  and a second migration is a no-op (1356-A:134-135; 1355-F2:51-52). `rank-root-migration-empty` (A:848-865) and the
  capture leaf (A:867-898) pin it.
- **Validation** runs after the frozen chain (1356-A:118-128).
- **Down.** An empty archive strips. A recorded quarter refuses with "cannot downgrade or discard a recorded Power
  Ranking quarter" (1356-A:136-137; 1356 ref :783). Frozen builders refuse a non-empty archive and strip an empty one
  (1356-A:138-139). The RED checks the step's converter, at least 30 older migrators and at least 18 `makeSaveVn`
  builders, and keeps the headless V18 control stripping (A:181, :913-959).
- **The version.** The shared step moves `LIVE_SAVE_VERSION` from 44 to 45 once (1360-F:16). `ARCHIVE_STEP` reads the
  live constant (A:169), and every step function resolves by name (A:176-179), so the 1356 tests need no edit at
  Save45. "A later save step pins `ARCHIVE_STEP` to that number in its own live-version sweep" (A:21-25).

**Public and bridge surface.** None in slice 2a, and the reference touches no bridge file. On F10 and F11 the 1356
records are silent. The bridge compares against the constant (`bridge/session.ts:139`;
`bridge/runtime-checkpoint.ts:501-505`), so it moves with it.

**Time budgets.**
- **The harness H.** `CEILING_MS = 300_000` (H:42), set at about five times 1356-X's 61,020 ms run alone (1356-F3:14-15;
  1356-X:61-62). The leaf throws a named CEILING error past it and asserts that campaign, `makeSave` and validation
  together stay within it (H:53-56, :91-95).
- **Measured at the reference:** 61,020 ms (1356-X:24), 65,404 ms (1356-X2:13), and 57,710 ms in all, 19.2% of the
  ceiling (1356-X3:33; 1356-D4:62).
- **It runs alone,** out of the broad core list (H:22-23; 1356-F2:40). Broad gates run it as its own run (1360-F:70-73;
  1360-L:87).
- **Unmeasured:** the harness with P15A.1's batch and P15C's freeze in the same tick.
- The archive and isolation files carry vitest timeouts only, with no budget (A:184-185; 1356-F5:16-17).

**RED leaves at GREEN.**
- **Controls.** `rank-fixed-cost-rival-research-window-premise` (cls :81) and `rank-root-frozen-builder-headless-control`
  (cls :200) pass now and must pass after production (A:19).
- **At the reference** the archive and isolation files gave 70 passed and 1 failed, the capture leaf for lack of its
  fixture, and the harness passed (1356-X2:12-16; 1356-X3:28).
- **The capture leaf** now fails at `expected 44 to be 43` (1360-L:89-91). The capture is Save44 (1360-L:37), and the
  leaf asserts STEP − 1 (A:879, :890), so it "first passes once ARCHIVE_STEP is 45, at slice 2a's GREEN" (1360-R:318-319).
- **All 72 should pass** at a shared Save45. No row declares a leaf that stays red.
- **The declared re-pin rows** (cls :116, :158, :165, :179, :186, :193, :494), at a shared step:
  - RED 9 `rank-step-final-facts` (I:117-153) and `rank-step-record-is-law-snapshot` (A:742-755) re-pin at "a later
    end-of-tick step" (A:32-35). That is P15C's freeze, which returns its input in every tick but the 2040 one
    (1359 ref :1375-1379). By reading they hold below week 6240. Unmeasured.
  - The three downgrade leaves (A:913-948) may meet a sibling's refusal first (A:36-38). The second production,
    P15A.1, fixes the order (1355-F4:26-28; 1360-D:219-220), and 1355 r3's single refusal keeps A:181 matching.
  - `rank-root-migration-empty` and the capture leaf hold while the step adds only `P15_ROOTS` keys (A:39-41). They
    re-pin only if P15B joins with its loan movements (1360-D:215-216).

**Review chain.** A production review and a dry run on the landed REDs (1360-F2:38-39); type gates clean on `src`
(1356-F3:33-34); the live-version sweep after the bump (1356-A:240). No 1356 record names a production review record.
The precedent chain is in Part 4.3.

**Gates.** None of its own. Its preconditions hold: Save43 and Save44 have landed (1356-A:238-240; 1358-L:3), and
"Slice 2a has passed its gates" (1360-D:98). Its landing waits on the siblings' gates, within the bound (1360-F:29-31;
1360-F2:38-40).

### 1.2 P15A.1 Wave 2, the shared market (1355)

The RED has 59 leaves in T, `tests/p15a1-market-integration-phases.test.ts` and
`tests/p15a1-market-integration-atomicity.test.ts`, classified in
`E/1355-stage/1355-p15a1-wave2-red-r4-classification.json` (cls). The recorded RED failed 51 and passed 8 (1360-L:21).

**src files.**
- `src/core/tick.ts`: step 2.5, MARKET BATCH, after the P06A witness and before step 3 (1355-A:53-54), with the root's
  append at finalize (1355-A:150; 1355 ref :537-572).
- `src/core/hollywoodTick.ts`: `advanceHollywoodWeek` takes the rival factors (1355-A:77-78; 1355 ref :1-62).
- `src/core/reception.ts`: an optional `competitionFactor` replaces the constant 1.0, and an out-of-range factor
  throws (1355-A:76-82; 1355 ref :395-442).
- A new module for the batch and the root, `marketIntegration.ts` in the reference (1355 ref :63-339). Its file and
  function names are not fixed, and no leaf imports them (1355-C:47).
- `save.ts`, `types.ts` and `worldgen.ts`: the root, validator, step, migration, downgrade and fresh worlds
  (1355-A:88-137).
- Edits to slice 2a's `p15Phases.ts` and `powerRankingArchive.ts` (1355 ref :340-394).
- **Three commits:** (a) the seam defaulting to 1; (b) the root, validation, save step, migration and downgrade; (c) the
  batch, the witness and the factor at both call sites (1355-A:265-266).
- **Binding seams.** Production calls `assessBatch` through its export from outside `sharedMarket.ts` (1355-F4:44-45;
  1355-C2:19). Validators read the phase table by row version through the export (1355-F5:13-17), and the tables may be
  frozen (1355-F5:20).

**What production owes beyond r3.**
- **The allocator check over every root.** r3 scans `sharedMarket` and `powerRanking` only: "a merged step lists every
  sibling root here" (1355 ref :255-268). The Legacy's `official` carries a `p15DomainSequence` (1359 ref :552-559).
- **The strip and the frozen-builder guard** over all four keys, `campaignLegacy` included (1355 ref :460, :476-480).
- **The one refusal** names the Legacy too (1355 ref :511-518).
- **Clean `src` type gates** (1355-F6:31).

**Save-step mechanics.**
- **Root.** `sharedMarket = {version: 1, recordedFromWeek, assessments}` (1355-A:90-96). Each row carries its
  `p15DomainSequence` and the phase triple of `p15a1.marketBatch` (1355-F3:21-22; 1355-F2:36).
- **Validation** (1355-A:116-127; 1355-F3:24-25). Each forgery throws on `/sharedMarket|p15Sequence|p15DomainSequence/`
  and its own pattern (T:600-652).
- **Up.** `{version: 1, recordedFromWeek: market.tick, assessments: []}`: nothing invented, the 26-week ramp disclosed,
  and a second pass a no-op (1355-A:133-135; T:738-786).
- **Down.** Lossless only while empty, else a refusal by name (1355-A:136). `DOWNGRADE_REFUSAL` (T:90) must fire at
  the step and through every older migrator (T:788-797).
- **Fresh worlds** create the root at the creation tick (1355-A:137; T:806-814).
- **Allocation.** The market rows take the tick's first numbers in (week, releaseId) order, at finalize (1355-F2:26-30;
  1355 ref :569-572).
- **The version.** `MARKET_STEP = LIVE_SAVE_VERSION` (T:77), with the converters found by name (T:85-87). No edit at
  Save45.

**Public and bridge surface.** "Wave 2 has no projection step; projection 57 belongs to slice B, and each step carries a
pin sweep" (1355-A:220-221). Projection, Bridge, UI and the preview belong to Wave 3 (1355-A:21-22). On F10 and F11
the 1355 records are silent. `PROJECTION_VERSION` is 57 (`bridge/schema/bridge-schema.ts:286`).

**Time budgets.** Vitest timeouts of 300,000 and 600,000 ms (T:147-148). The RED's three files ran in 7.8 s and the
reference in 13.2 s (1355-X:19-20). No 1355 record sets a ceiling. The closure's integrated 6,240-week normal and
hostile harness has no file and no budget yet (1355-A:268-269). G2 reports median and p95 tick time without a limit
(1355-A:184-185).

**RED leaves at GREEN.**
- **Counts.** 8 controls and 51 RED leaves; 6 rows were fixture-pending and 4 carry a sibling re-pin (cls :42-49).
- **The four pin controls** pass now and must keep passing: `market-seam-default-exact`, K1, K2 and M0A (1360-L:63).
  K1's confinement check first does real work at GREEN; 1355-D4:44 recommends a scratch diff of the two week-21
  post-tick states sooner.
- **The two capture leaves** fail at T:728, 44 against 43 (1360-L:64), and pass once `MARKET_STEP` is 45
  (1355-F5:25-30).
- **At the reference:** 53 passed and 6 failed, all six FIXTURE PENDING (1355-X2:13, :17-21). The fixtures and the
  sha pin have landed (T:715), so by reading all 59 pass at GREEN. No row stays red by declaration. Unmeasured on a
  Save45 candidate.
- **The re-pin rows** at a shared step: the R1 cross-root leaf (T:658-681) passes by the landing order (1355-F4:19-20);
  the downgrade leaf (T:788-797) takes the order the second production fixes (1355-F4:26-28), and P15A.1 is second
  (1360-D:219-220); the capture leaves hold (1355-F5:29-30).

**Review chain.** Three commits; G2 on the frozen (c), which lands only on Proceed or Flag; closure by recorded GREEN,
implementation review, version sweep, recorded broad gates and the integrated 6,240-week normal and hostile harness
(1355-A:265-269).

**Gates.**
- **G1** returned "Proceed, flagged for the Wave 4 playtest brief" (1355-X4:6-8), on a Save43 tree (1355-X4:22-25). It
  reruns only after a retune (1355-A:205-206).
- **G2** is closed loop: "the frozen step-(c) candidate (§8) against the control at the RED commit, same routes"
  (1355-A:181-185), on seed `p13a-core-causal-01` and seed-b (1355-A:173-176). The thresholds are 1355-A:187-197: K1 to
  K5 exact, and root bytes at most 2% of save bytes.
  - **K3's baseline** is G2's rerun at the RED commit (1355-F4:41), run on an archive of e4be3e5c (1360-F2:67-68;
    1360-L:101). Its `src` equals HEAD's.
  - **The candidate** sits on slice 2a's production (1355-F4:8-10; 1360-F:25-26). No record says whether P15C's
    production sits under it.
  - **No G2 probe exists.** The G1 probe "computes none of the G2 rows" (`E/1355-stage/g1/1355-G1-notes.md:83`) and
    refuses a tree that carries `sharedMarket` (notes :12-14).
  - **seed-b** is built as `p13aGeneratedStudio('seed-b')`, since `rivalFixture` ignores its seed (1355-X4:20-21).
  - **A retune** is an amendment with its own record and review, then G1 and G2 again (1355-A:205-206).
  - **If G2 does not return:** the parent rules again (1360-F:29-31), under the bound (1360-F2:38-40), with 1355-F5's
    re-pin. 1360-D:230-231 notes that G2 gates only commit (c), so a G2 failure need not move P15A.1's root off Save45.
    No ruling adopted that reading.
  - **A 1357-Q1 change** moves K3's baseline to an archive of the new last writer (1360-F3:26-27).

### 1.3 P15C Wave 2, the Campaign Legacy integration (1359)

The RED has 116 leaves in L, `tests/p15c-wave-r-retention.test.ts` and `tests/p15c1-campaign-legacy.test.ts`,
classified in `E/1359-stage/1359-p15c-wave2-red-r8-classification.json` (cls). The recorded RED failed 40 and passed
76 (1360-L:25, :56).

**src files.**
- `src/core/campaignLegacy.ts`, the Wave 1 module: the fact adapter, the freeze step, the root type and validator, the
  frozen definition table, and an exported ref resolver (1359-A:37-40, :108-119, :153-154, :177-181, :212).
- `save.ts`: the root validator after the frozen chain; the migration, the downgrade guard, the frozen builders and a
  downgrade line in every older migrator (1359-A:160, :183-195).
- `tick.ts`: the freeze is the tick's last step (1359-A:110-113).
- `types.ts` and `worldgen.ts` (1359-A:153-154, :187-188).
- `src/core/tuning.ts`: the v2 values (critic 60, share 20, hit 49, flop 30; 1359 ref :1399-1409), which "do not land
  on their own before Wave 2" (1353-F6:67-69).
- **Three commits:** (a) the root type, validator, save step, migration, downgrade and frozen builders; (b) the
  adapter; (c) the tick step (1359-A:280-281). The F1 relaxation, a null `settledWeek` for authored films only, lands
  with this production under its implementation review (1359-F2:8-14).

**What production owes beyond r4.**
- **The exported ref resolver.** r4 keeps `checkRef` as a closure inside the validator (1359 ref :752-761), and no leaf
  pins a resolver.
- **The same two `src` type-error sites** as slice 2a's (1359-X5:39-41). "The reference is not production. The
  production writer owns both" (1359-X2:46-47).
- **The 1355-F5 lookup** in place of `p15PhaseMatches` (1359 ref :26, :619; 1355-F5:13-21).
- **One cross-root allocator check** in place of the Legacy-only `validateP15Sequence` (1359 ref :1301-1316).
- **Text notes.** Law :91 and :288, and p15c1 :50-59 and :70-72, "go to Wave 2 production and the next Wave 1 text
  pass" (1359-F6:30-31).

**Save-step mechanics.**
- **Root.** `campaignLegacy = {version: 1, recordedFromWeek, official, endOfRun}` (1359-A:146-153). The step creates
  `p15Sequence` "unless a sibling in the step does" (1359-A:185-187); at Save45 slice 2a's root brings it.
- **Up.** `{version: 1, recordedFromWeek: market.tick, official: null, endOfRun: null}`, no freeze at migration, and a
  second migration is a no-op (1359-A:185-188). A save below B (week 6240) freezes on its 6240 tick, with migrated
  siblings read as `limited`; a save at or past B never freezes (1359-A:189-192). Production must land "before any
  campaign reaches 2040" (1359-F:50-51).
- **Validation.** Exact keys and `recordedFromWeek` within [0, `market.tick`] (1359-A:162); the marker rule
  (1359-A:129-131); a replay under the stored definition's evaluator (1359-F:13-16); the v1 and v2 era table
  (1353-F6:40-42).
- **Down.** An empty root strips. A frozen Legacy refuses with "cannot downgrade or discard the frozen 2040 Legacy";
  frozen builders refuse; every older migrator gains its line (1359-A:193-195). The RED requires the refusal from the
  step's converter, from every `migrateToVn` for 4 ≤ n < STEP and from every `makeSaveVn` (L:885-915;
  `tests/helpers/p15c2-legacy.ts:283`).
- **The version.** STEP reads `LIVE_SAVE_VERSION` (`tests/helpers/p15c2-legacy.ts:22`), and the step functions resolve
  by name (:279-281). `BASE_LIVE_SAVE_VERSION = 44` (L:151) stays: `legacy-root-fresh` asserts `STEP > 44` (L:820),
  which holds at 45. "A later step pins STEP in its sweep" (L:47).

**Public and bridge surface.** "No projection step" (1359-A:278); the views are Wave 3 (1359-A:18-19, :205-209). The
one public export is the ref resolver for Wave 3 (1359-A:212). "No Owner-facing build carries Wave 2 without Waves 3
and 4" (1359-A:214). On F10 and F11 the 1359 records are silent.

**Time budgets.** Each leaf times itself: `ROUTE_MS` and `EXTENSION_MS` 90,000, `POST_FREEZE_MS` 180,000 and
`FIXTURE_MS` 120,000 (`tests/helpers/p15c2-legacy.ts:35-43`), and `GUARD_BUDGET_MS` 300,000
(`tests/p15c-wave-r-retention.test.ts:104`). The rule is about six times the slowest single-file time (1359-F4:8-17),
with no in-loop ceiling (1359-F4:39-46). C2-C4 and the five sibling leaves have never been timed at GREEN
(1359-D4:194-196). The freeze tick's time carries no budget (1359-A:267).

**RED leaves at GREEN.**
- **All 116 should pass.** "No leaf in this RED may stay red after this wave's GREEN" (1359-F2:42). `atReferenceR4`
  reads pass on 113 rows, and C2-C4 read pass after the mint (cls :322-385). 1359-X5 measured 113 passing with C2-C4
  pending (1359-X5:31-38).
- **C2-C4** now fail by name on the Save44 captures (1360-L:66-68). The helper refuses a capture at STEP and requires
  STEP − 1 (`tests/helpers/p15c2-legacy.ts:249-252`), so they pass at 45. At any later P15C step they fail until the
  fallback (Part 0, item 7).
- **The five p15c1 leaves** pass once the law and `tuning.ts` carry v2 (1353-F6:57-59; 1359-C6:191-197).
- **C11** pins the v1 and v2 literals, the table's key set and `TUNING` at v2 (1359-D5:78-85); it passed at reference
  r4 (1359-X5:38). A move to 48 changes C11's literal under its own record (1359-C6:280-281; 1353-F7:25-26).
- **B1 and C4g** count new rows over `P15_ROOTS` and hold now that the list has four keys (L:58-61).
- **A3, A5, A7, A8 and B4** forge sibling roots in the charters' shapes and re-pin "to the landed shape at that
  sibling's landing" (L:62-64). For slice 2a and P15A.1 that landing is Save45 itself. `corporateCondition` does not
  land, so production keeps reading it untyped as r4 does (L:53-57), or those cases move to P15B's patch
  (1359-A:275-276; 1360-D:162-168).
- **C2 and C5** compare only the keys a step adds or strips (L:65).

**Review chain.** Three commits; closure by "recorded GREEN, implementation review, live-version sweep, broad gates,
Wave R guards, G-L" (1359-A:280-282). F1 lands "under that wave's implementation review" (1359-F2:14). "Wave 2
production follows the reference, as before" (1353-F7:59). At closure, G-L's K3 requires the official manifest minus
its stamp to equal G-P's byte for byte (1359-A:265-267).

**Gates: G-P.**
- **What it measures.** The landed law plus the adapter on the recorded seeds' natural routes to week 6240: holders per
  archetype, the domain table, refusals, freeze time and manifest bytes (1359-A:260-264). It triggers when an archetype
  is held by none in every seed or by every studio in every seed (1359-F5:7-9). It gates production, not the RED
  (1359-F5:25-26).
- **History.** 1359-X4 ran v1 and sent two archetypes back to retuning (1359-F5:3, :9). 1353-X4 ran v2 and did not
  trigger (1353-X4:4-6), but it "is not the gating run" and carried no shared-market pressure (1353-X4:61-65).
- **The gating run** "uses the tree Wave 2 production lands on. That tree carries slice B's Save44 production, and
  P15A.1 Wave 2 when it lands first or together" (1353-F7:64-65). It runs "again before P15C Wave 2 production on any
  tree that carries P15A.1 Wave 2 production or a 1357-Q1 change" (1353-F6:76-77).
- **The probe branch.** The probe refuses any P15 root today (`E/1359-stage/gp/1359-GP-probe.ts:50-57`). An agent
  writes a branch for the sibling roots and a reviewer checks it (1353-F7:66-68). The probe's own note says to add the
  §3.1 row maps and check the law's record-id rule when a sibling root lands (probe :48-49).
- **Under Save45** the gating tree is a scratch tree: HEAD plus slice 2a's and P15A.1's authored productions, since
  nothing lands before Save45 (1360-F3:42-45). 1353-X4 put the v2 values in as a tree commit (1353-X4:12-19). It must
  return before P15C's production lands (1360-L:102-104).
- **On failure.** `commercial-engine` unheld under pressure takes 48, with its own record and review (1353-F7:20-26).
  Any other trigger returns §5.5 to retuning (1359-F5:19-23). The parent rules again (1360-F:29-31), under the bound
  (1360-F2:38-40), and P15C's fallback applies (1360-F2:12-18; 1360-F3:14-22).

**The sibling patch r2.** Five leaves: B2, B4b and C8b need `powerRanking`; C3b needs a shared step; C10c needs any
sibling root (sib :13-19). The patch "lands with the sibling root they need" (1359-F2:41). It applies at a63c7de8
(Part 2.3). No classification row and no run exist for its leaves. C3b reads route L, so P15C's fallback re-pins it
too (1360-F3:14-22).

---

## Part 2. The reference patches

### 2.1 Identity, base and save version

Each staged patch hashes to the sha256 its records cite.

| Reference | Lines, sha256 | Base and save version | Files, by patch lines |
|---|---|---|---|
| **1356** | 881, 83cb2a59… (1356-X:9; 1356-C4:36) | Preimages `save.ts` 2f7006b, `tick.ts` fee7846, `types.ts` a56cd28, `worldgen.ts` 422f045 (1356 ref :315, :795, :819, :861). These are the blobs of 1063ab4f, the authoring base, and of 65515b66: Save43, `LIVE_SAVE_VERSION = 43`. It writes its step as Save44 (1356 ref :389-390) | new `p15Phases.ts` :1-44; new `powerRankingArchive.ts` :45-313; `save.ts` :314-793; `tick.ts` :794-817; `types.ts` :818-859; `worldgen.ts` :860-881 |
| **1355 r3** | 608, ac34afdc… (1355-X:10; 1355-X2:8) | Stacked on the 1356 reference: its preimages are 1356's postimages (`save.ts` 97a85b6, `p15Phases.ts` a8f8145, `powerRankingArchive.ts` b81eec9, `tick.ts` 4166c4c, `types.ts` 23d6c8a, `worldgen.ts` b6bef44; 1355 ref :341, :361, :444, :523, :577, :590). "r2 sits on 1356-C's reference r2 (the landing order of 1355-F4)" (1355 ref :71-73). So Save43 with 1356's Save44 under it | `hollywoodTick.ts` :1-62; new `marketIntegration.ts` :63-339; `p15Phases.ts` :340-359; `powerRankingArchive.ts` :360-394; `reception.ts` :395-442; `save.ts` :443-521; `tick.ts` :522-575; `types.ts` :576-588; `worldgen.ts` :589-608 |
| **1359 r4** | 1,465, 66dc946d… (1359-C6:295; 1359-C7:101; 1359-X5:17) | Alone on Save43: preimages `campaignLegacy.ts` 4bd9e8e, `save.ts` 2f7006b, `tick.ts` fee7846, `tuning.ts` 521d06c, `types.ts` a56cd28, `worldgen.ts` 422f045 (1359 ref :2, :859, :1359, :1384, :1414, :1445). It writes its own Save44 (1359 ref :933-934) | `campaignLegacy.ts` :1-813 (16 hunks); new `p15Phases.ts` :814-857; `save.ts` :858-1357; `tick.ts` :1358-1382; `tuning.ts` :1383-1412; `types.ts` :1413-1443; `worldgen.ts` :1444-1465 |
| **1359 sibling r2** | 131, d703e29c… (1359-C6:296; 1359-C7:102) | Tests only | new `tests/p15c2-campaign-legacy-sibling.test.ts` |

### 2.2 How far each is from production, in the records' words

- **1356.** "REFERENCE ONLY (record 1356-C): scratch evidence that the RED leaves can pass. Not a production candidate;
  the single writer owns production" (1356 ref :8-9, :52-53). "Minimal: module, phase table, Save44 step, tick wrap,
  worldgen seed and one needed strip in `validatedLiveProfessionContext`" (1356-D:32). Two `src` type errors that "The
  production must not carry" (1356-X:58-60). "The reference has not been swept against the existing Save43 pins"
  (1356-C2:55). "The P15A.2 reference mints Save44 itself, so it retargets to Save45 on this base" (1356-X4:47-48).
- **1355 r3.** "REFERENCE ONLY … Not a production candidate; the single writer owns production (1355-A §8 item 5)"
  (1355 ref :70-71). "Minimal; by reading, the 52 non-fixture-pending leaves pass. All forty migrators carry the V44
  branch" (1355-D:30). Its root type gate has the same 35 errors as 1356's reference alone (1355-X:21, :48-49). Its
  allocator check scans two roots: "a merged step lists every sibling root here" (1355 ref :255-256).
- **1359 r4.** "P15C Wave 2 (REFERENCE ONLY, record 1359-C): the Legacy in the live game" (1359 ref :253). "The
  reference is not production. The production writer owns both" [the two `src` errors and the 33 test sites]
  (1359-X2:45-47). "The step number is allocated at execution (1355-F Amendment 4); the parent merges the P15 roots
  that share it" (1359 ref :1291-1292). "The P15C reference r4 mints Save44 itself. It must retarget to Save45 before
  any reference run on this base" (1359-X6:94).
- **All three** were last run on Save43 trees: 1356-X2 and 1356-X3, 1355-X2, and 1359-X5. None has run on Save44
  (HANDOFF:40).

### 2.3 Apply checks on HEAD

**Method.** `GIT_INDEX_FILE=<scratch>/idx git read-tree <commit>` for HEAD (6044ad4f, then again at a63c7de8) and for
65515b66, the Save43 base the dry runs call OLD (HANDOFF:32). Then `git apply --check --cached --reject -v <patch>`,
which reports every failing hunk and writes nothing. A stacked check runs on one concatenated file: under `--check`,
`git apply` carries an earlier patch's result for a path only within one input.

| Check | On 65515b66 (Save43) | On HEAD (Save44; the same at 6044ad4f and a63c7de8) |
|---|---|---|
| 1356 alone | applies | `save.ts` fails 47 of 49 hunks, all but the import hunk (:6) and the frozen-builder hunk (:6173); `types.ts` fails 2 of 2 (:2295, :2534); `p15Phases.ts`, `powerRankingArchive.ts`, `tick.ts` (2 of 2) and `worldgen.ts` (2 of 2) apply |
| 1355 r3 alone | cannot apply: `p15Phases.ts` and `powerRankingArchive.ts` do not exist | the same |
| 1356, then 1355 r3 | applies | 1356's 49 failures, plus r3's `save.ts` hunks at :10773, :10784 and :10796 and its `types.ts` hunk at :2555. r3's `hollywoodTick.ts` (4), `marketIntegration.ts`, `p15Phases.ts`, `powerRankingArchive.ts` (3), `reception.ts` (4), `tick.ts` (5) and `worldgen.ts` (2) apply, as do its `save.ts` hunks at :8 and :6184 |
| 1359 r4 alone | applies | the shape of 1356: `save.ts` 47 of 49 and `types.ts` 2 of 2 fail; `campaignLegacy.ts` (16), `p15Phases.ts`, `tick.ts` (2), `tuning.ts` and `worldgen.ts` (2) apply |
| 1356, 1355 r3, then 1359 r4 | 1356 and r3 apply. All 49 of r4's `save.ts` hunks fail, with `tick.ts` (:2, :1157), `types.ts` (:2295, :2534) and `worldgen.ts` (:84, :815). `campaignLegacy.ts` and `tuning.ts` apply. `p15Phases.ts` would be created twice; the check tests creation against the index only, so it does not report that | 108 hunks fail: `save.ts` 99 (47 + 3 + 49), `types.ts` 5, and r4's `tick.ts` 2 and `worldgen.ts` 2 |
| sibling r2 | not run | applies |

**Why HEAD refuses them.** Slice B owns every Save44 name the references use:
- `SaveFileV44` and `LiveSaveFile = SaveFileV44` (`src/core/save.ts:626-630`);
- "versions 1 through 44" (:5445) and `LIVE_SAVE_VERSION = 44` (:6567);
- `validateSaveV44`, `convertV43ToV44`, `convertV44ToV43` and `migrateToV44` (:10763-10799);
- `GameState = GameStateV44` and `GameStateV44 = GameStateV43` (`src/core/types.ts:2324`, :2568);
- the 39 legacy-migrator lines `if (save.saveVersion === 44) return migrateToVn(convertV44ToV43(…))` (for example
  :7421). The 1356 and 1359 references each add their own 39.

### 2.4 Conflicts

**With slice B.** The P15 step is Save45 over slice B's Save44. The records say only "retarget to Save45"
(1358-N:293-294; 1358-L:142; 1356-X4:47-48; 1359-X6:94). Moving the references' own pattern up one step gives:
- `GameStateV45 = GameStateV44 & { …the four P15 roots }` and `GameState = GameStateV45`, where each reference wrote
  `GameStateV44 = GameStateV43 & { … }` (1356 ref :853-856; 1355 ref :581-586; 1359 ref :1437-1440);
- `SaveFileV45`, `LiveSaveFile = SaveFileV45` and the `SaveFile` union (1356 ref :339-354);
- `validateSaveV45`: each root's presence, then `validateSaveV44` on the stripped state, which runs slice B's edge law
  (`src/core/save.ts:10763-10772`), then each root's validator (1356 ref :756-766; 1355 ref :483-494; 1359 ref
  :1318-1329);
- `convertV44ToV45`, which adds the empty roots at the save's own week (1356 ref :770-776; 1355 ref :496-502; 1359 ref
  :1333-1339); `convertV45ToV44`, which refuses a non-empty root by name, strips and validates V44 (1356 ref :780-788;
  1355 ref :506-521; 1359 ref :1343-1352);
- `migrateToV45`; a 45 line in `migrateToV44` in the shape of 1359 ref :1284 and HEAD's `save.ts:10753`; and
  `migrateToLive` returning `migrateToV45` (1356 ref :657-659; HEAD `save.ts:10176-10177`);
- 39 legacy-migrator lines for 45 above slice B's 44 lines; the dispatcher's 45 line and "1 through 45" (1356 ref
  :358-366); `LIVE_SAVE_VERSION = 45` and `makeSave` stamping V45 (1356 ref :385-403);
- the strip in `validatedLiveProfessionContext`, next to HEAD's `relationshipsAtV31` (1356 ref :687-694).

**Among the three references.**
1. **`p15Phases.ts` twice, and a removed export.** 1356 creates it (1356 ref :1-44), and r4 creates the same blob
   a8f8145 (1359 ref :814-857). r3 rewrites it and deletes `p15PhaseMatches` (1355 ref :348-356), under 1355-F5
   ruling 1, which binds 1356's and 1359's productions too (1355-F5:13-21). r4's `campaignLegacy.ts` still imports and
   calls `p15PhaseMatches` (1359 ref :26, :619). P15C's production drops its copy and rewrites that check the way r3
   rewrote the ranking check (1355 ref :378-383).
2. **Two V44 steps.** 1356 with r3 define one step with `powerRanking`, `p15Sequence` and `sharedMarket` (1356 ref
   :746-793; 1355 ref :473-521). r4 defines a second with `campaignLegacy` and `p15Sequence` (1359 ref :1290-1357).
   Save45 holds all four roots, with one strip, one presence check per root, and each root's own validator, migration
   and refusal (1355-F:40-42).
3. **The allocator check.** r3 moves the `next` check out of the archive validator (1355 ref :391-393) into
   `validateSharedMarketRoot` (1355 ref :490-492), over two roots (1355 ref :255-268). r4's `validateP15Sequence` counts
   only the Legacy: "In this reference the official Legacy is the only P15 row" (1359 ref :1301-1316). 1355-F2 item 4
   wants one rule across every root (1355-F2:43-45).
4. **The downgrade refusal.** r3 validates, then names every non-empty root in one refusal, market first (1355 ref
   :511-518). r4 refuses a frozen Legacy before validating (1359 ref :1341-1347). "Whichever production lands second
   fixes the refusal order for both, and its RED revision re-pins the other leaf" (1355-F4:26-28).
5. **Frozen builders.** 1356 adds one branch to `assertFrozenBuilderRetainsHollywood` (1356 ref :373-381), r3 widens it
   to `sharedMarket` (1355 ref :455-471), and r4 adds a second branch for `campaignLegacy` (1359 ref :913-928).
6. **The tick's last expression.** 1356 wraps it in `recordPowerRankingQuarter` (1356 ref :811-814), and r4 wraps the
   same expression in `freezeCampaignLegacyWeek` (1359 ref :1375-1379). 1355-F2 item 2 allocates the batch at step 2.5,
   then at the end of the tick the ranking record, the condition steps and the finale (1355-F2:26-30). So the freeze
   wraps the ranking record. r3's batch and its finalize append sit earlier (1355 ref :537-572).
7. **Fresh worlds and imports.** 1356 and r4 each seed `p15Sequence` and import `initialP15Sequence` in `worldgen.ts`
   (1356 ref :868, :876-879; 1359 ref :1452, :1460-1463) and in `save.ts` (1356 ref :323; 1359 ref :867).
8. **No shape conflict in the Legacy's sibling reads.** r4 reads `powerRanking.snapshots[]`,
   `corporateCondition.events[]` and `sharedMarket.assessments[]` by `p15DomainSequence` and `week` (1359 ref
   :742-750). 1356's record carries `id`, `p15DomainSequence` and `week` (1356 ref :847-851), and r3's row carries
   `releaseId`, `p15DomainSequence` and `week` (1355 ref :183-184).

**With `tests/helpers/p15-roots.ts`.** HEAD lists four keys (`tests/helpers/p15-roots.ts:10`). Each reference strips
fewer: `powerRanking` and `p15Sequence` (1356 ref :751-754), plus `sharedMarket` (1355 ref :476-480), or
`campaignLegacy` and `p15Sequence` (1359 ref :1296-1299). The landed REDs require the step to add only `P15_ROOTS` keys
and move nothing else (A:859-860, :895; L:832-835, :849). So the merged strip equals the four listed keys.
`corporateCondition` is in no list; P15B's RED adds it when it lands (1360-F:76).

### 2.5 Gaps all three references share

- **Two `src` type-error sites.** The 1356 and 1359 references fail the root type gate at the same two `src` sites,
  from adding top-level roots to `GameState` (1356-X:58-60; 1359-X2:45-47), and 1355 r3 inherits them (1355-X:48-49).
  At HEAD these are the `validateOpportunityWaiverLinks` cast at `src/core/save.ts:10487` and the historical control's
  state literal at `src/harness/roster-wall/historical-control.ts:33`. Production must leave `src` clean
  (1356-F3:33-34; 1355-F6:31). No record names the fix.
- **The public index.** `src/core/index.ts:1375-1378` and :1431 export slice B's V44 names (`validateSaveV44`,
  `convertV43ToV44`, `convertV44ToV43`, `migrateToV44`, `SaveFileV44`). No reference patch touches `index.ts` (their
  file lists, Part 2.1). Tests reach the step functions through that index (`tests/contracts/_v14Contract.ts:255`,
  :827-829; `tests/helpers/p14p3-fixtures.ts:8`, :85-94), so the Save45 names need the same exports.
- **No reference was swept** against the live-version pins (1356-C2:55; 1356-F3:33-34). The one Save45 sweep does it
  (Part 3).

---

## Part 3. The shared Save45 pin sweep

### 3.1 1358-N's method for Save44

- **Inputs.** A census from reading (1358-N:7-8), detectors over tests, `ui/src` test files, `bridge/testing` and
  `scripts` that skip links, fixtures and the RED's own files (`E/1358-stage/n/py/detect.py:11-15`), and two measured
  fallout runs: 1358-X5's type gate (1358-N:34-44) and 1358-M2's core run with no test edit, whose NEW rows were each a
  Save44 or projection-57 pin, a helper pin or an environment row (1358-N:45-53).
- **Classes.** S1 the live validator rename, kept on frozen-version envelopes (1358-N:67-81); S2 live literals and
  helper stamps (:82-97); S3 the N+1 sentinel and "1 through N" (:98-102); S4 live-to-older chains, imports and typed
  APIs (:103-115); S5 migration comparisons and hand lifts (:116-128); S6 and S7 edge and shape pins (:129-146); S8
  refusal messages and vacuous `.toThrow()` (:147-155); S9 first-guard masking (:156-191); S10 values and digests
  (:192-209); P1-P5 the projection classes (:210-260).
- **Counts.** 685 rows in 156 files, 625 certain and 60 to measure (1358-N:55-58). Seven units (H, G1 to G6) and two
  follow-ups (F1, F2) wrote it (1358-N:303-319, :343-344). The landing classified 762 rows (1358-C9:26-41).
- **Process.** Authors run nothing; each unit stages a tests-only patch and checks it with a temp-index
  `git apply --check --cached`; the parent runs the dry runs; an independent review samples at least 40 rows; the
  landing goes production, sweep, recorded GREEN, recorded broad gates (1358-N:330-357). In practice: revisions r1 to
  r4, dry runs X6, X7t, X8 and X9t, reviews D9 (REFINE) and D9b (CONFIRMED), and 154 test files at f458680b
  (1358-L:17, :69-74), five of them under `ui/src`.
- **Out of scope.** Production files, fixture payloads and tsconfig (1358-N:27-30); retained identities and
  environment rows (1358-N:262-279).

### 3.2 F10 and F11 do not move with the save version

- They moved at Save44 for projection 57: P4 is a projection class (1358-N:244-250), and the pin comment names
  "Relationship slice B projection57" after entries for projections 52 to 56 (`tests/bridge-contract-generator.test.ts:705-731`).
- They hash the C# declarations generated from the Bridge schema (`tests/bridge-contract-generator.test.ts:736-741`).
  The schema mentions the save version only in comments (`bridge/schema/bridge-schema.ts:246`, :265).
- No P15 Wave 2 production has a projection step (1355-A:220; 1356-A:17-18; 1359-A:278; 1357-A:227), and no reference
  patch touches `bridge/` or `generated/` (their file lists, Part 2.1).
- So F10 and F11 stay at 1dadf88f… (`tests/bridge-contract-generator.test.ts:732-733`) unless a production edits the
  Bridge schema. The bridge reads `LIVE_SAVE_VERSION` (`bridge/session.ts:139`; `bridge/runtime-checkpoint.ts:501-505`),
  as does the UI adapter (`ui/src/engine/adapter.ts:3795`).

### 3.3 Scope at HEAD for Save45

Measured by `git grep` on HEAD over `tests ':!tests/fixtures'`, with the P15 RED files left out, and by 1358-N's
detector shifted one era (V44 for V43, 44 and 45 for 43 and 44). Counts are lines, then files.

| Class | What moves | Lines | Files |
|---|---|---:|---:|
| S2 | `toBe(44)` stating the live version; 129 of 130 matches, 29 of them `LIVE_SAVE_VERSION).toBe(44)`. Plus stamps (`bridge-p14b2-checkpoint.test.ts:93`, `p14c3-queued-writing-proof.test.ts:28`), the guard `film-chronicle.test.ts:923` and the message pin `/canonical V44 save bytes exactly/` (`bridge-runtime-checkpoint.test.ts:439`) | 130 | 76 |
| S3 | the sentinel 45 becomes 46, and "1 through 44" becomes "1 through 45" (`src/core/save.ts:5445`) | 41 | 16 |
| S1 | `validateSaveV44` on live envelopes becomes `validateSaveV45`: 199 calls, 26 by-name lookups, 4 typed members and about 49 imports. V44 envelopes keep V44, as Save44 kept V43 (1358-N:76-79) | 311 | 80 |
| S4 | live-to-older chains: 26 live call sites become `convertV44ToV43(convertV45ToV44(live))`, with 14 imports and 4 typed APIs, the shape of Save44's (1358-N:103-110) | 71 | 24 |
| P5 | titles that name the live version | about 18 | about 15 |
| UI | `saveVersion).toBe(44)`: `ui/src/engine/d17-save-migration.test.ts:131`, :155; `ui/src/engine/film-chronicle-adapter.test.ts:289`; `ui/src/lot/snapshot/v14SetHolderBoundary.test.ts:46`; `ui/src/saves.test.tsx:126`; `ui/src/session.test.tsx:332`, :360, :387. The same five files as Save44's | 8 | 5 |

- **The certain union** is 547 lines in 131 `tests/` files, against Save44's 154 files (1358-L:17). A plain union of
  the V44 patterns over `tests/` gives 130 files, of which 129 were in the Save44 sweep; the extra file is slice B's own
  `tests/p14b10-save-v44.test.ts`.
- **Move on their own:** 56 expression lines in 37 files read `LIVE_SAVE_VERSION`.
- **Frozen, and they stay:** `validateSaveV43` (20 lines, 4 files); `convertV43ToV44` lifts (38 lines, 20 files);
  the V44 envelopes in `tests/p14b10-save-v44.test.ts`, whose live pins at :119 and :363-370 do move.

**The measure classes are larger than Save44's, because Save45 adds top-level roots** (Save44 added none:
`src/core/types.ts:2563-2568`).
- **S5:** 23 helper lines in 21 files compare whole states or envelopes. 20 gain the four P15 roots; 3 compare
  `.hollywood` only and stay (1358-N:126).
- **S9:** 41 downgrade-refusal pins in 22 files, 19 of them on slice B's romance or competitions guard. Once a live
  state with an industry records a ranking at a quarter week, the P15 refusal may fire first (A:181).
- **S8:** 50 lines in 16 files pin a frozen-chain refusal through `validateSaveV44(` on a live envelope; two bare
  `.toThrow()` leaves sit at `p14b1-t4-regressions.test.ts:86` and `p14c2rm-writer-continuation.test.ts:379`.
- **S10:** 414 64-hex literal lines in 82 files need 1358-N's digest screen again (1358-N:207-208), since the roots
  add bytes to every live save. C20's primary carries the live version and moves CHANGED without an edit
  (1358-F9:27-28; 1358-M3:4-5).
- **Type gate:** each reference carried 35 root errors on Save43: the two `src` sites and 33 test sites (1356-X:58-60;
  1355-X:48-49; 1359-X2:45-47). In 1356's run, 16 of the 35 name an older `GameState` that is "missing" the new roots
  (`S/1356-x/x-ref-tsc.txt`). P15A.1's pressure also moves route values (1355-A:157-159). So the fallout run and the
  type gate must be repeated on the merged candidate, as 1358-M2 and 1358-X5 were for Save44.

**Outside tests, the production itself moves:**
- `src/core/save.ts`: `LiveSaveFile` (:630) and the union; the dispatcher and "1 through 44" (:5443-5445);
  `LIVE_SAVE_VERSION` (:6567) and `makeSave` (:6571); `migrateToLive` (:10176-10177); the V44 step (:10763-10799); and
  a 45 line beside each of the 39 legacy 44 lines.
- `src/core/types.ts:2323-2324` and :2568.
- **`src/core/index.ts:1375-1378` and :1431 export the V44 names. No reference patch touches `index.ts`.** Tests load
  the core through that index (`tests/contracts/_v14Contract.ts:255`, :827-829), and two helpers assert the step
  functions there (`tests/helpers/p14p3-fixtures.ts:8`, :85-94; `tests/p14p4p5-opportunities.test.ts:8`, :89-96). The
  V45 names need the same exports.
- `src/harness/roster-wall/historical-control.ts`, the hand-built state (Part 2.5).
- `generated/` and `scripts/` hold no live-version pin.

### 3.4 What the sweep must not touch

- **The P15 RED files.** Each reads its step from the live constant: A:169, :176-179; T:77, :85-87;
  `tests/helpers/p15c2-legacy.ts:22`, :279-281. Their headers say a later step pins the constant in its own sweep
  (A:21-25; L:44-47). At a shared Save45 no P15 RED line moves. No P15 RED file had a Save44 census row either
  (1358-N:295-296).
- **`BASE_LIVE_SAVE_VERSION = 44`** (L:151) is a fact of the base, asserted below STEP (L:820). It stays. 1358-F9:30
  moved its predecessor at the P15C rebase, outside the sweep.
- **If a root lands at a later step,** that step's sweep pins the earlier roots' step constants to 45.

### 3.5 The capture leaves that flip at Save45

| RED | Leaf | Today | At Save45 |
|---|---|---|---|
| 1356 | `rank-root-migration-genuine-below-step-capture` (A:867-898) | `expect(manifest.saveVersion).toBe(ARCHIVE_STEP - 1)` (A:879) fails 44 against 43 (1360-L:89-91) | 44 equals 45 − 1; the leaf then runs the step's converter and the `stripP15` equality (A:891-896) |
| 1355 | the two `market-old-save` capture leaves (T:738, :748), through `belowStepCaptures()` (T:716-735) | the sha pin passes (T:715, :726); T:728 fails 44 against 43 (1360-L:64) | both version checks pass |
| 1359 | C2 `legacy-migration-empty-root` (L:824), C3 (L:854), C4 (L:866) | the named RED at `tests/helpers/p15c2-legacy.ts:249-251` (1360-L:66-68) | `tests/helpers/p15c2-legacy.ts:252` passes; r8 cls :330, :362 and :378 read "then pass" |

- C2 also requires every key the step adds to be in `P15_ROOTS` (L:833-835), which lists four
  (`tests/helpers/p15-roots.ts:10`).
- C3b, in the unlanded sibling test, reads route L too (1360-F3:14-20).
- 1360-D:199-209 tabulates each reader's STEP − 1 checks on the MANIFEST and on every imported capture.

---

## Part 4. Dependencies and ordering

### 4.1 1355-F2's domain sequence

1355-F2 binds every P15 Wave 2 root (1355-F2:1, :6-8).
1. **One allocator,** `p15Sequence: {version: 1, next}`, lands in the save step of the first P15 root to reach
   production and starts at 1 (1355-F2:24-25). At Save45 that is the shared step (1355-F2:51-53).
2. **Every P15 native row stores `p15DomainSequence`** from `next++`. Within a tick: the market batch at step 2.5, in
   `(week, releaseId)` order; then, at the end of the tick, the ranking record, the condition steps in ascending studio
   id, and the finale (1355-F2:26-30).
3. **Every row stores its phase triple** from the version-1 table in `src/core/p15Phases.ts`: `p15a1.marketBatch`,
   `p15a2.rankingRecord`, `p15b.condition`, `p15c.finale`, ordinals ascending (1355-F2:31-42). 1355-F5 ruling 1 fixes the
   lookup: `P15_PHASE_TABLES[row.phaseOrderVersion]` through the export, for every root's validator (1355-F5:13-21).
4. **Validation across roots.** Every sequence is distinct across all roots, each root's rows ascend, `next` is one
   more than the largest, each triple matches its version's table, and a duplicate or a value at or above `next`
   refuses by name (1355-F2:43-45).
5. **Identity.** A ranking record is `power-ranking-<p15DomainSequence>`; an assessment keeps `releaseId`; P15B
   decides its own (1355-F2:46-50).
6. **Migration.** The creating step starts the allocator at 1 and back-fills nothing; a downgrade refuses a non-empty
   root by name (1355-F2:51-53).
7. **P15C.** A P15 domain's `highWatermark` is its largest `p15DomainSequence` at the boundary, supplied by the Wave 2
   adapter (1355-F2:54-56).

### 4.2 What forces an order

1. **Slice 2a before P15A.1.** "The writer queue lands P15A.2 slice 2a (the Power Ranking archive, `p15Sequence` and
   `p15Phases.ts`) before P15A.1 Wave 2" (1355-F4:8-10). R1 passes at GREEN by that order (1355-F4:19-20), and the
   second production fixes the refusal order (1355-F4:26-28). r3 is written on the 1356 reference (1355 ref :71-73).
2. **Slice 2a supplies `studioWeeklyFixedCost` for P15B.** "P15A.2 slice 2a lands `studioWeeklyFixedCost` first, or F3
   applies" (1357-A:332). P15B's adapter imports it from `src/core/powerRankingArchive.ts` and defines no second
   quantity (1357-A:69-70). Under F3, if the order flips, the P15B writer creates the module with only that function
   (1357-A:77-78). The one export is 1356-A:67-70; the reference has it at 1356 ref :97-109.
3. **The allocator and the phase table come with the first root,** slice 2a (1355-F2:24-25; 1359-A:273). P15C's freeze
   stamps from both (1359 ref :552-559).
4. **The tick order** is the batch, then the ranking record, then the condition steps, then the finale (1355-F2:26-30).
   It decides how the three tick hunks compose (Part 2.4, item 6).
5. **P15C with or after its siblings.** "P15C Wave 2 lands with or after them and needs none for correctness … if it
   lands first, each sibling's production owes its §3 branch and A7 case" (1359-A:275-276). The forged-root leaves
   rest on that production order (1360-D:162-168; 1360-F2:55-56).
6. **G2 before commit (c) lands.** "(c) lands only on Proceed or Flag" (1355-A:267). G2 needs P15A.1's frozen (c),
   which sits on slice 2a's production (1355-F4:8-10).
7. **G-P after P15A.1's production exists, and before P15C's lands.** The gating run uses a tree carrying P15A.1 Wave 2
   when that lands first or together (1353-F7:64-65), after the probe's sibling branch is written and reviewed
   (1353-F7:66-68). G-P gates P15C's production (1359-F5:25-26).
8. **The bound starts with slice 2a.** Its review and its dry run on the landed REDs start the clock for G2 and G-P
   (1360-F2:38-40).
9. **One sweep after all three are fixed.** One sweep serves the shared step (1360-F:19-20, :25-26). 1356-A:240 runs
   the live-version sweep after the bump.
10. **Nothing that changes `src/` lands before Save45** (1360-F3:42-45). The mints that had to precede the first
    production are done (1360-L:19, :23).
11. **P15C before 2040** in any campaign (1359-F:50-51).

### 4.3 The chain the records imply

**The slice B precedent** (1358-L), the last production that moved the live version:
- production handback, implementation review, revision and delta check (1358-L:3-5; HANDOFF:29);
- a production dry run on the landed RED (1358-X5; 1358-L:63-64);
- a fallout measurement of the version bump (1358-M2; 1358-L:65-67);
- the sweep plan, its author units, rulings, dry runs and reviews (1358-L:69-74);
- landing commits applied from staged patches and checked blob for blob (1358-L:16-17, :80-84);
- a recorded producer for any pinned declaration value (1358-L:18-20, :91-96);
- the recorded GREEN, the recorded broad core and UI gates, and the type gates and generator checks at the landed HEAD
  (1358-L:21-24);
- an independent landing review (1358-L:118-129).

**What each charter adds at closure.**
- Slice 2a: the live-version sweep after the bump (1356-A:240).
- P15A.1: recorded GREEN, implementation review, version sweep, recorded broad gates, and the integrated 6,240-week
  normal and hostile harness (1355-A:268-269).
- P15C: recorded GREEN, implementation review, live-version sweep, broad gates, Wave R guards and G-L (1359-A:282).

**A sequence consistent with the rulings.** The steps come from the records cited; where a step is open, Part 5
names the question.
1. The parent rules on this plan as 1361-F (HANDOFF:45).
2. **Slice 2a.** The writer authors it in scratch on HEAD as the Save45 step with `powerRanking` and `p15Sequence`
   (1360-F:25-26; HANDOFF:46), clean on `src` (1356-F3:33-34). Its review and its dry run on the landed REDs follow,
   which starts the bound (1360-F2:38-40).
3. **P15A.1.** Commits (a), (b) and (c) on slice 2a's candidate (1355-A:265-266), which add `sharedMarket` to the same
   step (1355-C2:39). Freeze (c).
4. **G2** compares the frozen (c) with the control on an archive of e4be3e5c, over the same routes (1355-A:181-185;
   1360-F2:67-68). A G2 probe has to be written first (Part 5, Q4).
5. **G-P.** The probe gains its sibling branch, written by an agent and checked by a reviewer (1353-F7:66-68), and runs
   on the scratch tree that carries slice 2a and P15A.1 (1353-F7:64-65; 1353-F6:76-77).
6. **P15C.** Commits (a), (b) and (c) on that candidate (1359-A:280-281), which add `campaignLegacy` to the same step
   and resolve the conflicts of Part 2.4.
7. **Per production,** its review and its dry run on the landed REDs (1360-F2:38-39; HANDOFF:46).
8. **The Save45 sweep:** a fallout measurement, then a plan by 1358-N's method, units, dry runs and reviews (Part 3).
9. **The landing.** The productions and the sweep land together (1360-F:25-26), then the recorded GREEN, the recorded
   broad gates, and the type gates and generator checks (1358-L:21-24). The broad gates start from what the RED
   landing left them: six new core files and the RED leaves as NEW identities (1360-L:80-93). The 1356 harness runs as
   its own run (1360-F:70-73).
10. **The closures** of Part 4.3, including G-L (1359-A:265-267).

---

## Part 5. Open questions for the parent

Each question gives the records' strongest answer, or says that none exists.

**Q1. How do three productions' commits share one save step?**
- **The records.** P15A.1 and P15C each land in three commits (1355-A:265-266; 1359-A:280-281). Each root keeps its own
  validator, migration and downgrade refusal (1355-F:41-42). 1355's reference already "merges into 1356-C's Save44: one
  step strips and creates all three roots" (1355-C2:39). Slice B landed one commit per production step, then the sweep
  (1358-L:16-17).
- **Strongest answer.** Slice 2a's commit creates the Save45 step. Each later commit adds its root to the same step, in
  1355-F4's order, and all of them land in one push with the sweep. No ruling says so, and no record says whether the
  intermediate commits must pass the type gates.

**Q2. How do the references retarget?**
- **The records** say "retarget to Save45" and nothing more (1358-N:293-294; 1356-X4:47-48; 1359-X6:94).
- **Strongest answer.** By hand, not by patch. On HEAD, 1356 and 1359 r4 each fail 49 hunks and the 1356 and r3 stack
  fails 53, all in `save.ts` and `types.ts` (Part 2.3). Every other file applies on HEAD when each patch goes alone.
  Stacked after its siblings, r4's `tick.ts`, `worldgen.ts` and `p15Phases.ts` collide with 1356's (Part 2.4, items 1,
  6 and 7). Part 2.4 lists what the merged step must hold.

**Q3. Which way does the merged downgrade refuse, and in what order?**
- **The records.** "Whichever production lands second fixes the refusal order for both" (1355-F4:26-28), and P15A.1 is
  second (1360-D:219-220). r3 names every non-empty root in one refusal (1355 ref :511-518). r4 refuses a frozen Legacy
  before validating (1359 ref :1341-1347). Each RED's regex needs only its own root's words (A:181; T:90;
  `tests/helpers/p15c2-legacy.ts:283`).
- **Strongest answer.** r3's single list, extended with the Legacy, satisfies all three. No record orders a third
  root.

**Q4. What runs G2, and on which candidate?**
- **The records.** G2 compares "the frozen step-(c) candidate (§8) against the control at the RED commit, same routes"
  (1355-A:181-185). The control is an archive of e4be3e5c (1360-F2:67-68). No G2 probe exists: the G1 probe "computes
  none of the G2 rows" (`E/1355-stage/g1/1355-G1-notes.md:83`). Build seed-b as `p13aGeneratedStudio('seed-b')`
  (1355-X4:20-21).
- **Strongest answer.** The candidate is P15A.1's (c) on slice 2a's production, since the writer's order puts P15C
  later (1355-F4:8-10; 1360-F:25-26). The probe is new work, with G1's probe as its model. Agents author and review;
  only the parent runs heavy tests (HANDOFF:48).

**Q5. If G2 fails, does P15A.1's root still take Save45?**
- **The records.** 1360-D:230-231: "G2 gates only commit (c) (1355-A:265-267), so a G2 failure need not move P15A.1's
  root off Save45." The rulings say only that the parent rules again, and that slice 2a may land alone (1360-F:29-31;
  1360-F2:38-40).
- **Strongest answer.** Commits (a) and (b) could share Save45 without (c), and the two capture leaves would then hold.
  No ruling has adopted this.

**Q6. What tree does the gating G-P use?**
- **The records.** "The tree Wave 2 production lands on … carries slice B's Save44 production, and P15A.1 Wave 2 when
  it lands first or together" (1353-F7:64-65), and again on "any tree that carries P15A.1 Wave 2 production or a
  1357-Q1 change" (1353-F6:76-77). Nothing that changes `src` lands before Save45 (1360-F3:42-45).
- **Strongest answer.** A scratch tree: HEAD plus the authored slice 2a and P15A.1 productions, with the v2 values put
  in as 1353-X4 put them (1353-X4:12-19). Before that run, the probe's sibling branch is written and reviewed
  (1353-F7:66-68), including the law's record-id rule (probe :48-49).

**Q7. Where does the one allocator check live?**
- **The records.** 1355-F2 item 4 wants one rule over every root (1355-F2:43-45). r3 holds it in the market validator
  over two roots (1355 ref :255-268, :490-492). r4 has its own Legacy-only check (1359 ref :1301-1316).
- **Strongest answer.** One check over all four roots, run once in the step validator. Where it lives is the writer's
  choice.

**Q8. What clears the two `src` type-error sites?**
- **The records.** The production writer must leave `src` clean (1356-F3:33-34; 1355-F6:31; 1359-X2:46-47). The sites
  are `src/core/save.ts:10487` and `src/harness/roster-wall/historical-control.ts:33` at HEAD (Part 2.5).
- **Strongest answer.** None in the records. The writer's review checks the fix.

**Q9. What happens to `corporateCondition` while P15B is absent?**
- **The records.** A3, A5, A7, A8 and B4 forge it, and r4 reads it untyped (L:53-57). If P15C landed first, those cases
  would move to the sibling's patch (1359-A:275-276). 1360-D:162-168 notes that P15C's production precedes P15B's
  unless 1357-Q1 resolves in time.
- **Strongest answer.** Keep the untyped read in P15C's production. P15B re-pins those leaves at its own landing.

**Q10. When does the sibling patch r2 land?**
- **The records.** It "lands with the sibling root they need" (1359-F2:41). Test-only commits may land before Save45
  (1360-F3:42-44). It applies at HEAD (Part 2.3), but it has no classification and no run (Part 1.3).
- **Strongest answer.** With the Save45 landing, since its leaves need the roots and a shared step. It first needs a
  classification and a dry run. C3b also joins P15C's fallback (1360-F3:14-22).

**Q11. How long does the merged tick take in the 1356 harness?**
- **The records.** The ceiling is 300,000 ms and the reference measured 57,710 to 65,404 ms (H:42; 1356-X2:13;
  1356-X3:33). The merged tick adds P15A.1's batch and P15C's freeze, and nobody has measured it.
- **Strongest answer.** Run H alone on the merged candidate before the sweep (1356-F2:40; 1360-F:70-73).

**Q12. P15A.1's integrated 6,240-week normal and hostile harness.**
- **The records.** 1355-A:268-269 lists it at closure, with no file and no budget.
- **Strongest answer.** None. The parent names its file and budget before closure.

**Q13. One recorded GREEN, or one per production?**
- **The records.** Each charter's closure lists a recorded GREEN (1355-A:268; 1359-A:282). Slice B ran one recorded
  GREEN over its six RED files (1358-L:21, :42-45). The RED landing ran three recorded REDs, one per RED (1360-L:52-56).
- **Strongest answer.** None ruled. One GREEN per RED's file set, at the landed HEAD, keeps each comparable with its
  recorded RED.

**Q14. Can P15B join Save45?**
- **The records.** Only if its production is ready with the three (1360-F:27-28). No P15B RED is staged, and Wave 2
  waits at the probe gate until the Owner answers 1357-Q1 (1357-F2:58-60, :78-92). The parent recommends (a), whose
  first part is a shelving-law fix (1357-F3:40-50). An answer of (a) makes production work that moves the Save44
  writer if it lands first (1360-F2:27-33; 1360-F3:23-27).
- **What P15B would add.** The root `corporateCondition` with its own allocators (1357-A:94-102); a step that wraps
  the tick after the ranking record and before the P15C freeze (1357-A:167-171); zero loan movements in every rival
  period at migration, and a `studioLoans` era flag in the frozen chain (1357-A:155-163). It imports slice 2a's
  `studioWeeklyFixedCost` (1357-A:69-70). Its re-probe runs on the tree it integrates into, with P15A.1's pressure if
  that lands first (1357-A:259-260).
- **Strongest answer.** Not in time on the present record. If it joins, its RED must add `corporateCondition` to
  `P15_ROOTS` first (1360-F:76), and its loan movements re-pin 1356's migration leaves (1360-D:215-216; A:39-41). The
  bound covers G2 and G-P, not P15B (1360-F2:38-40).

**Q15. The ref resolver of 1359-A:212.**
- **The records.** Wave 2 exports it for Wave 3 (1359-A:212). No leaf tests it, and r4 keeps it as a closure (1359 ref
  :752-761).
- **Strongest answer.** Production exports it. Whether a leaf should cover it is open.

**Q16. Low items carried to the closure.**
- 1356's optional capture sha pin stays unadopted (1360-F:45-46; 1360-L:105-106).
- "Save43" wording in classifications and messages stands as history (1360-F:77-82; 1360-R:422-435).
- K3 still reads "Migrated Save43" in the charter; the migrated route is now Save44 (1355-A:167; 1360-R:434).
- The `recordedFromWeek` cost of the wait cannot be measured without Owner saves; the bound limits it
  (1360-F2:34-40).
