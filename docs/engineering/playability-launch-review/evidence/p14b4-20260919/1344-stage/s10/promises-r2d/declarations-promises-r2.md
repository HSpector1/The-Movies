# 1344-C5 r2, work unit r2d: S10 pre-declarations for rows 8-11 (rival promise-148), revision 2

Test-author, read-only. Nothing here was executed: no vitest, tsc, node, tsx or script ran. I read the records, the merge
tree, the repository and the fixture bytes (`gzcat | tr ',' '\n' | grep`). Row numbers continue
`1344-stage/s10/declarations-r2.md`, and the form follows it: parts a-f per row, a probe per the r2 path rules, and a
runbook.

Revision 2 applies 1344-D7 (ACCEPT WITH CHANGES): change A1, a recorded and never-gating re-witness search, and the
row 11 part f correction. Every gate and prediction of the reviewed revision stands, and A1 adds one prediction
(`rewitness_is_NONE`). The block's other edits move the leaf-line evaluation ahead of the predictions and route N10's
spy through one helper, with the same expressions. The reviewed revision stays
intact in `declarations-promises.md`, `probes/` and `RUNBOOK.md`. This file, `probes-r2/` and `RUNBOOK-r2.md` replace
them; run only `RUNBOOK-r2.md`.

Sources:
- the repository at f1b3432a, whose `src` tree (db80ca31) equals the merge tree's;
- the merge tree `/Users/zacheryspector/studio-scratch/1344-merge/tree`. x2 ran at a318722. Its HEAD is 6935ea5 (r2a-r2c
  merged), and no commit since a318722 touches `src`, the two test files or the helpers on the chain (checked again at
  17:59 on 2026-10-01);
- the recorded runs: x2 (`1344-merge/x2-core.txt`, sha256 3db3953d…; committed as `1344-X8-core-extract.txt`, rows 8-11
  at :863-945), 1344-I (`1344-save43-broad-core.txt`, source c614b7e9) and 1338 (`1338-t1-broad-core.txt`, source
  ff803032). `1344-merge/x2-vs1338.json` lists the four rows as NEW with `basePrimary` null (:855-897);
- the genuine fixture `tests/fixtures/p14/genuine-v35-c2b-corpus/genuine-v35-c2b-rival-incumbent-cohorts.json.gz`
  (sha256 afb89ad0…, week 2600, seed `p14c2b-corpus-01-c1`, 2600 natural ticks at the V35 writer 68783a8a);
- 1344-D7 (unit A) and 1344-F5 Part A, the re-witness procedure.

## Rulings applied

- F4 rulings 1 and 4, as the brief applies them: a row that passed at 1338 is S10 proper if the attribution holds. All
  four rows passed at 1338 (`1338-t1-broad-core.txt:3720` and `:2962`). The probe decides between a re-pin and a premise
  conflict on the leaves' own terms, and nothing widens (F4 ruling 4).
- 1344-N S10: one assertion per row may move. This record declares the receipt facts a lawful movement must show, and
  the reviewer checks them before anyone runs the probe.
- 1344-F3 ruling 5: the promise guard counts only r01's named screenplay.
- 1344-D5 and 1344-D6: a C1 anchor in each tree, the old run reading the head dump, a C3 state comparison with
  `screenplayShelving` deleted, output only under one `out/`, NEW-named copies deleted after each run, and the old tree
  from a script.
- 1344-D7: attribution, predicates and probe accepted as written; premise conflict is the right reading. Change A1 adds
  the re-witness search (rows 8-10 part f). The row 11 part f slip is corrected.
- 1344-F5 Part A governs row 6. D7 leaves extending it to these rows to the parent. The A1 search follows its form: a
  declared deterministic rule over the current chain's receipts, r01 first and then another rival of the same fixture,
  the same horizon, the same fixture, and NONE leading to A3.

## Changes from 1344-D7

