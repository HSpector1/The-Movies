# P15 Wave 2 RED landing protocol on the Save44 base

How to land the three P15 Wave 2 REDs, compiled read-only from the project records on 2026-10-02 at 11:40 CDT (clock
read with `date`).
- **Sources:** the E records, the staged patches, producers and classifications, `HANDOFF.md` and
  `CONTINUATION-STATE.md`.
- **What ran:** no test, node, tsc or vitest. Git use was `rev-parse`, `show`, `ls-files` and `log --oneline` only, and
  nothing under `tests/fixtures` was read.

**HEAD.** The brief named 1706d844. During this compilation the parent committed cb49fd02, which changes docs only. It
adds:
- the Save44 dry-run records 1355-X5, 1356-X4 and 1359-X6, with their outputs;
- P15C RED r8 at `E/1359-stage/1359-p15c-wave2-red-r8.patch`.

This protocol reads cb49fd02 and uses those three records.

**Notation.**
- E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, and S is `/Users/zacheryspector/studio-scratch`.
- `1355-F4:8-10` means lines 8-10 of the E record whose name starts `1355-F4`.
- "patch :N" is line N of the staged patch file, and "P :N" is line N of the producer.
- A classification line `:N` is a line of the classification JSON.

| RED | Staged patch (sha256 checked) | Producer (sha256 checked) | Classification |
|---|---|---|---|
| **1356**, P15A.2 slice 2a, the Power Ranking archive, RED r4 | `E/1356-stage/1356-p15a2-wave2-red-r4.patch` (32397525…) | none | `E/1356-stage/1356-p15a2-wave2-red-r4-classification.json` (ad40421c…), 72 rows |
| **1355**, P15A.1 Wave 2, the shared market, RED r4 | `E/1355-stage/1355-p15a1-wave2-red-r4.patch` (2092c198…) | `E/1355-stage/1355-P-p15a1-market-producer-r3.ts` (5007e231…) | `E/1355-stage/1355-p15a1-wave2-red-r4-classification.json` (d11a0fb3…), 59 rows |
| **1359**, P15C Wave 2, the campaign Legacy, RED r8 | `E/1359-stage/1359-p15c-wave2-red-r8.patch` (2a5df977…, byte-equal to `S/p15-save44/1359-p15c-wave2-red-r8.patch`) | `E/1359-stage/1359-P-p15c2-route-l-producer-r4.ts` (78c1d105…) | r7's `E/1359-stage/1359-p15c-wave2-red-r7-classification.json` (9ec7b936…), 116 rows, kept for r8 (1359-X6:35) |

---

## Part 1. The protocol

### Before step 1

A. **Settle the save-step allocation that the mints assume (Open question 1).**
   - A capture minted now is Save44, which serves only a P15 step at Save45.
   - HANDOFF:47 schedules P15A.2 slice 2a production alone at Save45.
   - If P15C does not share that step, the mint in step 8 runs at the wrong writer by the producer's own rule (1359-P r4
     :18-20).
B. **Declare the post-mint messages before the recorded runs (Open questions 4 and 5).** No dry run has yet placed a
   minted capture under these REDs. Slice B measured that case before its RED commit (1358-F4:75-76; 1358-X4:1-30).
C. **Standing rules for every recorded run** (HANDOFF:43, :63-66; 1358-M3:15-24):
   - the heavy lane with one heavy process, and Node v20.20.2 first on PATH;
   - free disk of at least 5 GiB;
   - a stem that matches `^[0-9]{3,4}[a-z0-9-]*$`, with none of its five output names already present;
   - clean `src`, `tests`, `ui`, `bridge`, `generated` and `scripts`, and HEAD equal to the fetched remote head
     (1358-M3:17-18). Push each commit before its run. Both producers also demand "the published execution HEAD"
     (1355-P r3 :59; 1359-P r4 :57);
   - no commit and no `git add` during a recorded run or its postflight.

### Steps

1. **Land the P15A.2 slice 2a RED (1356 r4).**
   - Apply the patch with `git apply --index` (the 1358-L:13 method) and commit. It touches tests only.
   - It creates `tests/helpers/p15-roots.ts` with `P15_ROOTS = ['p15Sequence', 'powerRanking']` (patch :16;
     1356-X4:43-44), and the archive, isolation and harness test files.
   - Push.
2. **Recorded RED for 1356, before any mint.** 1356 has no producer of its own (1356-X4:45).
   - **Run:** `vitest run --project core` over `tests/p15a2-power-ranking-archive.test.ts`,
     `tests/p15a2-power-ranking-archive-isolation.test.ts` and `tests/p15a2-power-ranking-archive-harness.test.ts`.
   - **Expected,** as 1356-X4:17-22 measured on Save44: 70 failed and 2 passed of 72, and four TS2307 errors in the root
     type gate.
   - **The genuine-capture leaf** fails with `RED: no genuine capture below the P15 save step at
     tests/fixtures/p15/genuine-below-p15-save-step/ (1356-A §9: mint it at the last Save43 writer)` (1356-X4:32-35).
     That is the message its classification row declares (classification :165-167).
   - **Then** commit the five outputs after the postflight.
   - Open question 2 covers running this RED after the 1355 mint instead.
3. **Land the P15A.1 RED (1355 r4) and merge `P15_ROOTS`.**
   - **Apply** the patch without its `tests/helpers/p15-roots.ts` hunk. That hunk creates the file, and step 1 already
     created it.
   - **Edit** file line 10 (patch :16) to `['p15Sequence', 'powerRanking', 'sharedMarket']` (1355-C2:6; 1355-X5:64-65).
   - **Copy producer r3** to the E root as `E/1355-P-p15a1-market-producer.ts`, the name the run commands use (1355-C:32;
     1355-X3:17-19). It imports five levels up, so it works only there (P :20-21, :34-44).
   - **Commit** the tests and the producer together, as slice B's RED commit carried its producer (1358-F4:38;
     1358-L:13), and push.
