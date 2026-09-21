# 619-T2 report — bounded RECORDED reconciliation of the seating RED (record 621 R2, G10 class)

STATUS: DONE. Worktree /Users/zacheryspector/The-Movies-headless-program, HEAD c73b9a3e, no commits, no src/fixture/helper/timeout/seed change.
Working tree carries only tests/p14b4-rival-seating-preference.test.ts (814 lines, sha256 4a4803352b49e1e5…) and
tests/p14b4-cast-class-outcomes.test.ts (comment :211-219 only, sha256 1e32f62730a67220…). Patch = `git diff HEAD -- tests/`
at scratchpad/619-T2.patch (23537 bytes, sha256 4bf50622b6633d56…). Scratch probe (disposable): scratchpad/619-T2-probe/
(chain.probe.test.ts, vitest.config.ts, compare.mjs, rows-*.json); pre-seam source = `git archive 68b1083 src` extracted to
scratchpad/619-T2-preseam/ (byte-verified against `git show 68b1083:src/core/hollywoodTick.ts`).

## A. Re-derivation of the default-seed digest (receipts, landed fc1c7b07 source vs 68b1083 pre-seam archive)

My own probe (a transcription of the RED's lawRow with receipt columns, NOT the writer's rows) reproduces both ends exactly:
landed digest 2aec0184c3301f1e174fe9843a0b076258fdc9de9683424cb064a5d777382610 (= 622 "received"), pre-seam digest
dba473b9bc13816e1b4cb1ed04f53f669912384179c5c73d0b23eeb64ed65489 (= the RED's original pin). Logs 619-T2-probe-landed.log,
619-T2-probe-preseam.log; comparison 619-T2-compare.log; receipts 619-T2-receipts.log.

| Check | Receipt-derived fact (landed) | Pre-seam (68b1083) |
| --- | --- | --- |
| rows / pictures / notOk | 1015 / 51 / 0 | 1014 / 51 / 0 |
| all rows before w208 identical | yes (tuple-by-tuple) | — |
| (i) first moved decision | w208 studio-aca408ec-r01 key script-0006 | — |
| (ii) admitted member | person-studio-aca408ec-r02-0, role writer, promise-12 APPEARANCE_COUNT {count:1} (generic mask), contractId studio-aca408ec-r01:contract:person-studio-aca408ec-r02-0:208 bound, outcome null, progress 0, window [208,416) holds take week 213; busy set at w208 = []; employees in order r02-0(w) r02-1(d) r02-2/3/4(a) r02-5(c); ready scripts 0006 and 0011 both writerId r01-0 (departed, not employed) so taken = {r01-0, r02-1, r02-5} excludes r02-0 | same employees/scripts/promise; pool [r02-2, r02-3, r02-4] |
| (ii) moved rows' pool / ok | w208 r01 script-0006: pool [r02-0, r02-2, r02-3], chosen null, 0 of 6 permutations viable, ok true; w208 r01 script-0011: same pool, chosen r02-3/r02-2/r02-0 budget 3033668+594746, law = that (only [210] viable, benefit 3), ok true | w208 r01 script-0006 → film:6 cast r02-4/r02-3/r02-2 budget 2647083+573000 ok true |
| (iii) picture and take | studio-aca408ec-r01:film:11 startTick 208 writer r01-0 director r02-1 craft [r02-5] cast lead r02-3 / antagonist r02-2 / support r02-0; first-take-event-45 week 213 (= 208 + WEEKS_TO_FIRST_TAKE) same cast; promise-12/16/18 SATISFIED outcomeWeek 213, evidence [first-take-event-45], own promiseOutcome receipts talent-market-event-120/121/122 ("a promise to this person was kept") | film:6 first-take-event-45 w213 cast r02-4/r02-3/r02-2 → promise-16/18/20 SATISFIED; promise-12 OPEN at 350 (never seated) |
| (iv) moved row set (keyed week|studio|key) | 289 tuples differ + 2 only-landed (w208 r01 script-0011; w217 r01 script-0006) + 1 only-pre-seam (w217 r01 script-0011): r02 284 rows w208..w349 pool [r01-0, r01-2, r01-3] vs [r01-2, r01-3, r01-4], chosen null both sides (r01-0 = writer, promise-1 bound OPEN generic); r01 5 rows: w208 script-0006 (pool+chosen+budget), w229/242/255 budget marketing only (1150147 vs 1154288; 1162611 vs 1167103; 522477 vs 524949), w264 negative AND marketing (1479726+501787 vs 1561932+493348) | — |

Corrections to the writer's narrative (counts agree: 285 pool + 1 chosen + 2/1 only-rows; narrative details do not):
- promise-20 (r02-4) does NOT "stay OPEN": film:6 (script-0006) is produced at w217 with pool [r02-4, r02-2, r02-3]
  (the promised actor r02-4 first, a seam reorder within the first three), cast r02-4/r02-3/r02-2, first-take-event-46 at
  w222 → promise-20 SATISFIED outcomeWeek 222 (talent-market-event-123). The writer's probe stopped at w220.
- w217 is a moved picture (film:6 landed vs film:11 pre-seam; the two pictures swap weeks); the "later pictures
  w229/242/255/264 marketing drift only" list omits it, and w264 also moves in negative (a different affordable scale from
  cash downstream), not marketing only.