| D7 item | Change | Where |
|---|---|---|
| A1: record a re-witness search, never gating | The head run detects, tick by tick, every promise a rival business issued that a tick into 2601-2696 settled VOIDED, reads the reviewer's conditions on the state before that tick, orders the list by the rule and writes it with the witness or NONE | `probes-r2/` block: `s10PassCalls`, `s10VoidsThisTick`, `s10RuleOrder`, the chain's `voids` and `voidErrors`, `rewitness`; `out/promises.rewitness.json`; rows 8-10 part f |
| A1: never gating | Outside `gates` and `expect`; a throw in the search is recorded under `errors` and the witness reads ERROR | the same |
| A1: cover promises created and bound during the chain | The detector reads every promise in each tick's resulting state, not a list fixed at 2600. A scan of the 2696 state cross-checks the set (`scanMatchesTicks`) | the same |
| A1: include the 2696 state `s10RivalLines` ticks | `s10RivalLines` returns the 2695 base and the 2696 state; the detector runs on that tick too | the same |
| A1: each candidate with its issuer's productions at Wc − 1 | `issuerProductionsAtWcMinus1` on every candidate | the same |
| A1: Step 4 reports NONE or the first entry | The `rewitness` log line carries the witness and the first candidate in rule order; RUNBOOK-r2 step 4 reports them | `RUNBOOK-r2.md` |
| Row 11 f: the :148 call needs any open bound promise to PERSON, from any issuer | Text corrected; the probe records `openBoundForPerson` (any issuer, bound) in place of `openForPerson` | row 11 part f; block `outcome.openBoundForPerson` |

## Corrections to the brief

1. Rows 8-10 were never masked. 1344-I recorded the same three failures at `:25:42` with the identical diff
   (`1344-save43-broad-core.txt:4352`, `:428873-428945`). `beforeRivalCutoff` fails at :25, before the helper's
   `savedState` runs at :28, so no `validateSaveV42` ran on this path. The g1 deferral
   (`1344-sweep/g1/deferred.json:17-21`) named that helper; the recorded frame contradicts it. The three rows were NEW
   against 1338 at 1344-I and are still NEW at x2.
2. Row 11 was masked, by a literal rather than a validator. At 1344-I, N10 passed :233-240 and failed inside
   `assertOutcomeDispatch` at :139, in `admitted` (:22), at `envelope38`'s `toBe(42)` against 43
   (`tests/helpers/p14c3-fixtures.ts:131`, an S2 literal; `1344-save43-broad-core.txt:432694-432711`). Had :22 passed,
   :23's `validateSaveV42` would have refused next. The sweep's S2 edit (merged `p14c3-fixtures.ts:134`) and S1 edit
   (`p14c3-admission-boundaries.test.ts:23`) let x2 reach :141.
3. 1344-I (src 7cd594d4) and x2 (src db80ca31) received the same values at :25. The two trees differ only by
   `corporateCondition.ts`, `studioLoan.ts`, `campaignLegacy.ts` and new `tuning.ts` keys
   (`git diff --stat c614b7e9 HEAD -- src`).

## Line references

- Lines are the merge tree's at a318722. Every cited file is unchanged at 6935ea5.
- The sweep did not edit `tests/p14c2c-rival-promises.test.ts`. It changed `tests/p14c3-admission-boundaries.test.ts` at
  :23 only, in place. Every cited line number of both files therefore equals the repository's. In the repository,
  `git log ff803032..HEAD` on both files and on the helpers below is empty: 1338, 1344-I and x2 ran the same test bytes
  apart from the sweep's edits.
- The sweep's helper edits on this chain do not run before the moved assertions or feed them a value:
  `p14c2c-fixtures.ts:8`, `:29` (`savedState`, reached at :28, after :25); `p14c2b-fixtures.ts:23`, `:69`
  (`liveEnvelopeV36`, never called here); `p14b2-fixtures.ts:7`, `:122`, `:244`, `:259`; `p14c3-fixtures.ts:58-64`,
  `:134` (reached at :139, before :141, as validation only).

## Common attribution base (re-verified for these rows; D7 §1 holds)

- `git diff --stat ff803032 HEAD -- src bridge generated` lists 18 `src/core` files from eleven commits. `bridge` and
  `generated` have the same tree hashes at both commits (9da338c4, 8b0ab810).
  - Shelving steps 1-5: b6fcf948, ecd63b05, 83e7e76d, 1993fc4d, a988108b.
  - P15 pure laws: 874247eb (`sharedMarket.ts`), cea3c853 (`powerRanking.ts`), 3b2dc509 (`corporateCondition.ts`,
    `studioLoan.ts`), 321a4378 (`campaignLegacy.ts`), each with new `tuning.ts` keys, and two comment-only `tuning.ts`
    commits (3b6cd98c, 1c1639dd).
