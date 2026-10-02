# 1358-C9: landing handback for the slice B pin sweep (Save44, projection 57)

The Save44 and projection-57 pin sweep ([1358-N](1358-N-save44-pin-sweep-plan.md)) landed at f458680b as revision r4.
This handback holds three things:
- the merged classification of every landed edit;
- a disposition for each census row that took no edit;
- the closure findings that the sweep carries without an edit.

1358-D9 required the classification rows (R1) and recommended the disposition table (N5).

## What landed

| Step | Commit | Check |
|---|---|---|
| Production steps 1 to 4, r2 (1358-E2), one commit each, built from the staged cumulative patches (95d5a5d9…, eaa026e2…, 510c361b…, 2004b500…) | 9eb1e66e, 8df1858e, 615adeb2, 83d1030d | Each of the 13 landed files is blob-equal to tag `step4` in the planner's scratch repo; `src`, `bridge` and `generated` trees equal step 4's (762d8e09, faa227af, 9ff54168) |
| Sweep r4, applied with `git apply --index` from [1358-sweep-r4.patch](1358-stage/sweep-r4/1358-sweep-r4.patch) (94f0b476…) | f458680b | 154 test files, +1,058/-679; each staged blob equals scratch branch `sweep-r4` (4e36a25) |
| The p57 source manifest (5d605954…) | eb1c2512 | 17 inputs, the producer and its tsconfig |
| Recorded run `1358-p57-declaration` and its outputs | 282ad680 | exit 0, `fixedSource`, `allGuardsExact`; F10 and F11 render to 1dadf88f…71fa4 (420,340 bytes); six fixed positives unchanged |
| F10 and F11 take the recorded values, with a provenance comment | 5ac4b738 | Census rows N-0150 and N-0151 (P4) |
| Recorded GREEN `1358-sliceb-green-recorded` and its outputs | b60db650 | 3 failed, 145 passed (148): the three row 6 exceptions; `fixedSource`, `allGuardsExact` |

The recorded broad gates follow in [1358-M3](1358-M3-sliceb-recorded-broad-gates.md).

## The classification

[1358-sweep-classification-merged.json](1358-stage/sweep-r4/1358-sweep-classification-merged.json) holds 762 rows:
- **The units' rows.**

  | Unit | H | G1 | G2 | G3 | G4 | G5 | G6 | F1 | F2 |
  |---|---|---|---|---|---|---|---|---|---|
  | Rows | 63 | 83 | 59 | 104 | 120 | 115 | 104 | 22 | 47 |

- **The parent's 45 rows** cover every commit no unit classified. The 44 rows that 1358-D9b checked are
  [1358-classification-parent.json](1358-stage/sweep-r4/1358-classification-parent.json):
  - G3's S5 draft, 99ced62: 8 call sites and 6 helpers;
  - G6's S5 draft, a309b54: 5 call sites and 5 helpers;
  - the N-0140 week-93 lift, d8be757, and its r3 follow-up, 7e7a065 (1358-F12 ruling 7);
  - the parent's family-10 comment, 8559440;
  - r3's edits, 0bc0a46: 1358-D9 R2, R4 and N1 to N3.

  The 45th row is r4's comment, 4e36a25 (1358-D9b N1).
- **Line numbers** follow each unit's commit, as 1344-D4 found for Save43 (1358-D9 check 10).
- **Classes.** S1 293, S2 138, P1 75, S4 48, S5 36, S3 31, S8 27, S6 19, P2 18, P5 17, P3 1 and S7 1 (704 rows). S5
  includes the `S5 (helper)` row and S8 the `S8 (column)` row. The other 58 rows are 29 S9 rows, 13 S9 covers and S9
  comments, 15 comments and one `S10 (C20 retained)` row, N-0042 (F2, `p14c3-save-v38:105`).

## Census closure

The census ([1358-stage/n/census.json](1358-stage/n/census.json)) holds 685 rows.
- **656 carry a classification row.** These include the 14 S5 rows the G3 and G6 drafts and the week-93 lift edited,
  which the deferred lists held until now. Three of the 656 record no edit: N-0042 (the retained C20 row) and N-0093
  and N-0094 (S6 lines whose `mintedEdge` helper G1 edited).