4. **Recorded mint 1355-P, mint mode, one execution.**
   - **Command,** at the step 3 commit: `P15A1_PRODUCER_HEAD=<that commit> P15A1_CAPTURE_MODE=mint
     node_modules/.bin/vite-node E/1355-P-p15a1-market-producer.ts`. Use vite-node, not the `npx tsx` the header names
     (Open question 7).
   - **It writes** `tests/fixtures/p15/p15a1-market-pins/` and the shared `tests/fixtures/p15/genuine-below-p15-save-step/`
     (P :23-27).
   - **Expected,** from the Save44 dry run (1355-X5:50-57):
     - K1 at week 21, with `committed` null;
     - K2 at week 12;
     - M0A over 40 weeks;
     - the capture `fresh-market-week-30`;
     - `saveVersion` 44.
   - **On a failure** the producer writes nothing (P :8-9), and the records allow no retry (Open question 8).
5. **Fixture commit, and the 1355 sha pin.**
   - **Commit** both fixture directories with the mint's five recorded outputs, as 4ad8e0f7 did for slice B (1358-L:14).
   - **Pin the sha.** Set `CAPTURE_MANIFEST_SHA256` (patch :1529) in `tests/p15a1-market-integration.test.ts` to the
     sha256 of the minted `genuine-below-p15-save-step/MANIFEST.json`. 1355-F4:42-43 orders the pin "after minting", but
     the records name no commit for it (Open question 3).
   - **Push.**
6. **Recorded RED for 1355.**
   - **Files:** `tests/p15a1-market-integration.test.ts`, `tests/p15a1-market-integration-phases.test.ts` and
     `tests/p15a1-market-integration-atomicity.test.ts`.
   - **Expected, by reading only:**
     - 51 failed and 8 passed of 59 (classification :42-49);
     - the four pin controls now pass. Their rows (:64, :248, :278, :590) read "after minting it passes on unchanged
       production";
     - both capture leaves fail at `expect(manifest.saveVersion).toBe(MARKET_STEP - 1)` (patch :1542), 44 against 43
       (classification :547, :556);
     - six TS2307 errors in the root type gate: 1356's four (1356-X4:19-22) and 1355's two (1355-X5:21-23).
7. **Land the P15C RED (1359 r8) and merge `P15_ROOTS` again.**
   - **Apply** r8 without its `p15-roots.ts` hunk.
   - **Edit** line 10 to `['p15Sequence', 'powerRanking', 'sharedMarket', 'campaignLegacy']`.
   - **Copy producer r4** to the E root as `E/1359-P-p15c2-route-l-producer.ts` (1359-X3:17-19; P :24-25).
   - **Leave** `1359-p15c-wave2-sibling-r2.patch` staged. It "lands with the sibling root they need" (1359-F2:41).
   - **Commit and push.**
8. **Recorded mint 1359-P, one execution, only if Open question 1 allows it now.**
   - **Command:** `P15C2_PRODUCER_HEAD=<step 7 commit> node_modules/.bin/vite-node E/1359-P-p15c2-route-l-producer.ts`.
     It takes no mode variable.
   - **It writes** `tests/fixtures/p15/p15c2-route-l-captures/` (P :27-30).
   - **Expected** (1359-X6:75-86): weeks 6239 and 6240, `saveVersion` 44.
9. **Fixture commit** with the five recorded outputs. Push.
10. **Recorded RED for 1359.**
    - **Files:** `tests/p15c2-campaign-legacy-integration.test.ts`, `tests/p15c-wave-r-retention.test.ts` and
      `tests/p15c1-campaign-legacy.test.ts` (1359-X5:21-22).
    - **Expected, by reading:** 40 failed and 76 passed of 116, the totals 1359-X6:57-60 measured. After the mint the
      three leaves C2-C4 keep failing, but their first message changes.
      - **Before the mint:** the FIXTURE PENDING text that the r7 classification holds as `firstMessageAtRed` (:329,
        :361, :377).
      - **After the mint:** `RED: the route L captures are Save44, the live version: the Legacy's save step has not
        landed above them (1359-A §5.2)` (patch :296-298). Revise those rows before the run (Open question 5).
    - **Type gate:** six errors, since 1359 adds none (1359-X6:60).
11. **Then P15A.2 slice 2a production at Save45** (HANDOFF:47).
    - The 1355 mint must come first: the Save44 writer has to write the shared capture, "minted before that writer moves"
      (1355-F:34-36; 1355-P r3 :3).

---

## Part 2. Evidence, by question

### Q1. Landing order

**What 1355-F4 says.** Under the heading "Landing order this RED assumes" (1355-F4:6), it reads: "The writer queue lands
P15A.2 slice 2a (the Power Ranking archive, `p15Sequence` and `p15Phases.ts`) before P15A.1 Wave 2. At P15A.1's GREEN,
the ranking root therefore exists. ... If the order changes, the leaves marked 're-pinned at a sibling landing' are
re-pinned at that landing." (1355-F4:8-10).

**What it governs.** It orders productions.
- **"The writer queue"** is the single production writer's queue. HANDOFF:43 lists "one production writer", and
  1356-A:237 says the RED goes to a test author "while the single writer works its queue".
- **Its stated consequence** is a fact at P15A.1's GREEN.
- **Its RED-side effects** are re-pin declarations. R1's cross-root leaf "by the landing order ... passes at this wave's
  GREEN" (:19-20), and "whichever production lands second fixes the refusal order for both" (:26-28).
- **RED commits:** it says nothing about their order.