- No tick path reaches the five P15 modules. In the merge tree,
  `grep -rn --include='*.ts' --include='*.tsx' -E "(from|import\() *['\"][^'\"]*/(sharedMarket|powerRanking|corporateCondition|studioLoan|campaignLegacy)(\.js)?['\"]" src bridge ui/src`
  prints three lines, all inside the modules; otherwise only comments in `tuning.ts` (:41, :1005, :1018-1019, :1036)
  name them:
  - `campaignLegacy.ts:68` imports a type from `powerRanking.ts`;
  - `studioLoan.ts:24` imports a type from `corporateCondition.ts`;
  - `corporateCondition.ts:41` imports `loanEligible` from `studioLoan.ts`.
  - `index.ts`, `tick.ts`, `hollywoodTick.ts`, `promises.ts`, `talentMarket.ts`, `save.ts` and
    `src/harness/p13a/fixtures.ts` name none of them.
- `tuning.ts` only gains keys: its diff removes no line. The only code that enumerates `TUNING` is
  `src/harness/d16/experiment.ts:300`, off the tick path.
- With nothing shelved, the shelving readers are the identity, because `shelvedScriptIds` (`hollywoodTypes.ts:142-145`)
  is empty while every unproduced screenplay is active:
  - `promises.ts:280-284`, `:405`, `:414`, `:444-445`;
  - `opportunityPromises.ts:140-144`;
  - `rivalPromiseProjectCandidates` (`talentMarket.ts:1444-1449`, used at :1474);
  - chart output (`hollywoodTick.ts:460`) counts produced screenplays, the same number as before;
  - `productionIdentity.ts:111-112` adds a no-op case.
- `decide()` with nothing shelved:
  - `chooseIndustryPackage` (`hollywoodTick.ts:233`) returns `searchIndustryPackages(...).choice`
    (`hollywoodPolicy.ts:83-85`), the same choice as before;
  - :236 re-searches a refusal only for its counts, a pure call;
  - :265 and :272-275 write only `screenplayShelving`.
  - Decisions change only at the shelving (:276-281), the retry (:286-299, which needs a shelved entry) and the hold
    (:302, which needs a shelving to set it).
- Save43: `migrateToLive` (`save.ts:10138-10140`) now ends in `convertV42ToV43` (:10678-10685). It validates, round-trips
  the save through JSON and adds the empty shelving state to every business. The validators throw or pass.
- One validation feeds a decision. Every tick calls `prepareLiveWritingContext` (`tick.ts:195`,
  `liveRetirementWriting.ts:19-27`), which now proves the live state at the Save43 era (`save.ts:10456-10462`) and turns
  a failed proof into `rejected` (`liveRetirementWriting.ts:21-25`). A valid live state proves in both trees. P3
  measures the rest: any move this path caused before the first shelving breaks the state equality.

## Fixture facts (read from the bytes, not run)

- r01 is `studio-25969b11-r01`, one of nine rival businesses (r01-r09). At week 2600:
  - `activeScriptOrdinals` is [229, 230]. `script-0229` (commissioned 2077) and `script-0230` (commissioned 2089,
    horror, writer `t-wri-08`) are `ready` with `productionId` null. `script-0000` to `script-0228` are produced; the
    last was commissioned at 2068.
  - `productions` and `operations.workflows` are empty.
  - Its account period 2548-2599 moves only payroll (−1,878,968), overhead (−1,248,000) and facility opex (−1,846,000),
    with no production, marketing or revenue, and closes at 704,478,942. That is about 96,000 a week, so the 13-week
    reserve (`policy.reserveWeeks` 13) is about 1.24 million.
  - `nextDecisionWeek` is 2600.
  - It holds contracts starting 2496 with `t-wri-08` (writer, age 73), `person-cohort-156-director-0` (director, 73),
    `person-cohort-208-actor-1` (PERSON, actor, 70), `person-cohort-416-actor-0` (actor, 62),
    `person-cohort-416-actor-1` (actor, 65) and `person-cohort-676-craft-0` (craft, 58).
- Promises: 152 records, 150 `APPEARANCE_COUNT` and 2 `LEAD_OR_SIGNIFICANT_ROLE_COUNT`. The file holds no
  `projectOpportunity` or `genreOpportunity` predicate.
  - r01's window [2496, 2704): promise-146 to promise-151, all open, progress 0, predicate `{count: 1}`. promise-148
    (PERSON), promise-149 and promise-150 belong to the three actors and are bound to their 2496 contracts.
  - r01's window [2288, 2496): promise-140 to promise-145, all BROKEN. PERSON's only promises are promise-132
    (SATISFIED, [2080, 2288)), promise-142 (BROKEN) and promise-148.