- **29 carry no classification row.** 27 take no edit. N-0150 and N-0151 take 5ac4b738's edit, outside the sweep.
  Each has the disposition below.
- **"No S9 edit" and the like** mean no edit under the row's own class. Ten of these lines carry a sibling row's edit:
  - S4 inserts at N-0026 (N-0027's line), N-0443, N-0448, N-0541, N-0572, N-0574, N-0497, N-0521 and N-0523;
  - the S1 rename at N-0095 (N-0096's line).

| Census | Class | Site, census line (HEAD line) | Disposition | Evidence |
|---|---|---|---|---|
| N-0007 | S9 | `helpers/p14c2b-fixtures:69` | No S9 edit. Only `p14c2b-save-v36` calls the helper. The chain succeeds at :64. At :83 and :98 it meets `convertV44ToV43`'s romance refusal first, which those leaves pin (G4-new-3 and G4-new-4) | X8: the file passes; X6 probe; 1358-F10 ruling 3, 1358-F11 |
| N-0027 | S9 | `helpers/p14c4-fixtures:71` | No S9 edit. No test calls the helper, so the chain never runs. Its S4 insert (N-0026) type-checks | X8 type gates |
| N-0444 | S9 | `contracts/v14-boundary-guards:63` | No S9 edit. The chain succeeds | X8: the file passes in full |
| N-0449 | S9 | `p06a-w1-release-authority:406` | No S9 edit. The chain succeeds | X8: the file passes in full |
| N-0542 | S9 | `p14p4p5-opportunities:326` (:335) | No S9 edit. The chain succeeds | X7t, X8 |
| N-0573 | S9 | `save.test:370` | No S9 edit. The chain succeeds | X8: the file passes in full |
| N-0575 | S9 | `save.test:419` | As N-0573 | X8 |
| N-0101 | S9 | `p14b5-relationships:1394` (:1400) | No S9 edit. Save43's shelving refusal still fires first ("migrateToV42: cannot downgrade or discard a screenplay shelving rejection count of studio-aca408ec-r01") | X6 probe; GREEN |
| N-0102 | S9 | `p14b5-relationships:1411` (:1417) | As N-0101 (4 cases) | X6 probe; GREEN |
| N-0103 | S9 | `p14b5-relationships:1426` (:1432) | As N-0101 | X6 probe; GREEN |
| N-0105 | S9 | `p14b5-relationships:1447` (:1453) | As N-0101 | X6 probe; GREEN |
| N-0367 | S9 | `p13b-s3-save-v23:115` | No S9 edit. The V39 guard still fires first ("migrateToV39: cannot downgrade or discard an opportunity predicate or recorded first-take subject") | X6 probe |
| N-0368 | S9 | `p13b-s3-save-v23:116` | As N-0367 | X6 probe |
| N-0369 | S9 | `p13b-s3-save-v23:117` | As N-0367 | X6 probe |
| N-0450 | S9 | `p06a-w1-release-authority:447` | As N-0367 | X6 probe |
| N-0454 | S9 | `p08a-w0-studio-history:398` | Dropped: `live` there is a V18 envelope (1358-F10 ruling 6) | F10 |
| N-0455 | S9 | `p08a-w0-studio-history:399` | As N-0454 | F10 |
| N-0498 | S9 | `p14c3-profession-history:119` | No S9 edit. Save43's shelving refusal fires first (studio-de11f27b-r04, 3 cases) | X6 probe |
| N-0522 | S9 | `p14c3-transitions:175` | As N-0498 | X6 probe |
| N-0524 | S9 | `p14c3-transitions:207` | No S9 edit. The V37 guard fires first ("migrateToV37: cannot downgrade or discard profession transition, industry retirement or entrant authority") | X6 probe |
| N-0070 | S10 | `bridge-p14b5-relationships:540` (:544) | No S10 edit. A retained 1348-I identity (the ledger-seed chain digests); its primary is unchanged | X8: SAME |
| N-0071 | S10 | `bridge-p14b5-relationships:560` (:564) | As N-0070 | X8: SAME |
| N-0354 | S10 | `p13a-scientist-foundation:32` | No S10 edit. A retained identity; its primary is unchanged | X8: SAME |
| N-0640 | S10 | `p14b4-rival-seating-preference:498` | No S10 edit. A retained identity; its primary is unchanged | X8: SAME |
| N-0092 | S10 | `p14b5-relationships:236` (:238) | No S10 edit. `bytes()` strips the whole relationships root before it compares | X9t, GREEN |
| N-0096 | S8 | `p14b5-relationships:1297` (:1299) | No S8 edit. Each of the 20 family-10 cases refuses with a `validateSaveV44` message that names its tampered field | X6 probe; GREEN |
| N-0150 | P4 | `bridge-contract-generator:724` (:732) | F10 takes the recorded producer value 1dadf88f… (5ac4b738) | `1358-p57-declaration` |
| N-0151 | P4 | `bridge-contract-generator:725` (:733) | F11, the same value and provenance | `1358-p57-declaration` |
| N-0198 | P2 | `bridge-runtime-checkpoint:763` (:766) | No P2 edit. The `it.each` gains the projection-v56 case, a new test identity that passes ("accepts and migrates the enumerated sha256:349b2d3e… (projection-v56) identity") | X8: the file passes, 72 of 72 |

## S8 rows measured with no pin

1358-F12 ruling 3 closes four S8 rows without a pin. X6 logged every case, and each reaches its own field's guard, never
a version check:

| Row | Site | Cases |
|---|---|---|
| H-new-1 | `p14c3-save-v38:121` | 102 |
| G5-new-7 | `p14c2rm-writer-continuation:378` (HEAD :379) | 32 |
| G6-new-4 | `p14b1-t4-regressions:86` | 15 |
| G6-new-5 | `contracts/studio-events.contract.test.ts:221` | 24 |

1358-D9 R2's site took a pin instead: HEAD `p14c2rm-writer-continuation:313`, under its comment at :312 (r2 :312).

## Closure findings the sweep carries without an edit

1. **The p14r3 movement leaf** never reaches the V41 guard: `validateSaveV41`'s reconciliation check refuses its input
   first (1358-F11).
2. **Two guard arms cannot fire on a valid save:** the V41 movement arm (`save.ts:10647`) and the V27 finance arm
   (`save.ts:8848`) (1358-F11).
3. **The V36 `extensionUsed` branch** has no own-era input that holds a used extension. This is 1344-K's open item
   (1358-F11).
4. **N-0468 cases 1 to 3 and 18** refuse at a record or project guard before the rule their names describe. The pins
   record what they measure (1358-F11). The R2 pin shares case 1's input and message.
5. **The duplicate-receipt leaf** (`p14d1-rival-shelving-save-v43:168-181`), by reading, passes on the concept check
   (`hollywoodValidation.ts:539`) before the duplicate rule (:549) sees a second row. No run has measured it. The leaf
   predates the sweep (1358-D9 finding 10, N4).
6. **The V41 staging** applies four of the release law's six tests. Its comment now says which two it skips; the pin
   holds whichever employee the law would end (1358-D9 finding 5).
7. **A stale doc comment** (`p14d1-rival-shelving-save-v43:40-41`) still calls bare `TUNING` access a TS2339 "until
   tuning.ts adds it". Step 4's `tuning.ts` carries all three keys, so the cast is redundant and harmless (1358-D9b).
8. **The week-93 title** (`p14d1-rival-shelving:553`) names only the shelving strip, not the `convertV43ToV44` lift
   (1358-D9 and 1358-D9b, not required).

## Process notes

- **A lost output.** The parent edited the dry-run script while 1358-X6 ran. Bash resumed at a stale offset and
  truncated X6's core output. X8 measured core in full (memory `never-edit-running-script`).
- **The linked fixtures directory.** Script v1 linked `tests/fixtures`, so the union fixtures module imported the
  repository's pre-step-4 schema in X8. Script v2 copies that one module (1358-F12 ruling 8).
- **History searches.** G2's `log -S` ran in the partial clone and fetched objects (1358-F10 ruling 10). G1 disclosed a
  `log -p` in its handback (`1358-stage/sweep-r1/g1/handback.md:136`), with no fetch reported (1358-D9 finding 11).
  Later units were told not to search history.
- **A false stop.** The first landing script, `recorded2.sh`, stopped the producer before its preflight. Its outputs
  check globbed `1358-p57-declaration-*`, which matched the producer's own committed files. `recorded3.sh` checks the
  five names the recorder and guards write. No recorded attempt began, so nothing was voided.
