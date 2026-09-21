# 629-T — behavioral RED for the breakPromisesOnCancel causal-coupling correction

Status: DONE (RED authored, executed once, controls green, typecheck exit 0).
Source: HEAD cb13a4579ab5b27dbf89d8e3b3d461828e8cb729, worktree /Users/zacheryspector/The-Movies-headless-program, tree clean apart from the one untracked file below. Git read-only; nothing staged, committed, stashed or checked out.

## Files

- Test (new, untracked): `/Users/zacheryspector/The-Movies-headless-program/tests/p14b4-cancel-causal-proof.test.ts` — 39890 bytes, sha256 c3fdbf56ad6563cc203c9185e7d15d997a27fec9a2eb0b84194cf874747670a6.
- Patch (`git diff --no-index /dev/null tests/...`): `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/629-T.patch` — 40699 bytes, sha256 104739c5bcc226daf945a322b9aef2115a253afb91ebd252e484fc1b53b3cbce.
- Logs (same scratchpad): `629-T-run1.log` (new file), `629-T-typecheck.log`, `629-T-p14b1-promises.log`, `629-T-p14b4-outcomes.log`.
- No change under src/, bridge/, ui/, tests/fixtures/** or any other test file. No version literal moved (PROMISE_RULES_VERSION 4, LIVE_SAVE_VERSION 30, PROJECTION_VERSION 47 untouched).

## Checks run (one process at a time)

| Command | Result |
| --- | --- |
| `node_modules/.bin/vitest run --project core tests/p14b4-cancel-causal-proof.test.ts` (run 1, the only run) | EXIT 1, Tests 7 failed / 9 passed (16), Duration 5.26s |
| `npm run typecheck` | EXIT 0 |
| `node_modules/.bin/vitest run --project core tests/p14b1-promises.test.ts` | EXIT 0, 15 passed (15), 10.39s |
| `node_modules/.bin/vitest run --project core tests/p14b4-cast-class-outcomes.test.ts` | EXIT 0, 23 passed (23), 15.43s |

Every one of the 7 failures stops at the same line: `untouched()` → `expect(after.promises).toEqual(before.promises)` (test :267, called from the case). Every RED premise line before it passed: the current service returned `IMPOSSIBLE` with exactly the non-target-specific bottleneck the case isolates. No case failed at a premise, a fixture or the validator.

## Fixtures (labeled)

- World: `p13aGeneratedStudio()` (seed `p13a-core-causal-01`), player studio `studio-aca408ec-player`. Roster: signContract director/writer/craft/four actors (promised person `t-act-11` = actors[0]; contract row `studio-aca408ec-player:contract:t-act-11:13:player-27`, 208 weeks), cash bootstrap 30,000,000 with a ledger row, grand-ballroom set on `facility-soundstage-07` built 8 weeks (the P14B.1 fixture recipe). Cached once, cloned per case.
- "Greenlit this week" shape: real `greenlight` at week 21 (remainingTicks 8, startTick 21, no first take).
- "At five" shape: greenlight at 21, 3 ticks, `setProductionSetupRecipe ballroom-reveal-lighting-01`, ticks to remainingTicks 5 (week 29).
- "Took" shape: at five + `assignShootingDirector` + `scheduleShootingTake` + one tick → the real 5→4 first take at week 30 on picture A (lead t-act-11). Cached once.
- `bind`: a labeled state variant that installs a REAL BOUND OPEN root; contractId read from the person's active `hollywood.employment` row; placeholder feasibility receipt (no owner reads it). Every installed state passes `makeSave` (validateSaveV30) before the seam runs (`lawful()`), including the DIRECTING_COUNT root and the stale-progress root.
- Schedule law transcribed from promises.ts :352-367 (`freshEventWeek(from,k) = from + 8k + 5`; running picture `from + max(1, remainingTicks-4) + (startTick >= from ? 1 : 0)`); `nMaxAfterCancel` counts fresh events before due. The greenlit-this-week picture expects its take at w+5, the same as a fresh greenlight, so in that shape the cancel does not move the physical bound. Only the at-five shape gives a differential (w+1 before, w+5 after).

## Per case

| # | Law sentence | Construction | Computed | Expected | Observed (run 1) |
| --- | --- | --- | --- | --- | --- |
| 1 | plan :249-251 "Joint failure of several promises is NOT proof…", :255-256 "never break-all or pick a beneficiary loser from a portfolio conflict" | t-act-11 LEAD on greenlit-this-week picture; two bound OPEN count-1 roots (P1 `629-1-p1`, tagged lead P2 `629-1-p2`), window [21,29) | nMax 1, X 1 ≤ 1, reserved 1 → 2 > 1. Premise: both reclassify IMPOSSIBLE `promises already made to this person exhaust the window` (passed) | neither BROKEN at the cancel; both BROKEN at 29 with the due cause, own receipts | RED: `629-1-p1` BROKEN at 21 with the cancel cause (`talent-market-event-0`), `629-1-p2` untouched — the array-order loser the plan forbids |
| 1b | plan :251-252 "either lead claimant could still be kept when one film remains" | A lead, B antagonist on the same picture, each a count-1 tagged lead P2, window [21,29) | nMax 1 | neither BROKEN; due-week breaks both at 29 | GREEN (control): the current evaluator never reserves across beneficiaries; the correction must not add a cross-beneficiary portfolio rule |
| 2a | 26 §2 "Do not route a bound legacy P2 through fresh-offer refusal to decide its outcome"; plan :257 legacy generic-cast compatibility | legacy count-only P2 `629-2a`, person SUPPORT, window [21,41) | nMax 2. Premise: IMPOSSIBLE `a seat-class promise needs its seat class selected…` (passed) | untouched | RED: BROKEN at 21 with the cancel cause |
| 2b | plan :252-254 target-specific physical impossibility applies to legacy roots | same, window [21,23) | nMax 0 | BROKEN at 21, cancel cause, one receipt | GREEN |
| 3 | 26 §2 "unsupported legacy family … is not target-specific physical impossibility"; plan :252-254 "independent of … analysis limits" | DIRECTING_COUNT count-1 `629-3`, person LEAD, window [21,41); validator accepted the root (boundary finding: promises.ts :969-970 admits every catalogue family with a count-only predicate) | nMax 2. Premise: IMPOSSIBLE `a directing promise is not offered in this slice` (passed) | untouched | RED: BROKEN at 21 with the cancel cause |
| 4 (×2) | 26 §2 "check whether the cancelled picture could satisfy this class"; plan :246 relevant seams; :254-255 due-week owner decides | tagged lead / leadOrAntagonist P2, person SUPPORT, window [21,23) | nMax 0. Premise: IMPOSSIBLE `no filming week inside the window can reach that many pictures` (passed) | untouched at the cancel; BROKEN at 23 with the due cause | RED (both): BROKEN at 21 with the cancel cause |
| 4c | same, in-class seat | leadOrAntagonist, person ANTAGONIST, [21,23) | nMax 0 | BROKEN at 21, cancel cause | GREEN |
| 5 | plan :331-334 "remaining X is count minus ACTUAL class-qualified distinct first takes … never blindly use the original total" | took: real take on A at 30 (lead), count-2 tagged lead P2 `629-5` window [21,38), `advancePromisesWeek` writes progress 1; cancel A (immune, untouched — asserted); greenlight B at 30 (lead, concept index 1); cancel B | nMax 1 before and after (B greenlit this week → w+5), original 2 > 1, remaining 1 ≤ 1. Premise: IMPOSSIBLE with the physical bound (passed, pre-cancel) | untouched | RED: BROKEN at 30 with the cancel cause |
| 5 stale | plan :333 "never … trust a stale progress counter" | same, progress left at 0 with the real take present (`qualifyingTakes` length 1 asserted) | as above | untouched | RED: BROKEN at 30 |
| 6 (×2) | plan :252-254 | tagged lead P2 / P1, person LEAD, [21,23) | nMax 0 | BROKEN at 21, cancel cause, receipts length +1 with the prior log byte-identical, own receipt with reason `a promise to this person was broken by a cancelled picture`, idempotent under two owner passes and one tick | GREEN |
| 6c | plan :252-254 (the studio action is the cause) | at-five picture, person LEAD, window [29,32) | before: w+1 < 32 (reclassify not IMPOSSIBLE, asserted); after: fresh w+5 ≥ 32, nMax 0 (post-cancel reclassify IMPOSSIBLE with the physical bound, asserted) | BROKEN at 29 | GREEN |
| 7a | plan :244 "First-take-then-cancel never un-satisfies" (re-pin of outcomes :488) | took; count-1 tagged lead P2 window [21,38); `advancePromisesWeek` SATISFIES at 30 with evidence [take]; cancel A | — | root, take and receipts unchanged; idempotent | GREEN |
| 7b | plan :256 "Preserve early termination attribution" | actors[3] (seated nowhere), P1 count-1, real `releaseTalent` | — | BROKEN at 21, termination cause, own receipt | GREEN |
| 7c (paper, no test) | 26 §2 "Retain … early termination owner"; rivals | `applyCancel` (actions.ts :567-600) reads `state.studio.activeProductions` only and passes `hollywood.playerStudioId` (:599); rival pictures live under `hollywood.businesses[].productions`; `breakPromisesOnCancel` has one caller (:599), `breakPromisesOnTermination` one caller (`applyReleaseTalent` :2637) | — | — | source fact |
| 8 | control | greenlit picture; bound OPEN P1 to actors[3] who is not in the cast | — | promises and receipts `toEqual` | GREEN |

Summary: RED = 1, 2a, 3, 4 (×2), 5, 5-stale (7 tests). GREEN = 1b, 2b, 4c, 6 (×2), 6c, 7a, 7b, 8 (9 tests). The brief expected RED on cases 1-5 and GREEN on 6-8; the one deviation is sub-case 1b, which is a green control by construction (see the row).

## Findings for the reviewer / 629-A

1. Current behavior in case 1 is the exact forbidden shape: `breakPromisesOnCancel` loops in array order, breaks the first root on the JOINT bottleneck, and the second root then survives because the first no longer reserves (`activePromiseReservations` drops outcome != null). The loser is chosen by promiseId order.
2. Relevance reading used by cases 2b, 4c, 6 (×2): "relevant" = the person held an in-mask seat on the cancelled pre-first-take picture. In the greenlit-this-week shape with due = w+2 the picture could not itself have reached a take before the due week (expected w+5), so a stricter reading ("the cancelled picture must have been able to serve inside the window") would make 2b/4c/6a/6b NOT broken at the cancel and would also move the existing pin tests/p14b1-promises :780-838 (same shape). The brief instructs that pin to stay BROKEN; the tests follow the brief. Case 6c is the shape that holds under both readings (the running picture expected w+1 < due, nothing else reaches w+3). If 629-A adopts the stricter reading, 2b/4c/6a/6b and the p14b1 pin need a due-week follow-through instead — that is a product decision to escalate, not a test edit I made.
3. Case 3 boundary: validateSaveV30 accepts a DIRECTING_COUNT count-only root bound to an actor; `promiseCastSlots` reads it with generic-cast semantics, so under this source the seam is "relevant" for the seated person. The expectation (untouched) holds regardless because the window leaves two reachable events. A directing predicate that is not cast-based is not modeled anywhere in this source.
4. Case 5 does not include the negative ("the take on A was in a non-qualifying seat → remaining 2 > 1 → BROKEN"); a proof that counted class-blind takes would still pass case 5. Adding it costs another took() build with the person in support on A. Optional follow-up if 629-A wants the class-qualified part discriminating.
5. Cause strings are pinned as constants at the top of the file (`CANCEL_CAUSE`, `DUE_CAUSE`, `TERMINATION_CAUSE`) and are design-owned: a rename is a one-line change in the test.

## Evidence limits

- Single execution of the new file; no watch, no full suite, no other test files. Controls: the two named files only.
- All results are TS core (vitest, node v20.20.2, vitest 2.1.9). No Unity/native, no browser, no fixture under tests/fixtures touched.
- Premises marked UNEXECUTED in the file are throw-paths for fixture prerequisites (no signable role in 60 weeks, no workflow, shooting entry not reached in 40 ticks, no active employment row); none fired.
- The "physical bound" in the tests is the source's own `expectedFirstTakeWeek` schedule law transcribed; the plan's owner-adapter enumerator (plan :286-300) does not exist in this source, so no other bound was available to compute from.