- So r01 shows the 1344-A §1 stall: two ready screenplays, a full team, cash far above its reserve, no commission since
  2089 and no kept promise in [2288, 2496).

---

## Rows 8-10. `p14c2c-rival-promises.test.ts:25`, leaves R1, R2, R3. Status: DECLARED r2, S10 proper

a. Assertion :25, `expect(promiseById(at2695, PROMISE)).toMatchObject({ outcome: null, progress: 0 })`, inside
   `beforeRivalCutoff()` (:17-31).
   - One assertion serves three leaves: R1 (:34, call :35), R2 (:49, call :50) and R3 (:60, call :61). It throws before
     `cached` is set (:28), so each leaf rebuilds the chain and fails at :25 (`x2-core.txt:193665-193738`;
     `1344-X8-core-extract.txt:863-913`).
   - The values that may move are `outcome` (null in 1338, `SATISFIED` in x2) and `progress` (0 in 1338, 1 in x2), two
     fields of one premise.
   - :20-22, :24, :26-27 and every leaf body stay.
b. Chain:
   - :19 `c2bLiveFixture('genuine-v35-c2b-rival-incumbent-cohorts')` (`helpers/p14c2b-fixtures.ts:61-63`): the genuine V35
     bytes, sha256-checked at week 2600 (:35, :42-51), migrated live.
   - :20-22: promise-148 is open with progress 0. Beneficiary PERSON is `person-cohort-208-actor-1` (:13), issuer ISSUER is
     `studio-25969b11-r01` (:14), the window is [2496, 2704) and the contract is
     `studio-25969b11-r01:contract:person-cohort-208-actor-1:2496`.
   - :23 `advanceTo(migrated, 2695)`: 95 ticks (`src/harness/p13a/fixtures.ts:13-17`, the same `tick` that
     `helpers/p14c2c-fixtures.ts:16` re-exports).
   - :24: PERSON's retirement was announced at 2566 and takes effect at 2704. :25 is the moved assertion. :27: r01 has no
     production.
   - After :28 the leaves need the promise still open at 2695. R1 and R3 tick once and expect VOIDED at 2696 (:40-41, :65).
     R2 builds a predicate variant, which only an open promise may receive (:50, `helpers/p14c2c-fixtures.ts:113-114`).
c. Attribution: Y, predicted from source and the fixture bytes. The probe decides (part d). D7 §1 found it sound.
   - Predicted head chain (not run):
     1. At 2600 `convertV42ToV43` starts every count at zero (`save.ts:10678-10685`).
     2. r01 decides every week from 2600: `nextDecisionWeek` is 2600 and `HOLLYWOOD_DECISION_WEEKS` is 1 (`tuning.ts:29`;
        `hollywoodTick.ts:203-204`; `staff()` at :362, then `decide()` at :369).
     3. Each decision evaluates `script-0229`, then `script-0230` (:259). With about 703 million available after the
        reserve, the cash gate skips no candidate (`hollywoodPolicy.ts:62`). Every refusal is therefore an economic
        rejection (:236), and the screenplay's count rises by one (:268, :272-275).
     4. The 13th decision, processed week 2612, shelves both screenplays in the same loop (:276-281): two
        `screenplayShelved` receipts with `rejections: 13`, an empty active index, `retryWeek` 2638 for both, and a
        commission hold until 2625.
     5. From 2613 to 2624, r01 has nothing ready to evaluate, no retry is due (:286-287), and the hold returns (:302).
     6. From 2625 the freed slots admit a commission (:300-335). The new screenplay drafts for 1-6 weeks
        (`tuning.ts:981-984`; `hollywoodTick.ts:433-437`), then the ready loop evaluates it. A retry of `script-0229` is
        due from 2638 while a slot is free (:286-299).
     7. A viable package greenlights (:265, :239-257). Promised actors are seated first (:219-224;
        `promises.ts:842-860`), and PERSON is one of r01's three promised actors.
     8. The take lands on the produced week, greenlight plus 5 (`promises.ts:69`, `:896`; `tick.ts:1134-1143`). The
        promise pass (`tick.ts:1160`) then settles promise-148 SATISFIED (`promises.ts:1029-1046`).
     9. The picture releases after eight ticks (`tuning.ts:76`) and leaves `productions` (`hollywoodTick.ts:379-382`)
        before 2695. In x2, N10's :240 passed, so r01 had no production at 2695.
   - Old chain (1338): `hollywoodTick.ts:254` at ff803032, the commission gate, returns while two screenplays are active,
     and the two never pass the viability gate. No take arrives, promise-148 is open with progress 0 at 2695, and one
     more tick voids it at 2696 (R1 passed at 1338).
   - The promise guard (:269-272) defers a shelving only while an open r01 `projectOpportunity` promise names that
     screenplay. promise-148 is `APPEARANCE_COUNT` `{count: 1}`, so the guard ignores it (1344-F3 ruling 5). The
     fixture holds no opportunity promise. A promise that r01 authors between 2600 and the shelving could name
     `script-0229` or `script-0230`, because `rivalPromiseProjectCandidates` is the identity before any shelving. The
     probe records the guard each week, and P2 accepts a count held at 13.
   - The candidate filter (`talentMarket.ts:1444-1449`) acts only after a shelving: it keeps a shelved screenplay out of
     r01's later SPECIFIC_PROJECT promises. It cannot touch promise-148, a bound count promise. Its effect after the
     shelving is explanatory: the probe lists every promise r01 authors on the chain.
   - The other changes since ff803032 are ruled out by the common base and measured by P3.
