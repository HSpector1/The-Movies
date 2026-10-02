# R3-N1 native correction record — 2026-09-15 · OPS-R3-N1-NATIVE-CORRECTION-20260915-01

## CURRENT: P15 Wave 2 REDs landed on Save44 (1360-L); both P15 captures minted; Save45 reserved for the three P15 productions

State at 2026-10-02 12:45 CDT, at the commit that adds this block (pushed). No recorded run is active. Root `HANDOFF.md` carries the
resume commands and the lane queue.

- **P15 Wave 2 REDs: LANDED.** [1360-L](evidence/p14b4-20260919/1360-L-p15-wave2-red-landing.md) holds the step table.
  - **The plan.** [1360-R](evidence/p14b4-20260919/1360-R-p15-wave2-red-landing-protocol.md) compiled the protocol.
    The parent ruled in [1360-F](evidence/p14b4-20260919/1360-F-parent-rulings-p15-wave2-red-landings.md), amended
    by [1360-F2](evidence/p14b4-20260919/1360-F2-parent-response-to-1360-D.md) and
    [1360-F3](evidence/p14b4-20260919/1360-F3-parent-response-to-1360-D2.md).
  - **The rehearsal.** [1360-X](evidence/p14b4-20260919/1360-X-p15-wave2-landing-replay.md) replayed the whole
    sequence in scratch first.
  - **The reviews.** [1360-D](evidence/p14b4-20260919/1360-D-p15-wave2-landing-review.md) and
    [1360-D2](evidence/p14b4-20260919/1360-D2-p15-wave2-landing-recheck.md).
  - **The order:** 1356 (P15A.2 slice 2a), 1355 (P15A.1), 1359 (P15C r8). `P15_ROOTS` merged to four keys.
  - **Recorded REDs:** 70 failed / 2 passed, 51 / 8, and 40 / 76. Each equals the replay leaf for leaf.
  - **Recorded mints** `1360-p15a1-mint` and `1360-p15c-mint` wrote the Save44 captures and pins under
    `tests/fixtures/p15/`. Every MANIFEST field equals the replay's, apart from the head and the timings.
    `CAPTURE_MANIFEST_SHA256` is 410d48a8….
  - **The type gates** at the landed HEAD:
    - root has the six missing-module errors the REDs declare;
    - UI, Bridge and both generator checks are clean.
- **Save45 is reserved** for P15A.2 slice 2a, P15A.1 and P15C (1360-F ruling 1; 1360-F2 ruling 2).
  - The single writer authors them in that order on the Save44 base, and they land together behind one Save45 sweep.
  - No commit that changes `src/` lands before then (1360-F3 ruling 5).
  - P15B joins only if 1357-Q1 resolves in time.
  - If P15A.1 or P15C misses the step, slice 2a may land alone, and the other two take their declared re-pins.
- **Next.** The Save45 production protocol is in compilation. Then come the productions, with G2's control on an
  archive of e4be3e5c and P15C's G-P on the production tree.
- **Open Owner items:**
  - 1357-Q1: rival recovery before P15B closure. Recommend (a), starting with the shelving `cashBlocked` fix (1357-F3).
  - The P15C playtest brief (1353-T §6.3; 1353-F7 ruling 6).
  - Slice B's provisional copy (1358-F7 ruling 7).
  - numpy for the three rgba rows.
  - P16's nine questions (1354-Q).
  - The §7 flags (1344-V §9).
  - The seven declared exceptions.
  - 1356-X F-2.
  - X12's V39 family.

## CURRENT: slice B closed (1358-L, 1358-M3); Save44 and projection 57 live; P15 Wave 2 REDs rebase onto Save44

State at 2026-10-02 11:12 CDT, at the commit that adds this block (pushed). No recorded run is active. Root `HANDOFF.md` carries the
resume commands and the lane queue.

- **Relationship slice B: CLOSED.** [1358-L](evidence/p14b4-20260919/1358-L-rel-sliceB-landing.md) holds the full step
  table.
  - **Production** r2 landed as four commits, 9eb1e66e to 83d1030d, each blob-equal to the reviewed step.
  - **The Save44 and projection-57 pin sweep**, r4, landed at f458680b: 154 test files.
    - Handback: [1358-C9](evidence/p14b4-20260919/1358-C9-sweep-landing-handback.md), with 762 classification rows and
      29 census dispositions.
    - Reviews: [1358-D9](evidence/p14b4-20260919/1358-D9-sweep-r2-review.md) and
      [1358-D9b](evidence/p14b4-20260919/1358-D9b-sweep-r3-delta.md).
  - **F10 and F11** take the recorded producer run `1358-p57-declaration` (5ac4b738).
  - **The recorded GREEN** shows 3 failed and 145 passed: the row 6 exceptions.
  - **[1358-M3](evidence/p14b4-20260919/1358-M3-sliceb-recorded-broad-gates.md)** recorded the broad gates:
    - core: 85 failed, SAME 84 against 1348-I, with C20 CHANGED by the live version digit;
    - UI: 3 failed, the numpy rows (1348-I2; the primaries differ only in the temporary directory).
  - **The type gates** and both generator checks pass at the landed HEAD.
  - **Review.** [1358-J3](evidence/p14b4-20260919/1358-J3-sliceb-landing-review.md) returned REFINE on the records, and
    the parent applied it.
- **P15 Wave 2 REDs: rebasing onto Save44** (1359-F6 ruling 5).
  - P15C RED r8 moves `BASE_LIVE_SAVE_VERSION` to 44.
  - The parent dry-runs the three REDs on Save43 and Save44 (1355-X5, 1356-X4, 1359-X6), with the two producers.
  - Then come the mints (1355-P r3, 1359-P r4) and the recorded REDs.
  - The P15 reference patches minted Save44 themselves, so they retarget to Save45 for the productions.
- **Open Owner items:**
  - 1357-Q1: rival recovery before P15B closure. Recommend (a), starting with the shelving `cashBlocked` fix (1357-F3).
  - The P15C playtest brief (1353-T §6.3; 1353-F7 ruling 6).
  - Slice B's provisional copy (1358-F7 ruling 7).
  - numpy for the three rgba rows.
  - P16's nine questions (1354-Q).
  - The §7 flags (1344-V §9).
  - The seven declared exceptions.
  - 1356-X F-2.
  - X12's V39 family.

## CURRENT: slice A closed (1348-M); slice B RED r8 and production r2 staged; P15C retune ruled (hit line 49), RED r7 staged

State at 2026-10-02 02:19 CDT, at the commit that adds this block (pushed). No recorded run is active. The heavy lane runs scratch
probes and dry runs. Root `HANDOFF.md` carries the resume commands and the lane queue.

- **Relationship slice A: CLOSED.** [1348-M](evidence/p14b4-20260919/1348-M-rel-sliceA-recorded-broad-gates.md) recorded its broad gates at
  bc2f6007 on Node v20.20.2.
  - Core: 85 failed, the same identities and primaries as 1344-I3 (SAME 85).
  - UI: 3 failed, the numpy rows.
  - Both new files pass. [1348-L](evidence/p14b4-20260919/1348-L-rel-sliceA-landing.md) is CLOSED.
- **Relationship slice B: RED and production staged, not landed.**
  - RED r8 ([1358-C8](evidence/p14b4-20260919/1358-C8-rel-sliceB-red-r8-handback.md)):
    - [1358-D2](evidence/p14b4-20260919/1358-D2-rel-sliceB-red-r6-confirmation.md) CONFIRMED r6;
    - [1358-F6](evidence/p14b4-20260919/1358-F6-parent-response-to-1358-D2.md) withdrew F5's `endedWeek` bound, and r7 corrected the text;
    - [1358-F8](evidence/p14b4-20260919/1358-F8-parent-response-to-1358-J.md) added two forged-save leaves, a control and an anchor
      assertion.
  - Production in four cumulative steps, revision r2 ([1358-E](evidence/p14b4-20260919/1358-E-rel-sliceB-production-handback.md),
    [1358-E2](evidence/p14b4-20260919/1358-E2-rel-sliceB-production-r2-handback.md)):
    - review [1358-J](evidence/p14b4-20260919/1358-J-rel-sliceB-production-review.md) KEEP, and delta check
      [1358-J2](evidence/p14b4-20260919/1358-J2-rel-sliceB-production-r2-delta-check.md) CONFIRMED;
    - [1358-F7](evidence/p14b4-20260919/1358-F7-parent-rulings-on-1358-E.md) rules on the writer's questions.
  - Next: the r8 short run (1358-X4), the RED commit, the recorded mint and RED, the step dry run 1358-X5, the
    fallout measurement 1358-M2, then the sweep plan 1358-N.
- **P15C §5.5 retune: ruled; the RED is staged.**
  - [1353-T](evidence/p14b4-20260919/1353-T-p15c-legacy-tuning-amendment.md) proposed critic 60, hit line 50 and share floor 20.
  - [1353-F6](evidence/p14b4-20260919/1353-F6-parent-rulings-on-1353-T.md) chose 49, which keeps a `commercial-engine` holder under the
    measured shared-market factors. [1353-U](evidence/p14b4-20260919/1353-U-p15c-legacy-tuning-review.md) returned REFINE, and
    [1353-F7](evidence/p14b4-20260919/1353-F7-parent-response-to-1353-U.md) adopted it.
  - RED r7 and reference r4 are staged ([1359-C6](evidence/p14b4-20260919/1359-C6-p15c-wave2-red-r6-handback.md),
    [1359-C7](evidence/p14b4-20260919/1359-C7-p15c-wave2-red-r7-handback.md)). [1359-D5](evidence/p14b4-20260919/1359-D5-p15c-wave2-red-r6-confirmation.md)
    returned REFINE, answered by [1359-F6](evidence/p14b4-20260919/1359-F6-parent-response-to-1359-D5.md).
  - In the lane: G-P on the ruled values (1353-X4), then dry run 1359-X5.
- **Open Owner items:**
  - 1357-Q1: rival recovery before P15B closure. Recommend (a), starting with the shelving `cashBlocked` fix (1357-F3).
  - The P15C playtest brief (1353-T §6.3; 1353-F7 ruling 6).
  - Slice B's provisional copy (1358-F7 ruling 7).
  - numpy for the three rgba rows.
  - P16's nine questions (1354-Q).
  - The §7 flags (1344-V §9).
  - The seven declared exceptions.
  - 1356-X F-2.
  - X12's V39 family.

## CURRENT: P14 closed (1344-K); P15 Wave 1 closed; slice A landed; P15B Re-tune; P15C G-P sends two archetypes to retune

State at 2026-10-01 23:45 CDT, HEAD 975e72a1 plus this update (pushed, remote verified). No recorded run is active.
Root `HANDOFF.md` carries the resume commands.

- **P14 shelving and Save43: CLOSED** ([1344-K](evidence/p14b4-20260919/1344-K-parent-shelving-save43-closure.json)).
  - The recorded gates at 469a9547 hold the 1344-N success line
    ([1344-M3](evidence/p14b4-20260919/1344-M3-save43-sweep-recorded-gates.md); review 1344-J3 REFINE, then
    CONFIRMED by 1344-J4).
  - Core fails 85: 1338's 78 retained identities and the seven 1344-F6 declared exceptions. UI fails 3, the numpy rows.
  - §7 ([1344-V](evidence/p14b4-20260919/1344-V-s7-shelving-verification.md)): every anchor is EQUAL and controls
    (a)-(d) PASS. All 231 film and commission movements are attributed to the shelving law. 154 promise movements
    come from the same law, but their path is unnamed, so they are flagged to the Owner.
- **P15 Wave 1: CLOSED** on those gates: 1346-K (P15A.1 and P15A.2), 1352-K (P15B) and 1353-K (P15C). These are pure
  laws, not yet wired in.
- **Relationship slice A: LANDED, IN PROGRESS**
  ([1348-L](evidence/p14b4-20260919/1348-L-rel-sliceA-landing.md)).
  - RED r5 at 954a373e: 30 failed, 62 passed.
  - Production 11693bff, 442105f4 and c208d214: recorded GREEN 89 of 92. The 3 failures are 1344-F6 row 6.
  - Its broad gates, and a check of the natural routes at HEAD, ride with the next broad run.
- **Slice A's natural routes:** [1348-X7](evidence/p14b4-20260919/1348-X7-rel-sliceA-natural-routes.md) finds the four
  §7 routes at HEAD byte-identical to §7's runs.
- **Slice B:** [1358-X2](evidence/p14b4-20260919/1358-X2-rel-sliceB-red-r4-dry-run.md) matched r4 exactly. Review
  [1358-D](evidence/p14b4-20260919/1358-D-rel-sliceB-red-r4-review.md) returned REFINE (five blocking items).
  [1358-F4](evidence/p14b4-20260919/1358-F4-parent-rulings-on-1358-D.md) orders r5. After that come dry run 1358-X3,
  confirmation 1358-D2, the RED commit, the mint, and then the recorded RED.
- **P15 Wave 2:**
  - **P15B** probe ([1357-X](evidence/p14b4-20260919/1357-X-p15b-wave2-probe-results.md)): **Re-tune.** On the p13a
    seeds, 7 of 8 rivals are due for closure by 1960, and no rival recovers. No §4.5 value passes the gate.
    [1357-F2](evidence/p14b4-20260919/1357-F2-parent-response-to-1357-X.md) holds Wave 2 at the gate and asks the
    Owner 1357-Q1.
  - **Why rivals stall:** [1357-R](evidence/p14b4-20260919/1357-R-rival-stall-diagnosis.md), with the parent note
    [1357-F3](evidence/p14b4-20260919/1357-F3-parent-note-on-1357-R.md). The shelving law's `cashBlocked` rule
    (1344-A:57) freezes screenplays that lose money at every affordable package. Rivals stop filming with 3-7M above
    their reserve.
  - **P15A.1:** RED r4 CONFIRMED (1355-D4). G1
    ([1355-X4](evidence/p14b4-20260919/1355-X4-p15a1-g1-probe-results.md)) reads Proceed, flagged for the playtest
    brief. Producer dry run 1355-X3 is clean.
  - **P15A.2:** RED r4 CONFIRMED (1356-D4).
  - **P15C:** RED r4 and r5 CONFIRMED
    ([1359-D4](evidence/p14b4-20260919/1359-D4-p15c-wave2-red-r4-r5-confirmation.md)). Producer dry run 1359-X3 is
    clean. G-P ([1359-X4](evidence/p14b4-20260919/1359-X4-p15c-gp-probe-results.md)) returns `artistic-voice` and
    `commercial-engine` to retuning, and
    [1359-F5](evidence/p14b4-20260919/1359-F5-parent-response-to-1359-X4.md) routes the §5.5 amendment.
- **Open Owner items:**
  - 1357-Q1: rival recovery before P15B closure. Recommend (a), starting with the shelving `cashBlocked` fix (1357-F3).
  - numpy for the three rgba rows.
  - P16's nine questions (1354-Q).
  - The §7 flags (1344-V §9).
  - The seven declared exceptions.
  - 1356-X F-2.
  - X12's V39 family.

## CURRENT — Save43 sweep authored and merged in scratch (helpers, g1-g6, parent edits); dry run x2 running detached; P15C Wave 1 landed (1353-L)

State at 2026-09-30 14:49 EDT (20:49 CEST), HEAD d9e253ad plus this update (pushed, remote verified). No recorded run
is active. The parent dry run x2 runs detached in scratch (below). Root `HANDOFF.md` carries the exact resume commands.

- Save43 / shelving (D-1329-1): IN PROGRESS.
  - Core fallout 1344-M; UI fallout 1344-M2 (11 Save43 pins: 8 direct UI sites in 5 files, 3 StudioCalendar rows via
    the helper), 3 numpy rows (1345-E), 4 intermittents; the deep-route row stays open.
  - Sweep authored (1344-C5): helpers and g1-g6 DONE, per group in `/Users/zacheryspector/studio-scratch/1344-sweep/<group>/`
    (tree, PROGRESS.txt, classification.json, deferred.json, patch.diff, handback.md). g6 was finished by a
    continuation agent; its audit of files 1-6 found no rule violation.
  - Merge tree `/Users/zacheryspector/studio-scratch/1344-merge/tree` (base 3a606df4): the seven group patches (disjoint, clean) plus parent commits
    f8c48ec (24 `saveApi('validateSaveV42')` callers in 4 files follow the helper's renamed live key, S1) and becafce
    (the 1344-M2 UI section, S2). The four helpers no group owned need no edit. Type gates before g6: all exit 0.
  - Dry run x2 at merge HEAD a318722, detached, PID in `/Users/zacheryspector/studio-scratch/1344-merge/x2.pid`: type gates, full core (433
    files), UI. Progress in `x2.meta`; expected end about 17:20 EDT if the Mac stays awake.
  - S10 pre-declarations: `/Users/zacheryspector/studio-scratch/1344-sweep/s10/declarations.md`, one section per row with its status.
  - Then: attribute x2 (core vs 1338-I, UI vs 1343-I), S8/S9 rows from measured messages, independent review of the
    S10 declarations before any probe or re-pin, stage `1344-stage/1344-save43-sweep.patch` with classification and
    handback, review 1344-D4, apply, recorded core and UI gates alone on a quiet machine, §7 (stalled route, C8),
    closure 1344-K.
- P15C Wave 1 LANDED (1353-L): RED r4 at c7f3cb76, recorded RED 72 failed / 6 passed of 78; production at 321a4378,
  recorded GREEN 78/78; both fixedSource, every guard exact. Type gates unchanged (19/2/2, the 1352-L lines). IN
  PROGRESS until the broad gates after the sweep.
- Slice A: production verified (1348-X5); lands after the sweep with r5 rebased.
- Slice B: 1358-C handed back; dry run 1358-X, producer mint, r2 and review 1358-D pending.
- P15 Wave 2: P15B probe 1357-P (1357-X) before RED; P15A.1 and P15A.2 REDs; P15C Wave 2 RED (unblocked by 1353-L;
  carry 1353-J note 2 into it).
- Open Owner items: P16 questions (1354-Q); numpy for three rgba rows.
- Disk: 6.2 GB free. Scratch still needed in `/Users/zacheryspector/studio-scratch/`: 1344-sweep, 1344-merge, 1348-x5, 1358-work.

## CURRENT — Save43 fallout measured; P15B Wave 1 landed; all four P15 Wave 2 charters adopted; offline window next

- Save43 / shelving (D-1329-1): IN PROGRESS.
  - Core fallout measured (1344-M): 146 files / 848 tests, 771 new vs 1338. Four rows are environment (a stray
    self-link, since removed, and load).
  - The 42 C8 rows are unchanged after shelving: §7's stalled-route probe must explain them.
  - Sweep plan 1344-N (classes S1-S10), pending its UI section.
  - The UI measurement `1344-save43-broad-ui` was launched in the background before the offline window; check its
    raw, `.json` and postflight.
- P15B Wave 1 LANDED (1352-L): RED 52/52 fail at 5bb8d559, GREEN 52/52 at 3b2dc509, type gates unchanged.
  IN PROGRESS until the broad gates after the sweep.
- Slice A: review 1348-J KEEP. Dry run 1348-X5 is in scratch `1348-x5/`: transition files 42 fail / 29 pass before
  and after step 3; slice A files 49 → 28 fail, the remainder Save43 fallout; root tsc 19 errors, all Save43.
  Landing waits for the sweep, then r5 is rebased.
- Slice B: RED r1 PARTIAL (1358-C), rulings 1358-F (Reading B, the seams). Next: parent dry run 1358-X and the V43
  producer mint.
- P15C Wave 1: production BLOCKED on four RED defects; rulings 1353-F4. RED r4 (1353-C4) has a reference run of 68
  pass / 4 planned fail. The writer's step 3 was in progress at the offline window: check
  `1353-stage/1353-p15c1-production-step3.patch` and the handback's "Step 3" section. Part A (Wave R) dry run pending.
- Wave 2 charters adopted:
  - P15A.1: 1355-A/F/F2/F3; F2 sets one persisted P15 domain sequence and the phase triple.
  - P15A.2: 1356-A/F.
  - P15B: 1357-A/F; its probe 1357-P runs before RED.
  - P15C: 1359-A/F; the validator replays the manifest.
- Lessons this session: export history-only authority for read-only reviewers; new-module REDs need a reference run;
  scratch link steps use `ln -sfn`.
- Open Owner items: the nine P16 questions (1354-Q); numpy for three rgba rows.
- Rules: one heavy test process at a time; no other test process during a recorded run; no commits during a recorded
  run.

## CURRENT — P15A.1 Wave 1 landed (gates pending); shelving production running; P15B charter in review

- P15A.1 Wave 1, the pure shared-market law (D-1323-1), landed (1346-L).
  - Tests: RED r4 at 58d485a1; the recorded RED run fails 35/35.
  - Code: production r2 at 874247eb, with the TUNING comment fix at 3b6cd98c.
  - The recorded GREEN run passes 35/35, source fixed. Reviews 1346-J and 1346-J2: KEEP.
  - IN PROGRESS: the broad core and UI gates, run once together with P15A.2, then attribution and closure.
- Rival shelving (D-1329-1): final RED r2 has 51 leaves (1344-C2). The dry run gives 46 fail and 5 pass (1344-X3).
  Re-review 1344-D2: ACCEPT.
  - IN PROGRESS: sim-core production 1344-E (the single writer).
  - Then: the Save43 sweep measurement (1344-M) and the sweep, the §7 verification, and the recorded gates with the
    .venv PATH (these also confirm U3), then closure.
- P15A.2 Wave 1, the Power Ranking: RED r4 (1351-C4) fixes two test defects and pins the ruling of 1351-F: authored
  pre-campaign films count in no lane. Production r2 passes 35/35 (1351-X5).
  - IN PROGRESS: implementation review 1351-J, then landing.
- Relationship slice A: the RED r3 dry run gives 25 fail and 55 pass (1348-X3). The parent asked for a lawful rival
  employment row in one control, because the validator rejects the spliced row (`hollywoodValidation.ts:201`).
  - IN PROGRESS: 1348-C4.
- P15B, distress, loans and closure (Owner rulings 3 and 4): Wave 0 facts are in 1352-W0. The charter 1352-A sets out
  the condition law v1, the loan law v1, five waves and a measurement gate before live integration.
  - IN PROGRESS: review 1352-B.
- P15C, the 2040 finale and the Legacy dossier (rulings 5 and 6): Wave 0 facts are in 1353-W0.
  - IN PROGRESS: charter draft.
- U3 is applied (8b984d12). The next recorded UI gate confirms it.
- Open Owner question: numpy for the three rgba-export rows, which is not authorized.
- Production order, one writer at a time: shelving, then relationship slice A, then P15B Wave 1.

## CURRENT — U2 closed (1341-K); scoped Pillow (1345-E); Save42 inputs minted; three REDs in staging

- U2 (UI testTimeout 30,000 ms, D-1339-1) is closed as test-harness stabilization. UI gate 1343:
  10 failed / 2682 passed, 4 gone and 0 new against 1339. 21 async leaves on the default budget
  ran 5.0-8.7 s and passed. Reviews 1343-J and 1341-D REFINE, both answered (1343-F, 1341-F).
  One new unhandled error goes to U3.
- U3 (1349-A): the identity-review fake view lacks hollywoodPerformance. Reproduced in scratch;
  a three-line test-double fix passes; review 1349-D pending, then application.
- Pillow (Owner ruling 1): .venv/ with pillow 12.3.0, scoped per command. 8 of the 11 image
  rows pass. 3 rgba-export tool-contract rows need numpy, which is not authorized (open
  question). Gates from now run as: PATH="$PWD/.venv/bin:$PATH" node .../run-bounded-source-c2.mjs ...
- Rival shelving (D-1329-1):
  - charter 1344-A, review 1344-B REFINE, adoption 1344-F;
  - genuine Save42 inputs minted at the last Save42 writer (weeks 100 and 130; 1344-P/PB/X,
    recorded run 1344-save42-rival-stall-mint, fixtures tests/fixtures/p14/genuine-v42-pre-shelving);
  - IN PROGRESS: RED staging 1344-C (test-author). Then sim-core production (one writer),
    Save43 sweep, verification, gates.
- Relationships (D-1312-1/2, HIS-014, ruling 8): charter 1347-A, review 1347-B REFINE, adoption
  1347-F (Mentor rests on the cohort receipt; D5 keeps its order; one projection step in slice
  B). IN PROGRESS: slice A RED staging 1348-C.
- P15A.1 Wave 1 (pure shared-market law, D-1323-1): IN PROGRESS, RED staging 1346-C.
- Production order (one writer): shelving first, then P15A.1 Wave 1, then relationship slice A.

## CURRENT — twelve more Owner rulings (1342-O); U2 in review; rival shelving next

The Owner approved the twelve P14-P18 rulings, kept byte for byte in 1342-O:
- a scoped Pillow install;
- quarterly Power Ranking, formula as tuning;
- the player's studio can fail (this amends the older no-player-bankruptcy wording; pointers
  in DECISIONS.md, OWNER-RULINGS-HOLLYWOOD-HORIZON.md §3 and CLAUDE.md);
- no replacement rivals; a 2040 ceremony and Legacy dossier; an endless sandbox after 2040;
- no near-deadline promise override; one current friendship tier per pair, with conflict
  as evidence;
- P17 #3 and #5 declined; a bounded P18 first-season example;
- no stop at 2026-10-06; protected main stays protected.
With the five of 1340-O, no Owner decision blocks P14-P18. Delegated tuning is written down
and reviewed before it is implemented. The Owner also lifted the two-specialist cap. The
parent keeps one production writer and one heavy test process.

IN PROGRESS: U2 (1341-A: UI project testTimeout 30,000 ms). Plan review 1341-B ACCEPT. Dry
run 1341-X: a 6 s probe passes in UI and still times out in core. The four affected files
pass 81/81 on run 1; run 2 is 80/81, the one failure being 1124-A's findBy wait (not
timing). Review 1341-D is pending, then application and the recorded UI gate.
Next: the Pillow repair after that gate; then the rival-shelving charter (D-1329-1), its
RED, production and verification, before any live shared-market pressure.

## CURRENT — T1 closed LOGIC VERIFIED (1337-K); Owner rulings close all five decisions (1340-O)

T1 (1337-A, two test files) is closed. D17's budget is 300 s, and livingTurn.parity's first
mount waits up to 10 s. Core gate 1338: 79 failed / 4602 passed; D17 gone, 0 new against 1333.
UI gate 1339: 14 failed / 2678 passed. The parity leaf passes; the failures are 10 PIL,
1124-A, and three time-budget rows on App-mount leaves with no budget (CastingReview and World
Inspector first leaves at the 5 s default, plus the World Inspector cascade). Review 1338-J
KEEP. Closure 1337-K: LOGIC VERIFIED · UNITY NOT VERIFIED; not GREEN.

Owner rulings of 2026-09-29, verbatim in 1340-O and indexed in DECISIONS.md:
- D-1329-1: charter and implement bounded rival screenplay shelving;
- D-1323-1: the 1323-A/F shared-market formula; P15A.1 authorized;
- D-1312-1: three distinct recorded casting competitions make conflict evidence;
- D-1312-2: candidate A; separation may decay the romance track;
- HIS-014: Mentor and Professional Rivals label definitions;
- D-1339-1: UI project testTimeout 30,000 ms in vitest.workspace.ts.
Constants in all of them are provisional tuning. The Owner said not to reopen these for routine
implementation details.

Order: U2 (the UI testTimeout, with a recorded UI gate) now; then the rival-shelving charter
and its verification before any shared-market pressure enters the live economy. The P15A.1
sequence and the P14 relationship rules proceed meanwhile up to that integration point.
Owner decisions open: none of the five. P15 §4.3's other items (Power Ranking, closure
asymmetry, later entry, finale, post-2040) remain open for later slices.

## CURRENT — UI repair U1 closed LOGIC VERIFIED (1335-K); UI gate down to 13 (10 PIL)

U1 (1335-A, six UI test files) is closed. Test-only fixes for four clusters:
- C5: the contract test read a Save16 oracle fixture with loadSave, which validates
  without migrating; it now uses the app's migrateToLive path;
- C2: the World Inspector sweep gets a 30 s budget, which ends its duplicate-element
  cascade;
- C1: the named slow leaves get 30 s budgets, and three mount helpers wait up to 10 s
  for the cold lazy Lot chunk;
