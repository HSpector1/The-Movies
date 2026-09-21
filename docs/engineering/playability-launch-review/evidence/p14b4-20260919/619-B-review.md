**619-B — contract-auditor review of 619-A (design) and 619-T (RED) for the final seating preference. READ-ONLY; nothing run; HEAD f8bf42a0 (src lines identical to the note's 62ca561a — verified at hollywoodPolicy.ts :60/:61, hollywoodTick.ts :161-164, promises.ts :588-597).**

## Q1 — Design vs plan :215-236: MET WITH EVIDENCE, two corrections (one DEMONSTRATED, one paper-effect)

Term by term (design §2 vs plan):
- Membership bound OPEN / unmet / same issuer / prospective take in half-open window / never CURRENT offers: MET. `evaluable` = `contractId!==null && outcome===null` (promises.ts :588-590); `progress < count`; `takeWeek` tested `[windowStartWeek, dueWeekExclusive)` exactly as `qualifyingTakes` :608; `activePromiseReservations` (:289-298) correctly NOT reused because it counts attached unaccepted offers (:290-293).
- Detached masks, intersection, legacy generic: MET via `promiseCastSlots` (:592-597, nested masks → narrowest).
- Benefit = distinct beneficiaries whose slot satisfies the mask: MET (§2(b); cast is distinct by construction).
- Maximize benefit among legal/affordable/viable, then score, then BILLINGS strict-greater fallback: MET (§2(c); :50 cash gate and :60 viability run before the comparison; `benefit>bestBenefit || (benefit===bestBenefit && score>bestScore)`; with no masks reduces to `score>bestScore` = :61 byte-for-byte behaviour).
- Planning call untouched (:212-214, no `promisedMasks`): MET.
- Seam includes promised people without broadening no-promise policy / crew / UI: MET on the no-member path (masks empty → :162 verbatim); writer-of-this-script, chosen director, chosen craft excluded (M16.7, productionAdmission.ts :180-199); busy = the same set as :156; has-discipline = promises.ts :409 / productionAdmission.ts :89-96.
- Missing complementary staffing = capacity constraint: MET (guard :164 unchanged).
- Added beyond plan: nothing. Missing: nothing in law.

Take-week definition VERIFIED: greenlight at pre-increment W → same-tick advance skipped (operations.ts :1658-1661) → 8→7→6→5 → the 5→4 branch (:1680-1689) fires in the tick labelled W+4 → receipt week = post-increment `finalized.market.tick` = W+5 (tick.ts :1102-1108) = `WEEKS_TO_FIRST_TAKE` (promises.ts :53). Witness: scan log :7 "w215 remainingTicks 5" → decision 211, take 216 (RED report :60 measured the same).

Rulings on the note's Q1–Q14:
- Q1 AGREE (progress refreshed by the outcome owner before the next decide; tick.ts :1110 after :1102).
- Q2 AGREE it is the plan's rule (:213-215); under-count of a partial service is a recorded consequence; no natural witness (RED todo :668).
- Q3 AGREE exact half-open at W+5, no slack. RECORD-ONLY: the RED does not pin W+5; it treats a promise as a member only when its window holds all of [W+1, W+8] and flags partial coverage as `ambiguous` (test :90-106) — consistent with the design on every natural and variant case in the file, but a window edge inside [W+1,W+8] would make the RED refuse to adjudicate rather than disagree.
- Q4 exclusion of this script's writer: AGREE. "Normally never" is WRONG on the default seed — see Q4/Q5 below (D2).
- Q5 AGREE: (shape→billing→scale→marketing), strict-greater keeps the earliest; the design's single-loop lexicographic update and the RED's per-billing-max-then-across-billings `lawPick` (:147-154) are equivalent, tie → [0,2,1].
- Q6 VERIFIED above.
- Q7 AGREE no cap; the witness forgoes 309,545 of expected score (-1,735,081 vs -1,425,536; baseline :18-20) to keep promise-4. Record the magnitude for the Owner.
- Q8 AGREE.
- Q9 AGREE keep; note under `RIVAL_TEAM_ROLES` the sole director/craft can never be seated (they are always the chosen crew or the decision is skipped) — those rival-authored cast promises are the G-1 class.
- Q10 partly DISAGREE on the witness: scientists are hired by `staff()` directly (hollywoodTick.ts :128-149, no case, no `authorRivalPromise`), so a scientist member needs a case (expiry/discovery) — not expected before 416. The constructible non-primary-actor beneficiary is the NON-AUTHOR SOLE WRITER on the default seed (Q4 below).
- Q11 AGREE.
- Q12 NOT a legibility choice — DEMONSTRATED conflict D1 (below).
- Q13 AGREE.
- Q14 the RED covers all but the positive seam witness (see Q2).

## Q2 — The RED: expectations law-derived; five RED cases correct in law; one control rests on a paper assumption

Derivation: every expectation cites a plan sentence (header :8-21) and is computed by `lawPick` over real inputs; `ordinaryBest` (:114-136) is a faithful transcription of hollywoodPolicy.ts :45-61 (perceived inputs, `required`, scale loop, marketing menu, :50 cash gate, `computeForecast` with the same key/seed, :56-59 score, :60 gate, strict-greater) — I checked each line; it is validated against the real function on 1393 no-member decisions (report :71). Pinned literals on the witness (casts at :468-469, :430; `[021]` NOT VIABLE at :471) are fixture facts of the transcription over real inputs, not copies of today's output.

Five RED cases:
- (i) witness :435-450: correct. "Viable" is exactly the :50/:60 gates (`ordinaryBest` :125, :131). [201] a4/a2/a3 is the only viable 3/3 (baseline :14-19); it must win at benefit 3 with score 309,545 below [210]. Post-fix chain: film 23 (same `uniqueIdentity`), take at 216, three SATISFIED with distinct own `outcomeEventId` (promises.ts :662-675) — reachable.
- (ii) seed-b table :452-459: correct and law-relative. w220 today: members {r01-2 L|A}; four benefit-1 seatings, law [201] @ -1,209,332 vs ordinary [120] @ -898,436 (baseline :25). After the fix promise-4 is met at 216, so this row disappears; the assertion survives because it is derived per row.
- (iii) CONFLICT :461-478: correct; benefit beats score; the other 3/3 has no viable package and must not win (:471).
- (iv) TIE FALLBACK :493-522: correct. Twin variant produces an exact tie at -1,545,921 for [021]/[201] (baseline :30/:33); design iteration (one locked shape → BILLINGS → scale → marketing) keeps [0,2,1] first. Today's pick [012] (first of the tied ordinary max) itself confirms strict-greater/earliest.
- (v) met-promise r01 chain :603-620: correct; post-fix all three are met at 216, r01's w220 decision has no pool member, strict = ordinary; `nextDecision` 40-tick bound is generous (film 23 releases at 219).

15 GREEN: genuine current-law controls — default-seed w3 planning/decision/production digest (:354-388); chain digests (:403-406); CURRENT offers and other-issuer negatives via real `submitProposal`+`attachPromise` (:329-340, roots stay `contractId null` :556); window ×2 and mask ×3 variants (labeled `promiseVariant`, the accepted outcomes discipline, `feasibilityReceipt` unchanged :255); seam exclusion :672-689; capacity :691-695. Spy: observation only (:168-177 captures the original before `spyOn`, asserts no input mutation, `mockRestore`). No synthesized root/receipt/state, no timeout, no seed move (seed-b is record 618's). Todos honest: one promise per proposal (talentMarket.ts :1277) and 208-week terms put a second bound root beyond 350; no rival holds four actors (`RIVAL_TEAM_ROLES`, seat cap).

Interface assumption: HOLDS. The seam rewrites `provisional.cast` before `inputsFor` (hollywoodTick.ts :167-169), so the spied `input.cast` IS the seam's triple and permutations reorder it; `options.key` prefix unchanged.

Two honest limits:
- L1. The RED cannot fail if the writer omits the seam entirely: `promisedOutside` (:194) counts only ACTOR members outside the first three (none exist naturally), and every member row is checked law-relative over whatever pool was observed. The seam's inclusion rule (plan :225-227) has NO positive RED coverage — only exclusion (:672-689) and no-broadening (:397). The parent must verify the seam hunk structurally.
- L2. The default-seed digest (:401-406, comment "only generic members … so the law never moves it") is true for the chooser (G10-a) but not for the seam (G10-b) — see D2.

## Q3 — Design vs RED consistency: AGREE everywhere

Design §4.1 winner ∈ {[021],[201]} by score, "the run decides"; the run decided [021] NOT VIABLE → [201] a4/a2/a3 (r01-4 lead, r01-2 antagonist, r01-3 support) — exactly the RED's law pick. Benefit table identical (2,3,2,2,3,2). Employment order [r01-2, r01-3, r01-4] confirmed by RED :415. "a2/a4/a3 NOT VIABLE" is consistent with the :60 gate (no scale×marketing candidate exceeds hold with a2 as lead; [012]/[102] also not viable). Exact tie → [021] only in the twin variant, both agree. §4.2's rivalWorlds prediction (support → promise-6, lead/antagonist = promise-8/promise-4) matches. No disagreement found.

## Q4 — Natural-chain impact and G10: G10 is LAWFUL; §4.2's default-chain "unchanged" claim is UNSOUND

Lawfulness: yes, in the C10 sense (600-B :79). The causing law is the plan's delegated hypothesis (:209-236), included in the Owner's cutover order (600 §1 step 3; 600 §3 step 8 "final seating preference … with their own RED") and record 618 NEXT618 (a); plan T2 :396-400 grants independent explicit reconciliation for any legitimate moved current-law premise. Conditions: (1) name the class (G10-a/b/0) per moved fact; (2) re-derive from receipts (`Production.cast`, `FirstTakeReceipt.cast`, `promiseOutcome`) with the member set observed at the decision; (3) re-express purposes, never drop or loosen; (4) a G10-b movement must name the admitted person, their promise and role; (5) a moved row counts as G10 only if the RED's law-relative `ok` holds on the moved chain — a post-fix row with `ok=false` is a writer defect, not reconciliation; (6) the landing record lists which natural winners/weeks moved so the Owner sees the launch-behaviour change (:187).

Soundness corrections to §4.2:
- D2 (paper-demonstrated). On the default seed the w208 settlement SWAPS r01's and r02's six-person teams, each on bound P1 roots (600-T2 :501: "r02 wins all six r01-x … r01 wins the six r02-x on P1 roots"; r01 film 6 at w208 already cast r02-4/3/2, 600-T2 :518). r01's leftover scripts carry `writerId = r01-0` (departed), so its new sole writer r02-0 — a generic member — is NOT in `taken` and, whenever `busyTalentIds` (employment.ts :160-171; drafting = hollywood.ts :92-97) does not hold him, the design's `promised` (no role filter, §2(d) step 4) admits him ahead of the actors in employment order: a triple change on the default chain (symmetric for r02 with r01-0). Whether he is idle at the specific decision weeks (w208; ~w216 when film 6 releases) is NOT VERIFIED on paper, but the configuration is exactly the one §4.2 labels G10-0 ("all members generic and already the triple") — that label is wrong: the writer member is not in the triple. Consequences: the RED default-seed digest (:406) may move lawfully; rivalFixture/sharedTakeOutcomes/poachingFixture are derived and should survive (analyzed: promise-16 @213 still first SATISFIED if r02-2 stays cast; ≥2 beneficiaries on the shared take; player-issued BROKEN unaffected).
- bridge-p13b-s8-rivals is NOT the default seed: `NATURAL_SEED = 'p13b-s8-bridge-probe-01'` (:196). Its r01 retains its own six at 208 (:207-208), closing the writer path for r01; other rivals and tagged members on that seed NOT VERIFIED — the hard pins 265/266/276/278/288 need a run.
- "everything ≤ w208 unchanged" should read "< w208": the film-6 evidence shows binding precedes the w208 decide, so w208 itself can move.
- p13a-rival-adoption ('p13-public-commercial-adoption', 416→~520, 120 s budget) NOT VERIFIED; derived, no hard week pin.
- The design's sub-classes are otherwise sound; G10-a witnesses seed-b r01 f23 and seed-d r02 f23 agree with the scan log :8-14, :20-23.

Rule-of-thumb refinement: a chain can also move when a generic member is admitted by the seam (writer via leftover script; scientist via a case) — G10-b needs no tagged member.

## Q5 — Strategy gap G-1: REAL, OUTSIDE this slice, product-level, seating may proceed

Real at HEAD: `authorRivalPromise` (talentMarket.ts :1275-1296) authors for any case subject the rival bids on; feasibility checks only `skills.acting !== undefined` (promises.ts :407-409), non-optional by type (types.ts :95-101); the seed-b witness rival holds bound P1 roots to its sole writer/director/craft that this picture cannot serve (RED :672-689 GREEN, roots unserved) → BROKEN at 416 → self-authored trust damage. Under `RIVAL_TEAM_ROLES` the sole director/craft are never seatable; the sole writer only on a picture written by someone else (the default-seed swap makes this possible — the same event as D2; on seed-b never).

Inside this slice? No — talentMarket.ts is frozen for 619-W, and plan :233-235 asks for the gap to be REPORTED, not fixed by the seating slice. Product or engineering? Product: the authoring order is a delegated hypothesis "subject to expansion review" (:187, :203-204), and 26 §2 :88 says no new eligibility gate is implied; a shared-service (player-symmetric) exclusion would be a new gate.

Recommended disposition: (B) accept as hypothesis cost NOW, record it with the seed-b evidence in the Owner-visible record; (A) rival-only authoring exclusion (a person whose only lawful role on the rival's pictures is a non-cast seat) as a later B4 backlog item for Fable's expansion review, with its own RED — noting (A) changes authoring at w196 and therefore moves EVERY natural chain after 196 on every seed (a large reconciliation bill; not for the three-week window without a reason). The seating slice may proceed.

## Q6 — Writable/frozen list and self-check: CONFIRMED with one addition

Writable: `src/core/hollywoodPolicy.ts`, `src/core/hollywoodTick.ts`, `src/core/promises.ts` (reader only, inserted after :597; no import changes needed — `GameStateV30`, `CastSlot`, `CAST_SLOTS`, `evaluable` are in scope; the insertion shifts frozen-region line numbers, bytes unchanged). No index.ts export. Nothing else. No test edits. No save/bridge/receipt/RNG change: verified — no new receipt kind, no promise write, the only randomness stays the derived forecast stream keyed by `options.key` (hollywoodPolicy.ts :52), `Production`/`filmAnnounced` shapes unchanged. `WEEKS_TO_FIRST_TAKE` already exported (:53). No other test spies `chooseIndustryPackage` or pins default-chain rival person ids (grep: only the RED and recorded fixtures).

Per-step patches (condition R1): step 1 reader + chooser; step 2 the seam LAST, so any G10-b movement is bisectable to the seam.

Self-check expectation (corrected): RED file 20 passed / 2 todo — OR 19 passed / 1 failed / 2 todo where the ONLY failure is the default-seed digest at :406 with a moved row whose `pool` contains a non-actor member (G10-b, test-author) — any other failure is a writer defect; outcomes 23/23 (rivalWorlds still met at seed-b w215 on film 23: all three slots bound OPEN, genuine = promise-8 in lead; comment :211-216 goes stale, record-only); policy 7/7 (159 s, parent runs); typecheck EXIT 0. Then by the parent: p14b1-t4-regressions, p14b2-fixture-preconditions, bridge-p14b2-trust, p14b1-trust-chooser, p14a1-rival-trigger, bridge-p13b-s8-rivals, p13a-rival-adoption, capacity, evaluator-5, then the full core compared with 617 (1/192/1) and 616 (13/39).

## Q7 — Verdict: RELEASE WITH CONDITIONS

DEMONSTRATED (fix before/at landing):
- D1. Design §3 C passes `promisedMasks: masks` unconditionally; RED :367 pins the no-member default w3 `decision.options` with `toEqual` on five keys — an extra key holding an empty Map is not ignored by `toEqual` (only `undefined` values are) → fails. Writer: pass the key only when `masks.size > 0` (conditional spread; also keeps the no-preference call byte-identical), or declare `promisedMasks?: … | undefined` and pass `undefined`.
- D2. Design §4.2 (G10-0 for the default chain) and Q4 ("normally never") omit the default seed's w208 r01↔r02 team swap; the design's own seam can admit the non-author sole writer there. Not a law defect; correct the note and follow the attribution protocol (R2).

REFINE:
- R1. Land as two per-step patches, seam last.
- R2. Attribution protocol for the parent's record-check: a post-fix RED failure is a writer defect unless it is exactly the default-seed digest AND the moved rows' `pool` names a non-actor member admitted lawfully (`ok` true on the moved chain); then it is G10-b → test-author re-pins the digest from receipts and converts todo :697 (or a new case) into the positive seam witness the plan :233 asks for.
- R3. Design-note corrections: seed name for bridge-p13b-s8-rivals; "< w208"; G10-b candidates = non-author writer (default seed), scientist only via a case (not `staff()`).
- R4. Test-author follow-up after landing: positive inclusion witness or fixture finding; comment sweeps (outcomes :211-216, p13a-rival-adoption :48-53, trust-chooser :250-292 if moved).
- R5. Product option for Fable's expansion review, NOT adopted now: order `promised` actors-first (non-actors only when fewer than three actor members) — removes the G10-b footprint and the 8-week commission stall a seated writer causes (`busyTalentIds` includes production-company cast → hollywoodTick.ts :191 finds no idle writer) at the cost of never serving crew-held cast promises. The design's broad rule is plan-faithful and makes :233 constructible; keep it unless Fable rules otherwise.

RECORD-ONLY:
- Witness cost 309,545 expected score on seed-b r01 f23 (Owner-visible hypothesis cost).
- G-1 (Q5) with seed-b r01-0/1/5 evidence; disposition B now, A backlog.
- RED is take-week-agnostic within [W+1, W+8]; RED cannot detect seam omission (L1); parent verifies the seam hunk.
- Binding precedes the w208 decide (film-6 evidence).

## Rulings for the parent
1. RELEASE 619-W on the design with D1 fixed (conditional `promisedMasks`) and per-step patches, seam last.
2. Post-landing record-check reads the RED per R2; only the default-seed digest may move, and only with a named non-actor member in the moved pool; everything else is a writer defect.
3. G10 (a/b/0) is a lawful T2 reconciliation class under the C10 conditions plus (4)-(6) above; the test-author owns every re-pin; the landing record names moved winners/weeks.
4. G-1 is recorded, not fixed; seating proceeds; disposition A goes to Fable's expansion review backlog.
5. Design note 619-A gets the §4.2/Q4/Q10 corrections in the record (no re-issue needed).
6. No Owner acceptance is claimed; no native evidence exists or is required for this slice.

## Sources read
/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md :140-276, :380-416; …/evidence/p14b4-20260919/619-A-design-note.md (whole); tests/p14b4-rival-seating-preference.test.ts (whole, 698 lines); …/619-T-report.md; …/620-seating-red-baseline.txt (whole); …/26-live-cutover-implementation-map.md :70-99; …/600-owner-ruling-578-reopened-program.md (whole); …/600-B-review.md :73-81, :127-135; …/600-T2-report.md :495-522; …/618-seed-scan-reconciliation.md; …/600-T4-probe-logs/600-T4-scan-A-rival-seed-b-seed-d.log; src/core/hollywoodPolicy.ts (whole); src/core/hollywoodTick.ts :1-75, :96-150, :150-269; src/core/promises.ts :28-72, :268-302, :340-419, :578-702; src/core/talentMarket.ts :1205-1304; src/core/operations.ts :1650-1704; src/core/tick.ts :1095-1114; src/core/productionAdmission.ts :85-100, :150-220; src/core/actions.ts :315-340; src/core/types.ts :88-107; src/core/hollywood.ts :85-104; src/core/employment.ts :150-174; tests/bridge-p13b-s8-rivals.test.ts :190-219; tests/p14b1-t4-regressions.test.ts :258-292; tests/p14b4-cast-class-outcomes.test.ts :200-249; tests/p13a-rival-adoption.test.ts :42-69; tests/helpers/p14b2-fixtures.ts :155-232; greps for `chooseIndustryPackage` and `aca408ec-r0[12]-[0-5]` in tests/.

## Evidence limits
Paper only: no vitest/tsc/node. D1 rests on vitest `toEqual` semantics (undefined-valued keys ignored, defined values compared) applied to the design and RED text. D2's "r02-0 idle at a decision week" is NOT VERIFIED — the configuration is demonstrated from 600-T2 :501/:518 and the design's seam predicate; whether it fires within 350 ticks needs the run. bridge-p13b-s8-rivals and p13a-rival-adoption movement: NOT VERIFIED. The RED's transcription equivalence was checked line-by-line against hollywoodPolicy.ts, not executed. Employment order for r01 post-208 on the default seed (r02-0 first) is inferred from settlement order, not observed.