d. Gates. Unchanged from the reviewed revision. The probe writes them to `out/promises.predicates.json`.
   - C1 head (`C1_head_anchor`): the head chain reproduces x2.
     - At 2600 the premise of :20-22 and :233-236 holds.
     - At post-tick 2695: `market.tick` is 2695 (:238), PERSON's retirement record reads 2566, 2704, announced (:24, :239),
       promise-148 reads `outcome: 'SATISFIED'` and `progress: 1` (the values x2 received at :25 and :141), and r01 has no
       production (:240 passed in x2).
   - C1 old (`C1_old_anchor`): the old chain reproduces 1338, where both files passed.
     - The same premise, tick and retirement record hold. promise-148 is open with progress 0 (:25, :141), and r01 has no
       production (:27).
     - R1's :37 holds (PERSON's terminal outcomes are `['SATISFIED', 'BROKEN']`), and so does :40-41 (after one tick,
       VOIDED at 2696, due 2704, progress 0).
     - N10's :142-152 hold: the contract is bound, the due week follows the tick, `advancePromisesWeek` calls
       `assignmentRefusal(PERSON, 2695, 'actor')` at least once, and nothing changes.
   - P1 (d1, `P1_d1_r01_shelving_before_take`): the head chain carries an r01 `screenplayShelved` receipt at processed
     week Ws_r01, and Ws_r01 is earlier than Wt, the post-tick week of the take that satisfied promise-148 (the take its
     `evidenceRefs` names).
   - P2 (d2, `P2_d2_thirteen_rejections`): every r01 shelving receipt carries `rejections: 13`, and r01's count for that
     ordinal read 12 in the state entering the receipt's week. A count of 13 there also passes: a count sits at 13 only
     while the guard holds it (:269-275). The probe reports that case as `heldByGuard`, with its guard record and the
     week-by-week climb.
   - P3 (C2 and C3, `P3_C2_C3_first_divergence_at_Ws_plus_1`):
     - Ws is the earliest `screenplayShelved` receipt of any studio on the head chain.
     - Both runs hash every state from 2600 to 2695: sha256 of `stableStringify` per top-level key, with
       `screenplayShelving` deleted from every business (1344-F3 ruling 4; 1344-X6). `stableStringify` is the same
       function at ff803032 (`save.ts:673`) and HEAD (:679).
     - The gate holds when every state up to and including the one entering Ws is equal in both trees, and the first
       different state is post-tick Ws + 1, the one the shelving week produced. `detail.firstDiffKeys` names the
       top-level keys that differ there.
     - This gate is C3 (nothing moved before the first shelving) and C2 (the shelving moved the chain first) in one test.
   - P4 (d3, `P4_d3_take_via_commission_or_retry`):
     - The take that satisfied promise-148 is r01's, falls in [2496, 2704), and has PERSON in a cast slot.
     - promise-148's `outcomeWeek` is that take's week, and its `evidenceRefs` names that one take.
     - Its `outcomeEventId` names a `promiseOutcome` market receipt at that week, for PERSON and r01, with the reason
       `a promise to this person was kept` (`promises.ts:1029-1046`).
     - The take's production was announced (`filmAnnounced`) at a week Wg later than Ws_r01, and its screenplay reached
       the slot through one of the two lawful shelving paths:
       - a commission after the hold (:300-335): the screenplay's ordinal is at least r01's screenplay count entering
         Ws_r01, and its `commissionedWeek` is at or after the `commissionHoldUntilWeek` the shelving set;
       - a due retry (:286-295): the screenplay is one r01 shelved at Ws_r01, and Wg is at or after its `retryWeek`.
     - Any other path reads `other` and fails the gate.
   - P5 (d4, `P5_d4_stall_without_shelving`): r01 starts stalled, with two active `ready` screenplays and no production.
     On the head chain it stays stalled in every week before Ws_r01: the same active index, the same screenplay count, no
     production and no `filmAnnounced`. On the old chain it stays stalled through 2695 and promise-148 stays open. This
     measures the counterfactual behind the 1338 value.
   - Explanatory, never gating: r01's timeline (counts by week, shelvings, hold, commissions, announcements, takes,
     releases), other studios' shelvings before Wt, the guard record, and every promise r01 authored on the chain.
   - Predictions, never gating (from part c): Ws_r01 is 2612, with `script-0229` and `script-0230` shelved together; Ws is
     2612; the hold runs until 2625; both retry weeks are 2638; the take came through a commission; the re-witness
     search finds NONE; the first different state is post-tick 2613 and differs only in `hollywood`. Ws cannot precede
     2612: every count starts at zero at 2600, a studio decides at most once a week, and a shelving needs 13 counted
     decisions (`tuning.ts:33`).
