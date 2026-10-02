# Parent notes for 1358-F10 (rulings on the sweep handbacks); fold into the record at merge time

## G2 (done 03:5x; patch 5dd89ed6…; 57 edited, 2 deferred P4, 1 no edit, 1 new)
- G2-new-1 (bridge-runtime-checkpoint:439 `/canonical V43 save bytes exactly/` to V44): accept as S2; the Save43 sweep labelled the same line S8. Label only.
- Its `git log -S` in the repo fetched blobs (partial clone, blob:none) and set off gc --auto at about 03:34: 34 packs, no garbage, HEAD and the tree unchanged, no gc left running (checked 03:5x).
- P2 premise (F10 fixture = whole current schema) settles in the dry run. The stale comment citation at :435 (runtime-checkpoint.ts:501, now :505) stays, like the save.ts citations.

## G4 (done; patch e4af1e3e…; 120 edited, 4 deferred)
- G4-new-1..4 (p13b-s8-save-v27:188, :195; p14c2b-save-v36:74, :82): loose `/cannot downgrade/i` regexes already masked by V39 under Save43 (1344-X12; 1344-C5 items 39, 58). Ruling: no edit, recorded as closure findings, as 1344 did. Revisit only if a measurement shows a failure.
- p13b-s3-save-v23:115-117: M2 decides (V39 message: no edit; convertV44ToV43's message: S9 follow-up, cover V39 with p14p4p5-opportunities:327).
- Titles: the renames change only the numbers; stale sentinel titles whose bodies move are renamed (F9 ruling 5 governs over the draft's P5 sentence).

## H (done; patch 8b2e33e6…; 58 edited, 7 deferred)
- N-0041 (p14c3-save-v38:87, S5): the sweep dry run decides it, not M2 (M2 stops the leaf at :72).
- H-new-1 (p14c3-save-v38:116, bare .toThrow() in rejectMutations): treat as S8 vacuous pass, like the four p14c2rm leaves: a probe logs each case's message in the dry-run tree, then the follow-up unit pins each measured message with its source line.
- H-new-2, H-new-3 (p14p3-directing-promises:361, :438; G5's file): S9 candidates created by H's futureSave insert; to the S9 follow-up after the dry run.
- Acceptance by reading: rows 59-61 and p14b10-mentor-label pass after H; record the first Mentor leaf's duration against 49,182 ms.

## G3 (done; d698d97; 103 edited, 8 S5 deferred; s5-draft.patch kept aside)
- Both older-roster digests recomputed independently and equal the planner's (d25c6425…, afae82e4…), each method first reproducing its base pin.
- S5 decided by the sweep dry run, not M2 (G3's 8 rows and H's N-0041): in M2's unswept tree each leaf stops at an earlier version or projection pin. This amends F9 ruling 1 for S5: the first sweep dry run runs WITHOUT the S5 drafts; a comparison that fails with only the two new edge fields gets the helper in the follow-up unit (G3's s5-draft.patch is the starting point for its 8).
- prior55 describe title "current56" (bridge-p14r2r3-prior55:146): no rename (stale already; precedent 1309-E; F9 ruling 5).
- N-0238 census reasoning corrected (the expectation writes `relationships: []`; the V29 source has no such root); the edit stands.
- G3-new-1 (bridge-p14c3-runtime:178, migrateToV38 on a migrated genuine save): no edit; the dry run confirms.
- Merge check: whitespace-only line changes (G3 saw its editor drop trailing spaces); compare `git diff --stat` with `--ignore-space-at-eol` on the merge.

## G6 (done; 2eaee24 certain rows; 49bafc6 S5 draft; 101 edited, 8 deferred)
- Merge sweep-g6 at 2eaee24 (drop 49bafc6 from the first dry run, per the S5 amendment). Its s5-draft.diff starts the follow-up for the 5 p14p4p5 rows.
- N-0656 (p14p4p5-cross-owner:102, S5): the dry run decides (admitted(state) fails at :75 first in M2's tree).
- G6-new-4 and G6-new-5 (p14b1-t4-regressions:86, contracts/studio-events:221) are S8 by 1358-N's own S1 rule ("a renamed call under a bare .toThrow() also takes an S8 row"); the same holds for H-new-1. Measurement: a probe in the dry-run tree rewrites each bare `.toThrow()` at an S8 site to `.toThrow(/^\u0000$/)`, runs those files, and reads "but got '…'"; the follow-up pins each message with its src line (1344-N S8 form).
- Keep G6-new-1..3 (one comment line each under a 1344-N note that says live is 43 above a pin that now reads 44).

## G1 (done; 4ce8bed, 11 commits; patch b23f5754…; 13 files)
- N-0122 (p14b9-save-v42, F9 ruling 3, second assertion): option (a). Stage `sharedCompetitions: 1` on one edge of the pre-lift `v42` state and call `convertV42ToV41` on it, so the casting-competition guard (relationships.ts:847-849) stays covered on V42 input. A comment says the counter is staged because no pre-Save44 engine remains to write it, and names 1358-F9 ruling 3. No stripping. Follow-up unit writes it.
- bridge-p14b6-e714:82 local `Edge` type: no edit (no literal, no strict Pick; 1320 left it without sharedCompetitions). The plan's "every local Edge type" means types that build or compare edges.
- G1-new-1 (p14c2s-scientist-retirement:279-280): loose regex matches either guard; no edit, closure finding (as G4-new-1..4).
- N-0101..N-0103: production migrateToVnn chains; the dry run decides.
- p14b9-save-v42:220 now pins convertV44ToV43's log refusal for relationship-edge-24 (status read; agent read the acknowledged V41 capture by name, checksums matched the test's pins).

## G1 follow-up (a073a61) and the X6 input
- N-0122 option (a): p14b9-save-v42:186 pins `/^migrateToV41: cannot downgrade or discard a casting competition$/` (relationships.ts:849 via assertRelationshipsAtV31; caller 'migrateToV41' at save.ts:10696), on a spread copy of v42 with edge 0 `sharedCompetitions: 1`. Live-chain assertion now :223.
- X6 input: branch `sweep-x6` 8144c0c in the merge worktree = sweep-merge 3c7b83a + G1 follow-up; `S/1358-sweep/sweep-x6.patch` sha256 cbc8ee00…. The probe patch is relative to sweep-merge 3c7b83a and touches no p14b9 file.

## F2 (done; sweep-f2 37a1108; 7 files +122/-52; 41 classification rows)
- S9 pins at J7, X5, O3 x2, p14c2b-save-v36 :74 :82, p14c2s :279 :280, p14c2rm :254 (romance refusal, save.ts:10790); new own-era cover: Scientist guard on the genuine V37 week-670 capture (p14c2s :291), V36 extension guard on the genuine V37 writer pair converted to V36 (p14c2rm :278).
- S8 pins: N-0468 (18 cases, refusal column), N-0470, N-0472. H-new-1 and G5-new-7 measured, no pin.
- Finding: J7/X5/O3 were the only tests reaching the screenplayShelved receipt guard (save.ts:10739-10740) first; p14d1-rival-shelving-save-v43:251 is vacuous (conceptId 'x' refused at hollywoodValidation.ts:539 first; loose /shelv/i). Fix in G1's file (follow-up F3) once F2-RECEIPT43 confirms.
- Findings for closure: extensionUsed branch has no own-era cover (1344-K open item); N-0468 cases 1-3 and 18 fail at record/project checks before the rule their names describe (pinned as measured).
- F2's probe touches p14p4p5-opportunities (F1's file) and p14d1-rival-shelving-save-v43: combine with F1's probe carefully.

## F1 (done; sweep-f1 d20c170; probe sweep-f1-probe 979debe; 15 classification objects)
- S9 pins (romance refusal, save.ts:10790): Q07, Q11 FACT-ONLY-REFUSAL (edge-18), p14r3 :374, D12 :689, G5-new-5 :361, G4-new-1/2. S5 helpers: D14 (:407), Q04 (:374).
- Own-era cover (F10 ruling 4): V39 on the genuine week-110 Save40 capture downgraded once (end of Q11's factOnly); V41 on a V41 copy of that capture with one staged rival release (engine's release writes only); V27 by the engine's rival lab admission once on a genuine V26 fixture lifted to V27. Staging fits the F10 ruling 5 precedent (nothing stripped) if the dry run passes them.
- Rulings pending the probe: D13 :387 (frozen builders; candidate `lifecycleAttached().state` at week 248 if its chain passes, else pin the refusal on a.state and record the lost P3 Director cover of the frozen builders); D12 :693 (pin the refusal; no other route holds WAIVED authority). G5-new-6 (D14 :438) measured by the probe.
- Stale wording: four 1344 comments in other files say "genuine V39 capture, week 48 take"; the V39 cover is now the Save40 capture assertion. F2's comments name Q03 :331 and p13b-s3-save-v23:115-117; update after X7t.
- Findings: on a valid save the V41 movement arm (save.ts:10647) and the V27 finance arm cannot fire.
- Merge: sweep-x7 2ea399c = sweep-x6 + F1 + F2 (12 files +233/-61); sweep-x7.patch 81cba89c…; combined probe2 (9 files, 59 lines) in worktree probe2, branch sweep-probe2.
- X7t queued (targeted: type gates, slice B files, probe2 over 9 files, then 13 files clean; no UI) behind the snapshot probe.

## X7t (targeted, 06:27:50-06:42:06; sweep-x7 81cba89c + probe2)
- Type gates 0 errors; generators pass; slice B 154/3 (row 6 exceptions only).
- 13 targeted files clean run: 5 failed / 238 passed: C20 (retained), D07 and D18 (retained), D13 (:387 chain), D12 (:712-714 chain). Every other F1/F2 edit holds.
- Probe 2 (44 lines): V41 staging reaches "migrateToV40: cannot downgrade or discard a rival termination receipt"; V39 on the genuine Save40 week-110 capture and Q03 reach the V39 guard; V36 extension, V27 rival research and Scientist guards fire on own-era inputs; S5 at p14c3-save-v38:87, Q04 and D14 normalizedEqual and helperEqual (24 or 30 edges, 0 logs, 0 romance); RECEIPT43 real concept reaches the screenplayShelved receipt guard; D13: all nine states with the promise, lifecycleAttached week 248 included, hold 19-21 tracks; D12 change and done states hold tracks; G5-new-6 romance refusal; F1-V41 movement leaf stops in the validateSaveV37 chain (pre-existing; closure finding).
- Rulings 1358-F11: D13 and D12 frozen builders take the lawful V40 state of genuine 1221 captures (director-bound-week52, director-waived-week61), the live chain takes the S9 pin; G5-new-6 S9 pin; p14d1-rival-shelving-save-v43:251 real concept id and exact pin (F2).

## 1358-D9 (REFINE: R1-R4; N1-N5) and r3 (sweep-r3 0bc0a46, 7e7a065)
- R1 (record): classification rows for 99ced62 (G3 S5 draft: 8 call sites, 6 helpers), a309b54 (G6: 5 call sites, 5 helpers), d8be757 (N-0140 lift), 8559440 (comment) and the r3 edits; close the 14 deferred census rows.
- R2: p14c2rm-writer-continuation:312 pinned to N-0468 case 1's measured refusal (identical input; save.ts:10295).
- R3 ruling: H-new-1 (102 cases), G5-new-7 (32), G6-new-4 (15), G6-new-5 (24): measured, no pin. X6's 173 cases each reach their own field's guard and none a version check; the sweep restores, it does not add pins to multi-case bare toThrow leaves that were bare before Save44. The four finding-17 leaves keep the pins 1358-N planned.
- R4: the receipt cover (p14d1-rival-shelving-save-v43:247) writes the engine's values: retryWeek 130 + HOLLYWOOD_SHELVED_RETRY_WEEKS (156), commissionHoldUntilWeek 130 + HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS (143).
- N1 (V41 staging comment), N2 (Q03 :331 to :336 in seven comments; F11 ruling numbers at p14p3 :102, :476, :744, :750), N3 (V27 arms): done. N4 (duplicate-receipt leaf at p14d1-rival-shelving-save-v43:168-181): closure finding outside the sweep. N5: the landing handback carries one disposition table for the 27 no-edit census rows.
- X8 probe 4: D13 and D12 captures pass the lawful chain and all three builders refuse ("explicit Director promise predicate"); N-0140: 24 edges, 0 log rows, 15 tracks; equal false, equalNormalized true.
- 1358-F12: the week-93 control takes slice B's edge roots out of the candidate (log asserted empty, tracks set to null), as it takes Save43's shelving root out. F9 ruling 2 forbids stripping to make a chain pass or to hide the new law; this control isolates Save43's effect by design, and slice B's tracks stay measured by its own tests and M2's routes.