**The RED order in practice.**
- **The parent's records extend 1355-F4 to the RED landings:**
  - "The RED can land on the Save44 base after P15A.2 slice 2a's RED (1355-F4)" (1355-X5:64);
  - "This RED lands first among the three (1355-F4)" (1356-X4:43);
  - "P15 RED landings on the Save44 base, in 1355-F4's order" (HANDOFF:46).
- **The 1356 records assume they land first.** The helper holds two keys "today", and "Each later P15 RED adds its root
  key to `P15_ROOTS` ... at its landing" (1356-F2:18-20; 1356-C2:50).
- **The 1355 and 1359 records accept either order for the helper.** Both say "Whichever ... lands second merges the
  list" (1355-C2:6; 1359-F2:28).

**Where P15C falls.** No record orders the P15C RED against the other two REDs.
- 1359-A §10 item 3 (1359-A:273-276) and the r8 header (patch :847-851) order productions: "P15C lands with or after its
  siblings".
- If P15C landed first, its five forged-root leaves would move to the siblings' patches (patch :848-851). Landing third
  avoids that.
- 1359-F4:53 places the P15C recorded RED "in the queue order of HANDOFF.md".

**Constraints the records do set.**
- **The 1355 mint follows the 1355 RED commit,** because the producer imports that RED's helpers (P :38-42). 1355-C:32
  says "Run once in E at the last writer below the step, RED patch landed".
- **The shared capture precedes the first P15 production.**
  - 1355-F:34-36: "minted before that writer moves".
  - 1355-P r3 :3: "before any P15 production lands".
  - 1356-A:239-240 and 1356-F2:52 say the same.
- **The 1359 mint has fixed points on both sides.** It follows the 1359 RED commit and precedes P15C's production
  (1359-P r4 :21-22). It also follows slice B's Save44 production (1359-F6:28-30; 1353-F7:84).
- **Each mint precedes its own recorded RED:**
  - 1359-C2:41 and :60;
  - 1359-D4:167;
  - 1359-F5:25-26;
  - patch :827-829;
  - 1355-A:264 for the 1355 pins.

**Earlier orders, now superseded.**
- 1350-A:129-131 put P15A.2 Wave 2 after P15A.1 Wave 2, at an expected Save46.
- 1353-A:276 had P15A.1 land first.
- 1353-W0:173-175 allocated Save45 to P15A.1 and Save46 to P15A.2.

1355-F4 reversed that order for productions.

### Q2. `tests/helpers/p15-roots.ts`

**The rule.** 1356-F2 R3 (1356-F2:18-20) reads: "A new helper `tests/helpers/p15-roots.ts` exports `P15_ROOTS` (today
`['p15Sequence', 'powerRanking']`) and `stripP15(state)` ... Each later P15 RED adds its root key to `P15_ROOTS` in its
own patch, at its landing." These records restate it:
- 1356-C2:10 and :50;
- 1355-C:44: "`sharedMarket` joins `P15_ROOTS` (1356-F2 R3) at landing, since the helper is absent at base";
- 1355-C2:6: "same path and contents, plus `sharedMarket` in `P15_ROOTS`. Whichever record lands second merges the list";
- 1359-F2 item 3 (:27-29): "same path and contents as 1356-C r2's, and add `campaignLegacy` to `P15_ROOTS` in this
  patch. Whichever lands second merges the list";
- 1359-C2:61;
- the 1355 header (patch :833-835) and the 1359 header (patch :843-845, :853);
- 1355-X5:64-65: "a one-line edit that adds `'sharedMarket'`";
- HANDOFF:46: "the second and third merge `P15_ROOTS`".

**The three versions of the file.**
- **Each patch adds it as a new file.** All three hunks match except file line 10 (patch :16): 1356 has
  `['p15Sequence', 'powerRanking']`, 1355 adds `'sharedMarket'`, and 1359 adds `'campaignLegacy'`. I checked this by
  diff. 1355-D2:19 found the same for 1355.
- **The comments name two roots in all three versions.** Lines 3-5 and 9 still describe two roots "today", and no record
  requires a change.

**What the second and third RED commits do.**
- **The 1355 commit (second).** It cannot apply its new-file hunk over the existing file, so it applies the rest of its
  patch and edits line 10 to add `'sharedMarket'`.
- **The 1359 commit (third).** It does the same to add `'campaignLegacy'`.
- **The final list** is `['p15Sequence', 'powerRanking', 'sharedMarket', 'campaignLegacy']`.
- **Key order.** The records do not fix it, and by reading no leaf depends on it. Every use is an `includes`, a `filter`,
  a `Math.max`, a count, a `toContain`, or a walk compared within one run. The uses:
  - 1356 patch :221, :227-229, :1102-1106 and :1320;
  - 1355 patch :125, :1284, :1419, :1445, :1474-1489 and :1633;
  - 1359 patch :234-238 and :1629-1643.

**Do leaves change when a sibling RED lands?** By reading, no.
- **Why not:** before any production, no state carries `sharedMarket` or `campaignLegacy`. `stripP15` and `p15Rows`
  therefore return the same results with the longer list.
- **Where the leaves stop first:** each RED leaf that reads the list fails on its own missing module or root before it
  gets that far. 1356's RED 10 fails at `archiveOf` (patch :247). 1355's cross-root leaf throws the missing-root error
  "read before the sibling scan" (classification :527-529).
- **Unmeasured:** the dry runs applied each RED alone, with its own list (1359-X6:49-51), so the merged list has not run.