e. Probe: `probes-r2/s10-promises-chain.block.ts.txt`, RUNBOOK-r2 steps 1-3 (head, old-tree build, old). One run of the
   probe covers rows 8-11 and the re-witness search.
f. Re-pin or premise conflict, decided on the leaves' own terms (the row 6 form, R6b). The outcome is recorded, never
   asserted.
   - The probe re-derives :25 from the receipts P4 verifies, then evaluates each leaf's next lines on the head state:
     - R1: :27, :28 (`savedState`), :37 (the terminal outcomes), :40-41 (after one tick);
     - R2: :27, :28, then the helper's open-only check (`helpers/p14c2c-fixtures.ts:114`, reached from :50);
     - R3: :27, :28, :65.
   - Expected outcome: `PREMISE_CONFLICT` for all three leaves. Once C1 head holds, promise-148 is SATISFIED at 2695, and
     an outcome never changes (`promises.ts:1016-1017`, `:1028`). R1 then fails at :37 (a third terminal outcome) before
     it reaches :40. R2 fails at the helper's :114. R3 fails at :65.
   - The leaves need a genuine rival promise still open at the retirement cutoff (2696). Under shelving, this fixture no
     longer has one.
   - `PREMISE_CONFLICT`: the three leaves return to the parent, and nothing widens. A different witness is a test-design
     change with its own review (F4 ruling 4; F5 A2).
   - `REPIN`, unreachable once C1 head holds: the author would write :25's `outcome` and `progress` and nothing else,
     derived from the receipts P4 verifies and never copied from the x2 diff. `outcome` comes from the `promiseOutcome`
     receipt P4 names: its reason is the SATISFIED branch (`promises.ts:1033-1046`). `progress` is the number of
     distinct qualifying takes in `evidenceRefs` (`promises.ts:1029-1032`). A comment would name Ws_r01, the take's
     event id and its week. The probe writes these as `outcome.repinValues`.
   - Re-witness search (1344-D7 A1; the form of 1344-F5 Part A). Recorded, never gating; it pins nothing.
     - Candidates: every promise that a rival business of this fixture issued and that a tick into week Wc, with
       2601 ≤ Wc ≤ 2696, settled VOIDED. VOIDED has one writer, the retirement branch of the weekly pass
       (`promises.ts:1049-1057`), so Wc is the promise's `outcomeWeek`. The ticks are the chain's 95 (into 2601-2695)
       and the tick from the 2695 base to 2696 that R1 (:39) and R3 (:64) make, which the probe already runs. The
       detector reads every promise in each tick's resulting state, so a promise authored and bound during the chain
       counts as well as r01's from 2600. A scan of the 2696 state's promises cross-checks the set
       (`scanMatchesTicks`).
     - Checks, each read on the post-tick Wc − 1 state, the state the voiding tick starts from:
       1. `boundOpenProgress0AtWcMinus1`: open, bound (`contractId` set) and at progress 0 (R1 :25; N10 :141-142).
       2. `wcIsEffectiveWeekMinus8`: the beneficiary's retirement record (current profession, as :24 reads it) is
          announced, and Wc = effectiveWeek − 8, the first week `assignmentRefusal` refuses a seat
          (`careerLifecycle.ts:117`; `tuning.ts:76`; R1 :24, :40-41). PERSON: 2704 − 8 = 2696.
       3. `wcAtMost2696`: the leaves reach 2696 and no further (:23, :39).
       4. `issuerHasNoProductionAtWcMinus1`: R1 :27 (N10 :240). Each candidate also lists the issuer's productions.
       5. `passCallsActorAtWcMinus1`: one promise pass on that state calls `assignmentRefusal(beneficiary, Wc − 1, …)`
          at least once, and every such call requests `'actor'` (N10 :144-148, :152).
     - Order: issuer r01 first, then the other rival businesses (F5 A1 admits another rival only when no r01 witness
       exists); within each, Wc, then the promise number of `promise-N` (minting order).
     - Witness: the first candidate whose five checks all hold, or NONE. The head run writes `out/promises.rewitness.json`
       (the rule, every candidate with its checks, the scan cross-check, the witness) and repeats it as
       `outcome.rewitness` in `promises.head.json` and `promises.predicates.json`. Its log line
       `S10-promises head rewitness` carries the witness, the candidate count and the first candidate in rule order.
     - Never gating: the search sits outside `gates` and `expect`. A throw inside it is caught and recorded under
       `errors`, and the witness then reads ERROR, never NONE, because the first qualifying candidate is undecided.
     - Expected: NONE, read from the fixture bytes and source (D7 §4 reached the same):
       - At 2600 the only open bound rival promises are promise-146 to promise-150, all r01's. Every other open promise
         has a null `contractId`, and the weekly pass never evaluates it (`promises.ts:820-825`, `:1028`).
       - promise-148 settles SATISFIED under shelving (C1 head), so no tick voids it.
       - promise-146 and promise-147 go to the writer and the director, both 73 at 2600, with a hard edge of 75
         (`tuning.ts:431-432`). A person announces only at a birthday (`careerLifecycle.ts:197`, `:210`). Both hold r01
         contracts, and a contract active in the last 104 weeks rules out idleness (`:150-156`), so only the hard edge
         applies. Neither turns 75 before 2653. Their effective week is then at least 2705 (`:222`), and Wc at least 2697.
       - promise-149 and promise-150 go to employed actors aged 62 and 65, below the actors' hard edge of 70. Neither
         trigger applies.
       - A promise authored and bound on the chain would need a beneficiary whose retirement takes effect by 2704. The
         search finds any such case.
     - What follows, if the parent extends F5 Part A to these rows (D7 §4):
       - NONE: no lawful witness exists in this fixture inside the leaves' horizon. The four leaves stay failing with this
         record's attribution, as a declared exception (F5 A3).
       - A witness: it would replace PERSON, PROMISE, the contract, the announcement week 2566 and R1's terminal list,
         so it needs its own declaration and review before anything is pinned (D7 §4; F5 A2).
   - Refutation: with both C1 anchors true, a false P1, P2, P3, P4 or P5 means the attribution is not established, and
     the three rows return to the parent as unattributed movements. A false C1 stops the row. The re-witness result
     never refutes or confirms the attribution.