- Net promise service on r01's chain by w222: landed 12/16/18 (w213) + 20 (w222) = 4 of 6 bound roots; pre-seam 16/18/20
  (w213) = 3 of 6. promise-14 (r02-1 sole director) and promise-22 (r02-5 sole craft) OPEN on both (G-1).

RED edits (tests/p14b4-rival-seating-preference.test.ts):
- CHAIN_DIGESTS[DEFAULT_SEED] re-pinned to 2aec0184… with the record-621 R2 comment naming r02-0 / writer / promise-12 / w208,
  film:11, first-take-event-45, promise-20 via film:6 at w222, r02's symmetric r01-0/promise-1 admission, and the pre-seam value.
- The digest case's stated reason replaced: the old sentence ("only generic members … so the law never moves it") is deleted;
  the kept invariant is "every row ok and the moved rows are exactly the seam-admitted member rows", asserted, not narrated:
  (a) `seamPool()` — the seam law (plan :225-232) transcribed from `before` and the strict members (promised first in
  employment order; this screenplay's writer and the chosen director/craft never cast; acting profile; first non-busy actors;
  three seats) — and EVERY row (1015 default + 1083 seed-b) now asserts `pool == seam` (poolKnownBefore) and `ok` (closes
  619-B L1 as an executed assertion); (b) `admitted` (members seated from outside the first three, with role/mask/promiseIds)
  pinned for the default seed: r01 w208 ×2 keys admits r02-0 writer promise-12 (script-0006 null, script-0011 the picture);
  r02 284 rows w208..w349 admit r01-0 writer promise-1, chosen null; seed-b admits nobody outside the first three.

## B. The positive seam witness (plan :225-227, :233; 619-B L1/R2)

Todo :697 converted into a live case (former four-actor fixture finding kept in its comment). Derived by search: `Scan.seam` =
the first PICTURE on the default seed whose pool seats a promised person outside the historical first three; then pinned by
identity (618 style): week 208, studio-aca408ec-r01, key …:package:script-0011. Asserted from receipts: swapped team in
employment order (r02-0 writer, r02-1 director, r02-2/3/4 actors, r02-5 craft), sole writer, acting profile present, six bound
OPEN P1 roots promise-12..22 one per employee, promise-12 bound to the r01 contract and its window holds 208+WEEKS_TO_FIRST_TAKE,
both ready scripts written by the departed r01-0 (not employed → not taken), pool [r02-0, r02-2, r02-3] = seamPool, firstThree
[r02-2, r02-3, r02-4], admitted [{r02-0, writer, generic, [promise-12]}]; the earlier same-week call (script-0006) chose nothing
with 0 viable permutations (never a forged package); law pick benefit 3 = real choice lead r02-3 / antagonist r02-2 / support
r02-0, budget 3033668+594746; re-observed tick → film studio-aca408ec-r01:film:11 (writer r01-0, director r02-1, craft r02-5,
six distinct seats); first take first-take-event-45 at 208+5 with the film's cast; expectSatisfiedBy promise-12/16/18 with
three distinct own outcomeEventIds; promise-20 (displaced r02-4), promise-14 and promise-22 (sole director/craft, G-1) unserved
by this take. Observation: all six permutations carry benefit 3 (every pool member generic), only [210] is viable — the
chooser's benefit ordering has no bite on this witness (the seed-b witness covers it); what this pins is the seam admission and
the served non-primary-actor promise. Console table in 619-T2-red-run1.log :365-372.

## C. Comment sweeps (R4)

- tests/p14b4-cast-class-outcomes.test.ts :211-219 (text only): slot mapping updated to lead promise-8 (r01-4 tagged) /
  antagonist promise-4 (r01-2 tagged) / support promise-6 (r01-3 P1), with the pre-fix mapping kept and labelled G10-a.
  Verified from my own RED run (the witness case seats a4/a2/a3 on seed-b r01 film:23 and satisfies promise-4/6/8 on that take;
  the rivalWorlds search at remainingTicks 5 maps each slot to its bound OPEN root) and the file run once: 23/23.
- tests/p13a-rival-adoption.test.ts :48-53 — LEFT. States facts about seed 'p13-public-commercial-adoption' (purchase at
  w520 by a later-entering fifth rival), not the default chain. Measured on the landed source vs pre-seam (probe, 530 ticks):
  chain digest identical over 1610 rows, first purchase-route adoption studio-5a47d054-r05 committedWeek 520 on both. True.
- tests/p14b1-trust-chooser.test.ts :250-292 — LEFT. Same seed; r04 account cash at w404 = -8,933,725 and at w416 =
  -10,127,665 on the landed source, identical pre-seam and equal to the comment's literals. True.
  (619-T2-adoption-compare.log)