**The declared re-pins.** Each one fires when a sibling's production or save step lands. None fires when a RED lands.
- **1356** (patch :339-350; 1356-C2:20-24):
  - `ARCHIVE_STEP`, at a later save step;
  - RED 9 `rank-step-final-facts` and `rank-step-record-is-law-snapshot`, when a later end-of-tick step lands (P15B's
    condition step or P15C's freeze);
  - the three downgrade leaves, when a sibling root holding rows refuses the same downgrade;
  - `rank-root-migration-empty` and `rank-root-migration-genuine-below-step-capture`, when P15B's step adds loan
    movements.
- **1355** (patch :836-842; the four `repinAtSiblingLanding` rows, classification :48):
  - `MARKET_STEP`;
  - `market-validator-reconciles: across P15 roots …`, "if the order changes" (1355-F4:19-20);
  - `market-old-save: a non-empty root refuses the downgrade …`, at the merge with 1356's
    `rank-root-downgrade-recorded-quarter-refuses`;
  - both RED 16 capture leaves, if the roots land at separate steps (1355-F5:29-30; 1355-C3:13-14; 1355-D3:13).
- **1359** (patch :852-859; 1359-C2:20):
  - the `P15_ROOTS` merge;
  - B1 and C4g (named in the header as C4, `legacy-migration-past-boundary-genuine-save38`), which "hold once the
    sibling's key is listed";
  - A3, A5, A7, A8 and B4, each re-pinned to the sibling's landed root shape;
  - C2 and C5, which hold for a shared step and for a separate one.

  The five forged-root leaves would move to other patches only if P15C landed first.

### Q3. The mints

| | 1355-P r3 (P15A.1) | 1359-P r4 (P15C) |
|---|---|---|
| Relative to its own RED commit | After it. The producer imports `tests/helpers/p15a1-market-route.ts` and `p15-roots.ts` (P :38-42). 1355-C:32: "Run once in E at the last writer below the step, RED patch landed". The pins are "minted at the RED commit on unchanged production" (1355-A:161; 1355-X5:38) | After it, "at a HEAD that carries the RED patch (it imports the RED's route helper) and not the Legacy's production" (P :21-22) |
| Relative to the other REDs and the productions | "minted once at the last writer below the step, before any P15 production lands" (P :2-3). 1355-F Amendment 3 (1355-F:34-36): the capture comes from "the last writer of the version immediately below the step, minted before that writer moves. ... The same capture serves every root that shares the step." Every reader's premise goes into one run (1355-F4:46-47; P :123-124) | "run this at the last writer below the step the Legacy lands in" (P :18-20). After slice B's Save44 production (1359-F6:28-30; 1353-F7:84). "the mint at the last writer below the P15 step, then the recorded RED" (1359-F5:25-26) |
| What "last writer" means | 1358-F3:46-47: "the last Save43 writer, which is HEAD before slice B's production. Slice A has landed and changes no save version." Test-only and docs-only commits do not move the writer, so on this base any HEAD before the first P15 production is the last Save44 writer | Same |
| Placement | The E root, so that `../../../../../` reaches the repository root, for imports and for `ROOT` (P :20-21, :34-44). The dry runs used `E/1355-P-p15a1-market-producer.ts` (1355-X3:17-19) | The E root (P :24-25, :38-44), as `E/1359-P-p15c2-route-l-producer.ts` (1359-X3:17-19) |
| Environment | `P15A1_PRODUCER_HEAD`: 40 hex characters equal to `git rev-parse HEAD`, "the published execution HEAD" (P :58-60). `P15A1_CAPTURE_MODE`: `mint` or `skip` (P :61-63) | `P15C2_PRODUCER_HEAD`, with the same rule (P :56-58). No mode |
| Guards before any work | It refuses if the pin directory exists, and in mint mode if the capture directory exists (P :64-65). It refuses if `rivalRouteAt(1)` carries `sharedMarket`; other P15 roots below the step are tolerated (P :11-14, :66-69) | It refuses if the capture directory exists (P :59), or if `generateWorld(ROUTE_SEED)` carries `campaignLegacy` (P :60-62). It also asserts the route's premises (P :66-79) |
| Writes (flag `wx`, after every check) | Pins: `tests/fixtures/p15/p15a1-market-pins/MANIFEST.json` and `k1-post-tick-week-<W>.json.gz`. Mint mode only: `tests/fixtures/p15/genuine-below-p15-save-step/MANIFEST.json` and `fresh-market-week-<M>.json.gz`. Both manifests carry `saveVersion: LIVE_SAVE_VERSION` (P :23-27, :143-168) | `tests/fixtures/p15/p15c2-route-l-captures/route-l-week-6239.json.gz`, `route-l-week-6240.json.gz` and `MANIFEST.json`, with `saveVersion: LIVE_SAVE_VERSION` (P :27-30, :81-97) |
| Modes | `mint` writes the shared capture. `skip` only checks a capture that "another record minted", and asserts that its `saveVersion` equals the live version (P :131-141). The records choose `mint`: "the parent mints once, at the last writer below the step" (1355-F4:46-47; 1355-C2:20; 1355-X5:66-67). No other producer writes this directory | None |
| Once-only rules | "Parent executes once under the bounded recorder and guards; no rehearsal, seed search, state surgery or retry (the house rule). A failed route premise throws with its own message and nothing is written." (P :8-9). "Nobody can re-mint after the writer moves" (P :17-18; 1355-D2:32) | The same house rule, plus "every write happens after every check" (P :14-16) |

**What the records say about dry runs under the once-only rule.**
- **Each dry run disclaims being the mint.**
  - 1355-X3:3: "This run executes it once in scratch, in mint mode. It is not the mint."
  - 1359-X3:3-4: the same.
  - The script header `E/1359-stage/run-p15-producer-dry-runs.sh:4`: "Not a mint: the real mints run under the recorder
    at the last writer below the P15 step."
  - The Save44 repeats: "Not a mint. Nothing was written to the repository." (1355-X5:47; 1359-X6:74).
  - 1355-X5:4, though, says the parent "rehearsed the producer 1355-P r3 on the Save44 base".
- **No P15 record reconciles these dry runs with "no rehearsal".**
- **The house practice reconciles them.**
  - 1314-X:14-15 and 1344-X:22-23 call a scratch dry run's identities "rehearsal values only" and add that "the
    recorded run on the published HEAD mints the fixtures".
  - 1358-F3:15 ordered a second producer dry run "before any recorded mint", and the slice B producer carries the same
    house rule.
  - The recorded slice B mint matched dry run 1358-X2 byte for byte (1358-L:34-36).
- **The reading this supports:** the rule binds the recorded execution in the repository (one run, no retry, no seed
  search, no state surgery). It does not bind a scratch dry run that writes nothing to the repository.

**Expected identities, by reading.** Both producers follow deterministic seeded routes. By the 1358-L:34-36 precedent, the
recorded mints should reproduce the Save44 dry-run bytes. Only the manifests' `executionHead` and `elapsedMs` should
differ.

| Output | Gzip sha256 | Bytes | Source |
|---|---|---:|---|
| 1355 shared capture | 45377fe4… | 69,689 | `E/1355-stage/x5/x5-capture-MANIFEST.json` |
| 1355 K1 file | 8db2b590… | 68,293 | `E/1355-stage/x5/x5-pins-MANIFEST.json` |
| Route L, week 6239 | 8d82fbc3… | 68,078 | `E/1359-stage/x6/x6-route-l-MANIFEST.json` |
| Route L, week 6240 | 50e79023… | 78,045 | `E/1359-stage/x6/x6-route-l-MANIFEST.json` |

### Q4. The shared capture `genuine-below-p15-save-step`

**Who mints it, in which mode, and when.** 1355-P mints it, in `P15A1_CAPTURE_MODE=mint` (1355-C:31-32; P :26-27,
:120-130).
- **Against 1356's RED commit:** the mint follows the 1355 RED commit, which in the agreed order follows 1356's.
- **Against the productions:** it must precede the first P15 production (Q3).
- **Against 1356's recorded RED:** no record orders the two. 1356-F2:52 says only "The genuine capture for the capture leaf
  is minted later, at the last writer below the P15 save step". 1356-X4:45-46 leaves "which message the recorded RED
  pins, given that order" to the parent.

**Which leaves read it.**
- **1356:** `rank-root-migration-genuine-below-step-capture` (patch :1176-1204).
- **1355:** the two leaves `market-old-save: the genuine capture below the step loads …` and `market-old-save: the first
  batches after migration …`, both through `belowStepCaptures()` (patch :1528-1547, :1553, :1565).
- **1359:** none. Its route L captures are separate (1359-P r4 :27-30).

**Messages at the RED commit on the Save44 base.** At that commit the step constant is `LIVE_SAVE_VERSION`, which is 44.
- **1356's capture leaf.**
  - **Before the mint** (measured: 1356-X4:32-35 and `E/1359-stage/x6/check.txt:55-56`): `RED: no genuine capture below
    the P15 save step at tests/fixtures/p15/genuine-below-p15-save-step/ (1356-A §9: mint it at the last Save43 writer)`
    (patch :1184).
  - **After the mint** (by reading, never run): the leaf fails at `expect(manifest.saveVersion).toBe(ARCHIVE_STEP - 1)`
    (patch :1188), expected 44 to be 43. It first passes once `ARCHIVE_STEP` is 45, at slice 2a's GREEN.
- **1355's two capture leaves.**
  - **Before the mint** (measured: 1355-X5:34 and `check.txt:8-13`): `FIXTURE PENDING: no genuine capture below the P15
    save step at tests/fixtures/p15/genuine-below-p15-save-step/ (1355-F Amendment 3: minted by 1355-P at the last
    Save43 writer)` (patch :1533-1534).
  - **After the mint, sha not yet pinned** (by reading): `FIXTURE PENDING: pin CAPTURE_MANIFEST_SHA256 = '<sha>' (the
    minted tests/fixtures/p15/genuine-below-p15-save-step/MANIFEST.json) in this file` (patch :1538).
  - **After the sha is pinned** (by reading): the leaves fail at `expect(manifest.saveVersion).toBe(MARKET_STEP - 1)`
    (patch :1542), 44 against 43.

**What the classifications expect.**
- **1356** (classification :165-167): "RED message: no genuine capture at tests/fixtures/p15/genuine-below-p15-save-step/
  (stays RED in the reference run until the parent mints it)". It declares the pre-mint message only. No 1356 record
  declares a post-mint message.
- **1355 capture leaves** (classification :545-547 and :554-556; `fixturePending` and `repinAtSiblingLanding` are both
  true). The rows declare the full sequence: "throws 'FIXTURE PENDING: no genuine capture below the P15 save step'
  (1355-P not run); once minted, 'FIXTURE PENDING: pin CAPTURE_MANIFEST_SHA256' until the sha is pinned in the file
  (1355-F4); then, while the live writer is still the capture version, fails on manifest.saveVersion = N, expected
  N - 1 (no step yet)".
- **1355 pin controls.** These four rows read the pin directory, not the capture:
  - `market-seam-default-exact … [control, fixture-pending]` (:62-64);
  - K1 (:248), K2 (:278) and M0A (:590).

  Each declares "after minting it passes on unchanged production". The summary counts 6 fixture-pending rows and 4 rows
  that pass today (:42-49).

**One shared step only.** 1355-F5:25-30: "The shared capture directory `tests/fixtures/p15/genuine-below-p15-save-step/`
serves one shared step only. ... If the roots land at separate steps, each step's production mints its own capture below
its own step, at its own path, and the reading leaves are re-pinned then." 1355-C3:13-14 names the leaves: both RED 16
leaves and 1356's capture leaf.

### Q5. Recorded runs, stems and the slice B precedent

**Which recorded runs each RED needs.**
- **1356:** a recorded RED only.
- **1355:** a recorded mint, then a recorded RED (1355-A:264; 1355-C:32; 1355-X5:66-67; 1355-F6:36).
- **1359:** a recorded mint, then a recorded RED.
  - 1359-A:279: "the recorded RED on unchanged production".
  - 1359-F5:25-26; 1359-F6:28-30; 1359-X6:90-91.
  - Patch :827-829: "the parent mints them before the recorded RED (1359-F2)".

**Stems.** No record names stems for the P15 Wave 2 runs. The precedents in E are:
- the Wave 1 REDs `1346-p15a1-red-recorded`, `1351-p15a2-red-recorded` and `1353-p15c1-red-recorded`;
- `1358-sliceb-mint` and `1358-sliceb-red-recorded`;
- `1344-save42-rival-stall-mint`.

Any choice must match `^[0-9]{3,4}[a-z0-9-]*$` (HANDOFF:43).

**The slice B precedent** (1358-L, with rulings 1358-F3, F4 and F8).
- **Ruled order.** 1358-F4 item 5 (:36-44) sets "1. the RED r5 commit (tests and the producer); 2. the recorded mint
  1358-P at that commit (Save43 source); 3. the fixture commit; 4. the recorded RED".
  - Its reason: "At RED the GENUINE leaf then fails on the missing Save44 law, not on a missing file."
  - Its record rule: "The GENUINE row declares the post-mint failure."
- **Post-mint reasons were measured before the RED commit.** 1358-X3 ran "with X2's capture placed where the GENUINE leaf
  reads it, so the post-mint reasons are measured" (1358-F4:75-76). 1358-X4 repeated the run for r8 (1358-X4:1-30;
  1358-F8:52-53).