---

## Row 11. `p14c3-admission-boundaries.test.ts:141`, leaf N10. Status: DECLARED r2, S10 proper

a. Assertion :141, `expect(promise).toMatchObject({ outcome: null, progress: 0, beneficiaryPersonId: beneficiary })`,
   inside `assertOutcomeDispatch` (:138-154), called by N10 at :241 (`x2-core.txt:196970-196992`;
   `1344-X8-core-extract.txt:931-945`).
   - The values that may move are `outcome` and `progress`, as in rows 8-10. `beneficiaryPersonId` matched.
   - N09 calls the same function on another chain (`c2cFixture`, week 147) and passed in x2. Nothing in it moves.
b. Chain: :231 names PERSON, ISSUER and promise-148. :232 calls the same `c2bLiveFixture`, :233-236 assert the same
   premise, and :237 advances to 2695 by the same route. In x2, :238-240 passed (tick 2695, the retirement record, no r01
   production) and so did :139 (`admitted`). After :141 the leaf needs a disposition call: :148 requires
   `advancePromisesWeek` to call `assignmentRefusal(PERSON, 2695, …)`, and :152 requires every such call to request
   `'actor'`.
c. Attribution: Y, predicted. It is the chain of rows 8-10 and the same cause, traced in rows 8-10 part c.
d. Gates: those of rows 8-10, from the same probe run. The C1 anchors cover :233-240 and :141, and the old anchor also
   covers N10's :142-152.