## D. Record-only observations (no edits)

1. Seated-writer commission stall on the default chain: ZERO weeks. r02-0 is in busyTalentIds from the w209 through w216
   before-states (film:11 cast) but r01's commission is gated by the two-script inventory rule (`activeScriptOrdinals.length>=2`)
   through w216 on both chains and by cash after w217; r01 commissions at exactly w226/239/252/256 on both, r02 unchanged.
   The 8-week busy window is fully masked by the inventory gate here (619-T2-commission.log).
2. G-1 on the default seed (bound rival-authored cast promises to sole writer/director/craft; fate at w350, windows end 416):
   r01-issued promise-12 (r02-0 writer) SATISFIED w213 by the seam (OPEN pre-seam — the G-1 instance the seam now serves);
   promise-14 (r02-1 sole director) OPEN; promise-22 (r02-5 sole craft) OPEN. r02-issued promise-1 (r01-0 writer) OPEN — r02
   admits him to its pool on every decision from w208 but never finds a viable package with either triple; promise-3 (r01-1
   director) OPEN; promise-11 (r01-5 craft, tagged leadOrAntagonist) OPEN. r03/r04 roots are unbound offers. All OPEN roots
   above break at 416, beyond the scan (619-T2-g1.log).
3. 625 controls and G10-b exposure: no pinned control moved (confirmed by 625). Two derived/downstream facts DID move or are
   exposed: (a) p14b1-t4-regressions `sharedTakeOutcomes()` (default seed) now returns promise-12/16/18 on first-take-event-45
   (film:11) instead of promise-16/18/20 on first-take-event-45 (film:6) — assertion holds (≥2 beneficiaries), content moved.
   (b) NEW FINDING, not in 619-B/619-W: on bridge-p13b-s8-rivals' natural seed 'p13b-s8-bridge-probe-01' a G10-b fired at w211
   on BOTH r01 and r02 (probe landed vs pre-seam, 300 ticks: 19 rows moved, first w211, every landed row ok): r01 film:23 pool
   [r02-0 writer, r02-2, r02-3] cast r02-3 / r02-0 / r02-2 (expected score 1,294,545 vs pre-seam 2,990,248 with r02-4 — a
   1.70M hypothesis cost from the seam's pool composition, not the chooser); r02 film:23 pool [r01-0 writer holding TAGGED
   promise-1 lead|antagonist, r01-2 tagged promise-5, r01-3] cast r01-2 / r01-0 / r01-3 benefit 3 @2,363,080 vs ordinary
   r01-3/r01-2/r01-0 benefit 2 @3,703,443 (1.34M chooser cost; pre-seam law pick 4,982,193). 619-B Q4's "r01 retains its own
   six at 208, closing the writer path for r01" does not hold on that seed: r01 employs r02-0/2/3/4 at w211. The bridge
   file's pinned research/adoption weeks (265/266/276/278/288, cash-threshold-derived on r01) held in 625 despite r01's
   film:23 change; the margin is unmeasured, so those pins are the ones a future movement could take. Landing record condition
   (6) should list these w211 winners. (619-T2-bridge-compare.log, 619-T2-probe-{landed,preseam}-bridge.log)
4. Seed 'p13-public-commercial-adoption': G10-0 through w530 (digest equal); 15 rows at w408-414 are RED-`ambiguous` (windows
   ending 416 partially cover [W+1,W+8]) on both sources — the known RED adjudication limit (619-B Q3), not a defect.

## Checks actually run (one at a time; logs in scratchpad)
- node_modules/.bin/vitest run --project core tests/p14b4-rival-seating-preference.test.ts → 21 passed / 0 failed / 1 todo
  (22), 30.74 s, EXIT 0 — 619-T2-red-run1.log. Digests printed: default 2aec0184…, seed-b d3218295….
- node_modules/.bin/vitest run --project core tests/p14b4-cast-class-outcomes.test.ts → 23 passed, EXIT 0 — 619-T2-outcomes.log.
- npm run typecheck → EXIT 0 — 619-T2-typecheck.log.
- Scratch probes (not project tests): 619-T2-probe-{landed,preseam}.log (default seed), -{landed,preseam}-adoption.log,
  -{landed,preseam}-bridge.log; each 1 passed.

## Evidence limits
- The seam-law transcription (`seamPool`) reads director/craft from `before`; same-week `staff()` hires are excluded by the
  existing poolKnownBefore guard. It reproduced every observed pool on both RED seeds (2098 rows) and on the two probe seeds.
- The probe's law columns are a transcription of the RED's lawRow; both ends of the digest were reproduced independently but
  by the same transcription. Bridge/adoption seed movement was measured by probe only; those files were not re-run by me
  (625 is the parent's record). No native, bridge-runtime or full-core run.
- "Stall = 0 weeks" is specific to this chain's inventory/cash gates; the 8-week busy window is real and would bind on a chain
  where inventory is below two scripts while the writer is cast.