- **"Last writer" meant HEAD before the production.** 1358-F3:46-47: "The recorded mint 1358-P at the last Save43
  writer, which is HEAD before slice B's production."
- **The landing commits.**
  - 650e963a holds the RED r8 tests and the producer hunk at the E root, applied by `git apply --index` (1358-L:13).
  - 4ad8e0f7 commits the recorded mint `1358-sliceb-mint`, run at 650e963a: three fixture files plus the five outputs
    (1358-L:14). The command was `node_modules/.bin/vite-node E/1358-P-save43-producer.ts` with
    `P14_SAVE43_PRODUCER_HEAD` set, run as `recorded.sh mint` on Node v20.20.2 (1358-L:28-31).
  - 5245072a commits the recorded RED `1358-sliceb-red-recorded`, run at 4ad8e0f7: 89 failed and 59 passed of 148, with
    identities equal to 1358-X4's. This commit opened 1358-L (1358-L:15, :42-56).
- **The capture matched the dry run.** The minted capture was byte-identical to dry run 1358-X2's (1358-L:34-36). At the
  recorded RED the GENUINE leaves "pass their premises and fail on the missing Save44 law" (1358-L:57-58).
- **No commit overlapped a recorded run** (1358-L:78-79).
- **Recorded values became test pins in a separate commit.** F10 and F11 took the recorded producer values at 5ac4b738
  (1358-L:20). That is the closest precedent for step 5's sha pin.