e. Probe: the same block and run (RUNBOOK-r2 steps 1-3).
f. Expected outcome: `PREMISE_CONFLICT`.
   - With :141 re-derived, N10 passes :142-143 (the contract stays bound; due 2704 follows 2695) and reaches :148.
   - Corrected per D7: the :148 call needs an open, bound promise to PERSON from any issuer. The weekly pass skips a
     settled or unbound promise (`promises.ts:1028`), and only an evaluated promise reaches the retirement check that
     makes the call (`:954`). promise-148 is settled, and PERSON's other promises, promise-132 and promise-142, are
     settled too. The probe reports every open bound promise to PERSON, with its issuer, as
     `outcome.openBoundForPerson`. With none, N10 fails at :148.
   - `PREMISE_CONFLICT`, `REPIN` and refutation as in rows 8-10, for :141's two fields.
   - The re-witness search of rows 8-10 also serves N10: its fifth check is N10's :148 and :152 at Wc − 1.
   - The probe also records `outcome.lastOpenPost`, the last post-tick at which promise-148 is open with progress 0.
     Choosing another witness week is a test-design change; this record proposes none.

---

## Summary

| Row | Leaf | Assertion | Moved in x2 | Attributed | Gates | Predicted outcome | Re-witness (A1, recorded) | Probe (RUNBOOK-r2 step) |
|---|---|---|---|---|---|---|---|---|
| 8 | R1 (:34) | rival-promises :25 | `outcome` null→SATISFIED, `progress` 0→1 | Y, predicted; probe decides | C1 head, C1 old, P1-P5 | PREMISE_CONFLICT at :37 | NONE predicted | s10-promises-chain (1-3) |
| 9 | R2 (:49) | rival-promises :25 | the same | Y, predicted; probe decides | the same | PREMISE_CONFLICT at helper :114 | the same search | the same run |
| 10 | R3 (:60) | rival-promises :25 | the same | Y, predicted; probe decides | the same | PREMISE_CONFLICT at :65 | the same search | the same run |
| 11 | N10 (:230) | admission-boundaries :141 | the same | Y, predicted; probe decides | the same | PREMISE_CONFLICT at :148 | the same search | the same run |

Gates, all from one run: C1 head and C1 old (anchors), P1 (an r01 shelving before the take), P2 (13 rejections, count 12
or held at 13), P3 (states equal through Ws, first difference at Ws + 1), P4 (the take came through a commission after
the hold or a due retry, with its own outcome receipt), P5 (r01 stalled without shelving). Nine predictions (seven from
the head run, two from the old run), the re-pin outcome and the re-witness search are recorded, never gating.

## Changes from the r2 form

| r2 item | Here | Why |
|---|---|---|
| Row 1 and rows 2-4: one state hashed at Ws (C3) plus a first-moved-row scan (C2) | P3 hashes all 96 states per top-level key and gates the first difference at exactly Ws + 1 | One test covers both. It compares whole states, so a moved field outside any dumped row still shows (D5's false-pass concern for rows 2-4), and the per-key map locates the first difference |
| Row 1 P2 required a count of 12 entering Ws | P2 accepts 12, or 13 reported as `heldByGuard` | 1344-D6 noted that row 1's P2 reads false when the guard held the count at 13 (1344-A §3.3) |
| Row 6 outcome from the first take after 213 | Outcome from each leaf's own next lines after re-deriving the moved premise | The moved value is the leaves' premise, so their own lines decide (R6b) |
| r2 `OUT` and old tree under `1344-sweep/s10/` | `r2d/out` and `r2d/old-tree`, a probe copy named `zz-s10-promises.test.ts` | Nothing collides with the r2 runs or their record |

## Open for the parent

1. The brief's masking premise holds for row 11 only (Corrections 1 and 2). Rows 8-10 failed identically at 1344-I.
2. If the probe confirms `PREMISE_CONFLICT`, these four leaves stay failing as identities that passed at 1338. 1344-N's
   success line allows no new identity, so they need a ruling. Extending F5 Part A to them is the parent's call (D7 §4);
   the recorded re-witness result is the evidence F5 A3 asks for.
3. `RUNBOOK-r2.md` is independent of the r2 runbook: it has its own `out/`, old tree and probe copy. It needs only a
   machine with no other vitest running.
