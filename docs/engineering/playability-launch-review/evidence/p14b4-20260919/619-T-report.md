# 619-T report — independent behavioral RED for the final seating preference

Status: DONE (RED authored, run, typechecked; two lawful-construction gaps marked as todo). Role: test-author, sole test process, one command at a time, no watch, no full suite. Worktree `/Users/zacheryspector/The-Movies-headless-program`, HEAD `62ca561abb3af583b366bbd11043019a7032ab57`, tree clean apart from the one new untracked file. Git read-only; no commit/stash/checkout/add.

## What changed

- NEW `tests/p14b4-rival-seating-preference.test.ts` (698 lines, sha256 `13cf926145837afa6d0718f52cf01e758d6a91fae0e14f6c8655e9f5728a40f7`). Nothing else: no `src/`, `bridge/`, `ui/`, `tests/fixtures/**`, no helper file, no other test, no timeout/cap/fixture move.
- Patch `scratchpad/619-T.patch` (sha256 `30c303cf31a22993a65f5ab03a8c084ca1862de87810646fe10e32098da3d197`; `git diff HEAD -- tests/` is empty, so the patch is the `git diff --no-index /dev/null <file>` new-file diff, 704 lines).

## Checks actually run (logs in the scratchpad)

| log | command | result |
|---|---|---|
| `619-T-run-final.log` | `vitest run --project core --reporter=verbose tests/p14b4-rival-seating-preference.test.ts` | 5 failed / 15 passed / 2 todo (22), 27.3 s, EXIT 1 |
| `619-T-outcomes.log` | `vitest run --project core tests/p14b4-cast-class-outcomes.test.ts` | 23/23, EXIT 0 (nothing moved) |
| `619-T-typecheck.log`, `619-T-typecheck-2.log` | `npm run typecheck` | first run: 2 TS errors, both in the new file (exactOptionalPropertyTypes on an optional Call, a Range tuple literal); fixed; second run EXIT 0 |
| `619-T-discovery-{1,2,3}.log`, `619-T-diag-w202.log`, `619-T-run-{1,2,4}.log`, `619-T-run-3-membership.log` | authoring iterations (discovery scaffold, then the real file) | retained as evidence of how the table was found |

## Law-to-case map, expected vs observed, stop line

Law text is `docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` :209-235. The test derives every expectation from it; the ordinary economic score (hollywoodPolicy.ts :45-60) is transcribed per fixed permutation ONLY to order permutations the way :216-218 orders them, and that transcription is self-validated on every no-member decision (it must reproduce the real choice exactly: cast, budget, margins). Observation is `vi.spyOn(chooseIndustryPackage)` returning the real result (accepted policy-test pattern).

### RED today (5)

1. `RED: the real seating serves the maximal DISTINCT-beneficiary count …` (:215-218, :223-225). Natural witness seed-b w211 `studio-bc14baf6-r01` script-0023 (film 23), pool in employment order [r01-2, r01-3, r01-4]; members r01-2 tagged leadOrAntagonist (promise-4), r01-3 P1 (promise-6), r01-4 tagged leadOrAntagonist (promise-8), plus bound P1 roots on the writer/director/craft (r01-0/1/5, outside the pool). Permutation table (benefit / ordinary score): [012] 2 NOT VIABLE; [021] a2/a4/a3 3 NOT VIABLE; [102] 2 NOT VIABLE; [120] a3/a4/a2 2 @ -1507894; [201] a4/a2/a3 3 @ -1735081; [210] a4/a3/a2 2 @ -1425536. Law pick = a4/a2/a3 (the only VIABLE 3/3 seating). Observed: a4/a3/a2 (benefit 2). Stop line :441 `expect(benefitOf(decision.result.cast, m.certain)).toBe(law.benefit)` → "expected 2 to be 3". Not reached: cast/budget equality, viability (`negative+marketing <= cashAvailable <= rival cash`), film identity `studio-bc14baf6-r01:film:23`, and the real take at w216 satisfying promise-4/6/8 through `advancePromisesWeek`/`qualifyingTakes` with three distinct outcome receipts.
2. `RED: every real film decision on seed-b with members seats the law pick …` (:216-218). 414 real film decisions with members (8 pictures) on seed-b; misses = 2: w211 r01 (above) and w220 r01 (members r01-2 tagged only, since r01-3/r01-4 were met at w216; chosen a3/a4/a2 benefit 0; law a4/a2/a3 benefit 1 @ -1209332; ordinary a3/a4/a2 @ -898436 — the natural "economic score orders among equal-benefit permutations" witness, four benefit-1 seatings). Stop line :458 `expect(misses).toEqual([])`. Note: after the fix the w211 seating satisfies promise-4 too, so the chain from w216 changes and later rows will differ; the assertion is law-relative and survives that.
3. `CONFLICT …` (:216-217, :224-225). Ordinary pick a4/a3/a2 (benefit 2, -1425536) beats the law pick a4/a2/a3 (benefit 3, -1735081) on score; the other 3/3 seating a2/a4/a3 has no viable package and must not win. Stop line :473 `expect(decision.result.cast).toEqual(law.cast)` (antagonist a3 vs a2, support a2 vs a3). Not reached: the real take satisfying promise-4.
4. `TIE FALLBACK (labeled reception-input variant)` (:218-221). VARIED: r01-2's Talent record := r01-4's with r01-2's id and name (`twinVariant`); nothing else. Table: [021] a2/a4/a3 and [201] a4/a2/a3 tie exactly at -1545921 with benefit 3; [012]/[210] tie at -1515917 with benefit 2. Law = [021] (the earlier of the tied pair in the existing loop order over the pool [a2, a3, a4]; inherited strict-greater tie behaviour, not fairness). Observed: a2/a3/a4 = [012], the first of the tied ORDINARY max — which itself confirms the inherited first-strict-greater tie rule on the current path. Stop line :514. Not reached: film/take, promise-4/6/8 satisfied.
5. `a met promise never counts (r01 chain, RED today only through the witness defect)` (:210-211). After the natural w216 take, promise-6/8 are SATISFIED and correctly leave the member set at r01's next decision (w220); strict pick a4/a2/a3, observed a3/a4/a2. Stop line :619. Discriminating today: false (as-if-unmet gives the same pick); after the fix the chain changes and this case may become discriminating. The GREEN r02-chain control covers the negative today.