**Two ways P15 differs from that precedent.**
- **The post-mint failure.** For 1355 and 1356, the failure after the mint is a bare version mismatch (44 against 43),
  not the missing law. The P15C author named this case on purpose: "Minted captures at the live version now fail RED by
  name ... instead of on a bare version mismatch" (1359-C2:30).
- **No post-mint dry run.** No P15 dry run has placed a minted capture under a RED. 1355-X3, 1355-X5, 1359-X3 and 1359-X6
  ran the producers alone, and the RED runs had no fixtures.

### Q6. Save44 effects

**Records that anticipated a Save44 base.**
- **1355-F Amendment 3** (1355-F:34-36): "RED 16 names Save43. By production, the live version below the P15A.1 step will
  be at least Save44 (relationship slice B)."
- **1355-A:131-132:** "Save44 goes to relationship slice B (1347-A:92), so Save45 is expected."
- **1356-A:238-240:** production waits for "Save43 (shelving) and Save44 (relationship slice B ...) to land, which fixes
  N. Mint the genuine Save(N−1) fixture at that version's last writer before the writer moves". 1356-B:41 agrees.
- **1359-A:277-278:** "Save44 is slice B's."
- **1359-C:13:** "The reference uses 44 only because it is the next number in scratch; §10 item 4 gives Save44 to slice
  B."
- **1355-X3:43-44 and 1359-X3:34-36:** "Slice B takes Save44, so the real capture will be Save44 or later."
- **The P15C mint and recorded RED wait for Save44.** 1359-D5:209, 1359-F6:28-31, 1359-X5:58-60 and 1353-F7:84 place them
  after slice B's Save44 production, with a rebase and a repeat of the declaration check first.
- **1358-N:288-294:** one base pin (I:151); the producers mint V44 after the rebase; the references retarget to Save45.
  1358-L:138-142 and CONTINUATION-STATE.md:22-26 repeat this.
- **1356 and 1355 needed no rebase.** They read the step from `LIVE_SAVE_VERSION` and hold no future literal (1356-C:31;
  1355-C:27; 1356 patch :330-334; 1355 patch :854-857), so only P15C needed r8.

**What the Save44 dry runs measured** (1355-X5, 1356-X4, 1359-X6). Every classified leaf keeps its expected status on
Save43 and on Save44. Only these first messages differ:
- **1356:** one version digit and 13 importing-file names (1356-X4:28-39).
- **1355:** two K1/K2 digests, which the mint pins; two version digits; two importing-file names (1355-X5:28-40).
- **1359 r8:** no first message differs, and the root type gate is clean (1359-X6:55-64).

**Statements that name Save43 or a Save43-era base, and need attention beyond r8:**