- C6 needed no edit.
Staging and review:
- plan review 1335-B ACCEPT;
- staged 1335-C/C2 (the Authority file's M1 edit dropped, 1335-F);
- implementation review 1335-D REFINE (documentation, 1335-F2);
- dry run 1335-X: PIL only; applied 88eb90d9.
Recorded UI gate 1336: 13 failed / 2679 passed. None of the 24 U1 targets fails, and the
seven budgeted leaves ran 5.6-24.8 s, each above the old 5 s default. Remaining: 10 PIL
(environment) plus 3 recorded intermittents outside U1's edits:
- livingTurn.parity's first-mount wait (passes alone 3/3; mechanism inferred, 1336-F);
- 1124-A's NextEvent dashboard wait;
- StudioLotScreen:930 focus.
Review 1336-J REFINE, answered in 1336-F. Core unchanged by U1: 80 at 1333.

Next without Owner input: a small timing bundle (parity first-mount wait, D17's 60 s
budget, NextEvent "orients" margin). Everything else waits on the Owner decisions below.
Owner decisions open: D-1329-1 (recommended: charter a rival shelving rule), D-1323-1,
D-1312-1, D-1312-2, HIS-014.

## CURRENT — repair R3 closed LOGIC VERIFIED (1332-K); UI repair U1 in staging

1332-A attributed the ten UNRESOLVED core rows. Scratch bisect: HEAD test bytes over each
commit's src/generated. Ledger (4) and seating preference (3) move at 969fb459 with C8 and
wait on D-1329-1. The other three were repaired test-only (R3):
- promise-digest continuity: the week-208 settlement ranking moved at 969fb459; derived
  from the tick's own receipts, with promise-3/26 pinned;
- checkpoint :65: the expected shape now names the Save40 firstTakeSubjects root and the
  Save41 zero termination movement;
- relationships :546: the counterfactual strip reproduces the frozen digest; the stripped
  root is guarded by validateFirstTakeSubjects.
Reviews 1332-B/D REFINE, both resolved (1332-F/F2/F3); applied 59e2666a. Core gate 1333:
80 failed / 4601 passed, 3 gone. One new row: bridge-p14p3 D17, a load-dependent 60 s
timeout (it runs 97-100 s alone and passes). UI gate 1334: 26 failed on unchanged UI
source. Review 1333-J KEEP. Closure 1332-K: LOGIC VERIFIED · UNITY NOT VERIFIED; not GREEN.

IN PROGRESS: UI repair U1 (1335-A, review 1335-B ACCEPT), in test-author staging:
- C5: the contract test read a Save16 fixture with loadSave (validate only); it now uses
  the app's migrateToLive path;
- C2: a 27-mount World Inspector sweep outruns 5 s, and its still-running body causes the
  duplicate-element rows;
- C1: cold lazy-Lot mounts race findBy's 1000 ms default, and slow leaves exceed 5 s.

Lessons recorded this session (procedures):
- bisect with HEAD tests over old src;
- migrate fixtures before live readers;
- a timed-out Vitest body keeps running, so run the file alone and budget the slow leaf;
- name the baseline of every attribution count;
- re-check additive-schema digest pins by down-projection or counterfactual strip.

Owner decisions open: D-1329-1 (rival stall; recommended: charter a shelving rule),
D-1323-1, D-1312-1, D-1312-2, HIS-014.

## CURRENT — repair R2 closed LOGIC VERIFIED (1327-K); UNRESOLVED rows attributed; repair R3 next

Retained-defect repair R2 (1327-A, tests only, 7 files) is closed: C12 pins from the
recorded projection-56 producer 1328, C15 guard-and-strip reconstructions, C3 by
down-projecting the week-0 save to Save38 against the unchanged CANONICAL_INITIAL_SHA,
and K4 on the live validator (1327-F). Staged 1327-C/C2, dry run 1327-X, review 1327-D
ACCEPT, applied 350f9db5. Recorded core gate 1330: 82 failed / 4599 passed, 11 gone
against 1325, 0 new; L1/L2 now reach their masked cause (noCatalogue, week 607).
Recorded UI gate 1331: 34 failed / 2658 passed on unchanged UI source; 33 in the
1317/1322 sets, the Casting Review first leaf attributed to the C1 cold-mount timing
(it fails alone too). Reviews 1330-J KEEP, 1331-J REFINE applied. Type gates 0/0/0 at
089431d8. Closure 1327-K: LOGIC VERIFIED · UNITY NOT VERIFIED; not GREEN.

Attribution of the 10 UNRESOLVED core rows (scratch bisect, HEAD tests over old src):
- ledger family 12 (4) and seating preference (3) move at 969fb459 (P3 candidate
  order / director preference): week-208 winners reshuffle with frozen settlement
  sentences only (no D5 sentence); long natural runs, so they wait on D-1329-1 with C8.
- promise-digest-continuity :194 moves at 969fb459 on a one-tick genuine207 world:
  promise-3's subject declines on a tie, promise-26's stays with its current employer,
  so their receipts keep week 196. bridge-p14b2-checkpoint :65 and p14b5-relationships
  :546 miss the additive Save40 firstTakeSubjects root and Save41 zero termination
  movement (counterfactual strip reproduces the frozen digest exactly). These three are
  repair R3 (test-only), next.
C16b (P3 D07/D18) stays the frozen failed fixed-rival attempt of 1169-A/B (no rescue
authorized). Owner decisions open: D-1323-1, D-1312-1, D-1312-2, D-1329-1, HIS-014.

## CURRENT — repair R1 closed LOGIC VERIFIED (1324-K); C8 cause measured (D-1329-1); repair R2 in review

Retained-defect repair R1 (1324-A, tests only, 7 files) is closed: staged 1324-C, dry run
1324-X, review 1324-D ACCEPT, applied 57b7bee9. Recorded core gate 1325: 93 failed / 4588
passed, all retained from 1316 (85 same, 8 changed primary with recorded causes), 58 gone
(the 56 C6/C7/C20 targets plus two c2a-m2 leaves with the same v13TwinOf cause), 0 new.
Recorded UI gate 1326: 32 failed / 2660 passed on UI source byte-identical to 1322; every
identity is in the 1317 or 1322 set (C1 timing). Review 1325-J KEEP; type gates pass at
6458955e. Closure 1324-K: LOGIC VERIFIED · UNITY NOT VERIFIED; not GREEN (93 core / 32 UI
open). The p14c3-save-v38 :93 leaf stays retained by design (1324-A rule 4).

C8 (1329-A): 21 of its 42 rows search p13a-core-causal-01 for a satisfied rival promise.
Bisect puts the move at 969fb459 (the accepted P3 candidate order): r01 no longer wins the
week-208 cases whose cast made a held screenplay viable. Underneath, a pre-existing rival
stall: two ready screenplays with no viable package (hollywoodPolicy.ts:67) fill the ready
inventory (hollywoodTick.ts:254), so a rival neither films nor commissions; on this seed all
four rivals stop filming by week 140. No test-only repair; Owner decision D-1329-1 (keep the
law and re-derive fixtures as new fixtures, or charter a shelving rule).

IN PROGRESS: repair R2 (1327-A): C15 (7), C3 (6; the Save38 down-projection of the week-0
save reproduces CANONICAL_INITIAL_SHA exactly), C12 (2; pins from the staged 1328
projection-56 producer after a recorded run). Review 1327-B running.

Owner decisions open: D-1323-1 (P15A.1 formula), D-1312-1, D-1312-2, D-1329-1 (rival
unviable screenplays), Mentor/Rivals labels (HIS-014).

## CURRENT — P15A.1 stopped for Owner decision D-1323-1; retained-defect repair R1 IN PROGRESS

Save42 casting drivers are closed (1319-K; see the block below). The P15A.1 charter (1323-A,
Wave 0 reconnaissance plus a Wave 1 pure-law proposal) was reviewed REFINE (1323-B) and
adopted with amendments (1323-F). The review established that no P15 Owner-ruling
amendment exists: CODEX-P13-P15-OWNER-RULINGS.md §4.3 still lists "the exact shared-market
formula" as an open Owner decision, RECONCILIATION-02 labels itself research not Owner
authority and does not close that line, and the rulings' governance rule (§8) keeps the
open decision until a newer explicit ruling. P15A.1 therefore stops before any RED or code.
P15A.2/P15B/P16 depend on P15A.1 or their own open §4.3 decisions; P18 waits on P16/P17
producers (P18-HEADLESS-CHARTER). The P15 presentation choices D2/D3/D4a were answered on
2026-09-27 (1122-A) and need no further decision.

Owner decisions open (with options in the cited records):
- D-1323-1 exact P15A.1 shared-market formula (1323-F: recommended genre + four-week window
  1.00/0.55/0.55/0.20, saturation stock 0.20 halving every 13 weeks to week 26, one unit per
  release, per-studio window cap, factor 1 − 0.25(1 − e^(−P/2)); or other strengths, window
  only, or delegate to tuning with a Wave 4 playtest).
- D-1312-1 conflict-record source (Enemies/Nemeses), D-1312-2 romance ending rule (romance
  formation waits with it) — 1312-A/1312-F.
- Mentor/Rivals evidence-label definitions (companion §5.3, register HIS-014).

IN PROGRESS: retained-defect repair R1 (1324-A): clusters C6 (v13TwinOf, 25), C7
(firstTakeSubjects fixtures, 23), C20 (migration purity, 9); test-author stages 1324-C, then
parent dry run, review, application, recorded gates. Two specialists, parent writer, one
heavy process; Unity/native deferred.

## CURRENT — Save42 casting drivers closed LOGIC VERIFIED (1319-K); P15A.1 charter next

Production 1b675f75 (castingCompetitionLost/repeatedCompetition, the Inseparable expiry
note, Save42) is closed with its test sweep: RED 1318 (21/13/1), GREEN 1319 (34/1),
contract check 1319b, implementation review 1319-J KEEP; Save42 sweep 1320 (measured
1320-M/M2, 131 files, 500 rows, 1320-D ACCEPT, applied 25501835). Recorded core gate
1321: 151 failed / 4530 passed, exactly 1316's identities (0 new, 0 gone). Recorded UI
gate 1322: 25 failed / 2667 passed; one intermittent focus leaf that predates Save42.
1321-J KEEP; type gates pass at HEAD. Closure 1319-K: LOGIC VERIFIED · UNITY NOT
VERIFIED; not GREEN (151 core / 25 UI retained failures stay open with their causes).

P14B relationship scope left: D-1312-1 (conflict record) and D-1312-2 (romance ending,
romance formation waits with it) for the Owner; Mentor/Rivals labels need authored
definitions (HIS-014); shared awards wait on P08; compaction waits on PERF-010.
Next: the P15A.1 charter (launch-time market pressure over one actual release batch,
RECONCILIATION-02 §7.1-7.3 at c5b52b4d; P15A1-RELEASE-SEAM-NOTES/REVIEW and
P15A1-ORDERING-INVENTORY): batch identity and order, the chronology change and its
controls, reach metric, clamps, coefficients (class C), storage, cold start, previews.
P15A.2 Owner choices D2/D3/D4a do not block it. Two specialists, parent writer, one
heavy process; Unity/native deferred.

## CURRENT — Save42 casting drivers landed (1b675f75); GREEN 34/1; review KEEP; Save42 pin sweep IN PROGRESS

R2/R3 is closed (1311-K, LOGIC VERIFIED, not GREEN; see the block below). The casting RED
(1315-stage5) was applied and recorded on unchanged production: 21 failed, 13 passed, 1
skipped (1318-R). Two RED files that import bridge/*.ts were renamed to tests/bridge-p14b9-*
(10790fa6, content unchanged) so the root type gate stays valid. Production 1b675f75 lands
the reviewed draft: castingCompetitionLost/repeatedCompetition drivers minted once per pair
per admitted player greenlight, the Inseparable contract-expiry note, Save42
(RelationshipEdge.sharedCompetitions; 42->41 refuses to discard a competition). GREEN 1319:
34 passed, 1 skipped (the hollywood === null clause, review-only). Contract --check passes
(projection 56 unchanged). 1319-J: KEEP, no required changes; the queue path is traced.

IN PROGRESS: the Save42 test pin sweep. Measured at the production (1320-M, 1320-M2): 855
core failures (705 new against 1316: 335 live-version literals, 333 live V41 validator
selections, 15 future-version sentinels, 12 hand-built edges without sharedCompetitions,
others) and 12 new UI rows. Plan 1320-A (classes S1-S10); test-author stages 1320-C. Then
parent scratch dry runs, 1320-D review, 1320-E apply, recorded broad gates, attribution
against 1316/1317, 1319-K closure. Open: D-1312-1, D-1312-2; retained 1316/1317 clusters.

## CURRENT — R2/R3 closed LOGIC VERIFIED (1311-K); sweep 1309 landed; casting RED next

The 1309 pin sweep converged at r5 (146 test files, 671 rows; 1309-D2 ACCEPT) and landed
as cd79e85b with the 1308 neighbor change. Recorded broad core gate 1316 on cd79e85b: 151
failed, 4496 passed, guards exact, collection equal to the 417-file allowlist; no failing
identity is new against 1302 (347 of its 498 are gone; 1316-I). Recorded UI gate 1317: 33
failed, 2659 passed; six rows new against 1303 fail the same way on the 1303 source today
(A/B), and runway and mount-time probes match across sources, so they sit with the C1
test time-budget family (1317-I). 1316-J (REFINE, two wording fixes applied) reviewed both;
type gates pass at HEAD; 1311-K closes R2/R3/Save41/projection 56 as LOGIC VERIFIED ·
UNITY NOT VERIFIED. Not GREEN: 151 core and 33 UI
failures stay open with their 1302/1303 causes (C1, C6, C7, C8, C15-C17, C20, UNRESOLVED,
inherited, C12 generator pins). Disk: the parent removed its own scratch copies (1309-X5).

Next, per 1315-F: apply the casting RED (1315-stage5, five files) to tests/, recorded RED
on unchanged production (expect 21 failed, 13 passed, 1 skipped), land the reviewed Save42
draft (1315-X-production-draft.patch, byte-verified against the dry-run tree), GREEN,
implementation review, then the Save42 pin sweep (about 136 toBe(41), 196 validateSaveV41
calls in 68 files, 47 convertV41ToV40 uses, 20 "1 through 41"). Owner decisions open:
D-1312-1, D-1312-2. Two specialists, parent writer, one heavy process; Unity/native deferred.

## CURRENT — sweep review REFINE applied as 1309-F; Save41 casting inputs minted; casting RED staging

1311-J (REFINE) found no code defect in R2/R3/Save41/projection 56; the increment stays
IN PROGRESS until the 1309 sweep is applied and one broad core and UI rerun is attributed.
The staged sweep (1309-C, 115 files) type-checks root-clean in scratch (1309-X) with three
Bridge errors. 1309-D (REFINE) confirmed items 1-7, disproved item 8's swap (no wire-valid
draft reaches "not offered in this slice"), and found about 23 more files that feed live
saves to validateSaveV40. 1309-F adopts all changes and rules on item 8 (retitled to P3
law, measured ok:true), item 8b (two UNRESOLVED 1302 rows with the same stale directing
refusal, measured text), item 9 (rival-authoring expectation computed in-test from
authorRivalPromise, no literals) and item 10. IN PROGRESS: 1309-C2 revision (test-author).

Casting drivers: 1313-B (REFINE) reviewed 1313-A; 1313-F adopts it with the seam inside
applyGreenlight, one competition per pair per admitted production (ref = production id),
re-greenlight after cancel counts again, and the expiry note built from edges. 1314-P
measured a public-action route through a real casting session to release. Producer 1314
(r2 after 1314-B) ran once on acb2d472 under the bounded recorder (exit 0, all guards
exact); tests/fixtures/p14/genuine-v41-pre-casting-drivers holds the acknowledged (week 10)
and released (week 19) inputs; closure 1314-K. IN PROGRESS: 1315-C RED staging
(test-author). Owner decisions open: D-1312-1 (conflict record), D-1312-2 (romance end).

Next: parent scratch dry run of 1309-C2, 1309-D2 review, 1309-E apply with the 1308
neighbor (applies over the sweep, offset 3), broad core (417-file allowlist, collection
proof re-checked at HEAD: 423 tracked, 6 excluded) and UI gates, attribution, 1311-K;
then the 1315 RED recorded run, Save42 production, GREEN, Save42 pin sweep. Two
specialists, parent writer, one heavy process; Unity/native/Owner deferred.

## CURRENT — R2/R3 production landed (Save41, projection 56); GREEN 46/46; sweep 1309 next

Production commit f3f8c209 lands R2 (release refused during the founding draft and for
a person seated on an active production, engine and Bridge, codes `foundingDraft` and
`seatedOnActiveProduction`; the release copy states the charge's two branches), R3 (a
rival releases unretained non-Scientist surplus under the player's termination law, new
rival money kind `termination`, same-pass free agency, R1 floor on its re-hire) and
Save41 (live validator reconciles rival termination per period; frozen readers keep the
old law; 41→40 refuses a real release). Projection 56 registers genuine outgoing55
(1307) as a prior. RED 1310 on unchanged production failed 32 exactly as predicted;
GREEN 1311 passed 46 with 2 honest skips; contract check 1311b passes. The measured
scientist deficit probe (1308-Q) does not witness under-hiring; no correction follows.
IN PROGRESS: 1311-J implementation review; 1309 pin sweep (1309-A plan, test-author
staging) including 15 test-side type errors (1311-T), then 1309-D review, 1309-E apply
with the p14b6 neighbor change, one broad core and UI rerun attributed against
1302-I/1303-I. Open: premise clusters C6/C7/C8/C15/C16/C17/C20, rival material policy,
R3 skipped leaves (promise, cash). Two specialists, parent writer, one heavy process.

## CURRENT — 1302/1303 attributed; R2+R3 production increment next

Broad core gate 1302 on 993e6b01: 411 files, 96 failed files, 498 failed, 4102
passed, 11 todo, exact collection proof. UI gate 1303 on 42f216e8: 10 failed
files, 31 failed, 2661 passed, 5 skipped. 1302-I/J (KEEP) and 1303-I attribute
every case by identity; parent 1302-K closes 1302. No production defect is
established. Most failures are stale test infrastructure from the Save39/40 and
projection-55 bumps that 1301 missed: tests/helpers saveVersion 38 literals,
validateSaveV38 selection on live saves, namespaced live pins. The two flagged
rival-authoring failures (trust-chooser :620, cast-class-policy :452) trace to
the P3 and opportunity candidate widening (969fb459, ef38cf9a) landing without a
neighbor sweep; their test update becomes the RED witness. 1303-J review runs.

Genuine outgoing Save40 inputs are minted (1306/1306b, 1306-K; the r2 premise
failure is preserved in 1306-C). R2 (1304-A..D) and R3 (1305-A..D) are reviewed.
The parent lands them as one production increment with Save41 and projection 56,
then one combined 41/56 pin sweep (1301 rows, 1302-I class a, the 1305-D gap,
the widened rival-authoring sequence), then one broad rerun attributed against
1302-I/1303-I. Scientist under-hiring stays a hypothesis until its witness runs.
Deviation: three specialists ran briefly at once while resuming 1306-B; no
writes overlapped. IN PROGRESS: R2, R3, rival material policy. Two specialists,
parent live writer, one heavy process; Unity/native/Owner deferred.

## CURRENT — 1301 live-pin maintenance applied; broad gates 1302/1303 next

Parent applied the reviewed 1301 final patch (1301-C/C2, independent 1301-D KEEP,
parent 1301-E): 74 test files, 188 lines, digit-only changes of stale live
literals (save 40, projection 55, first unknown save version 41) with historical
readers, provenance, downgrade targets and receipts kept. Retained for broad-run
attribution: the scientist-runtime validator selection (test defect), the C#
generator hash pin and unpatterned pin forms. Next, no commit until both posts of
a gate close: 1302 collection proof pre, bounded pre (advanceCap -1 label), the
411-path core command, bounded post, collection proof post; then 1303 UI.
IN PROGRESS: R2 busy-set release refusal (a Core requirement never implemented,
tests/p14a1-firing.test.ts:59) is drafted for after the baseline; R3 rival release
and rival material policy remain open. Same two specialists, parent live writer,
one heavy process; Unity/native/Owner deferred.

## CURRENT — 1300 Save30 compatibility qualified; 1301 maintenance staging

Gate 1300 on published 52c95a3f: 36 passed (36), zero filtered, child0, fixed
source, 79.96s. Bounded and 1299-C companion pre/post closed (28 manual rows,
nine decoded generated inputs). 1299-I attribution, independent 1299-J KEEP and
parent 1299-K close it. Only the corrected test differs from the 1294b compiler
source over the consumed roots; no compiler rerun. Classless historical promises
keep original receipts through strict29, 29→30 and live migration. Not qualified:
a 40→39 loss discriminator, modern material behavior, deferred Bridge-waiver leaves.

1301-A/B/F adopt a cause-scoped live-pin maintenance increment (three-class
inventory: 56 direct, 26 projection-form, 118 derived saveVersion candidates in
86 files) before one broad core gate 1302 (411 files, six 1296-A exclusions,
pre/post collection proof) and UI gate 1303 (204 files). Test-author stages
1301-C; contract-auditor reviews D; parent applies E. IN PROGRESS: rival material
policy and R3 rival early release remain open. Same two specialists, parent live
writer, one heavy process; Unity/native/Owner deferred.

## CURRENT — 1299 Save30 correction applied; gate1300 next

Parent applied reviewed 1299-C/D (KEEP) on published 2bb5326e: one hunk in
tests/p14b4-save-v30-compatibility.test.ts, title literal37→40 and toBe(38)→
toBe(40), 25,226 bytes / f7f97c67. 1299-E records the rehashed manifest, inverse
proof and companion checks the read-only reviewer could not run. Next, with no
commit until both posts close: bounded pre cap0, companion 1299-C pre
(P14_SAVE30_EXPECTED_HEAD = this published HEAD, P14_SAVE30_GUARD_SHA256 =
97d5695b...), the exact 36-case command, bounded post, companion post. The 1297
companion stays frozen to 1298. IN PROGRESS: a source sweep found about 58
direct live-constant pins (saveVersion 38/39, projection 53/54 against live
40/55) in about 40 other tests; a cause-scoped reviewed maintenance increment
precedes one broad core(411 files, six 1296-A exclusions)/UI(204) regression.
Rival material policy and R3 rival early release remain open. Same two
specialists, parent live writer, one heavy process; Unity/native/Owner deferred.

## CURRENT — 1298 legacy neighbors closed; 1299 Save30 correction adopted

Claude parent took over after Codex exhausted its allowance. 1297-K records the
ownership check: Codex pid71871 idle, no child process or open repository file;
recheck ps before any recorded run. 1298 PASS on ea46f8b8: two files, 13 passed,
one filtered winning-freeze leaf, child0, fixed source, bounded and companion
pre/post closed. 1297-I attribution and independent 1297-J KEEP; parent 1297-K
rejoined every record and the 1294b inventory (1139 source/555 excluded). The
pasted Codex TypeError was a parser defect, not a test result.

1299-A/B/F adopt one hunk in the Save30 compatibility test: title literal37→40 and
toBe(38)→toBe(40). Historical readers, receipts and frozen fixtures keep their
original versions. Next: test-author 1299-C stage plus an exclusive gate1300
companion, contract-auditor 1299-D, parent E and publication, then 1300 (36
selected/0 filtered, cap0). No compiler for two literals (1299-F). IN PROGRESS:
broader core/Bridge/UI and rival material policy remain open. Same two specialists,
parent live writer, one heavy process; 1296 access boundaries stand. Unity/native/
Owner deferred.

## CURRENT — Q25 published; legacy-neighbor gate released

Q25 I/J/K closure is published39082d35a537c26d9d8352b1c5076098f15fdf99.
1297-C/D/E companion is reviewed/adopted for the next1298 gate only: two exact
existing files, expected13 selected/one filtered, zero advances by source-route
accounting. Publish this checkpoint, then bounded pre0 → companion pre → exact
manifest command → actual bounded post exit → companion post. Bind the companion
to this published HEAD and its reviewed4a7e9467 hash. All17 manual files/three
explicit generated inputs stay exact. Source inventory must equal1294b before
attributing that compiler; no extra types run for documentation alone.

1299 source-only planning found a stale live-version38 assertion in the existing
Save30 compatibility test (actual live40). A narrow reviewed correction and full
historical compatibility selection are next; historical reader expectations stay
literal. No1299 edit or runtime yet. Broader core/Bridge/UI and rival material
policy remain open. Same two specialists, parent live writer, one heavy process;
corrected access boundaries remain. Continue program; Unity/native/Owner deferred.

## CURRENT — Post capacity qualified; bounded legacy neighbors next

Executed/published a30f86f2fead8b3f7d9e6b9e3e9cfd5bd10ce323 matched GitHub.
1294b root types PASS35.601s;1295 Q25 PASS1/zero filtered22.078s recorder,
17.113s leaf. Original1294 compiler FAIL39.704s and reviewed local-const G/H
correction remain preserved.1293-I/J/K close two ordinary312→314 advances,
five public actions/two identical pure P4crime quotes. Both held films take313
and enter post at returned314 (wrap/events stamped313). Cancellation frees post0;
FRAGILE becomes RA while all other facilities stay free. Full111 old/two new
player takes,69 promise authorities, six relationship changes and studio trust
fallback remain joined. Ordinary unrelated lifecycle/industry changes are retained.
Twenty-five core leaves passed across seventeen separate selections, not a
combined/full suite. No player release or completion of the locked finishing crew.

Both successful gates used the corrected bounded helpers:1139 automatic source
files,555 excluded payload paths,295 explicit manual pins/nine decoded inputs.
Recorded source/index/stage and all in-scope pins remained exact.1296-B's historical
Owner-fixture hash error and six runtime collection exclusions/holds still stand;
never rerun the old broad inventory guards.

Publish closure plus reviewed1297 companion, then1298 legacy neighbors(cap0):
two fixed files,13 selected/one filtered. Use bounded pre, companion pre, exact
recorder command, actual bounded post exit, companion post. Cap0 is source-route
accounting, not a new measured counter. Attribute1294b compiler only after proving
unchanged code. Parent owns live integration/production and one heavy lane; same
two retained specialists own test/review separately. P15 ordering inventory remains
source preparation. Continue the authorized program; Unity/native/Owner deferred.

## CURRENT — Q25 type correction applied; compiler retry next

Original1294 FAIL remains published2e1543ff, with no runtime executed.
Parent applied independently reviewed1293-G/H: one checked local const and three
callback references, exact50,088-byte source3527d346. The full inverse preserves
every assertion, action, bound and timeout. Publish then1294b types(cap0); only
PASS plus closed bounded guards releases first1295 Q25(cap2).1293 parent type
application records75 pins/58 unchanged protected source images.

Use the corrected bounded helpers and explicit P14 inputs;1296-B preserves the
historical access error. Same two test/review specialists, parent live writer,
one heavy process. After Q25 closure, adopted1297 neighbors require the reviewed
companion guard. P15 ordering inventory is preparation only. Continue the
program; Unity/native and Owner campaigns deferred.

## CURRENT — Q25 compiler failure retained; minimal type fix next

Published e33b4b53 contains the reviewed Q25 source and future1297/P15 notes.
1294 root types FAIL39.704s: three narrowing diagnostics on the captured
`initial` variable inside lockedPeople's callback. The actual bounded postflight
passed within its1139-source/555-excluded scope.1293-initial-types-failure.md
preserves the diagnostics and record; runtime1295 has not run.

The test author prepares a local-const narrowing correction; independent1293-H
review precedes parent application/publication,1294b types0 and first1295 runtime2.
Original expectations/timeouts/C/D/stage remain frozen. No old gate or producer
is repeated. Parent retains live integration and one heavy lane; the same two
specialists own test/review separately. Use only bounded guards and explicit
P14 inputs;1296-B access correction and six collection exclusions remain.
After actual Q25 closure, adopted1297 neighbors require their reviewed companion
guard. Continue the authorized program; Unity/native and Owner campaigns deferred.

## CURRENT — Post-capacity source applied; Q25 gates next

Parent applied reviewed1293-C/D on published6d332e85.1293-E records the exact
50,058-byte standalone test0b3907b1,74 manifest pins and58 unchanged protected
source images. Publish then1294 types(cap0),1295 isolatedQ25(cap2): four existing
task actions at312, two ordinary advances to314, two identical P4crime queries
around one post-take cancellation. Full post reservations, take history, set
wear, six relationship edges and public trust fallback are runtime premises;
the new leaf has a60s declaration. Twenty-four earlier leaves passed across
sixteen separate selections; no combined/full-suite claim.

Use only reviewed bounded helpers: automatic reads/diffs exclude fixtures,
UI e2e and public payloads; authorized P14 manual inputs remain explicit.
1296-B preserves the inherited Owner-fixture hashing error and historical guard
limits. The six collection exclusions/holds in1296-A remain. No old gate repeats.

1297-A/B/F adopts two bounded historical-neighbor files after Q25 closure; its
extra manual-input guard must be concretely reviewed before execution. P15A1
release-seam notes and independent review are preparation, with same-week rival
ordering and RNG constraints still requiring a concrete implementation contract.
The natural208 rival appendix adds no viable trigger or positive witness.
Parent owns live production/integration and one heavy lane; the same two
specialists retain separate test/review ownership. Continue the authorized
program. P17 choices remain recorded; Unity/native and Owner campaigns deferred.

## CURRENT — Scenery capacity qualified; post-capacity source next

Published/executed d2f55dd93ca9e3f9c11ca1287bada47788b5cedf matched GitHub.
1291 root types PASS37.722s;1292 Q24 PASS1/zero filtered8.870s recorder,
4.790s leaf.1290-I/J/K close four public set actions/two identical pure P5crime
quotes/zero advances. Filling scenery slot1 changes RA to exact scenery-capacity
FRAGILE while all other facilities stay free. Full refunds/capex/retired sets,
Actor/target/union and all19 old takes remain exact. Twenty-four core leaves have
passed across sixteen separate selections, not one combined/full suite.

ACCESS CORRECTION: inherited automatic guards hashed committed Owner-derived
fixture bytes.1296-B records the mistake; previous blanket no-access wording
must not cover those hashes. The actual1292 post checked1193 files and274 P14
manual pins, excluded500 fixture/e2e paths, and reports allGuardsExact:false /
boundedGuardsExact:true. Do not rerun old full-inventory helpers or audits.
Future gates use evidence/p14b4-20260919/run-bounded-source-c2.mjs and
run-bounded-source-guards.py: exclude fixture/e2e/public payloads automatically,
keep explicitly authorized P14 inputs separate, and scope Git diffs likewise.
1296-A's six collection exclusions/holds remain; this is no full-suite claim.

Begin1293-C under adoptedA/B/F including public trust-descriptor fallback:
five fixed actions/two ordinary advances312→314/two identical P4crime quotes.
IndependentD then parent publication,1294types(cap0),1295runtime(cap2). Parent
owns live integration/production and one heavy lane; same two specialists keep
separate test/review ownership. P15A1 source notes remain a parent draft awaiting
review. P17 choices/paper limits remain recorded. Continue the authorized program;
Unity/native and Owner campaigns remain deferred.

## CURRENT — Scenery source applied; Q24 gates next

Parent applied exact1290-C/D on published46c356bb.1290-E records one new
25,606-byte standalone test439cda26,63 manifest pins and55 unchanged protected
files. Publish then1291 root types(cap0),1292 isolatedQ24(cap0): four fixed public
set actions and two identical pure P5crime quotes at actual45, with a new60s leaf.
Exact refunds/capex, retained retired sets, full claims and unchanged other free
facilities must distinguish scenery capacity. These are unexecuted premises.
Twenty-three earlier core leaves passed across fifteen separate selections.

1293 post-capacity A/B/F is adopted with the public trust-descriptor fallback
clarification; source starts after Q24 closure. Parent owns live integration,
production and one heavy lane; the same two specialists retain separate test/review
roles. No older producer or completed gate is repeated. P17's three decisions and
paper reproduction limits remain recorded. Continue the authorized program;
Unity/native and Owner campaigns remain deferred.

## CURRENT — Queued project outcome qualified; scenery source next

Executed/published65bf39140429ddf0934be94c5e9fe3c9fe2f3c6c matched GitHub.
1288 root types PASS36.414s;1289 Q23 PASS1/zero filtered14.855s recorder,
10.143s leaf. All1,692 source files,261 manual pins,index/stage and fixed-source
checks stayed exact.1287-I/J/K close eight develop:true45→53 advances, six
public attempts (five accepted and one expected duplicate-Actor refusal), one
direct quote and one ordinary queue observation. Refusal and queue52 preserve
the open P5. Actual53 delivery frees both draft slots; queue commitment links
prod0053 and breaks the promised lead once while the beneficiary plays support.
Film debit and ordinary payroll/overhead reconcile;19 old takes and one actual
rival48 subject remain joined. Twenty-three core leaves passed across fifteen
separate selections, not a combined/full suite.

Begin1290-C scenery source under adoptedA/B/F: same actual45, four fixed public
set actions/two identical pure P5crime quotes/hard0advances. IndependentD precedes
parent publication,1291types(cap0),1292runtime(cap0).1293 post-capacity planning
remains source-only. Parent owns live integration/production and one heavy lane;
same two specialists retain separate test/review roles. P17 selected choices and
canonical paper reproduction remain recorded with explicit engine/balance limits;
P18 charter is source-reviewed and unspecified TV rules remain proposed. Continue
the authorized program. Unity/native and Owner campaigns remain deferred.

## CURRENT — Queued-project source applied; Q23 gates next

Parent applied exact1287-C/D on published8626030c.1287-E records one new
46,898-byte standalone test e1a4c078,61 manifest pins and53 unchanged protected
files. Publish then1288 root types(cap0),1289 isolatedQ23(cap8): eight actual
develop:true45→53 advances, six public attempts (five accepted plus one expected
duplicate-Actor refusal), one direct promise quote and one forwarded ordinary
queue commitment. The refused and queued52 requests must preserve the open P5;
only real53 commitment may produce its wrong-lead outcome. These remain runtime
premises, with a new60s leaf declaration. Twenty-two earlier core leaves are
qualified across fourteen separate selections; no full-suite claim.

Independent review of1290 scenery planning follows; its source and execution
remain unreleased until parent adoption. Source-only1293 post planning uses the
known35 actual312 input. Parent owns live integration/production and one heavy
lane; the same two specialists retain separate test/review roles. P17 choices
and reviewed paper reproduction remain recorded with engine/balance limits;
P18 charter is source-reviewed and unspecified TV rules proposed. Continue the
authorized program. Unity/native and Owner campaigns remain deferred.

## CURRENT — Soundstage capacity qualified; queued outcome source next

Executed/published3fa911cb5fcfc738d108d69386a5e8eb2ac8cb5b matched GitHub.
1285 root types PASS35.594s;1286 Q22 PASS1/zero filtered11.038s recorder,
6.234s leaf. All1,691 source files,249 manual pins,index/stage and fixed-source
checks stayed exact.1284-I/J/K close one accepted public cancellation/two pure
quotes/hard0advances at actual312. Identical crime opportunity changes from
soundstage-capacity FRAGILE to RA; all five crime concepts and their clocks stay
exact. Four of11 claims release; the other seven, locked technology, finishing
records, all111 old takes/69 roots and cutover111/facts[] remain. Scenery was also
full initially, so its isolated first cause remains separate. Twenty-two core
leaves passed across fourteen separate selections, not a combined/full suite.

Begin1287-C under acceptedA/B/F: actual45, hard8develop:true advances to53,
six public attempts including one intentional duplicate-actor refusal, five
accepted mutations and one direct promise preview. The queued52 greenlight must
mint no outcome; actual53 dequeue/commit must cause the exact wrong-seat P5
outcome once. IndependentD precedes parent publication,1288types(cap0) and
1289runtime(cap8). Parent owns live integration/production and one heavy lane;
same two specialists retain test/review roles. Separate scenery/post source-only
candidates still need concrete plans/review; no later execution is released.
P17's three selected choices remain adopted; canonical paper reproduction and
independent review are separately recorded with engine/balance limits. Required
P18 charter is source-reviewed; unspecified TV rules remain proposed. Continue
the authorized program; Unity/native and Owner campaigns deferred.

## CURRENT — Soundstage source applied; Q22 gates next

Parent applied exact1284-C/D on publishedf6c7343e.1284-E records one new
27,651-byte standalone test a858733f,59 manifest pins and48 unchanged protected
files. Publish then1285 root types(cap0),1286 isolatedQ22(cap0): two identical
P4 crime quotes around one public cancellation at genuine actual312, new60s
leaf timeout. Full11→7 claims, five unchanged stock crime candidates, locked
technology and finishing-record preservation remain runtime premises to prove.
Twenty-one earlier core leaves are qualified across thirteen separate selections.

After Q22 closure begin accepted1287 queued/refused project-outcome source under
A/B/F. Parent owns live integration/production and one heavy lane; the same two
specialists retain separate test/review roles. P17 healthy reboots,35% Recognition
floor and Legacy Sequel as dormant Direct Sequel remain adopted. Its canonical
paper reproduction is tracked separately, with no engine/balance claim. Required
P18 charter is source-reviewed; unspecified TV rules remain proposed. Continue the
authorized program; Unity/native and Owner campaigns remain deferred.

## CURRENT — Delayed retirement qualified; soundstage source next

Executed/published4d2aca744f15a73b45589d4d97b717f831209373 matched GitHub.
1282 root types PASS34.891s;1283 Q21 PASS1/zero filtered45.602s recorder,
40.661s leaf. All1,690 source files,238 manual pins,index/stage and fixed-source
checks stayed exact.1281-I/J/K close59 actual develop:true45→104 advances,
five accepted mutations/four explicit quotes/seven complete caches. Actual104
Actor70 retirement announcement/effective156 and held unassigned work support
the public-waiver comparison: common take105→144/release109→148 changes the
identical P5 request from RA to timing-FRAGILE despite27 weeks of uncapped slack.
Actual104 admission queries allow147 and refuse148. Future dates are derived or
query evidence; no player take or retirement completion occurred. All19 old
receipts and25 new rival subjects remain joined. Twenty-one core leaves passed
across thirteen separate selections, not a combined/full suite.

Begin1284-C under acceptedA/B: genuine35 actual312, two identical crime P4 quotes,
one public cancellation, hard0advances. Require full initial11-claim census,
unchanged five crime candidates and exact release of one production's claims;
retained locked technology and finishing records remain. IndependentD precedes
parent application/publication,1285types(cap0),1286runtime(cap0). Then1287 queued/
refused project outcome underA/B/F. Parent owns live integration/production and
one heavy lane; the same two specialists retain separate test/review ownership.
P17 healthy reboots,35% Recognition floor and Legacy Sequel as dormant Direct
Sequel remain adopted; no P17 question is pending. Required P18 charter is
source-reviewed; unspecified TV rules remain proposed. Continue the authorized
program; Unity/native and Owner campaigns deferred, all prior limits preserved.

## CURRENT — Delayed-retirement source applied; Q21 gates next

Parent applied exact1281-C/D on publishedbf8ac29f.1281-E records one new
42,810-byte standalone testd7de5234,52 verified manifest pins and46 unchanged
protected files. Publish then1282 root types(cap0),1283 isolatedQ21(cap59):
59 real develop:true advances45→104, five public mutations/four explicit previews,
new-leaf180s timeout. Require real104 announcement/effective156 and held work
before the prospective109/147/148 admission and public-waiver comparison. The
market-receipt assertion was corrected before source freeze; no runtime failure.
Actual settlement, held104, retirement and query outcomes remain unexecuted.
Twenty earlier core leaves remain qualified across twelve separate selections.

After Q21 closure begin accepted1284 soundstage source, then1287 queued/refused
project outcome underA/B/F. Parent owns live integration/production and one heavy
lane; same two specialists retain separate test/review roles. P17 report read
complete; healthy reboots,35% Recognition floor and Legacy Sequel as a dormant
Direct Sequel are adopted. No P17 question from this session remains pending.
The required P18 charter is source-reviewed and published under plans; its season,
platform and economic rules remain proposed. Continue authorized program;
Unity/native and Owner campaigns deferred, all earlier failures/limits retained.

## CURRENT — Casting reservation qualified; delayed retirement source next

Executed/publishedf0b3ff98dad6fbe1dd314c559fdb997b19f9347f matched GitHub.
1279 root types PASS36.024s;1280 Q20 PASS1/zero filtered8.486s recorder,
4.086s leaf. All1,689 source files,227 manual pins,index/stage and fixed-source
checks stayed exact.1278-I/J/K close three accepted public actions/four pureP5
quotes at actual45, hard0advances. With casting slot0 and unrelated drafting
slot1 both due46, the identical unrelated Ready request becomes capacity-FRAGILE;
the audition target stays RA after exempting only its own casting reservation.
Whole40/purity, original19 receipts/cutover19/facts[], contracts, cash and ledger
remain exact. No actual46 completion, cast award, take or release is claimed.
Twenty core leaves passed across twelve separate selections, not a full suite.

Begin1281-C under acceptedA/B: genuine1171actual45, hard59develop:true advances
to104, five public mutations/four explicit previews. Require actual104 Actor70
announcement/effective156 and held work, then a public waiver moving its witness
take to144/release148 and real prospective retirement readmission refusal. New
leaf timeout180s is a prospective implementation budget; existing timeouts stay
unchanged. IndependentD precedes parent application/publication,1282types(cap0),
1283runtime(cap59). Then1284 soundstage and1287 queued/refused underA/B/F. No
later source/execution release. Parent owns live integration/production and one
heavy lane; same two specialists retain separate test/review roles. P17 report
read complete; healthy reboots,35% Recognition floor and Legacy Sequel as a
dormant Direct Sequel are adopted. No P17 question from this session is pending.
The required P18 finite charter is source-reviewed at plans/P18-HEADLESS-CHARTER.md;
season/platform economics remain proposed and no TV implementation is released.
Continue authorized program. Unity/native and Owner campaigns remain deferred;
all prior failures and qualification limits remain recorded.

## CURRENT — Casting-reservation source applied; Q20 gates next

Parent applied exact1278-C/D on publishedfb58f92d.1278-E records one new
24,532-byte standalone test9157ad0c,51 verified manifest pins and45 unchanged
protected files. Publish then1279 root types(cap0) and1280 isolatedQ20(cap0):
three public actions/four pureP5quotes at actual45, no engine advances. Actual
casting slot0 and unrelated screenplay slot1 both due46 must isolate only the
target audition's reservation exemption; no actual46/result/take is claimed.
Nineteen prior core leaves remain qualified across eleven separate selections.

After Q20 closure, begin accepted1281 delayed-retirement source, then1284
soundstage and1287 queued/refused project-outcome source under acceptedA/B/F.
No later source/execution release yet. Parent owns live integration/production
and the one heavy lane; the same two specialists retain test/review ownership.
Read-only rival-policy notes preserve the open actual offer/staffing gap without
an alternate failed1169 route. P17 canonical report is now fully read; healthy
reboots and35% Recognition floor are adopted, Legacy Sequel question pending.
Continue the authorized program. Unity/native and Owner campaigns remain deferred;
all inherited failures and limits remain recorded.

## CURRENT — Shared committed witnesses qualified; casting reservation source next

Executed/published431b1252edcfba80d5a2fcfa9587e4deb071bc17 matched GitHub.
1276 root types PASS35.099s;1277 Q19 PASS1/zero filtered15.175s recorder,
11.142s leaf. All1,688 source files,216 manual pins,index/stage and fixed-source
checks stayed exact.1275-I/J/K close eight default-false advances52→60, six
accepted actions/two P1 waivers, eight pure quotes and seven complete caches.
One shared production has common take61/release65 initially, then prospective
81/85 after waiver; same-person fresh90 gives due90 timing-FRAGILE, due97 slack7
FRAGILE and due98 slack8 RA. Second waiver leaves individually feasible windows
[81,101)/[61,81) without one common take; unchanged idle control becomes FRAGILE.
Old4 previews/receipts stay distinct from new7 clocks. No player take occurred;
all20 old receipts and four new rival facts remain exact. Nineteen core leaves
passed across eleven separate selections, not a combined/full suite.

Begin1278-C under acceptedA/B: existing1171 actual45, hard0advances, three public
actions and four pureP5quotes to isolate a casting session's own due46 reservation
exemption under real congestion. IndependentD precedes parent application,
publication,1279types(cap0) and1280runtime(cap0). Then1281 delayed retirement and
1284 soundstage. Future1287 queued/refused project-outcome plan is accepted
underA/B/F, source-unreleased. Parent owns live integration/production and one heavy
lane; same two specialists retain separate test/review roles. Continue authorized
program. P17 reboot/35% Recognition choices adopted; Legacy Sequel question
pending. Unity/native and Owner campaigns deferred; all earlier limits retained.

## CURRENT — Grouped-witness source applied; Q19 gates next

Parent applied exact1275-C/D on published2676eaf9.1275-E records one new
46,119-byte standalone test781937cd,51 verified manifest pins and44 unchanged
protected files. Publish then1276 root types(cap0),1277 isolatedQ19(cap8): eight
default-false advances52→60, six public actions including two actual P1 waivers,
and eight explicit pure quotes. Shared-production common-window and delayed-release
expectations remain unexecuted. No later61/81/85/90 take or release is simulated.
Eighteen earlier leaves remain qualified across ten separate selections.

After Q19 closure, begin accepted1278 casting-reservation source, then1281 delayed
retirement and newly reviewed1284-A/B soundstage-capacity control. Future1284 is
two identical crime quotes around one isolated-test public cancellation, zero
advances; retained locked technology and between-actions finishing records remain.
No future source/execution release yet. Parent owns live integration/production
and one heavy lane; same two specialists retain separate test/review ownership.
P17 healthy reboots with fatigue and35% Recognition floor are adopted. The separate
Legacy Sequel classification question is pending. Continue authorized program;
Unity/native and Owner campaigns deferred, all earlier failures/limits retained.

## CURRENT — Existing finishing work qualified; grouped-witness source next

Executed/publishedfb8f4a2210bb56803c851e133ac61075b34bb041 matched GitHub.
1273 root types PASS33.573s;1274 Q18 PASS1/zero filtered11.280s recorder,
7.006s leaf. All1,687 source files,205 manual pins,index/stage and fixed-source
checks stayed exact.1272-I/J/K close five pure P4 quotes, two accepted existing-task
actions and exactly one default-false312→313 advance. Actor0000 held drama remains
available despite retirement closing fresh cast work; Director0003's current
profession finishing record closes fresh cast admission with no Actor record.
Actual scenery arrival/ready/scheduled/taskcompletion occurred; prod0000 took at313
and moved5→4. Sole new fact is event111/c00/drama/null screenplay, no new rival take.
All111 old receipts and69 old promises persist; both finishing records remain.
Eighteen core leaves passed across ten separate selections, not one full suite.
No production change; historical funded/reproduced provenance and limits retained.

Begin1275-C under acceptedA/B: genuine31bound52, hard8advances52→60,
four production actions plus two actual P1 waivers, eight explicit pure quotes.
Require shared production/common-window and delayed-release evidence; no later
simulated81/85/90 and no retirement claim. IndependentD precedes integration,
publication,1276types(cap0) and1277runtime(cap8). Then accepted1278 casting and
1281 delayed-retirement plans; no source release for those yet. Parent owns live
integration/production and the only heavy lane; same two specialists retain test
and independent review. Continue authorized program with recoverable checkpoints.
P17 user choices are now adopted: healthy-franchise reboots remain legal with
property-wide fatigue, and Recognition keeps35% of its quality-qualified peak.
See P17-RECOVERED-SPECIFICATION-STATE.md; settled P15 choices stand. Unity/native and Owner access remain deferred.

## CURRENT — Finishing source applied; Q18 gates next

Parent applied exact1272-C/D on publishedbb40a99a.1272-E records the sole new
30,044-byte test6ac09967,52 verified manifest pins and39 unchanged protected files.
The complete seven-facility census was corrected during source review; original
provisional source is retained, with no runtime failure claimed. Publish then1273
root types(cap0),1274 isolatedQ18(cap1): five pure P4 quotes, two existing-task
public actions and one default-false312→313 advance. Actual finishing/current-role
refusal, task admission and take outcomes remain unexecuted. Original historical
funding/reproduction provenance, negative cash and111 old receipts stay protected.

Seventeen core leaves are qualified across nine earlier separate selections;
1269-I/J/K closedQ17. After1272 closure begin accepted1275 grouping source, then
1278 casting-reservation source, then newly reviewed1281-A/B delayed-release
retirement plan.1281 proposes59 real advances/five actions/four explicit previews;
no source/execution release yet. One production/integration writer, same two
staged-test/review specialists, one parent-owned heavy process remain in force.

Published P17 revision02 f2eff6356fca3e6d5287e690bf2404867d638906 was recovered
by object-only fetch without changing branch/worktree. Parent read§19; see
P17-RECOVERED-SPECIFICATION-STATE.md. Healthy-reboot legality and Recognition-floor
product questions are pending user answers; P14 continues independently. Settled
P15 choices stand. Continue authorized program; Unity/native and Owner access
remain deferred, with all prior failures and qualification limits preserved.

## CURRENT — Cross-owner availability qualified; finishing source next

Executed/published8873cb28c8721b441c014e3fa43d3cc091840688 matched GitHub.
1270 root types PASS35.248s;1271 Q17 PASS1/zero filtered5.989s recorder,
1.723s leaf. All1,686 source files,185 manual pins,index/stage and fixed-source
checks stayed exact.1269-I/J/K close six pure P5 quotes at actual45, zero actions
or advances: rival Actor company release52 gives take57, while rival Writer's
actual draft due46 gives take51. Both exclusive deadlines and seven/eight-week
slack boundaries passed with complete owner censuses. Writer credit is not a
company seat; real rival contracts and all19 old takes remain unchanged.
Seventeen core leaves passed across nine separate selections, not one full suite.
No production change; Save40/projection55/evaluator7 remain current.

Begin1272-C under acceptedA/F/B: existing reproduced Save35 actual312, five pure
P4 quotes, two public existing-task actions, hard one default-false tick to313.
Qualify actual finishing cast work and current Director retirement refusal; no
new contract, funding, historical replay or extra action/tick. IndependentD before
parent integration/publication,1273types(cap0),1274runtime(cap1). All new outcomes
remain unexecuted. Then accepted1275 grouping and1278 casting-reservation plans.
Parent remains sole live integration/production writer and heavy-process owner;
same two specialists retain staged-test/review ownership. Continue authorized
program. Unity/native and Owner campaigns deferred; all earlier limits retained.

## CURRENT — Cross-owner availability source applied; Q17 gates next

Parent applied exact1269-C/D on published1ec31c4b.1269-E records the sole new
18,482-byte test301acd4a and37 unchanged protected files. Publish then1270 root
types and1271 isolatedQ17, both cap0: six pure P5 quotes on exact1171actual45.
The rival Actor's actual company seat and rival Writer's separate drafting due
supply distinct availability floors; permanent writer credit is not a company seat.
Both real rival contracts remain intact; query terms do not hire/transfer either.
All current migration/owner/receipt premises remain unexecuted for this selection.

1266-I/J/K closed requested-Actor retirement with historical V37 FAIL preserved;
sixteen core leaves passed across eight separate selections. After1269 closure,
begin accepted1272 finishing source, then1275 grouping and1278 casting-reservation
plans.1278A/B accept four pure P5 quotes/three public actions/zero advances to
isolate an actual casting reservation's known-due exemption; no source release yet.
Parent owns live integration/production and the only heavy lane; same two
specialists retain separate staged-test/review roles. Continue authorized program.
Unity/native and Owner campaign access deferred; earlier failures/limits retained.

## CURRENT — Requested-Actor retirement qualified; cross-owner source next

Executed/published cce5f998fb59d929f18a0545100b9987a4793a1b matched GitHub.
1267 root types PASS35.810s;1268 Q16 PASS1/zero filtered6.621s recorder,
2.448s leaf. All1,685 consumed files,174 manual pins,index/stage and fixed-source
checks stayed exact.1266-I/J/K close all three pure P4 receipts: Actor0005 RA7,
Director0000 and Writer0001 IMP7 from their actual terminal Actor records despite
allowed current-profession admission. Zero actions/advances; actual208 unchanged.
All59 roots/85 old takes/lifecycle persist; real same-person promise57/58 remain
unbound/unattached and excluded. Preserve the original V37 provenance/parity FAIL.
Sixteen core leaves passed across eight separate selections, not one full suite.
No production source changed; Save40/projection55/evaluator7 remain current.

Begin1269-C under acceptedA/B: six pure P5 queries on exact1171actual45, one rival
Actor's company release floor and one rival Writer's actual drafting due boundary.
Zero actions/advances; hypothetical API terms do not hire or transfer either person.
IndependentD precedes parent integration/publication and1270 root types(cap0),
1271 runtime(cap0).1269 migration/receipts remain unexecuted. Then accepted1272
finishing and1275-A/B grouped-witness plans; no source release for them yet.
1275B explicitly preserves separate old4 count clocks and current7 common clocks.
Parent sole live production/integration writer and heavy-process owner; same two
specialists retain staged-test/review ownership. Continue authorized program.
Unity/native and Owner campaign access deferred; all earlier failures/limits retained.

## CURRENT — Requested-Actor retirement source applied; Q16 gates next

Parent applied exact1266-C/D on publishedb8ff2c7d.1266-E records the sole new
15,682-byte test1ce0b6e6 and35 unchanged protected files. Publish then1267 root
types and1268 isolatedQ16, both cap0: three pure quotes on exact existing Save38
natural208, actual Actor retirement after real Director/Writer transitions.
Current migration, all owner premises and receipt expectations remain unexecuted.
Preserve the corpus historical V37 parity FAIL; no old producer/prefix replay.
Parent owns live integration and the sole heavy lane; same test/review specialists.

1263-I/J/K closed correctedQ15 on d787d92c with original1265FAIL preserved;
fifteen leaves passed in seven separate selections. Next after1266 closure is
accepted1269 cross-owner source, then1272 finishing.1275-A is an unreviewed future
proposal for real shared-production P1 waivers/common windows and delayed release;
no source or execution release. Continue authorized program and retained limits.
Unity/native and Owner campaign access deferred.

## CURRENT — Stock-null release qualified; requested Actor retirement source next

Executed/published d787d92cbe6653916b8ca977b798f3b92c7d72b5 matched GitHub.
1264b root types PASS34.933s;1265b Q15 PASS1/zero filtered13.474s recorder,
9.349s leaf. All1,684 source files,160 manual pins,index/stage and fixed-source
checks stayed exact.1263-I/J/K close independent author/reviewer/parent records.
The same13 advances and five public actions produce actual stock c00/comedy/null
at61/event24 and retain all old20 receipts plus all eight mixed new facts through
returned65. Film releaseTick64 is the existing completed-week stamp. All final
participant/concept/null-fact/prefix/current-admission assertions now pass.
Original1265 FAIL, missed65→64 test oracle and original preimage remain immutable;
all27 factual marker lines match between the two runs. Fifteen core leaves passed
across seven separate selections, not a combined suite. No production change.

Begin1266-C under accepted1266-A/F/B: three pure P4 quotes on existing genuine
Save38 natural208,zero actions/zero advances. Check requested Actor retirement
after actual Director/Writer transitions against the actual active Actor control.
Preserve85 old takes/all59 promises and original V37 provenance/parity FAIL.
Independent1266-D precedes parent integration/publication and1267 types(cap0),
1268 runtime(cap0). No1266 execution exists yet. Then1269 cross-owner and1272
finishing accepted plans; no source release for those later tasks yet.
Parent remains sole live production/integration writer and heavy-process owner;
the same two specialists retain separate staged-test and review ownership.
Continue authorized program. Unity/native and Owner campaign access deferred.

## CURRENT — Release-stamp correction applied; Q15 requalification next

Parent applied exact1263-G/H over publishedc3a06a77.1263-M records the only
change: expected film.releaseTick65→64. Test25,170B/060ac12b; production unchanged.
The actual returned65 check and every later retention assertion stay intact.
Publish then1264b root types(cap0),1265b same isolatedQ15(cap13/five actions).
Original1265 FAIL on9f33653d remains in G/H/L with all raw and masked assertions.
Do not count Q15 as passing before the corrected run. No altered route or prefix.
After Q15 closure, resume1266-A/F/B source, then1269 and1272 accepted future plans.
Same two specialists/test-review split,parent sole live writer and heavy owner.
Continue authorized program; Unity/native and Owner campaign access deferred.

## CURRENT — Stock route reached65; release-stamp test correction pending

Executed source9f33653d6d177752267d7244ff03de9cfff1fea3 matched GitHub.
1264 compiler PASS35.725s.1265 Q15 FAIL1/zero filtered13.578s recorder,
9.115s leaf. All fixed-source/pre/post guards closed exact. Actual13 advances,
five accepted public actions,seven completed caches reached the full admitted65
state. Real stocktake61/event24 retained c00/comedy/null; release state has eight
mixed facts after the exact20 old receipts. Existing old P1 lead satisfied61;
other old P1 remains open. No new material obligation was created.

The sole assertion failure is test322: expected film.releaseTick65, actual64.
Existing tick owner stamps its completed input week64 and returns market65.
Parent1263-L records the full failed run and masked final323+ assertions;
this is not a Q15 PASS. Original source/stage/C/D and raw remain immutable.
Author1263-G and independentH are preparing/reviewing the narrow test-only
stamp correction. Parent then applies/publishes and runs1264b types(cap0),
1265b same isolatedQ15(cap13), with no changed route,crew,recipe or added week.

No production change. Fourteen earlier core leaves stay qualified across six
separate selections.1266-A/F/B,1269-A/B and1272-A/F/B are accepted future plans,
not source releases. Existing two specialists retain test/review ownership;
parent owns live integration/production and the single heavy lane. Continue the
authorized program, preserving original failures and historical/timing limits.
Unity/native and Owner campaign access deferred.

## CURRENT — Stock-film test applied; compiler and Q15 next

Parent applied exact1263-C/D on published7be8f67c.1263-E records the new
25,170-byte test9222330c and34 unchanged protected files; production unchanged.
Publish then1264 root types(cap0) and1265 isolatedQ15(cap13): fixed generated31
bound52 input, five public actions including release commitment64, actual stock
null-project subject through release65. All runtime premises remain unexecuted;
no old body/prefix replay, new fixture or rescue branch. Parent sole live writer
and heavy owner; existing specialists retain separate test/review ownership.

1260-I/J/K closed both Q13/Q14 with zero advances,two commissions,nine quotes.
Fourteen core leaves passed across six separate selections, not a combined suite.
Future1266-A/F/B and1269-A/B accept bounded retirement/cross-owner pure-query
plans; no source release yet.1272-A/F is an unreviewed future historical finishing
proposal with five queries,two existing-task actions and one advance312→313.
Preserve all historical provenance, original failures and timeout limitations.
Continue authorized program; Unity/native and Owner campaign access deferred.

## CURRENT — Writer/resource checks passed; stock-film source next

Executed/published `9290240721d8817b3d422d81d41f85ed5e34bd46` matched GitHub.
1261 root compiler PASS33.468s;1262 Q13/Q14 both PASS, zero filtered,6.794s
recorder. All1,683 consumed files,138 manual pins,index/stage and fixed-source
guards stayed exact. Actual zero advances,two accepted public commissions,nine
complete quotes,three completed caches.1260-I/J/K close author,reviewer,parent
attribution. Q13 separates finite writing delay from same-picture writer credit;
Q14 fills both development slots and exempts only the target screenplay's own
known-due reservation. Actual state remains45; query46 is not an attained state.
No production change: Save40/projection55/evaluator7. Fourteen core leaves have
passed across six separate selections; see [coverage](P4P5-VERIFICATION-STATUS.md).

The existing test specialist is now preparing1263-C under accepted A/F/B:
standalone Q15 from existing generated Save31 bound52, exactly five public actions
including release commitment64 and hard13 advances52→65. Preserve the old20 takes
and every actual new mixed-owner fact; qualify the real stock target's null script
reference through release65. No input builder,prefix replay,new fixture or rescue.
Independent1263-D precedes parent application/publication,1264 root types(cap0),
then1265 Q15(cap13). No1263 runtime result exists yet.

1266-A/F/B separately accept a later three-query/zero-action/zero-advance plan for
requested Actor retirement after real profession transitions in genuine Save38
natural208. Preserve its manifest's historical V37 provenance/parity FAIL. No1266
source or runtime release yet. Parent remains sole live production/integration/
heavy owner; the same two specialists retain staged-test and independent-review
ownership. Continue authorized P14/P15/P16/specified program. Earlier failures and
scope/timing limits stay recorded. Unity/native and Owner campaign access deferred.

## CURRENT — Writer/resource test source applied; qualification next

Published checkpoint `fed0cf0f3f1b0dce24e59efdba17bdb0eb6d036b` matched GitHub.
Parent applied exact1260-C/D; E records the23,883-byte new test `4e2f660b` and
30 unchanged protected files. No production source changed. Publish, then1261
root types and1262 isolated Q13/Q14; both hard0 advance caps. The new selection
owns exactly two public commissions and nine pure quotes, with shared cached
setup. Actual writing delay/credit refusal and full development-slot congestion/
own-reservation exemption remain unexecuted prerequisites. No old test replay.

Q12 is closed by1257-I/J/K on executed63a83558: corrected typesPASS36.660s,
Q12 PASS1/zero filtered10.562s,seven advances. Actual root6 retains first freeze
RA7 and real employment/price/payment. Equal-valued freeze/ranking limitation and
original1258 compiler failure remain recorded. Twelve core leaves are qualified
across five separate selections, not one combined run. See
[P4P5-VERIFICATION-STATUS.md](P4P5-VERIFICATION-STATUS.md) for coverage and gaps.

After1260 closure,1263-A/F/B approve source preparation for a stock-null route:
existing generated Save31 input, five public actions including release commitment64,
hard13 advances52→65, no prefix replay or fixture minting. No1263 source yet.
1266-A is only a future three-query/zero-advance retirement proposal using genuine
Save38 natural208 profession transitions; no execution or source release.
Parent remains sole live production/integration/heavy owner, with the same two
specialists owning staged tests and independent review. Continue authorized
P14/P15/P16/specified program; retain earlier failures and timing limits.
Unity/native and Owner campaign access remain deferred.

## CURRENT — Q12 passed; zero-advance writer/resource source next

Executed source `63a83558574813e84e66b8909c7ffe308c8bf9f4` matched GitHub.
1258b root compiler PASS36.660s and 1259 isolated Q12 PASS1/zero filtered10.562s
recorder,6.609s leaf. All1,682 source files,126 manual pins,index/stage and
fixed-source guards stayed exact. Actual seven advances45→52, four accepted
mutations, two previews, one explicit quote, two matching feasibility calls and
two actual selectors; all four caches completed. No old body or prefix replay.

Actual Director root6/RA6 remained literal when the second person's player P4
offer entered the union. The joined45 quote used7; the actual first freeze52
returned RA7 `da57c0d934f00390`, which the winning root6 retained. Employment
52→156, salary488081 and signing debit87855 match the precommit price. Full40
round-trip retained the row. Both separately observed52 receipts have identical
values: this is not a differing-receipt discrimination test. The later player's
P4 offer was FRAGILE, declined and unbound; no rival/material-win claim follows.
1257-I/J/K close author, independent and parent verification. Coverage and open
limits are indexed in [P4P5-VERIFICATION-STATUS.md](P4P5-VERIFICATION-STATUS.md).
The original1258 TS2345/exit2/33.677s remains recorded; L/M/N only narrowed the
strict-reader return. Live test25,498B/`c1ee22de`; production remains unchanged.

Author is staging1260-C under accepted A/F/B: Q13 active-writing
availability/credit and Q14 development congestion/own-reservation exemption.
Shared setup, exactly two public commissions, nine pure quotes, hard0 advances.
Independent D precedes parent application/publication, then1261 root types and
1262 isolated Q13/Q14, both cap0. Preserve every existing test and input.
Parent is sole live production/integration/heavy owner; the same two specialists
retain test/review ownership. 1263-A/F/B approve a future stock-null plan, not source release: five public actions including release commitment64, hard13 advances52→65.
No new fixture or prefix replay. Continue the authorized program; full1226/P14
still needs remaining retirement/grouped/rival controls. Unity/native and Owner
campaign access remain deferred. Prior failures and timing limits stay recorded.

## CURRENT — Q11 passed: real status clocks and isolated fact-only refusal

Publishedc35926eb2a0e089fb1466d76030921c73114657d matched GitHub. Executed
sourcec5b45724 remains exact.1255 root
compiler PASS34.037s;1256 isolated Q11 PASS1/zero filtered15.019s recorder,
10.846s leaf. All1,681 consumed source files,107 manual pins,index/stage guards
exact. Actual3 attempted/reserved/invoked/completed advances45→48,outside0;
seven accepted public actions,24 status+3 baseline quotes,one downgrade call.
All11 caches completed. No old body/prefix/capture/Bridge/UI rerun.

Eight actual screenplay/casting snapshots passed exclusive physical due,seven-
week slack FRAGILE and eight-week slack RA. Actual auditioning47 arrived Review48
and public acknowledgement completed it. Actual r04 film4 take48 emitted event19,
concept4/horror/script0004,one complete new subject; all promises remained empty.
Full40 admission and exact40→39 refusal now isolate nonempty facts without new
material tags. Full1,226-byte legacy marker stays literal.1254-I/J/K now close author,
independent reviewer and parent attribution of the full raw, with no rerun.
Actual spare capacity does not isolate the own-reservation exemption. Full1226
remains open: retirement/resources,grouped witnesses,stock-null,stored6→7/rivals.

Next1257-A/B: separate real root6/frozen receipt7 branch from immutable45;
P3 on earlier case0006,then P4 on later case0007 so scope remains at first freeze.
F/G now freeze hard7 advances,four mutations,one joined45 quote,two price
previews (45/actual precommit52),two matching final-tick freeze/ranking calls.
Author stages C for D before application/publication and1258 types/1259 Q12. No seed,bid,window,order or
person rescue. Parent sole production/integration/heavy owner; existing two
specialists retain test/review ownership. Continue authorized P14/P15/P16/specified
program; preserve prior failures/Bridge timing limits. Unity/native and Owner
campaign remain deferred.1260-A is only a later zero-advance active-writer
availability proposal; it adds no work to1257.

## CURRENT — Q11 status and fact-only source applied; qualification next

Published63daa077d06d0d0ff7d93a8c314132885015d0f9 matched GitHub. Parent
applied the exact reviewed1254-C/D new-file patch;1254-E records26,435-byte
postimage496ea584 and protected source identity. Original78,825-byte opportunity
test stays literal. Frozen A/F/B retain their old hard2 scope; G/H explicitly
adopted hard3 before this source was written or executed.

Publish then1255 root compiler(cap0), followed by1256 isolated Q11(cap3), on
fixed published source with all pre/post guards. Planned chronology45→46→47→48,
seven public actions,24 status+3 baseline quotes and one fact-only downgrade.
Actual statuses/receipts/take48/no material tags are still unexecuted prerequisites;
failed prerequisites authorize no retry, extra tick or alternate target. Current
source only adds the independent test; no completed original/Bridge/UI/capture
body or producer is rerun. Parent alone owns integration and heavy execution.

1249-I/J/K close prior1252 PASS and1253 four PASS/20advances on c49cff82;
full1226/P14 still open. After Q11 closure,1257-A proposes a separate real old
root6/frozen receipt7 settlement branch; it is not added to Q11 or source-released.
The same two specialists retain test/review ownership. Continue authorized
P14/P15/P16/specified program; preserve all prior failures and Bridge timing
limitations. Unity/native and Owner campaign remain deferred.

## CURRENT — Retained controls closed; three-advance status route staging

Published97bfb0630fdba86ce91ed1644be9795c1839f78f matched GitHub.1252 root
compiler PASS34.266s;1253 Q07/Q08/Q09/Q10 all4 PASS, six filtered,26.860s.
All source/index/manual guards exact; actual20 advances under selected47.
1249-I/J/K now retain author, independent and parent closure. Full1,226-byte
legacy line is literal. Q10 qualifies one real nonempty committed witness;
grouped allocations and full1226 remain open. The downgrade in1253 is combined
tag/facts, not isolated fact-only proof. No completed gate needs repeating.

1254-A/F/B adopt a new standalone Q11 for real screenplay and audition clocks.
Parent G separately extends the unexecuted route to expected/hard3 advances
45→46→47→48: fixed c-02, Writer0003, Actor0005; actual public commission,
review/rewrite/accept, casting start/completion/acknowledgement. G requires
independent H before final source. It additionally attempts genuine r04 take48
with no material tags for isolated fact-only downgrade; any missing premise
masks the claim with no retry. Frozen A/F/B retain their prior hard2 scope.
Final totals planned3 advances,7 action attempts,24 status+3 legacy quotes,
1 downgrade refusal. Preserve the entire78,825-byte original test. Concrete
1254-C/D source package, parent application/publication precede1255 root types
and1256 isolated Q11 runtime. No old prefix/capture/Bridge/UI replay.

Continue authorized P14/P15/P16/specified program. Parent alone owns production,
integration and heavy execution; the same two specialists own tests and review.
Prior Bridge synchronous228.867s overrun remains recorded. Unity/native and
Owner campaign remain deferred.

## CURRENT — Four retained-authority controls applied; qualification next

Published5189f7ff2028dd93b49f7a0744f5e1091224b75f matched GitHub. Parent applied
reviewed1249-C/D append then1249-G/H readonly-array construction amendment.
1249-E records exact final78,825-byte postimage/205bf41b and all source authority.
The entire46,682-byte original test remains exact. G/H correct three negative
array constructions caught by source inspection; no1252 failure is invented.

Publish, run1252 root types, then1253 selector Q(?:0[789]|10): four new leaves,
six original filtered. Only Q05 setup,20 expected/hard47 actual advances;
zeroQ06/outside/additional branches. Q09 adds three zero-tick waiver actions;
Q10 observes one real selector call through the unchanged quote, on scheduled60.
No completed Bridge/UI/capture or old six bodies are rerun.

1236-J/K/L retain the actual three Bridge PASS results and B55-2's228.867s
synchronous overrun; no60s timing claim. Full1226 and broader P14 remain open.
Continue the authorized P14/P15/P16/specified program. Parent alone owns live
production/integration and heavy execution; two existing specialists own tests
and review. Unity/native and Owner campaign remain deferred.

## CURRENT — Bridge evidence closed; four new core controls staging

Published7e9055b0fc9342203e2498a73d1d61e69a5b6558 matched GitHub.1236-J/K
now independently close the actual1247b compiler and1250 three Bridge PASS
results on4d1fdec8, preserving the228.867s synchronous B55-2 timeout overrun and
all runtime/slot/privacy limits. Parent read both;1236-L and full raw are retained.
No repeat Bridge/UI/capture is needed for that completed slice.

Parent adopts frozen1249-A/B plus F: four new core leaves Q07/Q08/Q09/Q10,
selected by Q(?:0[789]|10), original six filtered. Reuse only existing Q05 setup:
20 expected/hard47 advances, zeroQ06 and zero added branch advances. Q07 strict
nonempty suffix negatives; Q08 actual class/window matching; Q09 real narrowing
waiver chain; Q10 one fixed, pure P5 reservation query on actual scheduled60
with an independently established held P4 witness. Q10 changes no campaign and
has no alternate person/project/window rescue. Source remains evidence-only
staging pending C handback/D review, parent exact application/publication, then
1252 root compilation and1253 new-only runtime on guarded published source.

All complete old bodies/inputs/counters remain frozen. Full1226 is incomplete;
continue authorized P14/P15/P16/specified program. Parent remains sole production/
integration/heavy owner; existing two specialists retain test/review ownership.
Unity/native and Owner campaign remain deferred.

## CURRENT — Bridge55 three-case logic PASS with elapsed limitation

Published4d1fdec8ad8b73e7db01281bef5ed84147d3c63c matched GitHub.1247b Bridge
compilerPASS33.400s.1250 all3 Bridge leavesPASS255.182s recorder, child0/fixed;
all source/manual/index guards exact. Actual counters:7 attempted/reserved/invoked/
completed advances,10 quotes,12 nonduplicate mutations,5 duplicates,1 prior-schema
refusal;5 caches complete. Actual P4 bind52 and same-contract genre→genre→project
waivers, own/UNKNOWN material, genuine prior54 two-slot migration and current
SAVE replay pass.1236-L pins parent closure; independent J/K attribution follows.

B55-2 took228.867s despite its declared60000ms timeout. Preserve this synchronous
overrun alongside actual PASS; no60s enforcement/performance claim or rerun.
B55-1 took14.820s andB55-3 6.062s. Standalone UI PASS remains separate1248/1251
on1fb18085, reviewed1236-H; no hosted App/native/disk claim.

Next1249-A adds only Q07/Q08/Q09 retained suffix/matching/narrower waiver controls.
Author drafts under evidence; parent broadly adopted the bounded plan while
independent review proceeds. Preserve original six bodies; selected setup only
Q05 expected20/hard47 advances, zeroQ06/outside/no new branch ticks. Publish exact
reviewed source before compiler/new-only execution. Full1226 remains incomplete.
Continue authorized P14/P15/P16/specified program, with parent sole production/
integration/heavy owner and existing separate test/review specialists.
Unity/native and Owner campaign remain deferred.

## CURRENT — Standalone material UI PASS; Bridge correction applied

Published1fb180850ea7985bee9100b76dbb80d0c3356da2 matched GitHub.1248 UI
compilerPASS42.942s and1251 B55-UI PASS1/oldD16 filtered4.886s recorder/343ms
leaf; source/manual/index guards exact.1236-H independently verifies the actual
nine-example standalone component scope.1236-I retains parent closure.

1247 Bridge compiler failed one TS2551 (nonexistent SAVE schema member),
child2/fixed27.999s.1236-F/G independently stage/review the one-name correction
to the actual true-only StudioBridgeSaveResponse schema; parent applied exact
38919-byte postimage. Original test/source reviews and failed raw remain intact.
Publish, run1247b Bridge compiler, then1250 all three B55 leaves with shared hard7.
UI gates need no repeat for this Bridge-test-only correction.

Initialfour and two core-work leaves remain separately qualified; full1226 is
open.1249 prepares new remaining controls with honest setup accounting. Continue
the authorized P14/P15/P16/specified program. Parent owns production/integration
and the sole heavy process; existing specialists own tests and review.
Unity/native and Owner campaign remain deferred.

## CURRENT — New Bridge55 tests installed; bounded qualification next

Published99b80bc50ecb45fa3804406416425434769d7c7f matched GitHub.1241b Bridge
compiler failed with one TS2322 caller-mutation annotation error, child2/fixed
27.966s; all guards pass.1241-C and1242-D/E retain the actual diagnosis and
independently reviewed one-line Payload annotation; parent applied it exactly.
The prior failed compiler remains evidence and no runtime values changed.

1236-C/D reviewed three new Bridge leaves and one standalone component leaf.
Parent applied exact postimages;1236-E pins them, including the unchanged old
4931-byte UI prefix. Publish this candidate, then1247 Bridge types/1248 UI types,
1250 three Bridge leaves with shared hard7 advances, and1251 new-only B55-UI.
Source readiness is not runtime qualification. Existing captures are immutable.

1240-D independently closes1243–46 root/UI/generated checks on39d95462.
Earlier initialfour and two work leaves remain separately qualified; full1226
and the authorized P14/P15/P16/specified program continue.1249 prepares the next
small remaining control slice, with setup calls accounted honestly. Parent is
sole production/integration/heavy owner; two existing specialists retain tests
and review. Unity/native and Owner campaign remain deferred.

## CURRENT — Root/UI and generated checks PASS; Bridge compatibility applied

Published39d9546256ae542eb1b4a42c4d38df27207fa865 matched GitHub.1243 root
typesPASS34.344s,1244 UItypesPASS44.591s,1245 contractcheckPASS1.735s and1246
fixturecheckPASS1.178s: child0/fixed, all source/manual/raw/index guards exact.
These preserve the actual generated55 source; no native qualification is claimed.
1240-B independently reviews the six production paths and literal type isolation.

Parent applied1242 exact three reviewed test postimages;1242-C records all pins.
They resolve current/frozen save callers and narrow the actual P1 helper without
runtime value changes. Historical readers/pins and unobserved behavior controls
stay intact. Publish, then1241b fresh Bridge compiler. Original1241 failed7
errors remains separately preserved. New1236 Bridge and standalone UI source is
still staged, not installed/run; its Bridge route has hard7 advancing calls.

Earlier core qualification is four initial leaves plus two work leaves on separate
recorded sources; full1226 remains incomplete. Continue Bridge runtime/component
qualification and the authorized P14/P15/P16/specified program. Parent alone owns
production/integration/heavy execution, existing two specialists own tests/review.
Unity/native and Owner campaign remain deferred.

## CURRENT — Bridge compiler diagnosed; historical type dependency isolated

Published354db2a168cf2b5d6af37845acb3ff5aacdb3a54 matched GitHub.1241 Bridge
compiler failed child2/fixed28.439s with7 diagnostics:6 in3 old test callers and1
inside frozen1052 reached through a type-only observer import. All guards pass;
full raw is preserved. No new Bridge production diagnostic was printed, and no
Bridge runtime qualification is claimed. Test owner stages1242 exact current/
frozen-boundary repairs; unrelated unobserved behavior expectations stay intact.

Parent copied1052's literal observation type protocol into a current type-only
module and retargeted the sole observer type import. Frozen driver bytes, version
checks and completed endurance results remain unchanged; no rerun is proposed.
1240-C records this isolation. Publish; root/UI types may run separately while
1242 is staged/reviewed, then integrate/publish before fresh Bridge compilation.
1236 new Bridge tests remain staged, hard7 advances, no current runtime run.

1239-A/B/C now preserve the two core-work PASS results with corrected compiler0/
runtime94 cap wording. InitialfourPASS remains separately qualified; full1226,
Bridge55 consumers and broader program remain active. Parent alone owns production
and heavy execution; two existing specialists retain separate test/review roles.
Unity/native and Owner campaign remain deferred.

## CURRENT — Core binding/filming PASS; Bridge55 draft generated

Published8d6d5a23118602c795ee4c7a03b85ee240d75c48 matched GitHub.
1237 root compilerPASS34.913s/cap0.1238 Q05/Q06 bothPASS20.760s with four filtered,
actual40 advances (7 binding+13 workflow per route)/cap94. Both actual player wins
bind52, take61/SATISFIED, release65. Each exact new suffix has9facts (8rival+1player).
Cancellation/idempotence and detachedP5wrong-seat BROKEN52 assertions pass. All
source/manual/raw/index guards and complete1,226-byte legacy line remain exact.
InitialfourPASS is separate1234b; no same-run6 or full1226 claim.1239 records retain
limits; itsA cap typo is corrected separately (compiler0, runtime94).

Parent1240 drafts coordinated Bridge55: explicit material drafts/waivers, own-only
optional genre/project/title, truthful classes/copy and exact prior54 registration.
Generation succeeded; actual schema identity is
sha256:2c377b6fa3c559eee753e7a9d91d4956399cca1a5693edb15adb3de7c4f27158.
1240-A pins the6source/3generated files. This is uncompiled, unqualified WIP;
independent source review and Bridge/root/UI compilation/contract checks follow.
1236-A/B adopts a separately staged three-leaf Bridge route with hard7 advances;
it is not installed or run. Native execution remains deferred.

No heavy is active at checkpoint creation. Parent remains sole production writer
and heavy executor; existing specialists retain separate test/review ownership.
Continue the authorized program, remaining1226 matrix and settled P15 decisions.
No completed captures or unrelated broad suites should be replayed.

## CURRENT — Initial four P4/P5 checks PASS; binding/filming source installed

Published029dae8aea5f4c1674f7272cb55408a02454218f matched GitHub.1233c root
compilerPASS34.080s.1234b unchanged initial fourPASS19.397s, child0/fixed source;
actual0 advancing attempts/cap0, both caches complete. All source/manual/raw/index
guards exact. Complete1,226-byte legacy4/6 output matches1230 and the prior failed
attempt literally. Independent result review finds no blocker; parent closure
preserves the narrow scope and the original1234 threePASS/oneFAIL separately.

Parent verified/applied reviewed1232 exact46,682-byte postimage (SHA256
067915dc62457a5b3554cedeb2f58ce31c968c0402688ac92dbf16605e55a3c7), retaining
all initial four test bodies.1232-E records application. Later source has not run.
Publish, run1237 root compiler, then1238 onlyQ05/Q06 (four filtered): at most47
advances per route/94 total, no retry/rescue or hidden setup. Observe actual player
binding, cast work, subject suffix, release/cancellation and P5 wrong-seat outcome.

Bridge55 source/generation/runtime/UI and full1226 remain pending. Existing
specialists separately own test/review; parent alone owns production/integration
and the single heavy process. Current40/54 is still unqualified WIP. Continue the
authorized program and settled P15 decisions; Unity/native/Owner campaign deferred.

## CURRENT — Core types pass; initial attempt3PASS/1FAIL; narrow cause fix

Published2c9b67fc39ca2598f55eecdb640c53e75a668b64 matched GitHub.
1233b root compilerPASS33.608s, child0/fixed.1234 initial run child1/fixed15.220s:
Q02/Q03/Q04 PASS, Q01 fails after its allCast RA7 quote because due64 is correctly
FRAGILE7 but a synthetic future path sorts ahead of the real screenplay at the same
takeWeek57. It reports uncommissioned work instead of the actual slack cause.
Remaining Q01 classes/digest checks were not reached. Both caches complete; actual
advance attempts0/cap0. All source/manual/raw/index guards are exact. The complete
1,226-byte legacy4/6 line is literally unchanged. Failed evidence remains frozen.

Parent applied a separately source-reviewed tie correction: earliest time remains
primary; real paths precede the hypothetical fallback on equal time, then stableID.
Tests remain unchanged. Publish and run1233c root compiler before1234b matched
initial four.1232 later binding/filming source is reviewed but still staged, not
installed or executed. Bridge remains54 and full1226 qualification is pending.
Current40/54 remains unqualified WIP. Parent alone owns production/heavy execution;
existing specialists retain test/review ownership. Continue the authorized program
with settled P15 decisions and inherited limits; Unity/native deferred.

## CURRENT — Reviewed compatibility integrated; initial core checks next

Published source before this checkpoint was df4f22bb0acc88679bbd7f005a08e174e5065cab,
verified against GitHub. Parent applied all25 exact1235 reviewed postimages for39
observed test diagnostics; frozen historical admission and negative-cause guards
remain.1235-C records manifest/review/application pins. The narrow physicalReason
attribution correction has separate source review1231-C. Neither is yet compiled.

The initial four P4/P5 tests remain21,703B/SHA256
73a358bafa523282e24abbac64748877eda4a4cdc934a40783a665c791e26005.
Publish, then parent alone runs1233b root compiler; only after PASS run1234 initial
four leaves with cap0 and exact1,226-byte1230 legacy comparison. Preserve1233's
43-diagnostic failure.1232-C/D source is final KEEP but still staged, not installed;
its two later binding/filming routes remain unexecuted. Bridge54→55 and full1226
qualification are pending; current40/54 remains unqualified WIP.

No heavy is active at checkpoint creation. Existing specialists retain separate
test/review ownership; parent alone owns production/integration/heavy execution.
Continue the authorized program with settled P15 decisions and inherited limits.
Unity/native and Owner campaign remain deferred.

## CURRENT — First core compiler diagnosed; integration fixes staged

Core draft ef38cf9a24b56dc9b462eeecdab05e4c4a4a0730 is published with exact GitHub
identity.1233 root compiler failed child2/fixed source in33.826s:43 diagnostics,
4 production/harness and39 tests across25 historical callers. Complete raw and
exact source/manual/raw/index postflight are preserved. No runtime was released.

Parent1231-B fixes the four production typing boundaries and tightens retained
issuer/project authority; these corrections are not yet recompiled. The test
specialist prepares separately reviewed1235 compatibility changes, preserving
strict old-save proofs and real live migration. Any newer subject fact masking an
old downgrade-refusal cause remains unqualified, never stripped for a test.
The initial four P4/P5 bodies and1,226-byte legacy baseline are unchanged.

1232 later binding/cast source is frozen under evidence, not installed or run;
its exact47+47/94 cap and unchanged initial-body proof await final source review.
No heavy is active. Parent alone owns production/integration/heavy execution.
Bridge remains54;55 wire/generated/runtime/UI work and full1226 qualification
are pending. Current40/54 is explicitly unqualified WIP. Continue the authorized
program with settled P15 decisions and inherited limits; Unity/native deferred.

## CURRENT — Core P4/P5 draft checkpoint; compiler integration next

1230 initial RED and baseline are published46122f5d53d977ad249d17ead1f4d881779f91b0,
exact GitHub. Parent1231 now contains an uncompiled core draft: Save40 subjects,
new material predicates/evaluator7, assignment/resource/committed-witness reads,
subject-qualified outcomes and waiver restrictions, player/rival successful
assignment callbacks and bounded rival fallback.1231-A pins the actual draft.

This is recoverable WIP, not a qualified feature or coordinated consumer release.
Bridge remains54; its55 contract/generation/runtime migration/UI work is pending.
Parent next runs1233 root compiler and fixes actual integration diagnostics before
matched initial GREEN. Current four tests and1,226-byte baseline stay unchanged.
The separately staged1232 later routes are not installed or executed. No heavy
is active at checkpoint creation; parent alone owns production/heavy execution,
existing specialists separately own tests/review. Full1226 qualification and all
inherited P3/program limits remain. Continue the authorized program.

## CURRENT — Initial P4/P5 RED verified; parent implementation begins

Published correctionfd641e8be6aabc308902bbf80d8e95e13b20e1b6 matched GitHub.
1228b root compilerPASS33.240s, no diagnostics.1229 exact four leaves failed
as expected in6.016s: actual genre/project refusals and LIVE39 instead of40.
Both real setup caches complete, zero attempted advances/cap0. Q03 stops at its
quote before attachment; Q04 stops before migration.1230-A/B and parent closure
verify all actual first causes and exact source/manual/raw/index guards. Original
1228 syntax failure remains separately preserved.

The complete week45 legacy4/6 baseline is1230-legacy46-baseline.txt,1,226B/SHA256
36921548246e8ec4cc2241353cf62fa1e9868cc037a62e2a8a1a0bf26cc35342.
Keep its full line and unchanged initial test bodies for matched GREEN. No later
assertion or outcome is qualified yet. Outgoing production2af37179 is unchanged
at this checkpoint. Parent now begins1231 implementation of adopted1225 under the
selected40/55/7 boundary; all version/consumer work remains unqualified until its
own checks. Existing test specialist stages1232's bounded public binding/cast
source, reviewer remains separate, parent alone executes heavy processes.

Continue P14/P15/P16/specified P17/P18 with settled P15 decisions, recoverable
checkpoints and inherited qualification gaps. Unity/native/Owner campaign deferred.

## CURRENT — Initial compiler syntax failure preserved; narrow correction installed

1228 on published9aae8d85 failed child2/fixed source in6.680s with one TS1005
missing-brace diagnostic. No runtime leaves or semantic RED ran. Exact manual,
raw input, consumed source and index guards pass in1228 postflight.

1227-D/E independently identifies and reviews the sole two-byte correction after
proposed45(). Parent applied it exactly; corrected test21,703B/SHA256
73a358bafa523282e24abbac64748877eda4a4cdc934a40783a665c791e26005.
All four bodies, timeout declarations and hard tick cap0 are unchanged. Original
failed source and evidence remain frozen. Publish this correction then run1228b
root compiler before1229's four initial leaves; attribute actual causes in1230.
Production2af37179 is unchanged;40/55/7 remains design only.

1232-A/B is KEEP as a later two-route plan:47 calls each/94 total, with named-route
tick authorization and all original leaves still forbidden to advance. No later
source or gameplay qualification is claimed. Parent alone owns production and
heavy execution; existing specialists own separate tests/review. Continue the
authorized program with settled P15 decisions and all inherited limits.

## CURRENT — P4/P5 initial tests installed; compiler and first RED next

The genuine outgoing39/54 capture and independent1224 verification are published
at ee8ee353fe3037a8e6d89d1889d5ec303d7ea374 with exact GitHub equality. Do not
repeat the78-call capture. Production2af37179 remains unchanged; no heavy is active.

1225-D/E/F closes the bounded contract and assignment-owner clarifications.
1227-A/B is final KEEP; parent applied its exact new21,701-byte test postimage,
SHA256 d4ddf8823f951aa7aaf806da40e57d98da6e105e80138b35ee7d3d673181df89.
All existing production/tests/helpers are unchanged.1227-C records application.
Publish this checkpoint, then parent alone runs1228 root compiler and1229 the
four new Q01–Q04 leaves, no filters or timeout changes, hard advancing-call cap0.
Actual first causes and complete legacy4/6 baseline belong in1230 attribution;
no compiler, semantic RED or future40 result is claimed before those runs.

1232-A prepares later independently counted public binding/cast routes, without
execution or fixture rescue. Existing separate test/review specialists remain;
parent alone owns production and heavy execution. Save40/projection55/evaluator7
is the adopted next design, not yet activated. Continue P14/P15/P16/specified
P17/P18 with settled P15 decisions and inherited qualification limits. Unity/
native and Owner-campaign work stay deferred.

## CURRENT — Genuine outgoing39/54 preservation verified; P4/P5 test source next

Published sourcee49e9931e55b79673a59d5db8c8de6cf00da97b5 matched GitHub.
1222 dedicated compilerPASS15.196s,418 imported files/no diagnostics.1223 single
capturePASS33.390s, one leaf28.565s, actual78 helper advances and zero other/runtime
advances. All nine caches completed. Real SAVE/partial-waiver/two duplicates/one
restart retain saved-earned61 versus current-waived61, both stores closed once.
The complete851-byte legacy4 marker matches the earlier qualified runs.

All seven exclusive outputs are preserved under1221-p4p5-outgoing-capture:
900,926B on disk,8,643,326B decompressed; manifest21,306B/SHA256
02115df5d6e7d4c33284b9a439a7c79601e1b2e807f4fa96c20149f5c84186f3.
1224 parent closure/A and independentB KEEP verify every raw/gzip identity,
actual journal/slot joins, fixed recorder source, manual inputs and raw index.
No heavy remains; no repeat mint, old corpus change or native/disk claim.

1225-A/B/C now specifies the next P4/P5 contract and concrete refinements, under
final review: exact cast masks, immutable take subjects, singular timing and
conservative reservation witnesses, target-aware outcomes/waivers, bounded rival
fallback and unchanged public preference descriptors.1226-A test requirements
are frozen.1227 initial source is being prepared separately under evidence:
zero-advance Ready quotes/material/strict-migration controls with complete4/6
baselines, before a matched RED. Parent alone owns production and execution.
No40/55/7 activation yet. Production2af37179 remains unchanged; existing P3 and
whole-program limits persist. Continue P14/P15/P16/specified P17/P18 with settled
P15 decisions; Unity/native and Owner-campaign work remain deferred.

## CURRENT — Outgoing39/54 producer reviewed; dedicated compiler and capture next

Current checkpoint3d0b05ea7b797b3a83a797834f593667ce2e823d matched GitHub in
recovery. Production2af37179 and all consumed source remain unchanged; no heavy
process is active. Existing test/review specialists retain separate ownership.

1221 producer/config/local tsconfig/source manifest andA/B are frozen and reviewed
KEEP. Parent independently checked all1,675 consumed/eight manual/four immutable
pins. The exclusive output directory is absent. Parent1221-C releases publication,
then1222 dedicated compiler and1223 single capture:78 actual helper ticks, zero
runtime advances, real SAVE/waiver/restart/two duplicates and seven exclusive
bounded outputs. Actual child exit, manual source/index guards and1224 independent
attribution are required. No output or successful capture is claimed yet.

1225-A now states the concrete P4/P5 contract candidate: explicit cast masks,
immutable first-take subjects, singular feasibility and a conservative reservation
witness, material/waiver semantics and candidate40/55/7 boundary. It is under
review and releases no production edit or version activation.1226-A separately
prepares test requirements without execution. Existing P3 rival/slack/historical
limits and the selected P15 decisions stand. Continue the authorized P14/P15/P16/
specified P17/P18 program; Unity/native and Owner-campaign access stay deferred.

## CURRENT — Occupancy boundaries verified; current39/54 preservation is next

Published e3b7e4afe9871f4d042073ff5f09dad326141913 has exact GitHub equality.
1214 rootcompilerPASS33.760s;1215 newD03X/W/R3PASS/17filtered in15.115s, fixed
source/empty consumed diffs/no untracked source/signal/error. Actual116 advances
=65player+51cancelAfter, all other routes0 and9 complete caches; no added branch
advances. The full851-byte legacy4 marker is byte-identical to1135/1205/1210.

D03X preserves the actual player count2 reservation and sees real player cast
occupancy from a rival query issuer: reservation refusal becomes physical refusal
and the digest names the player-owned seat. D03W retains the reservation cause
and no occupancy tuple for credit-only Writer0003. D03R holds the actual world at
112 and explicitly queries147: vacant due162 is spare-buffer FRAGILE, occupied
due162 is retirement IMPOSSIBLE, occupied due160 is physical IMPOSSIBLE. No
future-world/contract-extension claim.1216 closure and independent review retain
all source pins and limits. Production2af37179 remains unchanged; no heavy active.

Next1219-A/B freezes a distinct current Save39/projection54 outgoing capture for
P4/P5, separate from immutable1171 and1117. Proposed existing route78player advances,
zero runtime advances, real SAVE/partial-waiver/current-saved/restart/duplicate
authority.1221 producer/config/source review precedes1222 compiler and1223 capture;
output remains under evidence outside consumed source. No capture result or version
activation is claimed. Parent owns the only heavy process/production integration.

1218 P4/P5 source preparation is reviewed; explicit cast masks, singular residual
reservation proof and durable immutable first-take facts need the concrete next
contract. Current family refusals remain. Historical post-take, isolated slack and
failed fixed-rival1169 limits persist; no complete P3/P14 claim or automatic retry.
Continue P14/P15/P16/specified P17/P18; P15 choices stand, native/Unity/Owner access
remains deferred. Existing specialists retain separate test/review ownership.

## CURRENT — Three occupancy boundary controls applied; P4/P5 preparation underway

Production2af37179 remains unchanged and qualified by1208–1211: both compilers
and15 nonrival core cases passed,518/556 advances. Verified records are published
b936e116b157d316e5064e9692f355c7b42c288c with exact remote equality.

Parent read/final-pin-verified1212/1213-A/B and applied the exact1213 test append.
The entire85257-byte prior test remains a literal prefix; helper/production stay
unchanged. New source98958 bytes/1bcbbe03552f5815c3e88fc1f0937ef51f37d7b84ca0f3bd8fd693f5058e2e16.
D03X/W/R isolate cross-issuer occupancy, Writer-credit exclusion and retirement
versus physical timing on actual112 queried explicitly at147. The D03X amendment
keeps the complete real reservation union and its player count2 root; it requires
total>=2 instead of an unproved exact-one census. Frozen earlier plans remain.

Publish and verify GitHub equality, then1214 rootcompiler and1215 new3-only
selection (17 filtered), unchanged60s leaves. Fresh expected116=65player+51cancelAfter,
zero added branch advances; existing subset guard272. No heavy process active.
Do not repeat completed15, rival route, UI or generated checks.

1218-A/B begins independently reviewed P4/P5 preparation: immutable new take facts
beside preserved old receipts, explicit cast classes and singular feasibility,
with genuine current39/54 preservation before any version/predicate activation.
Current P4/P5 refusals remain.1219-A prepares bounded evidence/tests only. Rival,
isolated-slack and historical post-take gaps remain; no complete P3/P14 claim.
Existing separate test/review specialists remain; parent alone owns production
and execution. P15 choices persist; continue P14/P15/P16/specified P17/P18, with
Unity/native/Owner access deferred.

## CURRENT — Occupancy correction verified on published2af37179; boundary controls next

Source2af37179eb2d33b2a295c0e20fdd87e5318ad3cf is published with exact remote
equality.1208 roottypesPASS35.103s;1209 BridgetypesPASS28.216s;1210 selected
nonrival core15PASS/2filtered in77.888s. Every gate retained fixed source, empty
consumed diff/untracked list and no signal/error. The unchanged D03O now passes
with occupied IMPOSSIBLE6/no-filming receipt digest36949cf9519e98fb; its actual
cast-admission/refusal/empty-reservation/purity premises remain true. Its branch
adds zero advances. Actual whole-run518 calls=208player+60cancelBefore+51cancelAfter
+43waiver+156lifecycle; rival0, below the unchanged556 ceiling. All22 caches
completed. The complete851-byte legacy4 marker is byte-identical to1135/1205.

1211 closure pins raw results and protected source. Separate1211-B review follows
the closed records before evidence publication. No heavy process remains.
Next1212-A designs only narrow zero-advance cross-owner, Writer-credit and
retirement-floor controls on existing branches; any hypothetical query-time
control must remain explicitly distinct from a campaign advanced to that week.
Historical post-take, isolated slack and failed D07/D18 rival requirements retain
their limits. No new rival route, seed, staffing extension or full-suite claim.

Parent remains sole production writer/integrator/heavy executor, with existing
separate test and review specialists. Continue remaining P14/P15/P16/specified
P17/P18. Selected P15 decisions persist; Unity/native/Owner access stays deferred.

## CURRENT — Actual occupancy defect reproduced; bounded correction ready for verification

Published7e901a8ab85ff9b46f08abefd212820fe1ad88fe is the exact source of1204
root typesPASS35.475s and1205 D03O semanticRED9.159s (1FAIL/16filtered). The
actualbound52 branch had zero competing reservations, real cast production
prod-0052 and an unchanged-state/RNG public refusal to employ its occupied actor
as Director. The quote nevertheless remained REASONABLY_ACHIEVABLE inside[52,66),
whose earliest fresh take66 is outside the exclusive boundary. All premises
passed;52 setup advances and zero branch advances.1206-A/B preserve full matched
attribution, including the exact legacy4 marker and earliest-clock limitation.

Parent's sole production edit is1207 promises.ts: revision6 fresh work waits for
nonqualifying production seats across owners; screenplay credit alone is excluded.
The same actual committed qualifying seats determine exemption, first-event clock
and existing-path count. Retirement comparisons share the same actual-week floor.
Legacy4/history/schema/staffing remain unchanged.1207 manifest/C freeze source and
verification scope; independent1207-B review precedes publication.

After publication/exact GitHub verification, parent alone runs1208 root types,
1209 Bridge types and1210 the15 nonrival core leaves, unchanged timeouts and shared
556-call ceiling. No new route or rival retry. Narrow cross-owner/Writer/retirement
controls remain separate pending work. Existing test/review specialists retain
separate ownership; no heavy process currently active. Continue P14/P15/P16/
specified P17/P18 with selected P15 decisions; Unity/native/Owner work deferred.

Status: **N1 NATIVE CORRECTION — SOURCE-CORRECTED AND RENDERED-VERIFIED (209/209 on Unity 74c2141 / Build50), NATIVE PROOF NOT EXERCISED (four guarded attempts blocked by an unacknowledged HID injection / owner activity on this desktop session) — STILL A LABELLED PARTIAL; NOT OWNER-ACCEPTED; N1 RESERVE EXHAUSTED AT THIS RECORD**
This section sits above the continuation record (C1–C7), the execution record (R1–R8) and the successor record (S1–S7), all unchanged.
It is the one evidence-linked record of the correction's acceptance, the F7–F15 before/fix/test/native-result matrix, the exact new
candidate pins, the bounded fixture attempt, charges and residuals. Nothing here starts P13B, a PR/merge or a protected promotion.
Build46 is the Current Ops-qualified engineering checkpoint (not Owner-accepted); P13A remains the accepted product. Private identifiers
stay in the Git-private `fable-local-transfer-20260914-01/r3n1-ledger-local.json`.

## K11. R3-N3 visual/art standard — Build55 → Build56 (2026-09-16 02:50Z – 05:45Z, autonomous window)
Phase N3 of `plans/R3-OVERHAUL-PLAN.md`. Source: Unity `a5e8340b` → **`288c4ddb`** (TEST-21, IMPL-19 ×4, TEST-22, IMPL-24 ×2, DATA-04, DATA-06,
IMPL-25, TEST-23 ×2: 13 commits, all pushed); TS `eafd551e` → **`70a8c3ec`** (SIM-20 read-model deltas at projection 31 d02230a8, DATA-03
95652d37, DATA-06 generator bc5321fa, plan rulings C10–C13, DESIGN-09 N7 sheet 79af664d, DESIGN-10 N8 sheet 44c1ffa0, state files).
**Build56**: Unity 288c4ddb / TS 70a8c3ec, exe `84f1a896cb5cea3261a11f85d6d3b6821a0624ab379342ef7f6af64feb0acacd`, assembly `962fcf43…`, seal 51 PASS (DTO blob 253e345a both sides, schema
`sha256:c9c07d6f…`, projection 31), **admission 46 PASS** (the admission script is now contract-driven: identities are read from the TS HEAD's
generated contract manifest instead of the projection-30 constants). **Correction:** Build55 (Unity e83c4095 / TS bc5321fa, seal 50 PASS) was
never admitted — the projection-30 assertion refused it and the earlier state file wrongly called it "admission 46"; Build55 stays a sealed,
un-admitted superseded record and 46 is Build56's. Build54 remains the previous admitted checkpoint (admission 45).
**Delivered (EditMode 1916/1916; rendered PlayMode `r3n3-03/playmode-rendered-n3-03.xml` 221 total / 219 passed / 0 failed / 2 NativeOnly
skipped on 288c4ddb):** stage art 8/8 imported and mapped (`committed`, `intheaters` added; coverage statement recomputed from live
`Resources.Load`, never hand-written); C2 font law (tier-0 floor, `HasCharacter` coverage gate, OS-typeface adoption shut by C10) with the
`text-metrics` probe; C1 portrait standard (per-talentId still cache, exact-id identity law, 4:5 slots, monogram fallback, `BodyResolver` seam
left null until N5 → 0 captures by construction, declared); F-N3-2 portrait height 53→55; the three batched N4/N5/N6 read-model deltas at
projection 31 (development `attention`, contract offer `affordable`/`refusalReason`, finance `StudioFinanceAttention{id,message,route}`)
with every fixture family regenerated by its governed generator (P11 EditMode, PlayMode embedded wire — generator created, DATA-06 —
and the immutable native siblings r3n1-dense-01p31 / -02p31); finance attention rows route client-side (C11 Alt A); F23 board fixture and
the six-person proof harness closed (TEST-23: the workspace host's first frame resets `GeometryPublishingEnabled` — a harness fact, not a
product defect). **F25 REFUTED**: the probe multiplied the metrics by m twice; the rails never did (IMPL-25, probe-only fix).
**Native on Build55 (chain 55: `early-2026-09-16T04-30-52-639Z` 1440×900, `…T04-33-22-582Z` 1280×720, `…T04-35-50-762Z` dense-02p31) and
Build56 (chain 56: N3C `early-2026-09-16T05-22-10-373Z` 1440×900 · N3D `…T05-24-42-197Z` 1280×720 · B7 `…T05-27-11-991Z` dense-02p31 1280×720 (109 actions, 10 attempt-failed, all downstream of F26); analyses `*-check-v3.txt` in each folder):** probe
after IMPL-25 reads `scale=1`, meta d12→12 / 18 / 24 at 100 / 150 / 200 % (ink 12 / 17 / 21 px; target 18 / 27 / 36) — **C8 measured and
declared** (floor stays 12; XAG deviation at the 1280×720 class recorded in the plan) · stage art visible on the lot at every text size
(captures `n3-*`) · portrait slots draw monograms at 4:5 (0 captures, as declared) · the compact inspector geometry unchanged across sizes
(`inspector-panel` 680×455 → 680×490) · **F26 (new, product)**: on the dense-02p31 route at 1280×720 @ 100 %, after the Production workspace is opened and closed, the script card opens the Development inspector through `inspector-fallback` ("lane not composed") and `development-review-open` publishes at screenRect [764, −82, 488, 54] — above the viewport, steady for 2.5 s — so the review route is unreachable; the same step failed on Build53 (B2) and Build55 (B6) and was misread as pointer drift. Consequence: the mid-display invalidation step of UX-STALE-NATIVE-01 stays **NOT EXERCISED** natively (server-refusal tests only) and the fix is assigned to N4's Development-card owner (IMPL-26 item 3a); the Schedule-take single dispatch itself was already confirmed on Build53.
**Independent review (AUDIT-01, contract-auditor, read-only): REFINE.** Defects carried: sheet §5.1–§5.4 have no test against the real
bundled face (glyph resolution, atlas rebuild, XAG ladder) and §5.5's proof set is not the sheet's six ids with no per-capture assertions
→ **TEST-24** (dispatched); three source comment blocks still call C8 "open" → doc-only commit in IMPL-26 item 0; `InvalidationReason`
recorded nowhere and law-3 invalidations have no runtime call site → N5 (with the `BodyResolver`); PROVENANCE wording "six" → eight.
Met with evidence: probe correctness, font stack/fallback, stage art import settings + recomputed coverage, portrait identity law, the two
NativeOnly ignores. Craft notes for N9: committed cards leave the RELEASE READY filter (lawful, unshown), 6/14 icons authored and unused,
200 % monogram legibility is an eyeball check.
**Design ahead (no implementation yet):** N7 help/attention sheet (C12 adopted) and N8 optional-drag sheet (C13: four routes ratified).
**Charges (session clock, this window):** capability ≈ 1.7 h, reserve ≈ 1.25 h against the revised N3 budget 5 / 2.5 (under). Whole-program
ledger after N3: capability remaining ≈ 38.3 h; reserve remaining ≈ 5.9 h — **the unprotected reserve is exhausted and 0.08 h has been
drawn past the 6-h protection line**; per the plan's overrun rule every further verification hour is reported as overrun, phase by phase,
for the Owner's re-basing decision on return. Nothing is cut to fit.

## K10. R3-N2 responsive/text close-out — Build51 → Build52 → Build53 (2026-09-15 20:13Z – 2026-09-16 02:20Z, autonomous window)
Phase N2 of `plans/R3-OVERHAUL-PLAN.md` (Owner directive 2026-09-15). Source: Unity `74c2141a` → **`12498560`** (IMPL-12/12b/13/14/15/16/17/18/19/21,
TEST-09..19: 32 commits, all pushed), TS docs `681b3fdc` (design addendum DESIGN-03 321448c1; N3 sheet d9b5e239 + sprites d133f509; N4/N5/N6 sheets
95ec9a3d/4d041fb7/0ad64fa6; inventory f9b1d28c; plan rulings C8/C9). **Build53**: exe `e86527f21665f9d1fb914c0dff510355635b1c1293ba650145de501599747be7`,
seal 48 PASS (TS 681b3fdc / Unity 12498560, DTO 9420d5ef unchanged), admission 44 PASS. Superseded builds retained: Build51 (bb23f87e, exe dc4d4806…,
seal 46/adm 42), Build52 (231585e9, exe 4def4411…, seal 47/adm 43).
**Delivered (source, EditMode 1877/1877, rendered PlayMode 219 total / 214 passed — every pre-existing test green; the 5 failures are harness-side
in the newest regression class, TEST-20 fixing):** R3.2 list floors + chrome yield ladder; R3.3 abbreviation yield + 2-row tab-strip cap; R1.5
More-actions footer (primary action kept in the footer, heading yields, focused overflow row revealed, stale rows swept); shared responsive
chrome extraction (`StudioResponsiveChromeContracts`); C3 card title 18 px; lane inspector fonts no longer double-scaled (150 % rendered at 225 %
before); body-band law; registry withdrawals; ring-target parking on every seam; spent-press cancel latch; pointer-route invoking-focus capture;
History return offset restored exactly (a real neighbour-offset defect); F13/F14/F15/F16/F17b/F18/F20/F22/F23/F24 corrected; C8 (rail font floor)
neutral by ruling; C9 (1280×720/200 % body 112 vs 120) declared.
**Native on Build53 (unattended, guard-admitted; runs `early-2026-09-16T02-07-04-090Z` 1440×900, `…T02-10-06-288Z` 1280×720 (dense-01),
`…T02-13-05-779Z` dense-02 1280×720; analyses `*-check-v3.txt` in each):** F16 **PASS** (Esc #1 restores the invoking row, Esc #2 releases only,
Esc #3 opens the menu) · F18 **PASS** · F20 **PASS** (monogram inside its slot) · F22 **PASS** (pictures list 193 px ≥ floor 182 at 1280×720/200 %;
first card's activation zone published; paging reveals the rest) · F23 **PASS** (`rail-script-details-<id>` opens the Development card) · F24
head published (rect containment to be pinned by TEST-20) · C9 as declared (person overlay body 112 px at 1280×720/200 %, one-row footer) ·
DATA-1 pictures overflow **PASS** ("1–3 of 4", paging) · **Schedule-take route**: on the fresh Production workspace the offered decision is
re-derived and ONE click dispatches it (workspace notice "Confirmed: Schedule the shooting take — Ghosts of Serpent", row state Shooting, the
control removed → no duplicate); the driver's post-click lookup misreports "no target" (harness artifact, see writer-report-20). NOT EXERCISED:
the mid-display invalidation step (accept-screenplay click failed on driver aim drift while the Development card slid in). **OPEN natively: F21**
— from a focused people row, Down moves the ring to `people:search` instead of the row cursor (rendered real-key test passes; native-only
divergence; IMPL-22 diagnosing the polled/IMGUI consumer). N2's declared remainders: C8 measurement (N3), C9, people-rail parking asymmetry.
**Charges (session clock, this window):** capability ≈ 4.6 h (IMPL-12..21, DESIGN-03..08, plan/sheets), reserve ≈ 3.9 h (TEST-09..19, ten rendered
runs, three builds/seals/admissions, seven native runs, analyses, records, publication). Under the directive the caps are planning checkpoints:
N2 was budgeted 6 / 3.5 h; actuals ≈ 4.6 / 3.9 (reserve over by ≈ 0.4 h, driven by the harness iterations on one test class).

**K10 addendum (2026-09-16 02:50Z) — F21 closed natively on Build54.** IMPL-22 (read-only) found the cause: the KeyDown path reconciled the ring
to IMGUI's focused search TextField (IMGUI's own Tab moves `keyboardControl` into the field — probe `name=studio-people-search-field kbd=45`
while the ring sits on the pictures toolbar), so Down/Return were swallowed by the editor. IMPL-23 (`50790724`, `14c43fd0`, `a5e8340b`): the ring
is reconciled from IMGUI focus only on pointer events; every key route off a field releases name + `keyboardControl` + edge memory; a focus
probe is appended to `rail-focus-ring`. **Build54** (Unity `a5e8340b` / TS `eafd551e`, exe `a332e3bc6189b87dc4ccb2d98c715eaff5d6417a8a8f754915dfddc8c26df2bf`,
seal 49 PASS, admission 45 PASS). Native run `early-2026-09-16T02-49-…` (N2G, 1440×900): Tab×3 → `movie:production:details:prod-0315` → Return
opens the overlay (**F17a PASS**); click search → 'a','s' typed → Tab → `people:search-clear` → Down → `people:person:t-dir-03` → Down →
`t-wri-11` → Return opens that row (**F21/F17b PASS**); the hand-back law releases the editor on the first arrow (`name=none kbd=0`). One
superseded test assertion (click-then-first-key reconciliation) is being re-expressed for the pointer-only law (TEST-21); the rendered full
suite on Build54's source follows. N2 native disposition: F13–F24 all PASS on Build50–54 except the declared C9 body viewport and the
mid-display invalidation step of the stale route (driver aim drift on the sliding Development card — scripted for the next dense-02 run).

## K9. Build50 native runs under the Owner's three-week directive — 2026-09-15 20:05Z–20:27Z (unattended, guard-admitted)
Authority: Owner directive (`docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`); the desktop became idle after
Howard left; every run admitted by the unchanged guard (console unlocked, owner idle ≥ 60 s, listen-only witness, bound Build50 manifest
`319fb167…`, synthetic fixture provenance) and driven through the supervised direct-pipe wrapper (`native-supervised.sh`, caffeinate tied to
the driver pid, 30-s first-progress bound). Analyzer v3 (`check-run-v3.py`, aligns by the driver's own mapPath; v2 retained) — both in
`coordinator-scratch/r3n1e/` on the private mirror. No Owner campaign touched; player exited by its own UI Quit in A6, by the driver's finish
in A5 (UI quit skipped by a script toggle — see F19 withdrawn).
| Run | Evidence (`Evidence/Playability-Interaction-01/`) | Steps | Result |
|---|---|---|---|
| Preflight PF | `early-2026-09-15T20-09-57-345Z` | 9 | PASS — first scripted input acknowledged 2 s after ready; clean owned shutdown |
| A5 (1440×900, dense-01, 100 % then 200 %) | `early-2026-09-15T20-11-58-338Z` | 139 (15 attempt-failed, all script-sequence) | complete; input clean |
| A6 (corrected script) | `early-2026-09-15T20-19-22-804Z` | 87 (8 attempt-failed, script) | complete; UI quit; input clean |
| B1 / B2 (1280×720, dense-02) | `early-2026-09-15T20-15-…` binding refused / `…T20-22-…` | 0 / 0 | NOT RUN — B1: coordinator env path case (`Evidence` vs the manifest's `evidence`), fixed; B2: **stale-source guard** (the N2 writer's edits made the Unity tree newer than Build50 — the guard is right); Run B moves to Build51 |
**F7–F15 native disposition on Build50 (K2's native columns):** F7 **PASS** (pointer overlay: one Escape closes only the overlay; menu stays
closed) · F8 **PASS (Production excursion)** — people offset retained across Production workspace and back (56 → 56); the Profile excursion
was NOT EXERCISED (script targeted an off-screen row twice) · F9 **PASS typing / FAIL after Tab-out** (see F17) · F10 **PASS** — with the lot
selection active after Locate, one click opened the person overlay and, after Back, one click opened the picture overlay; the receipt survived
Back · F11 **PASS** ('h' then 'q' typed into Find; list narrowed then emptied) · F12 **PASS (no menu)** but see F18 · F13 **PASS at 1440×900/200 %**
(headers on their own rows, toolbar stacked, portrait/stage image stacked above text; capture `107-fix-130-rails-200.png`) · F14 **PASS at
1440×900/200 %** for both overlays (person: panel [366,12,680,490], Open profile [380,26,529,68], Locate [380,100,274,68], Back [822,438,210,52],
body [380,186,652,184]; picture: Open production [380,26,652,68], same Locate/Back/body) · F15 **PASS** (opaque body plate in captures 107/116
and `v2-150`). The 1280×720/200 % cell, dense-02 picture overflow and the Schedule-take route stay **NOT EXERCISED** (Run B → Build51).
**New native findings (Build50):** F16 (check, low) after a pointer-opened overlay closes, the next Escape opens the menu (invoking focus not
held on the pointer route); **F17 (defect, medium)** keyboard row activation opens no inspection (Tab×3→Down→Return; Tab-out→Down×2→Return)
in both runs; **F18 (defect, medium)** Escape in Find releases nothing visible and never closes Find (three presses; menu stays closed);
F19 withdrawn (script toggled the open menu closed; Quit is visible at 200 %, capture 133); F20 (minor) monogram glyphs draw above their slot at
200 % (row + overlay header). F16–F18/F20 were added to the N2 writer's assignment (IMPL-12 items 6–9).
**Charges (reserve, session clock):** 20:05:00Z–20:27:00Z ≈ 22 min (preflight, runs, analysis, this record); N1 reserve ≈ 372.5 of 420 min.
Plan/state/directive writing 20:00–20:05 and 20:11–20:13 ≈ 7 min capability (program management).

## K8. Input recovery — OPS-R3-N1-INPUT-RECOVERY-20260915-02 (pointer; the additive record is published, not repeated here)
Order verified (blob `f28ab598` at `0b620524`). Findings that CORRECT K4: the sleep attribution is withdrawn; in both blocked runs the guard's
startup events (six helpers) WERE acknowledged like the good 06:25Z run, the driver logged no command at all (its stdin command loop idled until
witness expiry), and the un-acknowledged token was the finish-stage stop marker written after expiry — the block was the coordinator's FIFO
command harness (the morning's runs used the direct `run-native.sh` pipe); no missing permission was identified and no Owner permission action
was requested. Bounded coordinator-side supervision (direct pipe, explicit run paths from the driver's "ready" line, 30-s first-progress bound,
SIGTERM to the owned driver's own finish handler) was TESTED on an inert owned blocked child: abort at 30 s, clean exit. Preflight, Run A and
Run B: **NOT RUN** — Howard answered "Not now" to the current desktop-availability question. Per-defect native disposition and every K7
residual unchanged. Charges: ≈ 14 productive reserve minutes (19:51:58Z–≈20:06Z), N1 reserve ≈ 351.5 of the amended 420 min; the K6 closing
estimate is superseded by the stamped ledger (correction reserve 115.25 min; 337.45 before this recovery). Record + evidence:
`docs/evidence/r3n1-native-correction-20260915-01/reports/INPUT-RECOVERY-01.md` and `evidence/Unity/r3n1-20/` on the private review branch
at `c80743db4e3624f5c007ddcc5bfb74c88f393a0a` (92 files). Next: with a current desktop statement, preflight through `native-supervised.sh`,
then A and B with fresh admissions.

## K1. Acceptance, desktop basis, ownership
- Order verified: packet `R3-N1-NATIVE-CORRECTION` (SHA256SUMS 5/5 OK) == Git blob `ac0a3d9295c636be1ee2615d225032c20551fbd4` at
  `3cf828a9` (`docs/engineering/playability-launch-review/10-R3-N1-NATIVE-DEFECT-CORRECTION.md`, on
  `origin/docs/playability-r3-hybrid-execution-01`). Same Fable coordinator session as C1 (no restart, no new team, no Workflow tool);
  same registered unity-ui production writer (opus), independent test-author (sonnet by profile) and design continuation owner
  (uiux-designer, opus); ≤ 2 specialists concurrently on disjoint paths; the coordinator remained integration/native-input owner.
  Correction charged from `2026-09-15T10:19:46Z` (packet unpack); the prior publication tail 06:54:21Z–06:59:00Z (4.65 min, reserve)
  is deducted first.
- **Desktop basis:** Howard's continuation statement of 2026-09-14 ("The desktop is available now for the authorized R3-N1 rendered
  PlayMode and native tests. Keep the existing guard and all build/fixture checks.") was re-affirmed for this correction by the
  order's own instruction in this session ("then reverify the actual failing routes … Return the corrected connected native
  candidate"); no new verbatim sentence was given and none was solicited — recorded as the basis, not as perpetual access. The
  unchanged guard (console unlocked + HID idle ≥ 60 s + listen-only witness + bound manifest + fixture provenance + stale-source check)
  stayed mandatory for every rendered and native run and was never taken by foreground input.
- Every specialist assignment, its allowed paths and its evidence root are in the coordinator scratch briefs (IMPL-09/09b/10, DATA-02,
  DESIGN-02, TEST-06/07); the writer listed exact files before editing in `r3n1-12/writer-report-09.md` and
  `r3n1-14/writer-report-10.md` (Unity `Evidence/Playability-Interaction-01/`, gitignored, retained locally).
- Coordinator scope decision recorded: the compact entry cards' geometry in `StudioWorkspaceHost` was treated as the same F10 cause
  (order §2 "related consumers … minimal client-only helpers") and corrected by the writer (IMPL-09b); no other StudioWorkspaceHost
  change was made.

## K2. F7–F15 matrix — original failing run/step/setting · source fix · independent regression · native action/capture · outcome
| ID | Original failing run · step · setting (Build49) | Cause (file, mechanism) | Source fix (Unity commit) | Independent regression (test-author) | Native action · capture (Build50) | Outcome |
|---|---|---|---|---|---|---|
| F7 | R-A `early-2026-09-15T06-25-20-387Z` steps 020–023 / 050–051, 1440×900 @100: Escape on the open compact overlay also opened the Studio Menu | two Escape pipelines: IMGUI ladder in OnGUI vs polled `StudioCameraInput.CancelPressed` consumed in Update() by `StudioSelectionManager.HandleCancel → StudioSystemMenuHud.OpenMenu()` and `StudioCameraDirector`; Update runs first | `dff08b9` + `e05b218`: shared fact `StudioInputFocusGate.GuiConsumesCancel/PolledCancelAllowed`, rails + overlay publish `CancelOwner`, polled consumers defer; menu stays the top rung | EditMode `StudioInputFocusGateEscapeTests` (21); PlayMode `StudioNativeInputAndReturnRegressionTests.Escape_ClosesTheOpenOverlayOrFind…` (rendered PASS, r3n1-15) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F12 | R-A steps 07x (Find open, Escape opened the menu), 1440×900 @100 | same pipelines + missing ladder rung: an open-but-unfocused Find matched no rule | `dff08b9`: rung 3b `CloseTopTransientLayer()` peels filter list / Find before rail focus | same tests as F7 (Find branch) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F8 | R-A steps 020–023: overlay → OPEN PROFILE → Escape reset the employees offset to 0 | return context sound; callers then set `revealFocusedPerson`/`revealAfterTextChange` and the next draw re-scrolled to reveal the invoking row (clipped at the top) → offset 0 | `6d9d530`: restore the saved offset and the invoking focus as a target WITHOUT a reveal; shrink clamp / session / missing-id rules untouched | PlayMode `…ExcursionRestoresTheSavedOffsetAndInvokingFocus_WithoutArmingAReveal_BothRails` (rendered PASS, r3n1-15); Production excursion in the same test | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F9 | R-A steps 04x: after Tab out of the employees search, arrows/Enter still typed until Escape | Tab cleared only the focused control NAME; `GUIUtility.keyboardControl` stayed on the editor (logical focus ≠ GUI ownership) | `dff08b9`: `StudioRailKeyboardFocus.ReleaseTextEntry()` moves name + keyboardControl together on Tab-out/Escape; rails publish `TextEntryOwnsKeyboard` | PlayMode `…FindFocusesItsFieldTheFrameItIsDrawn_AndReleasesBothKeyboardFactsOnTabOut` (re-derived to the published fact in TEST-07) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F11 | R-A step 07x: `pictures-find` gave the field no focus; typing "a" panned the camera | pointer route `TryConsumeToolbarClick` opened Find without `FocusControl`; camera read W/A/S/D unconditionally (`StudioCameraInput.cs:222-232`) | `dff08b9`: one `ToggleFind()` for both routes with a focus request spent at the field in `DrawToolbar`; `CameraMovementAllowed` withholds all movement keys while a rail field owns the keyboard | same PlayMode test + EditMode `CameraMovementAllowed` cases | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F10 | R-A steps 030–032: after Locate (world selection + receipt), a rail row click was dead | (1) a lawful Locate selects a body → compact entry card raised; both rails treated `ProductionEntryDisplayed/CastingEntryDisplayed` as a workspace and retired; (2) `TryOpenLaneInspector` answered "opened" while unhostable and `Update()` closed it (activation swallowed); (3) the entry cards were anchored inside the pictures rail's band (`StudioWorkspaceHost.cs:2288-2292`) | `2b84a2b` (employees rail yields only to a real workspace; hostability refusal) + `1861c49` (entry cards dodge the pictures rail, one card at one depth) + `40b4e5c` (pictures rail yields only to `WorkspaceOpen`) | EditMode `StudioLegacySuppressionTests.RailHudSource_YieldsOnlyToARealWorkspaceOnBothRails` (re-derived pin; failed on the unfixed rail, green after `40b4e5c`); PlayMode `…EmployeeRowActivationOpensExactlyOneInspection…` (rendered PASS, r3n1-15) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F13 | R-A after `studio-menu-text-200`, 1440×900 @200: headers clipped/overlapped, card title/stage broke mid-word beside the 144-px slot, LOCATE over the state line | fixed `− 96·w` header rect and fixed `18·s` row; card text column 129 px beside the image; screenplay LOCATE drawn full-card-height | `7b5ae6e` (measured full-inner-width header row stacks; bottom-anchored measured action zones reserved in measure and draw) + `3a0ef0d` (card/row stack image above text below a ten-character specimen) | EditMode `StudioR3N1Impl10LayoutContractsTests` (R3/R4 cases); PlayMode R3 pairwise-disjoint header/toolbar rects at 1440×900/200 % | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F14 | R-A 1440×900 @200 picture overlay: unclamped 3-line 40-px title consumed the 490-px overlay; `inspector-open-production`/`inspector-locate` at y −138/−64; body 1 px | `MeasureLaneHeader` sized the header from unclamped `CalcHeight(title)` | `d15a16b`: bounded header rows + R1 ladder against `min(0.40·envelope, envelope − footer − bodyMin)`, rect floored at header+footer+bodyMin, action rects from the FINAL rect gated by `LaneInspectorActionPublishable`, clamped title/sub-line reflowed into the body | EditMode R1 six-cell table + publishability boundaries; PlayMode R1 panel containment + bodyMin at 1440×900/200 % | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F15 | every overlay capture: body text over the lot | only `GUI.skin.box` behind the rect + `SurfaceContainer` α 0.86 | `9d63aac`: `SurfacePlate` α 1.0 under the whole body, drawn before `BeginScrollView`, keylines outside the scroll view, opaque header/footer stock | EditMode R5 plate/keyline rect laws (component evidence only) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| §3 cell | R-D `early-2026-09-15T06-45-52-043Z`, 1280×720 @200: `inspector-fallback` (full workspace) | sheet §C.9 needed 484 px in a 310-px envelope | addendum R2 (TS `43b3a6b1`) + `d15a16b`: header N=0 (title in the body) 92 + footer 94 + bodyMin 120 = 306 ≤ 310; `inspector-fallback` only where no lane is composed | three withdrawn-fallback pins re-derived (TEST-07 item 00); PlayMode R2 person+picture compact hosting at 1280×720/200 % | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |

## K3. Candidate pins — source, build, seal, admission, fixtures
| Identity | Value |
|---|---|
| Unity source | `18b893a6` → **`74c2141a241a11e43affd9dee909a74b4b1b9e2e`** (13 commits: IMPL-09 `dff08b9`,`6d9d530`,`2b84a2b`,`e05b218`; IMPL-09b `1861c49`; TEST-06 `c3207c0`; IMPL-09c/10 `40b4e5c`,`9d63aac`,`d15a16b`,`7b5ae6e`,`3a0ef0d`; TEST-07 `c06e419`; IMPL-11 `44cddab`; settings restore `ae3695b`; TEST-08 `74c2141`); pushed fast-forward, remote == local |
| TS source | `ccc49ae9` → **`43b3a6b1da3360feed31e5c5be421817a5d003aa`** (DATA-02 test `e11933b2`, design addendum `43b3a6b1`; this record follows as a docs commit — not a new build); production TS unchanged since `31f6e70d` (engine bundle `af1e8897…`, worker `807f28a6…` unchanged from Build49) |
| **Build50** | executable sha256 **`c9816921214127a74b93033b424fea191205e24d7be05cc05c88b3a11f31c177`**, Assembly-CSharp `73ac20c00fb60290f6cd206217ca99780ee9c6f1bccd7e844d080a67ce94128c`, built 2026-09-15T13:03:06Z, manifest sha256 `319fb167eaffc4e163ed25e6dde26fd45a2714be432e7d811aee5dbad3778189` (`Builds/macOS/build-manifest.json`; evidence `interaction-build-50/`, log `interaction-build-50.log` "Build Finished, Result: Success"); Build49 (`53742268…`) and its manifest/evidence retained unchanged as the recoverable partial |
| Seal | `entry/paired-verifier-interaction-45.json` **PASS** — TS `43b3a6b1` / Unity `74c2141a`, DTO blob `9420d5ef5e5b7db5d9c18d2300f22a3d94074eb2` both sides, schema `sha256:e64a3b65…` (Save V20 / protocol4 / projection30; no wire change) |
| Admission | `interaction-native-admission-41.json` **PASS** (Build50 ↔ pair 45; meshes 128, dependencies 240) |
| Fixtures | `r3n1-dense-01` sha256 `2e0ede0b…` (unchanged, byte-verified); **`r3n1-dense-02`** sha256 `bd64bbeb1dce2f39455e20ee1b562f1d16c464bd76d907624fe7774e8d251005` (126 547 bytes, week 21); `f2-set-blocker-01` unchanged |
| Design | sheet `R3-N1-COMPACT-INSPECTOR-MEMO-SHEET.md` (12 REV02 edits) + **`R3-N1-SHEET-REVISION-02.md`** (R1–R5; §C.9 fallback withdrawn) at TS `43b3a6b1` |
| Guard / desktop | `entry/desktop-and-guard-admission-r3n1-02.json`: guard modules byte-identical to the 2026-09-14 record (hid-guard, witness, coherent map, startup, console-state, driver) |
Changed Unity paths (13 commits, +1 899/−201 lines incl. tests): `Runtime/Infrastructure/{StudioInputFocusGate, StudioRailReturnContracts,
StudioPeopleRailContracts}.cs`; `Runtime/Presentation/{StudioCameraInput, StudioCameraDirector, StudioSelectionManager, StudioHud,
StudioLaneInspectorHud, StudioPeopleRailHud, StudioProductionRailHud}.cs`; `Runtime/Presentation/UI/StudioWorkspaceHost.cs` (entry-card
geometry + one-card-at-one-depth yield only); tests `Tests/EditMode/{StudioInputFocusGateEscapeTests (new), StudioR3N1Impl10LayoutContractsTests
(new), StudioLegacySuppressionTests}.cs`, `Tests/PlayMode/{StudioNativeInputAndReturnRegressionTests (new), StudioProductionAndCampaignLayoutTests}.cs`.
Not changed: DTOs, schema, System Menu (its polled Escape path was inspected; the consumer that opened it — `StudioSelectionManager.HandleCancel` —
is the one gated), scenes, campaigns, launcher, Tools, hid-guard, package roots, Build49 evidence.

## K4. Verification actually run — rendered PlayMode, EditMode, TS, native runs (counts and applicability)
| Check | Source | Discovered/executed | Passed | Failed | Skipped | Evidence |
|---|---|---|---|---|---|---|
| EditMode (batch, whole platform) | Unity `e05b218` → `1861c49` (writer) | 1676 | 1676 | 0 | 0 | `r3n1-12/editmode-writer-01..04.xml` (+ `-04-railyield-blocked.xml`: 1675/1676, the deliberate pin) |
| EditMode | `c3207c0` (TEST-06) | 1697 | 1696 | 1 | 0 | `r3n1-13/editmode-tests-01.xml` — the one failure is the re-derived F10 pin against the not-yet-narrowed pictures rail |
| EditMode | `3a0ef0d` (IMPL-10) | 1697 | 1697 | 0 | 0 | `r3n1-14/editmode-writer-03.xml` |
| EditMode | `c06e419` (TEST-07) / `44cddab` (IMPL-11) / `74c2141` (TEST-08) | 1751 | 1751 | 0 | 0 | `r3n1-16/editmode-tests-03.xml`, `r3n1-14/editmode-writer-04.xml`, `r3n1-18/editmode-tests-01.xml` |
| Rendered PlayMode, class (Editor GameView) | `c3207c0` | 4 | 3 | 1 | 0 | `r3n1-15/playmode-rendered-test06-class-01.xml` — F11 read outside OnGUI (test), re-derived in TEST-07 |
| **Rendered PlayMode, full** | `c06e419` | 209 | 203 | 6 | 0 | `r3n1-17/playmode-rendered-correction-01.xml` — 1 product regression (DETAILS reserved the old fixed zone width above 100 %, fixed `44cddab`), 2 harness defects (registry publishing switched off by the host's first Update; `hud-open-build` publisher absent), 1 un-composed lane, 1 outside-OnGUI Tab release, 1 stale rail-yield pin — all re-derived in TEST-08 without weakening |
| **Rendered PlayMode, full** | **`74c2141`** | **209** | **209** | **0** | **0** | `r3n1-17/playmode-rendered-correction-02.xml` |
| Broken-candidate proof | `c3207c0` Runtime + TEST-07 tests | — | — | compile: 235 × CS0117 | — | `r3n1-16/playmode-broken-01.log` (the new laws do not exist on the broken candidate; the F10 pin failed on it, above) |
| TypeScript full suite | TS `43b3a6b1` | 5282 | 5277 | 0 | 5 | `entry/full-typescript-suite-06.{json,log}` (production TS unchanged since `31f6e70d`) |
| Command-owner stale tests | TS `e11933b2` | 4 | 4 | 0 | 0 | `entry/r3n1-dense-02-test-run.log` |
Batch PlayMode runs by the test owner (`r3n1-13/16/18/playmode-tests-*.xml`, 10/22 etc.) are retained as headless artifacts only
("No graphic device" / zero-rect); the rendered runs above are the applicable evidence. The rendered run's antiAliasing side effect was
committed once by mistake (`44cddab`) and restored byte-for-byte in `ae3695b`; Build50 is built from the restored settings.
**Native attempts on Build50 (each its own identity, admission and evidence; failed attempts preserved; none combined):**
| Attempt | Evidence (Unity `Evidence/Playability-Interaction-01/`) | Guard outcome | Steps | Finding |
|---|---|---|---|---|
| Run A (interrupted) | `early-2026-09-15T13-03-49-308Z` | admitted 13:03:53Z (unlocked, owner idle 7 281 s); player `c9816921…` launched, `000-lot.png` + `initial-map.json` captured 13:04:00Z; the driver's FIRST injected HID event (null token `67917745056450`) never received an ordered acknowledgement ("ownerinput: posted event was not acknowledged; no retry"); the driver then waited until the listen-only witness EXPIRED at its 7 200-s lifetime (15:03:54Z, `witness-end reason=expired`, 72 732 heartbeat records, no foreign input) and stopped: `WitnessUnavailable … Witness ended before the drive finished`; input state clean at start and end, owned events 0 | 0 | **clock-discontinuity finding**: the coordinator's shell clock advanced 13:03:48Z → 15:04:01Z across a ≤ 7.5-min wait loop. **Sleep is NOT supported as the cause**: `pmset -g log` shows powerd's 15-minute assertion summaries and the lid-open counter advancing continuously through the gap (`r3n1-19/sleep-and-desktop-evidence.txt`). Cause on the evidence: the unacknowledged injection blocked the driver for the witness lifetime; why the acknowledgement never arrived is not established (candidates: an event-tap/permission change for the freshly compiled `ownerinput` helper, or another desktop automation holding the event path — Codex Computer Use assertions were logged later at 16:18:53Z) |
| Run A2 (retry) | `early-2026-09-15T15-04-35-523Z` (`console-admission.json` only) | **refused at admission**: "No unlocked 60-second owner-idle admission" (owner idle < 60 s — the desktop was in use) | 0 | no player launched |
| Run A3 (retry, caffeinated) | `early-2026-09-15T16-20-04-515Z` | admitted 16:20:08Z after a read-only wait for owner idle ≥ 90 s; `/usr/bin/caffeinate -d -i -s -w <driverPid>` tied to the driver (recorded in `native-A3.log`, exited with the driver); player launched, `000-lot.png` + `initial-map.json` captured; stopped 16:21:36Z: `HumanInputDetected: foreign input detected — automation suspended` (physical `mouseMoved`, sourcePid 0) | 0 | the guard worked as designed; Howard confirmed in-session ("Sorry keep going") that the movement was his — desktop availability re-established for the next attempt |
| Run A4 (retry after Howard's "keep going", caffeinated, watchdog armed) | `early-2026-09-15T16-23-33-578Z` | admitted 16:23:33Z (owner idle 96 s); player `c9816921…` launched, `000-lot.png` + `initial-map.json` captured; **identical failure to the first run**: "ownerinput: posted event was not acknowledged; no retry" → `No ordered acknowledgement for null token 18956271512613` → the driver waited for the witness lifetime and stopped at 18:23:38Z (`witness-end reason=expired`, 72 732 heartbeats, no foreign input, owned events 0); the coordinator's watchdog did not fire (its evidence-directory glob failed under zsh nomatch) and the shell clock again advanced exactly 7 200 s | 0 | **specific blocker (native HOLD)**: on this desktop session the witness records the ownership-establishing null event of the FIRST helper (seq 1, `sourceStateId 0`) but never the ordered acknowledgement (`sourceStateId 1`) that the 06:25Z run recorded (`early-2026-09-15T06-25-20-387Z/hid-witness.jsonl` seq 3), and the token the driver waits for belongs to the LAST helper (pid 27204 / 92260), whose events the witness never sees at all. Guard/driver bytes are unchanged since the successful runs; the environment changed: a competing desktop automation (SkyComputerUseService "Codex Computer Use") holds event/assertion state since 16:18Z, and the `ownerinput` helper is recompiled at each start (a fresh binary may lack the Accessibility / Input Monitoring grant). Desktop-owner action needed before any further attempt: verify System Settings › Privacy & Security › Accessibility and Input Monitoring for the ownerinput helper and node, end the competing computer-use service during runs (or log out/in to reset event taps). No further retry was made (four attempts; no indefinite loop). |
| Run B (1280×720, dense-02) | script `run-B-1280-dense2.jsonl` prepared (101 steps: pictures overflow, Schedule-take route, the 200 % compact cell) | not started — the Run A blocker stands and the N1 reserve is exhausted at this record | 0 | NOT EXERCISED |
Pre-existing power assertions not started by this coordinator and left untouched: `caffeinate -dims` (pid 2372, since 2026-09-12) and
short `caffeinate -i -t 300` processes (pids 2893/4016, 16:18Z/16:22Z). Analyzer: `r3n1-19/analyzer-version.json` — the coordinator-side
map reader `check-run.py` v2 (sha256 `850ca1be…`) counts visible elements only, matching `mapsum.py`; the driver's capture/guard tools were
not changed (byte-identical hashes in `desktop-and-guard-admission-r3n1-02.json`); analysis outputs are named `<run>-check-v2.txt`.

## K5. DATA-1 / UX-STALE-NATIVE-01 — the bounded managed-mode attempt
- DATA-02 (test-author, 12 min): a read-only probe of all 17 existing checkpoint fixtures
  (`entry/r3n1-dense-02-source-probe.md`) found `native-post-start-run16` already in `scriptDevelopment.mode === "managed"` with one
  active production `prod-0015` carrying a live offered decision — so `activateScriptDevelopment` was never needed or attempted. From
  it, `entry/generate-r3n1-dense-02.ts` applied 3 × `commissionScript` (writer `t-dir-00`, the source's one spare contracted talent —
  lawful under `requireCommissionableWriter`) + 2 × engine `tick`, every step N=4-gated (cash $12,206,459 → $12,113,655, never
  negative, `productionQueue` empty at every evaluation), and wrote the immutable fixture `fixtures/r3n1-dense-02` (sha256
  `bd64bbeb1dce2f39455e20ee1b562f1d16c464bd76d907624fe7774e8d251005`, 126 547 bytes, week 21, digest `c5f13827…`; `wx`, mode 0600;
  r3n1-dense-01 byte-identical after the run). Wire counts: roster employed 2 / freelancer 10 / known 72; productionOperations 1
  (`ready-to-schedule`); development managed, 4 projects (1 inProduction, 2 review, 1 drafting); 0 released. **Pictures-rail overflow
  lawful: 4 cards** (1 production + 3 non-inProduction script cards — script cards counted only where the rail genuinely displays them,
  never relabelled as filming). Offered decision: `resolveProductionBlocker` / `scheduleShootingTake` on `prod-0015` ("Schedule the
  shooting take"), preserved untouched.
- Command-owner test `tests/r3n1-stale-schedule-take-02.test.ts` (TS `e11933b2`): STALE_REVISION and INTENT_NOT_AVAILABLE refusal on
  THAT decision (staleness induced by the unrelated lawful `acceptScreenplay` intent) and fresh-intent accepted-once idempotence — 4/4
  with the first test (`entry/r3n1-dense-02-test-run.log`). The first test's "nearest offered decision" wording stays as recorded; this
  second fixture's decision IS the literal Schedule-take route.
- Different immutable fixtures prove different things and are named as such: r3n1-dense-01 (people overflow, legacy mode), r3n1-dense-02
  (pictures overflow + the Schedule-take decision, managed mode), f2-set-blocker-01 (ordinary waiting). None occurred in one campaign.
- **Native (Build50):** NOT EXERCISED — Run B was never admitted (K4). UX-STALE-NATIVE-01 therefore stays at: server refusal proved by two
  command-owner tests (8 assertions across both fixtures); client-side prevention documented from source — `StudioWorkspaceHost.
  DisplayedProductionOperation.cs` re-derives the displayed decision from the CURRENT snapshot at submission (`StillDisplayed()`: same
  intent JSON, same `currentCommand`, same session/runtime/replacement) and refuses to send otherwise, and the deferred path re-validates
  against `displayedIntentRefresh` ("Confirming the action with the current studio state…"); the single-actor native client always submits
  the current `stateRevision` (`StudioBridgeClient.cs:620`), so a genuine stale submission is not constructible natively without a second
  actor — the visible-invalidation capture (accept a screenplay, return, re-derived Schedule take, accepted once, no duplicate dispatch) is
  scripted in `run-B-1280-dense2.jsonl` and remains owed. Residual unchanged in kind: "no native capture of a refused or visibly
  invalidated Schedule-take yet".

## K6. Charges — this correction, cumulative N1, whole program
| Counter | This correction (productive, session clock once) | Windows |
|---|---|---|
| Prior publication tail (reserve) | 4.65 min | 06:54:21Z–06:59:00Z (closing commit/push/read-back/reply of the continuation) |
| Capability | **63.98 min** | 10:19:46–11:03:00 (packet, briefs, IMPL-09/09b, DATA-02, DESIGN-02) · 11:26:30–11:47:15 (IMPL-10) |
| Reserve (verification/correction/delivery) | **≈ 131 min** = 109.25 + closing ≈ 22 (stamped in the private ledger) | 11:03:00–11:26:30 (TEST-06, rendered class run) · 11:47:15–12:14:38 (TEST-07, TS suite/push) · 12:14:38–13:05:00 (rendered suite ×2, IMPL-11, settings restore, TEST-08, push, Build50, seal 45, admission 41, Run A start) · 15:04:00–15:05:30 (A2) · 16:18:00–16:24:30 (clarification, evidence, A3, A4 start) · 18:24:00–close (A4 outcome, record, publication, ledger) |
| Excluded — documented inactive latency, no productive activity (no tool call, no file change) | 13:05:00–15:04:00 (119.0) · 15:05:30–16:18:00 (72.5) · 16:24:30–18:24:00 (119.5) = 311 min | the driver was blocked waiting for an acknowledgement that never came (twice, each exactly the 7 200-s witness lifetime) and the coordinator sat idle between A2 and the clarification; NOT sleep (`r3n1-19/sleep-and-desktop-evidence.txt`); listed as latency, separate from productive charges |
| **N1 cumulative** | capability **224.58 / 1 200 min** (3.74 h of 20) · reserve **≈ 353 / 360 min** (≈ 5.9 h of 6; ≈ 7 min remaining at the close — effectively exhausted) | prior 160.60 / 217.55 + this correction |
| Whole program (provisional) | capability remaining ≈ 44.66 h · reserve remaining ≈ 11.4 h (last 6 h protected, untouched) | from C5's 45.729 / 13.652 |
Classification rule: identical to C5 (specialist wall-clock never summed; regression authoring, corrections found by verification, builds,
seals, admissions, native attempts and the record charged to the reserve; feature/correction implementation, fixture and design to
capability). The alternative reading (TEST-06/07 regression authoring as capability, ≈ 51 min) is stated for Current Ops only, not
applied. Unattributed setup/smoke time remains NOT REPORTED, not zero. Balances PROVISIONAL.

## K7. Residuals, remaining coverage, stop state, publication
**Residuals (honest labels):**
1. **Native proof of F7–F15, the 1280×720/200 % cell, DATA-1 pictures overflow and UX-STALE-NATIVE-01 — NOT EXERCISED** (hold). Blocker
   and the desktop-owner action are in K4. Both run scripts are ready; cost when admitted ≈ 15 min of reserve — which N1 no longer has:
   Current Ops must either allocate from the whole-program reserve (11.4 h, last 6 h protected) or accept the candidate as
   source-corrected/rendered-verified only.
2. The rendered 209/209 does not close the nine defects natively; every F row above is FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED.
3. Addendum R3.3 (tab strip capped at 2 scrolling rows, pictures footer abbreviations) not implemented → the pictures list at 1280×720/200 %
   keeps a ≈ 10 px shortfall against its floor (a scroll cost, declared). R1.5 "More actions ▸" not implemented (no 3-action footer exists
   in the shipped variants).
4. Unity `Evidence/` is gitignored: all writer/test reports, xml/logs and native attempt directories are retained locally and indexed by the
   private review publication (below); originals untouched.
5. Carried from C6 unchanged: remaining screens/workflows, portrait/icon/font/stage art, lawful dragging, help/history, text acceptance;
   S6 fit conclusion stands. No Owner acceptance is claimed; Build46 = Current Ops-qualified engineering checkpoint; P13A accepted product.
**Cleanup and ownership at this record:** no driver, player, ownerinput, witness, FIFO holder or coordinator caffeinate process remains
(verified by process listing after A4); pre-existing `caffeinate -dims` (pid 2372) and the desktop's own automation are not mine and were
not touched; ProjectSettings restored (`ae3695b`); both worktrees clean and pushed; Build49 evidence/manifest untouched; Owner campaigns
untouched (only disposable synthetic fixtures were bound). Fable remains integration/native-input owner; actual new input still requires
admission and the desktop-owner action above.
**Publication:** private Unity review branch `docs/playability-delivery-review-20260913-01`, new folder
`docs/evidence/r3n1-native-correction-20260915-01/` (index `00-START-HERE.md`, this record, the matrix, essential text evidence,
representative captures, `manifest.json` + `SHA256SUMS.txt`; machine paths and private session links sanitized in copies only; witness
JSONL, player bytes, checkpoints and the 190-map archives withheld with locators). Fast-forward pushes of owned WIP/docs refs only; no PR,
merge or protected promotion; no P13B/P14/P15/P16.
**Next action:** desktop owner clears the acknowledgement blocker (K4); then, with a Current Ops reserve disposition, the two prepared
runs (A then B) under the unchanged guard with caffeinate tied to the driver, followed by the K2 native columns and Owner review.

---

# R3-N1 continuation record — 2026-09-14/15 · OPS-R3-N1-CONTINUE-20260914-02

**N1 CONNECTED NATIVE REVIEW REACHED ON BUILD49 — DELIVERED AS A PARTIAL WITH NINE NATIVE DEFECTS DECLARED, ONE DECLARED FALLBACK CELL AND ONE LAWFUL-DATA LIMIT. NOT OWNER-ACCEPTED. NO P13B, PR, MERGE OR PROTECTED PROMOTION.**
This section sits above the R3-N1 execution record (R1–R8), the successor record (S1–S7) and the historical text, all unchanged.
It is the one evidence-linked record of the continuation's acceptance, the desktop statement, the design-owner resolution,
the delivered design/source/test/fixture increment, the rendered and native verification actually run, charges, and the
remaining full-overhaul coverage. Private identifiers stay in the Git-private `fable-local-transfer-20260914-01/
r3n1-continuation-acceptance-local.json` and `r3n1-ledger-local.json`.

## C1. Acceptance, desktop statement, design-owner resolution
- Order verified: packet `R3-N1-CONTINUATION` (SHA256SUMS 4/4) == Git blob `9b4760cd00ccad20b04dc1e07ee789a504e2f7a8` at
  `3b64da61` (on `origin/docs/playability-r3-hybrid-execution-01`). Same coordinator session as R1 (Fable 5.1, bypass
  permissions, hooks disabled by flag, `--add-dir` Unity); registry unchanged; Workflow tool not used (coordinator contract);
  every specialist ran Opus or lower (uiux-designer/unity-ui = opus, test-author = sonnet by profile). Continuation charged
  from `2026-09-14T19:13:42Z`; the session was idle `2026-09-14T23:02Z → 2026-09-15T06:10Z` (excluded from every counter).
- **Desktop:** Howard's statement — "The desktop is available now for the authorized R3-N1 rendered PlayMode and native tests. Keep
  the existing guard and all build/fixture checks." — recorded verbatim in TS `Evidence/Playability-Interaction-01/entry/
  desktop-and-guard-admission-r3n1-01.json` with the guard-module hashes (byte-identical to the 2026-09-12 record). The guard
  (console lock, 60-s HID idle, listen-only witness, owned window binding, bound manifest, fixture provenance, stale-source check)
  stayed mandatory and admitted every run; zero suspensions; no human input witnessed.
- **Design owner:** the R3 design session is inactive (last design commit `b56088d6`, 2026-09-12; no worktree holds
  `docs/uiux-whole-game-review-01`; no writer evidenced) → the registered uiux-designer was assigned sole continuation owner of the
  ONE missing sheet on the disjoint path `docs/engineering/playability-launch-review/r3-n1-design/` (TS `504add39`). R3 files
  untouched; the hybrid selection was not reopened; no second designer.

## C2. Rendered PlayMode — actual counts (Editor GameView via `ConfigureEditorViewportForVerification`, never `-batchmode`)
| Run | Source | Executed | Passed | Failed | Skipped | Findings |
|---|---|---|---|---|---|---|
| `r3n1-01/playmode-rendered-baseline-01` | Unity `7471d24` (preserved checkpoint) | 202 | 200 | 2 | 0 | F1 stale threshold (test): LOCATE height is exactly `max(24·band, 22·text)`; F2 (production): receipt overlapped the slid memo at 1280×720/150 % |
| `r3n1-04/playmode-rendered-final-01` | Unity `ea451a39` | 202 | 200 | 2 | 0 | F3 route identity (test); F4 IMGUI Layout/Repaint mismatch (production, fixed `3d58d16`) |
| `r3n1-07/playmode-rendered-final-02` | Unity `c6161ce4` | 202 | 201 | 1 | 0 | F4 gone; F5 focus-restore race in the test's zero-yield sequence (test) |
| `r3n1-09/playmode-rendered-final-03` | Unity `d2f3f12d` | 202 | 201 | 1 | 0 | F6: picture card LOCATE never published above 100 % — zone law `22·s` under the `24·s` publication floor (production, fixed `e474f6e`) |
| `r3n1-10/playmode-rendered-class-01..04` (one class) | `e474f6e` + tests | 15 | 14/14/14/**15** | 1/1/1/**0** | 0 | diagnostic dump: at 1280×720/200 % the pictures list viewport is 144 px (four 60-px chrome rows) so the fixture's 477-px card keeps its LOCATE zone off-screen; test now reveals it through the product's own route |
| **`r3n1-10/playmode-rendered-final-04`** | **Unity `18b893a6`** | **202** | **202** | **0** | **0** | clean |
All ten batch-only failures and F1–F6 are closed (F1/F3/F5/F6-test re-derived by the test owner, never weakened; F2/F4/F6-law fixed by
the writer). Batch records are retained beside the rendered ones; batch PlayMode still cannot render IMGUI (environment).

## C3. Delivered — exact identities and changed paths
| Identity | Value |
|---|---|
| Design sheet | `r3-n1-design/R3-N1-COMPACT-INSPECTOR-MEMO-SHEET.md` + 4 SVG (TS `504add39`): lot-centre lane, tools row (BUILD + `memo-details-open`), compact next-action band, explicitly opened Studio-next-steps sheet, compact inspector overlay with both rails alive, occlusion order, Escape ladder, text rules, keys 1/2/3; the 1280×720/200 % inspector cell declared a full-screen fallback |
| Unity | `7471d24` → **`18b893a6`** (23 commits: IMPL-03 `1af1e4b..f57599b`, IMPL-04 `bfc61dd..25a2882`, IMPL-05 `fc16267..72a02a8`, IMPL-06 `3d58d16`, IMPL-08 `e474f6e`; tests `ea451a39`, `c6161ce4`, `d2f3f12d`, `18b893a6`); pushed fast-forward, no force |
| TS | `afad4137` → **`2f16c22e`** (design sheet `504add39` + stale-route test `2f16c22e`; production TS unchanged = `31f6e70d`; `dist/studio/engine.mjs` `af1e8897…` unchanged) → this record; pushed fast-forward |
| Fixture (DATA-1) | `Evidence/…/fixtures/r3n1-dense-01/generated-r3n1-dense-01.checkpoint.json` sha256 `2e0ede0b699994970d04cf3de8678c61cf2b4fd9562c69c8e9625eb0a8924f5b`, 448 724 bytes, week 316, digest `7f7a4eab…`; generator `entry/generate-r3n1-dense-01.ts` from native-performance-316-01; 4 lawful `signContract` actions, each N=4-gated (`weeklyPayroll` + tuning overhead + `weeklyPlacementOperatingCost` + `weeklyResearchSpend`, due commitments 0, cash ≥ 0 throughout); wire counts employed **11** / freelancer 6 / known 68, productions 1 (`prod-0315` development-working), development projects 0 (campaign in `legacy` script mode), released 0 |
| Seal / Build49 | `entry/paired-verifier-interaction-44.json` PASS (TS `2f16c22e` ↔ Unity `18b893a6` from `origin`, DTO blob `9420d5ef` both sides); **Build49** built `2026-09-15T06:24:52Z`, executable sha256 `5374226871edfb14e770d4bdbb92ad26e75ddaeb5b62fb9a405e63a1652351cd`, Assembly-CSharp `f5ac1c42…`, manifest sha256 `173b80a2b11c98eb2d332d51f82e6f018880347fb5399de2134b34da7d86bf13`, engine/worker/worker-source unchanged, cold-import + scene validation clean, `interaction-native-admission-40.json` PASS. Build48 (`8b83d164…`, seal 43, admission 39) superseded and retained; Build47/Build46 preserved |
| TS test | `tests/r3n1-stale-schedule-take.test.ts` 2/2: STALE_REVISION / `state-stale` with unchanged digest, and INTENT_NOT_AVAILABLE / `intent-unavailable` for the old intent id at the current revision (the fresh intent then accepted once) — **server refusal**; full TS suite 5275 passed / 5 skipped / 0 failed (`entry/full-typescript-suite-05`) |
Changed Unity paths: `Runtime/Infrastructure/{StudioInputFocusGate (new), StudioRailReturnContracts (+StudioLayoutPassLatch, lane/band/sheet/overlay/inspector-content laws, PublishedControlMinHeight), StudioMovieRailContracts, StudioBridgeClient (+ReleaseMemo, +ResearchMemo)}.cs`; `Runtime/Presentation/{StudioCameraInput, StudioProductionRailHud (LocateZoneHeight/Rect), StudioPeopleRailHud, StudioDevelopmentCardHud, StudioHud (partial), StudioLaneInspectorHud (new), StudioBuildCommandHud}.cs`; `Runtime/Presentation/UI/StudioWorkspaceHost.cs` (+8, read-only seam); tests `Tests/EditMode/{StudioInputFocusGateTests, StudioScreenplayInspectionContractsTests, StudioLaneLayoutContractsTests, StudioLaneInspectorContractsTests}.cs` (new), `{StudioPictureCardContractsTests, StudioMovieRailContractsTests, StudioProductionRailTests}.cs` (extended), `Tests/PlayMode/StudioProductionAndCampaignLayoutTests.cs` (F1/F3/F5/F6 re-derived, memo assertions re-derived to the band/sheet). EditMode whole platform **1676/1676**. Not changed: DTOs, schema, camera director/controller, System Menu, scenes, campaigns, launcher, package roots, historical evidence.

**DATA-1 actual result:** people-rail overflow reached lawfully (11 employed); pictures-rail overflow **not lawfully reachable** from the
admitted source — `commissionScript` and its siblings require managed script development, and `activateScriptDevelopment` lawfully
refuses while `prod-0315` is active (reproduced and asserted, not routed around). No cash injected, no relabelling; the waiting picture
stays `f2-set-blocker-01` (`prod-0327`, resource-wait). Side finding for its owner: `tests/_m5Fixtures.ts` `studioTheWeekBeforeWrap`
throws under the current engine (used only by `_m5PlaytestSave.ts`).

## C4. Native tasks, captures, critique
Driver direct mode, Build49, guard admitted; text sizes set in-run via `studio-menu-text-*`; every run ended by the game's own UI Quit
(`campaign-leave-discard` on the disposable synthetic fixture), input finalization **clean**, player exit 0.

| Run | Viewport · fixture | Evidence (Unity `Evidence/Playability-Interaction-01/`) | Steps | Performance |
|---|---|---|---|---|
| R-A | 1440×900 · r3n1-dense-01 · 100/150/200 % | `early-2026-09-15T06-25-20-387Z` (report.json, steps.json, 190+ maps, screenshots `r3n1-*.png`) | 194 | 30-s sample 3 408 frames, captured through quit |
| R-D | 1280×720 · r3n1-dense-01 · 100/150/200 % | `early-2026-09-15T06-45-52-043Z` | 55 | 30-s sample 3 227 frames, captured through quit |
| R-W | 1280×720 · f2-set-blocker-01 (waiting) · 100 % | `early-2026-09-15T06-50-12-704Z` | 25 | not sampled |

**Demonstrated natively (element map + screenshots):** lane composition (lane 836 px at 1440×900, 716 px at 1280×720; employees rail
18..264 / 18..242, pictures rail 1142..1428 / 1000..1268; tools row BUILD + `memo-details-open`; band 94/124/218 px); compact inspector
overlay bottom-anchored 680 wide for person (311 @100, 536 @150 = ceiling, 490 @200) and picture (390 @100) with **both rail plates
published, band yielding, chip/BUILD/MENU present**; the declared fallback at 1280×720/200 % (`inspector-fallback` published, person →
full Profile workspace, picture → full Production workspace, Escape returns to the lot); memo sheet at every cell incl. 1280×720/200 %
(680×190) with `memo-scroll`, `memo-intent-*` and `memo-research-*` routes; Back control retains both offsets, filters and selection;
row cursor Up/Down without any camera movement (world anchors byte-equal) and Enter inspecting the cursor row two rows down; Locate from
the picture overlay frames the worksite with the camera's own `world-back-to-studio` while overlay and rails stay alive; Waiting/Active
filter and library toggle reset only the pictures list, the People tab resets only the employees list; BUILD reachable and its Escape
closes it without the menu; wheel over the pictures list never changed the camera; waiting picture `prod-0327` shows the wire's cause
"Held for a set check" + detail + consequence, remedy labels as text, company members with exact ids; a person's withheld Locate carries
the wire's reason ("On the lot this week; no body to locate right now.").

**UX-STALE-NATIVE-01:** server refusal proved by the TS command-owner test (STALE_REVISION / INTENT_NOT_AVAILABLE); client-side
prevention observed only as the full workspace re-deriving its displayed commands from the fresh snapshot on reopen (no production in a
Schedule-take state exists in any lawful fixture: the dense fixture's picture is in development, the waiting fixture's in resource-wait).
Still not a PASS; the exact residual is "no lawful actionable Schedule-take route reachable natively yet".

**Native defects found (all real, none hidden; fixes are the next stage):**
- **F7** Escape on an open compact overlay pops it **and** opens the Studio Menu (the polled Escape owner is not gated by the overlay).
- **F8** overlay → OPEN PROFILE → Escape resets the employees rail offset to 0 (the Production-workspace route retains it).
- **F9** after the Tab ring leaves the employees search field, arrows/Enter still behave as text entry until Escape (IMGUI keyboard
  control not released).
- **F10** while a lot selection is active (after Locate), a rail row click neither opens the overlay nor a workspace (dead click;
  Escape clearing the selection restores the route).
- **F11** activating Find gives the field no keyboard focus — typing "a" panned the camera; **F12** Escape in Find opened the menu.
- **F13** at 200 % (1440×900) the rail headers clip/overlap ("EMPLOYEES 11" → "S 11", "ROSTER ▸" wraps over it, "PICTURES" over
  "No decisions"), the card title and stage word break mid-word beside the 144-px image slot, and LOCATE overlaps the wrapped state
  line — the fixed 286-px rail does not pass the text rule at 200 % without stacking the image above the text.
- **F14** at 1440×900/200 % the overlay header (unclamped 3-line 40-px title) consumes the 490-px overlay; `inspector-open-production` /
  `inspector-locate` publish off-screen (y −138 / −64) and the body is 1 px — the explicit route is unreachable at that cell.
- **F15** the compact inspector's scrolling body has no opaque background; cause/detail/consequence/remedy/company lines draw over
  the lot and are hard to read at every size (header/footer have stock).
- Observations: the pictures list viewport is 102/186/144 px at 1280×720 and ~250/186/284 px at 1440×900 across 100/150/200 % because
  the rail chrome rows scale with text and stack (F6's rendered root); `inspector-fallback` is published whenever the full workspace
  path is used (marker semantics); the driver's `text` action cannot type into rail fields, so Find was exercised with a letter key.

**Native product critique (from the captures, replacing R5's paper critique):**
1. The composition is right and the lot is back: 836/716 px of clickable centre with rails, tools row and band, matching R3's
   people-left / pictures-right / useful-centre grammar and its 03-selected inspector placement (x 366..1046 at 1440×900).
2. Escape is the weakest control: three owners (overlay, Find, menu) still answer the same key (F7/F12); one shared ladder is needed.
3. 200 % is not yet a supported reading size on either viewport: chrome rows scale, headers overlap, cards break words, the overlay
   header eats the body (F13/F14) — the sheet's §E rules must be applied to headers/chrome and the overlay header clamped to the body.
4. The overlay body needs its cardstock (F15) — a one-line style fix but it defeats every inspection until done.
5. Focus/selection interplay (F8/F9/F10) breaks the "Back restores everything" promise on three routes; the return-context law is
   right, its callers are not.
6. Density remains thin: with lawful fixtures only the employees rail scrolls; the pictures rail shows one card everywhere.
7. Unchanged from R5: placeholder monogram portraits; no screenplay overflow; typography at 100 % reads well.

## C5. Charges — this continuation and cumulative (charged once; session clock; idle gap excluded)
| Item | Value |
|---|---|
| Continuation capability | `19:13:42Z → 20:41:40Z` = **87.967 min = 1.466 h** (designer, IMPL-03/04/05, DATA-01, coordination) |
| Continuation verification/correction/delivery | `20:41:40Z → 23:02:00Z` = 140.333 min + `06:10:00Z → 06:54:21Z` = 44.350 min + prior closing tail 0.5 min carried once = **185.183 min = 3.086 h**; this record's own commit/push/read-back tail is charged once in the final reply and carried by the next session |
| N1 cumulative (caps 20 h / 6 h) | capability **160.600 min = 2.677 h**; verification **217.550 min = 3.626 h** — both inside their caps; 12/16/20 h checkpoints never reached; no reserve was spent on unbuilt capability |
| Whole program, known cumulative | capability **1 576.266 min = 26.271 h**; reserve **1 340.873 min = 22.348 h** |
| Remaining in the issued 72 / 36 envelope | capability **45.729 h**; reserve **13.652 h** (last 6 h protected → 7.652 h usable) — PROVISIONAL |
| Specialist usage (informational) | uiux-designer ≈25 min / 238k; unity-ui IMPL-03 20 min / 208k, IMPL-04 26 min / 261k, IMPL-05 20 min / 236k, IMPL-06 17 min / 188k, IMPL-07 10 min / 104k, IMPL-08 7 min / 79k; test-author DATA-01 15 min / 179k, TEST-02 24 min / 334k, TEST-03 20 min / 222k, TEST-04 6 min / 75k, TEST-05 ~50 min / 248k |
| Unattributed setup/smoke/helper sessions | **NOT REPORTED, not zero** (unchanged) |
Lead/session vs productive: this record, like R6, charges one overlapping session clock (specialist wall-clock never summed) and does not
compare it with the earlier distinct reviewer counters; the idle gap is the only excluded interval and is stamped in the private ledger.

## C6. Remaining full-overhaul coverage and costed later-stage update (deduplicated)
- **N1-close (next stage, not authorized here):** F7–F15 fixes ≈ 4 h capability (Escape ladder in the polled owner 1 h; F8/F9/F10 focus
  callers 1 h; 200 % chrome/header/overlay-header rules 1.5 h; F15 0.25 h; Find focus 0.25 h) + one rendered rerun and a native
  re-pass ≈ 1.5 h verification; a lawful Schedule-take fixture for UX-STALE-NATIVE-01 (requires a managed-mode source) ≈ 1 h.
- **Delivered shared work to deduct once from S2/S6:** list-level keyboard model incl. row cursor and camera gate, lane composition,
  next-action band + memo sheet (the memo/journey disposition), compact inspector overlay, explicit lifecycle mappings, LOCATE
  publication law, rendered PlayMode discipline ≈ 9 h capability delivered → S2 remainder ≈ 3 h / 2 h; memo/journey strip 0.
- S3–S7 unchanged from S6 (24/6, 10/3, 8/2, 5/2, 0/12). Remaining program ≈ **55.5 h capability / 27.5 h reserve** against
  45.7 h / 13.7 h remaining — the S6 fit conclusion stands; staged authorization still required; no art, dragging, help or screen
  coverage made optional.

## C7. Stop state
Stopped at N1's connected native review with declared defects. Preserved: Build46 package on the Desktop, Build47/48 records, P13A, all
campaigns, old evidence, both worktrees clean (Unity `18b893a6`, TS at this record). Publication: fast-forward of the two owned WIP
branches only. No PR, merge, protected-ref promotion, hook/goal activation, P13B/P14/P15/P16 coding, global configuration change.
Rollback source: Unity `7471d24` (Build47), TS `31f6e70d`.

---

# R3-N1 execution record — 2026-09-14 · OPS-R3-N1-EXECUTE-20260914-01

**R3-N1 IMPLEMENTED AS A LABELLED PARTIAL ENGINEERING INCREMENT — NOT N1 COMPLETION. CANDIDATE REVIEW READY; NATIVE INPUT NOT ADMITTED.**
This section sits above the successor readiness record (S1–S7, unchanged) and the historical text. It is the one
evidence-linked record of the restarted coordinator's acceptance, the released increment, its actual verification,
charges, remaining coverage and the next-stage recommendation. Nothing here starts a later package, native input, a
PR/merge or a protected promotion. Private identifiers stay in this worktree's Git-private
`fable-local-transfer-20260914-01/r3n1-session-acceptance-local.json` and `r3n1-ledger-local.json`.

## R1. Acceptance, actual session and registry

- Continuation accepted from the S1–S7 header (TS `31f6e70d558c16be17d547f316adbea84e4a765e`) and the private successor
  acceptance of `2026-09-14T17:02:49Z`; that home-launched session is superseded. Order packet `FABLE-R3-N1-EXECUTION`
  verified (SHA256SUMS 5/5; packet 01 == Git blob `a521b6345e4bdf71aa5810458ad2ca3087fd7818` at `0728477a`).
- **Actual session:** started `2026-09-14T17:18:41Z` from the TS worktree with
  `claude --dangerously-skip-permissions --settings '{"disableAllHooks":true}' --add-dir <Unity>`; CLI 2.1.270;
  runtime model **`claude-fable-5-1` (Fable 5.1)** = the Owner's saved default, no override, no Opus/manual substitution;
  bypass permissions as the Owner selected; hooks disabled by flag and absent by configuration; effort set to ultracode by the
  Owner but **the Workflow tool was not used** (FABLE-COORDINATOR forbids dynamic workflows; the order caps two named
  specialists; no swarm). Owner direction received mid-session and applied: every subagent runs Opus or lower; Fable only
  orchestrates.
- **Registry:** the harness listed all six custom roles at start (contract-auditor, instrumentation, sim-core, test-author,
  uiux-designer, unity-ui); profiles on disk unchanged; validator/probe/smoke and F-A/F-B/F-C not repeated. Actual specialist
  models remain CONFIGURED ALIAS / NOT EXPOSED (unity-ui = opus, test-author = sonnet by profile).
- **Ownership:** coordinator/integration owner = this session; production writer = unity-ui (two dispatches, sequential);
  test owner = test-author (disjoint test paths); native-input slot held by the coordinator, **not admitted** (no explicit
  current desktop availability exists in the order or the prompt); existing designer retains ownership (no uiux-designer
  dispatched). At most one specialist ran at a time (Unity holds a project lock).

## R2. Source uptake completed (exact files, HYBRID confirmed)

R3 archive (Desktop verified root): README, DESIGN, REVIEW, WALKTHROUGH, PROVENANCE, package-manifest.json,
source-reuse.json, evidence/candidate-repairs.json, evidence/candidate-controls.json, index.html, backlot.js,
movie-cards.js, lot.js/data.js (partial); previews 01-mature-annotated, 02-early, 03-selected, 04-waiting, 05-busy,
06-small-enlarged, 07-small-waiting, rail-hybrid. Back/focus repair inspected in `movie-cards.js` (`snap()`, `go()`,
`back()`, `restoreUI()`: trail of both rail offsets, body offset, filters, Find text and invoking focus; a missing record
never substitutes a neighbour). Authority read: FABLE-COORDINATOR, SOURCE-INDEX, TASK-TEMPLATE, setup/smoke receipts,
06 S1–S7 + continuation update, issued04 §3–§7, later05 §5–§6, Owner selection, Owner clarification (memo grep).

## R3. Gates and checks — facts

| Gate | Finding |
|---|---|
| WIRE-1 | Satisfied by existing DTO fields: roster rows/counts (`population`, `nameShared`, `canLocate`, `currentWork`, `availability`), presence (`talentId` join, `activity`/`workTitle`/facility), `productionOperations` (`operationalState`, `attention`, `stateLabel`, `facilityLabel`, `locationBuildingId`, `companyMembers`, `blocker`/`blockerAnatomy` headline+detail+remedies, `stateWeeksRemaining`), development projects, `releaseResults`. **No wire delta proposed.** DTO blob `9420d5ef…` identical on both sides; schema `sha256:e64a3b65…`; `dist/studio/engine.mjs` `af1e8897…` unchanged; `npm run check:bridge-contract` verified. |
| DATA-1 | Measured on the admitted fixtures through the wire roster: early wk12 0 employed; native-casting-clean-run13 wk15 2/0; native-performance-316-01 wk316 **7 employed / 1 production** (development-working); f2-set-blocker-01 wk330 **7 employed / 1 production** (`resource-wait`, `warning` — a genuine waiting picture); native-performance-6240-01 0 employed. No duplicate employed names, no employed-without-presence rows. A lawful `signContract` loop from wk316 reaches 50 employed in 13 weeks at −$3.0M cash (no-hard-bankruptcy law lets it continue); with a $1.5M signing floor 39 employed, still negative within 13 weeks under payroll. **40+/20+ is not available lawfully and solvently from existing fixtures; nothing was generated or mutated.** Bounded generator proposal in R7. |
| D-1 | R3 supplies the compact inspector at 1440×900/100 % (03/04) and 1280×720/Enlarged (07) only; missing the 150 % state, 1280×720/100 %, 1440×900/200 % and the corner-tool/global-tool occlusion rule (REVIEW.md names it open). **The compact overlay was not implemented**; inspection reuses the existing full-screen Profile/Production/Result workspaces with retained-context Back — a labelled partial. |
| Layout | The current left edge is the full-height journey memo (`WorkflowPanelRect` 18..418 base, default visible) with real next-step intents; R3 never shows it. Coexistence law implemented: the employees rail owns the left edge, the memo slides right keeping 400·s where room exists, the BUILD chip follows. Lot centre (paper): **≈316 px @1280×720, ≈436 px @1440×900 at every text size** (716 @1720×1045, 882 @1920×1080). First critique item. |
| Native | Not admitted (no explicit desktop availability). Proof plan drafted (`r3n1-native-plan.jsonl`, scratchpad copy in the Git-private dir) — not executed. UX-STALE-NATIVE-01 remains a declared residual. |
| PlayMode | Headless batch editor has no graphics device: `StudioProductionAndCampaignLayoutTests` class run 9/15 twice (6 failures all `No graphic device is available`, including 5 untouched tests). Full batch suite: 192/202 passed, 10 failed — every failure environment-bound (the four memo-geometry tests state "Run this real IMGUI test with a rendered GameView, without -batchmode or -nographics"; the layout tests report "No rendered rect …" / no Repaint; one SetUp "No graphic device"); `r3n1-01/playmode-full-batch-01.{xml,log}` (pre-increment batch baseline 77/79 with two known batch-only failures). The 195-test GUI PlayMode pass needs the Editor window = desktop → **held with the native gate**. |
| HUD marque | The native HUD has no studio-name/timeline marque (living-time chip only) → nothing to overlap in N1; R3-7 stays S2. |

## R4. Delivered increment — exact identities and changed paths

| Identity | Value |
|---|---|
| TS | `31f6e70d558c16be17d547f316adbea84e4a765e` (no production edits; engine bundle unchanged) → documentation descendant the commit that carries this record (see Git) (this record) |
| Unity | base `e8c59d8672b6e32de73ed10628abeff49bc1a95e` → **`7471d243ba8fb688858f5658580d2a0b39600d7d`** on `wip/playability-interaction-01-client` (12 commits: 8 production by unity-ui `54f729f..ddeb11b`, 4 tests by test-author `9a94080..7471d24`); pushed fast-forward to `origin` (no force; no protected ref) for handoff/seal |
| Paired contract seal | **PASS** — TS `Evidence/Playability-Interaction-01/entry/paired-verifier-interaction-42.json`: seal mode, protocol 4 / projection 30 / schema `sha256:e64a3b65…`, generated contract `ad7d522f…`, DTO blob `9420d5ef…` on both sides, TS `31f6e70d` ↔ Unity `7471d24` (both refs read from `origin`) |
| Build47 | **Build47** — `Builds/macOS/Project Studio Visual Spike.app` built `2026-09-14T19:01:53Z` by `StudioPlayabilityBuildAdmission.VerifyAndBuildMacOS` (log `interaction-build-47.log`, evidence `interaction-build-47/`); executable sha256 `efbaafc95c99ca4242c9d498e1cc2cefaa391936e51c37f5a3396e08ba7e65d4`; Assembly-CSharp `9da422a33fcf71de6e40c5c88192ef6fb438778e87975adc9b5ad74fe66c2b09`; manifest sha256 `ec9504229cb7cb9c15c01ae57de253812399e7a02e00e513c472d64e1054d13b` binding Unity `7471d24` / TS `31f6e70d` / engine `af1e8897…` / worker `807f28a6…` / worker-source `81c8323b…`; cold-import admission clean (128 meshes, empty failed-dependency intersection), scene validation clean; admission record `interaction-native-admission-38.json` PASS (build 47, pair 42). **Not launched; no native input.** As with every prior increment the player bytes in `Builds/macOS` now belong to Build47; Build46 stays preserved in the Desktop package `Playability-Candidate-20260913-01` and its own admission/manifest records |
| Assets | six 2D stage-object sprites `Assets/Studio/UI/Resources/StageObjects/{writing,casting,shooting,post,release,library}.png` (156×156, rsvg-convert 2.62.3 from R3 `art/*.svg`; PROVENANCE.md with SVG sha256s; no Lionhead pixels/fonts; separate from 3D lot geometry; S5's `Art/StageObjects` locator resolved to Resources because IMGUI loads by `Resources.Load`) |

Changed Unity paths: `Runtime/Infrastructure/{StudioPeopleRailContracts, StudioMovieRailContracts (additive), StudioMovieSlateContracts (additive), StudioRailReturnContracts (new), StudioBridgeClient (WorkflowPanelRect only)}.cs`;
`Runtime/Presentation/{StudioPeopleRailHud, StudioProductionRailHud, StudioRailReturnContext (new), StudioBuildCommandHud (chip left/width), StudioHud (one direction-aware line in the receipt's Avoid law)}.cs`;
`Runtime/Presentation/UI/StudioProfileWorkspaceContext.cs` (`ProfileOrigin.PeopleRail`); stage sprites + metas + PROVENANCE; tests
`Tests/EditMode/{StudioRailReturnContractsTests, StudioPictureCardContractsTests, StudioEmployeesRailContractsTests}.cs` (new) and
`{StudioProductionRailTests, StudioMovieRailContractsTests, StudioMovieSlateContractsTests, StudioRailScrollOwnerTests}.cs` (extended);
`Tests/PlayMode/StudioProductionAndCampaignLayoutTests.cs` (one method: superseded Tab-order assertions + roster fixture rows).
Not changed: `StudioWorkspaceHost*.cs`, camera/input owners, DTOs, schema, campaigns, launcher, package roots, historical evidence.

**Behaviour delivered (source-level; EditMode-proved; not natively observed):** employees rail LEFT from `roster.rows` where
`population == employed` in wire order, header = `counts.employed`, profession tabs + name/label/id search, placeholder
monogram portrait slot (labelled), status = the wire's own `currentWork`/`availability` words with optional same-snapshot
presence activity, no cap (bounded drawing, per-snapshot profile/presence index), no Locate on rows; pictures rail RIGHT as
HYBRID cards (stage sprite + wrapping title + stage word from the existing lifecycle vocabulary + `stateLabel`/attention
state; waiting shows the wire blocker headline; unknown lifecycle → explicit "UNKNOWN STAGE" card, never Writing); phase
track and section bands removed; filter (Active/Decisions/Waiting/stages/Library), Find (title or id), visible range,
inert boundary paging, library toggle; body click/Enter = inspect through the existing owners, Locate only via the explicit
zone; both-rail return context (offsets, filter, search, selection, invoking focus) captured on hide and restored on show
when the owner (client/session/runtime/replacement) matches, clamping only on shrink, dropping missing targets, never a
neighbour; `ProfileOrigin.PeopleRail` closes to the lot; keyboard Tab/Shift+Tab/Enter/Space/PageUp/PageDown/Home/End/
Escape/Left-Right; rail widths fixed to the viewport (R3 258/236 and 286/268 × viewport scale), type/rows/cards reflow at
100/150/200 %; element-map names for every control; memo/BUILD coexistence; selection receipt dodge made direction-aware.

**Verification actually run:** EditMode whole platform 1428/1428 at `ddeb11b` (writer run 07) and **1515/1515** at `7471d24`
(test-author full run; +87 requirement-derived tests, 0 production defects found); targeted runs 104/104 and 130/130; zero
`error CS` in every log. Logs/xml under Unity `Evidence/Playability-Interaction-01/r3n1-01/` (gitignored; writer-report.md,
test-report.md). PlayMode: see R3. TS suite not rerun (no TS change; contract sync verified).

## R5. First product critique — R3-N1 against the connected task (from committed laws and paper geometry; not a native observation)
1. **The journey memo squeezes the lot.** Employees (236/258) + memo (400) + pictures (268/286) leave ≈316 px of lot at
   1280×720 and ≈436 px at 1440×900. "The studio lot is the primary game surface" is not honoured on the 1280 class. The memo
   is the film-journey family's surface (S3/designer); R3 shows no memo. Needs a designer disposition (fold notices/next-step
   intents into the HUD or a collapsible strip) or a minimum-viewport statement. Not hidden, not resolved in N1.
2. **Inspection still hides both rails** (full-screen workspaces with scrim). The selected experience is a compact overlay
   with both rails alive — held on D-1. N1 is PARTIAL by the order's own definition.
3. **Screenplay cards have no inspector**; they only select/Locate Development/Casting. Film-journey family (S3).
4. **Placeholder portraits** (initial monograms, labelled). Portrait proof (S6) unchanged.
5. **UNKNOWN STAGE cards** replace the old withhold-status-unavailable presentation (vocabulary is closed on the TS side, so it
   should never occur in a paired build); confirm intent.
6. **Density.** No lawful admitted fixture lets the pictures rail scroll; "both rails at nonzero offsets" is satisfiable only
   for employees (7 rows scroll at 1280×720 and at 150/200 %). DATA-1 (R7).
7. **Keyboard.** Up/Down row navigation absent: the camera owns the arrows; needs an input focus gate (S2 R3-1).
8. **Typography.** 14 px bold card titles (R3) are smaller than the pre-R3 18 px; no letter tracking in IMGUI; at 200 % in a
   236/268 px rail names wrap to 2–3 lines and titles ellipsise after ~12 characters (tooltip carries the full title).
   One token change if the Owner prefers the larger title.
Native watch items from the writer: one-frame memo geometry staleness on rail show/hide (OnGUI ordering); possible focus
flicker on the Find toggle frame; wheel/camera containment, click-through, repeated input, live updates while scrolled.

## R6. Charges — this increment, charged once, and cumulative
| Item | Value |
|---|---|
| Session clock (charged once; specialist wall-clock overlapped, never summed) | start `2026-09-14T17:18:41Z` → capability/reserve boundary `2026-09-14T18:31:19Z` (production writing complete at `ddeb11b`) → ledger stamp `2026-09-14T19:03:41Z` |
| This increment — capability | **72.633 min = 1.211 h** (target 16 h, hard cap 20 h; 12 h / 16 h fit checks never reached) |
| This increment — reserve | **32.367 min = 0.539 h** through the ledger stamp (cap 5 h); the closing docs commit/push/read-back tail (≈3 min) is charged once in the final reply and carried by the next session, as S6 did |
| Readiness charge carried once (order §5) | 5.0 min capability + 11.05 min reserve (S6 14.050 + ≈2.0 tail) |
| Known cumulative before this increment | capability 1415.666 min; reserve 1123.323 min |
| Known cumulative after this increment | capability **1488.299 min = 24.805 h**; reserve **1155.689 min = 19.261 h** |
| Remaining in the issued 72 / 36 envelope | capability **47.195 h**; reserve **16.739 h** (last 6 h protected; below-18 escalation disposed for this increment only) |
| Remaining in the original 48 / 24 envelope | capability 23.195 h; reserve 4.739 h |
| Unattributed setup/smoke/helper sessions | **NOT REPORTED, not zero** — separate outstanding line; must be attributed or dispositioned before any final program-fit claim |
| Specialist usage (informational, not hours) | unity-ui IMPL-01 ≈40.6 min wall / 394k tokens, IMPL-02 ≈8.3 min / 448k cumulative; test-author ≈23.6 min / 269k |

## R7. Remaining coverage, designer delivery, DATA-1 proposal, next stage (deduplicated)
- **Remaining for N1 itself:** compact overlay inspector (D-1), native pass at 1280×720/1440×900 × 100/150/200 % on
  f2-set-blocker-01 (waiting picture) and native-performance-316-01, GUI PlayMode (195), UX-STALE-NATIVE-01 on the
  Schedule-take route, memo disposition, screenplay inspection route, arrow row navigation.
- **Designer (existing owner, separate from native):** D-1 sheets at the missing states + occlusion rule; film-journey/memo
  sheet; remaining seven families; portrait/icon/font inventory; the 200 % title-room question.
- **DATA-1 bounded generator proposal (not executed):** `TS/Evidence/Playability-Interaction-01/entry/generate-r3n1-dense-01.ts`
  after the `generate-f2-blocker-01.ts` precedent: start from native-performance-316-01, weekly `signContract` on hiring-market
  candidates only while projected cash stays ≥ N weeks of commitments (solvency rule for Current Ops to dispose), commission
  screenplays through existing actions up to existing development capacity, stop when capacity or solvency binds, record
  actual density (expected well under 40/20 while solvent); immutable checkpoint + manifest under `fixtures/r3n1-dense-01`.
  ≈1.5 h capability. No gameplay-limit change.
- **Deduct from S2/S6 (delivered by N1):** list-level Tab/Enter/Page keys, filter/find/paging/library controls, both-rail return
  context, rail text reflow at three sizes, six stage sprites, employee/picture card vocabulary ≈ 5 h capability delivered.
- **Costed next stage (recommendation, not authorization):** N1-close = D-1 compact inspector 6 h + memo/journey strip 3 h +
  arrow focus gate 2 h + DATA-1 1.5 h = **12.5 h capability**; verification = native six-run pass + GUI PlayMode + stale-route
  proof + comparison + critique **5 h reserve**. S2 remainder after deduction ≈ 9 h / 3 h; S3–S7 unchanged from S6
  (24/6, 10/3, 8/2, 5/2, 0/12). Remaining program ≈ 68.5 h capability / 33 h reserve against the post-N1 remainder
  in R6 — the S6 fit conclusion (does not fit 72/36) stands; staged authorization still required. The last six reserve hours
  stay protected.

## R8. Stop state
Stopped at N1 candidate-review readiness with a real native/design/data block: PARTIAL. Preserved: Build46 package on the
Desktop, P13A, all campaigns, old evidence, both worktrees (Unity clean at `7471d24`; TS clean at the commit that carries this record (see Git)). No PR,
merge, protected-ref promotion, hook/goal activation, P13B/P14/P15/P16 coding, global configuration change, or native input.
Rollback source: Unity `e8c59d86`, TS `31f6e70d`.

---

# Successor readiness record — 2026-09-14 · OPS-FABLE-SUCCESSOR-START-20260914-01

**SUCCESSOR ACCEPTED. READINESS HANDOFF DELIVERED — PARTIAL: SPECIALIST REGISTRY GATE OPEN; IMPLEMENTATION HELD.**
This section sits above the outgoing local continuation update (below, unchanged) and the historical handoff.
It is the one evidence-linked successor acceptance/registration/mode/coverage/usage/next-task record the
launch note ([07 successor launch](https://github.com/HSpector1/The-Movies/blob/8c98eb6cd172b28a43857015381e66627fd011e5/docs/engineering/playability-launch-review/07-FABLE-SUCCESSOR-LAUNCH-01.md))
required. Nothing here starts implementation, native input, a specialist, a build or a later package.

## S1. Acceptance and actual session observations

- **Successor acceptance recorded at `2026-09-14T17:02:49Z`** by the fresh Fable coordinator session (this is the
  newly started coordinator, not the outgoing "Read P13A source packet" task, which stays STOPPED). The outgoing
  writer/native yields of `2026-09-14T15:27:03.274046+00:00` are accepted. Fable is now the sole coordinator/
  integration owner and custodian of the yielded native-input slot; **no native input was taken and custody is
  not permission to take desktop input.** Private identifiers stay in this worktree's Git-private
  `fable-local-transfer-20260914-01/successor-acceptance-local.json`.
- Packet `FABLE-SUCCESSOR-LAUNCH` verified: six SHA-256 entries OK; both repository documents match their listed blobs.
- Worktrees observed clean at acceptance: TS `7dfe508bbf6b07d87811be2c48728703e01c0ce0` on `wip/playability-interaction-01-ts`;
  Unity `e8c59d8672b6e32de73ed10628abeff49bc1a95e` on `wip/playability-interaction-01-client`; documentation
  `3e04634d41c243d548317b863950e4e5f4f59b26`. `git diff 6e2c2ca1..7dfe508b` names only the 13 configuration/instruction/handoff
  paths; no gameplay path changed. `Builds/macOS/build-manifest.json` (generated `2026-09-13T21:45:52Z`) still binds Build46 to
  exactly this TS/Unity pair, executable SHA-256 `caa2bcb6…fd18c`. No index lock, no open handle on the TS worktree, no player or
  Unity editor process; nine long-running VS Code-extension Claude processes (2.1.269, ≈2.7 days old) exist and were not signalled —
  no competing writer is evidenced, idleness is not proven.
- **Actual mode/model/launch — deviations from the launch note, recorded, not hidden.** This session's own process is
  `claude --dangerously-skip-permissions`, started from **`/Users/bruce`** (harness-reported startup directory), i.e. **bypass
  permissions, not `--permission-mode manual`**; runtime model **`claude-fable-5-1` (Fable 5.1)**, selected by the Owner with
  `/model` in this session (which also saved it as the user default, replacing the previously recorded `sonnet`) — the launch note
  requested alias `opus`; effort set to ultracode by the Owner; no `--settings '{"disableAllHooks":true}'` (no hooks are configured
  anywhere inspected, so hooks are inactive by absence, not by flag); no `--add-dir` for the Unity counterpart (it was reachable
  because bypass mode does not enforce directory scope). The TS `CLAUDE.md` preamble (blob `39ce8d1b`) was not auto-loaded and was
  read manually. Installed CLI `2.1.270` at `/Users/bruce/.local/bin/claude`. The Owner directed reuse of this session; every write
  below is limited to this handoff path and the Git-private metadata.
- Not used, by the adopted coordinator contract: dynamic workflows, agent teams, hooks, nested delegation, model substitution.

## S2. Six-role registry — NOT REGISTERED IN THIS SESSION (diagnosed, not fixed)

| Check | Observation |
|---|---|
| Runtime registry (Agent tool types listed by the harness at start) | `claude, claude-code-guide, Explore, general-purpose, Plan, statusline-setup` — none of the six |
| One probe, then stopped | `Agent(subagent_type=contract-auditor)` → `Agent type 'contract-auditor' not found. Available agents: claude, claude-code-guide, Explore, general-purpose, Plan, statusline-setup` |
| Files at `/Users/bruce/The Movies - Playability Interaction TS/.claude/agents/` | all six present and readable; first line `---`, closing `---` at line 7; `name:` equals file name; models sonnet ×3 / opus ×3; `permissionMode: default` ×6 |
| Byte identity | each of the six is blob-identical to `a51ebff8…` and to source `22584539…` (e8639772, d97a43f1, 57582a4f, 743ccc77, 6741a4b5, 13c3d74b) |
| `claude plugin validate "<TS>/.claude/agents"` | `✔ Validation passed` (2.1.270) |
| Suppression flags | no `safeMode`/`bare`/agent keys in user or local settings; no managed settings file; `~/.claude/agents` does not exist |
| **Observed cause** | project-local agents are discovered from the session's **startup** project directory; this session started at `/Users/bruce`, whose tree has no `.claude/agents/`; a later shell `cd` does not rescan |

Consequence: **delegation to contract-auditor / instrumentation / sim-core / test-author / uiux-designer / unity-ui is blocked in
this session; coordinator reading is not.** No general-purpose substitute was used or labelled as a specialist. Effective models
remain **CONFIGURED ALIAS / ACTUAL MODEL NOT EXPOSED** for all six (the single historical setup invocation is the only runtime
evidence). Registration is not reported fixed until a runtime actually lists the six names.

**Smallest supported next action (Owner runs once, in a NEW terminal; no second coordinator is spawned by this session):**

```bash
cd "/Users/bruce/The Movies - Playability Interaction TS" &&
/Users/bruce/.local/bin/claude --model opus --permission-mode manual \
  --settings '{"disableAllHooks":true}' \
  --add-dir "/Users/bruce/The Movies - Playability Interaction Unity"
```

Then confirm the six names appear in that session's agent-type listing before any delegation. `--model opus` is the launch
note's requested alias; omitting it now resolves to the user default `claude-fable-5-1[1m]` — the Owner's choice, not the
coordinator's. This record is already committed, so that session resumes from files, not from this chat.

## S3. F-A / F-B / F-C disposition — coordinator reading, no specialist dispatched

- **F-A (authority/transfer) — answered by coordinator reading.** Received and read: 07 launch note, FABLE-COORDINATOR, SOURCE-INDEX,
  SETUP/SMOKE receipts, TASK-TEMPLATE, this 06 (all sections), transfer receipt + `transfer-record.json`, review03 §6, plan 00 → 05 →
  issued 04 → 02 §3/§6, Owner clarification `f2921730` (incl. §8 1A/2B/3A/4B), Owner selection `3aa4bad9`, corrected advisory
  `ba385410`, R3 README/DESIGN/REVIEW/WALKTHROUGH, previews `01-mature-annotated.png` and `03-selected.png` (opened read-only — the
  mandatory render uptake is **started, not complete**: index.html/prototype interaction, early/waiting/busy/small views not yet opened).
  Order, one-writer/one-input-slot, no automatic later coding, adoption mapping, preserved local instructions and the ledger are
  consistent across these sources. No fabricated yield, model or time.
- **F-B (employee rail / Back scout) — answered by coordinator read-only source scout at frozen Unity `e8c59d86` / TS `6e2c2ca1`:**
  - `Assets/Studio/Runtime/Presentation/StudioPeopleRailHud.cs:64-78` still reads `snapshot.people.presence.people`, hides whenever a
    card/inspection/workspace is open (`Wanted`), passes `StudioPeopleRailContracts.MaximumRows` (=5); it is drawn on the **right**
    edge under the movie rail (`ComputeRect`), not left. The published presence-gap is unchanged locally; no newer local work implements R3-N1.
  - **The complete roster already travels on the wire — no new wire contract is needed for the left employee rail.** TS
    `bridge/people.ts` exports `BridgeRosterSnapshot { rows[], counts{employed,freelancer,known,withAttention} }` with
    `BridgeRosterRowSnapshot { talentId, name, nameShared, profession, currentWork, availability, status, contractLine,
    attentionTier, canLocate, population: employed|freelancer|known }`; Unity `Assets/Studio/Runtime/Data/StudioLotSnapshot.cs`
    already deserializes `StudioRosterSnapshot`/`StudioRosterRowSnapshot`, and the rail HUD reads `snapshot.talent.talent.roster`.
    `StudioRosterContracts` (Filter{Profession,Availability,AttentionOnly,ContractWithinWeeks,Search,Specialty}, Sort, Apply, Matches)
    and `StudioRosterWorkspaceContext` (ActiveView, Filter, Sort, SelectedTalentId, ScrollOffset) are reusable owners.
  - Exact inspection/Back owners: `StudioWorkspaceHost.OpenProfile(talentId[, ProfileOrigin])`, `OpenRoster()`, `OpenProduction(id)`,
    `CloseWorkspace()/RequestCloseWorkspace()`, `SuspendForLocate(stableId, focus)`; `ProfileOrigin` has World/Roster/History/Commission/
    TalentMarket/Finance/Industry (no rail origin yet). Rail focus/offset state: `StudioRailKeyboardFocus.Target`, `peopleScroll`,
    `focusedTarget`; movie rail `selectedAction/focusedAction`, `ItemRects`, `StudioProductionRailContracts.MaximumRows` (=4).
    Existing tests: EditMode `StudioPeopleRailContractsTests` (10), `StudioProductionRailTests` (4), `StudioRailScrollOwnerTests`,
    `StudioProductionNavigationTests`, `StudioP10AW3RosterContractsTests`, `StudioRosterOwnerUxWorkspaceTests`, `StudioWorkspaceHostTests` (14);
    TS `bridge-p10a-w0-people-projection`, `presence-*`, `roster-wall-*`. Text preference already scales rails
    (`LayoutScale = CurrentScale × StudioTextSizePreference.Multiplier`); HUD/corner scaling unverified.
- **F-C (native proof plan) — drafted by coordinator from `Tools/playability-native-preview.md/.mjs`:** JSON-line actions observe / shot /
  click(name) / tap(key) / scroll(name,ticks) / text / finish against **published, enabled** targets (rail targets today:
  `people-roster-open`, `people-rail-scroll`, `people-profile-<talentId>`, `people-talent-locate`); direct mode admits only
  `P13_VIEWPORT` `1280x720` / `1440x900` with a bound `build-manifest.json`; larger/Retina/package admission stays governed separately.
  Assertions for R3-N1: both offsets nonzero before and equal after Back; filter/search text retained; invoking focus target string equal;
  exact IDs (duplicate-name control); repeat Enter produces one effect; waiting picture shows real cause and no manufactured remedy; centre
  and global tools clickable after each return; screenshots at both viewports × 100/150/200 %. Requires a newly admitted build, a lawful
  dense fixture, an explicitly available desktop and HID-guard admission — **all HELD; no test was executed.**

## S4. Coverage register continuation — §7 rows updated (all eight domains remain)

| Domain / J,C | Established now (source-level, frozen pair) | Native / design evidence | Dependency (owner) | Remaining (coordinator ESTIMATE) |
|---|---|---|---|---|
| Home/HUD/tracking — J1/J2/J7 | Roster DTO on wire; people rail right/presence/5-cap; movie rail 4-cap, five-icon phase track (`DrawPhaseTrack`); both rails hidden under workspaces; keyboard focus registry shared | R3 previews viewed (2 of 9); native R3-N1 not proved | Compact inspector overlay vs full workspace (existing designer, D-1); stage-art atlas (A-1) | R3-N1 stage S1 below |
| Film journey — J1/J5 | F1–F3 delivered per 02; waiting-cause/attention fields for pictures to verify on wire at task time | Build46 tests/ACK retained (5273+5 / 1428 / 202) | Per-family rendered layouts (designer); possible one exact wire delta for wait cause (Current Ops disposes) | S3 |
| People/casting/contracts — J1/J2 | F3/F6 delivered; Roster workspace + Profile origins exist; `nameShared` on wire | none new | Portrait proof (designer/art) | S3, S6 |
| Buildings/tools/Lab — J3/J4 | F8 delivered; no P13B mechanics | none new | Layout sheets (designer) | S3 |
| Finance/Industry/records/outcomes — J5 | `StudioHistorySnapshot{timeline,films,people}` and `BridgePeopleAttentionSnapshot` on wire = existing retrievable-history/attention sources for 4B | none new | Inventory outcomes lacking a source (data dependency list) | S5 |
| Menu/campaigns/settings/help — J6/J7 | F4/F5 delivered; text preference client-session only | Run74/76/78 persistence retained | Per-screen help copy (designer/copy deck P-13) | S5 |
| Shared controls — J7/C1–C5 | Rail keyboard model exists (Tab/arrows/Enter); 2B routes not started; UX-STALE-NATIVE-01 residual unpassed | none new | Legal-command check per drag route (read-only auditor/sim-core after registry); Current Ops disposes route list | S4 |
| Visual system/art/readability — all J | Rails scale with text preference; HUD/corner unverified (advisory R3-5); XAG 101 rendered target adopted by 05 | none native | Font/icon availability + fallback tests; portrait finishing (designer); no paid assets | S2, S6 |

Preserved unchanged: R3 HYBRID, people-left/pictures-right/useful-centre, 1A/2B/3A/4B, corrected advisory withdrawals (R3-2 withdrawn;
R3-3/4/8/9/10 optional), XAG 101 rendered target, no tutorial, attention ≠ history, existing designer ownership, stopped advisory
reviewer, all eight P13B obligations, P14/P15/P16 gates. **Exact live screen inventory is still not established; this is domain coverage.**

## S5. Costed next task — R3-N1 (proposed, NOT dispatched; needs registry + Current Ops release)

**Outcome:** selected main screen on the native build — employees left (complete employment roster, scrolled), hybrid picture cards right
(scrolled), useful centre; inspect exact employee → Back; inspect actionable picture → worksite/company person → Back; inspect a genuine
waiting picture; both offsets, filters/search and invoking focus retained; global tools usable. Mode IMPLEMENT (unity-ui, configured
Opus) + VERIFY (test-author, configured Sonnet), one production writer, Fable integration owner, native slot held by Fable.

**Exact proposed writable paths (Unity worktree `/Users/bruce/The Movies - Playability Interaction Unity`, branch
`wip/playability-interaction-01-client`, base `e8c59d86`):**
`Assets/Studio/Runtime/Infrastructure/StudioPeopleRailContracts.cs` (roster-backed assembly: rows where `population=="employed"`, header from
`roster.counts.employed`, optional presence join by `talentId` for On set/Writing/Waiting words, remove `MaximumRows` cap, profession tabs +
name/role/ID search via `StudioRosterContracts.Filter`); `Assets/Studio/Runtime/Presentation/StudioPeopleRailHud.cs` (left edge, full height
under HUD, portrait slot, tabs/search, scroll with visible range); `Assets/Studio/Runtime/Presentation/StudioProductionRailHud.cs` (hybrid card:
stage image + title + stage word + state line, remove phase track, Active/Decisions/Waiting/stage filter + Find + range/paging footer + library
link, remove 4-row cap); `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs` + `.ProductionNavigation.cs` +
`Assets/Studio/Runtime/Presentation/UI/StudioProfileWorkspaceContext.cs` (add `ProfileOrigin.PeopleRail`; carry a rail return context);
new `Assets/Studio/Runtime/Presentation/StudioRailReturnContext.cs` (both offsets, filters/search, selected IDs, invoking focus target);
new sprite assets under `Assets/Studio/Art/StageObjects/` rasterised from R3 `art/*.svg` (original source-native SVG per PROVENANCE).
**TS:** no production writes expected (roster on wire); `dist/studio/engine.mjs` unchanged unless a wait-cause delta is disposed.
**Excluded:** simulation law, schema/DTO, campaigns, settings, launcher, candidate/evidence roots, other designer work.

**Tests (writable):** update `Assets/Studio/Tests/EditMode/StudioPeopleRailContractsTests.cs` (employed-only rows, honest counts, no cap,
filter/search, duplicate names distinct by ID), `StudioProductionRailTests.cs` (card state words, filters, range), `StudioRailScrollOwnerTests.cs`
and `StudioProductionNavigationTests.cs` (both offsets + focus retained through profile/production/worksite excursions and Back); new
`StudioRailReturnContextTests.cs`. Existing suites must stay green (EditMode 103 files / PlayMode 17 files; TS `npm test`). Native proof per S3-F-C.

**Dependencies before dispatch:** D-1 designer's native compact-inspector layout at 1280×720/1440×900 × 100/150/200 % (first slice may reuse
the existing Profile/Production workspaces with retained-context Back and record that as a gap); A-1 stage-art rasterisation + font/icon
fallback check (no paid assets); DATA-1 lawful mature fixture at 40+ employees / 20+ active pictures (existing generated mature layout to be
checked for density; no gameplay-limit change); WIRE-1 verify picture wait-cause/attention on wire, else one exact delta for disposition;
NATIVE-1 admitted fresh build via `Studio.Editor.Automation.StudioAutomation.BuildMacOS`, explicitly available desktop, HID guard.

**Effort (coordinator ESTIMATE, charged once): capability ≈ 16 h (range 14–20): rail relocation/roster binding/filters 6 h; hybrid cards/art/
filters/range 6 h; return context 4 h. Reserve ≈ 5 h: EditMode/TS regression 1.5 h; build + native proof at 2 viewports × 3 text sizes +
R3 comparison + first product critique 3.5 h.** Within 04 §7 the R3-N1 review is due inside the first 20 further capability hours; this
fits. **Protected reserve: the last 6 h of reserve are untouched by this task; below-18 h escalation remains active.**

## S6. Cumulative usage — this interval charged once; no reset

| Item | Value |
|---|---|
| Prior known at outgoing final tail (`2026-09-14T15:29:14Z`) | capability used 1410.666 min (23.5111 h); reserve used 1112.272787 min; R3 remainder 48.4889 h capability / 17.46212 h reserve; original-envelope reserve 5.462 h |
| This readiness interval | first stamped observation `2026-09-14T16:54:48Z` → record snapshot `2026-09-14T17:06:51Z`, plus a conservative 2.0 min unstamped packet unpack/verify debit = **14.050 productive min** of the 150-min ceiling (9.4 %) |
| Split (ESTIMATE) | source/preparation capability **5.0 min** (R3 design/preview uptake, Unity/TS R3-N1 source scout, costing) ≤ 60-min cap; verification/administration reserve **9.050 min** ≤ 90-min cap |
| Known remainder after this snapshot (R3 72/36 envelope) | capability **2904.334 min = 48.4056 h**; reserve **1038.677 min = 17.3113 h**; original-envelope reserve 318.677 min |
| Closing tail | this record's commit/push/read-back is charged once in the final reply, not here |
| Unresolved accounting | separately run setup/smoke/helper sessions: **NOT REPORTED, not zero** (no productive-hour ledger exists for them); the displayed balance is provisional and cannot support a final full-overhaul fit claim until attributed or dispositioned |

**Full-remainder pricing by stage (coordinator ESTIMATE; designer inventory not yet supplied; do not shrink scope to fit):**

| Stage | Capability | Reserve |
|---|---:|---:|
| S1 R3-N1 selected main screen (S5) | 16 | 5 |
| S2 shared system: list-level keyboard focus (R3-1), target-aware inspector (R3-6/NEW-1), HUD marque/timeline (R3-7), full 100/150/200 % incl. HUD/tools (R3-5), shared Backlot components | 14 | 4 |
| S3 full-domain adaptation of the seven remaining families (film journey, people/casting/contracts, build/Lab, finance/industry/records, menu/campaigns/settings, shared controls, results) | 24 | 6 |
| S4 2B lawful drag routes: inventory 2 h + implement only routes with an existing lawful command (candidate→comparison slot, script→stage schedule, catalogue→lot placement; person→facility/picture pending command check) | 10 | 3 |
| S5 3A contextual help + 4B attention cues/retrievable history from existing history/attention snapshots | 8 | 2 |
| S6 art: six-person portrait proof at rail/dossier sizes, icon set, font availability/fallback tests, stage atlas | 6 | 2 |
| S7 integrated verification/delivery: critiques 2–3, C1–C5, matched performance (Save/load ≤1.05×, 20-rep ACK), packaging, last-6-h delivery | 0 | 12 |
| **Total remaining** | **78 h** | **34 h** |
| Known remainder (before unattributed setup/smoke) | ≈ 48.4 h | ≈ 17.4 h |
| **Shortfall** | **≈ 30 h** | **≈ 17 h** |

**Fit conclusion: the full R3 HYBRID whole-game overhaul does NOT fit the issued 72/36 envelope.** Recommended for Current Ops disposition:
(a) release S1 (R3-N1) now under existing authority once the registry gate clears — it fits and is due first; (b) issue a staged amendment
raising the cumulative ceiling by ≈ 30 h capability and ≈ 17 h reserve (108 → ≈ 155 cumulative), or authorise stages S2–S7 one at a time
with per-stage reserve, after the existing designer supplies the rendered-layout inventory that turns these estimates into measurements.
No art, dragging, help or screen coverage is made optional; no reserve is spent on unbuilt capability.

## S7. Remaining gates (exact) and status

1. **Registry gate (blocking delegation, not reading):** six roles unregistered here — Owner restart from the TS worktree per S2; confirm names in that session's listing.
2. **Mode gate:** this session is bypass-permissions/Fable 5.1 by Owner direction; the launch note's `manual`/`opus` spelling is unverified in any session until the S2 restart is observed. No mode was silently substituted.
3. **Budget/fit gate:** S6 shortfall needs Current Ops disposition before capability beyond R3-N1; unattributed setup/smoke time still NOT REPORTED.
4. **Design gate:** D-1 compact inspector, remaining-family sheets, portrait/icon/font deliverables — existing designer, no competing designer.
5. **Native gate:** admitted fresh build, lawful dense fixture, explicitly available desktop, HID guard; UX-STALE-NATIVE-01 remains a declared residual to prove on the changed commitment route (Schedule take) with the mechanism labelled exactly; no race hunt.
6. **Data gate:** WIRE-1 picture wait-cause/attention fields; roster and history confirmed on wire.
7. **Render-uptake gate:** open R3 `index.html`, early/waiting/busy/small views and the documented Back/focus repairs before any visual mutation (started: two previews viewed).

Status: **PARTIAL — readiness handoff delivered; implementation and specialist dispatch HELD** pending gates 1–3. Candidate, campaigns,
launcher, evidence, P13B/P14/P15/P16 boundaries and protected refs untouched. No PR, merge or protected promotion.

---

# Local continuation update — 2026-09-14

This updates the existing handoff below, whose source is The-Movies
`751d38f4312d99baa876b92f8ff74295516f579d`. The original text remains intact as historical
preparation. Its older working pins, unknown local adoption/usage cells and prepared launch
command do **not** override this update or the [Current Ops disposition](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/dc4f49fc3f63f7c8dd217877cff37b3744988457/docs/evidence/playability-delivery-20260913-01/CURRENT-OPS-DISPOSITION-01.md).

**Outgoing completion only. No replacement session, native run or specialist assignment.**
The [existing private transfer receipt](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/docs/playability-delivery-review-20260913-01/docs/evidence/playability-delivery-20260913-01/FABLE-LOCAL-TRANSFER-RECEIPT-01.md) records the final dated writer/native yields,
this handoff's actual commit, final accounting and successor gates. This branch link is a
continuation locator; Current Ops receives a commit-pinned receipt separately. Do not infer
successor acceptance from the outgoing yield or file availability.

## Frozen reviewed foundation and actual adoption

- Reviewed gameplay stays TS `6e2c2ca10ce70f43f58e99193e052d4afa59bcfb` / Unity
  `e8c59d8672b6e32de73ed10628abeff49bc1a95e`, on the existing Playability worktrees/branches.
  Both were clean at the safe checkpoint; there was no newer dirty gameplay to discard.
- Configuration-only adoption: `a51ebff89edb0f1830adf090e4673947954f7acb`; all eleven files exactly match the authorized
  `225845395f85f3e47d398687953931556a18c16b` blobs. Four legacy profiles refreshed, seven
  missing paths added; originals backed up in Git-private metadata outside agent discovery.
- Separate instruction commit: `0fbb9fce30bf663761776711c3a7d836c3e6a6ea`; only a current-scope CLAUDE.md preamble.
  Historical root text is preserved byte-for-byte. No Unity source or global settings changed.
- Build46 remains the player, built `2026-09-13T21:44:56Z`, paired seal41; Save20 / protocol4 /
  projection30 and DTO blob `9420d5ef5e5b7db5d9c18d2300f22a3d94074eb2`. Configuration and
  handoff descendants are not newly tested or built gameplay.
- Existing [evidence entry](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/2790ffaf44b41eb6ae685bc9555a8800dd739a6e/docs/evidence/playability-delivery-20260913-01/00-START-HERE.md)
  retains exact executable/schema/DTO/source hashes, tests (5273+5 skips /1428 /202), all80 ACK
  records and their qualifications, matched performance, packaged six-record preservation,
  J1–J7/C1–C5 coverage and critiques. No broad checks were repeated for adoption.

## Received authority, remaining work and next task

Now received: this existing06 handoff and its eleven config/source files; Owner full-overhaul
clarification with 1A/2B/3A/4B; issued04 R3 HYBRID order; later05 coverage/advisory reconciliation;
corrected advisory RECONCILIATION-01; and Current Ops review03 above. Earlier delivery's
non-receipt statement remains historically true. R3 HYBRID is closed, the existing designer
retains ownership, and the independent advisory reviewer stays stopped.

Continue the existing §7 eight-domain / J1–J7 register and05 rows. Delivered bounded navigation,
text, displayed-command, campaign/persistence work is retained. Selected complete employee-left /
pictures-right / useful-center R3 integration, all remaining screen/state treatments, full scaling,
portrait/icon/font/stage-art finishing, lawful optional drag routes, contextual help and retrievable
outcomes still need scoped reconciliation and their own native evidence. No new board, inventory,
estimate, visual layout or full-overhaul completion claim was created by this administrative update.

**UX-STALE-NATIVE-01 is an accepted declared residual of this engineering checkpoint, NOT PASSED.**
Do not hunt timing races. For the changed overhaul commitment route, plan and later prove visible
invalidation/fresh review or a genuine lawful refusal, with independent command-owner rejection;
label prevention and native server refusal separately. Whole-overhaul/Owner acceptance stays open.

Next: successor handoff acceptance, actual custom-role registration and authority/remaining-work
reconciliation; then the existing F-A/F-B/F-C preparation, within real authority and allowance.
R3-N1 remains the first connected future native task: both rails already scrolled; exact employee
inspection/Back, actionable picture → worksite/person → Back, genuine waiting picture; retain both
filters/search/offsets/invoking focus and useful center/global tools. No fabricated density or wire
change. Nothing here dispatches those tasks or admits native input. Preserve remaining P13B and
separate P14/P15/P16 gates and all eight P13B obligations.

## Local access and instruction/settings review

Confirmed coordination directory: `/Users/bruce/The Movies - Playability Interaction TS`;
readable/writable counterpart: `/Users/bruce/The Movies - Playability Interaction Unity`.
Installed executable: `/Users/bruce/.local/bin/claude`, version2.1.270. Model default in existing
user settings is Sonnet; the prospective coordinator command requests Opus. No forced model
environment override was observed. Actual alias resolution, six-role registry, Read-image/render
capability and effective permissions remain fresh-session observations, never inferred here.

No project/local settings, nested scoped instructions, root Unity CLAUDE.md, or managed policy file
was found in the inspected applicable locations. User CLAUDE.md's general Fable orchestration/
reverification advice is subordinate to the explicit no-audit/no-specialist administrative order.
User settings retain existing allow rules and unrelated additional directories; these are not
new task scope or a filesystem sandbox. No global permission/model/hooks change was made. No
configured hook events were observed; the prepared session still requires `disableAllHooks:true`.

**Launch compatibility gate:** installed help lists permission modes `acceptEdits`, `auto`,
`bypassPermissions`, `manual`, `dontAsk`, `plan`; it does not advertise the older packet's `default`.
A help-only invocation with that flag exits0 but does not validate session behavior. Resolve the
normal-prompt equivalent before launch; do not infer permission bypass or silently substitute a
mode/client/model. No session was launched to test it. Keep ordinary prompts and only the approved
counterpart grant; the old sample command is preparation, not verified execution.

Existing native driver/capture instructions and BuildMacOS owner are readable; Unity version is
6000.3.22f1. Current portrait presentation source is accessible, but final art/font/icon availability
and render-dependent readiness are not certified. Exact R3 (47files) and original plan (34files)
archives are verified/materialized under `/Users/bruce/Desktop/Fable-Verified-Sources-20260914-01`;
its MATERIALIZATION-RECEIPT binds hashes and member checks. No prototype or preview was opened;
mandatory actual R3 render uptake remains before visual mutation. Generated fixture/evidence roots
stay those in the existing handoff/driver; no campaign/profile payload was opened here.

## Cumulative usage — no reset

At `2026-09-14T15:23:16.644484+00:00`: prior delivered capability1410.666min; reserve1051.84min plus
publication44.837132min (the previously reported44.84min, including its disclosed initial reading
debit). This adoption interval has consumed 9.627408min of the separately capped30 productive
minutes, all reserve, zero capability. This is a pre-publication snapshot; the compact receipt and
final reply charge the closing commit/push/read-back tail once.

Known totals at this snapshot: capability23.5111h; reserve18.438409h.
Against the original48/24 envelope: capability24.4889h and reserve5.561591h remain.
Against the already-issued72/36 envelope: capability48.4889h and reserve17.561591h remain.
The attached separate setup/smoke/helper receipts provide no productive-hour ledger; their charges
are **NOT REPORTED**, not zero and not silently debited twice. These are the outgoing lead's known
charges; reconcile any separately attributable prior setup charge before treating cumulative
remaining allowance as fully closed. Below18 reserve escalation already applies; discretionary
polish stays stopped. Before capability, price the actual whole remainder under05/06 and preserve
the last-six-hours delivery protection. No unused P13A time transfers and no scope is cut to fit.

---

# Current Ops — Fable adoption and fresh-session handoff

**2026-09-13 · OPS-FABLE-ADOPTION-HANDOFF-20260913-01 · PREPARATION / CONFIGURATION ADOPTION ONLY.** Continue the existing Playability plan and existing implementation. No fresh Fable coordinator, specialist, build or native session is started by this publication. No program-wide coding order or budget reset.

## 1. Disposition and exact unresolved gate

The configuration at **225845395f85f3e47d398687953931556a18c16b** is accepted as the source for configuration-only adoption. Its published smoke evidence is sufficient; do not repeat a six-agent benchmark. It proves six names were discovered in the **setup worktree** and one restricted contract-auditor invocation passed. Actual executing model identity was not exposed. It does not prove adoption, discovery or tool availability in the coordination worktree.

**Owner transfer: NOT YET VERIFIED. Actual coordination adoption commit: NOT YET RECORDED.** The outgoing owner remains the existing VS Code task **Read P13A source packet** until it explicitly yields. Its terminal was reported working; no later yield acknowledgement is available in the inspected records. Fresh-session launch is prepared, not released. Do not infer clean/idle local worktrees, test completion, actual allowance or ownership from published commits.

**Specific checkpoint needed:** the outgoing owner reaches its next coherent source/test checkpoint, finishes or safely closes any admitted native run, preserves all uncommitted work and evidence, performs the bounded local adoption/instruction review below, and writes its exact source/build/remaining-work/usage receipt plus explicit writer and native-input yield. It need not finish the whole overhaul to hand over. Never force a live interruption, clear another owner's lock, discard work, or start a competing native session.

This entry extends the existing `docs/engineering/playability-launch-review/` plan. Branch searches and the inspected plan directory found no published Fable transition entry; a local-only handoff may exist. Reuse and link that handoff/task board at the checkpoint rather than create a second PM hierarchy. A new terminal does not inherit live child sessions or reset account usage.

## 2. Authority and source uptake

Read in this order: this handoff; the actual adopted **docs/operations/fable-team/FABLE-COORDINATOR.md**; SOURCE-INDEX.md; existing plan **00 → 05 → issued 04 → relevant 02 sections**. Later corrections govern earlier reports. The five Fable source documents and six profiles are supplied as exact verified bytes in the accompanying packet. Owner clarification and corrected advisory are also included. The materializer supplies the existing plan and R3 archive from pinned local Git objects; it is not an installer or an instruction to run the prototype.

| Source | Exact repository identity / path |
|---|---|
| Configuration only | The-Movies `225845395f85f3e47d398687953931556a18c16b`, `.claude/agents/` six named profiles and `docs/operations/fable-team/` five documents |
| Existing plan before this administrative addition | The-Movies `06a852acdf58e2e02404efdfc980b0bf32ec54a9`, `docs/engineering/playability-launch-review/`; published branch checked at that commit |
| Issued runtime scope | `04-R3-HYBRID-EXECUTION-ORDER.md`, OPS-PLAYABILITY-R3-HYBRID-20260913-02; 05 is a later scope/design reconciliation, not a blanket additional runtime order |
| Full outcome / 1A, 2B, 3A, 4B | `f2921730a6ff6cb5f0b8e952995978a8ecb8407f`, `docs/operations/UIUX-WHOLE-GAME-OVERHAUL-OWNER-CLARIFICATION.md` |
| Selected R3 | `b56088d63e5b8eb66c78584c7b0f40f915c08d8b`, `docs/operations/uiux-visual-blueprint/r3-picture-cards/`; archived design content `509bd4d76b23ec9faed9c743620208fa77cee332` |
| Corrected advisory only | `ba3854108bfe86b81f0ed4d5259c96101d89c887`, `docs/operations/uiux-opus-advisory-20260913/RECONCILIATION-01.md`; 05 resolves its residual navigation/undo/hint/history language |
| Accepted P13A closeout | `45a3916862a6e98fcb7e9c6908cb2b31f1e8b588`, receipt, final addendum, P13A→P13B handoff |
| Corrected P13B/Playability preparation | document `673f49835404e262ea651b4fcb8fda5e259d80a6`; packaging/handoff `9db31137662afe9d6ef9eb44b6390f611feeadf6` |

All abbreviated repository names above mean **HSpector1/The-Movies**. Unity is **HSpector1/project-studio-unity-visual-spike**. Check for a newer published Current Ops order at actual launch; do not substitute an unrelated newer research commit as authority. Preserve selected HYBRID; no repeated vote, new survey, reviewer revival or duplicate designer.

## 3. Accepted product versus working source versus playable build

| Item | Verified or source-recorded value | Boundary |
|---|---|---|
| Last verified accepted TS / Unity pair | TS `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`; Unity `6420a4d91de52db1bffca2988f2c995672e7d53e` | Qualified P13A Core KEEP, not acceptance of this overhaul |
| Historical accepted player | P13A Candidate03; build `2026-09-11T22:26:25Z`; executable SHA-256 `f67fbdf693c96809be8f60bd5a34e858179c220b5edd771920e73e828973629c` | Recorded in accepted receipt; not rehashed here |
| Incoming contracts | Save V20, protocol 4, projection 30; schema `sha256:e64a3b659e4247b98631f1caa1f0e9eb0b6016aac92b0f46be590360ff9cee48`; DTO Git blob `9420d5ef5e5b7db5d9c18d2300f22a3d94074eb2` | Inherited baseline; actual working pair and build must be bound locally |
| Working TS remote | `wip/playability-interaction-01-ts` at **459ae6c9dc0f5b8c06be31a038e052153472f500** | Ref read this review; newer lawful local/remote work must be preserved |
| Working Unity remote | `wip/playability-interaction-01-client` at **7e22f7a43940b1d0e73fd49f9f980fbfb8be55dc** | Ref read this review; not a verified paired executable |
| Planned actual coordination directory | `/Users/bruce/The Movies - Playability Interaction TS` | Exact path enforced by the published native driver; local existence/ownership still to confirm |
| Permitted Unity counterpart | `/Users/bruce/The Movies - Playability Interaction Unity` | Same restriction; never grant the home directory or all repositories |
| Working player/manifest | Unity `Builds/macOS/Project Studio Visual Spike.app` and `Builds/macOS/build-manifest.json`; TS `dist/studio/engine.mjs` | Driver locators, not an assertion these files are current or present |
| Generated fixture/evidence roots | TS `artifacts/playability-interaction-01/`; Unity `Evidence/Playability-Interaction-01/` | Existing authorized disposable roots, not general profile access |
| Unfinished changes, current tests, paired seal, candidate hashes, usage | **LOCAL CHECKPOINT REQUIRED** | No invented clean tree, passing suite, build or zero usage |

Source comparisons show **four more TS and twenty-five more Unity commits** beyond the earlier observed `6bfb275…` / `101e55f…` checkpoints. They include truthful set-check wording, financial/cancellation copy, shared text preference, person/production navigation, campaign status/continuation, displayed-command protections and tests. Preserve them. Added tests are not proof of a run. No remote adoption or gameplay write is made here.

A concrete remaining source gap is established at current published Unity: `StudioPeopleRailHud.cs:58–81` still reads `snapshot.people.presence.people`, hides for deeper inspection/workspace and passes `MaximumRows` to the compact presence assembler. It is not evidence of the selected complete left employment rail. R3 complete-roster/inspection integration is therefore a justified next task, unless newer local work has already implemented it. Reconcile that delta instead of duplicating it.

Current native evidence is not published in those source diffs. The outgoing owner must identify its existing board/log, last actual tests (including failures), last built pair and raw-run paths. Preserve P13A's historical full-suite/recovery/performance evidence with its source qualifications; do not apply those passes to working Playability sources. Open defects include only defects the actual log still marks open; unverified coverage is not automatically a bug.

## 4. Local adoption, instruction review and safe transfer

The **existing outgoing owner**, at its natural safe checkpoint, is authorized for this configuration/documentation adoption only:

1. Locate any existing Fable adoption receipt/handoff. Reuse it. Record exact current worktrees/branches/HEADs, ongoing operations and unfinished paths. Preserve coherent work in a recovery commit or a named, verified local backup plus changed-path record; never auto-stash, reset or drop changes. Separate WIP source from tested/build identity.
2. Reconcile the eleven configuration-source paths only. Compare the actual local versions with the source and their legacy ancestors. If identical, keep them; if unchanged legacy, refresh; if locally newer/different, preserve and resolve individually. Backup outside every auto-loaded agents folder. **Do not merge/cherry-pick the setup branch wholesale, switch to its old gameplay, replace `.claude/` wholesale, or adopt unrelated settings/hooks.** The packet helper defaults to inspection and refuses divergent files; it does not commit or establish ownership.
3. Commit the exact adopted six profiles plus five docs on the continuing TS coordination branch. Verify the staged path set, parent, resulting commit and source/blob mapping. Report the **actual adoption commit**. A prepared ZIP or this documentation commit is not that commit.
4. Inspect applicable root/parent/nested CLAUDE.md and .claude rules for both worktrees, project/local/user/managed settings, relevant model overrides, existing tools and hooks, without publishing secrets or private session logs. Remote TS CLAUDE.md blob `329ae54092327e999abdcf5eacfb19aafb9e0ee9` retains branch-specific marathon/M0A authority and an unconditional old build-contract rule. Preserve history and useful invariants, but add a narrow current-scope preamble making FABLE-COORDINATOR and the actual active order required. No whole-file replacement. The packet supplies proposed wording; reconcile newer local text. Unity's published root tree contains no CLAUDE.md; that says nothing about parent/local/nested instructions. No global configuration changes.
5. Record installed Claude version and actual executable path; the setup receipt's 2.1.270 and user-model setting are historical environment observations, not the current worktree audit. Preserve normal prompts. Session `disableAllHooks:true` leaves hooks inactive; do not install or activate hooks. Inspect restrictive policy conflicts and return them rather than disable protections or silently switch models. Check Unity file access, existing editor/build command, capture/Read-image capability, renderer, selected design archives, font/portrait/icon availability and approved fixture roots. Missing render access blocks render-dependent tasks only.
6. Complete the existing coverage/usage/continuation records described below. Append a two-part transfer receipt: **outgoing writer yields** with time and frozen/preserved source/evidence state; **outgoing native owner yields** with owned run/process/guard cleanup status. These are separate from merely committing. Record the successor's explicit acceptance at fresh-session startup; do not forge a successor acknowledgement beforehand. Private task/session IDs and process details stay in local operational metadata; publish only sanitized role/status and necessary source pins.

The outgoing writer may finish its currently authorized coherent increment while this handoff is prepared. Independent published-source reconciliation/materialization can continue without a native slot. If another actual writer exists, stop only overlapping work and name the owner/checkpoint. Never force a lock, kill a worker, launch a second input session or read mutable files it is editing.

### Narrow CLAUDE.md preamble to adapt, not a blanket replacement

> Current Fable continuation: read `docs/operations/fable-team/FABLE-COORDINATOR.md` and the adopted Current Ops handoff/issued order before tasks. Follow the recorded full UI/UX → remaining P13B → P14 → P15 → P16 gates. Historical M0A/marathon scope below does not override current explicit Owner/Current Ops authority. Preserve deterministic state, strict contracts, existing protections and normal permissions. No later package is authorized by its research document. Update the existing handoff/task board; do not start until the recorded writer/input transfer and applicable execution gates are satisfied.

Record before/after instruction hashes and diff separately from the eleven-path configuration adoption. A conflicting parent/managed instruction is an explicit local gate, not proof of permission to edit the parent or global file.

## 5. Launch command, registration and initial coordinator prompt

**Run only after the local configuration, instruction and outgoing-yield gates are recorded.** Reuse the current TS worktree; do not use `~/The Movies`, the setup worktree, Downloads, `--worktree`, `--continue` or an old session resume to masquerade as a fresh context. The setup receipt's quoted `"~/…"` command is historical; use the exact absolute directory below.

```bash
cd "/Users/bruce/The Movies - Playability Interaction TS" &&
claude --model opus --permission-mode default \
  --settings '{"disableAllHooks":true}' \
  --add-dir "/Users/bruce/The Movies - Playability Interaction Unity"
```

**Fable is the coordinator role, not the requested model name.** `opus` is the requested coordinator alias for this command, not a claim of actual runtime identity. The six specialists retain their own configured Opus/Sonnet defaults. If the alias is unavailable, stop that launch and report; do not buy credits or silently substitute a model/client. Inspect local CLI support before use, without installing/upgrading. Official CLI/subagent/settings references were checked for this preparation; installed behavior governs the final local receipt. `--add-dir` grants counterpart file access, not automatic adoption of its instructions or profiles. It is not a filesystem security sandbox.

At the actual fresh session's first response, record the six custom roles from the runtime's available agent registry/installed-version discovery mechanism: contract-auditor, instrumentation, sim-core, test-author, uiux-designer, unity-ui. Do not mistake file existence or `claude agents` background-session listing for custom-role discovery. This check happens **after start, before delegation**; it is not an impossible pre-start requirement. Retain the one successful setup invocation as evidence; no new blanket smoke/benchmark campaign. Missing registration blocks the affected role, not independent coordinator reading. Actual model unavailable = **CONFIGURED ALIAS / ACTUAL MODEL NOT EXPOSED**; do not mine private logs.

Initial prompt (also supplied as `FABLE-INITIAL-PROMPT.txt`):

```text
You are Fable, the coordinator role for the existing Project: Studio work.
Read docs/operations/fable-team/FABLE-COORDINATOR.md first, then SOURCE-INDEX.md
and the adopted Current Ops Fable handoff. Read the current plan 00 → 05 →
issued 04 → relevant companion sections, applying later Owner corrections.

Begin in PREPARATION / HANDOFF-ACCEPTANCE mode. Confirm the outgoing writer
and native-input yield, your exact current paired worktrees and adoption
commit, instructions/settings review, source/build distinction, six actual
custom-agent registrations and cumulative usage. Read the existing task
board/coverage/evidence/continuation record; do not create a duplicate.
Do not treat this startup as production or native authorization. Missing
handoff fields block overlapping implementation, not independent source work.

Keep R3 HYBRID and 1A/2B/3A/4B. All delivered screens, workflows, interface
art, scaling, lawful drag/drop, contextual help and retrievable outcomes
remain in the overhaul. A main screen is not completion. No generic undo,
forced tutorial, false scroll defect or invented history/command.

Prepare the bounded assignments in this handoff from the exact local
remainder. Default maximum two concurrent specialists, one production
writer, you as integration owner, one native-input owner. Specialists may
not redelegate. Keep the existing designer; do not commission new mockups.
Persist read-only returns yourself and update the handoff before compaction.

Return a compact ready/blocked gate record and the next R3-N1 task. Proceed
with routine work only under its actual applicable execution/ownership and
budget authority; this adoption does not expand it. Later P13B/P14/P15/P16
need their own refresh and execution gates. No hooks, bypass permissions,
current campaigns, paid resources, PR/merge or protected promotion.
```

## 6. First three bounded assignments — prepared, not dispatched

These use TASK-TEMPLATE fields. Each task is **READ_ONLY initially**, allows **no writes**, and is a real launch-readiness investigation, not an agent benchmark. The parent persists returns into the existing board's evidence paths. Use immutable exports of the exact transferred candidate, not moving files. At most A and B concurrently; C follows B. Render-dependent observations require accessible actual artifacts; absence is recorded, not fabricated. Once preparation is complete, changing a task to IMPLEMENT/VERIFY requires its explicit paths, checks, allowance and applicable existing execution authority, not inference from the role name.

### F-A — authority and transfer contract
- **Role/model:** contract-auditor / configured Sonnet, actual identity when exposed.
- **Outcome/mode:** reconcile local transfer/adoption/instruction receipt and task authority; READ_ONLY.
- **Sources:** this handoff, FABLE-COORDINATOR, exact adopted six profiles, issued 04, later 05 and sanitized local instruction/yield/usage record. Read only this bounded set.
- **Repositories/base:** transferred coordination snapshot; remote reference TS 459ae6c9… and Unity 7e22f7a4… are comparisons, not a forced reset.
- **Write paths:** none; no Bash, processes, settings edits, builds or native input.
- **Preserve/check:** correct order, one writer/input slot, no automatic later coding, actual adoption/path mapping, newer local instructions retained, no fabricated yield/model/remaining time. This is not a rerun of the setup smoke test.
- **Output:** requirement-to-evidence table and precise unresolved gates to Fable; parent links it under existing continuation record.
- **Allowance/stop:** at most 45 minutes from available administrative/verification allocation, not additional program hours; stop at specific blocking fact; independent permitted reads may continue.

### F-B — complete employee rail and exact Back integration scout
- **Role/model:** unity-ui / configured Opus, actual when exposed.
- **Outcome/mode:** identify the smallest remaining native implementation slice for R3-N1; READ_ONLY, not design ownership.
- **Sources:** selected R3 README/DESIGN/REVIEW and actual supplied previews; current frozen StudioPeopleRailHud.cs, StudioPeopleRailContracts.cs, StudioProductionRailHud.cs, StudioWorkspaceHost context/navigation owners, existing `bridge/people.ts` roster and schema, relevant rail/Back tests; current owner’s delta and captures.
- **Write paths:** none. Exclude all simulation, settings, user data, other designer’s mutable work and extra research.
- **Dependency/preserve:** Fable provides real file/image access; compare the confirmed presence-based published gap to newer local work. Reuse existing roster DTO where sufficient; absent data is a named exact wire dependency, not client-authored truth. Preserve prior navigation/text/command fixes.
- **Acceptance/output:** exact source locators, proposed minimal writable paths, current data owner, return-context fields for both rails/focus, tests already present, missing native evidence and a finite implementation estimate. No claim that images prove actions. Parent persists report and updates existing J/C coverage.
- **Native slot:** none. **Allowance:** at most 60 minutes of remaining preparation/capability allowance; stop for missing lawful command/wire authority or inaccessible render, not all unrelated tasks.

### F-C — first native proof plan and evidence applicability
- **Role/model:** test-author / configured Sonnet, actual when exposed.
- **Outcome/mode:** after F-B, specify the connected R3-N1 regression/native task using existing capture/build owners; READ_ONLY.
- **Sources:** F-B return; existing tests, Tools/playability-native-preview.md and driver; frozen paired manifest and actual run/capture records supplied by outgoing owner; relevant J1/J2/J7/C1/C2/C5 and 05 corrections.
- **Write paths:** none; no test execution or native input during this assignment.
- **Preserve/check:** no same-name substitution, no presence-as-employment, both rails' scroll/focus retained, ordinary wait not false action, lawful single-effect dispatch, accessible global tools, rendered text and portrait status, honest build identity. Driver intentional settle times are not input latency.
- **Output:** exact repeatable task/assertions, legal fixture requirements, capture/viewport/scale fields, evidence gaps and available test command names from current manifests. Parent writes the result; no fictional suite PASS.
- **Allowance/stop:** at most 45 minutes from remaining verification allocation, no new hours; missing old proof remains NOT VERIFIED. Do not invent a new full-game audit or instrumentation subsystem.

These caps total **2h30m maximum if all are needed** and must fit the existing reconciled allowance before dispatch. Do not spend time merely because a cap exists. The existing designer supplies missing views/assets under its own ownership; uiux-designer is available for bounded delegation only after that owner agrees to a disjoint task or yields it. Sim-core and instrumentation wait for a concrete authorized seam or measurement.

## 7. Coverage register continuation — all domains remain

Append exact screen/state rows to the existing 05/J1–J7 register, retaining original IDs. Fields: screen/state; source/owner; selected visual pin; redesign/refine/retain-with-evidence; legal command/data; completed source; actual native/design evidence; defect/gap; dependency; remaining effort; acceptance task. **Exact live inventory and completion are not established remotely.** This table completes domain coverage, not a false screen-level acceptance claim.

| Domain / existing J mapping | Published work to preserve | Outstanding acceptance / next evidence |
|---|---|---|
| Home/HUD/tracking — J1/J2/J7 | Rails, HUD, text/navigation edits; selected R3 source | Full employment left vs current compact presence rail, hybrid pictures right, usable center, counts/filter/search, live updates, inspector/tool separation, name/timeline, both-list return; R3-N1 not proved by current source |
| Film journey — J1/J5 | Script/development, displayed action, production remedy/profile, set-check, release memo changes | Complete script→casting/greenlight→schedule/worksite→film→Post→release/result; current/wait/stale states; exact source-bound native tasks and retained drafts |
| People/casting/contracts/assignments — J1/J2 | Profile/casting comparisons, acknowledgement/signing guards, text changes | Exact identity/no-location/duplicate names; employment vs assignment; complete person/contract states; approved final portrait standard and population coverage |
| Buildings/tools/Lab — J3/J4 | Build navigation/text, Lab funding/cancellation explanations | Actual placement/quote/outage/cancel-preview vs submitted work; knowledge vs physical/operational truth; delivered one Scientist, no P13B mechanics |
| Finance/Industry/records/outcomes — J5 | Finance/Industry/history/result text and navigation edits | Period/estimate/unknown/public-private/return context; important outcomes retrievable after current badge clears; no invented journal or history |
| Menu/campaigns/settings/help — J6/J7 | Save As leave continuation, operation-specific pending/status, shared text preference | Naming/overwrite/draft-loss, same-request unresolved retry, explicit continuation, Save As isolation and relaunch; contextual/on-demand help, no automatic first-visit tutorial |
| Shared controls — J7/C1–C5 | Keyboard/context/displayed-command protections | 1A mouse/trackpad and complete efficient keyboard; existing controller compatibility; optional 2B legal dragging with full non-drag routes and meaningful reviews, no universal undo; no wheel-camera or modal leaks |
| Visual system/art/readability — all J | Shared text source and selected Backlot/R3 design | All remaining families redesign/refine/retain-with-evidence; full HUD/rails/dialogs/tools 100/150/200%; XAG rendered target under 05; fonts/icons/stage art/portrait finishing. Samples establish standard, not finished population art; no incompatible legacy islands |

Keep corrected advisory status: withdrawn scrolling defect stays withdrawn; shelf symmetry, compression, genre tint and visible filters are optional design alternatives. Default PC text target is 05's rendered output, not CSS sizes or a new Owner vote. 3A excludes guided/automatic tutorial; 4B current attention and event/operation history are different. Preserve safe spending/legality with 2B, not every menu step.

First native review once ownership, design/source access, actual build and budget gates permit: **R3-N1** on a lawful disposable studio, both rails already scrolled; inspect an exact employee → Back; inspect an actionable picture → worksite/company person → Back; inspect a genuine waiting picture; verify both offsets/filter/search/invoking focus and usable center/global tools throughout. Record native actions/receipts plus screenshots at supported small/normal/enlarged settings. No invented 40-person or 20-picture rows to force density. A strip-only or main-screen result does not finish the overhaul. The driver currently admits only 1280×720/1440×900 direct builds; larger/Retina/package admission requires its already-governed exact verification, not bypassing that guard.

## 8. Program readiness — no automatic advancement

Use FABLE SOURCE-INDEX on demand. These are inspected references and gates, not a new research campaign or all-program task.

| Phase | Accepted prerequisite / present status | Material decisions and refresh | Execution gate |
|---|---|---|---|
| Whole UI/UX overhaul | P13A qualified Core accepted; current Playability source in progress | Complete local inventory/yield/build/evidence/usage; render access and existing designer deliveries; legal drag/data/history dependencies and whole-outcome budget fit | Applicable issued 04 scope plus later 05/Owner direction; transition does not authorize out-of-scope work. Whole-game integrated Owner verdict remains required |
| Remaining P13B | Preserved corrected preparation at 673f4983 / 9db31137; not an accepted implementation | Accepted post-UX pair; R07 useful production recipe/content gap, concrete candidate values, office recommendations, governed schema/versions and budget/gates need explicit disposition | Targeted post-UX refresh + reviewed finite order. Preserve all eight: staffing; multi-Lab cooperation/splitting; queues; direct conversion/purchase; forecast/replacement; cancellation; inventor/prototype pricing; symmetric rival research |
| P14 | Preparation index at `8ef5246aec115cc32d01d9fb8c916e3538342dca`, `docs/engineering/P14-PREPARATION-REVIEW-INDEX.md`; not launch-ready without upstream | Post-P13/post-UX touched-contract refresh; current employment/retained work/first-filming versus first-take distinctions; preparation Q/decision recommendations and first-slice budget disposition | Accepted predecessor contracts, Future Ops recommendation, separate Current Ops order; do not import P14 law into UI |
| P15 | Corrected research at `c5b52b4d8147d9de7d1478d12397cdface08bf70`, INDEX then RECONCILIATION-02 | Not implementation-ready. Public financial-strength/disclosure and ranking evidence choices remain for later disposition; current finance/settlement/production contracts must replace old P12-only reconnaissance | Finite launch preparation and separate order after predecessors; **P15 does not execute purchases; P15D purchase recommendation withdrawn** |
| P16 | Corrected research at `084713980ef884ac4b7be44f22e97fcaaec13683`, review index then reconciliation/register | Initial full absorption is selected, no autonomous acquired label/second studio; current P15 disposal/claims/rights and P14 employment producers required. Do not treat older P15 list as reopening P16's resolved product direction | Separate readiness/order after real upstream producers. Apply later P15 correction over P16's older cited estate text: **14-week maximum is withdrawn**, not a proven bound |

The P14 index still describes a P12 reconnaissance base and incomplete post-P13 refresh; preserve its useful preparation rather than treat that stale runtime as today's. The P16 register says no genuine product choice blocks a slice; producer readiness/tuning are still required. P15's frozen Legacy/Endless and full-absorption directions are not a reason to execute them during the UI pass.

## 9. Allowance, stages and durable continuation

Latest issued UI allowance is **108 cumulative productive lead hours = 72 capability + 36 protected verification/correction/delivery**. All prior Playability work counts once. Actual consumed capability `C_used` and reserve `V_used` are **not reported in accessible current records**. Remaining is `72 − C_used` and `36 − V_used`, not 108 fresh hours. P13A's 22h30m historical remaining reserve does not transfer. Fable setup/smoke/adoption times must be identified, not silently mixed with native capability or counted twice. Account quota and context size are not hours remaining.

At the local checkpoint, reconcile each stage: selected studio/roster and connected inspection; remaining rendered layouts/shared controls/art; all-domain integration; native/correctness/performance/delivery. Show already completed reusable work, current defects, dependency owners, remaining capability and verification effort, and contingency. Keep 04's cumulative 48/60/72 capability stops, 24/18 reserve alerts and last six reserve hours for reverify/package/delivery. Full-overhaul fit remains OPEN under 05; a new terminal is not its resolution. If the whole remainder exceeds the issued envelope, return a priced staged amendment, never drop required portraits/drag/help/screens or spend reserve to finish features.

| Phase | Capability allowance | Verification reserve | Status |
|---|---:|---:|---|
| Current overhaul | 72 total, subtract actual prior C_used | 36 total, subtract V_used | Issued; whole remaining fit still to reconcile |
| P13B | 84 | 36 | 120-hour **proposal**, not activated or borrowed now |
| P14 / P15 / P16 | Not issued by this handoff | Not issued | Define phase/slice-specific allowances at their own readiness gates; no promise the program fits one account window |

After meaningful increments and before compaction/exit, Fable updates the **existing** board/handoff with: order/phase; current candidate and build pins; actual changed paths and dirty/WIP preservation; requirement→result; raw checks/failures; three critique statuses; open coverage/defects; budget used/remaining; exact next task; production and native-input ownership. Read-only specialists return findings; Fable persists them. Do not put credentials, personal campaign data or private session links in Git. A concise sanitized public continuation may point to protected local metadata, but essential source/next-task facts must be recoverable without the old chat.

## 10. Required return from the safe local checkpoint

Update this existing entry or its already-owned continuation record with: exact adopted configuration commit and any separate narrow instruction commit; old-owner yield times/status and later successor acceptance; actual source/build/schema/DTO bindings and preserved unfinished paths; linked test/native evidence and failures; completed screen/state register and finite remaining estimate; first assignments' frozen inputs/path permissions; installed CLI/access/asset check; initial registry observation after fresh start.

Until those facts exist, report **PREPARED — LOCAL TRANSFER/ADOPTION/USAGE GATES OPEN**, not launch complete. In particular: no fresh Fable session started, no specialists dispatched, no native work here, no protected refs promoted. Documentation preparation can proceed independently; an unrelated future P15/P16 question cannot block it or an already-authorized nonconflicting current task.

Official command references checked 2026-09-13: https://code.claude.com/docs/en/cli-reference ; https://code.claude.com/docs/en/sub-agents ; https://code.claude.com/docs/en/settings . Local installed-version behavior and actual runtime metadata remain to verify; do not modify account/global configuration to match this documentation.