### GREEN today (15)

- Default seed byte-identity (:223): first screenplay-planning call `studio-aca408ec-r01:screenplay:0` (options {cashAvailable 23362807, weeklyCost 97680, lockScreenplay false}, pool r01-2/3/4, full result pinned incl. `expectedOperatingMargin -1459843.0106883487`) and first film decision w3 `…:package:script-0000` (cashAvailable 23167447; cast a4/a3/a2; budget 3304115+981122; `expectedOperatingMargin 63768.80190253258`), no members, pool == first three non-busy employed actors, transcription reproduces the real result exactly, production `studio-aca408ec-r01:film:0` digest `89385c2a…4eee19`.
- Chain controls (:223-229): every no-member decision on both seeds equals the transcribed pick and pool (default seed 1014 decisions / 51 pictures / 724 without members; seed-b 1083 / 98 / 669); a null choice only when no permutation is viable; chain digests pinned (default seed all rows `dba473b9…65489`; seed-b rows before w211 `d3218295…daea2`).
- Witness search table (identity pin w211/r01/script-0023, masks, bindings, O-T4-1 shape, two 3/3 seatings of which ≥1 viable).
- EQUAL BENEFIT: seed-b w211 `studio-bc14baf6-r02`, all three pool members P1 → every viable permutation benefit 3 → law == ordinary == chosen.
- CURRENT unaccepted offers never count (:212-213): natural presence at w202 for r01/r02/r03 deciding while their own retention offers (promise-4/6/8 etc., contractId null) are current; strict members empty; chosen == ordinary. Made DISCRIMINATING by re-authoring r01's own current offers through the real services (`submitProposal` revise-in-place + `attachPromise`: a3 → tagged lead, a2 → P1): counting them would seat a3/a4/a2 (benefit 3 @ -1459842); law/observed a4/a3/a2; the offers stay contractId null after the decision week.
- Another issuer's promise never counts (:211): r02's unbound offers promise-5/7/9 to r01's actors present at w202 and w211, excluded from r01's members; discriminating re-authored variant of r02's offers (same route) → observed == strict. Evidence limit: under exclusive employment such a promise is necessarily unbound, so the negative is doubly excluded.
- Met promise, r02-chain control: after r02's w211 picture satisfies its three P1 roots at w216, its next decision has no pool member and takes the ordinary pick.
- Window excludes the prospective take ×2 (promiseVariant of promise-4: start = w311; due = w212): promise-4 leaves the member set; law over {a3 generic, a4 lead|antagonist} = a4/a3/a2 (benefit 2) == observed; counting it would seat a4/a2/a3 (discriminating); the real take leaves promise-4 unserved (due-variant BROKEN at w212 by the real pass).
- Mask derivation ×3 (promiseVariant of promise-4: tagged lead → mask [lead]; legacy count-only P2 → generic; P1 → generic): each discriminating against the natural leadOrAntagonist reading; law == observed a4/a3/a2; the real take satisfies (generic) or leaves unserved (lead-only in support) exactly as `promiseCastSlots` says.
- Seam: the witness rival's writer/director/craft (bound OPEN P1, sole holders of their roles) are never seated; the film's writer/director/craft are exactly them; six distinct people; their roots stay unserved by this picture (strategy gap, see below).
- Capacity constraint (:231-232): 286 natural weeks (default seed r03/r04 from w208, 142 each; seed-b r04, 2) where a rival with a ready screenplay and no picture has a staffing deficit and decides nothing — no forged package.