| Where | Text | Status |
|---|---|---|
| 1359 classification :327, :359, :375 (C2-C4, `expectedFailureToday`) | "Once minted at Save43 (the live version at base) it fails by name: 'RED: the route L captures are Save43, …'" | **Needs revision.** After a Save44 mint the message reads Save44 (patch :297). The rows' `firstMessageAtRed` (:329, :361, :377) is the pre-mint FIXTURE PENDING text, so a recorded RED after the mint will not match it. 1359-X6:35-40 kept the r7 classification and named only two texts as history. These three rows were not among them |
| 1359 classification :7 (the control row) | "route L is lawful at Save43" | 1359-X6:36-38 keeps it as history; X6 measured the pass on Save44 |
| 1359 classification :407 (`legacy-root-downgrade`) | "after migrateToV42 and convertV42ToV43 …" | 1359-X6:39-40 keeps it as history. On Save44 the leaf finds V43 and V44 by name, and its first message is unchanged |
| 1356 classification :160 (`rank-root-migration-empty`) | "on the migrateToLive output (Save43 today)" | It is now Save44. Status and message are unchanged (1356-X4:25-26), so only the wording needs a fix |
| 1356 classification :167 | declares only the pre-mint capture message | Needs a post-mint text if 1356's recorded RED follows the 1355 mint (Open question 2) |
| 1356 patch :1184 and 1355 patch :1534 (computed messages) | "mint it at the last Save43 writer"; "minted by 1355-P at the last Save43 writer" | `Save${STEP - 1}` reads Save43 at the RED commit, but the Save44 writer mints. The digit becomes true only once the step lands, and then the leaf no longer shows it. The parent judged it "a message, not an assertion" (1355-X5:39-40; 1356-X4:37). P15C left the version number out for this reason (1359-C2:30). Fixing the wording is optional |
| 1356-X:29; 1356-X2:16; 1359-C:28; 1359-C2:35 | "The capture mints at the last Save43 writer"; "Captures to mint at the last Save43 writer"; "C2-C4 fail with 'the route L captures are Save43 …'" | Stale history, superseded by 1355-F Amendment 3 and 1359-F6 ruling 5 |
| 1355-A:251 (RED 16, "Save43 loads to the empty root …") | the charter, byte-frozen | Superseded by 1355-F Amendment 3 (1355-F:32-36) |
| 1355-A:167 (K3, "Migrated Save43 natural route") | the charter, byte-frozen | K3 is a G2 measurement, not a RED leaf (1355-C:52), and Amendment 3 covers RED 16 only. When G2 reruns at the RED commit as K3's baseline (1355-F4:41), the migrated route is Save44 |
| 1355 classification :4 (`base` "1063ab4f"); the 1359 control row's `redBasis` | the original authoring base | History |

### Q7. The productions afterwards

**Order.**
- **1355-F4:8-10:** P15A.2 slice 2a production comes before P15A.1 Wave 2. This reverses 1350-A:129-131, 1353-A:276 and
  1353-W0:173-175.
- **1357-A:332:** slice 2a lands `studioWeeklyFixedCost` first, for P15B.
- **1359-A:273-276:** P15C lands "with or after" its siblings and needs none of them for correctness.
- **1356-A:242:** "whichever reaches production first takes the next number."
- **HANDOFF:17 and :47:** the next production is "P15A.2 slice 2a production (Save45) from the 1356 reference,
  retargeted"; P15B waits for Owner question 1357-Q1.

**The shared step.**
- **1355-F Amendment 4** (1355-F:38-42) lets the parent put the P15A.1 root, the P15A.2 archive and the P15B condition
  root "in one save step when their productions are ready together". Each root keeps its own validator, migration,
  downgrade refusal and RED leaves.