### UNEXECUTED (2 todo, in the test's own words)

- INTERSECTION mask (:213-215): no lawful construction — `attachPromise` binds at most one promise per proposal, rival contracts run 208 weeks, so a second bound OPEN root for one person lies beyond the 350-tick bound. Never a synthesized root.
- Promised ACTOR outside the first three non-busy employed actors (:225-227): no rival on p13a-core-causal-01 / seed-b / seed-c / seed-d holds four actors within 350 ticks (`actors>=4` count 0 in discovery logs 1 and 2). Source fact: `RIVAL_TEAM_ROLES` seats three actors and a challenger offer is dropped at freeze — seed-b w208 `talent-market-event-128..130` "Bellwether Pictures had no seat open for this person's role at the decision week." Never a synthesized employment.

## Natural-witness search table (seed-b, film decisions with pool members, chosen ≠ null)

| week | rival | pool members (mask) | chosen | benefit | law pick | verdict |
|---|---|---|---|---|---|---|
| w202 | r01/r02/r03 | none bound (own offers CURRENT) | ordinary | 0 | ordinary | GREEN control |
| w211 | r01 | a2 L\|A, a3 generic, a4 L\|A | a4/a3/a2 | 2 | a4/a2/a3 #3 | RED (witness) |
| w211 | r02 | three generic | a3/a4/a2 | 3 | same | GREEN |
| w220 | r01 | a2 L\|A | a3/a4/a2 | 0 | a4/a2/a3 #1 | RED (chain-dependent) |
| w229, w238, … | r01 | a2 L\|A | (4,3,2)… | — | covered by the table assertion; misses listed by the test | today only the two above miss |

Decision → take timing measured: decision at W, remainingTicks 5 at W+4, first take at W+5 (w211 → w216). The plan pins no prospective-take estimate; the test treats a promise as a member only when its window holds all of [W+1, W+8] and would flag partial coverage as ambiguous (none occur: all natural windows are [208, 416)).

## Fixture findings / strategy gaps (source facts, not defect claims)

- Promised non-primary-actor beneficiaries: rivals author bound P1 roots to their writer, director and craft (seed-b r01-0/1/5; default seed r02-0/1/5 held by r01). A P1 is only kept by a cast seat (`qualifyingTakes`), yet each is the sole holder of a role on a six-person team, so no lawful seating path exists; these roots will break at their due week (w416, beyond the bound). Remaining strategy gap for the plan's "bounded promised-person candidate generalization": with `RIVAL_TEAM_ROLES` there is never complementary staffing to seat them.
- w202 economics are marginal (best score -1391270 against hold -1509410): no twin variant makes a 3/3 seating viable there (`619-T-diag-w202.log`), so the pending-offer and other-issuer negatives are made discriminating by re-authoring the offers' masks, not by reception inputs.
- Interface assumption: the test observes the seam as `input.cast` of the real `chooseIndustryPackage(input, policy, options)` call and the deciding rival as the prefix of `options.key` before `:package:`. A signature change by the writer would need a test update through the parent.

## Evidence limits

- Source assertions only; no native/Unity, no browser.
- The transcribed ordinary score is a test-side reference of the EXISTING formula; it is validated against the real function on 1393 no-member decisions across both seeds but is not the preference oracle.
- Talent-twin and promise-material variants are labeled in-memory inputs, never authorship or history claims; re-authored offers use the real services on the rival's behalf (poaching-fixture precedent).
- Runtime 27 s for the file; both 350-tick scans are cached per seed within the process.

## Next concrete action

Writer implements the seating preference at the billing comparison (membership, masks, benefit, order, viability preserved) and the promised-person seam without broadening the no-promise pool; re-run this file (expect 20 passed / 2 todo), the outcomes file (23/23) and typecheck. Then re-examine the r01-chain met case and the seed-b table for post-fix discriminability and record which rows moved.