- **The amendment names no number.** Save45 comes from 1355-A:131-132 ("Save45 is expected (1353-A:279); P15A.2 Wave 2
  may share it") and from 1357-A:333-335.
- **P15C:** 1359-A:277-278 adds "the shared P15 step if P15C is ready with the siblings (1355-F Amendment 4), else the
  next live version after them". 1359-F:50-51 requires P15C's production to land "before any campaign reaches 2040".
- **The allocator:** 1355-F2 items 1 and 6 (:24-25, :50-53) bring `p15Sequence` in the first P15 root's step, or in the
  shared step.

**Gates on the productions.**
- **P15A.1:** step (c) lands only after G2 returns Proceed or Flag on the frozen candidate (1355-A:265-267). G1 already
  returned "Proceed, flagged" (1355-X4:6-8). G2's rerun at the RED commit is K3's baseline (1355-F4:41).
- **P15C:** production waits on G-P (1359-F5:25). The gating run "uses the tree Wave 2 production lands on"
  (1353-F7:64-65).

**The references.** The P15 reference patches each mint Save44 and "retarget to Save45" (1358-N:293-294; 1358-L:142;
HANDOFF:40; 1356-X4:47-48; 1359-X6:94). The 1355 reference stacks on 1356's: "one step strips and creates all three
roots" (1355-C2:39).

---

## Part 3. Open questions and conflicts

1. **The save-step allocation decides whether the Save44 mints are valid. This is the main conflict.**
   - **What a capture must match.** At GREEN, every capture leaf requires the capture's `saveVersion` to equal
     STEP − 1 (1356 patch :1188; 1355 patch :1542; 1359 patch :299). A capture minted now is Save44, so it serves only
     a P15 step at Save45.
   - **What the schedule gives.** HANDOFF:47 puts slice 2a production alone at Save45. P15A.1 still waits on G2, and
     P15C on G-P.
   - **The shared capture** is correct for 1356. If P15A.1 lands at its own later step, its two RED 16 leaves need a
     new capture "at its own path" and a re-pin (1355-F5:29-30). The records declare this, and the classification flags
     both rows (:550, :559).
   - **The route L captures** must come from "the last writer below the step the Legacy lands in" (1359-P r4 :18-20).
     If P15C lands at Save46 or later, a Save44 mint is the wrong writer. The producer refuses to overwrite its
     directory (P :59), so a re-mint would mean deleting committed fixtures or revising the RED's path.
   - **What the rulings say.** 1359-F5:25-26, 1359-F6:28-30 and 1359-X6:90-91 put the mint on the Save44 base. That
     agrees with the producer's rule only if P15C shares Save45.
   - **Options the records allow.**
     - (a) Hold slice 2a production until P15A.1 and P15C can share Save45 (1355-F Amendment 4; 1359-A:277-278).
     - (b) Land the 1359 RED commit now, and run its mint and recorded RED at the last writer below P15C's own step.
       That recorded RED would then run on a tree that carries slice 2a's production, so its declarations need a check
       there.
     - (c) Mint now and accept a later re-mint and re-pin.
   - **The records do not resolve this.** The parent decides before step 8.
2. **Should 1356's recorded RED run before or after the 1355 mint?** No record orders them.
   - **Before (step 2):** the capture leaf gives the measured message that its classification declares (:165-167).
   - **After:** it fails on a bare version check, 44 against 43. No record declares that message, so the row would need
     revising first, as 1358-F4:43-44 required for slice B.
   - **The slice B reason for minting first does not carry over.** That reason was "fails on the missing Save44 law, not
     on a missing file". This leaf stops at the version check either way.
3. **Sha pins after the mint.**
   - **1355 (the commit is open).** 1355-F4:42-43 requires `CAPTURE_MANIFEST_SHA256`. No record says which commit
     carries it.
     - If it lands before the recorded RED, the capture leaves reach their final classified reason.
     - Without it they fail on "pin CAPTURE_MANIFEST_SHA256". The classification also lists that as an interim state.
   - **1356 (the decision is open).** The leaf's comment asks for a pin: "After minting, pin the capture's sha256 here as
     well (the 1344-P precedent)" (patch :1179-1180). 1356-C:47 and 1356-C2:53 left it "Not decided", and no ruling
     adopted it. The leaf has no constant to fill, so adding a pin is a test change.
4. **The post-mint RED states are unmeasured.**
   - **Known only by reading:**
     - 1355's 8 passed and 51 failed;
     - its two capture messages;
     - 1359's C2-C4 messages.
   - **Slice B measured this case.** Its dry run placed a capture before the RED commit (1358-F4:75-76; 1358-X4).
   - **The P15 dry-run trees are gone.** `S/p15-save44/prod/` holds only the two output logs. A matching check would
     rerun each producer in scratch and run the RED over its output.
5. **The 1359 classification needs revising for the recorded RED.** r8 kept r7's classification (1359-X6:35). Rows C2-C4
   (:324-329, :356-361, :372-377) carry pre-mint `atRed` and `firstMessageAtRed` values and a Save43 post-mint text.
   The records order the mint before the recorded RED, so these rows need a parent revision first. An earlier HANDOFF
   draft planned a parent revision record, 1359-C8, for r8. r8 was recorded in 1359-X6 instead (HANDOFF:31), and no
   record revises these three rows.
6. **"No rehearsal" against the dry runs.** The producers forbid rehearsal (1355-P r3 :8; 1359-P r4 :14), and 1355-X5:4
   says "rehearsed". The dry runs rest on house practice (1314-X:14-15; 1344-X:22-23; 1358-F3:15; 1358-L:34-36). No P15
   ruling covers them.
7. **The runner.**
   - **What the records say:** the producer headers and 1355-C:32 say `npx tsx`.
   - **What is installed:** `node_modules/.bin` holds `tsc`, `vite-node` and `vitest`, but no `tsx`, so `npx` would
     fetch it from the network.
   - **What the measured runs used:** `node_modules/.bin/vite-node`, in 1355-X3:19, 1359-X3:19, both X6 scripts and the
     slice B mint (1358-L:28).
8. **A failed recorded mint.** The producer writes nothing on failure, and the house rule forbids a retry. The records do
   not say what follows, though for 1355 "nobody can re-mint after the writer moves" (1355-D2:32). Treat a failure as a
   finding and stop.
9. **Where the producer is committed.** Both choices work.
   - HANDOFF:46 says "commit the producer at the E root".
   - Slice B put its producer in the RED commit (1358-F4:38), and 1355-A:161 wants the pins "at the RED commit".
     Committing the producer with the RED meets both rules to the letter.
   - A separate docs-only commit changes no source and serves as well.
10. **The harness file.**
    - **The rule:** 1356-F2:40 and the harness header (patch :69-70) say to run
      `tests/p15a2-power-ranking-archive-harness.test.ts` alone.
    - **At RED it is cheap:** it fails in under a second (1356-X3:27), and 1356-X4 ran it with the other two files.
    - **Unsettled:** the records do not say whether the recorded RED runs it separately.
    - **Later:** it stays out of the next broad core file list (1358-M3:31-33 shows that list).
11. **Merge wording written for two REDs.**
    - "Whichever lands second merges the list" (1355-C2:6; 1359-F2:28; patch :853) assumed two REDs. Only HANDOFF:46 says
      the second and the third both merge.
    - P15B's root `corporateCondition` appears in no `P15_ROOTS` list. P15B's RED would add it later; 1359's helper
      already names it as a sibling (1359 patch :102-103).
12. **The basis for the RED order.**
    - 1355-F4's text orders productions.
    - The RED order 1356, then 1355, then 1359 rests on the parent's reading (1355-X5:64; 1356-X4:43; HANDOFF:46). It
      also rests on step 11's constraint that the 1355 mint precede slice 2a production.
    - No technical dependency forces 1356's RED commit before 1355's.
